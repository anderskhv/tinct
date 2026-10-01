import { afterEach, describe, expect, it, vi } from 'vitest'
import { RECAP_FAST_MODEL } from './companionModel'
import { CHAPTER_NOTES_PROMPT_VERSION, parseChapterNotesBeats } from './chapterNotes'
import { resetBookRetrievalCache, type ChapterText } from './worker/lib/bookRetrieval'
import { CHAPTER_NOTES_MAX_TOKENS, handleLabChapterNotes, parseChapterNotesRequest } from './worker/routes/labChapterNotes'
import type { RecapCache } from './worker/routes/labRecap'

const chapters: Record<number, ChapterText> = {
  1: { number: 1, title: 'Chapter 1', paragraphs: ['Victor studies.', 'He works for two years.'] },
  2: { number: 2, title: 'Chapter 2', paragraphs: ['The creature wakes.', 'Victor flees.', 'Clerval arrives.', 'A LATER SECRET.'] },
}
function fakeAssets() {
  return { fetch: async (request: Request) => {
    const path = new URL(request.url).pathname
    if (path.endsWith('/manifest.json')) return Response.json({ chapters: Object.values(chapters).map(c => ({ number: c.number, title: c.title, path: `ch${String(c.number).padStart(4, '0')}.json` })) })
    const match = /ch(\d{4})\.json$/.exec(path)
    const chapter = match ? chapters[Number(match[1])] : undefined
    return chapter ? Response.json(chapter) : new Response('not found', { status: 404 })
  } }
}
function fakeCache(): RecapCache & { entries: Map<string, string> } {
  const entries = new Map<string, string>()
  return { entries, match: async (r: Request) => { const b = entries.get(r.url); return b === undefined ? undefined : new Response(b) }, put: async (r: Request, res: Response) => { entries.set(r.url, await res.text()) } }
}
function ctx() { const pending: Promise<unknown>[] = []; return { ctx: { waitUntil: (p: Promise<unknown>) => { pending.push(p) } } as unknown as ExecutionContext, pending } }
const post = (body: unknown) => new Request('https://tinct.app/api/lab-chapter-notes', { method: 'POST', body: JSON.stringify(body), headers: { 'content-type': 'application/json', 'cf-connecting-ip': '203.0.113.9' } })
const beatsJson = JSON.stringify({ beats: [{ title: 'The creature wakes', text: 'Victor sees it stir.' }, { title: 'Flight', text: 'He runs from the room.' }] })
const anthropic = (text = beatsJson) => vi.fn(async () => Response.json({ stop_reason: 'end_turn', content: [{ type: 'text', text }], usage: { input_tokens: 500, output_tokens: 60 } }))
const env = { ANTHROPIC_API_KEY: 'k', ASSETS: fakeAssets() }
const allow = async () => true, spend = async () => true
afterEach(() => resetBookRetrievalCache())

describe('POST /api/lab-chapter-notes', () => {
  it('parses a bounded request; "so far" needs a paragraph', () => {
    expect(parseChapterNotesRequest({ bookId: 'frank', editionKey: 'original-en', chapterNumber: 2, kind: 'end' })).toMatchObject({ kind: 'end', paragraphIndex: 0 })
    expect(parseChapterNotesRequest({ bookId: 'frank', editionKey: 'original-en', chapterNumber: 2, kind: 'sofar' })).toBeNull()
    expect(parseChapterNotesRequest({ bookId: 'frank', editionKey: 'original-en', chapterNumber: 2, kind: 'other' })).toBeNull()
  })

  it('"so far" covers the chapter only through the reader\'s paragraph, with the fast model, then serves the cache', async () => {
    const cache = fakeCache(); const fetchAnthropic = anthropic(); const { ctx: c, pending } = ctx()
    const response = await handleLabChapterNotes(post({ bookId: 'frank', editionKey: 'original-en', chapterNumber: 2, kind: 'sofar', paragraphIndex: 1 }), env, c, allow, { cache, fetchAnthropic, reserveGuestSpend: spend })
    expect(response.status).toBe(200)
    expect(await response.json()).toMatchObject({ kind: 'sofar', source: 'model', beats: [{ title: 'The creature wakes' }, { title: 'Flight' }] })
    const [payload] = fetchAnthropic.mock.calls[0] as unknown as [Record<string, unknown>]
    expect(payload).toMatchObject({ model: RECAP_FAST_MODEL, max_tokens: CHAPTER_NOTES_MAX_TOKENS })
    const user = (payload.messages as Array<{ content: string }>)[0].content
    expect(user).toContain('Victor flees.')
    expect(user).not.toContain('A LATER SECRET')
    await Promise.all(pending)
    expect([...cache.entries.keys()][0]).toContain(`/__lab-chapter-notes/${CHAPTER_NOTES_PROMPT_VERSION}/frank/original-en/2/sofar/`)
    const again = await handleLabChapterNotes(post({ bookId: 'frank', editionKey: 'original-en', chapterNumber: 2, kind: 'sofar', paragraphIndex: 1 }), env, ctx().ctx, allow, { cache, fetchAnthropic, reserveGuestSpend: spend })
    expect(await again.json()).toMatchObject({ source: 'cache' })
    expect(fetchAnthropic).toHaveBeenCalledTimes(1)
  })

  it('a primer sees the previous chapter as read and the coming one as not to be revealed', async () => {
    const fetchAnthropic = anthropic()
    await handleLabChapterNotes(post({ bookId: 'frank', editionKey: 'original-en', chapterNumber: 2, kind: 'primer' }), env, ctx().ctx, allow, { cache: null, fetchAnthropic, reserveGuestSpend: spend })
    const [payload] = fetchAnthropic.mock.calls[0] as unknown as [Record<string, unknown>]
    const user = (payload.messages as Array<{ content: string }>)[0].content
    expect(user).toContain('PREVIOUS CHAPTER (what the reader has read)')
    expect(user).toContain('Victor studies.')
    expect(user).toContain('never reveal its events')
    expect(String(payload.system)).toMatch(/spoiler-free/)
  })

  it('malformed model output is a 502, never cached; no spend reservation is a calm 503', async () => {
    const cache = fakeCache()
    const bad = await handleLabChapterNotes(post({ bookId: 'frank', editionKey: 'original-en', chapterNumber: 2, kind: 'end' }), env, ctx().ctx, allow, { cache, fetchAnthropic: anthropic('Here is a summary without JSON.'), reserveGuestSpend: spend })
    expect(bad.status).toBe(502)
    expect(cache.entries.size).toBe(0)
    const resting = await handleLabChapterNotes(post({ bookId: 'frank', editionKey: 'original-en', chapterNumber: 2, kind: 'end' }), env, ctx().ctx, allow, { cache, fetchAnthropic: anthropic(), reserveGuestSpend: async () => false })
    expect(resting.status).toBe(503)
  })

  it('bounds beats: at most four, each title and text trimmed and non-empty', () => {
    expect(parseChapterNotesBeats({ beats: [{ title: ' A ', text: ' b ' }, { title: '', text: 'x' }, 1, { title: 'C', text: 'd' }, { title: 'E', text: 'f' }, { title: 'G', text: 'h' }, { title: 'I', text: 'j' }] }))
      .toEqual([{ title: 'A', text: 'b' }, { title: 'C', text: 'd' }, { title: 'E', text: 'f' }, { title: 'G', text: 'h' }])
    expect(parseChapterNotesBeats({ beats: [] })).toBeNull()
  })
})
