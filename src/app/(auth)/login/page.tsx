'use client'

import { useState, useCallback, Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import Turnstile from 'react-turnstile'
import { Lock, Mail, Loader, Eye, EyeOff, XCircle, CheckCircle, Chrome, ArrowLeft } from 'lucide-react'
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

  const handleLogin = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (!turnstileToken) {
      setMessage({ type: 'error', text: 'Please complete the security check.' })
      return
    }
    setLoading(true)
    setMessage(null)

    const verify = await fetch('/api/auth/verify-turnstile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: turnstileToken }),
    })
    const { success } = await verify.json()
    if (!success) {
      setMessage({ type: 'error', text: 'Security check failed. Please try again.' })
      setLoading(false)
      return
    }

    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
    if (error) {
      setMessage({
        type: 'error',
        text: error.message.includes('Invalid')
          ? 'Incorrect email or password. Please try again.'
          : error.message,
      })
      setLoading(false)
      return
    }

    setMessage({ type: 'success', text: 'Signed in! Redirecting...' })
    toast.success('Welcome back!')
    setTimeout(() => { router.push(redirectTo); router.refresh() }, 600)
  }, [email, password, turnstileToken, supabase, redirectTo, router])

  const handleGoogleLogin = useCallback(async () => {
    setGoogleLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/api/auth/callback?next=${encodeURIComponent(redirectTo)}` },
    })
    if (error) { toast.error(error.message); setGoogleLoading(false) }
  }, [supabase, redirectTo])

  return (
    <div
      style={{
        minHeight: '100vh', background: '#09090b', color: '#f4f4f5',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '24px 16px', position: 'relative', overflow: 'hidden',
      }}
    >
      {/* Grid bg */}
      <div
        style={{
          position: 'fixed', inset: 0, pointerEvents: 'none',
          backgroundImage: 'linear-gradient(rgba(34,211,238,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,0.03) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
        }}
      />

      <div style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: 420 }}>

        {/* Back */}
        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#71717a', textDecoration: 'none', fontSize: 13, marginBottom: 28, fontFamily: 'monospace', transition: 'color 0.15s' }}
          className="back-link"
        >
          <ArrowLeft style={{ width: 14, height: 14 }} />
          Back to home
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="auth-card"
          style={{ padding: 32 }}
        >
          {/* Logo + Title */}
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
              <div
                style={{
                  position: 'relative', width: 56, height: 56,
                  border: '1px solid rgba(34,211,238,0.25)',
                  background: 'rgba(34,211,238,0.05)', padding: 8,
                }}
              >
                <Image src="/logo.png" alt="KGT" fill style={{ objectFit: 'contain', padding: 4 }} />
              </div>
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: '#f4f4f5', margin: '0 0 6px', letterSpacing: '-0.01em' }}>
              Sign in
            </h1>
            <p style={{ fontSize: 14, color: '#71717a', margin: 0 }}>
              Enter the city. Your alias awaits.
            </p>
          </div>

          {/* Error/Success message */}
          <AnimatePresence mode="wait">
            {message && (
              <motion.div
                key={message.text}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                style={{ marginBottom: 20, overflow: 'hidden' }}
              >
                <div className={message.type === 'error' ? 'auth-msg-error' : 'auth-msg-success'}>
                  {message.type === 'error'
                    ? <XCircle style={{ width: 16, height: 16, flexShrink: 0, marginTop: 1 }} />
                    : <CheckCircle style={{ width: 16, height: 16, flexShrink: 0, marginTop: 1 }} />}
                  <span>{message.text}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Email */}
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#71717a', marginBottom: 7, fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                <Mail style={{ width: 11, height: 11 }} />
                Email address
              </label>
              <div style={{ position: 'relative' }}>
                <Mail style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 15, height: 15, color: '#52525b' }} />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="auth-input"
                  style={{ paddingLeft: 38 }}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 7 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#71717a', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  <Lock style={{ width: 11, height: 11 }} />
                  Password
                </label>
                <Link href="/forgot-password" style={{ fontSize: 12, color: '#71717a', textDecoration: 'none', transition: 'color 0.15s' }}
                  className="back-link"
                >
                  Forgot password?
                </Link>
              </div>
              <div style={{ position: 'relative' }}>
                <Lock style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 15, height: 15, color: '#52525b' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="auth-input"
                  style={{ paddingLeft: 38, paddingRight: 44 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#52525b', display: 'flex', padding: 2 }}
                >
                  {showPassword ? <EyeOff style={{ width: 16, height: 16 }} /> : <Eye style={{ width: 16, height: 16 }} />}
                </button>
              </div>
            </div>

            {/* Turnstile */}
            <div style={{ display: 'flex', justifyContent: 'center', padding: '4px 0' }}>
              <Turnstile
                sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '1x00000000000000000000AA'}
                onVerify={token => setTurnstileToken(token)}
                onExpire={() => setTurnstileToken(null)}
                theme="dark"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !turnstileToken}
              className="auth-btn-primary"
            >
              {loading ? (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
                  <Loader style={{ width: 16, height: 16, animation: 'spin 1s linear infinite' }} />
                  Signing in...
                </span>
              ) : 'Sign In'}
            </button>
          </form>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' }}>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
            <span style={{ fontSize: 12, color: '#52525b', fontFamily: 'monospace' }}>or</span>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
          </div>

          {/* Google */}
          <button
            onClick={handleGoogleLogin}
            disabled={googleLoading}
            className="auth-btn-secondary"
          >
            {googleLoading
              ? <Loader style={{ width: 16, height: 16, animation: 'spin 1s linear infinite' }} />
              : <Chrome style={{ width: 16, height: 16 }} />}
            Continue with Google
          </button>

          {/* Sign up link */}
          <p style={{ textAlign: 'center', fontSize: 14, color: '#71717a', marginTop: 24 }}>
            No account?{' '}
            <Link href="/signup" style={{ color: '#22d3ee', textDecoration: 'none', fontWeight: 600 }}>
              Create one free
            </Link>
          </p>
        </motion.div>

        {/* Legal */}
        <p style={{ textAlign: 'center', fontSize: 12, color: '#3f3f46', marginTop: 16 }}>
          By signing in you agree to our{' '}
          <Link href="/legal/tos" style={{ color: '#52525b', textDecoration: 'none' }}>Terms</Link>
          {' '}&amp;{' '}
          <Link href="/legal/privacy" style={{ color: '#52525b', textDecoration: 'none' }}>Privacy Policy</Link>
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: '#09090b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader style={{ width: 20, height: 20, color: '#22d3ee', animation: 'spin 1s linear infinite' }} />
      </div>
    }>
      <LoginContent />
    </Suspense>
  )
}
