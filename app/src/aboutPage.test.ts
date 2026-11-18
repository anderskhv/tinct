import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { handleSeoAndStaticRequest } from './worker/routes/seo'

const require = createRequire(import.meta.url)
const { build, buildCredits } = require('../scripts/build-about-page.cjs') as { build: () => string; buildCredits: () => string }
const manifest = JSON.parse(readFileSync('public/lab/library_2/author-images.json', 'utf8')) as { images: Array<{ authorName: string; sourcePage: string }> }

describe('/about', () => {
  it('is the committed output of build-about-page.cjs', () => {
    expect(readFileSync('public/about.html', 'utf8')).toBe(build())
  })

  it('has no team section and links to the credits instead of holding them', () => {
    const html = build()
    expect(html).not.toContain('Our team')
    expect(html).not.toContain('<h2>Credits</h2>')
    expect(html).not.toContain(manifest.images[0].sourcePage.replace(/&/g, '&amp;'))
    expect(html).toContain('<p class="footer"><a href="/library">Library</a><a href="/credits">Credits</a><a href="/privacy">Privacy</a>')
  })

  it('lists audiobooks and adding any book under Premium only', () => {
    const html = build()
    expect(html).toContain('<tr><td>AI chat, Talk, chapter recaps and audiobooks</td><td class="c">–</td><td class="c">✓</td></tr>')
    expect(html).toContain('<tr><td>Add any book: your own or from Gutenberg and other free libraries</td><td class="c">–</td><td class="c">✓</td></tr>')
  })

  it('is self-canonical and indexable, with one h1', () => {
    const html = build()
    expect(html).toContain('<link rel="canonical" href="https://tinct.app/about">')
    expect(html).not.toMatch(/name="robots"/)
    expect(html.match(/<h1\b/g)).toHaveLength(1)
  })
})

describe('/credits', () => {
  it('is the committed output of build-about-page.cjs', () => {
    expect(readFileSync('public/credits.html', 'utf8')).toBe(buildCredits())
  })

  it('credits every author portrait the library uses', () => {
    const html = buildCredits()
    for (const image of manifest.images) {
      expect(html, image.authorName).toContain(image.sourcePage.replace(/&/g, '&amp;'))
    }
  })

  it('is self-canonical and indexable, with one h1, and shares the /about page style', () => {
    const html = buildCredits()
    expect(html).toContain('<link rel="canonical" href="https://tinct.app/credits">')
    expect(html).toContain('<meta property="og:url" content="https://tinct.app/credits">')
    expect(html).not.toMatch(/name="robots"/)
    expect(html.match(/<h1\b/g)).toHaveLength(1)
    const style = (page: string) => page.slice(page.indexOf('<style>'), page.indexOf('</style>'))
    expect(style(html)).toBe(style(build()))
    expect(html).toContain('<a href="/about">About</a>')
  })

  it('is in the sitemap next to /about', () => {
    const sitemap = readFileSync('public/sitemap.xml', 'utf8')
    expect(sitemap).toContain('<loc>https://tinct.app/credits</loc>')
  })

  it('is served by the Worker exactly like /about: same status, cache and security headers', async () => {
    const files: Record<string, string> = { '/about': 'public/about.html', '/credits': 'public/credits.html' }
    const env = {
      ASSETS: {
        fetch: async (request: Request) => {
          const file = files[new URL(request.url).pathname.replace(/\/$/, '')]
          return file
            ? new Response(readFileSync(file, 'utf8'), { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } })
            : new Response('nf', { status: 404 })
        },
      },
    }
    const ctx = { waitUntil: () => {} } as unknown as ExecutionContext
    const get = (pathname: string) => handleSeoAndStaticRequest(new Request(`https://tinct.app${pathname}`), env as never, ctx)
    const [about, credits] = await Promise.all([get('/about'), get('/credits')])
    expect(credits.status).toBe(200)
    expect(credits.headers.get('Cache-Control')).toBe('public, max-age=300, stale-while-revalidate=86400')
    for (const header of ['Cache-Control', 'Content-Type', 'Content-Security-Policy', 'X-Content-Type-Options', 'X-Frame-Options', 'Referrer-Policy', 'Strict-Transport-Security']) {
      expect(credits.headers.get(header), header).toBe(about.headers.get(header))
    }
    expect(await credits.text()).toContain('<h2>Credits</h2>')
  })
})
