import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://firswift.vercel.app'

const ROLE_REDIRECT: Record<string, string> = {
  TECHNICIAN: '/technician',
  ADMIN: '/admin',
  CUSTOMER: '/customer',
}

function safeRedirect(path: string): NextResponse {
  const safePath = path.startsWith('/') ? path : '/login'
  return NextResponse.redirect(`${BASE_URL}${safePath}`)
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/customer'
  const error = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')

  if (error) {
    return safeRedirect(`/login?error=${encodeURIComponent(errorDescription ?? error)}`)
  }

  if (!code) {
    return safeRedirect('/login?error=missing-code')
  }

  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) =>
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          ),
      },
    }
  )

  const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

  if (exchangeError || !data.user) {
    return safeRedirect(`/login?error=${encodeURIComponent(exchangeError?.message ?? 'auth-failed')}`)
  }

  const role = (data.user.user_metadata?.role as string) ?? 'CUSTOMER'
  // `next` is ignored — always redirect to a known role path to prevent open redirect
  return safeRedirect(ROLE_REDIRECT[role] ?? '/customer')
}
