'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Users, Flame, Trophy, Wallet, Ticket,
  Shield, BarChart3, LogOut, FileText, ChevronRight,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const ADMIN_LINKS = [
  { href: '/admin', icon: LayoutDashboard, label: 'Dashboard', roles: ['super_admin', 'platform_admin'] },
  { href: '/admin/users', icon: Users, label: 'Users', roles: ['super_admin', 'platform_admin', 'moderator'] },
  { href: '/admin/rumors', icon: Flame, label: 'Rumors', roles: ['super_admin', 'platform_admin', 'moderator', 'myth_buster'] },
  { href: '/admin/challenges', icon: Trophy, label: 'Challenges', roles: ['super_admin', 'platform_admin'] },
  { href: '/admin/payments', icon: Wallet, label: 'Payments', roles: ['super_admin', 'platform_admin'] },
  { href: '/admin/tickets', icon: Ticket, label: 'Support', roles: ['super_admin', 'platform_admin', 'support_staff'] },
  { href: '/admin/moderation', icon: Shield, label: 'Moderation', roles: ['super_admin', 'platform_admin', 'moderator'] },
  { href: '/admin/analytics', icon: BarChart3, label: 'Analytics', roles: ['super_admin', 'platform_admin'] },
]

const S = {
  aside: {
    position: 'fixed' as const, top: 0, left: 0, height: '100vh', width: 240,
    background: 'var(--bg-card)', borderRight: '1px solid var(--border)',
    display: 'flex', flexDirection: 'column' as const, zIndex: 40,
    fontFamily: 'var(--font)',
  },
  logo: {
    padding: '16px 16px 12px',
    borderBottom: '1px solid var(--border)',
    display: 'flex', alignItems: 'center', gap: 10,
  },
  roleBadge: {
    padding: '8px 16px', borderBottom: '1px solid var(--border)',
  },
}

export default function AdminSidebar({ role, permissions }: { role: string; permissions: Record<string, unknown> }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const visibleLinks = ADMIN_LINKS.filter(l => l.roles.includes(role))

  const handleSignout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <aside style={S.aside}>
      {/* Logo */}
      <div style={S.logo}>
        <div style={{ position: 'relative', width: 28, height: 28, flexShrink: 0 }}>
          <Image src="/logo.png" alt="SANDNCO" fill style={{ objectFit: 'contain' }} />
        </div>
        <div>
          <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.01em', margin: 0 }}>SANDNCO</p>
          <p style={{ fontSize: 10, color: 'var(--subtle)', margin: '2px 0 0' }}>Admin Panel</p>
        </div>
      </div>

      {/* Role badge */}
      <div style={S.roleBadge}>
        <span style={{
          display: 'block', textAlign: 'center', padding: '5px 10px',
          fontSize: 11, fontWeight: 600, borderRadius: 6,
          background: 'var(--primary-dim)', color: '#a5b4fc',
          border: '1px solid rgba(99,102,241,0.25)', letterSpacing: '0.04em',
        }}>
          {role.replace(/_/g, ' ')}
        </span>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '8px 8px', overflowY: 'auto' }}>
        {visibleLinks.map(({ href, icon: Icon, label }) => {
          const active = pathname === href
          return (
            <Link key={href} href={href} style={{ textDecoration: 'none', display: 'block', marginBottom: 2 }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 12px', borderRadius: 8, fontSize: 13, fontWeight: 500,
                color: active ? 'var(--text)' : 'var(--muted)',
                background: active ? 'var(--bg-elevated)' : 'transparent',
                border: active ? '1px solid var(--border)' : '1px solid transparent',
                transition: 'all 0.12s', cursor: 'pointer',
              }}>
                <Icon style={{ width: 15, height: 15, flexShrink: 0, opacity: active ? 1 : 0.6 }} />
                {label}
                {active && <ChevronRight style={{ width: 12, height: 12, marginLeft: 'auto', opacity: 0.4 }} />}
              </div>
            </Link>
          )
        })}
      </nav>

      {/* Footer links */}
      <div style={{ padding: '8px', borderTop: '1px solid var(--border)' }}>
        <Link href="/feed" style={{ textDecoration: 'none', display: 'block', marginBottom: 2 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '9px 12px', borderRadius: 8, fontSize: 13, color: 'var(--muted)',
            transition: 'background 0.12s', cursor: 'pointer',
          }}>
            <FileText style={{ width: 15, height: 15, opacity: 0.5 }} />
            Back to app
          </div>
        </Link>
        <button
          onClick={handleSignout}
          style={{
            display: 'flex', alignItems: 'center', gap: 10, width: '100%',
            padding: '9px 12px', borderRadius: 8, fontSize: 13,
            color: 'var(--danger)', background: 'none', border: 'none',
            cursor: 'pointer', fontFamily: 'var(--font)', transition: 'background 0.12s',
          }}
        >
          <LogOut style={{ width: 15, height: 15 }} />
          Sign out
        </button>
      </div>
    </aside>
  )
}
