import { describe, expect, it } from 'vitest'
import { staticCacheControl, withStaticCache } from './staticCache'

const at = (path: string) => new URL(path, 'https://tinct.app')
const js = 'text/javascript; charset=utf-8'

describe('static asset caching (worker/lib/staticCache)', () => {
  it('keeps a content-hashed bundle for a year, immutable', () => {
    expect(staticCacheControl(at('/assets/storage-DVulBx1f.js'), 200, js)).toBe('public, max-age=31536000, immutable')
    expect(staticCacheControl(at('/assets/shared-index-DEwtTf7j.js'), 200, js)).toBe('public, max-age=31536000, immutable')
    expect(staticCacheControl(at('/assets/index-kNGlBG-i.css'), 200, 'text/css')).toBe('public, max-age=31536000, immutable')
  })
  it('reuses a cache-tagged library or lab file for a day and refreshes it in the background for a week', () => {
    const day = 'public, max-age=86400, stale-while-revalidate=604800'
    expect(staticCacheControl(at('/lab/library_2/app.js?v=20261010desk'), 200, js)).toBe(day)
    expect(staticCacheControl(at('/lab/library_2/styles.css?v=20261010desk'), 200, 'text/css')).toBe(day)
    expect(staticCacheControl(at('/lab/book-cover.js?v=20261009owncover'), 200, js)).toBe(day)
    expect(staticCacheControl(at('/lab/addbook/js/search.js?v=20261009rel10'), 200, js)).toBe(day)
    expect(staticCacheControl(at('/omarchy/experience.js?v=20261005h1'), 200, js)).toBe(day)
  })
  it('leaves an untagged fixed-name module to revalidate: it changes with every build', () => {
    expect(staticCacheControl(at('/lab/account-cards.js'), 200, js)).toBeNull()
    expect(staticCacheControl(at('/lab/library-2-reading.js'), 200, js)).toBeNull()
    expect(staticCacheControl(at('/lab/native-books.js'), 200, js)).toBeNull()
    expect(staticCacheControl(at('/lab/catalogue.json'), 200, 'application/json')).toBeNull()
    // Tagged or not: JSON is data and keeps revalidating (the catalogue changes with every book release).
    expect(staticCacheControl(at('/lab/catalogue.json?v=20260912-withheld-1'), 200, 'application/json')).toBeNull()
    expect(staticCacheControl(at('/lab/library_2/app.js?v='), 200, js)).toBeNull()
    expect(staticCacheControl(at('/lab/library_2/app.js?v=a%20b'), 200, js)).toBeNull()
  })
  it('keeps cover paintings and scene images for a day', () => {
    const day = 'public, max-age=86400, stale-while-revalidate=604800'
    expect(staticCacheControl(at('/covers/v2/frankenstein.webp'), 200, 'image/webp')).toBe(day)
    expect(staticCacheControl(at('/lab/library_2/assets/table-afternoon-phone.jpg'), 200, 'image/jpeg')).toBe(day)
    expect(staticCacheControl(at('/lab/library_2/assets/spines/spine-green.jpg'), 200, 'image/jpeg')).toBe(day)
    expect(staticCacheControl(at('/lab/library_2/shelf-study/library-wall.jpg'), 200, 'image/jpeg')).toBe(day)
  })
  it('never touches HTML, non-200 answers or other paths', () => {
    expect(staticCacheControl(at('/lab/library_2/'), 200, 'text/html; charset=utf-8')).toBeNull()
    expect(staticCacheControl(at('/assets/storage-DVulBx1f.js'), 304, null)).toBeNull()
    expect(staticCacheControl(at('/assets/storage-DVulBx1f.js'), 404, 'text/plain')).toBeNull()
    expect(staticCacheControl(at('/api/public-books/pd-pg-1080/cover'), 200, 'image/png')).toBeNull()
    expect(staticCacheControl(at('/data/editions/frankenstein.json'), 200, 'application/json')).toBeNull()
    expect(staticCacheControl(at('/sw.js'), 200, js)).toBeNull()
  })
  it('withStaticCache rewrites only the header, and returns the same response when no policy applies', async () => {
    const hashed = withStaticCache(at('/assets/storage-DVulBx1f.js'), new Response('x', { status: 200, headers: { 'content-type': js, 'cache-control': 'public, max-age=0, must-revalidate', etag: '"a"' } }))
    expect(hashed.headers.get('cache-control')).toBe('public, max-age=31536000, immutable')
    expect(hashed.headers.get('etag')).toBe('"a"')
    expect(await hashed.text()).toBe('x')
    const conditional = new Response(null, { status: 304, headers: { etag: '"a"' } })
    expect(withStaticCache(at('/assets/storage-DVulBx1f.js'), conditional)).toBe(conditional)
  })
})
