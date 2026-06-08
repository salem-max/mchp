import { z } from 'zod';
import {
  router,
  publicAccessProcedure,
  viewerProcedure,
  userProcedure,
  managerProcedure,
  permissionProcedure,
  degradeItem,
  degradeData,
} from '../trpc';
import { getAllAssets, getAssetById, createAsset, updateAsset, deleteAsset } from '@/lib/cmms/asset-service';
import { Permissions } from '@/lib/rbac';
import { TRPCError } from '@trpc/server';

const AssetStatusEnum = z.enum(['ACTIVE', 'INACTIVE', 'MAINTENANCE', 'RETIRED']);

const createAssetInput = z.object({
  name: z.string().min(2),
  type: z.string().min(1),
  location: z.string().min(2),
  lat: z.number().nullable().optional(),
  lng: z.number().nullable().optional(),
  model: z.string().nullable().optional(),
  serialNumber: z.string().nullable().optional(),
  status: AssetStatusEnum.optional(),
  metadata: z.record(z.string(), z.unknown()).nullable().optional(),
});

/** Fields visible to public (no auth) */
const PUBLIC_ASSET_FIELDS: string[] = ['id', 'name', 'location', 'status', 'createdAt', 'updatedAt'];


/** Fields visible to viewers (soft-login) */
const VIEWER_ASSET_FIELDS = [
  ...PUBLIC_ASSET_FIELDS,
  'lat', 'lng', 'model', 'serialNumber', 'metadata'
] as const;

// Note: current Prisma schema for Asset only contains: id, name, status, location, createdAt, updatedAt
// Extra fields referenced by UI/services are currently handled via (optional) degradataion in responses.


export const assetsRouter = router({
  // ── Public / Viewer / User read ───────────────────────────────────────────
  list: publicAccessProcedure
    .input(z.object({
      status: AssetStatusEnum.optional(),
      type: z.string().optional(),
      search: z.string().optional(),
    }).optional())
    .query(async ({ ctx, input }) => {
      const assets = await getAllAssets(input);

      // Degrade data based on access level
      if (!ctx.user && !ctx.viewer) {
        // Public: minimal fields only
        return assets.map(a => ({
          id: a.id,
          name: a.name,
          location: a.location,
          status: a.status,
          createdAt: a.createdAt,
          updatedAt: a.updatedAt,
        }))
      }

      if (ctx.viewer && !ctx.user) {
        // Viewer: expanded read-only data, but only expose fields that exist in Prisma schema
        return assets.map(a => ({
          id: a.id,
          name: a.name,
          location: a.location,
          status: a.status,
          createdAt: a.createdAt,
          updatedAt: a.updatedAt,
          workOrderCount: a.workOrders?.length ?? 0,
        }))
      }


      // User: full data with all relations
      return assets;
    }),

  byId: publicAccessProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const asset = await getAssetById(input.id);
      if (!asset) throw new TRPCError({ code: 'NOT_FOUND', message: 'Asset not found' });

      if (!ctx.user && !ctx.viewer) {
        return {
          id: asset.id,
          name: asset.name,
          location: asset.location,
          status: asset.status,
        };
      }

      if (ctx.viewer && !ctx.user) {
        return {
          id: asset.id,
          name: asset.name,
          location: asset.location,
          status: asset.status,
          createdAt: asset.createdAt,
          updatedAt: asset.updatedAt,
          workOrderCount: asset.workOrders?.length ?? 0,
        };
      }


      return asset;
    }),

  // ── Mutations (require user access) ───────────────────────────────────────
  create: managerProcedure
    .input(createAssetInput)
    .mutation(({ input }) => createAsset(input)),

  update: managerProcedure
    .input(createAssetInput.partial().extend({ id: z.string() }))
    .mutation(({ input }) => {
      const { id, ...data } = input;
      return updateAsset(id, data);
    }),

  delete: managerProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ input }) => deleteAsset(input.id)),

  // ── Permission-based alternative (RBAC) ───────────────────────────────────
  createWithPermission: permissionProcedure(Permissions.ASSETS_CREATE)
    .input(createAssetInput)
    .mutation(({ input }) => createAsset(input)),

  updateWithPermission: permissionProcedure(Permissions.ASSETS_UPDATE)
    .input(createAssetInput.partial().extend({ id: z.string() }))
    .mutation(({ input }) => {
      const { id, ...data } = input;
      return updateAsset(id, data);
    }),
});
