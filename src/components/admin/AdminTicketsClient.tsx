'use client'

import { useState } from 'react'
import { Ticket, MessageSquare, Clock, CheckCircle, AlertTriangle, Brain, ChevronDown, ChevronUp, User } from 'lucide-react'
import { formatRelativeTime } from '@/lib/utils'
import toast from 'react-hot-toast'

interface SupportTicket {
  id: string
  user_id: string
  email?: string
  category: string
  subject: string
  description: string
  status: string
  priority: string
  ai_response?: string
  created_at: string
  resolved_at?: string
  users?: { username?: string; display_name?: string; email?: string } | null
}

const PRIORITY_COLORS: Record<string, { color: string; bg: string }> = {
  low: { color: '#6B7280', bg: 'rgba(107,114,128,0.12)' },
  normal: { color: '#3B82F6', bg: 'rgba(59,130,246,0.12)' },
  high: { color: '#F59E0B', bg: 'rgba(245,158,11,0.12)' },
  urgent: { color: '#EF4444', bg: 'rgba(239,68,68,0.12)' },
}

const STATUS_STYLES: Record<string, { color: string; label: string }> = {
  open: { color: '#F59E0B', label: 'Open' },
  ai_handled: { color: '#A855F7', label: 'AI Handled' },
  escalated: { color: '#EF4444', label: 'Escalated' },
  resolved: { color: '#22C55E', label: 'Resolved' },
  closed: { color: '#6B7280', label: 'Closed' },
}

const CATEGORY_LABELS: Record<string, string> = {
  payment: 'Payment', wallet: 'Wallet', membership: 'Membership',
  bug: 'Bug Report', appeal: 'Appeal', general: 'General',
}

export default function AdminTicketsClient({ open, resolved }: { open: SupportTicket[]; resolved: SupportTicket[] }) {
  const [tab, setTab] = useState<'open' | 'resolved'>('open')
  const [expanded, setExpanded] = useState<string | null>(null)
  const tickets = tab === 'open' ? open : resolved

  const handleResolve = async (ticketId: string) => {
    toast.success('Ticket marked resolved')
    window.location.reload()
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.02em', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Ticket size={20} style={{ color: '#3B82F6' }} />
          Support Tickets
        </h1>
        <p style={{ fontSize: 13, color: 'var(--muted)' }}>Manage support requests and escalations</p>
      </div>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Open', value: open.filter(t => t.status === 'open').length, color: '#F59E0B' },
          { label: 'AI Handled', value: open.filter(t => t.status === 'ai_handled').length, color: '#A855F7' },
          { label: 'Escalated', value: open.filter(t => t.status === 'escalated').length, color: '#EF4444' },
          { label: 'Resolved', value: resolved.length, color: '#22C55E' },
        ].map(({ label, value, color }) => (
          <div key={label} className="glass" style={{ borderRadius: 12, padding: '14px 16px' }}>
            <p style={{ fontSize: 22, fontWeight: 700, color, margin: '0 0 2px' }}>{value}</p>
            <p style={{ fontSize: 11, color: 'var(--muted)', margin: 0 }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, borderRadius: 10, padding: 3, marginBottom: 16 }} className="neu-inset">
        {[
          { id: 'open' as const, label: `Open (${open.length})` },
          { id: 'resolved' as const, label: `Resolved (${resolved.length})` },
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

      {/* Tickets */}
      {tickets.length === 0 ? (
        <div className="glass" style={{ textAlign: 'center', padding: '60px 0', borderRadius: 14, color: 'var(--muted)' }}>
          <Ticket size={32} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
          <p style={{ fontSize: 14 }}>No {tab} tickets</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {tickets.map(t => {
            const st = STATUS_STYLES[t.status] || STATUS_STYLES.open
            const pr = PRIORITY_COLORS[t.priority] || PRIORITY_COLORS.normal
            const isOpen = expanded === t.id

            return (
              <div key={t.id} className="glass" style={{ borderRadius: 14, overflow: 'hidden', padding: 0 }}>
                {/* Header row */}
                <div
                  onClick={() => setExpanded(isOpen ? null : t.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px',
                    cursor: 'pointer', transition: 'background 0.15s',
                  }}
                >
                  <div style={{
                    width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                    background: st.color,
                    boxShadow: `0 0 8px ${st.color}50`,
                  }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {t.subject}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 3 }}>
                      <span style={{ fontSize: 11, color: 'var(--subtle)' }}>
                        {t.users?.username ? `@${t.users.username}` : t.email || 'Unknown'}
                      </span>
                      <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 4, background: pr.bg, color: pr.color, fontWeight: 600 }}>
                        {t.priority}
                      </span>
                      <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 4, background: `${st.color}15`, color: st.color, fontWeight: 600 }}>
                        {st.label}
                      </span>
                      <span style={{ fontSize: 11, color: 'var(--subtle)' }}>
                        {CATEGORY_LABELS[t.category] || t.category}
                      </span>
                    </div>
                  </div>
                  <span style={{ fontSize: 11, color: 'var(--subtle)', flexShrink: 0 }}>{formatRelativeTime(t.created_at)}</span>
                  {isOpen ? <ChevronUp size={14} style={{ color: 'var(--subtle)' }} /> : <ChevronDown size={14} style={{ color: 'var(--subtle)' }} />}
                </div>

                {/* Expanded content */}
                {isOpen && (
                  <div style={{ padding: '0 20px 18px', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                    <div style={{ paddingTop: 14 }}>
                      <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)', marginBottom: 6 }}>Description</p>
                      <p style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.6, margin: '0 0 14px' }}>{t.description}</p>

                      {t.ai_response && (
                        <div className="neu-inset" style={{ borderRadius: 10, padding: 14, marginBottom: 14 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                            <Brain size={13} style={{ color: '#A855F7' }} />
                            <span style={{ fontSize: 12, fontWeight: 600, color: '#C084FC' }}>AI Response</span>
                          </div>
                          <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.5, margin: 0 }}>{t.ai_response}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
