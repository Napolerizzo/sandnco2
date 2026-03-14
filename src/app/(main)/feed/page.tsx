import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import FeedClient from '@/components/feed/FeedClient'

export const metadata = { title: 'City Feed' }

export default async function FeedPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?next=/feed')

  const [{ data: rumors }, { data: profile }] = await Promise.all([
    supabase.from('rumors')
      .select('id,anonymous_alias,title,content,category,heat_score,created_at,rumor_votes(vote_type),rumor_comments(id)')
      .eq('status', 'active')
      .order('heat_score', { ascending: false })
      .limit(20),
    supabase.from('users')
      .select('username,display_name,rank,xp,is_premium,wallet_balance')
      .eq('id', user.id)
      .single(),
  ])

  return <FeedClient initialRumors={rumors || []} profile={profile} userId={user.id} />
}
