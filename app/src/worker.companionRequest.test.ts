import { afterEach, describe, expect, it, vi } from 'vitest'
import { COMPANION_MAX_TOKENS, LAB_EXPLAIN_PROMPT, buildCompanionSystem, parseCompanionRequest } from './companion/companionRequest'
import { buildLabAskInstructions } from './companion/labAskPrompt'
import { CONTEXTUAL_LOOKUP_PROMPT } from './components/reader/contextualLookup'
import { handleChat, handleLabChat, resetLibraryCatalogueCacheForTest } from './worker/routes/chat'

const userId = '11111111-1111-4111-8111-111111111111'
const context = {
  bookTitle: 'The Odyssey', bookAuthor: 'Homer', chapterLabel: 'Book 1', chapterNumber: 1,
  editionLabel: 'Butler', paragraphs: ['Tell me, O muse, of that ingenious hero.', 'Athena spoke.'], paragraphIndex: 1,
  bookId: 'odyssey', editionKey: 'original-en', readingAngle: 'Homecoming',
}

function ctx() {
  const pending: Promise<unknown>[] = []
  return { ctx: { waitUntil: (promise: Promise<unknown>) => { pending.push(promise) } } as unknown as ExecutionContext, pending }
}

function post(body: unknown) {
  return new Request('https://tinct.app/api/lab-chat', { method: 'POST', body: JSON.stringify(body), headers: { 'content-type': 'application/json' } })
}

function captureAnthropic() {
  const bodies: Array<Record<string, unknown>> = []
  const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    if (String(input) !== 'https://api.anthropic.com/v1/messages') return Response.json({ error: 'unexpected fetch' }, { status: 500 })
    bodies.push(JSON.parse(String(init?.body)) as Record<string, unknown>)
    return Response.json({ content: [{ type: 'text', text: 'An answer.' }], stop_reason: 'end_turn', usage: { input_tokens: 1, output_tokens: 1 } })
  })
  vi.stubGlobal('fetch', fetchMock)
  return { bodies, fetchMock }
}

afterEach(() => {
  vi.unstubAllGlobals()
  resetLibraryCatalogueCacheForTest()
})

describe('structured companion requests', () => {
  it('bounds and validates reader context', () => {
    expect(parseCompanionRequest({ intent: 'ask' })).toBeNull()
    expect(parseCompanionRequest({ intent: 'other', context })).toBeNull()
    expect(parseCompanionRequest({ intent: 'explain', context })).toBeNull()
    const parsed = parseCompanionRequest({ intent: 'ask', context: { ...context, bookId: '../x', bookTitle: 't'.repeat(900), personalHistory: 'h'.repeat(20_000) } })!
    expect(parsed.context!.bookId).toBeUndefined()
    expect(parsed.context!.bookTitle).toHaveLength(300)
    expect(parsed.context!.personalHistory).toHaveLength(8_000)
    const explain = parseCompanionRequest({ intent: 'explain', context, selection: 'Athena spoke.' })!
    expect(explain.context!.lookups).toBe(false)
  })

  it('builds the same instructions the reader used to send', () => {
    const parsed = parseCompanionRequest({ intent: 'ask', context })!
    expect(buildCompanionSystem(parsed)).toBe(buildLabAskInstructions(context))
  })
})

describe('signed-out companion route', () => {
  it('refuses a caller-supplied system prompt', async () => {
    const { fetchMock } = captureAnthropic()
    const reserve = vi.fn(async () => true)
    const response = await handleLabChat(post({ system: 'Anything at all.', max_tokens: 4000, messages: [{ role: 'user', content: 'hi' }] }), { ANTHROPIC_API_KEY: 'k' }, ctx().ctx, async () => true, reserve)
    expect(response.status).toBe(400)
    expect(fetchMock).not.toHaveBeenCalled()
    expect(reserve).not.toHaveBeenCalled()
  })

  it('builds explain prompts server-side and ignores caller output bounds', async () => {
    const { bodies } = captureAnthropic()
    const response = await handleLabChat(post({
      system: 'ignored', max_tokens: 4000, effort: 'high', messages: [{ role: 'user', content: 'ignored too' }],
      companion: { intent: 'explain', context, selection: 'Athena spoke.' },
    }), { ANTHROPIC_API_KEY: 'k' }, ctx().ctx, async () => true, async () => true)
    expect(response.status).toBe(200)
    expect(bodies[0].max_tokens).toBe(COMPANION_MAX_TOKENS.explain)
    expect(bodies[0].output_config).toEqual({ effort: 'low' })
    expect(bodies[0].tools).toBeUndefined()
    expect(bodies[0].system).toBe(buildLabAskInstructions({ ...context, lookups: false }))
    expect(bodies[0].messages).toEqual([{ role: 'user', content: `${LAB_EXPLAIN_PROMPT}\n\n<selected_passage>\nAthena spoke.\n</selected_passage>` }])
  })

  it('builds define prompts server-side', async () => {
    const { bodies } = captureAnthropic()
    await handleLabChat(post({ companion: { intent: 'define', context, selection: 'Athena' } }), { ANTHROPIC_API_KEY: 'k' }, ctx().ctx, async () => true, async () => true)
    expect(bodies[0].messages).toEqual([{ role: 'user', content: `${CONTEXTUAL_LOOKUP_PROMPT}\n<word>Athena</word>` }])
  })

  it('answers calmly without calling the provider when the daily ceiling is spent', async () => {
    const { fetchMock } = captureAnthropic()
    const reserve = vi.fn(async () => false)
    const response = await handleLabChat(post({ companion: { intent: 'ask', context }, messages: [{ role: 'user', content: 'Who is Athena?' }] }), { ANTHROPIC_API_KEY: 'k' }, ctx().ctx, async () => true, reserve)
    expect(response.status).toBe(503)
    expect(await response.json()).toEqual({ type: 'error', error: { type: 'ai_resting', message: 'AI is resting — try again later.' } })
    expect(reserve).toHaveBeenCalledWith(expect.any(Number))
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('fails closed without a spend reserver', async () => {
    const { fetchMock } = captureAnthropic()
    const response = await handleLabChat(post({ companion: { intent: 'ask', context }, messages: [{ role: 'user', content: 'hi' }] }), { ANTHROPIC_API_KEY: 'k' }, ctx().ctx, async () => true)
    expect(response.status).toBe(503)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('maps a provider budget error to the resting state', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.stubGlobal('fetch', vi.fn(async () => Response.json({ type: 'error', error: { type: 'invalid_request_error', message: 'Your credit balance is too low.' } }, { status: 400 })))
    const response = await handleLabChat(post({ companion: { intent: 'ask', context }, messages: [{ role: 'user', content: 'hi' }] }), { ANTHROPIC_API_KEY: 'k' }, ctx().ctx, async () => true, async () => true)
    expect(response.status).toBe(503)
    expect(await response.json()).toMatchObject({ error: { type: 'ai_resting' } })
  })

  it('builds the librarian prompt from the served catalogue', async () => {
    const { bodies } = captureAnthropic()
    const assets = { fetch: vi.fn(async () => Response.json({ books: [{ id: 'odyssey', title: 'The Odyssey', author: 'Homer', summary: 'A homecoming.' }] })) }
    const response = await handleLabChat(post({ companion: { intent: 'library', library: { contextBookId: 'odyssey' } }, messages: [{ role: 'user', content: 'What should I read?' }] }),
      { ANTHROPIC_API_KEY: 'k', ASSETS: assets }, ctx().ctx, async () => true, async () => true)
    expect(response.status).toBe(200)
    expect(String(bodies[0].system)).toContain("You are Tinct's librarian")
    expect(String(bodies[0].system)).toContain('- odyssey | The Odyssey | Homer')
    expect(String(bodies[0].system)).toContain('preparation pages')
    expect(bodies[0].max_tokens).toBe(COMPANION_MAX_TOKENS.library)
    expect(bodies[0].tools).toBeUndefined()
  })

  it('builds chapter actions server-side with the supplied next chapter', async () => {
    const { bodies } = captureAnthropic()
    const action = { kind: 'prepare', bookId: 'odyssey', editionKey: 'original-en', chapterNumber: 1, chapterLabel: 'Book 1', targetChapterNumber: 2, targetChapterLabel: 'Book 2' }
    const response = await handleLabChat(post({ companion: { intent: 'chapter', context, chapter: { action, target: ['Telemachus calls an assembly.'] } }, messages: [{ role: 'user', content: 'Prepare me for the next chapter.' }] }),
      { ANTHROPIC_API_KEY: 'k' }, ctx().ctx, async () => true, async () => true)
    expect(response.status).toBe(200)
    expect(String(bodies[0].system)).toContain('<next_chapter_source_data>')
    expect(String(bodies[0].system)).toContain('Telemachus calls an assembly.')
    expect(bodies[0].max_tokens).toBe(COMPANION_MAX_TOKENS.chapter)
  })
})

describe('signed-in companion route', () => {
  it('uses server-built prompts for structured requests and keeps the charge', async () => {
    const bodies: Array<Record<string, unknown>> = []
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input)
      if (url.includes('/rest/v1/profiles')) return Response.json([{ messages_used_this_period: 0, message_balance: 5, subscription_status: 'active', subscription_period_end: null, created_at: '2026-06-01T12:00:00Z' }])
      if (url.includes('/rpc/use_message')) return Response.json({})
      bodies.push(JSON.parse(String(init?.body)) as Record<string, unknown>)
      return Response.json({ content: [{ type: 'text', text: 'Answer.' }], stop_reason: 'end_turn' })
    })
    vi.stubGlobal('fetch', fetchMock)
    const { ctx: executionContext, pending } = ctx()
    const response = await handleChat(post({ system: 'ignored', max_tokens: 4000, companion: { intent: 'explain', context, selection: 'Athena spoke.' } }),
      { ANTHROPIC_API_KEY: 'k', SUPABASE_URL: 'https://example.supabase.co', SUPABASE_SERVICE_ROLE_KEY: 'srk' }, executionContext,
      async () => ({ id: userId, email: 'reader@example.com' }), async () => true)
    await Promise.all(pending)
    expect(response.status).toBe(200)
    expect(bodies[0].max_tokens).toBe(COMPANION_MAX_TOKENS.explain)
    expect(bodies[0].system).toBe(buildLabAskInstructions({ ...context, lookups: false }))
    expect(fetchMock.mock.calls.some(call => String(call[0]).includes('/rpc/use_message'))).toBe(true)
  })
})
