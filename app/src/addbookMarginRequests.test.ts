/**
 * The PDF reader's requests for the margin's actions (docs/margin/PROMPTS.md): what
 * public/lab/addbook/js/tinct-api.js sends for each intent, read back by the Worker's own
 * parser (companionRequest.ts). Every PDF request carries kind "pdf" and its pages with their
 * printed labels. fetch is mocked: no network and no AI.
 */
// @vitest-environment jsdom
import { createRequire } from 'node:module'
import { resolve } from 'node:path'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { parseCompanionRequest } from './companion/companionRequest'

const require = createRequire(import.meta.url)
const ROOT = resolve(__dirname, '../..') + '/'
interface Api {
  companion(intent: string, o: Record<string, unknown>): Promise<{ text: string }>
  ask(input: unknown, o: Record<string, unknown>): Promise<{ text: string }>
  companionRequest(intent: string, o: Record<string, unknown>): Record<string, unknown>
}
let A: Api
beforeAll(() => {
  require(ROOT + 'app/public/lab/addbook/js/tinct-api.js')
  A = (globalThis as unknown as { TinctAI: Api }).TinctAI
})

/* ---------- Requests: what tinct-api.js sends for each action, read by the Worker's parser ---------- */
describe('the requests the PDF reader sends (fetch mocked)', () => {
  afterEach(() => { vi.unstubAllGlobals(); localStorage.clear() })
  const pdf = { pages: [{ n: 'xi', text: 'Page xi text.' }, { n: '12', text: 'The passage on page 12.' }, { n: 13, text: 'Page 13.' }], at: 1 }
  const book = { title: 'Probability and Inference', author: 'D. M.', chapter: 'Chapter 1', page: 14, pages: 640 }
  function capture(reply: string | ((body: Record<string, unknown>) => Response)) {
    const sent: Array<{ url: string; body: Record<string, unknown> }> = []
    vi.stubGlobal('fetch', vi.fn(async (url: string, init: RequestInit) => {
      const body = JSON.parse(String(init.body))
      sent.push({ url, body })
      if (typeof reply === 'function') return reply(body)
      return new Response(JSON.stringify({ content: [{ type: 'text', text: reply }] }), { headers: { 'Content-Type': 'application/json' } })
    }))
    return sent
  }
  it('every passage action: kind "pdf", the pages with their printed labels, the reader’s page, the selection; the Worker reads it as a PDF', async () => {
    for (const intent of ['simplify', 'factcheck', 'counterpoint', 'quiz']) {
      const sent = capture('MOCK.')
      await A.companion(intent, { book, pdf, selection: 'The passage on page 12.' })
      const { url, body } = sent[0]
      expect(url).toBe('/api/lab-chat')
      const companion = body.companion as Record<string, unknown>
      expect(companion).toMatchObject({ intent, selection: 'The passage on page 12.', context: { kind: 'pdf', pages: pdf.pages, paragraphIndex: 1, bookTitle: book.title, lookups: false } })
      const parsed = parseCompanionRequest(companion)
      expect(parsed, intent).not.toBeNull()
      expect(parsed!.pdf).toBe(true)
      expect(parsed!.context!.paragraphs[1]).toBe('<page n="12">\nThe passage on page 12.\n</page>')
      expect(parsed!.context!.paragraphIndex).toBe(1)
    }
  })
  it('define_sense sends the word and its senses; quiz_check the question, expected answer, why and the reader’s answer', async () => {
    let sent = capture('{"sense": 2}')
    await A.companion('define_sense', { book, pdf, selection: 'variance', senses: ['The fact of being different.', 'In statistics, the spread.', 'Official permission.'] })
    expect(parseCompanionRequest(sent[0].body.companion)).toMatchObject({ intent: 'define_sense', selection: 'variance', senses: ['The fact of being different.', 'In statistics, the spread.', 'Official permission.'], pdf: true })
    sent = capture('{"verdict":"right","feedback":"Yes."}')
    await A.companion('quiz_check', { book, pdf, quiz: { question: 'Variance?', expected: '2.5', why: 'Nf(1 − f).', answer: '2.5' } })
    expect(parseCompanionRequest(sent[0].body.companion)).toMatchObject({ intent: 'quiz_check', quizCheck: { question: 'Variance?', expected: '2.5', why: 'Nf(1 − f).', answer: '2.5' }, pdf: true })
  })
  it('Ask, Explain and the whole-PDF chat send today’s ask with the PDF’s pages, its instructions in the first message', async () => {
    const sent = capture('MOCK.')
    await A.ask([{ role: 'user', content: 'You are Tinct’s reading companion. The passage they selected.' }, { role: 'assistant', content: 'Earlier answer.' }, { role: 'user', content: 'Why?' }], { book: { ...book, pdf } })
    const body = sent[0].body as { messages: Array<{ role: string; content: string }>; companion: Record<string, unknown> }
    expect(body.messages.map(m => m.role)).toEqual(['user', 'assistant', 'user'])
    expect(body.messages[0].content).toContain('The passage they selected.')
    const parsed = parseCompanionRequest(body.companion)
    expect(parsed).toMatchObject({ intent: 'ask', pdf: true })
    expect(parsed!.context!.paragraphs).toHaveLength(3)
    // An EPUB (no pages) keeps today's shape: its text in paragraphs, never kind "pdf".
    const epub = capture('MOCK.')
    await A.ask([{ role: 'user', content: 'Context text.' }, { role: 'user', content: 'Why?' }], { book })
    expect((epub[0].body.companion as { context: Record<string, unknown> }).context.kind).toBeUndefined()
    expect(parseCompanionRequest(epub[0].body.companion)!.pdf).toBeUndefined()
  })
  it('a page label that is not a safe label is sent as the page’s number', () => {
    const req = A.companionRequest('simplify', { book, pdf: { pages: [{ n: 7, text: 'a' }], at: 0 }, selection: 's' }) as { companion: { context: { pages: Array<{ n: unknown }> } } }
    expect(req.companion.context.pages[0].n).toBe(7)
  })
  it('Fact-check streams: "Checking sources…" from the tinct_status event, then the answer', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(
      'event: tinct_status\ndata: {"type":"tinct_status","text":"Checking sources…"}\n\n' +
      'event: content_block_delta\ndata: {"type":"content_block_delta","delta":{"type":"text_delta","text":"Holds. Yes."}}\n\n' +
      'event: message_stop\ndata: {"type":"message_stop"}\n\n', { headers: { 'Content-Type': 'text/event-stream' } })))
    const statuses: string[] = []
    const texts: string[] = []
    const res = await A.companion('factcheck', { book, pdf, selection: 'x', stream: true, onStatus: (s: string) => statuses.push(s), onText: ({ text }: { text: string }) => texts.push(text) })
    expect(statuses).toEqual(['Checking sources…'])
    expect(res.text).toBe('Holds. Yes.')
    expect(texts).toEqual(['Holds. Yes.'])
  })
  // FIXES-2026-10-15 A1: the whole file rides on every margin request, exactly as given, for the cached prefix.
  it('every margin request and the whole-PDF ask carry the document unchanged; the Worker reads it', async () => {
    const document = { kind: 'pdf', units: [{ n: 'xi', text: 'Page xi.' }, { n: 12, text: 'Page 12.' }] }
    const bodies: string[] = []
    for (const intent of ['explain', 'simplify', 'define_sense', 'quiz_check', 'chapter']) {
      const sent = capture('MOCK.')
      await A.companion(intent, { book, pdf, document, selection: 'w', senses: ['a', 'b'], quiz: { question: 'q', expected: 'e', answer: 'a' }, chapter: { action: { kind: 'primer', unitKey: 'all', unitTitle: 'T' } } })
      expect((sent[0].body.companion as Record<string, unknown>).document, intent).toEqual(document)
      bodies.push(JSON.stringify((sent[0].body.companion as Record<string, unknown>).document))
    }
    const sent = capture('MOCK.')
    await A.ask([{ role: 'user', content: 'Rules.' }, { role: 'user', content: 'Why?' }], { book: { ...book, pdf }, document })
    bodies.push(JSON.stringify((sent[0].body.companion as Record<string, unknown>).document))
    expect(new Set(bodies).size).toBe(1)
    expect(parseCompanionRequest(sent[0].body.companion)!.document).toEqual({ kind: 'pdf', units: [{ label: 'xi', text: 'Page xi.' }, { label: '12', text: 'Page 12.' }], cut: false })
  })
  it('keeps the document within its bound, and sends none without one', async () => {
    const api = A as unknown as { DOCUMENT_CHARS: number; documentContext(d: unknown): { units: unknown[] } | null }
    const big = { kind: 'pdf', units: Array.from({ length: 200 }, (_, i) => ({ n: i + 1, text: 'x'.repeat(5_000) })) }
    expect(api.documentContext(big)!.units.length).toBe(Math.floor(api.DOCUMENT_CHARS / 5_000))
    expect(api.documentContext({ kind: 'pdf', units: [] })).toBeNull()
    const sent = capture('MOCK.')
    await A.companion('simplify', { book, pdf, selection: 's' })
    expect(sent[0].body.companion).not.toHaveProperty('document')
  })
  it('a refusal is the card’s error (code refused), without the words already shown', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(
      'event: content_block_delta\ndata: {"type":"content_block_delta","delta":{"type":"text_delta","text":"Begun"}}\n\n' +
      'event: error\ndata: {"type":"error","error":{"type":"refusal","message":"The reply was interrupted. Please try again."}}\n\n', { headers: { 'Content-Type': 'text/event-stream' } })))
    const streamed = await A.companion('counterpoint', { book, pdf, selection: 'x', stream: true }).catch(e => e)
    expect(streamed.code).toBe('refused')
    expect(streamed.text).toBeUndefined()
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ type: 'error', error: { type: 'refusal', message: 'x' } }), { status: 502, headers: { 'Content-Type': 'application/json' } })))
    const plain = await A.companion('quiz', { book, pdf, selection: 'x' }).catch(e => e)
    expect(plain.code).toBe('refused')
  })
  it('a cut-off answer (the Worker\'s cut_off) is the card\'s error (code cut_off), without the words already shown', async () => {
    const shown: string[] = []
    vi.stubGlobal('fetch', vi.fn(async () => new Response(
      'event: content_block_delta\ndata: {"type":"content_block_delta","delta":{"type":"text_delta","text":"The strongest objection is"}}\n\n' +
      'event: message_stop\ndata: {"type":"message_stop"}\n\n' +
      'event: error\ndata: {"type":"error","error":{"type":"cut_off","message":"The reply was interrupted. Please try again."}}\n\n', { headers: { 'Content-Type': 'text/event-stream' } })))
    const streamed = await A.companion('counterpoint', { book, pdf, selection: 'x', stream: true, onText: ({ text }: { text: string }) => shown.push(text) }).catch(e => e)
    expect(shown).toEqual(['The strongest objection is'])
    expect(streamed.code).toBe('cut_off')
    expect(streamed.text).toBeUndefined()
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ type: 'error', error: { type: 'cut_off', message: 'x' } }), { status: 502, headers: { 'Content-Type': 'application/json' } })))
    const plain = await A.companion('chapter', { book, pdf, chapter: { action: { kind: 'primer', unitKey: 'all', unitTitle: 'All' } } }).catch(e => e)
    expect(plain.code).toBe('cut_off')
    // Any other interrupted stream keeps its words (the card shows them with the error), as before.
    vi.stubGlobal('fetch', vi.fn(async () => new Response(
      'event: content_block_delta\ndata: {"type":"content_block_delta","delta":{"type":"text_delta","text":"Begun"}}\n\n' +
      'event: error\ndata: {"type":"error","error":{"type":"upstream_error","message":"x"}}\n\n', { headers: { 'Content-Type': 'text/event-stream' } })))
    const other = await A.companion('counterpoint', { book, pdf, selection: 'x', stream: true }).catch(e => e)
    expect(other).toMatchObject({ code: 'failed', text: 'Begun' })
  })
})

/* ---------- Reliability (retest after train 2): one automatic retry, only before any words are shown ---------- */
describe('one retry on a 502 or a dropped stream (fetch mocked)', () => {
  afterEach(() => { vi.unstubAllGlobals(); vi.useRealTimers(); localStorage.clear() })
  const pdf = { pages: [{ n: 1, text: 'Page one.' }], at: 0 }
  const book = { title: 'GAN', author: 'G.', chapter: 'Page 1', page: 1, pages: 9 }
  const SSE = { headers: { 'Content-Type': 'text/event-stream' } }
  const delta = (text: string) => `event: content_block_delta\ndata: ${JSON.stringify({ type: 'content_block_delta', delta: { type: 'text_delta', text } })}\n\n`
  const stop = 'event: message_stop\ndata: {"type":"message_stop"}\n\n'
  const error = (type: string) => `event: error\ndata: ${JSON.stringify({ type: 'error', error: { type, message: 'x' } })}\n\n`
  const bad = (status: number, type = 'upstream_error') => new Response(JSON.stringify({ type: 'error', error: { type, message: 'x' } }), { status, headers: { 'Content-Type': 'application/json' } })
  /** Answers each request in turn with the next reply; records each request's retry header. */
  function replies(...list: Array<() => Response>) {
    const retry: Array<string | null> = []
    vi.stubGlobal('fetch', vi.fn(async (_url: string, init: RequestInit) => {
      retry.push(new Headers(init.headers).get('x-tinct-retry'))
      const next = list.shift()
      if (!next) throw new Error('no more replies')
      return next()
    }))
    return retry
  }
  it('a 502 is asked once more, marked as the retry, and its answer is the card\'s', async () => {
    const retry = replies(() => bad(502), () => new Response(delta('Plainly put.') + stop, SSE))
    const texts: string[] = []
    const res = await A.companion('simplify', { book, pdf, selection: 'x', stream: true, onText: ({ text }: { text: string }) => texts.push(text) })
    expect(res.text).toBe('Plainly put.')
    expect(texts).toEqual(['Plainly put.'])
    expect(retry).toEqual([null, '1'])
  })
  it('only once: a second 502 is the card\'s error', async () => {
    const retry = replies(() => bad(502), () => bad(502))
    const e = await A.companion('define', { book, pdf, selection: 'minimax' }).catch(x => x)
    expect(e.code).toBe('failed')
    expect(retry).toHaveLength(2)
  })
  it('a stream that fails or drops before any words is asked once more', async () => {
    for (const first of [error('upstream_error'), error('overloaded_error'), '', 'event: message_start\ndata: {"type":"message_start"}\n\n']) {
      const retry = replies(() => new Response(first, SSE), () => new Response(delta('Holds.') + stop, SSE))
      const res = await A.companion('factcheck', { book, pdf, selection: 'x', stream: true })
      expect(res.text, first).toBe('Holds.')
      expect(retry, first).toEqual([null, '1'])
    }
    // The connection breaks mid-read.
    const broken = new ReadableStream({ pull(c) { c.error(new TypeError('network error')) } })
    const retry = replies(() => new Response(broken, SSE), () => new Response(delta('Asked again.') + stop, SSE))
    expect((await A.ask([{ role: 'user', content: 'Rules.' }, { role: 'user', content: 'Why?' }], { book: { ...book, pdf } })).text).toBe('Asked again.')
    expect(retry).toEqual([null, '1'])
  })
  it('never once words are shown: the error keeps them, and a stream that stops early is never taken for a whole answer', async () => {
    let retry = replies(() => new Response(delta('Begun') + error('upstream_error'), SSE))
    expect(await A.companion('counterpoint', { book, pdf, selection: 'x', stream: true }).catch(x => x)).toMatchObject({ code: 'failed', text: 'Begun' })
    expect(retry).toHaveLength(1)
    retry = replies(() => new Response(delta('Half an ans'), SSE))
    expect(await A.companion('simplify', { book, pdf, selection: 'x', stream: true }).catch(x => x)).toMatchObject({ code: 'dropped', text: 'Half an ans' })
    expect(retry).toHaveLength(1)
  })
  it('never for a refusal, a cut-off, a limit, a sign-in, a bad request, or when the caller turns it off', async () => {
    const cases: Array<[() => Response, string]> = [
      [() => bad(502, 'refusal'), 'refused'], [() => bad(502, 'cut_off'), 'cut_off'],
      [() => new Response(error('refusal'), SSE), 'refused'], [() => new Response(error('cut_off'), SSE), 'cut_off'],
      [() => bad(429), 'rate_limited'], [() => bad(503), 'busy'], [() => bad(402), 'quota'], [() => bad(400), 'bad_request'], [() => bad(413), 'prompt_too_large'],
    ]
    for (const [reply, code] of cases) {
      const retry = replies(reply, () => new Response(delta('Wrong.') + stop, SSE))
      const e = await A.companion('counterpoint', { book, pdf, selection: 'x', stream: true }).catch(x => x)
      expect(e.code, code).toBe(code)
      expect(retry, code).toHaveLength(1)
    }
    const retry = replies(() => bad(502), () => new Response(JSON.stringify({ content: [{ type: 'text', text: '{}' }] })))
    expect((await A.companion('chapter', { book, pdf, retry: false, chapter: { action: { kind: 'primer', unitKey: 'all', unitTitle: 'All' } } }).catch(x => x)).code).toBe('failed')
    expect(retry).toHaveLength(1)
  })
  it('a card closed while it waits to retry is cancelled, not asked again', async () => {
    const ctl = new AbortController()
    const retry = replies(() => { setTimeout(() => ctl.abort(), 50); return bad(502) }, () => new Response(delta('Too late.') + stop, SSE))
    const e = await A.companion('simplify', { book, pdf, selection: 'x', stream: true, signal: ctl.signal }).catch(x => x)
    expect(e.code).toBe('cancelled')
    expect(retry).toHaveLength(1)
  })
})
