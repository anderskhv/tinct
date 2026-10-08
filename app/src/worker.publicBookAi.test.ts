import { afterEach, describe, expect, it, vi } from 'vitest'
import { RECAP_FAST_MODEL } from './companionModel'
import { catchUpPlan, catchUpUnits } from './catchUp'
import { createBookRetrieval, resetBookRetrievalCache } from './worker/lib/bookRetrieval'
import { handleLabCatchUp } from './worker/routes/labCatchUp'
import { handleLabChapterNotes } from './worker/routes/labChapterNotes'
import { handleLabRecap } from './worker/routes/labRecap'
import { bookAssets } from './worker/routes/publicBooks'

/**
 * AI chapter features for a book added through "Add to Tinct" (`pd-*`).
 * Its edition lives in the public-books R2 store and reaches the reader
 * through the Worker route `/data/editions/pd-…`, never the static asset
 * binding. Before the fix Primer, Recap and Catch me up asked the static
 * assets for it, got nothing, and answered 404 — the reader saw only Retry.
 * The model is a stub; nothing here reaches api.anthropic.com.
 */

const encoder = new TextEncoder()

class FakeR2 {
  store = new Map<string, Uint8Array>()
  async get(key: string) {
    const value = this.store.get(key)
    return value ? { key, size: value.length, body: value } : null
  }
  putJson(key: string, value: unknown) { this.store.set(key, encoder.encode(JSON.stringify(value))) }
}

const BOOK = 'pd-pg-1672'
const INTRODUCTION = ['In several of the dialogues of Plato, doubts have arisen.', 'The Gorgias is the first of them.']
const GORGIAS = ['CALLICLES: The wise man, as the proverb says, is late for a fray.', 'SOCRATES: And are we late for a feast?', 'A LATER SECRET.']

function setup() {
  const books = new FakeR2()
  books.putJson(`public-books/${BOOK}/original-en.json`, { chapters: [
    { number: 1, title: 'Introduction', paragraphs: INTRODUCTION },
    { number: 2, title: 'Gorgias', paragraphs: GORGIAS },
  ] })
  const assetPaths: string[] = []
  // The static assets, as in production: no added book is in them.
  const ASSETS = { fetch: async (request: Request) => { assetPaths.push(new URL(request.url).pathname); return new Response('not found', { status: 404 }) } }
  return { env: { ANTHROPIC_API_KEY: 'k', ASSETS, PUBLIC_BOOKS: books as unknown as R2Bucket }, assetPaths }
}

const ctx = { waitUntil: () => {} } as unknown as ExecutionContext
const allow = async () => true
const spend = async () => true
const post = (route: string, body: unknown) => new Request(`https://tinct.app${route}`, {
  method: 'POST', body: JSON.stringify(body), headers: { 'content-type': 'application/json', 'cf-connecting-ip': '203.0.113.9' },
})
const textAnswer = (text: string) => vi.fn(async () => Response.json({ stop_reason: 'end_turn', content: [{ type: 'text', text }], usage: { input_tokens: 400, output_tokens: 60 } }))
const entryAnswer = (summary: string) => vi.fn(async () => Response.json({
  model: RECAP_FAST_MODEL, stop_reason: 'tool_use', content: [{ type: 'tool_use', id: 'toolu_1', name: 'write_entry', input: { nothing_to_summarise: false, summary } }], usage: { input_tokens: 300, output_tokens: 20 },
}))
const userContent = (fetchAnthropic: ReturnType<typeof vi.fn>) => ((fetchAnthropic.mock.calls[0] as unknown as [{ messages: Array<{ content: string }> }])[0]).messages[0].content

afterEach(() => resetBookRetrievalCache())

describe('AI chapter features for an added (pd-) book', () => {
  it('Primer ("Before Introduction") reads the opening chapter from the public-books store', async () => {
    const { env } = setup()
    const fetchAnthropic = textAnswer(JSON.stringify({ beats: [{ title: 'The question', text: 'What rhetoric is.' }, { title: 'The speakers', text: 'Socrates meets Gorgias.' }] }))
    const response = await handleLabChapterNotes(post('/api/lab-chapter-notes', { bookId: BOOK, editionKey: 'original-en', chapterNumber: 1, kind: 'primer', bookTitle: 'Gorgias' }),
      env, ctx, allow, { cache: null, fetchAnthropic, reserveGuestSpend: spend })
    expect(response.status).toBe(200)
    expect(await response.json()).toMatchObject({ kind: 'primer', beats: [{ title: 'The question' }, { title: 'The speakers' }] })
    expect(userContent(fetchAnthropic)).toContain('doubts have arisen')
  })

  it('Recap this chapter ("in brief") reads the chapter from the public-books store', async () => {
    const { env } = setup()
    const fetchAnthropic = textAnswer(JSON.stringify({ beats: [{ title: 'Late', text: 'Callicles teases Socrates.' }, { title: 'Feast', text: 'Socrates answers.' }] }))
    const response = await handleLabChapterNotes(post('/api/lab-chapter-notes', { bookId: BOOK, editionKey: 'original-en', chapterNumber: 2, kind: 'end' }),
      env, ctx, allow, { cache: null, fetchAnthropic, reserveGuestSpend: spend })
    expect(response.status).toBe(200)
    expect(userContent(fetchAnthropic)).toContain('late for a fray')
  })

  it('Catch me up on "Gorgias": the Introduction entry the client plans is served', async () => {
    const { env } = setup()
    const chapters = [{ number: 1, title: 'Introduction' }, { number: 2, title: 'Gorgias' }]
    const plan = catchUpPlan({ bookId: BOOK, editionKey: 'original-en', bookTitle: 'Gorgias', units: catchUpUnits({ title: 'Gorgias', chapters, bible: false }), chapters, chapterNumber: 2, paragraphIndex: 0 })
    expect(plan.map(entry => entry.title)).toEqual(['Introduction'])
    const fetchAnthropic = entryAnswer('An editor introduces the dialogue on rhetoric.')
    const response = await handleLabCatchUp(post('/api/lab-catch-up', plan[0].request), env, ctx, allow, { cache: null, fetchAnthropic, reserveGuestSpend: spend })
    expect(response.status).toBe(200)
    expect(await response.json()).toMatchObject({ summary: 'An editor introduces the dialogue on rhetoric.', title: 'Introduction' })
    const content = userContent(fetchAnthropic)
    expect(content).toContain('doubts have arisen')
    expect(content).not.toContain('A LATER SECRET')
  })

  it('Recap / Prepare (/api/lab-recap) reads the chapter from the public-books store', async () => {
    const { env } = setup()
    const fetchAnthropic = textAnswer('Callicles and Socrates trade a proverb about arriving late.')
    const response = await handleLabRecap(post('/api/lab-recap', { bookId: BOOK, editionKey: 'original-en', chapterNumber: 2, paragraphIndex: 1, previousChapterNumber: 1, bookTitle: 'Gorgias' }),
      env, ctx, allow, { cache: null, fetchAnthropic, reserveGuestSpend: spend })
    expect(response.status).toBe(200)
    expect(userContent(fetchAnthropic)).toContain('late for a fray')
  })

  it('the companion\'s read_chapter tool reads an added book through the same binding', async () => {
    const { env } = setup()
    const retrieval = createBookRetrieval({ assets: bookAssets(env), origin: 'https://tinct.app', book: { bookId: BOOK, editionKey: 'original-en' } })
    expect((await retrieval.chapterText(1))?.paragraphs).toEqual(INTRODUCTION)
    expect((await retrieval.editionIndex())?.chapters.map(chapter => chapter.title)).toEqual(['Introduction', 'Gorgias'])
  })

  it('the static assets alone never had the text (the production failure), and other books still come from them', async () => {
    const { env, assetPaths } = setup()
    const raw = createBookRetrieval({ assets: env.ASSETS, origin: 'https://tinct.app', book: { bookId: BOOK, editionKey: 'original-en' } })
    expect(await raw.chapterText(1)).toBeNull()
    resetBookRetrievalCache()
    assetPaths.length = 0
    const other = await bookAssets(env).fetch(new Request('https://tinct.app/data/editions-chapters/anna-original-en/manifest.json'))
    expect(other.status).toBe(404)
    expect(assetPaths).toEqual(['/data/editions-chapters/anna-original-en/manifest.json'])
  })
})
