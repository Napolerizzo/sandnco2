import { createClient } from '@/lib/supabase/server'
import AdminAnalyticsClient from '@/components/admin/AdminAnalyticsClient'

export default async function AdminAnalyticsPage() {
  const supabase = await createClient()

  const [
    { count: totalUsers },
    { count: premiumUsers },
    { count: totalRumors },
    { count: activeRumors },
    { count: totalChallenges },
    { count: totalTransactions },
    { data: recentSignups },
    { data: topUsers },
    { data: hotRumors },
  ] = await Promise.all([
    supabase.from('users').select('id', { count: 'exact', head: true }),
    supabase.from('users').select('id', { count: 'exact', head: true }).eq('is_premium', true),
    supabase.from('rumors').select('id', { count: 'exact', head: true }),
    supabase.from('rumors').select('id', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('challenges').select('id', { count: 'exact', head: true }),
    supabase.from('transactions').select('id', { count: 'exact', head: true }).eq('status', 'completed'),
    supabase.from('users').select('created_at').order('created_at', { ascending: false }).limit(30),
    supabase.from('users').select('username, display_name, xp, rank, is_premium, rumors_posted, challenges_won').order('xp', { ascending: false }).limit(10),
    supabase.from('rumors').select('title, heat_score, view_count, category, created_at').eq('status', 'active').order('heat_score', { ascending: false }).limit(10),
  ])

  return <AdminAnalyticsClient
    stats={{
      totalUsers: totalUsers || 0,
      premiumUsers: premiumUsers || 0,
      totalRumors: totalRumors || 0,
      activeRumors: activeRumors || 0,
      totalChallenges: totalChallenges || 0,
      totalTransactions: totalTransactions || 0,
    }}
    recentSignups={recentSignups || []}
    topUsers={topUsers || []}
    hotRumors={hotRumors || []}
  />
}
