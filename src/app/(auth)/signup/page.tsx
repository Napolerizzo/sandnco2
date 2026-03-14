'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import Turnstile from 'react-turnstile'
import {
  Eye, EyeOff, Mail, Lock, User, Loader, AlertTriangle,
  CheckCircle, Chrome, Zap, ArrowRight, Crown
} from 'lucide-react'
import { RANKS, PFP_STYLES, type PfpStyle } from '@/lib/ranks'
import { track, EVENTS } from '@/lib/posthog'
import toast from 'react-hot-toast'

const RANK_ENTRY = RANKS['ghost_in_the_city']

function SignupContent() {
  const router = useRouter()
  const supabase = createClient()

  const [step, setStep] = useState<'account' | 'identity' | 'done'>('account')
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
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; delay: number }>>([])

  useEffect(() => {
    const p = Array.from({ length: 25 }, (_, i) => ({
      id: i, x: Math.random() * 100, y: Math.random() * 100, delay: Math.random() * 5,
    }))
    setParticles(p)
  }, [])

  // Password strength checker
  useEffect(() => {
    let strength = 0
    if (password.length >= 8) strength++
    if (/[A-Z]/.test(password)) strength++
    if (/[0-9]/.test(password)) strength++
    if (/[^A-Za-z0-9]/.test(password)) strength++
    setPasswordStrength(strength)
  }, [password])

  // Username availability check with debounce
  useEffect(() => {
    if (!username || username.length < 3) {
      setUsernameAvailable(null)
      return
    }
    setCheckingUsername(true)
    const timeout = setTimeout(async () => {
      const { data } = await supabase.from('users').select('id').eq('username', username).single()
      setUsernameAvailable(!data)
      setCheckingUsername(false)
    }, 500)
    return () => clearTimeout(timeout)
  }, [username, supabase])

  const handleStep1 = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (!turnstileToken) {
      setMessage({ type: 'error', text: 'Complete the security check.' })
      return
    }
    if (passwordStrength < 2) {
      setMessage({ type: 'error', text: 'Password is too weak. Add uppercase, numbers, or symbols.' })
      return
    }
    setStep('identity')
    setMessage(null)
  }, [turnstileToken, passwordStrength])

  const handleSignup = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (!usernameAvailable) {
      setMessage({ type: 'error', text: 'That username is taken. Pick another.' })
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
    const { success: tsOk } = await verify.json()
    if (!tsOk) {
      setMessage({ type: 'error', text: 'Security verification failed.' })
      setLoading(false)
      return
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username, display_name: displayName || username, city, pfp_style: pfpStyle },
        emailRedirectTo: `${window.location.origin}/api/auth/callback`,
      },
    })

    if (error) {
      setMessage({ type: 'error', text: error.message })
      setLoading(false)
      return
    }

    track(EVENTS.USER_SIGNUP, { method: 'email', pfp_style: pfpStyle })
    setStep('done')
    setLoading(false)
  }, [email, password, username, displayName, city, pfpStyle, turnstileToken, usernameAvailable, supabase])

  const handleGoogleSignup = useCallback(async () => {
    setGoogleLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback?next=/feed`,
      },
    })
    if (error) {
      toast.error(error.message)
      setGoogleLoading(false)
    }
  }, [supabase])

  const strengthColors = ['#ef4444', '#f97316', '#eab308', '#22c55e']
  const strengthLabels = ['Weak', 'Okay', 'Good', 'Strong']

  return (
    <div className="min-h-screen bg-[#030303] grid-bg relative overflow-hidden flex items-center justify-center py-10">
      {/* Particles */}
      {particles.map(p => (
        <motion.div
          key={p.id}
          className="absolute w-1 h-1 rounded-full"
          style={{
            left: `${p.x}%`, top: `${p.y}%`,
            background: p.id % 4 === 0 ? '#fbbf24' : p.id % 4 === 1 ? '#06b6d4' : p.id % 4 === 2 ? '#a855f7' : '#00ff87',
            opacity: 0.3,
          }}
          animate={{ y: [-15, 15], opacity: [0.1, 0.5, 0.1] }}
          transition={{ duration: 2.5 + p.delay, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}

      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(251,191,36,0.04)_0%,transparent_60%)] pointer-events-none" />

      <div className="w-full max-w-md px-6 z-10">
        {/* Header */}
        <motion.div className="text-center mb-8" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex justify-center mb-3">
            <div className="relative w-14 h-14">
              <Image src="/logo.png" alt="King of Good Times" fill className="object-contain crown-animate" />
            </div>
          </div>
          <h1 className="font-display text-4xl tracking-wider" style={{ fontFamily: "'Bebas Neue', cursive" }}>
            <span className="text-gradient-gold">JOIN THE CITY</span>
          </h1>
          <p className="font-mono text-xs text-zinc-500 mt-1 tracking-widest uppercase">
            Your legend starts here
          </p>
        </motion.div>

        {/* Step indicator */}
        {step !== 'done' && (
          <div className="flex items-center gap-2 mb-6 justify-center">
            {['account', 'identity'].map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center font-tech text-xs transition-all ${
                  step === s ? 'bg-yellow-400 text-black' :
                  (i === 0 && step === 'identity') ? 'bg-green-500/20 border border-green-500/40 text-green-400' :
                  'bg-white/5 border border-white/10 text-zinc-500'
                }`}>
                  {i === 0 && step === 'identity' ? <CheckCircle className="w-3 h-3" /> : i + 1}
                </div>
                {i < 1 && <div className={`h-px w-8 transition-all ${step === 'identity' ? 'bg-yellow-400/40' : 'bg-white/5'}`} />}
              </div>
            ))}
          </div>
        )}

        <AnimatePresence mode="wait">
          {/* STEP 1: Account */}
          {step === 'account' && (
            <motion.div
              key="step1"
              className="glass-gold rounded-2xl p-8"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <div className="mb-5">
                <h2 className="font-tech text-sm font-bold text-yellow-400 tracking-widest uppercase mb-1">
                  Create Account
                </h2>
                <p className="text-zinc-500 font-mono text-xs">Your access credentials to the city.</p>
              </div>

              <form onSubmit={handleStep1} className="space-y-4">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    type="email" value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="email@domain.com" required
                    className="input-cyber w-full rounded-lg pl-10 pr-4 py-3 text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <input
                      type={showPassword ? 'text' : 'password'} value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Create a strong password" required minLength={8}
                      className="input-cyber w-full rounded-lg pl-10 pr-10 py-3 text-sm"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-yellow-400 transition-colors">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {password.length > 0 && (
                    <div className="flex gap-1">
                      {[0, 1, 2, 3].map(i => (
                        <div key={i} className="flex-1 h-0.5 rounded-full transition-all"
                          style={{ background: i < passwordStrength ? strengthColors[passwordStrength - 1] : '#27272a' }} />
                      ))}
                      <span className="text-xs font-mono ml-2" style={{ color: passwordStrength > 0 ? strengthColors[passwordStrength - 1] : '#52525b' }}>
                        {passwordStrength > 0 ? strengthLabels[passwordStrength - 1] : ''}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex justify-center">
                  <Turnstile
                    sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '1x00000000000000000000AA'}
                    onVerify={t => setTurnstileToken(t)}
                    onExpire={() => setTurnstileToken(null)}
                    theme="dark"
                  />
                </div>

                <AnimatePresence>
                  {message && (
                    <motion.div
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-mono bg-red-500/10 border border-red-500/20 text-red-400"
                    >
                      <AlertTriangle className="w-3 h-3 flex-shrink-0" />{message.text}
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.button
                  type="submit" disabled={loading || !turnstileToken}
                  className="btn-primary w-full py-3 rounded-lg text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                  whileTap={{ scale: 0.98 }}
                >
                  Continue <ArrowRight className="w-4 h-4" />
                </motion.button>
              </form>

              <div className="flex items-center gap-4 my-5">
                <div className="flex-1 h-px bg-white/5" />
                <span className="text-zinc-600 font-mono text-xs">OR</span>
                <div className="flex-1 h-px bg-white/5" />
              </div>

              <motion.button
                onClick={handleGoogleSignup} disabled={googleLoading}
                className="btn-ghost w-full py-3 rounded-lg text-sm flex items-center justify-center gap-2"
                whileTap={{ scale: 0.98 }}
              >
                {googleLoading ? <Loader className="w-4 h-4 animate-spin" /> : <Chrome className="w-4 h-4" />}
                Continue with Google
              </motion.button>

              <p className="text-center text-zinc-600 font-mono text-xs mt-5">
                Already in?{' '}
                <Link href="/login" className="text-yellow-400 hover:text-yellow-300 transition-colors">
                  Sign in →
                </Link>
              </p>
            </motion.div>
          )}

          {/* STEP 2: Identity */}
          {step === 'identity' && (
            <motion.div
              key="step2"
              className="glass-gold rounded-2xl p-8"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="mb-5">
                <h2 className="font-tech text-sm font-bold text-yellow-400 tracking-widest uppercase mb-1">
                  Your Identity
                </h2>
                <p className="text-zinc-500 font-mono text-xs">How the city will know you.</p>
              </div>

              {/* Rank preview */}
              <div className="flex items-center gap-3 p-3 rounded-lg bg-white/3 border border-white/5 mb-5">
                <span className="text-2xl">{RANK_ENTRY.emoji}</span>
                <div>
                  <span className="badge-rank rank-ghost">{RANK_ENTRY.label}</span>
                  <p className="text-zinc-500 font-mono text-xs mt-1">Your starting rank in the city</p>
                </div>
              </div>

              <form onSubmit={handleSignup} className="space-y-4">
                {/* Username */}
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    type="text" value={username} onChange={e => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                    placeholder="username (a-z, 0-9, _)" required minLength={3} maxLength={20}
                    className="input-cyber w-full rounded-lg pl-10 pr-10 py-3 text-sm"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {checkingUsername && <Loader className="w-4 h-4 animate-spin text-zinc-500" />}
                    {!checkingUsername && usernameAvailable === true && <CheckCircle className="w-4 h-4 text-green-400" />}
                    {!checkingUsername && usernameAvailable === false && <AlertTriangle className="w-4 h-4 text-red-400" />}
                  </div>
                </div>

                {/* Display name */}
                <div className="relative">
                  <Crown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    type="text" value={displayName} onChange={e => setDisplayName(e.target.value)}
                    placeholder="Display name (optional)"
                    className="input-cyber w-full rounded-lg pl-10 pr-4 py-3 text-sm"
                  />
                </div>

                {/* City */}
                <input
                  type="text" value={city} onChange={e => setCity(e.target.value)}
                  placeholder="Your city (optional)"
                  className="input-cyber w-full rounded-lg px-4 py-3 text-sm"
                />

                {/* PFP Style */}
                <div>
                  <p className="font-tech text-xs text-zinc-400 tracking-widest uppercase mb-3">Avatar Style</p>
                  <div className="grid grid-cols-4 gap-2">
                    {(Object.entries(PFP_STYLES) as [PfpStyle, typeof PFP_STYLES[PfpStyle]][]).map(([style, data]) => (
                      <motion.button
                        key={style}
                        type="button"
                        onClick={() => setPfpStyle(style)}
                        className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                          pfpStyle === style ? 'border-yellow-400 scale-105' : 'border-white/5 hover:border-white/20'
                        }`}
                        whileTap={{ scale: 0.95 }}
                        title={data.label}
                      >
                        <div
                          className="w-full h-full"
                          style={{ background: `linear-gradient(135deg, ${data.gradient[0]}, ${data.gradient[1]})` }}
                        />
                        {pfpStyle === style && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <CheckCircle className="w-4 h-4 text-white drop-shadow" />
                          </div>
                        )}
                      </motion.button>
                    ))}
                  </div>
                  <p className="text-zinc-600 font-mono text-xs mt-2">{PFP_STYLES[pfpStyle].label} — {PFP_STYLES[pfpStyle].description}</p>
                </div>

                <AnimatePresence>
                  {message && (
                    <motion.div
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-mono bg-red-500/10 border border-red-500/20 text-red-400"
                    >
                      <AlertTriangle className="w-3 h-3 flex-shrink-0" />{message.text}
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.button
                  type="submit"
                  disabled={loading || !usernameAvailable || !username}
                  className="btn-primary w-full py-3 rounded-lg text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                  whileTap={{ scale: 0.98 }}
                >
                  {loading ? (
                    <><Loader className="w-4 h-4 animate-spin" /> CREATING YOUR LEGEND...</>
                  ) : (
                    <><Zap className="w-4 h-4" /> CLAIM YOUR THRONE</>
                  )}
                </motion.button>
              </form>
            </motion.div>
          )}

          {/* DONE */}
          {step === 'done' && (
            <motion.div
              key="done"
              className="glass-gold rounded-2xl p-10 text-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <motion.div
                className="text-6xl mb-4"
                animate={{ rotate: [0, -5, 5, -3, 3, 0] }}
                transition={{ duration: 1, delay: 0.3 }}
              >
                👑
              </motion.div>
              <h2 className="font-display text-3xl text-gradient-gold mb-2" style={{ fontFamily: "'Bebas Neue', cursive" }}>
                YOU&apos;RE IN THE CITY
              </h2>
              <p className="text-zinc-400 font-mono text-sm mb-2">
                Check your email to verify your account.
              </p>
              <p className="text-zinc-600 font-mono text-xs">
                Didn&apos;t receive it? Check spam or{' '}
                <span className="text-yellow-400">contact support</span>.
              </p>
              <Link href="/login">
                <motion.button
                  className="btn-primary mt-6 px-8 py-3 rounded-lg text-sm"
                  whileTap={{ scale: 0.98 }}
                >
                  GO TO LOGIN
                </motion.button>
              </Link>
            </motion.div>
          )}
        </AnimatePresence>

        {step === 'account' && (
          <p className="text-center text-zinc-700 font-mono text-xs mt-5">
            By signing up you agree to our{' '}
            <Link href="/legal/tos" className="text-zinc-500 hover:text-yellow-400 transition-colors">Terms</Link>{' '}
            &{' '}
            <Link href="/legal/privacy" className="text-zinc-500 hover:text-yellow-400 transition-colors">Privacy Policy</Link>
          </p>
        )}
      </div>
    </div>
  )
}

export default function SignupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#030303] flex items-center justify-center">
        <Loader className="w-8 h-8 animate-spin text-yellow-400" />
      </div>
    }>
      <SignupContent />
    </Suspense>
  )
}
