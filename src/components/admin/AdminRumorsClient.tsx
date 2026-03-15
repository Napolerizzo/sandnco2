'use client'

import { useState } from 'react'
import { Flame, CheckCircle, XCircle, Brain, Eye, AlertTriangle, Loader } from 'lucide-react'
import { formatRelativeTime } from '@/lib/utils'
import toast from 'react-hot-toast'

interface Rumor {
  id: string
  title: string
  content: string
  category: string
  status: string
  verdict: string | null
  verdict_reason: string | null
  heat_score: number
  view_count: number
  is_anonymous: boolean
  anonymous_alias: string
  city: string | null
  created_at: string
}

const VERDICT_COLORS: Record<string, { bg: string; color: string }> = {
  TRUE: { bg: 'var(--success-dim)', color: '#86efac' },
  FALSE: { bg: 'var(--danger-dim)', color: '#fca5a5' },
  MISLEADING: { bg: 'var(--warning-dim)', color: '#fcd34d' },
  PARTLY_TRUE: { bg: 'rgba(59,130,246,0.12)', color: '#93c5fd' },
  UNPROVEN: { bg: 'var(--bg-elevated)', color: 'var(--muted)' },
}

const CATEGORY_COLORS: Record<string, string> = {
  drama: '#F472B6', politics: '#EF4444', crime: '#DC2626',
  sports: '#22C55E', tech: '#3B82F6', romance: '#EC4899',
  music: '#A855F7', lifestyle: '#F59E0B', general: '#6B7280',
}

export default function AdminRumorsClient({ pending, active }: { pending: Rumor[]; active: Rumor[] }) {
  const [tab, setTab] = useState<'pending' | 'active'>('pending')
  const [acting, setActing] = useState<string | null>(null)
  const [aiResults, setAiResults] = useState<Record<string, { verdict: string; confidence: number; reasoning: string; summary: string }>>({})
  const [expanded, setExpanded] = useState<string | null>(null)

  const handleAction = async (rumorId: string, action: string, extraData?: Record<string, string>) => {
    setActing(rumorId)
    const res = await fetch('/api/admin/rumors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rumorId, action, ...extraData }),
    })
    const data = await res.json()
    if (data.success) {
      if (action === 'ai_verify' && data.verdict) {
        setAiResults(prev => ({ ...prev, [rumorId]: data.verdict }))
        toast.success(`AI Verdict: ${data.verdict.verdict} (${Math.round(data.verdict.confidence * 100)}%)`)
      } else {
        toast.success(action === 'approve' ? 'Rumor approved' : action === 'reject' ? 'Rumor removed' : 'Action complete')
        setTimeout(() => window.location.reload(), 1000)
      }
    } else {
      toast.error(data.error || 'Action failed')
    }
    setActing(null)
  }

  const tabs = [
    { id: 'pending' as const, label: `Pending (${pending.length})` },
    { id: 'active' as const, label: `Active (${active.length})` },
  ]

  const rumors = tab === 'pending' ? pending : active

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.02em', marginBottom: 2, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Flame size={20} style={{ color: '#F59E0B' }} />
          Rumors
        </h1>
        <p style={{ fontSize: 13, color: 'var(--muted)' }}>Review, approve, and AI-verify rumors</p>
      </div>

      {/* AI Bulk Verify */}
      <div style={{
        background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.25)',
        borderRadius: 10, padding: '14px 18px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <Brain size={16} style={{ color: '#C084FC', flexShrink: 0 }} />
        <span style={{ fontSize: 12, color: '#C084FC', flex: 1 }}>
          AI auto-verification is available. Click the brain icon on any rumor to get an AI analysis.
        </span>
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

      {/* Rumors list */}
      {rumors.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px 0', color: 'var(--muted)' }}>
          <Flame size={32} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
          <p style={{ fontSize: 14 }}>No {tab} rumors</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {rumors.map(r => {
            const aiResult = aiResults[r.id]
            const catColor = CATEGORY_COLORS[r.category] || '#6B7280'
            const isExpanded = expanded === r.id

            return (
              <div key={r.id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '16px 20px' }}>
                  {/* Header */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span style={{
                          fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 4,
                          background: `${catColor}15`, color: catColor, textTransform: 'uppercase',
                        }}>
                          {r.category}
                        </span>
                        {r.city && <span style={{ fontSize: 11, color: 'var(--subtle)' }}>{r.city}</span>}
                        <span style={{ fontSize: 11, color: 'var(--subtle)' }}>{formatRelativeTime(r.created_at)}</span>
                      </div>
                      <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>{r.title}</h3>
                      <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.5, maxHeight: isExpanded ? 'none' : 60, overflow: 'hidden' }}>
                        {r.content}
                      </p>
                      {r.content.length > 150 && (
                        <button onClick={() => setExpanded(isExpanded ? null : r.id)} style={{
                          background: 'none', border: 'none', color: 'var(--primary)', fontSize: 12,
                          cursor: 'pointer', padding: '4px 0', fontFamily: 'var(--font)',
                        }}>
                          {isExpanded ? 'Show less' : 'Show more'}
                        </button>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 12, flexShrink: 0 }}>
                      <span style={{ fontSize: 11, color: 'var(--subtle)', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Eye size={12} /> {r.view_count}
                      </span>
                      <span style={{ fontSize: 11, color: '#F59E0B', fontWeight: 600 }}>
                        {r.heat_score?.toFixed(1)}
                      </span>
                    </div>
                  </div>

                  {/* Verdict badge */}
                  {(r.verdict || aiResult) && (
                    <div style={{
                      background: VERDICT_COLORS[aiResult?.verdict || r.verdict || 'UNPROVEN']?.bg || 'var(--bg-elevated)',
                      border: '1px solid var(--border)',
                      borderRadius: 8, padding: '10px 14px', marginBottom: 10,
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                        <Brain size={13} style={{ color: '#C084FC' }} />
                        <span style={{
                          fontSize: 12, fontWeight: 700,
                          color: VERDICT_COLORS[aiResult?.verdict || r.verdict || 'UNPROVEN']?.color || 'var(--muted)',
                        }}>
                          {aiResult?.verdict || r.verdict}
                          {aiResult && <span style={{ fontWeight: 400, marginLeft: 6 }}>({Math.round(aiResult.confidence * 100)}% confidence)</span>}
                        </span>
                      </div>
                      <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.5 }}>
                        {aiResult?.reasoning || r.verdict_reason}
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {tab === 'pending' && (
                      <>
                        <button
                          onClick={() => handleAction(r.id, 'approve')}
                          disabled={acting === r.id}
                          className="btn btn-sm"
                          style={{ background: 'var(--success-dim)', color: '#86efac', border: '1px solid rgba(34,197,94,0.3)', fontSize: 12 }}
                        >
                          <CheckCircle size={13} /> Approve
                        </button>
                        <button
                          onClick={() => handleAction(r.id, 'reject')}
                          disabled={acting === r.id}
                          className="btn btn-sm btn-danger"
                          style={{ fontSize: 12 }}
                        >
                          <XCircle size={13} /> Reject
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => handleAction(r.id, 'ai_verify')}
                      disabled={acting === r.id}
                      className="btn btn-sm"
                      style={{ background: 'rgba(168,85,247,0.1)', color: '#C084FC', border: '1px solid rgba(168,85,247,0.3)', fontSize: 12 }}
                    >
                      {acting === r.id ? <Loader size={13} className="animate-spin" /> : <Brain size={13} />}
                      AI Verify
                    </button>
                    {tab === 'active' && !r.verdict && (
                      <>
                        {['TRUE', 'FALSE', 'MISLEADING', 'PARTLY_TRUE', 'UNPROVEN'].map(v => (
                          <button
                            key={v}
                            onClick={() => handleAction(r.id, 'set_verdict', { verdict: v })}
                            disabled={acting === r.id}
                            className="btn btn-sm"
                            style={{
                              background: VERDICT_COLORS[v]?.bg, color: VERDICT_COLORS[v]?.color,
                              border: '1px solid var(--border)', fontSize: 11, padding: '4px 8px',
                            }}
                          >
                            {v.replace(/_/g, ' ')}
                          </button>
                        ))}
                      </>
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
