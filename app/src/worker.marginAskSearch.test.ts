/**
 * Ask in the margin reader with the source search as a tool (Anders, 20 Oct 2026: no "Web" toggle; the model decides).
 * Fact-check's search, offered to Ask on a reader's own PDF or EPUB when the reader is signed in and the search key is
 * set: never prefetched, called by the model at most once, metered as Fact-check's (source_search), the answer charged
 * once like any Ask. The other Sonnet margin requests carry the same tool, never callable, so the cached prefix stays one.
 * Every provider call is mocked; nothing reaches Anthropic or OpenAI.
 */
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ASK_SOURCE_SEARCH_LINE } from './companion/marginPrompts'
import { MARGIN_SONNET_MODEL } from './companion/marginRoutes'
import { companionPrefetchesSources, companionUsesSourceSearch } from './companion/companionRequest'
import { createAllowanceGate } from './worker/lib/aiAllowance'
import { handleChat, handleLabChat } from './worker/routes/chat'

const reader = async () => ({ id: '11111111-1111-4111-8111-111111111111', email: 'reader@example.com' })
const allow = async () => true
const env = { ANTHROPIC_API_KEY: 'anthropic-key', OPENAI_API_KEY: 'openai-key', SUPABASE_URL: 'https://example.supabase.co', SUPABASE_SERVICE_ROLE_KEY: 'service-role' }
const gateOff = { allowanceGate: createAllowanceGate({}, false) }
const PAGES = ['Locality. Newtonian gravity acts at a distance; general relativity restores locality.', 'Entangled particles show correlations.']
const document = { kind: 'epub', units: PAGES.map((text, i) => ({ n: i + 1, text })) }
const context = { kind: 'epub', bookTitle: 'Lamplit Conjectures', bookAuthor: 'Gale Editor', chapterLabel: '1 The Fate of Lamplight', pages: [{ n: 1, text: PAGES[0] }], paragraphIndex: 0, pageNumber: 1, totalPages: 2 }
const ask = (content: string) => ({ messages: [{ role: 'user', content }], companion: { intent: 'ask', context, document } })

type Reply = Record<string, unknown>
function stubFetch(replies: Reply[]) {
  const anthropic: Array<Record<string, unknown>> = [], openai: Array<Record<string, unknown>> = [], rows: Array<Record<string, unknown>> = [], charges: string[] = []
  vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input)
    if (url.includes('/rest/v1/ai_usage_events')) { rows.push(JSON.parse(String(init?.body))); return new Response(null, { status: 201 }) }
    if (url.includes('/rest/v1/profiles')) return Response.json([{ messages_used_this_period: 0, message_balance: 5, subscription_status: 'active', subscription_period_end: null, created_at: '2026-06-01T12:00:00Z' }])
    if (url.includes('/rpc/use_message')) { charges.push(url); return Response.json({}) }
    if (url.includes('/rpc/')) return Response.json({})
    if (url === 'https://api.openai.com/v1/responses') {
      openai.push(JSON.parse(String(init?.body)))
      return Response.json({ status: 'completed', output: [{ type: 'web_search_call' }, { type: 'message', content: [{ text: 'Bell tests (2015) closed the loopholes.', annotations: [{ type: 'url_citation', url: 'https://example.org/bell', title: 'Loophole-free Bell test' }] }] }], usage: { input_tokens: 9000, output_tokens: 900 } })
    }
    if (url === 'https://api.anthropic.com/v1/messages') {
      anthropic.push(JSON.parse(String(init?.body)))
      return Response.json(replies[Math.min(anthropic.length - 1, replies.length - 1)])
    }
    return Response.json({ error: 'unexpected fetch' }, { status: 500 })
  }))
  return { anthropic, openai, rows, charges }
}
async function send(body: unknown, guest = false) {
  const pending: Promise<unknown>[] = []
  const ctx = { waitUntil: (p: Promise<unknown>) => { pending.push(Promise.resolve(p)) } } as unknown as ExecutionContext
  const request = new Request(`https://tinct.app/api/${guest ? 'lab-chat' : 'chat'}`, { method: 'POST', body: JSON.stringify(body), headers: { 'content-type': 'application/json', 'cf-connecting-ip': '203.0.113.9' } })
  const response = guest ? await handleLabChat(request, env, ctx, allow, async () => true) : await handleChat(request, env, ctx, reader, allow, gateOff)
  const text = await response.text()
  await Promise.all(pending)
  return { status: response.status, text }
}
const text = (t: string): Reply => ({ content: [{ type: 'text', text: t }], stop_reason: 'end_turn', usage: { input_tokens: 2000, output_tokens: 300, cache_read_input_tokens: 30000 } })
const searchCall: Reply = { content: [{ type: 'tool_use', id: 'toolu_1', name: 'search_reading_sources', input: { query: 'Is quantum locality still debated today?' } }], stop_reason: 'tool_use', usage: { input_tokens: 2000, output_tokens: 80, cache_read_input_tokens: 30000 } }
type SystemBlock = { text: string; cache_control?: unknown }
const prefix = (body: Record<string, unknown>) => { const system = body.system as SystemBlock[]; const end = system.findIndex(b => b.cache_control); return JSON.stringify({ model: body.model, tools: body.tools ?? null, system: system.slice(0, end + 1) }) }

afterEach(() => { vi.unstubAllGlobals() })

describe('Ask may search sources; the model decides', () => {
  it('is offered to Ask on an own file, prefetched only for Fact-check', () => {
    expect(companionUsesSourceSearch({ intent: 'ask', pdf: true })).toBe(true)
    expect(companionUsesSourceSearch({ intent: 'ask' })).toBe(false)
    expect(companionPrefetchesSources({ intent: 'ask', pdf: true })).toBe(false)
    expect(companionPrefetchesSources({ intent: 'factcheck', pdf: true })).toBe(true)
  })

  it('a question the document answers: the tool is offered, no search runs, one charge', async () => {
    const { anthropic, openai, rows, charges } = stubFetch([text('Newtonian gravity breaks locality; relativity restores it.')])
    const { status, text: body } = await send(ask('Why does relativity restore locality?'))
    expect(status).toBe(200)
    expect(body).toContain('relativity restores it')
    expect(anthropic).toHaveLength(1)
    expect(anthropic[0].model).toBe(MARGIN_SONNET_MODEL)
    expect((anthropic[0].tools as Array<{ name: string }>).map(t => t.name)).toEqual(['search_reading_sources'])
    expect(anthropic[0]).not.toHaveProperty('tool_choice')
    expect((anthropic[0].system as SystemBlock[]).map(b => b.text).join('\n')).toContain(ASK_SOURCE_SEARCH_LINE)
    expect(openai).toHaveLength(0)
    expect(rows.some(r => r.feature === 'source_search')).toBe(false)
    expect(charges).toHaveLength(1)
  })

  it('a question that needs current facts: the model searches once, the answer ends with its Sources line, the search metered as Fact-check\'s', async () => {
    const { anthropic, openai, rows, charges } = stubFetch([searchCall, text('Yes, still debated. Loophole-free Bell tests in 2015 settled the experiments.\n\nSources: [Loophole-free Bell test](https://example.org/bell)')])
    const { status, text: body } = await send(ask('this locality thing is a big debate? also today?'))
    expect(status).toBe(200)
    expect(body).toContain('Sources: [Loophole-free Bell test](https://example.org/bell)')
    expect(openai).toHaveLength(1)
    expect(String(openai[0].input)).toBe('Is quantum locality still debated today?')
    expect(anthropic).toHaveLength(2)
    const second = anthropic[1].messages as Array<{ role: string; content: Array<{ type: string }> }>
    expect(second.some(m => m.role === 'user' && Array.isArray(m.content) && m.content.some(c => c.type === 'tool_result'))).toBe(true)
    const search = rows.find(r => r.feature === 'source_search')!
    expect(search).toBeTruthy()
    // gpt-4.1 at $2 / $8 per MTok and $0.01 per search call (aiUsage.ts): 9000 in, 900 out, one call.
    expect(search.cost_usd).toBeCloseTo((9000 * 2 + 900 * 8) / 1e6 + 0.01, 5)
    expect(charges).toHaveLength(1)
  })

  it('signed out: no tool (the search needs a signed-in reader, as Fact-check\'s does)', async () => {
    const { anthropic } = stubFetch([text('An answer.')])
    await send(ask('Is it debated today?'), true)
    expect(anthropic[0]?.tools).toBeUndefined()
  })

  it('the other Sonnet margin requests carry the same tool, never callable: one cached prefix with Ask', async () => {
    const { anthropic } = stubFetch([text('An answer.'), text('{"gist":"g","claims":[],"keepInMind":[],"map":[]}'), text('{"ideas":["a"],"questions":[{"idea":0,"q":"Why?","answer":"x"}]}'), text('{"verdict":"right","feedback":"Yes."}')])
    const statuses = [(await send(ask('Why?'))).status]
    statuses.push((await send({ messages: [{ role: 'user', content: 'Please answer.' }], companion: { intent: 'chapter', context, document, chapter: { action: { kind: 'primer', unitKey: 'outline-1', unitTitle: '1 The Fate of Lamplight' } } } })).status)
    statuses.push((await send({ companion: { intent: 'quiz', context, document, selection: 'Newtonian gravity acts at a distance.' } })).status)
    statuses.push((await send({ companion: { intent: 'quiz_check', context, document, quiz: { question: 'Why?', expected: 'x', answer: 'y' } } })).status)
    expect(statuses).toEqual([200, 200, 200, 200])
    const [a, primer, quiz, check] = anthropic
    for (const r of [primer, quiz, check]) {
      expect(r.tool_choice).toEqual({ type: 'none' })
      expect(prefix(r)).toBe(prefix(a))
    }
  })
})
