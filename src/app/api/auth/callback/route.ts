import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

function generateUsername(email: string, name?: string): string {
  if (name) {
    const base = name.toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 20)
    return `${base}_${Math.floor(Math.random() * 9000) + 1000}`
  }
  const emailBase = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 20)
  return `${emailBase}_${Math.floor(Math.random() * 9000) + 1000}`
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') || '/feed'
  const origin = req.nextUrl.origin

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // Ensure public.users profile exists for this user
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const admin = await createAdminClient()

          // Check if profile exists
          const { data: existing } = await admin
            .from('users')
            .select('id')
            .eq('id', user.id)
            .single()

          if (!existing) {
            // Create profile — pull from user metadata (set during signUp)
            const meta = user.user_metadata || {}
            const email = user.email || ''
            const username = meta.username || generateUsername(email, meta.full_name || meta.name)
            const displayName = meta.display_name || meta.full_name || meta.name || username

            await admin.from('users').insert({
              id: user.id,
              email,
              username,
              display_name: displayName,
              pfp_style: meta.pfp_style || 'neon_orb',
              profile_picture_url: meta.avatar_url || null,
            })
          }
        }
      } catch (profileErr) {
        // Log but don't fail the auth flow
        console.error('[auth/callback] Failed to upsert user profile:', profileErr)
      }

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`)
}
