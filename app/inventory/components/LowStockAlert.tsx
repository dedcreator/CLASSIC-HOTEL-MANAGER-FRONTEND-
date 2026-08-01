// frontend/app/inventory/components/LowStockAlert.tsx
'use client';

import Link from 'next/link';
import { StockAlert } from '@/lib/api/types';
import { useResolveAlert } from '@/lib/api/hooks/useProducts';
import { CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface LowStockAlertProps {
  alert: StockAlert;
}

export default function LowStockAlert({ alert }: LowStockAlertProps) {
  const resolveAlert = useResolveAlert();

  const handleResolve = () => {
    resolveAlert.mutate(alert.id);
  };

  // Calculate urgency level
  const urgencyLevel = alert.current_stock / alert.threshold;
  const isUrgent = urgencyLevel < 0.3;
  const isWarning = urgencyLevel < 0.5;

  return (
    <div className={`bg-white border rounded-lg p-3 flex items-center justify-between transition-all hover:shadow-sm ${
      isUrgent ? 'border-[#EF4444]' : isWarning ? 'border-[#F59E0B]' : 'border-[#DDD5C4]'
    }`}>
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={`p-1.5 rounded-lg flex-shrink-0 ${
          isUrgent ? 'bg-[#FEF2F2] text-[#EF4444]' : 
          isWarning ? 'bg-[#FFFBEB] text-[#F59E0B]' : 
          'bg-[#F7F1E4] text-[#8A8377]'
        }`}>
          <ExclamationTriangleIcon className="h-4 w-4" />
        </div>
        
        {/* Content */}
        <div>
          <Link 
            href={`/inventory/${alert.product}`}
            className="font-body font-medium text-[#2A2622] hover:text-[#16302B] transition-colors"
          >
            {alert.product_name}
          </Link>
          <div className="flex items-center gap-2 mt-0.5">
            <p className="font-body text-sm text-[#5B564B]">
              Stock: <span className={`font-semibold ${
                isUrgent ? 'text-[#EF4444]' : 
                isWarning ? 'text-[#F59E0B]' : 
                'text-[#8A8377]'
              }`}>{alert.current_stock}</span>
              <span className="text-[#8A8377]"> / {alert.threshold} minimum</span>
            </p>
            {isUrgent && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[#FEF2F2] text-[#EF4444]">
                Urgent
              </span>
            )}
            {isWarning && !isUrgent && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[#FFFBEB] text-[#F59E0B]">
                Low
              </span>
            )}
          </div>
          {/* Progress bar */}
          <div className="w-32 h-1 bg-[#F7F1E4] rounded-full mt-1.5">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                isUrgent ? 'bg-[#EF4444]' : 
                isWarning ? 'bg-[#F59E0B]' : 
                'bg-[#10B981]'
              }`}
              style={{ width: `${Math.min((alert.current_stock / alert.threshold) * 100, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Resolve button */}
      <button
        onClick={handleResolve}
        disabled={resolveAlert.isPending}
        className={`p-1.5 rounded-lg transition-all ${
          resolveAlert.isPending 
            ? 'text-[#8A8377] cursor-not-allowed' 
            : 'text-[#8A8377] hover:text-[#10B981] hover:bg-[#D1FAE5]'
        }`}
        title="Mark as resolved"
      >
        <CheckCircleIcon className={`h-5 w-5 ${
          resolveAlert.isPending ? 'animate-pulse' : ''
        }`} />
      </button>
    </div>
  );
}