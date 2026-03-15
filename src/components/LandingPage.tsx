'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import {
  Flame, Trophy, Eye, ArrowRight, TrendingUp,
  Zap, MapPin, Users, MessageSquare, ChevronRight,
  BarChart2, Radio, Lock, Crown, LayoutDashboard, Sparkles,
  Shield, Target, Star
} from 'lucide-react'
import { RANKS } from '@/lib/ranks'
import { formatRelativeTime } from '@/lib/utils'
import { useSupabase } from '@/components/providers/SupabaseProvider'

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

const CITY_LINES = [
  'Faridabad has secrets. Some of them are yours.',
  'Everyone knows. Nobody says it. Until now.',
  'The streets talk. We just write it down.',
  'Anonymous by design. Honest by nature.',
]

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
  const [lineIndex, setLineIndex] = useState(0)
  const [mounted, setMounted] = useState(false)
  const [currentRankIdx, setCurrentRankIdx] = useState(0)
  const heroRef = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])
  const heroScale = useTransform(scrollYProgress, [0, 0.8], [1, 0.95])

  useEffect(() => {
    setMounted(true)
    const t1 = setInterval(() => setLineIndex(i => (i + 1) % CITY_LINES.length), 3500)
    const t2 = setInterval(() => setCurrentRankIdx(i => (i + 1) % RANK_KEYS.length), 2000)
    return () => { clearInterval(t1); clearInterval(t2) }
  }, [])

  const currentRank = RANKS[RANK_KEYS[currentRankIdx]]

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', fontFamily: 'var(--font)', overflowX: 'hidden' }}>

      {/* ── GLASSMORPHISM NAVBAR ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, height: 64, zIndex: 50,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 24px', maxWidth: 1200, margin: '0 auto', left: '50%',
        transform: 'translateX(-50%)', width: '100%',
      }}>
        <div className="glass" style={{
          position: 'fixed', top: 0, left: 0, right: 0, height: 64, zIndex: -1,
          borderRadius: 0, borderTop: 'none', borderLeft: 'none', borderRight: 'none',
        }} />

        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{ position: 'relative', width: 28, height: 28 }}>
            <Image src="/logo.png" alt="SANDNCO" fill style={{ objectFit: 'contain' }} />
          </div>
          <div style={{ lineHeight: 1 }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.02em' }}>SANDNCO</span>
            <span style={{ fontSize: 10, color: 'var(--subtle)', display: 'block', letterSpacing: '0.02em', marginTop: 1 }}>King of Good Times</span>
          </div>
        </Link>

        <div className="hide-mobile" style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {[
            { href: '#feed', label: 'Explore' },
            { href: '/login?next=/challenges', label: 'Challenges' },
            { href: '/login?next=/leaderboard', label: 'Ranks' },
          ].map(({ href, label }) => (
            <a key={href} href={href} className="nav-item" style={{ fontSize: 14 }}>{label}</a>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {!authLoading && user ? (
            <Link href="/feed">
              <button className="glass-primary" style={{
                padding: '8px 18px', fontSize: 14, fontWeight: 600, color: '#a5b4fc',
                borderRadius: 'var(--r)', cursor: 'pointer', fontFamily: 'var(--font)',
                display: 'inline-flex', alignItems: 'center', gap: 7,
              }}>
                <LayoutDashboard style={{ width: 15, height: 15 }} /> Dashboard
              </button>
            </Link>
          ) : !authLoading ? (
            <>
              <Link href="/login">
                <button className="glass-sm hide-mobile" style={{
                  padding: '7px 14px', fontSize: 14, fontWeight: 500,
                  color: 'var(--muted)', borderRadius: 'var(--r)',
                  cursor: 'pointer', fontFamily: 'var(--font)',
                }}>Login</button>
              </Link>
              <Link href="/signup">
                <button className="glass-primary" style={{
                  padding: '8px 18px', fontSize: 14, fontWeight: 600, color: '#a5b4fc',
                  borderRadius: 'var(--r)', cursor: 'pointer', fontFamily: 'var(--font)',
                }}>Join Free</button>
              </Link>
            </>
          ) : (
            <div className="skeleton" style={{ width: 100, height: 34, borderRadius: 'var(--r)' }} />
          )}
        </div>
      </nav>

      {/* ── HERO — COMPLETELY REBUILT ── */}
      <motion.section
        ref={heroRef}
        style={{ paddingTop: 64, minHeight: '100vh', display: 'flex', alignItems: 'center', position: 'relative', overflow: 'hidden', opacity: heroOpacity, scale: heroScale }}
      >
        {/* Aurora background blobs */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
          {/* Primary aurora */}
          <div style={{
            position: 'absolute', top: '-20%', left: '10%', width: '80%', height: '60%',
            background: 'radial-gradient(ellipse at 30% 50%, rgba(99,102,241,0.2) 0%, transparent 60%)',
            filter: 'blur(80px)', animation: 'aurora 15s ease-in-out infinite',
          }} />
          {/* Secondary warm glow */}
          <div style={{
            position: 'absolute', top: '30%', right: '-10%', width: '50%', height: '50%',
            background: 'radial-gradient(ellipse at center, rgba(168,85,247,0.12) 0%, transparent 60%)',
            filter: 'blur(60px)', animation: 'aurora 18s ease-in-out infinite reverse',
          }} />
          {/* Accent warm spot */}
          <div style={{
            position: 'absolute', bottom: '10%', left: '20%', width: '30%', height: '30%',
            background: 'radial-gradient(circle, rgba(245,158,11,0.08) 0%, transparent 60%)',
            filter: 'blur(50px)', animation: 'aurora 12s ease-in-out infinite',
          }} />
          {/* Grid overlay */}
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: 'linear-gradient(rgba(99,102,241,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.04) 1px, transparent 1px)',
            backgroundSize: '72px 72px',
            maskImage: 'radial-gradient(ellipse 80% 70% at 50% 40%, black 20%, transparent 75%)',
            WebkitMaskImage: 'radial-gradient(ellipse 80% 70% at 50% 40%, black 20%, transparent 75%)',
          }} />
        </div>

        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '60px 24px 80px', width: '100%', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'center' }} className="hero-grid">

            {/* Left — Copy */}
            <div>
              {/* Glowing badge */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : 16 }}
                transition={{ duration: 0.5 }}
                style={{ marginBottom: 32 }}
              >
                <span className="glass-primary" style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  padding: '6px 16px', fontSize: 12, fontWeight: 600, color: '#a5b4fc', borderRadius: 100,
                }}>
                  <span style={{
                    width: 6, height: 6, borderRadius: '50%', background: '#a5b4fc',
                    animation: 'pulse-ring 2s infinite', flexShrink: 0,
                    boxShadow: '0 0 8px rgba(165,180,252,0.6)',
                  }} />
                  Early Access · Faridabad, India
                </span>
              </motion.div>

              {/* Headline */}
              <motion.h1
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : 40 }}
                transition={{ duration: 0.7, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  fontSize: 'clamp(36px, 6vw, 72px)',
                  fontWeight: 800,
                  letterSpacing: '-0.04em',
                  lineHeight: 1.04,
                  marginBottom: 8,
                }}
              >
                The city&apos;s
                <br />
                <span className="text-gradient" style={{ display: 'inline' }}>
                  intelligence
                </span>
                <br />
                <span style={{ color: 'var(--text)' }}>network.</span>
              </motion.h1>

              {/* Rotating subtitle */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: mounted ? 1 : 0 }}
                transition={{ delay: 0.25 }}
                style={{ height: 28, marginBottom: 24, overflow: 'hidden' }}
              >
                <AnimatePresence mode="wait">
                  <motion.p
                    key={lineIndex}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -14 }}
                    transition={{ duration: 0.35 }}
                    style={{ fontSize: 17, color: 'var(--muted)', fontWeight: 400, margin: 0 }}
                  >
                    {CITY_LINES[lineIndex]}
                  </motion.p>
                </AnimatePresence>
              </motion.div>

              {/* Description */}
              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : 12 }}
                transition={{ delay: 0.32 }}
                style={{ fontSize: 16, color: 'var(--subtle)', maxWidth: 460, lineHeight: 1.7, marginBottom: 36 }}
              >
                Anonymous rumors. Real-money challenges. Myth-busting investigations. 10 ranks from Ghost to King.
              </motion.p>

              {/* CTAs — Neumorphic buttons */}
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : 14 }}
                transition={{ delay: 0.4 }}
                style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', marginBottom: 48 }}
              >
                <Link href={user ? '/feed' : '/signup'}>
                  <motion.button
                    whileHover={{ y: -3, boxShadow: '0 12px 40px rgba(99,102,241,0.4), -4px -4px 12px rgba(30,41,59,0.2)' }}
                    whileTap={{ scale: 0.97 }}
                    className="neu-btn"
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 8,
                      padding: '14px 28px', fontSize: 15, fontWeight: 600,
                      background: 'linear-gradient(135deg, var(--primary) 0%, #818CF8 100%)',
                      color: '#fff', borderRadius: 'var(--r-md)', cursor: 'pointer',
                      fontFamily: 'var(--font)',
                      boxShadow: '0 8px 32px rgba(99,102,241,0.3), inset 0 1px 0 rgba(255,255,255,0.2)',
                    }}
                  >
                    <Zap style={{ width: 16, height: 16 }} />
                    {user ? 'Go to Dashboard' : 'Join Faridabad'}
                  </motion.button>
                </Link>
                <a href="#feed" style={{ textDecoration: 'none' }}>
                  <motion.button
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    className="glass"
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 8,
                      padding: '13px 22px', fontSize: 15, fontWeight: 500,
                      color: 'var(--text)', borderRadius: 'var(--r-md)',
                      cursor: 'pointer', fontFamily: 'var(--font)',
                    }}
                  >
                    See what&apos;s happening
                    <ArrowRight style={{ width: 15, height: 15 }} />
                  </motion.button>
                </a>
              </motion.div>

              {/* Stats — Glass panels */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : 12 }}
                transition={{ delay: 0.55 }}
                style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}
              >
                <div className="glass" style={{ padding: '14px 20px', borderRadius: 'var(--r-lg)', minWidth: 100 }}>
                  <p style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.02em', margin: 0 }}>
                    {userCount || '0'}
                  </p>
                  <p style={{ fontSize: 11, color: 'var(--subtle)', margin: '2px 0 0', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Users style={{ width: 11, height: 11 }} /> Members
                  </p>
                </div>
                {rumorCount > 0 && (
                  <div className="glass" style={{ padding: '14px 20px', borderRadius: 'var(--r-lg)', minWidth: 100 }}>
                    <p style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.02em', margin: 0 }}>
                      {rumorCount}
                    </p>
                    <p style={{ fontSize: 11, color: 'var(--subtle)', margin: '2px 0 0', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Radio style={{ width: 11, height: 11 }} /> Rumors
                    </p>
                  </div>
                )}
                <div className="glass" style={{ padding: '14px 20px', borderRadius: 'var(--r-lg)', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={currentRankIdx}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.25 }}
                      style={{ fontSize: 12, fontWeight: 600, color: currentRank.color, display: 'flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap' }}
                    >
                      <span style={{ fontSize: 16 }}>{currentRank.emoji}</span>
                      {currentRank.label}
                    </motion.span>
                  </AnimatePresence>
                </div>
              </motion.div>
            </div>

            {/* Right — Floating glass cards */}
            <div className="hide-mobile" style={{ position: 'relative', height: 520, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {/* Central orbiting glow */}
              <div style={{
                position: 'absolute', width: 280, height: 280,
                background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)',
                borderRadius: '50%', animation: 'glow-pulse 4s ease-in-out infinite',
              }} />

              {/* Main glass card — rumor preview */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: mounted ? 1 : 0, scale: mounted ? 1 : 0.9 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="glass-lg"
                style={{
                  padding: '28px', borderRadius: 20, width: 320, position: 'relative', zIndex: 2,
                  animation: 'float 6s ease-in-out infinite',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                  <Flame style={{ width: 16, height: 16, color: '#EF4444' }} />
                  <span style={{ fontSize: 11, fontWeight: 600, color: '#fca5a5', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Hot Rumor</span>
                </div>
                <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', lineHeight: 1.4, marginBottom: 12 }}>
                  &ldquo;The new mall in Sector 21 is secretly being built by...&rdquo;
                </p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 12, color: 'var(--subtle)', fontFamily: 'var(--font-mono)' }}>shadow_hawk_42</span>
                  <div style={{ display: 'flex', gap: 12, fontSize: 12, color: 'var(--subtle)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                      <Eye style={{ width: 12, height: 12 }} /> 847
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 3, color: '#EF4444', fontWeight: 600 }}>
                      <TrendingUp style={{ width: 12, height: 12 }} /> 94.2
                    </span>
                  </div>
                </div>
                {/* Heat bar */}
                <div style={{ marginTop: 12, height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: '82%', background: 'linear-gradient(90deg, #EF4444, #F59E0B)', borderRadius: 2 }} />
                </div>
              </motion.div>

              {/* Floating rank card — top-left */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: mounted ? 0.85 : 0, x: mounted ? 0 : -20 }}
                transition={{ delay: 0.7, duration: 0.5 }}
                className="glass"
                style={{
                  position: 'absolute', top: 30, left: -20, padding: '12px 18px', borderRadius: 14,
                  display: 'flex', alignItems: 'center', gap: 10, animation: 'float 7s ease-in-out 1s infinite',
                  zIndex: 3,
                }}
              >
                <span style={{ fontSize: 22 }}>⚡</span>
                <div>
                  <p style={{ fontSize: 12, fontWeight: 700, color: '#F97316', margin: 0 }}>Chaos Agent</p>
                  <p style={{ fontSize: 10, color: 'var(--subtle)', fontFamily: 'var(--font-mono)', margin: '1px 0 0' }}>12,000 XP</p>
                </div>
              </motion.div>

              {/* Trophy card — bottom-right */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: mounted ? 0.85 : 0, x: mounted ? 0 : 20 }}
                transition={{ delay: 0.8, duration: 0.5 }}
                className="glass-warm"
                style={{
                  position: 'absolute', bottom: 50, right: -10, padding: '14px 20px', borderRadius: 14,
                  display: 'flex', alignItems: 'center', gap: 10, animation: 'float 8s ease-in-out 2s infinite',
                  zIndex: 3,
                }}
              >
                <Trophy style={{ width: 18, height: 18, color: '#FBBF24' }} />
                <div>
                  <p style={{ fontSize: 12, fontWeight: 700, color: '#FBBF24', margin: 0 }}>Challenge Won</p>
                  <p style={{ fontSize: 10, color: 'var(--subtle)', margin: '1px 0 0' }}>+₹2,500 prize</p>
                </div>
              </motion.div>

              {/* Notification card — top-right */}
              <motion.div
                initial={{ opacity: 0, y: -16 }}
                animate={{ opacity: mounted ? 0.8 : 0, y: mounted ? 0 : -16 }}
                transition={{ delay: 0.9, duration: 0.5 }}
                className="glass"
                style={{
                  position: 'absolute', top: 80, right: -30, padding: '10px 16px', borderRadius: 12,
                  display: 'flex', alignItems: 'center', gap: 8, animation: 'float 5s ease-in-out 0.5s infinite',
                  zIndex: 3,
                }}
              >
                <div style={{
                  width: 28, height: 28, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.25)',
                }}>
                  <Sparkles style={{ width: 14, height: 14, color: '#22C55E' }} />
                </div>
                <div>
                  <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text)', margin: 0 }}>Rank up!</p>
                  <p style={{ fontSize: 10, color: 'var(--subtle)', margin: 0 }}>Gossip Goblin</p>
                </div>
              </motion.div>

              {/* King card — bottom-left */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: mounted ? 0.75 : 0, y: mounted ? 0 : 16 }}
                transition={{ delay: 1, duration: 0.5 }}
                className="glass"
                style={{
                  position: 'absolute', bottom: 20, left: 0, padding: '10px 16px', borderRadius: 12,
                  display: 'flex', alignItems: 'center', gap: 8, animation: 'float 6s ease-in-out 3s infinite',
                }}
              >
                <span style={{ fontSize: 18 }}>🤴</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#FBBF24' }}>King of Good Times</span>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* ── FEED PREVIEW ── */}
      <section id="feed" style={{ padding: '80px 24px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 36, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <p style={{ fontSize: 12, color: 'var(--subtle)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8 }}>City Feed</p>
            <h2 style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.02em', margin: 0 }}>
              What&apos;s happening in Faridabad
            </h2>
          </div>
          <Link href="/signup" className="glass" style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '8px 16px', fontSize: 13, fontWeight: 500, color: 'var(--muted)',
            borderRadius: 'var(--r-md)', textDecoration: 'none',
          }}>
            See full feed <ArrowRight style={{ width: 14, height: 14 }} />
          </Link>
        </div>

        {previewRumors.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
            {previewRumors.map((rumor, i) => (
              <PublicRumorCard key={rumor.id} rumor={rumor} index={i} />
            ))}
            <LockedCard />
          </div>
        ) : (
          <div className="glass-lg" style={{
            padding: '64px 24px', textAlign: 'center', borderRadius: 'var(--r-xl)',
          }}>
            <Radio style={{ width: 32, height: 32, color: 'var(--border-strong)', margin: '0 auto 12px' }} />
            <p style={{ fontSize: 16, color: 'var(--muted)', fontWeight: 500, marginBottom: 6 }}>No rumors yet.</p>
            <p style={{ fontSize: 14, color: 'var(--subtle)', marginBottom: 20 }}>Be the first to drop something in the city.</p>
            <Link href="/signup">
              <button className="glass-primary" style={{
                padding: '10px 22px', fontSize: 14, fontWeight: 600, color: '#a5b4fc',
                borderRadius: 'var(--r-md)', cursor: 'pointer', fontFamily: 'var(--font)',
              }}>Drop the first rumor</button>
            </Link>
          </div>
        )}

        {/* Join gate — glass */}
        <div className="glass" style={{
          marginTop: 16, padding: '16px 24px', borderRadius: 'var(--r-lg)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Lock style={{ width: 16, height: 16, color: 'var(--primary)', flexShrink: 0 }} />
            <span style={{ fontSize: 14, color: 'var(--muted)' }}>
              Sign up to vote, comment, drop rumors, and join challenges.
            </span>
          </div>
          <Link href="/signup">
            <button className="glass-primary" style={{
              padding: '8px 18px', fontSize: 13, fontWeight: 600, color: '#a5b4fc',
              borderRadius: 'var(--r-md)', cursor: 'pointer', fontFamily: 'var(--font)', whiteSpace: 'nowrap',
            }}>
              Create free account
            </button>
          </Link>
        </div>
      </section>

      {/* ── FEATURES — NEUMORPHIC CARDS ── */}
      <section style={{ padding: '80px 24px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 52 }}>
          <p style={{ fontSize: 12, color: 'var(--subtle)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 10 }}>How It Works</p>
          <h2 style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 700, letterSpacing: '-0.025em', margin: '0 0 14px' }}>
            Four things you can do
          </h2>
          <p style={{ fontSize: 16, color: 'var(--muted)', maxWidth: 440, margin: '0 auto' }}>
            One platform, four ways to shape what the city knows.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 }}>
          {[
            { icon: Flame, title: 'Drop Rumors', accent: '#EF4444', desc: 'Post city secrets under a random alias. Fully anonymous. No one knows it\'s you — the city decides what\'s real.' },
            { icon: Eye, title: 'Bust Myths', accent: '#3B82F6', desc: 'Investigate rumors with actual evidence. Get verdicts: Confirmed, Debunked, or Misleading.' },
            { icon: Trophy, title: 'Win Challenges', accent: 'var(--primary)', desc: 'City-wide challenges with real money on the line. PvP and community formats. Premium members can create their own.' },
            { icon: Crown, title: 'Climb the Ranks', accent: '#F59E0B', desc: 'Every action earns XP. 10 ranks to climb, from Ghost to King. Each rank unlocks more of the city.' },
          ].map(({ icon: Icon, title, accent, desc }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              viewport={{ once: true }}
              className="neu"
              style={{ padding: 28, borderRadius: 18, position: 'relative', overflow: 'hidden' }}
            >
              {/* Accent glow top-left */}
              <div style={{
                position: 'absolute', top: -20, left: -20, width: 100, height: 100,
                background: `radial-gradient(circle, ${accent}15 0%, transparent 70%)`,
                pointerEvents: 'none',
              }} />
              <div style={{
                width: 44, height: 44, borderRadius: 'var(--r-md)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 18, position: 'relative',
              }}>
                <div className="neu-inset" style={{
                  width: 44, height: 44, borderRadius: 'var(--r-md)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon style={{ width: 20, height: 20, color: accent }} />
                </div>
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8, letterSpacing: '-0.01em', position: 'relative' }}>{title}</h3>
              <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.6, margin: 0, position: 'relative' }}>{desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── COMING SOON — Glass panels ── */}
      <section style={{ padding: '80px 24px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ marginBottom: 36 }}>
          <p style={{ fontSize: 12, color: 'var(--subtle)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8 }}>Coming Soon</p>
          <h2 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em', margin: '0 0 8px' }}>More ways to know your city</h2>
          <p style={{ fontSize: 15, color: 'var(--muted)' }}>We&apos;re building this with Faridabad in mind.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 14 }}>
          {[
            { icon: MapPin, title: 'City Map', desc: 'See where rumors are happening geographically across Faridabad.' },
            { icon: BarChart2, title: 'City Polls', desc: '"Best chai in Sector 15?" Let the city vote on what matters.' },
            { icon: Users, title: 'Local Challenges', desc: 'Neighborhood-level challenges — your mohalla vs theirs.' },
            { icon: MessageSquare, title: 'City Boards', desc: 'Topic-based discussion boards for Faridabad neighborhoods.' },
          ].map(({ icon: Icon, title, desc }) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass"
              style={{
                borderRadius: 'var(--r-lg)', padding: '20px',
                display: 'flex', gap: 14, alignItems: 'flex-start',
                opacity: 0.8, transition: 'opacity 0.2s',
              }}
            >
              <div className="neu-inset" style={{
                width: 34, height: 34, borderRadius: 8, flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon style={{ width: 16, height: 16, color: 'var(--primary)' }} />
              </div>
              <div>
                <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{title}</p>
                <p style={{ fontSize: 13, color: 'var(--muted)', margin: 0, lineHeight: 1.5 }}>{desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── RANKS — Neumorphic grid ── */}
      <section style={{ padding: '80px 24px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 44 }}>
          <h2 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em', margin: '0 0 10px' }}>
            10 ranks. One{' '}
            <span className="text-gradient-warm" style={{ display: 'inline' }}>throne</span>.
          </h2>
          <p style={{ fontSize: 15, color: 'var(--muted)' }}>Every action earns XP. Keep going.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 10 }}>
          {RANK_KEYS.map((key, i) => {
            const r = RANKS[key]
            const isKing = i === RANK_KEYS.length - 1
            return (
              <motion.div
                key={key}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.04 }}
                viewport={{ once: true }}
                className={isKing ? 'glass-warm' : 'neu-sm'}
                style={{
                  padding: '18px 10px', textAlign: 'center',
                  borderRadius: 'var(--r-lg)',
                  border: isKing ? undefined : 'none',
                }}
              >
                <span style={{ fontSize: 26, display: 'block', marginBottom: 8, filter: isKing ? 'drop-shadow(0 0 8px rgba(251,191,36,0.4))' : 'none' }}>{r.emoji}</span>
                <p style={{ fontSize: 11, fontWeight: 600, color: r.color, margin: '0 0 4px', lineHeight: 1.3 }}>{r.label}</p>
                <p style={{ fontSize: 10, color: 'var(--subtle)', fontFamily: 'var(--font-mono)', margin: 0 }}>{r.xpRequired.toLocaleString()} XP</p>
              </motion.div>
            )
          })}
        </div>
      </section>

      {/* ── MEMBERSHIP — Glass + Neu hybrid ── */}
      <section style={{ padding: '80px 24px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }} className="membership-grid">
          {/* Free — Neumorphic */}
          <div className="neu" style={{ borderRadius: 'var(--r-xl)', padding: 32 }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--subtle)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>Free</p>
            <p style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.03em', marginBottom: 4 }}>₹0</p>
            <p style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 28 }}>For everyone. Always.</p>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
              {['Post anonymous rumors', 'Vote & comment', 'Join public challenges', 'Earn XP and climb ranks'].map(item => (
                <li key={item} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: 'var(--muted)' }}>
                  <span className="neu-inset" style={{
                    width: 18, height: 18, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 9, color: '#86efac',
                  }}>✓</span>
                  {item}
                </li>
              ))}
            </ul>
            <Link href="/signup">
              <button className="glass" style={{
                width: '100%', padding: '10px', fontSize: 14, fontWeight: 600,
                color: 'var(--text)', borderRadius: 'var(--r-md)',
                cursor: 'pointer', fontFamily: 'var(--font)',
              }}>Get started free</button>
            </Link>
          </div>

          {/* Premium — Glass with glow */}
          <div className="glass-lg" style={{
            borderRadius: 'var(--r-xl)', padding: 32, position: 'relative', overflow: 'hidden',
            border: '1px solid rgba(99,102,241,0.3)',
            boxShadow: '0 16px 64px rgba(99,102,241,0.12), inset 0 1px 0 rgba(255,255,255,0.06)',
          }}>
            {/* Premium accent glow */}
            <div style={{
              position: 'absolute', top: -40, right: -40, width: 160, height: 160,
              background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)',
              pointerEvents: 'none',
            }} />

            <div style={{
              position: 'absolute', top: -1, right: 20,
              padding: '4px 14px', fontSize: 11, fontWeight: 700,
              background: 'linear-gradient(135deg, var(--primary), #818CF8)',
              color: '#fff', borderRadius: '0 0 8px 8px', letterSpacing: '0.04em',
            }}>PREMIUM</div>

            <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>Premium</p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 4 }}>
              <p style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.03em', margin: 0 }}>₹80</p>
              <span style={{ fontSize: 14, color: 'var(--muted)' }}>/month</span>
            </div>
            <p style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 28 }}>For serious city insiders.</p>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
              {[
                'Everything in free',
                'Premium badge on profile',
                'Create your own challenges',
                'Publish city polls',
                'Priority in feed placement',
                'Early access to new features',
              ].map(item => (
                <li key={item} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: 'var(--muted)', position: 'relative' }}>
                  <span style={{
                    width: 18, height: 18, borderRadius: '50%',
                    background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0, fontSize: 9, color: '#a5b4fc',
                  }}>✓</span>
                  {item}
                </li>
              ))}
            </ul>
            <Link href="/signup">
              <button style={{
                width: '100%', padding: '11px', fontSize: 14, fontWeight: 600,
                background: 'linear-gradient(135deg, var(--primary), #818CF8)',
                color: '#fff', border: 'none', borderRadius: 'var(--r-md)',
                cursor: 'pointer', fontFamily: 'var(--font)',
                boxShadow: '0 4px 20px rgba(99,102,241,0.25)',
              }}>Join Premium — ₹80/mo</button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA — Glass hero ── */}
      <section style={{ padding: '100px 24px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        {/* Background glow */}
        <div style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          width: 500, height: 500, pointerEvents: 'none',
          background: 'radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 60%)',
          filter: 'blur(40px)',
        }} />
        <div style={{ maxWidth: 560, margin: '0 auto', position: 'relative' }}>
          <h2 style={{ fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 700, letterSpacing: '-0.025em', marginBottom: 16 }}>
            Be part of Faridabad&apos;s{' '}
            <span className="text-gradient" style={{ display: 'inline' }}>story</span>.
          </h2>
          <p style={{ fontSize: 16, color: 'var(--muted)', marginBottom: 36, lineHeight: 1.6 }}>
            We&apos;re just getting started. Join early, get your rank, help shape what this city knows about itself.
          </p>
          <Link href="/signup">
            <motion.button
              whileHover={{ translateY: -3, boxShadow: '0 16px 48px rgba(99,102,241,0.4)' }}
              whileTap={{ scale: 0.98 }}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '14px 32px', fontSize: 16, fontWeight: 600,
                background: 'linear-gradient(135deg, var(--primary), #818CF8)',
                color: '#fff', border: 'none', borderRadius: 'var(--r-md)',
                cursor: 'pointer', fontFamily: 'var(--font)',
                boxShadow: '0 8px 32px rgba(99,102,241,0.3), inset 0 1px 0 rgba(255,255,255,0.15)',
              }}
            >
              <Zap style={{ width: 18, height: 18 }} />
              Join SANDNCO
            </motion.button>
          </Link>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="glass-sm" style={{ padding: '28px 24px', borderRadius: 0, borderLeft: 'none', borderRight: 'none', borderBottom: 'none' }}>
        <div style={{
          maxWidth: 1200, margin: '0 auto',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: 16,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ position: 'relative', width: 20, height: 20, opacity: 0.5 }}>
              <Image src="/logo.png" alt="" fill style={{ objectFit: 'contain' }} />
            </div>
            <span style={{ fontSize: 13, color: 'var(--subtle)', fontWeight: 500 }}>SANDNCO · King of Good Times</span>
            <span className="glass-sm" style={{ fontSize: 11, color: 'var(--subtle)', padding: '2px 8px', borderRadius: 4 }}>Beta</span>
          </div>
          <div style={{ display: 'flex', gap: 24 }}>
            {[
              { href: '/legal/tos', label: 'Terms' },
              { href: '/legal/privacy', label: 'Privacy' },
              { href: '/support', label: 'Support' },
            ].map(({ href, label }) => (
              <Link key={href} href={href} style={{ fontSize: 13, color: 'var(--subtle)', textDecoration: 'none' }} className="link-muted">
                {label}
              </Link>
            ))}
          </div>
        </div>
      </footer>

      <style>{`
        @media (max-width: 768px) {
          .hero-grid { grid-template-columns: 1fr !important; }
          .membership-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}

function PublicRumorCard({ rumor, index }: { rumor: PreviewRumor; index: number }) {
  const isHot = rumor.heat_score > 20
  const heatColor = isHot ? '#EF4444' : rumor.heat_score > 8 ? '#F59E0B' : 'var(--subtle)'

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      viewport={{ once: true }}
    >
      <Link href="/signup" style={{ textDecoration: 'none', display: 'block' }}>
        <div className="glass-neu" style={{
          padding: 20, borderRadius: 'var(--r-lg)', position: 'relative', overflow: 'hidden',
          cursor: 'pointer', transition: 'all 0.2s',
        }}>
          {/* Heat bar */}
          <div style={{
            position: 'absolute', top: 0, left: 0,
            height: 2, width: `${Math.min(100, Math.max(15, rumor.heat_score))}%`,
            background: `linear-gradient(90deg, ${heatColor}, ${isHot ? '#F59E0B' : 'var(--primary)'})`,
            borderRadius: '12px 12px 0 0',
          }} />

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontSize: 12, color: 'var(--subtle)', fontFamily: 'var(--font-mono)' }}>
              {rumor.anonymous_alias}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {rumor.category && (
                <span className="glass-sm" style={{
                  fontSize: 11, fontWeight: 500, padding: '2px 8px',
                  color: 'var(--muted)', borderRadius: 100,
                }}>
                  {rumor.category}
                </span>
              )}
              {isHot && <Flame style={{ width: 13, height: 13, color: '#EF4444' }} />}
            </div>
          </div>

          <h3 style={{
            fontSize: 15, fontWeight: 600, color: 'var(--text)', marginBottom: 12,
            lineHeight: 1.4, letterSpacing: '-0.01em',
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>
            {rumor.title}
          </h3>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 12, color: 'var(--subtle)' }}>{formatRelativeTime(rumor.created_at)}</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: heatColor, display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'var(--font-mono)' }}>
              <TrendingUp style={{ width: 11, height: 11 }} />
              {Math.floor(rumor.heat_score)}
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

function LockedCard() {
  return (
    <div className="neu-inset" style={{
      borderRadius: 'var(--r-lg)', padding: 20,
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', minHeight: 140, gap: 10,
    }}>
      <Lock style={{ width: 20, height: 20, color: 'var(--border-strong)' }} />
      <p style={{ fontSize: 14, color: 'var(--subtle)', textAlign: 'center', margin: 0 }}>
        Sign up to see more
      </p>
      <Link href="/signup">
        <button className="glass-primary" style={{
          padding: '7px 16px', fontSize: 13, fontWeight: 600, color: '#a5b4fc',
          borderRadius: 100, cursor: 'pointer', fontFamily: 'var(--font)',
        }}>
          Join free
        </button>
      </Link>
    </div>
  )
}
