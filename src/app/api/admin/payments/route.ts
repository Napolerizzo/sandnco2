import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient, createClient } from '@/lib/supabase/server'

async function verifyPaymentAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data: role } = await supabase.from('admin_roles').select('role').eq('user_id', user.id).single()
  if (!role || !['super_admin', 'platform_admin'].includes(role.role)) return null
  return user
}

/**
 * GET /api/admin/payments
 * List UPI payments for admin review
 */
export async function GET(req: NextRequest) {
  const user = await verifyPaymentAdmin()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status') || 'submitted'

  const admin = await createAdminClient()
  const { data: payments } = await admin
    .from('upi_payments')
    .select('id, user_id, amount, unique_amount, utr_number, status, verified_by, created_at, expires_at, users(username, display_name, email)')
    .eq('status', status)
    .order('created_at', { ascending: false })
    .limit(50)

  return NextResponse.json({ payments: payments || [] })
}

/**
 * POST /api/admin/payments
 * Approve or reject a UPI payment manually
 */
export async function POST(req: NextRequest) {
  const user = await verifyPaymentAdmin()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

  const { paymentId, action } = await req.json()
  if (!paymentId || !['approve', 'reject'].includes(action)) {
    return NextResponse.json({ error: 'paymentId and action (approve/reject) required' }, { status: 400 })
  }

  const admin = await createAdminClient()

  const { data: payment } = await admin
    .from('upi_payments')
    .select('id, user_id, amount, unique_amount, status')
    .eq('id', paymentId)
    .single()

  if (!payment) return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
  if (payment.status === 'verified') return NextResponse.json({ error: 'Already verified' }, { status: 400 })

  if (action === 'reject') {
    await admin.from('upi_payments').update({ status: 'failed', verified_by: 'admin' }).eq('id', paymentId)
    await admin.from('notifications').insert({
      user_id: payment.user_id,
      type: 'wallet_update',
      title: 'Payment Rejected',
      body: `Your UPI payment of ₹${payment.amount} could not be verified. Please contact support if this is an error.`,
    })
    return NextResponse.json({ success: true })
  }

  // Approve — credit wallet
  const { data: userData } = await admin.from('users').select('wallet_balance').eq('id', payment.user_id).single()
  const currentBalance = userData?.wallet_balance || 0
  const baseAmount = Number(payment.amount)
  const newBalance = currentBalance + baseAmount

  await admin.from('users').update({ wallet_balance: newBalance }).eq('id', payment.user_id)
  await admin.from('wallets').update({ balance: newBalance }).eq('user_id', payment.user_id)

  const { data: tx } = await admin.from('transactions').insert({
    user_id: payment.user_id,
    type: 'deposit',
    amount: baseAmount,
    balance_before: currentBalance,
    balance_after: newBalance,
    status: 'completed',
    description: 'UPI deposit (admin approved)',
    metadata: { upi_payment_id: payment.id, verified_by: 'admin' },
  }).select('id').single()

  await admin.from('upi_payments').update({
    status: 'verified',
    verified_by: 'admin',
    transaction_id: tx?.id,
  }).eq('id', paymentId)

  await admin.from('notifications').insert({
    user_id: payment.user_id,
    type: 'wallet_update',
    title: 'Payment Received',
    body: `₹${baseAmount} has been added to your wallet.`,
  })

  return NextResponse.json({ success: true, amount_credited: baseAmount })
}
