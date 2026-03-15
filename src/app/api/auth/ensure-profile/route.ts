import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

function generateUsername(email: string, name?: string): string {
  const base = (name || email.split('@')[0])
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '_')
    .slice(0, 18)
  return `${base}_${Math.floor(Math.random() * 9000) + 1000}`
}

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  // Check if profile already exists
  const { data: existing } = await supabase
    .from('users')
    .select('id, username, display_name, rank, wallet_balance, is_premium, profile_picture_url')
    .eq('id', user.id)
    .single()

  if (existing) {
    return NextResponse.json({ profile: existing, created: false })
  }

  // Create profile using admin client (bypasses RLS)
  const admin = await createAdminClient()
  const meta = user.user_metadata || {}
  const email = user.email || ''
  const username = meta.username || generateUsername(email, meta.full_name || meta.name)
  const displayName = meta.display_name || meta.full_name || meta.name || username

  const { data: created, error } = await admin
    .from('users')
    .insert({
      id: user.id,
      email,
      username,
      display_name: displayName,
      pfp_style: meta.pfp_style || 'neon_orb',
      profile_picture_url: meta.avatar_url || null,
    })
    .select('id, username, display_name, rank, wallet_balance, is_premium, profile_picture_url')
    .single()

  if (error) {
    // Might be duplicate username — retry with a fresh one
    if (error.code === '23505') {
      const retryUsername = `user_${Math.floor(Math.random() * 900000) + 100000}`
      const { data: retried, error: retryErr } = await admin
        .from('users')
        .insert({
          id: user.id,
          email,
          username: retryUsername,
          display_name: displayName,
          pfp_style: meta.pfp_style || 'neon_orb',
          profile_picture_url: meta.avatar_url || null,
        })
        .select('id, username, display_name, rank, wallet_balance, is_premium, profile_picture_url')
        .single()

      if (retryErr) {
        return NextResponse.json({ error: retryErr.message }, { status: 500 })
      }
      return NextResponse.json({ profile: retried, created: true })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ profile: created, created: true })
}
