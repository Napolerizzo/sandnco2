'use client'

import * as THREE from 'three'
import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Sparkles } from '@react-three/drei'
import { EffectComposer, DepthOfField, Bloom, Noise, Vignette } from '@react-three/postprocessing'
import {
  Flame, Trophy, Eye, ArrowRight, TrendingUp,
  Zap, MapPin, Users, MessageSquare, ShieldAlert,
  BarChart2, Lock, Crown, LayoutDashboard, Crosshair,
  ShieldCheck, Activity, Terminal, Radar, Database
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

const CATEGORY_COLORS: Record<string, string> = {
  drama: '#EF4444', politics: '#F59E0B', music: '#A855F7',
  sports: '#22C55E', tech: '#3B82F6', romance: '#EC4899',
  crime: '#F97316', lifestyle: '#6366F1', general: '#6B7280',
}

const TAGLINES = [
  'Drop rumors. Bust myths. Win capital.',
  'Anonymous by design. Honest by nature.',
  'The city talks. We keep the ledger.',
  'From Ghost to King... earn your rank.',
]

// ============================================================================
// 3D SCENE COMPONENTS (BACKGROUND)
// ============================================================================
function InstancedGrass({ count = 50000 }) {
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const materialRef = useRef<THREE.MeshStandardMaterial>(null)
  const uniforms = useMemo(() => ({ uTime: { value: 0 } }), [])

  useFrame((state) => {
    if (uniforms.uTime) uniforms.uTime.value = state.clock.elapsedTime
  })

  const dummy = useMemo(() => new THREE.Object3D(), [])
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      dummy.position.set((Math.random() - 0.5) * 50, 0, (Math.random() - 0.5) * 50)
      dummy.rotation.y = Math.random() * Math.PI
      dummy.scale.setScalar(0.5 + Math.random() * 0.5)
      dummy.updateMatrix()
      pos.set([dummy.position.x, dummy.position.y, dummy.position.z], i * 3)
    }
    return pos
  }, [count, dummy])

  useEffect(() => {
    if (meshRef.current) {
      for (let i = 0; i < count; i++) {
        dummy.position.set(positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2])
        dummy.rotation.y = Math.random() * Math.PI
        dummy.scale.setScalar(0.5 + Math.random() * 0.5)
        dummy.updateMatrix()
        meshRef.current.setMatrixAt(i, dummy.matrix)
      }
      meshRef.current.instanceMatrix.needsUpdate = true
    }
  }, [count, dummy, positions])

  const onBeforeCompile = (shader: any) => {
    shader.uniforms.uTime = uniforms.uTime
    shader.vertexShader = `
      uniform float uTime;
      ${shader.vertexShader}
    `
    shader.vertexShader = shader.vertexShader.replace(
      '#include <begin_vertex>',
      `
      #include <begin_vertex>
      float windPower = 0.5;
      float sway = sin(uTime * 2.0 + position.x * 0.5 + position.z * 0.5) * windPower;
      transformed.x += sway * uv.y; 
      transformed.z += sway * uv.y * 0.5;
      `
    )
  }

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]} receiveShadow castShadow>
      <planeGeometry args={[0.1, 1]} />
      <meshStandardMaterial ref={materialRef} color="#8B5A83" emissive="#3A1C3B" side={THREE.DoubleSide} onBeforeCompile={onBeforeCompile} />
    </instancedMesh>
  )
}

function CameraController() {
  const { camera } = useThree()
  
  useFrame((state, delta) => {
    // Sync camera to native HTML scroll
    const scrollY = window.scrollY
    const maxScroll = document.body.scrollHeight - window.innerHeight
    const progress = maxScroll > 0 ? Math.min(scrollY / maxScroll, 1) : 0

    const targetZ = THREE.MathUtils.lerp(15, 4, progress)
    const targetY = THREE.MathUtils.lerp(5, 1.5, progress)
    const targetX = THREE.MathUtils.lerp(-5, 1, progress)

    camera.position.z = THREE.MathUtils.damp(camera.position.z, targetZ, 2, delta)
    camera.position.y = THREE.MathUtils.damp(camera.position.y, targetY, 2, delta)
    camera.position.x = THREE.MathUtils.damp(camera.position.x, targetX, 2, delta)
    
    const lookAtTarget = new THREE.Vector3(0, 1, 0)
    camera.lookAt(lookAtTarget)
  })
  return null
}

function CinematicScene() {
  return (
    <>
      <color attach="background" args={['#2A1B2E']} />
      <fog attach="fog" args={['#2A1B2E', 10, 40]} />
      <Environment preset="sunset" />
      <directionalLight position={[10, 5, -10]} intensity={2.5} color="#FFB6C1" castShadow />
      <ambientLight intensity={0.4} color="#FFC0CB" />

      <InstancedGrass count={60000} />
      
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#1A0F14" />
      </mesh>

      {/* Placeholder Anime Character */}
      <mesh position={[0, 0.75, 0]} castShadow>
        <capsuleGeometry args={[0.4, 0.7, 4, 8]} />
        <meshStandardMaterial color="#0A0508" roughness={0.8} />
      </mesh>

      <Sparkles count={200} scale={20} size={2} speed={0.4} opacity={0.3} color="#FFE4E1" />
      <CameraController />

      <EffectComposer disableNormalPass multisampling={0}>
        <DepthOfField focusDistance={0.02} focalLength={0.05} bokehScale={4} height={480} />
        <Bloom luminanceThreshold={0.8} mipmapBlur intensity={1.2} />
        <Noise opacity={0.04} />
        <Vignette eskil={false} offset={0.1} darkness={1.1} />
      </EffectComposer>
    </>
  )
}

// ============================================================================
// MAIN FUNCTIONAL UI
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
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const t = setInterval(() => setTaglineIdx(i => (i + 1) % TAGLINES.length), 3000)
    return () => clearInterval(t)
  }, [])

  if (!mounted) return null

  return (
    <div className="relative min-h-screen text-pink-50 selection:bg-pink-400 selection:text-white font-sans overflow-x-hidden bg-[#1A0F14]">
      
      {/* 3D Background Layer */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Canvas shadows dpr={[1, 1.5]} camera={{ position: [-5, 5, 15], fov: 45 }}>
          <CinematicScene />
        </Canvas>
      </div>

      {/* Functional Foreground Layer */}
      <div className="relative z-10">
        
        {/* NAVBAR */}
        <nav className="fixed top-0 left-0 w-full h-[60px] z-50 flex items-center bg-[#1A0F14]/40 backdrop-blur-xl border-b border-white/10">
          <div className="max-w-[1100px] mx-auto w-full px-6 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 text-decoration-none group">
              <div className="relative w-6 h-6 opacity-80 group-hover:opacity-100 transition-opacity">
                <Image src="/logo.png" alt="SANDNCO" fill style={{ objectFit: 'contain' }} />
              </div>
              <span className="text-[15px] font-bold tracking-widest uppercase text-white drop-shadow-md">SANDNCO</span>
            </Link>
            <div className="flex items-center gap-4">
              {!authLoading && user ? (
                <Link href="/feed">
                  <button className="flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-widest bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors backdrop-blur-md border border-white/20">
                    <LayoutDashboard className="w-3 h-3" /> Console
                  </button>
                </Link>
              ) : !authLoading ? (
                <>
                  <Link href="/login">
                    <button className="hidden md:block px-4 py-2 text-xs font-medium uppercase tracking-widest text-pink-200 hover:text-white transition-colors">Log in</button>
                  </Link>
                  <Link href="/signup">
                    <button className="px-4 py-2 text-xs font-bold uppercase tracking-widest bg-pink-500/80 hover:bg-pink-500 text-white rounded-full transition-all shadow-[0_0_15px_rgba(236,72,153,0.4)] backdrop-blur-md">
                      Sign up free
                    </button>
                  </Link>
                </>
              ) : null}
            </div>
          </div>
        </nav>

        {/* HERO SECTION */}
        <section className="pt-[140px] pb-[80px] min-h-[90vh] flex items-center px-6">
          <div className="max-w-[1100px] mx-auto w-full flex flex-col items-center text-center">
            
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="mb-6">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 text-[10px] font-bold tracking-widest uppercase text-pink-300 rounded-full bg-pink-900/30 border border-pink-500/30 backdrop-blur-md">
                <span className="w-1.5 h-1.5 rounded-full bg-pink-400 shadow-[0_0_8px_rgba(244,114,182,0.8)] animate-pulse" />
                Beta Faridabad
              </span>
            </motion.div>

            <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="text-[clamp(36px,8vw,72px)] font-serif leading-[1.1] mb-6 drop-shadow-2xl text-white">
              Your city&apos;s <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-300 via-purple-300 to-indigo-300 italic">open secret</span>
            </motion.h1>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="h-6 mb-10 overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.p key={taglineIdx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="text-sm md:text-base text-pink-200/80 font-light tracking-widest uppercase">
                  {TAGLINES[taglineIdx]}
                </motion.p>
              </AnimatePresence>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="flex flex-wrap items-center justify-center gap-4 w-full">
              <Link href={user ? '/feed' : '/signup'}>
                <button className="px-8 py-4 text-xs font-bold uppercase tracking-widest bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-2xl backdrop-blur-md transition-all flex items-center gap-2 shadow-lg">
                  {user ? 'Go to Dashboard' : 'Join Faridabad'} <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
            </motion.div>

            {/* Dynamic Stats layered over 3D */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mt-20 flex flex-wrap justify-center gap-8 md:gap-16">
              {[
                { icon: Users, value: userCount || '0', label: 'Operatives' },
                ...(rumorCount > 0 ? [{ icon: Flame, value: rumorCount, label: 'Intel Packets' }] : []),
                { icon: Trophy, value: '10', label: 'Authority Ranks' },
                { icon: Zap, value: '₹0', label: 'Entry Cost' },
              ].map(({ icon: Icon, value, label }) => (
                <div key={label} className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <Icon className="w-4 h-4 text-pink-300/70" />
                    <span className="text-2xl font-serif text-white drop-shadow-md">{value}</span>
                  </div>
                  <span className="text-[9px] font-bold uppercase tracking-widest text-pink-200/60">{label}</span>
                </div>
              ))}
            </motion.div>

          </div>
        </section>

        {/* HOW IT WORKS (Glassmorphism Bento) */}
        <section id="how-it-works" className="py-24 px-6 max-w-[1200px] mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-serif text-white drop-shadow-lg mb-4">Four ways to play</h2>
            <p className="text-sm font-light tracking-widest text-pink-200/70 uppercase">Master the mechanics.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Flame, title: 'Drop Rumors', color: 'text-rose-400', border: 'border-rose-400/30', desc: 'Post what you know under a random alias. Nobody knows who you are.' },
              { icon: Eye, title: 'Bust Myths', color: 'text-blue-400', border: 'border-blue-400/30', desc: 'Investigate rumors with evidence. Get verdicts: True, False, or Misleading.' },
              { icon: Trophy, title: 'Win Challenges', color: 'text-purple-400', border: 'border-purple-400/30', desc: 'Compete in city-wide challenges with real capital on the line.' },
              { icon: Crown, title: 'Rank Up', color: 'text-amber-400', border: 'border-amber-400/30', desc: '10 ranks from Ghost to King. Every action earns XP. Flex your rank.' },
            ].map(({ icon: Icon, title, color, border, desc }, i) => (
              <motion.div key={title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} viewport={{ once: true }}
                className="p-8 rounded-[2rem] bg-[#1A0F14]/40 backdrop-blur-xl border border-white/10 hover:border-white/30 transition-colors"
              >
                <div className={`w-12 h-12 rounded-xl bg-white/5 border ${border} flex items-center justify-center mb-6`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <h3 className="text-lg font-bold text-white mb-2 font-serif">{title}</h3>
                <p className="text-xs leading-relaxed text-pink-100/70">{desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* LIVE FEED (Glassy Data Rendering) */}
        {previewRumors.length > 0 && (
          <section className="py-24 px-6 max-w-[1200px] mx-auto">
            <div className="flex flex-wrap items-end justify-between gap-6 mb-12">
              <div>
                <h2 className="text-3xl md:text-5xl font-serif text-white drop-shadow-lg mb-4">The Global Ledger</h2>
                <p className="text-sm font-light tracking-widest text-pink-200/70 uppercase">Live Intercepts</p>
              </div>
              <Link href="/signup">
                <button className="px-6 py-2 text-[10px] font-bold uppercase tracking-widest border border-white/20 bg-white/5 backdrop-blur-md rounded-full hover:bg-white/20 transition-colors">See All</button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {previewRumors.map((rumor, i) => (
                <RumorGlassCard key={rumor.id} rumor={rumor} index={i} />
              ))}
              <div className="p-8 rounded-3xl bg-white/5 backdrop-blur-md border border-dashed border-white/20 flex flex-col items-center justify-center min-h-[200px] text-center">
                <Lock className="w-6 h-6 text-pink-300/50 mb-4" />
                <p className="text-xs font-medium text-pink-200/80 mb-6">Sign up to decrypt full feed</p>
                <Link href="/signup">
                  <button className="px-6 py-2 text-[10px] font-bold uppercase tracking-widest bg-pink-500 hover:bg-pink-400 text-white rounded-full transition-colors">Join Free</button>
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* MEMBERSHIP TIERS */}
        <section className="py-24 px-6 max-w-[900px] mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-serif text-white drop-shadow-lg mb-4">License Tiers</h2>
            <p className="text-sm font-light tracking-widest text-pink-200/70 uppercase">Free forever. Premium if you want more.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Free */}
            <div className="p-10 rounded-[2.5rem] bg-[#1A0F14]/40 backdrop-blur-xl border border-white/10">
              <p className="text-[10px] font-bold tracking-widest uppercase text-pink-300/70 mb-4">Civilian</p>
              <p className="text-4xl font-serif text-white mb-2">₹0</p>
              <p className="text-xs text-pink-200/60 mb-8 pb-8 border-b border-white/10">For everyone. Always.</p>
              <ul className="space-y-4 mb-10">
                {['Post anonymous rumors', 'Vote & comment', 'Join public challenges', 'Earn XP and rank up'].map(item => (
                  <li key={item} className="flex items-center gap-3 text-xs text-pink-50">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" /> {item}
                  </li>
                ))}
              </ul>
              <Link href="/signup">
                <button className="w-full py-4 text-xs font-bold uppercase tracking-widest border border-white/20 bg-white/5 rounded-2xl hover:bg-white/10 transition-colors backdrop-blur-md">Get Started Free</button>
              </Link>
            </div>

            {/* Premium */}
            <div className="p-10 rounded-[2.5rem] bg-[#1A0F14]/60 backdrop-blur-2xl border border-pink-500/40 relative shadow-[0_0_30px_rgba(236,72,153,0.15)]">
              <div className="absolute top-0 right-8 bg-pink-500 text-white text-[9px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-b-lg">Beta: ₹1</div>
              <p className="text-[10px] font-bold tracking-widest uppercase text-pink-400 mb-4">Syndicate</p>
              <div className="flex items-baseline gap-2 mb-2">
                <p className="text-4xl font-serif text-white">₹89</p>
                <span className="text-xs text-pink-200/60 uppercase tracking-widest">/mo</span>
              </div>
              <p className="text-xs text-pink-200/60 mb-8 pb-8 border-b border-white/10">For serious city insiders.</p>
              <ul className="space-y-4 mb-10">
                {[
                  'Everything in Free',
                  'Premium badge on profile',
                  'Create your own challenges',
                  'Publish city polls',
                  'Priority feed placement',
                ].map(item => (
                  <li key={item} className="flex items-center gap-3 text-xs text-pink-50">
                    <Zap className="w-4 h-4 text-pink-400" /> {item}
                  </li>
                ))}
              </ul>
              <Link href="/signup">
                <button className="w-full py-4 text-xs font-bold uppercase tracking-widest bg-pink-500 hover:bg-pink-400 text-white rounded-2xl transition-all shadow-lg">Start Premium</button>
              </Link>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="py-12 px-6 border-t border-white/10 bg-[#1A0F14]/80 backdrop-blur-xl mt-12">
          <div className="max-w-[1100px] mx-auto flex flex-wrap items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="relative w-5 h-5 opacity-60">
                <Image src="/logo.png" alt="" fill style={{ objectFit: 'contain' }} />
              </div>
              <span className="text-[10px] uppercase tracking-widest text-pink-200/50">SANDNCO King of Good Times</span>
              <span className="px-2 py-0.5 text-[8px] uppercase tracking-widest bg-white/5 border border-white/10 rounded">Beta</span>
            </div>
            <div className="flex gap-6">
              {[
                { href: '/legal/tos', label: 'Terms' },
                { href: '/legal/privacy', label: 'Privacy' },
                { href: '/support', label: 'Support' },
              ].map(({ href, label }) => (
                <Link key={href} href={href} className="text-[10px] uppercase tracking-widest text-pink-200/60 hover:text-white transition-colors">
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </footer>

      </div>
    </div>
  )
}

// ============================================================================
// SUBCOMPONENTS
// ============================================================================
function RumorGlassCard({ rumor, index }: { rumor: PreviewRumor; index: number }) {
  const catColor = CATEGORY_COLORS[rumor.category] || '#6B7280'
  const isHot = rumor.heat_score > 20
  const heatColor = isHot ? '#EF4444' : rumor.heat_score > 8 ? '#F59E0B' : '#A855F7'

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} viewport={{ once: true }}>
      <Link href="/signup" className="block outline-none">
        <div className="p-8 rounded-3xl bg-[#1A0F14]/40 backdrop-blur-xl border border-white/10 hover:border-white/30 transition-colors relative overflow-hidden group">
          
          {/* Heat signature top border */}
          <div className="absolute top-0 left-0 h-[2px] w-full bg-white/5">
             <div className="h-full transition-all duration-1000 opacity-60" style={{ width: `${Math.min(100, Math.max(15, rumor.heat_score))}%`, backgroundColor: heatColor, boxShadow: `0 0 15px ${heatColor}` }} />
          </div>

          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-mono text-pink-200/50">ID:{rumor.anonymous_alias}</span>
              <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border bg-black/30" style={{ borderColor: catColor, color: catColor }}>
                {rumor.category}
              </span>
            </div>
            {isHot && (
              <span className="flex items-center gap-1 text-[10px] font-bold text-rose-400 font-mono">
                <Flame className="w-3 h-3" /> {Math.floor(rumor.heat_score)}
              </span>
            )}
          </div>

          <h3 className="text-base font-serif text-white mb-6 line-clamp-3 leading-relaxed drop-shadow-sm">
            {rumor.title}
          </h3>
          <span className="text-[9px] text-pink-200/40 uppercase tracking-widest">{formatRelativeTime(rumor.created_at)}</span>
        </div>
      </Link>
    </motion.div>
  )
}
