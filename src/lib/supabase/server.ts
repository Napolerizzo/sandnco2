import { createServerClient } from '@supabase/ssr'
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
    return createMockClient()
  }

  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
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
