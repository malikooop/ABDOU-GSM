'use client'

import { useCallback, useEffect, useState } from 'react'

const STORAGE_KEY = 'abdou-gsm:compare-ids'
const EVENT_NAME = 'abdou-gsm:compare-change'
export const MAX_COMPARE = 4

function readIds(): number[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter((n) => Number.isFinite(n)) : []
  } catch {
    return []
  }
}

function writeIds(ids: number[]) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids))
  // localStorage's native "storage" event only fires in *other* tabs, so we
  // dispatch our own event to keep every component in this tab in sync.
  window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: ids }))
}

/**
 * Shared hook for the phone-comparison selection. Any component that calls
 * this stays in sync with any other, since state lives in localStorage and
 * changes are broadcast via a custom DOM event.
 */
export function useCompareSelection() {
  const [ids, setIds] = useState<number[]>([])

  useEffect(() => {
    setIds(readIds())
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<number[]>).detail
      setIds(detail ?? readIds())
    }
    window.addEventListener(EVENT_NAME, handler)
    return () => window.removeEventListener(EVENT_NAME, handler)
  }, [])

  const toggle = useCallback((id: number) => {
    const current = readIds()
    const next = current.includes(id)
      ? current.filter((existing) => existing !== id)
      : [...current, id].slice(-MAX_COMPARE)
    writeIds(next)
    setIds(next)
  }, [])

  const remove = useCallback((id: number) => {
    const next = readIds().filter((existing) => existing !== id)
    writeIds(next)
    setIds(next)
  }, [])

  const clear = useCallback(() => {
    writeIds([])
    setIds([])
  }, [])

  const isSelected = useCallback((id: number) => ids.includes(id), [ids])

  return { ids, toggle, remove, clear, isSelected }
}
