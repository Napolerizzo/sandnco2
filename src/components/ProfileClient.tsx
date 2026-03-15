'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Crown, Flame, Trophy, Shield, Edit3, MapPin, Calendar, Settings, Zap
} from 'lucide-react'
import { RANKS, PFP_STYLES, getXPProgress, type RankTier, type PfpStyle } from '@/lib/ranks'
import { formatRelativeTime } from '@/lib/utils'

interface Profile {
  id: string
  username: string
  display_name: string
  rank: RankTier
  xp: number
  bio: string | null
  city: string | null
  is_premium: boolean
  profile_picture_url: string | null
  pfp_style: PfpStyle
  created_at: string
  rumors_posted: number
  challenges_won: number
  myths_busted: number
}

export default function ProfileClient({
  profile,
  rumors,
  isOwnProfile,
}: {
  profile: Profile
  rumors: Array<{ id: string; title: string; category: string; heat_score: number; created_at: string }>
  isOwnProfile: boolean
}) {
  const rank = RANKS[profile.rank] || RANKS.ghost_in_the_city
  const pfp = PFP_STYLES[profile.pfp_style] || PFP_STYLES.neon_orb
  const xpProgress = getXPProgress(profile.xp)

  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '32px 16px 80px' }}>
      {/* Profile card */}
      <motion.div
        className="card"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        style={{ marginBottom: 16, overflow: 'hidden' }}
      >
        {/* Cover */}
        <div style={{
          height: 100, position: 'relative', overflow: 'hidden',
          background: `linear-gradient(135deg, ${rank.color}20, ${pfp.gradient[0]}30, ${pfp.gradient[1]}20)`,
        }}>
          <div style={{
            position: 'absolute', inset: 0,
            background: `radial-gradient(ellipse at 30% 50%, ${rank.color}25, transparent 65%)`,
          }} />
        </div>

        <div style={{ padding: '0 20px 20px' }}>
          {/* Avatar row */}
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: -30, marginBottom: 14 }}>
            <div style={{ position: 'relative' }}>
              <div style={{
                width: 72, height: 72, borderRadius: '50%', overflow: 'hidden',
                border: `2.5px solid ${rank.color}`,
                background: `linear-gradient(135deg, ${pfp.gradient[0]}, ${pfp.gradient[1]})`,
                boxShadow: `0 0 24px ${rank.color}30`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {profile.profile_picture_url ? (
                  <img src={profile.profile_picture_url} alt={profile.display_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ fontSize: 26, fontWeight: 700, color: '#fff' }}>
                    {profile.display_name?.[0]?.toUpperCase() || profile.username?.[0]?.toUpperCase()}
                  </span>
                )}
              </div>
              <span style={{ position: 'absolute', bottom: -4, right: -4, fontSize: 20 }}>{rank.emoji}</span>
            </div>
            {isOwnProfile && (
              <Link href="/settings" style={{ textDecoration: 'none' }}>
                <button className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', fontSize: 12 }}>
                  <Settings size={13} />Edit Profile
                </button>
              </Link>
            )}
          </div>

          {/* Name + rank */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
              <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.02em' }}>
                {profile.display_name || profile.username}
              </h1>
              {profile.is_premium && <Crown size={16} style={{ color: '#F59E0B' }} />}
            </div>
            <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 10 }}>@{profile.username}</p>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 'var(--r-md)',
              background: `${rank.color}15`, color: rank.color,
              border: `1px solid ${rank.color}30`,
            }}>
              {rank.emoji} {rank.label}
            </span>
          </div>

          {/* XP bar */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--muted)', marginBottom: 6 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600, color: rank.color }}>
                <Zap size={11} />{profile.xp.toLocaleString()} XP
              </span>
              <span>Next rank: {xpProgress.next.toLocaleString()} XP</span>
            </div>
            <div style={{ height: 5, background: 'var(--bg-elevated)', borderRadius: 3, overflow: 'hidden' }}>
              <motion.div
                style={{ height: '100%', borderRadius: 3, background: `linear-gradient(90deg, ${rank.color}, ${rank.color}80)` }}
                initial={{ width: 0 }}
                animate={{ width: `${xpProgress.percent}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </div>
          </div>

          {/* Bio */}
          {profile.bio && (
            <p style={{
              fontSize: 13, color: 'var(--muted)', lineHeight: 1.7, marginBottom: 12,
              borderLeft: `2px solid var(--primary)`, paddingLeft: 12,
            }}>
              {profile.bio}
            </p>
          )}

          {/* Meta */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
            {profile.city && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--subtle)' }}>
                <MapPin size={12} />{profile.city}
              </span>
            )}
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--subtle)' }}>
              <Calendar size={12} />Joined {formatRelativeTime(profile.created_at)}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30, delay: 0.08 }}
        style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 16 }}
      >
        {[
          { label: 'Rumors posted', value: profile.rumors_posted, icon: Flame, color: '#EF4444' },
          { label: 'Challenges won', value: profile.challenges_won, icon: Trophy, color: '#A855F7' },
          { label: 'Myths busted', value: profile.myths_busted, icon: Shield, color: '#6366F1' },
        ].map(({ label, value, icon: Icon, color }, i) => (
          <motion.div
            key={label}
            className="card"
            style={{ padding: '16px', textAlign: 'center' }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30, delay: 0.08 + i * 0.06 }}
          >
            <div style={{
              width: 36, height: 36, borderRadius: 10, margin: '0 auto 10px',
              background: `${color}15`, border: `1px solid ${color}30`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Icon size={16} style={{ color }} />
            </div>
            <p style={{ fontSize: 24, fontWeight: 700, color, letterSpacing: '-0.02em', marginBottom: 3 }}>{value}</p>
            <p style={{ fontSize: 11, color: 'var(--muted)' }}>{label}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Public rumors */}
      {rumors.length > 0 && (
        <motion.div
          className="card"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30, delay: 0.15 }}
        >
          <div style={{ padding: '14px 18px 10px', borderBottom: '1px solid var(--border)' }}>
            <h2 style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Flame size={14} style={{ color: '#EF4444' }} />
              Public Intel
            </h2>
          </div>
          <div style={{ padding: '8px 0' }}>
            {rumors.map((rumor, i) => (
              <motion.div
                key={rumor.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.15 + i * 0.04 }}
              >
                <Link href={`/rumors/${rumor.id}`} style={{ textDecoration: 'none', display: 'block' }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '10px 18px', transition: 'background 0.15s',
                    borderBottom: i < rumors.length - 1 ? '1px solid var(--border)' : 'none',
                  }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-elevated)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', marginBottom: 3, lineHeight: 1.4 }}>
                        {rumor.title}
                      </p>
                      <p style={{ fontSize: 11, color: 'var(--subtle)', textTransform: 'capitalize' }}>
                        {rumor.category} · {formatRelativeTime(rumor.created_at)}
                      </p>
                    </div>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#EF4444', fontWeight: 600, flexShrink: 0 }}>
                      <Flame size={12} />{Math.floor(rumor.heat_score)}
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}
