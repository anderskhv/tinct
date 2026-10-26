// Synthetic account only; all API calls intercepted. Run by isolated GitHub acceptance.
import { webkit } from '@playwright/test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import { markInternal } from './lib/internalTraffic.cjs'
import { checkLayout, DEFAULT_SELECTORS } from '../../docs/margin/layout-check.mjs'
const origin = 'https://tinct.app', output = 'artifacts/profile-flow'
await fs.mkdir(output, { recursive: true })
const browser = await markInternal(await webkit.launch({ headless: true }))
try {
  for (const [size, width, height] of [['phone', 390, 844], ['desktop', 1440, 1000]]) {
    const context = await browser.newContext({ viewport: { width, height }, serviceWorkers: 'block' })
    const page = await context.newPage(), posts = [], errors = []
    page.on('pageerror', error => errors.push(error.message))
    const user = { id: '00000000-0000-4000-8000-000000000001', email: 'synthetic@test.tinct.app', created_at: '2026-10-26T00:00:00Z', app_metadata: { provider: 'email' }, user_metadata: {} }
    let profile = { handle: 'reader', name: 'Reader', picture: { kind: 'initial', value: null, url: null, review: 'none' }, background: { kind: 'library', value: null, url: null, review: 'none' }, visibility: 'only_me', effectiveVisibility: 'only_me', showReading: false, showTime: false, onLeaderboard: false, newBooksOpenIn: 'modern', readingLanguages: ['en'], setUp: false, needsSetup: true, shouldPrompt: true, emailConfirmed: false, uploads: false }
    await page.addInitScript(user => {
      localStorage.setItem('sb-yazjyiqsxjystvpkyouk-auth-token', JSON.stringify({ access_token: 'synthetic-only', refresh_token: 'synthetic-refresh', expires_at: Math.floor(Date.now()/1000)+3600, user }))
      HTMLMediaElement.prototype.play = async function () { this.muted = true }
    }, user)
    await page.route('**/*', async route => {
      const req = route.request(), url = new URL(req.url())
      if (url.hostname.endsWith('.supabase.co')) return route.fulfill({ json: user })
      if (url.origin !== origin) return route.abort()
      if (url.pathname === '/api/profile') {
        if (req.method() === 'POST') { const patch=req.postDataJSON(); posts.push(patch); profile={...profile,...patch} }
        return route.fulfill({ json: { enabled:true, available:true, profile } })
      }
      if (url.pathname.startsWith('/api/') || req.method() !== 'GET') return route.abort()
      if (url.pathname === '/reader') return route.fulfill({ contentType:'text/html', body:'<p>Saved book destination</p>' })
      const relative = url.pathname === '/sign-in' ? '/lab/sign-in/index.html' : url.pathname
      const file=path.resolve('dist','.'+relative)
      if (!file.startsWith(path.resolve('dist')+'/')) return route.abort()
      try {
        if (url.pathname === '/sign-in') return route.fulfill({ contentType:'text/html', body:(await fs.readFile(file,'utf8')).replace('</head>','<meta name="tinct-social" content="1"></head>') })
        return route.fulfill({ path:file })
      } catch { return route.abort() }
    })
    await page.goto(origin+'/sign-in?mode=profile&returnTo=%2Freader%3Fbook%3Dodyssey')
    await page.locator('[data-social-continue]:visible').waitFor()
    assert.equal(await page.locator('[name=profileName]').inputValue(), '')
    assert.equal(await page.locator('[data-value=everyone]').getAttribute('aria-checked'),'true')
    assert.deepEqual(posts,[])
    const bannerImage = await page.locator('.social-profile-banner').evaluate(node => getComputedStyle(node).backgroundImage)
    assert.ok(bannerImage.includes('room-library-night.jpg'), 'Profile banner must render the existing library background')
    await page.evaluate(() => Promise.all([...document.images].map(image => image.decode().catch(() => {}))))
    const selectors={...DEFAULT_SELECTORS, card:'.auth-card', text:'.social-step h1,.social-label,.social-tick,.social-note', tap:'.social-step button', bar:null, menu:null, foot:null}
    assert.deepEqual(await checkLayout(page,{selectors}),[])
    await page.screenshot({path:`${output}/${size}-profile.png`,fullPage:true})
    await page.locator('[name=profileName]').fill('Synthetic Reader')
    await page.locator('[data-social-continue]').click()
    await page.locator('[data-social-start]:visible').waitFor()
    assert.equal(posts[0].visibility,'everyone')
    for(const key of ['showReading','showTime','onLeaderboard']) assert.equal(posts[0][key],true)
    assert.deepEqual(await checkLayout(page,{selectors}),[])
    await page.screenshot({path:`${output}/${size}-reading.png`,fullPage:true})
    await page.locator('[data-language=da]').click()
    await page.locator('[data-language=en]').click()
    await page.locator('[data-language=da]').click()
    assert.equal(await page.locator('[data-language=da]').getAttribute('aria-checked'),'true')
    await page.locator('[data-social-start]').click()
    await page.waitForURL('**/reader?book=odyssey')
    assert.deepEqual(posts[1].readingLanguages,['da'])
    assert.deepEqual(errors,[])
    await context.close()
  }
} finally { await browser.close() }
