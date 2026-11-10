// /byob, the paste flow and the library's "Read your own books" band (Anders approved the mockups, 4 and 5 Nov 2026).
//
// Loads the built site (dist/) in headless Chromium and asserts:
// 1. /byob, signed out, at desktop and phone width: the page, its three choices (Upload, Insert link, Paste text;
//    Anders, 9 Nov 2026), no sideways scroll. Paste text turns the drop box into the text box in place (the cleaned
//    text, its title and byline, a back chevron, "Continue", "Kept on this device until you sign in."; no
//    "Choose a file" link); a chosen file leads to sign-in returning to /preparing?own=file.
// 2. The first-run journey (desktop and phone): text pasted on /byob signed out -> sign-in names the text (its
//    chip, peeked not taken) -> a faked sign-in -> "Preparing your text…" -> the reader opens the new text with
//    "Added to your shelf" once. The same for an EPUB (and, on desktop, a PDF): sign-in names the file and carries
//    the rights line -> "Preparing your book…" -> its reader. Signed in, Paste text on /byob goes straight to
//    Preparing and the reader. A failed upload keeps the text and shows the way back to /byob, where it still is.
// 3. The library pop-up (signed in), "Add your own" with its three choices, shows the slim Paste window (a back
//    chevron, no "Choose a file instead") and adds the text into the reader.
// 4. Sign-in names why you came for anything else ("Sign in or join Tinct").
// 5. Signed out, the library hero offers "Add your own book or text" beside Read; it opens the add sheet on the
//    library ("Add your own": Upload, Insert link, Paste text into the same slim window; files dropped on it, with
//    no line saying so), then sign-in naming the
//    text or file, Preparing and the reader (href="/byob" is the no-script fallback). Signed in it is not shown. The band sits right under Featured; signed out it leads to /byob, signed in it opens the pop-up.
//
// Every account call is answered here: nothing leaves the machine. Run after `npm run build` from app/:
// node scripts/check-byob-entry.mjs. BYOB_ARTIFACTS=<dir> also writes screenshots.
import { chromium } from '@playwright/test'
import { createServer } from 'node:http'
import { createHash } from 'node:crypto'
import fs from 'node:fs/promises'
import path from 'node:path'
import assert from 'node:assert/strict'

const DIST = path.resolve('dist')
const ARTIFACTS = process.env.BYOB_ARTIFACTS || ''
const USER = '00000000-0000-4000-8000-0000000b70b1'
// The site's own Content-Security-Policy (src/worker/routes/seo.ts SECURITY_HEADERS), sent with every
// page here as the Worker sends it: an inline script, refused on tinct.app, must be refused here too.
const CSP = (await fs.readFile(path.resolve('src/worker/routes/seo.ts'), 'utf8')).match(/'Content-Security-Policy': "([^"]+)"/)[1]
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.jpg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.mp4': 'video/mp4', '.wasm': 'application/wasm' }
const PAGES = { '/library': '/lab/library_2/index.html', '/library/': '/lab/library_2/index.html', '/byob': '/byob.html', '/byob/': '/byob.html', '/sign-in': '/lab/sign-in/index.html', '/preparing': '/preparing.html', '/reader': '/app.html' }

// The account's own books (the Worker's /api/user-books, in memory): an upload is held for `hold` ms so the
// Preparing screen can be seen, and refused once when `fail` is set.
const account = { books: [], uploads: 0, hold: 0, fail: 0 }
function serve() {
  const server = createServer(async (req, res) => {
    const url = new URL(req.url, 'http://local')
    if (url.pathname === '/api/user-books' && req.method === 'POST') {
      const chunks = []; for await (const chunk of req) chunks.push(chunk)
      const bytes = Buffer.concat(chunks)
      account.uploads += 1
      if (account.hold) await new Promise(resolve => setTimeout(resolve, account.hold))
      if (account.fail > 0) { account.fail -= 1; res.writeHead(503, { 'content-type': 'application/json' }); res.end(JSON.stringify({ error: 'offline' })); return }
      const sha256 = createHash('sha256').update(bytes).digest('hex')
      const type = /^%PDF/.test(bytes.subarray(0, 5).toString('latin1')) ? 'pdf' : 'epub'
      const book = { id: sha256.slice(0, 24), sha256, type, size: bytes.length, name: decodeURIComponent(req.headers['x-book-name'] || 'Book'), title: decodeURIComponent(req.headers['x-book-title'] || ''), author: decodeURIComponent(req.headers['x-book-author'] || ''), createdAt: new Date(0).toISOString(), rev: 0, rights: req.headers['x-rights-version'] || null }
      if (!account.books.some(b => b.sha256 === sha256)) account.books.push(book)
      res.writeHead(201, { 'content-type': 'application/json' }); res.end(JSON.stringify({ book })); return
    }
    let pathname = PAGES[url.pathname] || decodeURIComponent(url.pathname)
    if (pathname.endsWith('/')) pathname += 'index.html'
    const file = path.join(DIST, path.normalize(pathname))
    try {
      if (!file.startsWith(DIST + path.sep) || !(await fs.stat(file)).isFile()) throw new Error('missing')
      res.writeHead(200, { 'content-type': TYPES[path.extname(file)] || 'application/octet-stream', ...(file.endsWith('.html') ? { 'content-security-policy': CSP } : {}) })
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

const userRecord = { id: USER, aud: 'authenticated', role: 'authenticated', email: 'reader@example.com', app_metadata: {}, user_metadata: {}, created_at: '2026-10-01T00:00:00Z' }
function session() {
  const exp = Math.floor(Date.now() / 1000) + 3600
  const b64 = value => Buffer.from(JSON.stringify(value)).toString('base64url')
  return { access_token: `${b64({ alg: 'HS256', typ: 'JWT' })}.${b64({ sub: USER, exp, role: 'authenticated' })}.fixture`, refresh_token: 'fixture', token_type: 'bearer', expires_in: 3600, expires_at: exp, user: userRecord }
}
/** Sign in as the sign-in page would leave it: the Supabase session in this browser and the signed-in cookie. */
async function signInHere(page, supabase) {
  await page.evaluate(({ key, value }) => { localStorage.setItem(key, value); document.cookie = 'tinct_auth=1; path=/; SameSite=Lax' }, { key: `sb-${supabase.ref}-auth-token`, value: JSON.stringify(session()) })
}

async function context(browser, origin, supabase, { signedIn, viewport }) {
  const c = await browser.newContext({ viewport, baseURL: origin, serviceWorkers: 'block', reducedMotion: 'reduce' })
  await c.route(url => /^https?:$/.test(url.protocol) && url.origin !== origin && url.hostname !== supabase.host, route => route.abort())
  await c.route('**/*.mp4', route => route.abort())
  await c.route(`${origin}/api/**`, route => {
    const request = route.request(), p = new URL(request.url()).pathname, method = request.method()
    if (p === '/api/user-books' && method === 'POST') return route.continue()
    if (p === '/api/lab-position') return route.fulfill({ json: { books: {}, finished: {}, owner: USER, hidden: {}, updatedAt: 0 } })
    if (p === '/api/public-books/import/access') return route.fulfill({ json: { canAdd: true } })
    if (p === '/api/user-books' && method === 'GET') return route.fulfill({ json: { books: account.books } })
    if (p === '/api/user-books/places') return route.fulfill({ json: { places: {} } })
    if (/^\/api\/user-books\/(places|covers)\//.test(p)) return route.fulfill({ json: { place: null, cover: null } })
    if (/^\/api\/user-books\/(marks|cards)\//.test(p)) return route.fulfill({ json: { marks: [], cards: [], rev: 0 } })
    if (p.startsWith('/api/user-books/primers/')) return route.fulfill({ json: { primer: null } })
    return route.fulfill({ status: 204, body: '' })
  })
  await c.route(`https://${supabase.host}/**`, route => {
    const url = new URL(route.request().url())
    if (url.pathname.startsWith('/auth/v1/user')) return route.fulfill({ json: userRecord })
    return route.fulfill({ json: [] })
  })
  if (signedIn) {
    await c.addCookies([{ name: 'tinct_auth', value: '1', url: origin }])
    await c.addInitScript(({ key, value }) => { try { if (!localStorage.getItem(key)) localStorage.setItem(key, value) } catch { /* private */ } }, { key: `sb-${supabase.ref}-auth-token`, value: JSON.stringify(session()) })
  }
  return c
}

const DESKTOP = { width: 1440, height: 900 }, PHONE = { width: 390, height: 844 }
const TEXT = { name: 'an-essay.txt', mimeType: 'text/plain', buffer: Buffer.from('An essay\n\n' + 'A plain paragraph of the reader\'s own text, long enough to be a book. '.repeat(40)) }
// A web page as it lands on the clipboard: the site's menu, the article, its like counters and a paywall line.
const TITLE = 'The Lighthouse Lectures on Weather and Memory'
const PROSE = [
  'Starting on a wet Monday in October, the keeper of the northern light gave a series of four lectures about weather and memory. They were held in the old harbour hall on four consecutive Mondays, and nobody was allowed to record them.',
  'I was fortunate enough to attend each of these lectures, and more fortunate yet to be permitted to write about them. What follows is my best attempt at a faithful reconstruction of the arguments from my memory, my notes and the occasional letter from other listeners.',
  'I parked several minutes from the hall, arriving half an hour before the posted start. As I approached it became clear that this was not early enough: a line of people in oilskins wound from the doors down the stone steps, past the chandlery, and on along the quay for most of its length.',
  'Inside, the hall smelled of rope and paraffin. The keeper stood beside a barometer the size of a door and began, without a greeting, by asking how many of us could remember the weather on the day we were born.',
]
const PAGE = '<p>Home</p><p>Archive</p><p>About</p><p>Subscribe</p>'
  + `<h1>${TITLE}</h1><p>G. B. Rango</p><p>Oct 25, 2026</p>`
  + `<p>${PROSE[0]}</p><p>${PROSE[1]}</p><p>202</p><p>Likes</p><p>31</p><p>Comments</p><p>Share</p><h2>I. The arrival</h2><p>${PROSE[2]}</p><p>${PROSE[3]}</p>`
// A tiny real PDF with one line of text.
function pdfBytes() {
  const objects = ['<< /Type /Catalog /Pages 2 0 R >>', '<< /Type /Pages /Kids [3 0 R] /Count 1 >>', '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>', null, '<< /Type /Font /Subtype /Type1 /BaseFont /Times-Roman >>']
  const text = 'BT /F1 24 Tf 72 700 Td (Attention to the weather) Tj ET BT /F1 12 Tf 72 670 Td (' + 'Notes on the light and the long evenings. '.repeat(2) + ') Tj ET'
  objects[3] = `<< /Length ${text.length} >>\nstream\n${text}\nendstream`
  let out = '%PDF-1.4\n'; const offsets = []
  objects.forEach((body, i) => { offsets.push(out.length); out += `${i + 1} 0 obj\n${body}\nendobj\n` })
  const xref = out.length
  out += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n` + offsets.map(o => String(o).padStart(10, '0') + ' 00000 n \n').join('') + `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`
  return Buffer.from(out, 'latin1')
}
const shot = async (page, name) => { if (ARTIFACTS) await page.screenshot({ path: path.join(ARTIFACTS, `${name}.png`) }) }
const noSideScroll = page => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)
const libraryReady = page => page.waitForFunction(() => document.documentElement.classList.contains('library-ready'), null, { timeout: 60000 })
const ownStep = page => page.waitForFunction(() => document.querySelector('[data-testid="own-file-dialog"] .own-file-dialog')?.dataset.step || null, null, { timeout: 30000 }).then(h => h.jsonValue())
const signInReady = page => page.waitForFunction(() => document.querySelector('#tinct-lab-sign-in')?.dataset.ready === 'true', null, { timeout: 30000 })
/** Paste the web page into a paste box as a browser does: text/html and text/plain on the clipboard. */
const pasteArticle = (page, selector) => page.locator(selector).evaluate((el, { html, plain }) => {
  el.focus()
  const clipboard = new DataTransfer(); clipboard.setData('text/html', html); clipboard.setData('text/plain', plain)
  el.dispatchEvent(new ClipboardEvent('paste', { bubbles: true, cancelable: true, clipboardData: clipboard }))
}, { html: PAGE, plain: [TITLE, 'G. B. Rango', ...PROSE].join('\n\n') })
/** What a paste box shows and adds: the cleaned article, its title and the byline. */
async function assertCleaned(page, scope) {
  assert.equal((await page.locator(`${scope} .paste-title__text`).innerText()).trim(), TITLE, 'the title is taken from the article')
  assert.match(await page.locator(`${scope} .paste-meta`).innerText(), /^G\. B\. Rango · \d{3} words$/, 'the byline and word count under the title')
  const shown = await page.locator(`${scope} .paste-box`).innerText()
  for (const chrome of ['Archive', 'Subscribe', 'Likes', 'Comments']) assert(!shown.includes(chrome), `"${chrome}" is left out of the text box`)
  assert(shown.startsWith('G. B. Rango'), 'the text box opens on the byline, the title being the heading')
  assert(shown.includes('I. The arrival'), 'the article\'s own section heading stays')
  const box = await page.locator(`${scope} .paste-box`).evaluate(el => { const cs = getComputedStyle(el); return { size: parseFloat(cs.fontSize), line: parseFloat(cs.lineHeight) / parseFloat(cs.fontSize), family: cs.fontFamily } })
  assert(box.size >= 16 && box.size <= 17.5 && box.line >= 1.45 && box.line <= 1.55, `about 17px text at about 1.5 line height (Anders, 5 Nov 2026): ${JSON.stringify(box)}`)
  assert(/Garamond/.test(box.family), 'the book\'s own serif in the box')
  assert(await page.evaluate(async () => { await document.fonts.ready; return document.fonts.check('17px "Tinct Paste Garamond"') || document.fonts.check('17px "EB Garamond"') }), 'EB Garamond is loaded, not a fallback')
}
/** The reader opened on the new book, with "Added to your shelf" once. */
async function landed(page, { url, text }) {
  await page.waitForURL(url, { timeout: 60000 })
  const toast = page.locator('[data-testid="added-toast"]')
  await toast.waitFor({ state: 'attached', timeout: 60000 })
  assert.equal(await toast.innerText(), 'Added to your shelf')
  if (text) await page.getByText(text, { exact: false }).first().waitFor({ timeout: 30000 })
  await page.waitForFunction(() => document.querySelector('[data-testid="added-toast"]')?.classList.contains('is-shown'), null, { timeout: 5000 })
}

async function main() {
  if (ARTIFACTS) await fs.mkdir(ARTIFACTS, { recursive: true })
  const server = await serve(), origin = `http://127.0.0.1:${server.address().port}`
  const supabase = await supabaseHost()
  const browser = await chromium.launch({ args: ['--mute-audio'] })
  const failures = []
  const run = async (label, fn) => { try { await fn(); console.log(`ok   ${label}`) } catch (error) { failures.push(label); console.log(`FAIL ${label}\n     ${error.message.split('\n').slice(0, 6).join('\n     ')}`) } }
  try {
    for (const [name, viewport] of [['desktop', DESKTOP], ['phone', PHONE]]) {
      await run(`/byob signed out, ${name}: page, actions, no sideways scroll; a file leads to sign-in and Preparing`, async () => {
        const c = await context(browser, origin, supabase, { signedIn: false, viewport }), page = await c.newPage()
        const refused = []
        page.on('console', m => { if (/Content Security Policy/i.test(m.text())) refused.push(m.text().slice(0, 160)) })
        await page.goto('/byob')
        await page.waitForLoadState('networkidle')
        assert.deepEqual(refused, [], 'nothing on /byob is refused by the site\'s Content-Security-Policy')
        assert.equal(await page.locator('h1').innerText(), 'Your own books, texts and PDFs.')
        assert.deepEqual(await page.locator('.drop .add-choice .add-choice__label').allInnerTexts(), ['Upload', 'Insert link', 'Paste text'], 'the three choices')
        assert.deepEqual(await page.locator('.drop .add-choice .add-choice__line').allInnerTexts(), ['PDF, EPUB, text', 'An article online', 'Any text you copied'])
        for (const id of ['#choose', '#link', '#paste']) assert(await page.locator(id).isVisible(), `${id} is shown`)
        const tiles = await page.locator('.drop .add-choice').evaluateAll(els => els.map(e => { const r = e.getBoundingClientRect(); return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) } }))
        if (name === 'desktop') assert(tiles.every(t => t.y === tiles[0].y && Math.abs(t.w - tiles[0].w) <= 1), `three equal tiles in a row (${JSON.stringify(tiles)})`)
        else assert(tiles.every((t, i) => i === 0 || (t.y > tiles[i - 1].y && t.x === tiles[0].x && t.w === tiles[0].w)), `three full-width rows (${JSON.stringify(tiles)})`)
        assert.equal(await page.locator('#foot-file, #choose-foot').count(), 0, 'no "Choose a file" link')
        const account = page.locator(name === 'phone' ? '#account-phone' : '#account')
        assert(await account.isVisible(), 'the sign-in link is shown')
        assert.equal(await account.innerText(), 'Sign in or join')
        assert.equal(await page.locator('.drop-title').isVisible(), name === 'desktop', 'the drag box shows on desktop only')
        assert.equal(await page.locator('#foot-library a').getAttribute('href'), '/library')
        assert.equal(await page.locator('#rights').isVisible(), false, 'signed out, the rights line is on sign-in')
        assert.equal(await page.locator('video').count(), 0, 'no recording on the page')
        const room = await page.evaluate(() => { const r = document.querySelector('.room').getBoundingClientRect(), p = document.querySelector('.page').getBoundingClientRect(); return { roomW: r.width, pageTop: p.top, pageLeft: p.left, vw: innerWidth, vh: innerHeight } })
        if (name === 'phone') assert(room.roomW >= room.vw - 1 && room.pageTop > room.vh * 0.3, `the room fills the phone and the sheet sits below it (${JSON.stringify(room)})`)
        else assert(room.pageLeft < 1 && room.roomW > room.vw * 0.4, `the page column sits left of the room (${JSON.stringify(room)})`)
        assert(await noSideScroll(page), 'no sideways scroll')
        await shot(page, `byob-${name}`)
        await page.locator('#file').setInputFiles(TEXT)
        await page.waitForURL(/\/sign-in\?/)
        assert.equal(new URL(page.url()).searchParams.get('returnTo'), '/preparing?own=file')
        await c.close()
      })
    }

    for (const [name, viewport] of [['desktop', DESKTOP], ['phone', PHONE]]) {
      await run(`first text, ${name}: paste on /byob -> sign-in names it -> Preparing -> the reader with "Added to your shelf"`, async () => {
        account.books = []; account.uploads = 0; account.hold = 2500
        const c = await context(browser, origin, supabase, { signedIn: false, viewport }), page = await c.newPage()
        const errors = [], refused = []
        page.on('pageerror', e => errors.push(e.message))
        page.on('console', m => { if (/Content Security Policy/i.test(m.text())) refused.push(m.text().slice(0, 160)) })
        await page.goto('/byob')
        await page.locator('#paste').click()
        // The drop box is the text box now: the intro line and the choices go, Continue is the one action, a back
        // chevron leads back to the three choices (9 Nov 2026: no "Choose a file" link).
        await page.locator('#paste-area').waitFor()
        assert.equal(await page.locator('.sub').isVisible(), false, 'the intro line goes while pasting')
        assert.equal(await page.locator('#choose').isVisible(), false)
        assert.equal(await page.locator('.foot:visible').count(), 0, 'no link at the foot')
        assert(await page.locator('#paste-back').isVisible(), 'a back chevron')
        await page.locator('#paste-back').click()
        await page.locator('#paste-area').waitFor({ state: 'hidden' })
        assert(await page.locator('#choose').isVisible(), 'back on the three choices')
        await page.locator('#paste').click()
        await page.locator('#paste-area').waitFor()
        assert.equal(await page.locator('#paste-note').innerText(), 'Kept on this device until you sign in.')
        await pasteArticle(page, '#paste-area .paste-box')
        await assertCleaned(page, '#paste-area')
        assert(await noSideScroll(page), 'no sideways scroll while pasting')
        await page.locator('#paste-area .paste-box').evaluate(el => { el.scrollTop = 0; el.blur() })
        await shot(page, `02-byob-paste-${name}`)
        assert.equal(account.uploads, 0, 'nothing is sent before sign-in')
        await page.locator('#continue').click()
        await page.waitForURL(/\/sign-in\?/)
        assert.equal(new URL(page.url()).searchParams.get('returnTo'), '/preparing?own=paste')
        await signInReady(page)
        await page.waitForFunction(() => !document.querySelector('[data-signin-file]')?.hidden, null, { timeout: 10000 })
        assert.equal(await page.locator('[data-signin-title]').innerText(), 'Sign in or join to add your text')
        assert.equal(await page.locator('[data-signin-file] b').innerText(), TITLE, 'the chip names the text by its title')
        const chip = await page.locator('[data-signin-file] b').evaluate(el => ({ lines: Math.round(el.getBoundingClientRect().height / parseFloat(getComputedStyle(el).lineHeight)), clipped: el.scrollHeight > el.clientHeight + 1 }))
        assert(chip.lines <= 2, `the chip's title takes at most two lines (${JSON.stringify(chip)})`)
        assert.equal(await page.locator('[data-signin-rights]').isVisible(), false, 'no rights line for pasted text')
        assert.equal(await page.locator('[data-auth-back]').getAttribute('href'), '/byob')
        assert(await noSideScroll(page), 'no sideways scroll on sign-in')
        await shot(page, `03-sign-in-text-${name}`)
        assert(await page.evaluate(async () => !!(await import('/lab/addbook/js/file-handoff.js')).peekPasteHandoff().then(d => d)), 'the text still waits on the device')
        // A faked sign-in: the session lands in this browser; the sign-in page sends the reader on.
        await signInHere(page, supabase)
        await page.reload()
        await page.waitForURL(url => url.pathname === '/preparing', { timeout: 30000 })
        await page.locator('#line').getByText('Preparing your text…').waitFor({ timeout: 15000 })
        await page.waitForFunction(() => document.getElementById('cover')?.complete && document.getElementById('cover').naturalWidth > 0, null, { timeout: 10000 })
        assert.equal(await page.locator('.bar').isVisible(), true, 'a hairline of progress, no spinner')
        await shot(page, `04-preparing-${name}`)
        await landed(page, { url: /\/reader\?userBook=[0-9a-f]{24}&sharedReader=1/, text: 'keeper of the northern light' })
        await shot(page, `05-reader-landed-${name}`)
        assert.equal(account.uploads, 1, 'one upload')
        assert.equal(account.books[0]?.title, TITLE, 'the account copy carries the title')
        assert.equal(account.books[0]?.author, 'G. B. Rango', 'and the byline')
        assert.equal(await page.evaluate(async () => (await import('/lab/addbook/js/file-handoff.js')).peekPasteHandoff()), null, 'the device copy is gone once the text is in')
        await page.reload()
        await page.waitForFunction(() => document.querySelector('[data-testid="lab-root"]')?.dataset.readerReady === 'true', null, { timeout: 60000 })
        await page.waitForTimeout(1200)
        assert.equal(await page.locator('[data-testid="added-toast"]').count(), 0, 'the toast shows once')
        assert.deepEqual(refused, []); assert.deepEqual(errors, [])
        await c.close()
      })
    }

    await run('a failed add keeps the text: Preparing says so, and /byob shows it again', async () => {
      account.books = []; account.uploads = 0; account.hold = 0; account.fail = 1
      const c = await context(browser, origin, supabase, { signedIn: true, viewport: DESKTOP }), page = await c.newPage()
      await page.goto('/byob')
      assert(await page.locator('#rights').isVisible(), 'signed in, the rights line for files is on /byob')
      await page.locator('#paste').click()
      await pasteArticle(page, '#paste-area .paste-box')
      assert.equal(await page.locator('#paste-note').isVisible(), false, 'signed in, nothing waits for sign-in')
      await page.locator('#continue').click()
      await page.waitForURL(url => url.pathname === '/preparing')
      await page.locator('#problem').waitFor({ timeout: 30000 })
      assert.equal(await page.locator('#problem').innerText(), 'No connection. Check your internet and try again.')
      assert.equal(await page.locator('#back').getAttribute('href'), '/byob')
      await shot(page, 'preparing-failed-desktop')
      await page.locator('#back').click()
      await page.waitForURL(url => url.pathname === '/byob')
      await page.locator('#paste-area').waitFor()
      await page.waitForFunction(t => document.querySelector('#paste-area .paste-title__text')?.textContent === t, TITLE, { timeout: 10000 })
      assert((await page.locator('#paste-area .paste-box').innerText()).includes('keeper of the northern light'), 'the text is still there')
      // Signed in, Continue goes straight to Preparing and the reader.
      await page.locator('#continue').click()
      await page.waitForURL(url => url.pathname === '/preparing')
      await landed(page, { url: /\/reader\?userBook=[0-9a-f]{24}&sharedReader=1/, text: 'keeper of the northern light' })
      assert.equal(account.books.length, 1, 'one book in the account after the retry')
      await c.close()
    })

    for (const [name, viewport] of [['desktop', DESKTOP], ['phone', PHONE]]) {
      await run(`first book, ${name}: an EPUB on /byob -> sign-in names it with the rights line -> Preparing -> its reader`, async () => {
        account.books = []; account.uploads = 0; account.hold = 2000; account.fail = 0
        const c = await context(browser, origin, supabase, { signedIn: false, viewport }), page = await c.newPage()
        const errors = []; page.on('pageerror', e => errors.push(e.message))
        await page.goto('/byob')
        const epub = await page.evaluate(async ({ title, prose }) => {
          const { pasteEpub } = await import('/lab/library_2/paste-text.js?v=20261105flow')
          const file = pasteEpub({ source: prose.map(p => `<p>${p}</p>`).join(''), format: 'html', title, author: 'Ada Lindqvist', uid: '33333333-3333-4333-8333-333333333333' })
          return [...new Uint8Array(await file.arrayBuffer())]
        }, { title: 'The Harbour Almanac', prose: PROSE })
        await page.locator('#file').setInputFiles({ name: 'harbour-almanac.epub', mimeType: 'application/epub+zip', buffer: Buffer.from(epub) })
        await page.waitForURL(/\/sign-in\?/)
        await signInReady(page)
        await page.waitForFunction(() => !document.querySelector('[data-signin-file]')?.hidden, null, { timeout: 10000 })
        assert.equal(await page.locator('[data-signin-title]').innerText(), 'Sign in or join to add your book')
        assert.equal(await page.locator('[data-signin-file] b').innerText(), 'harbour-almanac.epub')
        assert.equal(await page.locator('[data-signin-rights]').innerText(), 'Adding it confirms you may read this file.')
        await shot(page, `03b-sign-in-file-${name}`)
        await signInHere(page, supabase)
        await page.reload()
        await page.waitForURL(url => url.pathname === '/preparing', { timeout: 30000 })
        await page.locator('#line').getByText('Preparing your book…').waitFor({ timeout: 15000 })
        await shot(page, `04b-preparing-epub-${name}`)
        // The EPUB opens where the library opens it: the margin reader on a desktop, the Tinct reader on a phone.
        await landed(page, { url: name === 'phone' ? /\/reader\?userBook=[0-9a-f]{24}/ : /\/lab\/addbook\/\?userBook=[0-9a-f]{24}/ })
        await shot(page, `05b-reader-epub-${name}`)
        await page.waitForFunction(() => true)
        const rights = await page.evaluate(() => Object.keys(localStorage).filter(k => k.startsWith('tinct-addbook:rights:')))
        assert.equal(rights.length, 1, 'the rights confirmation is recorded as the rights dialog records it')
        assert.equal(await page.evaluate(async () => (await import('/lab/addbook/js/file-handoff.js')).peekHandoff()), null, 'the device copy is taken once the book is in')
        assert.deepEqual(errors, [])
        await c.close()
      })
    }

    await run('first book, desktop: a PDF on /byob, signed in -> Preparing your book… -> the PDF reader', async () => {
      account.books = []; account.uploads = 0; account.hold = 0; account.fail = 0
      const c = await context(browser, origin, supabase, { signedIn: true, viewport: DESKTOP }), page = await c.newPage()
      await page.goto('/byob')
      await page.locator('#file').setInputFiles({ name: 'attention-to-the-weather.pdf', mimeType: 'application/pdf', buffer: pdfBytes() })
      await page.waitForURL(url => url.pathname === '/preparing')
      await page.locator('#line').getByText('Preparing your book…').waitFor({ timeout: 15000 })
      await shot(page, '04b-preparing-pdf-desktop')
      await landed(page, { url: /\/lab\/addbook\/\?userBook=[0-9a-f]{24}/ })
      await shot(page, '05c-reader-pdf-desktop')
      await c.close()
    })

    for (const [name, viewport] of [['desktop', DESKTOP], ['phone', PHONE]]) {
      await run(`library pop-up, ${name}: the slim Paste window adds the text into the reader`, async () => {
        account.books = []; account.uploads = 0; account.hold = 0; account.fail = 0
        const c = await context(browser, origin, supabase, { signedIn: true, viewport }), page = await c.newPage()
        const errors = []; page.on('pageerror', e => errors.push(e.message))
        await page.goto('/library?sharedReader=1')
        await libraryReady(page)
        await page.locator('#library-add:visible').click()
        await page.locator('.own-file-dialog[data-step="choose"]').waitFor()
        assert.equal(await page.locator('.own-file-dialog h2').innerText(), 'Add your own')
        assert.deepEqual(await page.locator('.own-file-dialog .add-choice .add-choice__label').allInnerTexts(), ['Upload', 'Insert link', 'Paste text'])
        await page.getByRole('button', { name: 'Paste text' }).click()
        await page.locator('.own-file-dialog.paste-dialog[data-step="paste"]').waitFor()
        for (const gone of ['Review details', 'Preview', 'Rich formatting was found', 'Trim', 'Choose a file']) assert.equal(await page.locator('.paste-dialog').getByText(gone, { exact: false }).count(), 0, `no "${gone}"`)
        assert(await page.locator('.paste-dialog .tui-dialog__head .add-own-back').isVisible(), 'a back chevron to the three choices')
        await pasteArticle(page, '.paste-dialog .paste-box')
        await assertCleaned(page, '.paste-dialog')
        await page.locator('.paste-dialog .paste-box').evaluate(el => { el.scrollTop = 0; el.blur() })
        const dialog = await page.locator('.paste-dialog').boundingBox()
        assert(dialog.x >= -1 && dialog.x + dialog.width <= viewport.width + 1 && dialog.y + dialog.height <= viewport.height + 1, `the window fits the screen (${JSON.stringify(dialog)})`)
        await shot(page, `01-paste-window-${name}`)
        await page.getByRole('button', { name: 'Add', exact: true }).click()
        await landed(page, { url: /\/reader\?userBook=[0-9a-f]{24}&sharedReader=1/, text: 'keeper of the northern light' })
        assert.equal(account.uploads, 1)
        assert.deepEqual(errors, [])
        await c.close()
      })
    }

    for (const [name, viewport] of [['desktop', DESKTOP], ['phone', PHONE]]) {
      await run(`sign-in names the reason, ${name}: anything else says "Sign in or join Tinct"`, async () => {
        const c = await context(browser, origin, supabase, { signedIn: false, viewport }), page = await c.newPage()
        await page.goto('/sign-in?returnTo=%2Flibrary')
        await signInReady(page)
        assert.equal(await page.locator('[data-signin-title]').innerText(), 'Sign in or join Tinct')
        assert.equal(await page.locator('[data-signin-file]').isVisible(), false)
        assert.equal(await page.locator('[data-signin-rights]').isVisible(), false)
        await shot(page, `sign-in-${name}`)
        await c.close()
      })
    }

    await run('library: no "Read your own books" band (removed 10 Nov 2026)', async () => {
      const c = await context(browser, origin, supabase, { signedIn: false, viewport: DESKTOP }), page = await c.newPage()
      await page.goto('/library')
      await libraryReady(page)
      assert.equal(await page.locator('.own-books-band').count(), 0)
      await c.close()
    })
    for (const [name, viewport] of [['desktop', DESKTOP], ['phone', PHONE], ['narrow phone', { width: 320, height: 640 }]]) {
      await run(`library hero, signed out, ${name}: "Add your own book or text" opens the add sheet on tinct.app`, async () => {
        const c = await context(browser, origin, supabase, { signedIn: false, viewport }), page = await c.newPage()
        const errors = []; page.on('pageerror', e => errors.push(e.message))
        await page.goto('/library')
        await libraryReady(page)
        const own = page.locator('#hero-own')
        assert(await own.isVisible(), 'the button shows to a signed-out visitor')
        assert.equal(await own.innerText(), 'Add your own book or text')
        assert.equal(await own.getAttribute('href'), '/byob', '/byob stays the no-script fallback')
        const [r, o] = await Promise.all([page.locator('#read-featured').boundingBox(), own.boundingBox()])
        assert(Math.abs(r.height - o.height) < 2, `Read and the new button share a height (${r.height} / ${o.height})`)
        assert(o.x + o.width <= viewport.width - 8, 'the button sits inside the screen')
        assert(await noSideScroll(page), 'no sideways scroll')
        await shot(page, `library-hero-own-${name.replace(' ', '-')}`)
        await own.click()
        const sheet = page.locator('[data-testid="own-start"] .own-start')
        await sheet.waitFor()
        assert.equal(new URL(page.url()).pathname, '/library', 'the click stays on tinct.app\'s library')
        assert.equal(await sheet.locator('h2').innerText(), 'Add your own')
        assert.deepEqual(await sheet.locator('.add-choice .add-choice__label').allInnerTexts(), ['Upload', 'Insert link', 'Paste text'], 'the three choices')
        for (const label of ['Upload', 'Insert link', 'Paste text']) assert(await page.getByRole('button', { name: label, exact: true }).isVisible(), label)
        assert.equal((await sheet.innerText()).replace(/\s+/g, ' ').trim(), 'Add your own Upload PDF, EPUB, text Insert link An article online Paste text Any text you copied', 'nothing but the title and the three choices')
        const box = await sheet.boundingBox()
        assert(box.x >= -1 && box.x + box.width <= viewport.width + 1, `the sheet fits the screen (${JSON.stringify(box)})`)
        await shot(page, `hero-sheet-${name.replace(' ', '-')}`)
        if (name === 'narrow phone') { assert.deepEqual(errors, []); await c.close(); return }
        // Paste text: the same slim window, then sign-in naming the text, then Preparing and the reader.
        await page.getByRole('button', { name: 'Paste text' }).click()
        await page.locator('.own-start.paste-dialog').waitFor()
        await pasteArticle(page, '.own-start .paste-box')
        await assertCleaned(page, '.own-start')
        await page.locator('.own-start .paste-box').evaluate(el => { el.scrollTop = 0; el.blur() })
        await shot(page, `hero-sheet-paste-${name}`)
        account.books = []; account.uploads = 0; account.hold = 0; account.fail = 0
        await page.getByRole('button', { name: 'Continue' }).click()
        await page.waitForURL(/\/sign-in\?/)
        assert.equal(new URL(page.url()).searchParams.get('returnTo'), '/preparing?own=paste')
        await signInReady(page)
        await page.waitForFunction(() => !document.querySelector('[data-signin-file]')?.hidden, null, { timeout: 10000 })
        assert.equal(await page.locator('[data-signin-file] b').innerText(), TITLE)
        assert.equal(account.uploads, 0, 'nothing is sent before sign-in')
        await signInHere(page, supabase)
        await page.reload()
        await page.waitForURL(url => url.pathname === '/preparing', { timeout: 30000 })
        await landed(page, { url: /\/reader\?userBook=[0-9a-f]{24}&sharedReader=1/, text: 'keeper of the northern light' })
        assert.equal(account.uploads, 1)
        assert.deepEqual(errors, [])
        await c.close()
      })
    }
    await run('library hero, signed out: a file chosen in the sheet goes to sign-in naming it', async () => {
      const c = await context(browser, origin, supabase, { signedIn: false, viewport: DESKTOP }), page = await c.newPage()
      await page.goto('/library')
      await libraryReady(page)
      await page.locator('#hero-own').click()
      // Upload opens the picker; the file chosen there goes on as before.
      const [chooser] = await Promise.all([page.waitForEvent('filechooser'), page.getByRole('button', { name: 'Upload', exact: true }).click()])
      assert.equal(chooser.isMultiple(), true, 'the picker takes several files')
      await chooser.setFiles({ name: 'attention-to-the-weather.pdf', mimeType: 'application/pdf', buffer: pdfBytes() })
      await page.waitForURL(/\/sign-in\?/)
      assert.equal(new URL(page.url()).searchParams.get('returnTo'), '/preparing?own=file')
      await signInReady(page)
      await page.waitForFunction(() => !document.querySelector('[data-signin-file]')?.hidden, null, { timeout: 10000 })
      assert.equal(await page.locator('[data-signin-file] b').innerText(), 'attention-to-the-weather.pdf')
      assert(await page.locator('[data-signin-rights]').isVisible(), 'the rights line')
      await c.close()
    })
    await run('library hero, signed out: a file dropped on the sheet goes to sign-in naming it, with no line saying so', async () => {
      const c = await context(browser, origin, supabase, { signedIn: false, viewport: DESKTOP }), page = await c.newPage()
      await page.goto('/library')
      await libraryReady(page)
      await page.locator('#hero-own').click()
      const sheet = page.locator('[data-testid="own-start"] .own-start')
      await sheet.waitFor()
      assert.equal(await sheet.getByText(/drag|drop/i).count(), 0, 'no text about dropping')
      await sheet.evaluate(el => {
        const data = new DataTransfer(); data.items.add(new File(['%PDF-1.4 a'], 'dropped-notes.pdf', { type: 'application/pdf' }))
        for (const type of ['dragenter', 'dragover', 'drop']) el.querySelector('.add-choice').dispatchEvent(new DragEvent(type, { bubbles: true, cancelable: true, dataTransfer: data }))
      })
      await page.waitForURL(/\/sign-in\?/)
      assert.equal(new URL(page.url()).searchParams.get('returnTo'), '/preparing?own=file')
      await signInReady(page)
      await page.waitForFunction(() => !document.querySelector('[data-signin-file]')?.hidden, null, { timeout: 10000 })
      assert.equal(await page.locator('[data-signin-file] b').innerText(), 'dropped-notes.pdf')
      await c.close()
    })
    await run('library hero, signed in: no "Add your own book or text"', async () => {
      const c = await context(browser, origin, supabase, { signedIn: true, viewport: DESKTOP }), page = await c.newPage()
      await page.goto('/library')
      await libraryReady(page)
      assert.equal(await page.locator('#hero-own').isVisible(), false)
      await c.close()
    })
  } finally {
    await browser.close()
    server.close()
  }
  if (failures.length) { console.log(`\n${failures.length} failed`); process.exit(1) }
  console.log('\nAll /byob checks passed')
}

await main()
