'use client';

import { useState, useEffect, useCallback } from 'react';
import { SalesOrder } from '@/types/sales-order';
import { DashboardHeader } from '@/components/dashboard-header';
import { PriorityFilter } from '@/components/priority-filter';
import { OrderCard } from '@/components/order-card';

export default function DashboardPage() {
  const [orders, setOrders] = useState<SalesOrder[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<SalesOrder[]>([]);
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>(['P2', 'P3', 'P4']);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchOrders = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const response = await fetch('/api/sales-orders');
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
        setLastRefresh(new Date());
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  // Initialize lastRefresh on client side and fetch initial data
  useEffect(() => {
    setLastRefresh(new Date());
    fetchOrders();
  }, [fetchOrders]);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const refreshInterval = parseInt(process.env.NEXT_PUBLIC_REFRESH_INTERVAL || '300000');
    const interval = setInterval(fetchOrders, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  // Filter orders based on selected priorities
  useEffect(() => {
    const filtered = orders.filter(order =>
      selectedPriorities.includes(order.priority)
    );
    setFilteredOrders(filtered);
  }, [orders, selectedPriorities]);

  return (
    <div className="min-h-screen bg-gray-100">
      {lastRefresh && <DashboardHeader lastRefresh={lastRefresh} isRefreshing={isRefreshing} />}

      <div className="w-full px-6 py-6">
        <div className="mb-6 bg-white p-6 rounded-lg shadow">
          <PriorityFilter
            selectedPriorities={selectedPriorities}
            onPriorityChange={setSelectedPriorities}
            onRefresh={fetchOrders}
            isRefreshing={isRefreshing}
          />
        </div>

        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500 text-lg">
              {isRefreshing ? 'Loading orders...' : 'No orders found with selected priorities'}
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
            {filteredOrders.map(order => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}