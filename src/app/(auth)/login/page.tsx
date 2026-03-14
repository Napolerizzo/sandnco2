'use client'

import { useState, useEffect, Suspense, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import Turnstile from 'react-turnstile'
import {
  Shield, Lock, Mail, Loader, Zap, Terminal, Eye,
  XCircle, CheckCircle, ChevronLeft, Chrome
} from 'lucide-react'
import toast from 'react-hot-toast'

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  const redirectTo = searchParams.get('next') || '/feed'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null)
  const [glitchEffect, setGlitchEffect] = useState(false)

  // Glitch on errors
  useEffect(() => {
    if (message?.type === 'error') {
      setGlitchEffect(true)
      setTimeout(() => setGlitchEffect(false), 500)
    }
  }, [message])

  const handleLogin = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (!turnstileToken) {
      setMessage({ type: 'error', text: 'SECURITY_BREACH: CAPTCHA_VERIFICATION_FAILED' })
      return
    }
    setLoading(true)
    setMessage(null)

    // Verify turnstile server-side
    const verify = await fetch('/api/auth/verify-turnstile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: turnstileToken }),
    })
    const { success } = await verify.json()
    if (!success) {
      setMessage({ type: 'error', text: 'TURNSTILE_ERROR: VERIFICATION_REJECTED' })
      setLoading(false)
      return
    }

    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
    if (error) {
      setMessage({
        type: 'error',
        text: error.message.includes('Invalid')
          ? 'ACCESS_DENIED: INVALID_CREDENTIALS'
          : `AUTH_ERROR: ${error.message.toUpperCase().replace(/\s+/g, '_')}`
      })
      setLoading(false)
      return
    }

    setMessage({ type: 'success', text: 'ACCESS_GRANTED: ESTABLISHING_SECURE_CONNECTION...' })
    toast.success('ACCESS_GRANTED')
    setTimeout(() => {
      router.push(redirectTo)
      router.refresh()
    }, 800)
  }, [email, password, turnstileToken, supabase, redirectTo, router])

  const handleGoogleLogin = useCallback(async () => {
    setGoogleLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback?next=${encodeURIComponent(redirectTo)}`,
      },
    })
    if (error) {
      toast.error(error.message)
      setGoogleLoading(false)
    }
  }, [supabase, redirectTo])

  return (
    <div className="min-h-screen bg-black text-[var(--cyan)] font-mono flex flex-col items-center justify-center p-4 relative overflow-hidden">

      {/* Grid background */}
      <div className="fixed inset-0 grid-bg pointer-events-none" style={{ maskImage: 'radial-gradient(ellipse 80% 50% at 50% 50%, black, transparent)' }} />

      {/* Scanning line */}
      <motion.div
        className="fixed left-0 w-full h-[2px] pointer-events-none z-10"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(0,255,245,0.6), transparent)', boxShadow: '0 0 20px rgba(0,255,245,0.5)' }}
        animate={{ top: ['-5%', '105%'] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
      />

      {/* Corner brackets */}
      <div className="fixed top-8 left-8 w-16 h-16 border-l-2 border-t-2 border-[var(--cyan-border)] pointer-events-none" />
      <div className="fixed top-8 right-8 w-16 h-16 border-r-2 border-t-2 border-[var(--cyan-border)] pointer-events-none" />
      <div className="fixed bottom-8 left-8 w-16 h-16 border-l-2 border-b-2 border-[var(--cyan-border)] pointer-events-none" />
      <div className="fixed bottom-8 right-8 w-16 h-16 border-r-2 border-b-2 border-[var(--cyan-border)] pointer-events-none" />

      {/* Glitch overlay */}
      <AnimatePresence>
        {glitchEffect && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.4, 0, 0.2, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 bg-red-500 mix-blend-screen pointer-events-none z-20"
          />
        )}
      </AnimatePresence>

      <div className="relative z-10 w-full max-w-md">

        {/* Back to home */}
        <Link href="/">
          <motion.button
            whileHover={{ x: -4 }}
            className="flex items-center gap-2 text-[10px] text-[var(--text-dim)] hover:text-[var(--cyan)] mb-8 transition-colors uppercase tracking-[0.2em] group"
          >
            <ChevronLeft className="w-3.5 h-3.5 group-hover:animate-pulse" />
            <span className="border-b border-[var(--cyan-border)] group-hover:border-[var(--cyan)]">ABORT_MISSION</span>
          </motion.button>
        </Link>

        {/* Terminal window */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className={`terminal transition-all duration-200 ${glitchEffect ? 'border-[var(--red)]' : ''}`}
        >
          {/* Header bar */}
          <div className="terminal-header">
            <div className="terminal-dots">
              <span /><span /><span />
            </div>
            <div className="terminal-title">
              <Terminal className="w-3 h-3" />
              SECURE_TERMINAL_v4.2
            </div>
          </div>

          <div className="terminal-body">

            {/* Logo + Title */}
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                className="inline-block p-4 border border-[var(--cyan-border)] bg-[var(--cyan-ghost)] mb-4 relative"
              >
                <Shield className="w-10 h-10 text-[var(--cyan)]" />
                <motion.div
                  className="absolute inset-0 border-2 border-[var(--cyan)]"
                  animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </motion.div>

              <h1 className="text-2xl font-extrabold uppercase tracking-wider text-glow-cyan mb-2">
                AUTHENTICATION
              </h1>
              <p className="text-[10px] text-[var(--text-dim)] uppercase tracking-[0.3em]">
                SECURE ACCESS PORTAL
              </p>
            </div>

            {/* Status message */}
            <AnimatePresence mode="wait">
              {message && (
                <motion.div
                  key={message.text}
                  initial={{ opacity: 0, x: -20, height: 0 }}
                  animate={{ opacity: 1, x: 0, height: 'auto' }}
                  exit={{ opacity: 0, x: 20, height: 0 }}
                  className={`mb-6 ${message.type === 'error' ? 'msg-error' : 'msg-success'}`}
                >
                  {message.type === 'error'
                    ? <XCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    : <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />}
                  <div className="flex-1 font-bold leading-relaxed break-words">
                    {message.text}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-5">
              {/* Email */}
              <div>
                <label className="label-terminal">
                  <Mail className="w-3 h-3" /> EMAIL_ADDRESS
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-dim)]" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="agent@sandnco.lol"
                    required
                    className="input-terminal input-terminal-icon"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="label-terminal">
                  <Lock className="w-3 h-3" /> CIPHER_KEY
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-dim)]" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    className="input-terminal input-terminal-icon pr-10"
                    style={{ letterSpacing: showPassword ? 'normal' : '0.2em' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-dim)] hover:text-[var(--cyan)] transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Forgot password */}
              <div className="flex justify-end">
                <Link href="/forgot-password">
                  <span className="text-[9px] text-[var(--red-dim)] hover:text-[var(--red)] transition-colors uppercase tracking-wider">
                    LOST_CREDENTIALS?
                  </span>
                </Link>
              </div>

              {/* Turnstile */}
              <div className="flex justify-center py-2">
                <Turnstile
                  sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '1x00000000000000000000AA'}
                  onVerify={token => setTurnstileToken(token)}
                  onExpire={() => setTurnstileToken(null)}
                  theme="dark"
                />
              </div>

              {/* Execute button */}
              <motion.button
                type="submit"
                disabled={loading || !turnstileToken}
                className="btn-execute"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="relative z-10 flex items-center justify-center gap-3">
                  {loading ? (
                    <><Loader className="w-4 h-4 animate-spin" /> PROCESSING</>
                  ) : (
                    <><Zap className="w-4 h-4" /> EXECUTE</>
                  )}
                </span>
              </motion.button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 h-px bg-[var(--cyan-border)]" />
              <span className="text-[9px] text-[var(--text-dim)] tracking-[0.2em]">ALTERNATE_PROTOCOL</span>
              <div className="flex-1 h-px bg-[var(--cyan-border)]" />
            </div>

            {/* Google OAuth */}
            <motion.button
              onClick={handleGoogleLogin}
              disabled={googleLoading}
              className="btn-outline w-full flex items-center justify-center gap-3"
              whileTap={{ scale: 0.98 }}
            >
              {googleLoading
                ? <Loader className="w-4 h-4 animate-spin" />
                : <Chrome className="w-4 h-4" />}
              GOOGLE_AUTH
            </motion.button>

            {/* Links */}
            <div className="mt-6 flex flex-col gap-3 text-center">
              <button
                onClick={() => router.push('/signup')}
                className="btn-link"
              >
                <span>NO_ACCESS? REGISTER_NEW_AGENT</span>
              </button>
            </div>
          </div>

          {/* Footer bar */}
          <div className="terminal-footer">
            <Lock className="w-3 h-3" />
            ENCRYPTION: AES-256 | KING_OF_GOOD_TIMES_V2
          </div>
        </motion.div>

        {/* Legal */}
        <div className="mt-6 text-center text-[9px] text-[var(--text-ghost)] uppercase tracking-[0.15em]">
          By authenticating you accept our{' '}
          <Link href="/legal/tos" className="text-[var(--text-dim)] hover:text-[var(--cyan)] transition-colors border-b border-[var(--text-ghost)]">
            TERMS
          </Link>{' '}
          &{' '}
          <Link href="/legal/privacy" className="text-[var(--text-dim)] hover:text-[var(--cyan)] transition-colors border-b border-[var(--text-ghost)]">
            PRIVACY_POLICY
          </Link>
        </div>
      </div>

      {/* Panic button (Easter egg from old UI) */}
      <motion.div
        className="fixed bottom-4 left-4 z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
      >
        <div className="flex items-center gap-2">
          <div className="relative w-6 h-6">
            <Image src="/logo.png" alt="" fill className="object-contain opacity-30 hover:opacity-80 transition-opacity" />
          </div>
          <span className="text-[8px] text-[var(--text-ghost)] tracking-[0.3em] uppercase">sandnco.lol</span>
        </div>
      </motion.div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-[var(--cyan)] font-mono text-sm animate-pulse flex items-center gap-3">
          <Loader className="w-5 h-5 animate-spin" />
          INITIALIZING_SECURE_PROTOCOL...
        </div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  )
}
