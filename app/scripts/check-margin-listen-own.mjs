#!/usr/bin/env node
// Read aloud for a reader's own book in the desktop margin reader (Anders, 22 Oct 2026: Tinct's voice for every book,
// never the browser's): /reader?userBook=<hex> on a desktop frames the margin reader (MarginOwnBook), whose player
// (useMarginListen with `own`) reads the frame's paragraphs through the own-book route, and js/tinct-listen.js draws
// Play, the transport and the word-by-word highlight. In a real browser against the built reader (dist/), with the
// app served under https://tinct.app by request interception and every narration request answered here:
// /api/narration/own/ensure from the paragraphs sent (narrationCore's chunks, even word timings) and each clip a
// synthetic MP3 tone (ffmpeg). Nothing leaves the machine; no narration is generated.
//
//   SKIP_ENV_CHECK=1 VITE_SUPABASE_URL=https://qa.supabase.co VITE_SUPABASE_ANON_KEY=qa npm run build
//   node scripts/check-margin-listen-own.mjs
//
// Per book (an own EPUB: make-epub.mjs makeNumberedEpub; an own PDF: prose_book.pdf) at 1440×900 and 1280×800:
// Play shows; it asks the own-book route (the book's hex, the text, signed in) from the paragraph at the top of the
// view; the clip plays; the highlight is the word the player is on and moves on with it; Pause stops the element and
// keeps the place; Play goes on from there; a reload opens at the place; Audio settings offers Tinct's voices (no
// device voice); no request but the own-book route and the account's carries the hex; speechSynthesis is never
// called, in either page. Then: not Premium (402) opens the account cards and plays nothing; the phone is unchanged.
import { chromium } from '@playwright/test'
import fs from 'node:fs/promises'
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { createHash } from 'node:crypto'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { build } from 'esbuild'
import { markInternal } from './lib/internalTraffic.cjs'
import { makeNumberedEpub } from '../../addbooks/web/test/make-epub.mjs'

const origin = 'https://tinct.app'
const root = process.cwd()
const dist = path.resolve(root, process.env.DIST || 'dist')
const output = path.join(root, 'artifacts', 'margin-listen-own')
const fixtures = path.join(output, 'fixtures')
await fs.mkdir(fixtures, { recursive: true })
if (!existsSync(path.join(dist, 'app.html'))) { console.error('dist/app.html missing: build first (see the header)'); process.exit(2) }
/** Fast clips (12 words a second at 1x) so a paragraph or two is heard in seconds. */
const WORDS_PER_SECOND = 12

let failures = 0
const ok = (label, pass, detail) => { if (!pass) failures++; console.log(`${pass ? 'ok  ' : 'FAIL'} ${label}${detail !== undefined ? ' ' + JSON.stringify(detail).slice(0, 500) : ''}`) }

const corePath = path.join(output, 'narrationCore.mjs')
await build({ entryPoints: [path.join(root, 'src/narration/narrationCore.ts')], bundle: true, format: 'esm', platform: 'node', outfile: corePath, logLevel: 'error' })
const core = await import(corePath + '?' + Date.now())

const tones = new Map()
async function tone(duration) {
  if (tones.has(duration)) return tones.get(duration)
  const file = path.join(fixtures, `tone-${duration}.mp3`)
  if (!existsSync(file)) await promisify(execFile)('ffmpeg', ['-v', 'error', '-y', '-f', 'lavfi', '-i', `sine=frequency=220:duration=${duration}:sample_rate=24000`, '-af', 'volume=0.2', '-ac', '1', '-ar', '24000', '-b:a', '64k', file])
  const bytes = await fs.readFile(file)
  tones.set(duration, bytes)
  return bytes
}
const sha = bytes => createHash('sha256').update(bytes).digest('hex')

const BOOKS = {
  epub: { kind: 'epub', name: 'span.epub', title: 'The Span of Accounts', bytes: makeNumberedEpub() },
  pdf: { kind: 'pdf', name: 'prose_book.pdf', title: 'prose_book', bytes: readFileSync(path.resolve(root, '../addbooks/web/test/pdf-fixtures/prose_book.pdf')) },
}
for (const b of Object.values(BOOKS)) { b.sha256 = sha(b.bytes); b.hex = b.sha256.slice(0, 24) }

/** Every page of the app from dist/, the account and the narration answered here; anything else refused. */
async function serve(context, { book, log, premium = true }) {
  const json = (route, status, body) => route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) })
  await context.route('**/*', async route => {
    const req = route.request(), url = new URL(req.url())
    log.requests.push({ url: req.url(), body: req.postData() || '' })
    if (url.hostname === 'qa.supabase.co') {
      if (url.pathname === '/auth/v1/user') return json(route, 200, { id: 'u-qa', aud: 'authenticated', email: 'reader@example.com' })
      return json(route, 200, [])
    }
    if (url.origin !== origin) return route.abort()
    const p = url.pathname
    if (p === '/qa-seed') return route.fulfill({ status: 200, contentType: 'text/html', body: '<!doctype html><title>seed</title>' })
    if (p === '/api/narration/voices') return json(route, 200, { enabled: true, provider: 'grok', model: 'mock', voices: [{ key: 'f', label: 'Ara', persona: 'female' }, { key: 'm', label: 'Helios', persona: 'male' }], ownBooks: true })
    if (p === '/api/narration/own/ensure') {
      const body = JSON.parse(req.postData() || '{}')
      log.ensures.push({ book: body.book, voice: body.voice, auth: req.headers().authorization, paragraphs: (body.paragraphs || []).map(x => ({ index: x.index, text: x.text })) })
      if (!premium) return json(route, 402, { error: 'Premium required', reason: 'premium_required' })
      const paragraphs = await Promise.all((body.paragraphs || []).map(async ({ index, text }) => {
        const tokens = core.narrationTokens(text)
        const chunks = core.chunkNarrationTokens(tokens).map(chunk => {
          const words = tokens.slice(chunk.wordFrom, chunk.wordTo)
          const duration = Math.max(1, Math.round((words.length / WORDS_PER_SECOND) * 2) / 2)
          const hash = sha(`${index}:${chunk.index}:${text}`)
          return { index: chunk.index, wordFrom: chunk.wordFrom, wordTo: chunk.wordTo, ready: true, hash, url: `/api/narration/own/audio?u=u-qa&b=${body.book}&h=${hash}&e=9999999999999&s=${'0'.repeat(64)}&d=${duration}`, duration, words: words.map((w, i) => ({ text: w, start: (i * duration) / words.length, end: ((i + 1) * duration) / words.length })), timingsUsable: true }
        })
        return { paragraph: index, status: 'ready', textHash: await core.sha256Hex(core.narrationTextForParagraph(text)), chunkCount: chunks.length, readyChunks: chunks.length, chunks, duration: chunks.reduce((s, c) => s + c.duration, 0), words: null }
      }))
      return json(route, 200, { voice: body.voice, model: 'mock', mode: body.mode, paragraphs })
    }
    if (p === '/api/narration/own/audio') {
      log.audio.push(url.search)
      const bytes = await tone(Number(url.searchParams.get('d')) || 2)
      const range = /^bytes=(\d*)-(\d*)$/.exec(req.headers().range || '')
      if (range && range[1]) {
        const start = Number(range[1]), end = range[2] ? Math.min(Number(range[2]), bytes.length - 1) : bytes.length - 1
        return route.fulfill({ status: 206, headers: { 'Content-Type': 'audio/mpeg', 'Accept-Ranges': 'bytes', 'Content-Range': `bytes ${start}-${end}/${bytes.length}` }, body: bytes.subarray(start, end + 1) })
      }
      return route.fulfill({ status: 200, headers: { 'Content-Type': 'audio/mpeg', 'Accept-Ranges': 'bytes' }, body: bytes })
    }
    if (p === '/api/user-books') return json(route, 200, { books: [{ id: book.sha256.slice(0, 32), name: book.name, title: book.title, author: '', type: book.kind, size: book.bytes.length, sha256: book.sha256, createdAt: new Date(0).toISOString(), cover: null }] })
    if (p === '/api/user-books/places') return json(route, 200, { places: {} })
    if (/^\/api\/user-books\/(places|covers)\//.test(p)) return json(route, 200, { place: null, cover: null })
    if (/^\/api\/user-books\/(marks|cards)\//.test(p)) return json(route, 200, { marks: [], cards: [], rev: 0 })
    if (p.startsWith('/api/user-books/primers/')) return json(route, 200, { primer: null })
    if (p === `/api/user-books/${book.sha256.slice(0, 32)}`) return route.fulfill({ status: 200, contentType: book.kind === 'pdf' ? 'application/pdf' : 'application/epub+zip', body: book.bytes })
    if (p.startsWith('/api/')) return json(route, 404, { error: 'Not found' })
    const pathname = p === '/reader' ? '/app.html' : p === '/lab/addbook/book' ? '/lab/addbook/book.html' : p
    const file = path.resolve(dist, `.${pathname}`)
    if (!file.startsWith(`${dist}/`)) return route.abort()
    try { if ((await fs.stat(file)).isFile()) return route.fulfill({ path: file }) } catch { /* not built */ }
    return route.fulfill({ status: 404, body: '' })
  })
}

/** In every page: speechSynthesis and SpeechSynthesisUtterance counted (they must never be used); the top page's audio watched. */
function spies() {
  window.__speech = 0
  try {
    const s = window.speechSynthesis
    if (s) for (const k of ['speak', 'cancel', 'pause', 'resume', 'getVoices']) { const f = s[k]?.bind(s); if (f) s[k] = (...a) => { window.__speech++; (window.__speechCalls ||= []).push(k); return f(...a) } }
    const U = window.SpeechSynthesisUtterance
    if (U) window.SpeechSynthesisUtterance = function (...a) { window.__speech++; (window.__speechCalls ||= []).push('utterance'); return new U(...a) }
  } catch { /* none in this browser */ }
  if (window.top !== window) return
  window.__narr = { events: [] }
  const seen = new WeakSet()
  const observe = audio => {
    if (seen.has(audio)) return
    seen.add(audio); window.__narr.audio = audio
    for (const type of ['playing', 'pause', 'ended', 'error']) audio.addEventListener(type, () => window.__narr.events.push({ type, t: Date.now(), src: audio.currentSrc || audio.src || '', time: audio.currentTime }))
  }
  const NativeAudio = window.Audio
  window.Audio = function (...a) { const audio = new NativeAudio(...a); observe(audio); return audio }
  window.Audio.prototype = NativeAudio.prototype
  const nativePlay = HTMLMediaElement.prototype.play
  HTMLMediaElement.prototype.play = function () { observe(this); return nativePlay.call(this) }
}

async function seed(page, book) {
  await page.goto(`${origin}/qa-seed`)
  await page.evaluate(async ({ hex, kind, name, title, bytes }) => {
    localStorage.setItem('sb-qa-auth-token', JSON.stringify({ access_token: 'qa', refresh_token: 'qa-refresh', token_type: 'bearer', expires_in: 3600, expires_at: Math.floor(Date.now() / 1000) + 36000, user: { id: 'u-qa', email: 'reader@example.com' } }))
    localStorage.setItem('tinct-lab-prefs', JSON.stringify({ theme: 'light', voicePersona: 'female', voicePersonaChosen: true, audiobookVoice: null, audioSpeed: 1 }))
    const db = await new Promise((resolve, reject) => {
      const request = indexedDB.open('tinct-addbook', 1)
      request.onupgradeneeded = () => request.result.createObjectStore('books', { keyPath: 'key' })
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
    await new Promise((resolve, reject) => {
      const tx = db.transaction('books', 'readwrite')
      tx.objectStore('books').put({ key: `${kind}:${hex}`, kind, name, title, owner: 'u-qa', bytes: new Uint8Array(bytes).buffer })
      tx.oncomplete = resolve
      tx.onerror = () => reject(tx.error)
    })
    db.close()
  }, { hex: book.hex, kind: book.kind, name: book.name, title: book.title, bytes: [...book.bytes] })
}

async function openFrame(page, book) {
  await page.goto(`${origin}/reader?userBook=${book.hex}`, { waitUntil: 'domcontentloaded' })
  const frame = await (await page.waitForSelector('iframe[data-testid="margin-preview-frame"]', { timeout: 45000 })).contentFrame()
  await frame.waitForFunction(() => window.TinctOwnListen?.ready() && document.querySelector('.lab.tb-can-listen'), null, { timeout: 60000 })
  if (book.kind === 'pdf') await frame.waitForFunction(() => document.querySelectorAll('.pdf-sheet .text-layer span').length > 20, null, { timeout: 30000 })
  await page.waitForTimeout(1500)
  return frame
}

/** The paragraph and word at the view's top, as tinct-listen finds it, and its text (what the first request must send). */
const expectedTop = frame => frame.evaluate(async () => {
  const O = window.TinctOwnListen, L = window.TinctBookListen, s = document.getElementById('scroll'), top = s.getBoundingClientRect().top + 1
  for (let n = O.pageAt(); n <= O.pageAt() + 2; n++) {
    const paras = await O.paragraphs(n)
    for (let i = 0; i < paras.length; i++) {
      const r = L.paraRange(paras[i]), q = r ? [...r.getClientRects()].filter(x => x.height > 0) : []
      if (q.length && q[q.length - 1].bottom > top) return { chapter: n, para: i, text: paras[i].text.replace(/\s+/g, ' ').trim() }
    }
  }
  return null
})
const framePlace = frame => frame.evaluate(() => { const p = currentPlace(); return { page: p.page, frac: Math.round(p.frac * 1000) / 1000 } })
/** What the player is on and what is highlighted. */
const sample = frame => frame.evaluate(async () => {
  const snap = window.parent.TinctMarginPreview.listen.snapshot()
  const hl = CSS.highlights.get('tinct-listen'), range = hl && [...hl][0]
  let expected = null
  if (snap.follow && snap.follow.wordIndex != null && snap.chapterNumber != null) {
    const paras = await window.TinctOwnListen.paragraphs(snap.chapterNumber), para = paras[snap.follow.paragraphIndex]
    expected = para ? [...para.text.matchAll(/\S+/g)].map(m => m[0])[snap.follow.wordIndex] ?? null : null
  }
  const r = range?.getBoundingClientRect(), s = document.getElementById('scroll').getBoundingClientRect()
  return { playing: snap.playing, status: snap.status, chapter: snap.chapterNumber, follow: snap.follow, word: range ? range.toString() : null, expected, inView: !!r && r.top >= s.top && r.bottom <= s.bottom }
})
// The player plays its recordings from blobs it fetched (the private links, log.audio): the element is playing.
const playingOwnAudio = page => page.waitForFunction(() => window.__narr.audio && !window.__narr.audio.paused, null, { timeout: 30000 })

async function runBook(browser, key, { width, height }) {
  const book = BOOKS[key], tag = `${key} ${width}×${height}`
  const log = { requests: [], ensures: [], audio: [] }
  const context = await browser.newContext({ viewport: { width, height }, serviceWorkers: 'block' })
  await serve(context, { book, log })
  await context.addInitScript(spies)
  const page = await context.newPage(), errors = []
  page.on('pageerror', e => errors.push(e.message))
  page.on('frameattached', f => { f.page()?.on?.('pageerror', () => {}) })
  await seed(page, book)
  let frame = await openFrame(page, book)
  const shown = await frame.evaluate(() => { const b = document.getElementById('playBtn'), r = b.getBoundingClientRect(); return { display: getComputedStyle(b).display, w: r.width, label: b.getAttribute('aria-label'), disabled: b.disabled } })
  ok(`${tag}: Play shows in the top bar`, shown.display !== 'none' && shown.w > 20 && !shown.disabled, shown)

  // Into the text: an EPUB to the middle of its first numbered chapter, a PDF to its second page.
  await frame.evaluate(kind => {
    const s = document.getElementById('scroll')
    if (kind === 'pdf') { goTo({ page: 2, frac: 0.15 }); return }
    const sheet = [...document.querySelectorAll('.epub-sheet')].find(x => /Span of Accounts/.test(x.textContent) && x.querySelectorAll('p').length > 8)
    const ps = [...sheet.querySelectorAll('p')], t = ps[Math.floor(ps.length / 2)]
    s.scrollTop += t.getBoundingClientRect().top - s.getBoundingClientRect().top - 120
  }, key)
  await page.waitForTimeout(1500)
  const expect = await expectedTop(frame), before = await framePlace(frame)
  await frame.click('#playBtn')
  await playingOwnAudio(page)
  const first = log.ensures[0]
  ok(`${tag}: Play asks the own-book route for the paragraph at the top of the view, with the hex, signed in`, first && first.book === book.hex && first.auth === 'Bearer qa' && first.voice === 'f'
    && first.paragraphs[0]?.index === expect?.para && first.paragraphs[0]?.text === expect?.text, { first: first && { ...first, paragraphs: first.paragraphs.map(p => ({ index: p.index, text: p.text.slice(0, 60) })) }, expect: expect && { ...expect, text: expect.text.slice(0, 60) } })
  // (Played from the link, or from a blob the player fetched; a link heard in an earlier run may come from the media cache.)
  const src = await page.evaluate(() => window.__narr.audio?.currentSrc || '')
  ok(`${tag}: the private recording is what plays`, log.audio.length > 0 || src.startsWith(`${origin}/api/narration/own/audio?`), { audio: log.audio.length, src: src.slice(0, 80) })
  ok(`${tag}: the top bar shows Pause while it plays`, await frame.evaluate(() => document.getElementById('playBtn').getAttribute('aria-label')) === 'Pause')

  const samples = []
  for (let i = 0; i < 16; i++) { await page.waitForTimeout(400); samples.push(await sample(frame)) }
  const painted = samples.filter(s => s.follow && s.follow.wordIndex != null)
  ok(`${tag}: the highlight is the word the player is on`, painted.length > 8 && painted.every(s => s.word && s.word === s.expected), painted.slice(0, 4))
  const order = painted.map(s => s.chapter * 1e6 + s.follow.paragraphIndex * 1000 + s.follow.wordIndex)
  ok(`${tag}: it moves on word by word with the audio, never back`, new Set(order).size >= 6 && order.every((v, i) => i === 0 || v >= order[i - 1]), order)
  ok(`${tag}: the word heard stays in view`, painted.every(s => s.inView), painted.filter(s => !s.inView).slice(0, 2))
  ok(`${tag}: starting did not move the page more than the first line`, Math.abs((await framePlace(frame)).page - before.page) <= 1, { before })
  await page.screenshot({ path: path.join(output, `${key}-${width}-playing.png`) })

  // Pause: the element stops, the word stays marked, the place holds.
  await frame.click('#playBtn')
  await page.waitForTimeout(500)
  const paused = await sample(frame), placePaused = await framePlace(frame)
  const elementPaused = await page.evaluate(() => window.__narr.audio.paused)
  await page.waitForTimeout(1500)
  const placeLater = await framePlace(frame)
  ok(`${tag}: Pause stops the audio, keeps the word marked and the place`, elementPaused && !paused.playing && paused.word && placeLater.page === placePaused.page && Math.abs(placeLater.frac - placePaused.frac) < 0.002, { paused, placePaused, placeLater })

  // Play again: on from the start of the sentence it paused in (the book reader's resume), and onwards.
  await frame.click('#playBtn')
  const again = await playingOwnAudio(page).then(() => true, () => false)
  await page.waitForTimeout(1200)
  const resumed = await sample(frame)
  const at = s => s.chapter * 1e6 + s.follow.paragraphIndex * 1000 + s.follow.wordIndex
  const diag = again ? null : await page.evaluate(() => ({ events: window.__narr.events.slice(-6), snap: window.TinctMarginPreview.listen.snapshot() }))
  ok(`${tag}: Play goes on from where it paused`, again && resumed.playing && resumed.follow && Math.abs(at(resumed) - at(paused)) < 1000 && resumed.follow.paragraphIndex >= paused.follow.paragraphIndex - 0, { paused: paused.follow, resumed: resumed.follow, diag })
  await frame.click('#playBtn')
  await page.waitForTimeout(1500)

  // Audio settings: Tinct's voices and speed, the book reader's own; no device voice.
  const beforeSettings = await framePlace(frame)
  const settings = await frame.evaluate(() => { openAudioSettings(); const sel = document.getElementById('voiceSel'), out = { voices: sel ? [...sel.options].map(o => o.textContent) : null, rate: !!document.getElementById('rateSel'), text: document.querySelector('.byob-settings, [data-layer="audio"]')?.textContent || '' }; document.querySelector('.lab-v2-dismiss')?.click(); return out })
  ok(`${tag}: Audio settings offers Tinct's voices and speed, no device voice`, settings.voices?.includes('Ara · Female') && settings.rate && !/device/i.test(settings.text), settings)
  const afterSettings = await framePlace(frame)
  ok(`${tag}: opening and closing Audio settings keeps the place`, afterSettings.page === beforeSettings.page && Math.abs(afterSettings.frac - beforeSettings.frac) < 0.002, { beforeSettings, afterSettings })

  // A reload opens at the place.
  const kept = await framePlace(frame)
  await page.reload({ waitUntil: 'domcontentloaded' })
  frame = await openFrame(page, book)
  const reopened = await framePlace(frame)
  ok(`${tag}: a reload opens at the place`, reopened.page === kept.page && Math.abs(reopened.frac - kept.frac) < 0.03, { kept, reopened })

  const speech = await Promise.all(page.frames().map(f => f.evaluate(() => ({ n: window.__speech || 0, calls: window.__speechCalls || [] })).catch(() => ({ n: 0, calls: [] }))))
  ok(`${tag}: speechSynthesis is never used, in either page`, speech.every(s => s.n === 0), speech)
  const leaks = log.requests.filter(r => (r.url.includes(book.hex) || r.body.includes(book.hex) || r.url.includes('userbook-') || r.body.includes('userbook-'))
    && !/\/api\/narration\/own\/(ensure|audio)/.test(r.url) && !/\/api\/user-books(\/|$)/.test(new URL(r.url).pathname) && !/[?&]userBook=/.test(r.url))
  ok(`${tag}: the hex reaches the own-book route and the account only`, leaks.length === 0, leaks.map(r => r.url))
  ok(`${tag}: no shared narration route`, !log.requests.some(r => /\/api\/narration\/(ensure|listen|chapter|prepare)\b/.test(r.url)))
  ok(`${tag}: no page errors`, errors.length === 0, errors)
  await context.close()
}

async function notPremium(browser) {
  const book = BOOKS.epub, log = { requests: [], ensures: [], audio: [] }
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, serviceWorkers: 'block' })
  await serve(context, { book, log, premium: false })
  await context.addInitScript(spies)
  const page = await context.newPage()
  const consoleLines = []
  page.on('console', m => consoleLines.push(m.text())); page.on('pageerror', e => consoleLines.push('pageerror ' + e.message))
  await seed(page, book)
  const frame = await openFrame(page, book)
  const before = await page.evaluate(() => document.body.children.length)
  await frame.click('#playBtn')
  await page.waitForFunction(() => document.querySelector('[class*="card"]:not(iframe)'), null, { timeout: 15000 }).catch(() => null)
  await page.waitForTimeout(1500)
  const after = await page.evaluate(() => ({ children: document.body.children.length, cards: document.querySelectorAll('[data-testid="account-cards"]').length }))
  const snap = await frame.evaluate(() => window.parent.TinctMarginPreview.listen.snapshot())
  ok('not Premium (402): the account cards open over the book and nothing plays', log.ensures.length > 0 && log.audio.length === 0 && !snap.playing && after.cards > 0, { ensures: log.ensures.length, before, after, status: snap.status, message: snap.message, console: consoleLines.filter(l => /QA-NARR|pageerror/.test(l)).slice(-5) })
  await page.screenshot({ path: path.join(output, 'not-premium.png') })
  await context.close()
}

async function phone(browser) {
  const book = BOOKS.epub, log = { requests: [], ensures: [], audio: [] }
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, serviceWorkers: 'block' })
  await serve(context, { book, log })
  await context.addInitScript(spies)
  const page = await context.newPage()
  await seed(page, book)
  await page.goto(`${origin}/reader?userBook=${book.hex}`, { waitUntil: 'domcontentloaded' })
  await page.waitForFunction(() => document.querySelector('[data-testid="lab-root"]')?.dataset.readerReady === 'true', null, { timeout: 45000 }).catch(() => null)
  const shape = await page.evaluate(() => ({ frame: !!document.querySelector('iframe[data-testid="margin-preview-frame"]'), reader: document.querySelector('[data-testid="lab-root"]')?.dataset.readerReady || null, path: location.pathname }))
  ok('390×844: the phone opens an own EPUB in its own reader, as before (no margin frame)', !shape.frame && shape.reader === 'true', shape)
  await page.screenshot({ path: path.join(output, 'phone.png') })
  await context.close()
}

const browser = await markInternal(await chromium.launch({ headless: true, args: ['--mute-audio', '--autoplay-policy=no-user-gesture-required'] }))
try {
  for (const key of (process.env.BOOKS ?? 'epub,pdf').split(',').filter(Boolean)) for (const size of [{ width: 1440, height: 900 }, { width: 1280, height: 800 }]) await runBook(browser, key, size)
  await notPremium(browser)
  await phone(browser)
} finally {
  await browser.close()
}
console.log(failures ? `\n${failures} failed` : '\nall passed')
process.exit(failures ? 1 : 0)
