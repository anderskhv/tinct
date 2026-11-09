// A link imports the article (Anders, 9 Nov 2026: "import articles rather than pasting text via link"), from
// "Insert link", one of the three choices of "Add your own" (Anders, 9 Nov 2026: "3 options, upload, insert
// link, paste text… no extra links, keep it clean"). A link pasted alone into Paste text goes to Insert link.
//
// Loads the built site (dist/) in headless Chromium, desktop and phone, and asserts:
// 1. Signed in, the library pop-up: Insert link (a back chevron, one field "Link to an article", Add) takes a
//    link; nothing is fetched until Add; Add imports it ("Importing the article from …") and the reader opens
//    the article: its title, its "From <site>" line and its paragraphs, without the site's menu, ads or
//    comments. A link pasted into Paste text lands in Insert link, as pasted, and imports the same way.
// 2. Signed out, /byob: Insert link (and a link pasted into Paste text) keeps the link on the device; sign-in
//    names the article by its site; after a faked sign-in /preparing imports it and the reader opens it.
// 3. A page that shares no text (a JavaScript-only page, a paywall): the honest message, the link kept, no
//    book and no upload. In the pop-up and on /preparing (with the way back to /byob, where the link still is).
// 4. Pasted text behaves as before: no import request, the text in the reader.
//
// /api/import-article is the real Worker route (src/worker/routes/importArticle.ts, loaded through Vite's
// SSR loader), whose page fetch is answered from src/worker/__fixtures__/articles: nothing leaves the
// machine. Every account call is answered here too. Run after `npm run build`, from app/ or app/scripts:
// node scripts/check-import-article.mjs   (IMPORT_ARTIFACTS=<dir> also writes screenshots)
import { chromium } from '@playwright/test'
import { createServer } from 'node:http'
import { createHash } from 'node:crypto'
import { fileURLToPath } from 'node:url'
import fs from 'node:fs/promises'
import path from 'node:path'
import assert from 'node:assert/strict'
import { createServer as createViteServer } from 'vite'

const APP = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const DIST = path.join(APP, 'dist')
const FIXTURES = path.join(APP, 'src/worker/__fixtures__/articles')
const ARTIFACTS = process.env.IMPORT_ARTIFACTS || ''
const USER = '00000000-0000-4000-8000-00000000a771'
const CSP = (await fs.readFile(path.join(APP, 'src/worker/routes/seo.ts'), 'utf8')).match(/'Content-Security-Policy': "([^"]+)"/)[1]
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.jpg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.mp4': 'video/mp4', '.wasm': 'application/wasm' }
const PAGES = { '/library': '/lab/library_2/index.html', '/library/': '/lab/library_2/index.html', '/byob': '/byob.html', '/byob/': '/byob.html', '/sign-in': '/lab/sign-in/index.html', '/preparing': '/preparing.html', '/reader': '/app.html' }

// The web, as far as the import route can see it: each fixture page at its own address.
const WEB = {
  'https://news.example.org/2026/11/otters': 'news.html',
  'https://fieldnotes.example.net/commonplace': 'blog.html',
  'https://app.example.org/read/1': 'spa.html',
  'https://review.example.org/census': 'paywall.html',
}
const NEWS = 'https://news.example.org/2026/11/otters'
const BLOG = 'https://fieldnotes.example.net/commonplace'

const vite = await createViteServer({ root: APP, configFile: false, logLevel: 'silent', server: { middlewareMode: true, hmr: false }, appType: 'custom', optimizeDeps: { noDiscovery: true, include: [] } })
const { handleImportArticle } = await vite.ssrLoadModule('/src/worker/routes/importArticle.ts')

const account = { books: [], uploads: 0, imports: [], importHold: 0, siteFetches: [] }
async function importRoute(req, res, body) {
  const request = new Request('http://127.0.0.1/api/import-article', { method: 'POST', headers: { 'content-type': 'application/json', authorization: req.headers.authorization || '', 'content-length': String(body.length) }, body })
  account.imports.push(JSON.parse(body.toString() || '{}').url)
  if (account.importHold) await new Promise(resolve => setTimeout(resolve, account.importHold))
  const response = await handleImportArticle(request, {}, {
    verifyUser: async (_env, r) => (/^Bearer \S+/.test(r.headers.get('authorization') || '') ? { id: USER, email: 'reader@example.com' } : null),
    checkRateLimit: async () => true,
    fetchOptions: { fetchImpl: async url => {
      account.siteFetches.push(url)
      const name = WEB[url]
      if (!name) return new Response('Not found', { status: 404 })
      return new Response(await fs.readFile(path.join(FIXTURES, name)), { headers: { 'content-type': 'text/html; charset=utf-8' } })
    } },
  })
  res.writeHead(response.status, Object.fromEntries(response.headers))
  res.end(Buffer.from(await response.arrayBuffer()))
}

function serve() {
  const server = createServer(async (req, res) => {
    const url = new URL(req.url, 'http://local')
    if (url.pathname === '/api/import-article' && req.method === 'POST') {
      const chunks = []; for await (const chunk of req) chunks.push(chunk)
      return importRoute(req, res, Buffer.concat(chunks))
    }
    if (url.pathname === '/api/user-books' && req.method === 'POST') {
      const chunks = []; for await (const chunk of req) chunks.push(chunk)
      const bytes = Buffer.concat(chunks)
      account.uploads += 1
      const sha256 = createHash('sha256').update(bytes).digest('hex')
      const book = { id: sha256.slice(0, 24), sha256, type: 'epub', size: bytes.length, name: decodeURIComponent(req.headers['x-book-name'] || 'Book'), title: decodeURIComponent(req.headers['x-book-title'] || ''), author: decodeURIComponent(req.headers['x-book-author'] || ''), createdAt: new Date(0).toISOString(), rev: 0, bytes }
      if (!account.books.some(b => b.sha256 === sha256)) account.books.push(book)
      res.writeHead(201, { 'content-type': 'application/json' }); res.end(JSON.stringify({ book: { ...book, bytes: undefined } })); return
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
async function signInHere(page, supabase) {
  await page.evaluate(({ key, value }) => { localStorage.setItem(key, value); document.cookie = 'tinct_auth=1; path=/; SameSite=Lax' }, { key: `sb-${supabase.ref}-auth-token`, value: JSON.stringify(session()) })
}
async function context(browser, origin, supabase, { signedIn, viewport }) {
  const c = await browser.newContext({ viewport, baseURL: origin, serviceWorkers: 'block', reducedMotion: 'reduce' })
  await c.route(url => /^https?:$/.test(url.protocol) && url.origin !== origin && url.hostname !== supabase.host, route => route.abort())
  await c.route('**/*.mp4', route => route.abort())
  await c.route(`${origin}/api/**`, route => {
    const request = route.request(), p = new URL(request.url()).pathname, method = request.method()
    if (p === '/api/import-article' || (p === '/api/user-books' && method === 'POST')) return route.continue()
    if (p === '/api/lab-position') return route.fulfill({ json: { books: {}, finished: {}, owner: USER, hidden: {}, updatedAt: 0 } })
    if (p === '/api/public-books/import/access') return route.fulfill({ json: { canAdd: true } })
    if (p === '/api/user-books' && method === 'GET') return route.fulfill({ json: { books: account.books.map(b => ({ ...b, bytes: undefined })) } })
    const own = account.books.find(b => p === `/api/user-books/${b.id}`)
    if (own && method === 'GET') return route.fulfill({ status: 200, contentType: 'application/epub+zip', body: own.bytes })
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
const NO_TEXT = 'This page didn’t share its text. Paste the article text instead.'
const shot = async (page, name) => { if (ARTIFACTS) await page.screenshot({ path: path.join(ARTIFACTS, `${name}.png`) }) }
const noSideScroll = page => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)
const libraryReady = page => page.waitForFunction(() => document.documentElement.classList.contains('library-ready') || document.querySelector('.own-books-band'), null, { timeout: 60000 })
const signInReady = page => page.waitForFunction(() => document.querySelector('#tinct-lab-sign-in')?.dataset.ready === 'true', null, { timeout: 30000 })
/** Paste as a browser does: text/plain, and the link as text/html too when `html` is set. */
const pasteInto = (page, selector, plain, html = '') => page.locator(selector).evaluate((el, { plain, html }) => {
  el.focus()
  const clipboard = new DataTransfer(); if (html) clipboard.setData('text/html', html); clipboard.setData('text/plain', plain)
  el.dispatchEvent(new ClipboardEvent('paste', { bubbles: true, cancelable: true, clipboardData: clipboard }))
}, { plain, html })
const readerReady = page => page.waitForFunction(() => document.querySelector('[data-testid="lab-root"]')?.dataset.readerReady === 'true', null, { timeout: 60000 })
/** The reader shows the imported article: its title, where it came from and its paragraphs, none of the site's parts. */
async function showsArticle(page, { title, site, first, chrome }) {
  await page.waitForURL(/\/reader\?userBook=[0-9a-f]{24}&sharedReader=1/, { timeout: 60000 })
  await readerReady(page)
  await page.getByText(first, { exact: false }).first().waitFor({ timeout: 30000 })
  const text = await page.locator('[data-testid="lab-root"]').innerText()
  assert(text.includes(title), `the reader shows the article's title "${title}"`)
  assert(text.includes(`From ${site}`), `the reader names where it came from ("From ${site}")`)
  for (const part of chrome) assert(!text.includes(part), `"${part}" from the site is not in the book`)
  // The reader draws a link word by word (a.lab-link): the site's last word carries the page's address.
  const last = site.split(' ').pop()
  return page.locator('[data-testid="lab-root"] a.lab-link', { hasText: last }).first().getAttribute('href', { timeout: 5000 }).catch(() => null)
}
async function openAddPopUp(page) {
  await page.goto('/library?sharedReader=1')
  await libraryReady(page)
  await page.locator('#library-add:visible').click()
  await page.locator('.own-file-dialog[data-step="choose"]').waitFor()
  assert.equal(await page.locator('.own-file-dialog h2').innerText(), 'Add your own')
  assert.deepEqual(await page.locator('.own-file-dialog .add-choice .add-choice__label').allInnerTexts(), ['Upload', 'Insert link', 'Paste text'])
}
async function openPastePopUp(page) {
  await openAddPopUp(page)
  await page.getByRole('button', { name: 'Paste text', exact: true }).click()
  await page.locator('.own-file-dialog.paste-dialog[data-step="paste"]').waitFor()
}
async function openLinkPopUp(page) {
  await openAddPopUp(page)
  await page.getByRole('button', { name: 'Insert link', exact: true }).click()
  await page.locator('.own-file-dialog[data-step="link"]').waitFor()
  assert.equal(await page.locator('.own-file-dialog h2').innerText(), 'Insert link')
  assert(await page.locator('.own-file-dialog .tui-dialog__head .add-own-back').isVisible(), 'a back chevron to the three choices')
  assert.equal(await page.locator('.own-file-dialog .add-link__label').innerText(), 'Link to an article')
}
const LINK_FIELD = '.own-file-dialog .add-link__input'
const NEWS_CHROME = ['Accept all', 'Advertisement', 'Share on', 'Herons nest', 'morning briefing', 'Wonderful news', 'Council approves', 'All rights reserved']

async function main() {
  if (ARTIFACTS) await fs.mkdir(ARTIFACTS, { recursive: true })
  const server = await serve(), origin = `http://127.0.0.1:${server.address().port}`
  const supabase = await supabaseHost()
  const browser = await chromium.launch({ args: ['--mute-audio'] })
  const failures = []
  const run = async (label, fn) => { try { await fn(); console.log(`ok   ${label}`) } catch (error) { failures.push(label); console.log(`FAIL ${label}\n     ${error.message.split('\n').slice(0, 8).join('\n     ')}`) } }
  const reset = () => { account.books = []; account.uploads = 0; account.imports = []; account.siteFetches = []; account.importHold = 0 }
  try {
    for (const [name, viewport] of [['desktop', DESKTOP], ['phone', PHONE]]) {
      for (const via of ['Insert link', 'a link pasted into Paste text']) await run(`library pop-up, ${name}, ${via}: the link -> importing -> the reader shows the article`, async () => {
        reset(); account.importHold = 1500
        const c = await context(browser, origin, supabase, { signedIn: true, viewport }), page = await c.newPage()
        const errors = []; page.on('pageerror', e => errors.push(e.message))
        const tag = via === 'Insert link' ? 'link' : 'pasted'
        if (via === 'Insert link') {
          await openLinkPopUp(page)
          await page.locator(LINK_FIELD).fill(NEWS)
        } else {
          await openPastePopUp(page)
          assert.equal(await page.locator('.paste-dialog .paste-box').getAttribute('data-placeholder'), 'Paste your text here')
          assert.equal(await page.locator('.paste-dialog').getByText('Tinct imports the article', { exact: false }).count(), 0, 'no link line in the paste box')
          await pasteInto(page, '.paste-dialog .paste-box', NEWS, `<a href="${NEWS}">${NEWS}</a>`)
          await page.locator('.own-file-dialog[data-step="link"]').waitFor()
          assert.equal(await page.locator('.own-file-dialog h2').innerText(), 'Insert link', 'a pasted link goes to Insert link')
        }
        assert.equal(await page.locator(LINK_FIELD).inputValue(), NEWS, 'the field holds the link as it was given')
        assert.equal(account.imports.length, 0, 'nothing is fetched until Add')
        assert(await noSideScroll(page))
        await page.locator(LINK_FIELD).evaluate(el => el.blur())
        await shot(page, `01-${tag}-${name}`)
        await page.getByRole('button', { name: 'Add', exact: true }).click()
        await page.locator('.own-file-note', { hasText: 'Importing the article from news.example.org…' }).waitFor({ timeout: 10000 })
        await shot(page, `02-importing-${tag}-${name}`)
        const href = await showsArticle(page, { title: 'The quiet return of the river otter', site: 'The Northern Ledger', first: 'For most of the last century', chrome: NEWS_CHROME })
        assert.equal(href, NEWS, 'the "From" line links the article\'s own page')
        await page.getByText('Many of them, Brand suspects', { exact: false }).first().waitFor({ state: 'attached' })
        if (via === 'Insert link') await shot(page, `03-reader-article-${name}`)
        assert.deepEqual(account.imports, [NEWS], 'one import request, carrying the link')
        assert.deepEqual(account.siteFetches, [NEWS], 'the server fetched the page once')
        assert.equal(account.uploads, 1)
        assert.equal(account.books[0].title, 'The quiet return of the river otter', 'the account copy carries the article\'s title')
        assert.equal(account.books[0].author, 'Maren Holt', 'and its byline')
        assert.deepEqual(errors, [])
        await c.close()
      })
    }

    for (const [name, viewport] of [['desktop', DESKTOP], ['phone', PHONE]]) {
      await run(`/byob signed out, ${name}: a link -> sign-in names the article -> Preparing imports it -> the reader`, async () => {
        reset(); account.importHold = 2000
        const c = await context(browser, origin, supabase, { signedIn: false, viewport }), page = await c.newPage()
        const errors = [], refused = []
        page.on('pageerror', e => errors.push(e.message))
        page.on('console', m => { if (/Content Security Policy/i.test(m.text())) refused.push(m.text().slice(0, 160)) })
        await page.goto('/byob')
        assert.deepEqual(await page.locator('.drop .add-choice .add-choice__label').allInnerTexts(), ['Upload', 'Insert link', 'Paste text'])
        if (name === 'desktop') {
          await page.locator('#link').click()
          await page.locator('#link-area').waitFor()
          assert.equal(await page.locator('#link-title').innerText(), 'Insert link')
          await page.locator('#link-area .add-link__input').fill(BLOG)
        } else {
          // A link pasted into Paste text goes to Insert link, as pasted.
          await page.locator('#paste').click()
          await page.locator('#paste-area').waitFor()
          await pasteInto(page, '#paste-area .paste-box', BLOG)
          await page.locator('#link-area').waitFor()
          assert.equal(await page.locator('#paste-area').isVisible(), false)
          assert.equal(await page.locator('#link-area .add-link__input').inputValue(), BLOG)
        }
        assert(await page.locator('#link-back').isVisible(), 'a back chevron to the three choices')
        assert.equal(await page.locator('.add-choices').isVisible(), false, 'the choices give way to the step')
        assert(await noSideScroll(page))
        await page.locator('#link-area .add-link__input').evaluate(el => el.blur())
        await shot(page, `04-byob-link-${name}`)
        await page.locator('#link-area .add-link__add').click()
        await page.waitForURL(/\/sign-in\?/)
        assert.equal(new URL(page.url()).searchParams.get('returnTo'), '/preparing?own=paste')
        await signInReady(page)
        await page.waitForFunction(() => !document.querySelector('[data-signin-file]')?.hidden, null, { timeout: 10000 })
        assert.equal(await page.locator('[data-signin-title]').innerText(), 'Sign in or join to add this article')
        assert.equal(await page.locator('[data-signin-file] b').innerText(), 'Article from fieldnotes.example.net')
        assert.equal(account.imports.length, 0, 'nothing is fetched before sign-in')
        await shot(page, `05-sign-in-article-${name}`)
        await signInHere(page, supabase)
        await page.reload()
        await page.waitForURL(url => url.pathname === '/preparing', { timeout: 30000 })
        await page.locator('#line').getByText('Importing the article from fieldnotes.example.net…').waitFor({ timeout: 15000 })
        await shot(page, `06-preparing-importing-${name}`)
        await showsArticle(page, { title: 'Notes on keeping a commonplace book', site: 'Field Notes', first: 'For about ten years I have kept a commonplace book', chrome: ['Recent posts', 'Share this post', 'small house by the sea'] })
        await page.getByText('Why by hand', { exact: false }).first().waitFor({ state: 'attached' })
        await shot(page, `07-reader-blog-${name}`)
        assert.equal(account.books[0].author, 'Tomas Ward')
        assert.equal(await page.evaluate(async () => (await import('/lab/addbook/js/file-handoff.js')).peekPasteHandoff()), null, 'the kept link is gone once the article is in')
        assert.deepEqual(refused, []); assert.deepEqual(errors, [])
        await c.close()
      })
    }

    for (const [name, viewport] of [['desktop', DESKTOP], ['phone', PHONE]]) {
      await run(`a page with no text, ${name}: the honest message in the pop-up, the link kept, no book`, async () => {
        reset()
        const c = await context(browser, origin, supabase, { signedIn: true, viewport }), page = await c.newPage()
        await openLinkPopUp(page)
        await page.locator(LINK_FIELD).fill('https://app.example.org/read/1')
        await page.getByRole('button', { name: 'Add', exact: true }).click()
        await page.locator('.own-link-error', { hasText: NO_TEXT }).waitFor({ timeout: 20000 })
        assert.equal(await page.locator('.own-file-dialog').getAttribute('data-step'), 'link', 'back on Insert link')
        assert.equal(await page.locator(LINK_FIELD).inputValue(), 'https://app.example.org/read/1', 'the link is still in the field')
        assert.equal(account.uploads, 0, 'no book is made')
        assert(await page.getByRole('button', { name: 'Add', exact: true }).isEnabled(), 'the reader can try again or paste the text')
        assert(await noSideScroll(page))
        await shot(page, `08-refused-popup-${name}`)
        await c.close()
      })
    }

    await run('a paywalled page via /byob, signed in: /preparing says so and /byob shows the link again', async () => {
      reset()
      const c = await context(browser, origin, supabase, { signedIn: true, viewport: PHONE }), page = await c.newPage()
      await page.goto('/byob')
      await page.locator('#link').click()
      await page.locator('#link-area .add-link__input').fill('https://review.example.org/census')
      await page.locator('#link-area .add-link__add').click()
      await page.waitForURL(url => url.pathname === '/preparing')
      await page.locator('#problem').waitFor({ timeout: 30000 })
      assert.equal(await page.locator('#problem').innerText(), NO_TEXT)
      assert.equal(await page.locator('#line').innerText(), 'The article is not added yet')
      assert.equal(account.uploads, 0)
      await shot(page, '09-refused-preparing-phone')
      await page.locator('#back').click()
      await page.waitForURL(url => url.pathname === '/byob')
      await page.locator('#link-area').waitFor()
      await page.waitForFunction(() => document.querySelector('#link-area .add-link__input')?.value === 'https://review.example.org/census', null, { timeout: 10000 })
      await c.close()
    })

    for (const [name, viewport] of [['desktop', DESKTOP], ['phone', PHONE]]) {
      await run(`pasted text, ${name}: as before, no import request`, async () => {
        reset()
        const c = await context(browser, origin, supabase, { signedIn: true, viewport }), page = await c.newPage()
        await openPastePopUp(page)
        const prose = 'The harbour wall was rebuilt in the spring, stone by stone, by men who had learned the work from their fathers. '.repeat(4)
        await pasteInto(page, '.paste-dialog .paste-box', `Harbour notes\n\n${prose}\n\nSee https://example.org/more for the photographs.`)
        assert.equal((await page.locator('.paste-dialog .paste-title__text').innerText()).trim(), 'Harbour notes')
        assert.match(await page.locator('.paste-dialog .paste-meta').innerText(), /^\d+ words$/)
        await page.getByRole('button', { name: 'Add', exact: true }).click()
        await page.waitForURL(/\/reader\?userBook=[0-9a-f]{24}&sharedReader=1/, { timeout: 60000 })
        await readerReady(page)
        await page.getByText('The harbour wall was rebuilt in the spring', { exact: false }).first().waitFor({ timeout: 30000 })
        assert.equal(account.imports.length, 0, 'pasted text is never sent to the import route')
        assert.equal(account.books[0].title, 'Harbour notes')
        await shot(page, `10-reader-pasted-text-${name}`)
        await c.close()
      })
    }
  } finally {
    await browser.close()
    server.close()
    await vite.close()
  }
  if (failures.length) { console.log(`\n${failures.length} failed`); process.exit(1) }
  console.log('\nAll import-article checks passed')
}

await main()
