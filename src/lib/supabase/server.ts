import { createServerClient } from '@supabase/ssr'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

// Build-time mock when env vars are missing
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function createMockClient(): any {
  const noopQuery = {
    select: () => noopQuery,
    insert: () => Promise.resolve({ data: null, error: null }),
    update: () => noopQuery,
    upsert: () => Promise.resolve({ data: null, error: null }),
    delete: () => noopQuery,
    eq: () => noopQuery,
    neq: () => noopQuery,
    in: () => noopQuery,
    order: () => noopQuery,
    limit: () => noopQuery,
    single: () => Promise.resolve({ data: null, error: null }),
    then: (resolve: (v: { data: null; error: null }) => void) => resolve({ data: null, error: null }),
  }
  return {
    auth: {
      getUser: async () => ({ data: { user: null }, error: null }),
      signOut: async () => ({}),
    },
    from: () => noopQuery,
    rpc: async () => ({ data: null, error: null }),
  }
}

export async function createClient() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    if (process.env.NODE_ENV === 'production' && process.env.NEXT_PHASE !== 'phase-production-build') {
      console.error('[supabase/server] Missing required Supabase environment variables')
    }
    return createMockClient()
  }

  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
          } catch {}
        },
      },
    }
  )
}

export async function createAdminClient() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    if (process.env.NODE_ENV === 'production' && process.env.NEXT_PHASE !== 'phase-production-build') {
      console.error('[supabase/server] Missing required Supabase admin environment variables')
    }
    return createMockClient()
  }

  // Use the plain supabase-js client with the service role key — NOT the SSR
  // cookie-based client.  createServerClient from @supabase/ssr mixes the
  // service role key with user session cookies, which can cause RLS to still
  // apply and block queries (e.g. "Profile not found" on payment).
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}
