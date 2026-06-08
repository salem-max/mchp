import { trpcClient } from '@/lib/trpc/api';
import type { Analytics, AlertSummary, Prediction } from '@/types/cmms';

class AnalyticsService {
  async getKPIs(): Promise<Analytics | null> {
    try {
      return (await trpcClient.analytics.kpis.query()) as any;
    } catch (e) {
      console.error('analyticsService.getKPIs:', e);
      return null;
    }
  }

  async getAlerts(): Promise<AlertSummary | null> {
    try {
      return (await trpcClient.analytics.alerts.query()) as any;
    } catch (e) {
      console.error('analyticsService.getAlerts:', e);
      return null;
    }
  }

  async getPredictions(): Promise<Prediction[]> {
    try {
      return (await trpcClient.analytics.predictions.query()) as any;
    } catch (e) {
      console.error('analyticsService.getPredictions:', e);
      return [];
    }
  }
}

export const analyticsService = new AnalyticsService();
