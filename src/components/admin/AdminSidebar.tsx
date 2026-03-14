'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Users, Flame, Trophy, Wallet, Ticket,
  Shield, BarChart3, LogOut, Settings, FileText
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
    <aside className="fixed top-0 left-0 h-full w-64 glass border-r border-white/5 flex flex-col z-40">
      {/* Logo */}
      <div className="p-6 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="relative w-8 h-8">
            <Image src="/logo.png" alt="KGT" fill className="object-contain" />
          </div>
          <div>
            <p className="font-tech text-xs text-yellow-400 tracking-widest uppercase">Admin</p>
            <p className="font-mono text-xs text-zinc-500">King of Good Times</p>
          </div>
        </div>
      </div>

      {/* Role badge */}
      <div className="px-4 py-3">
        <span className="badge-rank rank-king text-xs w-full text-center block py-1.5">
          {role.replace('_', ' ').toUpperCase()}
        </span>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        {visibleLinks.map(({ href, icon: Icon, label }) => (
          <Link key={href} href={href}>
            <div className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-mono transition-all ${
              pathname === href
                ? 'bg-yellow-400/10 text-yellow-400 border border-yellow-400/20'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}>
              <Icon className="w-4 h-4" />{label}
            </div>
          </Link>
        ))}
      </nav>

      {/* Bottom */}
      <div className="p-3 border-t border-white/5 space-y-1">
        <Link href="/feed">
          <div className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-mono text-zinc-500 hover:text-white hover:bg-white/5 transition-all">
            <FileText className="w-4 h-4" />Back to App
          </div>
        </Link>
        <button onClick={handleSignout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-mono text-red-400 hover:bg-red-400/10 transition-all">
          <LogOut className="w-4 h-4" />Sign Out
        </button>
      </div>
    </aside>
  )
}
