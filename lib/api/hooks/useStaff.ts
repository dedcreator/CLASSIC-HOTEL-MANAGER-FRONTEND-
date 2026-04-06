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
    // Ensure all required fields are present with proper values
    const payload = {
      username: staffData.username.trim(),
      password: staffData.password,
      password2: staffData.password2,
      email: staffData.email.trim(),
      first_name: staffData.first_name?.trim() || '',
      last_name: staffData.last_name?.trim() || '',
      role: staffData.role,
      phone: staffData.phone?.trim() || '',
      is_active: true,
    };
    
    console.log('📤 Creating staff with payload:', payload);
    const { data } = await api.post<Staff>('/auth/staff/', payload);
    console.log('✅ Staff created:', data);
    return data;
  },

  update: async ({ id, ...data }: any) => {
    const response = await api.patch<Staff>(`/auth/staff/${id}/`, data);
    return response.data;
  },

  delete: async (id: string) => {
    await api.delete(`/auth/staff/${id}/`);
  },

  activate: async (id: string) => {
    await api.post(`/auth/staff/${id}/activate/`);
  },

  deactivate: async (id: string) => {
    await api.post(`/auth/staff/${id}/deactivate/`);
  },

  getPerformance: async (id: string, days: number = 30) => {
    const { data } = await api.get<StaffPerformance>(`/auth/staff/${id}/performance/?days=${days}`);
    return data;
  },

  getSummary: async () => {
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
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
      toast.success('Staff member added successfully');
    },
    onError: (error: any) => {
      console.error('❌ Create staff error:', error);
      console.error('Response data:', error.response?.data);
      console.error('Response status:', error.response?.status);
      
      // Handle different error types
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
      } else if (error.response?.status === 403) {
        toast.error('You do not have permission to add staff members');
      } else if (error.response?.data) {
        const errData = error.response.data;
        
        // Handle validation errors
        if (errData.username) {
          toast.error(`Username: ${Array.isArray(errData.username) ? errData.username[0] : errData.username}`);
        } else if (errData.email) {
          toast.error(`Email: ${Array.isArray(errData.email) ? errData.email[0] : errData.email}`);
        } else if (errData.password) {
          toast.error(`Password: ${Array.isArray(errData.password) ? errData.password[0] : errData.password}`);
        } else if (errData.password2) {
          toast.error(`Password confirmation: ${Array.isArray(errData.password2) ? errData.password2[0] : errData.password2}`);
        } else if (errData.non_field_errors) {
          toast.error(errData.non_field_errors[0]);
        } else if (typeof errData === 'object') {
          const firstKey = Object.keys(errData)[0];
          if (firstKey) {
            const firstValue = errData[firstKey];
            toast.error(`${firstKey}: ${Array.isArray(firstValue) ? firstValue[0] : firstValue}`);
          }
        } else {
          toast.error(String(errData));
        }
      } else if (error.message) {
        toast.error(error.message);
      } else {
        toast.error('Failed to add staff member');
      }
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
    onError: (error: any) => {
      console.error('Update error:', error);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Failed to update staff';
      toast.error(errorMessage);
    },
  });
};

export const useDeleteStaff = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: staffApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
      toast.success('Staff member removed');
    },
    onError: (error: any) => {
      console.error('Delete error:', error);
      const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Failed to delete staff';
      toast.error(errorMessage);
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

export const useStaffSales = (staffId: string, params?: {
  days?: number;
  startDate?: string;
  endDate?: string;
}) => {
  return useQuery({
    queryKey: ['staff', staffId, 'sales', params],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      if (params?.days) queryParams.append('days', params.days.toString());
      if (params?.startDate) queryParams.append('start_date', params.startDate);
      if (params?.endDate) queryParams.append('end_date', params.endDate);
      
      const response = await api.get(`/auth/staff/${staffId}/sales/?${queryParams.toString()}`);
      return response.data;
    },
    enabled: !!staffId,
  });
};

export const useStaffBookings = (staffId: string, params?: {
  days?: number;
  startDate?: string;
  endDate?: string;
}) => {
  return useQuery({
    queryKey: ['staff', staffId, 'bookings', params],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      if (params?.days) queryParams.append('days', params.days.toString());
      if (params?.startDate) queryParams.append('start_date', params.startDate);
      if (params?.endDate) queryParams.append('end_date', params.endDate);
      
      const response = await api.get(`/auth/staff/${staffId}/bookings/?${queryParams.toString()}`);
      return response.data;
    },
    enabled: !!staffId,
  });
};

export const useStaffActivities = (staffId: string, params?: {
  days?: number;
  startDate?: string;
  endDate?: string;
}) => {
  return useQuery({
    queryKey: ['staff', staffId, 'activities', params],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      if (params?.days) queryParams.append('days', params.days.toString());
      if (params?.startDate) queryParams.append('start_date', params.startDate);
      if (params?.endDate) queryParams.append('end_date', params.endDate);
      
      const response = await api.get(`/auth/staff/${staffId}/activities/?${queryParams.toString()}`);
      return response.data;
    },
    enabled: !!staffId,
  });
};