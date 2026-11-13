#!/usr/bin/env node
// Book scroll for a reader's own books (Anders, 13 Nov 2026: The Fabric of Reality, his own EPUB, opened one section
// at a time in the desktop Margin reader, "Dedication" then Next chapter; he expected one long scroll as in the
// library). In a real browser against a dev server, with the books seeded on this device as an admin (book scroll is
// an admin try-out on main) and every API answered here (no model is reached):
//
//   1. An own EPUB (front matter, 20 chapters, about 120,000 words) opens on the desktop as one continuous scroll of
//      every section ('book' gap), and wheel scrolling crosses sections, each becoming the reader's own in turn.
//   2. A highlight made in section 3 shows after a reload, in that section as the reader's own and as a neighbour.
//   3. A place saved at section 7 (paragraph and word) opens at that word, and survives a reload, a font-size
//      change and a window resize unchanged.
//   4. A pasted text (paste-text.js pasteEpub, as Paste text adds it) scrolls as one unit with no gap.
//   5. The phone stays one chapter.
//
//   VITE_SHARED_READER_DEFAULT=1 VITE_SUPABASE_URL=https://qa.supabase.co VITE_SUPABASE_ANON_KEY=qa npx vite --port 5310
//   TINCT_ORIGIN=http://127.0.0.1:5310 node scripts/check-own-book-scroll.mjs
import { chromium } from '@playwright/test'
import fs from 'node:fs/promises'
import path from 'node:path'
import { createHash } from 'node:crypto'
import { markInternal } from './lib/internalTraffic.cjs'
import { zip } from '../../addbooks/web/test/make-epub.mjs'

const origin = process.env.TINCT_ORIGIN || 'http://127.0.0.1:5310'
const output = path.resolve(process.env.TINCT_OUTPUT || 'artifacts/own-book-scroll')
await fs.mkdir(output, { recursive: true })
const USER = 'u-qa-admin'
let failures = 0
const ok = (label, pass, detail) => { if (!pass) failures++; console.log(`${pass ? 'ok  ' : 'FAIL'} ${label}${detail !== undefined ? ' ' + JSON.stringify(detail).slice(0, 400) : ''}`) }

/** A long nonfiction EPUB: front matter, 20 chapters of about 6,000 words, back matter. */
function longEpub() {
  const words = (n, seed) => Array.from({ length: n }, (_, i) => `${seed}${'abcdefghij'[i % 10]}${i % 13}`).join(' ')
  const sections = [
    ['dedication', 'Dedication', ['For the readers who scroll.']],
    ['about', 'About the Author', [`David Example is a physicist. ${words(80, 'bio')}.`]],
    ['preface', 'Preface', [`${words(300, 'pre')}.`]],
    ...Array.from({ length: 20 }, (_, i) => [`c${i + 1}`, `Chapter ${i + 1}`,
      Array.from({ length: 60 }, (_, p) => `${words(100, `c${i + 1}p${p}w`)}.`)]),
    ['biblio', 'Bibliography', [`${words(200, 'bib')}.`]],
  ]
  const xhtml = (title, paras) => `<?xml version="1.0"?><html xmlns="http://www.w3.org/1999/xhtml"><head><title>${title}</title></head><body><h1>${title}</h1>${paras.map(p => `<p>${p}</p>`).join('')}</body></html>`
  return zip([
    ['mimetype', 'application/epub+zip'],
    ['META-INF/container.xml', '<?xml version="1.0"?><container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container"><rootfiles><rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/></rootfiles></container>'],
    ['OEBPS/content.opf', `<?xml version="1.0"?><package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="id"><metadata xmlns:dc="http://purl.org/dc/elements/1.1/"><dc:identifier id="id">fabric-scroll-qa</dc:identifier><dc:title>The Fabric of Scrolling</dc:title><dc:creator>David Example</dc:creator><dc:language>en</dc:language></metadata><manifest><item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>${sections.map(([id]) => `<item id="${id}" href="${id}.xhtml" media-type="application/xhtml+xml"/>`).join('')}</manifest><spine>${sections.map(([id]) => `<itemref idref="${id}"/>`).join('')}</spine></package>`],
    ['OEBPS/nav.xhtml', `<?xml version="1.0"?><html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops"><body><nav epub:type="toc"><ol>${sections.map(([id, title]) => `<li><a href="${id}.xhtml">${title}</a></li>`).join('')}</ol></nav></body></html>`],
    ...sections.map(([id, title, paras]) => [`OEBPS/${id}.xhtml`, xhtml(title, paras), { deflate: true }]),
  ])
}
const epub = longEpub()
const hex = createHash('sha256').update(epub).digest('hex').slice(0, 24)

// The reader's account, answered here: each book's private copy, its marks and its cards (one generation, fileId).
const account = new Map()
let explains = 0
const keep = (bookHex, sha, title) => { if (!account.has(bookHex)) account.set(bookHex, { fileId: sha.slice(32, 64), sha, title, marks: [], rev: 0, cards: [], cardsRev: 0, puts: 0 }) }
keep(hex, createHash('sha256').update(epub).digest('hex'), 'The Fabric of Scrolling')
async function answer(route) {
  const req = route.request(), url = new URL(req.url())
  const json = (status, body) => route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) })
  if (url.hostname.endsWith('.supabase.co')) {
    if (url.pathname === '/auth/v1/user') return json(200, { id: USER, aud: 'authenticated', email: 'reader@example.com' })
    return json(200, [])
  }
  if (url.origin !== origin) return route.abort()
  const p = url.pathname, method = req.method()
  if (p === '/api/user-books' && method === 'GET') return json(200, { books: [...account.values()].map(book => ({ id: book.fileId, type: 'epub', sha256: book.sha, name: `${book.title}.epub`, title: book.title, author: '', size: 1, createdAt: '2026-11-13T00:00:00.000Z' })) })
  const marks = /^\/api\/user-books\/marks\/([0-9a-f]{24})$/.exec(p), cards = /^\/api\/user-books\/cards\/([0-9a-f]{24})$/.exec(p)
  const book = account.get((marks ?? cards)?.[1])
  if (marks && book) {
    if (method === 'GET') return json(200, { marks: book.marks, rev: book.rev, fileId: book.fileId })
    const body = JSON.parse(req.postData() || '{}')
    if (body.rev !== book.rev || (body.expectedFileId && body.expectedFileId !== book.fileId)) return json(409, { marks: book.marks, rev: book.rev, fileId: book.fileId })
    book.marks = body.marks; book.rev += 1; book.puts += 1
    return json(200, { rev: book.rev, fileId: book.fileId })
  }
  if (cards && book) {
    if (method === 'GET') return json(200, { cards: book.cards, rev: book.cardsRev, fileId: book.fileId })
    const body = JSON.parse(req.postData() || '{}')
    if (body.rev !== book.cardsRev) return json(409, { cards: book.cards, rev: book.cardsRev, fileId: book.fileId })
    book.cards = body.cards ?? book.cards; book.cardsRev += 1
    return json(200, { rev: book.cardsRev, fileId: book.fileId })
  }
  if (p === '/api/chat' || p === '/api/lab-chat') {
    const answer = `**Lead line ${++explains} of this explanation.** A body sentence about the passage.`
    return route.fulfill({ status: 200, contentType: 'text/event-stream', body: `event: content_block_delta\ndata: ${JSON.stringify({ type: 'content_block_delta', index: 0, delta: { type: 'text_delta', text: answer } })}\n\nevent: message_stop\ndata: {"type":"message_stop"}\n\n` })
  }
  if (p === '/api/own-catch-up') {
    if (method === 'GET') return json(200, { steps: [], current: null })
    const body = JSON.parse(req.postData() || '{}')
    return json(200, { recap: 'So far the book has argued that explanation is the point.', chapter: body.chapter, complete: body.complete, cached: false })
  }
  if (p === '/api/user-books/places') return json(200, { places: {} })
  if (p.startsWith('/api/')) return json(404, {})
  return route.continue()
}

const browser = await markInternal(await chromium.launch({ headless: true }))
const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, serviceWorkers: 'block', reducedMotion: 'reduce' })
await context.route('**/*', answer)
// Signed in, a site admin (the cached answer the reader reads at first paint), on every load.
function signIn({ user, supabaseKey }) {
  const session = JSON.stringify({ access_token: 'qa', refresh_token: 'qa-refresh', token_type: 'bearer', expires_in: 3600, expires_at: Math.floor(Date.now() / 1000) + 36000, user: { id: user, email: 'reader@example.com' } })
  // The dev server's client (VITE_SUPABASE_URL=https://qa.supabase.co) and a built bundle's (TINCT_SUPABASE_KEY).
  for (const key of ['sb-qa-auth-token', supabaseKey]) if (key) localStorage.setItem(key, session)
  localStorage.setItem('tinct-site-admin', user)
  if (!localStorage.getItem('tinct-lab-prefs')) localStorage.setItem('tinct-lab-prefs', JSON.stringify({ theme: 'book' }))
}
await context.addInitScript(signIn, { user: USER, supabaseKey: process.env.TINCT_SUPABASE_KEY || '' })
const page = await context.newPage(), errors = []
page.on('pageerror', error => errors.push(error.message))

/** Keep an EPUB's bytes on this device as Add a book does (IndexedDB `tinct-addbook`). */
async function seed(key, bytes, title, on = page) {
  const fileId = account.get(key.slice(5))?.fileId
  await on.evaluate(async ({ key, bytes, title, user, fileId }) => {
    const db = await new Promise((resolve, reject) => {
      const request = indexedDB.open('tinct-addbook', 1)
      request.onupgradeneeded = () => request.result.createObjectStore('books', { keyPath: 'key' })
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
    await new Promise((resolve, reject) => {
      const tx = db.transaction('books', 'readwrite')
      tx.objectStore('books').put({ key, kind: 'epub', name: `${title}.epub`, title, owner: user, cloudId: fileId, bytes: new Uint8Array(bytes).buffer })
      tx.oncomplete = resolve
      tx.onerror = () => reject(tx.error)
    })
    db.close()
  }, { key, bytes: [...bytes], title, user: USER, fileId })
}
const ready = () => page.waitForFunction(() => document.querySelector('.lab')?.dataset.readerReady === 'true', null, { timeout: 90000 })
const openBook = async (bookHex) => {
  await page.goto(`${origin}/reader?userBook=${bookHex}`, { waitUntil: 'domcontentloaded' })
  await ready()
  await page.waitForTimeout(1500)
}
const own = () => page.evaluate(() => Number(document.querySelector('.lab')?.dataset.chapter))
const savedPlace = (bookHex) => page.evaluate(h => JSON.parse(localStorage.getItem(`tinct-addbook:place:${h}`) || 'null'), bookHex)
const unit = () => page.evaluate(() => {
  const node = document.querySelector('[data-book-scroll-unit]')
  return node ? { key: node.getAttribute('data-book-scroll-unit'), gap: node.getAttribute('data-book-scroll-gap'),
    chapters: [...node.querySelectorAll('[data-book-scroll-chapter]')].map(item => Number(item.getAttribute('data-book-scroll-chapter'))),
    painted: [...node.querySelectorAll('[data-book-scroll-painted="true"]')].map(item => Number(item.getAttribute('data-book-scroll-chapter'))) } : null
})
/** Where a place's word stands: its chapter is the reader's own, and its px from the reading line (null: not painted). */
const placeOnScreen = (place) => page.evaluate(place => {
  const host = document.querySelector('[data-book-scroll-unit]')
  const word = host?.querySelector(`.book-scroll-chapter.is-own[data-book-scroll-chapter="${place.chapterNumber}"] [data-testid="lab-word"][data-paragraph-index="${place.paragraphIndex}"][data-word-index="${place.wordIndex}"]`)
  if (!word) return null
  const line = host.getBoundingClientRect().top + Math.min(host.clientHeight * .24, 140)
  return { fromLine: Math.round(word.getBoundingClientRect().top - line), reader: document.querySelector('.lab')?.dataset.place, chapter: Number(document.querySelector('.lab')?.dataset.chapter) }
}, place)
const samePlace = (a, b) => !!a && !!b && a.chapterNumber === b.chapterNumber && a.paragraphIndex === b.paragraphIndex && a.wordIndex === b.wordIndex
/** A section's heading in view, for a screenshot of the join between two sections. */
const showJoin = async (chapter, file) => {
  await page.evaluate(chapter => {
    const host = document.querySelector('[data-book-scroll-unit]'), block = host?.querySelector(`[data-book-scroll-chapter="${chapter}"]`)
    if (host && block) host.scrollTop += block.getBoundingClientRect().top - host.getBoundingClientRect().top - 380
  }, chapter)
  await page.waitForTimeout(800)
  await page.screenshot({ path: path.join(output, file) })
}
const wheelUntil = async (dy, done, pause = 90, steps = 160) => {
  await page.locator('[data-book-scroll-unit]').hover({ position: { x: 400, y: 450 } })
  for (let step = 0; step < steps && !(await done()); step++) { await page.mouse.wheel(0, dy); await page.waitForTimeout(pause) }
  await page.waitForTimeout(1200)
  return done()
}

try {
  await page.goto(`${origin}/`)
  await seed(`epub:${hex}`, epub, 'The Fabric of Scrolling')

  // 1. One continuous scroll across the sections.
  const openedAt = Date.now()
  await page.goto(`${origin}/reader?userBook=${hex}`, { waitUntil: 'domcontentloaded' })
  await ready()
  const openMs = Date.now() - openedAt
  await page.waitForTimeout(1500)
  await page.evaluate(() => { window.__longTasks = []; new PerformanceObserver(list => { for (const entry of list.getEntries()) window.__longTasks.push(Math.round(entry.duration)) }).observe({ type: 'longtask', buffered: false }) })
  const opened = await unit()
  const chapters = opened?.chapters ?? []
  ok('desktop: an own EPUB opens as one book scroll of every section', !!opened && opened.key === `userbook-${hex}/book` && opened.gap === 'book' && chapters.length >= 23, opened && { key: opened.key, gap: opened.gap, sections: chapters.length })
  await page.screenshot({ path: path.join(output, 'desktop-open.png') })
  const start = await own()
  const seen = new Set([start])
  await wheelUntil(500, async () => { seen.add(await own()); return seen.size >= 4 })
  ok('desktop: scrolling crosses sections, each becoming the reader\'s own', seen.size >= 4 && chapters.indexOf(await own()) > chapters.indexOf(start), { seen: [...seen] })
  const longTasks = await page.evaluate(() => window.__longTasks.slice().sort((a, b) => b - a))
  // The longest main-thread tasks while wheel-scrolling across sections. Far sections are placeholders and a section is
  // painted only near the screen; the handoff at a section line re-renders two whole sections, about 0.5 s for these
  // 6,000-word sections on a built bundle (13 Nov 2026), as for a library book with chapters that long (Nicomachean
  // Ethics: up to 1 s). The bound catches a regression past that (a dev server's unminified React is about twice as slow).
  ok('a 120,000-word own EPUB opens and scrolls across sections without a stall past the handoff', openMs < 20000 && (longTasks[0] ?? 0) < 2500, { openMs, longest: longTasks.slice(0, 5), count: longTasks.length })
  const after = await unit()
  ok('desktop: the sections around the reader\'s are painted, far ones are placeholders', (after?.painted.length ?? 0) >= 2 && (after?.painted.length ?? 99) < chapters.length, { painted: after?.painted })
  await showJoin(after.painted[after.painted.length - 1], 'desktop-section-join.png')

  // 2. A highlight in section 3 (the third chapter after the front matter).
  const third = chapters[chapters.findIndex(number => number > 0) + 5] // Dedication, About, Preface, Chapter 1, 2, 3
  await page.evaluate(({ h, chapter }) => localStorage.setItem(`tinct-addbook:place:${h}`, JSON.stringify({ chapterNumber: chapter, paragraphIndex: 4, wordIndex: 0, updatedAt: Date.now(), converter: 12 })), { h: hex, chapter: third })
  await openBook(hex)
  ok('section 3 opens as the reader\'s own', await own() === third, { own: await own(), third })
  const words = page.locator('.book-scroll-chapter.is-own [data-testid="lab-word"]')
  const firstOnScreen = await words.evaluateAll(list => list.findIndex(word => word.getBoundingClientRect().top > 260))
  const a = await words.nth(firstOnScreen).boundingBox(), b = await words.nth(firstOnScreen + 6).boundingBox()
  await page.mouse.move(a.x + 2, a.y + a.height / 2); await page.mouse.down()
  await page.mouse.move(b.x + 2, b.y + b.height / 2, { steps: 6 }); await page.mouse.up()
  await page.getByTestId('lab-dbar-highlight').click()
  await page.waitForTimeout(600); await page.keyboard.press('Escape'); await page.waitForTimeout(800)
  const marked = () => page.evaluate(chapter => document.querySelectorAll(`[data-book-scroll-chapter="${chapter}"] [data-highlight-id]`).length, third)
  ok('a highlight made in section 3 is painted', await marked() > 0, { painted: await marked() })
  await openBook(hex)
  ok('the section 3 highlight shows after a reload', await own() === third && await marked() > 0, { own: await own(), painted: await marked() })
  await page.screenshot({ path: path.join(output, 'highlight-after-reload.png') })
  // Another device of the account (nothing on it but the file): the highlight comes from the account.
  {
    const other = await browser.newContext({ viewport: { width: 1440, height: 900 }, serviceWorkers: 'block', reducedMotion: 'reduce' })
    await other.route('**/*', answer)
    await other.addInitScript(signIn, { user: USER, supabaseKey: process.env.TINCT_SUPABASE_KEY || '' })
    const second = await other.newPage()
    await second.goto(`${origin}/`)
    await seed(`epub:${hex}`, epub, 'The Fabric of Scrolling', second)
    await second.evaluate(({ h, chapter }) => localStorage.setItem(`tinct-addbook:place:${h}`, JSON.stringify({ chapterNumber: chapter, paragraphIndex: 4, wordIndex: 0, updatedAt: 1, converter: 12 })), { h: hex, chapter: third })
    await second.goto(`${origin}/reader?userBook=${hex}`, { waitUntil: 'domcontentloaded' })
    await second.waitForFunction(() => document.querySelector('.lab')?.dataset.readerReady === 'true', null, { timeout: 90000 })
    await second.waitForTimeout(2500)
    const there = await second.evaluate(chapter => document.querySelectorAll(`[data-book-scroll-chapter="${chapter}"] [data-highlight-id]`).length, third)
    ok('the section 3 highlight reaches another device through the account', there > 0 && (account.get(hex)?.marks.length ?? 0) > 0, { painted: there, inAccount: account.get(hex)?.marks.length })
    await other.close()
  }
  // Into section 4: section 3 is a neighbour now, and paints its highlight too; the overview marks it.
  await wheelUntil(400, async () => await own() === chapters[chapters.indexOf(third) + 1])
  await wheelUntil(-60, async () => await page.evaluate(chapter => !!document.querySelector(`[data-book-scroll-chapter="${chapter}"][data-book-scroll-painted="true"]`), third), 90, 10)
  ok('in section 4, section 3 (a neighbour) paints its highlight and the overview marks it',
    await marked() > 0 && await page.locator(`[data-map-unit-mark="${third}"]`).count() >= 1, { painted: await marked(), overview: await page.locator(`[data-map-unit-mark="${third}"]`).count() })

  // Margin cards and chapter actions (as check-book-scroll.mjs checks them in Luke): an Explain card in section 3 stays
  // one margin section across chapter swaps, the overview marks it from section 4, each section's start actions stay
  // level with its heading, and the card comes back after a reload.
  const startOffset = chapter => page.evaluate(chapter => {
    const item = document.querySelector(`[data-testid="source-margin-item"][data-card-id="start:${chapter}"]`)
    const head = document.querySelector(`[data-book-scroll-chapter="${chapter}"] .lab-passage-headline:not([hidden])`)
    return item && head ? Math.round(item.getBoundingClientRect().top - head.getBoundingClientRect().top) : null
  }, chapter)
  const duplicateSections = () => page.evaluate(() => {
    const ids = [...document.querySelectorAll('[data-testid="source-margin-item"]')].map(item => item.dataset.cardId)
    return ids.filter((id, index) => ids.indexOf(id) !== index)
  })
  await page.evaluate(({ h, chapter }) => localStorage.setItem(`tinct-addbook:place:${h}`, JSON.stringify({ chapterNumber: chapter, paragraphIndex: 8, wordIndex: 0, updatedAt: Date.now(), converter: 12 })), { h: hex, chapter: third })
  await openBook(hex)
  {
    const list = page.locator('.book-scroll-chapter.is-own [data-testid="lab-word"]')
    const from = await list.evaluateAll(all => all.findIndex(word => word.getBoundingClientRect().top > 300))
    const a = await list.nth(from).boundingBox(), b = await list.nth(from + 5).boundingBox()
    await page.mouse.move(a.x + 2, a.y + a.height / 2); await page.mouse.down()
    await page.mouse.move(b.x + 2, b.y + b.height / 2, { steps: 6 }); await page.mouse.up()
    await page.getByTestId('lab-dbar-explain').click()
  }
  const opened3 = page.locator('[data-testid="source-margin-item"][data-open="true"]').filter({ has: page.locator('.lab-pcard-answer') }).first()
  const answered = await opened3.waitFor({ timeout: 20000 }).then(() => true, () => false)
  const cardId = answered ? await opened3.getAttribute('data-card-id') : null
  ok('an Explain in section 3 opens as a margin card beside it', answered && !!cardId, { cardId })
  await page.screenshot({ path: path.join(output, 'explain-card-section-3.png') })
  await page.keyboard.press('Escape'); await page.waitForTimeout(600)
  const fourth = chapters[chapters.indexOf(third) + 1]
  await wheelUntil(400, async () => await own() === fourth)
  ok('from section 4, the overview marks section 3\'s highlight and card', await page.locator(`[data-map-unit-mark="${third}"]`).count() >= 2, { marks: await page.locator(`[data-map-unit-mark="${third}"]`).count() })
  const offset4 = await startOffset(fourth)
  ok('section 4\'s start actions (Primer, Summary, Quiz me) are level with its heading', offset4 !== null && Math.abs(offset4) <= 2, { offset: offset4 })
  await wheelUntil(-400, async () => await own() === third)
  ok('back in section 3, every card is one margin section', (await duplicateSections()).length === 0 && await page.locator(`[data-testid="source-margin-item"][data-card-id="${cardId}"]`).count() === 1, await duplicateSections())
  await openBook(hex)
  await page.waitForTimeout(1000)
  ok('the section 3 card is back in its margin after a reload', await page.locator(`[data-testid="source-margin-item"][data-card-id="${cardId}"]`).count() === 1 && (account.get(hex)?.cardsRev ?? 0) > 0, { cardsRev: account.get(hex)?.cardsRev })
  // Catch me up, from the t menu: a margin card, about the book up to the reader's section.
  await page.getByTestId('lab-super').click()
  await page.getByTestId('lab-super-row-catchup').click()
  const catchUp = page.locator('[data-testid="source-margin-item"]').filter({ has: page.locator('.source-margin-label', { hasText: 'Catch me up' }) })
  const caught = await catchUp.first().waitFor({ timeout: 20000 }).then(() => true, () => false)
  await page.waitForTimeout(1500)
  ok('Catch me up opens as a margin card in book scroll', caught, { caught })
  await page.screenshot({ path: path.join(output, 'catch-me-up.png') })
  await page.keyboard.press('Escape'); await page.waitForTimeout(400)
  // "Before you start" at the book's start: the whole book's actions with the first section's.
  await page.evaluate(h => localStorage.setItem(`tinct-addbook:place:${h}`, JSON.stringify({ chapterNumber: 1, paragraphIndex: 0, wordIndex: 0, updatedAt: Date.now(), converter: 12 })), hex)
  await openBook(hex)
  const beforeStart = page.locator('[data-testid="source-margin-item"]').filter({ has: page.locator('.source-margin-label', { hasText: 'Before you start' }) })
  const hasBefore = await beforeStart.first().waitFor({ timeout: 10000 }).then(() => true, () => false)
  if (hasBefore && !(await page.getByTestId('margin-book-summary').isVisible().catch(() => false))) await beforeStart.getByTestId('source-margin-expand').click().catch(() => {})
  ok('"Before you start" opens at the book\'s start with the whole book\'s Summary', hasBefore && await page.getByTestId('margin-book-summary').isVisible().catch(() => false))
  await page.screenshot({ path: path.join(output, 'before-you-start.png') })
  // The whole book's Summary stays with "Before you start" at the book's opening: reading on into later sections, it is
  // not pushed down beside them (it followed the reader under the later sections' start actions).
  await page.getByTestId('margin-book-summary').click()
  const summary = page.locator('[data-testid="source-margin-item"][data-card-id^="mc_book_summary_"]')
  await summary.locator('.lab-catch-up-text').waitFor({ timeout: 60000 }).catch(() => {})
  await page.keyboard.press('Escape'); await page.waitForTimeout(500)
  // Just past the first section, while it is still painted above the screen.
  await wheelUntil(150, async () => await own() !== chapters[0] && await page.evaluate(first => {
    const head = document.querySelector(`[data-book-scroll-chapter="${first}"][data-book-scroll-painted="true"] .lab-passage-headline:not([hidden])`)
    return !!head && head.getBoundingClientRect().bottom < 0
  }, chapters[0]))
  const summaryPlace = await page.evaluate(first => {
    const item = document.querySelector('[data-testid="source-margin-item"][data-card-id^="mc_book_summary_"]')
    const head = document.querySelector(`[data-book-scroll-chapter="${first}"] .lab-passage-headline:not([hidden])`)
    const own = document.querySelector('.lab')?.dataset.chapter
    if (!item || getComputedStyle(item).visibility !== 'visible') return { onScreen: false, own }
    const box = item.getBoundingClientRect()
    return { onScreen: box.bottom > 60 && box.top < innerHeight, top: Math.round(box.top), firstHeading: head && Math.round(head.getBoundingClientRect().top), own }
  }, chapters[0])
  ok('reading on into later sections, the whole book\'s Summary stays at the book\'s opening, off this screen', !summaryPlace.onScreen, summaryPlace)
  await page.screenshot({ path: path.join(output, 'summary-stays-at-start.png') })

  // 3. The place at section 7 survives a reload, a font-size change and a resize.
  const seventh = chapters[chapters.indexOf(third) + 4]
  const place = { chapterNumber: seventh, paragraphIndex: 20, wordIndex: 37, updatedAt: Date.now(), converter: 12 }
  await page.evaluate(({ h, place }) => localStorage.setItem(`tinct-addbook:place:${h}`, JSON.stringify(place)), { h: hex, place })
  await openBook(hex)
  const at = await placeOnScreen(place)
  ok('an existing place at section 7 opens at its word, on the reading line', !!at && at.chapter === seventh && Math.abs(at.fromLine) <= 4 && samePlace(await savedPlace(hex), place), at)
  await page.screenshot({ path: path.join(output, 'place-section-7.png') })
  // Read on a little: the place follows, as chapter, paragraph and word.
  await wheelUntil(120, async () => !samePlace(await savedPlace(hex), place), 150, 20)
  await page.waitForTimeout(1500)
  const before = await savedPlace(hex)
  ok('scrolling saves the place as chapter, paragraph and word', before?.chapterNumber === seventh && Number.isInteger(before.paragraphIndex) && Number.isInteger(before.wordIndex) && !samePlace(before, place), before)
  await openBook(hex)
  const reloaded = await placeOnScreen(before)
  ok('the place survives a reload, at its word on the reading line', !!reloaded && Math.abs(reloaded.fromLine) <= 4 && samePlace(await savedPlace(hex), before), reloaded)
  // A font-size change (the reader's setting, read at load).
  await page.evaluate(() => { const prefs = JSON.parse(localStorage.getItem('tinct-lab-prefs') || '{}'); localStorage.setItem('tinct-lab-prefs', JSON.stringify({ ...prefs, fontSize: 1.25 })) })
  await openBook(hex)
  const bigger = await placeOnScreen(before)
  ok('the place survives a font-size change', !!bigger && Math.abs(bigger.fromLine) <= 4 && samePlace(await savedPlace(hex), before), bigger)
  await page.screenshot({ path: path.join(output, 'place-font-size.png') })
  // A resize while reading: the same word stays at the line (within a line), and the saved place is not moved.
  await page.setViewportSize({ width: 1180, height: 760 })
  await page.waitForTimeout(1500)
  const resized = await placeOnScreen(before)
  ok('the place survives a window resize', !!resized && Math.abs(resized.fromLine) <= 48 && samePlace(await savedPlace(hex), before), resized)
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.evaluate(() => { const prefs = JSON.parse(localStorage.getItem('tinct-lab-prefs') || '{}'); delete prefs.fontSize; localStorage.setItem('tinct-lab-prefs', JSON.stringify(prefs)) })

  // 4. A pasted text: its sections run on with no gap.
  const pasted = await page.evaluate(async () => {
    const { pasteEpub } = await import('/lab/library_2/paste-text.js')
    const para = (tag, i) => `In part ${tag} the essay made point ${i} about the long history of the idea, slowly and with care, as essays do when they have time.`.repeat(4)
    const html = ['I', 'II', 'III', 'IV', 'V'].map(tag => `<h2>${tag}. A section</h2>${Array.from({ length: 14 }, (_, i) => `<p>${para(tag, i + 1)}</p>`).join('')}`).join('')
    const file = pasteEpub({ source: html, format: 'html', title: 'A Pasted Essay' })
    const bytes = new Uint8Array(await file.arrayBuffer())
    const digest = new Uint8Array(await crypto.subtle.digest('SHA-256', bytes))
    const sha = [...digest].map(byte => byte.toString(16).padStart(2, '0')).join('')
    return { bytes: [...bytes], sha, hex: sha.slice(0, 24) }
  })
  keep(pasted.hex, pasted.sha, 'A Pasted Essay')
  await seed(`epub:${pasted.hex}`, pasted.bytes, 'A Pasted Essay')
  await openBook(pasted.hex)
  const essay = await unit()
  ok('a pasted text scrolls as one unit with no gap between its sections', !!essay && essay.gap === 'none' && essay.chapters.length >= 3, essay && { key: essay.key, gap: essay.gap, sections: essay.chapters.length })
  await page.screenshot({ path: path.join(output, 'pasted-open.png') })
  if (essay) await showJoin(essay.chapters[1], 'pasted-no-gap.png')

  // 5. The phone stays one chapter.
  const storage = await context.storageState()
  const phoneContext = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, serviceWorkers: 'block', reducedMotion: 'reduce', storageState: storage })
  await phoneContext.route('**/*', answer)
  const phonePage = await phoneContext.newPage()
  phonePage.on('pageerror', error => errors.push(error.message))
  await phonePage.goto(`${origin}/`)
  await seed(`epub:${hex}`, epub, 'The Fabric of Scrolling', phonePage)
  await phonePage.goto(`${origin}/reader?userBook=${hex}`, { waitUntil: 'domcontentloaded' })
  await phonePage.waitForFunction(() => document.querySelector('.lab')?.dataset.readerReady === 'true', null, { timeout: 90000 })
  await phonePage.waitForTimeout(1500)
  const phoneScroll = await phonePage.locator('[data-book-scroll]').count()
  ok('phone: an own EPUB stays one chapter (no book scroll)', phoneScroll === 0, { bookScroll: phoneScroll })
  await phonePage.screenshot({ path: path.join(output, 'phone-one-chapter.png') })
  await phoneContext.close()

  ok('no page errors', errors.length === 0, errors.slice(0, 3))
} finally {
  await browser.close()
}
console.log(failures ? `${failures} check(s) failed` : 'all checks passed')
process.exit(failures ? 1 : 0)
