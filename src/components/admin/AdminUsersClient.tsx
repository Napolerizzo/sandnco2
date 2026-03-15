'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, UserX, Shield, Crown, AlertTriangle, CheckCircle, Activity } from 'lucide-react'
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

const STATUS_COLORS = {
  active: '#22C55E',
  warned: '#F59E0B',
  suspended: '#F97316',
  banned: '#EF4444',
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
      const labels = { warn: 'warned', suspend: 'suspended', ban: 'banned', unsuspend: 'unsuspended' }
      toast.success(`User ${labels[action]}`)
      window.location.reload()
    } else {
      toast.error(error || 'Action failed')
    }
    setActionUser(null)
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.02em', marginBottom: 2 }}>
            Users
          </h1>
          <p style={{ fontSize: 13, color: 'var(--muted)' }}>{users.length} total registered</p>
        </div>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: 16 }}>
        <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--subtle)' }} />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by username or email..."
          className="input"
          style={{ width: '100%', paddingLeft: 38 }}
        />
      </div>

      {/* Table */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['User', 'Rank', 'Status', 'Balance', 'Joined', 'Actions'].map(h => (
                  <th key={h} style={{
                    padding: '10px 14px', textAlign: 'left',
                    fontSize: 11, fontWeight: 600, color: 'var(--muted)',
                    textTransform: 'uppercase', letterSpacing: '0.06em',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((user, i) => {
                const rank = RANKS[user.rank] || RANKS.ghost_in_the_city
                const statusColor = STATUS_COLORS[user.status as keyof typeof STATUS_COLORS] || '#6B7280'
                return (
                  <motion.tr
                    key={user.id}
                    style={{ borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none' }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.02 }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-elevated)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    {/* User */}
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: 18 }}>{rank.emoji}</span>
                        <div>
                          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 1 }}>
                            {user.display_name || user.username}
                            {user.is_premium && <Crown size={11} style={{ color: '#F59E0B', marginLeft: 5, display: 'inline' }} />}
                          </p>
                          <p style={{ fontSize: 11, color: 'var(--subtle)' }}>@{user.username}</p>
                        </div>
                      </div>
                    </td>

                    {/* Rank */}
                    <td style={{ padding: '12px 14px' }}>
                      <span style={{
                        fontSize: 10, fontWeight: 600, padding: '2px 8px',
                        borderRadius: 'var(--r-sm)', background: `${rank.color}15`, color: rank.color,
                      }}>
                        {rank.label}
                      </span>
                      <p style={{ fontSize: 10, color: 'var(--subtle)', marginTop: 2 }}>{user.xp?.toLocaleString() || 0} XP</p>
                    </td>

                    {/* Status */}
                    <td style={{ padding: '12px 14px' }}>
                      <span style={{
                        fontSize: 11, fontWeight: 600, padding: '3px 8px',
                        borderRadius: 'var(--r-sm)', textTransform: 'capitalize',
                        background: `${statusColor}15`, color: statusColor,
                      }}>
                        {user.status}
                      </span>
                    </td>

                    {/* Balance */}
                    <td style={{ padding: '12px 14px' }}>
                      <span style={{ fontSize: 13, color: 'var(--text)', fontWeight: 500 }}>
                        ₹{user.wallet_balance?.toFixed(2) || '0.00'}
                      </span>
                    </td>

                    {/* Joined */}
                    <td style={{ padding: '12px 14px' }}>
                      <span style={{ fontSize: 12, color: 'var(--subtle)' }}>{formatRelativeTime(user.created_at)}</span>
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        {user.status !== 'warned' && (
                          <button
                            onClick={() => handleAction(user.id, 'warn')}
                            disabled={actionUser === user.id}
                            title="Warn"
                            style={{
                              width: 28, height: 28, borderRadius: 6, border: '1px solid transparent',
                              background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                              color: '#F59E0B', transition: 'all 0.15s',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(245,158,11,0.1)'; e.currentTarget.style.borderColor = 'rgba(245,158,11,0.3)' }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent' }}
                          >
                            <AlertTriangle size={13} />
                          </button>
                        )}
                        {user.status === 'active' || user.status === 'warned' ? (
                          <button
                            onClick={() => handleAction(user.id, 'suspend')}
                            disabled={actionUser === user.id}
                            title="Suspend"
                            style={{
                              width: 28, height: 28, borderRadius: 6, border: '1px solid transparent',
                              background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                              color: '#F97316', transition: 'all 0.15s',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(249,115,22,0.1)'; e.currentTarget.style.borderColor = 'rgba(249,115,22,0.3)' }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent' }}
                          >
                            <Shield size={13} />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleAction(user.id, 'unsuspend')}
                            disabled={actionUser === user.id}
                            title="Unsuspend"
                            style={{
                              width: 28, height: 28, borderRadius: 6, border: '1px solid transparent',
                              background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                              color: '#22C55E', transition: 'all 0.15s',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(34,197,94,0.1)'; e.currentTarget.style.borderColor = 'rgba(34,197,94,0.3)' }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent' }}
                          >
                            <CheckCircle size={13} />
                          </button>
                        )}
                        <button
                          onClick={() => handleAction(user.id, 'ban')}
                          disabled={actionUser === user.id}
                          title="Ban"
                          style={{
                            width: 28, height: 28, borderRadius: 6, border: '1px solid transparent',
                            background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#EF4444', transition: 'all 0.15s',
                          }}
                          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.3)' }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent' }}
                        >
                          <UserX size={13} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                )
              })}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--muted)' }}>
              <p style={{ fontSize: 14 }}>No users found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
