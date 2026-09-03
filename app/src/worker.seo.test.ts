import { describe, expect, it } from 'vitest'
import worker, { serveSpaWithMetaForTest } from './worker'
import { handleIndexNowVerification, handleSeoAndStaticRequest } from './worker/routes/seo'

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
  const lab = '<!doctype html><html><head><meta name="robots" content="noindex, noarchive"><title>Tinct mobile landing and onboarding lab</title></head><body><div id="tinct-onboarding-worlds-v5">lab shell</div></body></html>'
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
        if (url.pathname === '/lab/index.html') {
          return new Response(null, { status: 307, headers: { Location: '/lab/' } })
        }
        if (url.pathname === '/lab/') {
          return new Response(lab, { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } })
        }
        if (url.pathname === '/lab/catalogue.json') {
          return Response.json({ marker: 'published catalogue' })
        }
        if (url.pathname === '/lab/catalogue-runtime.js') {
          return new Response('window.__labRuntimeLoaded = true', { headers: { 'Content-Type': 'text/javascript' } })
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
  it.each(['/lab', '/lab/', '/lab/landing', '/lab/library'])('serves the standalone noindex lab at %s', async (pathname) => {
    const resp = await worker.fetch(new Request(`https://tinct.app${pathname}`), routerEnv() as never, ctx)
    expect(resp.status).toBe(200)
    expect(resp.headers.get('Cache-Control')).toBe('no-store')
    expect(resp.headers.get('X-Robots-Tag')).toContain('noindex')
    const html = await resp.text()
    expect(html).toContain('id="tinct-onboarding-worlds-v5"')
    expect(html).not.toContain('app shell')
  })

  it.each([
    ['/lab/catalogue.json', 'application/json', 'published catalogue'],
    ['/lab/catalogue-runtime.js', 'text/javascript', '__labRuntimeLoaded'],
  ])('serves the standalone Lab asset %s instead of the app shell', async (pathname, contentType, marker) => {
    const resp = await worker.fetch(new Request(`https://tinct.app${pathname}`), routerEnv() as never, ctx)
    expect(resp.status).toBe(200)
    expect(resp.headers.get('Content-Type')).toContain(contentType)
    const body = await resp.text()
    expect(body).toContain(marker)
    expect(body).not.toContain('app shell')
  })

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

  it('keeps the public /read/:slug book page for SEO, but in-app opens skip it', async () => {
    const env = {
      ASSETS: {
        fetch: async (request: Request) => {
          const url = new URL(request.url)
          if (url.pathname === '/read/odyssey/book') {
            return new Response('<html>odyssey marketing</html>', {
              status: 200,
              headers: { 'Content-Type': 'text/html; charset=utf-8' },
            })
          }
          if (url.pathname === '/app.html' || url.pathname === '/app') {
            return new Response('<html>app shell</html>', {
              status: 200,
              headers: { 'Content-Type': 'text/html; charset=utf-8' },
            })
          }
          return new Response('Not found', { status: 404 })
        },
      },
    }

    const marketing = await worker.fetch(new Request('https://tinct.app/read/odyssey'), env as never, ctx)
    expect(await marketing.text()).toContain('odyssey marketing')

    const fromApp = await worker.fetch(new Request('https://tinct.app/read/odyssey?from=app'), env as never, ctx)
    expect(await fromApp.text()).toContain('app shell')

    const signedIn = await worker.fetch(new Request('https://tinct.app/read/odyssey', {
      headers: { Cookie: 'tinct_auth=1' },
    }), env as never, ctx)
    expect(await signedIn.text()).toContain('app shell')
  })

  it('serves the standalone /lab entry and nested reader as noindex surfaces', async () => {
    const lab = await worker.fetch(new Request('https://tinct.app/lab'), routerEnv() as never, ctx)
    expect(lab.status).toBe(200)
    expect(lab.headers.get('X-Robots-Tag')).toContain('noindex')
    expect(lab.headers.get('Cache-Control')).toBe('no-store')
    const html = await lab.text()
    expect(html).toContain('name="robots"')
    expect(html).toContain('noindex')
    expect(html).toContain('lab shell')

    const nested = await worker.fetch(new Request('https://tinct.app/lab/phone'), routerEnv() as never, ctx)
    expect(nested.headers.get('X-Robots-Tag')).toContain('noindex')
    expect(await nested.text()).toContain('name="robots"')

    const head = await worker.fetch(new Request('https://tinct.app/lab', { method: 'HEAD' }), routerEnv() as never, ctx)
    expect(head.headers.get('X-Robots-Tag')).toContain('noindex')
    expect(await head.text()).toBe('')
  })

  it('keeps /app on the production SPA shell', async () => {
    const resp = await worker.fetch(new Request('https://tinct.app/app'), routerEnv() as never, ctx)
    expect(resp.status).toBe(200)
    expect(await resp.text()).toContain('app shell')
  })

  it('serves unknown app paths as noindex SPA fallback', async () => {
    const resp = await worker.fetch(new Request('https://tinct.app/some-deep-app-state'), routerEnv() as never, ctx)
    expect(resp.status).toBe(200)
    expect(resp.headers.get('X-Robots-Tag')).toContain('noindex')
    expect(await resp.text()).toContain('app shell')
    const csp = resp.headers.get('Content-Security-Policy') || ''
    expect(csp).toContain('https://api.openai.com')
    expect(csp).toContain('mediastream:')
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

describe('worker static routing helpers', () => {
  it('serves the IndexNow key dynamically', async () => {
    const resp = handleIndexNowVerification(
      new Request('https://tinct.app/abc123XYZ.txt'),
      { INDEXNOW_KEY: 'abc123XYZ', ASSETS: { fetch: async () => new Response('not used') } },
    )

    expect(resp?.status).toBe(200)
    expect(resp?.headers.get('Cache-Control')).toBe('public, max-age=3600')
    expect(await resp!.text()).toBe('abc123XYZ')
  })

  it('rejects cross-site JSON data embeds before asset fetch', async () => {
    let assetFetches = 0
    const resp = await handleSeoAndStaticRequest(
      new Request('https://tinct.app/data/editions/odyssey-modern-en.json', {
        headers: { 'sec-fetch-site': 'cross-site' },
      }),
      {
        ASSETS: {
          fetch: async () => {
            assetFetches += 1
            return new Response('{}', { headers: { 'Content-Type': 'application/json' } })
          },
        },
      },
      ctx,
    )

    expect(resp.status).toBe(403)
    expect(resp.headers.get('X-Robots-Tag')).toContain('noindex')
    expect(assetFetches).toBe(0)
  })
})
