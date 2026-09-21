import { chromium } from '@playwright/test'
import fs from 'node:fs/promises'
import path from 'node:path'
import assert from 'node:assert/strict'

const origin = 'https://tinct.app'
const persona = process.env.VOICE_PERSONA === 'male' ? 'male' : 'female'
const expectedVoice = persona === 'male' ? 'helios' : 'ursa'
const output = `artifacts/voice-capture/${persona}`
await fs.mkdir(output, { recursive: true })

const browser = await chromium.launch({ headless: true, args: [
  '--mute-audio', '--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream',
  '--use-file-for-fake-audio-capture=' + path.resolve(process.argv[2]),
] })
const context = await browser.newContext({ viewport: { width: 390, height: 844 }, permissions: ['microphone'], serviceWorkers: 'block' })
const page = await context.newPage()
page.setDefaultTimeout(10_000)
const report = { persona, expectedVoice, requestedVoice: null, sessionUpdated: false, errors: [] }
page.on('pageerror', error => report.errors.push(error.message))

await page.addInitScript(({ persona }) => {
  localStorage.setItem('tinct-lab-prefs', JSON.stringify({ voicePersona: persona }))
  sessionStorage.setItem('tinct:lab-reader-handoff', JSON.stringify({
    kind: 'open-reader', bookId: 'notes-from-underground', primaryEditionKey: 'original-en',
    savedPlace: { bookId: 'notes-from-underground', chapterNumber: 1, paragraphIndex: 0, wordIndex: 0, page: 0 },
  }))
  window.__voiceHandshake = { requestedVoice: null, sessionUpdated: false }
  const Native = WebSocket
  window.WebSocket = class extends Native {
    constructor(url, protocols) {
      super(url, protocols)
      this.addEventListener('message', event => {
        try {
          if (JSON.parse(event.data).type === 'session.updated') window.__voiceHandshake.sessionUpdated = true
        } catch {}
      })
    }
    send(data) {
      try {
        const event = JSON.parse(data)
        if (event.type === 'session.update') window.__voiceHandshake.requestedVoice = event.session?.voice || null
      } catch {}
      return super.send(data)
    }
  }
}, { persona })

try {
  await page.goto(origin + '/lab/phone?chrome=v2', { waitUntil: 'domcontentloaded' })
  await page.waitForFunction(() => document.querySelector('[data-testid="lab-root"]')?.dataset.readerReady === 'true', null, { timeout: 45_000 })
  await page.getByTestId('lab-super').click()
  await page.getByTestId('lab-super-row-talk').click()
  await page.waitForFunction(expected => {
    const evidence = window.__voiceHandshake
    return evidence?.requestedVoice === expected && evidence.sessionUpdated === true
  }, expectedVoice, { timeout: 30_000 })
  Object.assign(report, await page.evaluate(() => window.__voiceHandshake))
  assert.equal(report.requestedVoice, expectedVoice)
  assert.equal(report.sessionUpdated, true)
  assert.deepEqual(report.errors, [])
  report.passed = true
} catch (error) {
  report.passed = false
  report.error = error.stack
  await page.screenshot({ path: output + '/failure.png' }).catch(() => {})
} finally {
  await fs.writeFile(output + '/handshake.json', JSON.stringify(report, null, 2))
  console.log(JSON.stringify(report))
  await browser.close()
}

if (!report.passed) process.exit(1)
