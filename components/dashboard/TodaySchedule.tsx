// frontend/app/components/dashboard/TodaySchedule.tsx
'use client';

import Link from 'next/link';
import {
  CalendarIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
} from '@heroicons/react/24/outline';
import { useTodayBookings } from '@/lib/api/hooks/useBookings';

export default function TodaySchedule() {
  const { data: todayData, isLoading } = useTodayBookings();

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
        </div>
      </div>
    );
  }

  const arrivals = todayData?.arrivals || [];
  const departures = todayData?.departures || [];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <h2 className="text-lg font-semibold text-dark-500 mb-4 flex items-center gap-2">
        <CalendarIcon className="h-5 w-5 text-red-600" />
        Today's Schedule
      </h2>

      <div className="space-y-4">
        {/* Arrivals */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <ArrowRightIcon className="h-4 w-4 text-green-600" />
            <h3 className="font-medium text-green-600">Arrivals ({arrivals.length})</h3>
          </div>
          {arrivals.length === 0 ? (
            <p className="text-sm text-gray-500 ml-6">No arrivals today</p>
          ) : (
            <div className="space-y-2">
              {arrivals.map((booking: any) => (
                <Link
                  key={booking.id}
                  href={`/bookings/${booking.id}`}
                  className="block ml-6 p-2 bg-green-50 rounded-lg hover:bg-green-100"
                >
                  <div className="flex justify-between">
                    <div>
                      <p className="font-medium text-dark-500">
                        {booking.guest_name || 'Guest'}
                      </p>
                      <p className="text-xs text-gray-600">Room {booking.room_number}</p>
                    </div>
                    <span className="text-xs text-green-600">
                      {new Date(booking.check_in).toLocaleTimeString()}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Departures */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <ArrowLeftIcon className="h-4 w-4 text-red-600" />
            <h3 className="font-medium text-red-600">Departures ({departures.length})</h3>
          </div>
          {departures.length === 0 ? (
            <p className="text-sm text-gray-500 ml-6">No departures today</p>
          ) : (
            <div className="space-y-2">
              {departures.map((booking: any) => (
                <Link
                  key={booking.id}
                  href={`/bookings/${booking.id}`}
                  className="block ml-6 p-2 bg-red-50 rounded-lg hover:bg-red-100"
                >
                  <div className="flex justify-between">
                    <div>
                      <p className="font-medium text-dark-500">
                        {booking.guest_name || 'Guest'}
                      </p>
                      <p className="text-xs text-gray-600">Room {booking.room_number}</p>
                    </div>
                    <span className="text-xs text-red-600">
                      {new Date(booking.check_out).toLocaleTimeString()}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      <Link
        href="/bookings"
        className="block text-center mt-4 text-sm text-red-600 hover:text-red-700 font-medium"
      >
        View All Bookings
      </Link>
    </div>
  );
}