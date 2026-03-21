'use client'

import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Sphere, Cylinder } from '@react-three/drei'
import * as THREE from 'three'

interface DNAStats {
  rumors: number
  votes: number
  challenges: number
  wins: number
}

interface DNAEvolutionProps {
  username: string
  stats: DNAStats
  compact?: boolean
}

// ── Internal Three.js components ────────────────────────────────────────────

function HelixStrand({
  nodeCount,
  strand,
  categories,
}: {
  nodeCount: number
  strand: number  // 0 = strand A, 1 = strand B
  categories: string[]
}) {
  const groupRef = useRef<THREE.Group>(null)

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.4
    }
  })

  const CATEGORY_COLORS: Record<string, string> = {
    romance:    '#EC4899',
    general:    '#00E5FF',
    challenge:  '#FFD700',
    vote:       '#A855F7',
    win:        '#22C55E',
  }

  const nodes = useMemo(() => {
    return Array.from({ length: nodeCount }, (_, i) => {
      const t = (i / nodeCount) * Math.PI * 4
      const radius = 0.6
      const x = strand === 0 ? Math.cos(t) * radius : Math.cos(t + Math.PI) * radius
      const z = strand === 0 ? Math.sin(t) * radius : Math.sin(t + Math.PI) * radius
      const y = (i / nodeCount) * 4 - 2

      const cat = categories[i % categories.length] || 'general'
      const color = CATEGORY_COLORS[cat] || '#00E5FF'
      return { x, y, z, color, t }
    })
  }, [nodeCount, strand, categories])

  return (
    <group ref={groupRef}>
      {nodes.map((n, i) => (
        <group key={i} position={[n.x, n.y, n.z]}>
          <Sphere args={[0.08, 8, 8]}>
            <meshStandardMaterial
              color={n.color}
              emissive={n.color}
              emissiveIntensity={0.8}
              roughness={0.2}
              metalness={0.6}
            />
          </Sphere>
        </group>
      ))}
    </group>
  )
}

function HelixRungs({ nodeCount }: { nodeCount: number }) {
  const groupRef = useRef<THREE.Group>(null)

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.4
    }
  })

  const rungs = useMemo(() => {
    return Array.from({ length: Math.floor(nodeCount / 2) }, (_, i) => {
      const t = (i / nodeCount) * Math.PI * 4 * 2
      const radius = 0.6
      const x1 = Math.cos(t) * radius
      const z1 = Math.sin(t) * radius
      const x2 = Math.cos(t + Math.PI) * radius
      const z2 = Math.sin(t + Math.PI) * radius
      const y = (i / (nodeCount / 2)) * 4 - 2

      const midX = (x1 + x2) / 2
      const midZ = (z1 + z2) / 2
      const length = Math.sqrt((x2 - x1) ** 2 + (z2 - z1) ** 2)
      const angle = Math.atan2(z2 - z1, x2 - x1)

      return { midX, midZ, y, length, angle }
    })
  }, [nodeCount])

  return (
    <group ref={groupRef}>
      {rungs.map((r, i) => (
        <group key={i} position={[r.midX, r.y, r.midZ]} rotation={[0, -r.angle, Math.PI / 2]}>
          <Cylinder args={[0.015, 0.015, r.length, 4]}>
            <meshStandardMaterial
              color="#FFD700"
              emissive="#FFD700"
              emissiveIntensity={0.4}
              transparent
              opacity={0.5}
            />
          </Cylinder>
        </group>
      ))}
    </group>
  )
}

function DNAScene({ stats, categories, compact }: { stats: DNAStats; categories: string[]; compact: boolean }) {
  const totalNodes = Math.max(6, Math.min(24, Math.floor((stats.rumors + stats.votes + stats.challenges) / 2)))

  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[2, 4, 2]} intensity={1.5} color="#FF2D55" />
      <pointLight position={[-2, -4, -2]} intensity={1} color="#00E5FF" />
      <pointLight position={[0, 0, 3]} intensity={0.8} color="#FFD700" />

      <group scale={compact ? 0.7 : 1}>
        <HelixStrand nodeCount={totalNodes} strand={0} categories={categories} />
        <HelixStrand nodeCount={totalNodes} strand={1} categories={categories} />
        <HelixRungs nodeCount={totalNodes} />
      </group>
    </>
  )
}

// ── Export ───────────────────────────────────────────────────────────────────

export default function DNAEvolution({ username, stats, compact = false }: DNAEvolutionProps) {
  // Build category sequence from stats
  const categories = useMemo(() => {
    const cats: string[] = []
    for (let i = 0; i < stats.rumors; i++) cats.push('romance', 'general')[Math.floor(Math.random() * 2)]
    for (let i = 0; i < stats.votes; i++) cats.push('vote')
    for (let i = 0; i < stats.challenges; i++) cats.push('challenge')
    for (let i = 0; i < stats.wins; i++) cats.push('win')
    return cats.length > 0 ? cats : ['general', 'vote', 'romance', 'challenge']
  }, [stats])

  const height = compact ? 140 : 260
  const width = compact ? 120 : 220

  return (
    <div style={{ position: 'relative', width, height }}>
      <Canvas
        camera={{ position: [0, 0, 4.5], fov: compact ? 45 : 40 }}
        style={{ background: 'transparent' }}
        gl={{ antialias: true, alpha: true }}
      >
        <DNAScene stats={stats} categories={categories} compact={compact} />
      </Canvas>
      {!compact && (
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          textAlign: 'center', fontSize: 11, color: 'rgba(255,255,255,0.3)',
          fontFamily: 'var(--font-mono)',
        }}>
          @{username} · DNA Strand
        </div>
      )}
    </div>
  )
}
