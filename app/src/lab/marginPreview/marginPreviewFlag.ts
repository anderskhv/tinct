/**
 * The margin preview's flag (Anders, 2026-10-19): `/reader?book=<id>&margin=1`
 * opens a registered book in the margin reader (public/lab/addbook) instead
 * of the book reader, for testing only. Visiting with `margin=1` also stores a
 * sticky opt-in on this device (`tinct:margin-preview`), so a later
 * `/reader?book=<id>` (or a book opened from the library) opens in the preview
 * too; `margin=0` turns it off again. Without the flag and without the
 * opt-in, nothing here runs and /reader is exactly the book reader.
 *
 * Pure decision plus a thin page wrapper; no reader state is touched.
 */
export const MARGIN_PREVIEW_KEY = 'tinct:margin-preview'
export const MARGIN_PREVIEW_PARAM = 'margin'
/** The tab's book hand-off from the library (labReaderHandoff.ts LAB_READER_HANDOFF_KEY). */
const HANDOFF_KEY = 'tinct:lab-reader-handoff'

/**
 * Links that open by their own rules keep the book reader even with the
 * opt-in: a chapter deep link, a shared quote, a held edition, a Checkout
 * return, a reader's own book.
 */
const OWN_RULES = ['chapter', 'share', 'heldBook', 'modern', 'session_id', 'userBook', 'view'] as const
/**
 * The place a `margin=1` link opens at (Margin from the book reader, Anders 2026-10-20): read once, then
 * dropped from the address so a reload keeps the preview's own place. `view` (Two-page or Compare from the
 * preview) is one of the own rules above: that link opens the book reader once and leaves the opt-in alone.
 */
const PLACE_KEYS = ['edition', 'chapter', 'paragraph', 'word'] as const

export interface MarginPreviewAt {
  editionKey: string | null
  chapterNumber: number
  paragraphIndex: number
  wordIndex: number
}

export interface MarginPreviewDecision {
  /** The registered book to open in the preview, or null: the book reader, unchanged. */
  bookId: string | null
  /** What to store as the sticky opt-in: 'on', 'off' (remove), or null (leave). */
  sticky: 'on' | 'off' | null
  /** A replacement query string ('' for none), or null to leave the address as it is. */
  search: string | null
  /** The tab's library hand-off named the book: it is used up here. */
  consumeHandoff: boolean
  /** The place the link names (Margin from the book reader), or none: the preview's own place. */
  at?: MarginPreviewAt
}

export const NO_PREVIEW: MarginPreviewDecision = { bookId: null, sticky: null, search: null, consumeHandoff: false }

const count = (text: string | null, min: number) => text !== null && /^\d{1,6}$/.test(text) && Number(text) >= min ? Number(text) : null

export function decideMarginPreview(input: {
  search: string
  sticky: boolean
  /** The book the tab's library hand-off names, if any. */
  handoffBookId?: string | null
  /** A registered book the preview can open (not the Bible, not a reader's own book). */
  isPreviewBook: (bookId: string) => boolean
}): MarginPreviewDecision {
  let params: URLSearchParams
  try { params = new URLSearchParams(input.search) } catch { return NO_PREVIEW }
  const flag = params.get(MARGIN_PREVIEW_PARAM)
  if (flag === '0') {
    params.delete(MARGIN_PREVIEW_PARAM)
    const rest = params.toString()
    return { bookId: null, sticky: input.sticky ? 'off' : null, search: rest ? `?${rest}` : '', consumeHandoff: false }
  }
  const explicit = flag === '1'
  if (!explicit && !input.sticky) return NO_PREVIEW
  const sticky = explicit && !input.sticky ? 'on' as const : null
  // Margin from the book reader names its place: the preview opens there (once).
  let at: MarginPreviewAt | undefined
  const chapterNumber = explicit && params.has('book') ? count(params.get('chapter'), 1) : null
  if (chapterNumber !== null) {
    at = { editionKey: params.get('edition') || null, chapterNumber, paragraphIndex: count(params.get('paragraph'), 0) ?? 0, wordIndex: count(params.get('word'), 0) ?? 0 }
    for (const key of PLACE_KEYS) params.delete(key)
  }
  if (OWN_RULES.some(key => params.has(key))) return { ...NO_PREVIEW, sticky }
  const named = params.get('book')
  if (named && at) return input.isPreviewBook(named) ? { bookId: named, sticky, search: `?${params.toString()}`, consumeHandoff: false, at } : { ...NO_PREVIEW, sticky }
  if (named) return { bookId: input.isPreviewBook(named) ? named : null, sticky, search: null, consumeHandoff: false }
  const handed = input.handoffBookId
  if (handed && input.isPreviewBook(handed)) {
    params.set('book', handed)
    return { bookId: handed, sticky, search: `?${params.toString()}`, consumeHandoff: true }
  }
  return { ...NO_PREVIEW, sticky }
}

/** The book a stored library hand-off names, read without using it up. */
export function handoffBookIdOf(raw: string | null): string | null {
  if (!raw) return null
  try {
    const value = JSON.parse(raw) as { kind?: unknown; bookId?: unknown }
    return value?.kind === 'open-reader' && typeof value.bookId === 'string' ? value.bookId : null
  } catch {
    return null
  }
}

let pageAt: MarginPreviewAt | null = null
/** The place this page's link named for the preview (Margin from the book reader); the address no longer has it. */
export function marginPreviewAtForPage(): MarginPreviewAt | null {
  return pageAt
}

/** The opt-in is on for this device (the book reader then offers Margin among its layouts). */
export function marginPreviewOptedIn(): boolean {
  try { return localStorage.getItem(MARGIN_PREVIEW_KEY) === '1' } catch { return false }
}

/**
 * Decide for this page and apply the decision (the opt-in, the address, the
 * used hand-off). -> the book to preview, or null for the book reader.
 */
export function marginPreviewBookForPage(isPreviewBook: (bookId: string) => boolean): string | null {
  if (typeof window === 'undefined') return null
  let sticky = false
  try { sticky = localStorage.getItem(MARGIN_PREVIEW_KEY) === '1' } catch { /* no opt-in */ }
  const search = window.location.search
  // Cheap exit: no flag and no opt-in leaves the page exactly as before.
  if (!sticky && !new URLSearchParams(search).has(MARGIN_PREVIEW_PARAM)) return null
  let handoff: string | null = null
  try { handoff = sessionStorage.getItem(HANDOFF_KEY) } catch { /* none */ }
  const decision = decideMarginPreview({ search, sticky, handoffBookId: handoffBookIdOf(handoff), isPreviewBook })
  try {
    if (decision.sticky === 'on') localStorage.setItem(MARGIN_PREVIEW_KEY, '1')
    if (decision.sticky === 'off') localStorage.removeItem(MARGIN_PREVIEW_KEY)
  } catch { /* a device convenience only */ }
  pageAt = decision.bookId && decision.at ? decision.at : null
  if (decision.consumeHandoff) {
    try { sessionStorage.removeItem(HANDOFF_KEY) } catch { /* the address names the book */ }
  }
  if (decision.search !== null) {
    try { window.history.replaceState(window.history.state, '', window.location.pathname + decision.search + window.location.hash) } catch { /* only a reload would differ */ }
  }
  return decision.bookId
}
