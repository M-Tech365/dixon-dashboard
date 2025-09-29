import { SalesOrder } from '@/types/sales-order';
import { PriorityBadge } from './priority-badge';

interface OrderCardProps {
  order: SalesOrder;
}

export function OrderCard({ order }: OrderCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };


  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">{order.customerName}</h3>
          <p className="text-sm text-gray-500">Order: {order.orderNumber}</p>
          {order.billToName && (
            <p className="text-sm text-gray-600 mt-1">Bill To: {order.billToName}</p>
          )}
          {order.reference && (
            <p className="text-xs text-gray-400 mt-1">Ref: {order.reference}</p>
          )}
        </div>
        <PriorityBadge priority={order.priority} />
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Created:</span>
          <span className="text-gray-900">{formatDate(order.createdDate)}</span>
        </div>

        {(order.shipToCity || order.shipToState) && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Ship To:</span>
            <span className="text-gray-900">
              {order.shipToCity}{order.shipToCity && order.shipToState && ', '}{order.shipToState}
            </span>
          </div>
        )}
      </div>

      {order.cfiDeliveryNotes && (
        <div className="mt-4 p-3 bg-gray-50 rounded">
          <p className="text-sm font-medium text-gray-700 mb-1">Delivery Notes:</p>
          <p className="text-sm text-gray-600">{order.cfiDeliveryNotes}</p>
        </div>
      )}
    </div>
  );
}