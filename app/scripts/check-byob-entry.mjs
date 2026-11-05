// /byob and the library's "Read your own books" band (Anders approved the mockups, 4 Nov 2026).
//
// Loads the built site (dist/) in headless Chromium and asserts:
// 1. /byob, signed out, at desktop and phone width: the page, its two actions, no sideways scroll.
//    Paste text and a chosen file both lead to sign-in, returning to /library?own=paste|file.
// 2. Signed in (a faked account): a file chosen on /byob opens the library's "Your own book"
//    pop-up and is added at once (the pop-up leaves its Choose step); Paste text opens the pop-up
//    at Paste text.
// 2b. Sign-in names why you came (approved S1/S3): a chosen file shows "Sign in to add your book"
//    and the file's name (the handoff is only peeked, so the library still gets it), Paste text
//    shows "Sign in to add your text", and anything else "Sign in to Tinct".
// 2c. Signed out, the library hero offers "Add your own book or text" beside Read, leading to /byob;
//    signed in, it is not shown.
// 3. The library shows the band right under Featured; signed out it leads to /byob, signed in it
//    opens the "Your own book" pop-up.
//
// Run after `npm run build` from app/: node scripts/check-byob-entry.mjs
// BYOB_ARTIFACTS=<dir> also writes screenshots.
import { chromium } from '@playwright/test'
import { createServer } from 'node:http'
import fs from 'node:fs/promises'
import path from 'node:path'
import assert from 'node:assert/strict'

const DIST = path.resolve('dist')
const ARTIFACTS = process.env.BYOB_ARTIFACTS || ''
const USER = '00000000-0000-4000-8000-0000000b70b1'
// The site's own Content-Security-Policy (src/worker/routes/seo.ts SECURITY_HEADERS), sent with every
// page here as the Worker sends it: an inline script, refused on tinct.app, must be refused here too.
const CSP = (await fs.readFile(path.resolve('src/worker/routes/seo.ts'), 'utf8')).match(/'Content-Security-Policy': "([^"]+)"/)[1]
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.jpg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.mp4': 'video/mp4' }

function serve() {
  const server = createServer(async (req, res) => {
    let pathname = decodeURIComponent(new URL(req.url, 'http://local').pathname)
    if (['/library', '/library/'].includes(pathname)) pathname = '/lab/library_2/index.html'
    if (['/byob', '/byob/'].includes(pathname)) pathname = '/byob.html'
    if (pathname === '/sign-in') pathname = '/lab/sign-in/index.html'
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

async function context(browser, origin, supabase, { signedIn, viewport }) {
  const c = await browser.newContext({ viewport, baseURL: origin, serviceWorkers: 'block' })
  await c.route(url => /^https?:$/.test(url.protocol) && url.origin !== origin && url.hostname !== supabase.host, route => route.abort())
  await c.route('**/*.mp4', route => route.abort())
  await c.route(`${origin}/api/**`, route => route.fulfill({ status: 204, body: '' }))
  await c.route(`${origin}/api/lab-position**`, route => route.fulfill({ json: { books: {}, finished: {}, owner: USER, hidden: {}, updatedAt: 0 } }))
  await c.route(`https://${supabase.host}/**`, route => {
    const url = new URL(route.request().url())
    if (url.pathname.startsWith('/auth/v1/user')) return route.fulfill({ json: { id: USER, aud: 'authenticated', role: 'authenticated', email: 'reader@example.com', app_metadata: {}, user_metadata: {}, created_at: '2026-10-01T00:00:00Z' } })
    return route.fulfill({ json: [] })
  })
  if (signedIn) {
    const exp = Math.floor(Date.now() / 1000) + 3600
    const b64 = value => Buffer.from(JSON.stringify(value)).toString('base64url')
    const user = { id: USER, aud: 'authenticated', role: 'authenticated', email: 'reader@example.com', app_metadata: {}, user_metadata: {}, created_at: '2026-10-01T00:00:00Z' }
    const session = { access_token: `${b64({ alg: 'HS256', typ: 'JWT' })}.${b64({ sub: USER, exp, role: 'authenticated' })}.fixture`, refresh_token: 'fixture', token_type: 'bearer', expires_in: 3600, expires_at: exp, user }
    await c.addCookies([{ name: 'tinct_auth', value: '1', url: origin }])
    await c.addInitScript(({ key, session }) => { try { localStorage.setItem(key, session) } catch { /* private */ } }, { key: `sb-${supabase.ref}-auth-token`, session: JSON.stringify(session) })
  }
  return c
}

const DESKTOP = { width: 1440, height: 900 }, PHONE = { width: 390, height: 844 }
const TEXT = { name: 'an-essay.txt', mimeType: 'text/plain', buffer: Buffer.from('An essay\n\n' + 'A plain paragraph of the reader\'s own text, long enough to be a book. '.repeat(40)) }
const shot = async (page, name) => { if (ARTIFACTS) await page.screenshot({ path: path.join(ARTIFACTS, `${name}.png`) }) }
const noSideScroll = page => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)
const libraryReady = page => page.waitForFunction(() => document.documentElement.classList.contains('library-ready') || document.querySelector('.own-books-band'), null, { timeout: 60000 })
const ownStep = page => page.waitForFunction(() => document.querySelector('[data-testid="own-file-dialog"] .own-file-dialog')?.dataset.step || null, null, { timeout: 30000 }).then(h => h.jsonValue())

async function main() {
  if (ARTIFACTS) await fs.mkdir(ARTIFACTS, { recursive: true })
  const server = await serve(), origin = `http://127.0.0.1:${server.address().port}`
  const supabase = await supabaseHost()
  const browser = await chromium.launch()
  const failures = []
  const run = async (label, fn) => { try { await fn(); console.log(`ok   ${label}`) } catch (error) { failures.push(label); console.log(`FAIL ${label}\n     ${error.message}`) } }
  try {
    for (const [name, viewport] of [['desktop', DESKTOP], ['phone', PHONE]]) {
      await run(`/byob signed out, ${name}: page, actions, no sideways scroll`, async () => {
        const c = await context(browser, origin, supabase, { signedIn: false, viewport }), page = await c.newPage()
        const refused = []
        page.on('console', m => { if (/Content Security Policy/i.test(m.text())) refused.push(m.text().slice(0, 160)) })
        await page.goto('/byob')
        await page.waitForLoadState('networkidle')
        assert.deepEqual(refused, [], 'nothing on /byob is refused by the site\'s Content-Security-Policy')
        assert.equal(await page.locator('h1').innerText(), 'Your own books, texts and PDFs.')
        assert(await page.locator('#choose').isVisible() && await page.locator('#paste').isVisible(), 'Choose a file and Paste text are shown')
        const account = page.locator(name === 'phone' ? '#account-phone' : '#account')
        assert(await account.isVisible(), 'the sign-in link is shown')
        assert.equal(await account.innerText(), 'Sign in')
        assert.equal(await page.locator('.drop-title').isVisible(), name === 'desktop', 'the drag box shows on desktop only')
        assert.equal(await page.locator('.foot a').getAttribute('href'), '/library')
        assert.equal(await page.locator('video').count(), 0, 'no recording on the page')
        const room = await page.evaluate(() => { const r = document.querySelector('.room').getBoundingClientRect(), p = document.querySelector('.page').getBoundingClientRect(); return { roomW: r.width, pageTop: p.top, pageLeft: p.left, vw: innerWidth, vh: innerHeight } })
        if (name === 'phone') assert(room.roomW >= room.vw - 1 && room.pageTop > room.vh * 0.3, `the room fills the phone and the sheet sits below it (${JSON.stringify(room)})`)
        else assert(room.pageLeft < 1 && room.roomW > room.vw * 0.4, `the page column sits left of the room (${JSON.stringify(room)})`)
        assert(await noSideScroll(page), 'no sideways scroll')
        await shot(page, `byob-${name}`)
        await page.locator('#paste').click()
        await page.waitForURL(/\/sign-in\?/)
        assert.equal(new URL(page.url()).searchParams.get('returnTo'), '/library?sharedReader=1&own=paste')
        await page.goto('/byob')
        await page.locator('#file').setInputFiles(TEXT)
        await page.waitForURL(/\/sign-in\?/)
        assert.equal(new URL(page.url()).searchParams.get('returnTo'), '/library?sharedReader=1&own=file')
        await c.close()
      })
    }
    for (const [name, viewport] of [['desktop', DESKTOP], ['phone', PHONE]]) {
      await run(`sign-in names the reason, ${name}: your book, your text, or Tinct`, async () => {
        const c = await context(browser, origin, supabase, { signedIn: false, viewport }), page = await c.newPage()
        const refused = [], errors = []
        page.on('console', m => { if (/Content Security Policy/i.test(m.text())) refused.push(m.text().slice(0, 160)) })
        page.on('pageerror', e => errors.push(e.message))
        const ready = () => page.waitForFunction(() => document.querySelector('#tinct-lab-sign-in')?.dataset.ready === 'true', null, { timeout: 30000 })
        await page.goto('/byob')
        await page.locator('#file').setInputFiles(TEXT)
        await page.waitForURL(/\/sign-in\?/)
        await ready()
        await page.waitForFunction(() => !document.querySelector('[data-signin-file]')?.hidden, null, { timeout: 10000 })
        assert.equal(await page.locator('[data-signin-title]').innerText(), 'Sign in to add your book')
        assert.equal(await page.locator('[data-signin-file] b').innerText(), TEXT.name)
        assert(await page.getByRole('button', { name: 'Continue with Google' }).isVisible(), 'Google stays')
        assert(await noSideScroll(page), 'no sideways scroll')
        const sheet = await page.locator('.auth-card').evaluate(n => getComputedStyle(n).backgroundColor)
        assert.equal(sheet, 'rgb(21, 27, 20)', 'the dark library sheet')
        await shot(page, `sign-in-file-${name}`)
        assert(await page.evaluate(async () => !!(await import('/lab/addbook/js/file-handoff.js')).peekHandoff().then(f => f)), 'the file still waits for the library')
        await page.goto('/sign-in?returnTo=' + encodeURIComponent('/library?sharedReader=1&own=paste'))
        await ready()
        assert.equal(await page.locator('[data-signin-title]').innerText(), 'Sign in to add your text')
        await page.goto('/sign-in?returnTo=%2Flibrary')
        await ready()
        assert.equal(await page.locator('[data-signin-title]').innerText(), 'Sign in to Tinct')
        assert.equal(await page.locator('[data-signin-file]').isVisible(), false)
        await shot(page, `sign-in-${name}`)
        assert.deepEqual(refused, [], 'nothing on sign-in is refused by the Content-Security-Policy')
        assert.deepEqual(errors, [])
        await c.close()
      })
    }
    await run('/byob signed in: a chosen file is added in the library pop-up at once', async () => {
      const c = await context(browser, origin, supabase, { signedIn: true, viewport: DESKTOP }), page = await c.newPage()
      const errors = []; page.on('pageerror', e => errors.push(e.message))
      await page.goto('/byob')
      assert.equal(await page.locator('#account').innerText(), 'My shelf')
      assert.equal(await page.locator('#account-phone').innerText(), 'My shelf')
      await page.locator('#file').setInputFiles(TEXT)
      await page.waitForURL(url => url.pathname === '/library')
      await page.waitForFunction(() => { const s = document.querySelector('[data-testid="own-file-dialog"] .own-file-dialog')?.dataset.step; return s && s !== 'choose' && s !== 'checking' }, null, { timeout: 30000 })
      assert(!new URL(page.url()).searchParams.has('own'), 'own= is taken off the address')
      assert.equal(new URL(page.url()).searchParams.get('sharedReader'), '1', 'the shared reader switch stays')
      await shot(page, 'byob-file-added')
      assert.deepEqual(errors, [])
      await c.close()
    })
    await run('/byob signed in: Paste text opens the pop-up at Paste text', async () => {
      const c = await context(browser, origin, supabase, { signedIn: true, viewport: DESKTOP }), page = await c.newPage()
      await page.goto('/byob')
      await page.locator('#paste').click()
      await page.waitForURL(url => url.pathname === '/library')
      await page.waitForFunction(() => document.querySelector('[data-testid="own-file-dialog"] .own-file-dialog')?.dataset.step === 'paste', null, { timeout: 30000 })
      await shot(page, 'byob-paste')
      await c.close()
    })
    for (const [name, viewport] of [['desktop', DESKTOP], ['phone', PHONE]]) {
      await run(`library band under Featured, signed out, ${name}: leads to /byob`, async () => {
        const c = await context(browser, origin, supabase, { signedIn: false, viewport }), page = await c.newPage()
        await page.goto('/library')
        await libraryReady(page)
        const band = page.locator('#shelves .own-books-band')
        await band.waitFor()
        assert(await page.evaluate(() => { const b = document.querySelector('#shelves .own-books-band'); return b?.previousElementSibling?.querySelector('h2')?.textContent === 'Featured' }), 'the band follows Featured')
        assert.equal(await band.locator('strong').innerText(), 'Read your own books')
        assert(await noSideScroll(page), 'no sideways scroll')
        await band.scrollIntoViewIfNeeded()
        await shot(page, `library-band-${name}`)
        await band.locator('.own-books-add').click()
        await page.waitForURL(url => url.pathname === '/byob')
        await c.close()
      })
    }
    for (const [name, viewport] of [['desktop', DESKTOP], ['phone', PHONE], ['narrow phone', { width: 320, height: 640 }]]) {
      await run(`library hero, signed out, ${name}: "Add your own book or text" beside Read leads to /byob`, async () => {
        const c = await context(browser, origin, supabase, { signedIn: false, viewport }), page = await c.newPage()
        await page.goto('/library')
        await libraryReady(page)
        const own = page.locator('#hero-own')
        assert(await own.isVisible(), 'the button shows to a signed-out visitor')
        assert.equal(await own.innerText(), 'Add your own book or text')
        const [r, o] = await Promise.all([page.locator('#read-featured').boundingBox(), own.boundingBox()])
        assert(Math.abs(r.height - o.height) < 2, `Read and the new button share a height (${r.height} / ${o.height})`)
        assert(o.x + o.width <= viewport.width - 8, 'the button sits inside the screen')
        assert(await noSideScroll(page), 'no sideways scroll')
        await shot(page, `library-hero-own-${name.replace(' ', '-')}`)
        await own.click()
        await page.waitForURL(url => url.pathname === '/byob')
        await c.close()
      })
    }
    await run('library hero, signed in: no "Add your own book or text"', async () => {
      const c = await context(browser, origin, supabase, { signedIn: true, viewport: DESKTOP }), page = await c.newPage()
      await page.goto('/library')
      await libraryReady(page)
      assert.equal(await page.locator('#hero-own').isVisible(), false)
      await c.close()
    })
    await run('library band, signed in: Add a book opens the pop-up', async () => {
      const c = await context(browser, origin, supabase, { signedIn: true, viewport: DESKTOP }), page = await c.newPage()
      await page.goto('/library')
      await libraryReady(page)
      const add = page.locator('#shelves .own-books-band .own-books-add')
      await add.scrollIntoViewIfNeeded()
      await add.click()
      const step = await ownStep(page)
      assert(['choose', 'checking'].includes(step), `the pop-up opens (step ${step})`)
      assert.equal(new URL(page.url()).pathname, '/library')
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
