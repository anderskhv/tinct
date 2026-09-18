import { describe, expect, it, vi } from 'vitest'
import { handleNarration, narrationConfig, type NarrationDeps, type NarrationEnv } from './worker/routes/narration'
import { handleAudioFile } from './worker/routes/audio'
import { narrationMapKey, narrationTextForParagraph, sha256Hex } from './narration/narrationCore'
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

async function ensure(h: Harness, body: Record<string, unknown>, headers: Record<string, string> = {}) {
  const request = new Request('https://tinct.app/api/narration/ensure', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: 'https://tinct.app', ...headers },
    body: JSON.stringify({ bookId: 'odyssey', editionKey: 'original-en', chapter: 1, voice: 'a', ...body }),
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

describe('narration config and voices', () => {
  it('reports the pilot as off, unconfigured, or ready without leaking the key', async () => {
    const off = makeHarness({ NARRATION_PILOT: '0' })
    expect(narrationConfig(off.env)).toMatchObject({ enabled: false, reason: 'pilot_off' })
    const noKey = makeHarness({ FISH_AUDIO_API_KEY: '' })
    expect(narrationConfig(noKey.env)).toMatchObject({ enabled: false, reason: 'missing_api_key' })
    const ready = makeHarness()
    const response = await handleNarration(new Request('https://tinct.app/api/narration/voices'), ready.env, ready.ctx, ready.deps)
    const json = await response.json() as Record<string, unknown>
    expect(json).toMatchObject({ enabled: true, provider: 'fish', model: 's2.1-pro' })
    expect(json.voices).toEqual([{ key: 'a', label: 'Nathan' }, { key: 'b', label: 'Abby' }])
    expect(JSON.stringify(json)).not.toContain('test-key')
    expect(JSON.stringify(json)).not.toContain('voice-a-id')
  })
})

describe('POST /api/narration/ensure', () => {
  it('requires configuration, a signed-in reader, and the pilot scope', async () => {
    const off = makeHarness({ FISH_AUDIO_API_KEY: '' })
    expect((await ensure(off, {})).status).toBe(503)
    const anonymous = makeHarness({}, { user: null })
    expect((await ensure(anonymous, { paragraphs: [{ index: 0 }] })).status).toBe(401)
    const h = makeHarness()
    expect((await ensure(h, { paragraphs: [{ index: 0 }], chapter: 2 })).status).toBe(403)
    expect((await ensure(h, { paragraphs: [{ index: 0 }], editionKey: 'modern-da' })).status).toBe(403)
    expect((await ensure(h, { paragraphs: [{ index: 0 }], voice: 'z' })).status).toBe(400)
    expect((await ensure(h, { paragraphs: [] })).status).toBe(400)
    expect((await ensure(h, { paragraphs: [{ index: 0 }, { index: 1 }, { index: 2 }, { index: 0 }] })).status).toBe(400)
    const limited = makeHarness({}, { rateLimited: true })
    expect((await ensure(limited, { paragraphs: [{ index: 0 }] })).status).toBe(429)
    expect(h.fish.calls.length).toBe(0)
  })

  it('generates once, publishes audio + meta + map, then serves from cache', async () => {
    const h = makeHarness()
    const first = await ensure(h, { paragraphs: [{ index: 0, textHash: await textHashOf(PARAGRAPHS[0]) }] })
    expect(first.status).toBe(200)
    const entry = first.json.paragraphs[0]
    expect(entry).toMatchObject({ paragraph: 0, status: 'ready', source: 'generated', timingsUsable: true, timingsSource: 'with-timestamp' })
    expect(entry.url).toMatch(/^\/api\/audio-file\?path=narration%2Ffish%2Fblob%2F[0-9a-f]{64}\.mp3$/)
    const words = entry.words as Array<{ text: string; start: number; end: number }>
    expect(words.map(word => word.text)).toEqual(narrationTextForParagraph(PARAGRAPHS[0]).split(' '))
    expect(words[0].start).toBeLessThanOrEqual(words[1].start)
    expect(h.fish.calls.length).toBe(1)
    expect(h.fish.calls[0].model).toBe('s2.1-pro')
    expect(h.fish.calls[0].url).toBe('https://fish.test/v1/tts/stream/with-timestamp')
    expect(JSON.parse(h.fish.calls[0].body)).toMatchObject({ reference_id: 'voice-a-id', text: narrationTextForParagraph(PARAGRAPHS[0]), format: 'mp3' })

    const mapKey = narrationMapKey('odyssey', 'original-en', 1, 'a', 0)
    expect(h.env.AUDIO_BUCKET.store.has(mapKey)).toBe(true)
    expect(h.env.AUDIO_BUCKET.store.has(`narration/fish/blob/${entry.hash}.mp3`)).toBe(true)
    expect(h.env.AUDIO_BUCKET.store.has(`narration/fish/blob/${entry.hash}.json`)).toBe(true)

    const second = await ensure(h, { paragraphs: [{ index: 0 }] })
    expect(second.json.paragraphs[0]).toMatchObject({ status: 'ready', source: 'cache', hash: entry.hash, duration: entry.duration })
    expect(h.fish.calls.length).toBe(1)

    // The public audio route serves the published blob with range support.
    const audio = await handleAudioFile(new Request(`https://tinct.app${entry.url}`, { headers: { range: 'bytes=0-99' } }), h.env as never)
    expect(audio.status).toBe(206)
    expect(audio.headers.get('Content-Type')).toBe('audio/mpeg')

    // Accounting recorded the generation and the cache hit.
    const usage = await h.env.RATE_LIMIT.get('narration:usage:day:2026-09-18', 'json') as Record<string, number>
    expect(usage).toMatchObject({ generated: 1, cacheHits: 1, requests: 2 })
    expect(usage.bytes).toBeGreaterThan(0)
  })

  it('never plays stale narration: a changed paragraph gets a new recording and the old map entry is stale', async () => {
    const h = makeHarness()
    const first = await ensure(h, { paragraphs: [{ index: 1 }] })
    const before = first.json.paragraphs[0]
    expect(before.status).toBe('ready')

    h.paragraphs[1] = 'So now all who escaped death in battle or by shipwreck had got safely home except Odysseus.'
    const listing = await chapter(h)
    expect(listing.json.paragraphs[1]).toMatchObject({ paragraph: 1, status: 'stale' })
    expect(listing.json.paragraphs[0]).toMatchObject({ paragraph: 0, status: 'missing' })

    const second = await ensure(h, { paragraphs: [{ index: 1 }] })
    const after = second.json.paragraphs[0]
    expect(after).toMatchObject({ status: 'ready', source: 'generated' })
    expect(after.hash).not.toBe(before.hash)
    expect(after.textHash).not.toBe(before.textHash)
    expect(h.fish.calls.length).toBe(2)
    expect((await chapter(h)).json.paragraphs[1]).toMatchObject({ status: 'ready', hash: after.hash })
  })

  it('refuses to generate for text the reader does not have (text hash mismatch)', async () => {
    const h = makeHarness()
    const result = await ensure(h, { paragraphs: [{ index: 0, textHash: 'deadbeef' }] })
    expect(result.json.paragraphs[0]).toMatchObject({ status: 'text_mismatch' })
    expect(h.fish.calls.length).toBe(0)
  })

  it('gives a different voice, model or setting its own cache entry', async () => {
    const h = makeHarness()
    const a = (await ensure(h, { paragraphs: [{ index: 0 }] })).json.paragraphs[0]
    const b = (await ensure(h, { paragraphs: [{ index: 0 }], voice: 'b' })).json.paragraphs[0]
    expect(b.status).toBe('ready')
    expect(b.hash).not.toBe(a.hash)
    expect(JSON.parse(h.fish.calls[1].body).reference_id).toBe('voice-b-id')

    const other = makeHarness({ NARRATION_MODEL: 's1' })
    other.env.AUDIO_BUCKET = h.env.AUDIO_BUCKET
    const c = (await ensure(other, { paragraphs: [{ index: 0 }] })).json.paragraphs[0]
    expect(c).toMatchObject({ status: 'ready', source: 'generated' })
    expect(c.hash).not.toBe(a.hash)
    expect(other.fish.calls[0].model).toBe('s1')
  })

  it('deduplicates concurrent requests: a locked identity waits for the recording instead of generating', async () => {
    const h = makeHarness()
    const text = narrationTextForParagraph(PARAGRAPHS[0])
    const { narrationCacheIdentity, DEFAULT_NARRATION_SETTINGS } = await import('./narration/narrationCore')
    const identity = await narrationCacheIdentity({ provider: 'fish', model: 's2.1-pro', voiceId: 'voice-a-id', text, settings: DEFAULT_NARRATION_SETTINGS })
    await h.env.RATE_LIMIT.put(`narration:lock:${identity.hash}`, JSON.stringify({ at: h.clock.now }))

    // Nobody publishes: the waiter reports pending after the bounded wait.
    const pending = await ensure(h, { paragraphs: [{ index: 0 }] })
    expect(pending.json.paragraphs[0]).toMatchObject({ status: 'pending', retryAfterMs: 1500 })
    expect(h.fish.calls.length).toBe(0)

    // The other generator publishes while we wait: we get its recording.
    const other = makeHarness()
    other.env.AUDIO_BUCKET = h.env.AUDIO_BUCKET
    other.env.RATE_LIMIT = new FakeKV() as never
    let published = false
    h.deps.sleep = async (ms: number) => {
      h.clock.now += ms
      if (!published) { published = true; await ensure(other, { paragraphs: [{ index: 0 }] }) }
    }
    const waited = await ensure(h, { paragraphs: [{ index: 0 }] })
    expect(waited.json.paragraphs[0]).toMatchObject({ status: 'ready', source: 'cache', waited: true })
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

  it('refuses to publish audio that fails validation', async () => {
    const h = makeHarness()
    h.fish.respond = () => new Response(`data: ${JSON.stringify({ audio_base64: Buffer.from(new Uint8Array(2000)).toString('base64'), chunk_seq: 0, chunk_audio_offset_sec: 0, alignment: { audio_duration: 5, segments: [] } })}\n\n`, { status: 200 })
    const result = await ensure(h, { paragraphs: [{ index: 0 }] })
    expect(result.json.paragraphs[0]).toMatchObject({ status: 'failed', reason: 'validation_failed' })
    expect(String(result.json.paragraphs[0].detail)).toContain('audio_not_mp3')
    expect(h.env.AUDIO_BUCKET.store.size).toBe(0)
  })

  it('falls back to plain synthesis when timestamps are unavailable and marks timings unusable', async () => {
    const h = makeHarness()
    const respond = h.fish.respond
    h.fish.respond = (call) => (call.url.endsWith('/with-timestamp') ? new Response('missing', { status: 404 }) : respond(call))
    const result = await ensure(h, { paragraphs: [{ index: 0 }] })
    expect(result.json.paragraphs[0]).toMatchObject({ status: 'ready', timingsSource: 'none', timingsUsable: false, words: null })
    expect(result.json.paragraphs[0].duration).toBeGreaterThan(1)
    expect(h.fish.calls.map(call => call.url)).toEqual(['https://fish.test/v1/tts/stream/with-timestamp', 'https://fish.test/v1/tts'])
  })

  it('keeps word timings only when enough provider segments match the tokens', async () => {
    const h = makeHarness()
    h.fish.respond = ({ body }: { body?: string }) => {
      const text = (JSON.parse(body || '{}') as { text: string }).text
      return new Response(fishTimestampSseFor(text, { dropEvery: 4 }), { status: 200 })
    }
    const result = await ensure(h, { paragraphs: [{ index: 0 }] })
    expect(result.json.paragraphs[0]).toMatchObject({ status: 'ready', timingsUsable: false, words: null })
    const alignment = result.json.paragraphs[0].alignment as { matchRatio: number }
    expect(alignment.matchRatio).toBeLessThan(0.85)
  })
})

describe('publish safety', () => {
  it('serves narration audio publicly but never its metadata JSON', async () => {
    const h = makeHarness()
    const entry = (await ensure(h, { paragraphs: [{ index: 0 }] })).json.paragraphs[0]
    const meta = await handleAudioFile(new Request(`https://tinct.app/api/audio-file?path=narration%2Ffish%2Fblob%2F${entry.hash}.json`), h.env as never)
    expect(meta.status).toBe(400)
    const audio = await handleAudioFile(new Request(`https://tinct.app${entry.url}`), h.env as never)
    expect(audio.status).toBe(200)
  })

  it('releases only the lock it took', async () => {
    const h = makeHarness()
    const text = narrationTextForParagraph(PARAGRAPHS[2])
    const { narrationCacheIdentity, DEFAULT_NARRATION_SETTINGS } = await import('./narration/narrationCore')
    const identity = await narrationCacheIdentity({ provider: 'fish', model: 's2.1-pro', voiceId: 'voice-a-id', text, settings: DEFAULT_NARRATION_SETTINGS })
    const lockKey = `narration:lock:${identity.hash}`
    // Our lock expired mid-generation and another generator took a fresh one.
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
    expect(json).toMatchObject({ enabled: true, ceilings: { dailyBytes: 200000, monthlyBytes: 1000000 } })
    expect((json.day as Record<string, number>).generated).toBe(1)
    expect(JSON.stringify(json)).not.toContain('test-key')
  })
})

describe('GET /api/narration/chapter', () => {
  it('validates scope and lists nothing when unconfigured', async () => {
    const h = makeHarness()
    expect((await chapter(h, 'bookId=odyssey&editionKey=original-en&chapter=1&voice=zz')).status).toBe(400)
    expect((await chapter(h, 'bookId=odyssey&editionKey=modern-da&chapter=1&voice=a')).status).toBe(403)
    const off = makeHarness({ NARRATION_PILOT: '0' })
    const listing = await chapter(off)
    expect(listing.status).toBe(200)
    expect(listing.json.paragraphs).toEqual([])
  })
})

describe('vi sanity', () => {
  it('keeps the fake clock monotonic across sleeps', async () => {
    const h = makeHarness()
    const before = h.clock.now
    await h.deps.sleep!(10)
    expect(h.clock.now).toBe(before + 10)
    vi.restoreAllMocks()
  })
})
