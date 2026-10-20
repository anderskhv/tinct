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
import { READER_BOOT_POSITION_PREFETCH, type ReaderBootPositionPrefetch } from '../readerBoot'
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

export async function loadMarginPreviewBook(bookId: string, deps: MarginPreviewDeps = {}): Promise<MarginPreviewBook> {
  const book = getBook(bookId)
  if (!isMarginPreviewBook(book)) throw new Error(`${bookId} cannot open in the margin preview`)
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
  const place = newerPlace(devicePlace, await accountMainPlace(bookId, deps))
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
