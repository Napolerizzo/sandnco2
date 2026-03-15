import { NextRequest, NextResponse } from 'next/server'
import { askSuno } from '@/lib/ai'

// Support chat is open to all visitors — no auth required
// (rate limiting via edge config or Supabase can be added later)
export async function POST(req: NextRequest) {
  let messages: Array<{ role: string; content: string }>

  try {
    const body = await req.json()
    messages = body.messages
  } catch {
    return NextResponse.json({ content: "Invalid request." }, { status: 400 })
  }

  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ content: "Please send a message." }, { status: 400 })
  }

  // Only keep role/content, sanitize roles, limit history to last 6
  const trimmed = messages.slice(-6).map(m => ({
    role: m.role === 'assistant' ? 'assistant' as const : 'user' as const,
    content: String(m.content || '').slice(0, 800),
  }))

  const result = await askSuno(trimmed, 300)
  return NextResponse.json({ content: result.content })
}
