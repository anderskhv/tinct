import type { EditionData, EditionKey } from '../types'
import { apiUrl } from '../utils/apiUrl'
import { perfMark, perfMeasure } from '../utils/perf'

const cache = new Map<string, EditionData>()

interface EditionPatch {
  chapter_number: number
  paragraph_index: number
  patched_text: string
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
  const firstCh = d.chapters[0] as { paragraphs?: unknown } | undefined
  if (!firstCh || !Array.isArray(firstCh.paragraphs)) return false
  return true
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
  opts: { bypassCache?: boolean } = {},
): Promise<EditionData> {
  const cacheKey = `${bookId}-${editionKey}`

  if (!opts.bypassCache && cache.has(cacheKey)) {
    return cache.get(cacheKey)!
  }

  const url = opts.bypassCache
    ? `/data/editions/${bookId}-${editionKey}.json?fresh=1`
    : `/data/editions/${bookId}-${editionKey}.json`
  const fetchInit: RequestInit = opts.bypassCache ? { cache: 'no-store' } : {}

  let response: Response
  let patches: EditionPatch[]
  perfMark('fetch-start')
  try {
    [response, patches] = await Promise.all([
      fetch(url, fetchInit),
      fetchEditionPatches(bookId, editionKey),
    ])
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

  // Apply any server-confirmed patches (with safety check)
  for (const patch of patches) {
    const ch = data.chapters[patch.chapter_number - 1]
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

  cache.set(cacheKey, data)
  return data
}

/** Force a fresh reload, bypassing both the in-memory and SW cache. */
export async function reloadEdition(bookId: string, editionKey: EditionKey): Promise<EditionData> {
  cache.delete(`${bookId}-${editionKey}`)
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
