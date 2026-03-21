'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Settings, Zap, Users, Heart, Instagram, LogOut } from 'lucide-react'
import SwipeStack from './SwipeStack'
import toast from 'react-hot-toast'
import Image from 'next/image'

interface SandProfile {
  id: string
  user_id: string
  display_name: string
  bio?: string
  age_track: 'adult' | 'ghost'
  city?: string
  interests?: string[]
  profile_picture_url: string
  instagram_handle?: string
}

interface Match {
  id: string
  matched_at?: string
  connected_at?: string
  profile: {
    display_name: string
    instagram_handle: string | null
    city: string | null
    profile_picture_url: string
  }
}

type GridTab = 'swipe' | 'matches' | 'profile'

interface SandGridProps {
  ownProfile: SandProfile
  onEditProfile: () => void
  onLeave: () => void
}

export default function SandGrid({ ownProfile, onEditProfile, onLeave }: SandGridProps) {
  const [tab, setTab] = useState<GridTab>('swipe')
  const [matches, setMatches] = useState<Match[]>([])
  const [loadingMatches, setLoadingMatches] = useState(false)
  const [matchCount, setMatchCount] = useState(0)

  const isAdult = ownProfile.age_track === 'adult'
  const accentColor = isAdult ? '#FF2D55' : '#A855F7'

  const loadMatches = async () => {
    setLoadingMatches(true)
    try {
      const endpoint = isAdult ? '/api/sand-grid/matches' : '/api/sand-grid/connects'
      const res = await fetch(endpoint)
      const data = await res.json()
      const items = isAdult ? data.matches : data.connects
      setMatches(items || [])
      setMatchCount((items || []).length)
    } catch {
      toast.error('Failed to load matches')
    } finally {
      setLoadingMatches(false)
    }
  }

  useEffect(() => {
    if (tab === 'matches') loadMatches()
  }, [tab])

  const tabs: { id: GridTab; label: string; icon: typeof Zap }[] = [
    { id: 'swipe',   label: 'Discover',  icon: Zap },
    { id: 'matches', label: isAdult ? 'Matches' : 'Sparks', icon: Heart },
    { id: 'profile', label: 'My Profile', icon: Users },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#050505', paddingTop: 64 }}>
      {/* Header */}
      <div style={{
        position: 'sticky', top: 64, zIndex: 40,
        background: 'rgba(5,5,5,0.9)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{ maxWidth: 480, margin: '0 auto', padding: '0 16px' }}>
          {/* Title bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12, paddingBottom: 4 }}>
            <div>
              <h1 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text)', fontFamily: "'Syne', sans-serif", letterSpacing: '-0.02em' }}>
                The Sand Grid
              </h1>
              <p style={{ fontSize: 11, color: accentColor, fontWeight: 600 }}>
                {isAdult ? '⚡ Adult Track' : '👻 Ghost Mode'}
              </p>
            </div>
            <button onClick={onLeave} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', padding: 4 }}>
              <LogOut size={16} />
            </button>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: 0 }}>
            {tabs.map(t => {
              const Icon = t.icon
              const isActive = tab === t.id
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  style={{
                    flex: 1, padding: '10px 4px', fontSize: 12, fontWeight: 600,
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: isActive ? accentColor : 'var(--muted)',
                    borderBottom: `2px solid ${isActive ? accentColor : 'transparent'}`,
                    transition: 'all 0.15s',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                    position: 'relative',
                  }}
                >
                  <Icon size={16} />
                  {t.label}
                  {t.id === 'matches' && matchCount > 0 && (
                    <span style={{
                      position: 'absolute', top: 6, right: '25%',
                      width: 16, height: 16, borderRadius: '50%', fontSize: 9, fontWeight: 700,
                      background: accentColor, color: '#fff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {matchCount > 9 ? '9+' : matchCount}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 480, margin: '0 auto', padding: '20px 16px 100px' }}>
        <AnimatePresence mode="wait">
          {/* ── SWIPE TAB ── */}
          {tab === 'swipe' && (
            <motion.div key="swipe" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <SwipeStack ageTrack={ownProfile.age_track} ownUserId={ownProfile.user_id} onStatsUpdate={loadMatches} />
            </motion.div>
          )}

          {/* ── MATCHES TAB ── */}
          {tab === 'matches' && (
            <motion.div key="matches" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 16, fontFamily: "'Syne', sans-serif" }}>
                {isAdult ? '⚡ Your Mutual Sparks' : '✨ Your Connections'}
              </h2>

              {loadingMatches ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--muted)' }}>
                  <div style={{ width: 32, height: 32, border: '2px solid rgba(255,45,85,0.3)', borderTopColor: accentColor, borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 12px' }} />
                  Loading...
                </div>
              ) : matches.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 0' }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>⚡</div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>No {isAdult ? 'matches' : 'connections'} yet</h3>
                  <p style={{ fontSize: 13, color: 'var(--muted)' }}>Keep sparking — your first match is coming!</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {matches.map(match => (
                    <motion.div
                      key={match.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 14,
                        padding: '14px 16px', borderRadius: 16,
                        background: 'var(--bg-card)', border: '1px solid rgba(255,255,255,0.06)',
                      }}
                    >
                      {match.profile?.profile_picture_url && (
                        <div style={{ width: 52, height: 52, borderRadius: '50%', overflow: 'hidden', flexShrink: 0, border: `2px solid ${accentColor}40` }}>
                          <Image src={match.profile.profile_picture_url} alt={match.profile.display_name} width={52} height={52} style={{ objectFit: 'cover' }} />
                        </div>
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 2 }}>
                          {match.profile?.display_name}
                        </p>
                        {match.profile?.city && (
                          <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 4 }}>📍 {match.profile.city}</p>
                        )}
                        {match.profile?.instagram_handle ? (
                          <a
                            href={`https://instagram.com/${match.profile.instagram_handle}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, color: accentColor, textDecoration: 'none', fontWeight: 600 }}
                          >
                            <Instagram size={11} />
                            @{match.profile.instagram_handle}
                          </a>
                        ) : (
                          <p style={{ fontSize: 11, color: 'var(--subtle)' }}>No Instagram added</p>
                        )}
                      </div>
                      <div style={{ fontSize: 18 }}>⚡</div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* ── PROFILE TAB ── */}
          {tab === 'profile' && (
            <motion.div key="profile" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div style={{
                borderRadius: 20, overflow: 'hidden',
                background: 'var(--bg-card)', border: '1px solid rgba(255,255,255,0.06)',
                marginBottom: 16,
              }}>
                {/* Cover / avatar */}
                <div style={{ position: 'relative', height: 160, background: `linear-gradient(135deg, ${accentColor}20, rgba(168,85,247,0.1))` }}>
                  <div style={{
                    position: 'absolute', bottom: -32, left: 20,
                    width: 72, height: 72, borderRadius: '50%', overflow: 'hidden',
                    border: `3px solid ${accentColor}`,
                    boxShadow: `0 0 24px ${accentColor}40`,
                  }}>
                    {ownProfile.profile_picture_url && (
                      <Image src={ownProfile.profile_picture_url} alt={ownProfile.display_name} width={72} height={72} style={{ objectFit: 'cover' }} />
                    )}
                  </div>
                </div>

                <div style={{ padding: '40px 20px 20px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div>
                      <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)', fontFamily: "'Syne', sans-serif" }}>
                        {ownProfile.display_name}
                      </h2>
                      {ownProfile.city && <p style={{ fontSize: 13, color: 'var(--muted)' }}>📍 {ownProfile.city}</p>}
                    </div>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 4,
                      padding: '4px 10px', borderRadius: 100, fontSize: 11, fontWeight: 700,
                      background: `${accentColor}15`, border: `1px solid ${accentColor}30`,
                      color: accentColor,
                    }}>
                      {isAdult ? '⚡ Adult' : '👻 Ghost'}
                    </span>
                  </div>

                  {ownProfile.bio && (
                    <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.5, marginBottom: 12 }}>{ownProfile.bio}</p>
                  )}

                  {ownProfile.interests && ownProfile.interests.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                      {ownProfile.interests.map(i => (
                        <span key={i} style={{
                          padding: '4px 10px', fontSize: 11, fontWeight: 500,
                          borderRadius: 100, background: 'var(--bg-elevated)',
                          border: '1px solid var(--border)', color: 'var(--muted)',
                        }}>{i}</span>
                      ))}
                    </div>
                  )}

                  {ownProfile.instagram_handle && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--muted)', marginBottom: 12 }}>
                      <Instagram size={12} />
                      @{ownProfile.instagram_handle}
                      <span style={{ fontSize: 10, color: 'var(--subtle)' }}>(revealed only on mutual spark)</span>
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={onEditProfile}
                className="btn btn-secondary"
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 10 }}
              >
                <Settings size={14} />
                Edit Profile
              </button>

              <button
                onClick={onLeave}
                style={{
                  width: '100%', padding: '10px', fontSize: 13, fontWeight: 500,
                  background: 'none', border: '1px solid rgba(239,68,68,0.2)',
                  borderRadius: 'var(--r)', color: '#EF4444', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                }}
              >
                <LogOut size={14} />
                Leave the Sand Grid
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
