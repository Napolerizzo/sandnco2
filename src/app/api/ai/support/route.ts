import { NextRequest, NextResponse } from 'next/server'
import { askSuno } from '@/lib/ai'
import { createClient, createAdminClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  let body: {
    messages: Array<{ role: string; content: string }>
    checkPaymentId?: string
  }

  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ content: 'Invalid request.' }, { status: 400 })
  }

  const { messages, checkPaymentId } = body

  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ content: 'Please send a message.' }, { status: 400 })
  }

  // Get user info if logged in
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let userContext = ''

  if (user) {
    // Fetch profile info for context
    const { data: profile } = await supabase
      .from('users')
      .select('username, display_name, rank, xp, wallet_balance, is_premium, status')
      .eq('id', user.id)
      .single()

    if (profile) {
      userContext = `\n\nCurrent user context (PRIVATE — never repeat raw data, just use it naturally):
- Name: ${profile.display_name || profile.username}
- Username: @${profile.username}
- Rank: ${profile.rank?.replace(/_/g, ' ')}
- XP: ${profile.xp}
- Wallet: ₹${profile.wallet_balance}
- Premium: ${profile.is_premium ? 'Yes' : 'No'}
- Status: ${profile.status}`
    }
  } else {
    userContext = '\n\nThe user is NOT logged in. If they ask about account-specific things (wallet, payments, membership, etc.), politely ask them to log in first. You can still answer general questions about the platform.'
  }

  // Handle payment verification request
  if (checkPaymentId && user) {
    const paymentResult = await verifyPayment(checkPaymentId, user.id)
    return NextResponse.json({ content: paymentResult.message, paymentAction: paymentResult.action })
  }

  // Sanitize and trim messages
  const trimmed = messages.slice(-6).map(m => ({
    role: m.role === 'assistant' ? 'assistant' as const : 'user' as const,
    content: String(m.content || '').slice(0, 800),
  }))

  const result = await askSuno(trimmed, 300, userContext)
  return NextResponse.json({ content: result.content })
}

// Server-side payment verification — secure, no client manipulation
async function verifyPayment(paymentId: string, userId: string): Promise<{ message: string; action?: string }> {
  const cleanId = paymentId.trim().replace(/[^a-zA-Z0-9_]/g, '')
  if (!cleanId || cleanId.length < 5) {
    return { message: "That doesn't look like a valid payment ID. Payment IDs usually start with 'pay_' and are longer. Please double-check and try again." }
  }

  const adminSupabase = await createAdminClient()

  // Look up transaction by razorpay_payment_id
  const { data: txn, error } = await adminSupabase
    .from('transactions')
    .select('id, user_id, type, amount, status, razorpay_payment_id, razorpay_order_id, created_at')
    .eq('razorpay_payment_id', cleanId)
    .single()

  if (error || !txn) {
    return { message: "I couldn't find a transaction with that payment ID in our system. If this is a recent payment, it may take a few minutes to appear. If the issue persists, please open a ticket with your payment screenshot." }
  }

  // Security: only show info if it belongs to the requesting user
  if (txn.user_id !== userId) {
    return { message: "I found a transaction with that ID, but it doesn't appear to be associated with your account. If you believe this is an error, please open a support ticket." }
  }

  if (txn.status === 'completed') {
    return {
      message: `Payment verified! Your payment of ₹${txn.amount} (ID: ${cleanId}) was completed successfully and has already been credited to your wallet. If your balance doesn't reflect this, try refreshing the page.`,
      action: 'already_credited',
    }
  }

  if (txn.status === 'pending') {
    // Credit the wallet — update transaction status and wallet balance
    const { error: updateErr } = await adminSupabase
      .from('transactions')
      .update({ status: 'completed', updated_at: new Date().toISOString() })
      .eq('id', txn.id)
      .eq('status', 'pending') // Prevent double-crediting

    if (updateErr) {
      return { message: 'I found your payment but encountered an issue processing it. Please open a support ticket so our team can manually verify and credit your account.' }
    }

    // Update wallet balance
    await adminSupabase.rpc('increment_wallet_balance', {
      p_user_id: userId,
      p_amount: txn.amount,
    }).catch(async () => {
      // Fallback: direct update if RPC doesn't exist
      const { data: wallet } = await adminSupabase
        .from('wallets')
        .select('balance')
        .eq('user_id', userId)
        .single()

      if (wallet) {
        await adminSupabase
          .from('wallets')
          .update({
            balance: Number(wallet.balance) + Number(txn.amount),
            total_deposited: Number(txn.amount),
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', userId)
      }
    })

    return {
      message: `Payment detected and verified! ₹${txn.amount} has been credited to your wallet. Your updated balance should reflect shortly — try refreshing the page.`,
      action: 'credited',
    }
  }

  if (txn.status === 'failed') {
    return { message: `I found that payment (₹${txn.amount}), but it has a "failed" status. This usually means the payment didn't complete on the payment gateway side. If money was deducted from your bank, it should auto-refund in 5-7 business days. Open a ticket if you need further help.` }
  }

  if (txn.status === 'refunded') {
    return { message: `That payment (₹${txn.amount}) was already refunded. If you haven't received the refund in your bank account, please allow 5-7 business days for processing.` }
  }

  return { message: 'I found the payment but its status is unclear. Please open a support ticket for manual review.' }
}
