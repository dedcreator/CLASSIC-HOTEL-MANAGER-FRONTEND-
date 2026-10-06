// frontend/lib/api/hooks/useRooms.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../client';
import toast from 'react-hot-toast';
import { Room, RoomAccessCode, SecurityAuditLog } from '../types';

export type { Room, RoomAccessCode, SecurityAuditLog };

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

  getRoomAccessCodes: async (id: string) => {
    const { data } = await api.get<RoomAccessCode[]>(`/rooms/${id}/access_codes/`);
    return data;
  },

  getRoomAuditLogs: async (id: string) => {
    const { data } = await api.get<SecurityAuditLog[]>(`/rooms/${id}/audit_logs/`);
    return data;
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

export const accessCodeApi = {
  getAll: async (params?: any) => {
    const { data } = await api.get<RoomAccessCode[]>('/rooms/access-codes/', { params });
    return data;
  },

  createEmergency: async (payload: { room_id: string; booking_id?: string; reason: string }) => {
    const { data } = await api.post('/rooms/access-codes/create_emergency/', payload);
    return data;
  },

  requestCleaning: async (payload: { room_id: string; notes?: string }) => {
    const { data } = await api.post('/rooms/access-codes/request_cleaning/', payload);
    return data;
  },

  approveCleaning: async (id: string) => {
    const { data } = await api.post(`/rooms/access-codes/${id}/approve_cleaning/`);
    return data;
  },

  rejectCleaning: async (id: string) => {
    const { data } = await api.post(`/rooms/access-codes/${id}/reject_cleaning/`);
    return data;
  },

  activateRoom: async (id: string) => {
    const { data } = await api.post(`/rooms/access-codes/${id}/activate_room/`);
    return data;
  },

  verify: async (payload: { code: string; room_id?: string }) => {
    const { data } = await api.post('/rooms/access-codes/verify/', payload);
    return data;
  },
};

export const auditLogApi = {
  getAll: async (params?: any) => {
    const { data } = await api.get<SecurityAuditLog[]>('/rooms/audit-logs/', { params });
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
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      queryClient.invalidateQueries({ queryKey: ['room', variables.id] });
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
      queryClient.invalidateQueries({ queryKey: ['audit-logs'] });
      toast.success(`Room status updated to ${variables.status}`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || error.response?.data?.message || 'Failed to update status');
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

// Access Code & Security Hooks
export const useAccessCodes = (params?: any) => {
  return useQuery({
    queryKey: ['access-codes', params],
    queryFn: () => accessCodeApi.getAll(params),
  });
};

export const useAuditLogs = (params?: any) => {
  return useQuery({
    queryKey: ['audit-logs', params],
    queryFn: () => auditLogApi.getAll(params),
  });
};

export const useCreateEmergencyKey = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: accessCodeApi.createEmergency,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      queryClient.invalidateQueries({ queryKey: ['access-codes'] });
      queryClient.invalidateQueries({ queryKey: ['audit-logs'] });
      toast.success(data.message || '1-Hour Emergency Key generated');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to generate emergency key');
    },
  });
};

export const useRequestCleaningKey = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: accessCodeApi.requestCleaning,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      queryClient.invalidateQueries({ queryKey: ['access-codes'] });
      queryClient.invalidateQueries({ queryKey: ['audit-logs'] });
      toast.success(data.message || 'Cleaning key requested');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to request cleaning key');
    },
  });
};

export const useApproveCleaningKey = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: accessCodeApi.approveCleaning,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      queryClient.invalidateQueries({ queryKey: ['access-codes'] });
      queryClient.invalidateQueries({ queryKey: ['audit-logs'] });
      toast.success(data.message || 'Cleaning key approved');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to approve cleaning key');
    },
  });
};

export const useRejectCleaningKey = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: accessCodeApi.rejectCleaning,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      queryClient.invalidateQueries({ queryKey: ['access-codes'] });
      queryClient.invalidateQueries({ queryKey: ['audit-logs'] });
      toast.success(data.message || 'Cleaning key rejected');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to reject cleaning key');
    },
  });
};

export const useActivateCleanedRoom = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: accessCodeApi.activateRoom,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      queryClient.invalidateQueries({ queryKey: ['access-codes'] });
      queryClient.invalidateQueries({ queryKey: ['audit-logs'] });
      toast.success(data.message || 'Room cleaning verified & activated to Available');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to activate room');
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