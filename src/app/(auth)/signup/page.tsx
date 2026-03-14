'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import Turnstile from 'react-turnstile'
import {
  Shield, Lock, Mail, User, Loader, Zap, Terminal, Eye,
  XCircle, CheckCircle, ChevronLeft, Chrome, ArrowRight, Fingerprint
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
  const [glitchEffect, setGlitchEffect] = useState(false)

  useEffect(() => {
    if (message?.type === 'error') {
      setGlitchEffect(true)
      setTimeout(() => setGlitchEffect(false), 500)
    }
  }, [message])

  // Password strength
  const getPasswordStrength = (pwd: string) => {
    if (pwd.length < 8) return { level: 0, text: 'WEAK_CIPHER: MINIMUM_8_CHARS_REQUIRED' }
    let s = 0
    if (/[A-Z]/.test(pwd)) s++
    if (/[0-9]/.test(pwd)) s++
    if (/[^A-Za-z0-9]/.test(pwd)) s++
    if (pwd.length >= 12) s++
    return {
      level: s,
      text: s === 0 ? 'STRENGTH: ACCEPTABLE' : s === 1 ? 'STRENGTH: MODERATE' : s >= 2 ? 'STRENGTH: STRONG' : 'STRENGTH: WEAK',
    }
  }
  const pwStrength = getPasswordStrength(password)

  // Username check with debounce
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
      setMessage({ type: 'error', text: 'SECURITY_BREACH: CAPTCHA_VERIFICATION_FAILED' })
      return
    }
    if (password.length < 8) {
      setMessage({ type: 'error', text: 'WEAK_CIPHER: MINIMUM_8_CHARS_REQUIRED' })
      return
    }
    setMessage(null)
    setStep(2)
  }, [turnstileToken, password])

  const handleSignup = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (usernameAvailable === false) {
      setMessage({ type: 'error', text: `REGISTRATION_FAILED: USERNAME_[${username.toUpperCase()}]_ALREADY_EXISTS` })
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
      setMessage({ type: 'error', text: 'TURNSTILE_ERROR: VERIFICATION_REJECTED' })
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
        setMessage({ type: 'error', text: `REGISTRATION_FAILED: USERNAME_[${username.toUpperCase()}]_MAY_ALREADY_EXIST` })
      } else if (msg.includes('email')) {
        setMessage({ type: 'error', text: `EMAIL_CONFLICT: [${email}]_ALREADY_REGISTERED` })
      } else {
        setMessage({ type: 'error', text: `REGISTRATION_ERROR: ${error.message.toUpperCase().replace(/\s+/g, '_')}` })
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

  const strengthColors = ['var(--red)', 'var(--yellow)', 'var(--green)', 'var(--cyan)']

  return (
    <div className="min-h-screen bg-black text-[var(--cyan)] font-mono flex flex-col items-center justify-center p-4 relative overflow-hidden">

      {/* Background */}
      <div className="fixed inset-0 grid-bg pointer-events-none" style={{ maskImage: 'radial-gradient(ellipse 80% 50% at 50% 50%, black, transparent)' }} />
      <motion.div
        className="fixed left-0 w-full h-[2px] pointer-events-none z-10"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(0,255,245,0.6), transparent)', boxShadow: '0 0 20px rgba(0,255,245,0.5)', top: '-5%' }}
        animate={{ top: ['-5%', '105%'] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
      />

      {/* Corner brackets */}
      <div className="fixed top-8 left-8 w-16 h-16 border-l-2 border-t-2 border-[var(--cyan-border)] pointer-events-none" />
      <div className="fixed top-8 right-8 w-16 h-16 border-r-2 border-t-2 border-[var(--cyan-border)] pointer-events-none" />
      <div className="fixed bottom-8 left-8 w-16 h-16 border-l-2 border-b-2 border-[var(--cyan-border)] pointer-events-none" />
      <div className="fixed bottom-8 right-8 w-16 h-16 border-r-2 border-b-2 border-[var(--cyan-border)] pointer-events-none" />

      {/* Glitch overlay */}
      <AnimatePresence>
        {glitchEffect && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: [0, 0.4, 0, 0.2, 0] }} exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }} className="fixed inset-0 bg-red-500 mix-blend-screen pointer-events-none z-20" />
        )}
      </AnimatePresence>

      <div className="relative z-10 w-full max-w-md">

        {/* Back */}
        <Link href="/">
          <motion.button whileHover={{ x: -4 }}
            className="flex items-center gap-2 text-[10px] text-[var(--text-dim)] hover:text-[var(--cyan)] mb-6 transition-colors uppercase tracking-[0.2em] group">
            <ChevronLeft className="w-3.5 h-3.5" />
            <span className="border-b border-[var(--cyan-border)]">ABORT_MISSION</span>
          </motion.button>
        </Link>

        {/* Step indicator */}
        {step < 3 && (
          <div className="flex items-center gap-2 mb-4 justify-center">
            {[1, 2].map(s => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-6 h-6 flex items-center justify-center text-[10px] font-bold border transition-all ${
                  step === s ? 'border-[var(--cyan)] text-[var(--cyan)] bg-[var(--cyan-ghost)]' :
                  s < step ? 'border-[var(--green)] text-[var(--green)] bg-[rgba(0,255,135,0.06)]' :
                  'border-[var(--text-ghost)] text-[var(--text-ghost)]'
                }`}>
                  {s < step ? <CheckCircle className="w-3 h-3" /> : s}
                </div>
                {s < 2 && <div className={`h-px w-8 ${step > 1 ? 'bg-[var(--cyan-border)]' : 'bg-[var(--text-ghost)]'}`} />}
              </div>
            ))}
          </div>
        )}

        {/* Terminal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`terminal transition-all ${glitchEffect ? 'border-[var(--red)]' : ''}`}
        >
          <div className="terminal-header">
            <div className="terminal-dots"><span /><span /><span /></div>
            <div className="terminal-title"><Terminal className="w-3 h-3" /> REGISTRATION_PROTOCOL</div>
          </div>

          <div className="terminal-body">
            <AnimatePresence mode="wait">

              {/* STEP 1 */}
              {step === 1 && (
                <motion.div key="s1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                  <div className="text-center mb-8">
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}
                      className="inline-block p-3 border border-[var(--cyan-border)] bg-[var(--cyan-ghost)] mb-4 relative">
                      <Fingerprint className="w-8 h-8 text-[var(--cyan)]" />
                    </motion.div>
                    <h1 className="text-xl font-extrabold uppercase tracking-wider text-glow-cyan mb-1">NEW AGENT REGISTRATION</h1>
                    <p className="text-[9px] text-[var(--text-dim)] uppercase tracking-[0.3em]">SECURE CREDENTIAL SETUP</p>
                  </div>

                  <AnimatePresence mode="wait">
                    {message && (
                      <motion.div key={message.text} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className={`mb-5 ${message.type === 'error' ? 'msg-error' : 'msg-success'}`}>
                        <XCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        <div className="flex-1 font-bold break-words">{message.text}</div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <form onSubmit={handleStep1} className="space-y-5">
                    <div>
                      <label className="label-terminal"><Mail className="w-3 h-3" /> EMAIL_ADDRESS</label>
                      <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                        placeholder="agent@domain.com" required className="input-terminal" />
                    </div>

                    <div>
                      <label className="label-terminal"><Lock className="w-3 h-3" /> CIPHER_KEY</label>
                      <div className="relative">
                        <input type={showPassword ? 'text' : 'password'} value={password}
                          onChange={e => setPassword(e.target.value)} placeholder="MINIMUM_8_CHARACTERS" required minLength={8}
                          className="input-terminal pr-10" style={{ letterSpacing: showPassword ? 'normal' : '0.15em' }} />
                        <button type="button" onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-dim)] hover:text-[var(--cyan)] transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                      {password.length > 0 && (
                        <div className="mt-2">
                          <div className="flex gap-1 mb-1">
                            {[0, 1, 2, 3].map(i => (
                              <div key={i} className="flex-1 h-[2px] transition-all"
                                style={{ background: i < pwStrength.level ? strengthColors[Math.min(pwStrength.level - 1, 3)] : 'var(--text-ghost)' }} />
                            ))}
                          </div>
                          <p className="text-[9px] tracking-[0.15em]" style={{ color: password.length >= 8 ? strengthColors[Math.min(pwStrength.level - 1, 3)] || 'var(--yellow)' : 'var(--red)' }}>
                            {password.length < 8 ? pwStrength.text : pwStrength.text}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-center py-2">
                      <Turnstile sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '1x00000000000000000000AA'}
                        onVerify={t => setTurnstileToken(t)} onExpire={() => setTurnstileToken(null)} theme="dark" />
                    </div>

                    <motion.button type="submit" disabled={!turnstileToken} className="btn-execute" whileTap={{ scale: 0.98 }}>
                      <span className="relative z-10 flex items-center justify-center gap-3">
                        CONTINUE <ArrowRight className="w-4 h-4" />
                      </span>
                    </motion.button>
                  </form>

                  <div className="flex items-center gap-4 my-6">
                    <div className="flex-1 h-px bg-[var(--cyan-border)]" />
                    <span className="text-[9px] text-[var(--text-dim)] tracking-[0.2em]">ALTERNATE_PROTOCOL</span>
                    <div className="flex-1 h-px bg-[var(--cyan-border)]" />
                  </div>

                  <motion.button onClick={handleGoogleSignup} disabled={googleLoading}
                    className="btn-outline w-full flex items-center justify-center gap-3" whileTap={{ scale: 0.98 }}>
                    {googleLoading ? <Loader className="w-4 h-4 animate-spin" /> : <Chrome className="w-4 h-4" />}
                    GOOGLE_AUTH
                  </motion.button>

                  <div className="mt-6 text-center">
                    <button onClick={() => router.push('/login')} className="btn-link">
                      <span>EXISTING_AGENT? AUTHENTICATE</span>
                    </button>
                  </div>
                </motion.div>
              )}

              {/* STEP 2 */}
              {step === 2 && (
                <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <div className="text-center mb-6">
                    <h1 className="text-xl font-extrabold uppercase tracking-wider text-glow-cyan mb-1">AGENT IDENTITY</h1>
                    <p className="text-[9px] text-[var(--text-dim)] uppercase tracking-[0.3em]">HOW THE CITY KNOWS YOU</p>
                  </div>

                  {/* Starting rank preview */}
                  <div className="flex items-center gap-3 p-3 border border-[var(--cyan-border)] bg-[var(--cyan-ghost)] mb-6">
                    <span className="text-2xl">{RANK_ENTRY.emoji}</span>
                    <div>
                      <span className="badge rank-ghost">{RANK_ENTRY.label}</span>
                      <p className="text-[9px] text-[var(--text-dim)] mt-1 uppercase tracking-wider">INITIAL_RANK_ASSIGNMENT</p>
                    </div>
                  </div>

                  <AnimatePresence mode="wait">
                    {message && (
                      <motion.div key={message.text} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className={`mb-5 ${message.type === 'error' ? 'msg-error' : 'msg-success'}`}>
                        <XCircle className="w-4 h-4 flex-shrink-0" />
                        <div className="flex-1 font-bold break-words">{message.text}</div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <form onSubmit={handleSignup} className="space-y-4">
                    <div>
                      <label className="label-terminal"><User className="w-3 h-3" /> AGENT_ALIAS</label>
                      <div className="relative">
                        <input type="text" value={username}
                          onChange={e => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                          placeholder="ENTER_CODENAME" required minLength={3} maxLength={20}
                          className="input-terminal pr-10" />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          {checkingUsername && <Loader className="w-4 h-4 animate-spin text-[var(--text-dim)]" />}
                          {!checkingUsername && usernameAvailable === true && <CheckCircle className="w-4 h-4 text-[var(--green)]" />}
                          {!checkingUsername && usernameAvailable === false && <XCircle className="w-4 h-4 text-[var(--red)]" />}
                        </div>
                      </div>
                      {!checkingUsername && usernameAvailable === false && (
                        <p className="text-[9px] text-[var(--red)] mt-1 tracking-wider">ALIAS_UNAVAILABLE: CHOOSE_DIFFERENT_CODENAME</p>
                      )}
                    </div>

                    <div>
                      <label className="label-terminal"><Shield className="w-3 h-3" /> DISPLAY_NAME [OPTIONAL]</label>
                      <input type="text" value={displayName} onChange={e => setDisplayName(e.target.value)}
                        placeholder="PUBLIC_IDENTITY" className="input-terminal" />
                    </div>

                    <div>
                      <label className="label-terminal">SECTOR [OPTIONAL]</label>
                      <input type="text" value={city} onChange={e => setCity(e.target.value)}
                        placeholder="CITY_OR_REGION" className="input-terminal" />
                    </div>

                    {/* Avatar style */}
                    <div>
                      <label className="label-terminal">AVATAR_SIGNATURE</label>
                      <div className="grid grid-cols-4 gap-2">
                        {(Object.entries(PFP_STYLES) as [PfpStyle, typeof PFP_STYLES[PfpStyle]][]).map(([style, data]) => (
                          <motion.button key={style} type="button" onClick={() => setPfpStyle(style)}
                            className={`relative aspect-square overflow-hidden border transition-all ${
                              pfpStyle === style ? 'border-[var(--cyan)] shadow-[0_0_10px_rgba(0,255,245,0.3)]' : 'border-[var(--text-ghost)] hover:border-[var(--cyan-border)]'
                            }`} whileTap={{ scale: 0.95 }} title={data.label}>
                            <div className="w-full h-full" style={{ background: `linear-gradient(135deg, ${data.gradient[0]}, ${data.gradient[1]})` }} />
                            {pfpStyle === style && (
                              <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                                <CheckCircle className="w-4 h-4 text-[var(--cyan)]" />
                              </div>
                            )}
                          </motion.button>
                        ))}
                      </div>
                      <p className="text-[9px] text-[var(--text-dim)] mt-2 tracking-wider uppercase">
                        SELECTED: {PFP_STYLES[pfpStyle].label.toUpperCase().replace(/\s+/g, '_')}
                      </p>
                    </div>

                    <motion.button type="submit" disabled={loading || !usernameAvailable || !username}
                      className="btn-execute" whileTap={{ scale: 0.98 }}>
                      <span className="relative z-10 flex items-center justify-center gap-3">
                        {loading ? <><Loader className="w-4 h-4 animate-spin" /> REGISTERING_AGENT...</> : <><Zap className="w-4 h-4" /> INITIALIZE_AGENT</>}
                      </span>
                    </motion.button>
                  </form>
                </motion.div>
              )}

              {/* STEP 3: Done */}
              {step === 3 && (
                <motion.div key="s3" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-6">
                  <motion.div animate={{ rotate: [0, -5, 5, 0] }} transition={{ duration: 0.8, delay: 0.3 }}
                    className="text-5xl mb-4">👑</motion.div>
                  <h2 className="text-2xl font-extrabold uppercase tracking-wider text-glow-cyan mb-3">
                    AGENT_CREATED
                  </h2>
                  <div className="msg-success mb-4 text-left">
                    <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">VERIFICATION_EMAIL_DISPATCHED: CHECK_SECURE_CHANNEL_[EMAIL]</div>
                  </div>
                  <p className="text-[10px] text-[var(--text-dim)] tracking-wider uppercase mb-6">
                    CONFIRM_EMAIL_TO_ACTIVATE_AGENT_STATUS
                  </p>
                  <Link href="/login">
                    <motion.button className="btn-execute" whileTap={{ scale: 0.98 }}>
                      <span className="relative z-10">PROCEED_TO_AUTHENTICATION</span>
                    </motion.button>
                  </Link>
                </motion.div>
              )}

            </AnimatePresence>
          </div>

          <div className="terminal-footer">
            <Lock className="w-3 h-3" />
            ENCRYPTION: AES-256 | KING_OF_GOOD_TIMES_V2
          </div>
        </motion.div>

        {step === 1 && (
          <div className="mt-5 text-center text-[9px] text-[var(--text-ghost)] uppercase tracking-[0.15em]">
            By registering you accept our{' '}
            <Link href="/legal/tos" className="text-[var(--text-dim)] hover:text-[var(--cyan)] transition-colors border-b border-[var(--text-ghost)]">TERMS</Link>{' '}
            &{' '}
            <Link href="/legal/privacy" className="text-[var(--text-dim)] hover:text-[var(--cyan)] transition-colors border-b border-[var(--text-ghost)]">PRIVACY_POLICY</Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default function SignupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-[var(--cyan)] font-mono text-sm animate-pulse flex items-center gap-3">
          <Loader className="w-5 h-5 animate-spin" /> INITIALIZING_REGISTRATION_PROTOCOL...
        </div>
      </div>
    }>
      <SignupContent />
    </Suspense>
  )
}
