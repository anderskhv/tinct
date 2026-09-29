import { chromium, webkit } from '@playwright/test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'

const live = process.env.AUTH_LIVE === '1'
const origin = 'https://tinct.app'
const output = 'artifacts/sign-in'
await fs.mkdir(output, { recursive: true })
const results = []
const user = { id: '00000000-0000-4000-8000-000000000001', email: 'fixture@example.com',
  aud: 'authenticated', role: 'authenticated', created_at: '2026-09-29T17:00:00Z',
  last_sign_in_at: '2026-09-29T17:00:01Z', email_confirmed_at: '2026-09-29T17:00:01Z', app_metadata: { provider: 'google', providers: ['google'] }, user_metadata: {}, identities: [] }
const sessionFor = reader => {
  const exp = Math.floor(Date.now() / 1000) + 3600
  const token = [Buffer.from('{"alg":"HS256","typ":"JWT"}').toString('base64url'), Buffer.from(JSON.stringify({ sub: reader.id, exp, role: 'authenticated' })).toString('base64url'), 'fixture-only'].join('.')
  return { access_token: token, refresh_token: 'fixture-refresh', token_type: 'bearer', expires_in: 3600, expires_at: exp, user: reader }
}
for (const [engine, type] of Object.entries({ chromium, webkit })) {
  const browser = await type.launch({ headless: true, ...(engine === 'chromium' ? { args: ['--mute-audio'] } : {}) })
  try {
    for (const [size, width, height] of [['phone', 390, 844], ['desktop', 1440, 900]]) {
      for (const test of ['signed-out', 'new-google', 'returning-google', 'email-confirmed', 'password-reset']) {
        const context = await browser.newContext({ viewport: { width, height }, serviceWorkers: 'block' })
        try {
          const page = await context.newPage()
          const errors = [], assets = []
          page.on('pageerror', error => errors.push(error.message))
          const fixtureUser = test === 'returning-google' || test === 'email-confirmed' ? { ...user, created_at: '2026-01-01T00:00:00Z' } : user
          const session = test === 'signed-out' ? null : sessionFor(fixtureUser)
          await page.addInitScript(session => {
            if (session) localStorage.setItem('sb-yazjyiqsxjystvpkyouk-auth-token', JSON.stringify(session))
            HTMLMediaElement.prototype.play = async function () { this.muted = true }
            if (navigator.mediaDevices) navigator.mediaDevices.getUserMedia = async () => { throw Error('Microphone disabled in auth acceptance') }
          }, session)
          await page.route('**/*', async route => {
            const request = route.request(), url = new URL(request.url())
            // No real accounts, emails, API writes or providers are contacted.
            if (url.hostname.endsWith('.supabase.co')) return route.fulfill({ json: fixtureUser })
            if (request.method() !== 'GET' || url.origin !== origin || url.pathname.startsWith('/api/')) return route.abort()
            if (url.pathname === '/reader') return route.fulfill({ contentType: 'text/html', body: '<p data-auth-destination>Book preserved</p>' })
            if (url.pathname.startsWith('/assets/')) assets.push(url.pathname)
            if (live) return route.continue()
            const relative = url.pathname === '/lab/sign-in' || url.pathname === '/lab/sign-in/' ? '/lab/sign-in/index.html' : url.pathname
            const file = path.resolve('dist', '.' + relative)
            if (!file.startsWith(path.resolve('dist') + '/')) return route.abort()
            try { return await route.fulfill({ path: file }) } catch { return route.abort() }
          })
          const callback = test === 'email-confirmed' ? 'signup' : 'oauth'
          const query = test === 'signed-out' ? '' : test === 'password-reset' ? '&mode=reset' : '&callback=' + callback
          await page.goto(origin + '/lab/sign-in?returnTo=%2Freader%3Fbook%3Dbible%23p12' + query, { waitUntil: 'domcontentloaded' })
          if (test === 'returning-google') {
            await page.waitForURL('**/reader?book=bible#p12')
            assert.equal(await page.locator('[data-auth-destination]').count(), 1)
          } else {
            await page.waitForFunction(() => document.querySelector('#tinct-lab-sign-in')?.dataset.ready === 'true')
            const root = page.locator('#tinct-lab-sign-in')
            const expected = test === 'signed-out' ? 'signin' : test === 'password-reset' ? 'reset' : 'welcome'
            assert.equal(await root.getAttribute('data-mode'), expected)
            assert.equal(await page.locator('[data-oauth="apple"]:visible').count(), 0)
            assert.equal(await page.locator('[data-oauth="github"]:visible').count(), 0)
            if (expected === 'signin') assert.equal(await page.getByRole('button', { name: 'Continue with Google' }).count(), 1)
            if (expected === 'welcome') {
              assert.equal(await page.getByRole('heading', { name: 'Welcome to Tinct.' }).count(), 1)
              assert.equal(await page.locator('[data-auth-form]:visible').count(), 0)
              assert.equal(await page.locator('[data-sign-out]:visible').count(), 0)
              const box = await page.locator('.auth-card').boundingBox()
              assert(box.x >= 0 && box.x + box.width <= width && box.y >= 60 && box.y + box.height <= height)
              if (test === 'new-google') {
                assert(Math.abs(box.y + box.height / 2 - (height + (size === 'phone' ? 60 : 72)) / 2) < 6)
                const screenshot = await page.screenshot({ path: output + '/' + engine + '-' + size + '-welcome.png' })
                if (engine === 'webkit') {
                  console.log('REVIEW_BEGIN ' + size + '-welcome')
                  const encoded = screenshot.toString('base64')
                  for (let i = 0; i < encoded.length; i += 12000) console.log('REVIEW_CHUNK ' + encoded.slice(i, i + 12000))
                  console.log('REVIEW_END')
                }
                await page.reload()
                await page.waitForFunction(() => document.querySelector('#tinct-lab-sign-in')?.dataset.ready === 'true')
                assert.equal(await root.getAttribute('data-mode'), 'welcome')
              }
              await page.getByRole('button', { name: 'Continue reading', exact: true }).click()
              await page.waitForURL('**/reader?book=bible#p12')
            }
          }
          assert.deepEqual(errors, [])
          const result = { engine, size, test, live, passed: true, assets: [...new Set(assets)] }
          results.push(result)
          console.log('AUTH_ACCEPTANCE ' + JSON.stringify(result))
        } finally { await context.close() }
      }
    }
  } finally { await browser.close() }
}
await fs.writeFile(output + '/results.json', JSON.stringify(results, null, 2))
