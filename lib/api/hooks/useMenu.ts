// frontend/lib/api/hooks/useMenu.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../client';

// Re-export table hooks from useTables
export * from './useTables';

// Category Hooks
export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await api.get('/menu/categories/');
      return response.data;
    },
  });
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post('/menu/categories/', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await api.put(`/menu/categories/${id}/`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/menu/categories/${id}/`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};

// Menu Item Hooks
export const useMenuItems = (filters?: { category?: string; is_available?: boolean }) => {
  return useQuery({
    queryKey: ['menu-items', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.category) params.append('category', filters.category);
      if (filters?.is_available !== undefined) params.append('is_available', String(filters.is_available));
      const response = await api.get(`/menu/items/?${params.toString()}`);
      return response.data;
    },
  });
};

export const useCreateMenuItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post('/menu/items/', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu-items'] });
    },
  });
};

export const useUpdateMenuItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await api.put(`/menu/items/${id}/`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu-items'] });
    },
  });
};

export const useDeleteMenuItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/menu/items/${id}/`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu-items'] });
    },
  });
};

// Order Hooks
export const useCreateOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      table: string;
      customer_name?: string;
      customer_email?: string;
      customer_phone?: string;
      items: Array<{ menu_item_id: string; quantity: number; special_instructions?: string }>;
      notes?: string;
    }) => {
      const response = await api.post('/menu/orders/', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
};

export const useOrders = (filters?: { status?: string; table?: string }) => {
  return useQuery({
    queryKey: ['orders', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.table) params.append('table', filters.table);
      const response = await api.get(`/menu/orders/?${params.toString()}`);
      return response.data;
    },
  });
};

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status, notes }: { id: string; status: string; notes?: string }) => {
      const response = await api.post(`/menu/orders/${id}/update_status/`, { status, notes });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
};

// Public Menu Hooks (no auth required)
export const usePublicMenuItems = (filters?: { category?: string; search?: string }) => {
  return useQuery({
    queryKey: ['public-menu-items', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.category) params.append('category', filters.category);
      if (filters?.search) params.append('search', filters.search);
      const response = await api.get(`/menu/public/items/?${params.toString()}`);
      return response.data;
    },
  });
};

export const usePublicCategories = () => {
  return useQuery({
    queryKey: ['public-categories'],
    queryFn: async () => {
      const response = await api.get('/menu/public/categories/');
      return response.data;
    },
  });
};