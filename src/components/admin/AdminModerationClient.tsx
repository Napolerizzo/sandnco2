'use client'

import { useState } from 'react'
import { Shield, AlertTriangle, Eye, Clock, CheckCircle, XCircle, Flag, User } from 'lucide-react'
import { formatRelativeTime } from '@/lib/utils'

interface ModerationLog {
  id: string
  moderator_id: string
  target_user_id?: string
  target_content_id?: string
  target_content_type?: string
  action: string
  reason?: string
  notes?: string
  created_at: string
  users?: { username: string; display_name?: string } | null
}

interface Report {
  id: string
  reporter_id: string
  type: string
  target_id: string
  reason: string
  details?: string
  status: string
  action_taken?: string
  created_at: string
  users?: { username: string } | null
}

const ACTION_STYLES: Record<string, { color: string; icon: typeof Shield }> = {
  warn: { color: '#F59E0B', icon: AlertTriangle },
  suspend: { color: '#F97316', icon: Shield },
  ban: { color: '#EF4444', icon: XCircle },
  unsuspend: { color: '#22C55E', icon: CheckCircle },
  approve: { color: '#22C55E', icon: CheckCircle },
  reject: { color: '#EF4444', icon: XCircle },
  ai_verify: { color: '#A855F7', icon: Eye },
  set_verdict: { color: '#3B82F6', icon: Eye },
}

const REPORT_STATUS: Record<string, { color: string; label: string }> = {
  pending: { color: '#F59E0B', label: 'Pending' },
  reviewed: { color: '#3B82F6', label: 'Reviewed' },
  actioned: { color: '#22C55E', label: 'Actioned' },
  dismissed: { color: '#6B7280', label: 'Dismissed' },
}

export default function AdminModerationClient({ logs, reports }: { logs: ModerationLog[]; reports: Report[] }) {
  const [tab, setTab] = useState<'logs' | 'reports'>('logs')

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.02em', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Shield size={20} style={{ color: '#A855F7' }} />
          Moderation
        </h1>
        <p style={{ fontSize: 13, color: 'var(--muted)' }}>Audit trail and user reports</p>
      </div>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Total Actions', value: logs.length, color: '#A855F7' },
          { label: 'Pending Reports', value: reports.filter(r => r.status === 'pending').length, color: '#F59E0B' },
          { label: 'Actioned Reports', value: reports.filter(r => r.status === 'actioned').length, color: '#22C55E' },
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
          { id: 'logs' as const, label: `Mod Log (${logs.length})` },
          { id: 'reports' as const, label: `Reports (${reports.length})` },
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

      {tab === 'logs' ? (
        <div className="glass" style={{ borderRadius: 14, overflow: 'hidden', padding: 0 }}>
          {logs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--muted)' }}>
              <Shield size={32} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
              <p style={{ fontSize: 14 }}>No moderation actions yet</p>
            </div>
          ) : (
            logs.map((log, i) => {
              const act = ACTION_STYLES[log.action] || { color: '#6B7280', icon: Shield }
              const ActIcon = act.icon
              return (
                <div key={log.id} style={{
                  display: 'flex', alignItems: 'center', gap: 14, padding: '13px 20px',
                  borderBottom: i < logs.length - 1 ? '1px solid rgba(255,255,255,0.03)' : 'none',
                }}>
                  <div style={{
                    width: 34, height: 34, borderRadius: 10, flexShrink: 0,
                    background: `${act.color}12`, border: `1px solid ${act.color}25`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <ActIcon style={{ width: 15, height: 15, color: act.color }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ textTransform: 'capitalize' }}>{log.action.replace(/_/g, ' ')}</span>
                      {log.target_content_type && (
                        <span style={{ fontSize: 10, color: 'var(--subtle)', padding: '1px 6px', borderRadius: 4, background: 'rgba(255,255,255,0.04)' }}>
                          {log.target_content_type}
                        </span>
                      )}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                      <span style={{ fontSize: 11, color: 'var(--subtle)' }}>
                        by {log.users?.display_name || log.users?.username || 'System'}
                      </span>
                      {log.reason && (
                        <span style={{ fontSize: 11, color: 'var(--muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 300 }}>
                          — {log.reason}
                        </span>
                      )}
                    </div>
                  </div>
                  <span style={{ fontSize: 11, color: 'var(--subtle)', flexShrink: 0 }}>{formatRelativeTime(log.created_at)}</span>
                </div>
              )
            })
          )}
        </div>
      ) : (
        <div className="glass" style={{ borderRadius: 14, overflow: 'hidden', padding: 0 }}>
          {reports.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--muted)' }}>
              <Flag size={32} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
              <p style={{ fontSize: 14 }}>No reports yet</p>
            </div>
          ) : (
            reports.map((r, i) => {
              const st = REPORT_STATUS[r.status] || REPORT_STATUS.pending
              return (
                <div key={r.id} style={{
                  display: 'flex', alignItems: 'center', gap: 14, padding: '13px 20px',
                  borderBottom: i < reports.length - 1 ? '1px solid rgba(255,255,255,0.03)' : 'none',
                }}>
                  <div style={{
                    width: 34, height: 34, borderRadius: 10, flexShrink: 0,
                    background: `${st.color}12`, border: `1px solid ${st.color}25`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Flag style={{ width: 15, height: 15, color: st.color }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', margin: 0 }}>
                      {r.reason}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                      <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 4, background: `${st.color}15`, color: st.color, fontWeight: 600 }}>
                        {st.label}
                      </span>
                      <span style={{ fontSize: 11, color: 'var(--subtle)' }}>
                        {r.type} • by @{r.users?.username || 'unknown'}
                      </span>
                    </div>
                  </div>
                  <span style={{ fontSize: 11, color: 'var(--subtle)', flexShrink: 0 }}>{formatRelativeTime(r.created_at)}</span>
                </div>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}
