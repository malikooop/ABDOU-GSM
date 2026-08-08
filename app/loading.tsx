import { Loader2 } from 'lucide-react'

/**
 * Route-level loading UI shown while the homepage Server Component fetches
 * phones from the live n8n API. Uses the same RTL/dark theme tokens.
 */
export default function Loading() {
  return (
    <div className="min-h-dvh" dir="rtl">
      {/* Everything below is a purely visual placeholder — the single
          role="status" region at the end is what actually gets announced
          to screen readers, so the skeleton itself is hidden from them to
          avoid a wall of unlabeled, empty elements being read out. */}
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6" aria-hidden="true">
        {/* Hero placeholder */}
        <div className="flex flex-col items-center gap-4 text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-primary/15 px-4 py-1.5 text-sm font-medium text-primary">
            <Loader2 className="size-4 motion-safe:animate-spin" />
            جاري تحميل أحدث الهواتف من ABDOU GSM…
          </span>
          <div className="h-10 w-72 max-w-full animate-pulse rounded-xl bg-secondary/50 motion-reduce:animate-none" />
          <div className="h-4 w-96 max-w-full animate-pulse rounded-lg bg-secondary/40 motion-reduce:animate-none" />
        </div>

        {/* Cards skeleton */}
        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card"
            >
              <div className="h-48 animate-pulse bg-secondary/50 motion-reduce:animate-none" />
              <div className="flex flex-col gap-3 p-4">
                <div className="h-3 w-20 animate-pulse rounded bg-secondary/50 motion-reduce:animate-none" />
                <div className="h-5 w-40 animate-pulse rounded bg-secondary/50 motion-reduce:animate-none" />
                <div className="h-4 w-full animate-pulse rounded bg-secondary/40 motion-reduce:animate-none" />
                <div className="mt-2 h-6 w-24 animate-pulse rounded bg-secondary/50 motion-reduce:animate-none" />
              </div>
            </div>
          ))}
        </div>
      </div>

      <span className="sr-only" role="status">
        جاري تحميل أحدث الهواتف من ABDOU GSM
      </span>
    </div>
  )
}