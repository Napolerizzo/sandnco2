'use client'

import { useState, useEffect, lazy, Suspense, useCallback } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Flame, Trophy, ArrowRight,
  Zap, MapPin, Users, MessageSquare,
  BarChart2, Crown, LayoutDashboard,
  Shield, ChevronDown, ChevronRight,
  Check,
} from 'lucide-react'
import { RANKS } from '@/lib/ranks'
import { formatRelativeTime } from '@/lib/utils'

const HeroBackground = lazy(() => import('@/components/three/HeroBackground'))
const IntroAnimation = lazy(() => import('@/components/three/IntroAnimation'))

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

interface LandingPageProps {
  previewRumors: PreviewRumor[]
  userCount: number
  rumorCount: number
}

const TAGLINES = [
  'Anonymous rumors. Real consequences.',
  'The city never sleeps. Neither do secrets.',
  'Post. React. Rise. Rule.',
  'Where chaos meets reputation.',
  'Your anonymity. Your power.',
]

const HOW_IT_WORKS = [
  {
    icon: MessageSquare,
    title: 'Drop Rumors',
    description: 'Post anonymous rumors about your city. Tag locations, categories, and let the chaos unfold.',
    color: '#FF2D55',
  },
  {
    icon: Flame,
    title: 'Heat System',
    description: 'Every rumor gets a heat score. The spicier the truth, the higher it burns.',
    color: '#FFD700',
  },
  {
    icon: Trophy,
    title: 'Rank Up',
    description: '10 ranks from Ghost to King. Every action earns XP. Climb the hierarchy.',
    color: '#00E5FF',
  },
  {
    icon: Zap,
    title: 'Challenges',
    description: 'Create and join challenges. Dare others. Bet your reputation on chaos.',
    color: '#A855F7',
  },
]

const COMING_SOON = [
  { icon: MapPin, title: 'City Maps', description: 'See rumors pinned to real locations' },
  { icon: LayoutDashboard, title: 'Crew System', description: 'Form crews, wage rumor wars' },
  { icon: BarChart2, title: 'Analytics', description: 'Track your influence and reach' },
  { icon: Shield, title: 'Investigations', description: 'Deep-dive into rumor threads' },
]

const CATEGORY_COLORS: Record<string, string> = {
  drama: '#FF2D55',
  sighting: '#00E5FF',
  scandal: '#FFD700',
  general: '#A855F7',
  secret: '#F97316',
  tea: '#10B981',
}

export default function LandingPage({ previewRumors, userCount, rumorCount }: LandingPageProps) {
  const [mounted, setMounted] = useState(false)
  const [taglineIdx, setTaglineIdx] = useState(0)
  const [showIntro, setShowIntro] = useState(false)

  useEffect(() => {
    setMounted(true)
    if (typeof window !== 'undefined' && !sessionStorage.getItem('intro-seen')) {
      setShowIntro(true)
    }
  }, [])

  useEffect(() => {
    const t = setInterval(() => setTaglineIdx(i => (i + 1) % TAGLINES.length), 3000)
    return () => clearInterval(t)
  }, [])

  const handleIntroComplete = useCallback(() => {
    setShowIntro(false)
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('intro-seen', '1')
    }
  }, [])

  return (
    <div className="min-h-screen bg-[#050505] text-white overflow-x-hidden">
      {/* Intro Animation Overlay */}
      {mounted && showIntro && (
        <Suspense fallback={null}>
          <IntroAnimation onComplete={handleIntroComplete} />
        </Suspense>
      )}

      {/* Animated Canvas Background */}
      {mounted && (
        <Suspense fallback={null}>
          <HeroBackground />
        </Suspense>
      )}

      {/* Page Content - Scrollable over 3D */}
      <div className="relative z-10">
        {/* Navbar */}
        <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-[#050505]/60 border-b border-white/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <span className="font-display text-xl font-bold text-gradient">SANDNCO</span>
            </Link>
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="px-4 py-2 text-sm font-medium text-white/70 hover:text-white transition-colors"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className="px-4 py-2 text-sm font-bold rounded-lg bg-gradient-to-r from-[#FF2D55] to-[#FF6B8A] hover:from-[#FF4D7A] hover:to-[#FF8DA6] transition-all shadow-lg shadow-[#FF2D55]/20"
              >
                Join the Chaos
              </Link>
            </div>
          </div>
        </nav>

        {/* ════════════════════ HERO SECTION ════════════════════ */}
        <section className="relative min-h-screen flex flex-col items-center justify-center px-4 pt-16">
          {/* Beta Badge */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-6"
          >
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold tracking-widest bg-[#FF2D55]/10 text-[#FF2D55] border border-[#FF2D55]/20">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF2D55] animate-pulse" />
              BETA
            </span>
          </motion.div>

          {/* Main Title with Glitch */}
          <motion.h1
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.7, type: 'spring', stiffness: 100 }}
            className="glitch-text text-gradient font-display font-extrabold text-center leading-none mb-4"
            data-text="SANDNCO"
            style={{ fontSize: 'clamp(70px, 14vw, 180px)' }}
          >
            SANDNCO
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="font-mono text-xs sm:text-sm tracking-[0.3em] text-white/40 uppercase mb-8"
          >
            The City&apos;s Underground
          </motion.p>

          {/* Rotating Taglines */}
          <div className="h-8 mb-10 overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.p
                key={taglineIdx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="text-center text-white/60 text-base sm:text-lg font-light"
              >
                {TAGLINES[taglineIdx]}
              </motion.p>
            </AnimatePresence>
          </div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
            className="flex flex-col sm:flex-row items-center gap-4 mb-12"
          >
            <Link
              href="/signup"
              className="group relative px-8 py-3.5 rounded-xl font-bold text-base bg-gradient-to-r from-[#FF2D55] to-[#FFD700] shadow-lg shadow-[#FF2D55]/30 hover:shadow-[#FF2D55]/50 transition-all duration-300 hover:scale-105"
            >
              <span className="relative z-10 flex items-center gap-2">
                Enter the Chaos
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#FF2D55] to-[#FFD700] opacity-0 group-hover:opacity-100 blur-xl transition-opacity" />
            </Link>
            <a
              href="#how-it-works"
              className="px-6 py-3 rounded-xl font-medium text-sm border border-white/10 text-white/60 hover:text-white hover:border-white/30 transition-all"
            >
              How it works
            </a>
          </motion.div>

          {/* Stats Row */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="flex flex-wrap justify-center gap-8 sm:gap-12 mb-16"
          >
            {[
              { label: 'Users', value: userCount, icon: Users },
              { label: 'Rumors', value: rumorCount, icon: Flame },
              { label: 'Ranks', value: 10, icon: Crown },
              { label: 'Cost', value: 'Free', icon: Zap },
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col items-center gap-1">
                <stat.icon className="w-4 h-4 text-[#FF2D55] mb-1" />
                <span className="font-mono text-xl font-bold text-white">
                  {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
                </span>
                <span className="text-xs text-white/40 uppercase tracking-wider">{stat.label}</span>
              </div>
            ))}
          </motion.div>

          {/* Scroll Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2"
          >
            <ChevronDown className="w-6 h-6 text-white/20 animate-bounce" />
          </motion.div>
        </section>

        {/* ════════════════════ HOW IT WORKS ════════════════════ */}
        <section id="how-it-works" className="relative bg-[#050505] py-24 sm:py-32 px-4">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              className="text-center mb-16"
            >
              <span className="font-mono text-xs tracking-[0.2em] text-[#FF2D55] uppercase">The Game</span>
              <h2 className="font-display text-4xl sm:text-5xl font-extrabold mt-3 mb-4">
                Four ways to play
              </h2>
              <p className="text-white/40 max-w-md mx-auto">
                Every interaction shapes the city. Every rumor shifts the balance.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {HOW_IT_WORKS.map((item, i) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="group p-6 sm:p-8 rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-sm hover:bg-white/[0.04] hover:border-white/10 transition-all duration-300"
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                    style={{ backgroundColor: `${item.color}15` }}
                  >
                    <item.icon className="w-6 h-6" style={{ color: item.color }} />
                  </div>
                  <h3 className="font-display text-xl font-bold mb-2">{item.title}</h3>
                  <p className="text-white/50 text-sm leading-relaxed">{item.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ════════════════════ RANKS ════════════════════ */}
        <section className="relative bg-[#050505] py-24 sm:py-32 px-4">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              className="text-center mb-16"
            >
              <span className="font-mono text-xs tracking-[0.2em] text-[#FF2D55] uppercase">The Hierarchy</span>
              <h2 className="font-display text-4xl sm:text-5xl font-extrabold mt-3 mb-4">
                10 Ranks. One Throne.
              </h2>
              <p className="text-white/40 max-w-md mx-auto">
                Every action earns XP. Every rank unlocks new power.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {RANK_KEYS.map((key, i) => {
                const rank = RANKS[key]
                const isKing = key === 'king_of_good_times'
                return (
                  <motion.div
                    key={key}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.06 }}
                    className={`relative p-5 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all duration-300 ${isKing ? 'sm:col-span-2' : ''}`}
                    style={{ boxShadow: `0 0 20px ${rank.glowColor.replace('0.4', '0.08').replace('0.5', '0.08').replace('0.6', '0.08')}` }}
                  >
                    <div className="flex items-start gap-4">
                      <span className="text-4xl flex-shrink-0">{rank.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-display text-lg font-bold" style={{ color: rank.color }}>
                            {rank.label}
                          </h3>
                          {isKing && <Crown className="w-4 h-4 text-[#FFD700]" />}
                        </div>
                        <p className="font-mono text-xs text-white/30 mb-1">
                          {rank.xpRequired === 0 ? 'Starting rank' : `${rank.xpRequired.toLocaleString()} XP`}
                        </p>
                        <p className="text-sm text-white/50 mb-2">{rank.description}</p>
                        <div className="flex flex-wrap gap-1.5">
                          {rank.perks.map((perk) => (
                            <span
                              key={perk}
                              className="px-2 py-0.5 text-[10px] font-mono rounded-full"
                              style={{
                                backgroundColor: `${rank.color}15`,
                                color: `${rank.color}CC`,
                              }}
                            >
                              {perk}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </section>

        {/* ════════════════════ LIVE FEED ════════════════════ */}
        {previewRumors.length > 0 && (
          <section className="relative bg-[#050505] py-24 sm:py-32 px-4">
            <div className="max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                className="text-center mb-16"
              >
                <span className="font-mono text-xs tracking-[0.2em] text-[#FF2D55] uppercase">Live Feed</span>
                <h2 className="font-display text-4xl sm:text-5xl font-extrabold mt-3 mb-4">
                  What&apos;s Burning
                </h2>
              </motion.div>

              <div className="space-y-3">
                {previewRumors.map((rumor, i) => (
                  <motion.div
                    key={rumor.id}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="p-5 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all group"
                  >
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <h3 className="font-display font-bold text-lg text-white/90 group-hover:text-white transition-colors">
                        {rumor.title}
                      </h3>
                      <span
                        className="flex-shrink-0 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase"
                        style={{
                          backgroundColor: `${CATEGORY_COLORS[rumor.category] || '#666'}20`,
                          color: CATEGORY_COLORS[rumor.category] || '#999',
                        }}
                      >
                        {rumor.category}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-xs text-white/30">
                        <span className="font-mono">{rumor.anonymous_alias}</span>
                        <span>{formatRelativeTime(rumor.created_at)}</span>
                      </div>
                      {/* Heat bar */}
                      <div className="flex items-center gap-2">
                        <Flame className="w-3 h-3 text-[#FF2D55]" />
                        <div className="w-20 h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-[#FF2D55] to-[#FFD700]"
                            style={{ width: `${Math.min(100, rumor.heat_score)}%` }}
                          />
                        </div>
                        <span className="font-mono text-[10px] text-white/40">{rumor.heat_score}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="text-center mt-8">
                <Link
                  href="/feed"
                  className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-[#FF2D55] transition-colors font-mono"
                >
                  See all rumors <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* ════════════════════ MEMBERSHIP ════════════════════ */}
        <section className="relative bg-[#050505] py-24 sm:py-32 px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              className="text-center mb-16"
            >
              <span className="font-mono text-xs tracking-[0.2em] text-[#FF2D55] uppercase">Membership</span>
              <h2 className="font-display text-4xl sm:text-5xl font-extrabold mt-3 mb-4">
                Choose Your Path
              </h2>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {/* Free Tier */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="p-6 sm:p-8 rounded-2xl border border-white/5 bg-white/[0.02]"
              >
                <h3 className="font-display text-2xl font-bold mb-1">Free</h3>
                <p className="text-white/40 text-sm mb-6">Start your journey</p>
                <div className="text-4xl font-display font-extrabold mb-6">
                  $0<span className="text-lg text-white/30 font-normal">/forever</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {['Post rumors', 'Join challenges', 'Earn XP & rank up', 'Basic profile'].map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm text-white/60">
                      <Check className="w-4 h-4 text-[#00E5FF]" /> {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/signup"
                  className="block w-full text-center py-3 rounded-xl border border-white/10 text-white/60 hover:text-white hover:border-white/30 transition-all font-medium"
                >
                  Get Started
                </Link>
              </motion.div>

              {/* Premium Tier */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="relative p-6 sm:p-8 rounded-2xl border border-[#FF2D55]/30 bg-[#FF2D55]/[0.03]"
                style={{ boxShadow: '0 0 40px rgba(255,45,85,0.1)' }}
              >
                <div className="absolute -top-3 left-6">
                  <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold tracking-widest bg-[#FF2D55] text-white">
                    POPULAR
                  </span>
                </div>
                <h3 className="font-display text-2xl font-bold mb-1">Premium</h3>
                <p className="text-white/40 text-sm mb-6">Maximum chaos</p>
                <div className="text-4xl font-display font-extrabold mb-6">
                  $4.99<span className="text-lg text-white/30 font-normal">/month</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {['Everything in Free', 'Anonymous posting', 'Custom avatar styles', 'Priority feed placement', 'Exclusive challenges', 'Premium badge'].map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm text-white/60">
                      <Check className="w-4 h-4 text-[#FF2D55]" /> {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/signup"
                  className="block w-full text-center py-3 rounded-xl bg-gradient-to-r from-[#FF2D55] to-[#FF6B8A] font-bold hover:shadow-lg hover:shadow-[#FF2D55]/30 transition-all"
                >
                  Go Premium
                </Link>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ════════════════════ COMING SOON ════════════════════ */}
        <section className="relative bg-[#050505] py-24 sm:py-32 px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              className="text-center mb-16"
            >
              <span className="font-mono text-xs tracking-[0.2em] text-[#FF2D55] uppercase">Roadmap</span>
              <h2 className="font-display text-4xl sm:text-5xl font-extrabold mt-3 mb-4">
                What&apos;s Next
              </h2>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {COMING_SOON.map((item, i) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="p-5 rounded-xl border border-white/5 bg-white/[0.02] opacity-70"
                >
                  <item.icon className="w-5 h-5 text-white/30 mb-3" />
                  <h3 className="font-display font-bold mb-1">{item.title}</h3>
                  <p className="text-sm text-white/40">{item.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ════════════════════ FINAL CTA ════════════════════ */}
        <section className="relative bg-[#050505] py-32 sm:py-40 px-4">
          <div className="max-w-2xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
            >
              <h2 className="font-display text-5xl sm:text-6xl font-extrabold mb-6 text-gradient">
                Ready to Play?
              </h2>
              <p className="text-white/40 text-lg mb-10">
                The city is already talking. The only question is — will you be part of it?
              </p>
              <Link
                href="/signup"
                className="group relative inline-flex items-center gap-3 px-10 py-4 rounded-xl font-bold text-lg bg-gradient-to-r from-[#FF2D55] to-[#FFD700] shadow-2xl shadow-[#FF2D55]/30 hover:shadow-[#FF2D55]/50 transition-all duration-300 hover:scale-105"
              >
                Enter the Chaos
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#FF2D55] to-[#FFD700] opacity-0 group-hover:opacity-100 blur-2xl transition-opacity -z-10" />
              </Link>
            </motion.div>
          </div>
        </section>

        {/* ════════════════════ FOOTER ════════════════════ */}
        <footer className="relative bg-[#050505] border-t border-white/5 py-12 px-4">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="font-display font-bold text-gradient">SANDNCO</span>
              <span className="text-xs text-white/20">Beta</span>
            </div>
            <div className="flex items-center gap-6 text-xs text-white/30">
              <Link href="/legal/terms" className="hover:text-white/60 transition-colors">Terms</Link>
              <Link href="/legal/privacy" className="hover:text-white/60 transition-colors">Privacy</Link>
              <Link href="/support" className="hover:text-white/60 transition-colors">Support</Link>
            </div>
            <p className="text-xs text-white/20">
              &copy; {new Date().getFullYear()} SANDNCO. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </div>
  )
}
