// frontend/lib/api/hooks/useAlerts.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../client';
import { StockAlert } from '../types';
import toast from 'react-hot-toast';

export const alertApi = {
  getAll: async (params?: any) => {
    const { data } = await api.get<StockAlert[]>('/low-stock-alerts/', { params });
    return data;
  },

  checkAll: async () => {
    const { data } = await api.post('/low-stock-alerts/check_all/');
    return data;
  },

  resolve: async (id: string) => {
    const { data } = await api.post<StockAlert>(`/low-stock-alerts/${id}/resolve/`);
    return data;
  },
};

export const useAlerts = (params?: any) => {
  return useQuery({
    queryKey: ['alerts', params],
    queryFn: () => alertApi.getAll(params),
  });
};

export const useCheckAlerts = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: alertApi.checkAll,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      toast.success('Alerts checked successfully');
    },
  });
};

export const useResolveAlert = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: alertApi.resolve,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      toast.success('Alert resolved');
    },
  });
};