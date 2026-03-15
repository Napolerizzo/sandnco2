'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import Turnstile from 'react-turnstile'
import {
  Lock, Mail, User, Loader, Eye, EyeOff,
  XCircle, CheckCircle, ArrowRight,
} from 'lucide-react'
import { PFP_STYLES, type PfpStyle, RANKS } from '@/lib/ranks'
import { AvatarSVG } from '@/components/AvatarSVG'
import toast from 'react-hot-toast'

const LEFT_LINES = [
  { main: 'Your city. Your voice.', sub: 'Every great story starts with someone brave enough to speak.' },
  { main: 'Anonymous by design.', sub: 'The city will hear you. They just won\'t know who said it.' },
  { main: 'Start as a Ghost.', sub: 'Earn your legend one rumor at a time.' },
  { main: 'Faridabad is waiting.', sub: 'Be one of the first. That matters.' },
]

const STRENGTH_COLORS = ['#ef4444', '#f59e0b', '#f59e0b', '#22c55e', '#22c55e']

function getPasswordStrength(pwd: string) {
  if (pwd.length < 8) return { level: 0, text: 'Too short' }
  let s = 0
  if (/[A-Z]/.test(pwd)) s++
  if (/[0-9]/.test(pwd)) s++
  if (/[^A-Za-z0-9]/.test(pwd)) s++
  if (pwd.length >= 12) s++
  const labels = ['', 'Weak', 'Fair', 'Strong', 'Very strong']
  return { level: s, text: labels[s] || 'Weak' }
}

function SignupContent() {
  const supabase = createClient()

  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [lineIndex, setLineIndex] = useState(0)

  // Step 1
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
  const [googleLoading, setGoogleLoading] = useState(false)

  // Step 2
  const [username, setUsername] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [pfpStyle, setPfpStyle] = useState<PfpStyle>('gradient_phantom')
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null)
  const [checkingUsername, setCheckingUsername] = useState(false)
  const [loading, setLoading] = useState(false)

  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null)

  useEffect(() => {
    const t = setInterval(() => setLineIndex(i => (i + 1) % LEFT_LINES.length), 4000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    if (!username || username.length < 3) { setUsernameAvailable(null); return }
    setCheckingUsername(true)
    const t = setTimeout(async () => {
      const { data } = await supabase.from('users').select('id').eq('username', username).single()
      setUsernameAvailable(!data)
      setCheckingUsername(false)
    }, 500)
    return () => clearTimeout(t)
  }, [username, supabase])

  const pwStrength = getPasswordStrength(password)

  const handleStep1 = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    if (!turnstileToken) {
      setMessage({ type: 'error', text: 'Please complete the security check.' })
      return
    }
    if (password.length < 8) {
      setMessage({ type: 'error', text: 'Password must be at least 8 characters.' })
      return
    }
    setMessage(null)
    setStep(2)
  }, [turnstileToken, password])

  const handleSignup = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username || username.length < 3) {
      setMessage({ type: 'error', text: 'Choose a username (at least 3 characters).' })
      return
    }
    if (usernameAvailable === false) {
      setMessage({ type: 'error', text: `"@${username}" is taken. Try another.` })
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
      setMessage({ type: 'error', text: 'Security check failed. Go back and try again.' })
      setLoading(false)
      return
    }

    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: { username, display_name: displayName || username, pfp_style: pfpStyle },
        emailRedirectTo: `${window.location.origin}/api/auth/callback`,
      },
    })

    if (error) {
      const msg = error.message.toLowerCase()
      if (msg.includes('database') || msg.includes('unique')) {
        setMessage({ type: 'error', text: `Username "@${username}" is already taken.` })
      } else if (msg.includes('email')) {
        setMessage({ type: 'error', text: `An account with that email already exists.` })
      } else {
        setMessage({ type: 'error', text: error.message })
      }
      setLoading(false)
      return
    }

    setStep(3)
    setLoading(false)
  }, [email, password, username, displayName, pfpStyle, turnstileToken, usernameAvailable, supabase])

  const handleGoogle = useCallback(async () => {
    setGoogleLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/api/auth/callback?next=/feed` },
    })
    if (error) { toast.error(error.message); setGoogleLoading(false) }
  }, [supabase])

  const line = LEFT_LINES[lineIndex]

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg)', display: 'flex',
      fontFamily: 'var(--font)', overflow: 'hidden',
    }}>
      {/* ── LEFT PANEL ── */}
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

        {/* Rank preview */}
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 10,
            background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)',
            borderRadius: 8, padding: '10px 14px', marginBottom: 24,
          }}>
            <span style={{ fontSize: 22 }}>👻</span>
            <div>
              <span style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block' }}>Starting rank</span>
              <span style={{ fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>Ghost in the City</span>
            </div>
          </div>

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

        {/* Bottom */}
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

      {/* ── RIGHT PANEL ── */}
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
          style={{ width: '100%', maxWidth: 400 }}
        >
          {/* Step indicator */}
          {step < 3 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 28 }}>
              {[
                { n: 1, label: 'Account' },
                { n: 2, label: 'Profile' },
              ].map(({ n, label }, i) => (
                <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 12, fontWeight: 600,
                      background: step === n ? 'var(--primary)' : step > n ? 'var(--success-dim)' : 'var(--bg-elevated)',
                      border: step === n ? '1px solid var(--primary)' : step > n ? '1px solid rgba(34,197,94,0.3)' : '1px solid var(--border)',
                      color: step === n ? '#fff' : step > n ? '#86efac' : 'var(--subtle)',
                      transition: 'all 0.2s',
                    }}>
                      {step > n ? <CheckCircle style={{ width: 13, height: 13 }} /> : n}
                    </div>
                    <span style={{ fontSize: 11, color: step === n ? 'var(--muted)' : 'var(--subtle)' }}>{label}</span>
                  </div>
                  {i < 1 && (
                    <div style={{
                      width: 48, height: 1, marginBottom: 20,
                      background: step > 1 ? 'rgba(34,197,94,0.4)' : 'var(--border)',
                      transition: 'background 0.3s',
                    }} />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Message */}
          <AnimatePresence mode="wait">
            {message && (
              <motion.div
                key={message.text}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                style={{ marginBottom: 16, overflow: 'hidden' }}
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

          <AnimatePresence mode="wait">

            {/* ── STEP 1: Credentials ── */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <div style={{ marginBottom: 28 }}>
                  <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.025em', margin: '0 0 6px' }}>
                    Join the city.
                  </h1>
                  <p style={{ fontSize: 15, color: 'var(--muted)', margin: 0 }}>
                    Create your account. It's free.
                  </p>
                </div>

                {/* Google button — prominent */}
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

                <form onSubmit={handleStep1} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
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
                    <label className="label">Password</label>
                    <div style={{ position: 'relative' }}>
                      <Lock style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 15, height: 15, color: 'var(--subtle)' }} />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="Min. 8 characters"
                        required minLength={8}
                        className="auth-input"
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
                    {password.length > 0 && (
                      <div style={{ marginTop: 8 }}>
                        <div style={{ display: 'flex', gap: 4, marginBottom: 5 }}>
                          {[0, 1, 2, 3].map(i => (
                            <div key={i} style={{
                              flex: 1, height: 3, borderRadius: 2,
                              background: i < pwStrength.level
                                ? STRENGTH_COLORS[Math.max(0, pwStrength.level - 1)]
                                : 'var(--border)',
                              transition: 'background 0.2s',
                            }} />
                          ))}
                        </div>
                        <p style={{ fontSize: 12, color: STRENGTH_COLORS[Math.max(0, pwStrength.level - 1)], margin: 0 }}>
                          {pwStrength.text}
                        </p>
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'center', padding: '4px 0' }}>
                    <Turnstile
                      sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '1x00000000000000000000AA'}
                      onVerify={t => setTurnstileToken(t)}
                      onExpire={() => setTurnstileToken(null)}
                      theme="dark"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={!turnstileToken}
                    className="auth-btn"
                  >
                    Continue
                    <ArrowRight style={{ width: 16, height: 16 }} />
                  </button>
                </form>

                <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--muted)', marginTop: 20 }}>
                  Already have an account?{' '}
                  <Link href="/login" className="link">Sign in</Link>
                </p>

                <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--subtle)', marginTop: 16 }}>
                  By signing up you agree to our{' '}
                  <Link href="/legal/tos" className="link-muted">Terms</Link>
                  {' '}&amp;{' '}
                  <Link href="/legal/privacy" className="link-muted">Privacy Policy</Link>
                </p>
              </motion.div>
            )}

            {/* ── STEP 2: Profile ── */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div style={{ marginBottom: 24 }}>
                  <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.025em', margin: '0 0 6px' }}>
                    Your identity.
                  </h1>
                  <p style={{ fontSize: 15, color: 'var(--muted)', margin: 0 }}>
                    How the city knows you.
                  </p>
                </div>

                <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {/* Avatar picker */}
                  <div>
                    <label className="label" style={{ marginBottom: 10 }}>Pick your avatar</label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                      {(Object.entries(PFP_STYLES) as [PfpStyle, typeof PFP_STYLES[PfpStyle]][]).map(([style, data]) => (
                        <motion.button
                          key={style}
                          type="button"
                          onClick={() => setPfpStyle(style)}
                          whileTap={{ scale: 0.92 }}
                          title={data.label}
                          style={{
                            aspectRatio: '1', cursor: 'pointer', padding: 2,
                            border: pfpStyle === style ? '2px solid var(--primary)' : '2px solid var(--border)',
                            borderRadius: 10,
                            boxShadow: pfpStyle === style ? '0 0 0 3px var(--primary-dim)' : 'none',
                            transition: 'all 0.15s', background: 'var(--bg-elevated)', overflow: 'hidden',
                            position: 'relative',
                          }}
                        >
                          <AvatarSVG style={style} size={56} />
                          {pfpStyle === style && (
                            <div style={{
                              position: 'absolute', inset: 0, borderRadius: 8,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              background: 'rgba(99,102,241,0.25)',
                            }}>
                              <CheckCircle style={{ width: 16, height: 16, color: '#fff' }} />
                            </div>
                          )}
                        </motion.button>
                      ))}
                    </div>
                    <p style={{ fontSize: 12, color: 'var(--subtle)', marginTop: 6 }}>
                      {PFP_STYLES[pfpStyle].label} — {PFP_STYLES[pfpStyle].description}
                    </p>
                  </div>

                  {/* Username */}
                  <div>
                    <label className="label">Username</label>
                    <div style={{ position: 'relative' }}>
                      <User style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 15, height: 15, color: 'var(--subtle)' }} />
                      <input
                        type="text"
                        value={username}
                        onChange={e => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                        placeholder="your_handle"
                        required minLength={3} maxLength={20}
                        className="auth-input"
                        style={{ paddingLeft: 40, paddingRight: 36 }}
                      />
                      <div style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)' }}>
                        {checkingUsername && <Loader style={{ width: 14, height: 14, color: 'var(--subtle)', animation: 'spin 1s linear infinite' }} />}
                        {!checkingUsername && usernameAvailable === true && <CheckCircle style={{ width: 14, height: 14, color: 'var(--success)' }} />}
                        {!checkingUsername && usernameAvailable === false && <XCircle style={{ width: 14, height: 14, color: 'var(--danger)' }} />}
                      </div>
                    </div>
                    {!checkingUsername && usernameAvailable === false && (
                      <p style={{ fontSize: 12, color: 'var(--danger)', marginTop: 5 }}>That username is taken.</p>
                    )}
                    {!checkingUsername && usernameAvailable === true && (
                      <p style={{ fontSize: 12, color: 'var(--success)', marginTop: 5 }}>Available.</p>
                    )}
                  </div>

                  {/* Display name */}
                  <div>
                    <label className="label">
                      Display name{' '}
                      <span style={{ fontSize: 11, color: 'var(--subtle)', fontWeight: 400 }}>(optional)</span>
                    </label>
                    <input
                      type="text" value={displayName}
                      onChange={e => setDisplayName(e.target.value)}
                      placeholder="How you appear on posts"
                      className="auth-input"
                    />
                  </div>

                  <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                    <button
                      type="button"
                      onClick={() => { setStep(1); setMessage(null) }}
                      style={{
                        flex: '0 0 auto', background: 'var(--bg-elevated)', color: 'var(--muted)',
                        border: '1px solid var(--border)', borderRadius: 6, padding: '12px 16px',
                        cursor: 'pointer', fontSize: 14, fontWeight: 500, fontFamily: 'var(--font)',
                        transition: 'background 0.15s',
                      }}
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={loading || !username || usernameAvailable === false || checkingUsername}
                      className="auth-btn"
                      style={{ flex: 1 }}
                    >
                      {loading
                        ? <><Loader style={{ width: 16, height: 16, animation: 'spin 1s linear infinite' }} /> Creating account...</>
                        : 'Create Account'}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* ── STEP 3: Success ── */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                style={{ textAlign: 'center', padding: '16px 0' }}
              >
                <motion.div
                  animate={{ rotate: [0, -10, 10, -5, 5, 0] }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  style={{ fontSize: 56, marginBottom: 20, display: 'block' }}
                >
                  👑
                </motion.div>
                <h2 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.025em', margin: '0 0 8px' }}>
                  You're in.
                </h2>
                <p style={{ fontSize: 15, color: 'var(--muted)', marginBottom: 24 }}>
                  Check <strong style={{ color: 'var(--text)' }}>{email}</strong> to verify your account. Then sign in and start your story.
                </p>
                <div className="msg msg-success" style={{ textAlign: 'left', marginBottom: 24 }}>
                  <CheckCircle style={{ width: 15, height: 15, flexShrink: 0 }} />
                  <span>Verification email sent. Check your inbox — and spam, just in case.</span>
                </div>
                <Link href="/login">
                  <button className="auth-btn" style={{ width: '100%' }}>
                    Go to Sign In
                    <ArrowRight style={{ width: 16, height: 16 }} />
                  </button>
                </Link>
              </motion.div>
            )}

          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  )
}

export default function SignupPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader style={{ width: 20, height: 20, color: 'var(--primary)', animation: 'spin 1s linear infinite' }} />
      </div>
    }>
      <SignupContent />
    </Suspense>
  )
}
