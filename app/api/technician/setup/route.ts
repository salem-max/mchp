import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { skills, hourlyRate } = body

    if (!skills || skills.length === 0) {
      return NextResponse.json({ error: 'At least one skill is required' }, { status: 400 })
    }

    const { error } = await supabase.from('technician_profiles').upsert({
      id: user.id,
      skills,
      hourly_rate: hourlyRate ? parseFloat(hourlyRate) : null,
      is_available: true,
    }, { onConflict: 'id' })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Update role to technician if not already
    await supabase.from('profiles').update({ role: 'technician' }).eq('id', user.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to submit setup' }, { status: 500 })
  }
}
