'use client';

import { create } from 'zustand';
import { workOrderService } from '@/services/work-order-service';
import type { WorkOrder, WorkOrdersState, CreateWorkOrderRequest, WorkOrderFilters, WorkOrderStatus } from '@/types/cmms';

interface WorkOrdersStore extends WorkOrdersState {
  fetch: (filters?: WorkOrderFilters) => Promise<void>;
  fetchOne: (id: string) => Promise<void>;
  create: (data: CreateWorkOrderRequest) => Promise<WorkOrder | null>;
  update: (id: string, data: Partial<CreateWorkOrderRequest>) => Promise<WorkOrder | null>;
  updateStatus: (id: string, status: WorkOrderStatus, notes?: string) => Promise<WorkOrder | null>;
  remove: (id: string) => Promise<boolean>;
  setFilters: (filters: WorkOrderFilters) => void;
  clearSelected: () => void;
}

export const useWorkOrdersStore = create<WorkOrdersStore>((set, get) => ({
  workOrders: [],
  selectedWorkOrder: null,
  loading: false,
  error: null,
  filters: {},

  fetch: async (filters) => {
    set({ loading: true, error: null });
    try {
      const f = filters ?? get().filters;
      const workOrders = await workOrderService.getAll(f);
      set({ workOrders, loading: false });
    } catch (e) {
      set({ error: (e as Error).message, loading: false });
    }
  },

  fetchOne: async (id) => {
    set({ loading: true, error: null });
    try {
      const wo = await workOrderService.getById(id);
      set({ selectedWorkOrder: wo, loading: false });
    } catch (e) {
      set({ error: (e as Error).message, loading: false });
    }
  },

  create: async (data) => {
    try {
      const wo = await workOrderService.create(data);
      if (wo) set(s => ({ workOrders: [wo, ...s.workOrders] }));
      return wo;
    } catch (e) {
      set({ error: (e as Error).message });
      return null;
    }
  },

  update: async (id, data) => {
    try {
      const updated = await workOrderService.update(id, data);
      if (updated) {
        set(s => ({
          workOrders: s.workOrders.map(w => w.id === id ? updated : w),
          selectedWorkOrder: s.selectedWorkOrder?.id === id ? updated : s.selectedWorkOrder,
        }));
      }
      return updated;
    } catch (e) {
      set({ error: (e as Error).message });
      return null;
    }
  },

  updateStatus: async (id, status, notes) => {
    try {
      const updated = await workOrderService.updateStatus(id, status, notes);
      if (updated) {
        set(s => ({
          workOrders: s.workOrders.map(w => w.id === id ? updated : w),
          selectedWorkOrder: s.selectedWorkOrder?.id === id ? updated : s.selectedWorkOrder,
        }));
      }
      return updated;
    } catch (e) {
      set({ error: (e as Error).message });
      return null;
    }
  },

  remove: async (id) => {
    try {
      const ok = await workOrderService.delete(id);
      if (ok) set(s => ({ workOrders: s.workOrders.filter(w => w.id !== id) }));
      return ok;
    } catch (e) {
      set({ error: (e as Error).message });
      return false;
    }
  },

  setFilters: (filters) => set({ filters }),
  clearSelected: () => set({ selectedWorkOrder: null }),
}));
