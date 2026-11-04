import { afterEach, describe, expect, it, vi } from 'vitest'
import { COMPANION_MODEL, RECAP_FAST_MODEL } from './companionModel'
import { CATCH_UP_BLOCK_LIMIT, CATCH_UP_CHAPTER_LIMIT, CATCH_UP_PROMPT_VERSION, catchUpCacheKey } from './catchUp'
import { entryFits, entryWordCount } from './worker/lib/entryLength'
import { resetBookRetrievalCache, type ChapterText } from './worker/lib/bookRetrieval'
import {
  CATCH_UP_GENERATE_RATE_LIMIT_PER_MINUTE,
  CATCH_UP_LOOKUP_RATE_LIMIT_PER_MINUTE,
  CATCH_UP_MAX_PASSAGE_CHARS,
  CATCH_UP_MAX_TOKENS,
  CATCH_UP_BLOCK_MAX_TOKENS,
  CATCH_UP_BLOCK_SYSTEM_PROMPT,
  CATCH_UP_SYSTEM_PROMPT,
  CATCH_UP_SHORTEN_MAX_TOKENS,
  CATCH_UP_SHORTEN_SYSTEM_PROMPT,
  buildCatchUpPassage,
  enforceCatchUpLength,
  handleLabCatchUp,
  parseCatchUpRequest,
} from './worker/routes/labCatchUp'
import type { RecapCache } from './worker/routes/labRecap'
import { OWN_CATCH_UP_SYSTEM_PROMPT } from './worker/routes/ownCatchUp'
import { LAB_ASK_CHECKED_SPECIFICS_RULE, LAB_RECAP_GROUNDING_RULE } from './companion/labAskPrompt'

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
    expect(parseCatchUpRequest(partOne)).toEqual({ ...partOne, throughChapter: null, placeChapter: null })
    expect(parseCatchUpRequest({ ...partOne, throughChapter: 4 })).toMatchObject({ throughChapter: 4 })
    expect(parseCatchUpRequest({ ...partOne, placeChapter: 3 })).toMatchObject({ placeChapter: 3 })
    expect(parseCatchUpRequest({ ...partOne, placeChapter: 0 })).toBeNull()
    expect(parseCatchUpRequest({ ...partOne, placeChapter: 2.5 })).toBeNull()
    expect(parseCatchUpRequest({ ...partOne, placeChapter: '3' })).toBeNull()
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
    // A part of several chapters is a group: the block prompt.
    expect(payload).toMatchObject({ model: RECAP_FAST_MODEL, max_tokens: CATCH_UP_BLOCK_MAX_TOKENS, system: CATCH_UP_BLOCK_SYSTEM_PROMPT })
    expect(payload).not.toHaveProperty('output_config')
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

  it('one chapter inside a part (`ch-<n>`) covers that chapter only, with its own cache entry; an unknown chapter is refused', async () => {
    const { ctx, pending } = makeContext()
    const cache = fakeCache()
    const fetchAnthropic = anthropicOk('Vronsky falls from his horse.')
    const env = { ANTHROPIC_API_KEY: 'k', ASSETS: fakeAssets() }
    const response = await handleLabCatchUp(catchUpRequest({ ...partOne, unitId: 'ch-4' }), env, ctx, allow, { reserveGuestSpend: spend, cache, fetchAnthropic })
    expect(await response.json()).toMatchObject({ unitId: 'ch-4', title: 'Part 2, Chapter 2', chapters: [4], complete: true })
    const content = ((fetchAnthropic.mock.calls[0] as unknown as [Record<string, unknown>])[0].messages as Array<{ content: string }>)[0].content
    expect(content).toContain('Vronsky falls')
    expect(content).not.toContain('races')
    expect(content).not.toContain('LATER SECRET')
    expect(env.ASSETS.fetched.some(path => path.endsWith('ch0003.json') || path.endsWith('ch0005.json'))).toBe(false)
    await Promise.all(pending)
    expect([...cache.entries.keys()]).toEqual([`https://tinct.app/__lab-catch-up/${CATCH_UP_PROMPT_VERSION}/anna/original-en/ch-4/end`])
    expect((await handleLabCatchUp(catchUpRequest({ ...partOne, unitId: 'ch-99' }), env, ctx, allow, { reserveGuestSpend: spend, cache: null, fetchAnthropic })).status).toBe(400)
    expect(fetchAnthropic).toHaveBeenCalledTimes(1)
  })

  it('a compact block (`chs-<from>-<to>`) covers exactly those chapters in one call, with the block prompt; nothing after it is read', async () => {
    const { ctx, pending } = makeContext()
    const cache = fakeCache()
    const fetchAnthropic = anthropicOk('The races begin; Vronsky falls.')
    const env = { ANTHROPIC_API_KEY: 'k', ASSETS: fakeAssets() }
    const response = await handleLabCatchUp(catchUpRequest({ ...partOne, unitId: 'chs-3-4' }), env, ctx, allow, { reserveGuestSpend: spend, cache, fetchAnthropic })
    expect(response.status).toBe(200)
    expect(await response.json()).toMatchObject({ unitId: 'chs-3-4', title: 'Part 2, Chapter 1 – Part 2, Chapter 2', chapters: [3, 4], complete: true })
    expect(fetchAnthropic).toHaveBeenCalledTimes(1)
    const payload = (fetchAnthropic.mock.calls[0] as unknown as [Record<string, unknown>])[0]
    expect(payload.system).toBe(CATCH_UP_BLOCK_SYSTEM_PROMPT)
    expect(payload.max_tokens).toBe(CATCH_UP_BLOCK_MAX_TOKENS)
    const content = (payload.messages as Array<{ content: string }>)[0].content
    expect(content).toContain('The races begin')
    expect(content).toContain('Vronsky falls')
    expect(content).not.toContain('Anna arrives')
    expect(content).not.toContain('LATER SECRET')
    expect(env.ASSETS.fetched.some(path => path.endsWith('ch0002.json') || path.endsWith('ch0005.json'))).toBe(false)
    await Promise.all(pending)
    expect([...cache.entries.keys()]).toEqual([`https://tinct.app/__lab-catch-up/${CATCH_UP_PROMPT_VERSION}/anna/original-en/chs-3-4/end`])
    // Single chapters keep the short entry prompt.
    const single = anthropicOk('Vronsky falls from his horse.')
    await handleLabCatchUp(catchUpRequest({ ...partOne, unitId: 'ch-4' }), env, ctx, allow, { reserveGuestSpend: spend, cache: null, fetchAnthropic: single })
    expect((single.mock.calls[0] as unknown as [Record<string, unknown>])[0]).toMatchObject({ system: CATCH_UP_SYSTEM_PROMPT, max_tokens: CATCH_UP_MAX_TOKENS })
    // A reversed or unknown range is refused, never widened; so is one across a part (every part has its own entry).
    for (const unitId of ['chs-3-1', 'chs-1-99', 'chs-0-2', 'chs-1-3', 'chs-2-5']) {
      expect((await handleLabCatchUp(catchUpRequest({ ...partOne, unitId }), env, ctx, allow, { reserveGuestSpend: spend, cache: null, fetchAnthropic })).status).toBe(400)
    }
    expect(fetchAnthropic).toHaveBeenCalledTimes(1)
  })

  it('hard guard: nothing at or after the reader\'s chapter is served, from the model, the cache or a prepared file', async () => {
    const { ctx, pending } = makeContext()
    const cache = fakeCache()
    const fetchAnthropic = anthropicOk('The races begin.')
    const staticFile = { version: 1, units: { 'ch-4': { summary: 'Vronsky falls from his horse at the races.' }, 'part-part-2': { summary: 'The races, the fall and a later secret.' } } }
    const env = { ANTHROPIC_API_KEY: 'k', ASSETS: fakeAssets({ staticFile }) }
    const deps = { reserveGuestSpend: spend, cache, fetchAnthropic }
    // Reader in chapter 4: chapter 3 is served, chapter 4 and anything reaching it never are.
    expect((await handleLabCatchUp(catchUpRequest({ ...partOne, unitId: 'ch-3', placeChapter: 4 }), env, ctx, allow, deps)).status).toBe(200)
    for (const unitId of ['ch-4', 'ch-5', 'chs-3-4', 'part-part-2']) {
      const response = await handleLabCatchUp(catchUpRequest({ ...partOne, unitId, placeChapter: 4 }), env, ctx, allow, deps)
      expect(response.status).toBe(400)
      expect(JSON.stringify(await response.json())).not.toMatch(/Vronsky|secret/i)
    }
    // A unit the reader is in, through a chapter at the place, is refused too.
    expect((await handleLabCatchUp(catchUpRequest({ ...partOne, unitId: 'part-part-2', throughChapter: 4, placeChapter: 4 }), env, ctx, allow, deps)).status).toBe(400)
    // An unknown place is refused rather than trusted.
    expect((await handleLabCatchUp(catchUpRequest({ ...partOne, unitId: 'ch-3', placeChapter: 99 }), env, ctx, allow, deps)).status).toBe(400)
    await Promise.all(pending)
    // A cached entry for a later chapter (another reader's) is not served to a reader before it.
    cache.entries.set(`https://tinct.app/__lab-catch-up/${CATCH_UP_PROMPT_VERSION}/anna/original-en/ch-5/end`, JSON.stringify({ summary: 'A later secret is revealed to everyone.' }))
    expect((await handleLabCatchUp(catchUpRequest({ ...partOne, unitId: 'ch-5', placeChapter: 5 }), env, ctx, allow, deps)).status).toBe(400)
    expect(fetchAnthropic).toHaveBeenCalledTimes(1)
    const content = ((fetchAnthropic.mock.calls[0] as unknown as [Record<string, unknown>])[0].messages as Array<{ content: string }>)[0].content
    expect(content).not.toContain('Vronsky')
    expect(env.ASSETS.fetched.some(path => path.endsWith('ch0004.json') || path.endsWith('ch0005.json'))).toBe(false)
  })

  it('every catch-up prompt carries the chat\'s grounding: only what the span says, never an outcome it does not show', () => {
    for (const prompt of [CATCH_UP_SYSTEM_PROMPT, CATCH_UP_BLOCK_SYSTEM_PROMPT, OWN_CATCH_UP_SYSTEM_PROMPT]) {
      expect(prompt).toContain(LAB_RECAP_GROUNDING_RULE)
      expect(prompt).toContain(LAB_ASK_CHECKED_SPECIFICS_RULE)
    }
    expect(LAB_RECAP_GROUNDING_RULE).toMatch(/^Only state what the text says\. Never state an outcome/)
    expect(LAB_RECAP_GROUNDING_RULE).toMatch(/not in the span/)
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

  describe('structured entry: nothing to summarise is an empty entry, never a request for more text', () => {
    const complaint = 'I need to see the actual content of Part 1 to write an accurate summary. Could you provide the full text of the passage?'
    const toolAnswer = (input: Record<string, unknown>) => vi.fn(async () => Response.json({
      model: RECAP_FAST_MODEL, stop_reason: 'tool_use', content: [{ type: 'tool_use', id: 'toolu_1', name: 'write_entry', input }], usage: { input_tokens: 300, output_tokens: 20 },
    }))

    it('forces the write_entry tool and reads its summary field', async () => {
      const { ctx } = makeContext()
      const env = { ANTHROPIC_API_KEY: 'k', ASSETS: fakeAssets() }
      const fetchAnthropic = toolAnswer({ nothing_to_summarise: false, summary: 'Anna arrives in the snow.' })
      const response = await handleLabCatchUp(catchUpRequest(partOne), env, ctx, allow, { reserveGuestSpend: spend, cache: null, fetchAnthropic })
      expect(await response.json()).toMatchObject({ summary: 'Anna arrives in the snow.', source: 'model' })
      const [payload] = fetchAnthropic.mock.calls[0] as unknown as [Record<string, unknown>]
      expect(payload.tool_choice).toEqual({ type: 'tool', name: 'write_entry' })
      expect(String(payload.system)).toMatch(/nothing_to_summarise to true/)
    })

    it('answers 200 with an empty entry and caches nothing, whether the model sets the field or writes a complaint', async () => {
      const { ctx, pending } = makeContext()
      const cache = fakeCache()
      const env = { ANTHROPIC_API_KEY: 'k', ASSETS: fakeAssets() }
      for (const fetchAnthropic of [toolAnswer({ nothing_to_summarise: true, summary: '' }), toolAnswer({ nothing_to_summarise: false, summary: complaint }), anthropicOk(complaint)]) {
        const response = await handleLabCatchUp(catchUpRequest(partOne), env, ctx, allow, { reserveGuestSpend: spend, cache, fetchAnthropic })
        expect(response.status).toBe(200)
        expect(await response.json()).toMatchObject({ summary: '', empty: true, unitId: 'part-part-1' })
      }
      await Promise.all(pending)
      expect(cache.entries.size).toBe(0)
    })

    it('skips a cached or pre-written complaint and replaces the cached one', async () => {
      const { ctx, pending } = makeContext()
      const cache = fakeCache()
      const key = `https://tinct.app/__lab-catch-up/${CATCH_UP_PROMPT_VERSION}/anna/original-en/part-part-1/end`
      cache.entries.set(key, JSON.stringify({ summary: complaint }))
      const env = { ANTHROPIC_API_KEY: 'k', ASSETS: fakeAssets({ staticFile: { version: 1, units: { 'part-part-1': { summary: complaint } } } }) }
      const fetchAnthropic = toolAnswer({ nothing_to_summarise: false, summary: 'Anna arrives in the snow.' })
      const response = await handleLabCatchUp(catchUpRequest(partOne), env, ctx, allow, { reserveGuestSpend: spend, cache, fetchAnthropic })
      expect(await response.json()).toMatchObject({ summary: 'Anna arrives in the snow.', source: 'model' })
      await Promise.all(pending)
      expect(JSON.parse(cache.entries.get(key)!)).toEqual({ summary: 'Anna arrives in the snow.' })
    })
  })

  describe('length limit (Anders, 4 Nov 2026: "too much text"): a chapter one sentence of 25 words, a group two of 45', () => {
    // The shape of the 2 Maccabees 1–8 entry: an episode per chapter, glued together.
    const glued = [
      'The Jews in Jerusalem send greetings to their kin in Egypt.',
      'Jeremiah is said to have hidden the ark in a cave.',
      'When the king dies, Jason buys the high priesthood and brings in Greek ways.',
      'Antiochus invades Egypt and plunders the temple on his way back.',
      'Eleazar, ninety years old, dies rather than eat pork.',
      'Seven brothers and their mother die one after another for the law.',
      'Judas gathers about six thousand men and defeats Nicanor, who flees to Antioch.',
    ].join(' ')
    const tool = (summary: string, delayMs = 0) => async () => {
      if (delayMs) await new Promise(resolve => setTimeout(resolve, delayMs))
      return Response.json({ model: RECAP_FAST_MODEL, stop_reason: 'tool_use', content: [{ type: 'tool_use', id: 'toolu_1', name: 'write_entry', input: { nothing_to_summarise: false, summary } }], usage: { input_tokens: 300, output_tokens: 60 } })
    }
    const short = 'Jason buys the high priesthood and Antiochus plunders the temple. Judas gathers an army and defeats Nicanor.'

    it('the prompts ask for the new limits, and the calls leave room for an overlong answer to arrive whole', () => {
      expect(CATCH_UP_SYSTEM_PROMPT).toContain('one sentence of at most 25 words')
      expect(CATCH_UP_BLOCK_SYSTEM_PROMPT).toContain('at most two sentences and 45 words in all')
      expect(CATCH_UP_BLOCK_SYSTEM_PROMPT).toMatch(/Do not go chapter by chapter/)
      // A cut-off call is no entry (2 Nov 2026): room for several times the limit.
      expect(CATCH_UP_MAX_TOKENS).toBeGreaterThanOrEqual(CATCH_UP_CHAPTER_LIMIT.words * 8)
      expect(CATCH_UP_BLOCK_MAX_TOKENS).toBeGreaterThanOrEqual(CATCH_UP_BLOCK_LIMIT.words * 8)
    })

    it('an entry within the limit is untouched: one call, no correction', async () => {
      const { ctx } = makeContext()
      const env = { ANTHROPIC_API_KEY: 'k', ASSETS: fakeAssets() }
      const fetchAnthropic = vi.fn(tool(short))
      const reserve = vi.fn(async () => true)
      const response = await handleLabCatchUp(catchUpRequest(partOne), env, ctx, allow, { reserveGuestSpend: reserve, cache: null, fetchAnthropic })
      expect(await response.json()).toMatchObject({ summary: short })
      expect(fetchAnthropic).toHaveBeenCalledTimes(1)
      expect(reserve).toHaveBeenCalledTimes(1)
    })

    it('an overlong entry gets ONE corrective call with its length and the draft only; the rewrite is shown and cached', async () => {
      const { ctx, pending } = makeContext()
      const cache = fakeCache()
      const env = { ANTHROPIC_API_KEY: 'k', ASSETS: fakeAssets() }
      const fetchAnthropic = vi.fn(tool(glued)).mockImplementationOnce(tool(glued)).mockImplementationOnce(tool(short))
      const reserve = vi.fn(async () => true)
      const response = await handleLabCatchUp(catchUpRequest(partOne), env, ctx, allow, { reserveGuestSpend: reserve, cache, fetchAnthropic })
      expect(await response.json()).toMatchObject({ summary: short, source: 'model' })
      expect(fetchAnthropic).toHaveBeenCalledTimes(2)
      expect(reserve).toHaveBeenCalledTimes(2)
      const [payload] = fetchAnthropic.mock.calls[1] as unknown as [Record<string, unknown>]
      expect(payload).toMatchObject({ model: RECAP_FAST_MODEL, system: CATCH_UP_SHORTEN_SYSTEM_PROMPT, max_tokens: CATCH_UP_SHORTEN_MAX_TOKENS, tool_choice: { type: 'tool', name: 'write_entry' } })
      const content = (payload.messages as Array<{ content: string }>)[0].content
      expect(content).toContain(`The entry below is ${entryWordCount(glued)} words in 7 sentences.`)
      expect(content).toContain('at most two sentences and 45 words in all')
      expect(content).toContain(glued)
      // Never the passage again: the correction is cheap.
      expect(content).not.toContain('snow is falling')
      await Promise.all(pending)
      expect(JSON.parse([...cache.entries.values()][0])).toEqual({ summary: short })
    })

    it('a rewrite still over the limit is cut at a sentence end; so is the draft when the correction fails or is refused', async () => {
      const { ctx } = makeContext()
      const env = { ANTHROPIC_API_KEY: 'k', ASSETS: fakeAssets() }
      const stillLong = `${short} Eleazar dies rather than eat pork.`
      const cases: Array<{ second: () => Promise<Response>; reserve: () => Promise<boolean>; expected: string; calls: number }> = [
        { second: tool(stillLong), reserve: async () => true, expected: short, calls: 2 },
        { second: async () => Response.json({ error: 'overloaded' }, { status: 529 }), reserve: async () => true, expected: 'The Jews in Jerusalem send greetings to their kin in Egypt. Jeremiah is said to have hidden the ark in a cave.', calls: 2 },
        { second: async () => { throw new Error('network') }, reserve: async () => true, expected: 'The Jews in Jerusalem send greetings to their kin in Egypt. Jeremiah is said to have hidden the ark in a cave.', calls: 2 },
      ]
      for (const item of cases) {
        const fetchAnthropic = vi.fn(item.second).mockImplementationOnce(tool(glued))
        const response = await handleLabCatchUp(catchUpRequest(partOne), env, ctx, allow, { reserveGuestSpend: item.reserve, cache: null, fetchAnthropic })
        const { summary } = await response.json() as { summary: string }
        expect(summary).toBe(item.expected)
        expect(entryFits(summary, CATCH_UP_BLOCK_LIMIT)).toBe(true)
        expect(fetchAnthropic).toHaveBeenCalledTimes(item.calls)
      }
      // The spend ceiling refuses the correction: no second call, the draft trimmed.
      let reserved = 0
      const fetchAnthropic = vi.fn(tool(glued))
      const response = await handleLabCatchUp(catchUpRequest({ ...partOne, unitId: 'ch-4' }), env, ctx, allow, { reserveGuestSpend: async () => ++reserved === 1, cache: null, fetchAnthropic })
      expect(await response.json()).toMatchObject({ summary: 'The Jews in Jerusalem send greetings to their kin in Egypt.' })
      expect(fetchAnthropic).toHaveBeenCalledTimes(1)
    })

    it('a chapter entry is held to one sentence', async () => {
      const { ctx } = makeContext()
      const env = { ANTHROPIC_API_KEY: 'k', ASSETS: fakeAssets() }
      const two = 'Vronsky falls from his horse. Anna gives herself away.'
      const fetchAnthropic = vi.fn(tool('Vronsky falls at the races and Anna gives herself away.')).mockImplementationOnce(tool(two))
      const response = await handleLabCatchUp(catchUpRequest({ ...partOne, unitId: 'ch-4' }), env, ctx, allow, { reserveGuestSpend: spend, cache: null, fetchAnthropic })
      expect(await response.json()).toMatchObject({ summary: 'Vronsky falls at the races and Anna gives herself away.' })
      expect(String(((fetchAnthropic.mock.calls[1] as unknown as [Record<string, unknown>])[0].messages as Array<{ content: string }>)[0].content)).toContain('one sentence of at most 25 words')
    })

    it('a slow correction never holds the entry back: past the budget the trimmed draft is shown, and the rewrite settles into the cache', async () => {
      const send = vi.fn(tool(short, 60))
      const started = Date.now()
      const result = await enforceCatchUpLength({ summary: glued, limit: CATCH_UP_BLOCK_LIMIT, where: '2 Maccabees 1 – 2 Maccabees 8', send, reserve: spend, budgetMs: 10 })
      expect(Date.now() - started).toBeLessThan(55)
      expect(result.outcome).toBe('late')
      expect(result.summary).toBe('The Jews in Jerusalem send greetings to their kin in Egypt. Jeremiah is said to have hidden the ark in a cave.')
      expect(await result.settled).toBe(short)
      expect(send).toHaveBeenCalledTimes(1)
    })
  })

  it('the prompt version is in every cache key: an entry cached under an earlier prompt is never served', async () => {
    expect(CATCH_UP_PROMPT_VERSION).toBe('catch-up-v5')
    expect(catchUpCacheKey({ bookId: 'bible', editionKey: 'kjv', unitId: 'chs-1-8' })).toBe(`${CATCH_UP_PROMPT_VERSION}/bible/kjv/chs-1-8/end`)
    const { ctx } = makeContext()
    const cache = fakeCache()
    cache.entries.set('https://tinct.app/__lab-catch-up/catch-up-v4/anna/original-en/part-part-1/end', JSON.stringify({ summary: 'An old, long entry.' }))
    const env = { ANTHROPIC_API_KEY: 'k', ASSETS: fakeAssets() }
    const fetchAnthropic = anthropicOk('Anna arrives in the snow.')
    const response = await handleLabCatchUp(catchUpRequest(partOne), env, ctx, allow, { reserveGuestSpend: spend, cache, fetchAnthropic })
    expect(await response.json()).toMatchObject({ summary: 'Anna arrives in the snow.', source: 'model' })
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
