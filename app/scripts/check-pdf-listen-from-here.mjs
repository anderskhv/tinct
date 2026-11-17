// Listen from here in an own PDF's original pages (Anders, 16 Nov 2026: parity with the text reader), on a built app
// (dist/) with a PDF the caller supplies (never downloaded, never kept). The PDF is added through the real file picker;
// the account, storage and narration are synthetic, and the player is a silent stand-in whose clock runs on a timer
// (no media is fetched or played, no AI or TTS is called); its clock runs at a tenth of real time so each step can be
// seen where it lands.
// - desktop (Chromium 1280×900) and phone (WebKit iPhone 13; Chromium iPhone 13 when WebKit is missing):
//   Play reads the page; a word selected mid-page and "Listen from here" in the selection bar moves the voice to it;
//   the reader moving away is never pulled back to the voice; after a moment off the voice the two pills show;
//   "Back to the voice" brings the voice's word on screen; "Listen from here" moves the voice to what is on screen and
//   leaves the reader's place where it is.
//   cd app && npm run build && node scripts/check-pdf-listen-from-here.mjs <file.pdf> [first page] [away page]
//   (TINCT_DIST=<dir> for another build, TINCT_PDF_LISTEN_OUTPUT=<dir> for the screenshots)
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { createServer } from 'node:http'
import fs from 'node:fs/promises'
import path from 'node:path'
import { chromium, webkit, devices } from '@playwright/test'
import { build } from 'esbuild'
import { markInternal } from './lib/internalTraffic.cjs'

const [filePath, firstArg, awayArg] = process.argv.slice(2)
assert(filePath, 'Supply a local PDF path; this check never downloads documents.')
const FIRST = Number(firstArg || 2), AWAY = Number(awayArg || FIRST + 6)
const dist = path.resolve(process.env.TINCT_DIST || 'dist')
const output = path.resolve(process.env.TINCT_PDF_LISTEN_OUTPUT || 'artifacts/pdf-listen-from-here')
await fs.mkdir(output, { recursive: true })
// The narrator's own words and sentence groups, so the stand-in answers exactly what the reader asks for.
const corePath = path.join(output, 'narrationCore.mjs')
await build({ entryPoints: [path.resolve('src/narration/narrationCore.ts')], bundle: true, format: 'esm', platform: 'node', outfile: corePath, logLevel: 'error' })
const core = await import(`${corePath}?${Date.now()}`)
const fileId = 'e'.repeat(32), owner = 'pdf-listen-fixture-owner'
/** Words a second of the stand-in voice at 1×. */
const WPS = 3
const bundle = (await fs.readdir(path.join(dist, 'assets'))).find(name => /^supabase-.*\.js$/.test(name))
const ref = bundle && /https:\/\/([a-z0-9]+)\.supabase\.co/.exec(await fs.readFile(path.join(dist, 'assets', bundle), 'utf8'))?.[1]
assert(ref, 'built reader must include a synthetic Supabase project reference')
const authKey = `sb-${ref}-auth-token`
const mime = file => ({ '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json',
  '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.wasm': 'application/wasm' }[path.extname(file)] || 'application/octet-stream')
const server = createServer(async (req, res) => {
  const url = new URL(req.url || '/', 'http://127.0.0.1')
  if (url.pathname === '/qa-seed') { res.writeHead(200, { 'Content-Type': 'text/html' }); res.end('<!doctype html><meta charset="utf-8"><title>PDF owner fixture</title>'); return }
  // The Worker sends a kept book's Add a book address on to the reader (as check-pdf-real-files.mjs's server does).
  if (url.pathname === '/lab/addbook/' && url.searchParams.has('userBook')) { res.writeHead(308, { Location: '/reader' + url.search }); res.end(); return }
  const file = path.resolve(dist, '.' + (url.pathname === '/reader' ? '/app.html' : decodeURIComponent(url.pathname)))
  if (!file.startsWith(dist + path.sep)) { res.writeHead(403); res.end(); return }
  try { const body = await fs.readFile(file); res.writeHead(200, { 'Content-Type': mime(file) }); res.end(body) } catch { res.writeHead(404); res.end() }
})
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
const origin = `http://127.0.0.1:${server.address().port}`

let failures = 0
const ok = (label, pass, detail) => { if (!pass) failures++; console.log(`${pass ? 'ok  ' : 'FAIL'} ${label}${detail !== undefined ? ' ' + JSON.stringify(detail).slice(0, 500) : ''}`) }

/** A silent player: its clock runs on a timer and it fires the media events the reader listens to. */
function initScript({ authKey, owner }) {
  localStorage.setItem(authKey, JSON.stringify({ access_token: 'pdf-fixture', refresh_token: 'pdf-fixture', expires_in: 3600, expires_at: Math.floor(Date.now() / 1000) + 36000,
    token_type: 'bearer', user: { id: owner, email: 'pdf@example.test', aud: 'authenticated' } }))
  localStorage.setItem('tinct-lab-prefs', JSON.stringify({ theme: 'light', voicePersona: 'female', voicePersonaChosen: true, audioSpeed: 1 }))
  class SilentAudio extends EventTarget {
    constructor() { super(); Object.assign(this, { _src: '', currentTime: 0, duration: NaN, paused: true, ended: false, playbackRate: 1, defaultPlaybackRate: 1, preload: 'auto', muted: true, volume: 1, readyState: 0, networkState: 1, _timer: 0, error: null }) }
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
        this.currentTime = Math.min(this.duration, this.currentTime + 0.1 * this.playbackRate * window.__audioRate)
        this.dispatchEvent(new Event('timeupdate'))
        if (this.currentTime >= this.duration) { this.paused = true; this.ended = true; clearInterval(this._timer); this.dispatchEvent(new Event('pause')); this.dispatchEvent(new Event('ended')) }
      }, 100)
      queueMicrotask(() => { this.dispatchEvent(new Event('play')); this.dispatchEvent(new Event('playing')) })
      return Promise.resolve()
    }
    pause() { clearInterval(this._timer); if (!this.paused) { this.paused = true; queueMicrotask(() => this.dispatchEvent(new Event('pause'))) } }
    load() {} canPlayType() { return 'probably' } setAttribute() {} removeAttribute(name) { if (name === 'src') this._src = '' }
  }
  // The voice's clock runs slowly, so where it is can be seen and checked between steps.
  window.__audioRate = 0.1
  window.Audio = SilentAudio
  HTMLMediaElement.prototype.play = async function () { this.muted = true }
  if (window.speechSynthesis) window.speechSynthesis.speak = () => { throw Error('Browser speech must not be used') }
}

async function run(name, browserType, contextOptions, phone) {
  const bytes = await fs.readFile(filePath), sha256 = createHash('sha256').update(bytes).digest('hex'), hex = sha256.slice(0, 24)
  const book = { id: fileId, type: 'pdf', sha256, name: 'document.pdf', title: '', author: '', size: bytes.length, createdAt: '2026-11-16T00:00:00.000Z' }
  let uploaded = false
  const ensured = [], denied = [], errors = []
  const browser = await markInternal(await browserType.launch({ headless: true, ...(browserType === chromium ? { args: ['--mute-audio'] } : {}) }))
  const context = await browser.newContext({ serviceWorkers: 'block', reducedMotion: 'reduce', ...contextOptions })
  const page = await context.newPage()
  page.on('pageerror', error => errors.push(error.message))
  if (process.env.PDF_LISTEN_DEBUG) page.on('console', message => console.log(`${name} console: ${message.text().slice(0, 300)}`))
  await context.route(url => url.hostname.endsWith('.supabase.co') || url.origin !== origin || url.pathname.startsWith('/api/'), async route => {
    const request = route.request(), url = new URL(request.url()), p = url.pathname
    const cors = { 'Access-Control-Allow-Origin': origin, 'Access-Control-Allow-Methods': 'GET, POST, PATCH, PUT, OPTIONS', 'Access-Control-Allow-Headers': request.headers()['access-control-request-headers'] || 'authorization, apikey, content-type, x-client-info, prefer' }
    const json = (status, body) => route.fulfill({ status, contentType: 'application/json', headers: cors, body: JSON.stringify(body) })
    if (url.hostname.endsWith('.supabase.co')) {
      if (request.method() === 'OPTIONS') return route.fulfill({ status: 204, headers: cors })
      if (p === '/auth/v1/user') return json(200, { id: owner, email: 'pdf@example.test', aud: 'authenticated' })
      if (p.startsWith('/rest/v1/')) return json(200, [])
      return json(404, {})
    }
    if (url.origin !== origin) { denied.push(url.origin); return route.abort() }
    if (!p.startsWith('/api/')) return route.continue()
    if (process.env.PDF_LISTEN_DEBUG) console.log(`${name} api: ${request.method()} ${p}${url.search} ${(request.postData() || '').slice(0, 200)}`)
    if (p === '/api/public-books') return json(200, { books: [] })
    if (p === '/api/user-books') {
      if (request.method() === 'POST') { uploaded = true; return json(201, { book }) }
      return json(200, { books: uploaded ? [book] : [] })
    }
    if (p === `/api/user-books/${fileId}`) return route.fulfill({ contentType: 'application/pdf', body: bytes })
    if (p === `/api/user-books/marks/${hex}` || p === `/api/user-books/cards/${hex}`) {
      const kind = p.includes('/marks/') ? 'marks' : 'cards'
      return request.method() === 'GET' ? json(200, { [kind]: [], rev: 0, fileId }) : json(200, { rev: 1, fileId })
    }
    if (p === '/api/user-books/places') return json(200, { places: {} })
    if (/^\/api\/user-books\/(?:places|covers|primers)\//.test(p)) return json(200, { place: null, cover: null, primer: null })
    if (p === '/api/narration/voices') return json(200, { enabled: true, provider: 'grok', ownBooks: true,
      voices: [{ key: 'f', label: 'Ara', persona: 'female' }, { key: 'm', label: 'Helios', persona: 'male' }] })
    if (p === '/api/narration/own/ensure') {
      const input = request.postDataJSON()
      assert.equal(input.book, hex, 'only the owned narration route receives the private hex')
      ensured.push(input.paragraphs.map(({ text }) => text.trim().split(/\s+/).slice(0, 3).join(' ')).join(' / '))
      return json(200, { paragraphs: input.paragraphs.map(({ index, text }) => {
        const tokens = core.narrationTokens(text)
        const chunks = core.chunkNarrationTokens(tokens).map(chunk => {
          const duration = (chunk.wordTo - chunk.wordFrom) / WPS
          return { ...chunk, ready: true, hash: `${index}-${chunk.index}`, url: `/api/narration/own/audio?fixture=${index}-${chunk.index}-d${duration}.mp3`, duration,
            words: tokens.slice(chunk.wordFrom, chunk.wordTo).map((word, i) => ({ text: word, start: i / WPS, end: (i + 1) / WPS })), timingsUsable: true }
        })
        return { paragraph: index, status: 'ready', textHash: createHash('sha256').update(tokens.join(' ')).digest('hex'),
          chunkCount: chunks.length, readyChunks: chunks.length, duration: tokens.length / WPS, words: null, timingsUsable: true, chunks, source: 'cache' }
      }) })
    }
    if (p === '/api/narration/own/audio') return route.fulfill({ contentType: 'audio/mpeg', body: Buffer.alloc(128) })
    if (p === '/api/chat' || p.startsWith('/api/voice')) return json(503, { error: 'not in this check' })
    return json(404, { error: 'fixture endpoint unavailable' })
  })
  await page.addInitScript(initScript, { authKey, owner })
  const shot = async label => page.screenshot({ path: path.join(output, `${name}-${label}.png`) })
  /** The reader's view of the pages, the voice's word (the follow mark) and the pills. */
  const look = () => page.evaluate(() => {
    const host = document.querySelector('.pdf-original__scroll'), box = host.getBoundingClientRect()
    const header = document.querySelector('.lab-header')?.getBoundingClientRect(), rail = document.querySelector('.pdf-original-reader__footer')?.getBoundingClientRect()
    const view = { top: Math.max(box.top, header?.bottom ?? box.top), bottom: Math.min(box.bottom, rail && rail.height ? rail.top : box.bottom) }
    const mark = document.querySelector('.pdf-original__follow'), at = mark?.getBoundingClientRect()
    return { scrollTop: Math.round(host.scrollTop), view, follow: at ? { top: Math.round(at.top), bottom: Math.round(at.bottom), page: Number(mark.closest('.pdf-original__page')?.dataset.page) } : null,
      followOnScreen: !!at && at.top >= view.top - 1 && at.bottom <= view.bottom + 1, pills: !!document.querySelector('[data-testid="lab-listen-pills"]') }
  })
  const goToPage = n => page.locator('.pdf-original__scroll').evaluate((host, n) => { const slot = host.querySelector(`.pdf-original__slot[data-page="${n}"]`); host.scrollTop = slot.offsetTop + 40 }, n)
  /** A span in the middle of a page's text, well inside the view: the word the reader selects. */
  const middleSpan = n => page.evaluate(n => {
    const spans = [...document.querySelectorAll(`.pdf-original__page[data-page="${n}"] .pdf-original__text span[data-pdf-item]:not([data-pdf-furniture])`)]
      .filter(span => /\p{L}{4,}/u.test(span.textContent || '') && span.getBoundingClientRect().height > 0)
      .map(span => ({ span, box: span.getBoundingClientRect() })).filter(({ box }) => box.top > 160 && box.bottom < innerHeight - 160)
    const chosen = spans[Math.floor(spans.length / 2)]
    if (!chosen) return null
    const word = /\p{L}{4,}/u.exec(chosen.span.textContent), index = word.index
    return { item: chosen.span.dataset.pdfItem, word: word[0], index, top: Math.round(chosen.box.top), bottom: Math.round(chosen.box.bottom), left: chosen.box.left, height: chosen.box.height }
  }, n)
  try {
    await page.goto(`${origin}/qa-seed`)
    await page.addScriptTag({ url: origin + '/lab/wait-ring.js' })
    await page.addStyleTag({ url: origin + '/lab/tinct-ui.css' })
    await page.evaluate(async () => { document.documentElement.classList.add('signed-in'); const { openFileDialog } = await import('/lab/library_2/add-to-tinct.js'); openFileDialog() })
    await page.locator('input[type=file]').setInputFiles(filePath)
    const rights = page.locator('.own-file-rights-box')
    await rights.waitFor({ timeout: 30000 }); await rights.check()
    await page.locator('.own-file-continue').click()
    await page.waitForURL('**/reader?**', { timeout: 45000, waitUntil: 'domcontentloaded' })
    await page.locator('.pdf-original__page canvas').first().waitFor({ timeout: 120000 })
    ok(`${name}: the PDF opens in its original pages`, await page.locator('[data-pdf-original="true"]').count() === 1)
    await shot('01-opened')

    // Play on the first page checked.
    await goToPage(FIRST)
    await page.locator(`.pdf-original__page[data-page="${FIRST}"][data-ready="true"]`).waitFor({ timeout: 45000 })
    await page.waitForTimeout(800)
    await page.getByRole('button', { name: 'Listen', exact: true }).click()
    await page.waitForFunction(() => !!document.querySelector('.pdf-original__follow'), null, { timeout: 30000 })
    const playing = await look()
    ok(`${name}: Play reads the page in view`, playing.follow?.page === FIRST, playing.follow)
    await shot('02-playing')

    // Select a word mid-page: Listen from here in the selection bar starts the voice there.
    const target = await middleSpan(FIRST)
    assert(target, 'a word mid-page to select')
    if (phone) {
      await page.evaluate(({ item, index, word, n }) => {
        const span = document.querySelector(`.pdf-original__page[data-page="${n}"] .pdf-original__text span[data-pdf-item="${item}"]`), text = span.firstChild
        const range = document.createRange(); range.setStart(text, index); range.setEnd(text, index + word.length)
        const selection = getSelection(); selection.removeAllRanges(); selection.addRange(range)
        // The finger lifts (a touch screen reads the selection once it rests; this also ends it at once).
        span.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }))
      }, { ...target, n: FIRST })
      await page.getByTestId('lab-pbar-listen').waitFor({ timeout: 10000 })
      await shot('03-selection-bar')
      await page.getByTestId('lab-pbar-listen').click()
    } else {
      const span = page.locator(`.pdf-original__page[data-page="${FIRST}"] .pdf-original__text span[data-pdf-item="${target.item}"]`)
      const box = await span.boundingBox()
      const chars = (await span.textContent()).length, x = box.x + box.width * (target.index + 2) / chars
      await page.mouse.dblclick(x, box.y + box.height / 2)
      await page.getByTestId('lab-dbar-listen').waitFor({ timeout: 10000 })
      await page.getByTestId('lab-dbar-listen').hover()
      await shot('03-selection-bar')
      await page.getByTestId('lab-dbar-listen').click()
    }
    // Where the voice lands: its word painted on the selected word's line.
    let moved = await look()
    for (let t = 0; t < 40 && !(moved.follow?.page === FIRST && Math.abs(moved.follow.top - target.top) <= target.height); t++) { await page.waitForTimeout(50); moved = await look() }
    ok(`${name}: Listen from here on a selection starts the voice at the selected word ("${target.word}")`,
      moved.follow?.page === FIRST && Math.abs(moved.follow.top - target.top) <= target.height, { follow: moved.follow, word: target })
    ok(`${name}: the selection bar goes once the voice has moved`, await page.locator('[data-testid="lab-desk-bar"], [data-testid="lab-phone-bar"]').count() === 0)
    await shot('03b-listen-from-selection')

    // The reader moves away: never pulled back; after a moment, the pills.
    const away = async () => {
      if (phone) {
        // A finger's scroll: the page rail's next page, then a touch drag on the pages.
        await page.getByRole('button', { name: 'Next PDF page' }).click()
        await page.locator('.pdf-original__scroll').evaluate((host, n) => {
          host.dispatchEvent(new TouchEvent('touchmove', { bubbles: true }))
          const slot = host.querySelector(`.pdf-original__slot[data-page="${n}"]`); host.scrollTop = slot.offsetTop + 40
        }, AWAY)
      } else {
        await page.mouse.move(640, 450)
        for (let i = 0; i < 12 && (await look()).scrollTop < await page.locator('.pdf-original__scroll').evaluate((host, n) => host.querySelector(`.pdf-original__slot[data-page="${n}"]`).offsetTop, AWAY); i++) await page.mouse.wheel(0, 900)
      }
      await page.waitForTimeout(1500)
    }
    await away()
    const off = await look()
    await page.waitForTimeout(1500)
    const still = await look()
    ok(`${name}: moving away while the voice reads is never pulled back to it`, Math.abs(still.scrollTop - off.scrollTop) <= 2 && !still.followOnScreen, { off: off.scrollTop, still: still.scrollTop })
    ok(`${name}: off the voice, the two pills show`, still.pills
      && await page.getByTestId('lab-back-to-voice').textContent() === '↑ Back to the voice' && await page.getByTestId('lab-listen-from-here').textContent() === '▶ Listen from here')
    await shot('04-away-pills')

    await page.getByTestId('lab-back-to-voice').click()
    await page.waitForTimeout(1500)
    const back = await look()
    ok(`${name}: Back to the voice brings the voice's word on screen`, back.followOnScreen && !back.pills, back)
    await shot('05-back-to-the-voice')

    await away()
    await page.waitForFunction(() => !!document.querySelector('[data-testid="lab-listen-pills"]'), null, { timeout: 10000 })
    const before = await look()
    await page.getByTestId('lab-listen-from-here').click()
    await page.waitForFunction(() => { const mark = document.querySelector('.pdf-original__follow'); return !!mark && mark.getBoundingClientRect().top > 0 && mark.getBoundingClientRect().bottom < innerHeight }, null, { timeout: 15000 })
    await page.waitForTimeout(800)
    const here = await look()
    ok(`${name}: Listen from here moves the voice to what is on screen`, here.followOnScreen && !here.pills, here.follow)
    ok(`${name}: Listen from here leaves the reader's place where it is`, Math.abs(here.scrollTop - before.scrollTop) <= 2, { before: before.scrollTop, after: here.scrollTop })
    await shot('06-listen-from-here')
    ok(`${name}: narration was asked only of the synthetic own-book route`, ensured.length > 0 && !denied.length, { ensured: ensured.slice(0, 6), denied })
    ok(`${name}: no page errors`, !errors.length, errors)
  } catch (error) {
    failures++
    console.log(`FAIL ${name}: ${error.stack || error.message}`)
    await shot('failure').catch(() => {})
  } finally {
    await browser.close()
  }
}

await run('desktop', chromium, { viewport: { width: 1280, height: 900 } }, false)
let phoneEngine = webkit
try { const probe = await webkit.launch({ headless: true }); await probe.close() } catch { phoneEngine = chromium; console.log('WebKit unavailable: the phone runs in Chromium as an iPhone 13') }
const { defaultBrowserType: _engine, ...iphone } = devices['iPhone 13']
await run(phoneEngine === webkit ? 'phone-webkit' : 'phone-chromium', phoneEngine, iphone, true)
server.close()
console.log(failures ? `${failures} failed` : 'all passed', '· screenshots in', output)
process.exit(failures ? 1 : 0)
