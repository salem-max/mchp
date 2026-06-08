import { prisma } from './prisma';

import type { Role } from '@prisma/client';

// ============================================================================
// PERMISSION KEYS (centralized registry)
// ============================================================================

export const Permissions = {
  // Assets
  ASSETS_READ: 'assets:read',
  ASSETS_CREATE: 'assets:create',
  ASSETS_UPDATE: 'assets:update',
  ASSETS_DELETE: 'assets:delete',

  // Work Orders
  WORK_ORDERS_READ: 'workOrders:read',
  WORK_ORDERS_CREATE: 'workOrders:create',
  WORK_ORDERS_UPDATE: 'workOrders:update',
  WORK_ORDERS_DELETE: 'workOrders:delete',

  // Inventory
  INVENTORY_READ: 'inventory:read',
  INVENTORY_CREATE: 'inventory:create',
  INVENTORY_UPDATE: 'inventory:update',
  INVENTORY_DELETE: 'inventory:delete',

  // Preventive Maintenance
  PM_READ: 'pm:read',
  PM_CREATE: 'pm:create',
  PM_UPDATE: 'pm:update',
  PM_DELETE: 'pm:delete',

  // Analytics
  ANALYTICS_READ: 'analytics:read',
  ANALYTICS_ADVANCED: 'analytics:advanced',

  // Users
  USERS_READ: 'users:read',
  USERS_CREATE: 'users:create',
  USERS_UPDATE: 'users:update',
  USERS_DELETE: 'users:delete',

  // Jobs
  JOBS_READ: 'jobs:read',
  JOBS_CREATE: 'jobs:create',
  JOBS_UPDATE: 'jobs:update',
  JOBS_DELETE: 'jobs:delete',
} as const;

export type PermissionKey = (typeof Permissions)[keyof typeof Permissions];

// ============================================================================
// ROLE-PERMISSION MAPPING (default permissions per role)
// ============================================================================

export const DEFAULT_ROLE_PERMISSIONS: Record<Role, PermissionKey[]> = {
  ADMIN: Object.values(Permissions),

  MANAGER: [
    Permissions.ASSETS_READ,
    Permissions.ASSETS_CREATE,
    Permissions.ASSETS_UPDATE,
    Permissions.ASSETS_DELETE,
    Permissions.WORK_ORDERS_READ,
    Permissions.WORK_ORDERS_CREATE,
    Permissions.WORK_ORDERS_UPDATE,
    Permissions.WORK_ORDERS_DELETE,
    Permissions.INVENTORY_READ,
    Permissions.INVENTORY_CREATE,
    Permissions.INVENTORY_UPDATE,
    Permissions.INVENTORY_DELETE,
    Permissions.PM_READ,
    Permissions.PM_CREATE,
    Permissions.PM_UPDATE,
    Permissions.PM_DELETE,
    Permissions.ANALYTICS_READ,
    Permissions.ANALYTICS_ADVANCED,
    Permissions.USERS_READ,
    Permissions.USERS_CREATE,
    Permissions.USERS_UPDATE,
    Permissions.JOBS_READ,
    Permissions.JOBS_CREATE,
    Permissions.JOBS_UPDATE,
    Permissions.JOBS_DELETE,
  ],

  TECHNICIAN: [
    Permissions.ASSETS_READ,
    Permissions.WORK_ORDERS_READ,
    Permissions.WORK_ORDERS_CREATE,
    Permissions.WORK_ORDERS_UPDATE,
    Permissions.INVENTORY_READ,
    Permissions.PM_READ,
    Permissions.JOBS_READ,
    Permissions.JOBS_UPDATE,
  ],

  CUSTOMER: [
    Permissions.ASSETS_READ,
    Permissions.WORK_ORDERS_READ,
    Permissions.INVENTORY_READ,
    Permissions.PM_READ,
    Permissions.JOBS_READ,
    Permissions.JOBS_CREATE,
    Permissions.ANALYTICS_READ,
  ],

  BOTH: [
    Permissions.ASSETS_READ,
    Permissions.WORK_ORDERS_READ,
    Permissions.WORK_ORDERS_CREATE,
    Permissions.WORK_ORDERS_UPDATE,
    Permissions.INVENTORY_READ,
    Permissions.PM_READ,
    Permissions.JOBS_READ,
    Permissions.JOBS_CREATE,
    Permissions.JOBS_UPDATE,
    Permissions.ANALYTICS_READ,
  ],
};

// ============================================================================
// FEATURE FLAGS (centralized registry)
// ============================================================================

export const FeatureFlags = {
  ADVANCED_ANALYTICS: 'advancedAnalytics',
  AI_PREDICTIONS: 'aiPredictions',
  DIGITAL_TWIN_3D: 'digitalTwin3d',
  REAL_TIME_MAP: 'realTimeMap',
  INVENTORY_FORECASTING: 'inventoryForecasting',
  MOBILE_APP_ACCESS: 'mobileAppAccess',
  API_ACCESS: 'apiAccess',
  CUSTOM_REPORTS: 'customReports',
} as const;

export type FeatureFlagKey = (typeof FeatureFlags)[keyof typeof FeatureFlags];

// Default feature flag availability by role
export const DEFAULT_ROLE_FEATURES: Record<Role, FeatureFlagKey[]> = {
  ADMIN: Object.values(FeatureFlags),
  MANAGER: Object.values(FeatureFlags),
  TECHNICIAN: [FeatureFlags.REAL_TIME_MAP, FeatureFlags.MOBILE_APP_ACCESS, FeatureFlags.API_ACCESS],
  CUSTOMER: [FeatureFlags.ADVANCED_ANALYTICS, FeatureFlags.REAL_TIME_MAP],
  BOTH: [FeatureFlags.ADVANCED_ANALYTICS, FeatureFlags.REAL_TIME_MAP, FeatureFlags.MOBILE_APP_ACCESS],
};

// ============================================================================
// PERMISSION RESOLUTION
// ============================================================================

export interface ResolvedPermissions {
  permissions: Set<PermissionKey>;
  features: Set<FeatureFlagKey>;
  role: Role | null;
  isSuperAdmin: boolean;
}

/**
 * Resolve effective permissions for a user.
 * Combines role-based defaults with any DB overrides.
 */
export async function resolveUserPermissions(
  userId: string,
  role: Role,
  isSuperAdmin: boolean
): Promise<ResolvedPermissions> {
  const prismaInstance = prisma;

  // Super admin gets everything
  if (isSuperAdmin) {
    return {
      permissions: new Set(Object.values(Permissions)),
      features: new Set(Object.values(FeatureFlags)),
      role,
      isSuperAdmin: true,
    };
  }

  // Get DB permissions
  const rolePerms = await prisma.rolePermission.findMany({
    where: { role },
    include: { permission: true },
  });

  const dbPermissionKeys = new Set(
    rolePerms.map(rp => rp.permission.key as PermissionKey)
  );

  // Get DB feature overrides
  const userFlags = await prisma.userFeatureFlag.findMany({
    where: { userId },
    include: { featureFlag: true },
  });

  const dbFeatureKeys = new Set(
    userFlags.filter(uf => uf.enabled).map(uf => uf.featureFlag.key as FeatureFlagKey)
  );

  // Merge with defaults (defaults win if DB is empty, DB wins otherwise)
  const defaultPerms = new Set(DEFAULT_ROLE_PERMISSIONS[role] || []);
  const defaultFeatures = new Set(DEFAULT_ROLE_FEATURES[role] || []);

  // If DB has entries, use them; otherwise fall back to defaults
  const effectivePermissions =
    dbPermissionKeys.size > 0 ? dbPermissionKeys : defaultPerms;
  const effectiveFeatures =
    dbFeatureKeys.size > 0 ? dbFeatureKeys : defaultFeatures;

  return {
    permissions: effectivePermissions,
    features: effectiveFeatures,
    role,
    isSuperAdmin: false,
  };
}

/**
 * Check if a resolved permission set has a specific permission.
 */
export function hasPermission(
  resolved: ResolvedPermissions,
  permission: PermissionKey
): boolean {
  return resolved.isSuperAdmin || resolved.permissions.has(permission);
}

/**
 * Check if a resolved permission set has a specific feature flag.
 */
export function hasFeature(
  resolved: ResolvedPermissions,
  feature: FeatureFlagKey
): boolean {
  return resolved.isSuperAdmin || resolved.features.has(feature);
}

/**
 * Check if resolved permissions has ALL of the given permissions.
 */
export function hasAllPermissions(
  resolved: ResolvedPermissions,
  ...permissions: PermissionKey[]
): boolean {
  if (resolved.isSuperAdmin) return true;
  return permissions.every(p => resolved.permissions.has(p));
}

/**
 * Check if resolved permissions has ANY of the given permissions.
 */
export function hasAnyPermission(
  resolved: ResolvedPermissions,
  ...permissions: PermissionKey[]
): boolean {
  if (resolved.isSuperAdmin) return true;
  return permissions.some(p => resolved.permissions.has(p));
}

// ============================================================================
// VIEWER SESSION (soft-login tracking)
// ============================================================================

import { randomUUID } from 'crypto';
import { cookies } from 'next/headers';

const VIEWER_TOKEN_COOKIE = 'viewer-token';
const VIEWER_MAX_AGE_DAYS = 30;

export interface ViewerContext {
  isViewer: true;
  token: string;
  fingerprint?: string | null;
}

/**
 * Create or retrieve a viewer session token for guest users.
 * This allows tracking viewers without requiring full authentication.
 */
export async function getOrCreateViewerSession(): Promise<ViewerContext> {
  const cookieStore = await cookies();
  const existingToken = cookieStore.get(VIEWER_TOKEN_COOKIE)?.value;

  if (existingToken) {
    // Validate token exists in DB
    const prisma = prisma;
    const session = await prisma.viewerSession.findUnique({
      where: { token: existingToken },
    });

    if (session && session.expiresAt > new Date()) {
      // Refresh lastSeenAt
      await prisma.viewerSession.update({
        where: { id: session.id },
        data: { lastSeenAt: new Date() },
      });
      return {
        isViewer: true,
        token: existingToken,
        fingerprint: session.fingerprint,
      };
    }
  }

  // Create new viewer session
  const token = randomUUID();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + VIEWER_MAX_AGE_DAYS);

  const prisma = prisma;
  await prisma.viewerSession.create({
    data: {
      token,
      expiresAt,
    },
  });

  cookieStore.set(VIEWER_TOKEN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * VIEWER_MAX_AGE_DAYS,
    path: '/',
  });

  return { isViewer: true, token };
}

/**
 * Clean up expired viewer sessions. Call this periodically (e.g. via cron).
 */
export async function cleanupViewerSessions(): Promise<number> {
  const prisma = prisma;
  const result = await prisma.viewerSession.deleteMany({
    where: { expiresAt: { lt: new Date() } },
  });
  return result.count;
}

// ============================================================================
// SEED HELPERS (run once to populate permissions and feature flags)
// ============================================================================

export async function seedPermissionsAndFlags(): Promise<void> {
  const prisma = prisma;

  // Seed permissions
  const permissionEntries = Object.entries(Permissions).map(([name, key]) => ({
    key,
    name: name.replace(/_/g, ' ').toLowerCase(),
    description: `${name} permission`,
  }));

  for (const perm of permissionEntries) {
    await prisma.permission.upsert({
      where: { key: perm.key },
      update: {},
      create: perm,
    });
  }

  // Seed feature flags
  const flagEntries = Object.entries(FeatureFlags).map(([name, key]) => ({
    key,
    name: name.replace(/_/g, ' ').toLowerCase(),
    description: `${name} feature flag`,
    defaultEnabled: false,
  }));

  for (const flag of flagEntries) {
    await prisma.featureFlag.upsert({
      where: { key: flag.key },
      update: {},
      create: flag,
    });
  }

  // Seed default role permissions
  for (const [role, perms] of Object.entries(DEFAULT_ROLE_PERMISSIONS)) {
    for (const permKey of perms) {
      const permission = await prisma.permission.findUnique({
        where: { key: permKey },
      });
      if (!permission) continue;

      await prisma.rolePermission.upsert({
        where: {
          role_permissionId: {
            role: role as Role,
            permissionId: permission.id,
          },
        },
        update: {},
        create: {
          role: role as Role,
          permissionId: permission.id,
        },
      });
    }
  }
}
