import { createClient, createAdminClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AdminSidebar from '@/components/admin/AdminSidebar'

export const metadata = { title: 'Admin Panel — SANDNCO' }

// Hardcoded super admin — auto-provisioned on first visit
const SUPER_ADMIN_EMAIL = 'admin@sameerjhamb.com'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login?next=/admin')

  let { data: adminRole } = await supabase
    .from('admin_roles')
    .select('role, permissions')
    .eq('user_id', user.id)
    .single()

  // Auto-provision super_admin for the hardcoded admin email
  if (!adminRole && user.email === SUPER_ADMIN_EMAIL) {
    const adminClient = await createAdminClient()
    await adminClient.from('admin_roles').upsert({
      id: user.id,
      user_id: user.id,
      role: 'super_admin',
      permissions: {},
      created_at: new Date().toISOString(),
    }, { onConflict: 'user_id,role' })
    adminRole = { role: 'super_admin', permissions: {} }
  }

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
