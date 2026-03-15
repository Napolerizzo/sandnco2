'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Zap, ArrowUpRight, ArrowDownLeft, Crown, Clock, Loader,
  TrendingUp, Trophy, Gift, Shield, Lock, Activity, Wallet
} from 'lucide-react'
import { formatCurrency, formatRelativeTime } from '@/lib/utils'
import { loadRazorpayScript } from '@/lib/razorpay'
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
  deposit: { icon: ArrowDownLeft, color: '#22C55E' },
  withdrawal: { icon: ArrowUpRight, color: '#F97316' },
  challenge_entry: { icon: Trophy, color: '#F59E0B' },
  challenge_win: { icon: Trophy, color: '#A855F7' },
  membership: { icon: Crown, color: '#F59E0B' },
  refund: { icon: ArrowDownLeft, color: '#6366F1' },
  bonus: { icon: Gift, color: '#EC4899' },
}

export default function WalletClient({
  wallet,
  transactions,
  membership,
  userId,
}: {
  wallet: WalletData | null
  transactions: Transaction[]
  membership: Membership | null
  userId: string
}) {
  const [depositAmount, setDepositAmount] = useState(0)
  const [customAmount, setCustomAmount] = useState('')
  const [depositing, setDepositing] = useState(false)
  const [upgrading, setUpgrading] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'deposit' | 'history'>('overview')
  const [depositMethod, setDepositMethod] = useState<'razorpay' | 'upi'>('upi')

  // UPI payment state
  const [upiPayment, setUpiPayment] = useState<{
    payment_id: string
    unique_amount: number
    upi_id: string
    upi_link: string
    expires_at: string
  } | null>(null)
  const [utrInput, setUtrInput] = useState('')
  const [submittingUtr, setSubmittingUtr] = useState(false)
  const [upiStatus, setUpiStatus] = useState<'idle' | 'created' | 'submitted'>('idle')

  const balance = wallet?.balance || 0

  const handleDeposit = async (amount: number) => {
    if (amount < 10) { toast.error('Minimum deposit is ₹10'); return }
    setDepositing(true)

    const loaded = await loadRazorpayScript()
    if (!loaded) { toast.error('Payment gateway failed to load. Please try again.'); setDepositing(false); return }

    const orderRes = await fetch('/api/payments/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, type: 'wallet_deposit' }),
    })
    const { order, error } = await orderRes.json()
    if (error) { toast.error(error); setDepositing(false); return }

    const razorpayKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID
    if (!razorpayKey) { toast.error('Payment gateway not configured'); setDepositing(false); return }

    const win = window as unknown as Record<string, unknown>
    const Razorpay = win.Razorpay as new (opts: Record<string, unknown>) => { open: () => void }

    const rzp = new Razorpay({
      key: razorpayKey,
      order_id: order.id,
      amount: order.amount,
      currency: 'INR',
      name: 'King of Good Times',
      description: 'Wallet Deposit',
      theme: { color: '#6366F1' },
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
          toast.success(`₹${amount} added to your wallet!`)
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
    const res = await fetch('/api/payments/upi', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: BETA_PRICE, type: 'membership' }),
    })
    const data = await res.json()
    if (data.error) { toast.error(data.error); setUpgrading(false); return }
    setUpiPayment(data)
    setUpiStatus('created')
    setUpgrading(false)
    setActiveTab('deposit')
  }

  const handleUpiDeposit = async (amount: number) => {
    if (amount < 10) { toast.error('Minimum deposit is ₹10'); return }
    setDepositing(true)
    const res = await fetch('/api/payments/upi', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount }),
    })
    const data = await res.json()
    if (data.error) { toast.error(data.error); setDepositing(false); return }
    setUpiPayment(data)
    setUpiStatus('created')
    setDepositing(false)
    setActiveTab('deposit')
  }

  const handleSubmitUtr = async () => {
    if (!upiPayment || !utrInput.trim()) { toast.error('Enter your UTR number'); return }
    setSubmittingUtr(true)
    const res = await fetch('/api/payments/upi/submit-utr', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ payment_id: upiPayment.payment_id, utr_number: utrInput.trim() }),
    })
    const data = await res.json()
    if (data.success) {
      toast.success('UTR submitted! Your payment will be verified shortly.')
      setUpiStatus('submitted')
    } else {
      toast.error(data.error || 'Failed to submit UTR')
    }
    setSubmittingUtr(false)
  }

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'deposit', label: 'Add Funds' },
    { id: 'history', label: 'History' },
  ] as const

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '32px 16px 80px' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 10 }}>
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
        {activeTab === 'overview' && (
          <motion.div key="overview" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

            {/* Premium membership */}
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                    <motion.button
                      onClick={handleMembership}
                      disabled={upgrading}
                      className="btn btn-primary"
                      style={{ padding: '8px 16px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}
                      whileTap={{ scale: 0.96 }}
                    >
                      {upgrading ? <Loader size={13} className="animate-spin" /> : <Crown size={13} />}
                      ₹{MEMBERSHIP_PRICE}/mo
                      <span style={{ fontSize: 10, opacity: 0.8, fontWeight: 400 }}>(Beta: ₹{BETA_PRICE})</span>
                    </motion.button>
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
                    onClick={() => handleUpiDeposit(amt)}
                    disabled={depositing}
                    style={{
                      padding: '10px', fontSize: 13, fontWeight: 600,
                      borderRadius: 'var(--r-md)', border: '1px solid var(--border)',
                      background: 'var(--bg-elevated)', color: 'var(--text)', cursor: 'pointer',
                      transition: 'all 0.15s', opacity: depositing ? 0.6 : 1,
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

        {activeTab === 'deposit' && (
          <motion.div key="deposit" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ type: 'spring', stiffness: 400, damping: 30 }}>

            {/* UPI Payment Created — Show payment details */}
            {upiStatus !== 'idle' && upiPayment ? (
              <div className="card" style={{ padding: '22px' }}>
                {upiStatus === 'submitted' ? (
                  <div style={{ textAlign: 'center', padding: '20px 0' }}>
                    <div style={{
                      width: 56, height: 56, borderRadius: 16, margin: '0 auto 16px',
                      background: 'var(--success-dim)', border: '1px solid rgba(34,197,94,0.3)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Activity size={24} style={{ color: '#22C55E' }} />
                    </div>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>Payment Submitted</h3>
                    <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.6, marginBottom: 16 }}>
                      Your UTR has been submitted. Your wallet will be credited automatically once verified.
                      This usually takes a few seconds.
                    </p>
                    <button onClick={() => { setUpiStatus('idle'); setUpiPayment(null); setUtrInput(''); window.location.reload() }} className="btn btn-primary" style={{ fontSize: 13 }}>
                      Back to Wallet
                    </button>
                  </div>
                ) : (
                  <>
                    <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Zap size={15} style={{ color: 'var(--primary)' }} />
                      Complete UPI Payment
                    </h3>

                    {/* Amount to pay */}
                    <div style={{
                      background: 'var(--bg-elevated)', borderRadius: 10, padding: 16, marginBottom: 16,
                      border: '1px solid var(--border)', textAlign: 'center',
                    }}>
                      <p style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Pay exactly</p>
                      <p style={{ fontSize: 32, fontWeight: 800, color: '#22C55E', letterSpacing: '-0.03em' }}>
                        ₹{upiPayment.unique_amount}
                      </p>
                      <p style={{ fontSize: 12, color: 'var(--warning)', marginTop: 4 }}>
                        Amount must match exactly for auto-verification
                      </p>
                    </div>

                    {/* UPI ID */}
                    <div style={{
                      background: 'var(--bg-elevated)', borderRadius: 10, padding: 14, marginBottom: 16,
                      border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    }}>
                      <div>
                        <p style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 2 }}>UPI ID</p>
                        <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', fontFamily: 'var(--font-mono)' }}>{upiPayment.upi_id}</p>
                      </div>
                      <button
                        onClick={() => { navigator.clipboard.writeText(upiPayment.upi_id); toast.success('UPI ID copied!') }}
                        className="btn btn-secondary btn-sm"
                        style={{ fontSize: 12, flexShrink: 0 }}
                      >
                        Copy
                      </button>
                    </div>

                    {/* Pay via UPI app button */}
                    <a
                      href={upiPayment.upi_link}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                        width: '100%', padding: '12px', fontSize: 14, fontWeight: 600,
                        borderRadius: 8, background: '#22C55E', color: '#fff', textDecoration: 'none',
                        marginBottom: 16,
                      }}
                    >
                      <Zap size={15} />
                      Pay via UPI App
                    </a>

                    {/* UTR Submission */}
                    <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16 }}>
                      <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)', marginBottom: 8 }}>
                        After paying, enter your UTR/Reference number:
                      </p>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <input
                          type="text"
                          value={utrInput}
                          onChange={e => setUtrInput(e.target.value)}
                          placeholder="Enter UTR number"
                          className="input"
                          style={{ flex: 1 }}
                        />
                        <motion.button
                          onClick={handleSubmitUtr}
                          disabled={submittingUtr || !utrInput.trim()}
                          className="btn btn-primary"
                          style={{ flexShrink: 0, opacity: !utrInput.trim() ? 0.5 : 1 }}
                          whileTap={{ scale: 0.96 }}
                        >
                          {submittingUtr ? <Loader size={14} className="animate-spin" /> : 'Submit'}
                        </motion.button>
                      </div>
                      <p style={{ fontSize: 11, color: 'var(--subtle)', marginTop: 8 }}>
                        Payment auto-verifies in seconds. If not, admin will approve manually.
                      </p>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="card" style={{ padding: '22px' }}>
                {/* Razorpay disabled banner */}
                <div style={{
                  padding: '10px 14px', marginBottom: 16, borderRadius: 8,
                  background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)',
                  fontSize: 12, color: '#F59E0B', fontWeight: 500,
                }}>
                  Razorpay payments are currently disabled. Please use UPI for deposits.
                </div>

                <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Zap size={15} style={{ color: 'var(--primary)' }} />
                  Add funds to wallet
                </h3>

                {/* Payment method toggle */}
                <div style={{ display: 'flex', gap: 4, background: 'var(--bg-elevated)', borderRadius: 8, padding: 3, marginBottom: 16 }}>
                  <button onClick={() => setDepositMethod('upi')} style={{
                    flex: 1, padding: '7px 12px', fontSize: 13, fontWeight: 500,
                    borderRadius: 6, border: 'none', cursor: 'pointer', transition: 'all 0.15s',
                    background: depositMethod === 'upi' ? 'var(--bg-card)' : 'transparent',
                    color: depositMethod === 'upi' ? 'var(--text)' : 'var(--muted)',
                    boxShadow: depositMethod === 'upi' ? '0 1px 3px rgba(0,0,0,0.2)' : 'none',
                  }}>
                    UPI Direct
                  </button>
                  <button disabled style={{
                    flex: 1, padding: '7px 12px', fontSize: 13, fontWeight: 500,
                    borderRadius: 6, border: 'none', cursor: 'not-allowed', transition: 'all 0.15s',
                    background: 'transparent',
                    color: 'var(--subtle)',
                    opacity: 0.5,
                  }}>
                    Razorpay — Coming soon
                  </button>
                </div>

                <div style={{ marginBottom: 16 }}>
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
                    style={{ width: '100%', fontSize: 15 }}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 20 }}>
                  {DEPOSIT_AMOUNTS.map(amt => (
                    <button key={amt} onClick={() => setCustomAmount(amt.toString())} style={{
                      padding: '8px', fontSize: 12, fontWeight: 500,
                      borderRadius: 'var(--r-md)',
                      border: `1px solid ${customAmount === amt.toString() ? 'var(--primary)' : 'var(--border)'}`,
                      background: customAmount === amt.toString() ? 'var(--primary-dim)' : 'transparent',
                      color: customAmount === amt.toString() ? 'var(--primary)' : 'var(--muted)',
                      cursor: 'pointer', transition: 'all 0.15s',
                    }}>
                      ₹{amt}
                    </button>
                  ))}
                </div>
                <motion.button
                  onClick={() => {
                    const amt = parseFloat(customAmount) || 0
                    if (depositMethod === 'upi') handleUpiDeposit(amt)
                    else handleDeposit(amt)
                  }}
                  disabled={depositing || !customAmount || parseFloat(customAmount) < 10}
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '13px', fontSize: 14, fontWeight: 600, marginBottom: 10, opacity: (!customAmount || parseFloat(customAmount) < 10 || depositing) ? 0.6 : 1 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {depositing ? (
                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                      <Loader size={15} className="animate-spin" />Processing...
                    </span>
                  ) : (
                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                      <Zap size={15} />
                      {depositMethod === 'upi' ? `Pay ₹${customAmount || '0'} via UPI` : `Add ₹${customAmount || '0'} via Razorpay`}
                    </span>
                  )}
                </motion.button>
                <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--subtle)' }}>
                  {depositMethod === 'upi' ? 'Direct UPI · Instant verification' : 'Powered by Razorpay · 256-bit SSL'}
                </p>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'history' && (
          <motion.div key="history" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ type: 'spring', stiffness: 400, damping: 30 }}>
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
