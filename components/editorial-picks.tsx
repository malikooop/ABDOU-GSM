'use client'

import Link from 'next/link'
import { Award, ArrowUpRight } from 'lucide-react'
import { AbdouScore } from '@/components/abdou-score'
import { PhoneImage } from '@/components/phone-image'
import { formatDZD } from '@/lib/format'
import { selectEditorialPicks } from '@/lib/picks'
import { useLanguage } from '@/lib/i18n/language-provider'
import type { Phone } from '@/lib/types'

export function EditorialPicks({ phones }: { phones: Phone[] }) {
  const { dict } = useLanguage()

  // Picks are derived dynamically from the live API list, not fixed IDs.
  const picks = selectEditorialPicks(phones)

  if (picks.length === 0) return null

  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-8 flex items-center gap-3">
        <span className="grid size-10 place-items-center rounded-xl bg-warning/10 text-warning">
          <Award className="size-5" aria-hidden="true" />
        </span>
        <div>
          <h2 className="font-display text-2xl font-bold text-foreground sm:text-3xl">
            {dict.editorialPicks.title}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">{dict.editorialPicks.subtitle}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {picks.map((pick) => {
          const phone = pick.phone
          return (
            <article
              key={pick.id}
              className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-elevation-md"
            >
              <div className="relative h-44 bg-secondary/40">
                <div className="absolute end-3 top-3 z-10">
                  <AbdouScore score={phone.score} size="sm" />
                </div>
                <div className="absolute start-3 top-3 z-10 inline-flex items-center gap-1.5 rounded-full bg-success px-3 py-1 text-xs font-bold text-white shadow-elevation-sm">
                  <Award className="size-3.5" aria-hidden="true" />
                  {pick.tag}
                </div>
                <PhoneImage
                  phone={phone}
                  className="p-6 transition-transform duration-500 group-hover:scale-105"
                />
              </div>

              <div className="flex flex-1 flex-col gap-2 p-4">
                <div>
                  <p className="text-xs text-muted-foreground">{phone.brand}</p>
                  <h3 className="font-display text-lg font-bold text-foreground">{phone.model}</h3>
                </div>

                {/* pick.reason is always Arabic content regardless of UI
                    language — explicit dir="rtl" keeps it correct in
                    English/LTR mode. */}
                <p dir="rtl" className="text-pretty text-end text-sm leading-relaxed text-muted-foreground">
                  {pick.reason}
                </p>

                <div className="mt-auto flex items-center justify-between border-t border-border/60 pt-3">
                  <span className="font-display text-base font-bold text-primary">
                    {formatDZD(phone.price)}
                  </span>
                  <Link
                    href={`/phone/${phone.id}`}
                    className="inline-flex items-center gap-1 text-sm font-semibold text-foreground"
                  >
                    {dict.editorialPicks.detailsCta}
                    <ArrowUpRight className="size-3.5" aria-hidden="true" />
                  </Link>
                </div>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}