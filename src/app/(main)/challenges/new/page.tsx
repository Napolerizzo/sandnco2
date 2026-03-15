'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Trophy, ArrowLeft, Loader } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useSupabase } from '@/components/providers/SupabaseProvider'
import toast from 'react-hot-toast'
import Link from 'next/link'

export default function NewChallengePage() {
  const router = useRouter()
  const supabase = createClient()
  const { user, loading: authLoading } = useSupabase()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [rules, setRules] = useState('')
  const [category, setCategory] = useState('general')
  const [entryFee, setEntryFee] = useState('')
  const [maxPlayers, setMaxPlayers] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) { router.push('/login'); return }
    if (title.length < 5) { toast.error('Title needs at least 5 characters'); return }
    if (description.length < 20) { toast.error('Description needs at least 20 characters'); return }
    if (rules.length < 10) { toast.error('Rules need at least 10 characters'); return }

    setLoading(true)

    // Check premium status
    const { data: profile } = await supabase.from('users').select('is_premium').eq('id', user.id).single()
    if (!profile?.is_premium) {
      toast.error('Only premium members can create challenges')
      setLoading(false)
      return
    }

    const fee = parseFloat(entryFee) || 0
    const { data, error } = await supabase.from('challenges').insert({
      created_by: user.id,
      title,
      description,
      rules,
      category,
      entry_fee: fee,
      prize_pool: 0,
      max_players: maxPlayers ? parseInt(maxPlayers) : null,
      status: 'waiting_for_players',
    }).select('id').single()

    if (error) {
      toast.error('Failed to create challenge')
      setLoading(false)
      return
    }

    toast.success('Challenge created!')
    router.push(`/challenges`)
  }

  if (authLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <Loader size={24} className="animate-spin" style={{ color: 'var(--primary)' }} />
      </div>
    )
  }

  if (!user) {
    router.push('/login?next=/challenges/new')
    return null
  }

  const categories = ['general', 'creative', 'trivia', 'physical', 'social', 'tech']

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '32px 16px 80px' }}>
      <Link href="/challenges" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--muted)', textDecoration: 'none', marginBottom: 24 }}>
        <ArrowLeft size={14} /> Back to Challenges
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <div style={{ width: 40, height: 40, borderRadius: 'var(--r-md)', background: 'var(--primary-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Trophy size={20} style={{ color: '#a5b4fc' }} />
        </div>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text)', margin: 0 }}>
            Create Challenge
          </h1>
          <p style={{ fontSize: 13, color: 'var(--muted)', margin: 0 }}>Set the rules. Let the city compete.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div>
          <label className="label">Title</label>
          <input
            className="input"
            placeholder="e.g. Best Street Food Photo"
            value={title}
            onChange={e => setTitle(e.target.value)}
            maxLength={100}
          />
        </div>

        <div>
          <label className="label">Description</label>
          <textarea
            className="input"
            placeholder="Describe your challenge..."
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={4}
            style={{ resize: 'vertical', minHeight: 100 }}
          />
        </div>

        <div>
          <label className="label">Rules</label>
          <textarea
            className="input"
            placeholder="How does someone win?"
            value={rules}
            onChange={e => setRules(e.target.value)}
            rows={3}
            style={{ resize: 'vertical', minHeight: 80 }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <label className="label">Category</label>
            <select
              className="input"
              value={category}
              onChange={e => setCategory(e.target.value)}
            >
              {categories.map(c => (
                <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Entry Fee (INR)</label>
            <input
              className="input"
              type="number"
              placeholder="0 = free"
              value={entryFee}
              onChange={e => setEntryFee(e.target.value)}
              min={0}
            />
          </div>
        </div>

        <div>
          <label className="label">Max Players (optional)</label>
          <input
            className="input"
            type="number"
            placeholder="Leave empty for unlimited"
            value={maxPlayers}
            onChange={e => setMaxPlayers(e.target.value)}
            min={2}
          />
        </div>

        <motion.button
          type="submit"
          className="btn btn-primary btn-lg"
          disabled={loading}
          whileTap={{ scale: 0.98 }}
          style={{ marginTop: 8 }}
        >
          {loading ? <Loader size={16} className="animate-spin" /> : <Trophy size={16} />}
          {loading ? 'Creating...' : 'Create Challenge'}
        </motion.button>
      </form>
    </div>
  )
}
