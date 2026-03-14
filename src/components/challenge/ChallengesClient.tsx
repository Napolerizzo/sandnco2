'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Trophy, Plus, Clock, Users, Zap, Crown, Lock, TrendingUp,
  Flame, Terminal, Activity
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
  created: { label: 'OPEN', color: 'var(--green)' },
  waiting_for_players: { label: 'FILLING', color: '#fbbf24' },
  active: { label: 'LIVE', color: 'var(--red)' },
  judging: { label: 'JUDGING', color: '#a855f7' },
  completed: { label: 'DONE', color: 'var(--text-dim)' },
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
          <div className="text-[9px] text-[var(--text-dim)] tracking-[0.3em] uppercase mb-1">
            // COMPETITION_ENGINE
          </div>
          <h1 className="text-2xl font-extrabold text-glow-cyan uppercase tracking-wider">
            CHALLENGES
          </h1>
          <p className="text-[10px] text-[var(--text-dim)] mt-1 tracking-wider">ENTER. COMPETE. COLLECT.</p>
        </div>
        <Link href="/challenges/new">
          <motion.button className="btn-execute px-4 py-2 text-[10px] flex items-center gap-2" whileTap={{ scale: 0.95 }}>
            <Plus className="w-3.5 h-3.5" />CREATE_CHALLENGE
          </motion.button>
        </Link>
      </div>

      {/* Stats bar */}
      {profile && (
        <div className="terminal mb-6">
          <div className="terminal-header">
            <div className="terminal-dots"><span /><span /><span /></div>
            <div className="terminal-title">
              <Activity className="w-3 h-3" /> CHALLENGE_METRICS
            </div>
          </div>
          <div className="terminal-body">
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'WALLET', value: formatCurrency(profile.wallet_balance), icon: Zap, color: 'var(--cyan)' },
                { label: 'ACTIVE', value: challenges.filter(c => c.status === 'active').length, icon: Flame, color: 'var(--red)' },
                { label: 'TOTAL_PRIZES', value: formatCurrency(challenges.reduce((s, c) => s + c.prize_pool, 0)), icon: Trophy, color: '#a855f7' },
              ].map(({ label, value, icon: Icon, color }) => (
                <div key={label} className="border border-[var(--cyan-border)] bg-[var(--cyan-ghost)] p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className="w-3 h-3" style={{ color }} />
                    <span className="text-[9px] text-[var(--text-dim)] tracking-[0.15em]">{label}</span>
                  </div>
                  <p className="text-lg font-extrabold" style={{ color }}>{value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <div className="flex items-center gap-1">
          {(['all', 'free', 'premium'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-1.5 text-[10px] tracking-[0.1em] border transition-all uppercase ${
                filter === f
                  ? 'text-[var(--cyan)] border-[var(--cyan)] bg-[var(--cyan-ghost)]'
                  : 'text-[var(--text-dim)] border-[var(--cyan-border)] hover:bg-[var(--cyan-ghost)]'
              }`}>{f}</button>
          ))}
        </div>

        <select
          value={sort}
          onChange={e => setSort(e.target.value as typeof sort)}
          className="input-terminal px-3 py-1.5 text-[10px] cursor-pointer"
        >
          <option value="prize">HIGHEST_PRIZE</option>
          <option value="new">NEWEST</option>
          <option value="ending">ENDING_SOON</option>
        </select>
      </div>

      {/* Challenges grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                <div className={`terminal cursor-pointer group h-full ${isPremiumLocked ? 'opacity-60' : ''} hover:border-[var(--cyan)] transition-colors`}>
                  {/* Status bar */}
                  <div className="h-[2px]" style={{ background: `linear-gradient(90deg, ${status.color}, transparent)` }} />

                  <div className="terminal-body">
                    <div className="flex items-start justify-between mb-3">
                      <span className="text-[9px] font-bold tracking-wider px-2 py-0.5 border uppercase"
                        style={{ color: status.color, borderColor: status.color }}>
                        {status.label}
                      </span>
                      <div className="flex items-center gap-1">
                        {isPremiumLocked && <Lock className="w-3 h-3 text-[var(--text-dim)]" />}
                        {challenge.is_premium_only && <Crown className="w-3 h-3 text-[#fbbf24]" />}
                      </div>
                    </div>

                    <h3 className="font-bold text-white text-xs mb-2 group-hover:text-[var(--cyan)] transition-colors line-clamp-2 uppercase tracking-wider">
                      {challenge.title}
                    </h3>

                    <p className="text-[var(--text-dim)] text-[10px] line-clamp-2 mb-4">
                      {challenge.description}
                    </p>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <div className="border border-[var(--cyan-border)] bg-[var(--cyan-ghost)] p-2">
                        <p className="text-[8px] text-[var(--text-dim)] tracking-wider">PRIZE_POOL</p>
                        <p className="text-sm font-extrabold text-[var(--cyan)]">
                          {formatCurrency(challenge.prize_pool)}
                        </p>
                      </div>
                      <div className="border border-[var(--cyan-border)] bg-[var(--cyan-ghost)] p-2">
                        <p className="text-[8px] text-[var(--text-dim)] tracking-wider">ENTRY_FEE</p>
                        <p className={`text-sm font-extrabold ${challenge.entry_fee === 0 ? 'text-[var(--green)]' : canAfford ? 'text-white' : 'text-[var(--red)]'}`}>
                          {challenge.entry_fee === 0 ? 'FREE' : formatCurrency(challenge.entry_fee)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[9px] text-[var(--text-dim)] pt-2 border-t border-[var(--cyan-border)]">
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />{challenge.participant_count} AGENTS
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
          <div className="col-span-3 terminal">
            <div className="terminal-header">
              <div className="terminal-dots"><span /><span /><span /></div>
              <div className="terminal-title">
                <Terminal className="w-3 h-3" /> NO_DATA
              </div>
            </div>
            <div className="terminal-body text-center py-12">
              <Trophy className="w-8 h-8 mx-auto mb-3 text-[var(--text-dim)] opacity-30" />
              <p className="text-[var(--text-dim)] text-xs tracking-wider">NO_CHALLENGES_AVAILABLE.</p>
              <Link href="/challenges/new">
                <button className="btn-execute px-6 py-2 text-[10px] mt-4">CREATE_ONE</button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
