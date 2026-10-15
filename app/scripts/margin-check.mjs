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
//   node scripts/margin-check.mjs primer-kinds        Before you start per kind (paper, textbook, narrative, practical, other; mocked replies), a
//                                                     primer stored before kinds, and a long book without an outline (MacKay's case): chapter 1, labelled
//   node scripts/margin-check.mjs keys                PR 4: the keys (N, B, /, Escape, More's arrows), focus, labels, the live region
//   node scripts/margin-check.mjs figures           FIXES items 4–7: figure detection, the chip kept on screen, the figure's card beside it, figure questions
//   node scripts/margin-check.mjs figure-margins    retest of 15 Oct: captions in the margin (MacKay), a formula's card without a caption,
//                                                     a caption selected and highlighted, a question naming a figure on another page
//   node scripts/margin-check.mjs long                PR F: a 585-page book: printed page numbers, the whole-book search with a question,
//                                                     the primer's chapter (never the index), reading order round a figure, the reopen
//   node scripts/margin-check.mjs contrast            PR 4: text contrast of every margin colour pair in every look (a report)
//   node scripts/margin-check.mjs epub                PR C: an EPUB in the PDF reader: the bar, More, Related, Explain, crowding,
//                                                     a zoom, a note and Copy quote, at every viewport. The EPUB margin is off in
//                                                     the reader (EPUB_MARGIN = false): this mode turns it on for its pages; in
//                                                     `sample`/`full` it runs only with EPUB_MARGIN=1.
//   node scripts/margin-check.mjs scans               PR D: a scanned PDF added, offered recognition at once (the first-open race),
//                                                     recognised (mocked), its words laid over the pages; the bar, a whole-PDF
//                                                     question and the primer on it, desktop and phone; a scan recognised without boxes
//   node scripts/margin-check.mjs polish              Anders's feedback of 15 Oct: no foot line (Chat), the caret, the highlighter and
//                                                     pencil, delete with Undo, one scroll surface, the primer opening in place
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
const { proseBook, makePdf, figurePaper, longBook, marginPaper } = await import(pathToFileURL(join(REPO, 'addbooks/web/test/make-pdf.mjs')).href)
const LONG_BOOK = join(OUT, 'long_prose_book.pdf')
writeFileSync(LONG_BOOK, proseBook({ paragraphs: 48 }))
// FIXES-2026-10-15 items 4–7: a paper of figures (a labelled network diagram, a block diagram at the page's left edge, a table, a large figure).
const FIGURE_PAPER = join(OUT, 'figure_paper.pdf')
writeFileSync(FIGURE_PAPER, figurePaper())
// Retest of 15 Oct: figures with captions in a wide right margin, as MacKay sets them.
const MARGIN_PAPER = join(OUT, 'margin_paper.pdf')
writeFileSync(MARGIN_PAPER, marginPaper())
// PR F: a book-length PDF (the Sutton and Barto stand-in, gloss-test/edge.html): parts, chapters, an index, printed numbers 22 behind the file's.
const BOOK = longBook({ meta: true })
const BIG_BOOK = join(OUT, 'long_book.pdf')
writeFileSync(BIG_BOOK, BOOK.bytes)
// The same book without bookmarks, only its printed Contents (MacKay's 640 pages have no outline; Anders, 15 Oct).
const BARE = longBook({ meta: true, bookmarks: false })
const BARE_BOOK = join(OUT, 'long_book_no_outline.pdf')
writeFileSync(BARE_BOOK, BARE.bytes)

// The class names of css/margin.css, as the check's selectors (the phone More's rows are buttons).
export const SELECTORS = {
  ...DEFAULT_SELECTORS,
  menu: '.mr-more, .mr-pmore, .mr-define, .mr-note',
  // PR 3: the primer's trigger and the primer are blocks of the column, as cards are (no overlap, never off screen).
  // Since 15 Oct the "Deleted · Undo" line keeps a deleted card's place in the column: a block, as the cards are.
  card: DEFAULT_SELECTORS.card + ', .mr-trigger, .mr-primer, .mr-col .mr-undo',
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
export const ICON_TARGETS = '.mr-card__copy, .mr-card__delete, .mr-undo button, .mr-follow__mic, .mr-swatch, .mr-sheet__grab, .mr-follow__link, button.mr-related__row'
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
// error event when `mock.chunksFail` is set (Quiz me's questions arriving one by one); a string
// names the error's type (`cut_off`: the Worker's answer stopped by its output bound, max_tokens).
// `mock.nextFor[intent]` replaces the next answer of that intent only, and `mock.delayFor[intent]` delays an
// unstreamed answer of that intent (Define's two requests run at once, so `next` alone could go to either).
export const mock = { next: null, nextFor: {}, delay: 0, delayFor: {}, primer: null, primers: [], chunks: null, chunksFail: false, fail: null }
/** The mocked Fact-check's opening, streamed before "Checking sources…" as the Worker streams it while the search runs. */
export const FACTCHECK_OPENING = 'MOCK opening: the passage claims what it says, and the document offers its own table {p. 1}.'
function mockText(body) {
  const c = body?.companion || {}, intent = c.intent
  if (mock.nextFor[intent] != null) { const t = mock.nextFor[intent]; delete mock.nextFor[intent]; return t }
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
  // Fact-check, doc-first (15 Oct): the opening from the document, then the verdict once, a note and the sources.
  if (intent === 'factcheck') return `${FACTCHECK_OPENING}\n\nHolds. MOCK verdict line for the passage.\n\nNote. Useful context that is not a verdict.\n\nSources: [Mock source one](https://example.org/one) · [Mock source two](https://example.org/two)`
  return 'MOCK ANSWER. The bottom line comes first {p. 1}.\n\nThen a short paragraph {p. 3}.'
}
async function mockChat(body, res) {
  // A check may make one intent fail (PR C: a failed quiz marking keeps the reader's answer).
  if (mock.fail && body?.companion?.intent === mock.fail) return json(res, 500, { error: { type: 'api_error', message: 'mock failure' } })
  if (mock.delay && !body?.stream) await new Promise(r => setTimeout(r, mock.delay))
  const own = mock.delayFor[body?.companion?.intent]
  if (own && !body?.stream) await new Promise(r => setTimeout(r, own))
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
  // Fact-check, as the Worker streams it (doc-first, 15 Oct): the opening at once, then the status while the search runs, then the rest.
  if (body?.companion?.intent === 'factcheck' && !mock.chunks && text.startsWith(FACTCHECK_OPENING)) {
    res.write(`event: content_block_delta\ndata: ${JSON.stringify({ type: 'content_block_delta', delta: { type: 'text_delta', text: FACTCHECK_OPENING } })}\n\n`)
    res.write(`event: tinct_status\ndata: ${JSON.stringify({ type: 'tinct_status', text: 'Checking sources\u2026' })}\n\n`)
    await new Promise(r => setTimeout(r, mock.delay || 400))
    res.write(`event: content_block_delta\ndata: ${JSON.stringify({ type: 'content_block_delta', delta: { type: 'text_delta', text: text.slice(FACTCHECK_OPENING.length) } })}\n\n`)
    return res.end('event: message_stop\ndata: {"type":"message_stop"}\n\n')
  }
  if (body?.companion?.intent === 'factcheck') { res.write(`event: tinct_status\ndata: ${JSON.stringify({ type: 'tinct_status', text: 'Checking sources\u2026' })}\n\n`); await new Promise(r => setTimeout(r, mock.delay || 400)) }
  else if (mock.delay) await new Promise(r => setTimeout(r, mock.delay))
  if (mock.chunks) {
    const chunks = mock.chunks, fail = mock.chunksFail; mock.chunks = null; mock.chunksFail = false
    for (const c of chunks) { await new Promise(r => setTimeout(r, c.wait || 0)); res.write(`event: content_block_delta\ndata: ${JSON.stringify({ type: 'content_block_delta', delta: { type: 'text_delta', text: c.text } })}\n\n`) }
    if (fail) return res.end(`event: error\ndata: ${JSON.stringify({ type: 'error', error: { type: typeof fail === 'string' ? fail : 'upstream_error', message: 'The reply was interrupted. Please try again.' } })}\n\n`)
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
      const body = JSON.parse((await readBody(req)).toString() || '{}'), entry = { path: p, body, at: Date.now(), done: 0 }; account.requests.push(entry)
      await mockChat(body, res); entry.done = Date.now(); return
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
// `at`: open the PDF at that page (the reader's ?page= link), for a book whose first pages carry little text.
async function readerPage(browser, origin, hex, { width, height, look, startPage = 1, zoom = 1, minSpans = 20, at = 0 }) {
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
  await page.goto(`${origin}/lab/addbook/?userBook=${hex}${look === 'eink' ? '&eink=1' : ''}${at ? '&page=' + at : ''}`)
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
    if (intent === 'factcheck') {
      await a.waitForTimeout(700)
      const during = await a.innerText('.mr-card.is-open')
      ok('Fact-check shows "Checking sources…" while the search runs (tinct_status)', /Checking sources…/.test(during))
      // Doc-first (15 Oct): the opening from the document is already there, above the status, and no verdict yet.
      ok('Fact-check: the opening from the document shows while the search runs, above "Checking sources…", before any verdict', during.indexOf('MOCK opening') > -1 && during.indexOf('MOCK opening') < during.indexOf('Checking sources…') && !/MOCK verdict/.test(during) && !(await a.$('.mr-card.is-open .is-bottom-line')), during)
    }
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
  const fcOrder = await a.evaluate(() => { const c = document.querySelector('.mr-card.is-open .mr-card__body'); const t = c.innerText; return { opening: t.indexOf('MOCK opening'), verdict: t.indexOf('Holds. MOCK verdict'), sources: t.indexOf('Mock source one'), bottom: c.querySelector('.is-bottom-line')?.textContent, verdicts: (t.match(/\bHolds\./g) || []).length, tag: !!c.querySelector('.mr-opening .mr-cite') } })
  ok('Fact-check: the opening first, then the verdict once as the bottom line, then the sources; the opening\'s tag is a tag', fcOrder.opening > -1 && fcOrder.opening < fcOrder.verdict && fcOrder.verdict < fcOrder.sources && fcOrder.bottom === 'Holds. MOCK verdict line for the passage.' && fcOrder.verdicts === 1 && fcOrder.tag, fcOrder)
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
  // Cut off by the output bound (15 Oct 2026: max_tokens left empty and half-written cards): the Worker's
  // cut_off error. The words already streamed are cleared, the card shows its error, and nothing is kept.
  {
    const answers = () => a.evaluate(() => keptCards().filter(c => c.kind === 'counterpoint').map(c => ({ id: c.id, answers: (c.turns || []).filter(t => t.role === 'assistant').map(t => t.content) })))
    const before = (await answers()).length
    await a.evaluate(() => { goTo({ page: 1, frac: 0 }); col.open = null }); await a.waitForTimeout(300)
    await selectText(a); await a.waitForSelector('.mr-bar')
    mock.chunks = [{ text: 'MOCK CUT. The strongest objection is', wait: 100 }, { text: ' that the', wait: 1200 }]; mock.chunksFail = 'cut_off'
    await a.click('.mr-bar [data-m="more"]'); await a.waitForSelector('.mr-more'); await a.click('.mr-more [data-m="counterpoint"]')
    await a.waitForFunction(() => /MOCK CUT/.test(document.querySelector('.mr-card.is-open')?.innerText || ''), null, { timeout: 4000 }).catch(() => {})
    const streaming = await a.innerText('.mr-card.is-open').catch(() => '')
    await a.waitForTimeout(1800)
    const shown = await a.innerText('.mr-card.is-open').catch(() => '')
    const kept = (await answers()).slice(before)
    ok('a cut-off answer (cut_off): the streamed words are cleared, the card shows its error, no answer is kept', /MOCK CUT/.test(streaming) && !/MOCK CUT/.test(shown) && /could not be loaded\. Try again\./.test(shown) && kept.length === 1 && kept[0].answers.length === 0, { streaming, shown, kept })
    // On the next visit a kept card without its answer is not shown; one with an answer is.
    const view = await a.evaluate(id => {
      const all = keptCards(), c = all.find(x => x.id === id)
      const old = { ...c, at: CARDS_SINCE - 60000, turns: [{ role: 'assistant', content: '' }] }
      const ids = TinctMargin.cardView([...all.filter(x => x.id !== id), old], [], { since: CARDS_SINCE }).map(x => x.id)
      return { hidden: !ids.includes(id), shownNow: TinctMargin.cardView(all, [], { since: CARDS_SINCE }).some(x => x.id === id), others: ids.length }
    }, kept[0]?.id)
    ok('a kept card without its answer from before this visit is not shown; this visit\'s still is (its error on it)', view.hidden && view.shownNow && view.others > 0, view)
    await fresh(a)
  }
  // The whole PDF: "/" opens Chat, its field ready (no foot line since 15 Oct); its answer is in the Chat card at the top.
  await a.evaluate(() => getSelection().removeAllRanges()); const w0 = account.requests.length
  await a.keyboard.press('/'); await a.keyboard.type('What is this about?'); await a.keyboard.press('Enter'); await a.waitForTimeout(1000)
  const whole = account.requests.slice(w0).find(r => /What is this about\?/.test(JSON.stringify(r.body.messages)))
  const pageCount = await a.evaluate(() => state.pages.length)
  ok('"/" sends the whole-file question: scope "whole" with every page of the PDF (the whole document, PR A), never the page alone', whole?.body?.companion?.scope === 'whole' && whole.body.companion.document?.units?.length === pageCount && !/say when something is not on these pages/.test(JSON.stringify(whole.body.messages)), { scope: whole?.body?.companion?.scope, units: whole?.body?.companion?.document?.units?.length, pageCount })
  ok('"/" asks about the whole PDF; the answer opens in the Chat card at the top of the column (first; the primer\'s trigger, when it shows, follows in its place)', whole?.body?.companion?.context?.kind === 'pdf' && (await a.innerText('.mr-col .mr-card.is-whole .mr-card__label')).startsWith('Chat') && (await a.evaluate(() => { const t = document.querySelector('.mr-col .mr-trigger'); const w = document.querySelector('.mr-col .mr-card.is-whole'); return w.offsetTop === 0 && (!t || t.offsetTop >= w.offsetTop + w.offsetHeight + TinctMargin.COL.cardGap - 0.5) })))
  await fresh(a)
  // Reopened, the Whole PDF card shows its earlier conversation at once (the same task, no frame later).
  await a.evaluate(() => { openCard(null) }); await a.waitForTimeout(300)
  const atOnce = await a.evaluate(() => { openWhole({ quiet: true }); return document.querySelector('.mr-col .mr-card.is-whole.is-open')?.innerText || '' })
  ok('Chat shows its earlier conversation the moment it opens', /What is this about\?/.test(atOnce) && /MOCK ANSWER/.test(atOnce), atOnce.slice(0, 200))
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
      mock.nextFor.define_sense = JSON.stringify({ sense: 0 }); const n5 = account.requests.length
      await selectText(C.page, { oneWord: true, near: ['middle', 'top', 'bottom'][tries % 3] }); await C.page.waitForTimeout(2200)
      const asked = account.requests.slice(n5).map(r => r.body?.companion?.intent)
      inText = asked.includes('define_sense') ? await C.page.evaluate(() => { const d = document.querySelector('.mr-define'); return d && { label: d.querySelector('.mr-define__in .mr-define__label')?.textContent, text: d.querySelector('.mr-define__in')?.textContent, senses: d.querySelectorAll('.mr-define__senses li').length, first: d.querySelector('.mr-define__in')?.compareDocumentPosition(d.querySelector('.mr-define__senses')) & Node.DOCUMENT_POSITION_FOLLOWING, kept: keptCards().some(c => c.kind === 'define' && /mocked meaning/.test(c.data?.inText || '')) } }) : null
      delete mock.nextFor.define_sense
      if (inText) ok('no sense fits: the companion\'s define asked, "In this text" first with its meaning, the dictionary\'s senses below; kept on the card', asked.includes('define') && inText.label === 'In this text' && /mocked meaning/.test(inText.text) && inText.senses >= 1 && !!inText.first && inText.kept, { asked, inText })
      await C.page.keyboard.press('Escape'); await C.page.evaluate(() => getSelection().removeAllRanges())
    }
    if (!inText) ok('no sense fits: "In this text" first', false, 'no dictionary word found to select')
    // 15 Oct, evening: online, define and define_sense go out together, and "In this text" shows first even when a
    // dictionary sense fits ("perplexity" read "confusion"); its {p. N} is a citation tag.
    let both = null
    for (let tries = 0; tries < 6 && !both; tries++) {
      mock.delayFor.define_sense = 900; mock.nextFor.define = JSON.stringify({ kind: 'definition', definition: 'Noun. MOCK in-text meaning, as the document uses it {p. 3}.' }); const n6 = account.requests.length
      await selectText(C.page, { oneWord: true, near: ['middle', 'top', 'bottom'][tries % 3] }); await C.page.waitForTimeout(2400)
      const reqs = account.requests.slice(n6), ds = reqs.find(r => r.body?.companion?.intent === 'define_sense'), df = reqs.find(r => r.body?.companion?.intent === 'define')
      both = ds ? await C.page.evaluate(() => { const d = document.querySelector('.mr-define'); return d && { label: d.querySelector('.mr-define__in .mr-define__label')?.textContent, text: d.querySelector('.mr-define__in')?.textContent, tag: d.querySelector('.mr-define__in .mr-cite')?.textContent, tagPage: d.querySelector('.mr-define__in .mr-cite')?.dataset.page, raw: /\{p\. 3\}/.test(d.innerText), fit: d.querySelector('.mr-define__senses li')?.classList.contains('is-fit'), first: d.querySelector('.mr-define__in')?.compareDocumentPosition(d.querySelector('.mr-define__senses')) & Node.DOCUMENT_POSITION_FOLLOWING } }) : null
      if (both) {
        ok('Define online: define and define_sense are sent together (define before define_sense has answered)', !!df && df.at < ds.done && Math.abs(df.at - ds.at) < 500, { define: df && df.at - ds.at, senseDone: ds.done - ds.at })
        ok('Define online: "In this text" first even when a dictionary sense fits (mocked sense 2), the fitting sense first below it', both.label === 'In this text' && /MOCK in-text meaning/.test(both.text) && both.fit === true && !!both.first, both)
        ok('Define: the in-text line\'s {p. 3} shows as a citation tag', both.tag === 'p. 3' && both.tagPage === '3' && !both.raw, both)
      }
      delete mock.delayFor.define_sense; delete mock.nextFor.define
      await C.page.keyboard.press('Escape'); await C.page.evaluate(() => getSelection().removeAllRanges())
    }
    if (!both) ok('Define online: define and define_sense together', false, 'no dictionary word found to select')
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
  // The unit's own pages, from its entry's page (not the title page before it, which only offers the trigger).
  const unitPages = u => u.to - u.start + 1
  const r0 = chats().length
  const trig = await a.evaluate(() => {
    const t = document.querySelector('.mr-col .mr-trigger'); if (!t) return null
    const cs = getComputedStyle(t), title = getComputedStyle(t.querySelector('.mr-trigger__title')), sub = getComputedStyle(t.querySelector('.mr-trigger__sub'))
    // Its page's first line of text, measured in the column.
    const p = state.pages[currentPlace().page - 1], spans = [...p.layer.querySelectorAll('span')].filter(s => s.textContent.trim()).map(s => s.getBoundingClientRect().top)
    const line = Math.min(...spans) - document.querySelector('.mr-col').getBoundingClientRect().top
    return { text: t.innerText.replace(/\s+/g, ' ').trim(), top: t.offsetTop, height: t.offsetHeight, line, key: !!t.querySelector('.mr-key'), tip: t.title, fill: cs.backgroundColor, radius: cs.borderRadius, rule: cs.boxShadow, italic: title.fontStyle, ink: [title.color, sub.color, getComputedStyle(document.querySelector('.mr-col')).getPropertyValue('--mr-ink').trim()] }
  })
  ok('at the PDF\'s start the trigger is a folded card at the page\'s first line less 4px: italic "Before you start", the unit\'s line, both in ink, a lead-coloured rule, no fill, no keycap ("Before you start (B)" in its title)', trig && trig.text === 'Before you start The gist and a map of chapter 1.' && Math.abs(trig.top - (trig.line - 4)) <= 1.5 && !trig.key && trig.tip === 'Before you start (B)' && trig.fill === 'rgba(0, 0, 0, 0)' && trig.radius === '0px' && /inset/.test(trig.rule) && trig.italic === 'italic' && trig.ink[0] === trig.ink[1], trig)
  ok('nothing is made when the file opens (only when the reader opens the trigger)', primers(0).length === 0)
  await a.keyboard.press('b'); await a.waitForSelector('.mr-col .mr-primer .mr-primer__gist', { timeout: 8000 }).catch(() => {})
  const req = primers(r0)[0]
  // It opens in place (Anders, 15 Oct): from its trigger's place, growing down; measured once it has grown.
  await a.waitForTimeout(450)
  const placeWant = await a.evaluate(t => TinctMargin.primerBox({ top: t.top, height: t.height }, document.querySelector('.mr-col').clientHeight).top, { top: trig?.top ?? 0, height: trig?.height ?? 0 })
  ok('B opens the primer in place: one chapter request, action primer for the unit, the unit\'s pages as a PDF', primers(r0).length === 1 && req.body.companion.chapter?.action?.kind === 'primer' && req.body.companion.chapter.action.unitKey === 'outline-0' && req.body.companion.chapter.action.unitTitle === 'Chapter 1. Of Ideas' && req.body.companion.context.kind === 'pdf' && req.body.companion.context.pages.length === unitPages(units[0]) && units.length === 5 && !req.body.companion.selection && !req.body.system, req?.body?.companion && { ...req.body.companion, context: { ...req.body.companion.context, pages: req.body.companion.context.pages.length } })
  const shown = await a.evaluate(() => { const p = document.querySelector('.mr-col .mr-primer'); return { heads: [...p.querySelectorAll('.mr-primer__head')].map(h => h.textContent), claims: p.querySelectorAll('.mr-primer__claims li').length, cites: p.querySelectorAll('.mr-primer__claims .mr-cite').length, rows: p.querySelectorAll('.mr-map__row').length, quiz: p.querySelector('.mr-quiz-row')?.innerText.replace(/\s+/g, ' '), foot: p.querySelector('.mr-primer__foot')?.innerText.replace(/\s+/g, ' '), cards: [...document.querySelectorAll('.mr-col .mr-card')].filter(c => !c.hidden).length, top: p.offsetTop, bottom: p.parentElement.clientHeight - p.offsetTop - p.offsetHeight, trigger: !!document.querySelector('.mr-col .mr-trigger') } })
  ok('the primer: gist, Key claims (numbered, cite tags), Keep in mind, Map, the quiz row and its footer, alone in the column', JSON.stringify(shown.heads) === '["Key claims","Keep in mind","Map"]' && shown.claims === 3 && shown.cites === 3 && shown.rows === 3 && shown.quiz === 'Quiz me on this chapter 3 questions →' && shown.foot === 'Made when you opened the file Redo' && shown.cards === 0 && Math.abs(shown.top - placeWant) <= 1 && shown.top >= Math.min(16, (trig?.top ?? 0) - 14) - 1 && shown.bottom === 70 && !shown.trigger, { ...shown, placeWant })
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

/* ---------- Before you start per kind (Anders, 15 Oct, option A): the model names the document's kind
   and writes that kind's sections; a primer stored before kinds still shows; and on a long book without
   an outline, the chapter (MacKay's 640 pages: "a map of the whole PDF", chapters 1 and 2 blended). ---------- */
const KIND_PRIMERS = {
  paper: { kind: 'paper', gist: 'MOCK paper gist. The paper argues one thing and tests it.', sections: [
    { title: 'Key claims', items: [1, 2, 3, 4].map(i => ({ text: `MOCK claim ${i}: a result the paper states and supports in its own words.`, cite: `{p. ${i}}` })) },
    { title: 'Keep in mind', items: [{ text: 'MOCK caution: the second experiment uses a different baseline.', cite: '' }, { text: 'MOCK caution: costs are estimated.', cite: '' }] }] },
  textbook: { kind: 'textbook', gist: 'MOCK textbook gist. The chapter sets up the tools the rest of the book leans on.', sections: [
    { title: 'What you’ll learn', items: [1, 2, 3].map(i => ({ text: `MOCK outcome ${i}: what the reader can explain after the chapter.`, cite: `{p. ${i}}` })) },
    { title: 'Ideas to hold onto', items: [{ text: 'MOCK idea: redundancy buys reliability at the cost of rate.', cite: '{p. 2}' }, { text: 'MOCK idea: the best rate has a limit.', cite: '{p. 3}' }] },
    { title: 'Terms', items: [{ term: 'Rate', meaning: 'Bits of message per bit sent.' }, { term: 'Capacity', meaning: 'The highest rate at which error can be made vanishingly small.' }, { term: 'Repetition code', meaning: 'Each bit sent several times and decoded by majority vote.' }] }] },
  narrative: { kind: 'narrative', gist: 'MOCK narrative gist. The chapter opens on a quiet house before a storm.', sections: [
    { title: 'Where we are', items: [{ text: 'MOCK: an estate in winter, the night of a party.', cite: '{p. 1}' }] },
    { title: 'People', items: [{ term: 'Ann', meaning: 'The host, newly widowed.' }, { term: 'Bo', meaning: 'Her brother, back after years abroad.' }] },
    { title: 'Threads to watch', items: [{ text: 'MOCK: why Bo came back now.', cite: '' }, { text: 'MOCK: the locked study.', cite: '{p. 2}' }] }] },
  practical: { kind: 'practical', gist: 'MOCK practical gist. The guide sets up the meter and takes a first reading.', sections: [
    { title: 'What it covers', items: [{ text: 'MOCK: setting up and calibrating the meter.', cite: '{p. 1}' }, { text: 'MOCK: taking and logging a reading.', cite: '{p. 2}' }] },
    { title: 'Steps or topics', items: ['Unpack and charge', 'Calibrate against the reference', 'Take a reading', 'Log it'].map((t, i) => ({ text: `MOCK step: ${t}.`, cite: `{p. ${i + 1}}` })) }] },
  other: { kind: 'other', gist: 'MOCK other gist. The document sets out an agenda and its background.', sections: [
    { title: 'Key points', items: [1, 2, 3].map(i => ({ text: `MOCK point ${i}.`, cite: `{p. ${i}}` })) },
    { title: 'Keep in mind', items: [{ text: 'MOCK caution: the dates are provisional.', cite: '' }] }] },
}
async function primerKinds(browser, origin) {
  const results = []
  const ok = (name, pass, detail) => { results.push({ name, pass: !!pass, ...(pass ? {} : { detail }) }); console.log(`${pass ? 'ok  ' : 'FAIL'} ${name}${pass ? '' : ' ' + String(JSON.stringify(detail)).slice(0, 400)}`) }
  const hex = addBook(LONG_BOOK)
  const chats = from => account.requests.slice(from).filter(r => r.path === '/api/chat' || r.path === '/api/lab-chat')
  const views = SAMPLE ? [[1440, 900, 'paper'], [390, 844, 'paper']] : [[1440, 900, 'paper'], [1440, 900, 'night'], [1024, 768, 'eink'], [390, 844, 'paper'], [390, 844, 'night'], [360, 740, 'book']]
  for (const [width, height, look] of views) {
    const phone = width < 700, tag = `primer_kinds-${width}x${height}-${look}`, where = phone ? '.mr-sheet .mr-primer' : (width < 1180 ? '.mr-primer.is-floating' : '.mr-col .mr-primer')
    const A = await readerPage(browser, origin, hex, { width, height, look })
    const a = A.page
    // The primer is offered once the file's scan says it has text (primerHasText).
    await a.waitForFunction(() => primer.units && primerHasText(), null, { timeout: 30000 }).catch(() => {})
    const open = async () => {
      await a.evaluate(() => { for (const k of Object.keys(localStorage)) if (k.includes(':primer:')) localStorage.removeItem(k); closePrimer(); openCard(null) })
      await a.evaluate(() => openPrimer(currentUnit()))
      await a.waitForSelector(`${where} .mr-primer__gist`, { timeout: 8000 }).catch(() => {})
      await a.waitForTimeout(300)
      return a.evaluate(sel => { const p = document.querySelector(sel); return p && { heads: [...p.querySelectorAll('.mr-primer__head')].map(h => h.textContent), unit: p.querySelector('.mr-primer__unit')?.textContent || null, first: p.querySelector('.mr-primer__gist')?.previousElementSibling?.className, numbered: p.querySelectorAll('ol.mr-primer__claims').length, terms: [...p.querySelectorAll('.mr-primer__keep li')].map(li => li.textContent).filter(t => t.includes(' — ')), quiz: !!p.querySelector('.mr-quiz-row') } }, where)
    }
    for (const [kind, reply] of Object.entries(KIND_PRIMERS)) {
      account.primers.clear()
      mock.primer = { ...reply, map: [1, 2, 3, 4].map(i => ({ title: `MOCK section ${i}`, pages: `p. ${i}` })) }
      const r0 = account.requests.length
      const shown = await open()
      mock.primer = null
      const req = chats(r0).find(r => r.body?.companion?.chapter?.action?.kind === 'primer')
      const want = [...reply.sections.map(x => x.title), 'Map']
      const terms = reply.sections.flatMap(x => x.items).filter(i => i.term).map(i => `${i.term} — ${i.meaning}`)
      ok(`${tag}: a ${kind}'s primer: the gist first (under the unit's name), then ${want.join(' · ')}, Quiz me${terms.length ? '; terms as "term — meaning"' : ''}`, req && shown && JSON.stringify(shown.heads) === JSON.stringify(want) && shown.unit === 'Chapter 1. Of Ideas' && shown.first === 'mr-primer__unit' && JSON.stringify(shown.terms) === JSON.stringify(terms) && shown.quiz && shown.numbered === (kind === 'narrative' ? 0 : 1), shown)
      const stored = account.primers.get(hex + '?outline-0')
      ok(`${tag}: a ${kind}'s primer is stored with its kind and sections`, stored?.kind === kind && stored.sections?.length === reply.sections.length, stored && { kind: stored.kind, sections: stored.sections?.length })
      const problems = await checkMargin(a)
      ok(`${tag}: a ${kind}'s primer has no layout problems`, problems.length === 0, problems.slice(0, 5))
      if (look === 'paper' || !SAMPLE) await shot(a, `${tag}-${kind}`)
    }
    // A primer made before kinds, in this browser and in the account: shown as it was (Key claims, Keep in mind).
    const old = { gist: 'MOCK old gist. Made before kinds.', claims: [1, 2, 3].map(i => ({ text: `MOCK old claim ${i}.`, cite: `{p. ${i}}` })), keepInMind: ['MOCK old caution.'], map: [1, 2, 3].map(i => ({ title: `Old section ${i}`, pages: `p. ${i}` })) }
    await a.evaluate(o => { for (const k of Object.keys(localStorage)) if (k.includes(':primer:')) localStorage.removeItem(k); closePrimer(); store.set(primerKey(currentUnit()), { ...o, madeAt: '2026-10-14T09:30:00.000Z', unitKey: currentUnit().key }) }, old)
    account.primers.set(hex + '?outline-0', { ...old, madeAt: '2026-10-14T09:30:00.000Z', unitKey: 'outline-0' })
    const r1 = account.requests.length
    await a.evaluate(() => openPrimer(currentUnit())); await a.waitForSelector(`${where} .mr-primer__gist`, { timeout: 8000 }).catch(() => {}); await a.waitForTimeout(500)
    const oldShown = await a.evaluate(sel => { const p = document.querySelector(sel); return p && { heads: [...p.querySelectorAll('.mr-primer__head')].map(h => h.textContent), text: p.innerText } }, where)
    ok(`${tag}: a primer stored before kinds still shows, as Key claims and Keep in mind, and is not made again`, oldShown && JSON.stringify(oldShown.heads) === '["Key claims","Keep in mind","Map"]' && /MOCK old claim 3/.test(oldShown.text) && /MOCK old caution/.test(oldShown.text) && !chats(r1).some(r => r.body?.companion?.chapter), oldShown?.heads)
    ok(`${tag}: no layout problems with the old primer`, (await checkMargin(a)).length === 0, await checkMargin(a))
    ok(`${tag}: no page errors`, !A.problems.length, A.problems)
    await A.ctx.close()
  }
  // MacKay's case: a long book with no outline, only its printed Contents. Its units are the contents'
  // chapters; from the front matter, B makes chapter 1's primer alone, named as chapter 1; the trigger
  // never says "the whole PDF".
  const bare = addBook(BARE_BOOK), m = BARE.meta, ch1 = m.chapters[0]
  for (const [width, height] of [[1440, 900], [390, 844]]) {
    const phone = width < 700, tag = `primer_no_outline-${width}x${height}`, where = phone ? '.mr-sheet .mr-primer' : '.mr-col .mr-primer'
    const A = await readerPage(browser, origin, bare, { width, height, look: 'paper', at: 8 })
    const a = A.page
    await a.waitForFunction(() => primer.units && primerHasText(), null, { timeout: 30000 }).catch(() => {})
    const units = await a.evaluate(() => primer.units.map(u => ({ key: u.key, title: u.title, label: u.label || null, from: u.from, start: u.start, to: u.to, matter: u.matter || null })))
    ok(`${tag}: no outline: the units are the printed contents' chapters, not one unit for the whole PDF`, units.length >= 17 && units.every(u => u.key !== 'all') && units.some(u => u.label === 'Chapter 1: Introduction' && u.start === ch1.from && u.to === ch1.to), units.slice(0, 3))
    const lines = await a.evaluate(n => { const out = []; for (let p = 1; p <= n; p += 9) out.push(TinctMargin.triggerLine(TinctMargin.primerUnitAt(primer.units, p))); return out }, m.pages)
    ok(`${tag}: the trigger names its chapter on every page, never "the whole PDF"`, lines.every(l => /^The gist and a map of chapter \d+\.$/.test(l)), [...new Set(lines)].slice(0, 6))
    await a.evaluate(() => { goTo({ page: 8, frac: 0.1 }); onScroll() }); await a.waitForTimeout(600)
    // Made fresh on each device here (the account's copy from the desktop run is cleared). The phone has no B key: the same call.
    account.primers.clear()
    const r0 = account.requests.length
    if (phone) await a.evaluate(() => openPrimer()); else await a.keyboard.press('b')
    await a.waitForSelector(`${where} .mr-primer__gist`, { timeout: 15000 }).catch(() => {}); await a.waitForTimeout(400)
    const req = chats(r0).find(r => r.body?.companion?.chapter?.action?.kind === 'primer')
    const c = req?.body?.companion
    const sent = c && { title: c.chapter.action.unitTitle, key: c.chapter.action.unitKey, pages: c.context.pages.length, doc: c.document && { first: c.document.units[0]?.n, last: c.document.units.at(-1)?.n, part: !!c.document.part } }
    ok(`${tag}: ${phone ? 'opened' : 'B'} on the preface makes chapter 1's primer alone ("Chapter 1: Introduction", its ${ch1.to - ch1.from + 1} pages; the document part is that chapter)`, sent?.title === 'Chapter 1: Introduction' && sent.pages === ch1.to - ch1.from + 1 && sent.doc?.part, sent)
    const label = await a.evaluate(sel => document.querySelector(`${sel} .mr-primer__unit`)?.textContent || null, where)
    ok(`${tag}: the primer is labelled as that chapter`, label === 'Chapter 1: Introduction', label)
    ok(`${tag}: no layout problems`, (await checkMargin(a)).length === 0, await checkMargin(a))
    await shot(a, tag)
    ok(`${tag}: no page errors`, !A.problems.length, A.problems)
    await A.ctx.close()
  }
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
  ok('"/" opens Chat with the focus in its field (no foot line)', await a.evaluate(() => !document.querySelector('.mr-foot') && !!document.activeElement?.closest('.mr-card.is-whole.is-open') && document.activeElement.classList.contains('mr-follow__input')))
  await a.keyboard.type('n b'); await a.waitForTimeout(100)
  ok('typing in a field never triggers a key (N, B)', (await a.inputValue('.mr-card.is-whole .mr-follow__input')) === 'n b' && !(await a.$('.mr-note, .mr-col .mr-primer')))
  await a.evaluate(() => { const f = document.querySelector('.mr-card.is-whole .mr-follow__input'); f.value = ''; f.blur(); openCard(null) })
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
// Small text that must reach 4.5:1 in every look: "Checking sources…", the primer's numbers and footer (the "/ the whole PDF"
// foot line is gone since 15 Oct),
// and the "N more on this page" row (release train 2: 3.89:1 in Paper and 4.28:1 in Book before).
const HINT_TEXT = ['status line', 'primer numbers', 'primer footer', 'stack row']
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
      const cases = [['bar words', '[data-strip="a"] .mr-bar .is-ask'], ['More line', '[data-strip="c"] .mr-more__row span'], ['Define senses (secondary)', '[data-strip="e"] .mr-define__senses li:not(.is-fit)'], ['card label', '.cardbg .mr-card.is-open .mr-card__label'], ['quote', '.cardbg .mr-quote'], ['answer', '.cardbg .mr-answer p'], ['citation tag', '.cardbg .mr-cite'], ['status line', '[data-card="factcheck-checking"] .mr-status'], ['sources', '.cardbg .mr-sources a'], ['folded text', '[data-desk="margin"] .mr-card.is-folded .mr-card__text'], ['stack row', '[data-desk="overlap"] .mr-stack span'], ['trigger line', '[data-desk="trigger"] .mr-trigger__sub'], ['primer heading', '[data-desk="primer"] .mr-primer__head'], ['primer numbers', '[data-desk="primer"] .mr-primer__n'], ['map pages', '[data-desk="primer"] .mr-map__pages'], ['primer footer', '[data-desk="primer"] .mr-primer__foot span'], ['quiz link', '[data-card="quiz"] .mr-follow__link']]
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
        : kind === 'quiz' ? { questions: [{ q: 'MOCK Q1. What does the passage name first?', answer: 'Ideas', why: 'It is named first.', cite: '{p. 1}' }, { q: 'Q2?', answer: 'B', why: '', cite: '' }, { q: 'Q3?', answer: 'C', why: '', cite: '' }], i: 0, results: [] }
        : kind === 'figure' ? { label: `Figure ${list.length + 1}`, region: 'figure' } : null
      // Related (PR C) answers with its bottom line, then its places; a figure's card (PR E) is one thread.
      const mock = kind === 'related' ? `MOCK related. Card ${list.length + 1}'s idea comes back twice {p. 1}.\n{p. 1} Where it first comes up.\n{p. 2} Where it returns.` : `MOCK ${kind}. The bottom line of card ${list.length + 1} comes first {p. 1}. Then a second sentence fills the second line of the folded card.`
      const turns = kind === 'define' || kind === 'quiz' ? [] : [...(kind === 'ask' ? [{ role: 'user', content: question || 'Why does this hold here?' }] : []), { role: 'assistant', content: answer && list.length === open ? answer : mock }]
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
// Release train 2: PR E's figure detection and PR F's reading order agree on page n. Every text item
// F keeps out of the body (a figure's labels and caption, in the text layer's .fig-col) lies in a figure
// or caption E found, and no body line lies inside a figure E found (both in page fractions, 1% slack).
// `labels`: the captions E must have found on the page.
function figureOrderAgrees([n, labels]) {
  const p = state.pages[n - 1], f = state.figs.get(n)
  if (!p?.layer || !f) return { ok: false, why: 'not drawn or not detected', n }
  const b = p.pg.getBoundingClientRect(), slack = 0.01
  const box = el => { const r = el.getBoundingClientRect(); return { x: (r.left - b.left) / b.width, y: (r.top - b.top) / b.height, w: r.width / b.width, h: r.height / b.height } }
  const inside = (q, o) => q.x >= o.x - slack && q.y >= o.y - slack && q.x + q.w <= o.x + o.w + slack && q.y + q.h <= o.y + o.h + slack
  const overlaps = (q, o) => Math.min(q.x + q.w, o.x + o.w) - Math.max(q.x, o.x) > slack && Math.min(q.y + q.h, o.y + o.h) - Math.max(q.y, o.y) > slack
  const areas = [...f.figures, ...f.captions.map(c => c.box)]
  const out = [...p.layer.querySelectorAll('.fig-col span')].filter(sp => sp.textContent.trim()), body = [...p.layer.querySelectorAll('span')].filter(sp => !sp.closest('.side-col') && sp.textContent.trim())
  const stray = out.filter(sp => !areas.some(o => inside(box(sp), o))).map(sp => sp.textContent.trim())
  const crossed = body.filter(sp => f.figures.some(o => overlaps(box(sp), o))).map(sp => sp.textContent.trim().slice(0, 40))
  const missing = labels.filter(l => !f.captions.some(c => c.label === l && c.fig != null))
  return { ok: !stray.length && !crossed.length && !missing.length && out.length > 0, n, kept: out.length, stray, crossed, missing }
}
// Related and figure cards on a crowded page: each kind has a card folded to a one-line row or gathered into
// "N more" (B's crowding), the open card stays open, and a gathered kind is named in the "more" row.
function foldedKinds() {
  if (col.mode !== 'column') return { ok: true, mode: col.mode }
  const cards = store.get('cards:' + state.key) || [], stack = document.querySelector('.mr-stack:not([hidden])')
  // Every seeded passage is in view, so a hidden card beside a "more" row is a gathered one.
  const how = id => { const el = col.els.get(id); return !el || el.hidden ? (stack ? 'gathered' : 'hidden') : el.classList.contains('is-row') ? 'row' : el.classList.contains('is-open') ? 'open' : 'card' }
  const by = {}
  for (const c of cards) (by[c.kind] = by[c.kind] || []).push(how(c.id))
  const stackText = stack?.innerText || ''
  const named = kind => !by[kind]?.includes('gathered') || stackText.includes({ related: 'Related', figure: 'Figure' }[kind])
  const ok = ['related', 'figure'].every(k => (by[k] || []).some(h => h === 'row' || h === 'gathered') && named(k)) && !!col.open && how(col.open) === 'open'
  return { ok, by, stack: stackText.replace(/\s+/g, ' ').slice(0, 80) }
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
        // Release train 2: C's Related and E's figure cards fold and gather under B's crowding rules like
        // every other card: ten of them on five lines, one open, the oldest fold to rows, the last gather.
        await page.evaluate(seedCards, { lines: 5, pairs: true, open: 4, where: 'middle', kinds: ['related', 'figure', 'explain'] })
        await state('related-figure', foldedKinds)
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

/* ---------- Figures (FIXES-2026-10-15 items 4–7), on the figure paper ----------
   Detection (the labelled diagram, the figure beside text, the caption fallback), the chip inside the
   page and the screen (a figure at the page's left edge, a figure just under the top bar), the figure's
   card beside its figure with its thumbnail and its own thread, and figure questions sending the figure. */
const FIGURE_VIEWPORTS = (process.env.FIGURE_VIEWPORTS || '1440x900,1280x800,1181x800,1024x768,390x844,360x740').split(',').map(v => v.split('x').map(Number))
// The chip and the figure's card: inside the page and the screen, below the top bar.
const FIG_SELECTORS = { ...SELECTORS, bar: SELECTORS.bar + ', .byob-hot-chip' }
function chipInside() {
  const chip = document.querySelector('.byob-hot-chip'); if (!chip) return { ok: false, why: 'no chip' }
  const r = chip.getBoundingClientRect(), pg = chip.closest('.pdf-sheet').getBoundingClientRect(), hdr = document.getElementById('hdr').getBoundingClientRect().bottom
  const sr = document.getElementById('scroll').getBoundingClientRect(), right = Math.min(innerWidth, sr.left + document.getElementById('scroll').clientWidth)
  const inPage = r.left >= pg.left - 0.5 && r.right <= pg.right + 0.5, inView = r.left >= -0.5 && r.right <= right + 0.5 && r.top >= hdr - 0.5 && r.bottom <= innerHeight + 0.5
  const wide = r.width > pg.width - 16
  return { ok: (inPage || wide) && inView, rect: [r.left, r.top, r.right, r.bottom].map(Math.round), page: [pg.left, pg.right].map(Math.round), hdr: Math.round(hdr) }
}
async function figureMatrix(browser, origin) {
  const rows = [], hex = addBook(FIGURE_PAPER)
  const combos = SAMPLE ? FIGURE_VIEWPORTS.filter(([w]) => [1440, 1024, 390].includes(w)).map(([w, h], i) => [w, h, rotate(LOOKS, i)]) : FIGURE_VIEWPORTS.flatMap(([w, h]) => LOOKS.map(l => [w, h, l]))
  for (const [width, height, look] of combos) {
    const tag = `figures-${width}x${height}-${look}`, found = [], shots = {}
    let opened
    try { opened = await readerPage(browser, origin, hex, { width, height, look }) }
    catch (e) { rows.push({ pdf: 'figure_paper', viewport: `${width}×${height}`, look, pass: false, problems: 1, details: [{ kind: 'error', el: String(e.message || e).slice(0, 200) }] }); continue }
    const { ctx, page, problems } = opened
    const keep = (width === 1440 || width === 390) && (look === 'paper' || look === 'night')
    const check = async (name, cond) => {
      await settle(page)
      found.push(...(await checkMargin(page, FIG_SELECTORS)).map(p => ({ state: name, ...p })))
      if (cond) { const r = await page.evaluate(...[].concat(cond)); if (!r || r.ok === false) found.push({ state: name, kind: 'condition', el: JSON.stringify(r).slice(0, 400) }) }
      const att = await page.evaluate(leadersAttached); if (!att.ok) found.push({ state: name, kind: 'leaders', el: JSON.stringify(att) })
      if (keep) { const path = join(OUT, `${tag}-${name}.png`); await page.screenshot({ path }); shots[name] = path }
    }
    // A page in view (its figure `fy` of the way down the page at `at` of the screen), drawn and its figures found.
    const show = async (n, fy = 0, at = 0.25) => {
      await page.evaluate(([n, fy, at]) => { const p = state.pages[n - 1], sr = $('scroll').getBoundingClientRect(), b = p.pg.getBoundingClientRect(); $('scroll').scrollTop += b.top + fy * b.height - (sr.top + at * sr.height) }, [n, fy, at])
      await page.waitForFunction(n => state.figs.has(n) && state.pages[n - 1].figures, n, { timeout: 15000 }); await settle(page)
    }
    // Hover (desktop) or tap (phone) at a point of page n given in page fractions.
    const point = (n, fx, fy) => page.evaluate(([n, fx, fy]) => { const b = state.pages[n - 1].pg.getBoundingClientRect(); return { x: b.left + fx * b.width, y: b.top + fy * b.height } }, [n, fx, fy])
    const offer = async (n, fx, fy) => { await hideAll(); const { x, y } = await point(n, fx, fy); if (width < 700) await page.mouse.click(x, y); else { await page.mouse.move(x - 40, y - 40); await page.mouse.move(x, y, { steps: 4 }) } await page.waitForSelector('.byob-hot-chip', { timeout: 4000 }) }
    const hideAll = () => page.evaluate(() => { hideHot(); openCard(null); getSelection().removeAllRanges() })
    try {
      // Detection: the labelled diagram (no row of circles is a figure alone), the block diagram beside text,
      // and the caption fallback for the table and for a figure larger than half the page.
      for (const n of [1, 2, 3, 4]) await show(n)
      // Release train 2: on every page of the figure paper, PR F's reading order keeps out of the body only what PR E's detection holds as a figure or its caption.
      for (const [n, labels] of [[1, ['Figure 1']], [2, ['Figure 2']], [3, ['Table 1']], [4, ['Figure 3']]]) { await show(n); await check(`order-${n}`, [figureOrderAgrees, [n, labels]]) }
      await check('detected', () => {
        const f = n => state.figs.get(n), cap = (n, label) => f(n).captions.find(c => c.label === label), fig = (n, label) => { const c = cap(n, label); return c && f(n).figures[c.fig] }
        const net = fig(1, 'Figure 1'), block = fig(2, 'Figure 2'), table = fig(3, 'Table 1'), big = fig(4, 'Figure 3')
        // In page fractions: the diagram's rows run from y 0.30 to 0.42; the block diagram's left edge is 12pt in; the table under its caption; the large figure is 0.66 of the page tall.
        const ok = !!net && net.y < 0.32 && net.y + net.h > 0.4 && f(1).figures.length === 1 && !!block && block.x < 0.03 && block.x + block.w < 0.29 && !!table && table.y > 0.24 && !!big && big.h > 0.6
        return { ok, net, block, table, big, counts: [1, 2, 3, 4].map(n => f(n).figures.length) }
      })
      // A figure at the page's left edge: the chip is kept inside the page and the screen.
      await show(2, 0.25, 0.4); await offer(2, 0.1, 0.3)
      await check('fig-left', chipInside)
      // A figure just under the top bar: no room above it, so the chip goes below or inside it, never under the bar.
      await show(1, 0.29, 0.005); await offer(1, 0.5, 0.36)
      await check('fig-top', chipInside)
      // The fallback: over a caption, its figure is offered (the large figure has no other way in).
      await show(4, 0.5, 0.5)
      const capAt = await page.evaluate(() => { const c = state.figs.get(4).captions.find(c => c.label === 'Figure 3'); return { fx: c.box.x + 0.05, fy: c.box.y + c.box.h / 2 } })
      await offer(4, capAt.fx, capAt.fy)
      await check('caption', () => { const hot = document.querySelector('.byob-hot'), pg = hot?.closest('.pdf-sheet').getBoundingClientRect(), r = hot?.getBoundingClientRect(); return { ok: !!hot && r.height / pg.height > 0.6, h: r && r.height / pg.height } })
      // The figure's card: Explain on the diagram opens a card beside it (thumbnail, leader line), with the figure's picture and its own thread.
      await show(1, 0.3, 0.3); await offer(1, 0.5, 0.36)
      const before = account.requests.length, wholeBefore = await page.evaluate(() => chat.turns.length)
      await page.click('.byob-hot-chip [data-a="explain"]')
      await page.waitForFunction(() => { const c = cardById(col.open); return c && c.kind === 'figure' && c.turns.length === 1 }, null, { timeout: 8000 })
      await page.waitForFunction(() => !!document.querySelector('.mr-card.is-open .mr-thumb img, .mr-sheet .mr-thumb img'), null, { timeout: 8000 })
      const sent = account.requests.slice(before).find(r => r.path === '/api/chat')
      const pics = (sent?.body?.messages?.at(-1)?.content || []).filter?.(b => b.type === 'image') || []
      const rules = JSON.stringify(sent?.body?.messages?.[0] || '')
      await check('fig-card', [whole => {
        const card = cardById(col.open), el = document.querySelector('.mr-sheet') || document.querySelector('.mr-card.is-open'), f = state.pages[0].pg.getBoundingClientRect(), box = TinctMargin.anchorOfCard(card)[0]
        const figTop = f.top + box.y * f.height, r = el?.getBoundingClientRect()
        // Beside: in the column the card starts level with the figure's top (less the 4px lift), unless the column moved it up to fit; marks float it beside the mark; the phone's bottom card sits below the figure.
        const beside = col.mode === 'column' ? Math.abs(r.top - (figTop - 4)) < 3 || r.bottom <= f.top + (box.y + box.h) * f.height + 2 : col.mode === 'marks' ? !!el?.classList.contains('is-floating') : r.top >= figTop
        const label = el?.querySelector('.mr-card__name')?.textContent || el?.getAttribute('aria-label')
        return { ok: beside && /^Figure 1 · p\. 1$/.test(label || '') && !!el.querySelector('.mr-thumb img')?.naturalWidth && chat.turns.length === whole && keptCards().filter(c => c.kind === 'figure' && !c.gone).length === 1, mode: col.mode, beside, label, top: r && Math.round(r.top), figTop: Math.round(figTop) }
      }, wholeBefore])
      if (!(pics.length === 1 && /This conversation is about one figure on page 1 \(Figure 1\)/.test(rules) && /attached image is that figure/.test(rules) && sent.body.companion?.document)) found.push({ state: 'fig-card', kind: 'request', el: JSON.stringify({ images: pics.length, rules: rules.slice(0, 200), document: !!sent?.body?.companion?.document }) })
      // A follow-up stays in the figure's thread; Explain on the same figure again opens the same card.
      await page.evaluate(() => followUp(col.open, 'What do the rows stand for?'))
      await page.waitForFunction(() => cardById(col.open)?.turns.length === 3, null, { timeout: 8000 })
      await page.evaluate(() => openCard(null)); await settle(page); await offer(1, 0.5, 0.36); await page.click('.byob-hot-chip [data-a="explain"]'); await settle(page)
      await check('fig-thread', () => { const all = keptCards().filter(c => c.kind === 'figure' && !c.gone), c = cardById(col.open); return { ok: all.length === 1 && c?.id === all[0].id && c.turns.length === 3 && chat.turns.length === 0, cards: all.length, turns: c?.turns.length } })
      // Item 7: a whole-PDF question naming "Figure 1" on the reader's page sends that figure's picture.
      const n0 = account.requests.length
      await page.evaluate(() => { openCard(null); openWhole({ prompt: 'What does Figure 1 show?' }) })
      await page.waitForFunction(() => chat.turns.some(t => t.role === 'assistant'), null, { timeout: 8000 })
      const asked = account.requests.slice(n0).find(r => /What does Figure 1 show\?/.test(JSON.stringify(r.body.messages || '')))
      const askPics = (asked?.body?.messages?.at(-1)?.content || []).filter?.(b => b.type === 'image') || []
      if (!(askPics.length === 1 && /attached image is Figure 1 on page 1/.test(JSON.stringify(asked.body.messages[0])))) found.push({ state: 'fig-ask', kind: 'request', el: JSON.stringify({ asked: !!asked, images: askPics.length }) })
      await page.evaluate(() => { chat.turns = []; closeChat() })
    } catch (e) { found.push({ state: 'run', kind: 'error', el: String(e.message || e).replace(/\u001b\[\d+m/g, '').slice(-700) }) }
    const n = found.length + problems.length
    rows.push({ pdf: 'figure_paper', viewport: `${width}×${height}`, look, pass: !n, problems: n, details: [...found, ...problems], screenshots: shots })
    console.log(`${tag}: ${n} problem(s)`, n ? JSON.stringify([...found, ...problems]).slice(0, 900) : '')
    await ctx.close()
  }
  return rows
}

/* ---------- Figures after the retest (gloss-test/retest.html; Anders, 15 Oct) ----------
   Captions in the margin (MacKay): the chip on a figure in the right margin, a figure and a table of digits
   whose captions stand in the margin beside them; a formula's card takes no figure's caption; a caption can be
   selected (the bar, not the chip); a question naming a figure on another page sends that figure. */
async function retestFigures(browser, origin) {
  const results = []
  const ok = (name, pass, detail) => { results.push({ name, pass: !!pass, ...(pass ? {} : { detail }) }); console.log(`${pass ? 'ok  ' : 'FAIL'} ${name}${pass ? '' : ' ' + String(JSON.stringify(detail)).slice(0, 400)}`) }
  const margin = addBook(MARGIN_PAPER), paper = addBook(FIGURE_PAPER)
  const views = SAMPLE ? [[1440, 900, 'paper'], [390, 844, 'night']] : [[1440, 900, 'paper'], [1280, 800, 'book'], [1024, 768, 'night'], [390, 844, 'paper'], [360, 740, 'eink']]
  for (const [width, height, look] of views) {
    const tag = `figure-margins-${width}x${height}-${look}`, phone = width < 700
    const A = await readerPage(browser, origin, margin, { width, height, look, minSpans: 10 })
    const a = A.page, problems = []
    try {
      await a.waitForFunction(() => state.figs.has(1) && state.pages[0].figures, null, { timeout: 15000 })
      const got = await a.evaluate(() => { const f = state.figs.get(1); return Object.fromEntries(f.captions.map(c => [c.label, f.figures[c.fig]])) })
      const one = got['Figure 1.1'], two = got['Figure 1.2'], three = got['Figure 1.3']
      // In page fractions: the plot in the margin (x 440–540 pt of 612), the drawing in the text column (x 120–330), the digits (x 160–330).
      ok(`${tag}: each margin caption has its figure: the plot in the margin, the drawing and the table of digits beside their captions`, one && one.x > 0.68 && two && two.x < 0.21 && two.x + two.w < 0.56 && two.w > 0.3 && three && three.x < 0.28 && three.x + three.w < 0.6, got)
      // The chip on the plot in the right margin (Anders: none appeared on MacKay's Figure 1.1).
      await a.evaluate(() => state.pages[0].pg.scrollIntoView({ block: 'start' }))
      await a.waitForTimeout(400)
      const at2 = await a.evaluate(() => { const p = state.pages[0], f = state.figs.get(1), c = f.captions.find(c => c.label === 'Figure 1.1'), g = f.figures[c.fig], b = p.pg.getBoundingClientRect(); return { x: b.left + (g.x + g.w / 2) * b.width, y: b.top + (g.y + g.h / 2) * b.height } })
      if (phone) await a.mouse.click(at2.x, at2.y); else { await a.mouse.move(at2.x - 30, at2.y - 30); await a.mouse.move(at2.x, at2.y, { steps: 4 }) }
      const chip = await a.waitForSelector('.byob-hot-chip', { timeout: 4000 }).then(() => a.evaluate(chipInside)).catch(() => null)
      ok(`${tag}: the figure in the right margin offers its chip, inside the page and the screen`, chip?.ok, chip || at2)
      if (!phone) await shot(a, `${tag}-margin-chip`)
      await a.evaluate(() => { hideHot(); getSelection().removeAllRanges() })
      // A formula's card names no figure: the "Figure 1.1" caption beside the text is the plot's (screenshot 141).
      const formula = await a.evaluate(async () => { const p = state.pages[0], c = state.figs.get(1).captions.find(c => c.label === 'Figure 1.1'); const f = { x: 0.18, y: c.box.y - 0.03, w: 0.5, h: 0.04 }; const item = await regionItem(p, f, 'formula', true); const fig = await regionItem(p, f, 'snip', true); return { formula: item.caption, snip: fig.caption } })
      ok(`${tag}: a formula's card carries no figure's caption (a snip there still finds the caption beside it)`, formula.formula === '' && /^Figure 1\.1/.test(formula.snip), formula)
      if (!phone) {
        // A caption can be selected: a drag over it gives the bar, as any text does (it gave the chip).
        await a.evaluate(() => state.pages[0].pg.scrollIntoView({ block: 'center' }))
        await a.waitForTimeout(400)
        const r = await a.evaluate(() => { const p = state.pages[0], c = state.figs.get(1).captions.find(c => c.label === 'Figure 1.2'), b = p.pg.getBoundingClientRect(); return { x0: b.left + c.box.x * b.width + 2, x1: b.left + (c.box.x + c.box.w) * b.width - 4, y: b.top + (c.box.y + c.box.h * 0.25) * b.height } })
        await a.mouse.move(r.x0, r.y); await a.waitForTimeout(200); await a.mouse.down(); await a.mouse.move((r.x0 + r.x1) / 2, r.y, { steps: 4 }); await a.mouse.move(r.x1, r.y, { steps: 4 }); await a.mouse.up()
        await a.waitForSelector('.mr-bar', { timeout: 4000 }).catch(() => {}); await a.waitForTimeout(300)
        const sel = await a.evaluate(() => ({ text: getSelection().toString().replace(/\s+/g, ' ').trim(), bar: !!document.querySelector('.mr-bar'), chip: !!document.querySelector('.byob-hot-chip') }))
        ok(`${tag}: dragging over a caption selects the caption and gives the bar, not the figure's chip`, /^Figure 1\.2\. A binary/.test(sel.text) && sel.bar && !sel.chip, sel)
        await shot(a, `${tag}-caption-bar`)
        problems.push(...(await checkMargin(a)).map(p => ({ state: 'caption bar', ...p })))
        // Highlight it, as any passage.
        await a.click('.mr-bar [data-m="dot"]').catch(() => {}); await a.waitForTimeout(400)
        const marked = await a.evaluate(() => highlights().some(h => /^Figure 1\.2/.test(h.text || '')))
        ok(`${tag}: a caption can be highlighted`, marked, marked)
        await a.keyboard.press('Escape'); await a.evaluate(() => getSelection().removeAllRanges())
      }
    } catch (e) { ok(`${tag}: run`, false, String(e.message || e).slice(0, 400)) }
    ok(`${tag}: no layout problems or page errors`, !problems.length && !A.problems.length, [...problems, ...A.problems].slice(0, 5))
    await A.ctx.close()
    // A question naming a figure on another page sends that figure (the figure paper: Table 1 is on page 3, asked from page 1).
    if (width === 1440 || width === 390) {
      const B = await readerPage(browser, origin, paper, { width, height, look })
      const b = B.page
      try {
        await b.waitForFunction(() => state.figs.has(1), null, { timeout: 15000 })
        await b.evaluate(() => { for (const n of [2, 3, 4]) state.figs.delete(n); offFigs.clear() })
        const n0 = account.requests.length
        await b.evaluate(() => { openCard(null); openWhole({ prompt: 'What does Table 1 show?' }) })
        await b.waitForFunction(() => chat.turns.some(t => t.role === 'assistant'), null, { timeout: 15000 })
        const asked = account.requests.slice(n0).find(r => /What does Table 1 show\?/.test(JSON.stringify(r.body.messages || '')))
        const pics = (asked?.body?.messages?.at(-1)?.content || []).filter?.(x => x.type === 'image') || []
        ok(`figure-elsewhere-${width}x${height}-${look}: a question from page 1 naming Table 1 (page 3, not yet drawn) sends that table's picture`, pics.length === 1 && /attached image is Table 1 on page 3/.test(JSON.stringify(asked.body.messages[0])), { asked: !!asked, images: pics.length })
      } catch (e) { ok(`figure-elsewhere-${width}x${height}-${look}: run`, false, String(e.message || e).slice(0, 400)) }
      ok(`figure-elsewhere-${width}x${height}-${look}: no page errors`, !B.problems.length, B.problems.slice(0, 3))
      await B.ctx.close()
    }
  }
  return results
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

/* ---------- PR F: long books (FIXES-2026-10-15, items 8 to 12) ---------- */
// Every read and write of the stored books (IndexedDB 'books') and when the first page is drawn, for the reopen row.
function watchStore() {
  window.__books = []
  for (const op of ['get', 'put', 'getAll']) {
    const f = IDBObjectStore.prototype[op]
    IDBObjectStore.prototype[op] = function (...a) { if (this.name === 'books') window.__books.push([op, performance.now()]); return f.apply(this, a) }
  }
  const watch = () => { if (document.querySelector('.pdf-sheet canvas')) window.__drawn = performance.now(); else requestAnimationFrame(watch) }
  requestAnimationFrame(watch)
}
/* ---------- The margin polish (Anders's hands-on feedback, 15 Oct; screenshots 133–141) ----------
   No foot line (Chat instead), no blinking caret, the highlighter and pencil, delete with Undo, one
   scroll surface with its scrollbar at the window's right edge, Before you start opening in place,
   and Chat folding once the reader moves on. Every AI call is mocked. */
async function polish(browser, origin) {
  const results = []
  const ok = (name, pass, detail) => { results.push({ name, pass: !!pass, ...(pass ? {} : { detail }) }); console.log(`${pass ? 'ok  ' : 'FAIL'} ${name}${pass ? '' : ' ' + String(JSON.stringify(detail)).slice(0, 400)}`) }
  const hex = addBook(LONG_BOOK)
  const views = SAMPLE ? [[1440, 900, 'paper'], [390, 844, rotate(LOOKS, 2)]] : [[1440, 900, 'paper'], [1440, 900, 'night'], [1280, 800, 'book'], [1024, 768, 'eink'], [390, 844, 'paper'], [360, 740, 'night']]
  for (const [width, height, look] of views) {
    const tag = `polish-${width}x${height}-${look}`, phone = width < 700
    const A = await readerPage(browser, origin, hex, { width, height, look })
    const a = A.page
    const problems = []
    const layout = async state => { await a.waitForTimeout(250); problems.push(...(await checkMargin(a)).map(p => ({ state, ...p }))) }
    const mode = await a.evaluate(() => marginMode())
    // 1. No whole-PDF bar at the margin's foot.
    const foot = await a.evaluate(() => ({ foot: !!document.querySelector('.mr-foot, .mr-foot__input, .mr-foot__hint, .mr-key'), words: /the whole PDF/.test(document.querySelector('.mr-col')?.innerText || '') && !document.querySelector('.mr-col .mr-trigger') }))
    ok(`${tag}: no whole-PDF line, field or mic at the margin's foot`, !foot.foot && !foot.words, foot)
    // 2. The caret: nothing drawn as one; the hint after "Ask" thin, in the accent, a gentle blink.
    ok(`${tag}: no caret element anywhere in the margin`, await a.evaluate(() => !document.querySelector('.mr-caret')))
    await a.evaluate(() => goTo({ page: 3, frac: 0.05 })); await a.waitForTimeout(800)
    await selectText(a); await a.waitForSelector('.mr-bar, .mr-pbar')
    const caret = await a.evaluate(() => { const c = document.querySelector('.mr-float .mr-bar__caret'); if (!c) return null; const cs = getComputedStyle(c), probe = document.createElement('i'); probe.style.background = 'var(--mr-bar-accent)'; c.parentElement.appendChild(probe); const accent = getComputedStyle(probe).backgroundColor; probe.remove(); return { w: c.getBoundingClientRect().width, bg: cs.backgroundColor, accent, anim: cs.animationName, timing: cs.animationTimingFunction, dur: cs.animationDuration } })
    // E-ink never animates (the display profile stops every animation): there the caret stands still.
    const blinks = look === 'eink' ? caret?.anim === 'none' : caret?.anim === 'mr-blink' && caret.timing === 'ease-in-out' && caret.dur === '1.4s'
    ok(`${tag}: the hint after "Ask" is a 1.5px caret in the accent with a gentle blink${look === 'eink' ? ' (still in e-ink)' : ''}`, caret && Math.abs(caret.w - 1.5) < 0.3 && caret.bg === caret.accent && blinks, caret)
    // 3. The highlighter (its dot in the current colour) and the pencil.
    const icons = await a.evaluate(() => { const hl = document.querySelector('.mr-float [data-m="dot"]'), note = document.querySelector('.mr-float [data-m="note"]'); const dot = hl?.querySelector('.mr-hl .mr-dot'); return { pen: !!hl?.querySelector('.mr-hl svg path'), dot: dot && { w: dot.getBoundingClientRect().width, fill: getComputedStyle(dot).backgroundColor }, pencil: !!note?.querySelector('svg path[d^="M11.6 3.4"]'), stroke: note && getComputedStyle(note.querySelector('svg')).strokeWidth } })
    ok(`${tag}: the bar has the highlighter with a small dot in the current colour, and the pencil, in the icons' stroke`, icons.pen && icons.dot && Math.round(icons.dot.w) === 7 && icons.dot.fill !== 'rgba(0, 0, 0, 0)' && icons.pencil && icons.stroke === '1.6px', icons)
    await layout('bar')
    if (look === 'paper') await shot(a, `${tag}-bar`)
    // 4. Delete and Undo: a card made now, deleted from its action row, put back, deleted again.
    await a.click('.mr-float [data-m="explain"]'); await a.waitForTimeout(1500)
    const made = await a.evaluate(() => col.open)
    const field = await a.evaluate(() => { const f = openCardEl()?.querySelector('.mr-follow__input'); return { focused: document.activeElement === f, drawn: !!openCardEl()?.querySelector('.mr-caret') } })
    ok(`${tag}: an opened card's follow-up field has no caret until the reader focuses it`, made && !field.focused && !field.drawn, field)
    const del = await a.evaluate(() => { const b = openCardEl()?.querySelector('.mr-card__acts .mr-card__delete'), copy = openCardEl()?.querySelector('.mr-card__acts .mr-card__copy'); const r = b?.getBoundingClientRect(); return b && { w: r.width, h: r.height, beside: !copy || copy.offsetParent === null || Math.abs(copy.getBoundingClientRect().top - r.top) < 2 } })
    ok(`${tag}: the open card has a bin in its action row (beside copy on the desktop), a 28px target`, del && del.w >= 27.5 && del.h >= 27.5 && del.beside, del)
    await a.click(phone ? '.mr-sheet .mr-card__delete' : `.mr-card.is-open .mr-card__delete`); await a.waitForTimeout(400)
    const gone = await a.evaluate(id => ({ open: col.open, shown: !!document.querySelector(`.mr-card[data-id="${id}"], .mr-sheet[data-id="${id}"]`), stored: (store.get('cards:' + state.key) || []).find(c => c.id === id), undo: document.querySelector('.mr-undo:not([hidden])')?.innerText.replace(/\s+/g, ' ').trim() }), made)
    ok(`${tag}: delete takes the card away at once (no confirm), leaves a tombstone, and says "Deleted · Undo"`, !gone.open && !gone.shown && gone.stored?.gone === true && gone.undo === 'Deleted · Undo', gone)
    await layout('undo')
    if (look === 'paper') await shot(a, `${tag}-undo`)
    const undoOverlap = await a.evaluate(() => { const u = document.querySelector('.mr-undo:not([hidden])')?.getBoundingClientRect(); if (!u) return 'none'; return [...document.querySelectorAll('.mr-col .mr-card:not([hidden]), .mr-col .mr-trigger, .mr-sheet')].some(c => { const r = c.getBoundingClientRect(); return Math.min(r.right, u.right) - Math.max(r.left, u.left) > 1 && Math.min(r.bottom, u.bottom) - Math.max(r.top, u.top) > 1 }) })
    ok(`${tag}: the undo line covers no card`, undoOverlap === false, undoOverlap)
    await a.click('.mr-undo button'); await a.waitForTimeout(500)
    const back = await a.evaluate(id => ({ stored: (store.get('cards:' + state.key) || []).find(c => c.id === id), undo: !!document.querySelector('.mr-undo:not([hidden])') }), made)
    ok(`${tag}: Undo puts the card back, newer than its tombstone, and the line goes`, back.stored && !back.stored.gone && back.stored.turns?.length && !back.undo, back)
    await a.evaluate(id => { deleteCard(id) }, made); await a.waitForTimeout(UNDO_WAIT)
    const after = await a.evaluate(id => ({ undo: !!document.querySelector('.mr-undo:not([hidden])'), stored: (store.get('cards:' + state.key) || []).find(c => c.id === id) }), made)
    const synced = account.cards.get(hex)?.cards?.find(c => c.id === made)
    ok(`${tag}: the line leaves after a few seconds; the deletion syncs to the account as a tombstone`, !after.undo && after.stored?.gone && synced?.gone === true, { after, synced })
    // A note: its note and the highlight it made go together.
    await a.evaluate(() => { openCard(null); getSelection().removeAllRanges() }); await a.waitForTimeout(200)
    await selectText(a, { near: 'top' }); await a.waitForSelector('.mr-float [data-m="note"]')
    await a.click('.mr-float [data-m="note"]'); await a.waitForSelector('.mr-note .mr-note__field')
    await a.fill('.mr-note .mr-note__field', 'MOCK note to delete.'); await a.click('.mr-note [data-m="save"]'); await a.waitForTimeout(500)
    const note = await a.evaluate(() => { const h = (store.get('hl:' + state.key) || []).find(m => m.note === 'MOCK note to delete.'); return h && { id: h.id, withNote: h.withNote } })
    if (note) await a.evaluate(id => deleteCard('n-' + id), note.id); await a.waitForTimeout(400)
    const noteGone = await a.evaluate(id => ({ mark: (store.get('hl:' + state.key) || []).some(m => m.id === id), card: !!document.querySelector(`[data-id="n-${id}"]`) }), note?.id)
    ok(`${tag}: deleting a note takes its note and the highlight it made`, note?.withNote === true && !noteGone.mark && !noteGone.card, { note, noteGone })
    await a.evaluate(() => hideUndo())
    // 5. Chat: "/" opens it (no foot), it is capped below the column, and it folds when the reader moves on.
    if (!phone) {
      await a.evaluate(() => { openCard(null); getSelection().removeAllRanges(); document.activeElement?.blur?.() })
      const q0 = account.requests.length
      await a.keyboard.press('/'); await a.waitForTimeout(200)
      const opened = await a.evaluate(() => ({ chat: !!document.querySelector('.mr-card.is-whole.is-open, .mr-float.is-whole'), label: document.querySelector('.mr-card.is-whole .mr-card__label')?.innerText.trim(), focus: document.activeElement?.classList.contains('mr-follow__input') }))
      ok(`${tag}: "/" opens Chat with its field ready, even before a first question`, opened.chat && opened.label?.startsWith('Chat') && opened.focus, opened)
      await a.keyboard.type('What do the chapters say?'); await a.keyboard.press('Enter'); await a.waitForTimeout(1200)
      const req = account.requests.slice(q0).find(r => /What do the chapters say/.test(JSON.stringify(r.body.messages)))
      ok(`${tag}: a Chat question goes as the whole-PDF question (scope "whole", the document)`, req?.body?.companion?.scope === 'whole' && req.body.companion.document?.units?.length > 0, req?.body?.companion && { scope: req.body.companion.scope })
      if (mode === 'column') {
        const cap = await a.evaluate(() => { const c = document.querySelector('.mr-col .mr-card.is-whole.is-open'), colH = document.querySelector('.mr-col').clientHeight; return c && { h: c.getBoundingClientRect().height, max: parseFloat(getComputedStyle(c).maxHeight), colH } })
        ok(`${tag}: open Chat is capped at 60% of the column`, cap && cap.max <= cap.colH * 0.6 + 1 && cap.h <= cap.colH * 0.6 + 1, cap)
      }
      await layout('chat')
      if (look === 'paper') await shot(a, `${tag}-chat`)
      // Text selected in an answer is painted as a selection, not as a highlight (screenshot 136).
      const sel = await a.evaluate(() => { const p = document.querySelector('.mr-card.is-whole .mr-answer p, .mr-float.is-whole .mr-answer p'); if (!p) return null; const probe = document.createElement('i'); probe.style.background = 'var(--mr-sel)'; p.appendChild(probe); const want = getComputedStyle(probe).backgroundColor; probe.remove(); return { paint: getComputedStyle(p, '::selection').backgroundColor, want } })
      ok(`${tag}: a selection inside a card is painted in the selection tint, not the app's gold`, sel && sel.paint !== 'rgb(245, 230, 200)' && sel.paint === sel.want, sel)
      await a.evaluate(() => document.activeElement?.blur?.())
      await a.evaluate(() => { goTo({ page: currentPlace().page + 2, frac: 0.1 }); onScroll() }); await a.waitForTimeout(700)
      ok(`${tag}: Chat folds once the reader moves on to another page`, await a.evaluate(() => col.open !== 'whole' && !document.querySelector('.mr-card.is-whole.is-open, .mr-float.is-whole')))
    }
    // 6. One scroll surface: the scroller to the window's right edge (the scrollbar there), the column inside it; the wheel over a card scrolls the pages.
    if (mode === 'column') {
      await a.evaluate(() => { openCard(null); goTo({ page: 3, frac: 0.05 }) }); await a.waitForTimeout(600)
      await a.evaluate(seedCards, { lines: 2, pairs: false, open: null })
      await a.waitForTimeout(400)
      const geo = await a.evaluate(() => { const sc = $('scroll'), r = sc.getBoundingClientRect(), colR = document.querySelector('.mr-col').getBoundingClientRect(), pg = state.pages[2].pg.getBoundingClientRect(); return { right: Math.round(r.right), vw: innerWidth, bar: sc.offsetWidth - sc.clientWidth, colLeft: Math.round(colR.left), colRight: Math.round(colR.right), pageRight: Math.round(pg.right), scrollers: [...document.querySelectorAll('.mr-col, .mr-col *')].filter(e => /(auto|scroll)/.test(getComputedStyle(e).overflowY) && e.scrollHeight > e.clientHeight + 1 && !e.closest('.mr-card.is-open')).length } })
      ok(`${tag}: the pages and the margin scroll as one: the scroller reaches the window's right edge, the column inside it, the page 56px left of the column`, geo.right === geo.vw && geo.colRight <= geo.vw - 16 && geo.colLeft - geo.pageRight === TINCT_COL_GAP && geo.scrollers === 0, geo)
      const wheel = await a.evaluate(() => { const c = document.querySelector('.mr-col .mr-card.is-folded:not([hidden])'); if (!c) return null; const r = c.getBoundingClientRect(); return { x: r.left + 40, y: r.top + 10, top: $('scroll').scrollTop } })
      if (wheel) { await a.mouse.move(wheel.x, wheel.y); await a.mouse.wheel(0, 300); await a.waitForTimeout(400) }
      const moved = wheel ? await a.evaluate(t => $('scroll').scrollTop - t, wheel.top) : null
      await a.mouse.move(Math.round(width - 200), Math.round(height - 40)); const t2 = await a.evaluate(() => $('scroll').scrollTop); await a.mouse.wheel(0, 200); await a.waitForTimeout(400)
      const moved2 = await a.evaluate(t => $('scroll').scrollTop - t, t2)
      ok(`${tag}: the wheel over a card, and over the column's empty room, scrolls the pages; the cards stay with their passages`, wheel && moved > 100 && moved2 > 50 && (await a.evaluate(leadersAttached)).ok, { moved, moved2 })
      await layout('one scroll surface')
      // The reading place holds across the column opening and closing (a resize through 1180px).
      const place = await a.evaluate(() => currentPlace())
      await a.setViewportSize({ width: 1100, height }); await a.waitForTimeout(700); await a.setViewportSize({ width, height }); await a.waitForTimeout(900)
      const place2 = await a.evaluate(() => currentPlace())
      ok(`${tag}: the reading place holds while the column comes and goes`, place2.page === place.page && Math.abs((place2.frac ?? 0) - (place.frac ?? 0)) < 0.03, { place, place2 })
      await a.evaluate(() => { store.set('cards:' + state.key, []); col.view = null; marginLayout({ fresh: true }) })
    } else {
      const geo = await a.evaluate(() => { const r = $('scroll').getBoundingClientRect(); return { right: Math.round(r.right), vw: innerWidth } })
      ok(`${tag}: the scroller still reaches the window's right edge (${mode})`, geo.right === geo.vw, geo)
    }
    // 7. Before you start opens in place: from its trigger, growing down, never jumping up; reduced motion: at once.
    if (mode === 'column') {
      await a.evaluate(() => { openCard(null); goTo({ page: 1, frac: 0 }); onScroll() }); await a.waitForTimeout(900)
      for (const reduce of [false, true]) {
        await a.emulateMedia({ reducedMotion: reduce ? 'reduce' : 'no-preference' })
        const run = await a.evaluate(() => new Promise(res => {
          const t = document.querySelector('.mr-col .mr-trigger'); if (!t) return res(null)
          const trig = t.getBoundingClientRect(), frames = [], t0 = performance.now()
          t.click()
          const tick = () => { const p = document.querySelector('.mr-col .mr-primer'); if (p) { const b = p.getBoundingClientRect(); frames.push({ top: b.top, height: b.height, bottom: document.querySelector('.mr-col').getBoundingClientRect().bottom - b.bottom }) } if (performance.now() - t0 < 600) requestAnimationFrame(tick); else res({ trig: { top: trig.top, height: trig.height }, frames }) }
          requestAnimationFrame(tick)
        }))
        const f = run?.frames || [], first = f[0], last = f.at(-1)
        const grew = f.some(x => x.height < last?.height - 40)
        ok(`${tag}: Before you start ${reduce ? '(reduced motion) is there at once' : 'expands in place from its trigger'}, never moving up, ending 70px above the foot`, first && Math.abs(first.top - (run.trig.top - 14)) <= 1.5 && f.every(x => Math.abs(x.top - first.top) <= 0.5) && Math.abs(last.bottom - 70) <= 1 && (reduce ? !grew && Math.abs(first.height - last.height) < 1 : grew && first.height <= run.trig.height + 20), { trig: run?.trig, first, last, n: f.length })
        if (!reduce && look === 'paper') await shot(a, `${tag}-primer`)
        await layout(reduce ? 'primer (reduced motion)' : 'primer')
        await a.evaluate(() => closePrimer()); await a.waitForTimeout(300)
      }
      await a.emulateMedia({ reducedMotion: 'no-preference' })
    }
    ok(`${tag}: layout clean through every state (bar, undo, Chat, one scroll surface, primer)`, !problems.length && !A.problems.length, [...problems, ...A.problems].slice(0, 6))
    await A.ctx.close()
  }
  return results
}
const UNDO_WAIT = 6800
const TINCT_COL_GAP = 56

async function longBooks(browser, origin) {
  const results = []
  const ok = (name, pass, detail) => { results.push({ name, pass: !!pass, ...(pass ? {} : { detail }) }); console.log(`${pass ? 'ok  ' : 'FAIL'} ${name}${pass ? '' : ' ' + String(JSON.stringify(detail)).slice(0, 400)}`) }
  const hex = addBook(BIG_BOOK), m = BOOK.meta, printed = n => String(n - m.offset)
  const chats = from => account.requests.slice(from).filter(r => r.path === '/api/chat' || r.path === '/api/lab-chat')
  const views = SAMPLE ? [[1440, 900, 'paper'], [390, 844, rotate(LOOKS, 2)]] : [[1440, 900, 'paper'], [1440, 900, 'night'], [1280, 800, 'book'], [390, 844, 'paper'], [390, 844, 'eink']]
  for (const [width, height, look] of views) {
    const tag = `long_book-${width}x${height}-${look}`, phone = width < 700
    const A = await readerPage(browser, origin, hex, { width, height, look, at: m.figurePage })
    const a = A.page
    await A.ctx.grantPermissions(['clipboard-read', 'clipboard-write'], { origin })
    const problems = []
    const layout = async state => { await a.waitForTimeout(300); problems.push(...(await checkMargin(a)).map(p => ({ state, ...p }))) }
    // Item 10: the numbers the pages print, with no page labels in the file.
    await a.waitForFunction(() => state.labels?.length > 400, null, { timeout: 60000 }).catch(() => {})
    const labels = await a.evaluate(n => [state.labels?.[0], state.labels?.[2], state.labels?.[n], state.labels?.[444], pageLabel(currentPlace().page)], m.offset)
    ok(`${tag}: printed page numbers stand for the file's (file page 445 is p. 423; front matter in roman; no page labels in the file)`, JSON.stringify(labels) === JSON.stringify(['i', 'iii', '1', '423', printed(m.figurePage)]), labels)
    // The top bar and the page jump use the printed numbers too (Anders, 15 Oct): "p. 468 · 84%", a jump to "175" or "iii".
    const bar = await a.evaluate(() => ({ pill: document.getElementById('pageLabel').textContent, progress: document.getElementById('progress').textContent, aria: document.getElementById('pageBtn').getAttribute('aria-label') }))
    await a.evaluate(() => openJump()); await a.waitForSelector('.byob-jumpbox input')
    const jump = await a.evaluate(() => ({ value: document.querySelector('.byob-jumpbox input').value, of: document.querySelector('.byob-jumpbox span').textContent }))
    await a.fill('.byob-jumpbox input', printed(m.sarsaPage)); await a.press('.byob-jumpbox input', 'Enter'); await a.waitForTimeout(700)
    const toSarsa = await a.evaluate(() => currentPlace().page)
    await a.evaluate(() => openJump()); await a.waitForSelector('.byob-jumpbox input')
    await a.fill('.byob-jumpbox input', 'III'); await a.press('.byob-jumpbox input', 'Enter'); await a.waitForTimeout(700)
    const toRoman = await a.evaluate(() => currentPlace().page)
    // Retest, 15 Oct: "Go to page" in the contents (the jump readers use) takes the printed number too ("type 445 to reach printed 423"),
    // and the file's page where no page prints the number.
    const contentsJump = async value => {
      await a.evaluate(() => openContents()); await a.waitForSelector('.byob-toc-jump input')
      const shown = await a.evaluate(() => ({ value: document.querySelector('.byob-toc-jump input').value, of: document.querySelector('.byob-toc-jump span').textContent }))
      await a.fill('.byob-toc-jump input', value); await a.press('.byob-toc-jump input', 'Enter'); await a.waitForTimeout(700)
      return { shown, page: await a.evaluate(() => currentPlace().page) }
    }
    const jumps = [await contentsJump(printed(m.figurePage)), await contentsJump('viii'), await contentsJump(String(m.pages - 10))]
    ok(`${tag}: "Go to page" in the contents shows and takes printed numbers (${printed(m.figurePage)} is file page ${m.figurePage}; "viii"; a number no page prints is the file's page)`, jumps[0].shown.of === `of ${printed(m.pages)}` && jumps[0].page === m.figurePage && jumps[1].page === 8 && jumps[2].page === m.pages - 10 && jumps[1].shown.value === printed(m.figurePage), jumps)
    await a.evaluate(n => { goTo({ page: n, frac: 0 }); onScroll() }, m.figurePage); await a.waitForTimeout(700)
    const last = printed(m.pages)
    ok(`${tag}: the top bar and the page jump show printed numbers ("of ${last}"), and a jump takes a printed number or a roman one`, bar.progress.startsWith(`p. ${printed(m.figurePage)} · `) && bar.aria.includes(`page ${printed(m.figurePage)} of ${last}`) && jump.value === printed(m.figurePage) && jump.of === `of ${last}` && toSarsa === m.sarsaPage && toRoman === 3, { bar, jump, toSarsa, toRoman })
    if (!phone) {
      const strip = await a.evaluate(() => document.querySelector('.pdf-strip [aria-valuetext]')?.getAttribute('aria-valuetext') || document.querySelector('.pdf-strip')?.getAttribute('aria-valuetext'))
      // (The strip names the first page of its window: the page above the reader's, or theirs.)
      ok(`${tag}: the strip names the printed page`, [0, 1, 2].some(k => strip === `p. ${printed(m.figurePage - k)} of ${m.pages}`), strip)
    }
    // Item 11: a drag through text wrapped beside the figure keeps the figure's labels and caption out of the body.
    const order = await a.evaluate(n => { const p = state.pages[n - 1]; const r = document.createRange(); r.selectNodeContents(p.layer); getSelection().removeAllRanges(); getSelection().addRange(r); const t = getSelection().toString().replace(/\s+/g, ' '); getSelection().removeAllRanges(); return t }, m.figurePage)
    const body = order.indexOf('a total of 198 input units that encode the backgammon position, a layer of hidden units, and one output unit that estimates the probability of winning from that position.')
    ok(`${tag}: reading order round a figure: the body reads straight through, the labels and caption after it`, body >= 0 && order.indexOf('predicted probability') > body + 200 && order.indexOf('Figure 16.1') > body && !/position with the (?:TD error|hidden units)/.test(order), order.slice(0, 400))
    // Release train 2: E's figure detection finds Figure 16.1 where F's reading order took its labels and caption out of the body.
    await a.waitForFunction(n => state.figs.has(n), m.figurePage, { timeout: 15000 }).catch(() => {})
    const agree = await a.evaluate(figureOrderAgrees, [m.figurePage, ['Figure 16.1']])
    ok(`${tag}: figure detection (PR E) and reading order (PR F) agree on the figure page: its labels and caption inside the figure found, no body line in it`, agree.ok, agree)
    // Copy quote names the printed page.
    await a.evaluate(() => getSelection().removeAllRanges())
    const picked = await selectText(a)
    if (picked) {
      await a.waitForSelector('.mr-bar, .mr-pbar')
      await layout('bar')
      if (look === 'paper') await shot(a, `${tag}-bar`)
      await a.click('.mr-float [data-m="more"]'); await a.waitForSelector('.mr-more, .mr-pmore')
      await a.click('.mr-float [data-m="copy"]').catch(() => {}); await a.waitForTimeout(400)
      const copied = await a.evaluate(() => navigator.clipboard.readText().catch(() => ''))
      ok(`${tag}: Copy quote names the printed page`, new RegExp(`— Learning from Reward, p\\. ${printed(m.figurePage)}$`).test(copied), copied.slice(-80))
    } else ok(`${tag}: text to select on the figure page`, false, null)
    if (!phone) {
      // Item 8: a question about another chapter: this chapter and the contents before the breakpoint, the search's passages after it.
      await a.evaluate(() => getSelection().removeAllRanges()); await a.mouse.click(5, height - 5)
      const q0 = account.requests.length
      await a.keyboard.press('/'); await a.keyboard.type('Where is Sarsa introduced?'); await a.keyboard.press('Enter')
      await a.waitForTimeout(1500)
      const ask = chats(q0).find(r => /Sarsa introduced/.test(JSON.stringify(r.body.messages)))
      const doc = ask?.body?.companion?.document, found = ask?.body?.companion?.passages || []
      const chapter = m.chapters.find(c => c.title.startsWith('16 '))
      ok(`${tag}: the question goes with chapter 16 whole and the contents with printed pages (the long-file part)`, doc?.part?.total === m.pages && doc.units[0].n === printed(chapter.from) && doc.units.at(-1).n === printed(chapter.to) && doc.part.toc.some(e => e.title === '6.4 Sarsa: On-policy TD Control' && e.n === printed(m.sarsaPage)), doc && { first: doc.units[0].n, last: doc.units.at(-1).n, toc: doc.part?.toc?.length })
      ok(`${tag}: "where is Sarsa introduced" carries the page that introduces it, first, from the search of the whole book`, found[0]?.n === printed(m.sarsaPage) && /name Sarsa/.test(found[0].text) && found.length <= 6 && !found.some(f => Number(f.n) >= Number(printed(chapter.from)) && Number(f.n) <= Number(printed(chapter.to))), found.map(f => f.n))
      // Retest, 15 Oct: the hit's whole section (6.4, from its title to 6.5's), not only its opening lines; all passages within the request's budget.
      const sarsa = found[0]?.text || ''
      ok(`${tag}: the hit goes as its whole section: 6.4 from its title to the next section, within the passages' budget`, /^(?:6\.4 )?Sarsa: On-policy TD Control/.test(sarsa) && sarsa.length > 1200 && !/Q-learning: Off-policy TD Control/.test(sarsa) && found.reduce((n, f) => n + f.text.length, 0) <= 40000, { start: sarsa.slice(0, 60), length: sarsa.length, total: found.reduce((n, f) => n + f.text.length, 0) })
      await layout('whole')
      if (look === 'paper') await shot(a, `${tag}-whole`)
      const q1 = account.requests.length
      await a.keyboard.press('/'); await a.keyboard.type('What did TD-Gammon learn from?'); await a.keyboard.press('Enter'); await a.waitForTimeout(1500)
      const ask2 = chats(q1).find(r => /TD-Gammon learn/.test(JSON.stringify(r.body.messages)))
      ok(`${tag}: a second question in the chapter sends the same document, byte for byte (the cached prefix), with its own passages`, ask2 && JSON.stringify(ask2.body.companion.document) === JSON.stringify(doc) && JSON.stringify(ask2.body.companion.passages || null) !== JSON.stringify(found), { same: ask2 && JSON.stringify(ask2.body.companion.document) === JSON.stringify(doc) })
      // Anders, 15 Oct: a question naming chapters ("what do chapters 3 and 6 say?") carries their opening text first (from the contents), then the search.
      const q2 = account.requests.length
      await a.evaluate(() => { document.activeElement?.blur?.(); openCard(null) })
      await a.keyboard.press('/'); await a.keyboard.type('What do chapters 3 and 6 say?'); await a.keyboard.press('Enter'); await a.waitForTimeout(1500)
      const ask3 = chats(q2).find(r => /chapters 3 and 6/.test(JSON.stringify(r.body.messages)))
      const ch3 = m.chapters.find(c => c.title.startsWith('3 ')), ch6 = m.chapters.find(c => c.title.startsWith('6 ')), got = ask3?.body?.companion?.passages || []
      ok(`${tag}: "what do chapters 3 and 6 say?" carries each chapter's opening text first, from the contents, then the search's passages (at most 6)`, ask3?.body?.companion?.scope === 'whole' && got[0]?.n === printed(ch3.from) && got[1]?.n === printed(ch6.from) && /Finite Markov/.test(got[0].text) && /Temporal-Difference/.test(got[1].text) && got.length <= 6, got.map(f => [f.n, f.text.slice(0, 60)]))
      // A passage action carries the document but no search.
      await a.keyboard.press('Escape'); await a.evaluate(() => { col.open = null; getSelection().removeAllRanges() })
      await selectText(a); await a.waitForSelector('.mr-bar'); const e0 = account.requests.length
      await a.click('.mr-bar [data-m="explain"]'); await a.waitForTimeout(1200)
      const ex = chats(e0).find(r => r.body?.companion?.intent === 'explain')
      ok(`${tag}: Explain sends the chapter's document and no search passages`, ex && JSON.stringify(ex.body.companion.document) === JSON.stringify(doc) && !ex.body.companion.passages, ex && { passages: !!ex.body.companion.passages })
      await layout('explain card')
      await a.keyboard.press('Escape'); await a.evaluate(() => { col.open = null; getSelection().removeAllRanges() })
    }
    // Item 9: Before you start is about the chapter the reader is in, never a part, the index or the references.
    for (const [where, page, want] of [['the figure page (chapter 16)', m.figurePage, '16 Applications and Case Studies'], ['the index', m.indexFrom + 3, '17 Frontiers'], ['the references', m.refsFrom + 1, '17 Frontiers'], ['the preface', 8, '1 Introduction']]) {
      if (phone && where !== 'the index') continue
      await a.evaluate(n => { closePrimer(); goTo({ page: n, frac: 0.1 }); onScroll() }, page); await a.waitForTimeout(700)
      const p0 = account.requests.length
      await a.evaluate(() => openPrimer()); await a.waitForTimeout(1500)
      // Made once per unit (later views read the account's copy): the request when there is one, else the unit opened.
      const req = chats(p0).find(r => r.body?.companion?.chapter?.action?.kind === 'primer')
      const unit = await a.evaluate(() => primer.unit?.title)
      // Sent as the chapter it is ("Chapter 16: Applications and Case Studies"; Anders, 15 Oct).
      const named = want.replace(/^(\d+) (.*)$/, 'Chapter $1: $2')
      ok(`${tag}: Before you start on ${where} is the primer of ${want}, named "${named}"`, unit === want && (!req || req.body.companion.chapter.action.unitTitle === named), { unit, asked: req?.body?.companion?.chapter?.action })
      if (where === 'the index') await layout('primer')
      await a.evaluate(() => closePrimer())
    }
    ok(`${tag}: layout (bar, whole-PDF card, Explain card, primer): no problems`, !problems.length && !A.problems.length, [...problems, ...A.problems].slice(0, 5))
    // Item 12: reopening from this device reads the stored file once and writes nothing before the first page is drawn.
    if (width === 1440 && look === 'paper') {
      await a.waitForTimeout(1500)
      const B = await A.ctx.newPage()
      await B.addInitScript(watchStore)
      const t = Date.now()
      await B.goto(`${origin}/lab/addbook/?userBook=${hex}`)
      await B.waitForFunction(() => window.__drawn, null, { timeout: 30000 })
      const ms = Date.now() - t
      const store = await B.evaluate(() => ({ before: window.__books.filter(([, at]) => at <= window.__drawn).map(([op]) => op), drawn: Math.round(window.__drawn) }))
      ok(`${tag}: reopening reads the stored file once and writes nothing before the first page is drawn (${ms} ms)`, JSON.stringify(store.before) === '["get"]', store)
      await B.waitForTimeout(3200)
      const later = await B.evaluate(() => window.__books.map(([op]) => op))
      ok(`${tag}: when it was opened is written once, after the page is shown`, later.filter(op => op === 'put').length <= 1 && later.length <= 3, later)
      results.at(-1).reopenMs = ms
      await B.close()
    }
    await A.ctx.close()
  }
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
  'primer-kinds': [primerKinds, rows => rows.some(r => !r.pass)],
  keys: [keysAndAccess, rows => rows.some(r => !r.pass)],
  contrast: [contrast, rows => rows.some(r => r.required && !r.pass)],
  // The EPUB margin is off in the reader for now (reader.js EPUB_MARGIN = false): its check runs in
  // `sample` and `full` only with EPUB_MARGIN=1 (or on its own: `node scripts/margin-check.mjs epub`).
  ...(process.env.EPUB_MARGIN === '1' ? { epub: [epubCheck, rows => rows.some(r => r.problems)] } : {}),
  scans: [scanChecks, rows => rows.some(r => !r.pass)],
  figures: [figureMatrix, rows => rows.some(r => !r.pass)],
  'figure-margins': [retestFigures, rows => rows.some(r => !r.pass)],
  long: [longBooks, rows => rows.some(r => !r.pass)],
  polish: [polish, rows => rows.some(r => !r.pass)],
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
  else if (mode === 'primer-kinds') { const rows = await primerKinds(browser, origin); failed = rows.some(r => !r.pass); writeFileSync(join(OUT, 'primer-kinds-results.json'), JSON.stringify(rows, null, 2)) }
  else if (mode === 'primer') { const rows = await primerBehaviour(browser, origin); failed = rows.some(r => !r.pass); writeFileSync(join(OUT, 'primer-results.json'), JSON.stringify(rows, null, 2)) }
  else if (mode === 'behaviour') { const rows = await behaviour(browser, origin); failed = rows.some(r => !r.pass); writeFileSync(join(OUT, 'behaviour-results.json'), JSON.stringify(rows, null, 2)) }
  else if (mode === 'column') { const rows = await columnMatrix(browser, origin); failed = rows.some(r => r.problems); writeFileSync(join(OUT, 'column-results.json'), JSON.stringify(rows, null, 2)) }
  else if (mode === 'resize') { const rows = await resizeRun(browser, origin); failed = rows.some(r => r.problems); writeFileSync(join(OUT, 'resize-results.json'), JSON.stringify(rows, null, 2)) }
  else if (mode === 'epub') { const rows = await epubCheck(browser, origin); failed = rows.some(r => r.problems); writeFileSync(join(OUT, 'epub-results.json'), JSON.stringify(rows, null, 2)) }
  else if (mode === 'scans') { const rows = await scanChecks(browser, origin); failed = rows.some(r => !r.pass); writeFileSync(join(OUT, 'scans-results.json'), JSON.stringify(rows, null, 2)) }
  else if (mode === 'figure-margins') { const rows = await retestFigures(browser, origin); failed = rows.some(r => !r.pass); writeFileSync(join(OUT, 'figure-margins-results.json'), JSON.stringify(rows, null, 2)) }
  else if (mode === 'figures') { const rows = await figureMatrix(browser, origin); failed = rows.some(r => !r.pass); writeFileSync(join(OUT, 'figures-results.json'), JSON.stringify(rows, null, 2)) }
  else if (mode === 'polish') { const rows = await polish(browser, origin); failed = rows.some(r => !r.pass); writeFileSync(join(OUT, 'polish-results.json'), JSON.stringify(rows, null, 2)) }
  else if (mode === 'long') { const rows = await longBooks(browser, origin); failed = rows.some(r => !r.pass); writeFileSync(join(OUT, 'long-results.json'), JSON.stringify(rows, null, 2)) }
  else if (mode === 'pairs') { const list = await pairs(browser, origin); console.log(list.join('\n')) }
  else throw new Error('unknown mode: ' + mode)
} finally { await browser.close(); server.close() }
if (failed) { console.error('Layout problems found; see ' + OUT); process.exit(1) }
