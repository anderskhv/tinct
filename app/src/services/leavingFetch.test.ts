// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest'
import { keepaliveFor, leavingAwareFetch } from './leavingFetch'

const COMMIT = 'https://x.supabase.co/rest/v1/rpc/commit_user_data'
const post = (body = '{"p_key":"lab-highlights:bible:974"}'): RequestInit => ({ method: 'POST', body })

afterEach(() => { vi.unstubAllGlobals() })

it('uses keepalive only for small commits while the page is hidden', () => {
  expect(keepaliveFor(COMMIT, post(), true)).toBe(true)
  expect(keepaliveFor(COMMIT, post(), false)).toBe(false)
  expect(keepaliveFor(COMMIT, post('x'.repeat(30_000)), true)).toBe(false)
  expect(keepaliveFor('https://x.supabase.co/rest/v1/user_data?key=eq.a', post(), true)).toBe(false)
  expect(keepaliveFor(COMMIT, { method: 'GET' }, true)).toBe(false)
})

it('sends a commit made on pagehide with keepalive, and again without it when the browser refuses', async () => {
  const calls: RequestInit[] = []
  vi.stubGlobal('fetch', vi.fn(async (_input: RequestInfo | URL, init?: RequestInit) => {
    calls.push(init ?? {})
    if (init?.keepalive) throw new TypeError('keepalive quota exceeded')
    return new Response('[]')
  }))
  window.dispatchEvent(new Event('pagehide'))
  await leavingAwareFetch(COMMIT, post())
  expect(calls.map(call => call.keepalive === true)).toEqual([true, false])
  window.dispatchEvent(new Event('pageshow'))
  calls.length = 0
  await leavingAwareFetch(COMMIT, post())
  expect(calls.map(call => call.keepalive === true)).toEqual([false])
})
