'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Camera, ChevronRight, ChevronLeft, Instagram, Loader, X, Plus } from 'lucide-react'
import toast from 'react-hot-toast'
import Image from 'next/image'

const INTERESTS = [
  'Music', 'Art', 'Gaming', 'Sports', 'Food', 'Travel',
  'Tech', 'Fashion', 'Fitness', 'Movies', 'Books', 'Photography',
  'Dance', 'Comedy', 'Anime', 'Cricket', 'Bollywood', 'K-pop',
]

interface SandSetupProps {
  dob: string
  ageTrack: 'adult' | 'ghost'
  onComplete: (profile: Record<string, unknown>) => void
}

export default function SandSetup({ dob, ageTrack, onComplete }: SandSetupProps) {
  const [step, setStep] = useState(0)
  const [name, setName] = useState('')
  const [bio, setBio] = useState('')
  const [city, setCity] = useState('')
  const [interests, setInterests] = useState<string[]>([])
  const [instagram, setInstagram] = useState('')
  const [pictureUrl, setPictureUrl] = useState('')
  const [picturePreview, setPicturePreview] = useState('')
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const toggleInterest = (i: string) => {
    setInterests(prev => prev.includes(i) ? prev.filter(x => x !== i) : prev.length < 6 ? [...prev, i] : prev)
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5MB'); return }

    setUploading(true)
    const preview = URL.createObjectURL(file)
    setPicturePreview(preview)

    try {
      const form = new FormData()
      form.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: form })
      const data = await res.json()
      if (data.url) {
        setPictureUrl(data.url)
        toast.success('Photo uploaded!')
      } else {
        // Fallback: use data URL for now
        const reader = new FileReader()
        reader.onload = () => {
          setPictureUrl(reader.result as string)
        }
        reader.readAsDataURL(file)
      }
    } catch {
      // Use base64 fallback
      const reader = new FileReader()
      reader.onload = () => setPictureUrl(reader.result as string)
      reader.readAsDataURL(file)
    } finally {
      setUploading(false)
    }
  }

  const canNext = () => {
    if (step === 0) return name.trim().length >= 2 && pictureUrl
    if (step === 1) return true
    return true
  }

  const handleSubmit = async () => {
    if (!pictureUrl) { toast.error('Profile picture is required'); return }
    setSubmitting(true)
    try {
      const res = await fetch('/api/sand-grid/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          display_name: name.trim(),
          bio: bio.trim() || null,
          date_of_birth: dob,
          city: city.trim() || null,
          interests,
          instagram_handle: instagram.trim().replace('@', '') || null,
          profile_picture_url: pictureUrl,
        }),
      })
      const data = await res.json()
      if (data.error) { toast.error(data.error); return }
      toast.success('Profile created! Welcome to the Sand Grid ⚡')
      onComplete(data.profile)
    } catch {
      toast.error('Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  const steps = [
    {
      title: 'Who are you?',
      subtitle: 'Your grid identity — make it count.',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Profile picture */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
            <div
              onClick={() => fileRef.current?.click()}
              style={{
                width: 100, height: 100, borderRadius: '50%', cursor: 'pointer',
                border: `2px dashed ${pictureUrl ? '#FF2D55' : 'rgba(255,255,255,0.2)'}`,
                overflow: 'hidden', position: 'relative',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(255,255,255,0.04)', transition: 'border-color 0.2s',
              }}
            >
              {picturePreview
                ? <Image src={picturePreview} alt="pfp" fill style={{ objectFit: 'cover' }} />
                : uploading
                  ? <Loader size={24} style={{ color: 'var(--primary)', animation: 'spin 1s linear infinite' }} />
                  : <Camera size={24} style={{ color: 'var(--muted)' }} />
              }
            </div>
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={handleFileChange} />
            <p style={{ fontSize: 11, color: 'var(--muted)' }}>
              {pictureUrl ? '✓ Photo uploaded' : 'Required · Tap to upload'}
            </p>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Display Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder={ageTrack === 'ghost' ? 'Your crew name' : 'How you appear on the grid'}
              maxLength={30}
              className="input"
              style={{ width: '100%' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              City (optional)
            </label>
            <input
              type="text"
              value={city}
              onChange={e => setCity(e.target.value)}
              placeholder="Mumbai, Delhi, Bangalore..."
              className="input"
              style={{ width: '100%' }}
            />
          </div>
        </div>
      ),
    },
    {
      title: 'Your vibe',
      subtitle: 'Pick up to 6 interests that define you.',
      content: (
        <div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {INTERESTS.map(i => {
              const selected = interests.includes(i)
              return (
                <motion.button
                  key={i}
                  onClick={() => toggleInterest(i)}
                  whileTap={{ scale: 0.93 }}
                  style={{
                    padding: '7px 14px', fontSize: 13, fontWeight: 500,
                    borderRadius: 100, cursor: 'pointer', transition: 'all 0.15s',
                    border: `1px solid ${selected ? '#FF2D55' : 'rgba(255,255,255,0.1)'}`,
                    background: selected ? 'rgba(255,45,85,0.15)' : 'rgba(255,255,255,0.04)',
                    color: selected ? '#FF2D55' : 'var(--muted)',
                  }}
                >
                  {i}
                </motion.button>
              )
            })}
          </div>
          <p style={{ fontSize: 11, color: 'var(--subtle)', marginTop: 12 }}>
            {interests.length}/6 selected
          </p>

          <div style={{ marginTop: 16 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Bio (optional)
            </label>
            <textarea
              value={bio}
              onChange={e => setBio(e.target.value)}
              placeholder={ageTrack === 'ghost' ? 'What\'s your deal? Be yourself.' : 'Tell people what you\'re about...'}
              maxLength={150}
              className="input"
              style={{ width: '100%', minHeight: 80, resize: 'none' }}
            />
            <p style={{ fontSize: 10, color: 'var(--subtle)', textAlign: 'right' }}>{bio.length}/150</p>
          </div>
        </div>
      ),
    },
    {
      title: 'Stay connected',
      subtitle: 'Only revealed after a mutual Spark.',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{
            padding: '14px', borderRadius: 12,
            background: 'rgba(255,45,85,0.06)', border: '1px solid rgba(255,45,85,0.15)',
          }}>
            <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.6 }}>
              Your Instagram handle is <strong style={{ color: 'var(--text)' }}>private by default</strong>.
              It is only revealed to users who Spark with you and you Spark back.
              {ageTrack === 'ghost' && ' No adults can ever see your profile or Instagram.'}
            </p>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Instagram Handle (optional)
            </label>
            <div style={{ position: 'relative' }}>
              <Instagram size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
              <input
                type="text"
                value={instagram}
                onChange={e => setInstagram(e.target.value.replace('@', ''))}
                placeholder="your_handle"
                className="input"
                style={{ width: '100%', paddingLeft: 36 }}
              />
            </div>
          </div>

          <div style={{
            padding: '12px', borderRadius: 10,
            background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.2)',
            fontSize: 12, color: 'var(--muted)', lineHeight: 1.5,
          }}>
            <strong style={{ color: '#A855F7' }}>You can always edit your profile later</strong> from your Sand Grid settings.
          </div>
        </div>
      ),
    },
  ]

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(5,5,5,0.98)',
    }}>
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse at 50% 30%, rgba(255,45,85,0.06) 0%, transparent 60%)',
      }} />

      <motion.div
        key={step}
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -40 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        style={{
          width: '100%', maxWidth: 440, margin: '0 16px',
          background: '#0C0C0C', border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 24, padding: '32px 24px',
          boxShadow: '0 40px 80px rgba(0,0,0,0.7)',
          maxHeight: '90vh', overflowY: 'auto',
        }}
      >
        {/* Progress dots */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 24 }}>
          {steps.map((_, i) => (
            <div key={i} style={{
              height: 4, borderRadius: 2, transition: 'all 0.3s',
              width: i === step ? 24 : 8,
              background: i === step ? '#FF2D55' : 'rgba(255,255,255,0.15)',
            }} />
          ))}
        </div>

        {/* Track badge */}
        <div style={{ textAlign: 'center', marginBottom: 12 }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            padding: '4px 12px', borderRadius: 100, fontSize: 11, fontWeight: 700,
            background: ageTrack === 'adult' ? 'rgba(255,45,85,0.15)' : 'rgba(168,85,247,0.15)',
            border: `1px solid ${ageTrack === 'adult' ? 'rgba(255,45,85,0.3)' : 'rgba(168,85,247,0.3)'}`,
            color: ageTrack === 'adult' ? '#FF2D55' : '#A855F7',
          }}>
            {ageTrack === 'adult' ? '⚡ Adult Track' : '👻 Ghost Mode'}
          </span>
        </div>

        {/* Separate pools notice — shown only on step 0 */}
        {step === 0 && (
          <div style={{
            padding: '10px 14px', borderRadius: 10, marginBottom: 16,
            background: 'rgba(0,229,255,0.05)',
            border: '1px solid rgba(0,229,255,0.15)',
            display: 'flex', gap: 10, alignItems: 'flex-start',
          }}>
            <span style={{ fontSize: 15, flexShrink: 0 }}>🔒</span>
            <p style={{ fontSize: 11, color: 'rgba(0,229,255,0.7)', lineHeight: 1.6, margin: 0 }}>
              <strong style={{ color: '#00E5FF' }}>Separate pools, always.</strong>
              {' '}Adult profiles are completely invisible to Ghost Mode users and vice versa — no crossover, ever.
              {ageTrack === 'ghost' && (
                <span> Your profile will <strong style={{ color: '#00E5FF' }}>automatically move</strong> to the Adult track when you turn 18.</span>
              )}
            </p>
          </div>
        )}

        <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', marginBottom: 4, fontFamily: "'Syne', sans-serif" }}>
          {steps[step].title}
        </h2>
        <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 20 }}>{steps[step].subtitle}</p>

        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {steps[step].content}
          </motion.div>
        </AnimatePresence>

        <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
          {step > 0 && (
            <button onClick={() => setStep(s => s - 1)} className="btn btn-secondary" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <ChevronLeft size={16} />
              Back
            </button>
          )}
          {step < steps.length - 1 ? (
            <motion.button
              onClick={() => { if (canNext()) setStep(s => s + 1); else if (!pictureUrl) toast.error('Profile picture is required'); }}
              disabled={!canNext()}
              className="btn btn-primary"
              style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, opacity: canNext() ? 1 : 0.5 }}
              whileTap={{ scale: 0.97 }}
            >
              Continue
              <ChevronRight size={16} />
            </motion.button>
          ) : (
            <motion.button
              onClick={handleSubmit}
              disabled={submitting || !pictureUrl}
              className="btn btn-primary"
              style={{
                flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                background: 'linear-gradient(135deg, #FF2D55, #A855F7)',
                opacity: (submitting || !pictureUrl) ? 0.6 : 1,
              }}
              whileTap={{ scale: 0.97 }}
            >
              {submitting ? <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> : '⚡'}
              Launch my profile
            </motion.button>
          )}
        </div>
      </motion.div>
    </div>
  )
}
