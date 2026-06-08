'use client';

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export interface AppState {
  // Mobile UI state
  mobileMenuOpen: boolean;
  activeTab: string;
  
  // Theme
  isDarkMode: boolean;
  
  // Loading states
  isLoading: boolean;
  
  // Toast/Notifications
  notifications: Array<{
    id: string;
    type: 'success' | 'error' | 'info' | 'warning';
    message: string;
    duration?: number;
  }>;

  // Actions
  toggleMobileMenu: () => void;
  setActiveTab: (tab: string) => void;
  toggleDarkMode: () => void;
  setDarkMode: (isDark: boolean) => void;
  setIsLoading: (loading: boolean) => void;
  
  // Notification actions
  addNotification: (
    message: string,
    type: 'success' | 'error' | 'info' | 'warning',
    duration?: number
  ) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

export const useAppStore = create<AppState>()(
  devtools(
    persist(
      (set) => ({
        mobileMenuOpen: false,
        activeTab: 'home',
        isDarkMode: false,
        isLoading: false,
        notifications: [],

        toggleMobileMenu: () =>
          set((state) => ({ mobileMenuOpen: !state.mobileMenuOpen })),

        setActiveTab: (tab: string) => set({ activeTab: tab }),

        toggleDarkMode: () =>
          set((state) => ({ isDarkMode: !state.isDarkMode })),

        setDarkMode: (isDark: boolean) => set({ isDarkMode: isDark }),

        setIsLoading: (loading: boolean) => set({ isLoading: loading }),

        addNotification: (message, type, duration = 5000) =>
          set((state) => ({
            notifications: [
              ...state.notifications,
              {
                id: Math.random().toString(36).substr(2, 9),
                type,
                message,
                duration,
              },
            ],
          })),

        removeNotification: (id: string) =>
          set((state) => ({
            notifications: state.notifications.filter((n) => n.id !== id),
          })),

        clearNotifications: () => set({ notifications: [] }),
      }),
      {
        name: 'app-store',
      }
    )
  )
);
