'use client';

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'admin' | 'technician' | 'customer';
  phone?: string;
  companyName?: string;
}

export interface UserState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  setUser: (user: User | null) => void;
  setIsAuthenticated: (authenticated: boolean) => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
}

export const useUserStore = create<UserState>()(
  devtools(
    persist(
      (set) => ({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,

        setUser: (user) => set({ user, isAuthenticated: user !== null }),

        setIsAuthenticated: (authenticated) => set({ isAuthenticated: authenticated }),

        setIsLoading: (loading) => set({ isLoading: loading }),

        setError: (error) => set({ error }),

        logout: () =>
          set({
            user: null,
            isAuthenticated: false,
            error: null,
          }),

        updateUser: (updates) =>
          set((state) => ({
            user: state.user ? { ...state.user, ...updates } : null,
          })),
      }),
      {
        name: 'user-store',
      }
    )
  )
);
