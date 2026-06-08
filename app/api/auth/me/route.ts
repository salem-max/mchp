import { createClient } from '@/lib/supabase/server'
import { getUserFromSession } from '@/lib/auth'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

const ENABLE_AUTH = process.env.ENABLE_AUTH !== 'false'
const SKIP_LOGIN = process.env.SKIP_LOGIN === 'true'
const NODE_ENV = process.env.NODE_ENV

export async function GET() {
  try {
    // ── Sandbox bypass ─────────────────────────────────────────────────────
    if (!ENABLE_AUTH || (NODE_ENV === 'development' && SKIP_LOGIN)) {
      return NextResponse.json({
        id: 'sandbox-user-id',
        email: 'sandbox@fixswift.dev',
        name: 'Sandbox User',
        role: 'CUSTOMER',
        avatar: null,
        phone: null,
      })
    }

    // ── Path 1: JWT cookie (Prisma-based auth) ─────────────────────────────
    const cookieStore = await cookies()
    const jwtToken = cookieStore.get('auth-token')?.value

    if (jwtToken) {
      const user = await getUserFromSession(jwtToken)
      if (user) {
        return NextResponse.json({
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role.toUpperCase(),
          avatar: null,
          phone: (user as any).phone ?? null,
          isSuperAdmin: (user as any).isSuperAdmin ?? false,
        })
      }
    }

    // ── Path 2: Supabase session ───────────────────────────────────────────
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: profile?.full_name || user.user_metadata?.full_name || '',
      role: (profile?.role || user.user_metadata?.role || 'CUSTOMER').toUpperCase(),
      avatar: profile?.avatar_url || null,
      phone: profile?.phone || null,
    })
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}
