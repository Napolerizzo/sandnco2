'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, Instagram, Flag, X, Zap } from 'lucide-react'
import Image from 'next/image'

export interface SandProfile {
  id: string
  user_id: string
  display_name: string
  bio?: string
  age_track: 'adult' | 'ghost'
  city?: string
  interests?: string[]
  profile_picture_url: string
  date_of_birth?: string
}

interface SandCardProps {
  profile: SandProfile
  onSpark: () => void
  onPass: () => void
  onReport?: () => void
  style?: React.CSSProperties
  isTop?: boolean
  ageTrack: 'adult' | 'ghost'
  drag?: boolean
  onDragEnd?: (dir: 'spark' | 'pass') => void
}

export default function SandCard({
  profile,
  onSpark,
  onPass,
  onReport,
  style,
  isTop = false,
  ageTrack,
  drag = false,
  onDragEnd,
}: SandCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [dragDir, setDragDir] = useState<'spark' | 'pass' | null>(null)

  const age = profile.date_of_birth
    ? (() => {
        const d = new Date(profile.date_of_birth)
        const now = new Date()
        let a = now.getFullYear() - d.getFullYear()
        const m = now.getMonth() - d.getMonth()
        if (m < 0 || (m === 0 && now.getDate() < d.getDate())) a--
        return a
      })()
    : null

  const categoryColor = ageTrack === 'adult' ? '#FF2D55' : '#A855F7'

  return (
    <motion.div
      drag={drag ? 'x' : false}
      dragConstraints={{ left: -300, right: 300 }}
      dragElastic={0.8}
      onDrag={(_, info) => {
        if (info.offset.x > 60) setDragDir('spark')
        else if (info.offset.x < -60) setDragDir('pass')
        else setDragDir(null)
      }}
      onDragEnd={(_, info) => {
        if (info.offset.x > 120) onDragEnd?.('spark')
        else if (info.offset.x < -120) onDragEnd?.('pass')
        else setDragDir(null)
      }}
      style={{
        width: '100%', maxWidth: 380, position: 'absolute',
        cursor: drag ? 'grab' : 'default',
        ...style,
      }}
      whileDrag={{ cursor: 'grabbing' }}
    >
      <div
        style={{
          borderRadius: 24, overflow: 'hidden', position: 'relative',
          aspectRatio: '3/4',
          boxShadow: dragDir === 'spark'
            ? `0 20px 60px rgba(34,197,94,0.4), 0 0 0 2px #22C55E`
            : dragDir === 'pass'
              ? `0 20px 60px rgba(239,68,68,0.4), 0 0 0 2px #EF4444`
              : `0 20px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.08)`,
          transition: 'box-shadow 0.15s',
          background: '#111',
        }}
      >
        {/* Profile picture */}
        <div style={{ position: 'absolute', inset: 0 }}>
          {profile.profile_picture_url && (
            <Image
              src={profile.profile_picture_url}
              alt={profile.display_name}
              fill
              style={{ objectFit: 'cover' }}
              priority={isTop}
            />
          )}
        </div>

        {/* Gradient overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.1) 100%)',
        }} />

        {/* Drag indicators */}
        <AnimatePresence>
          {dragDir === 'spark' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              style={{
                position: 'absolute', top: 24, left: 24, zIndex: 10,
                padding: '8px 16px', borderRadius: 100,
                background: '#22C55E', color: '#fff', fontSize: 14, fontWeight: 800,
                border: '2px solid #16A34A', letterSpacing: '0.05em',
              }}
            >
              ⚡ SPARK
            </motion.div>
          )}
          {dragDir === 'pass' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              style={{
                position: 'absolute', top: 24, right: 24, zIndex: 10,
                padding: '8px 16px', borderRadius: 100,
                background: '#EF4444', color: '#fff', fontSize: 14, fontWeight: 800,
                border: '2px solid #DC2626', letterSpacing: '0.05em',
              }}
            >
              PASS ✗
            </motion.div>
          )}
        </AnimatePresence>

        {/* Track badge */}
        <div style={{ position: 'absolute', top: 16, right: 16, zIndex: 5 }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            padding: '3px 10px', borderRadius: 100, fontSize: 10, fontWeight: 700,
            background: `${categoryColor}20`, border: `1px solid ${categoryColor}50`,
            color: categoryColor, backdropFilter: 'blur(8px)',
          }}>
            {ageTrack === 'adult' ? '⚡ Adult' : '👻 Ghost Mode'}
          </span>
        </div>

        {/* Bottom content */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '20px 20px 24px', zIndex: 5 }}>
          {/* Name + age */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 4 }}>
            <h3 style={{ fontSize: 22, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', fontFamily: "'Syne', sans-serif" }}>
              {profile.display_name}
            </h3>
            {age && <span style={{ fontSize: 16, fontWeight: 500, color: 'rgba(255,255,255,0.7)' }}>{age}</span>}
          </div>

          {/* City */}
          {profile.city && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 8 }}>
              <MapPin size={12} style={{ color: 'rgba(255,255,255,0.5)' }} />
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>{profile.city}</span>
            </div>
          )}

          {/* Interests */}
          {profile.interests && profile.interests.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: expanded ? 8 : 0 }}>
              {profile.interests.slice(0, 4).map(i => (
                <span key={i} style={{
                  padding: '3px 9px', fontSize: 11, fontWeight: 600,
                  borderRadius: 100, background: 'rgba(255,255,255,0.12)',
                  border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.85)',
                  backdropFilter: 'blur(4px)',
                }}>
                  {i}
                </span>
              ))}
            </div>
          )}

          {/* Expanded bio */}
          <AnimatePresence>
            {expanded && profile.bio && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', lineHeight: 1.5, marginTop: 8 }}
              >
                {profile.bio}
              </motion.p>
            )}
          </AnimatePresence>

          {/* Expand toggle */}
          {profile.bio && (
            <button
              onClick={() => setExpanded(!expanded)}
              style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0', marginTop: 4 }}
            >
              {expanded ? '▲ Less' : '▼ More'}
            </button>
          )}
        </div>
      </div>

      {/* Action buttons — only shown on top card */}
      {isTop && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: 16, paddingBottom: 4 }}>
          {/* Report button (adults only, small) */}
          {ageTrack === 'adult' && onReport && (
            <button
              onClick={onReport}
              style={{
                width: 36, height: 36, borderRadius: '50%', cursor: 'pointer',
                background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#F59E0B', transition: 'all 0.15s',
              }}
              title="Report as potential minor"
            >
              <Flag size={14} />
            </button>
          )}

          {/* Pass button */}
          <motion.button
            onClick={onPass}
            whileHover={{ scale: 1.06, boxShadow: '0 0 20px rgba(239,68,68,0.4)' }}
            whileTap={{ scale: 0.94 }}
            style={{
              width: 60, height: 60, borderRadius: '50%', cursor: 'pointer',
              background: 'rgba(239,68,68,0.12)', border: '2px solid rgba(239,68,68,0.35)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#EF4444', transition: 'all 0.15s',
            }}
          >
            <X size={24} />
          </motion.button>

          {/* Spark button */}
          <motion.button
            onClick={onSpark}
            whileHover={{ scale: 1.06, boxShadow: '0 0 24px rgba(255,45,85,0.5)' }}
            whileTap={{ scale: 0.94 }}
            style={{
              width: 68, height: 68, borderRadius: '50%', cursor: 'pointer',
              background: 'linear-gradient(135deg, #FF2D55, #A855F7)',
              border: 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', boxShadow: '0 4px 20px rgba(255,45,85,0.3)',
            }}
          >
            <Zap size={26} />
          </motion.button>
        </div>
      )}
    </motion.div>
  )
}
