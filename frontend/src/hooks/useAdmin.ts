import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

// ===== Dashboard Stats =====
export function useDashboardStats() {
  return useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn: async () => {
      const { data } = await api.get('/admin/dashboard');
      return data;
    },
    staleTime: 30 * 1000, // 30 seconds
  });
}

// ===== Orders List =====
export function useAdminOrders(params: {
  status?: string;
  search?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: string;
}) {
  return useQuery({
    queryKey: ['admin', 'orders', params],
    queryFn: async () => {
      const { data } = await api.get('/admin/orders', { params });
      return data;
    },
    staleTime: 15 * 1000,
  });
}

// ===== Single Order Detail =====
export function useAdminOrderDetail(orderId: string) {
  return useQuery({
    queryKey: ['admin', 'orders', orderId],
    queryFn: async () => {
      const { data } = await api.get(`/admin/orders/${orderId}`);
      return data;
    },
    enabled: !!orderId,
  });
}
