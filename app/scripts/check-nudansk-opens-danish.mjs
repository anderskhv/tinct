// A book opened from the Danish page is read in Danish (Anders, 27 Nov 2026: "you pick a Danish book and then you
// open it in English"). A guest gets free mode in modern Danish. A signed-in visitor gets the normal reader at the
// same address (freeMode.ts), which opened the edition of their saved place, or English for a book they had not
// opened. Now the link's mark (ref=nudansk, also what /nudansk/<title> redirects to) asks for modern Danish:
// the reader opens at the reader's place, then changes edition the way its own edition choice does.
// On a built app (dist/), in Chromium, on the desktop (1440×900) and a phone (390×844):
// - signed in, Crito saved in the original at chapter 2 paragraph 4: opens in modern Danish, still chapter 2
//   paragraph 4, and nothing sent to the account moves to another chapter or paragraph;
// - a reload is still in Danish; the reader then chooses the original and reloads: the original stays;
// - signed in, no place in the book: opens in modern Danish at its start;
// - the same book without the Danish page's mark opens as before, in the saved edition;
// - a guest from /nudansk reads modern Danish in free mode.
// cd app && npm run build && node scripts/check-nudansk-opens-danish.mjs   (TINCT_DIST=<dir> for another build)
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import { createServer } from 'node:http'
import { markInternal } from './lib/internalTraffic.cjs'

// PLAYWRIGHT_MODULE: another Playwright build (a machine whose installed browsers are not this project's).
const playwright = await import(process.env.PLAYWRIGHT_MODULE || '@playwright/test')
const { chromium } = playwright.chromium ? playwright : playwright.default
const dist = path.resolve(process.env.TINCT_DIST || 'dist')
const output = process.env.TINCT_NUDANSK_OPENS_OUTPUT || 'artifacts/nudansk-opens-danish'
await fs.mkdir(output, { recursive: true })
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.woff2': 'font/woff2', '.svg': 'image/svg+xml', '.wasm': 'application/wasm', '.mjs': 'text/javascript' }
const server = createServer(async (req, res) => {
  const url = new URL(req.url || '/', 'http://127.0.0.1')
  const file = path.resolve(dist, '.' + (url.pathname === '/reader' ? '/app.html' : url.pathname === '/' ? '/index.html' : url.pathname))
  if (!file.startsWith(dist + path.sep)) { res.writeHead(403); res.end(); return }
  try {
    const body = await fs.readFile(file)
    res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' }); res.end(body)
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
const critoOriginal = { bookId: 'crito', headerBook: 'Crito', chapterNumber: 2, sequentialChapter: 2, paragraphIndex: 4, wordIndex: 3, pageIndex: 0, primaryEditionKey: 'original-en', readerMode: 'read', updatedAt: now - 3_600_000, deviceId: 'qa-other-device', rev: 9 }
const record = (books, latest) => ({ books, recentChapters: {}, finished: {}, lastSettledBookId: latest, lastSettledAt: now - 3_600_000, updatedAt: now - 3_600_000, owner: USER, hidden: {}, deviceId: 'qa-other-device' })
const withCrito = record({ crito: critoOriginal }, 'crito')
const empty = record({}, null)

const browser = await markInternal(await chromium.launch({ headless: true, args: ['--mute-audio'] }))
const DESKTOP = { viewport: { width: 1440, height: 900 } }
const PHONE = { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 }

async function open(device, { cloud, signedIn, url }) {
  const context = await browser.newContext({ ...device, reducedMotion: 'reduce', serviceWorkers: 'block' })
  const page = await context.newPage()
  const errors = [], puts = []
  page.on('pageerror', error => errors.push(error.message))
  await page.route('**/*', async route => {
    const request = route.request(), u = new URL(request.url())
    const json = (status, body) => route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) })
    if (u.hostname.endsWith('.supabase.co')) return signedIn && u.pathname === '/auth/v1/user' ? json(200, { id: USER, aud: 'authenticated', email: 'reader@example.com' }) : json(signedIn ? 503 : 401, {})
    if (u.origin !== origin) return route.fulfill({ status: 401, json: {} })
    if (u.pathname === '/api/lab-position') {
      if (!signedIn) return json(401, {})
      if (request.method() !== 'GET') { puts.push(request.postDataJSON()); return json(200, {}) }
      return json(200, cloud)
    }
    if (u.pathname === '/api/user-books/places') return json(200, { places: {} })
    if (u.pathname.startsWith('/api/')) return json(404, {})
    return route.continue()
  })
  if (signedIn) {
    await page.addInitScript(({ user, keys }) => {
      if (sessionStorage.getItem('nudansk-opens-seeded')) return
      sessionStorage.setItem('nudansk-opens-seeded', '1')
      const session = JSON.stringify({ access_token: 'qa', refresh_token: 'qa-refresh', token_type: 'bearer', expires_in: 360000, expires_at: Math.floor(Date.now() / 1000) + 360000, user: { id: user, email: 'reader@example.com', aud: 'authenticated', user_metadata: {} } })
      for (const key of keys) localStorage.setItem(key, session)
      document.cookie = 'tinct_auth=1; path=/'
    }, { user: USER, keys: [...bundleKeys] })
  }
  const look = () => page.evaluate(() => {
    const lab = document.querySelector('.lab')
    if (!lab || lab.dataset.readerReady !== 'true') return null
    return { book: lab.dataset.bookId, chapter: Number(lab.dataset.chapter), place: lab.dataset.place, edition: lab.dataset.readerEdition, free: location.search.includes('mode=free') }
  })
  const settled = async (ms, done = () => false) => {
    const start = Date.now()
    let last = null
    while (Date.now() - start < ms) {
      const seen = await look()
      if (seen) {
        last = seen
        if (done(seen)) { await page.waitForTimeout(1200); last = await look() ?? last; break }
      }
      await page.waitForTimeout(250)
    }
    return last
  }
  await page.goto(`${origin}${url}`, { waitUntil: 'domcontentloaded' })
  const sent = () => [...new Set(puts.flatMap(item => Object.values(item?.books ?? {})).filter(item => item.bookId === 'crito').map(item => `${item.primaryEditionKey}:${item.sequentialChapter}:${item.paragraphIndex}`))]
  return { context, page, settled, sent, errors }
}

async function run(label, device) {
  {
    const name = `${label}-saved-place`
    const { context, page, settled, sent, errors } = await open(device, { cloud: withCrito, signedIn: true, url: '/reader?book=crito&ref=nudansk' })
    const seen = await settled(12000, item => item.edition === 'modern-da' && item.chapter === 2)
    await page.screenshot({ path: `${output}/${name}.png` })
    ok(`${name}: opens in modern Danish`, seen?.edition === 'modern-da' && seen.book === 'crito', seen)
    ok(`${name}: at the saved chapter and paragraph`, seen?.chapter === 2 && seen.place?.split(':')[0] === '4', { chapter: seen?.chapter, place: seen?.place })
    ok(`${name}: in the normal reader, not free mode`, seen?.free === false, seen?.free)
    await page.waitForTimeout(2500)
    ok(`${name}: nothing sent to the account leaves chapter 2 paragraph 4`, sent().every(tuple => tuple.endsWith(':2:4')), sent())
    // A reload before any page turn: still Danish (the place is saved in Danish only at the next page turn).
    await page.reload({ waitUntil: 'domcontentloaded' })
    const reloaded = await settled(12000, item => item.edition === 'modern-da' && item.chapter === 2)
    ok(`${name}: a reload is still in modern Danish at the saved place`, reloaded?.edition === 'modern-da' && reloaded.chapter === 2 && reloaded.place?.split(':')[0] === '4', reloaded)
    // The reader then picks the original, by the reader's own command; that choice stands through a reload.
    await page.evaluate(() => window.__tinctDesktopCommands.commands.find(command => command.id === 'original').run())
    const original = await settled(8000, item => item.edition === 'original-en')
    ok(`${name}: the reader can still choose the original, at the same place`, original?.edition === 'original-en' && original.chapter === 2 && original.place?.split(':')[0] === '4', original)
    await page.waitForTimeout(1500)
    await page.reload({ waitUntil: 'domcontentloaded' })
    const again = await settled(7000)
    ok(`${name}: and a reload keeps that choice`, again?.edition === 'original-en' && again.chapter === 2, again)
    ok(`${name}: no page errors`, errors.length === 0, errors.slice(0, 3))
    await context.close()
  }
  {
    const name = `${label}-new-book`
    const { context, page, settled, errors } = await open(device, { cloud: empty, signedIn: true, url: '/reader?book=crito&ref=nudansk' })
    const seen = await settled(12000, item => item.edition === 'modern-da')
    await page.screenshot({ path: `${output}/${name}.png` })
    ok(`${name}: a book with no place opens in modern Danish at its start`, seen?.edition === 'modern-da' && seen.chapter === 1 && seen.place === '0:0', seen)
    ok(`${name}: no page errors`, errors.length === 0, errors.slice(0, 3))
    await context.close()
  }
  {
    const name = `${label}-no-mark`
    const { context, settled, errors } = await open(device, { cloud: withCrito, signedIn: true, url: '/reader?book=crito' })
    const seen = await settled(7000)
    ok(`${name}: without the Danish page's mark the saved edition opens, as before`, seen?.edition === 'original-en' && seen.chapter === 2 && seen.place === '4:3', seen)
    ok(`${name}: no page errors`, errors.length === 0, errors.slice(0, 3))
    await context.close()
  }
  {
    const name = `${label}-guest`
    const { context, page, settled, errors } = await open(device, { cloud: empty, signedIn: false, url: '/reader?book=crito&mode=free&ref=nudansk' })
    const seen = await settled(12000, item => item.edition === 'modern-da')
    await page.screenshot({ path: `${output}/${name}.png` })
    ok(`${name}: a guest from /nudansk reads modern Danish in free mode`, seen?.edition === 'modern-da' && seen.free === true, seen)
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
