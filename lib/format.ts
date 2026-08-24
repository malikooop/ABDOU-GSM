/**
 * Format a price in Algerian Dinar (DZD) using Western Arabic numerals
 * with thin thousands separators, followed by the Arabic currency label "دج".
 * Example: 129900 -> "129 900 دج"
 *
 * `numberingSystem: 'latn'` is set explicitly, not left implied by the
 * locale — some browsers render Intl.NumberFormat digits using the
 * Arabic-Indic numbering system when the device/browser language is set
 * to Arabic, even for a region (DZ) that conventionally uses Western
 * digits for prices. Forcing 'latn' removes that ambiguity entirely,
 * independent of the visitor's OS/browser language setting.
 */
const dzdFormatter = new Intl.NumberFormat('fr-DZ', {
  maximumFractionDigits: 0,
  numberingSystem: 'latn',
})

export function formatDZD(amount: number): string {
  return `${dzdFormatter.format(amount)} دج`
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
