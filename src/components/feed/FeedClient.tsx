'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import {
  Flame, Plus, TrendingUp, Clock, MapPin, Hash,
  Eye, MessageCircle, Zap, Crown, Filter
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
    <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
      {/* Main feed */}
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-3xl text-gradient-gold" style={{ fontFamily: "'Bebas Neue', cursive" }}>
              CITY FEED
            </h1>
            <p className="text-zinc-500 font-mono text-xs mt-1">What&apos;s burning in the streets</p>
          </div>
          <Link href="/rumors/new">
            <motion.button
              className="btn-primary px-4 py-2 rounded-xl text-xs flex items-center gap-2"
              whileTap={{ scale: 0.95 }}
            >
              <Plus className="w-4 h-4" />
              DROP A RUMOR
            </motion.button>
          </Link>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6">
          {filters.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => setFilter(id)}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-tech transition-all ${
                filter === id
                  ? 'bg-yellow-400 text-black font-bold'
                  : 'bg-white/5 text-zinc-400 hover:bg-white/10 border border-white/5'
              }`}
            >
              <Icon className="w-3 h-3" />{label}
            </button>
          ))}
        </div>

        {/* Rumor cards */}
        <div className="space-y-4">
          <AnimatePresence>
            {rumors.map((rumor, i) => (
              <RumorCard key={rumor.id} rumor={rumor} index={i} />
            ))}
          </AnimatePresence>

          {rumors.length === 0 && (
            <div className="text-center py-20 text-zinc-600 font-mono">
              <Flame className="w-10 h-10 mx-auto mb-4 opacity-20" />
              <p>The city is quiet... for now.</p>
              <Link href="/rumors/new">
                <button className="btn-primary px-6 py-2 rounded-xl text-xs mt-4">
                  Be the first to drop a rumor
                </button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        {/* User rank card */}
        {profile && rank && (
          <motion.div
            className="glass-gold rounded-2xl p-5"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">{rank.emoji}</span>
              <div>
                <span className={`badge-rank rank-${profile.rank.split('_')[0]}`}>{rank.label}</span>
                <p className="text-zinc-400 font-mono text-xs mt-1">{profile.xp.toLocaleString()} XP</p>
              </div>
            </div>

            {/* XP Bar */}
            <div className="space-y-1">
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: `linear-gradient(90deg, ${rank.color}, ${rank.color}80)` }}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, (profile.xp / 500) * 100)}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                />
              </div>
              <p className="text-zinc-600 font-mono text-xs text-right">Next rank</p>
            </div>

            <Link href={`/profile/${profile.username}`}>
              <button className="btn-ghost w-full py-2 rounded-lg text-xs font-mono mt-3">
                View Profile
              </button>
            </Link>
          </motion.div>
        )}

        {/* Quick links */}
        <div className="glass rounded-2xl p-5">
          <h3 className="font-tech text-xs text-zinc-400 tracking-widest uppercase mb-4">Quick Actions</h3>
          <div className="space-y-2">
            {[
              { href: '/rumors/new', icon: Flame, label: 'Drop a Rumor', color: 'text-orange-400' },
              { href: '/challenges', icon: Crown, label: 'Enter a Challenge', color: 'text-yellow-400' },
              { href: '/leaderboard', icon: TrendingUp, label: 'Leaderboard', color: 'text-cyan-400' },
            ].map(({ href, icon: Icon, label, color }) => (
              <Link key={href} href={href}>
                <div className={`flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 transition-all text-xs font-mono ${color}`}>
                  <Icon className="w-3.5 h-3.5" />{label}
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
  const heatColors = { hot: '#f97316', warm: '#fbbf24', cold: '#6b7280' }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Link href={`/rumors/${rumor.id}`}>
        <div className="card-dark p-5 cursor-pointer group relative overflow-hidden">
          {/* Heat indicator */}
          <div
            className="absolute top-0 left-0 h-0.5 w-full"
            style={{ background: `linear-gradient(90deg, ${heatColors[heatLevel]}, transparent)` }}
          />

          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-zinc-500">{rumor.anonymous_alias}</span>
              <span className="text-zinc-700">•</span>
              <span className="font-mono text-xs text-zinc-600">{formatRelativeTime(rumor.created_at)}</span>
            </div>
            <div className="flex items-center gap-1">
              {heatLevel === 'hot' && (
                <Flame className="w-3.5 h-3.5 text-orange-400 animate-pulse" />
              )}
              <span className="font-tech text-xs" style={{ color: heatColors[heatLevel] }}>
                {formatNumber(rumor.heat_score)}
              </span>
            </div>
          </div>

          <h3 className="font-bold text-white text-base mb-2 group-hover:text-yellow-400 transition-colors line-clamp-2">
            {rumor.title}
          </h3>

          <p className="text-zinc-400 text-sm font-mono leading-relaxed line-clamp-3">
            {rumor.content}
          </p>

          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 text-xs font-mono text-zinc-500">
                <MessageCircle className="w-3.5 h-3.5" />
                {rumor.rumor_comments.length}
              </span>
              <span className="flex items-center gap-1 text-xs font-mono text-zinc-500">
                <Zap className="w-3.5 h-3.5" />
                {totalVotes}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-xs font-mono text-green-400/70">{believeVotes} believe</span>
              <span className="text-zinc-700">·</span>
              <span className="text-xs font-mono text-red-400/70">{doubtVotes} doubt</span>
              {spicyVotes > 0 && (
                <>
                  <span className="text-zinc-700">·</span>
                  <span className="text-xs font-mono text-orange-400/70">🌶 {spicyVotes}</span>
                </>
              )}
            </div>
          </div>

          {/* Category tag */}
          {rumor.category && (
            <div className="mt-3">
              <span className="inline-flex items-center gap-1 text-xs font-mono text-zinc-600 bg-white/3 px-2 py-0.5 rounded-full">
                <Hash className="w-2.5 h-2.5" />{rumor.category}
              </span>
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  )
}
