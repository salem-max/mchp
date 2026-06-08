'use client';

import { create } from 'zustand';
import { assetService } from '@/services/asset-service';
import type { Asset, AssetsState, CreateAssetRequest, AssetFilters } from '@/types/cmms';

interface AssetsStore extends AssetsState {
  fetch: (filters?: AssetFilters) => Promise<void>;
  fetchOne: (id: string) => Promise<void>;
  create: (data: CreateAssetRequest) => Promise<Asset | null>;
  update: (id: string, data: Partial<CreateAssetRequest>) => Promise<Asset | null>;
  remove: (id: string) => Promise<boolean>;
  setFilters: (filters: AssetFilters) => void;
  clearSelected: () => void;
}

export const useAssetsStore = create<AssetsStore>((set, get) => ({
  assets: [],
  selectedAsset: null,
  loading: false,
  error: null,
  filters: {},

  fetch: async (filters) => {
    set({ loading: true, error: null });
    try {
      const f = filters ?? get().filters;
      const assets = await assetService.getAll(f);
      set({ assets, loading: false });
    } catch (e) {
      set({ error: (e as Error).message, loading: false });
    }
  },

  fetchOne: async (id) => {
    set({ loading: true, error: null });
    try {
      const asset = await assetService.getById(id);
      set({ selectedAsset: asset, loading: false });
    } catch (e) {
      set({ error: (e as Error).message, loading: false });
    }
  },

  create: async (data) => {
    try {
      const asset = await assetService.create(data);
      if (asset) set(s => ({ assets: [asset, ...s.assets] }));
      return asset;
    } catch (e) {
      set({ error: (e as Error).message });
      return null;
    }
  },

  update: async (id, data) => {
    try {
      const updated = await assetService.update(id, data);
      if (updated) {
        set(s => ({
          assets: s.assets.map(a => a.id === id ? updated : a),
          selectedAsset: s.selectedAsset?.id === id ? updated : s.selectedAsset,
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
      const ok = await assetService.delete(id);
      if (ok) set(s => ({ assets: s.assets.filter(a => a.id !== id) }));
      return ok;
    } catch (e) {
      set({ error: (e as Error).message });
      return false;
    }
  },

  setFilters: (filters) => set({ filters }),
  clearSelected: () => set({ selectedAsset: null }),
}));
