// Fish narration pilot — silent, isolated browser acceptance.
//
// Runs the V2 reader against a dev/preview server with every /api/narration
// call answered by an in-page mock, so no provider, no spend, no sound: the
// page is muted and headless. What it proves is the reader-side contract:
// opt-in, prepare-before-play with a visible loading state, the audio element
// pointed at the narration URL (never a Kokoro path), word paint from the
// recording's own timings, a failure with retry, and the voice row in Settings.
//
//   TEST_ORIGIN=http://127.0.0.1:5173 node scripts/check-narration-pilot.mjs
import { chromium } from 'playwright'
import assert from 'node:assert/strict'
import fs from 'node:fs'

const origin = process.env.TEST_ORIGIN || 'http://127.0.0.1:5173'
const artifactDir = process.env.ARTIFACT_DIR || '/tmp/tinct-narration-pilot'
fs.mkdirSync(artifactDir, { recursive: true })

/** Silent 16-bit mono WAV, so the media element has something real and quiet to play. */
function silentWav(seconds, sampleRate = 8000) {
  const samples = Math.floor(seconds * sampleRate)
  const buffer = Buffer.alloc(44 + samples * 2)
  buffer.write('RIFF', 0); buffer.writeUInt32LE(36 + samples * 2, 4); buffer.write('WAVE', 8)
  buffer.write('fmt ', 12); buffer.writeUInt32LE(16, 16); buffer.writeUInt16LE(1, 20); buffer.writeUInt16LE(1, 22)
  buffer.writeUInt32LE(sampleRate, 24); buffer.writeUInt32LE(sampleRate * 2, 28); buffer.writeUInt16LE(2, 32); buffer.writeUInt16LE(16, 34)
  buffer.write('data', 36); buffer.writeUInt32LE(samples * 2, 40)
  return buffer
}

const state = { ensureCalls: [], failNext: false, playPressed: false }

async function sha256(text) {
  const { createHash } = await import('node:crypto')
  return createHash('sha256').update(text).digest('hex')
}

const executablePath = [process.env.PW_CHROMIUM, '/opt/pw-browsers/chromium'].find(candidate => candidate && fs.existsSync(candidate))
const browser = await chromium.launch({ executablePath, args: ['--mute-audio', '--autoplay-policy=no-user-gesture-required'] })
const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true })
const page = await context.newPage()
await page.addInitScript(() => {
  sessionStorage.setItem('tinct:lab-reader-handoff', JSON.stringify({
    kind: 'open-reader', bookId: 'odyssey', primaryEditionKey: 'original-en',
    savedPlace: { bookId: 'odyssey', chapterNumber: 1, paragraphIndex: 0, page: 0 },
  }))
})

await page.route('**/api/narration/voices', route => route.fulfill({
  status: 200, contentType: 'application/json',
  body: JSON.stringify({ enabled: true, provider: 'fish', model: 's2.1-pro', voices: [{ key: 'a', label: 'Nathan (male, warm)' }, { key: 'b', label: 'Abby (female, clear)' }] }),
}))
// The mock Worker: one sentence group per paragraph. Before Play is pressed
// (the reader's prefetch on chapter open) nothing is ready, so the first press
// shows "Preparing narration…"; afterwards every requested paragraph is ready.
const textHashOf = async text => sha256(text)
await page.route('**/api/narration/ensure', async (route) => {
  const body = route.request().postDataJSON()
  state.ensureCalls.push(body)
  assert.equal(body.bookId, 'odyssey'); assert.equal(body.editionKey, 'original-en'); assert.equal(body.mode, 'next')
  if (state.failNext) {
    state.failNext = false
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ paragraphs: body.paragraphs.map(p => ({ paragraph: p.index, status: 'failed', reason: 'provider_unavailable', textHash: p.textHash })) }) })
  }
  const paragraphs = await Promise.all(body.paragraphs.map(async (p) => {
    const text = state.paragraphs[p.index] || ''
    const tokens = text.split(' ')
    const duration = Math.max(2, tokens.length * 0.32)
    const textHash = p.textHash || await textHashOf(text)
    const ready = state.playPressed && body.chapter === 1
    const chunk = { index: 0, wordFrom: 0, wordTo: tokens.length, ready }
    if (ready) Object.assign(chunk, {
      hash: `mock-${p.index}`, url: `/api/audio-file?path=narration%2Ffish%2Fblob%2Fmock-${p.index}.mp3`, duration, timingsUsable: true,
      words: tokens.map((word, i) => ({ text: word, start: (i * duration) / tokens.length, end: ((i + 1) * duration) / tokens.length })),
    })
    return {
      paragraph: p.index, status: ready ? 'ready' : 'pending', textHash, chunkCount: 1, readyChunks: ready ? 1 : 0, chunks: [chunk],
      duration: ready ? duration : undefined, words: ready ? chunk.words : null, timingsUsable: ready, source: ready ? 'generated' : undefined,
    }
  }))
  await new Promise(resolve => setTimeout(resolve, state.playPressed ? 600 : 150)) // visible "Preparing narration…"
  return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ paragraphs }) })
})
await page.route('**/api/audio-file?path=narration**', route => route.fulfill({ status: 200, contentType: 'audio/wav', body: silentWav(12) }))
const kokoroRequests = []
await page.route('**/api/audio-file?path=odyssey**', (route) => { kokoroRequests.push(route.request().url()); return route.continue() })

await page.goto(`${origin}/reader?narration=fish`)
await page.waitForFunction(() => document.querySelector('.lab')?.dataset.readerReady === 'true', null, { timeout: 60000 })
// Paragraph texts as displayed, so the mock can build word timings for them.
state.paragraphs = await (async () => {
  const raw = await (await fetch(`${origin}/data/editions/odyssey-original-en.json`)).json()
  return raw.chapters[0].paragraphs.map(p => p.replace(/\b_([^_\n]+)_\b/g, '$1').replace(/\s+/g, ' ').trim())
})()
const prefs = JSON.parse(await page.evaluate(() => localStorage.getItem('tinct-lab-prefs')))
assert.equal(prefs.shared.narrationProvider, 'fish', 'opt-in flag persisted in prefs')

// The chapter-open prefetch needs a signed-in reader (it would only collect
// 401s otherwise); this check runs anonymously, so nothing may be requested
// before Play. The prefetch itself is covered by useNarrationPrefetch.test.tsx.
await page.waitForTimeout(1200)
assert.equal(state.ensureCalls.length, 0, 'no narration request before Play for an anonymous reader')
state.playPressed = true
state.ensureCalls.length = 0
await page.getByTestId('lab-v2-play').click()
await page.waitForSelector('[data-testid="lab-narration-notice"][data-status="loading"]', { timeout: 15000 })
await page.screenshot({ path: `${artifactDir}/01-preparing.png` })
await page.waitForFunction(() => document.querySelector('.lab')?.dataset.playing === 'true', null, { timeout: 30000 })
await page.waitForFunction(() => !document.querySelector('[data-testid="lab-narration-notice"]'), null, { timeout: 15000 })
const first = state.ensureCalls.find(call => call.paragraphs.some(p => p.textHash))
assert.ok(first, 'the play request carries the displayed text hash')
assert.deepEqual(first.paragraphs.map(p => p.index), [0], 'the play request prepares only the paragraph about to play')
assert.equal(first.paragraphs[0].textHash, await sha256(state.paragraphs[0]), 'reader sends the hash of the displayed text')
await page.waitForFunction(() => document.querySelector('.lab-page-wrap > .lab-passage .lab-hearing-word.is-current'), null, { timeout: 20000 })
await page.screenshot({ path: `${artifactDir}/02-playing-word-paint.png` })
// Look-ahead keeps the next two paragraphs complete, bounded.
await page.waitForTimeout(2500)
const ahead = state.ensureCalls.filter(call => call.paragraphs.some(p => p.textHash) && call.paragraphs.length > 1)
assert.ok(ahead.length >= 1, 'look-ahead request was made')
assert.ok(ahead.every(call => Math.max(...call.paragraphs.map(p => p.index)) <= 2), 'look-ahead is bounded to two paragraphs ahead')
assert.equal(kokoroRequests.length, 0, 'no Kokoro audio requested while narration is on')

// Word seek within the prepared paragraph keeps playing from the narration URL.
const seekWord = page.locator('.lab-page-wrap > .lab-passage .lab-hearing-word').nth(6)
await seekWord.click()
await page.waitForTimeout(300)

// Pause from the hearing transport; the reader's place is untouched by narration.
await page.getByTestId('lab-hearing-pause').first().click()
await page.waitForFunction(() => document.querySelector('.lab')?.dataset.playing !== 'true', null, { timeout: 5000 })
await page.screenshot({ path: `${artifactDir}/03-paused.png` })

// Leave the paused transport, then open Settings: the narration pilot row lists both voices and Off.
await page.locator('button[aria-label="Close audio controls"]:visible').first().click()
// Reading chrome hides its controls until the page is tapped.
await page.waitForTimeout(500)
await page.mouse.click(195, 420)
await page.getByTestId('lab-super').waitFor({ timeout: 10000 })
await page.getByTestId('lab-super').click()
await page.getByTestId('lab-super-row-settings').click()
const row = page.getByTestId('lab-v2-narration-voice')
await row.waitFor({ timeout: 10000 })
const options = await row.locator('option').allTextContents()
assert.deepEqual(options, ['Off', 'Nathan (male, warm)', 'Abby (female, clear)'])
await page.screenshot({ path: `${artifactDir}/04-settings-voice-row.png` })
await row.selectOption('b')
const after = await page.evaluate(() => JSON.parse(localStorage.getItem('tinct-lab-prefs')))
assert.equal(after.shared.narrationVoice, 'b', 'voice choice persisted')
// A voice change resets playback state; the next ensure carries the new voice.
await page.getByTestId('lab-v2-sheet-close').first().click().catch(() => page.keyboard.press('Escape'))
await page.waitForTimeout(300)
state.ensureCalls.length = 0
state.failNext = true
await page.getByTestId('lab-v2-play').click()
await page.waitForSelector('[data-testid="lab-narration-notice"][data-status="error"]', { timeout: 20000 })
assert.ok(state.ensureCalls.every(call => call.voice === 'b'), 'ensure uses the newly chosen voice')
await page.screenshot({ path: `${artifactDir}/05-failure-with-retry.png` })
await page.getByTestId('lab-narration-retry').click()
await page.waitForFunction(() => document.querySelector('.lab')?.dataset.playing === 'true', null, { timeout: 30000 })
await page.waitForFunction(() => !document.querySelector('[data-testid="lab-narration-notice"]'), null, { timeout: 15000 })
await page.screenshot({ path: `${artifactDir}/06-retry-playing.png` })

console.log(JSON.stringify({ ensureCallsAfterVoiceChange: state.ensureCalls.map(c => ({ voice: c.voice, paragraphs: c.paragraphs.map(p => p.index) })), voiceAfter: after.shared.narrationVoice, artifacts: artifactDir }, null, 2))
await browser.close()
