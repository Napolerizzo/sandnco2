'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import AgeGate from '@/components/sand-grid/AgeGate'
import SandSetup from '@/components/sand-grid/SandSetup'
import SandGrid from '@/components/sand-grid/SandGrid'
import toast from 'react-hot-toast'

type ViewState = 'loading' | 'age-gate' | 'setup' | 'grid' | 'left'

export default function SandGridPage() {
  const [view, setView] = useState<ViewState>('loading')
  const [dob, setDob] = useState('')
  const [ageTrack, setAgeTrack] = useState<'adult' | 'ghost'>('adult')
  const [ownProfile, setOwnProfile] = useState<Record<string, unknown> | null>(null)

  // Check if user already has a Sand Grid profile
  useEffect(() => {
    const checkProfile = async () => {
      // Check localStorage for DOB consent (to avoid re-showing age gate)
      const savedDob = localStorage.getItem('sand_grid_dob')

      try {
        const res = await fetch('/api/sand-grid/profile')
        const data = await res.json()

        if (data.profile) {
          setOwnProfile(data.profile)
          setAgeTrack(data.profile.age_track)
          setView('grid')
        } else if (savedDob) {
          // Has DOB consent but no profile yet — skip age gate, go to setup
          const track = calcTrack(savedDob)
          if (track) {
            setDob(savedDob)
            setAgeTrack(track)
            setView('setup')
          } else {
            localStorage.removeItem('sand_grid_dob')
            setView('age-gate')
          }
        } else {
          setView('age-gate')
        }
      } catch {
        setView('age-gate')
      }
    }
    checkProfile()
  }, [])

  function calcTrack(dobStr: string): 'adult' | 'ghost' | null {
    const d = new Date(dobStr)
    if (isNaN(d.getTime())) return null
    const now = new Date()
    let age = now.getFullYear() - d.getFullYear()
    const m = now.getMonth() - d.getMonth()
    if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--
    if (age < 13) return null
    return age >= 18 ? 'adult' : 'ghost'
  }

  const handleAgeConfirm = (confirmedDob: string) => {
    const track = calcTrack(confirmedDob)
    if (!track) {
      toast.error('You must be at least 13 years old')
      return
    }
    localStorage.setItem('sand_grid_dob', confirmedDob)
    setDob(confirmedDob)
    setAgeTrack(track)
    setView('setup')
  }

  const handleSetupComplete = (profile: Record<string, unknown>) => {
    setOwnProfile(profile)
    setView('grid')
  }

  const handleLeave = () => {
    localStorage.removeItem('sand_grid_dob')
    setView('left')
    setTimeout(() => window.history.back(), 1500)
  }

  const handleEditProfile = () => {
    setView('setup')
  }

  if (view === 'loading') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#050505' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 48, height: 48, border: '2px solid rgba(255,45,85,0.3)', borderTopColor: '#FF2D55', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
          <p style={{ fontSize: 13, color: 'var(--muted)' }}>Loading the grid...</p>
        </div>
      </div>
    )
  }

  if (view === 'left') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#050505' }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{ textAlign: 'center' }}
        >
          <div style={{ fontSize: 48, marginBottom: 16 }}>👻</div>
          <h3 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)', fontFamily: "'Syne', sans-serif" }}>
            You&apos;ve left the grid
          </h3>
          <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 8 }}>
            Come back anytime to keep sparking.
          </p>
        </motion.div>
      </div>
    )
  }

  return (
    <>
      {view === 'age-gate' && <AgeGate onConfirm={handleAgeConfirm} />}

      {view === 'setup' && (
        <SandSetup
          dob={dob}
          ageTrack={ageTrack}
          onComplete={handleSetupComplete}
        />
      )}

      {view === 'grid' && ownProfile && (
        <SandGrid
          ownProfile={ownProfile as Parameters<typeof SandGrid>[0]['ownProfile']}
          onEditProfile={handleEditProfile}
          onLeave={handleLeave}
        />
      )}
    </>
  )
}
