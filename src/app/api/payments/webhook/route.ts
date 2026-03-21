import { NextRequest, NextResponse } from 'next/server'
import { verifyWebhookSignature } from '@/lib/razorpay'
import { createAdminClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get('x-razorpay-signature') || ''

  // Always store the raw payload regardless of signature validity
  const admin = await createAdminClient()

  if (!verifyWebhookSignature(body, signature)) {
    // Still log the invalid attempt for audit
    await admin.from('razorpay_webhook_events').insert({
      event_type: 'invalid_signature',
      raw_payload: JSON.parse(body || '{}'),
      status: 'failed',
    }).catch(() => {})
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  let event: Record<string, unknown>
  try {
    event = JSON.parse(body)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const eventType = event.event as string
  const payload = event.payload as Record<string, unknown>

  // ── payment.captured ─────────────────────────────────────────
  if (eventType === 'payment.captured') {
    const payment = (payload?.payment as Record<string, unknown>)?.entity as Record<string, unknown>
    const notes = (payment?.notes || {}) as Record<string, string>
    const username = notes.username || ''
    const email = payment?.email as string || ''
    const contact = payment?.contact as string || ''
    const amountPaise = Number(payment?.amount || 0)
    const amountInr = amountPaise / 100
    const paymentId = payment?.id as string || ''
    const orderId = payment?.order_id as string || ''
    const paymentType = notes.payment_type || 'wallet_deposit'

    // Look up user by username (primary) → email (fallback) → contact/phone (last resort)
    let userId: string | null = null
    let resolvedUsername = username

    if (username) {
      const { data: userRow } = await admin
        .from('users')
        .select('id, username')
        .eq('username', username)
        .single()
      userId = userRow?.id || null
    }

    if (!userId && email) {
      // Fallback: match by email in case notes didn't come through
      const { data: userRow } = await admin
        .from('users')
        .select('id, username')
        .eq('email', email)
        .single()
      if (userRow) {
        userId = userRow.id
        resolvedUsername = userRow.username || username
      }
    }

    if (!userId && contact) {
      // Last resort: match by phone number (strip +91 prefix if present)
      const barePhone = contact.replace(/^\+91/, '').replace(/\D/g, '')
      const { data: userRow } = await admin
        .from('users')
        .select('id, username')
        .or(`phone.eq.${contact},phone.eq.${barePhone},phone.eq.+91${barePhone}`)
        .single()
      if (userRow) {
        userId = userRow.id
        resolvedUsername = userRow.username || username
      }
    }

    // Check for duplicate — don't double-credit
    const { data: existing } = await admin
      .from('razorpay_webhook_events')
      .select('id, credited')
      .eq('razorpay_payment_id', paymentId)
      .maybeSingle()

    if (existing?.credited) {
      // Already credited — store as duplicate, return 200
      await admin.from('razorpay_webhook_events').insert({
        event_type: eventType,
        razorpay_payment_id: paymentId,
        razorpay_order_id: orderId,
        username: resolvedUsername,
        email,
        contact,
        amount: amountInr,
        status: 'duplicate',
        credited: false,
        user_id: userId,
        raw_payload: event,
      })
      return NextResponse.json({ received: true, note: 'duplicate' })
    }

    let credited = false

    // Credit wallet if user found and amount > 0
    if (userId && amountInr > 0) {
      try {
        if (paymentType === 'membership') {
          const expiresAt = new Date()
          expiresAt.setMonth(expiresAt.getMonth() + 1)

          await admin.from('memberships').upsert({
            user_id: userId,
            plan: 'king',
            price: amountInr,
            currency: 'INR',
            expires_at: expiresAt.toISOString(),
            razorpay_payment_id: paymentId,
            is_active: true,
          }, { onConflict: 'user_id' })

          await admin.from('users').update({
            is_premium: true,
            premium_expires_at: expiresAt.toISOString(),
          }).eq('id', userId)

          await admin.from('transactions').insert({
            user_id: userId,
            type: 'membership',
            amount: amountInr,
            balance_before: 0,
            balance_after: 0,
            status: 'completed',
            description: `King Membership via Razorpay — @${resolvedUsername}`,
            razorpay_payment_id: paymentId,
            razorpay_order_id: orderId,
          })

          await admin.from('notifications').insert({
            user_id: userId,
            type: 'membership_update',
            title: '👑 King Membership activated!',
            body: 'Your payment was received. Welcome to the inner circle.',
          })
        } else {
          // wallet_deposit
          const { data: wallet } = await admin
            .from('wallets')
            .select('balance, total_deposited')
            .eq('user_id', userId)
            .single()

          const currentBalance = wallet?.balance || 0
          const newBalance = currentBalance + amountInr
          const totalDeposited = (wallet?.total_deposited || 0) + amountInr

          await admin.from('wallets').upsert({
            user_id: userId,
            balance: newBalance,
            total_deposited: totalDeposited,
          }, { onConflict: 'user_id' })

          await admin.from('users').update({ wallet_balance: newBalance }).eq('id', userId)

          await admin.from('transactions').insert({
            user_id: userId,
            type: 'deposit',
            amount: amountInr,
            balance_before: currentBalance,
            balance_after: newBalance,
            status: 'completed',
            description: `Wallet deposit via Razorpay — @${resolvedUsername}`,
            razorpay_payment_id: paymentId,
            razorpay_order_id: orderId,
          })

          // Award XP for first deposit
          const { count } = await admin
            .from('transactions')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('type', 'deposit')
            .eq('status', 'completed')
          if ((count || 0) <= 1) {
            await admin.rpc('increment_xp', { user_id: userId, amount: 20 }).catch(() => {})
          }

          await admin.from('notifications').insert({
            user_id: userId,
            type: 'wallet_update',
            title: '💰 Wallet topped up!',
            body: `₹${amountInr} has been added to your wallet.`,
          })
        }

        // Mark pending payment as completed
        await admin
          .from('pending_razorpay_payments')
          .update({ status: 'completed' })
          .eq('username', resolvedUsername)
          .eq('status', 'pending')

        credited = true
      } catch (err) {
        console.error('Error crediting wallet from webhook:', err)
      }
    }

    // Store webhook event
    await admin.from('razorpay_webhook_events').insert({
      event_type: eventType,
      razorpay_payment_id: paymentId,
      razorpay_order_id: orderId,
      username: resolvedUsername,
      email,
      contact,
      amount: amountInr,
      status: credited ? 'credited' : (userId ? 'received' : 'unmatched'),
      credited,
      user_id: userId,
      raw_payload: event,
    })

    // Also update old-style transactions table by order_id if present
    if (orderId) {
      await admin.from('transactions')
        .update({ status: 'completed', razorpay_payment_id: paymentId })
        .eq('razorpay_order_id', orderId)
        .eq('status', 'pending')
    }
  }

  // ── payment.failed ────────────────────────────────────────────
  if (eventType === 'payment.failed') {
    const payment = (payload?.payment as Record<string, unknown>)?.entity as Record<string, unknown>
    const notes = (payment?.notes || {}) as Record<string, string>
    const username = notes.username || ''
    const paymentId = payment?.id as string || ''
    const orderId = payment?.order_id as string || ''

    await admin.from('razorpay_webhook_events').insert({
      event_type: eventType,
      razorpay_payment_id: paymentId,
      razorpay_order_id: orderId,
      username,
      amount: Number(payment?.amount || 0) / 100,
      status: 'failed',
      credited: false,
      raw_payload: event,
    })

    if (orderId) {
      await admin.from('transactions')
        .update({ status: 'failed' })
        .eq('razorpay_order_id', orderId)
    }
  }

  // ── all other events ──────────────────────────────────────────
  if (!['payment.captured', 'payment.failed'].includes(eventType)) {
    await admin.from('razorpay_webhook_events').insert({
      event_type: eventType,
      raw_payload: event,
      status: 'received',
    }).catch(() => {})
  }

  // Always return 200 — Razorpay retries on non-200
  return NextResponse.json({ received: true })
}
