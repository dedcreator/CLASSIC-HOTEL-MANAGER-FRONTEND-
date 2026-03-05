// frontend/lib/api/hooks/useRooms.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../client';
import { Room } from '../types';
import toast from 'react-hot-toast';

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
};

// React Query Hooks
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