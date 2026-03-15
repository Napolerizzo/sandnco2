import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[supabase/client] Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY')
    }
    // Return a client with placeholder values — will fail gracefully on actual requests
    return createBrowserClient('https://placeholder.supabase.co', 'placeholder-key')
  }

  return createBrowserClient(url, key)
}
