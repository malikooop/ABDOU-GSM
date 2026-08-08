'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowUpRight, Sparkles } from 'lucide-react'
import { PhoneCard } from '@/components/phone-card'
import { useLanguage } from '@/lib/i18n/language-provider'
import type { Phone } from '@/lib/types'

export function FeaturedPhones({ phones }: { phones: Phone[] }) {
  const { dict } = useLanguage()

  return (
    <section id="phones" className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
            <Sparkles className="size-5" aria-hidden="true" />
          </span>
          <div>
            <h2 className="font-display text-2xl font-bold text-foreground sm:text-3xl">
              {dict.featuredPhones.title}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">{dict.featuredPhones.subtitle}</p>
          </div>
        </div>
        <Link
          href="/phones"
          className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-primary"
        >
          {dict.featuredPhones.viewAll}
          <ArrowUpRight className="size-4" aria-hidden="true" />
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {phones.map((phone, i) => (
          <motion.div
            key={phone.id}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.2, delay: Math.min(i * 0.05, 0.3) }}
          >
            <PhoneCard phone={phone} />
          </motion.div>
        ))}
      </div>
    </section>
  )
}