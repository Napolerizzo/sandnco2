import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import RumorDetailClient from '@/components/rumor/RumorDetailClient'

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: rumor } = await supabase
    .from('rumors')
    .select('title')
    .eq('id', id)
    .single()

  return { title: rumor?.title || 'Rumor' }
}

export default async function RumorDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/login?next=/rumors/${id}`)

  // Fetch rumor with all fields
  const { data: rumor, error } = await supabase
    .from('rumors')
    .select('id,author_id,anonymous_alias,title,content,category,tags,heat_score,verdict,verdict_reason,status,view_count,is_anonymous,city,created_at')
    .eq('id', id)
    .single()

  if (error || !rumor) notFound()

  // Fetch votes, comments, and user's vote in parallel
  const [votesRes, commentsRes, userVoteRes] = await Promise.all([
    supabase
      .from('rumor_votes')
      .select('rumor_id,user_id,vote_type')
      .eq('rumor_id', id),
    supabase
      .from('rumor_comments')
      .select('id,rumor_id,author_id,content,is_anonymous,anonymous_alias,parent_id,upvotes,created_at,users:author_id(username,display_name,rank,profile_picture_url)')
      .eq('rumor_id', id)
      .order('created_at', { ascending: true }),
    supabase
      .from('rumor_votes')
      .select('vote_type')
      .eq('rumor_id', id)
      .eq('user_id', user.id)
      .single(),
  ])

  // Increment view count (fire-and-forget)
  supabase
    .from('rumors')
    .update({ view_count: (rumor.view_count || 0) + 1 })
    .eq('id', id)
    .then(() => {})

  return (
    <RumorDetailClient
      rumor={rumor}
      votes={votesRes.data || []}
      comments={commentsRes.data || []}
      userVote={userVoteRes.data?.vote_type || null}
      userId={user.id}
    />
  )
}
