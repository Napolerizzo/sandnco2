import { createClient } from '@/lib/supabase/server'
import { Users, Flame, Trophy, Ticket, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react'
import Link from 'next/link'

export default async function AdminDashboard() {
  const supabase = await createClient()

  const [
    { count: totalUsers },
    { count: pendingRumors },
    { count: activeChallenges },
    { count: openTickets },
    { data: recentTx },
  ] = await Promise.all([
    supabase.from('users').select('id', { count: 'exact', head: true }),
    supabase.from('rumors').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('challenges').select('id', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('support_tickets').select('id', { count: 'exact', head: true }).eq('status', 'open'),
    supabase.from('transactions').select('amount,type,status,created_at').order('created_at', { ascending: false }).limit(10),
  ])

  const stats = [
    { label: 'Total Users', value: totalUsers || 0, icon: Users, color: 'var(--secondary)', bg: 'rgba(59,130,246,0.1)' },
    { label: 'Pending Rumors', value: pendingRumors || 0, icon: Flame, color: 'var(--warning)', bg: 'rgba(245,158,11,0.1)' },
    { label: 'Active Challenges', value: activeChallenges || 0, icon: Trophy, color: 'var(--primary)', bg: 'var(--primary-dim)' },
    { label: 'Open Tickets', value: openTickets || 0, icon: Ticket, color: 'var(--danger)', bg: 'rgba(239,68,68,0.1)' },
  ]

  return (
    <div style={{ fontFamily: 'var(--font)' }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.025em', margin: '0 0 6px', color: 'var(--text)' }}>
          Dashboard
        </h1>
        <p style={{ fontSize: 14, color: 'var(--muted)', margin: 0 }}>
          Platform overview — SANDNCO admin
        </p>
      </div>

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 12, padding: 20,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 8,
                background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon style={{ width: 18, height: 18, color }} />
              </div>
            </div>
            <p style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.02em', color, margin: '0 0 4px' }}>
              {value.toLocaleString()}
            </p>
            <p style={{ fontSize: 13, color: 'var(--muted)', margin: 0 }}>{label}</p>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, alignItems: 'start' }}>
        {/* Recent transactions */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <TrendingUp style={{ width: 16, height: 16, color: 'var(--primary)' }} />
            <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', margin: 0 }}>Recent Transactions</h3>
          </div>
          <div>
            {(recentTx || []).map((tx, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 0', borderBottom: i < (recentTx?.length || 0) - 1 ? '1px solid var(--border)' : 'none',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 8, height: 8, borderRadius: '50%',
                    background: tx.status === 'completed' ? 'var(--success)' : 'var(--warning)',
                  }} />
                  <span style={{ fontSize: 13, color: 'var(--muted)' }}>
                    {tx.type.replace(/_/g, ' ')}
                  </span>
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', fontFamily: 'var(--font-mono)' }}>
                  ₹{tx.amount}
                </span>
              </div>
            ))}
            {(!recentTx || recentTx.length === 0) && (
              <p style={{ fontSize: 13, color: 'var(--subtle)', textAlign: 'center', padding: '20px 0' }}>
                No transactions yet.
              </p>
            )}
          </div>
        </div>

        {/* Quick actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Link href="/admin/rumors" style={{ textDecoration: 'none' }}>
            <div style={{
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: 12, padding: 20, cursor: 'pointer',
              transition: 'border-color 0.15s',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                <AlertTriangle style={{ width: 16, height: 16, color: 'var(--warning)' }} />
                <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>Review Rumors</span>
              </div>
              <p style={{ fontSize: 13, color: 'var(--muted)', margin: 0 }}>
                {pendingRumors || 0} pending approval
              </p>
            </div>
          </Link>

          <Link href="/admin/tickets" style={{ textDecoration: 'none' }}>
            <div style={{
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: 12, padding: 20, cursor: 'pointer',
              transition: 'border-color 0.15s',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                <CheckCircle style={{ width: 16, height: 16, color: 'var(--secondary)' }} />
                <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>Support Queue</span>
              </div>
              <p style={{ fontSize: 13, color: 'var(--muted)', margin: 0 }}>
                {openTickets || 0} open tickets
              </p>
            </div>
          </Link>

          <Link href="/admin/users" style={{ textDecoration: 'none' }}>
            <div style={{
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: 12, padding: 20, cursor: 'pointer',
              transition: 'border-color 0.15s',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                <Users style={{ width: 16, height: 16, color: 'var(--primary)' }} />
                <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>User Management</span>
              </div>
              <p style={{ fontSize: 13, color: 'var(--muted)', margin: 0 }}>
                {totalUsers || 0} total members
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}
