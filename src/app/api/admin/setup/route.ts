import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

// Hardcoded super admin emails — accounts that auto-get admin
const SUPER_ADMIN_EMAILS = ['admin@sameerjhamb.com', 'sameer.jhamb1719@gmail.com']

export async function POST(req: NextRequest) {
  const { secret } = await req.json().catch(() => ({ secret: '' }))

  if (secret !== process.env.ADMIN_SETUP_SECRET) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const adminSupabase = await createAdminClient()

  const results = []

  for (const email of SUPER_ADMIN_EMAILS) {
    const { data: users, error: lookupErr } = await adminSupabase
      .from('users')
      .select('id, email')
      .eq('email', email)
      .limit(1)

    if (lookupErr || !users?.length) {
      results.push({ email, error: 'User not found' })
      continue
    }

    const userId = users[0].id

    const { error: roleErr } = await adminSupabase
      .from('admin_roles')
      .upsert({
        id: userId,
        user_id: userId,
        role: 'super_admin',
        permissions: {},
        created_at: new Date().toISOString(),
      }, { onConflict: 'user_id,role' })

    results.push({ email, success: !roleErr, error: roleErr?.message })
  }

  return NextResponse.json({ success: true, results })
}
