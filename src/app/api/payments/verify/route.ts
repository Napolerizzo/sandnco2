import { NextRequest, NextResponse } from 'next/server'
import { verifyRazorpaySignature } from '@/lib/razorpay'
import { createAdminClient } from '@/lib/supabase/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

  const { orderId, paymentId, signature, type, amount } = await req.json()

  if (!verifyRazorpaySignature(orderId, paymentId, signature)) {
    return NextResponse.json({ success: false, error: 'Invalid payment signature' }, { status: 400 })
  }

  const admin = await createAdminClient()

  if (type === 'wallet_deposit') {
    // Get current balance
    const { data: wallet } = await admin.from('wallets').select('balance').eq('user_id', user.id).single()
    const currentBalance = wallet?.balance || 0
    const newBalance = currentBalance + amount

    // Update wallet
    await admin.from('wallets').upsert({
      user_id: user.id,
      balance: newBalance,
      total_deposited: (wallet as unknown as { total_deposited?: number })?.total_deposited ? (wallet as unknown as { total_deposited: number }).total_deposited + amount : amount,
    }, { onConflict: 'user_id' })

    // Also update user balance
    await admin.from('users').update({ wallet_balance: newBalance }).eq('id', user.id)

    // Record transaction
    await admin.from('transactions').insert({
      user_id: user.id,
      type: 'deposit',
      amount,
      balance_before: currentBalance,
      balance_after: newBalance,
      status: 'completed',
      description: `Wallet deposit via Razorpay`,
      razorpay_order_id: orderId,
      razorpay_payment_id: paymentId,
    })

    // Award XP for first deposit
    await admin.rpc('increment_xp', { user_id: user.id, amount: 20 }).catch(() => {})
  }

  if (type === 'membership') {
    const expiresAt = new Date()
    expiresAt.setMonth(expiresAt.getMonth() + 1)

    await admin.from('memberships').insert({
      user_id: user.id,
      plan: 'king',
      price: amount,
      currency: 'INR',
      expires_at: expiresAt.toISOString(),
      razorpay_payment_id: paymentId,
      is_active: true,
    })

    await admin.from('users').update({ is_premium: true, premium_expires_at: expiresAt.toISOString() }).eq('id', user.id)

    await admin.from('transactions').insert({
      user_id: user.id,
      type: 'membership',
      amount,
      balance_before: 0,
      balance_after: 0,
      status: 'completed',
      description: 'King Membership - 1 Month',
      razorpay_order_id: orderId,
      razorpay_payment_id: paymentId,
    })

    // Create notification
    await admin.from('notifications').insert({
      user_id: user.id,
      type: 'membership_update',
      title: '👑 Welcome to King Membership!',
      body: 'You now have access to exclusive challenges, special badges, and early features.',
    })
  }

  return NextResponse.json({ success: true })
}
