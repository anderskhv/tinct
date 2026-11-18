/**
 * /terms is published on its own (Anders, 2026-10-08): served like /privacy
 * and linked wherever /privacy is linked, whether the AI allowance switch
 * (src/aiAllowanceSwitch.ts) is off or on. The shipped value is pinned off in
 * worker/lib/aiAllowance.test.ts; here a copy is flipped to test both states.
 */
import { readFileSync } from 'node:fs'
import { afterEach, describe, expect, it, vi } from 'vitest'

const switchState = vi.hoisted(() => ({ on: false }))
vi.mock('./aiAllowanceSwitch', () => ({ get AI_ALLOWANCE_ENFORCED() { return switchState.on } }))

import { handleSeoAndStaticRequest } from './worker/routes/seo'

const PAGES: Record<string, string> = {
  '/about': 'public/about.html',
  '/credits': 'public/credits.html',
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

describe.each([false, true])('/terms with the AI allowance switch %s', on => {
  it('is served like /privacy: same short public cache, same security headers and CSP', async () => {
    switchState.on = on
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

  it('is linked once from the /about, /credits and /privacy footers, next to Privacy', async () => {
    switchState.on = on
    const about = await (await get('/about')).text()
    expect(footer(about)).toContain('<a href="/privacy">Privacy</a><a href="/terms">Terms</a><a href="mailto:contact@tinct.app">')
    const credits = await (await get('/credits')).text()
    expect(footer(credits)).toContain('<a href="/privacy">Privacy</a><a href="/terms">Terms</a><a href="mailto:contact@tinct.app">')
    const privacy = await (await get('/privacy')).text()
    expect(footer(privacy)).toMatch(/<a href="\/about">About<\/a>\s*<a href="\/terms">Terms<\/a>\s*<a href="mailto:contact@tinct\.app">Contact<\/a>/)
    for (const html of [about, credits, privacy]) expect(html.match(/href="\/terms"/g)).toHaveLength(1)
  })
})

describe('/terms links in the shipped files', () => {
  it('about, credits and privacy carry the Terms link in the files themselves, not added at request time', () => {
    for (const file of ['public/about.html', 'public/credits.html', 'public/privacy.html']) {
      expect(footer(readFileSync(file, 'utf8')), file).toContain('href="/terms"')
    }
  })
})
