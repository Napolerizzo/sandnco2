'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  Flame, AlertTriangle, CheckCircle, Loader, Eye, EyeOff,
  Hash, X, Terminal, Shield, Lock, XCircle, ChevronLeft
} from 'lucide-react'
import { generateAnonymousAlias } from '@/lib/utils'
import { track, EVENTS } from '@/lib/posthog'
import toast from 'react-hot-toast'
import Link from 'next/link'

const CATEGORIES = ['general', 'drama', 'politics', 'music', 'sports', 'tech', 'lifestyle', 'crime', 'romance']

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
      setMessage({ type: 'error', text: 'PROTOCOL_ERROR: ACCEPT_COMMUNITY_RULES_FIRST' })
      return
    }
    if (title.length < 10) {
      setMessage({ type: 'error', text: 'VALIDATION_ERROR: TITLE_MIN_10_CHARACTERS' })
      return
    }
    if (content.length < 30) {
      setMessage({ type: 'error', text: 'VALIDATION_ERROR: CONTENT_MIN_30_CHARACTERS' })
      return
    }

    setLoading(true)
    setAiChecking(true)
    setMessage(null)

    // AI moderation check
    const modRes = await fetch('/api/ai/moderate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: `${title}\n${content}` }),
    })
    const { safe, reason } = await modRes.json()
    setAiChecking(false)

    if (!safe) {
      setMessage({ type: 'error', text: `CONTENT_VIOLATION: ${(reason || 'POLICY_BREACH').toUpperCase().replace(/\s+/g, '_')}` })
      setLoading(false)
      return
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const alias = isAnonymous ? generateAnonymousAlias() : undefined

    const { data, error } = await supabase.from('rumors').insert({
      author_id: user.id,
      anonymous_alias: alias || generateAnonymousAlias(),
      title,
      content,
      category,
      tags,
      is_anonymous: isAnonymous,
      city: city || null,
      status: 'pending',
    }).select('id').single()

    if (error) {
      setMessage({ type: 'error', text: `DB_ERROR: ${error.message.toUpperCase().replace(/\s+/g, '_')}` })
      setLoading(false)
      return
    }

    // Award XP
    await supabase.rpc('increment_xp', { user_id: user.id, amount: 50 }).catch(() => {})

    track(EVENTS.RUMOR_POSTED, { category, is_anonymous: isAnonymous, has_city: !!city })
    toast.success('RUMOR_DEPLOYED_SUCCESSFULLY')
    router.push(`/rumors/${data.id}`)
  }, [title, content, category, tags, isAnonymous, city, rulesAccepted, supabase, router])

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      {/* Back link */}
      <Link href="/rumors">
        <motion.button
          whileHover={{ x: -4 }}
          className="flex items-center gap-2 text-[10px] text-[var(--text-dim)] hover:text-[var(--cyan)] mb-6 transition-colors uppercase tracking-[0.2em] group"
        >
          <ChevronLeft className="w-3.5 h-3.5 group-hover:animate-pulse" />
          <span className="border-b border-[var(--cyan-border)] group-hover:border-[var(--cyan)]">BACK_TO_RUMORS</span>
        </motion.button>
      </Link>

      <div className="terminal">
        <div className="terminal-header">
          <div className="terminal-dots"><span /><span /><span /></div>
          <div className="terminal-title">
            <Flame className="w-3 h-3" /> DROP_RUMOR_PROTOCOL
          </div>
        </div>

        <div className="terminal-body">
          {/* Header */}
          <motion.div className="mb-6" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-xl font-extrabold text-glow-cyan uppercase tracking-wider mb-1">
              DEPLOY_NEW_RUMOR
            </h1>
            <p className="text-[10px] text-[var(--text-dim)] tracking-wider">
              ANONYMOUS_BY_DEFAULT. THE_CITY_WILL_DECIDE_WHAT&apos;S_REAL.
            </p>
          </motion.div>

          {/* Rules banner */}
          <motion.div
            className="p-4 border border-[var(--red)]/30 bg-[var(--red)]/5 mb-6"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
          >
            <h3 className="text-[10px] text-[var(--red)] tracking-[0.2em] uppercase mb-2 flex items-center gap-2">
              <Shield className="w-3 h-3" /> CITY_RULES
            </h3>
            <ul className="space-y-1 text-[10px] text-[var(--text-dim)]">
              <li className="flex items-start gap-2"><span className="text-[var(--red)] mt-0.5">▸</span>No direct naming of private individuals</li>
              <li className="flex items-start gap-2"><span className="text-[var(--red)] mt-0.5">▸</span>No accusations of crimes without evidence</li>
              <li className="flex items-start gap-2"><span className="text-[var(--red)] mt-0.5">▸</span>No hate speech or targeted harassment</li>
              <li className="flex items-start gap-2"><span className="text-[var(--red)] mt-0.5">▸</span>AI will scan your content before posting</li>
            </ul>
            <label className="flex items-center gap-2 mt-3 cursor-pointer">
              <input
                type="checkbox"
                checked={rulesAccepted}
                onChange={e => setRulesAccepted(e.target.checked)}
                className="w-3.5 h-3.5 accent-[var(--cyan)]"
              />
              <span className="text-[10px] text-[var(--text-dim)] tracking-wider">I_ACCEPT_THESE_RULES</span>
            </label>
          </motion.div>

          <motion.form
            onSubmit={handleSubmit}
            className="space-y-5"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
          >
            {/* Title */}
            <div>
              <label className="label-terminal">
                <Flame className="w-3 h-3" /> RUMOR_TITLE
              </label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="WHAT'S_THE_TEA? (BE_CRYPTIC)"
                maxLength={150}
                className="input-terminal w-full"
              />
              <div className="flex justify-between mt-1">
                <span className="text-[8px] text-[var(--text-ghost)] tracking-wider">MAKE_IT_INTRIGUING</span>
                <span className="text-[8px] text-[var(--text-ghost)]">{title.length}/150</span>
              </div>
            </div>

            {/* Content */}
            <div>
              <label className="label-terminal">
                <Terminal className="w-3 h-3" /> THE_STORY
              </label>
              <textarea
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder="SPILL_IT. WHAT_DO_YOU_KNOW? KEEP_IT_CRYPTIC_ENOUGH_TO_BE_INTERESTING."
                maxLength={2000}
                rows={6}
                className="input-terminal w-full resize-none"
              />
              <div className="flex justify-between mt-1">
                <span className="text-[8px] text-[var(--text-ghost)] tracking-wider">MIN_30_CHARS</span>
                <span className="text-[8px] text-[var(--text-ghost)]">{content.length}/2000</span>
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="label-terminal">
                <Hash className="w-3 h-3" /> CATEGORY
              </label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`px-3 py-1.5 text-[10px] tracking-[0.1em] border transition-all uppercase ${
                      category === cat
                        ? 'text-[var(--cyan)] border-[var(--cyan)] bg-[var(--cyan-ghost)]'
                        : 'text-[var(--text-dim)] border-[var(--cyan-border)] hover:bg-[var(--cyan-ghost)]'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="label-terminal">
                <Hash className="w-3 h-3" /> TAGS <span className="text-[var(--text-ghost)]">(OPTIONAL, MAX 5)</span>
              </label>
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-[var(--text-dim)]" />
                  <input
                    type="text"
                    value={tagInput}
                    onChange={e => setTagInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    placeholder="ADD_TAG"
                    className="input-terminal input-terminal-icon w-full"
                  />
                </div>
                <button type="button" onClick={addTag} className="btn-outline px-4 text-[10px]">
                  ADD
                </button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {tags.map(tag => (
                    <span key={tag} className="flex items-center gap-1 border border-[var(--cyan-border)] bg-[var(--cyan-ghost)] px-2 py-1 text-[9px] text-[var(--cyan)] tracking-wider uppercase">
                      #{tag}
                      <button type="button" onClick={() => setTags(tags.filter(t => t !== tag))}>
                        <X className="w-2.5 h-2.5 text-[var(--text-dim)] hover:text-[var(--red)] transition-colors" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* City */}
            <div>
              <label className="label-terminal">
                <Terminal className="w-3 h-3" /> CITY <span className="text-[var(--text-ghost)]">(OPTIONAL)</span>
              </label>
              <input
                type="text"
                value={city}
                onChange={e => setCity(e.target.value)}
                placeholder="WHICH_CITY_DOES_THIS_COME_FROM?"
                className="input-terminal w-full"
              />
            </div>

            {/* Anonymous toggle */}
            <div className="flex items-center justify-between p-4 border border-[var(--cyan-border)] bg-[var(--cyan-ghost)]">
              <div>
                <p className="text-[10px] text-white tracking-wider uppercase font-bold">ANONYMOUS_MODE</p>
                <p className="text-[9px] text-[var(--text-dim)] mt-0.5 tracking-wider">
                  {isAnonymous ? 'IDENTITY_HIDDEN_BEHIND_ALIAS' : 'USERNAME_WILL_BE_VISIBLE'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAnonymous(!isAnonymous)}
                className={`relative w-10 h-5 border transition-all ${
                  isAnonymous
                    ? 'bg-[var(--cyan)]/20 border-[var(--cyan)]'
                    : 'bg-transparent border-[var(--cyan-border)]'
                }`}
              >
                <span className={`absolute top-0.5 w-4 h-4 transition-all ${
                  isAnonymous
                    ? 'left-[22px] bg-[var(--cyan)]'
                    : 'left-0.5 bg-[var(--text-dim)]'
                }`} />
              </button>
            </div>

            {/* Message */}
            <AnimatePresence>
              {message && (
                <motion.div
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className={`${message.type === 'error' ? 'msg-error' : 'msg-success'}`}
                >
                  {message.type === 'error'
                    ? <XCircle className="w-4 h-4 flex-shrink-0" />
                    : <CheckCircle className="w-4 h-4 flex-shrink-0" />}
                  <span className="font-bold text-[10px]">{message.text}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={loading || !rulesAccepted}
              className="btn-execute w-full"
              whileTap={{ scale: 0.98 }}
            >
              <span className="relative z-10 flex items-center justify-center gap-3">
                {aiChecking ? (
                  <><Loader className="w-4 h-4 animate-spin" /> AI_SCANNING...</>
                ) : loading ? (
                  <><Loader className="w-4 h-4 animate-spin" /> DEPLOYING...</>
                ) : (
                  <><Flame className="w-4 h-4" /> DEPLOY_RUMOR</>
                )}
              </span>
            </motion.button>
          </motion.form>
        </div>

        <div className="terminal-footer">
          <Lock className="w-3 h-3" />
          MODERATION: AI_POWERED | ENCRYPTION: AES-256
        </div>
      </div>
    </div>
  )
}
