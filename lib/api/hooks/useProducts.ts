// frontend/lib/api/hooks/useProducts.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../client';
import { Product, Batch, StockMovement, StockAlert } from '../types';
import toast from 'react-hot-toast';

export const alertApi = {
  getAll: async (params?: any) => {
    const { data } = await api.get<StockAlert[]>('/stock-alerts/', { params });
    return data;
  },

  checkAll: async () => {
    const { data } = await api.post('/stock-alerts/check_all/');
  
    return data;
  },

  resolve: async (id: string) => {
    const { data } = await api.post<StockAlert>(`/stock-alerts/${id}/resolve/`);
    return data;
  },
};

export const productApi = {
  getAll: async (params?: any) => {
    const { data } = await api.get<Product[]>('/products/', { params });
    return data;
  },

  getById: async (id: string) => {
    const { data } = await api.get<Product>(`/products/${id}/`);
    return data;
  },

  create: async (productData: Partial<Product>) => {
    const { data } = await api.post<Product>('/products/', productData);
    return data;
  },

  update: async ({ id, ...productData }: Partial<Product> & { id: string }) => {
    const { data } = await api.patch<Product>(`/products/${id}/`, productData);
    return data;
  },

  delete: async (id: string) => {
    await api.delete(`/products/${id}/`);
  },

  scanBarcode: async (barcode: string) => {
    const { data } = await api.get<Product>(`/products/scan/?barcode=${barcode}`);
    return data;
  },

  addStock: async ({ id, ...stockData }: { id: string; quantity: number; cost_price?: number; selling_price?: number; supplier?: string; batch_number?: string; notes?: string }) => {
    const { data } = await api.post<Batch>(`/products/${id}/add_stock/`, stockData);
    return data;
  },

  getHistory: async (id: string, days: number = 30) => {
    const { data } = await api.get<{
      product: Product;
      movements: StockMovement[];
      active_batches: Batch[];
    }>(`/products/${id}/history/?days=${days}`);
    return data;
  },
};

// React Query Hooks
export const useProduct = (id: string) => {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => productApi.getById(id),
    enabled: !!id,
  });
};
export const useProducts = (params?: any) => {
  return useQuery({
    queryKey: ['products', params],
    queryFn: async () => {
      const response = await productApi.getAll(params);
      // Return the data directly - it should be an array
      return response;
    },
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: productApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product created successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create product');
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string } & Partial<Product>) => {
      const response = await api.patch(`/products/${id}/`, data);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product', data.id] });
      toast.success('Product updated successfully');
    },
    onError: (error: any) => {
      console.error('Update error:', error.response?.data);
      toast.error(error.response?.data?.message || 'Failed to update product');
    },
  });
};

// frontend/lib/api/hooks/useProducts.ts

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      try {
        await api.delete(`/products/${id}/`);
      } catch (error: any) {
        // Pass through the error with response data
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product deleted successfully');
    },
    onError: (error: any) => {
      console.error('Delete error:', error.response?.data);
      
      // Extract meaningful error message
      let errorMessage = 'Failed to delete product';
      if (error.response?.data) {
        if (typeof error.response.data === 'object') {
          errorMessage = Object.values(error.response.data).join(', ');
        } else {
          errorMessage = error.response.data;
        }
      }
      
      // Don't show toast here - let the component handle it
      // This allows for custom UI in the modal
      throw error;
    },
  });
};

export const useScanBarcode = () => {
  return useMutation({
    mutationFn: productApi.scanBarcode,
  });
};

export const useAddStock = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: productApi.addStock,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['batches'] });
      toast.success('Stock added successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to add stock');
    },
  });
};

export const useProductHistory = (id: string, days?: number) => {
  return useQuery({
    queryKey: ['product-history', id, days],
    queryFn: () => productApi.getHistory(id, days),
    enabled: !!id,
  });
};



export const useAlerts = (params?: any) => {
  return useQuery({
    queryKey: ['alerts', params],
    queryFn: () => alertApi.getAll(params),
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
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to resolve alert');
    },
  });
};