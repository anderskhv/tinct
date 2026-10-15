#!/usr/bin/env node
// The margin reader's layout check for the PDF reader (docs/margin/BRIEF.md, "Layout QA").
// Runs docs/margin/layout-check.mjs in headless Chromium, offline, with every AI call mocked:
//
//   node scripts/margin-check.mjs fixture            the fixture (lab/addbook/margin-fixture.html), every look
//   node scripts/margin-check.mjs reader [pdf ...]    a real PDF in the PDF reader: the bar, Ask, More, Define and
//                                                     the note editor at 1440×900, 1280×800, 1024×768, 390×844
//                                                     and 360×740, in Paper, Book, Night and e-ink
//   node scripts/margin-check.mjs behaviour         the bar's actions, highlight default, notes and their sync on two devices,
//                                                     Define offline and online, Copy quote (all AI mocked)
//   node scripts/margin-check.mjs pairs               fixture pieces beside the same mockup frames, Paper and Night
//   node scripts/margin-check.mjs column [pdf ...]    PR 2: the column, cards, marks and the bottom card across the
//                                                     brief's stress matrix (7 viewports × 4 looks × 100%/125% zoom)
//                                                     with its content cases (crowding, edges, long answers, …)
//   node scripts/margin-check.mjs resize [pdf ...]    PR 2: resizing across 1180px with a card open
//   node scripts/margin-check.mjs primer              PR 3: Before you start: trigger, primer, storage, Redo, map, quiz, phone
//   node scripts/margin-check.mjs primer-reliability  Before you start made 10 of 10 times against mocked replies (cut off, empty, odd shapes, slow)
//   node scripts/margin-check.mjs keys                PR 4: the keys (N, B, /, Escape, More's arrows), focus, labels, the live region
//   node scripts/margin-check.mjs contrast            PR 4: text contrast of every margin colour pair in every look (a report)
//   node scripts/margin-check.mjs epub                PR C: an EPUB in the PDF reader: the bar, More, Related, Explain, crowding,
//                                                     a zoom, a note and Copy quote, at every viewport. The EPUB margin is off in
//                                                     the reader (EPUB_MARGIN = false): this mode turns it on for its pages; in
//                                                     `sample`/`full` it runs only with EPUB_MARGIN=1.
//   node scripts/margin-check.mjs scans               PR D: a scanned PDF added, offered recognition at once (the first-open race),
//                                                     recognised (mocked), its words laid over the pages; the bar, a whole-PDF
//                                                     question and the primer on it, desktop and phone; a scan recognised without boxes
//   node scripts/margin-check.mjs sample              every check above but pairs, a sample of the matrices (npm run check:margin, CI)
//   node scripts/margin-check.mjs full                every check above but pairs, the whole matrix (npm run check:margin:full)
//
// Every problem list must be empty: the script exits 1 otherwise. OUT (default ./artifacts/margin)
// receives the screenshots and results.json. CHROMIUM_PATH picks the browser (default
// /opt/pw-browsers/chromium when present). The local server serves app/public and stands in for
// /api/chat, /api/lab-chat and /api/user-books (with places and marks); nothing leaves the machine.
import { createServer } from 'node:http'
import { createRequire } from 'node:module'
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync, statSync } from 'node:fs'
import { join, extname, normalize, basename } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const APP = join(fileURLToPath(import.meta.url), '../..')
const REPO = join(APP, '..')
const PUBLIC = join(APP, 'public')
const require = createRequire(join(APP, 'package.json'))
const { chromium } = require('@playwright/test')
const { checkLayout, DEFAULT_SELECTORS } = await import(pathToFileURL(join(REPO, 'docs/margin/layout-check.mjs')).href)
const OUT = process.env.OUT || join(APP, 'artifacts/margin')
mkdirSync(OUT, { recursive: true })
const EXEC = process.env.CHROMIUM_PATH || (existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined)
const [mode = 'fixture', ...args] = process.argv.slice(2)
const PDFS = args.length ? args : [join(REPO, 'addbooks/web/test/pdf-fixtures/prose_book.pdf'), join(REPO, 'addbooks/web/test/pdf-fixtures/two_column_paper.pdf')]
// A book of 40 pages or more, with an outline: its top-level entries are the primer's units (a shorter PDF is one unit).
const { proseBook, makePdf } = await import(pathToFileURL(join(REPO, 'addbooks/web/test/make-pdf.mjs')).href)
const LONG_BOOK = join(OUT, 'long_prose_book.pdf')
writeFileSync(LONG_BOOK, proseBook({ paragraphs: 48 }))

// The class names of css/margin.css, as the check's selectors (the phone More's rows are buttons).
export const SELECTORS = {
  ...DEFAULT_SELECTORS,
  menu: '.mr-more, .mr-pmore, .mr-define, .mr-note',
  // PR 3: the primer's trigger and the primer are blocks of the column, as cards are (no overlap, never off screen).
  card: DEFAULT_SELECTORS.card + ', .mr-trigger, .mr-primer',
  text: DEFAULT_SELECTORS.text + ', .mr-note *, .mr-stack, .mr-stack *, .mr-foot *, .mr-trigger',
  tap: DEFAULT_SELECTORS.tap + ', .mr-pmore > button, .mr-note__foot .mr-bar__item, .mr-mark, .mr-trigger, .mr-primer__close, .mr-map__row, .mr-quiz-row, .mr-primer__foot button',
}
// A long answer scrolls inside its open card (BRIEF.md, "A 600-word answer": the card scrolls, its
// label and follow-up line stay). Lines scrolled out of that body are not cut off by a container
// edge, so "clipped" inside the card's own scrolling body (or the thread's) is not a problem; every
// other check, and "clipped" everywhere else, stands.
// The same for a long primer, which scrolls inside itself (margin-reference.css .mr-primer, overflow: auto).
const scrolledAway = p => p.kind === 'clipped' && /^\.(?:mr-card__body|(?:mr\.)?mr-primer)(?:\.|\s|$)/.test(p.in || '')
// The wait ring's label is for screen readers only (visually hidden on purpose, lab/wait-ring.js), so its box is not text spilling out.
const srOnly = p => p.kind === 'overflow' && /^\.tinct-wait(?:-label)?(?:\.|\s|$)/.test(p.el || '')
// PR C (FIXES-2026-10-15): every target is at least 28px each way, including where the mockup draws a
// 16px icon or a 20px colour (copy, the mics, the colours, the bottom card's handle, the quiz links).
export const ICON_TARGETS = '.mr-card__copy, .mr-follow__mic, .mr-swatch, .mr-sheet__grab, .mr-follow__link, button.mr-related__row'
export async function checkMargin(page, selectors = SELECTORS) {
  const list = (await checkLayout(page, { selectors })).filter(p => !scrolledAway(p) && !srOnly(p))
  const small = await page.evaluate(sel => [...document.querySelectorAll(sel)].filter(el => { const r = el.getBoundingClientRect(), cs = getComputedStyle(el); return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && (r.width < 27.5 || r.height < 27.5) }).map(el => ({ kind: 'squeezed', el: '.' + String(el.className).trim().split(/\s+/).join('.'), size: [Math.round(el.getBoundingClientRect().width), Math.round(el.getBoundingClientRect().height)] })), ICON_TARGETS)
  return [...list, ...small, ...await page.evaluate(stripProblems)]
}
// The position strip (js/strip.js) in the PDF reader: shown at 700px and up, beside the pages and under
// the top bar, never over either (its box, window marker, lines and dots); absent below 700px.
export function stripProblems() {
  if (document.body.dataset.view !== 'reader' || !document.querySelector('.lab.is-pdf .pdf-sheet')) return []
  const el = document.querySelector('.pdf-strip')
  const shown = !!el && !el.hidden && getComputedStyle(el).display !== 'none' && el.getBoundingClientRect().height > 0
  if (innerWidth < 700) return shown ? [{ kind: 'strip', el: `.pdf-strip shown at ${innerWidth}px` }] : []
  if (!shown) return [{ kind: 'strip', el: `.pdf-strip missing at ${innerWidth}px` }]
  const out = [], hit = (a, b) => Math.min(a.right, b.right) - Math.max(a.left, b.left) > 0.5 && Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 0.5
  const hdr = document.getElementById('hdr').getBoundingClientRect()
  const sheets = [...document.querySelectorAll('.pdf-sheet')].map(s => ({ n: s.dataset.page, r: s.getBoundingClientRect() })).filter(s => s.r.bottom > hdr.bottom && s.r.top < innerHeight)
  const parts = [el, ...el.querySelectorAll('.pdf-strip__win, line, circle')]
  for (const part of parts) {
    const r = part.getBoundingClientRect(), name = part === el ? '.pdf-strip' : `.pdf-strip ${part.getAttribute('class') || part.tagName}`
    if (hit(r, hdr)) { out.push({ kind: 'overlap', a: name, b: '.lab-header' }); break }
    const s = sheets.find(s => hit(r, s.r)); if (s) { out.push({ kind: 'overlap', a: name, b: `.pdf-sheet p. ${s.n}` }); break }
  }
  const r = el.getBoundingClientRect()
  if (r.left < 0 || r.right > innerWidth || r.top < hdr.bottom || r.bottom > innerHeight) out.push({ kind: 'offscreen', el: '.pdf-strip', rect: [r.left, r.top, r.right, r.bottom].map(Math.round) })
  return out
}
const LOOKS = (process.env.LOOKS || 'paper,book,night,eink').split(',')
// `sample` (npm run check:margin, in CI): each viewport once, each look and both zooms at least once, both
// PDFs, with every content case; `full` (npm run check:margin:full): the whole matrix. Looks rotate per PDF.
let SAMPLE = false
const rotate = (list, i) => list[i % list.length]
const VIEWPORTS = (process.env.VIEWPORTS || '1440x900,1280x800,1024x768,390x844,360x740').split(',').map(v => v.split('x').map(Number))

/* ---------- A local stand-in for the site ---------- */
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.woff2': 'font/woff2', '.woff': 'font/woff', '.svg': 'image/svg+xml', '.png': 'image/png', '.gz': 'application/gzip', '.pdf': 'application/pdf' }
const account = { books: [], marks: new Map(), cards: new Map(), primers: new Map(), requests: [] }
const PRIMER_PARSE = await import(pathToFileURL(join(PUBLIC, 'lab/margin/primer-parse.js')).href)
function addBook(file) {
  const bytes = readFileSync(file), sha256 = createHash('sha256').update(bytes).digest('hex')
  if (!account.books.some(b => b.sha256 === sha256)) account.books.push({ id: sha256.slice(0, 32), name: basename(file), title: basename(file, '.pdf'), author: '', type: 'pdf', size: bytes.length, sha256, createdAt: new Date().toISOString(), cover: null, bytes })
  return sha256.slice(0, 24)
}
/* PR C: an EPUB in the PDF reader. A small anthology made here (invented text, no book's words): a
   cover, a contents page, a preface and two essays of running prose, the shape readers bring. */
const { zip } = await import(pathToFileURL(join(REPO, 'addbooks/web/test/make-epub.mjs')).href)
function anthologyEpub() {
  const x = body => `<?xml version="1.0" encoding="utf-8"?><html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops"><head><title>x</title></head><body><section epub:type="chapter">${body}</section></body></html>`
  const para = 'Lamplight has always posed questions about the nature of the evening, and about how the observable illumination of ordinary rooms relates to the unobservable machinery underneath it. Philosophers, engineers and unaffiliated enthusiasts have offered incompatible explanations for centuries, and the disagreement continues.'
  const docs = [
    ['contents', '<p><strong>Contents</strong></p><p><a href="preface.xhtml">Preface</a></p><p><a href="e1.xhtml">1 The Fate of Lamps</a></p><p><a href="e2.xhtml">2 Candles Considered</a></p>'],
    ['preface', `<h1>Preface</h1><p>If we really do live in a lamplit household, then where does electricity fit into that picture? How does incandescence solve the problem of twilight? How can the evening be truly local, despite illumination’s notoriously unpredictable properties? ${para}</p><p>${para}</p><p>${para}</p>`],
    ['e1', `<h1>1 The Fate of Lamps</h1><p>Modern lamps consist of two pillars, namely the filament, which explains brightness and the mutual interaction between current and glass; and the shade, which explains practically everything else. Each of them separately is superbly explanatory. ${para}</p><p>${para} ${para}</p><p>${para}</p><p>${para}</p>`],
    ['e2', `<h1>2 Candles Considered</h1><h2>Wax, Wick and the Long Evening</h2><p>${para}</p><p>${para} ${para}</p><p>${para}</p>`],
  ]
  const nav = `<?xml version="1.0"?><html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops"><body><nav epub:type="toc"><ol><li><a href="contents.xhtml">Contents</a></li><li><a href="preface.xhtml">Preface</a></li><li><a href="e1.xhtml">1 The Fate of Lamps</a></li><li><a href="e2.xhtml">2 Candles Considered</a></li></ol></nav></body></html>`
  return zip([
    ['mimetype', 'application/epub+zip'],
    ['META-INF/container.xml', '<?xml version="1.0"?><container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container"><rootfiles><rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/></rootfiles></container>'],
    ['OEBPS/content.opf', `<?xml version="1.0"?><package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="id"><metadata xmlns:dc="http://purl.org/dc/elements/1.1/"><dc:identifier id="id">anthology</dc:identifier><dc:title>Lamplight Essays</dc:title><dc:creator>Ed Itor</dc:creator><dc:language>en</dc:language></metadata><manifest><item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>${docs.map(([id]) => `<item id="${id}" href="${id}.xhtml" media-type="application/xhtml+xml"/>`).join('')}</manifest><spine>${docs.map(([id]) => `<itemref idref="${id}"/>`).join('')}</spine></package>`],
    ['OEBPS/nav.xhtml', nav],
    ...docs.map(([id, body]) => [`OEBPS/${id}.xhtml`, x(body)]),
  ])
}
const EPUB = anthologyEpub()
const json = (res, status, body) => { res.writeHead(status, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }); res.end(JSON.stringify(body)) }
const readBody = req => new Promise(r => { const parts = []; req.on('data', c => parts.push(c)); req.on('end', () => r(Buffer.concat(parts))) })
// A mocked companion, per intent, streamed as the Worker relays it: a definition for `define`, the
// sense number for `define_sense`, Quiz me's JSON and its marking, Fact-check with its "Checking
// sources…" status before the answer, and an answer with a bottom line and a citation otherwise.
// `mock.next` (set by a check) replaces the next answer's text, for the long and odd answers.
// `mock.primers`: the next primer replies, in order, each { text } | { status, body } with an optional
// `delay` (ms), for the primer's reliability runs (cut-off, empty, slow, odd shapes).
// `mock.chunks` (set by a check) streams the next answer in pieces: [{ text, wait }], then an
// error event when `mock.chunksFail` is set (Quiz me's questions arriving one by one).
export const mock = { next: null, delay: 0, primer: null, primers: [], chunks: null, chunksFail: false, fail: null }
function mockText(body) {
  const c = body?.companion || {}, intent = c.intent
  if (mock.next != null) { const t = mock.next; mock.next = null; return t }
  if (intent === 'define') return JSON.stringify({ kind: 'definition', definition: `Noun. A mocked meaning of “${c.selection}” here.` })
  if (intent === 'define_sense') return JSON.stringify({ sense: 2 })
  if (intent === 'quiz') return JSON.stringify({ questions: [
    { q: 'MOCK Q1. What does the passage name first?', answer: 'Ideas', why: 'The first kind is named first.', cite: '{p. 1}' },
    { q: 'MOCK Q2. Why are the two kinds kept apart?', answer: 'They are known differently', why: 'One is certain, one is not.', cite: '{p. 1}' },
    { q: 'MOCK Q3. Where would a new case go?', answer: 'Matters of fact', why: 'It depends on experience.', cite: '{p. 2}' } ] })
  if (intent === 'quiz_check') { const a = String(c.quiz?.answer || '').toLowerCase(); return JSON.stringify(a.includes(String(c.quiz?.expected || '').toLowerCase().split(' ')[0]) ? { verdict: 'right', feedback: 'MOCK: that is the key step.' } : { verdict: 'not_yet', feedback: 'MOCK: reread how the two kinds differ.' }) }
  // Before you start (chapter action `primer`): the primer's JSON, with citations to the unit's first page.
  if (intent === 'chapter' && c.chapter?.action?.kind === 'primer') { const n = c.context?.pages?.[0]?.n ?? 1; return JSON.stringify(mock.primer || { gist: `MOCK gist of ${c.chapter.action.unitTitle}. It says what the unit sets out to do.`, claims: [1, 2, 3].map(i => ({ text: `MOCK claim ${i} of the unit.`, cite: `{p. ${n}}` })), keepInMind: ['MOCK caution: a convention that changes later.'], map: [1, 2, 3].map(i => ({ title: `MOCK section ${i}`, pages: `p. ${n}` })) }) }
  // Related: the thread, then its places (a PDF cites pages; an EPUB quotes a few words of the fixture's chapters).
  if (intent === 'related') return c.document?.kind === 'epub'
    ? 'MOCK thread. The evening runs through the book.\n\n“Modern lamps consist of two pillars” The second essay opens on it.\n“Wax, Wick and the Long Evening” The third takes it up again.'
    : 'MOCK thread. The idea runs through the document.\n\n{p. 1} Where it is first named.\n{p. 2} Where it is used again.\n{p. 3} Where it is qualified.'
  if (intent === 'factcheck') return 'Holds. MOCK verdict line for the passage.\n\nHolds. The first claim stands as written.\n\nNote. Useful context that is not a verdict.\n\nSources: [Mock source one](https://example.org/one) · [Mock source two](https://example.org/two)'
  return 'MOCK ANSWER. The bottom line comes first {p. 1}.\n\nThen a short paragraph {p. 3}.'
}
async function mockChat(body, res) {
  // A check may make one intent fail (PR C: a failed quiz marking keeps the reader's answer).
  if (mock.fail && body?.companion?.intent === mock.fail) return json(res, 500, { error: { type: 'api_error', message: 'mock failure' } })
  if (mock.delay && !body?.stream) await new Promise(r => setTimeout(r, mock.delay))
  const c = body?.companion || {}
  if (c.intent === 'chapter' && c.chapter?.action?.kind === 'primer' && mock.primers.length) {
    const item = mock.primers.shift()
    if (item.delay) await new Promise(r => setTimeout(r, item.delay))
    if (res.destroyed || res.socket?.destroyed) return
    if (item.status) return json(res, item.status, item.body || {})
    return json(res, 200, { content: [{ type: 'text', text: item.text }], stop_reason: item.stop || 'end_turn' })
  }
  const text = mockText(body)
  if (!body?.stream) return json(res, 200, { content: [{ type: 'text', text }] })
  res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-store' })
  if (body?.companion?.intent === 'factcheck') { res.write(`event: tinct_status\ndata: ${JSON.stringify({ type: 'tinct_status', text: 'Checking sources\u2026' })}\n\n`); await new Promise(r => setTimeout(r, mock.delay || 400)) }
  else if (mock.delay) await new Promise(r => setTimeout(r, mock.delay))
  if (mock.chunks) {
    const chunks = mock.chunks, fail = mock.chunksFail; mock.chunks = null; mock.chunksFail = false
    for (const c of chunks) { await new Promise(r => setTimeout(r, c.wait || 0)); res.write(`event: content_block_delta\ndata: ${JSON.stringify({ type: 'content_block_delta', delta: { type: 'text_delta', text: c.text } })}\n\n`) }
    if (fail) return res.end(`event: error\ndata: ${JSON.stringify({ type: 'error', error: { type: 'upstream_error', message: 'The reply was interrupted. Please try again.' } })}\n\n`)
    return res.end('event: message_stop\ndata: {"type":"message_stop"}\n\n')
  }
  res.write(`event: content_block_delta\ndata: ${JSON.stringify({ type: 'content_block_delta', delta: { type: 'text_delta', text } })}\n\n`)
  res.end('event: message_stop\ndata: {"type":"message_stop"}\n\n')
}
/* ---------- Recognising a scan's text, mocked (routes/userBooks.ts /api/user-books/ocr) ----------
   As the Worker after PR D: a book not stored yet has status { state: 'none', stored: false } (with
   `scanMock.legacy` set, the 404 it answered before); pages sent are recognised at the next status
   call, from `scanMock.recognised` (hex -> the recognised pages); the edition and the pages follow. */
export const scanMock = { uploadDelay: 0, legacy: false, recognised: new Map(), jobs: new Map(), log: [] }
async function ocrRoute(req, res, [, hex, part, n]) {
  const book = account.books.find(b => b.sha256.startsWith(hex)), month = { used: 12, limit: 1500 }
  const job = scanMock.jobs.get(hex), method = req.method
  if (method === 'PUT' || method === 'POST') await readBody(req)
  scanMock.log.push([method, part || 'job', hex, !!book])
  if (!book) return !part && method === 'GET' && !scanMock.legacy ? json(res, 200, { state: 'none', pages: 0, uploaded: 0, done: 0, failed: 0, blank: 0, month, stored: false, tier: 'premium' }) : json(res, 404, { error: 'Not found' })
  const status = () => {
    if (!job) return { state: 'none', pages: 0, uploaded: 0, done: 0, failed: 0, blank: 0, month, tier: 'premium' }
    for (const k of job.ready) job.done.add(k); job.ready.clear()
    const missing = [...job.missing].sort((a, b) => a - b)
    return { state: missing.length ? 'uploading' : 'done', pages: job.pages, uploaded: job.done.size, done: job.done.size, failed: 0, blank: 0, ...(missing.length ? { missing } : {}), month, tier: 'premium' }
  }
  const pages = () => (scanMock.recognised.get(hex) || []).filter(pg => job?.done.has(pg.page))
  if (!part && method === 'GET') return json(res, 200, status())
  if (!part && method === 'POST') {
    if (!job) scanMock.jobs.set(hex, { pages: (scanMock.recognised.get(hex) || []).length, missing: new Set((scanMock.recognised.get(hex) || []).map(pg => pg.page)), ready: new Set(), done: new Set() })
    return json(res, 202, status())
  }
  if (part === 'pages' && n && method === 'PUT') { if (!job?.missing.delete(Number(n))) return json(res, 409, { error: 'not_expected' }); job.ready.add(Number(n)); return json(res, 200, { ok: true }) }
  if (!job || status().state !== 'done') return json(res, 404, { error: 'Not found' })
  if (part === 'pages') return json(res, 200, { pages: pages() })
  const text = pg => pg.blocks.filter(b => !['head', 'foot', 'num'].includes(b.t)).map(b => b.x)
  return json(res, 200, { format: 'tinct-user-edition-v1', converter: 2, source: 'ocr', title: book.title, author: '', language: 'en', droppedImages: 0, ocrLayout: { pages: pages().length, columns: 0, equations: 0 },
    chapters: [{ number: 1, title: book.title, paragraphs: pages().flatMap(text), pages: pages().flatMap(pg => text(pg).map(() => pg.page)) }] })
}
function start(port) {
  const server = createServer(async (req, res) => {
    const url = new URL(req.url, 'http://x')
    const p = url.pathname
    if (req.method === 'POST' && (p === '/api/chat' || p === '/api/lab-chat')) {
      const body = JSON.parse((await readBody(req)).toString() || '{}'); account.requests.push({ path: p, body })
      return await mockChat(body, res)
    }
    if (p === '/__margin/anthology.epub') { res.writeHead(200, { 'Content-Type': 'application/epub+zip', 'Cache-Control': 'no-store' }); return res.end(EPUB) }
    if (p === '/api/user-books' && req.method === 'POST') {
      // An upload (Add a book's account copy), stored after `scanMock.uploadDelay` ms: the first-open race.
      const bytes = await readBody(req), sha256 = createHash('sha256').update(bytes).digest('hex')
      if (scanMock.uploadDelay) await new Promise(r => setTimeout(r, scanMock.uploadDelay))
      const name = decodeURIComponent(req.headers['x-book-name'] || 'scan.pdf')
      if (!account.books.some(b => b.sha256 === sha256)) account.books.push({ id: sha256.slice(0, 32), name, title: name.replace(/\.pdf$/i, ''), author: '', type: 'pdf', size: bytes.length, sha256, createdAt: new Date().toISOString(), cover: null, bytes })
      const { bytes: _b, ...book } = account.books.find(b => b.sha256 === sha256)
      return json(res, 200, { book })
    }
    if (p === '/api/user-books') return json(res, 200, { books: account.books.map(({ bytes, ...b }) => b) })
    const ocrPath = /^\/api\/user-books\/ocr\/([0-9a-f]{24})(?:\/(edition|pages)(?:\/(\d+))?)?$/.exec(p)
    if (ocrPath) return ocrRoute(req, res, ocrPath)
    if (p === '/api/user-books/places') return json(res, 200, { places: {} })
    if (p.startsWith('/api/user-books/places/') || p.startsWith('/api/user-books/covers/')) { await readBody(req); return json(res, 200, { place: null, cover: null }) }
    for (const [kind, field] of [['marks', 'marks'], ['cards', 'cards']]) if (p.startsWith(`/api/user-books/${kind}/`)) {
      // As the Worker: one versioned set per book; a stale revision gets 409 and the stored set.
      const hex = p.slice(`/api/user-books/${kind}/`.length), have = account[kind].get(hex) || { [field]: [], rev: 0 }
      if (req.method === 'GET') return json(res, 200, have)
      const body = JSON.parse((await readBody(req)).toString() || '{}')
      // A check may make the account fail (PR C: the reader is told when sync fails for any reason but a conflict).
      if (account.fail === kind) return json(res, 500, { error: 'Service unavailable' })
      if (body.rev !== have.rev) return json(res, 409, { error: 'conflict', ...have })
      account[kind].set(hex, { [field]: body[field], rev: have.rev + 1 }); return json(res, 200, { rev: have.rev + 1 })
    }
    if (p.startsWith('/api/user-books/primers/')) {
      // As the Worker: one stored primer per book and unit, the owner's only; `primer: null` when none (PR C); PUT validates and stamps.
      const key = p.slice('/api/user-books/primers/'.length) + '?' + url.searchParams.get('unit')
      if (req.method === 'GET') return json(res, 200, { primer: account.primers.get(key) || null })
      const body = JSON.parse((await readBody(req)).toString() || '{}'), content = PRIMER_PARSE.normalizePrimer(body.primer)
      if (!content) return json(res, 400, { error: 'invalid_primer' })
      const primer = { ...content, madeAt: new Date().toISOString(), unitKey: url.searchParams.get('unit') }
      account.primers.set(key, primer); return json(res, 200, { primer })
    }
    if (p.startsWith('/api/user-books/')) { const b = account.books.find(x => x.id === p.slice('/api/user-books/'.length)); if (!b) return json(res, 404, { error: 'Not found' }); res.writeHead(200, { 'Content-Type': 'application/pdf' }); return res.end(b.bytes) }
    if (p.startsWith('/api/')) return json(res, 404, { error: 'Not found' })
    if (p === '/library') { res.writeHead(200, { 'Content-Type': 'text/html' }); return res.end('<!doctype html><title>Library</title>') }
    let file = p.startsWith('/docs/margin/') ? join(REPO, normalize(p)) : join(PUBLIC, normalize(decodeURIComponent(p)))
    if (existsSync(file) && statSync(file).isDirectory()) file = join(file, 'index.html')
    if (!existsSync(file) || !(file.startsWith(PUBLIC) || file.startsWith(join(REPO, 'docs/margin')))) { res.writeHead(404); return res.end('Not found') }
    res.writeHead(200, { 'Content-Type': TYPES[extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' })
    res.end(readFileSync(file))
  })
  return new Promise(r => server.listen(port, '127.0.0.1', () => r(server)))
}

/* ---------- The reader, signed in, with a PDF from the account ---------- */
const SESSION = { access_token: 'test-token', refresh_token: 'x', token_type: 'bearer', expires_in: 3600, expires_at: Math.floor(Date.now() / 1000) + 36000, user: { id: '00000000-0000-4000-8000-000000000001', email: 'reader@example.com', user_metadata: {} } }
async function readerPage(browser, origin, hex, { width, height, look, startPage = 1, zoom = 1, minSpans = 20 }) {
  // Browser zoom: the CSS viewport shrinks by the zoom and each CSS pixel takes `zoom` device pixels.
  const phone = width < 700
  const ctx = await browser.newContext({ viewport: { width: Math.round(width / zoom), height: Math.round(height / zoom) }, deviceScaleFactor: zoom, hasTouch: phone, isMobile: false })
  await ctx.addInitScript(([session, look, hex]) => {
    try {
      localStorage.setItem('sb-local-auth-token', JSON.stringify(session))
      // The reader's choice for this PDF: its pages (a text PDF otherwise opens as Tinct text in the Tinct reader).
      localStorage.setItem('tinct-addbook:edition:' + hex, JSON.stringify('pages'))
      const theme = { paper: 'light', book: 'book', night: 'dark', eink: 'light' }[look]
      localStorage.setItem('tinct-lab-prefs', JSON.stringify({ theme }))
      localStorage.setItem('tinct:display-profile', look === 'eink' ? 'eink' : 'normal')
    } catch {}
  }, [SESSION, look, hex])
  const page = await ctx.newPage()
  const problems = []
  page.on('pageerror', e => problems.push('pageerror: ' + e.message))
  await page.goto(`${origin}/lab/addbook/?userBook=${hex}${look === 'eink' ? '&eink=1' : ''}`)
  await page.waitForFunction(n => document.querySelectorAll('.pdf-sheet .text-layer span').length > n, minSpans, { timeout: 30000 })
  await page.evaluate(() => document.fonts.ready)
  // The docked chat opens by itself on the desktop; the margin pieces sit left of it. Past a title page, to running text.
  await page.waitForTimeout(600)
  if (startPage > 1) { await page.evaluate(n => goTo({ page: n, frac: 0.05 }), startPage); await page.waitForTimeout(800) }
  return { ctx, page, problems }
}
// Select words on the first text page in view: `words` words from a long span, or one word.
async function selectText(page, { oneWord = false, near = 'middle' } = {}) {
  return page.evaluate(({ oneWord, near }) => {
    const spans = [...document.querySelectorAll('.pdf-sheet .text-layer span')].filter(s => {
      const r = s.getBoundingClientRect(); const t = s.textContent || ''
      return r.top > 120 && r.bottom < innerHeight - 140 && r.left > 0 && r.right < innerWidth && (oneWord ? /(?<=^|\s)[a-z]{5,}(?=[\s,.;:]|$)/ : /[A-Za-z]{5,}/).test(t) && t.trim().split(/\s+/).length >= (oneWord ? 1 : 4)
    })
    if (!spans.length) return null
    const span = near === 'top' ? spans[0] : near === 'bottom' ? spans[spans.length - 1] : spans[Math.floor(spans.length / 2)]
    const node = span.firstChild, t = node.textContent
    let a, b
    if (oneWord) { const m = /(?<=^|\s)[a-z]{5,}(?=[\s,.;:]|$)/.exec(t) || /[A-Za-z]{5,}/.exec(t); a = m.index; b = a + m[0].length }
    else { const next = spans[spans.indexOf(span) + 1]; if (next && next.firstChild) { getSelection().setBaseAndExtent(node, 0, next.firstChild, next.firstChild.textContent.length); return getSelection().toString() } a = 0; b = t.length }
    getSelection().setBaseAndExtent(node, a, node, b)
    return getSelection().toString()
  }, { oneWord, near })
}
const shot = async (page, name) => { const path = join(OUT, name + '.png'); await page.screenshot({ path }); return path }

async function readerMatrix(browser, origin) {
  const rows = []
  for (const pdf of PDFS) {
    const hex = addBook(pdf), label = basename(pdf, '.pdf')
    const pi = PDFS.indexOf(pdf)
    const combos = SAMPLE ? VIEWPORTS.map(([w, h], i) => [w, h, rotate(LOOKS, i + pi)]) : VIEWPORTS.flatMap(([w, h]) => LOOKS.map(l => [w, h, l]))
    for (const [width, height, look] of combos) {
      const tag = `${label}-${width}x${height}-${look}`
      let opened
      try { opened = await readerPage(browser, origin, hex, { width, height, look }) }
      catch (e) { rows.push({ pdf: label, viewport: `${width}×${height}`, look, problems: 1, details: [{ state: 'open', kind: 'error', el: String(e.message || e).slice(0, 200) }], screenshots: {} }); console.log(`${tag}: could not open`); continue }
      const { ctx, page, problems } = opened
      const found = []
      const states = {}
      const check = async (state, ready) => {
        await page.waitForSelector(ready, { timeout: 8000 })
        await page.waitForTimeout(250)
        const list = await checkMargin(page)
        found.push(...list.map(p => ({ state, ...p })))
        const keep = (width === 1440 && height === 900) || (width === 390 && height === 844)
        states[state] = keep ? await shot(page, `${tag}-${state}`) : null
      }
      try {
        // The bar.
        // Running text in view: page 1, else the next pages (past a title page or a figure).
        const pick = async opts => { for (let n = 1; n <= 4; n++) { const got = await selectText(page, opts); if (got) return got; await page.evaluate(k => goTo({ page: k, frac: 0.05 }), n + 1); await page.waitForTimeout(1200) } return null }
        if (!await pick()) throw new Error('no text to select')
        await check('bar', '.mr-bar, .mr-pbar')
        // More.
        await page.click('.mr-float [data-m="more"]')
        await check('more', '.mr-more, .mr-pmore')
        await page.keyboard.press('Escape')
        // Typing opens Ask with that letter (desktop keyboards).
        if (width >= 700) {
          await page.keyboard.press('W'); await check('ask', '.mr-bar.is-asking'); await page.keyboard.press('Escape')
          // Escape steps back to the bar, which stays even when a late selectionchange arrives
          // (a slow machine's debounce fired after Escape and closed it).
          await page.evaluate(() => document.dispatchEvent(new Event('selectionchange'))); await page.waitForTimeout(450)
          if (!await page.$('.mr-float.mr-bar [data-m="note"]')) throw new Error('the bar closed after Escape from Ask')
        }
        // The note editor.
        await page.click('.mr-float [data-m="note"]')
        await check('note', '.mr-note')
        await page.keyboard.press('Escape'); await page.keyboard.press('Escape')
        await page.mouse.click(5, height - 5)
        // Define.
        if (!await pick({ oneWord: true })) throw new Error('no word to select')
        await check('define', '.mr-define .mr-define__senses, .mr-define .mr-define__body p:not(.mr-define__wait)')
      } catch (e) { found.push({ state: 'run', kind: 'error', el: String(e.message || e) }) }
      rows.push({ pdf: label, viewport: `${width}×${height}`, look, problems: found.length + problems.length, details: [...found, ...problems], screenshots: states })
      const all = [...found, ...problems]
      console.log(`${tag}: ${all.length} problem(s)`, process.env.VERBOSE ? JSON.stringify(all) : all.length ? JSON.stringify(all).slice(0, 1500) : '')
      await ctx.close()
    }
  }
  return rows
}

async function fixtureRows(browser, origin) {
  const rows = []
  for (const look of LOOKS) {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 3200 }, deviceScaleFactor: 1 })
    const page = await ctx.newPage()
    await page.goto(`${origin}/lab/addbook/margin-fixture.html?look=${look}`)
    await page.waitForFunction(() => document.documentElement.dataset.ready === 'true')
    const list = await checkMargin(page, { ...SELECTORS, frame: '.strip-frame, .ph, .dk, .cardbg' })
    rows.push({ fixture: 'margin-fixture.html', look, problems: list.length, details: list, screenshot: await shot(page, `fixture-${look}`) })
    console.log(`fixture ${look}: ${list.length} problem(s)`)
    await ctx.close()
  }
  return rows
}

// Each fixture frame beside the mockup's same frame, at the same pixel size. The mockup sets its
// controls in Inter (the stand-in it uses for the Apple system face); the fixture is given the same
// face here so the pair compares spacing, size, weight and colour rather than this machine's fonts.
const PAIRS = [['bar', '[data-strip="a"]'], ['asking', '[data-strip="b"]'], ['more', '[data-strip="c"]'], ['highlight', '[data-strip="d"]'], ['define', '[data-strip="e"]'], ['phone-bar', '[data-ph="a"]'], ['phone-more', '[data-ph="b"]'],
  // PR 2: the column (mockup section 2), crowding (3), the phone's answer and chat cards (5 C, D) and the new answers (6).
  ['column', '[data-desk="margin"]'], ['crowded', '[data-desk="overlap"]'], ['phone-answer', '[data-ph="c"]'], ['phone-chat', '[data-ph="d"]'],
  // PR 3: Before you start (mockup section 4).
  ['trigger', '[data-desk="trigger"]'], ['primer', '[data-desk="primer"]'],
  ...['simplify', 'factcheck', 'counterpoint', 'quiz', 'quiz-answered'].map((k, i) => [`card-${k}`, `.cardrow .step:nth-child(${i + 1}) .cardbg`, `[data-cards="mockup"] [data-card="${k}"]`])]
// Composed from existing pieces (no mockup frame): each state shown on its own.
const COMPOSED = [['note', '[data-strip="f"]'], ['phone-define', '[data-ph="e"]'], ['phone-note', '[data-ph="f"]'], ['marks', '[data-desk="marks"]'],
  ['trigger-cards', '[data-desk="trigger-cards"]'], ['primer-long', '[data-desk="primer-long"]'], ['primer-wait', '[data-desk="primer-wait"]'], ['primer-narrow', '[data-desk="primer-narrow"]'], ['phone-trigger', '[data-ph="g"]'], ['phone-primer', '[data-ph="h"]'], ['phone-primer-full', '[data-ph="i"]'], ...['factcheck-checking', 'factcheck-six', 'quiz-shown', 'quiz-marking', 'quiz-done', 'explain', 'define', 'note', 'whole', 'folded'].map(k => [`card-${k}`, `[data-card="${k}"]`])]
async function pairs(browser, origin) {
  const out = []
  for (const look of ['paper', 'night']) {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 3600 }, deviceScaleFactor: 1 })
    const mock = await ctx.newPage(), fix = await ctx.newPage()
    await mock.goto(`${origin}/docs/margin/mockup.html${look === 'night' ? '#night' : ''}`); await mock.waitForTimeout(1500)
    await fix.goto(`${origin}/lab/addbook/margin-fixture.html?look=${look}`)
    await fix.addStyleTag({ url: 'https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=STIX+Two+Text:ital,wght@0,400;0,600;1,400&family=Inter:wght@400;500&display=swap' }).catch(() => {})
    await fix.addStyleTag({ content: '.mr { --mr-ui: Inter, -apple-system, system-ui, sans-serif; }' })
    await fix.waitForFunction(() => document.documentElement.dataset.ready === 'true'); await fix.evaluate(() => document.fonts.ready); await fix.waitForTimeout(800)
    // Draw the fixture again now the fonts are in, so the pieces are measured in them.
    await fix.evaluate(() => new Promise(r => { const s = document.createElement('script'); s.src = 'js/margin-fixture.js?again=' + Date.now(); s.onload = r; document.body.appendChild(s) }))
    await fix.waitForTimeout(500)
    // A blinking caret is caught on or off; both sides show it on.
    for (const pg of [mock, fix]) await pg.addStyleTag({ content: '*, *::after { animation: none !important; }' })
    const comp = await ctx.newPage()
    const only = process.env.PAIRS_ONLY ? process.env.PAIRS_ONLY.split(',') : null
    for (const [name, sel, fixSel] of [...PAIRS, ...COMPOSED].filter(p => !only || only.includes(p[0]))) {
      const a = join(OUT, `pair-${name}-${look}-mockup.png`), b = join(OUT, `pair-${name}-${look}-fixture.png`)
      const inMock = PAIRS.some(p => p[0] === name)
      if (inMock) await mock.locator(sel).first().screenshot({ path: a })
      await fix.locator(fixSel || `${sel}:not([data-pr])`).first().screenshot({ path: b })
      const side = join(OUT, `pair-${name}-${look}.png`)
      const img = f => `data:image/png;base64,${readFileSync(f).toString('base64')}`
      await comp.setContent(`<body style="margin:0;background:#141414"><div id="pair" style="display:inline-flex;gap:24px;padding:16px;color:#ddd;font:13px sans-serif">${inMock ? `<figure style="margin:0"><figcaption>mockup · ${name} · ${look}</figcaption><img src="${img(a)}"></figure>` : ''}<figure style="margin:0"><figcaption>fixture · ${name} · ${look}${inMock ? '' : ' (no mockup frame: composed from existing pieces)'}</figcaption><img src="${img(b)}"></figure></div></body>`)
      await comp.locator('#pair').screenshot({ path: side })
      out.push(side)
    }
    await ctx.close()
  }
  return out
}

/* ---------- Behaviour: the bar, Ask, Explain, the dot, notes, sync, Define offline, Copy quote ---------- */
async function behaviour(browser, origin) {
  const results = []
  const ok = (name, pass, detail) => { results.push({ name, pass: !!pass, ...(pass ? {} : { detail }) }); console.log(`${pass ? 'ok  ' : 'FAIL'} ${name}${pass ? '' : ' ' + String(JSON.stringify(detail)).slice(0, 300)}`) }
  const hex = addBook(PDFS[0])
  const lastChat = () => account.requests.filter(r => r.path === '/api/chat' || r.path === '/api/lab-chat').at(-1)
  const hl = page => page.evaluate(h => JSON.parse(localStorage.getItem('tinct-addbook:hl:pdf:' + h) || '[]'), hex)
  const fresh = async page => { await page.keyboard.press('Escape'); await page.keyboard.press('Escape'); await page.evaluate(() => getSelection().removeAllRanges()); await page.waitForTimeout(300) }
  const A = await readerPage(browser, origin, hex, { width: 1440, height: 900, look: 'paper' })
  const a = A.page
  await A.ctx.grantPermissions(['clipboard-read', 'clipboard-write'], { origin })
  // Typing with a selection opens Ask with that key; Return sends today's ask with the passage.
  const text = await selectText(a); await a.waitForSelector('.mr-bar')
  await a.keyboard.press('W'); await a.waitForSelector('.mr-bar.is-asking .mr-ask')
  ok('typing with a selection opens Ask with that character, no click', await a.inputValue('.mr-ask') === 'W')
  await a.keyboard.type('hy so?'); await a.keyboard.press('Shift+Enter'); await a.keyboard.type('Really')
  ok('Shift-Return breaks a line in the question', (await a.inputValue('.mr-ask')) === 'Why so?\nReally')
  const width = await a.evaluate(() => document.querySelector('.mr-bar.is-asking').getBoundingClientRect().width)
  ok('the question field is at least 330px and at most 520px', width >= 330 && width <= 520, width)
  await a.keyboard.press('Escape')
  ok('Escape returns from Ask to the menu', await a.isVisible('.mr-bar:not(.is-asking) [data-m="explain"]'))
  await a.keyboard.press('Q'); await a.keyboard.type('uestion?'); const before = account.requests.length; await a.keyboard.press('Enter')
  await a.waitForFunction(n => true, null); await a.waitForTimeout(1500)
  const asked = account.requests.slice(before).find(r => /Question\?/.test(JSON.stringify(r.body.messages)))
  ok('Return sends the question with the passage, as an Ask card in the margin (PR 2)', asked && JSON.stringify(asked.body).includes(text.replace(/\s+/g, ' ').trim().slice(0, 20)) && await a.isVisible('.mr-col .mr-card.is-open .mr-you') && !(await a.$('.byob-dock')), { text, asked: !!asked })
  ok('every PDF request sends kind "pdf" and its pages with their labels', asked?.body?.companion?.context?.kind === 'pdf' && Array.isArray(asked.body.companion.context.pages) && asked.body.companion.context.pages.every(p => p.n != null && typeof p.text === 'string'), asked?.body?.companion?.context)
  await fresh(a)
  // Explain: today's Explain request in the docked chat.
  await selectText(a); await a.waitForSelector('.mr-bar'); const n2 = account.requests.length
  await a.click('.mr-bar [data-m="explain"]'); await a.waitForTimeout(1500)
  const ex = account.requests.slice(n2).find(r => r.body?.companion?.intent === 'explain')
  const P = await import(pathToFileURL(join(PUBLIC, 'lab/margin/margin-parse.js')).href)
  // FIXES-2026-10-15 A2: the Worker's explain intent (it writes the PDF wording), streamed, never today's ask.
  ok('Explain sends the explain intent with the selection and the PDF\'s pages, streamed, writing no prompt itself', ex && ex.body.stream === true && ex.body.companion.selection && ex.body.companion.context.kind === 'pdf' && !JSON.stringify(ex.body).includes(P.PDF_EXPLAIN_FORMAT_BEFORE) && !account.requests.slice(n2).some(r => /Explain the passage they selected/.test(JSON.stringify(r.body))), ex?.body?.companion && { ...ex.body.companion, context: undefined, document: undefined })
  // FIXES-2026-10-15 A1: the whole file rides on every margin request, the same bytes each time.
  const pages = await a.evaluate(() => state.pages.length)
  const docs = account.requests.filter(r => r.body?.companion?.document).map(r => JSON.stringify(r.body.companion.document))
  ok('every margin request so far carries the whole PDF, page by page, byte for byte the same', ex?.body?.companion?.document?.kind === 'pdf' && ex.body.companion.document.units.length === pages && !ex.body.companion.document.part && docs.length >= 2 && docs.every(d => d === docs[0]), { pages, units: ex?.body?.companion?.document?.units?.length, sent: docs.length, same: new Set(docs).size })
  // FIXES-2026-10-15 A4: one picture of the passage, cropped to it, at most 1568 px.
  const pic = (ex?.body?.messages?.at(-1)?.content || []).filter?.(b => b.type === 'image') || []
  const side = pic[0] ? await a.evaluate(async src => { const img = new Image(); img.src = `data:${src.media_type};base64,${src.data}`; await img.decode().catch(() => {}); return Math.max(img.naturalWidth, img.naturalHeight) }, pic[0].source) : 0
  ok('Explain sends one picture of the passage, cropped (not the whole page), at most 1568 px', pic.length === 1 && side > 0 && side <= 1568 && pic[0].source.data.length < 1_500_000, { images: pic.length, side })
  ok('Explain opens as a card, its first sentence in weight 600', await a.isVisible('.mr-col .mr-card.is-open .is-bottom-line') && (await a.evaluate(() => getComputedStyle(document.querySelector('.mr-card.is-open .is-bottom-line')).fontWeight)) === '600')
  // A citation tag scrolls the PDF to its page.
  const tag = await a.evaluate(() => [...document.querySelectorAll('.mr-card.is-open .mr-cite')].map(b => [b.textContent, b.dataset.page]))
  await a.click('.mr-card.is-open .mr-cite >> nth=1').catch(() => {}); await a.waitForTimeout(900)
  ok('citation tags ({p. 3}) show as tags and scroll the PDF to that page', JSON.stringify(tag) === JSON.stringify([['p. 1', '1'], ['p. 3', '3']]) && (await a.evaluate(() => currentPlace().page)) === 3, { tag, page: await a.evaluate(() => currentPlace().page) })
  await fresh(a)
  // Simplify in the bar; Fact-check, Counterpoint and Quiz me in More: each a Worker intent on the passage, kind "pdf".
  for (const [intent, from] of [['simplify', 'bar'], ['counterpoint', 'more'], ['factcheck', 'more'], ['related', 'more'], ['quiz', 'more']]) {
    await a.evaluate(() => { goTo({ page: 1, frac: 0 }); col.open = null }); await a.waitForTimeout(300)
    await selectText(a); await a.waitForSelector('.mr-bar'); const k = account.requests.length
    if (intent === 'factcheck') mock.delay = 1500
    if (from === 'more') { await a.click('.mr-bar [data-m="more"]'); await a.waitForSelector('.mr-more'); await a.click(`.mr-more [data-m="${intent}"]`) } else await a.click(`.mr-bar [data-m="${intent}"]`)
    if (intent === 'factcheck') { await a.waitForTimeout(700); ok('Fact-check shows "Checking sources…" while the search runs (tinct_status)', /Checking sources…/.test(await a.innerText('.mr-card.is-open'))) }
    await a.waitForTimeout(intent === 'factcheck' ? 1800 : 900); mock.delay = 0
    const req = account.requests.slice(k).find(r => r.body?.companion?.intent === intent)
    ok(`${intent}: the Worker intent with the selection and the PDF's pages`, req && req.body.companion.selection && req.body.companion.context.kind === 'pdf' && req.body.companion.context.pages.length >= 1 && !req.body.system, req?.body?.companion && { ...req.body.companion, context: undefined })
    const label = await a.innerText('.mr-card.is-open .mr-card__label').catch(() => '')
    ok(`${intent}: its answer opens as a card labelled with the action`, label.startsWith({ simplify: 'Simplify', counterpoint: 'Counterpoint', factcheck: 'Fact-check', related: 'Related', quiz: 'Quiz me' }[intent]), label)
    if (intent === 'related') {
      // PR C, Related (A5): no web search, the whole document, a passage picture; rows that scroll there and underline the place.
      const rows = await a.evaluate(() => [...document.querySelectorAll('.mr-card.is-open .mr-related__row')].map(r => [r.tagName, r.dataset.page, r.querySelector('.mr-related__tag')?.textContent, r.querySelector('.mr-related__line')?.textContent]))
      ok('Related: the bottom line, then one row per place, its tag on the left and its line', rows.length === 3 && rows.every(r => r[0] === 'BUTTON') && rows.map(r => r[2]).join('|') === 'p. 1|p. 2|p. 3' && req?.body?.companion?.document?.kind === 'pdf' && (req.body.messages?.at(-1)?.content || []).filter?.(b => b.type === 'image').length === 1, { rows, intent: req?.body?.companion?.intent })
      const gap = await a.evaluate(() => { const r = [...document.querySelectorAll('.mr-card.is-open .mr-related__line')].map(x => x.getBoundingClientRect()); return [r[1].top - r[0].bottom, getComputedStyle(document.querySelector('.mr-related__line')).fontSize] })
      ok('Related: rows read 6px apart, the line in 15px', Math.abs(gap[0] - 6) <= 1.5 && gap[1] === '15px', gap)
      await a.click('.mr-card.is-open .mr-related__row[data-page="3"]'); await a.waitForTimeout(1300)
      ok('Related: a row scrolls the PDF to its place and underlines it for a moment', (await a.evaluate(() => currentPlace().page)) === 3 && await a.evaluate(() => document.querySelectorAll('.mr-flash-layer i').length > 0), await a.evaluate(() => [currentPlace(), document.querySelectorAll('.mr-flash-layer i').length]))
      await a.evaluate(() => { openCard(null); const c = keptCards().find(x => x.kind === 'related'); const f = TinctMargin.firstRect(c); goTo({ page: f[0], frac: Math.max(0, f[2] - 0.1) }) }); await a.waitForTimeout(700)
      const folded = await a.evaluate(() => [...document.querySelectorAll('.mr-col .mr-card.is-folded .mr-card__label')].map(l => l.textContent).find(t => t.startsWith('Related')))
      ok('Related, folded, reads "Related · 3 places"', folded === 'Related · 3 places', folded)
    }
    await fresh(a)
  }
  const fcText = await a.evaluate(() => { const c = keptCards().find(x => x.kind === 'factcheck'); openCard(c.id); return true }).then(() => a.waitForTimeout(300)).then(() => a.evaluate(() => ({ verdict: getComputedStyle(document.querySelector('.mr-card.is-open .mr-verdict')).fontStyle, links: [...document.querySelectorAll('.mr-card.is-open .mr-sources a')].map(x => x.textContent), font: getComputedStyle(document.querySelector('.mr-card.is-open .mr-sources')).fontSize })))
  ok('Fact-check: verdict words in italic, the sources as plain links in 12px', fcText.verdict === 'italic' && fcText.links.join('|') === 'Mock source one|Mock source two' && fcText.font === '12px', fcText)
  // Quiz me: "1 of 3", answered in the follow-up line (quiz_check), Show answer without a call, then the score.
  await a.evaluate(() => { const c = keptCards().find(x => x.kind === 'quiz'); openCard(c.id) }); await a.waitForTimeout(300)
  ok('Quiz me shows "1 of 3" and the question at 18px', (await a.innerText('.mr-card.is-open .mr-card__count')) === '1 of 3' && (await a.evaluate(() => getComputedStyle(document.querySelector('.mr-card.is-open .mr-question')).fontSize)) === '18px')
  const q0 = account.requests.length
  await a.click('.mr-card.is-open .mr-follow__input'); await a.keyboard.type('Ideas'); await a.keyboard.press('Enter'); await a.waitForTimeout(900)
  const check = account.requests.slice(q0).find(r => r.body?.companion?.intent === 'quiz_check')
  ok('an answer is marked by quiz_check: the bubble, then "Right." and the cite', check?.body?.companion?.quiz?.answer === 'Ideas' && /Ideas[\s\S]*Right\./.test(await a.innerText('.mr-card.is-open')) && !!(await a.$('.mr-card.is-open [data-c="next"]')), check?.body?.companion?.quiz)
  await a.click('.mr-card.is-open [data-c="next"]'); await a.waitForTimeout(300)
  const q1 = account.requests.length
  await a.click('.mr-card.is-open [data-c="show"]'); await a.waitForTimeout(300)
  ok('Show answer shows the answer without a call', account.requests.length === q1 && /They are known differently/.test(await a.innerText('.mr-card.is-open')))
  await a.click('.mr-card.is-open [data-c="next"]'); await a.waitForTimeout(300)
  // PR C: a marking that fails shows its error and keeps the reader's answer in the field.
  mock.fail = 'quiz_check'
  await a.click('.mr-card.is-open .mr-follow__input'); await a.keyboard.type('a failed try'); await a.keyboard.press('Enter'); await a.waitForTimeout(900)
  mock.fail = null
  ok('a failed marking shows its error and keeps the typed answer', /could not be loaded/.test(await a.innerText('.mr-card.is-open')) && (await a.inputValue('.mr-card.is-open .mr-follow__input')) === 'a failed try', { card: await a.innerText('.mr-card.is-open'), field: await a.inputValue('.mr-card.is-open .mr-follow__input').catch(() => null) })
  await a.fill('.mr-card.is-open .mr-follow__input', ''); await a.click('.mr-card.is-open .mr-follow__input'); await a.keyboard.type('no idea'); await a.keyboard.press('Enter'); await a.waitForTimeout(900)
  ok('the last question\'s link reads "See your score →"', (await a.innerText('.mr-card.is-open [data-c="next"]')) === 'See your score →')
  await a.click('.mr-card.is-open [data-c="next"]'); await a.waitForTimeout(300)
  const score = await a.innerText('.mr-card.is-open')
  // Q1 right, Q2 shown, Q3 not yet: one right of the two answered, one shown, and Q3 ("not yet" first) to reread.
  ok('after question 3: the score, leaving out the shown answer ("1 of 2 answered, 1 shown"), and the question to reread', /^Quiz me · p\. \S+\s*×\s*1 of 2 answered, 1 shown\s*MOCK Q3/.test(score) && (await a.evaluate(() => getComputedStyle(document.querySelector('.mr-card.is-open .is-bottom-line')).fontWeight)) === '600', score)
  if (!process.env.NO_SHOTS) await shot(a, 'prc-quiz-end-1440x900')
  const q2 = account.requests.length
  await a.click('.mr-card.is-open [data-c="again"]'); await a.waitForTimeout(1200)
  ok('"Try another quiz" writes new questions on the same passage, in the same card', account.requests.slice(q2).some(r => r.body?.companion?.intent === 'quiz' && r.body.companion.selection) && (await a.innerText('.mr-card.is-open .mr-card__count')) === '1 of 3')
  await fresh(a)
  // FIXES-2026-10-15 A7: Quiz me streams. Question 1 shows before the stream ends; answering ahead shows
  // "Writing the next question…" at the same card height, no ring; the quiz is saved once, when it ends.
  {
    const Q = [1, 2, 3].map(n => ({ q: `MOCK streamed Q${n}?`, answer: n === 1 ? 'Ideas' : `A${n}`, why: 'Because.', cite: '{p. 1}' }))
    const j = JSON.stringify({ questions: Q }), cut1 = j.indexOf('{"q":"MOCK streamed Q2'), cut2 = j.indexOf('{"q":"MOCK streamed Q3')
    const run = async (chunks, fail) => {
      await selectText(a); await a.waitForSelector('.mr-bar'); mock.chunks = chunks; mock.chunksFail = fail
      await a.click('.mr-bar [data-m="more"]'); await a.waitForSelector('.mr-more'); await a.click('.mr-more [data-m="quiz"]')
      await a.waitForFunction(() => /MOCK streamed Q1/.test(document.querySelector('.mr-card.is-open')?.innerText || ''), null, { timeout: 4000 }).catch(() => {})
    }
    const saved = () => a.evaluate(() => keptCards().filter(c => c.kind === 'quiz').map(c => ({ id: c.id, n: c.data?.questions?.length || 0, ended: !!c.data?.ended, done: !!c.data?.done })))
    const before = (await saved()).length
    await run([{ text: j.slice(0, cut1), wait: 100 }, { text: j.slice(cut1, cut2), wait: 2500 }, { text: j.slice(cut2), wait: 800 }], false)
    const shown = await a.innerText('.mr-card.is-open').catch(() => '')
    const mid = (await saved()).slice(before)
    ok('Quiz me (streamed): question 1 shows, "1 of 3", while the rest is written; nothing saved yet', /MOCK streamed Q1/.test(shown) && /1 of 3/.test(shown) && mid.length === 1 && mid[0].n === 0, { shown, mid })
    // While it streams it never folds to a row or gathers, even folded among other cards (B's crowding).
    const streaming = await a.evaluate(() => {
      const id = [...col.quiz.keys()][0]; if (!id) return null
      openCard(null); layoutNow()
      const el = col.els.get(id), r = { folded: el?.classList.contains('is-folded'), row: el?.classList.contains('is-row'), hidden: !el || el.hidden, gathered: (document.querySelector('.mr-stack:not([hidden])')?.dataset.first || '') === id }
      openCard(id); layoutNow(); return r
    })
    ok('a quiz still streaming never folds to a row or gathers', streaming && !streaming.row && !streaming.hidden && !streaming.gathered, streaming)
    await a.click('.mr-card.is-open .mr-follow__input'); await a.keyboard.type('Ideas'); await a.keyboard.press('Enter'); await a.waitForTimeout(700)
    const h0 = await a.evaluate(() => document.querySelector('.mr-card.is-open').getBoundingClientRect().height)
    await a.click('.mr-card.is-open [data-c="next"]'); await a.waitForTimeout(200)
    const wait = await a.evaluate(() => { const el = document.querySelector('.mr-card.is-open'); return { text: el.innerText, h: el.getBoundingClientRect().height, ring: !!el.querySelector('.tinct-wait-ring') } })
    ok('answering ahead: "Writing the next question…", the card keeps its height, no ring', /Writing the next question…/.test(wait.text) && Math.abs(wait.h - h0) <= 1 && !wait.ring, { h0, wait })
    await a.waitForFunction(() => /MOCK streamed Q2/.test(document.querySelector('.mr-card.is-open')?.innerText || ''), null, { timeout: 5000 }).catch(() => {})
    ok('question 2 takes its place when it arrives, "2 of 3"', /MOCK streamed Q2/.test(await a.innerText('.mr-card.is-open')) && /2 of 3/.test(await a.innerText('.mr-card.is-open')))
    await a.waitForTimeout(1300)
    const end = (await saved()).slice(before)
    ok('the quiz is saved once the stream ends: three questions and the answer given meanwhile', end.length === 1 && end[0].n === 3 && await a.evaluate(id => keptCards().find(c => c.id === id).data.results[0]?.verdict === 'right', end[0].id), end)
    await fresh(a)
    // A stream that stops after question 1: it stays, and the quiz ends there with the score.
    await run([{ text: j.slice(0, cut1), wait: 100 }, { text: j.slice(cut1, cut1 + 20), wait: 300 }], true)
    await a.waitForTimeout(700)
    const cut = (await saved()).slice(before + 1)
    const txt = await a.innerText('.mr-card.is-open').catch(() => '')
    ok('stopped after question 1: it stays, "1 of 1", "See your score", no error; saved with one question', cut.length === 1 && cut[0].n === 1 && cut[0].ended && /MOCK streamed Q1/.test(txt) && /1 of 1/.test(txt) && !/could not be loaded/.test(txt), { cut, txt })
    await a.click('.mr-card.is-open [data-c="show"]').catch(() => {}); await a.waitForTimeout(200)
    ok('"See your score" on the last question that arrived', /See your score/.test(await a.innerText('.mr-card.is-open')))
    await a.click('.mr-card.is-open [data-c="next"]').catch(() => {}); await a.waitForTimeout(300)
    // PR C: a "Show answer" question is not scored, and the end card says so.
    ok('the score covers what was answered, a shown answer left out: "1 of 1 shown", and "Try another quiz"', /1 of 1 shown/.test(await a.innerText('.mr-card.is-open')) && !!(await a.$('.mr-card.is-open [data-c="again"]')), await a.innerText('.mr-card.is-open'))
    await fresh(a)
  }
  // The whole PDF: "/" focuses the column's foot; its answer opens as the "Whole PDF" card at the top.
  await a.evaluate(() => getSelection().removeAllRanges()); const w0 = account.requests.length
  await a.keyboard.press('/'); await a.keyboard.type('What is this about?'); await a.keyboard.press('Enter'); await a.waitForTimeout(1000)
  const whole = account.requests.slice(w0).find(r => /What is this about\?/.test(JSON.stringify(r.body.messages)))
  const pageCount = await a.evaluate(() => state.pages.length)
  ok('"/" sends the whole-file question: scope "whole" with every page of the PDF (the whole document, PR A), never the page alone', whole?.body?.companion?.scope === 'whole' && whole.body.companion.document?.units?.length === pageCount && !/say when something is not on these pages/.test(JSON.stringify(whole.body.messages)), { scope: whole?.body?.companion?.scope, units: whole?.body?.companion?.document?.units?.length, pageCount })
  ok('"/" asks about the whole PDF; the answer opens as the Whole PDF card at the top of the column (first; the primer\'s trigger, when it shows, follows in its place)', whole?.body?.companion?.context?.kind === 'pdf' && (await a.innerText('.mr-col .mr-card.is-whole .mr-card__label')).startsWith('Whole PDF') && (await a.evaluate(() => { const t = document.querySelector('.mr-col .mr-trigger'); const w = document.querySelector('.mr-col .mr-card.is-whole'); return w.offsetTop === 0 && (!t || t.offsetTop >= w.offsetTop + w.offsetHeight + TinctMargin.COL.cardGap - 0.5) })))
  await fresh(a)
  // Reopened, the Whole PDF card shows its earlier conversation at once (the same task, no frame later).
  await a.evaluate(() => { openCard(null) }); await a.waitForTimeout(300)
  const atOnce = await a.evaluate(() => { openWhole({ quiet: true }); return document.querySelector('.mr-col .mr-card.is-whole.is-open')?.innerText || '' })
  ok('the Whole PDF card shows its earlier conversation the moment it opens', /What is this about\?/.test(atOnce) && /MOCK ANSWER/.test(atOnce), atOnce.slice(0, 200))
  await fresh(a)
  // The dot: one tap highlights in the default colour; a second tap opens the colours; picking sets the default.
  await selectText(a, { near: 'top' }); await a.waitForSelector('.mr-bar')
  ok('the dot shows the default colour (Gold before any choice)', (await a.getAttribute('.mr-bar [data-m="dot"]', 'aria-label')) === 'Highlight in Gold')
  await a.click('.mr-bar [data-m="dot"]'); await a.waitForTimeout(200)
  let list = await hl(a)
  ok('one tap on the dot highlights in the default colour', list.length === 1 && list[0].color === 'gold' && list[0].u > 0, list)
  await a.click('.mr-bar [data-m="dot"]'); await a.waitForSelector('.mr-bar .mr-swatch')
  ok('a second tap replaces the middle with the colours', (await a.$$('.mr-bar .mr-swatch')).length === 5 && !(await a.$('.mr-bar [data-m="explain"]')))
  await a.click('.mr-bar [data-color="sky"]'); await a.waitForTimeout(200)
  list = await hl(a)
  const prefs = await a.evaluate(() => JSON.parse(localStorage.getItem('tinct-addbook:prefs')).hlColor)
  ok('picking a colour recolours the highlight and becomes the default, saved with the prefs', list[0].color === 'sky' && prefs === 'sky', { list, prefs })
  await fresh(a)
  await a.reload(); await a.waitForFunction(() => document.querySelectorAll('.pdf-sheet .text-layer span').length > 20); await a.waitForTimeout(600)
  await selectText(a); await a.waitForSelector('.mr-bar')
  ok('after a reload the dot shows the chosen default', (await a.getAttribute('.mr-bar [data-m="dot"]', 'aria-label')) === 'Highlight in Sky')
  // Press and hold the dot: the colours, before anything is highlighted.
  const dot = await (await a.$('.mr-bar [data-m="dot"]')).boundingBox()
  await a.mouse.move(dot.x + dot.width / 2, dot.y + dot.height / 2); await a.mouse.down(); await a.waitForTimeout(600); await a.mouse.up(); await a.waitForTimeout(150)
  ok('a long press on the dot opens the colours', (await a.$$('.mr-bar .mr-swatch')).length === 5)
  await a.click('.mr-bar [data-color="rose"]'); await a.waitForTimeout(200)
  list = await hl(a)
  ok('picking from a long press highlights in that colour', list.length === 2 && list.some(h => h.color === 'rose'))
  await fresh(a)
  // A note: highlights in the default colour and opens the editor; saved with the highlight.
  await selectText(a, { near: 'bottom' }); await a.waitForSelector('.mr-bar')
  await a.click('.mr-bar [data-m="note"]'); await a.waitForSelector('.mr-note .mr-note__field')
  ok('Save note waits for words', await a.isDisabled('.mr-note [data-m="save"]'))
  await a.fill('.mr-note__field', 'Try it with x = 10 before the exercises.'); await a.click('.mr-note [data-m="save"]'); await a.waitForTimeout(200)
  list = await hl(a)
  const noted = list.find(h => h.note)
  ok('the note is stored with its highlight (in the default colour)', noted && noted.note === 'Try it with x = 10 before the exercises.' && noted.color === 'rose', list)
  // Sync: the account holds the set; another device opens with it.
  await a.waitForTimeout(2500)
  const stored = account.marks.get(hex)
  ok('signed in, the highlights and the note reach the account (/api/user-books/marks)', stored && stored.marks.filter(m => !m.gone).length === 3 && stored.marks.some(m => m.note), stored)
  const B = await readerPage(browser, origin, hex, { width: 1280, height: 800, look: 'night' })
  await B.page.waitForTimeout(1200)
  const onB = await hl(B.page)
  ok('another device opens with the same highlights and note', onB.length === 3 && onB.some(h => h.note === 'Try it with x = 10 before the exercises.'), onB)
  const cardsA = await a.evaluate(() => keptCards().filter(c => !c.gone).length), cardsB = await B.page.evaluate(() => keptCards().filter(c => !c.gone).length)
  ok('signed in, the margin\'s cards reach the account (/api/user-books/cards) and the other device', cardsA >= 6 && account.cards.get(hex)?.cards?.length === cardsA && cardsB === cardsA, { cardsA, cardsB, stored: account.cards.get(hex)?.cards?.length })
  ok('the note is a card in the margin on the other device', await B.page.evaluate(() => TinctMargin.cardView(keptCards(), highlights()).some(c => c.kind === 'note')))
  // PR C: a sync that fails for any reason but a conflict is said, once; the cards stay on this device.
  account.fail = 'cards'
  await B.page.evaluate(() => { const c = keptCards().find(x => !x.gone && x.kind !== 'quiz'); c.turns = [...(c.turns || []), { role: 'user', content: 'A follow-up while the account fails.', at: Date.now() }]; saveCard(c) })
  await B.page.waitForTimeout(2600)
  account.fail = null
  ok('a card sync that fails (not a conflict) tells the reader, and the card stays on the device', /could not be saved to your account/.test(await B.page.evaluate(() => [...document.querySelectorAll('.byob-toast, [role="status"], .toast')].map(t => t.textContent).join(' '))) && await B.page.evaluate(() => keptCards().some(c => (c.turns || []).some(t => /account fails/.test(t.content)))), await B.page.evaluate(() => [...document.querySelectorAll('.byob-toast, [role="status"]')].map(t => t.textContent).join(' | ')))
  // Removed on B (the note editor's Remove highlight), gone on A after its next open.
  await B.page.evaluate(id => { const rec = JSON.parse(localStorage.getItem('tinct-addbook:hl:pdf:' + location.search.slice(10, 34))).find(h => h.id === id); marginOpen({ text: rec.text, page: rec.page, box: { left: 0, top: 0, right: 0, bottom: 0 } }, { existing: rec }) }, noted.id)
  await B.page.click('.mr-float [data-m="note"]'); await B.page.waitForSelector('.mr-note')
  ok('an existing note opens in the editor', (await B.page.inputValue('.mr-note__field')) === 'Try it with x = 10 before the exercises.')
  await B.page.click('.mr-note [data-m="remove"]'); await B.page.waitForTimeout(2500)
  ok('a removal is kept as a tombstone in the account', account.marks.get(hex).marks.some(m => m.id === noted.id && m.gone))
  await a.reload(); await a.waitForFunction(() => document.querySelectorAll('.pdf-sheet .text-layer span').length > 20); await a.waitForTimeout(1500)
  ok('the other device loses it on its next open; the rest stay', (await hl(a)).length === 2 && !(await hl(a)).some(h => h.id === noted.id))
  // Offline edits merge on return: A edits offline while B adds; nothing is lost.
  await A.ctx.setOffline(true)
  await selectText(a); await a.waitForSelector('.mr-bar'); await a.click('.mr-bar [data-m="dot"]'); await a.waitForTimeout(2200); await fresh(a)
  await B.page.reload(); await B.page.waitForFunction(() => document.querySelectorAll('.pdf-sheet .text-layer span').length > 20); await B.page.waitForTimeout(1200)
  await selectText(B.page, { near: 'bottom' }); await B.page.waitForSelector('.mr-bar'); await B.page.click('.mr-bar [data-m="dot"]'); await B.page.waitForTimeout(2500)
  await A.ctx.setOffline(false); await a.evaluate(() => dispatchEvent(new Event('online'))); await a.waitForTimeout(2500)
  const after = account.marks.get(hex).marks.filter(m => !m.gone)
  ok('an offline edit and another device\'s edit both survive (409, merge, write again)', after.length === 4 && (await hl(a)).length === 4, { after: after.length, a: (await hl(a)).length })
  await B.ctx.close()
  // Copy quote.
  await selectText(a); await a.waitForSelector('.mr-bar'); const sel = (await a.evaluate(() => getSelection().toString())).replace(/\s+/g, ' ').trim()
  await a.click('.mr-bar [data-m="more"]'); await a.waitForSelector('.mr-more')
  const moreText = (await a.innerText('.mr-more')).replace(/\s+/g, ' ').trim()
  ok('More shows Define, Fact-check, Related, Counterpoint and Quiz me, then Copy quote, with their lines (Share as image waits)', moreText === 'Define The word, as this text uses it Fact-check Does it still hold? Searches the web Related Where else the text takes this up Counterpoint The strongest objection to it Quiz me Three questions to check you have it Copy quote With the title and page number', moreText)
  await a.click('.mr-more [data-m="copy"]'); await a.waitForTimeout(300)
  const clip = await a.evaluate(() => navigator.clipboard.readText())
  const printed = await a.evaluate(() => pageLabel(mr?.info?.page || currentPlace().page))
  ok('Copy quote copies the passage with the title and the printed page label', /^“.+”\n— .+, p\. \S+$/s.test(clip) && clip.includes(sel.slice(0, 15)) && clip.endsWith('p. ' + printed), { clip, printed })
  // Define: dictionary senses with the network off (after the one-time download to the offline cache).
  ok('the dictionary is kept for offline use', await a.evaluate(() => TinctDictionary.warm()))
  await A.ctx.setOffline(true)
  await a.reload().catch(() => {})
  const C = await readerPage(browser, origin, hex, { width: 1440, height: 900, look: 'paper' }).catch(() => null)
  if (C) {
    await C.page.evaluate(() => { goTo({ page: 3, frac: 0 }); return TinctDictionary.warm() }); await C.page.waitForTimeout(800); await C.ctx.setOffline(true)
    // A word the dictionary has (the page's first few words may be ones it leaves out, such as "which").
    let word = ''
    for (const near of ['middle', 'top', 'bottom']) {
      word = await selectText(C.page, { oneWord: true, near }); await C.page.waitForSelector('.mr-define .mr-define__senses li', { timeout: 3000 }).catch(() => {})
      if (await C.page.$('.mr-define__senses li')) break
      await C.page.keyboard.press('Escape'); await C.page.evaluate(() => getSelection().removeAllRanges())
    }
    ok('one word opens Define with dictionary senses, network off (the dictionary alone: no "In this text")', (await C.page.$$('.mr-define__senses li')).length >= 1 && (await C.page.textContent('.mr-define__src')) === 'Dictionary' && !(await C.page.$('.mr-define__in')), { word, card: await C.page.evaluate(() => document.querySelector('.mr-float')?.innerText) })
    await C.page.evaluate(() => mrDefine('Qzxwvk')); await C.page.waitForTimeout(800)
    ok('offline, a word the dictionary lacks: “Not in the offline dictionary.” with Ask beneath', (await C.page.textContent('.mr-define__body p')) === 'Not in the offline dictionary.' && await C.page.isVisible('.mr-define__foot [data-m="ask"]'))
    // PR C: offline, a capitalised word mid-sentence that the dictionary has shows its entry (online it would ask the companion).
    await C.page.evaluate(() => { mr.before = 'which the'; return mrDefine('Reason') }); await C.page.waitForTimeout(800)
    ok('offline, a capitalised word the dictionary has (mid-sentence) shows its entry', (await C.page.$$('.mr-define__senses li')).length >= 1 && (await C.page.textContent('.mr-define__src')) === 'Dictionary', await C.page.evaluate(() => document.querySelector('.mr-float')?.innerText))
    await C.ctx.setOffline(false)
    const n3 = account.requests.length
    await C.page.evaluate(() => mrDefine('Qzxwvk')); await C.page.waitForTimeout(1500)
    const req = account.requests.slice(n3).find(r => r.body?.companion?.intent === 'define')
    ok('online, a word the dictionary lacks goes to the existing contextual define', req && req.body.companion.selection === 'Qzxwvk' && /mocked meaning/.test(await C.page.textContent('.mr-define__body p')), req?.body?.companion)
    // Online with dictionary senses: define_sense moves the fitting sense to the top in full ink (mocked: sense 2).
    await C.page.keyboard.press('Escape'); await C.page.evaluate(() => getSelection().removeAllRanges())
    let senses = []
    for (let tries = 0; tries < 6 && senses.length < 2; tries++) {
      const n4 = account.requests.length
      await selectText(C.page, { oneWord: true, near: ['middle', 'top', 'bottom'][tries % 3] }); await C.page.waitForTimeout(1900)
      senses = await C.page.$$eval('.mr-define__senses li', l => l.map(x => ({ text: x.textContent, fit: x.classList.contains('is-fit') })))
      const ds = account.requests.slice(n4).find(r => r.body?.companion?.intent === 'define_sense')
      if (senses.length >= 2) ok('define_sense picks the fitting sense: first, in full ink; the others secondary', ds && senses[0].fit && !senses[1].fit && senses[0].text === ds.body.companion.senses[1] && ds.body.companion.context.kind === 'pdf', { senses, sent: ds?.body?.companion?.senses })
      await C.page.keyboard.press('Escape'); await C.page.evaluate(() => getSelection().removeAllRanges())
    }
    ok('a defined word is kept as a Define card in the margin', await C.page.evaluate(() => keptCards().some(c => c.kind === 'define')))
    // No dictionary sense fits (define_sense answers 0, as for "attention" in a paper): the companion's
    // meaning in this text comes first, under "In this text", the dictionary's senses below it.
    let inText = null
    for (let tries = 0; tries < 6 && !inText; tries++) {
      mock.next = JSON.stringify({ sense: 0 }); const n5 = account.requests.length
      await selectText(C.page, { oneWord: true, near: ['middle', 'top', 'bottom'][tries % 3] }); await C.page.waitForTimeout(2200)
      const asked = account.requests.slice(n5).map(r => r.body?.companion?.intent)
      inText = asked.includes('define_sense') ? await C.page.evaluate(() => { const d = document.querySelector('.mr-define'); return d && { label: d.querySelector('.mr-define__in .mr-define__label')?.textContent, text: d.querySelector('.mr-define__in')?.textContent, senses: d.querySelectorAll('.mr-define__senses li').length, first: d.querySelector('.mr-define__in')?.compareDocumentPosition(d.querySelector('.mr-define__senses')) & Node.DOCUMENT_POSITION_FOLLOWING, kept: keptCards().some(c => c.kind === 'define' && /mocked meaning/.test(c.data?.inText || '')) } }) : null
      mock.next = null
      if (inText) ok('no sense fits: the companion\'s define asked, "In this text" first with its meaning, the dictionary\'s senses below; kept on the card', asked.includes('define') && inText.label === 'In this text' && /mocked meaning/.test(inText.text) && inText.senses >= 1 && !!inText.first && inText.kept, { asked, inText })
      await C.page.keyboard.press('Escape'); await C.page.evaluate(() => getSelection().removeAllRanges())
    }
    if (!inText) ok('no sense fits: "In this text" first', false, 'no dictionary word found to select')
    // Double-click on half of a hyphenated word selects all of it ("auto-regressive" was looked up as "regressive").
    const hy = await C.page.evaluate(() => {
      const span = [...document.querySelectorAll('.pdf-sheet .text-layer span')].find(s => { const r = s.getBoundingClientRect(); return /\bself-evident\b/.test(s.textContent) && r.top > 80 && r.bottom < innerHeight - 20 })
      if (!span) return null
      const node = span.firstChild, at = node.textContent.indexOf('self-evident') + 5, range = document.createRange(); range.setStart(node, at); range.setEnd(node, at + 7)
      const r = range.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }
    })
    if (hy) {
      await C.page.mouse.dblclick(hy.x, hy.y); await C.page.waitForTimeout(150)
      const got = await C.page.evaluate(() => getSelection().toString())
      ok('double-click on part of a hyphenated word selects the whole word ("self-evident", not "evident")', got === 'self-evident', got)
    } else ok('double-click on a hyphenated word', false, 'no "self-evident" in view')
    await C.page.keyboard.press('Escape'); await C.page.evaluate(() => getSelection().removeAllRanges())
    // PR C: a Define that answers after the reader opened another PDF is kept in its own file, never the new one.
    const hex2 = addBook(PDFS[1]); mock.delay = 1500
    const before = await C.page.evaluate(() => state.key)
    await selectText(C.page, { oneWord: true }); await C.page.waitForSelector('.mr-define', { timeout: 3000 }).catch(() => {}); await C.page.waitForTimeout(2000)
    await C.page.evaluate(() => { mrDefine('Qzxwvk') }); await C.page.waitForTimeout(200)
    await C.page.evaluate(h => openFromUrl(h), hex2); await C.page.waitForTimeout(2600); mock.delay = 0
    const after = await C.page.evaluate(() => state.key)
    const kept = await C.page.evaluate(([a, b]) => ({ newFile: (JSON.parse(localStorage.getItem('tinct-addbook:cards:' + b) || '[]')).filter(c => c.kind === 'define' && c.data?.word === 'Qzxwvk').length, ownFile: (JSON.parse(localStorage.getItem('tinct-addbook:cards:' + a) || '[]')).filter(c => c.kind === 'define' && c.data?.word === 'Qzxwvk').length }), [before, after])
    ok('a Define started before switching PDFs is kept in its own PDF, never in the new one', before !== after && kept.newFile === 0 && kept.ownFile >= 1, { before, after, kept })
    await C.ctx.close()
  }
  // The phone: an answer opens as a card along the bottom with the passage underlined above it; tapping the page closes it.
  const Ph = await readerPage(browser, origin, hex, { width: 390, height: 844, look: 'paper' })
  await Ph.page.evaluate(() => goTo({ page: 2, frac: 0.05 })); await Ph.page.waitForTimeout(800)
  await selectText(Ph.page); await Ph.page.waitForSelector('.mr-pbar'); await Ph.page.click('.mr-pbar [data-m="explain"]'); await Ph.page.waitForTimeout(1200)
  const sheet = await Ph.page.evaluate(() => { const s = document.querySelector('.mr-sheet'); if (!s) return null; const r = s.getBoundingClientRect(), u = [...document.querySelectorAll('.mr-ul-layer i')].map(i => i.getBoundingClientRect()); return { top: r.top, h: r.height, under: u.length, above: u.every(x => x.bottom <= r.top) } })
  ok('phone: the answer opens as a bottom card about half the screen high, the passage underlined just above it', sheet && sheet.h <= 844 / 2 + 2 && sheet.under > 0 && sheet.above, sheet)
  await Ph.page.evaluate(() => { const g = document.querySelector('.mr-sheet__grab'); g?.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, clientY: 500 })); g?.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, clientY: 400 })) })
  ok('phone: a swipe up gives the card the full height', await Ph.page.evaluate(() => !!document.querySelector('.mr-sheet.is-full')))
  const gapY = await Ph.page.evaluate(() => ($('hdr').getBoundingClientRect().bottom + document.querySelector('.mr-sheet').getBoundingClientRect().top) / 2)
  await Ph.page.mouse.click(195, gapY); await Ph.page.waitForTimeout(300)
  ok('phone: tapping the page closes the card', !(await Ph.page.$('.mr-sheet')))
  await Ph.page.evaluate(() => openChat()); await Ph.page.waitForTimeout(400)
  ok('phone: the chat opens as the same bottom card, not the whole screen', await Ph.page.evaluate(() => { const s = document.querySelector('.mr-sheet'); return !!s && s.getBoundingClientRect().height <= innerHeight / 2 + 2 && !document.querySelector('.byob-phone-chat') }))
  // PR C: the phone's title keeps its room (it collapsed to "A."), cut with an ellipsis; the page pill gives way first.
  const title = await Ph.page.evaluate(() => { document.getElementById('bookTitle').textContent = 'Attention Is All You Need: a Long Title for the Phone'; const t = document.getElementById('bookTitle'), r = t.getBoundingClientRect(), cs = getComputedStyle(t); return { w: Math.round(r.width), cut: t.scrollWidth > t.clientWidth, ellipsis: cs.textOverflow, pill: Math.round(document.getElementById('pageBtn').getBoundingClientRect().width) } })
  ok('phone: the title has priority, at least 75px wide (not "A."), cut with an ellipsis', title.w >= 75 && title.cut && title.ellipsis === 'ellipsis' && title.pill >= 30, title)
  if (!process.env.NO_SHOTS) await Ph.page.screenshot({ path: join(OUT, 'prc-phone-title-390x844.png'), clip: { x: 0, y: 0, width: 390, height: 120 } })
  ok('phone: no page errors', !Ph.problems.length, Ph.problems)
  await Ph.ctx.close()
  // EPUB_MARGIN is off: an EPUB read here behaves as before (the selection popup, no margin).
  {
    const E = await openEpubHere(browser, origin, { width: 1440, height: 900, look: 'paper', margin: false })
    await E.page.evaluate(() => goTo({ page: 3, frac: 0.02 })); await E.page.waitForTimeout(500)
    await E.page.evaluate(selectEpub, { ch: 3, nth: 1 }); await E.page.waitForTimeout(700)
    const off = await E.page.evaluate(() => ({ on: marginOn(), col: !!document.querySelector('.mr-col:not([hidden])'), bar: !!document.querySelector('.mr-bar'), popup: !!document.querySelector('.selection-popup') }))
    ok('EPUB_MARGIN off: an EPUB has no margin and keeps the selection popup', !off.on && !off.col && !off.bar && off.popup, off)
    await E.ctx.close()
  }
  ok('no page errors', !A.problems.length, A.problems)
  await A.ctx.close()
  return results
}


/* ---------- PR 3: Before you start (BRIEF.md §5): trigger, primer, storage, Redo, the map and Quiz me on the chapter ---------- */
async function primerBehaviour(browser, origin) {
  const results = []
  const ok = (name, pass, detail) => { results.push({ name, pass: !!pass, ...(pass ? {} : { detail }) }); console.log(`${pass ? 'ok  ' : 'FAIL'} ${name}${pass ? '' : ' ' + String(JSON.stringify(detail)).slice(0, 300)}`) }
  // Units come from the outline only for a PDF of 40 pages or more: the long book (45 pages) has them.
  const hex = addBook(LONG_BOOK), hex2 = addBook(PDFS[1]), hexShort = addBook(PDFS[0])
  const chats = () => account.requests.filter(r => r.path === '/api/chat' || r.path === '/api/lab-chat')
  const primers = from => chats().slice(from).filter(r => r.body?.companion?.intent === 'chapter')
  const A = await readerPage(browser, origin, hex, { width: 1440, height: 900, look: 'paper' })
  const a = A.page
  await a.waitForSelector('.mr-col .mr-trigger', { timeout: 8000 }).catch(() => {})
  const units = await a.evaluate(() => primer.units)
  const unitPages = u => u.to - u.from + 1
  const r0 = chats().length
  const trig = await a.evaluate(() => {
    const t = document.querySelector('.mr-col .mr-trigger'); if (!t) return null
    const cs = getComputedStyle(t), title = getComputedStyle(t.querySelector('.mr-trigger__title')), sub = getComputedStyle(t.querySelector('.mr-trigger__sub'))
    // Its page's first line of text, measured in the column.
    const p = state.pages[currentPlace().page - 1], spans = [...p.layer.querySelectorAll('span')].filter(s => s.textContent.trim()).map(s => s.getBoundingClientRect().top)
    const line = Math.min(...spans) - document.querySelector('.mr-col').getBoundingClientRect().top
    return { text: t.innerText.replace(/\s+/g, ' ').trim(), top: t.offsetTop, line, key: !!t.querySelector('.mr-key'), tip: t.title, fill: cs.backgroundColor, radius: cs.borderRadius, rule: cs.boxShadow, italic: title.fontStyle, ink: [title.color, sub.color, getComputedStyle(document.querySelector('.mr-col')).getPropertyValue('--mr-ink').trim()] }
  })
  ok('at the PDF\'s start the trigger is a folded card at the page\'s first line less 4px: italic "Before you start", the unit\'s line, both in ink, a lead-coloured rule, no fill, no keycap ("Before you start (B)" in its title)', trig && trig.text === 'Before you start The gist, the key claims and a map of chapter 1.' && Math.abs(trig.top - (trig.line - 4)) <= 1.5 && !trig.key && trig.tip === 'Before you start (B)' && trig.fill === 'rgba(0, 0, 0, 0)' && trig.radius === '0px' && /inset/.test(trig.rule) && trig.italic === 'italic' && trig.ink[0] === trig.ink[1], trig)
  ok('nothing is made when the file opens (only when the reader opens the trigger)', primers(0).length === 0)
  await a.keyboard.press('b'); await a.waitForSelector('.mr-col .mr-primer .mr-primer__gist', { timeout: 8000 }).catch(() => {})
  const req = primers(r0)[0]
  ok('B opens the primer in place: one chapter request, action primer for the unit, the unit\'s pages as a PDF', primers(r0).length === 1 && req.body.companion.chapter?.action?.kind === 'primer' && req.body.companion.chapter.action.unitKey === 'outline-0' && req.body.companion.chapter.action.unitTitle === 'Chapter 1. Of Ideas' && req.body.companion.context.kind === 'pdf' && req.body.companion.context.pages.length === unitPages(units[0]) && units.length === 5 && !req.body.companion.selection && !req.body.system, req?.body?.companion && { ...req.body.companion, context: { ...req.body.companion.context, pages: req.body.companion.context.pages.length } })
  const shown = await a.evaluate(() => { const p = document.querySelector('.mr-col .mr-primer'); return { heads: [...p.querySelectorAll('.mr-primer__head')].map(h => h.textContent), claims: p.querySelectorAll('.mr-primer__claims li').length, cites: p.querySelectorAll('.mr-primer__claims .mr-cite').length, rows: p.querySelectorAll('.mr-map__row').length, quiz: p.querySelector('.mr-quiz-row')?.innerText.replace(/\s+/g, ' '), foot: p.querySelector('.mr-primer__foot')?.innerText.replace(/\s+/g, ' '), cards: [...document.querySelectorAll('.mr-col .mr-card')].filter(c => !c.hidden).length, top: p.offsetTop, bottom: p.parentElement.clientHeight - p.offsetTop - p.offsetHeight, trigger: !!document.querySelector('.mr-col .mr-trigger') } })
  ok('the primer: gist, Key claims (numbered, cite tags), Keep in mind, Map, the quiz row and its footer, alone in the column', JSON.stringify(shown.heads) === '["Key claims","Keep in mind","Map"]' && shown.claims === 3 && shown.cites === 3 && shown.rows === 3 && shown.quiz === 'Quiz me on this chapter 3 questions →' && shown.foot === 'Made when you opened the file Redo' && shown.cards === 0 && shown.top === 16 && shown.bottom === 70 && !shown.trigger, shown)
  await a.waitForTimeout(600)
  const stored = account.primers.get(hex + '?outline-0')
  ok('signed in with the book in the account, the primer is stored with it (PUT /api/user-books/primers)', stored && /MOCK gist/.test(stored.gist) && stored.unitKey === 'outline-0' && !!stored.madeAt, stored)
  await a.click('.mr-col .mr-primer .mr-primer__close'); await a.waitForTimeout(250)
  ok('its close folds it back to the trigger', !(await a.$('.mr-col .mr-primer')) && await a.isVisible('.mr-col .mr-trigger'))
  await a.click('.mr-col .mr-trigger'); await a.waitForTimeout(400)
  ok('clicking the trigger opens it again, and reopening never makes it again', await a.isVisible('.mr-col .mr-primer .mr-primer__gist') && primers(r0).length === 1)
  await a.keyboard.press('Escape'); await a.waitForTimeout(200)
  ok('Escape folds the primer back', !(await a.$('.mr-col .mr-primer')) && await a.isVisible('.mr-col .mr-trigger'))
  // Another device (this browser's copy gone): the account's primer, not a new one.
  await a.evaluate(() => { for (const k of Object.keys(localStorage)) if (k.includes(':primer:')) localStorage.removeItem(k) })
  await a.reload(); await a.waitForFunction(() => document.querySelectorAll('.pdf-sheet .text-layer span').length > 20); await a.waitForTimeout(900)
  const r1 = chats().length
  await a.keyboard.press('b'); await a.waitForSelector('.mr-col .mr-primer .mr-primer__gist', { timeout: 8000 }).catch(() => {})
  ok('on another device the account\'s primer opens; nothing is made again', primers(r1).length === 0 && /MOCK gist/.test(await a.innerText('.mr-col .mr-primer')))
  // Redo: a new one, stored again.
  mock.primer = { gist: 'MOCK redone gist. Second sentence.', claims: [1, 2, 3, 4, 5].map(i => ({ text: `Redone claim ${i}.`, cite: '{p. 2}' })), keepInMind: ['One', 'Two'], map: [1, 2, 3, 4, 5, 6, 7, 8].map(i => ({ title: `Redone section ${i}`, pages: `p. ${i + 1}` })) }
  await a.click('.mr-col .mr-primer [data-c="redo"]'); await a.waitForTimeout(1200); mock.primer = null
  ok('Redo makes a new one (one request) and stores it with the book', primers(r1).length === 1 && /redone gist/.test(await a.innerText('.mr-col .mr-primer')) && /redone gist/.test(account.primers.get(hex + '?outline-0')?.gist || ''))
  ok('a long primer (five claims, eight map rows) has no layout problems in the column', (await checkMargin(a)).length === 0, await checkMargin(a))
  // A map row scrolls the PDF to its page.
  // The scroll is smooth; newer Chromium takes about 1.2 s, so wait for it to settle, then check where it landed.
  await a.click('.mr-col .mr-map__row[data-page="6"]'); await a.waitForFunction(() => { const s = document.getElementById('scroll'), t = s.scrollTop, settled = window.__mrLastTop === t; window.__mrLastTop = t; return settled }, null, { polling: 300, timeout: 5000 }).catch(() => {})
  ok('a map row scrolls the PDF to its page', (await a.evaluate(() => currentPlace().page)) === 6, await a.evaluate(() => currentPlace()))
  await a.evaluate(() => goTo({ page: 1, frac: 0 })); await a.waitForTimeout(500)
  // Quiz me on this chapter: `quiz` with no selection and the unit's pages; a quiz card at the column's top.
  const r2 = chats().length
  await a.click('.mr-col .mr-quiz-row'); await a.waitForTimeout(1200)
  const q = chats().slice(r2).find(r => r.body?.companion?.intent === 'quiz')
  const quizCard = await a.evaluate(() => { const c = document.querySelector('.mr-col .mr-card.is-open'); return c && { label: c.querySelector('.mr-card__label').innerText.replace(/\s+/g, ' '), unit: c.classList.contains('is-unit'), primer: !!document.querySelector('.mr-col .mr-primer') } })
  ok('"Quiz me on this chapter": quiz on the whole unit (no selection, its pages), opening as a quiz card; the primer folds', q && q.body.companion.selection === undefined && q.body.companion.context.pages.length === unitPages(units[0]) && quizCard?.label.startsWith('Quiz me · chapter 1') && /1 of 3/.test(quizCard.label) && quizCard.unit && !quizCard.primer, { q: q?.body?.companion && { sel: q.body.companion.selection, pages: q.body.companion.context.pages.length }, quizCard })
  ok('the chapter quiz is kept with the cards (synced) and has no leader line', await a.evaluate(() => keptCards().some(c => c.data?.unit?.key === 'outline-0' && c.rects.length === 1) && !document.querySelector('svg.mr-leads path:not(.is-folded)')))
  await a.keyboard.press('Escape')
  // The next unit's start offers its own trigger; the middle of a unit offers none.
  await a.evaluate(n => goTo({ page: n, frac: 0 }), units[1].start); await a.waitForTimeout(700)
  const t5 = await a.evaluate(() => document.querySelector('.mr-col .mr-trigger')?.innerText.replace(/\s+/g, ' '))
  await a.evaluate(n => goTo({ page: n, frac: 0.3 }), units[1].start + 1); await a.waitForTimeout(700)
  const t6 = await a.evaluate(() => !!document.querySelector('.mr-col .mr-trigger'))
  ok('each top-level outline entry\'s start offers its unit; the middle of a unit offers none', /map of chapter 2\.$/.test(t5 || '') && !t6, { t5, t6 })
  const r3 = chats().length
  await a.keyboard.press('b'); await a.waitForTimeout(1000)
  const req3 = primers(r3)[0]
  ok('B anywhere opens the primer of the unit the reader is in', req3?.body?.companion?.chapter?.action?.unitKey === 'outline-1', req3?.body?.companion?.chapter)
  await a.keyboard.press('Escape')
  ok('no page errors', !A.problems.length, A.problems)
  await A.ctx.close()
  // A PDF under 40 pages is one unit, "all", even with an outline (the prose book, 21 pages, has one).
  const S = await readerPage(browser, origin, hexShort, { width: 1440, height: 900, look: 'paper' })
  await S.page.waitForSelector('.mr-col .mr-trigger', { timeout: 8000 }).catch(() => {})
  const ts = await S.page.evaluate(() => ({ trig: document.querySelector('.mr-col .mr-trigger')?.innerText.replace(/\s+/g, ' '), units: primer.units.map(u => u.key), pages: state.pages.length }))
  const rs = chats().length
  await S.page.keyboard.press('b'); await S.page.waitForTimeout(1000)
  const reqs = primers(rs)[0]
  ok('a PDF under 40 pages is one unit ("all"), its outline notwithstanding: the whole file goes', /map of the whole PDF\.$/.test(ts.trig || '') && ts.units.join() === 'all' && reqs?.body?.companion?.chapter?.action?.unitKey === 'all' && reqs.body.companion.context.pages.length === ts.pages, { ts, action: reqs?.body?.companion?.chapter, pages: reqs?.body?.companion?.context?.pages?.length })
  await S.ctx.close()
  // A PDF without an outline is one unit, "all".
  const B = await readerPage(browser, origin, hex2, { width: 1440, height: 900, look: 'night' })
  await B.page.waitForSelector('.mr-col .mr-trigger', { timeout: 8000 }).catch(() => {})
  const tb = await B.page.evaluate(() => document.querySelector('.mr-col .mr-trigger')?.innerText.replace(/\s+/g, ' '))
  const rb = chats().length
  await B.page.keyboard.press('b'); await B.page.waitForTimeout(1000)
  const reqb = primers(rb)[0]
  ok('a PDF without an outline: one unit ("all"), the whole PDF', /map of the whole PDF\.$/.test(tb || '') && reqb?.body?.companion?.chapter?.action?.unitKey === 'all' && reqb.body.companion.context.pages.length === 8, { tb, action: reqb?.body?.companion?.chapter })
  // Not in the account (signed out): kept in this browser only; reopening uses it.
  await B.ctx.close()
  const C = await readerPage(browser, origin, hex2, { width: 1440, height: 900, look: 'paper' })
  await C.page.evaluate(() => { localStorage.removeItem('sb-local-auth-token') })
  await C.page.reload(); await C.page.waitForFunction(() => document.querySelectorAll('.pdf-sheet .text-layer span').length > 20); await C.page.waitForTimeout(900)
  // The page's PDF came from the account; signed out, it is this browser's copy now.
  const rc = chats().length, putsBefore = account.primers.size
  await C.page.keyboard.press('b'); await C.page.waitForTimeout(1000)
  await C.page.keyboard.press('Escape'); await C.page.keyboard.press('b'); await C.page.waitForTimeout(600)
  ok('signed out: kept in this browser (reopened without a new request), nothing sent to the account', primers(rc).length <= 1 && account.primers.size === putsBefore && await C.page.evaluate(() => Object.keys(localStorage).some(k => k.includes(':primer:'))), { requests: primers(rc).length })
  await C.ctx.close()
  // The phone: the trigger is the bottom card; tapping it opens the primer in the bottom card.
  const Ph = await readerPage(browser, origin, hex, { width: 390, height: 844, look: 'paper' })
  await Ph.page.waitForSelector('.mr-sheet .mr-trigger', { timeout: 8000 }).catch(() => {})
  ok('phone: at a unit\'s start the trigger is the bottom card (no key shown)', await Ph.page.isVisible('.mr-sheet .mr-trigger') && !(await Ph.page.$('.mr-sheet .mr-key')))
  await Ph.page.click('.mr-sheet .mr-trigger'); await Ph.page.waitForSelector('.mr-sheet .mr-primer .mr-primer__gist', { timeout: 8000 }).catch(() => {})
  const sh = await Ph.page.evaluate(() => { const s = document.querySelector('.mr-sheet'); return s && { h: s.getBoundingClientRect().height, primer: !!s.querySelector('.mr-primer .mr-map') } })
  ok('phone: the primer opens in the bottom card, about half the screen high', sh?.primer && sh.h <= 844 / 2 + 2, sh)
  ok('phone: no layout problems with the primer open', (await checkMargin(Ph.page)).length === 0, await checkMargin(Ph.page))
  await Ph.page.click('.mr-sheet .mr-primer__close'); await Ph.page.waitForTimeout(300)
  ok('phone: closing folds it back to the trigger', await Ph.page.isVisible('.mr-sheet .mr-trigger'))
  await Ph.page.mouse.click(195, 300); await Ph.page.waitForTimeout(300)
  ok('phone: tapping the page closes the trigger, and it stays closed at this unit', !(await Ph.page.$('.mr-sheet')))
  ok('phone: no page errors', !Ph.problems.length, Ph.problems)
  await Ph.ctx.close()
  return results
}

/* ---------- Before you start, reliability (FIXES-2026-10-15, B1): ten runs of the reader's flow against
   mocked replies of realistic size and shape (bare, fenced, prose around it, braces in the prose, cut
   off by the output limit, empty, wrong shape, slow), closing it or opening another card meanwhile;
   each must end with the primer shown and kept. Then a reply that never comes: 45 s, then "taking too long". ---------- */
async function primerReliability(browser, origin) {
  const results = []
  const ok = (name, pass, detail) => { results.push({ name, pass: !!pass, ...(pass ? {} : { detail }) }); console.log(`${pass ? 'ok  ' : 'FAIL'} ${name}${pass ? '' : ' ' + String(JSON.stringify(detail)).slice(0, 300)}`) }
  const hex = addBook(PDFS[1])
  const chats = () => account.requests.filter(r => r.path === '/api/chat' || r.path === '/api/lab-chat')
  const primers = from => chats().slice(from).filter(r => r.body?.companion?.intent === 'chapter')
  // A primer of the size the paper's real one had: five claims, three cautions, eight map rows of the paper's own headings.
  const real = { gist: 'The paper introduces the Transformer, a sequence model built on attention alone, and shows it trains faster and translates better than recurrent and convolutional models.',
    claims: ['Recurrence precludes parallel training within a sequence.', 'Attention alone can draw global dependencies in a constant number of steps.', 'Scaled dot-product attention divides by the square root of the key size.', 'Multi-head attention attends to several subspaces at once.', 'The big model reaches 28.4 BLEU on English-to-German.'].map((text, i) => ({ text, cite: `{p. ${i + 2}}` })),
    keepInMind: ['The prose and Table 2 give different English-to-French BLEU.', 'Training costs are estimates from GPU time.', 'Positional encodings are one of two variants tried.'],
    map: ['Abstract', '1 Introduction', '2 Background', '3 Model Architecture', '4 Why Self-Attention', '5 Training', '6 Results', '7 Conclusion'].map((title, i) => ({ title, pages: `p. ${i + 1}` })) }
  const good = JSON.stringify(real), pretty = JSON.stringify(real, null, 2)
  const cases = [
    ['a bare JSON reply', [{ text: good, delay: 300 }]],
    ['a reply in a ```json fence', [{ text: '```json\n' + pretty + '\n```' }]],
    ['prose before and after the JSON', [{ text: 'Here is the orientation.\n' + pretty + '\nI hope it helps.' }]],
    ['prose with braces of its own before the JSON', [{ text: 'Citations are written {p. n} as asked.\n' + good }]],
    ['a reply cut off by the output limit, then a whole one (one retry)', [{ text: pretty.slice(0, Math.floor(pretty.length * 0.6)), stop: 'max_tokens' }, { text: good }]],
    ['an empty reply (502), then a whole one (one retry)', [{ status: 502, body: { error: 'The answer stopped.' } }, { text: good }]],
    ['a reply of the wrong shape, then a whole one (one retry)', [{ text: JSON.stringify({ gist: real.gist, claims: real.claims }) }, { text: good }]],
    ['a slow reply (4 s)', [{ text: good, delay: 4000 }]],
    ['closed while it was made: kept, and reopening shows it without a new request', [{ text: good, delay: 1500 }], 'close'],
    ['another card opened while it was made: kept, and reopening shows it without a new request', [{ text: good, delay: 1500 }], 'card'],
  ]
  const A = await readerPage(browser, origin, hex, { width: 1440, height: 900, look: 'paper' })
  const a = A.page
  let passed = 0
  for (const [name, replies, interrupt] of cases) {
    await a.evaluate(() => { for (const k of Object.keys(localStorage)) if (k.includes(':primer:')) localStorage.removeItem(k); closePrimer(); openCard(null) })
    account.primers.clear(); mock.primers = replies.map(r => ({ ...r })); const r0 = chats().length
    await a.evaluate(() => openPrimer(currentUnit()))
    if (interrupt) {
      await a.waitForTimeout(400)
      if (interrupt === 'close') await a.evaluate(() => closePrimer())
      else await a.evaluate(() => { const c = TinctMargin.newCard({ kind: 'explain', page: 1, anchor: [{ n: 1, x: 0.1, y: 0.3, w: 0.3, h: 0.02 }], text: 'A passage.', turns: [{ role: 'assistant', content: 'MOCK. An answer.' }] }); store.set('cards:' + state.key, [c]); col.view = null; openCard(c.id) })
      await a.waitForTimeout(2200)
      const kept = await a.evaluate(() => !!store.get(primerKey(currentUnit())))
      const r1 = chats().length
      await a.evaluate(() => { openCard(null); openPrimer(currentUnit()) })
      await a.waitForSelector('.mr-col .mr-primer .mr-primer__gist', { timeout: 6000 }).catch(() => {})
      const shown = await a.evaluate(() => document.querySelector('.mr-col .mr-primer')?.innerText || '')
      const pass = kept && primers(r1).length === 0 && /Transformer/.test(shown) && account.primers.size === 1
      passed += pass ? 1 : 0
      ok(`primer run: ${name}`, pass, { kept, requests: primers(r1).length, stored: account.primers.size })
      continue
    }
    await a.waitForSelector('.mr-col .mr-primer .mr-primer__gist', { timeout: 15000 }).catch(() => {})
    const got = await a.evaluate(() => ({ text: document.querySelector('.mr-col .mr-primer')?.innerText || '', rows: [...document.querySelectorAll('.mr-col .mr-map__row')].map(r => r.innerText.replace(/\s+/g, ' ').trim()) }))
    await a.waitForTimeout(300)
    const pass = /Transformer/.test(got.text) && primers(r0).length === replies.length && account.primers.size === 1 && got.rows[1] === '1 Introduction p. 2'
    passed += pass ? 1 : 0
    ok(`primer run: ${name}`, pass, { requests: primers(r0).length, want: replies.length, stored: account.primers.size, rows: got.rows.slice(0, 2), text: got.text.slice(0, 80) })
  }
  ok(`the primer was made in ${passed} of ${cases.length} runs (all must succeed)`, passed === cases.length, passed)
  // Two bad replies: the second is not retried; the reader sees why and can Redo.
  await a.evaluate(() => { for (const k of Object.keys(localStorage)) if (k.includes(':primer:')) localStorage.removeItem(k); closePrimer() }); account.primers.clear()
  mock.primers = [{ text: 'Not a primer.' }, { text: 'Still not.' }]; const r2 = chats().length
  await a.evaluate(() => openPrimer(currentUnit())); await a.waitForSelector('.mr-col .mr-primer [data-c="redo"]', { timeout: 8000 }).catch(() => {})
  ok('two bad replies: asked twice, never a third time; the reason and Redo show', primers(r2).length === 2 && /could not be loaded/.test(await a.innerText('.mr-col .mr-primer').catch(() => '')), { requests: primers(r2).length })
  mock.primers = []
  ok('no page errors', !A.problems.length, A.problems)
  await A.ctx.close()
  // A reply that never comes: after 45 s, "Before you start is taking too long. Try again." (the page's clock is run forward).
  const B = await readerPage(browser, origin, hex, { width: 1440, height: 900, look: 'paper' })
  const b = B.page
  await b.clock.install()
  mock.primers = [{ text: good, delay: 20000 }]; const r3 = chats().length
  await b.evaluate(() => { for (const k of Object.keys(localStorage)) if (k.includes(':primer:')) localStorage.removeItem(k); openPrimer(currentUnit()) })
  await b.waitForTimeout(800)
  await b.clock.runFor(30000); await b.waitForTimeout(200)
  const waiting = await b.evaluate(() => !!document.querySelector('.mr-col .mr-primer .mr-wait'))
  await b.clock.runFor(16000); await b.waitForTimeout(400); await b.clock.runFor(100)
  const status = await b.evaluate(() => document.querySelector('.mr-col .mr-primer .mr-status')?.innerText || '')
  ok('a reply that never comes: still waiting at 30 s; at 45 s "Before you start is taking too long. Try again.", one request, nothing retried', waiting && status === 'Before you start is taking too long. Try again.' && primers(r3).length === 1, { waiting, status, requests: primers(r3).length })
  mock.primers = []
  await B.ctx.close()
  return results
}

/* ---------- PR 4: keys, focus, labels and the live region (BRIEF.md "Keys (desktop)"; DECISIONS.md 2026-10-15) ---------- */
async function keysAndAccess(browser, origin) {
  const results = []
  const ok = (name, pass, detail) => { results.push({ name, pass: !!pass, ...(pass ? {} : { detail }) }); console.log(`${pass ? 'ok  ' : 'FAIL'} ${name}${pass ? '' : ' ' + String(JSON.stringify(detail)).slice(0, 300)}`) }
  const hex = addBook(PDFS[0])
  const A = await readerPage(browser, origin, hex, { width: 1440, height: 900, look: 'paper', startPage: 3 })
  const a = A.page
  const fresh = async () => { for (let i = 0; i < 4; i++) await a.keyboard.press('Escape'); await a.evaluate(() => { getSelection().removeAllRanges(); document.activeElement?.blur?.() }); await a.waitForTimeout(250) }
  const focusRing = () => a.evaluate(() => { const el = document.activeElement, cs = el && getComputedStyle(el); return el ? { cls: String(el.className), outline: cs.outlineStyle, width: parseFloat(cs.outlineWidth) } : null })
  const hl = () => a.evaluate(h => JSON.parse(localStorage.getItem('tinct-addbook:hl:pdf:' + h) || '[]').length, hex)
  // N: the note on the selection; any other key: Ask with it.
  await selectText(a); await a.waitForSelector('.mr-bar'); const h0 = await hl()
  await a.keyboard.press('n'); await a.waitForTimeout(300)
  ok('with a selection, N opens the note on it (highlighted in the default colour), not Ask', await a.isVisible('.mr-note .mr-note__field') && !(await a.$('.mr-bar.is-asking')) && (await hl()) === h0 + 1)
  await fresh()
  await selectText(a); await a.waitForSelector('.mr-bar')
  await a.keyboard.press('W'); await a.keyboard.type('hy not now?'); await a.waitForTimeout(150)
  ok('N never steals a typed question: once Ask has the keys, N is typed', (await a.inputValue('.mr-ask')) === 'Why not now?' && !(await a.$('.mr-note')))
  await fresh()
  await selectText(a); await a.waitForSelector('.mr-bar')
  await a.keyboard.press('Control+n'); await a.keyboard.press('Alt+n'); await a.waitForTimeout(200)
  ok('with Cmd, Ctrl or Alt, N does nothing in the margin', !(await a.$('.mr-note')) && !(await a.$('.mr-bar.is-asking')))
  await a.keyboard.press('b'); await a.waitForTimeout(200)
  ok('with a selection, B goes to Ask like any other letter (the primer waits)', (await a.inputValue('.mr-ask').catch(() => '')) === 'b' && !(await a.$('.mr-primer')))
  await fresh()
  // B and "/" without a selection.
  await a.keyboard.press('b'); await a.waitForSelector('.mr-col .mr-primer', { timeout: 6000 }).catch(() => {}); await a.waitForTimeout(400)
  ok('without a selection, B opens the primer; the keys bring the focus to it (its close), with a visible ring', await a.isVisible('.mr-col .mr-primer') && /mr-primer__close/.test((await focusRing())?.cls || '') && (await focusRing()).outline !== 'none' && (await focusRing()).width >= 2, await focusRing())
  await a.keyboard.press('Escape'); await a.waitForTimeout(200)
  ok('Escape folds the primer back', !(await a.$('.mr-col .mr-primer')))
  await a.keyboard.press('/'); await a.waitForTimeout(150)
  ok('"/" focuses the whole-PDF line at the column\'s foot', await a.evaluate(() => document.activeElement?.classList.contains('mr-foot__input')))
  await a.keyboard.type('n b'); await a.waitForTimeout(100)
  ok('typing in a field never triggers a key (N, B)', (await a.inputValue('.mr-foot__input')) === 'n b' && !(await a.$('.mr-note, .mr-col .mr-primer')))
  await a.evaluate(() => { const f = document.querySelector('.mr-foot__input'); f.value = ''; f.blur() })
  await fresh()
  // The bar from the keyboard: Tab into it, Left/Right along it, Return on the dots opens More with its first row focused, Up/Down move, Return chooses.
  await selectText(a); await a.waitForSelector('.mr-bar')
  await a.keyboard.press('Tab'); const first = await focusRing()
  ok('Tab from the page moves into the bar (Ask first), with a visible focus ring', /is-ask/.test(first?.cls || '') && first.outline !== 'none', first)
  await a.keyboard.press('ArrowRight'); await a.keyboard.press('ArrowRight'); await a.keyboard.press('ArrowRight')
  ok('Left and Right move along the bar', (await a.evaluate(() => document.activeElement?.dataset.m)) === 'more')
  await a.keyboard.press('Enter'); await a.waitForSelector('.mr-more'); await a.waitForTimeout(100)
  ok('Return on the dots opens More with its first row focused', (await a.evaluate(() => document.activeElement?.dataset.m)) === 'define' && (await a.getAttribute('.mr-bar [data-m="more"]', 'aria-expanded')) === 'true')
  // Define, Fact-check, Related (PR C), Counterpoint.
  await a.keyboard.press('ArrowDown'); await a.keyboard.press('ArrowDown'); await a.keyboard.press('ArrowDown')
  const at = await a.evaluate(() => document.activeElement?.dataset.m)
  await a.keyboard.press('ArrowUp'); await a.keyboard.press('ArrowUp'); await a.keyboard.press('ArrowUp'); await a.keyboard.press('ArrowUp')
  ok('Up and Down move between the rows, round from the first to the last', at === 'counterpoint' && (await a.evaluate(() => document.activeElement?.dataset.m)) === 'copy')
  await a.keyboard.press('Escape'); await a.waitForTimeout(100)
  ok('Escape closes More first, the focus back on its dots; the bar stays', !(await a.$('.mr-more')) && await a.isVisible('.mr-bar') && (await a.evaluate(() => document.activeElement?.dataset.m)) === 'more')
  await a.keyboard.press('Enter'); await a.waitForSelector('.mr-more'); await a.keyboard.press('ArrowDown'); await a.keyboard.press('ArrowDown'); await a.keyboard.press('ArrowDown')
  const n0 = account.requests.length
  await a.keyboard.press('Enter'); await a.waitForTimeout(1500)
  ok('Return chooses the row (Counterpoint: its card opens)', account.requests.slice(n0).some(r => r.body?.companion?.intent === 'counterpoint') && /^Counterpoint/.test(await a.innerText('.mr-card.is-open .mr-card__label').catch(() => '')))
  ok('the finished answer is announced once in a polite live region', await a.evaluate(() => { const l = document.getElementById('mr-live'); return !!l && l.getAttribute('aria-live') === 'polite' && /^Counterpoint · p\. \d+\. MOCK ANSWER/.test(l.textContent) }), await a.evaluate(() => document.getElementById('mr-live')?.textContent))
  // Escape one step at a time: the open card folds after the bar has gone.
  await selectText(a); await a.waitForSelector('.mr-bar'); await a.click('.mr-bar [data-m="more"]'); await a.waitForSelector('.mr-more')
  await a.keyboard.press('Escape'); const s1 = [!!(await a.$('.mr-more')), !!(await a.$('.mr-bar')), !!(await a.$('.mr-card.is-open'))]
  await a.keyboard.press('Escape'); const s2 = [!!(await a.$('.mr-more')), !!(await a.$('.mr-bar')), !!(await a.$('.mr-card.is-open'))]
  await a.keyboard.press('Escape'); await a.waitForTimeout(150); const s3 = [!!(await a.$('.mr-more')), !!(await a.$('.mr-bar')), !!(await a.$('.mr-card.is-open'))]
  ok('Escape steps back one piece at a time: More, then the bar, then the open card', JSON.stringify([s1, s2, s3]) === JSON.stringify([[false, true, true], [false, false, true], [false, false, false]]), [s1, s2, s3])
  // A folded card from the keyboard: Return opens it with the focus on its close; Return on close folds it, the focus back on its label.
  await a.evaluate(() => document.querySelector('.mr-col .mr-card.is-folded .mr-card__label')?.focus())
  const label = await focusRing()
  await a.keyboard.press('Enter'); await a.waitForTimeout(250)
  const closeF = await focusRing()
  await a.keyboard.press('Enter'); await a.waitForTimeout(250)
  ok('a folded card from the keyboard: Return opens it (focus on its close), Return on close folds it (focus back on its label), rings visible', /mr-card__label/.test(label?.cls || '') && label.outline !== 'none' && /mr-card__close/.test(closeF?.cls || '') && /mr-card__label/.test((await focusRing())?.cls || ''), { label, closeF, after: await focusRing() })
  // Labels and roles.
  const roles = await a.evaluate(() => {
    const col = document.querySelector('.mr-col'); openCard(keptCards()[0].id)
    return { col: [col.getAttribute('role'), col.getAttribute('aria-label')] }
  })
  await a.waitForTimeout(250)
  const roles2 = await a.evaluate(() => { const c = document.querySelector('.mr-card.is-open'); return { card: [c.getAttribute('role'), c.getAttribute('aria-label')], unlabeled: [...document.querySelectorAll('.mr-col button, .mr-col textarea, .mr-marks button')].filter(b => !(b.getAttribute('aria-label') || b.textContent.trim())).map(b => b.className) } })
  await selectText(a); await a.waitForSelector('.mr-bar'); await a.click('.mr-bar [data-m="more"]'); await a.waitForSelector('.mr-more')
  const roles3 = await a.evaluate(() => ({ bar: [document.querySelector('.mr-bar').getAttribute('role'), document.querySelector('.mr-bar').getAttribute('aria-label')], more: document.querySelector('.mr-more').getAttribute('role'), items: [...document.querySelectorAll('.mr-more [data-m]')].every(b => b.getAttribute('role') === 'menuitem'), unlabeled: [...document.querySelectorAll('.mr-float button, .mr-float textarea')].filter(b => !(b.getAttribute('aria-label') || b.textContent.trim())).map(b => b.className) }))
  ok('roles and names: the column (complementary, "Margin"), the open card (a region named by its label), the bar (toolbar), More (menu of menuitems); no control without a name', roles.col.join() === 'complementary,Margin' && roles2.card[0] === 'region' && /^Counterpoint|^Explain|^Ask|^Simplify|^Quiz/.test(roles2.card[1] || '') && !roles2.unlabeled.length && roles3.bar.join() === 'toolbar,Selection' && roles3.more === 'menu' && roles3.items && !roles3.unlabeled.length, { roles, roles2, roles3 })
  ok('no page errors', !A.problems.length, A.problems)
  await A.ctx.close()
  return results
}
// Text contrast of every margin colour pair, per look (WCAG 2 ratio of the text's colour on the colour behind it). A report: the colours are the mockup's.
// Small text that must reach 4.5:1 in every look: "Checking sources…", "/ the whole PDF", the primer's numbers and footer.
const HINT_TEXT = ['status line', 'foot hint', 'primer numbers', 'primer footer']
async function contrast(browser, origin) {
  const rows = []
  for (const look of ['paper', 'book', 'night', 'eink']) {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 3600 } }), page = await ctx.newPage()
    await page.goto(`${origin}/lab/addbook/margin-fixture.html?look=${look}`); await page.waitForFunction(() => document.documentElement.dataset.ready === 'true')
    const found = await page.evaluate(() => {
      const parse = c => { const m = c.match(/[\d.]+/g)?.map(Number) || [0, 0, 0, 0]; return { r: m[0], g: m[1], b: m[2], a: m.length > 3 ? m[3] : 1 } }
      const over = (top, under) => ({ r: top.r * top.a + under.r * (1 - top.a), g: top.g * top.a + under.g * (1 - top.a), b: top.b * top.a + under.b * (1 - top.a), a: 1 })
      const bg = el => { const layers = []; for (let e = el; e; e = e.parentElement) { const c = parse(getComputedStyle(e).backgroundColor); if (c.a > 0) { layers.push(c); if (c.a >= 1) break } } return layers.reverse().reduce((u, t) => over(t, u), { r: 255, g: 255, b: 255, a: 1 }) }
      const lum = c => { const f = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4 }; return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b) }
      const ratio = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05) }
      const cases = [['bar words', '[data-strip="a"] .mr-bar .is-ask'], ['More line', '[data-strip="c"] .mr-more__row span'], ['Define senses (secondary)', '[data-strip="e"] .mr-define__senses li:not(.is-fit)'], ['card label', '.cardbg .mr-card.is-open .mr-card__label'], ['quote', '.cardbg .mr-quote'], ['answer', '.cardbg .mr-answer p'], ['citation tag', '.cardbg .mr-cite'], ['status line', '[data-card="factcheck-checking"] .mr-status'], ['sources', '.cardbg .mr-sources a'], ['folded text', '[data-desk="margin"] .mr-card.is-folded .mr-card__text'], ['stack row', '[data-desk="overlap"] .mr-stack span'], ['foot hint', '[data-desk="margin"] .mr-foot__hint'], ['trigger line', '[data-desk="trigger"] .mr-trigger__sub'], ['primer heading', '[data-desk="primer"] .mr-primer__head'], ['primer numbers', '[data-desk="primer"] .mr-primer__n'], ['map pages', '[data-desk="primer"] .mr-map__pages'], ['primer footer', '[data-desk="primer"] .mr-primer__foot span'], ['quiz link', '[data-card="quiz"] .mr-follow__link']]
      return cases.map(([name, sel]) => { const el = document.querySelector(sel); if (!el) return { name, missing: true }; const cs = getComputedStyle(el); const fg = over(parse(cs.color), bg(el)); return { name, ratio: Math.round(ratio(fg, bg(el)) * 100) / 100, size: cs.fontSize } })
    })
    // PR C (Anders, 15 Oct): the mockup's faint small text now reads at least 4.5:1 (the --mr-hint token).
    for (const f of found) rows.push({ look, ...f, ...(HINT_TEXT.includes(f.name) ? { required: 4.5, pass: !f.missing && f.ratio >= 4.5 } : {}) })
    await ctx.close()
  }
  for (const r of rows) console.log(`${r.look.padEnd(6)} ${r.name.padEnd(28)} ${r.missing ? 'missing' : r.ratio + ':1 at ' + r.size}${r.required ? (r.pass ? '  ok (4.5:1)' : '  FAIL: under 4.5:1') : ''}`)
  return rows
}

/* ---------- PR 2: the margin column, cards, marks and the bottom card, across the brief's stress matrix ----------
   docs/margin/BRIEF.md "Layout QA": every viewport × look × browser zoom (desktop), each with the
   content cases below; each state must return no problems from docs/margin/layout-check.mjs, and
   the case's own conditions must hold. Cards are put in the reader's store directly (no AI). */
const COLUMN_VIEWPORTS = (process.env.COLUMN_VIEWPORTS || '1440x900,1280x800,1181x800,1024x768,430x932,390x844,360x740').split(',').map(v => v.split('x').map(Number))
const ZOOMS = (process.env.ZOOMS || '1,1.25').split(',').map(Number)
const LONG = Array.from({ length: 60 }, (_, i) => `Sentence ${i + 1} of a long answer runs on with several more words in it.`).join(' ').split(' ').slice(0, 600).join(' ')
const WORD60 = 'Pneumonoultramicroscopicsilicovolcanoconiosisandmuchmorebeyond'
// The longest primer PROMPTS.md allows: a 45-word gist, five 25-word claims, three cautions (one a 60-character word), eight map rows.
const LONG_PRIMER = {
  gist: 'The chapter sets up the two tools the rest of the book leans on, the binomial distribution for counting outcomes and Stirling’s approximation for the factorials it produces, and shows why both return in every later chapter on inference and coding.',
  claims: Array.from({ length: 5 }, (_, i) => ({ text: `Claim ${i + 1} runs to its full length of twenty-five words so that the primer is as long as a primer can be, with its page.`, cite: '{p. 1}' })),
  keepInMind: ['The exercises use natural logs throughout, but later chapters switch to base 2.', 'The text writes f for a probability where many courses write p.', `${'Pneumonoultramicroscopicsilicovolcanoconiosisandmuchmorebeyond'}: long words still wrap.`],
  map: Array.from({ length: 8 }, (_, i) => ({ title: i === 6 ? 'Further reading and a note on the notation used in the later chapters of the book' : `Section ${i + 1}`, pages: `pp. ${i + 1}–${i + 2}` })),
}
const LONG_URL = 'https://example.org/a-very-long-path/without-any-breaks/stirling-approximation-error-bounds-for-small-x-values'
// In the page: cards on the lines in view (`lines` of them, two passages per line when `pairs`),
// built from the text layer's own spans, in the reader's store, one of them open.
function seedCards({ lines = 5, pairs = true, open = 3, where = 'middle', kinds = null, answer = null, question = null, extra = null } = {}) {
  const hdr = document.getElementById('hdr').getBoundingClientRect().bottom
  const spans = [...document.querySelectorAll('.pdf-sheet .text-layer span')].filter(s => {
    const r = s.getBoundingClientRect(); return r.width > 40 && r.top > hdr + 4 && r.bottom < innerHeight - 4 && (s.textContent || '').trim().length > 8
  })
  const byLine = []
  for (const s of spans) { const r = s.getBoundingClientRect(); if (!byLine.some(l => Math.abs(l.top - r.top) < 4)) byLine.push({ top: r.top, s, r }) }
  byLine.sort((a, b) => a.top - b.top)
  const pick = where === 'top' ? byLine.slice(0, lines) : where === 'bottom' ? byLine.slice(-lines) : byLine.slice(Math.max(0, Math.floor(byLine.length / 3)), Math.max(0, Math.floor(byLine.length / 3)) + lines)
  const K = kinds || ['explain', 'simplify', 'ask', 'counterpoint', 'factcheck', 'define', 'quiz']
  const list = []
  pick.forEach((l, i) => {
    const halves = pairs ? [[l.r.left, l.r.left + l.r.width / 2 - 2], [l.r.left + l.r.width / 2 + 2, l.r.right]] : [[l.r.left, l.r.right]]
    halves.forEach(([a, b], k) => {
      const anchor = anchorOf([{ left: a, right: b, top: l.r.top, bottom: l.r.bottom }])
      const kind = K[(list.length) % K.length]
      const text = (l.s.textContent || '').trim()
      const data = kind === 'define' ? { word: 'variance', senses: [{ text: 'In statistics, how widely values spread around their mean.' }, { text: 'The fact of being different.' }] }
        : kind === 'quiz' ? { questions: [{ q: 'MOCK Q1. What does the passage name first?', answer: 'Ideas', why: 'It is named first.', cite: '{p. 1}' }, { q: 'Q2?', answer: 'B', why: '', cite: '' }, { q: 'Q3?', answer: 'C', why: '', cite: '' }], i: 0, results: [] } : null
      const turns = kind === 'define' || kind === 'quiz' ? [] : [...(kind === 'ask' ? [{ role: 'user', content: question || 'Why does this hold here?' }] : []), { role: 'assistant', content: answer && list.length === open ? answer : `MOCK ${kind}. The bottom line of card ${list.length + 1} comes first {p. 1}. Then a second sentence fills the second line of the folded card.` }]
      list.push(TinctMargin.newCard({ kind, page: anchor[0].n, anchor, text, turns, data, at: Date.now() + list.length }))
    })
  })
  if (extra && list[open]) Object.assign(list[open], extra)
  store.set('cards:' + state.key, list)
  col.view = null
  openCard(open != null && list[open] ? list[open].id : null)
  return list.length
}
// Settled: the pages have stopped scrolling (a card opened off screen scrolls its passage into view) and the margin has drawn.
const settle = page => page.evaluate(() => new Promise(r => {
  let last = -1, still = 0, n = 0
  const tick = () => { const y = $('scroll').scrollTop; still = y === last ? still + 1 : 0; last = y; if (still >= 4 || ++n > 120) setTimeout(r, 120); else requestAnimationFrame(tick) }
  requestAnimationFrame(tick)
}))
// Crowding: every card whose passage is in view shows in the column (as a card or a one-line row), none in a "more" row.
function crowding(want = null) {
  const stack = document.querySelector('.mr-stack:not([hidden])')?.innerText || null
  const cards = document.querySelectorAll('.mr-col .mr-card:not([hidden])').length, rows = document.querySelectorAll('.mr-col .mr-card.is-row:not([hidden])').length
  const inView = visibleCards().length
  // `want`: at least this many in view (cards synced from earlier rows of the matrix may add to the seeded ones).
  return { ok: col.mode !== 'column' || (!stack && cards === inView && (want == null || inView >= want)), mode: col.mode, stack, cards, rows, inView }
}
// The leader lines are attached: each dot is level with a passage in view and every card's label line has its line.
function leadersAttached() {
  if (col.mode !== 'column') return { ok: true }
  const vis = visibleCards(), want = vis.map(v => (v.line.top + v.line.bottom) / 2)
  const dots = [...document.querySelectorAll('svg.mr-leads circle')].map(c => Number(c.getAttribute('cy')))
  const loose = dots.filter(y => !want.some(w => Math.abs(w - y) < 1.5))
  const shown = [...document.querySelectorAll('.mr-col .mr-card:not([hidden]):not(.is-whole)')].length
  const lines = document.querySelectorAll('svg.mr-leads path:not(.is-folded)').length
  return { ok: !loose.length && dots.length >= shown && (!col.open || col.open === 'whole' || lines === 1 || !vis.some(v => v.card.id === col.open)), loose, dots: dots.length, shown, lines }
}
async function columnMatrix(browser, origin) {
  const rows = []
  for (const pdf of PDFS) {
    const hex = addBook(pdf), label = basename(pdf, '.pdf')
    const pi = PDFS.indexOf(pdf)
    const combos = SAMPLE
      ? COLUMN_VIEWPORTS.map(([w, h], i) => [w, h, rotate(LOOKS, i + pi), w < 700 ? 1 : rotate(ZOOMS, i + pi)])
      : COLUMN_VIEWPORTS.flatMap(([w, h]) => LOOKS.flatMap(l => (w < 700 ? [1] : ZOOMS).map(z => [w, h, l, z])))
    for (const [width, height, look, zoom] of combos) {
      const tag = `${label}-${width}x${height}-${look}-z${Math.round(zoom * 100)}`
      const found = [], shots = {}
      let opened
      try { opened = await readerPage(browser, origin, hex, { width, height, look, zoom, startPage: 2 }) }
      catch (e) { rows.push({ pdf: label, viewport: `${width}×${height}`, look, zoom, problems: 1, details: [{ kind: 'error', el: String(e.message || e).slice(0, 200) }] }); continue }
      const { ctx, page, problems } = opened
      const keep = (width === 1440 && height === 900 || width === 390 && height === 844) && zoom === 1 && (look === 'paper' || look === 'night')
      const state = async (name, cond) => {
        await settle(page)
        const list = await checkMargin(page)
        found.push(...list.map(p => ({ state: name, ...p })))
        // `cond`: a function run in the page, or [function, its argument].
        if (cond) { const r = await page.evaluate(...[].concat(cond)); if (!r || r.ok === false) found.push({ state: name, kind: 'condition', el: JSON.stringify(r).slice(0, 300) }) }
        const att = await page.evaluate(leadersAttached)
        if (!att.ok) found.push({ state: name, kind: 'leaders', el: JSON.stringify(att) })
        if (keep) { const path = join(OUT, `col-${tag}-${name}.jpg`); await page.screenshot({ path, type: 'jpeg', quality: 60 }); shots[name] = path }
      }
      try {
        const mode = await page.evaluate(() => col.mode)
        // Ten cards, two passages on each of five lines, one open: no overlap, the rest gather, lines to the right cards.
        await page.evaluate(seedCards, { lines: 5, pairs: true, open: 3 })
        await state('cards10', () => ({ ok: col.mode !== 'column' || document.querySelectorAll('.mr-col .mr-card:not([hidden])').length >= 1, mode: col.mode, gathered: document.querySelector('.mr-stack:not([hidden])')?.innerText }))
        if (mode === 'column') {
          // Clicking the "more" row opens the first gathered card and folds the others.
          const stacked = await page.$('.mr-stack:not([hidden])')
          if (stacked) { await stacked.click(); await state('more-opened', () => ({ ok: document.querySelectorAll('.mr-col .mr-card.is-open').length === 1 })) }
          // Scrolling with a card open: cards stay level with their passages, the lines stay attached.
          await page.evaluate(() => { $('scroll').scrollBy(0, 90) }); await state('scrolled')
        }
        // Passages at the very top and the very bottom of the screen.
        await page.evaluate(seedCards, { lines: 2, pairs: false, open: 0, where: 'top' }); await state('top')
        await page.evaluate(seedCards, { lines: 2, pairs: false, open: 1, where: 'bottom' }); await state('bottom')
        // Crowding (the Gloss test, 15 Oct): passages in the lower half of the screen use the room above
        // them, and older cards fold to one-line rows before anything gathers into "N more".
        // From the seeded cards alone: notes and cards synced from the matrix's earlier rows are cleared first.
        account.cards.delete(hex); account.marks.delete(hex)
        await page.evaluate(() => { store.set('hl:' + state.key, []); for (const p of state.pages) if (p.layer) renderHighlights(p) })
        await page.evaluate(seedCards, { lines: 4, pairs: false, open: null, where: 'bottom' })
        await state('lower-half', crowding)
        // None open: opening one low on the screen scrolls its passage up and the others out of view.
        await page.evaluate(seedCards, { lines: 4, pairs: true, open: null, where: 'bottom' })
        await state('eight', [crowding, 8])
        // A note on a crowded page: its card opens where the reader sees it, with the focus (never gathered, never lost).
        await page.evaluate(seedCards, { lines: 5, pairs: true, open: 0, where: 'middle' }); await settle(page)
        await page.evaluate(() => { openCard(null); getSelection().removeAllRanges() }); await settle(page)
        if (await selectText(page, { near: 'top' })) {
          await page.waitForSelector('.mr-float [data-m="note"]', { timeout: 4000 })
          // As on a crowded page: another note's highlight under the bar. The click on the bar's note
          // must open the editor, never the highlight beneath (the Gloss test's lost note, 15 Oct).
          await page.evaluate(() => {
            const bar = document.querySelector('.mr-float').getBoundingClientRect(), btn = document.querySelector('.mr-float [data-m="note"]').getBoundingClientRect()
            const p = pageForPoint(btn.left + btn.width / 2, btn.top + btn.height / 2); if (!p) return
            const r = p.pg.getBoundingClientRect(), at = Date.now()
            store.set('hl:' + state.key, [...highlights(), { id: 'under' + at.toString(36), page: p.n, rects: [[(bar.left - r.left) / r.width, (bar.top - r.top) / r.height, (bar.right - bar.left) / r.width, (bar.bottom - bar.top) / r.height]], text: 'An earlier passage.', color: 'sky', note: 'An earlier note.', at, u: at }])
            for (const q of state.pages) if (q.layer) renderHighlights(q)
          })
          await page.click('.mr-float [data-m="note"]'); await page.waitForSelector('.mr-note .mr-note__field', { timeout: 4000 })
          await page.keyboard.type('A note on a crowded page.')
          await page.click('.mr-note [data-m="save"]')
          await state('crowded-note', () => {
            const el = document.querySelector('.mr-sheet, .mr-card.is-floating.is-open, .mr-col .mr-card.is-open:not([hidden])')
            const r = el?.getBoundingClientRect()
            return { ok: String(col.open || '').startsWith('n-') && !!el && /A note on a crowded page\./.test(el.innerText) && r.top >= 0 && r.bottom <= innerHeight + 1 && el.contains(document.activeElement), open: col.open, focus: document.activeElement?.className }
          })
        } else found.push({ state: 'crowded-note', kind: 'error', el: 'no text to select' })
        // A 600-word answer: the open card scrolls inside; its label and follow-up line stay in view.
        await settle(page); await page.evaluate(seedCards, { lines: 1, pairs: false, open: 0, kinds: ['explain'], answer: LONG })
        await state('long', () => {
          const el = document.querySelector('.mr-card.is-open, .mr-sheet'); if (!el) return { ok: false, why: 'no open card' }
          const b = el.querySelector('.mr-card__body'), lab = (el.querySelector('.mr-card__label') || el.querySelector('.mr-sheet__grab')).getBoundingClientRect(), fu = el.querySelector('.mr-follow').getBoundingClientRect()
          return { ok: b.scrollHeight > b.clientHeight + 20 && lab.top >= 0 && fu.bottom <= innerHeight + 1, body: [b.scrollHeight, b.clientHeight], lab: lab.top, fu: fu.bottom }
        })
        // A 60-character word and a long URL in the question, the answer and the sources; six sources wrap.
        const odd = `The bottom line holds ${WORD60}. See ${LONG_URL} for more.`
        await page.evaluate(seedCards, { lines: 1, pairs: false, open: 0, kinds: ['ask'], answer: odd, question: `Why ${WORD60} and ${LONG_URL}?` }); await state('long-word')
        const six = 'Holds. The bottom line.\n\nHolds. A claim.\n\nSources: ' + ['NIST DLMF §5.11', 'Wikipedia: Stirling’s approximation', 'MathWorld: Stirling’s Approximation', 'Feller, An Introduction to Probability Theory', 'Robbins (1955), A Remark on Stirling’s Formula', LONG_URL].map((t, i) => `[${t}](https://example.org/s${i})`).join(' · ')
        await page.evaluate(seedCards, { lines: 1, pairs: false, open: 0, kinds: ['factcheck'], answer: six })
        await state('six-sources', () => { const s = document.querySelector('.mr-sources'); return { ok: !!s && s.getBoundingClientRect().height > 20 && s.querySelectorAll('a').length === 6, h: s?.getBoundingClientRect().height } })
        // A wide display equation scrolls sideways inside the answer only.
        await page.evaluate(seedCards, { lines: 1, pairs: false, open: 0, kinds: ['explain'], answer: 'The bottom line.\n\n```\nP(r | f, N) = (N choose r) f^r (1 - f)^(N - r) = N! / (r! (N - r)!) f^r (1 - f)^(N - r) summed over every r from 0 to N\n```\n\nAfter the equation.' })
        await state('equation', () => { const pre = document.querySelector('.mr-card.is-open pre, .mr-sheet pre'), card = pre?.closest('.mr-card, .mr-sheet'); return { ok: !!pre && pre.scrollWidth > pre.clientWidth && card.scrollWidth <= card.clientWidth + 1 && getComputedStyle(pre).overflowX === 'auto' && !/mono/i.test(getComputedStyle(pre).fontFamily) } })
        // Quiz me and Fact-check while it searches.
        await page.evaluate(seedCards, { lines: 1, pairs: false, open: 0, kinds: ['quiz'] }); await state('quiz')
        await page.evaluate(seedCards, { lines: 1, pairs: false, open: 0, kinds: ['factcheck'] })
        await page.evaluate(() => { const c = cardById(col.open); c.turns = []; store.set('cards:' + state.key, [c]); col.live.set(c.id, { text: '', status: 'Checking sources…' }); marginLayout({ fresh: true }) })
        await state('checking', () => ({ ok: /Checking sources…/.test(document.querySelector('.mr-card.is-open, .mr-sheet')?.innerText || '') }))
        // The whole-PDF card at the top of the column (or the phone's chat card).
        await page.evaluate(() => { col.live.clear(); chat.turns = [{ role: 'user', content: 'What is this PDF about?', page: 2, at: Date.now() }, { role: 'assistant', content: 'MOCK. The bottom line about the whole PDF {p. 1}.\n\nMore.', at: Date.now() }]; openWhole({ quiet: true }) })
        await state('whole')
        await page.evaluate(() => { chat.turns = []; closeChat() })
        // PR 3: at a unit's start, the trigger with the page's cards below it; then the longest primer, open.
        await page.evaluate(() => { openCard(null); goTo({ page: TinctMargin.unitAt(primer.units, currentPlace().page).start, frac: 0 }) }); await settle(page)
        await page.evaluate(seedCards, { lines: 4, pairs: true, open: 2, where: 'top' })
        await state('trigger', () => ({ ok: col.mode !== 'column' || !!document.querySelector('.mr-col .mr-trigger:not([hidden])'), mode: col.mode }))
        await page.evaluate(LONG => { openCard(null); const u = currentUnit(); store.set(primerKey(u), { ...LONG, madeAt: new Date().toISOString(), unitKey: u.key }); openPrimer(u) }, LONG_PRIMER)
        await state('primer', () => { const el = document.querySelector('.mr-primer'); return { ok: !!el?.querySelector('.mr-map') && el.querySelectorAll('.mr-map__row').length === 8 && (col.mode !== 'column' || !document.querySelector('.mr-col .mr-card:not([hidden])')) } })
        await page.evaluate(() => closePrimer())
        if (mode === 'phone') {
          // The bottom card with the keyboard open: its follow-up line above the keyboard, the passage in view.
          await page.evaluate(seedCards, { lines: 1, pairs: false, open: 0, kinds: ['ask'] })
          await page.evaluate(() => { const vv = window.visualViewport, h = innerHeight - 300; Object.defineProperty(vv, 'height', { configurable: true, get: () => h }); vv.dispatchEvent(new Event('resize')) })
          await state('keyboard', () => {
            const el = col.sheet; if (!el) return { ok: false, why: 'no card' }
            const fu = el.querySelector('.mr-follow').getBoundingClientRect(), top = el.getBoundingClientRect().top
            const rects = anchorRects(TinctMargin.anchorOfCard(cardById(col.open)))
            const passage = Math.max(...rects.map(r => r.bottom)), hdr = $('hdr').getBoundingClientRect().bottom
            return { ok: fu.bottom <= innerHeight - 300 + 1 && rects.some(r => r.bottom <= top && r.top >= hdr - 1), fu: fu.bottom, top, passage }
          })
        }
        if (mode === 'marks') {
          // A mark opens its card floating beside it.
          await page.evaluate(seedCards, { lines: 3, pairs: false, open: null })
          await page.click('.mr-mark:not([data-primer])'); await state('mark-open', () => ({ ok: !!document.querySelector('.mr-card.is-floating.is-open') }))
        }
      } catch (e) { found.push({ state: 'run', kind: 'error', el: String(e.message || e).replace(/\u001b\[\d+m/g, '').slice(-700) }) }
      const n = found.length + problems.length
      rows.push({ pdf: label, viewport: `${width}×${height}`, look, zoom, problems: n, details: [...found, ...problems], screenshots: shots })
      console.log(`${tag}: ${n} problem(s)`, n ? JSON.stringify([...found, ...problems]).slice(0, 600) : '')
      // One screenshot for the combination: its last state.
      if (!keep) { const path = join(OUT, `col-${tag}.jpg`); await page.screenshot({ path, type: 'jpeg', quality: 45 }).catch(() => {}); rows.at(-1).screenshot = path }
      await ctx.close()
    }
  }
  return rows
}
// Resizing across 1180px with a card open: column -> marks -> column, without moving the reading place or losing the lines.
async function resizeRun(browser, origin) {
  const out = []
  for (const pdf of PDFS) {
    const hex = addBook(pdf), label = basename(pdf, '.pdf')
    for (const look of SAMPLE ? [rotate(LOOKS, PDFS.indexOf(pdf) * 2)] : LOOKS) {
      const { ctx, page, problems } = await readerPage(browser, origin, hex, { width: 1300, height: 820, look, startPage: 2 })
      const found = []
      await page.evaluate(seedCards, { lines: 3, pairs: true, open: 2 }); await settle(page)
      const place0 = await page.evaluate(() => currentPlace())
      for (const w of [1179, 1100, 1181, 1300, 1024, 1440]) {
        await page.setViewportSize({ width: w, height: 820 }); await page.waitForTimeout(450); await settle(page)
        const mode = await page.evaluate(() => col.mode)
        if (mode !== (w >= 1180 ? 'column' : 'marks')) found.push({ w, kind: 'mode', el: mode })
        found.push(...(await checkMargin(page)).map(p => ({ w, ...p })))
        const att = await page.evaluate(leadersAttached); if (!att.ok) found.push({ w, kind: 'leaders', el: JSON.stringify(att) })
        const place = await page.evaluate(() => currentPlace())
        if (place.page !== place0.page || Math.abs(place.frac - place0.frac) > 0.03) found.push({ w, kind: 'place moved', el: JSON.stringify([place0, place]) })
        if (w >= 1180) { const lines = await page.evaluate(() => document.querySelectorAll('svg.mr-leads path:not(.is-folded)').length); if (lines !== 1) found.push({ w, kind: 'open line', el: String(lines) }) }
        else { const marks = await page.evaluate(() => document.querySelectorAll('.mr-mark').length); if (!marks) found.push({ w, kind: 'marks', el: '0' }) }
      }
      const path = join(OUT, `resize-${label}-${look}.jpg`); await page.screenshot({ path, type: 'jpeg', quality: 50 })
      out.push({ pdf: label, look, case: 'resize across 1180px with a card open', problems: found.length + problems.length, details: [...found, ...problems], screenshot: path })
      console.log(`resize ${label} ${look}: ${found.length + problems.length} problem(s)`, found.length ? JSON.stringify(found).slice(0, 400) : '')
      await ctx.close()
    }
  }
  return out
}

/* ---------- PR C: an EPUB in the PDF reader (FIXES-2026-10-15 "EPUBs") ----------
   The margin on an EPUB read here: the bar, More with Related, Explain and Related as cards, places
   named by quoted words, no passage pictures, the document as chapters, a note, crowding, a zoom
   that reflows the text, Copy quote naming the chapter. Each state must pass the layout check. The
   EPUB is the anthology made above (no AI: every answer is mocked). */
async function openEpubHere(browser, origin, { width, height, look, margin = true }) {
  const hex = addBook(PDFS[0])
  const opened = await readerPage(browser, origin, hex, { width, height, look })
  // The EPUB margin is off in the reader (EPUB_MARGIN = false, Anders 15 Oct); this check turns it on for its page.
  if (margin) await opened.page.evaluate(() => { window.TinctEpubMargin = true })
  await opened.page.evaluate(async () => { const b = new Uint8Array(await (await fetch('/__margin/anthology.epub')).arrayBuffer()); await openBook('epub', b, 'anthology.epub', 'epub:' + 'ab'.repeat(12)) })
  await opened.page.waitForSelector('.epub-pg'); await opened.page.waitForTimeout(900)
  return opened
}
// Select `chars` characters of the `nth` paragraph of chapter `ch` (1-based), as a reader would.
function selectEpub({ ch = 3, nth = 1, chars = 110 } = {}) {
  const p = state.pages[ch - 1].pg.querySelectorAll('p')[nth], t = p.firstChild
  getSelection().setBaseAndExtent(t, 0, t, Math.min(chars, t.textContent.length))
  return getSelection().toString()
}
// Cards on the first lines of the paragraphs in view, kept as offsets (span) as the reader keeps them.
function seedEpubCards({ count = 6, open = 1 } = {}) {
  const hdr = $('hdr').getBoundingClientRect().bottom, list = []
  for (const p of state.pages) for (const para of p.pg.querySelectorAll('p')) {
    const r = para.getBoundingClientRect(); if (r.top < hdr + 10 || r.top > innerHeight - 60 || list.length >= count) continue
    const t = para.firstChild; if (!t || t.textContent.length < 40) continue
    const range = document.createRange(); range.setStart(t, 0); range.setEnd(t, 40)
    const info = { text: range.toString(), page: p.n, range }
    const kind = ['explain', 'related', 'simplify', 'counterpoint', 'ask', 'factcheck'][list.length % 6]
    const turns = kind === 'related' ? [{ role: 'assistant', content: 'MOCK thread.\n\n“Modern lamps consist of two pillars” The second essay opens on it.' }] : [...(kind === 'ask' ? [{ role: 'user', content: 'Why here?' }] : []), { role: 'assistant', content: `MOCK ${kind}. The bottom line of card ${list.length + 1}. Then a second sentence.` }]
    list.push(withSpan(TinctMargin.newCard({ kind, page: p.n, anchor: anchorOf(selectionShapes(range)), text: info.text, turns, at: Date.now() + list.length }), info))
  }
  store.set('cards:' + state.key, list); col.view = null
  openCard(list[open]?.id || null)
  return list.length
}
async function epubCheck(browser, origin) {
  const rows = []
  const combos = SAMPLE ? VIEWPORTS.map(([w, h], i) => [w, h, rotate(LOOKS, i + 1)]) : VIEWPORTS.flatMap(([w, h]) => LOOKS.map(l => [w, h, l]))
  for (const [width, height, look] of combos) {
    const tag = `epub-${width}x${height}-${look}`, found = [], shots = {}
    const keep = (width === 1440 && height === 900) || (width === 390 && height === 844) || !!process.env.KEEP_ALL
    let opened
    try { opened = await openEpubHere(browser, origin, { width, height, look }) }
    catch (e) { rows.push({ viewport: `${width}×${height}`, look, problems: 1, details: [{ kind: 'error', el: String(e.message || e).slice(0, 200) }] }); continue }
    const { ctx, page, problems } = opened
    const cond = (name, pass, detail) => { if (!pass) found.push({ state: name, kind: 'condition', el: JSON.stringify(detail ?? null).slice(0, 300) }) }
    const check = async (name, test) => {
      await settle(page)
      found.push(...(await checkMargin(page)).map(p => ({ state: name, ...p })))
      if (test) { const r = await page.evaluate(test); if (!r || r.ok === false) found.push({ state: name, kind: 'condition', el: JSON.stringify(r).slice(0, 300) }) }
      if (keep) { const path = join(OUT, `${tag}-${name}.png`); await page.screenshot({ path }); shots[name] = path }
    }
    const openCardSel = width < 700 ? '.mr-sheet' : '.mr-card.is-open'
    try {
      const mode = await page.evaluate(() => col.mode)
      cond('open', ['column', 'marks', 'phone'].includes(mode) && await page.evaluate(() => marginOn() && !document.querySelector('.byob-dock')), { mode })
      await page.evaluate(() => goTo({ page: 3, frac: 0.02 })); await page.waitForTimeout(600)
      await page.evaluate(selectEpub, { ch: 3, nth: 1 }); await page.waitForSelector('.mr-bar, .mr-pbar', { timeout: 5000 })
      await check('bar')
      await page.click('.mr-float [data-m="more"]'); await page.waitForSelector('.mr-more, .mr-pmore')
      await check('more', () => ({ ok: !!document.querySelector('.mr-float [data-m="related"]') }))
      const r0 = account.requests.length
      await page.click('.mr-float [data-m="related"]'); await page.waitForTimeout(1300)
      const rel = account.requests.slice(r0).find(r => r.body?.companion?.intent === 'related')
      const chapters = await page.evaluate(() => state.pages.length)
      cond('related-request', rel && rel.body.companion.context.kind === 'epub' && rel.body.companion.document?.kind === 'epub' && rel.body.companion.document.units.length === chapters && !JSON.stringify(rel.body.messages).includes('"type":"image"'), rel?.body?.companion && { context: rel.body.companion.context.kind, doc: rel.body.companion.document?.kind, units: rel.body.companion.document?.units?.length })
      await check('related', () => ({ ok: document.querySelectorAll('button.mr-related__row.is-quote').length === 2 && /Related · ch\. 3/.test(document.querySelector('.mr-card.is-open, .mr-sheet')?.innerText || ''), rows: document.querySelectorAll('.mr-related__row').length }))
      await page.click(`${openCardSel} button.mr-related__row >> nth=1`)
      await page.waitForTimeout(1300)
      cond('related-click', await page.evaluate(() => currentPlace().page === 4 && document.querySelectorAll('.mr-flash-layer i').length > 0), await page.evaluate(() => [currentPlace(), document.querySelectorAll('.mr-flash-layer i').length]))
      await page.evaluate(() => { if (col.sheet) closeSheet2(); openCard(null); goTo({ page: 3, frac: 0.02 }) }); await page.waitForTimeout(500)
      // Explain: a card in the margin, the chapter in its label, the passage underlined, no picture.
      await page.evaluate(selectEpub, { ch: 3, nth: 2 }); await page.waitForSelector('.mr-bar, .mr-pbar')
      const r1 = account.requests.length
      await page.click('.mr-float [data-m="explain"]'); await page.waitForTimeout(1200)
      const ex = account.requests.slice(r1).find(r => r.body?.companion?.intent === 'explain')
      cond('explain-request', ex && ex.body.companion.context.kind === 'epub' && !JSON.stringify(ex.body.messages).includes('"type":"image"'), ex?.body?.companion?.context?.kind)
      await check('explain', () => ({ ok: /Explain · ch\. 3/.test(document.querySelector('.mr-card.is-open, .mr-sheet')?.innerText || '') && document.querySelectorAll('.mr-ul-layer i').length > 0 }))
      // Six cards on the lines in view, one open: no overlap, the rest gather; then a zoom reflows the text and the cards follow it.
      if (width >= 700) {
        await page.evaluate(() => { openCard(null); getSelection().removeAllRanges() })
        await page.evaluate(seedEpubCards, { count: 6, open: 1 })
        await check('cards6', () => ({ ok: document.querySelectorAll('.mr-card, .mr-mark').length >= 1 }))
        await page.evaluate(() => setZoom(1.2)); await page.waitForTimeout(700)
        await check('zoomed', () => {
          const c = cardById(col.open); if (!c?.span) return { ok: false, why: 'no open card' }
          const p = state.pages[c.span[0] - 1], r = [...rangeFromOffsets(p.pg, c.span[1], c.span[2]).getClientRects()].find(q => q.width > 0.5)
          const v = visibleCards().find(x => x.card.id === c.id)
          return { ok: !!v && Math.abs(v.line.top - r.top) < 4, line: v?.line.top, range: r.top }
        })
        await page.evaluate(() => setZoom(1)); await page.waitForTimeout(500)
      }
      // A highlight and its note: offsets in the chapter; the note is a card in the margin.
      await page.evaluate(() => { if (col.sheet) closeSheet2(); openCard(null); store.set('cards:' + state.key, []); col.view = null; goTo({ page: 3, frac: 0.02 }) }); await page.waitForTimeout(400)
      await page.evaluate(selectEpub, { ch: 3, nth: 3, chars: 60 }); await page.waitForSelector('.mr-bar, .mr-pbar')
      await page.click('.mr-float [data-m="note"]'); await page.waitForSelector('.mr-note .mr-note__field')
      await page.fill('.mr-note__field', 'A note on an EPUB passage.'); await page.click('.mr-note [data-m="save"]'); await page.waitForTimeout(400)
      const hl = await page.evaluate(() => highlights())
      cond('note', hl.length === 1 && hl[0].start != null && hl[0].note === 'A note on an EPUB passage.' && await page.evaluate(() => viewCards().some(c => c.kind === 'note')), hl)
      await check('note')
      // Copy quote names the chapter.
      await ctx.grantPermissions(['clipboard-read', 'clipboard-write'], { origin })
      await page.evaluate(selectEpub, { ch: 3, nth: 1, chars: 50 }); await page.waitForSelector('.mr-bar, .mr-pbar')
      await page.click('.mr-float [data-m="more"]'); await page.click('.mr-float [data-m="copy"]'); await page.waitForTimeout(300)
      const clip = await page.evaluate(() => navigator.clipboard.readText()).catch(() => '')
      cond('copy', /\n— Lamplight Essays, ch\. 3$/.test(clip), clip)
    } catch (e) { found.push({ state: 'run', kind: 'error', el: String(e.message || e).replace(/\u001b\[\d+m/g, '').slice(-500) }) }
    const n = found.length + problems.length
    rows.push({ viewport: `${width}×${height}`, look, problems: n, details: [...found, ...problems], screenshots: shots })
    console.log(`${tag}: ${n} problem(s)`, n ? JSON.stringify([...found, ...problems]).slice(0, 600) : '')
    await ctx.close()
  }
  return rows
}

/* ---------- Scans (PR D; docs/margin/gloss-test/edge.html, 15 Oct 2026) ----------
   A scan is made here from a text fixture (scan_0042.pdf, drawn at 144 dpi in grey and stored as page
   pictures only, no text), and the mocked recognition returns that fixture's own lines as blocks with
   their boxes, so where the text layer lands can be checked against where the words are printed.
   IMG_20240512_scan.pdf (pictures only) is the scan recognised before boxes existed. */
async function makeScan(browser, origin, file) {
  const ctx = await browser.newContext(), page = await ctx.newPage()
  await page.goto(`${origin}/library`)
  await page.addScriptTag({ url: '/lab/addbook/vendor/pdfjs/pdf.min.js' })
  const pages = await page.evaluate(async b64 => {
    pdfjsLib.GlobalWorkerOptions.workerSrc = '/lab/addbook/vendor/pdfjs/pdf.worker.min.js'
    const bytes = Uint8Array.from(atob(b64), c => c.charCodeAt(0))
    const pdf = await pdfjsLib.getDocument({ data: bytes }).promise, out = []
    for (let n = 1; n <= pdf.numPages; n++) {
      const pg = await pdf.getPage(n), vp = pg.getViewport({ scale: 2 }), unit = pg.getViewport({ scale: 1 })
      const c = document.createElement('canvas'); c.width = Math.round(vp.width); c.height = Math.round(vp.height)
      const g = c.getContext('2d'); g.fillStyle = '#f4f1ea'; g.fillRect(0, 0, c.width, c.height)
      await pg.render({ canvasContext: g, viewport: vp }).promise
      const d = g.getImageData(0, 0, c.width, c.height).data, grey = new Uint8Array(c.width * c.height)
      for (let i = 0; i < grey.length; i++) grey[i] = Math.round(d[i * 4] * 0.299 + d[i * 4 + 1] * 0.587 + d[i * 4 + 2] * 0.114)
      let bin = ''; for (let i = 0; i < grey.length; i += 0x8000) bin += String.fromCharCode(...grey.subarray(i, i + 0x8000))
      // Its lines as recognition would give them: one block a line, its box in thousandths of the page.
      const items = (await pg.getTextContent()).items.filter(it => it.str.trim())
      const blocks = items.map(it => {
        const tx = pdfjsLib.Util.transform(unit.transform, it.transform), size = Math.hypot(tx[2], tx[3])
        const b = [tx[4] / unit.width, (tx[5] - size * 0.8) / unit.height, (tx[4] + it.width) / unit.width, (tx[5] + size * 0.25) / unit.height].map(v => Math.round(v * 1000))
        return { t: size >= 18 ? 'h1' : /^\d+$/.test(it.str.trim()) ? 'num' : 'p', x: it.str.trim(), b }
      })
      out.push({ w: c.width, h: c.height, grey: btoa(bin), blocks })
    }
    return out
  }, readFileSync(file).toString('base64'))
  await ctx.close()
  const pdf = makePdf({ pages: pages.map(pg => ({ images: [{ x: 0, y: 0, w: 612, h: 792, pw: pg.w, ph: pg.h, data: Buffer.from(pg.grey, 'base64') }] })) })
  return { pdf, recognised: pages.map((pg, i) => ({ page: i + 1, printed_page: null, columns: 1, blocks: pg.blocks })) }
}
async function scanChecks(browser, origin) {
  const results = []
  const ok = (name, pass, detail) => { results.push({ name, pass: !!pass, ...(pass ? {} : { detail }) }); console.log(`${pass ? 'ok  ' : 'FAIL'} ${name}${pass ? '' : ' ' + String(JSON.stringify(detail)).slice(0, 400)}`) }
  const made = await makeScan(browser, origin, join(REPO, 'addbooks/web/test/pdf-fixtures/scan_0042.pdf'))
  const SCAN = join(OUT, 'scan_0042-scanned.pdf'); writeFileSync(SCAN, made.pdf)
  const hex = createHash('sha256').update(made.pdf).digest('hex').slice(0, 24)
  scanMock.recognised.set(hex, made.recognised)
  const chats = () => account.requests.filter(r => r.path === '/api/chat' || r.path === '/api/lab-chat')
  const spans = (page, n = 1) => page.evaluate(k => document.querySelectorAll(`.pdf-sheet[data-page="${k}"] .text-layer span`).length, n)
  const fresh = async ({ width, height, legacy }) => {
    const ctx = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1, hasTouch: width < 700 })
    await ctx.addInitScript(([session]) => {
      try {
        localStorage.setItem('sb-local-auth-token', JSON.stringify(session))
        localStorage.setItem('tinct-addbook:rights:' + session.user.id, JSON.stringify({ at: new Date().toISOString(), v: '2026-10-08.2' }))
      } catch {}
      // Every line the toast says, as it says it (a later one replaces it on screen).
      window.__toasts = []
      new MutationObserver(() => { const t = document.querySelector('.byob-toast'); if (t && !t.hidden && t.textContent && window.__toasts.at(-1) !== t.textContent) window.__toasts.push(t.textContent) })
        .observe(document, { subtree: true, childList: true, characterData: true, attributes: true })
    }, [SESSION])
    const page = await ctx.newPage(), problems = []
    page.on('pageerror', e => problems.push('pageerror: ' + e.message))
    scanMock.legacy = !!legacy; scanMock.uploadDelay = 2500; scanMock.log.length = 0
    // Added on My shelf a moment ago (add-engine keepFile): kept on this device, not yet in the account.
    await page.goto(`${origin}/library`)
    await page.evaluate(async ([b64, hex, owner]) => {
      const bytes = Uint8Array.from(atob(b64), c => c.charCodeAt(0))
      const db = await new Promise((resolve, reject) => { const r = indexedDB.open('tinct-addbook', 1); r.onupgradeneeded = () => r.result.createObjectStore('books', { keyPath: 'key' }); r.onsuccess = () => resolve(r.result); r.onerror = () => reject(r.error) })
      await new Promise((resolve, reject) => { const tx = db.transaction('books', 'readwrite'); tx.objectStore('books').put({ key: 'pdf:' + hex, kind: 'pdf', name: 'scan_0042-scanned.pdf', title: 'scan_0042-scanned', author: '', owner, size: bytes.length, addedAt: Date.now(), openedAt: Date.now(), bytes: bytes.buffer }); tx.oncomplete = resolve; tx.onerror = () => reject(tx.error) })
      db.close()
    }, [made.pdf.toString('base64'), hex, SESSION.user.id])
    await page.goto(`${origin}/lab/addbook/?userBook=${hex}`)
    return { ctx, page, problems }
  }
  const noText = page => page.evaluate(() => (window.__toasts || []).some(t => /scan without text/.test(t)))

  // 1. The first-open race against an account that answers 404 until the copy is stored (the Worker before
  //    PR D): asked again once the copy is in, and the offer comes; the "can't be read aloud" line never shows.
  {
    const removeAll = () => { account.books = account.books.filter(b => !b.sha256.startsWith(hex)); scanMock.jobs.delete(hex) }
    removeAll()
    const { ctx, page, problems } = await fresh({ width: 1440, height: 900, legacy: true })
    const offer = await page.waitForSelector('.byob-ocr[data-kind="offer"]', { timeout: 30000 }).then(() => true).catch(() => false)
    const asks = scanMock.log.filter(([m, part, h]) => m === 'GET' && part === 'job' && h === hex)
    ok('an account that answers 404 until the copy is stored: the scan is asked about again once it is saved, and recognition is offered', offer && asks.length >= 2 && asks[0][3] === false && asks.at(-1)[3] === true, { offer, asks })
    ok('...and "This PDF is a scan without text" never shows meanwhile', !await noText(page) && !problems.length, { toasts: await page.evaluate(() => window.__toasts), problems })
    await ctx.close()
    removeAll()
  }
  // 2. The same against PR D's Worker ({ state: 'none', stored: false }), then recognised, on the desktop.
  const { ctx, page, problems } = await fresh({ width: 1440, height: 900 })
  const t0 = Date.now()
  const offered = await page.waitForSelector('.byob-ocr[data-kind="offer"]', { timeout: 30000 }).then(() => Date.now() - t0).catch(() => null)
  const first = scanMock.log.find(([m, part, h]) => m === 'GET' && part === 'job' && h === hex)
  ok('a scan added now: recognition is offered at once, while its account copy is still on its way (status "none", stored: false)', offered !== null && first?.[3] === false && offered < scanMock.uploadDelay + 2000, { offered, first })
  ok('the "can\'t be read aloud" line is never shown while recognition is on', !await noText(page))
  // Before its text is recognised, a scan offers no "Before you start": no trigger, and B makes nothing
  // (it once made a primer of blank pages that failed after 80 s).
  await page.mouse.click(1200, 600); await page.waitForTimeout(300)
  const q0 = chats().length
  await page.keyboard.press('b'); await page.waitForTimeout(800)
  const noPrimer = await page.evaluate(() => ({ trigger: !!document.querySelector('.mr-trigger'), primer: !!document.querySelector('.mr-primer'), marks: document.querySelectorAll('.mr-mark.is-trigger, [data-trigger]').length }))
  ok('a scan with no text yet: no "Before you start" trigger, and B opens and asks nothing', !noPrimer.trigger && !noPrimer.primer && !noPrimer.marks && !chats().slice(q0).some(r => r.body?.companion?.intent === 'chapter'), { noPrimer, asked: chats().slice(q0).map(r => r.body?.companion?.intent) })
  await shot(page, 'scan-1440x900-offer')
  // Started before the copy is stored: it waits for it, then sends the pages.
  await page.click('.byob-ocr [data-ocr="start"]')
  const layered = await page.waitForFunction(() => document.querySelectorAll('.pdf-sheet[data-page="1"] .text-layer span').length > 10, null, { timeout: 60000 }).then(() => true).catch(() => false)
  ok('recognised (mocked): the scan stays in the PDF reader, never the book reader, and its words are laid over page 1', layered && new URL(page.url()).pathname === '/lab/addbook/' && (await spans(page)) > 10, { url: page.url(), spans: await spans(page) })
  const puts = scanMock.log.filter(([m, part]) => m === 'PUT' && part === 'pages')
  ok('the pages were sent after the account copy was stored, every one', puts.length === made.recognised.length && puts.every(([, , , stored]) => stored), puts)
  // Placement: each line's span over its printed words (the fixture's own boxes), within 1% of the page.
  const placed = await page.evaluate(lines => {
    const pg = document.querySelector('.pdf-sheet[data-page="1"] .pg').getBoundingClientRect()
    const list = [...document.querySelectorAll('.pdf-sheet[data-page="1"] .text-layer span')], seen = new Map()
    return lines.map(L => {
      // The same line of text can be printed twice on a page: the nth time, the nth span.
      const t = L.x.replace(/\s+/g, ' '), k = seen.get(t) || 0; seen.set(t, k + 1)
      const sp = list.filter(s => s.textContent.replace(/\s+/g, ' ').trim() === t)[k]; if (!sp) return { x: L.x, missing: true }
      const r = sp.getBoundingClientRect()
      return { x: L.x.slice(0, 30), dl: Math.abs((r.left - pg.left) / pg.width - L.b[0] / 1000), dt: Math.abs((r.top - pg.top) / pg.height - L.b[1] / 1000), dr: Math.abs((r.right - pg.left) / pg.width - L.b[2] / 1000) }
    })
  }, made.recognised[0].blocks.filter(b => b.t === 'p'))
  const off = placed.filter(q => q.missing || q.dl > 0.01 || q.dt > 0.012 || q.dr > 0.015)
  ok('every recognised line of page 1 sits over its printed words: left, top and right within about 1% of the page', placed.length > 10 && !off.length, off.slice(0, 5))
  ok('the scan now reads aloud and summarizes (its recognised text), and the Tinct text is one tap away', await page.evaluate(() => !document.getElementById('playBtn').disabled && !hasNoText() && !document.getElementById('textBtn').hidden))
  // Selection on the scan opens the margin's bar.
  const selected = await selectText(page)
  const bar = await page.waitForSelector('.mr-bar, .mr-pbar', { timeout: 8000 }).then(() => true).catch(() => false)
  await page.waitForTimeout(250)
  const barProblems = await checkMargin(page)
  ok('selecting words on the scan opens the margin bar, laid out cleanly', !!selected && bar && !barProblems.length, { selected, barProblems })
  await shot(page, 'scan-1440x900-bar')
  // Explain from the bar: the passage and the whole document are the recognised text.
  const c0 = chats().length
  await page.click('.mr-bar [data-m="explain"]').catch(() => {})
  await page.waitForTimeout(1500)
  const explain = chats().slice(c0).find(r => r.body?.companion?.intent === 'explain')
  const units = explain?.body?.companion?.document?.units || []
  const p2 = made.recognised[1].blocks.find(b => b.t === 'p').x
  ok('Explain on the scan sends the selected words, and the whole document as its recognised text, page by page', explain && explain.body.companion.selection?.length > 10 && selected.includes(explain.body.companion.selection.slice(0, 12)) && units.length === made.recognised.length && units[1].text.includes(p2), { selection: explain?.body?.companion?.selection, units: units.map(u => u.text.slice(0, 40)) })
  await page.waitForTimeout(400)
  const cardProblems = await checkMargin(page)
  ok('the answer card beside the scan is laid out cleanly', !cardProblems.length, cardProblems)
  await shot(page, 'scan-1440x900-card')
  // A whole-PDF question.
  await page.keyboard.press('Escape'); await page.mouse.click(5, 895)
  const w0 = chats().length
  await page.keyboard.press('/'); await page.keyboard.type('What does this report say?'); await page.keyboard.press('Enter'); await page.waitForTimeout(1500)
  const whole = chats().slice(w0).find(r => /What does this report say\?/.test(JSON.stringify(r.body.messages)))
  ok('a whole-PDF question on the scan carries every page\'s recognised text, never a blank page', whole?.body?.companion?.scope === 'whole' && whole.body.companion.document?.units?.length === made.recognised.length && whole.body.companion.document.units.every(u => u.text.trim().length > 20), { units: whole?.body?.companion?.document?.units?.map(u => u.text.length) })
  // The primer (B): the unit's pages are the recognised text.
  await page.keyboard.press('Escape'); await page.mouse.click(5, 895)
  await page.evaluate(() => goTo({ page: 1, frac: 0 })); await page.waitForTimeout(600)
  const b0 = chats().length
  await page.keyboard.press('b')
  const primed = await page.waitForSelector('.mr-col .mr-primer .mr-primer__gist', { timeout: 10000 }).then(() => true).catch(() => false)
  const pr = chats().slice(b0).find(r => r.body?.companion?.intent === 'chapter')
  ok('the primer on the scan is made from its recognised text and shows in the column', primed && pr?.body?.companion?.context?.pages?.every(pg => pg.text.trim().length > 20) && pr.body.companion.document?.units?.length === made.recognised.length, { primed, pages: pr?.body?.companion?.context?.pages?.map(pg => pg.text.length) })
  await page.waitForTimeout(300)
  const primerProblems = await checkMargin(page)
  ok('the primer beside the scan is laid out cleanly', !primerProblems.length, primerProblems)
  await shot(page, 'scan-1440x900-primer')
  ok('no page errors on the desktop', !problems.length, problems)
  await ctx.close()

  // 3. The phone, opening the recognised scan from the account (its recognised pages fetched again).
  {
    const ph = await readerPage(browser, origin, hex, { width: 390, height: 844, look: 'paper' }).catch(e => ({ error: String(e.message || e) }))
    if (ph.error) ok('phone: the recognised scan opens with its text layer', false, ph.error)
    else {
      const sel = await selectText(ph.page)
      const pbar = await ph.page.waitForSelector('.mr-bar, .mr-pbar', { timeout: 8000 }).then(() => true).catch(() => false)
      await ph.page.waitForTimeout(250)
      const list = await checkMargin(ph.page)
      ok('phone: the recognised scan opens in the PDF reader with its words over the page; a selection opens the bar, laid out cleanly', new URL(ph.page.url()).pathname === '/lab/addbook/' && !!sel && pbar && !list.length && !ph.problems.length, { sel, pbar, list, problems: ph.problems })
      await shot(ph.page, 'scan-390x844-bar')
      await ph.page.click('.mr-float [data-m="explain"], .mr-pbar [data-m="explain"]').catch(() => {})
      await ph.page.waitForTimeout(1500)
      const cardList = await checkMargin(ph.page)
      ok('phone: the answer card over the scan is laid out cleanly', !cardList.length, cardList)
      await shot(ph.page, 'scan-390x844-card')
      await ph.ctx.close()
    }
  }
  // 4. A scan recognised before boxes existed (IMG_20240512_scan.pdf, pictures only): laid out by its ink alone, in Night.
  {
    const old = addBook(join(REPO, 'addbooks/web/test/pdf-fixtures/IMG_20240512_scan.pdf'))
    const say = n => `Page ${n} of the old letter tells of the harbour and the long winter that followed, as the letters go on.`
    scanMock.recognised.set(old, [1, 2].map(n => ({ page: n, printed_page: null, blocks: [{ t: 'h2', x: `Letter ${n}` }, { t: 'p', x: say(n) }, { t: 'p', x: say(n).replace('old', 'second') }] })))
    scanMock.jobs.set(old, { pages: 2, missing: new Set(), ready: new Set(), done: new Set([1, 2]) })
    const O = await readerPage(browser, origin, old, { width: 1024, height: 768, look: 'night', minSpans: 4 }).catch(e => ({ error: String(e.message || e) }))
    if (O.error) ok('a scan recognised without boxes opens with its text layer', false, O.error)
    else {
      const text = await O.page.evaluate(() => [...document.querySelectorAll('.pdf-sheet[data-page="1"] .text-layer span')].map(s => s.textContent).join(''))
      const sel = await selectText(O.page)
      const b = await O.page.waitForSelector('.mr-bar, .mr-pbar', { timeout: 8000 }).then(() => true).catch(() => false)
      await O.page.waitForTimeout(250)
      const list = await checkMargin(O.page)
      ok('a scan recognised without boxes (all picture): its words are on the page in order, selectable, the bar laid out cleanly', /Letter 1\s+Page 1 of the old letter/.test(text) && !!sel && b && !list.length && !O.problems.length, { text: text.slice(0, 80), sel, b, list, problems: O.problems })
      await O.ctx.close()
    }
  }
  scanMock.uploadDelay = 0; scanMock.legacy = false
  return results
}

const server = await start(Number(process.env.PORT || 4791))
const origin = `http://127.0.0.1:${server.address().port}`
const browser = await chromium.launch({ executablePath: EXEC, args: ['--mute-audio'] })
let failed = false
const RUNS = {
  fixture: [fixtureRows, rows => rows.some(r => r.problems)],
  reader: [readerMatrix, rows => rows.some(r => r.problems)],
  column: [columnMatrix, rows => rows.some(r => r.problems)],
  resize: [resizeRun, rows => rows.some(r => r.problems)],
  behaviour: [behaviour, rows => rows.some(r => !r.pass)],
  primer: [primerBehaviour, rows => rows.some(r => !r.pass)],
  'primer-reliability': [primerReliability, rows => rows.some(r => !r.pass)],
  keys: [keysAndAccess, rows => rows.some(r => !r.pass)],
  contrast: [contrast, rows => rows.some(r => r.required && !r.pass)],
  // The EPUB margin is off in the reader for now (reader.js EPUB_MARGIN = false): its check runs in
  // `sample` and `full` only with EPUB_MARGIN=1 (or on its own: `node scripts/margin-check.mjs epub`).
  ...(process.env.EPUB_MARGIN === '1' ? { epub: [epubCheck, rows => rows.some(r => r.problems)] } : {}),
  scans: [scanChecks, rows => rows.some(r => !r.pass)],
}
try {
  if (mode === 'sample' || mode === 'full') {
    // Every check in one run; each writes {name}-results.json. A failure in one does not stop the rest.
    SAMPLE = mode === 'sample'
    const started = Date.now(), summary = []
    for (const [name, [run, bad]] of Object.entries(RUNS)) {
      // Each check starts from an empty account, as it does when run on its own.
      account.marks.clear(); account.cards.clear(); account.primers.clear(); account.requests.length = 0
      const t = Date.now(), rows = await run(browser, origin), fail = bad(rows)
      writeFileSync(join(OUT, `${name}-results.json`), JSON.stringify(rows, null, 2))
      summary.push({ check: name, rows: rows.length, failed: fail, seconds: Math.round((Date.now() - t) / 1000) })
      console.log(`== ${name}: ${rows.length} row(s), ${fail ? 'FAILED' : 'clean'}, ${Math.round((Date.now() - t) / 1000)}s`)
      failed ||= fail
    }
    writeFileSync(join(OUT, `${mode}-summary.json`), JSON.stringify({ mode, seconds: Math.round((Date.now() - started) / 1000), summary }, null, 2))
  }
  else if (mode === 'contrast') { const rows = await contrast(browser, origin); failed = rows.some(r => r.required && !r.pass); writeFileSync(join(OUT, 'contrast-results.json'), JSON.stringify(rows, null, 2)) }
  else if (mode === 'keys') { const rows = await keysAndAccess(browser, origin); failed = rows.some(r => !r.pass); writeFileSync(join(OUT, 'keys-results.json'), JSON.stringify(rows, null, 2)) }
  else if (mode === 'fixture') { const rows = await fixtureRows(browser, origin); failed = rows.some(r => r.problems); writeFileSync(join(OUT, 'fixture-results.json'), JSON.stringify(rows, null, 2)) }
  else if (mode === 'reader') { const rows = await readerMatrix(browser, origin); failed = rows.some(r => r.problems); writeFileSync(join(OUT, 'reader-results.json'), JSON.stringify(rows, null, 2)) }
  else if (mode === 'serve') { for (const f of PDFS) console.log(addBook(f), f); console.log(origin); await new Promise(() => {}) }
  else if (mode === 'primer-reliability') { const rows = await primerReliability(browser, origin); failed = rows.some(r => !r.pass); writeFileSync(join(OUT, 'primer-reliability-results.json'), JSON.stringify(rows, null, 2)) }
  else if (mode === 'primer') { const rows = await primerBehaviour(browser, origin); failed = rows.some(r => !r.pass); writeFileSync(join(OUT, 'primer-results.json'), JSON.stringify(rows, null, 2)) }
  else if (mode === 'behaviour') { const rows = await behaviour(browser, origin); failed = rows.some(r => !r.pass); writeFileSync(join(OUT, 'behaviour-results.json'), JSON.stringify(rows, null, 2)) }
  else if (mode === 'column') { const rows = await columnMatrix(browser, origin); failed = rows.some(r => r.problems); writeFileSync(join(OUT, 'column-results.json'), JSON.stringify(rows, null, 2)) }
  else if (mode === 'resize') { const rows = await resizeRun(browser, origin); failed = rows.some(r => r.problems); writeFileSync(join(OUT, 'resize-results.json'), JSON.stringify(rows, null, 2)) }
  else if (mode === 'epub') { const rows = await epubCheck(browser, origin); failed = rows.some(r => r.problems); writeFileSync(join(OUT, 'epub-results.json'), JSON.stringify(rows, null, 2)) }
  else if (mode === 'scans') { const rows = await scanChecks(browser, origin); failed = rows.some(r => !r.pass); writeFileSync(join(OUT, 'scans-results.json'), JSON.stringify(rows, null, 2)) }
  else if (mode === 'pairs') { const list = await pairs(browser, origin); console.log(list.join('\n')) }
  else throw new Error('unknown mode: ' + mode)
} finally { await browser.close(); server.close() }
if (failed) { console.error('Layout problems found; see ' + OUT); process.exit(1) }
