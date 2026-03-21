import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

function calcAgeTrack(dob: string): 'adult' | 'ghost' | null {
  const birth = new Date(dob)
  if (isNaN(birth.getTime())) return null
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const m = today.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
  if (age < 13) return null   // under 13 not allowed
  if (age < 18) return 'ghost'
  return 'adult'
}

// GET — fetch own profile
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('sand_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (error && error.code !== 'PGRST116') {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ profile: data || null })
}

// POST — create or update profile
export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { display_name, bio, date_of_birth, city, interests, instagram_handle, profile_picture_url } = body

  if (!display_name?.trim()) return NextResponse.json({ error: 'Display name required' }, { status: 400 })
  if (!date_of_birth) return NextResponse.json({ error: 'Date of birth required' }, { status: 400 })
  if (!profile_picture_url) return NextResponse.json({ error: 'Profile picture required' }, { status: 400 })

  const age_track = calcAgeTrack(date_of_birth)
  if (!age_track) return NextResponse.json({ error: 'You must be at least 13 years old to join the Sand Grid' }, { status: 400 })

  const admin = await createAdminClient()

  const { data, error } = await admin
    .from('sand_profiles')
    .upsert({
      user_id: user.id,
      display_name: display_name.trim(),
      bio: bio?.trim() || null,
      date_of_birth,
      age_track,
      city: city?.trim() || null,
      interests: Array.isArray(interests) ? interests.filter(Boolean) : [],
      instagram_handle: instagram_handle?.trim().replace('@', '') || null,
      profile_picture_url,
      show_on_grid: true,
      dob_declared_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ profile: data })
}

// PATCH — toggle visibility or update specific fields
export async function PATCH(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const allowed: Record<string, unknown> = {}
  if (typeof body.show_on_grid === 'boolean') allowed.show_on_grid = body.show_on_grid
  if (body.bio !== undefined) allowed.bio = body.bio?.trim() || null
  if (body.instagram_handle !== undefined) allowed.instagram_handle = body.instagram_handle?.trim().replace('@', '') || null
  if (body.interests !== undefined) allowed.interests = Array.isArray(body.interests) ? body.interests : []

  allowed.updated_at = new Date().toISOString()

  const admin = await createAdminClient()
  const { data, error } = await admin
    .from('sand_profiles')
    .update(allowed)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ profile: data })
}
