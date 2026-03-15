'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Flame, Trophy, Crown, Zap, Eye, ArrowRight,
  TrendingUp, Activity, MessageSquare, ChevronRight,
  Users, Hash, Star
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

const BOOT_LINES = [
  '> KING OF GOOD TIMES — ONLINE',
  '> CITY NETWORK CONNECTED',
  '> ENTERING THE CITY...',
]

function BootScreen({ lines }: { lines: string[] }) {
  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: '#09090b',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999,
      }}
    >
      <div style={{ maxWidth: 440, width: '100%', padding: '0 32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
          <div style={{ position: 'relative', width: 36, height: 36 }}>
            <Image src="/logo.png" alt="KGT" fill style={{ objectFit: 'contain' }} />
          </div>
          <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#22d3ee', letterSpacing: '0.3em', textTransform: 'uppercase', opacity: 0.5 }}>
            Initializing
          </span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {lines.map((line, i) => (
            <motion.p
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.15 }}
              style={{ fontFamily: 'monospace', fontSize: 13, color: i === lines.length - 1 ? '#22d3ee' : '#4b5563' }}
            >
              {line}
            </motion.p>
          ))}
          {lines.length > 0 && lines.length < BOOT_LINES.length && (
            <span style={{ color: '#22d3ee', fontFamily: 'monospace', animation: 'blink-cursor 1s step-end infinite' }}>█</span>
          )}
        </div>
      </div>
    </div>
  )
}

export default function LandingPage({ previewRumors = [] }: { previewRumors?: PreviewRumor[] }) {
  const [bootDone, setBootDone] = useState(false)
  const [bootLines, setBootLines] = useState<string[]>([])
  const [currentRank, setCurrentRank] = useState(0)

  useEffect(() => {
    if (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('kgt_boot')) {
      setBootDone(true)
      return
    }
    let i = 0
    const timer = setInterval(() => {
      if (i < BOOT_LINES.length) {
        setBootLines(prev => [...prev, BOOT_LINES[i]])
        i++
      } else {
        clearInterval(timer)
        setTimeout(() => {
          sessionStorage.setItem('kgt_boot', '1')
          setBootDone(true)
        }, 300)
      }
    }, 200)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const t = setInterval(() => setCurrentRank(p => (p + 1) % RANK_KEYS.length), 2500)
    return () => clearInterval(t)
  }, [])

  const rank = RANKS[RANK_KEYS[currentRank]]

  return (
    <>
      <AnimatePresence>
        {!bootDone && (
          <motion.div exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
            <BootScreen lines={bootLines} />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: bootDone ? 1 : 0 }}
        transition={{ duration: 0.35 }}
        style={{ minHeight: '100vh', background: '#09090b', color: '#f4f4f5', overflowX: 'hidden' }}
      >
        {/* Grid overlay */}
        <div
          style={{
            position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
            backgroundImage: 'linear-gradient(rgba(34,211,238,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,0.03) 1px, transparent 1px)',
            backgroundSize: '64px 64px',
          }}
        />

        {/* Scan line */}
        <div
          style={{
            position: 'fixed', left: 0, width: '100%', height: '1px',
            background: 'linear-gradient(90deg, transparent, rgba(34,211,238,0.4), transparent)',
            pointerEvents: 'none', zIndex: 1,
            animation: 'scan 10s linear infinite', top: '-5%',
          }}
        />

        {/* ── NAVBAR ── */}
        <nav
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, height: 64, zIndex: 50,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '0 24px',
            background: 'rgba(9, 9, 11, 0.88)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(255,255,255,0.07)',
          }}
        >
          {/* Logo */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <div style={{ position: 'relative', width: 32, height: 32, flexShrink: 0 }}>
              <Image src="/logo.png" alt="KGT" fill style={{ objectFit: 'contain' }} />
            </div>
            <div>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#f4f4f5', letterSpacing: '0.05em', fontFamily: 'monospace' }}>
                King of Good Times
              </span>
            </div>
          </Link>

          {/* Nav links — hidden on mobile */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }} className="nav-desktop-links">
            {[
              { href: '/feed', label: 'Feed' },
              { href: '/challenges', label: 'Challenges' },
              { href: '/leaderboard', label: 'Ranks' },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                style={{
                  padding: '6px 14px', fontSize: 13, color: '#a1a1aa',
                  textDecoration: 'none', fontFamily: 'monospace',
                  transition: 'color 0.15s',
                }}
                className="nav-link"
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Auth buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Link href="/login">
              <button
                style={{
                  padding: '8px 16px', fontSize: 13, color: '#a1a1aa',
                  background: 'transparent',
                  border: '1px solid rgba(255,255,255,0.12)',
                  cursor: 'pointer', fontFamily: 'monospace',
                  transition: 'all 0.15s', letterSpacing: '0.05em',
                }}
                className="btn-nav-secondary"
              >
                Login
              </button>
            </Link>
            <Link href="/signup">
              <button
                style={{
                  padding: '8px 18px', fontSize: 13, fontWeight: 700,
                  background: '#22d3ee', color: '#000',
                  border: 'none', cursor: 'pointer',
                  fontFamily: 'monospace', letterSpacing: '0.08em',
                  transition: 'background 0.15s',
                }}
                className="btn-nav-primary"
              >
                Join Free
              </button>
            </Link>
          </div>
        </nav>

        {/* ── HERO ── */}
        <section
          style={{
            position: 'relative', paddingTop: 64,
            minHeight: '90vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <div style={{ maxWidth: 900, margin: '0 auto', padding: '80px 24px 60px', textAlign: 'center', position: 'relative', zIndex: 2 }}>

            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: bootDone ? 1 : 0, scale: bootDone ? 1 : 0.8 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              style={{ display: 'flex', justifyContent: 'center', marginBottom: 32 }}
            >
              <div
                style={{
                  position: 'relative', width: 96, height: 96,
                  border: '2px solid rgba(34,211,238,0.3)',
                  background: 'rgba(34,211,238,0.05)',
                  padding: 16,
                  boxShadow: '0 0 40px rgba(34,211,238,0.15)',
                }}
              >
                <Image src="/logo.png" alt="KGT" fill style={{ objectFit: 'contain', padding: 8 }} />
              </div>
            </motion.div>

            {/* Rank badge */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: bootDone ? 1 : 0, y: bootDone ? 0 : 8 }}
              transition={{ delay: 0.1 }}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 10,
                padding: '8px 18px',
                border: '1px solid rgba(255,255,255,0.1)',
                background: 'rgba(255,255,255,0.03)',
                fontSize: 13, color: '#71717a',
                marginBottom: 28, fontFamily: 'monospace',
              }}
            >
              <Activity style={{ width: 13, height: 13, color: '#22d3ee', flexShrink: 0 }} />
              Anonymous · Competitive · City-Native
              <span style={{ width: 1, height: 14, background: 'rgba(255,255,255,0.15)', flexShrink: 0 }} />
              <AnimatePresence mode="wait">
                <motion.span
                  key={currentRank}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.2 }}
                  style={{ fontWeight: 700, fontSize: 13, color: rank.color }}
                >
                  {rank.emoji} {rank.label}
                </motion.span>
              </AnimatePresence>
            </motion.div>

            {/* Main heading */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: bootDone ? 1 : 0, y: bootDone ? 0 : 20 }}
              transition={{ delay: 0.15 }}
            >
              <h1
                style={{
                  margin: '0 0 20px',
                  fontWeight: 900,
                  textTransform: 'uppercase',
                  lineHeight: 1,
                  letterSpacing: '-0.02em',
                  fontSize: 'clamp(3rem, 10vw, 7.5rem)',
                }}
              >
                <span style={{ display: 'block', color: '#f4f4f5' }}>King of</span>
                <span
                  style={{
                    display: 'block',
                    color: '#22d3ee',
                    textShadow: '0 0 80px rgba(34,211,238,0.3), 0 0 160px rgba(34,211,238,0.1)',
                  }}
                >
                  Good Times
                </span>
              </h1>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: bootDone ? 1 : 0 }}
              transition={{ delay: 0.22 }}
              style={{
                fontSize: 'clamp(15px, 2.5vw, 20px)',
                color: '#a1a1aa',
                maxWidth: 520,
                margin: '0 auto 36px',
                lineHeight: 1.65,
              }}
            >
              Post anonymous city rumors. Bust myths. Enter challenges for real money.
              Climb 10 ranks and become the King.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: bootDone ? 1 : 0, y: bootDone ? 0 : 12 }}
              transition={{ delay: 0.28 }}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}
            >
              <Link href="/signup">
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    padding: '14px 28px', fontSize: 15, fontWeight: 700,
                    background: '#22d3ee', color: '#000',
                    border: 'none', cursor: 'pointer',
                    fontFamily: 'monospace', letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                  }}
                >
                  <Zap style={{ width: 17, height: 17 }} />
                  Join the City — Free
                  <ArrowRight style={{ width: 17, height: 17 }} />
                </motion.button>
              </Link>
              <Link href="/login">
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    padding: '14px 24px', fontSize: 15, color: '#a1a1aa',
                    background: 'transparent',
                    border: '1px solid rgba(255,255,255,0.15)',
                    cursor: 'pointer', fontFamily: 'monospace', letterSpacing: '0.06em',
                    textTransform: 'uppercase', transition: 'all 0.15s',
                  }}
                >
                  Already an Agent
                  <ChevronRight style={{ width: 17, height: 17 }} />
                </motion.button>
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: bootDone ? 1 : 0 }}
              transition={{ delay: 0.4 }}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: 40, flexWrap: 'wrap', marginTop: 52,
              }}
            >
              {[
                { value: '10,000+', label: 'Active Agents', icon: Users },
                { value: '50,000+', label: 'Rumors Dropped', icon: Flame },
                { value: '₹5L+', label: 'Prize Money', icon: Trophy },
                { value: '8,000+', label: 'Myths Busted', icon: Eye },
              ].map(({ value, label, icon: Icon }) => (
                <div key={label} style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: 'clamp(22px, 4vw, 30px)', fontWeight: 900, color: '#22d3ee', margin: 0 }}>{value}</p>
                  <p style={{ fontSize: 12, color: '#52525b', marginTop: 4, display: 'flex', alignItems: 'center', gap: 5, justifyContent: 'center', fontFamily: 'monospace', letterSpacing: '0.08em' }}>
                    <Icon style={{ width: 12, height: 12, flexShrink: 0 }} />
                    {label}
                  </p>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ── RUMOR PREVIEW ── */}
        <section style={{ padding: '0 24px 80px', position: 'relative', zIndex: 2 }}>
          <div style={{ maxWidth: 960, margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
              <div>
                <p style={{ fontSize: 11, color: '#22d3ee', letterSpacing: '0.4em', textTransform: 'uppercase', fontFamily: 'monospace', marginBottom: 6, opacity: 0.6 }}>// What&apos;s Happening</p>
                <h2 style={{ fontSize: 28, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.01em', color: '#f4f4f5', margin: 0 }}>
                  City <span style={{ color: '#22d3ee' }}>Rumors</span>
                </h2>
              </div>
              <Link href="/signup">
                <button
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    padding: '9px 18px', fontSize: 13, fontWeight: 600,
                    background: 'transparent',
                    border: '1px solid rgba(34,211,238,0.3)',
                    color: '#22d3ee', cursor: 'pointer', fontFamily: 'monospace',
                    letterSpacing: '0.06em', transition: 'all 0.15s',
                  }}
                >
                  See All Rumors
                  <ArrowRight style={{ width: 14, height: 14 }} />
                </button>
              </Link>
            </div>

            {previewRumors.length > 0 ? (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                  gap: 16,
                }}
              >
                {previewRumors.map((rumor, i) => (
                  <PreviewRumorCard key={rumor.id} rumor={rumor} index={i} />
                ))}
              </div>
            ) : (
              <div
                style={{
                  padding: '48px 24px', textAlign: 'center',
                  border: '1px solid rgba(255,255,255,0.07)',
                  background: '#13131a',
                }}
              >
                <Flame style={{ width: 32, height: 32, color: '#3f3f46', margin: '0 auto 12px' }} />
                <p style={{ color: '#52525b', fontSize: 15 }}>Be the first to drop a rumor.</p>
                <Link href="/signup">
                  <button
                    style={{
                      marginTop: 16, padding: '10px 22px', fontSize: 14, fontWeight: 700,
                      background: '#22d3ee', color: '#000',
                      border: 'none', cursor: 'pointer', fontFamily: 'monospace',
                    }}
                  >
                    Join &amp; Drop
                  </button>
                </Link>
              </div>
            )}

            {/* CTA below preview */}
            <div
              style={{
                marginTop: 20, padding: '16px 20px',
                background: 'rgba(34,211,238,0.04)',
                border: '1px solid rgba(34,211,238,0.12)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12,
              }}
            >
              <p style={{ fontSize: 14, color: '#a1a1aa', fontFamily: 'monospace', margin: 0 }}>
                Join to see the full feed, vote on rumors, and drop your own.
              </p>
              <Link href="/signup">
                <button
                  style={{
                    padding: '9px 20px', fontSize: 13, fontWeight: 700,
                    background: '#22d3ee', color: '#000', border: 'none',
                    cursor: 'pointer', fontFamily: 'monospace', whiteSpace: 'nowrap',
                  }}
                >
                  Join Free →
                </button>
              </Link>
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section
          style={{
            padding: '80px 24px',
            borderTop: '1px solid rgba(255,255,255,0.06)',
            position: 'relative', zIndex: 2,
          }}
        >
          <div style={{ maxWidth: 960, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 56 }}>
              <p style={{ fontSize: 11, color: '#22d3ee', letterSpacing: '0.4em', textTransform: 'uppercase', fontFamily: 'monospace', marginBottom: 10, opacity: 0.6 }}>// How It Works</p>
              <h2 style={{ fontSize: 'clamp(28px, 5vw, 44px)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.01em', color: '#f4f4f5', margin: '0 0 16px' }}>
                Four Ways to <span style={{ color: '#22d3ee' }}>Dominate</span>
              </h2>
              <p style={{ fontSize: 16, color: '#71717a', maxWidth: 480, margin: '0 auto', lineHeight: 1.6 }}>
                A city-wide game where every action has real consequences.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
              {[
                { icon: Flame, title: 'Drop Rumors', color: '#f87171', tag: 'Anonymous', desc: 'Post city secrets under a random alias. Total anonymity. Let the streets judge what\'s real.' },
                { icon: Eye, title: 'Bust Myths', color: '#22d3ee', tag: 'Investigator', desc: 'Investigate rumors. Submit evidence. Get verdicts: CONFIRMED, DEBUNKED, or MISLEADING.' },
                { icon: Trophy, title: 'Win Challenges', color: '#a78bfa', tag: 'Real Stakes', desc: 'City-wide challenges with real prize money. PvP and community formats.' },
                { icon: Crown, title: 'Claim Your Rank', color: '#fbbf24', tag: '10 Ranks', desc: 'Start as a Ghost. Every action earns XP. Rise to become the King of Good Times.' },
              ].map(({ icon: Icon, title, color, tag, desc }, i) => (
                <motion.div
                  key={title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}
                  viewport={{ once: true }}
                  style={{
                    background: '#13131a',
                    border: '1px solid rgba(255,255,255,0.08)',
                    padding: 24,
                    position: 'relative',
                    transition: 'border-color 0.2s',
                  }}
                >
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg, transparent, ${color}50, transparent)` }} />
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                    <div
                      style={{
                        width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0, border: `1px solid ${color}40`, background: `${color}12`,
                      }}
                    >
                      <Icon style={{ width: 22, height: 22, color }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                        <h3 style={{ fontSize: 16, fontWeight: 700, color: '#f4f4f5', margin: 0 }}>{title}</h3>
                        <span
                          style={{
                            fontSize: 10, fontWeight: 700, padding: '2px 8px',
                            border: `1px solid ${color}35`, background: `${color}12`,
                            color, fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.1em',
                          }}
                        >
                          {tag}
                        </span>
                      </div>
                      <p style={{ fontSize: 14, color: '#71717a', lineHeight: 1.6, margin: 0 }}>{desc}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── RANKS ── */}
        <section
          style={{
            padding: '80px 24px',
            borderTop: '1px solid rgba(255,255,255,0.06)',
            position: 'relative', zIndex: 2,
          }}
        >
          <div style={{ maxWidth: 960, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 48 }}>
              <p style={{ fontSize: 11, color: '#22d3ee', letterSpacing: '0.4em', textTransform: 'uppercase', fontFamily: 'monospace', marginBottom: 10, opacity: 0.6 }}>// The Hierarchy</p>
              <h2 style={{ fontSize: 'clamp(26px, 4.5vw, 40px)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.01em', color: '#f4f4f5', margin: '0 0 12px' }}>
                10 Ranks to <span style={{ color: '#22d3ee' }}>Royalty</span>
              </h2>
              <p style={{ fontSize: 15, color: '#71717a', margin: 0 }}>Every action earns XP. Keep climbing.</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 10 }}>
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
                    style={{
                      padding: '18px 12px', textAlign: 'center',
                      background: isKing ? 'rgba(251,191,36,0.06)' : '#13131a',
                      border: isKing ? '1px solid rgba(251,191,36,0.3)' : '1px solid rgba(255,255,255,0.08)',
                    }}
                  >
                    <span style={{ fontSize: 26, display: 'block', marginBottom: 8 }}>{r.emoji}</span>
                    <p style={{ fontSize: 12, fontWeight: 700, color: r.color, margin: '0 0 4px', lineHeight: 1.3 }}>{r.label}</p>
                    <p style={{ fontSize: 10, color: '#3f3f46', fontFamily: 'monospace', margin: 0 }}>{r.xpRequired.toLocaleString()} XP</p>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </section>

        {/* ── FINAL CTA ── */}
        <section
          style={{
            padding: '100px 24px',
            borderTop: '1px solid rgba(255,255,255,0.06)',
            position: 'relative', zIndex: 2,
          }}
        >
          <motion.div
            style={{ maxWidth: 640, margin: '0 auto', textAlign: 'center' }}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <motion.div
              animate={{ boxShadow: ['0 0 0 rgba(251,191,36,0)', '0 0 60px rgba(251,191,36,0.2)', '0 0 0 rgba(251,191,36,0)'] }}
              transition={{ duration: 3, repeat: Infinity }}
              style={{
                display: 'inline-flex', padding: 20,
                border: '1px solid rgba(251,191,36,0.25)',
                background: 'rgba(251,191,36,0.05)',
                marginBottom: 32,
              }}
            >
              <Crown style={{ width: 48, height: 48, color: '#fbbf24' }} />
            </motion.div>

            <h2
              style={{
                fontSize: 'clamp(32px, 7vw, 56px)', fontWeight: 900,
                textTransform: 'uppercase', letterSpacing: '-0.02em',
                color: '#f4f4f5', margin: '0 0 20px',
              }}
            >
              Ready to <span style={{ color: '#22d3ee' }}>Rule?</span>
            </h2>
            <p style={{ fontSize: 17, color: '#71717a', margin: '0 0 36px', lineHeight: 1.65, maxWidth: 480, marginLeft: 'auto', marginRight: 'auto' }}>
              Join thousands of city agents. Drop rumors, win challenges, and rise to the throne.
            </p>
            <Link href="/signup">
              <motion.button
                whileTap={{ scale: 0.97 }}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 10,
                  padding: '16px 40px', fontSize: 16, fontWeight: 900,
                  background: '#22d3ee', color: '#000', border: 'none',
                  cursor: 'pointer', fontFamily: 'monospace',
                  textTransform: 'uppercase', letterSpacing: '0.08em',
                }}
              >
                Join the City — Free
                <ArrowRight style={{ width: 20, height: 20 }} />
              </motion.button>
            </Link>
          </motion.div>
        </section>

        {/* ── FOOTER ── */}
        <footer
          style={{
            padding: '32px 24px',
            borderTop: '1px solid rgba(255,255,255,0.06)',
            position: 'relative', zIndex: 2,
          }}
        >
          <div
            style={{
              maxWidth: 960, margin: '0 auto',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              flexWrap: 'wrap', gap: 16,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ position: 'relative', width: 22, height: 22, opacity: 0.4 }}>
                <Image src="/logo.png" alt="" fill style={{ objectFit: 'contain' }} />
              </div>
              <span style={{ fontSize: 12, color: '#3f3f46', fontFamily: 'monospace', letterSpacing: '0.08em' }}>
                sandnco.lol · King of Good Times
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
              {[
                { href: '/legal/tos', label: 'Terms' },
                { href: '/legal/privacy', label: 'Privacy' },
                { href: '/support', label: 'Support' },
                { href: 'mailto:sandncolol@gmail.com', label: 'Contact' },
              ].map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  style={{ fontSize: 13, color: '#3f3f46', textDecoration: 'none', transition: 'color 0.15s', fontFamily: 'monospace' }}
                  className="footer-link"
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </footer>
      </motion.div>
    </>
  )
}

function PreviewRumorCard({ rumor, index }: { rumor: PreviewRumor; index: number }) {
  const heat = rumor.heat_score
  const isHot = heat > 30
  const heatColor = isHot ? '#f87171' : heat > 10 ? '#fbbf24' : '#3f3f46'

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      viewport={{ once: true }}
    >
      <Link href="/signup" style={{ textDecoration: 'none', display: 'block' }}>
        <div
          style={{
            background: '#13131a',
            border: '1px solid rgba(255,255,255,0.08)',
            padding: 20,
            cursor: 'pointer',
            position: 'relative',
            transition: 'border-color 0.2s',
          }}
          className="rumor-preview-card"
        >
          {/* Heat bar */}
          <div
            style={{
              position: 'absolute', top: 0, left: 0, height: 2,
              background: `linear-gradient(90deg, ${heatColor}, transparent)`,
              width: `${Math.min(100, heat)}%`,
              transition: 'width 0.5s',
            }}
          />
          {/* Meta */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontSize: 12, color: '#52525b', fontFamily: 'monospace' }}>
              {rumor.anonymous_alias}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {rumor.category && (
                <span
                  style={{
                    fontSize: 10, fontFamily: 'monospace', textTransform: 'uppercase',
                    letterSpacing: '0.1em', padding: '2px 7px',
                    background: 'rgba(34,211,238,0.06)',
                    border: '1px solid rgba(34,211,238,0.15)',
                    color: '#22d3ee', opacity: 0.7,
                  }}
                >
                  {rumor.category}
                </span>
              )}
              {isHot && <Flame style={{ width: 13, height: 13, color: '#f87171' }} />}
            </div>
          </div>
          {/* Title */}
          <h3
            style={{
              fontSize: 15, fontWeight: 700, color: '#f4f4f5', margin: '0 0 12px',
              lineHeight: 1.4,
              display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {rumor.title}
          </h3>
          {/* Footer */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 12, color: '#3f3f46', fontFamily: 'monospace' }}>
              {formatRelativeTime(rumor.created_at)}
            </span>
            <span
              style={{
                fontSize: 12, fontWeight: 700, color: heatColor, fontFamily: 'monospace',
                display: 'flex', alignItems: 'center', gap: 4,
              }}
            >
              <TrendingUp style={{ width: 11, height: 11 }} />
              {Math.floor(heat)}
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
