import type { EditionData, EditionKey } from '../types'
import { apiUrl } from '../utils/apiUrl'
import { perfMark, perfMeasure } from '../utils/perf'
import { CHAPTER_SHARDED_EDITION_IDS } from './editionShardRegistry'

const cache = new Map<string, EditionData>()
const inFlight = new Map<string, Promise<EditionData>>()
const manifestCache = new Map<string, ChapterShardManifest>()
const chapterShardCache = new Map<string, string[]>()
const patchCache = new Map<string, EditionPatch[]>()
const patchInFlight = new Map<string, Promise<EditionPatch[]>>()
const PATCH_WAIT_MS = 350

interface EditionPatch {
  chapter_number: number
  paragraph_index: number
  patched_text: string
}

interface ChapterShardManifest {
  format: 'tinct-edition-chapters-v1'
  bookId: string
  editionKey: EditionKey
  chapters: Array<{
    number: number
    title: string
    section?: string
    path: string
    paragraphCount?: number
  }>
  sections?: EditionData['sections']
}

const CHAPTER_SHARDED_EDITIONS = new Set<string>(CHAPTER_SHARDED_EDITION_IDS)

export function chapterShardedEditionsEnabled(): boolean {
  if (import.meta.env.VITE_CHAPTER_SHARDED_EDITIONS === 'true') return true
  if (typeof window === 'undefined') return false
  try {
    return localStorage.getItem('tinct:chapter-sharded-full-editions') === '1'
  } catch {
    return false
  }
}

export function isChapterShardedEdition(bookId: string, editionKey: EditionKey): boolean {
  return CHAPTER_SHARDED_EDITIONS.has(`${bookId}-${editionKey}`)
}

export function editionDataUrl(bookId: string, editionKey: EditionKey): string {
  return `/data/editions/${bookId}-${editionKey}.json?v=${encodeURIComponent(__BUILD_VERSION__)}`
}

export function editionChapterShardManifestUrl(bookId: string, editionKey: EditionKey): string {
  return `/data/editions-chapters/${bookId}-${editionKey}/manifest.json?v=${encodeURIComponent(__BUILD_VERSION__)}`
}

function chapterShardWindowEnabled(bookId: string, editionKey: EditionKey): boolean {
  if (!isChapterShardedEdition(bookId, editionKey)) return false
  if (typeof window === 'undefined') return true
  try {
    return localStorage.getItem('tinct:chapter-sharded-editions') !== '0'
  } catch {
    return true
  }
}

export function isEditionWindowed(data: EditionData | null | undefined): boolean {
  return data?.windowed?.complete === false
}

async function fetchEditionPatches(bookId: string, editionKey: EditionKey): Promise<EditionPatch[]> {
  try {
    const res = await fetch(apiUrl(`/api/edition-patches?bookId=${encodeURIComponent(bookId)}&editionKey=${encodeURIComponent(editionKey)}`))
    if (!res.ok) return []
    return await res.json() as EditionPatch[]
  } catch {
    return [] // never break reading if patches fail
  }
}

function getEditionPatches(
  bookId: string,
  editionKey: EditionKey,
  opts: { bypassCache?: boolean } = {},
): Promise<EditionPatch[]> {
  const cacheKey = `${bookId}-${editionKey}`
  if (!opts.bypassCache) {
    const cached = patchCache.get(cacheKey)
    if (cached) return Promise.resolve(cached)
    const pending = patchInFlight.get(cacheKey)
    if (pending) return pending
  }

  const pending = fetchEditionPatches(bookId, editionKey).then(patches => {
    if (!opts.bypassCache) patchCache.set(cacheKey, patches)
    return patches
  })
  if (!opts.bypassCache) {
    patchInFlight.set(cacheKey, pending)
    pending.finally(() => patchInFlight.delete(cacheKey))
  }
  return pending
}

/**
 * Validate that loaded edition data is structurally sound. Returns true
 * only when there is at least one chapter with at least one paragraph —
 * matching what the rest of the app needs to render anything useful.
 *
 * The chapters===0 case has been a real source of silent corruption
 * (poisoned service-worker cache, mid-flight load, partial save). We
 * treat it as a hard failure so the loader can self-heal or surface it.
 */
function isEditionValid(data: unknown): data is EditionData {
  if (!data || typeof data !== 'object') return false
  const d = data as { chapters?: unknown }
  if (!Array.isArray(d.chapters)) return false
  if (d.chapters.length === 0) return false
  if (!d.chapters.some(ch => {
    const paragraphs = (ch as { paragraphs?: unknown } | undefined)?.paragraphs
    return Array.isArray(paragraphs) && paragraphs.length > 0
  })) return false
  return true
}

function isChapterShardManifest(data: unknown, bookId: string, editionKey: EditionKey): data is ChapterShardManifest {
  if (!data || typeof data !== 'object') return false
  const d = data as Partial<ChapterShardManifest>
  return (
    d.format === 'tinct-edition-chapters-v1' &&
    d.bookId === bookId &&
    d.editionKey === editionKey &&
    Array.isArray(d.chapters) &&
    d.chapters.length > 0 &&
    d.chapters.every(ch => (
      ch &&
      typeof ch.number === 'number' &&
      typeof ch.title === 'string' &&
      typeof ch.path === 'string'
    ))
  )
}

async function fetchJson(url: string, init: RequestInit): Promise<unknown> {
  const response = await fetch(url, init)
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`)
  }
  return response.json()
}

async function loadChapterShardManifest(
  bookId: string,
  editionKey: EditionKey,
  opts: { bypassCache?: boolean } = {},
): Promise<ChapterShardManifest> {
  const cacheKey = `${bookId}-${editionKey}`
  if (!opts.bypassCache && manifestCache.has(cacheKey)) {
    return manifestCache.get(cacheKey)!
  }
  const manifestUrl = opts.bypassCache
    ? `/data/editions-chapters/${bookId}-${editionKey}/manifest.json?fresh=1`
    : editionChapterShardManifestUrl(bookId, editionKey)
  const fetchInit: RequestInit = opts.bypassCache ? { cache: 'no-store' } : {}
  const manifestData = await fetchJson(manifestUrl, fetchInit)
  if (!isChapterShardManifest(manifestData, bookId, editionKey)) {
    throw new Error(`Edition ${bookId}-${editionKey} chapter manifest is malformed`)
  }
  if (!opts.bypassCache) {
    manifestCache.set(cacheKey, manifestData)
  }
  return manifestData
}

async function loadChapterShard(
  bookId: string,
  editionKey: EditionKey,
  entry: ChapterShardManifest['chapters'][number],
  opts: { bypassCache?: boolean } = {},
): Promise<string[]> {
  const cacheKey = `${bookId}-${editionKey}-ch${entry.number}`
  if (!opts.bypassCache && chapterShardCache.has(cacheKey)) {
    return chapterShardCache.get(cacheKey)!
  }
  const base = `/data/editions-chapters/${bookId}-${editionKey}/`
  const chapterUrl = opts.bypassCache
    ? `${base}${entry.path}?fresh=1`
    : `${base}${entry.path}?v=${encodeURIComponent(__BUILD_VERSION__)}`
  const fetchInit: RequestInit = opts.bypassCache ? { cache: 'no-store' } : {}
  const chapter = await fetchJson(chapterUrl, fetchInit)
  if (!chapter || typeof chapter !== 'object' || !Array.isArray((chapter as { paragraphs?: unknown }).paragraphs)) {
    throw new Error(`Edition ${bookId}-${editionKey} chapter ${entry.number} is malformed`)
  }
  const paragraphs = (chapter as { paragraphs: string[] }).paragraphs
  if (!opts.bypassCache) {
    chapterShardCache.set(cacheKey, paragraphs)
  }
  return paragraphs
}

async function loadChapterShardedEdition(
  bookId: string,
  editionKey: EditionKey,
  opts: { bypassCache?: boolean } = {},
): Promise<EditionData> {
  const manifestData = await loadChapterShardManifest(bookId, editionKey, opts)
  const chapters = await Promise.all(manifestData.chapters.map(async (entry) => ({
    number: entry.number,
    title: entry.title,
    section: entry.section,
    paragraphCount: entry.paragraphCount,
    paragraphs: await loadChapterShard(bookId, editionKey, entry, opts),
  })))
  return {
    chapters,
    sections: manifestData.sections,
  }
}

export async function loadEditionWindow(
  bookId: string,
  editionKey: EditionKey,
  centerChapter: number,
  opts: { bypassCache?: boolean } = {},
): Promise<EditionData> {
  const cacheKey = `${bookId}-${editionKey}`
  if (!chapterShardWindowEnabled(bookId, editionKey)) {
    return loadEdition(bookId, editionKey, opts)
  }

  const patchesPromise = getEditionPatches(bookId, editionKey, opts)
  try {
    const manifestData = await loadChapterShardManifest(bookId, editionKey, opts)
    const requested = new Set([centerChapter - 1, centerChapter, centerChapter + 1])
    const entriesByNumber = new Map(manifestData.chapters.map(entry => [entry.number, entry]))
    const loadedChapters = [...requested]
      .filter(chapterNumber => entriesByNumber.has(chapterNumber))
      .sort((a, b) => a - b)

    if (loadedChapters.length === 0) {
      return loadEdition(bookId, editionKey, { ...opts, forceWholeBook: true })
    }

    const paragraphsByChapter = new Map<number, string[]>()
    await Promise.all(loadedChapters.map(async (chapterNumber) => {
      const entry = entriesByNumber.get(chapterNumber)!
      paragraphsByChapter.set(chapterNumber, await loadChapterShard(bookId, editionKey, entry, opts))
    }))

    const data: EditionData = {
      chapters: manifestData.chapters.map(entry => ({
        number: entry.number,
        title: entry.title,
        section: entry.section,
        paragraphCount: entry.paragraphCount,
        paragraphs: paragraphsByChapter.get(entry.number) ?? [],
      })),
      sections: manifestData.sections,
      windowed: {
        complete: false,
        centerChapter,
        loadedChapters,
      },
    }

    if (!isEditionValid(data)) {
      throw new Error(`Edition ${cacheKey} chapter window is malformed`)
    }

    return applyEditionPatches(cacheKey, data, patchesPromise, false)
  } catch (err) {
    if (opts.bypassCache) throw err
    console.warn(`[editionLoader] Chapter-window load failed for ${cacheKey}, falling back to whole-book JSON`, err)
    return loadEdition(bookId, editionKey, { ...opts, forceWholeBook: true })
  }
}

/**
 * Lazy-load an edition's data.
 *
 * - In-memory cache for instant switching across the session.
 * - If the cached or fetched payload fails the integrity check, we retry
 *   exactly once with a service-worker-bypass query (`?fresh=1`). This
 *   self-heals the common failure mode where a poisoned SW cache returns
 *   a partial or empty payload that the user can otherwise never escape
 *   from. If the fresh fetch ALSO fails the check, we throw — callers
 *   are expected to surface this to the UI rather than render an empty
 *   reader.
 */
export async function loadEdition(
  bookId: string,
  editionKey: EditionKey,
  opts: { bypassCache?: boolean; forceWholeBook?: boolean } = {},
): Promise<EditionData> {
  const cacheKey = `${bookId}-${editionKey}`

  if (!opts.bypassCache && cache.has(cacheKey)) {
    return cache.get(cacheKey)!
  }

  if (!opts.bypassCache && inFlight.has(cacheKey)) {
    return inFlight.get(cacheKey)!
  }

  const pending = loadEditionUncached(bookId, editionKey, opts)
  if (!opts.bypassCache) {
    inFlight.set(cacheKey, pending)
    pending.then(
      () => inFlight.delete(cacheKey),
      () => inFlight.delete(cacheKey),
    )
  }
  return pending
}

async function loadEditionUncached(
  bookId: string,
  editionKey: EditionKey,
  opts: { bypassCache?: boolean; forceWholeBook?: boolean } = {},
): Promise<EditionData> {
  const cacheKey = `${bookId}-${editionKey}`
  const useChapterShards = !opts.forceWholeBook && chapterShardedEditionsEnabled() && CHAPTER_SHARDED_EDITIONS.has(cacheKey)

  // Append the build version as a cache-bust query param. The edition JSONs
  // are not content-hashed (unlike the JS bundle), so without this param a
  // republish would silently serve stale content from any layer that respects
  // long-lived cache headers (browser, SW, CDN). Skipped on the bypassCache
  // path because that already takes a `cache: 'no-store'` route.
  const url = opts.bypassCache
    ? `/data/editions/${bookId}-${editionKey}.json?fresh=1`
    : editionDataUrl(bookId, editionKey)
  const fetchInit: RequestInit = opts.bypassCache ? { cache: 'no-store' } : {}

  let response: Response
  let patches: EditionPatch[] = []
  perfMark('fetch-start')
  const patchesPromise = getEditionPatches(bookId, editionKey, opts)
  if (useChapterShards) {
    try {
      const sharded = await loadChapterShardedEdition(bookId, editionKey, opts)
      perfMark('fetch-end')
      perfMeasure('fetch', 'fetch-start', 'fetch-end')
      perfMark('parse-end')
      perfMeasure('parse', 'fetch-end', 'parse-end')
      return applyEditionPatches(cacheKey, sharded, patchesPromise, true)
    } catch (err) {
      if (opts.bypassCache) throw err
      console.warn(`[editionLoader] Chapter-sharded load failed for ${cacheKey}, falling back to whole-book JSON`, err)
    }
  }
  try {
    response = await fetch(url, fetchInit)
    perfMark('fetch-end')
    perfMeasure('fetch', 'fetch-start', 'fetch-end')
  } catch (err) {
    if (!opts.bypassCache) {
      console.warn(`[editionLoader] Network error for ${cacheKey}, retrying with cache bypass`, err)
      return loadEdition(bookId, editionKey, { bypassCache: true })
    }
    throw new Error(`Failed to fetch edition ${cacheKey}: ${(err as Error).message}`)
  }

  if (!response.ok) {
    if (!opts.bypassCache) {
      console.warn(`[editionLoader] HTTP ${response.status} for ${cacheKey}, retrying with cache bypass`)
      return loadEdition(bookId, editionKey, { bypassCache: true })
    }
    throw new Error(`Edition ${cacheKey} returned HTTP ${response.status}`)
  }

  let data: unknown
  try {
    data = await response.json()
    perfMark('parse-end')
    perfMeasure('parse', 'fetch-end', 'parse-end')
  } catch (err) {
    if (!opts.bypassCache) {
      console.warn(`[editionLoader] JSON parse failure for ${cacheKey}, retrying with cache bypass`, err)
      return loadEdition(bookId, editionKey, { bypassCache: true })
    }
    throw new Error(`Edition ${cacheKey} returned invalid JSON: ${(err as Error).message}`)
  }

  if (!isEditionValid(data)) {
    if (!opts.bypassCache) {
      console.warn(`[editionLoader] ${cacheKey} failed integrity check (got ${(data as { chapters?: unknown[] })?.chapters?.length ?? 0} chapters), retrying with cache bypass`)
      return loadEdition(bookId, editionKey, { bypassCache: true })
    }
    throw new Error(`Edition ${cacheKey} is malformed: missing or empty chapters`)
  }

  return applyEditionPatches(cacheKey, data, patchesPromise, true)
}

async function applyEditionPatches(
  cacheKey: string,
  data: EditionData,
  patchesPromise: Promise<EditionPatch[]>,
  updateCache: boolean,
): Promise<EditionData> {
  let patches: EditionPatch[] = []
  try {
    const patchResult = await Promise.race([
      patchesPromise,
      new Promise<null>(resolve => setTimeout(() => resolve(null), PATCH_WAIT_MS)),
    ])
    if (patchResult) patches = patchResult
  } catch {
    patches = []
  }

  // Apply any server-confirmed patches (with safety check)
  for (const patch of patches) {
    const ch = data.chapters.find(chapter => chapter.number === patch.chapter_number)
    if (ch && patch.paragraph_index < ch.paragraphs.length) {
      const original = ch.paragraphs[patch.paragraph_index]
      // Safety: skip patches that are less than 50% of original length
      // These are likely truncated fragments from Claude, not full paragraphs
      if (patch.patched_text.length >= original.length * 0.5) {
        ch.paragraphs[patch.paragraph_index] = patch.patched_text
      } else {
        console.warn(`[editionLoader] Skipped truncated patch for ch${patch.chapter_number} p${patch.paragraph_index}: ${patch.patched_text.length} chars vs ${original.length} original`)
      }
    }
  }

  if (updateCache) {
    cache.set(cacheKey, data)
  }
  return data
}

/** Force a fresh reload, bypassing both the in-memory and SW cache. */
export async function reloadEdition(bookId: string, editionKey: EditionKey): Promise<EditionData> {
  const cacheKey = `${bookId}-${editionKey}`
  cache.delete(cacheKey)
  manifestCache.delete(cacheKey)
  patchCache.delete(cacheKey)
  patchInFlight.delete(cacheKey)
  for (const key of chapterShardCache.keys()) {
    if (key.startsWith(`${cacheKey}-ch`)) chapterShardCache.delete(key)
  }
  return loadEdition(bookId, editionKey, { bypassCache: true })
}

/** Pre-warm the cache for an edition (e.g. for split view) */
export function preloadEdition(bookId: string, editionKey: EditionKey): void {
  loadEdition(bookId, editionKey).catch(() => {
    // Silent preload failure is OK
  })
}

/** Check if an edition is already cached */
export function isEditionCached(bookId: string, editionKey: EditionKey): boolean {
  return cache.has(`${bookId}-${editionKey}`)
}
