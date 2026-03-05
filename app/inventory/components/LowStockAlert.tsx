// frontend/app/inventory/components/LowStockAlert.tsx
'use client';

import Link from 'next/link';
import { StockAlert } from '@/lib/api/types';
import { useResolveAlert } from '@/lib/api/hooks/useProducts';
import { CheckCircleIcon } from '@heroicons/react/24/outline';

interface LowStockAlertProps {
  alert: StockAlert;
}

export default function LowStockAlert({ alert }: LowStockAlertProps) {
  const resolveAlert = useResolveAlert();

  const handleResolve = () => {
    resolveAlert.mutate(alert.id);
  };

  return (
    <div className="bg-white border border-red-200 rounded-md p-3 flex items-center justify-between">
      <div>
        <Link 
          href={`/inventory/${alert.product}`}
          className="font-medium text-dark-500 hover:text-red-600"
        >
          {alert.product_name}
        </Link>
        <p className="text-sm text-gray-600">
          Stock: <span className="font-semibold text-red-600">{alert.current_stock}</span> / {alert.threshold} minimum
        </p>
      </div>
      <button
        onClick={handleResolve}
        disabled={resolveAlert.isPending}
        className="text-green-600 hover:text-green-700 p-1"
        title="Mark as resolved"
      >
        <CheckCircleIcon className="h-5 w-5" />
      </button>
    </div>
  );
}