import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

// POST — adult track Spark/Pass vote + mutual match check
export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { target_id, vote } = await req.json()

  if (!target_id || !vote) return NextResponse.json({ error: 'target_id and vote required' }, { status: 400 })
  if (!['spark', 'pass'].includes(vote)) return NextResponse.json({ error: 'Invalid vote. Must be spark or pass' }, { status: 400 })
  if (target_id === user.id) return NextResponse.json({ error: 'Cannot vote on yourself' }, { status: 400 })

  const admin = await createAdminClient()

  // Verify both users are on adult track
  const { data: profiles } = await admin
    .from('sand_profiles')
    .select('user_id, age_track')
    .in('user_id', [user.id, target_id])

  const myProfile = profiles?.find(p => p.user_id === user.id)
  const targetProfile = profiles?.find(p => p.user_id === target_id)

  if (!myProfile || myProfile.age_track !== 'adult') {
    return NextResponse.json({ error: 'Adult track only' }, { status: 403 })
  }
  if (!targetProfile || targetProfile.age_track !== 'adult') {
    return NextResponse.json({ error: 'Target user is not on the adult track' }, { status: 400 })
  }

  // Upsert vote (store as vibe/skip in DB for compatibility with 007 migration)
  const dbVote = vote === 'spark' ? 'vibe' : 'skip'
  const { error: voteErr } = await admin.from('sand_votes').upsert({
    voter_id: user.id,
    target_id,
    vote: dbVote,
  }, { onConflict: 'voter_id,target_id' })

  if (voteErr) return NextResponse.json({ error: voteErr.message }, { status: 500 })

  let matched = false
  let instagram_handle: string | null = null

  if (vote === 'spark') {
    const { data: reverseVote } = await admin
      .from('sand_votes')
      .select('vote')
      .eq('voter_id', target_id)
      .eq('target_id', user.id)
      .single()

    if (reverseVote?.vote === 'vibe') {
      const [u1, u2] = [user.id, target_id].sort()
      await admin.from('sand_matches').upsert({ user1_id: u1, user2_id: u2 }, { onConflict: 'user1_id,user2_id' })

      const { data: tProfile } = await admin
        .from('sand_profiles')
        .select('instagram_handle')
        .eq('user_id', target_id)
        .single()

      instagram_handle = tProfile?.instagram_handle || null
      matched = true

      await admin.from('notifications').insert({
        user_id: target_id,
        type: 'new_follower',
        title: '⚡ Mutual Spark on The Sand Grid!',
        body: 'Someone sparked back! Check your matches.',
      }).catch(() => {})
    }
  }

  return NextResponse.json({ success: true, matched, instagram_handle })
}
