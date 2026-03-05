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
  CreditCardIcon,
  BanknotesIcon,
  CheckCircleIcon,
  ClockIcon,
  UserGroupIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';
import { useRooms } from '@/lib/api/hooks/useRooms';
import { useBooking, useCreateBooking, useCreateGuest, useCheckIn } from '@/lib/api/hooks/useBookings';
import Layout from '@/components/layout/Layout';
import toast from 'react-hot-toast';

export default function CheckInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roomId = searchParams.get('room');
  const bookingId = searchParams.get('booking');

  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card'>('cash');
  const [amountPaid, setAmountPaid] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Data fetching
  const { data: rooms, isLoading: roomsLoading } = useRooms({});
  const selectedRoom = rooms?.find(r => r.id === roomId);
  const { data: booking, isLoading: bookingLoading } = useBooking(bookingId || '');
  
  // Mutations
  const createGuest = useCreateGuest();
  const createBooking = useCreateBooking();
  const checkIn = useCheckIn();

  // Form state for new bookings
  const [guestData, setGuestData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
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

  // Calculate nights and total for new bookings
  useEffect(() => {
    if (selectedRoom && bookingData.check_in && bookingData.check_out) {
      const start = new Date(bookingData.check_in);
      const end = new Date(bookingData.check_out);
      const nights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      setTotalNights(nights > 0 ? nights : 0);
      setTotalAmount(nights > 0 ? nights * selectedRoom.base_price : 0);
    }
  }, [selectedRoom, bookingData.check_in, bookingData.check_out]);

  const calculateChange = () => {
    const paid = parseFloat(amountPaid) || 0;
    return (paid - totalAmount).toFixed(2);
  };

  const validateNewBookingForm = () => {
    const errors: Record<string, string> = {};
    
    if (!guestData.first_name.trim()) errors.first_name = 'First name is required';
    if (!guestData.last_name.trim()) errors.last_name = 'Last name is required';
    if (!guestData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(guestData.email)) {
      errors.email = 'Invalid email format';
    }
    if (!guestData.phone.trim()) errors.phone = 'Phone number is required';
    if (!bookingData.check_out) errors.check_out = 'Check-out date is required';
    
    return errors;
  };

  // Handle new booking check-in (from rooms page)
const handleNewBookingCheckIn = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (!selectedRoom) return;
  
  // Validate form
  const errors = validateNewBookingForm();
  if (Object.keys(errors).length > 0) {
    setFormErrors(errors);
    toast.error('Please fill in all required fields');
    return;
  }

  if (totalNights <= 0) {
    toast.error('Check-out date must be after check-in date');
    return;
  }

  if (paymentMethod === 'cash' && (!amountPaid || parseFloat(amountPaid) < totalAmount)) {
    toast.error('Amount paid must be at least the total amount');
    return;
  }

  setIsProcessing(true);

  try {
    // Step 1: Create guest
    console.log('📝 Step 1: Creating guest...');
    const guest = await createGuest.mutateAsync({
      first_name: guestData.first_name.trim(),
      last_name: guestData.last_name.trim(),
      email: guestData.email.trim(),
      phone: guestData.phone.trim(),
    });
    console.log('✅ Guest created:', guest);

    // Step 2: Create booking
    const bookingDataToSend = {
      guest: guest.id,
      room: selectedRoom.id,
      check_in: bookingData.check_in,
      check_out: bookingData.check_out,
      adults: bookingData.adults,
      children: bookingData.children,
      total_nights: totalNights,
      total_amount: totalAmount,
      special_requests: bookingData.special_requests || undefined,
      status: 'confirmed',
      payment_status: 'pending',
    };
    
    console.log('📝 Step 2: Creating booking with data:', bookingDataToSend);
    
    let booking;
    try {
      booking = await createBooking.mutateAsync(bookingDataToSend);
      console.log('✅ Booking creation response:', booking);
    } catch (bookingError) {
      console.error('❌ Booking creation failed:', bookingError);
      toast.error('Failed to create booking. Please try again.');
      setIsProcessing(false);
      return;
    }
    
    // Check if booking was created successfully
    if (!booking) {
      console.error('❌ No booking data returned');
      toast.error('Booking creation failed - no data returned');
      setIsProcessing(false);
      return;
    }
    
    if (!booking.id) {
      console.error('❌ Booking has no ID:', booking);
      toast.error('Booking created but no ID returned');
      setIsProcessing(false);
      return;
    }
    
    console.log('✅ Booking created with ID:', booking.id);

    // Step 3: Check in with payment
    console.log('📝 Step 3: Checking in booking:', booking.id);
    try {
      await checkIn.mutateAsync({
        id: booking.id,
        paymentData: {
          payment_method: paymentMethod,
          amount_paid: paymentMethod === 'cash' ? parseFloat(amountPaid) : undefined,
        },
      });
      console.log('✅ Check-in successful');
      toast.success('Guest checked in successfully!');
      router.push('/bookings');
    } catch (checkInError) {
      console.error('❌ Check-in failed but booking was created:', checkInError);
      toast.success('Booking created! Please check in manually from the bookings page.');
      router.push('/bookings');
    }
  } catch (error: any) {
    console.error('❌ Unexpected error:', error);
    toast.error('An unexpected error occurred');
  } finally {
    setIsProcessing(false);
  }
};
  // Handle existing booking check-in (from bookings page)
  const handleExistingBookingCheckIn = async () => {
    if (!booking) {
      toast.error('Booking not found');
      return;
    }

    if (paymentMethod === 'cash' && (!amountPaid || parseFloat(amountPaid) < (booking.total_amount || 0))) {
      toast.error('Amount paid must be at least the total amount');
      return;
    }

    setIsProcessing(true);

    try {
      await checkIn.mutateAsync({
        id: booking.id,
        paymentData: {
          payment_method: paymentMethod,
          amount_paid: paymentMethod === 'cash' ? parseFloat(amountPaid) : undefined,
        },
      });
      
      toast.success('Guest checked in successfully!');
      router.push('/bookings');
    } catch (error: any) {
      console.error('Check-in failed:', error);
      toast.error(error.response?.data?.error || 'Failed to check in');
    } finally {
      setIsProcessing(false);
    }
  };

  // Loading state
  if ((bookingId && bookingLoading) || (roomId && roomsLoading)) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto py-8 px-4">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-32 bg-gray-200 rounded-xl"></div>
            <div className="h-64 bg-gray-200 rounded-xl"></div>
          </div>
        </div>
      </Layout>
    );
  }

  // Existing Booking Flow
  if (bookingId && booking) {
    const guestName = booking.guest?.first_name || booking.guest_details?.first_name || 'Guest';
    const guestLastName = booking.guest?.last_name || booking.guest_details?.last_name || '';
    const guestEmail = booking.guest?.email || booking.guest_details?.email || '';
    const guestPhone = booking.guest?.phone || booking.guest_details?.phone || '';
    const roomNumber = booking.room?.room_number || booking.room_details?.room_number || 'N/A';

    return (
      <Layout>
        <div className="max-w-4xl mx-auto py-8 px-4">
          {/* Back button */}
          <Link 
            href="/bookings" 
            className="inline-flex items-center text-gray-600 hover:text-red-600 mb-6 group"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2 transition-transform group-hover:-translate-x-1" />
            Back to Bookings
          </Link>

          {/* Header */}
          <div className="bg-gradient-to-r from-red-600 to-red-500 rounded-xl p-6 text-white mb-6">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <CheckCircleIcon className="h-6 w-6" />
              Confirm Check-in
            </h1>
            <p className="text-red-100 mt-1">Review booking details and complete check-in</p>
          </div>

          {/* Booking Summary Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
            <div className="bg-gray-50 px-6 py-4 border-b">
              <h2 className="font-semibold text-gray-900">Booking Summary</h2>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Guest Info */}
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Guest Information</h3>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <UserIcon className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{guestName} {guestLastName}</p>
                      <p className="text-sm text-gray-600">{guestEmail}</p>
                      <p className="text-sm text-gray-600">{guestPhone}</p>
                    </div>
                  </div>
                </div>

                {/* Room Info */}
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Room Details</h3>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <HomeIcon className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Room {roomNumber}</p>
                      <p className="text-sm text-gray-600 capitalize">
                        {booking.room?.room_type === 'standard' ? 'Standard Room' : 'Duplex Suite'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Dates */}
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Stay Details</h3>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <CalendarIcon className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">
                        {new Date(booking.check_in).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })} - {new Date(booking.check_out).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </p>
                      <p className="text-sm text-gray-600">{booking.total_nights} nights</p>
                    </div>
                  </div>
                </div>

                {/* Guests */}
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Guests</h3>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <UserGroupIcon className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">{booking.adults} Adults, {booking.children} Children</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Total Amount */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-medium text-gray-900">Total Amount</span>
                  <span className="text-3xl font-bold text-red-600">₦{booking.total_amount?.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b">
              <h2 className="font-semibold text-gray-900">Payment</h2>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                {/* Payment Method */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Select Payment Method</label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => setPaymentMethod('cash')}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        paymentMethod === 'cash' 
                          ? 'border-red-500 bg-red-50' 
                          : 'border-gray-200 hover:border-red-300 hover:bg-gray-50'
                      }`}
                    >
                      <BanknotesIcon className={`h-8 w-8 mx-auto mb-2 ${paymentMethod === 'cash' ? 'text-red-600' : 'text-gray-500'}`} />
                      <span className={`block text-sm font-medium ${paymentMethod === 'cash' ? 'text-red-600' : 'text-gray-700'}`}>
                        Cash
                      </span>
                    </button>
                    <button
                      onClick={() => setPaymentMethod('card')}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        paymentMethod === 'card' 
                          ? 'border-red-500 bg-red-50' 
                          : 'border-gray-200 hover:border-red-300 hover:bg-gray-50'
                      }`}
                    >
                      <CreditCardIcon className={`h-8 w-8 mx-auto mb-2 ${paymentMethod === 'card' ? 'text-red-600' : 'text-gray-500'}`} />
                      <span className={`block text-sm font-medium ${paymentMethod === 'card' ? 'text-red-600' : 'text-gray-700'}`}>
                        Card
                      </span>
                    </button>
                  </div>
                </div>

                {/* Cash Payment */}
                {paymentMethod === 'cash' && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Amount Paid</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₦</span>
                      <input
                        type="number"
                        value={amountPaid}
                        onChange={(e) => setAmountPaid(e.target.value)}
                        min={booking.total_amount}
                        step="100"
                        className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="Enter amount"
                      />
                    </div>
                    {amountPaid && parseFloat(amountPaid) >= (booking.total_amount || 0) && (
                      <div className="mt-3 p-3 bg-green-50 rounded-lg">
                        <p className="text-sm text-gray-600">Change:</p>
                        <p className="text-xl font-bold text-green-600">
                          ₦{(parseFloat(amountPaid) - (booking.total_amount || 0)).toFixed(2)}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Card Payment Note */}
                {paymentMethod === 'card' && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800 flex items-center gap-2">
                      <CreditCardIcon className="h-5 w-5" />
                      Please process card payment on the terminal
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <Link
                    href={`/bookings/${booking.id}`}
                    className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-center font-medium"
                  >
                    Cancel
                  </Link>
                  <button
                    onClick={handleExistingBookingCheckIn}
                    disabled={isProcessing}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-lg hover:from-green-700 hover:to-green-600 disabled:opacity-50 transition-all font-medium flex items-center justify-center gap-2"
                  >
                    {isProcessing ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CheckCircleIcon className="h-5 w-5" />
                        Confirm & Check In
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // New Booking Flow (from rooms page)
  if (!selectedRoom) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto py-16 text-center">
          <div className="bg-red-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
            <HomeIcon className="h-10 w-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Room Selected</h2>
          <p className="text-gray-600 mb-6">Please select a room first to start check-in.</p>
          <Link 
            href="/rooms" 
            className="inline-flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
          >
            Browse Available Rooms
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* Back button */}
        <Link 
          href="/rooms" 
          className="inline-flex items-center text-gray-600 hover:text-red-600 mb-6 group"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2 transition-transform group-hover:-translate-x-1" />
          Back to Rooms
        </Link>

        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-500 rounded-xl p-6 text-white mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <HomeIcon className="h-6 w-6" />
            Check-in: Room {selectedRoom.room_number}
          </h1>
          <p className="text-red-100 mt-1">
            {selectedRoom.room_type === 'standard' ? 'Standard Room' : 'Duplex Suite'} • ₦{selectedRoom.base_price}/night
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center flex-1">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step >= 1 ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              1
            </div>
            <div className={`flex-1 h-1 mx-2 ${step >= 2 ? 'bg-red-600' : 'bg-gray-200'}`} />
          </div>
          <div className="flex items-center flex-1">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step >= 2 ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              2
            </div>
            <div className={`flex-1 h-1 mx-2 ${step >= 3 ? 'bg-red-600' : 'bg-gray-200'}`} />
          </div>
          <div className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step >= 3 ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              3
            </div>
          </div>
        </div>

        {/* Main Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <form onSubmit={handleNewBookingCheckIn}>
            {/* Step 1: Guest Information */}
            <div className={`p-6 ${step !== 1 ? 'hidden' : ''}`}>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <UserIcon className="h-5 w-5 text-red-600" />
                Guest Information
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={guestData.first_name}
                    onChange={(e) => {
                      setGuestData({ ...guestData, first_name: e.target.value });
                      setFormErrors({ ...formErrors, first_name: '' });
                    }}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                      formErrors.first_name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="John"
                  />
                  {formErrors.first_name && (
                    <p className="text-xs text-red-600 mt-1">{formErrors.first_name}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={guestData.last_name}
                    onChange={(e) => {
                      setGuestData({ ...guestData, last_name: e.target.value });
                      setFormErrors({ ...formErrors, last_name: '' });
                    }}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                      formErrors.last_name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Doe"
                  />
                  {formErrors.last_name && (
                    <p className="text-xs text-red-600 mt-1">{formErrors.last_name}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={guestData.email}
                    onChange={(e) => {
                      setGuestData({ ...guestData, email: e.target.value });
                      setFormErrors({ ...formErrors, email: '' });
                    }}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                      formErrors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="john@example.com"
                  />
                  {formErrors.email && (
                    <p className="text-xs text-red-600 mt-1">{formErrors.email}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={guestData.phone}
                    onChange={(e) => {
                      setGuestData({ ...guestData, phone: e.target.value });
                      setFormErrors({ ...formErrors, phone: '' });
                    }}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                      formErrors.phone ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="+234 123 456 7890"
                  />
                  {formErrors.phone && (
                    <p className="text-xs text-red-600 mt-1">{formErrors.phone}</p>
                  )}
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Continue to Booking Details
                </button>
              </div>
            </div>

            {/* Step 2: Booking Details */}
            <div className={`p-6 ${step !== 2 ? 'hidden' : ''}`}>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <CalendarIcon className="h-5 w-5 text-red-600" />
                Booking Details
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Check-in Date
                  </label>
                  <input
                    type="date"
                    value={bookingData.check_in}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Check-out Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={bookingData.check_out}
                    onChange={(e) => {
                      setBookingData({ ...bookingData, check_out: e.target.value });
                      setFormErrors({ ...formErrors, check_out: '' });
                    }}
                    min={bookingData.check_in}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                      formErrors.check_out ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {formErrors.check_out && (
                    <p className="text-xs text-red-600 mt-1">{formErrors.check_out}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Adults
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={bookingData.adults}
                    onChange={(e) => setBookingData({ ...bookingData, adults: parseInt(e.target.value) || 1 })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Children
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={bookingData.children}
                    onChange={(e) => setBookingData({ ...bookingData, children: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Special Requests
                  </label>
                  <textarea
                    value={bookingData.special_requests}
                    onChange={(e) => setBookingData({ ...bookingData, special_requests: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Any special requests or requirements..."
                  />
                </div>
              </div>

              {/* Booking Summary */}
              {totalNights > 0 && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-3">Booking Summary</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Nights:</span>
                      <span className="font-medium">{totalNights}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Price per night:</span>
                      <span className="font-medium">₦{selectedRoom.base_price}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold pt-2 border-t">
                      <span className="text-gray-900">Total:</span>
                      <span className="text-red-600">₦{totalAmount.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-6 flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Continue to Payment
                </button>
              </div>
            </div>

            {/* Step 3: Payment */}
            <div className={`p-6 ${step !== 3 ? 'hidden' : ''}`}>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <CreditCardIcon className="h-5 w-5 text-red-600" />
                Payment
              </h2>

              <div className="space-y-6">
                {/* Payment Method */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Select Payment Method</label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('cash')}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        paymentMethod === 'cash' 
                          ? 'border-red-500 bg-red-50' 
                          : 'border-gray-200 hover:border-red-300 hover:bg-gray-50'
                      }`}
                    >
                      <BanknotesIcon className={`h-8 w-8 mx-auto mb-2 ${paymentMethod === 'cash' ? 'text-red-600' : 'text-gray-500'}`} />
                      <span className={`block text-sm font-medium ${paymentMethod === 'cash' ? 'text-red-600' : 'text-gray-700'}`}>
                        Cash
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('card')}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        paymentMethod === 'card' 
                          ? 'border-red-500 bg-red-50' 
                          : 'border-gray-200 hover:border-red-300 hover:bg-gray-50'
                      }`}
                    >
                      <CreditCardIcon className={`h-8 w-8 mx-auto mb-2 ${paymentMethod === 'card' ? 'text-red-600' : 'text-gray-500'}`} />
                      <span className={`block text-sm font-medium ${paymentMethod === 'card' ? 'text-red-600' : 'text-gray-700'}`}>
                        Card
                      </span>
                    </button>
                  </div>
                </div>

                {/* Cash Payment */}
                {paymentMethod === 'cash' && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Amount Paid</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₦</span>
                      <input
                        type="number"
                        value={amountPaid}
                        onChange={(e) => setAmountPaid(e.target.value)}
                        min={totalAmount}
                        step="100"
                        className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="Enter amount"
                      />
                    </div>
                    {amountPaid && parseFloat(amountPaid) >= totalAmount && (
                      <div className="mt-3 p-3 bg-green-50 rounded-lg">
                        <p className="text-sm text-gray-600">Change:</p>
                        <p className="text-xl font-bold text-green-600">₦{calculateChange()}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Card Payment Note */}
                {paymentMethod === 'card' && (
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800 flex items-center gap-2">
                      <CreditCardIcon className="h-5 w-5" />
                      Please process card payment on the terminal
                    </p>
                  </div>
                )}

                {/* Summary */}
                <div className="bg-gradient-to-r from-red-50 to-amber-50 rounded-lg p-4 border border-red-200">
                  <h3 className="font-medium text-gray-900 mb-3">Payment Summary</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Room:</span>
                      <span className="font-medium">Room {selectedRoom.room_number}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Nights:</span>
                      <span className="font-medium">{totalNights}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold pt-2 border-t border-red-200">
                      <span className="text-gray-900">Total:</span>
                      <span className="text-red-600">₦{totalAmount.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-lg hover:from-green-700 hover:to-green-600 disabled:opacity-50 transition-all font-medium flex items-center justify-center gap-2"
                  >
                    {isProcessing ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CheckCircleIcon className="h-5 w-5" />
                        Complete Check-in & Pay
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}