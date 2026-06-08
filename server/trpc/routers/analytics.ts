// @ts-nocheck
import {
  router,
  publicAccessProcedure,
  viewerProcedure,
  userProcedure,
  featureProcedure,
} from '../trpc';
import { getAnalytics, getAlerts } from '@/lib/cmms/analytics-service';
import type { Prisma } from '@/lib/prisma';
import { FeatureFlags } from '@/lib/rbac';

export const analyticsRouter = router({
  // ── Public KPIs (safe for landing pages) ──────────────────────────────────
  publicKpis: publicAccessProcedure
    .query(async () => {
      const data = await getAnalytics();
      return {
        totalAssets: data.kpis.totalAssets,
        activeAssets: data.kpis.activeAssets,
        assetAvailability: data.kpis.assetAvailability,
        totalWorkOrders: data.kpis.totalWorkOrders,
        completedWorkOrders: data.kpis.completedWorkOrders,
      };
    }),

  // ── Viewer analytics (expanded read-only) ─────────────────────────────────
  viewerKpis: viewerProcedure
    .query(async () => {
      const data = await getAnalytics();
      return {
        kpis: {
          totalAssets: data.kpis.totalAssets,
          activeAssets: data.kpis.activeAssets,
          assetAvailability: data.kpis.assetAvailability,
          totalWorkOrders: data.kpis.totalWorkOrders,
          completedWorkOrders: data.kpis.completedWorkOrders,
          pendingWorkOrders: data.kpis.pendingWorkOrders,
          mttr: data.kpis.mttr,
          mtbf: data.kpis.mtbf,
        },
        workOrderTrend: data.workOrderTrend,
      };
    }),

  // ── Full analytics (authenticated users) ──────────────────────────────────
  kpis: userProcedure
    .query(() => getAnalytics()),

  alerts: userProcedure
    .query(() => getAlerts()),

  predictions: featureProcedure(FeatureFlags.AI_PREDICTIONS)
    .query(async () => {
      const prisma = prisma;
      const twins = await prisma.digitalTwin.findMany({
        include: {
          asset: true,
          sensorData: { orderBy: { timestamp: 'desc' }, take: 100 },
        },
      });

      return twins.map(dt => {
        const data = dt.sensorData;
        if (data.length < 10) {
          return {
            assetId: dt.assetId,
            assetName: dt.asset.name,
            prediction: 'Insufficient data',
            confidence: 0,
            nextMaintenance: null,
            currentTrend: 'stable' as const,
            predictedValue: 0,
          };
        }
        const values = data.slice(0, 20).map(d => d.value);
        const avg = values.reduce((a: any, b: any) => a + b, 0) / values.length;
        const trend = values[0] > values[values.length - 1] ? 'deteriorating' : 'improving';
        const risk = avg > 80 ? 'High risk' : avg > 60 ? 'Moderate risk' : 'Normal operation';
        return {
          assetId: dt.assetId,
          assetName: dt.asset.name,
          prediction: risk,
          confidence: avg > 80 ? 0.9 : avg > 60 ? 0.7 : 0.5,
          nextMaintenance: avg > 60 ? new Date(Date.now() + 7 * 86400000).toISOString() : null,
          currentTrend: trend as 'deteriorating' | 'improving' | 'stable',
          predictedValue: Math.round(avg * 100) / 100,
        };
      });
    }),
});
