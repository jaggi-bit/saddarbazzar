import { create } from 'zustand';
import api from '@/lib/api';

export interface CartItem {
  id: string;
  product: {
    id: string;
    name: string;
    price: number;
    compareAtPrice?: number;
    imageUrl?: string;
    categoryName?: string;
    stockQuantity: number;
  };
  quantity: number;
  itemTotal: number;
}

export interface Cart {
  id: string;
  items: CartItem[];
  subtotal: number;
}

interface CartStore {
  cart: Cart | null;
  isLoading: boolean;
  error: string | null;
  isOpen: boolean; // Controls whether Cart Drawer is open
  
  fetchCart: () => Promise<void>;
  addItem: (productId: string, quantity: number) => Promise<boolean>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  setIsOpen: (isOpen: boolean) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartStore>((set, get) => ({
  cart: null,
  isLoading: false,
  error: null,
  isOpen: false,

  fetchCart: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/cart');
      set({ cart: response.data, isLoading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to fetch cart', isLoading: false });
    }
  },

  addItem: async (productId: string, quantity: number) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/cart/items', { productId, quantity });
      set({ cart: response.data, isLoading: false, isOpen: true });
      return true;
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to add item', isLoading: false });
      return false;
    }
  },

  updateQuantity: async (itemId: string, quantity: number) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.put(`/cart/items/${itemId}`, { quantity });
      set({ cart: response.data, isLoading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to update quantity', isLoading: false });
    }
  },

  removeItem: async (itemId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.delete(`/cart/items/${itemId}`);
      set({ cart: response.data, isLoading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to remove item', isLoading: false });
    }
  },

  setIsOpen: (isOpen: boolean) => set({ isOpen }),
  
  clearCart: () => set({ cart: null })
}));
