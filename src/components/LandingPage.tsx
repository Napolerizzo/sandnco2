'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Flame, Trophy, Crown, Zap, Eye, Shield, ArrowRight,
  Users, TrendingUp, Activity, MessageCircle, ChevronRight
} from 'lucide-react'
import { RANKS } from '@/lib/ranks'

const RANK_KEYS = Object.keys(RANKS) as (keyof typeof RANKS)[]

const BOOT_LINES = [
  '> KING OF GOOD TIMES V2 — INITIALIZING...',
  '> CITY DATABASE ················· ONLINE',
  '> RUMOR ENGINE ················· ACTIVE',
  '> CHALLENGE PROTOCOL ············ READY',
  '> WELCOME TO THE CITY.',
]

function BootScreen({ lines }: { lines: string[] }) {
  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
      <div className="max-w-lg w-full px-8">
        <div className="mb-10 flex items-center gap-3">
          <Crown className="w-8 h-8 text-cyan-400" />
          <span className="text-xs text-cyan-400/50 tracking-[0.4em] uppercase font-mono">System Boot</span>
        </div>
        <div className="space-y-3">
          {lines.map((line, i) => (
            <motion.p
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.15 }}
              className={`font-mono text-sm ${
                line.includes('ONLINE') || line.includes('ACTIVE') || line.includes('READY')
                  ? 'text-green-400'
                  : 'text-cyan-400/60'
              }`}
            >
              {line}
            </motion.p>
          ))}
          {lines.length > 0 && lines.length < BOOT_LINES.length && (
            <span className="text-cyan-400 animate-pulse font-mono">█</span>
          )}
        </div>
      </div>
    </div>
  )
}

export default function LandingPage() {
  const [bootDone, setBootDone] = useState(false)
  const [bootLines, setBootLines] = useState<string[]>([])
  const [currentRank, setCurrentRank] = useState(0)

  useEffect(() => {
    // Only show boot sequence once per session
    if (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('kgt_boot')) {
      setBootDone(true)
      return
    }
    let i = 0
    const timer = setInterval(() => {
      if (i < BOOT_LINES.length) {
        const line = BOOT_LINES[i]
        setBootLines(prev => [...prev, line])
        i++
      } else {
        clearInterval(timer)
        setTimeout(() => {
          sessionStorage.setItem('kgt_boot', '1')
          setBootDone(true)
        }, 400)
      }
    }, 180)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentRank(prev => (prev + 1) % RANK_KEYS.length)
    }, 2500)
    return () => clearInterval(timer)
  }, [])

  const rank = RANKS[RANK_KEYS[currentRank]]

  return (
    <>
      <AnimatePresence>
        {!bootDone && (
          <motion.div exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
            <BootScreen lines={bootLines} />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: bootDone ? 1 : 0 }}
        transition={{ duration: 0.4 }}
        className="min-h-screen bg-black text-white overflow-x-hidden"
      >
        {/* Grid background */}
        <div
          className="fixed inset-0 pointer-events-none opacity-50"
          style={{
            backgroundImage: 'linear-gradient(rgba(0,255,245,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,245,0.04) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />

        {/* Scan line — CSS animation, no framer-motion */}
        <div
          className="fixed left-0 w-full h-px pointer-events-none z-10"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(0,255,245,0.5), transparent)',
            animation: 'scan 10s linear infinite',
            top: '-5%',
          }}
        />

        {/* ── NAVBAR ── */}
        <nav className="fixed top-0 inset-x-0 z-50 h-16 flex items-center justify-between px-6 md:px-10 border-b border-white/[0.06] bg-black/70 backdrop-blur-xl">
          <Link href="/" className="flex items-center gap-3">
            <div className="relative w-8 h-8">
              <Image src="/logo.png" alt="KGT" fill className="object-contain" />
            </div>
            <span className="text-base font-bold tracking-wide text-white hidden sm:block">King of Good Times</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <button className="px-5 py-2.5 text-sm text-gray-400 border border-white/10 hover:border-cyan-400/40 hover:text-cyan-400 transition-all font-mono tracking-wide">
                Login
              </button>
            </Link>
            <Link href="/signup">
              <button className="px-5 py-2.5 text-sm font-bold bg-cyan-400 text-black hover:bg-cyan-300 transition-all tracking-wide">
                Join Free
              </button>
            </Link>
          </div>
        </nav>

        {/* ── HERO ── */}
        <section className="relative min-h-screen flex items-center justify-center pt-16">
          <div className="max-w-5xl mx-auto px-6 text-center">

            {/* Rank cycling badge */}
            <motion.div
              className="inline-flex items-center gap-3 px-5 py-2.5 border border-white/10 text-sm text-gray-400 mb-10"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: bootDone ? 1 : 0, y: bootDone ? 0 : 10 }}
              transition={{ delay: 0.1 }}
            >
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              <span>Anonymous · Competitive · City-Native</span>
              <div className="w-px h-4 bg-white/15" />
              <AnimatePresence mode="wait">
                <motion.span
                  key={currentRank}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.2 }}
                  className="font-bold text-sm"
                  style={{ color: rank.color }}
                >
                  {rank.emoji} {rank.label}
                </motion.span>
              </AnimatePresence>
            </motion.div>

            {/* Main heading */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: bootDone ? 1 : 0, y: bootDone ? 0 : 30 }}
              transition={{ delay: 0.15 }}
            >
              <h1 className="font-black leading-none mb-8 uppercase tracking-tighter" style={{ fontSize: 'clamp(3.5rem, 11vw, 9rem)' }}>
                <span className="block text-white">King of</span>
                <span
                  className="block text-cyan-400"
                  style={{ textShadow: '0 0 80px rgba(0,255,245,0.35), 0 0 160px rgba(0,255,245,0.15)' }}
                >
                  Good Times
                </span>
              </h1>
            </motion.div>

            <motion.p
              className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: bootDone ? 1 : 0 }}
              transition={{ delay: 0.25 }}
            >
              Post anonymous city rumors. Bust myths. Enter challenges for real money.
              Climb 10 ranks and become the King of Good Times.
            </motion.p>

            {/* CTAs */}
            <motion.div
              className="flex items-center justify-center gap-4 flex-wrap"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: bootDone ? 1 : 0, y: bootDone ? 0 : 20 }}
              transition={{ delay: 0.3 }}
            >
              <Link href="/signup">
                <button className="px-8 py-4 text-base font-bold bg-cyan-400 text-black hover:bg-cyan-300 transition-all flex items-center gap-2.5 tracking-wide">
                  <Zap className="w-5 h-5" />
                  Join the City — Free
                  <ArrowRight className="w-5 h-5" />
                </button>
              </Link>
              <Link href="/login">
                <button className="px-8 py-4 text-base text-gray-300 border border-white/15 hover:border-cyan-400/50 hover:text-cyan-400 transition-all flex items-center gap-2.5 tracking-wide">
                  Already an Agent
                  <ChevronRight className="w-5 h-5" />
                </button>
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div
              className="flex items-center justify-center gap-10 md:gap-16 mt-20 flex-wrap"
              initial={{ opacity: 0 }}
              animate={{ opacity: bootDone ? 1 : 0 }}
              transition={{ delay: 0.45 }}
            >
              {[
                { value: '10,000+', label: 'Active Agents', icon: Users },
                { value: '50,000+', label: 'Rumors Dropped', icon: Flame },
                { value: '₹5L+', label: 'Prize Money', icon: Trophy },
                { value: '8,000+', label: 'Myths Busted', icon: Eye },
              ].map(({ value, label, icon: Icon }) => (
                <div key={label} className="text-center">
                  <p className="text-3xl font-black text-cyan-400">{value}</p>
                  <p className="text-sm text-gray-500 mt-1 tracking-wide flex items-center gap-1.5 justify-center">
                    <Icon className="w-3.5 h-3.5" /> {label}
                  </p>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-px h-12 bg-gradient-to-b from-cyan-400/30 to-transparent"
            />
          </div>
        </section>

        {/* ── FEATURES ── */}
        <section className="py-28 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <p className="text-xs text-cyan-400/50 tracking-[0.4em] uppercase mb-4 font-mono">// The Game</p>
              <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tight text-white">
                Four Ways to <span className="text-cyan-400">Dominate</span>
              </h2>
              <p className="text-gray-400 mt-5 text-lg max-w-xl mx-auto leading-relaxed">
                This isn't just a social app. It's a city-wide game where every action has consequences.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  icon: Flame,
                  title: 'Drop Rumors',
                  color: '#ff3366',
                  tag: 'Anonymous',
                  desc: 'Post city secrets and gossip under a random alias. Total anonymity guaranteed. Let the streets decide what\'s real.',
                },
                {
                  icon: Eye,
                  title: 'Bust Myths',
                  color: '#00fff5',
                  tag: 'Investigator',
                  desc: 'Investigate posted rumors. Submit evidence. Get verdicts: CONFIRMED, DEBUNKED, or MISLEADING from the community.',
                },
                {
                  icon: Trophy,
                  title: 'Win Challenges',
                  color: '#a855f7',
                  tag: 'Real Money',
                  desc: 'Compete in city-wide challenges with real stakes. Put money on the line. Win big. PvP and community formats.',
                },
                {
                  icon: Crown,
                  title: 'Claim Your Rank',
                  color: '#fbbf24',
                  tag: '10 Ranks',
                  desc: 'Start as a Ghost in the City. Every action earns XP. Rise through 10 ranks to become the King of Good Times.',
                },
              ].map(({ icon: Icon, title, color, tag, desc }, i) => (
                <motion.div
                  key={title}
                  className="relative bg-[#050a0e] border border-white/[0.08] p-8 hover:border-cyan-400/25 transition-all group"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  viewport={{ once: true }}
                >
                  {/* Top accent line */}
                  <div
                    className="absolute top-0 left-0 right-0 h-px"
                    style={{ background: `linear-gradient(90deg, transparent, ${color}50, transparent)` }}
                  />

                  <div className="flex items-start gap-5">
                    <div
                      className="w-12 h-12 flex items-center justify-center flex-shrink-0 border"
                      style={{ borderColor: `${color}40`, background: `${color}10` }}
                    >
                      <Icon className="w-6 h-6" style={{ color }} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-xl font-bold text-white">{title}</h3>
                        <span
                          className="text-xs font-bold px-2.5 py-1 border uppercase tracking-wider font-mono"
                          style={{ color, borderColor: `${color}35`, background: `${color}10` }}
                        >
                          {tag}
                        </span>
                      </div>
                      <p className="text-gray-400 text-base leading-relaxed">{desc}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── RANKS ── */}
        <section className="py-28 px-6 border-y border-white/[0.05]">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <p className="text-xs text-cyan-400/50 tracking-[0.4em] uppercase mb-4 font-mono">// The Hierarchy</p>
              <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tight text-white">
                10 Ranks to <span className="text-cyan-400">Royalty</span>
              </h2>
              <p className="text-gray-400 mt-5 text-lg">
                Every action earns XP. Every XP brings you closer to the crown.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {RANK_KEYS.map((key, i) => {
                const r = RANKS[key]
                const isKing = i === RANK_KEYS.length - 1
                return (
                  <motion.div
                    key={key}
                    className={`p-5 text-center border transition-all cursor-default ${
                      isKing
                        ? 'border-yellow-400/30 bg-yellow-400/5'
                        : 'border-white/[0.08] bg-[#050a0e] hover:border-cyan-400/25'
                    }`}
                    initial={{ opacity: 0, scale: 0.92 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    viewport={{ once: true }}
                  >
                    <span className="text-3xl block mb-3">{r.emoji}</span>
                    <p className="text-sm font-bold leading-tight" style={{ color: r.color }}>{r.label}</p>
                    <p className="text-xs text-gray-600 mt-1.5 font-mono">{r.xpRequired.toLocaleString()} XP</p>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </section>

        {/* ── FINAL CTA ── */}
        <section className="py-36 px-6">
          <motion.div
            className="max-w-3xl mx-auto text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <motion.div
              animate={{ boxShadow: ['0 0 0px rgba(251,191,36,0)', '0 0 60px rgba(251,191,36,0.25)', '0 0 0px rgba(251,191,36,0)'] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="inline-block p-5 border border-yellow-400/25 bg-yellow-400/5 mb-10"
            >
              <Crown className="w-14 h-14 text-yellow-400" />
            </motion.div>

            <h2 className="text-5xl md:text-6xl font-black uppercase tracking-tight text-white mb-6">
              Ready to <span className="text-cyan-400">Rule?</span>
            </h2>
            <p className="text-xl text-gray-400 mb-12 leading-relaxed max-w-xl mx-auto">
              Join thousands of city agents. Drop rumors, win challenges, and rise to the throne.
              The city is waiting for its next King.
            </p>
            <Link href="/signup">
              <motion.button
                className="px-12 py-5 text-lg font-black bg-cyan-400 text-black hover:bg-cyan-300 transition-all inline-flex items-center gap-3 tracking-wide"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Shield className="w-6 h-6" />
                Join the City — Free
                <ArrowRight className="w-6 h-6" />
              </motion.button>
            </Link>
          </motion.div>
        </section>

        {/* ── FOOTER ── */}
        <footer className="py-10 px-6 border-t border-white/[0.05]">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-5">
            <div className="flex items-center gap-3">
              <div className="relative w-6 h-6">
                <Image src="/logo.png" alt="" fill className="object-contain opacity-40" />
              </div>
              <span className="text-sm text-gray-600 tracking-wide font-mono">
                sandnco.lol · King of Good Times
              </span>
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-600">
              <Link href="/legal/tos" className="hover:text-cyan-400 transition-colors">Terms</Link>
              <Link href="/legal/privacy" className="hover:text-cyan-400 transition-colors">Privacy</Link>
              <Link href="/support" className="hover:text-cyan-400 transition-colors">Support</Link>
              <a href="mailto:sandncolol@gmail.com" className="hover:text-cyan-400 transition-colors">Contact</a>
            </div>
          </div>
        </footer>
      </motion.div>
    </>
  )
}
