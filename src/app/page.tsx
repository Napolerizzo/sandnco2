import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import LandingPage from '@/components/LandingPage'

export const dynamic = 'force-dynamic'

export default async function RootPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) redirect('/feed')

  // Fetch top rumors for the landing page preview
  const { data: previewRumors } = await supabase
    .from('rumors')
    .select('id, title, category, heat_score, created_at, anonymous_alias')
    .order('heat_score', { ascending: false })
    .limit(4)

  return <LandingPage previewRumors={previewRumors || []} />
}
