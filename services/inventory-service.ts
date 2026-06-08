import { trpcClient } from '@/lib/trpc/api';
import type { InventoryItem, CreateInventoryRequest, InventoryFilters } from '@/types/cmms';

class InventoryService {
  async getAll(filters?: InventoryFilters): Promise<InventoryItem[]> {
    try {
      return (await trpcClient.inventory.list.query(filters)) as any;
    } catch (e) {
      console.error('inventoryService.getAll:', e);
      return [];
    }
  }

  async getById(id: string): Promise<InventoryItem | null> {
    try {
      return (await trpcClient.inventory.byId.query({ id })) as any;
    } catch (e) {
      console.error('inventoryService.getById:', e);
      return null;
    }
  }

  async create(data: CreateInventoryRequest): Promise<InventoryItem | null> {
    try {
      return (await trpcClient.inventory.create.mutate(data)) as any;
    } catch (e) {
      console.error('inventoryService.create:', e);
      return null;
    }
  }

  async update(id: string, data: Partial<CreateInventoryRequest>): Promise<InventoryItem | null> {
    try {
      return (await trpcClient.inventory.update.mutate({ id, ...data } as any)) as any;
    } catch (e) {
      console.error('inventoryService.update:', e);
      return null;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await trpcClient.inventory.delete.mutate({ id });
      return true;
    } catch (e) {
      console.error('inventoryService.delete:', e);
      return false;
    }
  }

  async getLowStock(): Promise<InventoryItem[]> {
    try {
      return (await trpcClient.inventory.lowStock.query()) as any;
    } catch (e) {
      console.error('inventoryService.getLowStock:', e);
      return [];
    }
  }

  async adjustQuantity(id: string, delta: number): Promise<InventoryItem | null> {
    try {
      return (await trpcClient.inventory.adjustQuantity.mutate({ id, delta })) as any;
    } catch (e) {
      console.error('inventoryService.adjustQuantity:', e);
      return null;
    }
  }
}

export const inventoryService = new InventoryService();
