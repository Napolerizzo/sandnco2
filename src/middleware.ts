import { createServerClient } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'

// Admin routes that require authentication + admin role
const ADMIN_ROUTES = ['/admin']
// Auth-required routes
const PROTECTED_ROUTES = ['/feed', '/rumors/new', '/challenges', '/wallet', '/profile', '/leaderboard']

// Routes that bypass beta check entirely
const BETA_BYPASS_ROUTES = ['/', '/login', '/signup', '/beta-wait', '/legal', '/api']

function isBetaBypassed(pathname: string): boolean {
  return BETA_BYPASS_ROUTES.some(route => {
    if (route === '/') return pathname === '/'
    return pathname === route || pathname.startsWith(route + '/')
  })
}

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

    // Allow hardcoded super admins through — layout will auto-provision the role
    const SUPER_ADMIN_EMAILS = ['admin@sameerjhamb.com', 'sameer.jhamb1719@gmail.com']
    if (!adminRole && !SUPER_ADMIN_EMAILS.includes(user.email || '')) {
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

  // Beta mode gate — check after auth redirects so login/signup flow works
  const betaMode = process.env.NEXT_PUBLIC_BETA_MODE
  if (betaMode === 'true' && user && !isBetaBypassed(pathname)) {
    // Check if user's email is in the beta_access table
    const { data: betaRow } = await supabase
      .from('beta_access')
      .select('id')
      .eq('email', user.email || '')
      .single()

    if (!betaRow) {
      return NextResponse.redirect(new URL('/beta-wait', request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
