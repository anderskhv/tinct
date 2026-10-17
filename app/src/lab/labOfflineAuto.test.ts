// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  autoSaveBookOffline,
  OFFLINE_BOOK_SAVED_EVENT,
  offlineBookRemoved,
  readOfflineBookRecord,
  removeBookOffline,
  saveBookOffline,
  shouldAutoSaveBookOffline,
} from './labOfflineBook'

// A Cache Storage stand-in with the matching rules the save relies on.
class FakeCache {
  entries = new Map<string, string>()
  private abs(url: string) { return new URL(url, location.href).href }
  async match(url: string, options?: { ignoreSearch?: boolean }) {
    const href = this.abs(url)
    if (this.entries.has(href)) return new Response(this.entries.get(href))
    if (!options?.ignoreSearch) return undefined
    const path = new URL(href).pathname
    for (const [key, body] of this.entries) if (new URL(key).pathname === path) return new Response(body)
    return undefined
  }
  async put(url: string, response: Response) { this.entries.set(this.abs(url), await response.text()) }
  async keys(url?: string, options?: { ignoreSearch?: boolean }) {
    const all = [...this.entries.keys()]
    const path = url ? new URL(this.abs(url)).pathname : null
    return all.filter(key => !url || (options?.ignoreSearch ? new URL(key).pathname === path : key === this.abs(url))).map(key => ({ url: key }) as Request)
  }
  async delete(request: Request) { return this.entries.delete(request.url) }
}

const MANIFEST = { chapters: [{ number: 1, path: 'ch0001.json' }, { number: 2, path: 'ch0002.json' }, { number: 3, path: 'ch0003.json' }] }
let cache: FakeCache
let requested: Array<{ url: string; priority?: string }>
let inFlight = 0
let maxInFlight = 0
let failChapters = false

function body(url: string): Response {
  const path = new URL(url, location.href).pathname
  if (path.endsWith('/manifest.json')) return new Response(JSON.stringify(MANIFEST), { status: 200 })
  if (path.endsWith('-lines.json')) return new Response('', { status: 404 })
  if (failChapters && /ch\d+\.json$/.test(path)) return new Response('', { status: 500 })
  return new Response(`{"path":"${path}"}`, { status: 200 })
}

beforeEach(() => {
  localStorage.clear()
  cache = new FakeCache()
  requested = []
  inFlight = 0
  maxInFlight = 0
  failChapters = false
  vi.stubGlobal('__BUILD_VERSION__', 'b2')
  vi.stubGlobal('caches', { open: async () => cache })
  vi.stubGlobal('fetch', vi.fn(async (url: string, init?: RequestInit & { priority?: string }) => {
    requested.push({ url, priority: init?.priority })
    inFlight += 1
    maxInFlight = Math.max(maxInFlight, inFlight)
    await new Promise(resolve => setTimeout(resolve, 1))
    inFlight -= 1
    return body(url)
  }))
  // The service worker answers CACHE_APP_SHELL on the message port.
  const worker = { postMessage: (_message: unknown, ports: Array<{ postMessage?: unknown; onmessage?: (event: { data: unknown }) => void }>) => { setTimeout(() => channelPort1?.onmessage?.({ data: { ok: true } })) } }
  let channelPort1: { onmessage?: (event: { data: unknown }) => void } | null = null
  vi.stubGlobal('MessageChannel', class { port1: { onmessage?: (event: { data: unknown }) => void } = {}; port2 = {}; constructor() { channelPort1 = this.port1 } })
  Object.defineProperty(navigator, 'serviceWorker', { configurable: true, value: { ready: Promise.resolve({ active: worker }), getRegistration: () => Promise.resolve({ active: worker }) } })
  Object.defineProperty(navigator, 'onLine', { configurable: true, value: true })
})

afterEach(() => {
  vi.unstubAllGlobals()
  Object.defineProperty(navigator, 'connection', { configurable: true, value: undefined })
})

describe('background whole-book save', () => {
  it('saves every chapter of main and compare, two requests at a time at low priority, and says so', async () => {
    const saved = vi.fn()
    window.addEventListener(OFFLINE_BOOK_SAVED_EVENT, saved)
    expect(shouldAutoSaveBookOffline('frankenstein', ['original-en', 'modern-en'])).toBe(true)
    expect(await autoSaveBookOffline({ bookId: 'frankenstein', editionKeys: ['original-en', 'modern-en'], hasVerseLines: false })).toBe(true)
    window.removeEventListener(OFFLINE_BOOK_SAVED_EVENT, saved)
    const paths = [...cache.entries.keys()].map(key => new URL(key).pathname + new URL(key).search).sort()
    expect(paths).toEqual([
      '/data/editions-chapters/frankenstein-modern-en/ch0001.json?v=b2',
      '/data/editions-chapters/frankenstein-modern-en/ch0002.json?v=b2',
      '/data/editions-chapters/frankenstein-modern-en/ch0003.json?v=b2',
      '/data/editions-chapters/frankenstein-modern-en/manifest.json?v=b2',
      '/data/editions-chapters/frankenstein-original-en/ch0001.json?v=b2',
      '/data/editions-chapters/frankenstein-original-en/ch0002.json?v=b2',
      '/data/editions-chapters/frankenstein-original-en/ch0003.json?v=b2',
      '/data/editions-chapters/frankenstein-original-en/manifest.json?v=b2',
      '/data/editions/frankenstein-threads.json?v=b2',
    ])
    expect(maxInFlight).toBeLessThanOrEqual(2)
    expect(requested.every(request => request.priority === 'low')).toBe(true)
    expect(readOfflineBookRecord('frankenstein')).toMatchObject({ editions: ['original-en', 'modern-en'], version: 'b2' })
    expect(saved).toHaveBeenCalledTimes(1)
    // Saved for this build: the next visit does nothing.
    expect(shouldAutoSaveBookOffline('frankenstein', ['original-en', 'modern-en'])).toBe(false)
    expect(shouldAutoSaveBookOffline('frankenstein', ['original-en'])).toBe(false)
    requested = []
    expect(await autoSaveBookOffline({ bookId: 'frankenstein', editionKeys: ['original-en'], hasVerseLines: false })).toBe(false)
    expect(requested).toEqual([])
  })

  it('after a deploy, fetches only the new manifests: chapters cached under the old ?v= stay', async () => {
    const old = (path: string) => `http://localhost:3000${path}?v=b1`
    for (const path of ['manifest.json', 'ch0001.json', 'ch0002.json', 'ch0003.json']) cache.entries.set(old(`/data/editions-chapters/frankenstein-original-en/${path}`), '{}')
    cache.entries.set(old('/data/editions/frankenstein-threads.json'), '{}')
    localStorage.setItem('tinct:offline-books', JSON.stringify({ frankenstein: { editions: ['original-en'], version: 'b1', files: 6, savedAt: 1 } }))
    expect(shouldAutoSaveBookOffline('frankenstein', ['original-en'])).toBe(true)
    expect(await autoSaveBookOffline({ bookId: 'frankenstein', editionKeys: ['original-en'], hasVerseLines: false })).toBe(true)
    expect(requested.map(request => new URL(request.url, location.href).pathname)).toEqual(['/data/editions-chapters/frankenstein-original-en/manifest.json'])
    // One copy of the manifest, this build's.
    const manifests = [...cache.entries.keys()].filter(key => key.includes('manifest.json'))
    expect(manifests.map(key => new URL(key).search)).toEqual(['?v=b2'])
    expect(readOfflineBookRecord('frankenstein')?.version).toBe('b2')
  })

  it('resumes where an interrupted save stopped, quietly', async () => {
    failChapters = true
    expect(await autoSaveBookOffline({ bookId: 'frankenstein', editionKeys: ['original-en'], hasVerseLines: false })).toBe(false)
    expect(readOfflineBookRecord('frankenstein')).toBeUndefined()
    failChapters = false
    requested = []
    expect(await autoSaveBookOffline({ bookId: 'frankenstein', editionKeys: ['original-en'], hasVerseLines: false })).toBe(true)
    // The manifest and the cast came the first time.
    expect(requested.map(request => new URL(request.url, location.href).pathname).sort()).toEqual([
      '/data/editions-chapters/frankenstein-original-en/ch0001.json',
      '/data/editions-chapters/frankenstein-original-en/ch0002.json',
      '/data/editions-chapters/frankenstein-original-en/ch0003.json',
    ])
  })

  it('runs one save per book at a time', async () => {
    const first = autoSaveBookOffline({ bookId: 'frankenstein', editionKeys: ['original-en'], hasVerseLines: false })
    const second = autoSaveBookOffline({ bookId: 'frankenstein', editionKeys: ['original-en'], hasVerseLines: false })
    expect(second).toBe(first)
    await first
  })

  it('saves nothing without an active service worker (nothing could serve it offline)', async () => {
    const calls: string[] = []
    vi.stubGlobal('fetch', vi.fn(async (url: string) => { calls.push(String(url)); return new Response('{}') }))
    Object.defineProperty(navigator, 'serviceWorker', { configurable: true, value: { ready: new Promise(() => {}), getRegistration: () => Promise.resolve(undefined) } })
    expect(await autoSaveBookOffline({ bookId: 'frankenstein', editionKeys: ['original-en'], hasVerseLines: false })).toBe(false)
    expect(calls).toEqual([])
  })

  it('leaves a book the reader removed, until the reader saves it by hand', async () => {
    await saveBookOffline({ bookId: 'frankenstein', editionKeys: ['original-en'], hasVerseLines: false, onProgress: () => {} })
    await removeBookOffline('frankenstein')
    expect(cache.entries.size).toBe(0)
    expect(offlineBookRemoved('frankenstein')).toBe(true)
    expect(shouldAutoSaveBookOffline('frankenstein', ['original-en'])).toBe(false)
    await saveBookOffline({ bookId: 'frankenstein', editionKeys: ['original-en'], hasVerseLines: false, onProgress: () => {} })
    expect(offlineBookRemoved('frankenstein')).toBe(false)
  })

  it('waits while offline or when the reader asks to save data', () => {
    Object.defineProperty(navigator, 'onLine', { configurable: true, value: false })
    expect(shouldAutoSaveBookOffline('frankenstein', ['original-en'])).toBe(false)
    Object.defineProperty(navigator, 'onLine', { configurable: true, value: true })
    Object.defineProperty(navigator, 'connection', { configurable: true, value: { saveData: true } })
    expect(shouldAutoSaveBookOffline('frankenstein', ['original-en'])).toBe(false)
    Object.defineProperty(navigator, 'connection', { configurable: true, value: undefined })
    expect(shouldAutoSaveBookOffline('frankenstein', [])).toBe(false)
    expect(shouldAutoSaveBookOffline('frankenstein', ['original-en'])).toBe(true)
  })
})
