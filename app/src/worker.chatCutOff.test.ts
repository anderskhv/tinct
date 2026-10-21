/**
 * A book-reader answer cut off by its length bound (Bible chat, 1 Maccabees 13,
 * 21 Oct 2026: "…then Diodorus Siculus, Justin/Trog" shown as finished).
 * The Worker continues once, into the same streamed answer, with the same
 * model, bound, effort and meter; still cut off, the reader's stream ends on
 * `max_tokens` so the client offers Continue. Every provider call is mocked.
 */
import { afterEach, describe, expect, it, vi } from 'vitest'
import { COMPANION_MODEL } from './companionModel'
import { COMPANION_MAX_TOKENS } from './companion/companionRequest'
import { CUT_OFF_CONTINUE_PROMPT, cutOffContinuationMessages, handleChat } from './worker/routes/chat'
import { createAllowanceGate } from './worker/lib/aiAllowance'

const userId = '11111111-1111-4111-8111-111111111111'
const env = {
  ANTHROPIC_API_KEY: 'anthropic-key',
  SUPABASE_URL: 'https://example.supabase.co',
  SUPABASE_SERVICE_ROLE_KEY: 'service-role',
}
const signedIn = async () => ({ id: userId, email: 'reader@example.com' })
const options = { allowanceGate: createAllowanceGate(env, false), isInternalAccount: async () => false }

const PARTIAL = 'For the Hasmonean story, start with 1 Maccabees itself, then Josephus. Polybius for the earlier background, then Diodorus Siculus, Justin/Trog'
const REST = 'us for the Seleucid side.'

function ctx() {
  const pending: Promise<unknown>[] = []
  return { ctx: { waitUntil: (promise: Promise<unknown>) => { pending.push(Promise.resolve(promise)) } } as unknown as ExecutionContext, pending }
}

function sse(type: string, data: Record<string, unknown>) {
  return `event: ${type}\ndata: ${JSON.stringify({ type, ...data })}\n\n`
}

function sseResponse(chunks: string[]) {
  const encoder = new TextEncoder()
  let index = 0
  return new Response(new ReadableStream<Uint8Array>({
    pull(controller) {
      if (index >= chunks.length) { controller.close(); return }
      controller.enqueue(encoder.encode(chunks[index++]))
    },
  }), { status: 200, headers: { 'content-type': 'text/event-stream; charset=utf-8' } })
}

/** One streamed round: thinking, then text, ending on `stopReason`. */
function round(text: string, stopReason: string, usage = { input_tokens: 100, output_tokens: 3072 }) {
  return sseResponse([
    sse('message_start', { message: { usage: { input_tokens: usage.input_tokens } } }),
    sse('content_block_start', { index: 0, content_block: { type: 'thinking', thinking: '' } }),
    sse('content_block_delta', { index: 0, delta: { type: 'thinking_delta', thinking: 'Which sources cover 1 Maccabees 13?' } }),
    sse('content_block_stop', { index: 0 }),
    sse('content_block_start', { index: 1, content_block: { type: 'text', text: '' } }),
    sse('content_block_delta', { index: 1, delta: { type: 'text_delta', text } }),
    sse('content_block_stop', { index: 1 }),
    sse('message_delta', { delta: { stop_reason: stopReason }, usage: { output_tokens: usage.output_tokens } }),
    sse('message_stop', {}),
  ])
}

async function readAll(response: Response): Promise<string> {
  const reader = response.body!.getReader()
  const decoder = new TextDecoder()
  let text = ''
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    text += decoder.decode(value, { stream: true })
  }
  return text
}

/** The text a reader's client joins from the stream, as labCompanion.readAnthropicStream does. */
function streamedText(sseText: string): string {
  return sseText.split('\n')
    .filter(line => line.startsWith('data:'))
    .map(line => JSON.parse(line.slice(5)) as { type?: string; delta?: { type?: string; text?: string } })
    .filter(event => event.type === 'content_block_delta' && event.delta?.type === 'text_delta')
    .map(event => event.delta!.text)
    .join('')
}

function stopReasons(sseText: string): string[] {
  return [...sseText.matchAll(/"stop_reason":"([a-z_]+)"/g)].map(match => match[1])
}

const askContext = {
  bookTitle: 'The Bible', bookAuthor: 'Various', chapterLabel: '1 Maccabees 13', paragraphs: ['Simon gathered the people.'], paragraphIndex: 0,
}

function chatRequest(body: unknown) {
  return new Request('https://tinct.app/api/chat', { method: 'POST', body: JSON.stringify(body), headers: { 'content-type': 'application/json' } })
}

function stubProviders(rounds: Array<() => Response>) {
  const bodies: Array<Record<string, unknown>> = []
  const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input)
    if (url.includes('/rest/v1/rpc/use_message')) return Response.json({})
    if (url.includes('/rest/v1/ai_usage_events')) return new Response(null, { status: 201 })
    if (url !== 'https://api.anthropic.com/v1/messages') return Response.json({ error: 'unexpected fetch' }, { status: 500 })
    bodies.push(JSON.parse(String(init?.body)) as Record<string, unknown>)
    const next = rounds[bodies.length - 1]
    return next ? next() : Response.json({ error: 'unexpected round' }, { status: 500 })
  })
  vi.stubGlobal('fetch', fetchMock)
  const ledger = () => fetchMock.mock.calls
    .filter(call => String(call[0]).includes('/rest/v1/ai_usage_events'))
    .map(call => JSON.parse(String((call[1] as RequestInit).body)) as Record<string, unknown>)
  const charges = () => fetchMock.mock.calls.filter(call => String(call[0]).includes('/rest/v1/rpc/use_message')).length
  return { bodies, ledger, charges }
}

function bookAssets() {
  return {
    fetch: async (request: Request) => {
      const path = new URL(request.url).pathname
      if (path.endsWith('/manifest.json')) return Response.json({ chapters: [{ number: 1, title: '1 Maccabees 13', path: 'ch0001.json' }] })
      return Response.json({ number: 1, title: '1 Maccabees 13', paragraphs: ['Simon gathered the people.'] })
    },
  }
}

describe('a cut-off reader answer', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('gives Ask room for its thinking and a long answer, on the companion model at medium effort', () => {
    expect(COMPANION_MAX_TOKENS.ask).toBe(3072)
    expect(COMPANION_MAX_TOKENS.chapter).toBe(3072)
  })

  it('continues a book-grounded Ask once, streams one joined answer, meters both calls and charges once', async () => {
    vi.spyOn(console, 'log').mockImplementation(() => {})
    const { bodies, ledger, charges } = stubProviders([
      () => round(PARTIAL, 'max_tokens'),
      () => round(REST, 'end_turn', { input_tokens: 120, output_tokens: 400 }),
    ])
    const { ctx: context, pending } = ctx()
    const response = await handleChat(chatRequest({
      stream: true,
      companion: { intent: 'ask', context: { ...askContext, bookId: 'bible', editionKey: 'kjv-en', chapterNumber: 1 } },
      messages: [{ role: 'user', content: 'Which ancient sources tell this story?' }],
    }), { ...env, ASSETS: bookAssets() }, context, signedIn, async () => true, options)

    expect(response.status).toBe(200)
    const text = await readAll(response)
    await Promise.all(pending)

    // One answer: the continuation joins mid-word, and the stream ends once, finished.
    expect(streamedText(text)).toBe(`${PARTIAL}${REST}`)
    expect(stopReasons(text)).toEqual(['end_turn'])
    expect((text.match(/^event: message_start$/gm) || []).length).toBe(1)
    expect((text.match(/^event: message_stop$/gm) || []).length).toBe(1)

    // The answer's own settings, on both calls; the continuation writes only (same tools, none callable).
    expect(bodies).toHaveLength(2)
    for (const body of bodies) {
      expect(body).toMatchObject({ model: COMPANION_MODEL, max_tokens: COMPANION_MAX_TOKENS.ask, output_config: { effort: 'medium' }, stream: true })
      expect(body.thinking).toBeUndefined()
    }
    expect(bodies[1].system).toEqual(bodies[0].system)
    expect((bodies[0].tools as Array<{ name: string }>).map(tool => tool.name)).toEqual(['read_chapter', 'find_in_book'])
    expect(bodies[1].tools).toEqual(bodies[0].tools)
    expect(bodies[1].tool_choice).toEqual({ type: 'none' })
    const continued = bodies[1].messages as Array<{ role: string; content: unknown }>
    expect(continued.slice(0, -2)).toEqual(bodies[0].messages)
    expect(continued.at(-2)).toEqual({ role: 'assistant', content: PARTIAL })
    expect(continued.at(-1)).toEqual({ role: 'user', content: CUT_OFF_CONTINUE_PROMPT })

    // Metered per provider call, as the reader's chat; one message charged.
    expect(ledger()).toEqual([
      expect.objectContaining({ feature: 'chat', model: COMPANION_MODEL, input_tokens: 100, output_tokens: 3072 }),
      expect.objectContaining({ feature: 'chat', model: COMPANION_MODEL, input_tokens: 120, output_tokens: 400 }),
    ])
    expect(charges()).toBe(1)
  })

  it('ends the stream on max_tokens when the continuation is cut off too, after one continuation only', async () => {
    vi.spyOn(console, 'log').mockImplementation(() => {})
    const { bodies, ledger, charges } = stubProviders([
      () => round(PARTIAL, 'max_tokens'),
      () => round(' and more', 'max_tokens'),
    ])
    const { ctx: context, pending } = ctx()
    const response = await handleChat(chatRequest({
      stream: true,
      companion: { intent: 'ask', context: { ...askContext, bookId: 'bible', editionKey: 'kjv-en', chapterNumber: 1 } },
      messages: [{ role: 'user', content: 'Which ancient sources tell this story?' }],
    }), { ...env, ASSETS: bookAssets() }, context, signedIn, async () => true, options)
    const text = await readAll(response)
    await Promise.all(pending)
    expect(bodies).toHaveLength(2)
    expect(streamedText(text)).toBe(`${PARTIAL} and more`)
    expect(stopReasons(text)).toEqual(['max_tokens'])
    expect((text.match(/^event: message_stop$/gm) || []).length).toBe(1)
    expect(text).not.toContain('"type":"error"')
    expect(ledger()).toHaveLength(2)
    expect(charges()).toBe(1)
  })

  it('still offers Continue when the continuation call fails', async () => {
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    const { bodies } = stubProviders([
      () => round(PARTIAL, 'max_tokens'),
      () => Response.json({ type: 'error', error: { type: 'invalid_request_error', message: 'no' } }, { status: 400 }),
    ])
    const { ctx: context, pending } = ctx()
    const response = await handleChat(chatRequest({
      stream: true,
      companion: { intent: 'ask', context: { ...askContext, bookId: 'bible', editionKey: 'kjv-en', chapterNumber: 1 } },
      messages: [{ role: 'user', content: 'Which ancient sources tell this story?' }],
    }), { ...env, ASSETS: bookAssets() }, context, signedIn, async () => true, options)
    const text = await readAll(response)
    await Promise.all(pending)
    expect(bodies).toHaveLength(2)
    expect(streamedText(text)).toBe(PARTIAL)
    expect(stopReasons(text)).toEqual(['max_tokens'])
  })

  it('continues a plain streamed companion answer (no book tools) the same way', async () => {
    vi.spyOn(console, 'log').mockImplementation(() => {})
    const { bodies, ledger, charges } = stubProviders([
      () => round(PARTIAL, 'max_tokens'),
      () => round(REST, 'end_turn', { input_tokens: 120, output_tokens: 400 }),
    ])
    const { ctx: context, pending } = ctx()
    // No ASSETS binding: the plain path, without the tool loop.
    const response = await handleChat(chatRequest({
      stream: true,
      companion: { intent: 'ask', context: askContext },
      messages: [{ role: 'user', content: 'Which ancient sources tell this story?' }],
    }), env, context, signedIn, async () => true, options)
    const text = await readAll(response)
    await Promise.all(pending)
    expect(streamedText(text)).toBe(`${PARTIAL}${REST}`)
    expect(stopReasons(text)).toEqual(['end_turn'])
    expect((text.match(/^event: message_stop$/gm) || []).length).toBe(1)
    expect(bodies).toHaveLength(2)
    expect(bodies[1]).toMatchObject({ model: COMPANION_MODEL, max_tokens: COMPANION_MAX_TOKENS.ask, output_config: { effort: 'medium' } })
    expect((bodies[1].messages as unknown[]).slice(-2)).toEqual([{ role: 'assistant', content: PARTIAL }, { role: 'user', content: CUT_OFF_CONTINUE_PROMPT }])
    expect(ledger()).toHaveLength(2)
    expect(charges()).toBe(1)
  })

  it('leaves a finished answer alone: one call, no continuation', async () => {
    const { bodies } = stubProviders([() => round('A whole answer.', 'end_turn')])
    const { ctx: context, pending } = ctx()
    const response = await handleChat(chatRequest({
      stream: true,
      companion: { intent: 'ask', context: askContext },
      messages: [{ role: 'user', content: 'Who was Simon?' }],
    }), env, context, signedIn, async () => true, options)
    const text = await readAll(response)
    await Promise.all(pending)
    expect(bodies).toHaveLength(1)
    expect(stopReasons(text)).toEqual(['end_turn'])
  })

  it('answers the reader’s Continue with the cut-off answer, then the request for the rest', async () => {
    vi.spyOn(console, 'log').mockImplementation(() => {})
    const { bodies, charges } = stubProviders([() => round(REST, 'end_turn')])
    const { ctx: context, pending } = ctx()
    const response = await handleChat(chatRequest({
      stream: true,
      continue: true,
      companion: { intent: 'ask', context: askContext },
      messages: [
        { role: 'user', content: 'Which ancient sources tell this story?' },
        { role: 'assistant', content: PARTIAL },
      ],
    }), env, context, signedIn, async () => true, options)
    const text = await readAll(response)
    await Promise.all(pending)
    expect(streamedText(text)).toBe(REST)
    expect(bodies).toHaveLength(1)
    expect((bodies[0].messages as unknown[]).slice(-2)).toEqual([{ role: 'assistant', content: PARTIAL }, { role: 'user', content: CUT_OFF_CONTINUE_PROMPT }])
    expect(charges()).toBe(1)
  })

  it('refuses a Continue whose last turn is not an answer', async () => {
    const { bodies } = stubProviders([])
    const { ctx: context } = ctx()
    const response = await handleChat(chatRequest({
      stream: true,
      continue: true,
      companion: { intent: 'ask', context: askContext },
      messages: [{ role: 'user', content: 'Which ancient sources tell this story?' }],
    }), env, context, signedIn, async () => true, options)
    expect(response.status).toBe(400)
    expect(bodies).toHaveLength(0)
  })

  it('asks again when nothing was written before the bound (thinking used it all)', () => {
    const messages = [{ role: 'user', content: 'Question' }]
    expect(cutOffContinuationMessages(messages, '')).toEqual(messages)
    expect(cutOffContinuationMessages(messages, 'Half an answer ')).toEqual([
      ...messages,
      { role: 'assistant', content: 'Half an answer' },
      { role: 'user', content: CUT_OFF_CONTINUE_PROMPT },
    ])
  })
})
