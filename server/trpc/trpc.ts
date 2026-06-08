import { initTRPC, TRPCError } from '@trpc/server';
import type { Context } from './context';
import { hasPermission, hasFeature, type PermissionKey, type FeatureFlagKey } from '@/lib/rbac';

const t = initTRPC.context<Context>().create();

export const router = t.router;
export const publicProcedure = t.procedure;

// ============================================================================
// 3-LAYER ACCESS MODEL
// ============================================================================

/**
 * 🔓 Layer 1 — Public (Open Access)
 * No login required. Safe for everyone (SEO, landing pages, previews).
 */
export const publicAccessProcedure = t.procedure;

/**
 * 👁️ Layer 2 — Viewer Access (Soft login / limited users)
 * Logged in OR tracked guest users. Read-only or limited interaction.
 * The context is enriched with viewer tracking but no auth enforcement.
 */
export const viewerProcedure = t.procedure.use(async ({ ctx, next }) => {
  // If already authenticated, promote to user context
  if (ctx.user) {
    return next({ ctx: { ...ctx, accessLevel: 'user' as const } });
  }

  // Ensure viewer session exists (created in createContext if no auth)
  if (!ctx.viewer) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Session required. Please enable cookies or sign in.',
    });
  }

  return next({ ctx: { ...ctx, accessLevel: 'viewer' as const } });
});

/**
 * 🔐 Layer 3 — User Access (Full authenticated users)
 * Requires login. Can modify, create, transact.
 */
export const userProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Authentication required' });
  }
  return next({ ctx: { ...ctx, accessLevel: 'user' as const } });
});

/** Backward-compatible alias for userProcedure */
export const protectedProcedure = userProcedure;

// ============================================================================
// ROLE-BASED PROCEDURES
// ============================================================================

/** Requires ADMIN or MANAGER role */
export const managerProcedure = userProcedure.use(({ ctx, next }) => {
  if (!ctx.user!.isSuperAdmin && !['ADMIN', 'MANAGER'].includes(ctx.user!.role)) {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Requires Manager or Admin role' });
  }
  return next({ ctx });
});

/** Requires ADMIN role only */
export const adminProcedure = userProcedure.use(({ ctx, next }) => {
  if (!ctx.user!.isSuperAdmin && ctx.user!.role !== 'ADMIN') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Requires Admin role' });
  }
  return next({ ctx });
});

/** Requires ADMIN, MANAGER, or TECHNICIAN */
export const cmmsProcedure = userProcedure.use(({ ctx, next }) => {
  if (!ctx.user!.isSuperAdmin && !['ADMIN', 'MANAGER', 'TECHNICIAN'].includes(ctx.user!.role)) {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Requires CMMS access' });
  }
  return next({ ctx });
});

// ============================================================================
// PERMISSION-BASED PROCEDURES (RBAC)
// ============================================================================

/**
 * Factory: create a procedure that requires a specific permission.
 * Usage: permissionProcedure(Permissions.ASSETS_READ)
 */
export function permissionProcedure(permission: PermissionKey) {
  return userProcedure.use(({ ctx, next }) => {
    if (!ctx.permissions) {
      throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Permissions not resolved' });
    }
    if (!hasPermission(ctx.permissions, permission)) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: `Missing permission: ${permission}`,
      });
    }
    return next({ ctx });
  });
}

/**
 * Factory: create a procedure that requires any of the given permissions.
 */
export function anyPermissionProcedure(...permissions: PermissionKey[]) {
  return userProcedure.use(({ ctx, next }) => {
    if (!ctx.permissions) {
      throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Permissions not resolved' });
    }
    const hasAny = permissions.some(p => hasPermission(ctx.permissions!, p));
    if (!hasAny) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: `Requires one of: ${permissions.join(', ')}`,
      });
    }
    return next({ ctx });
  });
}

/**
 * Factory: create a procedure that requires all of the given permissions.
 */
export function allPermissionsProcedure(...permissions: PermissionKey[]) {
  return userProcedure.use(({ ctx, next }) => {
    if (!ctx.permissions) {
      throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Permissions not resolved' });
    }
    const missing = permissions.filter(p => !hasPermission(ctx.permissions!, p));
    if (missing.length > 0) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: `Missing permissions: ${missing.join(', ')}`,
      });
    }
    return next({ ctx });
  });
}

// ============================================================================
// FEATURE FLAG PROCEDURES
// ============================================================================

/**
 * Factory: create a procedure that requires a specific feature flag.
 */
export function featureProcedure(feature: FeatureFlagKey) {
  return userProcedure.use(({ ctx, next }) => {
    if (!ctx.permissions) {
      throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Permissions not resolved' });
    }
    if (!hasFeature(ctx.permissions, feature)) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: `Feature not available: ${feature}`,
      });
    }
    return next({ ctx });
  });
}

// ============================================================================
// DATA DEGRADATION HELPERS
// ============================================================================

/**
 * Strip sensitive fields from data for viewer/public access.
 */
export function stripSensitive<T extends Record<string, any>>(data: T, allowedFields: (keyof T)[]): Partial<T> {
  const result: Partial<T> = {};
  for (const key of allowedFields) {
    if (key in data) {
      result[key] = data[key];
    }
  }
  return result;
}

/**
 * Degrade an array of items based on access level.
 */
export function degradeData<T extends Record<string, any>>(
  items: T[],
  ctx: Context,
  publicFields: (keyof T)[],
  viewerFields: (keyof T)[],
  userFields?: (keyof T)[]
): Partial<T>[] {
  if (ctx.user) {
    const fields = userFields || Object.keys(items[0] || {}) as (keyof T)[];
    return items.map(item => stripSensitive(item, fields));
  }
  if (ctx.viewer) {
    return items.map(item => stripSensitive(item, viewerFields));
  }
  return items.map(item => stripSensitive(item, publicFields));
}

/**
 * Degrade a single item based on access level.
 */
export function degradeItem<T extends Record<string, any>>(
  item: T | null,
  ctx: Context,
  publicFields: (keyof T)[],
  viewerFields: (keyof T)[],
  userFields?: (keyof T)[]
): Partial<T> | null {
  if (!item) return null;
  if (ctx.user) {
    const fields = userFields || Object.keys(item) as (keyof T)[];
    return stripSensitive(item, fields);
  }
  if (ctx.viewer) {
    return stripSensitive(item, viewerFields);
  }
  return stripSensitive(item, publicFields);
}
