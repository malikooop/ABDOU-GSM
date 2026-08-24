'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import { AlertTriangle, ArrowUpRight, Loader2, Sparkles } from 'lucide-react'
import { AbdouScore } from '@/components/abdou-score'
import { formatDZD } from '@/lib/format'
import { cn } from '@/lib/utils'
import { getAdvice, mapUsageToAdviceType } from '@/lib/api'
import { useLanguage } from '@/lib/i18n/language-provider'
import type { Phone } from '@/lib/types'

const USAGE_KEYS = ['camera', 'gaming', 'battery', 'value'] as const
type UsageKey = (typeof USAGE_KEYS)[number]

type RequestState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'success'; phone: Phone; reason?: string }

/**
 * ABDOU AI recommendation widget.
 * Bug fix (audit #5, preserved): resets result on budget/usage change,
 * issues a fresh race-safe request on click, maps usage -> AdviceType.
 */
export function AiTeaser({ phones }: { phones: Phone[] }) {
  const { dict } = useLanguage()
  const [budget, setBudget] = useState('100000')
  const [usage, setUsage] = useState<UsageKey>('value')
  const [state, setState] = useState<RequestState>({ status: 'idle' })

  const requestId = useRef(0)

  useEffect(() => {
    setState({ status: 'idle' })
  }, [budget, usage])

  async function handleRecommend() {
    const max = Number(budget)
    if (!Number.isFinite(max) || max <= 0) {
      setState({ status: 'error', message: dict.aiTeaser.errorBudget })
      return
    }

    const myRequestId = ++requestId.current
    setState({ status: 'loading' })

    try {
      const type = mapUsageToAdviceType(usage)
      const { phone, reason } = await getAdvice(type, max)
      if (myRequestId !== requestId.current) return

      if (!phone) {
        setState({ status: 'error', message: dict.aiTeaser.errorNoMatch })
        return
      }
      setState({ status: 'success', phone, reason })
    } catch (error) {
      if (myRequestId !== requestId.current) return
      console.error('ABDOU AI recommendation failed:', error)
      setState({ status: 'error', message: dict.aiTeaser.errorGeneric })
    }
  }

  return (
    <section id="abdou-ai" className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden rounded-3xl bg-foreground px-6 py-10 text-background sm:px-10 sm:py-14"
      >
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-warning/15 px-3 py-1 text-xs font-bold text-warning">
              <Sparkles className="size-3.5" aria-hidden="true" />
              ABDOU AI
            </span>
            <h2 className="mt-4 text-balance font-display text-3xl font-bold leading-[1.3] sm:text-4xl">
              {dict.aiTeaser.title}
            </h2>
            <p className="mt-4 max-w-md text-pretty text-base leading-relaxed text-background/70">
              {dict.aiTeaser.description}
            </p>

            <div className="mt-10 space-y-5">
              <div>
                <label htmlFor="ai-budget" className="mb-2 block text-sm font-medium text-background/80">
                  {dict.aiTeaser.budgetLabel}
                </label>
                <input
                  id="ai-budget"
                  type="number"
                  inputMode="numeric"
                  min={0}
                  step={5000}
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="w-full rounded-lg border-0 bg-background/10 px-4 py-3 text-sm text-background outline-none ring-1 ring-background/15 transition-all duration-200 placeholder:text-background/40 focus:ring-2 focus:ring-primary"
                  placeholder={dict.aiTeaser.budgetPlaceholder}
                />
              </div>

              <div>
                <span className="mb-2 block text-sm font-medium text-background/80">
                  {dict.aiTeaser.usageLabel}
                </span>
                <div className="flex flex-wrap gap-2">
                  {USAGE_KEYS.map((key) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setUsage(key)}
                      aria-pressed={usage === key}
                      className={cn(
                        'rounded-full px-4 py-1.5 text-sm font-medium transition-colors duration-200',
                        usage === key
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-background/10 text-background/70 hover:bg-background/20',
                      )}
                    >
                      {dict.aiTeaser.usageTypes[key]}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={handleRecommend}
                disabled={state.status === 'loading'}
                className="gradient-primary glow-primary inline-flex h-12 w-full items-center justify-center gap-2 rounded-full px-7 text-sm font-semibold text-white transition-transform duration-200 hover:scale-[1.01] active:scale-[0.98] disabled:opacity-50 sm:w-auto"
              >
                {state.status === 'loading' && (
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                )}
                {state.status === 'loading' ? dict.aiTeaser.ctaLoading : dict.aiTeaser.ctaIdle}
              </button>
            </div>
          </div>

          <div className="rounded-2xl bg-background/[0.06] p-6 ring-1 ring-background/10">
            <AnimatePresence mode="wait">
              {state.status === 'loading' ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center gap-3 py-10 text-center"
                >
                  <Loader2 className="size-6 animate-spin text-primary" aria-hidden="true" />
                  <p className="text-sm text-background/60">{dict.aiTeaser.loadingHint}</p>
                </motion.div>
              ) : state.status === 'error' ? (
                <motion.div
                  key="error"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center gap-3 py-10 text-center"
                >
                  <AlertTriangle className="size-6 text-destructive" aria-hidden="true" />
                  <p className="text-sm text-background/60">{state.message}</p>
                </motion.div>
              ) : state.status === 'success' ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <p className="mb-4 text-xs font-medium text-success">{dict.aiTeaser.resultLabel}</p>
                  <div className="flex items-center gap-4">
                    <AbdouScore score={state.phone.score} size="lg" />
                    <div>
                      <p className="text-xs text-background/60">{state.phone.brand}</p>
                      <p className="font-display text-lg font-bold">{state.phone.model}</p>
                      <p className="mt-0.5 font-display text-base font-bold text-primary">
                        {formatDZD(state.phone.price)}
                      </p>
                    </div>
                  </div>
                  <p dir="rtl" className="mt-4 text-pretty text-end text-sm leading-relaxed text-background/70">
                    {state.reason || state.phone.highlight}
                  </p>
                  <Link
                    href={`/phone/${state.phone.id}`}
                    className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary"
                  >
                    {dict.aiTeaser.viewDetails}
                    <ArrowUpRight className="size-4" aria-hidden="true" />
                  </Link>
                </motion.div>
              ) : (
                <motion.div
                  key="idle"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center gap-3 py-10 text-center"
                >
                  <span className="grid size-12 place-items-center rounded-2xl bg-primary/15 text-primary">
                    <Sparkles className="size-5" aria-hidden="true" />
                  </span>
                  <p className="text-sm text-background/60">{dict.aiTeaser.emptyHint}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </section>
  )
}