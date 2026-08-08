'use client'

import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import { GitCompareArrows, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useCompareSelection } from '@/lib/compare-store'

const MIN_TO_COMPARE = 2

export function CompareBar() {
  const { ids, remove, clear } = useCompareSelection()

  const canCompare = ids.length >= MIN_TO_COMPARE

  return (
    <AnimatePresence>
      {ids.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-x-0 bottom-16 z-40 flex justify-center px-4 md:bottom-6"
        >
          <div
            role="status"
            className="glass-panel glow-primary flex w-full max-w-lg items-center gap-3 rounded-2xl p-3 shadow-elevation-lg"
          >
            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary">
              <GitCompareArrows className="size-4" aria-hidden="true" />
            </span>

            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-foreground" aria-live="polite">
                {ids.length} {ids.length === 1 ? 'هاتف محدد' : 'هواتف محددة'} للمقارنة
              </p>
              {canCompare ? (
                <button
                  type="button"
                  onClick={clear}
                  className="text-xs text-muted-foreground underline-offset-2 hover:underline"
                >
                  إلغاء التحديد
                </button>
              ) : (
                // With only one phone selected there's nothing meaningful to
                // compare yet — tell the person what to do next instead of
                // leaving an active "قارن الآن" button that would take them to
                // a compare page with a single item.
                <p className="text-xs text-muted-foreground">اختر هاتفًا واحدًا آخر على الأقل</p>
              )}
            </div>

            <Link
              href={canCompare ? `/compare?ids=${encodeURIComponent(ids.join(','))}` : '#'}
              aria-disabled={!canCompare}
              tabIndex={canCompare ? undefined : -1}
              onClick={(e) => {
                if (!canCompare) e.preventDefault()
              }}
              className={cn(
                'shrink-0 rounded-lg px-4 py-2 text-sm font-semibold transition-transform duration-200 active:scale-95',
                canCompare
                  ? 'bg-primary text-primary-foreground'
                  : 'pointer-events-none bg-muted text-muted-foreground',
              )}
            >
              قارن الآن
            </Link>

            {ids.length === 1 && (
              <button
                type="button"
                aria-label="إلغاء التحديد"
                onClick={() => remove(ids[0])}
                className="shrink-0 rounded-lg p-1.5 text-muted-foreground transition-colors duration-200 hover:bg-muted hover:text-foreground"
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}