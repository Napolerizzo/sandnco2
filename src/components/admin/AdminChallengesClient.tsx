'use client'

import { useState } from 'react'
import { Trophy, Users, Clock, Award, XCircle, Play, Pause, DollarSign } from 'lucide-react'
import { formatRelativeTime, formatCurrency } from '@/lib/utils'

interface Challenge {
  id: string
  title: string
  description?: string
  category: string
  entry_fee: number
  prize_pool: number
  status: string
  participant_count: number
  max_players?: number
  starts_at?: string
  ends_at?: string
  created_at: string
  created_by?: string
  winner_id?: string
  users?: { username: string; display_name?: string } | null
}

const STATUS_MAP: Record<string, { color: string; label: string }> = {
  created: { color: '#6B7280', label: 'Draft' },
  waiting_for_players: { color: '#F59E0B', label: 'Waiting' },
  active: { color: '#22C55E', label: 'Active' },
  judging: { color: '#A855F7', label: 'Judging' },
  completed: { color: '#3B82F6', label: 'Completed' },
  cancelled: { color: '#EF4444', label: 'Cancelled' },
}

export default function AdminChallengesClient({ active, completed }: { active: Challenge[]; completed: Challenge[] }) {
  const [tab, setTab] = useState<'active' | 'completed'>('active')
  const challenges = tab === 'active' ? active : completed

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.02em', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Trophy size={20} style={{ color: 'var(--primary)' }} />
          Challenges
        </h1>
        <p style={{ fontSize: 13, color: 'var(--muted)' }}>Monitor and manage platform challenges</p>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Active', value: active.filter(c => c.status === 'active').length, color: '#22C55E' },
          { label: 'Waiting', value: active.filter(c => c.status === 'waiting_for_players').length, color: '#F59E0B' },
          { label: 'Judging', value: active.filter(c => c.status === 'judging').length, color: '#A855F7' },
          { label: 'Total Prize Pool', value: `₹${active.reduce((s, c) => s + Number(c.prize_pool || 0), 0).toLocaleString()}`, color: '#FBBF24' },
        ].map(({ label, value, color }) => (
          <div key={label} className="glass" style={{ borderRadius: 12, padding: '14px 16px' }}>
            <p style={{ fontSize: 22, fontWeight: 700, color, margin: '0 0 2px', fontFamily: 'var(--font-mono)' }}>{value}</p>
            <p style={{ fontSize: 11, color: 'var(--muted)', margin: 0 }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, borderRadius: 10, padding: 3, marginBottom: 16 }} className="neu-inset">
        {[
          { id: 'active' as const, label: `Active (${active.length})` },
          { id: 'completed' as const, label: `History (${completed.length})` },
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

      {/* Challenge list */}
      {challenges.length === 0 ? (
        <div className="glass" style={{ textAlign: 'center', padding: '60px 0', borderRadius: 14, color: 'var(--muted)' }}>
          <Trophy size={32} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
          <p style={{ fontSize: 14 }}>No {tab} challenges</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {challenges.map(c => {
            const st = STATUS_MAP[c.status] || STATUS_MAP.created
            return (
              <div key={c.id} className="glass" style={{ borderRadius: 14, padding: '18px 22px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <span style={{
                        fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 6,
                        background: `${st.color}15`, color: st.color, textTransform: 'uppercase', letterSpacing: '0.04em',
                      }}>{st.label}</span>
                      <span style={{ fontSize: 11, color: 'var(--subtle)' }}>{c.category}</span>
                      <span style={{ fontSize: 11, color: 'var(--subtle)' }}>{formatRelativeTime(c.created_at)}</span>
                    </div>
                    <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', margin: '0 0 6px' }}>{c.title}</h3>
                    {c.description && (
                      <p style={{ fontSize: 13, color: 'var(--muted)', margin: 0, maxHeight: 40, overflow: 'hidden', lineHeight: 1.5 }}>
                        {c.description}
                      </p>
                    )}
                    {c.users && (
                      <p style={{ fontSize: 12, color: 'var(--subtle)', marginTop: 6 }}>
                        Created by @{c.users.username}
                      </p>
                    )}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end', flexShrink: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <DollarSign size={13} style={{ color: '#FBBF24' }} />
                      <span style={{ fontSize: 15, fontWeight: 700, color: '#FBBF24', fontFamily: 'var(--font-mono)' }}>
                        ₹{Number(c.prize_pool || 0).toLocaleString()}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Users size={12} style={{ color: 'var(--subtle)' }} />
                      <span style={{ fontSize: 12, color: 'var(--muted)' }}>
                        {c.participant_count}{c.max_players ? `/${c.max_players}` : ''}
                      </span>
                    </div>
                    {c.entry_fee > 0 && (
                      <span style={{ fontSize: 11, color: 'var(--subtle)', fontFamily: 'var(--font-mono)' }}>
                        Entry: ₹{c.entry_fee}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
