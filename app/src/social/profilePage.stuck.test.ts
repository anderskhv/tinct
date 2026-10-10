// @vitest-environment jsdom
/**
 * Anders's wife, signed in on iPhone, opened tinct.app/@ahvelplund and got a
 * blank page with the empty banner (10 October 2026). For a signed-in visitor
 * the Worker sends an empty page that this script fills in; it waited on
 * supabase.auth.getSession(), which on iPhone Safari can wait indefinitely
 * behind a token refresh, and nothing rendered if the profile request failed.
 */
import { afterEach, beforeEach, expect, it, vi } from 'vitest'

const getSession = vi.fn(() => new Promise<never>(() => {}))
vi.mock('../services/supabase', () => ({ supabase: { auth: { storageKey: 'sb-test-auth-token', getSession: () => getSession() } }, isSupabaseConfigured: () => true }))
vi.mock('../utils/funnel', () => ({ funnel: () => {}, setFunnelToken: () => {}, trackFunnel: () => {} }))

const PROFILE = { handle: 'anders', name: 'Anders K. Hvelplund', link: 'tinct.app/@anders', picture: { src: null, pos: '', cover: false, private: false, initial: 'A' }, banner: { src: '/b.jpg', private: false }, relation: 'stranger', followsYou: false, limited: false, time: null, readingNow: null, finished: null }
let answer: 'ok' | 'fail' = 'ok'
const auth: Array<string | null> = []

beforeEach(() => {
  answer = 'ok'
  auth.length = 0
  localStorage.clear()
  getSession.mockClear()
  document.head.innerHTML = '<meta name="tinct-social" content="1"><meta name="tinct-friends" content="1">'
  document.body.innerHTML = '<div id="tinct-profile" class="profile loading" data-handle="anders" data-state="loading"><div data-banner></div><main data-main></main></div>'
  vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input)
    if (url.startsWith('/api/social/profile/')) {
      auth.push(new Headers(init?.headers).get('Authorization'))
      if (answer === 'fail') throw new TypeError('Load failed')
      return Response.json({ profile: PROFILE })
    }
    return Response.json({}, { status: 404 })
  }))
})
afterEach(() => { vi.unstubAllGlobals(); vi.resetModules() })

const flush = async () => { for (let i = 0; i < 12; i++) await new Promise(resolve => setTimeout(resolve, 0)) }
const store = (expiresIn: number) => localStorage.setItem('sb-test-auth-token', JSON.stringify({ access_token: 'stored', expires_at: Math.floor(Date.now() / 1000) + expiresIn, user: { id: 'u' } }))

it('renders from the session stored in the browser while getSession never answers', async () => {
  store(3600)
  await import('./profilePage')
  await flush()
  const root = document.getElementById('tinct-profile')!
  expect(root.dataset.state).toBe('ready')
  expect(root.classList.contains('loading')).toBe(false)
  expect(auth).toEqual(['Bearer stored'])
})

it('with an expired stored session and getSession stuck, still renders (as a signed-out visitor) instead of a blank page', async () => {
  vi.useFakeTimers({ shouldAdvanceTime: true })
  store(-60)
  await import('./profilePage')
  await vi.advanceTimersByTimeAsync(5000)
  await flush()
  vi.useRealTimers()
  const root = document.getElementById('tinct-profile')!
  expect(root.dataset.state).toBe('ready')
  expect(root.classList.contains('loading')).toBe(false)
})

it('a failed profile request leaves a page with a way on, never the blank loading page', async () => {
  store(3600)
  answer = 'fail'
  await import('./profilePage')
  await flush()
  const root = document.getElementById('tinct-profile')!
  expect(root.classList.contains('loading')).toBe(false)
  expect(root.dataset.state).not.toBe('loading')
})
