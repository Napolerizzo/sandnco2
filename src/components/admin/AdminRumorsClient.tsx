'use client'

import { useState } from 'react'
import { Flame, CheckCircle, XCircle, Brain, Eye, AlertTriangle, Loader, ChevronDown, ChevronUp } from 'lucide-react'
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

const VERDICT_COLORS: Record<string, { bg: string; color: string; border: string }> = {
  TRUE: { bg: 'rgba(34,197,94,0.1)', color: '#86EFAC', border: 'rgba(34,197,94,0.25)' },
  FALSE: { bg: 'rgba(239,68,68,0.1)', color: '#FCA5A5', border: 'rgba(239,68,68,0.25)' },
  MISLEADING: { bg: 'rgba(245,158,11,0.1)', color: '#FCD34D', border: 'rgba(245,158,11,0.25)' },
  PARTLY_TRUE: { bg: 'rgba(59,130,246,0.1)', color: '#93C5FD', border: 'rgba(59,130,246,0.25)' },
  UNPROVEN: { bg: 'rgba(255,255,255,0.04)', color: 'var(--muted)', border: 'rgba(255,255,255,0.06)' },
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

  const rumors = tab === 'pending' ? pending : active

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.02em', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Flame size={20} style={{ color: '#F59E0B' }} />
          Rumors
        </h1>
        <p style={{ fontSize: 13, color: 'var(--muted)' }}>Review, approve, and AI-verify rumors</p>
      </div>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Pending Review', value: pending.length, color: '#F59E0B' },
          { label: 'Active Rumors', value: active.length, color: '#22C55E' },
          { label: 'With Verdicts', value: active.filter(r => r.verdict).length, color: '#A855F7' },
        ].map(({ label, value, color }) => (
          <div key={label} className="glass" style={{ borderRadius: 12, padding: '14px 16px' }}>
            <p style={{ fontSize: 22, fontWeight: 700, color, margin: '0 0 2px', fontFamily: 'var(--font-mono)' }}>{value}</p>
            <p style={{ fontSize: 11, color: 'var(--muted)', margin: 0 }}>{label}</p>
          </div>
        ))}
      </div>

      {/* AI Info Banner */}
      <div className="glass" style={{
        borderRadius: 12, padding: '14px 18px', marginBottom: 20,
        display: 'flex', alignItems: 'center', gap: 12,
        borderLeft: '3px solid #A855F7',
      }}>
        <div style={{
          width: 34, height: 34, borderRadius: 10,
          background: 'rgba(168,85,247,0.12)', border: '1px solid rgba(168,85,247,0.25)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <Brain size={15} style={{ color: '#C084FC' }} />
        </div>
        <span style={{ fontSize: 12, color: 'var(--muted)' }}>
          AI auto-verification is available. Click the <strong style={{ color: '#C084FC' }}>AI Verify</strong> button on any rumor to get an AI analysis.
        </span>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, borderRadius: 10, padding: 3, marginBottom: 16 }} className="neu-inset">
        {[
          { id: 'pending' as const, label: `Pending (${pending.length})` },
          { id: 'active' as const, label: `Active (${active.length})` },
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

      {/* Rumors list */}
      {rumors.length === 0 ? (
        <div className="glass" style={{ textAlign: 'center', padding: '60px 0', borderRadius: 14, color: 'var(--muted)' }}>
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
              <div key={r.id} className="glass" style={{ borderRadius: 14, padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '18px 22px' }}>
                  {/* Header */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                        <span style={{
                          fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 6,
                          background: `${catColor}15`, color: catColor, textTransform: 'uppercase', letterSpacing: '0.04em',
                        }}>
                          {r.category}
                        </span>
                        {r.city && <span style={{ fontSize: 11, color: 'var(--subtle)' }}>{r.city}</span>}
                        <span style={{ fontSize: 11, color: 'var(--subtle)' }}>{formatRelativeTime(r.created_at)}</span>
                      </div>
                      <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', margin: '0 0 6px' }}>{r.title}</h3>
                      <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.6, margin: 0, maxHeight: isExpanded ? 'none' : 60, overflow: 'hidden' }}>
                        {r.content}
                      </p>
                      {r.content.length > 150 && (
                        <button onClick={() => setExpanded(isExpanded ? null : r.id)} style={{
                          background: 'none', border: 'none', color: 'var(--primary)', fontSize: 12,
                          cursor: 'pointer', padding: '4px 0', fontFamily: 'var(--font)',
                          display: 'flex', alignItems: 'center', gap: 4,
                        }}>
                          {isExpanded ? <><ChevronUp size={12} /> Show less</> : <><ChevronDown size={12} /> Show more</>}
                        </button>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginLeft: 16, flexShrink: 0 }}>
                      <span style={{ fontSize: 11, color: 'var(--subtle)', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Eye size={12} /> {r.view_count}
                      </span>
                      <span style={{ fontSize: 13, color: '#F59E0B', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                        {r.heat_score?.toFixed(1)}
                      </span>
                    </div>
                  </div>

                  {/* Verdict badge */}
                  {(r.verdict || aiResult) && (() => {
                    const v = VERDICT_COLORS[aiResult?.verdict || r.verdict || 'UNPROVEN'] || VERDICT_COLORS.UNPROVEN
                    return (
                      <div className="neu-inset" style={{
                        borderRadius: 10, padding: '12px 16px', marginBottom: 12,
                        borderLeft: `3px solid ${v.color}`,
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                          <Brain size={13} style={{ color: '#C084FC' }} />
                          <span style={{ fontSize: 12, fontWeight: 700, color: v.color }}>
                            {aiResult?.verdict || r.verdict}
                          </span>
                          {aiResult && (
                            <span style={{ fontSize: 11, color: 'var(--subtle)', fontFamily: 'var(--font-mono)' }}>
                              {Math.round(aiResult.confidence * 100)}% confidence
                            </span>
                          )}
                        </div>
                        <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.5, margin: 0 }}>
                          {aiResult?.reasoning || r.verdict_reason}
                        </p>
                      </div>
                    )
                  })()}

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {tab === 'pending' && (
                      <>
                        <button
                          onClick={() => handleAction(r.id, 'approve')}
                          disabled={acting === r.id}
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
                          onClick={() => handleAction(r.id, 'reject')}
                          disabled={acting === r.id}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 5, padding: '7px 14px',
                            fontSize: 12, fontWeight: 600, borderRadius: 8, cursor: 'pointer',
                            background: 'rgba(239,68,68,0.12)', color: '#FCA5A5',
                            border: '1px solid rgba(239,68,68,0.25)',
                          }}
                        >
                          <XCircle size={13} /> Reject
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => handleAction(r.id, 'ai_verify')}
                      disabled={acting === r.id}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 5, padding: '7px 14px',
                        fontSize: 12, fontWeight: 600, borderRadius: 8, cursor: 'pointer',
                        background: 'rgba(168,85,247,0.12)', color: '#C084FC',
                        border: '1px solid rgba(168,85,247,0.25)',
                      }}
                    >
                      {acting === r.id ? <Loader size={13} className="animate-spin" /> : <Brain size={13} />}
                      AI Verify
                    </button>
                    {tab === 'active' && !r.verdict && (
                      <>
                        {['TRUE', 'FALSE', 'MISLEADING', 'PARTLY_TRUE', 'UNPROVEN'].map(v => {
                          const vc = VERDICT_COLORS[v] || VERDICT_COLORS.UNPROVEN
                          return (
                            <button
                              key={v}
                              onClick={() => handleAction(r.id, 'set_verdict', { verdict: v })}
                              disabled={acting === r.id}
                              style={{
                                padding: '5px 10px', fontSize: 11, fontWeight: 600, borderRadius: 6,
                                cursor: 'pointer', background: vc.bg, color: vc.color,
                                border: `1px solid ${vc.border}`,
                              }}
                            >
                              {v.replace(/_/g, ' ')}
                            </button>
                          )
                        })}
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
