import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { amount, type = 'wallet_deposit' } = await req.json()
  const amountNum = Number(amount)

  if (!amountNum || amountNum < 1 || amountNum > 100000) {
    return NextResponse.json({ error: 'Amount must be between ₹1 and ₹1,00,000' }, { status: 400 })
  }

  const keyId = process.env.RAZORPAY_KEY_ID
  const keySecret = process.env.RAZORPAY_KEY_SECRET
  if (!keyId || !keySecret) {
    return NextResponse.json({ error: 'Payment service not configured' }, { status: 500 })
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

  // Create pending payment record for tracking
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

  // Use Razorpay Payment Links API to create a dynamic link
  // This properly sets amount, prefills customer details, and supports callback_url
  try {
    const authHeader = Buffer.from(`${keyId}:${keySecret}`).toString('base64')

    const email = profile.email || user.email || ''
    const phone = profile.phone || ''
    // Razorpay contact requires 10 digits, optionally with +91 prefix
    const contact = phone.startsWith('+91') ? phone : phone ? `+91${phone.replace(/^0/, '')}` : ''

    const body: Record<string, unknown> = {
      amount: Math.round(amountNum * 100), // paise
      currency: 'INR',
      accept_partial: false,
      description: type === 'membership'
        ? `SANDNCO Premium Membership — @${profile.username}`
        : `SANDNCO Wallet Deposit — @${profile.username}`,
      customer: {
        name: profile.username,
        ...(email ? { email } : {}),
        ...(contact ? { contact } : {}),
      },
      notify: {
        sms: false,
        email: false,
      },
      notes: {
        username: profile.username,
        payment_type: type,
        pending_id: pending.id,
        user_id: user.id,
      },
      callback_url: callbackUrl,
      callback_method: 'get',
      // Expire in 30 minutes
      expire_by: Math.floor(Date.now() / 1000) + 30 * 60,
    }

    const rzpRes = await fetch('https://api.razorpay.com/v1/payment_links/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${authHeader}`,
      },
      body: JSON.stringify(body),
    })

    if (!rzpRes.ok) {
      const errText = await rzpRes.text().catch(() => '')
      console.error('[razorpay-link] API error:', rzpRes.status, errText)
      // Fallback: return the static payment page URL with best-effort query params
      const params = new URLSearchParams({
        'prefill[name]': profile.username,
        ...(email ? { 'prefill[email]': email } : {}),
        ...(contact ? { 'prefill[contact]': contact } : {}),
        'notes[username]': profile.username,
      })
      const fallbackUrl = `https://rzp.io/rzp/w4Zfnen?${params.toString()}`
      return NextResponse.json({
        redirect_url: fallbackUrl,
        pending_id: pending.id,
        fallback: true,
      })
    }

    const rzpData = await rzpRes.json()
    const paymentLinkUrl: string = rzpData.short_url || rzpData.id

    // Store the payment link ID in the pending record for tracking
    await admin
      .from('pending_razorpay_payments')
      .update({ status: 'pending' })
      .eq('id', pending.id)
      .catch(() => {})

    return NextResponse.json({
      redirect_url: paymentLinkUrl,
      pending_id: pending.id,
      payment_link_id: rzpData.id,
    })
  } catch (err) {
    console.error('[razorpay-link] Unexpected error:', err)
    return NextResponse.json({ error: 'Failed to create payment link. Please try again.' }, { status: 500 })
  }
}
