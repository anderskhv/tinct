// The library's memory budget (2026-10-21). On an iPhone and an iPad, signed in, tapping The Jungle
// Book in the library opened its cover flap and then Safari killed the tab ("A problem repeatedly
// occurred"): the library held every shelf's covers painted and decoded, and opening a book tipped
// it over the tab's limit. This check loads the built library (dist/) in headless Chromium at an
// iPhone's and an iPad's size and pixel ratio, signed out and with a faked signed-in reader (no
// network: Supabase and the API are answered here), and fails when the pixels the page holds at
// rest, the JavaScript heap at rest, or the pixels added by opening a book exceed their budgets.
//
// Pixels held: every loaded <img> and JS-held image (decoded at its natural size), every canvas
// with a context (its backing store), every ImageBitmap not closed, and every CSS background on a
// rendered element; width × height × 4 bytes each. Measured after garbage collection.
//
// Run after `npm run build` from app/: node scripts/check-library-memory.mjs
// LIBRARY_MEMORY_ORIGIN=http://127.0.0.1:<port> measures a library already served there instead
// (a local server of another build; never production).
// LIBRARY_MEMORY_ARTIFACTS=<dir> also writes the report and a screenshot of each state.
// LIBRARY_MEMORY_WEBKIT=1 also samples Linux WebKit's process memory through the opening (local only).
import { chromium, webkit } from '@playwright/test'
import { readFileSync, readdirSync } from 'node:fs'
import { createServer } from 'node:http'
import fs from 'node:fs/promises'
import path from 'node:path'
import { markInternal } from './lib/internalTraffic.cjs'

const MB = 1024 * 1024
// Budgets per screen, from the library after the 2026-10-21 fix plus headroom (measured: iPhone
// 34 MB signed out and 47 MB signed in at rest, 50 and 62 MB scrolled to The Jungle Book; iPad 48 and
// 65 MB at rest, 86 and 99 MB scrolled). Before the fix: iPhone 116 and 82 MB at rest, 161 and 134 MB
// scrolled; iPad 126 and 100 MB at rest, 194 and 167 MB scrolled.
const BUDGET = {
  iphone: { restPixelsMB: 60, scrolledPixelsMB: 80 },
  ipad: { restPixelsMB: 85, scrolledPixelsMB: 120 },
  restHeapMB: 16, // measured 6-7 MB
  openAddedPixelsMB: 25, // measured 6-8 MB
  // Chromium's layer and image memory (tiles, decoded images at raster, canvases, GPU images), its
  // highest while the cover turns, less before the tap. Sampled from memory dumps, so it varies a lot
  // between runs (2-85 MB on the same build); the budget catches only a gross regression.
  openPeakGraphicsMB: 150,
  // With LIBRARY_MEMORY_WEBKIT=1 (Linux WebKit, iPhone signed in): the WebContent process's resident
  // memory, its highest while the book opens, less before the tap. Measured 165-205 MB before and after
  // the 2026-10-21 flap change (Linux WebKit paints in software, so this overstates an iPhone); a local
  // measurement, not run in CI.
  webkitOpenPeakMB: 260,
}
const DIST = path.resolve('dist')
const ARTIFACTS = process.env.LIBRARY_MEMORY_ARTIFACTS || ''
const USER = '00000000-0000-4000-8000-0000000c0de1'
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

const SIZES = {
  iphone: { viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true, userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1' },
  ipad: { viewport: { width: 820, height: 1180 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, userAgent: 'Mozilla/5.0 (iPad; CPU OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1' },
}

const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.jpg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.mp4': 'video/mp4', '.webm': 'video/webm', '.wav': 'audio/wav' }
/** dist/ on a local port, with the Worker's /library route. */
function serve() {
  const server = createServer(async (req, res) => {
    let pathname = decodeURIComponent(new URL(req.url, 'http://local').pathname)
    if (['/', '/library', '/library/'].includes(pathname)) pathname = '/lab/library_2/index.html'
    if (pathname.endsWith('/')) pathname += 'index.html'
    const file = path.join(DIST, path.normalize(pathname))
    try {
      if (!file.startsWith(DIST + path.sep) || !(await fs.stat(file)).isFile()) throw new Error('missing')
      res.writeHead(200, { 'content-type': TYPES[path.extname(file)] || 'application/octet-stream' })
      res.end(await fs.readFile(file))
    } catch { res.writeHead(404); res.end() }
  })
  return new Promise(resolve => server.listen(0, '127.0.0.1', () => resolve(server)))
}

/** The Supabase project the build was made for: the page keeps its session under sb-<ref>-auth-token. */
async function supabaseHost() {
  for (const name of await fs.readdir(path.join(DIST, 'assets'))) {
    if (!name.endsWith('.js')) continue
    const match = (await fs.readFile(path.join(DIST, 'assets', name), 'utf8')).match(/https:\/\/([a-z0-9]+)\.supabase\.co/)
    if (match) return { host: `${match[1]}.supabase.co`, ref: match[1] }
  }
  return null
}

// Before any page script: weak references to every image, canvas and bitmap the page makes.
function track() {
  const T = window.__memoryTrack = { images: new Set(), canvases: new Set(), bitmaps: new Set(), closed: new WeakSet() }
  const keep = (set, value) => { try { set.add(new WeakRef(value)) } catch { /* no WeakRef */ } }
  for (const name of ['src', 'srcset']) {
    const own = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, name)
    Object.defineProperty(HTMLImageElement.prototype, name, { configurable: true, get() { return own.get.call(this) }, set(value) { if (!this.__tracked) { this.__tracked = true; keep(T.images, this) } own.set.call(this, value) } })
  }
  const getContext = HTMLCanvasElement.prototype.getContext
  HTMLCanvasElement.prototype.getContext = function (...args) { if (!this.__tracked) { this.__tracked = true; keep(T.canvases, this) } return getContext.apply(this, args) }
  if (window.OffscreenCanvas) { const offscreen = OffscreenCanvas.prototype.getContext; OffscreenCanvas.prototype.getContext = function (...args) { if (!this.__tracked) { this.__tracked = true; keep(T.canvases, this) } return offscreen.apply(this, args) } }
  const createBitmap = window.createImageBitmap
  if (createBitmap) window.createImageBitmap = function (...args) { return createBitmap.apply(this, args).then(bitmap => { keep(T.bitmaps, bitmap); return bitmap }) }
  if (window.ImageBitmap) { const close = ImageBitmap.prototype.close; ImageBitmap.prototype.close = function () { T.closed.add(this); return close.call(this) } }
}

// In the page: the pixels it holds, by surface.
async function census() {
  const T = window.__memoryTrack, items = []
  const live = set => [...(set || [])].map(ref => ref.deref()).filter(Boolean)
  const name = src => String(src || '').replace(location.origin, '').slice(0, 120)
  for (const image of new Set([...document.images, ...live(T?.images)])) if (image.complete && image.naturalWidth) items.push({ kind: 'img', src: name(image.currentSrc || image.src), w: image.naturalWidth, h: image.naturalHeight })
  for (const canvas of new Set([...document.querySelectorAll('canvas'), ...live(T?.canvases)])) if (canvas.__tracked && canvas.width && canvas.height) items.push({ kind: 'canvas', src: (canvas.id ? '#' + canvas.id : '') + (canvas.dataset?.book ? ' ' + canvas.dataset.book : ''), w: canvas.width, h: canvas.height })
  for (const bitmap of live(T?.bitmaps)) if (!T.closed.has(bitmap) && bitmap.width) items.push({ kind: 'bitmap', src: '', w: bitmap.width, h: bitmap.height })
  const backgrounds = new Set()
  for (const element of document.querySelectorAll('*')) for (const pseudo of [null, '::before', '::after']) {
    const style = getComputedStyle(element, pseudo)
    if (style.display === 'none' || !style.backgroundImage.includes('url(') || element.closest('[hidden]') || !element.getClientRects().length) continue
    for (const match of style.backgroundImage.matchAll(/url\("?([^")]+)"?\)/g)) backgrounds.add(match[1])
  }
  for (const src of backgrounds) {
    const image = new Image(); image.__tracked = true; image.src = src
    try { await image.decode() } catch { continue }
    items.push({ kind: 'css', src: name(src), w: image.naturalWidth, h: image.naturalHeight })
  }
  for (const item of items) item.bytes = item.w * item.h * 4
  return items.sort((a, b) => b.bytes - a.bytes)
}

async function measure(page, cdp) {
  for (let i = 0; i < 3; i++) await cdp.send('HeapProfiler.collectGarbage')
  const metrics = Object.fromEntries((await cdp.send('Performance.getMetrics')).metrics.map(m => [m.name, m.value]))
  const items = await page.evaluate(`(${census})()`)
  const pixels = items.reduce((sum, item) => sum + item.bytes, 0)
  return { pixelsMB: +(pixels / MB).toFixed(1), heapMB: +(metrics.JSHeapUsedSize / MB).toFixed(1), nodes: metrics.Nodes, top: items.slice(0, 12).map(item => `${item.kind} ${item.w}×${item.h} ${(item.bytes / MB).toFixed(1)} MB ${item.src}`) }
}

/** Chromium's graphics memory in MB, from a memory dump: tiles, decoded images at raster, canvases, GPU images. */
async function graphicsMB(browserCdp) {
  const events = []
  const collect = event => events.push(...event.value)
  browserCdp.on('Tracing.dataCollected', collect)
  const done = new Promise(resolve => browserCdp.once('Tracing.tracingComplete', resolve))
  await browserCdp.send('Tracing.start', { traceConfig: { includedCategories: ['disabled-by-default-memory-infra'], excludedCategories: ['*'], memoryDumpConfig: { triggers: [] } }, transferMode: 'ReportEvents' })
  await browserCdp.send('Tracing.requestMemoryDump', { deterministic: false, levelOfDetail: 'light' })
  await browserCdp.send('Tracing.end')
  await done
  browserCdp.off('Tracing.dataCollected', collect)
  const size = dump => (dump?.attrs?.size ? parseInt(dump.attrs.size.value, 16) : 0)
  let bytes = 0
  for (const event of events) {
    const allocators = event.args?.dumps?.allocators
    if (allocators) for (const name of ['cc/tile_memory', 'cc/image_memory', 'canvas', 'gpu/shared_images', 'gpu/gl']) bytes += size(allocators[name])
  }
  return +(bytes / MB).toFixed(1)
}

/** A context showing /library as a guest or as a faked signed-in reader; nothing leaves this machine. */
async function libraryContext(browser, origin, size, signedIn, supabase) {
  const context = await browser.newContext({ ...SIZES[size], ...(browser.browserType().name() === 'chromium' ? {} : { isMobile: false }), baseURL: origin, serviceWorkers: 'block', reducedMotion: 'no-preference' })
  await context.route(url => /^https?:$/.test(url.protocol) && url.origin !== origin && url.hostname !== supabase?.host, route => route.abort())
  await context.route(`${origin}/api/**`, route => route.fulfill({ status: 204, body: '' }))
  if (signedIn) {
    if (!supabase) throw new Error('The build names no Supabase project: the signed-in library cannot be faked')
    const at = Date.now() - 5 * 86400000
    const place = (bookId, chapterNumber, paragraphIndex) => ({ bookId, headerBook: bookId, chapterNumber, sequentialChapter: chapterNumber, paragraphIndex, wordIndex: 0, pageIndex: 0, primaryEditionKey: 'original-en', updatedAt: at, deviceId: 'device-memory-check', rev: 1 })
    const record = { books: { frankenstein: place('frankenstein', 3, 5), 'pride-and-prejudice': place('pride-and-prejudice', 7, 2), odyssey: place('odyssey', 4, 1), 'crime-and-punishment': place('crime-and-punishment', 2, 3) }, finished: {}, owner: USER, hidden: {}, lastSettledBookId: 'frankenstein', lastSettledAt: at, updatedAt: at, deviceId: 'device-memory-check' }
    const exp = Math.floor(Date.now() / 1000) + 3600
    const b64 = value => Buffer.from(JSON.stringify(value)).toString('base64url')
    const user = { id: USER, aud: 'authenticated', role: 'authenticated', email: 'reader@example.com', app_metadata: {}, user_metadata: {}, created_at: '2026-10-01T00:00:00Z' }
    const session = { access_token: `${b64({ alg: 'HS256', typ: 'JWT' })}.${b64({ sub: USER, exp, role: 'authenticated' })}.fixture`, refresh_token: 'fixture', token_type: 'bearer', expires_in: 3600, expires_at: exp, user }
    await context.addCookies([{ name: 'tinct_auth', value: '1', url: origin }])
    await context.addInitScript(({ key, session, record }) => { try { localStorage.setItem(key, session); localStorage.setItem('tinct-lab-position', record) } catch { /* private */ } }, { key: `sb-${supabase.ref}-auth-token`, session: JSON.stringify(session), record: JSON.stringify(record) })
    await context.route(`${origin}/api/lab-position**`, route => route.request().method() === 'GET' ? route.fulfill({ json: record }) : route.fulfill({ status: 204, body: '' }))
    await context.route(`https://${supabase.host}/**`, route => new URL(route.request().url()).pathname.startsWith('/auth/v1/user') ? route.fulfill({ json: user }) : route.fulfill({ json: [] }))
  }
  return context
}

/** Loads the library and waits for it to settle. */
async function settle(page, signedIn) {
  await page.goto('/library', { waitUntil: 'load' })
  await page.waitForFunction(() => document.querySelectorAll('#shelves .shelf').length > 5 && document.documentElement.classList.contains('library-ready'), null, { timeout: 60000 })
  if (signedIn) await page.waitForFunction(() => window.__library2Reading?.reading?.length > 0, null, { timeout: 30000 })
  await page.waitForLoadState('networkidle').catch(() => {})
  await sleep(6000)
}

/** The Jungle Book on its shelf, brought on screen as the reader had it. */
async function jungleBook(page) {
  const book = page.locator('#shelves .book-card[aria-label^="Open The Jungle Book"]').first()
  await book.evaluate(el => el.closest('.shelf').scrollIntoView({ block: 'center' }))
  await book.scrollIntoViewIfNeeded()
  await sleep(1500)
  return book
}

async function run(browser, origin, size, signedIn, supabase) {
  const context = await libraryContext(browser, origin, size, signedIn, supabase)
  await context.addInitScript(track)
  const page = await context.newPage()
  const cdp = await context.newCDPSession(page)
  const browserCdp = await browser.newBrowserCDPSession()
  await cdp.send('Performance.enable')
  await settle(page, signedIn)
  const label = `${size}-${signedIn ? 'signed-in' : 'signed-out'}`
  const rest = await measure(page, cdp)
  if (ARTIFACTS) await page.screenshot({ path: path.join(ARTIFACTS, `${label}-rest.png`) })
  // Open The Jungle Book from its shelf, as the reader did, sampling memory through the opening.
  const book = await jungleBook(page)
  const scrolled = await measure(page, cdp)
  const graphicsBefore = await graphicsMB(browserCdp)
  await book.click()
  await page.waitForFunction(() => !document.getElementById('book-overlay').hidden, null, { timeout: 30000 })
  let graphicsPeak = graphicsBefore
  for (const until = Date.now() + 2500; Date.now() < until;) graphicsPeak = Math.max(graphicsPeak, await graphicsMB(browserCdp))
  await sleep(2500)
  const open = await measure(page, cdp)
  if (ARTIFACTS) await page.screenshot({ path: path.join(ARTIFACTS, `${label}-open.png`) })
  await browserCdp.detach()
  await context.close()
  return { label, rest, scrolled, open, openAddedPixelsMB: +(open.pixelsMB - scrolled.pixelsMB).toFixed(1), openPeakGraphicsMB: +(graphicsPeak - graphicsBefore).toFixed(1) }
}

/** Resident memory (MB) of the WebKit web content processes under `pid` (Linux /proc). */
function webContentMB(pid) {
  const children = parent => readdirSync('/proc').filter(entry => /^\d+$/.test(entry)).filter(entry => { try { const stat = readFileSync(`/proc/${entry}/stat`, 'utf8'); return +stat.slice(stat.lastIndexOf(')') + 2).split(' ')[1] === parent } catch { return false } }).map(Number)
  const tree = root => [root, ...children(root).flatMap(tree)]
  let kb = 0
  for (const process of tree(pid)) { try { const status = readFileSync(`/proc/${process}/status`, 'utf8'); if (/^Name:\s+\S*WebProcess/m.test(status)) kb += +(status.match(/^VmRSS:\s+(\d+)/m)?.[1] || 0) } catch { /* gone */ } }
  return Math.round(kb / 1024)
}

/** Linux WebKit, iPhone, signed in: WebContent memory before the tap and its peak while the book opens. */
async function webkitOpening(origin, supabase) {
  const server = await webkit.launchServer({ headless: true })
  const pid = server.process().pid
  const browser = await markInternal(await webkit.connect(server.wsEndpoint()))
  try {
    const context = await libraryContext(browser, origin, 'iphone', true, supabase)
    const page = await context.newPage()
    await settle(page, true)
    const book = await jungleBook(page)
    const before = webContentMB(pid)
    await book.click()
    let peak = before
    for (const until = Date.now() + 5000; Date.now() < until; await sleep(100)) peak = Math.max(peak, webContentMB(pid))
    return { before, peak, openPeakMB: peak - before }
  } finally { await browser.close(); await server.close() }
}

const external = process.env.LIBRARY_MEMORY_ORIGIN || ''
if (external && !/^http:\/\/(127\.0\.0\.1|localhost)(:\d+)?$/.test(external)) throw new Error('LIBRARY_MEMORY_ORIGIN must be a local server')
const server = external ? null : await serve()
const origin = external || `http://127.0.0.1:${server.address().port}`
const browser = await markInternal(await chromium.launch({ headless: true, args: ['--mute-audio'], ...(process.env.PW_CHROMIUM_EXECUTABLE ? { executablePath: process.env.PW_CHROMIUM_EXECUTABLE } : {}) }))
const failures = [], results = []
let webkitResult = null
try {
  if (ARTIFACTS) await fs.mkdir(ARTIFACTS, { recursive: true })
  const supabase = await supabaseHost()
  for (const size of Object.keys(SIZES)) for (const signedIn of [false, true]) {
    const result = await run(browser, origin, size, signedIn, supabase)
    results.push(result)
    const over = (value, budget, what) => { if (value > budget) failures.push(`${result.label}: ${what} ${value} MB is over its ${budget} MB budget`) }
    over(result.rest.pixelsMB, BUDGET[size].restPixelsMB, 'pixels held at rest')
    over(result.scrolled.pixelsMB, BUDGET[size].scrolledPixelsMB, 'pixels held scrolled to The Jungle Book')
    over(result.rest.heapMB, BUDGET.restHeapMB, 'JavaScript heap at rest')
    over(result.openAddedPixelsMB, BUDGET.openAddedPixelsMB, 'pixels added by opening a book')
    over(result.openPeakGraphicsMB, BUDGET.openPeakGraphicsMB, 'graphics memory added at the peak of the opening')
    console.log(`${result.label}: at rest ${result.rest.pixelsMB} MB of pixels, ${result.rest.heapMB} MB heap; scrolled ${result.scrolled.pixelsMB} MB; a book open ${result.open.pixelsMB} MB (+${result.openAddedPixelsMB}); graphics peak while opening +${result.openPeakGraphicsMB} MB`)
  }
  if (process.env.LIBRARY_MEMORY_WEBKIT === '1') {
    webkitResult = await webkitOpening(origin, supabase)
    if (webkitResult.openPeakMB > BUDGET.webkitOpenPeakMB) failures.push(`webkit iphone-signed-in: opening peak +${webkitResult.openPeakMB} MB is over its ${BUDGET.webkitOpenPeakMB} MB budget`)
    console.log(`webkit iphone-signed-in: ${webkitResult.before} MB before the tap, ${webkitResult.peak} MB at the opening's peak (+${webkitResult.openPeakMB})`)
  }
  if (ARTIFACTS) await fs.writeFile(path.join(ARTIFACTS, 'library-memory.json'), JSON.stringify({ budget: BUDGET, results, webkit: webkitResult }, null, 2))
} finally {
  await browser.close()
  server?.close()
}
if (failures.length) {
  for (const result of results) console.log(`\n${result.label} at rest, largest:\n  ${result.rest.top.join('\n  ')}`)
  console.error(`\nLibrary memory over budget:\n  ${failures.join('\n  ')}`)
  process.exit(1)
}
console.log('Library memory within budget', JSON.stringify(BUDGET))
