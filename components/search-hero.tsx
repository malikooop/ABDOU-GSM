'use client'

import { useState } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import { Search, SearchX, Star } from 'lucide-react'
import { PhoneImage } from '@/components/phone-image'
import { formatDZD } from '@/lib/format'
import { useLanguage } from '@/lib/i18n/language-provider'
import type { Phone } from '@/lib/types'

const QUICK_FILTERS = ['Samsung', 'iPhone', 'Xiaomi', 'Honor', 'Google Pixel']

export function SearchHero({ phones }: { phones: Phone[] }) {
  const { dict } = useLanguage()
  const [value, setValue] = useState('')
  const query = value.trim().toLowerCase()

  const results =
    query === ''
      ? []
      : phones
          .filter((phone) => {
            const text = [
              phone.brand,
              phone.model,
              phone.category,
              phone.specs?.ram,
              phone.specs?.storage,
              phone.specs?.chipset,
            ]
              .filter(Boolean)
              .join(' ')
              .toLowerCase()

            return text.includes(query)
          })
          .sort((a, b) => {
            const aExact = `${a.brand} ${a.model}`.toLowerCase().startsWith(query)
            const bExact = `${b.brand} ${b.model}`.toLowerCase().startsWith(query)

            if (aExact && !bExact) return -1
            if (!aExact && bExact) return 1

            const aScore = Number.isFinite(a.score) ? a.score : 0
            const bScore = Number.isFinite(b.score) ? b.score : 0
            return bScore - aScore
          })
          .slice(0, 8)

  const showDropdown = query !== ''

  return (
    // No more mb-20: the dropdown is `absolute` and never needs a margin
    // to "make room" for it — it already floats over the content below.
    // A normal pb-10 keeps this section's rhythm consistent with the rest
    // of the homepage (StatsSection etc. use the same py-10 scale).
    <section className="relative pb-10">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 flex justify-center">
        <div className="h-56 w-56 rounded-full bg-primary/10 blur-[120px]" />
      </div>

      <div className="mx-auto max-w-4xl">
        <div className="relative">
          <Search
            className="absolute start-6 top-1/2 z-10 h-5 w-5 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />

          <input
            role="searchbox"
            aria-label={dict.phonesPage.searchLabel}
            aria-expanded={showDropdown}
            aria-controls="search-hero-results"
            aria-autocomplete="list"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={dict.phonesPage.searchPlaceholder}
            className="glass-panel h-16 w-full rounded-full ps-16 pe-8 text-base font-medium shadow-elevation-lg outline-none transition-all duration-300 focus:border-primary focus:ring-4 focus:ring-primary/20"
          />

          <AnimatePresence>
            {showDropdown && (
              <motion.div
                id="search-hero-results"
                role="listbox"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.15 }}
                className="glass-panel absolute inset-x-0 top-full z-50 mt-3 max-h-[420px] overflow-y-auto rounded-3xl p-2 shadow-elevation-lg"
              >
                {results.length > 0 ? (
                  results.map((phone) => (
                    <Link
                      key={phone.id}
                      href={`/phone/${phone.id}`}
                      role="option"
                      aria-selected={false}
                      className="group flex items-center gap-4 rounded-2xl p-3 transition-colors duration-200 hover:bg-primary/5"
                    >
                      <div className="relative h-16 w-16 shrink-0">
                        <PhoneImage phone={phone} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="truncate text-sm font-bold text-foreground group-hover:text-primary">
                          {phone.brand} {phone.model}
                        </h3>
                        <p className="mt-1 truncate text-xs text-muted-foreground">
                          {phone.specs?.ram} • {phone.specs?.storage}
                        </p>
                        <div className="mt-2 flex items-center gap-2">
                          <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-xs font-bold text-primary">
                            <Star className="size-3" aria-hidden="true" />
                            {Number.isFinite(phone.score) ? phone.score.toFixed(1) : '—'}
                          </span>
                          <span className="text-sm font-semibold text-primary">
                            {formatDZD(phone.price)}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="flex flex-col items-center gap-2 py-8 text-center">
                    <SearchX className="size-5 text-muted-foreground" aria-hidden="true" />
                    <p className="text-sm text-muted-foreground">{dict.phonesPage.emptyResults}</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {QUICK_FILTERS.map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setValue(filter)}
              className="rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary transition-colors duration-200 hover:bg-primary hover:text-primary-foreground"
            >
              {filter}
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}