import { NextRequest, NextResponse } from 'next/server'
import { createOrder } from '@/lib/razorpay'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { amount, type } = await req.json()

  if (!amount || amount < 10) {
    return NextResponse.json({ error: 'Minimum amount is ₹10' }, { status: 400 })
  }
  if (amount > 100000) {
    return NextResponse.json({ error: 'Maximum single transaction is ₹1,00,000' }, { status: 400 })
  }

  try {
    const order = await createOrder(amount, 'INR', {
      user_id: user.id,
      type: type || 'wallet_deposit',
    })
    return NextResponse.json({ order })
  } catch (err) {
    console.error('Razorpay order creation failed:', err)
    return NextResponse.json({ error: 'Payment gateway error' }, { status: 500 })
  }
}
