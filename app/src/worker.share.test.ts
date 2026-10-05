import { afterEach, describe, expect, it, vi } from 'vitest'
import { resetBookRetrievalCache } from './worker/lib/bookRetrieval'
import { editionCredit, handleShareApi, handleSharePage, parseShareInput, type ShareEnv } from './worker/routes/share'
import type { ShareRecord, ShareRecordInput } from './worker/shareRecord'
import { getBook } from './data/bookRegistry'

const render = vi.hoisted(() => vi.fn(async () => ({ png: new Uint8Array([137, 80, 78, 71]), page: {} })))
vi.mock('./worker/lib/shareRender', () => ({ renderSharePng: render }))

const PARAGRAPHS = [
  'It was on a dreary night of November that I beheld the accomplishment of my toils.',
  'The different accidents of life are not so changeable as the feelings of human nature. I had worked hard for nearly two years.',
]

function fakeAssets() {
  return {
    fetch: async (request: Request) => {
      const path = new URL(request.url).pathname
      if (path === '/data/editions-chapters/frankenstein-original-en/manifest.json') return Response.json({ chapters: [{ number: 9, title: 'Chapter 5', path: 'ch0009.json' }] })
      if (path === '/data/editions-chapters/frankenstein-original-en/ch0009.json') return Response.json({ number: 9, title: 'Chapter 5', paragraphs: PARAGRAPHS })
      return new Response('not found', { status: 404 })
    },
  }
}

function fakeStore() {
  const rows = new Map<string, ShareRecord & { creatorId: string | null }>()
  return {
    rows,
    create: async (input: ShareRecordInput, creatorId: string | null) => {
      const record = { ...input, id: `abcde${'xyz'[rows.size]}q`, createdAt: 1, creatorId }
      rows.set(record.id, record)
      return record
    },
    get: async (id: string) => {
      const row = rows.get(id)
      if (!row) return null
      const { creatorId: _hidden, ...record } = row
      return record
    },
  }
}

function setup(options: { allow?: boolean; user?: { id: string; email: string } | null } = {}) {
  const store = fakeStore()
  const env = { ASSETS: fakeAssets(), SHARE_STORE: { getByName: () => store } } as unknown as ShareEnv
  const rateKeys: string[] = []
  const deps = {
    verifyUser: async () => options.user ?? null,
    checkRateLimit: async (key: string) => { rateKeys.push(key); return options.allow ?? true },
  }
  const ctx = { waitUntil: () => {} } as unknown as ExecutionContext
  return { store, env, deps, ctx, rateKeys }
}

const valid = {
  bookId: 'frankenstein', editionKey: 'original-en', chapterNumber: 9,
  paragraphIndex: 1, fromWord: 0, endParagraphIndex: 1, toWord: 16,
  look: 'paper', format: 'phone', context: true, tagline: true,
}

function post(body: unknown, headers: Record<string, string> = {}) {
  return new Request('https://tinct.app/api/share', { method: 'POST', body: JSON.stringify(body), headers: { 'content-type': 'application/json', 'cf-connecting-ip': '203.0.113.9', ...headers } })
}

afterEach(() => {
  resetBookRetrievalCache()
  render.mockClear()
})

describe('share links', () => {
  it('creates a link for text that exists in the edition', async () => {
    const { env, deps, ctx, store, rateKeys } = setup({ user: { id: 'user-1', email: 'reader@example.com' } })
    const response = await handleShareApi(post(valid, { authorization: 'Bearer t' }), env, ctx, deps)
    expect(response.status).toBe(201)
    const data = await response.json() as { id: string; url: string; image: string }
    expect(data.url).toBe(`https://tinct.app/q/${data.id}`)
    expect(data.image).toBe(`https://tinct.app/q/${data.id}/image.png`)
    expect(JSON.stringify(data)).not.toContain('user-1')
    // The creator is kept privately, for analytics only.
    expect(store.rows.get(data.id)?.creatorId).toBe('user-1')
    expect(rateKeys).toEqual(['share-create:user:user-1'])
  })

  it('rate-limits signed-out link creation per caller', async () => {
    const { env, deps, ctx, rateKeys } = setup({ allow: false })
    const response = await handleShareApi(post(valid), env, ctx, deps)
    expect(response.status).toBe(429)
    expect(rateKeys).toEqual(['share-create:ip:203.0.113.9'])
  })

  it('refuses ranges, books and editions we do not have', async () => {
    const { env, deps, ctx, store } = setup()
    for (const body of [
      { ...valid, toWord: 999 },
      { ...valid, paragraphIndex: 5, endParagraphIndex: 5 },
      { ...valid, fromWord: 4, toWord: 4 },
      { ...valid, bookId: 'not-a-book' },
      { ...valid, editionKey: 'modern-en' },
      { ...valid, chapterNumber: 2 },
      { ...valid, look: 'neon' },
      { ...valid, format: 'tablet' },
    ]) {
      const response = await handleShareApi(post(body), env, ctx, deps)
      expect(response.status).toBe(400)
    }
    expect(store.rows.size).toBe(0)
    expect((await handleShareApi(new Request('https://tinct.app/api/share', { method: 'POST', body: 'nope' }), env, ctx, deps)).status).toBe(400)
  })

  it('serves the public record without the creator', async () => {
    const { env, deps, ctx } = setup({ user: { id: 'user-2', email: 'x@example.com' } })
    const { id } = await (await handleShareApi(post(valid, { authorization: 'Bearer t' }), env, ctx, deps)).json() as { id: string }
    const record = await (await handleShareApi(new Request(`https://tinct.app/api/share/${id}`), env, ctx, deps)).json()
    expect(record).toEqual({ id, bookId: 'frankenstein', editionKey: 'original-en', chapterNumber: 9, paragraphIndex: 1, fromWord: 0, endParagraphIndex: 1, toWord: 16 })
    expect((await handleShareApi(new Request('https://tinct.app/api/share/zzzzzzz'), env, ctx, deps)).status).toBe(404)
  })

  it('renders the preview without storing anything', async () => {
    const { env, deps, ctx, store } = setup()
    const params = new URLSearchParams(Object.entries(valid).map(([k, v]) => [k, typeof v === 'boolean' ? (v ? '1' : '0') : String(v)]))
    const response = await handleShareApi(new Request(`https://tinct.app/api/share/preview?${params}`), env, ctx, deps)
    expect(response.status).toBe(200)
    expect(response.headers.get('content-type')).toBe('image/png')
    expect(store.rows.size).toBe(0)
    expect(render).toHaveBeenCalledTimes(1)
    const [, , content, options] = render.mock.calls[0] as unknown as [unknown, unknown, { bookTitle: string; chapterLabel: string; credit: string }, { format: string; look: string; context: boolean; tagline: boolean }]
    expect(content).toMatchObject({ bookTitle: 'Frankenstein', chapterLabel: 'Chapter 5', credit: 'Original (1831)' })
    expect(options).toEqual({ format: 'phone', look: 'paper', context: true, tagline: true })
  })
})

describe('/q/{id}', () => {
  it('unfurls with the quote image and opens the passage, with no identity', async () => {
    const { env, deps, ctx } = setup({ user: { id: 'user-3', email: 'secret@example.com' } })
    const { id } = await (await handleShareApi(post(valid, { authorization: 'Bearer t' }), env, ctx, deps)).json() as { id: string }
    const response = await handleSharePage(new Request(`https://tinct.app/q/${id}`), env, ctx)
    expect(response?.status).toBe(200)
    const html = await response!.text()
    expect(html).toContain(`<meta property="og:image" content="https://tinct.app/q/${id}/og.png">`)
    expect(html).toContain('<meta name="twitter:card" content="summary_large_image">')
    expect(html).toContain('<meta property="og:title" content="“The different accidents of life are not so changeable as the feelings of human nature. I…”">')
    expect(html).toContain('<meta property="og:description" content="Frankenstein, Mary Shelley · Chapter 5">')
    expect(html).toContain(`data-reader="/reader?book=frankenstein&amp;edition=original-en&amp;chapter=9&amp;paragraph=1&amp;word=0&amp;share=${id}"`)
    expect(html).not.toContain('user-3')
    expect(html).not.toContain('secret@example.com')
  })

  it('serves the link preview and the shared image', async () => {
    const { env, deps, ctx } = setup()
    const { id } = await (await handleShareApi(post({ ...valid, format: 'desktop' }), env, ctx, deps)).json() as { id: string }
    const og = await handleSharePage(new Request(`https://tinct.app/q/${id}/og.png`), env, ctx)
    expect(og?.headers.get('content-type')).toBe('image/png')
    expect((render.mock.calls[0] as unknown as unknown[])[3]).toMatchObject({ format: 'og' })
    const image = await handleSharePage(new Request(`https://tinct.app/q/${id}/image.png`), env, ctx)
    expect(image?.status).toBe(200)
    expect((render.mock.calls[1] as unknown as unknown[])[3]).toMatchObject({ format: 'desktop' })
  })

  it('answers 404 for unknown links and ignores other paths', async () => {
    const { env, ctx } = setup()
    expect((await handleSharePage(new Request('https://tinct.app/q/abcdefg'), env, ctx))?.status).toBe(404)
    expect((await handleSharePage(new Request('https://tinct.app/q/../etc'), env, ctx))).toBeNull()
    expect(await handleSharePage(new Request('https://tinct.app/read/odyssey'), env, ctx)).toBeNull()
  })
})

describe('share input and credit', () => {
  it('parses query-string and JSON shapes alike', () => {
    expect(parseShareInput({ ...valid, chapterNumber: '9', context: '0', tagline: '1' })).toMatchObject({ chapterNumber: 9, context: false, tagline: true })
    expect(parseShareInput({ ...valid, bookId: '../x' })).toBeNull()
  })

  it('credits translators, Tinct modern editions and originals', () => {
    const meditations = getBook('meditations')!
    expect(editionCredit(meditations.editions.find(e => e.key === 'original-en')!)).toBe('tr. George Long')
    expect(editionCredit(meditations.editions.find(e => e.key === 'modern-en')!)).toBe('Tinct Modern English')
    expect(editionCredit(getBook('frankenstein')!.editions.find(e => e.key === 'original-en')!)).toBe('Original (1831)')
  })
})
