// A place that arrives from the account opens in the edition it was saved in (14 Nov 2026: a KJV place at Luke 13
// paragraph 6 word 150 opened, on a second device, in the BSB, the reader's default, and was saved again there at
// paragraph 6 word 22, another part of the chapter). The account's preferences carry no edition; only this device's
// prefs do, so every fresh browser met it.
// On a built app (dist/), in Chromium, signed in, with nothing on this device (no prefs, no position record) and the
// account answering with one place, on the desktop (1440×900, the margin reader's book scroll) and on a phone (390×844):
// - the reader's main edition becomes the saved one;
// - the saved word is the reader's place (data-place) and is on the page;
// - the place kept on this device and every place sent to the account are still the saved tuple, in the saved edition.
// Cases: the Bible (Luke 13, kjv-en, BSB the default), opened at /reader and /reader?book=bible; Frankenstein (Chapter 7,
// original-en, Modern English the default), at /reader and /reader?book=frankenstein. And a place saved in an edition
// the reader may not open (Frankenstein's withdrawn Danish): the default edition at the saved chapter and paragraph.
// cd app && npm run build && node scripts/check-resume-saved-edition.mjs   (TINCT_DIST=<dir> for another build)
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import { createServer } from 'node:http'
import { chromium } from '@playwright/test'
import { markInternal } from './lib/internalTraffic.cjs'

const dist = path.resolve(process.env.TINCT_DIST || 'dist')
const output = process.env.TINCT_RESUME_EDITION_OUTPUT || 'artifacts/resume-saved-edition'
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

const browser = await markInternal(await chromium.launch({ headless: true, args: ['--mute-audio'] }))
const DESKTOP = { viewport: { width: 1440, height: 900 } }
const PHONE = { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 }

/** Open the reader fresh and signed in, the account answering with `cloud`; watch it for 6 s. */
async function run(name, { url, device, cloud, pinKey }) {
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
  await page.addInitScript(({ user, keys }) => {
    if (sessionStorage.getItem('resume-edition-seeded')) return
    sessionStorage.setItem('resume-edition-seeded', '1')
    // Nothing of the reader's on this device: no prefs, no position record. Only the session.
    const session = JSON.stringify({ access_token: 'qa', refresh_token: 'qa-refresh', token_type: 'bearer', expires_in: 360000, expires_at: Math.floor(Date.now() / 1000) + 360000, user: { id: user, email: 'reader@example.com', aud: 'authenticated', user_metadata: {} } })
    for (const key of keys) localStorage.setItem(key, session)
    document.cookie = 'tinct_auth=1; path=/'
  }, { user: USER, keys: [...bundleKeys] })
  const look = () => page.evaluate(({ pinKey }) => {
    const lab = document.querySelector('.lab')
    if (!lab || lab.dataset.readerReady !== 'true') return null
    const stored = JSON.parse(localStorage.getItem('tinct-lab-prefs') || 'null')
    // Version 2 keeps the edition with the shared prefs.
    const prefs = stored?.shared ?? stored
    const saved = JSON.parse(localStorage.getItem('tinct-lab-position') || 'null')?.books?.[pinKey] ?? null
    const [p, w] = (lab.dataset.place || '').split(':')
    const word = document.querySelector(`[data-testid="lab-word"][data-paragraph-index="${p}"][data-word-index="${w}"]`)
    return {
      chapter: Number(lab.dataset.chapter), book: lab.dataset.bookId, place: lab.dataset.place, edition: prefs?.primaryEdition ?? null,
      wordShown: word ? word.textContent : null,
      saved: saved ? { chapter: saved.sequentialChapter, paragraph: saved.paragraphIndex, word: saved.wordIndex, edition: saved.primaryEditionKey ?? null } : null,
    }
  }, { pinKey })
  const start = Date.now()
  await page.goto(`${origin}${url}`, { waitUntil: 'domcontentloaded' })
  const seen = []
  while (Date.now() - start < 6000) {
    const now = await look()
    if (now) seen.push(now)
    await page.waitForTimeout(200)
  }
  await page.screenshot({ path: `${output}/${name}.png` })
  const last = await look()
  await context.close()
  return { seen, last, puts, errors }
}

const at = Date.now() - 3_600_000
const record = (pinKey, place) => ({ books: { [pinKey]: place }, finished: {}, lastSettledBookId: pinKey, lastSettledAt: at, updatedAt: at, owner: USER, hidden: {}, deviceId: 'qa-other-device' })
const lukeKjv = { bookId: 'luke', headerBook: 'Luke', chapterNumber: 13, sequentialChapter: 986, paragraphIndex: 6, wordIndex: 150, primaryEditionKey: 'kjv-en', updatedAt: at, deviceId: 'qa-other-device', rev: 7 }
const frankOriginal = { bookId: 'frankenstein', headerBook: 'Frankenstein', chapterNumber: 11, sequentialChapter: 11, paragraphIndex: 20, wordIndex: 40, primaryEditionKey: 'original-en', updatedAt: at, deviceId: 'qa-other-device', rev: 4 }

/** The reader shows and keeps the saved place, in the saved edition. */
function expectSaved(name, place, { seen, last, puts, errors }) {
  const tuple = `${place.paragraphIndex}:${place.wordIndex}`
  const ready = seen.filter(item => item.chapter === place.sequentialChapter)
  ok(`${name}: opens in the saved chapter (${place.sequentialChapter})`, !!last && last.chapter === place.sequentialChapter, { first: seen[0], last })
  ok(`${name}: opens in the edition the place was saved in (${place.primaryEditionKey})`, !!last && last.edition === place.primaryEditionKey, { edition: last?.edition })
  ok(`${name}: the saved word ${tuple} is the reader's place and is on the page`, !!last && last.place === tuple && !!last.wordShown, { place: last?.place, word: last?.wordShown })
  const wrongEdition = ready.filter(item => item.saved && item.saved.edition !== place.primaryEditionKey)
  const moved = ready.filter(item => item.saved && (item.saved.paragraph !== place.paragraphIndex || item.saved.word !== place.wordIndex))
  ok(`${name}: the place kept on this device stays the saved tuple in ${place.primaryEditionKey}`, wrongEdition.length === 0 && moved.length === 0, { wrongEdition: wrongEdition[0]?.saved, moved: moved[0]?.saved, last: last?.saved })
  const sent = puts.flatMap(item => Object.values(item?.books ?? {})).filter(item => item.bookId === place.bookId)
  ok(`${name}: every place sent to the account is the saved tuple in ${place.primaryEditionKey}`, sent.every(item => item.primaryEditionKey === place.primaryEditionKey && item.paragraphIndex === place.paragraphIndex && item.wordIndex === place.wordIndex),
    sent.map(item => `${item.primaryEditionKey}:${item.sequentialChapter}:${item.paragraphIndex}:${item.wordIndex}`))
  ok(`${name}: no page errors`, errors.length === 0, errors.slice(0, 3))
}

try {
  for (const [label, device] of [['desktop', DESKTOP], ['phone', PHONE]]) {
    for (const url of ['/reader', '/reader?book=bible']) {
      const name = `${label}-bible-kjv${url.includes('?') ? '-book-link' : ''}`
      expectSaved(name, lukeKjv, await run(name, { url, device, cloud: record('luke', lukeKjv), pinKey: 'luke' }))
    }
    for (const url of ['/reader', '/reader?book=frankenstein']) {
      const name = `${label}-frankenstein-original${url.includes('?') ? '-book-link' : ''}`
      expectSaved(name, frankOriginal, await run(name, { url, device, cloud: record('frankenstein', frankOriginal), pinKey: 'frankenstein' }))
    }
    // A place in an edition the reader may not open (Frankenstein's Danish, no longer offered): the book's current
    // edition reads it, in the saved chapter and paragraph, and the reader's text is on screen (no load error).
    const danish = { ...frankOriginal, primaryEditionKey: 'modern-da' }
    const held = await run(`${label}-frankenstein-held`, { url: '/reader?book=frankenstein', device, cloud: record('frankenstein', danish), pinKey: 'frankenstein' })
    ok(`${label}-frankenstein-held: opens in the default edition (modern-en), not the held one`, held.last?.edition === 'modern-en', { edition: held.last?.edition })
    ok(`${label}-frankenstein-held: at the saved chapter and paragraph, with its text on screen`, held.last?.chapter === 11 && held.last?.place?.startsWith('20:') && !!held.last?.wordShown, held.last)
    const sent = held.puts.flatMap(item => Object.values(item?.books ?? {})).filter(item => item.bookId === 'frankenstein')
    ok(`${label}-frankenstein-held: every place written is in that edition, chapter and paragraph`, sent.every(item => item.primaryEditionKey === 'modern-en' ? item.sequentialChapter === 11 && item.paragraphIndex === 20 : item.primaryEditionKey === 'modern-da'), sent.map(item => `${item.primaryEditionKey}:${item.sequentialChapter}:${item.paragraphIndex}:${item.wordIndex}`))
    ok(`${label}-frankenstein-held: no page errors`, held.errors.length === 0, held.errors.slice(0, 3))
  }
} finally {
  await browser.close()
  server.close()
}
const failed = results.filter(item => !item.pass)
await fs.writeFile(`${output}/result.json`, JSON.stringify(results, null, 2))
assert.equal(failed.length, 0, `${failed.length} resume-edition checks failed: ${failed.map(item => item.label).join('; ')}`)
console.log(`A place from the account opens in its saved edition: ${results.length} checks passed.`)
