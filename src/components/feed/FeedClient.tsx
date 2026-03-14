'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import {
  Flame, Plus, TrendingUp, Clock, Hash,
  MessageCircle, Zap, Crown, Activity, Terminal, ChevronRight
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

  const filters = [
    { id: 'hot', icon: Flame, label: 'HOT' },
    { id: 'new', icon: Clock, label: 'NEW' },
    { id: 'trending', icon: TrendingUp, label: 'TRENDING' },
  ] as const

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
      {/* Main feed */}
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="text-[9px] text-[var(--text-dim)] tracking-[0.3em] uppercase mb-1">
              // LIVE_FEED
            </div>
            <h1 className="text-2xl font-extrabold text-glow-cyan uppercase tracking-wider">
              CITY_FEED
            </h1>
            <p className="text-[10px] text-[var(--text-dim)] mt-1 tracking-wider">
              WHAT&apos;S_BURNING_IN_THE_STREETS
            </p>
          </div>
          <Link href="/rumors/new">
            <motion.button
              className="btn-execute px-4 py-2 text-[10px] flex items-center gap-2"
              whileTap={{ scale: 0.95 }}
            >
              <Plus className="w-3.5 h-3.5" />
              DROP_RUMOR
            </motion.button>
          </Link>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6">
          {filters.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => setFilter(id)}
              className={`flex items-center gap-1.5 px-4 py-1.5 text-[10px] tracking-[0.15em] transition-all border ${
                filter === id
                  ? 'text-[var(--cyan)] border-[var(--cyan-border)] bg-[var(--cyan-ghost)]'
                  : 'text-[var(--text-dim)] border-[var(--cyan-border)] bg-transparent hover:bg-[var(--cyan-ghost)]'
              }`}
            >
              <Icon className="w-3 h-3" />{label}
            </button>
          ))}
        </div>

        {/* Rumor cards */}
        <div className="space-y-3">
          <AnimatePresence>
            {rumors.map((rumor, i) => (
              <RumorCard key={rumor.id} rumor={rumor} index={i} />
            ))}
          </AnimatePresence>

          {rumors.length === 0 && (
            <div className="terminal">
              <div className="terminal-header">
                <div className="terminal-dots"><span /><span /><span /></div>
                <div className="terminal-title">
                  <Terminal className="w-3 h-3" /> NO_DATA
                </div>
              </div>
              <div className="terminal-body text-center py-12">
                <Flame className="w-8 h-8 mx-auto mb-4 text-[var(--text-dim)] opacity-30" />
                <p className="text-[var(--text-dim)] text-xs tracking-wider">THE_CITY_IS_QUIET... FOR_NOW.</p>
                <Link href="/rumors/new">
                  <button className="btn-execute px-6 py-2 text-[10px] mt-4">
                    DEPLOY_FIRST_RUMOR
                  </button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sidebar */}
      <div className="space-y-4">
        {/* User rank card */}
        {profile && rank && (
          <motion.div
            className="terminal"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="terminal-header">
              <div className="terminal-dots"><span /><span /><span /></div>
              <div className="terminal-title">
                <Activity className="w-3 h-3" /> AGENT_STATUS
              </div>
            </div>
            <div className="terminal-body">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">{rank.emoji}</span>
                <div>
                  <span
                    className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider px-2 py-1 border"
                    style={{ color: rank.color, borderColor: `${rank.color}40`, background: `${rank.color}10` }}
                  >
                    {rank.label.toUpperCase().replace(/\s+/g, '_')}
                  </span>
                  <p className="text-[var(--text-dim)] text-[9px] mt-1 tracking-wider">{profile.xp.toLocaleString()} XP</p>
                </div>
              </div>

              {/* XP Bar */}
              <div className="space-y-1">
                <div className="h-1 bg-[var(--cyan-ghost)] border border-[var(--cyan-border)] overflow-hidden">
                  <motion.div
                    className="h-full"
                    style={{ background: rank.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, (profile.xp / 500) * 100)}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                  />
                </div>
                <p className="text-[var(--text-ghost)] text-[8px] text-right tracking-wider">NEXT_RANK</p>
              </div>

              <Link href={`/profile/${profile.username}`}>
                <button className="btn-outline w-full py-2 text-[10px] mt-3">
                  VIEW_PROFILE
                </button>
              </Link>
            </div>
          </motion.div>
        )}

        {/* Quick links */}
        <div className="terminal">
          <div className="terminal-header">
            <div className="terminal-dots"><span /><span /><span /></div>
            <div className="terminal-title">
              <Zap className="w-3 h-3" /> QUICK_ACCESS
            </div>
          </div>
          <div className="terminal-body space-y-1">
            {[
              { href: '/rumors/new', icon: Flame, label: 'DROP_RUMOR', color: 'var(--red)' },
              { href: '/challenges', icon: Crown, label: 'ENTER_CHALLENGE', color: '#fbbf24' },
              { href: '/leaderboard', icon: TrendingUp, label: 'LEADERBOARD', color: 'var(--cyan)' },
            ].map(({ href, icon: Icon, label, color }) => (
              <Link key={href} href={href}>
                <div className="flex items-center gap-2 px-3 py-2 border border-transparent hover:border-[var(--cyan-border)] hover:bg-[var(--cyan-ghost)] transition-all text-[10px] tracking-[0.1em]" style={{ color }}>
                  <Icon className="w-3 h-3" />
                  <ChevronRight className="w-2 h-2" />
                  {label}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function RumorCard({ rumor, index }: { rumor: Rumor; index: number }) {
  const believeVotes = rumor.rumor_votes.filter(v => v.vote_type === 'believe').length
  const doubtVotes = rumor.rumor_votes.filter(v => v.vote_type === 'doubt').length
  const spicyVotes = rumor.rumor_votes.filter(v => v.vote_type === 'spicy').length
  const totalVotes = rumor.rumor_votes.length

  const heatLevel = rumor.heat_score > 50 ? 'hot' : rumor.heat_score > 20 ? 'warm' : 'cold'
  const heatColors = { hot: 'var(--red)', warm: '#fbbf24', cold: 'var(--text-dim)' }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Link href={`/rumors/${rumor.id}`}>
        <div className="terminal group cursor-pointer hover:border-[var(--cyan)] transition-colors">
          <div className="terminal-body">
            {/* Heat indicator bar */}
            <div
              className="absolute top-0 left-0 h-[2px] transition-all"
              style={{
                background: `linear-gradient(90deg, ${heatColors[heatLevel]}, transparent)`,
                width: `${Math.min(100, rumor.heat_score)}%`,
              }}
            />

            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-[9px] text-[var(--text-dim)] tracking-wider">{rumor.anonymous_alias}</span>
                <span className="text-[var(--text-ghost)]">·</span>
                <span className="text-[9px] text-[var(--text-ghost)]">{formatRelativeTime(rumor.created_at)}</span>
              </div>
              <div className="flex items-center gap-1">
                {heatLevel === 'hot' && (
                  <Flame className="w-3 h-3 text-[var(--red)] animate-pulse" />
                )}
                <span className="text-[9px] font-bold" style={{ color: heatColors[heatLevel] }}>
                  {formatNumber(rumor.heat_score)}
                </span>
              </div>
            </div>

            <h3 className="font-bold text-white text-sm mb-1.5 group-hover:text-[var(--cyan)] transition-colors line-clamp-2 uppercase tracking-wide">
              {rumor.title}
            </h3>

            <p className="text-[var(--text-dim)] text-[11px] leading-relaxed line-clamp-3">
              {rumor.content}
            </p>

            <div className="flex items-center justify-between mt-3 pt-3 border-t border-[var(--cyan-border)]">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 text-[9px] text-[var(--text-dim)]">
                  <MessageCircle className="w-3 h-3" />
                  {rumor.rumor_comments.length}
                </span>
                <span className="flex items-center gap-1 text-[9px] text-[var(--text-dim)]">
                  <Zap className="w-3 h-3" />
                  {totalVotes}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[9px] text-[var(--green)]">{believeVotes} BELIEVE</span>
                <span className="text-[var(--text-ghost)]">·</span>
                <span className="text-[9px] text-[var(--red)]">{doubtVotes} DOUBT</span>
                {spicyVotes > 0 && (
                  <>
                    <span className="text-[var(--text-ghost)]">·</span>
                    <span className="text-[9px] text-[#f97316]">🌶 {spicyVotes}</span>
                  </>
                )}
              </div>
            </div>

            {/* Category tag */}
            {rumor.category && (
              <div className="mt-2">
                <span className="inline-flex items-center gap-1 text-[8px] text-[var(--text-dim)] border border-[var(--cyan-border)] px-2 py-0.5 tracking-wider uppercase">
                  <Hash className="w-2 h-2" />{rumor.category}
                </span>
              </div>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
