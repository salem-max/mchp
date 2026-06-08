import { trpcClient } from '@/lib/trpc/api';
import type { Asset, CreateAssetRequest, AssetFilters } from '@/types/cmms';

class AssetService {
  async getAll(filters?: AssetFilters): Promise<Asset[]> {
    try {
      return (await trpcClient.assets.list.query(filters)) as any;
    } catch (e) {
      console.error('assetService.getAll:', e);
      return [];
    }
  }

  async getById(id: string): Promise<Asset | null> {
    try {
      return (await trpcClient.assets.byId.query({ id })) as any;
    } catch (e) {
      console.error('assetService.getById:', e);
      return null;
    }
  }

  async create(data: CreateAssetRequest): Promise<Asset | null> {
    try {
      return (await trpcClient.assets.create.mutate(data)) as any;
    } catch (e) {
      console.error('assetService.create:', e);
      return null;
    }
  }

  async update(id: string, data: Partial<CreateAssetRequest>): Promise<Asset | null> {
    try {
      return (await trpcClient.assets.update.mutate({ id, ...data } as any)) as any;
    } catch (e) {
      console.error('assetService.update:', e);
      return null;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await trpcClient.assets.delete.mutate({ id });
      return true;
    } catch (e) {
      console.error('assetService.delete:', e);
      return false;
    }
  }
}

export const assetService = new AssetService();
