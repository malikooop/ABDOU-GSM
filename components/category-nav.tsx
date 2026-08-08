'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Crown, Gem, Layers, Wallet } from 'lucide-react'
import { CATEGORIES } from '@/lib/data'
import { useLanguage } from '@/lib/i18n/language-provider'
import type { PhoneCategory } from '@/lib/types'

const ICONS: Record<PhoneCategory, typeof Crown> = {
  Flagship: Crown,
  'Upper Mid-Range': Gem,
  'Mid-Range': Layers,
  Budget: Wallet,
}

// Semantic tokens instead of raw Tailwind palette colors — Flagship keeps
// its "gold crown" feel via the warning token (amber), Budget keeps its
// "green = affordable" feel via success, etc.
const ICON_COLORS: Record<PhoneCategory, string> = {
  Flagship: 'text-warning',
  'Upper Mid-Range': 'text-primary',
  'Mid-Range': 'text-accent',
  Budget: 'text-success',
}

export function CategoryNav() {
  const { dict } = useLanguage()

  return (
    <section id="categories" className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
      <div className="flex items-center gap-2 overflow-x-auto rounded-2xl border border-border bg-card p-2 shadow-elevation-sm">
        <Link
          href="/phones"
          className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors duration-200 hover:bg-[var(--primary-hover)]"
        >
          {dict.phonesPage.allCategories}
        </Link>

        {CATEGORIES.map((cat) => {
          // CATEGORIES (the list actually rendered) and ICONS (the lookup
          // table) are two separately maintained sources — fall back to a
          // neutral icon instead of throwing if a category is ever added to
          // one without the other.
          const Icon = ICONS[cat.key] ?? Layers
          return (
            <motion.div key={cat.key} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} className="shrink-0">
              <Link
                href={`/phones?category=${encodeURIComponent(cat.key)}`}
                className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors duration-200 hover:bg-muted hover:text-foreground"
              >
                <Icon className={`size-4 ${ICON_COLORS[cat.key] ?? 'text-muted-foreground'}`} aria-hidden="true" />
                {dict.categories[cat.key]}
              </Link>
            </motion.div>
          )
        })}
      </div>
    </section>
  )
}