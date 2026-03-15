import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

// Hardcoded super admin email — the only account that auto-gets admin
const SUPER_ADMIN_EMAIL = 'admin@sameerjhamb.com'

export async function POST(req: NextRequest) {
  const { secret } = await req.json().catch(() => ({ secret: '' }))

  if (secret !== process.env.ADMIN_SETUP_SECRET) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const adminSupabase = await createAdminClient()

  // Find user by email
  const { data: users, error: lookupErr } = await adminSupabase
    .from('users')
    .select('id, email')
    .eq('email', SUPER_ADMIN_EMAIL)
    .limit(1)

  if (lookupErr || !users?.length) {
    return NextResponse.json({
      error: 'Admin user not found. Make sure the account exists first.',
      detail: lookupErr?.message,
    }, { status: 404 })
  }

  const userId = users[0].id

  // Upsert admin role (idempotent)
  const { error: roleErr } = await adminSupabase
    .from('admin_roles')
    .upsert({
      id: userId,
      user_id: userId,
      role: 'super_admin',
      permissions: {},
      created_at: new Date().toISOString(),
    }, { onConflict: 'user_id,role' })

  if (roleErr) {
    return NextResponse.json({ error: 'Failed to assign role', detail: roleErr.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, message: `${SUPER_ADMIN_EMAIL} is now super_admin` })
}
