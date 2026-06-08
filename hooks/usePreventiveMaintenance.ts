'use client';

import { useEffect } from 'react';
import { usePreventiveMaintenanceStore } from '@/store/usePreventiveMaintenanceStore';

export function usePreventiveMaintenance() {
  const store = usePreventiveMaintenanceStore();

  useEffect(() => {
    store.fetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const now = new Date();
  const sevenDays = new Date(now.getTime() + 7 * 86400000);

  return {
    schedules: store.schedules,
    loading: store.loading,
    error: store.error,
    summary: store.summary,
    overdueSchedules: store.schedules.filter(p => p.isActive && new Date(p.nextDue) <= now),
    upcomingSchedules: store.schedules.filter(p => {
      const due = new Date(p.nextDue);
      return p.isActive && due > now && due <= sevenDays;
    }),
    refetch: store.fetch,
    create: store.create,
    update: store.update,
    remove: store.remove,
    markDone: store.markDone,
    toggleActive: store.toggleActive,
  };
}
