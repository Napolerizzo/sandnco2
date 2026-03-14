import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import RumorsClient from '@/components/rumor/RumorsClient'

export const metadata = { title: 'Rumors' }

export default async function RumorsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?next=/rumors')

  const { data: rumors } = await supabase
    .from('rumors')
    .select('id,anonymous_alias,title,content,category,tags,heat_score,created_at,verdict,status,rumor_votes(vote_type),rumor_comments(id)')
    .eq('status', 'active')
    .order('heat_score', { ascending: false })
    .limit(30)

  return <RumorsClient rumors={rumors || []} userId={user.id} />
}
