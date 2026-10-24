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
import { isChapterShardedEdition, loadEdition, loadEditionWindow } from '../../data/editionLoader'
import { apiUrl } from '../../utils/apiUrl'
import { LAB_POSITION_STORAGE_KEY, libraryResumePlace, parseLabPositionState, type LabBookPlace } from '../labPosition'
import { LAB_PREFS_KEY, parseLabPrefs } from '../labPrefs'
import type { EditionData } from '../../types'
import type { MarginPreviewAt } from './marginPreviewFlag'
import { READER_BOOT_POSITION_PREFETCH, type ReaderBootPositionPrefetch } from '../readerBoot'
import {
  isMarginPreviewBook,
  marginPreviewChapters,
  marginPreviewEditionKey,
  marginPreviewStart,
  marginPreviewWindowChapters,
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
  /**
   * The chapters around a place (editionLoader loadEditionWindow) for the first chapter first; null: none (the
   * whole book only). Defaults to the loader's window for a chapter-sharded edition, none otherwise.
   */
  loadWindowImpl?: ((bookId: string, editionKey: string, chapterNumber: number) => Promise<EditionData>) | null
  cloudWaitMs?: number
  /**
   * The place the link named (Margin from the book reader's layouts, marginPreviewFlag): the preview opens
   * there, in that edition, newer than any place kept so far.
   */
  at?: MarginPreviewAt | null
  now?: () => number
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

/**
 * The book in two parts (the first chapter first, Anders, 22 Oct 2026: "when we do the switch we also need to do the
 * first chapter trick"): `first`, the chapters around the place as soon as they are in (the others `pending`), or
 * null when there is no window to read (an edition that is not chapter-sharded, or the whole book came first);
 * `full`, the whole book as before. Both open at the same place: it is decided once, for both.
 */
export interface MarginPreviewParts {
  first: Promise<MarginPreviewBook | null>
  full: Promise<MarginPreviewBook>
}

export function loadMarginPreviewBookParts(bookId: string, deps: MarginPreviewDeps = {}): MarginPreviewParts {
  const book = getBook(bookId)
  if (!isMarginPreviewBook(book)) {
    const failed = Promise.reject(new Error(`${bookId} cannot open in the margin preview`))
    failed.catch(() => {})
    return { first: Promise.resolve(null), full: failed }
  }
  const storage = deps.storage === undefined ? (typeof localStorage === 'undefined' ? null : localStorage) : deps.storage
  const devicePlace = deviceMainPlace(bookId, storage)
  const prefs = parseLabPrefs(readJson(storage, LAB_PREFS_KEY), 'desktop')
  const keyFor = (place: LabBookPlace | null) => marginPreviewEditionKey(book, { placeEdition: place?.primaryEditionKey, prefsEdition: prefs.primaryEdition })
  // The edition this device's place reads in is fetched while the account's place is asked for (round 3: the text
  // waited for that request first); the account's newer place in another edition, rarely, loads that one instead.
  const load = deps.loadEditionImpl ?? loadEdition
  const loadWindow = deps.loadWindowImpl === undefined
    ? (id: string, key: string, chapterNumber: number) => (isChapterShardedEdition(id, key) ? loadEditionWindow(id, key, chapterNumber) : null)
    : deps.loadWindowImpl
  const guess = keyFor(devicePlace)
  const early = guess ? load(bookId, guess) : null
  early?.catch(() => {})
  const named = deps.at ? linkPlace(bookId, deps.at, deps.now?.() ?? Date.now()) : null
  const placed = (async () => {
    const place = named ?? newerPlace(devicePlace, await accountMainPlace(bookId, deps))
    const editionKey = keyFor(place)
    if (!editionKey) throw new Error(`${bookId} has no edition to read`)
    return { place, editionKey }
  })()
  const edition = (editionKey: string) => book.editions.find(e => e.key === editionKey)!
  const aligned = (key: string) => book.editions.find(e => e.key === key)?.aligned !== false
  const modelOf = (place: LabBookPlace | null, editionKey: string, chapters: MarginPreviewBook['chapters']): MarginPreviewBook => ({
    bookId,
    editionKey,
    editionLabel: edition(editionKey).label,
    title: book.title,
    author: book.author,
    language: edition(editionKey).language || 'en',
    chapters,
    start: marginPreviewStart(place, chapters, { editionKey, aligned }),
    normalHref: normalReaderHref(bookId),
  })
  const full = placed.then(async ({ place, editionKey }) => {
    const data = await (editionKey === guess && early ? early : load(bookId, editionKey))
    const chapters = marginPreviewChapters(data)
    if (!chapters.length) throw new Error(`${bookId} ${editionKey} has no chapters`)
    return modelOf(place, editionKey, chapters)
  })
  full.catch(() => {})
  const first = placed.then(async ({ place, editionKey }) => {
    const task = loadWindow ? loadWindow(bookId, editionKey, place?.chapterNumber ?? 1) : null
    if (!task) return null
    // The whole book first (cached, or quicker): no window is needed.
    const data = await Promise.race([task, full.then(() => null, () => null)])
    const chapters = data ? marginPreviewWindowChapters(data) : null
    if (!chapters?.length) return null
    const model = modelOf(place, editionKey, chapters)
    // The place's chapter must be one with its text; a place outside the window opens with the whole book.
    const at = chapters.find(c => c.number === model.start.chapterNumber)
    if (!at || at.pending || !at.paragraphs.length) return null
    return { ...model, partial: true as const }
  }).catch(() => null)
  return { first, full }
}

export async function loadMarginPreviewBook(bookId: string, deps: MarginPreviewDeps = {}): Promise<MarginPreviewBook> {
  return loadMarginPreviewBookParts(bookId, { loadWindowImpl: null, ...deps }).full
}
