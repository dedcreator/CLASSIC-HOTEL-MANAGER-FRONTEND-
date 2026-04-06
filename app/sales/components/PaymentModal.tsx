// frontend/app/sales/components/PaymentModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { XMarkIcon, BanknotesIcon, CreditCardIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

interface PaymentModalProps {
  total: number;
  guestName: string;
  onClose: () => void;
  onComplete: (data: any) => void;
  isSubmitting: boolean;
}

export default function PaymentModal({ total, guestName, onClose, onComplete, isSubmitting }: PaymentModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card'>('cash');
  const [amountPaid, setAmountPaid] = useState<string>('');

  // Safe total value
  const safeTotal = typeof total === 'number' && !isNaN(total) ? total : 0;

  // Initialize amountPaid when total is available
  useEffect(() => {
    setAmountPaid(safeTotal.toFixed(2));
  }, [safeTotal]);

  const calculateChange = () => {
    const paid = parseFloat(amountPaid) || 0;
    const change = paid - safeTotal;
    return change.toFixed(2);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (paymentMethod === 'cash') {
      const paid = parseFloat(amountPaid) || 0;
      if (paid < safeTotal) {
        alert(`Amount paid (₦${paid.toLocaleString()}) must be at least the total amount (₦${safeTotal.toLocaleString()})`);
        return;
      }
    }

    onComplete({
      paymentMethod,
      amountPaid: paymentMethod === 'cash' ? parseFloat(amountPaid) : safeTotal,
      guestName
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full">
        {/* Header */}
        <div className="p-4 border-b flex justify-between items-center bg-gradient-to-r from-red-600 to-red-500 text-white rounded-t-2xl">
          <h2 className="text-lg font-semibold">Complete Payment</h2>
          <button 
            type="button"
            onClick={onClose} 
            className="p-1 hover:bg-white/20 rounded-full transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Guest Name Display */}
          {guestName && (
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500">Guest</p>
              <p className="font-medium text-gray-900">{guestName}</p>
            </div>
          )}

          {/* Total Amount */}
          <div className="bg-red-50 rounded-lg p-4 border border-red-100">
            <p className="text-sm text-gray-600 mb-1">Total Amount</p>
            <p className="text-3xl font-bold text-red-600">
              ₦{safeTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Method
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('cash')}
                className={`p-3 rounded-lg border-2 flex items-center justify-center gap-2 transition-all ${
                  paymentMethod === 'cash'
                    ? 'border-red-500 bg-red-50 text-red-700'
                    : 'border-gray-200 hover:border-red-300 hover:bg-red-50'
                }`}
              >
                <BanknotesIcon className={`h-5 w-5 ${paymentMethod === 'cash' ? 'text-red-600' : 'text-gray-500'}`} />
                Cash
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`p-3 rounded-lg border-2 flex items-center justify-center gap-2 transition-all ${
                  paymentMethod === 'card'
                    ? 'border-red-500 bg-red-50 text-red-700'
                    : 'border-gray-200 hover:border-red-300 hover:bg-red-50'
                }`}
              >
                <CreditCardIcon className={`h-5 w-5 ${paymentMethod === 'card' ? 'text-red-600' : 'text-gray-500'}`} />
                Card
              </button>
            </div>
          </div>

          {/* Cash Payment */}
          {paymentMethod === 'cash' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount Paid
              </label>
              <input
                type="number"
                step="0.01"
                min={safeTotal}
                value={amountPaid}
                onChange={(e) => setAmountPaid(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="Enter amount paid"
                required
              />
              {amountPaid && parseFloat(amountPaid) >= safeTotal && (
                <div className="mt-2 p-3 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm text-gray-600">Change:</p>
                  <p className="text-xl font-bold text-green-600">₦{parseFloat(calculateChange()).toLocaleString()}</p>
                </div>
              )}
              {amountPaid && parseFloat(amountPaid) < safeTotal && parseFloat(amountPaid) > 0 && (
                <p className="mt-1 text-xs text-red-600">
                  Amount paid is less than total. Please add ₦{(safeTotal - parseFloat(amountPaid)).toLocaleString()} more.
                </p>
              )}
            </div>
          )}

          {/* Card Payment Note */}
          {paymentMethod === 'card' && (
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2">
                <CreditCardIcon className="h-5 w-5 text-blue-600" />
                <p className="text-sm text-blue-800">
                  Please process card payment on the terminal
                </p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircleIcon className="h-5 w-5" />
                  Complete Sale
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}