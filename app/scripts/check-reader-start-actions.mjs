#!/usr/bin/env node
// The reader's start actions (approved mockup, Anders 9 Nov 2026), against a built dist/ with every /api call mocked
// (no network, no AI), in isolated headless browsers with audio muted and no microphone:
//
//   cd app/scripts && PLAYWRIGHT_BROWSERS_PATH=... node check-reader-start-actions.mjs
//   (TINCT_DIST defaults to ../dist; ENGINES=chromium,webkit; OUT for screenshots)
//
// Phone 390×844 (Chromium and WebKit): under Frankenstein's title and author one soft pill (Primer · Summary ·
// Reading angle), under each chapter heading a lighter one (Primer · Summary · Quiz; no Summary on the book's first
// chapter); each segment opens its bottom card (the whole book's Summary has no "You are here" and asks the catch-up
// route without a place), Reading angle opens Book settings with its field focused, and the typed angle is saved per
// book and sent with the next AI request; the place and the first word's box are unchanged after every card and after
// Book settings. Desktop 1440 Margin (Chromium): the heading has no chips; "Before you start" sits beside the book's
// opening (reading angle with a mic, the whole book's Primer and Summary, the first chapter's Primer and Quiz me), a
// later chapter has a greyed (dashed) card with Primer · Summary · Quiz me; each action becomes a margin card there and
// the page does not move. A reader's own EPUB: the same on the phone and the desktop, with no whole-book Primer, and
// its whole-book Summary built by the own catch-up route.
import { createHash } from 'node:crypto'
import { createServer } from 'node:http'
import fs from 'node:fs/promises'
import path from 'node:path'
import { chromium, webkit, devices } from '@playwright/test'
import { markInternal } from './lib/internalTraffic.cjs'
import { zip } from '../../addbooks/web/test/make-epub.mjs'

const dist = path.resolve(process.env.TINCT_DIST || '../dist')
const OUT = path.resolve(process.env.OUT || '../artifacts/start-actions')
await fs.mkdir(OUT, { recursive: true })
const ENGINES = (process.env.ENGINES || 'chromium,webkit').split(',')
let failures = 0
const ok = (label, pass, detail) => { if (!pass) failures++; console.log(`${pass ? 'ok  ' : 'FAIL'} ${label}${!pass && detail !== undefined ? ' ' + JSON.stringify(detail).slice(0, 600) : ''}`) }

// A reader's own EPUB: three chapters.
const chapter = (title, n) => `<?xml version="1.0"?><html xmlns="http://www.w3.org/1999/xhtml"><head><title>${title}</title></head><body><h1>${title}</h1>${Array.from({ length: 14 }, (_, i) => `<p>${title}, paragraph ${i + 1}. The keeper of the lighthouse wrote down every ship that passed and every storm that came.</p>`).join('')}</body></html>`
const titles = ['The Lamp', 'The Storm', 'The Ship']
const bytes = zip([
  ['mimetype', 'application/epub+zip'],
  ['META-INF/container.xml', '<?xml version="1.0"?><container xmlns="urn:oasis:names:tc:opendocument:xmlns:container" version="1.0"><rootfiles><rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/></rootfiles></container>'],
  ['OEBPS/content.opf', `<?xml version="1.0"?><package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="id"><metadata xmlns:dc="http://purl.org/dc/elements/1.1/"><dc:identifier id="id">start-actions-own</dc:identifier><dc:title>The Lighthouse Log</dc:title><dc:creator>Local Author</dc:creator><dc:language>en</dc:language></metadata><manifest>${titles.map((_, i) => `<item id="c${i}" href="c${i}.xhtml" media-type="application/xhtml+xml"/>`).join('')}</manifest><spine>${titles.map((_, i) => `<itemref idref="c${i}"/>`).join('')}</spine></package>`],
  ...titles.map((title, i) => [`OEBPS/c${i}.xhtml`, chapter(title, i)]),
])
const sha256 = createHash('sha256').update(bytes).digest('hex'), hex = sha256.slice(0, 24), fileId = 'f'.repeat(32), owner = 'start-owner'
const supabaseBundle = (await fs.readdir(path.join(dist, 'assets'))).find(name => /^supabase-.*\.js$/.test(name))
const supabaseText = supabaseBundle ? await fs.readFile(path.join(dist, 'assets', supabaseBundle), 'utf8') : ''
const authKey = `sb-${/https:\/\/([a-z0-9]+)\.supabase\.co/.exec(supabaseText)?.[1] || 'local-only'}-auth-token`

const log = { ai: [], notes: [], catchUp: [], own: [] }
const sse = text => `data: ${JSON.stringify({ type: 'content_block_delta', delta: { type: 'text_delta', text } })}\n\ndata: {"type":"message_stop"}\n\n`
const mime = file => ({ '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.woff2': 'font/woff2', '.svg': 'image/svg+xml', '.png': 'image/png' }[path.extname(file)] || 'application/octet-stream')
const json = (res, code, data) => { res.writeHead(code, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }); res.end(JSON.stringify(data)) }
const body = async req => { let raw = ''; for await (const chunk of req) raw += chunk; try { return JSON.parse(raw || '{}') } catch { return {} } }
let origin = ''
const server = createServer(async (req, res) => {
  const url = new URL(req.url || '/', origin || 'http://127.0.0.1'), p = url.pathname, method = req.method || 'GET'
  if (p === '/qa-seed') { res.writeHead(200, { 'Content-Type': 'text/html' }); res.end('<!doctype html><title>seed</title>'); return }
  if (p.startsWith('/api/')) {
    if (/^\/api\/(lab-chat|chat)$/.test(p) && method === 'POST') {
      const request = await body(req), c = request.companion || {}
      log.ai.push({ intent: c.intent ?? 'chat', raw: JSON.stringify(request) })
      const text = c.intent === 'quiz' ? JSON.stringify({ questions: [1, 2, 3].map(i => ({ q: `MOCK question ${i}?`, answer: `Answer ${i}`, why: 'Because.', cite: '' })) }) : 'MOCK reply.'
      res.writeHead(200, { 'Content-Type': 'text/event-stream' }); res.end(sse(text)); return
    }
    if (p === '/api/lab-chapter-notes') { const request = await body(req); log.notes.push(request.kind); json(res, 200, { beats: [{ title: 'Where it begins', text: `MOCK ${request.kind} beat.` }, { title: 'Then', text: 'MOCK beat two.' }], kind: request.kind, chapterNumber: request.chapterNumber, through: null, source: 'model' }); return }
    if (p === '/api/lab-catch-up') { const request = await body(req); log.catchUp.push(request); json(res, 200, { summary: `MOCK summary of ${request.unitId}.`, unitId: request.unitId, title: request.unitId, chapters: [], complete: true, version: 'mock', source: 'model' }); return }
    if (p === '/api/own-catch-up') { if (method === 'POST') { const request = await body(req); log.own.push(request.chapter); json(res, 200, { recap: `MOCK recap through chapter ${request.chapter}.` }) } else json(res, 200, { steps: [], current: null }); return }
    if (p === '/api/public-books') { json(res, 200, { books: [] }); return }
    const book = { id: fileId, type: 'epub', sha256, name: 'lighthouse.epub', title: 'The Lighthouse Log', author: 'Local Author', size: bytes.length, createdAt: '2026-11-09T00:00:00.000Z' }
    if (p === '/api/user-books') { json(res, 200, { books: [book] }); return }
    if (p === `/api/user-books/${fileId}`) { res.writeHead(200, { 'Content-Type': 'application/epub+zip' }); res.end(bytes); return }
    if (p === '/api/user-books/places') { json(res, 200, { places: {} }); return }
    if (/^\/api\/user-books\/(marks|cards)\//.test(p)) { json(res, 200, { marks: [], cards: [], rev: 0, fileId }); return }
    if (/^\/api\/user-books\/(places|covers|primers)\//.test(p)) { json(res, 200, { place: null, cover: null, primer: null }); return }
    json(res, 404, { error: 'mock' }); return
  }
  const file = path.resolve(dist, '.' + (p === '/reader' ? '/app.html' : p))
  if (!file.startsWith(dist + path.sep)) { res.writeHead(403); res.end(); return }
  try { const data = await fs.readFile(file); res.writeHead(200, { 'Content-Type': mime(file) }); res.end(data) } catch { res.writeHead(404); res.end() }
})
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
origin = `http://127.0.0.1:${server.address().port}`

async function boot(engine, { phone, chapterNumber = 1, own = false }) {
  const browser = await markInternal(await engine.launch({ headless: true, args: engine === chromium ? ['--mute-audio'] : [] }))
  const context = await browser.newContext(phone ? { ...devices['iPhone 13'], viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, serviceWorkers: 'block' } : { viewport: { width: 1440, height: 1000 }, serviceWorkers: 'block', reducedMotion: 'reduce' })
  await context.route('**/*', route => new URL(route.request().url()).origin === origin ? route.continue() : route.abort())
  await context.addInitScript(({ chapterNumber, own }) => {
    localStorage.setItem('tinct:wipe-v1-done', '1')
    if (!own && !sessionStorage.getItem('qa:booted')) {
      sessionStorage.setItem('qa:booted', '1')
      sessionStorage.setItem('tinct:lab-reader-handoff', JSON.stringify({ kind: 'open-reader', bookId: 'frankenstein', primaryEditionKey: 'original-en', savedPlace: { bookId: 'frankenstein', chapterNumber, paragraphIndex: 0, wordIndex: 0, page: 0 } }))
    }
    HTMLMediaElement.prototype.play = async function () { this.muted = true }
    if (navigator.mediaDevices) Object.defineProperty(navigator.mediaDevices, 'getUserMedia', { configurable: true, value: async () => { throw Error('Microphone disabled during isolated acceptance') } })
  }, { chapterNumber, own })
  const page = await context.newPage()
  page.setDefaultTimeout(20000)
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  if (own) {
    await page.goto(`${origin}/qa-seed`)
    await page.evaluate(async ({ authKey, owner, hex, fileId, bytes }) => {
      localStorage.setItem(authKey, JSON.stringify({ access_token: 'start-token', refresh_token: 'r', expires_in: 3600, expires_at: Math.floor(Date.now() / 1000) + 36000, token_type: 'bearer', user: { id: owner, email: 'start@example.test', aud: 'authenticated' } }))
      document.cookie = 'tinct_auth=1; path=/; SameSite=Lax'
      await new Promise((resolve, reject) => {
        const open = indexedDB.open('tinct-addbook', 1)
        open.onupgradeneeded = () => { if (!open.result.objectStoreNames.contains('books')) open.result.createObjectStore('books', { keyPath: 'key' }) }
        open.onerror = () => reject(open.error)
        open.onsuccess = () => { const db = open.result, tx = db.transaction('books', 'readwrite'); tx.objectStore('books').put({ key: `epub:${hex}`, kind: 'epub', owner, cloudId: fileId, name: 'lighthouse.epub', title: 'The Lighthouse Log', author: 'Local Author', bytes: new Uint8Array(bytes).buffer }); tx.oncomplete = () => { db.close(); resolve() }; tx.onerror = () => reject(tx.error) }
      })
    }, { authKey, owner, hex, fileId, bytes: [...bytes] })
  }
  const search = own ? `?userBook=${hex}&sharedReader=1&layout=${phone ? 'phone' : 'desktop'}${phone ? '' : '&view=margin'}` : `?book=frankenstein&layout=${phone ? 'phone' : 'desktop'}${phone ? '' : '&view=margin'}`
  await page.goto(`${origin}/reader${search}`, { waitUntil: 'domcontentloaded' })
  await page.waitForFunction(() => document.querySelector('[data-testid="lab-root"]')?.dataset.readerReady === 'true', null, { timeout: 60000 })
  await page.evaluate(() => document.fonts.ready)
  await page.waitForTimeout(1200)
  return { browser, page, errors }
}

/** The place, the chapter, and the box of the first word in view: a moved page or a reflow changes one of them. */
const placeOf = page => page.evaluate(() => {
  const root = document.querySelector('[data-testid="lab-root"]')
  const host = document.querySelector('[data-testid="continuous-reader"]')
  const words = [...document.querySelectorAll('[data-testid="lab-page-wrap"] .lab-passage [data-testid="lab-word"], [data-testid="continuous-reader"] [data-testid="lab-word"]')]
  const word = words.find(node => { const r = node.getBoundingClientRect(); return r.height > 0 && r.bottom > 60 && r.top < innerHeight })
  const r = word?.getBoundingClientRect()
  return { chapter: root?.dataset.chapter, place: root?.dataset.place, word: word ? `${word.dataset.paragraphIndex}:${word.dataset.wordIndex}` : null, box: r ? [Math.round(r.left), Math.round(r.top)] : null, scroll: host ? Math.round(host.scrollTop) : null }
})
const same = (a, b) => a.chapter === b.chapter && a.place === b.place && a.word === b.word && JSON.stringify(a.box) === JSON.stringify(b.box) && a.scroll === b.scroll
const cardOf = page => page.evaluate(() => { const card = document.querySelector('[data-testid="lab-phone-card"]'); return card ? { kind: card.dataset.kind, label: card.getAttribute('aria-label'), text: card.textContent.replace(/\s+/g, ' ').trim().slice(0, 300) } : null })
async function tapOutside(page) {
  await page.evaluate(() => {
    const el = document.elementFromPoint(195, 140) || document.body
    const at = { clientX: 195, clientY: 140, bubbles: true, cancelable: true, pointerId: 11, pointerType: 'touch', isPrimary: true }
    el.dispatchEvent(new PointerEvent('pointerdown', at)); el.dispatchEvent(new PointerEvent('pointerup', at)); el.dispatchEvent(new MouseEvent('click', at))
  })
  await page.waitForTimeout(400)
}
const shot = async (page, name) => { await page.screenshot({ path: path.join(OUT, `${name}.png`) }); return name }
const pillText = (page, testId) => page.evaluate(id => [...document.querySelectorAll(`[data-testid="${id}"] .lab-start-seg`)].map(node => node.textContent.trim()), testId)

async function phoneCard(page, tag, testId, kind, home, check) {
  await page.getByTestId(testId).click()
  await page.getByTestId('lab-phone-card').waitFor()
  await page.waitForTimeout(700)
  const card = await cardOf(page)
  ok(`${tag}: ${testId} opens its card (${card?.label})`, !!card && card.kind === kind, card)
  if (check) await check(card)
  await shot(page, `${tag}-${testId}`)
  await tapOutside(page)
  const now = await placeOf(page)
  ok(`${tag}: ${testId}: closed, the place and the page are unchanged`, (await page.getByTestId('lab-phone-card').count()) === 0 && same(now, home), { now, home })
}

async function phoneCatalogue(engine) {
  const tag = `phone-${engine.name()}`
  let state = await boot(engine, { phone: true, chapterNumber: 1 })
  let page = state.page
  const home = await placeOf(page)
  ok(`${tag}: the book's pill under its title and author: Primer · Summary · Reading angle`, JSON.stringify(await pillText(page, 'lab-book-start')) === JSON.stringify(['Primer', 'Summary', 'Reading angle']), await pillText(page, 'lab-book-start'))
  ok(`${tag}: the first chapter's pill: Primer · Quiz (nothing to summarise yet)`, JSON.stringify(await pillText(page, 'lab-unit-start')) === JSON.stringify(['Primer', 'Quiz']), await pillText(page, 'lab-unit-start'))
  const layout = await page.evaluate(() => {
    const title = document.querySelector('[data-testid="lab-book-opening"] .lab-book-opening-title')?.getBoundingClientRect(), pill = document.querySelector('[data-testid="lab-book-start"]')?.getBoundingClientRect()
    const head = document.querySelector('[data-testid="lab-passage-headline"]')?.getBoundingClientRect(), unit = document.querySelector('[data-testid="lab-unit-start"]')?.getBoundingClientRect()
    const segs = [...document.querySelectorAll('[data-testid="lab-book-start"] .lab-start-seg span')].map(node => node.scrollWidth <= node.clientWidth + 1)
    return { order: !!(title && pill && head && unit) && title.bottom <= pill.top && pill.bottom <= head.top && head.bottom <= unit.top, full: pill && unit ? [Math.round(pill.width), Math.round(unit.width)] : null, written: segs.every(Boolean) }
  })
  ok(`${tag}: title, book pill, chapter heading, chapter pill in that order, both pills the text's full width, labels written out`, layout.order && layout.full?.[0] === layout.full?.[1] && layout.full[0] > 300 && layout.written, layout)
  await shot(page, `${tag}-book-start`)
  await phoneCard(page, tag, 'lab-book-primer', 'book-primer', home, async card => ok(`${tag}: the book's Primer is the book's introduction`, /Victor Frankenstein/.test(card.text), card))
  const before = log.catchUp.length
  await phoneCard(page, tag, 'lab-book-summary', 'book-summary', home, async () => {
    const entries = await page.getByTestId('lab-catch-up-entry').count(), here = await page.getByTestId('lab-catch-up-here').count()
    const asked = log.catchUp.slice(before)
    ok(`${tag}: the whole book's Summary: a timeline with no "You are here", asked without a place`, entries > 1 && here === 0 && asked.length > 0 && asked.every(request => request.placeChapter === undefined), { entries, here, asked: asked.slice(0, 2) })
  })
  // Reading angle: Book settings opens with the field focused at its top; the Edition rows stay below.
  await page.getByTestId('lab-book-angle').click()
  await page.getByTestId('lab-reading-angle').waitFor()
  await page.waitForTimeout(400)
  const sheet = await page.evaluate(() => ({ focused: document.activeElement?.getAttribute('data-testid'), layer: document.querySelector('[data-testid="lab-v2-sheet"]')?.dataset.layer, title: document.querySelector('[data-testid="lab-v2-sheet"] .lab-v2-title')?.textContent, first: document.querySelector('.lab-v2-editions > *')?.getAttribute('data-testid'), main: !!document.querySelector('[data-testid="lab-v2-main-edition"]') }))
  ok(`${tag}: Reading angle opens Book settings, its field first and focused, the Edition rows below`, sheet.focused === 'lab-reading-angle' && sheet.layer === 'editions' && sheet.first === 'lab-reading-angle-row' && sheet.main, sheet)
  await page.getByTestId('lab-reading-angle').fill('Watch who is listening to whom')
  await shot(page, `${tag}-book-settings-angle`)
  await page.getByTestId('lab-v2-sheet-close').click()
  await page.waitForTimeout(500)
  ok(`${tag}: the angle is saved for this book`, await page.evaluate(() => JSON.parse(localStorage.getItem('tinct:reading-angle:frankenstein') || 'null')) === 'Watch who is listening to whom')
  ok(`${tag}: Book settings closed, the place and the page are unchanged`, same(await placeOf(page), home), { now: await placeOf(page), home })
  const asked = log.ai.length
  await phoneCard(page, tag, 'lab-unit-start-quiz', 'quiz', home, async () => {
    await page.waitForTimeout(400)
    const quiz = log.ai.slice(asked).find(item => item.intent === 'quiz')
    ok(`${tag}: the chapter's Quiz asks the quiz route with the book's reading angle`, !!quiz && quiz.raw.includes('Watch who is listening to whom'), quiz?.raw.slice(0, 300))
  })
  await phoneCard(page, tag, 'lab-unit-primer', 'chapter-notes-primer', home)
  // The angle reopens with the value it was given (one stored value).
  await page.getByTestId('lab-book-angle').click()
  await page.getByTestId('lab-reading-angle').waitFor()
  ok(`${tag}: Book settings shows the saved angle`, await page.getByTestId('lab-reading-angle').inputValue() === 'Watch who is listening to whom')
  await page.getByTestId('lab-v2-sheet-close').click()
  ok(`${tag}: no page errors (chapter 1)`, state.errors.length === 0, state.errors)
  await state.browser.close()

  state = await boot(engine, { phone: true, chapterNumber: 5 })
  page = state.page
  const later = await placeOf(page)
  ok(`${tag}: a later chapter's pill: Primer · Summary · Quiz, and no book pill`, JSON.stringify(await pillText(page, 'lab-unit-start')) === JSON.stringify(['Primer', 'Summary', 'Quiz']) && (await page.getByTestId('lab-book-start').count()) === 0, await pillText(page, 'lab-unit-start'))
  ok(`${tag}: no heading chips beside the heading`, (await page.locator('.lab-passage-header .lab-chapter-preview').count()) === 0)
  await shot(page, `${tag}-chapter-start`)
  await phoneCard(page, tag, 'lab-unit-summary', 'catchup', later, async card => ok(`${tag}: a chapter's Summary at its start is what came before, named Summary`, /^Summary · /.test(card.label) && /You are here/.test(card.text), card))
  await phoneCard(page, tag, 'lab-unit-primer', 'chapter-notes-primer', later)
  ok(`${tag}: no page errors (chapter 5)`, state.errors.length === 0, state.errors)
  await state.browser.close()
}

async function phoneOwn(engine) {
  const tag = `phone-own-${engine.name()}`
  const state = await boot(engine, { phone: true, own: true })
  const page = state.page
  await page.getByTestId('lab-book-start').waitFor()
  const home = await placeOf(page)
  ok(`${tag}: an own book's pill under its opening: Summary · Reading angle (no book primer)`, JSON.stringify(await pillText(page, 'lab-book-start')) === JSON.stringify(['Summary', 'Reading angle']), await pillText(page, 'lab-book-start'))
  ok(`${tag}: its chapter pill: Primer · Summary · Quiz`, JSON.stringify(await pillText(page, 'lab-unit-start')) === JSON.stringify(['Primer', 'Summary', 'Quiz']), await pillText(page, 'lab-unit-start'))
  await shot(page, `${tag}-book-start`)
  const before = log.own.length
  await page.getByTestId('lab-book-summary').click()
  await page.getByTestId('lab-catch-up').waitFor()
  await page.waitForFunction(() => /MOCK recap/.test(document.querySelector('[data-testid="lab-catch-up"]')?.textContent || ''))
  const text = await page.getByTestId('lab-catch-up').innerText()
  ok(`${tag}: the whole book's Summary recaps every chapter as one entry ("The whole book")`, /The whole book/.test(text) && !/You are here/.test(text) && log.own.slice(before).length === 3, { text: text.slice(0, 200), steps: log.own.slice(before) })
  await shot(page, `${tag}-book-summary`)
  await page.getByTestId('lab-catch-up-close').click()
  await page.waitForTimeout(400)
  ok(`${tag}: closed, the place and the page are unchanged`, same(await placeOf(page), home), { now: await placeOf(page), home })
  await page.getByTestId('lab-book-angle').click()
  await page.getByTestId('lab-reading-angle').waitFor()
  ok(`${tag}: Reading angle opens Book settings with its field focused`, await page.evaluate(() => document.activeElement?.getAttribute('data-testid')) === 'lab-reading-angle')
  await page.getByTestId('lab-v2-sheet-close').click()
  await page.waitForTimeout(400)
  ok(`${tag}: Book settings closed, the place is unchanged`, same(await placeOf(page), home), { now: await placeOf(page), home })
  ok(`${tag}: no page errors`, state.errors.length === 0, state.errors)
  await state.browser.close()
}

const marginItem = (page, label) => page.locator('[data-testid="source-margin-item"]').filter({ has: page.locator('.source-margin-label', { hasText: label }) })
async function desktopAction(page, tag, testId, label, home) {
  await page.getByTestId(testId).click()
  await marginItem(page, label).first().waitFor()
  await page.waitForTimeout(800)
  const item = await marginItem(page, label).first().evaluate(node => ({ open: node.dataset.open, text: node.textContent.replace(/\s+/g, ' ').slice(0, 200) }))
  ok(`${tag}: ${testId} becomes an open margin card "${label}"`, item.open === 'true', item)
  await shot(page, `${tag}-${testId}`)
  const now = await placeOf(page)
  ok(`${tag}: ${testId}: the page does not move`, same(now, home), { now, home })
}

async function desktopCatalogue() {
  const tag = 'desktop'
  let state = await boot(chromium, { phone: false, chapterNumber: 1 })
  let page = state.page
  await page.getByTestId('margin-start-card').waitFor()
  const home = await placeOf(page)
  const card = await page.evaluate(() => {
    const item = document.querySelector('[data-testid="margin-start-card"]').closest('[data-testid="source-margin-item"]')
    const head = document.querySelector('[data-testid="continuous-reader"] [data-testid="lab-passage-headline"]').getBoundingClientRect(), box = item.getBoundingClientRect()
    return { label: item.querySelector('.source-margin-label')?.textContent, start: item.classList.contains('is-start'), beside: box.left > head.right && box.top < head.bottom + 160,
      acts: [...item.querySelectorAll('.lab-start-acts button')].map(node => node.textContent.trim()), heads: [...item.querySelectorAll('.lab-start-head')].map(node => node.textContent), mic: !!item.querySelector('[data-testid="margin-reading-angle-mic"]'),
      chips: document.querySelectorAll('[data-testid="continuous-reader"] .lab-passage-header :is(.lab-chapter-preview,.lab-start-pill)').length }
  })
  ok(`${tag}: "Before you start" beside the book's opening: angle with mic, the whole book's Primer · Summary, the first chapter's Primer · Quiz me; no chips by the heading`,
    card.label === 'Before you start' && card.start && card.beside && card.mic && card.chips === 0 && JSON.stringify(card.acts) === JSON.stringify(['✧Primer', '✧Summary', '✧Primer', '✧Quiz me']) && card.heads[0] === 'The whole book', card)
  await shot(page, `${tag}-before-you-start`)
  await page.getByTestId('margin-reading-angle').fill('The cost of ambition')
  await page.waitForTimeout(300)
  ok(`${tag}: the angle typed in the card is the book's one stored angle`, await page.evaluate(() => JSON.parse(localStorage.getItem('tinct:reading-angle:frankenstein') || 'null')) === 'The cost of ambition')
  ok(`${tag}: typing the angle leaves the page where it was`, same(await placeOf(page), home), { now: await placeOf(page), home })
  await page.getByTestId('margin-reading-angle').blur()
  await desktopAction(page, tag, 'margin-book-primer', 'Primer · Frankenstein', home)
  await desktopAction(page, tag, 'margin-book-summary', 'Summary · Frankenstein', home)
  ok(`${tag}: the whole book's Summary in the margin has its timeline`, (await marginItem(page, 'Summary · Frankenstein').locator('[data-testid="lab-catch-up-entry"]').count()) > 1)
  const asked = log.ai.length
  await page.getByTestId('margin-start-quiz').click()
  await page.waitForTimeout(1200)
  const quiz = log.ai.slice(asked).find(item => item.intent === 'quiz')
  ok(`${tag}: Quiz me from the start card asks the quiz with the angle, and its card sits at the chapter's start`, !!quiz && quiz.raw.includes('The cost of ambition') && await page.evaluate(() => {
    const quiz = [...document.querySelectorAll('[data-testid="source-margin-item"]')].find(node => /Quiz/.test(node.querySelector('.source-margin-label')?.textContent || ''))
    return !!quiz && quiz.getBoundingClientRect().top < innerHeight
  }))
  ok(`${tag}: Quiz me: the page does not move`, same(await placeOf(page), home), { now: await placeOf(page), home })
  await shot(page, `${tag}-quiz`)
  ok(`${tag}: no page errors (chapter 1)`, state.errors.length === 0, state.errors)
  await state.browser.close()

  state = await boot(chromium, { phone: false, chapterNumber: 5 })
  page = state.page
  await page.getByTestId('margin-start-card').waitFor()
  const later = await placeOf(page)
  const greyed = await page.evaluate(() => {
    const item = document.querySelector('[data-testid="margin-start-card"]').closest('[data-testid="source-margin-item"]')
    return { later: item.classList.contains('is-start-later'), dashed: getComputedStyle(item).borderLeftStyle, label: item.querySelector('.source-margin-label')?.textContent, acts: [...item.querySelectorAll('.lab-start-acts button')].map(node => node.textContent.trim()) }
  })
  ok(`${tag}: a later chapter's start: a greyed, dashed card with Primer · Summary · Quiz me`, greyed.later && greyed.dashed === 'dashed' && JSON.stringify(greyed.acts) === JSON.stringify(['✧Primer', '✧Summary', '✧Quiz me']), greyed)
  await shot(page, `${tag}-later-chapter`)
  await desktopAction(page, tag, 'margin-start-primer', 'Primer', later)
  await desktopAction(page, tag, 'margin-start-summary', 'Summary', later)
  // Minimised, a card folds to one muted line, as every margin card does.
  ok(`${tag}: opening Summary folds the Primer card to one line`, await marginItem(page, 'Primer').first().evaluate(node => node.dataset.open === 'false' && !!node.querySelector('.source-margin-preview')))
  await marginItem(page, 'Summary').first().getByTestId('source-margin-minimise').click()
  await page.waitForTimeout(300)
  ok(`${tag}: a minimised start action folds to one line`, await marginItem(page, 'Summary').first().evaluate(node => node.dataset.open === 'false' && !!node.querySelector('.source-margin-preview')))
  await shot(page, `${tag}-folded`)
  ok(`${tag}: minimising leaves the page where it was`, same(await placeOf(page), later), { now: await placeOf(page), later })
  ok(`${tag}: no page errors (chapter 5)`, state.errors.length === 0, state.errors)
  await state.browser.close()
}

async function desktopOwn() {
  const tag = 'desktop-own'
  const state = await boot(chromium, { phone: false, own: true })
  const page = state.page
  await page.getByTestId('margin-start-card').waitFor()
  const home = await placeOf(page)
  const acts = await page.evaluate(() => [...document.querySelectorAll('[data-testid="margin-start-card"] .lab-start-acts button')].map(node => node.textContent.trim()))
  ok(`${tag}: an own EPUB's "Before you start": the whole book's Summary (no primer), then the chapter's Primer · Summary · Quiz me`, JSON.stringify(acts) === JSON.stringify(['✧Summary', '✧Primer', '✧Summary', '✧Quiz me']), acts)
  await shot(page, `${tag}-before-you-start`)
  await desktopAction(page, tag, 'margin-book-summary', 'Summary · The Lighthouse Log', home)
  ok(`${tag}: no page errors`, state.errors.length === 0, state.errors)
  await state.browser.close()
}

try {
  for (const name of ENGINES) await phoneCatalogue(name === 'webkit' ? webkit : chromium)
  for (const name of ENGINES) await phoneOwn(name === 'webkit' ? webkit : chromium)
  await desktopCatalogue()
  await desktopOwn()
} catch (error) {
  failures++
  console.log('FAIL', error.stack || error.message)
} finally {
  server.close()
}
console.log(failures ? `${failures} failed` : 'all passed', `· screenshots in ${OUT}`)
process.exit(failures ? 1 : 0)
