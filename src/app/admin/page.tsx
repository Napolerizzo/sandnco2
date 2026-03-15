import { createClient } from '@/lib/supabase/server'
import {
  Users, Flame, Trophy, Ticket, AlertTriangle, CheckCircle, TrendingUp,
  ArrowUpRight, ArrowDownLeft, Clock, Crown, Wallet, Zap, Brain, Activity,
} from 'lucide-react'
import Link from 'next/link'

export default async function AdminDashboard() {
  const supabase = await createClient()

  const [
    { count: totalUsers },
    { count: pendingRumors },
    { count: activeChallenges },
    { count: openTickets },
    { count: premiumUsers },
    { count: pendingPayments },
    { data: recentTx },
    { data: recentUsers },
    { data: recentRumors },
  ] = await Promise.all([
    supabase.from('users').select('id', { count: 'exact', head: true }),
    supabase.from('rumors').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('challenges').select('id', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('support_tickets').select('id', { count: 'exact', head: true }).eq('status', 'open'),
    supabase.from('users').select('id', { count: 'exact', head: true }).eq('is_premium', true),
    supabase.from('upi_payments').select('id', { count: 'exact', head: true }).in('status', ['pending', 'submitted']),
    supabase.from('transactions').select('amount,type,status,created_at,description').order('created_at', { ascending: false }).limit(8),
    supabase.from('users').select('username,display_name,rank,xp,is_premium,created_at').order('created_at', { ascending: false }).limit(5),
    supabase.from('rumors').select('title,category,heat_score,status,created_at').order('created_at', { ascending: false }).limit(5),
  ])

  const stats = [
    { label: 'Total Users', value: totalUsers || 0, icon: Users, color: '#3B82F6', accent: 'rgba(59,130,246,0.12)', border: 'rgba(59,130,246,0.2)' },
    { label: 'Pending Rumors', value: pendingRumors || 0, icon: Flame, color: '#F59E0B', accent: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.2)' },
    { label: 'Active Challenges', value: activeChallenges || 0, icon: Trophy, color: '#6366F1', accent: 'rgba(99,102,241,0.12)', border: 'rgba(99,102,241,0.2)' },
    { label: 'Open Tickets', value: openTickets || 0, icon: Ticket, color: '#EF4444', accent: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.2)' },
    { label: 'Premium Users', value: premiumUsers || 0, icon: Crown, color: '#FBBF24', accent: 'rgba(251,191,36,0.12)', border: 'rgba(251,191,36,0.2)' },
    { label: 'Pending Payments', value: pendingPayments || 0, icon: Wallet, color: '#22C55E', accent: 'rgba(34,197,94,0.12)', border: 'rgba(34,197,94,0.2)' },
  ]

  const TX_ICON_MAP: Record<string, { icon: typeof ArrowUpRight; color: string }> = {
    deposit: { icon: ArrowDownLeft, color: '#22C55E' },
    withdrawal: { icon: ArrowUpRight, color: '#F97316' },
    challenge_entry: { icon: Trophy, color: '#F59E0B' },
    challenge_win: { icon: Trophy, color: '#A855F7' },
    membership: { icon: Crown, color: '#F59E0B' },
    refund: { icon: ArrowDownLeft, color: '#6366F1' },
    bonus: { icon: Zap, color: '#EC4899' },
  }

  const STATUS_COLORS: Record<string, string> = {
    pending: '#F59E0B', active: '#22C55E', resolved: '#3B82F6', removed: '#EF4444',
  }

  return (
    <div style={{ fontFamily: 'var(--font)' }}>
      {/* Header */}
      <div style={{ marginBottom: 28, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.025em', margin: '0 0 4px', color: 'var(--text)' }}>
            Dashboard
          </h1>
          <p style={{ fontSize: 13, color: 'var(--muted)', margin: 0 }}>
            Platform overview — SANDNCO admin
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link href="/admin/rumors" className="glass-primary" style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '7px 14px', fontSize: 12, fontWeight: 600, color: '#a5b4fc',
            borderRadius: 8, textDecoration: 'none',
          }}>
            <Brain style={{ width: 13, height: 13 }} /> AI Verify
          </Link>
        </div>
      </div>

      {/* Stats grid — Neumorphic */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: 14, marginBottom: 28 }}>
        {stats.map(({ label, value, icon: Icon, color, accent, border }) => (
          <div key={label} className="glass" style={{
            borderRadius: 14, padding: '18px 20px',
            border: `1px solid ${border}`,
            background: `linear-gradient(135deg, ${accent} 0%, rgba(17,24,39,0.55) 100%)`,
          }}>
            <div style={{
              width: 34, height: 34, borderRadius: 10, marginBottom: 14,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: accent, border: `1px solid ${border}`,
            }}>
              <Icon style={{ width: 16, height: 16, color }} />
            </div>
            <p style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text)', margin: '0 0 2px' }}>
              {value.toLocaleString()}
            </p>
            <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0 }}>{label}</p>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 18, alignItems: 'start' }}>
        {/* Recent transactions */}
        <div className="glass" style={{ borderRadius: 14, overflow: 'hidden', padding: 0 }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.04)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Activity style={{ width: 15, height: 15, color: 'var(--primary)' }} />
              <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', margin: 0 }}>Recent Transactions</h3>
            </div>
            <Link href="/admin/payments" style={{ fontSize: 12, color: 'var(--primary)', textDecoration: 'none', fontWeight: 500 }}>View all</Link>
          </div>
          <div>
            {(recentTx || []).map((tx, i) => {
              const txConf = TX_ICON_MAP[tx.type] || TX_ICON_MAP.deposit
              const TxIcon = txConf.icon
              const isCredit = ['deposit', 'challenge_win', 'refund', 'bonus'].includes(tx.type)
              return (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '11px 20px',
                  borderBottom: i < (recentTx?.length || 0) - 1 ? '1px solid rgba(255,255,255,0.03)' : 'none',
                }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: `${txConf.color}12`, border: `1px solid ${txConf.color}25`,
                  }}>
                    <TxIcon style={{ width: 14, height: 14, color: txConf.color }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', margin: 0, textTransform: 'capitalize', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {tx.description || tx.type.replace(/_/g, ' ')}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: isCredit ? '#22C55E' : '#EF4444', margin: 0, fontFamily: 'var(--font-mono)' }}>
                      {isCredit ? '+' : '-'}₹{tx.amount}
                    </p>
                    <span style={{
                      fontSize: 10, fontWeight: 600,
                      color: tx.status === 'completed' ? '#22C55E' : '#F59E0B',
                    }}>
                      {tx.status}
                    </span>
                  </div>
                </div>
              )
            })}
            {(!recentTx || recentTx.length === 0) && (
              <p style={{ fontSize: 13, color: 'var(--subtle)', textAlign: 'center', padding: '32px 0' }}>
                No transactions yet.
              </p>
            )}
          </div>
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Quick actions */}
          <div className="glass" style={{ borderRadius: 14, padding: '16px 20px' }}>
            <h3 style={{ fontSize: 13, fontWeight: 600, color: 'var(--muted)', margin: '0 0 14px', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Quick Actions</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {[
                { href: '/admin/rumors', icon: AlertTriangle, label: 'Review Rumors', count: pendingRumors || 0, color: '#F59E0B' },
                { href: '/admin/tickets', icon: Ticket, label: 'Support', count: openTickets || 0, color: '#3B82F6' },
                { href: '/admin/payments', icon: Wallet, label: 'Payments', count: pendingPayments || 0, color: '#22C55E' },
                { href: '/admin/users', icon: Users, label: 'Users', count: totalUsers || 0, color: '#6366F1' },
              ].map(({ href, icon: Icon, label, count, color }) => (
                <Link key={href} href={href} style={{ textDecoration: 'none' }}>
                  <div className="neu-sm" style={{
                    borderRadius: 10, padding: '14px', cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}>
                    <Icon style={{ width: 16, height: 16, color, marginBottom: 8 }} />
                    <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', margin: '0 0 2px' }}>{label}</p>
                    <p style={{ fontSize: 20, fontWeight: 700, color, margin: 0, fontFamily: 'var(--font-mono)' }}>{count}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Recent signups */}
          <div className="glass" style={{ borderRadius: 14, overflow: 'hidden', padding: 0 }}>
            <div style={{
              padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.04)',
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <Users style={{ width: 14, height: 14, color: '#3B82F6' }} />
              <h3 style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', margin: 0 }}>Recent Signups</h3>
            </div>
            {(recentUsers || []).map((u, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 20px',
                borderBottom: i < (recentUsers?.length || 0) - 1 ? '1px solid rgba(255,255,255,0.03)' : 'none',
              }}>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', margin: 0 }}>
                    {u.display_name || u.username}
                    {u.is_premium && <Crown style={{ width: 11, height: 11, color: '#FBBF24', marginLeft: 4, display: 'inline' }} />}
                  </p>
                  <p style={{ fontSize: 11, color: 'var(--subtle)', margin: '1px 0 0' }}>@{u.username}</p>
                </div>
                <span style={{ fontSize: 11, color: 'var(--subtle)', fontFamily: 'var(--font-mono)' }}>{u.xp} XP</span>
              </div>
            ))}
          </div>

          {/* Latest rumors */}
          <div className="glass" style={{ borderRadius: 14, overflow: 'hidden', padding: 0 }}>
            <div style={{
              padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.04)',
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <Flame style={{ width: 14, height: 14, color: '#F59E0B' }} />
              <h3 style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', margin: 0 }}>Latest Rumors</h3>
            </div>
            {(recentRumors || []).map((r, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
                padding: '10px 20px',
                borderBottom: i < (recentRumors?.length || 0) - 1 ? '1px solid rgba(255,255,255,0.03)' : 'none',
              }}>
                <p style={{ fontSize: 13, color: 'var(--text)', margin: 0, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {r.title}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                  <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: `${STATUS_COLORS[r.status] || '#6B7280'}15`, color: STATUS_COLORS[r.status] || '#6B7280', fontWeight: 600 }}>
                    {r.status}
                  </span>
                  <span style={{ fontSize: 11, color: '#F59E0B', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
                    {r.heat_score?.toFixed(0)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
