import { afterEach, describe, expect, it, vi } from 'vitest'
import { buildOwnCatchUp, ownCatchUpFailureReason, ownCatchUpPlan, OWN_CATCH_UP_RATE_WAIT_MS } from './ownCatchUp'
import type { UserBookChapter } from './userEdition'
import { handleOwnCatchUp, OWN_CATCH_UP_GENERATE_RATE_PER_MINUTE, type OwnCatchUpDeps, type OwnCatchUpEnv } from '../../worker/routes/ownCatchUp'
import { fakeUserBooksBucket } from '../../worker/fakeUserBooksBucket'
import { OWN_CATCH_UP_MAX_CHAPTER_CHARS, sampleCatchUpText } from '../../ownCatchUp'

/**
 * The reader's side of Catch me up on an own book, against the real Worker
 * route (fake private bucket, stub model): no request leaves the test.
 */

const USER = '11111111-1111-4111-8111-111111111111'
const OTHER = '22222222-2222-4222-8222-222222222222'
const SHA = 'ab12cd34ef56ab12cd34ef56'.padEnd(64, '0')
const HEX = SHA.slice(0, 24)

const chapters: UserBookChapter[] = [
  { number: 1, title: 'The Lamp', paragraphs: ['Alpha one.', 'Alpha two.'] },
  { number: 2, title: 'The Morning', paragraphs: ['Bravo one.', 'Bravo two.', 'Bravo three.'] },
  { number: 3, title: 'The City', paragraphs: ['Charlie one.', 'Charlie two.', 'Charlie three (unread).'] },
  { number: 4, title: 'The Sea', paragraphs: ['Delta (unread).'] },
]

function world() {
  const userBooks = fakeUserBooksBucket()
  for (const owner of [USER, OTHER]) {
    userBooks.objects.set(`u/${owner}/${owner[0].repeat(32)}`, {
      key: `u/${owner}/${owner[0].repeat(32)}`, bytes: new Uint8Array(10), uploaded: new Date('2026-10-01T00:00:00Z'),
      customMetadata: { name: 'Mine.epub', title: 'Mine', author: '', type: 'epub', sha256: SHA, createdAt: '2026-10-01T00:00:00.000Z' },
    })
  }
  const env = { ANTHROPIC_API_KEY: 'k', USER_BOOKS: userBooks.bucket } as unknown as OwnCatchUpEnv
  const model: string[] = []
  const sent: Array<{ method: string; body: Record<string, unknown> | null }> = []
  const tokens: Record<string, string> = { 'Bearer reader': USER, 'Bearer other': OTHER }
  const ctx = { waitUntil() {}, passThroughOnException() {} } as unknown as ExecutionContext
  const fetchImpl = async (url: string, init: RequestInit) => {
    const body = init.body ? JSON.parse(String(init.body)) as Record<string, unknown> : null
    sent.push({ method: String(init.method), body })
    return handleOwnCatchUp(new Request(new URL(url, 'https://tinct.app'), init), env, ctx, {
      verifyUser: async (_env, request) => { const id = tokens[request.headers.get('authorization') ?? '']; return id ? { id } : null },
      checkRateLimit: async () => true,
      reserveGuestSpend: async () => true,
      allowsAi: async () => true,
      fetchAnthropic: async (payload) => {
        const content = (payload.messages as Array<{ content: string }>)[0].content
        model.push(content)
        const read = [...content.matchAll(/(Alpha|Bravo|Charlie|Delta)/g)].map(m => m[1])
        return Response.json({ content: [{ type: 'tool_use', name: 'write_entry', input: { nothing_to_summarise: false, summary: `Through ${read[read.length - 1]}.` } }], stop_reason: 'tool_use', usage: { input_tokens: 1, output_tokens: 1 } })
      },
    })
  }
  return { userBooks, model, sent, fetchImpl }
}

afterEach(() => { vi.restoreAllMocks() })

describe('ownCatchUpPlan', () => {
  it('covers earlier chapters whole and the reader’s chapter only to their paragraph; nothing after', () => {
    const steps = ownCatchUpPlan({ chapters, chapterNumber: 3, paragraphIndex: 1, completed: false })
    expect(steps.map(step => [step.chapter, step.complete, step.through])).toEqual([[1, true, 1], [2, true, 2], [3, false, 1]])
    expect(steps[2].text).toBe('Charlie one.\n\nCharlie two.')
    expect(steps.map(step => step.text).join(' ')).not.toMatch(/unread/)
  })

  it('counts the reader’s chapter once they are past its opening, and all of it once finished', () => {
    expect(ownCatchUpPlan({ chapters, chapterNumber: 3, paragraphIndex: 0, completed: false }).map(step => step.chapter)).toEqual([1, 2])
    expect(ownCatchUpPlan({ chapters, chapterNumber: 3, paragraphIndex: 0, completed: true }).at(-1)).toMatchObject({ chapter: 3, complete: true, through: 2 })
  })

  it('samples a long chapter to one request’s cap', () => {
    const long = [{ number: 1, title: 'Long', paragraphs: Array.from({ length: 400 }, (_, i) => `p${i} ${'word '.repeat(40)}`) }]
    const [step] = ownCatchUpPlan({ chapters: long, chapterNumber: 1, paragraphIndex: 0, completed: true })
    expect(step.text.length).toBeLessThanOrEqual(OWN_CATCH_UP_MAX_CHAPTER_CHARS)
    expect(step.text).toContain(' […] ')
  })
})

describe('buildOwnCatchUp', () => {
  it('builds the recap one chapter at a time, each request carrying one chapter and the recap before it', async () => {
    const w = world()
    const steps = ownCatchUpPlan({ chapters, chapterNumber: 2, paragraphIndex: 2, completed: true })
    const progress: Array<[number, number]> = []
    const result = await buildOwnCatchUp({ bookHex: HEX, bookTitle: 'Mine', steps, token: 'reader', fetchImpl: w.fetchImpl, onProgress: (done, total) => progress.push([done, total]) })
    expect(result).toEqual({ ok: true, recap: 'Through Bravo.' })
    const posts = w.sent.filter(request => request.method === 'POST').map(request => request.body!)
    expect(posts.map(body => [body.chapter, body.previous])).toEqual([[1, ''], [2, 'Through Alpha.']])
    expect(String(posts[1].text)).not.toContain('Alpha')
    expect(progress).toEqual([[0, 2], [1, 2], [2, 2]])
    // Nothing but the hex identifies the book; never the reader's userbook- id.
    expect(JSON.stringify(w.sent)).not.toContain('userbook-')
  })

  it('reopened further on, sends only the new chapter with the stored recap; reopened in place, sends nothing to the model', async () => {
    const w = world()
    await buildOwnCatchUp({ bookHex: HEX, steps: ownCatchUpPlan({ chapters, chapterNumber: 2, paragraphIndex: 2, completed: true }), token: 'reader', fetchImpl: w.fetchImpl })
    w.sent.length = 0
    const result = await buildOwnCatchUp({ bookHex: HEX, steps: ownCatchUpPlan({ chapters, chapterNumber: 3, paragraphIndex: 1, completed: false }), token: 'reader', fetchImpl: w.fetchImpl })
    expect(result).toEqual({ ok: true, recap: 'Through Charlie.' })
    const posts = w.sent.filter(request => request.method === 'POST').map(request => request.body!)
    expect(posts).toHaveLength(1)
    expect(posts[0]).toMatchObject({ chapter: 3, complete: false, through: 1, previous: 'Through Bravo.', text: 'Charlie one.\n\nCharlie two.' })
    expect(w.model).toHaveLength(3)

    w.sent.length = 0
    expect(await buildOwnCatchUp({ bookHex: HEX, steps: ownCatchUpPlan({ chapters, chapterNumber: 3, paragraphIndex: 1, completed: false }), token: 'reader', fetchImpl: w.fetchImpl })).toEqual({ ok: true, recap: 'Through Charlie.' })
    expect(w.sent.map(request => request.method)).toEqual(['GET'])
    expect(w.model).toHaveLength(3)
  })

  it('keeps each account’s recap to itself: another reader of the same file builds their own', async () => {
    const w = world()
    const steps = ownCatchUpPlan({ chapters, chapterNumber: 2, paragraphIndex: 2, completed: true })
    await buildOwnCatchUp({ bookHex: HEX, steps, token: 'reader', fetchImpl: w.fetchImpl })
    await buildOwnCatchUp({ bookHex: HEX, steps, token: 'other', fetchImpl: w.fetchImpl })
    expect(w.model).toHaveLength(4)
    expect([...w.userBooks.objects.keys()].filter(key => key.includes('/recaps/')).map(key => key.split('/')[1]).sort())
      .toEqual([USER, USER, OTHER, OTHER].sort())
  })

  it('signed out: no request at all', async () => {
    const w = world()
    expect(await buildOwnCatchUp({ bookHex: HEX, steps: ownCatchUpPlan({ chapters, chapterNumber: 2, paragraphIndex: 0, completed: true }), token: null, fetchImpl: w.fetchImpl })).toEqual({ ok: false, status: 401 })
    expect(w.sent).toEqual([])
  })
})

/**
 * The whole book's Summary on a full-length own book (13 Nov 2026, The Fabric of Reality, Penguin EPUB):
 * 14 chapters of about 8,600 words each plus front and back matter, 24 sections, about 120,000 words.
 * Each section is one model request; the old limit of 20 a minute refused the 21st and the sheet showed a bare Retry.
 */
describe('whole-book Summary of a long own book', () => {
  const words = (n: number, seed: string) => Array.from({ length: n }, (_, i) => `${seed}${i % 97}`).join(' ')
  const titles = ['Cover', 'About the Author', 'Title Page', 'Dedication', 'Contents', 'Preface', 'Acknowledgements',
    ...Array.from({ length: 14 }, (_, i) => `Chapter ${i + 1}`), 'Bibliography', 'Index', 'Copyright']
  const book = (sections: string[]): UserBookChapter[] => sections.map((title, i) => ({
    number: i + 1, title,
    paragraphs: title.startsWith('Chapter') ? Array.from({ length: 90 }, (_, p) => words(95, `w${i}p${p}`)) : [words(60, `f${i}`)],
  }))
  const wholeBookPlan = (sections: UserBookChapter[]) => {
    const last = sections[sections.length - 1]
    return ownCatchUpPlan({ chapters: sections, chapterNumber: last.number, paragraphIndex: last.paragraphs.length - 1, completed: true })
  }

  /** The real route, a fixed one-minute window per key as the usage coordinator counts it, and a clock that only moves when the client waits. */
  function longWorld(model: OwnCatchUpDeps['fetchAnthropic']) {
    const userBooks = fakeUserBooksBucket()
    userBooks.objects.set(`u/${USER}/${'1'.repeat(32)}`, {
      key: `u/${USER}/${'1'.repeat(32)}`, bytes: new Uint8Array(10), uploaded: new Date('2026-10-01T00:00:00Z'),
      customMetadata: { name: 'Fabric.epub', title: 'The Fabric of Reality', author: '', type: 'epub', sha256: SHA, createdAt: '2026-10-01T00:00:00.000Z' },
    })
    const env = { ANTHROPIC_API_KEY: 'k', USER_BOOKS: userBooks.bucket } as unknown as OwnCatchUpEnv
    const ctx = { waitUntil() {}, passThroughOnException() {} } as unknown as ExecutionContext
    let now = 0
    const windows = new Map<string, { resetAt: number; count: number }>()
    const statuses: number[] = []
    const waits: number[] = []
    const fetchImpl = async (url: string, init: RequestInit) => {
      const response = await handleOwnCatchUp(new Request(new URL(url, 'https://tinct.app'), init), env, ctx, {
        verifyUser: async () => ({ id: USER }),
        checkRateLimit: async (key, _kv, max = 10) => {
          const window = windows.get(key)
          if (!window || now >= window.resetAt) { windows.set(key, { resetAt: now + 60_000, count: 1 }); return true }
          if (window.count >= max) return false
          window.count++
          return true
        },
        reserveGuestSpend: async () => true,
        allowsAi: async () => true,
        fetchAnthropic: model,
      })
      statuses.push(response.status)
      return response
    }
    const sleep = async (ms: number) => { waits.push(ms); now += ms }
    return { fetchImpl, sleep, statuses, waits }
  }
  const answer = (summary: string) => Response.json({ content: [{ type: 'tool_use', name: 'write_entry', input: { nothing_to_summarise: false, summary } }], stop_reason: 'tool_use', usage: {} })
  const steady = async () => answer('The author argues that the deepest theories explain the world.')

  it('summarises all 24 sections of a 120,000-word book in one run, without pausing', async () => {
    const sections = book(titles)
    expect(sections.flatMap(c => c.paragraphs).join(' ').split(' ').length).toBeGreaterThan(120_000)
    const steps = wholeBookPlan(sections)
    expect(steps).toHaveLength(24)
    const w = longWorld(steady)
    const result = await buildOwnCatchUp({ bookHex: HEX, bookTitle: 'The Fabric of Reality', steps, token: 'reader', fetchImpl: w.fetchImpl, sleep: w.sleep })
    expect(result).toEqual({ ok: true, recap: 'The author argues that the deepest theories explain the world.' })
    expect(w.statuses.filter(status => status !== 200)).toEqual([])
    expect(w.waits).toEqual([])
  })

  it('a book with more sections than a minute allows waits out the limit and carries on, instead of failing', async () => {
    const many = book(Array.from({ length: OWN_CATCH_UP_GENERATE_RATE_PER_MINUTE + 10 }, (_, i) => `Letter ${i + 1}`))
    const w = longWorld(steady)
    const result = await buildOwnCatchUp({ bookHex: HEX, steps: wholeBookPlan(many), token: 'reader', fetchImpl: w.fetchImpl, sleep: w.sleep })
    expect(result.ok).toBe(true)
    expect(w.statuses).toContain(429)
    expect(w.waits.length).toBeGreaterThan(0)
    expect(w.waits.every(ms => ms === OWN_CATCH_UP_RATE_WAIT_MS)).toBe(true)
  })

  it('asks once more for a section the model could not answer', async () => {
    let calls = 0
    const w = longWorld(async () => (++calls === 9 ? Response.json({ content: [], stop_reason: 'max_tokens', usage: {} }) : steady()))
    const result = await buildOwnCatchUp({ bookHex: HEX, steps: wholeBookPlan(book(titles)), token: 'reader', fetchImpl: w.fetchImpl, sleep: w.sleep })
    expect(result.ok).toBe(true)
    expect(w.statuses.filter(status => status === 502)).toHaveLength(1)
  })

  it('a section that keeps failing names itself, and Retry resumes there', async () => {
    let failing = true
    const w = longWorld(async payload => {
      const content = (payload.messages as Array<{ content: string }>)[0].content
      return failing && content.includes('Chapter 9.') ? Response.json({ error: 'overloaded' }, { status: 500 }) : steady()
    })
    const steps = wholeBookPlan(book(titles))
    const result = await buildOwnCatchUp({ bookHex: HEX, steps, token: 'reader', fetchImpl: w.fetchImpl, sleep: w.sleep })
    expect(result).toEqual({ ok: false, status: 502, chapter: 16, title: 'Chapter 9' })
    expect(ownCatchUpFailureReason(result as Extract<typeof result, { ok: false }>)).toBe('The AI could not summarise “Chapter 9”. Retry picks up from there.')
    failing = false
    w.statuses.length = 0
    expect((await buildOwnCatchUp({ bookHex: HEX, steps, token: 'reader', fetchImpl: w.fetchImpl, sleep: w.sleep })).ok).toBe(true)
    // The 15 sections already summarised are read back, not asked for again: one lookup and the 9 left.
    expect(w.statuses).toHaveLength(1 + 9)
  })
})

describe('ownCatchUpFailureReason', () => {
  it('gives every failure a short reason; the allowance has its own line', () => {
    expect(ownCatchUpFailureReason({ ok: false, status: 0 })).toBe('Could not reach Tinct. Check your connection, then retry.')
    expect(ownCatchUpFailureReason({ ok: false, status: 401 })).toBe('Your sign-in has expired. Sign in again, then retry.')
    expect(ownCatchUpFailureReason({ ok: false, status: 404 })).toMatch(/not in your account/)
    expect(ownCatchUpFailureReason({ ok: false, status: 413, chapter: 3 })).toBe('Chapter 3 is too long to send.')
    expect(ownCatchUpFailureReason({ ok: false, status: 429 })).toMatch(/Trying again shortly/)
    expect(ownCatchUpFailureReason({ ok: false, status: 503, resting: true })).toBe('AI is resting. Trying again shortly.')
    expect(ownCatchUpFailureReason({ ok: false, status: 500, chapter: 2, title: 'Preface' })).toBe('The summary stopped at “Preface” (error 500). Retry picks up from there.')
    expect(ownCatchUpFailureReason({ ok: false, status: 402, allowanceUsed: true })).toBeNull()
  })
})

describe('sampleCatchUpText', () => {
  it('never cuts a character in two', () => {
    const text = '𝔄'.repeat(5_000)
    for (const max of [999, 1_000, 1_001]) {
      const sampled = sampleCatchUpText(text, max)
      expect(sampled.length).toBeLessThanOrEqual(max)
      expect(/[\ud800-\udbff](?![\udc00-\udfff])|(?<![\ud800-\udbff])[\udc00-\udfff]/.test(sampled)).toBe(false)
    }
  })
})
