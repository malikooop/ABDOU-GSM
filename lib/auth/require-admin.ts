import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import type { User } from '@supabase/supabase-js'

/**
 * Centralized server-side authorization for admin-only work.
 *
 * `proxy.ts` already blocks unauthorized requests to `/admin/*`
 * before they render, but a routing-level gate is not a substitute for
 * checking authorization again at the point where a sensitive action
 * actually happens — this is the primitive for that.
 * Today no Server Action or Route Handler exists yet (every admin
 * mutation still goes through Supabase RLS directly from the client), but
 * if one is added later it MUST call one of these instead of
 * re-implementing an auth check inline, so there is exactly one place
 * that defines "is this user an admin."
 *
 * Both functions independently re-verify the user against Supabase's auth
 * server (`getUser()`, never `getSession()`) and re-check `is_admin` from
 * `profiles` — they never trust a client-supplied flag, header, or cached
 * value.
 */

export interface AdminContext {
  user: User
}

/** Returns the authenticated user, or `null` if there isn't one. Never throws. */
export async function getAuthUser(): Promise<User | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

/**
 * Returns `{ user }` only if the current request belongs to a signed-in
 * admin (per `profiles.is_admin`). Returns `null` for anyone else —
 * unauthenticated, authenticated-but-not-admin, or on any Supabase error
 * (fails closed).
 */
export async function getAdminContext(): Promise<AdminContext | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .maybeSingle()

  if (error || !profile?.is_admin) return null

  return { user }
}

/**
 * Use at the top of a Server Action or Route Handler that performs an
 * admin-only mutation. Redirects (never just hides UI) if the caller
 * isn't an authorized admin, and returns the admin context otherwise.
 */
export async function requireAdmin(): Promise<AdminContext> {
  const context = await getAdminContext()
  if (!context) {
    redirect('/login')
  }
  return context
}
