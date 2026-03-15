import { createClient } from '@/lib/supabase/server'
import AdminModerationClient from '@/components/admin/AdminModerationClient'

export default async function AdminModerationPage() {
  const supabase = await createClient()

  const [{ data: logs }, { data: reports }] = await Promise.all([
    supabase.from('moderation_logs')
      .select('id, moderator_id, target_user_id, target_content_id, target_content_type, action, reason, notes, created_at, users!moderation_logs_moderator_id_fkey(username, display_name)')
      .order('created_at', { ascending: false })
      .limit(50),
    supabase.from('reports')
      .select('id, reporter_id, type, target_id, reason, details, status, action_taken, created_at, users!reports_reporter_id_fkey(username)')
      .order('created_at', { ascending: false })
      .limit(50),
  ])

  return <AdminModerationClient logs={logs || []} reports={reports || []} />
}
