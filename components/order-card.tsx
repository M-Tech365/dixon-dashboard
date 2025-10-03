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
    <div className="bg-white rounded-xl shadow-lg p-10 hover:shadow-xl transition-shadow h-full">
      <div className="flex justify-between items-start mb-6">
        <div className="flex-1">
          <h3 className="text-3xl font-bold text-gray-900 mb-2">{order.customerName}</h3>
          <p className="text-xl text-gray-600">Order: {order.orderNumber}</p>
          {order.billToName && (
            <p className="text-lg text-gray-600 mt-2">Bill To: {order.billToName}</p>
          )}
          {order.reference && (
            <p className="text-base text-gray-400 mt-2">Ref: {order.reference}</p>
          )}
        </div>
        <PriorityBadge priority={order.priority} />
      </div>

      <div className="space-y-4">
        {order.requestedDeliveryDate && order.requestedDeliveryDate !== '0001-01-01' && (
          <div className="flex justify-between text-lg">
            <span className="text-gray-600 font-medium">Requested Delivery:</span>
            <span className="text-gray-900 font-semibold">{formatDate(order.requestedDeliveryDate)}</span>
          </div>
        )}

        {(order.shipToCity || order.shipToState) && (
          <div className="flex justify-between text-lg">
            <span className="text-gray-600 font-medium">Ship To:</span>
            <span className="text-gray-900 font-semibold">
              {order.shipToCity}{order.shipToCity && order.shipToState && ', '}{order.shipToState}
            </span>
          </div>
        )}
      </div>

      {order.cfiDeliveryNotes && (
        <div className="mt-6 p-5 bg-blue-50 rounded-lg border-2 border-blue-200">
          <p className="text-lg font-bold text-blue-900 mb-2">Delivery Notes:</p>
          <p className="text-lg text-blue-800 leading-relaxed">{order.cfiDeliveryNotes}</p>
        </div>
      )}
    </div>
  );
}