import { chromium, webkit } from '@playwright/test'
import fs from 'node:fs/promises'
import path from 'node:path'
import assert from 'node:assert/strict'
import { build } from 'esbuild'
import { markInternal } from './lib/internalTraffic.cjs'

const live = process.env.READER_LIVE === '1'
const origin = (process.env.TINCT_ORIGIN || 'https://tinct.app').replace(/\/+$/, '')
const output = 'artifacts/inline-audio-loading'
await fs.mkdir(output, { recursive: true })
const report = { live, cases: [], generated: 0, note: live
  ? 'Delayed real cached responses from the deployed Worker exercise preparation without new synthesis; native playback is not mocked.'
  : 'The built reader against a local ensure (chunks from the edition text, local WAV clips); native playback is not mocked.' }

// Before a deploy (PR CI, local runs) this checks the built client, not a Worker: forwarding its ensure
// calls to production tested the previous release's Worker and made the check as slow as production's
// cached ensure (over 15 s at times, 20 Oct 2026). So the ensure is answered here, the way the Worker
// answers it: the edition's own paragraphs, chunked and hashed by narrationCore, each chunk a short local
// WAV the browser really plays. After a deploy (READER_LIVE=1) the real Worker answers, as before.
const bundled = await build({ stdin: { contents: "export { chunkNarrationText, narrationTextForParagraph, narrationTokens, sha256Hex } from './src/narration/narrationCore'", resolveDir: process.cwd() },
  bundle: true, platform: 'node', format: 'esm', write: false })
const { chunkNarrationText, narrationTextForParagraph, narrationTokens, sha256Hex } = await import('data:text/javascript;base64,' + Buffer.from(bundled.outputFiles[0].text).toString('base64'))
const frankenstein = live ? null : JSON.parse(await fs.readFile('public/data/editions/frankenstein-original-en.json', 'utf8'))
const SECONDS_PER_WORD = 0.32
function silentWav(seconds, rate = 8000) {
  const samples = Math.round(seconds * rate), data = samples * 2, wav = Buffer.alloc(44 + data)
  wav.write('RIFF', 0); wav.writeUInt32LE(36 + data, 4); wav.write('WAVE', 8); wav.write('fmt ', 12)
  wav.writeUInt32LE(16, 16); wav.writeUInt16LE(1, 20); wav.writeUInt16LE(1, 22); wav.writeUInt32LE(rate, 24)
  wav.writeUInt32LE(rate * 2, 28); wav.writeUInt16LE(2, 32); wav.writeUInt16LE(16, 34); wav.write('data', 36); wav.writeUInt32LE(data, 40)
  return wav
}
async function localEnsure(body) {
  const chapter = frankenstein.chapters.find(c => c.number === body.chapter)
  assert(chapter, 'Known chapter ' + body.chapter)
  const paragraphs = await Promise.all(body.paragraphs.map(async item => {
    const text = chapter.paragraphs[item.index]
    if (typeof text !== 'string') return { paragraph: item.index, status: 'failed', reason: 'unknown_paragraph' }
    const textHash = await sha256Hex(narrationTextForParagraph(text))
    // The Worker refuses a hash that is not the text's: so does this stand-in.
    if (item.textHash && item.textHash !== textHash) return { paragraph: item.index, status: 'text_mismatch', textHash }
    const tokens = narrationTokens(text)
    const chunks = chunkNarrationText(text).map(c => {
      const count = c.wordTo - c.wordFrom, duration = Math.max(1.5, Math.round(count * SECONDS_PER_WORD * 100) / 100)
      const words = tokens.slice(c.wordFrom, c.wordTo).map((word, i) => ({ text: word, start: Math.round(i * duration / count * 1000) / 1000, end: Math.round((i + 1) * duration / count * 1000) / 1000 }))
      return { index: c.index, wordFrom: c.wordFrom, wordTo: c.wordTo, ready: true, hash: `fixture-${body.voice}-${body.chapter}-${item.index}-${c.index}`,
        url: `/api/audio-file?fixture=inline-audio&clip=${body.voice}-${body.chapter}-${item.index}-${c.index}&seconds=${duration}`, duration, words, timingsUsable: true }
    })
    let offset = 0
    const words = chunks.flatMap(c => { const shifted = c.words.map(w => ({ text: w.text, start: Math.round((w.start + offset) * 1000) / 1000, end: Math.round((w.end + offset) * 1000) / 1000 })); offset += c.duration; return shifted })
    return { paragraph: item.index, status: 'ready', textHash, chunkCount: chunks.length, readyChunks: chunks.length, chunks, duration: Math.round(offset * 1000) / 1000, words, timingsUsable: true, source: 'cache' }
  }))
  return { bookId: body.bookId, editionKey: body.editionKey, chapter: body.chapter, voice: body.voice, model: 'fixture', mode: body.mode, paragraphs, generated: 0 }
}

// `voice` is what the guest is narrated with: signed out, only Ara ('f') and Helios ('m') play.
// `stored` is the voice in the reader's prefs; a stored Orion or Eve plays as the matching guest voice.
async function run(browser, engine, { phone = true, theme = 'dark', voice = 'f', stored = voice, reducedMotion = false } = {}) {
  const label = [engine, phone ? 'phone' : 'desktop', theme, stored === voice ? voice : stored + '-as-' + voice, reducedMotion ? 'reduced' : 'motion'].join('-')
  const context = await browser.newContext({ viewport: phone ? { width: 390, height: 844 } : { width: 1440, height: 900 }, hasTouch: phone, serviceWorkers: 'block', reducedMotion: reducedMotion ? 'reduce' : 'no-preference' })
  await context.tracing.start({ screenshots: true, snapshots: true })
  const page = await context.newPage()
  page.setDefaultTimeout(15000)
  const errors = [], calls = []
  let gateRelease, gate = new Promise(resolve => { gateRelease = resolve }), delayNext = true, failNext = false
  const result = { label, calls, errors, passed: false }
  page.on('pageerror', e => errors.push(e.message))
  await page.route('**/*', async route => {
    let ensureBody = null
    try {
    const req = route.request(), url = new URL(req.url())
    if (url.pathname === '/api/narration/ensure') {
      const body = req.postDataJSON()
      ensureBody = body
      assert.equal(body.bookId, 'frankenstein')
      assert.equal(body.voice, voice)
      assert(calls.length < 80, 'Bounded cached acceptance')
      const call = { body, at: Date.now() }; calls.push(call)
      if (failNext) { failNext = false; call.injectedFailure = true; return route.fulfill({ status: 503, json: { error: 'unavailable' } }).catch(() => {}) }
      if (!live) {
        const json = await localEnsure(body)
        call.status = 200; call.generated = 0
        assert(json.paragraphs.every(p => p.status === 'ready'), JSON.stringify({ response: json.paragraphs.map(p => ({ paragraph: p.paragraph, status: p.status })), request: body }))
        if (delayNext) { delayNext = false; call.delayed = true; await gate }
        return route.fulfill({ json }).catch(() => {})
      }
      // Labelled as Tinct's own check so its cached narration is not counted as a visitor's.
      const response = await route.fetch({ headers: { ...req.headers(), 'x-tinct-check': '1' }, timeout: 15000, maxRetries: 1 })
      const json = await response.json()
      call.status = response.status(); call.generated = json.generated || 0
      assert.equal(response.status(), 200, JSON.stringify({ response: json, request: body }))
      assert.equal(call.generated, 0, 'Acceptance must reuse cache')
      report.generated += call.generated
      if (delayNext) { delayNext = false; call.delayed = true; await gate }
      return route.fulfill({ response, json }).catch(() => {})
    }
    if (req.method() !== 'GET') return route.abort()
    if (!live && url.pathname === '/api/audio-file' && url.searchParams.get('fixture') === 'inline-audio') {
      return route.fulfill({ status: 200, contentType: 'audio/wav', headers: { 'accept-ranges': 'bytes' }, body: silentWav(Number(url.searchParams.get('seconds'))) }).catch(() => {})
    }
    if (!live && url.origin === origin) {
      const pathname = ['/reader'].includes(url.pathname) ? '/app.html' : url.pathname
      const file = path.resolve('dist', '.' + pathname)
      if (file.startsWith(path.resolve('dist') + '/')) {
        try { if ((await fs.stat(file)).isFile()) return route.fulfill({ path: file }) } catch {}
      }
    }
    return route.continue()
    } catch (error) {
      errors.push('Network acceptance: ' + error.message.split('\n')[0] + (ensureBody ? ' request=' + JSON.stringify(ensureBody) : ''))
      await route.abort().catch(() => {})
    }
  })
  await page.addInitScript(({ theme, stored }) => {
    localStorage.setItem('tinct-lab-prefs', JSON.stringify({ theme, primaryEdition: 'original-en', voicePersona: stored === 'm' ? 'male' : 'female', voicePersonaChosen: true, audiobookVoice: ['orion', 'eve'].includes(stored) ? stored : null }))
    sessionStorage.setItem('tinct:lab-reader-handoff', JSON.stringify({ kind: 'open-reader', bookId: 'frankenstein', primaryEditionKey: 'original-en', savedPlace: { bookId: 'frankenstein', chapterNumber: 1, paragraphIndex: 0, wordIndex: 0, page: 0 } }))
    window.__audio = null; window.__audioEvents = []
    const seen = new WeakSet()
    function observe(audio) {
      audio.muted = true; window.__audio = audio
      if (seen.has(audio)) return
      seen.add(audio)
      for (const type of ['playing', 'pause', 'ended', 'error']) audio.addEventListener(type, () => window.__audioEvents.push({ type, time: performance.now(), src: audio.currentSrc, currentTime: audio.currentTime }))
    }
    const NativeAudio = window.Audio
    window.Audio = function (...args) { const a = new NativeAudio(...args); observe(a); return a }
    window.Audio.prototype = NativeAudio.prototype
    Object.setPrototypeOf(window.Audio, NativeAudio)
    const nativePlay = HTMLMediaElement.prototype.play
    HTMLMediaElement.prototype.play = function () { observe(this); return nativePlay.call(this) }
    Object.defineProperty(navigator.mediaDevices, 'getUserMedia', { configurable: true, value: async () => { throw Error('Microphone disabled') } })
  }, { theme, stored })
  try {
    // The desktop case asserts the existing paged inline-audio geometry;
    // explicitly choose Classic under a default-ON shared reader. Phone is
    // already paged and keeps its ordinary Read/Compare route.
    await page.goto(origin + (phone ? '/reader?layout=phone' : '/reader?view=two-page'), { waitUntil: 'domcontentloaded' })
    await page.waitForFunction(() => document.querySelector('[data-testid="lab-root"]')?.dataset.readerReady === 'true', null, { timeout: 45000 })
    await page.evaluate(() => document.fonts.ready)
    await page.waitForTimeout(500)
    assert.equal(calls.length, 0, 'Reading never synthesizes')
    if (live && process.env.TINCT_EXPECTED_BUNDLE) assert((await page.content()).includes(process.env.TINCT_EXPECTED_BUNDLE), 'Exact deployed bundle')
    const wordGeometry = () => page.evaluate(() => [...document.querySelectorAll('.lab-page-wrap > .lab-passage [data-word-index]')]
      .filter(el => !el.closest('.lab-book-col-compare'))
      .map(el => { const r = el.getBoundingClientRect(); return {word: el.textContent, p: el.dataset.paragraphIndex, w: el.dataset.wordIndex, x: Math.round(r.x), y: Math.round(r.y), width: Math.round(r.width), height: Math.round(r.height)} }))
    const beforeWords = await wordGeometry()
    assert(beforeWords.length > 0, 'Capture actual reader words before Play')
    const header = page.getByTestId('lab-v2-play')
    const before = await header.boundingBox()
    await header.click()
    await page.waitForFunction(() => document.querySelector('[data-testid="lab-audio-spinner"]'))
    await page.getByRole('button', { name: 'Cancel audio loading' }).first().waitFor()
    await page.waitForTimeout(350)
    assert.deepEqual(await wordGeometry(), beforeWords, 'Play preparation preserves every displayed word and its geometry')
    const during = await header.boundingBox()
    assert.equal(during.width, before.width); assert.equal(during.height, before.height)
    assert.equal(await page.getByTestId('lab-narration-notice').count(), 0)
    const footer = phone ? page.getByTestId('lab-listen') : page.getByTestId('lab-hearing-pause')
    await footer.getByTestId('lab-audio-spinner').waitFor()
    if (reducedMotion) assert.equal(await footer.getByTestId('lab-audio-spinner').evaluate(el => getComputedStyle(el).animationName), 'none')
    await page.screenshot({ path: output + '/' + label + '-loading.png' })
    await footer.click()
    await page.waitForFunction(() => !document.querySelector('[data-testid="lab-audio-spinner"]'))
    const cancelledCalls = calls.length
    gateRelease()
    await page.waitForTimeout(650)
    assert.equal(calls.length, cancelledCalls, 'Cancellation stops new preparation')
    assert.equal(await page.evaluate(() => window.__audioEvents.filter(e => e.type === 'playing').length), 0, 'Late preparation must not start audio')
    result.cancelled = true

    failNext = true
    await header.click()
    await page.getByTestId('lab-narration-error').waitFor()
    assert.equal(await page.getByTestId('lab-audio-spinner').count(), 0)
    assert.notEqual(await page.getByTestId('lab-narration-error').evaluate(el => getComputedStyle(el).position), 'fixed')
    if (phone) {
      const errorBox = await page.getByTestId('lab-narration-error').boundingBox()
      const transportBox = await page.getByTestId('lab-phone-bar').boundingBox()
      assert(errorBox.y + errorBox.height <= transportBox.y + 2, 'Inline error clears transport')
    }
    await page.screenshot({ path: output + '/' + label + '-retry.png' })
    const start = await page.evaluate(() => performance.now())
    await page.getByTestId('lab-narration-retry').click()
    await page.waitForFunction(() => window.__audioEvents.some(e => e.type === 'playing'), null, { timeout: 30000 })
    result.retryStartMs = await page.evaluate(start => Math.round(window.__audioEvents.find(e => e.type === 'playing').time - start), start)
    await page.waitForFunction(() => !document.querySelector('[data-testid="lab-audio-spinner"]'))
    assert.equal(await page.getByTestId('lab-narration-error').count(), 0)
    result.retry = true
    await page.waitForFunction(() => document.querySelector('.lab-hearing-word.is-current, [data-testid="lab-word"].is-current'), null, { timeout: 15000 })
    assert.deepEqual(await wordGeometry(), beforeWords, 'Active narration paints the existing words without reflow')
    result.highlight = true
    await header.click()
    await page.waitForFunction(() => window.__audio?.paused)
    const playingBefore = await page.evaluate(() => window.__audioEvents.filter(e => e.type === 'playing').length)
    await header.click()
    await page.waitForFunction(count => window.__audioEvents.filter(e => e.type === 'playing').length > count, playingBefore, { timeout: 30000 })
    result.pauseResume = true
    await page.screenshot({ path: output + '/' + label + '-playing.png' })
    result.events = await page.evaluate(() => window.__audioEvents)
    assert.deepEqual(errors, [])
    result.passed = true
  } catch (error) {
    result.error = error.stack
    result.failureState = await page.evaluate(() => ({
      readerReady: document.querySelector('[data-testid="lab-root"]')?.dataset.readerReady,
      playLabel: document.querySelector('[data-testid="lab-v2-play"]')?.getAttribute('aria-label'),
      notice: document.querySelector('[data-testid="lab-narration-error"]')?.textContent,
      loading: !!document.querySelector('[data-testid="lab-audio-spinner"]'),
      audio: window.__audio && { paused: window.__audio.paused, readyState: window.__audio.readyState, networkState: window.__audio.networkState, currentTime: window.__audio.currentTime, errorCode: window.__audio.error?.code },
      events: window.__audioEvents?.map(({ type, time, currentTime }) => ({ type, time, currentTime })),
    })).catch(() => null)
    console.log('INLINE_AUDIO_FAILURE ' + JSON.stringify({ label, errors, calls: calls.map(({ at, status, generated, delayed, injectedFailure, body }) => ({ at, status, generated, delayed, injectedFailure, ...(status !== 200 && !injectedFailure ? { body } : {}) })), state: result.failureState }))
    await page.screenshot({ path: output + '/' + label + '-failure.png' }).catch(() => {})
    await context.tracing.stop({ path: output + '/' + label + '-trace.zip' }).catch(() => {})
  } finally {
    gateRelease()
    // Stop the actual player before draining routed requests and closing WebKit.
    // Never leave an open media element/tracing session in browser teardown.
    if (!page.isClosed()) {
      await page.getByTestId('lab-v2-play').evaluate(button => {
        if (button.getAttribute('aria-label') === 'Pause' || button.getAttribute('aria-label') === 'Cancel audio loading') button.click()
      }).catch(() => {})
    }
    console.log(JSON.stringify({ label, stage: 'cleanup', passed: result.passed }))
    let cleanupTimer
    try {
      await Promise.race([
        (async () => {
          // The case is already judged. An in-flight ensure forward may still be
          // waiting on the live Worker (15s, one retry): drop it rather than wait,
          // or cleanup outlasts its own budget (featured-preview / deploy flakes, 2026-09-25).
          await page.unrouteAll({ behavior: 'ignoreErrors' })
          await context.tracing.stop().catch(() => {})
          await context.close()
        })(),
        new Promise((_, reject) => { cleanupTimer = setTimeout(() => reject(new Error('Browser cleanup exceeded 20 seconds')), 20000) }),
      ])
    } catch (error) {
      result.passed = false
      result.error = (result.error || '') + '\n' + error.message
    } finally { clearTimeout(cleanupTimer) }
    report.cases.push(result)
    await fs.writeFile(output + '/report.json', JSON.stringify(report, null, 2))
    console.log(JSON.stringify({ label, passed: result.passed, error: result.error, retryStartMs: result.retryStartMs }))
  }
}
for (const [engine, type] of [['chromium', chromium], ['webkit', webkit]]) {
  const browser = await markInternal(await type.launch({ headless: true, ...(engine === 'chromium' ? { args: ['--mute-audio'] } : {}) }))
  try {
    for (const theme of ['dark', 'light']) await run(browser, engine, { theme })
    if (engine === 'chromium') {
      await run(browser, engine, { phone: false })
      await run(browser, engine, { phone: false, theme: 'light', reducedMotion: true })
      await run(browser, engine, { voice: 'm' })
      // Signed out, a stored Orion or Eve is narrated by Helios or Ara.
      await run(browser, engine, { voice: 'm', stored: 'orion' })
      await run(browser, engine, { voice: 'f', stored: 'eve' })
    }
  } finally { await browser.close() }
}
assert(report.cases.every(item => item.passed), 'Inline audio acceptance failed; inspect report and trace')
