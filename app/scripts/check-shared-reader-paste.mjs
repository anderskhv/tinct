// A fully isolated Paste journey through the real Library and React reader.
// Run without building: node scripts/check-shared-reader-paste.mjs
// Browser requests are fulfilled from local files or the in-memory account fixture;
// no provider endpoint, network service, or paid API is contacted.
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { createServer as createTcpServer } from 'node:net'
import { createServer as createHttpServer } from 'node:http'
import fs from 'node:fs/promises'
import path from 'node:path'
import { chromium, webkit } from '@playwright/test'
import { createServer } from 'vite'
import { markInternal } from './lib/internalTraffic.cjs'

// Loopback-only origins keep the test visibly local even to external traffic
// guards. The fake auth project is a distinct loopback port, also intercepted.
const port = await new Promise((resolve, reject) => { const socket = createTcpServer(); socket.once('error', reject); socket.listen(0, '127.0.0.1', () => { const address = socket.address(); socket.close(() => resolve(address.port)) }) })
const origin = `http://127.0.0.1:${port}`
const dist = process.env.SHARED_PASTE_DIST ? path.resolve(process.env.SHARED_PASTE_DIST) : null
const defaultOn = process.env.PASTE_DEFAULT_ON === '1'
// A fixed fake Supabase project makes the real auth client read our local-only
// session. It never connects to an actual account or uses a repository key.
if (!dist) { process.env.VITE_SUPABASE_URL = origin; process.env.VITE_SUPABASE_ANON_KEY = 'synthetic-public-key' }
const supabaseBundle = dist && (await fs.readdir(path.join(dist, 'assets'))).find(name => /^supabase-.*\.js$/.test(name))
const supabaseText = supabaseBundle ? await fs.readFile(path.join(dist, 'assets', supabaseBundle), 'utf8') : ''
const supabaseHost = dist ? /https:\/\/([a-z0-9]+)\.supabase\.co/.exec(supabaseText)?.[1] || 'local-only' : '127'
let activeState = null
function uploaded(state, bytes, headers) {
  assert(bytes?.length > 100, `account receives a generated EPUB (${bytes?.length || 0} bytes)`)
  state.uploads.push(Buffer.from(bytes))
  if (state.failures-- > 0) return { status:503, body:{ error:'offline' } }
  const sha256 = createHash('sha256').update(bytes).digest('hex'), hex = sha256.slice(0, 24)
  state.book = { id:hex, sha256, type:'epub', size:bytes.length, name:decodeURIComponent(headers['x-book-name'] || 'Paste.epub'), title:decodeURIComponent(headers['x-book-title'] || 'Pasted text'), author:decodeURIComponent(headers['x-book-author'] || ''), createdAt:new Date(0).toISOString(), fileId:'original-generation', rev:0, metadataRev:0, bytes:Buffer.from(bytes) }
  return { status:201, body:{ book:{...state.book,bytes:undefined} } }
}
let closeServer
if (dist) {
  const mime = file => ({'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.woff2':'font/woff2','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp'}[path.extname(file)] || 'application/octet-stream')
  const server = createHttpServer(async (req, res) => {
    const url = new URL(req.url || '/', origin)
    if (url.pathname === '/api/user-books' && req.method === 'POST' && activeState) {
      const chunks = [];for await (const chunk of req) chunks.push(chunk)
      const result = uploaded(activeState,Buffer.concat(chunks),req.headers)
      res.writeHead(result.status,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify(result.body));return
    }
    const name = url.pathname === '/library' || url.pathname === '/' ? '/lab/library_2/index.html' : url.pathname === '/reader' ? '/app.html' : url.pathname === '/sign-in' ? '/lab/sign-in/index.html' : url.pathname === '/qa-seed' ? null : url.pathname
    if (name === null) { res.writeHead(200, {'Content-Type':'text/html','Cache-Control':'no-store'});res.end('<!doctype html><title>Paste built fixture</title>');return }
    const file = path.resolve(dist, '.' + name)
    if (!file.startsWith(dist + path.sep)) { res.writeHead(403);res.end();return }
    try { const body = await fs.readFile(file);res.writeHead(200, {'Content-Type':mime(file),'Cache-Control':'no-store'});res.end(body) }
    catch { res.writeHead(404);res.end() }
  })
  await new Promise(resolve => server.listen(port, '127.0.0.1', resolve))
  closeServer = () => new Promise(resolve => server.close(resolve))
} else {
  const vite = await createServer({ logLevel: 'silent', server: { host: '127.0.0.1', port, strictPort: true, hmr: false, watch: { ignored: ['**/public/data/**', '**/dist/**'] } } })
  await vite.listen();closeServer = () => vite.close()
}
const userId = 'paste-check-owner', source = '# Morning Notes\n\nA café wakes beneath the rain.\n\n- First idea\n- Second idea\n\n> Keep the original words.'
const json = (route, status, value) => route.fulfill({ status, contentType: 'application/json', headers: { 'Access-Control-Allow-Origin': origin }, body: JSON.stringify(value) })
const bytesEqual = (a, b) => Buffer.compare(a, b) === 0

async function fixture(context) {
  const state = { book: null, uploads: [], failures: 0, blocked: [], calls: [], conflict: false }
  activeState = state
  if (!dist) {
    state.captured = []
    await context.exposeBinding('__pasteCapture', (_source, bytes) => { state.captured.push(Buffer.from(bytes)) })
    await context.addInitScript(() => {
      const original = window.fetch
      window.fetch = async function (input, init) {
        const url = new URL(typeof input === 'string' ? input : input.url, location.href)
        if (url.pathname === '/api/user-books' && init?.method === 'POST' && init.body?.arrayBuffer) await window.__pasteCapture([...new Uint8Array(await init.body.arrayBuffer())])
        return original.call(this, input, init)
      }
    })
  }
  await context.route('**/*', async route => {
    const request = route.request(), url = new URL(request.url()), p = url.pathname, method = request.method()
    if ((dist ? url.hostname.endsWith('.supabase.co') : url.origin === origin) && (p.startsWith('/auth/v1/') || p.startsWith('/rest/v1/'))) {
      const headers = { 'Access-Control-Allow-Origin': origin, 'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS', 'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info, prefer' }
      if (method === 'OPTIONS') { if (process.env.PASTE_NETWORK_TRACE) console.log('PREFLIGHT',p,request.headers()['access-control-request-headers']); return route.fulfill({ status: 204, headers }) }
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
        if (dist) return route.continue() // Node receives WebKit's streamed Blob without touching browser fetch.
        const result = uploaded(state,request.postDataBuffer()?.length ? request.postDataBuffer() : state.captured[state.uploads.length],request.headers())
        return json(route,result.status,result.body)
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
  await page.goto(`${origin}/library${privateFlag === true ? '?sharedReader=1' : privateFlag === '0' ? '?sharedReader=0' : ''}`, { waitUntil: 'domcontentloaded' })
  await page.locator('#library-add:visible').waitFor({ timeout: 45000 })
  await page.locator('#library-add').click()
  await page.locator('.own-file-dialog[data-step="choose"]').waitFor()
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
    assert.equal(await page.getByRole('button', { name: 'Paste text' }).count(), defaultOn ? 1 : 0, 'unflagged Library follows build default')
    await page.getByRole('button', { name: 'Close' }).click()
    await library(page, '0')
    assert.equal(await page.getByRole('button', { name: 'Paste text' }).count(), 0, 'explicit sharedReader=0 keeps Paste hidden')
    await page.getByRole('button', { name: 'Close' }).click()
    await library(page, defaultOn ? false : true)
    await page.getByRole('button', { name: 'Paste text' }).click()
    await page.getByRole('textbox', { name: 'Text to add' }).fill(source)
    if (!phone) {
      // Archive Full Text clipboard: a whole book in one PRE used to become
      // one huge paragraph. Exercise the real paste handler and reader.
      await page.getByRole('textbox', { name: 'Text to add' }).fill('')
      await page.getByRole('textbox', { name: 'Text to add' }).evaluate((el, original) => {
        const body = original + '\n\n' + Array.from({length: 1600}, (_, i) => `Archive passage ${i}. ` + 'The reader follows the source words across this page. '.repeat(6)).join('\n\n')
        const clipboard = new DataTransfer()
        clipboard.setData('text/plain', original)
        clipboard.setData('text/html', '<h1>Morning Notes</h1><pre>' + body.replace(/&/g, '&amp;').replace(/</g, '&lt;') + '</pre>')
        el.dispatchEvent(new ClipboardEvent('paste', {bubbles:true,cancelable:true,clipboardData:clipboard}))
      }, source)
    }
    await page.locator('.own-paste-preview').waitFor({ state: 'visible' })
    if (process.env.PASTE_SCREENSHOT_DIR) {
      await fs.mkdir(process.env.PASTE_SCREENSHOT_DIR, { recursive:true })
      await page.screenshot({ path:path.join(process.env.PASTE_SCREENSHOT_DIR, `paste-${engine}-${phone ? 'phone-390x844' : 'desktop-1440x900'}.png`) })
    }
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
    await page.goto(`${origin}/library${defaultOn ? '' : '?sharedReader=1'}#my-shelf`, { waitUntil: 'domcontentloaded' })
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
    const appErrors = errors.filter(error => {
      // A private file without an uploaded cover deliberately falls back from
      // this hashed cover URL. WebKit also aborts background account reads when
      // this test immediately leaves a whole document for the next route.
      if (/^HTTP 404 http:\/\/127\.0\.0\.1:\d+\/covers\/v2\/userbook-[0-9a-f]{24}\.webp$/.test(error)) return false
      if (engine === 'webkit' && /^Fetch API cannot load (?:http:\/\/127\.0\.0\.1:\d+\/api\/user-books(?:\/places)?|https:\/\/[a-z0-9]+\.supabase\.co\/rest\/v1\/(?:profiles|user_data|rpc\/commit_user_data))\b[\s\S]*due to access control checks\./.test(error)) return false
      return true
    })
    assert.deepEqual(appErrors, [], 'browser has no uncaught app errors')
    assert.deepEqual(state.blocked, [], 'no third-party requests, including clipboard URLs')
    assert(state.calls.filter(call => call.method === 'POST' && call.path === '/api/user-books').every(call => call.internal), 'uploads are marked internal')
    console.log(`PASS ${engine} ${phone ? 'phone' : 'desktop'} Paste retry, private upload, React reader/reload, metadata conflict/edit/reopen, signed-out gate`)
  } finally { await context.close(); await browser.close() }
}

async function runCorpus(engine, type, entry, rich) {
  const sourceFile = entry.files.find(file => file.path.endsWith('.txt'))
  const text = await fs.readFile(sourceFile.path, 'utf8')
  const browser = await markInternal(await type.launch({ headless: true, ...(engine === 'chromium' ? { args: ['--mute-audio'] } : {}) }))
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, serviceWorkers: 'block', reducedMotion: 'reduce' })
  const state = await fixture(context), page = await context.newPage(), errors = []
  page.setDefaultTimeout(60000)
  page.on('pageerror', error => errors.push(error.stack || error.message))
  if (process.env.PASTE_NETWORK_TRACE) {
    page.on('console', message => { if (message.type() === 'warning' || message.text().startsWith('PASTE_TRACE')) console.log(message.text()) })
    await context.addInitScript(() => {
      new PerformanceObserver(list => { for (const entry of list.getEntries()) if (entry.duration > 100) console.log('PASTE_TRACE measure', entry.name, Math.round(entry.duration)) }).observe({ entryTypes: ['measure'] })
      for (const method of ['getClientRects', 'getBoundingClientRect']) {
        const original = Element.prototype[method]
        Element.prototype[method] = function(...args) { const start=performance.now(); const result=original.apply(this,args); const ms=performance.now()-start; if(ms>250) console.log('PASTE_TRACE geometry',method,this.tagName,this.className,Math.round(ms)); return result }
      }
      let last = performance.now()
      setInterval(() => { const now = performance.now(); if (now-last > 1500) console.log('PASTE_TRACE stall', Math.round(now-last)); last=now }, 250)
      const request = navigator.locks.request.bind(navigator.locks)
      navigator.locks.request = function(name, options, callback) {
        const start = performance.now()
        const wrapped = async lock => { console.log('PASTE_TRACE lock acquired', Math.round(performance.now()-start), Boolean(options?.steal)); try { return await callback(lock) } finally { console.log('PASTE_TRACE lock released', Math.round(performance.now()-start)) } }
        return request(name, options, wrapped)
      }
    })
  }
  const output = path.join(process.env.PASTE_CORPUS_OUTPUT || '/tmp/tinct-paste-corpus', entry.id, engine)
  await fs.mkdir(output, { recursive: true })
  const start = Date.now()
  console.log(`START ${engine} ${entry.id} ${text.length} characters ${rich ? 'rich' : 'plain'}`)
  try {
    await seed(page, true)
    await library(page, true)
    await page.getByRole('button', { name: 'Paste text', exact: true }).click()
    await page.locator('.own-paste-details > summary').click()
    await page.locator('.own-paste-title').fill(entry.title.slice(0, 190))
    const field = page.getByRole('textbox', { name: 'Text to add' })
    if (rich) await field.evaluate((el, text) => {
      const clipboard = new DataTransfer()
      clipboard.setData('text/plain', text)
      clipboard.setData('text/html', '<pre>' + text.replace(/&/g, '&amp;').replace(/</g, '&lt;') + '</pre>')
      el.dispatchEvent(new ClipboardEvent('paste', { bubbles: true, cancelable: true, clipboardData: clipboard }))
    }, text)
    else await field.evaluate((el, text) => { el.value = text; el.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertFromPaste', data: text })) }, text)
    await page.locator('.own-paste-save').click()
    if (await page.locator('.own-file-rights-box').isVisible().catch(() => false)) {
      await page.locator('.own-file-rights-box').check()
      await page.getByRole('button', { name: 'Continue', exact: true }).click()
    }
    await page.waitForURL(/\/reader\?userBook=/, { timeout: 120000 })
    await page.waitForFunction(() => document.querySelector('[data-testid="lab-root"]')?.dataset.readerReady === 'true', null, { timeout: 120000 })
    const kept = await page.evaluate(async () => {
      const db = await new Promise(resolve => { const r = indexedDB.open('tinct-addbook', 1); r.onsuccess = () => resolve(r.result) })
      const records = await new Promise(resolve => { const r = db.transaction('books').objectStore('books').getAll(); r.onsuccess = () => resolve(r.result) })
      db.close()
      return records.find(record => record.edition)?.edition
    })
    assert(kept, 'actual owned conversion is saved')
    const normalize = value => (value.match(/[\p{L}\p{N}]/gu) || []).join('').toLowerCase()
    const expected = normalize(text), actual = normalize(kept.chapters.flatMap(chapter => chapter.paragraphs).join(' '))
    const title = normalize(entry.title.slice(0, 190))
    // A source's opening title may be represented by the rendered chapter title,
    // rather than repeated as paragraph zero. Require exact equality including it.
    const openingInTitle = kept.chapters.length === 1 && normalize(kept.chapters[0].title) + actual === expected
    assert(actual === expected || actual === title + expected || openingInTitle, `complete source preserved in order: expected ${expected.length}, actual ${actual.length} letters/digits`)
    assert.equal(state.uploads.length, 1, 'one real EPUB upload to the isolated account fixture')
    await page.screenshot({ path: path.join(output, 'reader.png') })
    await page.reload({ waitUntil: 'domcontentloaded' })
    await page.waitForFunction(() => document.querySelector('[data-testid="lab-root"]')?.dataset.readerReady === 'true', null, { timeout: 120000 })
    assert.deepEqual(errors, [], 'no runtime exceptions')
    assert.deepEqual(state.blocked, [], 'no unexpected external requests')
    const result = { id: entry.id, engine, rich, source: entry.source, sourceCharacters: text.length, sourceWords: text.trim().split(/\s+/).length, importedParagraphs: kept.chapters.reduce((n,c) => n+c.paragraphs.length,0), completeSource: true, openingInTitle, reload: true, elapsedMs: Date.now()-start }
    await fs.writeFile(path.join(output, 'result.json'), JSON.stringify(result, null, 2))
    console.log('PASS ' + JSON.stringify(result))
  } catch(error) {
    await page.screenshot({ path: path.join(output, 'failure.png'), timeout: 10000 }).catch(() => {})
    await fs.writeFile(path.join(output, 'failure.json'), JSON.stringify({ error: String(error), url: page.url(), errors, body: (await page.locator('body').innerText({ timeout: 10000 }).catch(() => '')).slice(0,5000) }, null, 2))
    throw error
  } finally { await context.close(); await browser.close() }
}

const engines = new Set((process.env.PASTE_ENGINES || 'chromium,webkit').split(','))
try {
  const corpus = process.env.PASTE_CORPUS_MANIFEST ? JSON.parse(await fs.readFile(process.env.PASTE_CORPUS_MANIFEST, 'utf8')).filter(entry => entry.files?.some(file => file.path.endsWith('.txt'))) : null
  for (const [name, type] of [['chromium', chromium], ['webkit', webkit]].filter(([name]) => engines.has(name))) {
    if (corpus) for (const [i, entry] of corpus.entries()) {
      try { await runCorpus(name, type, entry, (i % 2 === 0) !== (name === 'webkit')) }
      catch(error) { console.error(`FAIL ${name} ${entry.id}: ${String(error).split('\n')[0]}`); process.exitCode = 1 }
    }
    else for (const phone of [false, true]) await run(name, type, phone)
  }
}
finally { await closeServer() }
