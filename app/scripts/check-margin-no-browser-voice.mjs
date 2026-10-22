#!/usr/bin/env node
// The browser's own voice is never used in the margin reader (Anders, 22 Oct 2026: "I don't want to lose people trying
// voice in their own book and being unimpressed"; reader.js synth()). In a real browser against the built reader (dist/),
// served under https://tinct.app by request interception, every AI and narration request answered here:
//   an own EPUB and an own PDF (/reader?userBook=, the margin reader in its frame) and a Tinct book's margin view
//   (/reader?book=frankenstein&margin=1), at 1440×900: an own book has no Play, no audio dock and no Audio settings, and
//   Play called anyway does nothing; Chat with Talk on answers in text; speechSynthesis is never called, in either page.
//
//   SKIP_ENV_CHECK=1 VITE_SUPABASE_URL=https://qa.supabase.co VITE_SUPABASE_ANON_KEY=qa npm run build
//   node scripts/check-margin-no-browser-voice.mjs
import { chromium } from '@playwright/test'
import fs from 'node:fs/promises'
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { createHash } from 'node:crypto'
import { markInternal } from './lib/internalTraffic.cjs'
import { makeNumberedEpub } from '../../addbooks/web/test/make-epub.mjs'

const origin = 'https://tinct.app'
const root = process.cwd()
const dist = path.resolve(root, process.env.DIST || 'dist')
if (!existsSync(path.join(dist, 'app.html'))) { console.error('dist/app.html missing: build first (see the header)'); process.exit(2) }
const output = path.join(root, 'artifacts', 'margin-no-browser-voice')
await fs.mkdir(output, { recursive: true })
let failures = 0
const ok = (label, pass, detail) => { if (!pass) failures++; console.log(`${pass ? 'ok  ' : 'FAIL'} ${label}${detail !== undefined ? ' ' + JSON.stringify(detail).slice(0, 400) : ''}`) }
const sha = bytes => createHash('sha256').update(bytes).digest('hex')
const BOOKS = {
  epub: { kind: 'epub', name: 'span.epub', title: 'The Span of Accounts', bytes: makeNumberedEpub() },
  pdf: { kind: 'pdf', name: 'prose_book.pdf', title: 'prose_book', bytes: readFileSync(path.resolve(root, '../addbooks/web/test/pdf-fixtures/prose_book.pdf')) },
}
for (const b of Object.values(BOOKS)) { b.sha256 = sha(b.bytes); b.hex = b.sha256.slice(0, 24) }
const ANSWER = 'The chapter weighs accounts of the evening.'

async function serve(context, book) {
  const json = (route, status, body) => route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) })
  await context.route('**/*', async route => {
    const req = route.request(), url = new URL(req.url()), p = url.pathname
    if (url.hostname === 'qa.supabase.co') return url.pathname === '/auth/v1/user' ? json(route, 200, { id: 'u-qa', aud: 'authenticated', email: 'reader@example.com' }) : json(route, 200, [])
    if (url.origin !== origin) return route.abort()
    if (p === '/qa-seed') return route.fulfill({ status: 200, contentType: 'text/html', body: '<!doctype html><title>seed</title>' })
    if (p === '/api/chat' || p === '/api/lab-chat') {
      const sse = [['content_block_delta', { type: 'content_block_delta', delta: { type: 'text_delta', text: ANSWER } }], ['message_stop', { type: 'message_stop' }]]
      return route.fulfill({ status: 200, headers: { 'Content-Type': 'text/event-stream' }, body: sse.map(([e, d]) => `event: ${e}\ndata: ${JSON.stringify(d)}\n\n`).join('') })
    }
    if (p === '/api/narration/voices') return json(route, 200, { enabled: true, provider: 'grok', model: 'mock', voices: [{ key: 'f', label: 'Ara', persona: 'female' }], ownBooks: true })
    if (p === '/api/user-books') return json(route, 200, { books: book ? [{ id: book.sha256.slice(0, 32), name: book.name, title: book.title, author: '', type: book.kind, size: book.bytes.length, sha256: book.sha256, createdAt: new Date(0).toISOString(), cover: null }] : [] })
    if (p === '/api/user-books/places') return json(route, 200, { places: {} })
    if (/^\/api\/user-books\/(places|covers)\//.test(p)) return json(route, 200, { place: null, cover: null })
    if (/^\/api\/user-books\/(marks|cards)\//.test(p)) return json(route, 200, { marks: [], cards: [], rev: 0 })
    if (p.startsWith('/api/user-books/primers/')) return json(route, 200, { primer: null })
    if (book && p === `/api/user-books/${book.sha256.slice(0, 32)}`) return route.fulfill({ status: 200, body: book.bytes })
    if (p.startsWith('/api/')) return json(route, 404, { error: 'Not found' })
    const pathname = p === '/reader' ? '/app.html' : p === '/lab/addbook/book' ? '/lab/addbook/book.html' : p
    const file = path.resolve(dist, `.${pathname}`)
    if (!file.startsWith(`${dist}/`)) return route.abort()
    try { if ((await fs.stat(file)).isFile()) return route.fulfill({ path: file }) } catch { /* not built */ }
    return route.fulfill({ status: 404, body: '' })
  })
}
/** In every page: each use of speechSynthesis (its methods, a new utterance) is counted. */
function spies() {
  window.__speech = []
  try {
    const s = window.speechSynthesis
    if (s) for (const k of ['speak', 'cancel', 'pause', 'resume', 'getVoices']) { const f = s[k]?.bind(s); if (f) s[k] = (...a) => { window.__speech.push(k); return f(...a) } }
    const U = window.SpeechSynthesisUtterance
    if (U) window.SpeechSynthesisUtterance = function (...a) { window.__speech.push('utterance'); return new U(...a) }
  } catch { /* none here */ }
}
async function seed(page, book) {
  await page.goto(`${origin}/qa-seed`)
  await page.evaluate(async ({ hex, kind, name, title, bytes }) => {
    localStorage.setItem('sb-qa-auth-token', JSON.stringify({ access_token: 'qa', refresh_token: 'qa-refresh', token_type: 'bearer', expires_in: 3600, expires_at: Math.floor(Date.now() / 1000) + 36000, user: { id: 'u-qa', email: 'reader@example.com' } }))
    if (!hex) return
    const db = await new Promise((resolve, reject) => { const r = indexedDB.open('tinct-addbook', 1); r.onupgradeneeded = () => r.result.createObjectStore('books', { keyPath: 'key' }); r.onsuccess = () => resolve(r.result); r.onerror = () => reject(r.error) })
    await new Promise((resolve, reject) => { const tx = db.transaction('books', 'readwrite'); tx.objectStore('books').put({ key: `${kind}:${hex}`, kind, name, title, owner: 'u-qa', bytes: new Uint8Array(bytes).buffer }); tx.oncomplete = resolve; tx.onerror = () => reject(tx.error) })
    db.close()
  }, book ? { hex: book.hex, kind: book.kind, name: book.name, title: book.title, bytes: [...book.bytes] } : {})
}

async function run(browser, key) {
  const book = BOOKS[key] || null, tag = book ? `own ${key}` : 'Tinct book (frankenstein)'
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, serviceWorkers: 'block' })
  await serve(context, book)
  await context.addInitScript(spies)
  const page = await context.newPage(), errors = []
  page.on('pageerror', e => errors.push(e.message))
  await seed(page, book)
  await page.goto(book ? `${origin}/reader?userBook=${book.hex}` : `${origin}/reader?book=frankenstein&margin=1`, { waitUntil: 'domcontentloaded' })
  const frame = await (await page.waitForSelector('iframe[data-testid="margin-preview-frame"]', { timeout: 45000 })).contentFrame()
  await frame.waitForFunction(own => typeof state !== 'undefined' && state.pages.length > 2 && (own || !!state.preview), !!book, { timeout: 60000 })
  if (key === 'pdf') await frame.waitForFunction(() => document.querySelectorAll('.pdf-sheet .text-layer span').length > 20, null, { timeout: 30000 })
  await page.waitForTimeout(2500)
  if (book) {
    const play = await frame.evaluate(() => { const b = document.getElementById('playBtn'); return { display: getComputedStyle(b).display, w: b.getBoundingClientRect().width } })
    ok(`${tag}: no Play in the top bar`, play.display === 'none' || play.w === 0, play)
    await frame.evaluate(() => togglePlay())
    await page.waitForTimeout(400)
    ok(`${tag}: Play called anyway does nothing: no audio dock`, await frame.evaluate(() => !document.querySelector('.byob-transport')))
    await frame.click('#superBtn'); await frame.waitForSelector('.lab-super-panel')
    const rows = await frame.evaluate(() => [...document.querySelectorAll('.lab-super-panel > .lab-super-row')].map(r => r.dataset.row))
    ok(`${tag}: no Audio settings in the t menu`, !rows.includes('audio'), rows)
    await frame.evaluate(() => closeMenu())
  } else {
    const play = await frame.evaluate(() => { const b = document.getElementById('playBtn'); return { display: getComputedStyle(b).display, w: b.getBoundingClientRect().width, listen: document.querySelector('.lab').classList.contains('tb-can-listen') } })
    ok(`${tag}: Play is its own narration, as before`, play.listen && play.display !== 'none' && play.w > 0, play)
  }
  // Chat with Talk on (from the t menu's row): the answer comes in text.
  await frame.evaluate(() => { setTalk(true); openChat() })
  await page.waitForTimeout(300)
  await frame.evaluate(() => ask('What is this chapter about?'))
  const answered = await frame.waitForFunction(text => chat.turns.some(t => t.role === 'assistant' && t.content.includes(text)), ANSWER, { timeout: 15000 }).then(() => true, () => false)
  const note = await frame.evaluate(() => document.getElementById('chatNotice')?.textContent || '')
  ok(`${tag}: Chat with Talk on answers in text, and does not say answers are read aloud`, answered && !/read aloud/i.test(note), { answered, note })
  await page.screenshot({ path: path.join(output, `${key || 'tinct'}.png`) })
  await frame.evaluate(() => { setTalk(false); closeChat() })
  const speech = await Promise.all(page.frames().map(f => f.evaluate(() => window.__speech || []).catch(() => [])))
  ok(`${tag}: speechSynthesis is never called, in either page`, speech.every(s => s.length === 0), speech)
  ok(`${tag}: no page errors`, errors.length === 0, errors)
  await context.close()
}

const browser = await markInternal(await chromium.launch({ headless: true, args: ['--mute-audio'] }))
try { for (const key of ['epub', 'pdf', 'tinct']) await run(browser, key) } finally { await browser.close() }
console.log(failures ? `\n${failures} failed` : '\nall passed')
process.exit(failures ? 1 : 0)
