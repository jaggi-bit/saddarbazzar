import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

export interface Product {
  id: string;
  sku: string;
  name: string;
  description: string;
  price: number;
  compareAtPrice: number | null;
  stockQuantity: number;
  categoryName: string;
  isFeatured: boolean;
  imageUrl: string;
  additionalImages: string[];
  weightGrams: number | null;
}

export interface PagedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface ProductFilters {
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

export const useProducts = (filters: ProductFilters = {}) => {
  return useQuery<PagedResponse<Product>>({
    queryKey: ['products', filters],
    queryFn: async () => {
      // If there's a search term, hit the search endpoint instead
      if (filters.search) {
        const { data } = await api.get('/products/search', {
          params: {
            q: filters.search,
            page: filters.page || 0,
            size: filters.size || 12
          }
        });
        return data;
      }

      // Otherwise hit standard listing endpoint
      const { data } = await api.get('/products', { params: filters });
      return data;
    },
  });
};

export const useFeaturedProducts = () => {
  return useQuery<Product[]>({
    queryKey: ['products', 'featured'],
    queryFn: async () => {
      const { data } = await api.get('/products/featured');
      return data;
    },
  });
};

export const useProduct = (id: string, enabled = true) => {
  return useQuery<Product>({
    queryKey: ['product', id],
    queryFn: async () => {
      const { data } = await api.get(`/products/${id}`);
      return data;
    },
    enabled: !!id && enabled,
  });
};
