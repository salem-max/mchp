'use client';

import { useEffect } from 'react';
import { useAssetsStore } from '@/store/useAssetsStore';
import type { AssetFilters, CreateAssetRequest } from '@/types/cmms';

export function useAssets(filters?: AssetFilters) {
  const store = useAssetsStore();

  useEffect(() => {
    store.fetch(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(filters)]);

  return {
    assets: store.assets,
    loading: store.loading,
    error: store.error,
    refetch: (f?: AssetFilters) => store.fetch(f ?? filters),
    create: store.create,
    update: store.update,
    remove: store.remove,
    setFilters: store.setFilters,
  };
}

export function useAsset(id: string | null) {
  const store = useAssetsStore();

  useEffect(() => {
    if (id) store.fetchOne(id);
    else store.clearSelected();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  return {
    asset: store.selectedAsset,
    loading: store.loading,
    error: store.error,
    update: (data: Partial<CreateAssetRequest>) => id ? store.update(id, data) : Promise.resolve(null),
    remove: () => id ? store.remove(id) : Promise.resolve(false),
  };
}
