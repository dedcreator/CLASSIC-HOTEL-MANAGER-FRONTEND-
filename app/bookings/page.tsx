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

  // Filter bookings
  const filteredBookings = bookings?.filter((booking) => {
    if (dateFilter) {
      const bookingDate = new Date(booking.check_in).toISOString().split('T')[0];
      if (bookingDate !== dateFilter) return false;
    }
    return true;
  }) || [];

  return (
    <Layout>
      <div className="space-y-6 pb-20">
        {/* Header with Gradient */}
        <div className="bg-gradient-to-r from-red-600 to-red-500 rounded-xl p-6 text-white">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <CalendarIcon className="h-6 w-6" />
                Bookings
              </h1>
              <p className="text-red-100 mt-1">Manage guest reservations and check-ins</p>
            </div>
            <Link
              href="/bookings/new"
              className="bg-white text-red-600 px-4 py-2 rounded-lg hover:bg-red-50 transition-colors flex items-center gap-2 w-fit"
            >
              <PlusIcon className="h-5 w-5" />
              New Booking
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <p className="text-sm text-gray-600">Total Bookings</p>
            <p className="text-3xl font-bold text-gray-900">{stats?.total_bookings || 0}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <p className="text-sm text-gray-600">Active Guests</p>
            <p className="text-3xl font-bold text-green-600">{stats?.active_guests || 0}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <p className="text-sm text-gray-600">Arrivals Today</p>
            <p className="text-3xl font-bold text-blue-600">{stats?.today_arrivals || 0}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <p className="text-sm text-gray-600">Departures Today</p>
            <p className="text-3xl font-bold text-amber-600">{stats?.today_departures || 0}</p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by reference, guest name, or room..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Check-in Date</label>
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Bookings List */}
        {isLoading ? (
          <div className="grid gap-4">
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
            <p className="text-gray-500 mb-4">Try adjusting your search or filters</p>
            <Link
              href="/bookings/new"
              className="inline-flex items-center gap-2 text-red-600 hover:text-red-700 font-medium"
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
                className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-all cursor-pointer"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-red-600">
                        {booking.room_number?.slice(-2)}
                      </span>
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

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <HomeIcon className="h-4 w-4" />
                    <span>Room {booking.room_number}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <UserIcon className="h-4 w-4" />
                    <span>{booking.adults + booking.children} guests</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <CalendarIcon className="h-4 w-4" />
                    <span>{new Date(booking.check_in).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <ClockIcon className="h-4 w-4" />
                    <span>{booking.total_nights} nights</span>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="mt-3 flex gap-2" onClick={(e) => e.stopPropagation()}>
                  {booking.status === 'confirmed' && (
                    <Link
                      href={`/checkin?booking=${booking.id}`}
                      className="flex-1 bg-green-600 text-white text-sm py-2 rounded-lg hover:bg-green-700 text-center"
                    >
                      Check In
                    </Link>
                  )}
                  {booking.status === 'checked_in' && (
                    <Link
                      href={`/checkout/${booking.id}`}
                      className="flex-1 bg-blue-600 text-white text-sm py-2 rounded-lg hover:bg-blue-700 text-center"
                    >
                      Check Out
                    </Link>
                  )}
                  <Link
                    href={`/bookings/${booking.id}`}
                    className="flex-1 bg-gray-100 text-gray-700 text-sm py-2 rounded-lg hover:bg-gray-200 text-center"
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