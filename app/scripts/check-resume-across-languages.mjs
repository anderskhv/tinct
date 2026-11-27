// A place saved in one language opens on a device that had the book open in another (27 Nov 2026). The reader
// loaded the account's place with the audio edition this device had open; the loader refuses narration in another
// language than the text, so a Danish place on a device showing English (or the reverse) never loaded. The reader
// stayed on its old chapter under "Your saved chapter is temporarily unavailable", this device's record already
// held the account's place, and the next page turn saved the old chapter as the newest place.
// On a built app (dist/), in Chromium, signed in, at /reader?book=crito, on the desktop (1440×900) and a phone
// (390×844). The account holds Crito at chapter 2, paragraph 4, word 3:
// - saved in modern Danish, nothing on this device (which opens Modern English): chapter 2 in Danish, at the word;
// - saved in the original, this device at chapter 1 in Danish: chapter 2 in the original, at the word;
// - saved in modern Danish, this device at chapter 1 in the original: chapter 2 in Danish, at the word.
// In each: no load error on screen, and nothing sent to the account leaves chapter 2 paragraph 4.
// cd app && npm run build && node scripts/check-resume-across-languages.mjs   (TINCT_DIST=<dir> for another build)
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import { createServer } from 'node:http'
import { markInternal } from './lib/internalTraffic.cjs'

// PLAYWRIGHT_MODULE: another Playwright build (a machine whose installed browsers are not this project's).
const playwright = await import(process.env.PLAYWRIGHT_MODULE || '@playwright/test')
const { chromium } = playwright.chromium ? playwright : playwright.default
const dist = path.resolve(process.env.TINCT_DIST || 'dist')
const output = process.env.TINCT_RESUME_LANGUAGES_OUTPUT || 'artifacts/resume-across-languages'
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
const pin = (edition, chapter, paragraphIndex, wordIndex, updatedAt, rev) => ({ bookId: 'crito', headerBook: 'Crito', chapterNumber: chapter, sequentialChapter: chapter, paragraphIndex, wordIndex, pageIndex: 0, primaryEditionKey: edition, readerMode: 'read', updatedAt, deviceId: 'qa-other-device', rev })
const record = place => ({ books: { crito: place }, recentChapters: {}, finished: {}, lastSettledBookId: 'crito', lastSettledAt: place.updatedAt, updatedAt: place.updatedAt, owner: USER, hidden: {}, deviceId: 'qa-other-device' })
// The account's place, an hour old; what this device still holds is from this morning.
const onAccount = edition => record(pin(edition, 2, 4, 3, now - 3_600_000, 9))
const onDevice = edition => record(pin(edition, 1, 2, 0, now - 9 * 3_600_000, 3))

const browser = await markInternal(await chromium.launch({ headless: true, args: ['--mute-audio'] }))
const DESKTOP = { viewport: { width: 1440, height: 900 } }
const PHONE = { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 }

async function run(name, device, { saved, here }) {
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
      return json(200, onAccount(saved))
    }
    if (u.pathname === '/api/user-books/places') return json(200, { places: {} })
    if (u.pathname.startsWith('/api/')) return json(404, {})
    return route.continue()
  })
  await page.addInitScript(({ user, keys, local }) => {
    if (sessionStorage.getItem('resume-languages-seeded')) return
    sessionStorage.setItem('resume-languages-seeded', '1')
    const session = JSON.stringify({ access_token: 'qa', refresh_token: 'qa-refresh', token_type: 'bearer', expires_in: 360000, expires_at: Math.floor(Date.now() / 1000) + 360000, user: { id: user, email: 'reader@example.com', aud: 'authenticated', user_metadata: {} } })
    for (const key of keys) localStorage.setItem(key, session)
    document.cookie = 'tinct_auth=1; path=/'
    if (local) localStorage.setItem('tinct-lab-position', JSON.stringify(local))
  }, { user: USER, keys: [...bundleKeys], local: here ? onDevice(here) : null })
  const look = () => page.evaluate(() => {
    const lab = document.querySelector('.lab')
    if (!lab) return null
    const [p, w] = (lab.dataset.place || '').split(':')
    const word = document.querySelector(`[data-testid="lab-word"][data-paragraph-index="${p}"][data-word-index="${w}"]`)
    return {
      ready: lab.dataset.readerReady === 'true', chapter: Number(lab.dataset.chapter), place: lab.dataset.place, edition: lab.dataset.readerEdition,
      wordShown: word ? word.textContent : null,
      loadError: /temporarily unavailable/i.test(document.body.innerText || ''),
    }
  })
  await page.goto(`${origin}/reader?book=crito`, { waitUntil: 'domcontentloaded' })
  const start = Date.now()
  let last = null
  while (Date.now() - start < 9000) {
    last = await look() ?? last
    if (last?.ready && last.chapter === 2 && last.edition === saved) { await page.waitForTimeout(1500); last = await look() ?? last; break }
    await page.waitForTimeout(250)
  }
  await page.screenshot({ path: `${output}/${name}.png` })
  ok(`${name}: opens the account's chapter, in the edition it was saved in (${saved})`, !!last?.ready && last.chapter === 2 && last.edition === saved, last)
  ok(`${name}: at the saved word, which is on the page`, last?.place === '4:3' && !!last.wordShown, { place: last?.place, word: last?.wordShown })
  ok(`${name}: no load error on screen`, last?.loadError === false, last?.loadError)
  // Read on one page: what is saved then is in the account's chapter, never this device's old one.
  if (device.isMobile) await page.locator('[data-testid="lab-page-next"]').dispatchEvent('click')
  else await page.keyboard.press('ArrowRight')
  await page.waitForTimeout(2500)
  const turned = await look()
  ok(`${name}: the next page is still in chapter 2`, turned?.chapter === 2 && turned.edition === saved, turned)
  const sent = puts.flatMap(item => Object.values(item?.books ?? {})).filter(item => item.bookId === 'crito').map(item => `${item.primaryEditionKey}:${item.sequentialChapter}`)
  ok(`${name}: everything sent to the account is chapter 2 in ${saved}`, sent.length > 0 && sent.every(tuple => tuple === `${saved}:2`), [...new Set(sent)])
  ok(`${name}: no page errors`, errors.length === 0, errors.slice(0, 3))
  await context.close()
}

try {
  for (const [label, device] of [['desktop', DESKTOP], ['phone', PHONE]]) {
    await run(`${label}-danish-place-new-device`, device, { saved: 'modern-da', here: null })
    await run(`${label}-english-place-danish-device`, device, { saved: 'original-en', here: 'modern-da' })
    await run(`${label}-danish-place-english-device`, device, { saved: 'modern-da', here: 'original-en' })
  }
} finally {
  await browser.close()
  server.close()
}
const failed = results.filter(result => !result.pass)
console.log(`\n${results.length - failed.length}/${results.length} passed`)
assert.equal(failed.length, 0, failed.map(result => result.label).join('; '))
