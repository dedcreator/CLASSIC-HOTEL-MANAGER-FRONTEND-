// frontend/app/checkin/page.tsx - Simplified cashless version
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
  CheckCircleIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  LockClosedIcon,
  KeyIcon,
  ClipboardDocumentCheckIcon,
  ClipboardDocumentIcon,
} from '@heroicons/react/24/outline';
import { useRooms } from '@/lib/api/hooks/useRooms';
import { useBooking, useCreateBooking, useCreateGuest, useCheckIn } from '@/lib/api/hooks/useBookings';
import { RoomAccessCode } from '@/lib/api/types';
import Layout from '@/components/layout/Layout';
import toast from 'react-hot-toast';

export default function CheckInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roomId = searchParams.get('room');
  const bookingId = searchParams.get('booking');

  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [paymentLink, setPaymentLink] = useState<string>('');
  const [completedAccessCode, setCompletedAccessCode] = useState<RoomAccessCode | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'cash' | 'korapay'>('cash');
  const [codeCopied, setCodeCopied] = useState(false);

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

  // Handle new booking check-in (cashless - Korapay only)
  const handleNewBookingCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedRoom) return;
    
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

    setIsProcessing(true);

    try {
      // Step 1: Create guest
      const guest = await createGuest.mutateAsync({
        first_name: guestData.first_name.trim(),
        last_name: guestData.last_name.trim(),
        email: guestData.email.trim(),
        phone: guestData.phone.trim(),
      });

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
      
      const booking = await createBooking.mutateAsync(bookingDataToSend);
      
      if (!booking || !booking.id) {
        throw new Error('Booking creation failed');
      }

      // Step 3: Check in with selected payment method
      const checkInResult = await checkIn.mutateAsync({
        id: booking.id,
        paymentData: {
          payment_method: selectedPaymentMethod,
          amount_paid: totalAmount,
        },
      });
      
      if (checkInResult.requires_payment && checkInResult.payment_link) {
        window.open(checkInResult.payment_link, '_blank');
        toast.success('Booking created! Please complete payment to check in.');
        setTimeout(() => {
          router.push('/bookings');
        }, 2000);
      } else {
        toast.success('Guest checked in successfully!');
        if (checkInResult.access_code) {
          setCompletedAccessCode(checkInResult.access_code);
        } else {
          router.push('/bookings');
        }
      }
      
    } catch (error: any) {
      console.error('Error:', error);
      toast.error(error.message || 'An error occurred');
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

    setIsProcessing(true);

    try {
      const result = await checkIn.mutateAsync({
        id: booking.id,
        paymentData: {
          payment_method: selectedPaymentMethod,
          amount_paid: booking.total_amount,
        },
      });
      
      if (result.requires_payment && result.payment_link) {
        window.open(result.payment_link, '_blank');
        toast.success('Please complete payment to check in.');
        setTimeout(() => {
          router.push('/bookings');
        }, 2000);
      } else {
        toast.success('Guest checked in successfully!');
        if (result.access_code) {
          setCompletedAccessCode(result.access_code);
        } else {
          router.push('/bookings');
        }
      }
    } catch (error: any) {
      console.error('Check-in failed:', error);
      toast.error(error.response?.data?.error || error.message || 'Failed to check in');
    } finally {
      setIsProcessing(false);
    }
  };

  // Render Access Code Screen upon completion
  if (completedAccessCode) {
    return (
      <Layout>
        <div className="max-w-md mx-auto py-12 px-4 text-center">
          <div className="bg-white border border-[#DDD5C4] rounded-2xl p-6 shadow-xl space-y-4">
            <div className="w-14 h-14 rounded-full bg-[#E8F5E9] text-[#2E7D32] mx-auto flex items-center justify-center">
              <CheckCircleIcon className="h-8 w-8" />
            </div>
            <h2 className="font-display text-2xl font-medium text-[#2A2622]">Check-in Confirmed</h2>
            <p className="text-xs text-[#5B564B]">
              Room access code issued. Valid for the stay period + 10 minutes grace period.
            </p>
            <div className="bg-[#FAF6EF] border-2 border-[#C9A468] rounded-xl p-5">
              <span className="text-[11px] font-semibold text-[#8A8377] uppercase tracking-wider block mb-1">
                Active Check-in Key
              </span>
              <div className="font-mono text-3xl font-bold text-[#16302B] tracking-wider my-1 select-all">
                {completedAccessCode.code}
              </div>
              <p className="text-xs text-[#8A8377] mt-1">
                Expires: {new Date(completedAccessCode.valid_until).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(completedAccessCode.code);
                  setCodeCopied(true);
                  toast.success('Code copied to clipboard');
                  setTimeout(() => setCodeCopied(false), 2000);
                }}
                className="flex-1 py-2.5 bg-[#16302B] hover:bg-[#1D3B34] text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-1.5"
              >
                {codeCopied ? (
                  <>
                    <ClipboardDocumentCheckIcon className="h-4 w-4 text-[#A5D6A7]" />
                    Copied
                  </>
                ) : (
                  <>
                    <ClipboardDocumentIcon className="h-4 w-4" />
                    Copy Code
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => router.push('/bookings')}
                className="px-5 py-2.5 border border-[#DDD5C4] hover:bg-[#F7F1E4] text-sm text-[#2A2622] font-medium rounded-lg transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

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
    return (
      <Layout>
        <div className="max-w-4xl mx-auto py-8 px-4">
          <Link href="/bookings" className="inline-flex items-center text-gray-600 hover:text-[#16302B] mb-6 group">
            <ArrowLeftIcon className="h-4 w-4 mr-2 transition-transform group-hover:-translate-x-1" />
            Back to Bookings
          </Link>

          <div className="bg-gradient-to-r from-[#16302B] to-[#1D3B34] rounded-xl p-6 text-white mb-6">
            <h1 className="font-display text-2xl font-medium flex items-center gap-2">
              <CheckCircleIcon className="h-6 w-6" />
              Confirm Check-in
            </h1>
            <p className="text-[#B9C4B9] mt-1">Cashless check-in via Korapay</p>
          </div>

          {/* Booking Summary */}
          <div className="bg-white rounded-xl shadow-sm border border-[#DDD5C4] overflow-hidden mb-6">
            <div className="bg-[#F7F1E4] px-6 py-4 border-b border-[#DDD5C4]">
              <h2 className="font-display font-medium text-[#2A2622]">Booking Summary</h2>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-body text-sm font-medium text-[#8A8377] uppercase tracking-wider">Guest</h3>
                  <div className="mt-2">
                    <p className="font-body font-medium text-[#2A2622]">{booking.guest_name}</p>
                    <p className="font-body text-sm text-[#5B564B]">{booking.guest_details?.email}</p>
                    <p className="font-body text-sm text-[#5B564B]">{booking.guest_details?.phone}</p>
                  </div>
                </div>
                <div>
                  <h3 className="font-body text-sm font-medium text-[#8A8377] uppercase tracking-wider">Room</h3>
                  <div className="mt-2">
                    <p className="font-body font-medium text-[#2A2622]">Room {booking.room_number}</p>
                    <p className="font-body text-sm text-[#5B564B] capitalize">{booking.room_details?.room_type}</p>
                  </div>
                </div>
                <div>
                  <h3 className="font-body text-sm font-medium text-[#8A8377] uppercase tracking-wider">Stay</h3>
                  <div className="mt-2">
                    <p className="font-body text-sm text-[#5B564B]">
                      {new Date(booking.check_in).toLocaleDateString()} - {new Date(booking.check_out).toLocaleDateString()}
                    </p>
                    <p className="font-body text-sm text-[#5B564B]">{booking.total_nights} nights</p>
                  </div>
                </div>
                <div>
                  <h3 className="font-body text-sm font-medium text-[#8A8377] uppercase tracking-wider">Guests</h3>
                  <div className="mt-2">
                    <p className="font-body text-sm text-[#5B564B]">{booking.adults} Adults, {booking.children} Children</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-[#DDD5C4]">
                <div className="flex justify-between items-center">
                  <span className="font-body text-lg font-medium text-[#2A2622]">Total Amount</span>
                  <span className="font-display text-3xl font-medium text-[#16302B]">₦{booking.total_amount?.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Section - Cashless */}
          <div className="bg-white rounded-xl shadow-sm border border-[#DDD5C4] overflow-hidden">
            <div className="bg-[#F7F1E4] px-6 py-4 border-b border-[#DDD5C4]">
              <h2 className="font-display font-medium text-[#2A2622]">Payment</h2>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedPaymentMethod('cash')}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      selectedPaymentMethod === 'cash'
                        ? 'border-[#16302B] bg-[#FAF6EF] ring-2 ring-[#16302B]/20'
                        : 'border-[#DDD5C4] hover:border-[#8A8377] bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <CreditCardIcon className="h-5 w-5 text-[#16302B]" />
                      <span className="font-display font-medium text-sm text-[#2A2622]">Front Desk Settlement</span>
                    </div>
                    <p className="text-xs text-[#5B564B]">Cash or Hotel POS terminal at desk</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedPaymentMethod('korapay')}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      selectedPaymentMethod === 'korapay'
                        ? 'border-[#16302B] bg-[#FAF6EF] ring-2 ring-[#16302B]/20'
                        : 'border-[#DDD5C4] hover:border-[#8A8377] bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <LockClosedIcon className="h-5 w-5 text-[#1E40AF]" />
                      <span className="font-display font-medium text-sm text-[#2A2622]">Korapay Online</span>
                    </div>
                    <p className="text-xs text-[#5B564B]">Direct card link or bank transfer</p>
                  </button>
                </div>

                <div className="flex gap-3 pt-4">
                  <Link
                    href={`/bookings/${booking.id}`}
                    className="flex-1 px-6 py-3 border border-[#DDD5C4] rounded-lg text-[#5B564B] hover:bg-[#F7F1E4] transition-colors text-center font-body font-medium"
                  >
                    Cancel
                  </Link>
                  <button
                    onClick={handleExistingBookingCheckIn}
                    disabled={isProcessing}
                    className="flex-1 px-6 py-3 bg-[#16302B] text-[#F7F1E4] rounded-lg hover:bg-[#1D3B34] disabled:opacity-50 transition-all font-body font-medium flex items-center justify-center gap-2"
                  >
                    {isProcessing ? (
                      <>
                        <div className="w-5 h-5 border-2 border-[#F7F1E4] border-t-transparent rounded-full animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CreditCardIcon className="h-5 w-5" />
                        Pay & Check In
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
          <div className="bg-[#F7F1E4] rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
            <HomeIcon className="h-10 w-10 text-[#8A8377]" />
          </div>
          <h2 className="font-display text-2xl font-medium text-[#2A2622] mb-2">No Room Selected</h2>
          <p className="font-body text-[#8A8377] mb-6">Please select a room first to start check-in.</p>
          <Link 
            href="/rooms" 
            className="inline-flex items-center gap-2 bg-[#16302B] text-[#F7F1E4] px-6 py-3 rounded-lg hover:bg-[#1D3B34] transition-colors font-body font-medium"
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
        <Link href="/rooms" className="inline-flex items-center text-[#8A8377] hover:text-[#16302B] mb-6 group">
          <ArrowLeftIcon className="h-4 w-4 mr-2 transition-transform group-hover:-translate-x-1" />
          Back to Rooms
        </Link>

        <div className="bg-gradient-to-r from-[#16302B] to-[#1D3B34] rounded-xl p-6 text-white mb-6">
          <h1 className="font-display text-2xl font-medium flex items-center gap-2">
            <HomeIcon className="h-6 w-6" />
            Check-in: Room {selectedRoom.room_number}
          </h1>
          <p className="text-[#B9C4B9] mt-1">
            {selectedRoom.room_type} • ₦{selectedRoom.base_price}/night
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center flex-1">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-display ${
              step >= 1 ? 'bg-[#16302B] text-[#F7F1E4]' : 'bg-[#F7F1E4] text-[#8A8377]'
            }`}>
              1
            </div>
            <div className={`flex-1 h-1 mx-2 ${step >= 2 ? 'bg-[#16302B]' : 'bg-[#DDD5C4]'}`} />
          </div>
          <div className="flex items-center flex-1">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-display ${
              step >= 2 ? 'bg-[#16302B] text-[#F7F1E4]' : 'bg-[#F7F1E4] text-[#8A8377]'
            }`}>
              2
            </div>
            <div className={`flex-1 h-1 mx-2 ${step >= 3 ? 'bg-[#16302B]' : 'bg-[#DDD5C4]'}`} />
          </div>
          <div className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-display ${
              step >= 3 ? 'bg-[#16302B] text-[#F7F1E4]' : 'bg-[#F7F1E4] text-[#8A8377]'
            }`}>
              3
            </div>
          </div>
        </div>

        {/* Main Form */}
        <div className="bg-white rounded-xl shadow-sm border border-[#DDD5C4] overflow-hidden">
          <form onSubmit={handleNewBookingCheckIn}>
            {/* Step 1: Guest Information */}
            <div className={`p-6 ${step !== 1 ? 'hidden' : ''}`}>
              <h2 className="font-display text-lg font-medium text-[#2A2622] mb-4 flex items-center gap-2">
                <UserIcon className="h-5 w-5 text-[#C9A468]" />
                Guest Information
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="font-body text-sm font-medium text-[#5B564B] mb-1 block">
                    First Name <span className="text-[#C62828]">*</span>
                  </label>
                  <input
                    type="text"
                    value={guestData.first_name}
                    onChange={(e) => {
                      setGuestData({ ...guestData, first_name: e.target.value });
                      setFormErrors({ ...formErrors, first_name: '' });
                    }}
                    className={`font-body w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#C9A468] focus:border-transparent bg-[#FAF6EF] ${
                      formErrors.first_name ? 'border-[#C62828]' : 'border-[#DDD5C4]'
                    }`}
                    placeholder="John"
                  />
                  {formErrors.first_name && (
                    <p className="font-body text-xs text-[#C62828] mt-1">{formErrors.first_name}</p>
                  )}
                </div>
                <div>
                  <label className="font-body text-sm font-medium text-[#5B564B] mb-1 block">
                    Last Name <span className="text-[#C62828]">*</span>
                  </label>
                  <input
                    type="text"
                    value={guestData.last_name}
                    onChange={(e) => {
                      setGuestData({ ...guestData, last_name: e.target.value });
                      setFormErrors({ ...formErrors, last_name: '' });
                    }}
                    className={`font-body w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#C9A468] focus:border-transparent bg-[#FAF6EF] ${
                      formErrors.last_name ? 'border-[#C62828]' : 'border-[#DDD5C4]'
                    }`}
                    placeholder="Doe"
                  />
                  {formErrors.last_name && (
                    <p className="font-body text-xs text-[#C62828] mt-1">{formErrors.last_name}</p>
                  )}
                </div>
                <div>
                  <label className="font-body text-sm font-medium text-[#5B564B] mb-1 block">
                    Email <span className="text-[#C62828]">*</span>
                  </label>
                  <input
                    type="email"
                    value={guestData.email}
                    onChange={(e) => {
                      setGuestData({ ...guestData, email: e.target.value });
                      setFormErrors({ ...formErrors, email: '' });
                    }}
                    className={`font-body w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#C9A468] focus:border-transparent bg-[#FAF6EF] ${
                      formErrors.email ? 'border-[#C62828]' : 'border-[#DDD5C4]'
                    }`}
                    placeholder="john@example.com"
                  />
                  {formErrors.email && (
                    <p className="font-body text-xs text-[#C62828] mt-1">{formErrors.email}</p>
                  )}
                </div>
                <div>
                  <label className="font-body text-sm font-medium text-[#5B564B] mb-1 block">
                    Phone <span className="text-[#C62828]">*</span>
                  </label>
                  <input
                    type="tel"
                    value={guestData.phone}
                    onChange={(e) => {
                      setGuestData({ ...guestData, phone: e.target.value });
                      setFormErrors({ ...formErrors, phone: '' });
                    }}
                    className={`font-body w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#C9A468] focus:border-transparent bg-[#FAF6EF] ${
                      formErrors.phone ? 'border-[#C62828]' : 'border-[#DDD5C4]'
                    }`}
                    placeholder="+234 123 456 7890"
                  />
                  {formErrors.phone && (
                    <p className="font-body text-xs text-[#C62828] mt-1">{formErrors.phone}</p>
                  )}
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="font-body px-6 py-2 bg-[#16302B] text-[#F7F1E4] rounded-lg hover:bg-[#1D3B34] transition-colors"
                >
                  Continue
                </button>
              </div>
            </div>

            {/* Step 2: Booking Details */}
            <div className={`p-6 ${step !== 2 ? 'hidden' : ''}`}>
              <h2 className="font-display text-lg font-medium text-[#2A2622] mb-4 flex items-center gap-2">
                <CalendarIcon className="h-5 w-5 text-[#C9A468]" />
                Booking Details
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="font-body text-sm font-medium text-[#5B564B] mb-1 block">
                    Check-in Date
                  </label>
                  <input
                    type="date"
                    value={bookingData.check_in}
                    className="font-body w-full px-4 py-2 border border-[#DDD5C4] rounded-lg bg-[#F7F1E4] text-[#5B564B]"
                    readOnly
                  />
                </div>
                <div>
                  <label className="font-body text-sm font-medium text-[#5B564B] mb-1 block">
                    Check-out Date <span className="text-[#C62828]">*</span>
                  </label>
                  <input
                    type="date"
                    value={bookingData.check_out}
                    onChange={(e) => {
                      setBookingData({ ...bookingData, check_out: e.target.value });
                      setFormErrors({ ...formErrors, check_out: '' });
                    }}
                    min={bookingData.check_in}
                    className={`font-body w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#C9A468] focus:border-transparent bg-[#FAF6EF] ${
                      formErrors.check_out ? 'border-[#C62828]' : 'border-[#DDD5C4]'
                    }`}
                  />
                  {formErrors.check_out && (
                    <p className="font-body text-xs text-[#C62828] mt-1">{formErrors.check_out}</p>
                  )}
                </div>
                <div>
                  <label className="font-body text-sm font-medium text-[#5B564B] mb-1 block">
                    Adults
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={bookingData.adults}
                    onChange={(e) => setBookingData({ ...bookingData, adults: parseInt(e.target.value) || 1 })}
                    className="font-body w-full px-4 py-2 border border-[#DDD5C4] rounded-lg focus:ring-2 focus:ring-[#C9A468] focus:border-transparent bg-[#FAF6EF]"
                  />
                </div>
                <div>
                  <label className="font-body text-sm font-medium text-[#5B564B] mb-1 block">
                    Children
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={bookingData.children}
                    onChange={(e) => setBookingData({ ...bookingData, children: parseInt(e.target.value) || 0 })}
                    className="font-body w-full px-4 py-2 border border-[#DDD5C4] rounded-lg focus:ring-2 focus:ring-[#C9A468] focus:border-transparent bg-[#FAF6EF]"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="font-body text-sm font-medium text-[#5B564B] mb-1 block">
                    Special Requests
                  </label>
                  <textarea
                    value={bookingData.special_requests}
                    onChange={(e) => setBookingData({ ...bookingData, special_requests: e.target.value })}
                    rows={3}
                    className="font-body w-full px-4 py-2 border border-[#DDD5C4] rounded-lg focus:ring-2 focus:ring-[#C9A468] focus:border-transparent bg-[#FAF6EF]"
                    placeholder="Any special requests..."
                  />
                </div>
              </div>

              {/* Booking Summary */}
              {totalNights > 0 && (
                <div className="mt-6 p-4 bg-[#F7F1E4] rounded-lg border border-[#DDD5C4]">
                  <h3 className="font-display font-medium text-[#2A2622] mb-3">Booking Summary</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between font-body text-sm">
                      <span className="text-[#5B564B]">Nights:</span>
                      <span className="font-medium text-[#2A2622]">{totalNights}</span>
                    </div>
                    <div className="flex justify-between font-body text-sm">
                      <span className="text-[#5B564B]">Price per night:</span>
                      <span className="font-medium text-[#2A2622]">₦{selectedRoom.base_price}</span>
                    </div>
                    <div className="flex justify-between font-body text-lg font-medium pt-2 border-t border-[#DDD5C4]">
                      <span className="text-[#2A2622]">Total:</span>
                      <span className="text-[#16302B]">₦{totalAmount.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-6 flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="font-body px-6 py-2 border border-[#DDD5C4] rounded-lg text-[#5B564B] hover:bg-[#F7F1E4] transition-colors"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="font-body px-6 py-2 bg-[#16302B] text-[#F7F1E4] rounded-lg hover:bg-[#1D3B34] transition-colors"
                >
                  Continue to Payment
                </button>
              </div>
            </div>

            {/* Step 3: Payment - Cashless */}
            <div className={`p-6 ${step !== 3 ? 'hidden' : ''}`}>
              <h2 className="font-display text-lg font-medium text-[#2A2622] mb-4 flex items-center gap-2">
                <CreditCardIcon className="h-5 w-5 text-[#C9A468]" />
                Payment
              </h2>

              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedPaymentMethod('cash')}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      selectedPaymentMethod === 'cash'
                        ? 'border-[#16302B] bg-[#FAF6EF] ring-2 ring-[#16302B]/20'
                        : 'border-[#DDD5C4] hover:border-[#8A8377] bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <CreditCardIcon className="h-5 w-5 text-[#16302B]" />
                      <span className="font-display font-medium text-sm text-[#2A2622]">Front Desk Settlement</span>
                    </div>
                    <p className="text-xs text-[#5B564B]">Cash or Hotel POS terminal at desk</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedPaymentMethod('korapay')}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      selectedPaymentMethod === 'korapay'
                        ? 'border-[#16302B] bg-[#FAF6EF] ring-2 ring-[#16302B]/20'
                        : 'border-[#DDD5C4] hover:border-[#8A8377] bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <LockClosedIcon className="h-5 w-5 text-[#1E40AF]" />
                      <span className="font-display font-medium text-sm text-[#2A2622]">Korapay Online</span>
                    </div>
                    <p className="text-xs text-[#5B564B]">Direct card link or bank transfer</p>
                  </button>
                </div>

                {/* Summary */}
                <div className="bg-gradient-to-r from-[#F7F1E4] to-[#FAF6EF] rounded-lg p-4 border border-[#DDD5C4]">
                  <h3 className="font-display font-medium text-[#2A2622] mb-3">Payment Summary</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between font-body text-sm">
                      <span className="text-[#5B564B]">Room:</span>
                      <span className="font-medium text-[#2A2622]">Room {selectedRoom.room_number}</span>
                    </div>
                    <div className="flex justify-between font-body text-sm">
                      <span className="text-[#5B564B]">Nights:</span>
                      <span className="font-medium text-[#2A2622]">{totalNights}</span>
                    </div>
                    <div className="flex justify-between font-body text-lg font-medium pt-2 border-t border-[#DDD5C4]">
                      <span className="text-[#2A2622]">Total:</span>
                      <span className="text-[#16302B]">₦{totalAmount.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="flex-1 font-body px-6 py-3 border border-[#DDD5C4] rounded-lg text-[#5B564B] hover:bg-[#F7F1E4] transition-colors"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="flex-1 font-body px-6 py-3 bg-[#16302B] text-[#F7F1E4] rounded-lg hover:bg-[#1D3B34] disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                  >
                    {isProcessing ? (
                      <>
                        <div className="w-5 h-5 border-2 border-[#F7F1E4] border-t-transparent rounded-full animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CreditCardIcon className="h-5 w-5" />
                        Pay & Check In
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