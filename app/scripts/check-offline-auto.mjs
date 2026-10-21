// Any book a reader opens becomes readable offline in full, with no tap:
// end to end against the local production build (dist/), served the way the
// Worker routes it, as a signed-out guest.
//
// For each viewport (desktop 1440x900, phone 390x844) and book: open the book
// online, read page 1, wait for the background whole-book save (the Book
// editions row then says Available offline), go offline, open Contents, jump
// to a far chapter never opened online and page through it, reload /reader
// offline and continue, into a further chapter, by Contents and page turns.
// Then a deploy: a new build version, with the book's files still cached
// under the old one, opened offline by the new shell.
//
//   SKIP_ENV_CHECK=1 npm run build && node scripts/check-offline-auto.mjs
//   OFFLINE_BOOKS=frankenstein OFFLINE_VIEWPORTS=phone node scripts/check-offline-auto.mjs
//   OFFLINE_SAVE_WAIT=15000: how long to wait for the background save (default 180 s)
import { chromium } from '@playwright/test'
import http from 'node:http'
import fs from 'node:fs/promises'
import path from 'node:path'
import assert from 'node:assert/strict'
import { markInternal } from './lib/internalTraffic.cjs'

const output = process.env.OFFLINE_OUT || 'artifacts/offline-auto'
await fs.mkdir(output, { recursive: true })
const dist = path.resolve('dist')
const BOOKS = {
  frankenstein: { farChapter: 20, laterChapter: 27 },
  odyssey: { farChapter: 18, laterChapter: 23 },
  // The Bible's Contents is a tree of its books: its far chapters are opened by link.
  bible: { farChapter: 600, laterChapter: 1100, byLink: true },
}
const books = (process.env.OFFLINE_BOOKS || 'frankenstein,odyssey').split(',')
const VIEWPORTS = {
  desktop: { viewport: { width: 1440, height: 900 } },
  phone: { viewport: { width: 390, height: 844 }, hasTouch: true },
}
const viewports = (process.env.OFFLINE_VIEWPORTS || 'desktop,phone').split(',')
const saveWait = Number(process.env.OFFLINE_SAVE_WAIT || 180000)
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.woff2': 'font/woff2', '.svg': 'image/svg+xml', '.png': 'image/png', '.ico': 'image/x-icon', '.webmanifest': 'application/manifest+json', '.wav': 'audio/wav', '.jpg': 'image/jpeg', '.webp': 'image/webp' }

// Flight mode: the connection is cut at the server as well as emulated, since
// setOffline does not reach a service worker's own fetches in every engine.
let networkDown = false
// A deploy, simulated: the served build version (the ?v= and the shell's
// bundles) is rewritten from the built one to this, when set.
let deployedVersion = null
let builtVersion = null
const editionBytes = new Map()
let editionRequests = 0
const server = http.createServer(async (req, res) => {
  if (networkDown) { req.socket.destroy(); return }
  try {
    const url = new URL(req.url, 'http://localhost')
    if (url.pathname.startsWith('/api/')) { res.writeHead(404, { 'Content-Type': 'application/json' }); res.end('{}'); return }
    const name = url.pathname === '/reader' ? '/app.html'
      : ['/', '/index.html', '/library', '/library/'].includes(url.pathname) ? '/lab/library_2/index.html'
        : url.pathname.endsWith('/') ? url.pathname + 'index.html' : url.pathname
    const file = path.resolve(dist, '.' + name)
    if (!file.startsWith(dist + '/')) { res.writeHead(404); res.end(); return }
    let body = await fs.readFile(file)
    if (deployedVersion && /\.(?:js|html)$/.test(file)) {
      const text = body.toString('utf8')
      let next = builtVersion ? text.split(builtVersion).join(deployedVersion) : text
      // The new build's service worker: a new shell cache, which retires the old one.
      if (url.pathname === '/sw.js') next = next.replace(/tinct-app-shell-[\w-]+/, 'tinct-app-shell-' + deployedVersion)
      if (next !== text) body = Buffer.from(next)
    }
    if (url.pathname.startsWith('/data/editions')) { editionBytes.set(url.pathname, body.length); editionRequests += 1 }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' })
    res.end(body)
  } catch { res.writeHead(404); res.end() }
})
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
const origin = 'http://127.0.0.1:' + server.address().port

const ready = page => page.waitForFunction(() => {
  const root = document.querySelector('[data-testid="lab-root"]')
  return root?.dataset.readerReady === 'true' && root.dataset.positionResolving !== 'true' && document.querySelectorAll('[data-testid="lab-word"]').length > 20
}, null, { timeout: 45000 })
const state = page => page.evaluate(() => {
  const root = document.querySelector('[data-testid="lab-root"]')
  const words = [...document.querySelectorAll('[data-testid="lab-word"]')]
  const visible = words.filter(node => { const r = node.getBoundingClientRect(); return r.width > 0 && r.left >= 0 && r.right <= innerWidth && r.top >= 0 && r.bottom <= innerHeight })
  return { book: root?.dataset.bookId, chapter: Number(root?.dataset.chapter), first: visible.slice(0, 6).map(n => n.textContent).join(' '), visible: visible.length, error: document.querySelector('[role="alert"]')?.textContent?.trim() || null }
})
async function turn(page, times = 1) {
  for (let i = 0; i < times; i++) { await page.keyboard.press('ArrowRight'); await page.waitForTimeout(450) }
}
async function turnToChapter(page, chapter, limit = 120) {
  for (let i = 0; i < limit; i++) {
    // Short chapters (a four-verse Psalm) can share a page with the next one.
    if ((await state(page)).chapter >= chapter) return
    await turn(page)
  }
  throw new Error('never reached chapter ' + chapter + ': ' + JSON.stringify(await state(page)))
}
// Contents → a chapter, then three pages through it, each showing new text.
async function contentsTo(page, chapter, label, byLink = false) {
  if (byLink) await page.goto(`${origin}/reader?book=bible&chapter=${chapter}`, { waitUntil: 'domcontentloaded' })
  else {
    await page.getByTestId('lab-header-chapter').click()
    const row = page.getByTestId('lab-contents-v2').getByTestId('lab-tree-chapter-' + chapter)
    await row.waitFor({ timeout: 15000 }).catch(async error => { await page.screenshot({ path: `${output}/${label}-contents-failure.png` }); throw error })
    await row.click()
  }
  await page.waitForFunction(n => Number(document.querySelector('[data-testid="lab-root"]')?.dataset.chapter) === n, chapter, { timeout: 20000 })
    .catch(async error => { await page.screenshot({ path: `${output}/${label}-jump-failure.png` }); throw new Error(`Contents → chapter ${chapter}: ${JSON.stringify(await state(page))} (${error.message.split('\n')[0]})`) })
  await ready(page).catch(async error => { await page.screenshot({ path: `${output}/${label}-jump-failure.png` }); throw new Error(`chapter ${chapter} never showed its text offline: ${JSON.stringify(await state(page))}`) })
  const seen = [(await state(page)).first]
  for (let i = 0; i < 3; i++) {
    await turn(page)
    const now = await state(page)
    assert(now.visible > 20, `${label}: text on screen after a turn in chapter ${chapter}`)
    seen.push(now.first)
  }
  assert(new Set(seen).size >= 3, `${label}: paging through chapter ${chapter} shows new text: ${JSON.stringify(seen)}`)
  // Each chapter came from its own saved file: the loader never fell back to a whole-book retry.
  const retries = await page.evaluate(() => performance.getEntriesByType('resource').map(e => e.name).filter(name => name.includes('fresh=1')))
  assert.deepEqual(retries, [], `${label}: no whole-book retry offline`)
}

const results = []
const failures = []
try {
  const browser = await markInternal(await chromium.launch({ headless: true }))
  for (const viewportName of viewports) {
    for (const bookId of books) {
      const book = BOOKS[bookId]
      const label = `${viewportName}-${bookId}`
      const result = { viewport: viewportName, bookId }
      networkDown = false; deployedVersion = null; editionBytes.clear()
      const context = await browser.newContext({ serviceWorkers: 'allow', ...VIEWPORTS[viewportName] })
      const errors = []
      await context.route('**/*', route => new URL(route.request().url()).origin === origin ? route.continue() : route.abort())
      await context.addInitScript(() => { HTMLMediaElement.prototype.play = async function () { this.muted = true } })
      let page = await context.newPage()
      page.on('pageerror', error => errors.push(error.message))
      try {
        await page.goto(`${origin}/reader?book=${bookId}&chapter=1`, { waitUntil: 'domcontentloaded' })
        await ready(page)
        await page.waitForFunction(() => !!navigator.serviceWorker.controller, null, { timeout: 45000 })
        builtVersion ??= await page.evaluate(() => [...performance.getEntriesByType('resource')].map(e => new URL(e.name).searchParams.get('v')).find(Boolean))
        // Read page 1, turn to page 2.
        await page.waitForTimeout(1500)
        await turn(page)
        const online = await state(page)
        result.online = online
        // The background save: no tap.
        const started = Date.now()
        const record = await page.waitForFunction(id => JSON.parse(localStorage.getItem('tinct:offline-books') || '{}')[id] || null, bookId, { timeout: saveWait, polling: 500 })
          .then(handle => handle.jsonValue(), () => null)
        result.backgroundSave = record ? { ms: Date.now() - started, editions: record.editions, files: record.files } : 'none'
        console.log(label, 'background save:', JSON.stringify(result.backgroundSave))
        result.bytes = [...editionBytes.values()].reduce((a, b) => a + b, 0)
        result.files = editionBytes.size
        const cached = await page.evaluate(async id => {
          const keys = await (await caches.open('tinct-offline-v3')).keys()
          return keys.map(k => new URL(k.url).pathname).filter(p => p.includes('/' + id + '-')).length
        }, bookId)
        result.cachedFiles = cached
        if (record) {
          // The manual row agrees: nothing to tap.
          await page.getByTestId('lab-super').click()
          await page.getByTestId('lab-super-menu').waitFor()
          // The phone's t menu (20 Oct 2026): Reading settings holds the editions, voice, speed and offline row; the desktop keeps Book editions.
          await page.getByTestId((await page.getByTestId('lab-super-row-reading').count() ? 'lab-super-row-reading' : 'lab-super-row-editions')).click()
          const row = page.getByTestId('lab-v2-offline')
          await row.waitFor()
          assert.equal(await row.getAttribute('data-offline-state'), 'saved', 'the Book editions row says Available offline')
          await page.screenshot({ path: `${output}/${label}-1-row-saved.png` })
          await page.keyboard.press('Escape')
          await page.waitForFunction(() => !document.querySelector('[data-testid="lab-v2-offline"]'))
        }

        // The next visit, online: saved for this build, so nothing is fetched
        // again beyond the reader's own few requests (its chapter window).
        // The background save would start 4 s after the first page.
        const before = editionRequests
        await page.reload({ waitUntil: 'domcontentloaded' })
        await ready(page)
        await page.waitForTimeout(3000)
        const settled = editionRequests
        await page.waitForTimeout(12000)
        result.revisitRequests = { reader: settled - before, afterwards: editionRequests - settled }
        assert.equal(result.revisitRequests.afterwards, 0, `a second visit does not download the book again: ${JSON.stringify(result.revisitRequests)}`)

        // Flight mode.
        networkDown = true
        await context.setOffline(true)
        await contentsTo(page, book.farChapter, label + '-a', book.byLink)
        await page.screenshot({ path: `${output}/${label}-2-offline-far.png` })
        const beforeReload = await state(page)
        await page.waitForTimeout(1200)
        await page.reload({ waitUntil: 'domcontentloaded' }).catch(async error => { throw new Error('offline reload: ' + error.message.split('\n')[0]) })
        await ready(page).catch(async () => { await page.screenshot({ path: `${output}/${label}-reload-failure.png` }); throw new Error('offline reload never showed the reader: ' + (await page.locator('body').innerText().catch(() => '')).slice(0, 300)) })
        await page.waitForTimeout(800)
        const reloaded = await state(page)
        assert.equal(reloaded.chapter, beforeReload.chapter, 'offline reload keeps the chapter')
        assert.equal(reloaded.first, beforeReload.first, 'offline reload keeps the place')
        await turnToChapter(page, book.farChapter + 1)
        await ready(page)
        await turn(page, 2)
        await contentsTo(page, book.laterChapter, label + '-b', book.byLink)
        await page.screenshot({ path: `${output}/${label}-3-offline-after-reload.png` })

        // A deploy while away: back online briefly, the new build is served
        // (new ?v=, new shell), then flight mode and a reload on that shell.
        networkDown = false
        await context.setOffline(false)
        deployedVersion = 'deploy' + Date.now().toString(36)
        await page.reload({ waitUntil: 'domcontentloaded' })
        await ready(page)
        await page.waitForFunction(v => caches.keys().then(keys => keys.includes('tinct-app-shell-' + v) && keys.filter(k => k.startsWith('tinct-app-shell-')).length === 1), deployedVersion, { timeout: 30000, polling: 500 })
        await page.waitForTimeout(2500)
        const placeNewBuild = await state(page)
        networkDown = true
        await context.setOffline(true)
        await page.reload({ waitUntil: 'domcontentloaded' })
        await ready(page).catch(async () => { await page.screenshot({ path: `${output}/${label}-deploy-failure.png` }); throw new Error('after a deploy, offline reload never showed the reader') })
        assert.equal((await state(page)).chapter, placeNewBuild.chapter, 'after a deploy: offline reload keeps the chapter')
        const versions = await page.evaluate(() => [...new Set(performance.getEntriesByType('resource').map(e => new URL(e.name)).filter(u => u.pathname.startsWith('/data/editions-chapters/')).map(u => u.searchParams.get('v')))])
        assert.deepEqual(versions, [deployedVersion], 'after a deploy, the offline reader runs the new build: ' + versions)
        await contentsTo(page, book.farChapter - 2, label + '-c', book.byLink)
        await page.screenshot({ path: `${output}/${label}-4-offline-after-deploy.png` })
        assert.deepEqual(errors.filter(e => !/Failed to fetch|Load failed|NetworkError|network connection/i.test(e)), [], 'no page errors')
        result.passed = true
      } catch (error) {
        result.passed = false
        result.error = error.message
        failures.push(label)
        await page.screenshot({ path: `${output}/${label}-failure.png` }).catch(() => {})
      }
      console.log('OFFLINE_AUTO ' + JSON.stringify(result))
      results.push(result)
      await context.close()
    }
  }
  await browser.close()
  await fs.writeFile(output + '/results.json', JSON.stringify(results, null, 2))
  if (failures.length) { console.log('check-offline-auto: FAILED ' + failures.join(', ')); process.exitCode = 1 }
  else console.log(`check-offline-auto: ${results.length} runs passed`)
} finally {
  server.closeAllConnections?.()
  await new Promise(resolve => server.close(resolve))
}
