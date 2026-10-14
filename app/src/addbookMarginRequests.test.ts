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
})
