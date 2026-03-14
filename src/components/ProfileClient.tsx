'use client'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Crown, Flame, Trophy, Shield, Edit3, MapPin, Calendar, Star } from 'lucide-react'
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
    { label: 'Rumors', value: profile.rumors_posted, icon: Flame, color: '#f97316' },
    { label: 'Wins', value: profile.challenges_won, icon: Trophy, color: '#a855f7' },
    { label: 'Busted', value: profile.myths_busted, icon: Shield, color: '#06b6d4' },
  ]

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      {/* Profile card */}
      <motion.div className="glass-gold rounded-3xl overflow-hidden mb-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        {/* Cover */}
        <div className="h-32 relative overflow-hidden"
          style={{ background: `linear-gradient(135deg, ${rank.color}20, ${pfp.gradient[0]}40, ${pfp.gradient[1]}30)` }}>
          <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse at 30% 50%, ${rank.color}30, transparent 60%)` }} />
        </div>

        <div className="px-8 pb-8">
          {/* Avatar */}
          <div className="flex items-end justify-between -mt-12 mb-4">
            <div className="relative">
              <div className="w-24 h-24 rounded-3xl overflow-hidden border-4 shadow-2xl"
                style={{
                  borderColor: rank.color,
                  background: `linear-gradient(135deg, ${pfp.gradient[0]}, ${pfp.gradient[1]})`,
                  boxShadow: `0 0 30px ${rank.color}40`,
                }}>
                {profile.profile_picture_url ? (
                  <img src={profile.profile_picture_url} alt={profile.display_name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-3xl font-bold text-white">
                      {profile.display_name?.[0]?.toUpperCase() || profile.username?.[0]?.toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              <span className="absolute -bottom-1 -right-1 text-2xl">{rank.emoji}</span>
            </div>
            {isOwnProfile && (
              <Link href="/settings">
                <button className="btn-ghost px-4 py-2 rounded-xl text-xs flex items-center gap-2">
                  <Edit3 className="w-3.5 h-3.5" />Edit Profile
                </button>
              </Link>
            )}
          </div>

          {/* Name + rank */}
          <div className="mb-4">
            <div className="flex items-center gap-3 mb-1">
              <h1 className="font-bold text-2xl text-white">{profile.display_name || profile.username}</h1>
              {profile.is_premium && <Crown className="w-5 h-5 text-yellow-400 crown-animate" />}
            </div>
            <p className="font-mono text-sm text-zinc-500 mb-2">@{profile.username}</p>
            <span className={`badge-rank rank-${profile.rank?.split('_')[0] || 'ghost'} inline-block`}>
              {rank.emoji} {rank.label}
            </span>
          </div>

          {/* XP bar */}
          <div className="mb-4">
            <div className="flex justify-between text-xs font-mono text-zinc-500 mb-1">
              <span>{profile.xp.toLocaleString()} XP</span>
              <span>Next rank: {xpProgress.next.toLocaleString()} XP</span>
            </div>
            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ background: `linear-gradient(90deg, ${rank.color}, ${rank.color}80)` }}
                initial={{ width: 0 }}
                animate={{ width: `${xpProgress.percent}%` }}
                transition={{ duration: 1 }}
              />
            </div>
          </div>

          {/* Bio + meta */}
          {profile.bio && <p className="text-zinc-400 font-mono text-sm mb-4 leading-relaxed">{profile.bio}</p>}
          <div className="flex items-center gap-4 text-xs font-mono text-zinc-500">
            {profile.city && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{profile.city}</span>}
            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />Joined {formatRelativeTime(profile.created_at)}</span>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {stats.map(({ label, value, icon: Icon, color }, i) => (
          <motion.div key={label} className="glass rounded-2xl p-5 text-center"
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Icon className="w-5 h-5 mx-auto mb-2" style={{ color }} />
            <p className="font-display text-3xl" style={{ color, fontFamily: "'Bebas Neue', cursive" }}>{value}</p>
            <p className="font-mono text-xs text-zinc-500 mt-1">{label}</p>
          </motion.div>
        ))}
      </div>

      {/* Public rumors */}
      {rumors.length > 0 && (
        <div>
          <h2 className="font-tech text-xs text-zinc-400 tracking-widest uppercase mb-4">Public Rumors</h2>
          <div className="space-y-3">
            {rumors.map((rumor, i) => (
              <motion.div key={rumor.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}>
                <Link href={`/rumors/${rumor.id}`}>
                  <div className="card-dark flex items-center justify-between p-4 cursor-pointer group">
                    <div>
                      <h3 className="font-mono text-sm text-white group-hover:text-yellow-400 transition-colors">{rumor.title}</h3>
                      <p className="font-mono text-xs text-zinc-600 mt-1">{rumor.category} • {formatRelativeTime(rumor.created_at)}</p>
                    </div>
                    <span className="font-tech text-xs text-orange-400/70">heat: {Math.floor(rumor.heat_score)}</span>
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
