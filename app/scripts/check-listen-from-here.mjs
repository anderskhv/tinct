// Listen from here (Anders approved the mockups, 16 Nov 2026), on a built app (dist/), Frankenstein Letter 4:
// - desktop Margin reader (Chromium 1440×900): playing, the reader scrolls well ahead; once the view rests, two pills
//   ("Back to the voice", "Listen from here") show and the old "Back to audio" does not. Listen from here moves the
//   voice and the reading place to the first sentence that begins below the top bar; Back to the voice brings the
//   voice's word back on screen; the pills go by themselves when the voice's word is back on screen (scrolled back,
//   or the voice caught up).
// - desktop gutter ▶ (voice on only): resting 250 ms in a paragraph's left gutter, never on the text, shows a ▶ at its first line (never before
//   ~450 ms, never beside the voice's paragraph, never with a text selection); it shifts nothing; its tooltip shows on
//   the button; a click starts the voice at the paragraph's first word (from a stop, and while playing). None on a
//   touch device.
// - phone (WebKit, iPhone 13): pages turned ahead while playing show the pills; Listen from here starts at the first
//   sentence that begins on that page.
// Nothing reaches production: narration is answered here from the chapter text in dist/ (even word timings), and the
// player is a silent stand-in whose clock runs on a timer (no media is fetched or played).
// Every address carries ?sharedReader=1 (CI's plain build leaves the Margin reader off by default).
//   cd app && npm run build && node scripts/check-listen-from-here.mjs   (TINCT_DIST=<dir> for another build)
import fs from 'node:fs/promises'
import path from 'node:path'
import crypto from 'node:crypto'
import { createServer } from 'node:http'
import { chromium, webkit, devices } from '@playwright/test'
import { build } from 'esbuild'
import { markInternal } from './lib/internalTraffic.cjs'

const dist = path.resolve(process.env.TINCT_DIST || 'dist')
const output = path.resolve(process.env.TINCT_LISTEN_FROM_HERE_OUTPUT || 'artifacts/listen-from-here')
await fs.mkdir(output, { recursive: true })
const BOOK = 'frankenstein', EDITION = 'original-en', CHAPTER = 4
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
const tokensOf = new Map()
const loadTokens = async chapter => { if (!tokensOf.has(chapter)) tokensOf.set(chapter, (await chapterParagraphs(chapter)).map(text => core.narrationTokens(text))) ; return tokensOf.get(chapter) }
const tokens = await loadTokens(CHAPTER)
/** A sentence begins at a paragraph's first word or after a word ending . ! ? (closing quotes allowed). */
const begins = (p, w, chapter = CHAPTER) => {
  if (w === 0) return true
  const own = tokensOf.get(chapter) || []
  const before = own[p]?.[w - 1] || '', word = own[p]?.[w] || ''
  if (!/[.!?]["'”’)\]]*$/.test(before)) return false
  // "Come here!" he said. — a lower-case word after a quoted ! or ? goes on with the sentence.
  return !(/[!?]["'”’]$/.test(before) && /^[a-z]/.test(word))
}

const readBody = async req => { const parts = []; for await (const part of req) parts.push(part); return Buffer.concat(parts).toString('utf8') }
const ensured = []
const server = createServer(async (req, res) => {
  const url = new URL(req.url || '/', 'http://127.0.0.1')
  const json = (status, body) => { res.writeHead(status, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }); res.end(JSON.stringify(body)) }
  try {
    if (url.pathname === '/api/narration/voices') return json(200, { enabled: true, provider: 'grok', model: 'mock', voices: [{ key: 'f', label: 'Ara', persona: 'female' }, { key: 'm', label: 'Helios', persona: 'male' }] })
    if (url.pathname === '/api/narration/ensure') {
      const body = JSON.parse(await readBody(req) || '{}')
      ensured.push({ chapter: body.chapter, paragraphs: (body.paragraphs || []).map(p => p.index) })
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
const ok = (label, pass, detail) => { if (!pass) failures++; console.log(`${pass ? 'ok  ' : 'FAIL'} ${label}${detail !== undefined ? ' ' + JSON.stringify(detail).slice(0, 600) : ''}`) }

/** A silent player: its clock runs on a timer (×window.__audioRate), it fires the media events the reader listens to. */
function initScript({ start, edition }) {
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
  if (sessionStorage.getItem('listen-from-here-seeded')) return
  sessionStorage.setItem('listen-from-here-seeded', '1')
  const now = Date.now() - 60000
  localStorage.setItem('tinct:wipe-v1-done', '1')
  localStorage.setItem('tinct-lab-prefs', JSON.stringify({ theme: 'light', compareOpen: false, primaryEdition: edition, voicePersona: 'female', voicePersonaChosen: true, audioSpeed: 1 }))
  localStorage.setItem('tinct-lab-position', JSON.stringify({ books: { frankenstein: { bookId: 'frankenstein', headerBook: 'frankenstein', sequentialChapter: start.chapterNumber, ...start, primaryEditionKey: edition, readerMode: 'read', updatedAt: now, deviceId: 'qa', rev: 1 } }, finished: {}, hidden: {}, lastSettledBookId: 'frankenstein', lastSettledAt: now, updatedAt: now, deviceId: 'qa' }))
}

const external = []
async function open(browser, name, contextOptions) {
  const context = await browser.newContext({ serviceWorkers: 'block', ...contextOptions })
  const page = await context.newPage()
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  await page.route('**/*', route => {
    const u = new URL(route.request().url())
    if (u.origin === origin || u.protocol === 'data:' || u.protocol === 'blob:') return route.continue()
    external.push(`${name}: ${u.hostname}${u.pathname}`)
    return route.abort()
  })
  await page.addInitScript(initScript, { start: { chapterNumber: CHAPTER, paragraphIndex: 5, wordIndex: 0 }, edition: EDITION })
  await page.goto(`${origin}/reader?book=${BOOK}&sharedReader=1`, { waitUntil: 'domcontentloaded' })
  await page.waitForFunction(() => document.querySelector('[data-testid="lab-root"]')?.dataset.readerReady === 'true', null, { timeout: 60000 })
  await page.evaluate(() => document.fonts.ready)
  await page.waitForTimeout(1200)
  return { context, page, errors }
}

/** The voice's word (painted as current), the reading place, the pills and the reader's view. */
const look = page => page.evaluate(() => {
  const lab = document.querySelector('[data-testid="lab-root"]')
  const current = [...document.querySelectorAll('[data-testid="lab-word"].is-current')].find(word => word.getBoundingClientRect().height > 0) || document.querySelector('[data-testid="lab-word"].is-current')
  const host = document.querySelector('[data-testid="continuous-reader"]')
  const header = document.querySelector('.lab-header')?.getBoundingClientRect()
  const dock = document.querySelector('[data-testid="lab-desktop-audio-dock"]')?.getBoundingClientRect()
  const box = host?.getBoundingClientRect()
  const view = box ? { top: Math.max(box.top, header && header.height ? header.bottom : box.top), bottom: Math.min(box.bottom, dock && dock.height ? dock.top : box.bottom) } : { top: 0, bottom: innerHeight }
  const rect = current?.getBoundingClientRect()
  const saved = JSON.parse(localStorage.getItem('tinct-lab-position') || 'null')?.books?.frankenstein
  return {
    playing: lab?.dataset.playing === 'true',
    place: lab?.dataset.place,
    voice: current ? { p: Number(current.dataset.paragraphIndex), w: Number(current.dataset.wordIndex), top: Math.round(rect.top) } : null,
    voiceOnScreen: !!rect && rect.height > 0 && rect.bottom > view.top && rect.top < view.bottom,
    pills: !!document.querySelector('[data-testid="lab-listen-pills"]'),
    pillLabels: [...document.querySelectorAll('[data-testid="lab-listen-pills"] button')].map(button => button.textContent.trim()),
    oldPill: !!document.querySelector('[data-testid="lab-back-to-audio"]') || [...document.querySelectorAll('button')].some(button => button.textContent.trim() === 'Back to audio'),
    saved: saved ? `${saved.paragraphIndex}:${saved.wordIndex}` : null,
    view,
    scrollTop: host?.scrollTop ?? null,
  }
})
const waitFor = async (page, test, timeout = 4000) => {
  const start = Date.now()
  let last
  while (Date.now() - start < timeout) { last = await look(page); if (test(last)) return last; await page.waitForTimeout(80) }
  return last
}
/** Where the place is: ahead of (or at) `from` by at most `words` words in the same paragraph. */
const near = (place, from, words = 4) => !!place && place.p === from.p && place.w >= from.w && place.w - from.w <= words
const parse = text => { const [p, w] = String(text || '').split(':').map(Number); return { p, w } }

const browser = await markInternal(await chromium.launch({ headless: true, args: ['--mute-audio'] }))
try {
  // ── Desktop: the pills ───────────────────────────────────────────────────────────────────────────────────────────
  {
    const { context, page, errors } = await open(browser, 'desktop', { viewport: { width: 1440, height: 900 } })
    await page.getByTestId('lab-v2-play').click()
    let now = await waitFor(page, s => s.playing && s.voice)
    ok('desktop: Play starts the voice', now.playing && !!now.voice, now)
    await page.waitForTimeout(800)
    await page.mouse.move(700, 450)
    await page.mouse.wheel(0, 3200)
    await page.waitForTimeout(150)
    now = await look(page)
    ok('desktop: right after scrolling away no pill shows yet (the view has not rested)', !now.pills && !now.oldPill, now)
    now = await waitFor(page, s => s.pills, 2500)
    ok('desktop: scrolled well ahead, both pills show once the view rests', now.pills && now.pillLabels.join('|') === '↑ Back to the voice|▶ Listen from here' && !now.voiceOnScreen, now)
    ok('desktop: the old "Back to audio" does not show', !now.oldPill, now)
    // The pointer off the text for the picture (resting on a paragraph shows its ▶, checked below).
    await page.mouse.move(1300, 500)
    await page.waitForTimeout(200)
    await page.screenshot({ path: path.join(output, 'desktop-pills.png') })
    await page.mouse.move(700, 450)
    const pillStyle = await page.evaluate(() => [...document.querySelectorAll('[data-testid="lab-listen-pills"] button')].map(button => {
      const style = getComputedStyle(button), dock = document.querySelector('[data-testid="lab-desktop-audio-dock"]').getBoundingClientRect(), box = button.getBoundingClientRect()
      return { bg: style.backgroundColor, color: style.color, font: style.fontFamily, transform: style.textTransform, aboveDock: box.bottom <= dock.top + 1 && dock.top - box.bottom < 40, centre: Math.round(box.left + box.width / 2) }
    }))
    ok('desktop: the pills sit just above the player in system UI, sentence case, light then dark', pillStyle.length === 2 && pillStyle.every(p => p.aboveDock && /system-ui/.test(p.font) && p.transform === 'none') && pillStyle[1].bg === pillStyle[0].color && pillStyle[0].bg !== pillStyle[1].bg, pillStyle)

    // The first sentence whose first word is below the top bar, measured here from the painted words.
    const expected = await page.evaluate(() => {
      const host = document.querySelector('[data-testid="continuous-reader"]')
      const own = host.querySelector('.book-scroll-chapter.is-own') ?? host
      const top = Math.max(host.getBoundingClientRect().top, document.querySelector('.lab-header').getBoundingClientRect().bottom)
      return [...own.querySelectorAll('[data-testid="lab-word"]')].map(word => ({ p: Number(word.dataset.paragraphIndex), w: Number(word.dataset.wordIndex), top: word.getBoundingClientRect().top }))
        .filter(word => word.top >= top - 0.5 && word.top < innerHeight - 120).slice(0, 400)
    }).then(words => words.find(word => begins(word.p, word.w)))
    await page.getByTestId('lab-listen-from-here').click()
    now = await waitFor(page, s => !s.pills && s.voice && near(s.voice, expected), 3000)
    ok('desktop: Listen from here moves the voice to the first sentence that begins on screen', !!expected && near(now.voice, expected), { expected, voice: now.voice, text: expected && tokens[expected.p].slice(Math.max(0, expected.w - 2), expected.w + 4).join(' ') })
    ok('desktop: the reading place becomes that spot (and is saved there)', near(parse(now.place), expected, 6) && near(parse(now.saved), expected, 6), { place: now.place, saved: now.saved })
    ok('desktop: the pills go after Listen from here, the voice plays on, its word on screen', !now.pills && now.playing && (await waitFor(page, s => s.voiceOnScreen, 2000)).voiceOnScreen, now)
    const heard = now.voice
    await page.waitForTimeout(1500)
    now = await look(page)
    ok('desktop: the voice reads on from there', now.playing && now.voice && (now.voice.p > heard.p || now.voice.w > heard.w), { heard, now: now.voice })

    // Back to the voice.
    await page.mouse.wheel(0, 3200)
    now = await waitFor(page, s => s.pills, 2500)
    ok('desktop: scrolled away again, the pills show', now.pills && !now.voiceOnScreen, now)
    await page.getByTestId('lab-back-to-voice').click()
    now = await waitFor(page, s => s.voiceOnScreen && !s.pills, 2500)
    ok('desktop: Back to the voice brings the voice’s word back on screen and the pills go; the voice plays on', now.voiceOnScreen && !now.pills && now.playing, now)

    // The pills go when the reader scrolls back to the voice's word.
    await page.waitForTimeout(600)
    await page.mouse.wheel(0, 2400)
    now = await waitFor(page, s => s.pills, 2500)
    ok('desktop: scrolled ahead, the pills show', now.pills, now)
    await page.evaluate(() => document.querySelector('[data-testid="lab-word"].is-current')?.scrollIntoView({ block: 'center' }))
    now = await waitFor(page, s => !s.pills, 1500)
    ok('desktop: scrolled back to the voice’s word, the pills go by themselves', !now.pills && now.voiceOnScreen, now)

    // The pills go when the voice catches up: the view a little ahead of the voice, the voice sped up.
    await page.mouse.wheel(0, 300)
    await page.evaluate(() => {
      const host = document.querySelector('[data-testid="continuous-reader"]')
      const word = document.querySelector('[data-testid="lab-word"].is-current')
      const top = Math.max(host.getBoundingClientRect().top, document.querySelector('.lab-header').getBoundingClientRect().bottom)
      host.scrollTop += word.getBoundingClientRect().bottom - top + 30
    })
    now = await waitFor(page, s => s.pills, 2500)
    ok('desktop: the voice just above the view, the pills show', now.pills && !now.voiceOnScreen, now)
    await page.evaluate(() => { window.__audioRate = 10 })
    now = await waitFor(page, s => s.voiceOnScreen, 15000)
    await page.waitForTimeout(250)
    const caught = await look(page)
    await page.evaluate(() => { window.__audioRate = 1 })
    ok('desktop: the voice caught up onto the screen, the pills go', now.voiceOnScreen && !caught.pills, { now, caught })

    // Scrolled on into the next chapter (book scroll paints it): Listen from here takes the voice into that chapter.
    await page.mouse.wheel(0, 300)
    const next = await page.evaluate(() => {
      const host = document.querySelector('[data-testid="continuous-reader"]')
      const own = Number(document.querySelector('[data-testid="lab-root"]').dataset.chapter)
      const block = [...host.querySelectorAll('[data-book-scroll-chapter]')].find(node => Number(node.dataset.bookScrollChapter) > own && node.querySelector('[data-testid="lab-opening-word"]'))
      if (!block) return null
      host.scrollTop += block.getBoundingClientRect().top - host.getBoundingClientRect().top + 600
      return Number(block.dataset.bookScrollChapter)
    })
    if (next == null) ok('desktop: the next chapter is painted below for the chapter case', false)
    else {
      await loadTokens(next)
      now = await waitFor(page, s => s.pills, 2500)
      ok('desktop: scrolled into the next chapter while the voice reads this one, the pills show', now.pills, now)
      const expectedNext = await page.evaluate(next => {
        const host = document.querySelector('[data-testid="continuous-reader"]')
        const block = host.querySelector(`[data-book-scroll-chapter="${next}"]`)
        const top = Math.max(host.getBoundingClientRect().top, document.querySelector('.lab-header').getBoundingClientRect().bottom)
        return [...block.querySelectorAll('[data-testid="lab-opening-word"],[data-testid="lab-word"]')].map(word => ({ p: Number(word.dataset.paragraphIndex), w: Number(word.dataset.wordIndex), top: word.getBoundingClientRect().top }))
          .filter(word => word.top >= top - 0.5 && word.top < innerHeight - 120).slice(0, 400)
      }, next).then(words => words.find(word => begins(word.p, word.w, next)))
      await page.getByTestId('lab-listen-from-here').click()
      const moved = await (async () => {
        const start = Date.now()
        let last
        while (Date.now() - start < 6000) {
          last = await page.evaluate(() => ({ chapter: Number(document.querySelector('[data-testid="lab-root"]').dataset.chapter), saved: JSON.parse(localStorage.getItem('tinct-lab-position') || 'null')?.books?.frankenstein }))
          const s = await look(page)
          if (last.chapter === next && s.voice && near(s.voice, expectedNext)) return { ...last, s }
          await page.waitForTimeout(100)
        }
        return { ...last, s: await look(page) }
      })()
      ok('desktop: Listen from here in the next chapter makes it the reader’s and moves the voice to its first sentence on screen',
        !!expectedNext && moved.chapter === next && near(moved.s.voice, expectedNext) && moved.s.playing && moved.saved?.sequentialChapter === next,
        { next, expectedNext, moved: { chapter: moved.chapter, voice: moved.s.voice, saved: moved.saved && `${moved.saved.sequentialChapter}/${moved.saved.paragraphIndex}:${moved.saved.wordIndex}` } })
    }
    // Audio stops: the pills go.
    await page.mouse.wheel(0, 2400)
    now = await waitFor(page, s => s.pills, 2500)
    await page.getByTestId('lab-hearing-pause').click()
    now = await waitFor(page, s => !s.playing && !s.pills, 2000)
    ok('desktop: the pills go when audio stops (Pause)', now.pills === false && !now.playing, now)
    ok('desktop: no page errors', errors.length === 0, errors)
    await context.close()
  }

  // ── Desktop: the gutter ▶ ───────────────────────────────────────────────────────────────────────────────────────
  {
    const { context, page, errors } = await open(browser, 'desktop-gutter', { viewport: { width: 1440, height: 900 } })
    const hoverable = await page.evaluate(() => matchMedia('(hover: hover) and (pointer: fine)').matches)
    /** A paragraph of the reader's chapter in the middle of the view, its box, its first word's box and a word to rest on. */
    const target = (skip = []) => page.evaluate(skip => {
      const host = document.querySelector('[data-testid="continuous-reader"]')
      const own = host.querySelector('.book-scroll-chapter.is-own') ?? host
      for (const line of own.querySelectorAll('p.lab-hearing-line')) {
        const index = Number(line.querySelector('[data-testid="lab-word"]')?.dataset.paragraphIndex)
        const box = line.getBoundingClientRect()
        if (skip.includes(index) || box.top < 160 || box.bottom > 760 || box.height < 60) continue
        const first = own.querySelector(`[data-testid="lab-word"][data-paragraph-index="${index}"][data-word-index="0"]`)
        if (!first || first.getBoundingClientRect().top < 150) continue
        const words = [...line.querySelectorAll('[data-testid="lab-word"]')]
        const rest = words[Math.floor(words.length / 2)].getBoundingClientRect()
        const f = first.getBoundingClientRect()
        return { index, box: { left: box.left, top: box.top, width: box.width, height: box.height }, first: { top: f.top, height: f.height }, rest: { x: rest.left + rest.width / 2, y: rest.top + rest.height / 2 } }
      }
      return null
    }, skip)
    const gutter = () => page.evaluate(() => {
      const button = document.querySelector('[data-testid="lab-paragraph-listen"]')
      if (!button) return null
      const box = button.getBoundingClientRect(), style = getComputedStyle(button)
      const tint = document.querySelector('[data-testid="lab-paragraph-listen-tint"]')
      return { index: Number(button.dataset.paragraphIndex), left: box.left, top: box.top, width: box.width, height: box.height, radius: style.borderRadius, bg: style.backgroundColor, color: style.color, position: style.position, tint: tint ? getComputedStyle(tint).backgroundColor : null }
    })
    ok('desktop: the browser hovers with a fine pointer', hoverable)
    // The ▶ lives in the left gutter only, and only while the voice is on (Anders, 16 Nov 2026: a cursor resting on
    // the text while reading must not bring it up).
    const inGutter = p => ({ x: p.box.left - 72, y: p.first.top + p.first.height / 2 })
    let para = await target()
    await page.mouse.move(para.rest.x, para.rest.y)
    await page.waitForTimeout(800)
    ok('desktop, voice off: resting on the text shows no ▶', !(await gutter()))
    await page.mouse.move(inGutter(para).x, inGutter(para).y, { steps: 4 })
    await page.waitForTimeout(800)
    ok('desktop, voice off: resting in the gutter shows no ▶ either', !(await gutter()))
    await page.getByTestId('lab-v2-play').click()
    let now = await waitFor(page, s => s.playing && s.voice, 4000)
    ok('desktop: Play starts the voice', now.playing && !!now.voice, { voice: now.voice })
    // A paragraph above the voice, which it will not reach while the pointer is on its way.
    const ahead = v => Array.from({ length: 200 }, (_, i) => v + i)
    await page.mouse.move(700, 450)
    await page.mouse.wheel(0, -450)
    await page.waitForTimeout(700)
    para = await target(ahead(now.voice?.p ?? 0))
    await page.mouse.move(para.rest.x, para.rest.y, { steps: 4 })
    await page.waitForTimeout(800)
    ok('desktop, voice on: resting on the text still shows no ▶', !(await gutter()))
    await page.mouse.move(inGutter(para).x, inGutter(para).y, { steps: 4 })
    await page.waitForTimeout(100)
    ok('desktop: no ▶ before the pointer has rested ~250 ms in the gutter', !(await gutter()))
    await page.waitForTimeout(400)
    let shown = await gutter()
    ok('desktop, voice on: resting in a paragraph’s gutter shows its ▶', !!shown && shown.index === para.index, { shown, para: para.index })
    const after = await target(ahead(now.voice?.p ?? 0))
    ok('desktop: the ▶ is a 30 px dark round overlay in the left gutter at the paragraph’s first line, and moves no text',
      !!shown && shown.position === 'fixed' && Math.round(shown.width) === 30 && Math.round(shown.height) === 30 && shown.left + shown.width <= para.box.left
        && Math.abs((shown.top + 15) - (para.first.top + para.first.height / 2)) <= 3 && after?.index === para.index && Math.abs(after.box.top - para.box.top) < 0.5 && Math.abs(after.box.left - para.box.left) < 0.5,
      { shown, para, after: after?.box })
    ok('desktop: the paragraph takes a faint tint while the ▶ shows', !!shown?.tint && shown.tint !== 'rgba(0, 0, 0, 0)', shown?.tint)
    ok('desktop: no tooltip until the pointer is on the button', !(await page.getByTestId('lab-paragraph-listen-tip').count()))
    await page.mouse.move(shown.left + 15, shown.top + 15, { steps: 6 })
    await page.waitForTimeout(150)
    const tip = await page.evaluate(() => { const t = document.querySelector('[data-testid="lab-paragraph-listen-tip"]'); return t && { text: t.textContent, font: getComputedStyle(t).fontFamily, size: getComputedStyle(t).fontSize } })
    ok('desktop: moving onto the ▶ keeps it, and its tooltip says "Listen from here" (system UI, 13 px)', !!(await gutter()) && tip?.text === 'Listen from here' && /system-ui/.test(tip.font) && tip.size === '13px', tip)
    await page.screenshot({ path: path.join(output, 'desktop-gutter.png') })
    await page.getByTestId('lab-paragraph-listen').click()
    now = await waitFor(page, s => s.voice && near(s.voice, { p: para.index, w: 0 }, 3), 3000)
    ok('desktop: clicking ▶ moves the voice to that paragraph’s first word, playing on', now.playing && near(now.voice, { p: para.index, w: 0 }, 3), { voice: now.voice, para: para.index })
    ok('desktop: the reading place goes there too', near(parse(now.place), { p: para.index, w: 0 }, 6), now.place)
    ok('desktop: the ▶ goes on the click', !(await gutter()))
    await page.waitForTimeout(600)
    now = await look(page)
    // The voice's own paragraph: no ▶ in its gutter.
    const voiceGutter = await page.evaluate(p => {
      const host = document.querySelector('[data-testid="continuous-reader"]')
      const own = host.querySelector('.book-scroll-chapter.is-own') ?? host
      const first = [...own.querySelectorAll(`[data-testid="lab-word"][data-paragraph-index="${p}"]`)][0]
      const line = first?.closest('p.lab-hearing-line')?.getBoundingClientRect(), box = first?.getBoundingClientRect()
      return line && box && { x: line.left - 72, y: box.top + box.height / 2 }
    }, now.voice.p)
    if (voiceGutter) { await page.mouse.move(voiceGutter.x, voiceGutter.y, { steps: 4 }); await page.waitForTimeout(800) }
    ok('desktop: no ▶ beside the paragraph the voice is reading', !!voiceGutter && !(await gutter()), { voice: now.voice })
    // A text selection: no ▶.
    para = await target([now.voice?.p])
    await page.evaluate(index => {
      const line = document.querySelector(`[data-testid="continuous-reader"] p.lab-hearing-line[id="lab-p-${index}"]`)
      const range = document.createRange(); range.selectNodeContents(line.querySelector('[data-testid="lab-word"]'))
      getSelection().removeAllRanges(); getSelection().addRange(range)
    }, para.index)
    await page.mouse.move(inGutter(para).x, inGutter(para).y, { steps: 4 })
    await page.waitForTimeout(800)
    ok('desktop: no ▶ while a text selection exists', !(await gutter()))
    await page.evaluate(() => getSelection().removeAllRanges())
    ok('desktop gutter: no page errors', errors.length === 0, errors)
    await context.close()
  }

  // ── A touch device: no ▶ ───────────────────────────────────────────────────────────────────────────────────────
  {
    const { context, page, errors } = await open(browser, 'touch', { viewport: { width: 1180, height: 820 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 })
    const media = await page.evaluate(() => ({ hover: matchMedia('(hover: hover) and (pointer: fine)').matches, phone: !!document.querySelector('.lab.is-phone') }))
    const spot = await page.evaluate(() => {
      const word = [...document.querySelectorAll('[data-testid="lab-word"]')].find(w => { const r = w.getBoundingClientRect(); return r.top > 250 && r.top < 500 })
      const r = word?.getBoundingClientRect()
      return r && { x: r.left + r.width / 2, y: r.top + r.height / 2 }
    })
    if (spot) { await page.mouse.move(spot.x, spot.y); await page.waitForTimeout(900) }
    ok('touch device: no ▶ beside a paragraph', !media.hover && !!spot && !(await page.getByTestId('lab-paragraph-listen').count()), { media, spot })
    ok('touch device: no page errors', errors.length === 0, errors)
    await context.close()
  }
} finally { await browser.close() }

// ── Phone (WebKit, iPhone 13): pages turned ahead ───────────────────────────────────────────────────────────────
const phoneBrowser = await markInternal(await webkit.launch({ headless: true }))
try {
  const { context, page, errors } = await open(phoneBrowser, 'phone', { ...devices['iPhone 13'] })
  await page.getByTestId('lab-v2-play').click()
  let now = await waitFor(page, s => s.playing && s.voice, 6000)
  ok('phone: Play starts the voice', now.playing && !!now.voice, now)
  await page.waitForTimeout(800)
  const turn = async () => {
    const box = page.viewportSize()
    await page.touchscreen.tap(box.width - 30, box.height / 2)
    await page.waitForTimeout(450)
  }
  const pageKey = () => page.evaluate(() => [...document.querySelectorAll('[data-testid="lab-reading-stage"] [data-testid="lab-word"]')].slice(0, 3).map(w => `${w.dataset.paragraphIndex}:${w.dataset.wordIndex}`).join(' '))
  const before = await pageKey()
  await turn()
  if (await pageKey() === before) { await page.keyboard.press('ArrowRight'); await page.waitForTimeout(450) }
  await page.keyboard.press('ArrowRight')
  await page.waitForTimeout(150)
  now = await look(page)
  ok('phone: right after the page turn no pill shows yet', !now.pills && !now.oldPill, now)
  now = await waitFor(page, s => s.pills, 2500)
  ok('phone: pages turned ahead while playing, both pills show and "Back to audio" does not', now.pills && !now.oldPill && now.pillLabels.length === 2, now)
  await page.screenshot({ path: path.join(output, 'phone-pills.png') })
  const pageWords = await page.evaluate(() => [...document.querySelectorAll('[data-testid="lab-reading-stage"] [data-testid="lab-word"]')]
    .filter(word => word.getBoundingClientRect().height > 0).map(word => ({ p: Number(word.dataset.paragraphIndex), w: Number(word.dataset.wordIndex) })))
  const expected = pageWords.find(word => begins(word.p, word.w)) ?? pageWords[0]
  await page.getByTestId('lab-listen-from-here').click()
  now = await waitFor(page, s => !s.pills && s.voice && near(s.voice, expected), 3000)
  ok('phone: Listen from here starts at the first sentence that begins on that page', !!expected && near(now.voice, expected), { expected, voice: now.voice, text: expected && tokens[expected.p].slice(Math.max(0, expected.w - 2), expected.w + 4).join(' ') })
  ok('phone: the pills go; the voice plays on, its page on screen; the place is that spot', !now.pills && now.playing && now.voiceOnScreen && near(parse(now.place), expected, 6), now)
  await page.screenshot({ path: path.join(output, 'phone-after-listen.png') })
  ok('phone: no page errors', errors.length === 0, errors)
  await context.close()
} finally { await phoneBrowser.close() }

server.close()
ok('nothing reached any other host', external.length === 0, external.slice(0, 10))
ok('narration was asked for here only (mocked), for Letter 4 and the chapter after it', ensured.length > 0 && ensured.every(entry => entry.chapter === CHAPTER || entry.chapter === CHAPTER + 1), [...new Set(ensured.map(entry => entry.chapter))])
console.log(failures ? `${failures} check(s) failed` : 'all checks passed', `· screenshots in ${output}`)
process.exit(failures ? 1 : 0)
