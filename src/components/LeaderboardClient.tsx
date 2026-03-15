'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Crown, Trophy, Flame, Search, Star, MapPin } from 'lucide-react'
import { RANKS, PFP_STYLES, type RankTier, type PfpStyle } from '@/lib/ranks'

interface User {
  id: string
  username: string
  display_name: string
  rank: RankTier
  xp: number
  profile_picture_url: string | null
  pfp_style: PfpStyle
  is_premium: boolean
  challenges_won: number
  myths_busted: number
  rumors_posted: number
  city: string | null
}

const PODIUM_COLORS = ['#C0C0C0', '#FFD700', '#CD7F32']
const PODIUM_ORDER = [1, 0, 2] // 2nd, 1st, 3rd
const PODIUM_HEIGHTS = [96, 120, 80]
const PODIUM_LABELS = ['2nd', '1st', '3rd']

export default function LeaderboardClient({ users, currentUserId }: { users: User[]; currentUserId: string }) {
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState<'xp' | 'challenges' | 'myths'>('xp')

  const sorted = [...users]
    .filter(u => !search || u.username?.toLowerCase().includes(search.toLowerCase()) || u.display_name?.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (tab === 'xp') return b.xp - a.xp
      if (tab === 'challenges') return b.challenges_won - a.challenges_won
      return b.myths_busted - a.myths_busted
    })

  const currentUserPos = sorted.findIndex(u => u.id === currentUserId) + 1

  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '32px 16px 80px' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 36 }}>
        <motion.div
          initial={{ scale: 0, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          style={{ fontSize: 48, marginBottom: 12 }}
        >
          👑
        </motion.div>
        <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.025em', color: 'var(--text)', marginBottom: 6 }}>
          City Throne
        </h1>
        <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 12 }}>Who rules the streets of Faridabad?</p>
        {currentUserPos > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '7px 16px', borderRadius: 'var(--r-lg)',
              background: 'var(--primary-dim)', border: '1px solid rgba(99,102,241,0.3)',
              fontSize: 13, color: 'var(--primary)', fontWeight: 600,
            }}
          >
            <Star size={13} />
            Your rank: #{currentUserPos}
          </motion.div>
        )}
      </div>

      {/* Top 3 podium */}
      {sorted.length >= 3 && (
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 16, marginBottom: 40 }}>
          {PODIUM_ORDER.map((pos, i) => {
            const user = sorted[pos]
            if (!user) return null
            const rank = RANKS[user.rank]
            const pfp = PFP_STYLES[user.pfp_style] || PFP_STYLES.neon_orb
            const color = PODIUM_COLORS[i]

            return (
              <motion.div
                key={pos}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25, delay: i * 0.1 }}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
              >
                {/* Avatar */}
                <div style={{ position: 'relative', marginBottom: 10 }}>
                  <div style={{
                    width: 52, height: 52, borderRadius: '50%', overflow: 'hidden',
                    border: `2px solid ${color}`,
                    background: `linear-gradient(135deg, ${pfp.gradient[0]}, ${pfp.gradient[1]})`,
                    boxShadow: `0 0 20px ${color}40`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 20, fontWeight: 700, color: '#fff',
                  }}>
                    {user.display_name?.[0]?.toUpperCase() || user.username?.[0]?.toUpperCase()}
                  </div>
                  <span style={{ position: 'absolute', top: -6, right: -6, fontSize: 16 }}>{rank.emoji}</span>
                </div>

                {/* Name */}
                <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', marginBottom: 2, textAlign: 'center', maxWidth: 80 }}>
                  {user.display_name || user.username}
                </p>
                <p style={{ fontSize: 11, color: 'var(--subtle)', marginBottom: 8 }}>
                  {user.xp.toLocaleString()} XP
                </p>

                {/* Podium block */}
                <div style={{
                  width: 72, height: PODIUM_HEIGHTS[i],
                  background: `linear-gradient(to top, ${color}20, transparent)`,
                  borderTop: `2px solid ${color}`,
                  borderRadius: '6px 6px 0 0',
                  display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
                  paddingBottom: 8,
                }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color }}>{PODIUM_LABELS[i]}</span>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Tabs + search */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 4, background: 'var(--bg-elevated)', borderRadius: 'var(--r-md)', padding: 3 }}>
          {([
            ['xp', 'XP', Crown],
            ['challenges', 'Wins', Trophy],
            ['myths', 'Busted', Flame],
          ] as const).map(([id, label, Icon]) => (
            <button key={id} onClick={() => setTab(id)} style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '5px 12px', fontSize: 12, fontWeight: 500,
              borderRadius: 'var(--r)', border: 'none', cursor: 'pointer',
              transition: 'all 0.15s',
              background: tab === id ? 'var(--bg-card)' : 'transparent',
              color: tab === id ? 'var(--text)' : 'var(--muted)',
              boxShadow: tab === id ? '0 1px 3px rgba(0,0,0,0.2)' : 'none',
            }}>
              <Icon size={12} />{label}
            </button>
          ))}
        </div>
        <div style={{ flex: 1, minWidth: 180, position: 'relative' }}>
          <Search size={13} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--subtle)' }} />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search players..."
            className="input"
            style={{ width: '100%', paddingLeft: 34 }}
          />
        </div>
      </div>

      {/* Full list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {sorted.map((user, i) => {
          const rank = RANKS[user.rank]
          const pfp = PFP_STYLES[user.pfp_style] || PFP_STYLES.neon_orb
          const isCurrentUser = user.id === currentUserId
          const value = tab === 'xp'
            ? `${user.xp.toLocaleString()} XP`
            : tab === 'challenges'
            ? `${user.challenges_won} wins`
            : `${user.myths_busted} busted`

          const posColor = i === 0 ? '#FFD700' : i === 1 ? '#C0C0C0' : i === 2 ? '#CD7F32' : 'var(--subtle)'

          return (
            <motion.div
              key={user.id}
              style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px',
                borderRadius: 'var(--r-md)', cursor: 'pointer', transition: 'background 0.15s',
                background: isCurrentUser ? 'var(--primary-dim)' : 'var(--bg-card)',
                border: `1px solid ${isCurrentUser ? 'rgba(99,102,241,0.3)' : 'var(--border)'}`,
              }}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30, delay: i * 0.02 }}
              whileHover={{ x: 2 }}
            >
              {/* Position */}
              <div style={{ width: 28, textAlign: 'center', fontSize: 12, fontWeight: 700, color: posColor, flexShrink: 0 }}>
                #{i + 1}
              </div>

              {/* Avatar */}
              <div style={{
                width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                background: `linear-gradient(135deg, ${pfp.gradient[0]}, ${pfp.gradient[1]})`,
                border: `1.5px solid ${rank.color}40`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 14, fontWeight: 700, color: '#fff',
              }}>
                {user.display_name?.[0]?.toUpperCase() || user.username?.[0]?.toUpperCase()}
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Link href={`/profile/${user.username}`} style={{
                    fontSize: 13, fontWeight: 600, color: 'var(--text)',
                    textDecoration: 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {user.display_name || user.username}
                  </Link>
                  {user.is_premium && <Crown size={12} style={{ color: '#F59E0B', flexShrink: 0 }} />}
                  {isCurrentUser && (
                    <span style={{
                      fontSize: 9, fontWeight: 600, padding: '1px 6px', borderRadius: 4,
                      background: 'var(--primary-dim)', color: 'var(--primary)',
                    }}>You</span>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
                  <span style={{
                    fontSize: 10, fontWeight: 600, padding: '1px 6px', borderRadius: 'var(--r-sm)',
                    background: `${rank.color}15`, color: rank.color,
                  }}>
                    {rank.emoji} {rank.label}
                  </span>
                  {user.city && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 10, color: 'var(--subtle)' }}>
                      <MapPin size={9} />{user.city}
                    </span>
                  )}
                </div>
              </div>

              {/* Score */}
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: isCurrentUser ? 'var(--primary)' : 'var(--text)' }}>
                  {value}
                </p>
              </div>
            </motion.div>
          )
        })}

        {sorted.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--muted)' }}>
            <Trophy size={36} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
            <p style={{ fontSize: 14 }}>No players found</p>
          </div>
        )}
      </div>
    </div>
  )
}
