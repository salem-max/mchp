import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { getUserFromSession } from '@/lib/auth';
import type { UserRole } from '@/types/cmms';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
  isSuperAdmin?: boolean;
}

/** Resolves the current user from the JWT cookie. Returns null if unauthenticated. */
export async function getAuthUser(): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;
  return getUserFromSession(token) as Promise<AuthUser | null>;
}

/**
 * Require authentication. Returns { user } or a 401 NextResponse.
 * Usage:
 *   const auth = await requireAuth();
 *   if (auth instanceof NextResponse) return auth;
 *   const { user } = auth;
 */
export async function requireAuth(): Promise<{ user: AuthUser } | NextResponse> {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return { user };
}

/**
 * Require one of the specified roles. Returns { user } or a 401/403 NextResponse.
 * Usage:
 *   const auth = await requireRole(['ADMIN', 'MANAGER']);
 *   if (auth instanceof NextResponse) return auth;
 *   const { user } = auth;
 */
export async function requireRole(
  roles: UserRole[]
): Promise<{ user: AuthUser } | NextResponse> {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (user.isSuperAdmin) return { user };
  if (!roles.includes(user.role as UserRole)) {
    return NextResponse.json(
      { error: `Forbidden: requires one of [${roles.join(', ')}]` },
      { status: 403 }
    );
  }
  return { user };
}

/** Convenience: require ADMIN or MANAGER */
export const requireManager = () => requireRole(['ADMIN', 'MANAGER']);

/** Convenience: require ADMIN only */
export const requireAdmin = () => requireRole(['ADMIN']);

/** Convenience: require any authenticated CMMS user */
export const requireCMMSUser = () => requireRole(['ADMIN', 'MANAGER', 'TECHNICIAN']);
