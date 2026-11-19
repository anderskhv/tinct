import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { gzipSync } from 'node:zlib'
// @ts-expect-error -- plain build script
import { splitCatalogue } from '../scripts/build-catalogue-shards.mjs'

// The library search's catalogue in two parts (search audit, 2026-10-08): the worker
// (public/lab/addbook/js/search-worker.js) reads the English works first and the other
// languages only when a search asks for them, or to explain an empty English search.
type Raw = { id: string; title: string; language?: string[]; popularity?: number; authors?: Array<{ name: string; birthYear?: number; deathYear?: number }>; translators?: Array<{ name: string }>; editions: Array<Record<string, unknown>> }
const fixture = JSON.parse(readFileSync(join(__dirname, '__fixtures__/catalogue-search-works.json'), 'utf8')) as { works: Raw[] }
const gutenberg = (id: string, title: string, language: string, author: { name: string; birthYear?: number; deathYear?: number }, extra: Partial<Raw> = {}): Raw =>
  ({ id, title, language: [language], popularity: 500, authors: [author], editions: [{ source: 'Gutenberg', sourceUrl: null, epubUrl: `https://www.gutenberg.org/ebooks/${id.slice(3)}.epub3.images`, licence: 'PD' }], ...extra })
const kafka = { name: 'Franz Kafka', birthYear: 1883, deathYear: 1924 }
const catalog = { version: 1, builtAt: '2026-10-08', works: [
  ...fixture.works,
  gutenberg('pg:21593', 'Das Urteil', 'de', kafka), gutenberg('pg:22367', 'Die Verwandlung', 'de', kafka),
  // German Wikisource's record says English; it is not (search.js languagesOf).
  { ...gutenberg('ws:de:Q1165434', 'Die Abstammung des Menschen', 'en', { name: 'Charles Darwin', birthYear: 1809, deathYear: 1882 }), editions: [{ source: 'Wikisource', sourceUrl: null, epubUrl: 'https://ws-export.wmcloud.org/?format=epub&lang=de&page=X', licence: 'CC BY-SA 4.0' }] },
  gutenberg('ws:no:Q1', 'Candide', 'no', { name: 'Voltaire', birthYear: 1694, deathYear: 1778 }, { translators: [{ name: 'Charles Kent' }] }),
  gutenberg('pg:64576', 'Minor Dialogues, Together With the Dialogue on Clemency', 'en', { name: 'Lucius Annaeus Seneca', deathYear: 65 }),
  gutenberg('pg:19942', 'Candide', 'en', { name: 'Voltaire', birthYear: 1694, deathYear: 1778 }),
] }

describe('splitCatalogue', () => {
  it('puts every work in one part, English first, in catalogue order', () => {
    const { english, more } = splitCatalogue(catalog)
    expect(english.works.length + more.works.length).toBe(catalog.works.length)
    expect(english.works.every((w: Raw) => w.language?.includes('en') && !w.id.startsWith('ws:de:'))).toBe(true)
    expect(more.works.map((w: Raw) => w.id)).toContain('ws:de:Q1165434')
    expect(english).toMatchObject({ version: 1, builtAt: '2026-10-08' })
    expect(english.works.map((w: Raw) => w.id)).toEqual(catalog.works.filter(w => english.works.includes(w)).map(w => w.id))
  })
})

describe('search worker with the catalogue in two parts', () => {
  const posted: Array<Record<string, unknown>> = []
  const fetched: string[] = []
  let shards: boolean | 'page' = true
  const { english, more } = splitCatalogue(catalog)
  const bytes = (data: unknown) => new Response(gzipSync(Buffer.from(JSON.stringify(data))))
  let handler: (event: { data: unknown }) => Promise<void>
  const ask = async (data: Record<string, unknown>) => { posted.length = 0; await handler({ data }); return posted[posted.length - 1] }
  beforeAll(async () => {
    vi.stubGlobal('self', { postMessage: (message: Record<string, unknown>) => posted.push(message) })
    vi.stubGlobal('fetch', async (url: URL | string) => {
      const name = String(url).split('/').pop()!.split('?')[0]
      fetched.push(name)
      if (shards === 'page' && name !== 'catalog.json.gz') return new Response('<!doctype html><title>Tinct</title>', { headers: { 'content-type': 'text/html' } })
      if (name === 'catalog-en.json.gz') return shards ? bytes(english) : new Response('missing', { status: 404 })
      if (name === 'catalog-more.json.gz') return shards ? bytes(more) : new Response('missing', { status: 404 })
      if (name === 'catalog.json.gz') return bytes(catalog)
      // The Latin De Brevitate Vitae's Wikidata work, whose edition is in the other part.
      if (name === 'work-priors.json') return Response.json({ works: { 'ws:la:Q1': ['Q1180596', 40] } })
      return new Response('missing', { status: 404 })
    })
    await import('../public/lab/addbook/js/search-worker.js')
    handler = (globalThis as unknown as { self: { onmessage: typeof handler } }).self.onmessage
  })
  afterAll(() => { vi.unstubAllGlobals() })

  it('reads only the English part first, and an English search needs nothing more', async () => {
    const ready = await ask({ type: 'load' })
    expect(ready).toMatchObject({ type: 'ready', total: english.works.length })
    expect(fetched.filter(name => name.endsWith('.gz'))).toEqual(['catalog-en.json.gz'])
    const out = await ask({ type: 'search', query: 'faust', filters: { language: 'en' }, limit: 40, request: 1 }) as { results: Raw[] }
    expect(out.results.length).toBeGreaterThan(0)
    expect(out.results.every(w => w.language?.includes('en'))).toBe(true)
    expect(fetched).not.toContain('catalog-more.json.gz')
  })

  it('a collection\'s works keep their fame from the priors, though their own editions are in the other part', async () => {
    const out = await ask({ type: 'search', query: 'minor dialogues', filters: { language: 'en' }, limit: 40, request: 6 }) as { results: Array<{ id: string; contains: Array<{ title: string; fame: number }> }> }
    const dialogues = out.results.find(w => w.id === 'pg:64576')!
    expect(dialogues.contains.find(c => c.title === 'On the Shortness of Life')!.fame).toBeGreaterThan(3)
    expect(fetched).not.toContain('catalog-more.json.gz')
  })

  it('borrows from the English works only: a Norwegian Candide\'s translator is not Tinct\'s', async () => {
    const out = await ask({ type: 'borrow', books: [{ id: 'candide', title: 'Candide', author: 'Voltaire' }], request: 2 }) as { borrowed: Record<string, { translators: string[] }> }
    expect(out.borrowed.candide.translators).not.toContain('Charles Kent')
  })

  it('an empty English search for an author found only in other languages says where (Kafka)', async () => {
    const out = await ask({ type: 'search', query: 'kafka', filters: { language: 'en' }, limit: 40, request: 3 }) as { total: number; elsewhere: { name: string; languages: string[] } }
    expect(out.total).toBe(0)
    expect(out.elsewhere).toEqual({ name: 'Franz Kafka', languages: ['de'] })
    expect(fetched).toContain('catalog-more.json.gz')
  })

  it('another language searches the other part, once loaded', async () => {
    const out = await ask({ type: 'search', query: 'faust', filters: { language: 'de' }, limit: 40, request: 4 }) as { results: Raw[] }
    expect(out.results.map(w => w.id)).toContain('pg:2229') // Goethe's German Faust
    expect(fetched.filter(name => name === 'catalog-more.json.gz')).toHaveLength(1)
  })

  it('names the author a query means, and flags their works', async () => {
    const out = await ask({ type: 'search', query: 'kafka', filters: {}, limit: 40, request: 5 }) as { author: { name: string; birthYear: number }; results: Array<Raw & { byAuthor?: boolean }> }
    expect(out.author).toMatchObject({ name: 'Franz Kafka', birthYear: 1883, deathYear: 1924 })
    expect(out.results.every(w => w.byAuthor)).toBe(true)
  })

  it('reads the whole catalogue where the parts were not built (npm run dev)', async () => {
    shards = false; fetched.length = 0
    const ready = await ask({ type: 'load' })
    expect(ready).toMatchObject({ type: 'ready', total: catalog.works.length })
    expect(fetched.filter(name => name.endsWith('.gz'))).toEqual(['catalog-en.json.gz', 'catalog.json.gz'])
  })
  it('reads the whole catalogue where a host answers the missing parts with a page (the dev server)', async () => {
    shards = 'page'; fetched.length = 0
    const ready = await ask({ type: 'load' })
    expect(ready).toMatchObject({ type: 'ready', total: catalog.works.length })
    expect(fetched.filter(name => name.endsWith('.gz'))).toEqual(['catalog-en.json.gz', 'catalog.json.gz'])
  })
})
