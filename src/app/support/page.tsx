'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import {
  MessageCircle, Send, Loader, Bot, User, Plus,
  ChevronRight, Ticket, HelpCircle, Zap, CreditCard, Bug, Scale
} from 'lucide-react'
import { formatRelativeTime } from '@/lib/utils'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

const TICKET_CATEGORIES = [
  { id: 'payment', icon: CreditCard, label: 'Payment Issue', description: 'Problems with deposits or withdrawals' },
  { id: 'wallet', icon: Zap, label: 'Wallet Problem', description: 'Balance or transaction issues' },
  { id: 'membership', icon: Bot, label: 'Membership', description: 'Premium membership questions' },
  { id: 'bug', icon: Bug, label: 'Bug Report', description: 'Something broken? Tell us.' },
  { id: 'appeal', icon: Scale, label: 'Moderation Appeal', description: 'Contest a moderation decision' },
  { id: 'general', icon: HelpCircle, label: 'General Help', description: 'Anything else' },
]

export default function SupportPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hey! I'm Suno, your city guide. What do you need help with today? I can assist with account questions, wallet issues, challenges, or anything platform-related. If I can't help, I'll connect you with a human.",
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
        content: "I'm having trouble connecting. Please try again or email sandncolol@gmail.com.",
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
    <div className="min-h-screen bg-[#030303] grid-bg">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <motion.div className="text-center mb-10" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex justify-center mb-4">
            <div className="relative w-14 h-14">
              <Image src="/logo.png" alt="Support" fill className="object-contain crown-animate" />
            </div>
          </div>
          <h1 className="font-display text-4xl text-gradient-gold mb-2" style={{ fontFamily: "'Bebas Neue', cursive" }}>
            SUPPORT CENTER
          </h1>
          <p className="font-mono text-xs text-zinc-500">
            Chat with Suno our AI or open a ticket. Email us: <span className="text-yellow-400">sandncolol@gmail.com</span>
          </p>
        </motion.div>

        {/* Mode toggle */}
        <div className="flex gap-2 justify-center mb-8">
          {[
            { id: 'chat', icon: MessageCircle, label: 'AI Chat' },
            { id: 'ticket', icon: Ticket, label: 'Open Ticket' },
          ].map(({ id, icon: Icon, label }) => (
            <button key={id} onClick={() => setMode(id as 'chat' | 'ticket')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-tech transition-all ${
                mode === id ? 'bg-yellow-400 text-black font-bold' : 'glass text-zinc-400 hover:text-white'
              }`}>
              <Icon className="w-4 h-4" />{label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {mode === 'chat' && (
            <motion.div key="chat" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="glass-gold rounded-2xl overflow-hidden">
                {/* Chat header */}
                <div className="flex items-center gap-3 px-5 py-4 border-b border-white/5">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-orange-400 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-black" />
                  </div>
                  <div>
                    <p className="font-tech text-sm text-white font-bold">Suno</p>
                    <div className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                      <span className="font-mono text-xs text-zinc-500">Platform Assistant</span>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="h-96 overflow-y-auto p-5 space-y-4">
                  {messages.map((msg, i) => (
                    <motion.div
                      key={i}
                      className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    >
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                        msg.role === 'assistant'
                          ? 'bg-gradient-to-br from-yellow-400 to-orange-400'
                          : 'bg-white/10 border border-white/10'
                      }`}>
                        {msg.role === 'assistant' ? <Bot className="w-3.5 h-3.5 text-black" /> : <User className="w-3.5 h-3.5 text-zinc-300" />}
                      </div>
                      <div className={`max-w-[80%] ${msg.role === 'user' ? 'text-right' : ''}`}>
                        <div className={`rounded-2xl px-4 py-2.5 text-sm font-mono leading-relaxed ${
                          msg.role === 'assistant'
                            ? 'bg-white/5 text-zinc-200 rounded-tl-none'
                            : 'bg-yellow-400/10 border border-yellow-400/20 text-zinc-200 rounded-tr-none'
                        }`}>
                          {msg.content}
                        </div>
                        <p className="font-mono text-xs text-zinc-600 mt-1">{formatRelativeTime(msg.timestamp)}</p>
                      </div>
                    </motion.div>
                  ))}
                  {loading && (
                    <div className="flex gap-3">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-yellow-400 to-orange-400 flex items-center justify-center">
                        <Bot className="w-3.5 h-3.5 text-black" />
                      </div>
                      <div className="bg-white/5 rounded-2xl rounded-tl-none px-4 py-3">
                        <div className="flex gap-1">
                          {[0, 1, 2].map(i => (
                            <div key={i} className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="flex gap-3 p-4 border-t border-white/5">
                  <input
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                    placeholder="Ask Suno anything..."
                    className="input-cyber flex-1 rounded-xl px-4 py-2.5 text-sm"
                  />
                  <motion.button
                    onClick={sendMessage}
                    disabled={loading || !input.trim()}
                    className="btn-primary px-4 py-2.5 rounded-xl disabled:opacity-50"
                    whileTap={{ scale: 0.95 }}
                  >
                    {loading ? <Loader className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </motion.button>
                </div>
              </div>

              <p className="text-center font-mono text-xs text-zinc-600 mt-4">
                Suno can&apos;t resolve all issues. For urgent matters,{' '}
                <button onClick={() => setMode('ticket')} className="text-yellow-400 hover:underline">open a ticket</button>.
              </p>
            </motion.div>
          )}

          {mode === 'ticket' && (
            <motion.div key="ticket" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {ticketSubmitted ? (
                <div className="glass-gold rounded-2xl p-10 text-center">
                  <div className="text-5xl mb-4">✅</div>
                  <h3 className="font-display text-2xl text-gradient-gold mb-2" style={{ fontFamily: "'Bebas Neue', cursive" }}>
                    TICKET SUBMITTED
                  </h3>
                  <p className="font-mono text-sm text-zinc-400">
                    We&apos;ll respond within 24-48 hours at <span className="text-yellow-400">sandncolol@gmail.com</span>
                  </p>
                  <button onClick={() => setMode('chat')} className="btn-ghost px-6 py-2 rounded-xl text-xs mt-6 font-mono">
                    Back to chat
                  </button>
                </div>
              ) : (
                <div className="glass-gold rounded-2xl p-8">
                  <h3 className="font-tech text-sm text-yellow-400 tracking-widest uppercase mb-6">Open Support Ticket</h3>

                  {/* Category */}
                  <div className="mb-5">
                    <label className="font-tech text-xs text-zinc-400 tracking-wider uppercase block mb-3">Category</label>
                    <div className="grid grid-cols-2 gap-2">
                      {TICKET_CATEGORIES.map(({ id, icon: Icon, label, description }) => (
                        <button key={id} onClick={() => setTicketCategory(id)}
                          className={`flex items-start gap-3 p-3 rounded-xl border text-left transition-all ${
                            ticketCategory === id
                              ? 'border-yellow-400/40 bg-yellow-400/5 text-white'
                              : 'border-white/5 text-zinc-400 hover:border-white/10'
                          }`}>
                          <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${ticketCategory === id ? 'text-yellow-400' : ''}`} />
                          <div>
                            <p className="font-mono text-xs font-bold">{label}</p>
                            <p className="font-mono text-xs text-zinc-600 mt-0.5">{description}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {ticketCategory && (
                    <>
                      <div className="mb-4">
                        <label className="font-tech text-xs text-zinc-400 tracking-wider uppercase block mb-2">Subject</label>
                        <input type="text" value={ticketSubject} onChange={e => setTicketSubject(e.target.value)}
                          placeholder="Brief description of the issue"
                          className="input-cyber w-full rounded-xl px-4 py-3 text-sm" />
                      </div>
                      <div className="mb-5">
                        <label className="font-tech text-xs text-zinc-400 tracking-wider uppercase block mb-2">Description</label>
                        <textarea value={ticketDesc} onChange={e => setTicketDesc(e.target.value)}
                          placeholder="Detailed description of the problem. Include any relevant IDs or screenshots."
                          rows={5} className="input-cyber w-full rounded-xl px-4 py-3 text-sm resize-none" />
                      </div>
                      <motion.button
                        onClick={submitTicket}
                        disabled={submittingTicket || !ticketSubject || !ticketDesc}
                        className="btn-primary w-full py-3 rounded-xl text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                        whileTap={{ scale: 0.98 }}
                      >
                        {submittingTicket ? <><Loader className="w-4 h-4 animate-spin" />SUBMITTING...</> : <><Ticket className="w-4 h-4" />SUBMIT TICKET</>}
                      </motion.button>
                    </>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
