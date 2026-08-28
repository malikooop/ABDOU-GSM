/**
 * Format a price in Algerian Dinar using Western Arabic numerals with
 * thin thousands separators, followed by a locale-appropriate currency
 * label. Example: 129900 -> "129 900 دج" (ar) or "129 900 DZD" (en).
 *
 * `numberingSystem: 'latn'` is set explicitly, not left implied by the
 * locale — some browsers render Intl.NumberFormat digits using the
 * Arabic-Indic numbering system when the device/browser language is set
 * to Arabic, even for a region (DZ) that conventionally uses Western
 * digits for prices. Forcing 'latn' removes that ambiguity entirely,
 * independent of the visitor's OS/browser language setting.
 *
 * The currency label itself is NOT hardcoded here — callers pass it in
 * (typically `dict.common.currency` from the active language dictionary)
 * so the label switches with the UI language instead of staying "دج"
 * regardless of locale.
 */
const dzdFormatter = new Intl.NumberFormat('fr-DZ', {
  maximumFractionDigits: 0,
  numberingSystem: 'latn',
})

export function formatDZD(amount: number, currencyLabel: string = 'دج'): string {
  return `${dzdFormatter.format(amount)} ${currencyLabel}`
}

/** Format the ABDOU SCORE (out of 10) with one decimal, e.g. 9.2 */
export function formatScore(score: number): string {
  return score.toFixed(1)
}

/**
 * Format a plain count/quantity (e.g. an admin table price cell) with
 * Latin numerals and thousands separators. Prefer this over the bare
 * `Number.prototype.toLocaleString()`, which inherits the browser's
 * default locale and can render Arabic-Indic digits unpredictably —
 * exactly the same risk `formatDZD` above guards against.
 */
const numberFormatter = new Intl.NumberFormat('fr-DZ', {
  maximumFractionDigits: 0,
  numberingSystem: 'latn',
})

export function formatNumber(amount: number): string {
  return numberFormatter.format(amount)
}

/**
 * Map Arabic-Indic (٠-٩) and Extended Arabic-Indic/Persian (۰-۹) digits to
 * plain ASCII digits. Mobile keyboards set to Arabic frequently insert
 * these into text fields regardless of the input's `inputMode`/`lang` —
 * that attribute only hints at which virtual keyboard layout to *offer*,
 * it doesn't force which characters the keyboard actually sends. Native
 * `<input type="number">` is worse: several mobile browsers render its
 * value and spin-button digits using the OS locale's numbering system,
 * ignoring `lang` on the element entirely. `NumericField` below sidesteps
 * both problems by using `type="text"` and running every keystroke
 * through this normalizer, so the field's value is always Latin digits
 * regardless of keyboard or browser.
 */
const DIGIT_MAP: Record<string, string> = {
  '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4', '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9',
  '۰': '0', '۱': '1', '۲': '2', '۳': '3', '۴': '4', '۵': '5', '۶': '6', '۷': '7', '۸': '8', '۹': '9',
}

export function toLatinDigits(input: string): string {
  return input.replace(/[٠-٩۰-۹]/g, (d) => DIGIT_MAP[d] ?? d)
}
