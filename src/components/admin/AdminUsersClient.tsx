'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, UserX, Shield, Crown, AlertTriangle, CheckCircle, Terminal, Activity } from 'lucide-react'
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
      toast.success(`ACTION_${action.toUpperCase()}_EXECUTED`)
      window.location.reload()
    } else {
      toast.error(error || 'ACTION_FAILED')
    }
    setActionUser(null)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="text-[9px] text-[var(--text-dim)] tracking-[0.3em] uppercase mb-1">
            // USER_MANAGEMENT
          </div>
          <h1 className="text-xl font-extrabold text-glow-cyan uppercase tracking-wider">AGENTS</h1>
          <p className="text-[9px] text-[var(--text-dim)] tracking-wider">{users.length} TOTAL_REGISTERED</p>
        </div>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--text-dim)]" />
        <input type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="SEARCH_USERNAME_OR_EMAIL..."
          className="input-terminal w-full pl-10 pr-4 py-3 text-[10px]" />
      </div>

      <div className="terminal">
        <div className="terminal-header">
          <div className="terminal-dots"><span /><span /><span /></div>
          <div className="terminal-title">
            <Activity className="w-3 h-3" /> AGENT_REGISTRY
          </div>
        </div>
        <div className="terminal-body p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--cyan-border)]">
                  {['AGENT', 'RANK', 'STATUS', 'BALANCE', 'JOINED', 'ACTIONS'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-[8px] text-[var(--text-dim)] tracking-[0.2em] uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((user, i) => {
                  const rank = RANKS[user.rank] || RANKS.ghost_in_the_city
                  return (
                    <motion.tr key={user.id} className="border-b border-[var(--cyan-border)] hover:bg-[var(--cyan-ghost)] transition-all"
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-base">{rank.emoji}</span>
                          <div>
                            <p className="text-[10px] text-white font-bold uppercase tracking-wider">{user.display_name || user.username}</p>
                            <p className="text-[8px] text-[var(--text-dim)] tracking-wider">@{user.username}</p>
                          </div>
                          {user.is_premium && <Crown className="w-3 h-3 text-[#fbbf24]" />}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 border"
                          style={{ color: rank.color, borderColor: `${rank.color}40`, background: `${rank.color}10` }}>
                          {rank.label.toUpperCase().replace(/\s+/g, '_')}
                        </span>
                        <p className="text-[8px] text-[var(--text-ghost)] mt-0.5">{user.xp?.toLocaleString() || 0} XP</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-[9px] font-bold tracking-wider uppercase px-2 py-0.5 border ${
                          user.status === 'active' ? 'text-[var(--green)] border-[var(--green)]' :
                          user.status === 'warned' ? 'text-[#fbbf24] border-[#fbbf24]' :
                          user.status === 'suspended' ? 'text-[#f97316] border-[#f97316]' :
                          'text-[var(--red)] border-[var(--red)]'
                        }`}>{user.status}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-[10px] text-[var(--text-dim)]">₹{user.wallet_balance?.toFixed(2) || '0.00'}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-[9px] text-[var(--text-ghost)] tracking-wider">{formatRelativeTime(user.created_at)}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          {user.status !== 'warned' && (
                            <button onClick={() => handleAction(user.id, 'warn')} disabled={actionUser === user.id}
                              title="WARN"
                              className="p-1.5 border border-transparent hover:border-[#fbbf24]/30 hover:bg-[#fbbf24]/10 text-[#fbbf24] transition-all">
                              <AlertTriangle className="w-3 h-3" />
                            </button>
                          )}
                          {user.status === 'active' || user.status === 'warned' ? (
                            <button onClick={() => handleAction(user.id, 'suspend')} disabled={actionUser === user.id}
                              title="SUSPEND"
                              className="p-1.5 border border-transparent hover:border-[#f97316]/30 hover:bg-[#f97316]/10 text-[#f97316] transition-all">
                              <Shield className="w-3 h-3" />
                            </button>
                          ) : (
                            <button onClick={() => handleAction(user.id, 'unsuspend')} disabled={actionUser === user.id}
                              title="UNSUSPEND"
                              className="p-1.5 border border-transparent hover:border-[var(--green)]/30 hover:bg-[var(--green)]/10 text-[var(--green)] transition-all">
                              <CheckCircle className="w-3 h-3" />
                            </button>
                          )}
                          <button onClick={() => handleAction(user.id, 'ban')} disabled={actionUser === user.id}
                            title="BAN"
                            className="p-1.5 border border-transparent hover:border-[var(--red)]/30 hover:bg-[var(--red)]/10 text-[var(--red)] transition-all">
                            <UserX className="w-3 h-3" />
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
      </div>
    </div>
  )
}
