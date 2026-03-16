'use client'

import { motion } from 'framer-motion'
import { useSupabase } from '@/components/providers/SupabaseProvider'
import { useRouter } from 'next/navigation'
import { Lock, Clock, LogOut } from 'lucide-react'

export default function BetaWaitPage() {
  const { supabase, user } = useSupabase()
  const router = useRouter()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'var(--bg)' }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass-lg w-full max-w-md rounded-2xl p-8 text-center"
        style={{ border: '1px solid var(--border)' }}
      >
        {/* Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full"
          style={{ background: 'var(--primary-dim)' }}
        >
          <Lock size={28} style={{ color: 'var(--primary)' }} />
        </motion.div>

        {/* Heading */}
        <h1
          className="text-2xl font-bold mb-2"
          style={{ color: 'var(--text)', fontFamily: 'var(--font-mono)' }}
        >
          Beta Access Only
        </h1>

        {/* Description */}
        <p className="mb-4 text-sm" style={{ color: 'var(--muted)' }}>
          <span className="font-semibold" style={{ color: 'var(--text-secondary)' }}>
            sandnco.lol
          </span>{' '}
          is currently in closed beta. You&apos;ll get access soon.
        </p>

        {/* Waitlist info */}
        <div
          className="glass-sm rounded-lg p-4 mb-6 flex items-center gap-3"
          style={{ border: '1px solid var(--border)' }}
        >
          <Clock size={18} style={{ color: 'var(--primary)', flexShrink: 0 }} />
          <div className="text-left">
            <p className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
              Your email is on the waitlist
            </p>
            {user?.email && (
              <p className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>
                {user.email}
              </p>
            )}
          </div>
        </div>

        {/* Logout button */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors cursor-pointer"
          style={{
            background: 'var(--bg-hover)',
            color: 'var(--muted)',
            border: '1px solid var(--border)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--border)'
            e.currentTarget.style.color = 'var(--text)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'var(--bg-hover)'
            e.currentTarget.style.color = 'var(--muted)'
          }}
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </motion.div>
    </div>
  )
}
