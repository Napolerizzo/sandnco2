'use client'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Crown, Flame, Trophy, Shield, Edit3, MapPin, Calendar,
  Terminal, Activity, Zap, Lock
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

  const stats = [
    { label: 'RUMORS_DEPLOYED', value: profile.rumors_posted, icon: Flame, color: 'var(--red)' },
    { label: 'CHALLENGES_WON', value: profile.challenges_won, icon: Trophy, color: '#a855f7' },
    { label: 'MYTHS_BUSTED', value: profile.myths_busted, icon: Shield, color: 'var(--cyan)' },
  ]

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      {/* Profile card */}
      <motion.div className="terminal mb-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="terminal-header">
          <div className="terminal-dots"><span /><span /><span /></div>
          <div className="terminal-title">
            <Terminal className="w-3 h-3" /> AGENT_DOSSIER
          </div>
        </div>

        {/* Cover gradient */}
        <div className="h-24 relative overflow-hidden"
          style={{ background: `linear-gradient(135deg, ${rank.color}15, ${pfp.gradient[0]}25, ${pfp.gradient[1]}15)` }}>
          <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse at 30% 50%, ${rank.color}20, transparent 60%)` }} />
          {/* Scanlines on cover */}
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,245,0.03) 2px, rgba(0,255,245,0.03) 4px)',
          }} />
        </div>

        <div className="terminal-body -mt-2">
          {/* Avatar + edit */}
          <div className="flex items-end justify-between -mt-10 mb-4">
            <div className="relative">
              <div className="w-20 h-20 overflow-hidden border-2"
                style={{
                  borderColor: rank.color,
                  background: `linear-gradient(135deg, ${pfp.gradient[0]}, ${pfp.gradient[1]})`,
                  boxShadow: `0 0 25px ${rank.color}30`,
                }}>
                {profile.profile_picture_url ? (
                  <img src={profile.profile_picture_url} alt={profile.display_name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">
                      {profile.display_name?.[0]?.toUpperCase() || profile.username?.[0]?.toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              <span className="absolute -bottom-1 -right-1 text-xl">{rank.emoji}</span>
            </div>
            {isOwnProfile && (
              <Link href="/settings">
                <button className="btn-outline px-4 py-2 text-[10px] flex items-center gap-2">
                  <Edit3 className="w-3 h-3" />EDIT_PROFILE
                </button>
              </Link>
            )}
          </div>

          {/* Name + rank */}
          <div className="mb-4">
            <div className="flex items-center gap-3 mb-1">
              <h1 className="font-extrabold text-xl text-white uppercase tracking-wider">{profile.display_name || profile.username}</h1>
              {profile.is_premium && <Crown className="w-4 h-4 text-[#fbbf24]" />}
            </div>
            <p className="text-[10px] text-[var(--text-dim)] mb-2 tracking-wider">@{profile.username}</p>
            <span
              className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider px-2 py-1 border"
              style={{ color: rank.color, borderColor: `${rank.color}40`, background: `${rank.color}10` }}
            >
              {rank.emoji} {rank.label.toUpperCase().replace(/\s+/g, '_')}
            </span>
          </div>

          {/* XP bar */}
          <div className="mb-4">
            <div className="flex justify-between text-[9px] text-[var(--text-dim)] mb-1 tracking-wider">
              <span>{profile.xp.toLocaleString()} XP</span>
              <span>NEXT_RANK: {xpProgress.next.toLocaleString()} XP</span>
            </div>
            <div className="h-1.5 border border-[var(--cyan-border)] bg-[var(--cyan-ghost)] overflow-hidden">
              <motion.div
                className="h-full"
                style={{ background: `linear-gradient(90deg, ${rank.color}, ${rank.color}80)` }}
                initial={{ width: 0 }}
                animate={{ width: `${xpProgress.percent}%` }}
                transition={{ duration: 1 }}
              />
            </div>
          </div>

          {/* Bio + meta */}
          {profile.bio && (
            <p className="text-[var(--text-dim)] text-[11px] mb-4 leading-relaxed border-l-2 border-[var(--cyan-border)] pl-3">
              {profile.bio}
            </p>
          )}
          <div className="flex items-center gap-4 text-[9px] text-[var(--text-dim)] tracking-wider">
            {profile.city && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{profile.city}</span>}
            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />JOINED {formatRelativeTime(profile.created_at).toUpperCase()}</span>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="terminal mb-6">
        <div className="terminal-header">
          <div className="terminal-dots"><span /><span /><span /></div>
          <div className="terminal-title">
            <Activity className="w-3 h-3" /> AGENT_METRICS
          </div>
        </div>
        <div className="terminal-body">
          <div className="grid grid-cols-3 gap-3">
            {stats.map(({ label, value, icon: Icon, color }, i) => (
              <motion.div key={label} className="border border-[var(--cyan-border)] bg-[var(--cyan-ghost)] p-4 text-center"
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                <Icon className="w-4 h-4 mx-auto mb-2" style={{ color }} />
                <p className="text-2xl font-extrabold" style={{ color }}>{value}</p>
                <p className="text-[8px] text-[var(--text-dim)] mt-1 tracking-[0.15em]">{label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Public rumors */}
      {rumors.length > 0 && (
        <div className="terminal">
          <div className="terminal-header">
            <div className="terminal-dots"><span /><span /><span /></div>
            <div className="terminal-title">
              <Flame className="w-3 h-3" /> PUBLIC_INTEL
            </div>
          </div>
          <div className="terminal-body space-y-1">
            {rumors.map((rumor, i) => (
              <motion.div key={rumor.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}>
                <Link href={`/rumors/${rumor.id}`}>
                  <div className="flex items-center justify-between p-3 border border-[var(--cyan-border)] hover:bg-[var(--cyan-ghost)] cursor-pointer group transition-all">
                    <div>
                      <h3 className="text-[10px] text-white group-hover:text-[var(--cyan)] transition-colors font-bold uppercase tracking-wider">
                        {rumor.title}
                      </h3>
                      <p className="text-[8px] text-[var(--text-ghost)] mt-1 tracking-wider">
                        {rumor.category.toUpperCase()} · {formatRelativeTime(rumor.created_at).toUpperCase()}
                      </p>
                    </div>
                    <span className="text-[9px] text-[var(--red)] font-bold">
                      <Flame className="w-3 h-3 inline mr-1" />{Math.floor(rumor.heat_score)}
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
