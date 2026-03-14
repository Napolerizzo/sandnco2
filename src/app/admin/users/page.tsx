import { createClient } from '@/lib/supabase/server'
import AdminUsersClient from '@/components/admin/AdminUsersClient'

export default async function AdminUsersPage() {
  const supabase = await createClient()

  const { data: users } = await supabase
    .from('users')
    .select('id,username,display_name,email,rank,xp,status,is_premium,created_at,wallet_balance')
    .order('created_at', { ascending: false })
    .limit(50)

  return <AdminUsersClient users={users || []} />
}
