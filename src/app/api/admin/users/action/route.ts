import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient, createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ success: false }, { status: 401 })

  // Verify admin role
  const { data: adminRole } = await supabase.from('admin_roles').select('role').eq('user_id', user.id).single()
  if (!adminRole || !['super_admin', 'platform_admin', 'moderator'].includes(adminRole.role)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 })
  }

  const { userId, action, reason } = await req.json()
  const admin = await createAdminClient()

  const statusMap: Record<string, string> = {
    warn: 'warned',
    suspend: 'suspended',
    ban: 'banned',
    unsuspend: 'active',
  }

  const newStatus = statusMap[action]
  if (!newStatus) return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 })

  await admin.from('users').update({ status: newStatus }).eq('id', userId)

  // Log moderation action
  await admin.from('moderation_logs').insert({
    moderator_id: user.id,
    target_user_id: userId,
    action,
    reason: reason || `${action} via admin panel`,
  })

  // Notify user if warned
  if (action === 'warn') {
    await admin.from('notifications').insert({
      user_id: userId,
      type: 'moderation_warning',
      title: '⚠️ Account Warning',
      body: reason || 'Your account has received a warning. Please review our community guidelines.',
    })
  }

  return NextResponse.json({ success: true })
}
