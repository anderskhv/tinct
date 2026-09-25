/**
 * Returning-reader data for the library_2 design (public/lab/library_2).
 *
 * The same sources and rules as the production library
 * (src/labReadingMemory.ts), without its rendering: reading-memory sessions
 * (device mirror, merged with the account's cloud copy when signed in), the
 * reader's position store (device record merged by time with the account's
 * cloud row), and completion marks. Read-only: the reader owns every write.
 *
 * The "so far" summary follows preReader/recapSummaryClient.ts exactly: a
 * cached summary shows at once; a new one is requested only for a signed-in
 * reader, after an hour away from the book, and never straight after leaving
 * that book's own reader. Session summaries are not generated here.
 */
import { supabase } from './services/supabase'
import { completedLibraryBookId } from './preReader/libraryCompletion'
import { createSupabaseReadingMemoryCloud } from './readingMemory/cloud'
import { loadChapterText } from './readingMemory/chapterText'
import { readDeviceReadingMemory } from './readingMemory/deviceStore'
import { loadRecap, type RecapAuth } from './readingMemory/recapLoad'
import { requestRecapSummary } from './readingMemory/summary'
import type { ReadingAnchor } from './readingMemory/types'
import { accountLabPositionRecord, type LabPositionState } from './lab/labPosition'
import { fetchLabPositionCloud, readLabPositionLocal } from './lab/labPositionStore'
import { decideLabAiAction, recordLabAiAction } from './lab/labAccountPrompt'
import { productionPlaces, withProductionPlaces } from './preReader/productionPositions'
import { migrateWithheldEdition } from './data/withheldEditions'
import { isMachineMadeOriginal } from './data/editionDefaults'
import { recapCacheKey, type LabRecapRequest } from './recapSummary'
import { readStoredRecapSummary, recapSummaryPermission, requestLabRecapSummary, storeRecapSummary } from './preReader/recapSummaryClient'
import { LAB_CATALOGUE_URL, readReaderOrigin, writeReaderOrigin } from '../public/lab/library-model.js'
import { wholeBookProgress } from '../public/lab/library-2-model.js'
import { catalogueBookIdForPlace, heroHeadline, libraryModeFor, readingList, type LibraryBookInfo, type LibraryMode, type ReadingListRow } from './preReader/libraryRecap'

interface CatalogueBook {
  id: string
  title: string
  author: string
  wordCount?: number | null
  art?: { src: string; srcSet: string } | null
  /** Generated-cover palette; its background is the book's dominant tone. */
  cover?: { background?: string } | null
  editions: Array<{ key: string; style?: string; language?: string; availability?: { chapterText?: boolean } }>
  /** The approved default edition (editionDefaults.ts), computed at build time. */
  defaultEditionKey?: string | null
  readingStructure?: { totalParagraphs?: number; chapters?: Array<{ number: number; title: string; paragraphCount?: number }> } | null
}

export interface ReadingTableBook {
  bookId: string
  title: string
  author: string
  cover: string | null
  wordCount: number | null
  /** The book's dominant cover tone, for its spine. */
  tone: string | null
  /** "Chapter 7" style label of the chapter Continue resumes in. */
  chapterLabel: string
  /** "You’re in the middle of Chapter 7" — the production hero headline. */
  headline: string
  /** Whole-book progress, 0–100, or null when the structure is unknown. */
  percent: number | null
  /** Stored automatic summary for the chapter Continue resumes in, if any. */
  recap: string | null
}

export interface ReadingTableFinished {
  bookId: string
  title: string
  author: string
  cover: string | null
  finishedAt: number | null
}

export interface ReadingTable {
  mode: LibraryMode
  reading: ReadingTableBook[]
  finished: ReadingTableFinished[]
}

export type SummaryResult =
  | { status: 'cached' | 'fresh'; text: string }
  | { status: 'none' | 'recent' | 'from-reader' | 'offline' | 'account-required' | 'unavailable'; text: null }

const BOOK_COMPLETED_PREFIX = 'tinct:book-completed:'
/** The library never writes the position store: an explicit id keeps the read side-effect free. */
const LIBRARY_POSITION_DEVICE_ID = 'lab-library'

let catalogue: Map<string, CatalogueBook> | null = null
let lastRows = new Map<string, ReadingListRow>()
let lastPositions: LabPositionState | null = null
const summaryOutcomes = new Map<string, Promise<SummaryResult>>()

const isOnline = () => typeof navigator === 'undefined' || navigator.onLine !== false
const buildVersion = () => (typeof __BUILD_VERSION__ === 'string' ? __BUILD_VERSION__ : 'dev')

function storage(kind: 'local' | 'session'): Storage | null {
  try {
    return kind === 'local' ? localStorage : sessionStorage
  } catch {
    return null
  }
}

async function loadCatalogue(): Promise<Map<string, CatalogueBook>> {
  if (catalogue) return catalogue
  try {
    const response = await fetch(LAB_CATALOGUE_URL)
    if (!response.ok) throw new Error(String(response.status))
    const data = await response.json() as { books?: CatalogueBook[] }
    catalogue = new Map((data.books ?? []).map(book => [book.id, book]))
  } catch {
    return new Map()
  }
  return catalogue
}

async function readAuth(): Promise<RecapAuth> {
  if (!supabase) return { userId: null, token: null }
  try {
    const { data } = await supabase.auth.getSession()
    return { userId: data.session?.user?.id ?? null, token: data.session?.access_token ?? null }
  } catch {
    return { userId: null, token: null }
  }
}

async function loadPositions(auth: RecapAuth): Promise<LabPositionState | null> {
  let local: LabPositionState
  try {
    local = readLabPositionLocal(LIBRARY_POSITION_DEVICE_ID)
  } catch {
    return null
  }
  if (!auth.token || !auth.userId || !isOnline()) return accountLabPositionRecord(local, null, auth.userId)
  const cloud = await fetchLabPositionCloud(auth.token).catch(() => null)
  return accountLabPositionRecord(local, cloud, auth.userId)
}

function completedBookIds(): Set<string> {
  const ids = new Set<string>()
  try {
    for (let index = 0; index < localStorage.length; index += 1) {
      const key = localStorage.key(index)
      if (!key || (!key.startsWith(BOOK_COMPLETED_PREFIX) && !key.startsWith('tinct:progress:'))) continue
      try {
        const id = completedLibraryBookId(key, JSON.parse(localStorage.getItem(key) ?? 'null'))
        if (id) ids.add(id)
      } catch { /* A malformed legacy record must not hide other finished books. */ }
    }
  } catch { /* storage blocked */ }
  return ids
}

function positionsWithProduction(positions: LabPositionState | null, books: Map<string, CatalogueBook>): LabPositionState | null {
  if (!positions) return null
  const places = productionPlaces({ bookIds: books.keys(), read: key => storage('local')?.getItem(key) ?? null })
  return withProductionPlaces(positions, places)
}

function bookInfos(books: Map<string, CatalogueBook>): Map<string, LibraryBookInfo> {
  return new Map([...books.values()].map(book => [book.id, {
    id: book.id,
    title: book.title,
    chapters: (book.readingStructure?.chapters ?? []).map(chapter => ({ number: chapter.number, title: chapter.title, paragraphCount: chapter.paragraphCount })),
  }]))
}

/**
 * The edition a new reader starts in: the approved default (Tinct Modern
 * English; BSB for the Bible). A saved place without an edition key predates
 * edition keys, when the original was the default, so it keeps the human
 * original; a machine-made "original" is never chosen.
 */
function defaultEditionKey(book: CatalogueBook | undefined, savedPlaceWithoutEdition = false): string | null {
  const editions = (book?.editions ?? []).filter(edition => edition.language !== 'da' && edition.availability?.chapterText !== false)
  const approved = editions.find(edition => edition.key === book?.defaultEditionKey)?.key
  const original = book ? editions.find(edition => edition.style === 'original' && edition.language === 'en' && !isMachineMadeOriginal(book.id, edition.key))?.key : undefined
  return (savedPlaceWithoutEdition ? original ?? approved : approved ?? original)
    ?? editions.find(edition => edition.style === 'modern' && edition.language === 'en')?.key
    ?? editions[0]?.key
    ?? null
}

const READER_HANDOFF_KEY = 'tinct:lab-reader-handoff'

interface Place { chapterNumber: number; pageIndex?: number; paragraphIndex: number; wordIndex: number; editionKey: string | null }

/** The reader's true place in a book: the reading-list target, else the merged position record. */
async function placeFor(bookId: string): Promise<Place | null> {
  const row = lastRows.get(bookId)
  if (row) return row.target
  if (!lastPositions) lastPositions = positionsWithProduction(await loadPositions(await readAuth()), await loadCatalogue())
  const place = lastPositions?.books?.[bookId]
  if (!place) return null
  return { chapterNumber: place.chapterNumber, pageIndex: place.pageIndex, paragraphIndex: place.paragraphIndex, wordIndex: place.wordIndex, editionKey: place.primaryEditionKey ?? null }
}

/**
 * Hand a book straight to the production reader, at the reader's place
 * (device merged with the account's cloud copy) in the edition it was read
 * in, else from the beginning in `preferredEdition`. Writes the same session
 * hand-off the production library writes and returns the URL to open; the
 * book page is the fallback when no readable edition is known.
 */
export async function readerDestination(bookId: string, preferredEdition?: string | null): Promise<string> {
  const [books, place] = await Promise.all([loadCatalogue(), placeFor(bookId).catch(() => null)])
  const book = books.get(bookId)
  const readable = (book?.editions ?? []).filter(edition => edition.availability?.chapterText !== false)
  const saved = place?.editionKey ? migrateWithheldEdition(bookId, place.editionKey) : null
  const edition = [saved, preferredEdition].find(key => key && readable.some(item => item.key === key)) ?? defaultEditionKey(book, Boolean(place && !place.editionKey))
  if (!book || !edition) return `/library?book=${encodeURIComponent(bookId)}&view=book-detail`
  const intent = {
    kind: 'open-reader',
    bookId,
    primaryEditionKey: edition,
    // A new reader has already met the book in the library's introduction, so
    // they start on page one rather than on the reader's own cover page.
    savedPlace: place
      ? { bookId, chapterNumber: place.chapterNumber, page: place.pageIndex ?? 0, paragraphIndex: place.paragraphIndex, wordIndex: place.wordIndex }
      : { bookId, chapterNumber: book.readingStructure?.chapters?.[0]?.number ?? 1, page: 0, paragraphIndex: 0, wordIndex: 0 },
  }
  try {
    sessionStorage.setItem(READER_HANDOFF_KEY, JSON.stringify(intent))
  } catch {
    return `/library?book=${encodeURIComponent(bookId)}&view=book-detail`
  }
  // So the library it returns to does not recap the book just left.
  writeReaderOrigin(storage('session'), bookId, Date.now())
  return '/reader'
}

/** Every book in progress, newest first, and every finished book, for this viewer. */
export async function loadReadingTable(): Promise<ReadingTable> {
  const [auth, books] = await Promise.all([readAuth(), loadCatalogue()])
  // Merges the account's cloud reading memory into the device mirror first.
  await loadRecap({
    auth: readAuth,
    cloudFor: userId => createSupabaseReadingMemoryCloud(userId),
    loadChapter: (anchor: ReadingAnchor) => loadChapterText({ bookId: anchor.bookId, editionKey: anchor.editionKey, chapterNumber: anchor.chapterNumber, version: buildVersion() }),
    requestSummary: input => requestRecapSummary(input),
    bookTitle: bookId => books.get(bookId)?.title,
    online: isOnline,
    allowSummary: false,
  }).catch(() => null)
  const positions = await loadPositions(auth)
  lastPositions = positionsWithProduction(positions, books)
  if (auth.userId && supabase) {
    // Completion marks and terminal progress records synced from the account, as the production library does.
    await supabase.from('user_data').select('key,value').eq('user_id', auth.userId).or('key.like.book-completed:*,key.like.progress:*').then(({ data, error }) => {
      if (error) return
      for (const row of data ?? []) {
        if (row.value != null) localStorage.setItem(`tinct:${row.key}`, JSON.stringify(row.value))
        else localStorage.removeItem(`tinct:${row.key}`)
      }
    }, () => {})
  }
  const list = readingList({
    memory: readDeviceReadingMemory(),
    viewer: auth.userId,
    positions: positionsWithProduction(positions, books),
    books: bookInfos(books),
    completedBookIds: completedBookIds(),
  })
  lastRows = new Map(list.readingNow.map(row => [row.bookId, row]))
  return {
    mode: libraryModeFor(list),
    reading: list.readingNow.map(row => {
      const book = books.get(row.bookId)
      const percent = wholeBookProgress(book, { chapterNumber: row.target.chapterNumber, paragraphIndex: row.target.paragraphIndex, page: row.target.pageIndex }, { finishedChapters: row.finishedChapters })
      return {
        bookId: row.bookId,
        title: book?.title ?? row.bookId,
        author: book?.author ?? '',
        cover: book?.art?.src ?? null,
        wordCount: book?.wordCount ?? null,
        tone: book?.cover?.background ?? null,
        chapterLabel: row.target.chapterLabel,
        headline: heroHeadline(row),
        percent: typeof percent === 'number' && Number.isFinite(percent) ? percent : null,
        recap: row.recap,
      }
    }),
    finished: list.finished.map(row => {
      const book = books.get(row.bookId)
      return { bookId: row.bookId, title: book?.title ?? row.bookId, author: book?.author ?? '', cover: book?.art?.src ?? null, finishedAt: row.finishedAt }
    }),
  }
}

function summaryRequestFor(row: ReadingListRow, book: CatalogueBook | undefined): LabRecapRequest | null {
  const { target } = row
  if (!target.editionKey) return null
  const edition = book?.editions.find(item => item.key === target.editionKey)
  if (edition?.language === 'da' || target.editionKey.endsWith('-da')) return null
  return {
    bookId: row.bookId,
    editionKey: target.editionKey,
    chapterNumber: target.chapterNumber,
    paragraphIndex: target.paragraphIndex,
    completed: row.progress === 'finished',
    ...(row.includePreviousChapter ? { previousChapterNumber: target.chapterNumber - 1 } : {}),
    bookTitle: book?.title ?? row.bookId,
  }
}

/**
 * The "so far" summary for a book in progress, under the production rules.
 * `request: false` reads the cache only (for books merely scrolled past).
 */
export async function summaryFor(bookId: string, options: { request?: boolean } = {}): Promise<SummaryResult> {
  const row = lastRows.get(bookId)
  const books = await loadCatalogue()
  const book = books.get(bookId)
  const request = row ? summaryRequestFor(row, book) : null
  if (!row || !request) return { status: 'none', text: null }
  const key = recapCacheKey({
    bookId: request.bookId,
    editionKey: request.editionKey,
    chapterNumber: request.chapterNumber,
    paragraphIndex: request.paragraphIndex,
    paragraphCount: row.target.paragraphCount,
    completed: request.completed === true,
    previousChapterNumber: request.previousChapterNumber ?? null,
  })
  const originRecord = readReaderOrigin(storage('session'))
  const originBook = originRecord ? catalogueBookIdForPlace({ bookId: originRecord.bookId }, books) : null
  const permission = recapSummaryPermission({
    bookId,
    origin: originRecord && originBook ? { bookId: originBook, at: originRecord.at } : null,
    sessionLastActiveAt: row.session?.lastActiveAt ?? null,
    placeUpdatedAt: row.target.at,
    now: Date.now(),
  })
  const cached = permission.cache ? readStoredRecapSummary(storage('local'), key) : null
  if (cached) return { status: 'cached', text: cached }
  if (permission.reason === 'from-reader') return { status: 'from-reader', text: null }
  if (!options.request || !permission.request) return { status: 'recent', text: null }
  if (!isOnline()) return { status: 'offline', text: null }
  const pending = summaryOutcomes.get(key)
  if (pending) return pending
  const outcome = (async (): Promise<SummaryResult> => {
    const auth = await readAuth()
    const decision = decideLabAiAction({ signedIn: Boolean(auth.userId) })
    if (!decision.allowed) return { status: 'account-required', text: null }
    const result = await requestLabRecapSummary({ request, token: auth.token }).catch(() => ({ ok: false as const, error: 'request failed' }))
    if (!result.ok) return { status: 'unavailable', text: null }
    if (decision.reason === 'free' && !result.response.cached) recordLabAiAction()
    storeRecapSummary(storage('local'), key, result.response.summary, Date.now())
    return { status: 'fresh', text: result.response.summary }
  })()
  summaryOutcomes.set(key, outcome)
  return outcome
}

// Loaded as a standalone script by public/lab/library_2/reading-table.js; the
// production build strips unused entry exports, so the API is published here.
;(window as Window & { __tinctLibraryTwoReading?: unknown }).__tinctLibraryTwoReading = { loadReadingTable, summaryFor, readerDestination }
