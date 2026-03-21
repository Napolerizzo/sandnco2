import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

const RAZORPAY_PAYMENT_PAGE = 'https://rzp.io/rzp/w4Zfnen'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { amount, type = 'wallet_deposit' } = await req.json()
  const amountNum = Number(amount)

  if (!amountNum || amountNum < 1 || amountNum > 100000) {
    return NextResponse.json({ error: 'Amount must be between ₹1 and ₹1,00,000' }, { status: 400 })
  }

  // Fetch user profile for prefill
  const { data: profile } = await supabase
    .from('users')
    .select('username, email, phone')
    .eq('id', user.id)
    .single()

  if (!profile?.username) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
  }

  const admin = await createAdminClient()

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
  // Razorpay contact: must be 10 digits, optionally prefixed with +91
  const contact = phone
    ? phone.startsWith('+') ? phone : `+91${phone.replace(/^0+/, '')}`
    : ''

  // Build query string MANUALLY — do NOT use URLSearchParams because it
  // encodes [ ] to %5B %5D which Razorpay's payment page does not recognise.
  // Only encode the *values*, keep the bracket key syntax literal.
  const parts: string[] = [
    `prefill[name]=${encodeURIComponent(profile.username)}`,
    `prefill[email]=${encodeURIComponent(email)}`,
    ...(contact ? [`prefill[contact]=${encodeURIComponent(contact)}`] : []),
    `notes[username]=${encodeURIComponent(profile.username)}`,
    `notes[payment_type]=${encodeURIComponent(type)}`,
    `notes[pending_id]=${encodeURIComponent(pending.id)}`,
    // Amount in paise (100 paise = ₹1)
    `amount=${Math.round(amountNum * 100)}`,
    // Redirect user back to wallet after payment
    `callback_url=${encodeURIComponent(callbackUrl)}`,
  ]

  const redirectUrl = `${RAZORPAY_PAYMENT_PAGE}?${parts.join('&')}`

  return NextResponse.json({ redirect_url: redirectUrl, pending_id: pending.id })
}
