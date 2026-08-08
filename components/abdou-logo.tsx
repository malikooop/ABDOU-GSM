import { Smartphone } from 'lucide-react'
import { cn } from '@/lib/utils'

/** ABDOU GSM wordmark with a compact monogram tile. */
export function AbdouLogo({ className }: { className?: string }) {
  return (
    <span className={cn('flex items-center gap-2.5', className)}>
      <span
        aria-hidden="true"
        className="gradient-primary grid size-9 shrink-0 select-none place-items-center rounded-xl text-white shadow-elevation-sm"
      >
        <Smartphone className="size-[18px]" strokeWidth={2.25} aria-hidden="true" />
      </span>
      <span className="flex min-w-0 flex-col leading-none">
        <span className="truncate font-display text-base font-bold tracking-tight text-foreground">
          ABDOU GSM
        </span>
        <span className="truncate text-[10px] font-medium text-muted-foreground">
          اختار هاتفك بذكاء
        </span>
      </span>
    </span>
  )
}