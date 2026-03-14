import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import ProfileClient from '@/components/ProfileClient'

export default async function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params
  const supabase = await createClient()
  const { data: { user: currentUser } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('users')
    .select('id,username,display_name,rank,xp,bio,city,is_premium,profile_picture_url,pfp_style,created_at,rumors_posted,challenges_won,myths_busted')
    .eq('username', username)
    .single()

  if (!profile) notFound()

  const { data: rumors } = await supabase
    .from('rumors')
    .select('id,title,category,heat_score,created_at')
    .eq('author_id', profile.id)
    .eq('is_anonymous', false)
    .order('created_at', { ascending: false })
    .limit(10)

  return (
    <ProfileClient
      profile={profile}
      rumors={rumors || []}
      isOwnProfile={currentUser?.id === profile.id}
    />
  )
}
