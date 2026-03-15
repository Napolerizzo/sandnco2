import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient, createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  // Validate session
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  // Check premium status
  const { data: profile } = await supabase
    .from('users')
    .select('is_premium, status')
    .eq('id', user.id)
    .single()

  if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
  if (profile.status === 'banned' || profile.status === 'suspended') {
    return NextResponse.json({ error: 'Your account is restricted from posting.' }, { status: 403 })
  }
  if (!profile.is_premium) {
    return NextResponse.json({ error: 'Only Premium members can post rumors. Upgrade to Premium to unlock this.' }, { status: 403 })
  }

  const { title, content, category, tags, isAnonymous, city, anonymousAlias } = await req.json()

  // Basic validation
  if (!title || title.length < 10) {
    return NextResponse.json({ error: 'Title needs to be at least 10 characters.' }, { status: 400 })
  }
  if (!content || content.length < 30) {
    return NextResponse.json({ error: 'Story needs to be at least 30 characters.' }, { status: 400 })
  }

  // Use admin client to bypass RLS
  const admin = await createAdminClient()

  const { data, error } = await admin.from('rumors').insert({
    author_id: user.id,
    anonymous_alias: anonymousAlias,
    title,
    content,
    category: category || 'general',
    tags: tags || [],
    is_anonymous: isAnonymous ?? true,
    city: city || null,
    status: 'pending',
  }).select('id').single()

  if (error) {
    console.error('Rumor insert error:', error)
    return NextResponse.json({ error: `Failed to post: ${error.message}` }, { status: 500 })
  }

  // Award XP
  await admin.rpc('increment_xp', { user_id: user.id, amount: 50 }).catch(() => {})

  return NextResponse.json({ success: true, id: data.id })
}
