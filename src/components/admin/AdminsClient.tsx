'use client'

import { useState, useEffect } from 'react'
import { Shield, UserPlus, Trash2, Loader, UserCog } from 'lucide-react'
import toast from 'react-hot-toast'

interface AdminEntry {
  id: string
  user_id: string
  role: string
  created_at: string
  users: { email: string; username: string; display_name: string } | null
}

const ROLE_STYLES: Record<string, { color: string; bg: string; border: string }> = {
  super_admin: { color: '#FCA5A5', bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.25)' },
  platform_admin: { color: '#C084FC', bg: 'rgba(168,85,247,0.12)', border: 'rgba(168,85,247,0.25)' },
  moderator: { color: '#93C5FD', bg: 'rgba(59,130,246,0.12)', border: 'rgba(59,130,246,0.25)' },
  myth_buster: { color: '#FCD34D', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.25)' },
  support_staff: { color: '#86EFAC', bg: 'rgba(34,197,94,0.12)', border: 'rgba(34,197,94,0.25)' },
}

export default function AdminsClient() {
  const [admins, setAdmins] = useState<AdminEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('moderator')
  const [adding, setAdding] = useState(false)
  const [removing, setRemoving] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)

  const fetchAdmins = async () => {
    setLoading(true)
    const res = await fetch('/api/admin/admins')
    const data = await res.json()
    setAdmins(data.admins || [])
    setLoading(false)
  }

  useEffect(() => { fetchAdmins() }, [])

  const handleAdd = async () => {
    if (!email.trim()) { toast.error('Email required'); return }
    setAdding(true)
    const res = await fetch('/api/admin/admins', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim(), role }),
    })
    const data = await res.json()
    if (data.success) {
      toast.success('Admin role granted')
      setEmail('')
      setShowForm(false)
      fetchAdmins()
    } else {
      toast.error(data.error || 'Failed')
    }
    setAdding(false)
  }

  const handleRemove = async (userId: string) => {
    setRemoving(userId)
    const res = await fetch('/api/admin/admins', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    })
    const data = await res.json()
    if (data.success) {
      toast.success('Admin role removed')
      fetchAdmins()
    } else {
      toast.error(data.error || 'Failed')
    }
    setRemoving(null)
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.02em', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
              <UserCog size={20} style={{ color: 'var(--primary)' }} />
              Admin Management
            </h1>
            <p style={{ fontSize: 13, color: 'var(--muted)' }}>Manage admin roles and permissions</p>
          </div>
          <button onClick={() => setShowForm(!showForm)} style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px',
            fontSize: 13, fontWeight: 600, borderRadius: 10, border: 'none', cursor: 'pointer',
            background: 'linear-gradient(135deg, var(--primary), #7C3AED)',
            color: '#fff', boxShadow: '0 2px 10px rgba(99,102,241,0.3)',
          }}>
            <UserPlus size={14} /> Add Admin
          </button>
        </div>
      </div>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Total Admins', value: admins.length, color: '#6366F1' },
          { label: 'Super Admins', value: admins.filter(a => a.role === 'super_admin').length, color: '#EF4444' },
          { label: 'Moderators', value: admins.filter(a => a.role === 'moderator').length, color: '#3B82F6' },
          { label: 'Support Staff', value: admins.filter(a => a.role === 'support_staff').length, color: '#22C55E' },
        ].map(({ label, value, color }) => (
          <div key={label} className="glass" style={{ borderRadius: 12, padding: '14px 16px' }}>
            <p style={{ fontSize: 22, fontWeight: 700, color, margin: '0 0 2px', fontFamily: 'var(--font-mono)' }}>{value}</p>
            <p style={{ fontSize: 11, color: 'var(--muted)', margin: 0 }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Add admin form */}
      {showForm && (
        <div className="glass" style={{ borderRadius: 14, padding: 22, marginBottom: 16 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
            <UserPlus size={14} style={{ color: 'var(--primary)' }} />
            Grant Admin Role
          </h3>
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>User Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="user@example.com"
                style={{
                  width: '100%', padding: '10px 14px', fontSize: 13, color: 'var(--text)',
                  borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)',
                  background: 'rgba(255,255,255,0.04)', outline: 'none',
                  fontFamily: 'var(--font)',
                }}
              />
            </div>
            <div style={{ width: 180 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Role</label>
              <select
                value={role}
                onChange={e => setRole(e.target.value)}
                style={{
                  width: '100%', padding: '10px 14px', fontSize: 13, color: 'var(--text)',
                  borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)',
                  background: 'rgba(255,255,255,0.04)', outline: 'none',
                  fontFamily: 'var(--font)', cursor: 'pointer',
                }}
              >
                <option value="moderator">Moderator</option>
                <option value="platform_admin">Platform Admin</option>
                <option value="myth_buster">Myth Buster</option>
                <option value="support_staff">Support Staff</option>
              </select>
            </div>
            <button onClick={handleAdd} disabled={adding} style={{
              padding: '10px 20px', fontSize: 13, fontWeight: 600, borderRadius: 10,
              border: 'none', cursor: adding ? 'wait' : 'pointer',
              background: 'linear-gradient(135deg, var(--primary), #7C3AED)',
              color: '#fff', height: 42,
            }}>
              {adding ? <Loader size={14} className="animate-spin" /> : 'Grant'}
            </button>
          </div>
        </div>
      )}

      {/* Admin list */}
      <div className="glass" style={{ borderRadius: 14, overflow: 'hidden', padding: 0 }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <Loader size={20} className="animate-spin" style={{ color: 'var(--muted)', margin: '0 auto' }} />
          </div>
        ) : admins.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--muted)' }}>
            <Shield size={32} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
            <p style={{ fontSize: 14 }}>No admins configured</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                {['User', 'Email', 'Role', 'Since', ''].map(h => (
                  <th key={h} style={{
                    padding: '10px 16px', textAlign: 'left',
                    fontSize: 11, fontWeight: 600, color: 'var(--subtle)',
                    textTransform: 'uppercase', letterSpacing: '0.06em',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {admins.map((a, i) => {
                const rc = ROLE_STYLES[a.role] || ROLE_STYLES.moderator
                return (
                  <tr key={a.id} style={{ borderBottom: i < admins.length - 1 ? '1px solid rgba(255,255,255,0.03)' : 'none' }}>
                    <td style={{ padding: '12px 16px' }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', margin: 0 }}>
                        {a.users?.display_name || a.users?.username || 'Unknown'}
                      </p>
                      <p style={{ fontSize: 11, color: 'var(--subtle)', margin: '1px 0 0' }}>@{a.users?.username}</p>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 12, color: 'var(--muted)' }}>
                      {a.users?.email}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 6,
                        background: rc.bg, color: rc.color, border: `1px solid ${rc.border}`,
                        textTransform: 'capitalize',
                      }}>
                        {a.role.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 11, color: 'var(--subtle)' }}>
                      {new Date(a.created_at).toLocaleDateString('en-IN')}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      {a.role !== 'super_admin' && (
                        <button
                          onClick={() => handleRemove(a.user_id)}
                          disabled={removing === a.user_id}
                          style={{
                            width: 30, height: 30, borderRadius: 8,
                            border: '1px solid rgba(239,68,68,0.15)',
                            background: 'rgba(239,68,68,0.06)', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#EF4444', transition: 'all 0.15s',
                          }}
                        >
                          {removing === a.user_id ? <Loader size={13} className="animate-spin" /> : <Trash2 size={13} />}
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
