import { cache } from 'react'
import { supabase } from '@/lib/supabase'
import { translateFeature } from './translate'
import type { Phone, PhoneCategory, PhoneRatings } from './types'

/**
 * Centralized data-access layer for ABDOU GSM.
 *
 * All data access goes through this module so UI code never talks to
 * Supabase directly. The single source of truth is the `phones` table in
 * Supabase; there is no external webhook and no local fallback catalog.
 *
 * File layout: imports -> types -> query config -> helpers -> normalizers
 * -> filters -> ranking -> public API -> exports.
 *
 * Extensibility note: this file intentionally stays a pure read layer
 * (list/get/compare/advice). Future work such as an admin panel, CRUD,
 * image upload, or AI-driven advice should live in separate modules that
 * import from here rather than being bolted onto these functions, so the
 * public API below stays stable.
 */

const TABLE_NAME = 'phones'

/* ---------------------------------- Types ---------------------------------- */

export type SortOption = 'score_desc' | 'score_asc' | 'price_asc' | 'price_desc'

export interface PhoneQuery {
  brand?: string
  maxPrice?: number
  category?: PhoneCategory
  sort?: SortOption
  /** Free-text search across brand/model/top_feature (uses `ilike`). */
  search?: string
  minRam?: number
  minStorage?: number
  has5G?: boolean
}

/** Advice types used to rank a recommendation locally (no external AI). */
export type AdviceType =
  | 'best_camera'
  | 'best_battery'
  | 'best_gaming'
  | 'best_value'
  | 'best_student'
  | 'best_performance'
  | 'best_overall'

export interface AdviceResult {
  phone: Phone | null
  reason?: string
}

/**
 * Row shape as stored in the Supabase `phones` table, scoped to exactly the
 * columns fetched by `PHONE_COLUMNS`. Add new fields to both when the schema
 * grows.
 */
interface PhoneRow {
  id: number
  brand: string
  model: string
  price_new: number | null
  abdou_score: number | null
  category: string | null
  top_feature: string | null
  image_url: string | null
  screen_size: string | null
  display_tech: string | null
  processor: string | null
  ram: string | number | null
  storage: string | number | null
  battery_capacity: string | number | null
  main_camera: string | null
  os: string | null
  release_date: string | null
  strengths: string[] | string | null
  weaknesses: string[] | string | null
  score_performance: number | null
  score_camera: number | null
  score_display: number | null
  score_battery: number | null
  score_value: number | null
  has_5g: boolean | null
}

/* ----------------------------- Query configuration -------------------------- */

/**
 * Explicit column list for every `phones` query. Selecting only what the UI
 * needs (instead of `select('*')`) reduces payload size and keeps `PhoneRow`
 * accurate. Extend this alongside `PhoneRow` when the schema grows.
 */
const PHONE_COLUMNS = [
  'id',
  'brand',
  'model',
  'price_new',
  'abdou_score',
  'category',
  'top_feature',
  'image_url',
  'screen_size',
  'display_tech',
  'processor',
  'ram',
  'storage',
  'battery_capacity',
  'main_camera',
  'os',
  'release_date',
  'strengths',
  'weaknesses',
  'score_performance',
  'score_camera',
  'score_display',
  'score_battery',
  'score_value',
  'has_5g',
].join(', ')

const VALID_CATEGORIES: readonly PhoneCategory[] = [
  'Flagship',
  'Upper Mid-Range',
  'Mid-Range',
  'Budget',
]

/* ---------------------------------- Helpers --------------------------------- */

/** Type guard used instead of `as` casts when filtering out empty results. */
function isDefined<T>(value: T | undefined): value is T {
  return value !== undefined
}

/**
 * Type guard confirming a raw category string is one of the known
 * `PhoneCategory` values. Isolates the single unavoidable widening cast
 * needed to compare a `string` against a `readonly PhoneCategory[]`, so the
 * rest of the file never has to cast category values itself.
 */
function isPhoneCategory(value: string): value is PhoneCategory {
  return (VALID_CATEGORIES as readonly string[]).includes(value)
}

/**
 * Escapes characters that have special meaning in PostgREST `ilike`/`or`
 * filter strings (`%`, `_`, `,`, `(`, `)`, `\`) so user-supplied search text
 * can never break the filter syntax or act as an unintended wildcard.
 */
function escapeIlikeValue(value: string): string {
  return value.replace(/[\\%_,()]/g, (char) => `\\${char}`)
}

/**
 * Formats a spec value with its unit, but only if the value doesn't already
 * carry that unit. Guards against double-suffixed values (e.g. "12GBGB",
 * "5000mAhmAh") regardless of whether Supabase returns a raw number or an
 * already-formatted string. Handles null/undefined/string/number safely.
 */
function formatUnitValue(value?: string | number | null, unit = ''): string | undefined {
  if (value === undefined || value === null || value === '') return undefined
  const str = String(value).trim()
  if (!str) return undefined
  if (!unit) return str
  const alreadyHasUnit = new RegExp(`${unit}$`, 'i').test(str)
  return alreadyHasUnit ? str : `${str}${unit}`
}

/**
 * Extracts the leading numeric value from a spec string, supporting integers
 * and decimals with or without a space before the unit (e.g. "12GB" -> 12,
 * "256 GB" -> 256, "5000mAh" -> 5000, "200MP" -> 200, "0.5TB" -> 512). A
 * trailing "TB" unit is automatically converted to its GB equivalent (×1024)
 * so storage comparisons stay consistent regardless of the source unit.
 * Safe on null/undefined/non-numeric input (returns 0).
 */
function extractLeadingNumber(raw?: string | null): number {
  if (!raw) return 0
  const match = raw.match(/(\d+(?:\.\d+)?)/)
  if (!match) return 0
  const value = Number(match[1])
  return /tb/i.test(raw) ? value * 1024 : value
}

/* -------------------------------- Normalizers -------------------------------- */

function normalizeCategory(value?: string | null): PhoneCategory {
  return value && isPhoneCategory(value) ? value : 'Mid-Range'
}

/**
 * Combines screen_size and display_tech into a single display string.
 * Uses whichever part is present, joins both with a single space when both
 * exist, and returns undefined when neither is set (never an empty string
 * or a stray leading/trailing space).
 */
function normalizeDisplay(
  screenSize?: string | null,
  displayTech?: string | null,
): string | undefined {
  const parts = [screenSize, displayTech].filter(
    (part): part is string => Boolean(part && part.trim()),
  )
  return parts.length > 0 ? parts.join(' ') : undefined
}

/** Builds the ratings block from the flat score_* columns. Returns undefined if none are set. */
function normalizeRatings(row: PhoneRow): PhoneRatings | undefined {
  const ratings: PhoneRatings = {
    performance: row.score_performance ?? undefined,
    camera: row.score_camera ?? undefined,
    display: row.score_display ?? undefined,
    battery: row.score_battery ?? undefined,
    value: row.score_value ?? undefined,
  }
  const hasAny = Object.values(ratings).some((v) => typeof v === 'number')
  return hasAny ? ratings : undefined
}

/**
 * Normalizes a strengths/weaknesses field that may arrive as a semicolon-
 * separated string, an array, or be missing entirely. Trims whitespace and
 * drops empty entries; returns undefined (never an empty array) when there
 * is nothing meaningful to show.
 */
function splitListField(value?: string[] | string | null): string[] | undefined {
  if (!value) return undefined
  const list = Array.isArray(value) ? value : value.split(';')
  const cleaned = list.map((v) => v.trim()).filter(Boolean)
  return cleaned.length > 0 ? cleaned : undefined
}

/** Convert a Supabase `phones` row into the internal, Arabic-localized Phone shape. */
function normalizePhone(row: PhoneRow): Phone {
  const releaseYear = row.release_date
    ? Number(String(row.release_date).slice(0, 4)) || undefined
    : undefined

  return {
    id: row.id,
    brand: row.brand ?? 'غير معروف',
    model: row.model ?? '',
    price: row.price_new ?? 0,
    score: row.abdou_score ?? 0,
    category: normalizeCategory(row.category),
    // Localize the English marketing feature into natural Arabic (UI only).
    highlight: translateFeature(row.top_feature ?? undefined),
    image: row.image_url ?? null,
    specs: {
      display: normalizeDisplay(row.screen_size, row.display_tech),
      chipset: row.processor ?? undefined,
      ram: formatUnitValue(row.ram, 'GB'),
      storage: formatUnitValue(row.storage, 'GB'),
      battery: formatUnitValue(row.battery_capacity, 'mAh'),
      mainCamera: row.main_camera ?? undefined,
      os: row.os ?? undefined,
      releaseYear,
    },
    strengths: splitListField(row.strengths),
    weaknesses: splitListField(row.weaknesses),
    ratings: normalizeRatings(row),
  }
}

/* ---------------------------------- Filters ---------------------------------- */

/**
 * Filters that can't be expressed cleanly against free-form text columns
 * (ram/storage are stored as strings like "8GB") are applied client-side
 * after the Supabase query, on the already-normalized results.
 */
function applyLocalFilters(phones: Phone[], query: PhoneQuery = {}): Phone[] {
  let result = phones

  if (typeof query.minRam === 'number') {
    result = result.filter((p) => extractLeadingNumber(p.specs?.ram) >= query.minRam!)
  }

  if (typeof query.minStorage === 'number') {
    // TB-to-GB normalization is handled inside extractLeadingNumber, so
    // storage comparisons are correct regardless of the stored unit.
    result = result.filter((p) => extractLeadingNumber(p.specs?.storage) >= query.minStorage!)
  }

  return result
}

/* ---------------------------------- Ranking ----------------------------------- */

/**
 * Type-aware local ranking used to produce a recommendation without any
 * external AI. Each branch keeps its original primary/secondary criteria and
 * ends with an `id` tie-break so the result order is fully deterministic
 * even when every other metric is equal.
 */
function rankForAdvice(phones: Phone[], type: AdviceType): Phone[] {
  const scored = [...phones]
  switch (type) {
    case 'best_battery':
      return scored.sort(
        (a, b) =>
          extractLeadingNumber(b.specs?.battery) - extractLeadingNumber(a.specs?.battery) ||
          b.score - a.score ||
          a.id - b.id,
      )
    case 'best_camera':
      return scored.sort(
        (a, b) =>
          extractLeadingNumber(b.specs?.mainCamera) -
            extractLeadingNumber(a.specs?.mainCamera) ||
          b.score - a.score ||
          a.id - b.id,
      )
    case 'best_gaming':
    case 'best_performance':
      return scored.sort(
        (a, b) =>
          extractLeadingNumber(b.specs?.ram) - extractLeadingNumber(a.specs?.ram) ||
          b.score - a.score ||
          a.id - b.id,
      )
    case 'best_student':
    case 'best_value':
      return scored.sort(
        (a, b) =>
          b.score / Math.max(a.price, 1) - a.score / Math.max(b.price, 1) || a.id - b.id,
      )
    case 'best_overall':
    default:
      return scored.sort((a, b) => b.score - a.score || a.id - b.id)
  }
}

/* -------------------------------- Public API ---------------------------------- */

/**
 * Maps a UI "usage" selection (as picked in the ABDOU AI widget) to the
 * correct local advice type. This is the single source of truth for that
 * mapping so every caller stays consistent:
 *   battery             -> best_battery
 *   gaming              -> best_gaming
 *   camera/photography  -> best_camera
 *   student/study       -> best_student
 *   value/daily         -> best_value
 */
export function mapUsageToAdviceType(usage: string): AdviceType {
  const key = usage.trim().toLowerCase()
  switch (key) {
    case 'battery':
      return 'best_battery'
    case 'gaming':
      return 'best_gaming'
    case 'camera':
    case 'photography':
      return 'best_camera'
    case 'student':
    case 'study':
      return 'best_student'
    case 'value':
    case 'daily':
      return 'best_value'
    case 'performance':
      return 'best_performance'
    default:
      return 'best_value'
  }
}

/**
 * Fetch phones from Supabase, optionally filtered/sorted. Never throws —
 * any Supabase error or unexpected failure resolves to `[]`.
 *
 * Wrapped in React `cache()` so repeated calls that share the exact same
 * query object reference within a single request/render pass are deduped
 * instead of re-querying. Calls built from a fresh object literal each time
 * (the common case) still hit Supabase on every call, which is correct
 * behavior — just not deduped, since `cache()` keys on argument identity.
 */
export const getPhones = cache(async (query: PhoneQuery = {}): Promise<Phone[]> => {
  try {
    let builder = supabase.from(TABLE_NAME).select(PHONE_COLUMNS)

    if (query.brand) {
      builder = builder.ilike('brand', escapeIlikeValue(query.brand))
    }
    if (query.category) {
      builder = builder.eq('category', query.category)
    }
    if (typeof query.maxPrice === 'number') {
      builder = builder.lte('price_new', query.maxPrice)
    }
    if (typeof query.has5G === 'boolean') {
      builder = builder.eq('has_5g', query.has5G)
    }
    if (query.search) {
      const q = escapeIlikeValue(query.search.trim())
      if (q) {
        builder = builder.or(
`brand.ilike.*${q}*,model.ilike.*${q}*,top_feature.ilike.*${q}*`
)
      }
    }

    // Every branch ends with a final `id` tie-break so the result order is
    // fully deterministic and never appears to shuffle between requests.
    switch (query.sort) {
      case 'score_asc':
        builder = builder
          .order('abdou_score', { ascending: true, nullsFirst: false })
          .order('price_new', { ascending: true })
          .order('id', { ascending: true })
        break
      case 'price_asc':
        builder = builder
          .order('price_new', { ascending: true })
          .order('abdou_score', { ascending: false, nullsFirst: false })
          .order('id', { ascending: true })
        break
      case 'price_desc':
        builder = builder
          .order('price_new', { ascending: false })
          .order('abdou_score', { ascending: false, nullsFirst: false })
          .order('id', { ascending: true })
        break
      case 'score_desc':
      default:
        builder = builder
          .order('abdou_score', { ascending: false, nullsFirst: false })
          .order('price_new', { ascending: true })
          .order('id', { ascending: true })
        break
    }

    const { data, error } = await builder.returns<PhoneRow[]>()

    if (error) {
      console.error('[abdou-gsm] getPhones error:', error)
      return []
    }

    const phones = (data ?? []).map(normalizePhone)
    return applyLocalFilters(phones, query)
  } catch (error) {
    console.error('[abdou-gsm] getPhones unexpected error:', error)
    return []
  }
})

/**
 * Fetch a single phone by id. Never throws — resolves to `null` if not
 * found or on any error.
 *
 * Wrapped in React `cache()`; since `id` is a primitive, repeated lookups
 * of the same id during a single request/render pass are reliably deduped.
 */
export const getPhone = cache(async (id: number): Promise<Phone | null> => {
  try {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select(PHONE_COLUMNS)
      .eq('id', id)
      .limit(1)
      .maybeSingle()
      .returns<PhoneRow>()

    if (error) {
      console.error('[abdou-gsm] getPhone error:', error)
      return null
    }
    if (!data) return null

    return normalizePhone(data)
  } catch (error) {
    console.error('[abdou-gsm] getPhone unexpected error:', error)
    return null
  }
})

/** @deprecated use {@link getPhone} — kept as an alias for compatibility. */
export const getPhoneById = getPhone

/**
 * Compare multiple phones by their ids. Never throws — resolves to `[]` on
 * error. Ids that don't exist in the database are silently skipped rather
 * than causing a failure.
 */
export async function comparePhones(ids: number[]): Promise<Phone[]> {
  if (ids.length === 0) return []

  try {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select(PHONE_COLUMNS)
      .in('id', ids)
      .returns<PhoneRow[]>()

    if (error) {
      console.error('[abdou-gsm] comparePhones error:', error)
      return []
    }

    const phones = (data ?? []).map(normalizePhone)
    const byId = new Map(phones.map((p) => [p.id, p]))
    // Preserve the order the caller asked for; drop any id that wasn't found.
    return ids.map((id) => byId.get(id)).filter(isDefined)
  } catch (error) {
    console.error('[abdou-gsm] comparePhones unexpected error:', error)
    return []
  }
}

/**
 * Recommend a phone by advice type and budget, ranked locally (no external
 * AI). Never throws — resolves to `{ phone: null }` on error.
 */
export async function getAdvice(type: AdviceType, budget: number): Promise<AdviceResult> {
  try {
    const eligible = await getPhones({ maxPrice: budget })
    const best = rankForAdvice(eligible, type)[0] ?? null
    return { phone: best, reason: undefined }
  } catch (error) {
    console.error('[abdou-gsm] getAdvice unexpected error:', error)
    return { phone: null, reason: undefined }
  }
}