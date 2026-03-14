// frontend/lib/api/hooks/useExpenses.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../client';
import { Expense, ExpenseCategory, ExpenseSummary } from '../types';
import toast from 'react-hot-toast';

export const expenseApi = {
  // Categories
  getCategories: async () => {
    const { data } = await api.get<ExpenseCategory[]>('/consumables/categories/');
    return data;
  },
  
  createCategory: async (categoryData: Partial<ExpenseCategory>) => {
    const { data } = await api.post<ExpenseCategory>('/consumables/categories/', categoryData);
    return data;
  },
  
  updateCategory: async ({ id, ...data }: Partial<ExpenseCategory> & { id: string }) => {
    const response = await api.patch<ExpenseCategory>(`/consumables/categories/${id}/`, data);
    return response.data;
  },
  
  deleteCategory: async (id: string) => {
    await api.delete(`/consumables/categories/${id}/`);
  },
  
  // Expenses
  getExpenses: async (params?: any) => {
    const { data } = await api.get<Expense[]>('/consumables/expenses/', { params });
    return data;
  },
  
  getExpense: async (id: string) => {
    const { data } = await api.get<Expense>(`/consumables/expenses/${id}/`);
    return data;
  },
  
  createExpense: async (expenseData: any) => {
    const { data } = await api.post<Expense>('/consumables/expenses/', expenseData);
    return data;
  },
  
  updateExpense: async ({ id, ...data }: any) => {
    const response = await api.patch<Expense>(`/consumables/expenses/${id}/`, data);
    return response.data;
  },
  
  deleteExpense: async (id: string) => {
    await api.delete(`/consumables/expenses/${id}/`);
  },
  
  getSummary: async () => {
    const { data } = await api.get<ExpenseSummary>('/consumables/expenses/summary/');
    return data;
  },
  
  getMyExpenses: async () => {
    const { data } = await api.get<Expense[]>('/consumables/expenses/my_expenses/');
    return data;
  },
};

// React Query Hooks
export const useExpenseCategories = () => {
  return useQuery({
    queryKey: ['expense-categories'],
    queryFn: expenseApi.getCategories,
  });
};

export const useCreateExpenseCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: expenseApi.createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expense-categories'] });
      toast.success('Category created');
    },
  });
};

export const useExpenses = (params?: any) => {
  return useQuery({
    queryKey: ['expenses', params],
    queryFn: () => expenseApi.getExpenses(params),
  });
};

export const useExpense = (id: string) => {
  return useQuery({
    queryKey: ['expense', id],
    queryFn: () => expenseApi.getExpense(id),
    enabled: !!id,
  });
};

export const useCreateExpense = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: expenseApi.createExpense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['expense-summary'] });
      toast.success('Expense recorded');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to record expense');
    },
  });
};

export const useUpdateExpense = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: expenseApi.updateExpense,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['expense', data.id] });
      queryClient.invalidateQueries({ queryKey: ['expense-summary'] });
      toast.success('Expense updated (timestamp recorded)');
    },
  });
};

export const useDeleteExpense = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: expenseApi.deleteExpense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['expense-summary'] });
      toast.success('Expense deleted');
    },
  });
};

export const useExpenseSummary = () => {
  return useQuery({
    queryKey: ['expense-summary'],
    queryFn: expenseApi.getSummary,
  });
};

export const useMyExpenses = () => {
  return useQuery({
    queryKey: ['my-expenses'],
    queryFn: expenseApi.getMyExpenses,
  });
};