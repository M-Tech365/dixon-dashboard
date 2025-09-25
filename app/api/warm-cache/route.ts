import { NextResponse } from 'next/server';
import { fetchSalesOrders } from '@/lib/business-central';

// This endpoint is called by Vercel cron to keep the API warm
// and pre-fetch data so the dashboard loads instantly
export async function GET() {
  try {
    const isConfigured = process.env.BC_TENANT_ID &&
                         process.env.BC_CLIENT_ID &&
                         process.env.BC_CLIENT_SECRET;

    if (isConfigured) {
      await fetchSalesOrders();
      return NextResponse.json({
        success: true,
        message: 'Cache warmed',
        timestamp: new Date().toISOString()
      });
    }

    return NextResponse.json({
      success: true,
      message: 'BC not configured, skipping cache warm'
    });
  } catch (error) {
    console.error('Cache warm error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to warm cache'
    });
  }
}