'use client'

import { useRef, useMemo, useEffect, useState, useCallback } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import * as THREE from 'three'

/* ── Device shape as instanced cubes that can shatter ── */
function DeviceShape({ isMobile, timeline }: { isMobile: boolean; timeline: React.MutableRefObject<number> }) {
  const groupRef = useRef<THREE.Group>(null!)
  const meshRef = useRef<THREE.InstancedMesh>(null!)
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const [shattered, setShattered] = useState(false)

  // Build device from small cubes
  const cubeSize = 0.08
  const cubes = useMemo(() => {
    const result: { x: number; y: number; z: number; vx: number; vy: number; vz: number }[] = []

    if (isMobile) {
      // Phone shape: 1 x 1.8 x 0.08
      for (let x = -0.48; x <= 0.48; x += cubeSize * 1.2) {
        for (let y = -0.88; y <= 0.88; y += cubeSize * 1.2) {
          // Frame edges only (not filled)
          const isEdge = Math.abs(x) > 0.38 || Math.abs(y) > 0.78 ||
            (Math.abs(x) < 0.42 && Math.abs(y) < 0.82 && (Math.abs(x) > 0.34 || Math.abs(y) > 0.74))
          // Screen fill
          const isScreen = Math.abs(x) < 0.36 && Math.abs(y) < 0.72
          if (isEdge || isScreen) {
            result.push({
              x, y, z: isScreen ? 0.04 : 0,
              vx: (Math.random() - 0.5) * 8,
              vy: (Math.random() - 0.5) * 8,
              vz: (Math.random() - 0.5) * 8 + 2,
            })
          }
        }
      }
    } else {
      // Monitor shape: 2.2 x 1.4 screen + stand
      for (let x = -1.08; x <= 1.08; x += cubeSize * 1.3) {
        for (let y = -0.2; y <= 1.1; y += cubeSize * 1.3) {
          const isEdge = Math.abs(x) > 0.98 || y > 1.0 || y < -0.1 ||
            (Math.abs(x) < 1.02 && y < 1.04 && y > -0.14 && (Math.abs(x) > 0.92 || y > 0.94 || y < -0.04))
          const isScreen = Math.abs(x) < 0.94 && y > -0.02 && y < 0.96
          if (isEdge || isScreen) {
            result.push({
              x, y: y + 0.2, z: isScreen ? 0.03 : 0,
              vx: (Math.random() - 0.5) * 10,
              vy: (Math.random() - 0.5) * 10,
              vz: (Math.random() - 0.5) * 10 + 3,
            })
          }
        }
        // Stand
        if (Math.abs(x) < 0.15) {
          result.push({
            x, y: -0.3, z: 0,
            vx: (Math.random() - 0.5) * 4,
            vy: -Math.random() * 6,
            vz: (Math.random() - 0.5) * 4,
          })
        }
      }
      // Base
      for (let x = -0.5; x <= 0.5; x += cubeSize * 1.3) {
        result.push({
          x, y: -0.4, z: 0.1,
          vx: (Math.random() - 0.5) * 6,
          vy: -Math.random() * 4,
          vz: (Math.random() - 0.5) * 6,
        })
      }
    }
    return result
  }, [isMobile])

  // Per-cube state for shatter animation
  const shatterState = useRef(cubes.map(() => ({ ox: 0, oy: 0, oz: 0 })))

  useEffect(() => {
    if (!meshRef.current) return
    const colors = new Float32Array(cubes.length * 3)
    const frameDark = new THREE.Color('#1A1A1A')
    const screenCrimson = new THREE.Color('#FF2D55')
    const screenCyan = new THREE.Color('#00E5FF')

    for (let i = 0; i < cubes.length; i++) {
      const c = cubes[i]
      const isScreen = c.z > 0.01
      if (isScreen) {
        const sc = Math.random() > 0.4 ? screenCrimson : screenCyan
        colors[i * 3] = sc.r
        colors[i * 3 + 1] = sc.g
        colors[i * 3 + 2] = sc.b
      } else {
        colors[i * 3] = frameDark.r
        colors[i * 3 + 1] = frameDark.g
        colors[i * 3 + 2] = frameDark.b
      }
    }
    meshRef.current.geometry.setAttribute('color', new THREE.InstancedBufferAttribute(colors, 3))
  }, [cubes])

  useFrame((state, delta) => {
    if (!meshRef.current || !groupRef.current) return
    const t = timeline.current
    const dt = Math.min(delta, 0.05)

    // Phase 1 (0-1.5s): Materialize — scale from 0 to 1
    const materialize = Math.min(1, t / 1.5)
    const scaleVal = THREE.MathUtils.smoothstep(materialize, 0, 1)

    // Phase 2 (1.5-3s): Rotate 360°
    const rotateProgress = Math.max(0, Math.min(1, (t - 1.5) / 1.5))
    const rotation = rotateProgress * Math.PI * 2

    // Phase 3 (3.5-4.5s): Shatter
    const shatterProgress = Math.max(0, Math.min(1, (t - 3.5) / 1.0))

    if (shatterProgress > 0 && !shattered) setShattered(true)

    groupRef.current.rotation.y = rotation
    groupRef.current.scale.setScalar(scaleVal * (isMobile ? 2.5 : 1.5))

    for (let i = 0; i < cubes.length; i++) {
      const c = cubes[i]
      const ss = shatterState.current[i]

      if (shatterProgress > 0) {
        ss.ox += c.vx * dt * shatterProgress * 2
        ss.oy += c.vy * dt * shatterProgress * 2
        ss.oz += c.vz * dt * shatterProgress * 2
      }

      dummy.position.set(
        c.x + ss.ox,
        c.y + ss.oy,
        c.z + ss.oz
      )
      dummy.scale.setScalar(cubeSize * (1 - shatterProgress * 0.5))
      dummy.rotation.set(
        ss.ox * 2,
        ss.oy * 2,
        ss.oz * 2
      )
      dummy.updateMatrix()
      meshRef.current.setMatrixAt(i, dummy.matrix)
    }
    meshRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <group ref={groupRef}>
      <instancedMesh ref={meshRef} args={[undefined, undefined, cubes.length]}>
        <boxGeometry args={[cubeSize, cubeSize, cubeSize]} />
        <meshStandardMaterial
          vertexColors
          emissive="#FF2D55"
          emissiveIntensity={0.3}
          metalness={0.6}
          roughness={0.3}
        />
      </instancedMesh>
    </group>
  )
}

/* ── Floating text on device screen ── */
function ScreenText({ timeline }: { timeline: React.MutableRefObject<number> }) {
  const textRef = useRef<THREE.Mesh>(null!)

  useFrame(() => {
    if (!textRef.current) return
    const t = timeline.current
    // Visible between 2.5s and 3.5s
    const show = t > 2.5 && t < 3.8
    textRef.current.visible = show
    if (show) {
      const pulse = Math.sin(t * 8) * 0.1 + 1
      textRef.current.scale.setScalar(pulse * 0.4)
    }
  })

  return (
    <Text
      ref={textRef}
      fontSize={0.5}
      color="#FF2D55"
      anchorX="center"
      anchorY="middle"
      position={[0, 0.3, 0.5]}
      font="https://fonts.gstatic.com/s/syne/v22/8vIS7w4qzmVxsWxjBZRjr0FKM_04uT6kR47NCV5Z.woff2"
    >
      SANDNCO
      <meshStandardMaterial
        color="#FF2D55"
        emissive="#FF2D55"
        emissiveIntensity={1}
        toneMapped={false}
      />
    </Text>
  )
}

/* ── Camera controller ── */
function CameraRig({ timeline }: { timeline: React.MutableRefObject<number> }) {
  const { camera } = useThree()

  useFrame(() => {
    const t = timeline.current
    // Subtle camera breathing
    camera.position.x = Math.sin(t * 0.5) * 0.3
    camera.position.y = Math.cos(t * 0.3) * 0.2 + 0.3
    camera.position.z = 5 - Math.min(t * 0.1, 0.5)
    camera.lookAt(0, 0.2, 0)
  })

  return null
}

/* ── Intro Scene ── */
function IntroScene({ isMobile, timeline }: { isMobile: boolean; timeline: React.MutableRefObject<number> }) {
  return (
    <>
      <ambientLight intensity={0.1} />
      <pointLight position={[3, 3, 5]} intensity={0.8} color="#FF2D55" distance={20} />
      <pointLight position={[-3, 2, 3]} intensity={0.4} color="#00E5FF" distance={15} />
      <pointLight position={[0, -2, 3]} intensity={0.2} color="#FFD700" distance={10} />
      <fog attach="fog" args={['#000000', 3, 15]} />

      <DeviceShape isMobile={isMobile} timeline={timeline} />
      <ScreenText timeline={timeline} />
      <CameraRig timeline={timeline} />
    </>
  )
}

/* ── Main export ── */
export default function IntroAnimation({ onComplete }: { onComplete: () => void }) {
  const [isMobile, setIsMobile] = useState(false)
  const [fadingOut, setFadingOut] = useState(false)
  const timeline = useRef(0)
  const frameRef = useRef<number>(0)
  const startTime = useRef(0)

  useEffect(() => {
    setIsMobile(window.innerWidth < 768)
  }, [])

  // Timeline driver (runs outside R3F)
  useEffect(() => {
    startTime.current = performance.now()
    const tick = () => {
      timeline.current = (performance.now() - startTime.current) / 1000

      // Start fade at 4.5s
      if (timeline.current > 4.5 && !fadingOut) {
        setFadingOut(true)
      }

      // Complete at 5.3s
      if (timeline.current > 5.3) {
        onComplete()
        return
      }
      frameRef.current = requestAnimationFrame(tick)
    }
    frameRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frameRef.current)
  }, [onComplete, fadingOut])

  const handleSkip = useCallback(() => {
    onComplete()
  }, [onComplete])

  return (
    <div className={`intro-overlay ${fadingOut ? 'fade-out' : ''}`}>
      <Canvas
        camera={{ position: [0, 0.3, 5], fov: 50 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
        style={{ background: '#000' }}
      >
        <IntroScene isMobile={isMobile} timeline={timeline} />
      </Canvas>

      {/* Loading text */}
      <div style={{
        position: 'absolute',
        bottom: 80,
        left: '50%',
        transform: 'translateX(-50%)',
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 10,
        letterSpacing: '0.3em',
        textTransform: 'uppercase',
        color: '#2A2A2A',
        animation: 'text-flicker 2s infinite',
      }}>
        initializing
      </div>

      <button className="intro-skip" onClick={handleSkip}>
        Skip
      </button>
    </div>
  )
}
