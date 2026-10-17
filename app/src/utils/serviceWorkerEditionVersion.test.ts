import { readFileSync } from 'node:fs'
import vm from 'node:vm'
import { expect, it, vi } from 'vitest'

// Every deploy stamps a new ?v= on edition files. A book saved for offline
// reading under an earlier build must still open offline in the new one.
function harness() {
  const listeners: Record<string, Function> = {}
  const stored = new Map<string, string>()
  const keyOf = (request: Request | string) => typeof request === 'string' ? new URL(request, 'https://tinct.app').href : request.url
  const pathOf = (href: string) => new URL(href).pathname
  const cache = {
    match: vi.fn(async (request: Request | string, options?: { ignoreSearch?: boolean }) => {
      const key = keyOf(request)
      if (stored.has(key)) return new Response(stored.get(key))
      if (options?.ignoreSearch) for (const [k, body] of stored) if (pathOf(k) === pathOf(key)) return new Response(body)
      return undefined
    }),
    put: vi.fn(async (request: Request | string, response: Response) => { stored.set(keyOf(request), await response.text()) }),
    keys: vi.fn(async (request?: Request | string, options?: { ignoreSearch?: boolean }) => [...stored.keys()]
      .filter(k => !request || (options?.ignoreSearch ? pathOf(k) === pathOf(keyOf(request)) : k === keyOf(request)))
      .map(url => ({ url }))),
    delete: vi.fn(async (request: { url: string }) => stored.delete(request.url)),
  }
  let online = true
  const fetch = vi.fn(async (request: Request | string) => {
    if (!online) throw new TypeError('offline')
    return new Response('network ' + new URL(keyOf(request)).search)
  })
  const source = readFileSync(new URL('../../public/sw.js', import.meta.url), 'utf8')
  const self = { location: { origin: 'https://tinct.app' }, addEventListener: (name: string, fn: Function) => { listeners[name] = fn }, skipWaiting: () => {}, clients: { claim: () => Promise.resolve() } }
  vm.runInNewContext(source, { self, caches: { open: async () => cache }, fetch, URL, Request, Response, Set, Map, Promise, JSON })
  async function get(path: string) {
    let response: Promise<Response> | undefined
    listeners.fetch({ request: new Request('https://tinct.app' + path), respondWith: (value: Promise<Response>) => { response = value }, waitUntil: () => {} })
    return await response!
  }
  return { get, stored, setOnline: (value: boolean) => { online = value } }
}

const SHARD = '/data/editions-chapters/frankenstein-original-en/ch0020.json'

it('answers an offline chapter request from the copy saved under an earlier build', async () => {
  const h = harness()
  h.stored.set('https://tinct.app' + SHARD + '?v=old', 'saved chapter')
  h.setOnline(false)
  const response = await h.get(SHARD + '?v=new')
  expect(response.status).toBe(200)
  expect(await response.text()).toBe('saved chapter')
  // The loader's explicit retry, offline, too.
  expect(await (await h.get('/data/editions/frankenstein-original-en.json?v=new&fresh=1')).status).toBe(503)
  h.stored.set('https://tinct.app/data/editions/frankenstein-original-en.json?v=old', 'whole book')
  expect(await (await h.get('/data/editions/frankenstein-original-en.json?v=new&fresh=1')).text()).toBe('whole book')
})

it('online, reads the new build from the network and keeps one copy per file', async () => {
  const h = harness()
  h.stored.set('https://tinct.app' + SHARD + '?v=old', 'saved chapter')
  expect(await (await h.get(SHARD + '?v=new')).text()).toBe('network ?v=new')
  await vi.waitFor(() => expect([...h.stored.keys()]).toEqual(['https://tinct.app' + SHARD + '?v=new']))
})

it('still says offline for a chapter never saved', async () => {
  const h = harness()
  h.setOnline(false)
  expect((await h.get(SHARD + '?v=new')).status).toBe(503)
})
