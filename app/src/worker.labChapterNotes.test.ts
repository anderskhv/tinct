import { afterEach, describe, expect, it, vi } from 'vitest'
import { COMPANION_MODEL, RECAP_FAST_MODEL } from './companionModel'
import { CHAPTER_NOTES_PROMPT_VERSIONS, chapterNotesCacheKey, parseChapterNotesBeats } from './chapterNotes'
import { resetBookRetrievalCache, type ChapterText } from './worker/lib/bookRetrieval'
import { CHAPTER_NOTES_MAX_TOKENS, CHAPTER_NOTES_MODEL, CHAPTER_NOTES_SYSTEM, handleLabChapterNotes, parseChapterNotesRequest } from './worker/routes/labChapterNotes'
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
    expect(payload).toMatchObject({ model: RECAP_FAST_MODEL, max_tokens: CHAPTER_NOTES_MAX_TOKENS.sofar })
    expect(payload).not.toHaveProperty('output_config')
    const user = (payload.messages as Array<{ content: string }>)[0].content
    expect(user).toContain('Victor flees.')
    expect(user).not.toContain('A LATER SECRET')
    await Promise.all(pending)
    expect([...cache.entries.keys()][0]).toContain(`/__lab-chapter-notes/${CHAPTER_NOTES_PROMPT_VERSIONS.sofar}/frank/original-en/2/sofar/`)
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
    expect(payload).toMatchObject({ model: COMPANION_MODEL, max_tokens: CHAPTER_NOTES_MAX_TOKENS.primer, output_config: { effort: 'low' } })
  })

  it('a primer is two beats, "Where we are" then "Watch for", in the In brief voice and spoiler-free', () => {
    const primer = CHAPTER_NOTES_SYSTEM.primer
    expect(primer).toMatch(/Give exactly two beats, in this order\. Never more than two beats\./)
    expect(primer).toMatch(/titled "Where we are" and says, from the PREVIOUS chapter only, where the story stands/)
    expect(primer).toMatch(/titled "Watch for" and gives one or two concrete pointers for the coming chapter: a person, object, place or question to keep an eye on, named specifically/)
    expect(primer).toContain('{"beats":[{"title":"Where we are","text":"…"},{"title":"Watch for","text":"…"}]}')
    expect(primer).toMatch(/one or two plain sentences/)
    expect(primer).toMatch(/Strictly spoiler-free: never state or hint at any event, outcome, turn or discovery in the coming chapter/)
    expect(primer).toContain('"Watch how the book closes on Mordecai\'s standing rather than Esther\'s", never "Mordecai\'s position is revealed"')
    expect(primer).toMatch(/Never use the verbs list, record, document, establish, detail, reveal or examine/)
    expect(primer).toMatch(/Do not invent meaning, motives or symbolism/)
    expect(primer).toMatch(/State only facts the text gives; when unsure of a name or number, leave it out\./)
    expect(primer).toMatch(/no morals or aphorisms, no "we" or "us" in the text/)
    expect(primer).not.toMatch(/"And"/)
    expect(primer).not.toMatch(/two or three beats/)
  })

  it('the sheet takes a two-beat primer as it comes', () => {
    const two = { beats: [{ title: 'Where we are', text: 'Victor has fled the room.' }, { title: 'Watch for', text: 'Watch Clerval at the coach.' }] }
    expect(parseChapterNotesBeats(two)).toEqual(two.beats)
  })

  it('malformed model output is a 502, never cached; no spend reservation is a calm 503', async () => {
    const cache = fakeCache()
    const bad = await handleLabChapterNotes(post({ bookId: 'frank', editionKey: 'original-en', chapterNumber: 2, kind: 'end' }), env, ctx().ctx, allow, { cache, fetchAnthropic: anthropic('Here is a summary without JSON.'), reserveGuestSpend: spend })
    expect(bad.status).toBe(502)
    expect(cache.entries.size).toBe(0)
    const resting = await handleLabChapterNotes(post({ bookId: 'frank', editionKey: 'original-en', chapterNumber: 2, kind: 'end' }), env, ctx().ctx, allow, { cache, fetchAnthropic: anthropic(), reserveGuestSpend: async () => false })
    expect(resting.status).toBe(503)
  })

  it('"in brief" asks each beat for what happens plus one text-grounded observation, in the same JSON shape', () => {
    const end = CHAPTER_NOTES_SYSTEM.end
    expect(end).toContain('{"beats":[{"title":"…","text":"…"}]}')
    expect(end).toMatch(/Give three or four beats, in order/)
    expect(end).toMatch(/Never more than four beats\./)
    expect(end).toMatch(/Never a generic label such as "Priests Listed", "Records Kept"/)
    expect(end).toMatch(/The first says what happens\. The second points out one specific thing in the text a reader would not get from a table of contents/)
    expect(end).toMatch(/telling detail, a surprising number or name, a tension, an irony, something left out/)
    expect(end).toMatch(/echo of something earlier/)
    expect(end).toMatch(/Do not invent facts, motives or symbolism/)
    expect(end).toMatch(/State only facts the text gives; when unsure of a name or number, leave it out\./)
    expect(end).toMatch(/Never use the verbs list, record, document, establish or detail/)
    expect(end).toMatch(/For genealogies, rolls and other lists, the interesting thing is in the specifics/)
    expect(end).toMatch(/Nothing from later chapters/)
    expect(end).toMatch(/no morals or aphorisms, no "we" or "us"/)
    expect(end).toMatch(/not X but Y/)
    // The example is invented, from no real book, so it cannot leak into a card.
    expect(end).toMatch(/Example beat \(from a different book, for tone only\)/)
    expect(end).not.toMatch(/Nehemiah|Jerusalem|Choirs/)
    // The bland-summary rule belongs to "so far" only.
    expect(end).not.toMatch(/no interpretation/)
    expect(CHAPTER_NOTES_SYSTEM.sofar).toMatch(/No praise, no interpretation/)
    // The example beat itself fits the parser's bounds untouched.
    const example = JSON.parse(end.slice(end.lastIndexOf('{"title"'), end.lastIndexOf('}') + 1))
    expect(example.title).toBe('The Letter in the Drawer')
    expect(parseChapterNotesBeats({ beats: [example] })).toEqual([example])
  })

  it('In brief and Primer use the companion Sonnet model, "so far" stays on the fast model', async () => {
    expect(CHAPTER_NOTES_MODEL).toEqual({ sofar: RECAP_FAST_MODEL, end: COMPANION_MODEL, primer: COMPANION_MODEL })
    const fetchAnthropic = anthropic()
    await handleLabChapterNotes(post({ bookId: 'frank', editionKey: 'original-en', chapterNumber: 2, kind: 'end' }), env, ctx().ctx, allow, { cache: null, fetchAnthropic, reserveGuestSpend: spend })
    const [payload] = fetchAnthropic.mock.calls[0] as unknown as [Record<string, unknown>]
    expect(payload).toMatchObject({ model: COMPANION_MODEL, max_tokens: CHAPTER_NOTES_MAX_TOKENS.end, output_config: { effort: 'low' } })
    expect(CHAPTER_NOTES_MAX_TOKENS.end).toBeGreaterThanOrEqual(CHAPTER_NOTES_MAX_TOKENS.sofar)
  })

  it('new prompts are new cache versions: old In brief and three-beat primers are never served', async () => {
    expect(CHAPTER_NOTES_PROMPT_VERSIONS).toEqual({ sofar: 'notes-v1', end: 'notes-v3', primer: 'notes-v2' })
    const base = { bookId: 'bible', editionKey: 'original-en', chapterNumber: 12 }
    expect(chapterNotesCacheKey({ ...base, kind: 'end' })).toBe('notes-v3/bible/original-en/12/end/all')
    expect(chapterNotesCacheKey({ ...base, kind: 'primer' })).toBe('notes-v2/bible/original-en/12/primer/all')
    const threeBeatPrimer = JSON.stringify({ beats: [{ title: 'Where we are', text: 'a' }, { title: 'Watch for', text: 'b' }, { title: 'And', text: 'c' }] })
    for (const [kind, old] of [['end', ['notes-v1', 'notes-v2']], ['primer', ['notes-v1']]] as const) {
      const cache = fakeCache(); const fetchAnthropic = anthropic(); const { ctx: c, pending } = ctx()
      for (const version of old) cache.entries.set(`https://tinct.app/__lab-chapter-notes/${version}/frank/original-en/2/${kind}/all`, kind === 'primer' ? threeBeatPrimer : beatsJson)
      const response = await handleLabChapterNotes(post({ bookId: 'frank', editionKey: 'original-en', chapterNumber: 2, kind }), env, c, allow, { cache, fetchAnthropic, reserveGuestSpend: spend })
      expect(await response.json()).toMatchObject({ kind, source: 'model', beats: JSON.parse(beatsJson).beats })
      const [payload] = fetchAnthropic.mock.calls[0] as unknown as [Record<string, unknown>]
      expect(payload.system).toBe(CHAPTER_NOTES_SYSTEM[kind])
      await Promise.all(pending)
      expect(cache.entries.has(`https://tinct.app/__lab-chapter-notes/${CHAPTER_NOTES_PROMPT_VERSIONS[kind]}/frank/original-en/2/${kind}/all`)).toBe(true)
    }
  })

  it('bounds beats: at most four, each title and text trimmed and non-empty', () => {
    expect(parseChapterNotesBeats({ beats: [{ title: ' A ', text: ' b ' }, { title: '', text: 'x' }, 1, { title: 'C', text: 'd' }, { title: 'E', text: 'f' }, { title: 'G', text: 'h' }, { title: 'I', text: 'j' }] }))
      .toEqual([{ title: 'A', text: 'b' }, { title: 'C', text: 'd' }, { title: 'E', text: 'f' }, { title: 'G', text: 'h' }])
    expect(parseChapterNotesBeats({ beats: [] })).toBeNull()
  })
})
