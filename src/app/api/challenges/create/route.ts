import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient, createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  // Check premium status
  const { data: profile } = await supabase
    .from('users')
    .select('is_premium, status, wallet_balance')
    .eq('id', user.id)
    .single()

  if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
  if (profile.status === 'banned' || profile.status === 'suspended') {
    return NextResponse.json({ error: 'Your account is restricted.' }, { status: 403 })
  }
  if (!profile.is_premium) {
    return NextResponse.json({ error: 'Only Premium members can create challenges. Upgrade to Premium.' }, { status: 403 })
  }

  const { title, description, category, entryFee, prizePool, endsAt, isPremiumOnly, maxParticipants } = await req.json()

  if (!title || title.length < 5) {
    return NextResponse.json({ error: 'Title needs to be at least 5 characters.' }, { status: 400 })
  }
  if (!description || description.length < 20) {
    return NextResponse.json({ error: 'Description needs to be at least 20 characters.' }, { status: 400 })
  }

  const admin = await createAdminClient()

  const { data, error } = await admin.from('challenges').insert({
    creator_id: user.id,
    title,
    description,
    category: category || 'general',
    entry_fee: entryFee || 0,
    prize_pool: prizePool || 0,
    ends_at: endsAt || null,
    is_premium_only: isPremiumOnly ?? false,
    max_participants: maxParticipants || null,
    status: 'created',
    participant_count: 0,
  }).select('id').single()

  if (error) {
    console.error('Challenge insert error:', error)
    return NextResponse.json({ error: `Failed to create challenge: ${error.message}` }, { status: 500 })
  }

  return NextResponse.json({ success: true, id: data.id })
}
