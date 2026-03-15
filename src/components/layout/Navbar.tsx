'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Home, Flame, Trophy, Crown, Bell, Settings,
  LogOut, Menu, X, Zap, MessageCircle, ChevronRight,
  LayoutDashboard, Shield, Wallet, HelpCircle, Users, TrendingUp
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
  is_premium: boolean
}

export default function Navbar() {
  const { supabase, user } = useSupabase()
  const router = useRouter()
  const pathname = usePathname()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [notifCount, setNotifCount] = useState(0)
  const [isAdmin, setIsAdmin] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!user) { setProfile(null); return }
    supabase.from('users')
      .select('username,display_name,rank,wallet_balance,profile_picture_url,is_premium')
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
    toast.success('Signed out')
    router.push('/login')
  }

  const navLinks = [
    { href: '/feed', icon: Home, label: 'Feed' },
    { href: '/rumors', icon: Flame, label: 'Rumors' },
    { href: '/challenges', icon: Trophy, label: 'Challenges' },
    { href: '/leaderboard', icon: TrendingUp, label: 'Ranks' },
  ]

  const rank = profile ? RANKS[profile.rank] : null

  const navBg = scrolled
    ? 'rgba(9, 9, 11, 0.95)'
    : 'rgba(9, 9, 11, 0.80)'

  const isActive = (href: string) => pathname?.startsWith(href)

  return (
    <>
      {/* ── DESKTOP/TABLET NAV ── */}
      <nav
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, height: 64, zIndex: 50,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 20px',
          background: navBg,
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          transition: 'background 0.2s',
        }}
      >
        {/* Logo */}
        <Link href="/feed" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', flexShrink: 0 }}>
          <div style={{ position: 'relative', width: 30, height: 30 }}>
            <Image src="/logo.png" alt="KGT" fill style={{ objectFit: 'contain' }} />
          </div>
          <span style={{ fontSize: 14, fontWeight: 700, color: '#f4f4f5', fontFamily: 'monospace', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}
            className="hide-sm"
          >
            King of Good Times
          </span>
        </Link>

        {/* Nav links (desktop) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 2 }} className="nav-desktop-links">
          {navLinks.map(({ href, icon: Icon, label }) => (
            <Link
              key={href}
              href={href}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '7px 12px', fontSize: 13, fontFamily: 'monospace',
                textDecoration: 'none', transition: 'all 0.15s',
                color: isActive(href) ? '#22d3ee' : '#71717a',
                background: isActive(href) ? 'rgba(34,211,238,0.06)' : 'transparent',
                border: isActive(href) ? '1px solid rgba(34,211,238,0.2)' : '1px solid transparent',
              }}
            >
              <Icon style={{ width: 13, height: 13, flexShrink: 0 }} />
              {label}
            </Link>
          ))}
        </div>

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {user && profile ? (
            <>
              {/* Wallet chip */}
              <Link
                href="/wallet"
                className="hide-sm"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '6px 12px',
                  border: '1px solid rgba(255,255,255,0.09)',
                  background: 'transparent', textDecoration: 'none',
                  fontSize: 13, color: '#d4d4d8', fontFamily: 'monospace',
                  transition: 'border-color 0.15s',
                }}
              >
                <Zap style={{ width: 12, height: 12, color: '#22d3ee' }} />
                {formatCurrency(profile.wallet_balance)}
              </Link>

              {/* Notifications */}
              <Link
                href="/notifications"
                style={{
                  position: 'relative', padding: '8px',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  textDecoration: 'none',
                  border: '1px solid transparent', transition: 'border-color 0.15s',
                }}
              >
                <Bell style={{ width: 16, height: 16, color: '#71717a' }} />
                {notifCount > 0 && (
                  <span
                    style={{
                      position: 'absolute', top: 2, right: 2,
                      width: 16, height: 16, background: '#ef4444',
                      borderRadius: 8,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 9, fontWeight: 700, color: '#fff', fontFamily: 'monospace',
                    }}
                  >
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
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Link href="/login">
                <button
                  style={{
                    padding: '8px 16px', fontSize: 13, color: '#a1a1aa',
                    background: 'transparent',
                    border: '1px solid rgba(255,255,255,0.1)',
                    cursor: 'pointer', fontFamily: 'monospace',
                    transition: 'all 0.15s',
                  }}
                >
                  Login
                </button>
              </Link>
              <Link href="/signup">
                <button
                  style={{
                    padding: '8px 16px', fontSize: 13, fontWeight: 700,
                    background: '#22d3ee', color: '#000',
                    border: 'none', cursor: 'pointer',
                    fontFamily: 'monospace',
                    transition: 'background 0.15s',
                  }}
                >
                  Register
                </button>
              </Link>
            </div>
          )}

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            style={{
              padding: '8px',
              display: 'none',
              alignItems: 'center', justifyContent: 'center',
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.1)',
              cursor: 'pointer', color: '#a1a1aa',
              transition: 'all 0.15s',
            }}
            className="show-mobile"
          >
            {mobileOpen ? <X style={{ width: 16, height: 16 }} /> : <Menu style={{ width: 16, height: 16 }} />}
          </button>
        </div>
      </nav>

      {/* ── MOBILE MENU ── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, zIndex: 40 }}
          >
            <div
              style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)' }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              style={{
                position: 'absolute', top: 64, right: 0, bottom: 0, width: 280,
                background: '#0f0f14',
                borderLeft: '1px solid rgba(255,255,255,0.08)',
                overflowY: 'auto',
                padding: '8px 0',
              }}
            >
              {/* Nav links */}
              {navLinks.map(({ href, icon: Icon, label }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '14px 20px', textDecoration: 'none',
                    fontSize: 15,
                    color: isActive(href) ? '#22d3ee' : '#a1a1aa',
                    background: isActive(href) ? 'rgba(34,211,238,0.05)' : 'transparent',
                    transition: 'all 0.1s',
                  }}
                >
                  <Icon style={{ width: 18, height: 18, flexShrink: 0 }} />
                  {label}
                </Link>
              ))}

              <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '8px 0' }} />

              {user && profile && (
                <>
                  <Link href="/wallet" onClick={() => setMobileOpen(false)}
                    style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 20px', textDecoration: 'none', fontSize: 15, color: '#a1a1aa' }}>
                    <Wallet style={{ width: 18, height: 18 }} />
                    Wallet — {formatCurrency(profile.wallet_balance)}
                  </Link>
                  <Link href={`/profile/${profile.username}`} onClick={() => setMobileOpen(false)}
                    style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 20px', textDecoration: 'none', fontSize: 15, color: '#a1a1aa' }}>
                    <LayoutDashboard style={{ width: 18, height: 18 }} />
                    My Dashboard
                  </Link>
                </>
              )}

              <Link href="/support" onClick={() => setMobileOpen(false)}
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 20px', textDecoration: 'none', fontSize: 15, color: '#a1a1aa' }}>
                <HelpCircle style={{ width: 18, height: 18 }} />
                Support &amp; Help
              </Link>

              {user ? (
                <>
                  <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '8px 0' }} />
                  <button
                    onClick={() => { handleSignout(); setMobileOpen(false) }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '14px 20px', width: '100%',
                      background: 'none', border: 'none', cursor: 'pointer',
                      fontSize: 15, color: '#f87171', textAlign: 'left',
                    }}
                  >
                    <LogOut style={{ width: 18, height: 18 }} />
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '8px 0' }} />
                  <div style={{ padding: '12px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <Link href="/login" onClick={() => setMobileOpen(false)}>
                      <button style={{
                        width: '100%', padding: '12px', fontSize: 15, color: '#a1a1aa',
                        background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', fontFamily: 'monospace',
                      }}>Login</button>
                    </Link>
                    <Link href="/signup" onClick={() => setMobileOpen(false)}>
                      <button style={{
                        width: '100%', padding: '12px', fontSize: 15, fontWeight: 700,
                        background: '#22d3ee', color: '#000', border: 'none', cursor: 'pointer', fontFamily: 'monospace',
                      }}>Join Free</button>
                    </Link>
                  </div>
                </>
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
    <div style={{ position: 'relative' }}>
      {/* Avatar trigger */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: 'flex', alignItems: 'center', gap: 7,
          padding: '5px 5px 5px 8px',
          background: 'transparent',
          border: '1px solid rgba(255,255,255,0.09)',
          cursor: 'pointer', transition: 'border-color 0.15s',
        }}
      >
        <div
          style={{
            width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14, fontWeight: 700, overflow: 'hidden',
            background: rank ? `linear-gradient(135deg, ${rank.color}20, ${rank.color}08)` : '#1f1f27',
            border: `1px solid ${rank ? rank.color + '30' : 'rgba(255,255,255,0.1)'}`,
            color: rank?.color || '#f4f4f5',
            flexShrink: 0,
          }}
        >
          {profile.profile_picture_url
            ? <Image src={profile.profile_picture_url} alt="pfp" width={30} height={30} style={{ objectFit: 'cover' }} />
            : (profile.display_name?.[0] || profile.username?.[0] || '?').toUpperCase()
          }
        </div>
        {rank && <span style={{ fontSize: 14, lineHeight: 1 }}>{rank.emoji}</span>}
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div style={{ position: 'fixed', inset: 0, zIndex: 10 }} onClick={() => setOpen(false)} />
            <motion.div
              style={{
                position: 'absolute', right: 0, top: '100%', marginTop: 8,
                width: 220, background: '#0f0f14',
                border: '1px solid rgba(255,255,255,0.1)',
                zIndex: 20, overflow: 'hidden',
              }}
              initial={{ opacity: 0, y: -8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.97 }}
              transition={{ duration: 0.12 }}
            >
              {/* Profile header */}
              <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.02)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#f4f4f5' }}>
                    {profile.display_name || profile.username}
                  </span>
                  {profile.is_premium && <Crown style={{ width: 12, height: 12, color: '#fbbf24' }} />}
                </div>
                <span style={{ fontSize: 12, color: '#52525b', fontFamily: 'monospace' }}>@{profile.username}</span>
                {rank && (
                  <div style={{ marginTop: 8 }}>
                    <span
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 5,
                        fontSize: 11, fontWeight: 700, padding: '3px 10px',
                        border: `1px solid ${rank.color}30`,
                        background: `${rank.color}10`,
                        color: rank.color, fontFamily: 'monospace',
                      }}
                    >
                      {rank.emoji} {rank.label}
                    </span>
                  </div>
                )}
              </div>

              {/* Menu items */}
              <div style={{ padding: '6px 0' }}>
                {[
                  { icon: LayoutDashboard, label: 'My Dashboard', href: `/profile/${profile.username}` },
                  { icon: Settings, label: 'Settings', href: '/settings' },
                  { icon: Wallet, label: 'Wallet', href: '/wallet' },
                  { icon: HelpCircle, label: 'Support & Help', href: '/support' },
                ].map(({ icon: Icon, label, href }) => (
                  <button
                    key={href}
                    onClick={() => { router.push(href); setOpen(false) }}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                      padding: '10px 16px', background: 'none', border: 'none',
                      cursor: 'pointer', fontSize: 14, color: '#a1a1aa',
                      textAlign: 'left', transition: 'all 0.1s',
                      fontFamily: 'inherit',
                    }}
                    className="dropdown-item"
                  >
                    <Icon style={{ width: 14, height: 14, flexShrink: 0 }} />
                    {label}
                    <ChevronRight style={{ width: 12, height: 12, marginLeft: 'auto', opacity: 0.3 }} />
                  </button>
                ))}

                {isAdmin && (
                  <button
                    onClick={() => { router.push('/admin'); setOpen(false) }}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                      padding: '10px 16px', background: 'none', border: 'none',
                      cursor: 'pointer', fontSize: 14, color: '#fbbf24',
                      textAlign: 'left', transition: 'all 0.1s', fontFamily: 'inherit',
                    }}
                  >
                    <Shield style={{ width: 14, height: 14 }} />
                    Admin Panel
                  </button>
                )}

                <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '4px 0' }} />
                <button
                  onClick={() => { onSignout(); setOpen(false) }}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                    padding: '10px 16px', background: 'none', border: 'none',
                    cursor: 'pointer', fontSize: 14, color: '#f87171',
                    textAlign: 'left', transition: 'all 0.1s', fontFamily: 'inherit',
                  }}
                >
                  <LogOut style={{ width: 14, height: 14 }} />
                  Sign Out
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
