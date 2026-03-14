'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import {
  MessageCircle, Send, Loader, Bot, User, Terminal,
  Ticket, HelpCircle, Zap, CreditCard, Bug, Scale, Lock, Shield
} from 'lucide-react'
import { formatRelativeTime } from '@/lib/utils'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

const TICKET_CATEGORIES = [
  { id: 'payment', icon: CreditCard, label: 'PAYMENT_ISSUE', description: 'Problems with deposits or withdrawals' },
  { id: 'wallet', icon: Zap, label: 'WALLET_ERROR', description: 'Balance or transaction issues' },
  { id: 'membership', icon: Bot, label: 'MEMBERSHIP', description: 'Premium membership questions' },
  { id: 'bug', icon: Bug, label: 'BUG_REPORT', description: 'Something broken? Tell us.' },
  { id: 'appeal', icon: Scale, label: 'MOD_APPEAL', description: 'Contest a moderation decision' },
  { id: 'general', icon: HelpCircle, label: 'GENERAL', description: 'Anything else' },
]

export default function SupportPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "SUNO_ONLINE. I'm your city guide. What do you need help with? I can assist with account questions, wallet issues, challenges, or anything platform-related. If I can't resolve it, I'll connect you with a human agent.",
      timestamp: new Date(),
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState<'chat' | 'ticket'>('chat')
  const [ticketCategory, setTicketCategory] = useState('')
  const [ticketSubject, setTicketSubject] = useState('')
  const [ticketDesc, setTicketDesc] = useState('')
  const [ticketSubmitted, setTicketSubmitted] = useState(false)
  const [submittingTicket, setSubmittingTicket] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async () => {
    if (!input.trim() || loading) return

    const userMessage: Message = { role: 'user', content: input, timestamp: new Date() }
    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/ai/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
        }),
      })
      const { content } = await res.json()
      setMessages(prev => [...prev, { role: 'assistant', content, timestamp: new Date() }])
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "CONNECTION_ERROR. Please retry or email sandncolol@gmail.com.",
        timestamp: new Date(),
      }])
    } finally {
      setLoading(false)
    }
  }

  const submitTicket = async () => {
    if (!ticketCategory || !ticketSubject || !ticketDesc) return
    setSubmittingTicket(true)

    const res = await fetch('/api/support/tickets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category: ticketCategory, subject: ticketSubject, description: ticketDesc }),
    })
    const { success } = await res.json()
    if (success) setTicketSubmitted(true)
    setSubmittingTicket(false)
  }

  return (
    <div className="min-h-screen bg-black text-[var(--cyan)] font-mono">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <motion.div className="text-center mb-8" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex justify-center mb-4">
            <div className="relative w-12 h-12">
              <Image src="/logo.png" alt="Support" fill className="object-contain" />
            </div>
          </div>
          <div className="text-[9px] text-[var(--text-dim)] tracking-[0.3em] uppercase mb-2">
            // ASSISTANCE_PROTOCOL
          </div>
          <h1 className="text-3xl font-extrabold text-glow-cyan uppercase tracking-wider mb-2">
            SUPPORT_CENTER
          </h1>
          <p className="text-[10px] text-[var(--text-dim)] tracking-wider">
            CHAT_WITH_SUNO_AI OR OPEN_A_TICKET. EMAIL: <span className="text-[var(--cyan)]">SANDNCOLOL@GMAIL.COM</span>
          </p>
        </motion.div>

        {/* Mode toggle */}
        <div className="flex gap-2 justify-center mb-8">
          {[
            { id: 'chat', icon: MessageCircle, label: 'AI_CHAT' },
            { id: 'ticket', icon: Ticket, label: 'OPEN_TICKET' },
          ].map(({ id, icon: Icon, label }) => (
            <button key={id} onClick={() => setMode(id as 'chat' | 'ticket')}
              className={`flex items-center gap-2 px-6 py-2.5 text-[10px] tracking-[0.15em] border transition-all ${
                mode === id
                  ? 'text-[var(--cyan)] border-[var(--cyan)] bg-[var(--cyan-ghost)]'
                  : 'text-[var(--text-dim)] border-[var(--cyan-border)] hover:bg-[var(--cyan-ghost)]'
              }`}>
              <Icon className="w-3.5 h-3.5" />{label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {mode === 'chat' && (
            <motion.div key="chat" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="terminal">
                {/* Chat header */}
                <div className="terminal-header">
                  <div className="terminal-dots"><span /><span /><span /></div>
                  <div className="terminal-title flex items-center gap-2">
                    <Bot className="w-3 h-3" /> SUNO_ASSISTANT
                    <span className="w-1.5 h-1.5 bg-[var(--green)] animate-pulse" />
                    <span className="text-[7px] text-[var(--green)]">ONLINE</span>
                  </div>
                </div>

                {/* Messages */}
                <div className="h-96 overflow-y-auto p-4 space-y-3">
                  {messages.map((msg, i) => (
                    <motion.div
                      key={i}
                      className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    >
                      <div className={`w-7 h-7 border flex items-center justify-center flex-shrink-0 ${
                        msg.role === 'assistant'
                          ? 'border-[var(--cyan)] bg-[var(--cyan-ghost)]'
                          : 'border-[var(--cyan-border)] bg-transparent'
                      }`}>
                        {msg.role === 'assistant' ? <Bot className="w-3 h-3 text-[var(--cyan)]" /> : <User className="w-3 h-3 text-[var(--text-dim)]" />}
                      </div>
                      <div className={`max-w-[80%] ${msg.role === 'user' ? 'text-right' : ''}`}>
                        <div className={`px-4 py-2.5 text-[11px] leading-relaxed ${
                          msg.role === 'assistant'
                            ? 'border border-[var(--cyan-border)] bg-[var(--cyan-ghost)] text-[var(--text-dim)]'
                            : 'border border-[var(--cyan)] bg-[var(--cyan)]/5 text-[var(--cyan)]'
                        }`}>
                          {msg.content}
                        </div>
                        <p className="text-[8px] text-[var(--text-ghost)] mt-1 tracking-wider">{formatRelativeTime(msg.timestamp)}</p>
                      </div>
                    </motion.div>
                  ))}
                  {loading && (
                    <div className="flex gap-3">
                      <div className="w-7 h-7 border border-[var(--cyan)] bg-[var(--cyan-ghost)] flex items-center justify-center">
                        <Bot className="w-3 h-3 text-[var(--cyan)]" />
                      </div>
                      <div className="border border-[var(--cyan-border)] bg-[var(--cyan-ghost)] px-4 py-3">
                        <div className="flex gap-1">
                          {[0, 1, 2].map(i => (
                            <div key={i} className="w-1.5 h-1.5 bg-[var(--cyan)] animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="flex gap-2 p-3 border-t border-[var(--cyan-border)]">
                  <input
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                    placeholder="ASK_SUNO..."
                    className="input-terminal flex-1 text-[10px]"
                  />
                  <motion.button
                    onClick={sendMessage}
                    disabled={loading || !input.trim()}
                    className="btn-execute px-4 py-2 text-[10px]"
                    whileTap={{ scale: 0.95 }}
                  >
                    {loading ? <Loader className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  </motion.button>
                </div>

                <div className="terminal-footer">
                  <Shield className="w-3 h-3" />
                  AI_POWERED | INPUTS_NOT_STORED
                </div>
              </div>

              <p className="text-center text-[9px] text-[var(--text-ghost)] mt-4 tracking-wider">
                SUNO_CANNOT_RESOLVE_ALL_ISSUES. FOR_URGENT_MATTERS,{' '}
                <button onClick={() => setMode('ticket')} className="text-[var(--cyan)] hover:underline">OPEN_A_TICKET</button>.
              </p>
            </motion.div>
          )}

          {mode === 'ticket' && (
            <motion.div key="ticket" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {ticketSubmitted ? (
                <div className="terminal">
                  <div className="terminal-header">
                    <div className="terminal-dots"><span /><span /><span /></div>
                    <div className="terminal-title">
                      <Ticket className="w-3 h-3" /> TICKET_SUBMITTED
                    </div>
                  </div>
                  <div className="terminal-body text-center py-10">
                    <div className="text-4xl mb-4">✅</div>
                    <h3 className="text-xl font-extrabold text-glow-cyan uppercase tracking-wider mb-2">
                      TICKET_DEPLOYED
                    </h3>
                    <p className="text-[10px] text-[var(--text-dim)] tracking-wider">
                      RESPONSE_ETA: 24-48_HOURS AT <span className="text-[var(--cyan)]">SANDNCOLOL@GMAIL.COM</span>
                    </p>
                    <button onClick={() => setMode('chat')} className="btn-outline px-6 py-2 text-[10px] mt-6">
                      BACK_TO_CHAT
                    </button>
                  </div>
                </div>
              ) : (
                <div className="terminal">
                  <div className="terminal-header">
                    <div className="terminal-dots"><span /><span /><span /></div>
                    <div className="terminal-title">
                      <Ticket className="w-3 h-3" /> NEW_TICKET
                    </div>
                  </div>
                  <div className="terminal-body">
                    {/* Category */}
                    <div className="mb-5">
                      <label className="label-terminal">
                        <Terminal className="w-3 h-3" /> CATEGORY
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {TICKET_CATEGORIES.map(({ id, icon: Icon, label, description }) => (
                          <button key={id} onClick={() => setTicketCategory(id)}
                            className={`flex items-start gap-3 p-3 border text-left transition-all ${
                              ticketCategory === id
                                ? 'border-[var(--cyan)] bg-[var(--cyan-ghost)] text-white'
                                : 'border-[var(--cyan-border)] text-[var(--text-dim)] hover:bg-[var(--cyan-ghost)]'
                            }`}>
                            <Icon className={`w-3.5 h-3.5 mt-0.5 flex-shrink-0 ${ticketCategory === id ? 'text-[var(--cyan)]' : ''}`} />
                            <div>
                              <p className="text-[10px] font-bold tracking-wider">{label}</p>
                              <p className="text-[8px] text-[var(--text-ghost)] mt-0.5">{description}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {ticketCategory && (
                      <>
                        <div className="mb-4">
                          <label className="label-terminal">
                            <Terminal className="w-3 h-3" /> SUBJECT
                          </label>
                          <input type="text" value={ticketSubject} onChange={e => setTicketSubject(e.target.value)}
                            placeholder="BRIEF_DESCRIPTION_OF_ISSUE"
                            className="input-terminal w-full" />
                        </div>
                        <div className="mb-5">
                          <label className="label-terminal">
                            <Terminal className="w-3 h-3" /> DESCRIPTION
                          </label>
                          <textarea value={ticketDesc} onChange={e => setTicketDesc(e.target.value)}
                            placeholder="DETAILED_DESCRIPTION. INCLUDE_RELEVANT_IDS_OR_SCREENSHOTS."
                            rows={5} className="input-terminal w-full resize-none" />
                        </div>
                        <motion.button
                          onClick={submitTicket}
                          disabled={submittingTicket || !ticketSubject || !ticketDesc}
                          className="btn-execute w-full"
                          whileTap={{ scale: 0.98 }}
                        >
                          <span className="relative z-10 flex items-center justify-center gap-3">
                            {submittingTicket
                              ? <><Loader className="w-4 h-4 animate-spin" />SUBMITTING...</>
                              : <><Ticket className="w-4 h-4" />DEPLOY_TICKET</>}
                          </span>
                        </motion.button>
                      </>
                    )}
                  </div>
                  <div className="terminal-footer">
                    <Lock className="w-3 h-3" />
                    SUPPORT: SANDNCOLOL@GMAIL.COM
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
