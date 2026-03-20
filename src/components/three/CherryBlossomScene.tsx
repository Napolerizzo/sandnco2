'use client'

import { useRef, useMemo, useEffect, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/* ── Sakura color palette ── */
const PETAL_COLORS = [
  new THREE.Color('#FFB7C5'),
  new THREE.Color('#FF8FAB'),
  new THREE.Color('#FFC0CB'),
  new THREE.Color('#FFD1DC'),
  new THREE.Color('#F9A8D4'),
]

/* ── Custom petal geometry — organic teardrop shape ── */
function createPetalGeometry() {
  const shape = new THREE.Shape()
  shape.moveTo(0, 0)
  shape.bezierCurveTo(0.15, 0.15, 0.28, 0.38, 0.12, 0.55)
  shape.bezierCurveTo(0.06, 0.63, 0, 0.66, 0, 0.66)
  shape.bezierCurveTo(0, 0.66, -0.06, 0.63, -0.12, 0.55)
  shape.bezierCurveTo(-0.28, 0.38, -0.15, 0.15, 0, 0)

  const geo = new THREE.ShapeGeometry(shape, 6)
  // Bend petal for 3D curvature
  const pos = geo.attributes.position
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i)
    pos.setZ(i, Math.sin(y * 2.5) * 0.04)
  }
  pos.needsUpdate = true
  geo.computeVertexNormals()
  return geo
}

/* ── Instanced petals ── */
function Petals({
  count,
  scrollData,
}: {
  count: number
  scrollData: { y: number }
}) {
  const meshRef = useRef<THREE.InstancedMesh>(null!)
  const dummy = useMemo(() => new THREE.Object3D(), [])

  const particles = useMemo(() => {
    return Array.from({ length: count }, () => ({
      x: (Math.random() - 0.5) * 40,
      y: Math.random() * 30 - 10,
      z: (Math.random() - 0.5) * 25 - 5,
      rx: Math.random() * Math.PI * 2,
      ry: Math.random() * Math.PI * 2,
      rz: Math.random() * Math.PI * 2,
      vy: 0.3 + Math.random() * 0.6,
      vrx: (Math.random() - 0.5) * 2,
      vry: (Math.random() - 0.5) * 1.5,
      vrz: (Math.random() - 0.5) * 1,
      drift: 0.5 + Math.random() * 1.5,
      freq: 0.3 + Math.random() * 0.7,
      scale: 0.12 + Math.random() * 0.28,
      phase: Math.random() * Math.PI * 2,
    }))
  }, [count])

  // Assign random colors per instance
  useEffect(() => {
    if (!meshRef.current) return
    const colors = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const c = PETAL_COLORS[Math.floor(Math.random() * PETAL_COLORS.length)]
      colors[i * 3] = c.r
      colors[i * 3 + 1] = c.g
      colors[i * 3 + 2] = c.b
    }
    meshRef.current.geometry.setAttribute(
      'color',
      new THREE.InstancedBufferAttribute(colors, 3)
    )
  }, [count])

  useFrame((state, delta) => {
    if (!meshRef.current) return
    const time = state.clock.elapsedTime
    const dt = Math.min(delta, 0.05) // clamp for tab-switch safety
    const scrollOffset = scrollData.y * 0.004

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i]

      // Gravity + sinusoidal drift
      p.y -= p.vy * dt
      p.x += Math.sin(time * p.freq + p.phase) * p.drift * dt
      p.z += Math.cos(time * p.freq * 0.7 + p.phase) * p.drift * 0.3 * dt

      // Recycle petals that fall below view
      if (p.y < -12) {
        p.y = 18 + Math.random() * 5
        p.x = (Math.random() - 0.5) * 40
        p.z = (Math.random() - 0.5) * 25 - 5
      }

      // Tumble rotation
      p.rx += p.vrx * dt
      p.ry += p.vry * dt
      p.rz += p.vrz * dt

      dummy.position.set(p.x, p.y - scrollOffset, p.z)
      dummy.rotation.set(p.rx, p.ry, p.rz)
      dummy.scale.setScalar(p.scale)
      dummy.updateMatrix()
      meshRef.current.setMatrixAt(i, dummy.matrix)
    }
    meshRef.current.instanceMatrix.needsUpdate = true
  })

  const geometry = useMemo(() => createPetalGeometry(), [])

  return (
    <instancedMesh ref={meshRef} args={[geometry, undefined, count]}>
      <meshStandardMaterial
        vertexColors
        side={THREE.DoubleSide}
        transparent
        opacity={0.75}
        roughness={0.5}
        metalness={0.05}
      />
    </instancedMesh>
  )
}

/* ── Floating point sparkles ── */
function FloatingDust({ count }: { count: number }) {
  const pointsRef = useRef<THREE.Points>(null!)

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    const positions = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 50
      positions[i * 3 + 1] = Math.random() * 30 - 10
      positions[i * 3 + 2] = (Math.random() - 0.5) * 30
    }
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    return geo
  }, [count])

  useFrame((state) => {
    if (!pointsRef.current) return
    const time = state.clock.elapsedTime
    const pos = pointsRef.current.geometry.attributes.position as THREE.BufferAttribute
    const arr = pos.array as Float32Array
    for (let i = 0; i < count; i++) {
      arr[i * 3 + 1] += Math.sin(time * 0.5 + i * 0.3) * 0.001
    }
    pos.needsUpdate = true
  })

  return (
    <points ref={pointsRef} geometry={geometry}>
      <pointsMaterial
        size={0.06}
        color="#FFB7C5"
        transparent
        opacity={0.35}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  )
}

/* ── Scene composition ── */
function Scene({
  scrollData,
  petalCount,
}: {
  scrollData: { y: number }
  petalCount: number
}) {
  return (
    <>
      <ambientLight intensity={0.25} color="#E8D5E0" />
      <pointLight position={[15, 15, 10]} intensity={0.6} color="#FFB7C5" distance={50} />
      <pointLight position={[-15, 8, -10]} intensity={0.4} color="#A855F7" distance={40} />
      <pointLight position={[0, -5, 5]} intensity={0.2} color="#EC4899" distance={30} />
      <fog attach="fog" args={['#0F172A', 8, 35]} />
      <Petals count={petalCount} scrollData={scrollData} />
      <FloatingDust count={60} />
    </>
  )
}

/* ── Exported wrapper ── */
export default function CherryBlossomScene({
  scrollData,
}: {
  scrollData: { y: number }
}) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}
      aria-hidden="true"
    >
      <Canvas
        camera={{ position: [0, 2, 12], fov: 60 }}
        dpr={[1, isMobile ? 1 : 1.5]}
        gl={{
          antialias: !isMobile,
          alpha: true,
          powerPreference: 'high-performance',
        }}
        style={{ background: 'transparent' }}
      >
        <Scene scrollData={scrollData} petalCount={isMobile ? 80 : 200} />
      </Canvas>
    </div>
  )
}
