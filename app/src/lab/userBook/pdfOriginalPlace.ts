import { notePdfPlace, reconcilePdfPlace } from './ownSync'
import { userBookOwner } from './userBookStore'

const key = (hex: string) => `tinct-addbook:pos:pdf:${hex}`
export type OriginalPagePlace = { page: number; frac: number }
export function readPdfOriginalPlace(hex: string): OriginalPagePlace | null {
  try {
    const value = JSON.parse(localStorage.getItem(key(hex)) || 'null')
    return Number.isInteger(value?.page) && value.page >= 1 && typeof value.frac === 'number' && Number.isFinite(value.frac)
      ? { page: value.page, frac: Math.max(0, Math.min(1, value.frac)) } : null
  } catch { return null }
}

/** The page viewer owns PDF place, preserving rev/zoom and clearing stale text coordinates after a page move. */
export function notePdfOriginalPlace(hex: string, owner: string, place: OriginalPagePlace, pages?: number): boolean {
  if (userBookOwner() !== owner || !Number.isInteger(place.page) || place.page < 1 || !Number.isFinite(place.frac)) return false
  try {
    const previous = JSON.parse(localStorage.getItem(key(hex)) || '{}') as Record<string, unknown>
    const frac = Math.max(0, Math.min(1, place.frac))
    if (previous.page === place.page && typeof previous.frac === 'number' && Math.abs(previous.frac - frac) <= 0.02) return false
    const next = { ...previous, page: place.page, frac, edition: 'p', at: Date.now(), ...(pages && Number.isInteger(pages) ? { pages } : {}) }
    delete next.chapterNumber; delete next.paragraphIndex; delete next.wordIndex; delete next.converter
    localStorage.setItem(key(hex), JSON.stringify(next))
    notePdfPlace(hex)
    return true
  } catch { return false }
}

/** Reconcile the account before original pages first paint, bounded by the established PDF place owner. */
export async function openPdfOriginalPlace(hex: string, owner: string): Promise<OriginalPagePlace | null> {
  if (userBookOwner() !== owner) return null
  await reconcilePdfPlace(hex).catch(() => {})
  return readPdfOriginalPlace(hex)
}
