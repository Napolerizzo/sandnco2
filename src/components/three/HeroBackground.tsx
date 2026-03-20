'use client'

import { useEffect, useRef, useCallback } from 'react'

/* ── Pixel character sprite data (5x7 grid each) ── */
const PIXEL_HUMANS = [
  // Standing figure
  [
    '..X..',
    '.XXX.',
    '..X..',
    '.XXX.',
    'X.X.X',
    '..X..',
    '.X.X.',
  ],
  // Walking figure
  [
    '..X..',
    '.XXX.',
    '..X..',
    '.XXX.',
    'X.X..',
    '..X..',
    '.X..X',
  ],
  // Arms-up figure
  [
    '..X..',
    '.XXX.',
    'X.X.X',
    '..X..',
    '.XXX.',
    '..X..',
    '.X.X.',
  ],
]

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  opacity: number
  color: string
  life: number
  maxLife: number
}

interface Petal {
  x: number
  y: number
  vy: number
  vx: number
  rotation: number
  rotSpeed: number
  size: number
  opacity: number
  color: string
  wobblePhase: number
  wobbleSpeed: number
}

interface PixelFigure {
  x: number
  y: number
  vy: number
  sprite: string[]
  color: string
  glowColor: string
  pixelSize: number
  opacity: number
  wobble: number
  wobbleSpeed: number
}

const COLORS = {
  crimson: '#FF2D55',
  cyan: '#00E5FF',
  gold: '#FFD700',
  pink: '#FF6B8A',
  purple: '#A855F7',
}

const PETAL_COLORS = ['#FF2D55', '#FF6B8A', '#FFB7C5', '#FF4D7A', '#FFA0B4']

export default function HeroBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number>(0)
  const particlesRef = useRef<Particle[]>([])
  const petalsRef = useRef<Petal[]>([])
  const figuresRef = useRef<PixelFigure[]>([])
  const mouseRef = useRef({ x: 0, y: 0 })
  const timeRef = useRef(0)

  const initParticles = useCallback((w: number, h: number) => {
    const particles: Particle[] = []
    const colorKeys = Object.values(COLORS)
    for (let i = 0; i < 120; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.5 + 0.1,
        color: colorKeys[Math.floor(Math.random() * colorKeys.length)],
        life: Math.random() * 1000,
        maxLife: 500 + Math.random() * 500,
      })
    }
    particlesRef.current = particles
  }, [])

  const initPetals = useCallback((w: number, h: number) => {
    const petals: Petal[] = []
    for (let i = 0; i < 40; i++) {
      petals.push({
        x: Math.random() * w,
        y: Math.random() * h - h * 0.3,
        vy: 0.3 + Math.random() * 0.8,
        vx: (Math.random() - 0.5) * 0.5,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.03,
        size: 4 + Math.random() * 8,
        opacity: 0.15 + Math.random() * 0.35,
        color: PETAL_COLORS[Math.floor(Math.random() * PETAL_COLORS.length)],
        wobblePhase: Math.random() * Math.PI * 2,
        wobbleSpeed: 0.01 + Math.random() * 0.02,
      })
    }
    petalsRef.current = petals
  }, [])

  const initFigures = useCallback((w: number, h: number) => {
    const figures: PixelFigure[] = []
    const configs = [
      { x: w * 0.12, y: -50, color: COLORS.crimson, glowColor: 'rgba(255,45,85,0.3)', pixelSize: 4, vy: 0.35 },
      { x: w * 0.85, y: -200, color: COLORS.cyan, glowColor: 'rgba(0,229,255,0.3)', pixelSize: 3.5, vy: 0.28 },
      { x: w * 0.35, y: -400, color: COLORS.gold, glowColor: 'rgba(255,215,0,0.3)', pixelSize: 5, vy: 0.4 },
      { x: w * 0.65, y: -150, color: COLORS.purple, glowColor: 'rgba(168,85,247,0.3)', pixelSize: 3, vy: 0.32 },
      { x: w * 0.92, y: -350, color: COLORS.pink, glowColor: 'rgba(255,107,138,0.3)', pixelSize: 4.5, vy: 0.38 },
      { x: w * 0.05, y: -500, color: COLORS.crimson, glowColor: 'rgba(255,45,85,0.25)', pixelSize: 3, vy: 0.3 },
    ]
    for (const cfg of configs) {
      figures.push({
        ...cfg,
        sprite: PIXEL_HUMANS[Math.floor(Math.random() * PIXEL_HUMANS.length)],
        opacity: 0.6 + Math.random() * 0.3,
        wobble: 0,
        wobbleSpeed: 0.005 + Math.random() * 0.01,
      })
    }
    figuresRef.current = figures
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = window.innerWidth * dpr
      canvas.height = window.innerHeight * dpr
      canvas.style.width = window.innerWidth + 'px'
      canvas.style.height = window.innerHeight + 'px'
      ctx.scale(dpr, dpr)
      initParticles(window.innerWidth, window.innerHeight)
      initPetals(window.innerWidth, window.innerHeight)
      initFigures(window.innerWidth, window.innerHeight)
    }
    resize()
    window.addEventListener('resize', resize)

    const onMouse = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY }
    }
    window.addEventListener('mousemove', onMouse)

    const w = () => window.innerWidth
    const h = () => window.innerHeight

    const drawPetal = (ctx: CanvasRenderingContext2D, petal: Petal) => {
      ctx.save()
      ctx.translate(petal.x, petal.y)
      ctx.rotate(petal.rotation)
      ctx.globalAlpha = petal.opacity
      ctx.fillStyle = petal.color
      ctx.beginPath()
      // Petal shape
      ctx.moveTo(0, -petal.size * 0.5)
      ctx.bezierCurveTo(
        petal.size * 0.5, -petal.size * 0.3,
        petal.size * 0.4, petal.size * 0.3,
        0, petal.size * 0.5
      )
      ctx.bezierCurveTo(
        -petal.size * 0.4, petal.size * 0.3,
        -petal.size * 0.5, -petal.size * 0.3,
        0, -petal.size * 0.5
      )
      ctx.fill()
      // Glow
      ctx.shadowColor = petal.color
      ctx.shadowBlur = 8
      ctx.fill()
      ctx.restore()
    }

    const drawPixelFigure = (ctx: CanvasRenderingContext2D, fig: PixelFigure) => {
      ctx.save()
      ctx.globalAlpha = fig.opacity
      // Glow behind figure
      ctx.shadowColor = fig.glowColor
      ctx.shadowBlur = 20
      for (let row = 0; row < fig.sprite.length; row++) {
        for (let col = 0; col < fig.sprite[row].length; col++) {
          if (fig.sprite[row][col] === 'X') {
            ctx.fillStyle = fig.color
            ctx.fillRect(
              fig.x + col * fig.pixelSize + Math.sin(fig.wobble + row * 0.3) * 1.5,
              fig.y + row * fig.pixelSize,
              fig.pixelSize - 0.5,
              fig.pixelSize - 0.5
            )
          }
        }
      }
      ctx.restore()
    }

    const animate = () => {
      timeRef.current += 1
      const t = timeRef.current
      ctx.clearRect(0, 0, w(), h())

      // ── Background gradient ──
      const grad = ctx.createRadialGradient(w() * 0.5, h() * 0.4, 0, w() * 0.5, h() * 0.4, w() * 0.8)
      grad.addColorStop(0, 'rgba(255,45,85,0.04)')
      grad.addColorStop(0.3, 'rgba(168,85,247,0.02)')
      grad.addColorStop(0.6, 'rgba(0,229,255,0.015)')
      grad.addColorStop(1, 'transparent')
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, w(), h())

      // ── Aurora bands ──
      for (let i = 0; i < 3; i++) {
        const auroraGrad = ctx.createLinearGradient(0, 0, w(), 0)
        const offset = Math.sin(t * 0.003 + i * 2) * w() * 0.15
        const yBase = h() * (0.2 + i * 0.2) + Math.sin(t * 0.005 + i) * 30
        auroraGrad.addColorStop(0, 'transparent')
        auroraGrad.addColorStop(0.3, i === 0 ? 'rgba(255,45,85,0.03)' : i === 1 ? 'rgba(0,229,255,0.025)' : 'rgba(255,215,0,0.02)')
        auroraGrad.addColorStop(0.7, i === 0 ? 'rgba(168,85,247,0.025)' : i === 1 ? 'rgba(255,45,85,0.02)' : 'rgba(0,229,255,0.015)')
        auroraGrad.addColorStop(1, 'transparent')
        ctx.fillStyle = auroraGrad
        ctx.fillRect(offset, yBase - 60, w(), 120)
      }

      // ── Grid floor (perspective) ──
      ctx.strokeStyle = 'rgba(255,45,85,0.04)'
      ctx.lineWidth = 0.5
      const gridY = h() * 0.75
      const vanishY = h() * 0.4
      for (let i = 0; i < 20; i++) {
        const progress = i / 20
        const y = vanishY + (gridY - vanishY + h() * 0.5) * Math.pow(progress, 1.5)
        ctx.globalAlpha = 0.3 + progress * 0.7
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(w(), y)
        ctx.stroke()
      }
      for (let i = -10; i <= 10; i++) {
        const x = w() * 0.5 + i * (w() / 12)
        ctx.globalAlpha = 0.15
        ctx.beginPath()
        ctx.moveTo(w() * 0.5, vanishY)
        ctx.lineTo(x, h())
        ctx.stroke()
      }
      ctx.globalAlpha = 1

      // ── Particles ──
      for (const p of particlesRef.current) {
        p.x += p.vx
        p.y += p.vy
        p.life += 1
        // Mouse repulsion
        const dx = p.x - mouseRef.current.x
        const dy = p.y - mouseRef.current.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < 120) {
          const force = (120 - dist) / 120 * 0.5
          p.vx += (dx / dist) * force
          p.vy += (dy / dist) * force
        }
        // Damping
        p.vx *= 0.99
        p.vy *= 0.99
        // Wrap
        if (p.x < 0) p.x = w()
        if (p.x > w()) p.x = 0
        if (p.y < 0) p.y = h()
        if (p.y > h()) p.y = 0

        const flicker = Math.sin(t * 0.02 + p.life * 0.1) * 0.2 + 0.8
        ctx.globalAlpha = p.opacity * flicker
        ctx.fillStyle = p.color
        ctx.shadowColor = p.color
        ctx.shadowBlur = p.size * 3
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.shadowBlur = 0
      ctx.globalAlpha = 1

      // ── Cherry blossom petals ──
      for (const petal of petalsRef.current) {
        petal.y += petal.vy
        petal.x += petal.vx + Math.sin(t * petal.wobbleSpeed + petal.wobblePhase) * 0.5
        petal.rotation += petal.rotSpeed
        if (petal.y > h() + 20) {
          petal.y = -20
          petal.x = Math.random() * w()
        }
        drawPetal(ctx, petal)
      }

      // ── Pixel figures (falling) ──
      for (const fig of figuresRef.current) {
        fig.y += fig.vy
        fig.wobble += fig.wobbleSpeed
        if (fig.y > h() + 60) {
          fig.y = -80 - Math.random() * 200
          fig.x = Math.random() * w()
          fig.sprite = PIXEL_HUMANS[Math.floor(Math.random() * PIXEL_HUMANS.length)]
        }
        drawPixelFigure(ctx, fig)
      }

      // ── Connecting lines between close particles ──
      ctx.lineWidth = 0.3
      for (let i = 0; i < particlesRef.current.length; i++) {
        for (let j = i + 1; j < particlesRef.current.length; j++) {
          const a = particlesRef.current[i]
          const b = particlesRef.current[j]
          const dx = a.x - b.x
          const dy = a.y - b.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 100) {
            ctx.globalAlpha = (1 - dist / 100) * 0.06
            ctx.strokeStyle = a.color
            ctx.beginPath()
            ctx.moveTo(a.x, a.y)
            ctx.lineTo(b.x, b.y)
            ctx.stroke()
          }
        }
      }
      ctx.globalAlpha = 1

      // ── Scanline effect ──
      const scanY = (t * 1.5) % (h() + 40) - 20
      const scanGrad = ctx.createLinearGradient(0, scanY - 15, 0, scanY + 15)
      scanGrad.addColorStop(0, 'transparent')
      scanGrad.addColorStop(0.5, 'rgba(255,45,85,0.03)')
      scanGrad.addColorStop(1, 'transparent')
      ctx.fillStyle = scanGrad
      ctx.fillRect(0, scanY - 15, w(), 30)

      animRef.current = requestAnimationFrame(animate)
    }

    animRef.current = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(animRef.current)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', onMouse)
    }
  }, [initParticles, initPetals, initFigures])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        background: '#050505',
      }}
      aria-hidden="true"
    />
  )
}
