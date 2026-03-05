// frontend/app/checkin/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeftIcon,
  UserIcon,
  HomeIcon,
  CalendarIcon,
  PhoneIcon,
  EnvelopeIcon,
  IdentificationIcon,
} from '@heroicons/react/24/outline';
import { useRooms } from '@/lib/api/hooks/useRooms';
import { useCreateBooking, useCheckIn } from '@/lib/api/hooks/useBookings';
import Layout from '@/components/layout/Layout';

export default function CheckInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedRoomId = searchParams.get('room');

  const [step, setStep] = useState(1);
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  const { data: rooms } = useRooms({ status: 'available' });
  const availableRooms = rooms?.filter(r => r.status === 'available') || [];
  
  const [guestData, setGuestData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    id_number: '',
    address: '',
  });

  const [bookingData, setBookingData] = useState({
    check_in: new Date().toISOString().split('T')[0],
    check_out: '',
    adults: 1,
    children: 0,
    special_requests: '',
  });

  const [totalNights, setTotalNights] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const createBooking = useCreateBooking();
  const checkIn = useCheckIn();

  useEffect(() => {
    if (preselectedRoomId && availableRooms.length > 0) {
      const room = availableRooms.find(r => r.id === preselectedRoomId);
      if (room) setSelectedRoom(room);
    }
  }, [preselectedRoomId, availableRooms]);

  useEffect(() => {
    if (selectedRoom && bookingData.check_in && bookingData.check_out) {
      const start = new Date(bookingData.check_in);
      const end = new Date(bookingData.check_out);
      const nights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      setTotalNights(nights);
      setTotalAmount(nights * selectedRoom.base_price);
    }
  }, [selectedRoom, bookingData.check_in, bookingData.check_out]);

  const validateGuestData = () => {
    const newErrors: Record<string, string> = {};
    
    if (!guestData.first_name.trim()) newErrors.first_name = 'First name is required';
    if (!guestData.last_name.trim()) newErrors.last_name = 'Last name is required';
    if (!guestData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(guestData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!guestData.phone.trim()) newErrors.phone = 'Phone number is required';
    
    return newErrors;
  };

  const validateBookingData = () => {
    const newErrors: Record<string, string> = {};
    
    if (!bookingData.check_in) newErrors.check_in = 'Check-in date is required';
    if (!bookingData.check_out) newErrors.check_out = 'Check-out date is required';
    
    if (bookingData.check_in && bookingData.check_out) {
      const start = new Date(bookingData.check_in);
      const end = new Date(bookingData.check_out);
      if (end <= start) {
        newErrors.check_out = 'Check-out date must be after check-in date';
      }
    }
    
    if (bookingData.adults < 1) newErrors.adults = 'At least 1 adult is required';
    
    return newErrors;
  };

  const handleQuickCheckIn = async () => {
    if (!selectedRoom) {
      alert('Please select a room first');
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

    const bookingDataToSend = {
      guest: {
        first_name: 'Walk-in',
        last_name: 'Guest',
        email: 'walkin@example.com',
        phone: 'N/A',
      },
      room: selectedRoom.id,
      check_in: today,
      check_out: tomorrow,
      adults: 1,
      children: 0,
      total_nights: 1,
      total_amount: selectedRoom.base_price,
    };

    console.log('Quick check-in data:', bookingDataToSend);

    try {
      const booking = await createBooking.mutateAsync(bookingDataToSend);
      await checkIn.mutateAsync(booking.id);
      router.push('/bookings');
    } catch (error: any) {
      console.error('Quick check-in failed:', error);
      if (error.response?.data) {
        alert(JSON.stringify(error.response.data));
      }
    }
  };

  const handleFullCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoom) {
      alert('Please select a room');
      return;
    }

    // Validate all data
    const guestErrors = validateGuestData();
    const bookingErrors = validateBookingData();
    const allErrors = { ...guestErrors, ...bookingErrors };
    
    if (Object.keys(allErrors).length > 0) {
      setErrors(allErrors);
      return;
    }

    // Recalculate to be absolutely sure
    const start = new Date(bookingData.check_in);
    const end = new Date(bookingData.check_out);
    const nights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    const amount = nights * selectedRoom.base_price;

    const bookingDataToSend = {
      guest: {
        first_name: guestData.first_name.trim(),
        last_name: guestData.last_name.trim(),
        email: guestData.email.trim(),
        phone: guestData.phone.trim(),
        id_number: guestData.id_number || undefined,
        address: guestData.address || undefined,
      },
      room: selectedRoom.id,
      check_in: bookingData.check_in,
      check_out: bookingData.check_out,
      adults: bookingData.adults,
      children: bookingData.children,
      total_nights: nights,
      total_amount: amount,
      special_requests: bookingData.special_requests || undefined,
    };

    console.log('Sending booking data:', bookingDataToSend);

    try {
      const booking = await createBooking.mutateAsync(bookingDataToSend);
      await checkIn.mutateAsync(booking.id);
      router.push('/bookings');
    } catch (error: any) {
      console.error('Check-in failed:', error);
      if (error.response?.data) {
        // Show detailed error from server
        alert(JSON.stringify(error.response.data, null, 2));
      } else {
        alert('Check-in failed. Please try again.');
      }
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto pb-20">
        <div className="mb-6">
          <Link
            href="/bookings"
            className="inline-flex items-center text-gray-600 hover:text-red-600 mb-4"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Back to Bookings
          </Link>
          <h1 className="text-2xl font-bold text-dark-500">Guest Check-in</h1>
          <p className="text-sm text-gray-600">Check in a new guest</p>
        </div>

        {/* Quick Check-in Option */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-dark-500">Quick Check-in</h2>
              <p className="text-sm text-gray-600">For walk-in guests with no advance booking</p>
            </div>
            <button
              onClick={handleQuickCheckIn}
              disabled={!selectedRoom || createBooking.isPending}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {createBooking.isPending ? 'Processing...' : 'Quick Check-in'}
            </button>
          </div>
        </div>

        {/* Room Selection */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-dark-500 mb-4">1. Select Room</h2>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {availableRooms.map((room) => (
              <button
                key={room.id}
                onClick={() => setSelectedRoom(room)}
                className={`
                  p-4 rounded-lg border-2 text-left transition-all
                  ${selectedRoom?.id === room.id
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-200 hover:border-red-300'
                  }
                `}
              >
                <p className="font-semibold text-dark-500">Room {room.room_number}</p>
                <p className="text-sm text-gray-600 capitalize">
                  {room.room_type === 'standard' ? 'Standard Room' : 'Duplex Suite'}
                </p>
                <p className="text-lg font-bold text-red-600 mt-2">₦{room.base_price}</p>
              </button>
            ))}
          </div>

          {availableRooms.length === 0 && (
            <p className="text-center text-gray-500 py-4">No rooms available</p>
          )}
        </div>

        {/* Guest Information Form */}
        {selectedRoom && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-dark-500 mb-4">2. Guest Information</h2>
            
            <form onSubmit={handleFullCheckIn} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name *
                  </label>
                  <input
                    type="text"
                    value={guestData.first_name}
                    onChange={(e) => setGuestData({ ...guestData, first_name: e.target.value })}
                    className={`input-field ${errors.first_name ? 'border-red-500' : ''}`}
                  />
                  {errors.first_name && (
                    <p className="text-xs text-red-600 mt-1">{errors.first_name}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    value={guestData.last_name}
                    onChange={(e) => setGuestData({ ...guestData, last_name: e.target.value })}
                    className={`input-field ${errors.last_name ? 'border-red-500' : ''}`}
                  />
                  {errors.last_name && (
                    <p className="text-xs text-red-600 mt-1">{errors.last_name}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={guestData.email}
                    onChange={(e) => setGuestData({ ...guestData, email: e.target.value })}
                    className={`input-field ${errors.email ? 'border-red-500' : ''}`}
                  />
                  {errors.email && (
                    <p className="text-xs text-red-600 mt-1">{errors.email}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone *
                  </label>
                  <input
                    type="tel"
                    value={guestData.phone}
                    onChange={(e) => setGuestData({ ...guestData, phone: e.target.value })}
                    className={`input-field ${errors.phone ? 'border-red-500' : ''}`}
                  />
                  {errors.phone && (
                    <p className="text-xs text-red-600 mt-1">{errors.phone}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ID Number
                </label>
                <input
                  type="text"
                  value={guestData.id_number}
                  onChange={(e) => setGuestData({ ...guestData, id_number: e.target.value })}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <textarea
                  value={guestData.address}
                  onChange={(e) => setGuestData({ ...guestData, address: e.target.value })}
                  rows={2}
                  className="input-field"
                />
              </div>

              <h3 className="text-lg font-semibold text-dark-500 pt-4">3. Booking Details</h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Check-in Date *
                  </label>
                  <input
                    type="date"
                    value={bookingData.check_in}
                    onChange={(e) => setBookingData({ ...bookingData, check_in: e.target.value })}
                    className={`input-field ${errors.check_in ? 'border-red-500' : ''}`}
                  />
                  {errors.check_in && (
                    <p className="text-xs text-red-600 mt-1">{errors.check_in}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Check-out Date *
                  </label>
                  <input
                    type="date"
                    value={bookingData.check_out}
                    onChange={(e) => setBookingData({ ...bookingData, check_out: e.target.value })}
                    min={bookingData.check_in}
                    className={`input-field ${errors.check_out ? 'border-red-500' : ''}`}
                  />
                  {errors.check_out && (
                    <p className="text-xs text-red-600 mt-1">{errors.check_out}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Adults *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={bookingData.adults}
                    onChange={(e) => setBookingData({ ...bookingData, adults: parseInt(e.target.value) })}
                    className={`input-field ${errors.adults ? 'border-red-500' : ''}`}
                  />
                  {errors.adults && (
                    <p className="text-xs text-red-600 mt-1">{errors.adults}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Children
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={bookingData.children}
                    onChange={(e) => setBookingData({ ...bookingData, children: parseInt(e.target.value) })}
                    className="input-field"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Special Requests
                </label>
                <textarea
                  value={bookingData.special_requests}
                  onChange={(e) => setBookingData({ ...bookingData, special_requests: e.target.value })}
                  rows={2}
                  className="input-field"
                />
              </div>

              {/* Booking Summary */}
              {totalNights > 0 && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold text-dark-500 mb-3">Booking Summary</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Room:</span>
                      <span className="font-medium">Room {selectedRoom.room_number}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Nights:</span>
                      <span className="font-medium">{totalNights}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Price per night:</span>
                      <span className="font-medium">₦{selectedRoom.base_price}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold pt-2 border-t">
                      <span className="text-dark-500">Total:</span>
                      <span className="text-red-600">₦{totalAmount.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4">
                <Link
                  href="/bookings"
                  className="btn-secondary"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={createBooking.isPending || !totalNights}
                  className="btn-primary"
                >
                  {createBooking.isPending ? 'Processing...' : 'Complete Check-in'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </Layout>
  );
}