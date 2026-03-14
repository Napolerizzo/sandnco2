import { NextRequest, NextResponse } from 'next/server'
import { verifyWebhookSignature } from '@/lib/razorpay'
import { createAdminClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get('x-razorpay-signature') || ''

  if (!verifyWebhookSignature(body, signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const event = JSON.parse(body)
  const admin = await createAdminClient()

  if (event.event === 'payment.captured') {
    const payment = event.payload.payment.entity
    const notes = payment.notes || {}

    // Mark transaction as completed
    await admin.from('transactions')
      .update({ status: 'completed', razorpay_payment_id: payment.id })
      .eq('razorpay_order_id', payment.order_id)
  }

  if (event.event === 'payment.failed') {
    const payment = event.payload.payment.entity
    await admin.from('transactions')
      .update({ status: 'failed' })
      .eq('razorpay_order_id', payment.order_id)
  }

  return NextResponse.json({ received: true })
}
