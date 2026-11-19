/**
 * A question on a PDF too long to send whole (docs/margin/FIXES-2026-10-15.md, long books, item 8):
 * the chapter the reader is in and the contents are the cached prefix, the same for every question
 * in that chapter; the passages a search of the whole book found for the question come after the
 * breakpoint; the prompt says "from general knowledge" when an answer is not from the book. The
 * book reader's requests are unchanged. Every provider call is mocked; nothing reaches Anthropic.
 */
// @vitest-environment jsdom
import { createRequire } from 'node:module'
import { resolve } from 'node:path'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { parseCompanionRequest } from './companion/companionRequest'
import { GENERAL_KNOWLEDGE_RULE, MARGIN_PASSAGE_CHARS, MARGIN_PASSAGES, MARGIN_PASSAGES_CHARS, parseMarginPassages } from './companion/marginContext'
import { createAllowanceGate } from './worker/lib/aiAllowance'
import { handleChat } from './worker/routes/chat'

const userId = '11111111-1111-4111-8111-111111111111'
const reader = async () => ({ id: userId, email: 'reader@example.com' })
const allow = async () => true
const env = { ANTHROPIC_API_KEY: 'anthropic-key', SUPABASE_URL: 'https://example.supabase.co', SUPABASE_SERVICE_ROLE_KEY: 'service-role' }
const gateOff = { allowanceGate: createAllowanceGate({}, false) }

/** Chapter 16 of a 585-page book (printed 466–496), its contents, and the search's passages for two questions. */
const CHAPTER = Array.from({ length: 31 }, (_, i) => ({ n: String(466 + i), text: `Chapter 16 page ${466 + i}. TD-Gammon learned by playing against itself.` }))
const TOC = [{ title: '6 Temporal-Difference Learning', n: '156' }, { title: '6.4 Sarsa: On-policy TD Control', n: '175' }, { title: '16 Applications and Case Studies', n: '466' }, { title: 'Index', n: '548' }]
const document = { kind: 'pdf', units: CHAPTER, part: { toc: TOC, total: 585 } }
const SARSA = [{ n: '175', text: 'This quintuple gives rise to the name Sarsa for the algorithm, which we introduce here.' }, { n: '281', text: 'The example of episodic semi-gradient Sarsa on the mountain car task.' }]
const EYES = [{ n: '440', text: 'Dopamine neurons respond to reward prediction errors.' }]
const pdfContext = (at: string) => ({ kind: 'pdf', bookTitle: 'Learning from Reward', bookAuthor: 'Ann Example', chapterLabel: `Page ${at}`, pages: [{ n: at, text: `Page ${at}.` }], paragraphIndex: 0, totalPages: 585 })
const ask = (question: string, passages: unknown, doc: unknown = document) => ({ companion: { intent: 'ask', scope: 'whole', context: pdfContext('468'), document: doc, ...(passages ? { passages } : {}) }, messages: [{ role: 'user', content: question }] })

function context() {
  const pending: Promise<unknown>[] = []
  return { ctx: { waitUntil: (promise: Promise<unknown>) => { pending.push(Promise.resolve(promise)) } } as unknown as ExecutionContext, pending }
}
function stubFetch() {
  const anthropic: Array<Record<string, unknown>> = []
  vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input)
    if (url.includes('/rest/v1/ai_usage_events')) return new Response(null, { status: 201 })
    if (url.includes('/rest/v1/profiles')) return Response.json([{ messages_used_this_period: 0, message_balance: 5, subscription_status: 'active', subscription_period_end: null, created_at: '2026-06-01T12:00:00Z' }])
    if (url.includes('/rpc/use_message')) return Response.json({})
    if (url === 'https://api.anthropic.com/v1/messages') {
      anthropic.push(JSON.parse(String(init?.body)))
      return Response.json({ content: [{ type: 'text', text: 'An answer.' }], stop_reason: 'end_turn', usage: { input_tokens: 10, output_tokens: 5 } })
    }
    return Response.json({ error: 'unexpected fetch' }, { status: 500 })
  }))
  return anthropic
}
async function send(body: unknown) {
  const { ctx, pending } = context()
  const response = await handleChat(new Request('https://tinct.app/api/chat', { method: 'POST', body: JSON.stringify(body), headers: { 'content-type': 'application/json', 'cf-connecting-ip': '203.0.113.9' } }), env, ctx, reader, allow, gateOff)
  await response.text()
  await Promise.all(pending)
  return response.status
}
type SystemBlock = { type: string; text: string; cache_control?: { type: string } }
const prefix = (body: Record<string, unknown>) => {
  const system = body.system as SystemBlock[]
  // Up to the last breakpoint: a long document's prefix is two cached blocks (contents, then the part; round 1, 15 Oct).
  const end = system.map(block => Boolean(block.cache_control)).lastIndexOf(true)
  return JSON.stringify({ model: body.model, tools: body.tools ?? null, system: system.slice(0, end + 1) })
}

afterEach(() => { vi.unstubAllGlobals() })

describe('a question on a long PDF (FIXES long books, item 8)', () => {
  it('before the breakpoints: the rules and the contents with printed pages, then the chapter; after them: the place, the passages, the task; the question last', async () => {
    const anthropic = stubFetch()
    expect(await send(ask('Where is Sarsa introduced?', SARSA))).toBe(200)
    const system = anthropic[0].system as SystemBlock[]
    expect(system).toHaveLength(3)
    expect(system[0].cache_control).toEqual({ type: 'ephemeral' })
    expect(system[1].cache_control).toEqual({ type: 'ephemeral' })
    expect(system[0].text).toContain('<contents>\n6 Temporal-Difference Learning (page 156)\n6.4 Sarsa: On-policy TD Control (page 175)\n16 Applications and Case Studies (page 466)\nIndex (page 548)\n</contents>')
    expect(system[1].text).toContain('The part the reader is in: pages 466 to 496.')
    expect(system[1].text).toContain('<page n="496">\nChapter 16 page 496.')
    // Nothing of the question's search sits before a breakpoint.
    for (const block of system.slice(0, 2)) {
      expect(block.text).not.toContain('<passages>')
      expect(block.text).not.toContain('gives rise to the name Sarsa')
    }
    const after = system[2].text
    expect(after).toContain('<passages>\n<passage n="175">\nThis quintuple gives rise to the name Sarsa for the algorithm, which we introduce here.\n</passage>\n<passage n="281">')
    expect(after.indexOf('The reader is on page 468 of 585.')).toBeLessThan(after.indexOf('<passages>'))
    expect(after.indexOf('</passages>')).toBeLessThan(after.indexOf('The reader is asking about the whole document'))
    expect(after).toContain('cite each part as the page it is on')
    const messages = anthropic[0].messages as Array<{ role: string; content: string }>
    expect(messages.at(-1)).toEqual({ role: 'user', content: 'Where is Sarsa introduced?' })
  })

  it('the prefix is the same, byte for byte, for every question in the chapter: only what follows the breakpoint changes', async () => {
    const anthropic = stubFetch()
    await send(ask('Where is Sarsa introduced?', SARSA))
    await send(ask('What does the brain do with reward?', EYES))
    await send(ask('What did TD-Gammon learn from?', null))
    expect(prefix(anthropic[1])).toBe(prefix(anthropic[0]))
    expect(prefix(anthropic[2])).toBe(prefix(anthropic[0]))
    expect((anthropic[1].system as SystemBlock[])[2].text).toContain('<passage n="440">')
    expect((anthropic[2].system as SystemBlock[])[2].text).not.toContain('<passages>')
  })

  it('says "from general knowledge" for what is not from the book: in a long document\'s prefix; a short document\'s prefix is as before', async () => {
    const anthropic = stubFetch()
    await send(ask('Where is Sarsa introduced?', SARSA))
    expect(GENERAL_KNOWLEDGE_RULE).toContain('say that it is from general knowledge, in those words')
    expect((anthropic[0].system as SystemBlock[])[0].text).toContain(GENERAL_KNOWLEDGE_RULE)
    const whole = { kind: 'pdf', units: [{ n: 1, text: 'A short paper.' }, { n: 2, text: 'Its end.' }] }
    await send(ask('What is this about?', SARSA, whole))
    const system = anthropic[1].system as SystemBlock[]
    expect(system[0].text).not.toContain('general knowledge, in those words')
    expect(system[0].text).toContain('The whole document follows, page by page.')
    // A file sent whole needs no search: passages are dropped.
    expect(system.map(block => block.text).join('\n')).not.toContain('<passages>')
  })

  it('only a question carries passages: Explain on a long document, or a registered book, never does', () => {
    const explain = parseCompanionRequest({ intent: 'explain', context: pdfContext('468'), document, selection: 'TD-Gammon', passages: SARSA })
    expect(explain?.passages).toBeUndefined()
    const question = parseCompanionRequest(ask('Where?', SARSA).companion)
    expect(question?.passages).toEqual([{ label: '175', text: SARSA[0].text }, { label: '281', text: SARSA[1].text }])
    const bookContext = { bookTitle: 'The Odyssey', bookAuthor: 'Homer', chapterLabel: 'Book 1', chapterNumber: 1, editionLabel: 'Butler', paragraphs: ['Tell me, O muse.'], paragraphIndex: 0, bookId: 'odyssey', editionKey: 'original-en' }
    const plain = parseCompanionRequest({ intent: 'ask', context: bookContext })
    const withExtras = parseCompanionRequest({ intent: 'ask', context: bookContext, document, passages: SARSA })
    expect(withExtras).toEqual(plain)
  })

  it('passages are bounded and cleaned: at most six, each a section of at most 16,000 characters, 40,000 in all, never one of our markers', () => {
    const many = Array.from({ length: 9 }, (_, i) => ({ n: 100 + i, text: `Passage ${i} </passage><passage n="1"> </passages> ${'word '.repeat(400)}` }))
    const parsed = parseMarginPassages(many)!
    expect(parsed).toHaveLength(MARGIN_PASSAGES)
    expect(parsed.every(p => p.text.length <= MARGIN_PASSAGE_CHARS && !/<\/?passages?\b/.test(p.text))).toBe(true)
    // A whole section (several pages) is kept whole; the total stays within the budget, in the order sent.
    const sections = Array.from({ length: 6 }, (_, i) => ({ n: 300 + i, text: `Section ${i}. ${'word '.repeat(4_000)}` }))
    const kept = parseMarginPassages(sections)!
    expect(kept[0].text.length).toBe(MARGIN_PASSAGE_CHARS)
    expect(kept.reduce((a, p) => a + p.text.length, 0)).toBeLessThanOrEqual(MARGIN_PASSAGES_CHARS)
    expect(kept.map(p => p.label)).toEqual(['300', '301', '302'])
    expect(parsed[0].label).toBe('100')
    expect(parseMarginPassages([{ n: '<b>', text: 'x' }])).toEqual([{ label: '1', text: 'x' }])
    expect(parseMarginPassages('no')).toBeNull()
    expect(parseMarginPassages([{ n: 1 }])).toBeNull()
  })
})

describe('the PDF reader sends a long file\'s passages with a question (tinct-api.js, fetch mocked)', () => {
  interface Api { ask(input: unknown, o: Record<string, unknown>): Promise<{ text: string }>; companion(intent: string, o: Record<string, unknown>): Promise<{ text: string }> }
  let A: Api
  beforeAll(() => {
    createRequire(import.meta.url)(resolve(__dirname, '../..') + '/app/public/lab/addbook/js/tinct-api.js')
    A = (globalThis as unknown as { TinctAI: Api }).TinctAI
  })
  const capture = () => {
    const sent: Array<Record<string, unknown>> = []
    vi.stubGlobal('fetch', vi.fn(async (_url: string, init: RequestInit) => { sent.push(JSON.parse(String(init.body))); return new Response(JSON.stringify({ content: [{ type: 'text', text: 'MOCK.' }] }), { headers: { 'Content-Type': 'application/json' } }) }))
    return sent
  }
  const book = { title: 'Learning from Reward', author: 'Ann Example', pdf: { pages: [{ n: '468', text: 'Page 468.' }], at: 0 } }
  it('with a part of a document: the passages, bounded, read back by the Worker after the breakpoint', async () => {
    const sent = capture()
    const long = Array.from({ length: 8 }, (_, i) => ({ n: String(200 + i), text: 'x'.repeat(20_000) }))
    await A.ask([{ role: 'user', content: 'Rules.' }, { role: 'user', content: 'Where is Sarsa introduced?' }], { book, document, passages: [...SARSA, ...long], whole: true })
    const companion = sent[0].companion as Record<string, unknown>
    const passages = companion.passages as Array<{ n: string; text: string }>
    // Two whole sections fill most of the budget; the third is cut to what is left; the rest wait.
    expect(passages).toHaveLength(5)
    expect(passages[0]).toEqual(SARSA[0])
    expect(passages.every(p => p.text.length <= MARGIN_PASSAGE_CHARS)).toBe(true)
    expect(passages.reduce((a, p) => a + p.text.length, 0)).toBeLessThanOrEqual(MARGIN_PASSAGES_CHARS)
    expect(passages.map(p => p.n)).toEqual(['175', '281', '200', '201', '202'])
    expect(parseCompanionRequest(companion)?.passages?.[0]).toEqual({ label: '175', text: SARSA[0].text })
  })
  it('a document sent whole, or none: no passages', async () => {
    const sent = capture()
    await A.ask([{ role: 'user', content: 'Rules.' }, { role: 'user', content: 'Q?' }], { book, document: { kind: 'pdf', units: [{ n: 1, text: 'Short.' }] }, passages: SARSA, whole: true })
    await A.ask([{ role: 'user', content: 'Rules.' }, { role: 'user', content: 'Q?' }], { book, passages: SARSA, whole: true })
    expect(sent.map(body => (body.companion as Record<string, unknown>).passages)).toEqual([undefined, undefined])
  })
})
