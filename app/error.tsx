'use client'

import { useEffect } from 'react'
import { AlertTriangle, RotateCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

/**
 * Route-level error UI (in Arabic) shown if the homepage fails to render.
 * The API layer already falls back to local data on network failure, so this
 * is a safety net for unexpected errors, with a retry action.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.log('[v0] Homepage error boundary:', error)
  }, [error])

  return (
    <div
      dir="rtl"
      className="grid min-h-dvh place-items-center px-4 py-16 text-center"
    >
      <div className="flex max-w-md flex-col items-center gap-5">
        <span className="grid size-16 place-items-center rounded-2xl bg-destructive/15 text-destructive">
          <AlertTriangle className="size-8" aria-hidden="true" />
        </span>
        <h1 className="font-display text-2xl font-bold text-foreground sm:text-3xl">
          تعذّر تحميل الهواتف
        </h1>
        <p className="text-pretty leading-relaxed text-muted-foreground">
          حدث خطأ أثناء الاتصال بخادم ABDOU GSM. يرجى التحقق من اتصالك بالإنترنت
          والمحاولة مرة أخرى.
        </p>
        <Button
          onClick={reset}
          size="lg"
          className="bg-primary font-semibold text-primary-foreground transition-transform hover:bg-primary/90 active:scale-95"
        >
          <RotateCw className="size-4" aria-hidden="true" />
          إعادة المحاولة
        </Button>
      </div>
    </div>
  )
}
