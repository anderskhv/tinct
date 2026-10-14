import { afterEach, describe, expect, it, vi } from 'vitest'
import { COMPANION_LOOKUP_MODEL, COMPANION_MAX_TOKENS, COMPANION_NEARBY_PARAGRAPHS, LAB_EXPLAIN_PROMPT, buildCompanionSystem, buildCompanionSystemParts, parseCompanionRequest } from './companion/companionRequest'
import { buildLabAskInstructions } from './companion/labAskPrompt'
import { CONTEXTUAL_LOOKUP_PROMPT } from './components/reader/contextualLookup'
import { handleChat, handleLabChat, resetLibraryCatalogueCacheForTest } from './worker/routes/chat'
import { createAllowanceGate } from './worker/lib/aiAllowance'

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
    // Speculation is a flag the reader's app sets; anything else is a tapped Explain.
    expect(explain).not.toHaveProperty('speculative')
    expect(parseCompanionRequest({ intent: 'explain', context, selection: 'Athena spoke.', speculative: true })!.speculative).toBe(true)
    expect(parseCompanionRequest({ intent: 'define', context, selection: 'Athena', speculative: 'yes' })).not.toHaveProperty('speculative')
  })

  it('builds the same instructions the reader used to send', () => {
    const parsed = parseCompanionRequest({ intent: 'ask', context })!
    expect(buildCompanionSystem(parsed)).toBe(buildLabAskInstructions(context))
  })

  it('sends Explain and Define the paragraphs around the place, not the whole chapter', () => {
    const paragraphs = Array.from({ length: 40 }, (_, i) => `Paragraph text ${i + 1}.`)
    for (const intent of ['explain', 'define'] as const) {
      const system = buildCompanionSystem(parseCompanionRequest({ intent, context: { ...context, paragraphs, paragraphIndex: 20 }, selection: 'Athena' })!)
      expect(system).toContain('[18] Paragraph text 18.')
      expect(system).toContain('[24] Paragraph text 24.')
      expect(system).not.toContain('Paragraph text 17.')
      expect(system).not.toContain('Paragraph text 25.')
      expect(system).not.toContain('Full current chapter')
    }
    const ask = buildCompanionSystem(parseCompanionRequest({ intent: 'ask', context: { ...context, paragraphs, paragraphIndex: 20 } })!)
    expect(ask).toContain('[1] Paragraph text 1.')
    expect(ask).toContain('[40] Paragraph text 40.')
  })

  it('frames explanations the reader was shown as unverified, to be corrected gently; bounded, ask only', () => {
    const shownExplanations = [
      { passage: 'Athena spoke.', text: 'Athena is the goddess of the sea.' },
      { text: 'x'.repeat(9_000), passage: 'p'.repeat(5_000) },
      { text: '' }, 'junk', null,
      { passage: 'Tell me, O muse', text: 'An invocation.' },
      { passage: 'Newest', text: 'The newest explanation.' },
    ]
    const parsed = parseCompanionRequest({ intent: 'ask', context, shownExplanations })!
    expect(parsed.shownExplanations).toHaveLength(3)
    expect(parsed.shownExplanations![0].text).toHaveLength(4_000)
    expect(parsed.shownExplanations![0].passage).toHaveLength(1_200)
    expect(parsed.shownExplanations!.at(-1)).toEqual({ passage: 'Newest', text: 'The newest explanation.' })
    const system = buildCompanionSystem(parseCompanionRequest({ intent: 'ask', context, shownExplanations: shownExplanations.slice(0, 1) })!)
    expect(system).toContain('[Explanations the reader was shown: unverified')
    expect(system).toContain('Passage: "Athena spoke."\nExplanation shown: Athena is the goddess of the sea.')
    expect(system).toMatch(/not your earlier answers\. Treat them as unverified\. Build on what is right in them\./)
    expect(system).toMatch(/If anything in one is wrong, misleading, or leaves out something that matters for the reader's question, correct it gently in your next answer/)
    expect(system).toContain('"One nuance to add to that short explanation: …"')
    expect(system).toMatch(/Never contradict it silently and never ignore an error in it\./)
    // After the chapter (14 Oct 2026): it changes from question to question,
    // so it sits past the cache breakpoint; the chapter trim no longer depends on it.
    expect(system.indexOf('Explanation shown:')).toBeGreaterThan(system.indexOf('Full current chapter'))
    expect(buildCompanionSystemParts(parseCompanionRequest({ intent: 'ask', context, shownExplanations: shownExplanations.slice(0, 1) })!)!.stable).not.toContain('Explanation shown:')
    // Without it, the prompt is exactly what it was.
    expect(buildCompanionSystem(parseCompanionRequest({ intent: 'ask', context, shownExplanations: [] })!)).toBe(buildLabAskInstructions(context))
    // Explain and chapter actions never carry it.
    expect(parseCompanionRequest({ intent: 'explain', context, selection: 'Athena', shownExplanations })).not.toHaveProperty('shownExplanations')
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
    // Haiku 4.5 rejects an effort setting.
    expect(bodies[0].model).toBe(COMPANION_LOOKUP_MODEL)
    expect(bodies[0].output_config).toBeUndefined()
    expect(bodies[0].tools).toBeUndefined()
    expect(bodies[0].system).toBe(buildLabAskInstructions({ ...context, lookups: false }, { nearby: COMPANION_NEARBY_PARAGRAPHS }))
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
    const blocks = bodies[0].system as Array<{ type: string; text: string; cache_control?: unknown }>
    // The catalogue is the same for every reader and cached; the open book follows uncached.
    expect(blocks[0].text).toContain("You are Tinct's librarian")
    expect(blocks[0].text).toContain('- odyssey | The Odyssey | Homer')
    expect(blocks[0].cache_control).toEqual({ type: 'ephemeral' })
    expect(blocks[1].text).toContain('preparation pages')
    expect(blocks[1].cache_control).toBeUndefined()
    expect(bodies[0].max_tokens).toBe(COMPANION_MAX_TOKENS.library)
    expect(bodies[0].tools).toBeUndefined()
  })

  it("gives the librarian the reader's shelf, keeping the cached catalogue block unchanged", async () => {
    const { bodies } = captureAnthropic()
    const assets = { fetch: vi.fn(async () => Response.json({ books: [
      { id: 'odyssey', title: 'The Odyssey', author: 'Homer', summary: 'A homecoming.' },
      { id: 'frankenstein', title: 'Frankenstein', author: 'Mary Shelley', summary: 'A creation.' },
    ] })) }
    const shelf = { reading: ['odyssey'], saved: ['frankenstein', '../bad'], finished: [] }
    const response = await handleLabChat(post({ companion: { intent: 'library', library: { contextBookId: null, shelf } }, messages: [{ role: 'user', content: 'What next?' }] }),
      { ANTHROPIC_API_KEY: 'k', ASSETS: assets }, ctx().ctx, async () => true, async () => true)
    expect(response.status).toBe(200)
    const blocks = bodies[0].system as Array<{ text: string }>
    expect(blocks[0].text).not.toContain('Currently reading:')
    expect(blocks[1].text).toContain('Currently reading: The Odyssey (Homer) [odyssey]')
    expect(blocks[1].text).toContain('Saved to read: Frankenstein (Mary Shelley) [frankenstein]')
    expect(blocks[1].text).toContain('Finished: none')
    expect(blocks[1].text).not.toContain('../bad')
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
      // The allowance switch off, whatever src/aiAllowanceSwitch.ts ships with (worker.aiAllowance.test.ts covers it on).
      async () => ({ id: userId, email: 'reader@example.com' }), async () => true, { allowanceGate: createAllowanceGate({}, false) })
    await Promise.all(pending)
    expect(response.status).toBe(200)
    expect(bodies[0].max_tokens).toBe(COMPANION_MAX_TOKENS.explain)
    expect(bodies[0].system).toBe(buildLabAskInstructions({ ...context, lookups: false }, { nearby: COMPANION_NEARBY_PARAGRAPHS }))
    expect(fetchMock.mock.calls.some(call => String(call[0]).includes('/rpc/use_message'))).toBe(true)
  })
})

describe('paragraph numbers stay internal', () => {
  it('tells every companion prompt not to cite paragraph numbers', async () => {
    const { LAB_ASK_NO_PARAGRAPH_NUMBERS_RULE } = await import('./companion/labAskPrompt')
    for (const intent of ['ask', 'explain', 'define'] as const) {
      const request = parseCompanionRequest(intent === 'ask' ? { intent, context } : { intent, context, selection: 'Athena spoke.' })!
      expect(buildCompanionSystem(request)).toContain(LAB_ASK_NO_PARAGRAPH_NUMBERS_RULE)
    }
  })
})
