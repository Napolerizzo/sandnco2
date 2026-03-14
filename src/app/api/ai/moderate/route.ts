import { NextRequest, NextResponse } from 'next/server'
import { getModerationSuggestion } from '@/lib/ai'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ safe: false, reason: 'Unauthorized' }, { status: 401 })

  const { content } = await req.json()
  if (!content) return NextResponse.json({ safe: true })

  const result = await getModerationSuggestion(content)
  return NextResponse.json(result)
}
