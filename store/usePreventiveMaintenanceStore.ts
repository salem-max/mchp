'use client';

import { create } from 'zustand';
import { preventiveMaintenanceService } from '@/services/preventive-maintenance-service';
import type { PreventiveMaintenance, PMState, CreatePMRequest } from '@/types/cmms';

interface PMStore extends PMState {
  fetch: () => Promise<void>;
  create: (data: CreatePMRequest) => Promise<PreventiveMaintenance | null>;
  update: (id: string, data: Partial<CreatePMRequest>) => Promise<PreventiveMaintenance | null>;
  remove: (id: string) => Promise<boolean>;
  markDone: (id: string) => Promise<PreventiveMaintenance | null>;
  toggleActive: (id: string, isActive: boolean) => Promise<PreventiveMaintenance | null>;
}

export const usePreventiveMaintenanceStore = create<PMStore>((set) => ({
  schedules: [],
  loading: false,
  error: null,
  summary: null,

  fetch: async () => {
    set({ loading: true, error: null });
    try {
      const result = await preventiveMaintenanceService.getAll();
      set({
        schedules: result.items,
        summary: { total: result.total, active: result.active, upcoming: result.upcoming, overdue: result.overdue },
        loading: false,
      });
    } catch (e) {
      set({ error: (e as Error).message, loading: false });
    }
  },

  create: async (data) => {
    try {
      const pm = await preventiveMaintenanceService.create(data);
      if (pm) set(s => ({ schedules: [pm, ...s.schedules] }));
      return pm;
    } catch (e) {
      set({ error: (e as Error).message });
      return null;
    }
  },

  update: async (id, data) => {
    try {
      const updated = await preventiveMaintenanceService.update(id, data);
      if (updated) set(s => ({ schedules: s.schedules.map(p => p.id === id ? updated : p) }));
      return updated;
    } catch (e) {
      set({ error: (e as Error).message });
      return null;
    }
  },

  remove: async (id) => {
    try {
      const ok = await preventiveMaintenanceService.delete(id);
      if (ok) set(s => ({ schedules: s.schedules.filter(p => p.id !== id) }));
      return ok;
    } catch (e) {
      set({ error: (e as Error).message });
      return false;
    }
  },

  markDone: async (id) => {
    try {
      const updated = await preventiveMaintenanceService.markDone(id);
      if (updated) set(s => ({ schedules: s.schedules.map(p => p.id === id ? updated : p) }));
      return updated;
    } catch (e) {
      set({ error: (e as Error).message });
      return null;
    }
  },

  toggleActive: async (id, isActive) => {
    try {
      const updated = await preventiveMaintenanceService.toggleActive(id, isActive);
      if (updated) set(s => ({ schedules: s.schedules.map(p => p.id === id ? updated : p) }));
      return updated;
    } catch (e) {
      set({ error: (e as Error).message });
      return null;
    }
  },
}));
