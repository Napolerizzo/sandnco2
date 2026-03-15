'use client'

import { useState, useEffect } from 'react'
import { Shield, UserPlus, Trash2, Loader, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'

interface AdminEntry {
  id: string
  user_id: string
  role: string
  created_at: string
  users: { email: string; username: string; display_name: string } | null
}

const ROLE_COLORS: Record<string, { bg: string; color: string }> = {
  super_admin: { bg: 'rgba(239,68,68,0.12)', color: '#fca5a5' },
  platform_admin: { bg: 'rgba(168,85,247,0.12)', color: '#C084FC' },
  moderator: { bg: 'rgba(59,130,246,0.12)', color: '#93c5fd' },
  myth_buster: { bg: 'rgba(245,158,11,0.12)', color: '#fcd34d' },
  support_staff: { bg: 'rgba(34,197,94,0.12)', color: '#86efac' },
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
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.02em', marginBottom: 2, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Shield size={20} style={{ color: 'var(--primary)' }} />
            Admin Management
          </h1>
          <p style={{ fontSize: 13, color: 'var(--muted)' }}>Manage admin roles and permissions</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn btn-primary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <UserPlus size={13} /> Add Admin
        </button>
      </div>

      {/* Add admin form */}
      {showForm && (
        <div className="card" style={{ marginBottom: 16, padding: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 14 }}>Grant Admin Role</h3>
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
            <div style={{ flex: 1 }}>
              <label className="label">User Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="user@example.com"
                className="input"
              />
            </div>
            <div style={{ width: 180 }}>
              <label className="label">Role</label>
              <select
                value={role}
                onChange={e => setRole(e.target.value)}
                className="input"
                style={{ cursor: 'pointer' }}
              >
                <option value="moderator">Moderator</option>
                <option value="platform_admin">Platform Admin</option>
                <option value="myth_buster">Myth Buster</option>
                <option value="support_staff">Support Staff</option>
              </select>
            </div>
            <button onClick={handleAdd} disabled={adding} className="btn btn-primary" style={{ height: 42 }}>
              {adding ? <Loader size={14} className="animate-spin" /> : 'Grant'}
            </button>
          </div>
        </div>
      )}

      {/* Admin list */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
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
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['User', 'Email', 'Role', 'Since', ''].map(h => (
                  <th key={h} style={{
                    padding: '10px 16px', textAlign: 'left',
                    fontSize: 11, fontWeight: 600, color: 'var(--muted)',
                    textTransform: 'uppercase', letterSpacing: '0.06em',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {admins.map((a, i) => {
                const rc = ROLE_COLORS[a.role] || ROLE_COLORS.moderator
                return (
                  <tr key={a.id} style={{ borderBottom: i < admins.length - 1 ? '1px solid var(--border)' : 'none' }}>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>
                        {a.users?.display_name || a.users?.username || 'Unknown'}
                      </span>
                      <p style={{ fontSize: 11, color: 'var(--subtle)' }}>@{a.users?.username}</p>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 12, color: 'var(--muted)' }}>
                      {a.users?.email}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 6,
                        background: rc.bg, color: rc.color,
                      }}>
                        {a.role.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 12, color: 'var(--subtle)' }}>
                      {new Date(a.created_at).toLocaleDateString('en-IN')}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      {a.role !== 'super_admin' && (
                        <button
                          onClick={() => handleRemove(a.user_id)}
                          disabled={removing === a.user_id}
                          style={{
                            width: 28, height: 28, borderRadius: 6, border: '1px solid transparent',
                            background: 'transparent', cursor: 'pointer', display: 'flex',
                            alignItems: 'center', justifyContent: 'center', color: '#EF4444',
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
