'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Flame, Search, Filter, TrendingUp, Clock, CheckCircle, X, AlertCircle, HelpCircle } from 'lucide-react'
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
  TRUE: { label: 'TRUE', color: '#22c55e', icon: CheckCircle },
  MISLEADING: { label: 'MISLEADING', color: '#f97316', icon: AlertCircle },
  FALSE: { label: 'FALSE', color: '#ef4444', icon: X },
  PARTLY_TRUE: { label: 'PARTLY TRUE', color: '#eab308', icon: AlertCircle },
  UNPROVEN: { label: 'UNPROVEN', color: '#6b7280', icon: HelpCircle },
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
          <h1 className="font-display text-4xl text-gradient-gold" style={{ fontFamily: "'Bebas Neue', cursive" }}>
            RUMOR MILL
          </h1>
          <p className="text-zinc-500 font-mono text-xs mt-1">Every story has two sides. What&apos;s yours?</p>
        </div>
        <Link href="/rumors/new">
          <motion.button className="btn-primary px-4 py-2 rounded-xl text-xs flex items-center gap-2" whileTap={{ scale: 0.95 }}>
            <Flame className="w-4 h-4" />DROP ONE
          </motion.button>
        </Link>
      </div>

      {/* Search + filters */}
      <div className="space-y-3 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search the rumors..."
            className="input-cyber w-full rounded-xl pl-10 pr-4 py-3 text-sm"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 bg-white/5 rounded-full p-1">
            <button onClick={() => setSort('heat')}
              className={`px-3 py-1 rounded-full text-xs font-tech transition-all ${sort === 'heat' ? 'bg-yellow-400 text-black' : 'text-zinc-400'}`}>
              <TrendingUp className="w-3 h-3 inline mr-1" />HOT
            </button>
            <button onClick={() => setSort('new')}
              className={`px-3 py-1 rounded-full text-xs font-tech transition-all ${sort === 'new' ? 'bg-yellow-400 text-black' : 'text-zinc-400'}`}>
              <Clock className="w-3 h-3 inline mr-1" />NEW
            </button>
          </div>

          {categories.map(cat => (
            <button key={cat} onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-mono transition-all ${
                selectedCategory === cat ? 'bg-yellow-400 text-black' : 'bg-white/5 text-zinc-400 border border-white/5'
              }`}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Rumors grid */}
      <div className="space-y-4">
        {filtered.map((rumor, i) => {
          const verdict = rumor.verdict ? VERDICT_CONFIG[rumor.verdict as keyof typeof VERDICT_CONFIG] : null
          const VerdictIcon = verdict?.icon

          return (
            <motion.div key={rumor.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <Link href={`/rumors/${rumor.id}`}>
                <div className="card-dark p-5 cursor-pointer group">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs text-zinc-500">{rumor.anonymous_alias}</span>
                      <span className="text-zinc-700">•</span>
                      <span className="font-mono text-xs text-zinc-600">{formatRelativeTime(rumor.created_at)}</span>
                      {rumor.category && (
                        <span className="bg-white/5 text-zinc-500 text-xs font-mono px-2 py-0.5 rounded-full">
                          {rumor.category}
                        </span>
                      )}
                    </div>
                    {verdict && VerdictIcon && (
                      <span className="flex items-center gap-1 text-xs font-tech px-2 py-1 rounded-full border"
                        style={{ color: verdict.color, borderColor: `${verdict.color}40`, background: `${verdict.color}15` }}>
                        <VerdictIcon className="w-3 h-3" />{verdict.label}
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-white text-sm mb-2 group-hover:text-yellow-400 transition-colors line-clamp-1">
                    {rumor.title}
                  </h3>
                  <p className="text-zinc-400 text-xs font-mono line-clamp-2 leading-relaxed">{rumor.content}</p>

                  <div className="flex items-center gap-4 mt-4 text-xs font-mono text-zinc-600">
                    <span>{rumor.rumor_votes.length} votes</span>
                    <span>{rumor.rumor_comments.length} comments</span>
                    <span className="text-orange-400/70 ml-auto">heat: {Math.floor(rumor.heat_score)}</span>
                  </div>
                </div>
              </Link>
            </motion.div>
          )
        })}

        {filtered.length === 0 && (
          <div className="text-center py-20 text-zinc-600 font-mono">
            <HelpCircle className="w-10 h-10 mx-auto mb-3 opacity-20" />
            <p>No rumors match your search.</p>
          </div>
        )}
      </div>
    </div>
  )
}
