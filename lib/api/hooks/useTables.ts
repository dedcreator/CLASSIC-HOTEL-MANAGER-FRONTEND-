// frontend/lib/api/hooks/useTables.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../client';

export interface Table {
  id: string;
  table_number: string;
  name: string;
  slug: string;
  capacity: number;
  status: 'available' | 'occupied' | 'reserved' | 'cleaning' | 'maintenance';
  section: string | null;
  floor: string | null;
  is_active: boolean;
  qr_code: string | null;
  qr_code_url: string | null;
  menu_url: string | null;
  created_by_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateTableData {
  table_number: string;
  name: string;
  capacity: number;
  status?: string;
  section?: string;
  floor?: string;
  is_active?: boolean;
}

// ============ TABLE HOOKS (Authenticated) ============

export const useTables = (filters?: { 
  status?: string; 
  section?: string; 
  is_active?: boolean; 
  search?: string 
}) => {
  return useQuery({
    queryKey: ['tables', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.section) params.append('section', filters.section);
      if (filters?.is_active !== undefined) params.append('is_active', String(filters.is_active));
      if (filters?.search) params.append('search', filters.search);
      const response = await api.get(`/tables/?${params.toString()}`);
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useTable = (id: string) => {
  return useQuery({
    queryKey: ['tables', id],
    queryFn: async () => {
      const response = await api.get(`/tables/${id}/`);
      return response.data;
    },
    enabled: !!id,
  });
};

export const useCreateTable = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateTableData) => {
      const response = await api.post('/tables/', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables'] });
    },
  });
};

export const useUpdateTable = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CreateTableData> }) => {
      const response = await api.put(`/tables/${id}/`, data);
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tables'] });
      queryClient.invalidateQueries({ queryKey: ['tables', variables.id] });
    },
  });
};

export const useDeleteTable = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/tables/${id}/`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables'] });
    },
  });
};

export const useGenerateQR = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.post(`/tables/${id}/generate_qr/`);
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tables'] });
      queryClient.invalidateQueries({ queryKey: ['tables', variables] });
    },
  });
};

export const useUpdateTableStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const response = await api.post(`/tables/${id}/update_status/`, { status });
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tables'] });
      queryClient.invalidateQueries({ queryKey: ['tables', variables.id] });
    },
  });
};

// ============ PUBLIC TABLE HOOKS (No Auth Required) ============

export const usePublicTables = () => {
  return useQuery({
    queryKey: ['public-tables'],
    queryFn: async () => {
      // Use the public endpoint from the tables app
      const response = await api.get('/tables/public/');
      return response.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const usePublicTable = (slug: string) => {
  return useQuery({
    queryKey: ['public-tables', slug],
    queryFn: async () => {
      const response = await api.get(`/tables/public/${slug}/`);
      return response.data;
    },
    enabled: !!slug,
    staleTime: 10 * 60 * 1000,
  });
};