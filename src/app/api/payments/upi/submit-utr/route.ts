import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient, createClient } from '@/lib/supabase/server'

/**
 * POST /api/payments/upi/submit-utr
 * User submits their UTR number after making the UPI payment
 */
export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { payment_id, utr_number } = await req.json()
  if (!payment_id || !utr_number) {
    return NextResponse.json({ error: 'payment_id and utr_number required' }, { status: 400 })
  }

  // Validate UTR format (12-digit number typically)
  const utrClean = utr_number.toString().trim()
  if (utrClean.length < 10 || utrClean.length > 22) {
    return NextResponse.json({ error: 'Invalid UTR number format' }, { status: 400 })
  }

  const admin = await createAdminClient()

  // Verify the payment belongs to this user and is pending
  const { data: payment } = await admin
    .from('upi_payments')
    .select('id, user_id, status')
    .eq('id', payment_id)
    .eq('user_id', user.id)
    .single()

  if (!payment) return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
  if (payment.status !== 'pending') {
    return NextResponse.json({ error: `Payment already ${payment.status}` }, { status: 400 })
  }

  // Update payment with UTR
  await admin.from('upi_payments').update({
    utr_number: utrClean,
    status: 'submitted',
  }).eq('id', payment_id)

  return NextResponse.json({ success: true, status: 'submitted' })
}
