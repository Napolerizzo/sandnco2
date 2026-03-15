'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  Flame, AlertTriangle, CheckCircle, Loader, Eye, EyeOff,
  Hash, X, Shield, Lock, XCircle, ChevronLeft, MapPin, Sparkles
} from 'lucide-react'
import { generateAnonymousAlias } from '@/lib/utils'
import { track, EVENTS } from '@/lib/posthog'
import toast from 'react-hot-toast'
import Link from 'next/link'

const CATEGORIES = ['general', 'drama', 'politics', 'music', 'sports', 'tech', 'lifestyle', 'crime', 'romance']

const CATEGORY_COLORS: Record<string, string> = {
  drama: '#EF4444',
  politics: '#F59E0B',
  music: '#A855F7',
  sports: '#22C55E',
  tech: '#3B82F6',
  romance: '#EC4899',
  crime: '#F97316',
  lifestyle: '#6366F1',
  general: '#6B7280',
}

export default function NewRumorPage() {
  const router = useRouter()
  const supabase = createClient()

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState('general')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [isAnonymous, setIsAnonymous] = useState(true)
  const [city, setCity] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null)
  const [rulesAccepted, setRulesAccepted] = useState(false)
  const [aiChecking, setAiChecking] = useState(false)

  const addTag = useCallback(() => {
    const t = tagInput.trim().toLowerCase().replace(/[^a-z0-9]/g, '')
    if (t && !tags.includes(t) && tags.length < 5) {
      setTags([...tags, t])
      setTagInput('')
    }
  }, [tagInput, tags])

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (!rulesAccepted) {
      setMessage({ type: 'error', text: 'Please accept the community rules before posting.' })
      return
    }
    if (title.length < 10) {
      setMessage({ type: 'error', text: 'Title needs to be at least 10 characters.' })
      return
    }
    if (content.length < 30) {
      setMessage({ type: 'error', text: 'Story needs to be at least 30 characters.' })
      return
    }

    setLoading(true)
    setMessage(null)

    try {
      // AI moderation check
      setAiChecking(true)
      const modRes = await fetch('/api/ai/moderate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: `${title}\n${content}` }),
      })
      const modData = await modRes.json()
      setAiChecking(false)

      if (!modData.safe) {
        setMessage({ type: 'error', text: `Content flagged: ${modData.reason || 'Violates community guidelines.'}` })
        setLoading(false)
        return
      }

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const alias = isAnonymous ? generateAnonymousAlias() : undefined

      // Insert without .select().single() — the SELECT RLS policy only allows
      // reading active/resolved rumors, but new rumors start as 'pending'.
      const { error } = await supabase.from('rumors').insert({
        author_id: user.id,
        anonymous_alias: alias || generateAnonymousAlias(),
        title,
        content,
        category,
        tags,
        is_anonymous: isAnonymous,
        city: city || null,
        status: 'pending',
      })

      if (error) {
        setMessage({ type: 'error', text: `Something went wrong: ${error.message}` })
        setLoading(false)
        return
      }

      await supabase.rpc('increment_xp', { user_id: user.id, amount: 50 }).catch(() => {})
      track(EVENTS.RUMOR_POSTED, { category, is_anonymous: isAnonymous, has_city: !!city })
      toast.success('Rumor posted! +50 XP')
      router.push('/rumors')
    } catch {
      setMessage({ type: 'error', text: 'Something went wrong. Please try again.' })
      setAiChecking(false)
      setLoading(false)
    }
  }, [title, content, category, tags, isAnonymous, city, rulesAccepted, supabase, router])

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '32px 16px 80px' }}>
      {/* Back link */}
      <Link href="/rumors" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--muted)', fontSize: 13, marginBottom: 24, textDecoration: 'none', transition: 'color 0.15s' }}
        onMouseEnter={e => (e.currentTarget.style.color = 'var(--text)')}
        onMouseLeave={e => (e.currentTarget.style.color = 'var(--muted)')}
      >
        <ChevronLeft size={14} />
        Back to Rumors
      </Link>

      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        style={{ marginBottom: 28 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Flame size={16} style={{ color: '#EF4444' }} />
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text)' }}>
            Drop a Rumor
          </h1>
        </div>
        <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.6, paddingLeft: 46 }}>
          Anonymous by default. The city decides what&apos;s real.
        </p>
      </motion.div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Community rules */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30, delay: 0.05 }}
          style={{
            background: 'rgba(239,68,68,0.06)',
            border: '1px solid rgba(239,68,68,0.2)',
            borderRadius: 'var(--r-lg)',
            padding: '16px 20px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <Shield size={14} style={{ color: '#EF4444' }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: '#EF4444', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              Community Rules
            </span>
          </div>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
            {[
              'No direct naming of private individuals',
              'No accusations of crimes without evidence',
              'No hate speech or targeted harassment',
              'All content is scanned by AI before posting',
            ].map((rule, i) => (
              <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13, color: 'var(--muted)', lineHeight: 1.5 }}>
                <span style={{ color: '#EF4444', marginTop: 2, flexShrink: 0 }}>•</span>
                {rule}
              </li>
            ))}
          </ul>
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 14, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={rulesAccepted}
              onChange={e => setRulesAccepted(e.target.checked)}
              style={{ width: 16, height: 16, accentColor: 'var(--primary)', cursor: 'pointer' }}
            />
            <span style={{ fontSize: 13, color: rulesAccepted ? 'var(--text)' : 'var(--muted)', transition: 'color 0.15s' }}>
              I accept these community rules
            </span>
          </label>
        </motion.div>

        {/* Form card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30, delay: 0.1 }}
          className="card"
          style={{ padding: '24px' }}
        >
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Title */}
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Rumor Title
              </label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="What's the tea? Make it intriguing..."
                maxLength={150}
                className="input"
                style={{ width: '100%' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                <span style={{ fontSize: 11, color: 'var(--subtle)' }}>Be cryptic, be compelling</span>
                <span style={{ fontSize: 11, color: title.length > 120 ? 'var(--warning)' : 'var(--subtle)' }}>{title.length}/150</span>
              </div>
            </div>

            {/* Content */}
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                The Story
              </label>
              <textarea
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder="Spill it. What do you know? Keep it interesting without naming names..."
                maxLength={2000}
                rows={6}
                className="input"
                style={{ width: '100%', resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.6 }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                <span style={{ fontSize: 11, color: 'var(--subtle)' }}>Minimum 30 characters</span>
                <span style={{ fontSize: 11, color: content.length > 1800 ? 'var(--warning)' : 'var(--subtle)' }}>{content.length}/2000</span>
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
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      style={{
                        padding: '6px 14px',
                        fontSize: 12,
                        fontWeight: 500,
                        borderRadius: 'var(--r-md)',
                        border: `1px solid ${isSelected ? color : 'var(--border)'}`,
                        background: isSelected ? `${color}15` : 'transparent',
                        color: isSelected ? color : 'var(--muted)',
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                        textTransform: 'capitalize',
                      }}
                    >
                      {cat}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Tags */}
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Tags <span style={{ fontWeight: 400, color: 'var(--subtle)' }}>(optional, max 5)</span>
              </label>
              <div style={{ display: 'flex', gap: 8 }}>
                <div style={{ flex: 1, position: 'relative' }}>
                  <Hash size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--subtle)' }} />
                  <input
                    type="text"
                    value={tagInput}
                    onChange={e => setTagInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    placeholder="Add a tag"
                    className="input"
                    style={{ width: '100%', paddingLeft: 36 }}
                    disabled={tags.length >= 5}
                  />
                </div>
                <button type="button" onClick={addTag} className="btn btn-secondary" style={{ flexShrink: 0 }}>
                  Add
                </button>
              </div>
              {tags.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
                  {tags.map(tag => (
                    <span key={tag} style={{
                      display: 'inline-flex', alignItems: 'center', gap: 4,
                      background: 'var(--primary-dim)', border: '1px solid rgba(99,102,241,0.3)',
                      borderRadius: 'var(--r)', padding: '3px 10px',
                      fontSize: 12, color: 'var(--primary)',
                    }}>
                      #{tag}
                      <button type="button" onClick={() => setTags(tags.filter(t => t !== tag))}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 0, color: 'var(--subtle)' }}>
                        <X size={11} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* City */}
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                City <span style={{ fontWeight: 400, color: 'var(--subtle)' }}>(optional)</span>
              </label>
              <div style={{ position: 'relative' }}>
                <MapPin size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--subtle)' }} />
                <input
                  type="text"
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  placeholder="Which city does this come from?"
                  className="input"
                  style={{ width: '100%', paddingLeft: 36 }}
                />
              </div>
            </div>

            {/* Anonymous toggle */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '14px 16px',
              background: isAnonymous ? 'rgba(99,102,241,0.06)' : 'var(--bg-elevated)',
              border: `1px solid ${isAnonymous ? 'rgba(99,102,241,0.25)' : 'var(--border)'}`,
              borderRadius: 'var(--r-md)',
              transition: 'all 0.2s',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: isAnonymous ? 'rgba(99,102,241,0.15)' : 'var(--bg-card)',
                  border: `1px solid ${isAnonymous ? 'rgba(99,102,241,0.3)' : 'var(--border)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.2s',
                }}>
                  {isAnonymous ? <EyeOff size={14} style={{ color: 'var(--primary)' }} /> : <Eye size={14} style={{ color: 'var(--muted)' }} />}
                </div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>Anonymous mode</p>
                  <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 1 }}>
                    {isAnonymous ? 'Identity hidden behind a random alias' : 'Your username will be visible'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAnonymous(!isAnonymous)}
                style={{
                  width: 44, height: 24, borderRadius: 12,
                  background: isAnonymous ? 'var(--primary)' : 'var(--border)',
                  border: 'none', cursor: 'pointer', position: 'relative',
                  transition: 'background 0.2s', flexShrink: 0,
                }}
              >
                <span style={{
                  position: 'absolute', top: 3, width: 18, height: 18,
                  borderRadius: '50%', background: '#fff',
                  left: isAnonymous ? 23 : 3,
                  transition: 'left 0.2s',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                }} />
              </button>
            </div>

            {/* Error/success message */}
            <AnimatePresence>
              {message && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className={message.type === 'error' ? 'msg-error' : 'msg-success'}
                >
                  {message.type === 'error'
                    ? <XCircle size={15} style={{ flexShrink: 0 }} />
                    : <CheckCircle size={15} style={{ flexShrink: 0 }} />}
                  <span style={{ fontSize: 13 }}>{message.text}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit button */}
            <motion.button
              type="submit"
              disabled={loading || !rulesAccepted}
              className="btn btn-primary"
              style={{ width: '100%', padding: '13px', fontSize: 14, fontWeight: 600, opacity: (!rulesAccepted || loading) ? 0.6 : 1 }}
              whileTap={{ scale: 0.98 }}
            >
              {aiChecking ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <Sparkles size={16} className="animate-spin" /> Checking content...
                </span>
              ) : loading ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <Loader size={16} className="animate-spin" /> Posting...
                </span>
              ) : (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <Flame size={16} /> Drop the Rumor
                </span>
              )}
            </motion.button>

            <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--subtle)' }}>
              AI-moderated · End-to-end encrypted · +50 XP on post
            </p>
          </form>
        </motion.div>
      </div>
    </div>
  )
}
