// frontend/lib/api/hooks/useReports.ts
import { useQuery } from '@tanstack/react-query';
import api from '../client';

export const reportsApi = {
  // Revenue reports
  getRevenueReport: async (period: 'daily' | 'weekly' | 'monthly' | 'yearly') => {
    const { data } = await api.get(`/reports/revenue/?period=${period}`);
    return data;
  },

  // Top products
  getTopProducts: async (limit: number = 10, period: string = 'month') => {
    const { data } = await api.get(`/reports/top-products/?limit=${limit}&period=${period}`);
    return data;
  },

  // Inventory report
  getInventoryReport: async () => {
    const { data } = await api.get('/reports/inventory/');
    return data;
  },

  // Staff performance
  getStaffPerformance: async (period: 'weekly' | 'monthly' = 'monthly') => {
    const { data } = await api.get(`/reports/staff-performance/?period=${period}`);
    return data;
  },

  // Occupancy report
  getOccupancyReport: async (period: string = 'month') => {
    const { data } = await api.get(`/reports/occupancy/?period=${period}`);
    return data;
  },

  // Export report
  exportReport: async (reportType: string, format: 'pdf' | 'excel', period: string) => {
    const { data } = await api.get(`/reports/export/${reportType}/?format=${format}&period=${period}`, {
      responseType: 'blob',
    });
    return data;
  },
};

// React Query Hooks
export const useRevenueReport = (period: 'daily' | 'weekly' | 'monthly' | 'yearly') => {
  return useQuery({
    queryKey: ['reports', 'revenue', period],
    queryFn: () => reportsApi.getRevenueReport(period),
  });
};

export const useTopProducts = (limit: number = 10, period: string = 'month') => {
  return useQuery({
    queryKey: ['reports', 'top-products', limit, period],
    queryFn: () => reportsApi.getTopProducts(limit, period),
  });
};

export const useInventoryReport = () => {
  return useQuery({
    queryKey: ['reports', 'inventory'],
    queryFn: reportsApi.getInventoryReport,
  });
};

export const useStaffPerformance = (period: 'weekly' | 'monthly' = 'monthly') => {
  return useQuery({
    queryKey: ['reports', 'staff-performance', period],
    queryFn: () => reportsApi.getStaffPerformance(period),
  });
};

export const useOccupancyReport = (period: string = 'month') => {
  return useQuery({
    queryKey: ['reports', 'occupancy', period],
    queryFn: () => reportsApi.getOccupancyReport(period),
  });
};