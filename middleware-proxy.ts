// middleware.ts (replaces supabase with neon-based auth)
import { NextResponse, type NextRequest } from 'next/server'
import { jwtVerify } from 'jose/jwt/verify'

// Feature flags for auth sandbox mode
const ENABLE_AUTH = process.env.ENABLE_AUTH !== 'false'
const SKIP_LOGIN = process.env.SKIP_LOGIN === 'true'
const NODE_ENV = process.env.NODE_ENV

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-secret-change-in-prod'
)

// Role → allowed path prefixes
const ROLE_PATHS: Record<string, string> = {
  CUSTOMER: '/dashboard/customer',
  TECHNICIAN: '/dashboard/technician',
  ADMIN: '/dashboard/admin',
  BOTH: '/dashboard/customer',
}

const DASHBOARD_PREFIXES = [
  '/dashboard/customer',
  '/dashboard/technician',
  '/dashboard/admin',
]

const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/signup',
  '/auth/login',
  '/auth/signup',
  '/auth/callback',
  '/auth/error',
  '/api/auth',
]

function dashboardForRole(role: string): string {
  return ROLE_PATHS[role?.toUpperCase()] ?? '/dashboard/customer'
}

/** Resolve role from JWT cookie (Neon auth stores JWT only) */
async function getRoleFromJwt(request: NextRequest): Promise<string | null> {
  const token = request.cookies.get('auth-token')?.value
  if (!token) return null
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return (payload.role as string) ?? null
  } catch {
    return null
  }
}

/** No-op session update (no Supabase) */
function updateSession(request: NextRequest): NextResponse {
  // If you need to refresh or extend session, implement database lookup here
  return NextResponse.next({ request })
}

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  let response = NextResponse.next({ request })

  // Skip auth checks in sandbox mode
  if (!ENABLE_AUTH || (NODE_ENV === 'development' && SKIP_LOGIN)) {
    console.log('[UNLOCKED] Auth sandbox mode: Bypassing authentication')
    return updateSession(request)
  }

  // Resolve role from JWT only (no Supabase)
  const role = await getRoleFromJwt(request)
  const isAuthenticated = !!role

  // Public routes
  const isPublicRoute = PUBLIC_ROUTES.some(route =>
    pathname === route || pathname.startsWith(route)
  )

  if (isPublicRoute) {
    return updateSession(request)
  }

  // Protect dashboard routes
  const isProtectedRoute = DASHBOARD_PREFIXES.some((p) => pathname.startsWith(p))

  if (isProtectedRoute) {
    if (!isAuthenticated) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      url.searchParams.set('redirect', pathname)
      return NextResponse.redirect(url)
    }

    // Role-based enforcement: wrong dashboard → redirect to correct one
    const allowedPrefix = ROLE_PATHS[role!.toUpperCase()]
    if (allowedPrefix && !pathname.startsWith(allowedPrefix)) {
      const url = request.nextUrl.clone()
      url.pathname = allowedPrefix
      url.search = ''
      return NextResponse.redirect(url)
    }
  }

  // Redirect authenticated users away from auth pages
  const isAuthPage = pathname === '/login' || pathname === '/signup' || pathname === '/auth/login' || pathname === '/auth/signup'
  if (isAuthPage && isAuthenticated) {
    const url = request.nextUrl.clone()
    url.pathname = dashboardForRole(role!)
    url.search = ''
    return NextResponse.redirect(url)
  }

  return updateSession(request)
}

export const config = {
  matcher: '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?|css|js|json)$).*)',
}