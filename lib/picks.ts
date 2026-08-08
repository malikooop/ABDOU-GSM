import { formatDZD } from './format'
import type { Phone } from './types'

/**
 * A fully resolved editorial pick, computed dynamically from the live phone
 * list instead of relying on fixed database IDs.
 */
export interface ResolvedPick {
  id: string
  tag: string
  phone: Phone
  reason: string
}

/** Extract the leading megapixel number from a camera spec string. */
function cameraMp(phone: Phone): number {
  const match = phone.specs?.mainCamera?.match(/(\d+)\s*MP/i)
  return match ? Number(match[1]) : 0
}

/** Extract the battery capacity (mAh) from the spec string. */
function batteryMah(phone: Phone): number {
  const match = phone.specs?.battery?.match(/(\d{3,5})/)
  return match ? Number(match[1]) : 0
}

/** Value ratio: score relative to price (higher is better value). */
function valueRatio(phone: Phone): number {
  return phone.price > 0 ? phone.score / phone.price : 0
}

/**
 * Dynamically select the three editorial picks (best camera, best value,
 * best battery & performance) from whatever phones the API returned.
 * Guarantees three distinct phones when enough are available.
 */
export function selectEditorialPicks(phones: Phone[]): ResolvedPick[] {
  if (phones.length === 0) return []

  const used = new Set<number>()

  const pickBest = (
    score: (p: Phone) => number,
  ): Phone | undefined => {
    const candidate = [...phones]
      .filter((p) => !used.has(p.id))
      .sort((a, b) => score(b) - score(a))[0]
    if (candidate) used.add(candidate.id)
    return candidate
  }

  const picks: ResolvedPick[] = []

  const camera = pickBest((p) => cameraMp(p) + p.score)
  if (camera) {
    const mp = cameraMp(camera)
    picks.push({
      id: 'best-camera',
      tag: 'أفضل كاميرا',
      phone: camera,
      reason: `اختيار عبدو لعشّاق التصوير: ${
        camera.specs?.mainCamera ?? 'نظام كاميرات متقدّم'
      }${mp ? ` بدقة ${mp} ميجابكسل` : ''} مع تقييم ABDOU SCORE ${camera.score.toFixed(
        1,
      )}.`,
    })
  }

  const value = pickBest((p) => valueRatio(p))
  if (value) {
    picks.push({
      id: 'best-value',
      tag: 'أفضل قيمة',
      phone: value,
      reason: `أذكى قيمة مقابل السعر: تقييم ${value.score.toFixed(
        1,
      )} بسعر ${formatDZD(value.price)} فقط — أداء يفوق فئته السعرية.`,
    })
  }

  const battery = pickBest((p) => batteryMah(p) + p.score * 100)
  if (battery) {
    const mah = batteryMah(battery)
    picks.push({
      id: 'best-battery',
      tag: 'أفضل بطارية وأداء',
      phone: battery,
      reason: `للمستخدم الذي لا يتوقف: ${
        mah ? `بطارية ${mah} مللي أمبير` : 'بطارية ضخمة'
      } وأداء قوي يلتهم أي مهمة طوال اليوم.`,
    })
  }

  return picks
}
