/**
 * Public-domain books readers added to Tinct (`pd-…` ids, worker/routes/publicBooks.ts)
 * in the reader. Their registry facts live on the server, not in bookRegistry.ts,
 * so the reader registers a book before it is used: from `/api/public-books/{id}`
 * on demand (loadLabBookSource, readerDestination), and before the first render
 * when the hand-off or a saved place names one (main.tsx), because the reader's
 * boot reads the registry synchronously. Edition text is then fetched like any
 * other edition (`/data/editions/{id}-{key}.json`, served from R2 by the Worker).
 * Registration mirrors nativeBooks.ts: the book joins BOOKS and the pre-reader catalogue.
 */
import { BOOKS } from '../data/bookRegistry'
import { PRE_READER_CATALOGUE, type PreReaderBookViewModel } from '../preReader/catalogue'
import type { QuickBookCatalogueEntry } from '../preReader/quickBookSwitcher'
import type { Book, Edition } from '../types'
import { apiUrl } from './apiUrl'
import { modernReturnFromParams } from '../lab/labModernEditionApi'
import { isPublicBookId, modernEditionsEnabled, PUBLIC_BOOKS_INDEX_FETCH, PUBLIC_BOOKS_INDEX_URL } from '../../public/lab/public-books.js'

export { isPublicBookId }

export interface PublicEntry {
  id: string
  title: string
  author: string
  summary?: string
  year?: number | null
  wordCount?: number | null
  cover?: { background?: string; accent?: string }
  editions: Array<{ key: string; language: string; style?: string; label: string; translator?: string | null; year?: number | null }>
}

/** The registry Book an index entry describes (the same fields the server's `book` has). */
export function bookFromEntry(entry: PublicEntry): Book {
  return {
    id: entry.id,
    title: entry.title,
    author: entry.author,
    ...(entry.summary ? { description: entry.summary } : {}),
    ...(typeof entry.year === 'number' ? { year: entry.year } : {}),
    ...(typeof entry.wordCount === 'number' ? { wordCount: entry.wordCount } : {}),
    coverColor: entry.cover?.background,
    coverAccent: entry.cover?.accent,
    editions: entry.editions.map(edition => ({
      key: edition.key,
      language: edition.language as Edition['language'],
      style: 'original',
      label: edition.label,
      aligned: false,
      hasAudio: false,
      ...(edition.translator ? { translator: edition.translator } : {}),
      ...(typeof edition.year === 'number' ? { year: edition.year } : {}),
    })),
  }
}

/** Adds (or refreshes) one public book in the registry and the pre-reader catalogue. */
export function registerPublicBook(book: Book, entry?: unknown): void {
  if (!isPublicBookId(book.id) || book.id !== book.id.trim()) return
  // A paid Modern English edition is offered only where the device sees the feature.
  if (!modernEditionsEnabled() && book.editions.some(edition => edition.key === 'modern-en')) {
    book = { ...book, editions: book.editions.filter(edition => edition.key !== 'modern-en') }
    const editions = (entry as { editions?: Array<{ key?: string }> } | undefined)?.editions
    if (Array.isArray(editions)) entry = { ...(entry as object), editions: editions.filter(edition => edition?.key !== 'modern-en') }
  }
  const existing = BOOKS.find(item => item.id === book.id)
  if (existing) Object.assign(existing, book)
  else BOOKS.push(book)
  if (entry && typeof entry === 'object' && (entry as { id?: unknown }).id === book.id) {
    const byId = PRE_READER_CATALOGUE.booksById as Map<string, PreReaderBookViewModel>
    const view = entry as PreReaderBookViewModel
    const old = byId.get(book.id)
    if (old) Object.assign(old, view)
    else { PRE_READER_CATALOGUE.books.push(view); byId.set(book.id, view) }
  }
}

const pending = new Map<string, Promise<void>>()

async function fetchAndRegister(bookId: string, fetchImpl: typeof fetch): Promise<void> {
  // Revalidated: a copy cached before the book was added would still be a 404 or an older entry.
  const response = await fetchImpl(apiUrl(`/api/public-books/${encodeURIComponent(bookId)}`), PUBLIC_BOOKS_INDEX_FETCH)
  if (!response.ok) throw new Error(`public book ${response.status}`)
  const data = await response.json() as { book?: Book; entry?: unknown }
  if (!data.book || data.book.id !== bookId) throw new Error('public book malformed')
  registerPublicBook(data.book, data.entry)
}

/** Registers a public book again from the server (its editions changed, e.g. a Modern English edition was bought). */
export function refreshPublicBook(bookId: string, fetchImpl: typeof fetch = fetch): Promise<void> {
  if (!isPublicBookId(bookId)) return Promise.resolve()
  return fetchAndRegister(bookId, fetchImpl)
}

/** Makes sure a `pd-` book is registered; registry books and other ids return at once. */
export function ensurePublicBook(bookId: string, fetchImpl: typeof fetch = fetch): Promise<void> {
  if (!isPublicBookId(bookId) || BOOKS.some(book => book.id === bookId)) return Promise.resolve()
  let job = pending.get(bookId)
  if (!job) {
    job = fetchAndRegister(bookId, fetchImpl).finally(() => pending.delete(bookId))
    pending.set(bookId, job)
  }
  return job
}

/** A cover served by the Worker (`/api/public-books/{id}/cover`) needs the API host in the Android app. */
function coverUrl(src: string): string {
  return src.startsWith('/api/') ? apiUrl(src) : src
}

/**
 * An added book's entry as the reader's Reading now sheet uses it: title,
 * painted art (absent until one is painted), the generated cover's tone and
 * its chapter list. Null for anything that is not a `pd-` entry with a title.
 */
export function quickPublicEntry(raw: unknown): QuickBookCatalogueEntry | null {
  const entry = raw as Partial<QuickBookCatalogueEntry> | null
  if (!entry || !isPublicBookId(entry.id) || typeof entry.title !== 'string' || !entry.title.trim()) return null
  const art = entry.art && typeof entry.art.src === 'string' && entry.art.src
    ? { src: coverUrl(entry.art.src), ...(entry.art.srcSet ? { srcSet: entry.art.srcSet.split(',').map(part => coverUrl(part.trim())).join(', ') } : {}) }
    : null
  return {
    id: entry.id,
    title: entry.title.trim(),
    art,
    cover: entry.cover?.background ? { background: entry.cover.background } : null,
    readingStructure: entry.readingStructure ?? null,
  }
}

/** Every added book registered on this page (the current one, and any a saved place named). */
export function registeredPublicEntries(): QuickBookCatalogueEntry[] {
  return PRE_READER_CATALOGUE.books.flatMap(book => quickPublicEntry(book) ?? [])
}

/** The painted cover of a registered added book, or null (no painting yet, or not registered). */
export function registeredPublicCover(bookId: string): string | null {
  if (!isPublicBookId(bookId)) return null
  return quickPublicEntry((PRE_READER_CATALOGUE.booksById as Map<string, unknown>).get(bookId))?.art?.src ?? null
}

/** The whole public-books index as Reading now entries, or null when it could not be read. */
export async function fetchPublicBooksIndex(fetchImpl: typeof fetch = fetch): Promise<QuickBookCatalogueEntry[] | null> {
  try {
    const response = await fetchImpl(apiUrl(PUBLIC_BOOKS_INDEX_URL), PUBLIC_BOOKS_INDEX_FETCH)
    if (!response.ok) return null
    const data = await response.json() as { books?: unknown }
    if (!Array.isArray(data.books)) return null
    return data.books.flatMap(entry => quickPublicEntry(entry) ?? [])
  } catch {
    return null
  }
}

/** True when stored reader state (hand-off, saved places) names a public book. */
export function mentionsPublicBook(...raw: Array<string | null | undefined>): boolean {
  return raw.some(value => typeof value === 'string' && /"pd-[a-z]{2,4}-/.test(value))
}

export const READER_HANDOFF_KEY = 'tinct:lab-reader-handoff'

/** The added (`pd-`) book a library hand-off opens, or null. */
export function handoffPublicBookId(raw: string | null | undefined): string | null {
  if (!raw) return null
  try {
    const value = JSON.parse(raw) as { kind?: unknown; bookId?: unknown } | null
    return value?.kind === 'open-reader' && isPublicBookId(value.bookId) ? value.bookId : null
  } catch {
    return null
  }
}

/** This tab's hand-off book, when it is an added one. */
export function pendingHandoffPublicBook(): string | null {
  try { return handoffPublicBookId(sessionStorage.getItem(READER_HANDOFF_KEY)) } catch { return null }
}

/** Registers one book, asking once more after a moment (a book committed a second ago, a dropped request). */
async function ensureWithRetry(bookId: string, fetchImpl: typeof fetch): Promise<void> {
  try { await ensurePublicBook(bookId, fetchImpl) } catch {
    await new Promise(resolve => setTimeout(resolve, 800))
    await ensurePublicBook(bookId, fetchImpl)
  }
}

/**
 * Before the reader's first render: register the book the hand-off opens
 * directly from `/api/public-books/{id}` (a book added a moment ago is not in
 * a cached index; the reader then opened another book, QA 2026-10-08), and
 * every added book when the saved places name one (one small index request).
 * Never throws; a failure leaves the reader's usual fallbacks.
 */
export async function preloadPublicBooksForReader(fetchImpl: typeof fetch = fetch, search: string = typeof location === 'undefined' ? '' : location.search): Promise<void> {
  // A Checkout return (`?book=pd-…&modern=…`, labModernEditionApi) opens that book,
  // in this tab or any other: it is registered first, on its own.
  const returned = modernReturnFromParams(new URLSearchParams(search))
  const named = returned ? ensurePublicBook(returned.bookId, fetchImpl).catch(() => {}) : null
  let raw: Array<string | null> = []
  try { raw = [sessionStorage.getItem(READER_HANDOFF_KEY), localStorage.getItem('tinct-lab-position')] } catch { await named; return }
  const handoffBook = handoffPublicBookId(raw[0])
  const opened = handoffBook ? ensureWithRetry(handoffBook, fetchImpl).catch(() => {}) : null
  if (!mentionsPublicBook(...raw)) { await Promise.all([named, opened]); return }
  try {
    const response = await fetchImpl(apiUrl(PUBLIC_BOOKS_INDEX_URL), PUBLIC_BOOKS_INDEX_FETCH)
    if (response.ok) {
      const data = await response.json() as { books?: PublicEntry[] }
      // The hand-off's own book is registered from its own record (above), never replaced by an index copy.
      for (const entry of data.books ?? []) if (isPublicBookId(entry?.id) && entry.id !== handoffBook) registerPublicBook(bookFromEntry(entry), entry)
    }
  } catch { /* the reader falls back as for any unknown book */ }
  await Promise.all([named, opened])
}

/** How long the reader's first render waits for added books in general, and for the hand-off's own book. */
export const READER_PRELOAD_WAIT_MS = 4000
export const READER_HANDOFF_BOOK_WAIT_MS = 15_000

/**
 * main.tsx before the reader renders: the preload, bounded. A hand-off that opens an added
 * book waits for that book longer, and never renders without it: the reader would drop the
 * hand-off and open another book. Returns the book's id when it still could not be
 * registered (the caller sends the reader to the book in the library), else null.
 */
export async function preparePublicBooksForReader(options: { fetchImpl?: typeof fetch; search?: string; wait?: number; handoffWait?: number } = {}): Promise<string | null> {
  const handoffBook = pendingHandoffPublicBook()
  const preload = preloadPublicBooksForReader(options.fetchImpl ?? fetch, options.search)
  const wait = handoffBook ? options.handoffWait ?? READER_HANDOFF_BOOK_WAIT_MS : options.wait ?? READER_PRELOAD_WAIT_MS
  let timer: ReturnType<typeof setTimeout> | undefined
  await Promise.race([preload, new Promise(resolve => { timer = setTimeout(resolve, wait) })])
  clearTimeout(timer)
  return handoffBook && !publicBookRegistered(handoffBook) ? handoffBook : null
}

/** True when the book is registered for the reader (its registry entry and its pre-reader entry). */
export function publicBookRegistered(bookId: string): boolean {
  return BOOKS.some(book => book.id === bookId) && (PRE_READER_CATALOGUE.booksById as Map<string, unknown>).has(bookId)
}
