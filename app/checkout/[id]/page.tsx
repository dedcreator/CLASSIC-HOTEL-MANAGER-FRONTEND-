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
  PrinterIcon,
} from '@heroicons/react/24/outline';
import { useBooking, useCheckOut } from '@/lib/api/hooks/useBookings';
import Layout from '@/components/layout/Layout';
import toast from 'react-hot-toast';

export default function CheckOutPage() {
  const params = useParams();
  const router = useRouter();
  const bookingId = params.id as string;

  const [showReceipt, setShowReceipt] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const { data: booking, isLoading } = useBooking(bookingId);
  const checkOut = useCheckOut();

  const handleCheckOut = async () => {
    if (!booking) return;

    setIsProcessing(true);
    
    try {
      await checkOut.mutateAsync(booking.id);
      setShowReceipt(true);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to check out');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto py-8 px-4">Loading...</div>
      </Layout>
    );
  }

  if (!booking || booking.status !== 'checked_in') {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto py-16 text-center">
          <h2 className="text-2xl font-bold mb-2">Cannot Check Out</h2>
          <p className="text-gray-600 mb-6">This booking is not currently checked in.</p>
          <Link href="/bookings" className="bg-red-600 text-white px-6 py-3 rounded-lg">
            Back to Bookings
          </Link>
        </div>
      </Layout>
    );
  }

  const guestName = booking.guest?.first_name || booking.guest_details?.first_name || 'Guest';
  const guestLastName = booking.guest?.last_name || booking.guest_details?.last_name || '';
  const roomNumber = booking.room?.room_number || booking.room_details?.room_number || 'N/A';

  if (showReceipt) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto py-8 px-4">
          <div className="bg-white rounded-lg border p-8">
            <h1 className="text-2xl font-bold text-center mb-6">CHECK-OUT RECEIPT</h1>
            
            <div className="border-t border-b py-4 mb-4">
              <div className="flex justify-between mb-2">
                <span>Booking Ref:</span>
                <span className="font-mono">{booking.booking_reference}</span>
              </div>
              <div className="flex justify-between">
                <span>Date:</span>
                <span>{new Date().toLocaleDateString()}</span>
              </div>
            </div>

            <div className="mb-4">
              <p><span className="font-medium">Guest:</span> {guestName} {guestLastName}</p>
              <p><span className="font-medium">Room:</span> {roomNumber}</p>
              <p><span className="font-medium">Check-in:</span> {new Date(booking.check_in).toLocaleDateString()}</p>
              <p><span className="font-medium">Check-out:</span> {new Date().toLocaleDateString()}</p>
              <p><span className="font-medium">Nights:</span> {booking.total_nights}</p>
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between text-lg font-bold">
                <span>Total Paid:</span>
                <span className="text-red-600">₦{booking.total_amount?.toLocaleString()}</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">Payment method: {booking.payment_method}</p>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => window.print()}
                className="flex-1 px-4 py-2 border rounded-lg flex items-center justify-center gap-2"
              >
                <PrinterIcon className="h-5 w-5" /> Print
              </button>
              <Link
                href="/bookings"
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg text-center"
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
      <div className="max-w-4xl mx-auto py-8 px-4">
        <Link href={`/bookings/${bookingId}`} className="inline-flex items-center text-gray-600 hover:text-red-600 mb-6">
          <ArrowLeftIcon className="h-4 w-4 mr-2" /> Back
        </Link>

        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-xl font-bold mb-4">Check-out</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm text-gray-600">Guest</p>
              <p className="font-medium">{guestName} {guestLastName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Room</p>
              <p className="font-medium">{roomNumber}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Check-in</p>
              <p>{new Date(booking.check_in).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Check-out</p>
              <p>{new Date().toLocaleDateString()}</p>
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="flex justify-between mb-2">
              <span>Room charges ({booking.total_nights} nights)</span>
              <span>₦{booking.total_amount?.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-lg font-bold pt-2 border-t">
              <span>Total</span>
              <span className="text-red-600">₦{booking.total_amount?.toLocaleString()}</span>
            </div>
            <p className="text-sm text-gray-500 mt-1">Paid via {booking.payment_method}</p>
          </div>

          <div className="flex gap-3 mt-6">
            <Link href={`/bookings/${bookingId}`} className="flex-1 px-4 py-2 border rounded-lg text-center">
              Cancel
            </Link>
            <button
              onClick={handleCheckOut}
              disabled={isProcessing}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg disabled:opacity-50"
            >
              {isProcessing ? 'Processing...' : 'Complete Check-out'}
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}