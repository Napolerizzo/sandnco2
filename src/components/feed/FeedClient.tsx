'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  Flame, Plus, TrendingUp, Clock, MessageCircle,
  Zap, Crown, ChevronRight, Settings, LogOut, User,
  Trophy, LayoutDashboard, Wallet, ChevronDown,
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

const FILTERS = [
  { id: 'hot', icon: Flame, label: 'Hot' },
  { id: 'new', icon: Clock, label: 'New' },
  { id: 'trending', icon: TrendingUp, label: 'Trending' },
] as const

export default function FeedClient({
  initialRumors,
  profile,
}: {
  initialRumors: Rumor[]
  profile: Profile | null
  userId: string
}) {
  const [filter, setFilter] = useState<'hot' | 'new' | 'trending'>('hot')
  const [rumors] = useState(initialRumors)
  const [menuOpen, setMenuOpen] = useState(false)
  const rank = profile ? RANKS[profile.rank] : null
  const router = useRouter()
  const supabase = createClient()

  const sorted = [...rumors].sort((a, b) => {
    if (filter === 'new') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    return b.heat_score - a.heat_score
  })

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px', fontFamily: 'var(--font)' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 32, alignItems: 'start' }}>

        {/* ── MAIN FEED ── */}
        <div>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
            {/* Left: user avatar + greeting */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {profile && rank ? (
                <div style={{ position: 'relative' }}>
                  <button
                    onClick={() => setMenuOpen(o => !o)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      background: 'var(--bg-card)', border: '1px solid var(--border)',
                      borderRadius: 'var(--r-lg)', padding: '7px 12px 7px 7px',
                      cursor: 'pointer', transition: 'border-color 0.15s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--primary)')}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
                  >
                    {/* Avatar circle */}
                    <div style={{
                      width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
                      background: `${rank.color}20`, border: `2px solid ${rank.color}50`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 14, fontWeight: 700, color: rank.color,
                    }}>
                      {(profile.display_name?.[0] || profile.username?.[0] || '?').toUpperCase()}
                    </div>
                    <div style={{ textAlign: 'left' }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', lineHeight: 1.2 }}>
                        {profile.display_name || profile.username}
                      </p>
                      <p style={{ fontSize: 11, color: rank.color, lineHeight: 1.2 }}>
                        {rank.emoji} {rank.label}
                      </p>
                    </div>
                    <ChevronDown size={13} style={{ color: 'var(--subtle)', marginLeft: 2, transform: menuOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }} />
                  </button>

                  {/* Dropdown */}
                  <AnimatePresence>
                    {menuOpen && (
                      <>
                        <div style={{ position: 'fixed', inset: 0, zIndex: 10 }} onClick={() => setMenuOpen(false)} />
                        <motion.div
                          initial={{ opacity: 0, y: -8, scale: 0.97 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -6, scale: 0.97 }}
                          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                          style={{
                            position: 'absolute', top: 'calc(100% + 8px)', left: 0,
                            width: 210, background: 'var(--bg-card)',
                            border: '1px solid var(--border)',
                            borderRadius: 'var(--r-lg)', zIndex: 20, overflow: 'hidden',
                            boxShadow: '0 8px 30px rgba(0,0,0,0.4)',
                          }}
                        >
                          <div style={{ padding: 6 }}>
                            {[
                              { icon: LayoutDashboard, label: 'My Profile', href: `/profile/${profile.username}` },
                              { icon: Settings, label: 'Settings', href: '/settings' },
                              { icon: Wallet, label: 'Wallet', href: '/wallet' },
                            ].map(({ icon: Icon, label, href }) => (
                              <button key={href} onClick={() => { router.push(href); setMenuOpen(false) }}
                                className="dropdown-item" style={{ width: '100%' }}>
                                <Icon size={14} style={{ flexShrink: 0, opacity: 0.7 }} />
                                {label}
                              </button>
                            ))}
                            <div style={{ height: 1, background: 'var(--border)', margin: '4px 0' }} />
                            <button onClick={handleSignOut} className="dropdown-item danger" style={{ width: '100%' }}>
                              <LogOut size={14} style={{ flexShrink: 0 }} />
                              Sign Out
                            </button>
                          </div>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div>
                  <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.025em', margin: '0 0 4px', color: 'var(--text)' }}>
                    City Feed
                  </h1>
                  <p style={{ fontSize: 14, color: 'var(--muted)', margin: 0 }}>
                    What&apos;s happening in Faridabad right now
                  </p>
                </div>
              )}
            </div>

            <Link href="/rumors/new" style={{ textDecoration: 'none' }}>
              <motion.button
                className="btn btn-primary btn-sm"
                whileTap={{ scale: 0.97 }}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
              >
                <Plus style={{ width: 14, height: 14 }} />
                Drop Rumor
              </motion.button>
            </Link>
          </div>

          {/* Filters */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
            {FILTERS.map(({ id, icon: Icon, label }) => (
              <button
                key={id}
                onClick={() => setFilter(id)}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '7px 14px', fontSize: 13, fontWeight: 500, cursor: 'pointer',
                  borderRadius: 'var(--r)', fontFamily: 'var(--font)',
                  border: filter === id ? '1px solid rgba(99,102,241,0.4)' : '1px solid var(--border)',
                  background: filter === id ? 'var(--primary-dim)' : 'transparent',
                  color: filter === id ? '#a5b4fc' : 'var(--subtle)',
                  transition: 'all 0.15s',
                }}
              >
                <Icon style={{ width: 13, height: 13 }} />
                {label}
              </button>
            ))}
          </div>

          {/* Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <AnimatePresence>
              {sorted.map((rumor, i) => (
                <RumorCard key={rumor.id} rumor={rumor} index={i} />
              ))}
            </AnimatePresence>

            {sorted.length === 0 && (
              <div style={{
                padding: '64px 24px', textAlign: 'center',
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                borderRadius: 'var(--r-lg)',
              }}>
                <Flame style={{ width: 36, height: 36, margin: '0 auto 16px', color: 'var(--subtle)' }} />
                <p style={{ fontSize: 15, color: 'var(--muted)', marginBottom: 6 }}>The city is quiet... for now.</p>
                <p style={{ fontSize: 13, color: 'var(--subtle)', marginBottom: 20 }}>Be the first to drop a rumor.</p>
                <Link href="/rumors/new" style={{ textDecoration: 'none' }}>
                  <button className="btn btn-primary">Drop the First Rumor</button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* ── SIDEBAR ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, position: 'sticky', top: 80 }}>

          {/* Profile card */}
          {profile && rank && (
            <motion.div
              className="card"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--subtle)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 14 }}>
                Your Status
              </p>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                <span style={{ fontSize: 28 }}>{rank.emoji}</span>
                <div>
                  <span
                    className="badge"
                    style={{ color: rank.color, borderColor: `${rank.color}35`, background: `${rank.color}12`, display: 'inline-flex' }}
                  >
                    {rank.label}
                  </span>
                  <p style={{ fontSize: 12, color: 'var(--subtle)', margin: '4px 0 0', fontFamily: 'var(--font-mono)' }}>
                    {profile.xp.toLocaleString()} XP
                  </p>
                </div>
              </div>

              {/* XP bar */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ height: 4, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
                  <motion.div
                    style={{ height: '100%', background: rank.color, borderRadius: 2 }}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, (profile.xp / 500) * 100)}%` }}
                    transition={{ duration: 1, delay: 0.4, ease: 'easeOut' }}
                  />
                </div>
                <p style={{ fontSize: 11, color: 'var(--subtle)', marginTop: 5, textAlign: 'right' }}>
                  Next rank
                </p>
              </div>

              <Link href={`/profile/${profile.username}`} style={{ textDecoration: 'none' }}>
                <button className="btn btn-secondary" style={{ width: '100%', fontSize: 13 }}>
                  View Profile
                </button>
              </Link>
            </motion.div>
          )}

          {/* Quick links */}
          <div className="card">
            <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--subtle)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 10 }}>
              Navigate
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {[
                { href: '/rumors', icon: Flame, label: 'Rumors', color: 'var(--danger)' },
                { href: '/challenges', icon: Trophy, label: 'Challenges', color: 'var(--warning)' },
                { href: '/leaderboard', icon: TrendingUp, label: 'Leaderboard', color: 'var(--primary)' },
                { href: '/wallet', icon: Wallet, label: 'Wallet', color: '#22C55E' },
                { href: '/settings', icon: Settings, label: 'Settings', color: 'var(--muted)' },
              ].map(({ href, icon: Icon, label, color }) => (
                <Link key={href} href={href} style={{ textDecoration: 'none' }}>
                  <div className="dropdown-item" style={{ borderRadius: 'var(--r)' }}>
                    <Icon style={{ width: 14, height: 14, color }} />
                    <span>{label}</span>
                    <ChevronRight style={{ width: 13, height: 13, marginLeft: 'auto', opacity: 0.4 }} />
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Premium upsell if not premium */}
          {profile && !profile.is_premium && (
            <div style={{
              padding: 16, borderRadius: 'var(--r-lg)',
              background: 'var(--primary-dim)',
              border: '1px solid rgba(99,102,241,0.25)',
            }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: '#a5b4fc', marginBottom: 4 }}>
                Go Premium
              </p>
              <p style={{ fontSize: 12, color: 'rgba(165,180,252,0.7)', lineHeight: 1.5, marginBottom: 12 }}>
                ₹80/month — Premium badge, create challenges, and more.
              </p>
              <Link href="/membership" style={{ textDecoration: 'none' }}>
                <button className="btn btn-primary btn-sm" style={{ width: '100%', fontSize: 12 }}>
                  Upgrade
                </button>
              </Link>
            </div>
          )}
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
  const heatColor = heatLevel === 'hot' ? 'var(--danger)' : heatLevel === 'warm' ? 'var(--warning)' : 'var(--subtle)'

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.3 }}
    >
      <Link href={`/rumors/${rumor.id}`} className="feed-card" style={{ display: 'block', textDecoration: 'none' }}>
        {/* Heat bar */}
        <div style={{
          position: 'absolute', top: 0, left: 0, height: 2,
          background: `linear-gradient(90deg, ${heatColor}, transparent)`,
          width: `${Math.min(100, rumor.heat_score)}%`,
          borderRadius: '12px 0 0 0',
          opacity: heatLevel !== 'cold' ? 0.8 : 0,
        }} />

        {/* Meta row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--subtle)' }}>
            <span style={{ color: 'var(--muted)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>
              {rumor.anonymous_alias}
            </span>
            <span style={{ color: 'var(--border-strong)' }}>·</span>
            <span>{formatRelativeTime(rumor.created_at)}</span>
            {rumor.category && (
              <span className="badge badge-primary" style={{ fontSize: 10 }}>
                {rumor.category}
              </span>
            )}
          </div>
          {rumor.heat_score > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 600, fontFamily: 'var(--font-mono)', color: heatColor }}>
              {heatLevel === 'hot' && <Flame style={{ width: 12, height: 12 }} />}
              {formatNumber(rumor.heat_score)}
            </div>
          )}
        </div>

        {/* Title */}
        <h3 style={{
          fontSize: 16, fontWeight: 600, color: 'var(--text)',
          margin: '0 0 8px', lineHeight: 1.4,
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          {rumor.title}
        </h3>

        {/* Content */}
        <p style={{
          fontSize: 14, color: 'var(--muted)', lineHeight: 1.6, margin: '0 0 14px',
          display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          {rumor.content}
        </p>

        {/* Footer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 13, color: 'var(--subtle)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <MessageCircle style={{ width: 13, height: 13 }} />
              {commentCount}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <Zap style={{ width: 13, height: 13 }} />
              {totalVotes}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, fontFamily: 'var(--font-mono)' }}>
            <span style={{ color: 'var(--success)' }}>{believeVotes} believe</span>
            <span style={{ color: 'var(--border-strong)' }}>·</span>
            <span style={{ color: 'var(--danger)' }}>{doubtVotes} doubt</span>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
