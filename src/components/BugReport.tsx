'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bug, X, Send, Loader } from 'lucide-react'
import { useSupabase } from '@/components/providers/SupabaseProvider'
import toast from 'react-hot-toast'

export default function BugReport() {
  const { user } = useSupabase()
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const currentUrl = typeof window !== 'undefined' ? window.location.href : ''

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !description.trim()) {
      toast.error('Please fill in title and description')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/bug-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          url: currentUrl,
          userEmail: user?.email || 'Anonymous',
        }),
      })

      if (res.ok) {
        toast.success('Bug report sent!')
        setTitle('')
        setDescription('')
        setOpen(false)
      } else {
        toast.error('Failed to send report')
      }
    } catch {
      toast.error('Failed to send report')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      {/* Floating bug button */}
      <motion.button
        onClick={() => setOpen(true)}
        className="fixed bottom-5 left-5 z-50 flex h-10 w-10 items-center justify-center rounded-full cursor-pointer"
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          color: 'var(--muted)',
          boxShadow: 'var(--shadow-lg)',
        }}
        whileHover={{ scale: 1.1, borderColor: 'var(--primary)' }}
        whileTap={{ scale: 0.95 }}
        title="Report a bug"
      >
        <Bug size={18} />
      </motion.button>

      {/* Modal overlay + popup */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50"
              style={{ background: 'rgba(0,0,0,0.5)' }}
              onClick={() => setOpen(false)}
            />

            {/* Popup */}
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="fixed bottom-18 left-5 z-50 w-80 glass-lg rounded-xl p-4"
              style={{ border: '1px solid var(--border)' }}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Bug size={16} style={{ color: 'var(--primary)' }} />
                  <span
                    className="text-sm font-semibold"
                    style={{ color: 'var(--text)', fontFamily: 'var(--font-mono)' }}
                  >
                    Bug Report
                  </span>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-center rounded-md p-1 cursor-pointer transition-colors"
                  style={{ color: 'var(--muted)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--muted)')}
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3">
                {/* Title */}
                <input
                  type="text"
                  placeholder="Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-lg px-3 py-2 text-sm outline-none transition-colors"
                  style={{
                    background: 'var(--bg)',
                    border: '1px solid var(--border)',
                    color: 'var(--text)',
                    fontFamily: 'var(--font)',
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--primary)')}
                  onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
                />

                {/* Description */}
                <textarea
                  placeholder="Describe the bug..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full rounded-lg px-3 py-2 text-sm outline-none resize-none transition-colors"
                  style={{
                    background: 'var(--bg)',
                    border: '1px solid var(--border)',
                    color: 'var(--text)',
                    fontFamily: 'var(--font)',
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--primary)')}
                  onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
                />

                {/* Current URL */}
                <div
                  className="rounded-lg px-3 py-2 text-xs truncate"
                  style={{
                    background: 'var(--bg)',
                    border: '1px solid var(--border)',
                    color: 'var(--muted)',
                  }}
                  title={currentUrl}
                >
                  Page: {currentUrl}
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors cursor-pointer disabled:opacity-50"
                  style={{
                    background: 'var(--primary)',
                    color: '#fff',
                  }}
                  onMouseEnter={(e) => {
                    if (!submitting) e.currentTarget.style.background = 'var(--primary-hover)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'var(--primary)'
                  }}
                >
                  {submitting ? (
                    <Loader size={16} className="animate-spin" />
                  ) : (
                    <Send size={14} />
                  )}
                  {submitting ? 'Sending...' : 'Send Report'}
                </button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
