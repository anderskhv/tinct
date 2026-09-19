/**
 * Real-provider Talk smoke test in an isolated headless browser.
 *
 *   node scripts/grok-voice-smoke.mjs <base-url> <question.wav> [resume.wav] [artifact-dir]
 *
 * The browser's microphone is Chromium's fake capture device playing the given
 * WAV (a synthetic spoken question, 24 kHz mono PCM16, followed by silence,
 * looped by Chromium). Audio output is muted. No real microphone is opened and
 * nothing is audible. The page is the Chrome V2 phone reader at /lab/phone.
 *
 * It verifies: connection, a substantive spoken answer (audio bytes, not
 * transcript), an interruption when the looped question starts again mid
 * answer, ending the call, and microphone track cleanup. With a second WAV it
 * verifies that a spoken "take me back to the audiobook" runs the resume tool.
 *
 * Latency is measured from the provider's speech-end signal to the first audio
 * delta received by the page (window.__tinctVoiceDebug), reported separately
 * from transcript timing. Each run opens two short sessions; keep runs rare.
 */
import { chromium } from '@playwright/test'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

const [base = 'http://127.0.0.1:8787', questionWav, resumeWav, artifactDir = 'artifacts/grok-voice-smoke'] = process.argv.slice(2)
if (!questionWav) throw new Error('Provide the question WAV')
await mkdir(artifactDir, { recursive: true })
const report = { base, sessions: [] }
const fail = message => { throw new Error(message) }

async function launch(wav) {
  const browser = await chromium.launch({
    headless: true,
    // A sandbox whose egress proxy cannot relay a WebSocket upgrade: keep the proxy for everything except the named hosts.
    ...(process.env.TINCT_PROXY_BYPASS ? { env: { ...process.env, NO_PROXY: [process.env.NO_PROXY, process.env.TINCT_PROXY_BYPASS].filter(Boolean).join(','), no_proxy: [process.env.no_proxy ?? process.env.NO_PROXY, process.env.TINCT_PROXY_BYPASS].filter(Boolean).join(',') } } : {}),
    // A preinstalled Chromium (CI / cloud) may be pinned to another Playwright build.
    ...(process.env.TINCT_CHROMIUM ? { executablePath: process.env.TINCT_CHROMIUM } : {}),
    args: [
      // A sandbox egress proxy re-terminates TLS; trust only that CA's key, never everything.
      ...(process.env.TINCT_CHROMIUM_SPKI ? [`--ignore-certificate-errors-spki-list=${process.env.TINCT_CHROMIUM_SPKI}`] : []),
      // Extra Chromium flags for a sandbox (for example --disable-http2 behind an HTTP/2 proxy that cannot carry a WebSocket upgrade).
      ...(process.env.TINCT_CHROMIUM_ARGS ? process.env.TINCT_CHROMIUM_ARGS.split(/\s+/).filter(Boolean) : []),
      '--use-fake-device-for-media-stream',
      '--use-fake-ui-for-media-stream',
      `--use-file-for-fake-audio-capture=${path.resolve(wav)}`,
      '--mute-audio',
      '--autoplay-policy=no-user-gesture-required',
    ],
  })
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, permissions: ['microphone'] })
  await context.addInitScript(() => {
    // Observe microphone tracks and provider audio without changing behaviour.
    const streams = []
    const original = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices)
    navigator.mediaDevices.getUserMedia = async constraints => { const stream = await original(constraints); streams.push(stream); return stream }
    window.__tinctSmoke = {
      micTracks: () => streams.flatMap(stream => stream.getTracks().map(track => track.readyState)),
      audio: [],
      events: [],
    }
    const NativeSocket = window.WebSocket
    window.WebSocket = class extends NativeSocket {
      constructor(url, protocols) {
        super(url, protocols)
        this.addEventListener('message', event => {
          try {
            const data = JSON.parse(String(event.data))
            const at = performance.now()
            if (data.type === 'response.output_audio.delta') window.__tinctSmoke.audio.push({ at, bytes: Math.floor(String(data.delta).length * 3 / 4) })
            else if (!['ping', 'response.output_audio_transcript.delta'].includes(data.type)) window.__tinctSmoke.events.push({ at, type: data.type, status: data.response?.status, name: data.name, transcript: data.transcript })
          } catch { /* not JSON */ }
        })
      }
    }
  })
  const page = await context.newPage()
  page.on('console', message => { if (message.type() === 'error') report.consoleErrors = [...(report.consoleErrors || []), message.text()] })
  return { browser, page }
}

async function openTalk(page) {
  await page.goto(`${base}/lab/phone?chrome=v2`, { waitUntil: 'networkidle' })
  await page.getByTestId('lab-super').click()
  await page.getByTestId('lab-super-row-talk').click()
  await page.getByTestId('lab-call').waitFor({ timeout: 15000 })
  await page.waitForFunction(() => document.querySelector('[data-testid="lab-call"]')?.getAttribute('data-connection') === 'connected', null, { timeout: 30000 })
}

const readSmoke = page => page.evaluate(() => ({
  audio: window.__tinctSmoke.audio,
  events: window.__tinctSmoke.events,
  micTracks: window.__tinctSmoke.micTracks(),
  debug: window.__tinctVoiceDebug ?? null,
  talk: (window.__tinctLabTalk ?? []).filter(turn => turn.source === 'voice').map(turn => ({ role: turn.role, content: turn.content, cancelled: turn.cancelled })),
  status: document.querySelector('[data-testid="lab-call-status"]')?.textContent ?? null,
  listening: document.querySelector('[data-testid="lab-listen-status"]')?.getAttribute('data-playing') ?? null,
}))

// ----- Session 1: question, substantive answer, interruption, end, mic cleanup -----
{
  const { browser, page } = await launch(questionWav)
  const session = { name: 'question-interrupt-end' }
  try {
    const started = Date.now()
    await openTalk(page)
    session.connectMs = Date.now() - started
    // A substantive answer: at least three seconds of provider audio bytes (24 kHz PCM16 = 48 000 bytes/s).
    await page.waitForFunction(() => window.__tinctSmoke.audio.reduce((sum, chunk) => sum + chunk.bytes, 0) > 48000 * 3, null, { timeout: 45000 })
    // The looped WAV asks again while the answer is still playing; the server reports speech_started.
    await page.waitForFunction(() => {
      const events = window.__tinctSmoke.events
      const firstDone = events.find(event => event.type === 'response.done')
      return events.filter(event => event.type === 'input_audio_buffer.speech_started').length >= 2 && firstDone
    }, null, { timeout: 60000 })
    await page.waitForFunction(() => window.__tinctSmoke.events.filter(event => event.type === 'response.done').length >= 2, null, { timeout: 60000 })
    await page.screenshot({ path: path.join(artifactDir, 'call.png') })
    const before = await readSmoke(page)
    await page.getByTestId('lab-call-end').click()
    await page.waitForFunction(() => !document.querySelector('[data-testid="lab-call"]'), null, { timeout: 10000 })
    await page.waitForTimeout(500)
    const after = await readSmoke(page)

    const stops = before.events.filter(event => event.type === 'input_audio_buffer.speech_stopped')
    const firstAudioAfter = at => before.audio.find(chunk => chunk.at > at)?.at
    const audioLatencies = stops.map(stop => { const first = firstAudioAfter(stop.at); return first ? Math.round(first - stop.at) : null }).filter(Boolean)
    const transcriptLatencies = stops.map(stop => { const first = before.events.find(event => event.at > stop.at && event.type === 'conversation.item.added'); return first ? Math.round(first.at - stop.at) : null }).filter(Boolean)
    const totalAudioSeconds = before.audio.reduce((sum, chunk) => sum + chunk.bytes, 0) / 48000
    const responses = before.events.filter(event => event.type === 'response.done').map(event => event.status)
    const cancelled = before.events.some(event => event.type === 'response.done' && event.status === 'cancelled')
      || before.talk.some(turn => turn.role === 'assistant' && turn.cancelled)
    Object.assign(session, {
      userTranscripts: before.events.filter(event => event.type === 'conversation.item.input_audio_transcription.completed').map(event => event.transcript),
      assistantTurns: before.talk.filter(turn => turn.role === 'assistant').map(turn => ({ cancelled: Boolean(turn.cancelled), words: turn.content.split(/\s+/).length, text: turn.content.slice(0, 240) })),
      responses,
      interruptionObserved: cancelled,
      speechStoppedToFirstAudioMs: audioLatencies,
      speechStoppedToUserTranscriptMs: transcriptLatencies,
      pageMeasuredTurnSamples: before.debug?.samples?.filter(sample => sample.kind === 'turn').map(sample => sample.speechStoppedToFirstAudioMs) ?? [],
      providerAudioSeconds: Number(totalAudioSeconds.toFixed(2)),
      statusBeforeEnd: before.status,
      micTracksAfterEnd: after.micTracks,
      callClosed: true,
    })
    if (!session.userTranscripts.length) fail('No user transcript arrived')
    if (!session.assistantTurns.some(turn => turn.words >= 12 && !/^(hmm|uh|okay|sure|let me)/i.test(turn.text))) fail('No substantive assistant answer')
    if (totalAudioSeconds < 3) fail('Too little provider audio')
    if (!cancelled) fail('Interruption was not observed')
    if (!after.micTracks.length || after.micTracks.some(state => state !== 'ended')) fail(`Microphone not released: ${JSON.stringify(after.micTracks)}`)
    session.passed = true
  } catch (error) {
    session.passed = false
    session.error = error.message
    await page.screenshot({ path: path.join(artifactDir, 'failure-1.png') }).catch(() => {})
    session.dump = await readSmoke(page).catch(() => null)
  } finally {
    report.sessions.push(session)
    await browser.close()
  }
}

// ----- Session 2: a spoken resume request runs the audiobook tool -----
if (resumeWav) {
  const { browser, page } = await launch(resumeWav)
  const session = { name: 'spoken-resume-audiobook' }
  try {
    await openTalk(page)
    await page.waitForFunction(() => !document.querySelector('[data-testid="lab-call"]'), null, { timeout: 60000 })
    await page.waitForTimeout(800)
    const after = await readSmoke(page)
    Object.assign(session, {
      userTranscripts: after.events.filter(event => event.type === 'conversation.item.input_audio_transcription.completed').map(event => event.transcript),
      toolCalls: after.events.filter(event => event.type === 'response.function_call_arguments.done').map(event => event.name),
      listeningAfter: after.listening,
      micTracksAfterEnd: after.micTracks,
    })
    if (!session.toolCalls.includes('resume_audiobook')) fail('resume_audiobook was not called')
    if (after.micTracks.some(state => state !== 'ended')) fail('Microphone not released after resume')
    session.passed = true
  } catch (error) {
    session.passed = false
    session.error = error.message
    await page.screenshot({ path: path.join(artifactDir, 'failure-2.png') }).catch(() => {})
    session.dump = await readSmoke(page).catch(() => null)
  } finally {
    report.sessions.push(session)
    await browser.close()
  }
}

await writeFile(path.join(artifactDir, 'report.json'), JSON.stringify(report, null, 2))
console.log(JSON.stringify(report, null, 2))
if (report.sessions.some(session => !session.passed)) process.exit(1)
