// A fully isolated Paste journey through the real Library and React reader.
// Run without building: node scripts/check-shared-reader-paste.mjs
// Browser requests are fulfilled from local files or the in-memory account fixture;
// no provider endpoint, network service, or paid API is contacted.
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { createServer as createTcpServer } from 'node:net'
import { chromium, webkit } from '@playwright/test'
import { createServer } from 'vite'
import { markInternal } from './lib/internalTraffic.cjs'

// Loopback-only origins keep the test visibly local even to external traffic
// guards. The fake auth project is a distinct loopback port, also intercepted.
const port = await new Promise((resolve, reject) => { const socket = createTcpServer(); socket.once('error', reject); socket.listen(0, '127.0.0.1', () => { const address = socket.address(); socket.close(() => resolve(address.port)) }) })
const origin = `http://127.0.0.1:${port}`
const fakeAuthOrigin = origin
// A fixed fake Supabase project makes the real auth client read our local-only
// session. It never connects to an actual account or uses a repository key.
process.env.VITE_SUPABASE_URL = fakeAuthOrigin
process.env.VITE_SUPABASE_ANON_KEY = 'synthetic-public-key'
const supabaseHost = '127'
const vite = await createServer({ logLevel: 'silent', server: { host: '127.0.0.1', port, strictPort: true, hmr: false, watch: { ignored: ['**/public/data/**', '**/dist/**'] } } })
await vite.listen()
const userId = 'paste-check-owner', source = '# Morning Notes\n\nA café wakes beneath the rain.\n\n- First idea\n- Second idea\n\n> Keep the original words.'
const json = (route, status, value) => route.fulfill({ status, contentType: 'application/json', headers: { 'Access-Control-Allow-Origin': origin }, body: JSON.stringify(value) })
const bytesEqual = (a, b) => Buffer.compare(a, b) === 0

async function fixture(context) {
  const state = { book: null, uploads: [], captured: [], failures: 0, blocked: [], calls: [], conflict: false }
  await context.exposeBinding('__pasteCapture', (_source, bytes) => { state.captured.push(Buffer.from(bytes)) })
  await context.addInitScript(() => {
    const original = window.fetch
    window.fetch = async function (input, init) {
      const url = new URL(typeof input === 'string' ? input : input.url, location.href)
      if (url.pathname === '/api/user-books' && init?.method === 'POST' && init.body?.arrayBuffer) {
        await window.__pasteCapture([...new Uint8Array(await init.body.arrayBuffer())])
      }
      return original.call(this, input, init)
    }
  })
  await context.route('**/*', async route => {
    const request = route.request(), url = new URL(request.url()), p = url.pathname, method = request.method()
    if (url.origin === fakeAuthOrigin && (p.startsWith('/auth/v1/') || p.startsWith('/rest/v1/'))) {
      const headers = { 'Access-Control-Allow-Origin': origin, 'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS', 'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info, prefer' }
      if (method === 'OPTIONS') return route.fulfill({ status: 204, headers })
      if (url.pathname === '/auth/v1/user') return route.fulfill({ status: 200, contentType: 'application/json', headers, body: JSON.stringify({ id: userId, email: 'paste@example.test', aud: 'authenticated' }) })
      if (url.pathname.startsWith('/rest/v1/')) return route.fulfill({ status: 200, contentType: 'application/json', headers, body: '[]' })
      state.blocked.push(url.href); return route.abort()
    }
    if (url.origin !== origin) { state.blocked.push(url.href); return route.abort() }
    if (p === '/qa-seed') return route.fulfill({ contentType: 'text/html', body: '<!doctype html><title>Paste check</title>' })
    if (p.startsWith('/api/')) {
      state.calls.push({ path: p, method, internal: request.headers()['x-tinct-check'] === '1' })
      if (p === '/api/public-books/import/access') return json(route, 200, { canAdd: true })
      if (p === '/api/public-books') return json(route, 200, { books: [] })
      if (p === '/api/user-books' && method === 'POST') {
        const bytes = request.postDataBuffer()?.length ? request.postDataBuffer() : state.captured[state.uploads.length]
        assert(bytes?.length > 100, `account receives a generated EPUB (engine=${context.browser()?.browserType().name()}, captured=${state.captured.length})`)
        state.uploads.push(Buffer.from(bytes))
        if (state.failures-- > 0) return json(route, 503, { error: 'offline' })
        const sha256 = createHash('sha256').update(bytes).digest('hex')
        const hex = sha256.slice(0, 24)
        state.book = { id: hex, sha256, type: 'epub', size: bytes.length, name: decodeURIComponent(request.headers()['x-book-name'] || 'Paste.epub'), title: decodeURIComponent(request.headers()['x-book-title'] || 'Pasted text'), author: decodeURIComponent(request.headers()['x-book-author'] || ''), createdAt: new Date(0).toISOString(), fileId: 'original-generation', rev: 0, metadataRev: 0, bytes: Buffer.from(bytes) }
        return json(route, 201, { book: { ...state.book, bytes: undefined } })
      }
      if (p === '/api/user-books' && method === 'GET') return json(route, 200, { books: state.book ? [{ ...state.book, bytes: undefined }] : [] })
      if (p === '/api/user-books/places') return json(route, 200, { places: {} })
      if (/^\/api\/user-books\/(places|covers)\//.test(p)) return json(route, 200, { place: null, cover: null })
      if (/^\/api\/user-books\/(marks|cards)\//.test(p)) return json(route, 200, { marks: [], cards: [], rev: 0 })
      if (p.startsWith('/api/user-books/primers/')) return json(route, 200, { primer: null })
      if (state.book && p === `/api/user-books/${state.book.id}` && method === 'GET') return route.fulfill({ status: 200, contentType: 'application/epub+zip', body: state.book.bytes })
      if (state.book && p === `/api/user-books/metadata/${state.book.id}`) {
        if (method === 'GET') return json(route, 200, { title: state.book.title, author: state.book.author, rev: state.book.rev, fileId: state.book.fileId })
        if (method === 'PATCH') {
          const body = request.postDataJSON()
          assert.equal(body.expectedFileId, state.book.fileId, 'edit stays bound to the uploaded generation')
          if (state.conflict || body.rev !== state.book.rev) { state.conflict = false; return json(route, 409, { error: 'conflict', title: state.book.title, author: state.book.author, rev: state.book.rev, fileId: state.book.fileId }) }
          state.book.title = body.title; state.book.author = body.author; state.book.rev++; state.book.metadataRev = state.book.rev
          return json(route, 200, { title: state.book.title, author: state.book.author, rev: state.book.rev, fileId: state.book.fileId })
        }
      }
      return json(route, 404, { error: 'not_found' })
    }
    if (/\.(mp4|webm)$/.test(p)) return route.abort()
    const pathname = p === '/library' || p === '/' ? '/lab/library_2/index.html' : p === '/reader' ? '/app.html' : p
    // Current source and canonical Library/reader routes come from local Vite.
    return route.continue()
  })
  return state
}

async function seed(page, signedIn) {
  await page.goto(`${origin}/qa-seed`)
  if (!signedIn) return
  await page.evaluate(({ id, ref }) => {
    const session = { access_token: 'qa-only', refresh_token: 'qa-refresh', expires_in: 3600, expires_at: Math.floor(Date.now() / 1000) + 36000, token_type: 'bearer', user: { id, email: 'paste@example.test' } }
    localStorage.setItem(`sb-${ref}-auth-token`, JSON.stringify(session))
    document.cookie = 'tinct_auth=1; path=/; SameSite=Lax'
  }, { id: userId, ref: supabaseHost })
}

async function library(page, privateFlag = true) {
  await page.goto(`${origin}/library${privateFlag ? '?sharedReader=1' : ''}`, { waitUntil: 'domcontentloaded' })
  await page.locator('#library-add:visible').waitFor({ timeout: 45000 })
  await page.locator('#library-add').click()
  await page.locator('.own-file-dialog').waitFor()
}

async function run(engine, type, phone) {
  const browser = await markInternal(await type.launch({ headless: true, ...(engine === 'chromium' ? { args: ['--mute-audio'] } : {}) }))
  const context = await browser.newContext({ viewport: phone ? { width: 390, height: 844 } : { width: 1440, height: 900 }, hasTouch: phone, isMobile: phone && engine === 'webkit', serviceWorkers: 'block', reducedMotion: 'reduce' })
  const state = await fixture(context), page = await context.newPage(), errors = []
  page.setDefaultTimeout(30000)
  page.on('pageerror', error => errors.push(error.stack || error.message))
  page.on('response', response => { if (response.status() >= 400 && !/\/api\//.test(response.url())) errors.push(`HTTP ${response.status()} ${response.url()}`) })
  try {
    await seed(page, true)
    await library(page, false)
    assert.equal(await page.getByRole('button', { name: 'Paste text' }).count(), 0, 'public Library keeps Paste hidden')
    await page.getByRole('button', { name: 'Close' }).click()
    await library(page)
    await page.getByRole('button', { name: 'Paste text' }).click()
    await page.getByRole('textbox', { name: 'Text to add' }).fill(source)
    state.failures = 1
    await page.getByRole('button', { name: 'Add to my books' }).click()
    if (await page.locator('.own-file-rights-box').isVisible().catch(() => false)) {
      await page.locator('.own-file-rights-box').check()
      await page.getByRole('button', { name: 'Continue' }).click()
    }
    await page.locator('.own-paste-error').getByText(/offline|try again/i).waitFor({ timeout: 45000 })
    assert.equal(state.book, null, 'failed account upload has no saved book')
    assert.equal(await page.getByRole('textbox', { name: 'Text to add' }).inputValue(), source, 'retry retains exact source')
    await page.getByRole('button', { name: 'Add to my books' }).click()
    await page.waitForURL(/\/reader\?userBook=[0-9a-f]{24}&sharedReader=1/, { timeout: 60000 })
    assert.equal(state.uploads.length, 2)
    assert(bytesEqual(state.uploads[0], state.uploads[1]), 'network retry uploads identical EPUB bytes')
    assert.equal(new URL(page.url()).searchParams.get('userBook'), state.book.id)
    await page.waitForFunction(() => document.querySelector('[data-testid="lab-root"]')?.dataset.readerReady === 'true', null, { timeout: 60000 })
    await page.getByText('A café wakes beneath the rain.', { exact: false }).first().waitFor({ timeout: 30000 })
    assert.equal(await page.locator('.lab').getAttribute('data-shared-reader'), 'true')
    await page.reload({ waitUntil: 'domcontentloaded' })
    await page.waitForFunction(() => document.querySelector('[data-testid="lab-root"]')?.dataset.readerReady === 'true', null, { timeout: 60000 })
    await page.getByText('A café wakes beneath the rain.', { exact: false }).first().waitFor()
    await page.goto(`${origin}/library?sharedReader=1#my-shelf`, { waitUntil: 'domcontentloaded' })
    await page.getByText('Morning Notes', { exact: true }).first().waitFor({ timeout: 20000 }).catch(async error => {
      const local = await page.evaluate(async () => { const db = await new Promise((resolve, reject) => { const r = indexedDB.open('tinct-addbook'); r.onsuccess = () => resolve(r.result); r.onerror = () => reject(r.error) }); const records = await new Promise((resolve, reject) => { const r = db.transaction('books').objectStore('books').getAll(); r.onsuccess = () => resolve(r.result.map(({ key, title, owner, cloudId }) => ({ key, title, owner, cloudId }))); r.onerror = () => reject(r.error) }); db.close(); return { records, ownBooks: await window.__tinctLibraryAdd?.ownBooks(), signed: document.documentElement.className, auth: Object.keys(localStorage).filter(k => /^sb-/.test(k)) } }).catch(e => String(e))
      console.log('SHELF_DIAGNOSTIC', JSON.stringify({ title: await page.title(), url: page.url(), books: state.book && { title: state.book.title, id: state.book.id }, collection: (await page.locator('#collection').innerText().catch(() => '')).slice(0, 1800), local, calls: state.calls.slice(-30), errors }))
      throw error
    })
    const card = page.locator('.own-book').filter({ hasText: 'Morning Notes' }).first()
    await card.locator('.shelf-more').click()
    await page.getByRole('menuitem', { name: 'Edit title and author' }).click()
    await page.locator('[data-testid="own-metadata-dialog"]').waitFor()
    await page.waitForFunction(() => document.querySelector('[data-testid="own-metadata-dialog"] .own-paste-title')?.value === 'Morning Notes', null, { timeout: 15000 })
    assert.equal(await page.getByRole('textbox', { name: 'Title' }).inputValue(), 'Morning Notes')
    await page.getByRole('textbox', { name: 'Title' }).fill('New Morning Notes')
    await page.getByRole('textbox', { name: 'Author (optional)' }).fill('Ada Reader')
    state.conflict = true
    await page.getByRole('button', { name: 'Save details' }).click()
    await page.getByText(/changed on another device/i).waitFor()
    assert.equal(state.book.title, 'Morning Notes', '409 does not change account metadata')
    await page.getByRole('button', { name: 'Save details' }).click()
    await page.locator('[data-testid="own-metadata-dialog"]').waitFor({ state: 'detached' })
    assert.equal(state.book.title, 'New Morning Notes')
    assert.equal(state.book.author, 'Ada Reader')
    assert.equal(state.uploads.length, 2, 'metadata edit keeps the original EPUB object')
    assert(state.calls.some(call => call.path === `/api/user-books/metadata/${state.book.id}` && call.method === 'PATCH'), 'details saved through private metadata route')
    await page.goto(`${origin}/reader?userBook=${state.book.id}&sharedReader=1`, { waitUntil: 'domcontentloaded' })
    await page.waitForFunction(() => document.querySelector('[data-testid="lab-root"]')?.dataset.readerReady === 'true', null, { timeout: 60000 })
    await page.getByText('New Morning Notes', { exact: true }).first().waitFor({ timeout: 15000 })
    await page.evaluate(() => { for (const key of Object.keys(localStorage)) if (/^sb-.*-auth-token$/.test(key)) localStorage.removeItem(key); document.cookie = 'tinct_auth=; Max-Age=0; path=/' })
    const priorUploads = state.uploads.length
    await page.goto(`${origin}/library?sharedReader=1`, { waitUntil: 'domcontentloaded' })
    await page.locator('#library-add:visible').click()
    await page.waitForURL(/\/sign-in\?/, { timeout: 30000 })
    assert.equal(state.uploads.length, priorUploads, 'signed-out Add cannot create a private account object')
    assert.equal(await page.locator('.own-paste-save').count(), 0, 'signed-out visitor has no Paste saving control')
    // WebKit sometimes reports an in-flight background profile/places fetch as
    // an access-control error when the test navigates between full documents.
    // Those requests are unrelated to Paste and are fulfilled locally here.
    const appErrors = errors.filter(error => !/^Fetch API cannot load http:\/\/127\.0\.0\.1:\d+\/(?:rest\/v1\/|api\/user-books\/places)\b.*due to access control checks\./.test(error))
    assert.deepEqual(appErrors, [], 'browser has no uncaught app errors')
    assert.deepEqual(state.blocked, [], 'no third-party requests, including clipboard URLs')
    assert(state.calls.filter(call => call.method === 'POST' && call.path === '/api/user-books').every(call => call.internal), 'uploads are marked internal')
    console.log(`PASS ${engine} ${phone ? 'phone' : 'desktop'} Paste retry, private upload, React reader/reload, metadata conflict/edit/reopen, signed-out gate`)
  } finally { await context.close(); await browser.close() }
}

const engines = new Set((process.env.PASTE_ENGINES || 'chromium,webkit').split(','))
try { for (const [name, type] of [['chromium', chromium], ['webkit', webkit]].filter(([name]) => engines.has(name))) for (const phone of [false, true]) await run(name, type, phone) }
finally { await vite.close() }
