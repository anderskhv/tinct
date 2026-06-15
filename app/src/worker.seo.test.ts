import { describe, expect, it } from 'vitest'
import worker, { serveSpaWithMetaForTest } from './worker'

function envWithAppShell(html = '<!doctype html><html><head><title>Tinct — A New Way to Read</title></head><body>app</body></html>') {
  return {
    ASSETS: {
      fetch: async () => new Response(html, {
        status: 200,
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      }),
    },
  }
}

function routerEnv() {
  const shell = '<!doctype html><html><head><title>Tinct — A New Way to Read</title></head><body>app shell</body></html>'
  const hub = '<!doctype html><html><head><title>Tinct Library</title></head><body><a href="/read/odyssey/summary">The Odyssey</a></body></html>'
  return {
    ASSETS: {
      fetch: async (request: Request) => {
        const url = new URL(request.url)
        if (url.pathname === '/app.html' || url.pathname === '/app') {
          return new Response(shell, { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } })
        }
        if (url.pathname === '/read/index.html') {
          return new Response(hub, { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } })
        }
        if (url.pathname === '/robots.txt') {
          return new Response('User-agent: *\nAllow: /\nDisallow: /data/\nDisallow: /api/\n', { status: 200, headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
        }
        if (url.pathname === '/llms.txt') {
          return new Response('# Tinct\n\nUse public HTML pages for citations.\n', { status: 200, headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
        }
        return new Response('Not found', { status: 404, headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
      },
    },
  }
}

const ctx = { waitUntil: () => undefined } as unknown as ExecutionContext

describe('worker SEO SPA metadata', () => {
  it('injects book metadata and Book JSON-LD into /read book shells', async () => {
    const resp = await serveSpaWithMetaForTest(
      'GET',
      new URL('https://tinct.app/read/odyssey'),
      envWithAppShell() as never,
      {
        title: 'Read The Odyssey Online | Tinct',
        description: 'Read the Odyssey online with modern editions and an AI reading companion.',
        bookName: 'The Odyssey',
        author: 'Homer',
      },
      'https://tinct.app/read/odyssey',
      'book',
    )

    expect(resp).not.toBeNull()
    expect(resp?.headers.get('Cache-Control')).toBe('no-store')
    const html = await resp!.text()
    expect(html).toContain('<title>Read The Odyssey Online | Tinct</title>')
    expect(html).toContain('<link rel="canonical" href="https://tinct.app/read/odyssey">')
    expect(html).toContain('"@type":"Book"')
    expect(html).toContain('"name":"The Odyssey"')
    expect(html).toContain('"name":"Homer"')
  })

  it('escapes HTML meta fields while preserving JSON-LD strings', async () => {
    const resp = await serveSpaWithMetaForTest(
      'GET',
      new URL('https://tinct.app/read/test-book'),
      envWithAppShell() as never,
      {
        title: 'Bad <title> "quoted"',
        description: 'Description with <script>alert(1)</script> & quotes',
        bookName: 'Bad <Book>',
        author: 'Author "Name"',
      },
      'https://tinct.app/read/test-book',
      'book',
    )

    const html = await resp!.text()
    expect(html).toContain('<title>Bad &lt;title&gt; &quot;quoted&quot;</title>')
    expect(html).toContain('content="Description with &lt;script&gt;alert(1)&lt;/script&gt; &amp; quotes"')
    expect(html).toContain('"name":"Bad <Book>"')
    expect(html).toContain('"name":"Author \\"Name\\""')
  })

  it('returns no body for HEAD while keeping SEO headers', async () => {
    const resp = await serveSpaWithMetaForTest(
      'HEAD',
      new URL('https://tinct.app/read/odyssey'),
      envWithAppShell() as never,
      {
        title: 'Read The Odyssey Online | Tinct',
        description: 'Read the Odyssey online with modern editions and an AI reading companion.',
        bookName: 'The Odyssey',
        author: 'Homer',
      },
      'https://tinct.app/read/odyssey',
      'book',
    )

    expect(resp?.status).toBe(200)
    expect(resp?.headers.get('Content-Type')).toBe('text/html; charset=utf-8')
    expect(await resp!.text()).toBe('')
  })
})

describe('worker SEO routing', () => {
  it('serves the crawlable /read hub instead of the app shell', async () => {
    const resp = await worker.fetch(new Request('https://tinct.app/read'), routerEnv() as never, ctx)
    expect(resp.status).toBe(200)
    expect(resp.headers.get('Cache-Control')).toBe('public, max-age=300, must-revalidate')
    expect(await resp.text()).toContain('/read/odyssey/summary')
  })

  it('serves bare /{bookId} routes with /read/{bookId} canonical metadata', async () => {
    const resp = await worker.fetch(new Request('https://tinct.app/odyssey'), routerEnv() as never, ctx)
    expect(resp.status).toBe(200)
    const html = await resp.text()
    expect(html).toContain('<link rel="canonical" href="https://tinct.app/read/odyssey">')
    expect(html).toContain('"@type":"Book"')
  })

  it('returns 404 noindex for unknown /read/{bookId} routes', async () => {
    const resp = await worker.fetch(new Request('https://tinct.app/read/seo-audit-missing-book'), routerEnv() as never, ctx)
    expect(resp.status).toBe(404)
    expect(resp.headers.get('X-Robots-Tag')).toContain('noindex')
  })

  it('serves unknown app paths as noindex SPA fallback', async () => {
    const resp = await worker.fetch(new Request('https://tinct.app/some-deep-app-state'), routerEnv() as never, ctx)
    expect(resp.status).toBe(200)
    expect(resp.headers.get('X-Robots-Tag')).toContain('noindex')
    expect(await resp.text()).toContain('app shell')
  })

  it('allows reputable AI crawlers while still blocking junk scrapers', async () => {
    const allowed = await worker.fetch(new Request('https://tinct.app/llms.txt', {
      headers: { 'User-Agent': 'GPTBot/1.0' },
    }), routerEnv() as never, ctx)
    expect(allowed.status).toBe(200)

    const blocked = await worker.fetch(new Request('https://tinct.app/llms.txt', {
      headers: { 'User-Agent': 'Bytespider/1.0' },
    }), routerEnv() as never, ctx)
    expect(blocked.status).toBe(403)
  })
})
