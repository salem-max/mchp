import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const schema = z.object({ email: z.string().email() })

export async function POST(request: NextRequest) {
  try {
    const { email } = schema.parse(await request.json())
    const supabase = await createClient()

    const { error } = await supabase.auth.signInWithOtp({
      email: email.toLowerCase(),
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/auth/callback`,
        shouldCreateUser: false, // login only — user must already exist
      },
    })

    if (error) {
      // Supabase returns an error when shouldCreateUser=false and email not found
      // Return success anyway to avoid email enumeration
      console.error('Magic login error:', error.message.replace(/[\r\n]/g, ' '))
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Magic login error:', error instanceof Error ? error.message.replace(/[\r\n]/g, ' ') : 'unknown')
    return NextResponse.json({ error: 'Unable to send sign-in link.' }, { status: 500 })
  }
}
