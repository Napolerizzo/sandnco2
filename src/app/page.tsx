import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import LandingPage from '@/components/LandingPage'

export const dynamic = 'force-dynamic'

export default async function RootPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) redirect('/feed')

  // Fetch preview data — real numbers only, no fake metrics
  const [{ data: previewRumors }, { count: userCount }, { count: rumorCount }] = await Promise.all([
    supabase
      .from('rumors')
      .select('id, title, category, heat_score, created_at, anonymous_alias')
      .eq('status', 'active')
      .order('heat_score', { ascending: false })
      .limit(3),
    supabase.from('users').select('*', { count: 'exact', head: true }),
    supabase.from('rumors').select('*', { count: 'exact', head: true }),
  ])

  return <LandingPage
    previewRumors={previewRumors || []}
    userCount={userCount || 0}
    rumorCount={rumorCount || 0}
  />
}
