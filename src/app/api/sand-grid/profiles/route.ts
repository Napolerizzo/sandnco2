import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

// GET — paginated profiles on the same age_track.
// Own profile is included (marked is_own:true) so the user sees how they look.
// ?reset=1  → ignore already-voted profiles to enable infinite looping.
export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const page = parseInt(searchParams.get('page') || '0')
  const reset = searchParams.get('reset') === '1'
  const limit = 10

  // Get own profile to determine age_track (use admin to bypass RLS recursion)
  const admin = await createAdminClient()
  const { data: ownProfile } = await admin
    .from('sand_profiles')
    .select('age_track, user_id')
    .eq('user_id', user.id)
    .single()

  if (!ownProfile) {
    return NextResponse.json({ error: 'Create your Sand Grid profile first' }, { status: 400 })
  }

  const { age_track } = ownProfile

  // When looping (reset=1) skip the voted exclusion so all profiles cycle back
  let votedIds: string[] = []
  if (!reset) {
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
  }

  // Build exclude list — only exclude voted profiles (not self, so own card appears)
  const excludeIds = votedIds

  let query = admin
    .from('sand_profiles')
    .select('id, user_id, display_name, bio, age_track, city, interests, profile_picture_url, created_at')
    .eq('age_track', age_track)
    .eq('show_on_grid', true)
    .order('created_at', { ascending: false })
    .range(page * limit, (page + 1) * limit - 1)

  if (excludeIds.length > 0) {
    query = query.not('user_id', 'in', `(${excludeIds.map(id => `"${id}"`).join(',')})`)
  }

  const { data: profiles, error } = await query

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Tag own profile so the client can render it specially
  const tagged = (profiles || []).map(p => ({
    ...p,
    is_own: p.user_id === user.id,
  }))

  return NextResponse.json({ profiles: tagged, has_more: (profiles?.length || 0) === limit })
}
