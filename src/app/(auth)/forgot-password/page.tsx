'use client'

import { useState, useCallback, Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import Image from 'next/image'
import { Mail, ArrowLeft, Loader, CheckCircle, XCircle } from 'lucide-react'

function ForgotPasswordContent() {
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'sent' | 'error'>('idle')
  const [errorText, setErrorText] = useState('')

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    setStatus('loading')
    setErrorText('')

    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/api/auth/callback?type=recovery&next=/reset-password`,
    })

    if (error) {
      setErrorText(error.message)
      setStatus('error')
    } else {
      setStatus('sent')
    }
  }, [email, supabase])

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)',
      fontFamily: 'var(--font)', display: 'flex', alignItems: 'center',
      justifyContent: 'center', padding: '24px',
    }}>
      {/* Background */}
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
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 380 }}
      >
        {/* Logo */}
        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none', marginBottom: 32 }}>
          <div style={{ position: 'relative', width: 26, height: 26 }}>
            <Image src="/logo.png" alt="SANDNCO" fill style={{ objectFit: 'contain' }} />
          </div>
          <span style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-0.02em' }}>SANDNCO</span>
        </Link>

        <AnimatePresence mode="wait">

          {/* Form state */}
          {status !== 'sent' && (
            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div style={{ marginBottom: 28 }}>
                <Link href="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--subtle)', textDecoration: 'none', marginBottom: 20 }}>
                  <ArrowLeft style={{ width: 14, height: 14 }} />
                  Back to login
                </Link>
                <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.025em', margin: '0 0 6px' }}>
                  Forgot your password?
                </h1>
                <p style={{ fontSize: 15, color: 'var(--muted)', margin: 0 }}>
                  No worries. We&apos;ll send a reset link to your email.
                </p>
              </div>

              {/* Error message */}
              <AnimatePresence>
                {status === 'error' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    style={{ marginBottom: 16, overflow: 'hidden' }}
                  >
                    <div className="msg msg-error">
                      <XCircle style={{ width: 15, height: 15, flexShrink: 0 }} />
                      <span>{errorText || 'Something went wrong. Please try again.'}</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label className="label">Email address</label>
                  <div style={{ position: 'relative' }}>
                    <Mail style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 15, height: 15, color: 'var(--subtle)' }} />
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                      className="auth-input"
                      style={{ paddingLeft: 40 }}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={status === 'loading' || !email}
                  className="auth-btn"
                >
                  {status === 'loading'
                    ? <><Loader style={{ width: 16, height: 16, animation: 'spin 1s linear infinite' }} /> Sending...</>
                    : 'Send reset link'}
                </button>
              </form>

              <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--muted)', marginTop: 20 }}>
                Remembered it?{' '}
                <Link href="/login" className="link">Sign in</Link>
              </p>
            </motion.div>
          )}

          {/* Sent state */}
          {status === 'sent' && (
            <motion.div
              key="sent"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{
                textAlign: 'center', padding: '40px 24px',
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                borderRadius: 12,
              }}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.1 }}
                style={{ marginBottom: 20, display: 'flex', justifyContent: 'center' }}
              >
                <div style={{
                  width: 60, height: 60, borderRadius: '50%',
                  background: 'var(--primary-dim)',
                  border: '2px solid rgba(99,102,241,0.35)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <CheckCircle style={{ width: 26, height: 26, color: 'var(--primary)' }} />
                </div>
              </motion.div>
              <h2 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.025em', marginBottom: 10 }}>
                Check your inbox
              </h2>
              <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.6, marginBottom: 6 }}>
                We sent a reset link to{' '}
                <strong style={{ color: 'var(--text)' }}>{email}</strong>.
              </p>
              <p style={{ fontSize: 13, color: 'var(--subtle)', marginBottom: 28 }}>
                Check your spam folder if you don&apos;t see it in a minute.
              </p>
              <Link href="/login">
                <button style={{
                  padding: '11px 24px', fontSize: 14, fontWeight: 600,
                  background: 'var(--primary)', color: '#fff', border: 'none',
                  borderRadius: 8, cursor: 'pointer', fontFamily: 'var(--font)',
                }}>
                  Back to sign in
                </button>
              </Link>
            </motion.div>
          )}

        </AnimatePresence>
      </motion.div>
    </div>
  )
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader style={{ width: 20, height: 20, color: 'var(--primary)', animation: 'spin 1s linear infinite' }} />
      </div>
    }>
      <ForgotPasswordContent />
    </Suspense>
  )
}
