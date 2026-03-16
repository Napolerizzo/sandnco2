import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface RouteContext {
  params: Promise<{ id: string }>
}

/**
 * GET /api/rumors/[id]/comments
 * Fetch all comments for a rumor with author info
 */
export async function GET(_req: NextRequest, context: RouteContext) {
  const { id } = await context.params
  const supabase = await createClient()

  const { data: comments, error } = await supabase
    .from('rumor_comments')
    .select('id,rumor_id,author_id,content,is_anonymous,anonymous_alias,parent_id,upvotes,created_at,users:author_id(username,display_name,rank,profile_picture_url)')
    .eq('rumor_id', id)
    .order('created_at', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ comments: comments || [] })
}

/**
 * POST /api/rumors/[id]/comments
 * Create a new comment on a rumor
 */
export async function POST(req: NextRequest, context: RouteContext) {
  const { id } = await context.params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { content, is_anonymous, parent_id } = await req.json()

  if (!content || typeof content !== 'string' || !content.trim()) {
    return NextResponse.json({ error: 'Content is required' }, { status: 400 })
  }

  if (content.trim().length > 2000) {
    return NextResponse.json({ error: 'Comment too long (max 2000 characters)' }, { status: 400 })
  }

  // Generate anonymous alias if posting anonymously
  let anonymous_alias: string | null = null
  if (is_anonymous) {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
    let suffix = ''
    for (let i = 0; i < 8; i++) {
      suffix += chars[Math.floor(Math.random() * chars.length)]
    }
    anonymous_alias = `anon_${suffix}`
  }

  // If parent_id is provided, verify it belongs to this rumor
  if (parent_id) {
    const { data: parentComment } = await supabase
      .from('rumor_comments')
      .select('id')
      .eq('id', parent_id)
      .eq('rumor_id', id)
      .single()

    if (!parentComment) {
      return NextResponse.json({ error: 'Parent comment not found' }, { status: 404 })
    }
  }

  const { data: comment, error } = await supabase
    .from('rumor_comments')
    .insert({
      rumor_id: id,
      author_id: user.id,
      content: content.trim(),
      is_anonymous: !!is_anonymous,
      anonymous_alias,
      parent_id: parent_id || null,
    })
    .select('id,rumor_id,author_id,content,is_anonymous,anonymous_alias,parent_id,upvotes,created_at,users:author_id(username,display_name,rank,profile_picture_url)')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ comment }, { status: 201 })
}
