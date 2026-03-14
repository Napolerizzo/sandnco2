'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Users, Flame, Trophy, Wallet, Ticket,
  Shield, BarChart3, LogOut, FileText, Terminal, ChevronRight, Lock
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const ADMIN_LINKS = [
  { href: '/admin', icon: LayoutDashboard, label: 'DASHBOARD', roles: ['super_admin', 'platform_admin'] },
  { href: '/admin/users', icon: Users, label: 'USERS', roles: ['super_admin', 'platform_admin', 'moderator'] },
  { href: '/admin/rumors', icon: Flame, label: 'RUMORS', roles: ['super_admin', 'platform_admin', 'moderator', 'myth_buster'] },
  { href: '/admin/challenges', icon: Trophy, label: 'CHALLENGES', roles: ['super_admin', 'platform_admin'] },
  { href: '/admin/payments', icon: Wallet, label: 'PAYMENTS', roles: ['super_admin', 'platform_admin'] },
  { href: '/admin/tickets', icon: Ticket, label: 'SUPPORT', roles: ['super_admin', 'platform_admin', 'support_staff'] },
  { href: '/admin/moderation', icon: Shield, label: 'MODERATION', roles: ['super_admin', 'platform_admin', 'moderator'] },
  { href: '/admin/analytics', icon: BarChart3, label: 'ANALYTICS', roles: ['super_admin', 'platform_admin'] },
]

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
    <aside className="fixed top-0 left-0 h-full w-64 bg-black border-r border-[var(--cyan-border)] flex flex-col z-40 font-mono">
      {/* Logo */}
      <div className="p-5 border-b border-[var(--cyan-border)]">
        <div className="flex items-center gap-3">
          <div className="relative w-7 h-7">
            <Image src="/logo.png" alt="KGT" fill className="object-contain" />
          </div>
          <div>
            <p className="text-[9px] text-[var(--cyan)] tracking-[0.2em] uppercase font-bold">ADMIN_PANEL</p>
            <p className="text-[8px] text-[var(--text-dim)] tracking-wider">KING_OF_GOOD_TIMES</p>
          </div>
        </div>
      </div>

      {/* Role badge */}
      <div className="px-4 py-3">
        <span className="text-[9px] font-bold uppercase tracking-wider px-3 py-1.5 border border-[var(--cyan)] bg-[var(--cyan-ghost)] text-[var(--cyan)] block text-center w-full">
          {role.replace(/_/g, ' ').toUpperCase()}
        </span>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        {visibleLinks.map(({ href, icon: Icon, label }) => (
          <Link key={href} href={href}>
            <div className={`flex items-center gap-2 px-3 py-2.5 text-[10px] tracking-[0.15em] transition-all border ${
              pathname === href
                ? 'text-[var(--cyan)] border-[var(--cyan-border)] bg-[var(--cyan-ghost)]'
                : 'text-[var(--text-dim)] border-transparent hover:text-[var(--cyan)] hover:border-[var(--cyan-border)] hover:bg-[var(--cyan-ghost)]'
            }`}>
              <Icon className="w-3.5 h-3.5" />
              <ChevronRight className="w-2 h-2" />
              {label}
            </div>
          </Link>
        ))}
      </nav>

      {/* Bottom */}
      <div className="p-3 border-t border-[var(--cyan-border)] space-y-1">
        <Link href="/feed">
          <div className="flex items-center gap-2 px-3 py-2 text-[10px] tracking-[0.1em] text-[var(--text-dim)] hover:text-[var(--cyan)] hover:bg-[var(--cyan-ghost)] transition-all border border-transparent hover:border-[var(--cyan-border)]">
            <FileText className="w-3.5 h-3.5" />
            <ChevronRight className="w-2 h-2" />
            BACK_TO_APP
          </div>
        </Link>
        <button onClick={handleSignout}
          className="w-full flex items-center gap-2 px-3 py-2 text-[10px] tracking-[0.1em] text-[var(--red)] hover:bg-[var(--red)]/10 transition-all border border-transparent hover:border-[var(--red)]/30">
          <LogOut className="w-3.5 h-3.5" />
          <ChevronRight className="w-2 h-2" />
          TERMINATE_SESSION
        </button>
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-[var(--cyan-border)]">
        <div className="flex items-center gap-1 text-[7px] text-[var(--text-ghost)] tracking-wider">
          <Lock className="w-2.5 h-2.5" />
          ADMIN_ACCESS: AUTHORIZED
        </div>
      </div>
    </aside>
  )
}
