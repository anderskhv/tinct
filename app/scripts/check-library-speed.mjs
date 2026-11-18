// How fast the library is on a phone (2026-10-21). Anders: "the library just works too slowly …
// a library that's fast to navigate, doesn't take seconds to load, and buttons that respond
// instantaneously". This script measures it, repeatably, so each change can be judged by numbers.
//
// It serves the built app (dist/) on a local port the way the Worker does (the library page and
// the reader page uncached, tagged scripts and paintings kept for a day, everything else
// revalidated with an ETag, text gzipped), fakes a signed-in reader with books on the desk (no
// request leaves this machine: Supabase is answered inside the page, /api/ by this server, and
// every other host is refused: the server is the browsers' proxy), and drives:
//   - Chromium as an iPhone 13 (390×844 at 3×, touch) with the CPU slowed 4× and a phone network
//     (60 ms round trip, 9 Mbit/s down);
//   - WebKit at the same size (Linux WebKit: no CPU slowdown or bandwidth cap is possible, each
//     response is delayed 60 ms by the server instead).
// Request interception is not used: Playwright turns off the browser's HTTP cache when it routes,
// and the warm load is what the cache is for.
//
// Reported, per browser (the median of LIBRARY_SPEED_RUNS runs, default 3):
//   - the library's first useful paint (the desk with its books, or the hero with its title and
//     cover) and its time to interactive (ready, then 300 ms without a long task), cold and warm;
//   - every library button's tap response: pointerdown to the next paint (Event Timing, the
//     slowest of the tap's pointer and click events, split into input delay / handlers / paint; a
//     frame probe where a browser lacks it) and pointerdown to the frame that shows what the button
//     is for (menu open, search open, introduction open, …);
//   - a book on the desk: the tap's visible answer, the reader's first text (once with the reader's
//     code not yet cached, once cached and tapped as soon as the desk shows), and the reader's
//     Library back to the library's desk;
//   - at rest: the main thread's busy share, long tasks, and each frame's script work (mean, p95);
//   - long tasks over 50 ms per phase (WebKit: frame gaps over 50 ms instead), the requests made
//     before the first useful paint (count, bytes, waterfall), image bytes with each shown image's
//     size against its displayed size, and the JavaScript loaded for the library.
//
// Run after `npm run build` from app/: node scripts/check-library-speed.mjs
//   LIBRARY_SPEED_BROWSERS=chromium|webkit|chromium,webkit (default both)
//   LIBRARY_SPEED_RUNS=<n> (default 3)    LIBRARY_SPEED_PORT=<port> (default 5970; it is also the browsers' proxy, which refuses every other host)
//   LIBRARY_SPEED_OUT=<file.json> writes the full report (waterfalls included)
//   LIBRARY_SPEED_DIST=<dir> measures another build (default dist/), e.g. a copy of the build before a change
//   Diagnostics: LIBRARY_SPEED_QUICK=1 (loads and rest only), LIBRARY_SPEED_PROFILE=1 (CPU profile at rest),
//   LIBRARY_SPEED_PROFILE_TAP=<tap name prefix> (CPU profile of that tap), LIBRARY_SPEED_INITIATORS=1 (what started each API request), LIBRARY_SPEED_REDUCED=1 (reduced motion),
//   LIBRARY_SPEED_SHOTS=<dir> (screenshots), LIBRARY_SPEED_DEBUG=1 (page errors), LIBRARY_SPEED_CHROMIUM_ARGS
//   LIBRARY_SPEED_STRICT=1 exits 1 when a target is missed (targets below)
// It reports; it does not gate CI (timings depend on the machine).
//
// Reading the numbers: headless Chromium and Linux WebKit paint canvases in software on the main
// thread, so the library's animated room (one full-screen canvas) costs far more here than on an
// iPhone, where canvas drawing is accelerated. Network waits, script work and the order of things
// are what transfer to a phone; frame and paint times overstate it. Compare builds on one machine.
import { chromium, webkit } from '@playwright/test'
import { createServer } from 'node:http'
import { createHash } from 'node:crypto'
import { gzipSync } from 'node:zlib'
import fs from 'node:fs/promises'
import path from 'node:path'
import { markInternal } from './lib/internalTraffic.cjs'

const DIST = path.resolve(process.env.LIBRARY_SPEED_DIST || 'dist')
const PORT = Number(process.env.LIBRARY_SPEED_PORT || 5970)
const RUNS = Math.max(1, Number(process.env.LIBRARY_SPEED_RUNS || 3))
const ENGINES = (process.env.LIBRARY_SPEED_BROWSERS || 'chromium,webkit').split(',').map(s => s.trim()).filter(Boolean)
const OUT = process.env.LIBRARY_SPEED_OUT || ''
const RTT = 60
const QUICK = process.env.LIBRARY_SPEED_QUICK === '1' // loads and rest only (for quick comparisons)
const EXTRA_ARGS = (process.env.LIBRARY_SPEED_CHROMIUM_ARGS || '').split(' ').filter(Boolean)
const TARGETS = { tapResponseMs: 100, warmPaintMs: 300, coldPaintMs: 1000, navLongTaskMs: 100 }
const USER = '00000000-0000-4000-8000-0000000c0de1'
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))
const median = values => { const v = values.filter(x => Number.isFinite(x)).sort((a, b) => a - b); return v.length ? v[Math.floor((v.length - 1) / 2)] : null }

// ---- The server: dist/ as the Worker serves it ----
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.avif': 'image/avif', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.woff': 'font/woff', '.mp4': 'video/mp4', '.webm': 'video/webm', '.wav': 'audio/wav', '.mp3': 'audio/mpeg', '.txt': 'text/plain' }
// The browser cache policy of src/worker/lib/staticCache.ts (kept in step by hand: this is a .mjs script).
const ONE_DAY = 'public, max-age=86400, stale-while-revalidate=604800'
const IMMUTABLE = 'public, max-age=31536000, immutable'
const HASHED_BUNDLE = /^\/assets\/[\w.-]+-[\w-]{8}\.(?:js|css|woff2?|svg|png|jpe?g|webp|avif)$/
const TAGGED_CODE = /^\/(?:lab|omarchy)\/[\w\-./]+\.(?:js|css)$/
const IMAGE_DIRS = [/^\/covers\/[\w\-./]+\.(?:webp|jpe?g|png|avif|svg)$/, /^\/lab\/library_2\/(?:assets|shelf-study)\/[\w\-./]+\.(?:webp|jpe?g|png|avif|svg)$/]
function cachePolicy(url, type) {
  if (type.includes('text/html')) return 'no-store'
  if (HASHED_BUNDLE.test(url.pathname)) return IMMUTABLE
  if (TAGGED_CODE.test(url.pathname) && /^[\w.-]+$/.test(url.searchParams.get('v') || '')) return ONE_DAY
  if (IMAGE_DIRS.some(pattern => pattern.test(url.pathname))) return ONE_DAY
  return 'public, max-age=0, must-revalidate'
}
const PAGES = new Map([['/', '/lab/library_2/index.html'], ['/library', '/lab/library_2/index.html'], ['/library/', '/lab/library_2/index.html'], ['/reader', '/app.html']])
const fileCache = new Map()
async function readFile(file) {
  if (fileCache.has(file)) return fileCache.get(file)
  const body = await fs.readFile(file)
  const type = TYPES[path.extname(file)] || 'application/octet-stream'
  const text = /^(text|application\/json|image\/svg)/.test(type)
  const entry = { body, gz: text && body.length > 1024 ? gzipSync(body, { level: 6 }) : null, type, etag: `"${createHash('sha1').update(body).digest('hex').slice(0, 16)}"` }
  fileCache.set(file, entry)
  return entry
}

let serverDelay = 0
let record = null
function serve() {
  const server = createServer(async (req, res) => {
    // The browsers use this server as their proxy too: a request for any other host is refused.
    if (/^https?:\/\//.test(req.url) && new URL(req.url).host !== `127.0.0.1:${PORT}`) { res.writeHead(403); res.end(); return }
    if (serverDelay) await sleep(serverDelay)
    const url = new URL(req.url, 'http://local')
    let pathname = decodeURIComponent(url.pathname)
    if (pathname.startsWith('/api/')) {
      if (pathname === '/api/lab-position' && req.method === 'GET') { res.writeHead(200, { 'content-type': 'application/json', 'cache-control': 'no-store' }); res.end(JSON.stringify(record)); return }
      res.writeHead(204, { 'cache-control': 'no-store' }); res.end(); return
    }
    pathname = PAGES.get(pathname) || pathname
    if (pathname.endsWith('/')) pathname += 'index.html'
    const file = path.join(DIST, path.normalize(pathname))
    try {
      if (!file.startsWith(DIST + path.sep)) throw new Error('outside')
      const entry = await readFile(file)
      const headers = { 'content-type': entry.type, 'cache-control': cachePolicy(url, entry.type), etag: entry.etag }
      if (req.headers['if-none-match'] === entry.etag && !entry.type.includes('text/html')) { res.writeHead(304, headers); res.end(); return }
      if (entry.gz && /\bgzip\b/.test(req.headers['accept-encoding'] || '')) { res.writeHead(200, { ...headers, 'content-encoding': 'gzip', vary: 'accept-encoding' }); res.end(entry.gz); return }
      res.writeHead(200, headers); res.end(entry.body)
    } catch { res.writeHead(404, { 'cache-control': 'no-store' }); res.end() }
  })
  server.on('connect', (req, socket) => { socket.end('HTTP/1.1 403 Forbidden\r\n\r\n') })
  return new Promise((resolve, reject) => { server.once('error', reject); server.listen(PORT, '127.0.0.1', () => resolve(server)) })
}

/** The Supabase project the build was made for: the page keeps its session under sb-<ref>-auth-token. */
async function supabaseRef() {
  for (const name of await fs.readdir(path.join(DIST, 'assets'))) {
    if (!name.endsWith('.js')) continue
    const match = (await fs.readFile(path.join(DIST, 'assets', name), 'utf8')).match(/https:\/\/([a-z0-9]+)\.supabase\.co/)
    if (match) return match[1]
  }
  throw new Error('The build names no Supabase project: the signed-in library cannot be faked')
}

function readerFixture() {
  const at = Date.now() - 5 * 86400000
  const place = (bookId, chapterNumber, paragraphIndex) => ({ bookId, headerBook: bookId, chapterNumber, sequentialChapter: chapterNumber, paragraphIndex, wordIndex: 0, pageIndex: 0, primaryEditionKey: 'original-en', updatedAt: at, deviceId: 'device-speed-check', rev: 1 })
  return { books: { frankenstein: place('frankenstein', 3, 5), 'pride-and-prejudice': place('pride-and-prejudice', 7, 2), odyssey: place('odyssey', 4, 1), 'crime-and-punishment': place('crime-and-punishment', 2, 3) }, finished: {}, owner: USER, hidden: {}, lastSettledBookId: 'frankenstein', lastSettledAt: at, updatedAt: at, deviceId: 'device-speed-check' }
}

// ---- In the page, before any of its scripts ----
// Self-contained (serialised). Signs the reader in, answers Supabase, and keeps the timings.
function instrument({ ref, session, record, user, latency, signedIn }) {
  const S = window.__speed = { longTasks: [], events: [], gaps: [], marks: {}, supabase: [] }
  const now = () => performance.now()
  if (signedIn) {
    try {
      if (!localStorage.getItem(`sb-${ref}-auth-token`)) { localStorage.setItem(`sb-${ref}-auth-token`, session); localStorage.setItem('tinct-lab-position', record) }
      document.cookie = 'tinct_auth=1; path=/'
    } catch { /* private */ }
  }
  // Supabase answered here, after one round trip: the auth user, empty tables and RPCs.
  const fetch0 = window.fetch.bind(window)
  window.fetch = function (input, init) {
    const url = String(input?.url || input)
    if (!url.includes('.supabase.co/')) return fetch0(input, init)
    const at = now()
    const answer = new URL(url).pathname.startsWith('/auth/v1/user') ? (signedIn ? JSON.parse(user) : null) : []
    return new Promise(resolve => setTimeout(() => {
      S.supabase.push({ url: url.replace(/^https:\/\/[^/]+/, '').slice(0, 100), start: Math.round(at), end: Math.round(now()) })
      resolve(answer ? new Response(JSON.stringify(answer), { status: 200, headers: { 'content-type': 'application/json' } }) : new Response('{"message":"no session"}', { status: 401, headers: { 'content-type': 'application/json' } }))
    }, latency))
  }
  try { new PerformanceObserver(list => { for (const e of list.getEntries()) S.longTasks.push({ start: Math.round(e.startTime), duration: Math.round(e.duration) }) }).observe({ type: 'longtask', buffered: true }) } catch { S.noLongTask = true }
  try { new PerformanceObserver(list => { for (const e of list.getEntries()) S.events.push({ name: e.name, start: e.startTime, duration: e.duration, processing: e.processingEnd - e.processingStart, delay: e.processingStart - e.startTime, id: e.interactionId || 0 }) }).observe({ type: 'event', durationThreshold: 16, buffered: true }) } catch { S.noEventTiming = true }
  // The script work of each frame (every requestAnimationFrame callback run for one frame time, summed).
  S.frameWork = []
  const raf0 = window.requestAnimationFrame.bind(window)
  window.requestAnimationFrame = cb => raf0(t => { const start = now(); try { cb(t) } finally { const last = S.frameWork.at(-1), spent = now() - start; if (last && last.t === t) last.ms += spent; else { S.frameWork.push({ t, ms: spent }); if (S.frameWork.length > 4000) S.frameWork.splice(0, 2000) } } })
  // Frame gaps (a long task where the browser has no Long Tasks API) and the library's milestones, by frame.
  const visible = el => { if (!el) return false; const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2 || r.bottom < 0 || r.top > innerHeight) return false; const s = getComputedStyle(el); return s.visibility !== 'hidden' && s.display !== 'none' && Number(s.opacity) > 0.05 }
  const mark = (name, test) => { if (S.marks[name] == null && test()) S.marks[name] = Math.round(now()) }
  let last = 0
  const frame = t => {
    if (last && t - last > 50 && document.visibilityState === 'visible') S.gaps.push({ start: Math.round(last), duration: Math.round(t - last) })
    last = t
    try {
      if (location.pathname !== '/reader') {
        const html = document.documentElement.className
        // The returning reader's desk: a book on the table with its cover painted (boot.js or reading-table.js).
        mark('desk', () => /\breturning\b/.test(html) && [...document.querySelectorAll('.rt-b')].some(b => visible(b)))
        // The discovery hero: its title and its cover.
        mark('hero', () => !/\breturning\b/.test(html) && visible(document.getElementById('hero-title')) && ([...document.querySelectorAll('#hero-book img, #hero-book canvas')].some(c => visible(c) && (c.tagName === 'CANVAS' ? c.width > 0 : c.complete && c.naturalWidth > 0))))
        // Diagnostics: the steps between the page and the desk.
        mark('returningClass', () => /\breturning\b/.test(html))
        mark('deskPlaceholder', () => !!document.querySelector('.rt-b'))
        mark('tableInserted', () => !!document.querySelector('.reading-table'))
        mark('tablePrepared', () => !!document.querySelector('.reading-table:not(.is-preparing)'))
        mark('pendingCleared', () => /\breturning\b/.test(html) && !/\breturning-(scene-)?pending\b/.test(html))
        mark('shelves', () => document.querySelectorAll('#shelves .shelf').length > 0)
        mark('ready', () => /\blibrary-ready\b/.test(html))
        mark('leaving', () => !!document.body?.classList.contains('leaving'))
        if (S.marks.useful == null && (S.marks.desk != null || S.marks.hero != null)) S.marks.useful = S.marks.desk ?? S.marks.hero
      } else {
        const root = document.querySelector('.lab'), passage = document.querySelector('.lab-page-wrap > .lab-passage')
        mark('readerText', () => root?.dataset.readerReady === 'true' && passage && visible(passage) && passage.textContent.trim().length > 40)
      }
    } catch { /* keep sampling */ }
    requestAnimationFrame(frame)
  }
  requestAnimationFrame(frame)
  // A tap: pointerdown's time, the next paint after each of its events, and the frame its response shows.
  window.__tapArm = predicateSource => {
    const predicate = predicateSource ? new Function(`return (${predicateSource})()`) : null
    const T = window.__tap = { armed: true, down: null, nextPaint: {}, response: null }
    let mutated = null
    const observer = new MutationObserver(() => { if (T.down != null && mutated == null) mutated = now() })
    observer.observe(document.documentElement, { subtree: true, childList: true, attributes: true, characterData: true })
    const afterPaint = name => event => {
      if (name === 'pointerdown' && T.down == null) T.down = event.timeStamp
      if (T.down == null || T.nextPaint[name] != null) return
      requestAnimationFrame(() => { const channel = new MessageChannel(); channel.port1.onmessage = () => { T.nextPaint[name] = now() }; channel.port2.postMessage(0) })
    }
    const names = ['pointerdown', 'pointerup', 'click', 'keydown', 'input']
    const handlers = names.map(name => [name, afterPaint(name)])
    for (const [name, handler] of handlers) addEventListener(name, handler, { capture: true })
    const check = () => {
      if (!T.armed) return
      if (T.down != null) {
        let ok = false
        try { ok = predicate ? !!predicate() : mutated != null } catch { ok = false }
        if (ok) { T.response = now(); T.armed = false; observer.disconnect(); for (const [name, handler] of handlers) removeEventListener(name, handler, { capture: true }); return }
      }
      requestAnimationFrame(check)
    }
    requestAnimationFrame(check)
  }
}

// ---- Measuring ----
async function newContext(browser, engine, signedIn, fixture) {
  const iphone13 = { viewport: { width: 390, height: 844 }, screen: { width: 390, height: 844 }, deviceScaleFactor: 3, hasTouch: true, isMobile: engine === 'chromium', userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1' }
  const context = await browser.newContext({ ...iphone13, baseURL: `http://127.0.0.1:${PORT}`, serviceWorkers: 'block', reducedMotion: process.env.LIBRARY_SPEED_REDUCED === '1' ? 'reduce' : 'no-preference' })
  const exp = Math.floor(Date.now() / 1000) + 3600
  const b64 = value => Buffer.from(JSON.stringify(value)).toString('base64url')
  const user = { id: USER, aud: 'authenticated', role: 'authenticated', email: 'reader@example.com', app_metadata: {}, user_metadata: {}, created_at: '2026-10-01T00:00:00Z' }
  const session = { access_token: `${b64({ alg: 'HS256', typ: 'JWT' })}.${b64({ sub: USER, exp, role: 'authenticated' })}.fixture`, refresh_token: 'fixture', token_type: 'bearer', expires_in: 3600, expires_at: exp, user }
  if (process.env.LIBRARY_SPEED_DEBUG === '1') context.on('page', page => {
    page.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') console.log(`  [console ${m.type()}] ${m.text().slice(0, 200)}`) })
    page.on('pageerror', e => console.log(`  [pageerror] ${e.message.slice(0, 300)}`))
    page.on('requestfailed', r => console.log(`  [failed] ${r.url().slice(0, 120)} ${r.failure()?.errorText}`))
  })
  await context.addInitScript(instrument, { ref: fixture.ref, session: JSON.stringify(session), record: JSON.stringify(record), user: JSON.stringify(user), latency: RTT, signedIn })
  return context
}

async function throttle(page, engine) {
  if (engine !== 'chromium') return null
  const cdp = await page.context().newCDPSession(page)
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 })
  await cdp.send('Network.enable')
  if (process.env.LIBRARY_SPEED_INITIATORS === '1') cdp.on('Network.requestWillBeSent', e => {
    if (!/\/api\/|catalogue|public-books/.test(e.request.url)) return
    const frames = []
    for (let st = e.initiator.stack; st && frames.length < 8; st = st.parent) for (const f of st.callFrames) if (frames.length < 8) frames.push(`${f.functionName || '(anon)'}@${f.url.replace(/^.*\//, '').replace(/\?.*/, '')}:${f.lineNumber + 1}`)
    console.log(`  [initiator] ${Math.round(e.timestamp * 1000) % 100000} ${e.request.url.replace(/^https?:\/\/[^/]+/, '')} <- ${frames.join(' < ')}`)
  })
  await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: RTT, downloadThroughput: 9e6 / 8, uploadThroughput: 1.5e6 / 8 })
  return cdp
}

/** The page's own record of this load: milestones, long tasks, requests, images, scripts. */
async function loadReport(page, until) {
  return page.evaluate(until => {
    const S = window.__speed
    const nav = performance.getEntriesByType('navigation')[0]
    const resources = performance.getEntriesByType('resource').map(r => ({ name: r.name.replace(location.origin, '').slice(0, 110), type: r.initiatorType, start: Math.round(r.startTime), end: Math.round(r.responseEnd), transfer: r.transferSize || 0, body: r.encodedBodySize || 0, decoded: r.decodedBodySize || 0, cached: r.transferSize === 0 && r.decodedBodySize > 0 }))
    if (nav) resources.unshift({ name: nav.name.replace(location.origin, ''), type: 'navigation', start: 0, end: Math.round(nav.responseEnd), transfer: nav.transferSize || 0, body: nav.encodedBodySize || 0, decoded: nav.decodedBodySize || 0, cached: false })
    const dpr = devicePixelRatio
    const images = [...document.images].filter(im => im.complete && im.naturalWidth && im.getClientRects().length).map(im => { const r = im.getBoundingClientRect(); return { src: (im.currentSrc || im.src).replace(location.origin, '').slice(0, 100), natural: `${im.naturalWidth}×${im.naturalHeight}`, shown: `${Math.round(r.width * dpr)}×${Math.round(r.height * dpr)}`, ratio: r.width ? +(im.naturalWidth / (r.width * dpr)).toFixed(2) : null, loading: im.loading || 'eager' } })
    const fcp = performance.getEntriesByName('first-contentful-paint')[0]?.startTime
    return { marks: S.marks, fcp: fcp ? Math.round(fcp) : null, longTasks: S.noLongTask ? null : S.longTasks.filter(t => t.start < until), gaps: S.gaps.filter(t => t.start < until), resources, images, supabase: S.supabase, dpr }
  }, until)
}

function summariseLoad(report) {
  const useful = report.marks.useful
  const ready = report.marks.ready
  const tasks = report.longTasks || report.gaps
  // Interactive: ready, then the end of the last long task that leaves 300 ms quiet after it.
  let interactive = ready
  if (ready != null) for (const t of [...tasks].sort((a, b) => a.start - b.start)) { if (t.start + t.duration < interactive) continue; if (t.start - interactive < 300) interactive = t.start + t.duration; else break }
  const critical = report.resources.filter(r => useful != null && r.start < useful)
  const fetched = rs => rs.filter(r => !r.cached)
  const bytes = rs => rs.reduce((s, r) => s + (r.transfer || r.body), 0)
  const imageRe = /\.(?:webp|jpe?g|png|avif|svg)(?:\?|$)/
  const scripts = report.resources.filter(r => /\.m?js(?:\?|$)/.test(r.name))
  const images = report.resources.filter(r => imageRe.test(r.name))
  return {
    fcp: report.fcp, useful, desk: report.marks.desk ?? null, hero: report.marks.hero ?? null, shelves: report.marks.shelves ?? null, ready, interactive,
    longTasksOver50: tasks.filter(t => t.duration > 50).length, longestTask: Math.max(0, ...tasks.map(t => t.duration)), longTaskSource: report.longTasks ? 'longtask' : 'frame-gap',
    critical: { requests: critical.length, fetched: fetched(critical).length, kb: Math.round(bytes(critical) / 1024), lastEnd: Math.max(0, ...critical.map(r => r.end)) },
    all: { requests: report.resources.length, fetched: fetched(report.resources).length, kb: Math.round(bytes(report.resources) / 1024) },
    scripts: { count: scripts.length, kb: Math.round(bytes(scripts) / 1024), decodedKb: Math.round(scripts.reduce((s, r) => s + r.decoded, 0) / 1024) },
    images: { count: images.length, kb: Math.round(bytes(images) / 1024), oversized: report.images.filter(im => im.ratio > 1.5).length },
    supabase: report.supabase.length,
  }
}

/** Loads /library and waits for it to be ready and quiet. */
async function loadLibrary(page, signedIn) {
  await page.goto('/library', { waitUntil: 'commit' })
  try { await page.waitForFunction(() => window.__speed?.marks.ready != null && window.__speed?.marks.useful != null, null, { timeout: 60000 }) } catch (error) {
    const state = await page.evaluate(() => ({ marks: window.__speed?.marks, html: document.documentElement.className, url: location.href, ready: document.readyState, body: document.body?.innerHTML.length, resources: performance.getEntriesByType("resource").map(r => r.name.slice(-40) + " " + Math.round(r.responseEnd)).slice(0, 10), nav: performance.getEntriesByType("navigation")[0]?.responseEnd })).catch(e => String(e))
    throw new Error(`The library did not paint: ${JSON.stringify(state)}`)
  }
  if (signedIn) await page.waitForFunction(() => window.__library2Reading?.reading?.length > 0, null, { timeout: 30000 }).catch(() => {})
  await sleep(4000)
  const now = await page.evaluate(() => performance.now())
  return loadReport(page, now)
}

/** One tap: Event Timing's next paint (Chromium) or the frame probe, and the response the button is for. */
async function tap(page, name, target, respond, { key = null, settle = 900 } = {}) {
  const locator = typeof target === 'string' ? page.locator(target).first() : target
  try { await locator.waitFor({ state: 'visible', timeout: 8000 }) } catch { return { name, error: 'not visible' } }
  await sleep(250)
  const mark = await page.evaluate(() => { window.__speed.events.length = 0; window.__speed.longTasks.length = 0; window.__speed.gaps.length = 0; return performance.now() })
  await page.evaluate(source => window.__tapArm(source), respond ? String(respond) : null)
  const profiling = process.env.LIBRARY_SPEED_PROFILE_TAP && name.startsWith(process.env.LIBRARY_SPEED_PROFILE_TAP) && page.context().browser()?.browserType().name() === 'chromium'
  const cdp = profiling ? await page.context().newCDPSession(page) : null
  if (cdp) { await cdp.send('Profiler.enable'); await cdp.send('Profiler.setSamplingInterval', { interval: 200 }); await cdp.send('Profiler.start') }
  try {
    if (key) { await locator.focus(); await page.evaluate(() => { const T = window.__tap; addEventListener('keydown', e => { if (T.down == null) T.down = e.timeStamp }, { capture: true, once: true }) }); await page.keyboard.press(key) }
    else await locator.tap({ timeout: 5000 })
  } catch (error) { return { name, error: String(error.message || error).split('\n')[0] } }
  try { await page.waitForFunction(() => window.__tap.response != null, null, { timeout: 8000 }) } catch { /* reported as missing */ }
  if (cdp) {
    const { profile: p } = await cdp.send('Profiler.stop')
    const self = new Map(), byId = new Map(p.nodes.map(n => [n.id, n]))
    p.samples.forEach((id, i) => { const n = byId.get(id); const key = `${n.callFrame.functionName || '(anon)'} ${n.callFrame.url.replace(/^.*\//, '')}:${n.callFrame.lineNumber + 1}:${n.callFrame.columnNumber + 1}`; self.set(key, (self.get(key) || 0) + (p.timeDeltas[i] || 0)) })
    console.log(`CPU during "${name}" (pointerdown to response), top self time (ms):`)
    for (const [k, v] of [...self].sort((a, b) => b[1] - a[1]).slice(0, 20)) console.log(`  ${String(Math.round(v / 1000)).padStart(6)}  ${k}`)
    await cdp.detach()
  }
  await sleep(settle)
  return page.evaluate(({ name, mark }) => {
    const T = window.__tap, S = window.__speed
    const down = T.down
    const events = S.events.filter(e => e.start >= down - 1 && /^(pointerdown|pointerup|click|keydown|keyup|keypress)$/.test(e.name))
    const eventTiming = events.length ? Math.round(Math.max(...events.map(e => e.duration))) : null
    const worst = events.length ? events.reduce((a, b) => (b.duration > a.duration ? b : a)) : null
    const parts = worst ? { event: worst.name, delay: Math.round(worst.delay), processing: Math.round(worst.processing), presentation: Math.round(worst.duration - worst.delay - worst.processing) } : null
    const probe = Object.values(T.nextPaint).length ? Math.round(Math.max(...Object.values(T.nextPaint)) - down) : null
    const tasks = S.noLongTask ? S.gaps : S.longTasks
    // What the tap fetched before its response showed (the response waited on these).
    const fetched = performance.getEntriesByType('resource').filter(r => r.startTime >= down - 1 && (T.response == null || r.startTime < T.response)).map(r => `${Math.round(r.startTime - down)}–${Math.round(r.responseEnd - down)} ${r.name.replace(location.origin, '').slice(0, 70)}`)
    return { name, fetched, nextPaint: S.noEventTiming ? probe : (eventTiming ?? probe), probe, response: T.response != null && down != null ? Math.round(T.response - down) : null, longestTask: Math.max(0, ...tasks.filter(t => t.start >= mark).map(t => t.duration)), parts }
  }, { name, mark })
}

const visible = sel => `() => { const el = document.querySelector(${JSON.stringify(sel)}); if (!el || el.hidden || el.closest('[hidden]')) return false; const r = el.getBoundingClientRect(); return r.width > 1 && r.height > 1 && getComputedStyle(el).visibility !== 'hidden' }`
const hidden = sel => `() => { const el = document.querySelector(${JSON.stringify(sel)}); return !el || el.hidden || !!el.closest('[hidden]') }`

/** Every library button, in a sequence a reader could follow. */
async function tapAll(page, signedIn) {
  const out = []
  const push = result => { out.push(result); return result }
  await page.evaluate(() => scrollTo(0, 0))
  push(await tap(page, 'Menu open', '#menu-toggle', visible('#library-menu')))
  push(await tap(page, 'Menu close', '#menu-close', hidden('#library-menu')))
  push(await tap(page, 'Search open', '#search-toggle', visible('#search-panel')))
  push(await tap(page, 'Search type a letter', '#search-input', null, { key: 'j', settle: 1500 }))
  push(await tap(page, 'Search close', '#search-close', hidden('#search-panel')))
  if (!signedIn) push(await tap(page, 'Hero dot', '.hero-dots button:nth-child(2)', null))
  // A book on a shelf: its introduction (the cover turns). Then its tabs, Add to shelf and Back.
  const card = page.locator('#shelves .book-card').nth(2)
  await card.evaluate(el => el.scrollIntoView({ block: 'center' })).catch(() => {})
  await sleep(1200)
  push(await tap(page, 'Shelf book: introduction', card, visible('#book-overlay'), { settle: 2500 }))
  if (process.env.LIBRARY_SPEED_SHOTS) await page.screenshot({ path: path.join(process.env.LIBRARY_SPEED_SHOTS, `intro-${signedIn ? 'in' : 'out'}.png`) })
  push(await tap(page, 'Author flap: Continue', '#slip-next', null, { settle: 2500 }))
  push(await tap(page, 'Introduction tab', '#intro .intro-tabs button[data-tab="characters"]', `() => document.querySelector('#intro .intro-tabs button[data-tab="characters"]')?.getAttribute('aria-selected') === 'true' || document.querySelector('#intro .intro-tabs button[data-tab="characters"]')?.classList.contains('active')`))
  push(await tap(page, 'Add to shelf', '#save-book', null))
  if (process.env.LIBRARY_SPEED_SHOTS) await page.screenshot({ path: path.join(process.env.LIBRARY_SPEED_SHOTS, `saved-${signedIn ? 'in' : 'out'}.png`) })
  // On a phone Back turns to the author's flap, and Back there closes the book.
  push(await tap(page, 'Introduction back (to the flap)', '#page-back', null, { settle: 1500 }))
  push(await tap(page, 'Flap back (closes the book)', '#page-back', hidden('#book-overlay'), { settle: 2500 }))
  push(await tap(page, 'Librarian open', '#librarian', visible('#librarian-panel'), { settle: 1500 }))
  push(await tap(page, 'Librarian minimise', '#minimize', null, { settle: 1500 }))
  // My shelf through the menu, and a book's ••• there.
  await page.evaluate(() => scrollTo(0, 0))
  await tap(page, 'Menu open (again)', '#menu-toggle', visible('#library-menu'))
  push(await tap(page, 'Menu: My shelf', '#library-menu [data-collection="saved"]', visible('#collection'), { settle: 1500 }))
  push(await tap(page, 'My shelf: •••', '#collection .shelf-more', `() => !!document.querySelector('#collection [role="menu"]:not([hidden]), .shelf-menu:not([hidden])') || document.querySelector('#collection .shelf-more')?.getAttribute('aria-expanded') === 'true'`))
  await page.keyboard.press('Escape').catch(() => {})
  await sleep(400)
  push(await tap(page, 'My shelf: back', '#collection-back', hidden('#collection'), { settle: 1500 }))
  return out
}

/** A book on the desk to the reader's first text; then the reader's Library back to the desk. */
async function deskToReaderAndBack(page, { early = false } = {}) {
  await page.evaluate(() => scrollTo(0, 0))
  if (!early) await sleep(500)
  const book = page.locator('.reading-table:not(.is-preparing) .rt-b.is-current, .reading-table:not(.is-preparing) .rt-b').first()
  try { await book.waitFor({ state: 'visible', timeout: early ? 2000 : 8000 }) } catch { return { error: 'no desk book' } }
  // Continue, the desk's own way into the book (else the book at the front).
  const open = page.locator('.reading-table:not(.is-preparing) #rt-continue').first()
  const target = (await open.count()) && (await open.isVisible().catch(() => false)) ? open : book
  await page.evaluate(() => { window.__speed.marks.leaving = null; window.__deskDown = null; addEventListener('pointerdown', e => { window.__deskDown ??= performance.timeOrigin + e.timeStamp }, { capture: true, once: true }) })
  // The tap's visible answer: the page starts its fade to the reader's paper (body.leaving), or the reader page itself.
  const answered = page.waitForFunction(() => window.__speed?.marks.leaving != null ? performance.timeOrigin + window.__speed.marks.leaving : null, null, { timeout: 15000 }).then(h => h.jsonValue(), () => null)
  await target.tap()
  const tappedAt = await page.evaluate(() => window.__deskDown).catch(() => null) ?? Date.now()
  // The chosen book may first come forward on the table; a second tap on it opens the reader.
  const left = await page.waitForURL(/\/reader/, { timeout: 2500 }).then(() => true, () => false)
  let secondTap = false
  if (!left) { secondTap = true; await page.locator('.rt-b.is-current, .rt-b').first().tap().catch(() => {}); await page.waitForURL(/\/reader/, { timeout: 15000 }) }
  await page.waitForFunction(() => window.__speed?.marks.readerText != null, null, { timeout: 60000 })
  const reader = await page.evaluate(() => ({ place: { book: document.querySelector('.lab')?.dataset.bookId, chapter: document.querySelector('.lab')?.dataset.chapter }, text: window.__speed.marks.readerText, origin: performance.timeOrigin, longTasks: (window.__speed.noLongTask ? window.__speed.gaps : window.__speed.longTasks).filter(t => t.start < window.__speed.marks.readerText), fcp: performance.getEntriesByName('first-contentful-paint')[0]?.startTime, resources: performance.getEntriesByType('resource').filter(r => r.startTime < window.__speed.marks.readerText).map(r => `${Math.round(r.startTime)}–${Math.round(r.responseEnd)}${r.transferSize === 0 && r.decodedBodySize > 0 ? ' (cache)' : ''} ${r.name.replace(location.origin, '').slice(0, 80)}`) }))
  const toReaderText = Math.round(reader.origin + reader.text - tappedAt)
  const leavingAt = await answered
  // A frame time can precede the event that began it by a few ms: an answer in that frame reads 0.
  const tapAnswer = Math.max(0, Math.round(Math.min(leavingAt ?? Infinity, reader.origin) - tappedAt))
  const steps = { place: reader.place, tapToNavigation: Math.round(reader.origin - tappedAt), navigationToFcp: reader.fcp ? Math.round(reader.fcp) : null, navigationToText: Math.round(reader.text), resources: reader.resources }
  await sleep(2500)
  // Back: the phone's t menu, then Library (desktop has its own button).
  const menu = page.locator('[data-testid="lab-super-button"], .lab-super-button, button[aria-label^="Open menu"], button[aria-label*="menu" i]').first()
  let backTapAt = null
  try {
    const desktopBack = page.locator('[data-testid="lab-library-back"]')
    if (await desktopBack.isVisible().catch(() => false)) { backTapAt = await page.evaluate(() => performance.timeOrigin + performance.now()); await desktopBack.tap() }
    else {
      await menu.tap({ timeout: 5000 })
      const item = page.getByRole('menuitem', { name: /library/i }).or(page.getByRole('button', { name: /^library$/i })).first()
      await item.waitFor({ state: 'visible', timeout: 5000 })
      backTapAt = await page.evaluate(() => performance.timeOrigin + performance.now())
      await item.tap()
    }
  } catch (error) { return { toReaderText, tapAnswer, steps, secondTap, readerLongest: Math.max(0, ...reader.longTasks.map(t => t.duration)), backError: String(error.message || error).split('\n')[0] } }
  await page.waitForURL(/\/library/, { timeout: 15000 })
  await page.waitForFunction(() => window.__speed?.marks.useful != null, null, { timeout: 30000 })
  const back = await page.evaluate(() => ({ useful: window.__speed.marks.useful, origin: performance.timeOrigin }))
  return { toReaderText, tapAnswer, steps, secondTap, readerLongest: Math.max(0, ...reader.longTasks.map(t => t.duration)), backToLibrary: Math.round(back.origin + back.useful - backTapAt) }
}

/** The library at rest for 3 s: how busy its main thread stays (an animation that never stops delays every tap). */
async function idleBusy(page, cdp) {
  await page.evaluate(() => { window.__speed.longTasks.length = 0; window.__speed.gaps.length = 0; window.__speed.frameWork.length = 0 })
  const metric = async () => cdp ? Object.fromEntries((await cdp.send('Performance.getMetrics')).metrics.map(m => [m.name, m.value])).TaskDuration : null
  if (cdp) await cdp.send('Performance.enable')
  const profile = cdp && process.env.LIBRARY_SPEED_PROFILE === '1'
  if (profile) { await cdp.send('Profiler.enable'); await cdp.send('Profiler.start') }
  const before = await metric()
  await sleep(3000)
  const after = await metric()
  if (profile) {
    const { profile: p } = await cdp.send('Profiler.stop')
    const self = new Map(), dt = p.timeDeltas, byId = new Map(p.nodes.map(n => [n.id, n]))
    p.samples.forEach((id, i) => { const n = byId.get(id); const key = `${n.callFrame.functionName || '(anon)'} ${n.callFrame.url.replace(/^.*\//, '')}:${n.callFrame.lineNumber + 1}:${n.callFrame.columnNumber + 1}`; self.set(key, (self.get(key) || 0) + (dt[i] || 0)) })
    console.log('CPU at rest, top self time (ms):')
    for (const [k, v] of [...self].sort((a, b) => b[1] - a[1]).slice(0, 25)) console.log(`  ${String(Math.round(v / 1000)).padStart(6)}  ${k}`)
  }
  const tasks = await page.evaluate(() => (window.__speed.noLongTask ? window.__speed.gaps : window.__speed.longTasks).map(t => t.duration))
  // Frames: how many in the 3 s, and the script work of each (mean and 95th percentile, ms).
  const work = (await page.evaluate(() => window.__speed.frameWork.map(f => f.ms))).sort((a, b) => a - b)
  const frames = { count: work.length, meanMs: work.length ? Math.round(work.reduce((a, b) => a + b, 0) / work.length * 10) / 10 : null, p95Ms: work.length ? Math.round(work[Math.min(work.length - 1, Math.floor(work.length * 0.95))] * 10) / 10 : null }
  return { busyPercent: before != null ? Math.round(((after - before) / 3) * 100) : null, longTasks: tasks.length, longTaskMs: tasks.reduce((a, b) => a + b, 0), frames }
}

async function runOnce(browser, engine, fixture, run) {
  const result = { run }
  // Signed out, cold: a first visit.
  if (QUICK) result.guestCold = null
  else {
    const context = await newContext(browser, engine, false, fixture)
    const page = await context.newPage()
    await throttle(page, engine)
    result.guestCold = await loadLibrary(page, false)
    result.guestTaps = run === 0 ? await tapAll(page, false) : null
    await context.close()
  }
  // Signed in with books on the desk: cold (empty cache and storage), then warm (a second visit).
  const context = await newContext(browser, engine, true, fixture)
  const page = await context.newPage()
  const cdp = await throttle(page, engine)
  result.cold = await loadLibrary(page, true)
  result.warm = await loadLibrary(page, true)
  result.idle = await idleBusy(page, cdp)
  if (QUICK) { await context.close(); return result }
  result.taps = await tapAll(page, true)
  await page.goto('/library', { waitUntil: 'commit' })
  await page.waitForFunction(() => window.__speed?.marks.ready != null, null, { timeout: 60000 })
  await sleep(3000)
  result.reader = await deskToReaderAndBack(page)
  // Again, the reader's code now in the browser's cache (a reader's usual open, between releases).
  // This time the book is tapped as soon as the desk shows, as a reader does, before the account's reads are back.
  if (!result.reader.error && !result.reader.backError) { await page.waitForFunction(() => window.__speed?.marks.desk != null, null, { timeout: 60000 }); result.reader2 = await deskToReaderAndBack(page, { early: true }) }
  await context.close()
  return result
}

function summarise(engine, runs) {
  const pick = (fn) => median(runs.map(fn))
  const loads = {}
  for (const key of ['guestCold', 'cold', 'warm']) {
    if (!runs[0][key]) continue
    const s = runs.map(r => summariseLoad(r[key]))
    loads[key] = Object.fromEntries(Object.keys(s[0]).map(k => [k, typeof s[0][k] === 'object' && s[0][k] ? Object.fromEntries(Object.keys(s[0][k]).map(kk => [kk, median(s.map(x => x[k][kk]))])) : (typeof s[0][k] === 'string' ? s[0][k] : median(s.map(x => x[k])))]))
  }
  const taps = {}
  for (const r of runs) for (const t of [...(r.guestTaps || []).map(t => ({ ...t, name: `${t.name} (guest)` })), ...(r.taps || [])]) (taps[t.name] ||= []).push(t)
  const tapSummary = Object.fromEntries(Object.entries(taps).map(([name, list]) => [name, list.some(t => t.error) && list.every(t => t.error) ? { error: list[0].error } : { nextPaint: median(list.map(t => t.nextPaint)), response: median(list.map(t => t.response)), longestTask: median(list.map(t => t.longestTask)), parts: list.find(t => t.parts)?.parts || null, fetched: list[0].fetched || [] }]))
  const idle = { busyPercent: pick(r => r.idle.busyPercent), longTasks: pick(r => r.idle.longTasks), longTaskMs: pick(r => r.idle.longTaskMs), frames: pick(r => r.idle.frames?.count), frameMeanMs: pick(r => r.idle.frames?.meanMs), frameP95Ms: pick(r => r.idle.frames?.p95Ms) }
  const reader = runs[0].reader ? { tapAnswer: pick(r => r.reader.tapAnswer), tapAnswerEarly: pick(r => r.reader2?.tapAnswer), toReaderTextWarm: pick(r => r.reader2?.toReaderText), backToLibraryWarm: pick(r => r.reader2?.backToLibrary), toReaderText: pick(r => r.reader.toReaderText), backToLibrary: pick(r => r.reader.backToLibrary), readerLongest: pick(r => r.reader.readerLongest), secondTap: runs.some(r => r.reader.secondTap), error: runs.map(r => r.reader.error || r.reader.backError).find(Boolean) || null } : null
  return { engine, loads, taps: tapSummary, reader, idle }
}

function print(summary, runs) {
  const { engine, loads, taps, reader, idle } = summary
  const ms = v => (v == null ? '—' : `${v} ms`)
  console.log(`\n=== ${engine}${engine === 'chromium' ? ' (iPhone 13, CPU 4×, 60 ms RTT, 9 Mbit/s)' : ' (iPhone 13 size, unthrottled CPU, 60 ms server delay)'}; median of ${runs.length} ===`)
  console.log('Load                   FCP      useful   ready    interact  long>50  longest  crit req (fetched) KB   JS KB  img KB  imgs>1.5×')
  for (const [key, label] of [['guestCold', 'guest cold'], ['cold', 'signed-in cold'], ['warm', 'signed-in warm']]) {
    const l = loads[key]
    if (!l) continue
    console.log(`${label.padEnd(22)} ${ms(l.fcp).padEnd(8)} ${ms(l.useful).padEnd(8)} ${ms(l.ready).padEnd(8)} ${ms(l.interactive).padEnd(9)} ${String(l.longTasksOver50).padEnd(8)} ${ms(l.longestTask).padEnd(8)} ${String(l.critical.requests).padStart(4)} (${l.critical.fetched}) ${String(l.critical.kb).padStart(6)}  ${String(l.scripts.kb).padStart(5)}  ${String(l.images.kb).padStart(6)}  ${l.images.oversized}`)
  }
  console.log(`At rest (signed-in, 3 s): main thread ${idle.busyPercent ?? '—'}% busy, ${idle.longTasks} long tasks (${idle.longTaskMs} ms); ${idle.frames ?? '—'} frames, script per frame ${idle.frameMeanMs ?? '—'} ms (p95 ${idle.frameP95Ms ?? '—'} ms)`)
  console.log('Tap                                next paint  response  longest task  (run 1 worst event: input delay / handlers / to paint)')
  for (const [name, t] of Object.entries(taps)) {
    console.log(`${name.padEnd(34)} ${t.error ? `error: ${t.error}` : `${ms(t.nextPaint).padEnd(11)} ${ms(t.response).padEnd(9)} ${ms(t.longestTask).padEnd(13)} ${t.parts ? `${t.parts.event}: ${t.parts.delay} / ${t.parts.processing} / ${t.parts.presentation}` : ''}`}`)
    if (!t.error && t.response > 300 && t.fetched.length) console.log(`${' '.repeat(36)}fetched before it showed (ms from the tap): ${t.fetched.join('; ')}`)
  }
  if (reader) console.log(`Desk book tap → visible answer (fade to paper or the reader): ${ms(reader.tapAnswer)}; tapped as the desk shows: ${ms(reader.tapAnswerEarly)}`)
  if (reader) console.log(`Desk book → reader's first text: ${ms(reader.toReaderText)}${reader.secondTap ? ' (two taps: bring forward, then open)' : ''}; longest task on the way ${ms(reader.readerLongest)}`)
  if (reader) console.log(`Reader Library → library desk:   ${ms(reader.backToLibrary)}${reader.error ? ` (${reader.error})` : ''}`)
  const steps = runs[0].reader2?.steps || runs[0].reader?.steps
  if (steps) {
    console.log(`  (run 1, second open) opened ${steps.place?.book} at chapter ${steps.place?.chapter} (the fixture's place: frankenstein, chapter 3)`)
    console.log(`  (run 1, second open) tap → reader page requested ${steps.tapToNavigation} ms; then first paint ${steps.navigationToFcp} ms, first text ${steps.navigationToText} ms; requests before the text:`)
    for (const r of steps.resources) console.log(`    ${r}`)
  }
  if (reader) console.log(`Again, reader code cached, tapped as the desk shows: desk → reader text ${ms(reader.toReaderTextWarm)}, reader → library desk ${ms(reader.backToLibraryWarm)}`)
  const first = runs[0]
  const cold = first.cold
  console.log(`Milestones, signed-in cold, run 1: ${JSON.stringify(cold.marks)}`)
  console.log(`Milestones, signed-in warm, run 1: ${JSON.stringify(first.warm.marks)}`)
  console.log(`Waterfall, signed-in cold, run 1 (requests started before the first useful paint at ${cold.marks.useful} ms):`)
  for (const r of cold.resources.filter(r => r.start < cold.marks.useful).sort((a, b) => a.start - b.start)) console.log(`  ${String(r.start).padStart(5)}–${String(r.end).padEnd(5)} ${String(Math.round((r.transfer || r.body) / 1024)).padStart(5)} KB ${r.cached ? '(cache) ' : ''}${r.name}`)
  console.log(`Supabase calls before ready: ${cold.supabase.filter(s => s.start < (cold.marks.ready ?? Infinity)).map(s => `${s.start}–${s.end} ${s.url}`).join('; ') || 'none'}`)
  console.log('Shown images, signed-in warm (natural vs displayed at the device ratio):')
  for (const im of first.warm.images.slice(0, 12)) console.log(`  ${im.natural.padEnd(10)} shown ${im.shown.padEnd(10)} ${String(im.ratio).padEnd(5)}× ${im.loading.padEnd(5)} ${im.src}`)
  const js = cold.resources.filter(r => /\.m?js(?:\?|$)/.test(r.name))
  console.log(`JavaScript, signed-in cold: ${js.length} files, ${Math.round(js.reduce((s, r) => s + (r.transfer || r.body), 0) / 1024)} KB over the wire, ${Math.round(js.reduce((s, r) => s + r.decoded, 0) / 1024)} KB decoded; largest:`)
  for (const r of [...js].sort((a, b) => b.decoded - a.decoded).slice(0, 8)) console.log(`  ${String(Math.round(r.decoded / 1024)).padStart(5)} KB ${r.name}`)
}

function misses(summary) {
  const out = []
  const { loads, taps, engine } = summary
  if (engine !== 'chromium') return out // the targets are for the throttled phone
  if (loads.warm.useful > TARGETS.warmPaintMs) out.push(`warm library paint ${loads.warm.useful} ms > ${TARGETS.warmPaintMs} ms`)
  for (const key of ['guestCold', 'cold']) if (loads[key] && loads[key].useful > TARGETS.coldPaintMs) out.push(`${key} library paint ${loads[key].useful} ms > ${TARGETS.coldPaintMs} ms`)
  for (const [name, t] of Object.entries(taps)) if (!t.error && t.nextPaint > TARGETS.tapResponseMs) out.push(`${name}: next paint ${t.nextPaint} ms > ${TARGETS.tapResponseMs} ms`)
  for (const [name, t] of Object.entries(taps)) if (!t.error && t.longestTask > TARGETS.navLongTaskMs) out.push(`${name}: long task ${t.longestTask} ms > ${TARGETS.navLongTaskMs} ms`)
  return out
}

const server = await serve()
const fixture = { ref: await supabaseRef() }
record = readerFixture()
const report = { at: new Date().toISOString(), runs: RUNS, targets: TARGETS, engines: {} }
const allMisses = []
try {
  for (const engine of ENGINES) {
    const type = engine === 'webkit' ? webkit : chromium
    serverDelay = engine === 'webkit' ? RTT : 0
    const browser = await markInternal(await type.launch({ headless: true, proxy: { server: `http://127.0.0.1:${PORT}` }, ...(engine === 'chromium' ? { args: ['--mute-audio', ...EXTRA_ARGS] } : {}) }))
    const runs = []
    try {
      for (let run = 0; run < RUNS; run++) runs.push(await runOnce(browser, engine, fixture, run))
    } finally { await browser.close() }
    const summary = summarise(engine, runs)
    print(summary, runs)
    allMisses.push(...misses(summary).map(m => `${engine}: ${m}`))
    report.engines[engine] = { summary, runs }
  }
  if (OUT) await fs.writeFile(OUT, JSON.stringify(report, null, 2))
} finally {
  server.close()
}
if (allMisses.length) console.log(`\nTargets missed:\n  ${allMisses.join('\n  ')}`)
else console.log('\nAll targets met.')
if (allMisses.length && process.env.LIBRARY_SPEED_STRICT === '1') process.exit(1)
