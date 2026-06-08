'use client';

import { useEffect } from 'react';
import { useInventoryStore } from '@/store/useInventoryStore';
import type { InventoryFilters } from '@/types/cmms';

export function useInventory(filters?: InventoryFilters) {
  const store = useInventoryStore();

  useEffect(() => {
    store.fetch(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(filters)]);

  return {
    items: store.items,
    loading: store.loading,
    error: store.error,
    lowStockCount: store.lowStockCount,
    lowStockItems: store.items.filter(i => i.quantity <= i.threshold),
    outOfStockItems: store.items.filter(i => i.quantity === 0),
    refetch: (f?: InventoryFilters) => store.fetch(f ?? filters),
    create: store.create,
    update: store.update,
    remove: store.remove,
    adjustQuantity: store.adjustQuantity,
  };
}
