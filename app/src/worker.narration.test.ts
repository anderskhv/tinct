import { describe, expect, it, vi } from 'vitest'
import { handleNarration, narrationConfig, type NarrationDeps, type NarrationEnv } from './worker/routes/narration'
import { handleAudioFile } from './worker/routes/audio'
import { NARRATION_CACHE_VERSION, chunkNarrationText, narrationBlobKeys, narrationCacheIdentity, narrationMapKey, narrationTextForParagraph, sha256Hex } from './narration/narrationCore'
import { fishTimestampSseFor, syntheticMp3 } from './narration/narrationTestFixtures'

const encoder = new TextEncoder()
const decoder = new TextDecoder()

class FakeR2 {
  store = new Map<string, Uint8Array>()
  async get(key: string) {
    const value = this.store.get(key)
    if (!value) return null
    return {
      key,
      size: value.length,
      body: value,
      json: async () => JSON.parse(decoder.decode(value)),
      arrayBuffer: async () => value.buffer.slice(value.byteOffset, value.byteOffset + value.byteLength),
    }
  }
  async head(key: string) {
    const value = this.store.get(key)
    return value ? { key, size: value.length } : null
  }
  async put(key: string, value: Uint8Array | string) {
    this.store.set(key, typeof value === 'string' ? encoder.encode(value) : value)
  }
  async list(options: { prefix: string }) {
    return { objects: Array.from(this.store.keys()).filter(key => key.startsWith(options.prefix)).map(key => ({ key })) }
  }
  async delete(key: string) { this.store.delete(key) }
}

class FakeKV {
  store = new Map<string, string>()
  async get(key: string, type?: string) {
    const value = this.store.get(key)
    if (value == null) return null
    return type === 'json' ? JSON.parse(value) : value
  }
  async put(key: string, value: string) { this.store.set(key, value) }
  async delete(key: string) { this.store.delete(key) }
}

const PARAGRAPHS = [
  'Tell me, O Muse, of that ingenious hero who travelled far and wide\nafter he had sacked the famous town of Troy.',
  'So now all who escaped death in battle or by shipwreck had got safely\nhome except Ulysses.',
  '“But there! It rests with heaven to determine whether he is to return,\nand take his revenge in his own house or no.”',
  // Bible-style verse markers: printed, never spoken.
  '¹ In the beginning God created the heaven and the earth. ² And the earth was without form, and void.',
  // Long enough for three sentence groups at the 300-character ceiling.
  'Now Neptune had gone off to the Ethiopians, who are at the world’s end, and lie in two halves, the one looking West and the other East. '
  + 'He had gone there to accept a hecatomb of sheep and oxen, and was enjoying himself at his festival; but the other gods met in the house of Olympian Jove, and the sire of gods and men spoke first. '
  + 'At that moment he was thinking of Aegisthus, who had been killed by Agamemnon’s son Orestes; so he said to the other gods what follows, and they listened with attention.',
]

interface Harness {
  env: NarrationEnv & { AUDIO_BUCKET: FakeR2; RATE_LIMIT: FakeKV }
  deps: NarrationDeps
  fish: { calls: Array<{ url: string; body: string; model: string | null }>; respond: (call: { url: string; attempt: number }) => Response | Promise<Response> }
  paragraphs: string[]
  clock: { now: number }
  ctx: ExecutionContext & { waited: Promise<unknown>[] }
}

function makeHarness(overrides: Partial<NarrationEnv> = {}, options: { user?: { id: string; email: string } | null; admin?: boolean; rateLimited?: boolean } = {}): Harness {
  const bucket = new FakeR2()
  const kv = new FakeKV()
  const paragraphs = [...PARAGRAPHS]
  const clock = { now: Date.UTC(2026, 8, 18, 12, 0, 0) }
  const fish: Harness['fish'] = {
    calls: [],
    respond: ({ url, body }: { url: string; body?: string; attempt: number }) => {
      const text = body ? (JSON.parse(body) as { text: string }).text : ''
      if (url.endsWith('/v1/tts/stream/with-timestamp')) {
        return new Response(fishTimestampSseFor(text), { status: 200, headers: { 'Content-Type': 'text/event-stream' } })
      }
      return new Response(syntheticMp3(200), { status: 200, headers: { 'Content-Type': 'audio/mpeg' } })
    },
  }
  const attemptsByUrl = new Map<string, number>()
  const fetchImpl = (async (input: string | URL | Request, init?: RequestInit) => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url
    const attempt = (attemptsByUrl.get(url) || 0) + 1
    attemptsByUrl.set(url, attempt)
    const headers = new Headers(init?.headers)
    fish.calls.push({ url, body: String(init?.body ?? ''), model: headers.get('model') })
    return fish.respond({ url, body: String(init?.body ?? ''), attempt } as never)
  }) as typeof fetch
  const env = {
    NARRATION_PILOT: '1',
    FISH_AUDIO_API_KEY: 'test-key',
    NARRATION_VOICE_A_ID: 'voice-a-id',
    NARRATION_VOICE_A_LABEL: 'Nathan',
    NARRATION_VOICE_B_ID: 'voice-b-id',
    NARRATION_VOICE_B_LABEL: 'Abby',
    NARRATION_ADMIN_TOKEN: 'warm-token-0123456789abcdef',
    NARRATION_FISH_BASE_URL: 'https://fish.test',
    AUDIO_BUCKET: bucket as unknown as R2Bucket & FakeR2,
    RATE_LIMIT: kv as unknown as KVNamespace & FakeKV,
    ASSETS: {
      fetch: async (request: Request) => {
        const url = new URL(request.url)
        if (url.pathname === '/data/editions/odyssey-original-en.json' || url.pathname === '/data/editions/odyssey-modern-en.json') {
          return Response.json({ chapters: [{ number: 1, title: 'Book 1', paragraphs }, { number: 2, title: 'Book 2', paragraphs: ['Second.'] }] })
        }
        return new Response('Not found', { status: 404 })
      },
    },
    ...overrides,
  } as Harness['env']
  const ctx = { waited: [] as Promise<unknown>[], waitUntil(promise: Promise<unknown>) { this.waited.push(promise) }, passThroughOnException() {} } as Harness['ctx']
  const deps: NarrationDeps = {
    verifyUser: async () => (options.user === undefined ? { id: 'user-1', email: 'reader@example.com' } : options.user),
    verifySiteAdmin: async () => options.admin === true,
    checkRateLimit: async () => options.rateLimited !== true,
    fetchImpl,
    now: () => clock.now,
    sleep: async (ms: number) => { clock.now += ms },
  }
  return { env, deps, fish, paragraphs, clock, ctx }
}

async function ensure(h: Harness, body: Record<string, unknown>, headers: Record<string, string> = {}, route = 'ensure') {
  const request = new Request(`https://tinct.app/api/narration/${route}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: 'https://tinct.app', ...headers },
    body: JSON.stringify({ bookId: 'odyssey', editionKey: 'original-en', chapter: 1, voice: 'a', mode: 'all', ...body }),
  })
  const response = await handleNarration(request, h.env, h.ctx, h.deps)
  await Promise.all(h.ctx.waited)
  return { status: response.status, json: await response.json() as Record<string, unknown> & { paragraphs: Array<Record<string, unknown>> } }
}

async function chapter(h: Harness, query = 'bookId=odyssey&editionKey=original-en&chapter=1&voice=a') {
  const response = await handleNarration(new Request(`https://tinct.app/api/narration/chapter?${query}`), h.env, h.ctx, h.deps)
  return { status: response.status, json: await response.json() as { paragraphs: Array<Record<string, unknown>> } }
}

async function textHashOf(paragraph: string): Promise<string> {
  return sha256Hex(narrationTextForParagraph(paragraph))
}


type Result = Record<string, unknown> & { chunks?: Array<Record<string, unknown>> }

describe('narration config and voices', () => {
  it('reports the pilot as off, unconfigured, or ready without leaking secrets', async () => {
    const off = makeHarness({ NARRATION_PILOT: '0' })
    expect(narrationConfig(off.env)).toMatchObject({ enabled: false, reason: 'pilot_off' })
    const noKey = makeHarness({ FISH_AUDIO_API_KEY: '' })
    expect(narrationConfig(noKey.env)).toMatchObject({ enabled: false, reason: 'missing_api_key' })
    const ready = makeHarness()
    const response = await handleNarration(new Request('https://tinct.app/api/narration/voices'), ready.env, ready.ctx, ready.deps)
    const json = await response.json() as Record<string, unknown>
    expect(json).toMatchObject({ enabled: true, provider: 'fish', model: 's2.1-pro', cacheVersion: 2, chunker: 1 })
    expect(json.voices).toEqual([{ key: 'a', label: 'Nathan' }, { key: 'b', label: 'Abby' }])
    const text = JSON.stringify(json)
    expect(text).not.toContain('test-key')
    expect(text).not.toContain('voice-a-id')
    expect(text).not.toContain('warm-token')
  })
})

describe('POST /api/narration/ensure', () => {
  it('requires configuration, a signed-in reader, and the narration scope', async () => {
    const off = makeHarness({ FISH_AUDIO_API_KEY: '' })
    expect((await ensure(off, {})).status).toBe(503)
    const anonymous = makeHarness({}, { user: null })
    expect((await ensure(anonymous, { paragraphs: [{ index: 0 }] })).status).toBe(401)
    const h = makeHarness()
    expect((await ensure(h, { paragraphs: [{ index: 0 }], editionKey: 'modern-da' })).status).toBe(403)
    expect((await ensure(h, { paragraphs: [{ index: 0 }], bookId: 'ulysses' })).status).toBe(403)
    expect((await ensure(h, { paragraphs: [{ index: 0 }], voice: 'z' })).status).toBe(400)
    expect((await ensure(h, { paragraphs: [] })).status).toBe(400)
    expect((await ensure(h, { paragraphs: [{ index: 0 }, { index: 1 }, { index: 2 }, { index: 0 }] })).status).toBe(400)
    const limited = makeHarness({}, { rateLimited: true })
    expect((await ensure(limited, { paragraphs: [{ index: 0 }] })).status).toBe(429)
    expect(h.fish.calls.length).toBe(0)
  })

  it('generates a short paragraph as one chunk, publishes audio + meta + map, then serves from cache', async () => {
    const h = makeHarness()
    const first = await ensure(h, { paragraphs: [{ index: 0, textHash: await textHashOf(PARAGRAPHS[0]) }] })
    expect(first.status).toBe(200)
    const entry = first.json.paragraphs[0] as Result
    expect(entry).toMatchObject({ paragraph: 0, status: 'ready', chunkCount: 1, readyChunks: 1, timingsUsable: true, source: 'generated', timingsSource: 'with-timestamp' })
    const chunk = entry.chunks![0]
    expect(chunk).toMatchObject({ index: 0, ready: true, wordFrom: 0, timingsUsable: true })
    expect(chunk.url).toMatch(/^\/api\/audio-file\?path=narration%2Ffish%2Fblob%2F[0-9a-f]{64}\.mp3$/)
    const words = entry.words as Array<{ text: string; start: number; end: number }>
    expect(words.map(word => word.text)).toEqual(narrationTextForParagraph(PARAGRAPHS[0]).split(' '))
    expect(h.fish.calls.length).toBe(1)
    expect(h.fish.calls[0].model).toBe('s2.1-pro')
    expect(JSON.parse(h.fish.calls[0].body)).toMatchObject({ reference_id: 'voice-a-id', text: narrationTextForParagraph(PARAGRAPHS[0]), format: 'mp3' })

    const mapKey = narrationMapKey('odyssey', 'original-en', 1, 'a', 0)
    const map = JSON.parse(decoder.decode(h.env.AUDIO_BUCKET.store.get(mapKey)!))
    expect(map).toMatchObject({ version: 2, chunker: 1, chunkCount: 1, complete: true, textHash: entry.textHash })
    expect(h.env.AUDIO_BUCKET.store.has(`narration/fish/blob/${chunk.hash}.mp3`)).toBe(true)
    expect(h.env.AUDIO_BUCKET.store.has(`narration/fish/blob/${chunk.hash}.json`)).toBe(true)

    const second = await ensure(h, { paragraphs: [{ index: 0 }] })
    expect(second.json.paragraphs[0]).toMatchObject({ status: 'ready', readyChunks: 1, duration: entry.duration })
    expect(h.fish.calls.length).toBe(1)

    const audio = await handleAudioFile(new Request(`https://tinct.app${chunk.url}`, { headers: { range: 'bytes=0-99' } }), h.env as never)
    expect(audio.status).toBe(206)
    expect(audio.headers.get('Content-Type')).toBe('audio/mpeg')

    const usage = await h.env.RATE_LIMIT.get('narration:usage:day:2026-09-18', 'json') as Record<string, number>
    expect(usage).toMatchObject({ generated: 1, cacheHits: 1, requests: 2 })
    expect(usage.bytes).toBeGreaterThan(0)
  })

  it("generates one sentence group per call in 'next' mode and reports the growing prefix", async () => {
    const h = makeHarness()
    const chunks = chunkNarrationText(PARAGRAPHS[4])
    expect(chunks.length).toBeGreaterThanOrEqual(3)
    const first = (await ensure(h, { paragraphs: [{ index: 4 }], mode: 'next' })).json.paragraphs[0] as Result
    expect(first).toMatchObject({ status: 'partial', chunkCount: chunks.length, readyChunks: 1, words: null })
    expect(first.chunks![0]).toMatchObject({ ready: true, wordFrom: 0, wordTo: chunks[0].wordTo })
    expect(first.chunks![1]).toMatchObject({ ready: false })
    expect(h.fish.calls.length).toBe(1)
    expect(JSON.parse(h.fish.calls[0].body).text).toBe(chunks[0].text)

    const second = (await ensure(h, { paragraphs: [{ index: 4 }], mode: 'next' })).json.paragraphs[0] as Result
    expect(second).toMatchObject({ readyChunks: 2 })
    expect(h.fish.calls.length).toBe(2)
    expect(JSON.parse(h.fish.calls[1].body).text).toBe(chunks[1].text)

    let last = second
    for (let guard = 0; guard < 8 && last.status !== 'ready'; guard += 1) {
      last = (await ensure(h, { paragraphs: [{ index: 4 }], mode: 'next' })).json.paragraphs[0] as Result
    }
    expect(last).toMatchObject({ status: 'ready', readyChunks: chunks.length, timingsUsable: true })
    const words = last.words as Array<{ text: string; start: number }>
    expect(words.map(word => word.text)).toEqual(narrationTextForParagraph(PARAGRAPHS[4]).split(' '))
    for (let i = 1; i < words.length; i += 1) expect(words[i].start).toBeGreaterThanOrEqual(words[i - 1].start)
    expect(h.fish.calls.length).toBe(chunks.length)
    // 'next' with everything ready generates nothing.
    await ensure(h, { paragraphs: [{ index: 4 }], mode: 'next' })
    expect(h.fish.calls.length).toBe(chunks.length)
  })

  it("'all' mode finishes every missing chunk of every requested paragraph", async () => {
    const h = makeHarness()
    const result = await ensure(h, { paragraphs: [{ index: 4 }, { index: 1 }], mode: 'all' })
    expect(result.json.paragraphs[0]).toMatchObject({ paragraph: 4, status: 'ready' })
    expect(result.json.paragraphs[1]).toMatchObject({ paragraph: 1, status: 'ready' })
    expect(h.fish.calls.length).toBe(chunkNarrationText(PARAGRAPHS[4]).length + 1)
  })

  it('never plays stale narration: a changed paragraph is stale and regenerated', async () => {
    const h = makeHarness()
    const before = (await ensure(h, { paragraphs: [{ index: 1 }] })).json.paragraphs[0] as Result
    expect(before.status).toBe('ready')

    h.paragraphs[1] = 'So now all who escaped death in battle or by shipwreck had got safely home except Odysseus.'
    const listing = await chapter(h)
    expect(listing.json.paragraphs[1]).toMatchObject({ paragraph: 1, status: 'stale' })
    expect(listing.json.paragraphs[0]).toMatchObject({ paragraph: 0, status: 'missing' })

    const after = (await ensure(h, { paragraphs: [{ index: 1 }] })).json.paragraphs[0] as Result
    expect(after).toMatchObject({ status: 'ready', source: 'generated' })
    expect(after.textHash).not.toBe(before.textHash)
    expect(after.chunks![0].hash).not.toBe(before.chunks![0].hash)
    expect(h.fish.calls.length).toBe(2)
    expect((await chapter(h)).json.paragraphs[1]).toMatchObject({ status: 'ready' })
  })

  it('refuses to generate for text the reader does not have (text hash mismatch)', async () => {
    const h = makeHarness()
    const result = await ensure(h, { paragraphs: [{ index: 0, textHash: 'deadbeef' }] })
    expect(result.json.paragraphs[0]).toMatchObject({ status: 'text_mismatch' })
    expect(h.fish.calls.length).toBe(0)
  })

  it('gives a different voice or model its own recordings', async () => {
    const h = makeHarness()
    const a = (await ensure(h, { paragraphs: [{ index: 0 }] })).json.paragraphs[0] as Result
    const b = (await ensure(h, { paragraphs: [{ index: 0 }], voice: 'b' })).json.paragraphs[0] as Result
    expect(b.status).toBe('ready')
    expect(b.chunks![0].hash).not.toBe(a.chunks![0].hash)
    expect(JSON.parse(h.fish.calls[1].body).reference_id).toBe('voice-b-id')

    const other = makeHarness({ NARRATION_MODEL: 's1' })
    other.env.AUDIO_BUCKET = h.env.AUDIO_BUCKET
    const c = (await ensure(other, { paragraphs: [{ index: 0 }] })).json.paragraphs[0] as Result
    expect(c).toMatchObject({ status: 'ready', source: 'generated' })
    expect(c.chunks![0].hash).not.toBe(a.chunks![0].hash)
    expect(other.fish.calls[0].model).toBe('s1')
  })

  it('deduplicates concurrent requests: a locked chunk waits for the recording instead of generating', async () => {
    const h = makeHarness()
    const text = narrationTextForParagraph(PARAGRAPHS[0])
    const { narrationCacheIdentity, DEFAULT_NARRATION_SETTINGS } = await import('./narration/narrationCore')
    const identity = await narrationCacheIdentity({ provider: 'fish', model: 's2.1-pro', voiceId: 'voice-a-id', text, settings: DEFAULT_NARRATION_SETTINGS })
    await h.env.RATE_LIMIT.put(`narration:lock:${identity.hash}`, JSON.stringify({ at: h.clock.now }))

    const pending = await ensure(h, { paragraphs: [{ index: 0 }] })
    expect(pending.json.paragraphs[0]).toMatchObject({ status: 'pending', readyChunks: 0, retryAfterMs: 1500 })
    expect(h.fish.calls.length).toBe(0)

    const other = makeHarness()
    other.env.AUDIO_BUCKET = h.env.AUDIO_BUCKET
    other.env.RATE_LIMIT = new FakeKV() as never
    let published = false
    h.deps.sleep = async (ms: number) => {
      h.clock.now += ms
      if (!published) { published = true; await ensure(other, { paragraphs: [{ index: 0 }] }) }
    }
    const waited = await ensure(h, { paragraphs: [{ index: 0 }] })
    expect(waited.json.paragraphs[0]).toMatchObject({ status: 'ready', waited: true })
    expect(h.fish.calls.length).toBe(0)
    expect(other.fish.calls.length).toBe(1)
  })

  it('stops at the spending ceiling without calling the provider', async () => {
    const h = makeHarness({ NARRATION_DAILY_BYTES: '150' })
    await h.env.RATE_LIMIT.put('narration:usage:day:2026-09-18', JSON.stringify({ bytes: 100, requests: 1, generated: 1, failed: 0, cacheHits: 0, providerMs: 0 }))
    const result = await ensure(h, { paragraphs: [{ index: 0 }] })
    expect(result.json.paragraphs[0]).toMatchObject({ status: 'failed', reason: 'budget_exhausted' })
    expect(result.json.paragraphs[0].retryAfterMs).toBeGreaterThan(0)
    expect(h.fish.calls.length).toBe(0)
  })

  it('retries overloads a bounded number of times and opens the breaker after repeated failures', async () => {
    const h = makeHarness()
    let overloads = 2
    const respond = h.fish.respond
    h.fish.respond = (call) => {
      if (overloads > 0) { overloads -= 1; return new Response('busy', { status: 503 }) }
      return respond(call)
    }
    const recovered = await ensure(h, { paragraphs: [{ index: 0 }] })
    expect(recovered.json.paragraphs[0]).toMatchObject({ status: 'ready', attempts: 3 })
    expect(h.fish.calls.length).toBe(3)

    const down = makeHarness()
    down.fish.respond = () => new Response('busy', { status: 503 })
    for (let round = 0; round < 3; round += 1) {
      const result = await ensure(down, { paragraphs: [{ index: 1 }] })
      expect(result.json.paragraphs[0]).toMatchObject({ status: 'failed', reason: 'provider_unavailable' })
    }
    expect(down.fish.calls.length).toBe(9)
    const fast = await ensure(down, { paragraphs: [{ index: 1 }] })
    expect(fast.json.paragraphs[0]).toMatchObject({ status: 'failed', reason: 'provider_unavailable' })
    expect(down.fish.calls.length).toBe(9)
    expect(down.env.AUDIO_BUCKET.store.size).toBe(0)
  })

  it('does not retry authentication or payment failures and publishes nothing', async () => {
    const h = makeHarness()
    h.fish.respond = () => new Response('nope', { status: 402 })
    const result = await ensure(h, { paragraphs: [{ index: 0 }, { index: 1 }] })
    expect(result.json.paragraphs[0]).toMatchObject({ status: 'failed', reason: 'provider_payment' })
    expect(result.json.paragraphs.length).toBe(1)
    expect(h.fish.calls.length).toBe(1)
    expect(h.env.AUDIO_BUCKET.store.size).toBe(0)
  })

  it('refuses to publish audio that fails validation, keeping any earlier chunks', async () => {
    const h = makeHarness()
    let calls = 0
    const respond = h.fish.respond
    h.fish.respond = (call) => {
      calls += 1
      if (calls === 2) return new Response(`data: ${JSON.stringify({ audio_base64: Buffer.from(new Uint8Array(2000)).toString('base64'), chunk_seq: 0, chunk_audio_offset_sec: 0, alignment: { audio_duration: 5, segments: [] } })}\n\n`, { status: 200 })
      return respond(call)
    }
    const result = (await ensure(h, { paragraphs: [{ index: 4 }] })).json.paragraphs[0] as Result
    expect(result).toMatchObject({ status: 'partial', readyChunks: 1 })
    expect((result.failure as Record<string, unknown>).reason).toBe('validation_failed')
    expect(String((result.failure as Record<string, unknown>).detail)).toContain('audio_not_mp3')
    const map = JSON.parse(decoder.decode(h.env.AUDIO_BUCKET.store.get(narrationMapKey('odyssey', 'original-en', 1, 'a', 4))!))
    expect(map.chunks.length).toBe(1)
    expect(map.complete).toBe(false)
  })

  it('falls back to plain synthesis when timestamps are unavailable and marks timings unusable', async () => {
    const h = makeHarness()
    const respond = h.fish.respond
    h.fish.respond = (call) => (call.url.endsWith('/with-timestamp') ? new Response('missing', { status: 404 }) : respond(call))
    const result = (await ensure(h, { paragraphs: [{ index: 0 }] })).json.paragraphs[0] as Result
    expect(result).toMatchObject({ status: 'ready', timingsSource: 'none', timingsUsable: false, words: null })
    expect(result.duration).toBeGreaterThan(1)
    expect(h.fish.calls.map(call => call.url)).toEqual(['https://fish.test/v1/tts/stream/with-timestamp', 'https://fish.test/v1/tts'])
  })

  it('keeps word timings only when enough provider segments match the tokens', async () => {
    const h = makeHarness()
    h.fish.respond = ({ body }: { body?: string }) => {
      const text = (JSON.parse(body || '{}') as { text: string }).text
      return new Response(fishTimestampSseFor(text, { dropEvery: 4 }), { status: 200 })
    }
    const result = (await ensure(h, { paragraphs: [{ index: 0 }] })).json.paragraphs[0] as Result
    expect(result).toMatchObject({ status: 'ready', timingsUsable: false, words: null })
    expect((result.chunks![0].alignment as { matchRatio: number }).matchRatio).toBeLessThan(0.85)
  })
})

describe('verse markers and cache identity', () => {
  it('sends the narrator only spoken words and times one word per spoken token', async () => {
    const h = makeHarness()
    const result = (await ensure(h, { paragraphs: [{ index: 3, textHash: await textHashOf(PARAGRAPHS[3]) }] })).json.paragraphs[0] as Result
    expect(result.status).toBe('ready')
    const sent = JSON.parse(h.fish.calls[0].body).text as string
    expect(sent).not.toMatch(/[⁰¹²³⁴⁵⁶⁷⁸⁹]/)
    expect(sent.startsWith('In the beginning')).toBe(true)
    const words = result.chunks![0].words as Array<{ text: string }>
    expect(words.length).toBe(sent.split(' ').length)
    expect(words.map(w => w.text)).not.toContain('¹')
    // The reader re-inserts the silent markers by position.
    const { alignTimedWordsToText } = await import('./lab/labFollow')
    const aligned = alignTimedWordsToText(narrationTextForParagraph(PARAGRAPHS[3]), words as never)
    expect(aligned?.length).toBe(narrationTextForParagraph(PARAGRAPHS[3]).split(' ').length)
    expect(aligned?.[0]).toMatchObject({ text: '¹', start: aligned?.[1].start })
  })

  it('treats a listed recording whose identity no longer matches as missing', async () => {
    const h = makeHarness()
    await ensure(h, { paragraphs: [{ index: 0 }] })
    // A different model is a different identity: the recording on disk is not
    // the one today's settings would produce, however the map lists it.
    h.env.NARRATION_MODEL = 's2.1-pro-next'
    expect((await chapter(h)).json.paragraphs[0]).toMatchObject({ status: 'stale' })
    const again = (await ensure(h, { paragraphs: [{ index: 0 }] })).json.paragraphs[0] as Result
    expect(again).toMatchObject({ status: 'ready', source: 'generated' })
    expect(h.fish.calls.length).toBe(2)
    expect(h.fish.calls[1].model).toBe('s2.1-pro-next')
  })
})

describe('POST /api/narration/warm', () => {
  it('rejects a bad token before revealing configuration and lists chapters without the public throttle', async () => {
    const off = makeHarness({ NARRATION_PILOT: '0' }, { user: null })
    expect((await ensure(off, { paragraphs: [{ index: 0 }] }, { 'x-narration-admin': 'wrong' }, 'warm')).status).toBe(403)
    const limited = makeHarness({}, { rateLimited: true })
    const response = await handleNarration(new Request('https://tinct.app/api/narration/chapter?bookId=odyssey&editionKey=original-en&chapter=1&voice=a', { headers: { 'x-narration-admin': 'warm-token-0123456789abcdef' } }), limited.env, limited.ctx, limited.deps)
    expect(response.status).toBe(200)
  })

  it('needs the admin token, not a reader, and generates like ensure', async () => {
    const anonymous = makeHarness({}, { user: null })
    expect((await ensure(anonymous, { paragraphs: [{ index: 0 }] }, {}, 'warm')).status).toBe(403)
    expect((await ensure(anonymous, { paragraphs: [{ index: 0 }] }, { 'x-narration-admin': 'wrong' }, 'warm')).status).toBe(403)
    const warmed = await ensure(anonymous, { paragraphs: [{ index: 0 }, { index: 1 }] }, { 'x-narration-admin': 'warm-token-0123456789abcdef' }, 'warm')
    expect(warmed.status).toBe(200)
    expect(warmed.json.paragraphs.map(item => item.status)).toEqual(['ready', 'ready'])
    const unconfigured = makeHarness({ NARRATION_ADMIN_TOKEN: '' }, { user: null })
    expect((await ensure(unconfigured, { paragraphs: [{ index: 0 }] }, { 'x-narration-admin': '' }, 'warm')).status).toBe(403)
  })
})

describe('publish safety', () => {
  it('serves narration audio publicly but never its metadata JSON', async () => {
    const h = makeHarness()
    const entry = (await ensure(h, { paragraphs: [{ index: 0 }] })).json.paragraphs[0] as Result
    const hash = entry.chunks![0].hash
    const meta = await handleAudioFile(new Request(`https://tinct.app/api/audio-file?path=narration%2Ffish%2Fblob%2F${hash}.json`), h.env as never)
    expect(meta.status).toBe(400)
    const audio = await handleAudioFile(new Request(`https://tinct.app${entry.chunks![0].url}`), h.env as never)
    expect(audio.status).toBe(200)
  })

  it('releases only the lock it took', async () => {
    const h = makeHarness()
    const text = narrationTextForParagraph(PARAGRAPHS[2])
    const { narrationCacheIdentity, DEFAULT_NARRATION_SETTINGS } = await import('./narration/narrationCore')
    const identity = await narrationCacheIdentity({ provider: 'fish', model: 's2.1-pro', voiceId: 'voice-a-id', text, settings: DEFAULT_NARRATION_SETTINGS })
    const lockKey = `narration:lock:${identity.hash}`
    const respond = h.fish.respond
    h.fish.respond = async (call) => {
      await h.env.RATE_LIMIT.put(lockKey, JSON.stringify({ token: 'someone-else', at: 1 }))
      return respond(call)
    }
    const result = await ensure(h, { paragraphs: [{ index: 2 }] })
    expect(result.json.paragraphs[0].status).toBe('ready')
    expect(await h.env.RATE_LIMIT.get(lockKey)).not.toBeNull()
  })

  it('does not open the breaker on our own storage failures', async () => {
    const h = makeHarness()
    h.env.AUDIO_BUCKET.put = async () => { throw new Error('r2 down') }
    for (let round = 0; round < 3; round += 1) {
      const result = await ensure(h, { paragraphs: [{ index: 0 }] })
      expect(result.json.paragraphs[0]).toMatchObject({ status: 'failed', reason: 'storage_failed' })
    }
    expect(await h.env.RATE_LIMIT.get('narration:breaker')).toBeNull()
    expect(h.fish.calls.length).toBe(3)
  })

  it('rate limits the public chapter listing', async () => {
    const limited = makeHarness({}, { rateLimited: true })
    expect((await chapter(limited)).status).toBe(429)
  })
})

describe('GET /api/narration/usage', () => {
  it('is admin-only and reports counters and ceilings', async () => {
    const reader = makeHarness()
    expect((await handleNarration(new Request('https://tinct.app/api/narration/usage'), reader.env, reader.ctx, reader.deps)).status).toBe(403)
    const admin = makeHarness({}, { admin: true })
    await ensure(admin, { paragraphs: [{ index: 0 }] })
    const response = await handleNarration(new Request('https://tinct.app/api/narration/usage'), admin.env, admin.ctx, admin.deps)
    const json = await response.json() as Record<string, unknown>
    expect(json).toMatchObject({ enabled: true, ceilings: { dailyBytes: 2000000, monthlyBytes: 10000000 } })
    expect((json.day as Record<string, number>).generated).toBe(1)
    expect(JSON.stringify(json)).not.toContain('test-key')
  })
})

describe('GET /api/narration/chapter', () => {
  it('validates scope, lists nothing when unconfigured, and reports chunk progress', async () => {
    const h = makeHarness()
    expect((await chapter(h, 'bookId=odyssey&editionKey=original-en&chapter=1&voice=zz')).status).toBe(400)
    expect((await chapter(h, 'bookId=odyssey&editionKey=modern-da&chapter=1&voice=a')).status).toBe(403)
    const off = makeHarness({ NARRATION_PILOT: '0' })
    const listing = await chapter(off)
    expect(listing.status).toBe(200)
    expect(listing.json.paragraphs).toEqual([])
    await ensure(h, { paragraphs: [{ index: 4 }], mode: 'next' })
    const progress = await chapter(h)
    expect(progress.json.paragraphs[4]).toMatchObject({ status: 'partial', readyChunks: 1 })
    expect(progress.json.paragraphs[0]).toMatchObject({ status: 'missing', chunkCount: 1 })
  })
})

describe('narration cache integrity under interference', () => {
  it('regenerates only a torn chunk and keeps the chunks after it listed', async () => {
    const h = makeHarness()
    const warmed = await ensure(h, { paragraphs: [{ index: 4 }], mode: 'all' })
    expect(warmed.json.paragraphs[0].readyChunks).toBe(3)
    const callsAfterWarm = h.fish.calls.length
    const mapKey = narrationMapKey('odyssey', 'original-en', 1, 'a', 4)
    const entry = JSON.parse(decoder.decode(h.env.AUDIO_BUCKET.store.get(mapKey)!)) as { chunks: Array<{ hash: string }> }
    // Tear chunk 1: a different rendering lands under its key, so meta and audio disagree.
    h.env.AUDIO_BUCKET.store.set(narrationBlobKeys(entry.chunks[1].hash).audio, syntheticMp3(90))
    // The listing reports the map (one read per paragraph); the torn chunk
    // is only found by the ensure path, which validates before playing.
    const listing = await chapter(h)
    expect(listing.json.paragraphs[4]).toMatchObject({ readyChunks: 3, listedOnly: true })
    const repaired = await ensure(h, { paragraphs: [{ index: 4 }], mode: 'next' })
    expect(repaired.json.paragraphs[0].readyChunks).toBe(3)
    expect(h.fish.calls.length - callsAfterWarm).toBe(1)
    const after = JSON.parse(decoder.decode(h.env.AUDIO_BUCKET.store.get(mapKey)!)) as { chunks: unknown[]; complete: boolean }
    expect(after.chunks).toHaveLength(3)
    expect(after.complete).toBe(true)
  })

  it('keeps the recording another generator finished during synthesis instead of overwriting it', async () => {
    const h = makeHarness()
    const text = chunkNarrationText(narrationTextForParagraph(PARAGRAPHS[0]))[0].text
    const textHash = await textHashOf(PARAGRAPHS[0])
    const config = narrationConfig(h.env)
    const identity = await narrationCacheIdentity({ provider: 'fish', model: config.model, voiceId: 'voice-a-id', text, settings: config.settings })
    const keys = narrationBlobKeys(identity.hash)
    const theirs = syntheticMp3(150)
    const original = h.fish.respond
    h.fish.respond = async (call) => {
      // While we synthesise, a competitor publishes a valid recording of the same chunk.
      await h.env.AUDIO_BUCKET.put(keys.audio, theirs)
      await h.env.AUDIO_BUCKET.put(keys.meta, JSON.stringify({
        version: NARRATION_CACHE_VERSION, provider: 'fish', model: config.model, voiceId: 'voice-a-id', voiceKey: 'a', settings: config.settings,
        hash: identity.hash, textHash, text, bookId: 'odyssey', editionKey: 'original-en', chapter: 1, paragraphIndex: 0,
        chunkIndex: 0, chunkCount: 1, wordFrom: 0, wordTo: text.split(' ').length, createdAt: '2026-09-19T00:00:00.000Z',
        audioBytes: theirs.length, textBytes: 1, duration: 3.9, measuredDuration: 3.9, words: null,
        alignment: { expectedWords: 0, heardWords: 0, matchedWords: 0, matchRatio: 0, lastMatchedWord: -1 }, timingsUsable: false, providerSegments: [], generationMs: 1,
      }))
      h.fish.respond = original
      return original(call)
    }
    const result = await ensure(h, { paragraphs: [{ index: 0 }] })
    expect(result.json.paragraphs[0].status).toBe('ready')
    expect(result.json.paragraphs[0].raced).toBe(true)
    expect(result.json.paragraphs[0].duration).toBe(3.9)
    expect(h.env.AUDIO_BUCKET.store.get(keys.audio)!.length).toBe(theirs.length)
  })
})

describe('narration recordings are found by identity, not only by the map', () => {
  it('adopts an existing recording the map does not list without calling the provider, and repairs the map', async () => {
    const h = makeHarness()
    const warmed = await ensure(h, { paragraphs: [{ index: 0 }], mode: 'all' })
    expect(warmed.json.paragraphs[0].status).toBe('ready')
    const calls = h.fish.calls.length
    const mapKey = narrationMapKey('odyssey', 'original-en', 1, 'a', 0)
    const entry = JSON.parse(decoder.decode(h.env.AUDIO_BUCKET.store.get(mapKey)!)) as Record<string, unknown> & { chunks: unknown[] }
    // The map lags its last write: it lists nothing although the recording exists.
    await h.env.AUDIO_BUCKET.put(mapKey, JSON.stringify({ ...entry, chunks: [], complete: false }))
    const again = await ensure(h, { paragraphs: [{ index: 0 }], mode: 'next' })
    expect(again.json.paragraphs[0]).toMatchObject({ status: 'ready', readyChunks: 1, probed: 1 })
    expect(h.fish.calls.length).toBe(calls)
    const repaired = JSON.parse(decoder.decode(h.env.AUDIO_BUCKET.store.get(mapKey)!)) as { chunks: unknown[]; complete: boolean }
    expect(repaired.chunks).toHaveLength(1)
    expect(repaired.complete).toBe(true)
  })
})
