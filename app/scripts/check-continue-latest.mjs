// Continue opens the latest thing read, on the desktop (Anders, option A, 20 Oct 2026).
//   cd app && VITE_SUPABASE_URL=https://qa.supabase.co VITE_SUPABASE_ANON_KEY=qa npm run build
//   CHROMIUM_PATH=<chrome> node scripts/check-continue-latest.mjs
// The built app is served from dist/ under https://tinct.app by request interception; the
// account's API answers are mocked and every other request is refused, so nothing leaves the
// machine. A signed-in reader whose registered book was read ten minutes ago:
//   1. reads a PDF of their own in Add a book's viewer (1440×900);
//   2. goes to the library: the PDF leads from the first paint and Continue opens it;
//      "Also reading" names the registered book beside Continue;
//   3. opens /reader with no book: the PDF's viewer opens instead, before the reader paints;
//   4. on a phone (390×844) the same /reader stays the reader, as today.
// CONTINUE_SHOTS=<dir> writes screenshots.
import { chromium } from '@playwright/test'
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import fs from 'node:fs/promises'
import path from 'node:path'

const origin = 'https://tinct.app'
const dist = path.resolve('dist')
const pdfFile = path.resolve('../addbooks/web/test/pdf-fixtures/prose_book.pdf')
const shots = process.env.CONTINUE_SHOTS || ''
if (shots) await fs.mkdir(shots, { recursive: true })
const pdfBytes = await fs.readFile(pdfFile)
const HEX = createHash('sha256').update(pdfBytes).digest('hex').slice(0, 24)
const USER = 'u-qa'
const TITLE = 'Continue QA Paper'

const pages = {
  '/library': 'lab/library_2/index.html',
  '/library/': 'lab/library_2/index.html',
  '/reader': 'app.html',
  '/lab/addbook/': 'lab/addbook/index.html',
}

async function serve(context, log) {
  await context.route('**/*', async route => {
    const request = route.request()
    const url = new URL(request.url())
    if (url.hostname.endsWith('supabase.co')) return route.fulfill({ status: 503, contentType: 'application/json', body: '{}' })
    if (url.origin !== origin) return route.abort()
    if (url.pathname === '/qa-seed') return route.fulfill({ status: 200, contentType: 'text/html', body: '<!doctype html><title>seed</title>' })
    if (url.pathname.startsWith('/api/')) {
      log.push(`${request.method()} ${url.pathname}`)
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

async function seed(page, registeredAt) {
  await page.goto(`${origin}/qa-seed`)
  await page.evaluate(async ({ hex, bytes, user, title, registeredAt }) => {
    const now = Math.floor(Date.now() / 1000)
    localStorage.setItem('sb-qa-auth-token', JSON.stringify({ access_token: 'qa-token', refresh_token: 'qa-refresh', token_type: 'bearer', expires_in: 360000, expires_at: now + 360000, user: { id: user, email: 'reader@example.com', aud: 'authenticated', user_metadata: {} } }))
    document.cookie = 'tinct_auth=1; path=/'
    const place = { bookId: 'frankenstein', headerBook: 'Frankenstein', chapterNumber: 2, sequentialChapter: 2, paragraphIndex: 0, wordIndex: 0, updatedAt: registeredAt, deviceId: 'qa-device', rev: 1 }
    localStorage.setItem('tinct-lab-position', JSON.stringify({ books: { frankenstein: place }, owner: user, deviceId: 'qa-device', lastSettledBookId: 'frankenstein', lastSettledAt: registeredAt, updatedAt: registeredAt }))
    const db = await new Promise((resolve, reject) => {
      const request = indexedDB.open('tinct-addbook', 1)
      request.onupgradeneeded = () => request.result.createObjectStore('books', { keyPath: 'key' })
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
    await new Promise((resolve, reject) => {
      const tx = db.transaction('books', 'readwrite')
      tx.objectStore('books').put({ key: `pdf:${hex}`, kind: 'pdf', name: `${title}.pdf`, title, author: '', owner: user, addedAt: registeredAt - 1000, openedAt: registeredAt - 1000, size: bytes.length, bytes: new Uint8Array(bytes).buffer })
      tx.oncomplete = resolve
      tx.onerror = () => reject(tx.error)
    })
    db.close()
  }, { hex: HEX, bytes: [...pdfBytes], user: USER, title: TITLE, registeredAt })
}

const executablePath = process.env.CHROMIUM_PATH || undefined
const browser = await chromium.launch({ headless: true, ...(executablePath ? { executablePath } : {}) })
const results = []
const check = (name, ok, detail = '') => { results.push({ name, ok }); console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? '  ' + detail : ''}`) }

// ---- Desktop ----
{
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, serviceWorkers: 'block' })
  const log = []
  await serve(context, log)
  const page = await context.newPage()
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  await seed(page, Date.now() - 10 * 60 * 1000)

  // 1. Read the PDF: open it in the viewer and move down its pages.
  await page.goto(`${origin}/lab/addbook/?userBook=${HEX}`, { waitUntil: 'domcontentloaded' })
  await page.waitForFunction(() => document.querySelectorAll('#scroll canvas, #scroll .page').length > 0, null, { timeout: 45000 })
  await page.waitForTimeout(1500)
  await page.evaluate(() => { const s = document.getElementById('scroll'); s.scrollTop += Math.max(1200, s.clientHeight * 1.5); s.dispatchEvent(new Event('scroll')) })
  await page.waitForFunction(hex => (JSON.parse(localStorage.getItem('tinct-addbook:pos:pdf:' + hex) || '{}').at || 0) > 0, HEX, { timeout: 15000 })
  await page.waitForFunction(hex => JSON.parse(localStorage.getItem('tinct:lab-library-boot') || 'null')?.hero?.bookId === 'userbook-' + hex, HEX, { timeout: 15000 })
  const hero = await page.evaluate(() => JSON.parse(localStorage.getItem('tinct:lab-library-boot')).hero)
  // The viewer names the PDF by its own title once its scan has read it.
  const shownTitle = await page.evaluate(() => document.getElementById('bookTitle')?.textContent?.trim() || '')
  check('the viewer names the PDF as the book just read', !!shownTitle && hero.title === shownTitle && /^p\. \d+ of \d+$/.test(hero.chapterLabel), JSON.stringify({ title: hero.title, chapterLabel: hero.chapterLabel }))
  if (shots) await page.screenshot({ path: path.join(shots, 'desktop-1-pdf.png') })

  // 2. The library: the PDF leads, and Continue opens it.
  await page.goto(`${origin}/library`, { waitUntil: 'domcontentloaded' })
  await page.waitForFunction(() => document.querySelector('.reading-table:not(.is-placeholder) #rt-title')?.textContent?.trim(), null, { timeout: 45000 })
  const firstTitle = await page.evaluate(() => document.querySelector('.reading-table:not(.is-placeholder) #rt-title').textContent.trim())
  check('the library leads with the PDF from its first paint', firstTitle === shownTitle, `title=${firstTitle}`)
  await page.waitForFunction(() => document.querySelector('.reading-table.is-ready:not([hidden])'), null, { timeout: 45000 })
  await page.waitForFunction(() => { const a = [...document.querySelectorAll('.reading-table.is-ready')].pop()?.querySelector('#rt-also'); return a && !a.hidden }, null, { timeout: 15000 }).catch(() => {})
  const desk = await page.evaluate(() => {
    const view = [...document.querySelectorAll('.reading-table.is-ready')].pop()
    const also = view?.querySelector('#rt-also')
    return { title: view?.querySelector('#rt-title')?.textContent.trim(), also: also && !also.hidden ? also.textContent : null }
  })
  check('the settled desk still shows the PDF first', desk.title === shownTitle, `title=${desk.title}`)
  check('Also reading names the Tinct book beside Continue', /^Also reading: Frankenstein/.test(desk.also || ''), `also=${desk.also}`)
  if (shots) await page.screenshot({ path: path.join(shots, 'desktop-2-library.png') })
  await Promise.all([
    page.waitForURL(url => url.pathname === '/lab/addbook/' && url.searchParams.get('userBook') === HEX, { timeout: 20000 }),
    page.locator('.reading-table.is-ready:not([hidden]) #rt-continue').last().click(),
  ])
  check('Continue opens the PDF in its viewer', true, page.url().replace(origin, ''))
  await page.waitForTimeout(1000)

  // 3. /reader with no book: the PDF, decided before the reader paints a book.
  log.length = 0
  await page.goto(`${origin}/reader`, { waitUntil: 'commit' })
  await page.waitForURL(url => url.pathname === '/lab/addbook/' && url.searchParams.get('userBook') === HEX, { timeout: 20000 })
  check('/reader with no book opens the PDF instead', true, page.url().replace(origin, ''))
  check('the reader’s boot asked the account for own-book places (mocked)', log.includes('GET /api/user-books/places'))
  check('no page errors on the desktop', errors.length === 0, errors.slice(0, 3).join(' | '))
  await context.close()
}

// ---- Phone: today's behaviour ----
{
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true, serviceWorkers: 'block' })
  const log = []
  await serve(context, log)
  const page = await context.newPage()
  await seed(page, Date.now() - 10 * 60 * 1000)
  // The PDF read just now on this phone (its place is newer than the registered book's).
  await page.evaluate(hex => localStorage.setItem('tinct-addbook:pos:pdf:' + hex, JSON.stringify({ page: 2, frac: 0.2, pages: 3, at: Date.now() })), HEX)
  await page.goto(`${origin}/reader`, { waitUntil: 'domcontentloaded' })
  await page.waitForSelector('[data-testid="lab-root"]', { timeout: 45000 })
  await page.waitForTimeout(2500)
  const at = new URL(page.url())
  check('phone: /reader stays the reader', at.pathname === '/reader' && !at.searchParams.has('userBook'), page.url().replace(origin, ''))
  check('phone: the account is not asked for own-book places at boot', !log.includes('GET /api/user-books/places'))
  if (shots) await page.screenshot({ path: path.join(shots, 'phone-reader.png') })
  await context.close()
}

await browser.close()
const failed = results.filter(r => !r.ok).length
console.log(`\n${results.length - failed}/${results.length} passed`)
process.exit(failed ? 1 : 0)
