// frontend/app/bookings/new/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeftIcon,
  UserIcon,
  MagnifyingGlassIcon,
  CalendarIcon,
  HomeIcon,
  PhoneIcon,
  EnvelopeIcon,
  PlusCircleIcon,
  XMarkIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { useCreateBooking, useCreateGuest, useSearchGuests } from '@/lib/api/hooks/useBookings';
import { useRooms } from '@/lib/api/hooks/useRooms';
import Layout from '@/components/layout/Layout';
import toast from 'react-hot-toast';

export default function NewBookingPage() {
  const router = useRouter();
  const createBooking = useCreateBooking();
  const createGuest = useCreateGuest();

  const { data: rooms, isLoading: roomsLoading } = useRooms({ status: 'available' });
  const availableRooms = Array.isArray(rooms) ? rooms : [];

  const [activeTab, setActiveTab] = useState<'search' | 'new'>('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedGuest, setSelectedGuest] = useState<any>(null);
  
  // Guest form state
  const [guestData, setGuestData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
  });

  // Booking form state
  const [formData, setFormData] = useState({
    room_id: '',
    check_in: '',
    check_out: '',
    adults: 1,
    children: 0,
    special_requests: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [nights, setNights] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [isSearching, setIsSearching] = useState(false);

  // Search guests
  const { data: searchData, refetch: performSearch } = useSearchGuests(searchQuery);

  useEffect(() => {
    if (searchQuery.length > 2) {
      setIsSearching(true);
      const timer = setTimeout(() => {
        performSearch();
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, performSearch]);

  useEffect(() => {
    if (searchData) {
      setSearchResults(Array.isArray(searchData) ? searchData : []);
      setIsSearching(false);
    }
  }, [searchData]);

  // Calculate nights and total when dates change
  useEffect(() => {
    if (formData.check_in && formData.check_out) {
      const start = new Date(formData.check_in);
      const end = new Date(formData.check_out);
      const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      setNights(diff > 0 ? diff : 0);
    }
  }, [formData.check_in, formData.check_out]);

  // Calculate total amount when room or nights change
  useEffect(() => {
    if (formData.room_id && nights > 0) {
      const selectedRoom = availableRooms.find(r => r.id === formData.room_id);
      if (selectedRoom) {
        setTotalAmount(nights * selectedRoom.base_price);
      }
    }
  }, [formData.room_id, nights, availableRooms]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name.startsWith('guest_')) {
      const guestField = name.replace('guest_', '');
      setGuestData(prev => ({ ...prev, [guestField]: value }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!selectedGuest) {
      newErrors.guest = 'Please select or create a guest';
    }
    if (!formData.room_id) newErrors.room_id = 'Please select a room';
    if (!formData.check_in) newErrors.check_in = 'Check-in date is required';
    if (!formData.check_out) newErrors.check_out = 'Check-out date is required';
    
    if (formData.check_in && formData.check_out) {
      const start = new Date(formData.check_in);
      const end = new Date(formData.check_out);
      if (end <= start) {
        newErrors.check_out = 'Check-out must be after check-in';
      }
    }
    
    return newErrors;
  };

  const validateGuestForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!guestData.first_name.trim()) newErrors.guest_first_name = 'First name is required';
    if (!guestData.last_name.trim()) newErrors.guest_last_name = 'Last name is required';
    if (!guestData.email.trim()) {
      newErrors.guest_email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(guestData.email)) {
      newErrors.guest_email = 'Email is invalid';
    }
    if (!guestData.phone.trim()) newErrors.guest_phone = 'Phone number is required';
    
    return newErrors;
  };

  const handleCreateGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const guestErrors = validateGuestForm();
    if (Object.keys(guestErrors).length > 0) {
      setErrors(guestErrors);
      return;
    }

    try {
      const guest = await createGuest.mutateAsync({
        first_name: guestData.first_name.trim(),
        last_name: guestData.last_name.trim(),
        email: guestData.email.trim(),
        phone: guestData.phone.trim(),
      });
      
      setSelectedGuest(guest);
      toast.success('Guest created successfully');
      setActiveTab('search'); // Switch back to search tab to show selected guest
    } catch (error: any) {
      console.error('Failed to create guest:', error);
      toast.error(error.response?.data?.message || 'Failed to create guest');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error('Please fill in all required fields');
      return;
    }

    if (nights <= 0) {
      toast.error('Check-out date must be after check-in date');
      return;
    }

    try {
      await createBooking.mutateAsync({
        guest: selectedGuest.id,
        room: formData.room_id,
        check_in: formData.check_in,
        check_out: formData.check_out,
        adults: formData.adults,
        children: formData.children,
        total_nights: nights,
        total_amount: totalAmount,
        special_requests: formData.special_requests || undefined,
        status: 'confirmed',
        payment_status: 'pending',
      });

      toast.success('Booking created successfully!');
      router.push('/bookings');
    } catch (error: any) {
      console.error('Failed to create booking:', error);
      toast.error(error.response?.data?.message || 'Failed to create booking');
    }
  };

  const selectGuest = (guest: any) => {
    setSelectedGuest(guest);
    setSearchQuery('');
    setSearchResults([]);
    toast.success(`${guest.first_name} ${guest.last_name} selected`);
  };

  const clearSelectedGuest = () => {
    setSelectedGuest(null);
  };

  const selectedRoom = availableRooms.find(r => r.id === formData.room_id);

  return (
    <Layout>
      <div className="max-w-4xl mx-auto pb-20">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/bookings"
            className="inline-flex items-center text-gray-600 hover:text-red-600 mb-4 group"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1 transition-transform group-hover:-translate-x-1" />
            Back to Bookings
          </Link>
          
          <div className="bg-gradient-to-r from-red-600 to-red-500 rounded-xl p-6 text-white">
            <h1 className="text-2xl font-bold">New Booking</h1>
            <p className="text-red-100 mt-1">Create a new reservation</p>
          </div>
        </div>

        {/* Main Form */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          {/* Header Tabs */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('search')}
              className={`flex-1 py-4 px-6 text-sm font-medium transition-colors ${
                activeTab === 'search'
                  ? 'text-red-600 border-b-2 border-red-600 bg-red-50'
                  : 'text-gray-600 hover:text-red-600 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <MagnifyingGlassIcon className="h-5 w-5" />
                Search Existing Guest
              </div>
            </button>
            <button
              onClick={() => setActiveTab('new')}
              className={`flex-1 py-4 px-6 text-sm font-medium transition-colors ${
                activeTab === 'new'
                  ? 'text-red-600 border-b-2 border-red-600 bg-red-50'
                  : 'text-gray-600 hover:text-red-600 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <PlusCircleIcon className="h-5 w-5" />
                Create New Guest
              </div>
            </button>
          </div>

          <div className="p-6">
            {/* Selected Guest Indicator */}
            {selectedGuest && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircleIcon className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Selected Guest</p>
                      <p className="font-semibold text-dark-500">
                        {selectedGuest.first_name} {selectedGuest.last_name}
                      </p>
                      <p className="text-xs text-gray-500">{selectedGuest.email} • {selectedGuest.phone}</p>
                    </div>
                  </div>
                  <button
                    onClick={clearSelectedGuest}
                    className="p-1 hover:bg-green-100 rounded-full transition-colors"
                  >
                    <XMarkIcon className="h-5 w-5 text-gray-500" />
                  </button>
                </div>
              </div>
            )}

            {/* Tab Content */}
            {activeTab === 'search' && !selectedGuest && (
              <div className="space-y-4">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name, email, or phone..."
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                  {isSearching && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-red-600 border-t-transparent"></div>
                    </div>
                  )}
                </div>

                {/* Search Results */}
                {searchResults.length > 0 && (
                  <div className="mt-4 space-y-2 max-h-60 overflow-y-auto">
                    {searchResults.map((guest) => (
                      <button
                        key={guest.id}
                        onClick={() => selectGuest(guest)}
                        className="w-full text-left p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200 hover:border-red-300"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                            <UserIcon className="h-5 w-5 text-red-600" />
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-dark-500">
                              {guest.first_name} {guest.last_name}
                            </p>
                            <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                              <span className="flex items-center gap-1">
                                <EnvelopeIcon className="h-3 w-3" />
                                {guest.email}
                              </span>
                              <span className="flex items-center gap-1">
                                <PhoneIcon className="h-3 w-3" />
                                {guest.phone}
                              </span>
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {searchQuery.length > 2 && searchResults.length === 0 && !isSearching && (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <UserIcon className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-600">No guests found</p>
                    <button
                      onClick={() => setActiveTab('new')}
                      className="mt-2 text-red-600 hover:text-red-700 font-medium"
                    >
                      Create a new guest instead
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'new' && !selectedGuest && (
              <form onSubmit={handleCreateGuest} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="guest_first_name"
                      value={guestData.first_name}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                        errors.guest_first_name ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.guest_first_name && (
                      <p className="text-xs text-red-600 mt-1">{errors.guest_first_name}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="guest_last_name"
                      value={guestData.last_name}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                        errors.guest_last_name ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.guest_last_name && (
                      <p className="text-xs text-red-600 mt-1">{errors.guest_last_name}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="guest_email"
                      value={guestData.email}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                        errors.guest_email ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.guest_email && (
                      <p className="text-xs text-red-600 mt-1">{errors.guest_email}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="guest_phone"
                      value={guestData.phone}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                        errors.guest_phone ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.guest_phone && (
                      <p className="text-xs text-red-600 mt-1">{errors.guest_phone}</p>
                    )}
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    type="submit"
                    disabled={createGuest.isPending}
                    className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors font-medium"
                  >
                    {createGuest.isPending ? 'Creating...' : 'Create Guest'}
                  </button>
                </div>
              </form>
            )}

            {/* Booking Details Form - Only show when guest is selected */}
            {selectedGuest && (
              <form onSubmit={handleSubmit} className="space-y-6 mt-6 pt-6 border-t border-gray-200">
                <h2 className="text-lg font-semibold text-dark-500 flex items-center gap-2">
                  <HomeIcon className="h-5 w-5 text-red-600" />
                  Booking Details
                </h2>

                {/* Room Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select Room <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="room_id"
                    value={formData.room_id}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                      errors.room_id ? 'border-red-500' : 'border-gray-300'
                    }`}
                    disabled={roomsLoading}
                  >
                    <option value="">Choose a room</option>
                    {availableRooms.map((room) => (
                      <option key={room.id} value={room.id}>
                        Room {room.room_number} - {room.room_type === 'standard' ? 'Standard' : 'Duplex'} - ₦{room.base_price}/night
                      </option>
                    ))}
                  </select>
                  {errors.room_id && <p className="text-xs text-red-600 mt-1">{errors.room_id}</p>}
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Check-in Date <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="date"
                        name="check_in"
                        value={formData.check_in}
                        onChange={handleChange}
                        min={new Date().toISOString().split('T')[0]}
                        className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                          errors.check_in ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                    </div>
                    {errors.check_in && <p className="text-xs text-red-600 mt-1">{errors.check_in}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Check-out Date <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="date"
                        name="check_out"
                        value={formData.check_out}
                        onChange={handleChange}
                        min={formData.check_in || new Date().toISOString().split('T')[0]}
                        className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                          errors.check_out ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                    </div>
                    {errors.check_out && <p className="text-xs text-red-600 mt-1">{errors.check_out}</p>}
                  </div>
                </div>

                {/* Guests Count */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Adults <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="adults"
                      min="1"
                      value={formData.adults}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Children
                    </label>
                    <input
                      type="number"
                      name="children"
                      min="0"
                      value={formData.children}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Special Requests */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Special Requests
                  </label>
                  <textarea
                    name="special_requests"
                    value={formData.special_requests}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Any special requests or requirements..."
                  />
                </div>

                {/* Summary Card */}
                {selectedRoom && nights > 0 && (
                  <div className="bg-gradient-to-r from-red-50 to-amber-50 rounded-lg p-6 border border-red-200">
                    <h3 className="font-semibold text-dark-500 mb-4 flex items-center gap-2">
                      <span className="w-1 h-6 bg-red-600 rounded-full"></span>
                      Booking Summary
                    </h3>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between items-center py-2 border-b border-red-100">
                        <span className="text-gray-600">Room:</span>
                        <span className="font-medium text-dark-500">
                          Room {selectedRoom.room_number} ({selectedRoom.room_type})
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center py-2 border-b border-red-100">
                        <span className="text-gray-600">Nights:</span>
                        <span className="font-medium text-dark-500">{nights}</span>
                      </div>
                      
                      <div className="flex justify-between items-center py-2 border-b border-red-100">
                        <span className="text-gray-600">Price per night:</span>
                        <span className="font-medium text-dark-500">₦{selectedRoom.base_price.toLocaleString()}</span>
                      </div>
                      
                      <div className="flex justify-between items-center pt-2">
                        <span className="text-lg font-semibold text-dark-500">Total:</span>
                        <span className="text-2xl font-bold text-red-600">₦{totalAmount.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Form Actions */}
                <div className="flex justify-end gap-3 pt-4">
                  <Link
                    href="/bookings"
                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                  >
                    Cancel
                  </Link>
                  <button
                    type="submit"
                    disabled={createBooking.isPending}
                    className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors font-medium"
                  >
                    {createBooking.isPending ? (
                      <span className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Creating...
                      </span>
                    ) : 'Create Booking'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}