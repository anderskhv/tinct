/**
 * Loads a registered book for the margin preview: its main edition's text
 * (the edition loader: whole file or chapter shards, with accepted patches)
 * and the book reader's place in it, READ ONLY.
 *
 * The preview never writes the book reader's state. Its place, highlights,
 * notes and cards live in the margin reader's own local store under the
 * preview's key (`tinct-addbook:*:preview:<bookId>`, js/tinct-book.js). Here
 * the device's position record is parsed straight from localStorage (no
 * migration write-back, no device id minted) and the account's record is a
 * plain GET of /api/lab-position (no PUT, no merge stored).
 */
import { getBook } from '../../data/bookRegistry'
import { loadEdition } from '../../data/editionLoader'
import { apiUrl } from '../../utils/apiUrl'
import { LAB_POSITION_STORAGE_KEY, libraryResumePlace, parseLabPositionState, type LabBookPlace } from '../labPosition'
import { LAB_PREFS_KEY, parseLabPrefs } from '../labPrefs'
import type { EditionData } from '../../types'
import type { MarginPreviewAt } from './marginPreviewFlag'
import { READER_BOOT_POSITION_PREFETCH, type ReaderBootPositionPrefetch } from '../readerBoot'
import { loadLabBibleChapterParagraphs, loadLabBibleOutline } from '../labSource'
import { bibleLinkPlace, bibleSavedPlace, bibleWindow, createBibleLazy, MARGIN_BIBLE_ID, pendingBibleChapter, type BibleManifestEntry } from './marginPreviewBible'
import {
  isMarginPreviewBook,
  marginPreviewChapters,
  marginPreviewEditionKey,
  marginPreviewStart,
  newerPlace,
  normalReaderHref,
  type MarginPreviewBook,
} from './marginPreviewModel'

/** How long the account's place is waited for before the device's place is used. */
export const MARGIN_PREVIEW_CLOUD_WAIT_MS = 3000

export interface MarginPreviewDeps {
  /** Storage holding the book reader's records (read only). */
  storage?: Pick<Storage, 'getItem'> | null
  fetchImpl?: typeof fetch
  /** The signed-in reader's access token, or null when signed out. */
  readToken?: () => Promise<string | null>
  loadEditionImpl?: (bookId: string, editionKey: string) => Promise<EditionData>
  cloudWaitMs?: number
  /**
   * The place the link named (Margin from the book reader's layouts, marginPreviewFlag): the preview opens
   * there, in that edition, newer than any place kept so far.
   */
  at?: MarginPreviewAt | null
  now?: () => number
  /** The Bible: its chapter manifest, and one chapter's paragraphs (labSource, as the Bible reader loads them). */
  loadBibleOutline?: (editionKey: string) => Promise<{ chapters: BibleManifestEntry[] }>
  loadBibleChapter?: (editionKey: string, entry: { number: number; path?: string }) => Promise<string[]>
}

const registeredId = (bookId: string) => getBook(bookId)?.id

function readJson(storage: Pick<Storage, 'getItem'> | null | undefined, key: string): unknown {
  if (!storage) return null
  try { return JSON.parse(storage.getItem(key) || 'null') } catch { return null }
}

/** The book reader's place for this book on this device, parsed without writing anything back. */
export function deviceMainPlace(bookId: string, storage: Pick<Storage, 'getItem'> | null | undefined): LabBookPlace | null {
  const raw = readJson(storage, LAB_POSITION_STORAGE_KEY)
  if (!raw) return null
  return libraryResumePlace(parseLabPositionState(raw, 'margin-preview'), bookId, registeredId)
}

/**
 * The same GET the reader's head script may already have started with this token (readerBootEntry, round 3): taken
 * once if recent, as the book reader takes it (labPositionStore). -> its body, or null to ask again.
 */
async function bootPositionPrefetch(token: string): Promise<unknown | null> {
  if (typeof window === 'undefined') return null
  const slot = window as unknown as Record<string, ReaderBootPositionPrefetch | undefined>
  const early = slot[READER_BOOT_POSITION_PREFETCH]
  if (!early) return null
  delete slot[READER_BOOT_POSITION_PREFETCH]
  if (early.token !== token || Date.now() - early.at > 20_000) return null
  return early.body.catch(() => null)
}

/** The account's place for this book: one GET, bounded; null signed out, offline or slow. */
export async function accountMainPlace(bookId: string, deps: MarginPreviewDeps): Promise<LabBookPlace | null> {
  const token = await (deps.readToken?.() ?? Promise.resolve(null)).catch(() => null)
  if (!token) return null
  const fetchImpl = deps.fetchImpl ?? fetch
  const controller = typeof AbortController === 'undefined' ? null : new AbortController()
  const read = (async () => {
    try {
      const early = await bootPositionPrefetch(token)
      if (early) return libraryResumePlace(parseLabPositionState(early, 'margin-preview'), bookId, registeredId)
      const res = await fetchImpl(apiUrl('/api/lab-position'), { method: 'GET', headers: { Authorization: `Bearer ${token}` }, ...(controller ? { signal: controller.signal } : {}) })
      if (!res.ok) return null
      return libraryResumePlace(parseLabPositionState(await res.json(), 'margin-preview'), bookId, registeredId)
    } catch {
      return null
    }
  })()
  let timer: ReturnType<typeof setTimeout> | undefined
  const late = new Promise<null>(resolve => { timer = setTimeout(() => { controller?.abort(); resolve(null) }, deps.cloudWaitMs ?? MARGIN_PREVIEW_CLOUD_WAIT_MS) })
  try { return await Promise.race([read, late]) } finally { clearTimeout(timer) }
}

/** A link's place as a book reader's place, saved now: it wins over the preview's own. */
function linkPlace(bookId: string, at: MarginPreviewAt, now: number): LabBookPlace {
  return {
    bookId, headerBook: bookId, chapterNumber: at.chapterNumber, sequentialChapter: at.chapterNumber,
    paragraphIndex: at.paragraphIndex, wordIndex: at.wordIndex,
    ...(at.editionKey ? { primaryEditionKey: at.editionKey } : {}),
    updatedAt: now, deviceId: 'margin-preview', rev: 0,
  }
}

export async function loadMarginPreviewBook(bookId: string, deps: MarginPreviewDeps = {}): Promise<MarginPreviewBook> {
  const book = getBook(bookId)
  if (!isMarginPreviewBook(book)) throw new Error(`${bookId} cannot open in the margin preview`)
  if (book.id === MARGIN_BIBLE_ID) return loadMarginPreviewBible(book, deps)
  const storage = deps.storage === undefined ? (typeof localStorage === 'undefined' ? null : localStorage) : deps.storage
  const devicePlace = deviceMainPlace(bookId, storage)
  const prefs = parseLabPrefs(readJson(storage, LAB_PREFS_KEY), 'desktop')
  const keyFor = (place: LabBookPlace | null) => marginPreviewEditionKey(book, { placeEdition: place?.primaryEditionKey, prefsEdition: prefs.primaryEdition })
  // The edition this device's place reads in is fetched while the account's place is asked for (round 3: the text
  // waited for that request first); the account's newer place in another edition, rarely, loads that one instead.
  const load = deps.loadEditionImpl ?? loadEdition
  const guess = keyFor(devicePlace)
  const early = guess ? load(bookId, guess) : null
  early?.catch(() => {})
  const named = deps.at ? linkPlace(bookId, deps.at, deps.now?.() ?? Date.now()) : null
  const place = named ?? newerPlace(devicePlace, await accountMainPlace(bookId, deps))
  const editionKey = keyFor(place)
  if (!editionKey) throw new Error(`${bookId} has no edition to read`)
  const data = await (editionKey === guess && early ? early : load(bookId, editionKey))
  const chapters = marginPreviewChapters(data)
  if (!chapters.length) throw new Error(`${bookId} ${editionKey} has no chapters`)
  const edition = book.editions.find(e => e.key === editionKey)!
  const aligned = (key: string) => book.editions.find(e => e.key === key)?.aligned !== false
  return {
    bookId,
    editionKey,
    editionLabel: edition.label,
    title: book.title,
    author: book.author,
    language: edition.language || 'en',
    chapters,
    start: marginPreviewStart(place, chapters, { editionKey, aligned }),
    normalHref: normalReaderHref(bookId),
  }
}

/**
 * The Bible (marginPreviewBible.ts): its manifest, then the chapter it opens at and its neighbours; the rest load as
 * the frame asks. The place is the newest of this device's and the account's biblical-book pins (or the link's),
 * checked against the manifest as the Bible reader checks one.
 */
async function loadMarginPreviewBible(book: NonNullable<ReturnType<typeof getBook>>, deps: MarginPreviewDeps): Promise<MarginPreviewBook> {
  const bookId = book.id
  const storage = deps.storage === undefined ? (typeof localStorage === 'undefined' ? null : localStorage) : deps.storage
  const prefs = parseLabPrefs(readJson(storage, LAB_PREFS_KEY), 'desktop')
  const keyFor = (place: LabBookPlace | null) => marginPreviewEditionKey(book, { placeEdition: place?.primaryEditionKey, prefsEdition: prefs.primaryEdition })
  const outline = deps.loadBibleOutline ?? loadLabBibleOutline
  const fetchChapter = deps.loadBibleChapter ?? loadLabBibleChapterParagraphs
  const devicePlace = deviceMainPlace(bookId, storage)
  // The edition of a link, else of this device's place, is asked for while the account's place is.
  const guess = (deps.at?.editionKey && book.editions.some(e => e.key === deps.at!.editionKey) ? deps.at.editionKey : null) ?? keyFor(devicePlace)
  const early = guess ? outline(guess) : null
  early?.catch(() => {})
  const account = deps.at ? null : await accountMainPlace(bookId, deps)
  const firstKey = deps.at ? guess : keyFor(newerPlace(devicePlace, account))
  if (!firstKey) throw new Error(`${bookId} has no edition to read`)
  const manifest = await (firstKey === guess && early ? early : outline(firstKey))
  let entries = manifest.chapters || []
  let chapters = entries.map(pendingBibleChapter)
  if (!chapters.length) throw new Error(`${bookId} ${firstKey} has no chapters`)
  const now = deps.now?.() ?? Date.now()
  const place = deps.at
    ? bibleLinkPlace(chapters, deps.at, now)
    : newerPlace(bibleSavedPlace(devicePlace, chapters), bibleSavedPlace(account, chapters))
  // A place read in another edition opens in that one, as other books do (its own manifest).
  let editionKey = firstKey
  const placeKey = keyFor(place)
  if (!deps.at && placeKey && placeKey !== firstKey) {
    editionKey = placeKey
    entries = (await outline(placeKey)).chapters || []
    chapters = entries.map(pendingBibleChapter)
    if (!chapters.length) throw new Error(`${bookId} ${placeKey} has no chapters`)
  }
  const edition = book.editions.find(e => e.key === editionKey)!
  const aligned = (key: string) => book.editions.find(e => e.key === key)?.aligned !== false
  const lazy = createBibleLazy(chapters, entry => fetchChapter(editionKey, entry), new Map(entries.map(entry => [entry.number, entry.path])))
  const opening = marginPreviewStart(place, chapters, { editionKey, aligned, sequential: true })
  // The chapter it opens at and its neighbours, before the frame draws it (the place is found in real lines).
  await lazy.load(bibleWindow(chapters, opening.chapterNumber))
  if (chapters.find(c => c.number === opening.chapterNumber)?.pending) throw new Error(`${bookId} ${editionKey} chapter ${opening.chapterNumber} did not load`)
  return {
    bookId,
    editionKey,
    editionLabel: edition.label,
    title: book.title,
    author: book.author,
    language: edition.language || 'en',
    chapters,
    // Checked again now that its chapter's text is in (its word).
    start: marginPreviewStart(place, chapters, { editionKey, aligned, sequential: true }),
    normalHref: normalReaderHref(bookId),
    lazy,
  }
}
