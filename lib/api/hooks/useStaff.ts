// frontend/lib/api/hooks/useStaff.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../client';
import { Staff, StaffPerformance, StaffSummary } from '../types';
import toast from 'react-hot-toast';

export const staffApi = {
  getAll: async (params?: any) => {
    const { data } = await api.get<Staff[]>('/auth/staff/', { params });
    return data;
  },

  getById: async (id: string) => {
    const { data } = await api.get<Staff>(`/auth/staff/${id}/`);
    return data;
  },

  create: async (staffData: any) => {
    // Change from '/accounts/staff/' to '/auth/staff/'
    const { data } = await api.post<Staff>('/auth/staff/', staffData);
    return data;
  },

  update: async ({ id, ...data }: any) => {
    // Change from '/accounts/staff/${id}/' to '/auth/staff/${id}/'
    const response = await api.patch<Staff>(`/auth/staff/${id}/`, data);
    return response.data;
  },

  delete: async (id: string) => {
    // Change from '/accounts/staff/${id}/' to '/auth/staff/${id}/'
    await api.delete(`/auth/staff/${id}/`);
  },

  activate: async (id: string) => {
    // Change from '/accounts/staff/${id}/activate/' to '/auth/staff/${id}/activate/'
    await api.post(`/auth/staff/${id}/activate/`);
  },

  deactivate: async (id: string) => {
    // Change from '/accounts/staff/${id}/deactivate/' to '/auth/staff/${id}/deactivate/'
    await api.post(`/auth/staff/${id}/deactivate/`);
  },

  getPerformance: async (id: string, days: number = 30) => {
    // Change from '/accounts/staff/${id}/performance/' to '/auth/staff/${id}/performance/'
    const { data } = await api.get<StaffPerformance>(`/auth/staff/${id}/performance/?days=${days}`);
    return data;
  },

  getSummary: async () => {
    // Change from '/accounts/staff/summary/' to '/auth/staff/summary/'
    const { data } = await api.get<StaffSummary>('/auth/staff/summary/');
    return data;
  },
};

export const useStaff = (params?: any) => {
  return useQuery({
    queryKey: ['staff', params],
    queryFn: () => staffApi.getAll(params),
  });
};

export const useStaffMember = (id: string) => {
  return useQuery({
    queryKey: ['staff', id],
    queryFn: () => staffApi.getById(id),
    enabled: !!id,
  });
};

export const useCreateStaff = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: staffApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
      toast.success('Staff member added successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to add staff');
    },
  });
};

export const useUpdateStaff = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: staffApi.update,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
      queryClient.invalidateQueries({ queryKey: ['staff', variables.id] });
      toast.success('Staff updated successfully');
    },
  });
};

export const useDeleteStaff = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: staffApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
      toast.success('Staff removed');
    },
  });
};

export const useStaffPerformance = (id: string, days: number = 30) => {
  return useQuery({
    queryKey: ['staff', id, 'performance', days],
    queryFn: () => staffApi.getPerformance(id, days),
    enabled: !!id,
  });
};

export const useStaffSummary = () => {
  return useQuery({
    queryKey: ['staff', 'summary'],
    queryFn: staffApi.getSummary,
  });
};