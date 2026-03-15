'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MessageCircle, Send, Loader, Bot, User as UserIcon, Ticket,
  HelpCircle, Zap, CreditCard, Bug, Scale, CheckCircle, XCircle,
  ArrowLeft, LogIn, ShieldCheck
} from 'lucide-react'
import { formatRelativeTime } from '@/lib/utils'
import { useSupabase } from '@/components/providers/SupabaseProvider'
import Link from 'next/link'
import Image from 'next/image'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

const TICKET_CATEGORIES = [
  { id: 'payment', icon: CreditCard, label: 'Payment Issue', description: 'Problems with deposits or withdrawals' },
  { id: 'wallet', icon: Zap, label: 'Wallet Error', description: 'Balance or transaction problems' },
  { id: 'membership', icon: Bot, label: 'Membership', description: 'Premium membership questions' },
  { id: 'bug', icon: Bug, label: 'Bug Report', description: 'Something broken? Tell us.' },
  { id: 'appeal', icon: Scale, label: 'Mod Appeal', description: 'Contest a moderation decision' },
  { id: 'general', icon: HelpCircle, label: 'General Help', description: 'Anything else' },
]

// Detect payment IDs in user messages
const PAYMENT_ID_REGEX = /pay_[a-zA-Z0-9]{10,}/

export default function SupportPage() {
  const { user, loading: authLoading } = useSupabase()

  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState<'chat' | 'ticket'>('chat')
  const [ticketCategory, setTicketCategory] = useState('')
  const [ticketSubject, setTicketSubject] = useState('')
  const [ticketDesc, setTicketDesc] = useState('')
  const [ticketSubmitted, setTicketSubmitted] = useState(false)
  const [submittingTicket, setSubmittingTicket] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [initialized, setInitialized] = useState(false)

  // Set initial greeting based on auth state
  useEffect(() => {
    if (authLoading || initialized) return
    setInitialized(true)

    if (user) {
      setMessages([{
        role: 'assistant',
        content: "Hey! I'm Suno, your SANDNCO assistant. I can help with account questions, wallet issues, payment verification, challenges, and more. If you have a payment issue, just share your Razorpay payment ID (starts with pay_) and I'll verify it for you!",
        timestamp: new Date(),
      }])
    } else {
      setMessages([{
        role: 'assistant',
        content: "Hey! I'm Suno, your SANDNCO assistant. I can answer general questions about the platform. For account-specific help (wallet, payments, membership), you'll need to log in first. What can I help you with?",
        timestamp: new Date(),
      }])
    }
  }, [authLoading, user, initialized])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = useCallback(async () => {
    if (!input.trim() || loading) return
    const userMessage: Message = { role: 'user', content: input, timestamp: new Date() }
    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    try {
      // Check if user is sharing a payment ID for verification
      const paymentMatch = input.match(PAYMENT_ID_REGEX)
      const body: Record<string, unknown> = {
        messages: newMessages.map(m => ({ role: m.role, content: m.content })),
      }

      if (paymentMatch && user) {
        body.checkPaymentId = paymentMatch[0]
      }

      const res = await fetch('/api/ai/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      const content = data.content || "I'm not able to respond right now. Please try again or email sandncolol@gmail.com."
      setMessages(prev => [...prev, { role: 'assistant', content, timestamp: new Date() }])
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "Sorry, I had a connection issue. Try again or email us at sandncolol@gmail.com.",
        timestamp: new Date(),
      }])
    } finally {
      setLoading(false)
    }
  }, [input, loading, messages, user])

  const submitTicket = useCallback(async () => {
    if (!ticketCategory || !ticketSubject || !ticketDesc) return
    setSubmittingTicket(true)
    try {
      const res = await fetch('/api/support/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: ticketCategory, subject: ticketSubject, description: ticketDesc }),
      })
      const { success } = await res.json()
      if (success) setTicketSubmitted(true)
    } catch {
      // silent
    }
    setSubmittingTicket(false)
  }, [ticketCategory, ticketSubject, ticketDesc])

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', fontFamily: 'var(--font)' }}>
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '40px 24px' }}>

        {/* Top bar — logo + back */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', color: 'var(--text)' }}>
            <Image src="/logo.png" alt="SANDNCO" width={32} height={32} style={{ borderRadius: 8 }} />
            <span style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-0.02em' }}>SANDNCO</span>
          </Link>
          <Link
            href={user ? '/feed' : '/'}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '7px 14px', fontSize: 12, fontWeight: 500,
              borderRadius: 7, textDecoration: 'none',
              background: 'var(--bg-elevated)', color: 'var(--muted)',
              border: '1px solid var(--border)', transition: 'all 0.15s',
            }}
          >
            <ArrowLeft size={13} />
            {user ? 'Back to Feed' : 'Back to Home'}
          </Link>
        </div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ marginBottom: 32 }}
        >
          <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.025em', margin: '0 0 6px' }}>
            Support
          </h1>
          <p style={{ fontSize: 15, color: 'var(--muted)', margin: 0 }}>
            Chat with Suno or open a ticket. We reply within 24–48 hours.
          </p>
        </motion.div>

        {/* Mode tabs */}
        <div style={{
          display: 'flex', gap: 4,
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 10, padding: 4, marginBottom: 24, width: 'fit-content',
        }}>
          {[
            { id: 'chat', icon: MessageCircle, label: 'AI Chat' },
            { id: 'ticket', icon: Ticket, label: 'Open Ticket' },
          ].map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => setMode(id as 'chat' | 'ticket')}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 7,
                padding: '8px 16px', fontSize: 13, fontWeight: 500,
                borderRadius: 7, cursor: 'pointer', border: 'none', fontFamily: 'var(--font)',
                background: mode === id ? 'var(--bg-elevated)' : 'transparent',
                color: mode === id ? 'var(--text)' : 'var(--subtle)',
                transition: 'all 0.15s',
              }}
            >
              <Icon style={{ width: 14, height: 14 }} />
              {label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">

          {/* ── CHAT MODE ── */}
          {mode === 'chat' && (
            <motion.div key="chat" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div style={{
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                borderRadius: 12, overflow: 'hidden',
              }}>
                {/* Chat header */}
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '14px 16px', borderBottom: '1px solid var(--border)',
                  background: 'var(--bg-elevated)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: '50%',
                      background: 'var(--primary-dim)', border: '1px solid rgba(99,102,241,0.25)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Bot style={{ width: 16, height: 16, color: 'var(--primary)' }} />
                    </div>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 600, margin: 0 }}>Suno</p>
                      <p style={{ fontSize: 11, color: 'var(--success)', margin: 0, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--success)', display: 'inline-block' }} />
                        Online
                      </p>
                    </div>
                  </div>
                  {user && (
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 5,
                      padding: '4px 10px', borderRadius: 6,
                      background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)',
                    }}>
                      <ShieldCheck size={12} style={{ color: 'var(--success)' }} />
                      <span style={{ fontSize: 11, color: 'var(--success)', fontWeight: 500 }}>Verified</span>
                    </div>
                  )}
                </div>

                {/* Messages */}
                <div style={{ height: 400, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {messages.map((msg, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      style={{
                        display: 'flex', gap: 10,
                        flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
                      }}
                    >
                      <div style={{
                        width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                        background: msg.role === 'assistant' ? 'var(--primary-dim)' : 'var(--bg-elevated)',
                        border: `1px solid ${msg.role === 'assistant' ? 'rgba(99,102,241,0.25)' : 'var(--border)'}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        {msg.role === 'assistant'
                          ? <Bot style={{ width: 14, height: 14, color: 'var(--primary)' }} />
                          : <UserIcon style={{ width: 14, height: 14, color: 'var(--muted)' }} />}
                      </div>
                      <div style={{ maxWidth: '75%' }}>
                        <div style={{
                          padding: '10px 14px', borderRadius: 10, fontSize: 14, lineHeight: 1.6,
                          background: msg.role === 'assistant' ? 'var(--bg-elevated)' : 'var(--primary)',
                          color: msg.role === 'assistant' ? 'var(--text)' : '#fff',
                          border: msg.role === 'assistant' ? '1px solid var(--border)' : 'none',
                        }}>
                          {msg.content}
                        </div>
                        <p style={{ fontSize: 11, color: 'var(--subtle)', marginTop: 4 }}>
                          {formatRelativeTime(msg.timestamp)}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                  {loading && (
                    <div style={{ display: 'flex', gap: 10 }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                        background: 'var(--primary-dim)', border: '1px solid rgba(99,102,241,0.25)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <Bot style={{ width: 14, height: 14, color: 'var(--primary)' }} />
                      </div>
                      <div style={{
                        padding: '14px 16px', borderRadius: 10,
                        background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                        display: 'flex', gap: 4, alignItems: 'center',
                      }}>
                        {[0, 1, 2].map(i => (
                          <div key={i} style={{
                            width: 6, height: 6, borderRadius: '50%',
                            background: 'var(--muted)',
                            animation: 'bounce 0.8s ease-in-out infinite',
                            animationDelay: `${i * 0.15}s`,
                          }} />
                        ))}
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div style={{
                  display: 'flex', gap: 8, padding: 12,
                  borderTop: '1px solid var(--border)', background: 'var(--bg)',
                }}>
                  <input
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                    placeholder="Ask about your account, wallet, or features..."
                    className="input"
                    style={{ flex: 1 }}
                  />
                  <motion.button
                    onClick={sendMessage}
                    disabled={loading || !input.trim()}
                    whileTap={{ scale: 0.95 }}
                    style={{
                      padding: '10px 16px', background: 'var(--primary)', color: '#fff',
                      border: 'none', borderRadius: 8, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      opacity: loading || !input.trim() ? 0.5 : 1,
                    }}
                  >
                    {loading
                      ? <Loader style={{ width: 16, height: 16, animation: 'spin 1s linear infinite' }} />
                      : <Send style={{ width: 16, height: 16 }} />}
                  </motion.button>
                </div>
              </div>

              <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--subtle)', marginTop: 16 }}>
                Suno can&apos;t solve everything.{' '}
                <button onClick={() => setMode('ticket')} style={{ color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, padding: 0, fontFamily: 'var(--font)' }}>
                  Open a ticket
                </button>{' '}
                for urgent issues.
              </p>
            </motion.div>
          )}

          {/* ── TICKET MODE ── */}
          {mode === 'ticket' && (
            <motion.div key="ticket" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {/* Login gate for tickets */}
              {!user ? (
                <div style={{
                  textAlign: 'center', padding: '60px 24px',
                  background: 'var(--bg-card)', border: '1px solid var(--border)',
                  borderRadius: 12,
                }}>
                  <div style={{
                    width: 56, height: 56, borderRadius: '50%', margin: '0 auto 16px',
                    background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <LogIn style={{ width: 24, height: 24, color: 'var(--primary)' }} />
                  </div>
                  <h3 style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 8 }}>
                    Log in to open a ticket
                  </h3>
                  <p style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 24, lineHeight: 1.6, maxWidth: 360, margin: '0 auto 24px' }}>
                    We need your account info to track and respond to your ticket. You can still chat with Suno without logging in.
                  </p>
                  <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                    <Link
                      href="/login?next=/support"
                      style={{
                        padding: '10px 24px', fontSize: 14, fontWeight: 600,
                        background: 'var(--primary)', color: '#fff',
                        border: 'none', borderRadius: 8, textDecoration: 'none',
                        display: 'inline-flex', alignItems: 'center', gap: 8,
                      }}
                    >
                      <LogIn size={15} /> Log In
                    </Link>
                    <button
                      onClick={() => setMode('chat')}
                      style={{
                        padding: '10px 20px', fontSize: 14, fontWeight: 500,
                        background: 'var(--bg-elevated)', color: 'var(--muted)',
                        border: '1px solid var(--border)', borderRadius: 8,
                        cursor: 'pointer', fontFamily: 'var(--font)',
                      }}
                    >
                      Chat with Suno
                    </button>
                  </div>
                </div>
              ) : ticketSubmitted ? (
                <div style={{
                  textAlign: 'center', padding: '60px 24px',
                  background: 'var(--bg-card)', border: '1px solid var(--border)',
                  borderRadius: 12,
                }}>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    style={{ marginBottom: 16, display: 'flex', justifyContent: 'center' }}
                  >
                    <div style={{
                      width: 64, height: 64, borderRadius: '50%',
                      background: 'rgba(34,197,94,0.1)', border: '2px solid rgba(34,197,94,0.35)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <CheckCircle style={{ width: 28, height: 28, color: 'var(--success)' }} />
                    </div>
                  </motion.div>
                  <h3 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 8 }}>
                    Ticket submitted
                  </h3>
                  <p style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 24, lineHeight: 1.6 }}>
                    We&apos;ll respond to you at your email within 24–48 hours. You can also reach us at{' '}
                    <a href="mailto:sandncolol@gmail.com" style={{ color: 'var(--primary)' }}>sandncolol@gmail.com</a>.
                  </p>
                  <button
                    onClick={() => setMode('chat')}
                    style={{
                      padding: '10px 20px', fontSize: 14, fontWeight: 500,
                      background: 'var(--bg-elevated)', color: 'var(--muted)',
                      border: '1px solid var(--border)', borderRadius: 8,
                      cursor: 'pointer', fontFamily: 'var(--font)',
                    }}
                  >
                    Back to chat
                  </button>
                </div>
              ) : (
                <div style={{
                  background: 'var(--bg-card)', border: '1px solid var(--border)',
                  borderRadius: 12, padding: 24,
                }}>
                  {/* Category selection */}
                  <div style={{ marginBottom: 20 }}>
                    <label className="label" style={{ marginBottom: 10 }}>Category</label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                      {TICKET_CATEGORIES.map(({ id, icon: Icon, label, description }) => (
                        <button
                          key={id}
                          onClick={() => setTicketCategory(id)}
                          style={{
                            display: 'flex', alignItems: 'flex-start', gap: 10,
                            padding: '12px 14px', borderRadius: 8, textAlign: 'left',
                            cursor: 'pointer', fontFamily: 'var(--font)',
                            background: ticketCategory === id ? 'var(--primary-dim)' : 'var(--bg-elevated)',
                            border: ticketCategory === id ? '1px solid rgba(99,102,241,0.4)' : '1px solid var(--border)',
                            transition: 'all 0.15s',
                          }}
                        >
                          <Icon style={{ width: 15, height: 15, marginTop: 1, flexShrink: 0, color: ticketCategory === id ? 'var(--primary)' : 'var(--subtle)' }} />
                          <div>
                            <p style={{ fontSize: 13, fontWeight: 600, color: ticketCategory === id ? '#a5b4fc' : 'var(--text)', margin: 0 }}>{label}</p>
                            <p style={{ fontSize: 11, color: 'var(--subtle)', margin: '2px 0 0' }}>{description}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {ticketCategory && (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                      <div style={{ marginBottom: 14 }}>
                        <label className="label">Subject</label>
                        <input
                          type="text"
                          value={ticketSubject}
                          onChange={e => setTicketSubject(e.target.value)}
                          placeholder="Brief description of the issue"
                          className="input"
                          style={{ width: '100%' }}
                        />
                      </div>
                      <div style={{ marginBottom: 20 }}>
                        <label className="label">Description</label>
                        <textarea
                          value={ticketDesc}
                          onChange={e => setTicketDesc(e.target.value)}
                          placeholder="Describe the problem in detail. Include any relevant IDs or steps to reproduce."
                          rows={5}
                          className="input"
                          style={{ width: '100%', resize: 'vertical', fontFamily: 'var(--font)' }}
                        />
                      </div>
                      <motion.button
                        onClick={submitTicket}
                        disabled={submittingTicket || !ticketSubject || !ticketDesc}
                        whileTap={{ scale: 0.98 }}
                        style={{
                          width: '100%', padding: '12px', fontSize: 14, fontWeight: 600,
                          background: 'var(--primary)', color: '#fff', border: 'none',
                          borderRadius: 8, cursor: 'pointer', fontFamily: 'var(--font)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                          opacity: submittingTicket || !ticketSubject || !ticketDesc ? 0.5 : 1,
                        }}
                      >
                        {submittingTicket
                          ? <><Loader style={{ width: 16, height: 16, animation: 'spin 1s linear infinite' }} /> Submitting...</>
                          : <><Ticket style={{ width: 16, height: 16 }} /> Submit Ticket</>}
                      </motion.button>
                    </motion.div>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.5; }
          40% { transform: translateY(-6px); opacity: 1; }
        }
      `}</style>
    </div>
  )
}
