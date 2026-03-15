'use client'

import { BarChart3, Users, Crown, Flame, Trophy, TrendingUp, Eye, Zap } from 'lucide-react'
import { RANKS, type RankTier } from '@/lib/ranks'

interface Props {
  stats: {
    totalUsers: number
    premiumUsers: number
    totalRumors: number
    activeRumors: number
    totalChallenges: number
    totalTransactions: number
  }
  recentSignups: { created_at: string }[]
  topUsers: {
    username: string
    display_name: string
    xp: number
    rank: RankTier
    is_premium: boolean
    rumors_posted: number
    challenges_won: number
  }[]
  hotRumors: {
    title: string
    heat_score: number
    view_count: number
    category: string
    created_at: string
  }[]
}

export default function AdminAnalyticsClient({ stats, recentSignups, topUsers, hotRumors }: Props) {
  // Simple signup histogram — last 7 days
  const days: Record<string, number> = {}
  const now = new Date()
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    const key = d.toISOString().split('T')[0]
    days[key] = 0
  }
  for (const s of recentSignups) {
    const key = s.created_at.split('T')[0]
    if (days[key] !== undefined) days[key]++
  }
  const dayEntries = Object.entries(days)
  const maxSignups = Math.max(...Object.values(days), 1)

  const conversionRate = stats.totalUsers > 0 ? ((stats.premiumUsers / stats.totalUsers) * 100).toFixed(1) : '0'

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.02em', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
          <BarChart3 size={20} style={{ color: 'var(--primary)' }} />
          Analytics
        </h1>
        <p style={{ fontSize: 13, color: 'var(--muted)' }}>Platform metrics and insights</p>
      </div>

      {/* Key metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 24 }}>
        {[
          { label: 'Total Users', value: stats.totalUsers, sub: `${stats.premiumUsers} premium`, icon: Users, color: '#3B82F6' },
          { label: 'Total Rumors', value: stats.totalRumors, sub: `${stats.activeRumors} active`, icon: Flame, color: '#F59E0B' },
          { label: 'Premium Rate', value: `${conversionRate}%`, sub: `${stats.premiumUsers} of ${stats.totalUsers}`, icon: Crown, color: '#FBBF24' },
          { label: 'Challenges', value: stats.totalChallenges, sub: 'total created', icon: Trophy, color: '#A855F7' },
          { label: 'Transactions', value: stats.totalTransactions, sub: 'completed', icon: Zap, color: '#22C55E' },
          { label: '7-day Signups', value: Object.values(days).reduce((a, b) => a + b, 0), sub: 'new users this week', icon: TrendingUp, color: '#6366F1' },
        ].map(({ label, value, sub, icon: Icon, color }) => (
          <div key={label} className="glass" style={{ borderRadius: 14, padding: '18px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{
                width: 34, height: 34, borderRadius: 10,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: `${color}12`, border: `1px solid ${color}25`,
              }}>
                <Icon style={{ width: 16, height: 16, color }} />
              </div>
            </div>
            <p style={{ fontSize: 26, fontWeight: 700, color: 'var(--text)', margin: '0 0 2px', letterSpacing: '-0.02em' }}>
              {typeof value === 'number' ? value.toLocaleString() : value}
            </p>
            <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0 }}>{label}</p>
            <p style={{ fontSize: 11, color: 'var(--subtle)', margin: '2px 0 0' }}>{sub}</p>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginBottom: 24 }}>
        {/* Signup chart — simple bar */}
        <div className="glass" style={{ borderRadius: 14, padding: '20px' }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: 6 }}>
            <TrendingUp size={15} style={{ color: 'var(--primary)' }} />
            Signups (Last 7 Days)
          </h3>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: 120, gap: 6 }}>
            {dayEntries.map(([date, count]) => {
              const height = Math.max(4, (count / maxSignups) * 100)
              const dayLabel = new Date(date + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'short' })
              return (
                <div key={date} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: count > 0 ? 'var(--text)' : 'var(--subtle)' }}>
                    {count}
                  </span>
                  <div style={{
                    width: '100%', maxWidth: 32, height: `${height}%`, minHeight: 4,
                    background: count > 0
                      ? 'linear-gradient(180deg, var(--primary) 0%, rgba(99,102,241,0.4) 100%)'
                      : 'rgba(255,255,255,0.04)',
                    borderRadius: 4,
                    boxShadow: count > 0 ? '0 2px 8px rgba(99,102,241,0.25)' : 'none',
                  }} />
                  <span style={{ fontSize: 10, color: 'var(--subtle)' }}>{dayLabel}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Hot rumors */}
        <div className="glass" style={{ borderRadius: 14, overflow: 'hidden', padding: 0 }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Flame size={15} style={{ color: '#F59E0B' }} />
            <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', margin: 0 }}>Hottest Rumors</h3>
          </div>
          {hotRumors.length === 0 ? (
            <p style={{ fontSize: 13, color: 'var(--subtle)', textAlign: 'center', padding: '32px 0' }}>No rumors yet</p>
          ) : (
            hotRumors.slice(0, 6).map((r, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '10px 20px',
                borderBottom: i < Math.min(hotRumors.length, 6) - 1 ? '1px solid rgba(255,255,255,0.03)' : 'none',
              }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--subtle)', width: 20, textAlign: 'center' }}>{i + 1}</span>
                <p style={{ fontSize: 13, color: 'var(--text)', margin: 0, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {r.title}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                  <span style={{ fontSize: 11, color: 'var(--subtle)', display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Eye size={10} /> {r.view_count}
                  </span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#F59E0B', fontFamily: 'var(--font-mono)' }}>
                    {r.heat_score?.toFixed(0)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Top Users — Leaderboard */}
      <div className="glass" style={{ borderRadius: 14, overflow: 'hidden', padding: 0 }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Trophy size={15} style={{ color: '#A855F7' }} />
          <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', margin: 0 }}>Top Users by XP</h3>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              {['#', 'User', 'Rank', 'XP', 'Rumors', 'Wins'].map(h => (
                <th key={h} style={{
                  padding: '10px 16px', textAlign: 'left',
                  fontSize: 11, fontWeight: 600, color: 'var(--subtle)',
                  textTransform: 'uppercase', letterSpacing: '0.06em',
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {topUsers.map((u, i) => {
              const rank = RANKS[u.rank] || RANKS.ghost_in_the_city
              return (
                <tr key={i} style={{ borderBottom: i < topUsers.length - 1 ? '1px solid rgba(255,255,255,0.03)' : 'none' }}>
                  <td style={{ padding: '10px 16px', fontSize: 13, fontWeight: 700, color: i < 3 ? '#FBBF24' : 'var(--subtle)' }}>
                    {i + 1}
                  </td>
                  <td style={{ padding: '10px 16px' }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>
                      {u.display_name || u.username}
                      {u.is_premium && <Crown style={{ width: 11, height: 11, color: '#FBBF24', marginLeft: 4, display: 'inline' }} />}
                    </span>
                  </td>
                  <td style={{ padding: '10px 16px' }}>
                    <span style={{ fontSize: 11, fontWeight: 600, color: rank.color }}>
                      {rank.emoji} {rank.label}
                    </span>
                  </td>
                  <td style={{ padding: '10px 16px', fontSize: 13, fontWeight: 600, color: 'var(--text)', fontFamily: 'var(--font-mono)' }}>
                    {u.xp?.toLocaleString()}
                  </td>
                  <td style={{ padding: '10px 16px', fontSize: 12, color: 'var(--muted)' }}>
                    {u.rumors_posted || 0}
                  </td>
                  <td style={{ padding: '10px 16px', fontSize: 12, color: 'var(--muted)' }}>
                    {u.challenges_won || 0}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
