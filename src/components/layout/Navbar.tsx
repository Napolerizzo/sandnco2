'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Home, Flame, Trophy, Wallet, User, Bell, Settings,
  LogOut, Menu, X, Crown, Shield, Zap, MessageCircle
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
    toast.success('See you in the city.')
    router.push('/login')
  }

  const navLinks = [
    { href: '/feed', icon: Home, label: 'Feed' },
    { href: '/rumors', icon: Flame, label: 'Rumors' },
    { href: '/challenges', icon: Trophy, label: 'Challenges' },
    { href: '/leaderboard', icon: Crown, label: 'Leaderboard' },
  ]

  const rank = profile ? RANKS[profile.rank] : null

  return (
    <>
      <motion.nav
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
          scrolled ? 'glass border-b border-white/5' : 'bg-transparent'
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          {/* Logo */}
          <Link href="/feed" className="flex items-center gap-2 group">
            <div className="relative w-8 h-8">
              <Image src="/logo.png" alt="KGT" fill className="object-contain transition-transform group-hover:scale-110" />
            </div>
            <span className="font-display text-xl tracking-wider text-gradient-gold hidden sm:block" style={{ fontFamily: "'Bebas Neue', cursive" }}>
              KING OF GOOD TIMES
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ href, icon: Icon, label }) => (
              <Link key={href} href={href}>
                <motion.div
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                    pathname?.startsWith(href)
                      ? 'text-yellow-400 bg-yellow-400/10'
                      : 'text-zinc-400 hover:text-white hover:bg-white/5'
                  }`}
                  whileTap={{ scale: 0.95 }}
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
                {/* Wallet balance */}
                <Link href="/wallet" className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-yellow-400/10 border border-yellow-400/20 hover:bg-yellow-400/15 transition-all">
                  <Zap className="w-3 h-3 text-yellow-400" />
                  <span className="font-tech text-xs text-yellow-400">{formatCurrency(profile.wallet_balance)}</span>
                </Link>

                {/* Notifications */}
                <Link href="/notifications" className="relative p-2 rounded-lg hover:bg-white/5 transition-all">
                  <Bell className="w-4 h-4 text-zinc-400 hover:text-white transition-colors" />
                  {notifCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center text-black font-bold text-[9px]">
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
                  <button className="btn-ghost px-4 py-1.5 rounded-lg text-xs font-mono">Sign in</button>
                </Link>
                <Link href="/signup">
                  <button className="btn-primary px-4 py-1.5 rounded-lg text-xs">Join Now</button>
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-white/5 transition-all"
            >
              {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
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
              className="absolute top-14 inset-x-0 glass border-b border-white/5 p-4 space-y-1"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
            >
              {navLinks.map(({ href, icon: Icon, label }) => (
                <Link key={href} href={href} onClick={() => setMobileOpen(false)}>
                  <div className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-mono ${
                    pathname?.startsWith(href) ? 'text-yellow-400 bg-yellow-400/10' : 'text-zinc-400'
                  }`}>
                    <Icon className="w-4 h-4" />{label}
                  </div>
                </Link>
              ))}
              {user && (
                <Link href="/wallet" onClick={() => setMobileOpen(false)}>
                  <div className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-mono text-zinc-400">
                    <Wallet className="w-4 h-4" />Wallet
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
        className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-white/5 transition-all"
      >
        {/* Avatar */}
        <div
          className="w-7 h-7 rounded-full border border-white/10 flex items-center justify-center text-xs font-bold overflow-hidden"
          style={rank ? { background: `linear-gradient(135deg, ${rank.color}40, ${rank.color}20)`, borderColor: `${rank.color}30` } : {}}
        >
          {profile.profile_picture_url ? (
            <Image src={profile.profile_picture_url} alt="pfp" width={28} height={28} className="object-cover" />
          ) : (
            <span style={{ color: rank?.color }}>{profile.display_name?.[0]?.toUpperCase() || '?'}</span>
          )}
        </div>
        {rank && <span className="text-lg">{rank.emoji}</span>}
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
            <motion.div
              className="absolute right-0 top-full mt-2 w-56 glass-gold rounded-xl overflow-hidden z-20"
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
            >
              <div className="p-4 border-b border-white/5">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-sm text-white font-bold">{profile.display_name || profile.username}</span>
                  {profile.is_premium && <Crown className="w-3 h-3 text-yellow-400" />}
                </div>
                <span className="text-zinc-500 font-mono text-xs">@{profile.username}</span>
                {rank && (
                  <div className="mt-2">
                    <span className={`badge-rank rank-${profile.rank.split('_')[0]}`}>
                      {rank.emoji} {rank.label}
                    </span>
                  </div>
                )}
              </div>
              <div className="p-2">
                {[
                  { icon: User, label: 'Profile', href: `/profile/${profile.username}` },
                  { icon: Settings, label: 'Settings', href: '/settings' },
                  { icon: MessageCircle, label: 'Support', href: '/support' },
                ].map(({ icon: Icon, label, href }) => (
                  <button
                    key={href}
                    onClick={() => { router.push(href); setOpen(false) }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-mono text-zinc-400 hover:text-white hover:bg-white/5 transition-all"
                  >
                    <Icon className="w-3.5 h-3.5" />{label}
                  </button>
                ))}
                {isAdmin && (
                  <button
                    onClick={() => { router.push('/admin'); setOpen(false) }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-mono text-yellow-400 hover:bg-yellow-400/10 transition-all"
                  >
                    <Shield className="w-3.5 h-3.5" />Admin Panel
                  </button>
                )}
                <button
                  onClick={() => { onSignout(); setOpen(false) }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-mono text-red-400 hover:bg-red-400/10 transition-all mt-1"
                >
                  <LogOut className="w-3.5 h-3.5" />Sign Out
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
