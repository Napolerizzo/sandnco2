'use client'

import { useRef, useMemo, useEffect, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { EffectComposer, Bloom, ChromaticAberration, Scanline, Noise, Vignette, Glitch } from '@react-three/postprocessing'
import { BlendFunction, GlitchMode } from 'postprocessing'

/* ── Color palettes ── */
const PETAL_COLORS = [
  new THREE.Color('#FF2D55'),
  new THREE.Color('#FF6B8A'),
  new THREE.Color('#FFB7C5'),
  new THREE.Color('#FF4D7A'),
  new THREE.Color('#FFA0B4'),
]

const DNA_COLOR_A = new THREE.Color('#FF2D55')
const DNA_COLOR_B = new THREE.Color('#00E5FF')
const GOLD = new THREE.Color('#FFD700')

/* ── Camera path for scroll-driven flight ── */
const CAMERA_PATH = new THREE.CatmullRomCurve3([
  new THREE.Vector3(0, 2, 15),
  new THREE.Vector3(3, 3, 12),
  new THREE.Vector3(5, 4, 8),
  new THREE.Vector3(2, 5, 5),
  new THREE.Vector3(0, 6, 3),
])

/* ── Petal geometry ── */
function createPetalGeometry() {
  const shape = new THREE.Shape()
  shape.moveTo(0, 0)
  shape.bezierCurveTo(0.15, 0.15, 0.28, 0.38, 0.12, 0.55)
  shape.bezierCurveTo(0.06, 0.63, 0, 0.66, 0, 0.66)
  shape.bezierCurveTo(0, 0.66, -0.06, 0.63, -0.12, 0.55)
  shape.bezierCurveTo(-0.28, 0.38, -0.15, 0.15, 0, 0)
  const geo = new THREE.ShapeGeometry(shape, 6)
  const pos = geo.attributes.position
  for (let i = 0; i < pos.count; i++) {
    pos.setZ(i, Math.sin(pos.getY(i) * 2.5) * 0.04)
  }
  pos.needsUpdate = true
  geo.computeVertexNormals()
  return geo
}

/* ── Glass shard geometry ── */
function createShardGeometry() {
  const shape = new THREE.Shape()
  shape.moveTo(-0.4, -0.6)
  shape.lineTo(0.5, -0.25)
  shape.lineTo(0.35, 0.65)
  shape.lineTo(-0.15, 0.5)
  shape.lineTo(-0.5, 0.05)
  return new THREE.ShapeGeometry(shape)
}

/* ── Mouse-reactive camera ── */
function CameraController({
  mouseData,
  scrollProgress,
}: {
  mouseData: { x: number; y: number }
  scrollProgress: number
}) {
  const { camera } = useThree()
  const targetPos = useRef(new THREE.Vector3(0, 2, 15))
  const targetLook = useRef(new THREE.Vector3(0, 0, 0))

  useFrame(() => {
    // Scroll-driven camera path (use first 30%)
    const pathT = Math.min(scrollProgress * 0.3, 0.99)
    const pathPos = CAMERA_PATH.getPoint(pathT)
    targetPos.current.copy(pathPos)

    // Mouse offset
    targetPos.current.x += mouseData.x * 1.2
    targetPos.current.y += mouseData.y * 0.6

    // Smooth lerp
    camera.position.lerp(targetPos.current, 0.04)

    // Look target
    targetLook.current.set(mouseData.x * 2, mouseData.y * 1, 0)
    const currentLook = new THREE.Vector3()
    camera.getWorldDirection(currentLook)
    camera.lookAt(
      THREE.MathUtils.lerp(0, targetLook.current.x, 0.03),
      THREE.MathUtils.lerp(0, targetLook.current.y, 0.03),
      0
    )
  })

  return null
}

/* ── Instanced cherry blossom petals ── */
function CherryPetals({ count, scrollData, mouseData }: {
  count: number
  scrollData: { y: number }
  mouseData: { x: number; y: number }
}) {
  const meshRef = useRef<THREE.InstancedMesh>(null!)
  const dummy = useMemo(() => new THREE.Object3D(), [])

  const particles = useMemo(() =>
    Array.from({ length: count }, () => ({
      x: (Math.random() - 0.5) * 50,
      y: Math.random() * 35 - 12,
      z: (Math.random() - 0.5) * 35 - 5,
      rx: Math.random() * Math.PI * 2,
      ry: Math.random() * Math.PI * 2,
      rz: Math.random() * Math.PI * 2,
      vy: 0.3 + Math.random() * 0.7,
      vrx: (Math.random() - 0.5) * 2.5,
      vry: (Math.random() - 0.5) * 1.8,
      vrz: (Math.random() - 0.5) * 1.2,
      drift: 0.5 + Math.random() * 2,
      freq: 0.3 + Math.random() * 0.8,
      scale: 0.1 + Math.random() * 0.35,
      phase: Math.random() * Math.PI * 2,
    }))
  , [count])

  useEffect(() => {
    if (!meshRef.current) return
    const colors = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const c = PETAL_COLORS[Math.floor(Math.random() * PETAL_COLORS.length)]
      colors[i * 3] = c.r
      colors[i * 3 + 1] = c.g
      colors[i * 3 + 2] = c.b
    }
    meshRef.current.geometry.setAttribute('color', new THREE.InstancedBufferAttribute(colors, 3))
  }, [count])

  useFrame((state, delta) => {
    if (!meshRef.current) return
    const time = state.clock.elapsedTime
    const dt = Math.min(delta, 0.05)
    const scrollOffset = scrollData.y * 0.005

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i]
      p.y -= p.vy * dt
      p.x += Math.sin(time * p.freq + p.phase) * p.drift * dt
      p.z += Math.cos(time * p.freq * 0.7 + p.phase) * p.drift * 0.3 * dt

      // Mouse repulsion (push petals away from cursor in XY)
      const dx = p.x - mouseData.x * 15
      const dy = p.y - mouseData.y * 10
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist < 5) {
        const force = (5 - dist) * 0.01
        p.x += dx * force * dt
        p.y += dy * force * dt
      }

      if (p.y < -14) {
        p.y = 22 + Math.random() * 6
        p.x = (Math.random() - 0.5) * 50
        p.z = (Math.random() - 0.5) * 35 - 5
      }

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
        opacity={0.8}
        roughness={0.4}
        metalness={0.05}
        emissive="#FF2D55"
        emissiveIntensity={0.15}
      />
    </instancedMesh>
  )
}

/* ── Floating glass shards ── */
function GlassShards({ count }: { count: number }) {
  const meshRef = useRef<THREE.InstancedMesh>(null!)
  const dummy = useMemo(() => new THREE.Object3D(), [])

  const shards = useMemo(() =>
    Array.from({ length: count }, () => ({
      x: (Math.random() - 0.5) * 40,
      y: (Math.random() - 0.5) * 28,
      z: (Math.random() - 0.5) * 25 - 8,
      rx: Math.random() * Math.PI * 2,
      ry: Math.random() * Math.PI * 2,
      rz: Math.random() * Math.PI * 2,
      vrx: (Math.random() - 0.5) * 0.3,
      vry: (Math.random() - 0.5) * 0.3,
      vrz: (Math.random() - 0.5) * 0.2,
      scale: 0.4 + Math.random() * 1.2,
    }))
  , [count])

  useFrame((_, delta) => {
    if (!meshRef.current) return
    const dt = Math.min(delta, 0.05)
    for (let i = 0; i < shards.length; i++) {
      const s = shards[i]
      s.rx += s.vrx * dt
      s.ry += s.vry * dt
      s.rz += s.vrz * dt
      dummy.position.set(s.x, s.y, s.z)
      dummy.rotation.set(s.rx, s.ry, s.rz)
      dummy.scale.setScalar(s.scale)
      dummy.updateMatrix()
      meshRef.current.setMatrixAt(i, dummy.matrix)
    }
    meshRef.current.instanceMatrix.needsUpdate = true
  })

  const geometry = useMemo(() => createShardGeometry(), [])

  return (
    <instancedMesh ref={meshRef} args={[geometry, undefined, count]}>
      <meshStandardMaterial
        color="#8EDDFF"
        metalness={0.95}
        roughness={0.05}
        transparent
        opacity={0.1}
        side={THREE.DoubleSide}
        envMapIntensity={2}
      />
    </instancedMesh>
  )
}

/* ── DNA double helix ── */
function DNAHelix() {
  const pointsRef = useRef<THREE.Points>(null!)
  const strandCount = 80

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    const total = strandCount * 2 + Math.floor(strandCount / 4)
    const positions = new Float32Array(total * 3)
    const colors = new Float32Array(total * 3)
    let idx = 0

    for (let i = 0; i < strandCount; i++) {
      const t = (i / strandCount) * Math.PI * 6
      const y = (i / strandCount - 0.5) * 28

      positions[idx * 3] = Math.cos(t) * 2.2
      positions[idx * 3 + 1] = y
      positions[idx * 3 + 2] = Math.sin(t) * 2.2
      colors[idx * 3] = DNA_COLOR_A.r
      colors[idx * 3 + 1] = DNA_COLOR_A.g
      colors[idx * 3 + 2] = DNA_COLOR_A.b
      idx++

      positions[idx * 3] = Math.cos(t + Math.PI) * 2.2
      positions[idx * 3 + 1] = y
      positions[idx * 3 + 2] = Math.sin(t + Math.PI) * 2.2
      colors[idx * 3] = DNA_COLOR_B.r
      colors[idx * 3 + 1] = DNA_COLOR_B.g
      colors[idx * 3 + 2] = DNA_COLOR_B.b
      idx++

      if (i % 4 === 0) {
        positions[idx * 3] = 0
        positions[idx * 3 + 1] = y
        positions[idx * 3 + 2] = 0
        colors[idx * 3] = GOLD.r
        colors[idx * 3 + 1] = GOLD.g
        colors[idx * 3 + 2] = GOLD.b
        idx++
      }
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions.slice(0, idx * 3), 3))
    geo.setAttribute('color', new THREE.BufferAttribute(colors.slice(0, idx * 3), 3))
    return geo
  }, [])

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.elapsedTime * 0.08
    }
  })

  return (
    <points ref={pointsRef} geometry={geometry} position={[20, 0, -18]}>
      <pointsMaterial
        size={0.2}
        vertexColors
        transparent
        opacity={0.85}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  )
}

/* ── Stock chart ribbon ── */
function StockRibbon() {
  const meshRef = useRef<THREE.Mesh>(null!)

  const geometry = useMemo(() => {
    const points: THREE.Vector3[] = []
    let y = 0
    for (let i = 0; i < 30; i++) {
      y += (Math.random() - 0.42) * 1.8
      points.push(new THREE.Vector3((i - 15) * 1.6, y, 0))
    }
    const curve = new THREE.CatmullRomCurve3(points)
    return new THREE.TubeGeometry(curve, 120, 0.06, 6, false)
  }, [])

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.x = Math.sin(state.clock.elapsedTime * 0.08) * 3
      meshRef.current.position.y = Math.cos(state.clock.elapsedTime * 0.12) * 0.8
    }
  })

  return (
    <mesh ref={meshRef} geometry={geometry} position={[-12, 4, -12]}>
      <meshStandardMaterial
        color="#FFD700"
        emissive="#FFD700"
        emissiveIntensity={0.5}
        transparent
        opacity={0.35}
      />
    </mesh>
  )
}

/* ── Pixelated human silhouettes ── */
function PixelHumans() {
  const groupRef = useRef<THREE.Group>(null!)

  // Generate human silhouette as point cloud
  const figures = useMemo(() => {
    const createFigure = () => {
      const pts: number[] = []
      const cols: number[] = []
      const crimson = new THREE.Color('#FF2D55')
      const cyan = new THREE.Color('#00E5FF')

      // Head (sphere)
      for (let i = 0; i < 20; i++) {
        const theta = Math.random() * Math.PI * 2
        const phi = Math.random() * Math.PI
        const r = 0.25
        pts.push(
          Math.sin(phi) * Math.cos(theta) * r,
          Math.sin(phi) * Math.sin(theta) * r + 1.7,
          Math.cos(phi) * r
        )
        const c = Math.random() > 0.5 ? crimson : cyan
        cols.push(c.r, c.g, c.b)
      }

      // Torso
      for (let i = 0; i < 40; i++) {
        pts.push(
          (Math.random() - 0.5) * 0.6,
          Math.random() * 0.9 + 0.6,
          (Math.random() - 0.5) * 0.25
        )
        const c = Math.random() > 0.6 ? crimson : cyan
        cols.push(c.r, c.g, c.b)
      }

      // Arms
      for (let i = 0; i < 20; i++) {
        const side = i < 10 ? -1 : 1
        pts.push(
          side * (0.3 + Math.random() * 0.5),
          Math.random() * 0.5 + 0.9,
          (Math.random() - 0.5) * 0.15
        )
        cols.push(crimson.r, crimson.g, crimson.b)
      }

      // Legs
      for (let i = 0; i < 30; i++) {
        const side = i < 15 ? -0.15 : 0.15
        pts.push(
          side + (Math.random() - 0.5) * 0.12,
          Math.random() * 0.6,
          (Math.random() - 0.5) * 0.12
        )
        const c = Math.random() > 0.5 ? crimson : cyan
        cols.push(c.r, c.g, c.b)
      }

      return { positions: new Float32Array(pts), colors: new Float32Array(cols) }
    }

    return [
      { data: createFigure(), pos: [-8, 5, -10] as [number, number, number], vy: 0.4 },
      { data: createFigure(), pos: [12, 8, -14] as [number, number, number], vy: 0.3 },
      { data: createFigure(), pos: [-15, 12, -8] as [number, number, number], vy: 0.5 },
    ]
  }, [])

  useFrame((state, delta) => {
    if (!groupRef.current) return
    const dt = Math.min(delta, 0.05)
    groupRef.current.children.forEach((child, i) => {
      const fig = figures[i]
      child.position.y -= fig.vy * dt
      child.rotation.y = Math.sin(state.clock.elapsedTime * 0.3 + i) * 0.3
      // Reset when fallen
      if (child.position.y < -15) {
        child.position.y = 20 + Math.random() * 10
      }
    })
  })

  return (
    <group ref={groupRef}>
      {figures.map((fig, i) => {
        const geo = new THREE.BufferGeometry()
        geo.setAttribute('position', new THREE.BufferAttribute(fig.data.positions, 3))
        geo.setAttribute('color', new THREE.BufferAttribute(fig.data.colors, 3))
        return (
          <points key={i} geometry={geo} position={fig.pos}>
            <pointsMaterial
              size={0.12}
              vertexColors
              transparent
              opacity={0.7}
              sizeAttenuation
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </points>
        )
      })}
    </group>
  )
}

/* ── Ambient particle dust ── */
function ParticleDust({ count }: { count: number }) {
  const pointsRef = useRef<THREE.Points>(null!)

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)
    const palette = [DNA_COLOR_A, DNA_COLOR_B, GOLD, new THREE.Color('#FFFFFF')]

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 60
      positions[i * 3 + 1] = Math.random() * 40 - 15
      positions[i * 3 + 2] = (Math.random() - 0.5) * 40
      const c = palette[Math.floor(Math.random() * palette.length)]
      colors[i * 3] = c.r
      colors[i * 3 + 1] = c.g
      colors[i * 3 + 2] = c.b
    }
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    return geo
  }, [count])

  useFrame((state) => {
    if (!pointsRef.current) return
    const time = state.clock.elapsedTime
    const pos = pointsRef.current.geometry.attributes.position as THREE.BufferAttribute
    const arr = pos.array as Float32Array
    for (let i = 0; i < count; i++) {
      arr[i * 3 + 1] += Math.sin(time * 0.4 + i * 0.2) * 0.002
    }
    pos.needsUpdate = true
  })

  return (
    <points ref={pointsRef} geometry={geometry}>
      <pointsMaterial
        size={0.06}
        vertexColors
        transparent
        opacity={0.5}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  )
}

/* ── Infinite grid floor ── */
function GridFloor() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -10, -10]}>
      <planeGeometry args={[150, 150, 60, 60]} />
      <meshBasicMaterial color="#FF2D55" wireframe transparent opacity={0.04} />
    </mesh>
  )
}

/* ── Post-processing effects ── */
function PostFX() {
  const chromaticOffset = useMemo(() => new THREE.Vector2(0.0006, 0.0006), [])
  const glitchDelay = useMemo(() => new THREE.Vector2(8, 15), [])
  const glitchDuration = useMemo(() => new THREE.Vector2(0.08, 0.25), [])
  const glitchStrength = useMemo(() => new THREE.Vector2(0.008, 0.025), [])

  return (
    <EffectComposer multisampling={0}>
      <Bloom intensity={1.5} luminanceThreshold={0.12} luminanceSmoothing={0.9} mipmapBlur />
      <ChromaticAberration offset={chromaticOffset} blendFunction={BlendFunction.NORMAL} />
      <Scanline blendFunction={BlendFunction.OVERLAY} density={1.8} opacity={0.025} />
      <Noise opacity={0.018} blendFunction={BlendFunction.SOFT_LIGHT} />
      <Vignette offset={0.25} darkness={0.7} />
      <Glitch
        delay={glitchDelay}
        duration={glitchDuration}
        strength={glitchStrength}
        mode={GlitchMode.SPORADIC}
      />
    </EffectComposer>
  )
}

/* ── Scene composition ── */
function Scene({
  scrollData,
  mouseData,
  scrollProgress,
  isMobile,
}: {
  scrollData: { y: number }
  mouseData: { x: number; y: number }
  scrollProgress: number
  isMobile: boolean
}) {
  return (
    <>
      {/* Camera controller */}
      <CameraController mouseData={mouseData} scrollProgress={scrollProgress} />

      {/* Lighting */}
      <ambientLight intensity={0.1} color="#FFE4E1" />
      <pointLight position={[15, 15, 10]} intensity={0.9} color="#FF2D55" distance={50} />
      <pointLight position={[-15, 8, -10]} intensity={0.5} color="#00E5FF" distance={40} />
      <pointLight position={[0, -5, 5]} intensity={0.3} color="#FFD700" distance={30} />
      <pointLight position={[0, 20, 0]} intensity={0.2} color="#FF6B8A" distance={60} />
      <pointLight position={[-8, 3, 8]} intensity={0.15} color="#00E5FF" distance={25} />

      {/* Fog */}
      <fog attach="fog" args={['#050505', 6, 45]} />

      {/* Elements */}
      <CherryPetals count={isMobile ? 100 : 300} scrollData={scrollData} mouseData={mouseData} />
      <GlassShards count={isMobile ? 10 : 30} />
      {!isMobile && <DNAHelix />}
      {!isMobile && <StockRibbon />}
      {!isMobile && <PixelHumans />}
      <ParticleDust count={isMobile ? 50 : 160} />
      <GridFloor />

      {/* Post-processing — desktop only */}
      {!isMobile && <PostFX />}
    </>
  )
}

/* ── Exported wrapper ── */
export default function HeroScene({
  scrollData,
  mouseData,
  scrollProgress,
}: {
  scrollData: { y: number }
  mouseData: { x: number; y: number }
  scrollProgress: number
}) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }} aria-hidden="true">
      <Canvas
        camera={{ position: [0, 2, 15], fov: 60 }}
        dpr={[1, isMobile ? 1 : 1.5]}
        gl={{ antialias: !isMobile, powerPreference: 'high-performance', failIfMajorPerformanceCaveat: false }}
        style={{ background: '#050505' }}
        onCreated={({ gl }) => {
          const canvas = gl.domElement
          canvas.addEventListener('webglcontextlost', (e) => { e.preventDefault() })
          canvas.addEventListener('webglcontextrestored', () => { gl.setSize(canvas.clientWidth, canvas.clientHeight) })
        }}
      >
        <Scene
          scrollData={scrollData}
          mouseData={mouseData}
          scrollProgress={scrollProgress}
          isMobile={isMobile}
        />
      </Canvas>
    </div>
  )
}
