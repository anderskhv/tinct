import { readFileSync } from 'node:fs'
import vm from 'node:vm'
import { expect, it, vi } from 'vitest'

// "Make available offline": offline home and library loads go to the cached
// reader page, and the page can ask for the whole reader shell (lazy bundles too).
const PRECACHE = ['/reader', '/assets/index-AbCdEf12.js']
const LAZY = ['/assets/useVoiceSession-AbCdEf12.js']

function harness() {
  const listeners: Record<string, Function> = {}
  const stored = new Map<string, Response>()
  const cache = {
    match: vi.fn(async (key: string) => stored.get(key)?.clone()),
    put: vi.fn(async (key: string, response: Response) => { stored.set(key, response) }),
  }
  let online = true
  const fetch = vi.fn(async (request: Request | string) => {
    if (!online) throw new TypeError('offline')
    const url = typeof request === 'string' ? request : new URL(request.url).pathname
    return new Response(url === '/reader' ? '<title>reader shell</title>' : 'network ' + url)
  })
  const source = readFileSync(new URL('../../public/sw.js', import.meta.url), 'utf8')
    .replace(/const APP_SHELL_PRECACHE_URLS = \[[\s\S]*?\]/, `const APP_SHELL_PRECACHE_URLS = ${JSON.stringify(PRECACHE)}`)
    .replace(/const APP_SHELL_LAZY_URLS = \[[\s\S]*?\]/, `const APP_SHELL_LAZY_URLS = ${JSON.stringify(LAZY)}`)
  const self = { location: { origin: 'https://tinct.app' }, addEventListener: (name: string, fn: Function) => { listeners[name] = fn }, skipWaiting: () => {}, clients: { claim: () => Promise.resolve() } }
  vm.runInNewContext(source, { self, caches: { open: async () => cache }, fetch, URL, Request, Response, Set, Map, Promise, JSON })
  async function install() {
    let done: Promise<unknown> = Promise.resolve()
    listeners.install({ waitUntil: (p: Promise<unknown>) => { done = p } })
    await done
  }
  async function navigate(path: string) {
    let response: Promise<Response> | undefined
    const request = new Request('https://tinct.app' + path)
    Object.defineProperty(request, 'mode', { value: 'navigate' })
    listeners.fetch({ request, respondWith: (value: Promise<Response>) => { response = value }, waitUntil: () => {} })
    return response ? await response : null
  }
  async function cacheShell() {
    let reply: unknown
    let done: Promise<unknown> = Promise.resolve()
    listeners.message({ data: { type: 'CACHE_APP_SHELL' }, ports: [{ postMessage: (value: unknown) => { reply = value } }], waitUntil: (p: Promise<unknown>) => { done = p } })
    await done
    return reply
  }
  return { install, navigate, cacheShell, stored, goOffline: () => { online = false } }
}

it('leaves the library to the network while online', async () => {
  const h = harness()
  await h.install()
  expect(await (await h.navigate('/library?book=frankenstein'))!.text()).toBe('network /library')
})

it('sends an offline home or library load to the cached reader (the book last read)', async () => {
  const h = harness()
  await h.install()
  h.goOffline()
  for (const path of ['/', '/library', '/library/', '/index.html']) {
    const page = await h.navigate(path)
    expect(page!.status).toBe(200)
    expect(await page!.text()).toContain('location.replace("/reader")')
  }
  // Nothing from the address reaches the page.
  expect(await (await h.navigate('/library?book=%22%3B%3C/script%3E'))!.text()).not.toContain('script%3E')
  expect(await (await h.navigate('/library?book=frankenstein'))!.text()).toContain('location.replace("/reader")')
})

it('says offline, not a blank reader, when the reader page was never cached', async () => {
  const h = harness()
  h.goOffline()
  expect((await h.navigate('/library'))!.status).toBe(503)
})

it('does not answer other pages', async () => {
  const h = harness()
  expect(await h.navigate('/sign-in')).toBeNull()
})

it('caches the reader page and every bundle, lazy ones too, when a book is saved', async () => {
  const h = harness()
  expect(await h.cacheShell()).toEqual({ ok: true })
  expect([...h.stored.keys()].sort()).toEqual(['/assets/index-AbCdEf12.js', '/assets/useVoiceSession-AbCdEf12.js', '/reader'])
  h.goOffline()
  expect(await (await h.navigate('/reader'))!.text()).toBe('<title>reader shell</title>')
})

it('reports failure when offline before anything was cached', async () => {
  const h = harness()
  h.goOffline()
  expect(await h.cacheShell()).toEqual({ ok: false })
})
