// Routed private PDF Original reader against a local built app. Every API and
// media response is synthetic; unexpected hosts and endpoints fail closed.
// PDF_ORIGINAL_DIST=dist node scripts/check-shared-reader-pdf-original.mjs
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { createServer } from 'node:http'
import fs from 'node:fs/promises'
import path from 'node:path'
import { chromium, webkit } from '@playwright/test'
import { markInternal } from './lib/internalTraffic.cjs'
import { makePdf } from '../../addbooks/web/test/make-pdf.mjs'

const dist = path.resolve(process.env.PDF_ORIGINAL_DIST || 'dist')
const bytes = makePdf({ pages: [
  { lines: [{ x: 72, y: 700, size: 20, text: 'First original page with selectable source words.' }] },
  { lines: [{ x: 72, y: 700, size: 20, text: 'Second original page has its own spoken words.' }] },
  { images: [{ x: 55, y: 120, w: 300, h: 500 }] },
], outline: [{ title: 'Chapter One', page: 1 }, { title: 'Scans', page: 3 }] })
const sha256 = createHash('sha256').update(bytes).digest('hex'), hex = sha256.slice(0, 24)
const fileId = 'd'.repeat(32), owner = 'pdf-original-fixture-owner'
const book = { id: fileId, type: 'pdf', sha256, name: 'Original source.pdf', title: 'Original source', author: 'Fixture', size: bytes.length,
  createdAt: '2026-10-23T00:00:00.000Z' }
const bundle = (await fs.readdir(path.join(dist, 'assets'))).find(name => /^supabase-.*\.js$/.test(name))
const ref = bundle && /https:\/\/([a-z0-9]+)\.supabase\.co/.exec(await fs.readFile(path.join(dist, 'assets', bundle), 'utf8'))?.[1]
assert(ref, 'built reader must include a synthetic Supabase project reference')
const authKey = `sb-${ref}-auth-token`
const mime = file => ({ '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json',
  '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.wasm': 'application/wasm' }[path.extname(file)] || 'application/octet-stream')
const server = createServer(async (req, res) => {
  const url = new URL(req.url || '/', 'http://127.0.0.1')
  if (url.pathname === '/qa-seed') { res.writeHead(200, { 'Content-Type': 'text/html' }); res.end('<!doctype html><title>PDF owner fixture</title>'); return }
  const file = path.resolve(dist, '.' + (url.pathname === '/reader' ? '/app.html' : url.pathname))
  if (!file.startsWith(dist + path.sep)) { res.writeHead(403); res.end(); return }
  try { const body = await fs.readFile(file); res.writeHead(200, { 'Content-Type': mime(file) }); res.end(body) }
  catch { res.writeHead(404); res.end() }
})
server.on('connect', (_req, socket) => socket.end('HTTP/1.1 403 Forbidden\r\n\r\n'))
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
const origin = `http://127.0.0.1:${server.address().port}`

async function run(name, browserType) {
  const browser = await markInternal(await browserType.launch({ headless: true, proxy: { server: origin },
    ...(name === 'chromium' ? { args: ['--mute-audio', '--no-sandbox'] } : {}) }))
  const context = await browser.newContext({ viewport: { width: 1100, height: 820 }, serviceWorkers: 'block', reducedMotion: 'reduce' })
  const page = await context.newPage(), denied = [], errors = [], calls = []
  let narrationReady = false
  const sets = { marks: { list: [], rev: 0 }, cards: { list: [], rev: 0 } }
  page.on('pageerror', error => errors.push(error.message))
  await page.route('**/*', route => {
    const request = route.request(), url = new URL(request.url()), p = url.pathname
    const json = (status, body) => route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) })
    if (url.hostname.endsWith('.supabase.co')) {
      if (p === '/auth/v1/user') return json(200, { id: owner, email: 'pdf@example.test', aud: 'authenticated' })
      if (p.startsWith('/rest/v1/')) return json(200, [])
      return json(404, {})
    }
    if (url.origin !== origin) { denied.push(url.origin); return route.abort() }
    if (!p.startsWith('/api/')) return route.continue()
    calls.push({ path: p, method: request.method(), body: request.postData() || '', bearer: request.headers().authorization?.startsWith('Bearer ') ?? false })
    if (p === '/api/public-books') return json(200, { books: [] })
    if (p === '/api/user-books') return json(200, { books: [book] })
    if (p === '/api/user-books/places') return json(200, { places: {} })
    if (p === `/api/user-books/${fileId}`) return route.fulfill({ contentType: 'application/pdf', body: bytes })
    if (p === `/api/user-books/marks/${hex}` || p === `/api/user-books/cards/${hex}`) {
      const name = p.includes('/marks/') ? 'marks' : 'cards', set = sets[name]
      if (request.method() === 'GET') return json(200, { [name]: set.list, rev: set.rev, fileId })
      const sent = request.postDataJSON()
      if (sent.expectedFileId !== fileId || sent.rev !== set.rev) return json(409, { [name]: set.list, rev: set.rev, fileId })
      set.list = sent[name]; set.rev++
      return json(200, { rev: set.rev, fileId })
    }
    if (/^\/api\/user-books\/(?:places|covers|primers)\//.test(p)) return json(200, { place: null, cover: null, primer: null })
    if (p === '/api/narration/voices') return json(200, { enabled: true, provider: 'grok', ownBooks: true,
      voices: [{ key: 'f', label: 'Ara', persona: 'female' }, { key: 'm', label: 'Helios', persona: 'male' }] })
    if (p === '/api/narration/own/ensure') {
      if (!narrationReady) return json(503, { error: 'Synthetic unavailable' })
      const input = request.postDataJSON()
      assert.equal(input.book, hex, 'only the owned narration route receives the private hex')
      return json(200, { paragraphs: input.paragraphs.map(({ index, text }) => {
        const words = text.trim().split(/\s+/).map((word, position, all) => ({ text: word, start: position * 2 / all.length, end: (position + 1) * 2 / all.length }))
        return { paragraph: index, status: 'ready', textHash: createHash('sha256').update(text.replace(/\s+/g, ' ').trim()).digest('hex'),
          chunkCount: 1, readyChunks: 1, duration: 2, words,
          chunks: [{ index: 0, wordFrom: 0, wordTo: words.length, ready: true, url: '/api/narration/own/audio?fixture=1',
            duration: 2, words }] }
      }) })
    }
    if (p === '/api/narration/own/audio') return route.fulfill({ contentType: 'audio/mpeg', body: Buffer.alloc(128) })
    if (p === '/api/chat') {
      const { companion } = request.postDataJSON()
      const text = companion?.intent === 'chapter'
        ? JSON.stringify({ gist: 'These printed pages introduce an original argument.', claims: ['The opening claim.', 'A second claim.', 'The source consequence.'],
          keepInMind: ['Watch the source wording.'], map: [{ title: 'Opening', pages: 'p. 1' }, { title: 'Development', pages: 'p. 2' }, { title: 'Scan', pages: 'p. 3' }] })
        : companion?.intent === 'define'
          ? JSON.stringify({ kind: 'place', name: 'source words', description: 'The terms printed on this original PDF page.' })
          : 'A grounded local fixture answer.'
      return json(200, { content: [{ text }], stop_reason: 'end_turn' })
    }
    return json(404, { error: 'fixture endpoint unavailable' })
  })
  await page.addInitScript(({ authKey, owner }) => {
    localStorage.setItem(authKey, JSON.stringify({ access_token: 'pdf-fixture', refresh_token: 'pdf-fixture', expires_in: 3600, expires_at: Math.floor(Date.now() / 1000) + 36000,
      token_type: 'bearer', user: { id: owner, email: 'pdf@example.test', aud: 'authenticated' } }))
    window.__speechCalls = 0
    if (window.speechSynthesis) for (const method of ['speak', 'getVoices']) {
      const original = window.speechSynthesis[method]?.bind(window.speechSynthesis)
      if (original) window.speechSynthesis[method] = (...args) => { window.__speechCalls++; return original(...args) }
    }
    window.__fakeAudio = []
    window.Audio = class extends EventTarget {
      constructor() { super(); this.src = ''; this.currentTime = 0; this.duration = 2; this.ended = false; this.paused = true;
        this.playbackRate = 1; this.preload = ''; this.error = null; window.__fakeAudio.push(this) }
      play() { this.paused = false; queueMicrotask(() => { this.dispatchEvent(new Event('play')); this.dispatchEvent(new Event('playing')) }); return Promise.resolve() }
      pause() { if (!this.paused) { this.paused = true; queueMicrotask(() => this.dispatchEvent(new Event('pause'))) } }
      load() {} setAttribute() {} removeAttribute(name) { if (name === 'src') this.src = '' }
    }
  }, { authKey, owner })
  try {
    await page.goto(`${origin}/qa-seed`)
    await page.evaluate(async ({ hex, owner, fileId, book, bytes }) => {
      const db = await new Promise((resolve, reject) => {
        const req = indexedDB.open('tinct-addbook', 1)
        req.onupgradeneeded = () => req.result.createObjectStore('books', { keyPath: 'key' })
        req.onerror = () => reject(req.error)
        req.onsuccess = () => resolve(req.result)
      })
      await new Promise((resolve, reject) => {
        const tx = db.transaction('books', 'readwrite')
        tx.objectStore('books').put({ key: `pdf:${hex}`, kind: 'pdf', owner, cloudId: fileId, name: book.name,
          title: book.title, author: book.author, bytes: new Uint8Array(bytes).buffer })
        tx.oncomplete = resolve; tx.onerror = () => reject(tx.error)
      })
      db.close()
    }, { hex, owner, fileId, book, bytes: [...bytes] })
    await page.goto(`${origin}/reader?userBook=${hex}&sharedReader=1&pages=1`, { waitUntil: 'domcontentloaded' })
    await page.locator('[data-pdf-original="true"] .pdf-original__text').getByText('First original page with selectable source words.').waitFor({ timeout: 45000 })
    assert.equal(await page.locator('[data-pdf-original="true"]').count(), 1)
    assert.equal(await page.locator('iframe[data-testid="margin-preview-frame"]').count(), 0)
    await page.waitForTimeout(1800)
    const opening = await page.evaluate(hex => ({ keys: Object.keys(localStorage).filter(key => key.includes(hex)),
      status: document.querySelector('.pdf-original-reader__status')?.textContent, owner:window.TinctAI?.session?.()?.userId }), hex)
    assert(opening.keys.some(key => key.startsWith('tinct-addbook:text-cards-canonical:')),
      `owner geometry initialized: ${JSON.stringify({ opening, calls: calls.filter(call => call.path.includes('user-books')), errors })}`)
    const text = page.locator('.pdf-original__text').getByText('First original page with selectable source words.')
    await text.evaluate(el => {
      const range = document.createRange(), selection = window.getSelection()
      range.selectNodeContents(el); selection.removeAllRanges(); selection.addRange(range)
      el.parentElement.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }))
    })
    await page.getByTestId('lab-dbar-highlight').click()
    await page.locator('.pdf-original__highlight').waitFor()
    for (let i = 0; i < 60 && !calls.some(call => call.path === `/api/user-books/marks/${hex}` && call.method === 'PUT'); i++)
      await page.waitForTimeout(100)
    const markPut = calls.find(call => call.path === `/api/user-books/marks/${hex}` && call.method === 'PUT')
    assert(markPut && JSON.parse(markPut.body).expectedFileId === fileId,
      `selection must sync to the owned PDF generation; set calls: ${JSON.stringify(calls.filter(call => /\/api\/user-books\/(marks|cards)\//.test(call.path)))}`)
    assert.equal(sets.marks.list.length, 1, 'the account copy holds the saved highlight')
    await page.evaluate(({ owner, fileId, hex }) => localStorage.removeItem(`tinct-addbook:pdf-original-marks:${owner}:${fileId}:${hex}`), { owner, fileId, hex })
    await page.reload({ waitUntil: 'domcontentloaded' })
    await page.locator('.pdf-original__highlight').waitFor({ timeout: 45000 })
    assert(calls.filter(call => call.path === `/api/user-books/marks/${hex}` && call.method === 'GET').length >= 2,
      'the reloaded reader fetched its cloud generation and repainted the highlight')
    await page.getByTestId('lab-super').click()
    await page.getByRole('button', { name: 'Primer · Chapter One' }).click()
    await page.getByText('These printed pages introduce an original argument.').waitFor()
    assert.equal(await page.getByText('Key claims').count(), 1, 'structured Primer is rendered as sections')
    assert.equal(await page.getByText('"gist"').count(), 0, 'raw Primer JSON is not displayed')
    await page.keyboard.press('Escape')
    await page.locator('.pdf-original__text').getByText('First original page with selectable source words.').evaluate(el => {
      const range = document.createRange(), selection = window.getSelection()
      range.selectNodeContents(el); selection.removeAllRanges(); selection.addRange(range)
      el.parentElement.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }))
    })
    await page.getByTestId('lab-dbar-more').click()
    await page.getByRole('menuitem', { name: 'Define' }).click()
    await page.getByText('The terms printed on this original PDF page.').waitFor()
    assert.equal(await page.getByText('"description"').count(), 0, 'raw Define JSON is not displayed')
    const companionCalls = calls.filter(call => call.path === '/api/chat').map(call => JSON.parse(call.body).companion)
    assert(companionCalls.some(call => call.intent === 'chapter' && call.context.bookTitle === book.title && call.context.bookAuthor === book.author),
      'unit Primer uses owned display metadata and private page context')
    assert(companionCalls.some(call => call.intent === 'define' && call.context.bookTitle === book.title && call.context.bookAuthor === book.author),
      'selection Define uses owned display metadata')
    await page.keyboard.press('Escape')
    await page.getByTestId('lab-super').click()
    await page.getByRole('button', { name: 'Listen', exact: true }).click()
    for (let i = 0; i < 30 && !calls.some(call => call.path === '/api/narration/own/ensure'); i++) await page.waitForTimeout(100)
    assert(calls.some(call => call.path === '/api/narration/own/ensure'), 'Grok own-book narration path was requested')
    narrationReady = true
    await page.getByTestId('lab-super').click()
    await page.getByRole('button', { name: 'Listen', exact: true }).click()
    await page.locator('.pdf-original__follow').waitFor({ timeout: 15000 })
    await page.evaluate(() => { const audio = window.__fakeAudio.find(item => !item.paused); if (audio) { audio.currentTime = .8; audio.dispatchEvent(new Event('timeupdate')) } })
    await page.locator('.pdf-original__follow').waitFor()
    await page.getByTestId('lab-super').click()
    await page.getByRole('button', { name: 'Audio settings' }).click()
    await page.getByLabel('Narration speed').selectOption('1.5')
    assert.equal(await page.getByLabel('Narration speed').inputValue(), '1.5')
    assert.equal(await page.evaluate(() => window.__speechCalls), 0, 'browser speech voice was not touched')
    await page.getByRole('button', { name: 'Close panel' }).click()
    await page.getByTestId('lab-super').click()
    await page.getByRole('button', { name: 'Talk', exact: true }).click()
    await page.getByTestId('pdf-original-talk').waitFor()
    await page.getByRole('button', { name: 'Start Talk' }).waitFor()
    assert.equal(calls.some(call => call.path === '/api/voice/session'), false, 'Talk does not start without a deliberate tap')
    await page.getByRole('button', { name: 'End Talk' }).click()
    await page.getByRole('button', { name: 'Contents', exact: true }).click()
    await page.locator('.pdf-original-reader__page-list button', { hasText: 'Page 2' }).click()
    await page.getByText('Second original page has its own spoken words.').waitFor()
    await page.getByRole('button', { name: 'Next PDF page' }).click()
    await page.getByText('Page 3 of 3').waitFor()
    assert.equal(await page.locator('.pdf-original__text span').count(), 0, 'scan remains viewable without invented prose')
    assert.deepEqual(errors, [], 'no uncaught reader error')
    assert.deepEqual(denied, [], 'no external request escaped the fixture')
    console.log(`${name}: routed owned PDF Original, geometry, audio failure, speed, Talk and scan passed`)
  } finally { await context.close(); await browser.close() }
}
try {
  await run('chromium', chromium)
  if (process.env.PDF_ORIGINAL_WEBKIT === '1') await run('webkit', webkit)
} finally { await new Promise(resolve => server.close(resolve)) }
