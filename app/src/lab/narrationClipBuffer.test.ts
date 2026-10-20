import { describe, expect, it, vi } from 'vitest'
import {
  CLIP_BUFFER_HIDDEN_SECONDS,
  CLIP_BUFFER_SAVE_DATA_SECONDS,
  CLIP_BUFFER_VISIBLE_SECONDS,
  NarrationClipBuffer,
  clipBufferSeconds,
  clipUrlOfSource,
  clipsToBuffer,
  sourcePlaysClip,
} from './narrationClipBuffer'

function deferred<T>() {
  let resolve!: (value: T) => void
  let reject!: (error: unknown) => void
  const promise = new Promise<T>((res, rej) => { resolve = res; reject = rej })
  return { promise, resolve, reject }
}

function setup(maxBytes = 1_000_000) {
  const requests: Array<{ url: string; init?: RequestInit; answer: ReturnType<typeof deferred<Response>> }> = []
  let blobs = 0
  const revoked: string[] = []
  const fetch = vi.fn((url: string, init?: RequestInit) => {
    const answer = deferred<Response>()
    requests.push({ url, init, answer })
    return answer.promise
  }) as unknown as typeof globalThis.fetch
  const buffer = new NarrationClipBuffer({
    fetch,
    createObjectURL: () => `blob:test/${++blobs}`,
    revokeObjectURL: url => { revoked.push(url) },
    now: () => 0,
    maxBytes,
  })
  const ok = (bytes = 100) => ({ ok: true, blob: async () => new Blob([new Uint8Array(bytes)], { type: 'audio/mpeg' }) }) as unknown as Response
  const flush = () => new Promise(resolve => setTimeout(resolve, 0))
  return { buffer, requests, revoked, ok, flush, fetch }
}

describe('clipBufferSeconds', () => {
  it('keeps two minutes ahead while visible, more while hidden, less with Save-Data', () => {
    expect(clipBufferSeconds({ hidden: false, saveData: false, rate: 1 })).toBe(CLIP_BUFFER_VISIBLE_SECONDS)
    expect(clipBufferSeconds({ hidden: true, saveData: false, rate: 1 })).toBe(CLIP_BUFFER_HIDDEN_SECONDS)
    expect(clipBufferSeconds({ hidden: false, saveData: true, rate: 1 })).toBe(CLIP_BUFFER_SAVE_DATA_SECONDS)
    expect(clipBufferSeconds({ hidden: true, saveData: true, rate: 1 })).toBe(CLIP_BUFFER_SAVE_DATA_SECONDS * 2)
    expect(CLIP_BUFFER_VISIBLE_SECONDS).toBeGreaterThanOrEqual(60)
  })

  it('is listening time: faster playback holds more recording, slower never less than 1x', () => {
    expect(clipBufferSeconds({ hidden: false, saveData: false, rate: 2 })).toBe(CLIP_BUFFER_VISIBLE_SECONDS * 2)
    expect(clipBufferSeconds({ hidden: false, saveData: false, rate: 0.75 })).toBe(CLIP_BUFFER_VISIBLE_SECONDS)
    expect(clipBufferSeconds({ hidden: false, saveData: false, rate: Number.NaN })).toBe(CLIP_BUFFER_VISIBLE_SECONDS)
  })
})

describe('clipsToBuffer', () => {
  const clips = [
    { url: '/a', duration: 10 }, { url: '/b', duration: 3 }, { url: '/c', duration: 40 },
    { url: '/d', duration: 50 }, { url: '/e', duration: 60 }, { url: '/f', duration: 10 },
  ]

  it('reaches the target listening time past the playhead, in playing order', () => {
    expect(clipsToBuffer(clips, 0, 4, 60)).toEqual(['/b', '/c', '/d'])
    expect(clipsToBuffer(clips, 0, 4, 1000)).toEqual(['/b', '/c', '/d', '/e', '/f'])
  })

  it('always holds the next two clips, however long the one playing is', () => {
    expect(clipsToBuffer(clips, 2, 400, 60)).toEqual(['/d', '/e'])
    expect(clipsToBuffer(clips, 4, 0, 60)).toEqual(['/f'])
    expect(clipsToBuffer(clips, 5, 0, 60)).toEqual([])
  })

  it('stops at a recording that is still being made', () => {
    const pending = [{ url: '/a', duration: 5 }, { url: '/b', duration: 5 }, { duration: 5 }, { url: '/d', duration: 5 }]
    expect(clipsToBuffer(pending, 0, 5, 120)).toEqual(['/b'])
  })

  it('counts a clip of unknown length as ten seconds', () => {
    const unknown = Array.from({ length: 20 }, (_, index) => ({ url: `/${index}` }))
    expect(clipsToBuffer(unknown, 0, 0, 60)).toHaveLength(6)
  })
})

describe('NarrationClipBuffer', () => {
  it('downloads nearest first, one at a time, and hands the element a blob: copy', async () => {
    const h = setup()
    h.buffer.want(['/b', '/c'])
    await h.flush()
    expect(h.requests.map(request => request.url)).toEqual(['/b'])
    expect(h.buffer.sourceFor('/b')).toBeNull()
    h.requests[0].answer.resolve(h.ok())
    await h.flush()
    expect(h.buffer.sourceFor('/b')).toBe('blob:test/1')
    expect(clipUrlOfSource('blob:test/1')).toBe('/b')
    expect(sourcePlaysClip('blob:test/1', '/b')).toBe(true)
    expect(sourcePlaysClip('blob:test/1', '/c')).toBe(false)
    expect(h.requests.map(request => request.url)).toEqual(['/b', '/c'])
    expect(h.requests[0].init).toMatchObject({ cache: 'force-cache', credentials: 'same-origin' })
  })

  it('never downloads a clip twice and keeps what is retained', async () => {
    const h = setup()
    h.buffer.want(['/b'])
    await h.flush()
    h.requests[0].answer.resolve(h.ok())
    await h.flush()
    h.buffer.want(['/b', '/c'])
    h.buffer.want(['/c'], ['/b'])
    await h.flush()
    expect(h.requests.map(request => request.url)).toEqual(['/b', '/c'])
    expect(h.buffer.sourceFor('/b')).toBe('blob:test/1')
    expect(h.revoked).toEqual([])
  })

  it('drops clips that fell behind and revokes their copies', async () => {
    const h = setup()
    h.buffer.want(['/b'])
    await h.flush()
    h.requests[0].answer.resolve(h.ok())
    await h.flush()
    h.buffer.want(['/d'], ['/c'])
    expect(h.buffer.sourceFor('/b')).toBeNull()
    expect(h.revoked).toEqual(['blob:test/1'])
    expect(clipUrlOfSource('blob:test/1')).toBe('blob:test/1')
  })

  it('a failed download leaves the clip to the element and is retried later', async () => {
    let now = 0
    const requests: string[] = []
    const fetch = vi.fn(async (url: string) => { requests.push(url); return { ok: false, status: 503 } as Response }) as unknown as typeof globalThis.fetch
    const buffer = new NarrationClipBuffer({ fetch, createObjectURL: () => 'blob:x', revokeObjectURL: () => {}, now: () => now, maxBytes: 1e6 })
    buffer.want(['/b'])
    await new Promise(resolve => setTimeout(resolve, 0))
    expect(buffer.sourceFor('/b')).toBeNull()
    buffer.want(['/b'])
    await new Promise(resolve => setTimeout(resolve, 0))
    expect(requests).toEqual(['/b'])
    now = 10_000
    buffer.want(['/b'])
    await new Promise(resolve => setTimeout(resolve, 0))
    expect(requests).toEqual(['/b', '/b'])
  })

  it('stops downloading at its memory ceiling', async () => {
    const h = setup(150)
    h.buffer.want(['/b', '/c', '/d'])
    await h.flush()
    h.requests[0].answer.resolve(h.ok(100))
    await h.flush()
    h.requests[1].answer.resolve(h.ok(100))
    await h.flush()
    expect(h.requests.map(request => request.url)).toEqual(['/b', '/c'])
    expect(h.buffer.bytes).toBe(200)
  })

  it('without blob: URLs it only warms the HTTP cache the element reads from', async () => {
    const arrayBuffer = vi.fn(async () => new ArrayBuffer(4))
    const fetch = vi.fn(async () => ({ ok: true, arrayBuffer }) as unknown as Response) as unknown as typeof globalThis.fetch
    const buffer = new NarrationClipBuffer({ fetch, createObjectURL: undefined, revokeObjectURL: undefined })
    buffer.want(['/b'])
    await new Promise(resolve => setTimeout(resolve, 0))
    expect(arrayBuffer).toHaveBeenCalledTimes(1)
    expect(buffer.isReady('/b')).toBe(true)
    expect(buffer.sourceFor('/b')).toBeNull()
  })

  it('clear aborts downloads in flight and forgets every copy', async () => {
    const h = setup()
    h.buffer.want(['/b', '/c'])
    await h.flush()
    h.requests[0].answer.resolve(h.ok())
    await h.flush()
    const signal = h.requests[1].init?.signal
    h.buffer.clear()
    expect(signal?.aborted).toBe(true)
    expect(h.revoked).toEqual(['blob:test/1'])
    h.requests[1].answer.resolve(h.ok())
    await h.flush()
    expect(h.buffer.sourceFor('/c')).toBeNull()
  })

  it('forget drops one copy so the element streams that recording', async () => {
    const h = setup()
    h.buffer.want(['/b'])
    await h.flush()
    h.requests[0].answer.resolve(h.ok())
    await h.flush()
    h.buffer.forget('/b')
    expect(h.buffer.sourceFor('/b')).toBeNull()
    expect(sourcePlaysClip('/b', '/b')).toBe(true)
  })
})

describe('NarrationClipBuffer early warning', () => {
  /** A streamed response: `chunks` arrive at once, then the connection hangs until aborted (or `finish`). */
  function streaming(signal: AbortSignal | undefined, chunks: number[], total: number, status = 200) {
    let finish: (() => void) | null = null
    let sent = 0
    const reader = {
      read: () => {
        if (sent < chunks.length) return Promise.resolve({ done: false, value: new Uint8Array(chunks[sent++]) })
        return new Promise<{ done: boolean; value?: Uint8Array }>((resolve, reject) => {
          finish = () => resolve({ done: true })
          signal?.addEventListener('abort', () => reject(Object.assign(new Error('aborted'), { name: 'AbortError' })), { once: true })
        })
      },
      cancel: async () => {},
    }
    const headers = new Map([['content-length', String(total)], ['content-type', 'audio/mpeg']])
    return { response: { ok: true, status, headers: { get: (name: string) => headers.get(name) ?? null }, body: { getReader: () => reader } } as unknown as Response, finish: () => finish?.() }
  }

  function rig() {
    let now = 0
    const calls: Array<{ url: string; range?: string; signal?: AbortSignal; answer: (response: Response) => void }> = []
    // Like fetch: an abort rejects a request still waiting for its answer.
    const fetch = vi.fn((url: string, init?: RequestInit) => new Promise<Response>((resolve, reject) => {
      init?.signal?.addEventListener('abort', () => reject(Object.assign(new Error('aborted'), { name: 'AbortError' })), { once: true })
      calls.push({ url, range: (init?.headers as Record<string, string> | undefined)?.Range, signal: init?.signal ?? undefined, answer: resolve })
    })) as unknown as typeof globalThis.fetch
    const signals: string[] = []
    const buffer = new NarrationClipBuffer({ fetch, createObjectURL: blob => `blob:size-${blob.size}`, revokeObjectURL: () => {}, now: () => now, maxBytes: 1e9 })
    buffer.onSignal = signal => { signals.push(signal.kind + (signal.aheadSeconds != null ? '@' + signal.aheadSeconds : '')) }
    const flush = () => new Promise(resolve => setTimeout(resolve, 0))
    return { buffer, calls, signals, flush, advance: (ms: number) => { now += ms } }
  }

  it('aborts a download that stops receiving bytes and resumes it from the last byte, while the buffer still plays', async () => {
    const h = rig()
    h.buffer.want(['/b'], [], { aheadSeconds: 80, rate: 1.5 })
    await h.flush()
    const first = streaming(h.calls[0].signal, [400], 1000)
    h.calls[0].answer(first.response)
    await h.flush()
    h.advance(2_000)
    h.buffer.check()
    expect(h.signals).toEqual([])
    h.advance(1_100)
    // Checked from the player's clock (media events), not only a timer.
    h.buffer.want(['/b'], [], { aheadSeconds: 78, rate: 1.5 })
    await h.flush()
    expect(h.signals).toEqual(['fetch-stalled@78'])
    expect(h.calls).toHaveLength(2)
    expect(h.calls[1].range).toBe('bytes=400-')
    expect(h.buffer.weak).toBe(true)
    const rest = streaming(h.calls[1].signal, [600], 600, 206)
    h.calls[1].answer(rest.response)
    await h.flush()
    rest.finish()
    await h.flush()
    // The copy holds every byte, the first attempt's and the resumed ones.
    expect(h.buffer.sourceFor('/b')).toBe('blob:size-1000')
    expect(h.signals).toEqual(['fetch-stalled@78', 'recovered@78'])
  })

  it('a request that never answers is a stall too, retried with back-off', async () => {
    const h = rig()
    h.buffer.want(['/b'], [], { aheadSeconds: 60 })
    await h.flush()
    h.advance(3_000)
    h.buffer.check()
    await h.flush()
    // The pending fetch was aborted; the retry starts at once (first back-off is 0).
    expect(h.calls).toHaveLength(2)
    expect(h.calls[0].signal?.aborted).toBe(true)
    h.advance(3_000)
    h.buffer.check()
    await h.flush()
    // The second resume waits its back-off before asking again.
    expect(h.calls).toHaveLength(2)
    h.advance(600)
    await new Promise(resolve => setTimeout(resolve, 10))
    h.buffer.want(['/b'], [], { aheadSeconds: 50 })
    await h.flush()
    expect(h.calls).toHaveLength(3)
  })

  it('below the low-water mark downloads the next clips side by side, but nearest first when nearly dry', async () => {
    const h = rig()
    h.buffer.want(['/b', '/c', '/d', '/e'], [], { aheadSeconds: 30 })
    await h.flush()
    expect(h.signals).toEqual(['low-water@30'])
    expect(h.calls.map(call => call.url)).toEqual(['/b', '/c', '/d'])
    const quiet = rig()
    quiet.buffer.want(['/b', '/c'], [], { aheadSeconds: 6 })
    await quiet.flush()
    expect(quiet.calls.map(call => call.url)).toEqual(['/b'])
    const healthy = rig()
    healthy.buffer.want(['/b', '/c'], [], { aheadSeconds: 100 })
    await healthy.flush()
    expect(healthy.calls.map(call => call.url)).toEqual(['/b'])
    expect(healthy.signals).toEqual([])
  })

  it('a download slower than the audio it carries marks the network weak', async () => {
    const h = rig()
    h.buffer.want(['/b'], [], { aheadSeconds: 100, rate: 2, durations: { '/b': 10 } })
    await h.flush()
    // 10 s of audio in 100 000 bytes: at 2x playback needs 20 000 B/s; 2 000 B arrived in 2.5 s.
    const slow = streaming(h.calls[0].signal, [2_000], 100_000)
    h.calls[0].answer(slow.response)
    await h.flush()
    h.advance(2_500)
    h.buffer.check()
    expect(h.signals).toEqual(['fetch-slow@100'])
    expect(h.buffer.weak).toBe(true)
    h.advance(31_000)
    expect(h.buffer.weak).toBe(false)
  })
})
