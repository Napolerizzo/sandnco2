'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import {
  Flame, Trophy, Crown, Zap, Eye, Shield, ArrowRight,
  Users, TrendingUp, Terminal, ChevronRight, Lock,
  Crosshair, Cpu, Activity, Radio, Skull, Star
} from 'lucide-react'
import { RANKS } from '@/lib/ranks'

const RANK_KEYS = Object.keys(RANKS) as (keyof typeof RANKS)[]

// Typed terminal text effect
function TypeWriter({ text, delay = 0 }: { text: string; delay?: number }) {
  const [displayed, setDisplayed] = useState('')
  const [started, setStarted] = useState(false)

  useEffect(() => {
    const startTimeout = setTimeout(() => setStarted(true), delay)
    return () => clearTimeout(startTimeout)
  }, [delay])

  useEffect(() => {
    if (!started) return
    let i = 0
    const interval = setInterval(() => {
      if (i < text.length) {
        setDisplayed(text.slice(0, i + 1))
        i++
      } else {
        clearInterval(interval)
      }
    }, 40)
    return () => clearInterval(interval)
  }, [started, text])

  return (
    <span>
      {displayed}
      <span className="animate-pulse text-[var(--cyan)]">█</span>
    </span>
  )
}

export default function LandingPage() {
  const [currentRank, setCurrentRank] = useState(0)
  const [glitchActive, setGlitchActive] = useState(false)
  const [bootSequence, setBootSequence] = useState(true)
  const [bootLines, setBootLines] = useState<string[]>([])
  const heroRef = useRef<HTMLDivElement>(null)
  const { scrollY } = useScroll()
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0])
  const heroY = useTransform(scrollY, [0, 400], [0, -80])

  // Boot sequence
  useEffect(() => {
    const lines = [
      '> INITIALIZING_KING_OF_GOOD_TIMES_V2...',
      '> LOADING_CITY_DATABASE................ OK',
      '> ESTABLISHING_SECURE_CONNECTION....... OK',
      '> RUMOR_ENGINE_ONLINE.................. OK',
      '> CHALLENGE_PROTOCOL_ACTIVE............ OK',
      '> RANK_SYSTEM_CALIBRATED............... OK',
      '> WELCOME_TO_THE_CITY.',
    ]
    let i = 0
    const interval = setInterval(() => {
      if (i < lines.length) {
        setBootLines(prev => [...prev, lines[i]])
        i++
      } else {
        clearInterval(interval)
        setTimeout(() => setBootSequence(false), 600)
      }
    }, 200)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const rankInterval = setInterval(() => {
      setCurrentRank(prev => (prev + 1) % RANK_KEYS.length)
    }, 2000)
    const glitchInterval = setInterval(() => {
      setGlitchActive(true)
      setTimeout(() => setGlitchActive(false), 150)
    }, 8000)
    return () => { clearInterval(rankInterval); clearInterval(glitchInterval) }
  }, [])

  const rank = RANKS[RANK_KEYS[currentRank]]

  const features = [
    {
      icon: Flame, title: 'DROP_RUMORS', color: 'var(--red)',
      desc: 'Post anonymous city secrets. Let the streets decide what\'s real.',
      cmd: '$ rumor --post --anonymous --city=all',
    },
    {
      icon: Eye, title: 'BUST_MYTHS', color: 'var(--cyan)',
      desc: 'Investigate. Present evidence. Flip the narrative or confirm the chaos.',
      cmd: '$ mythbust --investigate --evidence=submit',
    },
    {
      icon: Trophy, title: 'WIN_CHALLENGES', color: '#a855f7',
      desc: 'Compete in city challenges. Put your money where your mouth is.',
      cmd: '$ challenge --enter --stake=100 --mode=pvp',
    },
    {
      icon: Crown, title: 'CLAIM_YOUR_RANK', color: '#fbbf24',
      desc: 'Rise from Ghost in the City to the one true King of Good Times.',
      cmd: '$ rank --climb --target=king_of_good_times',
    },
  ]

  const stats = [
    { label: 'ACTIVE_AGENTS', value: '10K+', icon: Users },
    { label: 'RUMORS_DEPLOYED', value: '50K+', icon: Flame },
    { label: 'PRIZE_POOL', value: '₹5L+', icon: Trophy },
    { label: 'MYTHS_BUSTED', value: '8K+', icon: Crosshair },
  ]

  // Boot sequence overlay
  if (bootSequence) {
    return (
      <div className="min-h-screen bg-black text-[var(--cyan)] font-mono flex items-center justify-center p-6">
        <div className="max-w-xl w-full">
          <div className="terminal">
            <div className="terminal-header">
              <div className="terminal-dots"><span /><span /><span /></div>
              <div className="terminal-title">
                <Terminal className="w-3 h-3" /> BOOT_SEQUENCE
              </div>
            </div>
            <div className="terminal-body text-xs leading-loose">
              {bootLines.map((line, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={line.includes('OK') ? 'text-[var(--green)]' : 'text-[var(--cyan)]'}
                >
                  {line}
                </motion.div>
              ))}
              <span className="animate-pulse">█</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-[var(--cyan)] font-mono overflow-hidden">

      {/* Grid background */}
      <div className="fixed inset-0 grid-bg pointer-events-none" style={{ maskImage: 'radial-gradient(ellipse 80% 50% at 50% 50%, black, transparent)' }} />

      {/* Scanning line */}
      <motion.div
        className="fixed left-0 w-full h-[2px] pointer-events-none z-10"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(0,255,245,0.4), transparent)', boxShadow: '0 0 20px rgba(0,255,245,0.3)' }}
        animate={{ top: ['-5%', '105%'] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
      />

      {/* Corner brackets */}
      <div className="fixed top-6 left-6 w-12 h-12 border-l-2 border-t-2 border-[var(--cyan-border)] pointer-events-none z-40" />
      <div className="fixed top-6 right-6 w-12 h-12 border-r-2 border-t-2 border-[var(--cyan-border)] pointer-events-none z-40" />
      <div className="fixed bottom-6 left-6 w-12 h-12 border-l-2 border-b-2 border-[var(--cyan-border)] pointer-events-none z-40" />
      <div className="fixed bottom-6 right-6 w-12 h-12 border-r-2 border-b-2 border-[var(--cyan-border)] pointer-events-none z-40" />

      {/* Glitch overlay */}
      <AnimatePresence>
        {glitchActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.15, 0, 0.1, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 bg-[var(--cyan)] mix-blend-screen pointer-events-none z-20"
          />
        )}
      </AnimatePresence>

      {/* ── NAV ── */}
      <nav className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 h-14 bg-black/80 backdrop-blur-sm border-b border-[var(--cyan-border)]">
        <div className="flex items-center gap-3">
          <div className="relative w-7 h-7">
            <Image src="/logo.png" alt="KGT" fill className="object-contain" />
          </div>
          <span className="text-xs font-bold tracking-[0.25em] text-glow-cyan uppercase hidden sm:inline">
            KING_OF_GOOD_TIMES
          </span>
          <span className="text-[8px] text-[var(--text-dim)] tracking-wider hidden md:inline">
            // V2.0
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login">
            <motion.button
              className="btn-outline px-4 py-2 text-[10px]"
              whileTap={{ scale: 0.97 }}
            >
              <Lock className="w-3 h-3 inline mr-1.5" />
              LOGIN
            </motion.button>
          </Link>
          <Link href="/signup">
            <motion.button
              className="btn-execute px-5 py-2 text-[10px]"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
            >
              <Zap className="w-3 h-3 inline mr-1.5" />
              REGISTER_AGENT
            </motion.button>
          </Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <motion.section
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center pt-14"
        style={{ opacity: heroOpacity, y: heroY }}
      >
        <div className="text-center px-6 max-w-4xl mx-auto">

          {/* Cycling rank badge */}
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 border border-[var(--cyan-border)] bg-[var(--cyan-ghost)] mb-8"
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Activity className="w-3 h-3 text-[var(--text-dim)]" />
            <AnimatePresence mode="wait">
              <motion.span
                key={currentRank}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="text-[10px] tracking-[0.2em] font-bold uppercase"
                style={{ color: rank.color }}
              >
                {rank.emoji} {rank.label.toUpperCase().replace(/\s+/g, '_')}
              </motion.span>
            </AnimatePresence>
            <span className="text-[8px] text-[var(--text-dim)]">
              [{rank.xpRequired.toLocaleString()} XP]
            </span>
          </motion.div>

          {/* Main heading */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="leading-none mb-6" style={{ fontSize: 'clamp(3rem, 10vw, 8rem)' }}>
              <motion.span
                className="block font-extrabold text-glow-cyan"
                animate={{ filter: glitchActive ? 'hue-rotate(40deg) brightness(2)' : 'none' }}
              >
                KING OF
              </motion.span>
              <span className="block font-extrabold text-white" style={{ textShadow: '0 0 40px rgba(255,255,255,0.15)' }}>
                GOOD TIMES
              </span>
            </h1>
          </motion.div>

          <motion.div
            className="text-sm text-[var(--text-dim)] max-w-xl mx-auto mb-3 leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <TypeWriter text="Post anonymous rumors. Bust myths. Enter challenges. Earn real money. Climb the city ranks." delay={300} />
          </motion.div>

          <motion.p
            className="text-[9px] text-[var(--text-ghost)] tracking-[0.5em] uppercase mb-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            SANDNCO.LOL — SECURE_TERMINAL_V2
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            className="flex items-center justify-center gap-4 flex-wrap"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <Link href="/signup">
              <motion.button
                className="btn-execute px-8 py-4 text-sm flex items-center gap-2"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <Shield className="w-4 h-4" />
                INITIALIZE_AGENT
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </Link>
            <Link href="/login">
              <motion.button
                className="btn-outline px-8 py-4 text-sm flex items-center gap-2"
                whileHover={{ scale: 1.01 }}
              >
                <Terminal className="w-4 h-4" />
                ACCESS_TERMINAL
              </motion.button>
            </Link>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-px h-12 bg-gradient-to-b from-[var(--cyan)]/40 to-transparent" />
          <span className="text-[8px] text-[var(--text-dim)] tracking-[0.3em] uppercase">SCROLL_DOWN</span>
        </motion.div>
      </motion.section>

      {/* ── STATS ── */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="terminal">
            <div className="terminal-header">
              <div className="terminal-dots"><span /><span /><span /></div>
              <div className="terminal-title">
                <Activity className="w-3 h-3" /> CITY_METRICS
              </div>
            </div>
            <div className="terminal-body">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {stats.map(({ label, value, icon: Icon }, i) => (
                  <motion.div
                    key={label}
                    className="border border-[var(--cyan-border)] bg-[var(--cyan-ghost)] p-5 text-center"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <Icon className="w-5 h-5 text-[var(--cyan)] mx-auto mb-2" />
                    <p className="text-2xl font-extrabold text-glow-cyan">{value}</p>
                    <p className="text-[9px] text-[var(--text-dim)] mt-1 tracking-[0.15em] uppercase">{label}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            className="text-center mb-10"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <div className="text-[9px] text-[var(--text-dim)] tracking-[0.3em] uppercase mb-3">
              // SYSTEM_CAPABILITIES
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white uppercase tracking-wider mb-3">
              THE CITY <span className="text-glow-cyan">PROTOCOLS</span>
            </h2>
            <p className="text-xs text-[var(--text-dim)]">Four ways to dominate the streets</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {features.map(({ icon: Icon, title, color, desc, cmd }, i) => (
              <motion.div
                key={title}
                className="terminal group"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="terminal-header">
                  <div className="terminal-dots"><span /><span /><span /></div>
                  <div className="terminal-title">
                    <Icon className="w-3 h-3" style={{ color }} /> {title}
                  </div>
                </div>
                <div className="terminal-body">
                  <div className="flex items-start gap-3 mb-4">
                    <div
                      className="w-10 h-10 border flex items-center justify-center flex-shrink-0"
                      style={{ borderColor: color, background: `${color}10` }}
                    >
                      <Icon className="w-5 h-5" style={{ color }} />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-1">{title.replace(/_/g, ' ')}</h3>
                      <p className="text-[11px] text-[var(--text-dim)] leading-relaxed">{desc}</p>
                    </div>
                  </div>
                  <div className="text-[9px] text-[var(--green)] bg-black/50 px-3 py-2 border border-[var(--cyan-border)] font-mono">
                    {cmd}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── RANK SHOWCASE ── */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="terminal">
            <div className="terminal-header">
              <div className="terminal-dots"><span /><span /><span /></div>
              <div className="terminal-title">
                <Crown className="w-3 h-3" /> RANK_HIERARCHY
              </div>
            </div>
            <div className="terminal-body">
              <motion.div
                className="text-center mb-8"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
              >
                <h2 className="text-2xl md:text-3xl font-extrabold text-white uppercase tracking-wider mb-2">
                  10 RANKS TO <span className="text-glow-cyan">ROYALTY</span>
                </h2>
                <p className="text-[10px] text-[var(--text-dim)] tracking-[0.2em]">
                  EVERY_ACTION_EARNS_XP. EVERY_XP_BRINGS_YOU_CLOSER_TO_THE_CROWN.
                </p>
              </motion.div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {RANK_KEYS.map((key, i) => {
                  const r = RANKS[key]
                  const isKing = i === RANK_KEYS.length - 1
                  return (
                    <motion.div
                      key={key}
                      className={`p-4 text-center border ${
                        isKing
                          ? 'border-[#fbbf24]/50 bg-[#fbbf24]/5'
                          : 'border-[var(--cyan-border)] bg-[var(--cyan-ghost)]'
                      }`}
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.06 }}
                      viewport={{ once: true }}
                      whileHover={{
                        borderColor: r.color,
                        boxShadow: `0 0 15px ${r.glowColor}`,
                      }}
                    >
                      <span className="text-2xl block mb-2">{r.emoji}</span>
                      <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: r.color }}>
                        {r.label.toUpperCase().replace(/\s+/g, '_')}
                      </p>
                      <p className="text-[9px] text-[var(--text-dim)] mt-1">
                        {r.xpRequired.toLocaleString()} XP
                      </p>
                    </motion.div>
                  )
                })}
              </div>
            </div>
            <div className="terminal-footer">
              <Cpu className="w-3 h-3" />
              RANK_ENGINE: ACTIVE | AUTO_CALIBRATION: ENABLED
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 px-6">
        <motion.div
          className="max-w-2xl mx-auto terminal"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
        >
          <div className="terminal-header">
            <div className="terminal-dots"><span /><span /><span /></div>
            <div className="terminal-title">
              <Radio className="w-3 h-3" /> TRANSMISSION_INCOMING
            </div>
          </div>
          <div className="terminal-body text-center py-8">
            <motion.div
              className="inline-block p-4 border border-[var(--cyan-border)] bg-[var(--cyan-ghost)] mb-6 relative"
              animate={{ boxShadow: ['0 0 0px rgba(0,255,245,0)', '0 0 30px rgba(0,255,245,0.3)', '0 0 0px rgba(0,255,245,0)'] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <Crown className="w-10 h-10 text-[#fbbf24]" />
              <motion.div
                className="absolute inset-0 border-2 border-[var(--cyan)]"
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </motion.div>

            <h2 className="text-3xl font-extrabold text-glow-cyan uppercase tracking-wider mb-3">
              READY_TO_RULE?
            </h2>
            <p className="text-xs text-[var(--text-dim)] mb-8 max-w-sm mx-auto leading-relaxed">
              Join thousands of city agents. Drop rumors, win challenges, and rise to the throne.
              The city is waiting for its next King.
            </p>
            <Link href="/signup">
              <motion.button
                className="btn-execute px-10 py-4 text-sm"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <span className="relative z-10 flex items-center justify-center gap-3">
                  <Shield className="w-4 h-4" />
                  JOIN_THE_CITY — FREE
                  <ArrowRight className="w-4 h-4" />
                </span>
              </motion.button>
            </Link>
          </div>
          <div className="terminal-footer">
            <Zap className="w-3 h-3" />
            SIGNAL_STRENGTH: MAXIMUM | ENCRYPTION: AES-256
          </div>
        </motion.div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="py-10 px-6 border-t border-[var(--cyan-border)]">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="relative w-5 h-5">
              <Image src="/logo.png" alt="KGT" fill className="object-contain opacity-50" />
            </div>
            <span className="text-[9px] text-[var(--text-dim)] tracking-[0.2em] uppercase">
              SANDNCO.LOL V2 · KING_OF_GOOD_TIMES
            </span>
          </div>
          <div className="flex items-center gap-5 text-[9px] text-[var(--text-dim)] tracking-[0.15em] uppercase">
            <Link href="/legal/tos" className="hover:text-[var(--cyan)] transition-colors">
              TERMS
            </Link>
            <Link href="/legal/privacy" className="hover:text-[var(--cyan)] transition-colors">
              PRIVACY
            </Link>
            <Link href="/support" className="hover:text-[var(--cyan)] transition-colors">
              SUPPORT
            </Link>
            <a href="mailto:sandncolol@gmail.com" className="hover:text-[var(--cyan)] transition-colors">
              CONTACT
            </a>
          </div>
        </div>
      </footer>

      {/* Watermark */}
      <motion.div
        className="fixed bottom-4 left-4 z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <div className="flex items-center gap-2">
          <div className="relative w-5 h-5">
            <Image src="/logo.png" alt="" fill className="object-contain opacity-30 hover:opacity-80 transition-opacity" />
          </div>
          <span className="text-[7px] text-[var(--text-ghost)] tracking-[0.3em] uppercase">SANDNCO.LOL</span>
        </div>
      </motion.div>
    </div>
  )
}
