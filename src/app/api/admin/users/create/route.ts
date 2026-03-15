import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient, createClient } from '@/lib/supabase/server'
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: adminRole } = await supabase.from('admin_roles').select('role').eq('user_id', user.id).single()
  if (!adminRole || !['super_admin', 'platform_admin'].includes(adminRole.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const { email, password, username, displayName, autoVerify } = await req.json()
  if (!email || !password || !username) {
    return NextResponse.json({ error: 'email, password, and username are required' }, { status: 400 })
  }

  // Use the Supabase admin auth API to create the user
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 })
  }

  const adminSupabase = createSupabaseAdmin(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  // Create auth user
  const { data: authData, error: authError } = await adminSupabase.auth.admin.createUser({
    email,
    password,
    email_confirm: autoVerify !== false, // auto-confirm by default
  })

  if (authError) {
    return NextResponse.json({ error: authError.message }, { status: 400 })
  }

  if (!authData.user) {
    return NextResponse.json({ error: 'Failed to create auth user' }, { status: 500 })
  }

  const admin = await createAdminClient()

  // Check if the trigger already created the users row
  const { data: existingUser } = await admin
    .from('users')
    .select('id')
    .eq('id', authData.user.id)
    .single()

  if (existingUser) {
    // Update the row with provided details
    await admin.from('users').update({
      username,
      display_name: displayName || username,
      is_verified: autoVerify !== false,
    }).eq('id', authData.user.id)
  } else {
    // Insert manually if trigger didn't fire
    await admin.from('users').insert({
      id: authData.user.id,
      email,
      username,
      display_name: displayName || username,
      is_verified: autoVerify !== false,
    })
  }

  return NextResponse.json({
    success: true,
    user: { id: authData.user.id, email, username },
  })
}
