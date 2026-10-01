// Muted, isolated browser QA for Time Machine (pd-35) narration. No real provider.
// Needs: narration-mock-server.mjs on MOCK (default :9911) and a local Worker
// (`npx wrangler dev --local`) whose XAI/Supabase base URLs point at the mock.
// Run from app/: node ../addbooks/scripts/verify-pilot-narration.mjs [--budget]
// --budget expects a Worker started with a tiny NARRATION_DAILY_BYTES.
import { createRequire } from 'node:module'
import { mkdir, writeFile, readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import assert from 'node:assert/strict'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const { chromium } = createRequire(path.join(root, 'app/package.json'))('@playwright/test')
const origin = process.env.WORKER || 'http://127.0.0.1:8787'
const mock = process.env.MOCK || 'http://127.0.0.1:9911'
const budgetMode = process.argv.includes('--budget')
const out = path.join(root, 'addbooks/qa/pilot-narration')
await mkdir(out, { recursive: true })
const SUPABASE = 'https://yazjyiqsxjystvpkyouk.supabase.co'
const TOKEN = 'tinct-qa-signed-in'
const USER = { id: '22222222-2222-4222-8222-222222222222', email: 'qa-reader@example.com', aud: 'authenticated', role: 'authenticated' }
const edition = JSON.parse(await readFile(path.join(root, 'app/public/data/editions/pd-35-original-en.json'), 'utf8'))
const ttsCalls = async () => (await (await fetch(mock + '/__control')).json()).ttsCalls.length
async function settle() {
  // A request abandoned by a closed page can still finish on the Worker; wait for provider quiet.
  for (let last = -1, n = await ttsCalls(); n !== last; last = n, await new Promise(r => setTimeout(r, 4000)), n = await ttsCalls());
}
const control = body => fetch(mock + '/__control', { method: 'POST', body: JSON.stringify(body) })
const report = { origin, provider: 'mock xAI /v1/tts (no real provider)', budgetMode, startedAt: new Date().toISOString(), cases: [] }

async function open(browser, name, { signedIn, place, speed = 2 }) {
  const viewport = name === 'phone' ? { width: 390, height: 844 } : { width: 1365, height: 900 }
  const context = await browser.newContext({ viewport, isMobile: name === 'phone', hasTouch: name === 'phone', serviceWorkers: 'block' })
  await context.routeWebSocket(/.*/, ws => ws.close())
  const ensures = []
  await context.route('**/*', async route => {
    const url = new URL(route.request().url())
    if (url.origin === SUPABASE) {
      if (url.pathname === '/auth/v1/user' && signedIn) return route.fulfill({ json: USER })
      return route.fulfill({ status: route.request().method() === 'GET' ? 200 : 201, json: [] })
    }
    if (url.origin !== origin) return route.fulfill({ status: 404, body: '' })
    if (url.pathname === '/api/narration/ensure') ensures.push({ at: Date.now(), body: route.request().postDataJSON() })
    if (url.pathname.startsWith('/api/') && !/^\/api\/(narration|audio)/.test(url.pathname)) return route.fulfill({ status: 404, json: {} })
    return route.continue()
  })
  const page = await context.newPage()
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  await page.addInitScript(({ signedIn, place, speed, token, user }) => {
    if (sessionStorage.getItem('qa-init')) return
    sessionStorage.setItem('qa-init', '1')
    localStorage.setItem('tinct-lab-prefs', JSON.stringify({ primaryEdition: 'original-en', voicePersona: 'female', audioSpeed: speed }))
    if (signedIn) localStorage.setItem('sb-yazjyiqsxjystvpkyouk-auth-token', JSON.stringify({ access_token: token, token_type: 'bearer',
      expires_in: 86400, expires_at: Math.floor(Date.now() / 1000) + 86400, refresh_token: 'qa-refresh', user }))
    if (place) sessionStorage.setItem('tinct:lab-reader-handoff', JSON.stringify({ kind: 'open-reader', bookId: 'pd-35', primaryEditionKey: 'original-en',
      savedPlace: { bookId: 'pd-35', chapterNumber: place.chapter, paragraphIndex: place.paragraph, wordIndex: place.word || 0 } }))
    window.__audioEvents = []
    const play = HTMLMediaElement.prototype.play
    HTMLMediaElement.prototype.play = function () {
      this.muted = true
      window.__audio = this
      if (!this.__qa) {
        this.__qa = true
        for (const type of ['playing', 'pause', 'ended', 'seeked', 'error']) this.addEventListener(type, () => window.__audioEvents.push({ type, at: performance.now(), src: this.currentSrc, t: this.currentTime }))
      }
      return play.call(this)
    }
    Object.defineProperty(navigator.mediaDevices || {}, 'getUserMedia', { configurable: true, value: async () => { throw Error('Microphone disabled') } })
  }, { signedIn, place, speed, token: TOKEN, user: USER })
  return { context, page, ensures, errors }
}

async function ready(page) {
  await page.waitForFunction(() => document.querySelector('[data-testid="lab-root"]')?.dataset.readerReady === 'true', null, { timeout: 45000 })
  await page.waitForTimeout(800)
}
const playButton = page => page.locator('[data-testid="lab-v2-play"]:visible,[data-testid="lab-listen"]:visible').first()
async function revealControls(page) {
  // Never tap text here: on a phone a word tap is a narration seek.
  if (await playButton(page).waitFor({ timeout: 3000 }).then(() => true, () => false)) return
  await page.mouse.click(8, 8)
  await playButton(page).waitFor({ timeout: 5000 })
}
const playing = page => page.waitForFunction(() => window.__audio && !window.__audio.paused && window.__audio.currentTime > 0.05, null, { timeout: 60000 })
const current = page => page.evaluate(() => {
  const word = document.querySelector('.lab-hearing-word.is-current,[data-testid="lab-word"].is-current,.is-current[data-word-index]')
  return word ? { text: word.textContent, paragraph: word.closest('[data-paragraph-index]')?.getAttribute('data-paragraph-index') ?? word.getAttribute('data-paragraph-index'), word: word.getAttribute('data-word-index') } : null
})
const chapterOf = async page => Number(await page.getByTestId('lab-root').getAttribute('data-chapter'))

const CHAPTERS = { desktop: { play: 3, retry: 9, uncached: 12, budget: 14 }, phone: { play: 5, retry: 10, uncached: 13, budget: 15 } }
async function signedInFlow(browser, name) {
  const ch = CHAPTERS[name]
  await settle()
  const row = { name, scenario: 'signed-in: open, silent read, play, highlight, pause/resume, seek, chapter end, cache' }
  const before = await ttsCalls()
  const { context, page, ensures, errors } = await open(browser, name, { signedIn: true, place: { chapter: ch.play, paragraph: 0 } })
  try {
    await page.goto(origin + '/reader' + (name === 'phone' ? '?layout=phone' : '?layout=desktop'))
    await ready(page)
    // Silent reading: turn a page and wait. Nothing may be prepared.
    await page.keyboard.press('ArrowRight'); await page.waitForTimeout(2500)
    row.silentReading = { ensures: ensures.length, ttsCalls: (await ttsCalls()) - before }
    assert.equal(row.silentReading.ensures, 0, 'opening/silent reading requested narration')
    assert.equal(row.silentReading.ttsCalls, 0)
    await page.keyboard.press('ArrowLeft'); await page.waitForTimeout(800)
    await revealControls(page)
    const t0 = Date.now()
    await playButton(page).click()
    await playing(page)
    row.firstAudioMs = Date.now() - t0
    const src = await page.evaluate(() => window.__audio.currentSrc)
    assert(/narration(%2F|\/)grok/.test(src), 'plays a Grok cache object: ' + src)
    const w1 = await current(page)
    await page.waitForTimeout(2500)
    const w2 = await current(page)
    row.highlight = { first: w1, later: w2 }
    assert(w1 && w2, 'a current word is painted')
    assert(Number(w2.paragraph) * 1e4 + Number(w2.word) > Number(w1.paragraph) * 1e4 + Number(w1.word), 'highlight advances')
    await page.screenshot({ path: `${out}/${name}-playing.png` })
    // Pause, then confirm no new preparation; resume continues from the same time.
    await revealControls(page)
    await playButton(page).click()
    await page.waitForFunction(() => window.__audio.paused)
    const pausedAt = await page.evaluate(() => ({ t: window.__audio.currentTime, src: window.__audio.currentSrc }))
    const pausedWord = await current(page)
    const n = ensures.length
    await page.waitForTimeout(2000)
    row.pause = { ensuresDuringPause: ensures.length - n, pausedAt, pausedWord, stillPaused: await page.evaluate(() => window.__audio.paused) }
    assert.equal(ensures.length, n, 'pause stops preparation')
    assert(row.pause.stillPaused)
    await revealControls(page)
    await playButton(page).click()
    await playing(page)
    const resumedWord = await current(page)
    row.resume = { ...(await page.evaluate(() => ({ t: window.__audio.currentTime, src: window.__audio.currentSrc }))), word: resumedWord }
    // Designed behaviour: Play resumes the last heard word from the start of its sentence.
    const sentence = edition.chapters[(await chapterOf(page)) - 1].paragraphs[Number(pausedWord.paragraph)].split(/\s+/)
    let sentenceStart = Number(pausedWord.word)
    while (sentenceStart > 0 && !/[.!?][”’"')]*$/.test(sentence[sentenceStart - 1])) sentenceStart--
    row.resume.expectedFrom = sentenceStart
    assert(resumedWord && resumedWord.paragraph === pausedWord.paragraph
      && Number(resumedWord.word) >= sentenceStart - 1 && Number(resumedWord.word) <= Number(pausedWord.word) + 6, 'resume starts the paused sentence')
    // Seek 1: tap a later word that is actually on screen (the reader's word control).
    const chapter = await chapterOf(page)
    const tap = await page.evaluate(() => {
      const words = [...document.querySelectorAll('[data-testid="lab-word"][data-paragraph-index]')].filter(el => {
        const r = el.getBoundingClientRect()
        if (r.width < 8 || r.top < 120 || r.bottom > innerHeight - 160 || r.left < 0 || r.right > innerWidth) return false
        return document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2) === el
      })
      const el = words[Math.floor(words.length * 0.8)]
      if (!el) return null
      const r = el.getBoundingClientRect()
      return { x: r.left + r.width / 2, y: r.top + r.height / 2, paragraph: el.dataset.paragraphIndex, word: el.dataset.wordIndex, text: el.textContent }
    })
    assert(tap, 'no on-screen word to tap')
    await page.mouse.click(tap.x, tap.y)
    await page.waitForTimeout(700)
    const afterTap = await current(page)
    row.wordSeek = { target: tap, after: afterTap }
    assert(afterTap && afterTap.paragraph === tap.paragraph && Number(afterTap.word) >= Number(tap.word) && Number(afterTap.word) - Number(tap.word) <= 12, 'word tap moved narration to the tapped word')
    await playing(page)
    // Seek 2: back 15 seconds must move the highlight backwards.
    await page.waitForTimeout(2500)
    const beforeBack = await current(page)
    await page.locator('[data-testid="lab-hearing-back"]:visible').first().click()
    await playing(page)
    await page.waitForTimeout(500)
    const afterBack = await current(page)
    const order = w => Number(w.paragraph) * 1e4 + Number(w.word)
    row.back15 = { before: beforeBack, after: afterBack }
    assert(afterBack && order(afterBack) < order(beforeBack), 'back 15 s moved narration backwards')
    // Seek 3: jump towards the chapter end (desktop timeline; phone forward 15 s), then let it hand off.
    const target = edition.chapters[chapter - 1].paragraphs.length - 1
    const bar = page.locator('[role="slider"][aria-label="Chapter position"]:visible')
    if (await bar.count()) {
      const box = await bar.first().boundingBox()
      await page.mouse.click(box.x + box.width * 0.95, box.y + box.height / 2)
      row.seek = { via: 'timeline 95%' }
      await playing(page)
      await page.waitForTimeout(1200)
      row.seek.after = await current(page)
      assert(Number(row.seek.after?.paragraph) >= target - 1, 'timeline seek moved narration near the chapter end')
    } else {
      row.seek = { via: 'forward 15 s', presses: 0 }
      while (await chapterOf(page) === chapter && row.seek.presses < 80) {
        await page.locator('[data-testid="lab-hearing-forward"]:visible').first().click().catch(() => {})
        row.seek.presses++
        await page.waitForTimeout(1500)
      }
    }
    // The chapter ends; narration hands off to the next chapter and keeps playing.
    await page.waitForFunction(previous => Number(document.querySelector('[data-testid="lab-root"]')?.dataset.chapter) === previous + 1, chapter, { timeout: 120000 })
    await playing(page)
    row.chapterHandoff = { from: chapter, to: await chapterOf(page), playing: true, word: await current(page) }
    await page.screenshot({ path: `${out}/${name}-next-chapter.png` })
    await revealControls(page)
    await playButton(page).click()
    row.ensures = ensures.length
    row.ttsCalls = (await ttsCalls()) - before
    row.errors = errors
    assert.deepEqual(errors, [])
    row.ok = true
  } catch (error) {
    row.ok = false; row.error = String(error); row.errors = errors
    await page.screenshot({ path: `${out}/${name}-signed-in-failure.png` }).catch(() => {})
  } finally { await context.close() }
  report.cases.push(row)
}

async function guestFlow(browser, name) {
  const ch = CHAPTERS[name]
  await settle()
  const row = { name, scenario: 'guest: cached opening plays with zero synthesis; uncached chapter asks for an account' }
  const before = await ttsCalls()
  const { context, page, ensures, errors } = await open(browser, name, { signedIn: false, place: { chapter: ch.play, paragraph: 0 } })
  try {
    await page.goto(origin + '/reader' + (name === 'phone' ? '?layout=phone' : '?layout=desktop'))
    await ready(page)
    await revealControls(page)
    await playButton(page).click()
    await playing(page)
    row.cachedPlayback = { ttsCalls: (await ttsCalls()) - before, word: await current(page) }
    assert.equal(row.cachedPlayback.ttsCalls, 0, 'guest cached playback synthesised')
    await page.screenshot({ path: `${out}/${name}-guest-cached.png` })
    await revealControls(page)
    await playButton(page).click()
    await context.close()
    // An uncached chapter: guests may not generate.
    const second = await open(browser, name, { signedIn: false, place: { chapter: ch.uncached, paragraph: 0 } })
    await second.page.goto(origin + '/reader' + (name === 'phone' ? '?layout=phone' : '?layout=desktop'))
    await ready(second.page)
    await revealControls(second.page)
    await playButton(second.page).click()
    await second.page.waitForFunction(() => /sign in|create an account|account/i.test(document.body.innerText) && !window.__audio?.currentTime, null, { timeout: 30000 })
    row.uncached = { ttsCalls: (await ttsCalls()) - before, prompt: (await second.page.locator('[role="dialog"]:visible').first().innerText().catch(() => '')).slice(0, 200) }
    assert.equal(row.uncached.ttsCalls, 0, 'guest generation reached the provider')
    await second.page.screenshot({ path: `${out}/${name}-guest-account-required.png` })
    await second.context.close()
    row.errors = [...errors, ...second.errors]
    row.ok = true
  } catch (error) {
    row.ok = false; row.error = String(error); row.errors = errors
    await page.screenshot({ path: `${out}/${name}-guest-failure.png` }).catch(() => {})
  } finally { await context.close().catch(() => {}) }
  report.cases.push(row)
}

async function retryFlow(browser, name) {
  const ch = CHAPTERS[name]
  await settle()
  const row = { name, scenario: 'provider failure shows Retry; Retry plays once the provider recovers' }
  const { context, page, errors } = await open(browser, name, { signedIn: true, place: { chapter: ch.retry, paragraph: 0 } })
  try {
    await control({ failNext: 100 })
    await page.goto(origin + '/reader' + (name === 'phone' ? '?layout=phone' : '?layout=desktop'))
    await ready(page)
    await revealControls(page)
    await playButton(page).click()
    await page.getByTestId('lab-narration-error').waitFor({ timeout: 90000 })
    row.message = await page.getByTestId('lab-narration-error').innerText()
    await page.screenshot({ path: `${out}/${name}-retry.png` })
    await control({ failNext: 0 })
    for (let attempt = 0; attempt < 3; attempt++) {
      await page.getByTestId('lab-narration-retry').click()
      const ok = await playing(page).then(() => true, () => false)
      if (ok) { row.retries = attempt + 1; break }
      // The Worker's provider breaker stays open for a minute after repeated failures.
      await page.waitForTimeout(30000)
    }
    assert(row.retries, 'Retry never resumed playback')
    row.errors = errors
    row.ok = true
  } catch (error) {
    row.ok = false; row.error = String(error); row.errors = errors
    await page.screenshot({ path: `${out}/${name}-retry-failure.png` }).catch(() => {})
  } finally { await control({ failNext: 0 }); await context.close() }
  report.cases.push(row)
}

async function budgetFlow(browser, name) {
  const ch = CHAPTERS[name]
  await settle()
  const row = { name, scenario: 'signed-in reader over the daily narration ceiling is refused before any provider call' }
  const before = await ttsCalls()
  const { context, page, errors } = await open(browser, name, { signedIn: true, place: { chapter: ch.budget, paragraph: 0 } })
  try {
    await page.goto(origin + '/reader' + (name === 'phone' ? '?layout=phone' : '?layout=desktop'))
    await ready(page)
    await revealControls(page)
    await playButton(page).click()
    await page.getByTestId('lab-narration-error').waitFor({ timeout: 60000 })
    row.message = await page.getByTestId('lab-narration-error').innerText()
    assert.match(row.message, /budget|limit reached/i)
    row.ttsCalls = (await ttsCalls()) - before
    assert.equal(row.ttsCalls, 0)
    await page.screenshot({ path: `${out}/${name}-budget.png` })
    row.errors = errors
    row.ok = true
  } catch (error) {
    row.ok = false; row.error = String(error); row.errors = errors
    await page.screenshot({ path: `${out}/${name}-budget-failure.png` }).catch(() => {})
  } finally { await context.close() }
  report.cases.push(row)
}

const browser = await chromium.launch({ headless: true, ...(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {}), args: ['--mute-audio'] })
try {
  for (const name of (process.env.ONLY ? [process.env.ONLY] : ['desktop', 'phone'])) {
    if (budgetMode) { await budgetFlow(browser, name); continue }
    await signedInFlow(browser, name)
    await guestFlow(browser, name)
    await retryFlow(browser, name)
  }
} finally { await browser.close() }
report.completedAt = new Date().toISOString()
report.totalMockTtsCalls = await ttsCalls()
await writeFile(path.join(out, budgetMode ? 'budget-report.json' : 'report.json'), JSON.stringify(report, null, 2) + '\n')
console.log(JSON.stringify(report.cases.map(c => ({ name: c.name, scenario: c.scenario.split(':')[0], ok: c.ok, error: c.error })), null, 1))
if (report.cases.some(c => !c.ok)) process.exitCode = 1
