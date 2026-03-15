'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Home, Flame, Trophy, Wallet, User, Bell, Settings,
  LogOut, Menu, X, Crown, Shield, Zap, MessageCircle, ChevronRight
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

    supabase.from('users')
      .select('username,display_name,rank,wallet_balance,profile_picture_url,pfp_style,is_premium')
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
    toast.success('Session terminated')
    router.push('/login')
  }

  const navLinks = [
    { href: '/feed', icon: Home, label: 'Feed' },
    { href: '/rumors', icon: Flame, label: 'Rumors' },
    { href: '/challenges', icon: Trophy, label: 'Challenges' },
    { href: '/leaderboard', icon: Crown, label: 'Ranks' },
  ]

  const rank = profile ? RANKS[profile.rank] : null

  return (
    <>
      <motion.nav
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-black/90 backdrop-blur-xl border-b border-white/[0.08]'
            : 'bg-black/60 backdrop-blur-sm border-b border-white/[0.05]'
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <div className="max-w-7xl mx-auto px-5 h-16 flex items-center justify-between">

          {/* Logo */}
          <Link href="/feed" className="flex items-center gap-2.5 group">
            <div className="relative w-7 h-7">
              <Image src="/logo.png" alt="KGT" fill className="object-contain" />
            </div>
            <span className="text-sm font-bold tracking-wide text-white hidden sm:block">King of Good Times</span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ href, icon: Icon, label }) => (
              <Link key={href} href={href}>
                <motion.div
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-mono tracking-wide transition-all border ${
                    pathname?.startsWith(href)
                      ? 'text-cyan-400 border-cyan-400/25 bg-cyan-400/[0.06]'
                      : 'text-gray-400 border-transparent hover:text-white hover:border-white/10 hover:bg-white/[0.04]'
                  }`}
                  whileTap={{ scale: 0.96 }}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                </motion.div>
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {user && profile ? (
              <>
                {/* Wallet */}
                <Link href="/wallet" className="hidden sm:flex items-center gap-2 px-3 py-2 border border-white/[0.08] hover:border-cyan-400/30 transition-all text-sm text-gray-300">
                  <Zap className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="font-mono">{formatCurrency(profile.wallet_balance)}</span>
                </Link>

                {/* Notifications */}
                <Link href="/notifications" className="relative p-2.5 border border-transparent hover:border-white/10 hover:bg-white/[0.04] transition-all">
                  <Bell className="w-4 h-4 text-gray-400" />
                  {notifCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 flex items-center justify-center text-white font-bold text-[9px]">
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
                  <button className="px-4 py-2 text-sm text-gray-400 border border-white/10 hover:border-cyan-400/30 hover:text-cyan-400 transition-all font-mono">
                    Login
                  </button>
                </Link>
                <Link href="/signup">
                  <button className="px-4 py-2 text-sm font-bold bg-cyan-400 text-black hover:bg-cyan-300 transition-all">
                    Register
                  </button>
                </Link>
              </div>
            )}

            {/* Mobile toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2.5 border border-white/10 hover:border-cyan-400/30 transition-all"
            >
              {mobileOpen
                ? <X className="w-4 h-4 text-gray-300" />
                : <Menu className="w-4 h-4 text-gray-300" />}
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
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
            <motion.div
              className="absolute top-16 inset-x-0 bg-black border-b border-white/[0.08] py-3"
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -10, opacity: 0 }}
            >
              {navLinks.map(({ href, icon: Icon, label }) => (
                <Link key={href} href={href} onClick={() => setMobileOpen(false)}>
                  <div className={`flex items-center gap-3 px-5 py-3.5 text-sm transition-all ${
                    pathname?.startsWith(href)
                      ? 'text-cyan-400 bg-cyan-400/[0.05]'
                      : 'text-gray-400'
                  }`}>
                    <Icon className="w-4 h-4" />
                    {label}
                  </div>
                </Link>
              ))}
              {user && (
                <Link href="/wallet" onClick={() => setMobileOpen(false)}>
                  <div className="flex items-center gap-3 px-5 py-3.5 text-sm text-gray-400">
                    <Wallet className="w-4 h-4" />
                    Wallet
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
        className="flex items-center gap-2 p-1.5 border border-transparent hover:border-white/10 hover:bg-white/[0.04] transition-all"
      >
        <div
          className="w-8 h-8 border flex items-center justify-center text-sm font-bold overflow-hidden"
          style={rank
            ? { background: `linear-gradient(135deg, ${rank.color}20, ${rank.color}08)`, borderColor: `${rank.color}35` }
            : { borderColor: 'rgba(255,255,255,0.1)' }
          }
        >
          {profile.profile_picture_url ? (
            <Image src={profile.profile_picture_url} alt="pfp" width={32} height={32} className="object-cover" />
          ) : (
            <span style={{ color: rank?.color || '#00fff5' }}>{profile.display_name?.[0]?.toUpperCase() || '?'}</span>
          )}
        </div>
        {rank && <span className="text-base">{rank.emoji}</span>}
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
            <motion.div
              className="absolute right-0 top-full mt-2 w-60 bg-black border border-white/[0.1] overflow-hidden z-20"
              initial={{ opacity: 0, y: -8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.97 }}
              transition={{ duration: 0.15 }}
            >
              {/* Profile info */}
              <div className="p-4 border-b border-white/[0.08] bg-white/[0.02]">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-sm font-bold text-white">{profile.display_name || profile.username}</span>
                  {profile.is_premium && <Crown className="w-3.5 h-3.5 text-yellow-400" />}
                </div>
                <span className="text-gray-500 text-xs">@{profile.username}</span>
                {rank && (
                  <div className="mt-2.5">
                    <span
                      className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 border font-mono"
                      style={{ color: rank.color, borderColor: `${rank.color}35`, background: `${rank.color}10` }}
                    >
                      {rank.emoji} {rank.label}
                    </span>
                  </div>
                )}
              </div>

              {/* Menu items */}
              <div className="p-1.5">
                {[
                  { icon: User, label: 'Profile', href: `/profile/${profile.username}` },
                  { icon: Settings, label: 'Settings', href: '/settings' },
                  { icon: MessageCircle, label: 'Support', href: '/support' },
                ].map(({ icon: Icon, label, href }) => (
                  <button
                    key={href}
                    onClick={() => { router.push(href); setOpen(false) }}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-gray-400 hover:text-white hover:bg-white/[0.05] transition-all"
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {label}
                    <ChevronRight className="w-3 h-3 ml-auto opacity-40" />
                  </button>
                ))}
                {isAdmin && (
                  <button
                    onClick={() => { router.push('/admin'); setOpen(false) }}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-yellow-400 hover:bg-yellow-400/[0.06] transition-all"
                  >
                    <Shield className="w-3.5 h-3.5" />
                    Admin Panel
                    <ChevronRight className="w-3 h-3 ml-auto opacity-40" />
                  </button>
                )}
                <div className="border-t border-white/[0.06] mt-1 pt-1">
                  <button
                    onClick={() => { onSignout(); setOpen(false) }}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-red-400 hover:bg-red-400/[0.06] transition-all"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Sign Out
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
