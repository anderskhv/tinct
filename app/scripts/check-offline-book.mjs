// "Make available offline" (Book editions sheet), end to end against the local
// production build (dist/), served the way the Worker routes it.
//
// For each engine (WebKit at iPhone size, Chromium) and each book (the Bible,
// chapter-sharded; Frankenstein, whole-book JSON): open the book online as a
// signed-in reader, tap Make available offline, wait for Available offline,
// turn a page, then go offline, close the page and open new ones at /, /library
// and /reader?book=<id>: each lands in the reader on that book at the same
// place. Still offline, open chapters never opened online (deep links and page
// turns across chapter ends, the last chapter included), reload, then go back
// online and wait for the place to reach the (stubbed) cloud.
//
//   CI=true npm run build && node scripts/check-offline-book.mjs
//   OFFLINE_ENGINES=webkit OFFLINE_BOOKS=frankenstein node scripts/check-offline-book.mjs
import { chromium, webkit } from '@playwright/test'
import http from 'node:http'
import fs from 'node:fs/promises'
import path from 'node:path'
import assert from 'node:assert/strict'
import { markInternal } from './lib/internalTraffic.cjs'

const output = process.env.OFFLINE_OUT || 'artifacts/offline-book'
await fs.mkdir(output, { recursive: true })
const dist = path.resolve('dist')
const engines = (process.env.OFFLINE_ENGINES || 'webkit,chromium').split(',')
const BOOKS = {
  frankenstein: { firstChapter: 1, deepChapter: 10, lastChapter: 28 },
  bible: { firstChapter: 1, deepChapter: 500, lastChapter: 1189 },
}
const books = (process.env.OFFLINE_BOOKS || 'frankenstein,bible').split(',')
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.woff2': 'font/woff2', '.svg': 'image/svg+xml', '.png': 'image/png', '.ico': 'image/x-icon', '.webmanifest': 'application/manifest+json', '.wav': 'audio/wav', '.jpg': 'image/jpeg', '.webp': 'image/webp' }

// Playwright's setOffline does not reach a service worker's own fetches in
// every engine, so "offline" also cuts the connection at the server: every
// request then fails as it does in flight mode.
let networkDown = false
// Playwright's WebKit fails every navigation while emulating offline, before
// the service worker can answer it (Safari itself hands it to the worker), so
// WebKit runs on the cut connection alone. OFFLINE_EMULATE=1 forces emulation.
const emulateOffline = engine => process.env.OFFLINE_EMULATE === '1' || (process.env.OFFLINE_EMULATE !== '0' && engine === 'chromium')
// The cloud position, stubbed: GET answers what the last PUT stored.
let cloud = null
const puts = []
const server = http.createServer(async (req, res) => {
  if (networkDown) { req.socket.destroy(); return }
  try {
    const url = new URL(req.url, 'http://localhost')
    if (url.pathname === '/api/lab-position') {
      if (req.method === 'PUT') {
        let body = ''
        for await (const chunk of req) body += chunk
        cloud = JSON.parse(body); puts.push(cloud)
        res.writeHead(200, { 'Content-Type': 'application/json' }); res.end('{"ok":true}'); return
      }
      if (!cloud) { res.writeHead(404, { 'Content-Type': 'application/json' }); res.end('{}'); return }
      res.writeHead(200, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(cloud)); return
    }
    if (url.pathname.startsWith('/api/')) { res.writeHead(404, { 'Content-Type': 'application/json' }); res.end('{}'); return }
    const name = url.pathname === '/reader' ? '/app.html'
      : ['/', '/index.html', '/library', '/library/'].includes(url.pathname) ? '/lab/library_2/index.html'
        : url.pathname.endsWith('/') ? url.pathname + 'index.html' : url.pathname
    const file = path.resolve(dist, '.' + name)
    if (!file.startsWith(dist + '/')) { res.writeHead(404); res.end(); return }
    const body = await fs.readFile(file)
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' })
    res.end(body)
  } catch { res.writeHead(404); res.end() }
})
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
const origin = 'http://127.0.0.1:' + server.address().port

// A signed-in reader, without Supabase: an unexpired session in storage.
const b64 = value => Buffer.from(JSON.stringify(value)).toString('base64url')
const exp = Math.floor(Date.now() / 1000) + 6 * 3600
const userId = '00000000-0000-4000-8000-0000000c0ffe'
const accessToken = `${b64({ alg: 'HS256', typ: 'JWT' })}.${b64({ sub: userId, exp, role: 'authenticated', aud: 'authenticated', email: 'offline-check@tinct.app' })}.c2lnbmF0dXJl`
const user = { id: userId, aud: 'authenticated', role: 'authenticated', email: 'offline-check@tinct.app', app_metadata: { provider: 'email' }, user_metadata: {}, created_at: '2026-01-01T00:00:00Z' }
const session = { access_token: accessToken, refresh_token: 'offline-check-refresh', token_type: 'bearer', expires_in: 6 * 3600, expires_at: exp, user }

const ready = page => page.waitForFunction(() => {
  const root = document.querySelector('[data-testid="lab-root"]')
  return root?.dataset.readerReady === 'true' && root.dataset.positionResolving !== 'true' && document.querySelectorAll('[data-testid="lab-word"]').length > 20
}, null, { timeout: 45000 })
const state = page => page.evaluate(() => {
  const root = document.querySelector('[data-testid="lab-root"]')
  const words = [...document.querySelectorAll('[data-testid="lab-word"]')]
  const visible = words.filter(node => { const r = node.getBoundingClientRect(); return r.width > 0 && r.left >= 0 && r.right <= innerWidth && r.top >= 0 && r.bottom <= innerHeight })
  return { book: root?.dataset.bookId, chapter: Number(root?.dataset.chapter), first: visible.slice(0, 6).map(n => n.textContent).join(' '), visible: visible.length, path: location.pathname }
})
async function turn(page, times = 1) {
  for (let i = 0; i < times; i++) { await page.keyboard.press('ArrowRight'); await page.waitForTimeout(450) }
}
async function turnToChapter(page, chapter, limit = 160) {
  for (let i = 0; i < limit; i++) {
    if ((await state(page)).chapter === chapter) return
    await turn(page)
  }
  throw new Error('never reached chapter ' + chapter)
}

const results = []
try {
  for (const engineName of engines) {
    const engine = engineName === 'webkit' ? webkit : chromium
    const browser = await markInternal(await engine.launch({ headless: true }))
    for (const bookId of books) {
      const book = BOOKS[bookId]
      const label = `${engineName}-${bookId}`
      cloud = null; puts.length = 0
      const context = await browser.newContext({
        serviceWorkers: 'allow', viewport: { width: 390, height: 844 }, hasTouch: true,
        ...(engineName === 'webkit' ? { isMobile: true, deviceScaleFactor: 2 } : {}),
      })
      const errors = []
      // Nothing leaves the local origin; Supabase answers the stubbed reader.
      await context.route('**/*', route => {
        const url = new URL(route.request().url())
        if (url.origin === origin) return route.continue()
        if (url.pathname === '/auth/v1/user') return route.fulfill({ json: user })
        return route.abort()
      })
      await context.addInitScript(({ session }) => {
        if (!localStorage.getItem('sb-yazjyiqsxjystvpkyouk-auth-token')) localStorage.setItem('sb-yazjyiqsxjystvpkyouk-auth-token', JSON.stringify(session))
        HTMLMediaElement.prototype.play = async function () { this.muted = true }
      }, { session })
      let page = await context.newPage()
      page.on('pageerror', error => errors.push(error.message))
      await page.goto(`${origin}/reader?book=${bookId}&chapter=${book.firstChapter}`, { waitUntil: 'domcontentloaded' })
      await ready(page)
      await page.waitForFunction(() => !!navigator.serviceWorker.controller, null, { timeout: 45000 })

      // Make available offline.
      await page.getByTestId('lab-super').click()
      await page.getByTestId('lab-super-row-editions').click()
      const row = page.getByTestId('lab-v2-offline')
      await row.waitFor()
      assert.equal((await row.innerText()).trim(), 'Make available offline')
      await page.screenshot({ path: `${output}/${label}-1-before.png` })
      await row.click()
      await page.waitForFunction(() => /^Saving… \d+ of \d+$/.test(document.querySelector('[data-testid="lab-v2-offline"]')?.textContent?.trim() || ''), null, { timeout: 20000 })
      const progress = (await row.innerText()).trim()
      await page.screenshot({ path: `${output}/${label}-2-saving.png` })
      await page.waitForFunction(() => document.querySelector('[data-testid="lab-v2-offline"]')?.dataset.offlineState === 'saved', null, { timeout: 240000, polling: 500 })
      assert.match((await row.innerText()).trim(), /^Available offline\s*✓\s*Remove$/)
      const label2 = await row.locator('.lab-v2-row-label').evaluate(n => getComputedStyle(n).fontFamily)
      assert.match(label2, /EB Garamond/)
      await page.screenshot({ path: `${output}/${label}-3-saved.png` })
      const record = await page.evaluate(id => JSON.parse(localStorage.getItem('tinct:offline-books') || '{}')[id], bookId)
      assert(record && record.editions.length >= 1, 'saved record')
      await page.keyboard.press('Escape')
      await page.waitForFunction(() => !document.querySelector('[data-testid="lab-v2-offline"]'))
      const opening = await state(page)

      // A place two pages in, then offline.
      await turn(page, 2)
      await page.waitForTimeout(1600)
      const online = await state(page)
      assert.equal(online.chapter, book.firstChapter)
      assert.notEqual(online.first, opening.first, 'the page turned before going offline')
      // OFFLINE_EXPIRED=1: the session's access token has lapsed in flight
      // (it lasts an hour), so Supabase would want a refresh it cannot get.
      if (process.env.OFFLINE_EXPIRED === '1') await page.evaluate(() => {
        const key = 'sb-yazjyiqsxjystvpkyouk-auth-token', value = JSON.parse(localStorage.getItem(key))
        value.expires_at = Math.floor(Date.now() / 1000) - 120; localStorage.setItem(key, JSON.stringify(value))
      })
      networkDown = true
      if (emulateOffline(engineName)) await context.setOffline(true)
      await page.close()

      // /reader?book=bible without a chapter waits for the cloud's Bible place
      // (labReaderHandoff.ts), which offline means Genesis 1; plain /reader for it.
      const entries = ['/', '/library', bookId === 'bible' ? '/reader' : `/reader?book=${bookId}`]
      const opened = {}
      for (const entry of entries) {
        page = await context.newPage()
        page.on('pageerror', error => errors.push(error.message))
        const started = Date.now()
        await page.goto(origin + entry, { waitUntil: 'domcontentloaded' })
        await page.waitForURL(url => new URL(url).pathname === '/reader', { timeout: 20000, waitUntil: 'commit' }).catch(async error => { console.log('ENTRY_STALL', entry, page.url(), (await page.content().catch(() => '')).slice(0, 400)); await page.screenshot({ path: output + '/stall.png' }); throw error })
        await ready(page)
        await page.waitForTimeout(800)
        const at = { ...await state(page), readyMs: Date.now() - started - 800 }
        opened[entry] = at
        assert.equal(at.book, bookId, entry + ': opens the book')
        assert.equal(at.chapter, online.chapter, entry + ': same chapter')
        assert.equal(at.first, online.first, entry + ': same place')
        assert(at.readyMs < 15000, entry + ': the reader does not wait on the network (' + at.readyMs + ' ms)')
        await page.screenshot({ path: `${output}/${label}-4-offline-${entry === '/' ? 'root' : entry.replace(/[^a-z]+/g, '-').replace(/^-|-$/g, '')}.png` })
        if (entry !== entries.at(-1)) await page.close()
      }

      // Chapters never opened online: a deep link, page turns across chapter ends, the last chapter.
      await page.goto(`${origin}/reader?book=${bookId}&chapter=${book.deepChapter}`, { waitUntil: 'domcontentloaded' })
      await ready(page)
      assert.equal((await state(page)).chapter, book.deepChapter)
      await turnToChapter(page, book.deepChapter + 1)
      await ready(page)
      await turnToChapter(page, book.deepChapter + 2)
      await ready(page)
      await page.screenshot({ path: `${output}/${label}-5-offline-chapter-${book.deepChapter + 2}.png` })
      await page.goto(`${origin}/reader?book=${bookId}&chapter=${book.lastChapter}`, { waitUntil: 'domcontentloaded' })
      await ready(page)
      assert.equal((await state(page)).chapter, book.lastChapter)
      await turn(page, 1)
      await page.waitForTimeout(1600)
      const last = await state(page)
      assert.equal(last.chapter, book.lastChapter)
      assert(last.visible > 20, 'last chapter text on screen')
      await page.screenshot({ path: `${output}/${label}-6-offline-last-chapter.png` })
      await page.reload({ waitUntil: 'domcontentloaded' })
      await ready(page)
      await page.waitForTimeout(800)
      const reloaded = await state(page)
      assert.equal(reloaded.chapter, last.chapter, 'offline reload keeps the chapter')
      assert.equal(reloaded.first, last.first, 'offline reload keeps the place')
      await page.screenshot({ path: `${output}/${label}-7-offline-reload.png` })
      const compareCached = await page.evaluate(async ({ bookId, record }) => {
        const cache = await caches.open('tinct-offline-v3')
        const keys = (await cache.keys()).map(request => new URL(request.url).pathname)
        return record.editions.map(key => keys.filter(p => p.startsWith(`/data/editions-chapters/${bookId}-${key}/`) || p === `/data/editions/${bookId}-${key}.json`).length)
      }, { bookId, record })
      assert(compareCached.every(count => count > 0), 'every saved edition is in the cache: ' + compareCached)

      // Back online: the place reaches the cloud.
      const putsBefore = puts.length
      networkDown = false
      if (emulateOffline(engineName)) await context.setOffline(false)
      // The browser says 'online' when the connection returns; WebKit, whose
      // offline here is the cut connection alone, is told so by the check.
      const deadline = Date.now() + 60000
      let synced = null, told = 0
      while (Date.now() < deadline && !synced) {
        if (Date.now() - told > 5000) { told = Date.now(); await page.evaluate(() => window.dispatchEvent(new Event('online'))) }
        // The Bible keeps a place per biblical book (books.revelation, sequentialChapter 1189).
        synced = puts.slice(putsBefore).flatMap(put => Object.values(put?.books || {}))
          .find(place => (place?.sequentialChapter ?? place?.chapterNumber) === last.chapter) || null
        if (!synced) await new Promise(resolve => setTimeout(resolve, 500))
      }
      if (!synced) console.log('SYNC_MISSING ' + JSON.stringify({ last, puts: puts.slice(putsBefore).slice(-1).map(put => put?.books), dirty: await page.evaluate(() => localStorage.getItem('tinct-lab-position-dirty')), local: await page.evaluate(id => JSON.parse(localStorage.getItem('tinct-lab-position') || '{}').books?.[id], bookId) }))
      assert(synced, 'the offline place synced once online')
      // Network failures are the point of the check. Supabase's auth lock reports
      // WebKit words a refused (here: stubbed-out) request "access control checks".
      // "Lock was stolen" when a closed tab's lock passes to the next tab (WebKit).
      assert.deepEqual(errors.filter(e => !/Failed to fetch|Load failed|NetworkError|network connection|access control checks|Lock was stolen/i.test(e)), [], 'no page errors')
      results.push({ engine: engineName, bookId, progress, record, online, opened, last, reloaded, cachedFiles: compareCached, synced: { chapterNumber: synced.chapterNumber, sequentialChapter: synced.sequentialChapter, paragraphIndex: synced.paragraphIndex } })
      console.log('OFFLINE_BOOK ' + JSON.stringify(results.at(-1)))
      await context.close()
    }
    await browser.close()
  }
  await fs.writeFile(output + '/results.json', JSON.stringify(results, null, 2))
  console.log(`check-offline-book: ${results.length} runs passed`)
} finally {
  server.closeAllConnections?.()
  await new Promise(resolve => server.close(resolve))
}
