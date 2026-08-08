/**
 * Format a price in Algerian Dinar (DZD) using Western Arabic numerals
 * with thin thousands separators, followed by the Arabic currency label "دج".
 * Example: 129900 -> "129٬900 دج"
 */
const dzdFormatter = new Intl.NumberFormat('fr-DZ', {
  maximumFractionDigits: 0,
})

export function formatDZD(amount: number): string {
  return `${dzdFormatter.format(amount)} دج`
}

/** Format the ABDOU SCORE (out of 10) with one decimal, e.g. 9.2 */
export function formatScore(score: number): string {
  return score.toFixed(1)
}
