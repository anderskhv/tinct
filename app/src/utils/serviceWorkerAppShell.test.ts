import { readFileSync } from 'node:fs'
import vm from 'node:vm'
import { expect, it, vi } from 'vitest'

// The build stamps the precache list into dist/sw.js; stamp a known one here.
const PRECACHE = ['/app.html', '/assets/index-AbCdEf12.js', '/lab/native-books.js']

function harness(networkDown: boolean) {
  const listeners: Record<string, Function> = {}
  const stored = new Map<string, string>([
    ['/lab/native-books.js', 'export{a as o} // previous build'],
    ['/assets/index-AbCdEf12.js', 'hashed bundle'],
  ])
  const cache = {
    match: vi.fn(async (key: string) => (stored.has(key) ? new Response(stored.get(key)) : undefined)),
    put: vi.fn(async (key: string, response: Response) => { stored.set(key, await response.text()) }),
  }
  const fetch = vi.fn(async (request: Request | string) => {
    if (networkDown) throw new TypeError('offline')
    return new Response(`fresh ${typeof request === 'string' ? request : request.url}`)
  })
  const source = readFileSync(new URL('../../public/sw.js', import.meta.url), 'utf8')
    .replace(/const APP_SHELL_PRECACHE_URLS = \[[\s\S]*?\]/, `const APP_SHELL_PRECACHE_URLS = ${JSON.stringify(PRECACHE)}`)
  const self = { location: { origin: 'https://tinct.app' }, addEventListener: (name: string, fn: Function) => { listeners[name] = fn }, skipWaiting: () => {}, clients: { claim: () => Promise.resolve() } }
  vm.runInNewContext(source, { self, caches: { open: async () => cache }, fetch, URL, Request, Response, Set, Map, Promise })
  async function get(path: string) {
    let response: Promise<Response> | undefined
    listeners.fetch({ request: new Request('https://tinct.app' + path), respondWith: (value: Promise<Response>) => { response = value }, waitUntil: () => {} })
    return response ? await response : null
  }
  return { get, fetch, stored }
}

it('fetches the fixed-name native-books module from the network, never an older build from the cache', async () => {
  const h = harness(false)
  expect(await (await h.get('/lab/native-books.js'))!.text()).toBe('fresh https://tinct.app/lab/native-books.js')
  // The fresh copy replaces the cached one for offline use.
  expect(h.stored.get('/lab/native-books.js')).toBe('fresh https://tinct.app/lab/native-books.js')
})

it('falls back to the cached native-books module only when offline', async () => {
  const h = harness(true)
  expect(await (await h.get('/lab/native-books.js'))!.text()).toBe('export{a as o} // previous build')
})

it('keeps serving content-hashed files from the cache without a request', async () => {
  const h = harness(false)
  expect(await (await h.get('/assets/index-AbCdEf12.js'))!.text()).toBe('hashed bundle')
  expect(h.fetch).not.toHaveBeenCalled()
})
