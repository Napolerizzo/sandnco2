/**
 * Database abstraction layer - routes to Supabase (primary) or Firebase (fallback)
 */
import { createClient } from './supabase/client'

let supabaseHealthy = true
let lastHealthCheck = 0
const HEALTH_CHECK_INTERVAL = 30000 // 30s

export async function checkSupabaseHealth(): Promise<boolean> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return false
  }

  const now = Date.now()
  if (now - lastHealthCheck < HEALTH_CHECK_INTERVAL) {
    return supabaseHealthy
  }
  lastHealthCheck = now
  try {
    const supabase = createClient()
    const { error } = await supabase.from('users').select('id').limit(1)
    supabaseHealthy = !error
  } catch {
    supabaseHealthy = false
  }
  return supabaseHealthy
}

export async function getDb() {
  const healthy = await checkSupabaseHealth()
  if (healthy) {
    return { provider: 'supabase' as const, client: createClient() }
  }
  // Firebase fallback
  const { firebaseDb } = await import('./firebase/client')
  return { provider: 'firebase' as const, client: firebaseDb }
}
