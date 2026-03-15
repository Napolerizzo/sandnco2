'use client'

import { useState, useCallback, Suspense, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import Turnstile from 'react-turnstile'
import { Lock, Mail, Loader, Eye, EyeOff, XCircle, CheckCircle, Chrome } from 'lucide-react'
import toast from 'react-hot-toast'

const LEFT_LINES = [
  { main: 'The streets talk.', sub: 'We just write it down.' },
  { main: 'Everyone knows.', sub: 'Nobody says it. Until now.' },
  { main: 'Anonymous by design.', sub: 'Honest by nature.' },
  { main: 'Faridabad has secrets.', sub: 'Some of them are yours.' },
]

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
  const [lineIndex, setLineIndex] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setLineIndex(i => (i + 1) % LEFT_LINES.length), 4000)
    return () => clearInterval(t)
  }, [])

  const handleLogin = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (!turnstileToken) {
      setMessage({ type: 'error', text: 'Please complete the security check below.' })
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
      setMessage({ type: 'error', text: 'Security check failed. Please refresh and try again.' })
      setLoading(false)
      return
    }

    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
    if (error) {
      setMessage({
        type: 'error',
        text: error.message.toLowerCase().includes('invalid')
          ? 'Wrong email or password.'
          : error.message,
      })
      setLoading(false)
      return
    }

    setMessage({ type: 'success', text: 'You\'re in. Redirecting...' })
    toast.success('Welcome back.')
    setTimeout(() => { router.push(redirectTo); router.refresh() }, 500)
  }, [email, password, turnstileToken, supabase, redirectTo, router])

  const handleGoogle = useCallback(async () => {
    setGoogleLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/api/auth/callback?next=${encodeURIComponent(redirectTo)}` },
    })
    if (error) { toast.error(error.message); setGoogleLoading(false) }
  }, [supabase, redirectTo])

  const line = LEFT_LINES[lineIndex]

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg)', display: 'flex',
      fontFamily: 'var(--font)', overflow: 'hidden',
    }}>
      {/* ── LEFT PANEL — atmospheric ── */}
      <div
        className="hide-mobile"
        style={{
          width: '45%', minHeight: '100vh', position: 'relative',
          background: 'linear-gradient(160deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)',
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          padding: '40px 48px', borderRight: '1px solid var(--border)',
          overflow: 'hidden',
        }}
      >
        {/* Grid texture */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: 'linear-gradient(rgba(99,102,241,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.06) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }} />

        {/* Glow blob */}
        <div style={{
          position: 'absolute', top: '30%', left: '20%',
          width: 400, height: 400, pointerEvents: 'none',
          background: 'radial-gradient(ellipse, rgba(99,102,241,0.15) 0%, transparent 65%)',
        }} />

        {/* Logo */}
        <div style={{ position: 'relative', zIndex: 2 }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <div style={{ position: 'relative', width: 32, height: 32 }}>
              <Image src="/logo.png" alt="SANDNCO" fill style={{ objectFit: 'contain' }} />
            </div>
            <div>
              <span style={{ fontSize: 16, fontWeight: 700, color: '#fff', letterSpacing: '-0.02em', display: 'block' }}>SANDNCO</span>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', display: 'block' }}>King of Good Times</span>
            </div>
          </Link>
        </div>

        {/* Central copy */}
        <div style={{ position: 'relative', zIndex: 2 }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={lineIndex}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.5 }}
            >
              <h2 style={{
                fontSize: 38, fontWeight: 700, letterSpacing: '-0.03em',
                color: '#fff', lineHeight: 1.1, marginBottom: 10,
              }}>
                {line.main}
              </h2>
              <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.5)', fontWeight: 400 }}>
                {line.sub}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Bottom — city tag */}
        <div style={{ position: 'relative', zIndex: 2 }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            fontSize: 12, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.04em',
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--primary)', opacity: 0.7 }} />
            Faridabad, India · Early Access
          </span>
        </div>
      </div>

      {/* ── RIGHT PANEL — form ── */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '40px 24px', overflowY: 'auto',
      }}>
        {/* Mobile logo */}
        <div className="show-mobile" style={{
          display: 'none', alignItems: 'center', gap: 8, marginBottom: 40,
        }}>
          <div style={{ position: 'relative', width: 28, height: 28 }}>
            <Image src="/logo.png" alt="SANDNCO" fill style={{ objectFit: 'contain' }} />
          </div>
          <span style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-0.02em' }}>SANDNCO</span>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          style={{ width: '100%', maxWidth: 380 }}
        >
          <div style={{ marginBottom: 32 }}>
            <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.025em', margin: '0 0 6px' }}>
              Welcome back.
            </h1>
            <p style={{ fontSize: 15, color: 'var(--muted)', margin: 0 }}>
              Sign in to your account.
            </p>
          </div>

          {/* Message */}
          <AnimatePresence mode="wait">
            {message && (
              <motion.div
                key={message.text}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                style={{ marginBottom: 20, overflow: 'hidden' }}
              >
                <div className={message.type === 'error' ? 'msg msg-error' : 'msg msg-success'}>
                  {message.type === 'error'
                    ? <XCircle style={{ width: 15, height: 15, flexShrink: 0 }} />
                    : <CheckCircle style={{ width: 15, height: 15, flexShrink: 0 }} />}
                  <span>{message.text}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Google button — top for prominence */}
          <button
            onClick={handleGoogle}
            disabled={googleLoading}
            className="auth-btn-google"
            style={{ marginBottom: 16 }}
          >
            {googleLoading
              ? <Loader style={{ width: 16, height: 16, animation: 'spin 1s linear infinite' }} />
              : (
                <svg width="16" height="16" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              )
            }
            Continue with Google
          </button>

          <div className="divider" style={{ marginBottom: 16 }}>or</div>

          {/* Email/password form */}
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label className="label">Email</label>
              <div style={{ position: 'relative' }}>
                <Mail style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 15, height: 15, color: 'var(--subtle)' }} />
                <input
                  type="email" value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required className="auth-input"
                  style={{ paddingLeft: 40 }}
                />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <label className="label" style={{ margin: 0 }}>Password</label>
                <Link href="/forgot-password" className="link-muted" style={{ fontSize: 13 }}>
                  Forgot?
                </Link>
              </div>
              <div style={{ position: 'relative' }}>
                <Lock style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 15, height: 15, color: 'var(--subtle)' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Your password"
                  required className="auth-input"
                  style={{ paddingLeft: 40, paddingRight: 44 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--subtle)', display: 'flex', padding: 2 }}
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

            <button
              type="submit"
              disabled={loading || !turnstileToken}
              className="auth-btn"
            >
              {loading ? <><Loader style={{ width: 16, height: 16, animation: 'spin 1s linear infinite' }} /> Signing in...</> : 'Sign In'}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--muted)', marginTop: 24 }}>
            No account?{' '}
            <Link href="/signup" className="link">Create one free</Link>
          </p>

          <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--subtle)', marginTop: 20 }}>
            By signing in you agree to our{' '}
            <Link href="/legal/tos" className="link-muted">Terms</Link>
            {' '}&amp;{' '}
            <Link href="/legal/privacy" className="link-muted">Privacy Policy</Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader style={{ width: 20, height: 20, color: 'var(--primary)', animation: 'spin 1s linear infinite' }} />
      </div>
    }>
      <LoginContent />
    </Suspense>
  )
}
