/**
 * Screenshots of the phone call surface, with the voice layer stubbed.
 *
 * Nothing here reaches a real Realtime session: getUserMedia hands back a
 * silent local stream made in the page, the session-token and SDP fetches are
 * answered locally, and RTCPeerConnection is a stub whose data channel, track
 * and connection state this script drives. The assistant's "voice" is an
 * oscillator, so the speaking circle is following genuine audio through the
 * same analyser the real call uses.
 *
 * Usage: node scripts/voice-call-shots.cjs <baseUrl> <outDir>
 */

const { chromium } = require('playwright')
const { mkdirSync } = require('node:fs')

const BASE = process.argv[2] || 'http://127.0.0.1:3011'
const OUT = process.argv[3] || '/home/user/tinct-wt/voice-ui-evidence'
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

async function main() {
  mkdirSync(OUT, { recursive: true })
  const browser = await chromium.launch({
    executablePath: EXECUTABLE,
    args: ['--ssl-version-max=tls1.2', '--no-sandbox', '--autoplay-policy=no-user-gesture-required'],
  })

  const shots = []
  for (const theme of ['light', 'dark']) {
    for (const motion of ['no-preference', 'reduce']) {
      // Reduced motion is only worth a second pass on the moving states.
      const context = await browser.newContext({
        viewport: { width: 390, height: 844 },
        deviceScaleFactor: 2,
        colorScheme: theme,
        reducedMotion: motion,
        permissions: ['microphone'],
      })
      await context.addInitScript(STUB)
      const page = await context.newPage()
      page.on('pageerror', error => console.error('[page error]', error.message))

      const shot = async (name) => {
        const file = `${OUT}/call-${theme}-${motion === 'reduce' ? 'reduced-' : ''}${name}.png`
        await page.screenshot({ path: file })
        shots.push(file)
      }

      await page.goto(`${BASE}/lab/phone?chrome=v2`, { waitUntil: 'domcontentloaded' })
      await page.waitForSelector('[data-testid="lab-root"]')
      await page.waitForTimeout(1200)

      await page.click('[data-testid="lab-super"]')
      await page.click('[data-testid="lab-super-row-talk"]')
      await page.waitForSelector('[data-testid="lab-call"]')
      await page.waitForTimeout(400)
      await shot('1-connecting')

      // The transport comes up: the surface may now say Listening.
      await page.waitForFunction(() => !!window.__voiceStub.dc, null, { timeout: 5000 })
      await page.evaluate(() => window.__voiceStub.openDataChannel())
      await page.evaluate(() => window.__voiceStub.attachAssistantTrack())
      await page.waitForFunction(
        () => document.querySelector('[data-testid="lab-call-status"]').textContent === 'Listening.',
        null,
        { timeout: 5000 },
      )
      await page.waitForTimeout(400)
      await shot('2-listening')

      // The assistant answers, out loud.
      await page.evaluate(() => window.__voiceStub.assistantLoud(true))
      await page.evaluate(() => window.__voiceStub.realtime({ type: 'output_audio_buffer.started' }))
      await page.waitForFunction(
        () => document.querySelector('[data-testid="lab-call-status"]').textContent === 'Speaking.',
        null,
        { timeout: 5000 },
      )
      await page.waitForTimeout(700)
      const level = await page.evaluate(() => ({
        source: document.querySelector('[data-testid="lab-call-circle"]').dataset.levelSource,
        level: document.querySelector('[data-testid="lab-call-circle"]').style.getPropertyValue('--lab-call-level'),
      }))
      console.log(`  [${theme}/${motion}] speaking circle level source=${level.source} level=${level.level || '(none)'}`)
      await shot('3-speaking')

      // She stops; the answer is still being put together.
      await page.evaluate(() => window.__voiceStub.assistantLoud(false))
      await page.evaluate(() => window.__voiceStub.realtime({ type: 'output_audio_buffer.stopped' }))
      await page.waitForFunction(
        () => document.querySelector('[data-testid="lab-call-status"]').textContent === 'Thinking.',
        null,
        { timeout: 5000 },
      )
      await page.waitForTimeout(400)
      await shot('4-thinking')

      // The reader closes the microphone. The line stays up.
      await page.evaluate(() => window.__voiceStub.realtime({ type: 'input_audio_buffer.speech_started' }))
      await page.click('[data-testid="lab-call-mute"]')
      await page.waitForFunction(
        () => document.querySelector('[data-testid="lab-call-status"]').textContent === 'Microphone off',
        null,
        { timeout: 5000 },
      )
      await shot('5-muted')
      await page.click('[data-testid="lab-call-mute"]')

      // The transcript, with the call still running.
      await page.click('[data-testid="lab-call-transcript"]')
      await page.waitForSelector('[data-testid="lab-call-bar"]')
      await page.waitForTimeout(400)
      await shot('6-transcript')
      await page.click('[data-testid="lab-call-bar-return"]')
      await page.waitForSelector('[data-testid="lab-call"]')

      // The line drops under the call.
      await page.evaluate(() => window.__voiceStub.drop())
      await page.waitForFunction(
        () => document.querySelector('[data-testid="lab-call-status"]').textContent === 'Disconnected',
        null,
        { timeout: 5000 },
      )
      await page.waitForTimeout(400)
      await shot('7-disconnected')

      await context.close()
    }
  }

  await browser.close()
  console.log(shots.join('\n'))
}

main().catch(error => {
  console.error(error)
  process.exit(1)
})
