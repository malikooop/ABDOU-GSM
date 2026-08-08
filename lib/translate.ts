/**
 * Translate the English marketing highlights coming from the n8n API
 * (`top_feature` / `highlight`) into natural Arabic for the UI.
 *
 * IMPORTANT: this is a presentation-only layer. The database/API is never
 * modified — we only localize the text as it is rendered.
 */

/** Exact-match dictionary for the known feature strings from the live API. */
const FEATURE_AR: Record<string, string> = {
  'Outstanding cameras': 'كاميرات استثنائية في كل الظروف',
  'Class-leading performance': 'أداء يتصدّر فئته بلا منازع',
  'Flagship power for less': 'قوة الفئة الرائدة بسعر أقل',
  'Compact flagship': 'هاتف رائد بحجم مدمج ومريح',
  'Best-in-class photography': 'أفضل تصوير فوتوغرافي في فئته',
  'Excellent portrait cameras': 'كاميرات بورتريه ممتازة',
  'Outstanding value': 'قيمة استثنائية مقابل السعر',
  'Huge 5500mAh battery': 'بطارية ضخمة 5500 مللي أمبير',
  'Strong Dimensity 8200 chip': 'معالج Dimensity 8200 قوي',
  'Long software support': 'دعم برمجي طويل الأمد',
  'High-res 200MP camera': 'كاميرا فائقة الدقة 200 ميجابكسل',
  'Rare periscope zoom at this price': 'عدسة تقريب بيريسكوب نادرة بهذا السعر',
  'Sleek curved design': 'تصميم منحنٍ أنيق',
  'Slim lightweight design': 'تصميم نحيف وخفيف الوزن',
  'Clean near-stock software': 'نظام تشغيل نقي قريب من الأصلي',
  'Excellent selfie camera': 'كاميرا سيلفي ممتازة للمحتوى',
  'Wireless charging at budget price': 'شحن لاسلكي بسعر اقتصادي',
  'Long 4-year software support': 'دعم برمجي يمتد 4 سنوات',
  'Very affordable': 'سعر اقتصادي في متناول الجميع',
}

/**
 * Keyword-based fallback so newly added English features still render sensibly
 * in Arabic even if they are not in the exact dictionary above.
 */
const KEYWORD_AR: Array<[RegExp, string]> = [
  [/camera|photograph|photo/i, 'أداء تصوير ممتاز'],
  [/selfie|portrait/i, 'كاميرا أمامية ممتازة'],
  [/battery|mah/i, 'بطارية كبيرة تدوم طويلاً'],
  [/performance|chip|processor|power/i, 'أداء قوي وسريع'],
  [/value|affordable|price|budget/i, 'قيمة ممتازة مقابل السعر'],
  [/design|slim|curved|compact/i, 'تصميم أنيق ومميز'],
  [/software|support|update/i, 'دعم برمجي طويل الأمد'],
  [/zoom|periscope|telephoto/i, 'تقريب بصري متقدّم'],
  [/wireless charging/i, 'شحن لاسلكي'],
  [/display|screen|amoled|oled/i, 'شاشة رائعة'],
]

/**
 * Return a natural Arabic version of an English feature/highlight string.
 * Falls back to keyword matching, then to the original text if nothing matches.
 */
export function translateFeature(feature?: string | null): string {
  if (!feature) return 'اختيار موثوق من عبدو'
  const trimmed = feature.trim()
  if (!trimmed) return 'اختيار موثوق من عبدو'

  // Already Arabic (e.g. fallback data)? Keep as-is.
  if (/[\u0600-\u06FF]/.test(trimmed)) return trimmed

  if (FEATURE_AR[trimmed]) return FEATURE_AR[trimmed]

  for (const [pattern, ar] of KEYWORD_AR) {
    if (pattern.test(trimmed)) return ar
  }

  return trimmed
}
