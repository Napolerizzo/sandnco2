import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AdminSidebar from '@/components/admin/AdminSidebar'

export const metadata = { title: 'Admin Panel' }

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
    <div className="min-h-screen bg-[#030303] flex">
      <AdminSidebar role={adminRole.role} permissions={adminRole.permissions} />
      <main className="flex-1 ml-64 p-8">
        {children}
      </main>
    </div>
  )
}
