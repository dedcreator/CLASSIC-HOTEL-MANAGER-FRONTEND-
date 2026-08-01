// frontend/lib/api/hooks/usePayments.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../client';

export interface Payment {
  id: string;
  transaction_id: string;
  korapay_reference: string;
  amount: number;
  currency: string;
  payment_method: string;
  payment_type: 'sale' | 'booking' | 'checkin' | 'deposit' | 'partial' | 'full';
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded';
  sale_id?: string;
  booking_id?: string;
  checkin_id?: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  description: string;
  created_at: string;
  updated_at: string;
  paid_at: string;
}

export interface InitializePaymentData {
  payment_type: Payment['payment_type'];
  amount?: number;
  sale_id?: string;
  booking_id?: string;
  checkin_id?: string;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  reference?: string;
  callback_url?: string;
  description?: string;
  metadata?: Record<string, any>;
}

export const useInitializePayment = () => {
  return useMutation({
    mutationFn: async (data: InitializePaymentData) => {
      const response = await api.post('/payments/initialize/', data);
      return response.data;
    },
  });
};

export const useVerifyPayment = () => {
  return useMutation({
    mutationFn: async (reference: string) => {
      const response = await api.post('/payments/verify/', { reference });
      return response.data;
    },
  });
};

export const useRefundPayment = () => {
  return useMutation({
    mutationFn: async ({ paymentId, amount, reason }: { paymentId: string; amount?: number; reason?: string }) => {
      const response = await api.post(`/payments/${paymentId}/refund/`, { amount, reason });
      return response.data;
    },
  });
};

export const usePaymentLogs = (paymentId: string) => {
  return useQuery({
    queryKey: ['payment-logs', paymentId],
    queryFn: async () => {
      const response = await api.get(`/payments/${paymentId}/logs/`);
      return response.data;
    },
    enabled: !!paymentId,
  });
};

export const usePayments = (filters?: { status?: string; payment_type?: string }) => {
  return useQuery({
    queryKey: ['payments', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.payment_type) params.append('payment_type', filters.payment_type);
      const response = await api.get(`/payments/?${params.toString()}`);
      return response.data;
    },
  });
};