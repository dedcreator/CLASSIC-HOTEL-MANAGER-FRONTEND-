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

  // Initialize amountPaid when total is available
  useEffect(() => {
    if (typeof total === 'number' && !isNaN(total)) {
      setAmountPaid(total.toFixed(2));
    } else {
      setAmountPaid('0.00');
    }
  }, [total]);

  const calculateChange = () => {
    const paid = parseFloat(amountPaid) || 0;
    const totalNum = typeof total === 'number' ? total : 0;
    return (paid - totalNum).toFixed(2);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const totalNum = typeof total === 'number' ? total : 0;
    
    if (paymentMethod === 'cash' && (!amountPaid || parseFloat(amountPaid) < totalNum)) {
      alert('Amount paid must be at least the total amount');
      return;
    }

    onComplete({
      paymentMethod,
      amountPaid: paymentMethod === 'cash' ? parseFloat(amountPaid) : totalNum,
      guestName
    });
  };

  // Safe total display
  const displayTotal = typeof total === 'number' && !isNaN(total) ? total : 0;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full">
        {/* Header */}
        <div className="p-4 border-b flex justify-between items-center bg-gradient-to-r from-red-600 to-red-500 text-white rounded-t-2xl">
          <h2 className="text-lg font-semibold">Complete Payment</h2>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Guest Name Display */}
          {guestName && (
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500">Guest</p>
              <p className="font-medium">{guestName}</p>
            </div>
          )}

          {/* Total Amount */}
          <div className="bg-red-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Total Amount</p>
            <p className="text-3xl font-bold text-red-600">₦{displayTotal.toLocaleString()}</p>
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
                className={`p-3 rounded-lg border-2 flex items-center justify-center gap-2 ${
                  paymentMethod === 'cash'
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-200 hover:border-red-300'
                }`}
              >
                <BanknotesIcon className={`h-5 w-5 ${paymentMethod === 'cash' ? 'text-red-600' : 'text-gray-500'}`} />
                Cash
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`p-3 rounded-lg border-2 flex items-center justify-center gap-2 ${
                  paymentMethod === 'card'
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-200 hover:border-red-300'
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
                min={displayTotal}
                value={amountPaid}
                onChange={(e) => setAmountPaid(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                required
              />
              {amountPaid && parseFloat(amountPaid) >= displayTotal && (
                <div className="mt-2 p-2 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-600">Change:</p>
                  <p className="text-lg font-bold text-green-600">₦{calculateChange()}</p>
                </div>
              )}
            </div>
          )}

          {/* Card Payment Note */}
          {paymentMethod === 'card' && (
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                Please process card payment on the terminal
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
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