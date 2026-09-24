import { chromium, webkit } from '@playwright/test'
import fs from 'node:fs/promises'
import path from 'node:path'
import assert from 'node:assert/strict'

const live = process.env.READER_LIVE === '1'
const origin = 'https://tinct.app'
const output = 'artifacts/inline-audio-loading'
await fs.mkdir(output, { recursive: true })
const report = { live, cases: [], generated: 0, note: 'Delayed real cached responses exercise preparation without new synthesis; native playback is not mocked.' }

async function run(browser, engine, { phone = true, theme = 'dark', voice = 'f', reducedMotion = false } = {}) {
  const label = [engine, phone ? 'phone' : 'desktop', theme, voice, reducedMotion ? 'reduced' : 'motion'].join('-')
  const context = await browser.newContext({ viewport: phone ? { width: 390, height: 844 } : { width: 1440, height: 900 }, hasTouch: phone, serviceWorkers: 'block', reducedMotion: reducedMotion ? 'reduce' : 'no-preference' })
  await context.tracing.start({ screenshots: true, snapshots: true })
  const page = await context.newPage()
  page.setDefaultTimeout(15000)
  const errors = [], calls = []
  let gateRelease, gate = new Promise(resolve => { gateRelease = resolve }), delayNext = true, failNext = false
  const result = { label, calls, errors, passed: false }
  page.on('pageerror', e => errors.push(e.message))
  await page.route('**/*', async route => {
    try {
    const req = route.request(), url = new URL(req.url())
    if (url.pathname === '/api/narration/ensure') {
      const body = req.postDataJSON()
      assert.equal(body.bookId, 'frankenstein')
      assert.equal(body.voice, voice)
      assert(calls.length < 80, 'Bounded cached acceptance')
      const call = { body, at: Date.now() }; calls.push(call)
      if (failNext) { failNext = false; call.injectedFailure = true; return route.fulfill({ status: 503, json: { error: 'unavailable' } }).catch(() => {}) }
      const response = await route.fetch({ timeout: 15000, maxRetries: 1 })
      const json = await response.json()
      call.status = response.status(); call.generated = json.generated || 0
      assert.equal(response.status(), 200, JSON.stringify(json))
      assert.equal(call.generated, 0, 'Acceptance must reuse cache')
      report.generated += call.generated
      if (delayNext) { delayNext = false; call.delayed = true; await gate }
      return route.fulfill({ response, json }).catch(() => {})
    }
    if (req.method() !== 'GET') return route.abort()
    if (!live && url.origin === origin) {
      const pathname = ['/lab/phone', '/reader'].includes(url.pathname) ? '/app.html' : url.pathname
      const file = path.resolve('dist', '.' + pathname)
      if (file.startsWith(path.resolve('dist') + '/')) {
        try { if ((await fs.stat(file)).isFile()) return route.fulfill({ path: file }) } catch {}
      }
    }
    return route.continue()
    } catch (error) {
      errors.push('Network acceptance: ' + error.message.split('\n')[0])
      await route.abort().catch(() => {})
    }
  })
  await page.addInitScript(({ theme, voice }) => {
    localStorage.setItem('tinct-lab-prefs', JSON.stringify({ theme, primaryEdition: 'original-en', voicePersona: voice === 'm' ? 'male' : 'female', audiobookVoice: ['orion', 'eve'].includes(voice) ? voice : null }))
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
  }, { theme, voice })
  try {
    await page.goto(origin + (phone ? '/lab/phone?chrome=v2' : '/reader?chrome=v2'), { waitUntil: 'domcontentloaded' })
    await page.waitForFunction(() => document.querySelector('[data-testid="lab-root"]')?.dataset.readerReady === 'true', null, { timeout: 45000 })
    await page.evaluate(() => document.fonts.ready)
    await page.waitForTimeout(500)
    assert.equal(calls.length, 0, 'Reading never synthesizes')
    if (live && process.env.TINCT_EXPECTED_BUNDLE) assert((await page.content()).includes(process.env.TINCT_EXPECTED_BUNDLE), 'Exact deployed bundle')
    const header = page.getByTestId('lab-v2-play')
    const before = await header.boundingBox()
    await header.click()
    await page.waitForFunction(() => document.querySelector('[data-testid="lab-audio-spinner"]'))
    await page.getByRole('button', { name: 'Cancel audio loading' }).first().waitFor()
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
          await page.unrouteAll({ behavior: 'wait' })
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
  const browser = await type.launch({ headless: true, ...(engine === 'chromium' ? { args: ['--mute-audio'] } : {}) })
  try {
    for (const theme of ['dark', 'light']) await run(browser, engine, { theme })
    if (engine === 'chromium') {
      await run(browser, engine, { phone: false })
      await run(browser, engine, { phone: false, theme: 'light', reducedMotion: true })
      for (const voice of ['m', 'orion', 'eve']) await run(browser, engine, { voice })
    }
  } finally { await browser.close() }
}
assert(report.cases.every(item => item.passed), 'Inline audio acceptance failed; inspect report and trace')
