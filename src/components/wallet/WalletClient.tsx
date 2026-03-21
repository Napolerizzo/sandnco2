'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Zap, ArrowUpRight, ArrowDownLeft, Crown, Loader,
  TrendingUp, Trophy, Gift, Shield, Lock, Activity, Wallet,
  ExternalLink, CheckCircle,
} from 'lucide-react'
import { formatCurrency, formatRelativeTime } from '@/lib/utils'
import toast from 'react-hot-toast'

interface WalletData {
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
const MEMBERSHIP_PRICE = 89
const BETA_PRICE = 1

const TX_ICONS: Record<string, { icon: typeof Zap; color: string }> = {
  deposit:           { icon: ArrowDownLeft, color: '#22C55E' },
  withdrawal:        { icon: ArrowUpRight,  color: '#F97316' },
  challenge_entry:   { icon: Trophy,        color: '#F59E0B' },
  challenge_win:     { icon: Trophy,        color: '#A855F7' },
  membership:        { icon: Crown,         color: '#F59E0B' },
  refund:            { icon: ArrowDownLeft, color: '#6366F1' },
  bonus:             { icon: Gift,          color: '#EC4899' },
}

export default function WalletClient({
  wallet,
  transactions,
  membership,
}: {
  wallet: WalletData | null
  transactions: Transaction[]
  membership: Membership | null
  userId: string
}) {
  const searchParams = useSearchParams()
  const [customAmount, setCustomAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'deposit' | 'history'>('overview')

  // Handle callback from Razorpay payment page
  useEffect(() => {
    const payment = searchParams?.get('payment')
    if (payment === 'success') {
      toast.success('Payment received! Your wallet will be credited shortly.', { duration: 5000, icon: '💰' })
      // Clean up URL
      const url = new URL(window.location.href)
      url.searchParams.delete('payment')
      url.searchParams.delete('ref')
      window.history.replaceState({}, '', url.toString())
      // Reload after a beat to pick up credited balance
      setTimeout(() => window.location.reload(), 2000)
    }
  }, [searchParams])

  const handlePayment = async (amount: number, type: 'wallet_deposit' | 'membership' = 'wallet_deposit') => {
    const min = type === 'membership' ? BETA_PRICE : 10
    if (amount < min) {
      toast.error(`Minimum amount is ₹${min}`)
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/payments/razorpay-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, type }),
      })
      const data = await res.json()
      if (data.error) {
        toast.error(data.error)
        return
      }
      // Redirect to Razorpay payment page with pre-filled fields
      window.location.href = data.redirect_url
    } catch {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const balance = wallet?.balance || 0

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'deposit',  label: 'Add Funds' },
    { id: 'history',  label: 'History' },
  ] as const

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '32px 16px 80px' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{
          fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em',
          color: 'var(--text)', marginBottom: 4,
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <Wallet size={22} style={{ color: 'var(--primary)' }} />
          Your Wallet
        </h1>
        <p style={{ fontSize: 13, color: 'var(--muted)' }}>Secure · Swift · Sovereign</p>
      </div>

      {/* Balance card */}
      <motion.div
        className="card"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        style={{ marginBottom: 20, padding: '24px', background: 'linear-gradient(135deg, #1e1b4b 0%, var(--bg-card) 100%)' }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
              Available balance
            </p>
            <p style={{ fontSize: 36, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.03em', marginBottom: 4 }}>
              {formatCurrency(balance)}
            </p>
            {wallet?.locked_balance && wallet.locked_balance > 0 && (
              <p style={{ fontSize: 12, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Lock size={11} />
                {formatCurrency(wallet.locked_balance)} locked in challenges
              </p>
            )}
          </div>
          <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <p style={{ fontSize: 10, color: 'var(--subtle)', marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Total deposited</p>
              <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--muted)' }}>{formatCurrency(wallet?.total_deposited || 0)}</p>
            </div>
            <div>
              <p style={{ fontSize: 10, color: 'var(--subtle)', marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Total won</p>
              <p style={{ fontSize: 14, fontWeight: 600, color: '#A855F7' }}>{formatCurrency(wallet?.total_won || 0)}</p>
            </div>
          </div>
        </div>
        <div style={{ marginTop: 16, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--subtle)' }}>
          <Shield size={11} />
          Secured by Razorpay · AES-256 encryption
        </div>
      </motion.div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, background: 'var(--bg-elevated)', borderRadius: 'var(--r-md)', padding: 3, marginBottom: 20 }}>
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
            flex: 1, padding: '8px 12px', fontSize: 13, fontWeight: 500,
            borderRadius: 'var(--r)', border: 'none', cursor: 'pointer', transition: 'all 0.15s',
            background: activeTab === tab.id ? 'var(--bg-card)' : 'transparent',
            color: activeTab === tab.id ? 'var(--text)' : 'var(--muted)',
            boxShadow: activeTab === tab.id ? '0 1px 3px rgba(0,0,0,0.2)' : 'none',
          }}>
            {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* ── OVERVIEW TAB ── */}
        {activeTab === 'overview' && (
          <motion.div key="overview"
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            style={{ display: 'flex', flexDirection: 'column', gap: 14 }}
          >
            {/* King Membership card */}
            <div className="card" style={{ padding: '18px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                    background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.25)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Crown size={18} style={{ color: '#F59E0B' }} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>King Membership</h3>
                    <p style={{ fontSize: 12, color: 'var(--muted)' }}>
                      {membership?.is_active
                        ? `Active until ${new Date(membership.expires_at).toLocaleDateString('en-IN')}`
                        : 'Exclusive challenges, badges & early access'}
                    </p>
                  </div>
                </div>
                {!membership?.is_active && (
                  <motion.button
                    onClick={() => handlePayment(BETA_PRICE, 'membership')}
                    disabled={loading}
                    className="btn btn-primary"
                    style={{ padding: '8px 16px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}
                    whileTap={{ scale: 0.96 }}
                  >
                    {loading ? <Loader size={13} className="animate-spin" /> : <Crown size={13} />}
                    ₹{MEMBERSHIP_PRICE}/mo
                    <span style={{ fontSize: 10, opacity: 0.8, fontWeight: 400 }}>(Beta: ₹{BETA_PRICE})</span>
                  </motion.button>
                )}
                {membership?.is_active && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#22C55E', fontWeight: 600 }}>
                    <CheckCircle size={14} />
                    Active
                  </div>
                )}
              </div>
            </div>

            {/* Quick deposit */}
            <div className="card" style={{ padding: '18px 20px' }}>
              <h3 style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Zap size={14} style={{ color: 'var(--primary)' }} />
                Quick deposit
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 12 }}>
                {DEPOSIT_AMOUNTS.map(amt => (
                  <motion.button
                    key={amt}
                    onClick={() => handlePayment(amt)}
                    disabled={loading}
                    style={{
                      padding: '10px', fontSize: 13, fontWeight: 600,
                      borderRadius: 'var(--r-md)', border: '1px solid var(--border)',
                      background: 'var(--bg-elevated)', color: 'var(--text)',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      transition: 'all 0.15s', opacity: loading ? 0.6 : 1,
                    }}
                    whileHover={{ borderColor: 'var(--primary)', color: 'var(--primary)' }}
                    whileTap={{ scale: 0.96 }}
                  >
                    ₹{amt}
                  </motion.button>
                ))}
              </div>
              <button onClick={() => setActiveTab('deposit')} className="btn btn-secondary" style={{ width: '100%', fontSize: 13 }}>
                Custom amount →
              </button>
            </div>
          </motion.div>
        )}

        {/* ── DEPOSIT TAB ── */}
        {activeTab === 'deposit' && (
          <motion.div key="deposit"
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          >
            <div className="card" style={{ padding: '24px' }}>
              {/* Razorpay branding */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 14px', marginBottom: 20, borderRadius: 8,
                background: 'linear-gradient(135deg, rgba(99,102,241,0.12), rgba(139,92,246,0.08))',
                border: '1px solid rgba(99,102,241,0.25)',
              }}>
                <div style={{ width: 28, height: 28, borderRadius: 6, background: '#6366F1', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Zap size={14} style={{ color: '#fff' }} />
                </div>
                <div>
                  <p style={{ fontSize: 12, fontWeight: 600, color: '#A5B4FC', marginBottom: 1 }}>Pay via Razorpay</p>
                  <p style={{ fontSize: 11, color: 'var(--muted)' }}>UPI · Cards · Net Banking · Wallets · EMI</p>
                </div>
              </div>

              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Amount (₹)
              </label>
              <input
                type="number"
                value={customAmount}
                onChange={e => setCustomAmount(e.target.value)}
                placeholder="Enter amount (minimum ₹10)"
                min={10}
                max={100000}
                className="input"
                style={{ width: '100%', fontSize: 15, marginBottom: 12 }}
              />

              {/* Quick pick */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 20 }}>
                {DEPOSIT_AMOUNTS.map(amt => (
                  <button
                    key={amt}
                    onClick={() => setCustomAmount(amt.toString())}
                    style={{
                      padding: '8px', fontSize: 12, fontWeight: 500,
                      borderRadius: 'var(--r-md)', cursor: 'pointer', transition: 'all 0.15s',
                      border: `1px solid ${customAmount === amt.toString() ? 'var(--primary)' : 'var(--border)'}`,
                      background: customAmount === amt.toString() ? 'rgba(255,45,85,0.1)' : 'transparent',
                      color: customAmount === amt.toString() ? 'var(--primary)' : 'var(--muted)',
                    }}
                  >
                    ₹{amt}
                  </button>
                ))}
              </div>

              <motion.button
                onClick={() => handlePayment(parseFloat(customAmount) || 0)}
                disabled={loading || !customAmount || parseFloat(customAmount) < 10}
                className="btn btn-primary"
                style={{
                  width: '100%', padding: '14px', fontSize: 15, fontWeight: 700,
                  marginBottom: 10, borderRadius: 'var(--r-md)',
                  opacity: (!customAmount || parseFloat(customAmount) < 10 || loading) ? 0.6 : 1,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                }}
                whileTap={{ scale: 0.98 }}
              >
                {loading
                  ? <><Loader size={16} className="animate-spin" /> Opening Razorpay...</>
                  : <><ExternalLink size={16} /> Pay ₹{customAmount || '0'} via Razorpay</>
                }
              </motion.button>

              <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--subtle)' }}>
                You'll be redirected to Razorpay's secure payment page. Username is pre-filled automatically.
              </p>

              {/* How it works */}
              <div style={{
                marginTop: 20, paddingTop: 16,
                borderTop: '1px solid var(--border)',
                display: 'flex', flexDirection: 'column', gap: 8,
              }}>
                {[
                  ['1', 'Click Pay — you\'re redirected to Razorpay with your username pre-filled'],
                  ['2', 'Complete payment via UPI, card, or netbanking'],
                  ['3', 'Your wallet is credited automatically via webhook'],
                ].map(([step, text]) => (
                  <div key={step} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <div style={{
                      width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                      background: 'rgba(255,45,85,0.15)', border: '1px solid rgba(255,45,85,0.3)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 10, fontWeight: 700, color: 'var(--primary)',
                    }}>{step}</div>
                    <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.5 }}>{text}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* ── HISTORY TAB ── */}
        {activeTab === 'history' && (
          <motion.div key="history"
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          >
            <div className="card">
              <div style={{ padding: '14px 18px 10px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Activity size={14} style={{ color: 'var(--primary)' }} />
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>Transaction history</span>
              </div>

              {transactions.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--muted)' }}>
                  <TrendingUp size={36} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
                  <p style={{ fontSize: 14 }}>No transactions yet</p>
                </div>
              ) : (
                <div>
                  {transactions.map((tx, i) => {
                    const txConfig = TX_ICONS[tx.type] || TX_ICONS.deposit
                    const TxIcon = txConfig.icon
                    const isCredit = ['deposit', 'challenge_win', 'refund', 'bonus'].includes(tx.type)

                    return (
                      <motion.div
                        key={tx.id}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 12,
                          padding: '12px 18px',
                          borderBottom: i < transactions.length - 1 ? '1px solid var(--border)' : 'none',
                        }}
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.03 }}
                      >
                        <div style={{
                          width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          background: `${txConfig.color}15`, border: `1px solid ${txConfig.color}30`,
                        }}>
                          <TxIcon size={15} style={{ color: txConfig.color }} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textTransform: 'capitalize' }}>
                            {tx.description || tx.type.replace(/_/g, ' ')}
                          </p>
                          <p style={{ fontSize: 11, color: 'var(--subtle)' }}>{formatRelativeTime(tx.created_at)}</p>
                        </div>
                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          <p style={{ fontSize: 14, fontWeight: 700, color: isCredit ? '#22C55E' : '#EF4444', marginBottom: 2 }}>
                            {isCredit ? '+' : '-'}{formatCurrency(Math.abs(tx.amount))}
                          </p>
                          <span style={{
                            fontSize: 10, fontWeight: 600, textTransform: 'capitalize',
                            color: tx.status === 'completed' ? '#22C55E' : tx.status === 'pending' ? '#F59E0B' : '#EF4444',
                          }}>
                            {tx.status}
                          </span>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
