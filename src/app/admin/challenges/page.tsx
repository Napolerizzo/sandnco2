import { createClient } from '@/lib/supabase/server'
import AdminChallengesClient from '@/components/admin/AdminChallengesClient'

export default async function AdminChallengesPage() {
  const supabase = await createClient()

  const [{ data: active }, { data: completed }] = await Promise.all([
    supabase.from('challenges')
      .select('id, title, description, category, entry_fee, prize_pool, status, participant_count, max_players, starts_at, ends_at, created_at, created_by, users!challenges_created_by_fkey(username, display_name)')
      .in('status', ['created', 'waiting_for_players', 'active', 'judging'])
      .order('created_at', { ascending: false })
      .limit(50),
    supabase.from('challenges')
      .select('id, title, category, entry_fee, prize_pool, status, participant_count, winner_id, created_at, users!challenges_created_by_fkey(username)')
      .in('status', ['completed', 'cancelled'])
      .order('created_at', { ascending: false })
      .limit(30),
  ])

  return <AdminChallengesClient active={active || []} completed={completed || []} />
}
