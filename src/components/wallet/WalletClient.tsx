'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap, ArrowUpRight, ArrowDownLeft, Crown, Clock, CheckCircle, XCircle, Loader, TrendingUp, Trophy, Gift } from 'lucide-react'
import { formatCurrency, formatRelativeTime } from '@/lib/utils'
import { loadRazorpayScript } from '@/lib/razorpay'
import toast from 'react-hot-toast'

interface Wallet {
  balance: number
  locked_balance: number
  total_deposited: number
  total_withdrawn: number
  total_won: number
}

interface Transaction {
  id: string
  type: string
  amount: number
  status: string
  description: string
  created_at: string
}

interface Membership {
  plan: string
  expires_at: string
  is_active: boolean
}

const DEPOSIT_AMOUNTS = [100, 200, 500, 1000, 2000, 5000]
const MEMBERSHIP_PRICE = 299

const TX_ICONS: Record<string, { icon: typeof Zap; color: string }> = {
  deposit: { icon: ArrowDownLeft, color: '#22c55e' },
  withdrawal: { icon: ArrowUpRight, color: '#f97316' },
  challenge_entry: { icon: Trophy, color: '#f59e0b' },
  challenge_win: { icon: Trophy, color: '#a855f7' },
  membership: { icon: Crown, color: '#fbbf24' },
  refund: { icon: ArrowDownLeft, color: '#06b6d4' },
  bonus: { icon: Gift, color: '#ec4899' },
}

export default function WalletClient({
  wallet,
  transactions,
  membership,
  userId,
}: {
  wallet: Wallet | null
  transactions: Transaction[]
  membership: Membership | null
  userId: string
}) {
  const [depositAmount, setDepositAmount] = useState(0)
  const [customAmount, setCustomAmount] = useState('')
  const [depositing, setDepositing] = useState(false)
  const [upgrading, setUpgrading] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'deposit' | 'history'>('overview')

  const balance = wallet?.balance || 0

  const handleDeposit = async (amount: number) => {
    if (amount < 10) { toast.error('Minimum deposit: ₹10'); return }
    setDepositing(true)

    const loaded = await loadRazorpayScript()
    if (!loaded) { toast.error('Payment gateway failed to load'); setDepositing(false); return }

    const orderRes = await fetch('/api/payments/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, type: 'wallet_deposit' }),
    })
    const { order, error } = await orderRes.json()
    if (error) { toast.error(error); setDepositing(false); return }

    const win = window as unknown as Record<string, unknown>
    const Razorpay = win.Razorpay as new (opts: Record<string, unknown>) => { open: () => void }

    const rzp = new Razorpay({
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      order_id: order.id,
      amount: order.amount,
      currency: 'INR',
      name: 'King of Good Times',
      description: 'Wallet Deposit',
      theme: { color: '#fbbf24' },
      handler: async (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
        const verifyRes = await fetch('/api/payments/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId: response.razorpay_order_id,
            paymentId: response.razorpay_payment_id,
            signature: response.razorpay_signature,
            type: 'wallet_deposit',
            amount,
          }),
        })
        const result = await verifyRes.json()
        if (result.success) {
          toast.success(`₹${amount} added to your wallet! 🔥`)
          setTimeout(() => window.location.reload(), 1500)
        } else {
          toast.error('Payment verification failed. Contact support.')
        }
        setDepositing(false)
      },
      modal: { ondismiss: () => setDepositing(false) },
    })
    rzp.open()
  }

  const handleMembership = async () => {
    setUpgrading(true)
    const loaded = await loadRazorpayScript()
    if (!loaded) { toast.error('Payment gateway failed'); setUpgrading(false); return }

    const orderRes = await fetch('/api/payments/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: MEMBERSHIP_PRICE, type: 'membership' }),
    })
    const { order, error } = await orderRes.json()
    if (error) { toast.error(error); setUpgrading(false); return }

    const win = window as unknown as Record<string, unknown>
    const Razorpay = win.Razorpay as new (opts: Record<string, unknown>) => { open: () => void }

    const rzp = new Razorpay({
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      order_id: order.id,
      amount: order.amount,
      currency: 'INR',
      name: 'King of Good Times',
      description: 'Premium Membership',
      theme: { color: '#fbbf24' },
      handler: async (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
        const verifyRes = await fetch('/api/payments/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...response, type: 'membership', amount: MEMBERSHIP_PRICE }),
        })
        const result = await verifyRes.json()
        if (result.success) {
          toast.success('Welcome to Premium, King! 👑')
          setTimeout(() => window.location.reload(), 1500)
        } else {
          toast.error('Payment failed. Contact support.')
        }
        setUpgrading(false)
      },
      modal: { ondismiss: () => setUpgrading(false) },
    })
    rzp.open()
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="font-display text-4xl text-gradient-gold" style={{ fontFamily: "'Bebas Neue', cursive" }}>
          YOUR VAULT
        </h1>
        <p className="text-zinc-500 font-mono text-xs mt-1">Secure. Swift. Sovereign.</p>
      </div>

      {/* Balance card */}
      <motion.div
        className="glass-gold rounded-2xl p-8 mb-6 relative overflow-hidden"
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(251,191,36,0.08),transparent_60%)] pointer-events-none" />
        <div className="relative">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-tech text-xs text-zinc-500 tracking-widest uppercase mb-2">Available Balance</p>
              <p className="font-display text-5xl text-gradient-gold" style={{ fontFamily: "'Bebas Neue', cursive" }}>
                {formatCurrency(balance)}
              </p>
              {wallet?.locked_balance && wallet.locked_balance > 0 && (
                <p className="font-mono text-xs text-zinc-500 mt-2">
                  + {formatCurrency(wallet.locked_balance)} locked in challenges
                </p>
              )}
            </div>
            <div className="text-right space-y-2">
              <div>
                <p className="font-tech text-xs text-zinc-600 tracking-wider">TOTAL DEPOSITED</p>
                <p className="font-tech text-sm text-zinc-400">{formatCurrency(wallet?.total_deposited || 0)}</p>
              </div>
              <div>
                <p className="font-tech text-xs text-zinc-600 tracking-wider">TOTAL WON</p>
                <p className="font-tech text-sm text-purple-400">{formatCurrency(wallet?.total_won || 0)}</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {(['overview', 'deposit', 'history'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl text-xs font-tech tracking-wider uppercase transition-all ${
              activeTab === tab ? 'bg-yellow-400 text-black font-bold' : 'bg-white/5 text-zinc-400 hover:bg-white/10'
            }`}>
            {tab}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {/* Premium membership */}
            <div className={`rounded-2xl p-6 mb-5 border ${membership?.is_active ? 'bg-yellow-400/5 border-yellow-400/20' : 'bg-white/3 border-white/5'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Crown className={`w-6 h-6 ${membership?.is_active ? 'text-yellow-400 crown-animate' : 'text-zinc-500'}`} />
                  <div>
                    <h3 className="font-tech text-sm font-bold text-white">King Membership</h3>
                    <p className="font-mono text-xs text-zinc-500 mt-0.5">
                      {membership?.is_active
                        ? `Active until ${new Date(membership.expires_at).toLocaleDateString('en-IN')}`
                        : 'Unlock exclusive challenges, badges & early access'}
                    </p>
                  </div>
                </div>
                {!membership?.is_active && (
                  <motion.button
                    onClick={handleMembership}
                    disabled={upgrading}
                    className="btn-primary px-5 py-2 rounded-xl text-xs flex items-center gap-2 disabled:opacity-50"
                    whileTap={{ scale: 0.95 }}
                  >
                    {upgrading ? <Loader className="w-3.5 h-3.5 animate-spin" /> : <Crown className="w-3.5 h-3.5" />}
                    ₹{MEMBERSHIP_PRICE}/month
                  </motion.button>
                )}
              </div>
            </div>

            {/* Quick deposit */}
            <div className="glass rounded-2xl p-5">
              <h3 className="font-tech text-xs text-zinc-400 tracking-widest uppercase mb-4">Quick Deposit</h3>
              <div className="grid grid-cols-3 gap-3 mb-4">
                {DEPOSIT_AMOUNTS.map(amt => (
                  <motion.button
                    key={amt}
                    onClick={() => handleDeposit(amt)}
                    disabled={depositing}
                    className="py-3 rounded-xl bg-white/5 hover:bg-yellow-400/10 hover:border-yellow-400/30 border border-white/5 text-xs font-tech transition-all disabled:opacity-50"
                    whileTap={{ scale: 0.95 }}
                  >
                    ₹{amt}
                  </motion.button>
                ))}
              </div>
              <button onClick={() => setActiveTab('deposit')} className="btn-ghost w-full py-2 rounded-xl text-xs font-mono">
                Custom amount →
              </button>
            </div>
          </motion.div>
        )}

        {activeTab === 'deposit' && (
          <motion.div key="deposit" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="glass-gold rounded-2xl p-6">
              <h3 className="font-tech text-xs text-yellow-400 tracking-widest uppercase mb-4">Deposit Funds</h3>
              <div className="space-y-4">
                <div>
                  <label className="font-tech text-xs text-zinc-400 tracking-wider block mb-2">Amount (₹)</label>
                  <input
                    type="number"
                    value={customAmount}
                    onChange={e => setCustomAmount(e.target.value)}
                    placeholder="Enter amount (min ₹10)"
                    min={10}
                    max={100000}
                    className="input-cyber w-full rounded-xl px-4 py-3 text-lg font-tech"
                  />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {DEPOSIT_AMOUNTS.map(amt => (
                    <button key={amt} onClick={() => setCustomAmount(amt.toString())}
                      className={`py-2 rounded-lg text-xs font-mono transition-all ${customAmount === amt.toString() ? 'bg-yellow-400 text-black' : 'bg-white/5 text-zinc-400 hover:bg-white/10'}`}>
                      ₹{amt}
                    </button>
                  ))}
                </div>
                <motion.button
                  onClick={() => handleDeposit(parseFloat(customAmount) || 0)}
                  disabled={depositing || !customAmount || parseFloat(customAmount) < 10}
                  className="btn-primary w-full py-4 rounded-xl text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                  whileTap={{ scale: 0.98 }}
                >
                  {depositing ? (
                    <><Loader className="w-4 h-4 animate-spin" />PROCESSING...</>
                  ) : (
                    <><Zap className="w-4 h-4" />DEPOSIT ₹{customAmount || '0'}</>
                  )}
                </motion.button>
                <p className="text-center text-zinc-600 font-mono text-xs">
                  Powered by Razorpay • 256-bit SSL encrypted
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'history' && (
          <motion.div key="history" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="space-y-3">
              {transactions.length === 0 && (
                <div className="text-center py-12 text-zinc-600 font-mono">
                  <TrendingUp className="w-8 h-8 mx-auto mb-3 opacity-20" />
                  <p>No transactions yet.</p>
                </div>
              )}
              {transactions.map((tx, i) => {
                const txConfig = TX_ICONS[tx.type] || TX_ICONS.deposit
                const TxIcon = txConfig.icon
                const isCredit = ['deposit', 'challenge_win', 'refund', 'bonus'].includes(tx.type)

                return (
                  <motion.div key={tx.id} className="card-dark flex items-center gap-4 p-4"
                    initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}>
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                      style={{ background: `${txConfig.color}20`, border: `1px solid ${txConfig.color}30` }}>
                      <TxIcon className="w-4 h-4" style={{ color: txConfig.color }} />
                    </div>
                    <div className="flex-1">
                      <p className="font-mono text-sm text-white">{tx.description || tx.type.replace('_', ' ')}</p>
                      <p className="font-mono text-xs text-zinc-500">{formatRelativeTime(tx.created_at)}</p>
                    </div>
                    <div className="text-right">
                      <p className={`font-tech text-sm font-bold ${isCredit ? 'text-green-400' : 'text-red-400'}`}>
                        {isCredit ? '+' : '-'}{formatCurrency(Math.abs(tx.amount))}
                      </p>
                      <span className={`text-xs font-mono ${
                        tx.status === 'completed' ? 'text-green-400' :
                        tx.status === 'pending' ? 'text-yellow-400' : 'text-red-400'
                      }`}>
                        {tx.status}
                      </span>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
