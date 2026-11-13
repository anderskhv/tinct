// Phone reader, one device, two reader instances (two tabs sharing
// localStorage, or one tab restored from the back/forward cache): a reader
// instance that slept while another read on must never write its stale place
// back over the newer one, and must show the newer place when it wakes.
// Reported 12 Nov 2026 (iPhone, Brave): The Master and Margarita, chapter 2,
// read on to ¶180 in one tab; an older tab still at ¶158 woke and the next
// open landed on ¶158.
//
// Scenarios: wake-and-tap (the old tab comes back and is tapped while the
// account read is in flight) and silent-tap (iOS never told the old tab it
// was hidden or shown; it is simply tapped) failed before the fix: the tap
// saved ¶158 + one page with a fresh clock over the newer place, on the device
// and in the account. single-tab, silent-wake, stale-library, two-tabs,
// bfcache and fresh-device (Brave clearing site data: the account's place
// must open) guard the neighbouring paths.
//
//   cd app && VITE_SHARED_READER_DEFAULT=1 SKIP_ENV_CHECK=1 VITE_SUPABASE_URL=https://qa.supabase.co \
//     VITE_SUPABASE_ANON_KEY=qa npx vite --port 5291 --host 127.0.0.1
//   TINCT_ORIGIN=http://127.0.0.1:5291 node scripts/check-stale-tab-position.mjs
//
// WebKit at an iPhone viewport with touch; service workers blocked. The
// account's /api/lab-position is an in-memory store merged with the server's
// own rule (mergeLabPositionStatesByTime, bundled from src); Supabase and every
// other /api route are refused or answered empty. Knobs: BROWSER=chromium,
// SCENARIOS=<comma list>, TEST_TRACE=1
// (every write to the device record, with its stack, and the account PUTs).
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import { createRequire } from 'node:module'
import esbuild from 'esbuild'
import { chromium, webkit } from '@playwright/test'
import { markInternal } from './lib/internalTraffic.cjs'

const origin = process.env.TINCT_ORIGIN || 'http://127.0.0.1:5291'
const BOOK = 'master-and-margarita'
const CHAPTER = 2
const STALE = 158
const USER = 'u-qa-reader'
const DEVICE = '07962cc1-0000-4000-8000-000000000000'
const trace = process.env.TEST_TRACE === '1'
const scenarios = (process.env.SCENARIOS || 'single-tab,silent-wake,stale-library,wake-and-tap,silent-tap,two-tabs,bfcache,fresh-device').split(',')

const merge = (() => {
  const out = fs.mkdtempSync(path.join(os.tmpdir(), 'tinct-stale-tab-'))
  esbuild.buildSync({ entryPoints: ['src/lab/labPosition.ts'], bundle: true, platform: 'node', format: 'cjs', outfile: path.join(out, 'lab-position.cjs'), logLevel: 'silent' })
  const loaded = createRequire(import.meta.url)(path.join(out, 'lab-position.cjs'))
  fs.rmSync(out, { recursive: true, force: true })
  return loaded
})()

const engine = process.env.BROWSER === 'chromium' ? chromium : webkit
const browser = await markInternal(await engine.launch({ headless: true }))

function placeAt(paragraphIndex, at) {
  return {
    bookId: BOOK, headerBook: 'Mesteren og Margarita', chapterNumber: CHAPTER, sequentialChapter: CHAPTER,
    paragraphIndex, wordIndex: 0, pageIndex: 0, primaryEditionKey: 'modern-da', compareEditionKey: 'original-ru', readerMode: 'read',
    updatedAt: at, deviceId: DEVICE, rev: 3,
  }
}
function recordAt(paragraphIndex, at) {
  return { owner: USER, books: { [BOOK]: placeAt(paragraphIndex, at) }, recentChapters: {}, finished: {}, hidden: {},
    lastSettledBookId: BOOK, lastSettledAt: at, updatedAt: at, deviceId: DEVICE }
}

async function newContext(cloud, { seedLocal = true } = {}) {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, hasTouch: true, serviceWorkers: 'block',
    ...(process.env.BROWSER === 'chromium' ? { isMobile: true } : {}),
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/27.2 Mobile/15E148 Safari/604.1 Brave',
  })
  const puts = []
  await context.route('**/*', async route => {
    const request = route.request()
    const url = new URL(request.url())
    if (url.hostname.endsWith('supabase.co')) return route.fulfill({ status: 503, contentType: 'application/json', body: '{}' })
    if (url.origin !== origin) return route.abort()
    if (url.pathname === '/api/lab-position') {
      if (request.method() === 'PUT') {
        const body = request.postDataJSON()
        const incoming = merge.parseLabPositionState(body, DEVICE)
        cloud.state = { ...merge.mergeLabPositionStatesByTime(cloud.state, incoming, { requireSettleAcknowledgement: true }), owner: USER }
        puts.push({ at: Date.now(), from: request.frame()?.page()?.__label ?? '?', paragraph: incoming.books[BOOK]?.paragraphIndex, updatedAt: incoming.books[BOOK]?.updatedAt })
        return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(cloud.state) })
      }
      // Read now, answered after the phone's network delay.
      const body = JSON.stringify(cloud.state)
      if (cloud.getDelayMs) await new Promise(resolve => setTimeout(resolve, cloud.getDelayMs))
      return route.fulfill({ status: 200, contentType: 'application/json', body })
    }
    if (url.pathname === '/api/user-books/places') return route.fulfill({ status: 200, contentType: 'application/json', body: '{"places":{}}' })
    if (url.pathname === '/api/user-books' || url.pathname === '/api/public-books') return route.fulfill({ status: 200, contentType: 'application/json', body: '{"books":[]}' })
    if (url.pathname.startsWith('/api/')) return route.fulfill({ status: 404, contentType: 'application/json', body: '{}' })
    return route.continue()
  })
  if (trace) await context.addInitScript(() => { window.__traceWrites = true })
  await context.addInitScript(({ user, device, seed, seedLocal }) => {
    // Background/foreground as iOS reports it to a page.
    let hidden = false
    Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => hidden ? 'hidden' : 'visible' })
    Object.defineProperty(document, 'hidden', { configurable: true, get: () => hidden })
    window.__background = () => {
      hidden = true
      document.dispatchEvent(new Event('visibilitychange'))
      window.dispatchEvent(new Event('blur'))
    }
    window.__foreground = () => {
      hidden = false
      document.dispatchEvent(new Event('visibilitychange'))
      window.dispatchEvent(new Event('focus'))
    }
    window.__bfcacheLeave = () => {
      hidden = true
      window.dispatchEvent(new PageTransitionEvent('pagehide', { persisted: true }))
      document.dispatchEvent(new Event('visibilitychange'))
    }
    window.__bfcacheReturn = () => {
      hidden = false
      window.dispatchEvent(new PageTransitionEvent('pageshow', { persisted: true }))
      document.dispatchEvent(new Event('visibilitychange'))
      window.dispatchEvent(new Event('focus'))
    }
    if (window.__traceWrites) {
      const setItem = Storage.prototype.setItem
      Storage.prototype.setItem = function (key, value) {
        if (key === 'tinct-lab-position') {
          try {
            const place = Object.values(JSON.parse(value).books || {})[0]
            console.log(`write ¶${place?.paragraphIndex} at ${place?.updatedAt} ${new Error().stack.split('\n').slice(1, 9).map(line => line.replace(/https?:[^ )]*\/src\//, '').trim()).join(' < ')}`)
          } catch { /* not a record */ }
        }
        return setItem.call(this, key, value)
      }
    }
    if (localStorage.getItem('qa-seeded')) return
    localStorage.setItem('qa-seeded', '1')
    const now = Math.floor(Date.now() / 1000)
    localStorage.setItem('sb-qa-auth-token', JSON.stringify({ access_token: 'qa-token', refresh_token: 'qa-refresh', token_type: 'bearer', expires_in: 360000, expires_at: now + 360000, user: { id: user, email: 'reader@example.com', aud: 'authenticated', user_metadata: {} } }))
    document.cookie = 'tinct_auth=1; path=/'
    localStorage.setItem('tinct-lab-device-id', device)
    localStorage.setItem('tinct-lab-prefs', JSON.stringify({ primaryEdition: 'modern-da', audioEdition: 'modern-da', compareEdition: 'original-ru', compareOpen: true, compareChosen: true, fontSize: 1, fontSizeExplicit: true }))
    if (seedLocal) localStorage.setItem('tinct-lab-position', JSON.stringify(seed))
  }, { user: USER, device: DEVICE, seed: cloud.state, seedLocal })
  return { context, puts }
}

async function openReader(context, label) {
  const page = await context.newPage()
  page.__label = label
  page.on('pageerror', error => console.log(`  [${label}] pageerror ${error.message}`))
  if (trace) page.on('console', message => console.log(`  [${label}] ${message.type()} ${message.text().slice(0, 240)}`))
  await page.goto(`${origin}/reader`, { waitUntil: 'domcontentloaded' })
  await page.waitForFunction(({ chapter }) => {
    const root = document.querySelector('.lab')
    return root?.dataset.readerReady === 'true' && root.dataset.chapter === String(chapter)
  }, { chapter: CHAPTER }, { timeout: 60000 })
  await page.waitForTimeout(1500)
  return page
}

const shown = page => page.evaluate(() => {
  const root = document.querySelector('.lab')
  return { chapter: Number(root?.dataset.chapter), paragraph: Number((root?.dataset.place || '0:0').split(':')[0]) }
})
const stored = page => page.evaluate(book => {
  const place = JSON.parse(localStorage.getItem('tinct-lab-position') || '{}').books?.[book]
  return place ? { chapter: place.sequentialChapter, paragraph: place.paragraphIndex, updatedAt: place.updatedAt } : null
}, BOOK)

async function readForward(page, turns) {
  for (let i = 0; i < turns; i++) {
    // A tap on the right edge of the page, as a phone reader turns it.
    if (process.env.TURN === 'key') await page.keyboard.press('ArrowRight')
    else await page.touchscreen.tap(370, 430)
    await page.waitForTimeout(450)
  }
  await page.waitForTimeout(1500)
  return shown(page)
}

const results = []
async function scenario(name, run) {
  if (!scenarios.includes(name)) return
  try {
    await run()
    results.push([name, 'ok'])
    console.log(`ok   ${name}`)
  } catch (error) {
    results.push([name, 'FAIL'])
    console.log(`FAIL ${name}: ${error.message.split('\n').slice(0, 6).join('\n     ')}`)
  }
}

// One tab: read on, lock the phone, come back minutes later, then reload.
await scenario('single-tab', async () => {
  const cloud = { state: recordAt(STALE, Date.now() - 60 * 60 * 1000) }
  const { context, puts } = await newContext(cloud)
  try {
    const page = await openReader(context, 'one')
    const start = await shown(page)
    const reached = await readForward(page, 6)
    assert(reached.paragraph > start.paragraph, `read forward from ¶${start.paragraph}: ${JSON.stringify(reached)}`)
    await page.waitForTimeout(1500)
    const afterRead = await stored(page)
    assert.equal(afterRead.paragraph, reached.paragraph, `the place read to is stored (stored ¶${afterRead.paragraph}, shown ¶${reached.paragraph})`)
    await page.evaluate(() => window.__background())
    await page.waitForTimeout(1500)
    await page.evaluate(() => window.__foreground())
    await page.waitForTimeout(2500)
    const back = await shown(page)
    assert.equal(back.paragraph, reached.paragraph, `returning shows ¶${reached.paragraph} (¶${back.paragraph})`)
    await page.evaluate(() => window.__background())
    await page.waitForTimeout(1500)
    if (trace) console.log('  puts', JSON.stringify(puts))
    assert.equal(cloud.state.books[BOOK].paragraphIndex, reached.paragraph, `account place is ¶${reached.paragraph} (got ¶${cloud.state.books[BOOK].paragraphIndex})`)
    await page.evaluate(() => window.__foreground())
    await page.reload({ waitUntil: 'domcontentloaded' })
    await page.waitForFunction(() => document.querySelector('.lab')?.dataset.readerReady === 'true', null, { timeout: 60000 })
    await page.waitForTimeout(2000)
    const reopened = await shown(page)
    assert.equal(reopened.paragraph, reached.paragraph, `a reload lands on ¶${reached.paragraph} (¶${reopened.paragraph})`)
  } finally {
    await context.close()
  }
})

// Two live instances, the old one never told it was hidden (iOS froze it): it
// only re-renders (a viewport change, a focus with no blur, coming online).
await scenario('silent-wake', async () => {
  const cloud = { state: recordAt(STALE, Date.now() - 60 * 60 * 1000) }
  const { context, puts } = await newContext(cloud)
  try {
    const b = await openReader(context, 'B')
    const a = await openReader(context, 'A')
    const reached = await readForward(a, 6)
    await a.evaluate(() => window.__background())
    await a.waitForTimeout(1500)
    await b.bringToFront()
    await b.setViewportSize({ width: 390, height: 780 })
    await b.waitForTimeout(800)
    await b.setViewportSize({ width: 390, height: 844 })
    await b.evaluate(() => { window.dispatchEvent(new Event('focus')); window.dispatchEvent(new Event('online')); window.dispatchEvent(new Event('resize')) })
    await b.waitForTimeout(2500)
    const bShown = await shown(b)
    await b.evaluate(() => window.__background())
    await b.waitForTimeout(1500)
    const local = await stored(b)
    if (trace) console.log('  puts', JSON.stringify(puts))
    assert.equal(local.paragraph, reached.paragraph, `stored place stays ¶${reached.paragraph} (got ¶${local.paragraph})`)
    assert.equal(cloud.state.books[BOOK].paragraphIndex, reached.paragraph, `account place stays ¶${reached.paragraph} (got ¶${cloud.state.books[BOOK].paragraphIndex})`)
    assert.equal(bShown.paragraph, reached.paragraph, `the old instance shows ¶${reached.paragraph} (shows ¶${bShown.paragraph})`)
  } finally {
    await context.close()
  }
})

// The library, loaded while the place was ¶158 (a tab, or the page Back returns
// to), opens the book after the reader read on: the reader must open at the newer place.
await scenario('stale-library', async () => {
  const cloud = { state: recordAt(STALE, Date.now() - 60 * 60 * 1000) }
  const { context, puts } = await newContext(cloud)
  try {
    const library = await context.newPage()
    library.__label = 'L'
    if (trace) library.on('console', message => console.log(`  [L] ${message.type()} ${message.text().slice(0, 240)}`))
    await library.goto(`${origin}/library`, { waitUntil: 'domcontentloaded' })
    await library.waitForFunction(() => Boolean(window.__tinctLibraryTwoReading) || document.readyState === 'complete', null, { timeout: 60000 })
    // Let the library resolve its reading rows (Continue targets) at ¶158.
    await library.evaluate(async () => {
      const mod = await import('/lab/library_2/catalogue.js')
      const api = await mod.readingApi()
      await api.loadReadingTable?.()
    }).catch(error => console.log('  library warm-up:', error.message))
    await library.waitForTimeout(3000)
    const a = await openReader(context, 'A')
    const reached = await readForward(a, 6)
    await a.evaluate(() => window.__background())
    await a.waitForTimeout(1500)
    await a.close()
    await library.bringToFront()
    const href = await library.evaluate(async () => {
      const mod = await import('/lab/library_2/catalogue.js')
      const api = await mod.readingApi()
      return api.readerDestination('master-and-margarita', null)
    })
    const handoff = await library.evaluate(() => sessionStorage.getItem('tinct:lab-reader-handoff'))
    if (trace) console.log('  handoff', href, handoff)
    library.on('pageerror', error => console.log(`  [L] pageerror ${error.message}`))
    await library.goto(`${origin}${href}`, { waitUntil: 'domcontentloaded' })
    await library.waitForFunction(() => document.querySelector('.lab')?.dataset.readerReady === 'true', null, { timeout: 60000 })
    await library.waitForTimeout(2500)
    const opened = await shown(library)
    const local = await stored(library)
    if (trace) console.log('  puts', JSON.stringify(puts))
    assert.equal(local.paragraph, reached.paragraph, `stored place stays ¶${reached.paragraph} (got ¶${local.paragraph})`)
    assert.equal(cloud.state.books[BOOK].paragraphIndex, reached.paragraph, `account place stays ¶${reached.paragraph} (got ¶${cloud.state.books[BOOK].paragraphIndex})`)
    assert.equal(opened.paragraph, reached.paragraph, `Continue from the old library opens ¶${reached.paragraph} (¶${opened.paragraph})`)
  } finally {
    await context.close()
  }
})

// The old tab wakes and the reader taps at once (the account read is still
// on the network): the tap must turn on from the newer place, never from ¶158.
await scenario('wake-and-tap', async () => {
  const cloud = { state: recordAt(STALE, Date.now() - 60 * 60 * 1000) }
  const { context, puts } = await newContext(cloud)
  try {
    const b = await openReader(context, 'B')
    await b.evaluate(() => window.__background())
    const a = await openReader(context, 'A')
    const reached = await readForward(a, 6)
    await a.evaluate(() => window.__background())
    await a.waitForTimeout(1500)
    cloud.getDelayMs = 1500
    await b.bringToFront()
    await b.evaluate(() => window.__foreground())
    await b.touchscreen.tap(370, 430)
    await b.waitForTimeout(3000)
    cloud.getDelayMs = 0
    const bShown = await shown(b)
    await b.evaluate(() => window.__background())
    await b.waitForTimeout(1500)
    const local = await stored(b)
    if (trace) console.log('  puts', JSON.stringify(puts))
    assert(local.paragraph >= reached.paragraph, `stored place stays at or after ¶${reached.paragraph} (got ¶${local.paragraph})`)
    assert(cloud.state.books[BOOK].paragraphIndex >= reached.paragraph, `account place stays at or after ¶${reached.paragraph} (got ¶${cloud.state.books[BOOK].paragraphIndex})`)
    assert(bShown.paragraph >= reached.paragraph, `the woken tab shows ¶${reached.paragraph} or later (shows ¶${bShown.paragraph})`)
  } finally {
    await context.close()
  }
})

// The old tab is never told it was hidden or shown (iOS froze it) and the
// reader simply taps its page: the tap moves to the newer place, it never saves ¶158 + one page.
await scenario('silent-tap', async () => {
  const cloud = { state: recordAt(STALE, Date.now() - 60 * 60 * 1000) }
  const { context, puts } = await newContext(cloud)
  try {
    const b = await openReader(context, 'B')
    const a = await openReader(context, 'A')
    const reached = await readForward(a, 6)
    await a.waitForTimeout(1500)
    await b.bringToFront()
    await b.touchscreen.tap(370, 430)
    await b.waitForTimeout(2500)
    const bShown = await shown(b)
    await b.evaluate(() => window.__background())
    await b.waitForTimeout(1500)
    const local = await stored(b)
    if (trace) console.log('  puts', JSON.stringify(puts))
    assert(local.paragraph >= reached.paragraph, `stored place stays at or after ¶${reached.paragraph} (got ¶${local.paragraph})`)
    assert(cloud.state.books[BOOK].paragraphIndex >= reached.paragraph, `account place stays at or after ¶${reached.paragraph} (got ¶${cloud.state.books[BOOK].paragraphIndex})`)
    assert(bShown.paragraph >= reached.paragraph, `the tapped tab shows ¶${reached.paragraph} or later (shows ¶${bShown.paragraph})`)
  } finally {
    await context.close()
  }
})

// Two tabs on one device. B (older) is backgrounded at ¶158; A reads on; B wakes and is hidden again.
await scenario('two-tabs', async () => {
  const cloud = { state: recordAt(STALE, Date.now() - 60 * 60 * 1000) }
  const { context, puts } = await newContext(cloud)
  try {
    const b = await openReader(context, 'B')
    assert.equal((await shown(b)).paragraph >= STALE - 2 && (await shown(b)).paragraph <= STALE, true, `B opens near ¶${STALE}: ${JSON.stringify(await shown(b))}`)
    const bStart = await shown(b)
    await b.evaluate(() => window.__background())
    await b.waitForTimeout(500)
    const a = await openReader(context, 'A')
    const reached = await readForward(a, 6)
    assert(reached.paragraph > bStart.paragraph, `A read forward: ${JSON.stringify(reached)}`)
    await a.evaluate(() => window.__background())
    await a.waitForTimeout(1500)
    const afterA = await stored(a)
    assert.equal(afterA.paragraph, reached.paragraph, `A's place is stored: ${JSON.stringify(afterA)}`)
    // B wakes (the user switches back to the old tab), then is backgrounded again.
    await b.bringToFront()
    await b.evaluate(() => window.__foreground())
    await b.waitForTimeout(2500)
    const bShown = await shown(b)
    await b.evaluate(() => window.__background())
    await b.waitForTimeout(1500)
    const local = await stored(b)
    const cloudPlace = cloud.state.books[BOOK]
    if (trace) console.log('  puts', JSON.stringify(puts))
    assert.equal(local.paragraph, reached.paragraph, `stored place stays ¶${reached.paragraph} after the old tab woke (got ¶${local.paragraph})`)
    assert.equal(cloudPlace.paragraphIndex, reached.paragraph, `account place stays ¶${reached.paragraph} (got ¶${cloudPlace.paragraphIndex})`)
    assert.equal(bShown.paragraph, reached.paragraph, `the woken tab shows ¶${reached.paragraph} (shows ¶${bShown.paragraph})`)
    // A page turn in the woken tab continues from the newer place, never from its stale one.
    await b.evaluate(() => window.__foreground())
    const bTurn = await readForward(b, 1)
    const afterTurn = await stored(b)
    assert(afterTurn.paragraph >= reached.paragraph, `a turn in the woken tab continues from ¶${reached.paragraph} (stored ¶${afterTurn.paragraph}, shown ¶${bTurn.paragraph})`)
    // A fresh open lands on the newest place.
    const c = await openReader(context, 'C')
    const opened = await shown(c)
    assert(opened.paragraph >= reached.paragraph, `a new open lands at or after ¶${reached.paragraph} (¶${opened.paragraph})`)
  } finally {
    await context.close()
  }
})

// One tab: left at ¶158 into the back/forward cache while the same device read on elsewhere, then restored.
await scenario('bfcache', async () => {
  const cloud = { state: recordAt(STALE, Date.now() - 60 * 60 * 1000) }
  const { context } = await newContext(cloud)
  try {
    const b = await openReader(context, 'B')
    await b.evaluate(() => window.__bfcacheLeave())
    const a = await openReader(context, 'A')
    const reached = await readForward(a, 6)
    await a.evaluate(() => window.__bfcacheLeave())
    await a.waitForTimeout(1500)
    await a.close()
    await b.bringToFront()
    await b.evaluate(() => window.__bfcacheReturn())
    await b.waitForTimeout(2500)
    const bShown = await shown(b)
    await b.evaluate(() => window.__bfcacheLeave())
    await b.waitForTimeout(1500)
    const local = await stored(b)
    assert.equal(local.paragraph, reached.paragraph, `stored place stays ¶${reached.paragraph} after a restored tab (got ¶${local.paragraph})`)
    assert.equal(cloud.state.books[BOOK].paragraphIndex, reached.paragraph, `account place stays ¶${reached.paragraph} (got ¶${cloud.state.books[BOOK].paragraphIndex})`)
    assert.equal(bShown.paragraph, reached.paragraph, `the restored tab shows ¶${reached.paragraph} (shows ¶${bShown.paragraph})`)
    await b.reload({ waitUntil: 'domcontentloaded' })
    await b.waitForFunction(() => document.querySelector('.lab')?.dataset.readerReady === 'true', null, { timeout: 60000 })
    await b.waitForTimeout(1500)
    const reopened = await shown(b)
    assert.equal(reopened.paragraph, reached.paragraph, `a reload lands on ¶${reached.paragraph} (¶${reopened.paragraph})`)
  } finally {
    await context.close()
  }
})

// Brave "Forget me when I close this site": no local record, the account's newer place must open.
await scenario('fresh-device', async () => {
  const cloud = { state: recordAt(180, Date.now() - 5 * 60 * 1000) }
  const { context } = await newContext(cloud, { seedLocal: false })
  try {
    const page = await openReader(context, 'fresh')
    const opened = await shown(page)
    assert.equal(opened.chapter, CHAPTER, `fresh storage opens the account's chapter (${opened.chapter})`)
    assert(opened.paragraph <= 180 && opened.paragraph >= 170, `fresh storage opens at the account's page for ¶180 (¶${opened.paragraph})`)
  } finally {
    await context.close()
  }
})

await browser.close()
const failed = results.filter(([, status]) => status !== 'ok')
console.log(failed.length ? `\n${failed.length}/${results.length} scenarios failed` : `\nall ${results.length} scenarios passed`)
process.exit(failed.length ? 1 : 0)
