'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  Trophy, ChevronLeft, Loader, XCircle, CheckCircle,
  Crown, Lock, Calendar, Users, Zap, IndianRupee
} from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'

const CATEGORIES = ['general', 'trivia', 'creative', 'prediction', 'sports', 'music', 'tech', 'drama']

const CATEGORY_COLORS: Record<string, string> = {
  general: '#6B7280', trivia: '#3B82F6', creative: '#A855F7',
  prediction: '#F59E0B', sports: '#22C55E', music: '#EC4899',
  tech: '#6366F1', drama: '#EF4444',
}

export default function NewChallengePage() {
  const router = useRouter()
  const supabase = createClient()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('general')
  const [entryFee, setEntryFee] = useState('')
  const [prizePool, setPrizePool] = useState('')
  const [endsAt, setEndsAt] = useState('')
  const [isPremiumOnly, setIsPremiumOnly] = useState(false)
  const [maxParticipants, setMaxParticipants] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null)
  const [isPremium, setIsPremium] = useState<boolean | null>(null)
  const [checkingPremium, setCheckingPremium] = useState(true)

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { router.push('/login?next=/challenges/new'); return }
      const { data } = await supabase.from('users').select('is_premium').eq('id', user.id).single()
      setIsPremium(data?.is_premium ?? false)
      setCheckingPremium(false)
    })
  }, [supabase, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    const res = await fetch('/api/challenges/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        description,
        category,
        entryFee: parseFloat(entryFee) || 0,
        prizePool: parseFloat(prizePool) || 0,
        endsAt: endsAt || null,
        isPremiumOnly,
        maxParticipants: parseInt(maxParticipants) || null,
      }),
    })
    const result = await res.json()

    if (!res.ok || result.error) {
      setMessage({ type: 'error', text: result.error || 'Something went wrong. Please try again.' })
      setLoading(false)
      return
    }

    toast.success('Challenge created!')
    router.push(`/challenges/${result.id}`)
  }

  if (checkingPremium) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <Loader size={24} className="animate-spin" style={{ color: 'var(--primary)' }} />
      </div>
    )
  }

  if (!isPremium) {
    return (
      <div style={{ maxWidth: 520, margin: '80px auto', padding: '0 16px', textAlign: 'center' }}>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          className="card"
          style={{ padding: '40px 32px' }}
        >
          <div style={{
            width: 64, height: 64, borderRadius: 16, margin: '0 auto 20px',
            background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Crown size={28} style={{ color: '#F59E0B' }} />
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', marginBottom: 10, letterSpacing: '-0.02em' }}>
            Premium Feature
          </h1>
          <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.7, marginBottom: 28 }}>
            Creating challenges is exclusive to <strong style={{ color: '#F59E0B' }}>Premium members</strong>.
            Upgrade for ₹80/month to create challenges, post rumors, and unlock exclusive perks.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Link href="/wallet" style={{ textDecoration: 'none' }}>
              <button className="btn btn-primary" style={{ width: '100%', padding: '12px', fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <Crown size={15} />
                Upgrade to Premium — ₹80/mo
              </button>
            </Link>
            <Link href="/challenges" style={{ textDecoration: 'none' }}>
              <button className="btn btn-secondary" style={{ width: '100%', padding: '11px', fontSize: 14 }}>
                Back to Challenges
              </button>
            </Link>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '32px 16px 80px' }}>
      {/* Back link */}
      <Link href="/challenges" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--muted)', fontSize: 13, marginBottom: 24, textDecoration: 'none' }}
        onMouseEnter={e => (e.currentTarget.style.color = 'var(--text)')}
        onMouseLeave={e => (e.currentTarget.style.color = 'var(--muted)')}
      >
        <ChevronLeft size={14} />
        Back to Challenges
      </Link>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        style={{ marginBottom: 28 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'rgba(168,85,247,0.12)', border: '1px solid rgba(168,85,247,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Trophy size={16} style={{ color: '#A855F7' }} />
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text)' }}>
            Create a Challenge
          </h1>
        </div>
        <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.6, paddingLeft: 46 }}>
          Set the rules. Pick the prize. Let the city compete.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30, delay: 0.08 }}
        className="card"
        style={{ padding: '24px' }}
      >
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Title */}
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Challenge Title
            </label>
            <input
              type="text" value={title} onChange={e => setTitle(e.target.value)}
              placeholder="What's the challenge about?"
              maxLength={100} className="input" style={{ width: '100%' }}
              required
            />
            <p style={{ fontSize: 11, color: 'var(--subtle)', marginTop: 4, textAlign: 'right' }}>{title.length}/100</p>
          </div>

          {/* Description */}
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Description
            </label>
            <textarea
              value={description} onChange={e => setDescription(e.target.value)}
              placeholder="Explain the rules, what participants need to do, and how winners are picked..."
              maxLength={1000} rows={5} className="input"
              style={{ width: '100%', resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.6 }}
              required
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
              <span style={{ fontSize: 11, color: 'var(--subtle)' }}>Minimum 20 characters</span>
              <span style={{ fontSize: 11, color: 'var(--subtle)' }}>{description.length}/1000</span>
            </div>
          </div>

          {/* Category */}
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Category
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {CATEGORIES.map(cat => {
                const color = CATEGORY_COLORS[cat]
                const isSelected = category === cat
                return (
                  <button key={cat} type="button" onClick={() => setCategory(cat)} style={{
                    padding: '6px 14px', fontSize: 12, fontWeight: 500, borderRadius: 'var(--r-md)',
                    border: `1px solid ${isSelected ? color : 'var(--border)'}`,
                    background: isSelected ? `${color}15` : 'transparent',
                    color: isSelected ? color : 'var(--muted)',
                    cursor: 'pointer', transition: 'all 0.15s', textTransform: 'capitalize',
                  }}>
                    {cat}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Entry fee + Prize pool */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Entry Fee (₹)
              </label>
              <div style={{ position: 'relative' }}>
                <IndianRupee size={13} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--subtle)' }} />
                <input
                  type="number" value={entryFee} onChange={e => setEntryFee(e.target.value)}
                  placeholder="0 = free"
                  min={0} max={10000} step={1} className="input"
                  style={{ width: '100%', paddingLeft: 32 }}
                />
              </div>
              <p style={{ fontSize: 11, color: 'var(--subtle)', marginTop: 4 }}>Leave 0 for free entry</p>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Prize Pool (₹)
              </label>
              <div style={{ position: 'relative' }}>
                <IndianRupee size={13} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--subtle)' }} />
                <input
                  type="number" value={prizePool} onChange={e => setPrizePool(e.target.value)}
                  placeholder="Total prize"
                  min={0} max={1000000} step={1} className="input"
                  style={{ width: '100%', paddingLeft: 32 }}
                />
              </div>
              <p style={{ fontSize: 11, color: 'var(--subtle)', marginTop: 4 }}>Total payout to winners</p>
            </div>
          </div>

          {/* End date + max participants */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                End Date <span style={{ fontWeight: 400, color: 'var(--subtle)' }}>(optional)</span>
              </label>
              <div style={{ position: 'relative' }}>
                <Calendar size={13} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--subtle)' }} />
                <input
                  type="datetime-local" value={endsAt} onChange={e => setEndsAt(e.target.value)}
                  className="input" style={{ width: '100%', paddingLeft: 32 }}
                  min={new Date().toISOString().slice(0, 16)}
                />
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Max Participants <span style={{ fontWeight: 400, color: 'var(--subtle)' }}>(optional)</span>
              </label>
              <div style={{ position: 'relative' }}>
                <Users size={13} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--subtle)' }} />
                <input
                  type="number" value={maxParticipants} onChange={e => setMaxParticipants(e.target.value)}
                  placeholder="No limit"
                  min={2} max={10000} step={1} className="input"
                  style={{ width: '100%', paddingLeft: 32 }}
                />
              </div>
            </div>
          </div>

          {/* Premium only toggle */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '14px 16px',
            background: isPremiumOnly ? 'rgba(245,158,11,0.06)' : 'var(--bg-elevated)',
            border: `1px solid ${isPremiumOnly ? 'rgba(245,158,11,0.25)' : 'var(--border)'}`,
            borderRadius: 'var(--r-md)', transition: 'all 0.2s',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: isPremiumOnly ? 'rgba(245,158,11,0.15)' : 'var(--bg-card)',
                border: `1px solid ${isPremiumOnly ? 'rgba(245,158,11,0.3)' : 'var(--border)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s',
              }}>
                {isPremiumOnly ? <Crown size={14} style={{ color: '#F59E0B' }} /> : <Lock size={14} style={{ color: 'var(--muted)' }} />}
              </div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>Premium members only</p>
                <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 1 }}>
                  {isPremiumOnly ? 'Only premium subscribers can enter' : 'Open to all members'}
                </p>
              </div>
            </div>
            <button type="button" onClick={() => setIsPremiumOnly(!isPremiumOnly)} style={{
              width: 44, height: 24, borderRadius: 12,
              background: isPremiumOnly ? '#F59E0B' : 'var(--border)',
              border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.2s', flexShrink: 0,
            }}>
              <span style={{
                position: 'absolute', top: 3, width: 18, height: 18, borderRadius: '50%', background: '#fff',
                left: isPremiumOnly ? 23 : 3, transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
              }} />
            </button>
          </div>

          {/* Error/success */}
          <AnimatePresence>
            {message && (
              <motion.div
                initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                className={message.type === 'error' ? 'msg-error' : 'msg-success'}
              >
                {message.type === 'error'
                  ? <XCircle size={15} style={{ flexShrink: 0 }} />
                  : <CheckCircle size={15} style={{ flexShrink: 0 }} />}
                <span style={{ fontSize: 13 }}>{message.text}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit */}
          <motion.button
            type="submit" disabled={loading || !title || !description}
            className="btn btn-primary"
            style={{ width: '100%', padding: '13px', fontSize: 14, fontWeight: 600, opacity: (!title || !description || loading) ? 0.6 : 1 }}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <Loader size={16} className="animate-spin" /> Creating...
              </span>
            ) : (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <Trophy size={16} /> Launch Challenge
              </span>
            )}
          </motion.button>

          <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--subtle)' }}>
            Challenges go live immediately and appear in the challenges feed
          </p>
        </form>
      </motion.div>
    </div>
  )
}
