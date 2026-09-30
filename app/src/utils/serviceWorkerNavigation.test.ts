import { readFileSync } from 'node:fs'
import vm from 'node:vm'
import { expect, it, vi } from 'vitest'

function harness(networkDown: boolean, answer?: () => Response) {
  const listeners: Record<string, Function> = {}
  const shell = new Response('cached legacy shell')
  const cache = { match: vi.fn(async (key: string) => (key === '/app.html' ? shell.clone() : undefined)), put: vi.fn() }
  const fetch = vi.fn(async () => {
    if (networkDown) throw new TypeError('offline')
    return answer!()
  })
  const self = { location: { origin: 'https://tinct.app' }, addEventListener: (name: string, fn: Function) => { listeners[name] = fn }, skipWaiting: () => {}, clients: { claim: () => Promise.resolve() } }
  vm.runInNewContext(readFileSync(new URL('../../public/sw.js', import.meta.url), 'utf8'), { self, caches: { open: async () => cache }, fetch, URL, Request, Response, Set, Promise })
  // `new Request(url, { mode: 'navigate' })` throws, so a navigation is a plain object.
  async function navigate(url: string) {
    let response: Promise<Response> | undefined
    listeners.fetch({ request: { method: 'GET', url, mode: 'navigate' }, respondWith: (value: Promise<Response>) => { response = value }, waitUntil: () => {} })
    return response ? await response : null
  }
  return { navigate }
}

it('serves the cached shell only when a /reader navigation fails at the network', async () => {
  const h = harness(true)
  expect(await (await h.navigate('https://tinct.app/reader?book=odyssey&chapter=2'))!.text()).toBe('cached legacy shell')
})

it.each([
  ['a redirect (opaqueredirect)', () => Object.defineProperty(new Response(null), 'type', { value: 'opaqueredirect' }) as Response],
  ['a 404', () => new Response('nope', { status: 404 })],
  ['a 500', () => new Response('boom', { status: 500 })],
])('passes %s from /reader through instead of the cached shell', async (_name, answer) => {
  const h = harness(false, answer)
  const response = await h.navigate('https://tinct.app/reader')
  expect(response).not.toBeNull()
  expect(await response!.text()).not.toBe('cached legacy shell')
  expect(response!.type === 'opaqueredirect' || response!.status >= 400).toBe(true)
})

it.each(['/read/odyssey', '/read/odyssey/chapter-2', '/app', '/library'])('does not intercept a navigation to %s', async (path) => {
  const h = harness(true)
  expect(await h.navigate('https://tinct.app' + path)).toBeNull()
})
