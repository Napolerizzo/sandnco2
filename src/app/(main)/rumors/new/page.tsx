'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Flame, AlertTriangle, CheckCircle, Loader, Eye, EyeOff, Hash, X } from 'lucide-react'
import { generateAnonymousAlias } from '@/lib/utils'
import { track, EVENTS } from '@/lib/posthog'
import toast from 'react-hot-toast'

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
      setMessage({ type: 'error', text: 'Accept the community rules first.' })
      return
    }
    if (title.length < 10) {
      setMessage({ type: 'error', text: 'Title needs to be at least 10 characters.' })
      return
    }
    if (content.length < 30) {
      setMessage({ type: 'error', text: 'Tell us more — minimum 30 characters.' })
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
      setMessage({ type: 'error', text: `Content policy violation: ${reason || 'This rumor may violate our rules.'}` })
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
      setMessage({ type: 'error', text: error.message })
      setLoading(false)
      return
    }

    // Award XP
    await supabase.rpc('increment_xp', { user_id: user.id, amount: 50 }).catch(() => {})

    track(EVENTS.RUMOR_POSTED, { category, is_anonymous: isAnonymous, has_city: !!city })
    toast.success('Rumor dropped. The city is listening. 👀')
    router.push(`/rumors/${data.id}`)
  }, [title, content, category, tags, isAnonymous, city, rulesAccepted, supabase, router])

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      {/* Header */}
      <motion.div className="mb-8" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-2 mb-2">
          <Flame className="w-5 h-5 text-orange-400" />
          <h1 className="font-display text-3xl text-gradient-gold" style={{ fontFamily: "'Bebas Neue', cursive" }}>
            DROP A RUMOR
          </h1>
        </div>
        <p className="text-zinc-500 font-mono text-xs">Anonymous by default. The city will decide what&apos;s real.</p>
      </motion.div>

      {/* Rules banner */}
      <motion.div
        className="p-4 rounded-xl bg-yellow-400/5 border border-yellow-400/20 mb-6"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
      >
        <h3 className="font-tech text-xs text-yellow-400 tracking-widest uppercase mb-2">CITY RULES</h3>
        <ul className="space-y-1 text-xs font-mono text-zinc-400">
          <li className="flex items-start gap-2"><span className="text-yellow-400 mt-0.5">•</span>No direct naming of private individuals</li>
          <li className="flex items-start gap-2"><span className="text-yellow-400 mt-0.5">•</span>No accusations of crimes without evidence</li>
          <li className="flex items-start gap-2"><span className="text-yellow-400 mt-0.5">•</span>No hate speech or targeted harassment</li>
          <li className="flex items-start gap-2"><span className="text-yellow-400 mt-0.5">•</span>AI will scan your content before posting</li>
        </ul>
        <label className="flex items-center gap-2 mt-3 cursor-pointer">
          <input
            type="checkbox"
            checked={rulesAccepted}
            onChange={e => setRulesAccepted(e.target.checked)}
            className="w-4 h-4 accent-yellow-400"
          />
          <span className="font-mono text-xs text-zinc-300">I understand and accept these rules</span>
        </label>
      </motion.div>

      <motion.form
        onSubmit={handleSubmit}
        className="space-y-5"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
      >
        {/* Title */}
        <div>
          <label className="font-tech text-xs text-zinc-400 tracking-widest uppercase block mb-2">Rumor Title</label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="What's the tea? (Be cryptic)"
            maxLength={150}
            className="input-cyber w-full rounded-xl px-4 py-3 text-sm"
          />
          <div className="flex justify-between mt-1">
            <span className="font-mono text-xs text-zinc-600">Make it intriguing</span>
            <span className="font-mono text-xs text-zinc-600">{title.length}/150</span>
          </div>
        </div>

        {/* Content */}
        <div>
          <label className="font-tech text-xs text-zinc-400 tracking-widest uppercase block mb-2">The Story</label>
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Spill it. What do you know? What did you hear? Keep it cryptic enough to be interesting."
            maxLength={2000}
            rows={6}
            className="input-cyber w-full rounded-xl px-4 py-3 text-sm resize-none"
          />
          <div className="flex justify-between mt-1">
            <span className="font-mono text-xs text-zinc-600">Min 30 chars</span>
            <span className="font-mono text-xs text-zinc-600">{content.length}/2000</span>
          </div>
        </div>

        {/* Category */}
        <div>
          <label className="font-tech text-xs text-zinc-400 tracking-widest uppercase block mb-2">Category</label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-mono transition-all ${
                  category === cat
                    ? 'bg-yellow-400 text-black font-bold'
                    : 'bg-white/5 text-zinc-400 hover:bg-white/10 border border-white/5'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="font-tech text-xs text-zinc-400 tracking-widest uppercase block mb-2">
            Tags <span className="text-zinc-600">(optional, max 5)</span>
          </label>
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
              <input
                type="text"
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())}
                placeholder="Add a tag"
                className="input-cyber w-full rounded-xl pl-9 pr-4 py-2 text-sm"
              />
            </div>
            <button type="button" onClick={addTag} className="btn-ghost px-4 rounded-xl text-xs">
              Add
            </button>
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {tags.map(tag => (
                <span key={tag} className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-full px-3 py-1 text-xs font-mono text-zinc-300">
                  #{tag}
                  <button type="button" onClick={() => setTags(tags.filter(t => t !== tag))}>
                    <X className="w-3 h-3 text-zinc-500 hover:text-red-400 transition-colors" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* City */}
        <div>
          <label className="font-tech text-xs text-zinc-400 tracking-widest uppercase block mb-2">
            City <span className="text-zinc-600">(optional)</span>
          </label>
          <input
            type="text"
            value={city}
            onChange={e => setCity(e.target.value)}
            placeholder="Which city does this rumor come from?"
            className="input-cyber w-full rounded-xl px-4 py-3 text-sm"
          />
        </div>

        {/* Anonymous toggle */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-white/3 border border-white/5">
          <div>
            <p className="font-tech text-xs text-white tracking-wide">Post Anonymously</p>
            <p className="font-mono text-xs text-zinc-500 mt-0.5">
              {isAnonymous ? 'Your identity will be hidden behind an alias' : 'Your username will be visible'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsAnonymous(!isAnonymous)}
            className={`relative w-10 h-6 rounded-full transition-all ${isAnonymous ? 'bg-yellow-400' : 'bg-white/10'}`}
          >
            <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${isAnonymous ? 'left-[18px]' : 'left-0.5'}`} />
          </button>
        </div>

        {/* Message */}
        <AnimatePresence>
          {message && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl text-xs font-mono ${
                message.type === 'error'
                  ? 'bg-red-500/10 border border-red-500/20 text-red-400'
                  : 'bg-green-500/10 border border-green-500/20 text-green-400'
              }`}
            >
              {message.type === 'error' ? <AlertTriangle className="w-4 h-4 flex-shrink-0" /> : <CheckCircle className="w-4 h-4 flex-shrink-0" />}
              {message.text}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Submit */}
        <motion.button
          type="submit"
          disabled={loading || !rulesAccepted}
          className="btn-primary w-full py-4 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50"
          whileTap={{ scale: 0.98 }}
        >
          {aiChecking ? (
            <><Loader className="w-4 h-4 animate-spin" /> AI SCANNING...</>
          ) : loading ? (
            <><Loader className="w-4 h-4 animate-spin" /> DROPPING...</>
          ) : (
            <><Flame className="w-4 h-4" /> DROP THE RUMOR</>
          )}
        </motion.button>
      </motion.form>
    </div>
  )
}
