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

/** What the browser says about the device, for the default layout (`desktopLayoutDevice` reads it now). */
export type DesktopLayoutDevice = { userAgent?: string; platform?: string; maxTouchPoints?: number; landscape?: boolean }

/**
 * An iPad held sideways. iPadOS Safari reports a Mac user agent (and
 * `MacIntel`), so a Mac identity with more than one touch point is an iPad;
 * a Mac has no touch screen (the rule of photoAccept.isAppleTouchDevice).
 */
export function isIpadLandscape({ userAgent = '', platform = '', maxTouchPoints = 0, landscape = false }: DesktopLayoutDevice): boolean {
  if (!landscape) return false
  if (/\biPad\b/.test(userAgent)) return true
  const mac = platform === 'MacIntel' || /\bMacintosh\b/.test(userAgent)
  return mac && maxTouchPoints > 1
}

export function desktopLayoutDevice(): DesktopLayoutDevice {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return {}
  return {
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    maxTouchPoints: navigator.maxTouchPoints,
    landscape: window.innerWidth > window.innerHeight,
  }
}

/**
 * The layout of a reader who has made no choice (Anders, 4 Nov 2026): the
 * Margin reader on the desktop for every kind of book; Two-page on an iPad in
 * landscape, where the spread is the open book in the hands.
 */
export function defaultDesktopReaderLayout(device: DesktopLayoutDevice = desktopLayoutDevice()): 'margin' | 'two-page' {
  return isIpadLandscape(device) ? 'two-page' : 'margin'
}

type DesktopLayoutInput = { bookId: string; search?: string; kind?: string; hex?: string; savedMode?: 'read' | 'compare' | null }

/** The reader's own choice for this book, if any: a `view=` link, the stored layout, or an older explicit choice. */
export function chosenDesktopReaderLayout({ bookId, search = '', kind, hex, savedMode }: DesktopLayoutInput): DesktopReaderLayout | null {
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
  return null
}

export function initialDesktopReaderLayout(input: DesktopLayoutInput & { device?: DesktopLayoutDevice }): DesktopReaderLayout {
  return chosenDesktopReaderLayout(input) ?? defaultDesktopReaderLayout(input.device)
}
