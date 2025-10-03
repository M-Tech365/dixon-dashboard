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
    <div className="bg-white rounded-2xl shadow-xl p-[2vw] hover:shadow-2xl transition-shadow h-full border-2 border-gray-200">
      <div className="flex justify-between items-start mb-[2vh]">
        <div className="flex-1">
          <h3 className="text-[2.5vw] font-bold text-gray-900 mb-[1vh] leading-tight">{order.customerName}</h3>
          <p className="text-[1.5vw] text-gray-600 font-semibold">Order: {order.orderNumber}</p>
          {order.billToName && (
            <p className="text-[1.2vw] text-gray-600 mt-[0.5vh]">Bill To: {order.billToName}</p>
          )}
          {order.reference && (
            <p className="text-[1vw] text-gray-400 mt-[0.5vh]">Ref: {order.reference}</p>
          )}
        </div>
        <PriorityBadge priority={order.priority} />
      </div>

      <div className="space-y-[1.5vh]">
        {order.requestedDeliveryDate && order.requestedDeliveryDate !== '0001-01-01' && (
          <div className="flex justify-between text-[1.3vw]">
            <span className="text-gray-600 font-medium">Requested Delivery:</span>
            <span className="text-gray-900 font-bold">{formatDate(order.requestedDeliveryDate)}</span>
          </div>
        )}

        {(order.shipToCity || order.shipToState) && (
          <div className="flex justify-between text-[1.3vw]">
            <span className="text-gray-600 font-medium">Ship To:</span>
            <span className="text-gray-900 font-bold">
              {order.shipToCity}{order.shipToCity && order.shipToState && ', '}{order.shipToState}
            </span>
          </div>
        )}
      </div>

      {order.cfiDeliveryNotes && (
        <div className="mt-[2vh] p-[1.5vw] bg-blue-50 rounded-xl border-4 border-blue-300">
          <p className="text-[1.3vw] font-bold text-blue-900 mb-[1vh]">Delivery Notes:</p>
          <p className="text-[1.3vw] text-blue-800 leading-relaxed">{order.cfiDeliveryNotes}</p>
        </div>
      )}
    </div>
  );
}