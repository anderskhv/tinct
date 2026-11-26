// Listening keeps the reader's place (a reader's report, 26 Nov 2026: fifteen minutes heard on a phone, the book
// reopened where Play was pressed). On a built app (dist/), The Master and Margarita in Danish, chapter 4, a place
// saved on its first pages:
// - phone (WebKit, iPhone 13), nobody touches the screen after Play:
//   1. the saved place follows the voice page by page, so a page that dies with no warning (the tab is killed)
//      reopens within a page of the last word heard;
//   2. a pause that never passes through the reader's own button (the lock screen, headphones) saves the word heard;
//   3. the page going out of sight while the voice plays (the screen locks) saves the word heard, at once.
// - desktop Margin reader (Chromium 1440×900): the saved place follows the voice paragraph by paragraph.
// Nothing reaches production: narration is answered here from the chapter text in dist/ (even word timings), and the
// player is a silent stand-in whose clock runs on a timer (no media is fetched or played).
//   cd app && npm run build && node scripts/check-listen-keeps-place.mjs   (TINCT_DIST=<dir> for another build)
import fs from 'node:fs/promises'
import path from 'node:path'
import crypto from 'node:crypto'
import { createServer } from 'node:http'
import { build } from 'esbuild'
import { markInternal } from './lib/internalTraffic.cjs'

// PLAYWRIGHT_MODULE: another Playwright build (a machine whose installed browsers are not this project's).
const playwright = await import(process.env.PLAYWRIGHT_MODULE || '@playwright/test')
const { chromium, webkit, devices } = playwright.chromium ? playwright : playwright.default

const dist = path.resolve(process.env.TINCT_DIST || 'dist')
const output = path.resolve(process.env.TINCT_LISTEN_PLACE_OUTPUT || 'artifacts/listen-keeps-place')
await fs.mkdir(output, { recursive: true })
const BOOK = 'master-and-margarita', EDITION = 'modern-da', CHAPTER = 4
/** Words a second of the stand-in voice at 1×. */
const WPS = 3

const corePath = path.join(output, 'narrationCore.mjs')
await build({ entryPoints: [path.resolve('src/narration/narrationCore.ts')], bundle: true, format: 'esm', platform: 'node', outfile: corePath, logLevel: 'error' })
const core = await import(`${corePath}?${Date.now()}`)
const chapters = new Map()
async function chapterParagraphs(n) {
  if (!chapters.has(n)) {
    let paragraphs = []
    try {
      const raw = JSON.parse(await fs.readFile(path.join(dist, 'data', 'editions-chapters', `${BOOK}-${EDITION}`, `ch${String(n).padStart(4, '0')}.json`), 'utf8'))
      paragraphs = (raw.paragraphs || []).map(p => typeof p === 'string' ? p : p?.text ?? '')
    } catch { /* none */ }
    chapters.set(n, paragraphs)
  }
  return chapters.get(n)
}

const readBody = async req => { const parts = []; for await (const part of req) parts.push(part); return Buffer.concat(parts).toString('utf8') }
const server = createServer(async (req, res) => {
  const url = new URL(req.url || '/', 'http://127.0.0.1')
  const json = (status, body) => { res.writeHead(status, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }); res.end(JSON.stringify(body)) }
  try {
    if (url.pathname === '/api/narration/voices') return json(200, { enabled: true, provider: 'grok', model: 'mock', voices: [{ key: 'f', label: 'Ara', persona: 'female' }, { key: 'm', label: 'Helios', persona: 'male' }] })
    if (url.pathname === '/api/narration/ensure') {
      const body = JSON.parse(await readBody(req) || '{}')
      const source = await chapterParagraphs(Number(body.chapter))
      return json(200, {
        generated: 0,
        paragraphs: (body.paragraphs || []).map(item => {
          const text = core.narrationTextForParagraph(source[item.index] || ''), words = text ? text.split(' ') : []
          const chunks = core.chunkNarrationText(source[item.index] || '').map(chunk => {
            const duration = (chunk.wordTo - chunk.wordFrom) / WPS
            return { ...chunk, ready: true, hash: `${body.chapter}-${item.index}-${chunk.index}`, url: `/api/audio-file?fixture=${body.chapter}-${item.index}-${chunk.index}-d${duration}.mp3`, duration,
              words: words.slice(chunk.wordFrom, chunk.wordTo).map((word, i) => ({ text: word, start: i / WPS, end: (i + 1) / WPS })), timingsUsable: true }
          })
          if (!chunks.length) return { paragraph: item.index, status: 'failed', reason: 'unavailable' }
          return { paragraph: item.index, status: 'ready', textHash: item.textHash || crypto.createHash('sha256').update(text).digest('hex'), chunkCount: chunks.length, readyChunks: chunks.length, duration: words.length / WPS, words: null, timingsUsable: true, chunks, source: 'cache' }
        }),
      })
    }
    if (url.pathname.startsWith('/api/')) { if (req.method === 'POST') await readBody(req); return json(404, {}) }
    const file = path.resolve(dist, '.' + (url.pathname === '/reader' ? '/app.html' : url.pathname === '/' ? '/index.html' : decodeURIComponent(url.pathname)))
    if (!file.startsWith(dist + path.sep)) { res.writeHead(403); res.end(); return }
    const body = await fs.readFile(file)
    const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.woff2': 'font/woff2', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png', '.mjs': 'text/javascript', '.webmanifest': 'application/manifest+json' }[path.extname(file)] || 'application/octet-stream'
    res.writeHead(200, { 'Content-Type': mime }); res.end(body)
  } catch { if (!res.headersSent) res.writeHead(404); res.end() }
})
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
const origin = `http://127.0.0.1:${server.address().port}`

let failures = 0
const ok = (label, pass, detail) => { if (!pass) failures++; console.log(`${pass ? 'ok  ' : 'FAIL'} ${label}${detail !== undefined ? ' ' + JSON.stringify(detail).slice(0, 700) : ''}`) }

/**
 * A silent player whose clock runs on a timer (×window.__audioRate) and fires the media events the reader listens
 * to; the lock screen's handlers are kept in window.__media so a check can press them. The reading place is seeded
 * once for the context: a second page in it opens from whatever the first one saved.
 */
function initScript({ book, start, edition }) {
  class SilentAudio extends EventTarget {
    constructor() {
      super()
      Object.assign(this, { _src: '', currentTime: 0, duration: NaN, paused: true, ended: false, playbackRate: 1, defaultPlaybackRate: 1, preload: 'auto', muted: true, volume: 1, readyState: 0, networkState: 1, _timer: 0 })
    }
    get buffered() { const end = Number.isFinite(this.duration) ? this.duration : 0; return { length: 1, start: () => 0, end: () => end } }
    get src() { return this._src }
    set src(value) {
      this._src = value ? new URL(value, location.href).href : ''
      this.currentTime = 0; this.ended = false
      const m = /-d([\d.]+)\.mp3/.exec(decodeURIComponent(this._src))
      this.duration = m ? Number(m[1]) : 1
      this.readyState = 4
      queueMicrotask(() => { for (const type of ['loadstart', 'durationchange', 'loadedmetadata', 'loadeddata', 'progress', 'canplay', 'canplaythrough']) this.dispatchEvent(new Event(type)) })
    }
    get currentSrc() { return this._src }
    play() {
      this.paused = false; this.ended = false
      clearInterval(this._timer)
      this._timer = setInterval(() => {
        if (this.paused) return
        this.currentTime = Math.min(this.duration, this.currentTime + 0.1 * this.playbackRate * (window.__audioRate || 1))
        this.dispatchEvent(new Event('timeupdate')); this.dispatchEvent(new Event('progress'))
        if (this.currentTime >= this.duration) {
          this.paused = true; this.ended = true; clearInterval(this._timer)
          this.dispatchEvent(new Event('pause')); this.dispatchEvent(new Event('ended'))
        }
      }, 100)
      queueMicrotask(() => { this.dispatchEvent(new Event('play')); this.dispatchEvent(new Event('playing')) })
      return Promise.resolve()
    }
    pause() { clearInterval(this._timer); if (!this.paused) { this.paused = true; queueMicrotask(() => this.dispatchEvent(new Event('pause'))) } }
    load() {}
    canPlayType() { return 'probably' }
    setAttribute() {}
    removeAttribute(name) { if (name === 'src') this._src = '' }
  }
  window.Audio = SilentAudio
  HTMLMediaElement.prototype.play = async function () { this.muted = true }
  if (navigator.mediaDevices) Object.defineProperty(navigator.mediaDevices, 'getUserMedia', { configurable: true, value: async () => { throw Error('Microphone disabled') } })
  window.__media = {}
  const session = navigator.mediaSession
  if (session) {
    const set = session.setActionHandler.bind(session)
    session.setActionHandler = (action, handler) => { window.__media[action] = handler; try { set(action, handler) } catch { /* unsupported */ } }
  }
  if (localStorage.getItem('listen-keeps-place-seeded')) return
  localStorage.setItem('listen-keeps-place-seeded', '1')
  const now = Date.now() - 60000
  localStorage.setItem('tinct:wipe-v1-done', '1')
  localStorage.setItem('tinct-lab-prefs', JSON.stringify({ theme: 'light', compareOpen: false, primaryEdition: edition, voicePersona: 'female', voicePersonaChosen: true, audioSpeed: 1 }))
  localStorage.setItem('tinct-lab-position', JSON.stringify({ books: { [book]: { bookId: book, headerBook: book, sequentialChapter: start.chapterNumber, ...start, primaryEditionKey: edition, readerMode: 'read', updatedAt: now, deviceId: 'qa', rev: 1 } }, finished: {}, hidden: {}, lastSettledBookId: book, lastSettledAt: now, updatedAt: now, deviceId: 'qa' }))
}

const external = []
const START = { chapterNumber: CHAPTER, paragraphIndex: 0, wordIndex: 40 }
async function newContext(browser, name, contextOptions) {
  const context = await browser.newContext({ serviceWorkers: 'block', ...contextOptions })
  await context.route('**/*', route => {
    const u = new URL(route.request().url())
    if (u.origin === origin || u.protocol === 'data:' || u.protocol === 'blob:') return route.continue()
    external.push(`${name}: ${u.hostname}${u.pathname}`)
    return route.abort()
  })
  await context.addInitScript(initScript, { book: BOOK, start: START, edition: EDITION })
  return context
}
async function openReader(context, query = '') {
  const page = await context.newPage()
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  await page.goto(`${origin}/reader?book=${BOOK}${query}`, { waitUntil: 'domcontentloaded' })
  await page.waitForFunction(() => document.querySelector('[data-testid="lab-root"]')?.dataset.readerReady === 'true', null, { timeout: 60000 })
  await page.evaluate(() => document.fonts.ready)
  await page.waitForTimeout(1200)
  return { page, errors }
}

/** The voice's word (painted as current), the reading place on screen, and the place this device has saved. */
const look = page => page.evaluate(book => {
  const lab = document.querySelector('[data-testid="lab-root"]')
  const current = [...document.querySelectorAll('[data-testid="lab-word"].is-current')].find(word => word.getBoundingClientRect().height > 0) || document.querySelector('[data-testid="lab-word"].is-current')
  const saved = JSON.parse(localStorage.getItem('tinct-lab-position') || 'null')?.books?.[book]
  const first = [...document.querySelectorAll('[data-testid="lab-reading-stage"] [data-testid="lab-word"]')].find(word => word.getBoundingClientRect().height > 0)
  return {
    playing: lab?.dataset.playing === 'true',
    place: lab?.dataset.place,
    voice: current ? { p: Number(current.dataset.paragraphIndex), w: Number(current.dataset.wordIndex) } : null,
    saved: saved ? { ch: saved.sequentialChapter, p: saved.paragraphIndex, w: saved.wordIndex } : null,
    pageStart: first ? { p: Number(first.dataset.paragraphIndex), w: Number(first.dataset.wordIndex) } : null,
  }
}, BOOK)
const waitFor = async (page, test, timeout = 4000) => {
  const start = Date.now()
  let last
  while (Date.now() - start < timeout) { last = await look(page); if (test(last)) return last; await page.waitForTimeout(80) }
  return last
}
/** Words from `from` on to `to` in chapter 4 (negative when `to` is earlier). */
const tokens = (await chapterParagraphs(CHAPTER)).map(text => core.narrationTokens(text))
const ordinal = at => tokens.slice(0, at.p).reduce((sum, list) => sum + list.length, 0) + at.w
const wordsBetween = (from, to) => ordinal(to) - ordinal(from)
/** A phone page of this chapter holds well under 160 words. */
const PAGE_WORDS = 160

/** Play, then let the voice run (fast) until it is in paragraph `until` or later, with no tap after Play. */
async function listenTo(page, until, play) {
  await play()
  let now = await waitFor(page, s => s.playing && s.voice, 8000)
  if (!now.playing || !now.voice) return now
  await page.evaluate(() => { window.__audioRate = 30 })
  now = await waitFor(page, s => !!s.voice && s.voice.p >= until, 60000)
  await page.evaluate(() => { window.__audioRate = 1 })
  await page.waitForTimeout(400)
  return look(page)
}
/** How far the saved place is behind the voice, in words (null when either is missing or in another chapter). */
const behindVoice = s => s.voice && s.saved?.ch === CHAPTER ? wordsBetween(s.saved, s.voice) : null
/**
 * The voice ran ahead faster than any voice reads (×30), and saves made as it reads on are spaced in real time
 * (LISTEN_PLACE_MIN_GAP_MS). At its true speed again, the saved place catches up within that spacing.
 */
const savedCatchesUp = page => waitFor(page, s => { const behind = behindVoice(s); return behind !== null && behind >= 0 && behind <= PAGE_WORDS }, 40000)

// ── Phone (WebKit, iPhone 13) ────────────────────────────────────────────────────────────────────────────────────
const phoneBrowser = await markInternal(await webkit.launch({ headless: true }))
try {
  // 1. Hands-free listening, then the page dies with no warning.
  {
    const context = await newContext(phoneBrowser, 'phone-kill', { ...devices['iPhone 13'] })
    const { page, errors } = await openReader(context)
    const opened = await look(page)
    ok('phone: the book opens at its saved place in chapter 4', opened.saved?.ch === CHAPTER && opened.saved.p === 0 && opened.pageStart?.p === 0, opened)
    const heard = await listenTo(page, 12, () => page.getByTestId('lab-v2-play').click())
    ok('phone: Play starts the voice and it reads on by itself', heard.playing && !!heard.voice && heard.voice.p >= 12, heard)
    await page.screenshot({ path: path.join(output, 'phone-1-listening.png') })
    const kept = await savedCatchesUp(page)
    const behind = behindVoice(kept)
    ok('phone: with no tap since Play, the saved place is within a page of the word being read', behind !== null && behind >= 0 && behind <= PAGE_WORDS, { voice: kept.voice, saved: kept.saved, wordsBehind: behind })
    // The tab is killed: nothing the page does on its way out can run.
    await page.evaluate(() => {
      const mute = event => event.stopImmediatePropagation()
      for (const type of ['pagehide', 'visibilitychange', 'beforeunload', 'unload', 'freeze']) window.addEventListener(type, mute, true)
    })
    const last = await look(page)
    await page.close()
    const again = await openReader(context)
    const reopened = await look(again.page)
    await again.page.screenshot({ path: path.join(output, 'phone-1-reopened.png') })
    const lost = last.voice && reopened.pageStart ? wordsBetween(reopened.pageStart, last.voice) : null
    ok('phone: reopened after the kill, the book is within a page of the last word heard', lost !== null && lost >= 0 && lost <= PAGE_WORDS, { heard: last.voice, reopenedAt: reopened.pageStart, place: reopened.place, wordsLost: lost })
    ok('phone (kill): no page errors', errors.length === 0 && again.errors.length === 0, [...errors, ...again.errors])
    await context.close()
  }
  // 2. Paused from the lock screen: the reader's own Pause button is never pressed.
  {
    const context = await newContext(phoneBrowser, 'phone-lock-pause', { ...devices['iPhone 13'] })
    const { page, errors } = await openReader(context)
    const heard = await listenTo(page, 6, () => page.getByTestId('lab-v2-play').click())
    const hasHandler = await page.evaluate(() => typeof window.__media.pause === 'function')
    ok('phone: the lock screen has a Pause control', hasHandler)
    await page.evaluate(() => window.__media.pause?.())
    const paused = await waitFor(page, s => !s.playing, 4000)
    await page.waitForTimeout(300)
    const after = await look(page)
    const gap = after.saved && heard.voice ? wordsBetween(after.saved, heard.voice) : null
    ok('phone: paused from the lock screen, the saved place is the sentence being read', !paused.playing && after.saved?.ch === CHAPTER && gap !== null && Math.abs(gap) <= 40, { voiceBeforePause: heard.voice, saved: after.saved, wordsApart: gap })
    ok('phone (lock-screen pause): no page errors', errors.length === 0, errors)
    await context.close()
  }
  // 3. The screen locks while the voice plays: the page is hidden, and may be frozen right after.
  {
    const context = await newContext(phoneBrowser, 'phone-hidden', { ...devices['iPhone 13'] })
    const { page, errors } = await openReader(context)
    const heard = await listenTo(page, 9, () => page.getByTestId('lab-v2-play').click())
    // Saved in the same turn of the event loop as the event: a frozen page gets no later turn.
    const atHide = await page.evaluate(book => {
      const current = [...document.querySelectorAll('[data-testid="lab-word"].is-current')].find(word => word.getBoundingClientRect().height > 0)
      Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'hidden' })
      Object.defineProperty(document, 'hidden', { configurable: true, get: () => true })
      document.dispatchEvent(new Event('visibilitychange'))
      const saved = JSON.parse(localStorage.getItem('tinct-lab-position') || 'null')?.books?.[book]
      return { voice: current ? { p: Number(current.dataset.paragraphIndex), w: Number(current.dataset.wordIndex) } : null, saved: saved ? { ch: saved.sequentialChapter, p: saved.paragraphIndex, w: saved.wordIndex } : null }
    }, BOOK)
    const gap = atHide.saved && atHide.voice ? wordsBetween(atHide.saved, atHide.voice) : null
    ok('phone: the page hidden while the voice plays saves the word being read, at once', heard.playing && atHide.saved?.ch === CHAPTER && gap !== null && Math.abs(gap) <= 40, { ...atHide, wordsApart: gap })
    ok('phone (hidden): no page errors', errors.length === 0, errors)
    await context.close()
  }
} finally { await phoneBrowser.close() }

// ── Desktop Margin reader (Chromium 1440×900): one scroll, no pages ──────────────────────────────────────────────
const browser = await markInternal(await chromium.launch({ headless: true, executablePath: process.env.PLAYWRIGHT_CHROMIUM || undefined, args: ['--mute-audio'] }))
try {
  const context = await newContext(browser, 'desktop-margin', { viewport: { width: 1440, height: 900 } })
  const { page, errors } = await openReader(context, '&sharedReader=1')
  const margin = await page.evaluate(() => !!document.querySelector('[data-testid="continuous-reader"]'))
  ok('desktop: the Margin reader is on', margin)
  const heard = await listenTo(page, 12, () => page.getByTestId('lab-v2-play').click())
  ok('desktop: Play starts the voice and it reads on by itself', heard.playing && !!heard.voice && heard.voice.p >= 12, heard)
  const kept = await savedCatchesUp(page)
  const behind = behindVoice(kept)
  ok('desktop: with no click since Play, the saved place is within a paragraph or two of the word being read', behind !== null && behind >= 0 && behind <= PAGE_WORDS, { voice: kept.voice, saved: kept.saved, wordsBehind: behind })
  ok('desktop: no page errors', errors.length === 0, errors)
  await context.close()
} finally { await browser.close() }

server.close()
ok('nothing reached any other host', external.length === 0, external.slice(0, 10))
console.log(failures ? `${failures} check(s) failed` : 'all checks passed', `· screenshots in ${output}`)
process.exit(failures ? 1 : 0)
