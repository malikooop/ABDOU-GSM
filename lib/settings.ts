import { cache } from 'react'
import { supabase } from '@/lib/supabase'

/**
 * Public, read-only access to the single `settings` row — the same row
 * the admin settings page (`app/admin/settings/page.tsx`) writes to.
 * Mirrors the pattern in `lib/api.ts`: never throws, falls back to safe
 * defaults on any error so a Supabase hiccup can't take the header/footer
 * down with it.
 */

export interface SiteSettings {
  siteName: string
  logoUrl: string | null
}

const DEFAULT_SETTINGS: SiteSettings = {
  siteName: 'ABDOU GSM',
  logoUrl: null,
}

/**
 * Wrapped in React `cache()` so every Server Component that needs the
 * logo/site name during the same request (header, footer) shares one
 * query instead of each firing its own.
 */
export const getSiteSettings = cache(async (): Promise<SiteSettings> => {
  try {
    const { data, error } = await supabase
      .from('settings')
      .select('site_name, logo_url')
      .eq('id', 1)
      .maybeSingle()

    if (error || !data) {
      if (error) console.error('[abdou-gsm] getSiteSettings error:', error)
      return DEFAULT_SETTINGS
    }

    return {
      siteName: data.site_name?.trim() || DEFAULT_SETTINGS.siteName,
      logoUrl: data.logo_url?.trim() || null,
    }
  } catch (error) {
    console.error('[abdou-gsm] getSiteSettings unexpected error:', error)
    return DEFAULT_SETTINGS
  }
})
