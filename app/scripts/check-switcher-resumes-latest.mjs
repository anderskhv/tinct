// A book opened from the book switcher opens at the account's newest place, never at this device's older copy of it
// (17 Nov 2026: a reader in chapter 5 on the phone opened the book on a PC through the switcher of another book; the
// PC still held the morning's place in chapter 4, opened there, and saved chapter 4 over the phone's chapter 5).
// The switcher's rows come from this device's record, which is as old as the last time this device asked the account:
// hours in a tab left open, days in the reader's own books, which never ask. The hand-off therefore names the book
// and lets the reader resolve its newest place, exactly as Continue in the library does.
// On a built app (dist/), in Chromium, signed in, on the desktop (1440×900) and a phone (390×844):
// 1. the reader opens Crito, the account's latest book; the account also holds Frankenstein at chapter 7;
// 2. another device then reads Frankenstein on to chapter 11 (the account answers with that from now on);
// 3. the reader opens the switcher and picks Frankenstein; this device still holds chapter 7 for it.
// Then the reader shows chapter 11 at the saved word, and no save to the account moves Frankenstein back to chapter 7.
// cd app && npm run build && node scripts/check-switcher-resumes-latest.mjs   (TINCT_DIST=<dir> for another build)
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import { createServer } from 'node:http'
import { markInternal } from './lib/internalTraffic.cjs'

const playwright = await import(process.env.PLAYWRIGHT_MODULE || '@playwright/test')
const { chromium } = playwright.chromium ? playwright : playwright.default
const dist = path.resolve(process.env.TINCT_DIST || 'dist')
const output = process.env.TINCT_SWITCHER_RESUME_OUTPUT || 'artifacts/switcher-resumes-latest'
await fs.mkdir(output, { recursive: true })
const server = createServer(async (req, res) => {
  const url = new URL(req.url || '/', 'http://127.0.0.1')
  const file = path.resolve(dist, '.' + (url.pathname === '/reader' ? '/app.html' : url.pathname === '/' ? '/index.html' : url.pathname))
  if (!file.startsWith(dist + path.sep)) { res.writeHead(403); res.end(); return }
  try {
    const body = await fs.readFile(file)
    const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.woff2': 'font/woff2', '.svg': 'image/svg+xml', '.wasm': 'application/wasm', '.mjs': 'text/javascript' }[path.extname(file)] || 'application/octet-stream'
    res.writeHead(200, { 'Content-Type': mime }); res.end(body)
  } catch { res.writeHead(404); res.end() }
})
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
const origin = `http://127.0.0.1:${server.address().port}`
// The built client's own session key (sb-<project>-auth-token), so the reader is signed in from its first paint.
const bundleKeys = new Set(['sb-qa-auth-token'])
for (const name of await fs.readdir(path.join(dist, 'assets'))) {
  if (!name.endsWith('.js')) continue
  for (const match of (await fs.readFile(path.join(dist, 'assets', name), 'utf8')).matchAll(/https:\/\/([a-z0-9]+)\.supabase\.co/g)) bundleKeys.add(`sb-${match[1]}-auth-token`)
}
const USER = '00000000-0000-4000-8000-0000000000ab'
const results = []
const ok = (label, pass, detail) => { results.push({ label, pass, detail }); console.log(`${pass ? 'ok  ' : 'FAIL'} ${label}${detail !== undefined ? ' ' + JSON.stringify(detail).slice(0, 600) : ''}`) }

const now = Date.now()
const pin = (bookId, headerBook, chapter, paragraphIndex, wordIndex, updatedAt, rev) => ({ bookId, headerBook, chapterNumber: chapter, sequentialChapter: chapter, paragraphIndex, wordIndex, pageIndex: 0, primaryEditionKey: 'original-en', readerMode: 'read', updatedAt, deviceId: 'qa-other-device', rev })
const record = (books, latest, at) => ({ books, recentChapters: {}, finished: {}, lastSettledBookId: latest, lastSettledAt: at, updatedAt: at, owner: USER, hidden: {}, deviceId: 'qa-other-device' })
const crito = pin('crito', 'Crito', 2, 3, 0, now - 3_600_000, 9)
const frankEarlier = pin('frankenstein', 'Frankenstein', 7, 12, 5, now - 8 * 3_600_000, 4)
const frankLatest = pin('frankenstein', 'Frankenstein', 11, 20, 40, now - 60_000, 31)
// What the account answers before and after the other device reads on.
const before = record({ crito, frankenstein: frankEarlier }, 'crito', crito.updatedAt)
const after = record({ crito, frankenstein: frankLatest }, 'frankenstein', frankLatest.updatedAt)

const browser = await markInternal(await chromium.launch({ headless: true, args: ['--mute-audio'] }))
const DESKTOP = { viewport: { width: 1440, height: 900 } }
const PHONE = { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 }

async function run(name, device) {
  const context = await browser.newContext({ ...device, reducedMotion: 'reduce', serviceWorkers: 'block' })
  const page = await context.newPage()
  const errors = [], puts = []
  let cloud = before
  page.on('pageerror', error => errors.push(error.message))
  await page.route('**/*', async route => {
    const request = route.request(), u = new URL(request.url())
    const json = (status, body) => route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) })
    if (u.hostname.endsWith('.supabase.co')) return u.pathname === '/auth/v1/user' ? json(200, { id: USER, aud: 'authenticated', email: 'reader@example.com' }) : json(503, {})
    if (u.origin !== origin) return route.fulfill({ status: 401, json: {} })
    if (u.pathname === '/api/lab-position') {
      if (request.method() !== 'GET') { puts.push(request.postDataJSON()); return json(200, {}) }
      return json(200, cloud)
    }
    if (u.pathname === '/api/user-books/places') return json(200, { places: {} })
    if (u.pathname.startsWith('/api/')) return json(404, {})
    return route.continue()
  })
  await page.addInitScript(({ user, keys }) => {
    if (sessionStorage.getItem('switcher-resume-seeded')) return
    sessionStorage.setItem('switcher-resume-seeded', '1')
    const session = JSON.stringify({ access_token: 'qa', refresh_token: 'qa-refresh', token_type: 'bearer', expires_in: 360000, expires_at: Math.floor(Date.now() / 1000) + 360000, user: { id: user, email: 'reader@example.com', aud: 'authenticated', user_metadata: {} } })
    for (const key of keys) localStorage.setItem(key, session)
    document.cookie = 'tinct_auth=1; path=/'
  }, { user: USER, keys: [...bundleKeys] })
  const look = () => page.evaluate(() => {
    const lab = document.querySelector('.lab')
    if (!lab || lab.dataset.readerReady !== 'true') return null
    const saved = JSON.parse(localStorage.getItem('tinct-lab-position') || 'null')?.books?.frankenstein ?? null
    return { book: lab.dataset.bookId, chapter: Number(lab.dataset.chapter), place: lab.dataset.place, kept: saved ? `${saved.sequentialChapter}:${saved.paragraphIndex}:${saved.wordIndex}` : null }
  })
  const settled = async (book, ms) => { const start = Date.now(); let last = null; while (Date.now() - start < ms) { const seen = await look(); if (seen?.book === book) last = seen; await page.waitForTimeout(250) } return last }

  await page.goto(`${origin}/reader`, { waitUntil: 'domcontentloaded' })
  const first = await settled('crito', 6000)
  ok(`${name}: the reader opens the account's latest book, Crito chapter 2`, first?.book === 'crito' && first.chapter === 2, first)
  ok(`${name}: this device now holds Frankenstein at chapter 7`, first?.kept === '7:12:5', first?.kept)

  // Another device reads Frankenstein on. This tab stays open and does not hear of it.
  cloud = after
  puts.length = 0
  // On a phone the first tap on the title brings the bars back; the next one opens the switcher.
  const switcher = page.locator('[data-testid="lab-book-switcher"]')
  for (let attempt = 0; attempt < 3 && !(await switcher.isVisible()); attempt += 1) {
    await page.locator('[data-testid="lab-header-book"]').click()
    await switcher.waitFor({ timeout: 1500 }).catch(() => {})
  }
  const row = page.locator('[data-testid="lab-book-switcher"] .lab-book-switcher-row', { hasText: 'Frankenstein' })
  await row.waitFor({ timeout: 10_000 })
  await page.screenshot({ path: `${output}/${name}-switcher.png` })
  await Promise.all([page.waitForNavigation({ waitUntil: 'domcontentloaded' }), row.click()])
  const opened = await settled('frankenstein', 8000)
  await page.screenshot({ path: `${output}/${name}-opened.png` })
  ok(`${name}: Frankenstein opens at the account's newest place, chapter 11`, opened?.chapter === 11 && opened.place === '20:40', opened)
  ok(`${name}: this device keeps the newest place`, opened?.kept === '11:20:40', opened?.kept)
  const sent = puts.flatMap(item => Object.values(item?.books ?? {})).filter(item => item.bookId === 'frankenstein').map(item => `${item.sequentialChapter}:${item.paragraphIndex}:${item.wordIndex}`)
  ok(`${name}: nothing sent to the account moves Frankenstein back`, sent.every(tuple => tuple === '11:20:40'), [...new Set(sent)])
  ok(`${name}: no page errors`, errors.length === 0, errors.slice(0, 3))
  await context.close()
}

try {
  await run('desktop', DESKTOP)
  await run('phone', PHONE)
} finally {
  await browser.close()
  server.close()
}
const failed = results.filter(result => !result.pass)
console.log(`\n${results.length - failed.length}/${results.length} passed`)
assert.equal(failed.length, 0, failed.map(result => result.label).join('; '))
