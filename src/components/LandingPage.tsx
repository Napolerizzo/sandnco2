'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Flame, Trophy, Eye, ArrowRight, TrendingUp,
  Zap, MapPin, Users, MessageSquare, ChevronRight,
  BarChart2, Radio, Lock, Crown
} from 'lucide-react'
import { RANKS } from '@/lib/ranks'
import { formatRelativeTime } from '@/lib/utils'

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
  const [lineIndex, setLineIndex] = useState(0)
  const [mounted, setMounted] = useState(false)
  const [currentRankIdx, setCurrentRankIdx] = useState(0)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
    const t1 = setInterval(() => setLineIndex(i => (i + 1) % CITY_LINES.length), 3500)
    const t2 = setInterval(() => setCurrentRankIdx(i => (i + 1) % RANK_KEYS.length), 2000)
    return () => { clearInterval(t1); clearInterval(t2) }
  }, [])

  const currentRank = RANKS[RANK_KEYS[currentRankIdx]]

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', fontFamily: 'var(--font)', overflowX: 'hidden' }}>

      {/* ── NAVBAR ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, height: 64, zIndex: 50,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 24px', maxWidth: 1200, margin: '0 auto', left: '50%',
        transform: 'translateX(-50%)', width: '100%',
      }}>
        {/* Full-width backdrop */}
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, height: 64, zIndex: -1,
          background: 'rgba(15,23,42,0.85)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderBottom: '1px solid var(--border)',
        }} />

        {/* Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{ position: 'relative', width: 28, height: 28 }}>
            <Image src="/logo.png" alt="SANDNCO" fill style={{ objectFit: 'contain' }} />
          </div>
          <div style={{ lineHeight: 1 }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.02em' }}>SANDNCO</span>
            <span style={{ fontSize: 10, color: 'var(--subtle)', display: 'block', letterSpacing: '0.02em', marginTop: 1 }}>King of Good Times</span>
          </div>
        </Link>

        {/* Center links — desktop */}
        <div className="hide-mobile" style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {[
            { href: '#feed', label: 'Explore' },
            { href: '/login?next=/challenges', label: 'Challenges' },
            { href: '/login?next=/leaderboard', label: 'Ranks' },
          ].map(({ href, label }) => (
            <a key={href} href={href} className="nav-item" style={{ fontSize: 14 }}>{label}</a>
          ))}
        </div>

        {/* Auth */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Link href="/login">
            <button style={{
              padding: '7px 14px', fontSize: 14, fontWeight: 500,
              background: 'transparent', border: '1px solid var(--border)',
              color: 'var(--muted)', borderRadius: 'var(--r)',
              cursor: 'pointer', transition: 'all 0.15s', fontFamily: 'var(--font)',
            }}
              className="btn-secondary btn-sm hide-mobile"
            >Login</button>
          </Link>
          <Link href="/signup">
            <button style={{
              padding: '7px 14px', fontSize: 14, fontWeight: 600,
              background: 'var(--primary)', border: 'none', color: '#fff',
              borderRadius: 'var(--r)', cursor: 'pointer',
              transition: 'background 0.15s', fontFamily: 'var(--font)',
            }}>
              Join Free
            </button>
          </Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ paddingTop: 64, minHeight: '96vh', display: 'flex', alignItems: 'center', position: 'relative', overflow: 'hidden' }}>
        {/* Layered background */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: 'linear-gradient(rgba(99,102,241,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.06) 1px, transparent 1px)',
          backgroundSize: '56px 56px',
          maskImage: 'radial-gradient(ellipse 100% 80% at 50% 50%, black 20%, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(ellipse 100% 80% at 50% 50%, black 20%, transparent 80%)',
        }} />
        {/* Primary glow */}
        <div style={{
          position: 'absolute', top: '15%', left: '50%', transform: 'translateX(-50%)',
          width: 800, height: 400, pointerEvents: 'none',
          background: 'radial-gradient(ellipse at center, rgba(99,102,241,0.18) 0%, rgba(59,130,246,0.06) 50%, transparent 70%)',
        }} />
        {/* Secondary smaller accent */}
        <div style={{
          position: 'absolute', top: '40%', right: '10%',
          width: 300, height: 300, pointerEvents: 'none',
          background: 'radial-gradient(ellipse, rgba(99,102,241,0.08) 0%, transparent 70%)',
        }} />

        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '80px 24px 80px', width: '100%', position: 'relative', zIndex: 1 }}>
          {/* Staggered reveal */}

          {/* Early access badge */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : 12 }}
            transition={{ duration: 0.5 }}
            style={{ marginBottom: 28 }}
          >
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '5px 14px', fontSize: 12, fontWeight: 600,
              background: 'var(--primary-dim)', color: '#a5b4fc',
              border: '1px solid rgba(99,102,241,0.3)', borderRadius: 100,
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#a5b4fc', animation: 'pulse-ring 2s infinite', flexShrink: 0 }} />
              Early Access · Faridabad, India
            </span>
          </motion.div>

          {/* Main heading — split word by word for stagger */}
          <div style={{ marginBottom: 22, maxWidth: 780, overflow: 'hidden' }}>
            <motion.h1
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : 32 }}
              transition={{ duration: 0.65, delay: 0.06, ease: [0.22, 1, 0.36, 1] }}
              style={{
                fontSize: 'clamp(40px, 7.5vw, 80px)',
                fontWeight: 700,
                letterSpacing: '-0.035em',
                lineHeight: 1.05,
                color: 'var(--text)',
                margin: 0,
              }}
            >
              Faridabad&apos;s city<br />
              <span style={{
                color: 'var(--primary)',
                position: 'relative',
                display: 'inline-block',
              }}>intelligence</span>{' '}
              <span style={{ color: 'var(--text)' }}>platform.</span>
            </motion.h1>
          </div>

          {/* Rotating city line */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: mounted ? 1 : 0 }}
            transition={{ delay: 0.2 }}
            style={{ height: 30, marginBottom: 22, overflow: 'hidden' }}
          >
            <AnimatePresence mode="wait">
              <motion.p
                key={lineIndex}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -14 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                style={{ fontSize: 18, color: 'var(--muted)', fontWeight: 400, margin: 0 }}
              >
                {CITY_LINES[lineIndex]}
              </motion.p>
            </AnimatePresence>
          </motion.div>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : 12 }}
            transition={{ delay: 0.28, duration: 0.5 }}
            style={{ fontSize: 16, color: 'var(--subtle)', maxWidth: 500, lineHeight: 1.7, marginBottom: 40, margin: '0 0 40px' }}
          >
            Anonymous city rumors. Real money challenges. Myth-busting. 10 ranks from Ghost to King of Good Times.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : 14 }}
            transition={{ delay: 0.36 }}
            style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 60 }}
          >
            <Link href="/signup">
              <motion.button
                whileHover={{ y: -2, boxShadow: '0 8px 32px rgba(99,102,241,0.35)' }}
                whileTap={{ scale: 0.97 }}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  padding: '12px 24px', fontSize: 15, fontWeight: 600,
                  background: 'var(--primary)', color: '#fff', border: 'none',
                  borderRadius: 'var(--r)', cursor: 'pointer',
                  fontFamily: 'var(--font)', transition: 'box-shadow 0.2s',
                }}
              >
                <Zap style={{ width: 16, height: 16 }} />
                Join Faridabad
              </motion.button>
            </Link>
            <a href="#feed" style={{ textDecoration: 'none' }}>
              <motion.button
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.97 }}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  padding: '12px 20px', fontSize: 15, fontWeight: 500,
                  background: 'transparent', color: 'var(--text)',
                  border: '1px solid var(--border)', borderRadius: 'var(--r)',
                  cursor: 'pointer', fontFamily: 'var(--font)',
                }}
              >
                See what&apos;s happening
                <ArrowRight style={{ width: 15, height: 15 }} />
              </motion.button>
            </a>
          </motion.div>

          {/* Stats bar */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: mounted ? 1 : 0 }}
            transition={{ delay: 0.5 }}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 0,
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: 12, overflow: 'hidden',
            }}
          >
            {userCount > 0 ? (
              <div style={{ padding: '12px 20px', borderRight: '1px solid var(--border)' }}>
                <p style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.02em', margin: 0 }}>{userCount}</p>
                <p style={{ fontSize: 11, color: 'var(--subtle)', margin: '2px 0 0', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Users style={{ width: 11, height: 11 }} /> Members
                </p>
              </div>
            ) : (
              <div style={{ padding: '12px 20px', borderRight: '1px solid var(--border)' }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--muted)', margin: 0 }}>Brand new.</p>
                <p style={{ fontSize: 11, color: 'var(--subtle)', margin: '2px 0 0' }}>Be the first.</p>
              </div>
            )}
            {rumorCount > 0 && (
              <div style={{ padding: '12px 20px', borderRight: '1px solid var(--border)' }}>
                <p style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.02em', margin: 0 }}>{rumorCount}</p>
                <p style={{ fontSize: 11, color: 'var(--subtle)', margin: '2px 0 0', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Radio style={{ width: 11, height: 11 }} /> Rumors
                </p>
              </div>
            )}
            <div style={{ padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 11, color: 'var(--subtle)' }}>Top rank:</span>
              <AnimatePresence mode="wait">
                <motion.span
                  key={currentRankIdx}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.25 }}
                  style={{ fontSize: 12, fontWeight: 600, color: currentRank.color, display: 'flex', alignItems: 'center', gap: 4 }}
                >
                  {currentRank.emoji} {currentRank.label}
                </motion.span>
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Floating rank cards — decorative */}
          {mounted && (
            <div className="hide-mobile" style={{ position: 'absolute', right: 60, top: '50%', transform: 'translateY(-50%)', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { emoji: '👻', label: 'Ghost', color: '#6b7280', delay: 0 },
                { emoji: '⚡', label: 'Chaos Agent', color: '#f97316', delay: 0.1 },
                { emoji: '🤴', label: 'King', color: '#fbbf24', delay: 0.2 },
              ].map(({ emoji, label, color, delay }) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 0.7, x: 0 }}
                  transition={{ delay: 0.6 + delay, duration: 0.5 }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '8px 14px', background: 'var(--bg-card)',
                    border: `1px solid ${color}30`, borderRadius: 8,
                    backdropFilter: 'blur(8px)',
                  }}
                >
                  <span style={{ fontSize: 18 }}>{emoji}</span>
                  <span style={{ fontSize: 11, fontWeight: 600, color, letterSpacing: '0.02em' }}>{label}</span>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── FEED PREVIEW ── */}
      <section id="feed" style={{ padding: '64px 24px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <p style={{ fontSize: 12, color: 'var(--subtle)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8 }}>City Feed</p>
            <h2 style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.02em', margin: 0 }}>
              What&apos;s happening in Faridabad
            </h2>
          </div>
          <Link href="/signup" style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '8px 16px', fontSize: 13, fontWeight: 500,
            background: 'var(--bg-elevated)', border: '1px solid var(--border)',
            color: 'var(--muted)', borderRadius: 'var(--r)', textDecoration: 'none',
            transition: 'all 0.15s',
          }} className="btn-secondary btn-sm">
            See full feed <ArrowRight style={{ width: 14, height: 14 }} />
          </Link>
        </div>

        {previewRumors.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
            {previewRumors.map((rumor, i) => (
              <PublicRumorCard key={rumor.id} rumor={rumor} index={i} />
            ))}
            {/* Locked placeholder card */}
            <LockedCard />
          </div>
        ) : (
          <div style={{
            padding: '64px 24px', textAlign: 'center',
            background: 'var(--bg-card)', border: '1px dashed var(--border)',
            borderRadius: 'var(--r-lg)',
          }}>
            <Radio style={{ width: 32, height: 32, color: 'var(--border-strong)', margin: '0 auto 12px' }} />
            <p style={{ fontSize: 16, color: 'var(--muted)', fontWeight: 500, marginBottom: 6 }}>No rumors yet.</p>
            <p style={{ fontSize: 14, color: 'var(--subtle)', marginBottom: 20 }}>Be the first to drop something in the city.</p>
            <Link href="/signup">
              <button style={{
                padding: '10px 22px', fontSize: 14, fontWeight: 600,
                background: 'var(--primary)', color: '#fff', border: 'none',
                borderRadius: 'var(--r)', cursor: 'pointer', fontFamily: 'var(--font)',
              }}>Drop the first rumor</button>
            </Link>
          </div>
        )}

        {/* Join gate */}
        <div style={{
          marginTop: 16, padding: '16px 24px',
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 'var(--r-lg)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Lock style={{ width: 16, height: 16, color: 'var(--primary)', flexShrink: 0 }} />
            <span style={{ fontSize: 14, color: 'var(--muted)' }}>
              Sign up to vote, comment, drop rumors, and join challenges.
            </span>
          </div>
          <Link href="/signup">
            <button style={{
              padding: '8px 18px', fontSize: 13, fontWeight: 600,
              background: 'var(--primary)', color: '#fff', border: 'none',
              borderRadius: 'var(--r)', cursor: 'pointer', fontFamily: 'var(--font)',
              whiteSpace: 'nowrap',
            }}>
              Create free account
            </button>
          </Link>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section style={{ padding: '64px 24px', borderTop: '1px solid var(--border)', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <p style={{ fontSize: 12, color: 'var(--subtle)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 10 }}>How It Works</p>
          <h2 style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 700, letterSpacing: '-0.025em', margin: '0 0 14px' }}>
            Four things you can do
          </h2>
          <p style={{ fontSize: 16, color: 'var(--muted)', maxWidth: 440, margin: '0 auto' }}>
            One platform, four ways to shape what the city knows.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
          {[
            {
              icon: Flame,
              title: 'Drop Rumors',
              accent: '#EF4444',
              desc: 'Post city secrets under a random alias. Fully anonymous. No one knows it\'s you — the city decides what\'s real.',
            },
            {
              icon: Eye,
              title: 'Bust Myths',
              accent: '#3B82F6',
              desc: 'Investigate rumors with actual evidence. Get verdicts: Confirmed, Debunked, or Misleading.',
            },
            {
              icon: Trophy,
              title: 'Win Challenges',
              accent: 'var(--primary)',
              desc: 'City-wide challenges with real money on the line. PvP and community formats. Premium members can create their own.',
            },
            {
              icon: Crown,
              title: 'Climb the Ranks',
              accent: '#F59E0B',
              desc: 'Every action earns XP. 10 ranks to climb, from Ghost to King. Each rank unlocks more of the city.',
            },
          ].map(({ icon: Icon, title, accent, desc }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              viewport={{ once: true }}
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--r-lg)',
                padding: 24,
                position: 'relative',
              }}
            >
              <div style={{
                width: 40, height: 40, borderRadius: 'var(--r)',
                background: `${accent}18`, border: `1px solid ${accent}30`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 16, flexShrink: 0,
              }}>
                <Icon style={{ width: 20, height: 20, color: accent }} />
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8, letterSpacing: '-0.01em' }}>{title}</h3>
              <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.6, margin: 0 }}>{desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── COMING SOON features ── */}
      <section style={{ padding: '64px 24px', borderTop: '1px solid var(--border)', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ marginBottom: 32 }}>
          <p style={{ fontSize: 12, color: 'var(--subtle)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8 }}>Coming Soon</p>
          <h2 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em', margin: '0 0 8px' }}>More ways to know your city</h2>
          <p style={{ fontSize: 15, color: 'var(--muted)' }}>We&apos;re building this with Faridabad in mind.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12 }}>
          {[
            { icon: MapPin, title: 'City Map', desc: 'See where rumors are happening geographically across Faridabad.' },
            { icon: BarChart2, title: 'City Polls', desc: '"Best chai in Sector 15?" Let the city vote on what matters.' },
            { icon: Users, title: 'Local Challenges', desc: 'Neighborhood-level challenges — your mohalla vs theirs.' },
            { icon: MessageSquare, title: 'City Boards', desc: 'Topic-based discussion boards for Faridabad neighborhoods.' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} style={{
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: 'var(--r-lg)', padding: '20px',
              display: 'flex', gap: 14, alignItems: 'flex-start',
              opacity: 0.7,
            }}>
              <Icon style={{ width: 18, height: 18, color: 'var(--primary)', flexShrink: 0, marginTop: 2 }} />
              <div>
                <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{title}</p>
                <p style={{ fontSize: 13, color: 'var(--muted)', margin: 0, lineHeight: 1.5 }}>{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── RANKS ── */}
      <section style={{ padding: '64px 24px', borderTop: '1px solid var(--border)', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <h2 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em', margin: '0 0 10px' }}>10 ranks. One throne.</h2>
          <p style={{ fontSize: 15, color: 'var(--muted)' }}>Every action earns XP. Keep going.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 8 }}>
          {RANK_KEYS.map((key, i) => {
            const r = RANKS[key]
            const isKing = i === RANK_KEYS.length - 1
            return (
              <motion.div
                key={key}
                initial={{ opacity: 0, scale: 0.92 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.04 }}
                viewport={{ once: true }}
                style={{
                  padding: '16px 10px', textAlign: 'center',
                  background: isKing ? 'rgba(245,158,11,0.06)' : 'var(--bg-card)',
                  border: isKing ? '1px solid rgba(245,158,11,0.25)' : '1px solid var(--border)',
                  borderRadius: 'var(--r-lg)',
                }}
              >
                <span style={{ fontSize: 24, display: 'block', marginBottom: 8 }}>{r.emoji}</span>
                <p style={{ fontSize: 11, fontWeight: 600, color: r.color, margin: '0 0 4px', lineHeight: 1.3 }}>{r.label}</p>
                <p style={{ fontSize: 10, color: 'var(--subtle)', fontFamily: 'var(--font-mono)', margin: 0 }}>{r.xpRequired.toLocaleString()} XP</p>
              </motion.div>
            )
          })}
        </div>
      </section>

      {/* ── MEMBERSHIP ── */}
      <section style={{ padding: '64px 24px', borderTop: '1px solid var(--border)', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16,
        }} className="membership-grid">
          {/* Free */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--r-xl)', padding: 32 }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--subtle)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>Free</p>
            <p style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.03em', marginBottom: 4 }}>₹0</p>
            <p style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 28 }}>For everyone. Always.</p>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
              {['Post anonymous rumors', 'Vote & comment', 'Join public challenges', 'Earn XP and climb ranks'].map(item => (
                <li key={item} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: 'var(--muted)' }}>
                  <span style={{ width: 16, height: 16, borderRadius: '50%', background: 'var(--success-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 9 }}>✓</span>
                  {item}
                </li>
              ))}
            </ul>
            <Link href="/signup">
              <button style={{
                width: '100%', padding: '10px', fontSize: 14, fontWeight: 600,
                background: 'var(--bg-elevated)', color: 'var(--text)',
                border: '1px solid var(--border)', borderRadius: 'var(--r)',
                cursor: 'pointer', fontFamily: 'var(--font)',
              }}>Get started free</button>
            </Link>
          </div>

          {/* Premium */}
          <div style={{
            background: 'var(--bg-card)', border: '1px solid rgba(99,102,241,0.4)',
            borderRadius: 'var(--r-xl)', padding: 32, position: 'relative',
            boxShadow: '0 0 0 1px rgba(99,102,241,0.15)',
          }}>
            <div style={{
              position: 'absolute', top: -1, right: 20,
              padding: '4px 12px', fontSize: 11, fontWeight: 700,
              background: 'var(--primary)', color: '#fff',
              borderRadius: '0 0 6px 6px', letterSpacing: '0.04em',
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
                <li key={item} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: 'var(--muted)' }}>
                  <span style={{ width: 16, height: 16, borderRadius: '50%', background: 'var(--primary-dim)', border: '1px solid rgba(99,102,241,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 9, color: '#a5b4fc' }}>✓</span>
                  {item}
                </li>
              ))}
            </ul>
            <Link href="/signup">
              <button style={{
                width: '100%', padding: '10px', fontSize: 14, fontWeight: 600,
                background: 'var(--primary)', color: '#fff',
                border: 'none', borderRadius: 'var(--r)',
                cursor: 'pointer', fontFamily: 'var(--font)',
              }}>Join Premium — ₹80/mo</button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section style={{ padding: '80px 24px 100px', textAlign: 'center', borderTop: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 560, margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 700, letterSpacing: '-0.025em', marginBottom: 16 }}>
            Be part of Faridabad&apos;s story.
          </h2>
          <p style={{ fontSize: 16, color: 'var(--muted)', marginBottom: 36, lineHeight: 1.6 }}>
            We&apos;re just getting started. Join early, get your rank, help shape what this city knows about itself.
          </p>
          <Link href="/signup">
            <motion.button
              whileHover={{ translateY: -2 }}
              whileTap={{ scale: 0.98 }}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '13px 28px', fontSize: 16, fontWeight: 600,
                background: 'var(--primary)', color: '#fff', border: 'none',
                borderRadius: 'var(--r)', cursor: 'pointer', fontFamily: 'var(--font)',
              }}
            >
              <Zap style={{ width: 18, height: 18 }} />
              Join SANDNCO
            </motion.button>
          </Link>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ padding: '28px 24px', borderTop: '1px solid var(--border)' }}>
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
            <span style={{ fontSize: 11, color: 'var(--subtle)', padding: '2px 6px', border: '1px solid var(--border)', borderRadius: 4 }}>Beta</span>
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
        @media (max-width: 640px) {
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
        <div className="feed-card" style={{ transition: 'border-color 0.15s, transform 0.15s' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = '' }}
        >
          {/* Top color bar */}
          <div style={{
            position: 'absolute', top: 0, left: 0,
            height: 2, width: `${Math.min(100, Math.max(15, rumor.heat_score))}%`,
            background: heatColor, borderRadius: '12px 12px 0 0',
            transition: 'width 0.6s',
          }} />

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontSize: 12, color: 'var(--subtle)', fontFamily: 'var(--font-mono)' }}>
              {rumor.anonymous_alias}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {rumor.category && (
                <span style={{
                  fontSize: 11, fontWeight: 500, padding: '2px 8px',
                  background: 'var(--bg-elevated)', border: '1px solid var(--border)',
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
    <div style={{
      background: 'var(--bg-card)', border: '1px dashed var(--border)',
      borderRadius: 'var(--r-lg)', padding: 20,
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', minHeight: 140, gap: 10,
    }}>
      <Lock style={{ width: 20, height: 20, color: 'var(--border-strong)' }} />
      <p style={{ fontSize: 14, color: 'var(--subtle)', textAlign: 'center', margin: 0 }}>
        Sign up to see more
      </p>
      <Link href="/signup">
        <button style={{
          padding: '7px 16px', fontSize: 13, fontWeight: 600,
          background: 'var(--primary-dim)', color: '#a5b4fc',
          border: '1px solid rgba(99,102,241,0.3)', borderRadius: 100,
          cursor: 'pointer', fontFamily: 'var(--font)',
        }}>
          Join free
        </button>
      </Link>
    </div>
  )
}
