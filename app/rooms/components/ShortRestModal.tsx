// frontend/app/rooms/components/ShortRestModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  XMarkIcon, 
  ClockIcon, 
  PhoneIcon, 
  EnvelopeIcon,
  BanknotesIcon,
  CreditCardIcon,
  CheckCircleIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import { useCreateGuest, useCreateBooking, useCheckIn, useSearchGuests } from '@/lib/api/hooks/useBookings';
import toast from 'react-hot-toast';

interface ShortRestModalProps {
  room: any;
  onClose: () => void;
}

export default function ShortRestModal({ room, onClose }: ShortRestModalProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchMode, setSearchMode] = useState<'search' | 'new'>('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGuest, setSelectedGuest] = useState<any>(null);
  
  // Guest details for new guests
  const [guestData, setGuestData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
  });

  // Short rest options
  const [duration, setDuration] = useState<'2hours' | '4hours' | '6hours' | 'fullday'>('4hours');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card'>('cash');
  const [amountPaid, setAmountPaid] = useState<string>('');

  // Hooks
  const createGuest = useCreateGuest();
  const createBooking = useCreateBooking();
  const checkInMutation = useCheckIn();
  const { data: searchResults, isLoading: searching } = useSearchGuests(searchQuery);

  // Format price in Naira
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  // Calculate price based on duration
  const getPrice = () => {
    const basePrice = room.base_price;
    switch(duration) {
      case '2hours': return Math.round(basePrice * 0.3);
      case '4hours': return Math.round(basePrice * 0.5);
      case '6hours': return Math.round(basePrice * 0.7);
      case 'fullday': return basePrice;
      default: return basePrice * 0.5;
    }
  };

  const price = getPrice();
  const tax = price * 0.075;
  const total = price + tax;

  const calculateChange = () => {
    const paid = parseFloat(amountPaid) || 0;
    return formatPrice(paid - total);
  };

  const validateGuestInfo = () => {
    if (searchMode === 'search' && !selectedGuest) {
      toast.error('Please select a guest');
      return false;
    }
    if (searchMode === 'new') {
      if (!guestData.first_name || !guestData.last_name) {
        toast.error('Please enter guest name');
        return false;
      }
      if (!guestData.phone) {
        toast.error('Please enter phone number');
        return false;
      }
      if (!guestData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestData.email)) {
        toast.error('Please enter a valid email');
        return false;
      }
    }
    return true;
  };

  const validatePayment = () => {
    if (paymentMethod === 'cash' && (!amountPaid || parseFloat(amountPaid) < total)) {
      toast.error('Amount paid must be at least the total amount');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (step === 1 && validateGuestInfo()) {
      setStep(2);
    } else if (step === 2 && validatePayment()) {
      setStep(3);
    }
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleSelectGuest = (guest: any) => {
    setSelectedGuest(guest);
    setSearchQuery('');
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      let guestId;
      let guestName;
      
      // Step 1: Get or create guest
      if (searchMode === 'search' && selectedGuest) {
        guestId = selectedGuest.id;
        guestName = `${selectedGuest.first_name} ${selectedGuest.last_name}`;
      } else {
        const guest = await createGuest.mutateAsync({
          first_name: guestData.first_name,
          last_name: guestData.last_name,
          email: guestData.email,
          phone: guestData.phone,
        });
        guestId = guest.id;
        guestName = `${guestData.first_name} ${guestData.last_name}`;
      }

      // Calculate check-out time based on duration
      const checkInDate = new Date().toISOString().split('T')[0];
      let checkOut = new Date();
      
      switch(duration) {
        case '2hours':
          checkOut.setHours(checkOut.getHours() + 2);
          break;
        case '4hours':
          checkOut.setHours(checkOut.getHours() + 4);
          break;
        case '6hours':
          checkOut.setHours(checkOut.getHours() + 6);
          break;
        case 'fullday':
          checkOut.setDate(checkOut.getDate() + 1);
          break;
      }
      
      const checkOutStr = checkOut.toISOString().split('T')[0];
      
      // Calculate nights (must be at least 1 for the database)
      const totalNights = 1; // Always 1 for any booking

      // Step 2: Create booking
      const bookingData = {
        guest: guestId,
        room: room.id,
        check_in: checkInDate,
        check_out: checkOutStr,
        adults: 1,
        children: 0,
        total_nights: totalNights,
        total_amount: total,
        special_requests: `Short rest - ${duration}`,
        status: 'confirmed',
        payment_status: 'pending',
      };

      console.log('📤 Sending booking data:', bookingData);

      const booking = await createBooking.mutateAsync(bookingData);
      console.log('✅ Booking created:', booking);

      // Extract booking ID from response (handles different response formats)
      const bookingId = booking?.id || booking?.booking_id;
      
      if (!bookingId) {
        console.error('❌ Booking has no ID:', booking);
        toast.error('Booking created but no ID returned');
        
        // Still show success for the booking itself
        toast.success(`${guestName} booked successfully for ${duration}!`);
        onClose();
        router.refresh();
        return;
      }

      // Step 3: Check in with payment
      const checkInData = {
        id: bookingId,
        paymentData: {
          payment_method: paymentMethod,
          amount_paid: paymentMethod === 'cash' ? parseFloat(amountPaid) : undefined,
        },
      };
      
      console.log('📤 Checking in with:', checkInData);
      await checkInMutation.mutateAsync(checkInData);

      toast.success(`${guestName} checked in successfully for ${duration}!`);
      onClose();
      router.refresh();
      
    } catch (error: any) {
      console.error('❌ Short rest check-in failed:', error);
      toast.error(error.response?.data?.message || 'Failed to complete check-in');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header - Red theme */}
        <div className="sticky top-0 bg-gradient-to-r from-red-600 to-red-500 text-white border-b p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <ClockIcon className="h-5 w-5" />
            Short Rest - Room {room.room_number}
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full transition-colors">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Progress Steps - Red theme */}
        <div className="p-4 bg-gray-50 border-b">
          <div className="flex items-center justify-between">
            {[1, 2, 3].map((stepNum) => (
              <div key={stepNum} className="flex flex-col items-center flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  step >= stepNum
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  {step > stepNum ? '✓' : stepNum}
                </div>
                <span className={`text-xs mt-1 ${
                  step >= stepNum ? 'text-red-600 font-medium' : 'text-gray-400'
                }`}>
                  {stepNum === 1 && 'Guest'}
                  {stepNum === 2 && 'Payment'}
                  {stepNum === 3 && 'Confirm'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Step 1: Guest Information */}
        {step === 1 && (
          <div className="p-6 space-y-4">
            {/* Selected Guest Indicator */}
            {selectedGuest && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-green-700">Selected Guest</p>
                  <p className="font-medium">{selectedGuest.first_name} {selectedGuest.last_name}</p>
                  <p className="text-xs text-green-600">{selectedGuest.phone} • {selectedGuest.email}</p>
                </div>
                <button
                  onClick={() => setSelectedGuest(null)}
                  className="text-green-700 hover:text-green-800"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
            )}

            {/* Guest Selection Tabs */}
            {!selectedGuest && (
              <div className="flex border-b border-gray-200 mb-4">
                <button
                  onClick={() => setSearchMode('search')}
                  className={`flex-1 py-2 text-sm font-medium ${
                    searchMode === 'search'
                      ? 'text-red-600 border-b-2 border-red-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Search Guest
                </button>
                <button
                  onClick={() => setSearchMode('new')}
                  className={`flex-1 py-2 text-sm font-medium ${
                    searchMode === 'new'
                      ? 'text-red-600 border-b-2 border-red-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  New Guest
                </button>
              </div>
            )}

            {/* Search Mode */}
            {!selectedGuest && searchMode === 'search' && (
              <div className="space-y-4">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name, email, or phone..."
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                  {searching && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-red-600 border-t-transparent"></div>
                    </div>
                  )}
                </div>

                {/* Search Results */}
                {searchResults && searchResults.length > 0 && (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {searchResults.map((guest) => (
                      <button
                        key={guest.id}
                        onClick={() => handleSelectGuest(guest)}
                        className="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors"
                      >
                        <p className="font-medium">{guest.first_name} {guest.last_name}</p>
                        <p className="text-xs text-gray-500">{guest.phone} • {guest.email}</p>
                      </button>
                    ))}
                  </div>
                )}

                {searchQuery.length > 2 && searchResults?.length === 0 && !searching && (
                  <div className="text-center py-4">
                    <p className="text-gray-500">No guests found</p>
                    <button
                      onClick={() => setSearchMode('new')}
                      className="mt-2 text-red-600 hover:text-red-700 text-sm font-medium"
                    >
                      Create new guest instead
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* New Guest Form */}
            {!selectedGuest && searchMode === 'new' && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={guestData.first_name}
                      onChange={(e) => setGuestData({ ...guestData, first_name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={guestData.last_name}
                      onChange={(e) => setGuestData({ ...guestData, last_name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      placeholder="Doe"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <div className="relative">
                    <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="tel"
                      value={guestData.phone}
                      onChange={(e) => setGuestData({ ...guestData, phone: e.target.value })}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      placeholder="0704 754 7555"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="email"
                      value={guestData.email}
                      onChange={(e) => setGuestData({ ...guestData, email: e.target.value })}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      placeholder="guest@example.com"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Room Details Card - Red theme */}
            <div className="bg-red-50 rounded-lg p-4 mt-4 border border-red-100">
              <h4 className="font-medium text-red-800 mb-2">Room Details</h4>
              <p className="text-sm text-red-700">Room {room.room_number} • {room.room_type}</p>
              <p className="text-sm text-red-700">Regular rate: {formatPrice(room.base_price)}/night</p>
            </div>
          </div>
        )}

        {/* Step 2: Duration & Payment */}
        {step === 2 && (
          <div className="p-6 space-y-4">
            <h3 className="font-semibold text-gray-900">Select Duration</h3>
            
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: '2hours', label: '2 Hours', price: Math.round(room.base_price * 0.3) },
                { id: '4hours', label: '4 Hours', price: Math.round(room.base_price * 0.5) },
                { id: '6hours', label: '6 Hours', price: Math.round(room.base_price * 0.7) },
                { id: 'fullday', label: 'Full Day', price: room.base_price },
              ].map((option) => (
                <button
                  key={option.id}
                  onClick={() => setDuration(option.id as any)}
                  className={`p-3 rounded-lg border-2 text-left transition-all ${
                    duration === option.id
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-200 hover:border-red-300'
                  }`}
                >
                  <p className="font-semibold">{option.label}</p>
                  <p className="text-sm text-red-600 font-medium">{formatPrice(option.price)}</p>
                </button>
              ))}
            </div>

            {/* Price Breakdown - Red theme */}
            <div className="bg-gray-50 rounded-lg p-4 mt-4 border border-gray-200">
              <h4 className="font-semibold mb-2">Price Details</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Room charge</span>
                  <span>{formatPrice(price)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">VAT (7.5%)</span>
                  <span>{formatPrice(tax)}</span>
                </div>
                <div className="flex justify-between font-bold pt-2 border-t border-red-200">
                  <span>Total</span>
                  <span className="text-red-600">{formatPrice(total)}</span>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div>
              <h4 className="font-semibold mb-2">Payment Method</h4>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setPaymentMethod('cash')}
                  className={`p-3 rounded-lg border-2 flex items-center justify-center gap-2 ${
                    paymentMethod === 'cash'
                      ? 'border-red-500 bg-red-50 text-red-700'
                      : 'border-gray-200 hover:border-red-300'
                  }`}
                >
                  <BanknotesIcon className={`h-5 w-5 ${paymentMethod === 'cash' ? 'text-red-600' : 'text-gray-500'}`} />
                  Cash
                </button>
                <button
                  onClick={() => setPaymentMethod('card')}
                  className={`p-3 rounded-lg border-2 flex items-center justify-center gap-2 ${
                    paymentMethod === 'card'
                      ? 'border-red-500 bg-red-50 text-red-700'
                      : 'border-gray-200 hover:border-red-300'
                  }`}
                >
                  <CreditCardIcon className={`h-5 w-5 ${paymentMethod === 'card' ? 'text-red-600' : 'text-gray-500'}`} />
                  Card
                </button>
              </div>
            </div>

            {/* Cash Payment */}
            {paymentMethod === 'cash' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount Paid
                </label>
                <input
                  type="number"
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(e.target.value)}
                  min={total}
                  step="100"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="Enter amount"
                />
                {amountPaid && parseFloat(amountPaid) >= total && (
                  <div className="mt-2 p-2 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-sm text-gray-600">Change:</p>
                    <p className="text-lg font-bold text-green-600">{calculateChange()}</p>
                  </div>
                )}
              </div>
            )}

            {/* Card Payment Note */}
            {paymentMethod === 'card' && (
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800">
                  Please process card payment on the terminal
                </p>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Confirmation */}
        {step === 3 && (
          <div className="p-6 space-y-4">
            <div className="text-center mb-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircleIcon className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Confirm Check-in</h3>
              <p className="text-sm text-gray-600">Please review the details below</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 space-y-3 border border-gray-200">
              <div>
                <p className="text-xs text-gray-500">Guest</p>
                <p className="font-medium">
                  {selectedGuest 
                    ? `${selectedGuest.first_name} ${selectedGuest.last_name}`
                    : `${guestData.first_name} ${guestData.last_name}`}
                </p>
                <p className="text-sm text-gray-600">
                  {selectedGuest ? selectedGuest.phone : guestData.phone}
                </p>
                <p className="text-sm text-gray-600">
                  {selectedGuest ? selectedGuest.email : guestData.email}
                </p>
              </div>

              <div className="border-t border-red-200 pt-2">
                <p className="text-xs text-gray-500">Room</p>
                <p className="font-medium">Room {room.room_number} - {room.room_type}</p>
                <p className="text-sm text-gray-600">
                  Duration: {duration === '2hours' ? '2 Hours' : 
                            duration === '4hours' ? '4 Hours' : 
                            duration === '6hours' ? '6 Hours' : 'Full Day'}
                </p>
              </div>

              <div className="border-t border-red-200 pt-2">
                <p className="text-xs text-gray-500">Total Amount</p>
                <p className="text-xl font-bold text-red-600">{formatPrice(total)}</p>
                <p className="text-sm text-gray-600">Payment: {paymentMethod === 'cash' ? 'Cash' : 'Card'}</p>
              </div>
            </div>
          </div>
        )}

        {/* Footer Buttons - Red theme */}
        <div className="sticky bottom-0 bg-white border-t p-4 flex gap-3">
          {step > 1 ? (
            <button
              onClick={handleBack}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Back
            </button>
          ) : (
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          )}

          {step < 3 ? (
            <button
              onClick={handleNext}
              disabled={step === 1 && !selectedGuest && searchMode === 'search' && !searchQuery}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircleIcon className="h-5 w-5" />
                  Confirm Check-in
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}