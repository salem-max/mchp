'use client';

import { create } from 'zustand';
import { inventoryService } from '@/services/inventory-service';
import type { InventoryItem, InventoryState, CreateInventoryRequest, InventoryFilters } from '@/types/cmms';

interface InventoryStore extends InventoryState {
  fetch: (filters?: InventoryFilters) => Promise<void>;
  fetchOne: (id: string) => Promise<void>;
  create: (data: CreateInventoryRequest) => Promise<InventoryItem | null>;
  update: (id: string, data: Partial<CreateInventoryRequest>) => Promise<InventoryItem | null>;
  remove: (id: string) => Promise<boolean>;
  adjustQuantity: (id: string, delta: number) => Promise<InventoryItem | null>;
  clearSelected: () => void;
}

export const useInventoryStore = create<InventoryStore>((set) => ({
  items: [],
  selectedItem: null,
  loading: false,
  error: null,
  lowStockCount: 0,

  fetch: async (filters) => {
    set({ loading: true, error: null });
    try {
      const items = await inventoryService.getAll(filters);
      const lowStockCount = items.filter(i => i.quantity <= i.threshold).length;
      set({ items, lowStockCount, loading: false });
    } catch (e) {
      set({ error: (e as Error).message, loading: false });
    }
  },

  fetchOne: async (id) => {
    set({ loading: true, error: null });
    try {
      const item = await inventoryService.getById(id);
      set({ selectedItem: item, loading: false });
    } catch (e) {
      set({ error: (e as Error).message, loading: false });
    }
  },

  create: async (data) => {
    try {
      const item = await inventoryService.create(data);
      if (item) {
        set(s => {
          const items = [item, ...s.items];
          return { items, lowStockCount: items.filter(i => i.quantity <= i.threshold).length };
        });
      }
      return item;
    } catch (e) {
      set({ error: (e as Error).message });
      return null;
    }
  },

  update: async (id, data) => {
    try {
      const updated = await inventoryService.update(id, data);
      if (updated) {
        set(s => {
          const items = s.items.map(i => i.id === id ? updated : i);
          return {
            items,
            lowStockCount: items.filter(i => i.quantity <= i.threshold).length,
            selectedItem: s.selectedItem?.id === id ? updated : s.selectedItem,
          };
        });
      }
      return updated;
    } catch (e) {
      set({ error: (e as Error).message });
      return null;
    }
  },

  remove: async (id) => {
    try {
      const ok = await inventoryService.delete(id);
      if (ok) {
        set(s => {
          const items = s.items.filter(i => i.id !== id);
          return { items, lowStockCount: items.filter(i => i.quantity <= i.threshold).length };
        });
      }
      return ok;
    } catch (e) {
      set({ error: (e as Error).message });
      return false;
    }
  },

  adjustQuantity: async (id, delta) => {
    try {
      const updated = await inventoryService.adjustQuantity(id, delta);
      if (updated) {
        set(s => {
          const items = s.items.map(i => i.id === id ? updated : i);
          return { items, lowStockCount: items.filter(i => i.quantity <= i.threshold).length };
        });
      }
      return updated;
    } catch (e) {
      set({ error: (e as Error).message });
      return null;
    }
  },

  clearSelected: () => set({ selectedItem: null }),
}));
