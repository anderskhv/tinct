/**
 * The PDF reader's margin after the retest of train 2 (15 Oct 2026, evening): 7 of about 70
 * actions showed "The answer could not be loaded" (502 /api/chat). The Worker logs why each
 * margin answer failed (metadata only), retries a Fact-check round that fails before it starts
 * even after the opening was shown, and never charges an answer that did not reach the reader.
 * Also: the second request on a document reads the cached prefix the first one wrote. Every
 * provider call is mocked; nothing reaches Anthropic or OpenAI.
 */
import { afterEach, describe, expect, it, vi } from 'vitest'
import { MARGIN_HAIKU_MODEL, MARGIN_ROUTES } from './companion/marginRoutes'
// Fact-check's doc-first opening is off since 19 Oct 2026 (marginRoutes.ts FACTCHECK_DOC_FIRST): the verdict round's
// retry after the opening is tested with its switch on, as it ran from 15 to 19 Oct.
vi.mock('./companion/marginRoutes', async importOriginal => {
  const real = await importOriginal<typeof import('./companion/marginRoutes')>()
  return { ...real, factcheckDocFirst: () => true }
})
import { createAllowanceGate } from './worker/lib/aiAllowance'
import { handleChat, marginFailureCause } from './worker/routes/chat'

const userId = '11111111-1111-4111-8111-111111111111'
const reader = async () => ({ id: userId, email: 'reader@example.com' })
const allow = async () => true
const env = { ANTHROPIC_API_KEY: 'anthropic-key', SUPABASE_URL: 'https://example.supabase.co', SUPABASE_SERVICE_ROLE_KEY: 'service-role' }
const gateOff = { allowanceGate: createAllowanceGate({}, false) }

const PAPER = [
  'Generative Adversarial Nets\nAbstract We propose a new framework for estimating generative models via an adversarial process.',
  '1 Introduction\nThe promise of deep learning is to discover rich, hierarchical models.',
  '3 Adversarial nets\nThe training procedure for G is to maximize the probability of D making a mistake.',
]
const document = { kind: 'pdf', units: PAPER.map((text, i) => ({ n: i + 1, text })) }
const pdfContext = (at: number) => ({
  kind: 'pdf', bookTitle: 'Generative Adversarial Nets', bookAuthor: 'Goodfellow et al.', chapterLabel: `Page ${at}`,
  pages: [{ n: at, text: PAPER[at - 1] }], paragraphIndex: 0, pageNumber: at, totalPages: PAPER.length,
})
const SECRET = 'G must not be trained too much without updating D'
const margin = (intent: string, at: number, fields: Record<string, unknown> = {}) => ({ companion: { intent, context: pdfContext(at), document, selection: SECRET, ...fields } })

function context() {
  const pending: Promise<unknown>[] = []
  return { ctx: { waitUntil: (promise: Promise<unknown>) => { pending.push(Promise.resolve(promise).catch(() => {})) } } as unknown as ExecutionContext, pending }
}
function post(body: unknown, headers: Record<string, string> = {}) {
  return new Request('https://tinct.app/api/chat', { method: 'POST', body: JSON.stringify(body), headers: { 'content-type': 'application/json', 'cf-connecting-ip': '203.0.113.9', ...headers } })
}
const sse = (type: string, data: Record<string, unknown>) => `event: ${type}\ndata: ${JSON.stringify({ type, ...data })}\n\n`
const round = (text: string, usage: Record<string, number> = { input_tokens: 5 }) => [
  sse('message_start', { message: { usage } }),
  sse('content_block_start', { index: 0, content_block: { type: 'text', text: '' } }),
  sse('content_block_delta', { index: 0, delta: { type: 'text_delta', text } }),
  sse('content_block_stop', { index: 0 }),
  sse('message_delta', { delta: { stop_reason: 'end_turn' }, usage: { output_tokens: 3 } }),
  sse('message_stop', {}),
].join('')

type Reply = Response | (() => Response)
/** Mocks every outbound call: Anthropic answers each request with the next reply; charges are counted. */
function stubFetch(replies: Reply[], search?: () => Response) {
  const anthropic: Array<Record<string, unknown>> = []
  const charges: string[] = []
  vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input)
    if (url.includes('/rest/v1/ai_usage_events')) return new Response(null, { status: 201 })
    if (url.includes('/rest/v1/profiles')) return Response.json([{ messages_used_this_period: 0, message_balance: 5, subscription_status: 'active', subscription_period_end: null, created_at: '2026-06-01T12:00:00Z' }])
    if (url.includes('/rpc/use_message')) { charges.push(url); return Response.json({}) }
    if (url === 'https://api.openai.com/v1/responses') return search ? search() : Response.json({ error: 'no search in this test' }, { status: 500 })
    if (url === 'https://api.anthropic.com/v1/messages') {
      anthropic.push(JSON.parse(String(init?.body)))
      const next = replies.shift()
      if (!next) return Response.json({ error: 'no more replies' }, { status: 500 })
      return typeof next === 'function' ? next() : next
    }
    return Response.json({ error: 'unexpected fetch' }, { status: 500 })
  }))
  return { anthropic, charges }
}
const stream = (body: string) => new Response(body, { headers: { 'content-type': 'text/event-stream' } })
const providerError = (status: number, type: string) => Response.json({ type: 'error', error: { type, message: 'Internal secret detail' } }, { status })

async function send(body: unknown, options: { headers?: Record<string, string>; env?: Record<string, string> } = {}) {
  const { ctx, pending } = context()
  const response = await handleChat(post(body, options.headers), { ...env, ...options.env }, ctx, reader, allow, gateOff)
  const text = await response.text()
  await Promise.all(pending)
  return { status: response.status, text }
}

/** Collects the margin's failure log lines (console.warn) while `run` runs. */
async function failures(run: () => Promise<unknown>) {
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
  try {
    await run()
    return warn.mock.calls.map(call => String(call[0])).filter(line => line.includes('margin_answer_failure')).map(line => JSON.parse(line) as Record<string, unknown>)
  } finally { warn.mockRestore() }
}

afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); vi.restoreAllMocks() })

describe('why a margin answer failed: one structured warning, metadata only', () => {
  it('names the cause from the provider\'s error type and the status', () => {
    expect(marginFailureCause(503, 'overloaded_error')).toBe('overloaded')
    expect(marginFailureCause(502, 'api_error')).toBe('upstream_5xx')
    expect(marginFailureCause(504, 'upstream_timeout')).toBe('timeout')
    expect(marginFailureCause(502, 'upstream_connection_error')).toBe('connection')
    expect(marginFailureCause(200, 'incomplete_stream')).toBe('stream_dropped')
    expect(marginFailureCause(502, 'empty_stream')).toBe('empty_answer')
    expect(marginFailureCause(502, 'cut_off')).toBe('cut_off')
    expect(marginFailureCause(502, 'refusal')).toBe('refusal')
    expect(marginFailureCause(502, 'invalid_request_error')).toBe('invalid_request')
    expect(marginFailureCause(503, null)).toBe('busy')
    expect(marginFailureCause(502, 'upstream_error')).toBe('upstream_error')
  })

  it('an upstream 5xx that outlasts the Worker\'s own retry: a 502, logged once as upstream_5xx, never with text', async () => {
    const { anthropic, charges } = stubFetch([providerError(500, 'api_error'), providerError(500, 'api_error')])
    let res: { status: number; text: string } | undefined
    const lines = await failures(async () => { res = await send(margin('define', 3, { selection: 'minimax' })) })
    expect(res!.status).toBe(502)
    expect(anthropic).toHaveLength(2)
    expect(charges).toHaveLength(0)
    expect(lines).toHaveLength(1)
    expect(lines[0]).toMatchObject({ event: 'margin_answer_failure', margin_intent: 'define', model: MARGIN_HAIKU_MODEL, phase: 'before_answer', stream: false, status: 502, error_type: 'api_error', cause: 'upstream_5xx', had_text: false, client_retry: false })
    const raw = JSON.stringify(lines)
    for (const leak of ['minimax', 'Generative', 'Internal secret', userId, 'reader@example.com']) expect(raw).not.toContain(leak)
  })

  it('a streamed answer: an overload mid-stream and a dropped stream are logged with their cause; the client\'s retry says so', async () => {
    const overloaded = [sse('message_start', { message: { usage: { input_tokens: 5 } } }), sse('error', { error: { type: 'overloaded_error', message: 'Overloaded' } })].join('')
    stubFetch([stream(overloaded)])
    let lines = await failures(() => send({ stream: true, ...margin('simplify', 3) }, { headers: { 'x-tinct-retry': '1' } }))
    expect(lines).toEqual([expect.objectContaining({ margin_intent: 'simplify', phase: 'stream', stream: true, error_type: 'overloaded_error', cause: 'overloaded', had_text: false, client_retry: true })])
    // The provider's stream stops before its message_stop.
    stubFetch([stream(round('Half an answer').split('event: message_delta')[0])])
    let res: { status: number; text: string } | undefined
    lines = await failures(async () => { res = await send({ stream: true, ...margin('counterpoint', 3) }) })
    expect(res!.text).toContain('event: error')
    expect(lines).toEqual([expect.objectContaining({ margin_intent: 'counterpoint', cause: 'stream_dropped', had_text: true, client_retry: false })])
    expect(JSON.stringify(lines)).not.toContain('Half an answer')
  })

  it('an empty answer and a cut-off answer are logged too', async () => {
    stubFetch([Response.json({ content: [{ type: 'text', text: ' ' }], stop_reason: 'end_turn', usage: { input_tokens: 1, output_tokens: 1 } })])
    let lines = await failures(() => send(margin('define', 3, { selection: 'maxout' })))
    expect(lines).toEqual([expect.objectContaining({ margin_intent: 'define', phase: 'answer', cause: 'empty_answer' })])
    stubFetch([Response.json({ content: [{ type: 'text', text: 'Cut' }], stop_reason: 'max_tokens', usage: { input_tokens: 1, output_tokens: 800 } })])
    lines = await failures(() => send(margin('define', 3, { selection: 'maxout' })))
    expect(lines).toEqual([expect.objectContaining({ margin_intent: 'define', cause: 'cut_off' })])
  })

  it('a dropped connection to the provider: logged as connection, a 502 the client may retry', async () => {
    stubFetch([() => { throw new TypeError('network connection lost') }])
    let res: { status: number; text: string } | undefined
    const lines = await failures(async () => { res = await send({ stream: true, ...margin('simplify', 3) }) })
    expect(res!.status).toBe(502)
    expect(lines).toEqual([expect.objectContaining({ margin_intent: 'simplify', phase: 'before_answer', cause: 'connection' })])
  })

  it('the book reader logs no margin failure', async () => {
    stubFetch([providerError(500, 'api_error'), providerError(500, 'api_error')])
    const book = { bookTitle: 'The Odyssey', bookAuthor: 'Homer', chapterLabel: 'Book 1', chapterNumber: 1, editionLabel: 'Butler', paragraphs: ['Tell me, O muse.'], paragraphIndex: 0, bookId: 'odyssey', editionKey: 'original-en' }
    const lines = await failures(() => send({ companion: { intent: 'explain', context: book, selection: 'muse' } }))
    expect(lines).toHaveLength(0)
  })
})

describe('Fact-check\'s verdict round after the opening', () => {
  it('is retried once when it fails before it starts (529), so the opening is not left with an error', async () => {
    const search = () => Response.json({ status: 'completed', output: [{ type: 'message', content: [{ type: 'output_text', text: 'Later work agrees.', annotations: [{ type: 'url_citation', url: 'https://example.org/a', title: 'A source' }] }] }] })
    const { anthropic, charges } = stubFetch([stream(round('The passage claims no Markov chains are needed {p. 1}.')), providerError(529, 'overloaded_error'), stream(round('Holds. Later work agrees.\n\nSources: [A source](https://example.org/a)'))], search)
    const res = await send({ stream: true, ...margin('factcheck', 1, { selection: 'No approximate inference or Markov chains are necessary' }) }, { env: { OPENAI_API_KEY: 'openai-key' } })
    expect(anthropic).toHaveLength(3)
    expect(res.text).toContain('The passage claims')
    expect(res.text).toContain('Holds. Later work agrees.')
    expect(res.text).not.toContain('event: error')
    expect(charges).toHaveLength(1)
  })
})

describe('charged only when the answer reached the reader', () => {
  it('a margin stream the reader\'s connection dropped before the end is never charged, and is logged as client_gone', async () => {
    // The provider's answer arrives slowly, in pieces; the reader goes away after the first.
    const parts = round('Plainly: G and D take turns.').split(/(?<=\n\n)/)
    const slow = () => new Response(new ReadableStream({
      async pull(controller) {
        const next = parts.shift()
        if (!next) { controller.close(); return }
        await new Promise(r => setTimeout(r, 15))
        controller.enqueue(new TextEncoder().encode(next))
      },
    }), { headers: { 'content-type': 'text/event-stream' } })
    const { charges } = stubFetch([slow])
    const { ctx, pending } = context()
    const lines = await failures(async () => {
      const response = await handleChat(post({ stream: true, ...margin('simplify', 3) }), env, ctx, reader, allow, gateOff)
      const body = response.body!.getReader()
      await body.read()
      await body.cancel()
      await Promise.all(pending)
    })
    expect(charges).toHaveLength(0)
    expect(lines).toEqual([expect.objectContaining({ margin_intent: 'simplify', cause: 'client_gone' })])
  })

  it('one that reached the reader is charged once, as before', async () => {
    const { charges } = stubFetch([stream(round('Plainly: G and D take turns.'))])
    const res = await send({ stream: true, ...margin('simplify', 3) })
    expect(res.text).toContain('Plainly')
    expect(charges).toHaveLength(1)
  })
})

describe('the cached prefix is read on the second request in a document', () => {
  it('Simplify after Explain on the same file: the same bytes up to the breakpoint, and its cache_read_input_tokens logged with its intent', async () => {
    const usage = (write: number, read: number) => ({ content: [{ type: 'text', text: 'An answer.' }], stop_reason: 'end_turn', usage: { input_tokens: 30, output_tokens: 5, cache_creation_input_tokens: write, cache_read_input_tokens: read } })
    const { anthropic } = stubFetch([Response.json(usage(4_200, 0)), stream(round('Plainly put.', { input_tokens: 25, cache_creation_input_tokens: 0, cache_read_input_tokens: 4_200 }))])
    const log = vi.spyOn(console, 'log').mockImplementation(() => {})
    await send(margin('explain', 1, { selection: 'a phrase found nowhere else' }))
    await send({ stream: true, ...margin('simplify', 3) })
    const lines = log.mock.calls.map(call => String(call[0])).filter(line => line.includes('anthropic_cache_usage')).map(line => JSON.parse(line))
    log.mockRestore()
    type Block = { text: string; cache_control?: unknown }
    const [first, second] = anthropic.map(body => body.system as Block[])
    expect(first[0].cache_control).toEqual({ type: 'ephemeral' })
    expect(second[0].cache_control).toEqual({ type: 'ephemeral' })
    expect(second[0].text).toBe(first[0].text)
    // Nothing per request before the breakpoint: the selection, the place and the task come after it.
    expect(first[0].text).not.toContain('a phrase found nowhere else')
    expect(second[0].text).not.toContain(SECRET)
    expect(second[1].text).toContain('Rewrite the selected passage')
    expect(anthropic[1].model).toBe(MARGIN_ROUTES.simplify.model)
    expect(lines).toEqual([
      { event: 'anthropic_cache_usage', route: 'chat', margin_intent: 'explain', model: MARGIN_HAIKU_MODEL, input_tokens: 30, output_tokens: 5, cache_creation_input_tokens: 4_200, cache_read_input_tokens: 0 },
      { event: 'anthropic_cache_usage', route: 'chat_stream_start', margin_intent: 'simplify', model: MARGIN_HAIKU_MODEL, input_tokens: 25, output_tokens: 0, cache_creation_input_tokens: 0, cache_read_input_tokens: 4_200 },
    ])
  })
})
