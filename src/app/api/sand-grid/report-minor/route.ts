import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

// POST — report a profile as potentially being a minor
// Does NOT remove the profile — flags for admin review
export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { target_user_id, reason } = await req.json()
  if (!target_user_id) return NextResponse.json({ error: 'target_user_id required' }, { status: 400 })

  const admin = await createAdminClient()

  // Create a moderation log / report entry
  await admin.from('reports').insert({
    reporter_id: user.id,
    reported_user_id: target_user_id,
    type: 'user',
    reason: reason || 'Reported as potential minor on Sand Grid adult track',
    status: 'pending',
    metadata: {
      source: 'sand_grid',
      flag: 'potential_minor',
    },
  }).catch(() => {})

  // Flag the profile — hide from adult grid pending admin review
  await admin
    .from('sand_profiles')
    .update({ show_on_grid: false })
    .eq('user_id', target_user_id)

  // Create an admin notification
  await admin.from('notifications').insert({
    user_id: user.id,  // placeholder, real admin notification goes to admin panel
    type: 'system_announcement',
    title: '🚩 Minor Report Filed',
    body: `Profile ${target_user_id} has been reported as a potential minor and hidden from the grid pending review.`,
  }).catch(() => {})

  return NextResponse.json({ success: true, message: 'Profile flagged for admin review. Thank you for keeping the grid safe.' })
}
