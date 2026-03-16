import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface RouteContext {
  params: Promise<{ id: string }>
}

/**
 * POST /api/rumors/[id]/vote
 * Upsert a vote on a rumor (user can change their vote)
 */
export async function POST(req: NextRequest, context: RouteContext) {
  const { id } = await context.params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { vote_type } = await req.json()
  const validTypes = ['believe', 'doubt', 'spicy']

  if (!vote_type || !validTypes.includes(vote_type)) {
    return NextResponse.json({ error: 'Invalid vote_type. Must be: believe, doubt, or spicy' }, { status: 400 })
  }

  const { error } = await supabase
    .from('rumor_votes')
    .upsert(
      { rumor_id: id, user_id: user.id, vote_type },
      { onConflict: 'rumor_id,user_id' }
    )

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, vote_type })
}

/**
 * DELETE /api/rumors/[id]/vote
 * Remove the current user's vote on a rumor
 */
export async function DELETE(_req: NextRequest, context: RouteContext) {
  const { id } = await context.params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { error } = await supabase
    .from('rumor_votes')
    .delete()
    .eq('rumor_id', id)
    .eq('user_id', user.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
