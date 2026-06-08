'use client';

import { create } from 'zustand';
import { analyticsService } from '@/services/analytics-service';
import type { AnalyticsState } from '@/types/cmms';

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

interface AnalyticsStore extends AnalyticsState {
  fetchAll: (force?: boolean) => Promise<void>;
  fetchAlerts: () => Promise<void>;
  fetchPredictions: () => Promise<void>;
}

export const useAnalyticsStore = create<AnalyticsStore>((set, get) => ({
  analytics: null,
  predictions: [],
  alerts: null,
  loading: false,
  error: null,
  lastFetched: null,

  fetchAll: async (force = false) => {
    const { lastFetched } = get();
    if (!force && lastFetched && Date.now() - lastFetched < CACHE_TTL) return;

    set({ loading: true, error: null });
    try {
      const [analytics, alerts, predictions] = await Promise.all([
        analyticsService.getKPIs(),
        analyticsService.getAlerts(),
        analyticsService.getPredictions(),
      ]);
      set({ analytics, alerts, predictions, loading: false, lastFetched: Date.now() });
    } catch (e) {
      set({ error: (e as Error).message, loading: false });
    }
  },

  fetchAlerts: async () => {
    try {
      const alerts = await analyticsService.getAlerts();
      set({ alerts });
    } catch (e) {
      set({ error: (e as Error).message });
    }
  },

  fetchPredictions: async () => {
    try {
      const predictions = await analyticsService.getPredictions();
      set({ predictions });
    } catch (e) {
      set({ error: (e as Error).message });
    }
  },
}));
