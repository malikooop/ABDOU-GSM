import { Smartphone } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AbdouLogoProps {
  className?: string
  /** Uploaded via Admin → Settings. Falls back to the default monogram
   * tile when not set, so the site never ships a broken/empty logo. */
  logoUrl?: string | null
  /** Uploaded via Admin → Settings; falls back to "ABDOU GSM". */
  siteName?: string
}

/** ABDOU GSM wordmark — an admin-uploaded logo image when set, otherwise
 * the default monogram tile + name. */
export function AbdouLogo({ className, logoUrl, siteName = 'ABDOU GSM' }: AbdouLogoProps) {
  return (
    <span className={cn('flex items-center gap-2.5', className)}>
      {logoUrl ? (
        // Admin-uploaded, arbitrary external Storage URL — not a
        // static/known asset next/image can optimize at build time.
        <img
          src={logoUrl}
          alt={siteName}
          className="size-9 shrink-0 rounded-xl object-contain"
        />
      ) : (
        <span
          aria-hidden="true"
          className="gradient-primary grid size-9 shrink-0 select-none place-items-center rounded-xl text-white shadow-elevation-sm"
        >
          <Smartphone className="size-[18px]" strokeWidth={2.25} aria-hidden="true" />
        </span>
      )}
      <span className="flex min-w-0 flex-col leading-none">
        <span className="truncate font-display text-base font-bold tracking-tight text-foreground">
          {siteName}
        </span>
        <span className="truncate text-[10px] font-medium text-muted-foreground">
          اختار هاتفك بذكاء
        </span>
      </span>
    </span>
  )
}
