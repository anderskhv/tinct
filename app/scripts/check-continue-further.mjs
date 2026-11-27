// "Continue from chapter 7": when another device has put this device back a chapter or more in a book, the reader
// offers the place this device had read to, once, on the page it lands on (labFurtherPlace.ts). 17 Nov 2026: a
// reader in chapter 5 on the phone opened chapter 4 on a PC to ask about it; the phone came back in chapter 4 and
// had to find its own way forward. The rule stays (the newest place on any device wins, backwards too).
// On a built app (dist/), in Chromium, signed in, on the desktop (1440×900) and a phone (390×844). This device read
// Frankenstein to its eleventh section, which the book calls Chapter 7 (four letters come first); another device then
// saved the seventh section (Chapter 3). The reader opens:
// - in the seventh section, with one button, "Continue from chapter 7" (the book's own name for the place);
// - tapping it lands on the saved word in the eleventh section, the button leaves, and that place is what the
//   account holds (the chapter's first word is saved on the way, as for any jump from Contents; never section 7 again);
// - turning the page instead withdraws the button, and the reader stays in the seventh section;
// - no button when the other device's place is further on, or in the same chapter.
// cd app && npm run build && node scripts/check-continue-further.mjs   (TINCT_DIST=<dir> for another build)
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import { createServer } from 'node:http'
import { markInternal } from './lib/internalTraffic.cjs'

const playwright = await import(process.env.PLAYWRIGHT_MODULE || '@playwright/test')
const { chromium } = playwright.chromium ? playwright : playwright.default
const dist = path.resolve(process.env.TINCT_DIST || 'dist')
const output = process.env.TINCT_CONTINUE_FURTHER_OUTPUT || 'artifacts/continue-further'
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
const HERE = '11111111-1111-4111-8111-111111111111'
const pin = (chapter, paragraphIndex, wordIndex, updatedAt, deviceId, rev) => ({ bookId: 'frankenstein', headerBook: 'Frankenstein', chapterNumber: chapter, sequentialChapter: chapter, paragraphIndex, wordIndex, pageIndex: 0, primaryEditionKey: 'original-en', readerMode: 'read', updatedAt, deviceId, rev })
const record = (place, deviceId) => ({ books: { frankenstein: place }, recentChapters: {}, finished: {}, lastSettledBookId: 'frankenstein', lastSettledAt: place.updatedAt, updatedAt: place.updatedAt, owner: USER, hidden: {}, deviceId })
// This device read to chapter 11 this morning.
const here = record(pin(11, 20, 40, now - 8 * 3_600_000, HERE, 30), HERE)
const other = (chapter, paragraphIndex, wordIndex) => record(pin(chapter, paragraphIndex, wordIndex, now - 60_000, 'qa-other-device', 31), 'qa-other-device')

const browser = await markInternal(await chromium.launch({ headless: true, args: ['--mute-audio'] }))
const DESKTOP = { viewport: { width: 1440, height: 900 } }
const PHONE = { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 }
const BUTTON = '[data-testid="lab-continue-further"]'

async function open(name, device, cloud) {
  const context = await browser.newContext({ ...device, reducedMotion: 'reduce', serviceWorkers: 'block' })
  const page = await context.newPage()
  const errors = [], puts = []
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
  await page.addInitScript(({ user, keys, here, deviceId }) => {
    if (sessionStorage.getItem('continue-further-seeded')) return
    sessionStorage.setItem('continue-further-seeded', '1')
    const session = JSON.stringify({ access_token: 'qa', refresh_token: 'qa-refresh', token_type: 'bearer', expires_in: 360000, expires_at: Math.floor(Date.now() / 1000) + 360000, user: { id: user, email: 'reader@example.com', aud: 'authenticated', user_metadata: {} } })
    for (const key of keys) localStorage.setItem(key, session)
    document.cookie = 'tinct_auth=1; path=/'
    localStorage.setItem('tinct-lab-device-id', deviceId)
    localStorage.setItem('tinct-lab-position', JSON.stringify(here))
  }, { user: USER, keys: [...bundleKeys], here, deviceId: HERE })
  const look = () => page.evaluate(button => {
    const lab = document.querySelector('.lab')
    if (!lab || lab.dataset.readerReady !== 'true') return null
    const offer = document.querySelector(button)
    const box = offer?.getBoundingClientRect()
    return { chapter: Number(lab.dataset.chapter), place: lab.dataset.place, offer: offer && box.width > 0 && box.height > 0 ? offer.textContent.trim() : null }
  }, BUTTON)
  const settled = async (ms, done = () => false) => { const start = Date.now(); let last = null; while (Date.now() - start < ms) { const seen = await look(); if (seen) { last = seen; if (done(seen)) break } await page.waitForTimeout(250) } return last }
  await page.goto(`${origin}/reader`, { waitUntil: 'domcontentloaded' })
  const first = await settled(7000)
  await page.screenshot({ path: `${output}/${name}.png` })
  const sent = () => [...new Set(puts.flatMap(item => Object.values(item?.books ?? {})).filter(item => item.bookId === 'frankenstein').map(item => `${item.sequentialChapter}:${item.paragraphIndex}:${item.wordIndex}`))]
  return { context, page, first, settled, sent, errors, puts }
}

async function run(label, device) {
  // Tap the button.
  {
    const name = `${label}-tap`
    const { context, page, first, settled, sent, errors, puts } = await open(name, device, other(7, 12, 5))
    ok(`${name}: the reader follows the other device to the seventh section`, first?.chapter === 7 && first.place === '12:5', first)
    ok(`${name}: one button offers the place this device had`, first?.offer === 'Continue from chapter 7', first?.offer)
    const box = await page.locator(BUTTON).boundingBox()
    const view = page.viewportSize()
    ok(`${name}: the button is on screen, centred at the foot of the page`, !!box && box.y > view.height * 0.6 && box.y + box.height <= view.height && Math.abs(box.x + box.width / 2 - view.width / 2) < 4, box)
    puts.length = 0
    await page.locator(BUTTON).click()
    const landed = await settled(8000, seen => seen.chapter === 11 && seen.place === '20:40')
    await page.waitForTimeout(1500)
    const after = await settled(600)
    await page.screenshot({ path: `${output}/${name}-after.png` })
    ok(`${name}: the button lands on the saved word in the eleventh section`, landed?.chapter === 11 && landed.place === '20:40' && after?.chapter === 11 && after.place === '20:40', { landed, after })
    ok(`${name}: the button has left`, after?.offer === null, after?.offer)
    const kept = await page.evaluate(() => { const saved = JSON.parse(localStorage.getItem('tinct-lab-position') || 'null')?.books?.frankenstein; return saved ? `${saved.sequentialChapter}:${saved.paragraphIndex}:${saved.wordIndex}` : null })
    await page.evaluate(() => document.dispatchEvent(new Event('visibilitychange')))
    ok(`${name}: the eleventh section is this device's place again`, kept === '11:20:40', kept)
    await page.waitForTimeout(2500)
    const tuples = puts.flatMap(item => Object.values(item?.books ?? {})).filter(item => item.bookId === 'frankenstein').map(item => `${item.sequentialChapter}:${item.paragraphIndex}:${item.wordIndex}`)
    ok(`${name}: and is what the account holds, never the seventh section again`, tuples.at(-1) === '11:20:40' && tuples.every(tuple => tuple.startsWith('11:')), sent())
    ok(`${name}: no page errors`, errors.length === 0, errors.slice(0, 3))
    await context.close()
  }
  // Read on instead: the next page withdraws the offer.
  {
    const name = `${label}-read-on`
    const { context, page, first, settled, errors } = await open(name, device, other(7, 12, 5))
    ok(`${name}: the button is offered`, first?.offer === 'Continue from chapter 7', first)
    if (device.isMobile) await page.locator('[data-testid="lab-page-next"]').dispatchEvent('click')
    else await page.keyboard.press('ArrowRight')
    const turned = await settled(2500, seen => seen.offer === null && seen.place !== first?.place)
    await page.screenshot({ path: `${output}/${name}-after.png` })
    ok(`${name}: the page turned inside the seventh section`, turned?.chapter === 7 && turned.place !== first?.place, turned)
    ok(`${name}: the button left with the page turn`, turned?.offer === null, turned?.offer)
    if (device.isMobile) await page.locator('[data-testid="lab-page-prev"]').dispatchEvent('click').catch(() => {})
    else await page.keyboard.press('ArrowLeft')
    const back = await settled(1500)
    ok(`${name}: and does not come back on the earlier page`, back?.offer === null, back)
    ok(`${name}: no page errors`, errors.length === 0, errors.slice(0, 3))
    await context.close()
  }
  // No offer for a move forward or inside the chapter.
  for (const [what, cloud, chapter] of [['forward', other(13, 2, 0), 13], ['same-chapter', other(11, 4, 0), 11]]) {
    const name = `${label}-${what}`
    const { context, first, errors } = await open(name, device, cloud)
    ok(`${name}: the reader follows the other device (section ${chapter})`, first?.chapter === chapter, first)
    ok(`${name}: no button`, first?.offer === null, first?.offer)
    ok(`${name}: no page errors`, errors.length === 0, errors.slice(0, 3))
    await context.close()
  }
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
