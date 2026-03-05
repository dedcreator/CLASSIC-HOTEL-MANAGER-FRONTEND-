// frontend/lib/api/hooks/useSales.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../client';
import { Sale, Customer, SavedCart } from '../types';  // Add Customer and SavedCart here
import toast from 'react-hot-toast';

export const saleApi = {
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

  getToday: async () => {
    const { data } = await api.get('/sales/today/');
    return data;
  },

  getRevenueReport: async (period: string) => {
    const { data } = await api.get(`/sales/revenue_report/?period=${period}`);
    return data;
  },

  getTopProducts: async (days: number = 30) => {
    const { data } = await api.get(`/sales/top_products/?days=${days}`);
    return data;
  },
};

export const useSales = (params?: any) => {
  return useQuery({
    queryKey: ['sales', params],
    queryFn: () => saleApi.getAll(params),
  });
};

export const useSale = (id: string) => {
  return useQuery({
    queryKey: ['sale', id],
    queryFn: () => saleApi.getById(id),
    enabled: !!id,
  });
};

export const useCreateSale = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: saleApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Sale completed successfully!');
    },
    onError: (error: any) => {
      console.error('Sale error:', error.response?.data);
      toast.error(error.response?.data?.message || 'Failed to complete sale');
    },
  });
};

export const useTodaySales = () => {
  return useQuery({
    queryKey: ['sales', 'today'],
    queryFn: saleApi.getToday,
  });
};

export const useRevenueReport = (period: string) => {
  return useQuery({
    queryKey: ['sales', 'revenue', period],
    queryFn: () => saleApi.getRevenueReport(period),
  });
};

export const useTopProducts = (days: number = 30) => {
  return useQuery({
    queryKey: ['sales', 'top-products', days],
    queryFn: () => saleApi.getTopProducts(days),
  });
};

// ========== CUSTOMER API ==========
export const customerApi = {
  getAll: async (params?: any) => {
    const { data } = await api.get<Customer[]>('/sales/customers/', { params });
    return data;
  },
  getById: async (id: string) => {
    const { data } = await api.get<Customer>(`/sales/customers/${id}/`);
    return data;
  },
  create: async (customerData: Partial<Customer>) => {
    const { data } = await api.post<Customer>('/sales/customers/', customerData);
    return data;
  },
  search: async (query: string) => {
    const { data } = await api.get<Customer[]>(`/sales/customers/?search=${query}`);
    return data;
  },
  addVisit: async (id: string) => {
    const { data } = await api.post(`/sales/customers/${id}/add_visit/`);
    return data;
  }
};

// ========== SAVED CART API ==========
export const savedCartApi = {
  getAll: async (customerId?: string) => {
    const params = customerId ? { customer: customerId } : {};
    const { data } = await api.get<SavedCart[]>('/sales/saved-carts/', { params });
    return data;
  },
  create: async (cartData: any) => {
    const { data } = await api.post<SavedCart>('/sales/saved-carts/', cartData);
    return data;
  },
  complete: async (id: string) => {
    const { data } = await api.post(`/sales/saved-carts/${id}/complete/`);
    return data;
  }
};

// ========== CUSTOMER HOOKS ==========
export const useCustomers = (params?: any) => {
  return useQuery({
    queryKey: ['customers', params],
    queryFn: () => customerApi.getAll(params),
  });
};

export const useCustomer = (id: string) => {
  return useQuery({
    queryKey: ['customer', id],
    queryFn: () => customerApi.getById(id),
    enabled: !!id,
  });
};

export const useCreateCustomer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: customerApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast.success('Customer saved successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to save customer');
    },
  });
};

export const useSearchCustomers = (query: string) => {
  return useQuery({
    queryKey: ['customers', 'search', query],
    queryFn: () => customerApi.search(query),
    enabled: query.length > 2,
  });
};

// ========== SAVED CART HOOKS ==========
export const useSavedCarts = (customerId?: string) => {
  return useQuery({
    queryKey: ['saved-carts', customerId],
    queryFn: () => savedCartApi.getAll(customerId),
  });
};

export const useCreateSavedCart = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: savedCartApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-carts'] });
      toast.success('Cart saved for later');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to save cart');
    },
  });
};

export const useCompleteSavedCart = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: savedCartApi.complete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-carts'] });
      toast.success('Cart completed');
    },
  });
};