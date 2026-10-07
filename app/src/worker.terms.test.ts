/**
 * /terms is published with the AI allowance (src/aiAllowanceSwitch.ts):
 * off, a 404 that nothing links to; on, served like /privacy and linked from
 * the /about and /privacy footers. The shipped value is pinned off in
 * worker/lib/aiAllowance.test.ts; here a copy is flipped to test both states.
 */
import { readFileSync } from 'node:fs'
import { afterEach, describe, expect, it, vi } from 'vitest'

const switchState = vi.hoisted(() => ({ on: false }))
vi.mock('./aiAllowanceSwitch', () => ({ get AI_ALLOWANCE_ENFORCED() { return switchState.on } }))

import { handleSeoAndStaticRequest, termsPublished, withTermsLink } from './worker/routes/seo'

const PAGES: Record<string, string> = {
  '/about': 'public/about.html',
  '/privacy': 'public/privacy.html',
  '/terms': 'public/terms.html',
  '/404.html': 'public/404.html',
}

function env() {
  const asked: string[] = []
  return {
    asked,
    ASSETS: {
      fetch: async (request: Request) => {
        const { pathname } = new URL(request.url)
        asked.push(pathname)
        const file = PAGES[pathname.replace(/\/$/, '')]
        return file
          ? new Response(readFileSync(file, 'utf8'), { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } })
          : new Response('nf', { status: 404 })
      },
    },
  }
}

const ctx = { waitUntil: () => {} } as unknown as ExecutionContext
const get = (pathname: string, target = env()) => handleSeoAndStaticRequest(new Request(`https://tinct.app${pathname}`), target as never, ctx)
const footer = (html: string) => html.slice(html.lastIndexOf('<footer') >= 0 ? html.lastIndexOf('<footer') : html.lastIndexOf('<p class="footer">'))

afterEach(() => { switchState.on = false })

describe('/terms while the AI allowance is off', () => {
  it.each(['/terms', '/terms/', '/terms.html'])('%s is a 404 and the file is never read', async pathname => {
    const target = env()
    const response = await get(pathname, target)
    expect(response.status).toBe(404)
    expect(await response.text()).not.toContain('Terms of Service')
    expect(target.asked.some(path => path.startsWith('/terms'))).toBe(false)
  })

  it('is linked from nowhere: /about and /privacy keep their footers', async () => {
    expect(termsPublished()).toBe(false)
    for (const pathname of ['/about', '/privacy']) {
      const html = await (await get(pathname)).text()
      expect(html).not.toContain('href="/terms"')
    }
    // Nor in the shipped files, the sitemap or Add a book.
    for (const file of ['public/about.html', 'public/privacy.html', 'public/story.html', 'public/sitemap.xml', 'public/lab/addbook/js/reader.js', 'public/lab/library_2/index.html']) {
      expect(readFileSync(file, 'utf8'), file).not.toMatch(/tinct\.app\/terms|href="\/terms/)
    }
  })
})

describe('/terms once the AI allowance is on', () => {
  it('is served like /privacy: same short public cache, same security headers and CSP', async () => {
    switchState.on = true
    const [privacy, terms] = await Promise.all([get('/privacy'), get('/terms')])
    expect(terms.status).toBe(200)
    expect(terms.headers.get('Location')).toBeNull()
    expect(terms.headers.get('Cache-Control')).toBe('public, max-age=300, stale-while-revalidate=86400')
    for (const header of ['Cache-Control', 'Content-Security-Policy', 'X-Content-Type-Options', 'X-Frame-Options', 'Referrer-Policy', 'Strict-Transport-Security']) {
      expect(terms.headers.get(header), header).toBe(privacy.headers.get(header))
    }
    const html = await terms.text()
    expect(html).toContain('<h1>Terms of Service</h1>')
    expect(html).toContain('id="section-4"')
  })

  it('is linked once from the /about and /privacy footers', async () => {
    switchState.on = true
    const about = await (await get('/about')).text()
    expect(footer(about)).toContain('<a href="/privacy">Privacy</a><a href="/terms">Terms</a><a href="mailto:contact@tinct.app">')
    const privacy = await (await get('/privacy')).text()
    expect(footer(privacy)).toMatch(/<a href="\/about">About<\/a>\s*<a href="\/terms">Terms<\/a>\s*<a href="mailto:contact@tinct\.app">Contact<\/a>/)
    for (const html of [about, privacy]) expect(html.match(/href="\/terms"/g)).toHaveLength(1)
  })
})

describe('withTermsLink', () => {
  it('finds the footers it edits in the shipped pages (a footer change must update it)', () => {
    for (const [pathname, file] of [['/about', 'public/about.html'], ['/privacy', 'public/privacy.html']]) {
      const html = readFileSync(file, 'utf8')
      expect(withTermsLink(html, pathname, true), file).not.toBe(html)
      expect(withTermsLink(html, pathname, false)).toBe(html)
    }
  })

  it('leaves other pages alone', () => {
    const html = '<a href="/privacy">Privacy</a><a href="mailto:contact@tinct.app">x</a>'
    expect(withTermsLink(html, '/story', true)).toBe(html)
  })
})
