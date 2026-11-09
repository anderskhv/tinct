// Several own books at once (Anders, 9 Nov 2026: "Lets do bulk uploads, yes").
//
// Loads the built site (dist/) in headless Chromium, signed in with a synthetic account, at desktop 1440 and
// phone 390, and asserts in the library's "Your own book" pop-up (add-to-tinct.js, own-queue.js):
// 1. The picker takes several files. Three chosen together (a PDF, an EPUB and a text file renamed .pdf):
//    the rights confirmation is asked once for all three, then a queue lists each file with its status
//    (waiting, preparing, added, or the reason it failed), one after another; the page is not blocked.
// 2. The two good books are on My shelf (and in the account) and the page lands on My shelf, not in a book;
//    the failed file keeps the engine's reason ("This file could not be opened as a PDF. Choose another file.").
// 3. Desktop only: the same EPUB again with a new .txt file: the EPUB is skipped ("Already on My shelf"),
//    the text is added.
// 4. Signed out on /byob (desktop): two files chosen together are kept on the device; sign-in names them
//    ("… and 1 more"); after sign-in, Preparing hands them to the library's queue, which ends on My shelf.
// Every account call is answered here (in memory) and no AI, OCR or other provider is called: nothing leaves
// the machine. Run after `npm run build`, from app/ or app/scripts: node scripts/check-bulk-upload.mjs.
// BULK_ARTIFACTS=<dir> writes screenshots.
import { chromium } from '@playwright/test'
import { createServer } from 'node:http'
import { createHash } from 'node:crypto'
import { fileURLToPath } from 'node:url'
import fs from 'node:fs/promises'
import path from 'node:path'
import assert from 'node:assert/strict'

const APP = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const DIST = path.join(APP, 'dist')
const ARTIFACTS = process.env.BULK_ARTIFACTS || ''
const USER = '00000000-0000-4000-8000-00000000b01c'
const CSP = (await fs.readFile(path.join(APP, 'src/worker/routes/seo.ts'), 'utf8')).match(/'Content-Security-Policy': "([^"]+)"/)[1]
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.jpg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.wasm': 'application/wasm' }
const PAGES = { '/library': '/lab/library_2/index.html', '/library/': '/lab/library_2/index.html', '/sign-in': '/lab/sign-in/index.html', '/reader': '/app.html', '/byob': '/byob.html', '/preparing': '/preparing.html' }

// The account's own books (the Worker's /api/user-books, in memory). Each upload is held a moment so the queue is seen working.
const account = { books: [], uploads: [], hold: 700 }
function serve() {
  const server = createServer(async (req, res) => {
    const url = new URL(req.url, 'http://local')
    if (url.pathname === '/api/user-books' && req.method === 'POST') {
      const chunks = []; for await (const chunk of req) chunks.push(chunk)
      const bytes = Buffer.concat(chunks)
      if (account.hold) await new Promise(resolve => setTimeout(resolve, account.hold))
      const sha256 = createHash('sha256').update(bytes).digest('hex')
      const type = /^%PDF/.test(bytes.subarray(0, 5).toString('latin1')) ? 'pdf' : 'epub'
      const name = decodeURIComponent(req.headers['x-book-name'] || 'Book')
      account.uploads.push(name)
      const book = { id: sha256.slice(0, 24), sha256, type, size: bytes.length, name, title: decodeURIComponent(req.headers['x-book-title'] || ''), author: decodeURIComponent(req.headers['x-book-author'] || ''), createdAt: new Date().toISOString(), fileId: 'f1', rev: 0, metadataRev: 0 }
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
const userRecord = { id: USER, aud: 'authenticated', role: 'authenticated', email: 'bulk@example.test', app_metadata: {}, user_metadata: {}, created_at: '2026-10-01T00:00:00Z' }
function session() {
  const exp = Math.floor(Date.now() / 1000) + 3600
  const b64 = value => Buffer.from(JSON.stringify(value)).toString('base64url')
  return { access_token: `${b64({ alg: 'HS256', typ: 'JWT' })}.${b64({ sub: USER, exp, role: 'authenticated' })}.fixture`, refresh_token: 'fixture', token_type: 'bearer', expires_in: 3600, expires_at: exp, user: userRecord }
}
async function context(browser, origin, supabase, viewport, { signedIn = true } = {}) {
  const c = await browser.newContext({ viewport, baseURL: origin, serviceWorkers: 'block', reducedMotion: 'reduce', hasTouch: viewport.width < 700 })
  const outside = []
  await c.route(url => /^https?:$/.test(url.protocol) && url.origin !== origin && url.hostname !== supabase.host, route => { outside.push(route.request().url()); return route.abort() })
  await c.route('**/*.mp4', route => route.abort())
  // Every /api/ route is answered here; only the upload goes on to the in-memory account above.
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
    if (/ocr|ai|chat|voice|narrat/i.test(p)) { outside.push('provider route ' + p); return route.fulfill({ status: 404, json: { error: 'not_in_check' } }) }
    return route.fulfill({ status: 204, body: '' })
  })
  await c.route(`https://${supabase.host}/**`, route => {
    const url = new URL(route.request().url())
    if (url.pathname.startsWith('/auth/v1/user')) return route.fulfill({ json: userRecord })
    return route.fulfill({ json: [] })
  })
  if (!signedIn) return { c, outside }
  await c.addCookies([{ name: 'tinct_auth', value: '1', url: origin }])
  await c.addInitScript(({ key, value }) => { try { if (!localStorage.getItem(key)) localStorage.setItem(key, value) } catch { /* private */ } }, { key: `sb-${supabase.ref}-auth-token`, value: JSON.stringify(session()) })
  return { c, outside }
}

const DESKTOP = { width: 1440, height: 900 }, PHONE = { width: 390, height: 844 }
// A tiny real PDF with one line of text.
function pdfBytes() {
  const objects = ['<< /Type /Catalog /Pages 2 0 R >>', '<< /Type /Pages /Kids [3 0 R] /Count 1 >>', '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>', null, '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>']
  const text = 'BT /F1 24 Tf 72 700 Td (Weather notes) Tj ET BT /F1 12 Tf 72 670 Td (' + 'Notes on the light and the long evenings. '.repeat(2) + ') Tj ET'
  objects[3] = `<< /Length ${text.length} >>\nstream\n${text}\nendstream`
  let out = '%PDF-1.4\n'; const offsets = []
  objects.forEach((body, i) => { offsets.push(out.length); out += `${i + 1} 0 obj\n${body}\nendobj\n` })
  const xref = out.length
  out += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n` + offsets.map(o => String(o).padStart(10, '0') + ' 00000 n \n').join('') + `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`
  return Buffer.from(out, 'latin1')
}
const shot = async (page, name) => { if (ARTIFACTS) await page.screenshot({ path: path.join(ARTIFACTS, `${name}.png`) }) }
const rows = page => page.$$eval('.own-queue__item', items => items.map(row => ({ name: row.querySelector('.own-queue__name').textContent, status: row.dataset.status, text: row.querySelector('.own-queue__status').textContent })))
const dialogTitle = page => page.locator('[data-testid="own-file-dialog"] h2').innerText()
const noSideScroll = page => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)

async function openAdd(page) {
  const add = page.locator('#library-add')
  await add.waitFor({ state: 'visible', timeout: 60000 })
  await add.click()
  await page.locator('.own-file-dialog[data-step="choose"]').waitFor({ timeout: 30000 })
}

async function main() {
  if (ARTIFACTS) await fs.mkdir(ARTIFACTS, { recursive: true })
  const server = await serve(), origin = `http://127.0.0.1:${server.address().port}`
  const supabase = await supabaseHost()
  const browser = await chromium.launch({ headless: true, args: ['--mute-audio'] })
  const failures = []
  const run = async (label, fn) => { try { await fn(); console.log(`ok   ${label}`) } catch (error) { failures.push(label); console.log(`FAIL ${label}\n     ${String(error.stack || error.message).split('\n').slice(0, 8).join('\n     ')}`) } }
  try {
    for (const [name, viewport] of [['desktop', DESKTOP], ['phone', PHONE]]) {
      account.books = []; account.uploads = []
      await run(`${name}: three files at once, a queue, two on My shelf, the failure says why`, async () => {
        const { c, outside } = await context(browser, origin, supabase, viewport), page = await c.newPage()
        const errors = []
        page.on('pageerror', error => errors.push(error.message))
        await page.goto('/library?sharedReader=1')
        const epub = await page.evaluate(async () => {
          const { pasteEpub } = await import('/lab/library_2/paste-text.js?v=20261105flow')
          const body = '<p>' + 'The harbour keeps its own almanac of tides and weather. '.repeat(30) + '</p>'
          return [...new Uint8Array(await pasteEpub({ source: body, format: 'html', title: 'Harbour Almanac', author: 'A. Keeper', uid: '00000000-0000-4000-8000-0000000a1a1a' }).arrayBuffer())]
        })
        await openAdd(page)
        const input = page.locator('[data-testid="own-file-dialog"] .own-file-input')
        assert.equal(await input.evaluate(el => el.multiple), true, 'the picker takes several files')
        await input.setInputFiles([
          { name: 'weather-notes.pdf', mimeType: 'application/pdf', buffer: pdfBytes() },
          { name: 'not-really.pdf', mimeType: 'application/pdf', buffer: Buffer.from('Just a few words of plain text, renamed to look like a PDF.') },
          { name: 'harbour-almanac.epub', mimeType: 'application/epub+zip', buffer: Buffer.from(epub) },
        ])
        // The rights confirmation, once for the whole batch.
        await page.locator('.own-file-rights').waitFor({ timeout: 30000 })
        assert.match(await page.locator('.own-file-rights-intro').innerText(), /Tinct opens 3 files here/)
        await shot(page, `01-rights-${name}`)
        await page.locator('.own-file-rights-box').check()
        await page.locator('.own-file-continue').click()
        await page.locator('.own-file-dialog[data-step="queue"]').waitFor({ timeout: 30000 })
        await page.waitForFunction(() => document.querySelector('.own-queue__item[data-status="preparing"]') && document.querySelector('.own-queue__item[data-status="waiting"]'), null, { timeout: 30000 })
        assert.equal(await dialogTitle(page), 'Adding 3 books')
        const during = await rows(page)
        assert.deepEqual(during.map(r => r.name), ['weather-notes.pdf', 'not-really.pdf', 'harbour-almanac.epub'], 'in the order chosen')
        assert.equal(during.filter(r => r.status === 'preparing').length, 1, 'one at a time')
        assert.equal(await page.locator('.own-file-dialog').getAttribute('data-busy'), null, 'the pop-up is not busy: it can be closed')
        assert(await noSideScroll(page), 'no sideways scroll')
        await shot(page, `02-queue-working-${name}`)
        await page.waitForFunction(() => document.querySelector('[data-testid="own-file-dialog"] h2')?.textContent?.startsWith('Added '), null, { timeout: 90000 })
        assert.equal(await dialogTitle(page), 'Added 2 of 3 books')
        const after = await rows(page)
        assert.deepEqual(after.map(r => r.status), ['ready', 'failed', 'ready'])
        assert.equal(after[1].text, 'This file could not be opened as a PDF. Choose another file.', 'the failure keeps the engine’s own reason')
        assert.equal(after[0].text, 'Added'); assert.equal(after[2].text, 'Added')
        // Landed on My shelf (no book opened), with both books there and in the account.
        assert.equal(new URL(page.url()).pathname, '/library', 'no book was opened')
        await page.waitForFunction(() => !document.getElementById('collection')?.hidden, null, { timeout: 30000 })
        await page.waitForFunction(() => document.querySelectorAll('#collection .own-book').length >= 2, null, { timeout: 30000 })
        assert.deepEqual([...account.uploads].sort(), ['harbour-almanac.epub', 'weather-notes.pdf'], 'both good books reached the account, the failed one did not')
        await shot(page, `03-queue-done-${name}`)
        await page.locator('[data-testid="own-file-dialog"] .own-file-close').click()
        await page.waitForTimeout(400)
        const titles = await page.$$eval('#collection .own-book', cards => cards.map(card => card.textContent.replace(/\s+/g, ' ').trim()))
        assert(titles.some(t => /Harbour Almanac/.test(t)), `the EPUB is on My shelf: ${JSON.stringify(titles)}`)
        assert(titles.some(t => /Weather notes|weather notes/i.test(t)), `the PDF is on My shelf: ${JSON.stringify(titles)}`)
        await shot(page, `04-my-shelf-${name}`)

        if (name === 'desktop') {
          // The same EPUB again, with a new text file: the EPUB is skipped, the text added.
          await page.locator('#library-add').click()
          await page.locator('.own-file-dialog[data-step="choose"]').waitFor({ timeout: 30000 })
          await page.locator('[data-testid="own-file-dialog"] .own-file-input').setInputFiles([
            { name: 'harbour-almanac.epub', mimeType: 'application/epub+zip', buffer: Buffer.from(epub) },
            { name: 'evening-walk.txt', mimeType: 'text/plain', buffer: Buffer.from('Evening walk\n\n' + 'The path follows the sea wall past the lamps. '.repeat(40)) },
          ])
          await page.waitForFunction(() => document.querySelector('[data-testid="own-file-dialog"] h2')?.textContent?.startsWith('Added '), null, { timeout: 90000 })
          const again = await rows(page)
          assert.deepEqual(again.map(r => [r.name, r.status, r.text]), [['harbour-almanac.epub', 'skipped', 'Already on My shelf'], ['evening-walk.txt', 'ready', 'Added']])
          assert.equal(await dialogTitle(page), 'Added 1 of 2 books')
          await shot(page, `05-duplicate-skipped-${name}`)
          await page.locator('[data-testid="own-file-dialog"] .own-file-close').click()
          await page.waitForFunction(() => document.querySelectorAll('#collection .own-book').length >= 3, null, { timeout: 30000 })
        }
        assert.deepEqual(outside.filter(u => !/fonts\.(googleapis|gstatic)\.com/.test(u)), [], 'nothing reached an outside service or a provider route')
        assert.deepEqual(errors, [], 'no page errors')
        await c.close()
      })
    }
    account.books = []; account.uploads = []
    await run('desktop: signed out on /byob, two files -> sign-in names them -> the library queue -> My shelf', async () => {
      const { c, outside } = await context(browser, origin, supabase, DESKTOP, { signedIn: false }), page = await c.newPage()
      const errors = []
      page.on('pageerror', error => errors.push(error.message))
      await page.goto('/byob')
      assert.equal(await page.locator('#file').evaluate(el => el.multiple), true, '/byob\'s picker takes several files')
      await page.locator('#file').setInputFiles([
        { name: 'tide-tables.pdf', mimeType: 'application/pdf', buffer: pdfBytes() },
        { name: 'lamp-log.txt', mimeType: 'text/plain', buffer: Buffer.from('Lamp log\n\n' + 'The lamp was lit at dusk and trimmed at midnight. '.repeat(40)) },
      ])
      await page.waitForURL(/\/sign-in\?returnTo=/, { timeout: 30000 })
      await page.waitForFunction(() => !document.querySelector('[data-signin-file]')?.hidden, null, { timeout: 30000 })
      assert.equal(await page.locator('[data-signin-title]').innerText(), 'Sign in or join to add your books')
      assert.equal(await page.locator('[data-signin-file] b').innerText(), 'tide-tables.pdf and 1 more')
      assert.equal(await page.locator('[data-signin-file] span').innerText(), 'Added to My shelf as soon as you are in')
      await shot(page, '06-sign-in-two-files-desktop')
      // Signed in as the sign-in page would leave it, then on to where it returns.
      await page.evaluate(({ key, value }) => { localStorage.setItem(key, value); document.cookie = 'tinct_auth=1; path=/; SameSite=Lax' }, { key: `sb-${supabase.ref}-auth-token`, value: JSON.stringify(session()) })
      const returnTo = new URL(page.url()).searchParams.get('returnTo')
      assert.equal(returnTo, '/preparing?own=file')
      await page.goto(returnTo)
      await page.waitForURL(/\/library/, { timeout: 60000 })
      await page.waitForFunction(() => document.querySelector('[data-testid="own-file-dialog"] h2')?.textContent?.startsWith('Added ') || !document.getElementById('collection')?.hidden && document.querySelectorAll('#collection .own-book').length >= 2, null, { timeout: 90000 })
      assert.equal(await page.locator('.own-file-rights').count(), 0, 'the rights line shown on /byob and sign-in counts: no second confirmation')
      await page.waitForFunction(() => !document.getElementById('collection')?.hidden && document.querySelectorAll('#collection .own-book').length >= 2, null, { timeout: 30000 })
      assert.deepEqual([...account.uploads].sort(), ['lamp-log.epub', 'tide-tables.pdf'].sort(), `both reached the account: ${JSON.stringify(account.uploads)}`)
      assert.equal(new URL(page.url()).pathname, '/library', 'no book was opened')
      assert.equal(await page.evaluate(async () => (await import('/lab/addbook/js/file-handoff.js')).peekHandoffEntry()), null, 'the device copy is taken')
      await shot(page, '07-byob-batch-my-shelf-desktop')
      assert.deepEqual(outside.filter(u => !/fonts\.(googleapis|gstatic)\.com/.test(u)), [], 'nothing reached an outside service or a provider route')
      assert.deepEqual(errors, [], 'no page errors')
      await c.close()
    })
  } finally {
    await browser.close(); server.close()
  }
  if (failures.length) { console.log(`\n${failures.length} failed`); process.exit(1) }
  console.log('\nall bulk-upload checks passed')
}
await main()
