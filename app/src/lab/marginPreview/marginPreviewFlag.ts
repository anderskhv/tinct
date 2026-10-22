/**
 * Margin view is the default reader (launch, Anders 2026-10-22). Every registered book the margin view can open
 * (not the Bible, not a reader's own book) opens in it: the margin reader's frame on a desktop, the phone reader's
 * margin mode on a phone (marginPreviewMount.ts). Before the launch it was an opt-in (`margin=1`, the sticky
 * `tinct:margin-preview`, 2026-10-19), which no longer decides anything.
 *
 * The way back is the device's Classic reader choice (`tinct:classic-reader` = "1"): the book reader, as it was.
 * The setting writes it; `margin=0` stores it too (support and QA, and Back to normal reader from the margin view),
 * and `margin=1` clears it and opens margin view. Either flag is dropped from the address.
 *
 * Pure decision plus a thin page wrapper; no reader state is touched.
 */
export const CLASSIC_READER_KEY = 'tinct:classic-reader'
/** The pre-launch opt-in key; still listed by checks that sort the preview's own storage. Not read. */
export const MARGIN_PREVIEW_KEY = 'tinct:margin-preview'
export const MARGIN_PREVIEW_PARAM = 'margin'
/** The tab's book hand-off from the library (labReaderHandoff.ts LAB_READER_HANDOFF_KEY). */
const HANDOFF_KEY = 'tinct:lab-reader-handoff'
/** The reader's places on this device (labPosition.ts LAB_POSITION_STORAGE_KEY): `lastSettledBookId` is the book a bare /reader resumes. */
const POSITION_KEY = 'tinct-lab-position'

/**
 * Links that open by their own rules keep the book reader for that visit: a shared quote, a held edition, a
 * Checkout return, a reader's own book, and Two-page or Compare from the margin view (`view`). A chapter deep
 * link (`book` and `chapter`) opens margin view at that chapter.
 */
const OWN_RULES = ['share', 'heldBook', 'modern', 'session_id', 'userBook', 'view'] as const
/**
 * The place a link opens at (`book`, `chapter`, and optionally `edition`, `paragraph`, `word`): read once, then
 * dropped from the address so a reload keeps margin view's own place.
 */
const PLACE_KEYS = ['edition', 'chapter', 'paragraph', 'word'] as const

export interface MarginPreviewAt {
  editionKey: string | null
  chapterNumber: number
  paragraphIndex: number
  wordIndex: number
}

export interface MarginPreviewDecision {
  /** The registered book to open in margin view, or null: the book reader, unchanged. */
  bookId: string | null
  /** The device's Classic reader choice: 'set' (store it), 'clear' (remove it), or null (leave it). */
  classic: 'set' | 'clear' | null
  /** A replacement query string ('' for none), or null to leave the address as it is. */
  search: string | null
  /** The tab's library hand-off named the book: it is used up here. */
  consumeHandoff: boolean
  /** The place the link names, or none: margin view's own place. */
  at?: MarginPreviewAt
}

export const NO_PREVIEW: MarginPreviewDecision = { bookId: null, classic: null, search: null, consumeHandoff: false }

const count = (text: string | null, min: number) => text !== null && /^\d{1,6}$/.test(text) && Number(text) >= min ? Number(text) : null

export function decideMarginPreview(input: {
  search: string
  /** This device chose the Classic reader. */
  classic: boolean
  /** The book the tab's library hand-off names, if any. */
  handoffBookId?: string | null
  /** The book this device last read (a bare /reader resumes it), if any. */
  lastBookId?: string | null
  /** A registered book margin view can open (not the Bible, not a reader's own book). */
  isPreviewBook: (bookId: string) => boolean
}): MarginPreviewDecision {
  let params: URLSearchParams
  try { params = new URLSearchParams(input.search) } catch { return NO_PREVIEW }
  const flag = params.get(MARGIN_PREVIEW_PARAM)
  if (flag === '0') {
    params.delete(MARGIN_PREVIEW_PARAM)
    const rest = params.toString()
    return { bookId: null, classic: input.classic ? null : 'set', search: rest ? `?${rest}` : '', consumeHandoff: false }
  }
  const explicit = flag === '1'
  if (!explicit && input.classic) return NO_PREVIEW
  const classic = explicit && input.classic ? 'clear' as const : null
  const none = { ...NO_PREVIEW, classic }
  if (OWN_RULES.some(key => params.has(key))) return none
  const named = params.get('book')
  // A chapter with no book is the Bible's (the reader's default book): its own reader.
  if (!named && params.has('chapter')) return none
  if (named) {
    if (!input.isPreviewBook(named)) return none
    const chapterNumber = count(params.get('chapter'), 1)
    if (chapterNumber === null) return { bookId: named, classic, search: null, consumeHandoff: false }
    const at = { editionKey: params.get('edition') || null, chapterNumber, paragraphIndex: count(params.get('paragraph'), 0) ?? 0, wordIndex: count(params.get('word'), 0) ?? 0 }
    for (const key of PLACE_KEYS) params.delete(key)
    return { bookId: named, classic, search: `?${params.toString()}`, consumeHandoff: false, at }
  }
  const handed = input.handoffBookId
  if (handed) {
    if (!input.isPreviewBook(handed)) return none
    params.set('book', handed)
    return { bookId: handed, classic, search: `?${params.toString()}`, consumeHandoff: true }
  }
  const last = input.lastBookId
  if (last && input.isPreviewBook(last)) {
    params.set('book', last)
    return { bookId: last, classic, search: `?${params.toString()}`, consumeHandoff: false }
  }
  return none
}

/** The book a stored position record resumes (`lastSettledBookId`), read only. */
export function lastBookIdOf(raw: string | null): string | null {
  if (!raw) return null
  try {
    const value = JSON.parse(raw) as { lastSettledBookId?: unknown }
    return typeof value?.lastSettledBookId === 'string' && value.lastSettledBookId ? value.lastSettledBookId : null
  } catch {
    return null
  }
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

/** This device chose the Classic reader (the setting, or `margin=0`). */
export function classicReaderChosen(): boolean {
  try { return localStorage.getItem(CLASSIC_READER_KEY) === '1' } catch { return false }
}

/** Store or remove the device's Classic reader choice. */
export function setClassicReader(on: boolean): void {
  try {
    if (on) localStorage.setItem(CLASSIC_READER_KEY, '1')
    else localStorage.removeItem(CLASSIC_READER_KEY)
  } catch { /* a device convenience only */ }
}

/** Read this page's inputs (the address, the Classic reader choice, the hand-off, the last book) and decide. */
export function marginPreviewDecisionForPage(isPreviewBook: (bookId: string) => boolean): MarginPreviewDecision {
  const search = window.location.search
  const classic = classicReaderChosen()
  // Cheap exit: the Classic reader and no flag leave the page exactly as before.
  if (classic && !new URLSearchParams(search).has(MARGIN_PREVIEW_PARAM)) return NO_PREVIEW
  let handoff: string | null = null
  try { handoff = sessionStorage.getItem(HANDOFF_KEY) } catch { /* none */ }
  let position: string | null = null
  try { position = localStorage.getItem(POSITION_KEY) } catch { /* none */ }
  const decision = decideMarginPreview({ search, classic, handoffBookId: handoffBookIdOf(handoff), lastBookId: lastBookIdOf(position), isPreviewBook })
  if (decision.classic) setClassicReader(decision.classic === 'set')
  return decision
}

/**
 * Decide for this page and apply the decision (the Classic reader choice, the address, the used hand-off).
 * -> the book to open in margin view, or null for the book reader.
 */
export function marginPreviewBookForPage(isPreviewBook: (bookId: string) => boolean): string | null {
  if (typeof window === 'undefined') return null
  const decision = marginPreviewDecisionForPage(isPreviewBook)
  pageAt = decision.bookId && decision.at ? decision.at : null
  if (decision.consumeHandoff) {
    try { sessionStorage.removeItem(HANDOFF_KEY) } catch { /* the address names the book */ }
  }
  if (decision.search !== null) {
    try { window.history.replaceState(window.history.state, '', window.location.pathname + decision.search + window.location.hash) } catch { /* only a reload would differ */ }
  }
  return decision.bookId
}
