'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Search, UserX, Shield, Crown, AlertTriangle, CheckCircle, Activity,
  UserPlus, Wallet, X, Loader, DollarSign
} from 'lucide-react'
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

type ModalType = null | 'create_user' | 'add_credit' | 'membership'

export default function AdminUsersClient({ users }: { users: User[] }) {
  const [search, setSearch] = useState('')
  const [actionUser, setActionUser] = useState<string | null>(null)
  const [modal, setModal] = useState<ModalType>(null)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  // Create user form
  const [newEmail, setNewEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [newUsername, setNewUsername] = useState('')
  const [newDisplayName, setNewDisplayName] = useState('')
  const [creating, setCreating] = useState(false)

  // Credit form
  const [creditAmount, setCreditAmount] = useState('')
  const [creditReason, setCreditReason] = useState('')
  const [crediting, setCrediting] = useState(false)

  // Membership form
  const [memberDays, setMemberDays] = useState('30')
  const [memberAction, setMemberAction] = useState<'activate' | 'deactivate'>('activate')
  const [membering, setMembering] = useState(false)

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

  const handleCreateUser = async () => {
    if (!newEmail || !newPassword || !newUsername) { toast.error('All fields required'); return }
    setCreating(true)
    const res = await fetch('/api/admin/users/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: newEmail, password: newPassword, username: newUsername, displayName: newDisplayName }),
    })
    const data = await res.json()
    if (data.success) {
      toast.success(`User ${data.user.username} created!`)
      setModal(null)
      setNewEmail(''); setNewPassword(''); setNewUsername(''); setNewDisplayName('')
      window.location.reload()
    } else {
      toast.error(data.error || 'Failed')
    }
    setCreating(false)
  }

  const handleAddCredit = async () => {
    if (!selectedUser || !creditAmount) return
    setCrediting(true)
    const res = await fetch('/api/admin/users/balance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: selectedUser.id, amount: Number(creditAmount), reason: creditReason }),
    })
    const data = await res.json()
    if (data.success) {
      toast.success(`Balance updated! New: ₹${data.newBalance}`)
      setModal(null); setCreditAmount(''); setCreditReason('')
      window.location.reload()
    } else {
      toast.error(data.error || 'Failed')
    }
    setCrediting(false)
  }

  const handleMembership = async () => {
    if (!selectedUser) return
    setMembering(true)
    const res = await fetch('/api/admin/users/membership', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: selectedUser.id, action: memberAction, durationDays: Number(memberDays) }),
    })
    const data = await res.json()
    if (data.success) {
      toast.success(memberAction === 'activate' ? `Premium activated until ${new Date(data.expiresAt).toLocaleDateString()}` : 'Premium deactivated')
      setModal(null)
      window.location.reload()
    } else {
      toast.error(data.error || 'Failed')
    }
    setMembering(false)
  }

  const openModal = (type: ModalType, user?: User) => {
    setSelectedUser(user || null)
    setModal(type)
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
        <button onClick={() => openModal('create_user')} className="btn btn-primary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <UserPlus size={13} /> Create User
        </button>
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
      <div className="card" style={{ overflow: 'hidden', padding: 0 }}>
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
                        {/* Add credit */}
                        <button
                          onClick={() => openModal('add_credit', user)}
                          title="Add/Deduct Credit"
                          style={{
                            width: 28, height: 28, borderRadius: 6, border: '1px solid transparent',
                            background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#22C55E', transition: 'all 0.15s',
                          }}
                          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(34,197,94,0.1)'; e.currentTarget.style.borderColor = 'rgba(34,197,94,0.3)' }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent' }}
                        >
                          <DollarSign size={13} />
                        </button>

                        {/* Membership */}
                        <button
                          onClick={() => openModal('membership', user)}
                          title="Manage Membership"
                          style={{
                            width: 28, height: 28, borderRadius: 6, border: '1px solid transparent',
                            background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#F59E0B', transition: 'all 0.15s',
                          }}
                          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(245,158,11,0.1)'; e.currentTarget.style.borderColor = 'rgba(245,158,11,0.3)' }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent' }}
                        >
                          <Crown size={13} />
                        </button>

                        {/* Warn */}
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

                        {/* Suspend / Unsuspend */}
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

                        {/* Ban */}
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

      {/* MODALS */}
      {modal && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 100,
            background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
          onClick={() => setModal(null)}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: 16, width: '100%', maxWidth: 440, padding: 24,
              boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
            }}
          >
            {/* Close button */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>
                {modal === 'create_user' && 'Create New User'}
                {modal === 'add_credit' && `Adjust Balance — ${selectedUser?.display_name || selectedUser?.username}`}
                {modal === 'membership' && `Membership — ${selectedUser?.display_name || selectedUser?.username}`}
              </h2>
              <button onClick={() => setModal(null)} style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            {/* Create User */}
            {modal === 'create_user' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                  <label className="label">Email</label>
                  <input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="user@example.com" className="input" />
                </div>
                <div>
                  <label className="label">Username</label>
                  <input type="text" value={newUsername} onChange={e => setNewUsername(e.target.value)} placeholder="username" className="input" />
                </div>
                <div>
                  <label className="label">Display Name (optional)</label>
                  <input type="text" value={newDisplayName} onChange={e => setNewDisplayName(e.target.value)} placeholder="Display Name" className="input" />
                </div>
                <div>
                  <label className="label">Password</label>
                  <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Min 8 characters" className="input" />
                </div>
                <button onClick={handleCreateUser} disabled={creating} className="btn btn-primary" style={{ marginTop: 4 }}>
                  {creating ? <Loader size={14} className="animate-spin" /> : <UserPlus size={14} />}
                  Create User
                </button>
              </div>
            )}

            {/* Add Credit */}
            {modal === 'add_credit' && selectedUser && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <p style={{ fontSize: 13, color: 'var(--muted)' }}>
                  Current balance: <strong style={{ color: 'var(--text)' }}>₹{selectedUser.wallet_balance?.toFixed(2) || '0.00'}</strong>
                </p>
                <div>
                  <label className="label">Amount (positive to add, negative to deduct)</label>
                  <input type="number" value={creditAmount} onChange={e => setCreditAmount(e.target.value)} placeholder="e.g. 500 or -200" className="input" />
                </div>
                <div>
                  <label className="label">Reason (optional)</label>
                  <input type="text" value={creditReason} onChange={e => setCreditReason(e.target.value)} placeholder="Bonus, refund, correction..." className="input" />
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                  {[100, 500, 1000, -100].map(amt => (
                    <button key={amt} onClick={() => setCreditAmount(amt.toString())} className="btn btn-secondary btn-sm" style={{ flex: 1, fontSize: 12 }}>
                      {amt > 0 ? '+' : ''}₹{amt}
                    </button>
                  ))}
                </div>
                <button onClick={handleAddCredit} disabled={crediting || !creditAmount} className="btn btn-primary" style={{ marginTop: 4 }}>
                  {crediting ? <Loader size={14} className="animate-spin" /> : <Wallet size={14} />}
                  {Number(creditAmount) >= 0 ? 'Add Credit' : 'Deduct Credit'}
                </button>
              </div>
            )}

            {/* Membership */}
            {modal === 'membership' && selectedUser && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <p style={{ fontSize: 13, color: 'var(--muted)' }}>
                  Premium status: <strong style={{ color: selectedUser.is_premium ? '#F59E0B' : 'var(--subtle)' }}>
                    {selectedUser.is_premium ? 'Active' : 'Inactive'}
                  </strong>
                </p>
                <div>
                  <label className="label">Action</label>
                  <select value={memberAction} onChange={e => setMemberAction(e.target.value as 'activate' | 'deactivate')} className="input" style={{ cursor: 'pointer' }}>
                    <option value="activate">Activate Premium</option>
                    <option value="deactivate">Deactivate Premium</option>
                  </select>
                </div>
                {memberAction === 'activate' && (
                  <div>
                    <label className="label">Duration (days)</label>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {['7', '30', '90', '365'].map(d => (
                        <button
                          key={d}
                          onClick={() => setMemberDays(d)}
                          className={`btn btn-sm ${memberDays === d ? 'btn-primary' : 'btn-secondary'}`}
                          style={{ flex: 1, fontSize: 12 }}
                        >
                          {d === '7' ? '1 week' : d === '30' ? '1 month' : d === '90' ? '3 months' : '1 year'}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                <button onClick={handleMembership} disabled={membering} className="btn btn-primary" style={{ marginTop: 4 }}>
                  {membering ? <Loader size={14} className="animate-spin" /> : <Crown size={14} />}
                  {memberAction === 'activate' ? `Activate for ${memberDays} days` : 'Deactivate Premium'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
