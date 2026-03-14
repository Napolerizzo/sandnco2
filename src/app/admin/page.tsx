import { createClient } from '@/lib/supabase/server'
import { Users, Flame, Trophy, Wallet, Ticket, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react'

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
    { label: 'Total Users', value: totalUsers || 0, icon: Users, color: '#06b6d4', change: '+12%' },
    { label: 'Pending Rumors', value: pendingRumors || 0, icon: Flame, color: '#f97316', change: 'needs review' },
    { label: 'Active Challenges', value: activeChallenges || 0, icon: Trophy, color: '#a855f7', change: 'running' },
    { label: 'Open Tickets', value: openTickets || 0, icon: Ticket, color: '#ef4444', change: 'needs attention' },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-4xl text-gradient-gold mb-1" style={{ fontFamily: "'Bebas Neue', cursive" }}>
          ADMIN DASHBOARD
        </h1>
        <p className="font-mono text-xs text-zinc-500">Platform overview & control center</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(({ label, value, icon: Icon, color, change }) => (
          <div key={label} className="glass rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <Icon className="w-5 h-5" style={{ color }} />
              <span className="font-mono text-xs text-zinc-600">{change}</span>
            </div>
            <p className="font-display text-3xl font-bold" style={{ color, fontFamily: "'Bebas Neue', cursive" }}>
              {value.toLocaleString()}
            </p>
            <p className="font-mono text-xs text-zinc-500 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Recent transactions */}
      <div className="glass rounded-2xl p-6">
        <h3 className="font-tech text-xs text-zinc-400 tracking-widest uppercase mb-4">Recent Transactions</h3>
        <div className="space-y-3">
          {(recentTx || []).map((tx, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${tx.status === 'completed' ? 'bg-green-400' : 'bg-yellow-400'}`} />
                <span className="font-mono text-xs text-zinc-400">{tx.type.replace('_', ' ')}</span>
              </div>
              <span className="font-tech text-xs text-white">₹{tx.amount}</span>
            </div>
          ))}
          {(!recentTx || recentTx.length === 0) && (
            <p className="font-mono text-xs text-zinc-600 text-center py-4">No transactions yet.</p>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-4 mt-6">
        <a href="/admin/rumors" className="glass-gold rounded-2xl p-5 hover:border-yellow-400/30 transition-all cursor-pointer block">
          <div className="flex items-center gap-3 mb-2">
            <AlertTriangle className="w-5 h-5 text-yellow-400" />
            <span className="font-tech text-sm text-yellow-400">Review Rumors</span>
          </div>
          <p className="font-mono text-xs text-zinc-500">{pendingRumors} pending approval</p>
        </a>
        <a href="/admin/tickets" className="glass rounded-2xl p-5 hover:border-white/10 transition-all cursor-pointer block">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle className="w-5 h-5 text-cyan-400" />
            <span className="font-tech text-sm text-cyan-400">Support Queue</span>
          </div>
          <p className="font-mono text-xs text-zinc-500">{openTickets} open tickets</p>
        </a>
      </div>
    </div>
  )
}
