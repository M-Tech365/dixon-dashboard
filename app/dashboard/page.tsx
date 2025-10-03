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

      <div className="w-full px-[2vw] py-[2vh]">
        <div className="mb-[2vh] bg-white p-[2vw] rounded-2xl shadow-xl">
          <PriorityFilter
            selectedPriorities={selectedPriorities}
            onPriorityChange={setSelectedPriorities}
            onRefresh={fetchOrders}
            isRefreshing={isRefreshing}
          />
        </div>

        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-[4vw] text-center">
            <p className="text-gray-500 text-[2.5vw] font-semibold">
              {isRefreshing ? 'Loading orders...' : 'No orders found with selected priorities'}
            </p>
          </div>
        ) : (
          <div className="grid gap-[2vw] lg:grid-cols-2 xl:grid-cols-3">
            {filteredOrders.map(order => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}