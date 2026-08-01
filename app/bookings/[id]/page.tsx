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
  confirmed: 'bg-[#DBEAFE] text-[#1E40AF]',
  checked_in: 'bg-[#D1FAE5] text-[#065F46]',
  checked_out: 'bg-[#F7F1E4] text-[#8A8377]',
  cancelled: 'bg-[#FEF2F2] text-[#991B1B]',
};

const paymentStatusColors: Record<string, string> = {
  pending: 'bg-[#FEF3C7] text-[#92400E]',
  paid: 'bg-[#D1FAE5] text-[#065F46]',
  partial: 'bg-[#DBEAFE] text-[#1E40AF]',
  refunded: 'bg-[#F7F1E4] text-[#8A8377]',
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

  useEffect(() => {
    if (booking) {
      console.log('Booking data received:', booking);
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
    const id = booking?.id;
    
    if (!id) {
      toast.error('Booking ID not found');
      return;
    }
    
    if (confirm(`Check in ${booking.guest?.first_name || 'guest'}?`)) {
      try {
        await checkIn.mutateAsync({
          id: id,
          paymentData: { 
            payment_method: 'cash'
          }
        });
        toast.success('Guest checked in successfully');
      } catch (error: any) {
        toast.error(error.response?.data?.error || 'Failed to check in');
      }
    }
  };

  const handleCheckOut = async () => {
    const id = booking?.id;
    
    if (!id) {
      toast.error('Booking ID not found');
      return;
    }
    
    if (confirm(`Check out ${booking.guest?.first_name || 'guest'}?`)) {
      try {
        await checkOut.mutateAsync(id);
        toast.success('Guest checked out successfully');
      } catch (error: any) {
        toast.error(error.response?.data?.error || 'Failed to check out');
      }
    }
  };

  const handleCancel = async () => {
    const id = booking?.id;
    
    if (!id) {
      toast.error('Booking ID not found');
      return;
    }
    
    try {
      await cancelBooking.mutateAsync(id);
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
            <div className="h-8 bg-[#F7F1E4] rounded w-1/4"></div>
            <div className="bg-white rounded-lg border border-[#DDD5C4] p-6 space-y-4">
              <div className="h-4 bg-[#F7F1E4] rounded w-1/2"></div>
              <div className="h-4 bg-[#F7F1E4] rounded w-1/3"></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="h-20 bg-[#F7F1E4] rounded"></div>
                <div className="h-20 bg-[#F7F1E4] rounded"></div>
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
          <XCircleIcon className="h-16 w-16 text-[#EF4444] mx-auto mb-4" />
          <h2 className="font-display text-2xl font-medium text-[#2A2622] mb-2">Booking Not Found</h2>
          <p className="font-body text-[#8A8377] mb-6">The booking you're looking for doesn't exist.</p>
          <Link href="/bookings" className="font-body inline-flex items-center gap-2 px-6 py-3 text-[#F7F1E4] bg-[#16302B] rounded-lg hover:bg-[#1D3B34] transition-colors focus:outline-none focus:ring-2 focus:ring-[#C9A468] focus:ring-offset-2">
            <ArrowLeftIcon className="h-4 w-4" />
            Back to Bookings
          </Link>
        </div>
      </Layout>
    );
  }

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
          className="font-body inline-flex items-center text-[#8A8377] hover:text-[#16302B] mb-6 transition-colors group"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2 transition-transform group-hover:-translate-x-1" />
          Back to Bookings
        </Link>

        {/* Header */}
        <div className="bg-white rounded-lg border border-[#DDD5C4] p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <h1 className="font-display text-2xl font-medium text-[#2A2622]">
                  {booking.booking_reference || 'Booking'}
                </h1>
                <button
                  onClick={handleCopyReference}
                  className="p-1 text-[#8A8377] hover:text-[#16302B] transition-colors"
                  title="Copy reference"
                >
                  <DocumentDuplicateIcon className="h-5 w-5" />
                </button>
                {copied && <span className="font-body text-xs text-[#10B981]">Copied!</span>}
              </div>
              <div className="flex flex-wrap gap-2">
                <span className={`font-body px-3 py-1 rounded-full text-sm font-medium ${statusColors[booking.status] || 'bg-[#F7F1E4] text-[#8A8377]'}`}>
                  {booking.status?.replace('_', ' ') || 'Unknown'}
                </span>
                <span className={`font-body px-3 py-1 rounded-full text-sm font-medium ${paymentStatusColors[booking.payment_status] || 'bg-[#F7F1E4] text-[#8A8377]'}`}>
                  {booking.payment_status?.replace('_', ' ') || 'Pending'}
                </span>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handlePrint}
                className="font-body inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#16302B] bg-[#F7F1E4] border border-[#DDD5C4] rounded-lg hover:bg-[#DDD5C4] transition-colors focus:outline-none focus:ring-2 focus:ring-[#C9A468] focus:ring-offset-2"
              >
                <PrinterIcon className="h-4 w-4" />
                Print
              </button>
              
              {booking.status === 'confirmed' && (
                <>
                  <button
                    onClick={handleCheckIn}
                    disabled={checkIn.isPending}
                    className="font-body px-4 py-2 text-sm font-medium text-[#F7F1E4] bg-[#10B981] border border-transparent rounded-lg hover:bg-[#059669] transition-colors focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:ring-offset-2 disabled:opacity-50"
                  >
                    {checkIn.isPending ? 'Processing...' : 'Check In'}
                  </button>
                  <button
                    onClick={() => setShowCancelConfirm(true)}
                    className="font-body px-4 py-2 text-sm font-medium text-[#F7F1E4] bg-[#EF4444] border border-transparent rounded-lg hover:bg-[#DC2626] transition-colors focus:outline-none focus:ring-2 focus:ring-[#EF4444] focus:ring-offset-2"
                  >
                    Cancel
                  </button>
                </>
              )}
              
              {booking.status === 'checked_in' && (
                <button
                  onClick={handleCheckOut}
                  disabled={checkOut.isPending}
                  className="font-body px-4 py-2 text-sm font-medium text-[#F7F1E4] bg-[#3B82F6] border border-transparent rounded-lg hover:bg-[#2563EB] transition-colors focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:ring-offset-2 disabled:opacity-50"
                >
                  {checkOut.isPending ? 'Processing...' : 'Check Out'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Guest Information */}
        <div className="bg-white rounded-lg border border-[#DDD5C4] p-6 mb-6">
          <h2 className="font-display text-lg font-medium text-[#2A2622] mb-4 flex items-center gap-2">
            <UserIcon className="h-5 w-5 text-[#C9A468]" />
            Guest Information
          </h2>
          
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="font-body font-medium text-[#8A8377] w-24">Name:</span>
              <span className="font-body text-[#2A2622]">{guestFirstName} {guestLastName}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-body font-medium text-[#8A8377] w-24">Email:</span>
              <span className="font-body text-[#2A2622]">{guestEmail}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-body font-medium text-[#8A8377] w-24">Phone:</span>
              <span className="font-body text-[#2A2622]">{guestPhone}</span>
            </div>
            {guestIdNumber && (
              <div className="flex items-center gap-2">
                <span className="font-body font-medium text-[#8A8377] w-24">ID Number:</span>
                <span className="font-body text-[#2A2622]">{guestIdNumber}</span>
              </div>
            )}
          </div>
        </div>

        {/* Booking Details */}
        <div className="bg-white rounded-lg border border-[#DDD5C4] p-6 mb-6">
          <h2 className="font-display text-lg font-medium text-[#2A2622] mb-4 flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-[#C9A468]" />
            Booking Details
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="font-body text-sm text-[#8A8377] mb-1">Check-in</p>
              <p className="font-body font-medium text-[#2A2622]">
                {booking.check_in ? new Date(booking.check_in).toLocaleDateString() : 'N/A'}
              </p>
            </div>
            <div>
              <p className="font-body text-sm text-[#8A8377] mb-1">Check-out</p>
              <p className="font-body font-medium text-[#2A2622]">
                {booking.check_out ? new Date(booking.check_out).toLocaleDateString() : 'N/A'}
              </p>
            </div>
            <div>
              <p className="font-body text-sm text-[#8A8377] mb-1">Nights</p>
              <p className="font-body font-medium text-[#2A2622]">{booking.total_nights || 0}</p>
            </div>
            <div>
              <p className="font-body text-sm text-[#8A8377] mb-1">Guests</p>
              <p className="font-body font-medium text-[#2A2622]">
                {booking.adults || 0} adults, {booking.children || 0} children
              </p>
            </div>
          </div>
          
          {booking.special_requests && (
            <div className="mt-4 pt-4 border-t border-[#DDD5C4]">
              <p className="font-body text-sm text-[#8A8377] mb-2">Special Requests</p>
              <p className="font-body text-[#2A2622] bg-[#F7F1E4] p-3 rounded-lg border border-[#DDD5C4]">
                {booking.special_requests}
              </p>
            </div>
          )}
        </div>

        {/* Room & Payment */}
        <div className="bg-white rounded-lg border border-[#DDD5C4] p-6">
          <h2 className="font-display text-lg font-medium text-[#2A2622] mb-4 flex items-center gap-2">
            <HomeIcon className="h-5 w-5 text-[#C9A468]" />
            Room & Payment
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-body text-[#8A8377]">Room Number:</span>
              <span className="font-body font-semibold text-[#2A2622]">Room {roomNumber}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-body text-[#8A8377]">Room Type:</span>
              <span className="font-body capitalize text-[#2A2622]">
                {roomType === 'standard' ? 'Standard' : 'Duplex'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-body text-[#8A8377]">Capacity:</span>
              <span className="font-body text-[#2A2622]">{roomCapacity} guests</span>
            </div>
            <div className="border-t border-[#DDD5C4] pt-4 mt-2">
              <div className="flex items-center justify-between">
                <span className="font-display text-lg font-medium text-[#2A2622]">Total Amount:</span>
                <span className="font-display text-2xl font-medium text-[#16302B]">₦{(booking.total_amount || 0).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Cancel Confirmation Modal */}
        {showCancelConfirm && (
          <div className="fixed inset-0 bg-[#2A2622]/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
              <h3 className="font-display text-lg font-medium text-[#2A2622] mb-2">Cancel Booking</h3>
              <p className="font-body text-[#5B564B] mb-4">
                Are you sure you want to cancel this booking? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowCancelConfirm(false)}
                  className="flex-1 font-body px-4 py-2 text-sm font-medium text-[#16302B] bg-[#F7F1E4] border border-[#DDD5C4] rounded-lg hover:bg-[#DDD5C4] transition-colors focus:outline-none focus:ring-2 focus:ring-[#C9A468] focus:ring-offset-2"
                >
                  No, Keep It
                </button>
                <button
                  onClick={handleCancel}
                  disabled={cancelBooking.isPending}
                  className="flex-1 font-body px-4 py-2 text-sm font-medium text-[#F7F1E4] bg-[#EF4444] border border-transparent rounded-lg hover:bg-[#DC2626] transition-colors focus:outline-none focus:ring-2 focus:ring-[#EF4444] focus:ring-offset-2 disabled:opacity-50"
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