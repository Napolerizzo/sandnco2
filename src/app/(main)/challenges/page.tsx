import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ChallengesClient from '@/components/challenge/ChallengesClient'

export const metadata = { title: 'Challenges' }

export default async function ChallengesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?next=/challenges')

  const [{ data: challenges }, { data: profile }] = await Promise.all([
    supabase.from('challenges')
      .select('id,title,description,entry_fee,prize_pool,status,ends_at,participant_count,is_premium_only,thumbnail_url,category,created_at')
      .in('status', ['waiting_for_players', 'active', 'created'])
      .order('prize_pool', { ascending: false })
      .limit(20),
    supabase.from('users').select('wallet_balance,is_premium,rank').eq('id', user.id).single(),
  ])

  return <ChallengesClient challenges={challenges || []} profile={profile} userId={user.id} />
}
