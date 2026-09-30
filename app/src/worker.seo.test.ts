import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import worker from './worker'
import { filterHeldDiscoveryCards, handleIndexNowVerification, handleSeoAndStaticRequest } from './worker/routes/seo'

function routerEnv() {
  const shell = '<!doctype html><html><head><title>Tinct — A New Way to Read</title></head><body>app shell</body></html>'
  const hub = '<!doctype html><html><head><title>Tinct Library</title></head><body><a href="/read/odyssey/summary">The Odyssey</a></body></html>'
  const labSignIn = '<!doctype html><html><head><meta name="robots" content="noindex, noarchive"><title>Sign in</title></head><body><div id="tinct-lab-sign-in">sign in shell</div></body></html>'
  const notFound = '<!doctype html><html><head><title>Page not found — Tinct</title></head><body><a class="nf-wm" href="/">Tinct.</a><h1>This page isn’t on the shelf.</h1><a href="/library">Browse the library</a></body></html>'
  return {
    ASSETS: {
      fetch: async (request: Request) => {
        const url = new URL(request.url)
        if (url.pathname === '/app.html' || url.pathname === '/app') {
          return new Response(shell, { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } })
        }
        if (url.pathname === '/read/index.html') {
          return new Response(null, { status: 307, headers: { Location: '/read/' } })
        }
        if (url.pathname === '/read/') {
          return new Response(hub, { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } })
        }
        if (url.pathname === '/lab/library_2/') { return new Response('<html><head><title>Tinct</title></head><body>approved cinematic library</body></html>', {headers:{'Content-Type':'text/html'}}) }
        if (url.pathname === '/404.html') {
          return new Response(notFound, { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } })
        }
        if (url.pathname === '/lab/sign-in/') {
          return new Response(labSignIn, { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } })
        }
        if (url.pathname === '/lab/prefaces/odyssey.json') {
          return Response.json({ marker: 'complete approved preface' })
        }
        if (url.pathname === '/lab/catalogue.json') {
          return Response.json({ marker: 'published catalogue' })
        }
        if (url.pathname === '/lab/catalogue-runtime.js') {
          if (request.headers.has('If-None-Match')) {
            return new Response(null, { status: 304, headers: { ETag: '"lab-runtime"' } })
          }
          return new Response('window.__labRuntimeLoaded = true', { headers: { 'Content-Type': 'text/javascript' } })
        }
        if (url.pathname === '/lab/interaction-runtime.js') {
          return new Response('window.__labInteractionsLoaded = true', { headers: { 'Content-Type': 'text/javascript' } })
        }
        if (url.pathname === '/lab/library-2-runtime.js') {
          return new Response('window.__labLibrary2Loaded = true', { headers: { 'Content-Type': 'text/javascript' } })
        }
        if (url.pathname === '/lab/library-2-model.js') {
          return new Response('export const library2Model = true', { headers: { 'Content-Type': 'text/javascript' } })
        }
        if (url.pathname === '/lab/auth-status.js') {
          return new Response('window.__labAuthStatusLoaded = true', { headers: { 'Content-Type': 'text/javascript' } })
        }
        if (url.pathname === '/lab/sign-in-runtime.js') {
          return new Response('window.__labSignInLoaded = true', { headers: { 'Content-Type': 'text/javascript' } })
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

describe('worker SEO routing', () => {
  it.each(['/privacy-policy', '/privacy-policy/', '/privacy-policy.html'])('redirects the legacy privacy URL %s to /privacy', async (pathname) => {
    const resp = await worker.fetch(new Request(`https://tinct.app${pathname}`), routerEnv() as never, ctx)
    expect(resp.status).toBe(301)
    expect(resp.headers.get('Location')).toBe('https://tinct.app/privacy')
  })

  it('leaves /privacy itself to the static privacy.html asset', async () => {
    const resp = await worker.fetch(new Request('https://tinct.app/privacy'), routerEnv() as never, ctx)
    expect(resp.status).not.toBe(301)
  })

  it.each([
    ['/lab', '/'],
    ['/lab/', '/'],
    ['/lab/landing', '/'],
    ['/lab/index.html', '/'],
    ['/lab/library', '/library'],
    ['/lab/library_2', '/library'],
    ['/lab/library_2/', '/library'],
    ['/lab/library_2/index.html', '/library'],
    ['/lab/library-2', '/library'],
    ['/lab/library-2/', '/library'],
    ['/lab/reader', '/reader'],
    ['/lab/phone', '/reader?layout=phone'],
    ['/lab/desktop/', '/reader?layout=desktop'],
    ['/lab/sign-in', '/sign-in'],
    ['/lab/sign-in/', '/sign-in'],
    ['/lab/sign-in/index.html', '/sign-in'],
    ['/lab/featured', '/featured'],
    ['/lab/featured/', '/featured'],
  ])('redirects the old page URL %s permanently to %s', async (pathname, target) => {
    for (const method of ['GET', 'HEAD']) {
      const resp = await worker.fetch(new Request(`https://tinct.app${pathname}`, { method }), routerEnv() as never, ctx)
      expect(resp.status).toBe(308)
      expect(resp.headers.get('Location')).toBe(target)
    }
  })

  it('keeps the query string when redirecting an old page URL', async () => {
    const resp = await worker.fetch(new Request('https://tinct.app/lab/library_2/?book=hamlet&view=book-detail'), routerEnv() as never, ctx)
    expect(resp.status).toBe(308)
    expect(resp.headers.get('Location')).toBe('/library?book=hamlet&view=book-detail')
    const phone = await worker.fetch(new Request('https://tinct.app/lab/phone?chrome=v2&voice=v2'), routerEnv() as never, ctx)
    expect(phone.headers.get('Location')).toBe('/reader?voice=v2&layout=phone')
  })

  it('does not redirect asset files under the old folders, and answers unknown /lab pages with 404', async () => {
    const asset = await worker.fetch(new Request('https://tinct.app/lab/sign-in-runtime.js'), routerEnv() as never, ctx)
    expect(asset.status).toBe(200)
    expect(asset.headers.get('Location')).toBeNull()
    const unknown = await worker.fetch(new Request('https://tinct.app/lab/experiment'), routerEnv() as never, ctx)
    expect(unknown.status).toBe(404)
  })

  it.each(['/', '/library', '/library/'])('serves the library at %s with the URL unchanged', async (pathname) => {
    const resp = await worker.fetch(new Request(`https://tinct.app${pathname}`), routerEnv() as never, ctx)
    expect(resp.status).toBe(200)
    expect(resp.headers.get('Location')).toBeNull()
    expect(resp.headers.get('Cache-Control')).toBe('no-store')
    const html = await resp.text()
    expect(html).toContain('approved cinematic library')
    expect(html).not.toContain('app shell')
  })

  it.each(['/sign-in', '/sign-in/'])('serves the sign-in page at %s with the URL unchanged', async (pathname) => {
    const resp = await worker.fetch(new Request(`https://tinct.app${pathname}`), routerEnv() as never, ctx)
    expect(resp.status).toBe(200)
    expect(resp.headers.get('Location')).toBeNull()
    expect(resp.headers.get('X-Robots-Tag')).toContain('noindex')
    const html = await resp.text()
    expect(html).toContain('id="tinct-lab-sign-in"')
    expect(html).not.toContain('app shell')
  })

  it.each([
    ['/lab/catalogue.json', 'application/json', 'published catalogue'],
    ['/lab/prefaces/odyssey.json', 'application/json', 'complete approved preface'],
    ['/lab/catalogue-runtime.js', 'text/javascript', '__labRuntimeLoaded'],
    ['/lab/interaction-runtime.js', 'text/javascript', '__labInteractionsLoaded'],
    ['/lab/library-2-runtime.js', 'text/javascript', '__labLibrary2Loaded'],
    ['/lab/library-2-model.js', 'text/javascript', 'library2Model'],
    ['/lab/auth-status.js', 'text/javascript', '__labAuthStatusLoaded'],
    ['/lab/sign-in-runtime.js', 'text/javascript', '__labSignInLoaded'],
  ])('serves the standalone Lab asset %s instead of the app shell', async (pathname, contentType, marker) => {
    const resp = await worker.fetch(new Request(`https://tinct.app${pathname}`), routerEnv() as never, ctx)
    expect(resp.status).toBe(200)
    expect(resp.headers.get('Content-Type')).toContain(contentType)
    const body = await resp.text()
    expect(body).toContain(marker)
    expect(body).not.toContain('app shell')
  })

  it('keeps versioned Lab assets on the static asset path', async () => {
    const resp = await worker.fetch(new Request('https://tinct.app/lab/catalogue.json?v=20260903-2'), routerEnv() as never, ctx)
    expect(resp.headers.get('Content-Type')).toContain('application/json')
    expect(await resp.text()).toContain('published catalogue')
  })

  it('returns conditional Lab asset responses without falling through to the app shell', async () => {
    const resp = await worker.fetch(new Request('https://tinct.app/lab/catalogue-runtime.js?v=20260903-2', {
      headers: { 'If-None-Match': '"lab-runtime"' },
    }), routerEnv() as never, ctx)
    expect(resp.status).toBe(304)
    expect(await resp.text()).toBe('')
  })

  it('keeps every library script executable under the production CSP', async () => {
    const source = readFileSync(new URL('../public/lab/library_2/index.html', import.meta.url), 'utf8')
    const scripts = [...source.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)]
    expect(scripts.length).toBeGreaterThan(0)
    expect(scripts.every(([, attributes, body]) => /\bsrc=/i.test(attributes) && body.trim() === '')).toBe(true)
    expect(source).toMatch(/src="app\.js\?v=[\w-]+"/)

    const resp = await worker.fetch(new Request('https://tinct.app/library'), routerEnv() as never, ctx)
    const csp = resp.headers.get('Content-Security-Policy') || ''
    const scriptDirective = csp.split(';').find(directive => directive.trim().startsWith('script-src')) || ''
    expect(scriptDirective).toContain("script-src 'self'")
    expect(scriptDirective).not.toContain("'unsafe-inline'")
  })

  it.each(['/read', '/read/'])('serves the crawlable hub directly at %s instead of redirecting or falling back', async (pathname) => {
    const resp = await worker.fetch(new Request(`https://tinct.app${pathname}`), routerEnv() as never, ctx)
    expect(resp.status).toBe(200)
    expect(resp.headers.get('Location')).toBeNull()
    expect(resp.headers.get('Cache-Control')).toBe('public, max-age=300, must-revalidate')
    expect(await resp.text()).toContain('/read/odyssey/summary')
  })

  it.each(['/odyssey', '/odyssey/'])('sends bare book URL %s to that book in the current library', async (pathname) => {
    const resp = await worker.fetch(new Request(`https://tinct.app${pathname}`), routerEnv() as never, ctx)
    expect(resp.status).toBe(302)
    expect(resp.headers.get('Location')).toBe('/library?book=odyssey&view=book-detail')
  })

  it.each(['/notes', '/notes/'])('opens the normal Notes cover with the explicit post-author-note start from %s', async (pathname) => {
    const resp = await worker.fetch(new Request(`https://tinct.app${pathname}`), routerEnv() as never, ctx)
    expect(resp.status).toBe(302)
    expect(resp.headers.get('Location')).toBe('/library?book=notes-from-underground&start=1.2&edition=modern-en&compare=original-en&direct=reader')
    expect(resp.headers.get('Cache-Control')).toBe('no-store')
  })

  it('does not serve the legacy app shell for a bare book URL', async () => {
    const resp = await worker.fetch(new Request('https://tinct.app/odyssey'), routerEnv() as never, ctx)
    expect(await resp.text()).not.toContain('app shell')
  })

  it('returns the branded 404 page for an unknown bare book URL', async () => {
    const resp = await worker.fetch(new Request('https://tinct.app/not-a-real-book'), routerEnv() as never, ctx)
    expect(resp.status).toBe(404)
    expect(resp.headers.get('Content-Type')).toContain('text/html')
    expect(resp.headers.get('X-Robots-Tag')).toContain('noindex')
    const html = await resp.text()
    expect(html).toContain('Browse the library')
    expect(html).not.toContain('app shell')
  })

  it('returns the branded 404 page for unknown /read/{bookId} routes', async () => {
    const resp = await worker.fetch(new Request('https://tinct.app/read/seo-audit-missing-book'), routerEnv() as never, ctx)
    expect(resp.status).toBe(404)
    expect(resp.headers.get('Content-Type')).toContain('text/html')
    expect(resp.headers.get('X-Robots-Tag')).toContain('noindex')
    expect(await resp.text()).toContain('Browse the library')
  })

  it('falls back to an inline branded 404 when /404.html is missing from the build', async () => {
    const env = {
      ASSETS: {
        fetch: async () => new Response('Not found', { status: 404, headers: { 'Content-Type': 'text/plain' } }),
      },
    }
    const resp = await worker.fetch(new Request('https://tinct.app/this-does-not-exist'), env as never, ctx)
    expect(resp.status).toBe(404)
    expect(resp.headers.get('Content-Type')).toContain('text/html')
    const html = await resp.text()
    expect(html).toContain('Tinct')
    expect(html).toContain('/library')
  })

  it('keeps missing files as plain 404s rather than serving an HTML page', async () => {
    const resp = await worker.fetch(new Request('https://tinct.app/missing-image.png'), routerEnv() as never, ctx)
    expect(resp.status).toBe(404)
    expect(resp.headers.get('Content-Type')).toContain('text/plain')
  })

  it('returns no body for a HEAD request to an unknown path', async () => {
    const resp = await worker.fetch(new Request('https://tinct.app/this-does-not-exist', { method: 'HEAD' }), routerEnv() as never, ctx)
    expect(resp.status).toBe(404)
    expect(await resp.text()).toBe('')
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
    expect(fromApp.status).toBe(302)
    expect(fromApp.headers.get('Location')).toBe('/library?book=odyssey&view=book-detail')

    const signedIn = await worker.fetch(new Request('https://tinct.app/read/odyssey', {
      headers: { Cookie: 'tinct_auth=1' },
    }), env as never, ctx)
    expect(signedIn.status).toBe(302)
    expect(signedIn.headers.get('Location')).toBe('/library?book=odyssey&view=book-detail')
  })

  it('opens the live reader on the named chapter and edition from a legacy /read/{book}?chapter= link', async () => {
    const resp = await worker.fetch(new Request('https://tinct.app/read/odyssey?chapter=4&edition=modern-en&compare=original-en&split=1'), routerEnv() as never, ctx)
    expect(resp.status).toBe(302)
    expect(resp.headers.get('Location')).toBe('/reader?book=odyssey&edition=modern-en&chapter=4')
    const noEdition = await worker.fetch(new Request('https://tinct.app/read/odyssey?chapter=2'), routerEnv() as never, ctx)
    expect(noEdition.headers.get('Location')).toBe('/reader?book=odyssey&chapter=2')
    const bad = await worker.fetch(new Request('https://tinct.app/read/odyssey?chapter=x'), routerEnv() as never, ctx)
    expect(bad.headers.get('Location')).toBe('/library?book=odyssey&view=book-detail')
  })

  it('serves /reader?book=&edition=&chapter= as the reader without redirecting', async () => {
    const resp = await worker.fetch(new Request('https://tinct.app/reader?book=odyssey&edition=modern-en&chapter=4'), routerEnv() as never, ctx)
    expect(resp.status).toBe(200)
  })

  it('serves the reader as a noindex surface', async () => {
    const reader = await worker.fetch(new Request('https://tinct.app/reader?layout=phone'), routerEnv() as never, ctx)
    expect(reader.status).toBe(200)
    expect(reader.headers.get('X-Robots-Tag')).toContain('noindex')
    expect(reader.headers.get('Cache-Control')).toBe('no-store')
    const html = await reader.text()
    expect(html).toContain('name="robots"')
    expect(html).toContain('noindex')

    const head = await worker.fetch(new Request('https://tinct.app/reader', { method: 'HEAD' }), routerEnv() as never, ctx)
    expect(head.headers.get('X-Robots-Tag')).toContain('noindex')
    expect(await head.text()).toBe('')
  })

  it.each(['GET', 'HEAD'])('serves the promoted homepage without noindex (%s)', async method => {
    const response = await worker.fetch(new Request('https://tinct.app/', { method }), routerEnv() as never, ctx)
    expect(response.status).toBe(200)
    expect(response.headers.get('X-Robots-Tag')).toBeNull()
    expect(response.headers.get('Cache-Control')).toBe('no-store')
    const body = await response.text()
    if (method === 'HEAD') expect(body).toBe('')
    else {
      expect(body).toContain('approved cinematic library')
      expect(body).not.toContain('noindex')
      expect(body).toContain('href="https://tinct.app/"')
      expect(body).toContain('<meta property="og:image" content="https://tinct.app/brand/20260921/share-tinct-1200x630.jpg">')
      expect(body).toContain('<meta name="twitter:image" content="https://tinct.app/brand/20260921/share-tinct-1200x630.jpg">')
      expect(body).toContain('<meta property="og:description" content="Read great books with parallel editions, audiobooks and a voice companion. Explore the Tinct library and start reading.">')
    }
  })

  it.each([
    ['/lab/reader?chrome=v2&book=bible&chapter=3&voiceTrial=full', '/reader?book=bible&chapter=3', 308],
    ['/app?signin=1', '/sign-in', 302],
    ['/lab/library?chrome=v2', '/library', 308],
    ['/app?book=ulysses', '/library?book=ulysses&view=book-detail', 302],
  ])('preserves public navigation intent from %s', async (path, target, status) => {
    const response = await worker.fetch(new Request('https://tinct.app' + path), routerEnv() as never, ctx)
    expect(response.status).toBe(status)
    expect(response.headers.get('Location')).toBe(target)
  })

  it.each(['/reader', '/reader/', '/library', '/library/'])('serves clean public route %s without redirecting to lab', async (path) => {
    const response = await worker.fetch(new Request('https://tinct.app' + path), routerEnv() as never, ctx)
    expect(response.status).toBe(200)
    expect(response.headers.get('Location')).toBeNull()
    expect(response.headers.get('X-Robots-Tag')).toContain('noindex')
  })

  it.each(['/library', '/reader', '/reader?layout=phone'])('permits only the Omarchy palette endpoint on %s', async (path) => {
    const resp = await worker.fetch(new Request(`https://tinct.app${path}`), routerEnv() as never, ctx)
    expect(resp.status).toBe(200)
    const policy = resp.headers.get('Content-Security-Policy') || ''
    const connect = policy.split(';').find(directive => directive.trim().startsWith('connect-src')) || ''
    const localSources = connect.split(/\s+/).filter(source => source.startsWith('http:') || source.includes('localhost') || source.includes('127.0.0.1'))
    expect(localSources).toEqual(['http://127.0.0.1:47653/theme'])
    expect(connect).not.toContain('*')
    expect(policy).toContain("script-src 'self';")
    expect(policy).toContain("frame-ancestors 'self'")
  })

  it('opens the promoted library from /app', async () => {
    const resp = await worker.fetch(new Request('https://tinct.app/app'), routerEnv() as never, ctx)
    expect(resp.status).toBe(302)
    expect(resp.headers.get('Location')).toBe('/library')
  })

  it('serves unknown paths as a branded 404, not the legacy app shell', async () => {
    const resp = await worker.fetch(new Request('https://tinct.app/some-deep-app-state'), routerEnv() as never, ctx)
    expect(resp.status).toBe(404)
    expect(resp.headers.get('X-Robots-Tag')).toContain('noindex')
    const html = await resp.text()
    expect(html).toContain('Browse the library')
    expect(html).not.toContain('app shell')
    const csp = resp.headers.get('Content-Security-Policy') || ''
    expect(csp).toContain('wss://api.x.ai')
    expect(csp).not.toContain('api.openai.com')
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

describe('approved brand entry metadata', () => {
  it.each(['/','/library','/reader'])('serves install assets and one social image in initial HTML at %s', async path => {
    const response=await worker.fetch(new Request('https://tinct.app'+path),routerEnv() as never,ctx)
    const html=await response.text()
    expect(html).toContain('href="/brand/20260921/apple-touch-icon.png"')
    expect(html).toContain('href="/brand/manifest.webmanifest"')
    expect(html.match(/property="og:image"/g)).toHaveLength(1)
    expect(html).toContain('property="og:image:alt"')
  })
  it('uses the requested public book for a library link without exposing private query text', async () => {
    const response=await worker.fetch(new Request('https://tinct.app/library?book=frankenstein&note=private-secret'),routerEnv() as never,ctx)
    const html=await response.text()
    expect(html).toContain('/brand/20260921/books/frankenstein.jpg')
    expect(html).toContain('Frankenstein')
    expect(html).not.toContain('private-secret')
  })
})

describe('temporary edition direct links', () => {
  it('explains holds before serving cached pages and retains exact recovery coordinates', async () => {
    // Only the withdrawn Danish editions remain held; no whole book is held.
    for (const path of ['/read/macbeth/chapter-8?edition=modern-da', '/read/jerusalem?edition=modern-da&chapter=6&paragraph=59&word=2', '/library?book=faust-part-1&edition=modern-da', '/jerusalem?edition=modern-da']) {
      const response = await handleSeoAndStaticRequest(new Request('https://tinct.app' + path), routerEnv(), { waitUntil() {} } as unknown as ExecutionContext)
      expect(response.status).toBe(200)
      expect(response.headers.get('Cache-Control')).toBe('no-store')
      expect(response.headers.get('X-Robots-Tag')).toContain('noindex')
      const html = await response.text()
      expect(html).toContain('Temporarily unavailable')
      expect(html).toContain('heldBook=')
      expect(html).toContain('saved')
      if (path.includes('chapter-8')) expect(html).toContain('chapter=8')
      if (path.includes('paragraph=59')) {
        expect(html).toContain('heldEdition=modern-da')
        expect(html).toContain('paragraph=59')
        expect(html).toContain('word=2')
      }
    }
  })
  it('does not intercept sound edition links or the recovery reader', async () => {
    for (const path of ['/reader?heldBook=macbeth&heldEdition=modern-da', '/read/jerusalem?edition=original-en', '/read/jerusalem?edition=modern-en', '/read/faust-part-1?edition=original-de', '/read/faust-part-1', '/faust-part-1', '/read/macbeth', '/as-you-like-it', '/?book=macbeth']) {
      const response = await handleSeoAndStaticRequest(new Request('https://tinct.app' + path), routerEnv(), { waitUntil() {} } as unknown as ExecutionContext)
      expect(await response.text()).not.toContain('<h2>Temporarily unavailable</h2>')
    }
  })
})

it('never labels a retained English static excerpt as Faust original German', async () => {
  const response = await handleSeoAndStaticRequest(new Request('https://tinct.app/read/faust-part-1/chapter-1?edition=original-de'), routerEnv(), { waitUntil() {} } as unknown as ExecutionContext)
  expect(response.status).toBe(302)
  expect(response.headers.get('Location')).toContain('edition=original-de')
  expect(response.headers.get('Location')).toContain('/library?')
})

it('retains one-based library start links when opening held-edition recovery', async () => {
  const response = await handleSeoAndStaticRequest(new Request('https://tinct.app/library?book=macbeth&edition=modern-da&start=8.3'), routerEnv(), { waitUntil() {} } as unknown as ExecutionContext)
  const html = await response.text()
  expect(html).toContain('chapter=8')
  expect(html).toContain('paragraph=2')
  expect(html).toContain('heldEdition=modern-da')
})

it('no longer hides Read next cards for Macbeth, whose repaired English editions are released', () => {
  // No whole book is held now, so the filter leaves every card and editorial text alone.
  const released = '<a href="/read/macbeth/summary" class="guide-card"><div>Macbeth</div></a>'
  const sound = '<a href="/read/hamlet/summary" class="guide-card"><div>Hamlet</div></a>'
  const editorial = '<p>Macbeth is mentioned here.</p>'
  expect(filterHeldDiscoveryCards(released + sound + editorial)).toBe(released + sound + editorial)
})

it('routes Faust recommendation cards through the labelled German book landing', () => {
  const card = '<a href="/read/faust-part-1/summary" class="guide-card"><div>Faust</div></a>'
  expect(filterHeldDiscoveryCards(card)).toBe('<a href="/read/faust-part-1" class="guide-card"><div>Faust</div></a>')
})

 it.each(['/','/index.html','/library','/library/'])('serves the cinematic library at %s',async path=>{
 const result=await worker.fetch(new Request('https://tinct.app'+path),routerEnv() as never,ctx)
 expect(await result.text()).toContain('approved cinematic library')
 expect(result.headers.get('Cache-Control')).toBe('no-store')
 })
