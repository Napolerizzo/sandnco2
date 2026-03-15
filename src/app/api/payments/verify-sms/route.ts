import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

/**
 * POST /api/payments/verify-sms
 *
 * Called by iOS Shortcut when bank SMS/notification is received.
 * Matches the amount against pending UPI payments and auto-verifies.
 *
 * iOS Shortcut URL: https://yourdomain.com/api/payments/verify-sms
 *
 * Body: { secret, amount, reference?, raw_text? }
 */
export async function POST(req: NextRequest) {
  const { secret, amount, reference, raw_text } = await req.json()

  // Verify secret key to prevent unauthorized access
  const VERIFY_SECRET = process.env.PAYMENT_VERIFY_SECRET
  if (!VERIFY_SECRET || secret !== VERIFY_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!amount || isNaN(Number(amount))) {
    return NextResponse.json({ error: 'Valid amount required' }, { status: 400 })
  }

  const numAmount = parseFloat(Number(amount).toFixed(2))
  const admin = await createAdminClient()

  // Find pending UPI payment matching the unique amount (within 30min window)
  const { data: payments } = await admin
    .from('upi_payments')
    .select('id, user_id, amount, unique_amount')
    .eq('status', 'pending')
    .eq('unique_amount', numAmount)
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: true })
    .limit(1)

  // Also check submitted payments (user already submitted UTR)
  let payment = payments?.[0]
  if (!payment) {
    const { data: submitted } = await admin
      .from('upi_payments')
      .select('id, user_id, amount, unique_amount')
      .eq('status', 'submitted')
      .eq('unique_amount', numAmount)
      .order('created_at', { ascending: true })
      .limit(1)
    payment = submitted?.[0]
  }

  if (!payment) {
    // No match — log for admin review
    console.log(`[verify-sms] No match for amount ₹${numAmount}. Ref: ${reference}`)
    return NextResponse.json({
      matched: false,
      message: `No pending payment found for ₹${numAmount}`,
    })
  }

  // Get current wallet balance
  const { data: userData } = await admin
    .from('users')
    .select('wallet_balance')
    .eq('id', payment.user_id)
    .single()

  const currentBalance = userData?.wallet_balance || 0
  const baseAmount = Number(payment.amount)
  const newBalance = currentBalance + baseAmount

  // Credit the wallet
  await admin.from('users').update({ wallet_balance: newBalance }).eq('id', payment.user_id)
  await admin.from('wallets').update({
    balance: newBalance,
    total_deposited: (await admin.from('wallets').select('total_deposited').eq('user_id', payment.user_id).single()).data?.total_deposited + baseAmount || baseAmount,
  }).eq('user_id', payment.user_id)

  // Create transaction record
  const { data: tx } = await admin.from('transactions').insert({
    user_id: payment.user_id,
    type: 'deposit',
    amount: baseAmount,
    balance_before: currentBalance,
    balance_after: newBalance,
    status: 'completed',
    description: 'UPI deposit (auto-verified)',
    reference_id: reference || null,
    metadata: { upi_payment_id: payment.id, verified_by: 'auto_sms', raw_text: raw_text?.substring(0, 500) },
  }).select('id').single()

  // Mark UPI payment as verified
  await admin.from('upi_payments').update({
    status: 'verified',
    verified_by: 'auto_sms',
    sms_raw_text: raw_text?.substring(0, 500),
    utr_number: reference || null,
    transaction_id: tx?.id,
  }).eq('id', payment.id)

  // Notify user
  await admin.from('notifications').insert({
    user_id: payment.user_id,
    type: 'wallet_update',
    title: 'Payment Received',
    body: `₹${baseAmount} has been added to your wallet.`,
    data: { amount: baseAmount, transaction_id: tx?.id },
  })

  return NextResponse.json({
    matched: true,
    payment_id: payment.id,
    user_id: payment.user_id,
    amount_credited: baseAmount,
    new_balance: newBalance,
  })
}

/**
 * GET /api/payments/verify-sms
 * Health check for the iOS Shortcut to verify the endpoint is reachable
 */
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    endpoint: 'verify-sms',
    message: 'Payment verification endpoint is active',
  })
}
