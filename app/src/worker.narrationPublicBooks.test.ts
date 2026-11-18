import { describe, expect, it } from 'vitest'
import { handleNarration, type NarrationDeps, type NarrationEnv } from './worker/routes/narration'
import { handlePublicEditionData } from './worker/routes/publicBooks'
import { narrationMapKey, narrationTextForParagraph, narrationTokens, sha256Hex, spokenText } from './narration/narrationCore'
import { syntheticMp3 } from './narration/narrationTestFixtures'

/**
 * Narration of books added through "Add to Tinct" (`pd-*`): their text lives
 * in the public-books R2 store, not in static assets. The narrated paragraphs
 * must be the reader's paragraphs, index for index, as `/data/editions/pd-…`
 * serves them. No real provider: the xAI call is a stub.
 */

const encoder = new TextEncoder()
const decoder = new TextDecoder()

class FakeR2 {
  store = new Map<string, Uint8Array>()
  reads: string[] = []
  async get(key: string) {
    this.reads.push(key)
    const value = this.store.get(key)
    if (!value) return null
    return {
      key, size: value.length, etag: `e${value.length}`, body: value,
      json: async () => JSON.parse(decoder.decode(value)),
      arrayBuffer: async () => value.buffer.slice(value.byteOffset, value.byteOffset + value.byteLength),
    }
  }
  async head(key: string) { const value = this.store.get(key); return value ? { key, size: value.length } : null }
  async put(key: string, value: Uint8Array | string) { this.store.set(key, typeof value === 'string' ? encoder.encode(value) : value) }
  async list(options: { prefix: string }) { return { objects: [...this.store.keys()].filter(key => key.startsWith(options.prefix)).map(key => ({ key })) } }
  async delete(key: string) { this.store.delete(key) }
  putJson(key: string, value: unknown) { this.store.set(key, encoder.encode(JSON.stringify(value))) }
}

class FakeKV {
  store = new Map<string, string>()
  async get(key: string, type?: string) { const value = this.store.get(key); return value == null ? null : type === 'json' ? JSON.parse(value) : value }
  async put(key: string, value: string) { this.store.set(key, value) }
  async delete(key: string) { this.store.delete(key) }
}

const BOOK = 'pd-pg-135'
// Reader-visible quirks on purpose: Gutenberg _emphasis_, hard line breaks, runs of spaces.
const CHAPTER_1 = [
  'In 1815, M. Charles-François-Bienvenu Myriel was Bishop of D——\nHe was an old man of about seventy-five years of age.',
  'Although this detail has no connection whatever with the real substance of what we are about to relate, it will not be superfluous.',
  'He was the son of a councillor of the _Parliament_ of Aix;   hence he belonged to the nobility of the bar.',
]
const CHAPTER_2 = ['A second chapter, first paragraph.', 'A second chapter, second paragraph.']
const MODERN_1 = [
  'In 1815, Charles-François-Bienvenu Myriel was Bishop of Digne. He was about seventy-five.',
  'This detail has nothing to do with our story, but it is worth telling.',
  'He was the son of a judge in the Parliament of Aix, so he came from a family of lawyers.',
]

interface Setup {
  env: NarrationEnv & { AUDIO_BUCKET: FakeR2; PUBLIC_BOOKS: FakeR2 }
  deps: NarrationDeps
  calls: string[]
  reservations: number[]
  assetFetches: string[]
  ctx: ExecutionContext & { waited: Promise<unknown>[] }
  user: { current: { id: string; email: string } | null }
}

function setup(options: { reserve?: boolean } = {}): Setup {
  const audio = new FakeR2()
  const books = new FakeR2()
  books.putJson(`public-books/${BOOK}/original-en.json`, { chapters: [
    { number: 1, title: 'M. Myriel', paragraphs: CHAPTER_1 },
    { number: 2, title: 'M. Myriel Becomes M. Welcome', paragraphs: CHAPTER_2 },
  ] })
  const calls: string[] = []
  const reservations: number[] = []
  const assetFetches: string[] = []
  const held = new Map<string, string>()
  const user: Setup['user'] = { current: { id: '11111111-1111-4111-8111-111111111111', email: 'reader@example.com' } }
  const env = {
    NARRATION_PILOT: '1',
    NARRATION_PROVIDER: 'grok',
    XAI_API_KEY: 'grok-test',
    NARRATION_GROK_BASE_URL: 'https://grok.test',
    AUDIO_BUCKET: audio,
    PUBLIC_BOOKS: books,
    RATE_LIMIT: new FakeKV(),
    NARRATION_COORDINATOR: { getByName: (name: string) => ({
      claim: async (token: string) => { if (held.has(name)) return false; held.set(name, token); return true },
      release: async (token: string) => { if (held.get(name) === token) held.delete(name) },
      reserve: async (_day: string, bytes: number) => { reservations.push(bytes); return options.reserve !== false },
      usage: async () => [],
    }) },
    // Added books are not static assets: any lookup here is the bug this file guards.
    ASSETS: { fetch: async (request: Request) => { assetFetches.push(new URL(request.url).pathname); return new Response('Not found', { status: 404 }) } },
  } as unknown as Setup['env']
  const fetchImpl = (async (_input: string | URL | Request, init?: RequestInit) => {
    const text = (JSON.parse(String(init?.body ?? '{}')) as { text?: string }).text ?? ''
    calls.push(text)
    const duration = 4.2
    const chars = Array.from(text)
    return Response.json({ audio: btoa(String.fromCharCode(...syntheticMp3(200))), duration,
      audio_timestamps: { graph_chars: chars, graph_times: chars.map((_, i) => [i * duration / chars.length, (i + 1) * duration / chars.length]) } })
  }) as typeof fetch
  const clock = { now: Date.UTC(2026, 9, 7, 12, 0, 0) }
  const deps: NarrationDeps = {
    verifyUser: async () => user.current,
    verifySiteAdmin: async () => false,
    checkRateLimit: async () => true,
    fetchImpl,
    now: () => clock.now,
    sleep: async (ms: number) => { clock.now += ms },
  }
  const ctx = { waited: [] as Promise<unknown>[], waitUntil(promise: Promise<unknown>) { this.waited.push(promise) }, passThroughOnException() {} } as Setup['ctx']
  return { env, deps, calls, reservations, assetFetches, ctx, user }
}

async function ensure(s: Setup, body: Record<string, unknown>) {
  const request = new Request('https://tinct.app/api/narration/ensure', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: 'https://tinct.app' },
    body: JSON.stringify({ bookId: BOOK, editionKey: 'original-en', chapter: 1, voice: 'f', mode: 'all', ...body }),
  })
  const response = await handleNarration(request, s.env, s.ctx, s.deps)
  await Promise.all(s.ctx.waited)
  return { status: response.status, json: await response.json() as Record<string, unknown> & { paragraphs: Array<Record<string, unknown>> } }
}

async function listing(s: Setup, query: string) {
  const response = await handleNarration(new Request(`https://tinct.app/api/narration/chapter?${query}`), s.env, s.ctx, s.deps)
  return { status: response.status, json: await response.json() as Record<string, unknown> & { paragraphs: Array<Record<string, unknown>> } }
}

/** The chapter exactly as the reader receives it from `/data/editions/{book}-{edition}.json`. */
async function readerChapter(s: Setup, editionKey: string, chapter: number): Promise<string[]> {
  const response = await handlePublicEditionData(new Request(`https://tinct.app/data/editions/${BOOK}-${editionKey}.json`), s.env as never)
  expect(response?.status).toBe(200)
  const data = await response!.json() as { chapters: Array<{ number: number; paragraphs: string[] }> }
  return data.chapters.find(item => item.number === chapter)!.paragraphs
}

const hashOf = (paragraph: string) => sha256Hex(narrationTextForParagraph(paragraph))

function addModernEdition(s: Setup, chapters: Array<{ number: number; state: 'ready' | 'queued' | 'preparing' }>) {
  const books = s.env.PUBLIC_BOOKS
  books.putJson(`public-books/${BOOK}/meta.json`, { version: 1, book: { id: BOOK, title: 'Les Misérables', author: 'Victor Hugo', wordCount: 530_000, editions: [] }, entry: {}, editionKey: 'original-en' })
  books.putJson(`public-books/${BOOK}/modern-en/job.json`, {
    version: 1, bookId: BOOK, state: 'paid', tier: 4, sessionId: 'cs_test', paidAt: 1, priority: [], updatedAt: 1,
    chapters: chapters.map(c => ({ number: c.number, state: c.state, attempts: 0 })),
  })
  books.putJson(`public-books/${BOOK}/modern-en/ch-1.json`, { number: 1, title: 'M. Myriel', paragraphs: MODERN_1 })
}

describe('narration of added public-domain books (pd-*)', () => {
  it('narrates the original edition from the public-books store, paragraph for paragraph as the reader shows it', async () => {
    const s = setup()
    const reader = await readerChapter(s, 'original-en', 1)
    const first = await ensure(s, { paragraphs: [{ index: 0, textHash: await hashOf(reader[0]) }, { index: 2, textHash: await hashOf(reader[2]) }] })
    expect(first.status).toBe(200)
    expect(first.json.paragraphs.map(item => [item.paragraph, item.status])).toEqual([[0, 'ready'], [2, 'ready']])
    expect(first.json.paragraphs[0].textHash).toBe(await hashOf(reader[0]))
    expect(first.json.paragraphs[1].textHash).toBe(await hashOf(reader[2]))
    // The provider was sent the painted words: emphasis marks and extra spaces gone, dashes read as pauses (speakableText).
    expect(s.calls).toEqual([spokenText(narrationTokens(reader[0])), spokenText(narrationTokens(reader[2]))])
    expect(s.calls[0]).toContain('Bishop of D, He was')
    expect(s.calls[1]).toContain('the Parliament of Aix; hence')
    expect(s.env.AUDIO_BUCKET.store.has(narrationMapKey(BOOK, 'original-en', 1, 'f', 2, 'grok'))).toBe(true)
    expect(s.assetFetches).toEqual([])
    expect(s.reservations.length).toBe(2)

    // The listing reports the same paragraphs, in the reader's order.
    const listed = await listing(s, `bookId=${BOOK}&editionKey=original-en&chapter=1&voice=f`)
    expect(listed.status).toBe(200)
    expect(listed.json.paragraphs.map(item => item.paragraph)).toEqual([0, 1, 2])
    expect(listed.json.paragraphs.map(item => item.textHash)).toEqual(await Promise.all(reader.map(hashOf)))
    expect(listed.json.paragraphs.map(item => item.status)).toEqual(['ready', 'missing', 'ready'])
  })

  it('takes each chapter by its number and refuses a paragraph the chapter does not have', async () => {
    const s = setup()
    const reader = await readerChapter(s, 'original-en', 2)
    const second = await ensure(s, { chapter: 2, paragraphs: [{ index: 1, textHash: await hashOf(reader[1]) }, { index: 2 }] })
    expect(second.status).toBe(200)
    expect(second.json.paragraphs[0]).toMatchObject({ paragraph: 1, status: 'ready' })
    expect(second.json.paragraphs[1]).toMatchObject({ paragraph: 2, status: 'failed', reason: 'unknown_paragraph' })
    expect(s.calls).toEqual(['A second chapter, second paragraph.'])
    // A hash for different words than the store holds is never generated.
    const stale = await ensure(s, { paragraphs: [{ index: 0, textHash: await hashOf('Some other words.') }] })
    expect(stale.json.paragraphs[0]).toMatchObject({ status: 'text_mismatch' })
    expect(s.calls).toHaveLength(1)
    // A chapter or book the store does not have is "unavailable", as for a registry book.
    expect((await ensure(s, { chapter: 9, paragraphs: [{ index: 0 }] })).status).toBe(404)
    expect((await ensure(s, { bookId: 'pd-pg-999', paragraphs: [{ index: 0 }] })).status).toBe(404)
  })

  it('guests play cached audio only; generation stays signed-in and inside the spending reservation', async () => {
    const s = setup()
    s.user.current = null
    expect((await ensure(s, { paragraphs: [{ index: 0 }] })).status).toBe(401)
    expect(s.calls).toHaveLength(0)
    s.user.current = { id: '11111111-1111-4111-8111-111111111111', email: 'reader@example.com' }
    await ensure(s, { paragraphs: [{ index: 0 }] })
    s.user.current = null
    const cached = await ensure(s, { paragraphs: [{ index: 0 }] })
    expect(cached.status).toBe(200)
    expect(cached.json.paragraphs[0]).toMatchObject({ status: 'ready' })
    expect(s.calls).toHaveLength(1)

    const capped = setup({ reserve: false })
    const refused = await ensure(capped, { paragraphs: [{ index: 0 }] })
    expect(refused.json.paragraphs[0]).toMatchObject({ status: 'failed' })
    expect(capped.calls).toHaveLength(0)
  })

  it('narrates a written Modern English chapter and refuses one still shown in its original text', async () => {
    const s = setup()
    addModernEdition(s, [{ number: 1, state: 'ready' }, { number: 2, state: 'queued' }])
    const reader = await readerChapter(s, 'modern-en', 1)
    expect(reader).toEqual(MODERN_1)
    const ready = await ensure(s, { editionKey: 'modern-en', paragraphs: [{ index: 1, textHash: await hashOf(reader[1]) }] })
    expect(ready.status).toBe(200)
    expect(ready.json.paragraphs[0]).toMatchObject({ paragraph: 1, status: 'ready' })
    expect(s.calls).toEqual([MODERN_1[1]])

    // Chapter 2 is served in its original words until its modern text lands and
    // the reader swaps it in place: nothing is generated for words about to change.
    const pending = await ensure(s, { editionKey: 'modern-en', chapter: 2, paragraphs: [{ index: 0 }] })
    expect(pending.status).toBe(409)
    expect(pending.json).toMatchObject({ reason: 'modern_pending' })
    expect((await listing(s, `bookId=${BOOK}&editionKey=modern-en&chapter=2&voice=f`)).status).toBe(409)
    expect(s.calls).toHaveLength(1)
    expect(s.reservations).toHaveLength(1)
  })

  it('narrates a finished Modern English edition from its whole file', async () => {
    const s = setup()
    addModernEdition(s, [{ number: 1, state: 'ready' }, { number: 2, state: 'ready' }])
    s.env.PUBLIC_BOOKS.putJson(`public-books/${BOOK}/modern-en.json`, { chapters: [
      { number: 1, title: 'M. Myriel', paragraphs: MODERN_1 },
      { number: 2, title: 'M. Welcome', paragraphs: ['Modern second chapter.'] },
    ] })
    const reader = await readerChapter(s, 'modern-en', 2)
    const result = await ensure(s, { editionKey: 'modern-en', chapter: 2, paragraphs: [{ index: 0, textHash: await hashOf(reader[0]) }] })
    expect(result.status).toBe(200)
    expect(s.calls).toEqual(['Modern second chapter.'])
  })

  it('never narrates a reader’s own uploaded book', async () => {
    const s = setup()
    const own = 'userbook-0123456789abcdef01234567'
    expect((await ensure(s, { bookId: own, paragraphs: [{ index: 0 }] })).status).toBe(403)
    expect((await listing(s, `bookId=${own}&editionKey=original-en&chapter=1&voice=f`)).status).toBe(403)
    expect(s.calls).toHaveLength(0)
    expect(s.assetFetches).toEqual([])
    expect(s.env.PUBLIC_BOOKS.reads).toEqual([])
  })
})
