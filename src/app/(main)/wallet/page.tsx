import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import WalletClient from '@/components/wallet/WalletClient'

export const metadata = { title: 'Wallet' }

export default async function WalletPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?next=/wallet')

  const [{ data: wallet }, { data: transactions }, { data: membership }] = await Promise.all([
    supabase.from('wallets').select('*').eq('user_id', user.id).single(),
    supabase.from('transactions').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(20),
    supabase.from('memberships').select('*').eq('user_id', user.id).eq('is_active', true).single(),
  ])

  return <WalletClient wallet={wallet} transactions={transactions || []} membership={membership} userId={user.id} />
}
