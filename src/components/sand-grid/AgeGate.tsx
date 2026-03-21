'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, Zap, AlertTriangle } from 'lucide-react'

interface AgeGateProps {
  onConfirm: (dob: string) => void
}

export default function AgeGate({ onConfirm }: AgeGateProps) {
  const [day, setDay] = useState('')
  const [month, setMonth] = useState('')
  const [year, setYear] = useState('')
  const [agreed, setAgreed] = useState(false)
  const [error, setError] = useState('')

  const handleContinue = () => {
    setError('')
    if (!day || !month || !year) { setError('Enter your full date of birth'); return }

    const dob = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
    const birth = new Date(dob)
    if (isNaN(birth.getTime())) { setError('Invalid date'); return }

    const today = new Date()
    let age = today.getFullYear() - birth.getFullYear()
    const m = today.getMonth() - birth.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--

    if (age < 13) { setError('You must be at least 13 years old to use The Sand Grid'); return }
    if (!agreed) { setError('You must agree to the terms to continue'); return }

    onConfirm(dob)
  }

  const inputStyle = {
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 10,
    color: 'var(--text)',
    fontSize: 18,
    fontWeight: 600,
    textAlign: 'center' as const,
    outline: 'none',
    fontFamily: 'var(--font-mono)',
    transition: 'border-color 0.15s',
    padding: '12px 8px',
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(5,5,5,0.97)',
      backdropFilter: 'blur(12px)',
    }}>
      {/* Radial glow */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse at 50% 60%, rgba(255,45,85,0.08) 0%, transparent 60%)',
      }} />

      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        style={{
          width: '100%', maxWidth: 420, margin: '0 16px',
          background: 'linear-gradient(160deg, #0C0C0C 0%, #111 100%)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 24, padding: '36px 28px',
          boxShadow: '0 40px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,45,85,0.08)',
        }}
      >
        {/* Icon */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{
            width: 64, height: 64, borderRadius: 20, margin: '0 auto 16px',
            background: 'linear-gradient(135deg, rgba(255,45,85,0.2), rgba(168,85,247,0.15))',
            border: '1px solid rgba(255,45,85,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Zap size={28} style={{ color: '#FF2D55' }} />
          </div>
          <h2 style={{
            fontSize: 26, fontWeight: 800, color: 'var(--text)',
            fontFamily: "'Syne', sans-serif", marginBottom: 6, letterSpacing: '-0.02em',
          }}>
            The Sand Grid
          </h2>
          <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.5 }}>
            Enter your date of birth to continue. Your track is determined automatically.
          </p>
        </div>

        {/* DOB input */}
        <div style={{ marginBottom: 20 }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Date of Birth
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.5fr', gap: 8 }}>
            <div>
              <p style={{ fontSize: 10, color: 'var(--subtle)', marginBottom: 4, textAlign: 'center' }}>Day</p>
              <input
                type="number" placeholder="DD" min={1} max={31}
                value={day} onChange={e => setDay(e.target.value)}
                style={inputStyle}
              />
            </div>
            <div>
              <p style={{ fontSize: 10, color: 'var(--subtle)', marginBottom: 4, textAlign: 'center' }}>Month</p>
              <input
                type="number" placeholder="MM" min={1} max={12}
                value={month} onChange={e => setMonth(e.target.value)}
                style={inputStyle}
              />
            </div>
            <div>
              <p style={{ fontSize: 10, color: 'var(--subtle)', marginBottom: 4, textAlign: 'center' }}>Year</p>
              <input
                type="number" placeholder="YYYY" min={1900} max={new Date().getFullYear()}
                value={year} onChange={e => setYear(e.target.value)}
                style={{ ...inputStyle }}
              />
            </div>
          </div>
        </div>

        {/* Tracks explanation */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 20,
        }}>
          {[
            { label: 'Adults (18+)', desc: 'Spark / Pass · Matches', color: '#FF2D55', icon: '⚡' },
            { label: 'Ghost Mode (13–17)', desc: 'Spark / Pass · Connects', color: '#A855F7', icon: '👻' },
          ].map(track => (
            <div key={track.label} style={{
              padding: '10px 12px', borderRadius: 10,
              background: `${track.color}10`, border: `1px solid ${track.color}25`,
            }}>
              <p style={{ fontSize: 16, marginBottom: 2 }}>{track.icon}</p>
              <p style={{ fontSize: 11, fontWeight: 700, color: track.color, marginBottom: 2 }}>{track.label}</p>
              <p style={{ fontSize: 10, color: 'var(--muted)' }}>{track.desc}</p>
            </div>
          ))}
        </div>

        {/* Agreement */}
        <label style={{ display: 'flex', gap: 10, alignItems: 'flex-start', cursor: 'pointer', marginBottom: 20 }}>
          <div
            onClick={() => setAgreed(!agreed)}
            style={{
              width: 18, height: 18, borderRadius: 5, flexShrink: 0, marginTop: 1,
              border: `2px solid ${agreed ? '#FF2D55' : 'rgba(255,255,255,0.2)'}`,
              background: agreed ? '#FF2D55' : 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.15s', cursor: 'pointer',
            }}
          >
            {agreed && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
          </div>
          <p style={{ fontSize: 11, color: 'var(--muted)', lineHeight: 1.5 }}>
            I confirm my date of birth is accurate. I understand that this platform is for users aged 13+, and I agree to the{' '}
            <a href="/legal/tos" style={{ color: '#FF2D55', textDecoration: 'none' }}>Terms of Service</a>.
          </p>
        </label>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              style={{
                display: 'flex', gap: 6, alignItems: 'center',
                padding: '10px 12px', marginBottom: 14, borderRadius: 8,
                background: 'rgba(255,59,59,0.1)', border: '1px solid rgba(255,59,59,0.25)',
                fontSize: 12, color: '#FF3B3B',
              }}
            >
              <AlertTriangle size={13} style={{ flexShrink: 0 }} />
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          onClick={handleContinue}
          whileTap={{ scale: 0.97 }}
          style={{
            width: '100%', padding: '14px', fontSize: 15, fontWeight: 700,
            background: 'linear-gradient(135deg, #FF2D55, #A855F7)',
            border: 'none', borderRadius: 12, color: '#fff', cursor: 'pointer',
            letterSpacing: '-0.01em', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}
        >
          <Shield size={16} />
          Enter the Grid
        </motion.button>
      </motion.div>
    </div>
  )
}
