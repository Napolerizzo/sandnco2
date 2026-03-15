import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient, createClient } from '@/lib/supabase/server'

/**
 * POST /api/payments/upi
 * Create a new UPI payment with a unique amount (for auto-matching)
 */
export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { amount } = await req.json()
  const baseAmount = Number(amount)

  if (!baseAmount || baseAmount < 10 || baseAmount > 100000) {
    return NextResponse.json({ error: 'Amount must be between ₹10 and ₹1,00,000' }, { status: 400 })
  }

  const admin = await createAdminClient()

  // Generate unique amount by adding random paise (0.01-0.99)
  // Check that no other pending payment has the same unique amount
  let uniqueAmount: number
  let attempts = 0
  do {
    const paise = Math.floor(Math.random() * 99) + 1
    uniqueAmount = parseFloat((baseAmount + paise / 100).toFixed(2))
    const { data: existing } = await admin
      .from('upi_payments')
      .select('id')
      .eq('unique_amount', uniqueAmount)
      .in('status', ['pending', 'submitted'])
      .limit(1)
    if (!existing?.length) break
    attempts++
  } while (attempts < 20)

  if (attempts >= 20) {
    return NextResponse.json({ error: 'Too many pending payments. Try again shortly.' }, { status: 429 })
  }

  // Expire old pending payments for this user
  await admin.from('upi_payments')
    .update({ status: 'expired' })
    .eq('user_id', user.id)
    .eq('status', 'pending')
    .lt('expires_at', new Date().toISOString())

  // Create the UPI payment
  const { data: payment, error } = await admin.from('upi_payments').insert({
    user_id: user.id,
    amount: baseAmount,
    unique_amount: uniqueAmount,
    status: 'pending',
    expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
  }).select('id, unique_amount, expires_at').single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // UPI details — the admin's UPI ID from env
  const upiId = process.env.UPI_ID || 'admin@jio'

  return NextResponse.json({
    payment_id: payment.id,
    amount: baseAmount,
    unique_amount: payment.unique_amount,
    upi_id: upiId,
    expires_at: payment.expires_at,
    upi_link: `upi://pay?pa=${upiId}&pn=SANDNCO&am=${payment.unique_amount}&cu=INR&tn=SANDNCO+Wallet+Deposit`,
  })
}
