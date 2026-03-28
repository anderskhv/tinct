import type { EditionData, EditionKey } from '../types'

const cache = new Map<string, EditionData>()

/**
 * Lazy-load an edition's data. Uses dynamic import for code splitting
 * so only the active edition is in the initial bundle.
 * Results are cached in memory for instant switching.
 */
export async function loadEdition(bookId: string, editionKey: EditionKey): Promise<EditionData> {
  const cacheKey = `${bookId}-${editionKey}`

  if (cache.has(cacheKey)) {
    return cache.get(cacheKey)!
  }

  try {
    const response = await fetch(`/data/editions/${bookId}-${editionKey}.json`)
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const data: EditionData = await response.json()
    cache.set(cacheKey, data)
    return data
  } catch (err) {
    console.error(`Failed to load edition ${cacheKey}:`, err)
    // Return empty edition rather than crashing
    const fallback: EditionData = { chapters: [] }
    return fallback
  }
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
