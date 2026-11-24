// Synthetic account only; all API calls intercepted. Run by isolated GitHub acceptance.
//
// One-step sign-up (Anders, 24 Nov 2026): the "Your profile" and "How do you read?" steps are gone. A new
// reader who signs in from inside a book sees "Keep your place" naming the book, signs in with the email
// code, and lands straight back in the book; nothing is saved to the profile (the Worker makes it silently,
// Only me). An old /sign-in?mode=profile link shows no step. PROFILE_FLOW_ENGINE=chromium runs it in Chromium.
import { chromium, webkit } from '@playwright/test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import { markInternal } from './lib/internalTraffic.cjs'
import { checkLayout, DEFAULT_SELECTORS } from '../../docs/margin/layout-check.mjs'
const origin = 'https://tinct.app', output = 'artifacts/profile-flow'
await fs.mkdir(output, { recursive: true })
const engine = process.env.PROFILE_FLOW_ENGINE === 'chromium' ? chromium : webkit
const browser = await markInternal(await engine.launch({ headless: true }))
const user = { id: '00000000-0000-4000-8000-000000000001', email: 'synthetic@test.tinct.app', aud: 'authenticated', role: 'authenticated', created_at: '2026-11-24T10:00:00Z', last_sign_in_at: '2026-11-24T10:00:30Z', app_metadata: { provider: 'email', providers: ['email'] }, user_metadata: {} }
const sessionFor = reader => {
  const exp = Math.floor(Date.now() / 1000) + 3600
  const token = [Buffer.from('{"alg":"HS256","typ":"JWT"}').toString('base64url'), Buffer.from(JSON.stringify({ sub: reader.id, exp, role: 'authenticated' })).toString('base64url'), 'synthetic-only'].join('.')
  return { access_token: token, refresh_token: 'synthetic-refresh', token_type: 'bearer', expires_in: 3600, expires_at: exp, user: reader }
}
try {
  for (const [size, width, height] of [['phone', 390, 844], ['desktop', 1440, 1000]]) {
    const context = await browser.newContext({ viewport: { width, height }, serviceWorkers: 'block' })
    const page = await context.newPage(), posts = [], errors = []
    page.on('pageerror', error => errors.push(error.message))
    await page.addInitScript(() => {
      HTMLMediaElement.prototype.play = async function () { this.muted = true }
      // The reader leaves the book's title for the sheet as it opens it (lab/signInEntry.ts).
      if (location.pathname === '/sign-in' && !sessionStorage.getItem('tinct:sign-in-book')) sessionStorage.setItem('tinct:sign-in-book', JSON.stringify({ title: 'The Odyssey', at: Date.now() }))
    })
    let signedIn = false
    await page.route('**/*', async route => {
      const req = route.request(), url = new URL(req.url())
      if (url.hostname.endsWith('.supabase.co') && url.pathname.endsWith('/auth/v1/otp')) return route.fulfill({ json: {} })
      if (url.hostname.endsWith('.supabase.co') && url.pathname.endsWith('/auth/v1/verify')) { signedIn = true; return route.fulfill({ json: sessionFor(user) }) }
      if (url.hostname.endsWith('.supabase.co')) return route.fulfill({ json: signedIn ? user : null })
      if (url.origin !== origin) return route.abort()
      if (url.pathname.startsWith('/api/profile')) {
        if (req.method() === 'POST') posts.push(req.postDataJSON())
        return route.fulfill({ json: { enabled: true, available: true, profile: { handle: 'reader4780', name: 'Reader', visibility: 'only_me', setUp: false, socialEnabled: false } } })
      }
      if (url.pathname.startsWith('/api/') || req.method() !== 'GET') return route.abort()
      if (url.pathname === '/reader') return route.fulfill({ contentType: 'text/html', body: '<p data-auth-destination>Saved book destination</p>' })
      const relative = url.pathname === '/sign-in' ? '/lab/sign-in/index.html' : url.pathname
      const file = path.resolve('dist', '.' + relative)
      if (!file.startsWith(path.resolve('dist') + '/')) return route.abort()
      try {
        if (url.pathname === '/sign-in') return route.fulfill({ contentType: 'text/html', body: (await fs.readFile(file, 'utf8')).replace('</head>', '<meta name="tinct-social" content="1"></head>') })
        return route.fulfill({ path: file })
      } catch { return route.abort() }
    })
    await page.goto(origin + '/sign-in?returnTo=%2Freader%3Fbook%3Dodyssey&from=save_place')
    await page.waitForFunction(() => document.querySelector('#tinct-lab-sign-in')?.dataset.ready === 'true')
    assert.equal(await page.locator('[data-signin-title]').innerText(), 'Keep your place')
    assert.equal(await page.locator('[data-signin-copy]').innerText(), 'Pick up The Odyssey at this page on any device.')
    assert.equal(await page.locator('[data-signin-free]').innerText(), 'Reading is free. Your first month of Premium is free, no card.')
    const selectors = { ...DEFAULT_SELECTORS, card: '.auth-card', text: '.auth-card h1,.auth-copy,.auth-free,.auth-note,.auth-legal', tap: '[data-mode-copy=signin] button, [data-auth-submit], [data-oauth=google]', bar: null, menu: null, foot: null }
    assert.deepEqual(await checkLayout(page, { selectors }), [])
    await page.screenshot({ path: `${output}/${size}-sheet.png`, fullPage: true })
    await page.getByLabel('Email address').fill('synthetic@test.tinct.app')
    await page.getByRole('button', { name: 'Continue with email' }).click()
    await page.waitForFunction(() => document.querySelector('#tinct-lab-sign-in')?.dataset.mode === 'code')
    await page.locator('[data-code-input]').pressSequentially('123456')
    await page.waitForURL('**/reader?book=odyssey')
    assert.equal(await page.locator('[data-auth-destination]').count(), 1)
    assert.deepEqual(posts, [])
    // An old link to the profile step, signed in: no step, the account over the page instead.
    await page.goto(origin + '/sign-in?mode=profile&returnTo=%2Freader%3Fbook%3Dodyssey')
    await page.waitForURL(url => url.pathname === '/reader')
    assert.deepEqual(posts, [])
    assert.deepEqual(errors, [])
    await context.close()
  }
} finally { await browser.close() }
