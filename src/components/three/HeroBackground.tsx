'use client'

import { useEffect, useRef } from 'react'

/* ── Pixel character sprites (8x12 grid — larger, more detailed) ── */
const SPRITES = [
  // Standing figure with hat
  [
    '...XX...',
    '..XXXX..',
    '.XXXXXX.',
    '..XXXX..',
    '..XXXX..',
    '.X.XX.X.',
    '...XX...',
    '..XXXX..',
    '..X..X..',
    '..X..X..',
    '.XX..XX.',
    '.XX..XX.',
  ],
  // Running figure
  [
    '..XXX...',
    '..XXXX..',
    '..XXX...',
    '..XXXX..',
    '.XXXXXX.',
    'X..XX...',
    '...XX...',
    '..XX.X..',
    '.XX...X.',
    '.X....X.',
    'XX......',
    'X.......',
  ],
  // Arms raised figure
  [
    '...XX...',
    '..XXXX..',
    '..XXXX..',
    'X.XXXX.X',
    'XX.XX.XX',
    '...XX...',
    '..XXXX..',
    '..XXXX..',
    '..X..X..',
    '..X..X..',
    '.XX..XX.',
    '.XX..XX.',
  ],
  // Sitting figure
  [
    '..XXX...',
    '..XXXX..',
    '..XXX...',
    '..XXXX..',
    '.XXXXXX.',
    '..XXXX..',
    '..XXXX..',
    '.XXXXXX.',
    'XXXXXXXX',
    '........',
    '........',
    '........',
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
  phase: number
}

interface Petal {
  x: number
  y: number
  vy: number
  vx: number
  rot: number
  rotV: number
  size: number
  opacity: number
  color: string
  wobblePhase: number
  wobbleAmp: number
}

interface PixelFigure {
  x: number
  y: number
  vy: number
  vx: number
  sprite: string[]
  color: string
  glow: string
  px: number
  opacity: number
  wobble: number
  wobbleV: number
  floatPhase: number
}

const BRAND = {
  crimson: '#FF2D55',
  cyan: '#00E5FF',
  gold: '#FFD700',
  pink: '#FF6B9D',
  purple: '#A855F7',
  green: '#00FF87',
}

const PETAL_COLORS = ['#FF2D55', '#FF6B8A', '#FFB7C5', '#FF4D7A', '#FFA0B4', '#FF8FAB']

export default function HeroBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef(0)
  const stateRef = useRef({
    particles: [] as Particle[],
    petals: [] as Petal[],
    figures: [] as PixelFigure[],
    mouse: { x: -1000, y: -1000 },
    t: 0,
    w: 0,
    h: 0,
  })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { alpha: false })
    if (!ctx) return
    const s = stateRef.current

    const setup = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      s.w = window.innerWidth
      s.h = window.innerHeight
      canvas.width = s.w * dpr
      canvas.height = s.h * dpr
      canvas.style.width = s.w + 'px'
      canvas.style.height = s.h + 'px'
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      // Particles
      const colors = Object.values(BRAND)
      s.particles = Array.from({ length: 100 }, () => ({
        x: Math.random() * s.w,
        y: Math.random() * s.h,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: 1.5 + Math.random() * 3,
        opacity: 0.3 + Math.random() * 0.5,
        color: colors[Math.floor(Math.random() * colors.length)],
        phase: Math.random() * Math.PI * 2,
      }))

      // Petals
      s.petals = Array.from({ length: 30 }, () => ({
        x: Math.random() * s.w,
        y: -20 - Math.random() * s.h,
        vy: 0.4 + Math.random() * 1.0,
        vx: -0.3 + Math.random() * 0.6,
        rot: Math.random() * Math.PI * 2,
        rotV: (Math.random() - 0.5) * 0.04,
        size: 5 + Math.random() * 10,
        opacity: 0.2 + Math.random() * 0.4,
        color: PETAL_COLORS[Math.floor(Math.random() * PETAL_COLORS.length)],
        wobblePhase: Math.random() * Math.PI * 2,
        wobbleAmp: 0.5 + Math.random() * 1.0,
      }))

      // Pixel figures — spread across width, different sizes
      const figColors = [
        { color: BRAND.crimson, glow: 'rgba(255,45,85,0.5)' },
        { color: BRAND.cyan, glow: 'rgba(0,229,255,0.5)' },
        { color: BRAND.gold, glow: 'rgba(255,215,0,0.5)' },
        { color: BRAND.purple, glow: 'rgba(168,85,247,0.5)' },
        { color: BRAND.pink, glow: 'rgba(255,107,157,0.5)' },
        { color: BRAND.green, glow: 'rgba(0,255,135,0.5)' },
        { color: BRAND.crimson, glow: 'rgba(255,45,85,0.4)' },
        { color: BRAND.cyan, glow: 'rgba(0,229,255,0.4)' },
      ]
      s.figures = figColors.map((fc, i) => ({
        x: (s.w / (figColors.length + 1)) * (i + 1) + (Math.random() - 0.5) * 80,
        y: -100 - Math.random() * s.h * 1.5,
        vy: 0.3 + Math.random() * 0.5,
        vx: (Math.random() - 0.5) * 0.15,
        sprite: SPRITES[Math.floor(Math.random() * SPRITES.length)],
        ...fc,
        px: 6 + Math.random() * 6, // pixel size 6-12
        opacity: 0.5 + Math.random() * 0.4,
        wobble: 0,
        wobbleV: 0.008 + Math.random() * 0.012,
        floatPhase: Math.random() * Math.PI * 2,
      }))
    }

    setup()
    window.addEventListener('resize', setup)

    const onMouse = (e: MouseEvent) => {
      s.mouse = { x: e.clientX, y: e.clientY }
    }
    window.addEventListener('mousemove', onMouse)

    const drawPetal = (p: Petal) => {
      ctx.save()
      ctx.translate(p.x, p.y)
      ctx.rotate(p.rot)
      ctx.globalAlpha = p.opacity
      ctx.shadowColor = p.color
      ctx.shadowBlur = 12
      ctx.fillStyle = p.color
      ctx.beginPath()
      ctx.moveTo(0, -p.size * 0.5)
      ctx.bezierCurveTo(p.size * 0.6, -p.size * 0.3, p.size * 0.5, p.size * 0.4, 0, p.size * 0.6)
      ctx.bezierCurveTo(-p.size * 0.5, p.size * 0.4, -p.size * 0.6, -p.size * 0.3, 0, -p.size * 0.5)
      ctx.fill()
      ctx.restore()
    }

    const drawFigure = (fig: PixelFigure) => {
      ctx.save()
      ctx.globalAlpha = fig.opacity
      ctx.shadowColor = fig.glow
      ctx.shadowBlur = 25

      const spriteW = fig.sprite[0].length * fig.px
      const spriteH = fig.sprite.length * fig.px
      const cx = fig.x - spriteW / 2

      for (let r = 0; r < fig.sprite.length; r++) {
        for (let c = 0; c < fig.sprite[r].length; c++) {
          if (fig.sprite[r][c] === 'X') {
            const wobbleX = Math.sin(fig.wobble + r * 0.4) * 2
            ctx.fillStyle = fig.color
            ctx.fillRect(
              cx + c * fig.px + wobbleX,
              fig.y + r * fig.px,
              fig.px - 1,
              fig.px - 1
            )
          }
        }
      }

      // Reflection/trail below figure
      ctx.globalAlpha = fig.opacity * 0.15
      ctx.shadowBlur = 0
      for (let r = 0; r < Math.min(4, fig.sprite.length); r++) {
        for (let c = 0; c < fig.sprite[r].length; c++) {
          if (fig.sprite[r][c] === 'X') {
            ctx.fillStyle = fig.color
            ctx.fillRect(
              cx + c * fig.px,
              fig.y + spriteH + r * fig.px * 0.7,
              fig.px - 1,
              fig.px - 1
            )
          }
        }
      }
      ctx.restore()
    }

    const frame = () => {
      s.t++
      const { w, h, t } = s

      // Clear with bg color
      ctx.fillStyle = '#050505'
      ctx.fillRect(0, 0, w, h)

      // ── Radial ambient glow ──
      const rg = ctx.createRadialGradient(w * 0.5, h * 0.35, 0, w * 0.5, h * 0.35, w * 0.7)
      rg.addColorStop(0, 'rgba(255,45,85,0.06)')
      rg.addColorStop(0.4, 'rgba(168,85,247,0.03)')
      rg.addColorStop(0.7, 'rgba(0,229,255,0.02)')
      rg.addColorStop(1, 'transparent')
      ctx.fillStyle = rg
      ctx.fillRect(0, 0, w, h)

      // ── Slow moving aurora streaks ──
      ctx.globalAlpha = 1
      const auroraColors = [
        ['rgba(255,45,85,0.06)', 'rgba(168,85,247,0.04)'],
        ['rgba(0,229,255,0.05)', 'rgba(255,215,0,0.03)'],
        ['rgba(255,107,157,0.04)', 'rgba(0,229,255,0.03)'],
      ]
      for (let i = 0; i < 3; i++) {
        const xOff = Math.sin(t * 0.002 + i * 2.1) * w * 0.2
        const yBase = h * (0.15 + i * 0.25) + Math.sin(t * 0.003 + i * 1.5) * 40
        const ag = ctx.createLinearGradient(xOff, yBase, w + xOff, yBase)
        ag.addColorStop(0, 'transparent')
        ag.addColorStop(0.2, auroraColors[i][0])
        ag.addColorStop(0.5, auroraColors[i][1])
        ag.addColorStop(0.8, auroraColors[i][0])
        ag.addColorStop(1, 'transparent')
        ctx.fillStyle = ag
        ctx.fillRect(0, yBase - 80, w, 160)
      }

      // ── Grid floor ──
      ctx.strokeStyle = 'rgba(255,45,85,0.06)'
      ctx.lineWidth = 0.5
      const vanishY = h * 0.45
      const gridBottom = h * 1.2
      // Horizontal lines
      for (let i = 0; i < 25; i++) {
        const p = i / 25
        const y = vanishY + (gridBottom - vanishY) * Math.pow(p, 1.8)
        ctx.globalAlpha = 0.15 + p * 0.6
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(w, y)
        ctx.stroke()
      }
      // Vertical lines converging to vanishing point
      for (let i = -12; i <= 12; i++) {
        const x = w * 0.5 + i * (w / 14)
        ctx.globalAlpha = 0.1
        ctx.beginPath()
        ctx.moveTo(w * 0.5, vanishY)
        ctx.lineTo(x, h + 100)
        ctx.stroke()
      }
      ctx.globalAlpha = 1

      // ── Particles ──
      for (const p of s.particles) {
        p.x += p.vx
        p.y += p.vy

        // Mouse repulsion
        const dx = p.x - s.mouse.x
        const dy = p.y - s.mouse.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < 150 && dist > 0) {
          const force = (150 - dist) / 150 * 0.8
          p.vx += (dx / dist) * force
          p.vy += (dy / dist) * force
        }
        p.vx *= 0.985
        p.vy *= 0.985

        // Wrap
        if (p.x < -10) p.x = w + 10
        if (p.x > w + 10) p.x = -10
        if (p.y < -10) p.y = h + 10
        if (p.y > h + 10) p.y = -10

        const flicker = Math.sin(t * 0.015 + p.phase) * 0.3 + 0.7
        ctx.globalAlpha = p.opacity * flicker
        ctx.fillStyle = p.color
        ctx.shadowColor = p.color
        ctx.shadowBlur = p.size * 4
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.shadowBlur = 0

      // ── Particle connections ──
      ctx.lineWidth = 0.4
      for (let i = 0; i < s.particles.length; i++) {
        const a = s.particles[i]
        for (let j = i + 1; j < s.particles.length; j++) {
          const b = s.particles[j]
          const dx = a.x - b.x
          const dy = a.y - b.y
          const d = dx * dx + dy * dy
          if (d < 12000) { // ~110px
            ctx.globalAlpha = (1 - Math.sqrt(d) / 110) * 0.1
            ctx.strokeStyle = a.color
            ctx.beginPath()
            ctx.moveTo(a.x, a.y)
            ctx.lineTo(b.x, b.y)
            ctx.stroke()
          }
        }
      }
      ctx.globalAlpha = 1

      // ── Cherry blossom petals ──
      for (const p of s.petals) {
        p.y += p.vy
        p.x += p.vx + Math.sin(t * 0.01 + p.wobblePhase) * p.wobbleAmp
        p.rot += p.rotV
        if (p.y > h + 30) {
          p.y = -30
          p.x = Math.random() * w
        }
        drawPetal(p)
      }

      // ── Pixel figures ──
      for (const fig of s.figures) {
        fig.y += fig.vy
        fig.x += fig.vx + Math.sin(t * 0.005 + fig.floatPhase) * 0.3
        fig.wobble += fig.wobbleV
        const spriteH = fig.sprite.length * fig.px
        if (fig.y > h + spriteH + 50) {
          fig.y = -spriteH - 100 - Math.random() * 300
          fig.x = Math.random() * w
          fig.sprite = SPRITES[Math.floor(Math.random() * SPRITES.length)]
          fig.px = 5 + Math.random() * 4
        }
        drawFigure(fig)
      }

      // ── Scanline ──
      const scanY = (t * 2) % (h + 60) - 30
      const sg = ctx.createLinearGradient(0, scanY - 20, 0, scanY + 20)
      sg.addColorStop(0, 'transparent')
      sg.addColorStop(0.5, 'rgba(0,229,255,0.04)')
      sg.addColorStop(1, 'transparent')
      ctx.fillStyle = sg
      ctx.fillRect(0, scanY - 20, w, 40)

      // ── Vignette overlay ──
      const vg = ctx.createRadialGradient(w * 0.5, h * 0.5, w * 0.2, w * 0.5, h * 0.5, w * 0.85)
      vg.addColorStop(0, 'transparent')
      vg.addColorStop(1, 'rgba(5,5,5,0.6)')
      ctx.fillStyle = vg
      ctx.fillRect(0, 0, w, h)

      animRef.current = requestAnimationFrame(frame)
    }

    animRef.current = requestAnimationFrame(frame)

    return () => {
      cancelAnimationFrame(animRef.current)
      window.removeEventListener('resize', setup)
      window.removeEventListener('mousemove', onMouse)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
      }}
      aria-hidden="true"
    />
  )
}
