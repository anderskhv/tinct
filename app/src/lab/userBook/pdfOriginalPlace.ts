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

/** PDF scale is a device preference in the existing page-place record, never an account place update. */
export function readPdfOriginalZoom(hex: string, owner: string): number {
  if (userBookOwner() !== owner) return 1
  try {
    const zoom = JSON.parse(localStorage.getItem(key(hex)) || 'null')?.zoom
    return typeof zoom === 'number' && Number.isFinite(zoom) && zoom >= 0.5 && zoom <= 3 ? zoom : 1
  } catch { return 1 }
}

export function notePdfOriginalZoom(hex: string, owner: string, zoom: number): boolean {
  if (userBookOwner() !== owner || !Number.isFinite(zoom) || zoom < 0.5 || zoom > 3) return false
  try {
    const previous = JSON.parse(localStorage.getItem(key(hex)) || '{}') as Record<string, unknown>
    if (previous.zoom === zoom) return false
    localStorage.setItem(key(hex), JSON.stringify({ ...previous, zoom }))
    return true
  } catch { return false }
}

/** The page viewer owns PDF place, preserving rev/zoom and clearing stale text coordinates after a page move. */
export function notePdfOriginalPlace(hex: string, owner: string, place: OriginalPagePlace, pages?: number, force = false): boolean {
  if (userBookOwner() !== owner || !Number.isInteger(place.page) || place.page < 1 || !Number.isFinite(place.frac)) return false
  try {
    const previous = JSON.parse(localStorage.getItem(key(hex)) || '{}') as Record<string, unknown>
    const frac = Math.max(0, Math.min(1, place.frac))
    if (!force && previous.page === place.page && typeof previous.frac === 'number' && Math.abs(previous.frac - frac) <= 0.02) return false
    const next: Record<string, unknown> = { ...previous, page: place.page, frac, edition: 'p', at: Date.now(), ...(pages && Number.isInteger(pages) ? { pages } : {}) }
    delete next.chapterNumber; delete next.paragraphIndex; delete next.wordIndex; delete next.converter
    localStorage.setItem(key(hex), JSON.stringify(next))
    notePdfPlace(hex)
    return true
  } catch { return false }
}

/** Reconcile the account before original pages first paint, bounded by the established PDF place owner. */
export async function openPdfOriginalPlace(hex: string, owner: string): Promise<OriginalPagePlace | null> {
  if (userBookOwner() !== owner) return null
  await reconcilePdfPlace(hex, { owner }).catch(() => {})
  return userBookOwner() === owner ? readPdfOriginalPlace(hex) : null
}
