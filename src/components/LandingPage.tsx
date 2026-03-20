'use client'

import { useState, useEffect, useRef, lazy, Suspense } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Flame, Trophy, Eye, ArrowRight, TrendingUp,
  Zap, MapPin, Users, MessageSquare,
  BarChart2, Lock, Crown, LayoutDashboard,
  Shield, Star, Sparkles, ChevronRight
} from 'lucide-react'
import { RANKS } from '@/lib/ranks'
import { formatRelativeTime } from '@/lib/utils'
import { useSupabase } from '@/components/providers/SupabaseProvider'

const CherryBlossomScene = lazy(() => import('@/components/three/CherryBlossomScene'))

type RankKey = keyof typeof RANKS
const RANK_KEYS = Object.keys(RANKS) as RankKey[]

interface PreviewRumor {
  id: string
  title: string
  category: string
  heat_score: number
  created_at: string
  anonymous_alias: string
}

const TAGLINES = [
  'Drop rumors. Bust myths. Win money.',
  'Anonymous by design. Honest by nature.',
  'The city talks. We keep score.',
  'From Ghost to King — earn your rank.',
]

const CATEGORY_COLORS: Record<string, string> = {
  drama: '#EF4444', politics: '#F59E0B', music: '#A855F7',
  sports: '#22C55E', tech: '#3B82F6', romance: '#EC4899',
  crime: '#F97316', lifestyle: '#6366F1', general: '#6B7280',
}

export default function LandingPage({
  previewRumors = [],
  userCount = 0,
  rumorCount = 0,
}: {
  previewRumors?: PreviewRumor[]
  userCount?: number
  rumorCount?: number
}) {
  const { user, loading: authLoading } = useSupabase()
  const [taglineIdx, setTaglineIdx] = useState(0)
  const [mounted, setMounted] = useState(false)
  const scrollData = useRef({ y: 0 })

  useEffect(() => {
    setMounted(true)
    const t = setInterval(() => setTaglineIdx(i => (i + 1) % TAGLINES.length), 3000)
    const onScroll = () => { scrollData.current.y = window.scrollY }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => { clearInterval(t); window.removeEventListener('scroll', onScroll) }
  }, [])

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', fontFamily: 'var(--font)', overflowX: 'hidden' }}>

      {/* ── CHERRY BLOSSOM 3D BACKGROUND ── */}
      <Suspense fallback={null}>
        <CherryBlossomScene scrollData={scrollData.current} />
      </Suspense>

      {/* ── NAVBAR ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, height: 60, zIndex: 50,
        display: 'flex', alignItems: 'center',
        background: 'rgba(15,23,42,0.85)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255,255,255,0.04)',
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', width: '100%', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
            <div style={{ position: 'relative', width: 26, height: 26 }}>
              <Image src="/logo.png" alt="SANDNCO" fill style={{ objectFit: 'contain' }} />
            </div>
            <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.02em' }}>SANDNCO</span>
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {!authLoading && user ? (
              <Link href="/feed">
                <button style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '7px 16px', fontSize: 13, fontWeight: 600,
                  background: 'var(--primary)', color: '#fff', border: 'none',
                  borderRadius: 8, cursor: 'pointer', fontFamily: 'var(--font)',
                }}>
                  <LayoutDashboard style={{ width: 14, height: 14 }} /> Dashboard
                </button>
              </Link>
            ) : !authLoading ? (
              <>
                <Link href="/login">
                  <button className="hide-mobile" style={{
                    padding: '7px 14px', fontSize: 13, fontWeight: 500,
                    color: 'var(--muted)', background: 'none', border: '1px solid var(--border)',
                    borderRadius: 8, cursor: 'pointer', fontFamily: 'var(--font)',
                  }}>Log in</button>
                </Link>
                <Link href="/signup">
                  <button style={{
                    padding: '7px 16px', fontSize: 13, fontWeight: 600,
                    background: 'var(--primary)', color: '#fff', border: 'none',
                    borderRadius: 8, cursor: 'pointer', fontFamily: 'var(--font)',
                  }}>Sign up free</button>
                </Link>
              </>
            ) : null}
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{
        paddingTop: 60, minHeight: '100vh', display: 'flex', alignItems: 'center',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Background — subtle gradient, no aurora blobs */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <div style={{
            position: 'absolute', top: '-30%', left: '50%', transform: 'translateX(-50%)',
            width: '120%', height: '80%',
            background: 'radial-gradient(ellipse at 50% 0%, rgba(99,102,241,0.08) 0%, transparent 65%)',
          }} />
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: 'radial-gradient(rgba(99,102,241,0.06) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
            maskImage: 'radial-gradient(ellipse 60% 50% at 50% 30%, black 10%, transparent 60%)',
            WebkitMaskImage: 'radial-gradient(ellipse 60% 50% at 50% 30%, black 10%, transparent 60%)',
          }} />
        </div>

        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '80px 24px 60px', width: '100%', position: 'relative', zIndex: 1 }}>
          {/* Centered hero content */}
          <div style={{ textAlign: 'center', maxWidth: 680, margin: '0 auto' }}>
            {/* Beta badge */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : 12 }}
              transition={{ duration: 0.4 }}
              style={{ marginBottom: 28 }}
            >
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '5px 14px', fontSize: 12, fontWeight: 600,
                color: 'var(--primary)', borderRadius: 100,
                background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)',
              }}>
                <span style={{
                  width: 5, height: 5, borderRadius: '50%', background: 'var(--primary)',
                  boxShadow: '0 0 6px rgba(99,102,241,0.6)',
                }} />
                Beta · Faridabad
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : 24 }}
              transition={{ duration: 0.5, delay: 0.05 }}
              style={{
                fontSize: 'clamp(32px, 6vw, 64px)', fontWeight: 800,
                letterSpacing: '-0.04em', lineHeight: 1.08,
                margin: '0 0 20px',
              }}
            >
              Your city&apos;s
              <br />
              <span style={{
                background: 'linear-gradient(135deg, #6366F1 0%, #A855F7 50%, #EC4899 100%)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>open secret</span>
            </motion.h1>

            {/* Rotating tagline */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: mounted ? 1 : 0 }}
              transition={{ delay: 0.15 }}
              style={{ height: 24, marginBottom: 28, overflow: 'hidden' }}
            >
              <AnimatePresence mode="wait">
                <motion.p
                  key={taglineIdx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25 }}
                  style={{ fontSize: 16, color: 'var(--muted)', fontWeight: 400, margin: 0 }}
                >
                  {TAGLINES[taglineIdx]}
                </motion.p>
              </AnimatePresence>
            </motion.div>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : 14 }}
              transition={{ delay: 0.25 }}
              style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 40 }}
            >
              <Link href={user ? '/feed' : '/signup'}>
                <motion.button
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    padding: '13px 28px', fontSize: 15, fontWeight: 600,
                    background: 'var(--primary)', color: '#fff',
                    border: 'none', borderRadius: 10, cursor: 'pointer',
                    fontFamily: 'var(--font)',
                    boxShadow: '0 4px 20px rgba(99,102,241,0.3)',
                  }}
                >
                  {user ? 'Go to Dashboard' : 'Join Faridabad'}
                  <ArrowRight style={{ width: 15, height: 15 }} />
                </motion.button>
              </Link>
              <a href="#how-it-works" style={{ textDecoration: 'none' }}>
                <motion.button
                  whileHover={{ y: -1 }}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    padding: '12px 20px', fontSize: 14, fontWeight: 500,
                    color: 'var(--muted)', background: 'none',
                    border: '1px solid var(--border)', borderRadius: 10,
                    cursor: 'pointer', fontFamily: 'var(--font)',
                  }}
                >
                  How it works
                </motion.button>
              </a>
            </motion.div>

            {/* Stats row */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : 10 }}
              transition={{ delay: 0.35 }}
              style={{ display: 'flex', justifyContent: 'center', gap: 32, flexWrap: 'wrap' }}
            >
              {[
                { icon: Users, value: userCount || '0', label: 'Members' },
                ...(rumorCount > 0 ? [{ icon: Flame, value: rumorCount, label: 'Rumors' }] : []),
                { icon: Trophy, value: '10', label: 'Ranks' },
                { icon: Zap, value: '₹0', label: 'To start' },
              ].map(({ icon: Icon, value, label }) => (
                <div key={label} style={{ textAlign: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, marginBottom: 2 }}>
                    <Icon style={{ width: 13, height: 13, color: 'var(--subtle)' }} />
                    <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', fontFamily: 'var(--font-mono)' }}>{value}</span>
                  </div>
                  <span style={{ fontSize: 11, color: 'var(--subtle)' }}>{label}</span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Preview cards row below hero */}
          {previewRumors.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : 20 }}
              transition={{ delay: 0.5 }}
              style={{ marginTop: 64, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12, maxWidth: 900, margin: '64px auto 0' }}
            >
              {previewRumors.slice(0, 3).map((rumor, i) => (
                <MiniRumorCard key={rumor.id} rumor={rumor} index={i} />
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" style={{ padding: '80px 24px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <p style={{ fontSize: 12, color: 'var(--primary)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>How It Works</p>
          <h2 style={{ fontSize: 'clamp(24px, 4vw, 34px)', fontWeight: 700, letterSpacing: '-0.025em', margin: 0 }}>
            Four ways to play
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
          {[
            { icon: Flame, title: 'Drop Rumors', color: '#EF4444', desc: 'Post what you know under a random alias. Nobody knows who you are.' },
            { icon: Eye, title: 'Bust Myths', color: '#3B82F6', desc: 'Investigate rumors with evidence. Get verdicts: True, False, or Misleading.' },
            { icon: Trophy, title: 'Win Challenges', color: '#A855F7', desc: 'Compete in city-wide challenges with real money on the line.' },
            { icon: Crown, title: 'Rank Up', color: '#F59E0B', desc: '10 ranks from Ghost to King. Every action earns XP. Flex your rank.' },
          ].map(({ icon: Icon, title, color, desc }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              viewport={{ once: true }}
              style={{
                padding: 24, borderRadius: 14,
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                position: 'relative',
              }}
            >
              <div style={{
                width: 40, height: 40, borderRadius: 10, marginBottom: 16,
                background: `${color}12`, border: `1px solid ${color}20`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon style={{ width: 18, height: 18, color }} />
              </div>
              <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 6, color: 'var(--text)' }}>{title}</h3>
              <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.6, margin: 0 }}>{desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── LIVE FEED PREVIEW ── */}
      {previewRumors.length > 0 && (
        <section style={{ padding: '60px 24px', maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <p style={{ fontSize: 12, color: 'var(--primary)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>Live Feed</p>
              <h2 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em', margin: 0 }}>
                What Faridabad is talking about
              </h2>
            </div>
            <Link href="/signup" style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '8px 16px', fontSize: 13, fontWeight: 500, color: 'var(--muted)',
              border: '1px solid var(--border)', borderRadius: 8, textDecoration: 'none',
            }}>
              See all <ArrowRight style={{ width: 13, height: 13 }} />
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 12 }}>
            {previewRumors.map((rumor, i) => (
              <RumorPreviewCard key={rumor.id} rumor={rumor} index={i} />
            ))}
            <div style={{
              borderRadius: 14, padding: 28, border: '1px dashed var(--border)',
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', minHeight: 160, gap: 12,
            }}>
              <Lock style={{ width: 20, height: 20, color: 'var(--border-strong)' }} />
              <p style={{ fontSize: 13, color: 'var(--subtle)', textAlign: 'center', margin: 0 }}>
                Sign up to see more and interact
              </p>
              <Link href="/signup">
                <button style={{
                  padding: '7px 16px', fontSize: 13, fontWeight: 600,
                  background: 'var(--primary)', color: '#fff', border: 'none',
                  borderRadius: 8, cursor: 'pointer', fontFamily: 'var(--font)',
                }}>
                  Join free
                </button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── RANKS ── */}
      <section style={{ padding: '80px 24px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <p style={{ fontSize: 12, color: 'var(--primary)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>Ranking System</p>
          <h2 style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.02em', margin: '0 0 8px' }}>
            10 ranks. One throne.
          </h2>
          <p style={{ fontSize: 14, color: 'var(--muted)' }}>Every action earns XP. How far will you climb?</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: 8 }}>
          {RANK_KEYS.map((key, i) => {
            const r = RANKS[key]
            const isKing = i === RANK_KEYS.length - 1
            return (
              <motion.div
                key={key}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.03 }}
                viewport={{ once: true }}
                style={{
                  padding: '16px 8px', textAlign: 'center',
                  borderRadius: 12,
                  background: isKing ? 'rgba(251,191,36,0.06)' : 'var(--bg-card)',
                  border: `1px solid ${isKing ? 'rgba(251,191,36,0.2)' : 'var(--border)'}`,
                }}
              >
                <span style={{ fontSize: 24, display: 'block', marginBottom: 6 }}>{r.emoji}</span>
                <p style={{ fontSize: 11, fontWeight: 600, color: r.color, margin: '0 0 2px', lineHeight: 1.2 }}>{r.label}</p>
                <p style={{ fontSize: 9, color: 'var(--subtle)', fontFamily: 'var(--font-mono)', margin: 0 }}>{r.xpRequired.toLocaleString()} XP</p>
              </motion.div>
            )
          })}
        </div>
      </section>

      {/* ── MEMBERSHIP ── */}
      <section style={{ padding: '80px 24px', maxWidth: 800, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <p style={{ fontSize: 12, color: 'var(--primary)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>Membership</p>
          <h2 style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.02em', margin: '0 0 8px' }}>Free forever. Premium if you want more.</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }} className="membership-grid">
          {/* Free */}
          <div style={{
            borderRadius: 16, padding: 28,
            background: 'var(--bg-card)', border: '1px solid var(--border)',
          }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--subtle)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Free</p>
            <p style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.03em', marginBottom: 4 }}>₹0</p>
            <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 24 }}>For everyone. Always.</p>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24, padding: 0 }}>
              {['Post anonymous rumors', 'Vote & comment', 'Join public challenges', 'Earn XP and rank up'].map(item => (
                <li key={item} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--muted)' }}>
                  <span style={{ color: '#22C55E', fontSize: 12, fontWeight: 700 }}>✓</span>
                  {item}
                </li>
              ))}
            </ul>
            <Link href="/signup">
              <button style={{
                width: '100%', padding: '10px', fontSize: 14, fontWeight: 600,
                color: 'var(--text)', background: 'none',
                border: '1px solid var(--border)', borderRadius: 10,
                cursor: 'pointer', fontFamily: 'var(--font)',
              }}>Get started free</button>
            </Link>
          </div>

          {/* Premium */}
          <div style={{
            borderRadius: 16, padding: 28, position: 'relative',
            background: 'var(--bg-card)',
            border: '1px solid rgba(99,102,241,0.25)',
            boxShadow: '0 0 40px rgba(99,102,241,0.06)',
          }}>
            <div style={{
              position: 'absolute', top: -1, right: 16,
              padding: '3px 12px', fontSize: 10, fontWeight: 700,
              background: 'var(--primary)', color: '#fff',
              borderRadius: '0 0 6px 6px', letterSpacing: '0.04em',
            }}>POPULAR</div>
            <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Premium</p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 4 }}>
              <p style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.03em', margin: 0 }}>₹89</p>
              <span style={{ fontSize: 13, color: 'var(--muted)' }}>/month</span>
              <span style={{ fontSize: 11, color: '#22C55E', fontWeight: 600, marginLeft: 8, padding: '2px 6px', background: 'rgba(34,197,94,0.1)', borderRadius: 4 }}>Beta: ₹1</span>
            </div>
            <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 24 }}>For serious city insiders.</p>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24, padding: 0 }}>
              {[
                'Everything in Free',
                'Premium badge on profile',
                'Create your own challenges',
                'Publish city polls',
                'Priority feed placement',
                'Early access to features',
              ].map(item => (
                <li key={item} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--muted)' }}>
                  <span style={{ color: 'var(--primary)', fontSize: 12, fontWeight: 700 }}>✓</span>
                  {item}
                </li>
              ))}
            </ul>
            <Link href="/signup">
              <button style={{
                width: '100%', padding: '10px', fontSize: 14, fontWeight: 600,
                background: 'var(--primary)', color: '#fff',
                border: 'none', borderRadius: 10,
                cursor: 'pointer', fontFamily: 'var(--font)',
                boxShadow: '0 2px 12px rgba(99,102,241,0.25)',
              }}>Start Premium — ₹1 during beta</button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── COMING SOON ── */}
      <section style={{ padding: '60px 24px 80px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ marginBottom: 32 }}>
          <p style={{ fontSize: 12, color: 'var(--primary)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>Coming Soon</p>
          <h2 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em', margin: 0 }}>More ways to know your city</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
          {[
            { icon: MapPin, title: 'City Map', desc: 'See where rumors are happening across Faridabad.' },
            { icon: BarChart2, title: 'City Polls', desc: '"Best chai in Sector 15?" Let the city vote.' },
            { icon: Users, title: 'Local Challenges', desc: 'Your mohalla vs theirs. Neighborhood battles.' },
            { icon: MessageSquare, title: 'City Boards', desc: 'Topic-based discussion boards per neighborhood.' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} style={{
              borderRadius: 12, padding: 20,
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              opacity: 0.7,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <Icon style={{ width: 15, height: 15, color: 'var(--subtle)' }} />
                <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{title}</span>
              </div>
              <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.5, margin: 0 }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section style={{ padding: '80px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: 500, margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 700, letterSpacing: '-0.025em', marginBottom: 12 }}>
            Ready to join?
          </h2>
          <p style={{ fontSize: 15, color: 'var(--muted)', marginBottom: 28, lineHeight: 1.6 }}>
            We&apos;re building this with Faridabad. Join early, earn your rank, help shape the city.
          </p>
          <Link href="/signup">
            <motion.button
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '13px 28px', fontSize: 15, fontWeight: 600,
                background: 'var(--primary)', color: '#fff',
                border: 'none', borderRadius: 10,
                cursor: 'pointer', fontFamily: 'var(--font)',
                boxShadow: '0 4px 20px rgba(99,102,241,0.3)',
              }}
            >
              <Zap style={{ width: 16, height: 16 }} />
              Join SANDNCO
            </motion.button>
          </Link>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ padding: '24px', borderTop: '1px solid var(--border)' }}>
        <div style={{
          maxWidth: 1100, margin: '0 auto',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: 12,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ position: 'relative', width: 18, height: 18, opacity: 0.4 }}>
              <Image src="/logo.png" alt="" fill style={{ objectFit: 'contain' }} />
            </div>
            <span style={{ fontSize: 12, color: 'var(--subtle)' }}>SANDNCO · King of Good Times</span>
            <span style={{ fontSize: 10, color: 'var(--subtle)', padding: '1px 6px', background: 'rgba(255,255,255,0.04)', borderRadius: 3 }}>Beta</span>
          </div>
          <div style={{ display: 'flex', gap: 20 }}>
            {[
              { href: '/legal/tos', label: 'Terms' },
              { href: '/legal/privacy', label: 'Privacy' },
              { href: '/support', label: 'Support' },
            ].map(({ href, label }) => (
              <Link key={href} href={href} style={{ fontSize: 12, color: 'var(--subtle)', textDecoration: 'none' }}>
                {label}
              </Link>
            ))}
          </div>
        </div>
      </footer>

      <style>{`
        @media (max-width: 768px) {
          .membership-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}

function MiniRumorCard({ rumor, index }: { rumor: PreviewRumor; index: number }) {
  const catColor = CATEGORY_COLORS[rumor.category] || '#6B7280'
  const isHot = rumor.heat_score > 20

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 + index * 0.08 }}
      style={{
        padding: '16px 20px', borderRadius: 12,
        background: 'var(--bg-card)', border: '1px solid var(--border)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--subtle)' }}>{rumor.anonymous_alias}</span>
        <span style={{ fontSize: 10, fontWeight: 600, padding: '1px 6px', borderRadius: 4, background: `${catColor}12`, color: catColor, textTransform: 'capitalize' }}>
          {rumor.category}
        </span>
        {isHot && <Flame style={{ width: 11, height: 11, color: '#EF4444' }} />}
      </div>
      <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', margin: 0, lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
        {rumor.title}
      </p>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
        <span style={{ fontSize: 11, color: 'var(--subtle)' }}>{formatRelativeTime(rumor.created_at)}</span>
        <span style={{ fontSize: 11, fontWeight: 700, color: isHot ? '#EF4444' : 'var(--subtle)', fontFamily: 'var(--font-mono)', display: 'flex', alignItems: 'center', gap: 3 }}>
          <TrendingUp style={{ width: 10, height: 10 }} />
          {Math.floor(rumor.heat_score)}
        </span>
      </div>
    </motion.div>
  )
}

function RumorPreviewCard({ rumor, index }: { rumor: PreviewRumor; index: number }) {
  const catColor = CATEGORY_COLORS[rumor.category] || '#6B7280'
  const isHot = rumor.heat_score > 20
  const heatColor = isHot ? '#EF4444' : rumor.heat_score > 8 ? '#F59E0B' : 'var(--subtle)'

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      viewport={{ once: true }}
    >
      <Link href="/signup" style={{ textDecoration: 'none', display: 'block' }}>
        <div style={{
          padding: '18px 20px', borderRadius: 14, position: 'relative', overflow: 'hidden',
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          transition: 'border-color 0.15s',
        }}>
          {/* Heat bar */}
          <div style={{
            position: 'absolute', top: 0, left: 0,
            height: 2, width: `${Math.min(100, Math.max(15, rumor.heat_score))}%`,
            background: `linear-gradient(90deg, ${heatColor}, transparent)`,
          }} />

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--subtle)' }}>{rumor.anonymous_alias}</span>
              <span style={{ fontSize: 10, fontWeight: 600, padding: '1px 6px', borderRadius: 4, background: `${catColor}12`, color: catColor, textTransform: 'capitalize' }}>
                {rumor.category}
              </span>
            </div>
            {isHot && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 11, fontWeight: 700, color: '#EF4444', fontFamily: 'var(--font-mono)' }}>
                <Flame style={{ width: 11, height: 11 }} /> {Math.floor(rumor.heat_score)}
              </span>
            )}
          </div>

          <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', margin: '0 0 8px', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {rumor.title}
          </h3>
          <span style={{ fontSize: 11, color: 'var(--subtle)' }}>{formatRelativeTime(rumor.created_at)}</span>
        </div>
      </Link>
    </motion.div>
  )
}
