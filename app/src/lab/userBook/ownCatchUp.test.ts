import { afterEach, describe, expect, it, vi } from 'vitest'
import { buildOwnCatchUp, ownCatchUpPlan } from './ownCatchUp'
import type { UserBookChapter } from './userEdition'
import { handleOwnCatchUp, type OwnCatchUpEnv } from '../../worker/routes/ownCatchUp'
import { fakeUserBooksBucket } from '../../worker/fakeUserBooksBucket'
import { OWN_CATCH_UP_MAX_CHAPTER_CHARS } from '../../ownCatchUp'

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
