import { chromium } from '@playwright/test'
import fs from 'node:fs/promises'
import path from 'node:path'
import assert from 'node:assert/strict'
import { markInternal } from './lib/internalTraffic.cjs'

/*
 * One short real Talk call per run (since 16 Oct 2026 Talk runs signed out as
 * the guest trial, and checks share a small daily pool of trials; see
 * worker/lib/talkTrial.ts). With VOICE_PERSONA unset, the run checks both
 * voices on that one call:
 *  - the deployed app requests `helios` for the male persona, against a
 *    stand-in session (no provider call);
 *  - the real call: the app requests `ara` for the female persona and xAI
 *    acknowledges it (and, with VERIFY_FORCE_MESSAGE=1, speaks a forced line);
 *    then the same session is switched to `helios` and xAI acknowledges that.
 * VOICE_PERSONA=female|male checks that one persona on its own real call.
 */
const origin = process.env.TINCT_ORIGIN || 'https://tinct.app'
const onlyPersona = process.env.VOICE_PERSONA === 'male' || process.env.VOICE_PERSONA === 'female' ? process.env.VOICE_PERSONA : null
const persona = onlyPersona ?? 'female'
const expectedVoice = persona === 'male' ? 'helios' : 'ara'
const switchVoice = onlyPersona ? null : 'helios'
const verifyForceMessage = process.env.VERIFY_FORCE_MESSAGE === '1'
const output = `artifacts/voice-capture/${onlyPersona ?? 'both'}`
await fs.mkdir(output, { recursive: true })

const browser = await markInternal(await chromium.launch({ headless: true, args: [
  '--mute-audio', '--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream',
  '--use-file-for-fake-audio-capture=' + path.resolve(process.argv[2]),
] }))
const context = await browser.newContext({ viewport: { width: 390, height: 844 }, permissions: ['microphone'], serviceWorkers: 'block' })
const page = await context.newPage()
page.setDefaultTimeout(10_000)
const report = { persona, expectedVoice, requestedVoice: null, sessionUpdated: false, acknowledgedVoice: null, acknowledgedRequestVoice: null, verifyForceMessage, forceMessage: null, appMaleVoice: null, switchedVoice: null, errors: [] }
page.on('pageerror', error => report.errors.push(error.message))

const handoff = JSON.stringify({
  kind: 'open-reader', bookId: 'notes-from-underground', primaryEditionKey: 'original-en',
  savedPlace: { bookId: 'notes-from-underground', chapterNumber: 1, paragraphIndex: 0, wordIndex: 0, page: 0 },
})

/**
 * The deployed app's voice for the male persona, read from its session.update
 * against a stand-in session: the guest route answers with a fake ticket and
 * the relay socket is a local fake, so no provider session is opened.
 */
async function appVoiceWithoutProvider(forPersona) {
  const standIn = await browser.newContext({ viewport: { width: 390, height: 844 }, permissions: ['microphone'], serviceWorkers: 'block' })
  const standInPage = await standIn.newPage()
  standInPage.setDefaultTimeout(10_000)
  standInPage.on('pageerror', error => report.errors.push(`stand-in: ${error.message}`))
  await standInPage.route('**/api/lab-voice-session', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ value: 'stand-in.ticket', expires_at: 1, model: 'grok-voice-latest', relay: '/api/lab-voice-relay', max_seconds: 120 }) }))
  await standInPage.addInitScript(({ forPersona, handoff }) => {
    localStorage.setItem('tinct-lab-prefs', JSON.stringify({ voicePersona: forPersona, voicePersonaChosen: true }))
    sessionStorage.setItem('tinct:lab-reader-handoff', handoff)
    window.__standInVoice = null
    window.WebSocket = class extends EventTarget {
      constructor(url) {
        super()
        if (!String(url).includes('/api/lab-voice-relay')) throw new Error('stand-in: unexpected socket ' + url)
        this.readyState = 1
        setTimeout(() => this.dispatchEvent(Object.assign(new Event('message'), { data: JSON.stringify({ type: 'session.created' }) })), 0)
      }
      send(data) {
        try { const event = JSON.parse(data); if (event.type === 'session.update' && window.__standInVoice === null) window.__standInVoice = event.session?.voice || '' } catch {}
      }
      close() { this.readyState = 3 }
    }
  }, { forPersona, handoff })
  try {
    await standInPage.goto(origin + '/reader?layout=phone&margin=0', { waitUntil: 'domcontentloaded' })
    await standInPage.waitForFunction(() => document.querySelector('[data-testid="lab-root"]')?.dataset.readerReady === 'true', null, { timeout: 45_000 })
    await standInPage.getByTestId('lab-super').click()
    await standInPage.getByTestId('lab-super-row-talk').click()
    await standInPage.waitForFunction(() => window.__standInVoice !== null, null, { timeout: 30_000 })
    return await standInPage.evaluate(() => window.__standInVoice)
  } finally {
    await standIn.close()
  }
}

await page.addInitScript(({ persona, handoff }) => {
  localStorage.setItem('tinct-lab-prefs', JSON.stringify({ voicePersona: persona, voicePersonaChosen: true }))
  sessionStorage.setItem('tinct:lab-reader-handoff', handoff)
  window.__voiceHandshake = { requestedVoice: null, sessionUpdated: false, acknowledgedVoice: null, acknowledgedRequestVoice: null, pendingUpdates: [], socket: null, forcePending: false, forceAudioBytes: 0, forceTranscript: '', forceDone: false, sessionEvidence: [], providerErrors: [] }
  const Native = WebSocket
  window.WebSocket = class extends Native {
    constructor(url, protocols) {
      super(url, protocols)
      window.__voiceHandshake.socket = this
      this.addEventListener('message', event => {
        try {
          const message = JSON.parse(event.data)
          if (message.type === 'session.updated') {
            window.__voiceHandshake.sessionUpdated = true
            window.__voiceHandshake.acknowledgedRequestVoice = window.__voiceHandshake.pendingUpdates.shift() || null
            window.__voiceHandshake.acknowledgedVoice = message.session?.voice || null
            window.__voiceHandshake.sessionEvidence.push({ keys: Object.keys(message), sessionKeys: Object.keys(message.session || {}), audioKeys: Object.keys(message.session?.audio || {}), outputKeys: Object.keys(message.session?.audio?.output || {}), voice: message.session?.voice || null, outputVoice: message.session?.audio?.output?.voice || null, topVoice: message.voice || null })
          }
          if (message.type === 'error') window.__voiceHandshake.providerErrors.push({ code: message.error?.code, message: message.error?.message })
          if (window.__voiceHandshake.forcePending && (message.type === 'response.output_audio.delta' || message.type === 'response.audio.delta')) window.__voiceHandshake.forceAudioBytes += Math.floor(String(message.delta || '').length * 3 / 4)
          if (window.__voiceHandshake.forcePending && (message.type === 'response.output_audio_transcript.delta' || message.type === 'response.audio_transcript.delta')) window.__voiceHandshake.forceTranscript += message.delta || ''
          if (window.__voiceHandshake.forcePending && message.type === 'response.done') { window.__voiceHandshake.forceDone = true; window.__voiceHandshake.forcePending = false }
        } catch {}
      })
    }
    send(data) {
      try {
        const event = JSON.parse(data)
        if (event.type === 'session.update') {
          window.__voiceHandshake.requestedVoice = event.session?.voice || null
          window.__voiceHandshake.pendingUpdates.push(event.session?.voice || null)
        }
      } catch {}
      return super.send(data)
    }
  }
}, { persona, handoff })

try {
  if (switchVoice) {
    report.appMaleVoice = await appVoiceWithoutProvider('male')
    assert.equal(report.appMaleVoice, 'helios')
  }
  await page.goto(origin + '/reader?layout=phone&margin=0', { waitUntil: 'domcontentloaded' })
  await page.waitForFunction(() => document.querySelector('[data-testid="lab-root"]')?.dataset.readerReady === 'true', null, { timeout: 45_000 })
  await page.getByTestId('lab-super').click()
  await page.getByTestId('lab-super-row-talk').click()
  if (verifyForceMessage) await page.getByTestId('lab-call-mute').click()
  await page.waitForFunction(expected => {
    const evidence = window.__voiceHandshake
    return evidence?.requestedVoice === expected && evidence.sessionUpdated === true && evidence.acknowledgedRequestVoice === expected
  }, expectedVoice, { timeout: 30_000 })
  Object.assign(report, await page.evaluate(() => ({ requestedVoice: window.__voiceHandshake.requestedVoice, sessionUpdated: window.__voiceHandshake.sessionUpdated, acknowledgedVoice: window.__voiceHandshake.acknowledgedVoice, acknowledgedRequestVoice: window.__voiceHandshake.acknowledgedRequestVoice, sessionEvidence: window.__voiceHandshake.sessionEvidence, providerErrors: window.__voiceHandshake.providerErrors })))
  assert.equal(report.requestedVoice, expectedVoice)
  assert.equal(report.sessionUpdated, true)
  assert.equal(report.acknowledgedRequestVoice, expectedVoice)
  // xAI acknowledges the update but currently omits voice from its response.
  // Require an exact match whenever it does echo a voice; never invent an echo.
  if (report.acknowledgedVoice !== null) assert.equal(report.acknowledgedVoice, expectedVoice)
  assert.deepEqual(report.providerErrors, [])
  if (verifyForceMessage) {
    await page.evaluate(line => {
      const evidence = window.__voiceHandshake
      evidence.forcePending = true
      evidence.socket.send(JSON.stringify({ type: 'conversation.item.create', item: {
        type: 'force_message', role: 'assistant', interruptible: true,
        content: [{ type: 'output_text', text: line }],
      } }))
    }, 'One moment.')
    await page.waitForFunction(() => window.__voiceHandshake.forceDone && window.__voiceHandshake.forceAudioBytes > 0, null, { timeout: 20_000 })
    report.forceMessage = await page.evaluate(() => ({
      audioBytes: window.__voiceHandshake.forceAudioBytes,
      transcript: window.__voiceHandshake.forceTranscript,
      done: window.__voiceHandshake.forceDone,
    }))
    assert.equal(report.forceMessage.done, true)
    assert.ok(report.forceMessage.audioBytes > 0)
    assert.match(report.forceMessage.transcript, /one moment/i)
  }
  if (switchVoice) {
    // The other voice on the same session: xAI must acknowledge it too.
    await page.evaluate(voice => {
      const evidence = window.__voiceHandshake
      evidence.socket.send(JSON.stringify({ type: 'session.update', session: { voice } }))
    }, switchVoice)
    await page.waitForFunction(voice => window.__voiceHandshake.acknowledgedRequestVoice === voice, switchVoice, { timeout: 20_000 })
    report.switchedVoice = await page.evaluate(() => ({ acknowledgedRequestVoice: window.__voiceHandshake.acknowledgedRequestVoice, acknowledgedVoice: window.__voiceHandshake.acknowledgedVoice, providerErrors: window.__voiceHandshake.providerErrors }))
    assert.equal(report.switchedVoice.acknowledgedRequestVoice, switchVoice)
    if (report.switchedVoice.acknowledgedVoice !== null) assert.equal(report.switchedVoice.acknowledgedVoice, switchVoice)
    assert.deepEqual(report.switchedVoice.providerErrors, [])
  }
  assert.deepEqual(report.errors, [])
  report.passed = true
} catch (error) {
  Object.assign(report, await page.evaluate(() => ({
    requestedVoice: window.__voiceHandshake?.requestedVoice,
    sessionUpdated: window.__voiceHandshake?.sessionUpdated,
    acknowledgedVoice: window.__voiceHandshake?.acknowledgedVoice,
    acknowledgedRequestVoice: window.__voiceHandshake?.acknowledgedRequestVoice,
    sessionEvidence: window.__voiceHandshake?.sessionEvidence,
    providerErrors: window.__voiceHandshake?.providerErrors,
  })).catch(() => ({})))
  report.passed = false
  report.error = error.stack
  await page.screenshot({ path: output + '/failure.png' }).catch(() => {})
} finally {
  await fs.writeFile(output + '/handshake.json', JSON.stringify(report, null, 2))
  console.log(JSON.stringify(report))
  await browser.close()
}

if (!report.passed) process.exit(1)
