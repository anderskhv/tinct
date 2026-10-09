/**
 * A reader's own books on every device of their account: what this device
 * keeps (Add a book's IndexedDB and `tinct-addbook:place:<hex>`) reconciled
 * with the account's private copies and places (ownAccount.ts).
 *
 * - A book removed on another device (saved to the account, no longer in its
 *   list) is forgotten here: the account's list is the record of what exists.
 * - A place is one whole tuple (chapter, paragraph, word) with the time it was
 *   read and the account revision this device last saw (`rev`). The newer
 *   place wins: an account place read later on another device replaces this
 *   device's, and this device's later place is saved to the account naming the
 *   revision it saw. A stale write is refused by the account and answered
 *   with its place, so no device overwrites a newer place blindly.
 *
 * - A PDF's place (Add a book's viewer, `tinct-addbook:pos:pdf:<hex>`) is its
 *   page and how far down it, kept and reconciled the same way: the newer
 *   place wins, a stale write is refused by the account, and this device's
 *   zoom stays its own.
 *
 * Nothing here names a book's title or text to the account, and nothing goes
 * to the shared position stores (lab-position, reading memory).
 */
import { accountBookKey, fetchAccountPlaceSets, listAccountBooks, ownBookToken, putAccountPagePlace, putAccountPlace, type AccountBook, type AccountPagePlace, type AccountPlace, type FetchLike } from './ownAccount'
import { PDF_PLACE_PREFIX, forgetRemovedOwnBooks, ownReading, pdfReading, placePercent, readOwnShelf, type OwnShelfBook } from './ownShelf'
import { ownBookOpenUrl, userBookReaderUrl } from './userBookId'
import type { UserBookChapter } from './userEdition'

const PLACE_PREFIX = 'tinct-addbook:place:'

interface KeptPlace {
  chapterNumber: number
  paragraphIndex: number
  wordIndex: number
  updatedAt: number
  percent?: number
  /** The conversion rules the place was read under (userBookPlace.ts): carried to the account and back. */
  converter?: number
  /** The account revision this device last saw for the book (0 or absent: none). */
  rev?: number
  /** The `updatedAt` of the last place the account accepted from this device. */
  savedAt?: number
}

function readKept(hex: string): KeptPlace | null {
  try {
    const raw = JSON.parse(localStorage.getItem(PLACE_PREFIX + hex) || 'null') as Partial<KeptPlace> | null
    if (!raw || typeof raw !== 'object' || !Number.isInteger(raw.chapterNumber) || !Number.isInteger(raw.paragraphIndex) || !Number.isInteger(raw.wordIndex)) return null
    return { ...raw, updatedAt: typeof raw.updatedAt === 'number' ? raw.updatedAt : 0 } as KeptPlace
  } catch {
    return null
  }
}

function writeKept(hex: string, place: KeptPlace): void {
  try { localStorage.setItem(PLACE_PREFIX + hex, JSON.stringify(place)) } catch { /* full or private */ }
}

/** The account's place, kept on this device as already saved. */
function adopt(hex: string, place: AccountPlace): void {
  const { rev, ...tuple } = place
  writeKept(hex, { ...tuple, rev, savedAt: tuple.updatedAt })
}

/** Take every account place newer than this device's (EPUBs' and PDFs'). Returns the account's EPUB places, or null when unread. */
export async function pullAccountPlaces(token: string | null, fetchImpl: FetchLike = fetch): Promise<Record<string, AccountPlace> | null> {
  const sets = await fetchAccountPlaceSets(token, fetchImpl)
  if (!sets) return null
  const places = sets.text
  for (const [hex, place] of Object.entries(places)) {
    const kept = readKept(hex)
    if (!kept || place.updatedAt > kept.updatedAt) adopt(hex, place)
  }
  for (const [hex, place] of Object.entries(sets.pages)) adoptPageIfNewer(hex, place)
  return places
}

// ===== A PDF's place: `tinct-addbook:pos:pdf:<hex>` =====

/** Add a book's viewer keeps `{ page, frac, zoom, pages, at }`; sync adds the revision seen and what the account accepted. */
interface KeptPage {
  page: number
  frac: number
  /** When the reader was last there (ms); 0 for none. */
  at: number
  pages?: number
  rev?: number
  savedAt?: number
}

function readPageRaw(hex: string): Record<string, unknown> | null {
  try {
    const raw = JSON.parse(localStorage.getItem(PDF_PLACE_PREFIX + hex) || 'null') as unknown
    return raw && typeof raw === 'object' ? raw as Record<string, unknown> : null
  } catch {
    return null
  }
}

function readPage(hex: string): KeptPage | null {
  const raw = readPageRaw(hex)
  if (!raw || !Number.isInteger(raw.page) || (raw.page as number) < 1) return null
  const number = (value: unknown) => typeof value === 'number' && Number.isFinite(value) ? value : undefined
  return {
    page: raw.page as number,
    frac: Math.max(0, Math.min(1, number(raw.frac) ?? 0)),
    at: number(raw.at) ?? 0,
    pages: Number.isInteger(raw.pages) && (raw.pages as number) > 0 ? raw.pages as number : undefined,
    rev: number(raw.rev),
    savedAt: number(raw.savedAt),
  }
}

function writePage(hex: string, fields: Record<string, unknown>): void {
  // The viewer's own fields (zoom, page count) stay as they are.
  try { localStorage.setItem(PDF_PLACE_PREFIX + hex, JSON.stringify({ ...(readPageRaw(hex) ?? {}), ...fields })) } catch { /* full or private */ }
}

/** The account's place, kept on this device as already saved. */
function adoptPage(hex: string, place: AccountPagePlace): void {
  writePage(hex, { page: place.page, frac: place.frac ?? 0, at: place.updatedAt, rev: place.rev, savedAt: place.updatedAt })
}

/** Take the account's place when it was read later than this device's. */
function adoptPageIfNewer(hex: string, place: AccountPagePlace): boolean {
  const kept = readPage(hex)
  if (kept && place.updatedAt <= kept.at) return false
  adoptPage(hex, place)
  return true
}

/**
 * Save this device's place in one PDF to the account, when it is newer than
 * what the account last accepted from here. A stale write is answered with the
 * account's place: taken here when it was read later, else written over.
 */
export async function pushPdfPlace(hex: string, options: { token?: string | null; fetchImpl?: FetchLike; keepalive?: boolean } = {}): Promise<PushResult> {
  const kept = readPage(hex)
  if (!kept || kept.at <= 0) return 'current'
  if (kept.savedAt === kept.at) return 'current'
  const token = options.token !== undefined ? options.token : await ownBookToken()
  if (!token) return 'unavailable'
  const percent = kept.pages ? Math.round(Math.max(0, Math.min(100, ((kept.page - 1 + kept.frac) / kept.pages) * 100)) * 100) / 100 : undefined
  const tuple = { page: kept.page, frac: kept.frac, updatedAt: kept.at, ...(percent !== undefined ? { percent } : {}) }
  let rev = kept.rev ?? 0
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const result = await putAccountPagePlace(hex, tuple, rev, token, { fetchImpl: options.fetchImpl, keepalive: options.keepalive })
    if (result.status === 'saved') {
      // A place noted while the request was out stays newer; it keeps the new revision.
      const latest = readPage(hex) ?? kept
      writePage(hex, { rev: result.place.rev, ...(latest.at === tuple.updatedAt ? { savedAt: tuple.updatedAt } : {}) })
      return 'saved'
    }
    if (result.status !== 'conflict') return result.status
    const theirs = result.place
    if (theirs && theirs.updatedAt >= tuple.updatedAt) {
      // Read later on another device: that place stands, here too (unless this device read on meanwhile).
      const latest = readPage(hex)
      if (!latest || latest.at <= theirs.updatedAt) adoptPage(hex, theirs)
      return 'adopted'
    }
    rev = theirs?.rev ?? 0
  }
  return 'unavailable'
}

const pendingPages = new Map<string, { timer: ReturnType<typeof setTimeout>; token?: string | null; fetchImpl?: FetchLike }>()

/**
 * The viewer kept a new place in a PDF: saved to the account a moment later
 * (the last one only), or at once with keepalive (`now`: the page is being
 * hidden or left). Offline, it stays on this device and the next open saves it.
 */
export function notePdfPlace(hex: string, options: { now?: boolean; token?: string | null; fetchImpl?: FetchLike } = {}): void {
  const waiting = pendingPages.get(hex)
  if (waiting) clearTimeout(waiting.timer)
  const send = (keepalive: boolean) => { pendingPages.delete(hex); void pushPdfPlace(hex, { token: options.token, fetchImpl: options.fetchImpl, keepalive }).catch(() => {}) }
  if (options.now) { send(true); return }
  pendingPages.set(hex, { timer: setTimeout(() => send(false), PUSH_DELAY_MS), token: options.token, fetchImpl: options.fetchImpl })
}

/** Send any PDF place still waiting (the viewer is being left). */
export function flushPdfPlaces(): void {
  for (const [hex, { timer, token, fetchImpl }] of [...pendingPages]) {
    clearTimeout(timer)
    pendingPages.delete(hex)
    void pushPdfPlace(hex, { token, fetchImpl, keepalive: true }).catch(() => {})
  }
}

/**
 * Before the viewer shows a PDF: take the account's place when it was read
 * later on another device ('adopted'), or keep this device's and save it when
 * it is the newer one ('kept'). Bounded: offline, signed out or slow
 * ('unavailable'), the book opens at this device's place.
 */
export async function reconcilePdfPlace(hex: string, options: { token?: string | null; fetchImpl?: FetchLike; timeoutMs?: number } = {}): Promise<'adopted' | 'kept' | 'unavailable'> {
  const work = (async (): Promise<'adopted' | 'kept' | 'unavailable'> => {
    const token = options.token !== undefined ? options.token : await ownBookToken()
    if (!token) return 'unavailable'
    const sets = await fetchAccountPlaceSets(token, options.fetchImpl)
    if (!sets) return 'unavailable'
    const theirs = sets.pages[hex]
    if (theirs && adoptPageIfNewer(hex, theirs)) return 'adopted'
    const kept = readPage(hex)
    if (kept && kept.at > 0 && (!theirs || kept.at > theirs.updatedAt)) {
      // Saved in the background: the book opens now.
      void pushPdfPlace(hex, { token, fetchImpl: options.fetchImpl }).catch(() => {})
    }
    return 'kept'
  })()
  return withTimeout(work.catch(() => 'unavailable' as const), options.timeoutMs ?? 2500, 'unavailable')
}

export type PushResult = 'saved' | 'current' | 'adopted' | 'gone' | 'unavailable'

/**
 * Save this device's place in one book to the account, when it is newer than
 * what the account last accepted from here. `chapters` (the book's text on
 * this device) gives the percent the shelf shows on devices without the text.
 */
export async function pushOwnPlace(hex: string, options: { token?: string | null; fetchImpl?: FetchLike; chapters?: readonly UserBookChapter[]; keepalive?: boolean } = {}): Promise<PushResult> {
  const kept = readKept(hex)
  if (!kept || kept.updatedAt <= 0) return 'current'
  if (kept.savedAt === kept.updatedAt) return 'current'
  const token = options.token !== undefined ? options.token : await ownBookToken()
  if (!token) return 'unavailable'
  const percent = options.chapters ? placePercent(options.chapters, kept) : kept.percent
  const tuple = { chapterNumber: kept.chapterNumber, paragraphIndex: kept.paragraphIndex, wordIndex: kept.wordIndex, updatedAt: kept.updatedAt, ...(typeof percent === 'number' ? { percent } : {}), ...(typeof kept.converter === 'number' ? { converter: kept.converter } : {}) }
  let rev = kept.rev ?? 0
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const result = await putAccountPlace(hex, tuple, rev, token, { fetchImpl: options.fetchImpl, keepalive: options.keepalive })
    if (result.status === 'saved') {
      // A place noted while the request was out stays newer; it keeps the new revision.
      const latest = readKept(hex) ?? kept
      writeKept(hex, { ...latest, rev: result.place.rev, ...(latest.updatedAt === tuple.updatedAt ? { savedAt: tuple.updatedAt, ...(typeof percent === 'number' ? { percent } : {}) } : {}) })
      return 'saved'
    }
    if (result.status !== 'conflict') return result.status
    const theirs = result.place
    if (theirs && theirs.updatedAt >= tuple.updatedAt) {
      // Read later on another device: that place stands, here too (unless this device read on meanwhile).
      const latest = readKept(hex)
      if (!latest || latest.updatedAt <= theirs.updatedAt) adopt(hex, theirs)
      return 'adopted'
    }
    rev = theirs?.rev ?? 0
  }
  return 'unavailable'
}

const PUSH_DELAY_MS = 2500
const pending = new Map<string, { timer: ReturnType<typeof setTimeout>; chapters: readonly UserBookChapter[] }>()

/**
 * The reader noted a place in an own book (already kept on this device):
 * saved to the account a moment later, or at once (`now`, e.g. the page is
 * being hidden, sent with keepalive).
 */
export function noteOwnPlace(hex: string, chapters: readonly UserBookChapter[], options: { now?: boolean; fetchImpl?: FetchLike } = {}): void {
  const waiting = pending.get(hex)
  if (waiting) clearTimeout(waiting.timer)
  const flush = () => { pending.delete(hex); void pushOwnPlace(hex, { chapters, fetchImpl: options.fetchImpl, keepalive: options.now }).catch(() => {}) }
  if (options.now) { flush(); return }
  pending.set(hex, { timer: setTimeout(flush, PUSH_DELAY_MS), chapters })
}

/** Send any place still waiting (the reader is being left). */
export function flushOwnPlaces(): void {
  for (const [hex, { timer, chapters }] of [...pending]) {
    clearTimeout(timer)
    pending.delete(hex)
    void pushOwnPlace(hex, { chapters, keepalive: true }).catch(() => {})
  }
}

const withTimeout = <T>(work: Promise<T>, ms: number, fallback: T): Promise<T> =>
  Promise.race([work, new Promise<T>(resolve => setTimeout(() => resolve(fallback), ms))])

/**
 * Before the reader opens an own book: take the account's place when it was
 * read later on another device, or save this device's when it is the newer
 * one. Bounded: offline or slow, the book opens at this device's place.
 */
export async function reconcileOpenPlace(hex: string, options: { token?: string | null; fetchImpl?: FetchLike; chapters?: readonly UserBookChapter[]; timeoutMs?: number } = {}): Promise<void> {
  const work = (async () => {
    const token = options.token !== undefined ? options.token : await ownBookToken()
    if (!token) return
    const places = await pullAccountPlaces(token, options.fetchImpl)
    if (!places) return
    const kept = readKept(hex)
    const theirs = places[hex]
    if (kept && (!theirs || kept.updatedAt > theirs.updatedAt)) {
      // Saved in the background: the book opens now.
      void pushOwnPlace(hex, { token, fetchImpl: options.fetchImpl, chapters: options.chapters }).catch(() => {})
    }
  })()
  await withTimeout(work.catch(() => {}), options.timeoutMs ?? 2500, undefined)
}

/** An account book not on this device, as My shelf and the reading table list it (its place from the account, if read). */
export function accountOnlyBook(book: AccountBook): OwnShelfBook {
  const hex = book.sha256.slice(0, 24)
  const at = Date.parse(book.createdAt) || 0
  return {
    key: accountBookKey(book),
    kind: book.type,
    hex,
    title: book.title || book.name.replace(/\.(pdf|epub)$/i, '') || 'Untitled',
    author: book.author || '',
    cover: null,
    at,
    href: book.type === 'epub' ? userBookReaderUrl(hex) : ownBookOpenUrl(hex),
    // A PDF's place: the page read on another device of the account (pullAccountPlaces), if any.
    reading: book.type === 'epub' ? ownReading(hex, null, at) : pdfReading(hex, {}, at),
  }
}

/**
 * Every own book of this account, as My shelf and the reading table list it:
 * this device's (after reconcileOwnBooks), then the account's not on it, each
 * key once, latest first. Without the account (signed out, offline, slow past
 * `timeoutMs`), this device's books as they are.
 */
export async function ownShelfWithAccount(owner: string | null | undefined, options: { token?: string | null; fetchImpl?: FetchLike; timeoutMs?: number } = {}): Promise<OwnShelfBook[]> {
  if (!owner) return []
  const account = await withTimeout(reconcileOwnBooks(owner, options).catch(() => null), options.timeoutMs ?? 5000, null)
  const out: OwnShelfBook[] = []
  const here = new Set<string>()
  for (const book of await readOwnShelf(owner)) {
    if (here.has(book.key)) continue
    here.add(book.key)
    out.push(book)
  }
  for (const book of account ?? []) {
    const listed = accountOnlyBook(book)
    if (here.has(listed.key)) continue
    here.add(listed.key)
    out.push(listed)
  }
  return out.sort((a, b) => b.at - a.at)
}

/**
 * Bring this device in line with the account before own books are listed:
 * forget books removed on another device, take newer places. Returns the
 * account's books, or null when the account could not be read (this device's
 * books are listed as they are).
 */
export async function reconcileOwnBooks(owner: string | null | undefined, options: { token?: string | null; fetchImpl?: FetchLike } = {}): Promise<AccountBook[] | null> {
  if (!owner) return null
  const token = options.token !== undefined ? options.token : await ownBookToken()
  if (!token) return null
  const books = await listAccountBooks(token, options.fetchImpl)
  if (!books) return null
  await forgetRemovedOwnBooks(owner, new Set(books.filter(book => book.sha256).map(accountBookKey)))
  await pullAccountPlaces(token, options.fetchImpl)
  return books
}
