import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value)
          })

          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })

          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    },
  )

  // IMPORTANT:
  // getUser() validates the session with Supabase Auth and may refresh
  // expired access tokens. Do not remove this call.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname

  let isAdmin = false

  if (user) {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .maybeSingle()

    isAdmin = profile?.is_admin === true

    if (process.env.NODE_ENV === 'development') {
      console.log('[PROXY]', {
        pathname,
        user: user.email,
        userId: user.id,
        isAdmin,
        profileError: error?.message ?? null,
      })
    }
  } else if (process.env.NODE_ENV === 'development') {
    console.log('[PROXY]', {
      pathname,
      user: null,
      isAdmin: false,
    })
  }

  function redirect(path: string) {
    const redirectResponse = NextResponse.redirect(
      new URL(path, request.url),
    )

    // Preserve any refreshed Supabase cookies.
    response.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie)
    })

    return redirectResponse
  }

  // An authenticated administrator should not see the login page.
  if (pathname === '/login') {
    if (isAdmin) {
      return redirect('/admin/dashboard')
    }

    return response
  }

  // Protect every admin route.
  if (pathname.startsWith('/admin')) {
    if (!user) {
      return redirect('/login')
    }

    if (!isAdmin) {
      return redirect('/')
    }
  }

  return response
}

export const config = {
  matcher: ['/admin/:path*', '/login'],
}
