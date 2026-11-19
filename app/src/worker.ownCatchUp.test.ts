import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  OWN_CATCH_UP_LEDGER_BOOK_ID,
  OWN_CATCH_UP_SYSTEM_PROMPT,
  handleOwnCatchUp,
  type OwnCatchUpDeps,
  type OwnCatchUpEnv,
} from './worker/routes/ownCatchUp'
import { handleUserBooks } from './worker/routes/userBooks'
import { fakeUserBooksBucket } from './worker/fakeUserBooksBucket'
import { OWN_CATCH_UP_MAX_CHAPTER_CHARS, OWN_CATCH_UP_MAX_RECAP_CHARS, OWN_CATCH_UP_PROMPT_VERSION } from './ownCatchUp'
import { RECAP_FAST_MODEL } from './companionModel'

/**
 * Catch me up on a reader's own book (routes/ownCatchUp.ts). The model is a
 * stub: no request leaves the test. Storage is the private USER_BOOKS fake.
 */

const A = '11111111-1111-4111-8111-111111111111'
const B = '22222222-2222-4222-8222-222222222222'
const SHA = 'ab12cd34ef56ab12cd34ef56'.padEnd(64, '0')
const SHA_OTHER = '99887766554433221100aabb'.padEnd(64, '1')
const HEX = SHA.slice(0, 24)
const CH1 = 'Chapter one text. The lamp is lit and Mara waits by the door.'
const CH2 = 'Chapter two text. Morning comes; Mara leaves for the city.'

function setup() {
  const userBooks = fakeUserBooksBucket()
  const book = (owner: string, sha: string, id: string) => userBooks.objects.set(`u/${owner}/${id}`, {
    key: `u/${owner}/${id}`, bytes: new Uint8Array(100), uploaded: new Date('2026-10-01T00:00:00Z'),
    customMetadata: { name: 'Mine.epub', title: 'Mine', author: '', type: 'epub', sha256: sha, createdAt: '2026-10-01T00:00:00.000Z' },
  })
  book(A, SHA, 'a'.repeat(32))
  book(A, SHA_OTHER, 'c'.repeat(32))
  // Reader B holds the very same file: a separate private copy.
  book(B, SHA, 'b'.repeat(32))
  const env = {
    ANTHROPIC_API_KEY: 'test-key',
    SUPABASE_URL: 'https://example.supabase.co',
    SUPABASE_SERVICE_ROLE_KEY: 'service-role',
    USER_BOOKS: userBooks.bucket,
  } as unknown as OwnCatchUpEnv
  const ledgerRows: Record<string, unknown>[] = []
  vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input)
    if (url.endsWith('/rest/v1/ai_usage_events')) { ledgerRows.push(JSON.parse(String(init?.body))); return new Response(null, { status: 201 }) }
    throw new Error(`unexpected fetch ${url}`)
  }))
  const modelCalls: Array<{ system: string; content: string; model: string }> = []
  let n = 0
  const fetchAnthropic = vi.fn(async (payload: Record<string, unknown>) => {
    const messages = payload.messages as Array<{ content: string }>
    modelCalls.push({ system: String(payload.system), content: messages[0].content, model: String(payload.model) })
    n += 1
    return Response.json({
      content: [{ type: 'tool_use', name: 'write_entry', input: { nothing_to_summarise: false, summary: `Recap ${n}: Mara waits, then leaves.` } }],
      stop_reason: 'tool_use',
      usage: { input_tokens: 900 + n, output_tokens: 40 },
    })
  })
  const users: Record<string, string> = { 'Bearer token-a': A, 'Bearer token-b': B }
  const rateKeys: string[] = []
  const deps: OwnCatchUpDeps = {
    verifyUser: async (_env, request) => { const id = users[request.headers.get('authorization') ?? '']; return id ? { id } : null },
    checkRateLimit: async (key) => { rateKeys.push(key); return true },
    reserveGuestSpend: vi.fn(async () => true),
    allowsAi: vi.fn(async () => true),
    fetchAnthropic,
  }
  const ctx = { waited: [] as Promise<unknown>[], waitUntil(promise: Promise<unknown>) { this.waited.push(promise) }, passThroughOnException() {} } as unknown as ExecutionContext & { waited: Promise<unknown>[] }
  return { env, deps, ctx, userBooks, modelCalls, ledgerRows, fetchAnthropic, rateKeys }
}

type World = ReturnType<typeof setup>

async function step(w: World, body: Record<string, unknown>, token: string | null = 'token-a') {
  const request = new Request('https://tinct.app/api/own-catch-up', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify({ book: HEX, chapter: 1, complete: true, through: 0, text: CH1, previous: '', bookTitle: 'Mine', chapterTitle: 'One', ...body }),
  })
  const response = await handleOwnCatchUp(request, w.env, w.ctx, w.deps)
  await Promise.all(w.ctx.waited)
  return { status: response.status, json: await response.json() as Record<string, any> }
}

async function lookup(w: World, through: number, token = 'token-a', hex = HEX) {
  const response = await handleOwnCatchUp(new Request(`https://tinct.app/api/own-catch-up?book=${hex}&through=${through}`, { headers: { Authorization: `Bearer ${token}` } }), w.env, w.ctx, w.deps)
  return { status: response.status, json: await response.json() as Record<string, any> }
}

const keys = (w: World, prefix: string) => [...w.userBooks.objects.keys()].filter(key => key.startsWith(prefix)).sort()

afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks() })

describe('own-book Catch me up: incremental, one chapter per request', () => {
  it('summarises chapter 1 alone, then chapter 2 with only its text and the recap before it', async () => {
    const w = setup()
    const first = await step(w, {})
    expect(first).toEqual({ status: 200, json: { recap: 'Recap 1: Mara waits, then leaves.', chapter: 1, complete: true, cached: false } })
    expect(w.modelCalls).toHaveLength(1)
    expect(w.modelCalls[0].model).toBe(RECAP_FAST_MODEL)
    expect(w.modelCalls[0].system).toBe(OWN_CATCH_UP_SYSTEM_PROMPT)
    expect(w.modelCalls[0].content).toContain(CH1)
    expect(w.modelCalls[0].content).toContain('Recap so far:\n\n(nothing yet)')

    const second = await step(w, { chapter: 2, text: CH2, previous: first.json.recap, chapterTitle: 'Two' })
    expect(second.json).toMatchObject({ recap: 'Recap 2: Mara waits, then leaves.', chapter: 2, cached: false })
    expect(w.modelCalls).toHaveLength(2)
    // The second request carries the new chapter and the prior recap only, never chapter 1's text.
    expect(w.modelCalls[1].content).toContain(CH2)
    expect(w.modelCalls[1].content).toContain(first.json.recap)
    expect(w.modelCalls[1].content).not.toContain(CH1)
  })

  it('keeps each step privately under the owner, and reuses it only for the same text built on the same recap', async () => {
    const w = setup()
    const first = await step(w, {})
    await step(w, { chapter: 2, text: CH2, previous: first.json.recap })
    await step(w, { chapter: 3, complete: false, through: 4, text: 'Chapter three, part.', previous: 'Recap 2: Mara waits, then leaves.' })
    expect(keys(w, 'u/')).toEqual([
      `u/${A}/${'a'.repeat(32)}`, `u/${A}/${'c'.repeat(32)}`,
      `u/${A}/recaps/${HEX}/${OWN_CATCH_UP_PROMPT_VERSION}/c1.json`,
      `u/${A}/recaps/${HEX}/${OWN_CATCH_UP_PROMPT_VERSION}/c2.json`,
      `u/${A}/recaps/${HEX}/${OWN_CATCH_UP_PROMPT_VERSION}/current.json`,
      `u/${B}/${'b'.repeat(32)}`,
    ])
    // The stored step holds hashes and the recap, never the chapter text.
    const stored = new TextDecoder().decode(w.userBooks.objects.get(`u/${A}/recaps/${HEX}/${OWN_CATCH_UP_PROMPT_VERSION}/c1.json`)!.bytes)
    expect(stored).not.toContain('lamp is lit')
    expect(JSON.parse(stored)).toMatchObject({ chapter: 1, complete: true, recap: first.json.recap })

    const again = await step(w, {})
    expect(again.json).toMatchObject({ recap: first.json.recap, cached: true })
    expect(w.modelCalls).toHaveLength(3)
    // A changed chapter, or the same chapter on another recap, is summarised again.
    await step(w, { text: `${CH1} More.` })
    await step(w, { chapter: 2, text: CH2, previous: 'Some other recap.' })
    expect(w.modelCalls).toHaveLength(5)

    const read = await lookup(w, 3)
    expect(read.status).toBe(200)
    expect(read.json.steps.map((s: { chapter: number }) => s.chapter)).toEqual([1, 2])
    expect(read.json.current).toMatchObject({ chapter: 3, complete: false, through: 4 })
    expect(JSON.stringify(read.json)).not.toContain('Chapter three, part.')
  })

  it('never reuses another account’s recap, even for the identical file', async () => {
    const w = setup()
    await step(w, {})
    expect((await lookup(w, 2, 'token-b')).json).toEqual({ steps: [], current: null })
    const b = await step(w, {}, 'token-b')
    expect(b.json.cached).toBe(false)
    expect(w.modelCalls).toHaveLength(2)
    expect(keys(w, `u/${B}/recaps/`)).toEqual([`u/${B}/recaps/${HEX}/${OWN_CATCH_UP_PROMPT_VERSION}/c1.json`])
  })

  it('answers only the owner: signed out 401, a book the account does not hold 404', async () => {
    const w = setup()
    expect((await step(w, {}, null)).status).toBe(401)
    expect((await lookup(w, 2, 'token-b', SHA_OTHER.slice(0, 24))).status).toBe(404)
    expect((await step(w, { book: SHA_OTHER.slice(0, 24) }, 'token-b')).status).toBe(404)
    expect(w.modelCalls).toHaveLength(0)
  })

  it('caps each request at one chapter of OWN_CATCH_UP_MAX_CHAPTER_CHARS and the recap at OWN_CATCH_UP_MAX_RECAP_CHARS', async () => {
    const w = setup()
    expect((await step(w, { text: 'x'.repeat(OWN_CATCH_UP_MAX_CHAPTER_CHARS + 1) })).status).toBe(413)
    expect((await step(w, { previous: 'x'.repeat(OWN_CATCH_UP_MAX_RECAP_CHARS + 1) })).status).toBe(413)
    expect((await step(w, { text: 'x'.repeat(OWN_CATCH_UP_MAX_CHAPTER_CHARS) })).status).toBe(200)
    expect((await step(w, { chapter: 0 })).status).toBe(400)
    expect((await step(w, { text: '' })).status).toBe(400)
    expect(w.modelCalls).toHaveLength(1)
  })

  it('a chapter with nothing to summarise keeps the recap as it was', async () => {
    const w = setup()
    w.fetchAnthropic.mockImplementationOnce(async () => Response.json({ content: [{ type: 'tool_use', name: 'write_entry', input: { nothing_to_summarise: true, summary: '' } }], stop_reason: 'tool_use', usage: { input_tokens: 10, output_tokens: 5 } }))
    const result = await step(w, { chapter: 2, text: 'Dedication.', previous: 'Recap so far, kept.' })
    expect(result.json).toMatchObject({ recap: 'Recap so far, kept.', cached: false })
  })
})

describe('own-book Catch me up: gating, ledger and logs as the built-in Catch me up', () => {
  it('refuses with 402 allowance_used when the AI allowance is used up, and 503 at the shared spend ceiling', async () => {
    const w = setup()
    vi.mocked(w.deps.allowsAi!).mockResolvedValueOnce(false)
    expect(await step(w, {})).toEqual({ status: 402, json: { error: 'allowance_used' } })
    vi.mocked(w.deps.reserveGuestSpend!).mockResolvedValueOnce(false)
    expect((await step(w, {})).status).toBe(503)
    expect(w.modelCalls).toHaveLength(0)
    // A stored step costs nothing and is served whatever the allowance.
    await step(w, {})
    vi.mocked(w.deps.allowsAi!).mockResolvedValue(false)
    expect((await step(w, {})).json.cached).toBe(true)
  })

  it('rate-limits per account, separately for lookups and for the model', async () => {
    const w = setup()
    await step(w, {})
    expect(w.rateKeys).toEqual([`own-catch-up:${A}`, `own-catch-up-model:${A}`])
    w.deps.checkRateLimit = async (key) => !key.startsWith('own-catch-up-model:')
    expect((await step(w, { text: 'Another text.' })).status).toBe(429)
  })

  it('counts as AI use under catch_up, with the marker book id; logs carry token counts only', async () => {
    const w = setup()
    const log = vi.spyOn(console, 'log').mockImplementation(() => {})
    await step(w, {})
    expect(w.ledgerRows).toHaveLength(1)
    expect(w.ledgerRows[0]).toMatchObject({ feature: 'catch_up', provider: 'anthropic', book_id: OWN_CATCH_UP_LEDGER_BOOK_ID, user_id: A, input_tokens: 901, output_tokens: 40 })
    expect(JSON.stringify(w.ledgerRows)).not.toContain(HEX)
    const lines = log.mock.calls.map(call => String(call[0]))
    expect(lines).toEqual([JSON.stringify({ event: 'own_catch_up_usage', route: '/api/own-catch-up', input_tokens: 901, output_tokens: 40 })])
    for (const line of lines) {
      expect(line).not.toContain(HEX)
      expect(line).not.toContain(A)
      expect(line).not.toContain('lamp')
    }
  })
})

describe('own-book Catch me up: deleted with the book', () => {
  it('DELETE /api/user-books/{id} removes that book’s recaps and leaves the other book’s', async () => {
    const w = setup()
    await step(w, {})
    await step(w, { book: SHA_OTHER.slice(0, 24) })
    expect(keys(w, `u/${A}/recaps/`)).toHaveLength(2)
    const verifyUser = async (request: Request) => request.headers.get('authorization') === 'Bearer token-a' ? { id: A } : null
    const res = await handleUserBooks(new Request(`https://tinct.app/api/user-books/${'a'.repeat(32)}`, { method: 'DELETE', headers: { Authorization: 'Bearer token-a' } }), { USER_BOOKS: w.userBooks.bucket }, { verifyUser, checkRateLimit: async () => true })
    expect(res.status).toBe(200)
    expect(keys(w, `u/${A}/recaps/`)).toEqual([`u/${A}/recaps/${SHA_OTHER.slice(0, 24)}/${OWN_CATCH_UP_PROMPT_VERSION}/c1.json`])
    // The listing of Your books never shows the recaps.
    const list = await handleUserBooks(new Request('https://tinct.app/api/user-books', { headers: { Authorization: 'Bearer token-a' } }), { USER_BOOKS: w.userBooks.bucket }, { verifyUser, checkRateLimit: async () => true })
    const body = await list.json() as { books: Array<{ id: string }> }
    expect(body.books.map(item => item.id)).toEqual(['c'.repeat(32)])
  })
})
