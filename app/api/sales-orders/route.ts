import { NextResponse } from 'next/server';
import { fetchSalesOrders } from '@/lib/business-central';
import { SalesOrder } from '@/types/sales-order';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Mock data for development/fallback
const mockOrders: SalesOrder[] = [
  {
    id: '1',
    customerName: 'ABC Manufacturing',
    billToName: 'UAT TESTING 1',
    orderNumber: 'SO-2024-001',
    priority: 'P2',
    createdDate: '2024-01-15',
    cfiDeliveryNotes: 'Customer needs by end of week for production line',
    shipToCity: 'Des Moines',
    shipToState: 'IA'
  },
  {
    id: '2',
    customerName: 'XYZ Corp',
    billToName: 'UAT TESTING 2',
    orderNumber: 'SO-2024-002',
    priority: 'P3',
    createdDate: '2024-01-16',
    cfiDeliveryNotes: 'Regular maintenance - flexible timeline',
    shipToCity: 'Ankeny',
    shipToState: 'IA'
  },
  {
    id: '3',
    customerName: 'Tech Solutions Inc',
    billToName: 'UAT TESTING 3',
    orderNumber: 'SO-2024-003',
    priority: 'P2',
    createdDate: '2024-01-17',
    cfiDeliveryNotes: 'Critical repair needed ASAP',
    shipToCity: 'Waukee',
    shipToState: 'IA'
  },
  {
    id: '4',
    customerName: 'Global Industries',
    billToName: 'UAT TESTING 4',
    orderNumber: 'SO-2024-004',
    priority: 'P4',
    createdDate: '2024-01-18',
    cfiDeliveryNotes: 'Scheduled maintenance for next month',
    shipToCity: 'West Des Moines',
    shipToState: 'IA'
  }
];

export async function GET(request: Request) {
  try {
    // Check if Business Central is configured
    const isConfigured = process.env.BC_TENANT_ID &&
                         process.env.BC_CLIENT_ID &&
                         process.env.BC_CLIENT_SECRET;

    if (isConfigured) {
      try {
        const orders = await fetchSalesOrders();
        return NextResponse.json(orders);
      } catch (bcError) {
        console.error('Business Central API error, falling back to mock data:', bcError);
        // Fall back to mock data if BC API fails
        return NextResponse.json(mockOrders);
      }
    } else {
      // Use mock data if BC is not configured
      console.log('Business Central not configured, using mock data');
      return NextResponse.json(mockOrders);
    }
  } catch (error) {
    console.error('Error in sales orders API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sales orders' },
      { status: 500 }
    );
  }
}