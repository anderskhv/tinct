// Reproduction: a desktop reader opening a place last read on another device must land on that
// paragraph and word, never on the chapter's start (0:0 bug, 20 Oct 2026). Loops the cross-device
// open of check-continue-latest.mjs and counts landings that are not the phone's place.
//   cd app && SKIP_ENV_CHECK=1 VITE_SUPABASE_URL=https://qa.supabase.co VITE_SUPABASE_ANON_KEY=qa npm run build
//   CHROMIUM_PATH=<chrome> RUNS=60 node scripts/repro-cross-device-place.mjs
// BROWSER=webkit runs it in WebKit (PLAYWRIGHT_BROWSERS_PATH as installed). PARALLEL=<n> opens n at once.
// REPRO_DIST=<dir> serves another build (an unfixed one, to compare). VIEWPORT=phone opens it at 390×844.
// Mocks only: the built app is served from dist/ under https://tinct.app by request interception, the
// account's /api/lab-position answers with the phone's place, every other request is refused.
import { chromium, webkit } from '@playwright/test'
import { markInternal } from './lib/internalTraffic.cjs'
import { createHash } from 'node:crypto'
import fs from 'node:fs/promises'
import path from 'node:path'

const origin = 'https://tinct.app'
const dist = path.resolve(process.env.REPRO_DIST || 'dist')
const runs = Number(process.env.RUNS || 60)
const parallel = Number(process.env.PARALLEL || 1)
const settleMs = Number(process.env.SETTLE_MS || 3000)
const pdfBytes = await fs.readFile(path.resolve('../addbooks/web/test/pdf-fixtures/prose_book.pdf'))
const HEX = createHash('sha256').update(pdfBytes).digest('hex').slice(0, 24)
const USER = 'u-qa'
const pages = { '/reader': 'app.html' }

function accountRecord(now) {
  const phonePlace = { bookId: 'ezra', headerBook: 'Ezra', chapterNumber: 9, sequentialChapter: 412, paragraphIndex: 1, wordIndex: 3, primaryEditionKey: 'web-en', updatedAt: now - 5 * 60 * 1000, deviceId: 'qa-phone', rev: 3 }
  return { owner: USER, books: { ezra: phonePlace }, finished: {}, hidden: {}, lastSettledBookId: 'ezra', lastSettledAt: phonePlace.updatedAt, updatedAt: phonePlace.updatedAt, deviceId: 'qa-phone' }
}

async function serve(context, accountPosition, puts) {
  await context.route('**/*', async route => {
    const request = route.request()
    const url = new URL(request.url())
    if (url.hostname.endsWith('supabase.co')) return route.fulfill({ status: 503, contentType: 'application/json', body: '{}' })
    if (url.origin !== origin) return route.abort()
    if (url.pathname === '/qa-seed') return route.fulfill({ status: 200, contentType: 'text/html', body: '<!doctype html><title>seed</title>' })
    if (url.pathname.startsWith('/api/')) {
      if (url.pathname === '/api/lab-position' && request.method() === 'PUT') puts.push(request.postDataJSON())
      if (url.pathname === '/api/lab-position') return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(accountPosition) })
      if (url.pathname === '/api/user-books/places') return route.fulfill({ status: 200, contentType: 'application/json', body: '{"places":{}}' })
      if (url.pathname === '/api/user-books') return route.fulfill({ status: 200, contentType: 'application/json', body: '{"books":[]}' })
      if (url.pathname === '/api/public-books') return route.fulfill({ status: 200, contentType: 'application/json', body: '{"books":[]}' })
      return route.fulfill({ status: 404, contentType: 'application/json', body: '{}' })
    }
    if (request.method() !== 'GET') return route.abort()
    const page = pages[url.pathname]
    const filename = path.resolve(dist, page ?? `.${url.pathname}`)
    if (!filename.startsWith(`${dist}/`)) return route.abort()
    try { if ((await fs.stat(filename)).isFile()) return route.fulfill({ path: filename, ...(page ? { contentType: 'text/html' } : {}) }) } catch {}
    return route.fulfill({ status: 404, body: '' })
  })
}

async function seed(page, now) {
  await page.goto(`${origin}/qa-seed`)
  await page.evaluate(async ({ hex, bytes, user, registeredAt, pdfAt }) => {
    const now = Math.floor(Date.now() / 1000)
    localStorage.setItem('sb-qa-auth-token', JSON.stringify({ access_token: 'qa-token', refresh_token: 'qa-refresh', token_type: 'bearer', expires_in: 360000, expires_at: now + 360000, user: { id: user, email: 'reader@example.com', aud: 'authenticated', user_metadata: {} } }))
    document.cookie = 'tinct_auth=1; path=/'
    const place = { bookId: 'frankenstein', headerBook: 'Frankenstein', chapterNumber: 2, sequentialChapter: 2, paragraphIndex: 0, wordIndex: 0, updatedAt: registeredAt, deviceId: 'qa-device', rev: 1 }
    localStorage.setItem('tinct-lab-position', JSON.stringify({ books: { frankenstein: place }, owner: user, deviceId: 'qa-device', lastSettledBookId: 'frankenstein', lastSettledAt: registeredAt, updatedAt: registeredAt }))
    localStorage.setItem('tinct-addbook:pos:pdf:' + hex, JSON.stringify({ page: 2, frac: 0.2, pages: 3, at: pdfAt }))
    const db = await new Promise((resolve, reject) => {
      const request = indexedDB.open('tinct-addbook', 1)
      request.onupgradeneeded = () => request.result.createObjectStore('books', { keyPath: 'key' })
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
    await new Promise((resolve, reject) => {
      const tx = db.transaction('books', 'readwrite')
      tx.objectStore('books').put({ key: `pdf:${hex}`, kind: 'pdf', name: 'Continue QA Paper.pdf', title: 'Continue QA Paper', author: '', owner: user, addedAt: registeredAt - 1000, openedAt: registeredAt - 1000, size: bytes.length, bytes: new Uint8Array(bytes).buffer })
      tx.oncomplete = resolve
      tx.onerror = () => reject(tx.error)
    })
    db.close()
  }, { hex: HEX, bytes: [...pdfBytes], user: USER, registeredAt: now - 30 * 60 * 1000, pdfAt: now - 20 * 60 * 1000 })
}

const engine = process.env.BROWSER === 'webkit' ? webkit : chromium
const executablePath = process.env.BROWSER === 'webkit' ? (process.env.WEBKIT_PATH || undefined) : (process.env.CHROMIUM_PATH || undefined)
const browser = await markInternal(await engine.launch({ headless: true, ...(executablePath ? { executablePath } : {}) }))

async function once(n) {
  const now = Date.now()
  const puts = []
  const context = await browser.newContext(process.env.VIEWPORT === 'phone'
    ? { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true, isMobile: process.env.BROWSER !== 'webkit' ? true : undefined, serviceWorkers: 'block' }
    : { viewport: { width: 1440, height: 900 }, serviceWorkers: 'block' })
  await serve(context, accountRecord(now), puts)
  const page = await context.newPage()
  const logs = []
  if (process.env.REPRO_LOGS) page.on('console', msg => { if (/\[posdbg\]/.test(msg.text())) logs.push(msg.text()) })
  await seed(page, now)
  // Every place the reader root reports, in order, while the chapter is the phone's.
  await page.addInitScript(() => {
    window.__places = []
    new MutationObserver(() => {
      const root = document.querySelector('[data-testid="lab-root"]')
      if (!root || root.dataset.readerReady !== 'true' || root.dataset.chapter !== '412') return
      const last = window.__places[window.__places.length - 1]
      if (last !== root.dataset.place) window.__places.push(root.dataset.place)
    }).observe(document, { subtree: true, childList: true, attributes: true, attributeFilter: ['data-place', 'data-reader-ready', 'data-chapter'] })
  })
  await page.goto(`${origin}/reader`, { waitUntil: 'domcontentloaded' })
  const read = () => page.evaluate(() => {
    const root = document.querySelector('[data-testid="lab-root"]')
    return root ? { ready: root.dataset.readerReady, chapter: root.dataset.chapter, place: root.dataset.place } : null
  })
  await page.waitForFunction(() => {
    const root = document.querySelector('[data-testid="lab-root"]')
    return root?.dataset.readerReady === 'true' && root.dataset.chapter === '412'
  }, null, { timeout: 45000 }).catch(() => {})
  await page.waitForTimeout(settleMs)
  const landed = await read()
  const seen = await page.evaluate(() => window.__places)
  const badPuts = puts.filter(put => { const e = put.books?.ezra; return e && (e.paragraphIndex !== 1 || e.wordIndex !== 3) })
  await context.close()
  const ok = landed?.ready === 'true' && landed.chapter === '412' && landed.place === '1:3' && badPuts.length === 0
  // check-continue-latest passes as soon as the place reads 1:3 once; a later reset slips past it.
  if (seen.includes('1:3')) everAt += 1
  console.log(`${String(n).padStart(3)} ${ok ? 'ok  ' : 'MISS'} ${JSON.stringify(landed)} seen=${seen.join('>')}${badPuts.length ? ' badPUTs=' + badPuts.map(p => p.books.ezra.paragraphIndex + ':' + p.books.ezra.wordIndex).join(',') : ''}`)
  if (!ok && logs.length) console.log(logs.join('\n'))
  return ok
}

let misses = 0
let everAt = 0
let next = 0
await Promise.all(Array.from({ length: parallel }, async () => {
  while (next < runs) { const n = ++next; if (!(await once(n))) misses += 1 }
}))
await browser.close()
console.log(`\n${misses}/${runs} runs did not stay on the phone's place (1:3); ${runs - everAt}/${runs} never showed it (what check-continue-latest catches)`)
process.exit(misses ? 1 : 0)
