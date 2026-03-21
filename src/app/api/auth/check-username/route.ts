import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

// Uses admin client so RLS never interferes with the availability check.
// This guarantees accurate results even before the user is authenticated
// (e.g. during the signup flow).
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const username = searchParams.get('username')?.trim().toLowerCase()

  if (!username || username.length < 3) {
    return NextResponse.json({ available: false, error: 'Too short' }, { status: 400 })
  }
  if (!/^[a-z0-9_]{3,30}$/.test(username)) {
    return NextResponse.json({ available: false, error: 'Invalid characters' }, { status: 400 })
  }

  const admin = await createAdminClient()
  const { data } = await admin
    .from('users')
    .select('id')
    .eq('username', username)
    .maybeSingle()

  return NextResponse.json({ available: !data })
}
