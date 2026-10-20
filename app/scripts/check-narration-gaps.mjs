// Narration gap harness: how long the reader hears nothing between two clips.
//
// Serves the built reader (dist/) and a mock narration API from one local
// server, shapes /api/ traffic to a network profile (latency + shared
// bandwidth), plays Frankenstein's opening in a real browser and logs every
// clip boundary: the time from `ended` of clip n to `playing` of clip n+1,
// how many later clips were already downloaded at that moment, and when each
// audio fetch started and finished.
//
// No real narration is requested: /api/narration/ensure is answered locally
// from the chapter text in dist/, and every clip is a synthetic 128 kbps
// mono MP3 (ffmpeg) of the length the real voice would take, so byte sizes
// match production's xAI recordings.
//
// Usage (after `SKIP_ENV_CHECK=1 npm run build`):
//   node scripts/check-narration-gaps.mjs                 # full matrix, asserts
//   node scripts/check-narration-gaps.mjs --profiles 4g --visibility hidden --seconds 60
//   node scripts/check-narration-gaps.mjs --no-assert --label before --dist artifacts/dist-before
//   options: --engines chromium,webkit  --sw allow  --viewport desktop  --generate-ms 4000 (cold synthesis)
// Thresholds (fast and 4G): p95 <= 150 ms and no gap over 300 ms.
// 3G is reported, never asserted. WebKit is in the default matrix because it
// is where the gaps were: its media element re-requested every clip over the
// network at the boundary, ignoring the HTTP-cache warm-up (2026-10-20:
// p50 539 ms on 4G, 2.8 s on 3G). `--generate-ms` (cold synthesis) is a
// diagnostic: the first short paragraphs of a cold chapter still wait on the
// Worker, one group at a time at 1x, and it is not asserted.
import { chromium, webkit } from '@playwright/test'
import http from 'node:http'
import fs from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { build } from 'esbuild'
import { markInternal } from './lib/internalTraffic.cjs'

const args = process.argv.slice(2)
const option = (name, fallback) => {
  const index = args.indexOf('--' + name)
  return index >= 0 && args[index + 1] && !args[index + 1].startsWith('--') ? args[index + 1] : fallback
}
const flag = name => args.includes('--' + name)

export const PROFILES = {
  fast: { label: 'fast', rttMs: 10, mbps: 100 },
  '4g': { label: '4G (9 Mbps, 85 ms)', rttMs: 85, mbps: 9 },
  '3g': { label: '3G (1.5 Mbps, 300 ms)', rttMs: 300, mbps: 1.5 },
}
const profileNames = option('profiles', 'fast,4g,3g').split(',').filter(Boolean)
const visibilities = option('visibility', 'visible,hidden').split(',').filter(Boolean)
const engines = option('engines', 'chromium,webkit').split(',').filter(Boolean)
const runSeconds = Number(option('seconds', '45'))
const label = option('label', 'run')
const assertGaps = !flag('no-assert')
const serviceWorkers = option('sw', 'block')
const viewport = option('viewport', 'phone')
/** Server time for an ensure answer on a cache hit, and for a group that has to be generated. */
const ensureCachedMs = Number(option('ensure-ms', '120'))
const generateMs = Number(option('generate-ms', '0'))
/** Playback speed (prefs audioSpeed). */
const speed = Number(option('rate', '1'))
/** Paragraph Play starts at (the first clip is then streamed by the element itself). */
const startParagraph = Number(option('start-paragraph', '0'))
/** The saved page that holds it (the reader opens at the saved page; Play starts at its first word). */
const startPage = Number(option('start-page', '0'))
/**
 * Network outage: `--outage-at` seconds after the first sound, every audio
 * connection in flight goes dead (no more bytes, ever) and every new one
 * hangs, for `--outage-ms`; afterwards new requests are served normally.
 */
const outageAtSeconds = Number(option('outage-at', '0'))
/**
 * `--long-opening 20`: the chapter's first clip lasts this long (its words
 * stay short). The element streams that clip itself, so an outage early in it
 * cuts the element's own download mid-recording: the stall the iPhone hit.
 */
const longOpening = Number(option('long-opening', '0'))
/**
 * `--ios-background`: while the page is hidden, behave like a locked iPhone:
 * timers do not fire (their callbacks wait for the page to show again), and
 * an element the page paused itself refuses play() without a gesture.
 */
const iosBackground = flag('ios-background')
/** `--clip-seconds 4`: every sentence group lasts this long (short dialogue paragraphs, as in To the Lighthouse). */
const clipSeconds = Number(option('clip-seconds', '0'))
const outageMs = Number(option('outage-ms', '0'))
const BOOK = 'frankenstein'
const EDITION = 'original-en'
const CHARS_PER_SECOND = 15.5
const BITRATE_KBPS = 128

const root = process.cwd()
const dist = path.resolve(root, option('dist', 'dist'))
const output = path.join(root, 'artifacts', 'narration-gaps')
const fixtures = path.join(output, 'fixtures')
await fs.mkdir(fixtures, { recursive: true })
if (!existsSync(path.join(dist, 'app.html'))) {
  console.error('dist/app.html missing: run `SKIP_ENV_CHECK=1 npm run build` first')
  process.exit(2)
}

// The chunker and text normalisation the reader and Worker share.
const corePath = path.join(output, 'narrationCore.mjs')
await build({ entryPoints: [path.join(root, 'src/narration/narrationCore.ts')], bundle: true, format: 'esm', platform: 'node', outfile: corePath, logLevel: 'error' })
const core = await import(corePath + '?' + Date.now())

// ---- Chapter text and clip layout ------------------------------------------
const chapters = new Map()
async function chapterLayout(chapter) {
  if (chapters.has(chapter)) return chapters.get(chapter)
  const file = path.join(dist, 'data', 'editions-chapters', `${BOOK}-${EDITION}`, `ch${String(chapter).padStart(4, '0')}.json`)
  let paragraphs = []
  try { paragraphs = JSON.parse(await fs.readFile(file, 'utf8')).paragraphs || [] } catch { /* no such chapter */ }
  const layout = await Promise.all(paragraphs.map(async (raw, index) => {
    const text = typeof raw === 'string' ? raw : (raw?.text ?? '')
    const tokens = core.narrationTokens(text)
    const chunks = core.chunkNarrationTokens(tokens)
    return {
      index,
      textHash: await core.sha256Hex(core.narrationTextForParagraph(text)),
      chunks: chunks.map(chunk => {
        const spoken = tokens.slice(chunk.wordFrom, chunk.wordTo).join(' ')
        const natural = Math.max(1, Math.round((spoken.length / CHARS_PER_SECOND) * 2) / 2)
        const duration = longOpening > 0 && chapter === 1 && index === 0 && chunk.index === 0 ? longOpening : clipSeconds > 0 ? clipSeconds : natural
        return { index: chunk.index, wordFrom: chunk.wordFrom, wordTo: chunk.wordTo, duration }
      }),
    }
  }))
  chapters.set(chapter, layout)
  return layout
}
const clipPath = (chapter, paragraph, chunk, duration) => `narration/mock/${BOOK}/${EDITION}/c${chapter}/p${String(paragraph).padStart(4, '0')}-k${String(chunk).padStart(2, '0')}-d${duration}.mp3`
/** Playing order of a clip path: chapter, paragraph, chunk. */
function clipOrder(audioPath) {
  const match = /c(\d+)\/p(\d+)-k(\d+)-d([\d.]+)\.mp3$/.exec(audioPath || '')
  return match ? { chapter: Number(match[1]), paragraph: Number(match[2]), chunk: Number(match[3]), duration: Number(match[4]) } : null
}
const orderKey = order => order.chapter * 1e6 + order.paragraph * 100 + order.chunk

const fixtureCache = new Map()
async function fixture(duration) {
  if (fixtureCache.has(duration)) return fixtureCache.get(duration)
  const file = path.join(fixtures, `tone-${duration}.mp3`)
  if (!existsSync(file)) {
    // A quiet tone, not silence: an encoder may shrink digital silence well below the real voice's bytes.
    await promisify(execFile)('ffmpeg', ['-v', 'error', '-y', '-f', 'lavfi', '-i', `sine=frequency=220:duration=${duration}:sample_rate=24000`,
      '-af', 'volume=0.2', '-ac', '1', '-ar', '24000', '-b:a', `${BITRATE_KBPS}k`, file])
  }
  const bytes = await fs.readFile(file)
  fixtureCache.set(duration, bytes)
  return bytes
}

// Encoding blocks nothing once every clip length of the opening chapters exists.
{
  const durations = new Set()
  for (const chapter of [1, 2, 3]) for (const entry of await chapterLayout(chapter)) for (const chunk of entry.chunks) durations.add(chunk.duration)
  const list = [...durations]
  for (let i = 0; i < list.length; i += 8) await Promise.all(list.slice(i, i + 8).map(fixture))
}

// ---- Shaped network ---------------------------------------------------------
let profile = PROFILES.fast
const streams = new Set()
const TICK_MS = 10
setInterval(() => {
  if (streams.size === 0) return
  const budget = (profile.mbps * 1e6 / 8) * (TICK_MS / 1000)
  const share = Math.max(1, Math.floor(budget / streams.size))
  for (const stream of [...streams]) if (!stream.dead) stream.pump(share)
}, TICK_MS).unref()
const wait = ms => new Promise(resolve => setTimeout(resolve, ms))

function shapedSend(res, status, headers, body, log) {
  return new Promise((resolve) => {
    let offset = 0
    let closed = false
    res.on('close', () => { if (!closed) { closed = true; streams.delete(stream); log.aborted = offset < body.length; log.end = Date.now(); resolve() } })
    res.writeHead(status, headers)
    log.firstByte = Date.now()
    const stream = {
      pump(bytes) {
        if (closed) return
        const slice = body.subarray(offset, Math.min(body.length, offset + bytes))
        offset += slice.length
        if (slice.length) res.write(slice)
        if (offset >= body.length) {
          closed = true
          streams.delete(stream)
          log.end = Date.now()
          res.end()
          resolve()
        }
      },
    }
    if (body.length === 0) { closed = true; log.end = Date.now(); res.end(); resolve(); return }
    if (outageActive()) stream.dead = true
    streams.add(stream)
  })
}

// ---- Outage -------------------------------------------------------------------
let outage = null
const outageActive = () => Boolean(outage && Date.now() >= outage.start && Date.now() < outage.end)
function startOutage() {
  outage = { start: Date.now(), end: Date.now() + outageMs }
  for (const stream of streams) stream.dead = true
}

// ---- Server -----------------------------------------------------------------
const fetchLog = []
let ensureCalls = 0
const generated = new Set()
const making = new Map()
const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png', '.woff2': 'font/woff2', '.wav': 'audio/wav', '.mp3': 'audio/mpeg', '.ico': 'image/x-icon', '.webmanifest': 'application/manifest+json', '.txt': 'text/plain' }

async function readBody(req) {
  const parts = []
  for await (const part of req) parts.push(part)
  return Buffer.concat(parts).toString('utf8')
}

async function handleEnsure(req, res) {
  ensureCalls += 1
  const body = JSON.parse(await readBody(req) || '{}')
  await wait(profile.rttMs + ensureCachedMs)
  const layout = await chapterLayout(Number(body.chapter))
  const paragraphs = []
  // The Worker makes at most one missing sentence group per call (mode 'next'), for the first paragraph that lacks one.
  let madeOne = false
  for (const requested of body.paragraphs || []) {
    const entry = layout[requested.index]
    if (!entry || entry.chunks.length === 0) { paragraphs.push({ paragraph: requested.index, status: 'failed', reason: 'unavailable' }); continue }
    const textHash = requested.textHash || entry.textHash
    const from = Math.max(0, requested.fromChunk ?? 0)
    // Optional cold synthesis: one missing group per round, `generateMs` each (mode 'next').
    if (generateMs > 0) {
      const key = `${body.chapter}:${requested.index}`
      const missing = entry.chunks.find(chunk => chunk.index >= from && !generated.has(`${key}:${chunk.index}`))
      if (missing && !madeOne) {
        madeOne = true
        const lease = `${key}:${missing.index}`
        // Two calls for the same group share one synthesis (the Worker's per-group lease).
        if (!making.has(lease)) making.set(lease, wait(generateMs).then(() => { generated.add(lease); making.delete(lease) }))
        await making.get(lease)
      }
    }
    const chunks = entry.chunks.map((chunk) => {
      const ready = generateMs <= 0 || generated.has(`${body.chapter}:${requested.index}:${chunk.index}`)
      return {
        index: chunk.index, wordFrom: chunk.wordFrom, wordTo: chunk.wordTo, ready,
        ...(ready ? { url: `/api/audio-file?path=${encodeURIComponent(clipPath(body.chapter, requested.index, chunk.index, chunk.duration))}`, duration: chunk.duration, words: null, timingsUsable: false } : {}),
      }
    })
    const readyChunks = chunks.filter(chunk => chunk.ready).length
    const status = readyChunks === chunks.length ? 'ready' : readyChunks > 0 ? 'partial' : 'pending'
    paragraphs.push({
      paragraph: requested.index, status, textHash, chunkCount: chunks.length, readyChunks, chunks,
      ...(status === 'ready' ? { duration: entry.chunks.reduce((sum, chunk) => sum + chunk.duration, 0), words: null } : {}),
      ...(status === 'pending' ? { retryAfterMs: 1000 } : {}),
      source: 'cache',
    })
  }
  const json = Buffer.from(JSON.stringify({ paragraphs, generated: 0 }))
  res.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', 'Content-Length': json.length })
  res.end(json)
}

async function handleAudio(req, res, url) {
  const audioPath = url.searchParams.get('path') || ''
  const order = clipOrder(audioPath)
  const log = { path: audioPath, range: req.headers.range || null, start: Date.now(), purpose: req.headers['sec-fetch-dest'] || null }
  fetchLog.push(log)
  log.duringOutage = outageActive()
  await wait(profile.rttMs)
  if (!order) { res.writeHead(404); res.end(); log.end = Date.now(); log.status = 404; return }
  const bytes = await fixture(order.duration)
  const headers = { 'Content-Type': 'audio/mpeg', 'Accept-Ranges': 'bytes', 'Cache-Control': 'public, max-age=604800' }
  const range = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range || '')
  if (range && (range[1] || range[2])) {
    const start = range[1] ? Number(range[1]) : Math.max(0, bytes.length - Number(range[2]))
    const end = range[1] && range[2] ? Math.min(Number(range[2]), bytes.length - 1) : bytes.length - 1
    const body = bytes.subarray(start, end + 1)
    log.status = 206; log.bytes = body.length
    return shapedSend(res, 206, { ...headers, 'Content-Range': `bytes ${start}-${end}/${bytes.length}`, 'Content-Length': body.length }, body, log)
  }
  log.status = 200; log.bytes = bytes.length
  return shapedSend(res, 200, { ...headers, 'Content-Length': bytes.length }, bytes, log)
}

async function handleStatic(req, res, url) {
  let pathname = decodeURIComponent(url.pathname)
  if (pathname === '/reader' || pathname === '/reader/') pathname = '/app.html'
  const file = path.join(dist, pathname)
  if (!file.startsWith(dist)) { res.writeHead(403); res.end(); return }
  try {
    const stat = await fs.stat(file)
    if (!stat.isFile()) throw new Error('dir')
    res.writeHead(200, { 'Content-Type': mime[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-cache' })
    res.end(await fs.readFile(file))
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain' }); res.end('not found')
  }
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://local')
  try {
    if (url.pathname === '/api/narration/voices') {
      res.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' })
      res.end(JSON.stringify({ enabled: true, provider: 'grok', model: 'mock', voices: [{ key: 'f', label: 'Ara', persona: 'female' }, { key: 'm', label: 'Helios', persona: 'male' }] }))
      return
    }
    if (url.pathname === '/api/narration/ensure') return await handleEnsure(req, res)
    if (url.pathname === '/api/narration/chapter') {
      res.writeHead(200, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ paragraphs: [] })); return
    }
    if (url.pathname === '/api/audio-file') return await handleAudio(req, res, url)
    if (url.pathname.startsWith('/api/')) {
      if (req.method === 'POST') await readBody(req)
      res.writeHead(404, { 'Content-Type': 'application/json' }); res.end('{}'); return
    }
    return await handleStatic(req, res, url)
  } catch (error) {
    if (!res.headersSent) res.writeHead(500)
    res.end(String(error?.message || error))
  }
})
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
const origin = `http://127.0.0.1:${server.address().port}`

// ---- Browser ------------------------------------------------------------------
function initScript(config) {
  window.__narr = { events: [], hidden: false }
  const realSetInterval = window.setInterval.bind(window)
  if (config.iosBackground) {
    const rawTimeout = window.setTimeout.bind(window)
    const rawInterval = window.setInterval.bind(window)
    const waiting = []
    window.__narr.deferredTimers = 0
    window.setTimeout = (fn, ms, ...rest) => rawTimeout(() => {
      if (window.__narr.hidden) { window.__narr.deferredTimers += 1; waiting.push(() => typeof fn === 'function' && fn(...rest)) } else if (typeof fn === 'function') fn(...rest)
    }, ms)
    window.setInterval = (fn, ms, ...rest) => rawInterval(() => { if (!window.__narr.hidden && typeof fn === 'function') fn(...rest) }, ms)
    document.addEventListener('visibilitychange', () => { if (!window.__narr.hidden) waiting.splice(0).forEach(run => run()) })
    const nativePause = HTMLMediaElement.prototype.pause
    const nativePlayForGesture = HTMLMediaElement.prototype.play
    HTMLMediaElement.prototype.pause = function () {
      if (window.__narr.hidden) this.__idledHidden = true
      return nativePause.call(this)
    }
    HTMLMediaElement.prototype.play = function () {
      if (window.__narr.hidden && this.__idledHidden) {
        window.__narr.refusedPlays = (window.__narr.refusedPlays || 0) + 1
        return Promise.reject(new DOMException('The request is not allowed by the user agent in the current context.', 'NotAllowedError'))
      }
      return nativePlayForGesture.call(this)
    }
  }
  const realVisibility = Object.getOwnPropertyDescriptor(Document.prototype, 'visibilityState')
  Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => (window.__narr.hidden ? 'hidden' : realVisibility.get.call(document)) })
  Object.defineProperty(document, 'hidden', { configurable: true, get: () => window.__narr.hidden })
  const seen = new WeakSet()
  const now = () => performance.timeOrigin + performance.now()
  function observe(audio) {
    if (seen.has(audio)) return
    seen.add(audio)
    audio.__narrId = (window.__narrIds = (window.__narrIds || 0) + 1)
    window.__narr.lastAudio = audio
    for (const type of ['loadstart', 'canplay', 'playing', 'waiting', 'stalled', 'pause', 'ended', 'error', 'emptied']) {
      audio.addEventListener(type, () => window.__narr.events.push({
        type, t: now(), element: audio.__narrId, src: audio.currentSrc || audio.src || '', loop: audio.loop,
        currentTime: audio.currentTime, duration: audio.duration, readyState: audio.readyState, rate: audio.playbackRate,
      }))
    }
  }
  const NativeAudio = window.Audio
  window.Audio = function (...a) { const audio = new NativeAudio(...a); observe(audio); return audio }
  window.Audio.prototype = NativeAudio.prototype
  Object.setPrototypeOf(window.Audio, NativeAudio)
  const nativePlay = HTMLMediaElement.prototype.play
  HTMLMediaElement.prototype.play = function () { observe(this); return nativePlay.call(this) }
  const { speed, startParagraph, startPage } = config
  localStorage.setItem('tinct-lab-prefs', JSON.stringify({ theme: 'light', primaryEdition: 'original-en', voicePersona: 'female', voicePersonaChosen: true, audiobookVoice: null, audioSpeed: speed }))
  sessionStorage.setItem('tinct:lab-reader-handoff', JSON.stringify({ kind: 'open-reader', bookId: 'frankenstein', primaryEditionKey: 'original-en', savedPlace: { bookId: 'frankenstein', chapterNumber: 1, paragraphIndex: startParagraph, wordIndex: 0, page: startPage } }))
  // The buffer's early warnings, and the player as a listener and the lock screen see it, five times a second.
  window.__narr.signals = []
  window.addEventListener('tinct:narration-buffer', event => window.__narr.signals.push({ ...event.detail, t: now() }))
  window.__narr.samples = []
  realSetInterval(() => {
    const audio = [...document.querySelectorAll('audio')][0] || window.__narr.lastAudio
    const transport = document.querySelector('[data-testid="lab-v2-play"]')
    window.__narr.samples.push({
      t: now(), ct: audio ? audio.currentTime : null, src: audio ? (audio.currentSrc || audio.src || '') : '', paused: audio ? audio.paused : null, loop: audio ? audio.loop : null,
      session: navigator.mediaSession ? navigator.mediaSession.playbackState : null,
      spinner: Boolean(document.querySelector('[data-testid="lab-audio-spinner"]')), label: transport ? transport.getAttribute('aria-label') : null,
    })
  }, 200)
}

const percentile = (values, p) => {
  if (values.length === 0) return null
  const sorted = [...values].sort((a, b) => a - b)
  return sorted[Math.min(sorted.length - 1, Math.max(0, Math.ceil((p / 100) * sorted.length) - 1))]
}

/**
 * Stretches where the listener hears nothing: samples (every 200 ms) whose
 * clock does not move for longer than 600 ms — shorter runs are one or two
 * samples across an ordinary boundary — with what the transport and lock
 * screen said meanwhile.
 */
function silences(samples) {
  const found = []
  let run = null
  for (let i = 1; i < samples.length; i += 1) {
    const before = samples[i - 1], sample = samples[i]
    const moving = sample.ct != null && before.ct != null && sample.src === before.src && sample.ct > before.ct + 0.01 && !sample.loop
    if (!moving) {
      if (!run) run = { start: before.t, samples: [] }
      run.samples.push(sample)
    } else if (run) {
      const ms = Math.round(sample.t - run.start)
      if (ms > 600) found.push({ start: run.start, end: sample.t, ms, spinnerShown: run.samples.some(item => item.spinner), sessionPlayingThroughout: run.samples.every(item => item.session === 'playing'), pauseShown: run.samples.every(item => item.label === 'Pause') })
      run = null
    }
  }
  if (run && run.samples.length > 2) {
    const last = run.samples[run.samples.length - 1]
    found.push({ start: run.start, end: last.t, ms: Math.round(last.t - run.start), open: true, spinnerShown: run.samples.some(item => item.spinner), sessionPlayingThroughout: run.samples.every(item => item.session === 'playing'), pauseShown: run.samples.every(item => item.label === 'Pause') })
  }
  return found
}

/** Clip boundaries from the element's own events: `ended` of a recording to `playing` of the next one. */
function boundaries(events, startOrder) {
  const isClip = event => !event.loop && !/unlock-silence|narration-hold/.test(event.src) && event.src
  const result = []
  let clipsPlayed = 0
  let currentSrc = null
  for (let i = 0; i < events.length; i += 1) {
    const event = events[i]
    if (event.type === 'playing' && isClip(event) && event.src !== currentSrc) { currentSrc = event.src; clipsPlayed += 1 }
    if (event.type !== 'ended' || !isClip(event)) continue
    const next = events.slice(i + 1).find(item => item.type === 'playing' && isClip(item) && item.src !== event.src)
    const held = events.slice(i + 1, next ? events.indexOf(next) : undefined).some(item => item.loop && item.type === 'playing')
    result.push({ clip: startOrder + clipsPlayed - 1, endedAt: event.t, gapMs: next ? Math.round(next.t - event.t) : null, held })
  }
  return result
}

async function runCase(browser, engine, profileName, visibility) {
  profile = PROFILES[profileName]
  fetchLog.length = 0
  ensureCalls = 0
  generated.clear()
  making.clear()
  outage = null
  const caseLabel = [engine, viewport, profileName, visibility, serviceWorkers === 'allow' ? 'sw' : null, generateMs > 0 ? `cold${generateMs}` : null,
    speed !== 1 ? `x${speed}` : null, longOpening ? `opening${longOpening}s` : null, iosBackground ? 'ios-bg' : null, clipSeconds ? `clips${clipSeconds}s` : null, outageMs > 0 ? `outage${outageAtSeconds}s+${outageMs}ms` : null].filter(Boolean).join('-')
  const context = await browser.newContext({
    viewport: viewport === 'phone' ? { width: 390, height: 844 } : { width: 1440, height: 900 },
    hasTouch: viewport === 'phone', serviceWorkers,
  })
  const page = await context.newPage()
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  await page.addInitScript(initScript, { speed, startParagraph, startPage, iosBackground })
  const result = { label: caseLabel, engine, profile: profileName, visibility, errors }
  try {
    await page.goto(origin + (viewport === 'phone' ? '/reader?layout=phone' : '/reader'), { waitUntil: 'domcontentloaded' })
    await page.waitForFunction(() => document.querySelector('[data-testid="lab-root"]')?.dataset.readerReady === 'true', null, { timeout: 60000 })
    await page.waitForTimeout(800)
    const startedAt = Date.now()
    await page.getByTestId('lab-v2-play').click()
    await page.waitForFunction(() => window.__narr.events.some(e => e.type === 'playing' && !e.loop && !/unlock-silence/.test(e.src)), null, { timeout: 60000 })
    result.firstPlayMs = Date.now() - startedAt
    if (visibility === 'hidden') {
      await page.evaluate(() => { window.__narr.hidden = true; document.dispatchEvent(new Event('visibilitychange')) })
    }
    if (outageMs > 0) {
      await page.waitForTimeout(outageAtSeconds * 1000)
      startOutage()
      result.outageStart = outage.start
      result.outageEnd = outage.end
      await page.waitForTimeout(Math.max(0, runSeconds * 1000 - outageAtSeconds * 1000))
    } else {
      await page.waitForTimeout(runSeconds * 1000)
    }
    const state = await page.evaluate(() => ({
      events: window.__narr.events,
      signals: window.__narr.signals,
      refusedPlays: window.__narr.refusedPlays || 0,
      deferredTimers: window.__narr.deferredTimers || 0,
      samples: window.__narr.samples,
      transport: document.querySelector('[data-testid="lab-v2-play"]')?.getAttribute('aria-label'),
      buffering: !!document.querySelector('[data-testid="lab-audio-buffering"]'),
    }))
    const endedBy = Date.now()
    // A clip that ended in the last seconds of the run may still be starting its successor.
    const found = boundaries(state.events, 0).filter(item => item.gapMs != null || item.endedAt < endedBy - 3000)
    // Order of each clip the server has handed out, and when its bytes were all here.
    const audioFetches = fetchLog.filter(entry => clipOrder(entry.path))
    const completed = new Map()
    for (const entry of audioFetches) {
      if (entry.aborted || !entry.end || entry.status !== 200 && !(entry.status === 206 && entry.range === 'bytes=0-')) continue
      const key = orderKey(clipOrder(entry.path))
      if (!completed.has(key) || completed.get(key) > entry.end) completed.set(key, entry.end)
    }
    const playingOrder = [...new Set(audioFetches.map(entry => orderKey(clipOrder(entry.path))))].sort((a, b) => a - b)
    for (const boundary of found) {
      const current = playingOrder[boundary.clip]
      boundary.downloadedAhead = [...completed.entries()].filter(([key, end]) => key > current && end <= boundary.endedAt).length
    }
    const gaps = found.filter(item => item.gapMs != null).map(item => item.gapMs)
    Object.assign(result, {
      boundaries: found,
      count: gaps.length,
      p50: percentile(gaps, 50), p95: percentile(gaps, 95), max: gaps.length ? Math.max(...gaps) : null,
      held: found.filter(item => item.held).length,
      minDownloadedAhead: found.length ? Math.min(...found.map(item => item.downloadedAhead)) : null,
      audioRequests: audioFetches.length,
      audioBytes: audioFetches.reduce((sum, entry) => sum + (entry.bytes || 0), 0),
      ensureCalls,
      fetches: audioFetches.map(entry => ({ path: entry.path.split('/').pop(), range: entry.range, dest: entry.purpose, start: entry.start - startedAt, end: entry.end ? entry.end - startedAt : null, bytes: entry.bytes, aborted: entry.aborted || false })),
      transport: state.transport,
      // Only after the first sound: the wait for Play to start is not a gap.
      refusedPlays: state.refusedPlays,
      deferredTimers: state.deferredTimers,
      silences: silences(state.samples.filter(sample => sample.t >= (state.events.find(e => e.type === 'playing' && !e.loop && !/unlock-silence/.test(e.src))?.t ?? Infinity))),
    })
    // A clip that never followed the one before it: keep the element's own story for diagnosis.
    if (!found.length || found.some(item => item.gapMs == null)) result.events = state.events
    const silent = result.silences
    result.maxSilenceMs = silent.length ? Math.max(...silent.map(item => item.ms)) : 0
    if (outage) {
      const first = state.signals.find(item => item.t >= outage.start && item.kind !== 'recovered')
      result.outage = {
        ms: outageMs, atSeconds: outageAtSeconds,
        detectMs: first ? Math.round(first.t - outage.start) : null,
        detectKind: first?.kind ?? null,
        aheadAtDetection: first && typeof first.aheadSeconds === 'number' ? Math.round(first.aheadSeconds * 10) / 10 : null,
        signals: state.signals.filter(item => item.t >= outage.start).map(item => ({ kind: item.kind, ms: Math.round(item.t - outage.start), ahead: item.aheadSeconds == null ? null : Math.round(item.aheadSeconds), retries: item.retries })),
        retriedRequests: audioFetches.filter(entry => entry.start >= outage.start).length,
        rangeResumes: audioFetches.filter(entry => entry.start >= outage.start && entry.range && entry.range !== 'bytes=0-').length,
        silencesDuringOrAfter: silent.filter(item => item.end >= outage.start),
      }
    }
    await page.getByTestId('lab-v2-play').evaluate((button) => { if (button.getAttribute('aria-label') === 'Pause') button.click() }).catch(() => {})
  } catch (error) {
    result.error = error.stack || String(error)
    await page.screenshot({ path: path.join(output, caseLabel + '-failure.png') }).catch(() => {})
  } finally {
    await context.close().catch(() => {})
  }
  console.log(JSON.stringify({ label: caseLabel, count: result.count, p50: result.p50, p95: result.p95, max: result.max, held: result.held, minDownloadedAhead: result.minDownloadedAhead, maxSilenceMs: result.maxSilenceMs, refusedPlays: result.refusedPlays, deferredTimers: result.deferredTimers, outage: result.outage && { detectMs: result.outage.detectMs, kind: result.outage.detectKind, ahead: result.outage.aheadAtDetection, retried: result.outage.retriedRequests, ranges: result.outage.rangeResumes, silences: result.outage.silencesDuringOrAfter.map(item => [item.ms, item.spinnerShown, item.sessionPlayingThroughout]) }, error: result.error?.split('\n')[0] }))
  return result
}

const report = { label, runSeconds, serviceWorkers, viewport, ensureCachedMs, generateMs, cases: [] }
for (const engine of engines) {
  const type = engine === 'webkit' ? webkit : chromium
  const browser = await markInternal(await type.launch({
    headless: true,
    ...(engine === 'chromium' ? { args: ['--mute-audio', '--autoplay-policy=no-user-gesture-required'] } : {}),
  }))
  try {
    for (const profileName of profileNames) {
      for (const visibility of visibilities) report.cases.push(await runCase(browser, engine, profileName, visibility))
    }
  } finally {
    await browser.close().catch(() => {})
  }
}
server.close()
await fs.writeFile(path.join(output, `report-${label}.json`), JSON.stringify(report, null, 2))

console.log('\n| case | boundaries | p50 ms | p95 ms | max ms | held | min clips downloaded ahead |')
console.log('|---|---|---|---|---|---|---|')
for (const item of report.cases) console.log(`| ${item.label} | ${item.count ?? '-'} | ${item.p50 ?? '-'} | ${item.p95 ?? '-'} | ${item.max ?? '-'} | ${item.held ?? '-'} | ${item.minDownloadedAhead ?? '-'} |`)

const failures = []
for (const item of report.cases) {
  if (item.error) { failures.push(`${item.label}: ${item.error.split('\n')[0]}`); continue }
  if (item.errors.length) failures.push(`${item.label}: page errors ${item.errors.join('; ')}`)
  if (!item.count) { failures.push(`${item.label}: no clip boundary was measured`); continue }
  if (item.boundaries.some(boundary => boundary.gapMs == null)) failures.push(`${item.label}: a clip never followed the one before it`)
  if (item.profile === '3g') continue
  if (item.p95 > 150) failures.push(`${item.label}: p95 ${item.p95} ms > 150 ms`)
  if (item.max > 300) failures.push(`${item.label}: max ${item.max} ms > 300 ms`)
}
if (assertGaps && generateMs <= 0 && failures.length) {
  console.error('\nNARRATION GAPS FAILED\n' + failures.join('\n'))
  process.exit(1)
}
console.log(failures.length ? '\n(not asserted) ' + failures.join('\n') : '\nNarration gaps within thresholds.')
