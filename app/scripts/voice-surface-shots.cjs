/**
 * Screenshots of the voice surface (locked 2026-09-11) on phone and desktop,
 * with the voice layer stubbed exactly as voice-call-shots.cjs stubs it.
 *
 * Nothing here reaches a real Realtime session: getUserMedia hands back a
 * silent local stream made in the page, the session-token and SDP fetches are
 * answered locally, and RTCPeerConnection is a stub whose data channel, track
 * and connection state this script drives. The assistant's "voice" is an
 * oscillator, so the speaking orb follows genuine audio through the same
 * analyser the real call uses. Transcript turns are injected as Realtime
 * transcript events so the panel and pill have something to show.
 *
 * Usage: node scripts/voice-surface-shots.cjs <baseUrl> <outDir>
 */

const { chromium } = require('playwright')
const { mkdirSync, writeFileSync } = require('node:fs')

const BASE = process.argv[2] || 'http://127.0.0.1:3011'
const OUT = process.argv[3] || '/tmp/voice-surface-shots'
const EXECUTABLE = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome'

const STUB = () => {
  const realFetch = window.fetch.bind(window)
  const stub = {
    dc: null,
    pc: null,
    remote: null,
    osc: null,
    gain: null,
    openDataChannel() {
      const dc = stub.dc
      if (!dc) return false
      dc.readyState = 'open'
      dc.dispatch('open', {})
      const pc = stub.pc
      if (pc) {
        pc.connectionState = 'connected'
        pc.onconnectionstatechange && pc.onconnectionstatechange()
      }
      return true
    },
    attachAssistantTrack() {
      const ctx = new AudioContext()
      const dest = ctx.createMediaStreamDestination()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      gain.gain.value = 0
      osc.frequency.value = 180
      osc.connect(gain)
      gain.connect(dest)
      osc.start()
      stub.osc = osc
      stub.gain = gain
      stub.remote = dest.stream
      const pc = stub.pc
      if (pc && pc.ontrack) pc.ontrack({ streams: [dest.stream] })
      return true
    },
    assistantLoud(on) {
      if (stub.gain) stub.gain.gain.value = on ? 0.14 : 0
      return true
    },
    realtime(event) {
      const dc = stub.dc
      if (!dc) return false
      dc.dispatch('message', { data: JSON.stringify(event) })
      return true
    },
    drop() {
      const pc = stub.pc
      if (!pc) return false
      pc.connectionState = 'failed'
      pc.onconnectionstatechange && pc.onconnectionstatechange()
      return true
    },
  }
  window.__voiceStub = stub

  window.fetch = async (input, init) => {
    const url = typeof input === 'string' ? input : (input && input.url) || String(input)
    if (url.includes('voice-session')) {
      return new Response(JSON.stringify({ value: 'stub-ephemeral-key' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }
    if (url.includes('api.openai.com')) {
      return new Response('v=0\r\n', { status: 200, headers: { 'Content-Type': 'application/sdp' } })
    }
    return realFetch(input, init)
  }

  const silentStream = () => {
    const ctx = new AudioContext()
    const dest = ctx.createMediaStreamDestination()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    gain.gain.value = 0.0001
    osc.connect(gain)
    gain.connect(dest)
    osc.start()
    return dest.stream
  }
  Object.defineProperty(navigator, 'mediaDevices', {
    configurable: true,
    value: { getUserMedia: async () => silentStream() },
  })

  class StubDataChannel {
    constructor() {
      this.readyState = 'connecting'
      this.listeners = new Map()
    }
    addEventListener(type, fn) {
      const set = this.listeners.get(type) || new Set()
      set.add(fn)
      this.listeners.set(type, set)
    }
    removeEventListener(type, fn) { this.listeners.get(type) && this.listeners.get(type).delete(fn) }
    dispatch(type, event) { (this.listeners.get(type) || new Set()).forEach(fn => fn(event)) }
    send() { /* the model is never spoken to */ }
    close() { this.readyState = 'closed'; this.dispatch('close', {}) }
  }

  class StubPeerConnection {
    constructor() {
      this.connectionState = 'new'
      this.ontrack = null
      this.onconnectionstatechange = null
      this.senders = []
      stub.pc = this
    }
    createDataChannel() { stub.dc = new StubDataChannel(); return stub.dc }
    addTrack(track) { this.senders.push({ track }); return this.senders[this.senders.length - 1] }
    getSenders() { return this.senders }
    async createOffer() { return { type: 'offer', sdp: 'v=0\r\n' } }
    async setLocalDescription() {}
    async setRemoteDescription() {}
    close() {}
  }
  window.RTCPeerConnection = StubPeerConnection
}

// A greeting, not a book question: a question here would (rightly) be
// escalated to the typed companion, which the static server cannot answer.
const USER_LINE = 'Hello, Tinct.'
const ASSISTANT_LINE = 'Hello. We are at the opening of Genesis, where light arrives before the sun. Day and night exist from the first word; the sun and moon come on the fourth day as keepers of a rhythm that already runs. Ask me anything about this page.'

const results = { shots: [], checks: [] }

function note(name, ok, detail) {
  results.checks.push({ name, ok, detail })
  console.log(`  ${ok ? 'ok ' : 'FAIL'} ${name}${detail ? ` — ${detail}` : ''}`)
}

async function waitStatus(page, selector, text) {
  await page.waitForFunction(
    ([sel, want]) => (document.querySelector(sel) || {}).textContent === want,
    [selector, text],
    { timeout: 6000 },
  )
}

async function placeOf(page) {
  return page.evaluate(() => {
    const root = document.querySelector('[data-testid="lab-root"]')
    const lines = Array.from(document.querySelectorAll('.lab-hearing-line'))
      .filter(node => node.getClientRects().length > 0)
    const firstWords = (lines[0] ? lines[0].textContent : '').trim().split(/\s+/).slice(0, 8).join(' ')
    return {
      chapter: root.getAttribute('data-chapter'),
      place: root.getAttribute('data-place'),
      panel: root.getAttribute('data-desktop-panel'),
      firstWords,
      discussed: document.querySelectorAll('.lab-hearing-line.is-discussed').length,
    }
  })
}

/** The transport comes up: the surface may now say Listening. */
async function connect(page, statusSelector) {
  await page.waitForFunction(() => !!window.__voiceStub.dc, null, { timeout: 5000 })
  await page.evaluate(() => window.__voiceStub.openDataChannel())
  await page.evaluate(() => window.__voiceStub.attachAssistantTrack())
  await waitStatus(page, statusSelector, 'Listening.')
}

/** The reader greets; the answer arrives as a transcript, out loud. */
async function speak(page, statusSelector) {
  await page.evaluate((line) => {
    window.__voiceStub.realtime({ type: 'input_audio_buffer.speech_started' })
    window.__voiceStub.realtime({ type: 'input_audio_buffer.speech_stopped' })
    window.__voiceStub.realtime({ type: 'conversation.item.input_audio_transcription.completed', transcript: line })
  }, USER_LINE)
  await page.evaluate(() => window.__voiceStub.assistantLoud(true))
  await page.evaluate(() => window.__voiceStub.realtime({ type: 'output_audio_buffer.started' }))
  await page.evaluate((line) => {
    window.__voiceStub.realtime({ type: 'response.output_audio_transcript.delta', delta: line })
  }, ASSISTANT_LINE)
  await waitStatus(page, statusSelector, 'Speaking.')
}

/** She finishes; the microphone is open again. */
async function finishSpeaking(page, statusSelector) {
  await page.evaluate(() => window.__voiceStub.assistantLoud(false))
  await page.evaluate(() => window.__voiceStub.realtime({ type: 'output_audio_buffer.stopped' }))
  await page.evaluate(() => window.__voiceStub.realtime({ type: 'response.done' }))
  await waitStatus(page, statusSelector, 'Listening.')
}

/** The reader says something more; an answer is being put together. */
async function think(page, statusSelector) {
  await page.evaluate(() => {
    window.__voiceStub.realtime({ type: 'input_audio_buffer.speech_started' })
    window.__voiceStub.realtime({ type: 'input_audio_buffer.speech_stopped' })
    window.__voiceStub.realtime({ type: 'response.created' })
  })
  await waitStatus(page, statusSelector, 'Thinking.')
}

async function phone(browser, theme) {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    colorScheme: theme,
    permissions: ['microphone'],
  })
  await context.addInitScript(STUB)
  const page = await context.newPage()
  page.on('pageerror', error => console.error('[page error]', error.message))
  const shot = async (name) => {
    const file = `${OUT}/phone-${theme}-${name}.png`
    await page.screenshot({ path: file })
    results.shots.push(file)
  }
  await page.goto(`${BASE}/lab/phone?chrome=v2`, { waitUntil: 'domcontentloaded' })
  await page.waitForSelector('[data-testid="lab-root"][data-reader-ready="true"]')
  await page.waitForTimeout(900)
  await shot('0-reader')

  await page.click('[data-testid="lab-super"]')
  await page.click('[data-testid="lab-super-row-talk"]')
  await page.waitForSelector('[data-testid="lab-call"]')
  await page.waitForTimeout(500)
  await waitStatus(page, '[data-testid="lab-call-status"]', 'Connecting.')
  await shot('1-connecting')

  await connect(page, '[data-testid="lab-call-status"]')
  await page.waitForTimeout(500)
  await shot('2-listening')
  note(`phone ${theme}: listening caption`, (await page.textContent('[data-testid="lab-call-caption"]')) === 'Ask about this page.')

  await speak(page, '[data-testid="lab-call-status"]')
  await page.waitForTimeout(700)
  const level = await page.evaluate(() => ({
    source: document.querySelector('[data-testid="lab-call-circle"]').dataset.levelSource,
    level: document.querySelector('[data-testid="lab-call-circle"]').style.getPropertyValue('--lab-call-level'),
  }))
  note(`phone ${theme}: speaking orb follows real audio`, level.source === 'audio' && Number(level.level) > 0, `source=${level.source} level=${level.level}`)
  await shot('3-speaking')

  await finishSpeaking(page, '[data-testid="lab-call-status"]')
  await think(page, '[data-testid="lab-call-status"]')
  await page.waitForTimeout(500)
  await shot('4-thinking')

  await page.evaluate(() => window.__voiceStub.realtime({ type: 'input_audio_buffer.speech_started' }))
  await page.click('[data-testid="lab-call-mute"]')
  await waitStatus(page, '[data-testid="lab-call-status"]', 'Microphone off')
  await page.waitForTimeout(300)
  await shot('5-muted')
  await page.click('[data-testid="lab-call-mute"]')

  await page.evaluate(() => window.__voiceStub.drop())
  await waitStatus(page, '[data-testid="lab-call-status"]', 'Disconnected')
  await page.waitForTimeout(300)
  await shot('6-disconnected')

  const typography = await page.evaluate(() => {
    const nodes = Array.from(document.querySelectorAll('[data-testid="lab-call"] *'))
    const mono = nodes.filter(node => /mono/i.test(getComputedStyle(node).fontFamily)).length
    const upper = nodes.filter(node => getComputedStyle(node).textTransform === 'uppercase').length
    return { mono, upper }
  })
  note(`phone ${theme}: no monospace, no uppercase on the surface`, typography.mono === 0 && typography.upper === 0, JSON.stringify(typography))
  await context.close()
}

async function phoneReducedMotion(browser) {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    colorScheme: 'light',
    reducedMotion: 'reduce',
    permissions: ['microphone'],
  })
  await context.addInitScript(STUB)
  const page = await context.newPage()
  await page.goto(`${BASE}/lab/phone?chrome=v2`, { waitUntil: 'domcontentloaded' })
  await page.waitForSelector('[data-testid="lab-root"][data-reader-ready="true"]')
  await page.click('[data-testid="lab-super"]')
  await page.click('[data-testid="lab-super-row-talk"]')
  await page.waitForSelector('[data-testid="lab-call"]')
  await connect(page, '[data-testid="lab-call-status"]')
  await page.waitForTimeout(400)
  const motion = await page.getAttribute('[data-testid="lab-call-circle"]', 'data-motion')
  note('phone reduced motion: one still frame', motion === 'still', `data-motion=${motion}`)
  const file = `${OUT}/phone-light-reduced-motion-listening.png`
  await page.screenshot({ path: file })
  results.shots.push(file)
  await context.close()
}

async function desktop(browser, theme) {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
    colorScheme: theme,
    permissions: ['microphone'],
  })
  await context.addInitScript(STUB)
  const page = await context.newPage()
  page.on('pageerror', error => console.error('[page error]', error.message))
  const shot = async (name) => {
    const file = `${OUT}/desktop-${theme}-${name}.png`
    await page.screenshot({ path: file })
    results.shots.push(file)
  }
  await page.goto(`${BASE}/lab/desktop?chrome=v2`, { waitUntil: 'domcontentloaded' })
  await page.waitForSelector('[data-testid="lab-root"][data-reader-ready="true"]')
  await page.waitForTimeout(900)
  await shot('0-reader')
  const plain = await placeOf(page)

  await page.click('[data-testid="lab-super"]')
  await page.click('[data-testid="lab-super-row-talk"]')
  await page.waitForSelector('[data-testid="lab-voice-panel"]')
  await page.waitForTimeout(400)
  await shot('1-panel-connecting')

  await connect(page, '[data-testid="lab-voice-panel-status"]')
  await page.waitForTimeout(400)
  await shot('1b-panel-listening')
  await speak(page, '[data-testid="lab-voice-panel-status"]')
  await page.waitForTimeout(700)
  const before = await placeOf(page)
  note(`desktop ${theme}: place unchanged when the panel opens`, before.chapter === plain.chapter && before.place === plain.place && before.firstWords === plain.firstWords, JSON.stringify({ plain, before }))
  note(`desktop ${theme}: passage tinted on the page`, before.discussed > 0, `${before.discussed} lines`)
  await shot('2-panel-speaking')

  await page.click('[data-testid="lab-voice-panel-minimize"]')
  await page.waitForSelector('[data-testid="lab-voice-pill"]')
  await page.waitForTimeout(500)
  const minimized = await placeOf(page)
  note(`desktop ${theme}: minimize keeps the place`, minimized.chapter === before.chapter && minimized.place === before.place && minimized.firstWords === before.firstWords, JSON.stringify({ before, minimized }))
  note(`desktop ${theme}: still tinted while minimized`, minimized.discussed > 0)
  const pillLine = await page.textContent('[data-testid="lab-voice-pill-line"]')
  note(`desktop ${theme}: pill carries one line of the utterance`, !!pillLine && pillLine.length > 0, pillLine)
  await shot('3-pill-speaking')

  await page.click('[data-testid="lab-voice-pill-expand"]')
  await page.waitForSelector('[data-testid="lab-voice-panel"]')
  await page.waitForTimeout(400)
  const restored = await placeOf(page)
  note(`desktop ${theme}: restore keeps the place`, restored.chapter === before.chapter && restored.place === before.place && restored.firstWords === before.firstWords, JSON.stringify({ before, restored }))
  await shot('4-panel-restored')

  // The other two ways back.
  await page.click('[data-testid="lab-voice-panel-minimize"]')
  await page.waitForSelector('[data-testid="lab-voice-pill"]')
  await page.click('[data-testid="lab-voice-pill-orb"]')
  await page.waitForSelector('[data-testid="lab-voice-panel"]')
  await page.click('[data-testid="lab-voice-panel-minimize"]')
  await page.waitForSelector('[data-testid="lab-voice-pill"]')
  await page.click('[data-testid="lab-voice-pill-transcript"]')
  await page.waitForSelector('[data-testid="lab-voice-panel"]')
  note(`desktop ${theme}: orb and Transcript restore the panel`, true)

  await finishSpeaking(page, '[data-testid="lab-voice-panel-status"]')
  await think(page, '[data-testid="lab-voice-panel-status"]')
  await page.waitForTimeout(400)
  await shot('5-panel-thinking')

  await page.click('[data-testid="lab-voice-panel-mute"]')
  await page.waitForFunction(() => document.querySelector('[data-testid="lab-voice-panel-mute"]').textContent === 'Unmute')
  await page.waitForTimeout(300)
  await shot('6-panel-muted')
  await page.click('[data-testid="lab-voice-panel-mute"]')

  await page.evaluate(() => window.__voiceStub.drop())
  await waitStatus(page, '[data-testid="lab-voice-panel-status"]', 'Disconnected')
  await page.waitForTimeout(300)
  await shot('7-panel-disconnected')

  const typography = await page.evaluate(() => {
    const nodes = Array.from(document.querySelectorAll('[data-testid="lab-voice-panel"] *'))
    const mono = nodes.filter(node => /mono/i.test(getComputedStyle(node).fontFamily)).length
    const upper = nodes.filter(node => getComputedStyle(node).textTransform === 'uppercase').length
    return { mono, upper }
  })
  note(`desktop ${theme}: no monospace, no uppercase in the panel`, typography.mono === 0 && typography.upper === 0, JSON.stringify(typography))

  await page.click('[data-testid="lab-voice-panel-end"]')
  await page.waitForFunction(() => !document.querySelector('[data-testid="lab-voice-panel"]'))
  await page.waitForTimeout(400)
  const after = await placeOf(page)
  note(`desktop ${theme}: End keeps the place and clears the tint`, after.chapter === plain.chapter && after.place === plain.place && after.firstWords === plain.firstWords && after.discussed === 0 && after.panel === 'none', JSON.stringify({ plain, after }))
  await shot('8-reader-after')
  await context.close()
}

async function main() {
  mkdirSync(OUT, { recursive: true })
  const browser = await chromium.launch({
    executablePath: EXECUTABLE,
    args: ['--ssl-version-max=tls1.2', '--no-sandbox', '--autoplay-policy=no-user-gesture-required'],
  })
  for (const theme of ['light', 'dark']) {
    console.log(`phone / ${theme}`)
    await phone(browser, theme)
    console.log(`desktop / ${theme}`)
    await desktop(browser, theme)
  }
  await phoneReducedMotion(browser)
  await browser.close()
  writeFileSync(`${OUT}/results.json`, JSON.stringify(results, null, 2))
  const failed = results.checks.filter(check => !check.ok)
  console.log(results.shots.join('\n'))
  console.log(`${results.checks.length - failed.length}/${results.checks.length} checks passed`)
  if (failed.length) process.exit(1)
}

main().catch(error => {
  console.error(error)
  process.exit(1)
})
