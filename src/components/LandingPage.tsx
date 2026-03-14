'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import { Flame, Trophy, Crown, Zap, Eye, Shield, ArrowRight, Star, Users, TrendingUp } from 'lucide-react'
import { RANKS } from '@/lib/ranks'

const RANK_KEYS = Object.keys(RANKS) as (keyof typeof RANKS)[]

export default function LandingPage() {
  const [currentRank, setCurrentRank] = useState(0)
  const [glitchActive, setGlitchActive] = useState(false)
  const heroRef = useRef<HTMLDivElement>(null)
  const { scrollY } = useScroll()
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0])
  const heroY = useTransform(scrollY, [0, 400], [0, -100])

  useEffect(() => {
    const rankInterval = setInterval(() => {
      setCurrentRank(prev => (prev + 1) % RANK_KEYS.length)
    }, 2000)
    const glitchInterval = setInterval(() => {
      setGlitchActive(true)
      setTimeout(() => setGlitchActive(false), 150)
    }, 6000)
    return () => { clearInterval(rankInterval); clearInterval(glitchInterval) }
  }, [])

  const rank = RANKS[RANK_KEYS[currentRank]]

  const features = [
    {
      icon: Flame, title: 'Drop Rumors', color: '#f97316',
      desc: 'Post anonymous city secrets. Let the streets decide what\'s real.',
    },
    {
      icon: Eye, title: 'Bust Myths', color: '#06b6d4',
      desc: 'Investigate. Present evidence. Flip the narrative or confirm the chaos.',
    },
    {
      icon: Trophy, title: 'Win Challenges', color: '#a855f7',
      desc: 'Compete in city challenges. Put your money where your mouth is.',
    },
    {
      icon: Crown, title: 'Claim Your Rank', color: '#fbbf24',
      desc: 'Rise from Ghost in the City to the one true King of Good Times.',
    },
  ]

  const stats = [
    { label: 'City Players', value: '10K+', icon: Users },
    { label: 'Rumors Dropped', value: '50K+', icon: Flame },
    { label: 'Challenges Won', value: '₹5L+', icon: Trophy },
    { label: 'Myths Busted', value: '8K+', icon: Star },
  ]

  return (
    <div className="min-h-screen bg-[#030303] overflow-hidden">
      {/* Animated grid background */}
      <div className="fixed inset-0 grid-bg opacity-60 pointer-events-none" />

      {/* Moving scanline */}
      <motion.div
        className="fixed inset-x-0 h-px bg-gradient-to-r from-transparent via-yellow-400/15 to-transparent pointer-events-none z-10"
        animate={{ y: ['-100vh', '100vh'] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
      />

      {/* Radial glow */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(251,191,36,0.06),transparent)] pointer-events-none" />

      {/* Nav */}
      <nav className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 h-14">
        <div className="flex items-center gap-2">
          <div className="relative w-8 h-8">
            <Image src="/logo.png" alt="KGT" fill className="object-contain crown-animate" />
          </div>
          <span className="font-display text-xl tracking-wider text-gradient-gold" style={{ fontFamily: "'Bebas Neue', cursive" }}>
            KING OF GOOD TIMES
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login">
            <button className="btn-ghost px-4 py-2 rounded-xl text-xs font-mono">Sign In</button>
          </Link>
          <Link href="/signup">
            <motion.button
              className="btn-primary px-5 py-2 rounded-xl text-xs flex items-center gap-1.5"
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            >
              JOIN THE CITY <ArrowRight className="w-3.5 h-3.5" />
            </motion.button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <motion.section
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center pt-14"
        style={{ opacity: heroOpacity, y: heroY }}
      >
        <div className="text-center px-6 max-w-5xl mx-auto">
          {/* Floating rank badge */}
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-white/10 mb-8"
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          >
            <AnimatePresence mode="wait">
              <motion.span key={currentRank} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}>
                <span className="font-tech text-xs tracking-wider" style={{ color: rank.color }}>
                  {rank.emoji} {rank.label}
                </span>
              </motion.span>
            </AnimatePresence>
          </motion.div>

          {/* Main heading */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1
              className="font-display leading-none mb-4"
              style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 'clamp(4rem, 12vw, 10rem)' }}
            >
              <motion.span
                className="block text-gradient-gold"
                animate={{ filter: glitchActive ? 'hue-rotate(30deg) brightness(1.5)' : 'none' }}
              >
                KING OF
              </motion.span>
              <span className="block text-white">GOOD TIMES</span>
            </h1>
          </motion.div>

          <motion.p
            className="font-mono text-lg text-zinc-400 max-w-2xl mx-auto mb-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
          >
            Post anonymous rumors. Bust myths. Enter challenges. Earn real money. Climb the city ranks.
          </motion.p>

          <motion.p
            className="font-tech text-xs text-zinc-600 tracking-[0.4em] uppercase mb-10"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
          >
            sandnco.lol — v2
          </motion.p>

          <motion.div
            className="flex items-center justify-center gap-4 flex-wrap"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
          >
            <Link href="/signup">
              <motion.button
                className="btn-primary px-8 py-4 rounded-2xl text-base flex items-center gap-2 glow-gold"
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
              >
                <Crown className="w-5 h-5" />
                CLAIM YOUR THRONE
              </motion.button>
            </Link>
            <Link href="/login">
              <motion.button
                className="btn-ghost px-8 py-4 rounded-2xl text-base font-mono"
                whileHover={{ scale: 1.02 }}
              >
                Sign In →
              </motion.button>
            </Link>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-px h-12 bg-gradient-to-b from-yellow-400/40 to-transparent" />
          <span className="font-mono text-xs text-zinc-600">scroll</span>
        </motion.div>
      </motion.section>

      {/* Stats */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map(({ label, value, icon: Icon }, i) => (
            <motion.div
              key={label}
              className="glass rounded-2xl p-5 text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
            >
              <Icon className="w-5 h-5 text-yellow-400 mx-auto mb-2" />
              <p className="font-display text-3xl text-gradient-gold" style={{ fontFamily: "'Bebas Neue', cursive" }}>{value}</p>
              <p className="font-mono text-xs text-zinc-500 mt-1">{label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          >
            <h2 className="font-display text-5xl text-white mb-3" style={{ fontFamily: "'Bebas Neue', cursive" }}>
              THE CITY <span className="text-gradient-gold">AWAITS</span>
            </h2>
            <p className="font-mono text-zinc-500 text-sm">Four ways to rule the streets</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {features.map(({ icon: Icon, title, color, desc }, i) => (
              <motion.div
                key={title}
                className="card-dark p-7 group"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.01 }}
              >
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
                  style={{ background: `${color}15`, border: `1px solid ${color}30` }}
                >
                  <Icon className="w-6 h-6" style={{ color }} />
                </div>
                <h3 className="font-tech text-base font-bold text-white mb-2">{title}</h3>
                <p className="font-mono text-sm text-zinc-400 leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Rank showcase */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div className="text-center mb-10" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
            <h2 className="font-display text-5xl text-white mb-3" style={{ fontFamily: "'Bebas Neue', cursive" }}>
              10 RANKS TO <span className="text-gradient-gold">ROYALTY</span>
            </h2>
            <p className="font-mono text-zinc-500 text-sm">Every action earns XP. Every XP brings you closer to the crown.</p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {RANK_KEYS.map((key, i) => {
              const r = RANKS[key]
              return (
                <motion.div
                  key={key}
                  className={`p-4 rounded-xl text-center ${i === RANK_KEYS.length - 1 ? 'glass-gold' : 'glass'}`}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.06 }}
                  viewport={{ once: true }}
                >
                  <span className="text-3xl block mb-2">{r.emoji}</span>
                  <p className="font-tech text-xs font-bold" style={{ color: r.color }}>{r.label}</p>
                  <p className="font-mono text-xs text-zinc-600 mt-1">{r.xpRequired.toLocaleString()} XP</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <motion.div
          className="max-w-2xl mx-auto text-center glass-gold rounded-3xl p-12 relative overflow-hidden"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(251,191,36,0.08),transparent_70%)] pointer-events-none" />
          <div className="relative">
            <span className="text-5xl block mb-4 crown-animate">👑</span>
            <h2 className="font-display text-5xl text-gradient-gold mb-3" style={{ fontFamily: "'Bebas Neue', cursive" }}>
              READY TO RULE?
            </h2>
            <p className="font-mono text-zinc-400 text-sm mb-8">
              Join thousands of city players. Drop rumors, win challenges, and rise to the throne.
            </p>
            <Link href="/signup">
              <motion.button
                className="btn-primary px-10 py-4 rounded-2xl text-base"
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
              >
                JOIN THE CITY — FREE
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-6 border-t border-white/5">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="relative w-6 h-6">
              <Image src="/logo.png" alt="KGT" fill className="object-contain" />
            </div>
            <span className="font-mono text-xs text-zinc-500">sandnco.lol v2 · King of Good Times</span>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono text-zinc-600">
            <Link href="/legal/tos" className="hover:text-yellow-400 transition-colors">Terms</Link>
            <Link href="/legal/privacy" className="hover:text-yellow-400 transition-colors">Privacy</Link>
            <Link href="/support" className="hover:text-yellow-400 transition-colors">Support</Link>
            <a href="mailto:sandncolol@gmail.com" className="hover:text-yellow-400 transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
