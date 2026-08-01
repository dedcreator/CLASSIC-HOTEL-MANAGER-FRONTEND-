// frontend/app/bookings/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  CalendarIcon,
  UserIcon,
  HomeIcon,
  CurrencyDollarIcon,
  ClockIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline';
import { useBookings, useBookingStats } from '@/lib/api/hooks/useBookings';
import Layout from '@/components/layout/Layout';

const statusColors: Record<string, string> = {
  confirmed: 'bg-[#DBEAFE] text-[#1E40AF] border-[#93C5FD]',
  checked_in: 'bg-[#D1FAE5] text-[#065F46] border-[#6EE7B7]',
  checked_out: 'bg-[#F7F1E4] text-[#8A8377] border-[#DDD5C4]',
  cancelled: 'bg-[#FEF2F2] text-[#991B1B] border-[#FCA5A5]',
};

const statusLabels: Record<string, string> = {
  confirmed: 'Confirmed',
  checked_in: 'Checked In',
  checked_out: 'Checked Out',
  cancelled: 'Cancelled',
};

export default function BookingsPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);

  const { data: bookings, isLoading } = useBookings({
    search: searchTerm || undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
  });

  const { data: stats } = useBookingStats();

  const filteredBookings = bookings?.filter((booking) => {
    if (dateFilter) {
      const bookingDate = new Date(booking.check_in).toISOString().split('T')[0];
      if (bookingDate !== dateFilter) return false;
    }
    return true;
  }) || [];

  return (
    <Layout>
      <div className="space-y-6 pb-20 px-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#DDD5C4] pb-6">
          <div>
            <h1 className="font-display text-2xl font-medium text-[#2A2622] flex items-center gap-2">
              <CalendarIcon className="h-6 w-6 text-[#C9A468]" />
              Bookings
            </h1>
            <p className="font-body text-sm text-[#8A8377] mt-1">Manage guest reservations and check-ins</p>
          </div>
          <Link
            href="/bookings/new"
            className="font-body inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#F7F1E4] bg-[#16302B] border border-transparent rounded-lg hover:bg-[#1D3B34] transition-colors focus:outline-none focus:ring-2 focus:ring-[#C9A468] focus:ring-offset-2 w-fit"
          >
            <PlusIcon className="h-5 w-5" />
            New Booking
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border border-[#DDD5C4] p-4 hover:border-[#C9A468] transition-all">
            <p className="font-body text-sm text-[#8A8377]">Total Bookings</p>
            <p className="font-display text-2xl font-medium text-[#2A2622]">{stats?.total_bookings || 0}</p>
          </div>
          <div className="bg-white rounded-lg border border-[#DDD5C4] p-4 hover:border-[#C9A468] transition-all">
            <p className="font-body text-sm text-[#8A8377]">Active Guests</p>
            <p className="font-display text-2xl font-medium text-[#10B981]">{stats?.active_guests || 0}</p>
          </div>
          <div className="bg-white rounded-lg border border-[#DDD5C4] p-4 hover:border-[#C9A468] transition-all">
            <p className="font-body text-sm text-[#8A8377]">Arrivals Today</p>
            <p className="font-display text-2xl font-medium text-[#3B82F6]">{stats?.today_arrivals || 0}</p>
          </div>
          <div className="bg-white rounded-lg border border-[#DDD5C4] p-4 hover:border-[#C9A468] transition-all">
            <p className="font-body text-sm text-[#8A8377]">Departures Today</p>
            <p className="font-display text-2xl font-medium text-[#F59E0B]">{stats?.today_departures || 0}</p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg border border-[#DDD5C4] p-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="absolute left-0 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#8A8377]" />
              <input
                type="text"
                placeholder="Search by reference, guest name, or room..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="font-body w-full border-0 border-b border-[#DDD5C4] bg-transparent pl-8 py-2 text-[#2A2622] outline-none transition-colors focus:border-b-2 focus:border-[#C9A468] focus:pb-[7px] placeholder:text-[#8A8377]"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 border rounded-lg transition-colors ${
                showFilters ? 'bg-[#F7F1E4] border-[#C9A468] text-[#16302B]' : 'border-[#DDD5C4] text-[#8A8377] hover:bg-[#F7F1E4]'
              }`}
            >
              <FunnelIcon className="h-5 w-5" />
            </button>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-[#F7F1E4]">
              <div>
                <label className="font-body block text-sm font-medium text-[#5B564B] mb-1">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="font-body w-full border-0 border-b border-[#DDD5C4] bg-transparent px-0 py-2 text-[#2A2622] outline-none transition-colors focus:border-b-2 focus:border-[#C9A468]"
                >
                  <option value="all">All Status</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="checked_in">Checked In</option>
                  <option value="checked_out">Checked Out</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div>
                <label className="font-body block text-sm font-medium text-[#5B564B] mb-1">Check-in Date</label>
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="font-body w-full border-0 border-b border-[#DDD5C4] bg-transparent px-0 py-2 text-[#2A2622] outline-none transition-colors focus:border-b-2 focus:border-[#C9A468]"
                />
              </div>
            </div>
          )}
        </div>

        {/* Bookings List */}
        {isLoading ? (
          <div className="grid gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-lg border border-[#DDD5C4] p-4 animate-pulse">
                <div className="h-4 bg-[#F7F1E4] rounded w-1/4 mb-4"></div>
                <div className="h-4 bg-[#F7F1E4] rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="bg-white rounded-lg border border-[#DDD5C4] p-12 text-center">
            <CalendarIcon className="h-12 w-12 mx-auto text-[#DDD5C4] mb-4" />
            <h3 className="font-display text-lg font-medium text-[#2A2622] mb-1">No bookings found</h3>
            <p className="font-body text-[#8A8377] mb-4">Try adjusting your search or filters</p>
            <Link
              href="/bookings/new"
              className="font-body inline-flex items-center gap-2 text-[#16302B] hover:text-[#1D3B34] font-medium underline decoration-[#C9A468] underline-offset-4"
            >
              <PlusIcon className="h-5 w-5" />
              Create your first booking
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((booking) => (
              <div
                key={booking.id}
                onClick={() => router.push(`/bookings/${booking.id}`)}
                className="bg-white rounded-lg border border-[#DDD5C4] p-4 hover:border-[#C9A468] hover:shadow-md transition-all cursor-pointer"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#F7F1E4] rounded-full flex items-center justify-center">
                      <span className="font-display text-sm font-medium text-[#16302B]">
                        {booking.room_number?.slice(-2)}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs bg-[#F7F1E4] px-2 py-1 rounded text-[#8A8377]">
                          {booking.booking_reference}
                        </span>
                        <span className={`font-body px-2 py-0.5 text-xs font-medium rounded-full border ${statusColors[booking.status]}`}>
                          {statusLabels[booking.status]}
                        </span>
                      </div>
                      <h3 className="font-body font-semibold text-[#2A2622] mt-1">
                        {booking.guest_name || booking.guest_details?.full_name}
                      </h3>
                    </div>
                  </div>
                  <p className="font-display text-xl font-medium text-[#16302B]">₦{booking.total_amount.toLocaleString()}</p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                  <div className="flex items-center gap-2 text-[#8A8377]">
                    <HomeIcon className="h-4 w-4" />
                    <span className="font-body">Room {booking.room_number}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#8A8377]">
                    <UserIcon className="h-4 w-4" />
                    <span className="font-body">{booking.adults + booking.children} guests</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#8A8377]">
                    <CalendarIcon className="h-4 w-4" />
                    <span className="font-body">{new Date(booking.check_in).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#8A8377]">
                    <ClockIcon className="h-4 w-4" />
                    <span className="font-body">{booking.total_nights} nights</span>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="mt-3 flex gap-2" onClick={(e) => e.stopPropagation()}>
                  {booking.status === 'confirmed' && (
                    <Link
                      href={`/checkin?booking=${booking.id}`}
                      className="flex-1 font-body bg-[#10B981] text-white text-sm py-2 rounded-lg hover:bg-[#059669] text-center transition-colors"
                    >
                      Check In
                    </Link>
                  )}
                  {booking.status === 'checked_in' && (
                    <Link
                      href={`/checkout/${booking.id}`}
                      className="flex-1 font-body bg-[#3B82F6] text-white text-sm py-2 rounded-lg hover:bg-[#2563EB] text-center transition-colors"
                    >
                      Check Out
                    </Link>
                  )}
                  <Link
                    href={`/bookings/${booking.id}`}
                    className="flex-1 font-body bg-[#F7F1E4] text-[#16302B] text-sm py-2 rounded-lg hover:bg-[#DDD5C4] text-center transition-colors"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}