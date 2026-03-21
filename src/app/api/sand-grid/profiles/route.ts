import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

// GET — paginated profiles on the same age_track, excluding already-voted
export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const page = parseInt(searchParams.get('page') || '0')
  const limit = 10

  // Get own profile to determine age_track
  const { data: ownProfile } = await supabase
    .from('sand_profiles')
    .select('age_track, user_id')
    .eq('user_id', user.id)
    .single()

  if (!ownProfile) {
    return NextResponse.json({ error: 'Create your Sand Grid profile first' }, { status: 400 })
  }

  const { age_track } = ownProfile
  const admin = await createAdminClient()

  // Get IDs already voted on (adult) or friend-voted (ghost)
  let votedIds: string[] = []
  if (age_track === 'adult') {
    const { data: votes } = await admin
      .from('sand_votes')
      .select('target_id')
      .eq('voter_id', user.id)
    votedIds = votes?.map(v => v.target_id) || []
  } else {
    const { data: votes } = await admin
      .from('sand_friend_votes')
      .select('target_id')
      .eq('voter_id', user.id)
    votedIds = votes?.map(v => v.target_id) || []
  }

  // Exclude self + already voted
  const excludeIds = [user.id, ...votedIds]

  let query = admin
    .from('sand_profiles')
    .select('id, user_id, display_name, bio, age_track, city, interests, profile_picture_url, created_at')
    .eq('age_track', age_track)
    .eq('show_on_grid', true)
    .not('user_id', 'in', `(${excludeIds.map(id => `"${id}"`).join(',')})`)
    .order('created_at', { ascending: false })
    .range(page * limit, (page + 1) * limit - 1)

  const { data: profiles, error } = await query

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ profiles: profiles || [], has_more: (profiles?.length || 0) === limit })
}
