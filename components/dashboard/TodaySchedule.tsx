// frontend/app/components/dashboard/TodaySchedule.tsx
'use client';

import Link from 'next/link';
import {
  CalendarIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
} from '@heroicons/react/24/outline';
import { useTodayBookings } from '@/lib/api/hooks/useBookings';

const formatTime = (value: string) =>
  new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

export default function TodaySchedule() {
  const { data: todayData, isLoading } = useTodayBookings();

  // Note: move this @import into globals.css alongside the login page's copy
  // so Fraunces/Work Sans only load once app-wide, rather than per component.
  const fontStyles = (
    <style jsx global>{`
      @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Work+Sans:wght@400;500;600&display=swap');
      .font-display { font-family: 'Fraunces', serif; font-optical-sizing: auto; }
      .font-body { font-family: 'Work Sans', sans-serif; }
    `}</style>
  );

  if (isLoading) {
    return (
      <div className="rounded-lg border border-[#EDE6D6] bg-[#FAF6EF] p-5">
        {fontStyles}
        <div className="animate-pulse space-y-3">
          <div className="h-4 w-1/4 rounded bg-[#EDE6D6]" />
          <div className="h-4 w-1/2 rounded bg-[#EDE6D6]" />
          <div className="h-4 w-1/3 rounded bg-[#EDE6D6]" />
        </div>
      </div>
    );
  }

  const arrivals = todayData?.arrivals || [];
  const departures = todayData?.departures || [];

  return (
    <div className="rounded-lg border border-[#EDE6D6] bg-[#FAF6EF] p-5">
      {fontStyles}

      <div className="flex items-center gap-2">
        <CalendarIcon className="h-5 w-5 text-[#B8905B]" />
        <h2 className="font-display text-lg text-[#2A2622]">Today&rsquo;s schedule</h2>
      </div>
      <div className="mt-3 h-px w-full bg-[#EDE6D6]" />

      <div className="mt-4 space-y-6">
        {/* Arrivals */}
        <section>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <ArrowRightIcon className="h-3.5 w-3.5 text-[#B8905B]" />
              <h3 className="font-body text-xs font-semibold uppercase tracking-[0.14em] text-[#B8905B]">
                Arrivals
              </h3>
            </div>
            <span className="font-body text-xs tabular-nums text-[#8A8377]">{arrivals.length}</span>
          </div>

          {arrivals.length === 0 ? (
            <p className="font-body mt-2 text-sm italic text-[#8A8377]">Nothing arriving today</p>
          ) : (
            <ul className="mt-2 divide-y divide-[#EDE6D6]">
              {arrivals.map((booking: any) => (
                <li key={booking.id}>
                  <Link
                    href={`/bookings/${booking.id}`}
                    className="flex items-center justify-between py-2.5 transition-colors hover:bg-[#F3EEE1]"
                  >
                    <div>
                      <p className="font-body text-sm font-medium text-[#2A2622]">
                        {booking.guest_name || 'Guest'}
                      </p>
                      <p className="font-body text-xs text-[#8A8377]">Room {booking.room_number}</p>
                    </div>
                    <span className="font-body text-xs tabular-nums text-[#B8905B]">
                      {formatTime(booking.check_in)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Departures */}
        <section>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <ArrowLeftIcon className="h-3.5 w-3.5 text-[#16302B]" />
              <h3 className="font-body text-xs font-semibold uppercase tracking-[0.14em] text-[#16302B]">
                Departures
              </h3>
            </div>
            <span className="font-body text-xs tabular-nums text-[#8A8377]">{departures.length}</span>
          </div>

          {departures.length === 0 ? (
            <p className="font-body mt-2 text-sm italic text-[#8A8377]">Nothing departing today</p>
          ) : (
            <ul className="mt-2 divide-y divide-[#EDE6D6]">
              {departures.map((booking: any) => (
                <li key={booking.id}>
                  <Link
                    href={`/bookings/${booking.id}`}
                    className="flex items-center justify-between py-2.5 transition-colors hover:bg-[#F3EEE1]"
                  >
                    <div>
                      <p className="font-body text-sm font-medium text-[#2A2622]">
                        {booking.guest_name || 'Guest'}
                      </p>
                      <p className="font-body text-xs text-[#8A8377]">Room {booking.room_number}</p>
                    </div>
                    <span className="font-body text-xs tabular-nums text-[#16302B]">
                      {formatTime(booking.check_out)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <Link
        href="/bookings"
        className="font-body group mt-5 flex items-center justify-center gap-1.5 border-t border-[#EDE6D6] pt-4 text-sm font-medium text-[#B8905B] hover:text-[#9C7844]"
      >
        View all bookings
        <ArrowRightIcon className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
      </Link>
    </div>
  );
}