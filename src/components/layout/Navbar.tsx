'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Home, Flame, Trophy, TrendingUp, Bell,
  Settings, LogOut, Menu, X, Zap, ChevronRight,
  Crown, LayoutDashboard, HelpCircle, Wallet, Search,
  Shield, MapPin, BarChart2, Command
} from 'lucide-react'
import { useSupabase } from '@/components/providers/SupabaseProvider'
import { RANKS, type RankTier } from '@/lib/ranks'
import { formatCurrency } from '@/lib/utils'
import { Command as Cmdk } from 'cmdk'
import toast from 'react-hot-toast'

interface UserProfile {
  username: string
  display_name: string
  rank: RankTier
  wallet_balance: number
  profile_picture_url: string | null
  is_premium: boolean
}

const NAV_LINKS = [
  { href: '/feed', icon: Home, label: 'Feed' },
  { href: '/rumors', icon: Flame, label: 'Rumors' },
  { href: '/challenges', icon: Trophy, label: 'Challenges' },
  { href: '/leaderboard', icon: TrendingUp, label: 'Ranks' },
]

export default function Navbar() {
  const { supabase, user, loading: authLoading } = useSupabase()
  const router = useRouter()
  const pathname = usePathname()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [cmdkOpen, setCmdkOpen] = useState(false)
  const [notifCount, setNotifCount] = useState(0)
  const [isAdmin, setIsAdmin] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [profileTimedOut, setProfileTimedOut] = useState(false)

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', h, { passive: true })
    return () => window.removeEventListener('scroll', h)
  }, [])

  // ⌘K listener
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setCmdkOpen(o => !o)
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!user) { setProfile(null); setProfileTimedOut(false); return }
    // If profile doesn't load in 4s, stop showing skeleton
    const timeout = setTimeout(() => setProfileTimedOut(true), 4000)
    supabase.from('users')
      .select('username,display_name,rank,wallet_balance,profile_picture_url,is_premium')
      .eq('id', user.id).single()
      .then(async ({ data }) => {
        clearTimeout(timeout)
        if (data) {
          setProfile(data as UserProfile)
        } else {
          // Profile row missing — auto-create it
          try {
            const res = await fetch('/api/auth/ensure-profile', { method: 'POST' })
            const { profile: created } = await res.json()
            if (created) setProfile(created as UserProfile)
            else setProfileTimedOut(true)
          } catch {
            setProfileTimedOut(true)
          }
        }
      })
    supabase.from('notifications').select('id', { count: 'exact', head: true })
      .eq('user_id', user.id).eq('is_read', false)
      .then(({ count }) => setNotifCount(count || 0))
    supabase.from('admin_roles').select('role').eq('user_id', user.id).limit(1)
      .then(({ data }) => setIsAdmin((data?.length ?? 0) > 0))
  }, [user, supabase])

  const handleSignout = useCallback(async () => {
    await supabase.auth.signOut()
    toast.success('Signed out')
    router.push('/')
  }, [supabase, router])

  const rank = profile ? RANKS[profile.rank] : null
  const isActive = (href: string) => pathname?.startsWith(href) ?? false

  return (
    <>
      <nav
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, height: 64, zIndex: 50,
          display: 'flex', alignItems: 'center',
          background: scrolled ? 'rgba(15,23,42,0.95)' : 'rgba(15,23,42,0.8)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderBottom: '1px solid var(--border)',
          transition: 'background 0.2s',
        }}
      >
        <div style={{
          maxWidth: 1200, margin: '0 auto', width: '100%', padding: '0 20px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
        }}>
          {/* Logo */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', flexShrink: 0 }}>
            <div style={{ position: 'relative', width: 26, height: 26 }}>
              <Image src="/logo.png" alt="SANDNCO" fill style={{ objectFit: 'contain' }} />
            </div>
            <div className="hide-mobile" style={{ lineHeight: 1 }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.02em', display: 'block' }}>SANDNCO</span>
              <span style={{ fontSize: 10, color: 'var(--subtle)', display: 'block', marginTop: 1 }}>King of Good Times</span>
            </div>
          </Link>

          {/* Nav links */}
          <div className="hide-mobile" style={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1, justifyContent: 'center' }}>
            {NAV_LINKS.map(({ href, icon: Icon, label }) => (
              <Link key={href} href={href} style={{ textDecoration: 'none' }}>
                <div
                  className="nav-item"
                  style={{
                    color: isActive(href) ? 'var(--text)' : 'var(--muted)',
                    background: isActive(href) ? 'var(--bg-elevated)' : 'transparent',
                    fontFamily: 'var(--font)',
                  }}
                >
                  <Icon style={{ width: 14, height: 14, flexShrink: 0 }} />
                  {label}
                </div>
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
            {/* ⌘K search */}
            <button
              onClick={() => setCmdkOpen(true)}
              className="hide-mobile"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '6px 12px', fontSize: 13, color: 'var(--subtle)',
                background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                borderRadius: 'var(--r)', cursor: 'pointer', fontFamily: 'var(--font)',
                transition: 'all 0.15s',
              }}
            >
              <Search style={{ width: 13, height: 13 }} />
              Search
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 2,
                fontSize: 10, padding: '1px 6px', borderRadius: 4,
                background: 'var(--bg)', border: '1px solid var(--border)',
                color: 'var(--subtle)', lineHeight: 1.5,
              }}>
                ⌘K
              </span>
            </button>

            {(authLoading || (user && !profile && !profileTimedOut)) ? (
              /* Skeleton while auth/profile loads — no login button flash */
              <div style={{ width: 80, height: 32, background: 'var(--bg-elevated)', borderRadius: 'var(--r)', border: '1px solid var(--border)', animation: 'shimmer 1.5s ease-in-out infinite' }} />
            ) : user && !profile ? (
              /* Logged in but profile missing — show settings link */
              <Link href="/settings" style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '7px 12px', fontSize: 13, fontWeight: 500,
                background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                borderRadius: 'var(--r)', color: 'var(--muted)', textDecoration: 'none',
                fontFamily: 'var(--font)',
              }}>
                <Shield style={{ width: 13, height: 13 }} />
                {user.email?.split('@')[0] || 'Profile'}
              </Link>
            ) : user && profile ? (
              <>
                {/* Wallet */}
                <Link href="/wallet" className="hide-mobile" style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '6px 10px', fontSize: 13, color: 'var(--muted)',
                  background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                  borderRadius: 'var(--r)', textDecoration: 'none', fontFamily: 'var(--font)',
                }}>
                  <Zap style={{ width: 12, height: 12, color: 'var(--primary)' }} />
                  {formatCurrency(profile.wallet_balance)}
                </Link>

                {/* Notifications */}
                <Link href="/notifications" style={{
                  position: 'relative', padding: '8px',
                  display: 'inline-flex', borderRadius: 'var(--r)',
                  transition: 'background 0.12s', textDecoration: 'none',
                }}>
                  <Bell style={{ width: 16, height: 16, color: 'var(--muted)' }} />
                  {notifCount > 0 && (
                    <span style={{
                      position: 'absolute', top: 4, right: 4,
                      width: 14, height: 14, background: '#EF4444',
                      borderRadius: '50%', fontSize: 9, fontWeight: 700, color: '#fff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: 'var(--font)',
                    }}>
                      {notifCount > 9 ? '9+' : notifCount}
                    </span>
                  )}
                </Link>

                <ProfileDropdown profile={profile} rank={rank} isAdmin={isAdmin} onSignout={handleSignout} />
              </>
            ) : (
              <div className="hide-mobile" style={{ display: 'flex', gap: 8 }}>
                <Link href="/login">
                  <button style={{
                    padding: '7px 14px', fontSize: 14, fontWeight: 500,
                    background: 'var(--bg-elevated)', color: 'var(--muted)',
                    border: '1px solid var(--border)', borderRadius: 'var(--r)',
                    cursor: 'pointer', fontFamily: 'var(--font)', transition: 'all 0.15s',
                  }}>Login</button>
                </Link>
                <Link href="/signup">
                  <button style={{
                    padding: '7px 14px', fontSize: 14, fontWeight: 600,
                    background: 'var(--primary)', color: '#fff',
                    border: 'none', borderRadius: 'var(--r)',
                    cursor: 'pointer', fontFamily: 'var(--font)',
                  }}>Register</button>
                </Link>
              </div>
            )}

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="show-mobile"
              style={{
                padding: 8, background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                borderRadius: 'var(--r)', cursor: 'pointer', color: 'var(--muted)',
                display: 'none', alignItems: 'center', justifyContent: 'center',
              }}
            >
              {mobileOpen ? <X style={{ width: 16, height: 16 }} /> : <Menu style={{ width: 16, height: 16 }} />}
            </button>
          </div>
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
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)' }} onClick={() => setMobileOpen(false)} />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              style={{
                position: 'absolute', top: 64, right: 0, bottom: 0, width: 280,
                background: 'var(--bg-card)', borderLeft: '1px solid var(--border)',
                overflowY: 'auto', paddingTop: 8,
              }}
            >
              {NAV_LINKS.map(({ href, icon: Icon, label }) => (
                <Link key={href} href={href} onClick={() => setMobileOpen(false)} style={{ textDecoration: 'none', display: 'block' }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '13px 20px', fontSize: 15, fontWeight: 500,
                    color: isActive(href) ? 'var(--text)' : 'var(--muted)',
                    background: isActive(href) ? 'var(--bg-elevated)' : 'transparent',
                    transition: 'background 0.1s',
                  }}>
                    <Icon style={{ width: 18, height: 18, flexShrink: 0 }} />
                    {label}
                  </div>
                </Link>
              ))}

              <div style={{ height: 1, background: 'var(--border)', margin: '8px 0' }} />

              <Link href="/support" onClick={() => setMobileOpen(false)} style={{ textDecoration: 'none', display: 'block' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 20px', fontSize: 15, color: 'var(--muted)' }}>
                  <HelpCircle style={{ width: 18, height: 18 }} />
                  Support & Help
                </div>
              </Link>

              {user && profile && (
                <>
                  <Link href="/wallet" onClick={() => setMobileOpen(false)} style={{ textDecoration: 'none', display: 'block' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 20px', fontSize: 15, color: 'var(--muted)' }}>
                      <Wallet style={{ width: 18, height: 18 }} />
                      Wallet — {formatCurrency(profile.wallet_balance)}
                    </div>
                  </Link>
                  <Link href={`/profile/${profile.username}`} onClick={() => setMobileOpen(false)} style={{ textDecoration: 'none', display: 'block' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 20px', fontSize: 15, color: 'var(--muted)' }}>
                      <LayoutDashboard style={{ width: 18, height: 18 }} />
                      My Profile
                    </div>
                  </Link>
                  <div style={{ height: 1, background: 'var(--border)', margin: '8px 0' }} />
                  <button onClick={() => { handleSignout(); setMobileOpen(false) }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12, padding: '13px 20px',
                      fontSize: 15, color: 'var(--danger)', background: 'none', border: 'none',
                      cursor: 'pointer', width: '100%', textAlign: 'left', fontFamily: 'var(--font)',
                    }}>
                    <LogOut style={{ width: 18, height: 18 }} />
                    Sign Out
                  </button>
                </>
              )}

              {!user && (
                <div style={{ padding: '12px 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <Link href="/login" onClick={() => setMobileOpen(false)}>
                    <button style={{ width: '100%', padding: '12px', fontSize: 15, fontWeight: 500, background: 'var(--bg-elevated)', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: 'var(--r)', cursor: 'pointer', fontFamily: 'var(--font)' }}>Login</button>
                  </Link>
                  <Link href="/signup" onClick={() => setMobileOpen(false)}>
                    <button style={{ width: '100%', padding: '12px', fontSize: 15, fontWeight: 600, background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: 'var(--r)', cursor: 'pointer', fontFamily: 'var(--font)' }}>Join Free</button>
                  </Link>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── COMMAND PALETTE ── */}
      <AnimatePresence>
        {cmdkOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0, zIndex: 100,
              background: 'rgba(0,0,0,0.6)',
              display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
              paddingTop: '14vh',
            }}
            onClick={() => setCmdkOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: -12, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              style={{
                background: 'var(--bg-card)', border: '1px solid var(--border-strong)',
                borderRadius: 'var(--r-xl)', width: '100%', maxWidth: 520,
                boxShadow: 'var(--shadow-lg)', overflow: 'hidden',
              }}
              onClick={e => e.stopPropagation()}
            >
              <Cmdk label="Command palette">
                <Cmdk.Input placeholder="Search or jump to..." />
                <Cmdk.List>
                  <Cmdk.Empty>No results.</Cmdk.Empty>
                  <Cmdk.Group heading="Navigate">
                    {[
                      { icon: Home, label: 'Go to Feed', href: '/feed' },
                      { icon: Flame, label: 'Browse Rumors', href: '/rumors' },
                      { icon: Trophy, label: 'View Challenges', href: '/challenges' },
                      { icon: TrendingUp, label: 'Leaderboard', href: '/leaderboard' },
                      { icon: MapPin, label: 'City Map (soon)', href: '/map' },
                      { icon: BarChart2, label: 'City Polls (soon)', href: '/polls' },
                    ].map(({ icon: Icon, label, href }) => (
                      <Cmdk.Item key={href} onSelect={() => { router.push(href); setCmdkOpen(false) }}>
                        <Icon style={{ width: 15, height: 15, flexShrink: 0, opacity: 0.6 }} />
                        {label}
                        <ChevronRight style={{ width: 13, height: 13, marginLeft: 'auto', opacity: 0.3 }} />
                      </Cmdk.Item>
                    ))}
                  </Cmdk.Group>
                  {user && profile && (
                    <Cmdk.Group heading="Account">
                      {[
                        { icon: LayoutDashboard, label: 'My Profile', href: `/profile/${profile.username}` },
                        { icon: Wallet, label: 'Wallet', href: '/wallet' },
                        { icon: Settings, label: 'Settings', href: '/settings' },
                        { icon: HelpCircle, label: 'Support', href: '/support' },
                      ].map(({ icon: Icon, label, href }) => (
                        <Cmdk.Item key={href} onSelect={() => { router.push(href); setCmdkOpen(false) }}>
                          <Icon style={{ width: 15, height: 15, flexShrink: 0, opacity: 0.6 }} />
                          {label}
                        </Cmdk.Item>
                      ))}
                    </Cmdk.Group>
                  )}
                </Cmdk.List>
              </Cmdk>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

function ProfileDropdown({ profile, rank, isAdmin, onSignout }: {
  profile: UserProfile
  rank: typeof RANKS[RankTier] | null
  isAdmin: boolean
  onSignout: () => void
}) {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: 'flex', alignItems: 'center', gap: 7,
          padding: '4px 4px 4px 8px',
          background: 'var(--bg-elevated)', border: '1px solid var(--border)',
          borderRadius: 'var(--r)', cursor: 'pointer', transition: 'border-color 0.15s',
        }}
      >
        <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--muted)', fontFamily: 'var(--font)' }} className="hide-mobile">
          {profile.display_name || profile.username}
        </span>
        <div style={{
          width: 28, height: 28, borderRadius: 'var(--r-sm)',
          background: rank ? `${rank.color}20` : 'var(--bg)',
          border: `1px solid ${rank ? rank.color + '40' : 'var(--border)'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 13, fontWeight: 700, overflow: 'hidden',
          color: rank?.color || 'var(--text)', flexShrink: 0,
        }}>
          {profile.profile_picture_url
            ? <Image src={profile.profile_picture_url} alt="pfp" width={28} height={28} style={{ objectFit: 'cover' }} />
            : (profile.display_name?.[0] || profile.username?.[0] || '?').toUpperCase()
          }
        </div>
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div style={{ position: 'fixed', inset: 0, zIndex: 10 }} onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.97 }}
              transition={{ duration: 0.12, type: 'spring', stiffness: 400, damping: 30 }}
              style={{
                position: 'absolute', right: 0, top: '100%', marginTop: 8,
                width: 224, background: 'var(--bg-card)',
                border: '1px solid var(--border-strong)',
                borderRadius: 'var(--r-lg)', zIndex: 20, overflow: 'hidden',
                boxShadow: 'var(--shadow-lg)',
              }}
            >
              {/* Header */}
              <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{profile.display_name || profile.username}</span>
                  {profile.is_premium && <Crown style={{ width: 12, height: 12, color: '#F59E0B' }} />}
                </div>
                <span style={{ fontSize: 12, color: 'var(--subtle)', fontFamily: 'var(--font-mono)' }}>@{profile.username}</span>
                {rank && (
                  <div style={{ marginTop: 8 }}>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 4,
                      fontSize: 11, fontWeight: 600, padding: '2px 8px',
                      background: `${rank.color}15`, border: `1px solid ${rank.color}35`,
                      color: rank.color, borderRadius: 100,
                    }}>
                      {rank.emoji} {rank.label}
                    </span>
                  </div>
                )}
              </div>

              {/* Menu */}
              <div style={{ padding: 6 }}>
                {[
                  { icon: LayoutDashboard, label: 'My Dashboard', href: `/profile/${profile.username}` },
                  { icon: Settings, label: 'Settings', href: '/settings' },
                  { icon: Wallet, label: 'Wallet', href: '/wallet' },
                  { icon: HelpCircle, label: 'Support & Help', href: '/support' },
                ].map(({ icon: Icon, label, href }) => (
                  <button
                    key={href}
                    onClick={() => { router.push(href); setOpen(false) }}
                    className="dropdown-item"
                  >
                    <Icon style={{ width: 14, height: 14, flexShrink: 0, opacity: 0.6 }} />
                    {label}
                    <ChevronRight style={{ width: 12, height: 12, marginLeft: 'auto', opacity: 0.3 }} />
                  </button>
                ))}

                {isAdmin && (
                  <button onClick={() => { router.push('/admin'); setOpen(false) }} className="dropdown-item" style={{ color: '#F59E0B' }}>
                    <Shield style={{ width: 14, height: 14 }} />
                    Admin Panel
                  </button>
                )}

                <div style={{ height: 1, background: 'var(--border)', margin: '4px 0' }} />
                <button onClick={() => { onSignout(); setOpen(false) }} className="dropdown-item danger">
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
