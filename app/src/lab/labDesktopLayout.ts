import { readStoredCompareView } from './labPrefs'
import { readEpubViewChoice } from './userBook/epubView'

export type DesktopReaderLayout = 'margin' | 'two-page' | 'compare'
const KEY = 'tinct:reader-desktop-layout'
const isLayout = (value: unknown): value is DesktopReaderLayout => value === 'margin' || value === 'two-page' || value === 'compare'

/** Device-local book preference; clearLocalUserData removes this on sign-out/user change. */
export function readDesktopReaderLayout(bookId: string): DesktopReaderLayout | null {
  try {
    const value = JSON.parse(localStorage.getItem(KEY) || '{}')?.[bookId]
    return isLayout(value) ? value : null
  } catch { return null }
}

export function storeDesktopReaderLayout(bookId: string, layout: DesktopReaderLayout): void {
  try {
    let kept: unknown = {}
    try { kept = JSON.parse(localStorage.getItem(KEY) || '{}') } catch { /* Replace damaged data on an explicit choice. */ }
    localStorage.setItem(KEY, JSON.stringify({ ...(kept && typeof kept === 'object' && !Array.isArray(kept) ? kept : {}), [bookId]: layout }))
  } catch { /* A blocked device store must not prevent a layout change. */ }
}

export function initialDesktopReaderLayout({ bookId, search = '', kind, hex, savedMode }: {
  bookId: string; search?: string; kind?: string; hex?: string; savedMode?: 'read' | 'compare' | null
}): DesktopReaderLayout {
  const linked = new URLSearchParams(search).get('view')
  if (isLayout(linked)) return linked
  const kept = readDesktopReaderLayout(bookId)
  if (kept) return kept
  // Retain explicit choices made before the shared layout preference existed.
  if (hex && kind !== 'pdf') {
    const own = readEpubViewChoice(hex)
    if (own) return own === 'margin' ? 'margin' : 'two-page'
  }
  if (!hex) {
    const compare = readStoredCompareView('desktop', bookId)
    if (compare !== null) return compare ? 'compare' : 'margin'
    if (savedMode === 'compare') return 'compare'
  }
  return kind === 'pdf' ? 'margin' : 'two-page'
}
