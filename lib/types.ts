export type PhoneCategory =
  | 'Flagship'
  | 'Upper Mid-Range'
  | 'Mid-Range'
  | 'Budget'

export interface Phone {
  id: number
  brand: string
  model: string
  /** Price in Algerian Dinar (DZD). */
  price: number
  /** ABDOU SCORE out of 10. */
  score: number 
  category: PhoneCategory
  /** Short marketing highlight in Arabic. */
  highlight: string
  image?: string | null
  /** Optional detailed specs used by the details/compare views. */
  specs?: PhoneSpecs
  /**
   * Arabic strengths/weaknesses bullet points for the details page. Populated
   * from the live API when it provides them, otherwise derived locally from
   * real specs/score/price (see lib/analyze.ts) — never hardcoded per phone.
   */
  strengths?: string[]
  weaknesses?: string[]
  /** Per-criterion rating breakdown out of 10 (e.g. performance, camera). */
  ratings?: PhoneRatings

  image_url?: string | null
}

export interface PhoneRatings {
  performance?: number
  camera?: number
  battery?: number
  display?: number
  value?: number
}

export interface PhoneSpecs {
  display?: string
  chipset?: string
  ram?: string
  storage?: string
  battery?: string
  mainCamera?: string
  os?: string
  releaseYear?: number
}

export interface EditorialPick {
  id: string
  title: string
  reason: string
  phoneId: number
  tag: string
}

export interface CategoryInfo {
  key: PhoneCategory
  label: string
  description: string
}
