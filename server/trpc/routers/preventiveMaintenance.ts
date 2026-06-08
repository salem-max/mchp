import { z } from 'zod';
import {
  router,
  publicAccessProcedure,
  viewerProcedure,
  userProcedure,
  managerProcedure,
  permissionProcedure,
} from '../trpc';
import { getAllPM, getPMById, createPM, updatePM, deletePM, autoGenerateWorkOrders } from '@/lib/cmms/pm-service';
import { Permissions } from '@/lib/rbac';
import { TRPCError } from '@trpc/server';

export const preventiveMaintenanceRouter = router({
  // ── Public / Viewer / User read ───────────────────────────────────────────
  list: publicAccessProcedure
    .query(async ({ ctx }) => {
      const result = await getAllPM();

      if (!ctx.user && !ctx.viewer) {
        // Public: only summary counts
        return {
          total: result.total,
          active: result.active,
          upcoming: result.upcoming,
          overdue: result.overdue,
          items: [] as any[],
        };
      }

      if (ctx.viewer && !ctx.user) {
        // Viewer: summary + upcoming items only
        return {
          total: result.total,
          active: result.active,
          upcoming: result.upcoming,
          overdue: result.overdue,
          items: result.items.filter((i: any) => i.isActive && i.nextDue > new Date()),
        };
      }

      // User: full data
      return result;
    }),

  byId: publicAccessProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const pm = await getPMById(input.id);
      if (!pm) throw new TRPCError({ code: 'NOT_FOUND', message: 'Schedule not found' });

      if (!ctx.user && !ctx.viewer) {
        return {
          id: pm.id,
          assetName: pm.asset?.name,
          nextDue: pm.nextDue,
          isActive: pm.isActive,
        };
      }

      if (ctx.viewer && !ctx.user) {
        return {
          id: pm.id,
          assetId: pm.assetId,
          asset: pm.asset,
          scheduleType: pm.scheduleType,
          interval: pm.interval,
          nextDue: pm.nextDue,
          description: pm.description,
          isActive: pm.isActive,
        };
      }

      return pm;
    }),

  // ── Mutations (require user access) ───────────────────────────────────────
  create: managerProcedure
    .input(z.object({
      assetId: z.string(),
      scheduleType: z.enum(['TIME_BASED', 'USAGE_BASED']),
      interval: z.number().int().min(1),
      description: z.string().min(5),
      isActive: z.boolean().optional(),
      lastDone: z.string().nullable().optional(),
    }))
    .mutation(({ input }) => createPM(input)),

  update: managerProcedure
    .input(z.object({
      id: z.string(),
      scheduleType: z.enum(['TIME_BASED', 'USAGE_BASED']).optional(),
      interval: z.number().int().min(1).optional(),
      description: z.string().min(5).optional(),
      isActive: z.boolean().optional(),
      lastDone: z.string().nullable().optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      try {
        return await updatePM(id, data);
      } catch (e: any) {
        throw new TRPCError({ code: 'NOT_FOUND', message: e.message });
      }
    }),

  markDone: managerProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ input }) => updatePM(input.id, { lastDone: new Date().toISOString(), isActive: true })),

  delete: managerProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ input }) => deletePM(input.id)),

  autoGenerateWorkOrders: managerProcedure
    .mutation(() => autoGenerateWorkOrders()),

  // ── Permission-based alternative (RBAC) ───────────────────────────────────
  createWithPermission: permissionProcedure(Permissions.PM_CREATE)
    .input(z.object({
      assetId: z.string(),
      scheduleType: z.enum(['TIME_BASED', 'USAGE_BASED']),
      interval: z.number().int().min(1),
      description: z.string().min(5),
      isActive: z.boolean().optional(),
      lastDone: z.string().nullable().optional(),
    }))
    .mutation(({ input }) => createPM(input)),
});
