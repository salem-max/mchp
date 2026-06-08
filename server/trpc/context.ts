import { cookies } from 'next/headers';
import { getUserFromSession } from '@/lib/auth';
import { getOrCreateViewerSession, resolveUserPermissions, type ResolvedPermissions } from '@/lib/rbac';

export interface ContextUser {
  id: string;
  email: string;
  name: string;
  role: string;
  isSuperAdmin: boolean;
  phone?: string | null;
  lat?: number | null;
  lng?: number | null;
}

export interface ViewerContext {
  isViewer: true;
  token: string;
  fingerprint?: string | null;
}

export interface AppContext {
  user: ContextUser | null;
  viewer: ViewerContext | null;
  permissions: ResolvedPermissions | null;
}

export async function createContext(): Promise<AppContext> {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;

  // Try authenticated user first
  if (token) {
    const user = await getUserFromSession(token);
    if (user) {
      const permissions = await resolveUserPermissions(
        user.id,
        user.role as any,
        user.isSuperAdmin ?? false
      );
      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          isSuperAdmin: user.isSuperAdmin ?? false,
          phone: (user as any).phone ?? null,
          lat: (user as any).lat ? Number((user as any).lat) : null,
          lng: (user as any).lng ? Number((user as any).lng) : null,
        },
        viewer: null,
        permissions,
      };
    }
  }

  // Fall back to viewer session (soft-login / guest tracking)
  const viewer = await getOrCreateViewerSession();

  return {
    user: null,
    viewer,
    permissions: null,
  };
}

export type Context = AppContext;
