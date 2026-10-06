// frontend/lib/api/hooks/useReports.ts
import { useQuery, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import api from '../client';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';

// ============= TYPES =============

export type PeriodType = 'daily' | 'weekly' | 'monthly' | 'yearly';
export type ExportFormat = 'pdf' | 'excel' | 'csv';

export interface RevenueData {
  name: string;
  revenue: number;
  sale_revenue: number;
  order_revenue: number;
  booking_revenue: number;
  expenses: number;
  profit: number;
  transactions: number;
  sale_count: number;
  order_count: number;
  booking_count: number;
}

export interface SalesSummary {
  period: string;
  start_date: string;
  sales: {
    total_revenue: number;
    transactions: number;
    payment_methods: Array<{
      method: string;
      amount: number;
      count: number;
    }>;
  };
  orders: {
    total_revenue: number;
    count: number;
    statuses: Array<{
      status: string;
      count: number;
    }>;
  };
  bookings: {
    total_revenue: number;
    count: number;
    statuses: Array<{
      status: string;
      count: number;
    }>;
  };
  total_revenue: number;
}

export interface TopProduct {
  name: string;
  quantity: number;
  revenue: number;
  source?: 'POS' | 'Menu';
}

export interface TopProductsResponse {
  by_quantity: TopProduct[];
  by_revenue: TopProduct[];
  period: string;
}

export interface MenuPerformance {
  category_id: string;
  category_name: string;
  items_count: number;
  total_orders: number;
  total_quantity: number;
  total_revenue: number;
  avg_order_value: number;
}

export interface InventoryReport {
  summary: {
    total_products: number;
    low_stock: number;
    out_of_stock: number;
    total_value: number;
  };
  by_category: Array<{
    category: string;
    stock: number;
    value: number;
  }>;
  recent_movements: Array<{
    id: string;
    product: string;
    type: string;
    quantity: number;
    date: string;
  }>;
}

export interface StaffPerformance {
  id: string;
  name: string;
  role: string;
  transactions: number;
  orders_handled: number;
  bookings_handled: number;
  total_handled: number;
  revenue: number;
  order_revenue: number;
  booking_revenue: number;
  total_revenue_handled: number;
  avg_sale: number;
}

export interface OccupancyData {
  date: string;
  occupied: number;
  occupancy_rate: number;
  revenue: number;
}

export interface DashboardStats {
  period: string;
  total_revenue: number;
  sales: {
    total: number;
    count: number;
    today_revenue: number;
    today_count: number;
  };
  orders: {
    total_revenue: number;
    count: number;
    pending: number;
  };
  bookings: {
    total_revenue: number;
    count: number;
    active: number;
  };
  summary: {
    total_transactions: number;
    average_order_value: number;
  };
}

// ============= API FUNCTIONS =============

export const reportsApi = {
  /**
   * Get revenue report data for charts
   */
  getRevenueReport: async (period: PeriodType = 'monthly'): Promise<RevenueData[]> => {
    const { data } = await api.get(`/reports/revenue/?period=${period}`);
    return data;
  },

  /**
   * Get sales summary with menu and booking data
   */
  getSalesSummary: async (period: 'today' | 'week' | 'month' | 'year' = 'month'): Promise<SalesSummary> => {
    const { data } = await api.get(`/reports/sales-summary/?period=${period}`);
    return data;
  },

  /**
   * Get top selling products from sales and menu orders
   */
  getTopProducts: async (limit: number = 10, period: string = 'month'): Promise<TopProductsResponse> => {
    const { data } = await api.get(`/reports/top-products/?limit=${limit}&period=${period}`);
    return data;
  },

  /**
   * Get menu performance metrics by category
   */
  getMenuPerformance: async (period: string = 'month'): Promise<MenuPerformance[]> => {
    const { data } = await api.get(`/reports/menu-performance/?period=${period}`);
    return data;
  },

  /**
   * Get inventory summary report
   */
  getInventoryReport: async (): Promise<InventoryReport> => {
    const { data } = await api.get('/reports/inventory/');
    return data;
  },

  /**
   * Get staff performance metrics
   */
  getStaffPerformance: async (period: 'week' | 'month' | 'year' = 'month'): Promise<StaffPerformance[]> => {
    const { data } = await api.get(`/reports/staff-performance/?period=${period}`);
    return data;
  },

  /**
   * Get room occupancy metrics
   */
  getOccupancyReport: async (period: string = 'month'): Promise<OccupancyData[]> => {
    const { data } = await api.get(`/reports/occupancy/?period=${period}`);
    return data;
  },

  /**
   * Get dashboard statistics in one call
   */
  getDashboardStats: async (): Promise<DashboardStats> => {
    const { data } = await api.get('/reports/dashboard-stats/');
    return data;
  },

  /**
   * Export report as PDF, Excel, or CSV
   */
  exportReport: async (
    reportType: string,
    format: ExportFormat = 'csv',
    period: string = 'month'
  ): Promise<Blob> => {
    const { data } = await api.get(`/reports/export/${reportType}/?format=${format}&period=${period}`, {
      responseType: 'blob',
    });
    return data;
  },

  /**
   * Generate a custom report with date range
   */
  getCustomReport: async (startDate: Date, endDate: Date): Promise<any> => {
    const { data } = await api.get('/reports/custom/', {
      params: {
        start_date: format(startDate, 'yyyy-MM-dd'),
        end_date: format(endDate, 'yyyy-MM-dd'),
      },
    });
    return data;
  },
};

// ============= REACT QUERY HOOKS =============

/**
 * Hook for revenue report data
 */
export const useRevenueReport = (
  period: PeriodType = 'monthly',
  options?: Omit<UseQueryOptions<RevenueData[]>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['reports', 'revenue', period],
    queryFn: () => reportsApi.getRevenueReport(period),
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};

/**
 * Hook for sales summary
 */
export const useSalesSummary = (
  period: 'today' | 'week' | 'month' | 'year' = 'month',
  options?: Omit<UseQueryOptions<SalesSummary>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['reports', 'sales-summary', period],
    queryFn: () => reportsApi.getSalesSummary(period),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

/**
 * Hook for top products
 */
export const useTopProducts = (
  limit: number = 10,
  period: string = 'month',
  options?: Omit<UseQueryOptions<TopProductsResponse>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['reports', 'top-products', limit, period],
    queryFn: () => reportsApi.getTopProducts(limit, period),
    staleTime: 10 * 60 * 1000, // 10 minutes
    ...options,
  });
};

/**
 * Hook for menu performance
 */
export const useMenuPerformance = (
  period: string = 'month',
  options?: Omit<UseQueryOptions<MenuPerformance[]>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['reports', 'menu-performance', period],
    queryFn: () => reportsApi.getMenuPerformance(period),
    staleTime: 10 * 60 * 1000,
    ...options,
  });
};

/**
 * Hook for inventory report
 */
export const useInventoryReport = (
  options?: Omit<UseQueryOptions<InventoryReport>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['reports', 'inventory'],
    queryFn: reportsApi.getInventoryReport,
    staleTime: 15 * 60 * 1000, // 15 minutes
    ...options,
  });
};

/**
 * Hook for staff performance
 */
export const useStaffPerformance = (
  period: 'week' | 'month' | 'year' = 'month',
  options?: Omit<UseQueryOptions<StaffPerformance[]>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['reports', 'staff-performance', period],
    queryFn: () => reportsApi.getStaffPerformance(period),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

/**
 * Hook for occupancy report
 */
export const useOccupancyReport = (
  period: string = 'month',
  options?: Omit<UseQueryOptions<OccupancyData[]>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['reports', 'occupancy', period],
    queryFn: () => reportsApi.getOccupancyReport(period),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

/**
 * Hook for dashboard statistics
 */
export const useDashboardStats = (
  options?: Omit<UseQueryOptions<DashboardStats>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['reports', 'dashboard-stats'],
    queryFn: reportsApi.getDashboardStats,
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
    ...options,
  });
};

/**
 * Hook for custom report with date range
 */
export const useCustomReport = (
  startDate: Date,
  endDate: Date,
  options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['reports', 'custom', format(startDate, 'yyyy-MM-dd'), format(endDate, 'yyyy-MM-dd')],
    queryFn: () => reportsApi.getCustomReport(startDate, endDate),
    enabled: !!startDate && !!endDate,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

// ============= UTILITY HOOKS =============

/**
 * Hook to get predefined date ranges
 */
export const useDatePresets = () => {
  const today = new Date();
  
  return {
    today: { start: today, end: today },
    yesterday: { start: subDays(today, 1), end: subDays(today, 1) },
    last7Days: { start: subDays(today, 7), end: today },
    last30Days: { start: subDays(today, 30), end: today },
    thisMonth: { start: startOfMonth(today), end: today },
    lastMonth: { start: startOfMonth(subDays(today, 30)), end: endOfMonth(subDays(today, 30)) },
    thisYear: { start: new Date(today.getFullYear(), 0, 1), end: today },
  };
};

/**
 * Hook to invalidate all report queries (useful after data changes)
 */
export const useInvalidateReports = () => {
  const queryClient = useQueryClient();
  
  return () => {
    queryClient.invalidateQueries({ queryKey: ['reports'] });
  };
};

/**
 * Hook to export a report with loading state
 */
export const useExportReport = () => {
  return async (reportType: string, exportFormat: ExportFormat = 'csv', period: string = 'month') => {
    try {
      const blob = await reportsApi.exportReport(reportType, exportFormat, period);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${reportType}_report_${format(new Date(), 'yyyy-MM-dd')}.${exportFormat}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      return { success: true };
    } catch (error) {
      console.error('Export failed:', error);
      return { success: false, error };
    }
  };
};

// ============= DEFAULT EXPORT =============

const useReports = {
  useRevenueReport,
  useSalesSummary,
  useTopProducts,
  useMenuPerformance,
  useInventoryReport,
  useStaffPerformance,
  useOccupancyReport,
  useDashboardStats,
  useCustomReport,
  useDatePresets,
  useInvalidateReports,
  useExportReport,
  reportsApi,
};

export default useReports;