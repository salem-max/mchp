import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile, error } = await supabase
      .from('profiles')
      .select(`*, technician_profiles(*)`)
      .eq('id', user.id)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      id: profile.id,
      name: profile.full_name,
      email: profile.email,
      phone: profile.phone,
      avatar: profile.avatar_url,
      bio: profile.technician_profiles?.bio || '',
      skills: profile.technician_profiles?.skills || [],
      hourlyRate: profile.technician_profiles?.hourly_rate || 0,
      available: profile.technician_profiles?.is_available ?? true,
      rating: profile.technician_profiles?.rating || 0,
      totalJobs: profile.technician_profiles?.total_jobs || 0,
      completedJobs: profile.technician_profiles?.completed_jobs || 0,
      joinedDate: profile.created_at,
    })
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, phone, bio, skills, hourlyRate, available } = body

    // Update profile
    if (name || phone) {
      await supabase.from('profiles').update({
        full_name: name,
        phone: phone,
      }).eq('id', user.id)
    }

    // Upsert technician profile
    await supabase.from('technician_profiles').upsert({
      id: user.id,
      bio: bio,
      skills: skills,
      hourly_rate: hourlyRate,
      is_available: available,
    }, { onConflict: 'id' })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
  }
}
