// frontend/lib/api/hooks/useBatches.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../client';
import { Batch } from '../types';
import toast from 'react-hot-toast';

export const batchApi = {
  getAll: async (params?: any) => {
    const { data } = await api.get<Batch[]>('/batches/', { params });
    return data;
  },

  getById: async (id: string) => {
    const { data } = await api.get<Batch>(`/batches/${id}/`);
    return data;
  },

  adjust: async ({ id, quantity, reason }: { id: string; quantity: number; reason: string }) => {
    const { data } = await api.post<Batch>(`/batches/${id}/adjust/`, { quantity, reason });
    return data;
  },
};

export const useBatches = (params?: any) => {
  return useQuery({
    queryKey: ['batches', params],
    queryFn: () => batchApi.getAll(params),
  });
};

export const useBatch = (id: string) => {
  return useQuery({
    queryKey: ['batch', id],
    queryFn: () => batchApi.getById(id),
    enabled: !!id,
  });
};

export const useAdjustBatch = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: batchApi.adjust,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['batches'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Batch adjusted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to adjust batch');
    },
  });
};