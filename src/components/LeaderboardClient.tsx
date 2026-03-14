'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Crown, Trophy, Flame, Search, Star, MapPin, Terminal, Activity } from 'lucide-react'
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
      <div className="text-center mb-8">
        <div className="text-[9px] text-[var(--text-dim)] tracking-[0.3em] uppercase mb-2">
          // RANK_HIERARCHY
        </div>
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}>
          <span className="text-5xl">👑</span>
        </motion.div>
        <h1 className="text-3xl font-extrabold text-glow-cyan uppercase tracking-wider mt-4">
          CITY_THRONE
        </h1>
        <p className="text-[10px] text-[var(--text-dim)] mt-2 tracking-wider">WHO_RULES_THE_STREETS?</p>
        {currentUserPos > 0 && (
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 border border-[var(--cyan-border)] bg-[var(--cyan-ghost)]">
            <Star className="w-3 h-3 text-[var(--cyan)]" />
            <span className="text-[10px] text-[var(--cyan)] tracking-wider">YOUR_RANK: #{currentUserPos}</span>
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
            const podiumLabels = ['2ND', '1ST', '3RD']
            const podiumColors = ['#9ca3af', 'var(--cyan)', '#cd7f32']

            return (
              <motion.div key={pos} className="flex flex-col items-center"
                initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                <div className="relative mb-2">
                  <div className="w-14 h-14 overflow-hidden border-2"
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
                <p className="text-[10px] text-white font-bold uppercase tracking-wider">{user.display_name || user.username}</p>
                <p className="text-[9px] text-[var(--text-dim)]">{user.xp.toLocaleString()} XP</p>
                <div className={`${heights[i]} w-20 mt-2 flex items-end justify-center pb-2 border-t-2`}
                  style={{ background: `linear-gradient(to top, ${podiumColors[i]}15, transparent)`, borderColor: podiumColors[i] }}>
                  <span className="text-[10px] font-bold tracking-wider" style={{ color: podiumColors[i] }}>
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
        <div className="flex gap-1">
          {([['xp', 'XP', Crown], ['challenges', 'WINS', Trophy], ['myths', 'BUSTED', Flame]] as const).map(([id, label, Icon]) => (
            <button key={id} onClick={() => setTab(id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] tracking-[0.1em] border transition-all ${
                tab === id
                  ? 'text-[var(--cyan)] border-[var(--cyan)] bg-[var(--cyan-ghost)]'
                  : 'text-[var(--text-dim)] border-[var(--cyan-border)] hover:bg-[var(--cyan-ghost)]'
              }`}>
              <Icon className="w-3 h-3" />{label}
            </button>
          ))}
        </div>
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-[var(--text-dim)]" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="SEARCH_AGENT..."
            className="input-terminal w-full pl-9 pr-4 py-2 text-[10px]" />
        </div>
      </div>

      {/* Full list */}
      <div className="terminal">
        <div className="terminal-header">
          <div className="terminal-dots"><span /><span /><span /></div>
          <div className="terminal-title">
            <Activity className="w-3 h-3" /> RANKED_AGENTS
          </div>
        </div>
        <div className="terminal-body space-y-1">
          {sorted.map((user, i) => {
            const rank = RANKS[user.rank]
            const pfp = PFP_STYLES[user.pfp_style] || PFP_STYLES.neon_orb
            const isCurrentUser = user.id === currentUserId
            const value = tab === 'xp' ? `${user.xp.toLocaleString()} XP` : tab === 'challenges' ? `${user.challenges_won} WINS` : `${user.myths_busted} BUSTED`

            return (
              <motion.div key={user.id}
                className={`flex items-center gap-3 p-3 border transition-all cursor-pointer ${
                  isCurrentUser
                    ? 'border-[var(--cyan)] bg-[var(--cyan-ghost)]'
                    : 'border-[var(--cyan-border)] bg-transparent hover:bg-[var(--cyan-ghost)]'
                }`}
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                whileHover={{ x: 2 }}
              >
                {/* Rank number */}
                <div className={`w-8 text-center text-[10px] font-bold ${
                  i === 0 ? 'text-[var(--cyan)]' : i === 1 ? 'text-[var(--text-dim)]' : i === 2 ? 'text-[#cd7f32]' : 'text-[var(--text-ghost)]'
                }`}>
                  {i < 3 ? ['#1', '#2', '#3'][i] : `#${i + 1}`}
                </div>

                {/* Avatar */}
                <div className="w-9 h-9 overflow-hidden flex-shrink-0 border"
                  style={{
                    background: `linear-gradient(135deg, ${pfp.gradient[0]}, ${pfp.gradient[1]})`,
                    borderColor: `${rank.color}40`,
                  }}>
                  <div className="w-full h-full flex items-center justify-center text-sm font-bold text-white">
                    {user.display_name?.[0]?.toUpperCase() || user.username?.[0]?.toUpperCase()}
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Link href={`/profile/${user.username}`} className="font-bold text-[10px] text-white hover:text-[var(--cyan)] transition-colors truncate uppercase tracking-wider">
                      {user.display_name || user.username}
                    </Link>
                    {user.is_premium && <Crown className="w-3 h-3 text-[#fbbf24] flex-shrink-0" />}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 border"
                      style={{ color: rank.color, borderColor: `${rank.color}40`, background: `${rank.color}10` }}>
                      {rank.emoji} {rank.label.toUpperCase().replace(/\s+/g, '_')}
                    </span>
                    {user.city && (
                      <span className="flex items-center gap-0.5 text-[var(--text-ghost)] text-[8px] tracking-wider">
                        <MapPin className="w-2 h-2" />{user.city}
                      </span>
                    )}
                  </div>
                </div>

                {/* Score */}
                <div className="text-right">
                  <p className="text-[10px] font-extrabold text-[var(--cyan)]">{value}</p>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
