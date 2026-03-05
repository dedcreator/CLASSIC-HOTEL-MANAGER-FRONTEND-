// frontend/app/sales/components/PaymentModal.tsx
'use client';

import { useState } from 'react';
import {
  XMarkIcon,
  CreditCardIcon,
  BanknotesIcon,
  HomeIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

interface PaymentModalProps {
  cart: any[];
  customer: any;
  total: number;
  onClose: () => void;
  onComplete: (data: { method: string; amountPaid?: number; guestName?: string }) => void;
}

export default function PaymentModal({ cart, customer, total, onClose, onComplete }: PaymentModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'room_charge'>('cash');
  const [amountPaid, setAmountPaid] = useState<string>(total.toFixed(2));
  const [guestName, setGuestName] = useState(
    customer ? `${customer.first_name} ${customer.last_name}` : ''
  );
  const [showChange, setShowChange] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (paymentMethod === 'cash') {
      const paid = parseFloat(amountPaid);
      if (paid < total) {
        alert('Amount paid must be at least the total amount');
        return;
      }
      onComplete({ method: paymentMethod, amountPaid: paid, guestName });
    } else {
      onComplete({ method: paymentMethod, guestName });
    }
  };

  const calculateChange = () => {
    const paid = parseFloat(amountPaid) || 0;
    return (paid - total).toFixed(2);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Complete Payment</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Customer Info */}
        {!customer && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Guest Name (optional)
            </label>
            <input
              type="text"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="Enter guest name"
            />
          </div>
        )}

        {/* Total Amount */}
        <div className="mb-6 p-4 bg-red-50 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">Total Amount</p>
          <p className="text-3xl font-bold text-red-600">₦{total.toLocaleString()}</p>
          {customer && (
            <p className="text-xs text-gray-500 mt-1">
              Customer: {customer.first_name} {customer.last_name}
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Payment Method */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Method
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('cash')}
                className={`p-3 rounded-lg border-2 flex flex-col items-center gap-1 transition-all ${
                  paymentMethod === 'cash'
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-200 hover:border-red-300'
                }`}
              >
                <BanknotesIcon className={`h-6 w-6 ${paymentMethod === 'cash' ? 'text-red-600' : 'text-gray-500'}`} />
                <span className={`text-sm ${paymentMethod === 'cash' ? 'font-semibold text-red-600' : 'text-gray-600'}`}>
                  Cash
                </span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`p-3 rounded-lg border-2 flex flex-col items-center gap-1 transition-all ${
                  paymentMethod === 'card'
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-200 hover:border-red-300'
                }`}
              >
                <CreditCardIcon className={`h-6 w-6 ${paymentMethod === 'card' ? 'text-red-600' : 'text-gray-500'}`} />
                <span className={`text-sm ${paymentMethod === 'card' ? 'font-semibold text-red-600' : 'text-gray-600'}`}>
                  Card
                </span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('room_charge')}
                className={`p-3 rounded-lg border-2 flex flex-col items-center gap-1 transition-all ${
                  paymentMethod === 'room_charge'
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-200 hover:border-red-300'
                }`}
              >
                <HomeIcon className={`h-6 w-6 ${paymentMethod === 'room_charge' ? 'text-red-600' : 'text-gray-500'}`} />
                <span className={`text-sm ${paymentMethod === 'room_charge' ? 'font-semibold text-red-600' : 'text-gray-600'}`}>
                  Room
                </span>
              </button>
            </div>
          </div>

          {/* Cash Payment */}
          {paymentMethod === 'cash' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount Paid (₦)
              </label>
              <input
                type="number"
                step="0.01"
                min={total}
                value={amountPaid}
                onChange={(e) => {
                  setAmountPaid(e.target.value);
                  setShowChange(true);
                }}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500"
                required
              />

              {showChange && parseFloat(amountPaid) >= total && (
                <div className="mt-2 p-3 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-600">Change:</p>
                  <p className="text-xl font-bold text-green-600">₦{calculateChange()}</p>
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

          {/* Room Charge Note */}
          {paymentMethod === 'room_charge' && (
            <div className="p-3 bg-purple-50 rounded-lg">
              <p className="text-sm text-purple-800">
                Amount will be charged to the room
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
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center justify-center gap-2"
            >
              <CheckCircleIcon className="h-5 w-5" />
              Complete Sale
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}