import { describe, expect, it } from 'vitest'
import { handleNarration, type NarrationDeps, type NarrationEnv } from './worker/routes/narration'
import { chunkNarrationText } from './narration/narrationCore'
import { fishTimestampSseFor, syntheticMp3 } from './narration/narrationTestFixtures'

/**
 * A cached ensure must answer in a few storage round trips, not one per
 * chunk: production R2 reads take tens to hundreds of milliseconds each, and
 * the post-deploy check (scripts/check-inline-audio-loading.mjs) gives a
 * cached ensure 15 s. Every R2 call here waits LATENCY_MS, as a real one does.
 */
const LATENCY_MS = 50
const encoder = new TextEncoder()
const decoder = new TextDecoder()
const sleepReal = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms))

class SlowR2 {
  store = new Map<string, Uint8Array>()
  latency = 0
  calls = { get: 0, head: 0, put: 0, list: 0 }
  inFlight = 0
  peak = 0
  private async wait<T>(kind: keyof SlowR2['calls'], run: () => T): Promise<T> {
    this.calls[kind] += 1
    this.inFlight += 1
    this.peak = Math.max(this.peak, this.inFlight)
    try {
      if (this.latency) await sleepReal(this.latency)
      return run()
    } finally { this.inFlight -= 1 }
  }
  get(key: string) {
    return this.wait('get', () => {
      const value = this.store.get(key)
      if (!value) return null
      return { key, size: value.length, etag: 'e' + value.length, json: async () => JSON.parse(decoder.decode(value)) }
    })
  }
  head(key: string) { return this.wait('head', () => { const value = this.store.get(key); return value ? { key, size: value.length } : null }) }
  put(key: string, value: Uint8Array | string) { return this.wait('put', () => { this.store.set(key, typeof value === 'string' ? encoder.encode(value) : value); return { key } }) }
  list(options: { prefix: string }) { return this.wait('list', () => ({ objects: [...this.store.keys()].filter(key => key.startsWith(options.prefix)).map(key => ({ key })) })) }
  reset() { this.calls = { get: 0, head: 0, put: 0, list: 0 }; this.peak = 0 }
  get total() { return this.calls.get + this.calls.head + this.calls.put + this.calls.list }
}

class MemoryKV {
  store = new Map<string, string>()
  async get(key: string, type?: string) { const value = this.store.get(key); return value == null ? null : type === 'json' ? JSON.parse(value) : value }
  async put(key: string, value: string) { this.store.set(key, value) }
  async delete(key: string) { this.store.delete(key) }
}

const SENTENCE = 'It was on a dreary night of November that I beheld the accomplishment of my toils, and with an anxiety that almost amounted to agony I collected the instruments of life around me.'
// Ten paragraphs, short and long: 1–3 sentence groups each.
const PARAGRAPHS = Array.from({ length: 10 }, (_, index) => Array.from({ length: 1 + (index % 3) * 2 }, () => SENTENCE).join(' '))

function harness() {
  const bucket = new SlowR2()
  const env = {
    NARRATION_PILOT: '1', FISH_AUDIO_API_KEY: 'test-key',
    NARRATION_VOICE_A_ID: 'voice-a-id', NARRATION_VOICE_A_LABEL: 'Nathan', NARRATION_VOICE_B_ID: 'voice-b-id', NARRATION_VOICE_B_LABEL: 'Abby',
    NARRATION_FISH_BASE_URL: 'https://fish.test',
    AUDIO_BUCKET: bucket as unknown as R2Bucket,
    RATE_LIMIT: new MemoryKV() as unknown as KVNamespace,
    ASSETS: { fetch: async () => Response.json({ chapters: [{ number: 1, title: 'Letter 1', paragraphs: PARAGRAPHS }] }) },
  } as unknown as NarrationEnv
  const waited: Promise<unknown>[] = []
  const ctx = { waitUntil: (promise: Promise<unknown>) => { waited.push(promise) }, passThroughOnException() {} } as unknown as ExecutionContext
  let clock = Date.UTC(2026, 9, 20, 12)
  const deps: NarrationDeps = {
    verifyUser: async () => ({ id: 'user-1', email: 'reader@example.com' }),
    verifySiteAdmin: async () => false,
    checkRateLimit: async () => true,
    // A mocked provider only seeds the cache: no paid API is ever reached.
    fetchImpl: (async (input: string | URL | Request, init?: RequestInit) => {
      const url = String(input instanceof Request ? input.url : input)
      const text = (JSON.parse(String(init?.body ?? '{}')) as { text?: string }).text ?? ''
      return url.endsWith('/with-timestamp')
        ? new Response(fishTimestampSseFor(text), { status: 200, headers: { 'Content-Type': 'text/event-stream' } })
        : new Response(syntheticMp3(200), { status: 200 })
    }) as typeof fetch,
    now: () => clock,
    sleep: async (ms: number) => { clock += ms },
  }
  const ensure = async (paragraphs: number[], mode: 'all' | 'next' | 'cache' = 'next') => {
    const response = await handleNarration(new Request('https://tinct.app/api/narration/ensure', {
      method: 'POST', headers: { 'Content-Type': 'application/json', Origin: 'https://tinct.app' },
      body: JSON.stringify({ bookId: 'frankenstein', editionKey: 'original-en', chapter: 1, voice: 'a', mode, paragraphs: paragraphs.map(index => ({ index, fromChunk: 0 })) }),
    }), env, ctx, deps)
    await Promise.all(waited.splice(0))
    return { response, json: await response.json() as { generated: number; paragraphs: Array<{ paragraph: number; status: string; readyChunks: number; chunkCount: number }> } }
  }
  return { bucket, ensure }
}

async function seeded() {
  const h = harness()
  for (let start = 0; start < PARAGRAPHS.length; start += 3) {
    const indexes = [start, start + 1, start + 2].filter(index => index < PARAGRAPHS.length)
    const { json } = await h.ensure(indexes, 'all')
    expect(json.paragraphs.every(item => item.status === 'ready')).toBe(true)
  }
  return h
}

describe('cached narration ensure latency', () => {
  it('answers a cached chapter opening in a few R2 round trips', async () => {
    const h = await seeded()
    const totalChunks = PARAGRAPHS.reduce((sum, text) => sum + chunkNarrationText(text).length, 0)
    h.bucket.latency = LATENCY_MS
    h.bucket.reset()
    const startedAt = performance.now()
    // The reader asks at most three paragraphs per request: ten paragraphs is four requests.
    const timings: number[] = []
    for (let start = 0; start < PARAGRAPHS.length; start += 3) {
      const indexes = [start, start + 1, start + 2].filter(index => index < PARAGRAPHS.length)
      const before = performance.now()
      const { response, json } = await h.ensure(indexes)
      timings.push(Math.round(performance.now() - before))
      expect(response.status).toBe(200)
      expect(json.generated).toBe(0)
      expect(json.paragraphs.map(item => item.status)).toEqual(indexes.map(() => 'ready'))
      expect(response.headers.get('server-timing')).toMatch(/r2;dur=\d+/)
    }
    const elapsed = Math.round(performance.now() - startedAt)
    console.info(JSON.stringify({ paragraphs: PARAGRAPHS.length, chunks: totalChunks, r2Calls: h.bucket.calls, totalCalls: h.bucket.total, peakConcurrent: h.bucket.peak, perRequestMs: timings, elapsedMs: elapsed }))
    // Reads only, never a write, on a cache hit: one map read plus a meta
    // read and an audio head per chunk.
    expect(h.bucket.calls.put).toBe(0)
    expect(h.bucket.total).toBe(PARAGRAPHS.length + totalChunks * 2)
    // Before: one sequential round per paragraph map and per chunk (~1.4 s here, many seconds in production).
    // After: one round for the maps, then the chunks side by side, bounded.
    expect(h.bucket.peak).toBeLessThanOrEqual(6)
    for (const ms of timings) expect(ms).toBeLessThan(LATENCY_MS * 8)
  })
})
