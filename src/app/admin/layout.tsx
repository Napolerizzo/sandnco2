import { createClient, createAdminClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AdminSidebar from '@/components/admin/AdminSidebar'

export const metadata = { title: 'Admin Panel — SANDNCO' }

const SUPER_ADMIN_EMAILS = ['admin@sameerjhamb.com', 'sameer.jhamb1719@gmail.com']

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login?next=/admin')

  let { data: adminRole } = await supabase
    .from('admin_roles')
    .select('role, permissions')
    .eq('user_id', user.id)
    .single()

  if (!adminRole && SUPER_ADMIN_EMAILS.includes(user.email || '')) {
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
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0f1e 0%, #0F172A 40%, #111827 100%)',
      color: 'var(--text)', fontFamily: 'var(--font)', display: 'flex',
    }}>
      <AdminSidebar role={adminRole.role} permissions={adminRole.permissions} />
      <main style={{
        flex: 1, marginLeft: 260, padding: '28px 36px', minHeight: '100vh',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Subtle background aurora for admin */}
        <div style={{
          position: 'fixed', top: 0, right: 0, width: '60%', height: '50%',
          background: 'radial-gradient(ellipse at 80% 20%, rgba(99,102,241,0.06) 0%, transparent 60%)',
          pointerEvents: 'none', zIndex: 0,
        }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          {children}
        </div>
      </main>
    </div>
  )
}
