'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Flame, Search, TrendingUp, Clock, CheckCircle, X,
  AlertCircle, HelpCircle, MessageCircle, Zap, Plus
} from 'lucide-react'
import { formatRelativeTime } from '@/lib/utils'

interface Rumor {
  id: string
  anonymous_alias: string
  title: string
  content: string
  category: string
  tags: string[]
  heat_score: number
  created_at: string
  verdict: string | null
  status: string
  rumor_votes: Array<{ vote_type: string }>
  rumor_comments: Array<{ id: string }>
}

const VERDICT_CONFIG = {
  TRUE: { label: 'Confirmed', color: '#22C55E', icon: CheckCircle },
  MISLEADING: { label: 'Misleading', color: '#F97316', icon: AlertCircle },
  FALSE: { label: 'Debunked', color: '#EF4444', icon: X },
  PARTLY_TRUE: { label: 'Partial', color: '#F59E0B', icon: AlertCircle },
  UNPROVEN: { label: 'Unproven', color: '#6B7280', icon: HelpCircle },
}

const CATEGORY_COLORS: Record<string, string> = {
  drama: '#EF4444', politics: '#F59E0B', music: '#A855F7',
  sports: '#22C55E', tech: '#3B82F6', romance: '#EC4899',
  crime: '#F97316', lifestyle: '#6366F1', general: '#6B7280',
}

export default function RumorsClient({ rumors, userId }: { rumors: Rumor[]; userId: string }) {
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [sort, setSort] = useState<'heat' | 'new'>('heat')

  const categories = [...new Set(rumors.map(r => r.category).filter(Boolean))]

  const filtered = rumors
    .filter(r => {
      if (search && !r.title.toLowerCase().includes(search.toLowerCase()) && !r.content.toLowerCase().includes(search.toLowerCase())) return false
      if (selectedCategory && r.category !== selectedCategory) return false
      return true
    })
    .sort((a, b) => sort === 'heat' ? b.heat_score - a.heat_score : new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '32px 16px 80px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.025em', color: 'var(--text)', marginBottom: 4 }}>
            Rumor Mill
          </h1>
          <p style={{ fontSize: 13, color: 'var(--muted)' }}>
            Every story has two sides. What's yours?
          </p>
        </div>
        <Link href="/rumors/new" style={{ textDecoration: 'none' }}>
          <motion.button
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', fontSize: 13, fontWeight: 600 }}
            whileTap={{ scale: 0.96 }}
          >
            <Plus size={15} />
            Drop Intel
          </motion.button>
        </Link>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: 12 }}>
        <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--subtle)' }} />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search rumors..."
          className="input"
          style={{ width: '100%', paddingLeft: 38 }}
        />
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
        {/* Sort buttons */}
        <div style={{ display: 'flex', gap: 4, background: 'var(--bg-elevated)', borderRadius: 'var(--r-md)', padding: 3 }}>
          {(['heat', 'new'] as const).map(s => (
            <button key={s} onClick={() => setSort(s)} style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '5px 12px', fontSize: 12, fontWeight: 500, borderRadius: 'var(--r)',
              border: 'none', cursor: 'pointer', transition: 'all 0.15s',
              background: sort === s ? 'var(--bg-card)' : 'transparent',
              color: sort === s ? 'var(--text)' : 'var(--muted)',
              boxShadow: sort === s ? '0 1px 3px rgba(0,0,0,0.2)' : 'none',
            }}>
              {s === 'heat' ? <TrendingUp size={12} /> : <Clock size={12} />}
              {s === 'heat' ? 'Hot' : 'New'}
            </button>
          ))}
        </div>

        {/* Category filters */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {categories.map(cat => {
            const color = CATEGORY_COLORS[cat] || '#6B7280'
            const isSelected = selectedCategory === cat
            return (
              <button key={cat} onClick={() => setSelectedCategory(isSelected ? null : cat)} style={{
                padding: '5px 12px', fontSize: 11, fontWeight: 500,
                borderRadius: 'var(--r)', border: `1px solid ${isSelected ? color : 'var(--border)'}`,
                background: isSelected ? `${color}15` : 'transparent',
                color: isSelected ? color : 'var(--muted)',
                cursor: 'pointer', transition: 'all 0.15s', textTransform: 'capitalize',
              }}>
                {cat}
              </button>
            )
          })}
        </div>
      </div>

      {/* Rumors list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filtered.map((rumor, i) => {
          const verdict = rumor.verdict ? VERDICT_CONFIG[rumor.verdict as keyof typeof VERDICT_CONFIG] : null
          const VerdictIcon = verdict?.icon
          const catColor = CATEGORY_COLORS[rumor.category] || '#6B7280'
          const isHot = rumor.heat_score > 50
          const isWarm = rumor.heat_score > 20

          return (
            <motion.div
              key={rumor.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30, delay: i * 0.03 }}
            >
              <Link href={`/rumors/${rumor.id}`} style={{ textDecoration: 'none' }}>
                <div className="card card-interactive" style={{ padding: '16px 20px' }}>
                  {/* Meta row */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 500 }}>{rumor.anonymous_alias}</span>
                      <span style={{ color: 'var(--border)' }}>·</span>
                      <span style={{ fontSize: 11, color: 'var(--subtle)' }}>{formatRelativeTime(rumor.created_at)}</span>
                      {rumor.category && (
                        <span style={{
                          fontSize: 10, fontWeight: 600, padding: '2px 8px',
                          borderRadius: 'var(--r-sm)', background: `${catColor}15`,
                          color: catColor, textTransform: 'capitalize',
                        }}>
                          {rumor.category}
                        </span>
                      )}
                    </div>
                    {verdict && VerdictIcon && (
                      <span style={{
                        display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, fontWeight: 600,
                        padding: '3px 8px', borderRadius: 'var(--r-sm)',
                        background: `${verdict.color}15`, color: verdict.color,
                      }}>
                        <VerdictIcon size={10} />{verdict.label}
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h3 style={{
                    fontSize: 15, fontWeight: 600, color: 'var(--text)',
                    marginBottom: 6, lineHeight: 1.4,
                    display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                  }}>
                    {rumor.title}
                  </h3>

                  {/* Content preview */}
                  <p style={{
                    fontSize: 13, color: 'var(--muted)', lineHeight: 1.6,
                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                  }}>
                    {rumor.content}
                  </p>

                  {/* Stats row */}
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 16, marginTop: 12,
                    paddingTop: 12, borderTop: '1px solid var(--border)',
                  }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--subtle)' }}>
                      <Zap size={12} />{rumor.rumor_votes.length} votes
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--subtle)' }}>
                      <MessageCircle size={12} />{rumor.rumor_comments.length} comments
                    </span>
                    <span style={{
                      marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12,
                      color: isHot ? '#EF4444' : isWarm ? '#F59E0B' : 'var(--subtle)',
                      fontWeight: isHot ? 600 : 400,
                    }}>
                      {isHot && <Flame size={12} />}
                      {Math.floor(rumor.heat_score)} heat
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          )
        })}

        {filtered.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              textAlign: 'center', padding: '60px 0',
              color: 'var(--muted)',
            }}
          >
            <HelpCircle size={36} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
            <p style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}>No rumors found</p>
            <p style={{ fontSize: 12, color: 'var(--subtle)' }}>
              {search ? 'Try a different search term' : 'Be the first to drop some intel'}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  )
}
