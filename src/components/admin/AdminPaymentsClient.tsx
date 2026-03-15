'use client'

import { useState } from 'react'
import { CheckCircle, XCircle, Clock, Wallet, RefreshCw, Zap, Eye } from 'lucide-react'
import { formatRelativeTime } from '@/lib/utils'
import toast from 'react-hot-toast'

interface UpiPayment {
  id: string
  user_id: string
  amount: number
  unique_amount: number
  utr_number: string | null
  status: string
  verified_by: string | null
  created_at: string
  expires_at?: string
}

export default function AdminPaymentsClient({ pending, recent }: { pending: UpiPayment[]; recent: UpiPayment[] }) {
  const [tab, setTab] = useState<'pending' | 'verified'>('pending')
  const [acting, setActing] = useState<string | null>(null)

  const handleAction = async (paymentId: string, action: 'approve' | 'reject') => {
    setActing(paymentId)
    const res = await fetch('/api/admin/payments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentId, action }),
    })
    const data = await res.json()
    if (data.success) {
      toast.success(action === 'approve' ? `Payment approved! ₹${data.amount_credited} credited.` : 'Payment rejected.')
      setTimeout(() => window.location.reload(), 1000)
    } else {
      toast.error(data.error || 'Action failed')
    }
    setActing(null)
  }

  const tabs = [
    { id: 'pending' as const, label: `Pending (${pending.length})` },
    { id: 'verified' as const, label: `Verified (${recent.length})` },
  ]

  const payments = tab === 'pending' ? pending : recent

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.02em', marginBottom: 2, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Wallet size={20} style={{ color: 'var(--primary)' }} />
            UPI Payments
          </h1>
          <p style={{ fontSize: 13, color: 'var(--muted)' }}>Review and approve manual UPI deposits</p>
        </div>
        <button onClick={() => window.location.reload()} className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      {/* SMS Endpoint Info */}
      <div style={{
        background: 'var(--primary-dim)', border: '1px solid rgba(99,102,241,0.25)',
        borderRadius: 10, padding: '14px 18px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <Zap size={16} style={{ color: '#a5b4fc', flexShrink: 0 }} />
        <div style={{ fontSize: 12, color: '#a5b4fc' }}>
          <strong>iOS Shortcut URL:</strong>{' '}
          <code style={{ background: 'rgba(0,0,0,0.3)', padding: '2px 8px', borderRadius: 4, fontSize: 11 }}>
            {typeof window !== 'undefined' ? `${window.location.origin}/api/payments/verify-sms` : '/api/payments/verify-sms'}
          </code>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, background: 'var(--bg-elevated)', borderRadius: 8, padding: 3, marginBottom: 16 }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            flex: 1, padding: '7px 12px', fontSize: 13, fontWeight: 500,
            borderRadius: 6, border: 'none', cursor: 'pointer', transition: 'all 0.15s',
            background: tab === t.id ? 'var(--bg-card)' : 'transparent',
            color: tab === t.id ? 'var(--text)' : 'var(--muted)',
          }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Payments list */}
      <div className="card" style={{ overflow: 'hidden', padding: 0 }}>
        {payments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--muted)' }}>
            <Wallet size={32} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
            <p style={{ fontSize: 14 }}>No {tab} payments</p>
          </div>
        ) : (
          <div>
            {payments.map((p, i) => (
              <div key={p.id} style={{
                display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px',
                borderBottom: i < payments.length - 1 ? '1px solid var(--border)' : 'none',
              }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                  background: p.status === 'verified' ? 'var(--success-dim)' : 'var(--warning-dim)',
                  border: `1px solid ${p.status === 'verified' ? 'rgba(34,197,94,0.3)' : 'rgba(245,158,11,0.3)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {p.status === 'verified' ? <CheckCircle size={18} style={{ color: '#22C55E' }} /> : <Clock size={18} style={{ color: '#F59E0B' }} />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                    <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>₹{p.amount}</span>
                    <span style={{ fontSize: 11, color: 'var(--subtle)', fontFamily: 'var(--font-mono)' }}>
                      (paid ₹{p.unique_amount})
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--muted)' }}>
                    {p.utr_number && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>UTR: {p.utr_number}</span>}
                    <span>{formatRelativeTime(p.created_at)}</span>
                    {p.verified_by && <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 4, background: 'var(--bg-elevated)', color: 'var(--subtle)' }}>{p.verified_by}</span>}
                  </div>
                </div>

                {tab === 'pending' && (
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button
                      onClick={() => handleAction(p.id, 'approve')}
                      disabled={acting === p.id}
                      className="btn btn-sm"
                      style={{ background: 'var(--success-dim)', color: '#86efac', border: '1px solid rgba(34,197,94,0.3)', fontSize: 12 }}
                    >
                      <CheckCircle size={13} /> Approve
                    </button>
                    <button
                      onClick={() => handleAction(p.id, 'reject')}
                      disabled={acting === p.id}
                      className="btn btn-sm btn-danger"
                      style={{ fontSize: 12 }}
                    >
                      <XCircle size={13} /> Reject
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
