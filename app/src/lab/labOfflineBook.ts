/**
 * A book readable offline in full: every file the reader asks for to read
 * this book in its main and compare editions, written into the service
 * worker's edition cache under the exact URLs the loaders request
 * (editionUrls.ts), so a flight-mode reader can open any chapter. The reader
 * shell itself (bundle, lazy chunks, fonts, /reader) is cached by the service
 * worker on request (CACHE_APP_SHELL in public/sw.js).
 *
 * Every book a reader opens is saved this way in the background, with no tap
 * (autoSaveBookOffline, started by the reader once its first page is up); the
 * "Make available offline" row in the Book editions sheet runs the same save
 * in the foreground and shows the result.
 */
import { CHAPTER_SHARDED_EDITION_IDS } from '../data/editionShardRegistry'
import { bookHasThreads } from '../data/threadsAvailability'
import { editionShardManifestUrl, editionShardPath, editionShardUrl, editionWholeUrl } from '../data/editionUrls'

/** The service worker's edition/audio cache (CACHE_NAME in public/sw.js). */
export const OFFLINE_EDITION_CACHE = 'tinct-offline-v3'
const RECORD_KEY = 'tinct:offline-books'
/** Books the reader removed from offline: the background save leaves them be. */
const REMOVED_KEY = 'tinct:offline-books-removed'
/** Sent on window when a save completes, so an open Book editions row can show it. */
export const OFFLINE_BOOK_SAVED_EVENT = 'tinct:offline-book-saved'
const SHARDED = new Set<string>(CHAPTER_SHARDED_EDITION_IDS)

export interface OfflineEditionEntry {
  editionKey: string
  /** The chapter manifest, when the reader loads this edition chapter by chapter. */
  manifestUrl?: string
  /** The whole-book JSON, when it does not. */
  wholeUrl?: string
}

/** Whether the reader loads this edition by chapter shards (loadEditionWindow / the Bible loader). */
export function offlineEditionIsSharded(bookId: string, editionKey: string, shardWindowDisabled = false): boolean {
  if (bookId === 'bible') return true
  return !shardWindowDisabled && SHARDED.has(`${bookId}-${editionKey}`)
}

/** The first request per edition: its manifest, or its one whole-book file. */
export function offlineEditionEntry(bookId: string, editionKey: string, version: string, shardWindowDisabled = false): OfflineEditionEntry {
  return offlineEditionIsSharded(bookId, editionKey, shardWindowDisabled)
    ? { editionKey, manifestUrl: editionShardManifestUrl(bookId, editionKey, version) }
    : { editionKey, wholeUrl: editionWholeUrl(bookId, editionKey, version) }
}

/** Every chapter file a manifest names, as the loaders request it. */
export function offlineChapterUrls(bookId: string, editionKey: string, version: string, manifest: unknown): string[] {
  const chapters = (manifest as { chapters?: unknown })?.chapters
  if (!Array.isArray(chapters)) return []
  const urls: string[] = []
  for (const entry of chapters as Array<{ number?: unknown; path?: unknown }>) {
    if (typeof entry?.number !== 'number') continue
    const path = typeof entry.path === 'string' && entry.path ? entry.path : editionShardPath(entry.number)
    urls.push(editionShardUrl(bookId, editionKey, path, version))
  }
  return [...new Set(urls)]
}

/** Book-level files the reader asks for beside the text: its cast, and verse lines for plays. */
export function offlineBookExtraUrls(bookId: string, version: string, hasVerseLines: boolean): string[] {
  const v = `?v=${encodeURIComponent(version)}`
  return [
    ...(bookHasThreads(bookId) ? [`/data/editions/${bookId}-threads.json${v}`] : []),
    ...(hasVerseLines ? [`/data/editions/${bookId}-lines.json${v}`] : []),
  ]
}

/** The editions to save: main, plus compare when it is a different edition. */
export function offlineEditionKeys(primary: string, compare?: string | null): string[] {
  return compare && compare !== primary ? [primary, compare] : [primary]
}

/** Whether a cached request belongs to this book's saved editions (for Remove). */
export function isOfflineBookUrl(url: string, bookId: string, editionKeys: string[]): boolean {
  let path: string
  try { path = new URL(url, 'https://tinct.app').pathname } catch { return false }
  if (path === `/data/editions/${bookId}-threads.json` || path === `/data/editions/${bookId}-lines.json`) return true
  return editionKeys.some(key => (
    path === `/data/editions/${bookId}-${key}.json` || path.startsWith(`/data/editions-chapters/${bookId}-${key}/`)
  ))
}

export interface OfflineBookRecord {
  editions: string[]
  version: string
  files: number
  savedAt: number
}

function readRecords(): Record<string, OfflineBookRecord> {
  try {
    const parsed = JSON.parse(localStorage.getItem(RECORD_KEY) || '{}')
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

function writeRecords(records: Record<string, OfflineBookRecord>): void {
  try { localStorage.setItem(RECORD_KEY, JSON.stringify(records)) } catch { /* the cache still holds the files */ }
}

/** Saved for this build and for every edition now open. */
export function offlineBookSaved(bookId: string, editionKeys: string[], version: string, record = readRecords()[bookId]): boolean {
  return !!record && record.version === version && editionKeys.every(key => record.editions.includes(key))
}

export function readOfflineBookRecord(bookId: string): OfflineBookRecord | undefined {
  return readRecords()[bookId]
}

export function offlineBookSupported(): boolean {
  return typeof window !== 'undefined' && 'caches' in window && typeof navigator !== 'undefined' && 'serviceWorker' in navigator
}

/** Ask the browser to keep this site's storage (Safari otherwise evicts it after weeks unused). */
export function requestPersistentStorage(): void {
  try { void navigator.storage?.persist?.().catch(() => false) } catch { /* optional */ }
}

function buildVersion(): string {
  return typeof __BUILD_VERSION__ === 'string' ? __BUILD_VERSION__ : 'dev'
}

function shardWindowDisabled(): boolean {
  try { return localStorage.getItem('tinct:chapter-sharded-editions') === '0' } catch { return false }
}

/** The service worker caches the reader page, its bundles (lazy chunks too) and fonts. */
async function cacheAppShell(timeoutMs = 60000): Promise<boolean> {
  const registration = await Promise.race([
    navigator.serviceWorker.ready,
    new Promise<null>(resolve => setTimeout(() => resolve(null), 10000)),
  ])
  const worker = registration?.active
  if (!worker) return false
  return new Promise(resolve => {
    const channel = new MessageChannel()
    const timer = setTimeout(() => resolve(false), timeoutMs)
    channel.port1.onmessage = event => { clearTimeout(timer); resolve(!!event.data?.ok) }
    worker.postMessage({ type: 'CACHE_APP_SHELL' }, [channel.port2])
  })
}

interface CacheOneOptions {
  /**
   * Keep a copy cached under an earlier build's ?v= instead of downloading it
   * again (the version changes with every deploy; the text almost never). The
   * service worker answers an offline request from any version of a file, and
   * an online one from the network, so the reader never sees the old copy while
   * it is online.
   */
  anyVersion?: boolean
  /** Background save: the browser fetches these after everything the reader asks for. */
  low?: boolean
  signal?: AbortSignal
}

/** The paths in the cache, any ?v= (one listing, not a cache scan per file). */
async function cachedPaths(cache: Cache): Promise<Set<string>> {
  return new Set((await cache.keys()).map(request => new URL(request.url).pathname))
}

async function cacheOne(cache: Cache, paths: Set<string>, url: string, { anyVersion = false, low = false, signal }: CacheOneOptions = {}): Promise<Response | null> {
  if (signal?.aborted) throw new Error('stopped')
  const path = new URL(url, location.href).pathname
  const cachedSomeVersion = paths.has(path)
  const existing = await cache.match(url) ?? (anyVersion && cachedSomeVersion ? await cache.match(url, { ignoreSearch: true }) : undefined)
  if (existing) return existing
  const response = await fetch(url, low ? { priority: 'low', signal } as RequestInit : { signal })
  // A book without a cast or verse-line file answers 404: nothing to keep.
  if (response.status === 404) return null
  if (!response.ok) throw new Error(`HTTP ${response.status} for ${url}`)
  await cache.put(url, response.clone())
  paths.add(path)
  // One copy per file: drop the ones an earlier build's ?v= left behind.
  if (cachedSomeVersion) {
    const kept = new URL(url, location.href).href
    const variants = await cache.keys(url, { ignoreSearch: true })
    await Promise.all(variants.filter(request => request.url !== kept).map(request => cache.delete(request)))
  }
  return response
}

async function runPool<T>(items: T[], size: number, work: (item: T) => Promise<void>): Promise<void> {
  let next = 0
  let failed = false
  await Promise.all(Array.from({ length: Math.min(size, items.length) }, async () => {
    // One failure ends the save: the other workers stop too (the next run resumes).
    try {
      while (!failed && next < items.length) await work(items[next++])
    } catch (error) {
      failed = true
      throw error
    }
  }))
}

export interface SaveOfflineInput {
  bookId: string
  editionKeys: string[]
  hasVerseLines: boolean
  onProgress: (done: number, total: number) => void
  /** The background save: two requests at a time, at low priority, stoppable. */
  background?: { signal?: AbortSignal }
}

/** Download every file the reader needs for this book; resolves once all are in the cache. */
export async function saveBookOffline({ bookId, editionKeys, hasVerseLines, onProgress, background }: SaveOfflineInput): Promise<OfflineBookRecord> {
  const version = buildVersion()
  const disabled = shardWindowDisabled()
  const cache = await caches.open(OFFLINE_EDITION_CACHE)
  const paths = await cachedPaths(cache)
  const entries = editionKeys.map(key => offlineEditionEntry(bookId, key, version, disabled))
  const extras = offlineBookExtraUrls(bookId, version, hasVerseLines)
  const options: CacheOneOptions = background ? { low: true, signal: background.signal } : {}
  // A reader who saves by hand wants it to stick, the background save included.
  if (!background) setOfflineBookRemoved(bookId, false)
  // Manifests first, for this build: they say which chapter files follow.
  let done = 0
  let total = entries.length + extras.length + 1
  onProgress(done, total)
  const chapterUrls: string[] = []
  for (const entry of entries) {
    const response = await cacheOne(cache, paths, (entry.manifestUrl || entry.wholeUrl)!, { ...options, anyVersion: !entry.manifestUrl })
    if (!response) throw new Error(`Missing ${entry.editionKey}`)
    if (entry.manifestUrl) chapterUrls.push(...offlineChapterUrls(bookId, entry.editionKey, version, await response.clone().json()))
    done += 1
    total = entries.length + extras.length + 1 + chapterUrls.length
    onProgress(done, total)
  }
  await runPool([...extras, ...chapterUrls], background ? 2 : 8, async url => {
    await cacheOne(cache, paths, url, { ...options, anyVersion: true })
    done += 1
    onProgress(done, total)
  })
  // Removed while it ran: the reader's choice stands.
  if (background && (background.signal?.aborted || offlineBookRemoved(bookId))) throw new Error('stopped')
  const shell = await cacheAppShell()
  if (!shell) throw new Error('reader page not cached')
  done += 1
  onProgress(done, total)
  const records = readRecords()
  // Editions saved earlier stay in the cache, so they stay in the record (Remove clears them all).
  const editions = [...new Set([...editionKeys, ...(records[bookId]?.editions ?? [])])]
  const record: OfflineBookRecord = { editions, version, files: total, savedAt: Date.now() }
  records[bookId] = record
  writeRecords(records)
  try { window.dispatchEvent(new CustomEvent(OFFLINE_BOOK_SAVED_EVENT, { detail: { bookId } })) } catch { /* nothing listens */ }
  return record
}

function readRemoved(): string[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(REMOVED_KEY) || '[]')
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === 'string') : []
  } catch {
    return []
  }
}

function setOfflineBookRemoved(bookId: string, removed: boolean): void {
  const ids = readRemoved().filter(id => id !== bookId)
  try { localStorage.setItem(REMOVED_KEY, JSON.stringify(removed ? [...ids, bookId] : ids)) } catch { /* best effort */ }
}

export function offlineBookRemoved(bookId: string): boolean {
  return readRemoved().includes(bookId)
}

export interface AutoSaveInput {
  bookId: string
  editionKeys: string[]
  hasVerseLines: boolean
  signal?: AbortSignal
}

/**
 * Whether the background save should run now: a browser with a service
 * worker, online, not asking to save data, not already saved for this build
 * and these editions, and not a book the reader removed from offline.
 */
export function shouldAutoSaveBookOffline(bookId: string, editionKeys: string[]): boolean {
  if (!offlineBookSupported() || !bookId || !editionKeys.length) return false
  if (typeof navigator !== 'undefined' && navigator.onLine === false) return false
  const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection
  if (connection?.saveData) return false
  if (offlineBookRemoved(bookId)) return false
  return !offlineBookSaved(bookId, editionKeys, buildVersion())
}

const autoSaves = new Map<string, Promise<boolean>>()

/**
 * The background whole-book save: quiet (resolves false on any failure, never
 * throws), one at a time per book, resumable (files already cached, under any
 * build's ?v=, are not fetched again).
 */
export function autoSaveBookOffline({ bookId, editionKeys, hasVerseLines, signal }: AutoSaveInput): Promise<boolean> {
  if (!shouldAutoSaveBookOffline(bookId, editionKeys)) return Promise.resolve(false)
  const key = `${bookId}\u0000${editionKeys.join(',')}`
  const running = autoSaves.get(key)
  if (running) return running
  const save = saveBookOffline({ bookId, editionKeys, hasVerseLines, onProgress: () => {}, background: { signal } })
    .then(() => true, () => false)
    .finally(() => { autoSaves.delete(key) })
  autoSaves.set(key, save)
  return save
}

/** Undo: drop this book's saved files and its record. */
export async function removeBookOffline(bookId: string): Promise<void> {
  setOfflineBookRemoved(bookId, true)
  const records = readRecords()
  const editions = records[bookId]?.editions ?? []
  delete records[bookId]
  writeRecords(records)
  const cache = await caches.open(OFFLINE_EDITION_CACHE)
  const requests = await cache.keys()
  await Promise.all(requests.filter(request => isOfflineBookUrl(request.url, bookId, editions)).map(request => cache.delete(request)))
}
