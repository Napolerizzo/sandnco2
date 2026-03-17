'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence, useTransform, useSpring, useMotionValue } from 'framer-motion'
import {
  Flame, Trophy, Eye, ArrowRight, TrendingUp,
  Zap, MapPin, Users, MessageSquare, ShieldAlert,
  BarChart2, Lock, Crown, LayoutDashboard, Crosshair,
  Shield, Star, Sparkles, ChevronRight, Activity, 
  Terminal, Radar, Database, Network, Cpu, Layers, ShieldCheck, ArrowUpRight
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

// ============================================================================
// THE SAAS B2C CATALOG (RUMOR MILL EDITION)
// ============================================================================
const TAGLINES = [
  'Drop rumors. Bust myths. Win capital.',
  'Anonymous by design. Weaponized by nature.',
  'The city talks. We keep the ledger.',
  'From Ghost to King — dominate the grid.',
]

const CATEGORY_COLORS: Record<string, string> = {
  drama: '#EF4444', politics: '#F59E0B', music: '#A855F7',
  sports: '#22C55E', tech: '#3B82F6', romance: '#EC4899',
  crime: '#F97316', lifestyle: '#6366F1', general: '#6B7280',
}

// ============================================================================
// MICRO-INTERACTIONS
// ============================================================================
const HackerText = ({ text, trigger = true }: { text: string, trigger?: boolean }) => {
  const [displayText, setDisplayText] = useState(text);
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*";
  
  useEffect(() => {
    if (!trigger) return;
    let iteration = 0;
    const interval = setInterval(() => {
      setDisplayText(text.split("").map((letter, index) => {
        if (index < iteration) return text[index];
        return letters[Math.floor(Math.random() * 26)];
      }).join(""));
      if (iteration >= text.length) clearInterval(interval);
      iteration += 1 / 3;
    }, 30);
    return () => clearInterval(interval);
  }, [text, trigger]);

  return <span className="font-mono tracking-tighter">{displayText}</span>;
};

const NoiseOverlay = () => <div className="fixed inset-0 pointer-events-none z-[5] opacity-[0.06] mix-blend-screen hw-accel bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />;

const CyberGrid = () => (
  <div className="fixed inset-0 pointer-events-none z-0 hw-accel opacity-20 [mask-image:radial-gradient(ellipse_at_center,white_10%,transparent_80%)]">
    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px] [transform:perspective(1000px)_rotateX(60deg)] animate-grid-move-3d" />
  </div>
);

const AuroraGlow = ({ color, top, left, delay = "0s" }: { color: string, top: string, left: string, delay?: string }) => (
  <div 
    className={`absolute ${top} ${left} w-[40vw] h-[40vw] rounded-full blur-[120px] pointer-events-none hw-accel mix-blend-screen opacity-30 animate-blob-float`}
    style={{ backgroundColor: color, animationDelay: delay }} 
  />
);

// ============================================================================
// MAIN PAGE ENGINE
// ============================================================================
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
  const [booting, setBooting] = useState(true)
  const [mounted, setMounted] = useState(false)

  // Mouse Parallax Engine - ALL HOOKS DECLARED UP TOP
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springConfig = { damping: 25, stiffness: 200 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);
  
  const cursorX = useTransform(smoothX, [-0.5, 0.5], ["0vw", "100vw"]);
  const cursorY = useTransform(smoothY, [-0.5, 0.5], ["0vh", "100vh"]);
  const cardRotateX = useTransform(smoothY, [-0.5, 0.5], [2, -2]);
  const cardRotateY = useTransform(smoothX, [-0.5, 0.5], [-2, 2]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    mouseX.set((e.clientX / window.innerWidth) - 0.5);
    mouseY.set((e.clientY / window.innerHeight) - 0.5);
  }, [mouseX, mouseY]);

  useEffect(() => {
    setMounted(true)
    const t = setInterval(() => setTaglineIdx(i => (i + 1) % TAGLINES.length), 3000)
    
    // Boot sequence logic
    if (sessionStorage.getItem('sandnco_v2_booted')) {
      setBooting(false);
    } else {
      sessionStorage.setItem('sandnco_v2_booted', 'true');
      const timer = setTimeout(() => setBooting(false), 2200);
      return () => {
        clearInterval(t);
        clearTimeout(timer);
      }
    }
    return () => clearInterval(t)
  }, [])

  // Early return comes AFTER all hooks are declared
  if (!mounted) return null;

  return (
    <div onMouseMove={handleMouseMove} className="min-h-screen bg-[#020202] text-white font-sans selection:bg-pink-600 selection:text-white relative hw-main overflow-x-hidden">
      
      <NoiseOverlay />
      <CyberGrid />
      
      {/* Dynamic Cursor Light */}
      <motion.div 
        className="pointer-events-none fixed top-0 left-0 w-[400px] h-[400px] bg-white/5 rounded-full blur-[100px] z-0 mix-blend-screen hidden md:block"
        style={{ x: cursorX, y: cursorY, translateX: "-50%", translateY: "-50%" }}
      />

      {/* --- TERMINAL LOADER OVERLAY --- */}
      <AnimatePresence>
        {booting && (
          <motion.div 
            initial={{ opacity: 1 }} exit={{ opacity: 0, scale: 1.05 }} transition={{ duration: 0.6, ease: "easeInOut" }}
            className="fixed inset-0 bg-[#020202] z-[9999] flex flex-col items-start justify-end p-8 font-mono text-xs text-pink-500 uppercase tracking-widest hw-layer"
          >
            <div className="space-y-1 mb-4 opacity-70">
              <p>{`> INIT_SANDNCO_V2.0 // FARIDABAD NODE`}</p>
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>{`> INTERCEPTING CITY COMMS... OK`}</motion.p>
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.0 }}>{`> INJECTING GAMIFICATION_PROTOCOLS.SH... OK`}</motion.p>
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}>{`> RENDERING GRID...`}</motion.p>
            </div>
            <div className="w-full h-1 bg-gray-900 overflow-hidden">
              <motion.div initial={{ width: "0%" }} animate={{ width: "100%" }} transition={{ duration: 2, ease: "linear" }} className="h-full bg-pink-500" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- ENTERPRISE NAVBAR --- */}
      <nav className="fixed top-0 w-full z-50 px-6 py-4 flex justify-between items-center bg-[#020202]/70 backdrop-blur-2xl border-b border-white/5 hw-layer">
        <Link href="/" className="flex items-center gap-3 hw-accel group text-decoration-none">
          <div className="w-8 h-8 bg-white text-black flex items-center justify-center rounded font-black text-lg group-hover:scale-90 transition-transform">S</div>
          <span className="font-black text-xl tracking-tighter hidden md:block text-white">SANDNCO.</span>
        </Link>
        <div className="flex items-center gap-3 md:gap-6 hw-accel">
          {!authLoading && user ? (
            <Link href="/feed">
              <button className="bg-white text-black px-5 py-2 rounded-full font-bold text-[10px] md:text-xs tracking-widest hover:bg-gray-200 transition-colors uppercase flex items-center gap-2">
                <Terminal className="w-3 h-3" /> CONSOLE
              </button>
            </Link>
          ) : !authLoading ? (
            <>
              <Link href="/login">
                <button className="hidden md:block text-gray-400 hover:text-white px-4 py-2 font-bold text-xs tracking-widest uppercase transition-colors">
                  Authenticate
                </button>
              </Link>
              <Link href="/signup">
                <button className="bg-white text-black px-6 py-2 rounded-full font-bold text-[10px] md:text-xs tracking-widest hover:bg-gray-200 active:scale-95 transition-transform uppercase">
                  Join Grid
                </button>
              </Link>
            </>
          ) : null}
        </div>
      </nav>

      <main className="relative z-10">
        {/* --- HERO SECTION --- */}
        <section className="relative min-h-[100dvh] flex flex-col justify-center items-center pt-24 px-6 overflow-hidden">
          <AuroraGlow color="#db2777" top="-top-[10%]" left="-left-[10%]" />
          <AuroraGlow color="#4f46e5" top="top-[30%]" left="right-[0%]" delay="2s" />

          <div className="text-center max-w-[1200px] w-full flex flex-col items-center relative z-20 mt-10">
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: mounted && !booting ? 1 : 0, y: mounted && !booting ? 0 : 20 }} transition={{ duration: 0.5, delay: 0.2 }} 
              className="inline-flex items-center gap-3 px-4 py-1.5 bg-white/5 border border-white/10 rounded-full mb-8 backdrop-blur-xl"
            >
               <Activity className="w-3 h-3 text-pink-500 animate-pulse" />
               <span className="text-[10px] font-mono tracking-widest text-gray-300 uppercase">SYS_V2.0 // FARIDABAD NODE ONLINE</span>
            </motion.div>

            <h1 className="text-[12vw] md:text-[8vw] leading-[0.85] font-black tracking-tighter mb-8">
               <span className="block text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-500">
                 <HackerText text="FARIDABAD INTEL," trigger={!booting} />
               </span>
               <span className="block mt-1 text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500">
                 <HackerText text="WEAPONIZED." trigger={!booting} />
               </span>
            </h1>

            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: mounted && !booting ? 1 : 0 }} transition={{ delay: 0.8 }} 
              className="h-8 mb-10 overflow-hidden"
            >
              <AnimatePresence mode="wait">
                <motion.p
                  key={taglineIdx}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }}
                  className="text-sm md:text-xl font-medium text-gray-400 max-w-2xl leading-relaxed uppercase tracking-widest"
                >
                  {TAGLINES[taglineIdx]}
                </motion.p>
              </AnimatePresence>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: mounted && !booting ? 1 : 0, y: mounted && !booting ? 0 : 20 }} transition={{ delay: 1 }} className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto px-4 z-20 mb-16">
              <Link href={user ? '/feed' : '/signup'} className="w-full sm:w-auto">
                  <button className="w-full sm:w-auto px-10 py-5 bg-white text-black font-black text-xs md:text-sm uppercase tracking-[0.2em] rounded-2xl active:scale-95 transition-all flex items-center justify-center gap-3 hover:shadow-[0_0_40px_rgba(255,255,255,0.3)] border border-transparent">
                    <Database className="w-4 h-4" /> {user ? 'ACCESS CONSOLE' : 'INITIALIZE PROTOCOL'}
                  </button>
              </Link>
            </motion.div>

            {/* Preview cards inline hero */}
            {previewRumors.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: mounted && !booting ? 1 : 0, y: mounted && !booting ? 0 : 20 }} transition={{ delay: 1.2 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-4xl mx-auto"
              >
                {previewRumors.slice(0, 3).map((rumor, i) => (
                  <MiniTerminalCard key={rumor.id} rumor={rumor} index={i} />
                ))}
              </motion.div>
            )}
          </div>
        </section>

        {/* --- SAAS METRICS STRIP --- */}
        <section className="border-y border-white/5 bg-[#050505]/40 backdrop-blur-2xl py-8 relative z-20">
          <div className="max-w-[1400px] mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-white/5">
            {[
              { label: "Active Operatives", value: userCount || '0', trend: "GROWING" },
              { label: "Intel Packets", value: rumorCount || '0', trend: "LIVE" },
              { label: "Authority Ranks", value: "10", trend: "SYSTEM" },
              { label: "Entry Cost", value: "₹0", trend: "OPEN" }
            ].map((metric, i) => (
              <div key={i} className="text-center px-4 flex flex-col items-center group">
                <div className="flex items-center gap-2 mb-2">
                   <div className="text-3xl md:text-4xl font-black text-white tracking-tighter group-hover:text-pink-500 transition-colors">{metric.value}</div>
                   <span className="text-[10px] font-mono text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded">{metric.trend}</span>
                </div>
                <div className="text-[9px] md:text-[10px] text-gray-500 uppercase tracking-[0.2em] font-bold">{metric.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* --- THE BENTO BOX ARCHITECTURE (HOW IT WORKS) --- */}
        <section id="architecture" className="px-4 md:px-10 lg:px-16 py-24 md:py-32 max-w-[1600px] mx-auto relative z-20">
          <div className="mb-16 md:mb-24 flex flex-col md:flex-row justify-between items-end gap-6">
            <div>
              <h2 className="text-4xl md:text-6xl font-black uppercase text-white tracking-tighter mb-4">System <span className="text-gray-600">Modules.</span></h2>
              <p className="text-sm md:text-base text-gray-500 font-medium max-w-xl">A proprietary suite of deterministic social APIs. Four ways to control the narrative.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {[
              { icon: Flame, title: 'Data Injection', badge: 'RUMORS', color: 'text-rose-500', bg: 'hover:bg-rose-500/10', border: 'border-rose-500/30', desc: 'Post anonymous intelligence. Nobody traces the IP. The city reacts.' },
              { icon: ShieldAlert, title: 'Myth Busting', badge: 'VERDICT', color: 'text-blue-500', bg: 'hover:bg-blue-500/10', border: 'border-blue-500/30', desc: 'Investigate raw packets. Classify as True, False, or Misleading.' },
              { icon: Crosshair, title: 'Bounty Hunts', badge: 'CHALLENGES', color: 'text-purple-500', bg: 'hover:bg-purple-500/10', border: 'border-purple-500/30', desc: 'Execute real-world social challenges. Extract capital rewards.' },
              { icon: Crown, title: 'Ascension', badge: 'RANKS', color: 'text-amber-500', bg: 'hover:bg-amber-500/10', border: 'border-amber-500/30', desc: 'Grind XP. Climb from Ghost to King. Impose your digital authority.' },
            ].map((mod, i) => (
              <motion.div 
                key={mod.title}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} viewport={{ once: true }}
                className={`bg-[#0a0a0c] border border-white/5 rounded-[2.5rem] p-8 flex flex-col relative overflow-hidden group hw-accel hover:border-white/10 transition-colors h-[300px]`}
              >
                 <div className={`absolute inset-0 bg-gradient-to-br from-transparent to-${mod.color.split('-')[1]}-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`} />
                 <div className="relative z-10 flex flex-col h-full">
                    <div className="flex justify-between items-start mb-6">
                      <div className={`p-4 bg-white/5 rounded-2xl border border-white/10 ${mod.color} group-hover:scale-110 transition-transform duration-300`}><mod.icon className="w-6 h-6" /></div>
                      <span className={`text-[8px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full border ${mod.border} ${mod.color} bg-[#020202]`}>{mod.badge}</span>
                    </div>
                    <h3 className="text-xl md:text-2xl font-black uppercase tracking-tight text-white mb-3">{mod.title}</h3>
                    <p className="text-xs text-gray-400 leading-relaxed font-medium">{mod.desc}</p>
                 </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* --- LIVE INTEL FEED (LARGE BENTO) --- */}
        {previewRumors.length > 0 && (
          <section className="px-4 md:px-10 lg:px-16 pb-24 max-w-[1600px] mx-auto relative z-20">
            <motion.div 
              style={{ rotateX: cardRotateX, rotateY: cardRotateY }}
              className="bg-[#0a0a0c] border border-white/5 rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden group hw-accel w-full"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-pink-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10 flex flex-col h-full">
                <div className="flex justify-between items-center mb-10 flex-wrap gap-4">
                  <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-pink-500/10 border border-pink-500/20 text-pink-400 text-[10px] font-black tracking-widest uppercase mb-4 rounded-full w-fit"><Radar className="w-3 h-3" /> LIVE INTERCEPTS</div>
                    <h3 className="text-4xl md:text-5xl font-black uppercase text-white tracking-tighter">The Global <br/><span className="text-pink-500 italic">Ledger.</span></h3>
                  </div>
                  <Link href="/signup">
                    <button className="bg-white/5 border border-white/10 text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-white hover:text-black transition-all flex items-center gap-2">
                      Access Full Feed <ArrowUpRight className="w-4 h-4" />
                    </button>
                  </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {previewRumors.map((rumor, i) => (
                    <RumorTerminalCard key={rumor.id} rumor={rumor} index={i} />
                  ))}
                  <div className="border border-dashed border-white/20 rounded-2xl p-6 flex flex-col items-center justify-center min-h-[160px] bg-white/[0.02]">
                    <Lock className="w-6 h-6 text-gray-500 mb-3" />
                    <p className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-4 text-center">Encrypted Packets<br/>Authentication Required</p>
                    <Link href="/signup">
                      <button className="bg-pink-600 text-white px-5 py-2 rounded-lg font-bold text-[10px] uppercase tracking-widest hover:bg-pink-500 transition-colors">Decrypt</button>
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          </section>
        )}

        {/* --- AUTHORITY RANKS --- */}
        <section className="px-4 md:px-10 lg:px-16 pb-24 max-w-[1600px] mx-auto relative z-20">
          <div className="text-center mb-12">
             <h2 className="text-3xl md:text-4xl font-black uppercase text-white tracking-tighter mb-4">Security <span className="text-gray-600">Clearances.</span></h2>
             <p className="text-sm text-gray-500 font-medium">10 tiers of network authority. Farm XP. Seize control.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
             {RANK_KEYS.map((key, i) => {
               const r = RANKS[key]
               const isKing = i === RANK_KEYS.length - 1
               return (
                 <motion.div
                   key={key}
                   initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }} viewport={{ once: true }}
                   className={`p-6 text-center rounded-2xl border ${isKing ? 'bg-amber-500/10 border-amber-500/30' : 'bg-[#0a0a0c] border-white/5'} flex flex-col items-center`}
                 >
                   <span className="text-3xl block mb-4 filter drop-shadow-md">{r.emoji}</span>
                   <p className="text-xs font-black uppercase tracking-widest mb-1" style={{ color: r.color }}>{r.label}</p>
                   <p className="text-[10px] text-gray-500 font-mono">{r.xpRequired.toLocaleString()} XP</p>
                 </motion.div>
               )
             })}
          </div>
        </section>

        {/* --- MEMBERSHIP (B2C GAMIFIED) --- */}
        <section className="px-4 md:px-10 lg:px-16 pb-32 max-w-[1200px] mx-auto relative z-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black uppercase text-white tracking-tighter mb-4">License <span className="text-gray-600">Tiers.</span></h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Free */}
            <div className="bg-[#0a0a0c] border border-white/10 rounded-[2rem] p-8 md:p-12">
              <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-6">Civilian Access</p>
              <p className="text-5xl font-black tracking-tighter text-white mb-2">₹0</p>
              <p className="text-sm text-gray-400 font-medium mb-8 pb-8 border-b border-white/5">Open network privileges.</p>
              <ul className="space-y-4 mb-10">
                {['Inject anonymous data', 'Vote & execute verdicts', 'Accept public bounties', 'Basic XP farming'].map(item => (
                  <li key={item} className="flex items-center gap-3 text-sm text-gray-300 font-medium">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" /> {item}
                  </li>
                ))}
              </ul>
              <Link href="/signup">
                <button className="w-full py-4 bg-white/5 border border-white/10 text-white font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-white/10 transition-colors">Authorize Standard</button>
              </Link>
            </div>

            {/* Premium */}
            <div className="bg-[#0a0a0c] border border-pink-500/30 rounded-[2rem] p-8 md:p-12 relative overflow-hidden shadow-[0_0_50px_rgba(219,39,119,0.05)]">
              <div className="absolute top-0 right-8 bg-pink-600 text-white text-[9px] font-black uppercase tracking-widest px-4 py-1.5 rounded-b-lg">Syndicate</div>
              <p className="text-xs font-black text-pink-500 uppercase tracking-widest mb-6">God-Mode Access</p>
              <div className="flex items-baseline gap-2 mb-2">
                <p className="text-5xl font-black tracking-tighter text-white">₹89</p>
                <span className="text-sm text-gray-500 font-bold uppercase">/mo</span>
              </div>
              <p className="text-sm text-gray-400 font-medium mb-8 pb-8 border-b border-white/5">Unrestricted reality distortion.</p>
              <ul className="space-y-4 mb-10">
                {[
                  'All Civilian privileges',
                  'Syndicate profile badge',
                  'Issue custom bounties',
                  'Publish network polls',
                  'Priority algorithm routing',
                ].map(item => (
                  <li key={item} className="flex items-center gap-3 text-sm text-gray-300 font-medium">
                    <Zap className="w-4 h-4 text-pink-500" /> {item}
                  </li>
                ))}
              </ul>
              <Link href="/signup">
                <button className="w-full py-4 bg-pink-600 text-white font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-pink-500 shadow-[0_0_20px_rgba(219,39,119,0.3)] transition-all">Authorize God-Mode (Beta ₹1)</button>
              </Link>
            </div>
          </div>
        </section>

        {/* --- STARTUP FOOTER --- */}
        <footer className="bg-[#000000] pt-24 pb-12 px-6 md:px-16 relative z-20 hw-layer border-t border-white/5">
          <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
             <div className="md:col-span-2">
               <Link href="/" className="flex items-center gap-3 mb-6">
                 <div className="w-8 h-8 bg-white text-black flex items-center justify-center rounded font-black text-lg">S</div>
                 <span className="font-black text-2xl tracking-tighter text-white">SANDNCO.</span>
               </Link>
               <p className="text-xs text-gray-500 font-medium leading-relaxed max-w-sm mb-6 uppercase tracking-wider">
                 Engineering serendipity through aggressive data manipulation. The deterministic social intelligence protocol.
               </p>
             </div>
             <div>
               <h4 className="text-white font-black uppercase tracking-widest text-xs mb-6">Infrastructure</h4>
               <ul className="space-y-4 text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-wider">
                 <li><Link href="/feed" className="hover:text-pink-400 transition-colors">The Grid</Link></li>
                 <li><Link href="/signup" className="hover:text-pink-400 transition-colors">Bounty Board</Link></li>
                 <li><Link href="/signup" className="hover:text-pink-400 transition-colors">Ascension</Link></li>
               </ul>
             </div>
             <div>
               <h4 className="text-white font-black uppercase tracking-widest text-xs mb-6">Compliance</h4>
               <ul className="space-y-4 text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-wider">
                 <li><Link href="/legal/tos" className="hover:text-pink-400 transition-colors">Terms of Service</Link></li>
                 <li><Link href="/legal/privacy" className="hover:text-pink-400 transition-colors">Data Privacy</Link></li>
               </ul>
             </div>
          </div>
          
          <div className="max-w-[1400px] mx-auto pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6 text-[8px] md:text-[9px] text-gray-600 uppercase tracking-widest font-bold leading-relaxed">
             <p className="max-w-4xl text-center md:text-left flex items-center gap-3">
               <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0" />
               DISCLAIMER: SANDNCO EXERCISES ZERO MORAL OVERSIGHT. ENTER AT YOUR OWN RISK. ALL PACKETS ARE FINAL.
             </p>
             <p className="shrink-0 text-pink-900 font-black">KING OF GOOD TIMES</p>
          </div>
        </footer>
      </main>

      <style jsx global>{`
        .hw-accel { transform: translate3d(0,0,0); backface-visibility: hidden; will-change: transform; perspective: 1000px; }
        .hw-layer { contain: layout paint style; isolation: isolate; }
        .hw-main { isolation: isolate; transform: translateZ(0); }
        @keyframes grid-move-3d { 0% { transform: perspective(1000px) rotateX(60deg) translate3d(0, 0, 0); } 100% { transform: perspective(1000px) rotateX(60deg) translate3d(0, 60px, 0); } }
        .animate-grid-move-3d { animation: grid-move-3d 3s linear infinite; }
        @keyframes blobFloat { 0% { transform: translate3d(0px, 0px, 0) scale(1); } 33% { transform: translate3d(50px, -50px, 0) scale(1.1); } 66% { transform: translate3d(-40px, 40px, 0) scale(0.9); } 100% { transform: translate3d(0px, 0px, 0) scale(1); } }
        .animate-blob-float { animation: blobFloat 25s infinite ease-in-out alternate; }
      `}</style>
    </div>
  )
}

// ============================================================================
// SUBCOMPONENTS
// ============================================================================

function MiniTerminalCard({ rumor, index }: { rumor: PreviewRumor; index: number }) {
  const catColor = CATEGORY_COLORS[rumor.category] || '#6B7280'
  const isHot = rumor.heat_score > 20

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 + index * 0.08 }}
      className="p-4 rounded-xl bg-white/[0.02] border border-white/10 backdrop-blur-md relative overflow-hidden group text-left"
    >
      <div className="absolute top-0 left-0 w-1 h-full bg-gray-800 group-hover:bg-pink-500 transition-colors" />
      <div className="flex items-center gap-2 mb-3 pl-2">
        <span className="text-[10px] font-mono text-gray-500 uppercase">ID:{rumor.anonymous_alias}</span>
        <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded border bg-black/50" style={{ borderColor: catColor, color: catColor }}>
          {rumor.category}
        </span>
        {isHot && <Flame className="w-3 h-3 text-rose-500 animate-pulse" />}
      </div>
      <p className="text-sm font-bold text-gray-200 mb-3 pl-2 line-clamp-2 leading-snug">
        {rumor.title}
      </p>
      <div className="flex items-center justify-between pl-2 border-t border-white/5 pt-2">
        <span className="text-[9px] text-gray-600 font-mono uppercase">{formatRelativeTime(rumor.created_at)}</span>
        <span className="text-[10px] font-black font-mono flex items-center gap-1" style={{ color: isHot ? '#EF4444' : '#6B7280' }}>
          <TrendingUp className="w-3 h-3" /> {Math.floor(rumor.heat_score)}
        </span>
      </div>
    </motion.div>
  )
}

function RumorTerminalCard({ rumor, index }: { rumor: PreviewRumor; index: number }) {
  const catColor = CATEGORY_COLORS[rumor.category] || '#6B7280'
  const isHot = rumor.heat_score > 20
  const heatColor = isHot ? '#EF4444' : rumor.heat_score > 8 ? '#F59E0B' : '#6B7280'

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} viewport={{ once: true }}>
      <Link href="/signup" className="block text-decoration-none">
        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-pink-500/50 transition-colors relative overflow-hidden group">
          
          {/* Heat signature bar */}
          <div className="absolute top-0 left-0 h-[2px] w-full bg-white/5">
             <div className="h-full transition-all duration-1000" style={{ width: `${Math.min(100, Math.max(15, rumor.heat_score))}%`, backgroundColor: heatColor, boxShadow: `0 0 10px ${heatColor}` }} />
          </div>

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-gray-500 uppercase">SYS_OP:{rumor.anonymous_alias}</span>
              <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded border bg-black/50" style={{ borderColor: catColor, color: catColor }}>
                {rumor.category}
              </span>
            </div>
            {isHot && (
              <span className="flex items-center gap-1 text-[10px] font-black text-rose-500 font-mono">
                <Flame className="w-3 h-3" /> {Math.floor(rumor.heat_score)}
              </span>
            )}
          </div>

          <h3 className="text-base font-bold text-gray-200 mb-4 line-clamp-2 leading-relaxed">
            {rumor.title}
          </h3>
          <span className="text-[10px] text-gray-600 font-mono uppercase tracking-widest">{formatRelativeTime(rumor.created_at)}</span>
        </div>
      </Link>
    </motion.div>
  )
}
