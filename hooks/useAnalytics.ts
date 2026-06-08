'use client';

import { useEffect } from 'react';
import { useAnalyticsStore } from '@/store/useAnalyticsStore';

export function useAnalytics(autoFetch = true) {
  const store = useAnalyticsStore();

  useEffect(() => {
    if (autoFetch) store.fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoFetch]);

  return {
    analytics: store.analytics,
    alerts: store.alerts,
    predictions: store.predictions,
    loading: store.loading,
    error: store.error,
    lastFetched: store.lastFetched,
    refetch: () => store.fetchAll(true),
    refreshAlerts: store.fetchAlerts,
    criticalAlertCount: store.alerts?.criticalAlerts?.length ?? 0,
    highAlertCount: store.alerts?.highAlerts?.length ?? 0,
    overdueMaintenanceCount: store.alerts?.overdueMaintenance?.length ?? 0,
    lowStockCount: store.alerts?.lowStockAlerts?.length ?? 0,
    completionRate: store.analytics
      ? store.analytics.kpis.totalWorkOrders > 0
        ? ((store.analytics.kpis.completedWorkOrders / store.analytics.kpis.totalWorkOrders) * 100).toFixed(1)
        : '0'
      : null,
  };
}
