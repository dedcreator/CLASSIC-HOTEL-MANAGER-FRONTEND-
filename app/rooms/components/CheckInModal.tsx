// frontend/app/rooms/components/CheckInModal.tsx
'use client';

import { useState } from 'react';
import {
  XMarkIcon,
  UserIcon,
  CalendarIcon,
  ClockIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';
import { Room } from '@/lib/api/types';
import { useCreateBooking } from '@/lib/api/hooks/useBookings';
import toast from 'react-hot-toast';

interface CheckInModalProps {
  room: Room;
  onClose: () => void;
  onComplete: () => void;
}

export default function CheckInModal({ room, onClose, onComplete }: CheckInModalProps) {
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [nights, setNights] = useState(1);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createBooking = useCreateBooking();

  // Set default dates
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  // Calculate total price
  const calculateTotal = () => {
    const pricePerNight = room.base_price || 0;
    return pricePerNight * nights;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!guestName.trim()) {
      toast.error('Please enter guest name');
      return;
    }

    if (!checkInDate || !checkOutDate) {
      toast.error('Please select check-in and check-out dates');
      return;
    }

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    
    if (checkOut <= checkIn) {
      toast.error('Check-out date must be after check-in date');
      return;
    }

    setIsSubmitting(true);

    try {
      const bookingData = {
        room_id: room.id,
        guest_name: guestName.trim(),
        guest_email: guestEmail.trim() || undefined,
        guest_phone: guestPhone.trim() || undefined,
        check_in: checkInDate,
        check_out: checkOutDate,
        total_amount: calculateTotal(),
        status: 'confirmed',
        notes: notes.trim() || undefined,
      };

      await createBooking.mutateAsync(bookingData);
      
      // Update room status to occupied
      // This would be handled by the parent component
      
      toast.success(`${guestName} checked in to Room ${room.room_number}`);
      onComplete();
    } catch (error: any) {
      console.error('Check-in failed:', error);
      toast.error(error.response?.data?.message || 'Failed to check in guest');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-[#DDD5C4]">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-[#F7F1E4] p-4 flex items-center justify-between z-10">
          <div>
            <h3 className="font-display text-lg font-medium text-[#2A2622]">Check-in Guest</h3>
            <p className="font-body text-sm text-[#8A8377]">Room {room.room_number} • {room.room_type}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-[#F7F1E4] rounded-lg transition-colors"
          >
            <XMarkIcon className="h-5 w-5 text-[#8A8377]" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Room Summary */}
          <div className="bg-[#F7F1E4] rounded-lg p-4 flex items-center justify-between">
            <div>
              <p className="font-body text-sm text-[#5B564B]">Price per night</p>
              <p className="font-display text-xl font-medium text-[#16302B]">₦{room.base_price}</p>
            </div>
            <div className="text-right">
              <p className="font-body text-sm text-[#5B564B]">Total for {nights} night{nights > 1 ? 's' : ''}</p>
              <p className="font-display text-xl font-medium text-[#C9A468]">₦{calculateTotal()}</p>
            </div>
          </div>

          {/* Guest Information */}
          <div>
            <label className="font-body text-sm font-medium text-[#2A2622] block mb-1">
              Guest Name <span className="text-[#C62828]">*</span>
            </label>
            <div className="relative">
              <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#8A8377]" />
              <input
                type="text"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                className="font-body w-full pl-10 pr-4 py-2 border border-[#DDD5C4] rounded-lg bg-[#FAF6EF] text-[#2A2622] outline-none transition-colors focus:border-[#C9A468] focus:ring-1 focus:ring-[#C9A468] placeholder:text-[#8A8377]"
                placeholder="Enter guest full name"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-body text-sm font-medium text-[#2A2622] block mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
                className="font-body w-full px-4 py-2 border border-[#DDD5C4] rounded-lg bg-[#FAF6EF] text-[#2A2622] outline-none transition-colors focus:border-[#C9A468] focus:ring-1 focus:ring-[#C9A468] placeholder:text-[#8A8377]"
                placeholder="guest@email.com"
              />
            </div>
            <div>
              <label className="font-body text-sm font-medium text-[#2A2622] block mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                value={guestPhone}
                onChange={(e) => setGuestPhone(e.target.value)}
                className="font-body w-full px-4 py-2 border border-[#DDD5C4] rounded-lg bg-[#FAF6EF] text-[#2A2622] outline-none transition-colors focus:border-[#C9A468] focus:ring-1 focus:ring-[#C9A468] placeholder:text-[#8A8377]"
                placeholder="080 1234 5678"
              />
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-body text-sm font-medium text-[#2A2622] block mb-1">
                Check-in Date <span className="text-[#C62828]">*</span>
              </label>
              <div className="relative">
                <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#8A8377]" />
                <input
                  type="date"
                  value={checkInDate}
                  onChange={(e) => {
                    setCheckInDate(e.target.value);
                    // Auto-calculate check-out if not set
                    if (!checkOutDate) {
                      const date = new Date(e.target.value);
                      date.setDate(date.getDate() + 1);
                      setCheckOutDate(date.toISOString().split('T')[0]);
                    }
                  }}
                  min={today}
                  className="font-body w-full pl-10 pr-4 py-2 border border-[#DDD5C4] rounded-lg bg-[#FAF6EF] text-[#2A2622] outline-none transition-colors focus:border-[#C9A468] focus:ring-1 focus:ring-[#C9A468]"
                  required
                />
              </div>
            </div>
            <div>
              <label className="font-body text-sm font-medium text-[#2A2622] block mb-1">
                Check-out Date <span className="text-[#C62828]">*</span>
              </label>
              <div className="relative">
                <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#8A8377]" />
                <input
                  type="date"
                  value={checkOutDate}
                  onChange={(e) => setCheckOutDate(e.target.value)}
                  min={checkInDate || today}
                  className="font-body w-full pl-10 pr-4 py-2 border border-[#DDD5C4] rounded-lg bg-[#FAF6EF] text-[#2A2622] outline-none transition-colors focus:border-[#C9A468] focus:ring-1 focus:ring-[#C9A468]"
                  required
                />
              </div>
            </div>
          </div>

          {/* Nights Counter */}
          <div>
            <label className="font-body text-sm font-medium text-[#2A2622] block mb-1">
              Number of Nights
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setNights(Math.max(1, nights - 1))}
                className="w-10 h-10 rounded-lg border border-[#DDD5C4] hover:bg-[#F7F1E4] transition-colors flex items-center justify-center text-[#2A2622] font-display text-lg"
              >
                −
              </button>
              <span className="font-display text-xl font-medium text-[#2A2622] min-w-[3rem] text-center">
                {nights}
              </span>
              <button
                type="button"
                onClick={() => setNights(nights + 1)}
                className="w-10 h-10 rounded-lg border border-[#DDD5C4] hover:bg-[#F7F1E4] transition-colors flex items-center justify-center text-[#2A2622] font-display text-lg"
              >
                +
              </button>
              <span className="font-body text-sm text-[#8A8377] ml-2">
                {nights === 1 ? 'night' : 'nights'}
              </span>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="font-body text-sm font-medium text-[#2A2622] block mb-1">
              Notes (Optional)
            </label>
            <div className="relative">
              <DocumentTextIcon className="absolute left-3 top-3 h-5 w-5 text-[#8A8377]" />
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="font-body w-full pl-10 pr-4 py-2 border border-[#DDD5C4] rounded-lg bg-[#FAF6EF] text-[#2A2622] outline-none transition-colors focus:border-[#C9A468] focus:ring-1 focus:ring-[#C9A468] placeholder:text-[#8A8377] resize-none"
                placeholder="Special requests, preferences, or notes..."
                rows={2}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 font-body px-4 py-2 border border-[#DDD5C4] rounded-lg text-[#5B564B] hover:bg-[#F7F1E4] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 font-body px-4 py-2 bg-[#16302B] text-[#F7F1E4] rounded-lg hover:bg-[#1D3B34] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Checking in...' : 'Check In Guest'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}