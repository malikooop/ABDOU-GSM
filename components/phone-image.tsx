import { Smartphone } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Phone } from '@/lib/types'
import Image from 'next/image'


interface PhoneImageProps {
  phone: Phone
  className?: string
  priority?: boolean
}

/**
 * Renders the phone image, or an elegant branded placeholder when no image
 * is available. The placeholder shows a phone silhouette on a soft gradient.
 */
export function PhoneImage({
  phone,
  className,
  priority = false,
}: PhoneImageProps) {

  const image = phone.image_url ?? phone.image

  if (image) {
    return (
      <div className={cn('relative h-full w-full', className)}>
        <Image
  src={image}
  alt={`${phone.brand} ${phone.model}`}
  fill
  priority={priority}
  loading={priority ? "eager" : "lazy"}
  sizes="(max-width:768px) 100vw, (max-width:1200px) 50vw, 33vw"
  className="object-contain"
  unoptimized
/>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'relative flex h-full w-full items-center justify-center overflow-hidden',
        className,
      )}
    >
      <div className="bg-grid absolute inset-0 opacity-60" aria-hidden="true" />
      <div
        className="absolute inset-x-8 bottom-0 top-8 rounded-t-[2rem] bg-gradient-to-b from-primary/25 to-transparent blur-2xl"
        aria-hidden="true"
      />
      <div className="relative flex flex-col items-center gap-3 text-center">
        <div className="grid size-16 place-items-center rounded-2xl border border-border bg-card/70 backdrop-blur">
          <Smartphone className="size-7 text-primary" aria-hidden="true" />
        </div>
        <div className="leading-tight">
          <p className="font-display text-sm font-bold text-foreground">
            {phone.brand}
          </p>
          <p className="text-xs text-muted-foreground">{phone.model}</p>
        </div>
      </div>
    </div>
  )
}
