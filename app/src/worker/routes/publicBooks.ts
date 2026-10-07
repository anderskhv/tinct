/**
 * "Add to Tinct": public-domain books from the Add-a-book catalogue become
 * shared Tinct books, readable by everyone.
 *
 *   GET  /api/public-books                       the index (catalogue entries of every added book)
 *   GET  /api/public-books/{bookId}              one book: registry-like `book` + catalogue `entry`
 *   GET  /api/public-books/{bookId}/cover        its painted cover, once one exists
 *   POST /api/public-books/import                { workId } → exists | convert (signed in)
 *   GET  /api/public-books/import/{bookId}/source  the downloaded EPUB, for conversion (signed in)
 *   POST /api/public-books/import/{bookId}/commit  { chapters } → imported (signed in)
 *   GET  /data/editions/{bookId}-{editionKey}.json the edition text, like any registry edition
 *   …/{bookId}/modern-en[/checkout|/priority]     the paid Modern English edition (publicBookModern.ts)
 *
 * Why two steps: the edition must come from the reader's own converter
 * (lab/userBook/epubEdition.ts), which needs a DOM the Worker does not have.
 * So the Worker downloads the EPUB itself (allowlisted hosts only, size and
 * time limits), the browser converts that exact file and sends the chapters
 * back, and the Worker publishes only text it finds in the downloaded EPUB
 * (lib/epubSource.ts). Title, author and source come from the catalogue on
 * the server, never from the browser.
 *
 * Abuse limits: per account per day and a global daily ceiling; the same work
 * is one import (its id is derived from the work id, and an existing book is
 * returned as is); a short lock lets only one import of a work run at a time.
 *
 * Storage: R2 `public-books/` in PUBLIC_BOOKS when bound, else the existing
 * public AUDIO_BUCKET. Public books hold no personal data: who added a book is
 * not stored. The daily counters are short-lived coordinator windows (24 h).
 */
import { corsHeaders } from '../lib/responses'
import { isValidUUID } from '../lib/security'
import type { CheckRateLimit } from '../lib/rateLimit'
import { sniffBookType } from './userBooks'
import { epubSourceLetters, verifyEditionAgainstSource, type EditionChapterInput } from '../lib/epubSource'
import { lookupCatalogueWork } from '../lib/publicBookCatalogue'
import { anthropicShelfChooser, classifyWork, placementFor, type Classification, type ShelfChooser } from '../lib/publicBookClassify'
import { backfillCoverJobs, coverContentType, coverObjectKey, paintingSpineTone, processCoverJobs, queueCoverJob, type CoverFetch } from '../lib/publicBookCovers'
import {
  WORK_ID,
  allowedSourceUrl,
  importableWork,
  isPublicBookId,
  publicBookId,
  sourceName,
  type CatalogueWork,
  type PublicPlacement,
} from '../../../public/lab/public-books.js'
import { normalizeChapterTitles } from '../../../public/lab/chapter-title.js'
import type { Book, Edition } from '../../types'
import { handleModernEdition, modernEditionChapter, serveModernEdition, type ModernDeps, type ModernEnv } from './publicBookModern'

export const PREFIX = 'public-books/'
export const INDEX_KEY = PREFIX + 'index.json'
export const MAX_EPUB_BYTES = 25 * 1024 * 1024
export const MAX_COMMIT_BYTES = 15 * 1024 * 1024
export const DOWNLOAD_TIMEOUT_MS = 45_000
export const MAX_REDIRECTS = 3
export const IMPORTS_PER_DAY = 10
export const IMPORTS_PER_DAY_ALL = 300
export const REQUESTS_PER_MINUTE = 20
export const LOCK_MS = 10 * 60_000
export const LIMITS = { chapters: 3000, paragraphsPerChapter: 20_000, paragraphChars: 60_000, titleChars: 200, totalParagraphs: 200_000 }

export type PublicBooksEnv = {
  PUBLIC_BOOKS?: R2Bucket
  AUDIO_BUCKET?: R2Bucket
  ASSETS: { fetch: (request: Request) => Promise<Response> }
  ANTHROPIC_API_KEY?: string
  XAI_API_KEY?: string
  /** "1" lets a model place books the rules cannot (production only). */
  PUBLIC_BOOK_AI_CLASSIFY?: string
  /** "1" queues a painted cover for every added book (production only). */
  PUBLIC_BOOK_PAINTED_COVERS?: string
}

type VerifiedUser = { id: string; email?: string }

export interface PublicBooksDeps {
  verifyUser: (request: Request) => Promise<VerifiedUser | null>
  checkRateLimit: CheckRateLimit
  /** Counts one import against a daily window; false once the window is full. */
  countDaily: (key: string, limit: number) => Promise<boolean>
  /** True for the first caller in a LOCK_MS window for this book. */
  acquireLock: (bookId: string) => Promise<boolean>
  fetchSource?: typeof fetch
  chooser?: ShelfChooser | null
  coverFetch?: CoverFetch
  waitUntil?: (promise: Promise<unknown>) => void
  now?: () => Date
  /** Overrides for the Modern English routes (tests: generator, Stripe, customer). */
  modern?: Partial<ModernDeps>
}

export interface PublicCatalogueEntry {
  id: string
  title: string
  author: string
  summary: string
  blurb: string
  displayYear: string
  wordCount: number | null
  /** `spine`: the painting's spine tone, set with `art` once a painting exists (lib/publicBookCovers.ts). */
  cover: { kind: 'generated'; background: string; accent: string; spine?: string }
  art: { src: string; srcSet: string } | null
  paper: true
  shelfIds: string[]
  houseIds: string[]
  placement: PublicPlacement[]
  topics: string[]
  form: string
  era: string | null
  year: number | null
  editions: Array<Record<string, unknown>>
  defaultEditionKey: string
  defaultCompareEditionKey: null
  availability: { cover: boolean; chapterText: boolean; audio: boolean; compare: boolean; optionalPreface: boolean }
  readingStructure: { totalParagraphs: number; chapters: Array<{ number: number; title: string; paragraphCount: number }> }
  discoveryAvailable: true
  catalogueIndex: number
  public: { workId: string; source: string; sourceName: string; sourceUrl: string | null; licence: string; addedAt: string }
}

export interface StoredMeta { version: 1; book: Book; entry: PublicCatalogueEntry; editionKey: string; sha256: string; classification: Classification; verification: { checked: number; removed: number; renamed: number } }

export const bucketOf = (env: Pick<PublicBooksEnv, 'PUBLIC_BOOKS' | 'AUDIO_BUCKET'>) => env.PUBLIC_BOOKS ?? env.AUDIO_BUCKET ?? null
export const metaKey = (bookId: string) => `${PREFIX}${bookId}/meta.json`
export const editionObjectKey = (bookId: string, editionKey: string) => `${PREFIX}${bookId}/${editionKey}.json`
const coverKey = coverObjectKey
const stagingKey = (bookId: string) => `${PREFIX}staging/${bookId}.epub`

function headers(request: Request, extra: Record<string, string> = {}): Record<string, string> {
  return { ...corsHeaders(request), 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', ...extra }
}
function reply(data: unknown, status: number, request: Request, cache?: string): Response {
  return Response.json(data, { status, headers: headers(request, cache ? { 'Cache-Control': cache } : {}) })
}

export async function readJson<T>(bucket: R2Bucket, key: string): Promise<T | null> {
  const object = await bucket.get(key)
  if (!object) return null
  try { return JSON.parse(await new Response(object.body).text()) as T } catch { return null }
}

async function sha256Hex(bytes: Uint8Array): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', bytes)
  return [...new Uint8Array(digest)].map(b => b.toString(16).padStart(2, '0')).join('')
}

/** The edition key: the text as published, in its language (`original-en`). */
export function publicEditionKey(work: Pick<CatalogueWork, 'language'>): string {
  const language = (work.language || []).find(code => /^[a-z]{2}$/.test(code)) || 'en'
  return `original-${language}`
}

// ===== Download =====

export class ImportError extends Error {
  status: number
  code: string
  constructor(status: number, code: string) {
    super(code)
    this.status = status
    this.code = code
  }
}

/** The EPUB from an allowlisted host: every redirect re-checked, size and time bounded. */
export async function downloadEpub(source: string, url: string, fetchImpl: typeof fetch = fetch): Promise<Uint8Array> {
  const signal = AbortSignal.timeout(DOWNLOAD_TIMEOUT_MS)
  let current = url
  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    if (!allowedSourceUrl(source, current)) throw new ImportError(422, 'source_not_allowed')
    let response: Response | null = null
    // One retry, a second later, for a network error, 429 or 5xx (libraries throttle briefly).
    for (let attempt = 0; attempt < 2 && !response; attempt++) {
      if (attempt) await new Promise(resolve => setTimeout(resolve, 1000))
      try {
        const answer = await fetchImpl(current, { redirect: 'manual', signal, headers: { 'User-Agent': 'Tinct (https://tinct.app; public-domain import)', Accept: 'application/epub+zip,*/*;q=0.5' } })
        if ((answer.status === 429 || answer.status >= 500) && attempt === 0) { await answer.body?.cancel().catch(() => {}); continue }
        response = answer
      } catch {
        if (signal.aborted || attempt === 1) throw new ImportError(502, 'source_unavailable')
      }
    }
    if (!response) throw new ImportError(502, 'source_unavailable')
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get('location')
      await response.body?.cancel().catch(() => {})
      if (!location) throw new ImportError(502, 'source_unavailable')
      current = new URL(location, current).toString()
      continue
    }
    if (!response.ok || !response.body) throw new ImportError(502, 'source_unavailable')
    const declared = Number(response.headers.get('content-length') || '')
    if (Number.isFinite(declared) && declared > MAX_EPUB_BYTES) { await response.body.cancel().catch(() => {}); throw new ImportError(413, 'source_too_large') }
    const reader = response.body.getReader()
    const parts: Uint8Array[] = []
    let total = 0
    try {
      for (;;) {
        const { done, value } = await reader.read()
        if (done) break
        total += value.byteLength
        if (total > MAX_EPUB_BYTES) { await reader.cancel().catch(() => {}); throw new ImportError(413, 'source_too_large') }
        parts.push(value)
      }
    } catch (error) {
      if (error instanceof ImportError) throw error
      throw new ImportError(502, 'source_unavailable')
    }
    const bytes = new Uint8Array(total)
    let at = 0
    for (const part of parts) { bytes.set(part, at); at += part.byteLength }
    if (sniffBookType(bytes) !== 'epub') throw new ImportError(422, 'not_epub')
    return bytes
  }
  throw new ImportError(502, 'source_unavailable')
}

// ===== The uploaded conversion =====

/** The chapters the browser sent, if they have the converter's shape and fit the limits. */
export function parseChapters(value: unknown): EditionChapterInput[] | null {
  const chapters = (value as { chapters?: unknown } | null)?.chapters
  if (!Array.isArray(chapters) || chapters.length === 0 || chapters.length > LIMITS.chapters) return null
  let total = 0
  const out: EditionChapterInput[] = []
  for (const chapter of chapters) {
    const c = chapter as { title?: unknown; paragraphs?: unknown }
    if (typeof c?.title !== 'string' || !Array.isArray(c.paragraphs) || c.paragraphs.length > LIMITS.paragraphsPerChapter) return null
    if (c.paragraphs.some(p => typeof p !== 'string' || p.length > LIMITS.paragraphChars)) return null
    total += c.paragraphs.length
    if (total > LIMITS.totalParagraphs) return null
    // Text only: the reader renders paragraphs as text, but nothing tag-like is kept either way.
    out.push({ number: out.length + 1, title: c.title.replace(/[<>]/g, '').slice(0, LIMITS.titleChars), paragraphs: (c.paragraphs as string[]).map(p => p.replace(/[<>]/g, '')) })
  }
  return out
}

async function readCappedText(request: Request, limit: number): Promise<string | null> {
  const declared = Number(request.headers.get('content-length') || '')
  if (Number.isFinite(declared) && declared > limit) return null
  if (!request.body) return ''
  const reader = request.body.getReader()
  const parts: Uint8Array[] = []
  let total = 0
  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    total += value.byteLength
    if (total > limit) { await reader.cancel().catch(() => {}); return null }
    parts.push(value)
  }
  const bytes = new Uint8Array(total)
  let at = 0
  for (const part of parts) { bytes.set(part, at); at += part.byteLength }
  return new TextDecoder().decode(bytes)
}

// ===== Records =====

const TONES = ['#2c2417', '#1f2a24', '#2a1f2b', '#1d2633', '#33241c', '#24291b']
function tone(id: string): string {
  let h = 0
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) >>> 0
  return TONES[h % TONES.length]
}

function displayYear(year: number | null): string {
  if (year === null) return ''
  return year < 0 ? `${-year} BC` : String(year)
}

const wordsIn = (paragraphs: string[]) => paragraphs.reduce((sum, p) => sum + p.split(/\s+/).filter(Boolean).length, 0)

/** Registry `Book` and library catalogue entry for an added work. */
export function publicRecords(input: {
  bookId: string; work: CatalogueWork; chapters: EditionChapterInput[]; classification: Classification; addedAt: string; catalogueIndex: number
}): { book: Book; entry: PublicCatalogueEntry; editionKey: string } {
  const { bookId, work, chapters, classification } = input
  const edition = work.editions[0]
  const editionKey = publicEditionKey(work)
  const language = editionKey.slice('original-'.length) as Edition['language']
  const author = (work.authors || []).map(person => person.name).filter(Boolean).join(', ') || 'Anonymous'
  const translator = (work.translators || []).map(person => person.name).filter(Boolean).join(', ') || undefined
  const title = work.title.trim()
  const wordCount = chapters.reduce((sum, chapter) => sum + wordsIn(chapter.paragraphs), 0)
  const library = sourceName(edition.source)
  const licence = edition.licence && edition.licence !== 'PD' ? edition.licence : 'Public domain'
  // Attribution, as the source licence asks (CC BY-SA for Wikisource and Bibebook).
  const summary = licence === 'Public domain' ? `Public-domain text from ${library}.` : `Text from ${library}, ${licence}.`
  const label = translator ? `Translated by ${translator}` : 'Original'
  const bookEdition: Edition = { key: editionKey, language, style: 'original', label, aligned: false, hasAudio: false, ...(translator ? { translator } : {}), ...(classification.year !== null ? { year: classification.year } : {}) }
  const background = tone(bookId)
  const book: Book = { id: bookId, title, author, description: summary, ...(classification.year !== null ? { year: classification.year } : {}), wordCount, coverColor: background, coverAccent: '#e9dfc4', editions: [bookEdition] }
  const placement = placementFor(classification.shelfIds)
  const readingStructure = { totalParagraphs: chapters.reduce((sum, c) => sum + c.paragraphs.length, 0), chapters: chapters.map(c => ({ number: c.number, title: c.title, paragraphCount: c.paragraphs.length })) }
  const entry: PublicCatalogueEntry = {
    id: bookId,
    title,
    author,
    summary,
    blurb: summary,
    displayYear: displayYear(classification.year),
    wordCount,
    cover: { kind: 'generated', background, accent: '#e9dfc4' },
    art: null,
    paper: true,
    shelfIds: classification.shelfIds,
    houseIds: classification.houseIds,
    placement,
    topics: [classification.form, classification.era, ...placement.flatMap(p => [p.shelfTitle, p.houseTitle])].filter((x): x is string => !!x),
    form: classification.form,
    era: classification.era,
    year: classification.year,
    editions: [{
      key: editionKey, language, style: 'original', label, translator: translator ?? null, year: classification.year, aligned: false,
      group: 'human', provenance: translator ? 'human-translation' : 'published-edition',
      provenanceLabel: translator ? `Human translation by ${translator}` : 'Published public-domain edition',
      availability: { chapterText: true, audio: false, compare: false }, discoveryAvailable: true,
      wordCount, readingStructure,
    }],
    defaultEditionKey: editionKey,
    defaultCompareEditionKey: null,
    availability: { cover: true, chapterText: true, audio: false, compare: false, optionalPreface: false },
    readingStructure,
    discoveryAvailable: true,
    catalogueIndex: input.catalogueIndex,
    public: { workId: work.id, source: edition.source, sourceName: library, sourceUrl: edition.sourceUrl ?? null, licence, addedAt: input.addedAt },
  }
  return { book, entry, editionKey }
}

/** Add or replace one entry in the index, with R2's conditional put so concurrent imports never drop each other. */
export async function upsertIndexEntry(bucket: R2Bucket, entry: PublicCatalogueEntry): Promise<void> {
  for (let attempt = 0; attempt < 8; attempt++) {
    const current = await bucket.get(INDEX_KEY)
    const index = current ? JSON.parse(await new Response(current.body).text()) as { version: 1; books: PublicCatalogueEntry[] } : { version: 1 as const, books: [] }
    const books = index.books.filter(book => book.id !== entry.id)
    books.push(entry)
    const body = JSON.stringify({ version: 1, books })
    const put = await bucket.put(INDEX_KEY, body, {
      httpMetadata: { contentType: 'application/json' },
      onlyIf: current ? { etagMatches: current.etag } : { etagDoesNotMatch: '*' },
    })
    if (put) return
  }
  throw new Error('index update contended')
}

// ===== Handlers =====

async function serveIndex(request: Request, bucket: R2Bucket): Promise<Response> {
  const index = await readJson<{ books?: PublicCatalogueEntry[] }>(bucket, INDEX_KEY)
  return reply({ books: index?.books ?? [] }, 200, request, 'public, max-age=60')
}

async function serveBook(request: Request, bucket: R2Bucket, bookId: string): Promise<Response> {
  const meta = await readJson<StoredMeta>(bucket, metaKey(bookId))
  if (!meta) return reply({ error: 'Not found' }, 404, request)
  return reply({ book: meta.book, entry: meta.entry }, 200, request, 'public, max-age=60')
}

async function serveCover(request: Request, bucket: R2Bucket, bookId: string): Promise<Response> {
  const object = await bucket.get(coverKey(bookId))
  if (!object) return reply({ error: 'Not found' }, 404, request)
  return new Response(object.body, { status: 200, headers: headers(request, { 'Content-Type': object.httpMetadata?.contentType || 'image/jpeg', 'Cache-Control': 'public, max-age=86400' }) })
}

async function prepare(request: Request, env: PublicBooksEnv, bucket: R2Bucket, user: VerifiedUser, deps: PublicBooksDeps): Promise<Response> {
  const body = await readCappedText(request, 4096)
  let workId = ''
  try { workId = String((JSON.parse(body || '{}') as { workId?: unknown }).workId ?? '') } catch { /* below */ }
  if (!WORK_ID.test(workId)) return reply({ error: 'bad_request' }, 400, request)
  const bookId = publicBookId(workId)!
  const existing = await readJson<StoredMeta>(bucket, metaKey(bookId))
  if (existing) return reply({ status: 'exists', bookId, book: existing.book, entry: existing.entry }, 200, request)
  let work: CatalogueWork | null
  try { work = await lookupCatalogueWork(env.ASSETS, new URL(request.url).origin, workId) } catch { return reply({ error: 'catalogue_unavailable' }, 503, request) }
  if (!work) return reply({ error: 'not_found' }, 404, request)
  if (!importableWork(work)) return reply({ error: 'not_importable' }, 422, request)
  // A staged download of this work (a conversion still to come) is reused.
  if (await bucket.head(stagingKey(bookId))) return reply({ status: 'convert', bookId, source: `/api/public-books/import/${bookId}/source` }, 200, request)
  if (!await deps.countDaily(`public-book-day:${user.id}`, IMPORTS_PER_DAY)) return reply({ error: 'daily_limit', limit: IMPORTS_PER_DAY }, 429, request)
  if (!await deps.countDaily('public-book-day:all', IMPORTS_PER_DAY_ALL)) return reply({ error: 'daily_limit' }, 429, request)
  if (!await deps.acquireLock(bookId)) return reply({ error: 'in_progress' }, 409, request)
  let bytes: Uint8Array
  try {
    bytes = await downloadEpub(work.editions[0].source, work.editions[0].epubUrl!, deps.fetchSource)
  } catch (error) {
    const failure = error instanceof ImportError ? error : new ImportError(502, 'source_unavailable')
    return reply({ error: failure.code }, failure.status, request)
  }
  await bucket.put(stagingKey(bookId), bytes, {
    httpMetadata: { contentType: 'application/epub+zip' },
    customMetadata: { workId, sha256: await sha256Hex(bytes), fetchedAt: (deps.now?.() ?? new Date()).toISOString() },
  })
  return reply({ status: 'convert', bookId, source: `/api/public-books/import/${bookId}/source` }, 200, request)
}

async function staged(request: Request, bucket: R2Bucket, bookId: string): Promise<Response> {
  const object = await bucket.get(stagingKey(bookId))
  if (!object) return reply({ error: 'not_prepared' }, 409, request)
  return new Response(object.body, { status: 200, headers: headers(request, { 'Content-Type': 'application/epub+zip', 'Content-Length': String(object.size) }) })
}

async function commit(request: Request, env: PublicBooksEnv, bucket: R2Bucket, bookId: string, deps: PublicBooksDeps, ctxWaitUntil?: (p: Promise<unknown>) => void): Promise<Response> {
  const existing = await readJson<StoredMeta>(bucket, metaKey(bookId))
  if (existing) return reply({ status: 'exists', bookId, book: existing.book, entry: existing.entry }, 200, request)
  const stagedObject = await bucket.get(stagingKey(bookId))
  if (!stagedObject) return reply({ error: 'not_prepared' }, 409, request)
  const workId = stagedObject.customMetadata?.workId || ''
  const sourceBytes = new Uint8Array(await new Response(stagedObject.body).arrayBuffer())
  if (publicBookId(workId) !== bookId) return reply({ error: 'not_prepared' }, 409, request)
  const text = await readCappedText(request, MAX_COMMIT_BYTES)
  if (text === null) return reply({ error: 'too_large', maxBytes: MAX_COMMIT_BYTES }, 413, request)
  let parsed: unknown
  try { parsed = JSON.parse(text) } catch { return reply({ error: 'bad_request' }, 400, request) }
  const chapters = parseChapters(parsed)
  if (!chapters) return reply({ error: 'bad_edition' }, 422, request)
  let source: string
  try { source = await epubSourceLetters(sourceBytes) } catch { return reply({ error: 'not_epub' }, 422, request) }
  const checked = verifyEditionAgainstSource(chapters, source)
  if (!checked) return reply({ error: 'edition_mismatch' }, 422, request)
  let work: CatalogueWork | null
  try { work = await lookupCatalogueWork(env.ASSETS, new URL(request.url).origin, workId) } catch { return reply({ error: 'catalogue_unavailable' }, 503, request) }
  if (!work || !importableWork(work)) return reply({ error: 'not_importable' }, 422, request)
  const chooser = deps.chooser !== undefined ? deps.chooser : env.PUBLIC_BOOK_AI_CLASSIFY === '1' && env.ANTHROPIC_API_KEY ? anthropicShelfChooser(env.ANTHROPIC_API_KEY) : null
  const classification = await classifyWork(work, chooser)
  const addedAt = (deps.now?.() ?? new Date()).toISOString()
  const index = await readJson<{ books?: unknown[] }>(bucket, INDEX_KEY)
  // Titles were checked as the EPUB writes them; they are published in house style
  // ("CHAPTER I—M. MYRIEL" -> "Chapter 1 — M. Myriel", public/lab/chapter-title.js).
  const verified = { ...checked, chapters: normalizeChapterTitles(checked.chapters, { language: publicEditionKey(work).slice('original-'.length) }) }
  const { book, entry, editionKey } = publicRecords({ bookId, work, chapters: verified.chapters, classification, addedAt, catalogueIndex: 100_000 + (index?.books?.length ?? 0) })
  const editionData = { chapters: verified.chapters }
  await bucket.put(editionObjectKey(bookId, editionKey), JSON.stringify(editionData), { httpMetadata: { contentType: 'application/json' } })
  const meta: StoredMeta = { version: 1, book, entry, editionKey, sha256: stagedObject.customMetadata?.sha256 || '', classification, verification: { checked: verified.checkedParagraphs, removed: verified.removedParagraphs, renamed: verified.renamedChapters } }
  await bucket.put(metaKey(bookId), JSON.stringify(meta), { httpMetadata: { contentType: 'application/json' } })
  await upsertIndexEntry(bucket, entry)
  await bucket.delete(stagingKey(bookId))
  if (env.PUBLIC_BOOK_PAINTED_COVERS === '1' && env.XAI_API_KEY) {
    await queueCoverJob(bucket, { bookId, title: book.title, author: book.author, year: classification.year })
    ctxWaitUntil?.(runPublicCoverJobs(env, { limit: 1, fetchImpl: deps.coverFetch }).catch(() => {}))
  }
  return reply({ status: 'imported', bookId, book, entry }, 201, request)
}

/** Per-run limit for cover jobs (and for the backfill that queues them). */
export const COVER_RUN_LIMIT = 5
/** A dark neutral spine for a painting whose edge could not be read (it suits any of the series' paintings). */
export const PAINTED_SPINE_FALLBACK = '#26241f'

/**
 * Paint queued covers (switch and key required). Stores the bytes and points the
 * book at them, with the painting's spine tone. With `backfill`, first queues a
 * job for added books that have neither a painting nor a job (books added while
 * the switch was off). `budgetMs` stops starting new paintings after that long.
 */
export async function runPublicCoverJobs(
  env: PublicBooksEnv,
  options: { limit: number; fetchImpl?: CoverFetch; backfill?: boolean; budgetMs?: number; now?: () => number; spineTone?: (bytes: Uint8Array) => Promise<string | null> },
): Promise<{ painted: number; failed: number; queued: string[] } | null> {
  const bucket = bucketOf(env)
  if (env.PUBLIC_BOOK_PAINTED_COVERS !== '1' || !env.XAI_API_KEY || !bucket) return null
  const now = options.now ?? Date.now
  const deadline = options.budgetMs !== undefined ? now() + options.budgetMs : undefined
  const spineTone = options.spineTone ?? paintingSpineTone
  /** Points the book at its stored painting, with the painting's spine tone. */
  const link = async (bookId: string, bytes: Uint8Array) => {
    const src = `/api/public-books/${bookId}/cover`
    const spine = (await spineTone(bytes).catch(() => null)) ?? PAINTED_SPINE_FALLBACK
    // Conditional, like the Modern English grant's own meta update, so neither drops the other's change.
    for (let attempt = 0; attempt < 5; attempt++) {
      const object = await bucket.get(metaKey(bookId))
      if (!object) return
      const meta = JSON.parse(await new Response(object.body).text()) as StoredMeta
      meta.entry = { ...meta.entry, art: { src, srcSet: `${src} 1x` }, cover: { ...meta.entry.cover, background: spine, spine } }
      meta.book = { ...meta.book, coverColor: spine }
      const put = await bucket.put(metaKey(bookId), JSON.stringify(meta), { httpMetadata: { contentType: 'application/json' }, onlyIf: { etagMatches: object.etag } })
      if (put) { await upsertIndexEntry(bucket, meta.entry); return }
    }
    throw new Error('meta update contended')
  }
  let queued: string[] = []
  if (options.backfill) {
    const index = await readJson<{ books?: PublicCatalogueEntry[] }>(bucket, INDEX_KEY)
    const books = (index?.books ?? []).map(entry => ({ id: entry.id, title: entry.title, author: entry.author, year: entry.year ?? null, art: entry.art }))
    queued = await backfillCoverJobs(bucket, books, {
      limit: options.limit,
      isAdded: isPublicBookId,
      now: new Date(now()),
      relink: async bookId => {
        const stored = await bucket.get(coverKey(bookId))
        if (stored) await link(bookId, new Uint8Array(await new Response(stored.body).arrayBuffer()))
      },
    })
  }
  const result = await processCoverJobs(bucket, {
    apiKey: env.XAI_API_KEY,
    limit: options.limit,
    fetchImpl: options.fetchImpl,
    now,
    deadline,
    onPainted: async (bookId, bytes) => {
      await bucket.put(coverKey(bookId), bytes, { httpMetadata: { contentType: coverContentType(bytes) } })
      await link(bookId, bytes)
    },
  })
  return { ...result, queued }
}

/** `/data/editions/pd-…-original-xx.json`: an added book's edition, served like a registry edition. */
export async function handlePublicEditionData(request: Request, env: PublicBooksEnv): Promise<Response | null> {
  const match = new URL(request.url).pathname.match(/^\/data\/editions\/(pd-[a-z0-9-]+?)-(original-[a-z]{2}|modern-en)\.json$/)
  if (!match || !isPublicBookId(match[1])) return null
  if (match[2] === 'modern-en') return serveModernEdition(request, env as ModernEnv, match[1])
  const bucket = bucketOf(env)
  if (!bucket) return reply({ error: 'Not configured' }, 503, request)
  const object = await bucket.get(editionObjectKey(match[1], match[2]))
  if (!object) return reply({ error: 'Not found' }, 404, request)
  return new Response(object.body, { status: 200, headers: headers(request, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'public, max-age=300' }) })
}

type EditionChapter = { number: number; title: string; paragraphs: string[] }

/** A chapter of an edition file by number, as narration has always picked it (the n-th entry if no number matches). */
export function editionChapter<T extends { number?: number }>(chapters: T[] | undefined, chapterNumber: number): T | null {
  if (!Array.isArray(chapters)) return null
  return chapters.find(item => item.number === chapterNumber) ?? chapters[chapterNumber - 1] ?? null
}

/**
 * One chapter of an added book, read from the same objects
 * handlePublicEditionData serves, so narration's paragraphs and their indices
 * are the reader's. `modernPending`: a Modern English chapter still served in
 * its original text. Null for anything the data route would not serve.
 */
export async function publicEditionChapter(env: Pick<PublicBooksEnv, 'PUBLIC_BOOKS' | 'AUDIO_BUCKET'>, bookId: string, editionKey: string, chapterNumber: number, now?: number): Promise<(EditionChapter & { modernPending: boolean }) | null> {
  if (!isPublicBookId(bookId)) return null
  if (editionKey === 'modern-en') {
    const chapter = await modernEditionChapter(env, bookId, chapterNumber, now)
    return chapter ? { number: chapter.number, title: chapter.title, paragraphs: chapter.paragraphs, modernPending: chapter.pending } : null
  }
  if (!/^original-[a-z]{2}$/.test(editionKey)) return null
  const bucket = bucketOf(env)
  if (!bucket) return null
  const edition = await readJson<{ chapters?: EditionChapter[] }>(bucket, editionObjectKey(bookId, editionKey))
  const chapter = editionChapter(edition?.chapters, chapterNumber)
  return chapter ? { ...chapter, modernPending: false } : null
}

export async function handlePublicBooks(request: Request, env: PublicBooksEnv, deps: PublicBooksDeps): Promise<Response> {
  const path = new URL(request.url).pathname.slice('/api/public-books'.length).replace(/\/$/, '')
  const bucket = bucketOf(env)
  if (!bucket) return reply({ error: 'Not configured' }, 503, request)
  const parts = path.split('/').filter(Boolean)

  if (request.method === 'GET' && parts.length === 0) return serveIndex(request, bucket)
  if (request.method === 'GET' && parts.length === 1 && isPublicBookId(parts[0])) return serveBook(request, bucket, parts[0])
  if (request.method === 'GET' && parts.length === 2 && parts[1] === 'cover' && isPublicBookId(parts[0])) return serveCover(request, bucket, parts[0])
  if (parts.length >= 2 && parts[1] === 'modern-en' && isPublicBookId(parts[0])) {
    return handleModernEdition(request, env as ModernEnv, parts[0], parts.slice(2), {
      verifyUser: deps.verifyUser, checkRateLimit: deps.checkRateLimit, waitUntil: deps.waitUntil, ...deps.modern,
    })
  }
  if (parts[0] !== 'import') return reply({ error: 'Not found' }, 404, request)

  const isPrepare = parts.length === 1 && request.method === 'POST'
  const isSource = parts.length === 3 && parts[2] === 'source' && request.method === 'GET' && isPublicBookId(parts[1])
  const isCommit = parts.length === 3 && parts[2] === 'commit' && request.method === 'POST' && isPublicBookId(parts[1])
  if (!isPrepare && !isSource && !isCommit) return reply({ error: 'Not found' }, 404, request)
  const user = await deps.verifyUser(request)
  if (!user || !isValidUUID(user.id)) return reply({ error: 'Unauthorized' }, 401, request)
  if (!await deps.checkRateLimit(`public-books:${user.id}`, undefined, REQUESTS_PER_MINUTE)) return reply({ error: 'rate_limited' }, 429, request)
  if (isPrepare) return prepare(request, env, bucket, user, deps)
  if (isSource) return staged(request, bucket, parts[1])
  return commit(request, env, bucket, parts[1], deps, deps.waitUntil)
}
