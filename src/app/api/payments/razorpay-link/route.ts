import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

const RAZORPAY_PAYMENT_PAGE = 'https://rzp.io/rzp/w4Zfnen'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { amount, type = 'wallet_deposit' } = await req.json()
  const amountNum = Number(amount)

  if (!amountNum || amountNum < 10 || amountNum > 100000) {
    return NextResponse.json({ error: 'Amount must be between ₹10 and ₹1,00,000' }, { status: 400 })
  }

  // Fetch user profile for pre-fill
  const { data: profile } = await supabase
    .from('users')
    .select('username, email')
    .eq('id', user.id)
    .single()

  if (!profile?.username) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
  }

  const admin = await createAdminClient()

  // Create pending payment record
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

  // Build callback URL pointing back to /wallet with success flag
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://sandnco.in'
  const callbackUrl = `${appUrl}/wallet?payment=success&ref=${pending.id}`

  // Build Razorpay Payment Page URL with pre-filled fields
  const params = new URLSearchParams({
    'prefill[name]': profile.username,
    'prefill[email]': profile.email || user.email || '',
    'notes[username]': profile.username,
    'notes[payment_type]': type,
    'notes[pending_id]': pending.id,
    'callback_url': callbackUrl,
    // amount in paise
    'amount': String(Math.round(amountNum * 100)),
  })

  const redirectUrl = `${RAZORPAY_PAYMENT_PAGE}?${params.toString()}`

  return NextResponse.json({ redirect_url: redirectUrl, pending_id: pending.id })
}
