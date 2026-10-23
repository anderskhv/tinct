// Built-app rollback acceptance: current React private reader → prior static reader → current React reader.
// cd app && node scripts/check-shared-reader-own-rollback.mjs
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { createServer } from 'node:http'
import fs from 'node:fs/promises'
import path from 'node:path'
import { chromium, webkit } from '@playwright/test'
import { markInternal } from './lib/internalTraffic.cjs'
import { zip } from '../../addbooks/web/test/make-epub.mjs'

const dist = path.resolve(process.env.SHARED_UPGRADE_DIST || 'dist')
const oldDist = path.resolve(process.env.SHARED_ROLLBACK_DIST || '../../tinct-rollback-floor/app/dist')
let activeDist = dist
const prose = Array.from({ length: 12 }, (_, n) => `<p>Paragraph ${n + 1}. The private reader preserved each familiar page and every careful annotation.</p>`).join('')
const bytes = zip([
  ['mimetype', 'application/epub+zip'],
  ['META-INF/container.xml', '<?xml version="1.0"?><container xmlns="urn:oasis:names:tc:opendocument:xmlns:container" version="1.0"><rootfiles><rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/></rootfiles></container>'],
  ['OEBPS/content.opf', '<?xml version="1.0"?><package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="id"><metadata xmlns:dc="http://purl.org/dc/elements/1.1/"><dc:identifier id="id">isolated-own-epub</dc:identifier><dc:title>Isolated Reader Fixture</dc:title><dc:creator>Local Author</dc:creator><dc:language>en</dc:language></metadata><manifest><item id="c1" href="c1.xhtml" media-type="application/xhtml+xml"/></manifest><spine><itemref idref="c1"/></spine></package>'],
  ['OEBPS/c1.xhtml', `<?xml version="1.0"?><html xmlns="http://www.w3.org/1999/xhtml"><head><title>First Chapter</title></head><body><h1>First Chapter</h1>${prose}</body></html>`],
])
const sha256 = createHash('sha256').update(bytes).digest('hex'), hex = sha256.slice(0, 24)
const pdfBytes = await fs.readFile('../addbooks/web/test/pdf-fixtures/prose_book.pdf')
const pdfSha256 = createHash('sha256').update(pdfBytes).digest('hex'), pdfHex = pdfSha256.slice(0, 24), pdfFileId = 'd'.repeat(32)
const owners = { a: 'private-owner-a', b: 'private-owner-b' }
const fileIds = { a: 'a'.repeat(32), b: 'b'.repeat(32), next: 'c'.repeat(32) }
const supabaseBundle = (await fs.readdir(path.join(dist, 'assets'))).find(name => /^supabase-.*\.js$/.test(name))
const supabaseText = supabaseBundle ? await fs.readFile(path.join(dist, 'assets', supabaseBundle), 'utf8') : ''
const authKey = `sb-${/https:\/\/([a-z0-9]+)\.supabase\.co/.exec(supabaseText)?.[1] || 'local-only'}-auth-token`
const store = {
  a: { present: true, fileId: fileIds.a, marks: [], cards: [], rev: 0, cardRev: 0, puts: [] },
  b: { present: true, fileId: fileIds.b, marks: [], cards: [], rev: 0, cardRev: 0, puts: [] },
}
const pdfAccount = { marks: [], cards: [], textMarks: [], textCards: [], rev: { marks: 0, cards: 0, textMarks: 0, textCards: 0 }, puts: [] }
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
    if (p === '/api/chat' || p === '/api/lab-chat') {
      res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-store' })
      res.end('event: content_block_delta\ndata: {"type":"content_block_delta","delta":{"type":"text_delta","text":"The old reader kept this complete answer."}}\n\nevent: message_stop\ndata: {"type":"message_stop"}\n\n')
      return
    }
    if (p === '/api/public-books') { json(res, 200, { books: [] }); return }
    if (p === '/api/narration/voices') { json(res, 200, { enabled: false, voices: [] }); return }
    if (!account) { json(res, 401, { error: 'unauthorized' }); return }
    const book = { id: account.fileId, type: 'epub', sha256, name: 'Private fixture.epub', title: 'Isolated Reader Fixture', author: 'Local Author', size: bytes.length, createdAt: '2026-10-23T00:00:00.000Z' }
    const pdfBook = { id: pdfFileId, type: 'pdf', sha256: pdfSha256, name: 'Private fixture.pdf', title: 'Original PDF Fixture', author: 'Local Author', size: pdfBytes.length, createdAt: '2026-10-23T00:00:00.000Z' }
    if (p === '/api/user-books' && method === 'GET') { json(res, 200, { books: account.present ? [book, pdfBook] : [pdfBook] }); return }
    if (p === `/api/user-books/${account.fileId}` && method === 'GET' && account.present) { res.writeHead(200, { 'Content-Type': 'application/epub+zip', 'Cache-Control': 'no-store' }); res.end(bytes); return }
    if (p === `/api/user-books/${pdfFileId}` && method === 'GET') { res.writeHead(200, { 'Content-Type': 'application/pdf', 'Cache-Control': 'no-store' }); res.end(pdfBytes); return }
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
    if (p === `/api/user-books/cards/${hex}`) {
      if (method === 'GET') { json(res, 200, { cards: account.cards, rev: account.cardRev, fileId: account.fileId }); return }
      if (method === 'PUT') {
        let raw = ''; for await (const chunk of req) raw += chunk
        const payload = JSON.parse(raw)
        if (payload.expectedFileId !== account.fileId || payload.rev !== account.cardRev) { json(res, 409, { error: 'conflict', cards: account.cards, rev: account.cardRev, fileId: account.fileId }); return }
        account.cards = payload.cards; account.cardRev += 1
        json(res, 200, { rev: account.cardRev, fileId: account.fileId }); return
      }
    }
    for (const [route, field] of [['marks', 'marks'], ['cards', 'cards'], ['text-marks', 'textMarks'], ['text-cards', 'textCards']]) if (p === `/api/user-books/${route}/${pdfHex}`) {
      const set = pdfAccount[field]
      if (method === 'GET') { json(res, 200, { [route.endsWith('marks') ? 'marks' : 'cards']: set, rev: pdfAccount.rev[field], fileId: pdfFileId }); return }
      if (method === 'PUT') {
        let raw = ''; for await (const chunk of req) raw += chunk
        const payload = JSON.parse(raw), name = route.endsWith('marks') ? 'marks' : 'cards'
        pdfAccount.puts.push({ route, ...payload })
        if ((payload.expectedFileId !== undefined || route.startsWith('text-')) && payload.expectedFileId !== pdfFileId
          || payload.rev !== pdfAccount.rev[field]) { json(res, 409, { error: 'conflict', [name]: set, rev: pdfAccount.rev[field], fileId: pdfFileId }); return }
        pdfAccount[field] = payload[name]; pdfAccount.rev[field] += 1
        json(res, 200, { rev: pdfAccount.rev[field], fileId: pdfFileId }); return
      }
    }
    if (p === '/api/user-books/places') { json(res, 200, { places: {} }); return }
    if ([hex, pdfHex].some(id => new RegExp(`^/api/user-books/(places|covers|primers)/${id}$`).test(p))) { json(res, 200, { place: null, cover: null, primer: null }); return }
    json(res, 404, { error: 'not_found' }); return
  }
  const local = path.resolve(activeDist, '.' + (p === '/reader' ? '/app.html' : p === '/library' ? '/lab/library_2/index.html' : p === '/lab/addbook/book' ? '/lab/addbook/book.html' : p))
  if (!local.startsWith(activeDist + path.sep)) { res.writeHead(403); res.end(); return }
  try { const body = await fs.readFile(local); res.writeHead(200, { 'Content-Type': mime(local), 'Cache-Control': /\.html$/.test(local) ? 'no-store' : 'public, max-age=3600' }); res.end(body) }
  catch { res.writeHead(404); res.end() }
})
server.on('connect', (req, socket) => { denied.push(`CONNECT ${req.url}`); socket.end('HTTP/1.1 403 Forbidden\r\n\r\n') })
server.on('upgrade', (req, socket) => { denied.push(`UPGRADE ${req.url}`); socket.end('HTTP/1.1 403 Forbidden\r\n\r\n') })
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
originRef.value = `http://127.0.0.1:${server.address().port}`

async function seed(page, owner, fileId) {
  await page.goto(`${originRef.value}/qa-seed`)
  await page.evaluate(async ({ authKey, owner, token, hex, fileId, bytes, pdfHex, pdfFileId, pdfBytes }) => {
    localStorage.setItem(authKey, JSON.stringify({ access_token: token, refresh_token: token, expires_in: 3600, expires_at: Math.floor(Date.now()/1000) + 36000, token_type: 'bearer', user: { id: owner, email: `${owner}@example.test`, aud: 'authenticated' } }))
    document.cookie = 'tinct_auth=1; path=/; SameSite=Lax'
    await new Promise((resolve, reject) => {
      const open = indexedDB.open('tinct-addbook', 1)
      open.onupgradeneeded = () => { if (!open.result.objectStoreNames.contains('books')) open.result.createObjectStore('books', { keyPath: 'key' }) }
      open.onerror = () => reject(open.error)
      open.onsuccess = () => {
        const db = open.result, tx = db.transaction('books', 'readwrite')
        tx.objectStore('books').put({ key: `epub:${hex}`, kind: 'epub', owner, cloudId: fileId, name: 'Private fixture.epub', title: 'Isolated Reader Fixture', author: 'Local Author', bytes: new Uint8Array(bytes).buffer })
        tx.objectStore('books').put({ key: `pdf:${pdfHex}`, kind: 'pdf', owner, cloudId: pdfFileId, name: 'Private fixture.pdf', title: 'Original PDF Fixture', author: 'Local Author', bytes: new Uint8Array(pdfBytes).buffer })
        tx.oncomplete = () => { db.close(); resolve() }; tx.onerror = () => reject(tx.error)
      }
    })
  }, { authKey, owner: owners[owner], token: `isolation-${owner}`, hex, fileId, bytes: [...bytes], pdfHex, pdfFileId, pdfBytes: [...pdfBytes] })
}
async function open(page) {
  await page.goto(`${originRef.value}/reader?userBook=${hex}&sharedReader=1`, { waitUntil: 'domcontentloaded' })
  await page.waitForFunction(() => document.querySelector('[data-testid="lab-root"]')?.dataset.readerReady === 'true', null, { timeout: 45000 })
  await page.locator('.lab-page-wrap [data-testid="lab-word"]:visible').nth(8).waitFor()
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
async function oldHighlight(page) {
  await page.locator('.epub-pg .epub-body p').first().evaluate(el => {
    const node = el.firstChild, range = document.createRange()
    range.setStart(node, 0); range.setEnd(node, 36)
    const selection = getSelection(); selection.removeAllRanges(); selection.addRange(range)
    document.dispatchEvent(new Event('selectionchange'))
    el.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, button: 0, pointerType: 'mouse' }))
  })
  await page.locator('.mr-bar [data-m="dot"]').waitFor({ timeout: 7000 })
  await page.locator('.mr-bar [data-m="dot"]').click()
  await page.locator('.mr-bar [data-m="note"]').click()
  await page.locator('.mr-note__field').fill('A note saved before the rollback returned to Tinct text.')
  await page.locator('.mr-note [data-m="save"]').click()
  await page.waitForFunction(hex => (JSON.parse(localStorage.getItem(`tinct-addbook:hl:epub:${hex}`) || '[]')).some(row => row.page === 1), hex)
}
async function oldAsk(page) {
  await page.keyboard.press('Escape')
  await page.locator('.epub-pg .epub-body p').nth(1).evaluate(el => {
    const node = el.firstChild, range = document.createRange()
    getSelection().removeAllRanges()
    el.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, button: 0, pointerType: 'mouse' }))
    range.setStart(node, 0); range.setEnd(node, 40)
    const selection = getSelection(); selection.removeAllRanges(); selection.addRange(range)
    document.dispatchEvent(new Event('selectionchange'))
    el.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, button: 0, pointerType: 'mouse' }))
  })
  await page.locator('.mr-bar [data-m="ask"]').waitFor({ timeout: 7000 })
  await page.locator('.mr-bar [data-m="ask"]').click()
  await page.locator('.mr-bar .mr-ask').fill('What did this passage mean?')
  await page.locator('.mr-bar [data-m="send"]').click()
  await page.waitForFunction(hex => JSON.parse(localStorage.getItem(`tinct-addbook:cards:epub:${hex}`) || '[]')
    .some(row => row.turns?.some(turn => turn.role === 'assistant' && turn.content.includes('complete answer'))), hex, { timeout: 12000 })
}
async function oldPdfHighlight(page) {
  await page.locator('.pdf-sheet .text-layer span').filter({ hasText: /[A-Za-z]{5}/ }).first().evaluate(el => {
    const node = el.firstChild, range = document.createRange()
    range.setStart(node, 0); range.setEnd(node, Math.min(16, node.textContent.length))
    const selection = getSelection(); selection.removeAllRanges(); selection.addRange(range)
    document.dispatchEvent(new Event('selectionchange'))
    el.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, button: 0, pointerType: 'mouse' }))
  })
  await page.locator('.mr-bar [data-m="dot"], .selection-popup [data-a="highlight"]').first().waitFor({ timeout: 7000 })
  await page.locator('.mr-bar [data-m="dot"], .selection-popup [data-a="highlight"]').first().click()
  await page.waitForFunction(hex => JSON.parse(localStorage.getItem(`tinct-addbook:hl:pdf:${hex}`) || '[]').length > 0, pdfHex)
}
async function until(assertion, message, timeout = 6000) {
  const end = Date.now() + timeout
  while (Date.now() < end) {
    if (assertion()) return
    await new Promise(resolve => setTimeout(resolve, 100))
  }
  assert(assertion(), message)
}
async function run() {
  const browser = await markInternal(await chromium.launch({ headless: true, proxy: { server: originRef.value }, args: ['--mute-audio'] }))
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, serviceWorkers: 'block', reducedMotion: 'reduce' })
  const page = await context.newPage(), errors = []
  page.on('pageerror', error => errors.push(error.message))
  // Playwright fulfills auth SDK requests outside the page. Window.fetch stays
  // native, so receiver/brand errors in reader controllers remain observable.
  await context.route(/^https:\/\/[^/]+\.supabase\.co\//, route => {
    const url = new URL(route.request().url())
    const body = url.pathname === '/auth/v1/user' ? { id: owners.a, email: `${owners.a}@example.test`, aud: 'authenticated' }
      : url.pathname.startsWith('/rest/v1/') ? [] : {}
    return route.fulfill({ status: url.pathname === '/auth/v1/user' || url.pathname.startsWith('/rest/v1/') ? 200 : 404,
      contentType: 'application/json', body: JSON.stringify(body) })
  })
  try {
    await seed(page, 'a', fileIds.a)
    await open(page)
    await highlight(page)
    await until(() => store.a.marks.some(item => item.v === 'text-v1'), 'current reader account highlight sync')
    const textMark = store.a.marks.find(item => item.v === 'text-v1')
    assert.equal(store.a.puts.at(-1).expectedFileId, fileIds.a)
    console.log('Current React reader saved a source-word mark', textMark.id)

    // A rollback serves the previous immutable app assets at the same origin.
    // Old static EPUB annotations remain in their original local record until
    // the new reader can safely claim them; the old UI cannot interpret text-v1.
    activeDist = oldDist
    await page.evaluate(hex => localStorage.setItem(`tinct-addbook:epub-view:${hex}`, JSON.stringify('margin')), hex)
    await page.goto(`${originRef.value}/lab/addbook/book?userBook=${hex}`, { waitUntil: 'domcontentloaded' })
    await page.locator('.epub-pg .epub-body p').first().waitFor({ timeout: 10000 })
    assert(await page.locator('#root').isVisible(), 'prior static reader opened same EPUB')
    await oldHighlight(page)
    await oldAsk(page)
    const oldMark = await page.evaluate(hex => JSON.parse(localStorage.getItem(`tinct-addbook:hl:epub:${hex}`) || '[]')[0], hex)
    const oldCard = await page.evaluate(hex => JSON.parse(localStorage.getItem(`tinct-addbook:cards:epub:${hex}`) || '[]')
      .find(row => row.turns?.some(turn => turn.role === 'assistant')), hex)
    assert(oldMark?.text && Number.isInteger(oldMark.start), 'prior static reader saved original chapter/character mark')
    assert(oldCard?.text && oldCard.turns.some(turn => turn.role === 'assistant'), 'prior static reader saved complete answer card')
    console.log('Prior static reader saved original mark and card', oldMark.id, oldCard.id)

    activeDist = dist
    await open(page)
    await page.getByRole('button', { name: 'Attach older EPUB annotations' }).click()
    await open(page)
    await page.waitForFunction(id => Object.keys(localStorage).some(key => key.includes('text-marks-canonical:') && (localStorage.getItem(key) || '').includes(id)), oldMark.id)
    await page.waitForFunction(id => Object.keys(localStorage).some(key => key.includes('text-cards-canonical:') && (localStorage.getItem(key) || '').includes(id)), oldCard.id)
    await until(() => store.a.marks.some(item => item.id === oldMark.id), 'original page mark account sync')
    await until(() => store.a.cards.some(item => item.id === oldCard.id), 'original page card account sync')
    assert.equal(store.a.cards.filter(item => item.id === oldCard.id).length, 1, 'old page card has one account identity')
    assert(store.a.cards.find(item => item.id === oldCard.id).turns.some(turn => turn.role === 'assistant' && turn.content.includes('complete answer')),
      'account card retains the complete old answer')
    assert(store.a.marks.some(item => item.id === oldMark.id && (item.v === 'text-v1' || item.v === 'epub-page-v1')),
      'original mark has either a verified word anchor or its honest original-page variant')
    await page.waitForFunction(id => Object.keys(localStorage).some(key => key.includes('text-marks-canonical:') && (localStorage.getItem(key) || '').includes(id)), textMark.id)
    assert(store.a.marks.some(item => item.id === textMark.id), 'source-word mark retained on account after rollback')
    assert((await observed(page)).highlights > 0, 'source-word mark restored on current reader')
    await page.getByTestId('lab-super').click()
    await page.getByTestId('lab-super-row-notebook').click()
    await page.getByRole('button', { name: `Delete Notebook entry ${textMark.id}` }).click()
    await until(() => store.a.marks.some(item => item.id === textMark.id && item.gone), 'EPUB source-word deletion sync')
    await page.getByRole('button', { name: 'Undo' }).click()
    await until(() => store.a.marks.some(item => item.id === textMark.id && !item.gone), 'EPUB source-word Undo sync')
    if (!process.env.ROLLBACK_SKIP_LEGACY_UI) await page.getByText('The old reader kept this complete answer.', { exact: false }).first().waitFor({ timeout: 10000 }).catch(async error => {
      const notebook = await page.getByTestId('lab-contents-v2').innerText().catch(() => '(Notebook closed)')
      throw new Error(`${error.message}\nNotebook: ${notebook.slice(0, 4000)}`)
    })
    if (!process.env.ROLLBACK_SKIP_LEGACY_UI) {
      const downloaded = page.waitForEvent('download')
      await page.getByRole('button', { name: 'Download Notebook' }).click()
      const markdown = await fs.readFile(await (await downloaded).path(), 'utf8')
      assert(markdown.includes('The old reader kept this complete answer.') && markdown.includes('A note saved before the rollback'),
        'claimed old EPUB answer and note remain in Notebook export')
    }

    // The original PDF page geometry remains a separate owned generation.
    // A pre-owner voice transcript has no safe account attribution. Its prior
    // local format must remain available for explicit attachment after rollback.
    await page.evaluate(pdfHex => {
      const bookId = `userbook-${pdfHex}`, at = Date.now() - 20000
      localStorage.setItem(`tinct:chat-history:${bookId}`, JSON.stringify([{
        id: `conv_lab_${bookId}_${at}`, bookId, chapterNumber: 1, startTimestamp: at, endTimestamp: at + 1,
        preview: 'An older private Talk question', messages: [
          { id: 'prior-voice-user', bookId, chapterNumber: 1, role: 'user', source: 'voice', content: 'An older private Talk question', timestamp: at },
          { id: 'prior-voice-answer', bookId, chapterNumber: 1, role: 'assistant', source: 'voice', content: 'A complete older voice answer.', timestamp: at + 1 },
        ],
      }]))
    }, pdfHex)
    await page.goto(`${originRef.value}/reader?userBook=${pdfHex}&sharedReader=1&pages=1`, { waitUntil: 'domcontentloaded' })
    await page.locator('[data-pdf-original="true"]').waitFor({ timeout: 45000 })
    await page.locator('.pdf-original__page, .pdf-original__canvas').first().waitFor({ timeout: 30000 })
    activeDist = oldDist
    await page.goto(`${originRef.value}/lab/addbook/book?userBook=${pdfHex}`, { waitUntil: 'domcontentloaded' })
    await page.locator('.pdf-sheet .text-layer span').first().waitFor({ timeout: 30000 })
    await oldPdfHighlight(page)
    await page.evaluate(() => window.dispatchEvent(new Event('pagehide')))
    await until(() => pdfAccount.marks.length > 0,
      `old PDF geometry account sync: ${JSON.stringify({ requests: requests.slice(-25), puts: pdfAccount.puts, raw: await page.evaluate(hex => localStorage.getItem(`tinct-addbook:hl:pdf:${hex}`), pdfHex), errors })}`)
    const originalPdfMark = pdfAccount.marks[0]
    activeDist = dist
    await page.goto(`${originRef.value}/reader?userBook=${pdfHex}&sharedReader=1&pages=1`, { waitUntil: 'domcontentloaded' })
    await page.locator('[data-pdf-original="true"]').waitFor({ timeout: 45000 })
    await page.getByRole('button', { name: 'Notebook' }).first().click()
    await page.getByText(/Original PDF page/).first().waitFor({ timeout: 10000 })
    await page.getByRole('button', { name: 'Attach older Talk conversations' }).click()
    await page.getByText('A complete older voice answer.').waitFor({ timeout: 10000 })
    const talkDownload = page.waitForEvent('download')
    await page.locator('.pdf-original-reader__notebook-tools').getByRole('button', { name: 'Download' }).click()
    assert((await fs.readFile(await (await talkDownload).path(), 'utf8')).includes('A complete older voice answer.'),
      'claimed local Talk remains in PDF Notebook export')
    assert(pdfAccount.marks.some(item => item.id === originalPdfMark.id), 'original geometry mark survives rollback and reopen')
    await page.locator('.pdf-original-reader__saved').filter({ hasText: /Original PDF page/ }).first().getByRole('button', { name: /^Delete/ }).click()
    await until(() => pdfAccount.marks.some(item => item.id === originalPdfMark.id && item.gone), 'PDF original-page deletion sync')
    await page.getByRole('button', { name: 'Undo' }).click()
    await until(() => pdfAccount.marks.some(item => item.id === originalPdfMark.id && !item.gone), 'PDF original-page Undo sync')
    await page.goto(`${originRef.value}/reader?userBook=${pdfHex}&sharedReader=1&pages=1`, { waitUntil: 'domcontentloaded' })
    await page.locator('[data-pdf-original="true"]').waitFor({ timeout: 45000 })
    await page.getByRole('button', { name: 'Notebook' }).first().click()
    await page.getByText(/Original PDF page/).first().waitFor({ timeout: 10000 })
    await page.evaluate(hex => localStorage.setItem(`tinct-addbook:edition:${hex}`, JSON.stringify('text')), pdfHex)
    await page.goto(`${originRef.value}/reader?userBook=${pdfHex}&sharedReader=1`, { waitUntil: 'domcontentloaded' })
    await page.waitForFunction(() => document.querySelector('[data-testid="lab-root"]')?.dataset.readerReady === 'true', null, { timeout: 45000 })
    await page.locator('.lab-page-wrap [data-testid="lab-word"]:visible').nth(8).waitFor({ timeout: 30000 })
    await highlight(page)
    await until(() => pdfAccount.textMarks.some(item => item.v === 'text-v1'), 'PDF Tinct text mark account sync')
    assert(pdfAccount.puts.some(item => item.route === 'text-marks' && item.expectedFileId === pdfFileId), 'PDF Tinct text uses generation-bound text route')
    assert(pdfAccount.marks.some(item => item.id === originalPdfMark.id), 'PDF original geometry remains separate from Tinct text marks')
    assert.deepEqual(errors, [], 'no uncaught reader exceptions')
    assert.deepEqual(denied, [], 'no external provider traffic')
    console.log('PASS rollback/reopen EPUB word/page marks+card and PDF Original geometry/Tinct text; same-origin account routes')
  } finally { await context.close(); await browser.close() }
}
try { await run() } finally { await new Promise(resolve => server.close(resolve)) }
