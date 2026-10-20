#!/usr/bin/env node
// Listen in the margin preview (/reader?book=<id>&margin=1 on a desktop; src/lab/marginPreview/useMarginListen.ts and
// public/lab/addbook/js/tinct-listen.js), in a real browser against the built reader (dist/) and a mock narration API
// served from the same local server. No narration is requested anywhere: /api/narration/ensure is answered here from
// the chapter text in dist/ (with even word timings), and every clip is a synthetic MP3 tone (ffmpeg).
//
//   SKIP_ENV_CHECK=1 npm run build && node scripts/check-margin-listen.mjs
//
// Checks, for Frankenstein (original English) at 1440×900: Play shows in the margin view's top bar; it starts at the
// paragraph at the top of the view, in the edition shown; the follow highlight and the paragraph mark follow the
// audio (and agree with the player); the view keeps the word heard in view; a new speed reaches the element and the
// reader's prefs; back 15 s moves the clock; Pause stops the element and writes the place heard as the book reader's
// place; the normal reader then opens on that paragraph and its Play starts there. Screenshots go to
// artifacts/margin-listen.
import { chromium } from '@playwright/test'
import http from 'node:http'
import fs from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { build } from 'esbuild'
import { markInternal } from './lib/internalTraffic.cjs'

const BOOK = 'frankenstein'
const EDITION = 'original-en'
const START = { chapterNumber: 4, paragraphIndex: 12, wordIndex: 0 }
/** Fast clips (12 words a second at 1x) so a paragraph or two is heard in seconds. */
const WORDS_PER_SECOND = 12
const root = process.cwd()
const dist = path.resolve(root, process.env.DIST || 'dist')
const output = path.join(root, 'artifacts', 'margin-listen')
const fixtures = path.join(output, 'fixtures')
await fs.mkdir(fixtures, { recursive: true })
if (!existsSync(path.join(dist, 'app.html'))) { console.error('dist/app.html missing: run `SKIP_ENV_CHECK=1 npm run build` first'); process.exit(2) }

let failures = 0
const ok = (label, pass, detail) => { if (!pass) failures++; console.log(`${pass ? 'ok  ' : 'FAIL'} ${label}${detail !== undefined ? ' ' + JSON.stringify(detail).slice(0, 500) : ''}`) }

const corePath = path.join(output, 'narrationCore.mjs')
await build({ entryPoints: [path.join(root, 'src/narration/narrationCore.ts')], bundle: true, format: 'esm', platform: 'node', outfile: corePath, logLevel: 'error' })
const core = await import(corePath + '?' + Date.now())

const layouts = new Map()
async function chapterLayout(chapter) {
  if (layouts.has(chapter)) return layouts.get(chapter)
  const file = path.join(dist, 'data', 'editions-chapters', `${BOOK}-${EDITION}`, `ch${String(chapter).padStart(4, '0')}.json`)
  let paragraphs = []
  try { paragraphs = JSON.parse(await fs.readFile(file, 'utf8')).paragraphs || [] } catch { /* none */ }
  const layout = await Promise.all(paragraphs.map(async (raw, index) => {
    const text = typeof raw === 'string' ? raw : (raw?.text ?? '')
    const tokens = core.narrationTokens(text)
    return {
      index, textHash: await core.sha256Hex(core.narrationTextForParagraph(text)),
      chunks: core.chunkNarrationTokens(tokens).map(chunk => {
        const words = tokens.slice(chunk.wordFrom, chunk.wordTo)
        const duration = Math.max(1, Math.round((words.length / WORDS_PER_SECOND) * 2) / 2)
        return { index: chunk.index, wordFrom: chunk.wordFrom, wordTo: chunk.wordTo, duration, words: words.map((w, i) => ({ text: w, start: (i * duration) / words.length, end: ((i + 1) * duration) / words.length })) }
      }),
    }
  }))
  layouts.set(chapter, layout)
  return layout
}
const fixtureCache = new Map()
async function tone(duration) {
  if (fixtureCache.has(duration)) return fixtureCache.get(duration)
  const file = path.join(fixtures, `tone-${duration}.mp3`)
  if (!existsSync(file)) await promisify(execFile)('ffmpeg', ['-v', 'error', '-y', '-f', 'lavfi', '-i', `sine=frequency=220:duration=${duration}:sample_rate=24000`, '-af', 'volume=0.2', '-ac', '1', '-ar', '24000', '-b:a', '64k', file])
  const bytes = await fs.readFile(file)
  fixtureCache.set(duration, bytes)
  return bytes
}

const ensureLog = []
const external = []
const readBody = async req => { const parts = []; for await (const p of req) parts.push(p); return Buffer.concat(parts).toString('utf8') }
const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png', '.woff2': 'font/woff2', '.wav': 'audio/wav', '.mp3': 'audio/mpeg', '.gz': 'application/gzip', '.webmanifest': 'application/manifest+json' }
async function handleEnsure(req, res) {
  const body = JSON.parse(await readBody(req) || '{}')
  ensureLog.push({ at: Date.now(), bookId: body.bookId, editionKey: body.editionKey, chapter: body.chapter, voice: body.voice, paragraphs: (body.paragraphs || []).map(p => p.index) })
  const layout = await chapterLayout(Number(body.chapter))
  const paragraphs = (body.paragraphs || []).map(requested => {
    const entry = layout[requested.index]
    if (!entry || !entry.chunks.length || body.editionKey !== EDITION) return { paragraph: requested.index, status: 'failed', reason: 'unavailable' }
    const chunks = entry.chunks.map(c => ({ index: c.index, wordFrom: c.wordFrom, wordTo: c.wordTo, ready: true, url: `/api/audio-file?path=${encodeURIComponent(`narration/mock/${BOOK}/c${body.chapter}/p${requested.index}-k${c.index}-d${c.duration}.mp3`)}`, duration: c.duration, words: c.words, timingsUsable: true }))
    return { paragraph: requested.index, status: 'ready', textHash: requested.textHash || entry.textHash, chunkCount: chunks.length, readyChunks: chunks.length, chunks, duration: entry.chunks.reduce((s, c) => s + c.duration, 0), words: null, source: 'cache' }
  })
  const json = Buffer.from(JSON.stringify({ paragraphs, generated: 0 }))
  res.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', 'Content-Length': json.length }); res.end(json)
}
async function handleAudio(req, res, url) {
  const m = /-d([\d.]+)\.mp3$/.exec(url.searchParams.get('path') || '')
  if (!m) { res.writeHead(404); res.end(); return }
  const bytes = await tone(Number(m[1]))
  const range = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range || '')
  const headers = { 'Content-Type': 'audio/mpeg', 'Accept-Ranges': 'bytes', 'Cache-Control': 'public, max-age=604800' }
  if (range && range[1]) {
    const start = Number(range[1]), end = range[2] ? Math.min(Number(range[2]), bytes.length - 1) : bytes.length - 1
    res.writeHead(206, { ...headers, 'Content-Range': `bytes ${start}-${end}/${bytes.length}`, 'Content-Length': end - start + 1 }); res.end(bytes.subarray(start, end + 1)); return
  }
  res.writeHead(200, { ...headers, 'Content-Length': bytes.length }); res.end(bytes)
}
async function handleStatic(req, res, url) {
  let pathname = decodeURIComponent(url.pathname)
  if (pathname === '/reader' || pathname === '/reader/') pathname = '/app.html'
  if (pathname.endsWith('/')) pathname += 'index.html'
  let file = path.join(dist, pathname)
  if (!file.startsWith(dist)) { res.writeHead(403); res.end(); return }
  if (!path.extname(file) && existsSync(file + '.html')) file += '.html'
  try {
    const stat = await fs.stat(file); if (!stat.isFile()) throw new Error('dir')
    res.writeHead(200, { 'Content-Type': mime[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-cache' }); res.end(await fs.readFile(file))
  } catch { res.writeHead(404, { 'Content-Type': 'text/plain' }); res.end('not found') }
}
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://local')
  try {
    if (url.pathname === '/api/narration/voices') { res.writeHead(200, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ enabled: true, provider: 'grok', model: 'mock', voices: [{ key: 'f', label: 'Ara', persona: 'female' }, { key: 'm', label: 'Helios', persona: 'male' }] })); return }
    if (url.pathname === '/api/narration/ensure') return await handleEnsure(req, res)
    if (url.pathname === '/api/audio-file') return await handleAudio(req, res, url)
    if (url.pathname.startsWith('/api/')) { if (req.method === 'POST') await readBody(req); res.writeHead(404, { 'Content-Type': 'application/json' }); res.end('{}'); return }
    return await handleStatic(req, res, url)
  } catch (error) { if (!res.headersSent) res.writeHead(500); res.end(String(error?.message || error)) }
})
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
const origin = `http://127.0.0.1:${server.address().port}`

function initScript({ start, edition }) {
  if (window.top !== window) return
  window.__narr = { events: [] }
  const seen = new WeakSet()
  const observe = audio => {
    if (seen.has(audio)) return
    seen.add(audio); window.__narr.audio = audio
    for (const type of ['playing', 'pause', 'ended', 'ratechange', 'error']) audio.addEventListener(type, () => window.__narr.events.push({ type, t: Date.now(), src: audio.currentSrc || audio.src || '', rate: audio.playbackRate, time: audio.currentTime }))
  }
  const NativeAudio = window.Audio
  window.Audio = function (...a) { const audio = new NativeAudio(...a); observe(audio); return audio }
  window.Audio.prototype = NativeAudio.prototype
  const nativePlay = HTMLMediaElement.prototype.play
  HTMLMediaElement.prototype.play = function () { observe(this); return nativePlay.call(this) }
  if (sessionStorage.getItem('seeded')) return
  sessionStorage.setItem('seeded', '1')
  const now = Date.now() - 60000
  localStorage.setItem('tinct-lab-prefs', JSON.stringify({ theme: 'light', primaryEdition: edition, voicePersona: 'female', voicePersonaChosen: true, audiobookVoice: null, audioSpeed: 1 }))
  localStorage.setItem('tinct-lab-position', JSON.stringify({ books: { frankenstein: { bookId: 'frankenstein', headerBook: 'frankenstein', sequentialChapter: start.chapterNumber, ...start, primaryEditionKey: edition, readerMode: 'read', updatedAt: now, deviceId: 'qa', rev: 1 } }, finished: {}, hidden: {}, lastSettledBookId: 'frankenstein', lastSettledAt: now, updatedAt: now, deviceId: 'qa' }))
}

const browser = await markInternal(await chromium.launch({ headless: true, args: ['--mute-audio', '--autoplay-policy=no-user-gesture-required'] }))
const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, serviceWorkers: 'block' })
const page = await context.newPage()
const errors = []
page.on('pageerror', e => errors.push(e.message))
page.on('request', r => { const u = new URL(r.url()); if (!['127.0.0.1', 'localhost'].includes(u.hostname) && !u.protocol.startsWith('data') && !u.protocol.startsWith('blob')) external.push(u.hostname) })
await page.addInitScript(initScript, { start: START, edition: EDITION })
try {
  await page.goto(`${origin}/reader?book=${BOOK}&margin=1`, { waitUntil: 'domcontentloaded' })
  const frame = await (await page.waitForSelector('iframe[data-testid="margin-preview-frame"]', { timeout: 30000 })).contentFrame()
  await frame.waitForFunction(() => typeof state !== 'undefined' && state.preview && document.querySelector('.lab.tb-can-listen'), null, { timeout: 60000 })
  await page.waitForTimeout(1500)
  const playShown = await frame.evaluate(() => { const b = document.getElementById('playBtn'), r = b.getBoundingClientRect(); return { display: getComputedStyle(b).display, w: r.width, label: b.getAttribute('aria-label'), icon: b.innerHTML.includes('M8.6 6.4') } })
  ok('Play shows in the margin view’s top bar, the book reader’s icon', playShown.display !== 'none' && playShown.w > 20 && playShown.label === 'Play' && playShown.icon, playShown)
  const top = await frame.evaluate(() => { const s = previewSpot(); return { chapterNumber: Number(document.querySelectorAll('.tb-chapter')[s.page - 1] && state.pages.length ? s.page : 0), para: s.para, word: s.word } })
  const opened = await frame.evaluate(() => ({ page: currentPlace().page }))
  await page.screenshot({ path: path.join(output, '1-before-play.png') })

  await frame.click('#playBtn')
  await page.waitForFunction(() => window.__narr.events.some(e => e.type === 'playing' && /audio-file/.test(e.src)), null, { timeout: 30000 })
  const first = ensureLog[0]
  ok('Play asks for the edition shown, at the chapter and paragraph at the top of the view', first && first.bookId === BOOK && first.editionKey === EDITION && first.chapter === START.chapterNumber && first.paragraphs[0] === top.para, { first, top, opened })
  ok('the top bar shows Pause while it plays', await frame.evaluate(() => document.getElementById('playBtn').getAttribute('aria-label')) === 'Pause')
  ok('the transport is up (speed, back, play, forward)', await frame.evaluate(() => ['speed', 'back', 'play', 'forward'].every(a => document.querySelector(`.tb-listen-dock [data-a="${a}"]`))))

  // The highlight follows the audio: sampled over a few seconds, it agrees with the player and moves on.
  const samples = []
  for (let i = 0; i < 20; i++) {
    await page.waitForTimeout(500)
    samples.push(await frame.evaluate(() => {
      const snap = window.parent.TinctMarginPreview.listen.snapshot()
      const hl = CSS.highlights.get('tinct-listen'), range = hl && [...hl][0]
      const heard = document.querySelector('p.tb-p.tb-heard'), paras = heard ? [...heard.parentElement.querySelectorAll(':scope > p.tb-p')] : []
      const r = range?.getBoundingClientRect(), s = document.getElementById('scroll').getBoundingClientRect()
      const words = heard ? [...heard.textContent.matchAll(/\S+/g)].map(m => m[0]) : []
      return { follow: snap.follow, chapter: snap.chapterNumber, para: paras.indexOf(heard), word: range ? range.toString() : null, expected: snap.follow && snap.follow.wordIndex != null ? words[snap.follow.wordIndex] : null, inView: !!r && r.top >= s.top && r.bottom <= s.bottom }
    }))
  }
  const painted = samples.filter(s => s.follow)
  ok('the highlight is the word the player is on', painted.length > 8 && painted.every(s => s.para === s.follow.paragraphIndex && s.word === s.expected), painted.slice(0, 3))
  const order = painted.map(s => s.follow.paragraphIndex * 1000 + s.follow.wordIndex)
  ok('it moves on with the audio, never back', new Set(order).size >= 4 && order.every((v, i) => i === 0 || v >= order[i - 1]), order)
  ok('it moves into the next paragraph', painted.at(-1).follow.paragraphIndex > top.para, painted.at(-1))
  ok('the word heard stays in view', painted.every(s => s.inView))
  await page.screenshot({ path: path.join(output, '2-playing.png') })

  // The reader scrolls away while it plays: the view is theirs until the word heard is back in view or Play.
  const box = await (await page.$('iframe[data-testid="margin-preview-frame"]')).boundingBox()
  await page.mouse.move(box.x + 500, box.y + 400)
  await page.mouse.wheel(0, -2500)
  await page.waitForTimeout(400)
  const away = await frame.evaluate(() => document.getElementById('scroll').scrollTop)
  await page.waitForTimeout(2500)
  const still = await frame.evaluate(() => ({ top: document.getElementById('scroll').scrollTop, playing: window.parent.TinctMarginPreview.listen.snapshot().playing }))
  ok('scrolled away while it plays, the view stays where the reader took it', still.playing && Math.abs(still.top - away) < 4, { away, still })
  await frame.click('.tb-listen-dock [data-a="play"]')
  await page.waitForTimeout(300)
  await frame.click('.tb-listen-dock [data-a="play"]')
  await page.waitForTimeout(1200)
  const back = await frame.evaluate(() => { const hl = CSS.highlights.get('tinct-listen'), r = hl && [...hl][0]?.getBoundingClientRect(), s = document.getElementById('scroll').getBoundingClientRect(); return !!r && r.top >= s.top && r.bottom <= s.bottom })
  ok('Pause and Play bring the word heard back into view', back)

  // Speed: the dock's control, the element's rate and the reader's prefs.
  await frame.click('.tb-listen-dock [data-a="speed"]')
  await frame.evaluate(() => { const i = document.querySelector('.tb-listen-speed input'); i.value = '2'; i.dispatchEvent(new Event('input', { bubbles: true })) })
  await page.waitForTimeout(600)
  const rate = await page.evaluate(() => ({ rate: window.__narr.audio.playbackRate, prefs: JSON.parse(localStorage.getItem('tinct-lab-prefs')).shared?.audioSpeed }))
  const dockRate = await frame.evaluate(() => document.querySelector('.tb-listen-dock [data-a="speed"]').textContent)
  ok('speed 2×: the element plays at 2, the reader’s prefs keep it, the dock says 2×', rate.rate === 2 && rate.prefs === 2 && dockRate === '2×', { ...rate, dockRate })
  await frame.evaluate(() => document.querySelector('.tb-listen-speed .lab-audio-speed-done').click())
  const beforeBack = await frame.evaluate(() => window.parent.TinctMarginPreview.listen.snapshot().chapterTime)
  await frame.click('.tb-listen-dock [data-a="back"]')
  await page.waitForTimeout(400)
  const afterBack = await frame.evaluate(() => window.parent.TinctMarginPreview.listen.snapshot().chapterTime)
  ok('back 15 s moves the chapter clock back', afterBack < beforeBack, { beforeBack, afterBack })
  await page.waitForTimeout(2500)

  // Pause from the top bar: the place heard becomes the book reader's place.
  const heard = await frame.evaluate(() => { const s = window.parent.TinctMarginPreview.listen.snapshot(); return { chapterNumber: s.chapterNumber, ...s.follow } })
  await frame.click('#playBtn')
  await page.waitForTimeout(500)
  const paused = await page.evaluate(() => ({ paused: window.__narr.audio.paused, record: JSON.parse(localStorage.getItem('tinct-lab-position')).books.frankenstein }))
  ok('Pause stops the element', paused.paused)
  ok('the book reader’s place is the paragraph heard', paused.record.chapterNumber === heard.chapterNumber && Math.abs(paused.record.paragraphIndex - heard.paragraphIndex) <= 1 && paused.record.primaryEditionKey === EDITION, { heard, record: paused.record })
  await page.screenshot({ path: path.join(output, '3-paused.png') })
  ok('Close puts the transport away', await frame.evaluate(async () => { document.querySelector('.tb-listen-dock [data-a="close"]').click(); await new Promise(r => setTimeout(r, 300)); return !document.querySelector('.tb-listen-dock') }))

  // The normal reader opens at that paragraph and its Play starts there.
  const saved = paused.record
  const ensuresBefore = ensureLog.length
  await page.goto(`${origin}/reader?book=${BOOK}&margin=0`, { waitUntil: 'domcontentloaded' })
  await page.waitForFunction(() => document.querySelector('[data-testid="lab-root"]')?.dataset.readerReady === 'true', null, { timeout: 60000 })
  await page.waitForTimeout(1500)
  const shown = await page.evaluate(() => {
    const words = [...document.querySelectorAll('[data-testid="lab-word"]')].filter(el => { const r = el.getBoundingClientRect(); return r.width > 0 && r.bottom > 0 && r.top < innerHeight })
    return { paragraphs: [...new Set(words.map(el => Number(el.dataset.paragraphIndex)))], heading: document.querySelector('.lab-chapter-heading, [data-testid="lab-chapter-heading"]')?.textContent || '' }
  })
  ok('the normal reader opens on the paragraph heard', shown.paragraphs.includes(saved.paragraphIndex), { saved: { chapter: saved.chapterNumber, paragraph: saved.paragraphIndex }, shown })
  await page.screenshot({ path: path.join(output, '4-normal-reader.png') })
  await page.getByTestId('lab-v2-play').click()
  await page.waitForFunction(n => window.__narr.events.some(e => e.type === 'playing' && /audio-file/.test(e.src)) && document.querySelector('[data-testid="lab-v2-play"]'), ensuresBefore, { timeout: 30000 })
  const resumed = ensureLog[ensuresBefore]
  ok('its Play resumes in that chapter, on that page', resumed && resumed.chapter === saved.chapterNumber && resumed.paragraphs[0] <= saved.paragraphIndex && shown.paragraphs.includes(resumed.paragraphs[0]), { resumed, saved: saved.paragraphIndex })
  await page.getByTestId('lab-v2-play').click().catch(() => {})
} catch (error) {
  failures++
  console.log('FAIL', error.stack || String(error))
  await page.screenshot({ path: path.join(output, 'failure.png') }).catch(() => {})
} finally {
  ok('no page errors', errors.length === 0, errors)
  ok('nothing left this machine (no narration, no audio generation)', external.length === 0, [...new Set(external)])
  await browser.close().catch(() => {})
  server.close()
}
console.log(failures ? `\n${failures} failure(s)` : '\nMargin Listen checks passed.')
process.exit(failures ? 1 : 0)
