'use client'

import { useState } from 'react'
import { CheckCircle, XCircle, Clock, Wallet, RefreshCw, Zap, Eye, DollarSign } from 'lucide-react'
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

  const payments = tab === 'pending' ? pending : recent

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.02em', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Wallet size={20} style={{ color: '#22C55E' }} />
              UPI Payments
            </h1>
            <p style={{ fontSize: 13, color: 'var(--muted)' }}>Review and approve manual UPI deposits</p>
          </div>
          <button onClick={() => window.location.reload()} style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px',
            fontSize: 13, fontWeight: 500, borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)',
            cursor: 'pointer', background: 'rgba(255,255,255,0.04)', color: 'var(--muted)',
          }}>
            <RefreshCw size={13} /> Refresh
          </button>
        </div>
      </div>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Pending', value: pending.length, color: '#F59E0B' },
          { label: 'Verified', value: recent.length, color: '#22C55E' },
          { label: 'Pending Value', value: `₹${pending.reduce((s, p) => s + Number(p.amount), 0).toLocaleString()}`, color: '#3B82F6' },
        ].map(({ label, value, color }) => (
          <div key={label} className="glass" style={{ borderRadius: 12, padding: '14px 16px' }}>
            <p style={{ fontSize: 22, fontWeight: 700, color, margin: '0 0 2px', fontFamily: 'var(--font-mono)' }}>{value}</p>
            <p style={{ fontSize: 11, color: 'var(--muted)', margin: 0 }}>{label}</p>
          </div>
        ))}
      </div>

      {/* SMS Endpoint Info */}
      <div className="glass" style={{
        borderRadius: 12, padding: '14px 18px', marginBottom: 20,
        display: 'flex', alignItems: 'center', gap: 12,
        borderLeft: '3px solid #6366F1',
      }}>
        <div style={{
          width: 34, height: 34, borderRadius: 10,
          background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <Zap size={15} style={{ color: '#A5B4FC' }} />
        </div>
        <div style={{ fontSize: 12, color: 'var(--muted)' }}>
          <strong style={{ color: 'var(--text)' }}>iOS Shortcut URL:</strong>{' '}
          <code style={{ background: 'rgba(255,255,255,0.04)', padding: '2px 8px', borderRadius: 6, fontSize: 11, color: '#A5B4FC', fontFamily: 'var(--font-mono)' }}>
            {typeof window !== 'undefined' ? `${window.location.origin}/api/payments/verify-sms` : '/api/payments/verify-sms'}
          </code>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, borderRadius: 10, padding: 3, marginBottom: 16 }} className="neu-inset">
        {[
          { id: 'pending' as const, label: `Pending (${pending.length})` },
          { id: 'verified' as const, label: `Verified (${recent.length})` },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            flex: 1, padding: '8px 14px', fontSize: 13, fontWeight: 500,
            borderRadius: 8, border: 'none', cursor: 'pointer', transition: 'all 0.15s',
            background: tab === t.id ? 'rgba(99,102,241,0.12)' : 'transparent',
            color: tab === t.id ? 'var(--text)' : 'var(--muted)',
            fontFamily: 'var(--font)',
          }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Payments list */}
      <div className="glass" style={{ borderRadius: 14, overflow: 'hidden', padding: 0 }}>
        {payments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--muted)' }}>
            <Wallet size={32} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
            <p style={{ fontSize: 14 }}>No {tab} payments</p>
          </div>
        ) : (
          payments.map((p, i) => (
            <div key={p.id} style={{
              display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px',
              borderBottom: i < payments.length - 1 ? '1px solid rgba(255,255,255,0.03)' : 'none',
            }}>
              <div style={{
                width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                background: p.status === 'verified' ? 'rgba(34,197,94,0.12)' : 'rgba(245,158,11,0.12)',
                border: `1px solid ${p.status === 'verified' ? 'rgba(34,197,94,0.25)' : 'rgba(245,158,11,0.25)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {p.status === 'verified'
                  ? <CheckCircle size={17} style={{ color: '#22C55E' }} />
                  : <Clock size={17} style={{ color: '#F59E0B' }} />
                }
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                  <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', fontFamily: 'var(--font-mono)' }}>₹{p.amount}</span>
                  <span style={{ fontSize: 11, color: 'var(--subtle)', fontFamily: 'var(--font-mono)' }}>
                    (paid ₹{p.unique_amount})
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--subtle)' }}>
                  {p.utr_number && (
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, padding: '1px 6px', borderRadius: 4, background: 'rgba(255,255,255,0.04)' }}>
                      UTR: {p.utr_number}
                    </span>
                  )}
                  <span>{formatRelativeTime(p.created_at)}</span>
                  {p.verified_by && (
                    <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: 'rgba(34,197,94,0.1)', color: '#22C55E', fontWeight: 600 }}>
                      {p.verified_by}
                    </span>
                  )}
                </div>
              </div>

              {tab === 'pending' && (
                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                  <button
                    onClick={() => handleAction(p.id, 'approve')}
                    disabled={acting === p.id}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 5, padding: '7px 14px',
                      fontSize: 12, fontWeight: 600, borderRadius: 8, cursor: 'pointer',
                      background: 'rgba(34,197,94,0.12)', color: '#86EFAC',
                      border: '1px solid rgba(34,197,94,0.25)',
                    }}
                  >
                    <CheckCircle size={13} /> Approve
                  </button>
                  <button
                    onClick={() => handleAction(p.id, 'reject')}
                    disabled={acting === p.id}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 5, padding: '7px 14px',
                      fontSize: 12, fontWeight: 600, borderRadius: 8, cursor: 'pointer',
                      background: 'rgba(239,68,68,0.12)', color: '#FCA5A5',
                      border: '1px solid rgba(239,68,68,0.25)',
                    }}
                  >
                    <XCircle size={13} /> Reject
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
