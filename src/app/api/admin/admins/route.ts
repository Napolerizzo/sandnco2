import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient, createClient } from '@/lib/supabase/server'

async function verifySuperAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data: role } = await supabase.from('admin_roles').select('role').eq('user_id', user.id).single()
  if (!role || role.role !== 'super_admin') return null
  return user
}

export async function GET() {
  const user = await verifySuperAdmin()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

  const admin = await createAdminClient()
  const { data: admins } = await admin
    .from('admin_roles')
    .select('id, user_id, role, created_at, users(email, username, display_name)')
    .order('created_at', { ascending: false })

  return NextResponse.json({ admins: admins || [] })
}

export async function POST(req: NextRequest) {
  const user = await verifySuperAdmin()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

  const { email, role } = await req.json()
  if (!email || !role) return NextResponse.json({ error: 'Email and role required' }, { status: 400 })

  const validRoles = ['platform_admin', 'moderator', 'myth_buster', 'support_staff']
  if (!validRoles.includes(role)) {
    return NextResponse.json({ error: 'Invalid role. Use: ' + validRoles.join(', ') }, { status: 400 })
  }

  const admin = await createAdminClient()

  // Find user by email
  const { data: users } = await admin.from('users').select('id').eq('email', email).limit(1)
  if (!users?.length) {
    return NextResponse.json({ error: 'User not found with this email' }, { status: 404 })
  }

  const targetUserId = users[0].id

  const { error } = await admin.from('admin_roles').upsert({
    id: targetUserId,
    user_id: targetUserId,
    role,
    permissions: {},
    created_at: new Date().toISOString(),
  }, { onConflict: 'user_id,role' })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}

export async function DELETE(req: NextRequest) {
  const user = await verifySuperAdmin()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

  const { userId } = await req.json()
  if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 })

  // Prevent removing yourself
  if (userId === user.id) {
    return NextResponse.json({ error: 'Cannot remove yourself' }, { status: 400 })
  }

  const admin = await createAdminClient()
  await admin.from('admin_roles').delete().eq('user_id', userId)

  return NextResponse.json({ success: true })
}
