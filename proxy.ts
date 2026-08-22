import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'

/**
 * Server-side gate for /admin (Next.js Proxy — the renamed-from-Middleware
 * convention as of Next.js 16).
 *
 * This is the FIRST line of defense: it rejects unauthenticated and
 * non-admin requests before the Next.js app ever renders an admin page or
 * ships its client bundle. It is not the ONLY line of defense — every
 * admin page is a Client Component that talks to Supabase directly with
 * the anon key, so the real, unconditional boundary is Postgres RLS (see
 * supabase/migrations/0001_admin_authorization_and_rls.sql). This proxy
 * exists to stop unauthorized users from ever reaching the admin UI at
 * all, not to replace RLS.
 */
export async function proxy(request: NextRequest) {
  const response = NextResponse.next()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          response.cookies.set({ name, value: '', ...options, maxAge: 0 })
        },
      },
    },
  )

  // getUser() (not getSession()) — validates the token against Supabase's
  // auth server instead of trusting the cookie as-is. This is Supabase's
  // own recommendation for any server-side code that makes an
  // authorization decision (proxy, Server Components).
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Authentication alone is never enough — a normal signed-in user must
  // not reach /admin. `profiles.is_admin` is readable by the user for
  // their own row only (see migration), so this query can't be used to
  // probe other accounts.
  let isAdmin = false
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .maybeSingle()
    isAdmin = profile?.is_admin === true
  }

  const pathname = request.nextUrl.pathname

  if (pathname === '/login') {
    // Only send a confirmed admin away from the login page — a signed-in
    // non-admin user still needs to see it (e.g. to sign out and try a
    // different account), not get silently bounced into a dashboard they
    // can't use.
    if (isAdmin) {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url))
    }
    return response
  }

  if (pathname.startsWith('/admin')) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    if (!isAdmin) {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return response
}

export const config = {
  // "/login" is matched too, otherwise the "already-admin → redirect away
  // from /login" branch above is unreachable dead code.
  matcher: ['/admin/:path*', '/login'],
}
