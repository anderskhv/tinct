import { describe, expect, it } from 'vitest'
import worker from './worker'

const shell = '<!doctype html><html><head><title>Tinct</title></head><body>app shell</body></html>'
const env = {
  ASSETS: {
    fetch: async (request: Request) => {
      const path = new URL(request.url).pathname
      if (path === '/app.html' || path === '/app') {
        return new Response(shell, { status: 200, headers: { 'Content-Type': 'text/html' } })
      }
      if (path === '/read/index.html') {
        return new Response('<html>library hub</html>', { status: 200, headers: { 'Content-Type': 'text/html' } })
      }
      return new Response('Not found', { status: 404 })
    },
  },
}
const ctx = { waitUntil: () => undefined } as unknown as ExecutionContext

describe('reader cutover route contract', () => {
  it('preserves app intents and their query string through the /read redirect', async () => {
    const response = await worker.fetch(
      new Request('https://tinct.app/read?view=library&signin=1'),
      env as never,
      ctx,
    )
    expect(response.status).toBe(302)
    expect(response.headers.get('Location')).toBe('/app?view=library&signin=1')
  })

  it('keeps admin metrics on the SPA shell during reader cutover', async () => {
    const response = await worker.fetch(new Request('https://tinct.app/admin/metrics'), env as never, ctx)
    expect(response.status).toBe(200)
    expect(await response.text()).toContain('app shell')
  })

  it('returns a real 404 for missing hashed assets instead of SPA HTML', async () => {
    const response = await worker.fetch(new Request('https://tinct.app/assets/index-old.js'), env as never, ctx)
    expect(response.status).toBe(404)
    expect(await response.text()).not.toContain('app shell')
  })

  it('keeps forced phone and desktop lab surfaces private', async () => {
    for (const path of ['/lab/phone', '/lab/desktop']) {
      const response = await worker.fetch(new Request(`https://tinct.app${path}`), env as never, ctx)
      expect(response.status).toBe(200)
      expect(response.headers.get('X-Robots-Tag')).toContain('noindex')
      expect(response.headers.get('Cache-Control')).toBe('no-store')
    }
  })
})
