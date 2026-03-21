'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import SandCard, { SandProfile } from './SandCard'
import toast from 'react-hot-toast'
import { Zap, Users, Heart } from 'lucide-react'
import Image from 'next/image'

interface MatchCard {
  display_name: string
  instagram_handle: string | null
  profile_picture_url: string
}

interface SwipeStackProps {
  ageTrack: 'adult' | 'ghost'
  ownUserId: string
  onStatsUpdate?: () => void
}

export default function SwipeStack({ ageTrack, ownUserId, onStatsUpdate }: SwipeStackProps) {
  const [profiles, setProfiles] = useState<SandProfile[]>([])
  const [page, setPage] = useState(0)
  const [loading, setLoading] = useState(true)
  const [hasMore, setHasMore] = useState(true)
  const [matchCard, setMatchCard] = useState<MatchCard | null>(null)
  const [actioned, setActioned] = useState<string[]>([])
  const [sparks, setSparks] = useState(0)
  const [passes, setPasses] = useState(0)

  const loadProfiles = useCallback(async (p: number, reset = false) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(p) })
      if (reset) params.set('reset', '1')
      const res = await fetch(`/api/sand-grid/profiles?${params}`)
      const data = await res.json()
      if (data.error) { toast.error(data.error); return }
      setProfiles(prev => p === 0 ? data.profiles : [...prev, ...data.profiles])
      setHasMore(data.has_more)
    } catch {
      toast.error('Failed to load profiles')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadProfiles(0) }, [loadProfiles])

  const visibleProfiles = profiles.filter(p => !actioned.includes(p.user_id))

  // When the stack runs dry, loop back from the start
  useEffect(() => {
    if (!loading && visibleProfiles.length === 0 && profiles.length > 0) {
      setActioned([])
      setPage(0)
      loadProfiles(0, true)
    }
  }, [loading, visibleProfiles.length, profiles.length, loadProfiles])

  const handleAction = async (profile: SandProfile, action: 'spark' | 'pass') => {
    // Own profile card — just dismiss it, no vote recorded
    if (profile.user_id === ownUserId) {
      setActioned(prev => [...prev, profile.user_id])
      return
    }

    setActioned(prev => [...prev, profile.user_id])
    if (action === 'spark') setSparks(s => s + 1)
    else setPasses(p => p + 1)

    // Load more if running low
    if (visibleProfiles.length <= 3 && hasMore) {
      const nextPage = page + 1
      setPage(nextPage)
      loadProfiles(nextPage)
    }

    const endpoint = ageTrack === 'adult' ? '/api/sand-grid/vote' : '/api/sand-grid/spark'
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target_id: profile.user_id, vote: action }),
      })
      const data = await res.json()

      if (action === 'spark' && (data.matched || data.connected)) {
        setMatchCard({
          display_name: profile.display_name,
          instagram_handle: data.instagram_handle,
          profile_picture_url: profile.profile_picture_url,
        })
        onStatsUpdate?.()
      }
    } catch {
      // silent — already removed from stack
    }
  }

  const handleReport = async (profile: SandProfile) => {
    setActioned(prev => [...prev, profile.user_id])
    try {
      await fetch('/api/sand-grid/report-minor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target_user_id: profile.user_id, reason: 'Reported as potential minor from adult grid' }),
      })
      toast.success('Profile flagged for review. Thank you!')
    } catch {
      toast.error('Could not submit report')
    }
  }

  const topProfile = visibleProfiles[0]
  const secondProfile = visibleProfiles[1]
  const thirdProfile = visibleProfiles[2]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
      {/* Stats bar */}
      <div style={{
        display: 'flex', gap: 16, alignItems: 'center',
        marginBottom: 16, fontSize: 13, color: 'var(--muted)',
      }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <Zap size={13} style={{ color: '#FF2D55' }} />
          {sparks} Sparks
        </span>
        <span style={{ width: 1, height: 14, background: 'var(--border)' }} />
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <Users size={13} style={{ color: 'var(--muted)' }} />
          {passes} Passed
        </span>
      </div>

      {/* Card stack */}
      <div style={{ position: 'relative', width: '100%', maxWidth: 380, height: 520, marginBottom: 8 }}>
        {loading && visibleProfiles.length === 0 ? (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', border: '2px solid rgba(255,45,85,0.3)', borderTopColor: '#FF2D55', animation: 'spin 1s linear infinite' }} />
            <p style={{ fontSize: 13, color: 'var(--muted)' }}>Finding your crew...</p>
          </div>
        ) : visibleProfiles.length === 0 ? (
          <div style={{
            position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: 12, textAlign: 'center',
          }}>
            <div style={{ fontSize: 48 }}>⚡</div>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', fontFamily: "'Syne', sans-serif" }}>
              You&apos;ve seen everyone!
            </h3>
            <p style={{ fontSize: 13, color: 'var(--muted)', maxWidth: 240 }}>
              Come back later as more people join the grid.
            </p>
          </div>
        ) : (
          <>
            {/* 3rd card (deepest) */}
            {thirdProfile && (
              <SandCard
                key={thirdProfile.user_id}
                profile={thirdProfile}
                ageTrack={ageTrack}
                onSpark={() => {}}
                onPass={() => {}}
                style={{ top: 16, left: '50%', transform: 'translateX(-50%) scale(0.88)', zIndex: 1, opacity: 0.5 }}
              />
            )}
            {/* 2nd card */}
            {secondProfile && (
              <SandCard
                key={secondProfile.user_id}
                profile={secondProfile}
                ageTrack={ageTrack}
                onSpark={() => {}}
                onPass={() => {}}
                style={{ top: 8, left: '50%', transform: 'translateX(-50%) scale(0.94)', zIndex: 2, opacity: 0.75 }}
              />
            )}
            {/* Top card */}
            <AnimatePresence>
              {topProfile && (
                <motion.div
                  key={topProfile.user_id}
                  style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', zIndex: 3, width: '100%', maxWidth: 380 }}
                  initial={{ scale: 0.92, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.85, opacity: 0, y: 40 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                >
                  <SandCard
                    profile={topProfile}
                    ageTrack={ageTrack}
                    isTop
                    drag
                    onSpark={() => handleAction(topProfile, 'spark')}
                    onPass={() => handleAction(topProfile, 'pass')}
                    onReport={ageTrack === 'adult' ? () => handleReport(topProfile) : undefined}
                    onDragEnd={dir => handleAction(topProfile, dir)}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </div>

      {/* Swipe hint */}
      {visibleProfiles.length > 0 && (
        <p style={{ fontSize: 11, color: 'var(--subtle)', textAlign: 'center', marginTop: 8 }}>
          Drag right to ⚡ Spark · Drag left to pass · Tap card to expand
        </p>
      )}

      {/* Match/Connect popup */}
      <AnimatePresence>
        {matchCard && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0, zIndex: 200,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(0,0,0,0.88)',
              backdropFilter: 'blur(12px)',
            }}
            onClick={() => setMatchCard(null)}
          >
            <motion.div
              initial={{ scale: 0.8, y: 40 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 26 }}
              onClick={e => e.stopPropagation()}
              style={{
                background: 'linear-gradient(160deg, #1a0820, #0C0C0C)',
                border: '1px solid rgba(255,45,85,0.3)',
                borderRadius: 28, padding: '40px 32px',
                textAlign: 'center', maxWidth: 340, width: '100%', margin: '0 16px',
                boxShadow: '0 0 60px rgba(255,45,85,0.2)',
              }}
            >
              {/* Glow */}
              <div style={{
                position: 'absolute', inset: 0, pointerEvents: 'none', borderRadius: 28,
                background: 'radial-gradient(ellipse at 50% 0%, rgba(255,45,85,0.12) 0%, transparent 60%)',
              }} />

              <div style={{ fontSize: 40, marginBottom: 12 }}>
                {ageTrack === 'adult' ? '⚡' : '✨'}
              </div>
              <h3 style={{ fontSize: 22, fontWeight: 800, color: '#fff', fontFamily: "'Syne', sans-serif", marginBottom: 6 }}>
                {ageTrack === 'adult' ? 'Mutual Spark!' : 'You Connected!'}
              </h3>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', marginBottom: 20 }}>
                You and <strong style={{ color: '#fff' }}>{matchCard.display_name}</strong> sparked each other!
              </p>

              {/* Profile pic */}
              <div style={{ width: 80, height: 80, borderRadius: '50%', overflow: 'hidden', margin: '0 auto 16px', border: '2px solid #FF2D55' }}>
                <Image src={matchCard.profile_picture_url} alt={matchCard.display_name} width={80} height={80} style={{ objectFit: 'cover' }} />
              </div>

              {matchCard.instagram_handle ? (
                <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 12, padding: '12px 16px', marginBottom: 20 }}>
                  <p style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 4 }}>Their Instagram</p>
                  <a
                    href={`https://instagram.com/${matchCard.instagram_handle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 16, fontWeight: 700, color: '#FF2D55', textDecoration: 'none' }}
                    onClick={e => e.stopPropagation()}
                  >
                    <Heart size={14} />
                    @{matchCard.instagram_handle}
                  </a>
                </div>
              ) : (
                <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 20 }}>
                  They haven&apos;t added their Instagram yet.
                </p>
              )}

              <button
                onClick={() => setMatchCard(null)}
                className="btn btn-primary"
                style={{ width: '100%', padding: '12px' }}
              >
                Keep Sparking ⚡
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
