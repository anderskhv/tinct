// Built-app, local-only same-content account isolation for private EPUB marks.
// cd app && SHARED_ISOLATION_DIST=artifacts/speed-build7 node scripts/check-shared-reader-own-isolation.mjs
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { createServer } from 'node:http'
import fs from 'node:fs/promises'
import path from 'node:path'
import { chromium, webkit } from '@playwright/test'
import { markInternal } from './lib/internalTraffic.cjs'
import { zip } from '../../addbooks/web/test/make-epub.mjs'

const dist = path.resolve(process.env.SHARED_ISOLATION_DIST || 'dist')
const prose = Array.from({ length: 12 }, (_, n) => `<p>Paragraph ${n + 1}. The private reader preserved each familiar page and every careful annotation.</p>`).join('')
const bytes = zip([
  ['mimetype', 'application/epub+zip'],
  ['META-INF/container.xml', '<?xml version="1.0"?><container xmlns="urn:oasis:names:tc:opendocument:xmlns:container" version="1.0"><rootfiles><rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/></rootfiles></container>'],
  ['OEBPS/content.opf', '<?xml version="1.0"?><package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="id"><metadata xmlns:dc="http://purl.org/dc/elements/1.1/"><dc:identifier id="id">isolated-own-epub</dc:identifier><dc:title>Isolated Reader Fixture</dc:title><dc:creator>Local Author</dc:creator><dc:language>en</dc:language></metadata><manifest><item id="c1" href="c1.xhtml" media-type="application/xhtml+xml"/></manifest><spine><itemref idref="c1"/></spine></package>'],
  ['OEBPS/c1.xhtml', `<?xml version="1.0"?><html xmlns="http://www.w3.org/1999/xhtml"><head><title>First Chapter</title></head><body><h1>First Chapter</h1>${prose}</body></html>`],
])
const sha256 = createHash('sha256').update(bytes).digest('hex'), hex = sha256.slice(0, 24)
const owners = { a: 'private-owner-a', b: 'private-owner-b' }
const fileIds = { a: 'a'.repeat(32), b: 'b'.repeat(32), next: 'c'.repeat(32) }
const supabaseBundle = (await fs.readdir(path.join(dist, 'assets'))).find(name => /^supabase-.*\.js$/.test(name))
const supabaseText = supabaseBundle ? await fs.readFile(path.join(dist, 'assets', supabaseBundle), 'utf8') : ''
const authKey = `sb-${/https:\/\/([a-z0-9]+)\.supabase\.co/.exec(supabaseText)?.[1] || 'local-only'}-auth-token`
const store = {
  a: { present: true, fileId: fileIds.a, marks: [], rev: 0, puts: [] },
  b: { present: true, fileId: fileIds.b, marks: [], rev: 0, puts: [] },
}
const denied = [], requests = [], originRef = { value: '' }
const mime = file => ({ '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.woff2': 'font/woff2', '.svg': 'image/svg+xml', '.png': 'image/png' }[path.extname(file)] || 'application/octet-stream')
function json(res, code, data) { res.writeHead(code, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }); res.end(JSON.stringify(data)) }
const server = createServer(async (req, res) => {
  const target = new URL(req.url || '/', originRef.value || 'http://127.0.0.1')
  if (target.origin !== originRef.value) { denied.push(target.href); res.writeHead(403); res.end(); return }
  const p = target.pathname, method = req.method || 'GET'
  if (p === '/qa-seed') { res.writeHead(200, { 'Content-Type': 'text/html', 'Cache-Control': 'no-store' }); res.end('<!doctype html><title>Private account fixture</title>'); return }
  if (p.startsWith('/api/')) {
    const bearer = /^Bearer (isolation-[ab])$/i.exec(req.headers.authorization || '')?.[1]
    const owner = bearer?.at(-1)?.toLowerCase(), account = owner && store[owner]
    requests.push({ owner, method, path: p, fileId: account?.fileId })
    if (p === '/api/public-books') { json(res, 200, { books: [] }); return }
    if (p === '/api/narration/voices') { json(res, 200, { enabled: false, voices: [] }); return }
    if (!account) { json(res, 401, { error: 'unauthorized' }); return }
    const book = { id: account.fileId, type: 'epub', sha256, name: 'Private fixture.epub', title: 'Isolated Reader Fixture', author: 'Local Author', size: bytes.length, createdAt: '2026-10-23T00:00:00.000Z' }
    if (p === '/api/user-books' && method === 'GET') { json(res, 200, { books: account.present ? [book] : [] }); return }
    if (p === `/api/user-books/${account.fileId}` && method === 'GET' && account.present) { res.writeHead(200, { 'Content-Type': 'application/epub+zip', 'Cache-Control': 'no-store' }); res.end(bytes); return }
    if (p === `/api/user-books/${account.fileId}` && method === 'DELETE' && account.present) { account.present = false; account.marks = []; account.rev = 0; json(res, 200, { ok: true }); return }
    if (p === `/api/user-books/marks/${hex}` && account.present) {
      if (method === 'GET') { json(res, 200, { marks: account.marks, rev: account.rev, fileId: account.fileId }); return }
      if (method === 'PUT') {
        let raw = ''; for await (const chunk of req) raw += chunk
        const payload = JSON.parse(raw), entry = { fileId: account.fileId, ...payload }
        account.puts.push(entry)
        if (payload.expectedFileId !== account.fileId || payload.rev !== account.rev) { json(res, 409, { error: 'conflict', rev: account.rev, fileId: account.fileId }); return }
        account.marks = payload.marks; account.rev += 1; json(res, 200, { rev: account.rev, fileId: account.fileId }); return
      }
    }
    if (p === `/api/user-books/cards/${hex}`) { json(res, 200, { cards: [], rev: 0, fileId: account.fileId }); return }
    if (p === '/api/user-books/places') { json(res, 200, { places: {} }); return }
    if (new RegExp(`^/api/user-books/(places|covers|primers)/${hex}$`).test(p)) { json(res, 200, { place: null, cover: null, primer: null }); return }
    json(res, 404, { error: 'not_found' }); return
  }
  const local = path.resolve(dist, '.' + (p === '/reader' ? '/app.html' : p === '/library' ? '/lab/library_2/index.html' : p))
  if (!local.startsWith(dist + path.sep)) { res.writeHead(403); res.end(); return }
  try { const body = await fs.readFile(local); res.writeHead(200, { 'Content-Type': mime(local), 'Cache-Control': /\.html$/.test(local) ? 'no-store' : 'public, max-age=3600' }); res.end(body) }
  catch { res.writeHead(404); res.end() }
})
server.on('connect', (req, socket) => { denied.push(`CONNECT ${req.url}`); socket.end('HTTP/1.1 403 Forbidden\r\n\r\n') })
server.on('upgrade', (req, socket) => { denied.push(`UPGRADE ${req.url}`); socket.end('HTTP/1.1 403 Forbidden\r\n\r\n') })
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
originRef.value = `http://127.0.0.1:${server.address().port}`

async function seed(page, owner, fileId) {
  await page.goto(`${originRef.value}/qa-seed`)
  await page.evaluate(async ({ authKey, owner, token, hex, fileId, bytes }) => {
    localStorage.setItem(authKey, JSON.stringify({ access_token: token, refresh_token: token, expires_in: 3600, expires_at: Math.floor(Date.now()/1000) + 36000, token_type: 'bearer', user: { id: owner, email: `${owner}@example.test`, aud: 'authenticated' } }))
    // A real saved source word, rather than the automatic first word, exercises layout restoration.
    if (token === 'isolation-a' && !localStorage.getItem(`tinct-addbook:place:${hex}`))
      localStorage.setItem(`tinct-addbook:place:${hex}`, JSON.stringify({ chapterNumber: 1, paragraphIndex: 2, wordIndex: 3, updatedAt: Date.now() - 1000 }))
    document.cookie = 'tinct_auth=1; path=/; SameSite=Lax'
    await new Promise((resolve, reject) => {
      const open = indexedDB.open('tinct-addbook', 1)
      open.onupgradeneeded = () => { if (!open.result.objectStoreNames.contains('books')) open.result.createObjectStore('books', { keyPath: 'key' }) }
      open.onerror = () => reject(open.error)
      open.onsuccess = () => {
        const db = open.result, tx = db.transaction('books', 'readwrite')
        tx.objectStore('books').put({ key: `epub:${hex}`, kind: 'epub', owner, cloudId: fileId, name: 'Private fixture.epub', title: 'Isolated Reader Fixture', author: 'Local Author', bytes: new Uint8Array(bytes).buffer })
        tx.oncomplete = () => { db.close(); resolve() }; tx.onerror = () => reject(tx.error)
      }
    })
  }, { authKey, owner: owners[owner], token: `isolation-${owner}`, hex, fileId, bytes: [...bytes] })
}
async function open(page) {
  await page.goto(`${originRef.value}/reader?userBook=${hex}&sharedReader=1`, { waitUntil: 'domcontentloaded' })
  await page.waitForFunction(() => document.querySelector('[data-testid="lab-root"]')?.dataset.readerReady === 'true', null, { timeout: 45000 })
  await page.locator('.lab-page-wrap [data-testid="lab-word"]:visible').nth(8).waitFor()
}
async function privateEpubLayouts(page, engine) {
  const root = page.getByTestId('lab-root')
  const source = await root.evaluate(node => ({ chapter: node.dataset.chapter, place: node.dataset.place }))
  assert(source.chapter && source.place && source.place !== '0:0', `${engine}: private EPUB opens at a nonzero source word`)
  const readable = async layout => {
    await page.locator('.lab-page-wrap [data-testid="lab-word"]:visible').nth(8).waitFor()
    assert.deepEqual(await root.evaluate(node => ({ chapter: node.dataset.chapter, place: node.dataset.place })), source,
      `${engine}: ${layout} keeps the same private EPUB source position`)
  }
  const aa = page.getByTestId('lab-header-aa')
  await aa.waitFor({ state: 'visible' })
  await aa.click()
  const sheet = page.getByTestId('lab-v2-sheet')
  assert.equal(await sheet.getAttribute('data-layer'), 'reading', `${engine}: Aa opens private EPUB appearance`)
  await page.getByTestId('lab-v2-layout-two-page').waitFor()
  assert.equal(await page.getByTestId('lab-v2-layout-compare').count(), 0, `${engine}: a single-edition private EPUB has no Compare layout`)
  await page.getByTestId('lab-v2-layout-two-page').click()
  await page.waitForFunction(() => document.querySelector('[data-testid="lab-root"]')?.dataset.continuousReader !== 'true')
  await readable('Two-page')
  await aa.click()
  await page.getByTestId('lab-v2-layout-margin').click()
  await page.getByTestId('continuous-reader').waitFor()
  await readable('Margin')
}
async function observed(page) {
  return page.evaluate(hex => ({
    highlights: document.querySelectorAll('.lab-page-wrap [data-testid="lab-word"][class*="is-hl-"]').length,
    ownKeys: Object.keys(localStorage).filter(key => key.includes(hex) && /^tinct-addbook:text-marks-(?:canonical|local|sync|previous|adopted):/.test(key)).sort(),
    global: JSON.parse(localStorage.getItem('tinct-lab-highlights') || '[]').filter(item => item.bookId === `userbook-${hex}`).length,
  }), hex)
}
async function highlight(page) {
  const words = page.locator('.lab-page-wrap [data-testid="lab-word"]:visible')
  const first = await words.nth(2).boundingBox(), last = await words.nth(8).boundingBox()
  assert(first && last)
  await page.mouse.move(first.x + first.width/2, first.y + first.height/2)
  await page.mouse.down(); await page.mouse.move(last.x + last.width/2, last.y + last.height/2, { steps: 8 }); await page.mouse.up()
  await page.getByTestId('lab-desk-bar').waitFor({ timeout: 10000 })
  await page.getByTestId('lab-dbar-highlight').click()
}
async function until(assertion, message, timeout = 6000) {
  const end = Date.now() + timeout
  while (Date.now() < end) {
    if (assertion()) return
    await new Promise(resolve => setTimeout(resolve, 100))
  }
  assert(assertion(), message)
}
async function run(engine, browserType, complete) {
  const browser = await markInternal(await browserType.launch({ headless: true, proxy: { server: originRef.value }, ...(engine === 'chromium' ? { args: ['--mute-audio'] } : {}) }))
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, serviceWorkers: 'block', reducedMotion: 'reduce' })
  const page = await context.newPage(), errors = [], authIntercepts = []
  page.on('pageerror', error => errors.push(error.message))
  await context.route(/^https:\/\/[a-z0-9]+\.supabase\.co\//, async route => {
    const url = new URL(route.request().url()), method = route.request().method()
    authIntercepts.push({ path:url.pathname, method })
    const headers = { 'Access-Control-Allow-Origin': originRef.value, 'Access-Control-Allow-Credentials': 'true', 'Access-Control-Allow-Methods': 'GET,POST,PATCH,OPTIONS', 'Access-Control-Allow-Headers': 'authorization,apikey,content-type,x-client-info,prefer', 'Content-Type':'application/json' }
    if (method === 'OPTIONS') return route.fulfill({ status:204, headers })
    if (url.pathname === '/auth/v1/user') {
      const owner = route.request().headers().authorization?.endsWith('isolation-b') ? owners.b : owners.a
      return route.fulfill({ status:200, headers, body:JSON.stringify({ id:owner, email:`${owner}@example.test`, aud:'authenticated' }) })
    }
    if (url.pathname.startsWith('/rest/v1/')) return route.fulfill({ status:200, headers, body:'[]' })
    return route.fulfill({ status:404, headers, body:'{}' })
  })
  try {
    await seed(page, 'a', fileIds.a); await open(page)
    await privateEpubLayouts(page, engine)
    const fetchSurface = await page.evaluate(() => Function.prototype.toString.call(window.fetch).slice(0, 180))
    assert(!fetchSurface.includes('__pasteCapture') && !fetchSurface.includes('supabase.co'), 'fixture did not replace browser fetch')
    assert.equal((await observed(page)).highlights, 0, 'A begins without a mark')
    await highlight(page)
    await page.waitForFunction(() => document.querySelectorAll('.lab-page-wrap [data-testid="lab-word"][class*="is-hl-"]').length > 0)
    await page.waitForFunction(() => Object.keys(localStorage).some(key => key.includes('text-marks-canonical:private-owner-a:')))
    await until(() => store.a.marks.some(item => item.v === 'text-v1' && item.anchor?.kind === 'range'), 'A remote mark sync')
    assert(store.a.marks.some(item => item.v === 'text-v1' && item.anchor?.kind === 'range'), `A mark persisted through account API: ${JSON.stringify({ marks: store.a.marks, puts: store.a.puts, canon: await page.evaluate(hex => Object.fromEntries(Object.keys(localStorage).filter(key => key.startsWith('tinct-addbook:text-marks-canonical:') && key.includes(hex)).map(key => [key, localStorage.getItem(key)])), hex), requests: requests.slice(-15), errors })}`)
    assert(store.a.puts.every(item => item.expectedFileId === fileIds.a))
    console.log(`RUN ${engine} A saved mark: ${store.a.marks.length} record, rev ${store.a.rev}`)

    await seed(page, 'b', fileIds.b); await open(page)
    const b = await observed(page)
    assert.equal(b.highlights, 0, 'B cannot see A mark on same EPUB bytes')
    assert.equal(b.global, 0, 'active global projection excludes A mark')
    assert.equal(store.b.puts.length, 0, 'A mark never uploaded to B')
    assert(b.ownKeys.some(key => key.includes('private-owner-a:')), 'A canonical backup survives owner switch')
    console.log(`RUN ${engine} B isolated: no A mark displayed or uploaded`)
    if (!complete) return

    await highlight(page)
    await page.waitForFunction(() => Object.keys(localStorage).some(key => key.includes('text-marks-canonical:private-owner-b:')))
    await until(() => store.b.marks.length === 1, `B saves a separate mark; ${JSON.stringify({ requests: requests.slice(-12), puts: store.b.puts })}`)
    await seed(page, 'a', fileIds.a); await open(page)
    await page.waitForFunction(() => document.querySelectorAll('.lab-page-wrap [data-testid="lab-word"][class*="is-hl-"]').length > 0)
    assert.equal((await observed(page)).highlights > 0, true, 'A mark is restored after account switch')

    await page.goto(`${originRef.value}/library?sharedReader=1#my-shelf`, { waitUntil: 'domcontentloaded' })
    const card = page.locator('.own-book').filter({ hasText: 'Isolated Reader Fixture' }).first()
    await card.waitFor({ timeout: 30000 })
    await card.locator('.shelf-more').click()
    await page.getByRole('menuitem', { name: /Delete/ }).click()
    await page.getByTestId('own-delete-dialog').waitFor()
    const beforeDelete = await page.evaluate(hex => ({ owner:window.TinctAI?.session()?.userId, keys:Object.keys(localStorage).filter(key => key.includes(hex) && /text-(marks|cards)/.test(key)) }),hex)
    await page.locator('.own-delete-confirm').click()
    await until(() => !store.a.present, `A file deleted from account; ${JSON.stringify({ requests:requests.slice(-15), errors })}`)
    await page.waitForFunction(() => !document.querySelector('.own-delete-dialog'))
    const deleted = await observed(page)
    assert.equal(deleted.global, 0, 'deleted A active mark removed from projection')
    assert(deleted.ownKeys.some(key => key.includes('private-owner-b:')), `deleting A keeps B backup: ${JSON.stringify({ beforeDelete, deleted, requests:requests.slice(-12) })}`)
    assert(!deleted.ownKeys.some(key => key.includes('private-owner-a:')), 'deleting A removes A backup')

    store.a.present = true; store.a.fileId = fileIds.next; store.a.rev = 0; store.a.marks = []
    await seed(page, 'a', fileIds.next); await open(page)
    await page.waitForFunction(fileId => Object.keys(localStorage).some(key => key.startsWith('tinct-addbook:text-marks-canonical:private-owner-a:') && key.endsWith(':' + fileId)), fileIds.next, { timeout: 10000 })
    await until(() => requests.some(call => call.path === `/api/user-books/marks/${hex}` && call.owner === 'a' && call.fileId === fileIds.next), 'new generation fetched its own remote marks')
    await page.waitForTimeout(1200)
    const reuploaded = await observed(page)
    assert.equal(reuploaded.highlights, 0, 'new file generation does not resurrect A mark')
    assert.equal(reuploaded.global, 0, 'new file generation has no old global marks')
    assert(!store.a.puts.some(item => item.expectedFileId === fileIds.next && item.marks.some(mark => mark.id === store.a.puts[0]?.marks[0]?.id)), 'old mark never uploaded to reupload')
    await seed(page, 'b', fileIds.b); await open(page)
    await page.waitForFunction(() => document.querySelectorAll('.lab-page-wrap [data-testid="lab-word"][class*="is-hl-"]').length > 0)
    assert.equal(store.b.marks.length, 1, 'B remote mark survives A deletion and reupload')
    console.log(`RUN ${engine} A delete/reupload: old marks absent; B backup preserved`)
    assert.deepEqual(errors, [], 'no uncaught reader exceptions')
  } finally { await context.close(); await browser.close() }
}
try {
  await run('chromium', chromium, true)
  // Begin from pristine server data for independent WebKit's A→B transition.
  store.a.present = true; store.a.fileId = fileIds.a; store.a.marks = []; store.a.rev = 0; store.a.puts = []
  store.b.marks = []; store.b.rev = 0; store.b.puts = []
  await run('webkit', webkit, false)
  assert.deepEqual(denied, [], 'no browser request reached an external host')
  console.log(`PASS private account isolation on Chromium and WebKit; ${requests.length} same-origin API requests; no external provider traffic`)
} finally { await new Promise(resolve => server.close(resolve)) }
