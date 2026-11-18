// Phone audio player layout (390×844, Frankenstein Letter 1), against the
// local build in dist/ (or production with READER_LIVE=1).
//
//   SKIP_ENV_CHECK=1 npm run build && node scripts/check-phone-audio-player.mjs
//
// Narration is mocked (no provider, no spend) and the player is a silent
// stand-in, so nothing is audible. While the player is open, the paused
// player's grab handle must sit centred inside its top edge, clear of every
// control's 44px touch target, the paused player must keep the playing
// player's exact box, and the progress line must be gone (the page
// keeps its words where they are, so the player may cover its last line); closing the player brings the
// progress line back and keeps the reader on the same page. The opening case
// closes with a tap on the handle, the mid-letter case with a real touch swipe
// down on the bar (after a sideways swipe that must leave it open).
import { chromium } from '@playwright/test'
import { markInternal } from './lib/internalTraffic.cjs'
import { build } from 'esbuild'
import fs from 'node:fs/promises'
import path from 'node:path'
import assert from 'node:assert/strict'

const live = process.env.READER_LIVE === '1'
const origin = (process.env.TINCT_ORIGIN || 'https://tinct.app').replace(/\/+$/, '')
const output = process.env.PHONE_PLAYER_OUTPUT || 'artifacts/phone-audio-player'
const executablePath = process.env.PLAYWRIGHT_CHROMIUM || undefined
await fs.mkdir(output, { recursive: true })

const bundled = await build({ stdin: { contents: "export { chunkNarrationText, narrationTextForParagraph, sha256Hex } from './src/narration/narrationCore'", resolveDir: process.cwd() },
  bundle: true, platform: 'node', format: 'esm', write: false })
const { chunkNarrationText, narrationTextForParagraph, sha256Hex } = await import('data:text/javascript;base64,' + Buffer.from(bundled.outputFiles[0].text).toString('base64'))
const EDITION = 'modern-en'
// PHONE_PLAYER_THEME=dark runs the same checks in the night theme.
const THEME = process.env.PHONE_PLAYER_THEME || 'light'
const edition = JSON.parse(await fs.readFile(`public/data/editions/frankenstein-${EDITION}.json`, 'utf8'))

const failures = []

/** Everything the assertions need, measured in one pass. */
function measure(page) {
  return page.evaluate(() => {
    const box = el => { if (!el) return null; const r = el.getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height, right: r.right, bottom: r.bottom } }
    const shown = el => !!el && getComputedStyle(el).visibility !== 'hidden' && getComputedStyle(el).display !== 'none' && Number(getComputedStyle(el).opacity) > 0.05 && el.getBoundingClientRect().height > 0
    const bar = document.querySelector('[data-testid="lab-phone-bar"]')
    const dismiss = document.querySelector('button[aria-label="Close audio controls"]')
    const progress = document.querySelector('[data-testid="lab-chapter-progress"]')
    const progressText = progress?.querySelector('.lab-chapter-progress-info')
    const wrap = document.querySelector('.lab-page-wrap')
    // The page's own clip: the nearest ancestor of the passage that hides overflow.
    let clipEl = document.querySelector('.lab-page-wrap > .lab-passage')
    while (clipEl && clipEl !== document.body && getComputedStyle(clipEl).overflowY === 'visible') clipEl = clipEl.parentElement
    const clip = box(clipEl)
    const words = [...document.querySelectorAll('.lab-page-wrap > .lab-passage [data-word-index]')]
      .filter(el => !el.closest('.lab-book-col-compare'))
      .map(el => ({ el, r: el.getBoundingClientRect() }))
      .filter(({ r }) => r.width > 0 && r.height > 0 && r.bottom > (clip?.y ?? 0) && r.y < (clip?.bottom ?? innerHeight) && r.right > 0 && r.x < innerWidth)
      .map(({ el, r }) => ({ text: el.textContent, p: Number(el.dataset.paragraphIndex), w: Number(el.dataset.wordIndex), y: r.y, bottom: r.bottom, x: r.x, right: r.right }))
    return {
      transport: document.querySelector('[data-testid="lab-root"]')?.dataset.transport,
      bar: shown(bar) ? box(bar) : null,
      dismiss: shown(dismiss) ? box(dismiss) : null,
      controls: [...document.querySelectorAll('[data-testid="lab-phone-bar"] .lab-phone-bar-row button')].map(box),
      // Each control's touch target, probed with elementFromPoint down its centre line.
      targets: [...document.querySelectorAll('[data-testid="lab-phone-bar"] .lab-phone-bar-row button')].map(el => {
        const r = el.getBoundingClientRect(), x = r.x + r.width / 2
        let top = null, bottom = null
        for (let y = Math.floor(r.y - 12); y <= Math.ceil(r.bottom + 12); y += 0.5) {
          const hit = document.elementFromPoint(x, y)
          if (hit && (hit === el || el.contains(hit))) { if (top === null) top = y; bottom = y }
        }
        return { label: el.getAttribute('aria-label'), top, bottom, height: top === null ? 0 : bottom - top + 0.5 }
      }),
      progress: shown(progress) && shown(progressText) && progressText.textContent.trim() ? { ...box(progressText), text: progressText.textContent.trim() } : null,
      wrap: box(wrap),
      clip,
      words,
      first: words[0] ? { p: words[0].p, w: words[0].w, text: words[0].text } : null,
      last: words.at(-1) ?? null,
    }
  })
}

const browser = await markInternal(await chromium.launch({ headless: true, executablePath, args: ['--mute-audio'] }))
const report = { live, origin: live ? origin : 'dist', cases: [] }
try {
 // Letter 1's opening page, and a page further in (a saved place mid-letter).
 for (const place of [{ paragraphIndex: 0, wordIndex: 0 }, { paragraphIndex: 3, wordIndex: 196 }]) {
  const name = place.paragraphIndex === 0 ? 'opening' : 'mid-letter'
  const check = (ok, message) => { if (!ok) failures.push(`${name}: ${message}`) }
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2, serviceWorkers: 'block' })
  const page = await context.newPage()
  page.setDefaultTimeout(20000)
  const errors = []
  page.on('pageerror', e => errors.push(e.message))
  await page.route('**/*', async route => {
    const req = route.request(), url = new URL(req.url())
    if (url.pathname === '/api/narration/voices') return route.fulfill({ json: { enabled: true, provider: 'grok', voices: [{ key: 'm', label: 'Helios', persona: 'male', cacheIdentity: 'a'.repeat(64) }] } })
    if (url.pathname === '/api/narration/ensure') {
      const body = req.postDataJSON()
      assert.equal(body.bookId, 'frankenstein')
      const chapter = edition.chapters.find(c => c.number === body.chapter) ?? edition.chapters[body.chapter - 1]
      const paragraphs = await Promise.all(body.paragraphs.map(async item => {
        const text = chapter?.paragraphs[item.index]
        if (typeof text !== 'string') return { paragraph: item.index, status: 'failed', reason: 'unknown_paragraph' }
        const textHash = await sha256Hex(narrationTextForParagraph(text))
        // Chunk-local word timings, 0.3 s a word, so follow paints real words.
        const tokens = narrationTextForParagraph(text).split(' ')
        const chunks = chunkNarrationText(text).map(c => {
          const words = tokens.slice(c.wordFrom, c.wordTo).map((word, i) => ({ text: word, start: i * 0.3, end: i * 0.3 + 0.28 }))
          return { ...c, ready: true, duration: words.length * 0.3, hash: 'b'.repeat(64), timingsUsable: true,
            url: '/api/audio-file?fixture=' + body.chapter + '-' + item.index + '-' + c.index, words }
        })
        return { paragraph: item.index, status: 'ready', textHash, chunkCount: chunks.length, readyChunks: chunks.length, chunks,
          duration: chunks.reduce((n, c) => n + c.duration, 0), timingsUsable: true }
      }))
      return route.fulfill({ json: { paragraphs, generated: 0 } })
    }
    // No provider, account or audible media request leaves this context.
    if (url.pathname.startsWith('/api/')) return route.fulfill({ status: 404, body: '{}' })
    if (req.method() !== 'GET') return route.abort()
    if (!live && url.origin === origin) {
      const file = path.resolve('dist', '.' + (url.pathname === '/reader' ? '/app.html' : url.pathname))
      if (file.startsWith(path.resolve('dist') + '/')) {
        try { if ((await fs.stat(file)).isFile()) return route.fulfill({ path: file }) } catch {}
      }
      return route.abort()
    }
    if (url.origin !== origin && !/fonts\.(googleapis|gstatic)\.com$/.test(url.hostname)) return route.abort()
    return route.continue()
  })
  await page.addInitScript(({ edition, place, theme }) => {
    localStorage.setItem('tinct-lab-prefs', JSON.stringify({ primaryEdition: edition, theme, voicePersona: 'male', voicePersonaChosen: true }))
    sessionStorage.setItem('tinct:lab-reader-handoff', JSON.stringify({ kind: 'open-reader', bookId: 'frankenstein', primaryEditionKey: edition, savedPlace: { bookId: 'frankenstein', chapterNumber: 1, ...place, page: 0 } }))
    class SilentAudio extends EventTarget {
      src = ''; currentTime = 0; duration = 30; paused = true; ended = false; playbackRate = 1; autoplay = false; muted = true
      constructor() { super(); window.__audio = this }
      play() { this.paused = false; this.ended = false; queueMicrotask(() => this.dispatchEvent(new Event('playing'))); return Promise.resolve() }
      pause() { this.paused = true; queueMicrotask(() => this.dispatchEvent(new Event('pause'))) }
      load() {}
      setAttribute() {}
      removeAttribute(name) { if (name === 'src') this.src = '' }
    }
    window.Audio = SilentAudio
    HTMLMediaElement.prototype.play = async function () { this.muted = true; throw Error('Unexpected native audio') }
    if (navigator.mediaDevices) navigator.mediaDevices.getUserMedia = async () => { throw Error('Microphone disabled') }
  }, { edition: EDITION, place, theme: THEME })

  await page.goto(origin + '/reader?layout=phone', { waitUntil: 'domcontentloaded' })
  await page.waitForFunction(() => document.querySelector('[data-testid="lab-root"]')?.dataset.readerReady === 'true', null, { timeout: 45000 })
  await page.evaluate(() => document.fonts.ready)
  await page.waitForTimeout(600)

  const closed = await measure(page)
  await page.screenshot({ path: `${output}/${name}-1-closed.png` })
  check(closed.transport === 'closed', 'starts with the player closed')
  check(!!closed.progress, 'progress line shows while the player is closed')
  check(place.paragraphIndex > 0 ? (closed.first?.p ?? 0) > 0 : closed.first?.p === 0 && closed.first?.w === 0, 'opens the intended page of Frankenstein Letter 1')

  // Play, then pause: the paused player is the state that shows the close button.
  await page.getByTestId('lab-v2-play').click()
  await page.waitForFunction(() => document.querySelector('[data-testid="lab-root"]')?.dataset.transport === 'open')
  await page.waitForFunction(() => window.__audio && !window.__audio.paused, null, { timeout: 20000 })
  await page.waitForTimeout(500)
  const playing = await measure(page)
  await page.screenshot({ path: `${output}/${name}-2-playing.png` })
  await page.getByTestId('lab-listen').click()
  await page.waitForFunction(() => window.__audio?.paused)
  await page.getByRole('button', { name: 'Close audio controls' }).waitFor()
  await page.waitForTimeout(400)
  const paused = await measure(page)
  await page.screenshot({ path: `${output}/${name}-3-paused-open.png` })

  for (const [label, state] of [['playing', playing], ['paused', paused]]) {
    check(!!state.bar, `${label}: the player is on screen`)
    if (!state.bar) continue
    check(!state.progress, `${label}: no progress line while the player is open (saw "${state.progress?.text}")`)
    const under = state.words.filter(w => w.bottom > state.bar.y + 0.5)
    // By design the page on screen keeps every word where it is when the player opens
    // (check-inline-audio-loading.mjs: Play never moves a word), so the player may cover
    // its last line until the next page; only the close button and progress line are checked here.
    const cut = state.clip ? state.words.filter(w => w.bottom > state.clip.bottom + 0.5 || w.y < state.clip.y - 0.5) : []
    check(cut.length === 0, `${label}: no line is cut by the page edge (${cut.length} words, e.g. "${cut.slice(0, 6).map(w => w.text).join(' ')}")`)
    check(state.first?.p === closed.first?.p && state.first?.w === closed.first?.w, `${label}: same page as before the player opened (first word ${JSON.stringify(closed.first)} → ${JSON.stringify(state.first)})`)
  }
  check(!!paused.dismiss, 'paused: the grab handle shows')
  check(!playing.dismiss, 'playing: no grab handle')
  if (paused.bar && playing.bar) {
    check(Math.abs(paused.bar.y - playing.bar.y) < 0.01 && Math.abs(paused.bar.height - playing.bar.height) < 0.01,
      `paused: the player keeps the playing player's exact box (playing ${JSON.stringify(playing.bar)}, paused ${JSON.stringify(paused.bar)})`)
  }
  if (paused.dismiss && paused.bar) {
    const d = paused.dismiss, b = paused.bar
    check(d.y >= b.y - 0.5 && d.bottom <= b.y + 10.5 && d.width >= 72 && Math.abs((d.x + d.width / 2) - (b.x + b.width / 2)) < 1,
      `paused: the handle strip sits centred inside the player's top edge (handle ${JSON.stringify(d)}, player ${JSON.stringify(b)})`)
    const hit = paused.controls.filter(c => c.x < d.right - 0.5 && c.right > d.x + 0.5 && c.y < d.bottom - 0.5 && c.bottom > d.y + 0.5)
    check(hit.length === 0, `paused: the handle strip covers no control (${JSON.stringify(hit)})`)
    for (const t of paused.targets) {
      check(t.height >= 44, `paused: ${t.label} keeps a 44px touch target (${JSON.stringify(t)})`)
    }
    const play = paused.targets.find(t => /Resume/.test(t.label ?? ''))
    check(!!play && play.top >= d.bottom - 0.5, `paused: Play's target starts below the handle strip (${JSON.stringify(play)}, strip bottom ${d.bottom})`)
    check(paused.last?.p === playing.last?.p && paused.last?.w === playing.last?.w, `paused: no reading text moves (last word ${JSON.stringify(playing.last)} → ${JSON.stringify(paused.last)})`)
  }
  if (name === 'opening') {
    await page.getByRole('button', { name: 'Close audio controls' }).click()
  } else {
    const cdp = await context.newCDPSession(page)
    const bar = paused.bar
    const touch = async (type, x, y) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' ? [] : [{ x, y, id: 1 }] })
    const swipe = async (points, shotAt) => {
      await touch('touchStart', ...points[0])
      for (const [i, point] of points.slice(1).entries()) {
        await touch('touchMove', ...point)
        await page.waitForTimeout(16)
        if (shotAt === i) await page.screenshot({ path: `${output}/${name}-3c-swiping.png` })
      }
      await touch('touchEnd')
      await page.waitForTimeout(400)
    }
    const x0 = bar.x + bar.width * 0.3, y0 = bar.y + bar.height / 2
    // Sideways: not a close.
    await swipe([[x0, y0], [x0 + 20, y0 + 2], [x0 + 60, y0 + 4], [x0 + 100, y0 + 6]])
    check((await measure(page)).transport === 'open', 'a sideways swipe on the paused bar leaves it open')
    await swipe([[x0, y0], [x0, y0 + 10], [x0 + 1, y0 + 24], [x0 + 1, y0 + 40], [x0 + 2, y0 + 56], [x0 + 2, y0 + 70]], 2)
  }
  await page.waitForFunction(() => document.querySelector('[data-testid="lab-root"]')?.dataset.transport === 'closed')
  await page.waitForTimeout(500)
  const after = await measure(page)
  await page.screenshot({ path: `${output}/${name}-4-closed-again.png` })
  check(!!after.progress, 'progress line returns when the player closes')
  check(after.first?.p === closed.first?.p && after.first?.w === closed.first?.w, `closing keeps the same page (first word ${JSON.stringify(closed.first)} → ${JSON.stringify(after.first)})`)
  check(errors.length === 0, `no page errors (${errors.join(' | ')})`)
  report.cases.push({ name, closed: { ...closed, words: closed.words.length }, playing: { ...playing, words: playing.words.length }, paused: { ...paused, words: paused.words.length }, after: { ...after, words: after.words.length } })
  await context.close()
 }
} finally {
  await browser.close()
}
report.failures = failures
await fs.writeFile(`${output}/report.json`, JSON.stringify(report, null, 2))
for (const failure of failures) console.log('FAIL ' + failure)
console.log(failures.length === 0 ? 'Phone audio player layout: all checks passed' : `Phone audio player layout: ${failures.length} check(s) failed`)
process.exit(failures.length === 0 ? 0 : 1)
