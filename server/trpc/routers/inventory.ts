import { z } from 'zod';
import {
  router,
  publicAccessProcedure,
  viewerProcedure,
  userProcedure,
  managerProcedure,
  permissionProcedure,
} from '../trpc';
import { getAllInventory, getInventoryById, createInventoryItem, updateInventoryItem, deleteInventoryItem, getLowStockItems } from '@/lib/cmms/inventory-service';
import { Permissions } from '@/lib/rbac';
import { TRPCError } from '@trpc/server';

const itemInput = z.object({
  partName: z.string().min(2),
  description: z.string().nullable().optional(),
  quantity: z.number().int().min(0),
  threshold: z.number().int().min(0),
  supplier: z.string().nullable().optional(),
  cost: z.number().positive().nullable().optional(),
  location: z.string().nullable().optional(),
});

export const inventoryRouter = router({
  // ── Public / Viewer / User read ───────────────────────────────────────────
  list: publicAccessProcedure
    .input(z.object({
      search: z.string().optional(),
      lowStockOnly: z.boolean().optional(),
    }).optional())
    .query(async ({ ctx, input }) => {
      const items = await getAllInventory(input);

      // Public: minimal fields
      if (!ctx.user && !ctx.viewer) {
        return items.map((item: any) => ({
          id: item.id,
          partName: item.partName,
          location: item.location,
          createdAt: item.createdAt,
        }));
      }

      // Viewer: expanded but no cost/supplier
      if (ctx.viewer && !ctx.user) {
        return items.map((item: any) => ({
          id: item.id,
          partName: item.partName,
          description: item.description,
          quantity: item.quantity,
          threshold: item.threshold,
          location: item.location,
          lowStock: item.quantity <= item.threshold,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
        }));
      }

      // User: full data
      return items;
    }),

  byId: publicAccessProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const item = await getInventoryById(input.id);
      if (!item) throw new TRPCError({ code: 'NOT_FOUND', message: 'Item not found' });

      if (!ctx.user && !ctx.viewer) {
        return {
          id: item.id,
          partName: item.partName,
          location: item.location,
        };
      }

      if (ctx.viewer && !ctx.user) {
        return {
          id: item.id,
          partName: item.partName,
          description: item.description,
          quantity: item.quantity,
          threshold: item.threshold,
          location: item.location,
          lowStock: item.quantity <= item.threshold,
        };
      }

      return item;
    }),

  lowStock: userProcedure
    .query(() => getLowStockItems()),

  // ── Mutations (require user access) ───────────────────────────────────────
  create: managerProcedure
    .input(itemInput)
    .mutation(({ input }) => createInventoryItem(input)),

  update: managerProcedure
    .input(itemInput.partial().extend({ id: z.string() }))
    .mutation(({ input }) => {
      const { id, ...data } = input;
      return updateInventoryItem(id, data);
    }),

  adjustQuantity: managerProcedure
    .input(z.object({ id: z.string(), delta: z.number().int() }))
    .mutation(async ({ input }) => {
      const item = await getInventoryById(input.id);
      if (!item) throw new TRPCError({ code: 'NOT_FOUND', message: 'Item not found' });
      return updateInventoryItem(input.id, { quantity: Math.max(0, item.quantity + input.delta) });
    }),

  delete: managerProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ input }) => deleteInventoryItem(input.id)),

  // ── Permission-based alternatives (RBAC) ──────────────────────────────────
  createWithPermission: permissionProcedure(Permissions.INVENTORY_CREATE)
    .input(itemInput)
    .mutation(({ input }) => createInventoryItem(input)),
});
