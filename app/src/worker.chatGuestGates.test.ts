import { afterEach, describe, expect, it, vi } from 'vitest'
import { handleLabChat } from './worker/routes/chat'
import { AI_RESTING_TYPE, type GuestSpendHold } from './worker/lib/aiSpend'

/**
 * Signed-out chat makes two Durable Object calls before the provider: the
 * rate-limit hit and the guest spend reservation. They now run alongside
 * each other (time to first text, 14 Oct 2026). What the reader sees must not
 * change: rate-limited still answers 429 ahead of an empty budget or a bad
 * body, an empty budget still answers 503, and a reservation made for a
 * request the limiter then refused is given back. No provider is called:
 * fetch is stubbed throughout.
 */

const context = { bookTitle: 'The Bible', bookAuthor: 'Various', chapterLabel: 'Jeremiah 37', paragraphs: ['Zedekiah the king.'], paragraphIndex: 0 }

function request(body: unknown) {
  return new Request('https://tinct.app/api/lab-chat', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'content-type': 'application/json', 'cf-connecting-ip': '203.0.113.9' },
  })
}
const ask = () => request({ companion: { intent: 'ask', context }, messages: [{ role: 'user', content: 'Who is Zedekiah?' }] })

function deferred<T>() {
  let resolve!: (value: T) => void
  const promise = new Promise<T>(r => { resolve = r })
  return { promise, resolve }
}

function harness() {
  const pending: Promise<unknown>[] = []
  const ctx = { waitUntil: vi.fn((promise: Promise<unknown>) => { pending.push(Promise.resolve(promise)) }) } as unknown as ExecutionContext
  const provider = vi.fn(async () => Response.json({ content: [{ text: 'The last king of Judah.' }], usage: { input_tokens: 1, output_tokens: 1 } }))
  vi.stubGlobal('fetch', provider)
  const release = vi.fn(async () => {})
  return { ctx, pending, provider, release, hold: (granted: boolean) => vi.fn(async (): Promise<GuestSpendHold | null> => granted ? { release } : null) }
}

afterEach(() => { vi.unstubAllGlobals() })

describe('signed-out chat: rate limit and spend reservation', () => {
  it('starts the spend reservation before the rate-limit check has answered', async () => {
    const { ctx, provider, release } = harness()
    const rate = deferred<boolean>()
    const order: string[] = []
    const rateLimit = vi.fn(() => { order.push('rate'); return rate.promise })
    const hold = vi.fn(async (): Promise<GuestSpendHold | null> => { order.push('hold'); return { release } })
    const answered = handleLabChat(ask(), { ANTHROPIC_API_KEY: 'k' }, ctx, rateLimit, undefined, hold)
    await vi.waitFor(() => expect(hold).toHaveBeenCalledTimes(1))
    expect(order).toEqual(['rate', 'hold'])
    expect(provider).not.toHaveBeenCalled()
    rate.resolve(true)
    const response = await answered
    expect(response.status).toBe(200)
    expect(provider).toHaveBeenCalledTimes(1)
    expect(release).not.toHaveBeenCalled()
  })

  it('rate-limited: answers 429, gives the reservation back and never calls the provider', async () => {
    const { ctx, pending, provider, release, hold } = harness()
    const holder = hold(true)
    const response = await handleLabChat(ask(), { ANTHROPIC_API_KEY: 'k' }, ctx, async () => false, undefined, holder)
    expect(response.status).toBe(429)
    expect(await response.json()).toEqual({ error: 'Give it a few seconds.' })
    await Promise.all(pending)
    expect(release).toHaveBeenCalledTimes(1)
    expect(provider).not.toHaveBeenCalled()
  })

  it('rate-limited and over budget: 429 wins, as when the limit was checked first', async () => {
    const { ctx, provider, release, hold } = harness()
    const response = await handleLabChat(ask(), { ANTHROPIC_API_KEY: 'k' }, ctx, async () => false, undefined, hold(false))
    expect(response.status).toBe(429)
    expect(release).not.toHaveBeenCalled()
    expect(provider).not.toHaveBeenCalled()
  })

  it('rate-limited with a bad body: still 429, and nothing is reserved', async () => {
    const { ctx, provider, hold } = harness()
    const holder = hold(true)
    const response = await handleLabChat(request({ companion: { intent: 'nonsense' } }), { ANTHROPIC_API_KEY: 'k' }, ctx, async () => false, undefined, holder)
    expect(response.status).toBe(429)
    expect(holder).not.toHaveBeenCalled()
    expect(provider).not.toHaveBeenCalled()
  })

  it('a bad body within the rate limit keeps its own error', async () => {
    const { ctx, hold } = harness()
    const response = await handleLabChat(request({ companion: { intent: 'nonsense' } }), { ANTHROPIC_API_KEY: 'k' }, ctx, async () => true, undefined, hold(true))
    expect(response.status).toBe(400)
    expect(await response.json()).toEqual({ error: 'Invalid companion request' })
  })

  it('over budget within the rate limit: answers 503 AI resting and never calls the provider', async () => {
    const { ctx, provider, release, hold } = harness()
    const response = await handleLabChat(ask(), { ANTHROPIC_API_KEY: 'k' }, ctx, async () => true, undefined, hold(false))
    expect(response.status).toBe(503)
    expect(await response.json()).toMatchObject({ error: { type: AI_RESTING_TYPE } })
    expect(release).not.toHaveBeenCalled()
    expect(provider).not.toHaveBeenCalled()
  })

  it('without a releasable hold the check stays first: a rate-limited request reserves nothing', async () => {
    const { ctx, provider } = harness()
    const reserve = vi.fn(async () => true)
    const response = await handleLabChat(ask(), { ANTHROPIC_API_KEY: 'k' }, ctx, async () => false, reserve)
    expect(response.status).toBe(429)
    expect(reserve).not.toHaveBeenCalled()
    expect(provider).not.toHaveBeenCalled()
  })
})
