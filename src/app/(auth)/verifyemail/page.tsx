'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, Loader, XCircle } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

function VerifyEmailContent() {
  const router = useRouter()
  const [status, setStatus] = useState<'loading' | 'verified' | 'error'>('loading')

  useEffect(() => {
    // Check if this was a successful verification from callback
    const params = new URLSearchParams(window.location.search)
    const hash = window.location.hash

    const isError = params.get('error') === '1'
    if (isError) {
      setStatus('error')
      return
    }

    // Simulate the brief "verifying" animation — real verification happened in /api/auth/callback
    const t = setTimeout(() => setStatus('verified'), 1800)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    if (status === 'verified') {
      const t = setTimeout(() => router.push('/login?verified=1'), 2400)
      return () => clearTimeout(t)
    }
  }, [status, router])

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)',
      fontFamily: 'var(--font)', display: 'flex', alignItems: 'center',
      justifyContent: 'center', padding: '24px',
    }}>
      {/* Background grid */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none',
        backgroundImage: 'linear-gradient(rgba(99,102,241,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.05) 1px, transparent 1px)',
        backgroundSize: '48px 48px',
      }} />
      <div style={{
        position: 'fixed', top: '30%', left: '50%', transform: 'translateX(-50%)',
        width: 500, height: 300, pointerEvents: 'none',
        background: 'radial-gradient(ellipse, rgba(99,102,241,0.1) 0%, transparent 70%)',
      }} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: 380 }}
      >
        {/* Logo */}
        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none', marginBottom: 40 }}>
          <div style={{ position: 'relative', width: 28, height: 28 }}>
            <Image src="/logo.png" alt="SANDNCO" fill style={{ objectFit: 'contain' }} />
          </div>
          <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.02em' }}>SANDNCO</span>
        </Link>

        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 16, padding: '48px 32px',
        }}>
          <AnimatePresence mode="wait">

            {/* Loading state */}
            {status === 'loading' && (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'center' }}>
                  <div style={{ position: 'relative', width: 64, height: 64 }}>
                    <div style={{
                      position: 'absolute', inset: 0, borderRadius: '50%',
                      border: '2px solid var(--border)',
                    }} />
                    <div style={{
                      position: 'absolute', inset: 0, borderRadius: '50%',
                      border: '2px solid transparent',
                      borderTopColor: 'var(--primary)',
                      animation: 'spin 0.8s linear infinite',
                    }} />
                    <div style={{
                      position: 'absolute', inset: 10, borderRadius: '50%',
                      background: 'var(--primary-dim)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Loader style={{ width: 20, height: 20, color: 'var(--primary)' }} />
                    </div>
                  </div>
                </div>
                <h2 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.025em', marginBottom: 8 }}>
                  Verifying your email...
                </h2>
                <p style={{ fontSize: 14, color: 'var(--muted)' }}>
                  Hold on, this takes just a second.
                </p>
              </motion.div>
            )}

            {/* Success state */}
            {status === 'verified' && (
              <motion.div
                key="verified"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.1 }}
                  style={{ marginBottom: 24, display: 'flex', justifyContent: 'center' }}
                >
                  <div style={{
                    width: 64, height: 64, borderRadius: '50%',
                    background: 'rgba(34,197,94,0.12)',
                    border: '2px solid rgba(34,197,94,0.4)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <CheckCircle style={{ width: 28, height: 28, color: '#22c55e' }} />
                  </div>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                  <h2 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.025em', marginBottom: 8 }}>
                    Email verified!
                  </h2>
                  <p style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 24 }}>
                    Your account is confirmed. Taking you to sign in...
                  </p>
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    fontSize: 13, color: 'var(--subtle)',
                  }}>
                    <Loader style={{ width: 13, height: 13, animation: 'spin 1s linear infinite' }} />
                    Redirecting to login
                  </div>
                  <div style={{ marginTop: 20 }}>
                    <Link href="/login?verified=1" style={{ fontSize: 13, color: 'var(--primary)', textDecoration: 'none' }}>
                      Go now instead
                    </Link>
                  </div>
                </motion.div>
              </motion.div>
            )}

            {/* Error state */}
            {status === 'error' && (
              <motion.div key="error" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'center' }}>
                  <div style={{
                    width: 64, height: 64, borderRadius: '50%',
                    background: 'rgba(239,68,68,0.1)',
                    border: '2px solid rgba(239,68,68,0.3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <XCircle style={{ width: 28, height: 28, color: '#ef4444' }} />
                  </div>
                </div>
                <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>
                  Verification failed
                </h2>
                <p style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 24 }}>
                  The link may have expired or been used already. Try signing up again or request a new link.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <Link href="/signup">
                    <button style={{
                      width: '100%', padding: '11px', fontSize: 14, fontWeight: 600,
                      background: 'var(--primary)', color: '#fff', border: 'none',
                      borderRadius: 8, cursor: 'pointer', fontFamily: 'var(--font)',
                    }}>
                      Try signing up again
                    </button>
                  </Link>
                  <Link href="/login">
                    <button style={{
                      width: '100%', padding: '11px', fontSize: 14, fontWeight: 500,
                      background: 'var(--bg-elevated)', color: 'var(--muted)',
                      border: '1px solid var(--border)', borderRadius: 8,
                      cursor: 'pointer', fontFamily: 'var(--font)',
                    }}>
                      Back to login
                    </button>
                  </Link>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader style={{ width: 20, height: 20, color: 'var(--primary)', animation: 'spin 1s linear infinite' }} />
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  )
}
