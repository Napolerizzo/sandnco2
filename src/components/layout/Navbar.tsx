'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Home, Flame, Trophy, Wallet, User, Bell, Settings,
  LogOut, Menu, X, Crown, Shield, Zap, MessageCircle,
  Terminal, ChevronRight, Lock, Activity
} from 'lucide-react'
import { useSupabase } from '@/components/providers/SupabaseProvider'
import { RANKS, type RankTier } from '@/lib/ranks'
import { formatCurrency } from '@/lib/utils'
import toast from 'react-hot-toast'

interface UserProfile {
  username: string
  display_name: string
  rank: RankTier
  wallet_balance: number
  profile_picture_url: string | null
  pfp_style: string
  is_premium: boolean
  unread_notifications: number
}

export default function Navbar() {
  const { supabase, user } = useSupabase()
  const router = useRouter()
  const pathname = usePathname()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [notifCount, setNotifCount] = useState(0)
  const [scrolled, setScrolled] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!user) { setProfile(null); return }

    supabase.from('users').select('username,display_name,rank,wallet_balance,profile_picture_url,pfp_style,is_premium')
      .eq('id', user.id).single()
      .then(({ data }) => { if (data) setProfile(data as UserProfile) })

    supabase.from('notifications').select('id', { count: 'exact', head: true })
      .eq('user_id', user.id).eq('is_read', false)
      .then(({ count }) => setNotifCount(count || 0))

    supabase.from('admin_roles').select('role').eq('user_id', user.id).limit(1)
      .then(({ data }) => setIsAdmin((data?.length ?? 0) > 0))
  }, [user, supabase])

  const handleSignout = async () => {
    await supabase.auth.signOut()
    toast.success('SESSION_TERMINATED')
    router.push('/login')
  }

  const navLinks = [
    { href: '/feed', icon: Home, label: 'FEED' },
    { href: '/rumors', icon: Flame, label: 'RUMORS' },
    { href: '/challenges', icon: Trophy, label: 'CHALLENGES' },
    { href: '/leaderboard', icon: Crown, label: 'RANKS' },
  ]

  const rank = profile ? RANKS[profile.rank] : null

  return (
    <>
      <motion.nav
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-black/90 backdrop-blur-sm border-b border-[var(--cyan-border)]'
            : 'bg-black/60 backdrop-blur-sm border-b border-[var(--cyan-border)]'
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          {/* Logo */}
          <Link href="/feed" className="flex items-center gap-2 group">
            <div className="relative w-7 h-7">
              <Image src="/logo.png" alt="KGT" fill className="object-contain transition-transform group-hover:scale-110" />
            </div>
            <span className="text-xs font-bold tracking-[0.2em] text-glow-cyan uppercase hidden sm:block">
              KING_OF_GOOD_TIMES
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ href, icon: Icon, label }) => (
              <Link key={href} href={href}>
                <motion.div
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-mono tracking-[0.15em] transition-all border ${
                    pathname?.startsWith(href)
                      ? 'text-[var(--cyan)] border-[var(--cyan-border)] bg-[var(--cyan-ghost)]'
                      : 'text-[var(--text-dim)] border-transparent hover:text-[var(--cyan)] hover:border-[var(--cyan-border)] hover:bg-[var(--cyan-ghost)]'
                  }`}
                  whileTap={{ scale: 0.95 }}
                >
                  <Icon className="w-3 h-3" />
                  {label}
                </motion.div>
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {user && profile ? (
              <>
                {/* Wallet balance */}
                <Link href="/wallet" className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 border border-[var(--cyan-border)] bg-[var(--cyan-ghost)] hover:bg-[var(--cyan)]/10 transition-all">
                  <Zap className="w-3 h-3 text-[var(--cyan)]" />
                  <span className="text-[10px] font-mono text-[var(--cyan)] tracking-wider">{formatCurrency(profile.wallet_balance)}</span>
                </Link>

                {/* Notifications */}
                <Link href="/notifications" className="relative p-2 border border-transparent hover:border-[var(--cyan-border)] hover:bg-[var(--cyan-ghost)] transition-all">
                  <Bell className="w-3.5 h-3.5 text-[var(--text-dim)] hover:text-[var(--cyan)] transition-colors" />
                  {notifCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[var(--red)] rounded-none flex items-center justify-center text-black font-bold text-[8px] border border-[var(--red)]">
                      {notifCount > 9 ? '9+' : notifCount}
                    </span>
                  )}
                </Link>

                {/* Profile dropdown */}
                <ProfileDropdown
                  profile={profile}
                  rank={rank}
                  isAdmin={isAdmin}
                  onSignout={handleSignout}
                />
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <button className="btn-outline px-4 py-1.5 text-[10px]">
                    <Lock className="w-3 h-3 inline mr-1" />LOGIN
                  </button>
                </Link>
                <Link href="/signup">
                  <button className="btn-execute px-4 py-1.5 text-[10px]">
                    <Zap className="w-3 h-3 inline mr-1" />REGISTER
                  </button>
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 border border-[var(--cyan-border)] bg-[var(--cyan-ghost)] hover:bg-[var(--cyan)]/10 transition-all"
            >
              {mobileOpen
                ? <X className="w-4 h-4 text-[var(--cyan)]" />
                : <Menu className="w-4 h-4 text-[var(--cyan)]" />}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="fixed inset-0 z-40 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
            <motion.div
              className="absolute top-14 inset-x-0 bg-black border-b border-[var(--cyan-border)] p-3 space-y-1"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
            >
              {navLinks.map(({ href, icon: Icon, label }) => (
                <Link key={href} href={href} onClick={() => setMobileOpen(false)}>
                  <div className={`flex items-center gap-3 px-4 py-3 text-[10px] font-mono tracking-[0.15em] border transition-all ${
                    pathname?.startsWith(href)
                      ? 'text-[var(--cyan)] border-[var(--cyan-border)] bg-[var(--cyan-ghost)]'
                      : 'text-[var(--text-dim)] border-transparent'
                  }`}>
                    <Icon className="w-3.5 h-3.5" />{label}
                  </div>
                </Link>
              ))}
              {user && (
                <Link href="/wallet" onClick={() => setMobileOpen(false)}>
                  <div className="flex items-center gap-3 px-4 py-3 text-[10px] font-mono tracking-[0.15em] text-[var(--text-dim)] border border-transparent">
                    <Wallet className="w-3.5 h-3.5" />WALLET
                  </div>
                </Link>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

function ProfileDropdown({
  profile, rank, isAdmin, onSignout
}: {
  profile: UserProfile
  rank: typeof RANKS[RankTier] | null
  isAdmin: boolean
  onSignout: () => void
}) {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 p-1.5 border border-transparent hover:border-[var(--cyan-border)] hover:bg-[var(--cyan-ghost)] transition-all"
      >
        {/* Avatar */}
        <div
          className="w-7 h-7 border flex items-center justify-center text-[10px] font-bold overflow-hidden"
          style={rank ? { background: `linear-gradient(135deg, ${rank.color}20, ${rank.color}10)`, borderColor: `${rank.color}40` } : { borderColor: 'var(--cyan-border)' }}
        >
          {profile.profile_picture_url ? (
            <Image src={profile.profile_picture_url} alt="pfp" width={28} height={28} className="object-cover" />
          ) : (
            <span style={{ color: rank?.color || 'var(--cyan)' }}>{profile.display_name?.[0]?.toUpperCase() || '?'}</span>
          )}
        </div>
        {rank && <span className="text-sm">{rank.emoji}</span>}
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
            <motion.div
              className="absolute right-0 top-full mt-2 w-56 bg-black border border-[var(--cyan-border)] overflow-hidden z-20"
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
            >
              {/* Profile info header */}
              <div className="p-4 border-b border-[var(--cyan-border)] bg-[var(--cyan-ghost)]">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs text-white font-bold uppercase tracking-wider">{profile.display_name || profile.username}</span>
                  {profile.is_premium && <Crown className="w-3 h-3 text-[#fbbf24]" />}
                </div>
                <span className="text-[var(--text-dim)] text-[9px] tracking-wider">@{profile.username}</span>
                {rank && (
                  <div className="mt-2">
                    <span
                      className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider px-2 py-1 border"
                      style={{ color: rank.color, borderColor: `${rank.color}40`, background: `${rank.color}10` }}
                    >
                      {rank.emoji} {rank.label.toUpperCase().replace(/\s+/g, '_')}
                    </span>
                  </div>
                )}
              </div>

              {/* Menu items */}
              <div className="p-1">
                {[
                  { icon: User, label: 'PROFILE', href: `/profile/${profile.username}` },
                  { icon: Settings, label: 'SETTINGS', href: '/settings' },
                  { icon: MessageCircle, label: 'SUPPORT', href: '/support' },
                ].map(({ icon: Icon, label, href }) => (
                  <button
                    key={href}
                    onClick={() => { router.push(href); setOpen(false) }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-[10px] font-mono tracking-[0.1em] text-[var(--text-dim)] hover:text-[var(--cyan)] hover:bg-[var(--cyan-ghost)] transition-all"
                  >
                    <Icon className="w-3 h-3" />
                    <ChevronRight className="w-2 h-2" />
                    {label}
                  </button>
                ))}
                {isAdmin && (
                  <button
                    onClick={() => { router.push('/admin'); setOpen(false) }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-[10px] font-mono tracking-[0.1em] text-[#fbbf24] hover:bg-[#fbbf24]/10 transition-all"
                  >
                    <Shield className="w-3 h-3" />
                    <ChevronRight className="w-2 h-2" />
                    ADMIN_PANEL
                  </button>
                )}
                <div className="border-t border-[var(--cyan-border)] mt-1 pt-1">
                  <button
                    onClick={() => { onSignout(); setOpen(false) }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-[10px] font-mono tracking-[0.1em] text-[var(--red)] hover:bg-[var(--red)]/10 transition-all"
                  >
                    <LogOut className="w-3 h-3" />
                    <ChevronRight className="w-2 h-2" />
                    TERMINATE_SESSION
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
