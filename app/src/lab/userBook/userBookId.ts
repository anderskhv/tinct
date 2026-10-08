/**
 * Identity of a reader's own book (an EPUB opened on /lab/addbook/) inside the
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
 * Add a book's page for one own book: a PDF opens in its viewer there (and a
 * reload of that URL reopens it at its place); an EPUB goes on to the reader;
 * a book kept only in the account is downloaded to this device first. Older
 * `/lab/addbook/?open=<pdf|epub>:<hex>` links still open the same book.
 */
export function ownBookOpenUrl(hex: string): string {
  return `/lab/addbook/?${USER_BOOK_QUERY}=${encodeURIComponent(hex)}`
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
