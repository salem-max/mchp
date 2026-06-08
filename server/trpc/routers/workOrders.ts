import { z } from 'zod';
import {
  router,
  publicAccessProcedure,
  viewerProcedure,
  userProcedure,
  cmmsProcedure,
  permissionProcedure,
} from '../trpc';
import { getAllWorkOrders, getWorkOrderById, createWorkOrder, updateWorkOrder, deleteWorkOrder } from '@/lib/cmms/work-order-service';
import { Permissions } from '@/lib/rbac';
import { TRPCError } from '@trpc/server';

const PriorityEnum = z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']);
const StatusEnum = z.enum(['OPEN', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']);

export const workOrdersRouter = router({
  // ── Public / Viewer / User read ───────────────────────────────────────────
  list: publicAccessProcedure
    .input(z.object({
      status: StatusEnum.optional(),
      priority: PriorityEnum.optional(),
      assetId: z.string().optional(),
      assignedTo: z.string().optional(),
      search: z.string().optional(),
    }).optional())
    .query(async ({ ctx, input }) => {
      const workOrders = await getAllWorkOrders(input);

      // Public: minimal fields (safe for SEO, landing pages)
      if (!ctx.user && !ctx.viewer) {
        return workOrders.map((wo: any) => ({
          id: wo.id,
          title: wo.title,
          priority: wo.priority,
          status: wo.status,
          assetName: wo.asset?.name,
          createdAt: wo.createdAt,
        }));
      }

      // Viewer: expanded read-only with asset details
      if (ctx.viewer && !ctx.user) {
        return workOrders.map((wo: any) => ({
          id: wo.id,
          title: wo.title,
          description: wo.description,
          priority: wo.priority,
          status: wo.status,
          asset: wo.asset,
          assignedUser: wo.assignedUser ? { name: wo.assignedUser.name } : null,
          dueDate: wo.dueDate,
          createdAt: wo.createdAt,
          canComment: false,
        }));
      }

      // User: full data with all relations and permissions
      return workOrders.map((wo: any) => ({
        ...wo,
        canEdit: ctx.user?.role === 'ADMIN' || ctx.user?.role === 'MANAGER' || ctx.user?.id === wo.assignedTo,
        canComment: true,
      }));
    }),

  byId: publicAccessProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const wo = await getWorkOrderById(input.id);
      if (!wo) throw new TRPCError({ code: 'NOT_FOUND', message: 'Work order not found' });

      if (!ctx.user && !ctx.viewer) {
        return {
          id: wo.id,
          title: wo.title,
          priority: wo.priority,
          status: wo.status,
          assetName: wo.asset?.name,
        };
      }

      if (ctx.viewer && !ctx.user) {
        return {
          id: wo.id,
          title: wo.title,
          description: wo.description,
          priority: wo.priority,
          status: wo.status,
          asset: wo.asset,
          assignedUser: wo.assignedUser ? { name: wo.assignedUser.name } : null,
          dueDate: wo.dueDate,
          canComment: false,
        };
      }

      return {
        ...wo,
        canEdit: ctx.user?.role === 'ADMIN' || ctx.user?.role === 'MANAGER' || ctx.user?.id === wo.assignedTo,
        canComment: true,
      };
    }),

  // ── Mutations (require user access) ───────────────────────────────────────
  create: cmmsProcedure
    .input(z.object({
      assetId: z.string(),
      title: z.string().min(3),
      description: z.string().min(10),
      priority: PriorityEnum.optional(),
      assignedTo: z.string().nullable().optional(),
      dueDate: z.string().nullable().optional(),
      notes: z.string().nullable().optional(),
    }))
    .mutation(({ input }) => createWorkOrder(input)),

  update: cmmsProcedure
    .input(z.object({
      id: z.string(),
      title: z.string().min(3).optional(),
      description: z.string().optional(),
      priority: PriorityEnum.optional(),
      status: StatusEnum.optional(),
      assignedTo: z.string().nullable().optional(),
      dueDate: z.string().nullable().optional(),
      notes: z.string().nullable().optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      try {
        return await updateWorkOrder(id, data);
      } catch (e: any) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: e.message });
      }
    }),

  updateStatus: cmmsProcedure
    .input(z.object({
      id: z.string(),
      status: StatusEnum,
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      try {
        return await updateWorkOrder(input.id, {
          status: input.status,
          notes: input.notes,
          ...(input.status === 'COMPLETED' ? { completedAt: new Date().toISOString() } : {}),
        });
      } catch (e: any) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: e.message });
      }
    }),

  delete: cmmsProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ input }) => deleteWorkOrder(input.id)),

  // ── Permission-based alternatives (RBAC) ──────────────────────────────────
  createWithPermission: permissionProcedure(Permissions.WORK_ORDERS_CREATE)
    .input(z.object({
      assetId: z.string(),
      title: z.string().min(3),
      description: z.string().min(10),
      priority: PriorityEnum.optional(),
      assignedTo: z.string().nullable().optional(),
      dueDate: z.string().nullable().optional(),
      notes: z.string().nullable().optional(),
    }))
    .mutation(({ input }) => createWorkOrder(input)),
});
