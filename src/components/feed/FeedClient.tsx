'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import {
  Flame, Plus, TrendingUp, Clock, MessageCircle,
  Zap, Crown, Activity, ChevronRight
} from 'lucide-react'
import { formatRelativeTime, formatNumber } from '@/lib/utils'
import { RANKS, type RankTier } from '@/lib/ranks'

interface Rumor {
  id: string
  anonymous_alias: string
  title: string
  content: string
  category: string
  heat_score: number
  created_at: string
  rumor_votes: Array<{ vote_type: string }>
  rumor_comments: Array<{ id: string }>
}

interface Profile {
  username: string
  display_name: string
  rank: RankTier
  xp: number
  is_premium: boolean
  wallet_balance: number
}

export default function FeedClient({
  initialRumors,
  profile,
  userId,
}: {
  initialRumors: Rumor[]
  profile: Profile | null
  userId: string
}) {
  const [filter, setFilter] = useState<'hot' | 'new' | 'trending'>('hot')
  const [rumors] = useState(initialRumors)
  const rank = profile ? RANKS[profile.rank] : null

  const sorted = [...rumors].sort((a, b) => {
    if (filter === 'new') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    return b.heat_score - a.heat_score
  })

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8">

        {/* ── MAIN FEED ── */}
        <div>
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="text-xs text-cyan-400/50 tracking-[0.35em] uppercase font-mono mb-1">// Live Feed</p>
              <h1 className="text-3xl font-black uppercase tracking-tight text-white">City Feed</h1>
              <p className="text-gray-500 text-sm mt-1">What&apos;s burning in the streets</p>
            </div>
            <Link href="/rumors/new">
              <motion.button
                className="flex items-center gap-2 px-5 py-3 bg-cyan-400 text-black text-sm font-bold hover:bg-cyan-300 transition-all tracking-wide"
                whileTap={{ scale: 0.97 }}
              >
                <Plus className="w-4 h-4" />
                Drop Rumor
              </motion.button>
            </Link>
          </div>

          {/* Filters */}
          <div className="flex gap-2 mb-6">
            {[
              { id: 'hot', icon: Flame, label: 'Hot' },
              { id: 'new', icon: Clock, label: 'New' },
              { id: 'trending', icon: TrendingUp, label: 'Trending' },
            ].map(({ id, icon: Icon, label }) => (
              <button
                key={id}
                onClick={() => setFilter(id as typeof filter)}
                className={`flex items-center gap-2 px-4 py-2 text-sm transition-all border font-mono tracking-wide ${
                  filter === id
                    ? 'text-cyan-400 border-cyan-400/40 bg-cyan-400/8'
                    : 'text-gray-500 border-white/8 hover:border-white/15 hover:text-gray-300'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            ))}
          </div>

          {/* Cards */}
          <div className="space-y-3">
            <AnimatePresence>
              {sorted.map((rumor, i) => (
                <RumorCard key={rumor.id} rumor={rumor} index={i} />
              ))}
            </AnimatePresence>

            {sorted.length === 0 && (
              <div className="py-24 text-center border border-white/[0.06] bg-[#050a0e]">
                <Flame className="w-10 h-10 mx-auto mb-4 text-gray-700" />
                <p className="text-gray-500 text-base mb-2">The city is quiet... for now.</p>
                <p className="text-gray-700 text-sm mb-6">Be the first to drop a rumor.</p>
                <Link href="/rumors/new">
                  <button className="px-6 py-3 bg-cyan-400 text-black text-sm font-bold hover:bg-cyan-300 transition-all">
                    Drop the First Rumor
                  </button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* ── SIDEBAR ── */}
        <div className="space-y-5">
          {/* Agent status */}
          {profile && rank && (
            <motion.div
              className="bg-[#050a0e] border border-white/[0.08] p-5"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
            >
              <p className="text-xs text-gray-600 tracking-[0.3em] uppercase font-mono mb-4">Agent Status</p>

              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">{rank.emoji}</span>
                <div>
                  <span
                    className="inline-block text-xs font-bold uppercase tracking-wider px-2 py-1 border font-mono"
                    style={{ color: rank.color, borderColor: `${rank.color}35`, background: `${rank.color}10` }}
                  >
                    {rank.label}
                  </span>
                  <p className="text-gray-500 text-xs mt-1 font-mono">{profile.xp.toLocaleString()} XP</p>
                </div>
              </div>

              {/* XP bar */}
              <div className="mb-4">
                <div className="h-1.5 bg-white/[0.06] overflow-hidden">
                  <motion.div
                    className="h-full"
                    style={{ background: rank.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, (profile.xp / 500) * 100)}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                  />
                </div>
                <p className="text-xs text-gray-700 mt-1 font-mono text-right">Next rank</p>
              </div>

              <Link href={`/profile/${profile.username}`}>
                <button className="w-full py-2.5 text-sm text-gray-400 border border-white/10 hover:border-cyan-400/40 hover:text-cyan-400 transition-all tracking-wide">
                  View Profile
                </button>
              </Link>
            </motion.div>
          )}

          {/* Quick links */}
          <div className="bg-[#050a0e] border border-white/[0.08] p-5">
            <p className="text-xs text-gray-600 tracking-[0.3em] uppercase font-mono mb-4">Quick Access</p>
            <div className="space-y-1">
              {[
                { href: '/rumors/new', icon: Flame, label: 'Drop a Rumor', color: '#ff3366' },
                { href: '/challenges', icon: Crown, label: 'Enter a Challenge', color: '#fbbf24' },
                { href: '/leaderboard', icon: TrendingUp, label: 'Leaderboard', color: '#00fff5' },
              ].map(({ href, icon: Icon, label, color }) => (
                <Link key={href} href={href}>
                  <div
                    className="flex items-center gap-3 px-3 py-2.5 hover:bg-white/[0.04] transition-all text-sm text-gray-500 hover:text-gray-200 group"
                    style={{}}
                  >
                    <Icon className="w-4 h-4" style={{ color }} />
                    <span>{label}</span>
                    <ChevronRight className="w-3.5 h-3.5 ml-auto opacity-0 group-hover:opacity-60 transition-opacity" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function RumorCard({ rumor, index }: { rumor: Rumor; index: number }) {
  const believeVotes = rumor.rumor_votes?.filter(v => v.vote_type === 'believe').length ?? 0
  const doubtVotes = rumor.rumor_votes?.filter(v => v.vote_type === 'doubt').length ?? 0
  const totalVotes = rumor.rumor_votes?.length ?? 0
  const commentCount = rumor.rumor_comments?.length ?? 0

  const heatLevel = rumor.heat_score > 50 ? 'hot' : rumor.heat_score > 20 ? 'warm' : 'cold'
  const heatColor = heatLevel === 'hot' ? '#ff3366' : heatLevel === 'warm' ? '#fbbf24' : '#374151'

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
    >
      <Link href={`/rumors/${rumor.id}`}>
        <div className="relative bg-[#050a0e] border border-white/[0.08] p-5 hover:border-cyan-400/25 transition-all group cursor-pointer">
          {/* Heat bar */}
          <div
            className="absolute top-0 left-0 h-0.5 transition-all"
            style={{
              background: `linear-gradient(90deg, ${heatColor}, transparent)`,
              width: `${Math.min(100, rumor.heat_score)}%`,
            }}
          />

          {/* Meta row */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span className="text-gray-400 font-mono">{rumor.anonymous_alias}</span>
              <span className="text-gray-700">·</span>
              <span>{formatRelativeTime(rumor.created_at)}</span>
              {rumor.category && (
                <span className="text-xs bg-cyan-400/5 border border-cyan-400/15 px-2 py-0.5 text-cyan-400/60 font-mono uppercase tracking-wider">
                  {rumor.category}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-sm font-mono font-bold" style={{ color: heatColor }}>
              {heatLevel === 'hot' && <Flame className="w-3.5 h-3.5" />}
              {formatNumber(rumor.heat_score)}
            </div>
          </div>

          {/* Title */}
          <h3 className="text-lg font-bold text-white mb-2.5 group-hover:text-cyan-400 transition-colors line-clamp-2 leading-snug">
            {rumor.title}
          </h3>

          {/* Content */}
          <p className="text-gray-400 text-sm leading-relaxed line-clamp-3 mb-4">
            {rumor.content}
          </p>

          {/* Footer */}
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <MessageCircle className="w-3.5 h-3.5" />
                {commentCount}
              </span>
              <span className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5" />
                {totalVotes}
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="text-green-400">{believeVotes} believe</span>
              <span className="text-gray-700">·</span>
              <span className="text-red-400">{doubtVotes} doubt</span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
