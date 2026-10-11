// @vitest-environment jsdom
/**
 * The account cards are warmed while the reader is idle (Anders, 10 Oct 2026:
 * "can we do the same for profile?"): the same reads the cards make on open,
 * into the same device cache, only with a stored session whose token is still
 * good, only when the network is spare, and only once the reader has settled.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../services/supabase', () => ({ supabase: { auth: { storageKey: 'sb-test-auth-token', getSession: vi.fn(() => new Promise(() => {})) } }, isSupabaseConfigured: () => true }))

const USER = '11111111-1111-4111-8111-111111111111'
const store = (expiresIn: number) => localStorage.setItem('sb-test-auth-token', JSON.stringify({
  access_token: 'stored-token', refresh_token: 'r', expires_at: Math.floor(Date.now() / 1000) + expiresIn,
  user: { id: USER, email: 'anders@example.com', user_metadata: { full_name: 'Anders' } },
}))
const PROFILE = { name: 'Anders K. Hvelplund', handle: 'anders', link: 'tinct.app/@anders', picture: { kind: 'cover', value: 'frankenstein', url: null, review: 'none' }, background: { kind: 'library', value: null, url: null, review: 'none' }, visibility: 'everyone', shows: { reading: true, time: true, board: true }, shouldPrompt: false, uploads: false }
let calls: string[] = []

beforeEach(() => {
  vi.resetModules()
  localStorage.clear()
  calls = []
  document.head.innerHTML = '<meta name="tinct-social" content="1"><meta name="tinct-friends" content="1">'
  document.body.innerHTML = '<div data-reader-ready="true"></div>'
  vi.spyOn(document, 'readyState', 'get').mockReturnValue('complete')
  vi.stubGlobal('requestIdleCallback', (run: () => void) => { run(); return 1 })
  const realSetTimeout = globalThis.setTimeout
  vi.stubGlobal('setTimeout', ((fn: () => void, ms?: number, ...rest: unknown[]) => realSetTimeout(fn, ms === 3000 ? 0 : ms, ...rest)) as typeof setTimeout)
  Object.defineProperty(navigator, 'connection', { configurable: true, value: { saveData: false, effectiveType: '4g' } })
  vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL) => {
    const url = String(input)
    calls.push(url.split('?')[0])
    if (url.startsWith('/api/profile')) return Response.json({ enabled: true, available: true, profile: PROFILE })
    if (url.startsWith('/api/reading-time')) return Response.json({ enabled: true, rows: [{ day: new Date().toISOString().slice(0, 10), bookId: 'frankenstein', read: 3600, listen: 0 }] })
    if (url.startsWith('/api/social/board')) return Response.json({ tab: 'friends', total: 5, meShown: true, me: null, entries: [{ rank: 3, name: 'Anders', picture: { kind: 'initial', initial: 'A' }, seconds: 3600, duration: '1 h', me: true }] })
    if (url.startsWith('/api/subscription-info')) return Response.json({ subscription_status: 'active', stripe: true })
    if (url.startsWith('/lab/catalogue.json')) return Response.json({ books: [{ id: 'frankenstein', title: 'Frankenstein', readingStructure: { chapters: [{ number: 1, title: 'Letter 1' }] } }] })
    if (url.startsWith('/api/lab-position')) return Response.json({ books: {}, finished: {}, updatedAt: 0 })
    return Response.json({}, { status: 404 })
  }))
})
afterEach(() => vi.unstubAllGlobals())

const flush = async () => { for (let i = 0; i < 20; i++) await new Promise(resolve => setTimeout(resolve, 0)) }

describe('warmAccountCards', () => {
  it('writes the cards cache from the same reads the cards make, with a stored, still-good session', async () => {
    store(3600)
    const { warmAccountCards } = await import('./warmCards')
    const { readCardsCache } = await import('./cardsCache')
    warmAccountCards()
    await flush()
    expect(calls).toEqual(expect.arrayContaining(['/api/profile', '/api/reading-time', '/api/social/board', '/api/subscription-info']))
    const cache = readCardsCache(USER)
    expect(cache?.profile?.name).toBe('Anders K. Hvelplund')
    expect(cache?.rank).toBe('3rd of 5')
    expect(cache?.plan).toBe('premium')
    expect(cache?.billing).toBe(true)
    expect(cache?.reading?.stats).toBeTruthy()
  })

  it('does nothing once a navigation has started (beforeunload), before pagehide', async () => {
    store(3600)
    const { warmAccountCards } = await import('./warmCards')
    warmAccountCards()
    window.dispatchEvent(new Event('beforeunload'))
    await flush()
    expect(calls).toEqual([])
  })

  it('does nothing with an expired stored session (never a token refresh), on Save Data, or signed out', async () => {
    store(-60)
    const { warmAccountCards } = await import('./warmCards')
    warmAccountCards()
    await flush()
    expect(calls).toEqual([])
    localStorage.clear()
    store(3600)
    Object.defineProperty(navigator, 'connection', { configurable: true, value: { saveData: true, effectiveType: '4g' } })
    warmAccountCards()
    await flush()
    expect(calls).toEqual([])
    Object.defineProperty(navigator, 'connection', { configurable: true, value: { saveData: false, effectiveType: '4g' } })
    localStorage.clear()
    warmAccountCards()
    await flush()
    expect(calls).toEqual([])
  })

  it('keeps what the cache already holds when a read is unavailable', async () => {
    store(3600)
    const { writeCardsCache, readCardsCache } = await import('./cardsCache')
    writeCardsCache(USER, { profile: null, reading: null, rank: '1st of 2', plan: 'free', billing: false })
    vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input)
      calls.push(url.split('?')[0])
      if (url.startsWith('/api/profile')) return Response.json({ enabled: true, available: true, profile: PROFILE })
      return Response.json({}, { status: 503 })
    }))
    const { warmAccountCards } = await import('./warmCards')
    warmAccountCards()
    await flush()
    const cache = readCardsCache(USER)
    expect(cache?.profile?.name).toBe('Anders K. Hvelplund')
    expect(cache?.rank).toBe('1st of 2')
    expect(cache?.plan).toBe('free')
  })
})
