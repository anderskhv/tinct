/**
 * The two speed trials switched on (marginRoutes.ts QUIZ_THINKING_OFF and FACTCHECK_VERDICT_EFFORT;
 * both off in the code, round 1 of 15 Oct): what the Worker sends with each on. The module is mocked
 * here exactly as the one-line switches would set it. Every provider call is mocked.
 */
import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('./companion/marginRoutes', async importOriginal => {
  const real = await importOriginal<typeof import('./companion/marginRoutes')>()
  return {
    ...real,
    MARGIN_ROUTES: Object.freeze({ ...real.MARGIN_ROUTES, quiz: real.quizRoute(true) }),
    factcheckVerdictEffort: () => real.factcheckVerdictEffort('low'),
  }
})

const { handleChat } = await import('./worker/routes/chat')
const { createAllowanceGate } = await import('./worker/lib/aiAllowance')
const real = await vi.importActual<typeof import('./companion/marginRoutes')>('./companion/marginRoutes')

const reader = async () => ({ id: '11111111-1111-4111-8111-111111111111', email: 'reader@example.com' })
const env = { ANTHROPIC_API_KEY: 'anthropic-key', OPENAI_API_KEY: 'openai-key', SUPABASE_URL: 'https://example.supabase.co', SUPABASE_SERVICE_ROLE_KEY: 'service-role' }
const document = { kind: 'pdf', units: [{ n: 1, text: 'Entropy. The entropy is the logarithm of the number of states.' }, { n: 2, text: 'S = k log W.' }] }
const context = { kind: 'pdf', bookTitle: 'Thermal Physics', bookAuthor: 'C. Kittel', chapterLabel: 'Page 2', pages: [{ n: 2, text: 'S = k log W.' }], paragraphIndex: 0, pageNumber: 2, totalPages: 2 }
const sse = (type: string, data: Record<string, unknown>) => `event: ${type}\ndata: ${JSON.stringify({ type, ...data })}\n\n`
const round = (text: string) => [
  sse('message_start', { message: { usage: { input_tokens: 5 } } }),
  sse('content_block_start', { index: 0, content_block: { type: 'text', text: '' } }),
  sse('content_block_delta', { index: 0, delta: { type: 'text_delta', text } }),
  sse('content_block_stop', { index: 0 }),
  sse('message_delta', { delta: { stop_reason: 'end_turn' }, usage: { output_tokens: 3 } }),
  sse('message_stop', {}),
].join('')

function stubFetch() {
  const anthropic: Array<Record<string, unknown>> = []
  vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input)
    if (url.includes('/rest/v1/ai_usage_events')) return new Response(null, { status: 201 })
    if (url.includes('/rest/v1/profiles')) return Response.json([{ messages_used_this_period: 0, message_balance: 5, subscription_status: 'active', subscription_period_end: null, created_at: '2026-06-01T12:00:00Z' }])
    if (url.includes('/rpc/use_message')) return Response.json({})
    if (url === 'https://api.openai.com/v1/responses') return Response.json({ status: 'completed', output: [{ type: 'message', content: [{ text: 'S = k log W is standard.', annotations: [{ type: 'url_citation', url: 'https://en.wikipedia.org/wiki/Entropy', title: 'Entropy' }] }] }], usage: { input_tokens: 10, output_tokens: 5 } })
    if (url === 'https://api.anthropic.com/v1/messages') {
      const body = JSON.parse(String(init?.body))
      anthropic.push(body)
      if (body.stream) return new Response(round(anthropic.length === 1 ? 'The passage gives the definition {p. 2}.' : 'Holds. Standard.\n\nSources: [Entropy](https://en.wikipedia.org/wiki/Entropy)'), { headers: { 'content-type': 'text/event-stream' } })
      return Response.json({ content: [{ type: 'text', text: '{"questions":[{"q":"Q?","answer":"A","why":"W","cite":""}]}' }], stop_reason: 'end_turn', usage: { input_tokens: 10, output_tokens: 5 } })
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

describe('speed trials switched on', () => {
  it('QUIZ_THINKING_OFF: the quiz goes with thinking disabled at effort low', async () => {
    expect(real.QUIZ_THINKING_OFF).toBe(true)
    const { anthropic } = stubFetch()
    const { status } = await send({ companion: { intent: 'quiz', context, document, selection: 'S = k log W.' } })
    expect(status).toBe(200)
    expect(anthropic).toHaveLength(1)
    expect(anthropic[0].model).toBe(real.MARGIN_HAIKU_MODEL)
    expect(anthropic[0].thinking).toEqual({ type: 'disabled' })
    expect(anthropic[0].output_config).toEqual({ effort: 'low' })
  })

  it('FACTCHECK_VERDICT_EFFORT = low: the verdict round after the opening goes at effort low, adaptive', async () => {
    expect(real.FACTCHECK_VERDICT_EFFORT).toBe('low')
    const { anthropic } = stubFetch()
    const { status, text } = await send({ stream: true, companion: { intent: 'factcheck', context, document, selection: 'S = k log W.' } })
    expect(status).toBe(200)
    expect(text).toContain('Holds. Standard.')
    expect(anthropic).toHaveLength(2)
    expect(anthropic[0].output_config).toEqual({ effort: real.FACTCHECK_OPENING_ROUTE.effort })
    expect(anthropic[1].output_config).toEqual({ effort: 'low' })
    expect(anthropic[1]).not.toHaveProperty('thinking')
    expect(anthropic[1].max_tokens).toBe(real.MARGIN_ROUTES.factcheck.maxTokens)
  })
  // Round 3 (16 Oct) trialled Counterpoint with thinking off; the night run's final round (16 Oct) found it worse
  // (3.80 -> 3.26, ResNet cut off), so the switch is off: adaptive thinking at effort low with 6000 tokens.
  it('COUNTERPOINT_THINKING_OFF is off: Counterpoint thinks adaptively at effort low with 6000 tokens, one sharp objection and no author\'s reply', async () => {
    expect(real.COUNTERPOINT_THINKING_OFF).toBe(false)
    expect(real.MARGIN_ROUTES.counterpoint).toEqual(real.counterpointRoute(false))
    expect(real.counterpointRoute(false)).toEqual({ model: real.MARGIN_HAIKU_MODEL, effort: 'low', maxTokens: 6000 })
    // The trial's route, kept behind the switch.
    expect(real.counterpointRoute(true)).toEqual({ model: real.MARGIN_HAIKU_MODEL, effort: 'low', maxTokens: 400, thinking: { type: 'disabled' } })
    const { anthropic } = stubFetch()
    const { status } = await send({ stream: true, companion: { intent: 'counterpoint', context, document, selection: 'S = k log W.' } })
    expect(status).toBe(200)
    expect(anthropic).toHaveLength(1)
    expect(anthropic[0].model).toBe(real.MARGIN_HAIKU_MODEL)
    expect(anthropic[0]).not.toHaveProperty('thinking')
    expect(anthropic[0].output_config).toEqual({ effort: 'low' })
    expect(anthropic[0].max_tokens).toBe(6000)
    const system = JSON.stringify(anthropic[0].system)
    expect(system).toContain('Give one sharp objection')
    expect(system).toContain('say so plainly')
    expect(system).not.toContain('best reply.')
    expect(system).toContain('About 120 words in all')
  })
})
