// Local muted browser regression for continuous Play/Pause and browsing while narrated.
// All service calls are mocked; no provider or account endpoint is contacted.
import assert from 'node:assert/strict'
import { chromium } from '@playwright/test'
import { markInternal } from './lib/internalTraffic.cjs'

const origin = process.env.TINCT_ORIGIN || 'http://127.0.0.1:3001'
const browser = await markInternal(await chromium.launch({ headless: true,
  executablePath: process.env.TINCT_CHROMIUM_EXECUTABLE || undefined,
  args: ['--mute-audio', '--no-sandbox', '--autoplay-policy=no-user-gesture-required'] }))
const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, serviceWorkers: 'block' })
const page = await context.newPage()
const ensureCalls = [], errors = [], apiCalls = []
let paragraphs = []
page.on('pageerror', error => errors.push(error.message))
function silentWav(seconds = 30) {
  const samples = seconds * 8000, buffer = Buffer.alloc(44 + samples * 2)
  buffer.write('RIFF', 0); buffer.writeUInt32LE(36 + samples * 2, 4); buffer.write('WAVE', 8)
  buffer.write('fmt ', 12); buffer.writeUInt32LE(16, 16); buffer.writeUInt16LE(1, 20); buffer.writeUInt16LE(1, 22)
  buffer.writeUInt32LE(8000, 24); buffer.writeUInt32LE(16000, 28); buffer.writeUInt16LE(2, 32); buffer.writeUInt16LE(16, 34)
  buffer.write('data', 36); buffer.writeUInt32LE(samples * 2, 40)
  return buffer
}
await page.route('**/*', async route => {
  const url = new URL(route.request().url())
  if (url.origin !== origin) return route.abort()
  if (url.pathname.startsWith('/api/')) apiCalls.push(`${route.request().method()} ${url.pathname}`)
  if (url.pathname === '/api/narration/voices') return route.fulfill({ json: { enabled: true, provider: 'grok', model: 'fixture', voices: [{ key: 'f', label: 'Fixture', persona: 'female' }] } })
  if (url.pathname === '/api/narration/ensure') {
    const body = route.request().postDataJSON()
    ensureCalls.push(body)
    const results = body.paragraphs.map(request => {
      const words = (paragraphs[request.index] || '').split(/\s+/).filter(Boolean)
      const duration = Math.max(30, words.length * .35)
      const chunk = { index: 0, wordFrom: 0, wordTo: words.length, ready: true,
        url: `/api/audio-file?path=narration%2Ffixture%2Fp${request.index}.mp3`, duration, timingsUsable: true,
        words: words.map((text, index) => ({ text, start: index * .16, end: (index + 1) * .16 })) }
      return { paragraph: request.index, status: 'ready', textHash: request.textHash, chunkCount: 1, readyChunks: 1, chunks: [chunk], duration, words: null, source: 'cache' }
    })
    return route.fulfill({ json: { paragraphs: results, generated: 0 } })
  }
  if (url.pathname === '/api/audio-file') return route.fulfill({ contentType: 'audio/wav', body: silentWav() })
  if (url.pathname.startsWith('/api/')) return route.fulfill({ status: 404, json: {} })
  return route.continue()
})
await page.addInitScript(() => {
  localStorage.setItem('tinct-lab-prefs', JSON.stringify({ primaryEdition: 'original-en', audioEdition: 'original-en', voicePersona: 'female', voicePersonaChosen: true }))
  localStorage.setItem('tinct-lab-position', JSON.stringify({ books: { frankenstein: {
    bookId: 'frankenstein', headerBook: 'Frankenstein', chapterNumber: 2, sequentialChapter: 2,
    paragraphIndex: 3, wordIndex: 4, primaryEditionKey: 'original-en', updatedAt: Date.now() - 1000, deviceId: 'fixture', rev: 1,
  } }, lastSettledBookId: 'frankenstein', lastSettledAt: Date.now() - 1000, finished: {} }))
})
const place = () => page.evaluate(() => {
  const p = JSON.parse(localStorage.getItem('tinct-lab-position') || '{}').books?.frankenstein
  return p && { paragraphIndex: p.paragraphIndex, wordIndex: p.wordIndex }
})
try {
  const source = await (await context.request.get(`${origin}/data/editions/frankenstein-original-en.json`)).json()
  paragraphs = source.chapters[1].paragraphs.map(item => (typeof item === 'string' ? item : item.text).replace(/\s+/g, ' ').trim())
  await page.goto(`${origin}/reader?book=frankenstein&sharedReader=1`, { waitUntil: 'domcontentloaded' })
  await page.getByTestId('continuous-reader').waitFor({ timeout: 45000 })
  assert.deepEqual(await place(), { paragraphIndex: 3, wordIndex: 4 })
  await page.getByTestId('lab-v2-play').click()
  await page.waitForFunction(() => document.querySelector('.lab')?.dataset.playing === 'true', null, { timeout: 30000 }).catch(async error => {
    throw new Error(JSON.stringify({ calls: ensureCalls.slice(0, 3), apiCalls, state: await page.evaluate(() => ({ playing: document.querySelector('.lab')?.dataset.playing, notice: document.querySelector('[data-testid="lab-narration-notice"]')?.textContent, account: document.querySelector('[data-testid="lab-account-prompt"]')?.textContent, text: document.body.innerText.slice(-800) })), errors }), { cause: error })
  })
  assert.equal(ensureCalls.find(call => call.paragraphs?.length)?.paragraphs[0].index, 3, 'Play prepared the visible nonzero paragraph')
  await page.waitForFunction(() => !!document.querySelector('[data-testid="continuous-reader"] .lab-hearing-word.is-current'), null, { timeout: 15000 })
  const heard = await page.locator('[data-testid="continuous-reader"] .lab-hearing-word.is-current').first().evaluate(el => ({ paragraphIndex: Number(el.dataset.paragraphIndex), wordIndex: Number(el.dataset.wordIndex) }))
  assert.equal(heard.paragraphIndex, 3)
  await page.getByTestId('lab-v2-play').click()
  await page.waitForFunction(() => document.querySelector('.lab')?.dataset.playing !== 'true', null, { timeout: 5000 })
  const paused = await place()
  assert.equal(paused.paragraphIndex, 3, 'Pause keeps the narrated source paragraph')
  assert(paused.wordIndex >= 0, 'Pause stores a source word')
  assert(await page.getByTestId('continuous-reader').locator(`[data-paragraph-index="${paused.paragraphIndex}"][data-word-index="${paused.wordIndex}"]`).count(), 'paused word is mounted')
  await page.getByTestId('lab-v2-play').click()
  await page.waitForFunction(() => document.querySelector('.lab')?.dataset.playing === 'true', null, { timeout: 15000 })
  const host = page.getByTestId('continuous-reader')
  await host.hover(); await page.mouse.wheel(0, 950)
  await page.waitForTimeout(500)
  const browsed = await place()
  assert(browsed.paragraphIndex > paused.paragraphIndex || browsed.wordIndex > paused.wordIndex,
    `wheel browsing moves visible place during narration: ${JSON.stringify({ paused, browsed, host: await host.evaluate(el => ({ scrollTop: el.scrollTop, scrollHeight: el.scrollHeight, clientHeight: el.clientHeight })) })}`)
  await page.waitForTimeout(500)
  assert.deepEqual(await place(), browsed, 'narration follow does not snap browsing position back')
  await page.getByTestId('lab-v2-play').click()
  assert.deepEqual(await place(), browsed, 'Pause while browsing preserves visible source coordinate')
  assert.deepEqual(errors, [])
  console.log('Shared reader nonzero Play/Pause, word follow, and browse while listening passed', { heard, paused, browsed })
} finally { await browser.close() }
