'use client'

import { useState, useEffect, Suspense, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import Turnstile from 'react-turnstile'
import { Eye, EyeOff, Mail, Lock, Loader, AlertTriangle, CheckCircle, Chrome, Zap } from 'lucide-react'
import { track, EVENTS } from '@/lib/posthog'
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
  const [glitchActive, setGlitchActive] = useState(false)
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; delay: number }>>([])

  // Generate floating particles
  useEffect(() => {
    const p = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 5,
    }))
    setParticles(p)

    // Random glitch effect
    const interval = setInterval(() => {
      setGlitchActive(true)
      setTimeout(() => setGlitchActive(false), 200)
    }, 8000)
    return () => clearInterval(interval)
  }, [])

  const handleLogin = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (!turnstileToken) {
      setMessage({ type: 'error', text: 'Complete the security check first.' })
      return
    }
    setLoading(true)
    setMessage(null)

    // Verify turnstile
    const verify = await fetch('/api/auth/verify-turnstile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: turnstileToken }),
    })
    const { success } = await verify.json()
    if (!success) {
      setMessage({ type: 'error', text: 'Security check failed. Refresh and try again.' })
      setLoading(false)
      return
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setMessage({ type: 'error', text: error.message })
      setLoading(false)
      return
    }

    toast.success('Welcome back, King.')
    router.push(redirectTo)
    router.refresh()
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
    <div className="min-h-screen bg-[#030303] grid-bg relative overflow-hidden flex items-center justify-center">
      {/* Animated background particles */}
      {particles.map(p => (
        <motion.div
          key={p.id}
          className="absolute w-1 h-1 rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            background: p.id % 3 === 0 ? '#fbbf24' : p.id % 3 === 1 ? '#06b6d4' : '#a855f7',
            opacity: 0.4,
          }}
          animate={{ y: [-20, 20], opacity: [0.1, 0.6, 0.1] }}
          transition={{ duration: 3 + p.delay, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}

      {/* Scanline */}
      <motion.div
        className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-yellow-400/20 to-transparent pointer-events-none"
        animate={{ y: ['-100vh', '100vh'] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
      />

      {/* Radial gradient glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(251,191,36,0.04)_0%,transparent_70%)] pointer-events-none" />

      <div className="w-full max-w-md px-6 z-10">
        {/* Logo + Brand */}
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex justify-center mb-4">
            <motion.div
              className="relative w-16 h-16"
              animate={{ rotate: glitchActive ? [0, -2, 3, -1, 0] : 0 }}
              transition={{ duration: 0.15 }}
            >
              <Image src="/logo.png" alt="King of Good Times" fill className="object-contain crown-animate" />
            </motion.div>
          </div>
          <motion.h1
            className="font-display text-5xl tracking-wider"
            style={{ fontFamily: "'Bebas Neue', cursive" }}
            animate={{ filter: glitchActive ? 'hue-rotate(90deg)' : 'hue-rotate(0deg)' }}
          >
            <span className="text-gradient-gold">KING OF</span>
            <br />
            <span className="text-white">GOOD TIMES</span>
          </motion.h1>
          <p className="font-mono text-xs text-zinc-500 mt-2 tracking-[0.3em] uppercase">
            sandnco.lol
          </p>
        </motion.div>

        {/* Auth Card */}
        <motion.div
          className="glass-gold rounded-2xl p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="mb-6">
            <h2 className="font-tech text-sm font-bold text-yellow-400 tracking-widest uppercase mb-1">
              Access Terminal
            </h2>
            <p className="text-zinc-500 font-mono text-xs">
              Enter your credentials to re-enter the city.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email */}
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="email@domain.com"
                required
                className="input-cyber w-full rounded-lg pl-10 pr-4 py-3 text-sm"
              />
            </div>

            {/* Password */}
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                className="input-cyber w-full rounded-lg pl-10 pr-10 py-3 text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-yellow-400 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <div className="flex justify-end">
              <Link href="/forgot-password" className="text-xs text-zinc-500 hover:text-yellow-400 transition-colors font-mono">
                Forgot access code?
              </Link>
            </div>

            {/* Turnstile */}
            <div className="flex justify-center">
              <Turnstile
                sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '1x00000000000000000000AA'}
                onVerify={(token) => setTurnstileToken(token)}
                onExpire={() => setTurnstileToken(null)}
                theme="dark"
              />
            </div>

            {/* Message */}
            <AnimatePresence>
              {message && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-mono ${
                    message.type === 'error'
                      ? 'bg-red-500/10 border border-red-500/20 text-red-400'
                      : 'bg-green-500/10 border border-green-500/20 text-green-400'
                  }`}
                >
                  {message.type === 'error' ? (
                    <AlertTriangle className="w-3 h-3 flex-shrink-0" />
                  ) : (
                    <CheckCircle className="w-3 h-3 flex-shrink-0" />
                  )}
                  {message.text}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={loading || !turnstileToken}
              className="btn-primary w-full py-3 rounded-lg text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              whileTap={{ scale: 0.98 }}
            >
              {loading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  AUTHENTICATING...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  ENTER THE CITY
                </>
              )}
            </motion.button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-5">
            <div className="flex-1 h-px bg-white/5" />
            <span className="text-zinc-600 font-mono text-xs">OR</span>
            <div className="flex-1 h-px bg-white/5" />
          </div>

          {/* Google OAuth */}
          <motion.button
            onClick={handleGoogleLogin}
            disabled={googleLoading}
            className="btn-ghost w-full py-3 rounded-lg text-sm flex items-center justify-center gap-2 disabled:opacity-50"
            whileTap={{ scale: 0.98 }}
          >
            {googleLoading ? (
              <Loader className="w-4 h-4 animate-spin" />
            ) : (
              <Chrome className="w-4 h-4" />
            )}
            Continue with Google
          </motion.button>

          <p className="text-center text-zinc-600 font-mono text-xs mt-6">
            No account?{' '}
            <Link href="/signup" className="text-yellow-400 hover:text-yellow-300 transition-colors">
              Join the city →
            </Link>
          </p>
        </motion.div>

        {/* Legal */}
        <p className="text-center text-zinc-700 font-mono text-xs mt-6">
          By signing in you agree to our{' '}
          <Link href="/legal/tos" className="text-zinc-500 hover:text-yellow-400 transition-colors">
            Terms
          </Link>{' '}
          &{' '}
          <Link href="/legal/privacy" className="text-zinc-500 hover:text-yellow-400 transition-colors">
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#030303] flex items-center justify-center">
        <div className="text-yellow-400 font-mono text-sm animate-pulse flex items-center gap-3">
          <Loader className="w-5 h-5 animate-spin" />
          INITIALIZING...
        </div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  )
}
