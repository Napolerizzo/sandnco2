import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { askSuno } from '@/lib/ai'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { category, subject, description, email } = await req.json()

  if (!category || !subject || !description) {
    return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 })
  }

  const admin = await createAdminClient()

  // Try AI resolution first
  const aiMessages = [{ role: 'user' as const, content: `Support ticket - ${category}: ${subject}\n\n${description}` }]
  const { content: aiResponse } = await askSuno(aiMessages, 250)

  const { data: ticket } = await admin.from('support_tickets').insert({
    user_id: user?.id || null,
    email: email || user?.email,
    category,
    subject,
    description,
    status: 'ai_handled',
    ai_response: aiResponse,
    ai_handled_at: new Date().toISOString(),
    priority: category === 'payment' ? 'high' : 'normal',
  }).select('id').single()

  // Create first AI message
  if (ticket) {
    await admin.from('support_messages').insert({
      ticket_id: ticket.id,
      is_ai: true,
      content: aiResponse,
    })
  }

  // Notify user
  if (user?.id) {
    await admin.from('notifications').insert({
      user_id: user.id,
      type: 'support_reply',
      title: '🎫 Support Ticket Created',
      body: `Ticket #${ticket?.id.slice(0, 8)} created for: ${subject}`,
    })
  }

  return NextResponse.json({ success: true, ticketId: ticket?.id, aiResponse })
}

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data } = await supabase
    .from('support_tickets')
    .select('*, support_messages(*)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return NextResponse.json(data || [])
}
