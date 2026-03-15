import type { PfpStyle } from '@/lib/ranks'
import { PFP_STYLES } from '@/lib/ranks'

/**
 * Vector SVG avatars — each style has a unique geometric design.
 * Used on signup avatar picker and profile pages.
 */
export function AvatarSVG({ style, size = 64 }: { style: PfpStyle; size?: number }) {
  const data = PFP_STYLES[style]
  const g0 = data.gradient[0]
  const g1 = data.gradient[1]
  const id = `ag-${style}`

  return (
    <svg viewBox="0 0 100 100" width={size} height={size} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={g0} />
          <stop offset="100%" stopColor={g1} />
        </linearGradient>
        <linearGradient id={`${id}-r`} x1="100%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor={g0} stopOpacity="0.4" />
          <stop offset="100%" stopColor={g1} stopOpacity="0.15" />
        </linearGradient>
      </defs>
      {AVATAR_SHAPES[style](id, g0, g1)}
    </svg>
  )
}

type ShapeFn = (id: string, g0: string, g1: string) => React.ReactNode

const AVATAR_SHAPES: Record<PfpStyle, ShapeFn> = {
  // Concentric orb — pulsing circles
  neon_orb: (id) => (
    <>
      <circle cx="50" cy="50" r="50" fill={`url(#${id}-r)`} />
      <circle cx="50" cy="50" r="38" fill={`url(#${id})`} opacity="0.9" />
      <circle cx="50" cy="50" r="28" fill="none" stroke={`url(#${id})`} strokeWidth="2" opacity="0.6" />
      <circle cx="50" cy="50" r="18" fill="none" stroke={`url(#${id})`} strokeWidth="1.5" opacity="0.4" />
      <circle cx="50" cy="50" r="10" fill="white" opacity="0.15" />
      <circle cx="42" cy="42" r="5" fill="white" opacity="0.2" />
    </>
  ),

  // Pixel grid face
  pixel_beast: (id, g0, g1) => {
    const grid = [
      [0,1,0,1,0],
      [1,1,1,1,1],
      [1,0,1,0,1],
      [1,1,1,1,1],
      [0,1,1,1,0],
    ]
    return (
      <>
        <rect x="0" y="0" width="100" height="100" fill={`url(#${id}-r)`} />
        {grid.map((row, ri) =>
          row.map((cell, ci) => cell ? (
            <rect
              key={`${ri}-${ci}`}
              x={10 + ci * 16}
              y={10 + ri * 16}
              width={14}
              height={14}
              fill={`url(#${id})`}
              opacity={0.7 + (ri + ci) * 0.03}
              rx="1"
            />
          ) : null)
        )}
        {/* Eyes */}
        <rect x="26" y="26" width="10" height="10" fill="white" opacity="0.9" rx="1" />
        <rect x="64" y="26" width="10" height="10" fill="white" opacity="0.9" rx="1" />
      </>
    )
  },

  // Glitch portrait — fragmented rectangles
  glitch_portrait: (id) => (
    <>
      <rect x="0" y="0" width="100" height="100" fill={`url(#${id}-r)`} />
      {/* Face shape */}
      <rect x="25" y="15" width="50" height="65" fill={`url(#${id})`} opacity="0.85" rx="4" />
      {/* Glitch slices */}
      <rect x="20" y="32" width="55" height="8" fill={`url(#${id})`} opacity="0.7" />
      <rect x="30" y="40" width="45" height="5" fill={`url(#${id})`} opacity="0.5" />
      <rect x="15" y="55" width="60" height="6" fill={`url(#${id})`} opacity="0.6" />
      {/* Offset glitch strip */}
      <rect x="35" y="70" width="40" height="4" fill="white" opacity="0.3" />
      <rect x="28" y="75" width="50" height="3" fill="white" opacity="0.2" />
      {/* Eyes */}
      <circle cx="38" cy="40" r="5" fill="white" opacity="0.85" />
      <circle cx="62" cy="40" r="5" fill="white" opacity="0.85" />
    </>
  ),

  // ASCII matrix — grid of dots/lines
  ascii_god: (id, g0) => (
    <>
      <rect x="0" y="0" width="100" height="100" fill={`url(#${id}-r)`} />
      {Array.from({ length: 7 }).map((_, row) =>
        Array.from({ length: 7 }).map((_, col) => (
          <circle
            key={`${row}-${col}`}
            cx={10 + col * 14}
            cy={10 + row * 14}
            r={(row + col) % 3 === 0 ? 3 : 1.5}
            fill={g0}
            opacity={0.3 + ((row * 7 + col) % 5) * 0.12}
          />
        ))
      )}
      {/* Highlight lines */}
      <line x1="10" y1="50" x2="90" y2="50" stroke="white" strokeWidth="1" opacity="0.25" />
      <line x1="50" y1="10" x2="50" y2="90" stroke="white" strokeWidth="1" opacity="0.25" />
      <rect x="33" y="33" width="34" height="34" fill={`url(#${id})`} opacity="0.7" rx="2" />
      <text x="50" y="55" textAnchor="middle" fill="white" fontSize="14" fontFamily="monospace" opacity="0.9" fontWeight="bold">
        {'< />'}
      </text>
    </>
  ),

  // Geometric chaos — triangle fan
  geometric_chaos: (id) => (
    <>
      <rect x="0" y="0" width="100" height="100" fill={`url(#${id}-r)`} />
      <polygon points="50,10 90,80 10,80" fill={`url(#${id})`} opacity="0.85" />
      <polygon points="50,25 80,80 20,80" fill={`url(#${id})`} opacity="0.5" />
      <polygon points="10,10 90,10 50,90" fill={`url(#${id})`} opacity="0.3" />
      <polygon points="50,35 72,72 28,72" fill="white" opacity="0.12" />
      <circle cx="50" cy="55" r="12" fill="none" stroke="white" strokeWidth="1.5" opacity="0.3" />
    </>
  ),

  // Gradient phantom — flowing wave
  gradient_phantom: (id, g0, g1) => (
    <>
      <rect x="0" y="0" width="100" height="100" fill={`url(#${id}-r)`} />
      <path
        d="M 0 60 Q 25 20 50 50 Q 75 80 100 40 L 100 100 L 0 100 Z"
        fill={`url(#${id})`}
        opacity="0.8"
      />
      <path
        d="M 0 70 Q 30 35 55 60 Q 80 85 100 55 L 100 100 L 0 100 Z"
        fill={`url(#${id})`}
        opacity="0.5"
      />
      <path
        d="M 0 80 Q 35 50 60 70 Q 85 90 100 65 L 100 100 L 0 100 Z"
        fill="white"
        opacity="0.08"
      />
      {/* Orb */}
      <circle cx="50" cy="40" r="22" fill={g1} opacity="0.5" />
      <circle cx="50" cy="40" r="14" fill={g0} opacity="0.7" />
      <circle cx="45" cy="35" r="4" fill="white" opacity="0.25" />
    </>
  ),

  // Cyber mask — hexagonal
  cyber_mask: (id) => (
    <>
      <rect x="0" y="0" width="100" height="100" fill={`url(#${id}-r)`} />
      {/* Hex shape */}
      <polygon
        points="50,8 88,29 88,71 50,92 12,71 12,29"
        fill={`url(#${id})`}
        opacity="0.85"
      />
      <polygon
        points="50,18 80,35 80,65 50,82 20,65 20,35"
        fill="none"
        stroke="white"
        strokeWidth="1"
        opacity="0.3"
      />
      {/* Eye slits */}
      <rect x="26" y="42" width="18" height="6" fill="white" opacity="0.7" rx="2" />
      <rect x="56" y="42" width="18" height="6" fill="white" opacity="0.7" rx="2" />
      {/* Nose/mouth */}
      <rect x="45" y="56" width="10" height="2" fill="white" opacity="0.4" rx="1" />
      <rect x="38" y="62" width="24" height="2" fill="white" opacity="0.3" rx="1" />
    </>
  ),

  // Void entity — nested polygons
  void_entity: (id, g0, g1) => (
    <>
      <rect x="0" y="0" width="100" height="100" fill={`url(#${id}-r)`} />
      {[44, 36, 26, 16, 8].map((r, i) => (
        <circle
          key={r}
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke={i % 2 === 0 ? g0 : g1}
          strokeWidth={i === 0 ? 2 : 1}
          opacity={0.15 + i * 0.15}
        />
      ))}
      <polygon
        points="50,14 76,35 66,65 34,65 24,35"
        fill={`url(#${id})`}
        opacity="0.6"
      />
      <circle cx="50" cy="50" r="8" fill="white" opacity="0.2" />
      <circle cx="50" cy="50" r="3" fill="white" opacity="0.6" />
    </>
  ),
}
