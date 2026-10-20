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
