import { trpcClient } from '@/lib/trpc/api';
import type { WorkOrder, CreateWorkOrderRequest, WorkOrderFilters, WorkOrderStatus } from '@/types/cmms';

class WorkOrderService {
  async getAll(filters?: WorkOrderFilters): Promise<WorkOrder[]> {
    try {
      return (await trpcClient.workOrders.list.query(filters)) as any;
    } catch (e) {
      console.error('workOrderService.getAll:', e);
      return [];
    }
  }

  async getById(id: string): Promise<WorkOrder | null> {
    try {
      return (await trpcClient.workOrders.byId.query({ id })) as any;
    } catch (e) {
      console.error('workOrderService.getById:', e);
      return null;
    }
  }

  async create(data: CreateWorkOrderRequest): Promise<WorkOrder | null> {
    try {
      return await trpcClient.workOrders.create.mutate(data);
    } catch (e) {
      console.error('workOrderService.create:', e);
      return null;
    }
  }

  async update(id: string, data: Partial<CreateWorkOrderRequest>): Promise<WorkOrder | null> {
    try {
      return await trpcClient.workOrders.update.mutate({ id, ...data } as any);
    } catch (e) {
      console.error('workOrderService.update:', e);
      return null;
    }
  }

  async updateStatus(id: string, status: WorkOrderStatus, notes?: string): Promise<WorkOrder | null> {
    try {
      return await trpcClient.workOrders.updateStatus.mutate({ id, status, notes });
    } catch (e) {
      console.error('workOrderService.updateStatus:', e);
      return null;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await trpcClient.workOrders.delete.mutate({ id });
      return true;
    } catch (e) {
      console.error('workOrderService.delete:', e);
      return false;
    }
  }
}

export const workOrderService = new WorkOrderService();
