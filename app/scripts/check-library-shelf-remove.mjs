// My shelf's "Remove from shelf" on a book being read stays removed (Anders, 4 Nov 2026). On
// tinct.app, Currently reading → ••• on The Prince → Remove from shelf → Remove: the cover faded out,
// the row closed up, and ~1.5 s later The Prince was back. The book had been removed from (or
// unsaved on) the shelf before and read since, so its account row was already a tombstone
// (`library-shelf:the-prince`, value null). commit_user_data does not rewrite an unchanged value
// (migration 20261022_disk_io_audit.sql), so the new removal wrote nothing; the reload that follows
// a removal then dated the removal by that old row's clock, older than the book's reading, and
// readingNow.ts `removedSince` listed the book again.
//
// This check loads the built library (dist/) in headless Chromium, signed in with a faked account
// whose Supabase rows and /api/lab-position are answered here (commit_user_data as the migration
// does it, unchanged values included), and asserts:
// 1. Remove from shelf on a Currently reading book whose account row is an old tombstone: the book
//    stays off Currently reading and My shelf for 10 s and after a reload, and the account row is
//    dated by the removal.
// 2. The same for a book whose place was stamped slightly ahead of this device's clock (another
//    device's clock): removal still holds.
// 3. Reading the book again (a newer place, as the reader writes it) brings it back to Currently
//    reading, at that place.
// 4. Throughout, the reading positions are never changed by the library.
//
// Run after `npm run build` from app/: node scripts/check-library-shelf-remove.mjs
// SHELF_REMOVE_ARTIFACTS=<dir> also writes screenshots.
import { chromium } from '@playwright/test'
import { createServer } from 'node:http'
import fs from 'node:fs/promises'
import path from 'node:path'
import assert from 'node:assert/strict'
import { markInternal } from './lib/internalTraffic.cjs'

const DIST = path.resolve('dist')
const ARTIFACTS = process.env.SHELF_REMOVE_ARTIFACTS || ''
const USER = '00000000-0000-4000-8000-0000000c0de2'
const DAY = 86400000
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.jpg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.mp4': 'video/mp4', '.webm': 'video/webm', '.wav': 'audio/wav' }

function serve() {
  const server = createServer(async (req, res) => {
    let pathname = decodeURIComponent(new URL(req.url, 'http://local').pathname)
    if (['/', '/library', '/library/'].includes(pathname)) pathname = '/lab/library_2/index.html'
    if (pathname === '/reader') pathname = '/app.html'
    if (pathname.endsWith('/')) pathname += 'index.html'
    const file = path.join(DIST, path.normalize(pathname))
    try {
      if (!file.startsWith(DIST + path.sep) || !(await fs.stat(file)).isFile()) throw new Error('missing')
      res.writeHead(200, { 'content-type': TYPES[path.extname(file)] || 'application/octet-stream' })
      res.end(await fs.readFile(file))
    } catch { res.writeHead(404); res.end() }
  })
  return new Promise(resolve => server.listen(0, '127.0.0.1', () => resolve(server)))
}

async function supabaseHost() {
  for (const name of await fs.readdir(path.join(DIST, 'assets'))) {
    if (!name.endsWith('.js')) continue
    const match = (await fs.readFile(path.join(DIST, 'assets', name), 'utf8')).match(/https:\/\/([a-z0-9]+)\.supabase\.co/)
    if (match) return { host: `${match[1]}.supabase.co`, ref: match[1] }
  }
  throw new Error('The build names no Supabase project: the signed-in library cannot be faked')
}

const place = (bookId, chapterNumber, paragraphIndex, updatedAt, deviceId = 'device-shelf-check') => ({ bookId, headerBook: bookId, chapterNumber, sequentialChapter: chapterNumber, paragraphIndex, wordIndex: 0, pageIndex: 0, primaryEditionKey: 'original-en', updatedAt, deviceId, rev: 1 })

/** The faked account: its user_data rows (with commit_user_data's own rules) and its lab position. */
function account({ shelf, positions }) {
  const rows = new Map(shelf.map(row => [row.key, { ...row }]))
  const iso = at => new Date(at).toISOString()
  return {
    rows, positions,
    // public.commit_user_data (20261022_disk_io_audit.sql): an unchanged value is answered as
    // applied at its current rev and is not written; a rev mismatch is a conflict.
    commit({ p_key, p_value, p_expected_rev }) {
      const current = rows.get(p_key)
      const same = current && JSON.stringify(current.value ?? null) === JSON.stringify(p_value ?? null)
      if (current && (p_expected_rev == null || current.rev === p_expected_rev) && same) return [{ key: p_key, value: current.value, rev: current.rev, updated_at: current.updated_at, applied: true, conflict: false }]
      if (current) {
        if (p_expected_rev != null && current.rev !== p_expected_rev) return [{ key: p_key, value: current.value, rev: current.rev, updated_at: current.updated_at, applied: false, conflict: true }]
        Object.assign(current, { value: p_value, rev: current.rev + 1, updated_at: iso(Date.now()) })
        return [{ ...current, applied: true, conflict: false }]
      }
      if (p_expected_rev != null && p_expected_rev !== 0) return [{ key: p_key, value: null, rev: null, updated_at: null, applied: false, conflict: true }]
      const row = { key: p_key, value: p_value, rev: 1, updated_at: iso(Date.now()) }
      rows.set(p_key, row)
      return [{ ...row, applied: true, conflict: false }]
    },
  }
}

async function context(browser, origin, supabase, state) {
  const c = await browser.newContext({ viewport: { width: 1512, height: 862 }, baseURL: origin, serviceWorkers: 'block' })
  await c.route(url => /^https?:$/.test(url.protocol) && url.origin !== origin && url.hostname !== supabase.host, route => route.abort())
  await c.route('**/*.mp4', route => route.abort())
  await c.route(`${origin}/api/**`, route => route.fulfill({ status: 204, body: '' }))
  await c.route(`${origin}/api/lab-position**`, async route => {
    if (route.request().method() === 'GET') return route.fulfill({ json: state.positions })
    // The library never writes a reading position (asserted below); the reader does.
    if (!new URL(route.request().headers().referer || origin).pathname.startsWith('/reader')) state.libraryPositionPuts = (state.libraryPositionPuts || 0) + 1
    // The Worker's merge, enough for one book: the newer place per book wins.
    const incoming = route.request().postDataJSON() || {}
    const books = { ...state.positions.books }
    for (const [id, next] of Object.entries(incoming.books || {})) if (!books[id] || next.updatedAt > books[id].updatedAt) books[id] = next
    state.positions = { ...state.positions, ...incoming, books, owner: USER, updatedAt: Math.max(state.positions.updatedAt, incoming.updatedAt || 0) }
    return route.fulfill({ json: state.positions })
  })
  const exp = Math.floor(Date.now() / 1000) + 3600
  const b64 = value => Buffer.from(JSON.stringify(value)).toString('base64url')
  const user = { id: USER, aud: 'authenticated', role: 'authenticated', email: 'reader@example.com', app_metadata: {}, user_metadata: {}, created_at: '2026-10-01T00:00:00Z' }
  const session = { access_token: `${b64({ alg: 'HS256', typ: 'JWT' })}.${b64({ sub: USER, exp, role: 'authenticated' })}.fixture`, refresh_token: 'fixture', token_type: 'bearer', expires_in: 3600, expires_at: exp, user }
  await c.addCookies([{ name: 'tinct_auth', value: '1', url: origin }])
  await c.addInitScript(({ key, session }) => { try { localStorage.setItem(key, session) } catch { /* private */ } }, { key: `sb-${supabase.ref}-auth-token`, session: JSON.stringify(session) })
  await c.route(`https://${supabase.host}/**`, async route => {
    const url = new URL(route.request().url())
    if (url.pathname.startsWith('/auth/v1/user')) return route.fulfill({ json: user })
    if (url.pathname === '/rest/v1/rpc/commit_user_data') {
      const result = state.account.commit(route.request().postDataJSON())
      // A slow account: the reply lands after the cover has faded (the removal's own push).
      await new Promise(resolve => setTimeout(resolve, 300))
      return route.fulfill({ json: result })
    }
    if (url.pathname === '/rest/v1/user_data' && route.request().method() === 'GET' && (url.searchParams.get('key') || '').startsWith('like.library-shelf:')) {
      return route.fulfill({ json: [...state.account.rows.values()].filter(row => row.key.startsWith('library-shelf:')) })
    }
    return route.fulfill({ json: [] })
  })
  return c
}

const readingIds = page => page.evaluate(() => (window.__library2Reading?.reading || []).map(book => book.bookId))
const shelfGroup = (page, id) => page.evaluate(id => document.querySelector(`#collection-books article.collection-card[data-book="${id}"]`)?.dataset.shelfGroup ?? null, id)

async function openLibrary(page, expectBook) {
  await page.goto('/library', { waitUntil: 'domcontentloaded' })
  await page.waitForFunction(() => window.__library2Reading && window.__tinctLibraryTwoReading && document.documentElement.classList.contains('library-ready'), null, { timeout: 60000 })
  if (expectBook) await page.waitForFunction(id => (window.__library2Reading?.reading || []).some(book => book.bookId === id), expectBook, { timeout: 30000 })
  await page.waitForLoadState('networkidle').catch(() => {})
  await page.waitForTimeout(1500)
}
async function openMyShelf(page) {
  await page.locator('#menu-toggle').click()
  await page.locator('[data-collection="saved"]').click()
  await page.waitForFunction(() => document.getElementById('collection-title')?.textContent === 'My shelf')
}

async function removeFromShelf(page, id, title) {
  await openMyShelf(page)
  const card = page.locator(`#collection-books article.collection-card[data-book="${id}"]`)
  await card.waitFor()
  assert.equal(await card.evaluate(n => n.dataset.shelfGroup), 'reading', `${title} starts on Currently reading`)
  await card.hover()
  await card.locator('.shelf-more').click()
  await card.locator('[role="menuitem"]').filter({ hasText: /^Remove from shelf$/ }).click()
  const dialog = page.locator('[data-testid="own-delete-dialog"]')
  assert.equal(await dialog.locator('h2').innerText(), `Remove ${title}?`)
  await dialog.locator('.own-delete-confirm').click()
  await page.waitForFunction(id => !document.querySelector(`#collection-books article.collection-card[data-book="${id}"]`), id)
}

async function scenario(browser, origin, supabase, { label, id, title, shelf, placeAt }) {
  const now = Date.now()
  const positions = { books: { [id]: place(id, 5, 2, placeAt), frankenstein: place('frankenstein', 3, 4, now - 3 * DAY) }, finished: {}, owner: USER, hidden: {}, lastSettledBookId: id, lastSettledAt: placeAt, updatedAt: placeAt, deviceId: 'device-shelf-check' }
  const state = { account: account({ shelf, positions }), positions }
  const c = await context(browser, origin, supabase, state)
  const page = await c.newPage(), errors = []
  page.on('pageerror', error => errors.push(error.message))
  if (process.env.SHELF_REMOVE_DEBUG) { page.on('crash', () => console.log('PAGE_CRASH', page.url())); page.on('console', m => console.log('CONSOLE', m.type(), m.text().slice(0, 300))); page.on('framenavigated', f => { if (f === page.mainFrame()) console.log('NAV', f.url()) }) }
  const books = () => page.evaluate(() => JSON.parse(localStorage.getItem('tinct-lab-position') || 'null')?.books)
  try {
    await openLibrary(page, id)
    const placesBefore = await books()
    await removeFromShelf(page, id, title)
    assert(Date.now() > placeAt || label === 'clock-ahead', `${label}: the reading predates the removal`)
    if (label === 'clock-ahead') assert(Date.now() < placeAt, `${label}: removed while the other device's stamp is still ahead of this clock`)
    // The account's answer and the reload that follows a removal land well inside 10 s.
    const seen = []
    for (let i = 0; i < 20; i++) { await page.waitForTimeout(500); seen.push({ reading: (await readingIds(page)).includes(id), group: await shelfGroup(page, id) }) }
    if (ARTIFACTS) await page.screenshot({ path: path.join(ARTIFACTS, `${label}-removed.png`) })
    assert(seen.every(s => !s.reading && s.group === null), `${label}: ${title} stays off Currently reading and My shelf for 10 s after Remove from shelf ${JSON.stringify(seen)}`)
    const row = state.account.rows.get('library-shelf:' + id)
    assert(row && row.value?.saved !== true, `${label}: the account row records the removal ${JSON.stringify(row)}`)
    const rowAt = Number(row.value?.at) || Date.parse(row.updated_at)
    assert(rowAt >= Math.max(now, placeAt), `${label}: the account row is dated by this removal, at least as new as the reading it hid ${JSON.stringify(row)}`)
    // A reload keeps it off, and so does another device (the account alone).
    await openLibrary(page, null)
    assert(!(await readingIds(page)).includes(id), `${label}: ${title} stays off the reading table after a reload`)
    await openMyShelf(page)
    await page.waitForTimeout(1000)
    assert.equal(await shelfGroup(page, id), null, `${label}: ${title} stays off My shelf after a reload`)
    assert.deepEqual(await books(), placesBefore, `${label}: the reading positions are kept`)
    {
      const other = await context(browser, origin, supabase, state), elsewhere = await other.newPage()
      try {
        await openLibrary(elsewhere, null)
        assert(!(await readingIds(elsewhere)).includes(id), `${label}: ${title} stays off the reading table on another device`)
        assert((await readingIds(elsewhere)).includes('frankenstein'), `${label}: the other device lists the other book`)
      } finally { await other.close() }
    }
    // Reading it again in the reader: open it at its place and turn pages. Reading on this device
    // writes this device's time; places merge by time, so a reading counts once this clock has
    // passed the other device's stamp (the check waits for that, as a reader would read later).
    if (Date.now() <= placeAt) await page.waitForTimeout(placeAt - Date.now() + 1000)
    const before = await page.evaluate(id => window.__tinctLibraryTwoReading.readerDestination(id, null), id)
    assert.equal(before, '/reader')
    const handoff = await page.evaluate(() => JSON.parse(sessionStorage.getItem('tinct:lab-reader-handoff') || 'null'))
    assert.deepEqual(handoff?.savedPlace, { bookId: id, chapterNumber: 5, page: 0, paragraphIndex: 2, wordIndex: 0 }, `${label}: a removed book still opens at its place`)
    await page.goto('/reader', { waitUntil: 'domcontentloaded' })
    await page.waitForFunction(() => document.querySelector('[data-testid="lab-root"]')?.dataset.readerReady === 'true', null, { timeout: 60000 })
    const opened = await page.evaluate(() => document.querySelector('[data-testid="lab-root"]')?.dataset.chapter)
    assert.equal(String(opened), '5', `${label}: the reader opens ${title} at its chapter`)
    await page.waitForTimeout(1500)
    await page.keyboard.press('ArrowRight')
    await page.waitForFunction(({ id, at }) => (JSON.parse(localStorage.getItem('tinct-lab-position') || 'null')?.books?.[id]?.updatedAt ?? 0) > at, { id, at: placeAt }, { timeout: 45000 })
    const read = (await books())[id]
    assert(read.chapterNumber > 5 || (read.chapterNumber === 5 && (read.paragraphIndex > 2 || read.pageIndex > 0)), `${label}: one page turn moved the place forward ${JSON.stringify(read)}`)
    if (ARTIFACTS) await page.screenshot({ path: path.join(ARTIFACTS, `${label}-reading.png`) })
    await page.waitForTimeout(1500)
    await openLibrary(page, id)
    assert.equal((await readingIds(page))[0], id, `${label}: reading ${title} again brings it back to Currently reading, first`)
    await openMyShelf(page)
    await page.waitForFunction(id => document.querySelector(`#collection-books article.collection-card[data-book="${id}"]`)?.dataset.shelfGroup === 'reading', id)
    assert.equal(await page.evaluate(id => window.__tinctLibraryTwoReading.readerDestination(id, null), id), '/reader')
    const resume = await page.evaluate(() => JSON.parse(sessionStorage.getItem('tinct:lab-reader-handoff') || 'null'))
    assert.deepEqual(resume?.savedPlace, { bookId: id, chapterNumber: read.chapterNumber, page: read.pageIndex, paragraphIndex: read.paragraphIndex, wordIndex: read.wordIndex }, `${label}: Continue resumes at the place read`)
    if (ARTIFACTS) await page.screenshot({ path: path.join(ARTIFACTS, `${label}-read-again.png`) })
    assert.equal(state.libraryPositionPuts || 0, 0, `${label}: the library wrote no reading position`)
    assert.deepEqual(errors, [], `${label}: no page errors`)
    console.log('SHELF_REMOVE ' + JSON.stringify({ label, removedRow: row, placeAt, seenFor10s: 'off', reload: 'off', otherDevice: 'off', read: { chapterNumber: read.chapterNumber, paragraphIndex: read.paragraphIndex, pageIndex: read.pageIndex, updatedAt: read.updatedAt }, readAgain: 'back' }))
  } finally { await c.close() }
}

const server = await serve()
const origin = `http://127.0.0.1:${server.address().port}`
const browser = await markInternal(await chromium.launch({ headless: true, args: ['--mute-audio', '--disable-dev-shm-usage'], ...(process.env.PW_CHROMIUM_EXECUTABLE ? { executablePath: process.env.PW_CHROMIUM_EXECUTABLE } : {}) }))
try {
  if (ARTIFACTS) await fs.mkdir(ARTIFACTS, { recursive: true })
  const supabase = await supabaseHost()
  const now = Date.now()
  // Unsaved (or removed) ten days ago, read two days ago: the account row is already a tombstone.
  await scenario(browser, origin, supabase, { label: 'old-tombstone', id: 'the-prince', title: 'The Prince', placeAt: now - 2 * DAY, shelf: [{ key: 'library-shelf:the-prince', value: null, rev: 3, updated_at: new Date(now - 10 * DAY).toISOString() }] })
  // Read on another device whose clock runs a minute ahead of this one; no shelf row yet.
  await scenario(browser, origin, supabase, { label: 'clock-ahead', id: 'the-prince', title: 'The Prince', placeAt: Date.now() + 60000, shelf: [] })
} finally {
  await browser.close()
  server.close()
}
console.log('Remove from shelf stays removed until the book is read again')
