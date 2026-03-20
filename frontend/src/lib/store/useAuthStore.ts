import { create } from 'zustand';
import api from '../api';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: string;
}

interface AuthState {
  user: User | null;
  isGuest: boolean;
  isLoading: boolean;
  isAuthenticated: boolean;
  checkAuth: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isGuest: true, // Default to guest until proven otherwise
  isLoading: true,
  isAuthenticated: false,

  checkAuth: async () => {
    try {
      set({ isLoading: true });
      
      // 1. Try to fetch the current user
      const { data } = await api.get('/auth/me');
      
      if (data.isGuest) {
        // 2. If guest, ensure guest session exists
        await api.post('/auth/guest-session');
        set({ user: null, isGuest: true, isAuthenticated: false, isLoading: false });
      } else {
        // 3. User is logged in
        // Still ensure a guest session token isn't needed, but typically backend handles this
        set({ user: data, isGuest: false, isAuthenticated: true, isLoading: false });
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      // Fallback to ensuring guest session if backend unauthenticated
      try {
        await api.post('/auth/guest-session');
      } catch (e) {
        console.error("Guest session creation failed:", e);
      }
      set({ user: null, isGuest: true, isAuthenticated: false, isLoading: false });
    }
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
      // After logout, immediately create a new guest session
      await api.post('/auth/guest-session');
      set({ user: null, isGuest: true, isAuthenticated: false });
    } catch (error) {
      console.error('Logout failed', error);
    }
  }
}));
