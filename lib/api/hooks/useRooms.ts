// frontend/lib/api/hooks/useRooms.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../client';
import toast from 'react-hot-toast';

export interface Room {
  id: string;
  room_number: string;
  room_type: 'standard' | 'deluxe' | 'suite' | 'executive' | 'presidential';
  room_type_display: string;
  base_price: number;
  barcode: string;
  status: 'available' | 'occupied' | 'maintenance' | 'cleaning' | 'reserved';
  status_display: string;
  description: string;
  capacity: number;
  name: string;
  size: number;
  amenities: string[];
  rating: number;
  review_count: number;
  is_featured: boolean;
  slug: string;
  created_at: string;
  updated_at: string;
}

export const roomApi = {
  getAll: async (params?: any) => {
    const { data } = await api.get<Room[]>('/rooms/', { params });
    return data;
  },

  getAvailable: async () => {
    const { data } = await api.get<Room[]>('/rooms/available/');
    return data;
  },

  getById: async (id: string) => {
    const { data } = await api.get<Room>(`/rooms/${id}/`);
    return data;
  },

  create: async (roomData: Partial<Room>) => {
    const { data } = await api.post<Room>('/rooms/', roomData);
    return data;
  },

  update: async ({ id, ...roomData }: Partial<Room> & { id: string }) => {
    const { data } = await api.patch<Room>(`/rooms/${id}/`, roomData);
    return data;
  },

  updateStatus: async (id: string, status: string) => {
    const { data } = await api.post(`/rooms/${id}/change_status/`, { status });
    return data;
  },

  delete: async (id: string) => {
    await api.delete(`/rooms/${id}/`);
  },

  // Public endpoints (no auth required)
  getPublicRooms: async (filters?: {
    status?: string;
    room_type?: string;
    is_featured?: boolean;
    search?: string;
    ordering?: string;
  }) => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.room_type) params.append('room_type', filters.room_type);
    if (filters?.is_featured !== undefined) params.append('is_featured', String(filters.is_featured));
    if (filters?.search) params.append('search', filters.search);
    if (filters?.ordering) params.append('ordering', filters.ordering);
    
    const { data } = await api.get(`/rooms/public/?${params.toString()}`);
    return data;
  },

  getPublicRoomBySlug: async (slug: string) => {
    const { data } = await api.get(`/rooms/public/${slug}/`);
    return data;
  },

  checkAvailability: async (checkIn: string, checkOut: string, roomType?: string) => {
    const params = new URLSearchParams({
      check_in: checkIn,
      check_out: checkOut,
    });
    if (roomType) params.append('room_type', roomType);
    
    const { data } = await api.get(`/rooms/public/availability/?${params.toString()}`);
    return data;
  },
};

// ============ ADMIN HOOKS (Require Auth) ============

export const useRooms = (params?: any) => {
  return useQuery({
    queryKey: ['rooms', params],
    queryFn: () => roomApi.getAll(params),
  });
};

export const useAvailableRooms = () => {
  return useQuery({
    queryKey: ['rooms', 'available'],
    queryFn: roomApi.getAvailable,
  });
};

export const useRoom = (id: string) => {
  return useQuery({
    queryKey: ['room', id],
    queryFn: () => roomApi.getById(id),
    enabled: !!id,
  });
};

export const useCreateRoom = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: roomApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      toast.success('Room created successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create room');
    },
  });
};

export const useUpdateRoom = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: roomApi.update,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      queryClient.invalidateQueries({ queryKey: ['room', data.id] });
      toast.success('Room updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update room');
    },
  });
};

export const useUpdateRoomStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => 
      roomApi.updateStatus(id, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      queryClient.invalidateQueries({ queryKey: ['room', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['rooms', 'available'] });
      toast.success(`Room status updated to ${variables.status}`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update status');
    },
  });
};

export const useDeleteRoom = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: roomApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      toast.success('Room deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete room');
    },
  });
};

// ============ PUBLIC HOOKS (No Auth Required) ============

export const usePublicRooms = (filters?: {
  status?: string;
  room_type?: string;
  is_featured?: boolean;
  search?: string;
  ordering?: string;
}) => {
  return useQuery({
    queryKey: ['public-rooms', filters],
    queryFn: () => roomApi.getPublicRooms(filters),
    staleTime: 5 * 60 * 1000,
  });
};

export const usePublicRoom = (slug: string) => {
  return useQuery({
    queryKey: ['public-room', slug],
    queryFn: () => roomApi.getPublicRoomBySlug(slug),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  });
};

export const useCheckAvailability = (checkIn: string, checkOut: string, roomType?: string) => {
  return useQuery({
    queryKey: ['room-availability', checkIn, checkOut, roomType],
    queryFn: () => roomApi.checkAvailability(checkIn, checkOut, roomType),
    enabled: !!checkIn && !!checkOut,
    staleTime: 2 * 60 * 1000,
  });
};