#!/usr/bin/env node
// A scanned PDF is read from its page images by the account, by itself, for Premium and the trial,
// whatever text layer the scanner left in it (Anders, 3 Nov 2026: "fix this once and for all").
// In a real browser against the built reader (dist/), the app served under https://tinct.app by request
// interception and the account's OCR routes answered here; nothing leaves the machine, nothing is recognised.
//
//   VITE_SHARED_READER_DEFAULT=1 SKIP_ENV_CHECK=1 VITE_SUPABASE_URL=https://qa.supabase.co VITE_SUPABASE_ANON_KEY=qa npm run build
//   node scripts/check-scan-recognition.mjs
//
// Books (written here): a scan with a hidden text layer of OCR noise ("pOltrayed Andthis 1 think") over sharp page
// images, a scan without a text layer, and prose_book.pdf (text of its own). Checks:
//   - Premium, the layered scan: every page is drawn and sent once (image/jpeg, signed in), the recognised text
//     replaces the stored text-layer conversion on the book's record (its crops dropped) and is marked a scan;
//   - Premium, the scan without a layer: recognised the same way, and opens as its recognised text from then on;
//   - a free account: nothing is started or sent; the text PDF: marked not a scan, nothing started or sent.
import { chromium } from '@playwright/test'
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import fs from 'node:fs/promises'
import path from 'node:path'
import { markInternal } from './lib/internalTraffic.cjs'

const origin = 'https://tinct.app'
const dist = path.resolve('dist')
const PAGES = 6
const sha = bytes => createHash('sha256').update(bytes).digest('hex')
let failures = 0
const ok = (name, pass, detail) => { console.log(`${pass ? 'ok  ' : 'FAIL'} ${name}${pass ? '' : ` ${JSON.stringify(detail)}`}`); if (!pass) failures++ }

/** A PDF of `pages` pages, each one JPEG over the whole page, with an invisible text layer when `layer` is given. */
function scanPdf(jpg, pages, layer) {
  const objs = []
  const add = body => { objs.push(body); return objs.length }
  const stream = (dict, data) => Buffer.concat([Buffer.from(`<< ${dict} /Length ${data.length} >>\nstream\n`), data, Buffer.from('\nendstream')])
  const content = Buffer.from(`q 612 0 0 792 0 0 cm /Im0 Do Q${layer ? ` BT 3 Tr /F1 11 Tf 72 700 Td (${layer}) Tj ET` : ''}`)
  const font = add(Buffer.from('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>'))
  const made = []
  for (let i = 0; i < pages; i++) {
    const image = add(stream('/Type /XObject /Subtype /Image /Width 1224 /Height 1584 /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode', jpg))
    const contents = add(stream('', content))
    made.push([add(null), image, contents])
  }
  const tree = add(null)
  const catalog = add(Buffer.from(`<< /Type /Catalog /Pages ${tree} 0 R >>`))
  for (const [page, image, contents] of made) objs[page - 1] = Buffer.from(`<< /Type /Page /Parent ${tree} 0 R /MediaBox [0 0 612 792] /Contents ${contents} 0 R /Resources << /XObject << /Im0 ${image} 0 R >> /Font << /F1 ${font} 0 R >> >> >>`)
  objs[tree - 1] = Buffer.from(`<< /Type /Pages /Kids [${made.map(([p]) => `${p} 0 R`).join(' ')}] /Count ${made.length} >>`)
  let out = Buffer.from('%PDF-1.4\n')
  const offsets = []
  objs.forEach((body, i) => { offsets.push(out.length); out = Buffer.concat([out, Buffer.from(`${i + 1} 0 obj\n`), body, Buffer.from('\nendobj\n')]) })
  const xref = out.length
  return Buffer.concat([out, Buffer.from(`xref\n0 ${objs.length + 1}\n0000000000 65535 f \n${offsets.map(o => `${String(o).padStart(10, '0')} 00000 n \n`).join('')}trailer << /Size ${objs.length + 1} /Root ${catalog} 0 R >>\nstartxref\n${xref}\n%%EOF\n`)])
}

/** The account's recognised text for `pages` pages (ocrEdition.ts shape, converter 2). */
const recognisedEdition = title => ({
  format: 'tinct-user-edition-v1', converter: 2, source: 'ocr', title, author: '', language: 'en', droppedImages: 0,
  chapters: [{ number: 1, title: 'Pages 1–6', paragraphs: Array.from({ length: PAGES }, (_, i) => `${'As a reporter at the Chicago Tribune, I spent countless hours rummaging through court files and sniffing for tidbits of news. '.repeat(14)}This is page ${i + 1}.`), pages: Array.from({ length: PAGES }, (_, i) => i + 1) }],
})

/** The text layer's own conversion, as stored before: noise, with a crop. */
const layerEdition = title => ({
  format: 'tinct-user-edition-v1', converter: 8, source: 'pdf', title, author: '', language: 'en', droppedImages: 0,
  chapters: [{ number: 1, title: 'Chapter 1', paragraphs: ['a reporter at the Chicago Tribune pOltrayed Andthis 1 think'] }],
})

async function serve(context, { books, tier, log }) {
  const json = (route, status, body) => route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) })
  const jobs = new Map()
  await context.route('**/*', async route => {
    const req = route.request(), url = new URL(req.url())
    if (url.hostname === 'qa.supabase.co') {
      if (url.pathname === '/auth/v1/user') return json(route, 200, { id: 'u-qa', aud: 'authenticated', email: 'reader@example.com' })
      return json(route, 200, [])
    }
    if (url.origin !== origin) return route.abort()
    const p = url.pathname
    if (p === '/qa-seed') return route.fulfill({ status: 200, contentType: 'text/html', body: '<!doctype html><title>seed</title>' })
    const ocr = /^\/api\/user-books\/ocr\/([0-9a-f]{24})(\/.*)?$/.exec(p)
    if (ocr) {
      const [, hex, rest = ''] = ocr
      const book = books.find(b => b.hex === hex)
      log.ocr.push({ method: req.method(), path: rest, auth: req.headers().authorization, type: req.headers()['content-type'] || '' })
      const job = jobs.get(hex) ?? { state: 'none', uploaded: new Set() }
      jobs.set(hex, job)
      const status = () => ({ state: job.state, pages: PAGES, uploaded: job.uploaded.size, done: job.state === 'done' ? PAGES : 0, failed: 0, blank: 0, missing: job.state === 'none' ? [] : Array.from({ length: PAGES }, (_, i) => i + 1).filter(n => !job.uploaded.has(n)), tier, stored: true, month: { used: 0, limit: 1500 } })
      if (rest === '' && req.method() === 'GET') return json(route, 200, status())
      if (rest === '' && req.method() === 'POST') { if (tier === 'none') return json(route, 402, { error: 'premium_required' }); if (job.state === 'none') job.state = 'uploading'; return json(route, 200, status()) }
      const page = /^\/pages\/(\d+)$/.exec(rest)
      if (page && req.method() === 'PUT') {
        job.uploaded.add(Number(page[1]))
        log.puts.push({ hex, n: Number(page[1]), bytes: (req.postDataBuffer() || Buffer.alloc(0)).length })
        if (job.uploaded.size === PAGES) job.state = 'done'
        return json(route, 200, { ok: true })
      }
      if (rest === '/edition') return job.state === 'done' ? json(route, 200, recognisedEdition(book.title)) : json(route, 404, { error: 'Not found' })
      return json(route, 404, { error: 'Not found' })
    }
    if (p === '/api/user-books') return json(route, 200, { books: books.map(b => ({ id: b.sha256.slice(0, 32), name: b.name, title: b.title, author: '', type: 'pdf', size: b.bytes.length, sha256: b.sha256, createdAt: new Date(0).toISOString(), cover: null })) })
    if (p === '/api/user-books/places') return json(route, 200, { places: {} })
    if (/^\/api\/user-books\/(places|covers)\//.test(p)) return json(route, 200, { place: null, cover: null })
    if (/^\/api\/user-books\/(marks|cards)\//.test(p)) return json(route, 200, { marks: [], cards: [], rev: 0 })
    if (p.startsWith('/api/user-books/primers/')) return json(route, 200, { primer: null })
    const file = books.find(b => p === `/api/user-books/${b.sha256.slice(0, 32)}`)
    if (file) return route.fulfill({ status: 200, contentType: 'application/pdf', body: file.bytes })
    if (p === '/api/own-text-repair') return json(route, 200, { items: [] })
    if (p.startsWith('/api/')) return json(route, 404, { error: 'Not found' })
    const pathname = p === '/reader' ? '/app.html' : p
    const local = path.resolve(dist, `.${pathname}`)
    if (!local.startsWith(`${dist}/`)) return route.abort()
    try { if ((await fs.stat(local)).isFile()) return route.fulfill({ path: local }) } catch { /* not built */ }
    return route.fulfill({ status: 404, body: '' })
  })
}

async function seed(page, book) {
  await page.goto(`${origin}/qa-seed`)
  await page.evaluate(async ({ hex, name, title, bytes, extra }) => {
    localStorage.setItem('sb-qa-auth-token', JSON.stringify({ access_token: 'qa', refresh_token: 'qa-refresh', token_type: 'bearer', expires_in: 3600, expires_at: Math.floor(Date.now() / 1000) + 36000, user: { id: 'u-qa', email: 'reader@example.com' } }))
    const db = await new Promise((resolve, reject) => {
      const request = indexedDB.open('tinct-addbook', 1)
      request.onupgradeneeded = () => request.result.createObjectStore('books', { keyPath: 'key' })
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
    await new Promise((resolve, reject) => {
      const tx = db.transaction('books', 'readwrite')
      tx.objectStore('books').put({ key: `pdf:${hex}`, kind: 'pdf', name, title, owner: 'u-qa', bytes: new Uint8Array(bytes).buffer, ...extra })
      tx.oncomplete = resolve
      tx.onerror = () => reject(tx.error)
    })
    db.close()
  }, { hex: book.hex, name: book.name, title: book.title, bytes: [...book.bytes], extra: book.extra || {} })
}

const record = (page, hex) => page.evaluate(async hex => {
  const db = await new Promise((resolve, reject) => { const r = indexedDB.open('tinct-addbook', 1); r.onsuccess = () => resolve(r.result); r.onerror = () => reject(r.error) })
  const value = await new Promise(resolve => { const r = db.transaction('books').objectStore('books').get(`pdf:${hex}`); r.onsuccess = () => resolve(r.result) })
  db.close()
  return value ? { source: value.edition?.source ?? null, first: value.edition?.chapters?.[0]?.paragraphs?.[0] ?? null, figureData: 'figureData' in value, imageScan: value.imageScan } : null
}, hex)

async function run(browser, { name, book, tier, expectRecognised, wait = 30000, reopen = null }) {
  const log = { ocr: [], puts: [] }
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, serviceWorkers: 'block' })
  await serve(context, { books: [book], tier, log })
  const page = await context.newPage()
  const errors = []
  page.on('pageerror', e => errors.push(e.message))
  await seed(page, book)
  if (reopen) await page.evaluate(reopen.before, book.hex)
  await page.goto(`${origin}/reader?userBook=${book.hex}`, { waitUntil: 'domcontentloaded' })
  const deadline = Date.now() + wait
  let kept = null
  while (Date.now() < deadline) {
    await page.waitForTimeout(1000)
    kept = await record(page, book.hex)
    if (expectRecognised ? kept?.source === 'ocr' : kept?.imageScan !== undefined || log.ocr.length) break
  }
  if (!expectRecognised) await page.waitForTimeout(6000)
  kept = await record(page, book.hex)
  let shown = null
  if (reopen) {
    await page.reload({ waitUntil: 'domcontentloaded' })
    await page.waitForFunction(() => /Chicago Tribune/.test(document.body.innerText), null, { timeout: 30000 }).catch(() => {})
    await page.waitForTimeout(1500)
    shown = await page.evaluate(reopen.after)
  }
  await context.close()
  return { log, kept, errors, shown }
}

const browser = await markInternal(await chromium.launch())
try {
  const shell = await browser.newPage()
  const jpg = Buffer.from(await shell.evaluate(() => {
    const c = document.createElement('canvas'); c.width = 1224; c.height = 1584
    const x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height); x.fillStyle = '#000'; x.font = '28px serif'
    for (let i = 0; i < 34; i++) x.fillText(`As a reporter at the Chicago Tribune, I was a document rat, line ${i}`, 120, 140 + i * 40)
    return c.toDataURL('image/jpeg', 0.8).split(',')[1]
  }), 'base64')
  await shell.close()
  const book = (name, bytes, extra) => { const s = sha(bytes); return { name, title: name.replace(/\.pdf$/, ''), bytes, sha256: s, hex: s.slice(0, 24), extra } }
  const layered = scanPdf(jpg, PAGES, 'a reporter at the Chicago Tribune pOltrayed Andthis 1 think')
  const bare = scanPdf(jpg, PAGES, '')

  const scanned = layerEdition('case')
  // Read as Tinct text on this phone, on its fourth PDF page.
  const reopen = {
    before: hex => {
      localStorage.setItem('tinct-addbook:edition:' + hex, JSON.stringify('text'))
      localStorage.setItem('tinct-addbook:pos:pdf:' + hex, JSON.stringify({ page: 4, frac: 0, edition: 't', at: Date.now() }))
    },
    after: () => {
      // The reading stage's lines on screen, in order (a paged reader: the screen holding page 4's paragraph opens
      // on the end of page 3's; a paragraph running on to the next screen ends with its own words).
      const lines = [...document.querySelectorAll('.lab-hearing-stage p.has-hyphen-plan')]
        .filter(p => { const r = p.getBoundingClientRect(); return r.width > 0 && r.right > 0 && r.left < innerWidth && r.bottom > 0 && r.top < innerHeight })
        .sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top)
        .map(p => ({ end: p.textContent.trim().slice(-7), continued: p.classList.contains('is-continued') }))
      return { lines, noise: /pOltrayed|Andthis/.test(document.body.innerText) }
    },
  }
  let r = await run(browser, { name: 'layered', book: book('case.pdf', layered, { edition: scanned, scan: { textPages: PAGES }, figureData: { fig: { type: 'image/png', data: new Uint8Array(4) } } }), tier: 'premium', expectRecognised: true, reopen })
  const puts = r.log.puts.map(x => x.n).sort((a, b) => a - b)
  ok('Premium, a scan with a text layer: every page is drawn and sent once, as a JPEG, signed in', puts.join() === '1,2,3,4,5,6' && r.log.ocr.filter(x => x.path.startsWith('/pages/')).every(x => x.type === 'image/jpeg' && x.auth === 'Bearer qa') && r.log.puts.every(x => x.bytes > 10000), { puts: r.log.puts, ocr: r.log.ocr.slice(0, 4) })
  ok('…its recognised text replaces the text layer\'s conversion on the record, crops dropped, marked a scan', r.kept?.source === 'ocr' && /^As a reporter/.test(r.kept.first) && !r.kept.figureData && r.kept.imageScan === true, r.kept)
  ok('…the next open reads the recognised text, at the same PDF page (4), with none of the noise', r.shown && !r.shown.noise && r.shown.lines.length === 2 && r.shown.lines[0].end === 'page 3.' && (r.shown.lines[1].end === 'page 4.' || r.shown.lines[1].continued), r.shown)
  ok('…no page errors', !r.errors.length, r.errors)

  r = await run(browser, { name: 'bare', book: book('bare.pdf', bare, { scan: { textPages: 0 }, layout: { default: 'pages-only' } }), tier: 'trial', expectRecognised: true })
  ok('the trial, a scan without a text layer: recognised the same way', r.kept?.source === 'ocr' && r.log.puts.length === PAGES, { kept: r.kept, puts: r.log.puts.length })

  r = await run(browser, { name: 'free', book: book('free.pdf', layered, { scan: { textPages: PAGES } }), tier: 'none', expectRecognised: false })
  ok('a free account: nothing started or sent, the text kept as it was', !r.log.ocr.some(x => x.method !== 'GET') && !r.log.puts.length && r.kept?.source !== 'ocr', { ocr: r.log.ocr, kept: r.kept })

  const prose = readFileSync(path.resolve('../addbooks/web/test/pdf-fixtures/prose_book.pdf'))
  r = await run(browser, { name: 'text', book: book('prose_book.pdf', prose, { scan: { textPages: 20 } }), tier: 'premium', expectRecognised: false })
  ok('a PDF with text of its own: marked not a scan, nothing asked of the account', r.kept?.imageScan === false && !r.log.ocr.length, { ocr: r.log.ocr, kept: r.kept })
} finally {
  await browser.close()
}
assert.equal(failures, 0, `${failures} check(s) failed`)
console.log('scan recognition: all checks passed')
