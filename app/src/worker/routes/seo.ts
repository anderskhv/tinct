import { GENERATED_BOOK_META, type BookMetaEntry } from '../../data/bookMetaGenerated'
import { htmlEscape } from '../lib/html'

export type SeoEnv = {
  INDEXNOW_KEY?: string
  ASSETS: { fetch: (request: Request) => Promise<Response> }
}

const INDEXNOW_KEY_RE = /^[A-Za-z0-9-]{8,128}$/

// ===== Security Headers =====

// X-Frame-Options is SAMEORIGIN (was DENY) so the landing page can embed the
// SPA in an iframe for the live product demo. Same-origin only — third-party
// sites still can't frame us. CSP `frame-src` and `frame-ancestors` are
// also relaxed to 'self' for the same reason.
const SECURITY_HEADERS: Record<string, string> = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'SAMEORIGIN',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; font-src 'self'; connect-src 'self' https://yazjyiqsxjystvpkyouk.supabase.co wss://yazjyiqsxjystvpkyouk.supabase.co https://api.stripe.com; img-src 'self' data:; media-src 'self'; frame-src 'self' https://js.stripe.com; frame-ancestors 'self'",
}

// ===== Bot UA Blocklist (KV-free first line of defence) =====

// Returns 403 to known training/scraper bots BEFORE any KV touch. Many of
// these ignore robots.txt; they were the dominant source of overnight KV
// writes (Anders hit 50% of free-tier daily quota at night with zero real
// users). Per-IP rate-limiting amplified the cost since rotating-IP bots
// each minted a fresh KV entry. A simple UA reject costs zero KV ops.
const BLOCKED_BOT_UA_FRAGMENTS = [
  'CCBot', 'Omgilibot', 'FacebookBot', 'meta-externalagent',
  'Bytespider', 'Amazonbot', 'DataForSeoBot', 'AhrefsBot', 'SemrushBot',
  'MJ12bot', 'DotBot', 'PetalBot', 'YandexBot', 'Applebot-Extended',
  'cohere-ai', 'Diffbot', 'ImagesiftBot', 'TurnitinBot', 'magpie-crawler',
]
export function isBlockedBot(request: Request): boolean {
  const ua = request.headers.get('user-agent') || ''
  if (!ua) return false
  for (const fragment of BLOCKED_BOT_UA_FRAGMENTS) {
    if (ua.includes(fragment)) return true
  }
  return false
}

// Per-book SEO meta tags injected into the SPA shell at /read/{bookId} so that
// crawlers see a book-specific title and description instead of the generic
// SPA title. Only listed bookIds get this treatment; everything else falls
// through to the SPA shell with its default title.
const BOOK_META: Record<string, BookMetaEntry & { image?: string }> = {
  odyssey: {
    title: 'Read The Odyssey Online — Modern Translation, AI Companion, Audiobook | Tinct',
    description: "Read Homer's Odyssey free online. Authoritative English translation paragraph-aligned with a modern English version, modern Danish also available. Includes a context-aware AI companion, spoiler-aware character tracker, and synced audiobook. No account needed to start.",
    bookName: 'The Odyssey',
    author: 'Homer',
  },
}

const PUBLIC_BOOK_IDS = new Set([...Object.keys(GENERATED_BOOK_META), ...Object.keys(BOOK_META)])

async function serveSpaWithMeta(
  requestMethod: string,
  url: URL,
  env: SeoEnv,
  meta: BookMetaEntry & { image?: string },
  canonical: string,
  ogType: string,
): Promise<Response | null> {
  const appResp = await env.ASSETS.fetch(new Request(`${url.origin}/app.html`))
  if (!appResp.ok) return null

  const html = await appResp.text()
  const ogImage = meta.image || 'https://tinct.app/og-image.png'
  const safeTitle = htmlEscape(meta.title)
  const safeDescription = htmlEscape(meta.description)
  const safeCanonical = htmlEscape(canonical)
  const safeOgType = htmlEscape(ogType)
  const safeOgImage = htmlEscape(ogImage)
  const injected = `<title>${safeTitle}</title>
  <meta name="description" content="${safeDescription}">
  <link rel="canonical" href="${safeCanonical}">
  <meta property="og:title" content="${safeTitle}">
  <meta property="og:description" content="${safeDescription}">
  <meta property="og:url" content="${safeCanonical}">
  <meta property="og:type" content="${safeOgType}">
  <meta property="og:site_name" content="Tinct">
  <meta property="og:image" content="${safeOgImage}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${safeTitle}">
  <meta name="twitter:description" content="${safeDescription}">
  <meta name="twitter:image" content="${safeOgImage}">`
  const bookJsonLd = ogType === 'book'
    ? `\n  <script type="application/ld+json">${JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Book',
        '@id': `${canonical}#book`,
        name: meta.bookName,
        author: { '@type': 'Person', name: meta.author },
        description: meta.description,
        url: canonical,
        image: ogImage,
        inLanguage: 'en',
        isAccessibleForFree: true,
        isPartOf: { '@type': 'WebSite', name: 'Tinct', url: 'https://tinct.app' },
        publisher: { '@type': 'Organization', name: 'Tinct', url: 'https://tinct.app' },
      })}</script>`
    : ''
  const rewritten = html.replace(/<title>[^<]*<\/title>/, `${injected}${bookJsonLd}`)
  const newResp = new Response(requestMethod === 'HEAD' ? null : rewritten, {
    status: 200,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })
  newResp.headers.set('Cache-Control', 'no-store')
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    newResp.headers.set(key, value)
  }
  return newResp
}

export const serveSpaWithMetaForTest = serveSpaWithMeta

async function serveStaticHtml(
  requestMethod: string,
  request: Request,
  url: URL,
  pathname: string,
  env: SeoEnv,
): Promise<Response | null> {
  const assetUrl = new URL(url.toString())
  assetUrl.pathname = pathname
  assetUrl.search = ''
  const assetResp = await env.ASSETS.fetch(new Request(assetUrl.toString(), request))
  if (assetResp.status !== 200) return null

  const newResp = new Response(requestMethod === 'HEAD' ? null : assetResp.body, assetResp)
  newResp.headers.set('Cache-Control', 'public, max-age=300, must-revalidate')
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    newResp.headers.set(key, value)
  }
  return newResp
}

function editionBookIdFromPath(pathname: string): string | null {
  const filename = pathname.split('/').pop() || ''
  if (!filename.endsWith('.json')) return null
  const stem = filename.slice(0, -'.json'.length)
  const matches = [...PUBLIC_BOOK_IDS]
    .filter(bookId => stem.startsWith(`${bookId}-`))
    .sort((a, b) => b.length - a.length)
  return matches[0] || null
}


export function handleIndexNowVerification(request: Request, env: SeoEnv): Response | null {
  const url = new URL(request.url)
  if ((request.method === 'GET' || request.method === 'HEAD') && env.INDEXNOW_KEY && INDEXNOW_KEY_RE.test(env.INDEXNOW_KEY)) {
    const keyPath = `/${env.INDEXNOW_KEY}.txt`
    if (url.pathname === keyPath) {
      return new Response(request.method === 'HEAD' ? null : env.INDEXNOW_KEY, {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Cache-Control': 'public, max-age=3600',
          ...SECURITY_HEADERS,
        },
      })
    }
  }
  return null
}

export async function handleSeoAndStaticRequest(request: Request, env: SeoEnv, ctx: ExecutionContext): Promise<Response> {
  const url = new URL(request.url)
    // Static JSON content (editions, onboarding, threads) — serve via the
    // Cloudflare Cache API so repeat hits don't re-execute the worker.
    //
    // Do not send wildcard CORS here. The app reads this data same-origin, so
    // CORS is unnecessary; allowing every origin only makes it easier for
    // third-party sites to build directly against Tinct's JSON endpoints.
    // This is not DRM (curl can still fetch public app assets), but it removes
    // the casual browser-embed path while preserving the reader and SEO build.
    if ((request.method === 'GET' || request.method === 'HEAD') && url.pathname.startsWith('/data/') && url.pathname.endsWith('.json')) {
      const secFetchSite = request.headers.get('sec-fetch-site')
      if (secFetchSite === 'cross-site') {
        return new Response('Forbidden', {
          status: 403,
          headers: {
            'Cache-Control': 'no-store',
            'Content-Type': 'text/plain; charset=utf-8',
            'X-Robots-Tag': 'noindex, noarchive',
          },
        })
      }

      if (url.pathname.startsWith('/data/editions/') && !editionBookIdFromPath(url.pathname)) {
        return new Response(request.method === 'HEAD' ? null : 'Not found', {
          status: 404,
          headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'Cache-Control': 'no-store',
            'X-Robots-Tag': 'noindex, noarchive',
          },
        })
      }

      // Onboarding JSONs do change as we iterate on book content. Edition
      // JSONs are stable once published. Differentiate the cache TTL so
      // onboarding updates land within minutes instead of being stuck behind
      // a 30-day immutable header (Anders, 2026-04-29 — old content was
      // served for hours after a deploy).
      const isOnboarding = url.pathname.startsWith('/data/onboarding/')
      const cache = caches.default
      const cacheKeyUrl = new URL(url.toString())
      cacheKeyUrl.searchParams.set('__tinct_json_cache', '2')
      const cacheKey = new Request(cacheKeyUrl.toString(), { method: 'GET' })
      if (request.method === 'GET') {
        const cached = await cache.match(cacheKey)
        if (cached) {
          const fixed = new Response(cached.body, cached)
          fixed.headers.delete('Access-Control-Allow-Origin')
          fixed.headers.set('X-Robots-Tag', 'noindex, noarchive')
          return fixed
        }
      }

      const assetResp = await env.ASSETS.fetch(request)
      const contentType = assetResp.headers.get('content-type') || ''
      if (assetResp.ok && contentType.includes('application/json')) {
        const cacheable = new Response(assetResp.body, assetResp)
        if (isOnboarding) {
          // 5 minutes at the edge; revalidate after that. Onboarding content
          // can be tweaked frequently and we want updates visible quickly.
          cacheable.headers.set('Cache-Control', 'public, max-age=300, must-revalidate')
        } else {
          // 30 days for editions/threads — these almost never change after
          // publish. SW + content-hashing handle invalidation on the client.
          cacheable.headers.set('Cache-Control', 'public, max-age=2592000, immutable')
        }
        cacheable.headers.delete('Access-Control-Allow-Origin')
        cacheable.headers.set('X-Robots-Tag', 'noindex, noarchive')
        if (request.method === 'GET') ctx.waitUntil(cache.put(cacheKey, cacheable.clone()))
        return cacheable
      }
      return new Response(request.method === 'HEAD' ? null : 'Not found', {
        status: 404,
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Cache-Control': 'no-store',
          'X-Robots-Tag': 'noindex, noarchive',
        },
      })
    }

    // Root URL serves the landing page (which is index.html after build swap).
    // SPA is available at /app.html and /app. Plain /read is now the static
    // crawlable library hub, so signed-in app traffic must not redirect there.
    //
    // Signed-in short-circuit: if the client has a `tinct_auth=1` cookie
      // (set by the SPA in useAuth on sign-in, cleared on sign-out), 302 to
      // /app before serving landing.html. This is deterministic across
    // browsers/devices and far more reliable than the inline-script
    // localStorage probe in landing.html. That inline script remains as a
    // fallback for cookie-disabled browsers.
    if (url.pathname === '/' && request.method === 'GET') {
      const cookie = request.headers.get('Cookie') || request.headers.get('cookie') || ''
      const hasAuthCookie = /(?:^|;\s*)tinct_auth=1(?:;|$)/.test(cookie)
      if (hasAuthCookie) {
        return new Response(null, {
          status: 302,
          headers: { Location: '/app', 'Cache-Control': 'no-store' },
        })
      }
      // For signed-out users, serve landing.html but mark it no-store so the
      // Cloudflare edge doesn't cache the Worker's response. Without this,
      // CF caches the first (no-cookie) response and subsequent requests —
      // even with the auth cookie — are served from edge without re-running
      // the Worker, which silently breaks the signed-in redirect.
      const resp = await env.ASSETS.fetch(request)
      const newResp = new Response(resp.body, resp)
      newResp.headers.set('Cache-Control', 'no-store')
      for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
        newResp.headers.set(key, value)
      }
      return newResp
    }

    // Private admin SPA routes. The UI still enforces access through
    // Supabase RLS, but the route itself must not be indexable.
    if ((request.method === 'GET' || request.method === 'HEAD') && url.pathname === '/admin/metrics') {
      const appResp = await env.ASSETS.fetch(new Request(`${url.origin}/app.html`))
      if (appResp.ok) {
        const newResp = new Response(request.method === 'HEAD' ? null : appResp.body, appResp)
        newResp.headers.set('Cache-Control', 'no-store')
        newResp.headers.set('X-Robots-Tag', 'noindex, noarchive')
        for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
          newResp.headers.set(key, value)
        }
        return newResp
      }
    }

    // Back-compat for old app entry links. Plain /read is the public SEO hub,
    // but query-bearing /read URLs are app intents such as ?signin=1 or
    // ?view=library. Signed-in humans also expect /read to open the app, while
    // crawlers and signed-out visitors can still receive the static hub.
    if ((request.method === 'GET' || request.method === 'HEAD') && url.pathname === '/read') {
      const cookie = request.headers.get('Cookie') || request.headers.get('cookie') || ''
      const hasAuthCookie = /(?:^|;\s*)tinct_auth=1(?:;|$)/.test(cookie)
      if (url.search || hasAuthCookie) {
        const appUrl = new URL(url.toString())
        appUrl.pathname = '/app'
        return new Response(null, {
          status: 302,
          headers: { Location: `${appUrl.pathname}${appUrl.search}`, 'Cache-Control': 'no-store' },
        })
      }
    }

    // SEO page clean-URL routing.
    // Per-book pages live as static HTML at /read/{bookId}/(summary|chapters|cast|themes|chapter-N).html.
    // We want clean URLs without .html for crawlers + sharing — but Cloudflare's
    // static asset binding has not_found_handling: "none", so /read/odyssey/summary
    // would 404 here and fall through to the SPA. Rewrite to the .html file before
    // that happens. SEO_STRATEGY.md has the full routing table.
    const seoMatch = url.pathname.match(/^\/read\/([a-z0-9-]+)\/(summary|chapters|cast|themes|chapter-\d+)\/?$/i)
    if ((request.method === 'GET' || request.method === 'HEAD') && seoMatch) {
      const seoResp = await serveStaticHtml(request.method, request, url, `/read/${seoMatch[1]}/${seoMatch[2]}.html`, env)
      if (seoResp) return seoResp
      // SEO file not found — fall through to SPA fallback below
    }

    // Library route is in the sitemap, so serve the committed crawlable hub
    // rather than the SPA shell. This exposes internal book links to crawlers
    // while the app remains available at /read?view=library and deep links.
    if ((request.method === 'GET' || request.method === 'HEAD') && url.pathname === '/read') {
      const hubResp = await env.ASSETS.fetch(new Request(`${url.origin}/read/index.html`, request))
      if (hubResp.ok) {
        const newResp = new Response(request.method === 'HEAD' ? null : hubResp.body, hubResp)
        newResp.headers.set('Cache-Control', 'public, max-age=300, must-revalidate')
        for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
          newResp.headers.set(key, value)
        }
        return newResp
      }
    }

    // Per-book transactional SEO: inject book-specific meta tags into the SPA
    // shell for /read/{bookId} routes. The SPA still bootstraps for human
    // visitors (the body is unchanged), but crawlers see a book-specific
    // title + description + canonical URL — without which every book URL
    // shares the generic "Tinct — A New Way to Read" title and competes with
    // itself in search.
    const bookMatch = url.pathname.match(/^\/read\/([a-z0-9-]+)\/?$/i)
    if ((request.method === 'GET' || request.method === 'HEAD') && bookMatch) {
      const bookId = bookMatch[1].toLowerCase()
      if (!url.search) {
        const staticBookResp = await serveStaticHtml(request.method, request, url, `/read/${bookId}/book`, env)
        if (staticBookResp) return staticBookResp
      }
      // Manual BOOK_META wins (hand-tuned copy for marquee books); auto-
      // generated meta from bookRegistry is the fallback so every book in
      // the sitemap has unique <title>/<meta description> and we don't
      // hand Google many duplicate-content URLs.
      const meta = BOOK_META[bookId] || GENERATED_BOOK_META[bookId]
      if (meta) {
        const bookResp = await serveSpaWithMeta(request.method, url, env, meta, `https://tinct.app/read/${bookId}`, 'book')
        if (bookResp) return bookResp
      }
      return new Response(request.method === 'HEAD' ? null : 'Not found', {
        status: 404,
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Cache-Control': 'no-store',
          'X-Robots-Tag': 'noindex, noarchive',
        },
      })
    }

    // Bare /{bookId} URLs are legacy/shareable duplicates of /read/{bookId}.
    // Serve the SPA shell with canonical book metadata so crawlers consolidate
    // ranking signals on the /read/ URL instead of seeing a generic duplicate.
    const bareBookMatch = url.pathname.match(/^\/([a-z0-9-]+)\/?$/i)
    if ((request.method === 'GET' || request.method === 'HEAD') && bareBookMatch) {
      const bookId = bareBookMatch[1].toLowerCase()
      const meta = BOOK_META[bookId] || GENERATED_BOOK_META[bookId]
      if (meta) {
        const bookResp = await serveSpaWithMeta(request.method, url, env, meta, `https://tinct.app/read/${bookId}`, 'book')
        if (bookResp) return bookResp
      }
    }

    // Fall through to static assets
    const response = await env.ASSETS.fetch(request)

    // SPA fallback: if asset not found and it's not an /api/ path or an
    // /assets/ path, serve the React app.
    // CRITICAL: /assets/* must 404 cleanly, not fall through to the SPA.
    // After a deploy, Cloudflare deletes the old content-hashed bundle from
    // the assets binding. Without this exclusion, requests for the old URL
    // (e.g. index-kNGlBG-i.js) returned the SPA fallback HTML (200, ~920
    // bytes), Cloudflare's edge HIT-cached it, and any browser holding a
    // tab pointing to that old hash kept loading "valid" responses forever
    // — masking the deploy. With /assets/* now 404'ing, the browser sees
    // the failure and a fresh HTML reload picks up the new content-hashed
    // URL on next navigation.
    if (response.status === 404 && !url.pathname.startsWith('/api/') && !url.pathname.startsWith('/assets/')) {
      const spaResponse = await env.ASSETS.fetch(new Request(`${url.origin}/app.html`))
      const newResponse = new Response(spaResponse.body, spaResponse)
      newResponse.headers.set('Cache-Control', 'no-store')
      newResponse.headers.set('X-Robots-Tag', 'noindex, noarchive')
      for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
        newResponse.headers.set(key, value)
      }
      return newResponse
    }

    const contentType = response.headers.get('content-type') || ''
    if (contentType.includes('text/html')) {
      const newResponse = new Response(response.body, response)
      // HTML must never be edge-cached — see the SPA fallback comment above.
      newResponse.headers.set('Cache-Control', 'no-store')
      for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
        newResponse.headers.set(key, value)
      }
      return newResponse
    }
    return response

}
