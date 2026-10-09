import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import worker from './worker'

// The Add-a-book page (addbooks/web, installed to public/lab/addbook) is a static
// page: the Worker must serve it as itself, under the production CSP, unindexed.
const PAGE = readFileSync(join(__dirname, '../../addbooks/web/src/index.html'), 'utf8')
const ROBOTS = readFileSync(join(__dirname, '../public/robots.txt'), 'utf8')

function env() {
  return {
    ASSETS: {
      fetch: async (request: Request) => {
        const url = new URL(request.url)
        if (url.pathname === '/lab/addbook/') return new Response(PAGE, { headers: { 'Content-Type': 'text/html; charset=utf-8' } })
        if (url.pathname === '/lab/addbook') return new Response(null, { status: 307, headers: { Location: '/lab/addbook/' } })
        if (url.pathname === '/lab/addbook/js/reader.js') return new Response('/* reader */', { headers: { 'Content-Type': 'text/javascript' } })
        if (url.pathname === '/app.html') return new Response('<html><head></head><body>app shell</body></html>', { headers: { 'Content-Type': 'text/html' } })
        return new Response('Not found', { status: 404 })
      },
    },
  }
}
const ctx = { waitUntil: () => undefined } as unknown as ExecutionContext

describe('/lab/addbook/', () => {
  it('is served as its own static page under the production CSP, noindex and uncached', async () => {
    const response = await worker.fetch(new Request('https://tinct.app/lab/addbook/'), env() as never, ctx)
    expect(response.status).toBe(200)
    const html = await response.text()
    // The start page (and its <h1>) was retired on 2026-10-08: the page is Add a book's PDF reader.
    expect(html).toContain('<title>Add a book · Tinct</title>')
    expect(html).toContain('js/reader.js')
    expect(html).not.toContain('app shell')
    expect(html).toMatch(/<meta name="robots" content="noindex">/)
    expect(html).not.toMatch(/<script>(?!<\/script>)/) // no inline scripts
    expect(response.headers.get('Content-Security-Policy')).toContain("script-src 'self';")
    expect(response.headers.get('Cache-Control')).toBe('no-store')
  })

  it('serves its files and the slashless redirect untouched', async () => {
    const js = await worker.fetch(new Request('https://tinct.app/lab/addbook/js/reader.js'), env() as never, ctx)
    expect(js.status).toBe(200)
    expect(await js.text()).toBe('/* reader */')
    const bare = await worker.fetch(new Request('https://tinct.app/lab/addbook'), env() as never, ctx)
    expect(bare.status).toBe(307)
    expect(bare.headers.get('Location')).toBe('/lab/addbook/')
  })

  it('is kept out of search by robots.txt', () => {
    expect(ROBOTS).toMatch(/^Disallow: \/lab\/$/m)
  })
})
