'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import Turnstile from 'react-turnstile'
import {
  Lock, Mail, User, Loader, Zap, Eye, EyeOff,
  XCircle, CheckCircle, ArrowLeft, Chrome, ArrowRight
} from 'lucide-react'
import { PFP_STYLES, type PfpStyle, RANKS } from '@/lib/ranks'
import { track, EVENTS } from '@/lib/posthog'
import toast from 'react-hot-toast'

const RANK_ENTRY = RANKS['ghost_in_the_city']

function SignupContent() {
  const router = useRouter()
  const supabase = createClient()

  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [city, setCity] = useState('')
  const [pfpStyle, setPfpStyle] = useState<PfpStyle>('neon_orb')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null)
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null)
  const [checkingUsername, setCheckingUsername] = useState(false)

  const getPasswordStrength = (pwd: string) => {
    if (pwd.length < 8) return { level: 0, text: 'Too short — minimum 8 characters' }
    let s = 0
    if (/[A-Z]/.test(pwd)) s++
    if (/[0-9]/.test(pwd)) s++
    if (/[^A-Za-z0-9]/.test(pwd)) s++
    if (pwd.length >= 12) s++
    return {
      level: s,
      text: s === 0 ? 'Weak' : s === 1 ? 'Fair' : s >= 2 ? 'Strong' : 'Weak',
    }
  }
  const pwStrength = getPasswordStrength(password)
  const strengthColors = ['#ef4444', '#f59e0b', '#22c55e', '#22d3ee']

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
    if (usernameAvailable === false) {
      setMessage({ type: 'error', text: `Username "@${username}" is already taken. Choose another.` })
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
      setMessage({ type: 'error', text: 'Security check failed. Please go back and try again.' })
      setLoading(false)
      return
    }

    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: { username, display_name: displayName || username, city, pfp_style: pfpStyle },
        emailRedirectTo: `${window.location.origin}/api/auth/callback`,
      },
    })

    if (error) {
      const msg = error.message.toLowerCase()
      if (msg.includes('database error')) {
        setMessage({ type: 'error', text: `Username "@${username}" may already be taken.` })
      } else if (msg.includes('email')) {
        setMessage({ type: 'error', text: `An account with "${email}" already exists.` })
      } else {
        setMessage({ type: 'error', text: error.message })
      }
      setLoading(false)
      return
    }

    track(EVENTS.USER_SIGNUP, { method: 'email', pfp_style: pfpStyle })
    setStep(3)
    setLoading(false)
  }, [email, password, username, displayName, city, pfpStyle, turnstileToken, usernameAvailable, supabase])

  const handleGoogleSignup = useCallback(async () => {
    setGoogleLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/api/auth/callback?next=/feed` },
    })
    if (error) { toast.error(error.message); setGoogleLoading(false) }
  }, [supabase])

  return (
    <div
      style={{
        minHeight: '100vh', background: '#09090b', color: '#f4f4f5',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '24px 16px', position: 'relative', overflowX: 'hidden',
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

      <div style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: 440 }}>

        {/* Back link */}
        <Link href="/"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#71717a', textDecoration: 'none', fontSize: 13, marginBottom: 24, fontFamily: 'monospace' }}
          className="back-link"
        >
          <ArrowLeft style={{ width: 14, height: 14 }} />
          Back
        </Link>

        {/* Step indicator */}
        {step < 3 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 20 }}>
            {[1, 2].map(s => (
              <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div
                  style={{
                    width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, fontWeight: 700, fontFamily: 'monospace',
                    border: step === s
                      ? '1px solid #22d3ee'
                      : s < step
                        ? '1px solid #22c55e'
                        : '1px solid rgba(255,255,255,0.12)',
                    color: step === s ? '#22d3ee' : s < step ? '#22c55e' : '#52525b',
                    background: step === s ? 'rgba(34,211,238,0.06)' : s < step ? 'rgba(34,197,94,0.06)' : 'transparent',
                  }}
                >
                  {s < step ? <CheckCircle style={{ width: 13, height: 13 }} /> : s}
                </div>
                {s < 2 && (
                  <div style={{ width: 32, height: 1, background: step > 1 ? 'rgba(34,211,238,0.3)' : 'rgba(255,255,255,0.1)' }} />
                )}
              </div>
            ))}
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="auth-card"
          style={{ padding: 32 }}
        >
          <AnimatePresence mode="wait">

            {/* ── STEP 1: Credentials ── */}
            {step === 1 && (
              <motion.div key="s1" initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }}>
                <div style={{ textAlign: 'center', marginBottom: 28 }}>
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
                    <div style={{ position: 'relative', width: 52, height: 52, border: '1px solid rgba(34,211,238,0.25)', background: 'rgba(34,211,238,0.05)', padding: 8 }}>
                      <Image src="/logo.png" alt="KGT" fill style={{ objectFit: 'contain', padding: 4 }} />
                    </div>
                  </div>
                  <h1 style={{ fontSize: 22, fontWeight: 800, color: '#f4f4f5', margin: '0 0 6px', letterSpacing: '-0.01em' }}>
                    Create your account
                  </h1>
                  <p style={{ fontSize: 14, color: '#71717a', margin: 0 }}>Join the city. Start as a Ghost.</p>
                </div>

                <AnimatePresence mode="wait">
                  {message && (
                    <motion.div key={message.text} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ marginBottom: 16, overflow: 'hidden' }}>
                      <div className={message.type === 'error' ? 'auth-msg-error' : 'auth-msg-success'}>
                        <XCircle style={{ width: 15, height: 15, flexShrink: 0, marginTop: 1 }} />
                        <span>{message.text}</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <form onSubmit={handleStep1} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#71717a', marginBottom: 7, fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                      <Mail style={{ width: 11, height: 11 }} /> Email address
                    </label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                      placeholder="you@example.com" required className="auth-input" />
                  </div>

                  <div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#71717a', marginBottom: 7, fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                      <Lock style={{ width: 11, height: 11 }} /> Password
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="Min. 8 characters"
                        required minLength={8}
                        className="auth-input"
                        style={{ paddingRight: 44 }}
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)}
                        style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#52525b', display: 'flex', padding: 2 }}>
                        {showPassword ? <EyeOff style={{ width: 16, height: 16 }} /> : <Eye style={{ width: 16, height: 16 }} />}
                      </button>
                    </div>
                    {password.length > 0 && (
                      <div style={{ marginTop: 8 }}>
                        <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                          {[0, 1, 2, 3].map(i => (
                            <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i < pwStrength.level ? strengthColors[Math.min(pwStrength.level - 1, 3)] : 'rgba(255,255,255,0.08)', transition: 'background 0.2s' }} />
                          ))}
                        </div>
                        <p style={{ fontSize: 12, color: password.length >= 8 ? strengthColors[Math.min(pwStrength.level - 1, 3)] : '#ef4444', margin: 0 }}>
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

                  <button type="submit" disabled={!turnstileToken} className="auth-btn-primary"
                    style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    Continue
                    <ArrowRight style={{ width: 16, height: 16 }} />
                  </button>
                </form>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' }}>
                  <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
                  <span style={{ fontSize: 12, color: '#52525b', fontFamily: 'monospace' }}>or</span>
                  <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
                </div>

                <button onClick={handleGoogleSignup} disabled={googleLoading} className="auth-btn-secondary">
                  {googleLoading ? <Loader style={{ width: 16, height: 16, animation: 'spin 1s linear infinite' }} /> : <Chrome style={{ width: 16, height: 16 }} />}
                  Continue with Google
                </button>

                <p style={{ textAlign: 'center', fontSize: 14, color: '#71717a', marginTop: 20 }}>
                  Already have an account?{' '}
                  <Link href="/login" style={{ color: '#22d3ee', textDecoration: 'none', fontWeight: 600 }}>Sign in</Link>
                </p>
              </motion.div>
            )}

            {/* ── STEP 2: Profile ── */}
            {step === 2 && (
              <motion.div key="s2" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}>
                <div style={{ textAlign: 'center', marginBottom: 20 }}>
                  <h1 style={{ fontSize: 20, fontWeight: 800, color: '#f4f4f5', margin: '0 0 6px' }}>Your identity</h1>
                  <p style={{ fontSize: 14, color: '#71717a', margin: 0 }}>How the city knows you</p>
                </div>

                {/* Starting rank */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', border: '1px solid rgba(34,211,238,0.15)', background: 'rgba(34,211,238,0.04)', marginBottom: 20 }}>
                  <span style={{ fontSize: 24 }}>{RANK_ENTRY.emoji}</span>
                  <div>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', fontFamily: 'monospace', letterSpacing: '0.08em' }}>Starting rank</span>
                    <p style={{ fontSize: 14, fontWeight: 700, color: '#6b7280', margin: '2px 0 0' }}>{RANK_ENTRY.label}</p>
                  </div>
                </div>

                <AnimatePresence mode="wait">
                  {message && (
                    <motion.div key={message.text} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ marginBottom: 16 }}>
                      <div className={message.type === 'error' ? 'auth-msg-error' : 'auth-msg-success'}>
                        <XCircle style={{ width: 15, height: 15, flexShrink: 0, marginTop: 1 }} />
                        <span>{message.text}</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {/* Username */}
                  <div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#71717a', marginBottom: 7, fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                      <User style={{ width: 11, height: 11 }} /> Username
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="text"
                        value={username}
                        onChange={e => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                        placeholder="your_handle"
                        required minLength={3} maxLength={20}
                        className="auth-input"
                        style={{ paddingRight: 44 }}
                      />
                      <div style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', display: 'flex' }}>
                        {checkingUsername && <Loader style={{ width: 15, height: 15, color: '#52525b', animation: 'spin 1s linear infinite' }} />}
                        {!checkingUsername && usernameAvailable === true && <CheckCircle style={{ width: 15, height: 15, color: '#22c55e' }} />}
                        {!checkingUsername && usernameAvailable === false && <XCircle style={{ width: 15, height: 15, color: '#ef4444' }} />}
                      </div>
                    </div>
                    {!checkingUsername && usernameAvailable === false && (
                      <p style={{ fontSize: 12, color: '#ef4444', marginTop: 5 }}>This username is taken. Try another.</p>
                    )}
                    {!checkingUsername && usernameAvailable === true && (
                      <p style={{ fontSize: 12, color: '#22c55e', marginTop: 5 }}>✓ Available</p>
                    )}
                  </div>

                  {/* Display name */}
                  <div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#71717a', marginBottom: 7, fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                      Display name <span style={{ fontSize: 10, opacity: 0.6, marginLeft: 4 }}>(optional)</span>
                    </label>
                    <input type="text" value={displayName} onChange={e => setDisplayName(e.target.value)}
                      placeholder="How you appear publicly" className="auth-input" />
                  </div>

                  {/* City */}
                  <div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#71717a', marginBottom: 7, fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                      City / Region <span style={{ fontSize: 10, opacity: 0.6, marginLeft: 4 }}>(optional)</span>
                    </label>
                    <input type="text" value={city} onChange={e => setCity(e.target.value)}
                      placeholder="Mumbai, Delhi, Bangalore..." className="auth-input" />
                  </div>

                  {/* Avatar style */}
                  <div>
                    <label style={{ fontSize: 12, color: '#71717a', display: 'block', marginBottom: 8, fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                      Avatar style
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                      {(Object.entries(PFP_STYLES) as [PfpStyle, typeof PFP_STYLES[PfpStyle]][]).map(([style, data]) => (
                        <motion.button
                          key={style}
                          type="button"
                          onClick={() => setPfpStyle(style)}
                          whileTap={{ scale: 0.93 }}
                          title={data.label}
                          style={{
                            aspectRatio: '1', overflow: 'hidden', cursor: 'pointer',
                            border: pfpStyle === style ? '2px solid #22d3ee' : '2px solid transparent',
                            boxShadow: pfpStyle === style ? '0 0 12px rgba(34,211,238,0.3)' : 'none',
                            transition: 'all 0.15s', background: 'none', padding: 0,
                          }}
                        >
                          <div style={{ width: '100%', height: '100%', background: `linear-gradient(135deg, ${data.gradient[0]}, ${data.gradient[1]})`, position: 'relative' }}>
                            {pfpStyle === style && (
                              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.35)' }}>
                                <CheckCircle style={{ width: 16, height: 16, color: '#22d3ee' }} />
                              </div>
                            )}
                          </div>
                        </motion.button>
                      ))}
                    </div>
                    <p style={{ fontSize: 11, color: '#52525b', marginTop: 6, fontFamily: 'monospace' }}>
                      {PFP_STYLES[pfpStyle].label}
                    </p>
                  </div>

                  <button type="submit" disabled={loading || !usernameAvailable || !username} className="auth-btn-primary"
                    style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 4 }}>
                    {loading ? (
                      <><Loader style={{ width: 16, height: 16, animation: 'spin 1s linear infinite' }} /> Creating account...</>
                    ) : (
                      <><Zap style={{ width: 16, height: 16 }} /> Create Account</>
                    )}
                  </button>
                </form>
              </motion.div>
            )}

            {/* ── STEP 3: Verify email ── */}
            {step === 3 && (
              <motion.div key="s3" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: 'center', padding: '24px 0' }}>
                <motion.div
                  animate={{ rotate: [0, -8, 8, -4, 4, 0] }}
                  transition={{ duration: 1, delay: 0.3 }}
                  style={{ fontSize: 52, marginBottom: 16 }}
                >
                  👑
                </motion.div>
                <h2 style={{ fontSize: 22, fontWeight: 800, color: '#f4f4f5', margin: '0 0 12px' }}>
                  Account created!
                </h2>
                <div className="auth-msg-success" style={{ textAlign: 'left', marginBottom: 16 }}>
                  <CheckCircle style={{ width: 15, height: 15, flexShrink: 0, marginTop: 1 }} />
                  <span>We sent a verification email to <strong>{email}</strong>. Check your inbox and confirm to activate your account.</span>
                </div>
                <p style={{ fontSize: 14, color: '#71717a', marginBottom: 24 }}>
                  Once verified, you can sign in and start your journey.
                </p>
                <Link href="/login">
                  <button className="auth-btn-primary" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    Go to Sign In
                    <ArrowRight style={{ width: 16, height: 16 }} />
                  </button>
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {step === 1 && (
          <p style={{ textAlign: 'center', fontSize: 12, color: '#3f3f46', marginTop: 16 }}>
            By creating an account you agree to our{' '}
            <Link href="/legal/tos" style={{ color: '#52525b', textDecoration: 'none' }}>Terms</Link>
            {' '}&amp;{' '}
            <Link href="/legal/privacy" style={{ color: '#52525b', textDecoration: 'none' }}>Privacy Policy</Link>
          </p>
        )}
      </div>
    </div>
  )
}

export default function SignupPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: '#09090b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader style={{ width: 20, height: 20, color: '#22d3ee', animation: 'spin 1s linear infinite' }} />
      </div>
    }>
      <SignupContent />
    </Suspense>
  )
}
