import { afterEach, describe, expect, it, vi } from 'vitest'
import { COMPANION_MODEL, RECAP_FAST_MODEL } from './companionModel'
import { CATCH_UP_PROMPT_VERSION } from './catchUp'
import { resetBookRetrievalCache, type ChapterText } from './worker/lib/bookRetrieval'
import {
  CATCH_UP_GENERATE_RATE_LIMIT_PER_MINUTE,
  CATCH_UP_LOOKUP_RATE_LIMIT_PER_MINUTE,
  CATCH_UP_MAX_PASSAGE_CHARS,
  CATCH_UP_MAX_TOKENS,
  buildCatchUpPassage,
  handleLabCatchUp,
  parseCatchUpRequest,
} from './worker/routes/labCatchUp'
import type { RecapCache } from './worker/routes/labRecap'

/** A three-part novel: Part 1 = ch 1–2, Part 2 = ch 3–5. */
const chapters: Record<number, ChapterText> = {
  1: { number: 1, title: 'Part 1, Chapter 1', paragraphs: ['Anna arrives at the station.', 'The snow is falling.'] },
  2: { number: 2, title: 'Part 1, Chapter 2', paragraphs: ['Levin mows the field.'] },
  3: { number: 3, title: 'Part 2, Chapter 1', paragraphs: ['The races begin.'] },
  4: { number: 4, title: 'Part 2, Chapter 2', paragraphs: ['Vronsky falls from his horse.'] },
  5: { number: 5, title: 'Part 2, Chapter 3', paragraphs: ['A LATER SECRET is revealed.'] },
}

function fakeAssets(options: { staticFile?: unknown; sections?: unknown } = {}) {
  const fetched: string[] = []
  return {
    fetched,
    fetch: async (request: Request) => {
      const path = new URL(request.url).pathname
      fetched.push(path)
      if (path.startsWith('/data/catch-up/')) return options.staticFile ? Response.json(options.staticFile) : new Response('not found', { status: 404 })
      if (path.endsWith('/manifest.json')) {
        return Response.json({
          chapters: Object.values(chapters).map(chapter => ({ number: chapter.number, title: chapter.title, path: `ch${String(chapter.number).padStart(4, '0')}.json` })),
          ...(options.sections ? { sections: options.sections } : {}),
        })
      }
      const match = /ch(\d{4})\.json$/.exec(path)
      const chapter = match ? chapters[Number(match[1])] : undefined
      return chapter ? Response.json(chapter) : new Response('not found', { status: 404 })
    },
  }
}

function fakeCache(): RecapCache & { entries: Map<string, string> } {
  const entries = new Map<string, string>()
  return {
    entries,
    match: async (request: Request) => {
      const body = entries.get(request.url)
      return body === undefined ? undefined : new Response(body, { headers: { 'Content-Type': 'application/json' } })
    },
    put: async (request: Request, response: Response) => { entries.set(request.url, await response.text()) },
  }
}

function makeContext() {
  const pending: Promise<unknown>[] = []
  return { ctx: { waitUntil: (promise: Promise<unknown>) => { pending.push(promise) } } as unknown as ExecutionContext, pending }
}

function catchUpRequest(body: unknown) {
  return new Request('https://tinct.app/api/lab-catch-up', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'content-type': 'application/json', 'cf-connecting-ip': '203.0.113.9' },
  })
}

function anthropicOk(text: string) {
  return vi.fn(async () => Response.json({ model: COMPANION_MODEL, stop_reason: 'end_turn', content: [{ type: 'text', text }], usage: { input_tokens: 900, output_tokens: 80 } }))
}

const allow = async () => true
const spend = async () => true
const partOne = { bookId: 'anna', editionKey: 'original-en', unitId: 'part-part-1', bookTitle: 'Anna Karenina' }

afterEach(() => { vi.unstubAllGlobals(); resetBookRetrievalCache() })

describe('parseCatchUpRequest', () => {
  it('accepts ids only and rejects anything malformed', () => {
    expect(parseCatchUpRequest(partOne)).toEqual({ ...partOne, throughChapter: null })
    expect(parseCatchUpRequest({ ...partOne, throughChapter: 4 })).toMatchObject({ throughChapter: 4 })
    expect(parseCatchUpRequest(null)).toBeNull()
    expect(parseCatchUpRequest({ ...partOne, bookId: '../etc' })).toBeNull()
    expect(parseCatchUpRequest({ ...partOne, editionKey: 'A B' })).toBeNull()
    expect(parseCatchUpRequest({ ...partOne, unitId: 'Part 1' })).toBeNull()
    expect(parseCatchUpRequest({ ...partOne, unitId: '../x' })).toBeNull()
    expect(parseCatchUpRequest({ ...partOne, throughChapter: 0 })).toBeNull()
    expect(parseCatchUpRequest({ ...partOne, throughChapter: 2.5 })).toBeNull()
    expect(parseCatchUpRequest({ ...partOne, throughChapter: '4' })).toBeNull()
  })
})

describe('buildCatchUpPassage', () => {
  it('gives every chapter a share and marks what it leaves out', () => {
    const long = Array.from({ length: 40 }, (_, i) => ({ number: i + 1, title: `Chapter ${i + 1}`, paragraphs: [`START${i} ${'x'.repeat(5_000)} END${i}`] }))
    const passage = buildCatchUpPassage(long)
    expect(passage.length).toBeLessThanOrEqual(CATCH_UP_MAX_PASSAGE_CHARS + 40 * 20)
    for (let i = 0; i < 40; i++) {
      expect(passage).toContain(`START${i}`)
      expect(passage).toContain(`END${i}`)
    }
    expect(passage).toContain('[…]')
  })
})

describe('POST /api/lab-catch-up', () => {
  it('rejects non-POST, missing config, bad ids and unknown units before any model call', async () => {
    const { ctx } = makeContext()
    const fetchAnthropic = vi.fn()
    const deps = { reserveGuestSpend: spend, cache: null, fetchAnthropic }
    const env = { ANTHROPIC_API_KEY: 'k', ASSETS: fakeAssets() }
    expect((await handleLabCatchUp(new Request('https://tinct.app/api/lab-catch-up'), env, ctx, allow, deps)).status).toBe(405)
    expect((await handleLabCatchUp(catchUpRequest(partOne), { ASSETS: env.ASSETS }, ctx, allow, deps)).status).toBe(503)
    expect((await handleLabCatchUp(catchUpRequest({ ...partOne, unitId: 'Part One!' }), env, ctx, allow, deps)).status).toBe(400)
    expect((await handleLabCatchUp(new Request('https://tinct.app/api/lab-catch-up', { method: 'POST', body: '{nope' }), env, ctx, allow, deps)).status).toBe(400)
    expect((await handleLabCatchUp(catchUpRequest({ ...partOne, unitId: 'part-part-9' }), env, ctx, allow, deps)).status).toBe(400)
    // A through chapter outside the unit is refused, never widened.
    expect((await handleLabCatchUp(catchUpRequest({ ...partOne, throughChapter: 4 }), env, ctx, allow, deps)).status).toBe(400)
    expect(fetchAnthropic).not.toHaveBeenCalled()
  })

  it('generates a completed unit from text the Worker fetched itself, with the fast recap model, then caches it', async () => {
    const { ctx, pending } = makeContext()
    const cache = fakeCache()
    const fetchAnthropic = anthropicOk('Anna arrives in the snow. Levin mows.')
    const env = { ANTHROPIC_API_KEY: 'k', ASSETS: fakeAssets() }
    const response = await handleLabCatchUp(catchUpRequest(partOne), env, ctx, allow, { reserveGuestSpend: spend, cache, fetchAnthropic })
    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({
      summary: 'Anna arrives in the snow. Levin mows.', unitId: 'part-part-1', title: 'Part 1', chapters: [1, 2], complete: true, version: CATCH_UP_PROMPT_VERSION, source: 'model',
    })
    const [payload, apiKey] = fetchAnthropic.mock.calls[0] as unknown as [Record<string, unknown>, string]
    expect(apiKey).toBe('k')
    expect(payload).toMatchObject({ model: RECAP_FAST_MODEL, max_tokens: CATCH_UP_MAX_TOKENS })
    expect(payload).not.toHaveProperty('output_config')
    expect(String(payload.system)).toMatch(/two short plain declarative sentences in the present tense, at most 40 words/)
    const content = (payload.messages as Array<{ content: string }>)[0].content
    expect(content).toContain('Anna Karenina, Part 1')
    expect(content).toContain('snow is falling')
    expect(content).toContain('Levin mows')
    expect(content).not.toContain('races')
    await Promise.all(pending)
    expect([...cache.entries.keys()]).toEqual([`https://tinct.app/__lab-catch-up/${CATCH_UP_PROMPT_VERSION}/anna/original-en/part-part-1/end`])

    // Every later reader gets the cached recap; the model is not called again.
    const second = vi.fn()
    const again = await handleLabCatchUp(catchUpRequest(partOne), env, ctx, allow, { reserveGuestSpend: spend, cache, fetchAnthropic: second })
    expect(await again.json()).toMatchObject({ summary: 'Anna arrives in the snow. Levin mows.', source: 'cache' })
    expect(second).not.toHaveBeenCalled()
  })

  it('the unit the reader is in covers only its chapters through throughChapter — nothing past it reaches the model', async () => {
    const { ctx, pending } = makeContext()
    const cache = fakeCache()
    const fetchAnthropic = anthropicOk('The races begin and Vronsky falls.')
    const env = { ANTHROPIC_API_KEY: 'k', ASSETS: fakeAssets() }
    const response = await handleLabCatchUp(catchUpRequest({ ...partOne, unitId: 'part-part-2', throughChapter: 4 }), env, ctx, allow, { reserveGuestSpend: spend, cache, fetchAnthropic })
    expect(await response.json()).toMatchObject({ chapters: [3, 4], complete: false })
    const content = ((fetchAnthropic.mock.calls[0] as unknown as [Record<string, unknown>])[0].messages as Array<{ content: string }>)[0].content
    expect(content).toContain('Vronsky falls')
    expect(content).not.toContain('LATER SECRET')
    expect(env.ASSETS.fetched.some(path => path.endsWith('ch0005.json'))).toBe(false)
    await Promise.all(pending)
    expect([...cache.entries.keys()][0]).toMatch(/part-part-2\/4$/)
  })

  it('a through chapter that ends the unit is the whole unit (one cache entry)', async () => {
    const { ctx } = makeContext()
    const env = { ANTHROPIC_API_KEY: 'k', ASSETS: fakeAssets() }
    const response = await handleLabCatchUp(catchUpRequest({ ...partOne, throughChapter: 2 }), env, ctx, allow, { reserveGuestSpend: spend, cache: null, fetchAnthropic: anthropicOk('Whole.') })
    expect(await response.json()).toMatchObject({ chapters: [1, 2], complete: true })
  })

  it('uses the manifest\'s sections when it has them, and chapter units when nothing groups them', async () => {
    const { ctx } = makeContext()
    const sectioned = { ANTHROPIC_API_KEY: 'k', ASSETS: fakeAssets({ sections: [{ title: 'Volume 1', chapters: [1, 2, 3] }, { title: 'Volume 2', chapters: [4, 5] }] }) }
    expect(await (await handleLabCatchUp(catchUpRequest({ ...partOne, unitId: 'part-volume-1' }), sectioned, ctx, allow, { reserveGuestSpend: spend, cache: null, fetchAnthropic: anthropicOk('V1.') })).json()).toMatchObject({ chapters: [1, 2, 3], title: 'Volume 1' })
  })

  it('a long unit reads the whole edition in one asset request instead of one per chapter', async () => {
    const { ctx } = makeContext()
    const many = Array.from({ length: 40 }, (_, i) => ({ number: i + 1, title: `Psalms ${i + 1}`, paragraphs: [`Psalm text ${i + 1}.`] }))
    const fetched: string[] = []
    const assets = {
      fetch: async (request: Request) => {
        const path = new URL(request.url).pathname
        fetched.push(path)
        if (path.endsWith('/manifest.json')) return Response.json({ chapters: many.map(ch => ({ number: ch.number, title: ch.title, path: `ch${String(ch.number).padStart(4, '0')}.json` })) })
        if (path === '/data/editions/bible-kjv-en.json') return Response.json({ chapters: many })
        return new Response('not found', { status: 404 })
      },
    }
    const fetchAnthropic = anthropicOk('Psalms.')
    const response = await handleLabCatchUp(catchUpRequest({ bookId: 'bible', editionKey: 'kjv-en', unitId: 'book-psalms', throughChapter: 30 }), { ANTHROPIC_API_KEY: 'k', ASSETS: assets }, ctx, allow, { reserveGuestSpend: spend, cache: null, fetchAnthropic })
    expect(await response.json()).toMatchObject({ complete: false, chapters: Array.from({ length: 30 }, (_, i) => i + 1) })
    expect(fetched.filter(path => /ch\d{4}\.json$/.test(path))).toEqual([])
    const content = ((fetchAnthropic.mock.calls[0] as unknown as [Record<string, unknown>])[0].messages as Array<{ content: string }>)[0].content
    expect(content).toContain('Psalm text 30.')
    expect(content).not.toContain('Psalm text 31.')
  })

  it('a pre-written static recap takes priority over the cache and the model, and costs no generation', async () => {
    const { ctx } = makeContext()
    const fetchAnthropic = vi.fn()
    const rateLimit = vi.fn(async () => true)
    const cache = fakeCache()
    const env = { ANTHROPIC_API_KEY: 'k', ASSETS: fakeAssets({ staticFile: { version: 1, units: { 'part-part-1': { summary: 'Written by hand.' }, 'part-part-2@4': { summary: 'Partial by hand.' } } } }) }
    expect(await (await handleLabCatchUp(catchUpRequest(partOne), env, ctx, rateLimit, { reserveGuestSpend: spend, cache, fetchAnthropic })).json()).toMatchObject({ summary: 'Written by hand.', source: 'static' })
    expect(await (await handleLabCatchUp(catchUpRequest({ ...partOne, unitId: 'part-part-2', throughChapter: 4 }), env, ctx, rateLimit, { reserveGuestSpend: spend, cache, fetchAnthropic })).json()).toMatchObject({ summary: 'Partial by hand.' })
    expect(env.ASSETS.fetched).toContain('/data/catch-up/anna-original-en.json')
    expect(fetchAnthropic).not.toHaveBeenCalled()
    expect(rateLimit.mock.calls.every(call => String((call as unknown[])[0]).startsWith('lab-catch-up:'))).toBe(true)
  })

  it('rate-limits every lookup generously per IP, and generation strictly', async () => {
    const { ctx } = makeContext()
    const env = { ANTHROPIC_API_KEY: 'k', ASSETS: fakeAssets() }
    const closed = vi.fn(async () => false)
    expect((await handleLabCatchUp(catchUpRequest(partOne), env, ctx, closed, { reserveGuestSpend: spend, cache: null, fetchAnthropic: vi.fn() })).status).toBe(429)
    expect(closed).toHaveBeenCalledWith('lab-catch-up:203.0.113.9', undefined, CATCH_UP_LOOKUP_RATE_LIMIT_PER_MINUTE)

    const fetchAnthropic = vi.fn()
    const modelClosed = vi.fn(async (key: string) => !key.startsWith('lab-catch-up-model:'))
    expect((await handleLabCatchUp(catchUpRequest(partOne), env, ctx, modelClosed, { reserveGuestSpend: spend, cache: null, fetchAnthropic })).status).toBe(429)
    expect(modelClosed).toHaveBeenCalledWith('lab-catch-up-model:203.0.113.9', undefined, CATCH_UP_GENERATE_RATE_LIMIT_PER_MINUTE)
    expect(fetchAnthropic).not.toHaveBeenCalled()

    // A cached recap is served even when generation is closed.
    const cache = fakeCache()
    await handleLabCatchUp(catchUpRequest(partOne), env, ctx, allow, { reserveGuestSpend: spend, cache, fetchAnthropic: anthropicOk('Cached.') })
    await new Promise(resolve => setTimeout(resolve, 0))
    expect(await (await handleLabCatchUp(catchUpRequest(partOne), env, ctx, modelClosed, { reserveGuestSpend: spend, cache, fetchAnthropic })).json()).toMatchObject({ summary: 'Cached.' })
  })

  it('answers calmly without a model call when the signed-out ceiling is spent or unavailable', async () => {
    const { ctx } = makeContext()
    const env = { ANTHROPIC_API_KEY: 'k', ASSETS: fakeAssets() }
    const fetchAnthropic = vi.fn()
    for (const reserveGuestSpend of [async () => false, undefined]) {
      const response = await handleLabCatchUp(catchUpRequest(partOne), env, ctx, allow, { reserveGuestSpend, cache: null, fetchAnthropic })
      expect(response.status).toBe(503)
      expect(await response.json()).toMatchObject({ error: { type: 'ai_resting' } })
    }
    expect(fetchAnthropic).not.toHaveBeenCalled()
  })

  it('reserves an estimate against the ceiling before the call', async () => {
    const { ctx } = makeContext()
    const env = { ANTHROPIC_API_KEY: 'k', ASSETS: fakeAssets() }
    const reserve = vi.fn(async () => true)
    await handleLabCatchUp(catchUpRequest(partOne), env, ctx, allow, { reserveGuestSpend: reserve, cache: null, fetchAnthropic: anthropicOk('x.') })
    expect(reserve).toHaveBeenCalledOnce()
    expect((reserve.mock.calls[0] as unknown as [number])[0]).toBeGreaterThan(CATCH_UP_MAX_TOKENS * 15)
  })

  it('reports upstream failures, refusals and empty answers as 502 without caching', async () => {
    const { ctx, pending } = makeContext()
    const cache = fakeCache()
    const env = { ANTHROPIC_API_KEY: 'k', ASSETS: fakeAssets() }
    const fakes = [
      vi.fn(async () => Response.json({ error: 'overloaded' }, { status: 529 })),
      vi.fn(async () => Response.json({ stop_reason: 'refusal', content: [{ type: 'text', text: 'no' }] })),
      vi.fn(async () => Response.json({ stop_reason: 'end_turn', content: [] })),
      vi.fn(async () => { throw new Error('network') }),
    ]
    for (const fetchAnthropic of fakes) {
      expect((await handleLabCatchUp(catchUpRequest(partOne), env, ctx, allow, { reserveGuestSpend: spend, cache, fetchAnthropic })).status).toBe(502)
    }
    const limited = vi.fn(async () => Response.json({ error: 'rate' }, { status: 429 }))
    expect((await handleLabCatchUp(catchUpRequest(partOne), env, ctx, allow, { reserveGuestSpend: spend, cache, fetchAnthropic: limited })).status).toBe(503)
    await Promise.all(pending)
    expect(cache.entries.size).toBe(0)
  })

  it('never reaches api.anthropic.com from tests: the default transport is only used when no fake is injected', async () => {
    const globalFetch = vi.fn(async () => Response.json({ stop_reason: 'end_turn', content: [{ type: 'text', text: 'via global fetch' }] }))
    vi.stubGlobal('fetch', globalFetch)
    const { ctx } = makeContext()
    const env = { ANTHROPIC_API_KEY: 'k', ASSETS: fakeAssets() }
    const response = await handleLabCatchUp(catchUpRequest(partOne), env, ctx, allow, { reserveGuestSpend: spend, cache: null })
    expect(await response.json()).toMatchObject({ summary: 'via global fetch' })
    expect((globalFetch.mock.calls[0] as unknown as [string])[0]).toBe('https://api.anthropic.com/v1/messages')
  })
})
