import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient, createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: adminRole } = await supabase.from('admin_roles').select('role').eq('user_id', user.id).single()
  if (!adminRole || !['super_admin', 'platform_admin'].includes(adminRole.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const { userId, action, durationDays } = await req.json()
  if (!userId || !action) {
    return NextResponse.json({ error: 'userId and action required' }, { status: 400 })
  }

  const admin = await createAdminClient()

  if (action === 'activate') {
    const days = durationDays || 30
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + days)

    // Update user premium status
    await admin.from('users').update({
      is_premium: true,
      premium_expires_at: expiresAt.toISOString(),
    }).eq('id', userId)

    // Upsert membership
    await admin.from('memberships').upsert({
      user_id: userId,
      plan: 'premium',
      is_active: true,
      started_at: new Date().toISOString(),
      expires_at: expiresAt.toISOString(),
    }, { onConflict: 'user_id' })

    return NextResponse.json({ success: true, expiresAt: expiresAt.toISOString() })
  }

  if (action === 'deactivate') {
    await admin.from('users').update({
      is_premium: false,
      premium_expires_at: null,
    }).eq('id', userId)

    await admin.from('memberships').update({ is_active: false }).eq('user_id', userId)

    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ error: 'Invalid action. Use activate or deactivate' }, { status: 400 })
}
