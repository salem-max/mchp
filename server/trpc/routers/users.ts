import { z } from 'zod';
import {
  router,
  publicAccessProcedure,
  viewerProcedure,
  userProcedure,
  managerProcedure,
  adminProcedure,
  permissionProcedure,
  featureProcedure,
} from '../trpc';
import { getAllUsers, getUserById, createUser, updateUser, deleteUser, getUsersByRole } from '@/lib/cmms/user-service';
import { Permissions, FeatureFlags } from '@/lib/rbac';
import { TRPCError } from '@trpc/server';

const RoleEnum = z.enum(['ADMIN', 'MANAGER', 'TECHNICIAN', 'CUSTOMER', 'BOTH']);

export const usersRouter = router({
  // ── Public user discovery (for marketplace) ───────────────────────────────
  publicTechnicians: publicAccessProcedure
    .query(async () => {
      const users = await getUsersByRole('TECHNICIAN');
      return users.map(u => ({
        id: u.id,
        name: u.name,
        role: u.role,
      }));
    }),

  // ── Viewer can see limited user profiles ──────────────────────────────────
  viewerProfile: viewerProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const user = await getUserById(input.id);
      if (!user) throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' });
      return {
        id: user.id,
        name: user.name,
        role: user.role,
        avgRating: (user as any).avgRating,
        technicianProfile: user.technicianProfile,
      };
    }),

  // ── Authenticated user routes ─────────────────────────────────────────────
  me: userProcedure
    .query(({ ctx }) => getUserById(ctx.user!.id)),

  list: managerProcedure
    .query(() => getAllUsers()),

  byId: managerProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const user = await getUserById(input.id);
      if (!user) throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' });
      return user;
    }),

  byRole: managerProcedure
    .input(z.object({ role: RoleEnum }))
    .query(({ input }) => getUsersByRole(input.role)),

  create: adminProcedure
    .input(z.object({
      name: z.string().min(2),
      email: z.string().email(),
      password: z.string().min(8),
      role: RoleEnum,
      phone: z.string().nullable().optional(),
    }))
    .mutation(async ({ input }) => {
      try {
        return await createUser(input);
      } catch (e: any) {
        throw new TRPCError({ code: 'CONFLICT', message: e.message });
      }
    }),

  update: managerProcedure
    .input(z.object({
      id: z.string(),
      name: z.string().min(2).optional(),
      role: RoleEnum.optional(),
      phone: z.string().nullable().optional(),
    }))
    .mutation(({ input }) => updateUser(input.id, input)),

  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ input }) => deleteUser(input.id)),

  // ── Permission-based alternatives (RBAC) ──────────────────────────────────
  listWithPermission: permissionProcedure(Permissions.USERS_READ)
    .query(() => getAllUsers()),

  createWithPermission: permissionProcedure(Permissions.USERS_CREATE)
    .input(z.object({
      name: z.string().min(2),
      email: z.string().email(),
      password: z.string().min(8),
      role: RoleEnum,
      phone: z.string().nullable().optional(),
    }))
    .mutation(async ({ input }) => {
      try {
        return await createUser(input);
      } catch (e: any) {
        throw new TRPCError({ code: 'CONFLICT', message: e.message });
      }
    }),

  // ── Required example procedures ───────────────────────────────────────────

  /**
   * getUser — retrieve a user by ID.
   * Available to authenticated users for their own profile,
   * and to managers for any profile.
   */
  getUser: userProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      // Users can only fetch their own profile unless they are a manager+
      const isSelf = ctx.user!.id === input.id;
      const isElevated = ctx.user!.isSuperAdmin || ['ADMIN', 'MANAGER'].includes(ctx.user!.role);
      if (!isSelf && !isElevated) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Cannot view this user profile' });
      }
      const user = await getUserById(input.id);
      if (!user) throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' });
      return user;
    }),

  /**
   * createUser — create a new user account.
   * Requires admin privileges.
   */
  createUser: adminProcedure
    .input(z.object({
      name: z.string().min(2),
      email: z.string().email(),
      password: z.string().min(8),
      role: RoleEnum,
      phone: z.string().nullable().optional(),
    }))
    .mutation(async ({ input }) => {
      try {
        return await createUser(input);
      } catch (e: any) {
        throw new TRPCError({ code: 'CONFLICT', message: e.message });
      }
    }),

  /**
   * updateProfile — update the current user's own profile.
   * Any authenticated user can update their own name/phone.
   * Only admins can change their own role via this endpoint.
   */
  updateProfile: userProcedure
    .input(z.object({
      name: z.string().min(2).optional(),
      phone: z.string().nullable().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      return updateUser(ctx.user!.id, { id: ctx.user!.id, ...input });
    }),
});

