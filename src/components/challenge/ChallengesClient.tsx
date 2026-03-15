'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Trophy, Plus, Clock, Users, Zap, Crown, Lock, TrendingUp,
  Flame, Activity
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
  created: { label: 'Open', color: '#22C55E' },
  waiting_for_players: { label: 'Filling up', color: '#F59E0B' },
  active: { label: 'Live', color: '#EF4444' },
  judging: { label: 'Judging', color: '#A855F7' },
  completed: { label: 'Ended', color: '#6B7280' },
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
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 16px 80px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.025em', color: 'var(--text)', marginBottom: 4 }}>
            Challenges
          </h1>
          <p style={{ fontSize: 13, color: 'var(--muted)' }}>Enter. Compete. Collect.</p>
        </div>
        <Link href="/challenges/new" style={{ textDecoration: 'none' }}>
          <motion.button
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', fontSize: 13, fontWeight: 600 }}
            whileTap={{ scale: 0.96 }}
          >
            <Plus size={15} />
            Create Challenge
          </motion.button>
        </Link>
      </div>

      {/* Stats bar */}
      {profile && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}
        >
          {[
            { label: 'Wallet balance', value: formatCurrency(profile.wallet_balance), icon: Zap, color: '#6366F1' },
            { label: 'Live challenges', value: challenges.filter(c => c.status === 'active').length, icon: Flame, color: '#EF4444' },
            { label: 'Total prize pool', value: formatCurrency(challenges.reduce((s, c) => s + c.prize_pool, 0)), icon: Trophy, color: '#A855F7' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="card" style={{ padding: '14px 16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 8,
                  background: `${color}15`, border: `1px solid ${color}30`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon size={13} style={{ color }} />
                </div>
                <span style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 500 }}>{label}</span>
              </div>
              <p style={{ fontSize: 20, fontWeight: 700, color, letterSpacing: '-0.02em' }}>{value}</p>
            </div>
          ))}
        </motion.div>
      )}

      {/* Filters */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 4, background: 'var(--bg-elevated)', borderRadius: 'var(--r-md)', padding: 3 }}>
          {(['all', 'free', 'premium'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: '5px 14px', fontSize: 12, fontWeight: 500,
              borderRadius: 'var(--r)', border: 'none', cursor: 'pointer',
              transition: 'all 0.15s', textTransform: 'capitalize',
              background: filter === f ? 'var(--bg-card)' : 'transparent',
              color: filter === f ? 'var(--text)' : 'var(--muted)',
              boxShadow: filter === f ? '0 1px 3px rgba(0,0,0,0.2)' : 'none',
            }}>
              {f === 'all' ? 'All' : f === 'free' ? 'Free entry' : 'Premium'}
            </button>
          ))}
        </div>

        <select
          value={sort}
          onChange={e => setSort(e.target.value as typeof sort)}
          className="input"
          style={{ padding: '6px 12px', fontSize: 12, cursor: 'pointer' }}
        >
          <option value="prize">Highest prize</option>
          <option value="new">Newest</option>
          <option value="ending">Ending soon</option>
        </select>
      </div>

      {/* Challenges grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14 }}>
        {filtered.map((challenge, i) => {
          const status = STATUS_CONFIG[challenge.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.created
          const canAfford = !profile || profile.wallet_balance >= challenge.entry_fee
          const isPremiumLocked = challenge.is_premium_only && !(profile?.is_premium)

          return (
            <motion.div
              key={challenge.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30, delay: i * 0.04 }}
            >
              <Link href={`/challenges/${challenge.id}`} style={{ textDecoration: 'none', display: 'block' }}>
                <div className="card card-interactive" style={{
                  height: '100%', opacity: isPremiumLocked ? 0.65 : 1, overflow: 'hidden',
                }}>
                  {/* Status stripe */}
                  <div style={{ height: 3, background: `linear-gradient(90deg, ${status.color}, transparent)` }} />

                  <div style={{ padding: '16px 18px' }}>
                    {/* Status + badges */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                      <span style={{
                        fontSize: 10, fontWeight: 600, padding: '3px 8px',
                        borderRadius: 'var(--r-sm)', background: `${status.color}15`,
                        color: status.color,
                      }}>
                        {status.label}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        {isPremiumLocked && <Lock size={13} style={{ color: 'var(--subtle)' }} />}
                        {challenge.is_premium_only && <Crown size={13} style={{ color: '#F59E0B' }} />}
                      </div>
                    </div>

                    {/* Title */}
                    <h3 style={{
                      fontSize: 14, fontWeight: 600, color: 'var(--text)',
                      marginBottom: 8, lineHeight: 1.4,
                      display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                    }}>
                      {challenge.title}
                    </h3>

                    {/* Description */}
                    <p style={{
                      fontSize: 12, color: 'var(--muted)', lineHeight: 1.6, marginBottom: 14,
                      display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                    }}>
                      {challenge.description}
                    </p>

                    {/* Prize / Entry */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
                      <div style={{
                        background: 'var(--bg-elevated)', borderRadius: 'var(--r)', padding: '8px 10px',
                      }}>
                        <p style={{ fontSize: 10, color: 'var(--subtle)', marginBottom: 3 }}>Prize pool</p>
                        <p style={{ fontSize: 15, fontWeight: 700, color: '#A855F7' }}>
                          {formatCurrency(challenge.prize_pool)}
                        </p>
                      </div>
                      <div style={{
                        background: 'var(--bg-elevated)', borderRadius: 'var(--r)', padding: '8px 10px',
                      }}>
                        <p style={{ fontSize: 10, color: 'var(--subtle)', marginBottom: 3 }}>Entry fee</p>
                        <p style={{
                          fontSize: 15, fontWeight: 700,
                          color: challenge.entry_fee === 0 ? '#22C55E' : canAfford ? 'var(--text)' : '#EF4444',
                        }}>
                          {challenge.entry_fee === 0 ? 'Free' : formatCurrency(challenge.entry_fee)}
                        </p>
                      </div>
                    </div>

                    {/* Footer */}
                    <div style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      paddingTop: 10, borderTop: '1px solid var(--border)',
                      fontSize: 11, color: 'var(--subtle)',
                    }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Users size={11} />{challenge.participant_count} players
                      </span>
                      {challenge.ends_at && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Clock size={11} />
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
          <div style={{
            gridColumn: '1 / -1', textAlign: 'center', padding: '60px 0',
            color: 'var(--muted)',
          }}>
            <Trophy size={36} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
            <p style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}>No challenges available</p>
            <p style={{ fontSize: 12, color: 'var(--subtle)', marginBottom: 20 }}>
              {filter !== 'all' ? 'Try a different filter' : 'Be the first to create one'}
            </p>
            <Link href="/challenges/new" style={{ textDecoration: 'none' }}>
              <button className="btn btn-primary" style={{ padding: '9px 20px', fontSize: 13 }}>
                Create a challenge
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
