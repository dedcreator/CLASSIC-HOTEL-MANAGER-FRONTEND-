// frontend/lib/api/hooks/useBookings.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../client';
import { Booking, Guest, TodayBookings, BookingStats } from '../types';
import toast from 'react-hot-toast';

// ========== GUEST API ==========
export const guestApi = {
  getAll: async (params?: any) => {
    const { data } = await api.get<Guest[]>('/bookings/guests/', { params });
    return data;
  },

  getById: async (id: string) => {
    const { data } = await api.get<Guest>(`/bookings/guests/${id}/`);
    return data;
  },

  create: async (guestData: Partial<Guest>) => {
    const { data } = await api.post<Guest>('/bookings/guests/', guestData);
    return data;
  },

  update: async ({ id, ...guestData }: Partial<Guest> & { id: string }) => {
    const { data } = await api.patch<Guest>(`/bookings/guests/${id}/`, guestData);
    return data;
  },

  search: async (query: string) => {
    const { data } = await api.get<Guest[]>(`/bookings/guests/?search=${query}`);
    return data;
  },
};

// ========== BOOKING API ==========
export const bookingApi = {
  getAll: async (params?: any) => {
    const { data } = await api.get<Booking[]>('/bookings/', { params });
    return data;
  },

  getById: async (id: string) => {
    const { data } = await api.get<Booking>(`/bookings/${id}/`);
    return data;
  },

  create: async (bookingData: any) => {
    const { data } = await api.post<Booking>('/bookings/', bookingData);
    return data;
  },

  update: async ({ id, ...bookingData }: any) => {
    const { data } = await api.patch<Booking>(`/bookings/${id}/`, bookingData);
    return data;
  },
checkIn: async (id: string, paymentData: { payment_method: string; amount_paid?: number }) => {
  console.log('📤 API call to:', `/bookings/${id}/check_in/`, paymentData);
  const { data } = await api.post<Booking>(`/bookings/${id}/check_in/`, paymentData);
  return data;
},

  checkOut: async (id: string) => {
    const { data } = await api.post<Booking>(`/bookings/${id}/check_out/`);
    return data;
  },

  cancel: async (id: string) => {
    const { data } = await api.post<Booking>(`/bookings/${id}/cancel/`);
    return data;
  },

  getToday: async () => {
    const { data } = await api.get<TodayBookings>('/bookings/today/');
    return data;
  },

  getAvailableRooms: async (check_in: string, check_out: string) => {
    const { data } = await api.get(`/bookings/available_rooms/?check_in=${check_in}&check_out=${check_out}`);
    return data;
  },

  getStats: async () => {
    const { data } = await api.get<BookingStats>('/bookings/stats/');
    return data;
  },
};

// ========== GUEST HOOKS ==========
export const useGuests = (params?: any) => {
  return useQuery({
    queryKey: ['guests', params],
    queryFn: () => guestApi.getAll(params),
  });
};

export const useGuest = (id: string) => {
  return useQuery({
    queryKey: ['guest', id],
    queryFn: () => guestApi.getById(id),
    enabled: !!id,
  });
};

export const useCreateGuest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: guestApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guests'] });
      toast.success('Guest created successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create guest');
    },
  });
};

export const useUpdateGuest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: guestApi.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guests'] });
      toast.success('Guest updated successfully');
    },
  });
};

export const useSearchGuests = (query: string) => {
  return useQuery({
    queryKey: ['guests', 'search', query],
    queryFn: () => guestApi.search(query),
    enabled: query.length > 2,
  });
};

// ========== BOOKING HOOKS ==========
export const useBookings = (params?: any) => {
  return useQuery({
    queryKey: ['bookings', params],
    queryFn: () => bookingApi.getAll(params),
  });
};

export const useBooking = (id: string) => {
  return useQuery({
    queryKey: ['booking', id],
    queryFn: () => bookingApi.getById(id),
    enabled: !!id,
  });
};

// frontend/lib/api/hooks/useBookings.ts

export const useCreateBooking = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (bookingData: any) => {
      console.log('📤 Sending booking data:', JSON.stringify(bookingData, null, 2));
      try {
        const response = await api.post('/bookings/', bookingData);
        console.log('📥 Full API response:', response);
        console.log('📥 Response data:', response.data);
        console.log('📥 Response status:', response.status);
        
        // Make sure we're returning the data
        if (!response.data) {
          throw new Error('No data received from server');
        }
        
        return response.data;
      } catch (error) {
        console.error('❌ API call failed:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log('✅ Mutation success with data:', data);
      if (data && data.id) {
        console.log('✅ Booking ID:', data.id);
        queryClient.invalidateQueries({ queryKey: ['bookings'] });
        queryClient.invalidateQueries({ queryKey: ['rooms'] });
        toast.success('Booking created successfully!');
      } else {
        console.error('❌ Success but no ID in data:', data);
        toast.success('Booking created but no ID returned?');
      }
    },
    onError: (error: any) => {
      console.error('❌ Mutation error:', error);
      console.error('❌ Error response:', error.response?.data);
      console.error('❌ Error status:', error.response?.status);
      
      let errorMessage = 'Failed to create booking';
      if (error.response?.data) {
        if (typeof error.response.data === 'object') {
          errorMessage = Object.values(error.response.data).join(', ');
        } else {
          errorMessage = error.response.data;
        }
      }
      toast.error(errorMessage);
    },
  });
};

export const useUpdateBooking = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: bookingApi.update,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['booking', data.id] });
      toast.success('Booking updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update booking');
    },
  });
};

export const useCheckIn = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, paymentData }: { id: string; paymentData: { payment_method: string; amount_paid?: number } }) =>
      bookingApi.checkIn(id, paymentData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      toast.success('Guest checked in successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to check in');
    },
  });
};

export const useCheckOut = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: bookingApi.checkOut,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      toast.success('Guest checked out successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to check out');
    },
  });
};

export const useCancelBooking = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: bookingApi.cancel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      toast.success('Booking cancelled');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to cancel booking');
    },
  });
};

export const useTodayBookings = () => {
  return useQuery({
    queryKey: ['bookings', 'today'],
    queryFn: bookingApi.getToday,
  });
};

export const useAvailableRooms = (check_in: string, check_out: string) => {
  return useQuery({
    queryKey: ['rooms', 'available', check_in, check_out],
    queryFn: () => bookingApi.getAvailableRooms(check_in, check_out),
    enabled: !!check_in && !!check_out,
  });
};

export const useBookingStats = () => {
  return useQuery({
    queryKey: ['bookings', 'stats'],
    queryFn: bookingApi.getStats,
  });
};