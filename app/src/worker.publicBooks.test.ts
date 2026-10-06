// @vitest-environment jsdom
// jsdom only for the browser half of an import (the reader's converter); the Worker code under test uses no DOM.
import { describe, expect, it } from 'vitest'
import { crc32, deflateRawSync, gzipSync } from 'node:zlib'
import { epubToEdition } from './lab/userBook/epubEdition'
import {
  DOWNLOAD_TIMEOUT_MS,
  IMPORTS_PER_DAY,
  INDEX_KEY,
  MAX_EPUB_BYTES,
  downloadEpub,
  handlePublicBooks,
  handlePublicEditionData,
  parseChapters,
  runPublicCoverJobs,
  upsertIndexEntry,
  type PublicBooksDeps,
} from './worker/routes/publicBooks'
import { findWorkInStream, objectEnd, resetCatalogueLookupCache } from './worker/lib/publicBookCatalogue'
import { classifyByRules, classifyWork, eraOf, HOUSES, SHELVES } from './worker/lib/publicBookClassify'
import { documentLetters, epubSourceLetters, letters, verifyEditionAgainstSource } from './worker/lib/epubSource'
import { coverPrompt } from './worker/lib/publicBookCovers'
import { LIBRARY_HOUSES, LIBRARY_SHELVES } from './data/libraryTaxonomy'
import type { CatalogueWork } from '../public/lab/public-books.js'

const USER = '11111111-1111-4111-8111-111111111111'
const OTHER = '22222222-2222-4222-8222-222222222222'

/** A deflated EPUB (every entry but mimetype compressed) with real paragraphs. */
function zipFiles(files: Array<[string, string]>): Uint8Array {
  const enc = new TextEncoder(), locals: Buffer[] = [], centrals: Buffer[] = []
  let offset = 0
  for (const [name, content] of files) {
    const raw = enc.encode(content), nameB = enc.encode(name)
    const method = name === 'mimetype' ? 0 : 8
    const data = method ? deflateRawSync(raw) : Buffer.from(raw)
    const crc = crc32(raw) >>> 0
    const local = Buffer.alloc(30 + nameB.length)
    local.writeUInt32LE(0x04034b50, 0); local.writeUInt16LE(20, 4); local.writeUInt16LE(0x800, 6); local.writeUInt16LE(method, 8)
    local.writeUInt32LE(crc, 14); local.writeUInt32LE(data.length, 18); local.writeUInt32LE(raw.length, 22); local.writeUInt16LE(nameB.length, 26)
    Buffer.from(nameB).copy(local, 30)
    const central = Buffer.alloc(46 + nameB.length)
    central.writeUInt32LE(0x02014b50, 0); central.writeUInt16LE(20, 4); central.writeUInt16LE(20, 6); central.writeUInt16LE(0x800, 8); central.writeUInt16LE(method, 10)
    central.writeUInt32LE(crc, 16); central.writeUInt32LE(data.length, 20); central.writeUInt32LE(raw.length, 24); central.writeUInt16LE(nameB.length, 28)
    central.writeUInt32LE(offset, 42); Buffer.from(nameB).copy(central, 46)
    locals.push(local, data); centrals.push(central)
    offset += local.length + data.length
  }
  const cd = Buffer.concat(centrals), end = Buffer.alloc(22)
  end.writeUInt32LE(0x06054b50, 0); end.writeUInt16LE(files.length, 8); end.writeUInt16LE(files.length, 10); end.writeUInt32LE(cd.length, 12); end.writeUInt32LE(offset, 16)
  return new Uint8Array(Buffer.concat([...locals, cd, end]))
}

const PARAGRAPHS = [
  ['It was a bright cold day in the old town, and the clocks were striking.', 'Mr. Gray walked to the river with his hat pulled low against the wind.', 'He had not seen his sister in eleven years, and he meant to change that tonight.'],
  ['The house on the hill stood dark; only one window held a lamp.', 'Margaret opened the door before he could knock, as if she had been waiting.', '“You came,” she said, and for a while neither of them said anything more.'],
]
function bookEpub(): Uint8Array {
  const doc = (title: string, paras: string[]) => `<?xml version="1.0" encoding="utf-8"?><html xmlns="http://www.w3.org/1999/xhtml"><head><title>${title}</title></head><body><h2>${title}</h2>${paras.map(p => `<p>${p.replace('Gray', '<i>Gray</i>').replace(/“|”/g, m => (m === '“' ? '&#8220;' : '&#8221;'))}</p>`).join('')}</body></html>`
  return zipFiles([
    ['mimetype', 'application/epub+zip'],
    ['META-INF/container.xml', '<?xml version="1.0"?><container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container"><rootfiles><rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/></rootfiles></container>'],
    ['OEBPS/content.opf', '<?xml version="1.0"?><package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="id"><metadata xmlns:dc="http://purl.org/dc/elements/1.1/"><dc:identifier id="id">x</dc:identifier><dc:title>The River House</dc:title><dc:creator>Ann Example</dc:creator><dc:language>en</dc:language></metadata><manifest><item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/><item id="c1" href="c1.xhtml" media-type="application/xhtml+xml"/><item id="c2" href="c2.xhtml" media-type="application/xhtml+xml"/></manifest><spine><itemref idref="c1"/><itemref idref="c2"/></spine></package>'],
    ['OEBPS/nav.xhtml', '<?xml version="1.0"?><html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops"><body><nav epub:type="toc"><ol><li><a href="c1.xhtml">Chapter One</a></li><li><a href="c2.xhtml">Chapter Two</a></li></ol></nav></body></html>'],
    ['OEBPS/c1.xhtml', doc('Chapter One', PARAGRAPHS[0])],
    ['OEBPS/c2.xhtml', doc('Chapter Two', PARAGRAPHS[1])],
  ])
}

const WORK: CatalogueWork = {
  id: 'pg:99999', title: 'The River House', language: ['en'], popularity: 10,
  authors: [{ name: 'Ann Example', birthYear: 1820, deathYear: 1890 }],
  subjects: ['Brothers and sisters -- Fiction', 'England -- Fiction'], bookshelves: ['Category: Novels', 'Category: British Literature'],
  firstPublishedYear: 1871,
  editions: [{ source: 'Gutenberg', sourceUrl: 'https://www.gutenberg.org/ebooks/99999', epubUrl: 'https://www.gutenberg.org/ebooks/99999.epub3.images', licence: 'PD' }],
}

/** An R2 stand-in with etags and conditional puts (onlyIf), like R2's. */
function fakeBucket() {
  const objects = new Map<string, { bytes: Uint8Array; etag: string; customMetadata: Record<string, string>; httpMetadata: R2HTTPMetadata }>()
  let version = 0
  const view = (key: string) => {
    const o = objects.get(key)!
    return { key, size: o.bytes.byteLength, etag: o.etag, uploaded: new Date(), customMetadata: o.customMetadata, httpMetadata: o.httpMetadata, body: new Response(o.bytes.slice()).body, arrayBuffer: async () => o.bytes.slice().buffer }
  }
  const bucket = {
    async put(key: string, value: string | Uint8Array, opts: R2PutOptions & { onlyIf?: { etagMatches?: string; etagDoesNotMatch?: string } } = {}) {
      const current = objects.get(key)
      const cond = opts.onlyIf as { etagMatches?: string; etagDoesNotMatch?: string } | undefined
      if (cond?.etagMatches !== undefined && current?.etag !== cond.etagMatches) return null
      if (cond?.etagDoesNotMatch === '*' && current) return null
      const bytes = typeof value === 'string' ? new TextEncoder().encode(value) : new Uint8Array(value)
      objects.set(key, { bytes, etag: `e${++version}`, customMetadata: { ...(opts.customMetadata as Record<string, string> ?? {}) }, httpMetadata: (opts.httpMetadata ?? {}) as R2HTTPMetadata })
      return view(key)
    },
    async get(key: string) { return objects.has(key) ? view(key) : null },
    async head(key: string) { return objects.has(key) ? view(key) : null },
    async delete(keys: string | string[]) { for (const key of ([] as string[]).concat(keys)) objects.delete(key) },
    async list(opts: R2ListOptions = {}) {
      const keys = [...objects.keys()].filter(key => key.startsWith(opts.prefix ?? '')).sort().slice(0, opts.limit ?? 1000)
      return { objects: keys.map(view), truncated: false, delimitedPrefixes: [] }
    },
  }
  return { bucket: bucket as unknown as R2Bucket, objects }
}

function catalogueAssets(works: CatalogueWork[]) {
  const gz = gzipSync(Buffer.from(JSON.stringify({ version: 1, builtAt: 'x', works })))
  const requests: string[] = []
  return {
    requests,
    assets: { fetch: async (request: Request) => { requests.push(new URL(request.url).pathname); return new Response(new Uint8Array(gz)) } },
  }
}

function setup(options: { works?: CatalogueWork[]; epub?: Uint8Array; source?: typeof fetch; daily?: number; chooser?: PublicBooksDeps['chooser'] } = {}) {
  resetCatalogueLookupCache()
  const r2 = fakeBucket()
  const { assets, requests } = catalogueAssets(options.works ?? [WORK])
  const env = { AUDIO_BUCKET: r2.bucket, ASSETS: assets }
  const counts = new Map<string, number>()
  const locks = new Set<string>()
  const downloads: string[] = []
  const epub = options.epub ?? bookEpub()
  const deps: PublicBooksDeps = {
    verifyUser: async request => {
      const auth = request.headers.get('authorization')
      return auth === 'Bearer a' ? { id: USER } : auth === 'Bearer b' ? { id: OTHER } : null
    },
    checkRateLimit: async () => true,
    countDaily: async (key, limit) => { const n = (counts.get(key) ?? 0) + 1; counts.set(key, n); return n <= (options.daily ?? limit) },
    acquireLock: async bookId => { if (locks.has(bookId)) return false; locks.add(bookId); return true },
    fetchSource: options.source ?? (async (url: string | URL | Request) => { downloads.push(String(url)); return new Response(epub, { headers: { 'content-length': String(epub.byteLength) } }) }) as typeof fetch,
    chooser: options.chooser ?? null,
  }
  const call = (path: string, init: RequestInit & { token?: string } = {}) => {
    const headers = new Headers(init.headers)
    if (init.token) headers.set('Authorization', `Bearer ${init.token}`)
    return handlePublicBooks(new Request(`https://tinct.app${path}`, { ...init, headers }), env, deps)
  }
  const prepare = (workId: string, token = 'a') => call('/api/public-books/import', { method: 'POST', token, body: JSON.stringify({ workId }) })
  /** The browser half: download the staged EPUB, convert it with the reader's converter, send the chapters. */
  const convertAndCommit = async (bookId: string, edit?: (chapters: Array<{ number: number; title: string; paragraphs: string[] }>) => void, token = 'a') => {
    const source = await call(`/api/public-books/import/${bookId}/source`, { token })
    expect(source.status).toBe(200)
    const edition = await epubToEdition(new Uint8Array(await source.arrayBuffer()))
    edit?.(edition.chapters)
    return call(`/api/public-books/import/${bookId}/commit`, { method: 'POST', token, body: JSON.stringify({ chapters: edition.chapters }) })
  }
  return { r2, env, deps, call, prepare, convertAndCommit, counts, locks, downloads, requests }
}

describe('/api/public-books import', () => {
  it('imports a catalogue work: download, the reader converter, verification, then a shared book', async () => {
    const t = setup()
    const first = await t.prepare('pg:99999')
    expect(first.status).toBe(200)
    expect(await first.json()).toEqual({ status: 'convert', bookId: 'pd-pg-99999', source: '/api/public-books/import/pd-pg-99999/source' })
    expect(t.downloads).toEqual(['https://www.gutenberg.org/ebooks/99999.epub3.images'])
    const committed = await t.convertAndCommit('pd-pg-99999')
    expect(committed.status).toBe(201)
    const body = await committed.json() as { status: string; book: { id: string; title: string; author: string; editions: Array<{ key: string }> }; entry: { shelfIds: string[]; houseIds: string[]; public: { workId: string; sourceName: string }; readingStructure: { chapters: unknown[] } } }
    expect(body.status).toBe('imported')
    // Title and author are the catalogue's, not whatever the browser or the file says.
    expect(body.book).toMatchObject({ id: 'pd-pg-99999', title: 'The River House', author: 'Ann Example', editions: [{ key: 'original-en' }] })
    expect(body.entry.shelfIds).toEqual(['english-novels'])
    expect(body.entry.houseIds).toEqual(['novel'])
    expect(body.entry.public).toMatchObject({ workId: 'pg:99999', sourceName: 'Project Gutenberg' })
    expect(body.entry.readingStructure.chapters).toHaveLength(2)
    // Readable like any edition, listed in the index, staging gone, nobody's id stored.
    const edition = await handlePublicEditionData(new Request('https://tinct.app/data/editions/pd-pg-99999-original-en.json?v=1'), t.env)
    expect(edition?.status).toBe(200)
    const data = await edition!.json() as { chapters: Array<{ title: string; paragraphs: string[] }> }
    expect(data.chapters.map(c => c.title)).toEqual(['Chapter One', 'Chapter Two'])
    expect(data.chapters[0].paragraphs[1]).toBe('Mr. _Gray_ walked to the river with his hat pulled low against the wind.')
    const index = await (await t.call('/api/public-books')).json() as { books: Array<{ id: string }> }
    expect(index.books.map(b => b.id)).toEqual(['pd-pg-99999'])
    expect([...t.r2.objects.keys()].some(key => key.includes('staging'))).toBe(false)
    for (const [, object] of t.r2.objects) expect(new TextDecoder().decode(object.bytes)).not.toContain(USER)
    const one = await (await t.call('/api/public-books/pd-pg-99999')).json() as { book: { id: string } }
    expect(one.book.id).toBe('pd-pg-99999')
  })

  it('is idempotent: the same work again is the existing book, with no download and no quota', async () => {
    const t = setup()
    await t.prepare('pg:99999')
    await t.convertAndCommit('pd-pg-99999')
    const before = t.counts.get(`public-book-day:${OTHER}`) ?? 0
    const again = await t.prepare('pg:99999', 'b')
    expect(again.status).toBe(200)
    expect(await again.json()).toMatchObject({ status: 'exists', bookId: 'pd-pg-99999', book: { id: 'pd-pg-99999' } })
    expect(t.downloads).toHaveLength(1)
    expect(t.counts.get(`public-book-day:${OTHER}`) ?? 0).toBe(before)
    // A late commit for the same work answers with the book too.
    const late = await t.call('/api/public-books/import/pd-pg-99999/commit', { method: 'POST', token: 'b', body: '{}' })
    expect(await late.json()).toMatchObject({ status: 'exists' })
  })

  it('lets one import of a work run at a time (lock) and reuses a staged download', async () => {
    const t = setup()
    await t.prepare('pg:99999')
    t.locks.add('pd-pg-other')
    // Staged already: the second caller converts the same file, no second download.
    expect(await (await t.prepare('pg:99999', 'b')).json()).toMatchObject({ status: 'convert' })
    expect(t.downloads).toHaveLength(1)
    const t2 = setup()
    t2.locks.add('pd-pg-99999')
    const locked = await t2.prepare('pg:99999')
    expect(locked.status).toBe(409)
    expect(await locked.json()).toEqual({ error: 'in_progress' })
    expect(t2.downloads).toHaveLength(0)
  })

  it('limits imports per account per day', async () => {
    const works = Array.from({ length: IMPORTS_PER_DAY + 1 }, (_, i) => ({ ...WORK, id: `pg:${1000 + i}` }))
    const t = setup({ works })
    for (let i = 0; i < IMPORTS_PER_DAY; i++) expect((await t.prepare(`pg:${1000 + i}`)).status).toBe(200)
    const over = await t.prepare(`pg:${1000 + IMPORTS_PER_DAY}`)
    expect(over.status).toBe(429)
    expect(await over.json()).toMatchObject({ error: 'daily_limit' })
    // Another account still can.
    expect((await t.prepare(`pg:${1000 + IMPORTS_PER_DAY}`, 'b')).status).toBe(200)
  })

  it('needs a signed-in account for every import step; reading added books needs none', async () => {
    const t = setup()
    expect((await t.call('/api/public-books/import', { method: 'POST', body: '{"workId":"pg:99999"}' })).status).toBe(401)
    expect((await t.call('/api/public-books/import/pd-pg-99999/source')).status).toBe(401)
    expect((await t.call('/api/public-books/import/pd-pg-99999/commit', { method: 'POST', body: '{}' })).status).toBe(401)
    expect((await t.call('/api/public-books')).status).toBe(200)
    expect((await t.call('/api/public-books/pd-pg-1')).status).toBe(404)
  })

  it('refuses works it cannot import: unknown, wrong language, no EPUB, a library off the allowlist', async () => {
    const works: CatalogueWork[] = [
      { ...WORK, id: 'pg:2', language: ['de'] },
      { ...WORK, id: 'pg:3', editions: [{ source: 'Gutenberg', epubUrl: null }] },
      { ...WORK, id: 'pg:4', editions: [{ source: 'Gutenberg', epubUrl: 'https://evil.example/book.epub' }] },
      { ...WORK, id: 'dbnl:x', editions: [{ source: 'DBNL', epubUrl: 'https://www.dbnl.org/x.epub' }] },
      { ...WORK, id: 'pg:5', editions: [{ source: 'Gutenberg', epubUrl: 'http://www.gutenberg.org/ebooks/5.epub' }] },
    ]
    const t = setup({ works })
    expect((await t.prepare('pg:1')).status).toBe(404)
    for (const id of ['pg:2', 'pg:3', 'pg:4', 'dbnl:x', 'pg:5']) expect((await t.prepare(id)).status, id).toBe(422)
    expect((await t.call('/api/public-books/import', { method: 'POST', token: 'a', body: '{"workId":"not a work"}' })).status).toBe(400)
    expect(t.downloads).toEqual([])
  })
})

describe('downloadEpub', () => {
  const epub = bookEpub()
  it('follows redirects only within the allowlist', async () => {
    const seen: string[] = []
    const fetchImpl = (async (url: string) => {
      seen.push(url)
      if (url.endsWith('.images')) return new Response(null, { status: 302, headers: { location: '/cache/epub/1/pg1-images-3.epub' } })
      return new Response(epub)
    }) as unknown as typeof fetch
    expect((await downloadEpub('Gutenberg', 'https://www.gutenberg.org/ebooks/1.epub3.images', fetchImpl)).byteLength).toBe(epub.byteLength)
    expect(seen).toEqual(['https://www.gutenberg.org/ebooks/1.epub3.images', 'https://www.gutenberg.org/cache/epub/1/pg1-images-3.epub'])
    const offList = (async () => new Response(null, { status: 302, headers: { location: 'https://evil.example/x.epub' } })) as unknown as typeof fetch
    await expect(downloadEpub('Gutenberg', 'https://www.gutenberg.org/ebooks/1.epub', offList)).rejects.toMatchObject({ code: 'source_not_allowed' })
    const loop = (async () => new Response(null, { status: 302, headers: { location: 'https://www.gutenberg.org/again' } })) as unknown as typeof fetch
    await expect(downloadEpub('Gutenberg', 'https://www.gutenberg.org/ebooks/1.epub', loop)).rejects.toMatchObject({ code: 'source_unavailable' })
  })

  it('retries a throttled or failing library once, and refuses an excluded library', async () => {
    let calls = 0
    const flaky = (async () => (++calls === 1 ? new Response('busy', { status: 429 }) : new Response(epub))) as unknown as typeof fetch
    expect((await downloadEpub('Gutenberg', 'https://www.gutenberg.org/a.epub', flaky)).byteLength).toBe(epub.byteLength)
    expect(calls).toBe(2)
    await expect(downloadEpub('TextGrid', 'https://textgridlab.org/1.0/aggregator/epub/textgrid:x.0', flaky)).rejects.toMatchObject({ code: 'source_not_allowed' })
  })

  it('refuses files over the size limit (declared or streamed), non-EPUBs and failed or hung sources', async () => {
    const declared = (async () => new Response('x', { headers: { 'content-length': String(MAX_EPUB_BYTES + 1) } })) as unknown as typeof fetch
    await expect(downloadEpub('Gutenberg', 'https://www.gutenberg.org/a.epub', declared)).rejects.toMatchObject({ code: 'source_too_large', status: 413 })
    const streamed = (async () => new Response(new ReadableStream({ pull(c) { c.enqueue(new Uint8Array(4 * 1024 * 1024)) } }))) as unknown as typeof fetch
    await expect(downloadEpub('Gutenberg', 'https://www.gutenberg.org/a.epub', streamed)).rejects.toMatchObject({ code: 'source_too_large' })
    const html = (async () => new Response('<html>Not found</html>')) as unknown as typeof fetch
    await expect(downloadEpub('Gutenberg', 'https://www.gutenberg.org/a.epub', html)).rejects.toMatchObject({ code: 'not_epub' })
    const down = (async () => new Response('', { status: 503 })) as unknown as typeof fetch
    await expect(downloadEpub('Gutenberg', 'https://www.gutenberg.org/a.epub', down)).rejects.toMatchObject({ code: 'source_unavailable' })
    let signal: AbortSignal | undefined
    const hung = (async (_url: string, init: RequestInit) => { signal = init.signal ?? undefined; throw new DOMException('timed out', 'TimeoutError') }) as unknown as typeof fetch
    await expect(downloadEpub('Gutenberg', 'https://www.gutenberg.org/a.epub', hung)).rejects.toMatchObject({ code: 'source_unavailable' })
    expect(signal).toBeInstanceOf(AbortSignal)
    expect(DOWNLOAD_TIMEOUT_MS).toBeLessThanOrEqual(60_000)
  })
})

describe('verification against the downloaded EPUB', () => {
  it('publishes only text the EPUB contains: an inserted paragraph is dropped, a rewritten book is refused', async () => {
    const t = setup()
    await t.prepare('pg:99999')
    const spam = await t.convertAndCommit('pd-pg-99999', chapters => { chapters[0].paragraphs.splice(1, 0, 'Buy cheap watches at example dot com today, best prices.'); chapters[1].title = 'Visit our shop' })
    expect(spam.status).toBe(201)
    const data = await (await handlePublicEditionData(new Request('https://tinct.app/data/editions/pd-pg-99999-original-en.json'), t.env))!.json() as { chapters: Array<{ title: string; paragraphs: string[] }> }
    expect(JSON.stringify(data)).not.toMatch(/watches|shop/)
    expect(data.chapters[1].title).toBe('Section 2')

    const t2 = setup()
    await t2.prepare('pg:99999')
    const rewritten = await t2.convertAndCommit('pd-pg-99999', chapters => { for (const c of chapters) c.paragraphs = c.paragraphs.map(() => 'Entirely different words that are not in the book at all.') })
    expect(rewritten.status).toBe(422)
    expect(await rewritten.json()).toEqual({ error: 'edition_mismatch' })
    expect(await t2.r2.bucket.head('public-books/pd-pg-99999/meta.json')).toBeNull()
  })

  it('compares letters only, so emphasis marks, entities and note numbers do not matter', async () => {
    expect(letters('Mr. _Gray_ walked—to the “river”, 1 2 3.')).toBe('mrgraywalkedtotheriver')
    expect(documentLetters('<head><title>t</title></head><p>Caf&eacute; &#8220;No&#x00EB;l&#8221;<sup>1</sup></p><script>evil()</script>')).toBe('cafenoel')
    const source = await epubSourceLetters(bookEpub())
    const ok = verifyEditionAgainstSource([{ number: 1, title: 'Chapter One', paragraphs: PARAGRAPHS[0] }], source)
    expect(ok).toMatchObject({ removedParagraphs: 0, renamedChapters: 0 })
  })

  it('rejects malformed or oversized chapter uploads', () => {
    expect(parseChapters({ chapters: [] })).toBeNull()
    expect(parseChapters({ chapters: [{ title: 'x', paragraphs: [1] }] })).toBeNull()
    expect(parseChapters({ chapters: [{ title: 'x', paragraphs: ['a'.repeat(60_001)] }] })).toBeNull()
    expect(parseChapters({ chapters: [{ title: '<b>x</b>', paragraphs: ['<img src=x>y'] }] })).toEqual([{ number: 1, title: 'bx/b', paragraphs: ['img src=xy'] }])
  })
})

describe('catalogue lookup', () => {
  it('finds one work in the gzip stream without matching a longer id', async () => {
    const works = [{ ...WORK, id: 'pg:10', title: 'Ten {with braces} "and quotes"' }, { ...WORK, id: 'pg:1', title: 'One' }]
    const gz = gzipSync(Buffer.from(JSON.stringify({ version: 1, works })))
    const stream = () => new Response(new Uint8Array(gz)).body!
    expect((await findWorkInStream(stream(), 'pg:1'))?.title).toBe('One')
    expect((await findWorkInStream(stream(), 'pg:10'))?.title).toBe('Ten {with braces} "and quotes"')
    expect(await findWorkInStream(stream(), 'pg:2')).toBeNull()
    expect(objectEnd('{"a":"}"}', 0)).toBe(9)
  })
})

describe('classification rules', () => {
  const work = (patch: Partial<CatalogueWork>): CatalogueWork => ({ ...WORK, subjects: [], bookshelves: [], ...patch })
  it('places works on existing shelves from subjects, bookshelves, language and era', () => {
    expect(classifyByRules(work({ subjects: ['Detective and mystery stories'] }))).toMatchObject({ form: 'novel', shelfIds: ['detective-fiction'], houseIds: ['novel'], confidence: 'rule' })
    expect(classifyByRules(work({ subjects: ['Horror tales'] })).shelfIds).toEqual(['gothic-novels'])
    expect(classifyByRules(work({ subjects: ['Sea stories'] })).shelfIds).toEqual(['adventure'])
    expect(classifyByRules(work({ subjects: ['American fiction -- 19th century'] })).shelfIds).toEqual(['american-novels'])
    expect(classifyByRules(work({ subjects: ['Fiction'], firstPublishedYear: 1922 })).shelfIds).toEqual(['modernist-novels'])
    expect(classifyByRules(work({ subjects: ['Russia -- Fiction'] })).shelfIds).toEqual(['russian-novels'])
    expect(classifyByRules(work({ subjects: ['Greek drama (Tragedy)'], firstPublishedYear: -430 }))).toMatchObject({ form: 'drama', shelfIds: ['greek-tragedy'], era: 'antiquity' })
    expect(classifyByRules(work({ subjects: ['Comedies'], authors: [{ name: 'William Shakespeare' }], firstPublishedYear: 1600 })).shelfIds).toEqual(['shakespeare-comedy'])
    expect(classifyByRules(work({ subjects: ['Epic poetry, Greek'], firstPublishedYear: -700 })).shelfIds).toEqual(['ancient-epics'])
    expect(classifyByRules(work({ subjects: ['Philosophy, Ancient'], authors: [{ name: 'Plato' }], firstPublishedYear: -380 })).shelfIds).toEqual(['plato'])
    expect(classifyByRules(work({ subjects: ['Ethics'], firstPublishedYear: 1785 })).shelfIds).toEqual(['modern-philosophy'])
    expect(classifyByRules(work({ subjects: ['Political science'], bookshelves: ['Category: Politics'] })).houseIds).toEqual(['politics'])
    expect(classifyByRules(work({ subjects: ['United States. Constitution'] })).shelfIds).toEqual(['founding-docs'])
    expect(classifyByRules(work({ subjects: ['Bible -- Commentaries'] })).shelfIds).toEqual(['bible-and-devotion'])
    expect(classifyByRules(work({ subjects: ['Military art and science'] })).shelfIds).toEqual(['strategy'])
    expect(classifyByRules(work({ subjects: ['Greece -- History'], firstPublishedYear: -400 })).shelfIds).toEqual(['ancient-history'])
  })

  it('marks a work with no signal as low confidence, and only then asks the chooser (mocked: no AI in tests)', async () => {
    const bare = work({ firstPublishedYear: null, authors: [{ name: 'X' }] })
    expect(classifyByRules(bare)).toMatchObject({ confidence: 'low', shelfIds: ['english-novels'] })
    const asked: string[] = []
    const chooser = async (input: { title: string }) => { asked.push(input.title); return 'stoics' }
    expect(await classifyWork(bare, chooser)).toMatchObject({ confidence: 'ai', shelfIds: ['stoics'], houseIds: ['philosophy'], form: 'philosophy' })
    expect(await classifyWork(work({ subjects: ['Detective and mystery stories'] }), chooser)).toMatchObject({ confidence: 'rule' })
    expect(asked).toHaveLength(1)
    expect(await classifyWork(bare, async () => 'not-a-shelf')).toMatchObject({ confidence: 'low' })
    expect(await classifyWork(bare, async () => { throw new Error('down') })).toMatchObject({ confidence: 'low' })
  })

  it('uses the library taxonomy exactly (houses, shelves, eras)', () => {
    for (const [id, shelf] of Object.entries(SHELVES)) {
      expect(LIBRARY_SHELVES[id], id).toEqual({ title: shelf.title, sub: shelf.sub, hue: shelf.hue })
      expect(LIBRARY_HOUSES.find(house => house.id === shelf.house)?.shelves, id).toContain(id)
    }
    for (const [id, house] of Object.entries(HOUSES)) expect(LIBRARY_HOUSES.find(h => h.id === id)).toMatchObject({ title: house.title, sub: house.sub, hue: house.hue })
    expect([eraOf(-1), eraOf(800), eraOf(1600), eraOf(1850), eraOf(1920), eraOf(null)]).toEqual(['antiquity', 'medieval', 'early-modern', 'modern', 'contemporary', null])
  })
})

describe('index and covers', () => {
  it('never loses an entry when two imports update the index at once', async () => {
    const { bucket } = fakeBucket()
    const entry = (id: string) => ({ id } as unknown as Parameters<typeof upsertIndexEntry>[1])
    await Promise.all([upsertIndexEntry(bucket, entry('pd-pg-1')), upsertIndexEntry(bucket, entry('pd-pg-2')), upsertIndexEntry(bucket, entry('pd-pg-3'))])
    const index = JSON.parse(new TextDecoder().decode(new Uint8Array(await (await bucket.get(INDEX_KEY))!.arrayBuffer()))) as { books: Array<{ id: string }> }
    expect(index.books.map(b => b.id).sort()).toEqual(['pd-pg-1', 'pd-pg-2', 'pd-pg-3'])
  })

  it('queues painted covers only behind the switch, and stores the image bytes, not a provider URL (mocked xAI)', async () => {
    const t = setup()
    await t.prepare('pg:99999')
    await t.convertAndCommit('pd-pg-99999')
    expect([...t.r2.objects.keys()].some(key => key.includes('cover-jobs'))).toBe(false)
    expect(await runPublicCoverJobs(t.env, { limit: 5 })).toBeNull()

    const t2 = setup()
    const env = { ...t2.env, PUBLIC_BOOK_PAINTED_COVERS: '1', XAI_API_KEY: 'test-key' }
    const calls: Array<{ url: string; body: { prompt: string; response_format: string } }> = []
    const jpeg = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 1, 2, 3])
    const coverFetch = async (url: string, init: RequestInit) => { calls.push({ url, body: JSON.parse(String(init.body)) }); return Response.json({ data: [{ b64_json: Buffer.from(jpeg).toString('base64') }] }) }
    const deps = { ...t2.deps, coverFetch, waitUntil: () => {} }
    await handlePublicBooks(new Request('https://tinct.app/api/public-books/import', { method: 'POST', headers: { Authorization: 'Bearer a' }, body: '{"workId":"pg:99999"}' }), env, deps)
    const source = await handlePublicBooks(new Request('https://tinct.app/api/public-books/import/pd-pg-99999/source', { headers: { Authorization: 'Bearer a' } }), env, deps)
    const edition = await epubToEdition(new Uint8Array(await source.arrayBuffer()))
    await handlePublicBooks(new Request('https://tinct.app/api/public-books/import/pd-pg-99999/commit', { method: 'POST', headers: { Authorization: 'Bearer a' }, body: JSON.stringify({ chapters: edition.chapters }) }), env, deps)
    expect(t2.r2.objects.has('public-books/cover-jobs/pd-pg-99999.json')).toBe(true)
    expect(await runPublicCoverJobs(env, { limit: 5, fetchImpl: coverFetch })).toEqual({ painted: 1, failed: 0 })
    expect(calls[0].url).toBe('https://api.x.ai/v1/images/generations')
    expect(calls[0].body.response_format).toBe('b64_json')
    expect(calls[0].body.prompt).toContain("exact title 'THE RIVER HOUSE'")
    expect([...t2.r2.objects.get('public-books/pd-pg-99999/cover')!.bytes]).toEqual([...jpeg])
    const meta = await (await handlePublicBooks(new Request('https://tinct.app/api/public-books/pd-pg-99999'), env, deps)).json() as { entry: { art: { src: string } } }
    expect(meta.entry.art.src).toBe('/api/public-books/pd-pg-99999/cover')
    expect(coverPrompt({ title: 'Iliad', author: 'Homer', year: -750 })).toContain('750 BC')
  })
})
