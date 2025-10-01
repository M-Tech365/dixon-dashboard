import { BCSalesOrder, SalesOrder } from '@/types/sales-order';

interface TokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

let cachedToken: { token: string; expiresAt: number } | null = null;

export async function getAccessToken(): Promise<string> {
  // Check if we have a valid cached token
  if (cachedToken && Date.now() < cachedToken.expiresAt) {
    return cachedToken.token;
  }

  const tenantId = process.env.BC_TENANT_ID;
  const clientId = process.env.BC_CLIENT_ID;
  const clientSecret = process.env.BC_CLIENT_SECRET;
  const scope = process.env.BC_SCOPE || 'https://api.businesscentral.dynamics.com/.default';

  if (!tenantId || !clientId || !clientSecret) {
    throw new Error('Business Central credentials not configured');
  }

  const tokenUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;

  const params = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: clientId,
    client_secret: clientSecret,
    scope: scope
  });

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
    throw new Error(`Failed to get access token: ${response.statusText}`);
  }

  const data: TokenResponse = await response.json();

  // Cache the token with a buffer of 5 minutes before expiry
  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + (data.expires_in - 300) * 1000
  };

  return data.access_token;
}

export function transformBCOrder(bcOrder: BCSalesOrder): SalesOrder {
  // Map Priority field (assuming format like "1", "2", "3", "4")
  const priorityMap: { [key: string]: 'P1' | 'P2' | 'P3' | 'P4' } = {
    '1': 'P1',
    '2': 'P2',
    '3': 'P3',
    '4': 'P4'
  };

  return {
    id: bcOrder.SystemId,
    customerName: bcOrder.SellToCustomerName,
    billToName: bcOrder.BillToName || '',
    orderNumber: bcOrder.No,
    priority: priorityMap[bcOrder.Priority] || 'P3',
    createdDate: bcOrder.OrderDate || bcOrder.DocumentDate,
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

  const apiUrl = `${baseUrl}/${tenantId}/${environment}/ODataV4/Company('${companyName}')/Sales_Order_VT?$filter=LocationCode eq 'DIXON'`;

  console.log('Fetching from:', apiUrl);

  const response = await fetch(apiUrl, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Accept': 'application/json'
    }
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('API error response:', errorText);
    throw new Error(`Failed to fetch sales orders: ${response.statusText}`);
  }

  const data = await response.json();
  const bcOrders: BCSalesOrder[] = data.value || [];

  // Transform BC orders to our format and filter
  const priorityOrder = { 'P2': 1, 'P3': 2, 'P4': 3, 'P1': 4 };

  const orders = bcOrders
    .map(transformBCOrder)
    .filter(order => order.priority !== 'P1') // Filter out P1 orders
    .sort((a, b) => {
      // Sort by priority first (P2, P3, P4)
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (priorityDiff !== 0) return priorityDiff;

      // Then by creation date (oldest first within each priority)
      return new Date(a.createdDate).getTime() - new Date(b.createdDate).getTime();
    });

  return orders;
}