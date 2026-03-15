import { createClient } from '@/lib/supabase/server'
import AdminPaymentsClient from '@/components/admin/AdminPaymentsClient'

export default async function AdminPaymentsPage() {
  const supabase = await createClient()

  // Fetch submitted payments awaiting approval
  const { data: pendingPayments } = await supabase
    .from('upi_payments')
    .select('id, user_id, amount, unique_amount, utr_number, status, verified_by, created_at, expires_at')
    .in('status', ['submitted', 'pending'])
    .order('created_at', { ascending: false })
    .limit(50)

  // Fetch recently verified payments
  const { data: recentVerified } = await supabase
    .from('upi_payments')
    .select('id, user_id, amount, unique_amount, utr_number, status, verified_by, created_at')
    .eq('status', 'verified')
    .order('created_at', { ascending: false })
    .limit(20)

  return <AdminPaymentsClient pending={pendingPayments || []} recent={recentVerified || []} />
}
