import { afterEach, describe, expect, it, vi } from 'vitest'
import { COMPANION_MODEL } from './companionModel'
import { RECAP_PROMPT_VERSION } from './recapSummary'
import type { ChapterText } from './worker/lib/bookRetrieval'
import {
  RECAP_MAX_PASSAGE_CHARS,
  RECAP_MAX_TOKENS,
  RECAP_RATE_LIMIT_PER_MINUTE,
  buildRecapPassage,
  elidePassage,
  handleLabRecap,
  parseRecapRequest,
  type RecapCache,
} from './worker/routes/labRecap'

/** Six-paragraph chapter shaped like KJV Proverbs 17, plus its predecessor. */
const proverbs17: ChapterText = {
  number: 645,
  title: 'Proverbs 17',
  paragraphs: [
    '¹ Better is a dry morsel, and quietness therewith, than an house full of sacrifices with strife.',
    '² A wise servant shall have rule over a son that causeth shame.',
    '³ The fining pot is for silver, and the furnace for gold: but the LORD trieth the hearts.',
    '⁴ A wicked doer giveth heed to false lips.',
    '⁵ Whoso mocketh the poor reproacheth his Maker.',
    '⁶ Children\'s children are the crown of old men.',
  ],
}
const proverbs16: ChapterText = { number: 644, title: 'Proverbs 16', paragraphs: ['¹ The preparations of the heart in man.', '² All the ways of a man are clean in his own eyes.'] }

function fakeAssets(chapters: Record<number, ChapterText>) {
  return {
    fetch: async (request: Request) => {
      const path = new URL(request.url).pathname
      if (path.endsWith('/manifest.json')) {
        return Response.json({ chapters: Object.values(chapters).map(chapter => ({ number: chapter.number, title: chapter.title, path: `ch${String(chapter.number).padStart(4, '0')}.json` })) })
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

function recapRequest(body: unknown, init: RequestInit = {}) {
  return new Request('https://tinct.app/api/lab-recap', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'content-type': 'application/json', 'cf-connecting-ip': '203.0.113.7', ...(init.headers || {}) },
    ...init,
  })
}

function anthropicOk(text: string, usage = { input_tokens: 700, output_tokens: 120 }) {
  return vi.fn(async () => Response.json({ model: COMPANION_MODEL, stop_reason: 'end_turn', content: [{ type: 'text', text }], usage }))
}

const env = { ANTHROPIC_API_KEY: 'anthropic-key', ASSETS: fakeAssets({ 645: proverbs17, 644: proverbs16 }) }
const allow = async () => true
const place = { bookId: 'bible', editionKey: 'kjv-en', chapterNumber: 645, paragraphIndex: 3, bookTitle: 'The Bible' }

describe('parseRecapRequest', () => {
  it('accepts a well-formed place and normalises the optional fields', () => {
    expect(parseRecapRequest(place)).toEqual({ ...place, completed: false, previousChapterNumber: null })
    expect(parseRecapRequest({ ...place, completed: true, previousChapterNumber: 644, bookTitle: '  The Bible  ' })).toMatchObject({ completed: true, previousChapterNumber: 644, bookTitle: 'The Bible' })
  })

  it('rejects malformed places and ignores a previous chapter that is not the one before', () => {
    expect(parseRecapRequest(null)).toBeNull()
    expect(parseRecapRequest({ ...place, bookId: '../etc' })).toBeNull()
    expect(parseRecapRequest({ ...place, chapterNumber: 0 })).toBeNull()
    expect(parseRecapRequest({ ...place, paragraphIndex: -1 })).toBeNull()
    expect(parseRecapRequest({ ...place, paragraphIndex: 2.5 })).toBeNull()
    expect(parseRecapRequest({ ...place, previousChapterNumber: 600 })).toMatchObject({ previousChapterNumber: null })
    expect(parseRecapRequest({ ...place, bookTitle: 'x'.repeat(500) })!.bookTitle).toHaveLength(120)
  })
})

describe('buildRecapPassage', () => {
  it('cuts the chapter at the reader\'s paragraph and never includes what lies beyond', () => {
    const passage = buildRecapPassage({ chapter: proverbs17, throughParagraph: 2, previous: null })
    expect(passage).toContain('Proverbs 17')
    expect(passage).toContain('trieth the hearts')
    expect(passage).not.toContain('false lips')
    expect(passage).not.toContain('crown of old men')
  })

  it('prepends the whole previous chapter when in scope', () => {
    const passage = buildRecapPassage({ chapter: proverbs17, throughParagraph: 0, previous: proverbs16 })
    expect(passage.indexOf('Proverbs 16')).toBeLessThan(passage.indexOf('Proverbs 17'))
    expect(passage).toContain('clean in his own eyes')
    expect(passage).toContain('dry morsel')
    expect(passage).not.toContain('wise servant')
  })

  it('elides the middle of an over-long passage, keeping the opening and the most recent part', () => {
    const text = `${'a'.repeat(10_000)}MIDDLE${'z'.repeat(10_000)}`
    const elided = elidePassage(text)
    expect(elided.length).toBeLessThanOrEqual(RECAP_MAX_PASSAGE_CHARS)
    expect(elided.startsWith('aaaa')).toBe(true)
    expect(elided.endsWith('zzzz')).toBe(true)
    expect(elided).not.toContain('MIDDLE')
    expect(elided).toContain('left out')
  })
})

describe('POST /api/lab-recap', () => {
  afterEach(() => { vi.unstubAllGlobals() })

  it('rejects non-POST, missing config and malformed bodies before any upstream call', async () => {
    const { ctx } = makeContext()
    const fetchAnthropic = vi.fn()
    expect((await handleLabRecap(new Request('https://tinct.app/api/lab-recap'), env, ctx, allow, { cache: null, fetchAnthropic })).status).toBe(405)
    expect((await handleLabRecap(recapRequest(place), { ASSETS: env.ASSETS }, ctx, allow, { cache: null, fetchAnthropic })).status).toBe(503)
    expect((await handleLabRecap(recapRequest({ ...place, paragraphIndex: 'three' }), env, ctx, allow, { cache: null, fetchAnthropic })).status).toBe(400)
    expect((await handleLabRecap(new Request('https://tinct.app/api/lab-recap', { method: 'POST', body: '{nope' }), env, ctx, allow, { cache: null, fetchAnthropic })).status).toBe(400)
    expect(fetchAnthropic).not.toHaveBeenCalled()
  })

  it('rate-limits by IP with the recap ceiling', async () => {
    const { ctx } = makeContext()
    const rateLimit = vi.fn(async () => false)
    const response = await handleLabRecap(recapRequest(place), env, ctx, rateLimit, { cache: null, fetchAnthropic: vi.fn() })
    expect(response.status).toBe(429)
    expect(rateLimit).toHaveBeenCalledWith('lab-recap:203.0.113.7', undefined, RECAP_RATE_LIMIT_PER_MINUTE)
  })

  it('returns 404 when the edition has no such chapter', async () => {
    const { ctx } = makeContext()
    const response = await handleLabRecap(recapRequest({ ...place, chapterNumber: 9000 }), env, ctx, allow, { cache: null, fetchAnthropic: vi.fn() })
    expect(response.status).toBe(404)
  })

  it('summarises the chapter through the reader\'s paragraph with the companion model at low effort', async () => {
    const { ctx, pending } = makeContext()
    const cache = fakeCache()
    const fetchAnthropic = anthropicOk('The proverbs so far prize a quiet home over a house full of strife, a wise servant over a shameful son, and the LORD\'s testing of hearts over the refining of silver and gold.')
    const response = await handleLabRecap(recapRequest(place), env, ctx, allow, { cache, fetchAnthropic })
    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data).toEqual({
      summary: expect.stringMatching(/^The proverbs so far/),
      coverage: { chapterNumber: 645, throughParagraph: 3, paragraphCount: 6, complete: false, fromChapterNumber: null },
      model: COMPANION_MODEL,
      version: RECAP_PROMPT_VERSION,
      cached: false,
    })
    expect(fetchAnthropic).toHaveBeenCalledTimes(1)
    const [payload, apiKey] = fetchAnthropic.mock.calls[0] as unknown as [Record<string, unknown>, string]
    expect(apiKey).toBe('anthropic-key')
    expect(payload.model).toBe(COMPANION_MODEL)
    expect(payload.max_tokens).toBe(RECAP_MAX_TOKENS)
    expect(payload.output_config).toEqual({ effort: 'low' })
    expect(payload).not.toHaveProperty('thinking')
    expect(payload).not.toHaveProperty('temperature')
    expect(String(payload.system)).toMatch(/Do not go beyond it/)
    const user = (payload.messages as Array<{ role: string; content: string }>)[0]
    expect(user.role).toBe('user')
    expect(user.content).toContain('The Bible, Proverbs 17')
    expect(user.content).toContain('stopped part-way through Proverbs 17')
    expect(user.content).toContain('false lips')
    expect(user.content).not.toContain('mocketh the poor')
    await Promise.all(pending)
    expect(cache.entries.size).toBe(1)
    expect([...cache.entries.keys()][0]).toBe(`https://tinct.app/__lab-recap/${RECAP_PROMPT_VERSION}/bible/kjv-en/645/645/3`)
  })

  it('serves a cached summary without calling the model', async () => {
    const { ctx, pending } = makeContext()
    const cache = fakeCache()
    const first = anthropicOk('First summary.')
    await handleLabRecap(recapRequest(place), env, ctx, allow, { cache, fetchAnthropic: first })
    await Promise.all(pending)
    const second = vi.fn()
    const response = await handleLabRecap(recapRequest(place), env, ctx, allow, { cache, fetchAnthropic: second })
    expect(response.status).toBe(200)
    expect(await response.json()).toMatchObject({ summary: 'First summary.', cached: true })
    expect(second).not.toHaveBeenCalled()
  })

  it('covers the whole chapter when finished and the previous chapter when asked', async () => {
    const { ctx } = makeContext()
    const fetchAnthropic = anthropicOk('Both chapters so far.')
    const response = await handleLabRecap(recapRequest({ ...place, paragraphIndex: 0, chapterNumber: 645, previousChapterNumber: 644 }), env, ctx, allow, { cache: null, fetchAnthropic })
    expect(await response.json()).toMatchObject({ coverage: { chapterNumber: 645, throughParagraph: 0, complete: false, fromChapterNumber: 644 } })
    const [payload] = fetchAnthropic.mock.calls[0] as unknown as [Record<string, unknown>]
    const content = (payload.messages as Array<{ content: string }>)[0].content
    expect(content).toContain('Proverbs 16')
    expect(content).toContain('clean in his own eyes')
    expect(content).toContain('dry morsel')
    expect(content).not.toContain('wise servant')
    expect(content).toContain('same sitting')

    const finished = await handleLabRecap(recapRequest({ ...place, paragraphIndex: 1, completed: true }), env, ctx, allow, { cache: null, fetchAnthropic: anthropicOk('All of it.') })
    expect(await finished.json()).toMatchObject({ coverage: { throughParagraph: 5, complete: true, fromChapterNumber: null } })
  })

  it('reports upstream failures, refusals and empty answers as 502 without caching', async () => {
    const { ctx, pending } = makeContext()
    const cache = fakeCache()
    const failing = vi.fn(async () => Response.json({ error: 'overloaded' }, { status: 529 }))
    expect((await handleLabRecap(recapRequest(place), env, ctx, allow, { cache, fetchAnthropic: failing })).status).toBe(502)
    const refusing = vi.fn(async () => Response.json({ stop_reason: 'refusal', content: [{ type: 'text', text: 'no' }] }))
    expect((await handleLabRecap(recapRequest(place), env, ctx, allow, { cache, fetchAnthropic: refusing })).status).toBe(502)
    const empty = vi.fn(async () => Response.json({ stop_reason: 'end_turn', content: [] }))
    expect((await handleLabRecap(recapRequest(place), env, ctx, allow, { cache, fetchAnthropic: empty })).status).toBe(502)
    const throwing = vi.fn(async () => { throw new Error('network') })
    expect((await handleLabRecap(recapRequest(place), env, ctx, allow, { cache, fetchAnthropic: throwing })).status).toBe(502)
    await Promise.all(pending)
    expect(cache.entries.size).toBe(0)
  })

  it('never reaches api.anthropic.com from tests: the default transport is only used when no fake is injected', async () => {
    const globalFetch = vi.fn(async () => Response.json({ stop_reason: 'end_turn', content: [{ type: 'text', text: 'via global fetch' }] }))
    vi.stubGlobal('fetch', globalFetch)
    const { ctx } = makeContext()
    const response = await handleLabRecap(recapRequest(place), env, ctx, allow, { cache: null })
    expect(await response.json()).toMatchObject({ summary: 'via global fetch' })
    const [url, init] = globalFetch.mock.calls[0] as unknown as [string, RequestInit]
    expect(url).toBe('https://api.anthropic.com/v1/messages')
    expect((init.headers as Record<string, string>)['x-api-key']).toBe('anthropic-key')
  })
})
