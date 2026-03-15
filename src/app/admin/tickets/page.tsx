import { createClient } from '@/lib/supabase/server'
import AdminTicketsClient from '@/components/admin/AdminTicketsClient'

export default async function AdminTicketsPage() {
  const supabase = await createClient()

  const [{ data: openTickets }, { data: resolvedTickets }] = await Promise.all([
    supabase.from('support_tickets')
      .select('id, user_id, email, category, subject, description, status, priority, ai_response, created_at, users(username, display_name, email)')
      .in('status', ['open', 'ai_handled', 'escalated'])
      .order('created_at', { ascending: false })
      .limit(50),
    supabase.from('support_tickets')
      .select('id, user_id, category, subject, status, priority, resolved_at, created_at, users(username)')
      .in('status', ['resolved', 'closed'])
      .order('resolved_at', { ascending: false })
      .limit(30),
  ])

  return <AdminTicketsClient open={openTickets || []} resolved={resolvedTickets || []} />
}
