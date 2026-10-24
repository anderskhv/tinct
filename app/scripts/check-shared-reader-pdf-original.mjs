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
const originalBytes = makePdf({ pages: [
  { lines: [{ x: 72, y: 700, size: 20, text: 'First original page with selectable source words.' }] },
  { lines: [{ x: 72, y: 700, size: 20, text: 'Second original page has its own spoken words.' }] },
  { images: [{ x: 55, y: 120, w: 300, h: 500 }] },
  { images: [{ x: 55, y: 120, w: 300, h: 500 }] },
], outline: [{ title: 'Chapter One', page: 1 }, { title: 'Scans', page: 3 }] })
const denseBytes = makePdf({ pages: [
  { lines: Array.from({ length: 80 }, (_, index) => ({ x: 72, y: 750 - index * 9, size: 8,
    text: `Dense original page line ${index + 1}. ${'source '.repeat(9)}` })) },
  { lines: [{ x: 72, y: 700, size: 20, text: 'End of dense original chapter.' }] },
  { images: [{ x: 55, y: 120, w: 300, h: 500 }] },
  { images: [{ x: 55, y: 120, w: 300, h: 500 }] },
], outline: [{ title: 'Chapter One', page: 1 }, { title: 'Scans', page: 3 }] })
const fileId = 'd'.repeat(32), owner = 'pdf-original-fixture-owner'
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

async function run(name, browserType, narrationSuccess = false, sourceBytes = originalBytes) {
  const bytes = sourceBytes, sha256 = createHash('sha256').update(bytes).digest('hex'), hex = sha256.slice(0, 24)
  const book = { id: fileId, type: 'pdf', sha256, name: 'Original source.pdf', title: 'Original source', author: 'Fixture', size: bytes.length,
    createdAt: '2026-10-23T00:00:00.000Z' }
  const browser = await markInternal(await browserType.launch({ headless: true, proxy: { server: origin },
    ...(name.startsWith('chromium') ? { args: ['--mute-audio', '--no-sandbox'] } : {}) }))
  const context = await browser.newContext({ viewport: { width: 1100, height: 820 }, serviceWorkers: 'block', reducedMotion: 'reduce' })
  const page = await context.newPage(), denied = [], errors = [], calls = []
  const finishOriginalPage = async number => page.locator('.pdf-original__scroll').evaluate((el, pageNumber) => {
    const sheet = el.querySelector(`.pdf-original__slot:nth-child(${pageNumber})`)
    if (!sheet) throw new Error(`original page ${pageNumber} has no continuous sheet`)
    el.scrollTop = sheet.offsetTop + sheet.clientHeight - el.clientHeight + 2
    el.dispatchEvent(new Event('scroll', { bubbles: true }))
  }, number)
  const narrationReady = narrationSuccess
  const visual = process.env.PDF_VISUAL_OUTPUT && name === 'chromium' ? path.resolve(process.env.PDF_VISUAL_OUTPUT) : null
  if (visual) await fs.mkdir(visual, { recursive: true })
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
    if (p === '/api/voice-session') return narrationSuccess
      ? json(200, { value: 'synthetic-ticket', model: 'grok-voice', relay: '/api/voice-relay' })
      : json(401, { error: 'Synthetic token expired' })
    if (p === '/api/voice-usage') return json(200, { ok: true })
    if (p === '/api/chat') {
      const { companion, messages } = request.postDataJSON()
      const text = companion?.intent === 'chapter'
        ? JSON.stringify({ gist: 'These printed pages introduce an original argument.', claims: ['The opening claim.', 'A second claim.', 'The source consequence.'],
          keepInMind: ['Watch the source wording.'], map: [{ title: 'Opening', pages: 'p. 1' }, { title: 'Development', pages: 'p. 2' }, { title: 'Scan', pages: 'p. 3' }] })
        : companion?.intent === 'quiz'
          ? JSON.stringify({ questions: [{ q: 'Which page has its own spoken words?', answer: 'Page 2' }] })
        : companion?.intent === 'define'
          ? JSON.stringify({ kind: 'place', name: 'source words', description: 'The terms printed on this original PDF page.' })
          : messages?.at(-1)?.content === 'What links these two pages?'
            ? 'The first printed page leads into the second original page.'
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
    const node = () => ({ connect() {}, disconnect() {} })
    window.AudioContext = class {
      constructor() { this.state = 'running'; this.sampleRate = 48000; this.destination = node() }
      resume() { this.state = 'running'; return Promise.resolve() }
      close() { this.state = 'closed'; return Promise.resolve() }
      createMediaStreamSource() { return node() }
      createGain() { return { ...node(), gain: { value: 1 } } }
      createScriptProcessor() { return { ...node(), onaudioprocess: null } }
    }
    Object.defineProperty(navigator, 'mediaDevices', { configurable: true, value: { getUserMedia: async () => ({
      getTracks: () => [{ stop() {}, readyState: 'live' }], getAudioTracks: () => [{ stop() {}, readyState: 'live' }],
    }) } })
    window.__voiceSockets = []
    window.WebSocket = class extends EventTarget {
      static OPEN = 1
      constructor(url, protocols) { super(); this.url = url; this.protocols = protocols; this.readyState = 1; this.sent = []
        window.__voiceSockets.push(this)
        queueMicrotask(() => { this.dispatchEvent(new Event('open')); this.emit({ type: 'session.created' }); this.emit({ type: 'session.updated' }) }) }
      send(value) { this.sent.push(JSON.parse(value)) }
      emit(event) { this.dispatchEvent(new MessageEvent('message', { data: JSON.stringify(event) })) }
      close() { this.readyState = 3; this.dispatchEvent(new Event('close')) }
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
    if (sourceBytes === denseBytes) {
      await page.locator('.pdf-original__text').getByText(/Dense original page/).first().waitFor({ timeout: 45000 })
      await page.getByRole('button', { name: 'Next PDF page' }).click()
      await page.getByText('End of dense original chapter.').waitFor()
      await finishOriginalPage(2)
      const after = page.getByRole('complementary', { name: 'After Chapter One' })
      await after.waitFor()
      const chatBefore = calls.filter(call => call.path === '/api/chat').length
      await after.getByRole('button', { name: 'Recap' }).click()
      await page.getByText('These pages contain more text than this action can safely send.').waitFor()
      assert.equal(calls.filter(call => call.path === '/api/chat').length, chatBefore, 'dense unit Recap sends no cropped source')
      await page.keyboard.press('Escape')
      await after.getByRole('button', { name: 'Quiz me' }).click()
      await page.getByText('These pages contain more text than this action can safely send.').waitFor()
      assert.equal(calls.filter(call => call.path === '/api/chat').length, chatBefore, 'dense unit Quiz sends no cropped source')
      assert.deepEqual(errors, [], 'no dense-unit reader errors')
      assert.deepEqual(denied, [], 'no dense-unit external requests')
      console.log(`${name}: dense multi-page unit Recap and Quiz rejected without provider calls`)
      return
    }
    await page.locator('[data-pdf-original="true"] .pdf-original__text').getByText('First original page with selectable source words.').waitFor({ timeout: 45000 })
    assert.equal(await page.locator('[data-pdf-original="true"]').count(), 1)
    assert.equal(await page.locator('iframe[data-testid="margin-preview-frame"]').count(), 0)
    if (!narrationSuccess) {
      await page.setViewportSize({ width: 2047, height: 1133 })
      const geometry = await page.evaluate(() => {
        const names = ['Contents', 'Notebook', 'Appearance', 'Listen', 'Menu']
        const controls = names.map(name => {
          const button = [...document.querySelectorAll('.pdf-original-reader .lab-header button')]
            .find(item => item.getAttribute('aria-label') === name || item.textContent?.trim() === name)
          const rect = button?.getBoundingClientRect(), hit = rect && document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2)
          return { name, rect: rect && { left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom },
            hit: !!button && (button === hit || button.contains(hit)) }
        })
        return { controls, width: document.querySelector('.pdf-original__page[data-page="1"]')?.getBoundingClientRect().width,
          canvases: document.querySelectorAll('.pdf-original__page canvas').length }
      })
      assert(geometry.controls.every(item => item.rect && item.rect.left >= 0 && item.rect.right <= 2047
        && item.rect.top >= 0 && item.rect.bottom <= 1133 && item.hit), `wide PDF header controls are direct targets: ${JSON.stringify(geometry)}`)
      assert(geometry.width > 0 && geometry.width <= 1500, `PDF sheet uses original capped width: ${JSON.stringify(geometry)}`)
      assert(geometry.canvases <= 3, `PDF source uses bounded canvases: ${JSON.stringify(geometry)}`)
      await page.locator('.pdf-original__scroll').evaluate(el => {
        const second = el.querySelector('.pdf-original__slot:nth-child(2)')
        el.scrollTop = second.offsetTop + second.clientHeight * .25
        el.dispatchEvent(new Event('scroll', { bubbles: true }))
      })
      await page.getByText('Page 2 of 4', { exact: true }).waitFor()
      await page.locator('.pdf-original__scroll').evaluate(el => { el.scrollTop = 0; el.dispatchEvent(new Event('scroll', { bubbles: true })) })
      await page.getByText('Page 1 of 4', { exact: true }).waitFor()
      await page.setViewportSize({ width: 1100, height: 820 })
    }
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
    if (name === 'chromium') {
      const sourceLine = () => page.locator('.pdf-original__page[data-page="1"] .pdf-original__text').getByText('First original page with selectable source words.')
      const selectSource = async () => sourceLine().evaluate(el => {
        const range = document.createRange(), selection = window.getSelection()
        range.selectNodeContents(el); selection.removeAllRanges(); selection.addRange(range)
        el.parentElement.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }))
      })
      const chooseAppearance = async theme => {
        const direct = page.getByRole('button', { name: 'Appearance', exact: true })
        if (await direct.isVisible()) await direct.click()
        else { await page.getByTestId('lab-super').click(); await page.getByRole('button', { name: 'Aa · Appearance', exact: true }).click() }
        await page.getByRole('radio', { name: { light: 'Light', book: 'Book', dark: 'Dark' }[theme], exact: true }).check()
        await page.getByRole('button', { name: 'Close panel' }).click()
      }
      for (const width of [1440, 1100]) for (const theme of ['light', 'book', 'dark']) {
        await page.setViewportSize({ width, height: 900 })
        await chooseAppearance(theme)
        await page.locator('.pdf-original__scroll').evaluate(el => { el.scrollTop = 0; el.dispatchEvent(new Event('scroll', { bubbles: true })) })
        await page.locator('.pdf-original__page[data-page="1"][data-ready="true"]').waitFor()
        await page.waitForTimeout(120)
        assert(await page.getByRole('slider', { name: 'Original PDF position' }).isVisible(), 'desktop PDF source minimap is visible')
        if (visual) await page.screenshot({ path: path.join(visual, `pdf-original-${width}-${theme}-source.png`) })
        await selectSource()
        if (theme === 'dark') assert.equal(await sourceLine().evaluate(el => getComputedStyle(el, '::selection').color), 'rgba(0, 0, 0, 0)',
          'native selected text stays transparent so the recolored PDF canvas remains legible')
        const bar = page.getByTestId('lab-desk-bar')
        await bar.waitFor()
        const beforeBar = await bar.boundingBox()
        await page.locator('.pdf-original__scroll').evaluate(el => { el.scrollTop += 40; el.dispatchEvent(new Event('scroll', { bubbles: true })) })
        await page.waitForTimeout(100)
        const afterBar = await bar.boundingBox()
        assert(beforeBar && afterBar && Math.abs((afterBar.y - beforeBar.y) + 40) < 2,
          `PDF selection toolbar follows source scroll at ${width}/${theme}: ${JSON.stringify({ beforeBar, afterBar })}`)
        const beforeCard = await page.locator('.pdf-original__scroll').evaluate(el => ({ scroll: el.scrollTop,
          width: el.querySelector('.pdf-original__page[data-page="1"]').getBoundingClientRect().width }))
        await page.getByTestId('lab-dbar-explain').click()
        const card = page.locator('.lab-desktop-card')
        await card.getByText('A grounded local fixture answer.').waitFor()
        assert.equal(await card.getByText('First original page with selectable source words.', { exact: true }).count(), 1,
          'a selected quote appears once rather than as both quote and initial User turn')
        const followHeight = await card.locator('.lab-pcard-follow-input').evaluate(el => el.getBoundingClientRect().height)
        assert(followHeight <= 48, `desktop follow-up starts as a compact field: ${followHeight}`)
        const cardBox = await card.boundingBox(), sheetBox = await page.locator('.pdf-original__page[data-page="1"]').boundingBox()
        const afterCard = await page.locator('.pdf-original__scroll').evaluate(el => ({ scroll: el.scrollTop,
          width: el.querySelector('.pdf-original__page[data-page="1"]').getBoundingClientRect().width }))
        assert.deepEqual(afterCard, beforeCard, 'opening a PDF card preserves source position and page breadth')
        assert(cardBox && sheetBox && cardBox.x >= sheetBox.x + sheetBox.width + 8 && cardBox.x + cardBox.width <= width - 15,
          `PDF desktop card owns the reserved right margin without source overlap: ${JSON.stringify({ width, theme, cardBox, sheetBox })}`)
        assert.equal(await page.locator('.lab-pcard-scrim').count(), 0, 'desktop PDF card has no phone scrim')
        if (visual) await page.screenshot({ path: path.join(visual, `pdf-original-${width}-${theme}-card.png`) })
        await page.keyboard.press('Escape')
        const map = page.getByRole('slider', { name: 'Original PDF position' })
        await map.focus(); await page.keyboard.press('ArrowDown')
        await page.getByText('Page 2 of 4', { exact: true }).waitFor()
        await page.keyboard.press('Home')
        await page.getByText('Page 1 of 4', { exact: true }).waitFor()
      }
      for (const theme of ['light', 'book', 'dark']) {
        await page.setViewportSize({ width: 390, height: 844 })
        await chooseAppearance(theme)
        await page.locator('.pdf-original__scroll').evaluate(el => { el.scrollTop = 0; el.dispatchEvent(new Event('scroll', { bubbles: true })) })
        await page.locator('.pdf-original__page[data-page="1"][data-ready="true"]').waitFor()
        assert.equal(await page.getByRole('slider', { name: 'Original PDF position' }).count(), 0, 'phone PDF has no desktop strip')
        const phoneHeader = await page.locator('.pdf-original-reader .lab-header').boundingBox()
        assert(phoneHeader && phoneHeader.height <= 60, `phone PDF header stays in one row: ${JSON.stringify(phoneHeader)}`)
        if (visual) await page.screenshot({ path: path.join(visual, `pdf-original-phone-${theme}-source.png`) })
        await selectSource()
        await page.getByTestId('lab-pbar-explain').click()
        await page.locator('.lab-pcard-dock').getByText('A grounded local fixture answer.').waitFor()
        assert.equal(await page.locator('.lab-desktop-card').count(), 0, 'phone keeps its bottom card')
        if (visual) await page.screenshot({ path: path.join(visual, `pdf-original-phone-${theme}-card.png`) })
        await page.keyboard.press('Escape')
      }
      await page.setViewportSize({ width: 1100, height: 820 })
      await chooseAppearance('light')
      console.log('chromium: PDF desktop 1440/1100 light/book/dark, source-anchored toolbar, stable page/card margin, minimap navigation and phone cards passed')
    }
    await page.getByTestId('lab-super').click()
    await page.getByRole('button', { name: 'Primer · Chapter One' }).click()
    await page.getByText('These printed pages introduce an original argument.').waitFor()
    if (visual) await page.screenshot({ path: path.join(visual, 'pdf-original-primer.png') })
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
    if (visual) await page.screenshot({ path: path.join(visual, 'pdf-original-define.png') })
    assert.equal(await page.getByText('"description"').count(), 0, 'raw Define JSON is not displayed')
    const companionCalls = calls.filter(call => call.path === '/api/chat').map(call => JSON.parse(call.body).companion)
    assert(companionCalls.some(call => call.intent === 'chapter' && call.context.bookTitle === book.title && call.context.bookAuthor === book.author),
      'unit Primer uses owned display metadata and private page context')
    assert(companionCalls.some(call => call.intent === 'define' && call.context.bookTitle === book.title && call.context.bookAuthor === book.author),
      'selection Define uses owned display metadata')
    await page.keyboard.press('Escape')
    await page.getByTestId('lab-super').click()
    await page.getByRole('dialog', { name: 'Reader menu' }).getByRole('button', { name: 'Listen', exact: true }).click()
    for (let i = 0; i < 30 && !calls.some(call => call.path === '/api/narration/own/ensure'); i++) await page.waitForTimeout(100)
    assert(calls.some(call => call.path === '/api/narration/own/ensure'), 'Grok own-book narration path was requested')
    if (narrationSuccess) {
      await page.locator('.pdf-original__follow').waitFor({ timeout: 15000 })
      await page.evaluate(() => { const audio = window.__fakeAudio.find(item => !item.paused); if (audio) { audio.currentTime = .8; audio.dispatchEvent(new Event('timeupdate')) } })
      await page.locator('.pdf-original__follow').waitFor()
      await page.evaluate(() => { const audio = window.__fakeAudio.find(item => !item.paused); if (audio) {
        audio.currentTime = audio.duration; audio.ended = true; audio.paused = true
        audio.dispatchEvent(new Event('pause')); audio.dispatchEvent(new Event('ended'))
      } })
      await page.getByText('Second original page has its own spoken words.').waitFor({ timeout: 15000 })
      await page.locator('.pdf-original__follow').waitFor({ timeout: 15000 })
      assert(calls.filter(call => call.path === '/api/narration/own/ensure').length >= 2, 'next page requests its own grounded narration')
    } else assert.equal(await page.locator('.pdf-original__follow').count(), 0, 'failed narration does not paint invented word timing')
    await page.getByTestId('lab-super').click()
    await page.getByRole('button', { name: 'Audio settings' }).click()
    await page.getByLabel('Narration speed').selectOption('1.5')
    assert.equal(await page.getByLabel('Narration speed').inputValue(), '1.5')
    if (narrationSuccess) await page.getByRole('button', { name: 'Pause', exact: true }).click()
    assert.equal(await page.evaluate(() => window.__speechCalls), 0, 'browser speech voice was not touched')
    await page.getByRole('button', { name: 'Close panel' }).click()
    await page.getByTestId('lab-super').click()
    await page.getByRole('button', { name: 'Talk', exact: true }).click()
    await page.getByTestId('pdf-original-talk').waitFor()
    await page.getByRole('button', { name: 'Start Talk' }).waitFor()
    assert.equal(calls.some(call => call.path === '/api/voice-session'), false, 'Talk does not start without a deliberate tap')
    await page.getByRole('button', { name: 'Start Talk' }).click()
    for (let i = 0; i < 40 && !calls.some(call => call.path === '/api/voice-session'); i++) await page.waitForTimeout(100)
    assert(calls.some(call => call.path === '/api/voice-session'), 'Talk starts only on the deliberate reader tap')
    if (narrationSuccess) {
      await page.waitForFunction(() => window.__voiceSockets[0]?.sent.some(item => item.type === 'session.update'))
      const session = await page.evaluate(() => ({ url: window.__voiceSockets[0].url,
        protocol: window.__voiceSockets[0].protocols[0], update: window.__voiceSockets[0].sent.find(item => item.type === 'session.update') }))
      assert(session.url.startsWith(origin.replace(/^http/, 'ws') + '/api/voice-relay'), 'synthetic Talk socket stays same-origin')
      assert.equal(session.protocol, 'tinct-ticket.synthetic-ticket')
      assert(session.update.session.instructions.includes(book.title) && session.update.session.instructions.includes(book.author), 'Talk uses owned display metadata')
      assert(session.update.session.instructions.includes('Second original page has its own spoken words.'), 'Talk receives only actual current page source text')
      assert(!session.update.session.instructions.includes(hex), 'private file hash is absent from the voice prompt')
      await page.evaluate(() => { const socket = window.__voiceSockets[0]
        socket.emit({ type: 'input_audio_buffer.speech_started' })
        socket.emit({ type: 'input_audio_buffer.speech_stopped' })
        socket.emit({ type: 'conversation.item.input_audio_transcription.completed', transcript: 'What is printed on this page?' })
        socket.emit({ type: 'response.created', response: { id: 'fixture-answer' } })
        socket.emit({ type: 'response.output_audio_transcript.delta', delta: 'The printed source has its own words.' })
        socket.emit({ type: 'response.done', response: { id: 'fixture-answer', status: 'completed' } })
      })
      await page.getByText('What is printed on this page?').waitFor()
      await page.getByText('The printed source has its own words.').waitFor()
    } else await page.getByText('Sign in to use Talk.').waitFor()
    await page.getByRole('button', { name: 'End Talk' }).click()
    if (narrationSuccess) {
      await page.reload({ waitUntil: 'domcontentloaded' })
      await page.getByText('Second original page has its own spoken words.').waitFor()
      await page.getByRole('button', { name: 'Notebook', exact: true }).click()
      await page.getByText('What is printed on this page?').waitFor()
      await page.getByText('The printed source has its own words.').waitFor()
      await page.getByText('Saved on this device').waitFor()
      await page.getByRole('button', { name: 'Close panel' }).click()
    }
    if (visual) {
      await page.getByRole('button', { name: 'Notebook', exact: true }).click()
      await page.getByText('These printed pages introduce an original argument.').waitFor()
      await page.screenshot({ path: path.join(visual, 'pdf-original-notebook.png') })
      await page.getByRole('button', { name: 'Close panel' }).click()
    }
    if (!narrationSuccess) {
      await page.getByRole('button', { name: 'Contents', exact: true }).click()
      await page.locator('.pdf-original-reader__page-list button', { hasText: 'Page 2' }).click()
    }
    await page.getByText('Second original page has its own spoken words.').waitFor()
    await finishOriginalPage(2)
    const after = page.getByRole('complementary', { name: 'After Chapter One' })
    await after.waitFor()
    await after.getByRole('button', { name: 'Recap' }).click()
    await page.getByText('A grounded local fixture answer.').waitFor()
    await page.getByText('Source · Original PDF pages 1–2').waitFor()
    const recapCall = calls.filter(call => call.path === '/api/chat').map(call => JSON.parse(call.body))
      .find(call => call.messages?.[0]?.content === 'Summarize Chapter One.')
    assert(recapCall, 'finished unit sends an actual Recap request')
    assert.deepEqual(recapCall.companion.context.pages, [
      { n: 1, text: 'First original page with selectable source words.' },
      { n: 2, text: 'Second original page has its own spoken words.' },
    ], 'Recap carries complete cited source pages 1 and 2, not only the current page')
    assert.equal(recapCall.companion.context.pageNumber, 2)
    for (let i = 0; i < 60 && !sets.cards.list.some(item => item.data?.action === 'recap' && item.data?.source?.to === 2); i++) await page.waitForTimeout(100)
    assert(sets.cards.list.some(item => item.data?.action === 'recap' && item.data?.source?.from === 1 && item.data?.source?.to === 2),
      'the account copy saves a multi-page source range')
    await page.reload({ waitUntil: 'domcontentloaded' })
    await page.getByText('Second original page has its own spoken words.').waitFor()
    await page.getByRole('button', { name: 'Notebook', exact: true }).click()
    const recapEntry = page.locator('.pdf-original-reader__saved').filter({ hasText: 'Summarize Chapter One.' }).first()
    await recapEntry.getByText('Source · Original PDF pages 1–2').waitFor()
    await recapEntry.getByRole('button', { name: 'Original PDF page 2 · recap' }).click()
    await page.getByLabel('Follow up').fill('What links these two pages?')
    const followBefore = calls.filter(call => call.path === '/api/chat').length
    await page.getByTestId('lab-phone-card-send').click()
    await page.getByText('The first printed page leads into the second original page.').waitFor()
    const followCalls = calls.filter(call => call.path === '/api/chat').slice(followBefore).map(call => JSON.parse(call.body))
    assert.equal(followCalls.length, 1, 'one saved-card follow-up request')
    assert.deepEqual(followCalls[0].companion.context.pages, recapCall.companion.context.pages,
      'saved multi-page follow-up rehydrates the full exact cited source')
    assert.deepEqual(followCalls[0].messages.map(turn => turn.content), [
      'Summarize Chapter One.', 'A grounded local fixture answer.', 'What links these two pages?',
    ], 'follow-up retains ordered saved context without dropping the original answer')
    await page.keyboard.press('Escape')
    await finishOriginalPage(2)
    await after.getByRole('button', { name: 'Quiz me' }).click()
    await page.getByTestId('lab-phone-quiz-question').getByText('Which page has its own spoken words?').waitFor()
    const quizCall = calls.filter(call => call.path === '/api/chat').map(call => JSON.parse(call.body)).find(call => call.companion?.intent === 'quiz')
    assert.deepEqual(quizCall?.companion.context.pages, recapCall.companion.context.pages, 'unit Quiz uses both exact pages')
    await page.getByTestId('lab-phone-quiz-show').click()
    await page.getByTestId('lab-phone-quiz-next').click()
    for (let i = 0; i < 60 && !sets.cards.list.some(item => item.data?.action === 'quiz' && item.data?.source?.to === 2); i++) await page.waitForTimeout(100)
    assert(sets.cards.list.some(item => item.data?.action === 'quiz' && item.data?.source?.from === 1 && item.data?.source?.to === 2),
      'completed Quiz saves one complete-unit card')
    await page.keyboard.press('Escape')
    await after.getByRole('button', { name: 'Note' }).click()
    await page.getByLabel('Your note on this section').fill('A thought about both printed pages.')
    await page.getByRole('button', { name: 'Save note' }).click()
    await page.getByText('A thought about both printed pages.').waitFor()
    for (let i = 0; i < 60 && !sets.cards.list.some(item => item.data?.action === 'note' && item.data?.source?.to === 2); i++) await page.waitForTimeout(100)
    assert(sets.cards.list.some(item => item.data?.action === 'note' && item.data?.source?.from === 1 && item.data?.source?.to === 2),
      'after-unit Note saves the complete source range')
    await page.reload({ waitUntil: 'domcontentloaded' })
    await page.getByText('Second original page has its own spoken words.').waitFor()
    await page.getByRole('button', { name: 'Notebook', exact: true }).click()
    for (const fragment of ['What links these two pages?', 'The first printed page leads into the second original page.',
      'Which page has its own spoken words?', 'A thought about both printed pages.'])
      await page.locator('.pdf-original-reader__notebook').getByText(fragment, { exact: false }).first().waitFor()
    assert((await page.locator('.pdf-original-reader__saved').filter({ hasText: 'Source · Original PDF pages 1–2' }).count()) >= 3,
      'Recap, Quiz and Note retain their complete page range after reload')
    await page.getByRole('button', { name: 'Close panel' }).click()
    // A saved card can predate a scan/recovery failure. The follow-up must
    // re-read every cited page before contacting a provider, never silently
    // treat the two surviving text pages as a complete three-page answer.
    const recap = sets.cards.list.find(item => item.data?.action === 'recap' && item.data?.source?.to === 2)
    assert(recap, 'a real saved Recap supplies the owned card shape')
    const missing = structuredClone(recap)
    missing.id = 'missingpagecard'
    missing.u = Date.now() + 10
    missing.data.unit.to = 3
    missing.data.source.to = 3
    missing.turns = [{ role: 'user', content: 'Summarize every page.' }, { role: 'assistant', content: 'Saved answer with missing page.' }]
    sets.cards.list.push(missing); sets.cards.rev++
    await page.reload({ waitUntil: 'domcontentloaded' })
    await page.getByText('Second original page has its own spoken words.').waitFor()
    await page.getByRole('button', { name: 'Notebook', exact: true }).click()
    const missingEntry = page.locator('.pdf-original-reader__saved').filter({ hasText: 'Saved answer with missing page.' })
    await missingEntry.getByRole('button', { name: 'Original PDF page 2 · recap' }).click()
    await page.getByLabel('Follow up').fill('What about the scanned page?')
    const missingBefore = calls.filter(call => call.path === '/api/chat').length
    await page.getByTestId('lab-phone-card-send').click()
    await page.getByText('The full source for this saved answer is unavailable. This follow-up was not sent.').waitFor()
    assert.equal(calls.filter(call => call.path === '/api/chat').length, missingBefore, 'missing cited page blocks provider call')
    assert.equal(missing.turns.length, 2, 'failed follow-up does not append an invented saved answer')
    await page.keyboard.press('Escape')
    await page.getByRole('button', { name: 'Next PDF page' }).click()
    await page.getByText('Page 3 of 4', { exact: true }).waitFor()
    assert.equal(await page.locator('.pdf-original__page[data-page="3"] .pdf-original__text span').count(), 0, 'scan remains viewable without invented prose')
    assert.deepEqual(errors, [], 'no uncaught reader error')
    assert.deepEqual(denied, [], 'no external request escaped the fixture')
    if (visual) await fs.rm(path.join(visual, 'pdf-original-failure.png'), { force: true })
    console.log(`${name}: routed PDF, full-page Recap/Quiz/Note, saved cited follow-up/Notebook, ${narrationSuccess ? 'page-follow and saved Talk turn' : 'audio and Talk token failures'}, speed and scan passed`)
  } catch (error) {
    if (visual) await page.screenshot({ path: path.join(visual, 'pdf-original-failure.png') }).catch(() => {})
    throw error
  } finally { await context.close(); await browser.close() }
}
try {
  await run('chromium', chromium)
  await run('chromium-success', chromium, true)
  await run('chromium-dense', chromium, false, denseBytes)
  if (process.env.PDF_ORIGINAL_WEBKIT === '1') {
    await run('webkit', webkit); await run('webkit-success', webkit, true)
    await run('webkit-dense', webkit, false, denseBytes)
  }
} finally { await new Promise(resolve => server.close(resolve)) }
