import { trpcClient } from '@/lib/trpc/api';
import type { PreventiveMaintenance, CreatePMRequest, PMSummary } from '@/types/cmms';

class PreventiveMaintenanceService {
  async getAll(): Promise<PMSummary> {
    try {
      return (await trpcClient.preventiveMaintenance.list.query()) as any;
    } catch (e) {
      console.error('pmService.getAll:', e);
      return { total: 0, active: 0, upcoming: 0, overdue: 0, items: [] };
    }
  }

  async getById(id: string): Promise<PreventiveMaintenance | null> {
    try {
      return (await trpcClient.preventiveMaintenance.byId.query({ id })) as any;
    } catch (e) {
      console.error('pmService.getById:', e);
      return null;
    }
  }

  async create(data: CreatePMRequest): Promise<PreventiveMaintenance | null> {
    try {
      return (await trpcClient.preventiveMaintenance.create.mutate(data)) as any;
    } catch (e) {
      console.error('pmService.create:', e);
      return null;
    }
  }

  async update(id: string, data: Partial<CreatePMRequest>): Promise<PreventiveMaintenance | null> {
    try {
      return (await trpcClient.preventiveMaintenance.update.mutate({ id, ...data } as any)) as any;
    } catch (e) {
      console.error('pmService.update:', e);
      return null;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await trpcClient.preventiveMaintenance.delete.mutate({ id });
      return true;
    } catch (e) {
      console.error('pmService.delete:', e);
      return false;
    }
  }

  async markDone(id: string): Promise<PreventiveMaintenance | null> {
    try {
      return (await trpcClient.preventiveMaintenance.markDone.mutate({ id })) as any;
    } catch (e) {
      console.error('pmService.markDone:', e);
      return null;
    }
  }

  async toggleActive(id: string, isActive: boolean): Promise<PreventiveMaintenance | null> {
    return this.update(id, { isActive });
  }

  async autoGenerateWorkOrders(): Promise<any[]> {
    try {
      return (await trpcClient.preventiveMaintenance.autoGenerateWorkOrders.mutate()) as any;
    } catch (e) {
      console.error('pmService.autoGenerateWorkOrders:', e);
      return [];
    }
  }
}

export const preventiveMaintenanceService = new PreventiveMaintenanceService();
