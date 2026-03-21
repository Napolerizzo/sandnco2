import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

// GET — adult matches with instagram handles
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = await createAdminClient()

  const { data: matches, error } = await admin
    .from('sand_matches')
    .select('id, user1_id, user2_id, matched_at')
    .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
    .order('matched_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Enrich with profile data
  const matchedUserIds = (matches || []).map(m => m.user1_id === user.id ? m.user2_id : m.user1_id)

  if (matchedUserIds.length === 0) return NextResponse.json({ matches: [] })

  const { data: profiles } = await admin
    .from('sand_profiles')
    .select('user_id, display_name, instagram_handle, city, profile_picture_url')
    .in('user_id', matchedUserIds)

  const enriched = (matches || []).map(m => {
    const otherId = m.user1_id === user.id ? m.user2_id : m.user1_id
    const profile = profiles?.find(p => p.user_id === otherId)
    return { ...m, profile }
  })

  return NextResponse.json({ matches: enriched })
}
