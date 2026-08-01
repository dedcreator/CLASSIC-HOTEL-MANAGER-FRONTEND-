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
  
  const [guestData, setGuestData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
  });

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

  useEffect(() => {
    if (formData.check_in && formData.check_out) {
      const start = new Date(formData.check_in);
      const end = new Date(formData.check_out);
      const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      setNights(diff > 0 ? diff : 0);
    }
  }, [formData.check_in, formData.check_out]);

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
      setActiveTab('search');
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
      <div className="max-w-4xl mx-auto pb-20 px-4">
        {/* Header */}
        <div className="mb-8 border-b border-[#DDD5C4] pb-6">
          <Link
            href="/bookings"
            className="font-body inline-flex items-center text-[#8A8377] hover:text-[#16302B] mb-4 transition-colors group"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2 transition-transform group-hover:-translate-x-1" />
            Back to Bookings
          </Link>

          <div>
            <h1 className="font-display text-2xl font-medium text-[#2A2622]">New Booking</h1>
            <p className="font-body text-sm text-[#8A8377] mt-1">Create a new reservation</p>
          </div>
        </div>

        {/* Main Form */}
        <div className="bg-white rounded-lg border border-[#DDD5C4] overflow-hidden">
          {/* Header Tabs */}
          <div className="flex border-b border-[#DDD5C4] bg-[#FAF6EF]">
            <button
              onClick={() => setActiveTab('search')}
              className={`flex-1 py-4 px-6 font-body text-sm font-medium transition-colors ${
                activeTab === 'search'
                  ? 'text-[#16302B] border-b-2 border-[#C9A468] bg-white'
                  : 'text-[#8A8377] hover:text-[#16302B] hover:bg-white/50'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <MagnifyingGlassIcon className={`h-5 w-5 ${activeTab === 'search' ? 'text-[#C9A468]' : 'text-[#8A8377]'}`} />
                Search Existing Guest
              </div>
            </button>
            <button
              onClick={() => setActiveTab('new')}
              className={`flex-1 py-4 px-6 font-body text-sm font-medium transition-colors ${
                activeTab === 'new'
                  ? 'text-[#16302B] border-b-2 border-[#C9A468] bg-white'
                  : 'text-[#8A8377] hover:text-[#16302B] hover:bg-white/50'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <PlusCircleIcon className={`h-5 w-5 ${activeTab === 'new' ? 'text-[#C9A468]' : 'text-[#8A8377]'}`} />
                Create New Guest
              </div>
            </button>
          </div>

          <div className="p-6">
            {/* Selected Guest Indicator */}
            {selectedGuest && (
              <div className="mb-6 p-4 bg-[#D1FAE5] border border-[#6EE7B7] rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#A7F3D0] rounded-full flex items-center justify-center">
                      <CheckCircleIcon className="h-5 w-5 text-[#065F46]" />
                    </div>
                    <div>
                      <p className="font-body text-sm text-[#065F46]">Selected Guest</p>
                      <p className="font-body font-semibold text-[#2A2622]">
                        {selectedGuest.first_name} {selectedGuest.last_name}
                      </p>
                      <p className="font-body text-xs text-[#065F46]">{selectedGuest.email} • {selectedGuest.phone}</p>
                    </div>
                  </div>
                  <button
                    onClick={clearSelectedGuest}
                    className="p-1 hover:bg-[#A7F3D0] rounded-full transition-colors"
                  >
                    <XMarkIcon className="h-5 w-5 text-[#065F46]" />
                  </button>
                </div>
              </div>
            )}

            {/* Tab Content */}
            {activeTab === 'search' && !selectedGuest && (
              <div className="space-y-4">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-0 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#8A8377]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name, email, or phone..."
                    className="font-body w-full border-0 border-b border-[#DDD5C4] bg-transparent pl-8 py-2 text-[#2A2622] outline-none transition-colors focus:border-b-2 focus:border-[#C9A468] focus:pb-[7px] placeholder:text-[#8A8377]"
                  />
                  {isSearching && (
                    <div className="absolute right-0 top-1/2 transform -translate-y-1/2">
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-[#C9A468] border-t-transparent"></div>
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
                        className="w-full text-left p-4 bg-[#F7F1E4] hover:bg-[#DDD5C4] rounded-lg transition-colors border border-[#DDD5C4] hover:border-[#C9A468]"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-[#16302B] rounded-full flex items-center justify-center">
                            <span className="font-display text-sm font-medium text-[#F7F1E4]">
                              {guest.first_name?.[0]}{guest.last_name?.[0]}
                            </span>
                          </div>
                          <div className="flex-1">
                            <p className="font-body font-semibold text-[#2A2622]">
                              {guest.first_name} {guest.last_name}
                            </p>
                            <div className="flex items-center gap-3 text-xs text-[#8A8377] mt-1">
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
                  <div className="text-center py-8 bg-[#F7F1E4] rounded-lg border border-[#DDD5C4]">
                    <UserIcon className="h-12 w-12 mx-auto text-[#DDD5C4] mb-3" />
                    <p className="font-body text-[#8A8377]">No guests found</p>
                    <button
                      onClick={() => setActiveTab('new')}
                      className="mt-2 font-body text-[#16302B] hover:text-[#1D3B34] font-medium underline decoration-[#C9A468] underline-offset-4"
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
                    <label className="font-body block text-sm font-medium text-[#5B564B] mb-1.5">
                      First Name <span className="text-[#EF4444]">*</span>
                    </label>
                    <input
                      type="text"
                      name="guest_first_name"
                      value={guestData.first_name}
                      onChange={handleChange}
                      className={`font-body w-full border-0 border-b ${errors.guest_first_name ? 'border-[#EF4444]' : 'border-[#DDD5C4]'} bg-transparent px-0 py-2 text-[#2A2622] outline-none transition-colors focus:border-b-2 focus:border-[#C9A468] focus:pb-[7px] placeholder:text-[#8A8377]`}
                      placeholder="John"
                    />
                    {errors.guest_first_name && (
                      <p className="font-body text-sm text-[#EF4444] mt-1">{errors.guest_first_name}</p>
                    )}
                  </div>
                  <div>
                    <label className="font-body block text-sm font-medium text-[#5B564B] mb-1.5">
                      Last Name <span className="text-[#EF4444]">*</span>
                    </label>
                    <input
                      type="text"
                      name="guest_last_name"
                      value={guestData.last_name}
                      onChange={handleChange}
                      className={`font-body w-full border-0 border-b ${errors.guest_last_name ? 'border-[#EF4444]' : 'border-[#DDD5C4]'} bg-transparent px-0 py-2 text-[#2A2622] outline-none transition-colors focus:border-b-2 focus:border-[#C9A468] focus:pb-[7px] placeholder:text-[#8A8377]`}
                      placeholder="Doe"
                    />
                    {errors.guest_last_name && (
                      <p className="font-body text-sm text-[#EF4444] mt-1">{errors.guest_last_name}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="font-body block text-sm font-medium text-[#5B564B] mb-1.5">
                      Email <span className="text-[#EF4444]">*</span>
                    </label>
                    <input
                      type="email"
                      name="guest_email"
                      value={guestData.email}
                      onChange={handleChange}
                      className={`font-body w-full border-0 border-b ${errors.guest_email ? 'border-[#EF4444]' : 'border-[#DDD5C4]'} bg-transparent px-0 py-2 text-[#2A2622] outline-none transition-colors focus:border-b-2 focus:border-[#C9A468] focus:pb-[7px] placeholder:text-[#8A8377]`}
                      placeholder="john@example.com"
                    />
                    {errors.guest_email && (
                      <p className="font-body text-sm text-[#EF4444] mt-1">{errors.guest_email}</p>
                    )}
                  </div>
                  <div>
                    <label className="font-body block text-sm font-medium text-[#5B564B] mb-1.5">
                      Phone <span className="text-[#EF4444]">*</span>
                    </label>
                    <input
                      type="tel"
                      name="guest_phone"
                      value={guestData.phone}
                      onChange={handleChange}
                      className={`font-body w-full border-0 border-b ${errors.guest_phone ? 'border-[#EF4444]' : 'border-[#DDD5C4]'} bg-transparent px-0 py-2 text-[#2A2622] outline-none transition-colors focus:border-b-2 focus:border-[#C9A468] focus:pb-[7px] placeholder:text-[#8A8377]`}
                      placeholder="+234 123 456 7890"
                    />
                    {errors.guest_phone && (
                      <p className="font-body text-sm text-[#EF4444] mt-1">{errors.guest_phone}</p>
                    )}
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-[#DDD5C4]">
                  <button
                    type="submit"
                    disabled={createGuest.isPending}
                    className="font-body px-6 py-2 text-sm font-medium text-[#F7F1E4] bg-[#16302B] border border-transparent rounded-lg hover:bg-[#1D3B34] transition-colors focus:outline-none focus:ring-2 focus:ring-[#C9A468] focus:ring-offset-2 disabled:opacity-50"
                  >
                    {createGuest.isPending ? 'Creating...' : 'Create Guest'}
                  </button>
                </div>
              </form>
            )}

            {/* Booking Details Form */}
            {selectedGuest && (
              <form onSubmit={handleSubmit} className="space-y-6 mt-6 pt-6 border-t border-[#DDD5C4]">
                <h2 className="font-display text-lg font-medium text-[#2A2622] flex items-center gap-2">
                  <HomeIcon className="h-5 w-5 text-[#C9A468]" />
                  Booking Details
                </h2>

                {/* Room Selection */}
                <div>
                  <label className="font-body block text-sm font-medium text-[#5B564B] mb-1.5">
                    Select Room <span className="text-[#EF4444]">*</span>
                  </label>
                  <select
                    name="room_id"
                    value={formData.room_id}
                    onChange={handleChange}
                    className={`font-body w-full border-0 border-b ${errors.room_id ? 'border-[#EF4444]' : 'border-[#DDD5C4]'} bg-transparent px-0 py-2 text-[#2A2622] outline-none transition-colors focus:border-b-2 focus:border-[#C9A468] focus:pb-[7px]`}
                    disabled={roomsLoading}
                  >
                    <option value="">Choose a room</option>
                    {availableRooms.map((room) => (
                      <option key={room.id} value={room.id}>
                        Room {room.room_number} - {room.room_type === 'standard' ? 'Standard' : 'Duplex'} - ₦{room.base_price}/night
                      </option>
                    ))}
                  </select>
                  {errors.room_id && <p className="font-body text-sm text-[#EF4444] mt-1">{errors.room_id}</p>}
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="font-body block text-sm font-medium text-[#5B564B] mb-1.5">
                      Check-in Date <span className="text-[#EF4444]">*</span>
                    </label>
                    <div className="relative">
                      <CalendarIcon className="absolute left-0 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#8A8377]" />
                      <input
                        type="date"
                        name="check_in"
                        value={formData.check_in}
                        onChange={handleChange}
                        min={new Date().toISOString().split('T')[0]}
                        className={`font-body w-full border-0 border-b ${errors.check_in ? 'border-[#EF4444]' : 'border-[#DDD5C4]'} bg-transparent pl-8 py-2 text-[#2A2622] outline-none transition-colors focus:border-b-2 focus:border-[#C9A468] focus:pb-[7px]`}
                      />
                    </div>
                    {errors.check_in && <p className="font-body text-sm text-[#EF4444] mt-1">{errors.check_in}</p>}
                  </div>
                  
                  <div>
                    <label className="font-body block text-sm font-medium text-[#5B564B] mb-1.5">
                      Check-out Date <span className="text-[#EF4444]">*</span>
                    </label>
                    <div className="relative">
                      <CalendarIcon className="absolute left-0 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#8A8377]" />
                      <input
                        type="date"
                        name="check_out"
                        value={formData.check_out}
                        onChange={handleChange}
                        min={formData.check_in || new Date().toISOString().split('T')[0]}
                        className={`font-body w-full border-0 border-b ${errors.check_out ? 'border-[#EF4444]' : 'border-[#DDD5C4]'} bg-transparent pl-8 py-2 text-[#2A2622] outline-none transition-colors focus:border-b-2 focus:border-[#C9A468] focus:pb-[7px]`}
                      />
                    </div>
                    {errors.check_out && <p className="font-body text-sm text-[#EF4444] mt-1">{errors.check_out}</p>}
                  </div>
                </div>

                {/* Guests Count */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="font-body block text-sm font-medium text-[#5B564B] mb-1.5">
                      Adults <span className="text-[#EF4444]">*</span>
                    </label>
                    <input
                      type="number"
                      name="adults"
                      min="1"
                      value={formData.adults}
                      onChange={handleChange}
                      className="font-body w-full border-0 border-b border-[#DDD5C4] bg-transparent px-0 py-2 text-[#2A2622] outline-none transition-colors focus:border-b-2 focus:border-[#C9A468] focus:pb-[7px]"
                    />
                  </div>
                  
                  <div>
                    <label className="font-body block text-sm font-medium text-[#5B564B] mb-1.5">
                      Children
                    </label>
                    <input
                      type="number"
                      name="children"
                      min="0"
                      value={formData.children}
                      onChange={handleChange}
                      className="font-body w-full border-0 border-b border-[#DDD5C4] bg-transparent px-0 py-2 text-[#2A2622] outline-none transition-colors focus:border-b-2 focus:border-[#C9A468] focus:pb-[7px]"
                    />
                  </div>
                </div>

                {/* Special Requests */}
                <div>
                  <label className="font-body block text-sm font-medium text-[#5B564B] mb-1.5">
                    Special Requests
                  </label>
                  <textarea
                    name="special_requests"
                    value={formData.special_requests}
                    onChange={handleChange}
                    rows={3}
                    className="font-body w-full border-0 border-b border-[#DDD5C4] bg-transparent px-0 py-2 text-[#2A2622] outline-none transition-colors focus:border-b-2 focus:border-[#C9A468] focus:pb-[7px] placeholder:text-[#8A8377] resize-none"
                    placeholder="Any special requests or requirements..."
                  />
                </div>

                {/* Summary Card */}
                {selectedRoom && nights > 0 && (
                  <div className="bg-[#F7F1E4] rounded-lg p-6 border border-[#DDD5C4]">
                    <h3 className="font-display text-base font-medium text-[#2A2622] mb-4 flex items-center gap-2">
                      <span className="w-1 h-6 bg-[#C9A468] rounded-full"></span>
                      Booking Summary
                    </h3>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between items-center py-2 border-b border-[#DDD5C4]">
                        <span className="font-body text-[#8A8377]">Room:</span>
                        <span className="font-body font-medium text-[#2A2622]">
                          Room {selectedRoom.room_number} ({selectedRoom.room_type})
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center py-2 border-b border-[#DDD5C4]">
                        <span className="font-body text-[#8A8377]">Nights:</span>
                        <span className="font-body font-medium text-[#2A2622]">{nights}</span>
                      </div>
                      
                      <div className="flex justify-between items-center py-2 border-b border-[#DDD5C4]">
                        <span className="font-body text-[#8A8377]">Price per night:</span>
                        <span className="font-body font-medium text-[#2A2622]">₦{selectedRoom.base_price.toLocaleString()}</span>
                      </div>
                      
                      <div className="flex justify-between items-center pt-2">
                        <span className="font-display text-lg font-medium text-[#2A2622]">Total:</span>
                        <span className="font-display text-2xl font-medium text-[#16302B]">₦{totalAmount.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Form Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t border-[#DDD5C4]">
                  <Link
                    href="/bookings"
                    className="font-body px-6 py-2 text-sm font-medium text-[#16302B] bg-[#F7F1E4] border border-[#DDD5C4] rounded-lg hover:bg-[#DDD5C4] transition-colors focus:outline-none focus:ring-2 focus:ring-[#C9A468] focus:ring-offset-2"
                  >
                    Cancel
                  </Link>
                  <button
                    type="submit"
                    disabled={createBooking.isPending}
                    className="font-body px-6 py-2 text-sm font-medium text-[#F7F1E4] bg-[#16302B] border border-transparent rounded-lg hover:bg-[#1D3B34] transition-colors focus:outline-none focus:ring-2 focus:ring-[#C9A468] focus:ring-offset-2 disabled:opacity-50 flex items-center gap-2"
                  >
                    {createBooking.isPending ? (
                      <>
                        <div className="w-4 h-4 border-2 border-[#F7F1E4] border-t-transparent rounded-full animate-spin" />
                        Creating...
                      </>
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