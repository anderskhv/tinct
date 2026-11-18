/**
 * Country restrictions for books (`Book.restrictedCountries`, see
 * src/data/regionRestrictions.ts): every path that serves a restricted book's
 * content answers 451 to a request whose country is known to be restricted.
 *
 * - The country comes from Cloudflare (`request.cf.country`; the
 *   `CF-IPCountry` header only where the runtime gives no `cf`, as in a local
 *   harness). Missing, `XX` (unknown) and `T1` (Tor) are allowed: fail open.
 * - It is decided per request and never stored: nothing here writes to KV,
 *   R2, Durable Objects, analytics or logs, and no response carries the
 *   country. The client learns only which book ids are not served to it
 *   (`GET /api/restricted-books`).
 * - A request from any other country returns at the first check, so nothing
 *   changes for it (no body read, no extra lookup).
 * - Responses for a restricted book are never shared between countries:
 *   refusals are `no-store`, and allowed responses are `private` (a browser
 *   may keep them; a shared cache may not) with `Vary: CF-IPCountry`
 *   (`withRegionCacheHeaders`). The Worker keeps no cache of its own for these
 *   paths except the share images' Cache API copy, which is checked after the
 *   gate (routes/share.ts).
 */
import { ALL_BOOKS, getBook } from '../../data/bookRegistry'
import { htmlEscape } from './html'
import {
  BOOK_COUNTRY_RESTRICTIONS,
  RESTRICTED_COUNTRIES,
  bookHasCountryRestriction,
  isBookRestrictedIn,
  normalizeCountry,
  restrictedBookIdsIn,
} from '../../data/regionRestrictions'
import { corsHeaders } from './responses'

export const RESTRICTED_BOOKS_PATH = '/api/restricted-books'
export const REGION_REFUSAL_ERROR = 'not_available_in_your_country'
export const REGION_VARY = 'CF-IPCountry'

export interface RegionGateEnv {
  AUDIO_BUCKET?: Pick<R2Bucket, 'get'>
}

/** The request's country, or null when unknown. Never stored or echoed. */
export function requestCountry(request: Request): string | null {
  const cf = (request as Request & { cf?: { country?: unknown } }).cf
  if (cf && typeof cf === 'object' && cf.country !== undefined && cf.country !== null) return normalizeCountry(cf.country)
  return normalizeCountry(request.headers.get('cf-ipcountry'))
}

const BOOK_IDS = ALL_BOOKS.map(book => book.id).sort((a, b) => b.length - a.length)

/** The registry book a file or folder name belongs to: `<id>`, `<id>-…` or `<id>.…` (the longest id wins). */
export function bookIdFromName(name: string): string | null {
  for (const id of BOOK_IDS) {
    if (name === id || name.startsWith(id + '-') || name.startsWith(id + '.')) return id
  }
  return null
}

/**
 * The book whose content a static path serves, or null. Covers every data
 * folder (editions, chapter shards, threads and verse lines, characters,
 * onboarding, figures, footnotes, catch-up, highlight migrations), the
 * library's introduction and primer data, the reader's prefaces and the
 * public book pages under /read/<id>.
 */
export function contentBookIdForPath(pathname: string): string | null {
  let path: string
  try { path = decodeURIComponent(pathname) } catch { return null }
  const data = path.match(/^\/data\/([a-z0-9_-]+)\/([^/]+)/i)
  if (data) return data[1] === 'dict' ? null : bookIdFromName(data[2])
  const pack = path.match(/^\/seo\/chapter-packs\/([a-z0-9-]+)\//)
  if (pack) return BOOK_IDS.includes(pack[1]) ? pack[1] : null
  const library = path.match(/^\/lab\/library_2\/(?:intro-data|primer-data)\/([^/]+)$/) || path.match(/^\/lab\/prefaces\/([^/]+)$/)
  if (library) return bookIdFromName(library[1])
  const page = path.match(/^\/read\/([a-z0-9-]+)(?:\/|\.html$|$)/i)
  if (page) {
    const id = page[1].toLowerCase()
    return BOOK_IDS.includes(id) ? id : null
  }
  return null
}

/** The registry book named by an /api/audio-file or /api/audio-manifest path (`<book>/<edition>/…`). */
function audioPathBookId(path: string): string | null {
  const first = path.split('/')[0] || ''
  return BOOK_IDS.includes(first) ? first : null
}

/** Narration recordings are content-addressed (`narration/<provider>/blob/<hash>.mp3`); their meta names the book. */
const NARRATION_BLOB = /^narration\/([a-z0-9-]+)\/blob\/([a-f0-9]{16,128})\.mp3$/

async function narrationBlobBookId(env: RegionGateEnv, path: string): Promise<string | null> {
  const match = path.match(NARRATION_BLOB)
  if (!match || !env.AUDIO_BUCKET) return null
  try {
    const object = await env.AUDIO_BUCKET.get(`narration/${match[1]}/blob/${match[2]}.json`)
    if (!object) return null
    const meta = await object.json() as { bookId?: unknown }
    return typeof meta?.bookId === 'string' ? meta.bookId : null
  } catch {
    return null
  }
}

/** Pages a `?book=<id>` link opens: the reader, the library, the home page and the old app entry. */
const BOOK_LINK_PATHS = new Set(['/reader', '/reader/', '/library', '/library/', '/', '/index.html', '/app'])

/** Routes whose JSON body names the book whose text they send to an AI provider, narrate or quote. */
const BODY_BOOK_ROUTES = new Set([
  '/api/chat',
  '/api/lab-chat',
  '/api/lab-recap',
  '/api/lab-catch-up',
  '/api/lab-chapter-notes',
  '/api/report-issue',
  '/api/share',
  '/api/narration/ensure',
  '/api/narration/warm',
])

/** Routes that name the book in the query (`bookId`). */
const QUERY_BOOK_ROUTES = new Set([
  '/api/narration/chapter',
  '/api/edition-patches',
  '/api/share/preview',
])

/** Every `bookId` string in a parsed JSON body (any depth, bounded). */
export function bookIdsInBody(value: unknown, depth = 0, found: string[] = []): string[] {
  if (depth > 8 || found.length > 50 || !value || typeof value !== 'object') return found
  if (Array.isArray(value)) {
    for (const item of value.slice(0, 200)) bookIdsInBody(item, depth + 1, found)
    return found
  }
  for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
    if (key === 'bookId' && typeof item === 'string') found.push(item)
    else if (item && typeof item === 'object') bookIdsInBody(item, depth + 1, found)
  }
  return found
}

async function jsonBody(request: Request): Promise<unknown> {
  try { return JSON.parse(await request.clone().text()) } catch { return null }
}

function refusalHeaders(contentType: string): Headers {
  return new Headers({
    'Content-Type': contentType,
    'Cache-Control': 'no-store',
    Vary: REGION_VARY,
    'X-Robots-Tag': 'noindex, noarchive',
  })
}

/** The 451 answer to a data or API request. */
export function regionRefusalJson(request: Request): Response {
  const headers = refusalHeaders('application/json; charset=utf-8')
  if (new URL(request.url).pathname.startsWith('/api/')) for (const [key, value] of Object.entries(corsHeaders(request))) headers.set(key, value)
  return new Response(request.method === 'HEAD' ? null : JSON.stringify({ error: REGION_REFUSAL_ERROR }), { status: 451, headers })
}

/** The dark paper of tinct-ui.css (`data-tui-theme="dark"`), for a visitor whose device asks for dark. */
const DARK_TOKENS = '--tui-paper:#111610;--tui-ink:#eee7d0;--tui-ink-muted:#b8bea9;--tui-primary:#eee7d0;--tui-on-primary:#222b20;--tui-focus:#dbd3ae;--tui-shadow-pop:0 12px 32px rgba(0,0,0,.45);color-scheme:dark'

/**
 * The 451 answer to a page navigation: the approved direct-link message
 * (Anders, 17 Nov 2026, mockup b). The book's cover, "This book isn't
 * available in your country.", the book and its author, and Browse the
 * library. tinct-ui.css tokens and pill; two families (Playfair Display
 * title, system UI); light or dark paper as the device asks. Names the book,
 * never the country.
 */
export function regionRefusalPage(request: Request, bookId?: string | null): Response {
  const book = bookId ? getBook(bookId) : undefined
  const cover = book ? `<img src="/covers/v2/${htmlEscape(book.id)}.webp" alt="" width="112" height="168">` : ''
  const line = book ? `<p class="book">${htmlEscape(book.title)} · ${htmlEscape(book.author)}</p>` : ''
  const html = '<!doctype html><html lang="en"><head><meta charset="utf-8">'
    + '<meta name="viewport" content="width=device-width, initial-scale=1">'
    + '<meta name="robots" content="noindex, noarchive"><title>Not available in your country — Tinct</title>'
    + '<link rel="stylesheet" href="/fonts/tinct-fonts.css"><link rel="stylesheet" href="/lab/tinct-ui.css?v=20261009rel10">'
    + '<style>'
    + `@media (prefers-color-scheme: dark){:root{${DARK_TOKENS}}}`
    + 'html,body{margin:0;min-height:100dvh;background:var(--tui-paper);color:var(--tui-ink)}'
    + 'main{min-height:100dvh;box-sizing:border-box;display:grid;place-items:center;padding:24px var(--tui-gutter) 10vh}'
    + '.unavailable{display:flex;flex-direction:column;align-items:center;text-align:center;max-width:30rem;gap:18px}'
    + '.unavailable img{width:112px;height:168px;object-fit:cover;border-radius:3px;box-shadow:var(--tui-shadow-pop)}'
    + '.unavailable h1{margin:6px 0 0;font-family:var(--tui-font-display);font-weight:500;font-size:clamp(26px,4.2vw,34px);line-height:1.2}'
    + '.book{margin:0;font-family:var(--tui-font-ui);font-size:var(--tui-text-ui);color:var(--tui-ink-muted)}'
    + '.unavailable .tui-btn{margin-top:10px}'
    + '</style></head><body><main><section class="unavailable" aria-labelledby="unavailable-title">'
    + cover
    + '<h1 id="unavailable-title">This book isn’t available in your country.</h1>'
    + line
    + '<a class="tui-btn tui-btn--primary" href="/library">Browse the library</a>'
    + '</section></main></body></html>'
  const headers = refusalHeaders('text/html; charset=utf-8')
  return new Response(request.method === 'HEAD' ? null : html, { status: 451, headers })
}

/** A restricted book's card (`<li>…href="/read/<id>"…</li>`) taken out of a public page: hubs, shelf hubs, related books. */
export function withoutRestrictedCards(html: string, ids: ReadonlySet<string>): string {
  if (!ids.size) return html
  let out = html.replace(/<li\b[^>]*>(?:(?!<\/?li\b)[\s\S])*?<\/li>/gi, card => {
    const id = card.match(/href=["'](?:https:\/\/tinct\.app)?\/read\/([a-z0-9-]+)["'\/?#]/i)?.[1]?.toLowerCase()
    return id && ids.has(id) ? '' : card
  })
  // Its entry in the page's structured data (a shelf hub's list of books) goes too, with one
  // separating comma (the one after it, or before it when it was last), so the JSON stays valid.
  const entry = /\{[^{}]*"url":"https:\/\/tinct\.app\/read\/([a-z0-9-]+)"[^{}]*\}/g
  for (let match = entry.exec(out); match; match = entry.exec(out)) {
    if (!ids.has(match[1])) continue
    let start = match.index, end = start + match[0].length
    if (out[end] === ',') end += 1
    else if (out[start - 1] === ',') start -= 1
    out = out.slice(0, start) + out.slice(end)
    entry.lastIndex = start
  }
  return out
}

/** Whether a public page links a book with a country restriction (its answer then differs by country). */
export function linksRestrictableBook(html: string): boolean {
  for (const id of BOOK_COUNTRY_RESTRICTIONS.keys()) if (html.includes(`/read/${id}"`)) return true
  return false
}

/** `GET /api/restricted-books`: only the ids not served to this request, never the country. */
export function restrictedBooksResponse(request: Request): Response {
  const headers = new Headers(corsHeaders(request))
  headers.set('Content-Type', 'application/json; charset=utf-8')
  headers.set('Cache-Control', 'private, no-store')
  headers.set('Vary', REGION_VARY)
  return new Response(JSON.stringify({ restrictedBookIds: restrictedBookIdsIn(requestCountry(request)) }), { status: 200, headers })
}

/** Narrows a recap-preparation shelf to the books served here; a presence report for a restricted book is refused. */
async function gateRecapPreparation(request: Request, restricted: (bookId: string) => boolean): Promise<Response | Request | null> {
  const body = await jsonBody(request) as { kind?: unknown; request?: unknown; candidates?: unknown } | null
  if (!body || typeof body !== 'object') return null
  if (body.kind === 'shelf' && Array.isArray(body.candidates)) {
    const kept = body.candidates.filter(candidate => !bookIdsInBody(candidate).some(restricted))
    if (kept.length === body.candidates.length) return null
    return new Request(request, { body: JSON.stringify({ ...body, candidates: kept }) })
  }
  return bookIdsInBody(body).some(restricted) ? regionRefusalJson(request) : null
}

/**
 * The gate. Null: serve as usual. A Response: the refusal. A Request: serve
 * this narrower request instead (a recap-preparation shelf without the
 * restricted books).
 */
export async function regionGate(request: Request, env: RegionGateEnv): Promise<Response | Request | null> {
  const url = new URL(request.url)
  if (url.pathname === RESTRICTED_BOOKS_PATH && (request.method === 'GET' || request.method === 'HEAD')) return restrictedBooksResponse(request)
  const country = requestCountry(request)
  // Every other country, and an unknown one, leaves here: nothing is read or changed.
  if (!country || !RESTRICTED_COUNTRIES.has(country)) return null
  const restricted = (bookId: string) => isBookRestrictedIn(bookId, country, BOOK_COUNTRY_RESTRICTIONS)
  const read = request.method === 'GET' || request.method === 'HEAD'

  if (read) {
    const contentBook = contentBookIdForPath(url.pathname)
    if (contentBook && restricted(contentBook)) {
      return url.pathname.startsWith('/read/') ? regionRefusalPage(request, contentBook) : regionRefusalJson(request)
    }
    // A direct link to the book (`/reader?book=<id>`, the library's `?book=<id>`) shows the message, not the book.
    if (BOOK_LINK_PATHS.has(url.pathname)) {
      const book = url.searchParams.get('book')
      if (book && restricted(book)) return regionRefusalPage(request, book)
    }
    if (url.pathname === '/api/audio-file' || url.pathname === '/api/audio-manifest') {
      const path = url.searchParams.get('path') || ''
      const book = audioPathBookId(path) ?? (url.pathname === '/api/audio-file' ? await narrationBlobBookId(env, path) : null)
      if (book && restricted(book)) return regionRefusalJson(request)
    }
  }
  if (QUERY_BOOK_ROUTES.has(url.pathname)) {
    const book = url.searchParams.get('bookId')
    if (book && restricted(book)) return regionRefusalJson(request)
  }
  if (request.method === 'POST' && BODY_BOOK_ROUTES.has(url.pathname)) {
    if (bookIdsInBody(await jsonBody(request)).some(restricted)) return regionRefusalJson(request)
  }
  if (request.method === 'POST' && url.pathname === '/api/recap-preparation') return gateRecapPreparation(request, restricted)
  return null
}

/** The share pages' view of the gate (routes/share.ts looks the book up from the share record). */
export interface ShareRegion {
  /** Not served to this request. */
  refuses(bookId: string): boolean
  /** Has a country restriction: its responses must stay private to this request. */
  varies(bookId: string): boolean
}

export function shareRegion(request: Request): ShareRegion {
  const country = requestCountry(request)
  return {
    refuses: bookId => isBookRestrictedIn(bookId, country),
    varies: bookId => bookHasCountryRestriction(bookId),
  }
}

/** Marks a response private to this request and its country: `public` becomes `private`, plus `Vary: CF-IPCountry`. */
export function privateToCountry(response: Response): Response {
  if (response.status === 101 || response.webSocket) return response
  const result = new Response(response.body, response)
  const cache = result.headers.get('Cache-Control')
  if (!cache) result.headers.set('Cache-Control', 'private, no-cache')
  else if (!/\b(?:private|no-store)\b/i.test(cache)) result.headers.set('Cache-Control', /\bpublic\b/i.test(cache) ? cache.replace(/\bpublic\b/i, 'private') : `private, ${cache}`)
  const vary = result.headers.get('Vary')
  if (!vary) result.headers.set('Vary', REGION_VARY)
  else if (!vary.split(',').some(item => item.trim().toLowerCase() === REGION_VARY.toLowerCase())) result.headers.set('Vary', `${vary}, ${REGION_VARY}`)
  return result
}

/**
 * Any response for a book with a country restriction, served or refused, is
 * kept out of shared caches: what one country may read must never be handed
 * to another. Other responses are returned untouched.
 */
export function withRegionCacheHeaders(request: Request, response: Response): Response {
  const url = new URL(request.url)
  let book = contentBookIdForPath(url.pathname)
  if (!book && (url.pathname === '/api/audio-file' || url.pathname === '/api/audio-manifest')) book = audioPathBookId(url.searchParams.get('path') || '')
  if (!book && QUERY_BOOK_ROUTES.has(url.pathname)) book = url.searchParams.get('bookId')
  if (!book && (url.pathname === '/reader' || url.pathname === '/reader/')) book = url.searchParams.get('book')
  if (!book || !bookHasCountryRestriction(book)) return response
  return privateToCountry(response)
}

/**
 * The response on its way out: a restricted book's own responses are kept
 * private to the request's country (withRegionCacheHeaders), and a public page
 * under /read (the hub, shelf hubs, other books' pages) that links such a book
 * is too, with the book's card taken out for a request it is not served to.
 */
export async function regionResponse(request: Request, response: Response): Promise<Response> {
  const url = new URL(request.url)
  const html = (response.headers.get('Content-Type') || '').includes('text/html')
  if (response.status !== 200 || !html || !url.pathname.startsWith('/read') || request.method !== 'GET') return withRegionCacheHeaders(request, response)
  const text = await response.text()
  if (!linksRestrictableBook(text)) return withRegionCacheHeaders(request, new Response(text, response))
  const ids = new Set(restrictedBookIdsIn(requestCountry(request)))
  const shown = new Response(ids.size ? withoutRestrictedCards(text, ids) : text, response)
  shown.headers.delete('Content-Length')
  shown.headers.delete('ETag')
  return privateToCountry(shown)
}
