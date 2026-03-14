import { NextRequest, NextResponse } from 'next/server'
import { askSuno } from '@/lib/ai'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { messages } = await req.json()
  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: 'Invalid messages' }, { status: 400 })
  }

  // Limit conversation history to save tokens
  const trimmed = messages.slice(-6)
  const result = await askSuno(trimmed, 300)
  return NextResponse.json(result)
}
