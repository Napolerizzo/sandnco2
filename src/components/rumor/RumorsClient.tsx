'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Flame, Search, TrendingUp, Clock, CheckCircle, X,
  AlertCircle, HelpCircle, Terminal, Hash, MessageCircle, Zap
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
  TRUE: { label: 'CONFIRMED', color: 'var(--green)', icon: CheckCircle },
  MISLEADING: { label: 'MISLEADING', color: '#f97316', icon: AlertCircle },
  FALSE: { label: 'DEBUNKED', color: 'var(--red)', icon: X },
  PARTLY_TRUE: { label: 'PARTIAL', color: '#fbbf24', icon: AlertCircle },
  UNPROVEN: { label: 'UNPROVEN', color: 'var(--text-dim)', icon: HelpCircle },
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
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="text-[9px] text-[var(--text-dim)] tracking-[0.3em] uppercase mb-1">
            // INTEL_DATABASE
          </div>
          <h1 className="text-2xl font-extrabold text-glow-cyan uppercase tracking-wider">
            RUMOR_MILL
          </h1>
          <p className="text-[10px] text-[var(--text-dim)] mt-1 tracking-wider">
            EVERY_STORY_HAS_TWO_SIDES. WHAT&apos;S_YOURS?
          </p>
        </div>
        <Link href="/rumors/new">
          <motion.button className="btn-execute px-4 py-2 text-[10px] flex items-center gap-2" whileTap={{ scale: 0.95 }}>
            <Flame className="w-3.5 h-3.5" />DROP_INTEL
          </motion.button>
        </Link>
      </div>

      {/* Search + filters */}
      <div className="space-y-3 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--text-dim)]" />
          <input
            type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="SEARCH_RUMORS..."
            className="input-terminal w-full pl-10 pr-4 py-3 text-xs"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1">
            <button onClick={() => setSort('heat')}
              className={`flex items-center gap-1 px-3 py-1.5 text-[10px] tracking-[0.1em] border transition-all ${
                sort === 'heat'
                  ? 'text-[var(--cyan)] border-[var(--cyan-border)] bg-[var(--cyan-ghost)]'
                  : 'text-[var(--text-dim)] border-[var(--cyan-border)]'
              }`}>
              <TrendingUp className="w-3 h-3" />HOT
            </button>
            <button onClick={() => setSort('new')}
              className={`flex items-center gap-1 px-3 py-1.5 text-[10px] tracking-[0.1em] border transition-all ${
                sort === 'new'
                  ? 'text-[var(--cyan)] border-[var(--cyan-border)] bg-[var(--cyan-ghost)]'
                  : 'text-[var(--text-dim)] border-[var(--cyan-border)]'
              }`}>
              <Clock className="w-3 h-3" />NEW
            </button>
          </div>

          {categories.map(cat => (
            <button key={cat} onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
              className={`px-3 py-1.5 text-[10px] tracking-[0.1em] border transition-all uppercase ${
                selectedCategory === cat
                  ? 'text-[var(--cyan)] border-[var(--cyan-border)] bg-[var(--cyan-ghost)]'
                  : 'text-[var(--text-dim)] border-[var(--cyan-border)] hover:bg-[var(--cyan-ghost)]'
              }`}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Rumors list */}
      <div className="space-y-3">
        {filtered.map((rumor, i) => {
          const verdict = rumor.verdict ? VERDICT_CONFIG[rumor.verdict as keyof typeof VERDICT_CONFIG] : null
          const VerdictIcon = verdict?.icon
          const heatLevel = rumor.heat_score > 50 ? 'hot' : rumor.heat_score > 20 ? 'warm' : 'cold'

          return (
            <motion.div key={rumor.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <Link href={`/rumors/${rumor.id}`}>
                <div className="terminal group cursor-pointer hover:border-[var(--cyan)] transition-colors">
                  <div className="terminal-body">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[9px] text-[var(--text-dim)] tracking-wider">{rumor.anonymous_alias}</span>
                        <span className="text-[var(--text-ghost)]">·</span>
                        <span className="text-[9px] text-[var(--text-ghost)]">{formatRelativeTime(rumor.created_at)}</span>
                        {rumor.category && (
                          <span className="text-[8px] text-[var(--text-dim)] border border-[var(--cyan-border)] px-2 py-0.5 tracking-wider uppercase">
                            {rumor.category}
                          </span>
                        )}
                      </div>
                      {verdict && VerdictIcon && (
                        <span className="flex items-center gap-1 text-[9px] font-bold tracking-wider px-2 py-1 border uppercase"
                          style={{ color: verdict.color, borderColor: verdict.color }}>
                          <VerdictIcon className="w-3 h-3" />{verdict.label}
                        </span>
                      )}
                    </div>

                    <h3 className="font-bold text-white text-sm mb-1.5 group-hover:text-[var(--cyan)] transition-colors line-clamp-1 uppercase tracking-wide">
                      {rumor.title}
                    </h3>
                    <p className="text-[var(--text-dim)] text-[11px] line-clamp-2 leading-relaxed">{rumor.content}</p>

                    <div className="flex items-center gap-4 mt-3 pt-3 border-t border-[var(--cyan-border)] text-[9px] text-[var(--text-dim)]">
                      <span className="flex items-center gap-1">
                        <Zap className="w-3 h-3" />{rumor.rumor_votes.length} VOTES
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle className="w-3 h-3" />{rumor.rumor_comments.length} COMMENTS
                      </span>
                      <span className="ml-auto" style={{ color: heatLevel === 'hot' ? 'var(--red)' : heatLevel === 'warm' ? '#fbbf24' : 'var(--text-dim)' }}>
                        {heatLevel === 'hot' && <Flame className="w-3 h-3 inline mr-1" />}
                        HEAT: {Math.floor(rumor.heat_score)}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          )
        })}

        {filtered.length === 0 && (
          <div className="terminal">
            <div className="terminal-header">
              <div className="terminal-dots"><span /><span /><span /></div>
              <div className="terminal-title">
                <Terminal className="w-3 h-3" /> NO_RESULTS
              </div>
            </div>
            <div className="terminal-body text-center py-12">
              <HelpCircle className="w-8 h-8 mx-auto mb-3 text-[var(--text-dim)] opacity-30" />
              <p className="text-[var(--text-dim)] text-xs tracking-wider">NO_RUMORS_MATCH_YOUR_QUERY.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
