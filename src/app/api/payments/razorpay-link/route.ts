import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

const RAZORPAY_PAYMENT_PAGE = 'https://rzp.io/rzp/w4Zfnen'

function generateUsername(email: string): string {
  const base = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 18)
  return `${base}_${Math.floor(Math.random() * 9000) + 1000}`
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { amount, type = 'wallet_deposit' } = await req.json()
  const amountNum = Number(amount)

  if (!amountNum || amountNum < 1 || amountNum > 100000) {
    return NextResponse.json({ error: 'Amount must be between ₹1 and ₹1,00,000' }, { status: 400 })
  }

  const admin = await createAdminClient()

  // Fetch user profile via admin client so RLS never blocks the lookup
  let { data: profile } = await admin
    .from('users')
    .select('username, email, phone')
    .eq('id', user.id)
    .single()

  // If row missing entirely, create it now (trigger may have failed at signup)
  if (!profile) {
    const meta = user.user_metadata || {}
    const email = user.email || ''
    const username = meta.username || generateUsername(email)
    const { data: created } = await admin
      .from('users')
      .insert({
        id: user.id,
        email,
        username,
        display_name: meta.display_name || meta.full_name || meta.name || username,
        pfp_style: meta.pfp_style || 'neon_orb',
        profile_picture_url: meta.avatar_url || null,
      })
      .select('username, email, phone')
      .single()
    profile = created
  }

  // If row exists but username is null (partial trigger failure), patch it
  if (profile && !profile.username) {
    const fallback = generateUsername(profile.email || user.email || 'user')
    await admin.from('users').update({ username: fallback }).eq('id', user.id)
    profile = { ...profile, username: fallback }
  }

  if (!profile?.username) {
    return NextResponse.json({ error: 'Could not resolve user profile. Please contact support.' }, { status: 500 })
  }

  // Create a pending payment record so the webhook can match it
  const { data: pending, error: pendingErr } = await admin
    .from('pending_razorpay_payments')
    .insert({
      user_id: user.id,
      username: profile.username,
      amount: amountNum,
      payment_type: type,
      status: 'pending',
    })
    .select('id')
    .single()

  if (pendingErr) {
    console.error('pending_razorpay_payments insert error:', pendingErr)
    return NextResponse.json({ error: 'Failed to create payment record' }, { status: 500 })
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://sandnco.lol'
  const callbackUrl = `${appUrl}/wallet?payment=success&ref=${pending.id}`

  const email = profile.email || user.email || ''
  const phone = profile.phone || ''
  const contact = phone
    ? phone.startsWith('+') ? phone : `+91${phone.replace(/^0+/, '')}`
    : ''

  const parts: string[] = [
    `prefill[name]=${encodeURIComponent(profile.username)}`,
    `prefill[email]=${encodeURIComponent(email)}`,
    ...(contact ? [`prefill[contact]=${encodeURIComponent(contact)}`] : []),
    `notes[username]=${encodeURIComponent(profile.username)}`,
    `notes[payment_type]=${encodeURIComponent(type)}`,
    `notes[pending_id]=${encodeURIComponent(pending.id)}`,
    `amount=${Math.round(amountNum * 100)}`,
    `callback_url=${encodeURIComponent(callbackUrl)}`,
  ]

  const redirectUrl = `${RAZORPAY_PAYMENT_PAGE}?${parts.join('&')}`

  return NextResponse.json({ redirect_url: redirectUrl, pending_id: pending.id })
}
