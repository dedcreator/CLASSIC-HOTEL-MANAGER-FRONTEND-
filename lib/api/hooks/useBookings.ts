// frontend/lib/api/hooks/useBookings.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../client';

export interface Guest {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  full_name: string;
  id_number?: string;
  address?: string;
  created_at: string;
}

export interface Booking {
  id: string;
  booking_reference: string;
  guest: string;
  guest_details: Guest;
  guest_name: string;
  room: string;
  room_details: any;
  room_number: string;
  nights: number;
  check_in: string;
  check_out: string;
  adults: number;
  children: number;
  total_nights: number;
  total_amount: number;
  amount_paid: number;
  payment_method: string | null;
  payment_status: 'pending' | 'paid' | 'refunded';
  status: 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled';
  special_requests?: string;
  checked_in_at?: string;
  checked_out_at?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

// ========== GUEST HOOKS ==========

export const useGuests = (search?: string) => {
  return useQuery({
    queryKey: ['guests', search],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      const response = await api.get(`/bookings/guests/?${params.toString()}`);
      return response.data;
    },
  });
};

// Alias for useGuests to maintain compatibility
export const useSearchGuests = useGuests;

export const useCreateGuest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<Guest>) => {
      const response = await api.post('/bookings/guests/', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guests'] });
    },
  });
};

export const useGuest = (id: string) => {
  return useQuery({
    queryKey: ['guest', id],
    queryFn: async () => {
      const response = await api.get(`/bookings/guests/${id}/`);
      return response.data;
    },
    enabled: !!id,
  });
};

// ========== BOOKING HOOKS ==========

export const useBookings = (filters?: { 
  status?: string; 
  room?: string; 
  start_date?: string; 
  end_date?: string;
  search?: string;
}) => {
  return useQuery({
    queryKey: ['bookings', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.room) params.append('room', filters.room);
      if (filters?.start_date) params.append('start_date', filters.start_date);
      if (filters?.end_date) params.append('end_date', filters.end_date);
      if (filters?.search) params.append('search', filters.search);
      const response = await api.get(`/bookings/?${params.toString()}`);
      return response.data;
    },
  });
};

export const useBooking = (id: string) => {
  return useQuery({
    queryKey: ['booking', id],
    queryFn: async () => {
      const response = await api.get(`/bookings/${id}/`);
      return response.data;
    },
    enabled: !!id,
  });
};

export const useCreateBooking = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post('/bookings/', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
    },
  });
};

export const useUpdateBooking = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await api.put(`/bookings/${id}/`, data);
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['booking', variables.id] });
    },
  });
};

export const useDeleteBooking = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/bookings/${id}/`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
};

// ========== CHECK-IN / CHECK-OUT HOOKS ==========

export const useCheckIn = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, paymentData }: { id: string; paymentData: any }) => {
      const response = await api.post(`/bookings/${id}/check_in/`, paymentData);
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['booking', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
    },
  });
};

export const useConfirmCheckinPayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.post(`/bookings/${id}/confirm_checkin_payment/`);
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['booking', variables] });
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
    },
  });
};

export const useCheckOut = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await api.post(`/bookings/${id}/check_out/`, data);
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['booking', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
    },
  });
};

export const useCancelBooking = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.post(`/bookings/${id}/cancel/`);
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['booking', variables] });
    },
  });
};

export const useAddBookingCharge = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: { amount: number; description?: string } }) => {
      const response = await api.post(`/bookings/${id}/add_charge/`, data);
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['booking', variables.id] });
    },
  });
};

// ========== STATS & TODAY HOOKS ==========

export const useBookingStats = () => {
  return useQuery({
    queryKey: ['booking-stats'],
    queryFn: async () => {
      const response = await api.get('/bookings/stats/');
      return response.data;
    },
  });
};

export const useTodayBookings = () => {
  return useQuery({
    queryKey: ['today-bookings'],
    queryFn: async () => {
      const response = await api.get('/bookings/today/');
      return response.data;
    },
  });
};

// ========== PUBLIC BOOKING HOOKS ==========

export const usePublicBooking = () => {
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post('/bookings/public/', data);
      return response.data;
    },
  });
};

export const usePublicAvailability = (params: { check_in: string; check_out: string; room_type?: string }) => {
  return useQuery({
    queryKey: ['public-availability', params],
    queryFn: async () => {
      const searchParams = new URLSearchParams({
        check_in: params.check_in,
        check_out: params.check_out,
      });
      if (params.room_type) searchParams.append('room_type', params.room_type);
      const response = await api.get(`/bookings/public/availability/?${searchParams.toString()}`);
      return response.data;
    },
    enabled: !!params.check_in && !!params.check_out,
  });
};