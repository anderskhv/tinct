/**
 * The PDF reader's margin after the morning retest of 16 Oct 2026 (docs/margin/FIXES-2026-10-16.md) and the night
 * run's final round, Worker side:
 *   2. tables read row by row with comparisons stated, and 4. each answer standing alone: two shared rules in every
 *      margin request's cached prefix, never in the book reader's;
 *   3. a failed source search is asked once more, then answered quietly from the document (never a word about the
 *      tool); the book reader's search is unchanged;
 *   4. Explain opens with the meaning; A. Counterpoint thinks again and has no author's reply.
 * Every provider call is mocked; nothing reaches Anthropic or OpenAI.
 */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { MARGIN_HAIKU_MODEL } from './companion/marginRoutes'
import { PDF_EXPLAIN_OPENING_RULE, PDF_EXPLAIN_PROMPT, STANDS_ALONE_RULE, TABLE_NUMBERS_RULE } from './companion/marginPrompts'
import { buildCompanionSystem, parseCompanionRequest } from './companion/companionRequest'
import { createAllowanceGate } from './worker/lib/aiAllowance'
import { MARGIN_NO_SOURCES_RESULT, MARGIN_SEARCH_DONE_RESULT, handleChat } from './worker/routes/chat'

const userId = '11111111-1111-4111-8111-111111111111'
const reader = async () => ({ id: userId, email: 'reader@example.com' })
const allow = async () => true
const env = { ANTHROPIC_API_KEY: 'anthropic-key', OPENAI_API_KEY: 'openai-key', SUPABASE_URL: 'https://example.supabase.co', SUPABASE_SERVICE_ROLE_KEY: 'service-role' }
const gateOff = { allowanceGate: createAllowanceGate({}, false) }
const PAPER = [
  'Generative Adversarial Nets\nAbstract We propose a new framework for estimating generative models via an adversarial process.',
  'Table 1: Parzen window-based log-likelihood estimates.\nModel MNIST TFD\nDBN [3] 138 ± 2 1909 ± 66\nStacked CAE [3] 121 ± 1.6 2110 ± 50\nDeep GSN [6] 214 ± 1.1 1890 ± 29\nAdversarial nets 225 ± 2 2057 ± 26',
]
const document = { kind: 'pdf', units: PAPER.map((text, i) => ({ n: i + 1, text })) }
const pdfContext = (at: number) => ({ kind: 'pdf', bookTitle: 'Generative Adversarial Nets', bookAuthor: 'Goodfellow et al.', chapterLabel: `Page ${at}`, pages: [{ n: at, text: PAPER[at - 1] }], paragraphIndex: 0, pageNumber: at, totalPages: PAPER.length })
const margin = (intent: string, at: number, fields: Record<string, unknown> = {}) => ({ companion: { intent, context: pdfContext(at), document, selection: 'Adversarial nets 225 ± 2 2057 ± 26', ...fields } })
const bookContext = { bookTitle: 'The Odyssey', bookAuthor: 'Homer', chapterLabel: 'Book 1', chapterNumber: 1, editionLabel: 'Butler', paragraphs: ['Tell me, O muse.'], paragraphIndex: 0, bookId: 'odyssey', editionKey: 'original-en' }

const sse = (type: string, data: Record<string, unknown>) => `event: ${type}\ndata: ${JSON.stringify({ type, ...data })}\n\n`
const round = (text: string) => [
  sse('message_start', { message: { usage: { input_tokens: 5 } } }),
  sse('content_block_start', { index: 0, content_block: { type: 'text', text: '' } }),
  sse('content_block_delta', { index: 0, delta: { type: 'text_delta', text } }),
  sse('content_block_stop', { index: 0 }),
  sse('message_delta', { delta: { stop_reason: 'end_turn' }, usage: { output_tokens: 3 } }),
  sse('message_stop', {}),
].join('')
const stream = (body: string) => new Response(body, { headers: { 'content-type': 'text/event-stream' } })
const reply = (text: string) => Response.json({ id: 'msg', type: 'message', role: 'assistant', model: MARGIN_HAIKU_MODEL, content: [{ type: 'text', text }], stop_reason: 'end_turn', usage: { input_tokens: 5, output_tokens: 3 } })
const evidence = () => Response.json({ status: 'completed', output: [{ type: 'message', content: [{ type: 'output_text', text: 'Later work agrees.', annotations: [{ type: 'url_citation', url: 'https://example.org/a', title: 'A source' }] }] }] })

function stubFetch(replies: Array<Response | (() => Response)>, search?: () => Response) {
  const anthropic: Array<Record<string, unknown>> = []
  let searches = 0
  vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input)
    if (url.includes('/rest/v1/ai_usage_events')) return new Response(null, { status: 201 })
    if (url.includes('/rest/v1/profiles')) return Response.json([{ messages_used_this_period: 0, message_balance: 5, subscription_status: 'active', subscription_period_end: null, created_at: '2026-06-01T12:00:00Z' }])
    if (url.includes('/rpc/use_message')) return Response.json({})
    if (url === 'https://api.openai.com/v1/responses') { searches++; return search ? search() : Response.json({ error: { type: 'server_error' } }, { status: 500 }) }
    if (url === 'https://api.anthropic.com/v1/messages') {
      anthropic.push(JSON.parse(String(init?.body)))
      const next = replies.shift() ?? reply('Holds.')
      return typeof next === 'function' ? next() : next
    }
    return Response.json({ error: 'unexpected fetch' }, { status: 500 })
  }))
  return { anthropic, searches: () => searches }
}
async function send(body: unknown) {
  const pending: Promise<unknown>[] = []
  const ctx = { waitUntil: (p: Promise<unknown>) => { pending.push(Promise.resolve(p).catch(() => {})) } } as unknown as ExecutionContext
  const request = new Request('https://tinct.app/api/chat', { method: 'POST', body: JSON.stringify(body), headers: { 'content-type': 'application/json', 'cf-connecting-ip': '203.0.113.9' } })
  const response = await handleChat(request, env, ctx, reader, allow, gateOff)
  const text = await response.text()
  await Promise.all(pending)
  return { status: response.status, text }
}
const systemText = (body: Record<string, unknown>) => (Array.isArray(body.system) ? (body.system as Array<{ text: string }>).map(b => b.text).join('\n') : String(body.system))
/** The tool result the verdict round received for the prefetched search. */
const searchResult = (body: Record<string, unknown>) => {
  const messages = body.messages as Array<{ role: string; content: Array<Record<string, unknown>> | string }>
  for (const m of messages) if (Array.isArray(m.content)) for (const b of m.content) if (b.type === 'tool_result') return b
  return null
}

afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks() })

describe('2 and 4: two more shared rules, the PDF reader only', () => {
  it('every margin action carries them in its cached prefix', async () => {
    for (const intent of ['explain', 'simplify', 'counterpoint', 'related']) {
      const { anthropic } = stubFetch([])
      await send(margin(intent, 2))
      const prefix = (anthropic[0].system as Array<{ text: string; cache_control?: unknown }>)[0]
      expect(prefix.cache_control, intent).toEqual({ type: 'ephemeral' })
      expect(prefix.text, intent).toContain(TABLE_NUMBERS_RULE)
      expect(prefix.text, intent).toContain(STANDS_ALONE_RULE)
      vi.unstubAllGlobals()
    }
  })
  it('the whole-PDF Chat too', async () => {
    const { anthropic } = stubFetch([])
    await send({ ...margin('ask', 2, { scope: 'whole' }), messages: [{ role: 'user', content: 'Who wins on TFD?' }] })
    expect(systemText(anthropic[0])).toContain(STANDS_ALONE_RULE)
    expect(systemText(anthropic[0])).toContain(TABLE_NUMBERS_RULE)
  })
  it('the book reader\'s prompts are unchanged: none of this week\'s wording', () => {
    for (const intent of ['explain', 'ask', 'define']) {
      const system = buildCompanionSystem(parseCompanionRequest({ intent, context: bookContext, selection: 'muse' })!)
      for (const line of [TABLE_NUMBERS_RULE, STANDS_ALONE_RULE, PDF_EXPLAIN_OPENING_RULE]) expect(system, intent).not.toContain(line)
    }
  })
})

describe('4 and B: Explain opens with the meaning', () => {
  it('its prompt ends with the opening rule, after the text rule', () => {
    expect(PDF_EXPLAIN_PROMPT.endsWith('Write only about what the text says and means. ' + PDF_EXPLAIN_OPENING_RULE)).toBe(true)
  })
})

describe('3: a failed source search', () => {
  const factcheck = () => ({ stream: true, ...margin('factcheck', 2, { selection: 'Adversarial nets 225 ± 2 2057 ± 26' }) })

  it('is asked once more; failing again, the verdict round answers from the document, told never to mention the tool', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    const { anthropic, searches } = stubFetch([stream(round('Table 1 reports these numbers {p. 2}.')), stream(round('Holds. The numbers stand, from general knowledge.\n\nSources:'))])
    const res = await send(factcheck())
    expect(res.status).toBe(200)
    expect(searches()).toBe(2)
    const verdict = anthropic.at(-1)!
    const result = searchResult(verdict)!
    expect(result.content).toBe(MARGIN_NO_SOURCES_RESULT)
    expect(result.is_error).toBeUndefined()
    expect(res.text).not.toMatch(/search tool|unavailable/i)
  })

  it('one that answers on the second try is used as any search is', async () => {
    let calls = 0
    const { anthropic, searches } = stubFetch([stream(round('Table 1 reports these numbers {p. 2}.')), stream(round('Holds. Later work agrees.\n\nSources: [A source](https://example.org/a)'))], () => (++calls === 1 ? Response.json({ error: { type: 'server_error' } }, { status: 500 }) : evidence()))
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    await send(factcheck())
    expect(searches()).toBe(2)
    expect(String(searchResult(anthropic.at(-1)!)!.content)).toContain('Public-source evidence')
  })

  it('one that works the first time is asked once, as before', async () => {
    const { searches } = stubFetch([stream(round('Table 1 reports these numbers {p. 2}.')), stream(round('Holds. Later work agrees.\n\nSources: [A source](https://example.org/a)'))], evidence)
    await send(factcheck())
    expect(searches()).toBe(1)
  })

  it('the model asking again gets the sources already returned, never "limited to one lookup"', () => {
    expect(MARGIN_SEARCH_DONE_RESULT).toBe('Use the sources already returned, the document and well-established general knowledge. Never mention a search, a tool or a lookup.')
    expect(MARGIN_NO_SOURCES_RESULT).not.toMatch(/fail|unavailable right now|limit/i)
  })

  it('docs/margin/PROMPTS.md carries the result word for word', () => {
    const doc = readFileSync(resolve(__dirname, '../../docs/margin/PROMPTS.md'), 'utf8')
    expect(doc).toContain(MARGIN_NO_SOURCES_RESULT)
  })
})

describe('A: Counterpoint after the night run\'s final round', () => {
  it('thinks again (adaptive, effort low, 6000 tokens) and asks for one sharp objection with no author\'s reply', async () => {
    const { anthropic } = stubFetch([stream(round('Adversarial nets beat DBN on TFD.'))])
    await send({ stream: true, ...margin('counterpoint', 2) })
    expect(anthropic[0].model).toBe(MARGIN_HAIKU_MODEL)
    expect(anthropic[0]).not.toHaveProperty('thinking')
    expect(anthropic[0].output_config).toEqual({ effort: 'low' })
    expect(anthropic[0].max_tokens).toBe(6000)
    const system = systemText(anthropic[0])
    expect(system).toContain('Give one sharp objection')
    expect(system).toContain('check which is higher before you write')
    expect(system).not.toContain('Then one sentence giving the author')
  })
})
