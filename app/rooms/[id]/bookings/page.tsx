// frontend/app/rooms/[id]/bookings/page.tsx
'use client';

import { useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeftIcon,
  CalendarIcon,
  UserIcon,
  HomeIcon,
  CurrencyDollarIcon,
  ClockIcon,
  PlusIcon,
  PencilIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline';
import { useRoom } from '@/lib/api/hooks/useRooms';
import { useBookings, useCheckIn, useCancelBooking } from '@/lib/api/hooks/useBookings';
import Layout from '@/components/layout/Layout';
import toast from 'react-hot-toast';

const statusColors: Record<string, string> = {
  confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
  checked_in: 'bg-green-100 text-green-800 border-green-200',
  checked_out: 'bg-gray-100 text-gray-800 border-gray-200',
  cancelled: 'bg-red-100 text-red-800 border-red-200',
};

const statusLabels: Record<string, string> = {
  confirmed: 'Confirmed',
  checked_in: 'Checked In',
  checked_out: 'Checked Out',
  cancelled: 'Cancelled',
};

export default function RoomBookingsPage() {
  const params = useParams();
  const router = useRouter();
  const roomId = params.id as string;

  const [dateFilter, setDateFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  // Fetch room details
  const { data: room, isLoading: roomLoading } = useRoom(roomId);

  // Fetch ALL bookings (without room filter)
  const { data: allBookings, isLoading: bookingsLoading, refetch } = useBookings({});

  // Filter bookings for this room only
  const roomBookings = useMemo(() => {
    return allBookings?.filter((booking: any) => 
      booking.room?.id === roomId || 
      booking.room_details?.id === roomId ||
      booking.room_id === roomId
    ) || [];
  }, [allBookings, roomId]);

  // Mutations
  const checkIn = useCheckIn();
  const cancelBooking = useCancelBooking();

  // Filter bookings by date and status
  const filteredBookings = roomBookings.filter((booking: any) => {
    if (dateFilter) {
      const bookingDate = new Date(booking.check_in).toISOString().split('T')[0];
      if (bookingDate !== dateFilter) return false;
    }
    if (statusFilter !== 'all' && booking.status !== statusFilter) return false;
    return true;
  });

  // Calculate stats for this room only
  const stats = useMemo(() => {
    const total = roomBookings.length;
    const confirmed = roomBookings.filter((b: any) => b.status === 'confirmed').length;
    const checkedIn = roomBookings.filter((b: any) => b.status === 'checked_in').length;
    const checkedOut = roomBookings.filter((b: any) => b.status === 'checked_out').length;
    const cancelled = roomBookings.filter((b: any) => b.status === 'cancelled').length;
    
    // Calculate revenue from non-cancelled bookings only
    const totalRevenue = roomBookings
      .filter((b: any) => b.status !== 'cancelled') // Don't count cancelled bookings
      .reduce((sum: number, b: any) => sum + (Number(b.total_amount) || 0), 0);
    
    return { total, confirmed, checkedIn, checkedOut, cancelled, totalRevenue };
  }, [roomBookings]);

  const handleCheckIn = async (bookingId: string) => {
    try {
      await checkIn.mutateAsync({
        id: bookingId,
        paymentData: { payment_method: 'cash' },
      });
      toast.success('Guest checked in successfully');
      refetch();
      setShowCheckInModal(false);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to check in');
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    try {
      await cancelBooking.mutateAsync(bookingId);
      toast.success('Booking cancelled');
      refetch();
      setShowCancelModal(false);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to cancel booking');
    }
  };

  if (roomLoading) {
    return (
      <Layout>
        <div className="max-w-6xl mx-auto py-8 px-4">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-32 bg-gray-200 rounded-xl"></div>
            <div className="h-64 bg-gray-200 rounded-xl"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!room) {
    return (
      <Layout>
        <div className="max-w-6xl mx-auto py-16 text-center">
          <h2 className="text-2xl font-bold mb-2">Room Not Found</h2>
          <Link href="/rooms" className="text-red-600">Back to Rooms</Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto py-8 px-4">
        {/* Header with back button */}
        <Link
          href="/rooms"
          className="inline-flex items-center text-gray-600 hover:text-red-600 mb-6 group"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2 transition-transform group-hover:-translate-x-1" />
          Back to Rooms
        </Link>

        {/* Room Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-500 rounded-xl p-6 text-white mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <HomeIcon className="h-6 w-6" />
                Room {room.room_number} - Bookings
              </h1>
              <p className="text-red-100 mt-1">
                {room.room_type === 'standard' ? 'Standard Room' : 'Duplex Suite'} • ₦{room.base_price}/night
              </p>
            </div>
            <div className="flex gap-2">
              <Link
                href={`/rooms/${room.id}/edit`}
                className="bg-white text-red-600 px-4 py-2 rounded-lg hover:bg-red-50 transition-colors flex items-center gap-2"
              >
                <PencilIcon className="h-5 w-5" />
                Edit Room
              </Link>
              <Link
                href={`/bookings/new?room=${room.id}`}
                className="bg-white text-red-600 px-4 py-2 rounded-lg hover:bg-red-50 transition-colors flex items-center gap-2"
              >
                <PlusIcon className="h-5 w-5" />
                New Booking
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <p className="text-xs text-gray-600 mb-1">Total Bookings</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <p className="text-xs text-gray-600 mb-1">Confirmed</p>
            <p className="text-2xl font-bold text-blue-600">{stats.confirmed}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <p className="text-xs text-gray-600 mb-1">Checked In</p>
            <p className="text-2xl font-bold text-green-600">{stats.checkedIn}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <p className="text-xs text-gray-600 mb-1">Checked Out</p>
            <p className="text-2xl font-bold text-gray-600">{stats.checkedOut}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <p className="text-xs text-gray-600 mb-1">Revenue</p>
            <p className="text-xl font-bold text-red-600">₦{stats.totalRevenue.toLocaleString()}</p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Booking History</h2>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 border rounded-lg transition-colors ${
                showFilters ? 'bg-red-50 border-red-300 text-red-600' : 'hover:bg-gray-50'
              }`}
            >
              <FunnelIcon className="h-5 w-5" />
            </button>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Date</label>
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                >
                  <option value="all">All Status</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="checked_in">Checked In</option>
                  <option value="checked_out">Checked Out</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Bookings List */}
        {bookingsLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <CalendarIcon className="h-12 w-12 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-1">No bookings found</h3>
            <p className="text-gray-500 mb-4">This room has no bookings yet</p>
            <Link
              href={`/bookings/new?room=${room.id}`}
              className="inline-flex items-center gap-2 text-red-600 hover:text-red-700 font-medium"
            >
              <PlusIcon className="h-5 w-5" />
              Create your first booking
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((booking: any) => (
              <div
                key={booking.id}
                className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                      <UserIcon className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                          {booking.booking_reference}
                        </span>
                        <span className={`px-2 py-1 text-xs rounded-full ${statusColors[booking.status]}`}>
                          {statusLabels[booking.status]}
                        </span>
                      </div>
                      <h3 className="font-semibold text-gray-900 mt-1">
                        {booking.guest_name || booking.guest_details?.full_name}
                      </h3>
                    </div>
                  </div>
                  <p className="text-xl font-bold text-red-600">₦{booking.total_amount.toLocaleString()}</p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm mb-4">
                  <div className="flex items-center gap-2 text-gray-600">
                    <CalendarIcon className="h-4 w-4" />
                    <span>{new Date(booking.check_in).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <CalendarIcon className="h-4 w-4" />
                    <span>{new Date(booking.check_out).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <ClockIcon className="h-4 w-4" />
                    <span>{booking.total_nights} nights</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <UserIcon className="h-4 w-4" />
                    <span>{booking.adults + booking.children} guests</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
                  <Link
                    href={`/bookings/${booking.id}`}
                    className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm flex items-center justify-center gap-1"
                  >
                    <EyeIcon className="h-4 w-4" />
                    View Details
                  </Link>
                  
                  {booking.status === 'confirmed' && (
                    <button
                      onClick={() => {
                        setSelectedBooking(booking);
                        setShowCheckInModal(true);
                      }}
                      className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm flex items-center justify-center gap-1"
                    >
                      <CheckCircleIcon className="h-4 w-4" />
                      Check In
                    </button>
                  )}

                  {booking.status === 'checked_in' && (
                    <Link
                      href={`/checkout/${booking.id}`}
                      className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center justify-center gap-1"
                    >
                      <CalendarIcon className="h-4 w-4" />
                      Check Out
                    </Link>
                  )}

                  {booking.status === 'confirmed' && (
                    <button
                      onClick={() => {
                        setSelectedBooking(booking);
                        setShowCancelModal(true);
                      }}
                      className="flex-1 px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm flex items-center justify-center gap-1"
                    >
                      <XCircleIcon className="h-4 w-4" />
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Check In Modal */}
        {showCheckInModal && selectedBooking && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
              <div className="text-center mb-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircleIcon className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Confirm Check-in</h3>
                <p className="text-gray-600">
                  Check in <span className="font-semibold">{selectedBooking.guest_name}</span>?
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Room {room.room_number} • {selectedBooking.total_nights} nights
                </p>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowCheckInModal(false)}
                  className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleCheckIn(selectedBooking.id)}
                  disabled={checkIn.isPending}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-xl hover:from-green-700 hover:to-green-600 disabled:opacity-50 transition-all font-medium"
                >
                  {checkIn.isPending ? 'Processing...' : 'Confirm Check-in'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Cancel Modal */}
        {showCancelModal && selectedBooking && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
              <div className="text-center mb-4">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <XCircleIcon className="h-8 w-8 text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Cancel Booking</h3>
                <p className="text-gray-600">
                  Are you sure you want to cancel this booking?
                </p>
                <p className="text-sm text-gray-500 mt-2">This action cannot be undone.</p>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowCancelModal(false)}
                  className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                  No, Keep It
                </button>
                <button
                  onClick={() => handleCancelBooking(selectedBooking.id)}
                  disabled={cancelBooking.isPending}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-xl hover:from-red-700 hover:to-red-600 disabled:opacity-50 transition-all font-medium"
                >
                  {cancelBooking.isPending ? 'Processing...' : 'Yes, Cancel'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}