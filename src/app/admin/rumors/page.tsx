import { createClient } from '@/lib/supabase/server'
import AdminRumorsClient from '@/components/admin/AdminRumorsClient'

export default async function AdminRumorsPage() {
  const supabase = await createClient()

  const { data: pendingRumors } = await supabase
    .from('rumors')
    .select('id, title, content, category, status, verdict, verdict_reason, heat_score, view_count, is_anonymous, anonymous_alias, city, created_at')
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
    .limit(50)

  const { data: activeRumors } = await supabase
    .from('rumors')
    .select('id, title, content, category, status, verdict, verdict_reason, heat_score, view_count, is_anonymous, anonymous_alias, city, created_at')
    .eq('status', 'active')
    .order('heat_score', { ascending: false })
    .limit(50)

  return <AdminRumorsClient pending={pendingRumors || []} active={activeRumors || []} />
}
