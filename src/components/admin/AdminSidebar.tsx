'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, Users, Flame, Trophy, Wallet, Ticket,
  Shield, BarChart3, LogOut, FileText, ChevronRight, UserCog,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const ADMIN_LINKS = [
  { href: '/admin', icon: LayoutDashboard, label: 'Dashboard', roles: ['super_admin', 'platform_admin'] },
  { href: '/admin/users', icon: Users, label: 'Users', roles: ['super_admin', 'platform_admin', 'moderator'] },
  { href: '/admin/rumors', icon: Flame, label: 'Rumors', roles: ['super_admin', 'platform_admin', 'moderator', 'myth_buster'] },
  { href: '/admin/challenges', icon: Trophy, label: 'Challenges', roles: ['super_admin', 'platform_admin'] },
  { href: '/admin/payments', icon: Wallet, label: 'Payments', roles: ['super_admin', 'platform_admin'] },
  { href: '/admin/tickets', icon: Ticket, label: 'Support', roles: ['super_admin', 'platform_admin', 'support_staff'] },
  { href: '/admin/admins', icon: UserCog, label: 'Admins', roles: ['super_admin'] },
  { href: '/admin/moderation', icon: Shield, label: 'Moderation', roles: ['super_admin', 'platform_admin', 'moderator'] },
  { href: '/admin/analytics', icon: BarChart3, label: 'Analytics', roles: ['super_admin', 'platform_admin'] },
]

const ROLE_STYLES: Record<string, { bg: string; color: string; border: string }> = {
  super_admin: { bg: 'rgba(239,68,68,0.1)', color: '#fca5a5', border: 'rgba(239,68,68,0.25)' },
  platform_admin: { bg: 'rgba(168,85,247,0.1)', color: '#C084FC', border: 'rgba(168,85,247,0.25)' },
  moderator: { bg: 'rgba(59,130,246,0.1)', color: '#93c5fd', border: 'rgba(59,130,246,0.25)' },
  myth_buster: { bg: 'rgba(245,158,11,0.1)', color: '#fcd34d', border: 'rgba(245,158,11,0.25)' },
  support_staff: { bg: 'rgba(34,197,94,0.1)', color: '#86efac', border: 'rgba(34,197,94,0.25)' },
}

export default function AdminSidebar({ role, permissions }: { role: string; permissions: Record<string, unknown> }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const visibleLinks = ADMIN_LINKS.filter(l => l.roles.includes(role))
  const rs = ROLE_STYLES[role] || ROLE_STYLES.moderator

  const handleSignout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <aside className="glass-lg" style={{
      position: 'fixed', top: 0, left: 0, height: '100vh', width: 260,
      display: 'flex', flexDirection: 'column', zIndex: 40,
      fontFamily: 'var(--font)', borderRadius: 0,
      borderTop: 'none', borderBottom: 'none', borderLeft: 'none',
      background: 'rgba(10, 15, 30, 0.85)',
      backdropFilter: 'blur(40px) saturate(1.6)',
      WebkitBackdropFilter: 'blur(40px) saturate(1.6)',
      borderRight: '1px solid rgba(255,255,255,0.04)',
    }}>
      {/* Logo */}
      <div style={{
        padding: '20px 20px 16px',
        borderBottom: '1px solid rgba(255,255,255,0.04)',
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <div style={{
          position: 'relative', width: 32, height: 32, flexShrink: 0,
          borderRadius: 10, overflow: 'hidden',
        }}>
          <Image src="/logo.png" alt="SANDNCO" fill style={{ objectFit: 'contain' }} />
        </div>
        <div>
          <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.01em', margin: 0 }}>SANDNCO</p>
          <p style={{ fontSize: 10, color: 'var(--subtle)', margin: '1px 0 0', letterSpacing: '0.04em' }}>Admin Console</p>
        </div>
      </div>

      {/* Role badge */}
      <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        <span style={{
          display: 'block', textAlign: 'center', padding: '6px 12px',
          fontSize: 11, fontWeight: 600, borderRadius: 8,
          background: rs.bg, color: rs.color,
          border: `1px solid ${rs.border}`, letterSpacing: '0.04em',
          textTransform: 'uppercase',
        }}>
          {role.replace(/_/g, ' ')}
        </span>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '10px 10px', overflowY: 'auto' }}>
        {visibleLinks.map(({ href, icon: Icon, label }) => {
          const active = pathname === href
          return (
            <Link key={href} href={href} style={{ textDecoration: 'none', display: 'block', marginBottom: 2 }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 11,
                padding: '10px 14px', borderRadius: 10, fontSize: 13, fontWeight: 500,
                color: active ? 'var(--text)' : 'var(--muted)',
                background: active ? 'rgba(99,102,241,0.1)' : 'transparent',
                border: active ? '1px solid rgba(99,102,241,0.15)' : '1px solid transparent',
                boxShadow: active ? 'inset 0 1px 0 rgba(99,102,241,0.08)' : 'none',
                transition: 'all 0.15s', cursor: 'pointer',
              }}>
                <Icon style={{
                  width: 16, height: 16, flexShrink: 0,
                  opacity: active ? 1 : 0.5,
                  color: active ? 'var(--primary)' : undefined,
                }} />
                {label}
                {active && <ChevronRight style={{ width: 12, height: 12, marginLeft: 'auto', opacity: 0.4 }} />}
              </div>
            </Link>
          )
        })}
      </nav>

      {/* Footer links */}
      <div style={{ padding: '10px', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <Link href="/feed" style={{ textDecoration: 'none', display: 'block', marginBottom: 2 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 14px', borderRadius: 10, fontSize: 13, color: 'var(--muted)',
            transition: 'all 0.15s', cursor: 'pointer',
          }}>
            <FileText style={{ width: 15, height: 15, opacity: 0.5 }} />
            Back to app
          </div>
        </Link>
        <button
          onClick={handleSignout}
          style={{
            display: 'flex', alignItems: 'center', gap: 10, width: '100%',
            padding: '10px 14px', borderRadius: 10, fontSize: 13,
            color: 'var(--danger)', background: 'none', border: 'none',
            cursor: 'pointer', fontFamily: 'var(--font)', transition: 'all 0.15s',
          }}
        >
          <LogOut style={{ width: 15, height: 15 }} />
          Sign out
        </button>
      </div>
    </aside>
  )
}
