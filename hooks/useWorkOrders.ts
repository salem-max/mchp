'use client';

import { useEffect } from 'react';
import { useWorkOrdersStore } from '@/store/useWorkOrdersStore';
import type { WorkOrderFilters, WorkOrderStatus } from '@/types/cmms';

export function useWorkOrders(filters?: WorkOrderFilters) {
  const store = useWorkOrdersStore();

  useEffect(() => {
    store.fetch(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(filters)]);

  return {
    workOrders: store.workOrders,
    loading: store.loading,
    error: store.error,
    refetch: (f?: WorkOrderFilters) => store.fetch(f ?? filters),
    create: store.create,
    update: store.update,
    updateStatus: store.updateStatus,
    remove: store.remove,
    // Derived counts
    openCount: store.workOrders.filter(w => w.status === 'OPEN').length,
    inProgressCount: store.workOrders.filter(w => w.status === 'IN_PROGRESS').length,
    overdueCount: store.workOrders.filter(w => false).length,

  };
}

export function useWorkOrder(id: string | null) {
  const store = useWorkOrdersStore();

  useEffect(() => {
    if (id) store.fetchOne(id);
    else store.clearSelected();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  return {
    workOrder: store.selectedWorkOrder,
    loading: store.loading,
    error: store.error,
    updateStatus: (status: WorkOrderStatus, notes?: string) =>
      id ? store.updateStatus(id, status, notes) : Promise.resolve(null),
    update: (data: Parameters<typeof store.update>[1]) =>
      id ? store.update(id, data) : Promise.resolve(null),
    remove: () => id ? store.remove(id) : Promise.resolve(false),
  };
}
