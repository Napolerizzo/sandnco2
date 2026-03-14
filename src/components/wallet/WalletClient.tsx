'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Zap, ArrowUpRight, ArrowDownLeft, Crown, Clock, Loader,
  TrendingUp, Trophy, Gift, Terminal, Shield, Lock, Activity
} from 'lucide-react'
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
  deposit: { icon: ArrowDownLeft, color: 'var(--green)' },
  withdrawal: { icon: ArrowUpRight, color: '#f97316' },
  challenge_entry: { icon: Trophy, color: '#fbbf24' },
  challenge_win: { icon: Trophy, color: '#a855f7' },
  membership: { icon: Crown, color: '#fbbf24' },
  refund: { icon: ArrowDownLeft, color: 'var(--cyan)' },
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
    if (amount < 10) { toast.error('MINIMUM_DEPOSIT: ₹10'); return }
    setDepositing(true)

    const loaded = await loadRazorpayScript()
    if (!loaded) { toast.error('PAYMENT_GATEWAY_ERROR'); setDepositing(false); return }

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
      theme: { color: '#00fff5' },
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
          toast.success(`DEPOSIT_CONFIRMED: ₹${amount}`)
          setTimeout(() => window.location.reload(), 1500)
        } else {
          toast.error('VERIFICATION_FAILED. CONTACT_SUPPORT.')
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
    if (!loaded) { toast.error('PAYMENT_GATEWAY_ERROR'); setUpgrading(false); return }

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
      theme: { color: '#00fff5' },
      handler: async (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
        const verifyRes = await fetch('/api/payments/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...response, type: 'membership', amount: MEMBERSHIP_PRICE }),
        })
        const result = await verifyRes.json()
        if (result.success) {
          toast.success('PREMIUM_ACTIVATED. WELCOME_KING.')
          setTimeout(() => window.location.reload(), 1500)
        } else {
          toast.error('PAYMENT_FAILED. CONTACT_SUPPORT.')
        }
        setUpgrading(false)
      },
      modal: { ondismiss: () => setUpgrading(false) },
    })
    rzp.open()
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <div className="text-[9px] text-[var(--text-dim)] tracking-[0.3em] uppercase mb-1">
          // SECURE_VAULT
        </div>
        <h1 className="text-2xl font-extrabold text-glow-cyan uppercase tracking-wider">
          YOUR_VAULT
        </h1>
        <p className="text-[10px] text-[var(--text-dim)] mt-1 tracking-wider">SECURE. SWIFT. SOVEREIGN.</p>
      </div>

      {/* Balance card */}
      <div className="terminal mb-6">
        <div className="terminal-header">
          <div className="terminal-dots"><span /><span /><span /></div>
          <div className="terminal-title">
            <Zap className="w-3 h-3" /> VAULT_STATUS
          </div>
        </div>
        <div className="terminal-body">
          <motion.div
            className="flex items-start justify-between"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          >
            <div>
              <p className="text-[9px] text-[var(--text-dim)] tracking-[0.2em] uppercase mb-2">AVAILABLE_BALANCE</p>
              <p className="text-4xl font-extrabold text-glow-cyan">
                {formatCurrency(balance)}
              </p>
              {wallet?.locked_balance && wallet.locked_balance > 0 && (
                <p className="text-[9px] text-[var(--text-dim)] mt-2 tracking-wider">
                  + {formatCurrency(wallet.locked_balance)} LOCKED_IN_CHALLENGES
                </p>
              )}
            </div>
            <div className="text-right space-y-3">
              <div>
                <p className="text-[8px] text-[var(--text-ghost)] tracking-wider">TOTAL_DEPOSITED</p>
                <p className="text-sm font-bold text-[var(--text-dim)]">{formatCurrency(wallet?.total_deposited || 0)}</p>
              </div>
              <div>
                <p className="text-[8px] text-[var(--text-ghost)] tracking-wider">TOTAL_WON</p>
                <p className="text-sm font-bold text-[#a855f7]">{formatCurrency(wallet?.total_won || 0)}</p>
              </div>
            </div>
          </motion.div>
        </div>
        <div className="terminal-footer">
          <Lock className="w-3 h-3" />
          ENCRYPTION: AES-256 | RAZORPAY_SECURED
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6">
        {(['overview', 'deposit', 'history'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-[10px] tracking-[0.15em] border transition-all uppercase ${
              activeTab === tab
                ? 'text-[var(--cyan)] border-[var(--cyan)] bg-[var(--cyan-ghost)]'
                : 'text-[var(--text-dim)] border-[var(--cyan-border)] hover:bg-[var(--cyan-ghost)]'
            }`}>
            {tab}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
            {/* Premium membership */}
            <div className="terminal">
              <div className="terminal-header">
                <div className="terminal-dots"><span /><span /><span /></div>
                <div className="terminal-title">
                  <Crown className="w-3 h-3" /> PREMIUM_MEMBERSHIP
                </div>
              </div>
              <div className="terminal-body">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Crown className={`w-6 h-6 ${membership?.is_active ? 'text-[#fbbf24]' : 'text-[var(--text-dim)]'}`} />
                    <div>
                      <h3 className="text-xs font-bold text-white uppercase tracking-wider">KING_MEMBERSHIP</h3>
                      <p className="text-[9px] text-[var(--text-dim)] mt-0.5 tracking-wider">
                        {membership?.is_active
                          ? `ACTIVE_UNTIL: ${new Date(membership.expires_at).toLocaleDateString('en-IN')}`
                          : 'UNLOCK_EXCLUSIVE_CHALLENGES, BADGES_&_EARLY_ACCESS'}
                      </p>
                    </div>
                  </div>
                  {!membership?.is_active && (
                    <motion.button
                      onClick={handleMembership}
                      disabled={upgrading}
                      className="btn-execute px-5 py-2 text-[10px] flex items-center gap-2"
                      whileTap={{ scale: 0.95 }}
                    >
                      {upgrading ? <Loader className="w-3 h-3 animate-spin" /> : <Crown className="w-3 h-3" />}
                      ₹{MEMBERSHIP_PRICE}/MONTH
                    </motion.button>
                  )}
                </div>
              </div>
            </div>

            {/* Quick deposit */}
            <div className="terminal">
              <div className="terminal-header">
                <div className="terminal-dots"><span /><span /><span /></div>
                <div className="terminal-title">
                  <Zap className="w-3 h-3" /> QUICK_DEPOSIT
                </div>
              </div>
              <div className="terminal-body">
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {DEPOSIT_AMOUNTS.map(amt => (
                    <motion.button
                      key={amt}
                      onClick={() => handleDeposit(amt)}
                      disabled={depositing}
                      className="py-3 border border-[var(--cyan-border)] bg-[var(--cyan-ghost)] hover:border-[var(--cyan)] hover:bg-[var(--cyan)]/10 text-[10px] font-bold transition-all disabled:opacity-50 text-[var(--cyan)]"
                      whileTap={{ scale: 0.95 }}
                    >
                      ₹{amt}
                    </motion.button>
                  ))}
                </div>
                <button onClick={() => setActiveTab('deposit')} className="btn-outline w-full py-2 text-[10px]">
                  CUSTOM_AMOUNT →
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'deposit' && (
          <motion.div key="deposit" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="terminal">
              <div className="terminal-header">
                <div className="terminal-dots"><span /><span /><span /></div>
                <div className="terminal-title">
                  <Zap className="w-3 h-3" /> DEPOSIT_FUNDS
                </div>
              </div>
              <div className="terminal-body space-y-4">
                <div>
                  <label className="label-terminal">
                    <Zap className="w-3 h-3" /> AMOUNT (₹)
                  </label>
                  <input
                    type="number"
                    value={customAmount}
                    onChange={e => setCustomAmount(e.target.value)}
                    placeholder="ENTER_AMOUNT (MIN ₹10)"
                    min={10}
                    max={100000}
                    className="input-terminal w-full text-lg"
                  />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {DEPOSIT_AMOUNTS.map(amt => (
                    <button key={amt} onClick={() => setCustomAmount(amt.toString())}
                      className={`py-2 text-[10px] border transition-all ${
                        customAmount === amt.toString()
                          ? 'text-[var(--cyan)] border-[var(--cyan)] bg-[var(--cyan-ghost)]'
                          : 'text-[var(--text-dim)] border-[var(--cyan-border)] hover:bg-[var(--cyan-ghost)]'
                      }`}>
                      ₹{amt}
                    </button>
                  ))}
                </div>
                <motion.button
                  onClick={() => handleDeposit(parseFloat(customAmount) || 0)}
                  disabled={depositing || !customAmount || parseFloat(customAmount) < 10}
                  className="btn-execute w-full"
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="relative z-10 flex items-center justify-center gap-3">
                    {depositing ? (
                      <><Loader className="w-4 h-4 animate-spin" />PROCESSING...</>
                    ) : (
                      <><Zap className="w-4 h-4" />DEPOSIT ₹{customAmount || '0'}</>
                    )}
                  </span>
                </motion.button>
                <p className="text-center text-[8px] text-[var(--text-ghost)] tracking-wider">
                  POWERED_BY_RAZORPAY · 256-BIT_SSL_ENCRYPTED
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'history' && (
          <motion.div key="history" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="terminal">
              <div className="terminal-header">
                <div className="terminal-dots"><span /><span /><span /></div>
                <div className="terminal-title">
                  <Activity className="w-3 h-3" /> TRANSACTION_LOG
                </div>
              </div>
              <div className="terminal-body">
                {transactions.length === 0 && (
                  <div className="text-center py-12">
                    <TrendingUp className="w-8 h-8 mx-auto mb-3 text-[var(--text-dim)] opacity-30" />
                    <p className="text-[var(--text-dim)] text-xs tracking-wider">NO_TRANSACTIONS_RECORDED.</p>
                  </div>
                )}
                <div className="space-y-2">
                  {transactions.map((tx, i) => {
                    const txConfig = TX_ICONS[tx.type] || TX_ICONS.deposit
                    const TxIcon = txConfig.icon
                    const isCredit = ['deposit', 'challenge_win', 'refund', 'bonus'].includes(tx.type)

                    return (
                      <motion.div
                        key={tx.id}
                        className="flex items-center gap-3 p-3 border border-[var(--cyan-border)] bg-[var(--cyan-ghost)]"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.04 }}
                      >
                        <div className="w-8 h-8 border flex items-center justify-center flex-shrink-0"
                          style={{ borderColor: txConfig.color, background: `${txConfig.color}10` }}>
                          <TxIcon className="w-3.5 h-3.5" style={{ color: txConfig.color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] text-white font-bold uppercase tracking-wider truncate">
                            {tx.description || tx.type.replace(/_/g, ' ')}
                          </p>
                          <p className="text-[8px] text-[var(--text-ghost)] tracking-wider">{formatRelativeTime(tx.created_at)}</p>
                        </div>
                        <div className="text-right">
                          <p className={`text-xs font-extrabold ${isCredit ? 'text-[var(--green)]' : 'text-[var(--red)]'}`}>
                            {isCredit ? '+' : '-'}{formatCurrency(Math.abs(tx.amount))}
                          </p>
                          <span className={`text-[8px] font-bold tracking-wider uppercase ${
                            tx.status === 'completed' ? 'text-[var(--green)]' :
                            tx.status === 'pending' ? 'text-[#fbbf24]' : 'text-[var(--red)]'
                          }`}>
                            {tx.status}
                          </span>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
