import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  isActive: boolean;
  sortOrder: number;
  parentId: string | null;
  children: Category[] | null;
}

export const useCategories = () => {
  return useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data } = await api.get('/categories');
      return data; // Returns the tree of categories
    },
    // Categories change rarely, cache for a longer time
    staleTime: 5 * 60 * 1000,
  });
};

export const useCategoryBySlug = (slug: string) => {
  return useQuery<Category>({
    queryKey: ['category', slug],
    queryFn: async () => {
      const { data } = await api.get(`/categories/slug/${slug}`);
      return data;
    },
    enabled: !!slug,
  });
};
