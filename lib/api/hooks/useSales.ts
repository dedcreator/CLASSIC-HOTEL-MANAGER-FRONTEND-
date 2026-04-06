// frontend/lib/api/hooks/useSales.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../client';
import { Sale, TodaySales, RevenueReport } from '../types';
import toast from 'react-hot-toast';

export const salesApi = {
  getAll: async (params?: any) => {
    const { data } = await api.get<Sale[]>('/sales/', { params });
    return data;
  },

  getById: async (id: string) => {
    const { data } = await api.get<Sale>(`/sales/${id}/`);
    return data;
  },

  create: async (saleData: any) => {
    const { data } = await api.post<Sale>('/sales/', saleData);
    return data;
  },

  getTodaySales: async () => {
    const { data } = await api.get<TodaySales>('/sales/today/');
    return data;
  },

  getRevenueReport: async (period: 'weekly' | 'monthly' | 'yearly' = 'weekly') => {
    const { data } = await api.get<RevenueReport[]>(`/sales/revenue_report/?period=${period}`);
    return data;
  },
};

export const useSales = (params?: any) => {
  return useQuery({
    queryKey: ['sales', params],
    queryFn: () => salesApi.getAll(params),
  });
};

export const useSale = (id: string) => {
  return useQuery({
    queryKey: ['sale', id],
    queryFn: () => salesApi.getById(id),
    enabled: !!id,
  });
};

export const useCreateSale = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (saleData: any) => {
      console.log('Creating sale with data:', saleData);
      const response = await salesApi.create(saleData);
      return response;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['today-sales'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['revenue-report'] });
      toast.success('Sale completed successfully');
    },
    onError: (error: any) => {
      console.error('Sale creation error:', error);
      
      // Extract meaningful error message
      let errorMessage = 'Failed to complete sale';
      
      if (error.response?.data) {
        const errorData = error.response.data;
        
        if (typeof errorData === 'string') {
          errorMessage = errorData;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        } else if (errorData.detail) {
          errorMessage = errorData.detail;
        } else if (errorData.non_field_errors) {
          errorMessage = errorData.non_field_errors[0];
        } else if (errorData.items) {
          errorMessage = `Items error: ${JSON.stringify(errorData.items)}`;
        } else if (typeof errorData === 'object') {
          const firstKey = Object.keys(errorData)[0];
          if (firstKey) {
            const firstValue = errorData[firstKey];
            errorMessage = `${firstKey}: ${Array.isArray(firstValue) ? firstValue[0] : firstValue}`;
          }
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
      throw error;
    },
  });
};

export const useTodaySales = () => {
  return useQuery({
    queryKey: ['today-sales'],
    queryFn: salesApi.getTodaySales,
  });
};

export const useRevenueReport = (period: 'weekly' | 'monthly' | 'yearly' = 'weekly') => {
  return useQuery({
    queryKey: ['revenue-report', period],
    queryFn: () => salesApi.getRevenueReport(period),
  });
};