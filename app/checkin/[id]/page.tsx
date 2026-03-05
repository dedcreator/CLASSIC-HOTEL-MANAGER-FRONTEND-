// frontend/app/checkout/[id]/page.tsx
'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeftIcon,
  UserIcon,
  HomeIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
  PrinterIcon,
  CreditCardIcon,
  BanknotesIcon,
} from '@heroicons/react/24/outline';
import { useBooking, useCheckOut } from '@/lib/api/hooks/useBookings';
import Layout from '@/components/layout/Layout';

export default function CheckOutPage() {
  const params = useParams();
  const router = useRouter();
  const bookingId = params.id as string;

  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'room_charge'>('cash');
  const [amountPaid, setAmountPaid] = useState<string>('');
  const [showReceipt, setShowReceipt] = useState(false);

  const { data: booking, isLoading } = useBooking(bookingId);
  const checkOut = useCheckOut();

  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="bg-white rounded-lg p-6 space-y-4">
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!booking || booking.status !== 'checked_in') {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto py-8 text-center">
          <p className="text-gray-600">Guest is not checked in or booking not found</p>
          <Link href="/bookings" className="btn-primary mt-4">
            Back to Bookings
          </Link>
        </div>
      </Layout>
    );
  }

  const calculateExtras = () => {
    // This would include minibar charges, damages, etc.
    return 0;
  };

  const extras = calculateExtras();
  const totalDue = booking.total_amount + extras;

  const handleCheckOut = async () => {
    try {
      await checkOut.mutateAsync(booking.id);
      setShowReceipt(true);
    } catch (error) {
      console.error('Check-out failed:', error);
    }
  };

  const calculateChange = () => {
    const paid = parseFloat(amountPaid) || 0;
    return (paid - totalDue).toFixed(2);
  };

  if (showReceipt) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            {/* Receipt Header */}
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-dark-500">Your Hotel Name</h1>
              <p className="text-sm text-gray-600">123 Hotel Street, City</p>
              <p className="text-sm text-gray-600">Tel: +234 123 456 7890</p>
            </div>

            {/* Receipt Details */}
            <div className="border-t border-b border-gray-200 py-4 mb-4">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Receipt No:</span>
                <span className="font-medium">{booking.booking_reference}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Date:</span>
                <span className="font-medium">{new Date().toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Time:</span>
                <span className="font-medium">{new Date().toLocaleTimeString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Cashier:</span>
                <span className="font-medium">John Doe</span>
              </div>
            </div>

            {/* Guest Info */}
            <div className="mb-4">
              <p className="font-semibold text-dark-500">
                Guest: {booking.guest.first_name} {booking.guest.last_name}
              </p>
              <p className="text-sm text-gray-600">Room {booking.room.room_number}</p>
            </div>

            {/* Charges */}
            <table className="w-full mb-4">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-2 px-2 text-sm">Description</th>
                  <th className="text-right py-2 px-2 text-sm">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="py-2 px-2">
                    Room Charges ({booking.total_nights} nights)
                  </td>
                  <td className="text-right py-2 px-2 font-medium">
                    ₦{booking.total_amount.toLocaleString()}
                  </td>
                </tr>
                {extras > 0 && (
                  <tr>
                    <td className="py-2 px-2">Extras (Minibar, etc.)</td>
                    <td className="text-right py-2 px-2 font-medium">
                      ₦{extras.toLocaleString()}
                    </td>
                  </tr>
                )}
                <tr className="border-t">
                  <td className="py-2 px-2 font-bold">Total</td>
                  <td className="text-right py-2 px-2 font-bold text-red-600">
                    ₦{totalDue.toLocaleString()}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Payment Info */}
            <div className="mb-6 p-3 bg-green-50 rounded-lg">
              <p className="text-sm text-green-800 text-center">
                Payment completed successfully via {paymentMethod}
              </p>
            </div>

            {/* Thank You */}
            <div className="text-center mb-6">
              <p className="text-gray-700">Thank you for staying with us!</p>
              <p className="text-sm text-gray-500">We hope to see you again soon.</p>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => window.print()}
                className="flex-1 btn-secondary flex items-center justify-center gap-2"
              >
                <PrinterIcon className="h-5 w-5" />
                Print Receipt
              </button>
              <Link
                href="/bookings"
                className="flex-1 btn-primary text-center"
              >
                Done
              </Link>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto pb-20">
        {/* Header */}
        <div className="mb-6">
          <Link
            href={`/bookings/${bookingId}`}
            className="inline-flex items-center text-gray-600 hover:text-red-600 mb-4"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Back to Booking
          </Link>
          <h1 className="text-2xl font-bold text-dark-500">Check-out</h1>
          <p className="text-sm text-gray-600">Complete guest check-out and payment</p>
        </div>

        {/* Guest Info Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">Guest</p>
              <p className="font-medium text-dark-500">
                {booking.guest.first_name} {booking.guest.last_name}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Room</p>
              <p className="font-medium text-dark-500">Room {booking.room.room_number}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Check-in</p>
              <p className="font-medium text-dark-500">
                {new Date(booking.check_in).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Check-out</p>
              <p className="font-medium text-dark-500">
                {new Date().toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Charges Breakdown */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-dark-500 mb-4">Charges Breakdown</h2>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Room Charges ({booking.total_nights} nights)</span>
              <span className="font-medium">₦{booking.total_amount.toLocaleString()}</span>
            </div>
            
            {/* Add minibar items here if any */}
            
            <div className="flex justify-between pt-3 border-t">
              <span className="font-semibold text-dark-500">Total Due</span>
              <span className="text-2xl font-bold text-red-600">₦{totalDue.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Payment Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-dark-500 mb-4">Payment</h2>

          <div className="space-y-4">
            {/* Payment Method */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Method
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setPaymentMethod('cash')}
                  className={`
                    p-3 rounded-lg border-2 flex flex-col items-center gap-1
                    ${paymentMethod === 'cash' 
                      ? 'border-red-500 bg-red-50' 
                      : 'border-gray-200 hover:border-red-300'
                    }
                  `}
                >
                  <BanknotesIcon className={`h-6 w-6 ${paymentMethod === 'cash' ? 'text-red-600' : 'text-gray-500'}`} />
                  <span className={`text-sm ${paymentMethod === 'cash' ? 'font-semibold text-red-600' : 'text-gray-600'}`}>
                    Cash
                  </span>
                </button>

                <button
                  onClick={() => setPaymentMethod('card')}
                  className={`
                    p-3 rounded-lg border-2 flex flex-col items-center gap-1
                    ${paymentMethod === 'card' 
                      ? 'border-red-500 bg-red-50' 
                      : 'border-gray-200 hover:border-red-300'
                    }
                  `}
                >
                  <CreditCardIcon className={`h-6 w-6 ${paymentMethod === 'card' ? 'text-red-600' : 'text-gray-500'}`} />
                  <span className={`text-sm ${paymentMethod === 'card' ? 'font-semibold text-red-600' : 'text-gray-600'}`}>
                    Card
                  </span>
                </button>

                <button
                  onClick={() => setPaymentMethod('room_charge')}
                  className={`
                    p-3 rounded-lg border-2 flex flex-col items-center gap-1
                    ${paymentMethod === 'room_charge' 
                      ? 'border-red-500 bg-red-50' 
                      : 'border-gray-200 hover:border-red-300'
                    }
                  `}
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
                  Amount Paid
                </label>
                <input
                  type="number"
                  step="0.01"
                  min={totalDue}
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(e.target.value)}
                  className="input-field"
                  placeholder="Enter amount paid"
                />
                {amountPaid && parseFloat(amountPaid) >= totalDue && (
                  <div className="mt-2 p-3 bg-green-50 rounded-lg">
                    <p className="text-sm text-gray-600">Change:</p>
                    <p className="text-xl font-bold text-green-600">₦{calculateChange()}</p>
                  </div>
                )}
              </div>
            )}

            {/* Card Payment Note */}
            {paymentMethod === 'card' && (
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  Please process card payment on the terminal
                </p>
              </div>
            )}

            {/* Room Charge Note */}
            {paymentMethod === 'room_charge' && (
              <div className="p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-purple-800">
                  Amount will be charged to the room
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Link
                href={`/bookings/${bookingId}`}
                className="flex-1 btn-secondary text-center"
              >
                Cancel
              </Link>
              <button
                onClick={handleCheckOut}
                disabled={
                  checkOut.isPending || 
                  (paymentMethod === 'cash' && (!amountPaid || parseFloat(amountPaid) < totalDue))
                }
                className="flex-1 btn-primary"
              >
                {checkOut.isPending ? 'Processing...' : 'Complete Check-out'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}