'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Search, UserX, Shield, Crown, AlertTriangle, CheckCircle, Activity,
  UserPlus, Wallet, X, Loader, DollarSign, Users
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

  const activeCount = users.filter(u => u.status === 'active').length
  const premiumCount = users.filter(u => u.is_premium).length
  const suspendedCount = users.filter(u => u.status === 'suspended' || u.status === 'banned').length

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.02em', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Users size={20} style={{ color: 'var(--primary)' }} />
              Users
            </h1>
            <p style={{ fontSize: 13, color: 'var(--muted)' }}>{users.length} total registered</p>
          </div>
          <button onClick={() => openModal('create_user')} style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px',
            fontSize: 13, fontWeight: 600, borderRadius: 10, border: 'none', cursor: 'pointer',
            background: 'linear-gradient(135deg, var(--primary), #7C3AED)',
            color: '#fff', boxShadow: '0 2px 10px rgba(99,102,241,0.3)',
          }}>
            <UserPlus size={14} /> Create User
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Total Users', value: users.length, color: '#3B82F6' },
          { label: 'Active', value: activeCount, color: '#22C55E' },
          { label: 'Premium', value: premiumCount, color: '#FBBF24' },
          { label: 'Suspended', value: suspendedCount, color: '#EF4444' },
        ].map(({ label, value, color }) => (
          <div key={label} className="glass" style={{ borderRadius: 12, padding: '14px 16px' }}>
            <p style={{ fontSize: 22, fontWeight: 700, color, margin: '0 0 2px', fontFamily: 'var(--font-mono)' }}>{value}</p>
            <p style={{ fontSize: 11, color: 'var(--muted)', margin: 0 }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="glass" style={{ borderRadius: 12, padding: '4px 4px', marginBottom: 16, display: 'flex', alignItems: 'center' }}>
        <Search size={14} style={{ marginLeft: 14, color: 'var(--subtle)', flexShrink: 0 }} />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by username or email..."
          style={{
            width: '100%', padding: '10px 14px', fontSize: 13, color: 'var(--text)',
            background: 'transparent', border: 'none', outline: 'none',
            fontFamily: 'var(--font)',
          }}
        />
      </div>

      {/* Table */}
      <div className="glass" style={{ borderRadius: 14, overflow: 'hidden', padding: 0 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              {['User', 'Rank', 'Status', 'Balance', 'Joined', 'Actions'].map(h => (
                <th key={h} style={{
                  padding: '10px 16px', textAlign: 'left',
                  fontSize: 11, fontWeight: 600, color: 'var(--subtle)',
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
                  style={{ borderBottom: i < filtered.length - 1 ? '1px solid rgba(255,255,255,0.03)' : 'none' }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.02 }}
                >
                  {/* User */}
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 18 }}>{rank.emoji}</span>
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', margin: 0 }}>
                          {user.display_name || user.username}
                          {user.is_premium && <Crown size={11} style={{ color: '#FBBF24', marginLeft: 5, display: 'inline' }} />}
                        </p>
                        <p style={{ fontSize: 11, color: 'var(--subtle)', margin: 0 }}>@{user.username}</p>
                      </div>
                    </div>
                  </td>

                  {/* Rank */}
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      fontSize: 10, fontWeight: 600, padding: '2px 8px',
                      borderRadius: 6, background: `${rank.color}15`, color: rank.color,
                    }}>
                      {rank.label}
                    </span>
                    <p style={{ fontSize: 10, color: 'var(--subtle)', margin: '2px 0 0' }}>{user.xp?.toLocaleString() || 0} XP</p>
                  </td>

                  {/* Status */}
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      fontSize: 10, fontWeight: 600, padding: '3px 8px',
                      borderRadius: 6, textTransform: 'capitalize',
                      background: `${statusColor}15`, color: statusColor,
                    }}>
                      {user.status}
                    </span>
                  </td>

                  {/* Balance */}
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ fontSize: 13, color: 'var(--text)', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
                      ₹{user.wallet_balance?.toFixed(2) || '0.00'}
                    </span>
                  </td>

                  {/* Joined */}
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ fontSize: 11, color: 'var(--subtle)' }}>{formatRelativeTime(user.created_at)}</span>
                  </td>

                  {/* Actions */}
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                      <button
                        onClick={() => openModal('add_credit', user)}
                        title="Add/Deduct Credit"
                        style={{
                          width: 30, height: 30, borderRadius: 8, border: '1px solid rgba(34,197,94,0.15)',
                          background: 'rgba(34,197,94,0.06)', cursor: 'pointer', display: 'flex',
                          alignItems: 'center', justifyContent: 'center', color: '#22C55E', transition: 'all 0.15s',
                        }}
                      >
                        <DollarSign size={13} />
                      </button>
                      <button
                        onClick={() => openModal('membership', user)}
                        title="Manage Membership"
                        style={{
                          width: 30, height: 30, borderRadius: 8, border: '1px solid rgba(251,191,36,0.15)',
                          background: 'rgba(251,191,36,0.06)', cursor: 'pointer', display: 'flex',
                          alignItems: 'center', justifyContent: 'center', color: '#FBBF24', transition: 'all 0.15s',
                        }}
                      >
                        <Crown size={13} />
                      </button>
                      {user.status !== 'warned' && (
                        <button
                          onClick={() => handleAction(user.id, 'warn')}
                          disabled={actionUser === user.id}
                          title="Warn"
                          style={{
                            width: 30, height: 30, borderRadius: 8, border: '1px solid rgba(245,158,11,0.15)',
                            background: 'rgba(245,158,11,0.06)', cursor: 'pointer', display: 'flex',
                            alignItems: 'center', justifyContent: 'center', color: '#F59E0B', transition: 'all 0.15s',
                          }}
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
                            width: 30, height: 30, borderRadius: 8, border: '1px solid rgba(249,115,22,0.15)',
                            background: 'rgba(249,115,22,0.06)', cursor: 'pointer', display: 'flex',
                            alignItems: 'center', justifyContent: 'center', color: '#F97316', transition: 'all 0.15s',
                          }}
                        >
                          <Shield size={13} />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleAction(user.id, 'unsuspend')}
                          disabled={actionUser === user.id}
                          title="Unsuspend"
                          style={{
                            width: 30, height: 30, borderRadius: 8, border: '1px solid rgba(34,197,94,0.15)',
                            background: 'rgba(34,197,94,0.06)', cursor: 'pointer', display: 'flex',
                            alignItems: 'center', justifyContent: 'center', color: '#22C55E', transition: 'all 0.15s',
                          }}
                        >
                          <CheckCircle size={13} />
                        </button>
                      )}
                      <button
                        onClick={() => handleAction(user.id, 'ban')}
                        disabled={actionUser === user.id}
                        title="Ban"
                        style={{
                          width: 30, height: 30, borderRadius: 8, border: '1px solid rgba(239,68,68,0.15)',
                          background: 'rgba(239,68,68,0.06)', cursor: 'pointer', display: 'flex',
                          alignItems: 'center', justifyContent: 'center', color: '#EF4444', transition: 'all 0.15s',
                        }}
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
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--muted)' }}>
            <Users size={32} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
            <p style={{ fontSize: 14 }}>No users found</p>
          </div>
        )}
      </div>

      {/* MODALS */}
      {modal && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 100,
            background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(12px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
          onClick={() => setModal(null)}
        >
          <div
            onClick={e => e.stopPropagation()}
            className="glass-lg"
            style={{
              borderRadius: 20, width: '100%', maxWidth: 440, padding: 28,
              boxShadow: '0 20px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
              <h2 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.02em' }}>
                {modal === 'create_user' && 'Create New User'}
                {modal === 'add_credit' && `Adjust Balance`}
                {modal === 'membership' && `Membership`}
              </h2>
              <button onClick={() => setModal(null)} style={{
                width: 32, height: 32, borderRadius: 10, border: 'none',
                background: 'rgba(255,255,255,0.06)', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)',
              }}>
                <X size={16} />
              </button>
            </div>

            {(modal === 'add_credit' || modal === 'membership') && selectedUser && (
              <div className="neu-inset" style={{ borderRadius: 12, padding: '12px 16px', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 16 }}>{(RANKS[selectedUser.rank] || RANKS.ghost_in_the_city).emoji}</span>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', margin: 0 }}>
                    {selectedUser.display_name || selectedUser.username}
                  </p>
                  <p style={{ fontSize: 11, color: 'var(--subtle)', margin: 0 }}>@{selectedUser.username}</p>
                </div>
              </div>
            )}

            {/* Create User */}
            {modal === 'create_user' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {[
                  { label: 'Email', type: 'email', value: newEmail, set: setNewEmail, placeholder: 'user@example.com' },
                  { label: 'Username', type: 'text', value: newUsername, set: setNewUsername, placeholder: 'username' },
                  { label: 'Display Name', type: 'text', value: newDisplayName, set: setNewDisplayName, placeholder: 'Display Name (optional)' },
                  { label: 'Password', type: 'password', value: newPassword, set: setNewPassword, placeholder: 'Min 8 characters' },
                ].map(f => (
                  <div key={f.label}>
                    <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{f.label}</label>
                    <input
                      type={f.type}
                      value={f.value}
                      onChange={e => f.set(e.target.value)}
                      placeholder={f.placeholder}
                      style={{
                        width: '100%', padding: '10px 14px', fontSize: 13, color: 'var(--text)',
                        borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)',
                        background: 'rgba(255,255,255,0.04)', outline: 'none',
                        fontFamily: 'var(--font)',
                      }}
                    />
                  </div>
                ))}
                <button onClick={handleCreateUser} disabled={creating} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  padding: '11px 0', fontSize: 13, fontWeight: 600, borderRadius: 10,
                  border: 'none', cursor: creating ? 'wait' : 'pointer',
                  background: 'linear-gradient(135deg, var(--primary), #7C3AED)',
                  color: '#fff', marginTop: 4,
                }}>
                  {creating ? <Loader size={14} className="animate-spin" /> : <UserPlus size={14} />}
                  Create User
                </button>
              </div>
            )}

            {/* Add Credit */}
            {modal === 'add_credit' && selectedUser && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <p style={{ fontSize: 13, color: 'var(--muted)', margin: 0 }}>
                  Current balance: <strong style={{ color: '#22C55E', fontFamily: 'var(--font-mono)' }}>₹{selectedUser.wallet_balance?.toFixed(2) || '0.00'}</strong>
                </p>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Amount</label>
                  <input
                    type="number"
                    value={creditAmount}
                    onChange={e => setCreditAmount(e.target.value)}
                    placeholder="e.g. 500 or -200"
                    style={{
                      width: '100%', padding: '10px 14px', fontSize: 13, color: 'var(--text)',
                      borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)',
                      background: 'rgba(255,255,255,0.04)', outline: 'none',
                      fontFamily: 'var(--font-mono)',
                    }}
                  />
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  {[100, 500, 1000, -100].map(amt => (
                    <button key={amt} onClick={() => setCreditAmount(amt.toString())} className="neu-sm" style={{
                      flex: 1, padding: '8px 0', fontSize: 12, fontWeight: 600,
                      border: 'none', borderRadius: 8, cursor: 'pointer',
                      background: creditAmount === amt.toString() ? 'rgba(99,102,241,0.15)' : undefined,
                      color: amt > 0 ? '#22C55E' : '#EF4444',
                      fontFamily: 'var(--font-mono)',
                    }}>
                      {amt > 0 ? '+' : ''}₹{amt}
                    </button>
                  ))}
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Reason</label>
                  <input
                    type="text"
                    value={creditReason}
                    onChange={e => setCreditReason(e.target.value)}
                    placeholder="Bonus, refund, correction..."
                    style={{
                      width: '100%', padding: '10px 14px', fontSize: 13, color: 'var(--text)',
                      borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)',
                      background: 'rgba(255,255,255,0.04)', outline: 'none',
                      fontFamily: 'var(--font)',
                    }}
                  />
                </div>
                <button onClick={handleAddCredit} disabled={crediting || !creditAmount} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  padding: '11px 0', fontSize: 13, fontWeight: 600, borderRadius: 10,
                  border: 'none', cursor: crediting ? 'wait' : 'pointer',
                  background: Number(creditAmount) >= 0 ? 'linear-gradient(135deg, #22C55E, #16A34A)' : 'linear-gradient(135deg, #EF4444, #DC2626)',
                  color: '#fff', marginTop: 4,
                  opacity: !creditAmount ? 0.5 : 1,
                }}>
                  {crediting ? <Loader size={14} className="animate-spin" /> : <Wallet size={14} />}
                  {Number(creditAmount) >= 0 ? 'Add Credit' : 'Deduct Credit'}
                </button>
              </div>
            )}

            {/* Membership */}
            {modal === 'membership' && selectedUser && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 12, color: 'var(--muted)' }}>Premium status:</span>
                  <span style={{
                    fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 6,
                    background: selectedUser.is_premium ? 'rgba(251,191,36,0.15)' : 'rgba(255,255,255,0.04)',
                    color: selectedUser.is_premium ? '#FBBF24' : 'var(--subtle)',
                  }}>
                    {selectedUser.is_premium ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Action</label>
                  <div style={{ display: 'flex', gap: 4, borderRadius: 10, padding: 3 }} className="neu-inset">
                    {(['activate', 'deactivate'] as const).map(a => (
                      <button key={a} onClick={() => setMemberAction(a)} style={{
                        flex: 1, padding: '8px 0', fontSize: 13, fontWeight: 500,
                        borderRadius: 8, border: 'none', cursor: 'pointer', transition: 'all 0.15s',
                        background: memberAction === a ? 'rgba(99,102,241,0.12)' : 'transparent',
                        color: memberAction === a ? 'var(--text)' : 'var(--muted)',
                        textTransform: 'capitalize', fontFamily: 'var(--font)',
                      }}>{a}</button>
                    ))}
                  </div>
                </div>
                {memberAction === 'activate' && (
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Duration</label>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {[
                        { d: '7', l: '1 week' },
                        { d: '30', l: '1 month' },
                        { d: '90', l: '3 months' },
                        { d: '365', l: '1 year' },
                      ].map(({ d, l }) => (
                        <button key={d} onClick={() => setMemberDays(d)} className="neu-sm" style={{
                          flex: 1, padding: '8px 0', fontSize: 12, fontWeight: 600,
                          border: 'none', borderRadius: 8, cursor: 'pointer',
                          background: memberDays === d ? 'rgba(251,191,36,0.15)' : undefined,
                          color: memberDays === d ? '#FBBF24' : 'var(--muted)',
                          fontFamily: 'var(--font)',
                        }}>{l}</button>
                      ))}
                    </div>
                  </div>
                )}
                <button onClick={handleMembership} disabled={membering} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  padding: '11px 0', fontSize: 13, fontWeight: 600, borderRadius: 10,
                  border: 'none', cursor: membering ? 'wait' : 'pointer',
                  background: memberAction === 'activate' ? 'linear-gradient(135deg, #FBBF24, #F59E0B)' : 'linear-gradient(135deg, #6B7280, #4B5563)',
                  color: memberAction === 'activate' ? '#000' : '#fff', marginTop: 4,
                }}>
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
