import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient, createClient } from '@/lib/supabase/server'
import { verifyRumor } from '@/lib/ai'

async function verifyAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data: role } = await supabase.from('admin_roles').select('role').eq('user_id', user.id).single()
  if (!role || !['super_admin', 'platform_admin', 'moderator', 'myth_buster'].includes(role.role)) return null
  return user
}

/**
 * GET /api/admin/rumors
 * List rumors with filtering
 */
export async function GET(req: NextRequest) {
  const user = await verifyAdmin()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status') || 'pending'
  const limit = Math.min(Number(searchParams.get('limit')) || 50, 100)

  const admin = await createAdminClient()
  const { data: rumors } = await admin
    .from('rumors')
    .select('id, title, content, category, status, verdict, verdict_reason, heat_score, view_count, is_anonymous, anonymous_alias, city, created_at, author_id, users!rumors_author_id_fkey(username, display_name, email)')
    .eq('status', status)
    .order('created_at', { ascending: false })
    .limit(limit)

  return NextResponse.json({ rumors: rumors || [] })
}

/**
 * POST /api/admin/rumors
 * Actions: approve, reject, ai_verify, set_verdict
 */
export async function POST(req: NextRequest) {
  const user = await verifyAdmin()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

  const { rumorId, action, verdict, reason } = await req.json()
  if (!rumorId || !action) {
    return NextResponse.json({ error: 'rumorId and action required' }, { status: 400 })
  }

  const admin = await createAdminClient()

  if (action === 'approve') {
    await admin.from('rumors').update({ status: 'active' }).eq('id', rumorId)
    await admin.from('moderation_logs').insert({
      moderator_id: user.id,
      target_content_id: rumorId,
      target_content_type: 'rumor',
      action: 'approve',
      reason: reason || 'Approved via admin panel',
    })
    return NextResponse.json({ success: true })
  }

  if (action === 'reject') {
    await admin.from('rumors').update({ status: 'removed' }).eq('id', rumorId)
    await admin.from('moderation_logs').insert({
      moderator_id: user.id,
      target_content_id: rumorId,
      target_content_type: 'rumor',
      action: 'reject',
      reason: reason || 'Rejected via admin panel',
    })
    return NextResponse.json({ success: true })
  }

  if (action === 'ai_verify') {
    const { data: rumor } = await admin
      .from('rumors')
      .select('title, content, category')
      .eq('id', rumorId)
      .single()

    if (!rumor) return NextResponse.json({ error: 'Rumor not found' }, { status: 404 })

    const result = await verifyRumor(rumor)

    // Update rumor with AI verdict
    await admin.from('rumors').update({
      verdict: result.verdict,
      verdict_reason: `[AI] ${result.summary}\n\n${result.reasoning}\n\nConfidence: ${Math.round(result.confidence * 100)}%`,
      verdict_by: user.id,
      verdict_at: new Date().toISOString(),
      status: 'resolved',
    }).eq('id', rumorId)

    await admin.from('moderation_logs').insert({
      moderator_id: user.id,
      target_content_id: rumorId,
      target_content_type: 'rumor',
      action: 'ai_verify',
      reason: `AI verdict: ${result.verdict} (${Math.round(result.confidence * 100)}% confidence)`,
      metadata: result,
    })

    return NextResponse.json({ success: true, verdict: result })
  }

  if (action === 'set_verdict') {
    const validVerdicts = ['TRUE', 'MISLEADING', 'FALSE', 'PARTLY_TRUE', 'UNPROVEN']
    if (!verdict || !validVerdicts.includes(verdict)) {
      return NextResponse.json({ error: 'Valid verdict required' }, { status: 400 })
    }

    await admin.from('rumors').update({
      verdict,
      verdict_reason: reason || `Manual verdict by admin`,
      verdict_by: user.id,
      verdict_at: new Date().toISOString(),
      status: 'resolved',
    }).eq('id', rumorId)

    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}
