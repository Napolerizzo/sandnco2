import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AdminSidebar from '@/components/admin/AdminSidebar'

export const metadata = { title: 'Admin Panel — SANDNCO' }

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login?next=/admin')

  const { data: adminRole } = await supabase
    .from('admin_roles')
    .select('role, permissions')
    .eq('user_id', user.id)
    .single()

  if (!adminRole) redirect('/')

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', fontFamily: 'var(--font)', display: 'flex' }}>
      <AdminSidebar role={adminRole.role} permissions={adminRole.permissions} />
      <main style={{ flex: 1, marginLeft: 240, padding: 32, minHeight: '100vh' }}>
        {children}
      </main>
    </div>
  )
}
