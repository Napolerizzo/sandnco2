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
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-10">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}>
          <span className="text-6xl">👑</span>
        </motion.div>
        <h1 className="font-display text-5xl text-gradient-gold mt-4" style={{ fontFamily: "'Bebas Neue', cursive" }}>
          CITY THRONE
        </h1>
        <p className="font-mono text-xs text-zinc-500 mt-2">Who rules the streets?</p>
        {currentUserPos > 0 && (
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full glass-gold">
            <Star className="w-3.5 h-3.5 text-yellow-400" />
            <span className="font-tech text-xs text-yellow-400">Your rank: #{currentUserPos}</span>
          </div>
        )}
      </div>

      {/* Top 3 podium */}
      {sorted.length >= 3 && (
        <div className="flex items-end justify-center gap-4 mb-10">
          {[1, 0, 2].map((pos, i) => {
            const user = sorted[pos]
            const rank = RANKS[user.rank]
            const pfp = PFP_STYLES[user.pfp_style] || PFP_STYLES.neon_orb
            const heights = ['h-28', 'h-36', 'h-24']
            const podiumLabels = ['2nd', '1st', '3rd']
            const podiumColors = ['#9ca3af', '#fbbf24', '#cd7f32']

            return (
              <motion.div key={pos} className="flex flex-col items-center"
                initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                <div className="relative mb-2">
                  <div className="w-14 h-14 rounded-2xl overflow-hidden border-2"
                    style={{
                      borderColor: podiumColors[i],
                      background: `linear-gradient(135deg, ${pfp.gradient[0]}, ${pfp.gradient[1]})`,
                      boxShadow: `0 0 20px ${podiumColors[i]}40`,
                    }}>
                    <div className="w-full h-full flex items-center justify-center text-xl font-bold text-white">
                      {user.display_name?.[0]?.toUpperCase() || user.username?.[0]?.toUpperCase()}
                    </div>
                  </div>
                  <span className="absolute -top-2 -right-2 text-base">{rank.emoji}</span>
                </div>
                <p className="font-mono text-xs text-white font-bold">{user.display_name || user.username}</p>
                <p className="font-tech text-xs text-zinc-500">{user.xp.toLocaleString()} XP</p>
                <div className={`${heights[i]} w-20 rounded-t-xl mt-2 flex items-end justify-center pb-2`}
                  style={{ background: `linear-gradient(to top, ${podiumColors[i]}30, ${podiumColors[i]}10)`, border: `1px solid ${podiumColors[i]}30` }}>
                  <span className="font-tech text-xs font-bold" style={{ color: podiumColors[i] }}>
                    {podiumLabels[i]}
                  </span>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Tabs + search */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <div className="flex gap-1 bg-white/5 rounded-full p-1">
          {([['xp', 'XP', Crown], ['challenges', 'WINS', Trophy], ['myths', 'BUSTED', Flame]] as const).map(([id, label, Icon]) => (
            <button key={id} onClick={() => setTab(id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-tech transition-all ${
                tab === id ? 'bg-yellow-400 text-black font-bold' : 'text-zinc-400'
              }`}>
              <Icon className="w-3 h-3" />{label}
            </button>
          ))}
        </div>
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Find a player..."
            className="input-cyber w-full rounded-full pl-9 pr-4 py-2 text-xs" />
        </div>
      </div>

      {/* Full list */}
      <div className="space-y-2">
        {sorted.map((user, i) => {
          const rank = RANKS[user.rank]
          const pfp = PFP_STYLES[user.pfp_style] || PFP_STYLES.neon_orb
          const isCurrentUser = user.id === currentUserId
          const value = tab === 'xp' ? `${user.xp.toLocaleString()} XP` : tab === 'challenges' ? `${user.challenges_won} wins` : `${user.myths_busted} busted`

          return (
            <motion.div key={user.id}
              className={`flex items-center gap-4 p-4 rounded-xl transition-all cursor-pointer ${
                isCurrentUser ? 'glass-gold ring-1 ring-yellow-400/30' : 'card-dark'
              }`}
              initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
              whileHover={{ x: 2 }}
            >
              {/* Rank number */}
              <div className={`w-8 text-center font-tech text-sm ${
                i === 0 ? 'text-yellow-400' : i === 1 ? 'text-zinc-400' : i === 2 ? 'text-amber-600' : 'text-zinc-600'
              }`}>
                {i < 3 ? ['🥇', '🥈', '🥉'][i] : `#${i + 1}`}
              </div>

              {/* Avatar */}
              <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0"
                style={{ background: `linear-gradient(135deg, ${pfp.gradient[0]}, ${pfp.gradient[1]})` }}>
                <div className="w-full h-full flex items-center justify-center text-base font-bold text-white">
                  {user.display_name?.[0]?.toUpperCase() || user.username?.[0]?.toUpperCase()}
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Link href={`/profile/${user.username}`} className="font-bold text-sm text-white hover:text-yellow-400 transition-colors truncate">
                    {user.display_name || user.username}
                  </Link>
                  {user.is_premium && <Crown className="w-3 h-3 text-yellow-400 flex-shrink-0" />}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={`badge-rank rank-${user.rank?.split('_')[0] || 'ghost'} text-[10px]`}>
                    {rank.emoji} {rank.label}
                  </span>
                  {user.city && (
                    <span className="flex items-center gap-0.5 text-zinc-600 font-mono text-xs">
                      <MapPin className="w-2.5 h-2.5" />{user.city}
                    </span>
                  )}
                </div>
              </div>

              {/* Score */}
              <div className="text-right">
                <p className="font-tech text-sm font-bold text-yellow-400">{value}</p>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
