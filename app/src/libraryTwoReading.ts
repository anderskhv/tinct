import { nativeLibraryCatalogue, ensureNativeBook } from './utils/nativeBooks'
import { ensurePublicBook } from './utils/publicBooks'
import { addToTinctEnabled, isPublicBookId, mergePublicBooks, PUBLIC_BOOKS_INDEX_FETCH, PUBLIC_BOOKS_INDEX_URL } from '../public/lab/public-books.js'
import { prepareShelfRecaps } from './preReader/recapPreparationClient'
import { loadSavedBooks, setSavedBook, loadShelfMembership } from './libraryTwoSaved'
import { editionHold, isEditionLanguageOffered } from './data/editionAvailability'
/**
 * Returning-reader data for the library_2 design (public/lab/library_2).
 *
 * The same sources and rules as the production library
 * (src/labReadingMemory.ts), without its rendering: reading-memory sessions
 * (device mirror, merged with the account's cloud copy when signed in), the
 * reader's position store (device record merged by time with the account's
 * cloud row), and completion marks. The reader owns every reading event; account snapshots are mirrored unchanged;
 * the explicit remove action only changes the existing shelf-hide timestamp.
 *
 * The "so far" summary follows preReader/recapSummaryClient.ts exactly: a
 * cached summary shows at once; a new one is requested only for a signed-in
 * reader, after five minutes away from the book, and never straight after leaving
 * that book's own reader. Session summaries are not generated here.
 */
import { supabase } from './services/supabase'
import { completedBookIdsIn } from './preReader/libraryCompletion'
import { createSupabaseReadingMemoryCloud } from './readingMemory/cloud'
import { readDeviceReadingMemory } from './readingMemory/deviceStore'
import { loadRecap, type RecapAuth } from './readingMemory/recapLoad'
import { accountLabPositionRecord, withHiddenFromReadingNow, type LabPositionState } from './lab/labPosition'
import { fetchLabPositionCloud, prepareLabPositionLocal, readLabPositionLocal, writeLabPositionLocal, putLabPositionCloud } from './lab/labPositionStore'
import { decideLabAiAction, recordLabAiAction } from './lab/labAccountPrompt'
import { trackFunnel, trackFunnelOnce } from './utils/funnel'
import { productionPlaces, withProductionPlaces } from './preReader/productionPositions'
import { migrateWithheldEdition } from './data/withheldEditions'
import { humanPrimaryEditionKey, isMachineMadeOriginal } from './data/editionDefaults'
import { newBooksOpenIn } from './social/socialClient'
import { recapCacheKey, type LabRecapRequest } from './recapSummary'
import { readStoredRecapSummary, recapSummaryPermission, requestLabRecapSummary, storeRecapSummary } from './preReader/recapSummaryClient'
import { LAB_CATALOGUE_URL, readReaderOrigin, writeReaderOrigin } from '../public/lab/library-model.js'
import { readLabLibraryBootSnapshot } from './lab/labLibraryBoot'
import { wholeBookProgress } from '../public/lab/library-2-model.js'
import { catalogueBookIdForPlace, positionPlacesByBook, heroHeadline, libraryModeFor, type LibraryBookInfo, type LibraryMode, type ReadingListRow } from './preReader/libraryRecap'
import { mergeReadingNow, readingNowList } from './preReader/readingNow'
import { bookCoverSrc } from '../public/lab/book-cover.js'
import { conciseChapterLabel } from './preReader/recapPosition'
import { hideOwnFromReadingTable, type OwnShelfBook, type OwnShelfReading } from './lab/userBook/ownShelf'
import { isUserBookId, ownBookHref, userBookHex } from './lab/userBook/userBookId'
import { pdfEditionChoice } from './lab/userBook/pdfEditions'
import { ownReadingNowWithAccount } from './lab/userBook/ownSync'

interface CatalogueBook {
  id: string
  title: string
  author: string
  wordCount?: number | null
  displayYear?: string
  art?: { src: string; srcSet: string } | null
  /** Generated-cover palette; its background is the book's dominant tone. */
  cover?: { background?: string } | null
  editions: Array<{ key: string; style?: string; language?: string; wordCount?: number | null; readingStructure?: CatalogueBook['readingStructure']; availability?: { chapterText?: boolean } }>
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
  displayYear?: string
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
  /**
   * A reader's own book (`userbook-<hex>`, userBook/ownShelf.ts): read from this
   * device and the reader's private account copies and places (userBook/ownSync.ts),
   * its cover a data: URL kept on this device, never sent anywhere.
   */
  own?: boolean
  /** When the reader last read it: own books and Tinct's share one order. */
  lastActiveAt?: number
  /** An own book's record key (`epub:<hex>`, `pdf:<hex>`), kind and URL, for My shelf's card. */
  ownKey?: string
  kind?: 'pdf' | 'epub'
  href?: string
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
  /** Compatibility alias for the same active reading list shown at the desk. */
  shelfReading?: ReadingTableBook[]
}

export type SummaryResult =
  | { status: 'cached' | 'fresh'; text: string }
  | { status: 'none' | 'recent' | 'from-reader' | 'offline' | 'account-required' | 'unavailable'; text: null }

/** How recently the reader must have been left for the desk to lead with that book. */
const JUST_READ_MS = 60 * 60 * 1000
/** An explicit id keeps position reads side-effect free. */
const LIBRARY_POSITION_DEVICE_ID = 'lab-library'

let catalogue: Map<string, CatalogueBook> | null = null
let lastRows = new Map<string, ReadingListRow>()
let lastPositions: LabPositionState | null = null
const summaryOutcomes = new Map<string, Promise<SummaryResult>>()

const isOnline = () => typeof navigator === 'undefined' || navigator.onLine !== false

function storage(kind: 'local' | 'session'): Storage | null {
  try {
    return kind === 'local' ? localStorage : sessionStorage
  } catch {
    return null
  }
}

async function loadCatalogue(provided?: Promise<{ books?: CatalogueBook[] }>): Promise<Map<string, CatalogueBook>> {
  if (catalogue) return catalogue
  try {
    const native = await nativeLibraryCatalogue()
    const data = native ?? (provided ? await provided : await (async () => {
      const response = await fetch(LAB_CATALOGUE_URL)
      if (!response.ok) throw new Error(String(response.status))
      return await withPublicBooks(await response.json() as { books: CatalogueBook[] })
    })())
    catalogue = new Map((data.books ?? []).map(book => [book.id, book]))
  } catch {
    return new Map()
  }
  return catalogue
}

/** Books readers added (public-books.js), merged in where the device sees them. */
async function withPublicBooks(data: { books: CatalogueBook[] }): Promise<{ books: CatalogueBook[] }> {
  if (!addToTinctEnabled(undefined, document.documentElement.classList.contains('signed-in'))) return data
  try {
    const response = await fetch(PUBLIC_BOOKS_INDEX_URL, PUBLIC_BOOKS_INDEX_FETCH)
    if (!response.ok) return data
    const index = await response.json() as { books?: Array<CatalogueBook & { shelfIds?: string[] }> }
    return mergePublicBooks(data, index.books ?? [])
  } catch {
    return data
  }
}

/** A book just added on this page joins the catalogue the reading engine already holds. */
function addCatalogueBook(entry: CatalogueBook): void {
  if (!isPublicBookId(entry?.id)) return
  catalogue?.set(entry.id, entry)
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

async function loadPositions(auth: RecapAuth, onReady?: (positions: LabPositionState | null) => void): Promise<LabPositionState | null> {
  let local: LabPositionState
  try {
    local = await prepareLabPositionLocal(LIBRARY_POSITION_DEVICE_ID)
  } catch {
    return null
  }
  const ownedLocal = accountLabPositionRecord(local, null, auth.userId)
  onReady?.(ownedLocal)
  if (!auth.token || !auth.userId || !isOnline()) return ownedLocal
  const cloud = await fetchLabPositionCloud(auth.token).catch(() => null)
  let merged = accountLabPositionRecord(local, cloud, auth.userId)
  if ((await readAuth()).userId !== auth.userId) throw new Error('Account changed')
  // Keep the account pins we have actually received, not just a presentation
  // snapshot. A later offline/older cloud response must not make a book vanish.
  // This copies exact clocks/coordinates; opening the library is not reading.
  const current = readLabPositionLocal(LIBRARY_POSITION_DEVICE_ID)
  if (cloud && (!cloud.owner || cloud.owner === auth.userId)
    && (!current.owner || current.owner === auth.userId)) {
    merged = writeLabPositionLocal(merged)
  }
  onReady?.(merged)
  return merged
}

function completedBookIds(): Set<string> {
  try { return completedBookIdsIn(localStorage) } catch { return new Set() }
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
  const editions = (book?.editions ?? []).filter(edition => isEditionLanguageOffered(book?.id || '', edition) && !editionHold(book?.id || '', edition.key) && edition.availability?.chapterText !== false)
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
  const books = await loadCatalogue()
  // Hidden books still resume at their place. Bible pins use biblical book
  // ids, so resolve the catalogue id exactly as the visible reading list does.
  const place = positionPlacesByBook(lastPositions, books, books.get('bible')?.readingStructure?.chapters).get(bookId)
  if (!place) return null
  return { chapterNumber: place.sequentialChapter, pageIndex: place.pageIndex, paragraphIndex: place.paragraphIndex, wordIndex: place.wordIndex, editionKey: place.primaryEditionKey ?? null }
}

/** Read-only spoiler permission, using the same account-scoped place as Continue. */
export async function introductionProgress(bookId: string): Promise<{ chapterNumber: number; completed: boolean }> {
  const table = await loadReadingTable()
  const place = await placeFor(bookId)
  return { chapterNumber: place?.chapterNumber ?? 0, completed: table.finished.some(book => book.bookId === bookId) }
}

/**
 * Hand a book straight to the production reader, at the reader's place
 * (device merged with the account's cloud copy) in the edition it was read
 * in, else from the beginning in `preferredEdition`. Writes the same session
 * hand-off the production library writes and returns the URL to open; the
 * book page is the fallback when no readable edition is known.
 */
export async function readerDestination(
  bookId: string,
  preferredEdition?: string | null,
  /** From the introduction's edition dropdowns: an explicit pick wins over the saved edition. */
  choice?: { compare?: string | null; explicit?: boolean; compareExplicit?: boolean },
): Promise<string> {
  // A reader's own book opens at its own URL; the reader restores the place kept on this device.
  // A PDF read in its pages opens in Add a book's viewer (pdfEditions.ts).
  if (isUserBookId(bookId)) { const hex = userBookHex(bookId)!; return ownBookHref(hex, null, pdfEditionChoice(hex)) }
  await ensureNativeBook(bookId)
  await ensurePublicBook(bookId).catch(() => {})
  const [books, place] = await Promise.all([loadCatalogue(), placeFor(bookId).catch(() => null)])
  const book = books.get(bookId)
  const readable = (book?.editions ?? []).filter(edition => edition.availability?.chapterText !== false)
  const saved = place?.editionKey ? migrateWithheldEdition(bookId, place.editionKey) : null
  const preferred = preferredEdition && !editionHold(bookId, preferredEdition) ? preferredEdition : null
  // "New books open in" (profiles, social ship 2): only a book this reader has
  // never opened, and only without an explicit pick. Null while profiles are off.
  const human = !place && !choice?.explicit && newBooksOpenIn() === 'human'
    ? humanPrimaryEditionKey(bookId, readable.map(edition => ({ key: edition.key, style: edition.style ?? '', language: edition.language ?? '' })) as never) ?? null
    : null
  const order = choice?.explicit ? [preferred, saved] : [saved, human, preferred]
  const edition = order.find(key => key && readable.some(item => item.key === key)) ?? defaultEditionKey(book, Boolean(place && !place.editionKey))
  if (!book || !edition) return `/library?book=${encodeURIComponent(bookId)}&view=book-detail`
  const compare = choice?.compare && choice.compare !== edition && readable.some(item => item.key === choice.compare) && !editionHold(bookId, choice.compare) ? choice.compare : null
  const intent = {
    kind: 'open-reader',
    resumeLatest: true,
    bookId,
    primaryEditionKey: edition,
    ...(compare ? { compareEditionKey: compare } : {}),
    // The introduction's own Compare pick (an edition or None) is the reader's
    // choice; its default pair is only a default.
    ...(choice?.compareExplicit ? { compareChosen: true } : {}),
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

interface ReadingTableLoadOptions {
  onCached?: (table: ReadingTable) => void
  /** The public page already requests this data; keep all catalogue entries. */
  catalogue?: Promise<{ books?: CatalogueBook[] }>
  /** Warm only public artwork while the account's remaining reads finish. */
  onArtwork?: (books: Array<Pick<ReadingTableBook, 'bookId' | 'cover' | 'tone'>>) => void
}

/** Every book in progress, newest first, and every finished book, for this viewer. */
export async function loadReadingTable(options: ReadingTableLoadOptions = {}): Promise<ReadingTable> {
  const catalogueReady = loadCatalogue(options.catalogue)
  catalogueReady.catch(() => {})
  const auth = await readAuth()
  const cacheKey = 'tinct:library-2-table:' + (auth.userId ?? 'guest')
  // Resolve identity before reading its snapshot. Cached presentation never
  // supplies a resume target; that still comes from the merged position store.
  let cached: ReadingTable | null = null
  try {
    const parsed = JSON.parse(localStorage.getItem(cacheKey) || 'null')
    if (parsed && Array.isArray(parsed.reading) && Array.isArray(parsed.finished)) cached = parsed
  } catch { /* Fresh reads remain authoritative. */ }
  // The book the reader just left leads the first paint, so the desk never
  // waits for the account reads to show it (they confirm it moments later).
  const justRead = justLeftReader(auth.userId)
  const needsCatalogue = !!justRead && !cached?.reading.some(book => book.bookId === justRead.bookId)
  if (cached && !needsCatalogue) options.onCached?.(withJustRead(cached, justRead, null))
  // Account reads do not need the catalogue: start them now, alongside its
  // download (1.6 MB), instead of after it. Same reads, same merge below.
  let catalogueBooks: Awaited<typeof catalogueReady> | null = null
  const warmArtwork = (positions: LabPositionState | null) => {
    if (!options.onArtwork || !positions) return
    catalogueReady.then(books => {
      const ids = new Set(Object.values(positions.books).map(place => catalogueBookIdForPlace(place, books, books.get('bible')?.readingStructure?.chapters)))
      const artwork = [...ids].flatMap(id => {
        const book = id ? books.get(id) : null
        return book ? [{ bookId: book.id, cover: bookCoverSrc({ bookId: book.id, art: book.art }), tone: book.cover?.background ?? null }] : []
      })
      // Warming is optional presentation work. It must not block or fail data
      // reconciliation, and never returns reading progress or recap text early.
      try { options.onArtwork?.(artwork) } catch { /* Artwork can still load on render. */ }
    }, () => {})
  }
  // Independent account reads start together; reconcile every mirror before
  // deriving the shelf, so slower memory/completion reads cannot paint stale data.
  const membershipReady = loadShelfMembership()
  // The reader's own books being read, shelved with Tinct's: this device's, and
  // the account's private copies and places (a book read on another device;
  // one removed there leaves here), userBook/ownSync.ts.
  const ownReady = ownReadingNowWithAccount(auth.userId, { token: auth.token }).catch(() => [] as Array<OwnShelfBook & { reading: OwnShelfReading }>)
  const positionsReady = loadPositions(auth, warmArtwork)
  const memoryReady = loadRecap({
    auth: readAuth,
    cloudFor: userId => createSupabaseReadingMemoryCloud(userId),
    // This view uses the merged sessions, not loadRecap's discarded excerpt
    // card. A chapter download and generation cannot improve the table here.
    loadChapter: async () => null,
    bookTitle: bookId => catalogueBooks?.get(bookId)?.title,
    online: isOnline,
    allowSummary: false,
  }).catch(() => null)
  // Completion marks and terminal progress records, as the production library.
  const completionsReady = auth.userId && supabase ? supabase.from('user_data').select('key,value').eq('user_id', auth.userId).or('key.like.book-completed:*,key.like.progress:*').then(({ data, error }) => {
    if (error) return
    for (const row of data ?? []) {
      if (row.value != null) localStorage.setItem(`tinct:${row.key}`, JSON.stringify(row.value))
      else localStorage.removeItem(`tinct:${row.key}`)
    }
  }, () => {}) : Promise.resolve()
  // Keep the reads' rejections handled while the catalogue is awaited.
  void Promise.allSettled([membershipReady, positionsReady, memoryReady, completionsReady])
  const books = await catalogueReady
  catalogueBooks = books
  if (needsCatalogue) options.onCached?.(withJustRead(cached ?? { mode: 'returning', reading: [], finished: [] } as ReadingTable, justRead, books.get(justRead!.bookId) ?? null))
  const [positions, membership] = await Promise.all([positionsReady, membershipReady, memoryReady, completionsReady])
  lastPositions = positionsWithProduction(positions, books)
  // One list for the reading table, My shelf and the reader's book switcher
  // (preReader/readingNow.ts): in progress, less what the reader took off it since.
  const list = readingNowList({
    memory: readDeviceReadingMemory(),
    viewer: auth.userId,
    positions: lastPositions,
    books: bookInfos(books),
    completedBookIds: completedBookIds(),
    membership,
  })
  // Removed books still resume at their place (placeFor).
  lastRows = new Map(list.inProgress.map(row => [row.bookId, row]))
  const table: ReadingTable = {
    mode: libraryModeFor(list),
    reading: list.readingNow.map(row => {
      const book = books.get(row.bookId)
      const selectedEdition = book?.editions.find(edition => edition.key === row.target.editionKey)
      const estimateBook = selectedEdition?.readingStructure ? { ...book, readingStructure: selectedEdition.readingStructure } : book
      const percent = wholeBookProgress(estimateBook, { chapterNumber: row.target.chapterNumber, paragraphIndex: row.target.paragraphIndex, page: row.target.pageIndex }, { finishedChapters: row.finishedChapters })
      return {
        bookId: row.bookId,
        title: book?.title ?? row.bookId,
        author: book?.author ?? '',
        cover: bookCoverSrc({ bookId: row.bookId, art: book?.art }),
        wordCount: selectedEdition?.wordCount ?? book?.wordCount ?? null,
        displayYear: book?.displayYear || '',
        tone: book?.cover?.background ?? null,
        chapterLabel: row.target.chapterLabel,
        // A long chapter label reads as its first sentence in the headline (the place line keeps it whole).
        headline: heroHeadline({ ...row, target: { ...row.target, chapterLabel: conciseChapterLabel(row.target.chapterLabel) } }),
        percent: typeof percent === 'number' && Number.isFinite(percent) ? percent : null,
        recap: row.recap,
        lastActiveAt: row.lastActiveAt,
      }
    }),
    // Finished books stay: My shelf offers removal only for books being read (Anders,
    // 2026-10-07), and older removals of finished books are ignored here, so they
    // reappear without any stored removal being rewritten.
    finished: list.finished.map(row => {
      const book = books.get(row.bookId)
      return { bookId: row.bookId, title: book?.title ?? row.bookId, author: book?.author ?? '', cover: bookCoverSrc({ bookId: row.bookId, art: book?.art }), finishedAt: row.finishedAt }
    }),
  }
  table.reading = withOwnReading(table.reading, await ownReady)
  if (table.reading.length) table.mode = 'returning'
  // Paint each book's stored "so far" summary with the table itself, so the
  // desk never flashes the position headline first (cache reads only).
  await Promise.all(table.reading.map(async book => {
    if (book.recap) return
    const cached = await summaryFor(book.bookId).catch(() => null)
    if (cached?.status === 'cached') book.recap = cached.text
  }))
  table.shelfReading = table.reading
  if (!table.reading.length) table.mode = 'new'
  if ((await readAuth()).userId !== auth.userId) throw new Error('Account changed')
  if (auth.token) {
    const candidates = list.readingNow.filter(row => table.reading.some(book => book.bookId === row.bookId)).flatMap(row => {
      const request = summaryRequestFor(row, books.get(row.bookId))
      return request ? [{ request, lastActiveAt:row.session?.lastActiveAt ?? row.target.at ?? Date.now() }] : []
    })
    void prepareShelfRecaps(candidates,auth.token).catch(() => {})
  }
  try { localStorage.setItem(cacheKey, JSON.stringify(withoutOwnCovers(table))) } catch { /* Optional fast paint. */ }
  return table
}

/** An own book being read, as a reading-table row: the same fields as Tinct's books. */
export function ownTableBook(book: OwnShelfBook & { reading: OwnShelfReading }): ReadingTableBook {
  return {
    bookId: book.reading.bookId,
    title: book.title,
    author: book.author,
    cover: bookCoverSrc({ bookId: book.reading.bookId, ownCover: book.cover, storedCover: book.storedCover }),
    wordCount: book.reading.wordCount,
    displayYear: '',
    tone: null,
    chapterLabel: book.reading.chapterLabel,
    headline: book.reading.headline,
    percent: book.reading.percent,
    // No "so far" summary is kept for an own book on this device.
    recap: null,
    own: true,
    lastActiveAt: book.reading.lastActiveAt,
    ownKey: book.key,
    kind: book.kind,
    href: book.href,
  }
}

/** Tinct's books and the reader's own in one row, most recently read first. */
export function withOwnReading(reading: ReadingTableBook[], own: ReadonlyArray<OwnShelfBook & { reading: OwnShelfReading }>): ReadingTableBook[] {
  if (own.length === 0) return reading
  return mergeReadingNow(reading, own.map(ownTableBook), row => row.bookId, row => row.lastActiveAt)
}

/**
 * The fast-paint snapshot without own books' covers: a full-size cover is a large
 * data: URL, and localStorage also keeps reading places. The fresh read paints them.
 */
function withoutOwnCovers(table: ReadingTable): ReadingTable {
  const strip = (rows: ReadingTableBook[]) => rows.map(row => row.own ? { ...row, cover: null } : row)
  return { ...table, reading: strip(table.reading), ...(table.shelfReading ? { shelfReading: strip(table.shelfReading) } : {}) }
}

/** The book the reader was just in (the reader's library boot snapshot), if recent and this account's. */
function justLeftReader(userId: string | null): { bookId: string; title: string; chapterLabel: string; headline: string; lastReadAt: number } | null {
  const snapshot = readLabLibraryBootSnapshot()
  const hero = snapshot?.hero
  if (!snapshot || !hero || snapshot.userId !== userId) return null
  if (!hero.lastReadAt || Date.now() - hero.lastReadAt > JUST_READ_MS) return null
  return { bookId: hero.bookId, title: hero.title, chapterLabel: hero.chapterLabel, headline: hero.headline, lastReadAt: hero.lastReadAt }
}

function withJustRead(table: ReadingTable, justRead: ReturnType<typeof justLeftReader>, book: CatalogueBook | null): ReadingTable {
  if (!justRead) return table
  // The snapshot names Tinct's books only: an own book read since leads instead.
  if (table.reading.some(row => row.own && (row.lastActiveAt ?? 0) > justRead.lastReadAt)) return table
  const existing = table.reading.find(row => row.bookId === justRead.bookId)
  if (!existing && !book) return table
  const lead: ReadingTableBook = existing
    ? !justRead.chapterLabel || justRead.chapterLabel === existing.chapterLabel
      ? existing
      // The cached row describes an older place: its percent, headline and
      // recap belong there, not where the reader just stopped.
      : { ...existing, chapterLabel: justRead.chapterLabel, headline: justRead.headline, percent: null, recap: null }
    : {
        bookId: justRead.bookId,
        title: book?.title ?? justRead.title,
        author: book?.author ?? '',
        cover: bookCoverSrc({ bookId: justRead.bookId, art: book?.art }),
        wordCount: book?.wordCount ?? null,
        displayYear: book?.displayYear || '',
        tone: book?.cover?.background ?? null,
        chapterLabel: justRead.chapterLabel,
        headline: justRead.headline,
        percent: null,
        recap: null,
      }
  const reading = [lead, ...table.reading.filter(row => row.bookId !== justRead.bookId)]
  return { ...table, mode: 'returning', reading, shelfReading: reading }
}

function summaryRequestFor(row: ReadingListRow, book: CatalogueBook | undefined): LabRecapRequest | null {
  const { target } = row
  if (!target.editionKey) return null
  const edition = book?.editions.find(item => item.key === target.editionKey)
  // Prepared recaps stay English-only, including the offered Danish edition.
  if (edition?.language === 'da' || target.editionKey.endsWith('-da')) return null
  return {
    bookId: row.bookId,
    editionKey: target.editionKey,
    chapterNumber: target.chapterNumber,
    paragraphIndex: target.paragraphIndex,
    completed: row.progress === 'finished',
    // Match the automatic reader preparation's exact current-chapter scope.
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
    if (!decision.allowed) { trackFunnel('anon_limit_reached', { feature: 'recap' }); return { status: 'account-required', text: null } }
    const result = await requestLabRecapSummary({ request, token: auth.token }).catch(() => ({ ok: false as const, error: 'request failed' }))
    if (!result.ok) return { status: 'unavailable', text: null }
    if (decision.reason === 'free' && !result.response.cached) recordLabAiAction()
    if (!result.response.cached) {
      trackFunnelOnce('ai_first_use', { signed_in: Boolean(auth.userId), feature: 'recap' })
      if (auth.userId) trackFunnel('member_ai_use', { feature: 'recap' })
    }
    storeRecapSummary(storage('local'), key, result.response.summary, Date.now())
    return { status: 'fresh', text: result.response.summary }
  })()
  summaryOutcomes.set(key, outcome)
  void outcome.then(result => { if (result.status !== 'fresh' && result.status !== 'cached') summaryOutcomes.delete(key) })
  return outcome
}

/**
 * My shelf's × on a book being read or saved: off My shelf, its place kept. The viewer's
 * fast-paint snapshot is dropped with it, so the next refresh cannot paint the book back
 * before the account's membership is read (an added book's catalogue arrives later still).
 */
export async function removeFromShelf(bookId: string) {
  const auth = await readAuth()
  const result = await setSavedBook(bookId, false)
  storage('local')?.removeItem('tinct:library-2-table:' + (auth.userId ?? 'guest'))
  lastRows.delete(bookId)
  return result
}

/** Explicit shelf action: only a hide timestamp changes; saved places stay intact. */
export async function hideFromReadingNow(bookId: string): Promise<void> {
  if (!bookId || bookId.length > 80) throw new Error('Invalid book')
  const auth = await readAuth()
  // An own book is hidden on this device only: its id never reaches the account.
  if (isUserBookId(bookId)) {
    hideOwnFromReadingTable(userBookHex(bookId)!)
    storage('local')?.removeItem('tinct:library-2-table:' + (auth.userId ?? 'guest'))
    return
  }
  const local = readLabPositionLocal(LIBRARY_POSITION_DEVICE_ID)
  if (local.owner && local.owner !== auth.userId) throw new Error('Account changed')
  await setSavedBook(bookId, true, { tableHidden: true })
  if ((await readAuth()).userId !== auth.userId) throw new Error('Account changed')
  const next = withHiddenFromReadingNow({ ...local, owner: auth.userId }, bookId, Date.now())
  const stored = writeLabPositionLocal(next)
  // Invalidate only this viewer's fast-paint snapshot before the next fresh load.
  storage('local')?.removeItem('tinct:library-2-table:' + (auth.userId ?? 'guest'))
  lastRows.delete(bookId)
  if (auth.token && isOnline()) await putLabPositionCloud(auth.token, stored)
}

/**
 * The library page's account state follows Supabase: its `signed-in` class (set by
 * boot.js from the signed-in cookie before anything loads) is corrected when the
 * session resolves and changes on sign-in or sign-out, and `library2:auth` tells
 * the page, so Add to Tinct (add-to-tinct.js) appears or goes without a reload.
 */
export function syncLibraryAuth(signedIn: boolean, doc: Document = document): boolean {
  const root = doc.documentElement
  if (root.classList.contains('signed-in') === signedIn) return false
  root.classList.toggle('signed-in', signedIn)
  doc.defaultView?.dispatchEvent(new CustomEvent('library2:auth', { detail: { signedIn } }))
  return true
}
if (supabase && typeof document !== 'undefined') {
  try {
    supabase.auth.onAuthStateChange?.((_event, session) => { syncLibraryAuth(Boolean(session?.user)) })
  } catch { /* the boot-time class stays */ }
}

// Loaded as a standalone script by public/lab/library_2/reading-table.js; the
// production build strips unused entry exports, so the API is published here.
;(window as Window & { __tinctLibraryTwoReading?: unknown }).__tinctLibraryTwoReading = { loadReadingTable, summaryFor, readerDestination, loadSavedBooks, setSavedBook, removeFromShelf, hideFromReadingNow, introductionProgress, addCatalogueBook }
