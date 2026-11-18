// Book scroll opens at the saved place (Anders, 14 Nov 2026: "I opened Luke and it opened on Luke 1"; others opened in
// the first chapter of their book). A landing that found no word for the saved place left the page at the top of the
// scroll unit (Luke 1 for Luke 13, chapter 1 for a whole book), and a click there made that chapter the reader's own and
// saved its first words as the place. On a built app (dist/), in Chromium at 1440×900 and 1920×1080, for the first 5 s
// after opening and after a first click on the text:
// - the reader's chapter and the chapter at the reading line are the saved one, and the saved word is on screen;
// - the place saved on this device (and any sent to the account) stays in the saved chapter.
// Cases: the Bible with no chapter in the address (signed out, and signed in), a saved word past its paragraph's end
// (another edition's or text revision's word), the place arriving from the account after first paint, Frankenstein at
// Chapter 7, and an own EPUB at section 7.
// Every address carries ?sharedReader=1: CI's build (plain `npm run build`) leaves the Margin reader off by default, and
// only a release build turns it on (VITE_SHARED_READER_DEFAULT=1), as check-book-scroll-speed.mjs opens it.
// cd app && npm run build && node scripts/check-book-scroll-open-place.mjs   (TINCT_DIST=<dir> for another build)
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import { createHash } from 'node:crypto'
import { createServer } from 'node:http'
import { chromium } from '@playwright/test'
import { markInternal } from './lib/internalTraffic.cjs'
import { zip } from '../../addbooks/web/test/make-epub.mjs'

const dist = path.resolve(process.env.TINCT_DIST || 'dist')
const output = process.env.TINCT_BOOK_SCROLL_OPEN_OUTPUT || 'artifacts/book-scroll-open-place'
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
const USER = '00000000-0000-4000-8000-0000000000aa'
const results = []
const ok = (label, pass, detail) => { results.push({ label, pass, detail }); console.log(`${pass ? 'ok  ' : 'FAIL'} ${label}${detail !== undefined ? ' ' + JSON.stringify(detail).slice(0, 500) : ''}`) }

/** A small own EPUB: ten sections of twelve paragraphs. */
function smallEpub() {
  const words = (n, seed) => Array.from({ length: n }, (_, i) => `${seed}${'abcdefghij'[i % 10]}${i % 13}`).join(' ')
  const sections = Array.from({ length: 10 }, (_, i) => [`c${i + 1}`, `Section ${i + 1}`, Array.from({ length: 12 }, (_, p) => `${words(90, `s${i + 1}p${p}w`)}.`)])
  const xhtml = (title, paras) => `<?xml version="1.0"?><html xmlns="http://www.w3.org/1999/xhtml"><head><title>${title}</title></head><body><h1>${title}</h1>${paras.map(p => `<p>${p}</p>`).join('')}</body></html>`
  return zip([
    ['mimetype', 'application/epub+zip'],
    ['META-INF/container.xml', '<?xml version="1.0"?><container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container"><rootfiles><rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/></rootfiles></container>'],
    ['OEBPS/content.opf', `<?xml version="1.0"?><package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="id"><metadata xmlns:dc="http://purl.org/dc/elements/1.1/"><dc:identifier id="id">open-place-qa</dc:identifier><dc:title>The Open Place</dc:title><dc:creator>Q. Example</dc:creator><dc:language>en</dc:language></metadata><manifest><item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>${sections.map(([id]) => `<item id="${id}" href="${id}.xhtml" media-type="application/xhtml+xml"/>`).join('')}</manifest><spine>${sections.map(([id]) => `<itemref idref="${id}"/>`).join('')}</spine></package>`],
    ['OEBPS/nav.xhtml', `<?xml version="1.0"?><html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops"><body><nav epub:type="toc"><ol>${sections.map(([id, title]) => `<li><a href="${id}.xhtml">${title}</a></li>`).join('')}</ol></nav></body></html>`],
    ...sections.map(([id, title, paras]) => [`OEBPS/${id}.xhtml`, xhtml(title, paras), { deflate: true }]),
  ])
}
const epub = smallEpub()
const epubSha = createHash('sha256').update(epub).digest('hex')
const epubHex = epubSha.slice(0, 24)

const browser = await markInternal(await chromium.launch({ headless: true, args: ['--mute-audio'] }))

/**
 * Open the reader with `local` as this device's position record (or none), `cloud` as the account's (answered after
 * `cloudDelay` ms), and watch it for 5 s: the reader's chapter, the chapter at the reading line, the saved word, and
 * every place written here or sent to the account.
 */
async function run(name, { url, viewport = { width: 1440, height: 900 }, signedIn = false, admin = false, prefs = {}, local = null, cloud = null, cloudDelay = 0, ownBook = null }) {
  const context = await browser.newContext({ viewport, reducedMotion: 'reduce', serviceWorkers: 'block' })
  const page = await context.newPage()
  const errors = [], puts = []
  page.on('pageerror', error => errors.push(error.message))
  await page.route('**/*', async route => {
    const request = route.request(), u = new URL(request.url())
    const json = (status, body) => route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) })
    if (u.hostname.endsWith('.supabase.co')) return u.pathname === '/auth/v1/user' && signedIn ? json(200, { id: USER, aud: 'authenticated', email: 'reader@example.com' }) : json(503, {})
    if (u.origin !== origin) return route.fulfill({ status: 401, json: {} })
    if (u.pathname === '/api/lab-position') {
      if (request.method() !== 'GET') { puts.push(request.postDataJSON()); return json(200, {}) }
      if (!cloud) return json(404, {})
      await new Promise(resolve => setTimeout(resolve, cloudDelay))
      return json(200, cloud)
    }
    if (ownBook && u.pathname === '/api/user-books' && request.method() === 'GET') return json(200, { books: [{ id: epubSha.slice(32, 64), type: 'epub', sha256: epubSha, name: 'The Open Place.epub', title: 'The Open Place', author: '', size: 1, createdAt: '2026-11-13T00:00:00.000Z' }] })
    if (ownBook && /^\/api\/user-books\/(marks|cards)\//.test(u.pathname)) return json(200, { marks: [], cards: [], rev: 0, fileId: epubSha.slice(32, 64) })
    if (u.pathname === '/api/user-books/places') return json(200, { places: {} })
    if (u.pathname.startsWith('/api/')) return json(404, {})
    return route.continue()
  })
  await page.addInitScript(({ signedIn, admin, prefs, local, user, keys, ownBook }) => {
    if (sessionStorage.getItem('open-place-seeded')) return
    sessionStorage.setItem('open-place-seeded', '1')
    localStorage.setItem('tinct-lab-prefs', JSON.stringify({ theme: 'book', compareOpen: false, ...prefs }))
    if (signedIn) {
      const session = JSON.stringify({ access_token: 'qa', refresh_token: 'qa-refresh', token_type: 'bearer', expires_in: 360000, expires_at: Math.floor(Date.now() / 1000) + 360000, user: { id: user, email: 'reader@example.com', aud: 'authenticated', user_metadata: {} } })
      for (const key of keys) localStorage.setItem(key, session)
      document.cookie = 'tinct_auth=1; path=/'
    }
    if (admin) localStorage.setItem('tinct-site-admin', user)
    if (local) localStorage.setItem('tinct-lab-position', JSON.stringify(local))
    if (ownBook) localStorage.setItem(`tinct-addbook:place:${ownBook.hex}`, JSON.stringify(ownBook.place))
  }, { signedIn, admin, prefs, local, user: USER, keys: [...bundleKeys], ownBook: ownBook && { hex: ownBook.hex, place: ownBook.place } })
  if (ownBook) {
    // The file on this device, as Add a book keeps it.
    await page.goto(`${origin}/index.html`)
    await page.evaluate(async ({ key, bytes, user, fileId }) => {
      const db = await new Promise((resolve, reject) => {
        const request = indexedDB.open('tinct-addbook', 1)
        request.onupgradeneeded = () => request.result.createObjectStore('books', { keyPath: 'key' })
        request.onsuccess = () => resolve(request.result)
        request.onerror = () => reject(request.error)
      })
      await new Promise((resolve, reject) => {
        const tx = db.transaction('books', 'readwrite')
        tx.objectStore('books').put({ key, kind: 'epub', name: 'The Open Place.epub', title: 'The Open Place', owner: user, cloudId: fileId, bytes: new Uint8Array(bytes).buffer })
        tx.oncomplete = resolve
        tx.onerror = () => reject(tx.error)
      })
      db.close()
    }, { key: `epub:${ownBook.hex}`, bytes: [...epub], user: USER, fileId: epubSha.slice(32, 64) })
  }
  const look = () => page.evaluate(({ storeKey }) => {
    const lab = document.querySelector('.lab')
    const host = document.querySelector('[data-book-scroll-unit]')
    if (!lab || lab.dataset.readerReady !== 'true' || !host) return null
    const line = host.getBoundingClientRect().top + Math.min(host.clientHeight * .24, 140)
    let lineChapter = null
    for (const block of host.querySelectorAll('[data-book-scroll-chapter]')) if (block.getBoundingClientRect().top <= line) lineChapter = Number(block.dataset.bookScrollChapter)
    const raw = JSON.parse(localStorage.getItem(storeKey.key) || 'null')
    const saved = storeKey.book ? raw?.books?.[storeKey.book] : raw
    return { reader: Number(lab.dataset.chapter), lineChapter, place: lab.dataset.place,
      saved: saved ? { chapter: saved.sequentialChapter ?? saved.chapterNumber, paragraph: saved.paragraphIndex, word: saved.wordIndex } : null }
  }, { storeKey: ownBook ? { key: `tinct-addbook:place:${ownBook.hex}` } : { key: 'tinct-lab-position', book: name.startsWith('frankenstein') ? 'frankenstein' : 'luke' } })
  const start = Date.now()
  await page.goto(`${origin}${url}`, { waitUntil: 'domcontentloaded' })
  const seen = []
  while (Date.now() - start < 5000) {
    const now = await look()
    if (now) seen.push(now)
    await page.waitForTimeout(150)
  }
  await page.screenshot({ path: `${output}/${name}.png` })
  // The reader's first click on the text, a little below the reading line (where Luke 1's text was).
  const host = await page.locator('[data-book-scroll-unit]').boundingBox()
  if (host) await page.mouse.click(host.x + host.width / 2, host.y + Math.min(host.height * .24, 140) + 120)
  await page.waitForTimeout(1200)
  const after = await look()
  await context.close()
  return { seen, after, puts, errors }
}

const KJV = { primaryEdition: 'kjv-en', audioEdition: 'kjv-en' }
const lukeAt = Date.now() - 3_600_000
const luke = (paragraphIndex, wordIndex, extra = {}) => ({ bookId: 'luke', headerBook: 'Luke', chapterNumber: 13, sequentialChapter: 986, paragraphIndex, wordIndex, primaryEditionKey: 'kjv-en', updatedAt: lukeAt, deviceId: 'qa-phone', rev: 3, ...extra })
const lukeRecord = (place, extra = {}) => ({ books: { luke: place }, finished: {}, lastSettledBookId: 'luke', lastSettledAt: lukeAt, updatedAt: lukeAt, ...extra })

/** Every look after the reader was ready is in `chapter`, and so is the place saved here and sent to the account. */
function expectAt(name, chapter, { seen, after, puts, errors }, word) {
  const first = seen[0]
  const strays = seen.filter(item => item.reader !== chapter || item.lineChapter !== chapter)
  ok(`${name}: opens in chapter ${chapter} and stays there for 5 s`, seen.length > 0 && strays.length === 0, { first, stray: strays[0], looks: seen.length })
  if (word) ok(`${name}: the saved word is on the reading line's screen`, !!first && first.place === word, { place: first?.place, expected: word })
  const savedChapters = [...new Set(seen.concat(after ? [after] : []).map(item => item.saved?.chapter).filter(value => value != null))]
  ok(`${name}: the place saved on this device stays in chapter ${chapter}`, savedChapters.every(value => value === chapter), { savedChapters })
  ok(`${name}: after a first click, the reader and its saved place are still in chapter ${chapter}`, !!after && after.reader === chapter && after.saved?.chapter === chapter, after)
  const sent = puts.flatMap(record => Object.values(record?.books ?? {})).filter(place => place.bookId === 'luke' || place.bookId === 'frankenstein')
  ok(`${name}: every place sent to the account is in chapter ${chapter}`, sent.every(place => place.sequentialChapter === chapter), sent.map(place => `${place.sequentialChapter}:${place.paragraphIndex}:${place.wordIndex}`))
  ok(`${name}: no page errors`, errors.length === 0, errors.slice(0, 3))
}

try {
  // (a) The Bible with no chapter in the address: the resume book is Luke, at Luke 13 paragraph 1 word 14.
  expectAt('bible-signed-out', 986, await run('bible-signed-out', { url: '/reader?book=bible&sharedReader=1', prefs: KJV, local: lukeRecord(luke(1, 14)) }), '1:14')
  expectAt('bible-signed-in-1920', 986, await run('bible-signed-in-1920', { url: '/reader?book=bible&sharedReader=1', viewport: { width: 1920, height: 1080 }, signedIn: true, prefs: KJV, local: lukeRecord(luke(1, 14), { owner: USER }) }), '1:14')
  // A saved word this text does not have (paragraph 1 of Luke 13 has 114 words in the KJV): before 14 Nov this left
  // the page at Luke 1, and a click there saved Luke 1.
  expectAt('bible-word-past-paragraph', 986, await run('bible-word-past-paragraph', { url: '/reader?book=bible&sharedReader=1', prefs: KJV, local: lukeRecord(luke(1, 400)) }))
  expectAt('bible-paragraph-past-chapter', 986, await run('bible-paragraph-past-chapter', { url: '/reader?book=bible&sharedReader=1', prefs: KJV, local: lukeRecord(luke(40, 3)) }))
  // The place arriving from the account after the reader's first paint (nothing on this device).
  expectAt('bible-cloud-arrival', 986, await run('bible-cloud-arrival', { url: '/reader?book=bible&sharedReader=1', signedIn: true, prefs: KJV, cloud: { ...lukeRecord(luke(1, 14)), owner: USER, hidden: {}, deviceId: 'qa-phone' }, cloudDelay: 1500 }), '1:14')
  // (d) Frankenstein at Chapter 7 (the book's eleventh chapter), the whole book one scroll unit.
  const frank = (paragraphIndex, wordIndex) => ({ books: { frankenstein: { bookId: 'frankenstein', headerBook: 'Frankenstein', chapterNumber: 11, sequentialChapter: 11, paragraphIndex, wordIndex, primaryEditionKey: 'original-en', updatedAt: lukeAt, deviceId: 'qa', rev: 1 } }, finished: {}, lastSettledBookId: 'frankenstein', lastSettledAt: lukeAt, updatedAt: lukeAt })
  const frankPrefs = { primaryEdition: 'original-en', audioEdition: 'original-en' }
  expectAt('frankenstein', 11, await run('frankenstein', { url: '/reader?book=frankenstein&sharedReader=1', prefs: frankPrefs, local: frank(20, 5) }), '20:5')
  expectAt('frankenstein-word-past-paragraph', 11, await run('frankenstein-word-past-paragraph', { url: '/reader?book=frankenstein&sharedReader=1', prefs: frankPrefs, local: frank(20, 5000) }))
  // (d) An own EPUB saved at section 7 (an admin: own books scroll whole for admins), at a word and past its paragraph.
  for (const [label, place] of [['own-epub', { chapterNumber: 7, paragraphIndex: 4, wordIndex: 3 }], ['own-epub-word-past-paragraph', { chapterNumber: 7, paragraphIndex: 4, wordIndex: 900 }]]) {
    const outcome = await run(label, { url: `/reader?userBook=${epubHex}&sharedReader=1`, signedIn: true, admin: true, ownBook: { hex: epubHex, place: { ...place, updatedAt: Date.now(), converter: 12 } } })
    ok(`${label}: the own EPUB opens in book scroll`, outcome.seen.length > 0, { looks: outcome.seen.length })
    expectAt(label, 7, outcome, place.wordIndex < 90 ? `${place.paragraphIndex}:${place.wordIndex}` : undefined)
  }
} finally {
  await browser.close()
  server.close()
}
const failed = results.filter(item => !item.pass)
await fs.writeFile(`${output}/result.json`, JSON.stringify(results, null, 2))
assert.equal(failed.length, 0, `${failed.length} book-scroll open-place checks failed: ${failed.map(item => item.label).join('; ')}`)
console.log(`Book scroll opens at the saved place: ${results.length} checks passed.`)
