import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    // Clear JWT cookie (Prisma auth path)
    const cookieStore = await cookies()
    cookieStore.delete('auth-token')

    // Sign out of Supabase session (Supabase auth path)
    const supabase = await createClient()
    await supabase.auth.signOut()

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Logout failed' }, { status: 500 })
  }
}
