// A signed-in phone reader whose reader tab sleeps through a release (or a
// staged release that is rolled back) must wake at the place it slept on.
// Reported 17 Nov 2026 (iPhone, Brave): The Master and Margarita, modern-da
// compare original-ru, chapter 5 ¶48. The tab was opened at 13:04 on one
// bundle; #850 went live and was rolled back (~15:14-15:28), #851 went live
// at ~15:45; at 17:57 the tab showed chapter 5 from ¶0.
//
// Two real production builds are served by a local static server that can
// switch version mid-test, as a deploy does: the active build answers /reader
// (app.html), /data, /lab, ... and only its own content-hashed /assets/*; the
// other build's /assets/* 404 (as on Cloudflare). /api/lab-position is an
// in-memory account store merged with the server's own rule
// (mergeLabPositionStatesByTime, bundled from src/lab/labPosition.ts).
//
// Build each version in a scratch worktree (see the report on branch
// test/deploy-while-asleep for exact commands):
//   VITE_SHARED_READER_DEFAULT=1 SKIP_ENV_CHECK=1 VITE_AUDIO_BASE_URL=https://tinct.app CI=true \
//     VITE_SUPABASE_URL=https://qa.supabase.co VITE_SUPABASE_ANON_KEY=qa npm run build
// then:
//   cd app && OLD_DIST=/path/dist-7722734a52 NEW_DIST=/path/dist-be14775c32 node scripts/check-deploy-while-asleep.mjs
//
// Knobs: SCENARIOS=<comma list>, SW=1 (let the reader register /sw.js, as on
// the phone), TEST_TRACE=1 (every write to the device record and every
// account PUT, with stacks), BROWSER=chromium, PORT.
import assert from 'node:assert/strict'
import fs from 'node:fs'
import http from 'node:http'
import path from 'node:path'
import os from 'node:os'
import { createRequire } from 'node:module'
import esbuild from 'esbuild'
import { chromium, webkit, devices } from '@playwright/test'
import { markInternal } from './lib/internalTraffic.cjs'

const DISTS = { old: process.env.OLD_DIST, new: process.env.NEW_DIST }
if (!DISTS.old || !DISTS.new) throw new Error('Set OLD_DIST and NEW_DIST to two built app/dist folders')
const PORT = Number(process.env.PORT || 5297)
const origin = `http://127.0.0.1:${PORT}`
const BOOK = 'master-and-margarita'
const CHAPTER = 5
const PARAGRAPH = 48
const WORD = 74
const PAGE = 29
const USER = 'u-qa-reader'
const DEVICE = '07962cc1-0000-4000-8000-000000000000'
const trace = process.env.TEST_TRACE === '1'
const READER_MODE = process.env.READER_MODE === 'compare' ? 'compare' : 'read'
const allowSw = process.env.SW === '1'
const ALL = 'control-reload,deploy-wake-tap,deploy-discard,rollback-wake-tap,deploy-bfcache,deploy-wake-tap-slow,deploy-discard-slow,deploy-discard-colddata,deploy-discard-colddata-slow,deploy-discard-slowaccount-8s,deploy-discard-datamiss-404,deploy-discard-datamiss-503,deploy-lazy-chunk'
const scenarios = (process.env.SCENARIOS || ALL).split(',')

const merge = (() => {
  const out = fs.mkdtempSync(path.join(os.tmpdir(), 'tinct-deploy-asleep-'))
  esbuild.buildSync({ entryPoints: ['src/lab/labPosition.ts'], bundle: true, platform: 'node', format: 'cjs', outfile: path.join(out, 'lab-position.cjs'), logLevel: 'silent' })
  const loaded = createRequire(import.meta.url)(path.join(out, 'lab-position.cjs'))
  fs.rmSync(out, { recursive: true, force: true })
  return loaded
})()

// ---- The release: a static server whose active build can change mid-test.
const site = { active: 'old', cloud: null, getDelayMs: 0, dataDelayMs: 0, log: [] }
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.woff2': 'font/woff2', '.woff': 'font/woff', '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.ico': 'image/x-icon', '.txt': 'text/plain', '.xml': 'application/xml', '.webmanifest': 'application/manifest+json', '.mp3': 'audio/mpeg' }
const json = (res, status, body) => { res.writeHead(status, { 'content-type': 'application/json', 'cache-control': 'no-store' }); res.end(typeof body === 'string' ? body : JSON.stringify(body)) }

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, origin)
  const at = Date.now()
  if (url.pathname === '/api/lab-position') {
    if (req.method === 'PUT') {
      const chunks = []
      for await (const chunk of req) chunks.push(chunk)
      const incoming = merge.parseLabPositionState(JSON.parse(Buffer.concat(chunks).toString() || '{}'), DEVICE)
      site.cloud.state = { ...merge.mergeLabPositionStatesByTime(site.cloud.state, incoming, { requireSettleAcknowledgement: true }), owner: USER }
      const sent = incoming.books[BOOK]
      site.cloud.puts.push({ at, version: site.active, chapter: sent?.sequentialChapter, paragraph: sent?.paragraphIndex, updatedAt: sent?.updatedAt, kept: site.cloud.state.books[BOOK]?.paragraphIndex })
      return json(res, 200, site.cloud.state)
    }
    const body = JSON.stringify(site.cloud.state)
    if (site.getDelayMs) await new Promise(resolve => setTimeout(resolve, site.getDelayMs))
    return json(res, 200, body)
  }
  if (url.pathname === '/api/user-books/places') return json(res, 200, '{"places":{}}')
  if (url.pathname === '/api/user-books' || url.pathname === '/api/public-books') return json(res, 200, '{"books":[]}')
  if (url.pathname.startsWith('/api/')) return json(res, 404, '{}')
  // A cold cache after a release: the book text (new ?v=) comes over a slow phone network.
  if (site.dataDelayMs && (url.pathname.startsWith('/data/') || url.pathname.startsWith('/fonts/'))) await new Promise(resolve => setTimeout(resolve, site.dataDelayMs))
  // An edge that has not caught up with the release: the first chapter-text reads fail.
  if (site.failData > 0 && url.pathname.startsWith('/data/editions-chapters/master-and-margarita')) {
    site.failData -= 1
    site.log.push({ at, version: site.active, status: site.failStatus, path: url.pathname })
    res.writeHead(site.failStatus, { 'content-type': 'text/plain', 'cache-control': 'no-store' })
    return res.end('unavailable')
  }
  const dist = DISTS[site.active]
  let rel = decodeURIComponent(url.pathname)
  if (rel === '/reader' || rel === '/reader/') rel = '/app.html'
  else if (rel === '/') rel = '/index.html'
  let file = path.join(dist, path.normalize(rel).replace(/^(\.\.[/\\])+/, ''))
  if (!file.startsWith(dist)) { res.writeHead(403); return res.end() }
  if (!path.extname(file) && fs.existsSync(`${file}.html`)) file = `${file}.html`
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html')
  if (!fs.existsSync(file)) {
    site.log.push({ at, version: site.active, status: 404, path: url.pathname })
    res.writeHead(404, { 'content-type': 'text/plain', 'cache-control': 'no-store' })
    return res.end('not found')
  }
  const ext = path.extname(file)
  const cache = url.pathname.startsWith('/assets/') ? 'public, max-age=31536000, immutable' : ext === '.html' ? 'no-store' : 'public, max-age=0, must-revalidate'
  site.log.push({ at, version: site.active, status: 200, path: url.pathname })
  res.writeHead(200, { 'content-type': TYPES[ext] || 'application/octet-stream', 'cache-control': cache })
  fs.createReadStream(file).pipe(res)
})
await new Promise(resolve => server.listen(PORT, '127.0.0.1', resolve))
const deploy = version => { site.active = version; site.log.push({ at: Date.now(), deploy: version }) }

// ---- The reader's account and device record, as his were at 13:04.
const SESSION_AT = Date.now() - 5 * 60 * 60 * 1000
function placeAt(paragraphIndex, wordIndex, pageIndex, at, rev) {
  return {
    bookId: BOOK, headerBook: 'Mesteren og Margarita', chapterNumber: CHAPTER, sequentialChapter: CHAPTER,
    paragraphIndex, wordIndex, pageIndex, primaryEditionKey: 'modern-da', compareEditionKey: 'original-ru', readerMode: READER_MODE,
    updatedAt: at, deviceId: DEVICE, rev,
  }
}
function seedRecord() {
  const place = placeAt(PARAGRAPH, WORD, PAGE, SESSION_AT, 412)
  return {
    owner: USER, books: { [BOOK]: place },
    recentChapters: { [`${BOOK}:4`]: { ...placeAt(61, 0, 37, SESSION_AT - 86400000, 380), chapterNumber: 4, sequentialChapter: 4 }, [`${BOOK}:${CHAPTER}`]: place },
    finished: { [BOOK]: [1, 2, 3, 4] }, hidden: {},
    lastSettledBookId: BOOK, lastSettledAt: SESSION_AT, updatedAt: SESSION_AT, deviceId: DEVICE,
  }
}

const engine = process.env.BROWSER === 'chromium' ? chromium : webkit
const browser = await markInternal(await engine.launch({ headless: true }))
const iPhone = devices['iPhone 13']

async function newContext() {
  site.cloud = { state: seedRecord(), puts: [] }
  site.getDelayMs = 0
  site.dataDelayMs = 0
  site.failData = 0
  site.failStatus = 404
  site.log = []
  deploy('old')
  const { defaultBrowserType: _ignored, ...descriptor } = iPhone
  const context = await browser.newContext({
    ...descriptor,
    ...(process.env.BROWSER === 'chromium' ? {} : { isMobile: undefined }),
    serviceWorkers: allowSw ? 'allow' : 'block',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/27.2 Mobile/15E148 Safari/604.1 Brave',
  })
  // Supabase and every other host: refused, as in the stale-tab harness.
  await context.route(url => !url.href.startsWith(origin), route => route.request().url().includes('supabase.co')
    ? route.fulfill({ status: 503, contentType: 'application/json', body: '{}' })
    : route.abort())
  if (trace) await context.addInitScript(() => { window.__traceWrites = true })
  await context.addInitScript(({ user, device, seed }) => {
    let hidden = false
    Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => hidden ? 'hidden' : 'visible' })
    Object.defineProperty(document, 'hidden', { configurable: true, get: () => hidden })
    window.__background = () => { hidden = true; document.dispatchEvent(new Event('visibilitychange')); window.dispatchEvent(new Event('blur')) }
    window.__foreground = () => { hidden = false; document.dispatchEvent(new Event('visibilitychange')); window.dispatchEvent(new Event('focus')) }
    window.__bfcacheLeave = () => { hidden = true; window.dispatchEvent(new PageTransitionEvent('pagehide', { persisted: true })); document.dispatchEvent(new Event('visibilitychange')) }
    window.__bfcacheReturn = () => { hidden = false; window.dispatchEvent(new PageTransitionEvent('pageshow', { persisted: true })); document.dispatchEvent(new Event('visibilitychange')); window.dispatchEvent(new Event('focus')) }
    window.addEventListener('vite:preloadError', event => console.log(`vite:preloadError ${event.payload?.message || event.payload}`))
    const stackOf = () => new Error().stack.split('\n').slice(2, 10).map(line => line.replace(/https?:\/\/[^/]+\//, '').trim()).join(' < ')
    if (window.__traceWrites) {
      const setItem = Storage.prototype.setItem
      Storage.prototype.setItem = function (key, value) {
        if (key === 'tinct-lab-position') {
          try {
            const place = JSON.parse(value).books?.['master-and-margarita']
            console.log(`trace local-write ch${place?.sequentialChapter} ¶${place?.paragraphIndex} w${place?.wordIndex} at ${place?.updatedAt} ${stackOf()}`)
          } catch { /* not a record */ }
        }
        if (key === 'tinct:lab-reader-handoff' || key === 'tinct:stale-reload') console.log(`trace session ${key}=${String(value).slice(0, 200)}`)
        return setItem.call(this, key, value)
      }
      const fetchOriginal = window.fetch
      window.fetch = function (input, init) {
        if (String(input?.url ?? input).includes('/api/lab-position') && init?.method === 'PUT') {
          try {
            const place = JSON.parse(init.body).books?.['master-and-margarita']
            console.log(`trace PUT ch${place?.sequentialChapter} ¶${place?.paragraphIndex} at ${place?.updatedAt} keepalive=${Boolean(init.keepalive)} ${stackOf()}`)
          } catch { /* not a record */ }
        }
        return fetchOriginal.apply(this, arguments)
      }
    }
    if (localStorage.getItem('qa-seeded')) return
    localStorage.setItem('qa-seeded', '1')
    const now = Math.floor(Date.now() / 1000)
    localStorage.setItem('sb-qa-auth-token', JSON.stringify({ access_token: 'qa-token', refresh_token: 'qa-refresh', token_type: 'bearer', expires_in: 360000, expires_at: now + 360000, user: { id: user, email: 'reader@example.com', aud: 'authenticated', user_metadata: {} } }))
    document.cookie = 'tinct_auth=1; path=/'
    localStorage.setItem('tinct-lab-device-id', device)
    localStorage.setItem('tinct-lab-prefs', JSON.stringify({ primaryEdition: 'modern-da', audioEdition: 'modern-da', compareEdition: 'original-ru', compareOpen: true, compareChosen: true, fontSize: 1, fontSizeExplicit: true }))
    localStorage.setItem('tinct-lab-position', JSON.stringify(seed))
  }, { user: USER, device: DEVICE, seed: site.cloud.state })
  return context
}

function watch(page, label) {
  page.__loads = 0
  page.on('load', () => { page.__loads += 1; if (trace || page.__loads > 1) console.log(`  [${label}] load #${page.__loads} on ${site.active}`) })
  page.on('pageerror', error => { if (!/supabase\.co/.test(error.message)) console.log(`  [${label}] pageerror ${error.message.slice(0, 200)}`) })
  page.on('console', message => {
    const text = message.text()
    if (trace || /preloadError|Failed to fetch dynamically|Importing a module script failed|error loading dynamically/i.test(text)) console.log(`  [${label}] ${message.type()} ${text.slice(0, trace ? 900 : 240)}`)
  })
}

async function waitReady(page, timeout = 60000) {
  const until = Date.now() + timeout
  while (Date.now() < until) {
    try {
      const ready = await page.evaluate(() => document.querySelector('.lab')?.dataset.readerReady === 'true')
      if (ready) return
    } catch { /* navigating */ }
    await page.waitForTimeout(250)
  }
  throw new Error('reader never became ready')
}

async function openReader(context, label) {
  const page = await context.newPage()
  watch(page, label)
  await page.goto(`${origin}/reader`, { waitUntil: 'domcontentloaded' })
  await waitReady(page)
  await page.waitForTimeout(2000)
  return page
}

const shown = page => page.evaluate(() => {
  const root = document.querySelector('.lab')
  return { chapter: Number(root?.dataset.chapter), paragraph: Number((root?.dataset.place || '0:0').split(':')[0]), word: Number((root?.dataset.place || '0:0').split(':')[1]), page: document.querySelector('[data-page-label], .lab-page-number')?.textContent?.trim() ?? null }
})
const stored = page => page.evaluate(book => {
  const place = JSON.parse(localStorage.getItem('tinct-lab-position') || '{}').books?.[book]
  return place ? { chapter: place.sequentialChapter, paragraph: place.paragraphIndex, word: place.wordIndex, updatedAt: place.updatedAt } : null
}, BOOK)
const account = () => { const place = site.cloud.state.books[BOOK]; return { chapter: place.sequentialChapter, paragraph: place.paragraphIndex, word: place.wordIndex } }
const missing = since => site.log.filter(entry => entry.status === 404 && entry.at >= since).map(entry => `${entry.version}:${entry.path}`)

async function tap(page) {
  await page.touchscreen.tap(370, 430)
  await page.waitForTimeout(450)
}

// Waits out a stale-chunk reload (2.5 s after the 404) and the reader's own resolution.
async function settle(page, ms = 9000) {
  await page.waitForTimeout(ms)
  await waitReady(page)
  await page.waitForTimeout(2500)
}

async function report(name, page, since, expectParagraph = PARAGRAPH) {
  const s = await shown(page)
  const local = await stored(page)
  const cloud = account()
  const gone = missing(since)
  console.log(`  ${name}: shown ch${s.chapter} ¶${s.paragraph}:${s.word} | device ch${local?.chapter} ¶${local?.paragraph} | account ch${cloud.chapter} ¶${cloud.paragraph} | loads ${page.__loads} | 404s ${gone.length ? gone.join(' ') : 'none'}`)
  if (trace) console.log('  puts', JSON.stringify(site.cloud.puts))
  assert.equal(s.chapter, CHAPTER, `chapter ${CHAPTER} is shown (${s.chapter})`)
  assert(s.paragraph >= expectParagraph - 3, `shown place at or near ¶${expectParagraph} (¶${s.paragraph})`)
  assert(local.paragraph >= expectParagraph - 3, `device place at or near ¶${expectParagraph} (¶${local.paragraph})`)
  assert(cloud.paragraph >= expectParagraph - 3, `account place at or near ¶${expectParagraph} (¶${cloud.paragraph})`)
}

const results = []
async function scenario(name, run) {
  if (!scenarios.includes(name)) return
  console.log(`-- ${name}${allowSw ? ' (service worker on)' : ''}`)
  try {
    await run()
    results.push([name, 'ok'])
    console.log(`ok   ${name}`)
  } catch (error) {
    results.push([name, 'FAIL'])
    console.log(`FAIL ${name}: ${error.message.split('\n').slice(0, 6).join('\n     ')}`)
  }
}

// Opens on OLD at ¶48 and goes to sleep, as at 13:04.
async function sleepingTab(context) {
  const page = await openReader(context, 'tab')
  const opened = await shown(page)
  if (allowSw) {
    await page.waitForFunction(() => Boolean(navigator.serviceWorker?.controller), null, { timeout: 20000 }).catch(() => {})
    console.log(`  service worker controls the tab: ${await page.evaluate(() => Boolean(navigator.serviceWorker?.controller))}`)
  }
  console.log(`  opened on old: ch${opened.chapter} ¶${opened.paragraph}:${opened.word}`)
  assert.equal(opened.chapter, CHAPTER)
  assert(Math.abs(opened.paragraph - PARAGRAPH) <= 3, `opens at ¶${PARAGRAPH} (¶${opened.paragraph})`)
  await page.evaluate(() => window.__background())
  await page.waitForTimeout(1500)
  return page
}

async function wakeAndTap(page) {
  await page.evaluate(() => { window.__foreground(); window.dispatchEvent(new PageTransitionEvent('pageshow', { persisted: false })) })
  await page.waitForTimeout(300)
  await tap(page)
}

// Control: one version, a plain reload keeps the place.
await scenario('control-reload', async () => {
  const context = await newContext()
  try {
    const page = await sleepingTab(context)
    const since = Date.now()
    await page.evaluate(() => window.__foreground())
    await page.reload({ waitUntil: 'domcontentloaded' })
    await settle(page, 1000)
    await report('control-reload', page, since)
  } finally { await context.close() }
})

// 1. Deploy while the tab sleeps; wake and tap.
await scenario('deploy-wake-tap', async () => {
  const context = await newContext()
  try {
    const page = await sleepingTab(context)
    deploy('new')
    const since = Date.now()
    await wakeAndTap(page)
    await settle(page)
    await report('deploy-wake-tap', page, since)
  } finally { await context.close() }
})

// 2. iOS discarded the tab: after the deploy it is loaded afresh (new bundle), same storage.
await scenario('deploy-discard', async () => {
  const context = await newContext()
  try {
    const page = await sleepingTab(context)
    deploy('new')
    const since = Date.now()
    await page.evaluate(() => window.__foreground())
    await page.goto(`${origin}/reader`, { waitUntil: 'domcontentloaded' })
    await settle(page, 1000)
    await report('deploy-discard', page, since)
  } finally { await context.close() }
})

// 3. Staged then rolled back: old -> new (the tab reloads onto new) -> old, then wake and tap.
await scenario('rollback-wake-tap', async () => {
  const context = await newContext()
  try {
    const page = await sleepingTab(context)
    deploy('new')
    const since = Date.now()
    await wakeAndTap(page)
    await settle(page)
    const mid = await shown(page)
    console.log(`  after the staged release: ch${mid.chapter} ¶${mid.paragraph} (loads ${page.__loads})`)
    await page.evaluate(() => window.__background())
    await page.waitForTimeout(1500)
    deploy('old')
    await wakeAndTap(page)
    await settle(page)
    await report('rollback-wake-tap', page, since)
  } finally { await context.close() }
})

// 4. The old page comes back from the back/forward cache after the deploy.
await scenario('deploy-bfcache', async () => {
  const context = await newContext()
  try {
    const page = await openReader(context, 'tab')
    await page.evaluate(() => window.__bfcacheLeave())
    await page.waitForTimeout(1500)
    deploy('new')
    const since = Date.now()
    await page.evaluate(() => window.__bfcacheReturn())
    await page.waitForTimeout(500)
    await tap(page)
    await settle(page)
    await report('deploy-bfcache', page, since)
  } finally { await context.close() }
})

// 5. As 1 and 2 with the account read taking 4 s.
await scenario('deploy-wake-tap-slow', async () => {
  const context = await newContext()
  try {
    const page = await sleepingTab(context)
    deploy('new')
    site.getDelayMs = 4000
    const since = Date.now()
    await wakeAndTap(page)
    await settle(page, 12000)
    await report('deploy-wake-tap-slow', page, since)
  } finally { await context.close() }
})
await scenario('deploy-discard-slow', async () => {
  const context = await newContext()
  try {
    const page = await sleepingTab(context)
    deploy('new')
    site.getDelayMs = 4000
    const since = Date.now()
    await page.evaluate(() => window.__foreground())
    await page.goto(`${origin}/reader`, { waitUntil: 'domcontentloaded' })
    await settle(page, 6000)
    await report('deploy-discard-slow', page, since)
  } finally { await context.close() }
})

// 5b. The tab is discarded and reloads after the release on a slow network: the
// book text (cold under the new build's ?v=) and the account read both take seconds.
for (const [name, dataMs, getMs] of [['deploy-discard-colddata', 5000, 0], ['deploy-discard-colddata-slow', 5000, 4000], ['deploy-discard-slowaccount-8s', 0, 8000]]) {
  await scenario(name, async () => {
    const context = await newContext()
    try {
      const page = await sleepingTab(context)
      deploy('new')
      site.dataDelayMs = dataMs
      site.getDelayMs = getMs
      const since = Date.now()
      await page.evaluate(() => window.__foreground())
      await page.goto(`${origin}/reader`, { waitUntil: 'domcontentloaded' })
      await settle(page, 12000)
      await report(name, page, since)
    } finally { await context.close() }
  })
}

// 5c. The reload after the release meets an edge that has not caught up: the chapter text fails a few times.
for (const [name, fails, status] of [['deploy-discard-datamiss-404', 3, 404], ['deploy-discard-datamiss-503', 6, 503]]) {
  await scenario(name, async () => {
    const context = await newContext()
    try {
      const page = await sleepingTab(context)
      deploy('new')
      site.failData = fails
      site.failStatus = status
      const since = Date.now()
      await page.evaluate(() => window.__foreground())
      await page.goto(`${origin}/reader`, { waitUntil: 'domcontentloaded' })
      await settle(page, 12000)
      await report(name, page, since)
    } finally { await context.close() }
  })
}

// 6a. Force the stale-chunk path: the woken old tab asks for a lazy chunk it never
// loaded (the contents / menu), which 404s and reloads the page through staleChunkRecovery.
await scenario('deploy-lazy-chunk', async () => {
  const context = await newContext()
  try {
    const page = await sleepingTab(context)
    const loaded = new Set(site.log.filter(entry => entry.status === 200 && entry.path.startsWith('/assets/')).map(entry => entry.path))
    const lazy = fs.readdirSync(path.join(DISTS.old, 'assets')).filter(file => file.endsWith('.js') && !loaded.has(`/assets/${file}`))
    console.log(`  old tab loaded ${loaded.size} assets; ${lazy.length} lazy chunks never fetched`)
    deploy('new')
    const since = Date.now()
    await page.evaluate(() => window.__foreground())
    // The app's own dynamic import wrapper (vite preload) for a chunk this tab never fetched.
    // With the service worker every lazy chunk was precached; ask for one the new build never had.
    const chunk = lazy.find(file => /^(labAsk|LabContents|MarginPreview|UserBookReader)/.test(file)) || lazy[0] || 'labAsk-gone0000.js'
    const outcome = await page.evaluate(async src => {
      try { await import(src); return 'imported' } catch (error) { window.dispatchEvent(Object.assign(new Event('vite:preloadError', { cancelable: true }), { payload: error })); return `failed: ${error.message}` }
    }, `/assets/${chunk}`)
    console.log(`  import /assets/${chunk}: ${outcome}`)
    await settle(page)
    await report('deploy-lazy-chunk', page, since)
  } finally { await context.close() }
})

// 6b. Probe, not in the default list (SCENARIOS=stale-handoff): a chapter-only
// handoff (no paragraph, no resumeLatest) present in sessionStorage at reload.
// It opens the chapter at ¶0 and writes ¶0 with a fresh clock to the device and
// the account (the explicit-open path, LabApp handoffPlace). It fails by design:
// no current writer produces such a handoff (library, switchers and deep links
// all carry a paragraph, and the handoff is consumed on first read), so it is
// the only ¶0 path found, not a reproduction of 17 Nov.
await scenario('stale-handoff', async () => {
  const context = await newContext()
  try {
    const page = await sleepingTab(context)
    deploy('new')
    const since = Date.now()
    await page.evaluate(() => {
      window.__foreground()
      sessionStorage.setItem('tinct:lab-reader-handoff', JSON.stringify({ kind: 'open-reader', bookId: 'master-and-margarita', primaryEditionKey: 'modern-da', compareEditionKey: 'original-ru', savedPlace: { bookId: 'master-and-margarita', chapterNumber: 5 }, createdAt: Date.now() - 4 * 3600 * 1000 }))
    })
    await page.goto(`${origin}/reader`, { waitUntil: 'domcontentloaded' })
    await settle(page, 1000)
    await report('stale-handoff', page, since)
  } finally { await context.close() }
})

await browser.close()
server.close()
const failed = results.filter(([, status]) => status !== 'ok')
console.log(failed.length ? `\n${failed.length}/${results.length} scenarios failed` : `\nall ${results.length} scenarios passed`)
process.exit(failed.length ? 1 : 0)
