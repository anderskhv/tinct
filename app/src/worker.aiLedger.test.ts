import { afterEach, describe, expect, it, vi } from 'vitest'
import { COMPANION_MODEL } from './companionModel'
import { GROK_VOICE_MODEL } from './voice/grokConfig'
import {
  AI_PRICING,
  AI_PRICING_VERSION,
  anthropicCostUsd,
  buildUsageRow,
  hashGuestKey,
  narrationCostUsd,
  recordAiUsage,
  sourceSearchCostUsd,
  talkCostUsd,
  type AiUsageRow,
} from './worker/lib/aiUsage'
import { handleChat, handleLabChat } from './worker/routes/chat'
import { handleLabCatchUp } from './worker/routes/labCatchUp'
import { handleLabRecap } from './worker/routes/labRecap'
import { handleVoiceResearch } from './worker/routes/voiceResearch'
import { handleVoiceSession, handleVoiceUsage, TALK_SESSION_MAX_SECONDS, XAI_CLIENT_SECRETS_URL } from './worker/routes/voice'
import { resetBookRetrievalCache } from './worker/lib/bookRetrieval'

const userId = '11111111-1111-4111-8111-111111111111'
const env = {
  ANTHROPIC_API_KEY: 'anthropic-key',
  OPENAI_API_KEY: 'openai-key',
  XAI_API_KEY: 'xai-key',
  SUPABASE_URL: 'https://example.supabase.co',
  SUPABASE_SERVICE_ROLE_KEY: 'service-role',
}
const profile = [{ messages_used_this_period: 0, message_balance: 5, subscription_status: 'active', subscription_period_end: null, created_at: '2026-06-01T12:00:00Z' }]
const ledgerUrl = 'https://example.supabase.co/rest/v1/ai_usage_events'

function context() {
  const pending: Promise<unknown>[] = []
  return { ctx: { waitUntil: (promise: Promise<unknown>) => { pending.push(Promise.resolve(promise)) } } as unknown as ExecutionContext, pending }
}

/** A fetch mock that answers the ledger, profiles and message charge, plus whatever `extra` handles. */
function stubFetch(extra: (url: string, init?: RequestInit) => Response | Promise<Response> | undefined) {
  const rows: AiUsageRow[] = []
  const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input)
    if (url === ledgerUrl) {
      rows.push(JSON.parse(String(init?.body)) as AiUsageRow)
      return new Response(null, { status: 201 })
    }
    if (url.includes('/rest/v1/profiles')) return Response.json(profile)
    if (url.includes('/rpc/use_message')) return Response.json({})
    return (await extra(url, init)) ?? Response.json({ error: 'unexpected fetch' }, { status: 500 })
  })
  vi.stubGlobal('fetch', fetchMock)
  return { rows, fetchMock }
}

const post = (path: string, body: unknown, headers: Record<string, string> = {}) =>
  new Request(`https://tinct.app${path}`, { method: 'POST', body: JSON.stringify(body), headers: { 'content-type': 'application/json', 'cf-connecting-ip': '203.0.113.9', ...headers } })

const reader = { id: userId, email: 'reader@example.com' }
const allow = async () => true
const readerContext = { bookTitle: 'The Bible', bookAuthor: 'Various', chapterLabel: 'Romans 1', paragraphs: ['Paul, a servant of Jesus Christ.'], paragraphIndex: 0 }

afterEach(() => { vi.unstubAllGlobals(); resetBookRetrievalCache() })

describe('pricing table', () => {
  it('is versioned and names Sonnet 5 at $2 / $10 with cache read $0.20 and write 1.25x', () => {
    expect(AI_PRICING_VERSION).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    expect(AI_PRICING.anthropic['claude-sonnet-5']).toEqual({ inputPerMTok: 2, outputPerMTok: 10, cacheReadPerMTok: 0.2, cacheWritePerMTok: 2.5 })
    expect(AI_PRICING.anthropic['claude-sonnet-5'].cacheWritePerMTok).toBe(AI_PRICING.anthropic['claude-sonnet-5'].inputPerMTok * 1.25)
  })

  it('prices Claude tokens, cache reads and cache writes separately', () => {
    // 1,000 in + 500 out + 2,000 cache read + 4,000 cache write
    expect(anthropicCostUsd('claude-sonnet-5', { input_tokens: 1000, output_tokens: 500, cache_read_input_tokens: 2000, cache_creation_input_tokens: 4000 }))
      .toBeCloseTo((1000 * 2 + 500 * 10 + 2000 * 0.2 + 4000 * 2.5) / 1e6, 8)
    expect(anthropicCostUsd('claude-sonnet-5', {})).toBe(0)
    // An unknown model is priced at the fallback rather than free.
    expect(anthropicCostUsd('claude-unknown', { input_tokens: 1_000_000 })).toBe(2)
    // Garbage counts never make a negative or NaN cost.
    expect(anthropicCostUsd('claude-sonnet-5', { input_tokens: -5, output_tokens: Number.NaN })).toBe(0)
  })

  it('prices Talk per connected minute, narration per character and search per token plus per call', () => {
    expect(talkCostUsd(90)).toBe(0.12)
    expect(talkCostUsd(0)).toBe(0)
    expect(narrationCostUsd(20_000)).toBe(0.3)
    expect(sourceSearchCostUsd({ input_tokens: 3000, output_tokens: 500, input_tokens_details: { cached_tokens: 1000 } }, 1))
      .toBeCloseTo((2000 * 2 + 1000 * 0.5 + 500 * 8) / 1e6 + 0.01, 8)
    expect(sourceSearchCostUsd(undefined, 2)).toBe(0.02)
  })
})

describe('ledger rows', () => {
  it('store exactly the schema fields and nothing that could hold content', () => {
    const row = buildUsageRow({
      feature: 'chat', provider: 'anthropic', model: 'claude-sonnet-5', cost_usd: 0.001,
      input_tokens: 10, output_tokens: 5,
      // Content smuggled in through a loosely typed caller must not survive.
      ...({ text: 'secret message', prompt: 'system prompt', query: 'search words', audio: 'AAAA' } as object),
    }, { userId, guestKey: null })
    expect(Object.keys(row).sort()).toEqual([
      'book_id', 'cache_hit', 'cache_read_tokens', 'cache_write_tokens', 'chars', 'cost_usd', 'feature', 'guest_key',
      'input_tokens', 'model', 'output_tokens', 'provider', 'seconds', 'user_id',
    ])
    expect(JSON.stringify(row)).not.toMatch(/secret|system prompt|search words|AAAA/)
  })

  it('attributes to the account when there is one, else to the hashed guest key, and rejects malformed ids', () => {
    const draft = { feature: 'lab_chat' as const, provider: 'anthropic' as const, model: 'm', cost_usd: 0 }
    expect(buildUsageRow(draft, { userId, guestKey: 'abc' })).toMatchObject({ user_id: userId, guest_key: null })
    expect(buildUsageRow(draft, { userId: null, guestKey: 'abc' })).toMatchObject({ user_id: null, guest_key: 'abc' })
    expect(buildUsageRow(draft, { userId: 'not-a-uuid', guestKey: 'abc' })).toMatchObject({ user_id: null, guest_key: 'abc' })
  })

  it('hashes the guest key: stable, keyed, and never the raw IP', async () => {
    const a = await hashGuestKey(env, '203.0.113.9')
    expect(a).toMatch(/^[0-9a-f]{20}$/)
    expect(a).toBe(await hashGuestKey(env, '203.0.113.9'))
    expect(a).not.toContain('203')
    expect(a).not.toBe(await hashGuestKey({ ...env, AI_LEDGER_SALT: 'other' }, '203.0.113.9'))
  })

  it('writes in the background and swallows every failure', async () => {
    const { ctx, pending } = context()
    vi.stubGlobal('fetch', vi.fn(async () => { throw new Error('supabase down') }))
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    expect(() => recordAiUsage(env, ctx, { guest: '1.2.3.4' }, { feature: 'talk', provider: 'xai', model: 'm', cost_usd: 0 })).not.toThrow()
    await expect(Promise.all(pending)).resolves.toBeDefined()
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('ai_usage_write_failed'))
    expect(warn.mock.calls.flat().join(' ')).not.toContain('1.2.3.4')
    // No context and no database configuration are also harmless.
    expect(() => recordAiUsage(env, undefined, {}, { feature: 'talk', provider: 'xai', model: 'm', cost_usd: 0 })).not.toThrow()
    recordAiUsage({}, ctx, {}, { feature: 'talk', provider: 'xai', model: 'm', cost_usd: 0 })
    warn.mockRestore()
  })
})

describe('Anthropic call paths write one row each', () => {
  it('chat: a signed-in typed question, with cache tokens priced', async () => {
    const { rows } = stubFetch(url => url === 'https://api.anthropic.com/v1/messages'
      ? Response.json({ content: [{ text: 'An answer.' }], usage: { input_tokens: 100, output_tokens: 40, cache_read_input_tokens: 500, cache_creation_input_tokens: 200 } })
      : undefined)
    const { ctx, pending } = context()
    const response = await handleChat(post('/api/chat', { companion: { intent: 'ask', context: readerContext } }), env, ctx, async () => reader, allow)
    expect(response.status).toBe(200)
    await Promise.all(pending)
    expect(rows).toHaveLength(1)
    expect(rows[0]).toMatchObject({
      user_id: userId, guest_key: null, feature: 'chat', provider: 'anthropic', model: COMPANION_MODEL,
      input_tokens: 100, output_tokens: 40, cache_read_tokens: 500, cache_write_tokens: 200,
    })
    expect(rows[0].cost_usd).toBe(anthropicCostUsd(COMPANION_MODEL, { input_tokens: 100, output_tokens: 40, cache_read_input_tokens: 500, cache_creation_input_tokens: 200 }))
    expect(JSON.stringify(rows[0])).not.toContain('An answer')
  })

  it('explain: the structured explain intent is its own feature', async () => {
    const { rows } = stubFetch(url => url === 'https://api.anthropic.com/v1/messages'
      ? Response.json({ content: [{ text: 'It means this.' }], usage: { input_tokens: 30, output_tokens: 20 } }) : undefined)
    const { ctx, pending } = context()
    await handleChat(post('/api/chat', { companion: { intent: 'explain', context: readerContext, selection: 'a servant' } }), env, ctx, async () => reader, allow)
    await Promise.all(pending)
    expect(rows.map(row => row.feature)).toEqual(['explain'])
  })

  it('lab chat: a signed-out question is billed to the hashed IP key, never the raw one', async () => {
    const { rows } = stubFetch(url => url === 'https://api.anthropic.com/v1/messages'
      ? Response.json({ content: [{ text: 'Paul wrote it.' }], usage: { input_tokens: 12, output_tokens: 6 } }) : undefined)
    const { ctx, pending } = context()
    const response = await handleLabChat(post('/api/lab-chat', { companion: { intent: 'ask', context: readerContext } }), env, ctx, allow, async () => true)
    expect(response.status).toBe(200)
    await Promise.all(pending)
    expect(rows).toHaveLength(1)
    expect(rows[0]).toMatchObject({ user_id: null, feature: 'lab_chat' })
    expect(rows[0].guest_key).toMatch(/^[0-9a-f]{20}$/)
    expect(JSON.stringify(rows[0])).not.toContain('203.0.113.9')
  })

  it('librarian: the library intent is its own feature', async () => {
    const { rows } = stubFetch(url => url === 'https://api.anthropic.com/v1/messages'
      ? Response.json({ content: [{ text: 'Try the Odyssey.' }], usage: { input_tokens: 700, output_tokens: 30 } }) : undefined)
    const { ctx, pending } = context()
    const assets = { fetch: async () => Response.json({ books: [] }) }
    const response = await handleChat(post('/api/chat', { companion: { intent: 'library', library: {} } }), { ...env, ASSETS: assets }, ctx, async () => reader, allow)
    expect(response.status).toBe(200)
    await Promise.all(pending)
    expect(rows.map(row => row.feature)).toEqual(['librarian'])
  })

  it('streaming: usage from message_start and message_delta is merged, even when the client never reads the body', async () => {
    const encoder = new TextEncoder()
    const sse = [
      'event: message_start\ndata: {"type":"message_start","message":{"usage":{"input_tokens":120,"cache_read_input_tokens":80,"output_tokens":1}}}\n\n',
      'event: content_block_start\ndata: {"type":"content_block_start","index":0,"content_block":{"type":"text","text":""}}\n\n',
      'event: content_block_delta\ndata: {"type":"content_block_delta","index":0,"delta":{"type":"text_delta","text":"Hello"}}\n\n',
      'event: content_block_stop\ndata: {"type":"content_block_stop","index":0}\n\n',
      'event: message_delta\ndata: {"type":"message_delta","delta":{"stop_reason":"end_turn"},"usage":{"output_tokens":33}}\n\n',
      'event: message_stop\ndata: {"type":"message_stop"}\n\n',
    ]
    const { rows } = stubFetch(url => url === 'https://api.anthropic.com/v1/messages'
      ? new Response(new ReadableStream({ start(controller) { for (const chunk of sse) controller.enqueue(encoder.encode(chunk)); controller.close() } }), { headers: { 'Content-Type': 'text/event-stream' } })
      : undefined)
    const { ctx, pending } = context()
    const response = await handleChat(post('/api/chat', { stream: true, companion: { intent: 'ask', context: readerContext } }), env, ctx, async () => reader, allow)
    expect(response.status).toBe(200)
    await response.text()
    await Promise.all(pending)
    expect(rows).toHaveLength(1)
    expect(rows[0]).toMatchObject({ feature: 'chat', input_tokens: 120, output_tokens: 33, cache_read_tokens: 80 })
  })

  it('tool loop: every round is its own row', async () => {
    const chapter = { number: 1, title: 'Romans 1', paragraphs: ['Paul, a servant of Jesus Christ.'] }
    const assets = {
      fetch: async (request: Request) => {
        const path = new URL(request.url).pathname
        if (path.endsWith('/manifest.json')) return Response.json({ chapters: [{ number: 1, title: 'Romans 1', path: 'ch0001.json' }] })
        return path.endsWith('ch0001.json') ? Response.json(chapter) : new Response('nf', { status: 404 })
      },
    }
    let round = 0
    const { rows } = stubFetch(url => {
      if (url !== 'https://api.anthropic.com/v1/messages') return undefined
      round += 1
      return round === 1
        ? Response.json({ stop_reason: 'tool_use', content: [{ type: 'tool_use', id: 't1', name: 'read_chapter', input: { chapter: 'Romans 1' } }], usage: { input_tokens: 400, output_tokens: 20 } })
        : Response.json({ stop_reason: 'end_turn', content: [{ type: 'text', text: 'Done.' }], usage: { input_tokens: 900, output_tokens: 60, cache_read_input_tokens: 400 } })
    })
    const { ctx, pending } = context()
    const response = await handleChat(
      post('/api/chat', { companion: { intent: 'ask', context: { ...readerContext, bookId: 'bible', editionKey: 'kjv-en', chapterNumber: 1 } } }),
      { ...env, ASSETS: assets }, ctx, async () => reader, allow,
    )
    expect(response.status).toBe(200)
    await Promise.all(pending)
    expect(rows).toHaveLength(2)
    expect(rows.map(row => [row.input_tokens, row.output_tokens, row.book_id])).toEqual([[400, 20, 'bible'], [900, 60, 'bible']])
  })

  it('source search: a research lookup is one openai row with tokens and the per-call fee', async () => {
    const { rows } = stubFetch(url => url === 'https://api.openai.com/v1/responses'
      ? Response.json({
        status: 'completed',
        usage: { input_tokens: 2000, output_tokens: 300, input_tokens_details: { cached_tokens: 0 } },
        output: [{ type: 'web_search_call' }, { type: 'message', content: [{ text: 'Notes.', annotations: [{ type: 'url_citation', url: 'https://example.org/a', title: 'A' }] }] }],
      }) : undefined)
    const { ctx, pending } = context()
    const response = await handleVoiceResearch(post('/api/voice-research', { query: 'Who wrote Hebrews?' }), env, async () => reader, allow, ctx)
    expect(response.status).toBe(200)
    await Promise.all(pending)
    expect(rows).toHaveLength(1)
    expect(rows[0]).toMatchObject({ user_id: userId, feature: 'source_search', provider: 'openai', model: 'gpt-4.1', input_tokens: 2000, output_tokens: 300 })
    expect(rows[0].cost_usd).toBe(sourceSearchCostUsd({ input_tokens: 2000, output_tokens: 300 }, 1))
    expect(JSON.stringify(rows[0])).not.toContain('Hebrews')
  })
})

describe('recap and catch-up routes', () => {
  const chapters: Record<number, { number: number; title: string; paragraphs: string[] }> = {
    1: { number: 1, title: 'Part 1, Chapter 1', paragraphs: ['Anna arrives.', 'Snow falls.'] },
    2: { number: 2, title: 'Part 1, Chapter 2', paragraphs: ['Levin mows.'] },
    3: { number: 3, title: 'Part 2, Chapter 1', paragraphs: ['The races begin.'] },
  }
  const assets = {
    fetch: async (request: Request) => {
      const path = new URL(request.url).pathname
      if (path.startsWith('/data/catch-up/')) return new Response('nf', { status: 404 })
      if (path.endsWith('/manifest.json')) return Response.json({ chapters: Object.values(chapters).map(c => ({ number: c.number, title: c.title, path: `ch${String(c.number).padStart(4, '0')}.json` })) })
      const match = /ch(\d{4})\.json$/.exec(path)
      const found = match ? chapters[Number(match[1])] : undefined
      return found ? Response.json(found) : new Response('nf', { status: 404 })
    },
  }
  const anthropicOk = (text: string) => vi.fn(async () => Response.json({ model: COMPANION_MODEL, stop_reason: 'end_turn', content: [{ type: 'text', text }], usage: { input_tokens: 900, output_tokens: 80 } }))

  it('recap (/api/lab-recap) writes a recap row for the signed-out key, or the account when the caller has a session', async () => {
    const { rows } = stubFetch(() => undefined)
    const body = { bookId: 'anna', editionKey: 'original-en', chapterNumber: 1, paragraphIndex: 1, completed: false, bookTitle: 'Anna' }
    const { ctx, pending } = context()
    const guest = await handleLabRecap(post('/api/lab-recap', body), { ...env, ASSETS: assets }, ctx, allow, { reserveGuestSpend: async () => true, cache: null, fetchAnthropic: anthropicOk('So far, Anna arrives.') })
    expect(guest.status).toBe(200)
    const member = await handleLabRecap(post('/api/lab-recap', body, { authorization: 'Bearer t' }), { ...env, ASSETS: assets }, ctx, allow, { reserveGuestSpend: async () => true, cache: null, fetchAnthropic: anthropicOk('So far, Anna arrives.'), resolveUser: async () => userId })
    expect(member.status).toBe(200)
    await Promise.all(pending)
    expect(rows).toHaveLength(2)
    expect(rows.every(row => row.feature === 'recap' && row.model === COMPANION_MODEL && row.input_tokens === 900 && row.output_tokens === 80 && row.book_id === 'anna')).toBe(true)
    const guestRow = rows.find(row => row.user_id === null)!
    expect(guestRow.guest_key).toMatch(/^[0-9a-f]{20}$/)
    expect(rows.find(row => row.user_id === userId)).toMatchObject({ guest_key: null })
  })

  it('catch-up (/api/lab-catch-up) is covered as feature recap', async () => {
    const { rows } = stubFetch(() => undefined)
    const { ctx, pending } = context()
    const response = await handleLabCatchUp(
      post('/api/lab-catch-up', { bookId: 'anna', editionKey: 'original-en', unitId: 'part-part-1', bookTitle: 'Anna', throughChapter: null }),
      { ...env, ASSETS: assets }, ctx, allow, { reserveGuestSpend: async () => true, cache: null, fetchAnthropic: anthropicOk('Anna arrives in the snow.') },
    )
    expect(response.status).toBe(200)
    await Promise.all(pending)
    expect(rows).toHaveLength(1)
    expect(rows[0]).toMatchObject({ feature: 'recap', provider: 'anthropic', input_tokens: 900, output_tokens: 80, book_id: 'anna' })
  })

  it('a ledger outage never fails or delays the reader\'s response', async () => {
    vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input)
      if (url === ledgerUrl) throw new Error('ledger down')
      if (url.includes('/rest/v1/profiles')) return Response.json(profile)
      if (url.includes('/rpc/use_message')) return Response.json({})
      return Response.json({ content: [{ text: 'Still answered.' }], usage: { input_tokens: 1, output_tokens: 1 } })
    }))
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    const { ctx, pending } = context()
    const response = await handleChat(post('/api/chat', { companion: { intent: 'ask', context: readerContext } }), env, ctx, async () => reader, allow)
    expect(response.status).toBe(200)
    expect(await response.json()).toMatchObject({ content: [{ text: 'Still answered.' }] })
    await expect(Promise.all(pending)).resolves.toBeDefined()
  })
})

describe('Talk', () => {
  it('writes a zero-second session row at start, then the reported connected seconds priced per minute', async () => {
    const { rows } = stubFetch(url => url === XAI_CLIENT_SECRETS_URL ? Response.json({ value: 'secret', expires_at: 1 }) : undefined)
    const { ctx, pending } = context()
    const started = await handleVoiceSession(post('/api/voice-session', {}), env, ctx, async () => reader, allow)
    expect(started.status).toBe(200)
    const ended = await handleVoiceUsage(post('/api/voice-usage', { seconds: 150, bookId: 'bible' }), env, ctx, async () => reader, allow)
    expect(ended.status).toBe(204)
    await Promise.all(pending)
    const talk = rows.filter(row => row.feature === 'talk')
    expect(talk).toHaveLength(2)
    expect(talk[0]).toMatchObject({ user_id: userId, provider: 'xai', model: GROK_VOICE_MODEL, seconds: 0, cost_usd: 0 })
    expect(talk[1]).toMatchObject({ seconds: 150, book_id: 'bible', cost_usd: talkCostUsd(150) })
    expect(talk[1].cost_usd).toBe(0.2)
  })

  it('caps a report at the session limit, and refuses anonymous, malformed and non-positive reports', async () => {
    const { rows } = stubFetch(() => undefined)
    const { ctx, pending } = context()
    expect((await handleVoiceUsage(post('/api/voice-usage', { seconds: 999_999 }), env, ctx, async () => reader, allow)).status).toBe(204)
    expect((await handleVoiceUsage(post('/api/voice-usage', { seconds: 60 }), env, ctx, async () => null, allow)).status).toBe(401)
    expect((await handleVoiceUsage(post('/api/voice-usage', { seconds: -3 }), env, ctx, async () => reader, allow)).status).toBe(400)
    expect((await handleVoiceUsage(post('/api/voice-usage', { seconds: '60' }), env, ctx, async () => reader, allow)).status).toBe(400)
    expect((await handleVoiceUsage(post('/api/voice-usage', { seconds: 60 }), env, ctx, async () => reader, async () => false)).status).toBe(429)
    await Promise.all(pending)
    expect(rows).toHaveLength(1)
    expect(rows[0].seconds).toBe(TALK_SESSION_MAX_SECONDS)
    expect(rows[0].cost_usd).toBe(talkCostUsd(TALK_SESSION_MAX_SECONDS))
  })
})
