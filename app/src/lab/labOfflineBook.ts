/**
 * "Make available offline" (Book editions sheet): every file the reader asks
 * for to read this book in its main and compare editions, written into the
 * service worker's edition cache under the exact URLs the loaders request
 * (editionUrls.ts), so a flight-mode reader can open any chapter. The reader
 * shell itself (bundle, lazy chunks, fonts, /reader) is cached by the service
 * worker on request (CACHE_APP_SHELL in public/sw.js).
 */
import { CHAPTER_SHARDED_EDITION_IDS } from '../data/editionShardRegistry'
import { bookHasThreads } from '../data/threadsAvailability'
import { editionShardManifestUrl, editionShardPath, editionShardUrl, editionWholeUrl } from '../data/editionUrls'

/** The service worker's edition/audio cache (CACHE_NAME in public/sw.js). */
export const OFFLINE_EDITION_CACHE = 'tinct-offline-v3'
const RECORD_KEY = 'tinct:offline-books'
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

async function cacheOne(cache: Cache, url: string): Promise<Response | null> {
  const existing = await cache.match(url)
  if (existing) return existing
  const response = await fetch(url)
  // A book without a cast or verse-line file answers 404: nothing to keep.
  if (response.status === 404) return null
  if (!response.ok) throw new Error(`HTTP ${response.status} for ${url}`)
  await cache.put(url, response.clone())
  return response
}

async function runPool<T>(items: T[], size: number, work: (item: T) => Promise<void>): Promise<void> {
  let next = 0
  await Promise.all(Array.from({ length: Math.min(size, items.length) }, async () => {
    while (next < items.length) await work(items[next++])
  }))
}

export interface SaveOfflineInput {
  bookId: string
  editionKeys: string[]
  hasVerseLines: boolean
  onProgress: (done: number, total: number) => void
}

/** Download every file the reader needs for this book; resolves once all are in the cache. */
export async function saveBookOffline({ bookId, editionKeys, hasVerseLines, onProgress }: SaveOfflineInput): Promise<OfflineBookRecord> {
  const version = buildVersion()
  const disabled = shardWindowDisabled()
  const cache = await caches.open(OFFLINE_EDITION_CACHE)
  const entries = editionKeys.map(key => offlineEditionEntry(bookId, key, version, disabled))
  const extras = offlineBookExtraUrls(bookId, version, hasVerseLines)
  // Manifests first: they say how many chapter files follow.
  let done = 0
  let total = entries.length + extras.length + 1
  onProgress(done, total)
  const chapterUrls: string[] = []
  for (const entry of entries) {
    const response = await cacheOne(cache, (entry.manifestUrl || entry.wholeUrl)!)
    if (!response) throw new Error(`Missing ${entry.editionKey}`)
    if (entry.manifestUrl) chapterUrls.push(...offlineChapterUrls(bookId, entry.editionKey, version, await response.clone().json()))
    done += 1
    total = entries.length + extras.length + 1 + chapterUrls.length
    onProgress(done, total)
  }
  await runPool([...extras, ...chapterUrls], 8, async url => {
    await cacheOne(cache, url)
    done += 1
    onProgress(done, total)
  })
  const shell = await cacheAppShell()
  if (!shell) throw new Error('reader page not cached')
  done += 1
  onProgress(done, total)
  const record: OfflineBookRecord = { editions: editionKeys, version, files: total, savedAt: Date.now() }
  const records = readRecords()
  records[bookId] = record
  writeRecords(records)
  return record
}

/** Undo: drop this book's saved files and its record. */
export async function removeBookOffline(bookId: string): Promise<void> {
  const records = readRecords()
  const editions = records[bookId]?.editions ?? []
  delete records[bookId]
  writeRecords(records)
  const cache = await caches.open(OFFLINE_EDITION_CACHE)
  const requests = await cache.keys()
  await Promise.all(requests.filter(request => isOfflineBookUrl(request.url, bookId, editions)).map(request => cache.delete(request)))
}
