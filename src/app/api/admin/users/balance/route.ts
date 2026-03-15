import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient, createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: adminRole } = await supabase.from('admin_roles').select('role').eq('user_id', user.id).single()
  if (!adminRole || !['super_admin', 'platform_admin'].includes(adminRole.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const { userId, amount, reason } = await req.json()
  if (!userId || amount === undefined) {
    return NextResponse.json({ error: 'userId and amount required' }, { status: 400 })
  }

  const numAmount = Number(amount)
  if (isNaN(numAmount) || numAmount === 0) {
    return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
  }

  const admin = await createAdminClient()

  // Update wallet_balance on users table
  const { data: currentUser } = await admin.from('users').select('wallet_balance').eq('id', userId).single()
  if (!currentUser) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const newBalance = (currentUser.wallet_balance || 0) + numAmount

  const { error: updateErr } = await admin.from('users').update({ wallet_balance: newBalance }).eq('id', userId)
  if (updateErr) return NextResponse.json({ error: updateErr.message }, { status: 500 })

  // Also update wallets table if it exists
  await admin.from('wallets').update({ balance: newBalance }).eq('user_id', userId)

  // Log transaction
  await admin.from('transactions').insert({
    user_id: userId,
    type: numAmount > 0 ? 'bonus' : 'withdrawal',
    amount: Math.abs(numAmount),
    balance_before: currentUser.wallet_balance || 0,
    balance_after: newBalance,
    status: 'completed',
    description: reason || `Admin ${numAmount > 0 ? 'credit' : 'debit'} by ${user.email}`,
    metadata: { admin_action: true, admin_email: user.email },
  })

  return NextResponse.json({ success: true, newBalance })
}
