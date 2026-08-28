'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { AlertTriangle, Loader2, SearchX, X } from 'lucide-react'
import { PhoneCard } from '@/components/phone-card'
import { NumericField } from '@/components/numeric-field'
import { CATEGORIES } from '@/lib/data'
import { getPhones, type PhoneQuery, type SortOption } from '@/lib/api'
import { useLanguage } from '@/lib/i18n/language-provider'
import { cn } from '@/lib/utils'
import type { Phone, PhoneCategory } from '@/lib/types'

// Rounded, bordered control instead of a bare underline — matches the
// "rounded controls" requirement and reads consistently across browsers,
// unlike native <select>/<input> default chrome.
const fieldClass =
  'w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-primary focus:ring-2 focus:ring-primary/20'

const labelClass = 'mb-1.5 block text-xs font-medium text-muted-foreground'

export function PhonesCatalogClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { dict } = useLanguage()

  const SORT_OPTIONS: { value: SortOption; label: string }[] = [
    { value: 'score_desc', label: dict.phonesPage.sortOptions.scoreDesc },
    { value: 'score_asc', label: dict.phonesPage.sortOptions.scoreAsc },
    { value: 'price_asc', label: dict.phonesPage.sortOptions.priceAsc },
    { value: 'price_desc', label: dict.phonesPage.sortOptions.priceDesc },
  ]

  const [brand, setBrand] = useState(searchParams.get('brand') ?? '')
  const [maxPrice, setMaxPrice] = useState(searchParams.get('max_price') ?? '')
  const [category, setCategory] = useState<PhoneCategory | ''>(
    (searchParams.get('category') as PhoneCategory | null) ?? '',
  )
  const [sort, setSort] = useState<SortOption>(
    (searchParams.get('sort') as SortOption | null) ?? 'score_desc',
  )
  const [search, setSearch] = useState(searchParams.get('q') ?? '')
  const [minRam, setMinRam] = useState(searchParams.get('min_ram') ?? '')
  const [minStorage, setMinStorage] = useState(searchParams.get('min_storage') ?? '')
  const [has5G, setHas5G] = useState(searchParams.get('has_5g') === 'true')

  const [debouncedSearch, setDebouncedSearch] = useState(search)
  const [brandOptions, setBrandOptions] = useState<string[]>([])
  const [phones, setPhones] = useState<Phone[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setBrand(searchParams.get('brand') ?? '')
    setMaxPrice(searchParams.get('max_price') ?? '')
    setCategory((searchParams.get('category') as PhoneCategory | null) ?? '')
    setSort((searchParams.get('sort') as SortOption | null) ?? 'score_desc')
    setSearch(searchParams.get('q') ?? '')
    setDebouncedSearch(searchParams.get('q') ?? '')
    setMinRam(searchParams.get('min_ram') ?? '')
    setMinStorage(searchParams.get('min_storage') ?? '')
    setHas5G(searchParams.get('has_5g') === 'true')
  }, [searchParams])

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(timer)
  }, [search])

  useEffect(() => {
    let cancelled = false
    getPhones({})
      .then((all) => {
        if (cancelled) return
        setBrandOptions(Array.from(new Set(all.map((p) => p.brand))).sort())
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    const query: PhoneQuery = {
      brand: brand || undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      category: (category || undefined) as PhoneCategory | undefined,
      sort,
      search: debouncedSearch || undefined,
      minRam: minRam ? Number(minRam) : undefined,
      minStorage: minStorage ? Number(minStorage) : undefined,
      has5G: has5G || undefined,
    }

    const params = new URLSearchParams()
    if (query.brand) params.set('brand', query.brand)
    if (query.maxPrice) params.set('max_price', String(query.maxPrice))
    if (query.category) params.set('category', query.category)
    if (query.sort) params.set('sort', query.sort)
    if (query.search) params.set('q', query.search)
    if (query.minRam) params.set('min_ram', String(query.minRam))
    if (query.minStorage) params.set('min_storage', String(query.minStorage))
    if (query.has5G) params.set('has_5g', 'true')
    router.replace(`/phones${params.toString() ? `?${params.toString()}` : ''}`, { scroll: false })

    let cancelled = false
    setLoading(true)
    setError(null)
    getPhones(query)
      .then((result) => {
        if (cancelled) return
        setPhones(result)
      })
      .catch((err) => {
        if (cancelled) return
        console.error('Phones catalog fetch failed:', err)
        setError(dict.phonesPage.errorLoading)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [brand, maxPrice, category, sort, debouncedSearch, minRam, minStorage, has5G])

  function resetFilters() {
    setBrand('')
    setMaxPrice('')
    setCategory('')
    setSort('score_desc')
    setSearch('')
    setMinRam('')
    setMinStorage('')
    setHas5G(false)
  }

  const activeFilterCount =
    [brand, maxPrice, category, search, minRam, minStorage].filter(Boolean).length +
    (has5G ? 1 : 0)

  return (
    <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-8">
      <aside className="lg:sticky lg:top-24 lg:w-[260px] lg:shrink-0">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-elevation-sm">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="font-display text-sm font-semibold text-foreground">
              {dict.phonesPage.filtersTitle}
            </h2>
            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={resetFilters}
                className="text-xs font-medium text-primary hover:underline"
              >
                {dict.phonesPage.clearAll}
              </button>
            )}
          </div>

          <div className="space-y-6">
            <div>
              <label className={labelClass} htmlFor="filter-search">
                {dict.phonesPage.searchLabel}
              </label>
              <input
                id="filter-search"
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={dict.phonesPage.searchPlaceholder}
                className={fieldClass}
              />
            </div>

            <div>
              <span className={labelClass}>{dict.phonesPage.categoryLabel}</span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setCategory('')}
                  className={cn(
                    'rounded-full px-3 py-1.5 text-xs font-medium transition-colors duration-200',
                    category === ''
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:text-foreground',
                  )}
                >
                  {dict.phonesPage.allCategories}
                </button>
                {CATEGORIES.map((c) => (
                  <button
                    key={c.key}
                    type="button"
                    onClick={() => setCategory(c.key)}
                    className={cn(
                      'rounded-full px-3 py-1.5 text-xs font-medium transition-colors duration-200',
                      category === c.key
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:text-foreground',
                    )}
                  >
                    {dict.categories[c.key]}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className={labelClass} htmlFor="filter-brand">
                {dict.phonesPage.brandLabel}
              </label>
              <select id="filter-brand" value={brand} onChange={(e) => setBrand(e.target.value)} className={fieldClass}>
                <option value="">{dict.phonesPage.allBrands}</option>
                {brandOptions.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass} htmlFor="filter-max-price">
                {dict.phonesPage.maxPriceLabel}
              </label>
              <NumericField
                id="filter-max-price"
                min={0}
                step={5000}
                value={maxPrice}
                onChange={setMaxPrice}
                placeholder={dict.phonesPage.maxPricePlaceholder}
                className={fieldClass}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass} htmlFor="filter-min-ram">{dict.phonesPage.minRamLabel}</label>
                <NumericField id="filter-min-ram" min={0} step={1} value={minRam} onChange={setMinRam} placeholder="8" className={fieldClass} />
              </div>
              <div>
                <label className={labelClass} htmlFor="filter-min-storage">{dict.phonesPage.minStorageLabel}</label>
                <NumericField id="filter-min-storage" min={0} step={32} value={minStorage} onChange={setMinStorage} placeholder="128" className={fieldClass} />
              </div>
            </div>

            <label className="flex cursor-pointer items-center gap-2 text-sm text-foreground">
              <input type="checkbox" checked={has5G} onChange={(e) => setHas5G(e.target.checked)} className="size-4 rounded border-input accent-primary" />
              {dict.phonesPage.has5gOnly}
            </label>

            <div>
              <label className={labelClass} htmlFor="filter-sort">{dict.phonesPage.sortLabel}</label>
              <select id="filter-sort" value={sort} onChange={(e) => setSort(e.target.value as SortOption)} className={fieldClass}>
                {SORT_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm text-muted-foreground" aria-live="polite">
            {loading ? dict.phonesPage.loadingResults : `${phones.length} ${dict.phonesPage.resultsLabel}`}
          </p>
          {activeFilterCount > 0 && (
            <button type="button" onClick={resetFilters} className="inline-flex items-center gap-1 text-xs font-medium text-primary lg:hidden">
              <X className="size-3.5" aria-hidden="true" />
              {dict.phonesPage.clearAll}
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <Loader2 className="size-6 animate-spin text-primary" aria-hidden="true" />
            <p className="text-sm text-muted-foreground">{dict.phonesPage.loadingCatalog}</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <AlertTriangle className="size-6 text-destructive" aria-hidden="true" />
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
        ) : phones.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <SearchX className="size-6 text-muted-foreground" aria-hidden="true" />
            <p className="text-sm text-muted-foreground">{dict.phonesPage.emptyResults}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3">
            {phones.map((phone, i) => (
              <motion.div
                key={phone.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: Math.min(i * 0.03, 0.3) }}
              >
                <PhoneCard phone={phone} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}