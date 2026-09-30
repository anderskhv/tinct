/**
 * The client URLs for edition text. The loaders and the reader's boot
 * preload (src/lab/readerBoot.ts) both build them here, so a response the
 * page preloaded is exactly the request the loader later makes and the
 * browser serves it once. Keep this module free of imports: it is bundled
 * into the tiny boot script as well as the app.
 */

function versionQuery(version: string): string {
  return `?v=${encodeURIComponent(version)}`
}

/** Whole-book edition JSON. */
export function editionWholeUrl(bookId: string, editionKey: string, version: string): string {
  return `/data/editions/${bookId}-${editionKey}.json${versionQuery(version)}`
}

export function editionShardDirectory(bookId: string, editionKey: string): string {
  return `/data/editions-chapters/${bookId}-${editionKey}/`
}

export function editionShardManifestUrl(bookId: string, editionKey: string, version: string): string {
  return `${editionShardDirectory(bookId, editionKey)}manifest.json${versionQuery(version)}`
}

/** The file every chapter manifest names for a chapter number. */
export function editionShardPath(chapterNumber: number): string {
  return `ch${String(chapterNumber).padStart(4, '0')}.json`
}

export function editionShardUrl(bookId: string, editionKey: string, path: string, version: string): string {
  return `${editionShardDirectory(bookId, editionKey)}${path}${versionQuery(version)}`
}

/** Same-origin API path; native builds prefix it with their API base. */
export function editionPatchesPath(bookId: string, editionKey: string): string {
  return `/api/edition-patches?bookId=${encodeURIComponent(bookId)}&editionKey=${encodeURIComponent(editionKey)}`
}
