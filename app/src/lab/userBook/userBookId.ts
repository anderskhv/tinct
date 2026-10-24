/**
 * Identity of a reader's own book (an EPUB or PDF a reader added) inside the
 * Tinct reader. Pure: no browser APIs.
 *
 * A user book is keyed by the first 24 hex digits of its file's SHA-256, the
 * same key Add a book uses for its IndexedDB record (`epub:<hex>`) and for the
 * account copy, so the same file has the same id on every device. Its book id
 * in the reader is `userbook-<hex>`: never a registry id, and the one test
 * every outgoing path (cloud sync, analytics, companion book lookups) uses to
 * keep a reader's own book on this device.
 */
export const USER_BOOK_PREFIX = 'userbook-'
export const USER_BOOK_QUERY = 'userBook'
const HEX_RE = /^[0-9a-f]{8,64}$/

export function isUserBookHex(value: unknown): value is string {
  return typeof value === 'string' && HEX_RE.test(value)
}

export function userBookId(hex: string): string {
  return USER_BOOK_PREFIX + hex
}

export function isUserBookId(bookId: unknown): bookId is string {
  return typeof bookId === 'string' && bookId.startsWith(USER_BOOK_PREFIX) && HEX_RE.test(bookId.slice(USER_BOOK_PREFIX.length))
}

export function userBookHex(bookId: string): string | null {
  return isUserBookId(bookId) ? bookId.slice(USER_BOOK_PREFIX.length) : null
}

/** The `?userBook=<hex>` of a reader URL, or null. */
export function userBookFromSearch(search: string | null | undefined): string | null {
  try {
    const value = new URLSearchParams(search || '').get(USER_BOOK_QUERY)
    return isUserBookHex(value) ? value : null
  } catch {
    return null
  }
}

/** The reader URL for a user book. */
export function userBookReaderUrl(hex: string): string {
  return `/reader?${USER_BOOK_QUERY}=${encodeURIComponent(hex)}`
}

/**
 * Where the back arrow from a reader's own book goes (EPUB in the reader, PDF
 * in Add a book's viewer) and every "your books" link: the library's My shelf,
 * where "My private uploads" lists them and its + adds one. Add a book is no
 * longer a page of its own (owner, 2026-10-08). The one address is
 * `/library#my-shelf`; library_2 also opens My shelf for the alias
 * `/library?shelf=mine` (app.js).
 */
export const USER_BOOKS_SHELF_URL = '/library#my-shelf'

/**
 * One own book, one address (Anders, 22 Oct 2026, "One Tinct"): every own book
 * opens at `/reader?userBook=<hex>`, whatever its kind or view. On a desktop the
 * reader shows the margin reader in its frame (UserBookReader: an EPUB in Margin
 * view, a PDF's Original pages, a book not on this device yet) or the Tinct
 * reader (an EPUB or PDF converted to a Tinct book); a phone opens the Tinct
 * reader, or the margin reader's page for a PDF's pages. Older
 * `/lab/addbook/?userBook=<hex>` and `?open=<pdf|epub>:<hex>` links redirect here
 * (labRoute.ts legacyLabPageRedirect), keeping `page`, `frac` and `pages`.
 */
export function ownBookOpenUrl(hex: string): string {
  return userBookReaderUrl(hex)
}

/** What a link to an own book may carry on to the margin reader: Original pages' page, its fraction, "show the pages". */
export const OWN_BOOK_PASS_PARAMS = ['page', 'frac', 'pages'] as const

/**
 * The margin reader's page for one own book (book.html, served as `/lab/addbook/book`): the frame the
 * reader shows on a desktop, or the page a phone goes to for a PDF's pages. `search`: the reader URL's
 * query, whose `page`, `frac` and `pages` go along.
 */
export function ownBookFrameUrl(hex: string, search = ''): string {
  const params = new URLSearchParams({ [USER_BOOK_QUERY]: hex })
  let from: URLSearchParams
  try { from = new URLSearchParams(search) } catch { from = new URLSearchParams() }
  for (const key of OWN_BOOK_PASS_PARAMS) {
    const value = from.get(key)
    if (value !== null) params.set(key, value)
  }
  return `/lab/addbook/book?${params}`
}

/**
 * Where an own book opens: always its one address (ownBookOpenUrl); the reader there decides the view
 * from this device's choices (epubView.ts, pdfEditions.ts). The `kind` and `choice` arguments are kept
 * for callers that still pass them.
 */
export function ownBookHref(hex: string, _kind?: 'pdf' | 'epub' | null, _choice?: 'text' | 'pages' | 'margin' | null): string {
  return userBookReaderUrl(hex)
}

/** True when any string anywhere in `value` names a user book (analytics guard). */
export function mentionsUserBook(value: unknown, depth = 0): boolean {
  if (typeof value === 'string') return value.includes(USER_BOOK_PREFIX)
  if (!value || typeof value !== 'object' || depth > 4) return false
  for (const item of Array.isArray(value) ? value : Object.values(value)) {
    if (mentionsUserBook(item, depth + 1)) return true
  }
  return false
}
