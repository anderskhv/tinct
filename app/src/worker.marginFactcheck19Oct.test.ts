/**
 * Fact-check, verdict first (Anders, 19 Oct 2026). Answers seen on production opened on "The passage claims that …",
 * carried a first round's "Sources: none searched yet.", an italic "Note." label and "From general knowledge," /
 * "the research summarized here is from general knowledge and the cited studies" / "The claim is about apes today".
 * The Worker: no doc-first opening round by default, and no text written before a tool call reaches the reader. The
 * card: P.cleanFactcheck (both parser twins) and margin.js factcheckHtml. Every provider call is mocked.
 */
import { createRequire } from 'node:module'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createAllowanceGate } from './worker/lib/aiAllowance'
import { handleChat, FACTCHECK_VERDICT_START, MARGIN_NO_SOURCES_RESULT } from './worker/routes/chat'
import { FACTCHECK_DOC_FIRST, factcheckDocFirst } from './companion/marginRoutes'
import { factcheckPrompt, FACTCHECK_NO_SEARCH_NOTE } from './companion/marginPrompts'
import * as appCopy from './companion/marginParse'
import * as pageCopy from '../public/lab/margin/margin-parse.js'

const require = createRequire(import.meta.url)
require('../public/lab/addbook/js/margin.js')
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const M = (globalThis as any).TinctMargin

/** The answer Anders saw, as one reply (its parts in the order they came). */
const SEEN = [
  'The passage claims that apes cannot learn language.',
  '',
  'Sources: none searched yet.',
  '',
  'Partly holds. From general knowledge, apes learn some signs but no grammar. The claim is about apes today.',
  '',
  '*Note.* the research summarized here is from general knowledge and the cited studies.',
  '',
  'Sources: [Great ape language](https://en.wikipedia.org/wiki/Great_ape_language) · [Project Nim](https://en.wikipedia.org/wiki/Nim_Chimpsky)',
].join('\n')
const CLEAN = 'Partly holds. Apes learn some signs but no grammar.\n\nSources: [Great ape language](https://en.wikipedia.org/wiki/Great_ape_language) · [Project Nim](https://en.wikipedia.org/wiki/Nim_Chimpsky)'

describe.each([['src/companion/marginParse.ts', appCopy], ['public/lab/margin/margin-parse.js', pageCopy]] as const)('cleanFactcheck (%s)', (_name, m) => {
  it('the exact answer of 19 Oct: verdict first, no restating paragraph, no first round\'s Sources line, no label, no remarks on the check', () => {
    expect(m.cleanFactcheck(SEEN)).toBe(CLEAN)
  })
  it('"The passage claims that …" before the verdict goes; a verdict first stays as written', () => {
    expect(m.cleanFactcheck('The passage claims that the Earth is 6,000 years old.\n\nOutdated. It is about 4.5 billion years old.')).toBe('Outdated. It is about 4.5 billion years old.')
    expect(m.cleanFactcheck('Holds. Water boils at 100 °C at sea level {p. 3}.')).toBe('Holds. Water boils at 100 °C at sea level {p. 3}.')
  })
  it('"Sources: none searched yet." goes; the only Sources line is the last one with real links, at the end', () => {
    expect(m.cleanFactcheck('Sources: none searched yet.\n\nHolds. Yes.\n\nSources: [A](https://a.org/x)')).toBe('Holds. Yes.\n\nSources: [A](https://a.org/x)')
    expect(m.cleanFactcheck('Holds. Yes.\n\nSources:')).toBe('Holds. Yes.')
  })
  it('an italic "Note." label or "Caveat:" goes; a real caveat stays as one plain sentence after the verdict', () => {
    expect(m.cleanFactcheck('Holds. The figure stands.\n\n*Note.* Later surveys used a wider sample.')).toBe('Holds. The figure stands.\n\nLater surveys used a wider sample.')
    expect(m.cleanFactcheck('Partly holds. One part stands.\n\nCaveat: the second part was revised in 2019.')).toBe('Partly holds. One part stands.\n\nThe second part was revised in 2019.')
    expect(m.cleanFactcheck('Holds. Yes.\n\nNote. A landmark.')).toBe('Holds. Yes.\n\nA landmark.')
  })
  it('"From general knowledge," leaves its sentence; "the research summarized here is from general knowledge and the cited studies" and "The claim is about apes today" go', () => {
    expect(m.cleanFactcheck('Holds. From general knowledge, chimpanzees use tools.')).toBe('Holds. Chimpanzees use tools.')
    expect(m.cleanFactcheck('Disputed. Linguists disagree. The research summarized here is from general knowledge and the cited studies.')).toBe('Disputed. Linguists disagree.')
    expect(m.cleanFactcheck('Holds. Apes sign. The claim is about apes today.')).toBe('Holds. Apes sign.')
  })
  it('still streaming, no verdict yet: its words are kept, less the labels and remarks (the card shows none until the verdict)', () => {
    expect(m.cleanFactcheck('The passage claims that apes cannot speak.')).toBe('')
    expect(m.cleanFactcheck('Holds.')).toBe('Holds.')
  })
})

describe('the card (margin.js factcheckHtml)', () => {
  it('shows the verdict as its bottom line first, the plain caveat, then the real links; nothing before the verdict', () => {
    const f = M.html.factcheckHtml(SEEN, pageCopy)
    expect(f.answer).toBe('<div class="mr-answer"><p><span class="is-bottom-line">Partly holds. Apes learn some signs but no grammar.</span></p></div>')
    expect(f.answer).not.toMatch(/passage claims|none searched|Note\.|general knowledge|claim is about/)
    expect((f.sources.match(/<a /g) || []).length).toBe(2)
    expect(M.html.factcheckHtml('The passage claims that apes cannot speak.\n\nSources: none searched yet.', pageCopy, { live: true })).toEqual({ answer: '', sources: '' })
  })
  it('folded, the verdict line', () => {
    expect(M.html.foldText({ id: 'f', kind: 'factcheck', page: 1, rects: [[1, 0, 0, 1, 0.1]], text: 'x', at: 1, turns: [{ role: 'assistant', content: SEEN }] }, pageCopy)).toBe('Partly holds. Apes learn some signs but no grammar.')
  })
})

describe('the prompt and the Worker', () => {
  it('asks for the verdict first, no restating, no labels, no remarks on the check, the real links as the only Sources line', () => {
    const prompt = factcheckPrompt('2026-10-19')
    expect(prompt).toContain('Start the answer with the verdict')
    expect(prompt).toContain('Never restate or summarise the passage or its claim')
    expect(prompt).toContain('with no label such as "Note." or "Caveat:"')
    expect(prompt).toContain('no "from general knowledge"')
    expect(prompt).not.toMatch(/First paragraph|Note\., for useful context/)
    expect(FACTCHECK_NO_SEARCH_NOTE).toContain('Write no Sources: line.')
    expect(MARGIN_NO_SOURCES_RESULT).not.toMatch(/from general knowledge/i)
    expect(MARGIN_NO_SOURCES_RESULT).toContain('Write no Sources: line.')
  })
  it('the doc-first opening is off by default', () => {
    expect(FACTCHECK_DOC_FIRST).toBe(false)
    expect(factcheckDocFirst()).toBe(false)
    expect(FACTCHECK_VERDICT_START.test('Partly holds. x')).toBe(true)
    expect(FACTCHECK_VERDICT_START.test('The passage claims')).toBe(false)
  })
})

const reader = async () => ({ id: '11111111-1111-4111-8111-111111111111', email: 'reader@example.com' })
const env = { ANTHROPIC_API_KEY: 'anthropic-key', OPENAI_API_KEY: 'openai-key', SUPABASE_URL: 'https://example.supabase.co', SUPABASE_SERVICE_ROLE_KEY: 'service-role' }
const document = { kind: 'pdf', units: [{ n: 1, text: 'Apes. Apes cannot learn language.' }] }
const context = { kind: 'pdf', bookTitle: 'Primates', bookAuthor: 'A. Writer', chapterLabel: 'Page 1', pages: [{ n: 1, text: 'Apes cannot learn language.' }], paragraphIndex: 0, pageNumber: 1, totalPages: 1 }
const sse = (type: string, data: Record<string, unknown>) => `event: ${type}\ndata: ${JSON.stringify({ type, ...data })}\n\n`
const textRound = (text: string) => [
  sse('message_start', { message: { usage: { input_tokens: 5 } } }),
  sse('content_block_start', { index: 0, content_block: { type: 'text', text: '' } }),
  sse('content_block_delta', { index: 0, delta: { type: 'text_delta', text } }),
  sse('content_block_stop', { index: 0 }),
  sse('message_delta', { delta: { stop_reason: 'end_turn' }, usage: { output_tokens: 3 } }),
  sse('message_stop', {}),
].join('')
// A round that writes text and then asks for the search again (the "first round" Anders saw).
const toolRound = (text: string) => [
  sse('message_start', { message: { usage: { input_tokens: 5 } } }),
  sse('content_block_start', { index: 0, content_block: { type: 'text', text: '' } }),
  sse('content_block_delta', { index: 0, delta: { type: 'text_delta', text } }),
  sse('content_block_stop', { index: 0 }),
  sse('content_block_start', { index: 1, content_block: { type: 'tool_use', id: 'toolu_1', name: 'search_reading_sources', input: {} } }),
  sse('content_block_delta', { index: 1, delta: { type: 'input_json_delta', partial_json: '{"query":"apes language"}' } }),
  sse('content_block_stop', { index: 1 }),
  sse('message_delta', { delta: { stop_reason: 'tool_use' }, usage: { output_tokens: 3 } }),
  sse('message_stop', {}),
].join('')

function stubFetch(rounds: string[]) {
  const anthropic: Array<Record<string, unknown>> = []
  vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input)
    if (url.includes('/rest/v1/ai_usage_events')) return new Response(null, { status: 201 })
    if (url.includes('/rest/v1/profiles')) return Response.json([{ messages_used_this_period: 0, message_balance: 5, subscription_status: 'active', subscription_period_end: null, created_at: '2026-06-01T12:00:00Z' }])
    if (url.includes('/rpc/use_message')) return Response.json({})
    if (url === 'https://api.openai.com/v1/responses') return Response.json({ status: 'completed', output: [{ type: 'message', content: [{ text: 'Apes learn signs.', annotations: [{ type: 'url_citation', url: 'https://en.wikipedia.org/wiki/Great_ape_language', title: 'Great ape language' }] }] }], usage: { input_tokens: 10, output_tokens: 5 } })
    if (url === 'https://api.anthropic.com/v1/messages') {
      anthropic.push(JSON.parse(String(init?.body)))
      return new Response(rounds[Math.min(anthropic.length - 1, rounds.length - 1)], { headers: { 'content-type': 'text/event-stream' } })
    }
    return Response.json({ error: 'unexpected fetch' }, { status: 500 })
  }))
  return { anthropic }
}
async function send(body: unknown) {
  const pending: Promise<unknown>[] = []
  const ctx = { waitUntil: (p: Promise<unknown>) => { pending.push(Promise.resolve(p)) } } as unknown as ExecutionContext
  const request = new Request('https://tinct.app/api/chat', { method: 'POST', body: JSON.stringify(body), headers: { 'content-type': 'application/json', 'cf-connecting-ip': '203.0.113.9' } })
  const response = await handleChat(request, env, ctx, reader, async () => true, { allowanceGate: createAllowanceGate({}, false) })
  const text = await response.text()
  await Promise.all(pending)
  return { status: response.status, text }
}
afterEach(() => { vi.unstubAllGlobals() })

describe('streamed, with the search (the default since 19 Oct 2026)', () => {
  it('no opening round: one round after the search, which opens on its verdict', async () => {
    const { anthropic } = stubFetch([textRound('Partly holds. Apes learn some signs but no grammar.\n\nSources: [Great ape language](https://en.wikipedia.org/wiki/Great_ape_language)')])
    const { status, text } = await send({ stream: true, companion: { intent: 'factcheck', context, document, selection: 'Apes cannot learn language.' } })
    expect(status).toBe(200)
    expect(anthropic).toHaveLength(1)
    expect(JSON.stringify(anthropic[0].system)).not.toContain('Write only the first paragraph now')
    // The search result is already in the first round: the model writes after the search.
    expect(JSON.stringify(anthropic[0].messages)).toContain('toolu_prefetched_sources')
    expect(text).toContain('Partly holds. Apes learn some signs')
    expect(text.indexOf('Checking sources')).toBeLessThan(text.indexOf('Partly holds'))
  })
  it('text written before a tool call never reaches the reader ("Sources: none searched yet."), even a full sentence', async () => {
    const { anthropic } = stubFetch([
      toolRound('Sources: none searched yet. I will look this up now before answering anything at all.'),
      textRound('Holds. Apes learn some signs.\n\nSources: [Great ape language](https://en.wikipedia.org/wiki/Great_ape_language)'),
    ])
    const { status, text } = await send({ stream: true, companion: { intent: 'factcheck', context, document, selection: 'Apes cannot learn language.' } })
    expect(status).toBe(200)
    expect(anthropic.length).toBeGreaterThanOrEqual(2)
    expect(text).not.toContain('none searched')
    expect(text).toContain('Holds. Apes learn some signs.')
  })
})
