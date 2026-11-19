/**
 * Browser caching for the static files the Worker serves from the assets
 * binding. The binding answers every fixed-name file with
 * `max-age=0, must-revalidate`, so a returning reader's library revalidated
 * about 120 files on every visit (all 304s; 2026-10-10 measurement): the
 * module graph alone cost four serial round trips before the desk could show.
 *
 * - Vite's content-hashed bundles (`/assets/name-<hash>.js`) never change
 *   under their name: a year, immutable.
 * - The library's and the lab's fixed-name scripts and styles carry a cache
 *   tag (`?v=<tag>`) that is bumped when a file changes (code and styles only;
 *   JSON data such as the catalogue keeps revalidating, since it changes with
 *   every book release while its tag rarely does) (the tests in
 *   src/libraryShelfMotion.test.ts keep the tags agreeing), so the tagged URL
 *   is reused for a day and refreshed in the background for a week after
 *   that. An untagged fixed-name module keeps the binding's revalidation.
 * - Cover paintings and scene images change rarely; a day, then a week of
 *   stale-while-revalidate.
 * - Avatar crops (`/lab/library_2/assets/avatars/<name>-<hash>.webp`,
 *   scripts/build-avatar-crops.mjs) carry their content hash in the name: a
 *   year, immutable, like the bundles.
 *
 * HTML is never touched here (the pages set their own headers), and only a
 * 200 is given a new header: a conditional 304 passes through untouched.
 */
const ONE_DAY = 'public, max-age=86400, stale-while-revalidate=604800'
const IMMUTABLE = 'public, max-age=31536000, immutable'

const HASHED_BUNDLE = /^\/assets\/[\w.-]+-[\w-]{8}\.(?:js|css|woff2?|svg|png|jpe?g|webp|avif)$/
const AVATAR_CROP = /^\/lab\/library_2\/assets\/avatars\/[a-z0-9-]+-[0-9a-f]{8}\.webp$/
// Code and styles only: JSON under /lab is data (the catalogue changes with every book release) and keeps revalidating.
const TAGGED_CODE = /^\/(?:lab|omarchy)\/[\w\-./]+\.(?:js|css)$/
const IMAGE_DIRS = [/^\/covers\/[\w\-./]+\.(?:webp|jpe?g|png|avif|svg)$/, /^\/lab\/library_2\/(?:assets|shelf-study)\/[\w\-./]+\.(?:webp|jpe?g|png|avif|svg)$/]

export function staticCacheControl(url: URL, status: number, contentType: string | null): string | null {
  if (status !== 200) return null
  if ((contentType || '').includes('text/html')) return null
  const path = url.pathname
  if (HASHED_BUNDLE.test(path) || AVATAR_CROP.test(path)) return IMMUTABLE
  if (TAGGED_CODE.test(path) && /^[\w.-]+$/.test(url.searchParams.get('v') || '')) return ONE_DAY
  if (IMAGE_DIRS.some(pattern => pattern.test(path))) return ONE_DAY
  return null
}

/** The response with the static policy applied, or the same response when none applies. */
export function withStaticCache(url: URL, response: Response): Response {
  const policy = staticCacheControl(url, response.status, response.headers.get('content-type'))
  if (!policy) return response
  const result = new Response(response.body, response)
  result.headers.set('Cache-Control', policy)
  return result
}
