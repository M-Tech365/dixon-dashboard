import { BCSalesOrder, SalesOrder } from '@/types/sales-order';
import { ClientCertificateCredential } from '@azure/identity';
import { join } from 'path';

interface TokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

let cachedToken: { token: string; expiresAt: number } | null = null;

export async function getAccessToken(): Promise<string> {
  // Check if we have a valid cached token
  if (cachedToken && Date.now() < cachedToken.expiresAt) {
    console.log('Using cached token');
    return cachedToken.token;
  }

  const tenantId = process.env.BC_TENANT_ID;
  const clientId = process.env.BC_CLIENT_ID;
  const useCertAuth = process.env.BC_USE_CERT_AUTH === 'true';
  const scope = process.env.BC_SCOPE || 'https://api.businesscentral.dynamics.com/.default';

  console.log('Getting new access token...');
  console.log('Tenant ID:', tenantId);
  console.log('Client ID:', clientId);
  console.log('Auth method:', useCertAuth ? 'Certificate' : 'Client Secret');
  console.log('Scope:', scope);

  if (!tenantId || !clientId) {
    throw new Error('Business Central tenant ID and client ID not configured');
  }

  let accessToken: string;

  if (useCertAuth) {
    // Certificate-based authentication
    let certPath: string;

    // In production (Vercel), use environment variable
    // In development, use local file
    if (process.env.BC_CERTIFICATE) {
      console.log('Using certificate from environment variable');
      // Write cert from env var to temp file
      const fs = require('fs');
      const os = require('os');
      certPath = join(os.tmpdir(), 'bc-cert.pem');
      fs.writeFileSync(certPath, process.env.BC_CERTIFICATE);
    } else {
      certPath = join(process.cwd(), 'bc-combined.pem');
      console.log('Using certificate from:', certPath);
    }

    const credential = new ClientCertificateCredential(
      tenantId,
      clientId,
      certPath
    );

    const tokenResponse = await credential.getToken(scope);

    if (!tokenResponse) {
      throw new Error('Failed to get access token using certificate');
    }

    accessToken = tokenResponse.token;

    console.log('Certificate authentication successful');
    console.log('Token expires at:', new Date(tokenResponse.expiresOnTimestamp));
    console.log('Token preview:', accessToken.substring(0, 50) + '...');

    // Cache the token with a buffer of 5 minutes before expiry
    cachedToken = {
      token: accessToken,
      expiresAt: tokenResponse.expiresOnTimestamp - 300000 // 5 min buffer
    };
  } else {
    // Client secret authentication (fallback)
    const clientSecret = process.env.BC_CLIENT_SECRET;

    if (!clientSecret) {
      throw new Error('Business Central client secret not configured');
    }

    const tokenUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;

    const params = new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret,
      scope: scope
    });

    console.log('Token URL:', tokenUrl);

    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params.toString()
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Token error response:', errorText);
      console.error('Response status:', response.status, response.statusText);
      throw new Error(`Failed to get access token: ${response.statusText}`);
    }

    const data: TokenResponse = await response.json();

    console.log('Token obtained successfully');
    console.log('Token expires in:', data.expires_in, 'seconds');
    console.log('Token preview:', data.access_token.substring(0, 50) + '...');

    accessToken = data.access_token;

    // Cache the token with a buffer of 5 minutes before expiry
    cachedToken = {
      token: data.access_token,
      expiresAt: Date.now() + (data.expires_in - 300) * 1000
    };
  }

  // Decode token to inspect claims (for debugging)
  try {
    const tokenParts = accessToken.split('.');
    const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
    console.log('Token roles:', payload.roles);
    console.log('Token aud:', payload.aud);
    console.log('Token appid:', payload.appid);
  } catch (e) {
    console.error('Could not decode token:', e);
  }

  return accessToken;
}

export function transformBCOrder(bcOrder: BCSalesOrder): SalesOrder | null {
  // Map Priority field (assuming format like "1", "2", "3", "4")
  const priorityMap: { [key: string]: 'P1' | 'P2' | 'P3' | 'P4' } = {
    '1': 'P1',
    '2': 'P2',
    '3': 'P3',
    '4': 'P4'
  };

  const priority = priorityMap[bcOrder.Priority];

  // Return null if priority is blank/invalid - will be filtered out
  if (!priority) {
    return null;
  }

  return {
    id: bcOrder.SystemId,
    customerName: bcOrder.SellToCustomerName,
    billToName: bcOrder.BillToName || '',
    orderNumber: bcOrder.No,
    priority: priority,
    createdDate: bcOrder.OrderDate || bcOrder.DocumentDate,
    requestedDeliveryDate: bcOrder.RequestedDeliveryDate,
    cfiDeliveryNotes: bcOrder.CFIDeliveryNotes || '',
    reference: bcOrder.YourReference,
    shipToCity: bcOrder.ShipToCity,
    shipToState: bcOrder.ShipToCounty
  };
}

export async function fetchSalesOrders(): Promise<SalesOrder[]> {
  const accessToken = await getAccessToken();

  const baseUrl = process.env.BC_BASE_URL || process.env.BC_API_BASE_URL || 'https://api.businesscentral.dynamics.com/v2.0';
  const tenantId = process.env.BC_TENANT_ID;
  const environment = process.env.BC_ENVIRONMENT || 'BC_Sandbox';
  const companyId = process.env.BC_COMPANY_ID || 'CFI Tire';

  // URL encode the company name
  const companyName = encodeURIComponent(companyId);

  // Try standard API first, then fall back to custom OData
  const useStandardApi = process.env.BC_USE_STANDARD_API === 'true';

  const apiUrl = useStandardApi
    ? `${baseUrl}/${tenantId}/${environment}/api/v2.0/companies(${companyName})/salesOrders`
    : `${baseUrl}/${tenantId}/${environment}/ODataV4/Company('${companyName}')/Sales_Order_VT`;

  console.log('Fetching from:', apiUrl);
  console.log('Using token preview:', accessToken.substring(0, 50) + '...');

  const headers = {
    'Authorization': `Bearer ${accessToken}`,
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  };

  console.log('Request headers:', JSON.stringify(headers, null, 2));

  const response = await fetch(apiUrl, {
    method: 'GET',
    headers,
    cache: 'no-store'
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('API error response:', errorText);
    console.error('Response status:', response.status, response.statusText);
    console.error('Response headers:', JSON.stringify(Object.fromEntries(response.headers.entries())));
    throw new Error(`Failed to fetch sales orders: ${response.statusText}`);
  }

  // Get raw text first to inspect
  const rawText = await response.text();

  // Look for SO0400487 in raw response
  const so487Match = rawText.match(/"No":"SO0400487".*?"Priority":"([^"]*?)"/);
  if (so487Match) {
    console.log('SO0400487 in RAW response - Priority:', JSON.stringify(so487Match[1]), 'Length:', so487Match[1].length);
  }

  const data = JSON.parse(rawText);
  const bcOrders: BCSalesOrder[] = data.value || [];

  console.log(`Received ${bcOrders.length} orders from Business Central`);

  // Find SO0400487 specifically
  const so487 = bcOrders.find(o => o.No === 'SO0400487');
  if (so487) {
    console.log('SO0400487 after parsing - Priority:', JSON.stringify(so487.Priority), 'Length:', so487.Priority?.length);
  } else {
    console.log('SO0400487 NOT FOUND in BC response');
  }

  console.log('Sample of orders with priorities:', JSON.stringify(bcOrders.filter(o => o.Priority && o.Priority.trim()).map(o => ({
    No: o.No,
    Priority: o.Priority
  })), null, 2));

  // Transform BC orders to our format and filter
  const priorityOrder = { 'P2': 1, 'P3': 2, 'P4': 3, 'P1': 4 };

  const transformed = bcOrders.map(transformBCOrder);
  const withPriority = transformed.filter((order): order is SalesOrder => order !== null);

  // Filter for DIXON location client-side (moved from OData query to avoid BC view issues)
  const dixonOrders = withPriority.filter(order => {
    const bcOrder = bcOrders.find(o => o.SystemId === order.id);
    return bcOrder?.LocationCode === 'DIXON';
  });

  const withoutP1 = dixonOrders.filter(order => order.priority !== 'P1');

  console.log(`After transformation: ${transformed.length} total, ${withPriority.length} with valid priority, ${dixonOrders.length} DIXON orders, ${withoutP1.length} after filtering P1`);

  const orders = withoutP1.sort((a, b) => {
    // Sort by priority first (P2, P3, P4)
    const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
    if (priorityDiff !== 0) return priorityDiff;

    // Then by creation date (oldest first within each priority)
    return new Date(a.createdDate).getTime() - new Date(b.createdDate).getTime();
  });

  return orders;
}