import type { Phone as PhoneType, PhoneRatings } from './types'

/**
 * Derives strengths/weaknesses/ratings from a phone's REAL specs, score and
 * price whenever the live API doesn't return them directly. This is a pure
 * function of the phone's own data — nothing here is hardcoded per phone id,
 * so it stays correct for any phone the API returns, current or future.
 */

function parseNumber(value?: string | number | null): number {
  if (typeof value === 'number') return value
  if (!value) return 0
  const match = String(value).match(/(\d+(\.\d+)?)/)
  return match ? Number(match[1]) : 0
}

function ramGb(phone: PhoneType): number {
  return parseNumber(phone.specs?.ram)
}

function storageGb(phone: PhoneType): number {
  const raw = phone.specs?.storage
  if (!raw) return 0
  const n = parseNumber(raw)
  // Handle "1TB" style values.
  if (/tb/i.test(String(raw))) return n * 1024
  return n
}

function batteryMah(phone: PhoneType): number {
  return parseNumber(phone.specs?.battery)
}

function cameraMp(phone: PhoneType): number {
  return parseNumber(phone.specs?.mainCamera)
}

function refreshRateHz(phone: PhoneType): number {
  const match = phone.specs?.display?.match(/(\d{2,3})\s*Hz/i)
  return match ? Number(match[1]) : 60
}

/** Derive a 0–10 rating breakdown from the phone's real specs and score. */
export function deriveRatings(phone: PhoneType): PhoneRatings {
  const clamp = (n: number) => Math.max(1, Math.min(10, Math.round(n * 10) / 10))

  // Performance leans on the overall ABDOU SCORE plus RAM as a proxy.
  const performance = clamp(phone.score * 0.85 + Math.min(ramGb(phone) / 16, 1) * 1.5)

  // Camera scales with megapixels, saturating around 108MP+ setups.
  const mp = cameraMp(phone)
  const camera = clamp(4 + Math.min(mp, 108) / 108 * 5.5 + phone.score * 0.1)

  // Battery scales with mAh, saturating around 5500mAh.
  const mah = batteryMah(phone)
  const battery = clamp(3 + Math.min(mah, 5500) / 5500 * 6.5)

  // Display rewards high refresh rate + premium panel keywords.
  const hz = refreshRateHz(phone)
  const premiumPanel = /amoled|oled|retina/i.test(phone.specs?.display ?? '') ? 1.2 : 0
  const display = clamp(4 + Math.min(hz, 144) / 144 * 4.5 + premiumPanel)

  // Value rewards a high score at a low relative price within its category.
  const value = clamp(10 - phone.price / 40000 + phone.score * 0.4)

  return { performance, camera, battery, display, value }
}

/** Derive Arabic strength bullets from the phone's real, current data. */
export function deriveStrengths(phone: PhoneType): string[] {
  const ratings = phone.ratings ?? deriveRatings(phone)
  const points: string[] = []

  if (phone.score >= 9) points.push(`تقييم ABDOU SCORE استثنائي (${phone.score.toFixed(1)}/10)`)
  else if (phone.score >= 8) points.push(`تقييم ABDOU SCORE قوي جداً (${phone.score.toFixed(1)}/10)`)

  if ((ratings.camera ?? 0) >= 8) {
    const mp = cameraMp(phone)
    points.push(mp ? `كاميرا رئيسية قوية بدقة ${mp} ميجابكسل` : 'نظام كاميرات متقدّم')
  }
  if ((ratings.battery ?? 0) >= 8) {
    const mah = batteryMah(phone)
    points.push(mah ? `بطارية كبيرة ${mah} مللي أمبير تدوم طوال اليوم` : 'بطارية تدوم طويلاً')
  }
  if ((ratings.performance ?? 0) >= 8) {
    points.push(phone.specs?.chipset ? `أداء سريع بفضل ${phone.specs.chipset}` : 'أداء قوي وسريع')
  }
  if ((ratings.display ?? 0) >= 8 && phone.specs?.display) {
    points.push(`شاشة عالية الجودة: ${phone.specs.display}`)
  }
  if ((ratings.value ?? 0) >= 7.5) {
    points.push('قيمة ممتازة مقابل السعر داخل فئتها')
  }
  if (phone.specs?.storage && storageGb(phone) >= 256) {
    points.push(`مساحة تخزين واسعة (${phone.specs.storage})`)
  }

  if (points.length === 0) points.push(phone.highlight)
  return Array.from(new Set(points)).slice(0, 5)
}

/** Derive Arabic weakness bullets from the phone's real, current data. */
export function deriveWeaknesses(phone: PhoneType): string[] {
  const ratings = phone.ratings ?? deriveRatings(phone)
  const points: string[] = []

  if ((ratings.battery ?? 10) < 6) points.push('سعة البطارية أقل من متوسط فئتها')
  if ((ratings.camera ?? 10) < 6) points.push('أداء الكاميرا يبقى محدوداً مقارنة بمنافسيها')
  if ((ratings.display ?? 10) < 6) points.push('معدل التحديث أو جودة الشاشة أقل من المنافسين')
  if ((ratings.performance ?? 10) < 6) points.push('الأداء مناسب للاستخدام اليومي فقط، وليس للمهام الثقيلة')
  if (phone.price > 200000) points.push('السعر مرتفع نسبياً مقارنة بالفئات الأخرى')
  if (phone.specs?.storage && storageGb(phone) < 128) points.push('مساحة التخزين الأساسية محدودة')

  if (points.length === 0) {
    points.push('لا توجد نقاط ضعف بارزة مقارنة بفئته السعرية')
  }
  return points.slice(0, 4)
}

/** Fill in any missing strengths/weaknesses/ratings on a phone from real data. */
export function withDerivedAnalysis(phone: PhoneType): PhoneType {
  const ratings = phone.ratings ?? deriveRatings(phone)
  const enriched: PhoneType = { ...phone, ratings }
  enriched.strengths = phone.strengths?.length ? phone.strengths : deriveStrengths(enriched)
  enriched.weaknesses = phone.weaknesses?.length ? phone.weaknesses : deriveWeaknesses(enriched)
  return enriched
}
