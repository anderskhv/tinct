#!/usr/bin/env node
// Local, provider-blocked repair acceptance for the original phone controls.
// Starts Vite in this process because isolated browser/tool sessions cannot
// share a localhost listener in the cloud workspace.
import assert from 'node:assert/strict'
import { mkdir, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { createServer } from 'vite'
import { chromium, webkit, devices } from 'playwright'

const output = resolve(process.env.PHONE_PARITY_OUTPUT || 'artifacts/shared-phone-parity')
await mkdir(output, { recursive: true })
const server = await createServer({ configFile: resolve('vite.config.ts'), server: { host: '127.0.0.1', port: 0, strictPort: false }, logLevel: 'error' })
let browsers = []
const results = []

try {
  await server.listen()
  const address = server.httpServer.address()
  assert(address && typeof address !== 'string')
  const origin = `http://127.0.0.1:${address.port}`
  const fakeAnswer = 'The passage describes its central event in clear terms. This local answer is a UI fixture.'
  const sse = text => `data: ${JSON.stringify({ type: 'content_block_delta', delta: { type: 'text_delta', text } })}\n\ndata: {"type":"message_stop"}\n\n`

  async function open(browser, chapterNumber, paragraphIndex = 0) {
    const context = await browser.newContext({ ...devices['iPhone 13'], viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, serviceWorkers: 'block', reducedMotion: 'reduce' })
    const calls = [], errors = []
    await context.route('**/*', route => {
      const request = route.request(), url = new URL(request.url())
      if (url.origin !== origin) return route.abort()
      if (/^\/api\/(chat|lab-chat)$/.test(url.pathname) && request.method() === 'POST') {
        const body = request.postDataJSON()
        calls.push(body?.companion?.intent || 'chat')
        const intent = body?.companion?.intent
        const answer = intent === 'quiz'
          ? JSON.stringify({ ideas: ['passage'], thesis: 'a local fixture', questions: [1, 2, 3].map(n => ({ idea: 0, q: `Local question ${n}?`, answer: `Answer ${n}`, why: 'In the passage.' })) })
          : intent && intent !== 'explain' ? `${intent}: ${fakeAnswer}` : fakeAnswer
        return route.fulfill({ status: 200, contentType: 'text/event-stream', body: sse(answer) })
      }
      if (url.pathname.startsWith('/api/')) return route.fulfill({ status: 404, contentType: 'application/json', body: '{}' })
      return route.continue()
    })
    await context.addInitScript(({ chapterNumber, paragraphIndex }) => {
      localStorage.setItem('tinct:wipe-v1-done', '1')
      localStorage.setItem('tinct-lab-prefs', JSON.stringify({ primaryEdition: 'webc-en', compareEdition: 'webc-en', compareOpen: false, compareChosen: true }))
      sessionStorage.setItem('tinct:lab-reader-handoff', JSON.stringify({ kind: 'open-reader', bookId: 'bible', primaryEditionKey: 'webc-en',
        savedPlace: { bookId: 'bible', chapterNumber, paragraphIndex, wordIndex: 0, page: 0 } }))
      HTMLMediaElement.prototype.play = async function () { this.muted = true }
      if (navigator.mediaDevices) Object.defineProperty(navigator.mediaDevices, 'getUserMedia', { configurable: true, value: async () => { throw new Error('Microphone disabled in acceptance') } })
      const actual = window.visualViewport
      const fake = new EventTarget()
      let keyboard = 0, top = 0
      for (const key of ['width', 'offsetLeft', 'pageLeft', 'pageTop', 'scale']) Object.defineProperty(fake, key, { get: () => actual?.[key] ?? 0 })
      Object.defineProperty(fake, 'height', { get: () => (actual?.height ?? innerHeight) - keyboard })
      Object.defineProperty(fake, 'offsetTop', { get: () => top })
      Object.defineProperty(window, 'visualViewport', { configurable: true, get: () => fake })
      window.__phoneParityKeyboard = (height, offset = 0) => { keyboard = height; top = offset; fake.dispatchEvent(new Event('resize')); fake.dispatchEvent(new Event('scroll')) }
    }, { chapterNumber, paragraphIndex })
    const page = await context.newPage()
    page.on('pageerror', error => errors.push(error.message))
    page.setDefaultTimeout(12000)
    await page.goto(`${origin}/reader?book=bible&sharedReader=1&layout=phone`, { waitUntil: 'domcontentloaded' })
    await page.waitForFunction(() => document.querySelector('[data-testid="lab-root"]')?.dataset.readerReady === 'true', null, { timeout: 60000 })
    await page.evaluate(() => document.fonts.ready)
    if (await page.getByTestId('lab-chapter-cover').isVisible().catch(() => false)) await page.keyboard.press('ArrowRight')
    assert.equal(await page.getByTestId('lab-root').getAttribute('data-lab-layout'), 'phone')
    assert.equal(await page.getByTestId('lab-root').getAttribute('data-shared-reader'), 'true')
    return { context, page, calls, errors }
  }

  async function select(page) {
    const words = page.locator('[data-testid="lab-page-wrap"] .lab-passage [data-testid="lab-word"]:visible')
    await words.nth(12).waitFor()
    const a = await words.nth(3).boundingBox(), b = await words.nth(12).boundingBox()
    assert(a && b)
    const pos = box => ({ clientX: box.x + box.width / 2, clientY: box.y + box.height / 2 })
    await words.nth(3).dispatchEvent('pointerdown', { pointerId: 9, pointerType: 'touch', isPrimary: true, bubbles: true, button: 0, ...pos(a) })
    await page.waitForTimeout(320)
    await words.nth(12).dispatchEvent('pointermove', { pointerId: 9, pointerType: 'touch', isPrimary: true, bubbles: true, ...pos(b) })
    await words.nth(12).dispatchEvent('pointerup', { pointerId: 9, pointerType: 'touch', isPrimary: true, bubbles: true, ...pos(b) })
    await page.getByTestId('lab-phone-bar').waitFor()
    assert.equal(await page.locator('.selection-popup').count(), 0)
  }

  async function screenshot(page, name) {
    const path = resolve(output, name + '.png')
    await page.screenshot({ path })
    return path
  }

  const engines = (process.env.PHONE_PARITY_ENGINES || 'chromium').split(',').map(name => name.trim()).filter(Boolean)
  for (const name of engines) {
    const engine = name === 'chromium' ? chromium : name === 'webkit' ? webkit : null
    assert(engine, `Unsupported browser engine: ${name}`)
    const browser = await engine.launch({ headless: true, ...(name === 'chromium' ? { args: ['--mute-audio', '--autoplay-policy=user-gesture-required'] } : {}) })
    browsers.push(browser)
    const evidence = { engine: name, screenshots: [], intents: [], errors: [] }
    results.push(evidence)
    const end = await open(browser, 1235, 4)
    try {
      for (let turn = 0; turn < 24 && !(await end.page.getByTestId('lab-unit-quiz').isVisible().catch(() => false)); turn++) {
        assert.equal(await end.page.getByTestId('lab-root').getAttribute('data-chapter'), '1235', 'remain in 1 Maccabees 16')
        await end.page.keyboard.press('ArrowRight')
        await end.page.waitForTimeout(220)
      }
      await end.page.getByTestId('lab-unit-quiz').waitFor({ state: 'visible' })
      const actions = (await end.page.getByTestId('lab-chapter-end').textContent()).replace(/\s+/g, '')
      assert.match(actions, /Recap.*Quizme.*Note/)
      evidence.screenshots.push(await screenshot(end.page, `${name}-1maccabees16-end`))
      await end.page.getByTestId('lab-chapter-note-open').click()
      assert.equal(await end.page.getByTestId('lab-phone-card').getAttribute('data-kind'), 'chapter-note')
      assert.equal(await end.page.locator('.lab-chapter-note-editor').count(), 0)
      evidence.screenshots.push(await screenshot(end.page, `${name}-chapter-note`))
      await end.page.getByTestId('lab-phone-card-note').focus()
      await end.page.evaluate(() => window.__phoneParityKeyboard(310, 80))
      const dock = await end.page.getByTestId('lab-phone-card-dock').boundingBox()
      const card = await end.page.getByTestId('lab-phone-card').boundingBox()
      const visibleBottom = await end.page.evaluate(() => visualViewport.offsetTop + visualViewport.height)
      assert(dock && card && card.y + card.height <= visibleBottom + 2, 'note card remains above simulated keyboard')
      evidence.keyboard = { simulated: true, visibleBottom, cardBottom: card.y + card.height }
      evidence.screenshots.push(await screenshot(end.page, `${name}-chapter-note-viewport-simulated`))
      evidence.errors.push(...end.errors)
    } finally { await end.context.close() }

    const selection = await open(browser, 1307, 1)
    try {
      await select(selection.page)
      evidence.screenshots.push(await screenshot(selection.page, `${name}-sirach38-selection`))
      await selection.page.getByTestId('lab-pbar-explain').click()
      await selection.page.getByTestId('lab-phone-card-stream').waitFor()
      assert.equal(await selection.page.getByTestId('lab-phone-card').getAttribute('data-kind'), 'explain')
      assert.equal(await selection.page.locator('.selection-popup').count(), 0)
      evidence.screenshots.push(await screenshot(selection.page, `${name}-sirach38-explain`))
      await selection.page.keyboard.press('Escape')
      await selection.page.getByTestId('lab-phone-card').waitFor({ state: 'hidden' })
      await select(selection.page)
      await selection.page.getByTestId('lab-pbar-simplify').click()
      assert.equal(await selection.page.getByTestId('lab-phone-card').getAttribute('data-kind'), 'simplify')
      evidence.screenshots.push(await screenshot(selection.page, `${name}-sirach38-simplify`))
      evidence.intents = selection.calls
      evidence.errors.push(...selection.errors)
    } finally { await selection.context.close() }
    assert.deepEqual(evidence.errors, [])
  }
  await writeFile(resolve(output, 'result.json'), JSON.stringify(results, null, 2) + '\n')
  console.log(JSON.stringify({ passed: true, output, results }))
} finally {
  for (const browser of browsers) await browser.close()
  await server.close()
}
