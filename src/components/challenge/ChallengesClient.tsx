'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Trophy, Plus, Clock, Users, Zap, Crown, Lock, TrendingUp,
  Filter, Flame, Star
} from 'lucide-react'
import { formatCurrency, formatRelativeTime } from '@/lib/utils'

interface Challenge {
  id: string
  title: string
  description: string
  entry_fee: number
  prize_pool: number
  status: string
  ends_at: string | null
  participant_count: number
  is_premium_only: boolean
  thumbnail_url: string | null
  category: string
  created_at: string
}

interface Profile {
  wallet_balance: number
  is_premium: boolean
  rank: string
}

const STATUS_CONFIG = {
  created: { label: 'OPEN', color: '#22c55e' },
  waiting_for_players: { label: 'FILLING', color: '#f59e0b' },
  active: { label: 'LIVE', color: '#ef4444' },
  judging: { label: 'JUDGING', color: '#a855f7' },
  completed: { label: 'DONE', color: '#6b7280' },
}

export default function ChallengesClient({
  challenges,
  profile,
  userId,
}: {
  challenges: Challenge[]
  profile: Profile | null
  userId: string
}) {
  const [filter, setFilter] = useState<'all' | 'free' | 'premium'>('all')
  const [sort, setSort] = useState<'prize' | 'new' | 'ending'>('prize')

  const filtered = challenges
    .filter(c => {
      if (filter === 'free') return c.entry_fee === 0
      if (filter === 'premium') return c.is_premium_only
      return true
    })
    .sort((a, b) => {
      if (sort === 'prize') return b.prize_pool - a.prize_pool
      if (sort === 'new') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      if (sort === 'ending' && a.ends_at && b.ends_at) return new Date(a.ends_at).getTime() - new Date(b.ends_at).getTime()
      return 0
    })

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-4xl text-gradient-gold" style={{ fontFamily: "'Bebas Neue', cursive" }}>
            CHALLENGES
          </h1>
          <p className="text-zinc-500 font-mono text-xs mt-1">Enter. Compete. Collect.</p>
        </div>
        <Link href="/challenges/new">
          <motion.button className="btn-primary px-4 py-2 rounded-xl text-xs flex items-center gap-2" whileTap={{ scale: 0.95 }}>
            <Plus className="w-4 h-4" />CREATE CHALLENGE
          </motion.button>
        </Link>
      </div>

      {/* Wallet balance */}
      {profile && (
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'WALLET', value: formatCurrency(profile.wallet_balance), icon: Zap, color: '#fbbf24' },
            { label: 'ACTIVE', value: challenges.filter(c => c.status === 'active').length, icon: Flame, color: '#f97316' },
            { label: 'PRIZES', value: formatCurrency(challenges.reduce((s, c) => s + c.prize_pool, 0)), icon: Trophy, color: '#a855f7' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="glass rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <Icon className="w-3.5 h-3.5" style={{ color }} />
                <span className="font-tech text-xs text-zinc-500 tracking-widest">{label}</span>
              </div>
              <p className="font-tech text-lg font-bold" style={{ color }}>{value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <div className="flex items-center gap-1 bg-white/5 rounded-full p-1">
          {(['all', 'free', 'premium'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-xs font-tech transition-all capitalize ${
                filter === f ? 'bg-yellow-400 text-black font-bold' : 'text-zinc-400'
              }`}>{f}</button>
          ))}
        </div>

        <select
          value={sort}
          onChange={e => setSort(e.target.value as typeof sort)}
          className="input-cyber rounded-xl px-3 py-1.5 text-xs bg-white/5 cursor-pointer"
        >
          <option value="prize">Highest Prize</option>
          <option value="new">Newest</option>
          <option value="ending">Ending Soon</option>
        </select>
      </div>

      {/* Challenges grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((challenge, i) => {
          const status = STATUS_CONFIG[challenge.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.created
          const canAfford = !profile || profile.wallet_balance >= challenge.entry_fee
          const isPremiumLocked = challenge.is_premium_only && !(profile?.is_premium)

          return (
            <motion.div
              key={challenge.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              <Link href={`/challenges/${challenge.id}`}>
                <div className={`card-dark overflow-hidden cursor-pointer group h-full ${isPremiumLocked ? 'opacity-70' : ''}`}>
                  {/* Gradient top bar */}
                  <div className="h-1" style={{ background: `linear-gradient(90deg, ${status.color}, transparent)` }} />

                  <div className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <span className="font-tech text-xs px-2 py-0.5 rounded-full border"
                        style={{ color: status.color, borderColor: `${status.color}40`, background: `${status.color}15` }}>
                        {status.label}
                      </span>
                      <div className="flex items-center gap-1">
                        {isPremiumLocked && <Lock className="w-3.5 h-3.5 text-yellow-400" />}
                        {challenge.is_premium_only && <Crown className="w-3.5 h-3.5 text-yellow-400" />}
                      </div>
                    </div>

                    <h3 className="font-bold text-white text-sm mb-2 group-hover:text-yellow-400 transition-colors line-clamp-2">
                      {challenge.title}
                    </h3>

                    <p className="text-zinc-500 text-xs font-mono line-clamp-2 mb-4">
                      {challenge.description}
                    </p>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="bg-white/3 rounded-lg p-2.5">
                        <p className="font-tech text-xs text-zinc-500 mb-0.5">PRIZE POOL</p>
                        <p className="font-tech text-sm font-bold text-yellow-400">
                          {formatCurrency(challenge.prize_pool)}
                        </p>
                      </div>
                      <div className="bg-white/3 rounded-lg p-2.5">
                        <p className="font-tech text-xs text-zinc-500 mb-0.5">ENTRY FEE</p>
                        <p className={`font-tech text-sm font-bold ${challenge.entry_fee === 0 ? 'text-green-400' : canAfford ? 'text-white' : 'text-red-400'}`}>
                          {challenge.entry_fee === 0 ? 'FREE' : formatCurrency(challenge.entry_fee)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs font-mono text-zinc-500">
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />{challenge.participant_count} in
                      </span>
                      {challenge.ends_at && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatRelativeTime(challenge.ends_at)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          )
        })}

        {filtered.length === 0 && (
          <div className="col-span-3 text-center py-20 text-zinc-600 font-mono">
            <Trophy className="w-10 h-10 mx-auto mb-3 opacity-20" />
            <p>No challenges available right now.</p>
            <Link href="/challenges/new">
              <button className="btn-primary px-6 py-2 rounded-xl text-xs mt-4">Create One</button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
