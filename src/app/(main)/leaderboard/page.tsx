import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import LeaderboardClient from '@/components/LeaderboardClient'

export const metadata = { title: 'Leaderboard' }

export default async function LeaderboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?next=/leaderboard')

  const { data: topUsers } = await supabase
    .from('users')
    .select('id,username,display_name,rank,xp,profile_picture_url,pfp_style,is_premium,challenges_won,myths_busted,rumors_posted,city')
    .eq('status', 'active')
    .order('xp', { ascending: false })
    .limit(50)

  return <LeaderboardClient users={topUsers || []} currentUserId={user.id} />
}
