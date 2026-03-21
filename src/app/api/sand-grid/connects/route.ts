import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

// GET — Ghost Mode connections with instagram handles
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = await createAdminClient()

  const { data: connects, error } = await admin
    .from('sand_connects')
    .select('id, user1_id, user2_id, connected_at')
    .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
    .order('connected_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const connectedIds = (connects || []).map(c => c.user1_id === user.id ? c.user2_id : c.user1_id)

  if (connectedIds.length === 0) return NextResponse.json({ connects: [] })

  const { data: profiles } = await admin
    .from('sand_profiles')
    .select('user_id, display_name, instagram_handle, city, profile_picture_url')
    .in('user_id', connectedIds)

  const enriched = (connects || []).map(c => {
    const otherId = c.user1_id === user.id ? c.user2_id : c.user1_id
    const profile = profiles?.find(p => p.user_id === otherId)
    return { ...c, profile }
  })

  return NextResponse.json({ connects: enriched })
}
