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
export type DesktopLayoutDevice = { userAgent?: string; platform?: string; maxTouchPoints?: number; landscape?: boolean; width?: number; screenShortSide?: number }

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
    width: window.innerWidth,
    ...(window.screen?.width > 0 && window.screen?.height > 0 ? { screenShortSide: Math.min(window.screen.width, window.screen.height) } : {}),
  }
}

/** The kinds of device the reader's default layout is decided for (Anders, 4 Nov 2026). */
export type ReaderDeviceClass = 'desktop' | 'ipad-landscape' | 'ipad-portrait' | 'phone-landscape' | 'phone-portrait'

/**
 * A phone: an iPhone, an Android phone (an Android tablet leaves `Mobile` out
 * of its user agent), or a touch screen whose short side is a phone's (at most
 * 500 CSS px; the smallest iPad's is 744).
 */
function isPhoneDevice({ userAgent = '', maxTouchPoints = 0, screenShortSide }: DesktopLayoutDevice): boolean {
  if (/iPhone|iPod/i.test(userAgent)) return true
  if (/\bAndroid\b/.test(userAgent) && /\bMobile\b/.test(userAgent)) return true
  return maxTouchPoints > 0 && typeof screenShortSide === 'number' && screenShortSide > 0 && screenShortSide <= 500
}

export function readerDeviceClass(device: DesktopLayoutDevice): ReaderDeviceClass {
  if (isPhoneDevice(device)) return device.landscape ? 'phone-landscape' : 'phone-portrait'
  if (isIpadLandscape({ ...device, landscape: true })) return device.landscape ? 'ipad-landscape' : 'ipad-portrait'
  return 'desktop'
}

/**
 * The layout of a reader who has made no choice (Anders, 4 Nov 2026): the
 * Margin reader on the desktop for every kind of book, on an iPad held upright
 * and on a phone held sideways; Two-page on an iPad in landscape, where the
 * spread is the open book in the hands. A phone upright reads the phone reader.
 */
export function defaultDesktopReaderLayout(device: DesktopLayoutDevice = desktopLayoutDevice()): 'margin' | 'two-page' {
  return readerDeviceClass(device) === 'ipad-landscape' ? 'two-page' : 'margin'
}

/**
 * The narrowest window each handheld reads the Margin reader in: an iPhone
 * mini sideways (780 CSS px) and up, every iPad upright (744 and up). A smaller
 * phone sideways, or an iPad window in Split View, keeps the phone reader.
 */
const HANDHELD_MARGIN_MIN_WIDTH = { 'phone-landscape': 740, 'ipad-portrait': 740 } as const

/**
 * Whether a handheld whose own surface is the phone reader reads the Margin
 * reader instead (Anders, 4 Nov 2026): a phone held sideways and an iPad held
 * upright, in the Margin layout only. A reader who chose Two-page or Compare
 * for the book (or Compare on the phone) keeps the phone reader there, as before.
 */
export function readsMarginOnHandheld(device: DesktopLayoutDevice, layout: DesktopReaderLayout, phoneCompare = false): boolean {
  const deviceClass = readerDeviceClass(device)
  if (deviceClass !== 'phone-landscape' && deviceClass !== 'ipad-portrait') return false
  if (typeof device.width === 'number' && device.width < HANDHELD_MARGIN_MIN_WIDTH[deviceClass]) return false
  return layout === 'margin' && !phoneCompare
}

/** An iPad upright reading the Margin reader gives the text more room: no chapter map at the left edge, a narrower card column (continuousReader.css). */
export function marginReaderRoom(device: DesktopLayoutDevice, handheldMargin: boolean): 'tablet-portrait' | undefined {
  return handheldMargin && readerDeviceClass(device) === 'ipad-portrait' ? 'tablet-portrait' : undefined
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
