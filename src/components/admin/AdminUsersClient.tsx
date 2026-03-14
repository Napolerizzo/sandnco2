'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, UserX, Shield, Crown, AlertTriangle, CheckCircle } from 'lucide-react'
import { RANKS, type RankTier } from '@/lib/ranks'
import { formatRelativeTime } from '@/lib/utils'
import toast from 'react-hot-toast'

interface User {
  id: string
  username: string
  display_name: string
  email: string
  rank: RankTier
  xp: number
  status: string
  is_premium: boolean
  created_at: string
  wallet_balance: number
}

export default function AdminUsersClient({ users }: { users: User[] }) {
  const [search, setSearch] = useState('')
  const [actionUser, setActionUser] = useState<string | null>(null)

  const filtered = users.filter(u =>
    u.username?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  )

  const handleAction = async (userId: string, action: 'warn' | 'suspend' | 'ban' | 'unsuspend') => {
    setActionUser(userId)
    const res = await fetch('/api/admin/users/action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, action }),
    })
    const { success, error } = await res.json()
    if (success) {
      toast.success(`User ${action}ned successfully`)
      window.location.reload()
    } else {
      toast.error(error || 'Action failed')
    }
    setActionUser(null)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl text-gradient-gold" style={{ fontFamily: "'Bebas Neue', cursive" }}>USERS</h1>
          <p className="font-mono text-xs text-zinc-500">{users.length} total users</p>
        </div>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
        <input type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by username or email..."
          className="input-cyber w-full rounded-xl pl-10 pr-4 py-3 text-sm" />
      </div>

      <div className="glass rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/5">
              {['User', 'Rank', 'Status', 'Balance', 'Joined', 'Actions'].map(h => (
                <th key={h} className="px-4 py-3 text-left font-tech text-xs text-zinc-500 tracking-wider uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((user, i) => {
              const rank = RANKS[user.rank] || RANKS.ghost_in_the_city
              return (
                <motion.tr key={user.id} className="border-b border-white/3 hover:bg-white/2 transition-all"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{rank.emoji}</span>
                      <div>
                        <p className="font-mono text-sm text-white">{user.display_name || user.username}</p>
                        <p className="font-mono text-xs text-zinc-500">@{user.username}</p>
                      </div>
                      {user.is_premium && <Crown className="w-3.5 h-3.5 text-yellow-400" />}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`badge-rank rank-${user.rank?.split('_')[0] || 'ghost'}`}>{rank.label}</span>
                    <p className="font-mono text-xs text-zinc-600 mt-0.5">{user.xp?.toLocaleString() || 0} XP</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-mono px-2 py-1 rounded-full ${
                      user.status === 'active' ? 'bg-green-500/15 text-green-400' :
                      user.status === 'warned' ? 'bg-yellow-500/15 text-yellow-400' :
                      user.status === 'suspended' ? 'bg-orange-500/15 text-orange-400' :
                      'bg-red-500/15 text-red-400'
                    }`}>{user.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-tech text-xs text-zinc-300">₹{user.wallet_balance?.toFixed(2) || '0.00'}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs text-zinc-500">{formatRelativeTime(user.created_at)}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      {user.status !== 'warned' && (
                        <button onClick={() => handleAction(user.id, 'warn')} disabled={actionUser === user.id}
                          title="Warn"
                          className="p-1.5 rounded-lg hover:bg-yellow-400/10 text-yellow-400 transition-all">
                          <AlertTriangle className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {user.status === 'active' || user.status === 'warned' ? (
                        <button onClick={() => handleAction(user.id, 'suspend')} disabled={actionUser === user.id}
                          title="Suspend"
                          className="p-1.5 rounded-lg hover:bg-orange-400/10 text-orange-400 transition-all">
                          <Shield className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <button onClick={() => handleAction(user.id, 'unsuspend')} disabled={actionUser === user.id}
                          title="Unsuspend"
                          className="p-1.5 rounded-lg hover:bg-green-400/10 text-green-400 transition-all">
                          <CheckCircle className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button onClick={() => handleAction(user.id, 'ban')} disabled={actionUser === user.id}
                        title="Ban"
                        className="p-1.5 rounded-lg hover:bg-red-400/10 text-red-400 transition-all">
                        <UserX className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
