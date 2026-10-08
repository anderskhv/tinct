/**
 * Share a highlight as an image (docs/share-quote/SPEC.md).
 *
 *   POST /api/share              create a link (validated range, rate-limited)
 *   GET  /api/share/preview?...  the image for the share sheet, not stored
 *   GET  /api/share/{id}         the public record (the reader opens the passage)
 *   GET  /q/{id}                 link page: OG/Twitter meta, then the reader
 *   GET  /q/{id}/image.png       the shared image (phone or desktop, as chosen)
 *   GET  /q/{id}/og.png          1200 × 630 link preview
 *
 * Only text that exists in our editions can be shared: book, edition and
 * chapter come from the registry and the edition files, and the word range
 * is checked against that chapter. No user identity is in the link, the page
 * or the image; the creator's id is stored privately for analytics.
 */

import { getBook } from '../../data/bookRegistry'
import { editionHold, isBookTemporarilyHeld } from '../../data/editionAvailability'
import { editionLicence, type EditionLicence } from '../../data/editionLicences'
import { isEditionWithheld } from '../../data/withheldEditions'
import { SERIES_MAX_CARDS, buildPassage, isValidShareRange, type ShareContent, type ShareFormat, type ShareLook, type ShareOptions, type ShareRange } from '../../share/shareLayout'
import type { Book } from '../../types'
import { createBookRetrieval, type AssetsBinding } from '../lib/bookRetrieval'
import { htmlEscape } from '../lib/html'
import { jsonResponse } from '../lib/responses'
import { SHARE_ID_PATTERN, type ShareRecord, type ShareRecordInput } from '../shareRecord'
import type { ShareStore } from '../shareStore'

export type ShareEnv = {
  ASSETS: AssetsBinding
  SHARE_STORE?: DurableObjectNamespace<ShareStore>
}

export interface ShareDeps {
  verifyUser: (request: Request) => Promise<{ id: string } | null>
  checkRateLimit: (key: string, kv?: KVNamespace, maxRequests?: number) => Promise<boolean>
}

/** Bump when the drawing changes, so cached images are redrawn. */
export const SHARE_RENDER_VERSION = '7'
export const SHARE_CREATE_PER_MINUTE = 10
export const SHARE_PREVIEW_PER_MINUTE = 40
const IMAGE_CACHE = 'public, max-age=86400'
const LOOKS: ShareLook[] = ['paper', 'book', 'night', 'eink']
const FORMATS: Array<'phone' | 'desktop'> = ['phone', 'desktop']

function storeOf(env: ShareEnv) {
  return env.SHARE_STORE?.getByName('shares') ?? null
}

function clientKey(request: Request): string {
  return request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
}

/** Edition credit for the /q/{id} page (the image does not carry it). */
export function editionCredit(edition: Book['editions'][number]): string {
  if (edition.translator) return `tr. ${edition.translator}`
  if (edition.style === 'modern') return edition.language === 'en' ? 'Tinct Modern English' : `Tinct ${edition.label}`
  return edition.label
}

function asInt(value: unknown): number | null {
  const number = typeof value === 'string' && /^\d{1,7}$/.test(value) ? Number(value) : value
  return typeof number === 'number' && Number.isSafeInteger(number) && number >= 0 ? number : null
}

/** Parse and shape-check a share request; content checks come after. */
export function parseShareInput(raw: Record<string, unknown>): ShareRecordInput | null {
  const bookId = typeof raw.bookId === 'string' && /^[a-z0-9-]{1,80}$/.test(raw.bookId) ? raw.bookId : null
  const editionKey = typeof raw.editionKey === 'string' && /^[a-z0-9-]{1,40}$/.test(raw.editionKey) ? raw.editionKey : null
  const chapterNumber = asInt(raw.chapterNumber)
  const paragraphIndex = asInt(raw.paragraphIndex)
  const fromWord = asInt(raw.fromWord)
  const endParagraphIndex = asInt(raw.endParagraphIndex)
  const toWord = asInt(raw.toWord)
  const look = LOOKS.includes(raw.look as ShareLook) ? raw.look as ShareLook : null
  const format = FORMATS.includes(raw.format as 'phone') ? raw.format as 'phone' | 'desktop' : null
  const flag = (value: unknown) => value === true || value === '1' || value === 1
  if (!bookId || !editionKey || chapterNumber === null || chapterNumber < 1 || paragraphIndex === null || fromWord === null || endParagraphIndex === null || toWord === null || !look || !format) return null
  return { bookId, editionKey, chapterNumber, paragraphIndex, fromWord, endParagraphIndex, toWord, look, format, context: flag(raw.context), tagline: flag(raw.tagline) }
}

export interface LoadedShare {
  content: ShareContent
  author: string
  /** Edition credit and licence, for the /q/{id} page. */
  credit: string
  licence: EditionLicence | null
}

/** The passage from our own edition files, or null when it is not shareable. */
export async function loadShareContent(env: ShareEnv, origin: string, input: ShareRecordInput): Promise<LoadedShare | null> {
  const book = getBook(input.bookId)
  const edition = book?.editions.find(item => item.key === input.editionKey)
  if (!book || !edition) return null
  if (isBookTemporarilyHeld(book.id) || editionHold(book.id, edition.key) || isEditionWithheld(book.id, edition.key)) return null
  const retrieval = createBookRetrieval({ assets: env.ASSETS, origin, book: { bookId: book.id, editionKey: edition.key } })
  const index = await retrieval.editionIndex()
  // Never quietly substitute another edition's words.
  if (!index || index.editionKey !== edition.key) return null
  const chapter = await retrieval.chapterText(input.chapterNumber)
  if (!chapter) return null
  const range: ShareRange = { paragraphIndex: input.paragraphIndex, fromWord: input.fromWord, endParagraphIndex: input.endParagraphIndex, toWord: input.toWord }
  if (!isValidShareRange(chapter.paragraphs, range)) return null
  return {
    author: book.author,
    credit: editionCredit(edition),
    licence: editionLicence(book.id, edition.key),
    content: { bookTitle: book.title, chapterLabel: chapter.title, language: edition.language, paragraphs: chapter.paragraphs, range },
  }
}

function optionsOf(input: ShareRecordInput, format: ShareFormat): ShareOptions {
  const options: ShareOptions = { format, look: input.look, context: input.context, tagline: input.tagline }
  // The link preview of a quote set as a series opens on its first card.
  if (format === 'og' && !input.context) options.cardFormat = input.format
  return options
}

/** A share's cards are numbered 1 to SERIES_MAX_CARDS; anything else is card 1. */
export function parseShareCard(value: string | null): number {
  const card = value && /^[1-9]$/.test(value) ? Number(value) : 1
  return card <= SERIES_MAX_CARDS ? card : 1
}

/** How many cards the share is, on every image response (the share sheet reads it). */
export const SHARE_CARDS_HEADER = 'X-Share-Cards'

async function pngResponse(env: ShareEnv, request: Request, ctx: ExecutionContext, cacheKey: string, draw: () => Promise<{ png: Uint8Array; cards: number } | null>): Promise<Response> {
  const cache = typeof caches !== 'undefined' ? (caches as unknown as { default: Cache }).default : null
  const key = new Request(cacheKey)
  const cached = await cache?.match(key)
  if (cached) return request.method === 'HEAD' ? new Response(null, { headers: cached.headers }) : cached
  const drawn = await draw()
  if (!drawn) return new Response('Not found', { status: 404, headers: { 'Cache-Control': 'no-store', 'Content-Type': 'text/plain' } })
  // Public images: the Android app fetches them cross-origin to attach to a share.
  const response = new Response(drawn.png as unknown as BodyInit, {
    headers: {
      'Content-Type': 'image/png', 'Cache-Control': IMAGE_CACHE, 'X-Content-Type-Options': 'nosniff',
      'Access-Control-Allow-Origin': '*', 'Access-Control-Expose-Headers': SHARE_CARDS_HEADER, [SHARE_CARDS_HEADER]: String(drawn.cards),
    },
  })
  if (cache) ctx.waitUntil(cache.put(key, response.clone()))
  return request.method === 'HEAD' ? new Response(null, { headers: response.headers }) : response
}

async function renderInput(env: ShareEnv, origin: string, input: ShareRecordInput, format: ShareFormat, card = 1): Promise<{ png: Uint8Array; cards: number } | null> {
  const loaded = await loadShareContent(env, origin, input)
  if (!loaded) return null
  const { renderSharePng } = await import('../lib/shareRender')
  const drawn = await renderSharePng(env.ASSETS, origin, loaded.content, optionsOf(input, format), card)
  return { png: drawn.png, cards: drawn.cards ?? 1 }
}

function readerHref(record: Pick<ShareRecord, 'id' | 'bookId' | 'editionKey' | 'chapterNumber' | 'paragraphIndex' | 'fromWord'>): string {
  const params = new URLSearchParams({
    book: record.bookId, edition: record.editionKey, chapter: String(record.chapterNumber),
    paragraph: String(record.paragraphIndex), word: String(record.fromWord), share: record.id,
  })
  return `/reader?${params}`
}

function excerpt(text: string, max = 110): string {
  if (text.length <= max) return text
  const cut = text.slice(0, max)
  const space = cut.lastIndexOf(' ')
  return `${(space > 60 ? cut.slice(0, space) : cut).replace(/[,;:.!?\u2014-]+$/, '')}\u2026`
}

/**
 * The /q/{id} page. A quote set as a series of cards (`quote` given: its
 * paragraphs) is shown in full as text rather than as its first card.
 */
export function shareLinkPage(input: { origin: string; record: ShareRecord; text: string; bookTitle: string; author: string; chapterLabel: string; credit?: string; licence?: EditionLicence | null; quote?: string[] }): string {
  const { origin, record } = input
  const url = `${origin}/q/${record.id}`
  // "…" only where the quote starts or stops mid-sentence, as on the image.
  const title = `“${excerpt(input.text)}”`
  // The image carries no edition line; this page names the edition, and the
  // licence where the text needs attribution (also in the preview text).
  const licence = input.licence ? `${input.licence.attribution}, ${input.licence.licence}` : ''
  const description = `${input.bookTitle}, ${input.author} · ${input.chapterLabel}${licence ? ` · ${licence}` : ''}`
  const og = `${url}/og.png`
  const href = readerHref(record)
  const e = htmlEscape
  return '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'
    + `<title>${e(title)} — ${e(input.bookTitle)}</title>`
    + `<meta name="description" content="${e(description)}"><meta name="robots" content="noindex,follow"><link rel="canonical" href="${e(url)}">`
    + `<meta property="og:type" content="article"><meta property="og:site_name" content="Tinct"><meta property="og:url" content="${e(url)}">`
    + `<meta property="og:title" content="${e(title)}"><meta property="og:description" content="${e(description)}">`
    + `<meta property="og:image" content="${e(og)}"><meta property="og:image:type" content="image/png"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta property="og:image:alt" content="${e(title)}">`
    + `<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${e(title)}"><meta name="twitter:description" content="${e(description)}"><meta name="twitter:image" content="${e(og)}"><meta name="twitter:image:alt" content="${e(title)}">`
    + '<link rel="icon" href="/brand/20260921/favicon.svg" type="image/svg+xml">'
    + '<style>body{margin:0;background:#ece7db;color:#0b0b0b;font:18px/1.5 "EB Garamond",Georgia,serif;display:flex;flex-direction:column;align-items:center;gap:16px;padding:24px 16px}img{max-width:min(100%,540px);height:auto;box-shadow:0 2px 12px rgba(60,45,25,.15)}a{color:#1f4a5c}blockquote{margin:0;max-width:540px}blockquote p{margin:0 0 .8em}.credit{margin:0;max-width:540px;text-align:center;font-size:15px;color:#6a6256}</style>'
    + `<script src="/share-open.js" defer></script></head><body data-reader="${e(href)}">`
    + (input.quote?.length
      ? `<blockquote>${input.quote.map(paragraph => `<p>${e(paragraph)}</p>`).join('')}</blockquote>`
      // The page image has a fixed size; the quote card's height follows its text.
      : `<img src="${e(`${url}/image.png`)}" alt="${e(title)}"${record.context ? ` width="${record.format === 'phone' ? 1080 : 1600}" height="${record.format === 'phone' ? 1350 : 1000}"` : ''}>`)
    + `<a href="${e(href)}">${e(input.bookTitle)}</a>`
    + (input.credit || input.licence
      ? `<p class="credit">${e([input.author, input.chapterLabel, input.credit].filter(Boolean).join(' · '))}`
        + (input.licence ? `<br>${e(input.licence.attribution)}, <a href="${e(input.licence.licenceUrl)}" rel="license noopener">${e(input.licence.licence)}</a>` : '')
        + '</p>'
      : '')
    + '</body></html>'
}

export async function handleShareApi(request: Request, env: ShareEnv, ctx: ExecutionContext, deps: ShareDeps): Promise<Response> {
  const url = new URL(request.url)
  const path = url.pathname.replace(/\/+$/, '')

  if (path === '/api/share/preview') {
    if (request.method !== 'GET' && request.method !== 'HEAD') return jsonResponse({ error: 'Method not allowed' }, 405, request)
    const input = parseShareInput(Object.fromEntries(url.searchParams))
    if (!input) return jsonResponse({ error: 'invalid_share' }, 400, request)
    if (!(await deps.checkRateLimit(`share-preview:${clientKey(request)}`, undefined, SHARE_PREVIEW_PER_MINUTE))) return jsonResponse({ error: 'rate_limited' }, 429, request)
    const card = parseShareCard(url.searchParams.get('card'))
    const key = `${url.origin}/__share-preview/v${SHARE_RENDER_VERSION}?${new URLSearchParams([...Object.entries(input).map(([k, v]) => [k, String(v)]), ['card', String(card)]])}`
    return pngResponse(env, request, ctx, key, () => renderInput(env, url.origin, input, input.format, card))
  }

  if (path === '/api/share') {
    if (request.method !== 'POST') return jsonResponse({ error: 'Method not allowed' }, 405, request)
    const store = storeOf(env)
    if (!store) return jsonResponse({ error: 'unavailable' }, 503, request)
    let body: Record<string, unknown>
    try {
      const text = await request.text()
      if (text.length > 4096) return jsonResponse({ error: 'invalid_share' }, 400, request)
      body = JSON.parse(text)
    } catch {
      return jsonResponse({ error: 'invalid_share' }, 400, request)
    }
    const input = body && typeof body === 'object' ? parseShareInput(body) : null
    if (!input) return jsonResponse({ error: 'invalid_share' }, 400, request)
    const user = request.headers.get('authorization') ? await deps.verifyUser(request) : null
    const caller = user?.id ? `user:${user.id}` : `ip:${clientKey(request)}`
    if (!(await deps.checkRateLimit(`share-create:${caller}`, undefined, SHARE_CREATE_PER_MINUTE))) return jsonResponse({ error: 'rate_limited' }, 429, request)
    const loaded = await loadShareContent(env, url.origin, input)
    if (!loaded) return jsonResponse({ error: 'invalid_share' }, 400, request)
    const record = await store.create(input, user?.id ?? null)
    return jsonResponse({ id: record.id, url: `${url.origin}/q/${record.id}`, image: `${url.origin}/q/${record.id}/image.png` }, 201, request)
  }

  const match = path.match(/^\/api\/share\/([a-z0-9]+)$/)
  if (match) {
    if (request.method !== 'GET') return jsonResponse({ error: 'Method not allowed' }, 405, request)
    const record = SHARE_ID_PATTERN.test(match[1]) ? await storeOf(env)?.get(match[1]) : null
    if (!record) return jsonResponse({ error: 'not_found' }, 404, request)
    const { bookId, editionKey, chapterNumber, paragraphIndex, fromWord, endParagraphIndex, toWord } = record
    return jsonResponse({ id: record.id, bookId, editionKey, chapterNumber, paragraphIndex, fromWord, endParagraphIndex, toWord }, 200, request)
  }
  return jsonResponse({ error: 'not_found' }, 404, request)
}

/** `/q/{id}` and its images. Returns null for paths it does not own. */
export async function handleSharePage(request: Request, env: ShareEnv, ctx: ExecutionContext): Promise<Response | null> {
  const url = new URL(request.url)
  const match = url.pathname.match(/^\/q\/([a-z0-9]+)(?:\/(image|og)\.png)?\/?$/)
  if (!match) return null
  if (request.method !== 'GET' && request.method !== 'HEAD') return new Response('Method not allowed', { status: 405 })
  const notFound = () => new Response('Not found', { status: 404, headers: { 'Cache-Control': 'no-store', 'Content-Type': 'text/plain; charset=utf-8' } })
  if (!SHARE_ID_PATTERN.test(match[1])) return notFound()
  const record = await storeOf(env)?.get(match[1])
  if (!record) return notFound()
  const kind = match[2]
  if (kind) {
    const format: ShareFormat = kind === 'og' ? 'og' : record.format
    const key = `${url.origin}/__share/v${SHARE_RENDER_VERSION}/${record.id}/${format}.png`
    return pngResponse(env, request, ctx, key, () => renderInput(env, url.origin, record, format))
  }
  const loaded = await loadShareContent(env, url.origin, record)
  if (!loaded) return notFound()
  const quote = buildPassage(loaded.content.paragraphs, loaded.content.range, false).map(paragraph => paragraph.tokens.map(token => token.text).join(' '))
  // A quote set as a series of cards: the page shows all of it as text.
  let series = false
  if (!record.context) {
    const { shareCardCount } = await import('../lib/shareRender')
    series = await shareCardCount(env.ASSETS, url.origin, loaded.content, optionsOf(record, record.format)).then(count => count > 1, () => false)
  }
  const html = shareLinkPage({
    origin: url.origin, record,
    text: quote.join(' '),
    bookTitle: loaded.content.bookTitle, author: loaded.author, chapterLabel: loaded.content.chapterLabel,
    credit: loaded.credit, licence: loaded.licence,
    quote: series ? quote : undefined,
  })
  return new Response(request.method === 'HEAD' ? null : html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'public, max-age=300' },
  })
}
