// frontend/app/bookings/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeftIcon,
  CalendarIcon,
  UserIcon,
  HomeIcon,
  PhoneIcon,
  EnvelopeIcon,
  IdentificationIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  PrinterIcon,
  DocumentDuplicateIcon,
} from '@heroicons/react/24/outline';
import { useBooking, useCheckIn, useCheckOut, useCancelBooking } from '@/lib/api/hooks/useBookings';
import Layout from '@/components/layout/Layout';
import toast from 'react-hot-toast';

const statusColors: Record<string, string> = {
  confirmed: 'bg-blue-100 text-blue-800',
  checked_in: 'bg-green-100 text-green-800',
  checked_out: 'bg-gray-100 text-gray-800',
  cancelled: 'bg-red-100 text-red-800',
};

const paymentStatusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  paid: 'bg-green-100 text-green-800',
  partial: 'bg-blue-100 text-blue-800',
  refunded: 'bg-gray-100 text-gray-800',
};

export default function BookingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const bookingId = params.id as string;

  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [copied, setCopied] = useState(false);

  const { data: booking, isLoading, error } = useBooking(bookingId);
  const checkIn = useCheckIn();
  const checkOut = useCheckOut();
  const cancelBooking = useCancelBooking();

  // Log the booking data to see its structure
  useEffect(() => {
    if (booking) {
      console.log('Booking data received:', booking);
      console.log('Guest data:', booking.guest);
      console.log('Room data:', booking.room);
    }
  }, [booking]);

  const handleCopyReference = () => {
    if (booking?.booking_reference) {
      navigator.clipboard.writeText(booking.booking_reference);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success('Booking reference copied');
    }
  };

  const handleCheckIn = async () => {
    if (!booking?.id) return;
    
    if (confirm(`Check in ${booking.guest?.first_name || 'guest'}?`)) {
      try {
        await checkIn.mutateAsync(booking.id);
        toast.success('Guest checked in successfully');
      } catch (error: any) {
        toast.error(error.response?.data?.error || 'Failed to check in');
      }
    }
  };

  const handleCheckOut = async () => {
    if (!booking?.id) return;
    
    if (confirm(`Check out ${booking.guest?.first_name || 'guest'}?`)) {
      try {
        await checkOut.mutateAsync(booking.id);
        toast.success('Guest checked out successfully');
      } catch (error: any) {
        toast.error(error.response?.data?.error || 'Failed to check out');
      }
    }
  };

  const handleCancel = async () => {
    if (!booking?.id) return;
    
    try {
      await cancelBooking.mutateAsync(booking.id);
      setShowCancelConfirm(false);
      toast.success('Booking cancelled');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to cancel booking');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto py-8 px-4">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="bg-white rounded-lg p-6 space-y-4">
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="h-20 bg-gray-200 rounded"></div>
                <div className="h-20 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !booking) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto py-16 text-center px-4">
          <XCircleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-dark-500 mb-2">Booking Not Found</h2>
          <p className="text-gray-600 mb-6">The booking you're looking for doesn't exist.</p>
          <Link href="/bookings" className="inline-flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700">
            <ArrowLeftIcon className="h-4 w-4" />
            Back to Bookings
          </Link>
        </div>
      </Layout>
    );
  }

  // Safely access nested data with fallbacks
  const guestFirstName = booking.guest?.first_name || booking.guest_details?.first_name || 'N/A';
  const guestLastName = booking.guest?.last_name || booking.guest_details?.last_name || '';
  const guestEmail = booking.guest?.email || booking.guest_details?.email || 'N/A';
  const guestPhone = booking.guest?.phone || booking.guest_details?.phone || 'N/A';
  const guestIdNumber = booking.guest?.id_number || booking.guest_details?.id_number || null;
  
  const roomNumber = booking.room?.room_number || booking.room_details?.room_number || 'N/A';
  const roomType = booking.room?.room_type || booking.room_details?.room_type || 'standard';
  const roomCapacity = booking.room?.capacity || booking.room_details?.capacity || 2;

  return (
    <Layout>
      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* Back button */}
        <Link
          href="/bookings"
          className="inline-flex items-center text-gray-600 hover:text-red-600 mb-6"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Back to Bookings
        </Link>

        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <h1 className="text-2xl font-bold text-dark-500">
                  {booking.booking_reference || 'Booking'}
                </h1>
                <button
                  onClick={handleCopyReference}
                  className="p-1 text-gray-400 hover:text-red-600"
                  title="Copy reference"
                >
                  <DocumentDuplicateIcon className="h-5 w-5" />
                </button>
                {copied && <span className="text-xs text-green-600">Copied!</span>}
              </div>
              <div className="flex flex-wrap gap-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[booking.status] || 'bg-gray-100'}`}>
                  {booking.status?.replace('_', ' ') || 'Unknown'}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${paymentStatusColors[booking.payment_status] || 'bg-gray-100'}`}>
                  {booking.payment_status?.replace('_', ' ') || 'Pending'}
                </span>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handlePrint}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center gap-2"
              >
                <PrinterIcon className="h-4 w-4" />
                Print
              </button>
              
              {booking.status === 'confirmed' && (
                <>
                  <button
                    onClick={handleCheckIn}
                    disabled={checkIn.isPending}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    {checkIn.isPending ? 'Processing...' : 'Check In'}
                  </button>
                  <button
                    onClick={() => setShowCancelConfirm(true)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    Cancel
                  </button>
                </>
              )}
              
              {booking.status === 'checked_in' && (
                <button
                  onClick={handleCheckOut}
                  disabled={checkOut.isPending}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {checkOut.isPending ? 'Processing...' : 'Check Out'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Guest Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-dark-500 mb-4 flex items-center gap-2">
            <UserIcon className="h-5 w-5 text-red-600" />
            Guest Information
          </h2>
          
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-600 w-24">Name:</span>
              <span className="text-dark-500">{guestFirstName} {guestLastName}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-600 w-24">Email:</span>
              <span className="text-dark-500">{guestEmail}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-600 w-24">Phone:</span>
              <span className="text-dark-500">{guestPhone}</span>
            </div>
            {guestIdNumber && (
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-600 w-24">ID Number:</span>
                <span className="text-dark-500">{guestIdNumber}</span>
              </div>
            )}
          </div>
        </div>

        {/* Booking Details */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-dark-500 mb-4 flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-red-600" />
            Booking Details
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">Check-in</p>
              <p className="font-medium text-dark-500">
                {booking.check_in ? new Date(booking.check_in).toLocaleDateString() : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Check-out</p>
              <p className="font-medium text-dark-500">
                {booking.check_out ? new Date(booking.check_out).toLocaleDateString() : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Nights</p>
              <p className="font-medium text-dark-500">{booking.total_nights || 0}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Guests</p>
              <p className="font-medium text-dark-500">
                {booking.adults || 0} adults, {booking.children || 0} children
              </p>
            </div>
          </div>
          
          {booking.special_requests && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600 mb-2">Special Requests</p>
              <p className="text-gray-800 bg-gray-50 p-3 rounded-lg">
                {booking.special_requests}
              </p>
            </div>
          )}
        </div>

        {/* Room & Payment */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-dark-500 mb-4 flex items-center gap-2">
            <HomeIcon className="h-5 w-5 text-red-600" />
            Room & Payment
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Room Number:</span>
              <span className="font-semibold text-dark-500">Room {roomNumber}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Room Type:</span>
              <span className="capitalize text-dark-500">
                {roomType === 'standard' ? 'Standard' : 'Duplex'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Capacity:</span>
              <span className="text-dark-500">{roomCapacity} guests</span>
            </div>
            <div className="border-t border-gray-200 pt-4 mt-2">
              <div className="flex items-center justify-between text-lg font-bold">
                <span className="text-dark-500">Total Amount:</span>
                <span className="text-red-600">₦{(booking.total_amount || 0).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Cancel Confirmation Modal */}
        {showCancelConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-lg font-semibold text-dark-500 mb-2">Cancel Booking</h3>
              <p className="text-gray-600 mb-4">
                Are you sure you want to cancel this booking? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowCancelConfirm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  No, Keep It
                </button>
                <button
                  onClick={handleCancel}
                  disabled={cancelBooking.isPending}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  {cancelBooking.isPending ? 'Cancelling...' : 'Yes, Cancel'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}