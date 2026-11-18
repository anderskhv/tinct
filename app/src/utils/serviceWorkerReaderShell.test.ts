import { readFileSync } from 'node:fs'
import vm from 'node:vm'
import { expect, it, vi } from 'vitest'

// The offline answer to a /reader load. Production redirects /app.html (to
// /app, then the library), so the old shell was the library page with
// redirected=true, and browsers fail a navigation answered with that.
const PRECACHE = ['/reader', '/assets/index-AbCdEf12.js']

function redirectedResponse(body: string): Response {
  const response = new Response(body, { headers: { 'Content-Type': 'text/html' } })
  Object.defineProperty(response, 'redirected', { value: true })
  return response
}

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
    // As production: the reader page arrives through the Worker's own routing.
    if (url === '/reader') return redirectedResponse('<title>reader shell</title>')
    return new Response('asset ' + url)
  })
  const source = readFileSync(new URL('../../public/sw.js', import.meta.url), 'utf8')
    .replace(/const APP_SHELL_PRECACHE_URLS = \[[\s\S]*?\]/, `const APP_SHELL_PRECACHE_URLS = ${JSON.stringify(PRECACHE)}`)
  const self = { location: { origin: 'https://tinct.app' }, addEventListener: (name: string, fn: Function) => { listeners[name] = fn }, skipWaiting: () => {}, clients: { claim: () => Promise.resolve() } }
  vm.runInNewContext(source, { self, caches: { open: async () => cache }, fetch, URL, Request, Response, Set, Map, Promise })
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
  return { install, navigate, stored, goOffline: () => { online = false } }
}

it('answers an offline /reader load with the cached reader page, never a redirected response', async () => {
  const h = harness()
  await h.install()
  expect(h.stored.get('/reader')?.redirected).toBe(false)
  h.goOffline()
  const page = await h.navigate('/reader?book=frankenstein')
  expect(page!.status).toBe(200)
  expect(page!.redirected).toBe(false)
  expect(await page!.text()).toBe('<title>reader shell</title>')
})

it('still goes to the network first while online', async () => {
  const h = harness()
  await h.install()
  const page = await h.navigate('/reader')
  expect(await page!.text()).toBe('<title>reader shell</title>')
})
