import { createServerClient } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'

// Admin routes that require authentication + admin role
const ADMIN_ROUTES = ['/admin']
// Auth-required routes
const PROTECTED_ROUTES = ['/feed', '/rumors/new', '/challenges', '/wallet', '/profile', '/leaderboard']

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    // Can't authenticate without Supabase — pass through
    return supabaseResponse
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const pathname = request.nextUrl.pathname

  // Admin route protection
  if (ADMIN_ROUTES.some(route => pathname.startsWith(route))) {
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      url.searchParams.set('next', pathname)
      return NextResponse.redirect(url)
    }

    // Check admin role in DB
    const { data: adminRole } = await supabase
      .from('admin_roles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (!adminRole) {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  // Protected routes
  if (PROTECTED_ROUTES.some(route => pathname.startsWith(route))) {
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      url.searchParams.set('next', pathname)
      return NextResponse.redirect(url)
    }
  }

  // Already logged in trying to access auth pages
  if (user && (pathname === '/login' || pathname === '/signup')) {
    return NextResponse.redirect(new URL('/feed', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
