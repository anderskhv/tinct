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
//   node scripts/margin-check.mjs layout [pdf ...]    the Aa panel: Margin view and Focus view (the page centred, cards in a pop-up
//                                                     window inside the screen, the place kept, the choice kept on reload)
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
//   node scripts/margin-check.mjs phone-ui            the PM's battery of 15 Oct (phones): the text column fit on a phone (zoom, pan inside
//                                                     the page, place and pinch kept), the header's title and pill, the desktop unchanged,
//                                                     Chat in the t menu, Escape on the Aa panel, &pages on a first open, two devices at once (409)
//   node scripts/margin-check.mjs phone-kind          option C (16 Oct): on a phone a PDF opens by its kind: a narrative as its Tinct text
//                                                     (on to the Tinct reader), a paper in its pages at the column fit (layout check);
//                                                     the reader's choice wins; the desktop ignores the phone's default.
//                                                     The desktop (16 Oct): its pages unless running prose (a MacKay-like page of
//                                                     mathematics with margin figures, which scored under 3.5, now opens as its pages;
//                                                     a place read in Tinct text under the old default gives way, a chosen one stands).
//                                                     Per device (19 Oct): the place's edition never decides; two devices sharing one
//                                                     place: the desktop in its pages, the phone in Tinct text at the same spot, and back
//   node scripts/margin-check.mjs card-safety       16 Oct: a card never keeps the wait ring (drawing throws, the column throws, a step
//                                                     before the request throws, the card dropped mid-request, a stalled stream), failures
//                                                     reported; and the first request on a fresh open: Explain within its 3 s document wait, Ask with the document
//   node scripts/margin-check.mjs latency [pdf ...]   the Ask latency part alone, on the given PDFs
//   node scripts/margin-check.mjs justified           16 Oct: a selection over justified lines that pdf.js gives in pieces: its text is
//                                                     the page's text, and its highlight's marks cover the selection to each line's end,
//                                                     in every look at 1440×900 and 390×844 (JUSTIFIED_PDF=<file> FROM=<words> TO=<words>
//                                                     PAGE=<n> also checks a PDF of your own, as Constructor Theory)
//   node scripts/margin-check.mjs primer-anchor     19 Oct: Before you start made ahead once as the PDF opens, shown at once, scrolling
//                                                     away with the page (never following the reader), never made again
//   node scripts/margin-check.mjs wait-dots         19 Oct: the wait before an answer is the book reader's chat dots (cards, Chat, primer)
//   node scripts/margin-check.mjs chat-scroll       19 Oct: scrolling in Chat never scrolls the pages (wheel, touch); a sent question is held
//                                                     near the top; a chat reply is plain (the exact reply of 19 Oct)
//   node scripts/margin-check.mjs highlight-place   19 Oct: a highlight's box covers its words, also when made while the pages are redrawn
//   node scripts/margin-check.mjs card-fold         19 Oct: a click outside an open card folds it, its answer kept (also mid-stream)
//   node scripts/margin-check.mjs cross-page        19 Oct: a selection across a page break highlights body words only (no running heads,
//                                                     page numbers or empty boxes), on its words, and reloads in place
//   node scripts/margin-check.mjs column-page       19 Oct: the wide column is part of the page (Gloss): cards at their passages, fixed
//                                                     with the page through scrolls, straight leader lines (one slant when pushed down),
//                                                     pushed down never overlapping, an open card growing in place with no scroll of its own
//   node scripts/margin-check.mjs figure-race       19 Oct: no figure over prose, found with half the text layer missing or on a redraw
//   node scripts/margin-check.mjs cards-gloss       19 Oct: Minimise folds a card; the bin beside copy deletes it; no quoted passage;
//                                                     a one-sentence answer in regular weight; the follow-up field visible
//                                                     unfocused (border, placeholder), mic and send inside it, send by
//                                                     Enter or the button
//   node scripts/margin-check.mjs pause-dots        19 Oct, evening (11): the dots below an answer that pauses (Counterpoint, a
//                                                     follow-up), gone when more comes or on an error; focus rings for keys only
//   node scripts/margin-check.mjs passage-mark      19 Oct, evening (10): the underline under each line's baseline, tints that never
//                                                     cover a neighbour's words (also at leading 1.05), the Aa panel's Passage mark
//   node scripts/margin-check.mjs stray-menu        19 Oct, evening (4): the bar only after a deliberate selection (drag, keys, a
//                                                     highlight), never for one set by code, restored on refocus or left as a card folds
//   node scripts/margin-check.mjs whole-words       19 Oct, evening (8): a split first word ("S" | "ection") selected, quoted and
//                                                     highlighted whole; an old highlight from "ection" re-snapped only when safe
//   node scripts/margin-check.mjs primer-top        19 Oct, evening (9): Before you start and the start pills at the top of page 1,
//                                                     also when page 1 is a picture cover without text
//   node scripts/margin-check.mjs define-card       19 Oct, evening (7): Define on the wide column as an open margin card only (no
//                                                     pop-over); narrow windows and the phone keep the pop-over
//   node scripts/margin-check.mjs figure-chip       19 Oct, evening (5): the figure chip in the bar's dark style: Ask, Explain,
//                                                     Highlight, Copy; Ask opens the figure's card
//   node scripts/margin-check.mjs highlight-bar     19 Oct, evening (2): a highlight clicked opens the dark bar: Ask, Explain, its
//                                                     colours, its note, Remove highlight; recolour, Explain, remove
//   node scripts/margin-check.mjs zoom-panel        19 Oct, evening (6): a PDF's Aa Zoom (−, %, +, Fit width), the page never past
//                                                     its room; no Full width; phones and Tinct text keep the slider
//   node scripts/margin-check.mjs margin-notes      19 Oct, evening (3): a note from a click on the empty margin, at that height;
//                                                     fold first; empty goes; kept, synced, reloaded; Ask makes it a chat
//   node scripts/margin-check.mjs table-crop        19 Oct, night (2): Table 1's crop snapped to its rules with its labels, drawn sharp,
//                                                     its caption as printed; no picture in the wide column's card (CT_PDF: the real PDF)
//   node scripts/margin-check.mjs unit-marks        19 Oct, night (1): each unit's marks on the wide column, level with its heading and
//                                                     its last line (Primer, Catch me up; Recap, Quiz me, Note), the chapter menu's actions (unit-pills: the same)
//   node scripts/margin-check.mjs unit-pills        (old name) 19 Oct, evening (1): each unit's pills on the wide column (Primer, Catch me up;
//                                                     Recap, Quiz me, Note), their cards; a file without units; phones unchanged
//   node scripts/margin-check.mjs epub-open           20 Oct 2026 (an own EPUB, Night): opens at the Preface; the front matter one compact
//                                                     centred block; the cover's black strip trimmed; the book's small caps; its contents
//                                                     page hidden; links readable; Tinct paper (no sheets) with the margin column
//   node scripts/margin-check.mjs epub-units          20 Oct 2026: one unit per essay, Starting / End of marks at the heading and last line,
//                                                     a whole-book Before you start at the very top, its primer the whole book's
//   node scripts/margin-check.mjs epub-marks          20 Oct 2026: a passage mark over a heading and whole paragraphs sits under each line's
//                                                     words, never through a line or past its last word
//   node scripts/margin-check.mjs epub-quiz           20 Oct 2026: the quiz card named by the chapter, no page references, "2/3" and Try new
//                                                     questions, a retry sending the questions asked, one card per quiz
//   node scripts/margin-check.mjs epub-ask            20 Oct 2026: the Ask pill (Gloss's), Enter in Ask, a follow-up, Explain's and a quiz
//                                                     answer never moving the reading place, an answer's sources as Fact-check's
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
const { proseBook, makePdf, prose, figurePaper, longBook, marginPaper, justifiedPaper, sectionPaper } = await import(pathToFileURL(join(REPO, 'addbooks/web/test/make-pdf.mjs')).href)
const LONG_BOOK = join(OUT, 'long_prose_book.pdf')
// 19 Oct 2026, night: a 20-page paper of numbered sections starting mid-page (the unit marks), its Table 1 boxed in rules.
const SECTION_PAPER = join(OUT, 'section_paper.pdf')
writeFileSync(SECTION_PAPER, sectionPaper())
writeFileSync(LONG_BOOK, proseBook({ paragraphs: 48 }))
// FIXES-2026-10-15 items 4–7: a paper of figures (a labelled network diagram, a block diagram at the page's left edge, a table, a large figure).
const FIGURE_PAPER = join(OUT, 'figure_paper.pdf')
writeFileSync(FIGURE_PAPER, figurePaper())
// Retest of 15 Oct: figures with captions in a wide right margin, as MacKay sets them.
const MARGIN_PAPER = join(OUT, 'margin_paper.pdf')
writeFileSync(MARGIN_PAPER, marginPaper())
// 16 Oct: justified lines that pdf.js gives in pieces (Constructor Theory's highlight that stopped mid-line).
const JUSTIFIED = justifiedPaper({ meta: true })
const JUSTIFIED_PAPER = join(OUT, 'justified_paper.pdf')
writeFileSync(JUSTIFIED_PAPER, JUSTIFIED.bytes)
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
  card: DEFAULT_SELECTORS.card + ', .mr-trigger, .mr-primer, .mr-col .mr-undo, .mr-col .mr-unit',
  text: DEFAULT_SELECTORS.text + ', .mr-note *, .mr-stack, .mr-stack *, .mr-foot *, .mr-trigger',
  tap: DEFAULT_SELECTORS.tap + ', .mr-pmore > button, .mr-note__foot .mr-bar__item, .mr-mark, .mr-trigger, .mr-pill, .mr-primer__close, .mr-map__row, .mr-quiz-row, .mr-primer__foot button',
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
export const ICON_TARGETS = '.mr-card__copy, .mr-card__delete, .mr-undo button, .mr-follow__mic, .mr-follow__send, .mr-swatch, .mr-sheet__grab, .mr-follow__link, button.mr-related__row'
// Since 19 Oct 2026 the wide column is part of the page (reader.js layoutColumn): its cards scroll with the pages
// like their text, so a card scrolled out of the pages' view (or under the top bar, or under open Chat's own
// panel, which stays put) is not on screen to check, as a line of page text there would not be. Those are set
// aside for the check; every card in view is checked as before.
const asideOutOfView = () => {
  const s = document.getElementById('scroll'); if (!s || !document.querySelector('.mr-doc')) return 0
  const sr = s.getBoundingClientRect(), top = Math.max(sr.top, document.getElementById('hdr')?.getBoundingClientRect().bottom || 0)
  const chat = document.querySelector('.mr-col:not(.mr-doc) .mr-card.is-whole.is-open')?.getBoundingClientRect()
  let n = 0
  for (const el of document.querySelectorAll('.mr-doc > .mr-card, .mr-doc > .mr-trigger, .mr-doc > .mr-unit, .mr-doc > .mr-primer, .mr-doc > .mr-undo')) {
    const r = el.getBoundingClientRect()
    const under = chat && Math.min(r.bottom, chat.bottom) - Math.max(r.top, chat.top) > 0
    if (r.top < top - 0.5 || r.bottom > sr.bottom + 0.5 || under) { el.dataset.mcAside = el.style.visibility; el.style.visibility = 'hidden'; n++ }
  }
  return n
}
const restoreAside = () => { for (const el of document.querySelectorAll('[data-mc-aside]')) { el.style.visibility = el.dataset.mcAside; delete el.dataset.mcAside } }
export async function checkMargin(page, selectors = SELECTORS) {
  await page.evaluate(asideOutOfView)
  let list
  try { list = (await checkLayout(page, { selectors })).filter(p => !scrolledAway(p) && !srOnly(p)) }
  finally { await page.evaluate(restoreAside) }
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
// 20 Oct 2026: an essay collection shaped like Anders's "Bold Conjectures, Volume II" (make-epub.mjs makeEssayEpub): cover,
// half title and title in the book's own small caps, copyright, dedication, supporters, its own contents page, a preface
// and essays with author lines.
const { makeEssayEpub } = await import(pathToFileURL(join(REPO, 'addbooks/web/test/make-epub.mjs')).href)
const ESSAYS = makeEssayEpub()
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
export const mock = { next: null, nextFor: {}, delay: 0, delayFor: {}, primer: null, primers: [], chunks: null, chunksFail: false, fail: null, stall: false }
/** The mocked Fact-check's text before its search, streamed before "Checking sources…" as the doc-first Worker streamed it
    (off since 19 Oct 2026): a restating opening and a first round's Sources line, which the card never shows. */
export const FACTCHECK_OPENING = 'The passage claims that MOCK opening restates what it says {p. 1}.\n\nSources: none searched yet.'
function mockText(body) {
  const c = body?.companion || {}, intent = c.intent
  if (mock.nextFor[intent] != null) { const t = mock.nextFor[intent]; delete mock.nextFor[intent]; return t }
  if (mock.next != null) { const t = mock.next; mock.next = null; return t }
  if (intent === 'define') return JSON.stringify({ kind: 'definition', definition: `Noun. A mocked meaning of “${c.selection}” here.` })
  if (intent === 'define_sense') return JSON.stringify({ sense: 2 })
  if (intent === 'quiz') return JSON.stringify({ ideas: ['MOCK idea one', 'MOCK idea two', 'MOCK idea three'], thesis: 'MOCK: the author argues ideas and facts are known differently.', questions: [
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
  // Fact-check as a model answered on 19 Oct 2026 (Anders): a restating opening and a first round's Sources line before the
  // verdict, "From general knowledge," and an italic "Note." label; the card shows the verdict first, a plain caveat, the links.
  if (intent === 'factcheck') return `${FACTCHECK_OPENING}\n\nHolds. MOCK verdict line for the passage. From general knowledge, the figure still stands.\n\n*Note.* MOCK caveat in one plain sentence. The claim is about apes today.\n\nSources: [Mock source one](https://example.org/one) · [Mock source two](https://example.org/two)`
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
  // `mock.stall`: the stream opens and then sends nothing more, never ending (16 Oct: a card that waited for ever).
  if (mock.stall) { mock.stall = false; res.write(`event: message_start\ndata: ${JSON.stringify({ type: 'message_start', message: { usage: {} } })}\n\n`); return }
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
export const scanMock = { uploadDelay: 0, legacy: false, failStart: false, recognised: new Map(), jobs: new Map(), log: [] }
async function ocrRoute(req, res, [, hex, part, n]) {
  const book = account.books.find(b => b.sha256.startsWith(hex)), month = { used: 12, limit: 1500 }
  let job = scanMock.jobs.get(hex); const method = req.method
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
    // The account busy as the reader says yes (scanMock.failStart): the job is not started.
    if (scanMock.failStart) return json(res, 503, { error: 'busy' })
    // The new job's status, as the Worker answers its POST (uploading, every page missing).
    if (!job) { job = { pages: (scanMock.recognised.get(hex) || []).length, missing: new Set((scanMock.recognised.get(hex) || []).map(pg => pg.page)), ready: new Set(), done: new Set() }; scanMock.jobs.set(hex, job) }
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
    // The first-party events intake (routes/events.ts), recorded as the Worker would receive it.
    if (req.method === 'POST' && p === '/api/events') { const body = JSON.parse((await readBody(req)).toString() || '{}'); account.requests.push({ path: p, body, at: Date.now(), done: Date.now() }); res.writeHead(204); return res.end() }
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
// Before you start is made ahead as a signed-in reader opens a PDF (reader.js primerPrefetch, 19 Oct 2026): wait
// until that has run (or found nothing to do), so a check's own requests and mocked replies are its own.
async function prefetchSettled(page, ms = 15000) {
  await page.waitForFunction(() => !window.TinctAI?.session?.().token || (primerAhead.key && !primerMaking.size && primerAhead.done), null, { timeout: ms, polling: 100 }).catch(() => {})
}
// Select words on the first text page in view: `words` words from a long span, or one word.
async function selectText(page, { oneWord = false, near = 'middle' } = {}) {
  return page.evaluate(({ oneWord, near }) => {
    const spans = [...document.querySelectorAll('.pdf-sheet .text-layer span')].filter(s => {
      const r = s.getBoundingClientRect(); const t = s.textContent || ''
      return r.top > 120 && r.bottom < innerHeight - 140 && r.left > 0 && r.right < innerWidth && (oneWord ? /(?<=^|\s)[a-z]{5,}(?=[\s,.;:]|$)/ : /[A-Za-z]{5,}/).test(t) && t.trim().split(/\s+/).length >= (oneWord ? 1 : 4)
    })
    if (!spans.length) return null
    // The pointer goes down on the page (19 Oct 2026, item 4: a selection opens the bar only as a gesture ends).
    document.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerType: 'mouse' })); 
    const span = near === 'top' ? spans[0] : near === 'bottom' ? spans[spans.length - 1] : spans[Math.floor(spans.length / 2)]
    const node = span.firstChild, t = node.textContent
    let a, b
    if (oneWord) { const m = /(?<=^|\s)[a-z]{5,}(?=[\s,.;:]|$)/.exec(t) || /[A-Za-z]{5,}/.exec(t); a = m.index; b = a + m[0].length }
    else { const next = spans[spans.indexOf(span) + 1]; if (next && next.firstChild) { getSelection().setBaseAndExtent(node, 0, next.firstChild, next.firstChild.textContent.length); document.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, pointerType: 'mouse' })); return getSelection().toString() } a = 0; b = t.length }
    getSelection().setBaseAndExtent(node, a, node, b)
    // The pointer let go (19 Oct 2026, item 4): the bar opens only after a deliberate selection, never one set by code alone.
    document.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, pointerType: 'mouse' }))
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
        // On a phone the note is the bottom card, its field focused (20 Oct 2026), closed as the card is.
        await page.click('.mr-float [data-m="note"]')
        await check('note', width >= 700 ? '.mr-note' : '.mr-sheet .mr-note-edit')
        if (width < 700) await page.evaluate(() => closeSheet2())
        await page.keyboard.press('Escape'); await page.keyboard.press('Escape')
        await page.mouse.click(5, height - 5)
        // Define.
        if (!await pick({ oneWord: true })) throw new Error('no word to select')
        // On the wide column Define is a card (19 Oct 2026, evening); elsewhere its pop-over.
        await check('define', '.mr-define .mr-define__senses, .mr-define .mr-define__body p:not(.mr-define__wait), .mr-doc .mr-card.is-open .mr-answer')
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
      // 19 Oct 2026: nothing before the verdict reaches the card (no restating opening, no first round's Sources line); the dots wait below the status.
      ok('12. Fact-check: while the search runs only "Checking sources…" and the waiting dots show; no text from before the search, no verdict yet', !/MOCK opening|none searched/.test(during) && !/MOCK verdict/.test(during) && !(await a.$('.mr-card.is-open .is-bottom-line')) && !!(await a.$('.mr-card.is-open .tc-wait')), { during, dots: !!(await a.$('.mr-card.is-open .tc-wait')) })
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
  const fcText = await a.evaluate(() => { const c = keptCards().find(x => x.kind === 'factcheck'); openCard(c.id); return true }).then(() => a.waitForTimeout(300)).then(() => a.evaluate(() => ({ labels: document.querySelectorAll('.mr-card.is-open .mr-verdict').length, links: [...document.querySelectorAll('.mr-card.is-open .mr-sources a')].map(x => x.textContent), font: getComputedStyle(document.querySelector('.mr-card.is-open .mr-sources')).fontSize, sourceRows: document.querySelectorAll('.mr-card.is-open .mr-sources').length })))
  ok('12. Fact-check: no "Note." label; the only sources are the real links, as plain links in 12px', fcText.labels === 0 && fcText.links.join('|') === 'Mock source one|Mock source two' && fcText.font === '12px' && fcText.sourceRows === 1, fcText)
  const fcOrder = await a.evaluate(() => { const c = document.querySelector('.mr-card.is-open .mr-card__body'); const t = c.innerText; return { text: t, first: c.querySelector('.mr-answer')?.innerText.trim(), opening: /MOCK opening|passage claims|none searched/i.test(t), meta: /general knowledge|claim is about|Note\./i.test(t), caveat: t.indexOf('MOCK caveat in one plain sentence.'), verdict: t.indexOf('Holds. MOCK verdict'), sources: t.indexOf('Mock source one'), bottom: c.querySelector('.is-bottom-line')?.textContent, verdicts: (t.match(/\bHolds\./g) || []).length } })
  ok('12. Fact-check: the verdict first as the bottom line, then the caveat as a plain sentence, then the sources; no restating opening, no remarks on the check', !fcOrder.opening && !fcOrder.meta && fcOrder.verdict === 0 && fcOrder.first.startsWith('Holds. MOCK verdict line for the passage.') && fcOrder.text.indexOf('The figure still stands.') > fcOrder.verdict && fcOrder.text.indexOf('The figure still stands.') < fcOrder.caveat && fcOrder.caveat > fcOrder.verdict && fcOrder.sources > fcOrder.caveat && fcOrder.bottom === 'Holds. MOCK verdict line for the passage.' && fcOrder.verdicts === 1, fcOrder)
  await shot(a, 'factcheck-card-1440x900')
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
  // Q1 right, Q2 shown, Q3 not yet. Since 20 Oct 2026 (Anders: "maybe could just say 2/3, try new questions?") the end card
  // is the score alone, right answers of all the questions (a shown answer is not right), and Try new questions.
  ok('after question 3: the score alone, "1/3", and Try new questions', /^Quiz me · p\. \S+\s*1\/3\s*Try new questions\s*$/.test(score.replace(/\n+/g, '\n')) && (await a.evaluate(() => getComputedStyle(document.querySelector('.mr-card.is-open .is-bottom-line')).fontWeight)) === '600', score)
  if (!process.env.NO_SHOTS) await shot(a, 'prc-quiz-end-1440x900')
  const q2 = account.requests.length
  await a.click('.mr-card.is-open [data-c="again"]'); await a.waitForTimeout(1200)
  const retry = account.requests.slice(q2).find(r => r.body?.companion?.intent === 'quiz' && r.body.companion.selection)
  ok('"Try new questions" writes new questions on the same passage, in the same card', !!retry && (await a.innerText('.mr-card.is-open .mr-card__count')) === '1 of 3')
  // 20 Oct 2026: never the same questions; the ones asked go with the request, the missed ones marked (Q2 shown, Q3 not yet).
  ok('"Try new questions" sends the questions asked, Q2 and Q3 marked missed', JSON.stringify(retry?.body.companion.asked?.map(a => [a.q.slice(0, 7), !!a.missed])) === JSON.stringify([['MOCK Q1', false], ['MOCK Q2', true], ['MOCK Q3', true]]), retry?.body.companion.asked)
  await fresh(a)
  // FIXES-2026-10-15 A7: Quiz me streams. Question 1 shows before the stream ends; answering ahead shows
  // "Writing the next question…" at the same card height, no ring; the quiz is saved once, when it ends.
  {
    const Q = [1, 2, 3].map(n => ({ q: `MOCK streamed Q${n}?`, answer: n === 1 ? 'Ideas' : `A${n}`, why: 'Because.', cite: '{p. 1}' }))
    // The key ideas come first (20 Oct 2026): they set the quiz's length, "1 of 3".
    const j = JSON.stringify({ ideas: ['MOCK idea 1', 'MOCK idea 2', 'MOCK idea 3'], questions: Q }), cut1 = j.indexOf('{"q":"MOCK streamed Q2'), cut2 = j.indexOf('{"q":"MOCK streamed Q3')
    // One quiz per passage since 20 Oct 2026 (Quiz me again on the same passage opens its quiz): each run starts from no quiz card.
    const run = async (chunks, fail) => {
      await a.evaluate(() => { for (const c of keptCards()) if (c.kind === 'quiz') { col.ctl.get(c.id)?.abort(); col.quiz.delete(c.id); col.live.delete(c.id) } openCard(null); store.set('cards:' + state.key, keptCards().filter(c => c.kind !== 'quiz')); col.view = null; marginLayout({ fresh: true }) })
      // The page stays where the reader left it since 20 Oct 2026 (a card's answer never scrolls it): back to running text.
      await a.evaluate(() => { goTo({ page: 2, frac: 0.05 }); onScroll() }); await a.waitForTimeout(600)
      await selectText(a); await a.waitForSelector('.mr-bar'); mock.chunks = chunks; mock.chunksFail = fail
      await a.click('.mr-bar [data-m="more"]'); await a.waitForSelector('.mr-more'); await a.click('.mr-more [data-m="quiz"]')
      await a.waitForFunction(() => /MOCK streamed Q1/.test(document.querySelector('.mr-card.is-open')?.innerText || ''), null, { timeout: 4000 }).catch(() => {})
    }
    const saved = () => a.evaluate(() => keptCards().filter(c => c.kind === 'quiz').map(c => ({ id: c.id, n: c.data?.questions?.length || 0, ended: !!c.data?.ended, done: !!c.data?.done })))
    const before = 0
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
    const wait = await a.evaluate(() => { const el = document.querySelector('.mr-card.is-open'); return { text: el.innerText, h: el.getBoundingClientRect().height, ring: !!el.querySelector('.tinct-wait-ring, .tc-wait') } })
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
    const cut = (await saved()).slice(before)
    const txt = await a.innerText('.mr-card.is-open').catch(() => '')
    ok('stopped after question 1: it stays, "1 of 1", "See your score", no error; saved with one question', cut.length === 1 && cut[0].n === 1 && cut[0].ended && /MOCK streamed Q1/.test(txt) && /1 of 1/.test(txt) && !/could not be loaded/.test(txt), { cut, txt })
    await a.click('.mr-card.is-open [data-c="show"]').catch(() => {}); await a.waitForTimeout(200)
    ok('"See your score" on the last question that arrived', /See your score/.test(await a.innerText('.mr-card.is-open')))
    await a.click('.mr-card.is-open [data-c="next"]').catch(() => {}); await a.waitForTimeout(300)
    // PR C: a "Show answer" question is not scored, and the end card says so.
    ok('the score counts right answers of all the questions (a shown answer is not right): "0/1", and "Try new questions"', /(^|\s)0\/1(\s|$)/.test(await a.innerText('.mr-card.is-open')) && !!(await a.$('.mr-card.is-open [data-c="again"]')), await a.innerText('.mr-card.is-open'))
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
  ok('"/" asks about the whole PDF; the answer opens in the Chat card at the top of the column (first; the primer\'s trigger, when it shows, follows in its place)', whole?.body?.companion?.context?.kind === 'pdf' && (await a.innerText('.mr-col .mr-card.is-whole .mr-card__label')).startsWith('Chat') && (await a.evaluate(() => { const t = document.querySelector('.mr-col .mr-trigger'); const w = document.querySelector('.mr-col .mr-card.is-whole'); return w.offsetTop === 0 && (!t || t.parentElement !== w.parentElement /* open Chat is its own panel (19 Oct): the trigger stays at its page */ || t.offsetTop >= w.offsetTop + w.offsetHeight + TinctMargin.COL.cardGap - 0.5) })))
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
  // Define's pop-over is a narrow window's (and the phone's) since 19 Oct 2026, evening: the wide column shows a card
  // instead (define-card). These checks of the pop-over and the lookups run at 1024×768.
  const C = await readerPage(browser, origin, hex, { width: 1024, height: 768, look: 'paper' }).catch(() => null)
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
  // EPUB_MARGIN (19 Oct 2026, Anders: EPUBs in Margin view on the desktop): at a desktop's width an EPUB read here has the
  // margin (its bar, no popup); at a phone's width (where phones read EPUBs in the Tinct reader) it behaves as before.
  for (const [width, height, on] of [[1440, 900, true], [390, 844, false]]) {
    const E = await openEpubHere(browser, origin, { width, height, look: 'paper', margin: false })
    await E.page.evaluate(() => goTo({ page: 3, frac: 0.02 })); await E.page.waitForTimeout(500)
    await E.page.evaluate(selectEpub, { ch: 3, nth: 1 }); await E.page.waitForTimeout(700)
    const got = await E.page.evaluate(() => ({ on: marginOn(), col: !!document.querySelector('.mr-col:not([hidden])'), bar: !!document.querySelector('.mr-bar, .mr-pbar'), popup: !!document.querySelector('.selection-popup') }))
    if (on) ok('EPUB_MARGIN on the desktop: an EPUB has the margin (its bar, no selection popup)', got.on && got.bar && !got.popup, got)
    else ok('EPUB_MARGIN at a phone\'s width: an EPUB has no margin and keeps the selection popup', !got.on && !got.col && !got.bar && got.popup, got)
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
  // (On the wide column Before you start's trigger is its unit's Primer pill since 19 Oct 2026, evening: item 1.)
  await a.waitForSelector('.mr-col .mr-pill[data-pill="primer"]', { timeout: 8000 }).catch(() => {})
  await prefetchSettled(a)
  const units = await a.evaluate(() => primer.units)
  // The unit's own pages, from its entry's page (not the title page before it, which only offers the trigger).
  const unitPages = u => u.to - u.start + 1
  const r0 = chats().length
  const trig = await a.evaluate(() => {
    const t = document.querySelector('.mr-col .mr-pill[data-pill="primer"]'), row = t?.closest('.mr-unit'); if (!t) return null
    const span = getComputedStyle(t.querySelector('span'))
    // Its start mark's rule at the top of its unit's heading on the page (19 Oct 2026, night: the unit marks), measured in the column.
    const u = primer.units?.[0], p = state.pages[(u?.start || 1) - 1], want = (u?.title || '').toLowerCase().replace(/[^a-z0-9]/g, '')
    const head = [...p.layer.querySelectorAll('span')].filter(sp => { const t = sp.textContent.toLowerCase().replace(/[^a-z0-9]/g, ''); return t.length > 3 && want.startsWith(t) }).sort((x, y) => y.getBoundingClientRect().height - x.getBoundingClientRect().height)[0]
    const line = head ? head.getBoundingClientRect().top - row.parentElement.getBoundingClientRect().top : NaN
    return { text: t.getAttribute('aria-label'), words: t.textContent.trim(), top: row.offsetTop, bottom: row.offsetTop + row.offsetHeight, line, tip: t.title, radius: span.borderRadius, border: span.borderTopWidth, font: getComputedStyle(t).fontFamily }
  })
  ok('at the PDF\'s start its Primer (Before you start) is in the start mark level with the unit\'s heading (19 Oct, night): "✧ Primer", named for the unit ("Before you start: The gist and a map of chapter 1."), "Before you start (B)" in its title, the book reader\'s pill', trig && trig.text === 'Before you start: The gist and a map of chapter 1.' && trig.words === '✧Primer' && Math.abs(trig.top - trig.line) <= 2 && trig.tip === 'Before you start (B)' && trig.radius === '999px' && trig.border === '1px' && /EB Garamond/.test(trig.font), trig)
  // Made ahead as the file opens (Anders, 19 Oct 2026): one request, for the reader's unit, marked speculative (never charged).
  const req = primers(0)[0]
  ok('as the file opens (signed in), the primer of the reader\'s unit is made once, ahead, marked speculative', primers(0).length === 1 && req.body.companion.speculative === true, { requests: primers(0).length, speculative: req?.body?.companion?.speculative })
  await a.keyboard.press('b'); await a.waitForSelector('.mr-col .mr-primer .mr-primer__gist', { timeout: 8000 }).catch(() => {})
  // It opens in place (Anders, 15 Oct): from its trigger's place, growing down; measured once it has grown.
  await a.waitForTimeout(450)
  ok('B opens the primer in place, made nothing more: the one chapter request (ahead), action primer for the unit, the unit\'s pages as a PDF', primers(r0).length === 0 && primers(0).length === 1 && req.body.companion.chapter?.action?.kind === 'primer' && req.body.companion.chapter.action.unitKey === 'outline-0' && req.body.companion.chapter.action.unitTitle === 'Chapter 1. Of Ideas' && req.body.companion.context.kind === 'pdf' && req.body.companion.context.pages.length === unitPages(units[0]) && units.length === 5 && !req.body.companion.selection && !req.body.system, req?.body?.companion && { ...req.body.companion, context: { ...req.body.companion.context, pages: req.body.companion.context.pages.length } })
  const shown = await a.evaluate(() => { const p = document.querySelector('.mr-col .mr-primer'); return { heads: [...p.querySelectorAll('.mr-primer__head')].map(h => h.textContent), claims: p.querySelectorAll('.mr-primer__claims li').length, cites: p.querySelectorAll('.mr-primer__claims .mr-cite').length, rows: p.querySelectorAll('.mr-map__row').length, quiz: p.querySelector('.mr-quiz-row')?.innerText.replace(/\s+/g, ' '), foot: p.querySelector('.mr-primer__foot')?.innerText.replace(/\s+/g, ' '), cards: [...document.querySelectorAll('.mr-col .mr-card')].filter(c => !c.hidden).length, top: p.offsetTop, bottom: p.parentElement.clientHeight - p.offsetTop - p.offsetHeight, pressed: document.querySelector('.mr-col .mr-pill[data-pill="primer"]')?.getAttribute('aria-expanded') } })
  // (Since 19 Oct 2026 the column is part of the page: the primer opens in place, under its unit's pills, its Primer pill pressed.)
  ok('the primer: gist, Key claims (numbered, cite tags), Keep in mind, Map, the quiz row and its footer, in place under its pills', JSON.stringify(shown.heads) === '["Key claims","Keep in mind","Map"]' && shown.claims === 3 && shown.cites === 3 && shown.rows === 3 && shown.quiz === 'Quiz me on this chapter 3 questions →' && shown.foot === 'Made when you opened the file Redo' && shown.cards === 0 && shown.top >= (trig?.bottom ?? 1e9) - 1 && shown.top - (trig?.bottom ?? 0) <= 20 && shown.pressed === 'true', { ...shown, trig })
  await a.waitForTimeout(600)
  const stored = account.primers.get(hex + '?outline-0')
  ok('signed in with the book in the account, the primer is stored with it (PUT /api/user-books/primers)', stored && /MOCK gist/.test(stored.gist) && stored.unitKey === 'outline-0' && !!stored.madeAt, stored)
  await a.click('.mr-col .mr-primer .mr-primer__close'); await a.waitForTimeout(250)
  ok('its close folds it back to the trigger (its Primer pill)', !(await a.$('.mr-col .mr-primer')) && await a.isVisible('.mr-col .mr-pill[data-pill="primer"]'))
  await a.click('.mr-col .mr-pill[data-pill="primer"]'); await a.waitForTimeout(400)
  ok('clicking the trigger opens it again, and reopening never makes it again', await a.isVisible('.mr-col .mr-primer .mr-primer__gist') && primers(r0).length === 0)
  await a.keyboard.press('Escape'); await a.waitForTimeout(200)
  ok('Escape folds the primer back', !(await a.$('.mr-col .mr-primer')) && await a.isVisible('.mr-col .mr-pill[data-pill="primer"]'))
  // Another device (this browser's copy gone): the account's primer, not a new one.
  await a.evaluate(() => { for (const k of Object.keys(localStorage)) if (k.includes(':primer:')) localStorage.removeItem(k) })
  const r1 = chats().length
  await a.reload(); await a.waitForFunction(() => document.querySelectorAll('.pdf-sheet .text-layer span').length > 20); await a.waitForTimeout(900)
  await prefetchSettled(a)
  await a.keyboard.press('b'); await a.waitForSelector('.mr-col .mr-primer .mr-primer__gist', { timeout: 8000 }).catch(() => {})
  ok('on another device (opened there, and B) the account\'s primer opens; nothing is made again', primers(r1).length === 0 && /MOCK gist/.test(await a.innerText('.mr-col .mr-primer')))
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
  ok('the chapter quiz is kept with the cards (synced) and has no leader line', await a.evaluate(() => keptCards().some(c => c.data?.unit?.key === 'outline-0' && c.rects.length === 1) && !document.querySelector('svg.mr-leads path:not(.is-folded):not(.is-rule)')))
  await a.keyboard.press('Escape')
  // The next unit's start offers its own trigger; the middle of a unit offers none.
  await a.evaluate(n => goTo({ page: n, frac: 0 }), units[1].start); await a.waitForTimeout(700)
  const t5 = await a.evaluate(n => document.querySelector(`.mr-col .mr-unit[data-unit="${primer.units.find(u => u.start === n)?.key}"] .mr-pill[data-pill="primer"]`)?.getAttribute('aria-label'), units[1].start)
  await a.evaluate(n => goTo({ page: n, frac: 0.3 }), units[1].start + 1); await a.waitForTimeout(700)
  // (The trigger is part of the page at its unit's start since 19 Oct 2026: in the middle of a unit none is in view.)
  const t6 = await a.evaluate(() => { const t = [...document.querySelectorAll('.mr-col .mr-pill[data-pill="primer"]')].find(x => { const r = x.getBoundingClientRect(), s = document.getElementById('scroll').getBoundingClientRect(); return r.bottom > Math.max(s.top, document.getElementById('hdr').getBoundingClientRect().bottom) && r.top < s.bottom }); if (!t) return false; const r = t.getBoundingClientRect(), s = document.getElementById('scroll').getBoundingClientRect(); return r.bottom > Math.max(s.top, document.getElementById('hdr').getBoundingClientRect().bottom) && r.top < s.bottom })
  ok('each top-level outline entry\'s start offers its unit; the middle of a unit offers none in view', /map of chapter 2\.$/.test(t5 || '') && !t6, { t5, t6 })
  const r3 = chats().length
  await a.keyboard.press('b'); await a.waitForTimeout(1000)
  const req3 = primers(r3)[0]
  ok('B anywhere opens the primer of the unit the reader is in', req3?.body?.companion?.chapter?.action?.unitKey === 'outline-1', req3?.body?.companion?.chapter)
  await a.keyboard.press('Escape')
  ok('no page errors', !A.problems.length, A.problems)
  await A.ctx.close()
  // A PDF under 40 pages with an outline (the prose book, 21 pages) has its chapters as units since 19 Oct 2026, night
  // (TinctMargin.sizeUnits: 3–25 pages a unit; before, one unit "all"): B makes the first chapter's primer, its pages only.
  // (Made ahead as it opens, or on B: the one request since it opened.)
  const rs = chats().length
  const S = await readerPage(browser, origin, hexShort, { width: 1440, height: 900, look: 'paper' })
  await S.page.waitForSelector('.mr-col .mr-pill[data-pill="primer"]', { timeout: 8000 }).catch(() => {})
  await prefetchSettled(S.page)
  const ts = await S.page.evaluate(() => ({ trig: document.querySelector('.mr-col .mr-pill[data-pill="primer"]')?.getAttribute('aria-label'), units: primer.units.map(u => u.key), pages: primer.units[0].to - primer.units[0].start + 1 }))
  await S.page.keyboard.press('b'); await S.page.waitForTimeout(1000)
  const reqs = primers(rs)[0]
  ok('a PDF under 40 pages with chapters: its chapters are its units; the first chapter\'s pages go', /map of chapter 1\.$/.test(ts.trig || '') && ts.units.join() === 'outline-0,outline-1,outline-2,outline-3,outline-4' && reqs?.body?.companion?.chapter?.action?.unitKey === 'outline-0' && reqs.body.companion.context.pages.length === ts.pages, { ts, action: reqs?.body?.companion?.chapter, pages: reqs?.body?.companion?.context?.pages?.length })
  await S.ctx.close()
  // A PDF without an outline is one unit, "all".
  const rb = chats().length
  const B = await readerPage(browser, origin, hex2, { width: 1440, height: 900, look: 'night' })
  await B.page.waitForSelector('.mr-col .mr-pill[data-pill="primer"]', { timeout: 8000 }).catch(() => {})
  await prefetchSettled(B.page)
  const tb = await B.page.evaluate(() => document.querySelector('.mr-col .mr-pill[data-pill="primer"]')?.getAttribute('aria-label'))
  const ub = await B.page.evaluate(() => primer.units.map(u => ({ key: u.key, pages: u.to - u.start + 1 })))
  await B.page.keyboard.press('b'); await B.page.waitForTimeout(1000)
  const reqb = primers(rb)[0]
  // Since 19 Oct 2026, night (TinctMargin.sizeUnits), a short paper's headings found by the scan are its units too (the
  // two-column paper's numbered sections); one with none is one unit, "all" (unit sizing's tests).
  ok('a PDF without an outline: its scanned headings as units, the first unit\'s pages sent', ub.length > 1 && /map of chapter 1\.$/.test(tb || '') && reqb?.body?.companion?.chapter?.action?.unitKey === ub[0].key && reqb.body.companion.context.pages.length === ub[0].pages, { tb, ub, action: reqb?.body?.companion?.chapter, pages: reqb?.body?.companion?.context?.pages?.length })
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
    await prefetchSettled(a)
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
    // Made fresh on each device here (the account's copy from the desktop run is cleared): ahead as it opens (19 Oct 2026), or on B.
    account.primers.clear()
    const r0 = account.requests.length
    const A = await readerPage(browser, origin, bare, { width, height, look: 'paper', at: 8 })
    const a = A.page
    await a.waitForFunction(() => primer.units && primerHasText(), null, { timeout: 30000 }).catch(() => {})
    const units = await a.evaluate(() => primer.units.map(u => ({ key: u.key, title: u.title, label: u.label || null, from: u.from, start: u.start, to: u.to, matter: u.matter || null })))
    ok(`${tag}: no outline: the units are the printed contents' chapters, not one unit for the whole PDF`, units.length >= 17 && units.every(u => u.key !== 'all') && units.some(u => u.label === 'Chapter 1: Introduction' && u.start === ch1.from && u.to === ch1.to), units.slice(0, 3))
    const lines = await a.evaluate(n => { const out = []; for (let p = 1; p <= n; p += 9) out.push(TinctMargin.triggerLine(TinctMargin.primerUnitAt(primer.units, p))); return out }, m.pages)
    ok(`${tag}: the trigger names its chapter on every page, never "the whole PDF"`, lines.every(l => /^The gist and a map of chapter \d+\.$/.test(l)), [...new Set(lines)].slice(0, 6))
    await a.evaluate(() => { goTo({ page: 8, frac: 0.1 }); onScroll() }); await a.waitForTimeout(600)
    // The phone has no B key: the same call.
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
  await prefetchSettled(a)
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
  await prefetchSettled(b)
  await b.clock.install()
  // (Made ahead as it opened: this browser's copy and the account's go, so opening it asks.)
  account.primers.clear()
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
  // (Selecting with the pointer folds the open card since 19 Oct; it is opened again here, as the keys would leave it.)
  const openId = await a.evaluate(() => col.open)
  await selectText(a); await a.waitForSelector('.mr-bar'); await a.evaluate(id => openCard(id), openId); await a.waitForTimeout(150); await a.click('.mr-bar [data-m="more"]'); await a.waitForSelector('.mr-more')
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
  // Since 19 Oct 2026 the column is part of the page: nothing folds to a row or gathers; every card shows, pushed
  // down in page order, none over another, the open one open (Related and figure cards like every other).
  if (document.querySelector('.mr-doc')) {
    const cards = store.get('cards:' + state.key) || [], how = id => { const el = col.els.get(id); return !el || el.hidden ? 'hidden' : el.classList.contains('is-open') ? 'open' : 'card' }
    const by = {}; for (const c of cards) (by[c.kind] = by[c.kind] || []).push(how(c.id))
    const rs = [...document.querySelectorAll('.mr-doc > .mr-card:not([hidden])')].map(el => el.getBoundingClientRect()).sort((x, y) => x.top - y.top)
    const overlap = rs.some((r, i) => i && r.top < rs[i - 1].bottom - 0.5)
    return { ok: ['related', 'figure'].every(k => (by[k] || []).length && by[k].every(h => h !== 'hidden')) && !overlap && !!col.open && how(col.open) === 'open', by, overlap }
  }
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
  // Since 19 Oct 2026 the column is part of the page: its dots are in the pages' scroller's coordinates, one per
  // card at its passage's line (every card, not only those in view).
  const s = document.getElementById('scroll'), sr = s.getBoundingClientRect(), dy = s.scrollTop - sr.top
  // (A figure's card starts level with the figure's top less 4px; its dot and line are at its label.)
  const labelMid = id => { const l = document.querySelector(`.mr-doc .mr-card[data-id="${CSS.escape(id)}"] .mr-card__label`); return l ? Math.round(l.offsetTop + l.offsetHeight / 2) : 12 }
  const want = viewCards().filter(c => !c.data?.unit && !c.gone).map(card => { const f = TinctMargin.firstRect(card), p = state.pages[f[0] - 1]; if (!p) return null; const b = p.pg.getBoundingClientRect(); return card.kind === 'figure' ? Math.round(b.top + f[2] * b.height + dy) - 4 + labelMid(card.id) : b.top + f[2] * b.height + f[4] * b.height / 2 + dy }).filter(v => v != null)
  const dots = [...document.querySelectorAll('svg.mr-leads circle')].map(c => Number(c.getAttribute('cy')))
  const loose = dots.filter(y => !want.some(w => Math.abs(w - y) < 1.5))
  const shown = [...document.querySelectorAll('.mr-doc .mr-card:not([hidden]):not(.is-whole):not(.is-unit)')].length
  const lines = document.querySelectorAll('svg.mr-leads path:not(.is-folded):not(.is-rule)').length
  return { ok: !loose.length && dots.length >= shown && (!col.open || col.open === 'whole' || lines === 1), loose, dots: dots.length, shown, lines }
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
          await page.click('.mr-float [data-m="note"]')
          // A phone: the note is the bottom card (20 Oct 2026), its field focused in it; written there, nothing to save.
          if (await page.waitForSelector('.mr-sheet .mr-note-edit', { timeout: 1500 }).catch(() => null)) {
            await page.keyboard.type('A note on a crowded page.')
            await state('crowded-note', () => {
              const el = document.querySelector('.mr-sheet'), f = el?.querySelector('.mr-note-edit'), r = el?.getBoundingClientRect()
              return { ok: String(col.open || '').startsWith('n-') && !!f && f.value === 'A note on a crowded page.' && document.activeElement === f && r.top >= 0 && r.bottom <= innerHeight + 1, open: col.open, focus: document.activeElement?.className }
            })
            await page.evaluate(() => closeSheet2())
          } else {
          await page.waitForSelector('.mr-note .mr-note__field', { timeout: 4000 })
          await page.keyboard.type('A note on a crowded page.')
          await page.click('.mr-note [data-m="save"]')
          await state('crowded-note', () => {
            const el = document.querySelector('.mr-sheet, .mr-card.is-floating.is-open, .mr-col .mr-card.is-open:not([hidden])')
            const r = el?.getBoundingClientRect()
            return { ok: String(col.open || '').startsWith('n-') && !!el && /A note on a crowded page\./.test(el.innerText) && r.top >= 0 && r.bottom <= innerHeight + 1 && el.contains(document.activeElement), open: col.open, focus: document.activeElement?.className }
          })
          }
        } else found.push({ state: 'crowded-note', kind: 'error', el: 'no text to select' })
        // A 600-word answer: the open card scrolls inside; its label and follow-up line stay in view.
        await settle(page); await page.evaluate(seedCards, { lines: 1, pairs: false, open: 0, kinds: ['explain'], answer: LONG })
        await state('long', () => {
          const el = document.querySelector('.mr-card.is-open, .mr-sheet'); if (!el) return { ok: false, why: 'no open card' }
          const b = el.querySelector('.mr-card__body'), lab = (el.querySelector('.mr-card__label') || el.querySelector('.mr-sheet__grab')).getBoundingClientRect(), fu = el.querySelector('.mr-follow').getBoundingClientRect()
          // The wide column (19 Oct 2026): the card grows in place, no scroll of its own; the page is the one scroll.
          if (el.closest('.mr-doc')) { const scrolls = [el, ...el.querySelectorAll('*')].filter(n => n.scrollHeight - n.clientHeight > 1 && /(auto|scroll)/.test(getComputedStyle(n).overflowY)).map(n => n.className); return { ok: !scrolls.length && el.getBoundingClientRect().height > 600 && lab.top >= 0, scrolls, lab: lab.top } }
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
        await state('trigger', () => ({ ok: col.mode !== 'column' || !!document.querySelector('.mr-col .mr-pill[data-pill="primer"]'), mode: col.mode }))
        await page.evaluate(LONG => { openCard(null); const u = currentUnit(); store.set(primerKey(u), { ...LONG, madeAt: new Date().toISOString(), unitKey: u.key }); openPrimer(u) }, LONG_PRIMER)
        // (Wide: in its place in the page's layer, the cards pushed below it, none over it; 19 Oct 2026.)
        await state('primer', () => { const el = document.querySelector('.mr-primer'), r = el?.getBoundingClientRect(); return { ok: !!el?.querySelector('.mr-map') && el.querySelectorAll('.mr-map__row').length === 8 && (col.mode !== 'column' || ![...document.querySelectorAll('.mr-doc > .mr-card:not([hidden])')].some(c => { const q = c.getBoundingClientRect(); return Math.min(q.bottom, r.bottom) - Math.max(q.top, r.top) > 0.5 })) } })
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
        if (w >= 1180) { const lines = await page.evaluate(() => document.querySelectorAll('svg.mr-leads path:not(.is-folded):not(.is-rule)').length); if (lines !== 1) found.push({ w, kind: 'open line', el: String(lines) }) }
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
  await opened.page.waitForSelector('.epub-sheet:not(.is-toc) .epub-pg'); await opened.page.waitForTimeout(900)
  return opened
}
// Select `chars` characters of the `nth` paragraph of chapter `ch` (1-based), as a reader would.
function selectEpub({ ch = 3, nth = 1, chars = 110 } = {}) {
  const p = state.pages[ch - 1].pg.querySelectorAll('p')[nth], t = p.firstChild
  document.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerType: 'mouse' })); getSelection().setBaseAndExtent(t, 0, t, Math.min(chars, t.textContent.length))
  document.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, pointerType: 'mouse' }))
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
      // Anders, 19 Oct 2026, night: no picture in the card on the wide column (the figure is beside it); elsewhere a small one.
      await page.waitForFunction(() => col.mode === 'column' || !!document.querySelector('.mr-card.is-open .mr-thumb img, .mr-sheet .mr-thumb img'), null, { timeout: 8000 })
      const sent = account.requests.slice(before).find(r => r.path === '/api/chat')
      const pics = (sent?.body?.messages?.at(-1)?.content || []).filter?.(b => b.type === 'image') || []
      const rules = JSON.stringify(sent?.body?.messages?.[0] || '')
      await check('fig-card', [whole => {
        const card = cardById(col.open), el = document.querySelector('.mr-sheet') || document.querySelector('.mr-card.is-open'), f = state.pages[0].pg.getBoundingClientRect(), box = TinctMargin.anchorOfCard(card)[0]
        const figTop = f.top + box.y * f.height, r = el?.getBoundingClientRect()
        // Beside: in the column the card starts level with the figure's top (less the 4px lift), unless the column moved it up to fit; marks float it beside the mark; the phone's bottom card sits below the figure.
        const beside = col.mode === 'column' ? Math.abs(r.top - (figTop - 4)) < 3 || r.bottom <= f.top + (box.y + box.h) * f.height + 2 : col.mode === 'marks' ? !!el?.classList.contains('is-floating') : r.top >= figTop
        const label = el?.querySelector('.mr-card__name')?.textContent || el?.getAttribute('aria-label')
        const img = el.querySelector('.mr-thumb img'), pic = col.mode === 'column' ? !el.querySelector('.mr-thumb') && el.querySelector('.mr-card__body > :first-child')?.classList.contains('mr-quote') : !!img?.naturalWidth && img.getBoundingClientRect().height <= 120.5
        return { ok: beside && /^Figure 1 · p\. 1$/.test(label || '') && pic && chat.turns.length === whole && keptCards().filter(c => c.kind === 'figure' && !c.gone).length === 1, mode: col.mode, beside, label, top: r && Math.round(r.top), figTop: Math.round(figTop) }
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
  // Every line the recognition note shows, as it shows it, kept here across the page's navigations.
  const ocrLines = []
  const fresh = async ({ width, height, legacy }) => {
    const ctx = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1, hasTouch: width < 700 })
    // The Tinct reader (not served here): where a recognised scan goes on to as its Tinct text.
    await ctx.route('**/reader?userBook=*', r => r.fulfill({ status: 200, contentType: 'text/html', body: '<!doctype html><title>Tinct reader</title>' }))
    await ctx.exposeBinding('__ocrLine', (_, text) => { if (ocrLines.at(-1) !== text) ocrLines.push(text) })
    await ctx.addInitScript(() => {
      new MutationObserver(() => { const n = document.querySelector('.byob-ocr'); if (n?.textContent) window.__ocrLine?.(n.textContent) })
        .observe(document, { subtree: true, childList: true, characterData: true })
    })
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
  // The tap on "Recognise text", timed in the page: how soon "Recognising text…" and its bar show.
  const tapStart = page => page.evaluate(() => new Promise(resolve => {
    const t = performance.now()
    document.querySelector('.byob-ocr [data-ocr="start"]').click()
    const look = () => {
      const el = document.querySelector('.byob-ocr[data-kind="progress"]'), bar = el?.querySelector('.byob-ocr-bar[role="progressbar"]')
      if (el && /Recognising text…/.test(el.textContent)) resolve({ ms: Math.round(performance.now() - t), bar: !!bar, max: Number(bar?.getAttribute('aria-valuemax')), now: Number(bar?.getAttribute('aria-valuenow')), pages: state.pdf.numPages, button: !!el.querySelector('[data-ocr="start"]') })
      else if (performance.now() - t > 3000) resolve({ ms: null })
      else requestAnimationFrame(look)
    }
    look()
  }))
  const removeAll = () => { account.books = account.books.filter(b => !b.sha256.startsWith(hex)); scanMock.jobs.delete(hex) }

  // 1. The first-open race against an account that answers 404 until the copy is stored (the Worker before
  //    PR D): asked again once the copy is in, and the offer comes; the "can't be read aloud" line never shows.
  {
    removeAll()
    const { ctx, page, problems } = await fresh({ width: 1440, height: 900, legacy: true })
    const offer = await page.waitForSelector('.byob-ocr[data-kind="offer"]', { timeout: 30000 }).then(() => true).catch(() => false)
    const asks = scanMock.log.filter(([m, part, h]) => m === 'GET' && part === 'job' && h === hex)
    ok('an account that answers 404 until the copy is stored: the scan is asked about again once it is saved, and recognition is offered', offer && asks.length >= 2 && asks[0][3] === false && asks.at(-1)[3] === true, { offer, asks })
    ok('...and "This PDF is a scan without text" never shows meanwhile', !await noText(page) && !problems.length, { toasts: await page.evaluate(() => window.__toasts), problems })
    await ctx.close()
    removeAll()
  }
  // 1b. The yes answered at once, and rolled back with a short line when the account cannot start the job (r, 20 Oct 2026).
  {
    removeAll(); scanMock.failStart = true
    const { ctx, page, problems } = await fresh({ width: 1440, height: 900 })
    await page.waitForSelector('.byob-ocr[data-kind="offer"]', { timeout: 30000 }).catch(() => {})
    const tap = await tapStart(page)
    ok('r: "Recognise text" answers within 100 ms: "Recognising text…" with a determinate bar of the book\'s pages, before the account is asked', tap.ms !== null && tap.ms < 100 && tap.bar && tap.max === tap.pages && tap.now === 0 && !tap.button, tap)
    const back = await page.waitForFunction(() => document.querySelector('.byob-ocr[data-kind="offer"] [data-ocr="start"]') && (window.__toasts || []).includes('Could not start recognising the text. Try again.'), null, { timeout: 20000 }).then(() => true).catch(() => false)
    ok('r: the account cannot start the job: the offer comes back, with "Could not start recognising the text. Try again."', back && !problems.length, { toasts: await page.evaluate(() => window.__toasts), kind: await page.evaluate(() => document.querySelector('.byob-ocr')?.dataset.kind), problems })
    await ctx.close()
    scanMock.failStart = false; removeAll(); ocrLines.length = 0
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
  // Started before the copy is stored: it waits for it, then sends the pages. The tap is answered at once.
  const tap = await tapStart(page)
  const askedYet = scanMock.log.some(([m, part, h]) => m === 'POST' && part === 'job' && h === hex)
  ok('r: the yes shows "Recognising text…" and a bar at 0 of the pages within 100 ms, while the account copy is still on its way', tap.ms !== null && tap.ms < 100 && tap.bar && tap.max === tap.pages && !askedYet, { tap, askedYet })
  const bars = []
  const watchBar = setInterval(() => page.evaluate(() => Number(document.querySelector('.byob-ocr-bar')?.getAttribute('aria-valuenow'))).then(n => { if (Number.isFinite(n) && bars.at(-1) !== n) bars.push(n) }).catch(() => {}), 60)
  // Recognised while the book is open: the desktop shows its Tinct text in Margin view at the same place (items r and s), no "ready" line.
  const switched = await page.waitForFunction(() => isPdfText() && document.querySelector('.pt-chapter') && marginOn(), null, { timeout: 60000 }).then(() => true).catch(() => false)
  clearInterval(watchBar)
  await page.waitForTimeout(800)
  const kept = await page.evaluate(() => { const s = epubSpot(), at = currentPlace(); return { url: location.pathname + location.search, edition: store.get('edition:' + hexOf(state.key)), at: PT().pageAt(state.pdfText.edition, at.page, s.para || 0, s.word || 0), words: document.querySelectorAll('.pt-chapter p').length } })
  ok('r: recognised while open (mocked job): the desktop switches to the Tinct text by itself, inside Margin view (no /reader), at the page it was on', switched && kept.url.startsWith('/lab/addbook/?userBook=' + hex) && kept.at?.page === 1 && kept.words > 2 && kept.edition === 'text', kept)
  ok('r: no "Tinct text is ready" line on the way; the bar went up as pages were prepared', !ocrLines.some(t => /is ready/.test(t)) && bars.length >= 2 && bars.at(-1) > bars[0], { ocrLines, bars })
  // The way back: Original pages, the scan with its words over its pages.
  await page.evaluate(() => pdfTextToPages())
  const layered = await page.waitForFunction(() => state.kind === 'pdf' && document.querySelectorAll('.pdf-sheet[data-page="1"] .text-layer span').length > 10, null, { timeout: 60000 }).then(() => true).catch(() => false)
  ok('recognised (mocked), and switched back to Original pages: the PDF reader, its words laid over page 1', layered && new URL(page.url()).pathname === '/lab/addbook/' && (await spans(page)) > 10, { url: page.url(), spans: await spans(page) })
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
  // Tinct text is offered in the Aa panel (under Layout, or its own row: TinctReaderLayout.TINCT_TEXT).
  ok('the scan now reads aloud and summarizes (its recognised text), and the Tinct text is in the Aa panel', await page.evaluate(() => { openDisplay(); const offered = !!document.querySelector('.byob-aa-panel [data-layout="text"], .byob-aa-panel [data-t="text"]:not([hidden])'); closeDisplay(); return !document.getElementById('playBtn').disabled && !hasNoText() && offered }))
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
  // Made ahead once its text was recognised (19 Oct 2026), or on B: the one primer request since (none came before, above).
  const pr = chats().slice(q0).find(r => r.body?.companion?.intent === 'chapter')
  ok('the primer on the scan is made from its recognised text and shows in the column', primed && pr?.body?.companion?.context?.pages?.every(pg => pg.text.trim().length > 20) && pr.body.companion.document?.units?.length === made.recognised.length, { primed, pages: pr?.body?.companion?.context?.pages?.map(pg => pg.text.length) })
  await page.waitForTimeout(300)
  const primerProblems = await checkMargin(page)
  ok('the primer beside the scan is laid out cleanly', !primerProblems.length, primerProblems)
  await shot(page, 'scan-1440x900-primer')
  ok('no page errors on the desktop', !problems.length, problems)
  await ctx.close()

  // 2b. Recognised while the book was not open (r): the next open on a phone is its Tinct text (its default, kept as
  //     the phone's); on the desktop, its pages with the margin, as its rule says.
  {
    const P = await fresh({ width: 390, height: 844 })
    const went = await P.page.waitForURL(`**/reader?userBook=${hex}**`, { timeout: 30000 }).then(() => true).catch(() => false)
    const auto = await P.page.evaluate(h => JSON.parse(localStorage.getItem('tinct-addbook:phone-edition:' + h) || 'null'), hex)
    ok('r: recognised while away, the phone opens it as its Tinct text, kept as the phone\'s default (not a choice)', went && auto?.edition === 'text' && !P.problems.length, { url: P.page.url(), auto, problems: P.problems })
    await P.ctx.close()
    const D = await fresh({ width: 1440, height: 900 })
    const here = await D.page.waitForFunction(() => document.querySelectorAll('.pdf-sheet[data-page="1"] .text-layer span').length > 10, null, { timeout: 30000 }).then(() => true).catch(() => false)
    await D.page.waitForTimeout(800)
    ok('r: recognised while away, the desktop opens its pages with its words over them (its rule), no "ready" line', here && new URL(D.page.url()).pathname === '/lab/addbook/' && !(await D.page.evaluate(() => document.querySelector('.byob-ocr')?.textContent || '')).includes('ready') && !D.problems.length, { url: D.page.url(), problems: D.problems })
    await D.ctx.close()
  }
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
    const foot = await a.evaluate(() => ({ foot: !!document.querySelector('.mr-foot, .mr-foot__input, .mr-foot__hint, .mr-key'), words: /the whole PDF/.test(document.querySelector('.mr-col')?.innerText || '') && !document.querySelector('.mr-col .mr-trigger, .mr-col .mr-unit') }))
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
    // Since 19 Oct 2026 (as Gloss) the bin is in the action row under the answer, beside copy (the phone's card hides copy).
    const del = await a.evaluate(() => { const el = openCardEl(), b = el?.querySelector('.mr-card__acts .mr-card__delete'), copy = el?.querySelector('.mr-card__acts .mr-card__copy'); const r = b?.getBoundingClientRect(), shown = copy && copy.getBoundingClientRect().width > 0; return b && { w: r.width, h: r.height, inFollow: !!el.querySelector('.mr-follow .mr-card__delete'), beside: shown ? copy.nextElementSibling === b && Math.abs(copy.getBoundingClientRect().top - r.top) < 2 : !!b.closest('.mr-sheet'), copyShown: !!shown } })
    ok(`${tag}: the open card has a bin in its action row beside copy, a 28px target, none in the follow-up field`, del && del.w >= 27.5 && del.h >= 27.5 && del.beside && !del.inFollow, del)
    await a.click(phone ? '.mr-sheet .mr-card__delete' : `.mr-card.is-open .mr-card__delete`); await a.waitForTimeout(400)
    const gone = await a.evaluate(id => ({ open: col.open, shown: !!document.querySelector(`.mr-card[data-id="${id}"], .mr-sheet[data-id="${id}"]`), stored: (store.get('cards:' + state.key) || []).find(c => c.id === id), undo: document.querySelector('.mr-undo:not([hidden])')?.innerText.replace(/\s+/g, ' ').trim() }), made)
    ok(`${tag}: delete takes the card away at once (no confirm), leaves a tombstone, and says "Deleted · Undo"`, !gone.open && !gone.shown && gone.stored?.gone === true && gone.undo === 'Deleted · Undo', gone)
    await layout('undo')
    if (look === 'paper') await shot(a, `${tag}-undo`)
    const undoOverlap = await a.evaluate(() => { const u = document.querySelector('.mr-undo:not([hidden])')?.getBoundingClientRect(); if (!u) return 'none'; return [...document.querySelectorAll('.mr-col .mr-card:not([hidden]), .mr-col .mr-unit, .mr-col .mr-trigger, .mr-sheet')].some(c => { const r = c.getBoundingClientRect(); return Math.min(r.right, u.right) - Math.max(r.left, u.left) > 1 && Math.min(r.bottom, u.bottom) - Math.max(r.top, u.top) > 1 }) })
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
    await a.click('.mr-float [data-m="note"]')
    // On a phone the note is the bottom card (20 Oct 2026): written in its field, kept as the card closes.
    if (phone) {
      await a.waitForSelector('.mr-sheet .mr-note-edit'); await a.fill('.mr-sheet .mr-note-edit', 'MOCK note to delete.')
      const style = await a.evaluate(() => getComputedStyle(document.querySelector('.mr-sheet .mr-note-edit')).fontStyle)
      ok(`${tag}: the phone's note card sets the note text upright (font-style normal)`, style === 'normal', style)
      await a.evaluate(() => closeSheet2()); await a.waitForTimeout(500)
    }
    else { await a.waitForSelector('.mr-note .mr-note__field'); await a.fill('.mr-note .mr-note__field', 'MOCK note to delete.'); await a.click('.mr-note [data-m="save"]'); await a.waitForTimeout(500) }
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
        const cap = await a.evaluate(() => { const c = document.querySelector('.mr-col .mr-card.is-whole.is-open'), colH = document.querySelector('.mr-col:not(.mr-doc)').clientHeight; return c && { h: c.getBoundingClientRect().height, max: parseFloat(getComputedStyle(c).maxHeight), colH } })
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
      const wheel = await a.evaluate(() => { const c = [...document.querySelectorAll('.mr-col .mr-card.is-folded:not([hidden])')].find(c => { const r = c.getBoundingClientRect(); return r.top > 80 && r.bottom < innerHeight - 20 }); if (!c) return null; const r = c.getBoundingClientRect(); return { x: r.left + 40, y: r.top + 10, top: $('scroll').scrollTop } })
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
          // (Its trigger is the unit's Primer pill on the wide column since 19 Oct 2026, evening: it opens under the pills.)
          const t = document.querySelector('.mr-col .mr-pill[data-pill="primer"]'); if (!t) return res(null)
          const r = t.closest('.mr-unit').getBoundingClientRect(), trig = { top: r.bottom, height: r.height }, frames = [], t0 = performance.now()
          t.click()
          const tick = () => { const p = document.querySelector('.mr-col .mr-primer'); if (p) { const b = p.getBoundingClientRect(); frames.push({ top: b.top, height: b.height, bottom: document.querySelector('.mr-col').getBoundingClientRect().bottom - b.bottom }) } if (performance.now() - t0 < 600) requestAnimationFrame(tick); else res({ trig: { top: trig.top, height: trig.height }, frames }) }
          requestAnimationFrame(tick)
        }))
        const f = run?.frames || [], first = f[0], last = f.at(-1)
        const grew = f.some(x => x.height < last?.height - 40)
        // Since 19 Oct 2026 the column is part of the page: the primer opens in its trigger's place (its top where the
        // trigger's was), never moving, at its whole height at once (no scrolling of its own, the page scrolls).
        ok(`${tag}: Before you start ${reduce ? '(reduced motion) ' : ''}opens in place under its pills, never moving, whole at once`, first && first.top >= run.trig.top - 1 && first.top - run.trig.top <= 20 && f.every(x => Math.abs(x.top - first.top) <= 0.5 && Math.abs(x.height - last.height) < 1) && last.height > run.trig.height + 100, { trig: run?.trig, first, last, n: f.length })
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
    // Item 9: Before you start is about the chapter the reader is in, never a part, the index or the references. Since
    // 19 Oct 2026, night (TinctMargin.sizeUnits), a chapter over 30 pages is read in its sections: the primer is of the
    // section the page is in (the figure page), or the nearest (the index and references: chapter 17's last; the
    // preface: chapter 1's first), sent under the section's own title.
    for (const [where, page, want] of [['the figure page (chapter 16)', m.figurePage, /^16\.\d+ /], ['the index', m.indexFrom + 3, /^17\.\d+ /], ['the references', m.refsFrom + 1, /^17\.\d+ /], ['the preface', 8, /^1\.1 /]]) {
      if (phone && where !== 'the index') continue
      await a.evaluate(n => { closePrimer(); goTo({ page: n, frac: 0.1 }); onScroll() }, page); await a.waitForTimeout(700)
      const p0 = account.requests.length
      await a.evaluate(() => openPrimer()); await a.waitForTimeout(1500)
      // Made once per unit (later views read the account's copy): the request when there is one, else the unit opened.
      const req = chats(p0).find(r => r.body?.companion?.chapter?.action?.kind === 'primer')
      const got = await a.evaluate(n => ({ title: primer.unit?.title, from: primer.unit?.from, to: primer.unit?.to, last: primer.units.filter(u => !u.matter && /^17\./.test(u.title)).at(-1)?.title, first: primer.units.find(u => !u.matter)?.title, n }), page), unit = got.title
      const placed = where === 'the figure page (chapter 16)' ? got.from <= page && page <= got.to : where === 'the preface' ? unit === got.first : unit === got.last
      ok(`${tag}: Before you start on ${where} is the primer of a section of its chapter (${want}), sent under its own title`, want.test(unit || '') && placed && (!req || req.body.companion.chapter.action.unitTitle === unit), { got, asked: req?.body?.companion?.chapter?.action })
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
  // Round 1, 15 Oct (MacKay: no outline, a printed contents): Before you start offered nothing on chapter 4 within 5 s of its
  // first open, and the cached prefix changed between requests in one chapter. Opened fresh (no stored scan) at chapter 4.
  {
    const bare = addBook(BARE_BOOK), m = BARE.meta, ch4 = m.chapters.find(c => c.title.startsWith('4 ')), ch16 = m.chapters.find(c => c.title.startsWith('16 '))
    const tag = 'long_book_no_outline-1440x900-paper'
    const A = await readerPage(browser, origin, bare, { width: 1440, height: 900, look: 'paper', at: ch4.from, minSpans: 5 })
    const a = A.page
    const shown = Date.now()
    await a.waitForFunction(() => !!document.querySelector('.mr-trigger, .mr-pill[data-pill="primer"]'), null, { timeout: 30000 }).catch(() => {})
    const wait = Date.now() - shown
    const when = await a.evaluate(() => ({ trigger: !!document.querySelector('.mr-trigger, .mr-pill[data-pill="primer"]'), unit: primer.units && TinctMargin.primerUnitAt(primer.units, currentPlace().page)?.title, scanDone: toc.ready }))
    ok(`${tag}: Before you start's trigger shows on chapter 4 within 5 s of its first text, from the contents the scan finds first (${wait} ms; the scan done: ${when.scanDone})`, when.trigger && wait <= 5000 && /^4 /.test(when.unit || ''), { wait, ...when })
    // The margin's document, a function of the book alone: the same bytes on two pages of chapter 4, the same contents on chapter 16.
    const docs = await a.evaluate(async ([p1, p2, p3]) => { const out = []; for (const n of [p1, p2, p3]) out.push(JSON.stringify(await marginDocument(n))); return out }, [ch4.from + 1, ch4.to - 1, ch16.from + 1])
    const [d1, d2, d3] = docs.map(d => JSON.parse(d))
    const unit = await a.evaluate(n => { const u = TinctMargin.unitAt(primer.units, n); return { from: u.from, to: u.to } }, ch4.from + 1)
    ok(`${tag}: two pages of chapter 4 send the same document byte for byte, the chapter's unit (pages ${unit.from}-${unit.to}); chapter 16 the same contents`, docs[0] === docs[1] && d1.range.from === unit.from && d1.range.to === unit.to && JSON.stringify(d3.part.toc) === JSON.stringify(d1.part.toc) && d1.part.toc.length > 17 && d3.range.from !== d1.range.from, { r1: d1?.range, r2: d2?.range, r3: d3?.range, toc: d1?.part?.toc?.length })
    ok(`${tag}: no page errors`, !A.problems.length, A.problems.slice(0, 3))
    await A.ctx.close()
  }
  return results
}

const server = await start(Number(process.env.PORT || 4791))
const origin = `http://127.0.0.1:${server.address().port}`
const browser = await chromium.launch({ executablePath: EXEC, args: ['--mute-audio'] })
let failed = false
/* ---------- Layouts (the Aa panel, 15 Oct): Margin view and Focus view ----------
   The Aa panel opens from the top bar inside the screen, Layout first. Focus view, chosen there: the
   page in the middle at Margin view's width, no column or marks, every card in a pop-up window inside
   the screen and clear of its passage (or of the top bar, when it must cover the page); an Explain from
   the bar answers in that window; a long answer scrolls inside it; the whole-PDF chat opens in it. The
   reading place stays across both switches; the cards come back in Margin view; the choice is kept on
   this device (prefs) and holds after a reload. Each state passes the layout check. */
// Focus view's measures, in the page: the page's sheet in view, the pop-up window, the column.
function focusState() {
  const hdr = document.getElementById('hdr').getBoundingClientRect().bottom
  const sheet = [...document.querySelectorAll('.pdf-sheet')].map(s => s.getBoundingClientRect()).find(r => r.bottom > hdr + 40) || null
  const pop = document.querySelector('.mr-card.is-popup.is-open, .mr-primer.is-popup')
  const pr = pop?.getBoundingClientRect()
  const colShown = !!document.querySelector('.mr-col:not([hidden])') && getComputedStyle(document.querySelector('.mr-col')).display !== 'none'
  const marks = document.querySelectorAll('.mr-mark:not([data-primer])').length
  let prefs = null; try { prefs = JSON.parse(localStorage.getItem('tinct-addbook:prefs')) } catch {}
  const card = pop && pop.dataset.id && cardById(pop.dataset.id)
  const passage = card ? anchorRects(TinctMargin.anchorOfCard(card)).filter(r => r.bottom > hdr && r.top < innerHeight) : []
  const covers = pr ? passage.some(r => Math.min(r.right, pr.right) - Math.max(r.left, pr.left) > 1 && Math.min(r.bottom, pr.bottom) - Math.max(r.top, pr.top) > 1) : false
  return {
    mode: col.mode, layout: root.dataset.readerLayout, stored: prefs?.layout ?? null, colShown, marks,
    gaps: sheet ? [Math.round(sheet.left), Math.round(innerWidth - sheet.right)] : null, width: sheet ? Math.round(sheet.width) : null,
    pop: pr ? { left: pr.left, top: pr.top, right: pr.right, bottom: pr.bottom, side: pop.dataset.side || '' } : null,
    inside: pr ? pr.left >= -0.5 && pr.right <= innerWidth + 0.5 && pr.top >= hdr - 0.5 && pr.bottom <= innerHeight + 0.5 : null,
    covers, side: pop?.dataset.side || '', place: currentPlace(), open: col.open,
  }
}
async function focusMatrix(browser, origin) {
  const rows = []
  for (const pdf of PDFS) {
    const hex = addBook(pdf), label = basename(pdf, '.pdf'), pi = PDFS.indexOf(pdf)
    const combos = SAMPLE ? COLUMN_VIEWPORTS.map(([w, h], i) => [w, h, rotate(LOOKS, i + pi)]) : COLUMN_VIEWPORTS.flatMap(([w, h]) => LOOKS.map(l => [w, h, l]))
    for (const [width, height, look] of combos) {
      const tag = `${label}-${width}x${height}-${look}`
      const found = [], shots = {}
      let opened
      try { opened = await readerPage(browser, origin, hex, { width, height, look, startPage: 2 }) }
      catch (e) { rows.push({ pdf: label, viewport: `${width}×${height}`, look, problems: 1, details: [{ kind: 'error', el: String(e.message || e).slice(0, 200) }] }); continue }
      const { ctx, page, problems } = opened
      const keep = (width === 1280 && height === 800 || width === 390 && height === 844) && (look === 'paper' || look === 'night')
      const snap = async name => { if (keep) { const path = join(OUT, `layout-${tag}-${name}.png`); await page.screenshot({ path }); shots[name] = path } }
      const check = async (name, cond) => {
        await settle(page)
        found.push(...(await checkMargin(page)).map(p => ({ state: name, ...p })))
        // `cond`: a function run in the page, or [function, its argument].
        const r = await page.evaluate(...[].concat(cond))
        if (!r || r.ok === false) found.push({ state: name, kind: 'condition', el: JSON.stringify(r).slice(0, 400) })
        await snap(name)
        return r
      }
      const near = (a, b) => a.page === b.page && Math.abs(a.frac - b.frac) <= 0.02
      // focusState runs in the page (each condition calls it): installed there, again after the reload.
      const install = () => page.evaluate(src => { window.focusState = (0, eval)('(' + src + ')') }, focusState.toString())
      try {
        await install()
        account.cards.delete(hex)
        await page.evaluate(seedCards, { lines: 3, pairs: false, open: 1 }); await settle(page)
        const margin0 = await page.evaluate(focusState)
        await snap('margin')
        // The Aa panel: inside the screen, Layout first with the two PDF layouts, Margin view chosen.
        await page.click('#aaBtn'); await page.waitForSelector('.byob-aa-panel [data-layout="focus"]', { timeout: 4000 })
        await check('panel', () => {
          const s = document.querySelector('.byob-aa-panel .lab-v2-sheet').getBoundingClientRect(), body = document.querySelector('.byob-aa-panel .lab-v2-sheet-body')
          const names = [...document.querySelectorAll('.byob-aa-panel [data-layout]')].map(b => b.querySelector('.lab-v2-edition-name').textContent)
          const first = body.firstElementChild.dataset.aa
          const on = document.querySelector('.byob-aa-panel [data-layout][aria-pressed="true"]')?.dataset.layout
          return { ok: s.left >= 0 && s.right <= innerWidth + 0.5 && s.top >= 0 && s.bottom <= innerHeight + 0.5 && first === 'layout' && names[0] === 'Margin view (default)' && names[1] === 'Focus view' && on === 'margin' && !!document.querySelector('.byob-aa-panel [data-testid="lab-v2-themes"]'), names, first, on }
        })
        const place0 = await page.evaluate(() => currentPlace())
        await page.click('.byob-aa-panel [data-layout="focus"]'); await page.waitForTimeout(250)
        await page.click('.byob-aa-panel .lab-v2-dismiss')
        // On the phone a tap outside the bottom card (here, in the panel) closes it, as it always has: the card opens again.
        await page.evaluate(() => { if (!col.open) openCard((store.get('cards:' + state.key) || [])[1]?.id) })
        // Focus view: centred, as wide as in Margin view, nothing beside it, the open card in the pop-up, the place kept.
        const phone = width < 700
        await check('focus', [s => {
          const f = focusState(), g = f.gaps
          // A phone's pages open zoomed to their text column (phone-ui): a page wider than the screen cannot be centred, so there
          // it fills the width with no gap either side (its pan stays inside the page); at fit, centred as before.
          const zoomedPhone = innerWidth < 700 && state.zoom > 1
          const centred = !!g && (zoomedPhone ? g[0] <= 0.5 && g[1] <= 0.5 : Math.abs(g[0] - g[1]) <= (innerWidth < 700 ? 2 : 42))
          return { ok: f.mode === 'focus' && f.layout === 'focus' && f.stored === 'focus' && !f.colShown && f.marks === 0 && centred && (!s.wide || Math.abs(f.width - s.width) <= 2) && !!f.pop && f.inside && (!f.covers || f.side === 'over'), ...f, before: s.width }
        }, { width: margin0.width, wide: !phone }])
        const placeF = await page.evaluate(() => currentPlace())
        if (!near(place0, placeF)) found.push({ state: 'focus', kind: 'place moved', el: JSON.stringify([place0, placeF]) })
        // Explain from the bar: the answer (mocked) arrives in the pop-up window.
        await page.evaluate(() => { openCard(null); getSelection().removeAllRanges() }); await settle(page)
        if (await selectText(page, { near: 'top' })) {
          await page.waitForSelector('.mr-float [data-m="explain"]', { timeout: 4000 })
          await page.click('.mr-float [data-m="explain"]')
          await page.waitForFunction(() => /MOCK ANSWER/.test(document.querySelector('.mr-card.is-popup.is-open')?.innerText || ''), null, { timeout: 8000 }).catch(() => {})
          await check('explain', () => { const f = focusState(), pop = document.querySelector('.mr-card.is-popup.is-open'); return { ok: !!pop && /MOCK ANSWER/.test(pop.innerText) && !document.querySelector('.mr-col .mr-card:not([hidden])') && f.inside && (!f.covers || f.side === 'over'), ...f } })
        } else found.push({ state: 'explain', kind: 'error', el: 'no text to select' })
        // A 600-word answer scrolls inside the window; its label and follow-up line stay in view.
        await page.evaluate(seedCards, { lines: 1, pairs: false, open: 0, kinds: ['explain'], answer: LONG })
        await check('long', () => {
          const el = document.querySelector('.mr-card.is-popup.is-open'); if (!el) return { ok: false, why: 'no pop-up' }
          const b = el.querySelector('.mr-card__body'), lab = el.querySelector('.mr-card__label').getBoundingClientRect(), fu = el.querySelector('.mr-follow').getBoundingClientRect(), f = focusState()
          return { ok: b.scrollHeight > b.clientHeight + 20 && lab.top >= f.pop.top - 0.5 && fu.bottom <= f.pop.bottom + 0.5 && f.inside, body: [b.scrollHeight, b.clientHeight] }
        })
        // The whole-PDF chat opens in the window too.
        await page.evaluate(() => { col.live.clear(); chat.turns = [{ role: 'user', content: 'What is this PDF about?', page: 2, at: Date.now() }, { role: 'assistant', content: 'MOCK. The bottom line about the whole PDF {p. 1}.\n\nMore.', at: Date.now() }]; openWhole({ quiet: true }) })
        await check('whole', () => { const f = focusState(), pop = document.querySelector('.mr-card.is-popup.is-open.is-whole'); return { ok: !!pop && f.inside, ...f } })
        await page.evaluate(() => { chat.turns = []; closeChat(); openCard(null) }); await settle(page)
        // Kept on this device: a reload opens in Focus view, at the same place.
        const placeR = await page.evaluate(() => { savePlaceNow(); return currentPlace() })
        await page.reload(); await page.waitForFunction(() => document.querySelectorAll('.pdf-sheet .text-layer span').length > 20, null, { timeout: 30000 }); await page.waitForTimeout(600); await install()
        await check('reload', () => { const f = focusState(); return { ok: f.mode === 'focus' && f.stored === 'focus' && !f.colShown, ...f } })
        const placeR2 = await page.evaluate(() => currentPlace())
        if (!near(placeR, placeR2)) found.push({ state: 'reload', kind: 'place moved', el: JSON.stringify([placeR, placeR2]) })
        // Back to Margin view: the place stays, the cards are there again, the default is stored as no choice.
        const place1 = await page.evaluate(() => currentPlace())
        await page.click('#aaBtn'); await page.waitForSelector('.byob-aa-panel [data-layout="margin"]', { timeout: 4000 })
        await page.click('.byob-aa-panel [data-layout="margin"]'); await page.waitForTimeout(250)
        await page.click('.byob-aa-panel .lab-v2-dismiss')
        await check('margin-again', () => { const f = focusState(), cards = (store.get('cards:' + state.key) || []).length; return { ok: f.mode !== 'focus' && f.layout === 'margin' && f.stored === null && cards > 0 && (f.mode !== 'column' || (f.colShown && visibleCards().length > 0)), cards, ...f } })
        const place2 = await page.evaluate(() => currentPlace())
        if (!near(place1, place2)) found.push({ state: 'margin-again', kind: 'place moved', el: JSON.stringify([place1, place2]) })
      } catch (e) { found.push({ state: 'run', kind: 'error', el: String(e.message || e).replace(/\u001b\[\d+m/g, '').slice(-700) }) }
      const n = found.length + problems.length
      rows.push({ pdf: label, viewport: `${width}×${height}`, look, problems: n, details: [...found, ...problems], screenshots: shots })
      console.log(`layout ${tag}: ${n} problem(s)`, n ? JSON.stringify([...found, ...problems]).slice(0, 900) : '')
      await ctx.close()
    }
  }
  return rows
}

// The PM's full battery on release train 3 (15 Oct 2026, gloss-test/full-battery.html, "Phones"): a PDF on a
// phone opens with its text column filling the width (one column of the two-column paper), panned to it and
// never off the page, the place and the reader's own pinch kept; the phone's header gives the title its room
// and never shows an empty pill; the desktop is unchanged; the t menu's whole-document chat is "Chat"; Escape
// closes the Aa panel with focus back on Aa; a link with &pages stays in the pages after a first open's scan;
// two devices writing at once (409) merge silently and lose nothing.
function columnState(gutter) {
  const s = document.getElementById('scroll'), sr = s.getBoundingClientRect()
  const sheet = state.pages[currentPlace().page - 1].sheet, r = sheet.getBoundingClientRect()
  // Running lines of the page in view: where their left edges sit on the screen.
  const spans = [...sheet.querySelectorAll('.text-layer span')].filter(e => (e.textContent || '').trim().split(/\s+/).length >= 4).map(e => e.getBoundingClientRect()).filter(b => b.top > sr.top && b.bottom < innerHeight && b.width > 0)
  const lefts = spans.map(b => b.left).sort((a, b) => a - b), onScreen = spans.filter(b => b.left >= -1 && b.right <= innerWidth + 1).length
  return {
    zoom: state.zoom, fit: !!state.fit?.column, cls: document.querySelector('.lab').classList.contains('is-page-zoomed'),
    columns: state.fit?.column?.columns || 0, left: lefts.length ? Math.round(lefts[Math.floor(lefts.length * 0.1)]) : null,
    shown: spans.length ? onScreen / spans.length : 0, sheetLeft: Math.round(r.left - sr.left), sheetRight: Math.round(r.right - sr.left), room: s.clientWidth,
    maxPan: s.scrollWidth - s.clientWidth, sheetW: Math.round(r.width), gutter,
  }
}
function headerState() {
  const box = id => { const r = document.getElementById(id).getBoundingClientRect(); return { left: r.left, right: r.right, w: r.width } }
  const t = document.getElementById('bookTitle'), label = document.getElementById('pageLabel'), btn = document.getElementById('pageBtn')
  const chevron = btn.querySelector('.lab-header-chevron')
  return {
    title: box('bookTitle'), titleWhole: t.scrollWidth <= t.clientWidth + 1, pill: box('pageBtn'), label: label.textContent.trim(), labelWhole: label.scrollWidth <= label.clientWidth + 1,
    chevron: !!chevron && getComputedStyle(chevron).display !== 'none', aa: box('aaBtn'), pillShown: getComputedStyle(btn).display !== 'none' && btn.getBoundingClientRect().width > 0,
  }
}
async function phoneUi(browser, origin) {
  const results = []
  const ok = (name, pass, detail) => { results.push({ name, pass: !!pass, ...(pass ? {} : { detail }) }); console.log(`${pass ? 'ok  ' : 'FAIL'} ${name}${pass ? '' : ' ' + String(JSON.stringify(detail)).slice(0, 600)}`) }
  const books = PDFS.map(f => [basename(f, '.pdf'), addBook(f)])
  const views = SAMPLE ? [[390, 844, 'paper'], [360, 740, rotate(LOOKS, 1)]] : VIEWPORTS.filter(([w]) => w < 700).flatMap(([w, h]) => LOOKS.map(l => [w, h, l]))
  const TITLE = 'Attention Is All You Need'
  for (const [label, hex] of books) for (const [width, height, look] of views) {
    const tag = `phone-ui-${label}-${width}x${height}-${look}`
    const A = await readerPage(browser, origin, hex, { width, height, look })
    const a = A.page
    // 2. The column fit: the zoom fills the width with the column, the lines start 10px in, the pan stays on the page.
    await a.evaluate(() => goTo({ page: 2, frac: 0.05 })); await a.evaluate(() => panToColumn()); await a.waitForTimeout(900)
    let c = await a.evaluate(columnState, 10)
    const two = label.includes('two_column')
    ok(`${tag}: opens zoomed to its text column (${two ? 'one column of two' : 'one column'}), ${c.zoom}×`, c.fit && c.cls && c.zoom >= (two ? 2.3 : 1.3) && c.zoom <= 3 && c.columns === (two ? 2 : 1), c)
    ok(`${tag}: the column's lines start about 10px from the screen's edge and are on the screen`, c.left !== null && Math.abs(c.left - 10) <= 8 && c.shown >= (two ? 0.4 : 0.9), c)
    await a.evaluate(() => { document.getElementById('scroll').scrollLeft = 0 }); await a.waitForTimeout(100)
    const atLeft = await a.evaluate(columnState, 10)
    await a.evaluate(() => { document.getElementById('scroll').scrollLeft = 1e6 }); await a.waitForTimeout(100)
    const atRight = await a.evaluate(columnState, 10)
    ok(`${tag}: the pan stays inside the page (its left edge at the screen's left, its right edge at the screen's right)`, Math.abs(atLeft.sheetLeft) <= 1 && Math.abs(atRight.sheetRight - atRight.room) <= 1, { atLeft, atRight })
    await a.evaluate(() => panToColumn())
    // The layout check with the pages zoomed, then with the bar up.
    const problems = [...(await checkMargin(a)).map(p => ({ state: 'zoomed', ...p }))]
    const sel = await selectText(a)
    if (sel) { await a.waitForSelector('.mr-pbar', { timeout: 5000 }).catch(() => {}); await a.waitForTimeout(250); problems.push(...(await checkMargin(a)).map(p => ({ state: 'bar', ...p }))) }
    ok(`${tag}: a selection works on the zoomed page (the phone bar)`, !!sel && !!await a.$('.mr-pbar'), { sel })
    await a.keyboard.press('Escape'); await a.evaluate(() => getSelection().removeAllRanges())
    // The place survives a reload, and the column fit is worked out again (nothing stored for it).
    const before = await a.evaluate(() => { savePlaceNow(); return { place: currentPlace(), stored: JSON.parse(localStorage.getItem('tinct-addbook:pos:' + state.key)) } })
    await a.reload(); await a.waitForFunction(() => document.querySelectorAll('.pdf-sheet .text-layer span').length > 20); await a.waitForTimeout(900)
    const after = await a.evaluate(() => ({ place: currentPlace(), zoom: state.zoom, fit: !!state.fit }))
    ok(`${tag}: a reload opens at the same place and the same column fit, with no zoom stored for it`, after.place.page === before.place.page && Math.abs(after.place.frac - before.place.frac) < 0.05 && after.fit && after.zoom === c.zoom && before.stored.phoneZoom === undefined, { before, after })
    // A pinch is the reader's own zoom: kept for this phone, the place kept.
    const pinched = await a.evaluate(() => { const at = currentPlace(); state.fit = null; setZoom(1.25); return new Promise(r => setTimeout(() => { savePlaceNow(); r({ at, now: currentPlace(), zoom: state.zoom, stored: JSON.parse(localStorage.getItem('tinct-addbook:pos:' + state.key)) }) }, 400)) })
    ok(`${tag}: a pinch keeps the place and is kept as this phone's zoom`, pinched.now.page === pinched.at.page && Math.abs(pinched.now.frac - pinched.at.frac) < 0.03 && pinched.stored.phoneZoom === 1.25 && pinched.stored.zoom === undefined, pinched)
    await a.reload(); await a.waitForFunction(() => document.querySelectorAll('.pdf-sheet .text-layer span').length > 20); await a.waitForTimeout(700)
    ok(`${tag}: reopened at the reader's own zoom, not the fit`, await a.evaluate(() => state.zoom === 1.25 && !state.fit))
    // 3. The header: a long title gets the room, the pill shortens and is never empty.
    await a.evaluate(t => { setBookTitle(t, ''); onScroll() }, TITLE); await a.waitForTimeout(300)
    const h = await a.evaluate(headerState)
    const overlap = h.title.right > h.pill.left + 0.5 || h.pill.right > h.aa.left + 0.5
    ok(`${tag}: the header gives the title its room (${Math.round(h.title.w)}px), the pill shows "${h.label}", never empty, nothing overlapping`, h.pillShown && h.label.length > 0 && h.labelWhole && /^p\. \S+$/.test(h.label) && h.title.w >= (width >= 390 ? 125 : 95) && !overlap, h)
    await a.evaluate(() => { setBookTitle('Short', ''); onScroll() }); await a.waitForTimeout(300)
    const hs = await a.evaluate(headerState)
    ok(`${tag}: with a short title, title and pill are both whole and the pill keeps its chevron ("${hs.label}")`, hs.titleWhole && hs.labelWhole && hs.chevron && hs.label.length > 0, hs)
    problems.push(...(await checkMargin(a)).map(p => ({ state: 'header', ...p })))
    if (!process.env.NO_SHOTS && look === views[0][2]) await a.screenshot({ path: join(OUT, `${tag}.png`) })
    ok(`${tag}: layout check (zoomed pages, the bar, the header)`, !problems.length, problems)
    ok(`${tag}: no page errors`, !A.problems.length, A.problems)
    await A.ctx.close()
  }
  // The desktop is unchanged: fit-to-width, the chapter in the pill with page and percent.
  {
    const [label, hex] = books[1]
    const D = await readerPage(browser, origin, hex, { width: 1440, height: 900, look: 'paper' })
    const d = await D.page.evaluate(() => ({ zoom: state.zoom, fit: state.fit, cls: document.querySelector('.lab').classList.contains('is-page-zoomed'), progress: getComputedStyle(document.getElementById('progress')).display, chevron: document.getElementById('pageBtn').dataset.chevron }))
    ok(`phone-ui-${label}-1440x900: the desktop opens at fit as before (no column fit, the pill as before)`, d.zoom === 1 && !d.fit && !d.cls && d.progress !== 'none' && d.chevron === undefined, d)
    // 1. The t menu's whole-document chat is Chat, and it opens the chat.
    await D.page.click('#superBtn'); await D.page.waitForSelector('.lab-super-panel')
    const rows = await D.page.evaluate(() => [...document.querySelectorAll('.lab-super-row')].map(r => r.dataset.row + ':' + r.textContent.trim()))
    ok('the t menu names the whole-document chat "Chat" (no Librarian)', rows[0] === 'chat:Chat' && !rows.some(r => /librarian/i.test(r)), rows)
    await D.page.click('.lab-super-row[data-row="chat"]'); await D.page.waitForTimeout(500)
    ok('the t menu\'s Chat opens the whole-document chat (the margin\'s Whole PDF card)', await D.page.evaluate(() => !!document.querySelector('.mr-col .mr-card.is-whole.is-open')))
    // 4. Escape closes the Aa panel, from its close button and from the size slider; focus returns to Aa.
    // (A PDF's size control on the desktop is Zoom's − and + since 19 Oct 2026, evening; the phone keeps the slider.)
    for (const from of ['.byob-aa-panel .lab-v2-dismiss', '.byob-aa-panel [data-z="-"]']) {
      await D.page.keyboard.press('Escape'); await D.page.click('#aaBtn'); await D.page.waitForSelector('.byob-aa-panel')
      await D.page.focus(from); await D.page.keyboard.press('Escape'); await D.page.waitForTimeout(200)
      const esc = await D.page.evaluate(() => ({ open: !!document.querySelector('.byob-aa-panel'), focus: document.activeElement?.id, expanded: document.getElementById('aaBtn').getAttribute('aria-expanded') }))
      ok(`Escape closes the Aa panel (focus in ${from.includes('data-z') ? 'Zoom' : 'the panel'}) and focus returns to Aa`, !esc.open && esc.focus === 'aaBtn' && esc.expanded === 'false', esc)
    }
    ok('desktop: no page errors', !D.problems.length, D.problems)
    await D.ctx.close()
  }
  // The night checklist (15 Oct): on a phone at a chapter's start, a card closed with × stays closed (the
  // "Before you start" bottom card used to take its place at once, so × seemed to do nothing).
  {
    const hex = addBook(BIG_BOOK)
    const P = await readerPage(browser, origin, hex, { width: 390, height: 844, look: 'paper', at: BOOK.meta.chapters[0].from })
    await P.page.waitForFunction(() => primer.units?.length > 1, null, { timeout: 60000 }).catch(() => {})
    // A chapter's start, where the bottom card offers Before you start.
    const start = await P.page.evaluate(async () => { for (const u of primer.units.filter(u => u.key !== 'all' && u.from > 1).slice(0, 8)) { goTo({ page: u.start || u.from, frac: 0 }); onScroll(); marginLayout(); await new Promise(r => setTimeout(r, 400)); if (col.sheet?.dataset.id === 'trigger') return currentPlace().page } return null })
    const trig = await P.page.evaluate(() => col.sheet?.dataset.id || null)
    const id = await P.page.evaluate(n => { const c = TinctMargin.newCard({ kind: 'explain', page: n, anchor: [{ n, x: 0.15, y: 0.3, w: 0.5, h: 0.012 }], text: 'A passage at the chapter start', turns: [{ role: 'assistant', content: 'An answer.', at: Date.now() }] }); saveCard(c); openCard(c.id); return c.id }, start || BOOK.meta.chapters[0].from)
    await P.page.waitForTimeout(900)
    const open = await P.page.evaluate(() => col.sheet?.dataset.id || null)
    // The phone's card has no minimise (20 Oct 2026): it closes with a tap outside it (or a drag down).
    const minimise = await P.page.evaluate(() => col.sheet?.querySelectorAll('.mr-card__close').length ?? -1)
    await P.page.mouse.click(200, 120); await P.page.waitForTimeout(800)
    const after = await P.page.evaluate(m => ({ sheet: col.sheet?.dataset.id || null, open: col.open, minimise: m }), minimise)
    ok('phone, a chapter\'s start: a card closed with a tap outside stays closed (the Before you start card does not take its place); no minimise', trig === 'trigger' && open === id && !after.sheet && !after.open && after.minimise === 0, { trig, open, id, after })
    await P.ctx.close()
  }
  // A PDF that fails to open once (pdf.js's first try rejects) opens on the second try, from this device's copy.
  {
    const [, hex] = books[0]
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } })
    await ctx.addInitScript(([session, hex]) => {
      try { localStorage.setItem('sb-local-auth-token', JSON.stringify(session)); localStorage.setItem('tinct-addbook:edition:' + hex, JSON.stringify('pages')) } catch {}
      let failed = false
      // pdf.js's namespace cannot be patched: the page gets a stand-in whose first getDocument rejects.
      let lib = null
      Object.defineProperty(window, 'pdfjsLib', { configurable: true, get: () => lib, set: real => {
        lib = new Proxy(real, { get: (t, k) => k !== 'getDocument' ? t[k] : o => { if (!failed && o?.data) { failed = true; window.__failedOnce = true; return { promise: Promise.reject(Object.assign(new Error('Invalid PDF structure.'), { name: 'InvalidPDFException' })) } } return t.getDocument(o) } })
      } })
    }, [SESSION, hex])
    const page = await ctx.newPage()
    const errors = []; page.on('pageerror', e => errors.push(e.message))
    await page.goto(`${origin}/lab/addbook/?userBook=${hex}`)
    const opened = await page.waitForFunction(() => document.querySelectorAll('.pdf-sheet .text-layer span').length > 20, null, { timeout: 30000 }).then(() => true, () => false)
    const seen = await page.evaluate(() => ({ failedOnce: !!window.__failedOnce, alert: document.querySelector('.pdf-status[role="alert"]')?.textContent || null }))
    ok('a PDF whose first open fails opens on a second try (no "could not be opened")', opened && seen.failedOnce && !seen.alert && !errors.length, { opened, ...seen, errors })
    await ctx.close()
  }
  // 5. &pages: a fresh profile (no edition chosen, no scan kept) on a book that reads as Tinct text by default:
  // a phone's (a narrative; since 19 Oct 2026 the desktop opens every PDF in its pages, so this ran at 1280×800 before).
  {
    const [, hex] = books[0]
    const open = async query => {
      const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true })
      await ctx.addInitScript(session => { try { localStorage.setItem('sb-local-auth-token', JSON.stringify(session)) } catch {} }, SESSION)
      const page = await ctx.newPage()
      await page.goto(`${origin}/lab/addbook/?userBook=${hex}${query}`)
      // The first open's scan finishes after the book's own address is pushed.
      await page.waitForFunction(() => location.pathname !== '/lab/addbook/' || (state.scan && toc.ready), null, { timeout: 30000 }).catch(() => {})
      await page.waitForTimeout(1500)
      const where = await page.evaluate(() => location.pathname + location.search)
      await ctx.close()
      return where
    }
    const plain = await open('')
    ok('control: without &pages this book goes on to the Tinct reader once its first scan is done', plain.startsWith('/reader?userBook=' + hex), plain)
    const kept = await open('&pages')
    ok('a first open with &pages stays in the PDF reader after the scan (the &pages race), and keeps &pages in its address', kept === `/lab/addbook/?userBook=${hex}&pages`, kept)
  }
  // 6. A phone and a desktop writing cards and highlights at the same moment: 409s merged, nothing lost, nothing said.
  {
    const [, hex] = books[1]
    account.cards.delete(hex); account.marks.delete(hex)
    const P = await readerPage(browser, origin, hex, { width: 390, height: 844, look: 'paper' })
    const D = await readerPage(browser, origin, hex, { width: 1440, height: 900, look: 'paper' })
    await P.page.waitForTimeout(800)
    const add = (page, who) => page.evaluate(who => {
      for (let i = 0; i < 2; i++) saveCard(TinctMargin.newCard({ kind: 'explain', page: 2, anchor: [], text: `${who} passage ${i}`, turns: [{ role: 'assistant', content: `${who} answer ${i}`, at: Date.now() }] }))
      putHighlights([...highlights(), { id: who + '-hl', page: 2, rects: [[0.1, 0.2, 0.3, 0.02]], text: who + ' words', color: 'gold', at: Date.now() }])
    }, who)
    await Promise.all([add(P.page, 'phone'), add(D.page, 'desktop')])
    // Sent at once from both.
    await Promise.all([P.page.evaluate(() => Promise.all([cardsSync.push(), marksSync.push()])), D.page.evaluate(() => Promise.all([cardsSync.push(), marksSync.push()]))])
    await P.page.waitForTimeout(2500)
    const said = page => page.evaluate(() => [...document.querySelectorAll('.byob-toast, [role="status"], .toast')].map(t => t.textContent).join(' '))
    const stored = { cards: (account.cards.get(hex)?.cards || []).filter(c => !c.gone).map(c => c.text).sort(), marks: (account.marks.get(hex)?.marks || []).filter(m => !m.gone).map(m => m.id).sort() }
    ok('two devices at once: the account has every card and highlight from both', stored.cards.length === 4 && stored.marks.includes('phone-hl') && stored.marks.includes('desktop-hl'), stored)
    const toasts = [await said(P.page), await said(D.page)]
    ok('two devices at once: no error is shown on either', !toasts.some(t => /could not be saved|conflict|error/i.test(t)), toasts)
    for (const X of [P, D]) { await X.page.reload(); await X.page.waitForFunction(() => document.querySelectorAll('.pdf-sheet .text-layer span').length > 20); await X.page.waitForTimeout(1500) }
    const has = page => page.evaluate(() => ({ cards: keptCards().filter(c => !c.gone && /^(phone|desktop) passage/.test(c.text)).length, marks: highlights().map(h => h.id).filter(id => /-hl$/.test(id)).sort() }))
    const both = [await has(P.page), await has(D.page)]
    ok('two devices at once: each has all four cards and both highlights after its next open', both.every(b => b.cards === 4 && b.marks.join() === 'desktop-hl,phone-hl'), both)
    ok('two devices at once: no page errors', !P.problems.length && !D.problems.length, [...P.problems, ...D.problems])
    await P.ctx.close(); await D.ctx.close()
  }
  return results
}

/* ---------- Option C (Anders, 16 Oct 2026): on a phone a PDF opens by its kind ---------- */
async function phoneKindCheck(browser, origin) {
  const results = []
  const ok = (name, pass, detail) => { results.push({ name, pass: !!pass, ...(pass ? {} : { detail }) }); console.log(`${pass ? 'ok  ' : 'FAIL'} ${name}${pass ? '' : ' ' + String(JSON.stringify(detail)).slice(0, 600)}`) }
  const PROSE = join(REPO, 'addbooks/web/test/pdf-fixtures/prose_book.pdf'), PAPER = join(REPO, 'addbooks/web/test/pdf-fixtures/two_column_paper.pdf')
  const prose = addBook(PROSE), paper = addBook(PAPER)
  // A fresh profile (or one with `seed` in this device's storage), signed in: where the book ends up.
  const open = async (hex, { width, height, seed = {}, look = 'paper', keep = false } = {}) => {
    const phone = width < 700
    const ctx = await browser.newContext({ viewport: { width, height }, hasTouch: phone, isMobile: false })
    await ctx.addInitScript(([session, seed, look]) => {
      try {
        if (sessionStorage.getItem('seeded')) return
        sessionStorage.setItem('seeded', '1')
        localStorage.setItem('sb-local-auth-token', JSON.stringify(session))
        localStorage.setItem('tinct-lab-prefs', JSON.stringify({ theme: { paper: 'light', book: 'book', night: 'dark', eink: 'light' }[look] }))
        for (const [k, v] of Object.entries(seed)) localStorage.setItem('tinct-addbook:' + k, JSON.stringify(v))
      } catch {}
    }, [SESSION, seed, look])
    const page = await ctx.newPage(), errors = []
    page.on('pageerror', e => errors.push(e.message))
    await page.goto(`${origin}/lab/addbook/?userBook=${hex}`)
    await page.waitForFunction(() => location.pathname !== '/lab/addbook/' || (typeof state !== 'undefined' && ((state.scan && toc.ready && document.querySelectorAll('.pdf-sheet .text-layer span').length > 20) || (state.pdfText && document.querySelector('.pt-chapter')))), null, { timeout: 30000 }).catch(() => {})
    await page.waitForTimeout(1200)
    const where = await page.evaluate(() => location.pathname + location.search)
    const textView = where.startsWith('/lab/addbook/') && await page.evaluate(() => typeof isPdfText === 'function' && isPdfText() && !!document.querySelector('.pt-chapter'))
    const kept = await page.evaluate(hex => { const g = k => { try { return JSON.parse(localStorage.getItem('tinct-addbook:' + k)) } catch { return null } }; return { edition: g('edition:' + hex), auto: g('phone-edition:' + hex), desk: g('desk-edition:' + hex), rule: g('open-rule:' + hex), pos: g('pos:pdf:' + hex) } }, hex)
    if (!keep) await ctx.close()
    return { where, kept, errors, ctx, page, textView }
  }
  const views = SAMPLE ? [[390, 844, 'paper'], [360, 740, rotate(LOOKS, 2)]] : VIEWPORTS.filter(([w]) => w < 700).flatMap(([w, h]) => LOOKS.map(l => [w, h, l]))
  for (const [width, height, look] of views) {
    const tag = `phone-kind-${width}x${height}-${look}`
    // A narrative: on to the Tinct reader once its first scan is done; the phone's default kept, marked as the phone's.
    const a = await open(prose, { width, height, look })
    ok(`${tag}: a narrative (prose_book) opens as its Tinct text (on to the Tinct reader) on a first open`, a.where.startsWith('/reader?userBook=' + prose) && a.kept.edition === 'text' && a.kept.auto?.edition === 'text' && a.kept.auto?.kind === 'narrative' && !a.errors.length, a)
    // A paper: its pages at the column fit, the layout check clean; reopened, the same.
    const b = await open(paper, { width, height, look, keep: true })
    const c = b.where.startsWith('/lab/addbook/') ? await b.page.evaluate(columnState, 10) : null
    ok(`${tag}: a paper (two_column_paper) opens in its pages at the column fit (${c?.zoom}×)`, b.where.startsWith('/lab/addbook/?userBook=' + paper) && c?.fit && c.zoom > 2 && b.kept.edition === 'pages' && b.kept.auto?.kind === 'paper', { where: b.where, c, kept: b.kept })
    if (c) {
      const problems = await checkMargin(b.page)
      ok(`${tag}: layout check in the column fit`, !problems.length, problems)
      if (!process.env.NO_SHOTS) await b.page.screenshot({ path: join(OUT, `${tag}-paper.png`) })
      await b.page.reload(); await b.page.waitForFunction(() => document.querySelectorAll('.pdf-sheet .text-layer span').length > 20, null, { timeout: 30000 }).catch(() => {}); await b.page.waitForTimeout(800)
      ok(`${tag}: reopened, the paper stays in its pages`, await b.page.evaluate(() => location.pathname === '/lab/addbook/' && !!state.fit?.column))
    }
    ok(`${tag}: no page errors`, !b.errors.length, b.errors)
    await b.ctx.close()
  }
  // The reader's own choice wins over the kind, either way.
  const own1 = await open(prose, { width: 390, height: 844, seed: { ['edition:' + prose]: 'pages' } })
  ok('phone-kind: the reader\'s choice of its pages keeps a narrative in its pages', own1.where.startsWith('/lab/addbook/') && own1.kept.edition === 'pages' && !own1.kept.auto, own1)
  const own2 = await open(paper, { width: 390, height: 844, seed: { ['edition:' + paper]: 'text' } })
  ok('phone-kind: the reader\'s choice of Tinct text opens a paper as its Tinct text', own2.where.startsWith('/reader?userBook=' + paper) && !own2.kept.auto, own2)
  // A place read in its pages (here or on another device) is no choice (Anders, 19 Oct 2026: the view is per device, only the place syncs).
  const own3 = await open(prose, { width: 390, height: 844, seed: { ['pos:pdf:' + prose]: { page: 2, frac: 0.1, edition: 'p', at: Date.now() } } })
  ok('phone-kind: a place read in its pages does not keep a narrative in its pages: the phone\'s rule opens its Tinct text at that page', own3.where === `/reader?userBook=${prose}&page=2` && own3.kept.auto?.edition === 'text', own3)
  // The desktop: the phone's default kept on this device is not a choice; the desktop's rule stands (its pages, 19 Oct 2026).
  const desk = await open(prose, { width: 1280, height: 800, seed: { ['edition:' + prose]: 'text', ['phone-edition:' + prose]: { edition: 'text', kind: 'narrative', by: 'text', v: 1 } } })
  ok('phone-kind: the desktop ignores the phone\'s default (Tinct text) and opens its own (prose_book: its pages)', desk.where.startsWith('/lab/addbook/?userBook=' + prose) && desk.kept.desk?.edition === 'pages', desk)
  const desk2 = await open(paper, { width: 1280, height: 800 })
  ok('phone-kind: the desktop opens a paper in its pages, as before, and keeps no phone default', desk2.where.startsWith('/lab/addbook/') && !desk2.kept.auto && desk2.kept.edition === 'pages' && desk2.kept.desk?.kind === 'paper', desk2)
  /* The desktop (Anders, 19 Oct 2026): every PDF as its pages, running prose too (16 Oct: except running prose). margin_paper is MacKay's
     page (mathematics, figures in a wide margin), which scored 2.5 and so opened as Tinct text, as Anders's
     60-page extract did. */
  const mackay = addBook(MARGIN_PAPER)
  for (const [width, height] of SAMPLE ? [[1440, 900]] : [[1440, 900], [1280, 800], [1024, 768]]) {
    const d = await open(mackay, { width, height, keep: true })
    const shown = d.where.startsWith('/lab/addbook/') ? await d.page.evaluate(() => ({ spans: document.querySelectorAll('.pdf-sheet .text-layer span').length, score: state.scan?.layout?.score, layout: state.scan?.layout?.default })) : null
    ok(`desk-pages-${width}x${height}: a page of mathematics with margin figures (scored ${shown?.score}, the scan's default '${shown?.layout}') opens as its pages, kept as the desktop's default`, d.where === `/lab/addbook/?userBook=${mackay}` && shown?.spans > 20 && d.kept.edition === 'pages' && d.kept.desk?.edition === 'pages' && d.kept.rule === 2, { where: d.where, kept: d.kept, shown })
    if (shown && width === 1440 && !process.env.NO_SHOTS) await d.page.screenshot({ path: join(OUT, `desk-pages-${width}x${height}.png`) })
    ok(`desk-pages-${width}x${height}: no page errors`, !d.errors.length, d.errors)
    await d.ctx.close()
  }
  // DESK_PDF=<file>: a PDF of your own on the desktop (Anders's MacKay extract): a first open, and one read as Tinct text under the old default.
  if (process.env.DESK_PDF) {
    const own = addBook(process.env.DESK_PDF), name = basename(process.env.DESK_PDF, '.pdf')
    for (const [label, seed] of [['first-open', {}], ['read-as-text-before', { ['pos:pdf:' + own]: { page: 3, frac: 0.2, at: Date.UTC(2026, 9, 16, 9), edition: 't' } }]]) {
      const d = await open(own, { width: 1440, height: 900, seed, keep: true })
      await d.page.waitForTimeout(1500)
      if (!process.env.NO_SHOTS) await d.page.screenshot({ path: join(OUT, `desk-pages-${name}-${label}-1440x900.png`) })
      ok(`desk-pages: ${name} (${label}) opens as its pages on the desktop`, d.where.startsWith('/lab/addbook/') && d.kept.edition === 'pages', { where: d.where, kept: d.kept })
      await d.ctx.close()
    }
  }
  // Running prose opens as its pages on the desktop too (19 Oct 2026; train 6 of 16 Oct opened it as Tinct text), its default kept as the desktop's.
  const deskProse = await open(prose, { width: 1440, height: 900 })
  ok('desk-pages: a narrative (prose_book) opens as its pages (Margin view) on the desktop', deskProse.where === `/lab/addbook/?userBook=${prose}` && deskProse.kept.desk?.edition === 'pages' && deskProse.kept.desk?.kind === 'narrative' && deskProse.kept.rule === 2, deskProse)
  // A desktop whose old default (16 Oct) kept running prose as Tinct text: a default, no choice; its pages now.
  const oldDefault = await open(prose, { width: 1440, height: 900, seed: { ['edition:' + prose]: 'text', ['desk-edition:' + prose]: { edition: 'text', kind: 'narrative', by: 'text', v: 1 }, ['open-rule:' + prose]: 2 } })
  ok('desk-pages: a desktop default kept as Tinct text under the rule of 16 Oct opens as its pages', oldDefault.where === `/lab/addbook/?userBook=${prose}` && oldDefault.kept.edition === 'pages' && oldDefault.kept.desk?.edition === 'pages', oldDefault)
  // Convert to Tinct book, the reader's choice on this desktop: its Tinct text here, in Margin view (item s, 20 Oct 2026), not the Tinct reader.
  const converted = await open(prose, { width: 1440, height: 900, seed: { ['edition:' + prose]: 'text' } })
  ok('desk-pages: the reader\'s choice of Tinct text on the desktop (Convert to Tinct book) opens its Tinct text in Margin view', converted.where === `/lab/addbook/?userBook=${prose}` && converted.textView && !converted.kept.desk, converted)
  // Read as Tinct text under the old default (a place in Tinct text from before the rule, nothing chosen): its pages now, at the same spot.
  const OLD = Date.UTC(2026, 9, 16, 9), NEW = Date.UTC(2026, 9, 17, 9)
  const legacy = await open(mackay, { width: 1440, height: 900, seed: { ['pos:pdf:' + mackay]: { page: 1, frac: 0.3, at: OLD, edition: 't', chapterNumber: 1, paragraphIndex: 2, wordIndex: 0 } } })
  ok('desk-pages: a place read in Tinct text under the old default (no choice) opens as its pages, the spot kept', legacy.where.startsWith('/lab/addbook/') && legacy.kept.edition === 'pages' && legacy.kept.pos?.page === 1 && legacy.kept.pos?.frac === 0.3 && legacy.kept.pos?.paragraphIndex === 2, legacy)
  // The reader's own choice of Tinct text stands; a place read in Tinct text since the rule began (here or on another device) is no choice (19 Oct).
  const chose = await open(mackay, { width: 1440, height: 900, seed: { ['edition:' + mackay]: 'text', ['pos:pdf:' + mackay]: { page: 1, frac: 0.3, at: OLD, edition: 't' } } })
  ok('desk-pages: the reader\'s choice of Tinct text opens it as Tinct text (in Margin view)', chose.where === `/lab/addbook/?userBook=${mackay}` && chose.textView && chose.kept.edition === 'text' && !chose.kept.desk, chose)
  const since = await open(mackay, { width: 1440, height: 900, seed: { ['pos:pdf:' + mackay]: { page: 1, frac: 0.3, at: NEW, edition: 't' } } })
  ok('desk-pages: a place read in Tinct text since the rule began (on a phone) opens as its pages on the desktop', since.where.startsWith('/lab/addbook/') && since.kept.desk?.edition === 'pages' && since.kept.pos?.page === 1, since)
  const inPages = await open(prose, { width: 1440, height: 900, seed: { ['pos:pdf:' + prose]: { page: 2, frac: 0.1, at: OLD, edition: 'p' } } })
  ok('desk-pages: a narrative read in its pages elsewhere opens as its pages on the desktop, at that page', inPages.where.startsWith('/lab/addbook/') && inPages.kept.desk?.edition === 'pages' && inPages.kept.pos?.page === 2, inPages)
  /* Per device (Anders, 19 Oct 2026): two browser contexts, a desktop and a phone, sharing one account place
     (copied between them as ownSync.ts adoptPage keeps it: the page, the spot, the edition it was read in). */
  {
    const D = await open(prose, { width: 1440, height: 900, seed: { ['edition:' + prose]: 'pages' }, keep: true })
    const deskOpen = D.where.startsWith('/lab/addbook/')
    // "Original pages" chosen on the desktop; read there to page 2, a third of the way down.
    const place = deskOpen ? await D.page.evaluate(() => { goTo({ page: 2, frac: 0.3 }); onScroll(); savePlaceNow(); return store.get('pos:' + state.key) }) : null
    await D.ctx.close()
    ok('per-device: the desktop reads in its pages (its own choice), its place read in pages', deskOpen && place?.page === 2 && place?.edition === 'p', { where: D.where, place })
    const P = await open(prose, { width: 390, height: 844, seed: { ['pos:pdf:' + prose]: place } })
    ok('per-device: the phone opens the same place as its Tinct text (its own rule), at the same page; the desktop\'s choice did not travel', P.where === `/reader?userBook=${prose}&page=2` && P.kept.auto?.edition === 'text' && P.kept.edition === 'text' && P.kept.pos?.edition === 'p' && P.kept.pos?.frac === place?.frac, P)
    // Back: read on in the Tinct text on the phone (the Tinct reader keeps the page and its edition 't'), then the desktop.
    const back = { ...place, page: 3, frac: 0.1, at: Date.now(), edition: 't', chapterNumber: undefined, paragraphIndex: undefined, wordIndex: undefined }
    const D2 = await open(prose, { width: 1440, height: 900, seed: { ['edition:' + prose]: 'pages', ['pos:pdf:' + prose]: back }, keep: true })
    const at = D2.where.startsWith('/lab/addbook/') ? await D2.page.evaluate(() => currentPlace()) : null
    await D2.ctx.close()
    ok('per-device: back on the desktop, its pages still, at the page the phone read to', D2.where.startsWith('/lab/addbook/') && at?.page === 3 && D2.kept.edition === 'pages' && !D2.errors.length, { where: D2.where, at, kept: D2.kept })
  }
  return results
}

/* ---------- Justified lines in pieces (Anders, 16 Oct 2026: a highlight that stopped mid-line) ----------
   pdf.js gives a justified line as several items (LaTeX's: "…names in physics and" | "other fie" | "lds. For
   instance,"). The text layer once took the end of the first for the body's right edge and moved the rest of
   every such line after the body, so a selection over three lines took only their first halves (its text
   "…in physic s and in thermodynamics…", its mark short of the line's end). Each row selects from the start
   of a paragraph's first line into its third and checks: the selection's text is the page's text from the
   first word to the last; the highlight's marks cover the selection's rects (within 2 px); and the marks on the
   first two lines reach the line's last glyph. */
async function justifiedCheck(browser, origin) {
  const results = []
  const ok = (name, pass, detail) => { results.push({ name, pass: !!pass, ...(pass ? {} : { detail }) }); console.log(`${pass ? 'ok  ' : 'FAIL'} ${name}${pass ? '' : ' ' + String(JSON.stringify(detail)).slice(0, 900)}`) }
  const docs = [{ name: 'justified_paper', file: JUSTIFIED_PAPER, page: 1, from: 'All the objects', to: 'which is either intuitively' }]
  if (process.env.JUSTIFIED_PDF) docs.push({ name: basename(process.env.JUSTIFIED_PDF, '.pdf'), file: process.env.JUSTIFIED_PDF, page: Number(process.env.PAGE || 1), from: process.env.FROM, to: process.env.TO })
  const views = (SAMPLE ? [[1440, 900, 'paper'], [390, 844, 'night']] : [[1440, 900], [390, 844]].flatMap(([w, h]) => LOOKS.map(l => [w, h, l])))
  for (const doc of docs) {
    const hex = addBook(doc.file)
    for (const [width, height, look] of views) {
      const tag = `justified-${doc.name}-${width}x${height}-${look}`
      const R = await readerPage(browser, origin, hex, { width, height, look, at: doc.page })
      const { page } = R
      await page.evaluate(n => goTo({ page: n, frac: 0 }), doc.page); await page.waitForTimeout(800)
      await page.waitForFunction(n => state.pages[n - 1]?.layer?.querySelectorAll('span').length > 10, doc.page, { timeout: 30000 })
      const got = await page.evaluate(async ({ n, from, to }) => {
        const p = state.pages[n - 1], norm = t => t.replace(/\s+/g, ' ').trim()
        // The range: from the first word of `from` to the last word of `to`, found in the layer's text as laid out.
        const nodes = [], walker = document.createTreeWalker(p.layer, NodeFilter.SHOW_TEXT)
        let all = '', node
        while ((node = walker.nextNode())) { nodes.push({ node, at: all.length }); all += node.nodeValue }
        const flat = all.replace(/\s/g, ' ')
        const find = (needle, after = 0) => { const words = needle.split(' '); const re = new RegExp(words.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('\\s*'), 'g'); re.lastIndex = after; const m = re.exec(flat); return m ? [m.index, m.index + m[0].length] : null }
        const a = find(from), b = a && find(to, a[1])
        if (!a || !b) return { error: 'words not found in the text layer', from, to, layer: norm(all).slice(0, 600) }
        const at = off => { const k = nodes.findLastIndex(x => x.at <= off); return [nodes[k].node, off - nodes[k].at] }
        const range = document.createRange(); range.setStart(...at(a[0])); range.setEnd(...at(b[1]))
        document.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerType: 'mouse' })); getSelection().removeAllRanges(); getSelection().addRange(range); document.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, pointerType: 'mouse' }))
        const selected = norm(getSelection().toString())
        // The page's text (what the companion reads), from the same first word to the same last.
        const text = norm((await pageText(n)).text), i = text.indexOf(from), j = text.indexOf(to, i)
        const expected = i >= 0 && j >= 0 ? text.slice(i, j + to.length) : null
        // The selection's words (19 Oct 2026: a highlight covers the words, never the spaces or line breaks after them).
        const sel = bodyOfRange(range).rects.map(r => ({ l: r.left, r: r.right, t: r.top, b: r.bottom }))
        const ids = addHighlight({ text: selected }, { range }) || []
        await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))
        const marks = ids.flatMap(id => [...document.querySelectorAll(`.hl-layer i[data-id="${id}"]`)]).map(el => { const r = el.getBoundingClientRect(); return { l: r.left, r: r.right, t: r.top, b: r.bottom } })
        // Each line of the selection (its rects by their middle) and the last glyph on that line in the text layer.
        const lines = []
        for (const r of sel) { const mid = (r.t + r.b) / 2; let L = lines.find(x => Math.abs(x.mid - mid) < (r.b - r.t) * 0.5); if (!L) { L = { mid, l: r.l, r: r.r, t: r.t, b: r.b }; lines.push(L) } L.l = Math.min(L.l, r.l); L.r = Math.max(L.r, r.r); L.t = Math.min(L.t, r.t); L.b = Math.max(L.b, r.b) }
        lines.sort((x, y) => x.mid - y.mid)
        const glyphEnd = mid => { let end = -Infinity; for (const sp of p.layer.querySelectorAll('span')) { const t = sp.firstChild; if (!t || !t.nodeValue.trim()) continue; const g = document.createRange(); g.setStart(t, 0); g.setEnd(t, t.nodeValue.replace(/\s+$/, '').length); const r = g.getBoundingClientRect(); if (r.width > 0 && Math.abs((r.top + r.bottom) / 2 - mid) < r.height * 0.5) end = Math.max(end, r.right) } return end }
        const covered = lines.map(L => { const on = marks.filter(m => Math.min(m.b, L.b) - Math.max(m.t, L.t) > (L.b - L.t) * 0.5); return { line: Math.round(L.mid), sel: [Math.round(L.l), Math.round(L.r)], mark: on.length ? [Math.round(Math.min(...on.map(m => m.l))), Math.round(Math.max(...on.map(m => m.r)))] : null, glyphEnd: Math.round(glyphEnd(L.mid)) } })
        getSelection().removeAllRanges()
        return { selected, expected, lines: covered, marks: marks.length }
      }, { n: doc.page, from: doc.from, to: doc.to })
      if (got.error) { ok(`${tag}: the passage is in the text layer`, false, got); await R.ctx.close(); continue }
      ok(`${tag}: the selection's text is the page's text (${got.selected.length} characters)`, !!got.expected && got.selected === got.expected, { selected: got.selected, expected: got.expected })
      ok(`${tag}: the selection runs over three lines or more`, got.lines.length >= 3, got.lines)
      ok(`${tag}: the highlight's marks cover the selection's rects on every line (within 2 px)`, got.lines.every(L => L.mark && L.mark[0] <= L.sel[0] + 2 && L.mark[1] >= L.sel[1] - 2), got.lines)
      ok(`${tag}: on the lines before the last, the mark reaches the line's last glyph (within 2 px)`, got.lines.slice(0, -1).every(L => L.mark && L.mark[1] >= L.glyphEnd - 2), got.lines)
      ok(`${tag}: no page errors`, !R.problems.length, R.problems)
      if (!process.env.NO_SHOTS && ((width === 1440 && look === 'night') || (width === 390 && look === 'night') || SAMPLE)) {
        const box = await page.evaluate(n => { const r = state.pages[n - 1].pg.getBoundingClientRect(); return { x: Math.max(0, r.left), y: Math.max(0, r.top), width: Math.min(innerWidth, r.right) - Math.max(0, r.left), height: Math.min(innerHeight, r.bottom) - Math.max(0, r.top) } }, doc.page)
        await page.screenshot({ path: join(OUT, `${tag}.png`), clip: box })
      }
      await R.ctx.close()
    }
  }
  return results
}

/* ---------- Ask latency (16 Oct): a margin request is sent at once, never after the scan ----------
   Anders's Ask on a fresh open of a 40-page paper waited over 30 s before anything was sent. On a first
   open (no stored scan: the scan, the whole-book read and the printed labels all still running) and on a
   second Ask in the same session, the request must leave the page within ASK_BOUND ms of Return. */
// Explain (a passage action) is sent within its 3 s wait for the document, plus the page's own steps.
const EXPLAIN_BOUND = Number(process.env.EXPLAIN_BOUND || 4500)
async function askLatency(browser, origin, files = null) {
  const results = []
  const ok = (name, pass, detail) => { results.push({ name, pass: !!pass, ...(detail ? { detail } : {}) }); console.log(`${pass ? 'ok  ' : 'FAIL'} ${name} ${String(JSON.stringify(detail || '')).slice(0, 400)}`) }
  const chats = from => account.requests.slice(from).filter(r => r.path === '/api/chat')
  for (const file of files || [LONG_BOOK, BIG_BOOK]) {
    for (const first of ['explain', 'ask']) {
      const hex = addBook(file)
      // The long book opens inside a chapter, as a reader returning to it (its first pages carry little text).
      const A = await readerPage(browser, origin, hex, { width: 1440, height: 900, look: 'paper', minSpans: 5, at: file === BIG_BOOK ? BOOK.meta.chapters[2].from + 1 : 0 })
      const a = A.page
      const run = async (kind, q = '') => {
        await a.keyboard.press('Escape'); await a.keyboard.press('Escape'); await a.evaluate(() => getSelection().removeAllRanges())
        await selectText(a); await a.waitForSelector('.mr-bar')
        const before = account.requests.length, scanning = await a.evaluate(() => !toc.ready)
        let t0
        if (kind === 'ask') { await a.keyboard.press(q[0]); await a.waitForSelector('.mr-bar.is-asking .mr-ask'); await a.keyboard.type(q.slice(1)); t0 = Date.now(); await a.keyboard.press('Enter') }
        else { t0 = Date.now(); await a.click('.mr-bar [data-m="explain"]') }
        let sent = null, said = false
        for (let i = 0; i < 2400 && !sent; i++) {
          sent = chats(before).find(r => kind === 'ask' ? JSON.stringify(r.body?.messages || '').includes(q) : r.body?.companion?.intent === 'explain')
          if (!sent) { said ||= await a.evaluate(() => [...document.querySelectorAll('.mr-col .mr-status')].some(e => e.textContent === 'Reading the document…')); await a.waitForTimeout(25) }
        }
        await a.waitForFunction(() => !col.ctl.size, null, { timeout: 15000 }).catch(() => {})
        const doc = JSON.stringify(sent?.body?.companion?.document || null)
        return { sentMs: sent ? sent.at - t0 : null, scanning, document: !!sent?.body?.companion?.document, said, doc, docChars: doc.length }
      }
      const tag = `${basename(file)}, first action ${first}`
      if (first === 'explain') {
        const r = await run('explain')
        ok(`${tag}: Explain on a first open is sent within ${EXPLAIN_BOUND} ms, the scan still running or not`, r.sentMs != null && r.sentMs < EXPLAIN_BOUND, { sentMs: r.sentMs, scanStillRunning: r.scanning, withDocument: r.document })
      } else {
        const r = await run('ask', 'What is meant here?')
        // A document-wide action waits for the document (never for the scan's labels); a noticeable wait says so.
        ok(`${tag}: Ask on a first open waits for the document and is sent with it; a wait over a second shows its status line`, r.sentMs != null && r.document && (r.sentMs < 2000 || r.said), { sentMs: r.sentMs, scanStillRunning: r.scanning, statusShown: r.said })
        const r2 = await run('ask', 'And why does it matter?')
        ok(`${tag}: a second Ask is sent at once with the document`, r2.sentMs != null && r2.sentMs < 1000 && r2.document, { sentMs: r2.sentMs })
        // Once the scan is done (labels, units), every request carries the same bytes: the cached prefix.
        await a.waitForFunction(() => toc.ready, null, { timeout: 60000 }).catch(() => {})
        await a.waitForTimeout(1500)
        const r3 = await run('ask', 'Once more, please?')
        ok(`${tag}: the document sent before the scan ended is byte for byte the one sent after it`, r3.document && r.doc === r3.doc && r2.doc === r3.doc, { chars: r3.docChars })
      }
      ok(`${tag}: no page errors`, !A.problems.length, A.problems.slice(0, 3))
      await A.ctx.close()
    }
  }
  return results
}

/* ---------- A card never waits for ever (16 Oct) ----------
   Anders's Explain and Ask cards kept the wait ring for minutes after the answer had been written.
   Each way a card's request can fail outside its own error handling ends in the answer or an error
   line, never the ring, and the failure is reported to the events intake (no passage, no answer). */
async function cardSafety(browser, origin) {
  const results = []
  const ok = (name, pass, detail) => { results.push({ name, pass: !!pass, ...(pass ? {} : { detail }) }); console.log(`${pass ? 'ok  ' : 'FAIL'} ${name}${pass ? '' : ' ' + String(JSON.stringify(detail)).slice(0, 400)}`) }
  const hex = addBook(PDFS[0])
  const A = await readerPage(browser, origin, hex, { width: 1440, height: 900, look: 'night' })
  const a = A.page
  const state = () => a.evaluate(() => { const id = col.open, el = id && document.querySelector(`.mr-col [data-id="${CSS.escape(id)}"], .mr-sheet[data-id="${CSS.escape(id)}"]`); return { id, rings: document.querySelectorAll('.mr-col .tinct-wait, .mr-sheet .tinct-wait, .mr-col .tc-wait, .mr-sheet .tc-wait').length, live: id ? col.live.get(id) || null : null, inFlight: id ? col.ctl.has(id) : false, status: el?.querySelector('.mr-status')?.textContent || '', answer: el?.querySelector('.mr-answer')?.textContent || '', turns: id ? (cardById(id)?.turns || []).length : 0 } })
  const reports = from => account.requests.slice(from).filter(r => r.path === '/api/events').flatMap(r => r.body.events || []).filter(e => e.name === 'margin_card_failed')
  const explain = async () => { await a.keyboard.press('Escape'); await a.keyboard.press('Escape'); await a.evaluate(() => getSelection().removeAllRanges()); await a.waitForTimeout(200); await selectText(a); await a.waitForSelector('.mr-bar [data-m="explain"]'); await a.click('.mr-bar [data-m="explain"]') }
  const settled = async (ms = 4000) => { const end = Date.now() + ms; let st; while (Date.now() < end) { st = await state(); if (!st.rings && !st.inFlight && (st.status || st.answer || !st.live)) return st; await a.waitForTimeout(150) } return st }

  // 1. The answer arrives but drawing it throws (an answer the parser cannot take): its words show plainly, and the error is reported.
  let from = account.requests.length
  await a.evaluate(() => { const real = TinctMargin.html.cardHtml; window.__realCardHtml = real; TinctMargin.html.cardHtml = (card, o) => { if ((o.live || (card.turns || []).some(t => t.role === 'assistant')) && card.kind === 'explain') throw new TypeError("Cannot read properties of undefined (reading 'n')"); return real(card, o) } })
  await explain()
  let st = await settled()
  ok('drawing the answer throws: the card shows the answer as plain paragraphs, no ring', !st.rings && /MOCK ANSWER/.test(st.answer) && st.turns === 1, st)
  let rep = reports(from)
  ok('…and the failure is reported to the events intake: kind, step, error type and code location, no answer text', rep.length >= 1 && rep[0].props.intent === 'explain' && rep[0].props.phase === 'render' && rep[0].props.error === 'TypeError' && /@/.test(rep[0].props.where || '') && !JSON.stringify(rep).includes('MOCK'), rep)
  await a.evaluate(() => { TinctMargin.html.cardHtml = window.__realCardHtml })

  // 2. The whole column cannot be drawn while the answer streams: the stream still ends, the answer is saved and the error line or answer replaces the ring.
  from = account.requests.length
  await explain(); await a.waitForTimeout(80)
  await a.evaluate(() => { window.__realLayout = marginLayout; window.marginLayout = () => { throw new RangeError('layout failed') } })
  await a.waitForTimeout(1500)
  const saved = await a.evaluate(() => (cardById(col.open)?.turns || []).length)
  await a.evaluate(() => { window.marginLayout = window.__realLayout; marginLayout({ fresh: true }) })
  st = await settled()
  ok('the column throws while the answer streams: the answer is still saved and shown, no ring', saved === 1 && !st.rings && /MOCK ANSWER/.test(st.answer), { saved, st })

  // 3. A step before the request throws (the pages around the passage): an error line, never the ring.
  from = account.requests.length
  await a.evaluate(() => { window.__realPages = pdfPages; window.pdfPages = async () => { throw new TypeError('pages failed') } })
  await explain()
  st = await settled()
  await a.evaluate(() => { window.pdfPages = window.__realPages })
  ok('a step before the request throws: the card shows its error line, no ring', !st.rings && !st.inFlight && /could not be loaded/.test(st.status), st)
  rep = reports(from)
  ok('…and it is reported as the prepare step', rep.some(e => e.props.phase === 'prepare' && e.props.error === 'TypeError'), rep)

  // 4. The card goes while its answer is on its way (another device's set adopted without it): nothing is left waiting.
  mock.delay = 1200
  await explain(); await a.waitForTimeout(300)
  const gone = await a.evaluate(() => { const id = col.open; store.set('cards:' + state.key, keptCards().filter(c => c.id !== id)); return id })
  await a.waitForTimeout(1600); mock.delay = 0
  const left = await a.evaluate(id => ({ live: col.live.has(id), ctl: col.ctl.has(id), rings: document.querySelectorAll('.mr-col .tinct-wait, .mr-sheet .tinct-wait, .mr-col .tc-wait, .mr-sheet .tc-wait').length }), gone)
  ok('the card is dropped mid-request: no live state, request or ring is left for it', !left.live && !left.ctl && !left.rings, left)

  // 5. The stream opens and then stalls for ever: the request is stopped after its idle bound and the card says so.
  await a.evaluate(() => { TinctAI.IDLE_MS = 1500 })
  mock.stall = true
  await explain()
  st = await settled(6000)
  await a.evaluate(() => { TinctAI.IDLE_MS = 120000 })
  ok('a stream that stalls: stopped after its idle bound, the card shows its error line', !st.rings && !st.inFlight && /could not be loaded/.test(st.status), st)

  ok('no page errors', !A.problems.length, A.problems.slice(0, 3))
  await A.ctx.close()
  // A request is sent at once, with the scan, units and labels still running (Ask latency, 16 Oct).
  results.push(...await askLatency(browser, origin))
  return results
}

/* ---------- Anders's feedback of 19 Oct 2026 (the margin reader beside the book reader's chat) ----------
   primer-anchor: Before you start is made ahead once as the PDF opens and shows at once; it scrolls away with the
   page like a card, never following the reader (column and narrow window); reopening never makes it again.
   wait-dots: the wait before an answer is the book reader's chat dots (chat-thread.css .tc-wait, exactly), never
   the ring, in cards, Chat and Before you start; static with reduced motion.
   chat-scroll: scrolling inside Chat (or an open card) never scrolls the pages, by wheel or touch; a question sent
   sits near the top of the thread with its answer growing below, and a reader who scrolled up stays there; a chat
   reply is plain paragraphs, never stripped or bolded as a card's opening (the exact reply Anders saw).
   highlight-place: a highlight's box covers the selected words, also when made while the pages are being redrawn
   (a zoom, a resize), on desktop pages and phone pages. */
const chatsOf = from => account.requests.slice(from).filter(r => r.path === '/api/chat' || r.path === '/api/lab-chat')
const okList = results => (name, pass, detail) => { results.push({ name, pass: !!pass, ...(pass ? {} : { detail }) }); console.log(`${pass ? 'ok  ' : 'FAIL'} ${name}${pass ? '' : ' ' + String(JSON.stringify(detail)).slice(0, 500)}`) }
const scrollTop = page => page.evaluate(() => document.getElementById('scroll').scrollTop)
const primerBox = page => page.evaluate(() => { const el = document.querySelector('.mr-col .mr-primer, .mr-primer.is-floating'); if (!el) return null; const r = el.getBoundingClientRect(), cs = getComputedStyle(el); return { top: Math.round(r.top), bottom: Math.round(r.bottom), height: Math.round(r.height), shown: cs.display !== 'none' && r.height > 0, position: cs.position } })

async function primerAnchor(browser, origin) {
  const results = [], ok = okList(results)
  const hex = addBook(LONG_BOOK)
  const primers = from => chatsOf(from).filter(r => r.body?.companion?.chapter?.action?.kind === 'primer')
  account.primers.clear()
  const r0 = account.requests.length
  const A = await readerPage(browser, origin, hex, { width: 1440, height: 900, look: 'night' })
  const a = A.page
  await a.evaluate(() => { for (const k of Object.keys(localStorage)) if (k.includes(':primer:')) localStorage.removeItem(k) })
  await prefetchSettled(a)
  const made = primers(r0)
  ok('2. opened signed in: Before you start of the reader\'s unit is made ahead, once, marked speculative, and kept here and with the book', made.length === 1 && made[0].body.companion.speculative === true && made[0].body.companion.chapter.action.unitKey === 'outline-0' && await a.evaluate(() => !!store.get(primerKey(currentUnit()))) && account.primers.has(hex + '?outline-0'), { made: made.length, speculative: made[0]?.body?.companion?.speculative })
  // Tapping it: there at once (no wait, no request).
  const r1 = account.requests.length
  await a.click('.mr-col .mr-pill[data-pill="primer"]')
  await a.waitForTimeout(120)
  const now = await a.evaluate(() => ({ gist: !!document.querySelector('.mr-col .mr-primer .mr-primer__gist'), wait: !!document.querySelector('.mr-col .mr-primer .tc-wait, .mr-col .mr-primer .tinct-wait') }))
  ok('2. tapping Before you start shows it at once: its gist within 120 ms, no wait, no request', now.gist && !now.wait && primers(r1).length === 0, now)
  await a.waitForTimeout(500)
  // 1. It scrolls away with the page, as a card does: never sticky or fixed, never following the reader.
  const b0 = await primerBox(a), s0 = await scrollTop(a)
  await a.evaluate(() => document.getElementById('scroll').scrollBy(0, 240)); await a.waitForTimeout(250)
  const b1 = await primerBox(a), s1 = await scrollTop(a)
  ok('1. desktop: scrolled 240 px, the open primer moves up with the page by the same amount (not sticky)', b0 && b1 && b0.position === 'absolute' && Math.abs((b0.top - b1.top) - (s1 - s0)) <= 2 && s1 - s0 > 200 && b1.height === b0.height, { b0, b1, scrolled: s1 - s0 })
  await shot(a, 'primer-anchor-1440x900-night-scrolled')
  await a.evaluate(() => document.getElementById('scroll').scrollBy(0, 2600)); await a.waitForTimeout(300)
  const gone = await a.evaluate(() => ({ primer: (el => !!el && getComputedStyle(el).display !== 'none' && el.getBoundingClientRect().bottom > Math.max(document.getElementById('scroll').getBoundingClientRect().top, document.getElementById('hdr').getBoundingClientRect().bottom))(document.querySelector('.mr-col .mr-primer')), open: primer.open }))
  ok('1. desktop: scrolled on past it, the primer has gone up with its page (still open, nothing follows the reader)', !gone.primer && gone.open, gone)
  await a.evaluate(() => document.getElementById('scroll').scrollTo(0, 0)); await a.waitForTimeout(300)
  await a.evaluate(n => document.getElementById('scroll').scrollTo(0, n), s0); await a.waitForTimeout(300)
  const back = await primerBox(a)
  ok('1. desktop: back where it was opened, the primer is there again, at the same place', back?.shown && Math.abs(back.top - b0.top) <= 2, { back, b0 })
  ok('1. desktop: no layout problems with the primer open', (await checkMargin(a)).length === 0, await checkMargin(a))
  await shot(a, 'primer-anchor-1440x900-night')
  // Reopening the file makes nothing again.
  const r2 = account.requests.length
  await a.reload(); await a.waitForFunction(() => document.querySelectorAll('.pdf-sheet .text-layer span').length > 20); await a.waitForTimeout(900)
  await prefetchSettled(a)
  ok('2. opening the file again makes nothing again (kept here)', primers(r2).length === 0, primers(r2).length)
  ok('no page errors (desktop)', !A.problems.length, A.problems)
  await A.ctx.close()
  // Another device: the account's copy, nothing made.
  const r3 = account.requests.length
  const D = await readerPage(browser, origin, hex, { width: 1440, height: 900, look: 'paper' })
  await prefetchSettled(D.page)
  ok('2. on another device the account\'s copy is taken; nothing is made again', primers(r3).length === 0 && await D.page.evaluate(() => !!store.get(primerKey(currentUnit()))), primers(r3).length)
  await D.ctx.close()
  // Signed out: nothing is made ahead.
  const r4 = account.requests.length
  const so = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  await so.addInitScript(hex => { try { localStorage.setItem('tinct-addbook:edition:' + hex, JSON.stringify('pages')) } catch {} }, hex)
  const sp = await so.newPage()
  await sp.goto(`${origin}/lab/addbook/?userBook=${hex}`).catch(() => {})
  await sp.waitForTimeout(4000)
  ok('2. signed out: nothing is made ahead', primers(r4).length === 0, primers(r4).length)
  await so.close()
  // A narrow window: the primer floats beside the page and scrolls away with it too.
  const N = await readerPage(browser, origin, hex, { width: 1024, height: 768, look: 'paper' })
  const n = N.page
  await prefetchSettled(n)
  await n.evaluate(() => openPrimer(currentUnit())); await n.waitForSelector('.mr-primer.is-floating .mr-primer__gist', { timeout: 6000 }).catch(() => {})
  const f0 = await primerBox(n), t0 = await scrollTop(n)
  await n.evaluate(() => document.getElementById('scroll').scrollBy(0, 200)); await n.waitForTimeout(250)
  const f1 = await primerBox(n), t1 = await scrollTop(n)
  ok('1. narrow window: the floating primer moves up with the page by the scroll (not fixed in place)', f0 && f1 && Math.abs((f0.top - f1.top) - (t1 - t0)) <= 2 && t1 - t0 > 150, { f0, f1, scrolled: t1 - t0 })
  ok('no page errors (narrow)', !N.problems.length, N.problems)
  await N.ctx.close()
  // The phone: the bottom card (it never followed the page), for the record.
  const P = await readerPage(browser, origin, hex, { width: 390, height: 844, look: 'night' })
  await prefetchSettled(P.page)
  await P.page.waitForSelector('.mr-sheet .mr-trigger', { timeout: 8000 }).catch(() => {})
  await P.page.click('.mr-sheet .mr-trigger').catch(() => {}); await P.page.waitForSelector('.mr-sheet .mr-primer .mr-primer__gist', { timeout: 6000 }).catch(() => {})
  ok('phone: Before you start opens at once in the bottom card', await P.page.isVisible('.mr-sheet .mr-primer .mr-primer__gist'))
  await shot(P.page, 'primer-anchor-390x844-night')
  ok('no page errors (phone)', !P.problems.length, P.problems)
  await P.ctx.close()
  return results
}

async function waitDots(browser, origin) {
  const results = [], ok = okList(results)
  const css = readFileSync(join(PUBLIC, 'lab/chat-thread.css'), 'utf8')
  // The book reader's dots, as chat-thread.css draws them: size, gap, colour per look, timing.
  const rule = sel => (css.match(new RegExp(sel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\s*\\{([^}]*)\\}')) || [])[1] || ''
  const want = { size: /width: (\d+px)/.exec(rule('.tc .tc-wait i'))?.[1], gap: /gap: (\d+px)/.exec(rule('.tc .tc-wait'))?.[1], duration: /(\d*\.?\d+s) ease-in-out infinite/.exec(rule('.tc .tc-wait i'))?.[1], delays: ['0s', /animation-delay: ([^;]+);/.exec(rule('.tc .tc-wait i:nth-child(2)'))?.[1], /animation-delay: ([^;]+);/.exec(rule('.tc .tc-wait i:nth-child(3)'))?.[1]], faint: { paper: /--tc-faint: (#[0-9a-f]+)/.exec(rule('.tc'))?.[1], night: /--tc-faint: (#[0-9a-f]+)/.exec(rule('.lab.is-night .tc'))?.[1] } }
  const hexRgb = h => `rgb(${parseInt(h.slice(1, 3), 16)}, ${parseInt(h.slice(3, 5), 16)}, ${parseInt(h.slice(5, 7), 16)})`
  const dots = (page, sel) => page.evaluate(sel => { const w = document.querySelector(sel); if (!w) return null; const is = [...w.querySelectorAll('i')], cs = is.map(i => getComputedStyle(i)); return { n: is.length, size: cs[0]?.width, h: cs[0]?.height, gap: getComputedStyle(w).columnGap, bg: cs[0]?.backgroundColor, name: cs[0]?.animationName, duration: cs[0]?.animationDuration, delays: cs.map(c => c.animationDelay), opacity: cs[0]?.opacity, label: w.getAttribute('aria-label'), rings: document.querySelectorAll('.mr .tinct-wait').length } }, sel)
  const hex = addBook(PDFS[0])
  for (const [width, height, look] of [[1440, 900, 'night'], [390, 844, 'paper']]) {
    const phone = width < 700, tag = `wait-dots-${width}x${height}-${look}`
    const A = await readerPage(browser, origin, hex, { width, height, look })
    const a = A.page
    const faint = hexRgb(look === 'night' ? want.faint.night : want.faint.paper)
    const same = d => d && d.n === 3 && d.size === want.size && d.h === want.size && d.gap === want.gap && d.bg === faint && d.name === 'tc-breathe' && d.duration === want.duration && JSON.stringify(d.delays.map(parseFloat)) === JSON.stringify(want.delays.map(parseFloat)) && d.label === 'Answer on the way' && d.rings === 0
    // A card (Explain) waiting for its answer.
    mock.delay = 1500
    await selectText(a); await a.waitForSelector('.mr-float [data-m="explain"]', { timeout: 5000 }).catch(() => {})
    await a.click('.mr-float [data-m="explain"]').catch(() => {}); await a.waitForTimeout(300)
    const card = await dots(a, phone ? '.mr-sheet .tc-wait' : '.mr-card.is-open .tc-wait')
    ok(`${tag}: 3. a card waiting for its answer shows the book reader's chat dots (${want.size}, gap ${want.gap}, ${look === 'night' ? want.faint.night : want.faint.paper}, ${want.duration}, delays ${want.delays.join('/')}), no ring`, same(card), { card, want })
    await a.waitForTimeout(1600)
    ok(`${tag}: …and the answer replaces them`, await a.evaluate(() => !document.querySelector('.mr .tc-wait')))
    await a.keyboard.press('Escape'); await a.keyboard.press('Escape'); await a.evaluate(() => getSelection().removeAllRanges())
    // Chat waiting for its answer.
    await a.evaluate(() => openWhole({ quiet: true })); await a.waitForTimeout(300)
    // The answer's stream opens and sends nothing yet (mock.stall): the wait before its first word.
    mock.stall = true
    await a.evaluate(() => { ask('What does the whole document argue?') })
    await a.waitForTimeout(400)
    const chatDots = await dots(a, phone ? '.mr-sheet .tc-wait' : '.mr-card.is-whole .tc-wait')
    ok(`${tag}: 3. Chat waiting for its answer shows the same dots, no ring`, same(chatDots), chatDots || await a.evaluate(() => ({ live: chat.live, open: col.open, html: (col.sheet || document.querySelector('.mr-card.is-whole'))?.outerHTML.slice(0, 500) })))
    await shot(a, `${tag}-chat-waiting`)
    await a.evaluate(() => chat.ctl?.abort()); mock.stall = false; await a.waitForTimeout(300)
    // Before you start being made.
    await a.evaluate(() => { closeChat?.(); openCard(null); closePrimer(); for (const k of Object.keys(localStorage)) if (k.includes(':primer:')) localStorage.removeItem(k) })
    account.primers.clear(); mock.primers = [{ text: JSON.stringify({ gist: 'MOCK gist. Second.', claims: [1, 2, 3].map(i => ({ text: `Claim ${i}.`, cite: '{p. 1}' })), keepInMind: ['One.'], map: [{ title: 'One', pages: 'p. 1' }] }), delay: 1500 }]
    await prefetchSettled(a)
    await a.evaluate(() => openPrimer(currentUnit())); await a.waitForTimeout(400)
    const primerDots = await dots(a, '.mr-primer .tc-wait')
    ok(`${tag}: 3. Before you start being made shows the same dots, no ring`, same(primerDots), primerDots)
    await a.waitForTimeout(1600); mock.primers = []; mock.delay = 0
    ok(`${tag}: no page errors`, !A.problems.length, A.problems)
    await A.ctx.close()
  }
  // Reduced motion: still dots, not breathing, as the book reader's (opacity .45).
  const R = await readerPage(browser, origin, hex, { width: 1440, height: 900, look: 'paper' })
  await R.page.emulateMedia({ reducedMotion: 'reduce' })
  mock.delay = 1500
  await R.page.evaluate(() => openWhole({ quiet: true })); await R.page.waitForTimeout(300)
  mock.stall = true
  await R.page.evaluate(() => { ask('A question.') }); await R.page.waitForTimeout(400)
  const still = await dots(R.page, '.mr-card.is-whole .tc-wait')
  ok('3. reduced motion: the dots stand still at .45, as the book reader\'s', still && still.n === 3 && still.name === 'none' && still.opacity === '0.45', still)
  await R.page.evaluate(() => chat.ctl?.abort()); mock.stall = false; mock.delay = 0
  await R.ctx.close()
  return results
}

// A long Chat thread: older questions and answers, so the thread scrolls.
const LONG_ANSWER = n => Array.from({ length: 4 }, (_, i) => `MOCK paragraph ${i + 1} of answer ${n}. It runs long enough to fill a few lines of the margin's card, so that the thread has to scroll when several of them are kept.`).join('\n\n')
const seedChat = (page, count = 4) => page.evaluate(([count, answers]) => { const at = Date.now() - 3600e3; const turns = []; for (let i = 0; i < count; i++) { turns.push({ role: 'user', content: `Earlier question ${i + 1}?`, page: 1, at: at + i * 60e3 }); turns.push({ role: 'assistant', content: answers[i], at: at + i * 60e3 + 1000 }) } store.set('chat:' + state.key, turns) }, [count, Array.from({ length: count }, (_, i) => LONG_ANSWER(i + 1))])
const HUME_REPLY = 'The sentence you\'ve highlighted ends the reply to Hume, and the one that follows ("Nor does the argument...by Russell 1913...") begins the reply to a second objection. That second objection is about the form of the laws.\n\nSo the passage is not free of causal talk; it says where such talk belongs.'

async function chatScroll(browser, origin) {
  const results = [], ok = okList(results)
  const hex = addBook(PDFS[0])
  for (const [width, height, look] of [[1440, 900, 'night'], [390, 844, 'night']]) {
    const phone = width < 700, tag = `chat-scroll-${width}x${height}-${look}`, host = phone ? '.mr-sheet' : '.mr-card.is-whole.is-open'
    const A = await readerPage(browser, origin, hex, { width, height, look })
    const a = A.page
    await prefetchSettled(a)
    await seedChat(a)
    await a.evaluate(() => openWhole({ quiet: true })); await a.waitForTimeout(500)
    const body = `${host} .mr-card__body`
    const info = () => a.evaluate(sel => { const b = document.querySelector(sel); return b && { top: b.scrollTop, max: b.scrollHeight - b.clientHeight, ob: getComputedStyle(b).overscrollBehaviorY } }, body)
    const i0 = await info()
    ok(`${tag}: the thread scrolls and contains its overscroll`, i0 && i0.max > 100 && i0.ob === 'contain', i0)
    // 4. At its end, more scrolling never moves the pages behind it.
    await a.evaluate(sel => { const b = document.querySelector(sel); b.scrollTop = b.scrollHeight }, body)
    const page0 = await scrollTop(a)
    const box = await a.evaluate(sel => { const r = document.querySelector(sel).getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 } }, body)
    if (!phone) {
      await a.mouse.move(box.x, box.y)
      for (let k = 0; k < 4; k++) { await a.mouse.wheel(0, 400); await a.waitForTimeout(80) }
      await a.waitForTimeout(300)
      const page1 = await scrollTop(a)
      ok(`${tag}: 4. the wheel over Chat at its end never scrolls the pages`, page1 === page0, { page0, page1 })
      await a.evaluate(sel => { document.querySelector(sel).scrollTop = 0 }, body)
      for (let k = 0; k < 3; k++) { await a.mouse.wheel(0, -400); await a.waitForTimeout(80) }
      await a.waitForTimeout(300)
      ok(`${tag}: 4. …nor at its top, scrolling up`, (await scrollTop(a)) === page0, { page0, now: await scrollTop(a) })
      // The column's empty room still scrolls the pages (one scroll surface).
      const empty = await a.evaluate(() => { const c = document.querySelector('.mr-col:not(.mr-doc)').getBoundingClientRect(); return { x: c.left + c.width / 2, y: innerHeight - 30 } })
      await a.mouse.move(empty.x, empty.y); await a.mouse.wheel(0, 300); await a.waitForTimeout(400)
      ok(`${tag}: the column's empty room still scrolls the pages (one scroll surface)`, (await scrollTop(a)) > page0, { page0, now: await scrollTop(a) })
      await a.evaluate(n => document.getElementById('scroll').scrollTo(0, n), page0); await a.waitForTimeout(200)
    } else {
      // A touch drag (as iOS Safari sends it) at the body's end, then at its top.
      const cdp = await a.context().newCDPSession(a)
      const drag = dy => cdp.send('Input.synthesizeScrollGesture', { x: Math.round(box.x), y: Math.round(box.y), yDistance: dy, gestureSourceType: 'touch', speed: 1200 })
      await drag(-300); await a.waitForTimeout(400)
      const p1 = await scrollTop(a)
      await a.evaluate(sel => { document.querySelector(sel).scrollTop = 0 }, body)
      await drag(300); await a.waitForTimeout(400)
      const p2 = await scrollTop(a)
      ok(`${tag}: 4. a touch drag in Chat at its end or its top never scrolls the pages`, p1 === page0 && p2 === page0 && await a.isVisible('.mr-sheet'), { page0, p1, p2 })
    }
    // 5. A question sent: held near the top of the thread, its answer growing below.
    await a.evaluate(sel => { const b = document.querySelector(sel); b.scrollTop = 0 }, body)
    const chunks = Array.from({ length: 8 }, (_, i) => ({ text: (i ? '\n\n' : '') + `MOCK streamed paragraph ${i + 1}, which keeps the answer growing for a while below the question.`, wait: 250 }))
    mock.chunks = chunks
    const n = await a.evaluate(() => chat.turns.length)
    await a.evaluate(() => { const f = (col.sheet || document.querySelector('.mr-card.is-whole.is-open'))?.querySelector('.mr-follow__input'); f.focus() })
    await a.keyboard.type('Where does the argument turn?'); await a.keyboard.press('Enter')
    await a.waitForTimeout(700)
    const q = sel => a.evaluate(([sel, n]) => { const b = document.querySelector(sel), row = b?.querySelector(`.mr-you[data-turn="${n}"]`); if (!row) return null; const br = b.getBoundingClientRect(), r = row.getBoundingClientRect(); return { rowTop: Math.round(r.top - br.top), rowBottom: Math.round(r.bottom - br.top), clientHeight: b.clientHeight, scrollTop: b.scrollTop, answer: !!row.nextElementSibling } }, [sel, n])
    const early = await q(body)
    ok(`${tag}: 5. once sent, the question sits near the top of the thread (the book reader's place), not at the thread's start`, early && early.scrollTop > 0 && early.rowTop >= 0 && early.rowTop <= 130 && early.rowBottom < early.clientHeight, early)
    await shot(a, `${tag}-sent`)
    await a.waitForTimeout(800)
    const mid = await q(body)
    ok(`${tag}: 5. while the answer streams the question stays where it was put (nothing moves)`, mid && Math.abs(mid.rowTop - early.rowTop) <= 2 && mid.answer, { early, mid })
    // The reader scrolls up while it streams: never pulled back.
    await a.evaluate(sel => { document.querySelector(sel).scrollTop = 40 }, body)
    await a.waitForTimeout(900)
    const kept = await a.evaluate(sel => document.querySelector(sel).scrollTop, body)
    ok(`${tag}: 5. a reader who scrolled up while it streams stays where they are`, Math.abs(kept - 40) <= 1, kept)
    await a.waitForTimeout(1200)
    // 8. A chat reply is plain paragraphs: the exact reply Anders saw, never stripped or bolded.
    mock.next = HUME_REPLY
    await a.evaluate(() => { const f = (col.sheet || document.querySelector('.mr-card.is-whole.is-open'))?.querySelector('.mr-follow__input'); f.focus() })
    await a.keyboard.type('Explain this more: it is not free of causal talk.'); await a.keyboard.press('Enter')
    await a.waitForTimeout(900)
    const reply = await a.evaluate(sel => { const answers = document.querySelectorAll(`${sel} .mr-answer`), last = answers[answers.length - 1]; return last && { text: last.innerText.replace(/\s+/g, ' ').trim(), bold: last.querySelectorAll('.is-bottom-line, strong, b').length, paras: last.querySelectorAll('p').length } }, body)
    ok(`${tag}: 8. Chat shows the reply as written, in plain paragraphs: "The sentence you've highlighted ends the reply to Hume…", no bold lead`, reply && reply.text.startsWith('The sentence you\'ve highlighted ends the reply to Hume, and the one that follows ("Nor does the argument...by Russell 1913...") begins the reply to a second objection.') && reply.bold === 0 && reply.paras === 2, reply)
    ok(`${tag}: no page errors`, !A.problems.length, A.problems)
    await A.ctx.close()
  }
  // 5 and 8 in a card: a follow-up to an Explain card is held near the top; its reply is a chat reply.
  const C = await readerPage(browser, origin, hex, { width: 1440, height: 900, look: 'paper' })
  const c = C.page
  await prefetchSettled(c)
  await c.evaluate(answer => { const p = currentPlace().page, card = TinctMargin.newCard({ kind: 'explain', page: p, anchor: [{ n: p, x: 0.15, y: 0.3, w: 0.5, h: 0.02 }], text: 'A passage.', turns: [{ role: 'assistant', content: answer }] }); store.set('cards:' + state.key, [card]); col.view = null; openCard(card.id) }, LONG_ANSWER(1) + '\n\n' + LONG_ANSWER(2))
  await c.waitForTimeout(500)
  mock.next = HUME_REPLY; mock.delay = 0
  await c.click('.mr-card.is-open .mr-follow__input'); await c.keyboard.type('Explain this more.')
  const top0 = await c.evaluate(() => document.getElementById('scroll').scrollTop)
  await c.keyboard.press('Enter')
  await c.waitForTimeout(1000)
  const top1 = await c.evaluate(() => document.getElementById('scroll').scrollTop)
  const held = await c.evaluate(() => { const b = document.querySelector('.mr-card.is-open .mr-card__body'), row = b.querySelector('.mr-you[data-turn="1"]'), r = row.getBoundingClientRect(), s = document.getElementById('scroll').getBoundingClientRect(), hdr = document.getElementById('hdr').getBoundingClientRect().bottom; const answers = b.querySelectorAll('.mr-answer'), last = answers[answers.length - 1], lr = last.getBoundingClientRect(); return { inView: r.top >= Math.max(s.top, hdr) && r.bottom <= s.bottom, below: lr.top >= r.bottom - 1, ownScroll: b.scrollHeight - b.clientHeight, first: answers[0].querySelectorAll('.is-bottom-line').length, reply: last.innerText.replace(/\s+/g, ' ').trim(), bold: last.querySelectorAll('.is-bottom-line').length } })
  // In the wide column the card is part of the page (item 9): it grows in place. Since 20 Oct 2026 (Anders: "the reading
  // place must never move") the page stays where the reader left it; the question stands where its field was.
  ok('card: 5. a follow-up leaves the page where it was, its answer below it; the card grows in place (no scroll of its own)', top1 === top0 && held.below && held.ownScroll <= 1, { ...held, top0, top1 })
  ok('card: 8. the card\'s own answer keeps its bold bottom line; the follow-up\'s reply is plain and unstripped', held.first === 1 && held.bold === 0 && held.reply.startsWith('The sentence you\'ve highlighted ends the reply to Hume'), held)
  ok('card: no page errors', !C.problems.length, C.problems)
  await C.ctx.close()
  return results
}

async function highlightPlace(browser, origin) {
  const results = [], ok = okList(results)
  // Each selected word's box lies inside the highlight (its middle within a mark; the mark's middle on the word's line).
  const measure = page => page.evaluate(() => {
    const s = getSelection(); if (!s.rangeCount) return null
    const range = s.getRangeAt(0).cloneRange()
    const words = [...range.getClientRects()].filter(r => r.width > 1 && r.height > 1).map(r => ({ l: r.left, r: r.right, t: r.top, b: r.bottom }))
    const ids = addHighlight({ text: s.toString() }, { range }) || []
    getSelection().removeAllRanges()
    return { ids, words }
  })
  const marksOf = (page, ids) => page.evaluate(ids => ids.flatMap(id => [...document.querySelectorAll(`.hl-layer i[data-id="${id}"]`)]).map(el => { const r = el.getBoundingClientRect(); return { l: r.left, r: r.right, t: r.top, b: r.bottom } }), ids)
  const covers = (words, marks) => words.length > 0 && words.every(w => { const cx = (w.l + w.r) / 2, cy = (w.t + w.b) / 2; return marks.some(m => cx >= m.l - 1 && cx <= m.r + 1 && cy >= m.t && cy <= m.b && Math.abs((m.t + m.b) / 2 - cy) <= (w.b - w.t) * 0.25) })
  // The words again (their place after the pages were drawn again): the same text found in the layer.
  const refind = (page, text) => page.evaluate(text => {
    for (const p of state.pages) {
      if (!p.layer) continue
      const nodes = [], walker = document.createTreeWalker(p.layer, NodeFilter.SHOW_TEXT); let all = '', node
      while ((node = walker.nextNode())) { nodes.push({ node, at: all.length }); all += node.nodeValue }
      const flat = all.replace(/\s/g, ' '), want = text.replace(/\s+/g, ' ').trim(), i = flat.indexOf(want)
      if (i < 0) continue
      const at = off => { const k = nodes.findLastIndex(x => x.at <= off); return [nodes[k].node, off - nodes[k].at] }
      const r = document.createRange(); r.setStart(...at(i)); r.setEnd(...at(i + want.length))
      return [...r.getClientRects()].filter(x => x.width > 1 && x.height > 1).map(x => ({ l: x.left, r: x.right, t: x.top, b: x.bottom }))
    }
    return null
  }, text)
  const hex = addBook(PDFS[0])
  for (const [width, height, look] of [[1440, 900, 'night'], [390, 844, 'night']]) {
    const tag = `highlight-place-${width}x${height}-${look}`
    const A = await readerPage(browser, origin, hex, { width, height, look })
    const a = A.page
    // At rest.
    const text = await selectText(a); await a.waitForTimeout(400)
    const m0 = await measure(a); await a.waitForTimeout(200)
    ok(`${tag}: 7. the highlight covers the selected words (each word's middle inside a mark, the mark on the word's line)`, m0 && covers(m0.words, await marksOf(a, m0.ids)), { words: m0?.words?.slice(0, 2), marks: m0 && (await marksOf(a, m0.ids)).slice(0, 2) })
    // While the pages are being drawn again (a zoom, before the new drawing lands): kept on its words afterwards.
    await a.keyboard.press('Escape').catch(() => {})
    const sel2 = await a.evaluate(() => { const spans = [...document.querySelectorAll('.pdf-sheet .text-layer span')].filter(s => { const r = s.getBoundingClientRect(); return r.top > 160 && r.bottom < innerHeight - 160 && /[A-Za-z]{5,}/.test(s.textContent) && s.textContent.trim().split(/\s+/).length >= 4 }); const sp = spans[Math.floor(spans.length / 3)]; return sp ? sp.textContent.trim().split(/\s+/).slice(0, 4).join(' ') : null })
    await a.evaluate(() => setZoom(state.zoom * 1.15, { quick: true }))
    const m1 = await a.evaluate(want => { for (const p of state.pages) { if (!p.layer) continue; const nodes = [], w = document.createTreeWalker(p.layer, NodeFilter.SHOW_TEXT); let all = '', node; while ((node = w.nextNode())) { nodes.push({ node, at: all.length }); all += node.nodeValue } const i = all.replace(/\s/g, ' ').indexOf(want); if (i < 0) continue; const at = off => { const k = nodes.findLastIndex(x => x.at <= off); return [nodes[k].node, off - nodes[k].at] }; const r = document.createRange(); r.setStart(...at(i)); r.setEnd(...at(i + want.length)); return addHighlight({ text: want }, { range: r }) || [] } return [] }, sel2)
    await a.waitForTimeout(1500)
    const words1 = await refind(a, sel2), marks1 = await marksOf(a, m1)
    ok(`${tag}: 7. a highlight made while the pages were being drawn again (a zoom) lands on its words once they are drawn`, sel2 && words1 && covers(words1, marks1), { sel2, words: words1?.slice(0, 2), marks: marks1.slice(0, 2) })
    await shot(a, tag)
    ok(`${tag}: no page errors`, !A.problems.length, A.problems)
    await A.ctx.close()
  }
  // The justified lines of 16 Oct (pieces of a line), at rest, on the desktop.
  const jhex = addBook(JUSTIFIED_PAPER)
  const J = await readerPage(browser, origin, jhex, { width: 1440, height: 900, look: 'night', minSpans: 10 })
  await J.page.evaluate(() => { const spans = [...document.querySelectorAll('.pdf-sheet .text-layer span')].filter(s => s.textContent.trim().length > 3); document.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerType: 'mouse' })); getSelection().setBaseAndExtent(spans[3].firstChild, 0, spans[9].firstChild, spans[9].firstChild.length); document.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, pointerType: 'mouse' })) })
  await J.page.waitForTimeout(300)
  const mj = await measure(J.page)
  ok('justified lines: 7. the highlight covers the selected words', mj && covers(mj.words, await marksOf(J.page, mj.ids)), mj?.words?.slice(0, 3))
  await J.ctx.close()
  return results
}

/* card-fold (19 Oct 2026, item 10): a click outside an open margin card folds it; its answer is kept (and keeps
   coming while it streams); one click on the folded card opens it again with its answer; Escape folds it too. */
async function cardFold(browser, origin) {
  const results = [], ok = okList(results)
  const hex = addBook(PDFS[0])
  const A = await readerPage(browser, origin, hex, { width: 1440, height: 900, look: 'night', startPage: 3 })
  const a = A.page
  await prefetchSettled(a)
  const state = () => a.evaluate(() => { const id = col.open || window.__foldId; const el = id && document.querySelector(`.mr-col .mr-card[data-id="${CSS.escape(id)}"]`); return { open: col.open, folded: !!el?.classList.contains('is-folded'), answer: el?.querySelector('.mr-answer, .mr-card__text')?.textContent || '', turns: (cardById(id)?.turns || []).length } })
  // Click page text well away from the card's passage (the first page's lower lines).
  const clickText = () => a.evaluate(() => { const spans = [...document.querySelectorAll('.pdf-sheet .text-layer span')].filter(s => { const r = s.getBoundingClientRect(); return r.top > innerHeight * 0.6 && r.bottom < innerHeight - 20 && s.textContent.trim().length > 3 }); const r = spans[spans.length - 1].getBoundingClientRect(); return { x: r.left + 4, y: r.top + r.height / 2 } }).then(p => a.mouse.click(p.x, p.y))
  for (const streaming of [false, true]) {
    const tag = streaming ? 'while its answer streams' : 'with its answer'
    mock.delay = streaming ? 1500 : 0
    await a.keyboard.press('Escape'); await a.evaluate(() => getSelection().removeAllRanges())
    await selectText(a, { near: 'top' }); await a.waitForSelector('.mr-float [data-m="explain"]', { timeout: 5000 }).catch(() => {})
    await a.click('.mr-float [data-m="explain"]')
    await a.waitForTimeout(streaming ? 300 : 1200)
    await a.evaluate(() => { window.__foldId = col.open })
    const before = await state()
    await clickText(); await a.waitForTimeout(300)
    const after = await state()
    ok(`10. ${tag}: a click on the page's text away from it folds the Explain card (not deleted)`, before.open && !after.open && after.folded, { before, after })
    if (streaming) await a.waitForTimeout(1800)
    await a.evaluate(() => getSelection().removeAllRanges())
    await a.click(`.mr-col .mr-card.is-folded[data-id="${await a.evaluate(() => window.__foldId)}"] .mr-card__label`)
    await a.waitForTimeout(400)
    const again = await state()
    ok(`10. ${tag}: one click on the folded card opens it again, with its answer`, again.open && /MOCK ANSWER/.test(again.answer) && again.turns === 1, again)
  }
  mock.delay = 0
  // A click in the card or its follow-up line keeps it open; Escape folds it.
  await a.click('.mr-col .mr-card.is-open .mr-follow__input'); await a.waitForTimeout(200)
  ok('10. a click in the card\'s follow-up line keeps it open', !!(await a.evaluate(() => col.open)))
  await a.evaluate(() => document.activeElement?.blur()); await a.keyboard.press('Escape'); await a.waitForTimeout(200)
  ok('10. Escape folds it', !(await a.evaluate(() => col.open)))
  ok('no page errors', !A.problems.length, A.problems)
  await A.ctx.close()
  return results
}

/* cross-page (19 Oct 2026, item 11): a selection from the foot of one page onto the next highlights only the body
   words of both pages: never the running heads or page numbers, no box of nothing, each box on its words; the
   page itself is never selectable; the highlight reloads where it was; the passage's text is the body words.
   CROSS_PDF=<file> PAGE=<n> also checks a PDF of your own (Constructor Theory, pages 4 to 5). */
async function crossPage(browser, origin) {
  const results = [], ok = okList(results)
  const docs = [{ name: 'prose_book', file: LONG_BOOK, page: 3 }]
  if (process.env.CROSS_PDF) docs.push({ name: basename(process.env.CROSS_PDF, '.pdf'), file: process.env.CROSS_PDF, page: Number(process.env.PAGE || 4) })
  for (const doc of docs) {
    const hex = addBook(doc.file)
    for (const [width, height, look] of [[1440, 900, 'night'], [390, 844, 'night']]) {
      const tag = `cross-page-${doc.name}-${width}x${height}-${look}`
      const A = await readerPage(browser, origin, hex, { width, height, look })
      const a = A.page
      await a.evaluate(n => goTo({ page: n, frac: 0.85 }), doc.page); await a.waitForTimeout(1200)
      await a.waitForFunction(n => state.pages[n - 1]?.layer && state.pages[n]?.layer, doc.page, { timeout: 20000 }).catch(() => {})
      const got = await a.evaluate(async n => {
        const p = state.pages[n - 1], q = state.pages[n]
        const body = pg => [...pg.layer.querySelectorAll(':scope > span')].filter(sp => !sp.dataset.f && sp.textContent.trim())
        const first = body(p).at(-2), last = body(q)[2]
        const range = document.createRange(); range.setStart(first.firstChild, 0); range.setEnd(last.firstChild, last.firstChild.length)
        document.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerType: 'mouse' })); getSelection().removeAllRanges(); getSelection().addRange(range); document.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, pointerType: 'mouse' }))
        const furniture = [...p.layer.querySelectorAll('span[data-f]'), ...q.layer.querySelectorAll('span[data-f]')].map(sp => ({ t: sp.textContent.trim(), r: (r => ({ l: r.left, r: r.right, t: r.top, b: r.bottom }))(sp.getBoundingClientRect()) }))
        const words = bodyOfRange(range).rects.map(r => ({ l: r.left, r: r.right, t: r.top, b: r.bottom }))
        const info = selectionInfo()
        const select = ['.pdf-sheet', '.pdf-sheet canvas', '.pdf-sheet .pg'].map(sel => getComputedStyle(document.querySelector(sel)).userSelect)
        const ids = addHighlight({ text: info?.text || '' }, { range }) || []
        getSelection().removeAllRanges()
        await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))
        const marks = ids.flatMap(id => [...document.querySelectorAll(`.hl-layer i[data-id="${id}"]`)].map(el => ({ page: Number(el.closest('.pdf-sheet').dataset.page), ...(r => ({ l: r.left, r: r.right, t: r.top, b: r.bottom }))(el.getBoundingClientRect()) })))
        return { ids, furniture, words, marks, text: info?.text || '', firstText: first.textContent.trim(), lastText: last.textContent.trim(), select, stored: ids.map(id => (store.get('hl:' + state.key) || []).find(h => h.id === id)) }
      }, doc.page)
      const hit = (x, y) => Math.min(x.r, y.r) - Math.max(x.l, y.l) > 0.5 && Math.min(x.b, y.b) - Math.max(x.t, y.t) > 0.5
      ok(`${tag}: the page, its drawing and its box are never selectable (only the text)`, got.select.every(v => v === 'none'), got.select)
      ok(`${tag}: the page's running heads and numbers are known as furniture on both pages`, got.furniture.length >= 2, got.furniture.map(f => f.t))
      ok(`${tag}: 11. a selection across the page break highlights body words on both pages`, new Set(got.marks.map(m => m.page)).size === 2 && got.marks.length >= 2, got.marks.map(m => m.page))
      ok(`${tag}: 11. no highlight box touches a running head or a page number`, !got.marks.some(m => got.furniture.some(f => hit(m, f.r))), got.marks)
      ok(`${tag}: 11. no box is empty: each covers selected words`, got.marks.every(m => got.words.some(w => hit(m, w))), got.marks)
      ok(`${tag}: 11. every selected word lies in a box, on its line`, got.words.every(w => { const cx = (w.l + w.r) / 2, cy = (w.t + w.b) / 2; return got.marks.some(m => cx >= m.l - 1 && cx <= m.r + 1 && cy >= m.t && cy <= m.b && Math.abs((m.t + m.b) / 2 - cy) <= (w.b - w.t) * 0.25) }), { words: got.words.slice(0, 3), marks: got.marks.slice(0, 3) })
      ok(`${tag}: 11. the passage is the body words only, from the first to the last`, got.text.startsWith(got.firstText.split(/\s+/)[0]) && got.text.endsWith(got.lastText.split(/\s+/).at(-1)) && !got.furniture.some(f => f.t.length > 2 && got.text.includes(f.t)), { text: got.text.slice(0, 120) + '…' + got.text.slice(-60), furniture: got.furniture.map(f => f.t) })
      await shot(a, tag)
      // Saved: it reloads where it was.
      // Where each box is on its page (fractions of the page's box, in thousandths): the same after a reload.
      const onPage = ids => a.evaluate(ids => ids.flatMap(id => [...document.querySelectorAll(`.hl-layer i[data-id="${id}"]`)].map(el => { const r = el.getBoundingClientRect(), pg = el.closest('.pg').getBoundingClientRect(); return [Number(el.closest('.pdf-sheet').dataset.page), ...[(r.left - pg.left) / pg.width, (r.top - pg.top) / pg.height, (r.right - pg.left) / pg.width, (r.bottom - pg.top) / pg.height].map(v => Math.round(v * 1000))] })), ids)
      const before = await onPage(got.ids)
      const place = await a.evaluate(() => $('scroll').scrollTop)
      await a.reload(); await a.waitForFunction(() => document.querySelectorAll('.pdf-sheet .text-layer span').length > 20, null, { timeout: 30000 })
      await a.evaluate(t => { $('scroll').scrollTop = t }, place); await a.waitForTimeout(1500)
      await a.evaluate(t => { $('scroll').scrollTop = t }, place); await a.waitForTimeout(600)
      const after = await onPage(got.ids)
      ok(`${tag}: 11. saved, the highlight reloads where it was on its pages`, after.length === before.length && after.every((m, i) => m.every((v, k) => Math.abs(v - before[i][k]) <= 1)), { before, after })
      ok(`${tag}: no page errors`, !A.problems.length, A.problems)
      await A.ctx.close()
    }
  }
  return results
}

/* column-page (19 Oct 2026, item 9): on a wide desktop the margin's cards are part of the page, as in Gloss: each at
   its passage's line, scrolling with the page and never moved or redrawn by a scroll; the leader line straight across
   when the card is at its passage, and fixed with the page when a card was pushed down (then across, a short slant,
   across); cards close together pushed down, never overlapping; an open card grows in place (no scrolling body of
   its own after three follow-ups: the page is the one scroll); the open card's passage underlined in the accent. */
async function columnPage(browser, origin) {
  const results = [], ok = okList(results)
  const hex = addBook(LONG_BOOK)
  for (const [width, height, look] of [[1440, 900, 'night'], [2000, 1066, 'night'], [1280, 800, 'paper']]) {
    const tag = `column-page-${width}x${height}-${look}`
    const A = await readerPage(browser, origin, hex, { width, height, look, startPage: 3 })
    const a = A.page
    await prefetchSettled(a)
    // Three passages a line apart (their cards must be pushed down), the first open.
    const ids = await a.evaluate(() => {
      const p = state.pages[2], b = p.pg.getBoundingClientRect(), hdr = document.getElementById('hdr').getBoundingClientRect().bottom
      const spans = [...p.layer.querySelectorAll(':scope > span')].filter(sp => !sp.dataset.f && sp.textContent.trim().length > 20).filter(sp => { const r = sp.getBoundingClientRect(); return r.top > hdr + 120 && r.bottom < innerHeight - 200 })
      const lines = []; for (const sp of spans) { const r = sp.getBoundingClientRect(); if (!lines.some(l => Math.abs(l.top - r.top) < 4)) lines.push(r) }
      const cards = lines.slice(0, 3).map((r, i) => TinctMargin.newCard({ kind: i === 1 ? 'ask' : 'explain', page: 3, anchor: [{ n: 3, x: (r.left - b.left) / b.width, y: (r.top - b.top) / b.height, w: (r.width * 0.6) / b.width, h: r.height / b.height }], text: 'A passage of the page.', turns: i === 1 ? [{ role: 'user', content: 'Why?' }, { role: 'assistant', content: 'MOCK ANSWER. The bottom line comes first {p. 1}.\n\nThen a short paragraph.' }] : [{ role: 'assistant', content: 'MOCK ANSWER. The bottom line comes first {p. 1}.\n\nThen a short paragraph {p. 3}.' }] }))
      store.set('cards:' + state.key, cards); col.view = null; openCard(cards[0].id)
      return cards.map(c => c.id)
    })
    await a.waitForTimeout(600)
    const measure = () => a.evaluate(ids => {
      const s = document.getElementById('scroll')
      const cards = ids.map(id => { const el = document.querySelector(`.mr-doc .mr-card[data-id="${CSS.escape(id)}"]`), card = viewCards().find(c => c.id === id), f = TinctMargin.firstRect(card), p = state.pages[f[0] - 1], b = p.pg.getBoundingClientRect(); const line = b.top + (f[2] + f[4] / 2) * b.height, r = el?.getBoundingClientRect(), lab = el?.querySelector('.mr-card__label')?.getBoundingClientRect(); return el && { id, top: r.top, bottom: r.bottom, rel: r.top - line, label: lab ? (lab.top + lab.bottom) / 2 : null, line, inDoc: !!el.closest('.mr-doc'), position: getComputedStyle(el).position, scrolls: [el, ...el.querySelectorAll('*')].filter(n => n.scrollHeight - n.clientHeight > 1 && /(auto|scroll)/.test(getComputedStyle(n).overflowY)).length, sh: el.scrollHeight, ch: el.clientHeight } })
      const paths = [...document.querySelectorAll('svg.mr-doc-leads path:not(.is-rule)')].map(p => p.getAttribute('d')), dots = [...document.querySelectorAll('svg.mr-doc-leads circle')].map(c => Number(c.getAttribute('cy')))
      return { cards, paths, dots, html: document.querySelector('svg.mr-doc-leads')?.innerHTML || '', scrollTop: s.scrollTop, ul: (() => { const i = document.querySelector('.mr-ul-layer i'); if (!i) return null; const probe = document.createElement('i'); probe.style.background = 'var(--mr-accent)'; document.querySelector('.mr-doc').appendChild(probe); const want = getComputedStyle(probe).backgroundColor; probe.remove(); return { bg: getComputedStyle(i).backgroundColor, want } })() }
    }, ids)
    const m0 = await measure()
    const field = await fieldLook(a, '.mr-doc .mr-card.is-open')
    ok(`${tag}: the open card's follow-up field is visible without the focus (border, placeholder "Ask a follow-up", mic and send inside)`, field && !field.focused && field.border >= 1 && field.borderColor !== 'rgba(0, 0, 0, 0)' && field.placeholder === 'Ask a follow-up' && field.phShown && field.order === 'input,mic,send' && field.sendDisabled && field.phContrast >= 4.5, field)
    ok(`${tag}: the open card's bin is in its action row beside copy`, await a.evaluate(() => { const el = document.querySelector('.mr-doc .mr-card.is-open'), d = el?.querySelector('.mr-card__acts .mr-card__delete'); return !!d && d.previousElementSibling?.classList.contains('mr-card__copy') && !el.querySelector('.mr-follow .mr-card__delete') }))
    ok(`${tag}: 9. the cards are in the page's layer (they scroll with it), never fixed to the window`, m0.cards.every(c => c && c.inDoc && c.position === 'absolute'), m0.cards)
    ok(`${tag}: 9. the open card's passage is underlined in the accent`, m0.ul && m0.ul.bg === m0.ul.want, m0.ul)
    ok(`${tag}: 9. cards close together are pushed down: none overlaps the one before`, m0.cards.every((c, i) => !i || c.top >= m0.cards[i - 1].bottom - 0.5), m0.cards.map(c => [Math.round(c.top), Math.round(c.bottom)]))
    // The first card sits at its passage: its line is straight across (y1 == y2), at the passage's line, level with its label.
    const straight = /^M(\d+) (-?\d+) H(\d+)$/.exec(m0.paths[0] || '')
    const firstDy = m0.scrollTop - (await a.evaluate(() => document.getElementById('scroll').getBoundingClientRect().top))
    ok(`${tag}: 9. a card at its passage: its leader line is straight across, at the passage's line and its label's`, straight && Math.abs(Number(straight[2]) - (m0.cards[0].line + firstDy)) <= 1 && Math.abs(m0.cards[0].label - m0.cards[0].line) <= 1, { d: m0.paths[0], line: m0.cards[0].line + firstDy, label: m0.cards[0].label })
    // A pushed card: its line leaves its passage's line across, then slants to its label (one clean elbow).
    const pushed = m0.cards.findIndex((c, i) => i && Math.abs(c.label - c.line) > 1)
    const elbow = pushed > 0 && /^M(\d+) (-?\d+) H(\d+) L(\d+) (-?\d+) H(\d+)$/.exec(m0.paths[pushed] || '')
    ok(`${tag}: 9. a pushed-down card: its line starts across at its passage's line, then one slant into its label`, pushed > 0 && elbow && Math.abs(Number(elbow[2]) - (m0.cards[pushed].line + firstDy)) <= 1 && Math.abs(Number(elbow[5]) - (m0.cards[pushed].label + firstDy)) <= 1, { pushed, d: m0.paths[pushed] })
    // Scrolling: the cards keep their places on the page, the lines are not drawn again.
    await a.evaluate(() => document.getElementById('scroll').scrollBy(0, 180)); await a.waitForTimeout(300)
    await a.evaluate(() => document.getElementById('scroll').scrollBy(0, -60)); await a.waitForTimeout(300)
    const m1 = await measure()
    ok(`${tag}: 9. scrolled, every card keeps its place against its passage (to the pixel)`, m1.scrollTop - m0.scrollTop > 100 && m1.cards.every((c, i) => Math.abs(c.rel - m0.cards[i].rel) <= 0.5), { moved: m1.scrollTop - m0.scrollTop, rel0: m0.cards.map(c => c.rel), rel1: m1.cards.map(c => c.rel) })
    ok(`${tag}: 9. scrolled, the leader lines are the same lines (fixed with the page, not drawn again)`, m1.html === m0.html && m1.paths.length === 3, { before: m0.paths, after: m1.paths })
    // 9. The open card grows in place: three follow-ups, no scrolling body; the wheel over it scrolls the page.
    for (const q of ['First follow-up?', 'Second follow-up?', 'Third follow-up?']) {
      await a.click('.mr-doc .mr-card.is-open .mr-follow__input'); await a.keyboard.type(q); await a.keyboard.press('Enter'); await a.waitForTimeout(900)
    }
    const m2 = await measure()
    ok(`${tag}: 9. after three follow-ups the open card has grown in place: no scroll of its own (scrollHeight == clientHeight)`, m2.cards[0].scrolls === 0 && Math.abs(m2.cards[0].sh - m2.cards[0].ch) <= 1 && m2.cards[0].bottom - m2.cards[0].top > m0.cards[0].bottom - m0.cards[0].top + 100, m2.cards[0])
    ok(`${tag}: 9. …and the cards below it are pushed down, none overlapping`, m2.cards.every((c, i) => !i || c.top >= m2.cards[i - 1].bottom - 0.5), m2.cards.map(c => [Math.round(c.top), Math.round(c.bottom)]))
    const box = await a.evaluate(id => { const r = document.querySelector(`.mr-doc .mr-card[data-id="${CSS.escape(id)}"]`).getBoundingClientRect(); return { x: r.left + r.width / 2, y: Math.max(r.top + 20, Math.min(r.bottom - 20, innerHeight / 2)) } }, ids[0])
    const t0 = await scrollTop(a)
    await a.mouse.move(box.x, box.y); await a.mouse.wheel(0, 300); await a.waitForTimeout(400)
    ok(`${tag}: 9. only the page scrolls: the wheel over the open card scrolls the pages`, (await scrollTop(a)) - t0 > 100, { t0, now: await scrollTop(a) })
    ok(`${tag}: no layout problems (cards in view)`, (await checkMargin(a)).length === 0, (await checkMargin(a)).slice(0, 4))
    ok(`${tag}: leader dots on their passages`, (await a.evaluate(leadersAttached)).ok, await a.evaluate(leadersAttached))
    await a.evaluate(n => document.getElementById('scroll').scrollTo(0, n), m0.scrollTop); await a.waitForTimeout(400)
    await shot(a, `${tag}-after`)
    // Before you start is at its unit's first page, part of the page too.
    await a.evaluate(() => { openCard(null); goTo({ page: 1, frac: 0 }); onScroll() }); await a.waitForTimeout(700)
    const t1 = await a.evaluate(() => { const t = document.querySelector('.mr-doc .mr-unit.is-start'); return t && { top: t.getBoundingClientRect().top, inDoc: true } })
    await a.evaluate(() => document.getElementById('scroll').scrollBy(0, 120)); await a.waitForTimeout(300)
    const t2 = await a.evaluate(() => document.querySelector('.mr-doc .mr-unit.is-start')?.getBoundingClientRect().top)
    ok(`${tag}: Before you start sits at the document's start in the page's layer and scrolls with it`, t1 && Math.abs((t1.top - t2) - 120) <= 1, { t1, t2 })
    ok(`${tag}: no page errors`, !A.problems.length, A.problems)
    await A.ctx.close()
  }
  return results
}

/* figure-race (19 Oct 2026, item 12): a prose paragraph (with inline symbols) is never boxed as a figure, even when its
   figures are looked for while its text layer is incomplete (half its lines missing, as when the items came in late)
   or while the page is being drawn again; the text there gets the selection's bar, never the figure chip. On the
   paper's figures (control) the figure is still found. FIG_PDF=<file> PAGE=<n> also checks a page of your own
   (Constructor Theory p. 5: "If a machine stops being capable of performing a task 𝔄…"). */
async function figureRace(browser, origin) {
  const results = [], ok = okList(results)
  const docs = [{ name: 'prose_book', file: LONG_BOOK, page: 3 }]
  if (process.env.FIG_PDF) docs.push({ name: basename(process.env.FIG_PDF, '.pdf'), file: process.env.FIG_PDF, page: Number(process.env.PAGE || 5) })
  for (const doc of docs) {
    const hex = addBook(doc.file), tag = `figure-race-${doc.name}`
    const A = await readerPage(browser, origin, hex, { width: 1440, height: 900, look: 'paper' })
    const a = A.page
    await a.evaluate(n => goTo({ page: n, frac: 0.2 }), doc.page); await a.waitForTimeout(1200)
    await a.waitForFunction(n => state.pages[n - 1]?.layer && state.pages[n - 1]?.canvas, doc.page, { timeout: 20000 }).catch(() => {})
    // Prose lines: body spans of 40 characters or more. A figure over any of them is wrong.
    const overProse = () => a.evaluate(n => {
      const p = state.pages[n - 1], b = p.pg.getBoundingClientRect()
      const lines = [...p.layer.querySelectorAll(':scope > span')].filter(sp => !sp.dataset.f && sp.textContent.trim().length >= 40).map(sp => { const r = sp.getBoundingClientRect(); return { x: (r.left - b.left) / b.width, y: (r.top - b.top) / b.height, w: r.width / b.width, h: r.height / b.height } })
      const hit = (f, q) => Math.min(f.x + f.w, q.x + q.w) - Math.max(f.x, q.x) > q.w * 0.5 && Math.min(f.y + f.h, q.y + q.h) - Math.max(f.y, q.y) > q.h * 0.5
      return { figures: (p.figures || []).length, over: (p.figures || []).filter(f => lines.filter(q => hit(f, q)).length >= 2).length, lines: lines.length }
    }, doc.page)
    // 1. Found while half of the layer's lines are missing (the items late): no figure over the prose.
    const partial = await a.evaluate(async n => {
      const p = state.pages[n - 1], gone = []
      const spans = [...p.layer.querySelectorAll(':scope > span')], tops = [...new Set(spans.map(sp => Math.round(sp.getBoundingClientRect().top)))]
      tops.forEach((t, i) => { if (i % 2) for (const sp of spans) if (Math.round(sp.getBoundingClientRect().top) === t) { gone.push([sp, sp.nextSibling]); sp.remove() } })
      state.figs.delete(n); p.figures = null; p.figLayer = null; await detectFigures(p)
      const found = p.figures ? p.figures.length : null
      for (const [sp, next] of gone.reverse()) p.layer.insertBefore(sp, next && next.parentElement === p.layer ? next : null)
      // Complete again: found (the next try).
      await new Promise(r => setTimeout(r, 900))
      return { removed: gone.length, found, after: (p.figures || []).length }
    }, doc.page)
    const r1 = await overProse()
    ok(`${tag}: 12. while half the text layer is missing no figures are found at all (only from the page's complete text); once complete, none over the prose`, partial.removed > 3 && partial.found === null && r1.over === 0 && r1.lines >= 5, { partial, r1 })
    // 2. Found again once the page is drawn again (the complete layer): still none over the prose.
    await a.evaluate(() => setZoom(state.zoom * 1.1, { quick: true })); await a.waitForTimeout(1600)
    const r2 = await overProse()
    ok(`${tag}: 12. found again on the redrawn page (complete text): none over the prose`, r2.over === 0, r2)
    // 3. The pointer over the paragraph and a selection in it: the selection's bar, never the figure chip.
    const pt = await a.evaluate(n => { const sp = [...state.pages[n - 1].layer.querySelectorAll(':scope > span')].filter(s => !s.dataset.f && s.textContent.trim().length >= 40).find(s => { const r = s.getBoundingClientRect(); return r.top > 150 && r.bottom < innerHeight - 150 }); const r = sp.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 } }, doc.page)
    await a.mouse.move(pt.x, pt.y); await a.mouse.move(pt.x + 5, pt.y); await a.waitForTimeout(400)
    const chip = await a.evaluate(() => !!document.querySelector('.byob-hot'))
    await a.mouse.dblclick(pt.x, pt.y); await a.waitForTimeout(700)
    // (One word on the wide column opens Define's card instead of a pop-over since 19 Oct 2026, evening.)
    const bar = await a.evaluate(() => ({ bar: !!document.querySelector('.mr-float.mr-bar, .mr-float .mr-bar__item, .mr-define') || !!cardById(col.open || '')?.kind?.startsWith('define') || !!col.draft, chip: !!document.querySelector('.byob-hot') }))
    ok(`${tag}: 12. over the paragraph no figure box or chip; a selection there gets the selection's bar`, !chip && bar.bar && !bar.chip, { chip, ...bar })
    await shot(a, tag)
    ok(`${tag}: no page errors`, !A.problems.length, A.problems)
    await A.ctx.close()
  }
  // Control: the figure paper's figures are still found (the prose rule takes no real figure away).
  const F = await readerPage(browser, origin, addBook(FIGURE_PAPER), { width: 1440, height: 900, look: 'paper', minSpans: 5 })
  await F.page.waitForFunction(() => state.pages[0]?.figures, null, { timeout: 15000 }).catch(() => {})
  const figs = await F.page.evaluate(() => (state.pages[0].figures || []).length)
  ok('figure-race: the figure paper\'s first page still has its figures', figs >= 1, figs)
  await F.ctx.close()
  return results
}

/* The follow-up field as drawn, unfocused: its box's border and radius, the placeholder (and its contrast on the
   field), the order of the field, the mic and send inside the box, and send's look. */
function fieldLook(a, sel) {
  return a.evaluate(sel => {
    const el = document.querySelector(sel), box = el?.querySelector('.mr-follow__box'), f = box?.querySelector('.mr-follow__input'), send = box?.querySelector('.mr-follow__send'), mic = box?.querySelector('.mr-follow__mic')
    if (!box || !f || !send) return null
    const cs = getComputedStyle(box), r = box.getBoundingClientRect(), ph = getComputedStyle(f, '::placeholder'), ss = getComputedStyle(send)
    const rgb = c => { const m = /rgba?\(([^)]+)\)/.exec(c); if (!m) return null; const v = m[1].split(/[ ,/]+/).filter(Boolean).map(Number); return { r: v[0], g: v[1], b: v[2], a: v.length > 3 ? v[3] : 1 } }
    const lum = c => [c.r, c.g, c.b].map(x => { x /= 255; return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4 }).reduce((s, x, i) => s + x * [0.2126, 0.7152, 0.0722][i], 0)
    // The field's background, over the card's when it is not opaque.
    let bg = rgb(cs.backgroundColor); if (!bg || bg.a < 1) { const c = rgb(getComputedStyle(el).backgroundColor); bg = bg && c ? { r: bg.r * bg.a + c.r * (1 - bg.a), g: bg.g * bg.a + c.g * (1 - bg.a), b: bg.b * bg.a + c.b * (1 - bg.a), a: 1 } : c }
    let fg = rgb(ph.color); if (fg && bg && fg.a < 1) fg = { r: fg.r * fg.a + bg.r * (1 - fg.a), g: fg.g * fg.a + bg.g * (1 - fg.a), b: fg.b * fg.a + bg.b * (1 - fg.a), a: 1 }
    const L1 = fg && bg ? lum(fg) : 0, L2 = bg ? lum(bg) : 0
    const order = [...box.querySelectorAll('.mr-follow__input, .mr-follow__mic, .mr-follow__send')].map(n => n.classList.contains('mr-follow__input') ? 'input' : n.classList.contains('mr-follow__mic') ? 'mic' : 'send').join(',')
    const mr = mic?.getBoundingClientRect(), sr = send.getBoundingClientRect()
    return {
      focused: document.activeElement === f, border: parseFloat(cs.borderTopWidth), borderColor: cs.borderTopColor, radius: parseFloat(cs.borderTopLeftRadius), w: r.width, h: r.height,
      placeholder: f.getAttribute('placeholder'), phShown: !f.value && f.matches(':placeholder-shown'), phColor: ph.color, bg: cs.backgroundColor, phContrast: Math.round(((Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05)) * 100) / 100,
      order, micInside: !!mr && mr.left >= r.left && mr.right <= sr.left + 1 && sr.right <= r.right, sendDisabled: send.disabled, sendFill: ss.backgroundColor, sendOpacity: Number(ss.opacity), sendW: sr.width, arrow: !!send.querySelector('svg path[d^="M9 14V4"]'),
      font: getComputedStyle(f).fontFamily, caps: getComputedStyle(f, '::placeholder').textTransform,
    }
  }, sel)
}

/* cards-gloss (19 Oct 2026, items 13 and 14): a card's top-right control minimises it (folds it, nothing deleted); its
   bin is in the follow-up line beside the mic and deletes the card and its saved answer (with Undo); the card does
   not quote its passage (screen readers get it as its description); a one-sentence answer is in regular weight. */
async function cardsGloss(browser, origin) {
  const results = [], ok = okList(results)
  const hex = addBook(PDFS[0])
  for (const [width, height] of [[1440, 900], [390, 844]]) {
    const tag = `cards-gloss-${width}x${height}`, phone = width < 700
    const A = await readerPage(browser, origin, hex, { width, height, look: 'paper', startPage: 3 })
    const a = A.page
    await prefetchSettled(a)
    mock.next = 'One sentence of a simpler wording of the passage.'
    await selectText(a); await a.waitForSelector('.mr-float [data-m="simplify"]', { timeout: 5000 }).catch(() => {})
    await a.click('.mr-float [data-m="simplify"]').catch(() => {}); await a.waitForTimeout(1300)
    const host = phone ? '.mr-sheet' : '.mr-card.is-open'
    const look = await a.evaluate(sel => { const el = document.querySelector(sel); if (!el) return null; const close = el.querySelector('.mr-card__close'), del = el.querySelector('.mr-card__delete'), copy = el.querySelector('.mr-card__acts .mr-card__copy'), about = el.querySelector('.mr-card__about'); return { close: close && [close.getAttribute('aria-label'), close.textContent.trim(), !!close.querySelector('svg path')], delInFollow: !!del?.closest('.mr-follow'), besideCopy: !!del && !!copy && copy.nextElementSibling === del, inActs: !!el.querySelector('.mr-card__acts .mr-card__delete'), copy: !!copy, quote: !!el.querySelector('.mr-quote'), described: el.getAttribute('aria-describedby') && document.getElementById(el.getAttribute('aria-describedby'))?.textContent.length > 5, bold: el.querySelectorAll('.mr-answer .is-bottom-line').length, answer: el.querySelector('.mr-answer')?.textContent.trim() } }, host)
    // The phone's bottom card has no minimise (20 Oct 2026): a drag down or a tap outside it closes it.
    if (phone) ok(`${tag}: 13. the phone's bottom card has no minimise`, look && !look.close, look)
    else ok(`${tag}: 13. the top-right control is "Minimise", one line, no ×`, look && look.close?.[0] === 'Minimise' && look.close[1] === '' && look.close[2], look)
    ok(`${tag}: 13. the bin is in the action row under the answer, beside copy; none in the follow-up field`, look && look.inActs && look.besideCopy && !look.delInFollow && look.copy, look)
    // The follow-up field (Anders, 19 Oct 2026: "it's too hidden that this is indeed a chat field"): seen without focusing it.
    const field = await fieldLook(a, host)
    ok(`${tag}: the follow-up field is visible without the focus: a non-zero border, rounded, the placeholder "Ask a follow-up"`, field && !field.focused && field.border >= 1 && field.borderColor !== 'rgba(0, 0, 0, 0)' && field.radius >= 8 && field.placeholder === 'Ask a follow-up' && field.phShown && field.w > 150 && field.h >= 36, field)
    ok(`${tag}: the mic is inside the field on its right, then send (an up-arrow in a filled square, off while empty)`, field && field.micInside && field.order === 'input,mic,send' && field.sendDisabled && field.sendFill !== 'rgba(0, 0, 0, 0)' && field.sendOpacity < 0.6 && field.arrow && field.sendW >= 27.5, field)
    ok(`${tag}: the placeholder is legible on the field (at least 4.5:1)`, field && field.phContrast >= 4.5, field && { ph: field.phColor, bg: field.bg, ratio: field.phContrast })
    // Typing turns send on; the button sends as Enter does (and the field empties).
    mock.next = 'MOCK FOLLOW-UP. A short reply.'
    await a.click(`${host} .mr-follow__input`); await a.keyboard.type('And then?')
    const armed = await a.evaluate(sel => { const s = document.querySelector(`${sel} .mr-follow__send`); return s && { disabled: s.disabled, opacity: Number(getComputedStyle(s).opacity) } }, host)
    ok(`${tag}: with text in the field, send is on`, armed && !armed.disabled && armed.opacity > 0.9, armed)
    await a.click(`${host} .mr-follow__send`); await a.waitForTimeout(1200)
    const sent = await a.evaluate(sel => { const el = document.querySelector(sel); return el && { asked: [...el.querySelectorAll('.mr-you')].some(n => n.textContent.includes('And then?')), field: el.querySelector('.mr-follow__input')?.value, disabled: el.querySelector('.mr-follow__send')?.disabled } }, host)
    ok(`${tag}: the send button sends the follow-up and empties the field`, sent && sent.asked && sent.field === '' && sent.disabled, sent)
    await a.click(`${host} .mr-follow__input`); await a.keyboard.type('Once more?'); await a.keyboard.press('Enter'); await a.waitForTimeout(1200)
    const entered = await a.evaluate(sel => [...document.querySelectorAll(`${sel} .mr-you`)].some(n => n.textContent.includes('Once more?')), host)
    ok(`${tag}: Enter sends the follow-up`, entered, entered)
    // The card in paper and night (the field's border and placeholder in each look's colours).
    await a.evaluate(() => document.activeElement?.blur())
    if (!phone) for (const look of ['paper', 'night']) {
      await a.evaluate(t => setTheme(t), look === 'night' ? 'dark' : 'light'); await a.waitForTimeout(700)
      const f = await fieldLook(a, host)
      ok(`${tag}: in ${look}, the field is seen unfocused and its placeholder is legible`, f && f.border >= 1 && f.borderColor !== 'rgba(0, 0, 0, 0)' && f.phShown && f.phContrast >= 4.5, f)
      await shot(a, `${tag}-${look}-card`)
    }
    if (!phone) { await a.evaluate(() => setTheme('light')); await a.waitForTimeout(500) }
    ok(`${tag}: 14. the card does not quote its passage; screen readers have it as the card's description`, look && !look.quote && look.described, look)
    ok(`${tag}: 13. a one-sentence answer is in regular weight (no bold lead)`, look && look.bold === 0 && /^One sentence/.test(look.answer || ''), look)
    // Minimise folds it; the answer is kept.
    const id = await a.evaluate(() => col.open)
    if (phone) await a.mouse.click(200, 120); else await a.click(`${host} .mr-card__close`)
    await a.waitForTimeout(300)
    const folded = await a.evaluate(id => ({ open: col.open, kept: (store.get('cards:' + state.key) || []).some(c => c.id === id && !c.gone && c.turns?.length) }), id)
    ok(`${tag}: 13. ${phone ? 'a tap outside closes the card' : 'Minimise folds the card'}; its answer is kept`, !folded.open && folded.kept, folded)
    // The bin deletes it and its saved answer (Undo offered).
    await a.evaluate(id => openCard(id), id); await a.waitForTimeout(400)
    await a.click(`${host} .mr-card__acts .mr-card__delete`); await a.waitForTimeout(400)
    const gone = await a.evaluate(id => ({ open: col.open, stored: (store.get('cards:' + state.key) || []).find(c => c.id === id), undo: !!document.querySelector('.mr-undo:not([hidden])'), shown: !!document.querySelector(`.mr-card[data-id="${id}"]`) }), id)
    ok(`${tag}: 13. the bin in the action row deletes the card and its saved answer (Undo offered)`, !gone.open && gone.stored?.gone === true && !gone.stored.turns?.length && gone.undo && !gone.shown, gone)
    ok(`${tag}: no page errors`, !A.problems.length, A.problems)
    await A.ctx.close()
  }
  return results
}

/* pause-dots (19 Oct 2026, evening, item 11): a card still waiting for more of its answer after words have appeared
   (Fact-check's search, Counterpoint, a follow-up) shows the main chat's dots below its last text until more text
   arrives or the request ends, including on error; Minimise shows its focus ring for the keyboard only. */
async function pauseDots(browser, origin) {
  const results = [], ok = okList(results)
  const hex = addBook(PDFS[0])
  const A = await readerPage(browser, origin, hex, { width: 1440, height: 900, look: 'paper', startPage: 3 })
  const a = A.page
  await prefetchSettled(a)
  const look = () => a.evaluate(() => { const el = document.querySelector('.mr-card.is-open'); if (!el) return null; const dots = el.querySelector('.tc-wait'), answers = [...el.querySelectorAll('.mr-answer')], last = answers.at(-1); return { dots: !!dots, below: !!dots && !!last && dots.getBoundingClientRect().top >= last.getBoundingClientRect().bottom - 1, text: last?.innerText.trim() || '' } })
  for (const intent of ['counterpoint', 'follow-up']) {
    if (intent === 'follow-up') {
      mock.next = 'MOCK first answer. Short.'
      await selectText(a); await a.waitForSelector('.mr-float [data-m="explain"]', { timeout: 5000 }).catch(() => {})
      await a.click('.mr-float [data-m="explain"]'); await a.waitForTimeout(900)
    }
    mock.chunks = [{ text: 'MOCK first words of the answer.' }, { text: ' MOCK the rest after a pause.', wait: 2200 }]
    if (intent === 'counterpoint') {
      await selectText(a); await a.waitForSelector('.mr-float [data-m="more"]', { timeout: 5000 }).catch(() => {})
      await a.click('.mr-float [data-m="more"]'); await a.click('.mr-more [data-m="counterpoint"]')
    } else { await a.click('.mr-card.is-open .mr-follow__input'); await a.keyboard.type('And then?'); await a.keyboard.press('Enter') }
    await a.waitForTimeout(250)
    const early = await look()
    await a.waitForTimeout(1000)
    const paused = await look()
    ok(`11. ${intent}: while words are still coming, no dots; once they pause, the main chat's dots below the last text`, early && !early.dots && /MOCK first words/.test(early.text) && paused && paused.dots && paused.below, { early, paused })
    await a.waitForTimeout(1500)
    const done = await look()
    ok(`11. ${intent}: more text arrives and the request ends: the dots go`, done && !done.dots && /MOCK the rest/.test(done.text), done)
    await a.keyboard.press('Escape'); await a.evaluate(() => { openCard(null); getSelection().removeAllRanges() }); await a.waitForTimeout(300)
  }
  // An error after words: the dots go with the request.
  mock.chunks = [{ text: 'MOCK words before a failure.' }, { text: '', wait: 1600 }]; mock.chunksFail = true
  await selectText(a); await a.waitForSelector('.mr-float [data-m="explain"]', { timeout: 5000 }).catch(() => {})
  await a.click('.mr-float [data-m="explain"]'); await a.waitForTimeout(1100)
  const failing = await look()
  await a.waitForTimeout(1200)
  const failed = await a.evaluate(() => { const el = document.querySelector('.mr-card.is-open'); return el && { dots: !!el.querySelector('.tc-wait'), status: el.querySelector('.mr-status')?.textContent || '' } })
  ok('11. an answer that pauses and then fails: the dots show in the pause and go on the error', failing?.dots && failed && !failed.dots && failed.status.length > 0, { failing, failed })
  await a.keyboard.press('Escape'); await a.evaluate(() => { openCard(null); getSelection().removeAllRanges() }); await a.waitForTimeout(300)
  // Minimise: no focus ring after a click (the card opened from the bar puts the focus there), one from the keyboard.
  mock.next = 'MOCK ANSWER. Short.'
  await selectText(a); await a.waitForSelector('.mr-float [data-m="explain"]', { timeout: 5000 }).catch(() => {})
  await a.click('.mr-float [data-m="explain"]'); await a.waitForTimeout(900)
  const ring = () => a.evaluate(() => { const b = document.activeElement; return { cls: b?.className || '', outline: b ? getComputedStyle(b).outlineStyle : '' } })
  const clicked = await ring()
  ok('11. after a click, the card\'s focused Minimise shows no focus ring', /mr-card__close/.test(clicked.cls) ? clicked.outline === 'none' : true, clicked)
  await a.click('.mr-card.is-open .mr-card__copy').catch(() => {}); await a.waitForTimeout(200)
  const copyClick = await ring()
  ok('11. after a click on copy, no focus ring on it', copyClick.outline === 'none' || !/mr-card__copy/.test(copyClick.cls), copyClick)
  await a.evaluate(() => document.querySelector('.mr-card.is-open .mr-card__close')?.focus()); await a.keyboard.press('Shift'); await a.keyboard.press('Tab'); await a.keyboard.down('Shift'); await a.keyboard.press('Tab'); await a.keyboard.up('Shift')
  const keyed = await ring()
  ok('11. from the keyboard the focused button shows its ring', keyed.outline !== 'none' && keyed.cls.length > 0, keyed)
  await shot(a, 'pause-dots-1440x900')
  ok('no page errors', !A.problems.length, A.problems)
  await A.ctx.close()
  return results
}

/* passage-mark (19 Oct 2026, evening, item 10): the open card's passage is underlined just under each line's own
   baseline (0.08 to 0.18 of its size), never into the next line's words; a highlight's tint and the "Highlight"
   passage mark keep to their lines, never over a neighbour's words, even at tight line spacing (leading 1.05); the
   Aa panel's "Passage mark" (Underline, Highlight, Off) is kept on this device across a reload. */
const TIGHT_PDF = join(OUT, 'tight_leading.pdf')
writeFileSync(TIGHT_PDF, makePdf({ info: { Title: 'Tight leading' }, pages: [1, 2].map(n => ({ lines: prose(740, 56, { size: 11, from: n * 40 }).map((l, i) => ({ ...l, y: 740 - i * 11.5 })) })) }))
async function passageMark(browser, origin) {
  const results = [], ok = okList(results)
  // Each mark against its page's lines (reader.js pageLines): its own line, the offset under the baseline, the neighbours' glyphs.
  const marks = page => page.evaluate(() => {
    const out = []
    for (const p of state.pages) {
      const lines = pageLines(p) || [], b = p.pg.getBoundingClientRect()
      const glyph = l => [l.b - l.s * 0.72, l.b + l.s * 0.2]
      for (const [sel, kind] of [['.mr-ul-layer i:not(.is-box)', 'mark'], ['.hl-layer i', 'highlight']]) for (const i of p.pg.querySelectorAll(sel)) {
        const r = i.getBoundingClientRect(), top = (r.top - b.top) / b.height, bottom = (r.bottom - b.top) / b.height, x0 = (r.left - b.left) / b.width, x1 = (r.right - b.left) / b.width
        const across = lines.filter(l => l.x0 < x1 && l.x1 > x0)
        const tint = kind === 'highlight' || i.classList.contains('is-tint')
        const own = tint ? across.reduce((a, l) => (!a || Math.abs(l.b - l.s * 0.3 - (top + bottom) / 2) < Math.abs(a.b - a.s * 0.3 - (top + bottom) / 2) ? l : a), null) : across.filter(l => l.b <= top + 0.0005).at(-1)
        if (!own) { out.push({ kind, lost: true }); continue }
        const hits = across.filter(l => l !== own && Math.min(bottom, glyph(l)[1]) - Math.max(top, glyph(l)[0]) > 0.0002).length
        out.push({ kind: tint ? (kind === 'highlight' ? 'highlight' : 'tint') : 'underline', offset: +((top - own.b) / own.s).toFixed(3), hits, height: +((r.bottom - r.top)).toFixed(2) })
      }
    }
    return out
  })
  const openOn = async (a, kind = 'explain') => {
    await a.evaluate(() => getSelection().removeAllRanges())
    await selectText(a); await a.waitForSelector(`.mr-float [data-m="${kind}"]`, { timeout: 5000 }).catch(() => {})
    await a.click(`.mr-float [data-m="${kind}"]`); await a.waitForTimeout(1200)
  }
  for (const [file, label] of [[PDFS[0], 'prose'], [TIGHT_PDF, 'tight']]) {
    const hex = addBook(file)
    const A = await readerPage(browser, origin, hex, { width: 1440, height: 900, look: 'paper', startPage: label === 'prose' ? 3 : 1 })
    const a = A.page
    await prefetchSettled(a)
    await openOn(a)
    const u = (await marks(a)).filter(m => m.kind === 'underline')
    ok(`10. ${label}: the open card's passage is underlined under each line's own baseline (0.08–0.18 of its size), never into the next line`, u.length >= 2 && u.every(m => m.offset >= (label === 'tight' ? 0.04 : 0.08) && m.offset <= 0.18 && m.hits === 0 && Math.abs(m.height - 1.5) < 0.6), u)
    if (label === 'prose') await shot(a, 'passage-underline-1440x900')
    // A highlight on the same lines: its tint on its own lines only.
    await a.keyboard.press('Escape'); await a.evaluate(() => openCard(null)); await a.waitForTimeout(200)
    await a.evaluate(() => getSelection().removeAllRanges()); await selectText(a); await a.waitForSelector('.mr-float [data-m="dot"]', { timeout: 5000 }).catch(() => {})
    await a.click('.mr-float [data-m="dot"]'); await a.waitForTimeout(400)
    const h = (await marks(a)).filter(m => m.kind === 'highlight')
    ok(`10. ${label}: a highlight's tint never covers a neighbouring line's words`, h.length >= 2 && h.every(m => m.hits === 0), h)
    await a.keyboard.press('Escape'); await a.evaluate(() => getSelection().removeAllRanges())
    // The Aa panel: Passage mark → Highlight (a soft tint of each line's band), then Off.
    await openOn(a)
    await a.click('#aaBtn'); await a.waitForSelector('#passageMarkSel', { timeout: 4000 }).catch(() => {})
    const row = await a.evaluate(() => { const s = document.querySelector('#passageMarkSel'); return s && { value: s.value, options: [...s.options].map(o => o.textContent), label: s.closest('.lab-v2-row')?.querySelector('.lab-v2-row-label')?.textContent } })
    ok(`10. ${label}: the Aa panel has "Passage mark": Underline (default), Highlight, Off`, row && row.value === 'underline' && row.options.join('|') === 'Underline|Highlight|Off' && row.label === 'Passage mark', row)
    await a.selectOption('#passageMarkSel', 'tint'); await a.waitForTimeout(400)
    const t = (await marks(a)).filter(m => m.kind === 'tint')
    ok(`10. ${label}: Highlight marks the passage with a soft tint on each line, never over a neighbour's words`, t.length >= 2 && t.every(m => m.hits === 0) && !(await marks(a)).some(m => m.kind === 'underline'), t)
    await a.selectOption('#passageMarkSel', 'off'); await a.waitForTimeout(400)
    ok(`10. ${label}: Off marks nothing`, !(await marks(a)).some(m => m.kind === 'underline' || m.kind === 'tint'), await marks(a))
    if (label === 'prose') {
      await a.reload(); await a.waitForFunction(() => document.querySelectorAll('.pdf-sheet .text-layer span').length > 20, null, { timeout: 30000 }); await a.waitForTimeout(800)
      const kept = await a.evaluate(() => passageMark())
      ok('10. the choice is kept on this device across a reload', kept === 'off', kept)
      await a.evaluate(() => { prefs.passageMark = 'underline'; savePrefs() })
    }
    ok(`${label}: no page errors`, !A.problems.length, A.problems)
    await A.ctx.close()
  }
  return results
}

/* stray-menu (19 Oct 2026, evening, item 4): the selection bar opens only right after a deliberate selection: a mouse
   drag let go, a double-click, selection keys ending on a new selection, or a click on a highlight. A selection
   restored on a tab's refocus, one left over when a card folds, or one set by code never opens it. */
async function strayMenu(browser, origin) {
  const results = [], ok = okList(results)
  const hex = addBook(PDFS[0])
  const A = await readerPage(browser, origin, hex, { width: 1440, height: 900, look: 'paper', startPage: 3 })
  const a = A.page
  await prefetchSettled(a)
  const bar = () => a.evaluate(() => !!document.querySelector('.mr-float.mr-bar, .mr-float.mr-define'))
  const spanBox = () => a.evaluate(() => { const sp = [...document.querySelectorAll('.pdf-sheet .text-layer span:not([data-f])')].filter(s => { const r = s.getBoundingClientRect(); return r.top > 200 && r.bottom < innerHeight - 200 && s.textContent.trim().split(/\s+/).length > 5 })[2]; const r = sp.getBoundingClientRect(); return { x0: r.left + 2, x1: r.left + r.width * 0.6, y: r.top + r.height / 2 } })
  const setByCode = () => a.evaluate(() => { const sp = [...document.querySelectorAll('.pdf-sheet .text-layer span:not([data-f])')].filter(s => { const r = s.getBoundingClientRect(); return r.top > 200 && r.bottom < innerHeight - 200 && s.textContent.trim().split(/\s+/).length > 5 })[4]; getSelection().setBaseAndExtent(sp.firstChild, 0, sp.firstChild, Math.min(20, sp.firstChild.length)) })
  const reset = async () => { await a.keyboard.press('Escape'); await a.keyboard.press('Escape'); await a.evaluate(() => { openCard(null); getSelection().removeAllRanges() }); await a.waitForTimeout(400) }
  // Set by code alone: no bar.
  await setByCode(); await a.waitForTimeout(700)
  ok('4. a selection set by code (no gesture) opens no bar', !(await bar()))
  await reset()
  // A mouse drag let go: the bar.
  const b = await spanBox()
  await a.mouse.move(b.x0, b.y); await a.mouse.down(); await a.mouse.move(b.x1, b.y, { steps: 6 }); await a.mouse.up(); await a.waitForTimeout(500)
  ok('4. a mouse drag let go on a new selection opens the bar', await bar())
  await a.screenshot({ path: join(OUT, 'stray-menu-drag.png') })
  await reset()
  // Selection keys ending on a new selection: the bar.
  await a.evaluate(() => { const sp = [...document.querySelectorAll('.pdf-sheet .text-layer span:not([data-f])')].filter(s => { const r = s.getBoundingClientRect(); return r.top > 200 && r.bottom < innerHeight - 200 && s.textContent.trim().split(/\s+/).length > 5 })[3]; getSelection().setBaseAndExtent(sp.firstChild, 0, sp.firstChild, 1) })
  await a.waitForTimeout(500)
  ok('4. (a one-letter selection set by code opens none)', !(await bar()))
  for (let k = 0; k < 12; k++) await a.keyboard.press('Shift+ArrowRight')
  await a.waitForTimeout(500)
  // (Its first key ends inside a word: snapped to the whole word (item 8), which on the wide column opens Define's card (item 7).)
  ok('4. selection keys ending on a new selection open the bar (or, for one word, Define\'s card)', await bar() || await a.evaluate(() => cardById(col.open || '')?.kind === 'define' || col.draft?.kind === 'define'), await a.evaluate(() => getSelection().toString()))
  await reset()
  // The tab hidden and shown again with a selection left: no bar.
  await setByCode()
  await a.evaluate(() => { Object.defineProperty(document, 'visibilityState', { value: 'hidden', configurable: true }); document.dispatchEvent(new Event('visibilitychange')); Object.defineProperty(document, 'visibilityState', { value: 'visible', configurable: true }); document.dispatchEvent(new Event('visibilitychange')); window.dispatchEvent(new Event('focus')); document.dispatchEvent(new Event('selectionchange')) })
  await a.waitForTimeout(700)
  ok('4. a selection restored on a tab\'s refocus opens no bar', !(await bar()))
  await reset()
  // A card folded by a click outside, a selection left over: no bar.
  mock.next = 'MOCK ANSWER. Short.'
  await selectText(a); await a.waitForSelector('.mr-float [data-m="explain"]', { timeout: 5000 }).catch(() => {})
  await a.click('.mr-float [data-m="explain"]'); await a.waitForTimeout(900)
  await a.mouse.click(30, 600); await a.waitForTimeout(200)
  await setByCode(); await a.evaluate(() => document.dispatchEvent(new Event('selectionchange'))); await a.waitForTimeout(700)
  ok('4. a card folded, a selection left over: no bar', !(await bar()) && !(await a.evaluate(() => col.open)))
  await reset()
  // A click on a highlight: the bar.
  await selectText(a); await a.waitForSelector('.mr-float [data-m="dot"]', { timeout: 5000 }).catch(() => {})
  await a.click('.mr-float [data-m="dot"]'); await a.waitForTimeout(300); await reset()
  const hl = await a.evaluate(() => { const i = document.querySelector('.hl-layer i'); const r = i.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 } })
  await a.mouse.click(hl.x, hl.y); await a.waitForTimeout(500)
  ok('4. a click on a highlight opens its bar', await bar())
  ok('no page errors', !A.problems.length, A.problems)
  await A.ctx.close()
  return results
}

/* whole-words (19 Oct 2026, evening, item 8): a line's or a page's first letter as an item of its own ("S" | "ection",
   as pdf.js gives a drop cap or a kerned capital): a double-click on "ection" and a drag from inside it select, quote and
   highlight "Section"; a highlight kept from "ection" is re-snapped to "Section" once its page is drawn (its words are
   on the page once and the letter touches them), one whose words are not there unchanged. */
const SPLIT_WORDS = 'ection 2 describes the method in detail, and the appendix lists every measured case.'
const SPLIT_PDF = join(OUT, 'split_word.pdf')
writeFileSync(SPLIT_PDF, makePdf({ info: { Title: 'Split words' }, pages: [1, 2].map(n => ({ lines: [{ x: 72, y: 740, size: 14, text: 'S' }, { x: 72 + 7.784, y: 740, size: 11, text: SPLIT_WORDS }, ...prose(722, 40, { size: 11, from: n * 30 })] })) }))
async function wholeWords(browser, origin) {
  const results = [], ok = okList(results)
  const hex = addBook(SPLIT_PDF)
  const A = await readerPage(browser, origin, hex, { width: 1440, height: 900, look: 'paper', startPage: 2 })
  const a = A.page
  await prefetchSettled(a)
  await a.evaluate(() => goTo({ page: 2, frac: 0 })); await a.waitForTimeout(900)
  const ection = () => a.evaluate(() => { const sp = [...state.pages[1].layer.querySelectorAll('span')].find(s => s.textContent.startsWith('ection')); const r = document.createRange(); r.setStart(sp.firstChild, 2); r.setEnd(sp.firstChild, 3); const b = r.getBoundingClientRect(); const r2 = document.createRange(); r2.setStart(sp.firstChild, 14); r2.setEnd(sp.firstChild, 15); const e = r2.getBoundingClientRect(); return { x: b.left + b.width / 2, y: b.top + b.height / 2, x2: e.left + e.width / 2, sLeft: sp.previousElementSibling ? sp.previousElementSibling.getBoundingClientRect().left : null, pageLeft: state.pages[1].pg.getBoundingClientRect().left, pageWidth: state.pages[1].pg.getBoundingClientRect().width } })
  const at = await ection().catch(async e => ({ error: String(e.message).slice(0, 200), spans: await a.evaluate(() => [...(state.pages[1]?.layer?.querySelectorAll('span') || [])].slice(0, 4).map(s => s.textContent)) }))
  ok('8. (the fixture: "S" and "ection" are two items, touching)', at.sLeft != null, at)
  // Double-click inside "ection".
  await a.mouse.dblclick(at.x, at.y); await a.waitForTimeout(700)
  // On the wide column Define opens as a card (item 7): its label names the word.
  const dbl = await a.evaluate(() => ({ sel: getSelection().toString().trim(), word: mr?.word || null, info: mr?.info?.text || null, card: document.querySelector('.mr-doc .mr-card.is-open .mr-card__name')?.textContent || null }))
  ok('8. a double-click on a line\'s first word split in two selects and defines the whole word ("Section")', /^Define · section$/i.test(dbl.card || '') || (dbl.sel === 'Section' && (dbl.word === 'Section' || dbl.info === 'Section')), dbl)
  await a.keyboard.press('Escape'); await a.keyboard.press('Escape'); await a.evaluate(() => getSelection().removeAllRanges()); await a.waitForTimeout(300)
  // A drag from inside "ection" to the line's later words, then a highlight.
  await a.mouse.move(at.x, at.y); await a.mouse.down(); await a.mouse.move(at.x2, at.y, { steps: 8 }); await a.mouse.up(); await a.waitForTimeout(600)
  const drag = await a.evaluate(() => ({ sel: getSelection().toString().replace(/\s+/g, ' ').trim(), info: mr?.info?.text || null }))
  ok('8. a drag starting inside the split word quotes it whole ("Section 2 …")', /^Section 2/.test(drag.info || drag.sel), drag)
  await a.click('.mr-float [data-m="dot"]').catch(() => {}); await a.waitForTimeout(400)
  const made = await a.evaluate(() => { const h = highlights().at(-1), b = state.pages[1].pg.getBoundingClientRect(); return h && { text: h.text, x: h.rects[0][0] * b.width + b.left } })
  ok('8. its highlight starts at "S" and quotes "Section …"', made && /^Section 2/.test(made.text) && made.x <= at.sLeft + 1.5, { made, sLeft: at.sLeft })
  await shot(a, 'whole-words-1440x900')
  // A highlight kept from "ection" (before), and one whose words are not on the page: reloaded.
  await a.keyboard.press('Escape'); await a.evaluate(() => getSelection().removeAllRanges())
  await a.evaluate(([words]) => {
    const p = state.pages[1], b = p.pg.getBoundingClientRect(), sp = [...p.layer.querySelectorAll('span')].find(s => s.textContent.startsWith('ection')), r = sp.getBoundingClientRect()
    const box = [(r.left - b.left) / b.width, (r.top - b.top) / b.height, (r.width * 0.4) / b.width, r.height / b.height].map(v => Math.round(v * 10000) / 10000)
    const at = Date.now() - 86400e3
    store.set('hl:' + state.key, [{ id: 'oldsplit1', page: 2, rects: [box], text: words.slice(0, 18), color: 'gold', at, u: at }, { id: 'oldother1', page: 2, rects: [box], text: 'ection words that are nowhere here', color: 'sage', at, u: at }])
  }, [SPLIT_WORDS])
  await a.reload(); await a.waitForFunction(() => state.pages[1]?.layer, null, { timeout: 30000 }); await a.evaluate(() => goTo({ page: 2, frac: 0 })); await a.waitForTimeout(1500)
  const kept = await a.evaluate(() => { const b = state.pages[1].pg.getBoundingClientRect(), hs = highlights(); const one = hs.find(h => h.id === 'oldsplit1'), two = hs.find(h => h.id === 'oldother1'); const s = [...state.pages[1].layer.querySelectorAll('span')].find(x => x.textContent === 'S').getBoundingClientRect(); return { one: one && { text: one.text, x: one.rects[0][0] * b.width + b.left }, two: two && { text: two.text, x: two.rects[0][0] * b.width + b.left }, sLeft: s.left } })
  ok('8. an old highlight from "ection" is re-snapped on load: "Section …", its box from the "S"', kept.one && kept.one.text.startsWith('Section 2 describes') && Math.abs(kept.one.x - kept.sLeft) < 1.5, kept)
  ok('8. one whose words are not on the page is left as it was (never moved onto other words)', kept.two && kept.two.text === 'ection words that are nowhere here' && kept.two.x > kept.sLeft + 3, kept)
  ok('no page errors', !A.problems.length, A.problems)
  await A.ctx.close()
  return results
}

/* primer-top (19 Oct 2026, evening, item 9): Before you start, and the document's start mark (pills before 19 Oct, night), sit at the top of the
   document's first page, also when that page is a cover drawn as one picture (Possible Minds; here with one line of text
   at its foot); before, they stood at the page's first line of text, about 800 px down. Opened, the primer starts there too. */
const COVER_PDF = join(OUT, 'image_cover.pdf')
writeFileSync(COVER_PDF, makePdf({ info: { Title: 'Image cover' }, pages: [{ images: [{ x: 0, y: 0, w: 612, h: 792, pw: 64, ph: 82, noise: 7 }], lines: [{ x: 250, y: 46, size: 10, text: 'A cover drawn as one picture' }] }, ...[1, 2, 3].map(n => ({ lines: prose(720, 40, { size: 11, from: n * 30 }) }))] }))
async function primerTop(browser, origin) {
  const results = [], ok = okList(results)
  const hex = addBook(COVER_PDF)
  const A = await readerPage(browser, origin, hex, { width: 1440, height: 900, look: 'paper', at: 1 }).catch(e => ({ error: e }))
  if (A.error) { ok('primer-top: the cover PDF opens', false, String(A.error.message).slice(0, 200)); return results }
  const a = A.page
  await prefetchSettled(a)
  await a.evaluate(() => goTo({ page: 1, frac: 0 })); await a.waitForTimeout(900)
  await a.waitForSelector('.mr-doc .mr-trigger, .mr-doc .mr-unit.is-start', { timeout: 10000 }).catch(() => {})
  const where = sel => a.evaluate(sel => { const el = document.querySelector(sel), pg = state.pages[0].pg.getBoundingClientRect(); return el && { top: Math.round(el.getBoundingClientRect().top - pg.top), page: Math.round(pg.height) } }, sel)
  const start = await where('.mr-doc .mr-unit.is-start, .mr-doc .mr-trigger')
  ok('9. at the top of the first page (a picture cover): within 12 px of the page\'s top, not at the first line of text', start && start.top >= -2 && start.top <= 12, start)
  await a.evaluate(() => openPrimer(currentUnit())); await a.waitForTimeout(700)
  const opened = await where('.mr-doc .mr-primer')
  // (Since 19 Oct 2026, night, directly under the start mark, whose rule is at the page's top here.)
  const mark = await a.evaluate(() => { const el = document.querySelector('.mr-doc .mr-unit.is-start'), pg = state.pages[0].pg.getBoundingClientRect(); return el && Math.round(el.getBoundingClientRect().bottom - pg.top) })
  ok('9. opened, Before you start starts at the top of the first page too (directly under the start mark)', opened && mark != null && opened.top >= mark - 1 && opened.top <= mark + 16 && mark <= 130, { opened, mark })
  await shot(a, 'primer-top-1440x900')
  ok('no page errors', !A.problems.length, A.problems)
  await A.ctx.close()
  return results
}

/* define-card (19 Oct 2026, evening, item 7): on the wide margin column Define is a margin card only, opened (not
   folded), with no pop-over over the text; its dots wait until the meaning arrives; it is kept. A narrow window and the
   phone keep the pop-over. */
async function defineCard(browser, origin) {
  const results = [], ok = okList(results)
  const hex = addBook(PDFS[0])
  for (const [width, height] of [[1440, 900], [1024, 768], [390, 844]]) {
    const tag = `define-card-${width}x${height}`, wide = width >= 1180
    const A = await readerPage(browser, origin, hex, { width, height, look: 'paper', startPage: 3 })
    const a = A.page
    await prefetchSettled(a)
    mock.delayFor.define = 900
    let word = '', early = null
    for (const near of ['middle', 'top', 'bottom']) {
      word = await selectText(a, { oneWord: true, near }); await a.waitForTimeout(350)
      early = await a.evaluate(() => ({ pop: !!document.querySelector('.mr-float.mr-define'), card: (() => { const c = document.querySelector('.mr-doc .mr-card.is-open'); return c && { label: c.querySelector('.mr-card__name')?.textContent || '', dots: !!c.querySelector('.tc-wait'), words: !!c.querySelector('.mr-answer') } })(), open: col.open }))
      if (early.pop || early.card) break
    }
    await a.waitForTimeout(1600)
    const done = await a.evaluate(() => { const c = document.querySelector('.mr-doc .mr-card.is-open'); const r = c?.getBoundingClientRect(), pg = document.querySelector('.pdf-sheet')?.getBoundingClientRect(); return { pop: !!document.querySelector('.mr-float.mr-define'), card: c && { label: c.querySelector('.mr-card__name')?.textContent || '', answer: c.querySelector('.mr-answer')?.innerText || '', dots: !!c.querySelector('.tc-wait'), right: r.left >= pg.right }, kept: keptCards().filter(k => k.kind === 'define').length, sel: getSelection().toString() } })
    if (wide) {
      ok(`${tag}: 7. one word opens Define as an open margin card at once ("Define · ${word}"), its dots or the dictionary's words in it, no pop-over over the text`, !early.pop && early.card && early.card.label === `Define · ${word}` && (early.card.dots || early.card.words), early)
      ok(`${tag}: 7. the meaning fills the card in the column (beside the page), the dots gone; it is kept`, !done.pop && done.card && done.card.answer.length > 3 && !done.card.dots && done.card.right && done.kept >= 1, done)
      await shot(a, `${tag}`)
    } else ok(`${tag}: 7. a narrow window or phone keeps Define's pop-over`, early.pop || done.pop, { early, done })
    mock.delayFor.define = 0
    ok(`${tag}: no page errors`, !A.problems.length, A.problems)
    await A.ctx.close()
  }
  return results
}

/* figure-chip (19 Oct 2026, evening, item 5): the figure and formula chip is the selection bar's dark style (its colour,
   44px, 12px corners), with Ask, Explain, Highlight and Copy in that order; Ask opens the figure's card. */
async function figureChip(browser, origin) {
  const results = [], ok = okList(results)
  const hex = addBook(FIGURE_PAPER)
  for (const [width, height, look] of [[1440, 900, 'paper'], [1440, 900, 'night'], [390, 844, 'paper']]) {
    const tag = `figure-chip-${width}x${height}-${look}`
    const A = await readerPage(browser, origin, hex, { width, height, look })
    const a = A.page
    await prefetchSettled(a)
    await a.evaluate(() => { const p = state.pages[0], sr = $('scroll').getBoundingClientRect(), b = p.pg.getBoundingClientRect(); $('scroll').scrollTop += b.top + 0.3 * b.height - (sr.top + 0.3 * sr.height) })
    await a.waitForFunction(() => state.figs.has(1) && state.pages[0].figures?.length, null, { timeout: 15000 }).catch(() => {})
    const pt = await a.evaluate(() => { const f = state.pages[0].figures[0], b = state.pages[0].pg.getBoundingClientRect(); return { x: b.left + (f.x + f.w / 2) * b.width, y: b.top + (f.y + f.h / 2) * b.height } })
    if (width < 700) await a.mouse.click(pt.x, pt.y); else { await a.mouse.move(pt.x - 40, pt.y - 40); await a.mouse.move(pt.x, pt.y, { steps: 4 }) }
    await a.waitForSelector('.byob-hot-chip', { timeout: 4000 }).catch(() => {})
    const chip = await a.evaluate(() => { const c = document.querySelector('.byob-hot-chip'); if (!c) return null; const cs = getComputedStyle(c), bar = getComputedStyle(c).getPropertyValue('--mr-bar').trim(); const r = c.getBoundingClientRect(); return { words: [...c.querySelectorAll('button')].map(b => b.textContent.trim()), bg: cs.backgroundColor, bar, height: Math.round(r.height), radius: cs.borderRadius, ink: cs.color, inside: r.left >= 0 && r.right <= innerWidth, fonts: [...new Set([...c.querySelectorAll('button')].map(b => getComputedStyle(b).fontFamily))] } })
    const hex2rgb = h => { const m = /^#([0-9a-f]{6})$/i.exec(h || ''); return m ? `rgb(${parseInt(m[1].slice(0, 2), 16)}, ${parseInt(m[1].slice(2, 4), 16)}, ${parseInt(m[1].slice(4, 6), 16)})` : h }
    ok(`${tag}: 5. the chip is the selection bar's dark style (its colour, 44px, 12px corners) with Ask, Explain, Highlight, Copy`, chip && chip.words.join('|') === 'Ask|Explain|Highlight|Copy' && chip.bg === hex2rgb(chip.bar) && chip.height === 44 && chip.radius === '12px' && chip.inside && !chip.fonts.some(f => /mono/i.test(f)), chip)
    if (width === 1440 && look === 'paper') await shot(a, 'figure-chip-1440x900')
    await a.click('.byob-hot-chip [data-a="ask"]').catch(() => {}); await a.waitForTimeout(600)
    const card = await a.evaluate(() => { const id = col.open, c = id && cardById(id); return c && { kind: c.kind, field: !!document.querySelector('.mr-card.is-open .mr-follow__input, .mr-sheet .mr-follow__input') } })
    ok(`${tag}: 5. Ask opens the figure's card, its question field ready`, card && card.kind === 'figure' && card.field, card)
    ok(`${tag}: no page errors`, !A.problems.length, A.problems)
    await A.ctx.close()
  }
  return results
}

/* highlight-bar (19 Oct 2026, evening, item 2): a click on a highlight opens the dark selection bar with Ask and
   Explain, its colours (its own pressed), its note and Remove highlight (on the phone the bin, so named); a colour
   recolours it and the bar stays; Explain makes its card; Remove highlight removes it. */
async function highlightBar(browser, origin) {
  const results = [], ok = okList(results)
  const hex = addBook(PDFS[0])
  for (const [width, height, look] of [[1440, 900, 'paper'], [1440, 900, 'night'], [360, 740, 'paper']]) {
    const tag = `highlight-bar-${width}x${height}-${look}`, phone = width < 700
    account.marks.clear(); account.cards.clear()
    const A = await readerPage(browser, origin, hex, { width, height, look, startPage: 3 })
    const a = A.page
    await prefetchSettled(a)
    const make = async () => { await selectText(a); await a.waitForSelector('.mr-float [data-m="dot"]', { timeout: 5000 }).catch(() => {}); await a.click('.mr-float [data-m="dot"]'); await a.waitForTimeout(300); await a.keyboard.press('Escape'); await a.keyboard.press('Escape'); await a.evaluate(() => getSelection().removeAllRanges()); if (phone) await a.evaluate(() => closeSheet2()); await a.waitForTimeout(300) }
    const clickHl = async () => { const p = await a.evaluate(() => { const i = [...document.querySelectorAll('.hl-layer i')].at(-1); const r = i.getBoundingClientRect(); return { x: r.left + Math.min(20, r.width / 2), y: r.top + r.height / 2 } }); await a.mouse.click(p.x, p.y); await a.waitForTimeout(500) }
    const barNow = () => a.evaluate(() => { const b = document.querySelector('.mr-float.mr-bar, .mr-float.mr-pbar'); if (!b) return null; return { items: [...b.querySelectorAll('button')].map(x => x.dataset.m || (x.dataset.color ? 'color' : '?')), words: [...b.querySelectorAll('button')].map(x => x.textContent.trim()).filter(Boolean), remove: b.querySelector('[data-m="remove"]')?.getAttribute('aria-label') || b.querySelector('[data-m="remove"]')?.textContent, removeTitle: b.querySelector('[data-m="remove"]')?.getAttribute('title'), removeText: b.querySelector('[data-m="remove"]')?.textContent.trim(), removeIcon: !!b.querySelector('[data-m="remove"] svg'), pressed: b.querySelector('.mr-swatch[aria-pressed="true"]')?.dataset.color, bg: getComputedStyle(b).backgroundColor, dark: (() => { const m = getComputedStyle(b).backgroundColor.match(/\d+/g).map(Number); return (m[0] + m[1] + m[2]) / 3 < 80 })() } })
    await make()
    const color = await a.evaluate(() => highlights().at(-1)?.color)
    await clickHl()
    const bar = await barNow()
    ok(`${tag}: 2. a click on a highlight opens the dark bar: Ask, Explain, its colours (its own pressed), its note, Remove highlight`, bar && bar.dark && bar.items.join(',') === 'ask,explain,color,color,color,color,color,note,remove' && bar.pressed === color && bar.remove === 'Remove highlight', { bar, color })
    // p (Anders, 20 Oct 2026): Remove highlight is an icon, a ✕ in the bar's icon style, never the words; named for screen readers and on hover.
    ok(`${tag}: p. Remove highlight is an icon-only ✕ (aria-label and title "Remove highlight")`, bar && bar.removeIcon && bar.removeText === '' && bar.removeTitle === 'Remove highlight' && !bar.words.includes('Remove highlight'), bar)
    if (!phone && look === 'paper') await shot(a, 'highlight-bar-1440x900')
    const problems = await checkMargin(a)
    ok(`${tag}: the bar is laid out cleanly (inside the screen, nothing cut or overlapping)`, !problems.length, problems.slice(0, 4))
    // Another colour: recoloured, the bar stays as it is.
    const other = await a.evaluate(c => [...document.querySelectorAll('.mr-float .mr-swatch')].map(b => b.dataset.color).find(k => k !== c), color)
    await a.click(`.mr-float .mr-swatch[data-color="${other}"]`); await a.waitForTimeout(300)
    const after = await barNow()
    ok(`${tag}: 2. a colour recolours it and the bar stays`, (await a.evaluate(() => highlights().at(-1)?.color)) === other && after && after.pressed === other && after.items.includes('remove'), after)
    // Explain: its card on the highlight's passage.
    await a.click('.mr-float [data-m="explain"]'); await a.waitForTimeout(1300)
    const card = await a.evaluate(() => { const c = cardById(col.open || ''); return c && { kind: c.kind, answered: (c.turns || []).some(t => t.role === 'assistant') } })
    ok(`${tag}: 2. Explain from it makes the passage's card`, card && card.kind === 'explain' && card.answered, card)
    await a.keyboard.press('Escape'); if (phone) await a.evaluate(() => closeSheet2()); await a.evaluate(() => openCard(null)); await a.waitForTimeout(300)
    // Remove highlight.
    const n0 = await a.evaluate(() => highlights().length)
    await clickHl(); await a.click('.mr-float [data-m="remove"]').catch(() => {}); await a.waitForTimeout(300)
    ok(`${tag}: 2. Remove highlight removes it and the bar goes`, (await a.evaluate(() => highlights().length)) === n0 - 1 && !(await barNow()))
    ok(`${tag}: no page errors`, !A.problems.length, A.problems)
    await A.ctx.close()
  }
  return results
}

/* zoom-panel (19 Oct 2026, evening, item 6): a PDF's Aa panel on the desktop has Zoom (−, the percentage, +, Fit width,
   100% by default) instead of the A—A slider, and a line pointing to Convert to Tinct book; the page never grows past
   its room (never under the margin column, no sideways scroll), by the buttons, the keys or a pinch; "Full width" is
   gone (measured: in Margin view it changed nothing up to about 1600 px; + reaches what it gave). Phones and Tinct
   text (an EPUB) keep the size slider. */
async function zoomPanel(browser, origin) {
  const results = [], ok = okList(results)
  const hex = addBook(PDFS[0])
  const room = page => page.evaluate(() => { const s = $('scroll'), sh = state.pages[0].sheet.getBoundingClientRect(), colEl = document.querySelector('.mr-doc'); const colLeft = colEl && marginMode() === 'column' ? colEl.getBoundingClientRect().left : innerWidth; return { zoom: state.zoom, sheet: Math.round(sh.width), right: Math.round(sh.right), colLeft: Math.round(colLeft), sideways: s.scrollWidth - s.clientWidth, pct: document.querySelector('.byob-zoom-pct')?.textContent || null } })
  for (const [width, height, layout] of [[1440, 900, 'margin'], [1920, 1080, 'margin'], [1440, 900, 'focus']]) {
    const tag = `zoom-panel-${width}x${height}-${layout}`
    const A = await readerPage(browser, origin, hex, { width, height, look: 'paper' })
    const a = A.page
    await prefetchSettled(a)
    if (layout === 'focus') { await a.evaluate(() => setLayout('focus')); await a.waitForTimeout(700) }
    await a.click('#aaBtn'); await a.waitForSelector('.byob-aa-panel', { timeout: 4000 }).catch(() => {})
    const panel = await a.evaluate(() => { const p = document.querySelector('.byob-aa-panel'); return p && { zoom: !!p.querySelector('.byob-zoom'), label: p.querySelector('.byob-zoom-label')?.textContent, slider: !!p.querySelector('[data-testid="lab-v2-size"]'), full: [...p.querySelectorAll('.lab-v2-row-label')].some(l => /Full width/.test(l.textContent)), fit: p.querySelector('[data-z="fit"]')?.getAttribute('aria-pressed'), note: p.querySelector('.byob-zoom-note')?.textContent.trim() || null, pct: p.querySelector('.byob-zoom-pct')?.textContent } })
    ok(`${tag}: 6. Zoom (−, 100%, +, Fit width pressed) replaces the size slider; no "Full width"`, panel && panel.zoom && panel.label === 'Zoom' && !panel.slider && !panel.full && panel.fit === 'true' && panel.pct === '100%', panel)
    ok(`${tag}: 6. one line points to Convert to Tinct book for larger text that reflows`, panel?.note === 'For larger text that reflows, use Convert to Tinct book.', panel?.note)
    if (width === 1440 && layout === 'margin') await shot(a, 'zoom-panel-1440x900')
    // + until it stops: the page never past its room.
    for (let k = 0; k < 30 && !(await a.evaluate(() => document.querySelector('[data-z="+"]')?.disabled)); k++) { await a.click('[data-z="+"]'); await a.waitForTimeout(60) }
    await a.waitForTimeout(400)
    const most = await room(a)
    ok(`${tag}: 6. + stops where the page fills its room: never under the margin column, no sideways scroll (${most.sheet}px at ${most.pct})`, most.right <= most.colLeft + 1 && most.sideways <= 1 && most.right <= width, most)
    // The keys and a pinch past it: still within the room.
    await a.keyboard.press('Escape'); await a.waitForTimeout(150)
    await a.keyboard.press('Control+='); await a.keyboard.press('Control+='); await a.waitForTimeout(400)
    await a.mouse.move(width * 0.3, height * 0.5); await a.keyboard.down('Control'); await a.mouse.wheel(0, -400); await a.keyboard.up('Control'); await a.waitForTimeout(500)
    const keys = await room(a)
    ok(`${tag}: 6. Ctrl + and a pinch never take it further`, keys.right <= keys.colLeft + 1 && keys.sideways <= 1 && Math.abs(keys.zoom - most.zoom) < 0.011, { most, keys })
    // − and Fit width.
    await a.click('#aaBtn'); await a.waitForSelector('.byob-zoom'); await a.click('[data-z="-"]'); await a.waitForTimeout(300)
    const less = await room(a)
    await a.click('[data-z="fit"]'); await a.waitForTimeout(400)
    const fit = await room(a)
    ok(`${tag}: 6. − zooms out (the percentage follows); Fit width returns to 100%`, less.zoom < most.zoom && less.pct === Math.round(less.zoom * 100) + '%' && fit.zoom === 1 && fit.pct === '100%', { less, fit })
    ok(`${tag}: no page errors`, !A.problems.length, A.problems)
    await A.ctx.close()
  }
  // A phone keeps its size slider.
  const P = await readerPage(browser, origin, hex, { width: 390, height: 844, look: 'paper' })
  await P.page.click('#aaBtn'); await P.page.waitForTimeout(400)
  ok('zoom-panel-390x844: 6. the phone keeps its size slider (phones unchanged)', await P.page.evaluate(() => !!document.querySelector('.byob-aa-panel [data-testid="lab-v2-size"]') && !document.querySelector('.byob-zoom')))
  await P.ctx.close()
  // Tinct text (an EPUB here): the size slider stays a text-size control.
  const E = await openEpubHere(browser, origin, { width: 1440, height: 900, look: 'paper', margin: false })
  await E.page.click('#aaBtn'); await E.page.waitForTimeout(400)
  ok('zoom-panel-epub: 6. in Tinct text the size slider stays a text-size control', await E.page.evaluate(() => document.querySelector('.byob-aa-panel [data-testid="lab-v2-size"]')?.getAttribute('aria-label') === 'Text size' && !document.querySelector('.byob-zoom')))
  await E.ctx.close()
  return results
}

/* margin-notes (19 Oct 2026, evening, item 3): on the wide column a click on the empty margin opens a new note card at
   that height, its field ready; with anything open the first click only folds it; an empty note goes when it lets go;
   a note is kept and synced as every note is (and reloads in its place); its Ask turns it into a chat with the note as
   the first message. Narrow windows write none. */
async function marginNotes(browser, origin) {
  const results = [], ok = okList(results)
  const hex = addBook(PDFS[0])
  account.marks.clear(); account.cards.clear()
  const A = await readerPage(browser, origin, hex, { width: 1440, height: 900, look: 'paper', startPage: 3 })
  const a = A.page
  await prefetchSettled(a)
  await a.evaluate(() => { openCard(null); closePrimer() }); await a.waitForTimeout(300)
  const colX = () => a.evaluate(() => Math.round(document.querySelector('.mr-doc').getBoundingClientRect().left + 190))
  const x = await colX(), clickPage = async () => { const p = await a.evaluate(() => { const b = state.pages.find(q => q.pg.getBoundingClientRect().bottom > 400).pg.getBoundingClientRect(); return { x: b.left + 30, y: 640 } }); await a.mouse.click(p.x, p.y); await a.waitForTimeout(400) }
  const openNote = () => a.evaluate(() => { const c = document.querySelector('.mr-doc .mr-card.is-open'); if (!c) return null; const f = c.querySelector('.mr-note-edit'), lab = c.querySelector('.mr-card__label').getBoundingClientRect(); return { id: c.dataset.id, label: c.querySelector('.mr-card__name')?.textContent, field: !!f, focused: document.activeElement === f, mid: Math.round((lab.top + lab.bottom) / 2), ask: !!c.querySelector('[data-c="note-ask"]') } })
  // 1. A click on the empty margin: a note at that height, its field ready.
  await a.mouse.click(x, 520); await a.waitForTimeout(500)
  const n1 = await openNote()
  ok('3. a click on the empty margin opens a new note card at that height ("Your note"), its field focused, with Ask', n1 && n1.label === 'Your note' && n1.field && n1.focused && Math.abs(n1.mid - 520) <= 24 && n1.ask, n1)
  await a.keyboard.type('My margin thought about this page.')
  await shot(a, 'margin-note-1440x900')
  // The note's words are upright (Anders, 20 Oct 2026), while written and once kept; the card's label stays italic.
  const editing = await a.evaluate(() => { const c = document.querySelector('.mr-doc .mr-card.is-open'), f = c?.querySelector('.mr-note-edit'); return f && { text: getComputedStyle(f).fontStyle, label: getComputedStyle(c.querySelector('.mr-card__label')).fontStyle } })
  ok('3. the note text is upright while it is written (font-style normal); the label keeps its italic', editing?.text === 'normal' && editing.label === 'italic', editing)
  await clickPage()
  const keptStyle = await a.evaluate(() => { const h = highlights().find(m => m.note === 'My margin thought about this page.'); const t = h && document.querySelector(`.mr-doc .mr-card[data-id="n-${h.id}"] .mr-card__text`); return t ? getComputedStyle(t).fontStyle : null })
  ok('3. the kept note text is upright (font-style normal)', keptStyle === 'normal', keptStyle)
  const kept = await a.evaluate(() => { const h = highlights().find(m => m.note === 'My margin thought about this page.'); const c = h && document.querySelector(`.mr-doc .mr-card[data-id="n-${h.id}"]`); return h && { rects: h.rects, withNote: h.withNote, page: h.page, folded: !!c?.classList.contains('is-folded'), text: c?.querySelector('.mr-card__text')?.textContent, hl: document.querySelectorAll(`.hl-layer i[data-id="${h.id}"]`).length } })
  ok('3. it is kept when its field lets go: a note with no passage at its height, folded in place, no highlight drawn', kept && kept.rects.length === 1 && kept.rects[0][0] === 1 && kept.rects[0][2] === 0 && kept.rects[0][3] === 0 && kept.withNote && kept.folded && /My margin thought/.test(kept.text || '') && kept.hl === 0, kept)
  await a.waitForTimeout(2200)
  const synced = account.marks.get(hex)?.marks?.find(m => m.note === 'My margin thought about this page.')
  ok('3. it syncs to the account as every note does', !!synced && synced.rects[0][2] === 0, synced)
  // 2. With a card open, the first click on the margin only folds it.
  await a.evaluate(() => { const h = highlights().find(m => m.note === 'My margin thought about this page.'); openCard('n-' + h.id) }); await a.waitForTimeout(400)
  const reopened = await a.evaluate(() => { const f = document.querySelector('.mr-doc .mr-card.is-open .mr-note-edit'); return f && { value: f.value, style: getComputedStyle(f).fontStyle } })
  ok('3. the kept note, opened again, is upright in its field', reopened?.style === 'normal' && /My margin thought/.test(reopened.value), reopened)
  const before = await a.evaluate(() => highlights().length)
  await a.mouse.click(x, 760); await a.waitForTimeout(500)
  ok('3. with a card open, the first click on the margin only folds it (no new note)', !(await a.evaluate(() => col.open)) && !(await a.evaluate(() => !!col.draft)) && (await a.evaluate(() => highlights().length)) === before)
  // 3. An empty note goes when it lets go.
  await a.mouse.click(x, 760); await a.waitForTimeout(400)
  const empty = await openNote()
  await clickPage()
  ok('3. an empty note is let go when its field loses the focus (nothing kept, no card)', empty?.field && (await a.evaluate(() => highlights().length)) === before && !(await a.evaluate(() => !!col.draft || !!document.querySelector('.mr-doc .mr-card .mr-note-edit[placeholder]:not(:placeholder-shown)'))), empty)
  // 4. Reload: the note in its place.
  const y0 = await a.evaluate(() => { const h = highlights().find(m => m.note === 'My margin thought about this page.'); const el = document.querySelector(`.mr-doc .mr-card[data-id="n-${h.id}"]`); const p = state.pages[h.page - 1].pg.getBoundingClientRect(); return Math.round(el.getBoundingClientRect().top - (p.top + h.rects[0][1] * p.height)) })
  await a.reload(); await a.waitForFunction(() => document.querySelectorAll('.pdf-sheet .text-layer span').length > 20, null, { timeout: 30000 }); await a.waitForTimeout(1200)
  await a.evaluate(() => { const h = highlights().find(m => m.note === 'My margin thought about this page.'); goTo({ page: h.page, frac: Math.max(0, h.rects[0][1] - 0.2) }) }); await a.waitForTimeout(900)
  const y1 = await a.evaluate(() => { const h = highlights().find(m => m.note === 'My margin thought about this page.'); const el = document.querySelector(`.mr-doc .mr-card[data-id="n-${h.id}"]`); if (!el) return null; const p = state.pages[h.page - 1].pg.getBoundingClientRect(); return Math.round(el.getBoundingClientRect().top - (p.top + h.rects[0][1] * p.height)) })
  ok('3. after a reload the note is in its place', y1 != null && Math.abs(y1 - y0) <= 2, { y0, y1 })
  // 5. Ask: the note becomes a chat, the note its first message.
  const r0 = account.requests.length
  await a.evaluate(() => { const h = highlights().find(m => m.note === 'My margin thought about this page.'); openCard('n-' + h.id) }); await a.waitForTimeout(400)
  await a.click('.mr-doc .mr-card.is-open [data-c="note-ask"]'); await a.waitForTimeout(1500)
  const chat = await a.evaluate(() => { const c = cardById(col.open || ''); const el = document.querySelector('.mr-doc .mr-card.is-open'); return c && { kind: c.kind, first: c.turns?.[0], answered: c.turns?.some(t => t.role === 'assistant'), bubble: el?.querySelector('.mr-you')?.textContent, noteGone: !highlights().some(m => m.note === 'My margin thought about this page.') } })
  const sent = account.requests.slice(r0).find(r => JSON.stringify(r.body?.messages || '').includes('My margin thought'))
  ok('3. Ask turns the note into a chat in its place: the note is its first message, answered; the note goes', chat && chat.kind === 'ask' && chat.first?.role === 'user' && chat.first.content === 'My margin thought about this page.' && chat.answered && /My margin thought/.test(chat.bubble || '') && chat.noteGone && !!sent, { chat, sent: !!sent })
  ok('no page errors', !A.problems.length, A.problems)
  await A.ctx.close()
  // Narrow windows: no note from a click beside the page.
  const N = await readerPage(browser, origin, hex, { width: 1024, height: 768, look: 'paper', startPage: 3 })
  const n0 = await N.page.evaluate(() => highlights().length)
  await N.page.mouse.click(1000, 400); await N.page.waitForTimeout(400)
  ok('3. a narrow window writes no note on a click beside the page', (await N.page.evaluate(() => highlights().length)) === n0 && !(await N.page.evaluate(() => !!col.draft)))
  await N.ctx.close()
  return results
}

/* unit-marks (Anders's mockup, 19 Oct 2026, night; replaces #485's unit pills): on the wide column each reading unit
   (TinctMargin.sizeUnits: about 3–25 pages, from the headings) has two marks in the column, scrolling with the page,
   nothing pinned: "Starting" (its name and pages, ✧ Primer, ✧ Catch me up), its rule level with the top of the unit's
   heading; "End of" (✧ Recap, ✧ Quiz me, Note), its rule level with the top of the unit's last line. A mark pushed
   down keeps its tick at the heading and slants to the mark. Cards opened from a mark open under it, and their
   requests carry the unit's pages. The chapter menu marks the unit and offers Recap, Quiz me and Catch me up. Phones
   are unchanged. On the section paper (a 20-page paper of numbered sections that start mid-page) and the long book. */
// In the page: the top of the first text-layer span on page n whose line starts with `text` (the heading), or the top
// of the last body line above `before` (a fraction of the page) on page n; viewport px.
const MARK_PROBES = `
  // (The largest such line: a running head repeating a chapter's title in small capitals is not its heading.)
  window.__spanTop = (n, text) => { const p = state.pages[n - 1]; const want = text.toLowerCase().replace(/[^a-z0-9]/g, ''); const spans = [...p.layer.querySelectorAll('span')].filter(sp => sp.textContent.trim()); let best = null; for (const sp of spans) { const t = sp.textContent.toLowerCase().replace(/[^a-z0-9]/g, ''); if (t && want.startsWith(t.slice(0, Math.min(t.length, want.length))) && t.length >= Math.min(2, want.length)) { const r = sp.getBoundingClientRect(); const line = spans.filter(o => Math.abs(o.getBoundingClientRect().top - r.top) < 4).map(o => o.textContent).join('').toLowerCase().replace(/[^a-z0-9]/g, ''); if (line.startsWith(want) && (!best || r.height > best.h)) best = { top: r.top, h: r.height } } } return best ? best.top : null };
  window.__lastLineTop = (n, before) => { const p = state.pages[n - 1], pr = p.pg.getBoundingClientRect(); const tops = [...p.layer.querySelectorAll('span[data-b]')].filter(sp => sp.textContent.trim() && !/^\\s*\\d{1,4}\\s*$/.test(sp.textContent)).map(sp => sp.getBoundingClientRect().top).filter(t => (t - pr.top) / pr.height < before - 0.002); return tops.length ? Math.max(...tops) : null };
  window.__mark = (key, where) => { const el = document.querySelector('.mr-doc .mr-unit.is-' + where + '[data-unit="' + key + '"]'); if (!el) return null; const r = el.getBoundingClientRect(), cs = getComputedStyle(el); return { top: r.top, bottom: r.bottom, left: r.left, k: el.querySelector('.mr-unit__k')?.textContent, name: el.querySelector('.mr-unit__n')?.innerText.replace(/\\s+/g, ' ').trim(), words: [...el.querySelectorAll('.mr-pill')].map(b => b.textContent.trim()), position: cs.position, rule: cs.borderTopWidth } };
`
async function unitMarks(browser, origin) {
  const results = [], ok = okList(results)
  const hex = addBook(SECTION_PAPER)
  account.marks.clear(); account.cards.clear(); account.primers.clear()
  const A = await readerPage(browser, origin, hex, { width: 1440, height: 900, look: 'paper' })
  const a = A.page
  await a.evaluate(MARK_PROBES)
  await prefetchSettled(a)
  await a.waitForFunction(() => primer.units?.length > 1, null, { timeout: 15000 }).catch(() => {})
  const units = await a.evaluate(() => primer.units.map(u => ({ key: u.key, title: u.title, from: u.from, to: u.to, start: u.start })))
  ok('sized units from the headings: the numbered sections, never their subsections; References apart', units.map(u => `${u.title} ${u.from}–${u.to}`).join(' | ') === '1 Introduction 1–3 | 2 Motivations 4–8 | 3 Information 9–14 | 4 Superinformation 15–18 | References 19–20', units)
  // 1. The first unit's start: the rule exactly at the top of its heading's line (nothing above it to push it).
  await a.evaluate(() => goTo({ page: 1, frac: 0 })); await a.waitForTimeout(900)
  const s1 = await a.evaluate(k => ({ mark: __mark(k, 'start'), head: __spanTop(1, '1 Introduction') }), units[0].key)
  // The first unit offers no Catch me up (Anders, 20 Oct 2026: "there shouldnt be a 'catch me up' on the first page").
  ok('1. the start mark: "Starting", the unit\'s name and pages, ✧ Primer alone (nothing to catch up on yet), in the column (not pinned)', s1.mark && s1.mark.k === 'Starting' && s1.mark.name === '1 Introduction pp. 1–3' && s1.mark.words.join('|') === '✧Primer' && s1.mark.position === 'absolute' && s1.mark.rule === '1px', s1)
  ok('1. the start rule\'s y is the top of the heading\'s line on the page (within 2 px)', s1.mark && s1.head != null && Math.abs(s1.mark.top - s1.head) <= 2, s1)
  await shot(a, 'unit-marks-start-1440x900')
  // The marks scroll with the page; nothing in the column is pinned.
  const scroll = await a.evaluate(async k => { const s = document.getElementById('scroll'), t0 = __mark(k, 'start').top; s.scrollBy({ top: 200 }); await new Promise(r => setTimeout(r, 300)); const t1 = __mark(k, 'start').top; const pinned = [...document.querySelectorAll('.mr-doc, .mr-doc *')].filter(el => /fixed|sticky/.test(getComputedStyle(el).position)).map(el => el.className.baseVal ?? el.className); s.scrollBy({ top: -200 }); await new Promise(r => setTimeout(r, 300)); return { moved: Math.round(t0 - t1), pinned } }, units[0].key)
  ok('1. the marks scroll with the page (200 px of scroll moves them 200 px); no pinned element in the column', Math.abs(scroll.moved - 200) <= 1 && !scroll.pinned.length, scroll)
  // 2. The first unit's end and the second unit's start meet on page 4: the end rule at the top of the last line above
  // "2 Motivations", the start mark pushed below it, its tick still at the heading, slanting to the mark.
  await a.evaluate(() => goTo({ page: 4, frac: 0.25 })); await a.waitForTimeout(900)
  const meet = await a.evaluate(([k0, k1]) => {
    const head = __spanTop(4, '2 Motivations'), pr = state.pages[3].pg.getBoundingClientRect();
    const last = __lastLineTop(4, (head - pr.top) / pr.height), end = __mark(k0, 'end'), start = __mark(k1, 'start');
    const sr = document.getElementById('scroll').getBoundingClientRect(), s = document.getElementById('scroll');
    // The ticks, in the scroller's coordinates: each rule path's first point.
    const ticks = [...document.querySelectorAll('.mr-doc-leads path.is-rule')].map(p => { const m = /^M(-?[\d.]+) (-?[\d.]+)/.exec(p.getAttribute('d')); const n = (p.getAttribute('d').match(/-?[\d.]+/g) || []).map(Number); return m && { y: Number(m[2]) - s.scrollTop + sr.top, endY: n[n.length - 1 - 1] != null ? n.at(-2) : null, d: p.getAttribute('d') } }).filter(Boolean)
    return { head, last, end, start, ticks }
  }, [units[0].key, units[1].key])
  ok('2. the end mark: "End of", the unit\'s name and pages, ✧ Recap · ✧ Quiz me · Note', meet.end && meet.end.k === 'End of' && meet.end.name === '1 Introduction pp. 1–3' && meet.end.words.join('|') === '✧Recap|✧Quiz me|Note', meet.end)
  // They collide (the last line is one line above the heading): the start mark keeps its place exactly above the heading
  // (Anders, 19 Oct 2026, night); the end mark moves up, ending clear of the start rule, its tick slanting from the last line.
  const tickFrom = (y, slant) => meet.ticks.some(t => Math.abs(t.y - y) <= 2 && (slant ? /L/.test(t.d) : !/L/.test(t.d)))
  ok('2. collision: the start rule stays within 2 px of the heading\'s top, its tick straight across', meet.start && meet.head != null && Math.abs(meet.start.top - meet.head) <= 2 && tickFrom(meet.head, false), { start: meet.start?.top, head: meet.head, ticks: meet.ticks.map(t => t.d) })
  ok('2. collision: the end mark moves up, ending clear of the start rule; its tick slants from the top of the unit\'s last line (on the next unit\'s page, above its heading)', meet.end && meet.start && meet.last != null && meet.end.bottom <= meet.start.top + 0.5 && meet.end.top < meet.last - 2 && tickFrom(meet.last, true), { end: meet.end && [meet.end.top, meet.end.bottom], start: meet.start?.top, last: meet.last, ticks: meet.ticks.map(t => t.d) })
  await shot(a, 'unit-marks-end-1440x900')
  // 3. Cards from a mark open under it; their requests carry the unit's pages.
  const r1 = account.requests.length
  await a.click(`.mr-doc .mr-unit.is-end[data-unit="${units[0].key}"] .mr-pill[data-pill="recap"]`); await a.waitForTimeout(1300)
  const rc = await a.evaluate(k => { const el = document.querySelector('.mr-doc .mr-card.is-open'), m = document.querySelector(`.mr-doc .mr-unit.is-end[data-unit="${k}"]`); return el && { label: el.querySelector('.mr-card__name')?.textContent, answer: el.querySelector('.mr-answer')?.innerText || '', gap: Math.round(el.getBoundingClientRect().top - m.getBoundingClientRect().bottom) } }, units[0].key)
  const rcReq = chatsOf(r1).find(r => /Recap it for them/.test(JSON.stringify(r.body.messages || '')))
  ok('3. Recap opens its card directly under the end mark, answered on tap, about the unit\'s pages (1–3)', rc && /^Recap · /.test(rc.label || '') && /MOCK ANSWER/.test(rc.answer) && rc.gap >= 0 && rc.gap <= 16 && !!rcReq && /\(pages 1–3\)/.test(JSON.stringify(rcReq.body.messages)), { rc, sent: !!rcReq })
  await a.evaluate(() => openCard(null)); await a.waitForTimeout(200)
  const r2 = account.requests.length
  await a.click(`.mr-doc .mr-unit.is-start[data-unit="${units[1].key}"] .mr-pill[data-pill="catchup"]`); await a.waitForTimeout(1300)
  const cu = await a.evaluate(k => { const el = document.querySelector('.mr-doc .mr-card.is-open'), m = document.querySelector(`.mr-doc .mr-unit.is-start[data-unit="${k}"]`); return el && { label: el.querySelector('.mr-card__name')?.textContent, gap: Math.round(el.getBoundingClientRect().top - m.getBoundingClientRect().bottom) } }, units[1].key)
  const cuReq = chatsOf(r2).find(r => /Catch them up/.test(JSON.stringify(r.body.messages || '')))
  ok('3. Catch me up opens its card directly under the start mark, on the pages before the unit (1–3)', cu && /^Catch me up · /.test(cu.label || '') && cu.gap >= 0 && cu.gap <= 16 && !!cuReq && /\(pages 1–3\)/.test(JSON.stringify(cuReq.body.messages)), { cu, sent: !!cuReq })
  await a.evaluate(() => openCard(null)); await a.waitForTimeout(200)
  await a.click(`.mr-doc .mr-unit.is-start[data-unit="${units[1].key}"] .mr-pill[data-pill="primer"]`); await a.waitForTimeout(500)
  const pm = await a.evaluate(k => { const p = document.querySelector('.mr-doc .mr-primer'), m = document.querySelector(`.mr-doc .mr-unit.is-start[data-unit="${k}"]`); return p && { gap: Math.round(p.getBoundingClientRect().top - m.getBoundingClientRect().bottom), unit: primer.unit?.key, pressed: m.querySelector('[data-pill="primer"]').getAttribute('aria-expanded') } }, units[1].key)
  ok('3. Primer opens Before you start for the unit, under its start mark, its button pressed', pm && pm.gap >= 0 && pm.gap <= 16 && pm.unit === units[1].key && pm.pressed === 'true', pm)
  await a.click(`.mr-doc .mr-unit.is-start[data-unit="${units[1].key}"] .mr-pill[data-pill="primer"]`); await a.waitForTimeout(300)
  await a.click(`.mr-doc .mr-unit.is-end[data-unit="${units[0].key}"] .mr-pill[data-pill="quiz"]`); await a.waitForTimeout(1300)
  const qz = await a.evaluate(() => { const c = cardById(col.open || ''), el = document.querySelector('.mr-doc .mr-card.is-open'); return c && { kind: c.kind, unit: c.data?.unit?.key, count: el?.querySelector('.mr-card__count')?.textContent } })
  ok('3. Quiz me opens the unit\'s quiz', qz && qz.kind === 'quiz' && qz.unit === units[0].key && qz.count === '1 of 3', qz)
  await a.evaluate(() => openCard(null)); await a.waitForTimeout(200)
  await a.click(`.mr-doc .mr-unit.is-end[data-unit="${units[0].key}"] .mr-pill[data-pill="note"]`); await a.waitForTimeout(500)
  const nt = await a.evaluate(() => { const el = document.querySelector('.mr-doc .mr-card.is-open'), f = el?.querySelector('.mr-note-edit'); return el && { field: !!f, focused: document.activeElement === f } })
  ok('3. Note opens the reader\'s own note on the unit, its field ready', nt && nt.field && nt.focused, nt)
  await a.keyboard.press('Escape'); await a.waitForTimeout(300)
  // 4. The chapter menu: the unit the reader is in, marked, with Recap, Quiz me and Catch me up.
  await a.evaluate(() => { openCard(null); goTo({ page: 6, frac: 0.3 }) }); await a.waitForTimeout(800)
  await a.evaluate(() => openContents()); await a.waitForTimeout(300)
  const menu = await a.evaluate(() => { const s = document.querySelector('.lab-contents-v2 .byob-unit-now'); return s && { name: s.querySelector('[aria-current]')?.textContent, acts: [...s.querySelectorAll('[data-unit-act]')].map(b => b.textContent.trim()) } })
  ok('4. the chapter menu marks the unit being read and offers ✧ Recap · ✧ Quiz me · ✧ Catch me up', menu && menu.name === '2 Motivations · pp. 4–8' && menu.acts.join('|') === '✧Recap|✧Quiz me|✧Catch me up', menu)
  await shot(a, 'unit-marks-menu-1440x900')
  const r3 = account.requests.length
  await a.click('.lab-contents-v2 [data-unit-act="recap"]'); await a.waitForTimeout(1500)
  const fromMenu = await a.evaluate(k => { const el = document.querySelector('.mr-doc .mr-card.is-open'), m = document.querySelector(`.mr-doc .mr-unit.is-end[data-unit="${k}"]`), r = el?.getBoundingClientRect(), sr = document.getElementById('scroll').getBoundingClientRect(); return el && m && { label: el.querySelector('.mr-card__name')?.textContent, gap: Math.round(r.top - m.getBoundingClientRect().bottom), inView: r.top < sr.bottom && r.bottom > sr.top } }, units[1].key)
  ok('4. Recap from the menu opens the unit\'s recap under its end mark, brought into view', fromMenu && /^Recap · /.test(fromMenu.label || '') && fromMenu.gap >= 0 && fromMenu.gap <= 16 && fromMenu.inView && chatsOf(r3).some(r => /\(pages 4–8\)/.test(JSON.stringify(r.body.messages || ''))), fromMenu)
  ok('no page errors', !A.problems.length, A.problems)
  await A.ctx.close()
  // 5. The long book's chapters start at a page's top: the start rule at the chapter's heading there.
  const hexL = addBook(LONG_BOOK)
  const L = await readerPage(browser, origin, hexL, { width: 1440, height: 900, look: 'night' })
  await L.page.evaluate(MARK_PROBES)
  await prefetchSettled(L.page)
  await L.page.waitForFunction(() => primer.units?.length > 1, null, { timeout: 15000 }).catch(() => {})
  const long = await L.page.evaluate(async () => { const u = primer.units[1]; goTo({ page: u.start, frac: 0 }); await new Promise(r => setTimeout(r, 900)); const m = __mark(u.key, 'start'), s = document.getElementById('scroll'), sr = s.getBoundingClientRect(); const ticks = [...document.querySelectorAll('.mr-doc-leads path.is-rule')].map(p => p.getAttribute('d')); return { title: u.title, head: __spanTop(u.start, u.title), mark: m, units: primer.units.length, ticks: ticks.map(d => { const n = d.match(/-?[\d.]+/g).map(Number); return { y: n[1] - s.scrollTop + sr.top, end: n.at(-2) - s.scrollTop + sr.top, slant: /L/.test(d) } }) } })
  // The previous chapter's end mark (its last line near the foot of the page before) may push it down: then its tick is at the heading, slanting to the mark.
  const at = long.mark && long.head != null && (Math.abs(long.mark.top - long.head) <= 2 ? long.ticks.some(t => Math.abs(t.y - long.head) <= 2 && !t.slant) : long.ticks.some(t => Math.abs(t.y - long.head) <= 2 && t.slant && Math.abs(t.end - long.mark.top) <= 2))
  ok('5. a chapter at a page\'s top (the long book, night): its start rule at its heading\'s top, or pushed with its tick from the heading', at, long)
  ok('5. no page errors', !L.problems.length, L.problems)
  await L.ctx.close()
  // Phones and narrow windows are unchanged: no marks.
  const P = await readerPage(browser, origin, hex, { width: 390, height: 844, look: 'paper' })
  await P.page.waitForTimeout(800)
  ok('6. a phone shows no unit marks (unchanged)', !(await P.page.$('.mr-unit')))
  await P.ctx.close()
  const N = await readerPage(browser, origin, hex, { width: 1024, height: 768, look: 'paper' })
  await N.page.waitForTimeout(800)
  ok('6. a narrow window shows no unit marks (unchanged)', !(await N.page.$('.mr-unit')))
  await N.ctx.close()
  return results
}

/* table-crop (Anders, 19 Oct 2026, night, item 2; Constructor Theory p. 14, Table 1): (a) a boxed table's crop snaps to
   its rules and takes in its header above them and its row label set upwards at their left, never its caption; (b) the
   crop is drawn sharp (at least three times the size it is shown at, within its long side; the model still gets at
   most 1568 px); (c) its caption reads as printed ("Table 1: A classification of constructions", no stray spaces). On
   the wide column the figure's card shows no picture (the table is beside it) and starts with the caption; narrow
   windows and the chat keep a small picture, at most 120px tall, that opens the figure large. On the section paper's
   page 14 and, when it is here, the real PDF's (CT_PDF). */
const CT_PDF = process.env.CT_PDF || '/tmp/claude-0/-home-user-tinct/35906d38-b552-59f0-819b-6f696b0ab988/scratchpad/night/docs/constructor-theory.pdf'
async function tableCrop(browser, origin) {
  const results = [], ok = okList(results)
  // Each PDF: its page, the rules' box (PDF points: x0, y0, x1, y1 from the page's foot) and its page size.
  const cases = [{ name: 'section paper', file: SECTION_PAPER, page: 14, rules: [190, 350, 440, 540], size: [612, 792], line: 0.3 }]
  if (existsSync(CT_PDF)) cases.push({ name: 'Constructor Theory', file: CT_PDF, page: 14, rules: [197.64, 241.29, 430.92, 325.05], size: [595.29, 841.89], line: 0 })
  for (const c of cases) {
    const hex = addBook(c.file)
    account.cards.clear()
    const A = await readerPage(browser, origin, hex, { width: 1440, height: 900, look: 'paper' })
    const a = A.page
    await prefetchSettled(a)
    await a.evaluate(n => goTo({ page: n, frac: 0.45 }), c.page); await a.waitForTimeout(900)
    await a.waitForFunction(n => state.figs.has(n) && state.pages[n - 1].captions?.some(x => x.label === 'Table 1'), c.page, { timeout: 20000 }).catch(() => {})
    const got = await a.evaluate(({ page: n, rules, size, line }) => {
      const p = state.pages[n - 1], pr = p.pg.getBoundingClientRect(), cap = (p.captions || []).find(x => x.label === 'Table 1'), f = cap && p.figures[cap.fig]
      const span = t => { const sp = [...p.layer.querySelectorAll('span')].find(s => s.textContent.trim() === t); if (!sp) return null; const r = sp.getBoundingClientRect(); return { x: (r.left - pr.left) / pr.width, y: (r.top - pr.top) / pr.height, w: r.width / pr.width, h: r.height / pr.height } }
      const box = { x: (rules[0] - line) / size[0], y: (size[1] - rules[3] - line) / size[1], w: (rules[2] - rules[0] + 2 * line) / size[0], h: (rules[3] - rules[1] + 2 * line) / size[1] }
      const want = [box, span('Input'), span('Output')].filter(Boolean).reduce((u, b) => { const x = Math.min(u.x, b.x), y = Math.min(u.y, b.y); return { x, y, w: Math.max(u.x + u.w, b.x + b.w) - x, h: Math.max(u.y + u.h, b.y + b.h) - y } })
      return { f, want, labels: [!!span('Input'), !!span('Output')], caption: cap?.text, capBox: cap?.box, pt: [1 / size[0], 1 / size[1]] }
    }, c)
    // (a) Each edge holds the rules and labels, and lies within the pad (3 pt) and 1.5 pt more of them.
    const edges = got.f && ['left', 'top', 'right', 'bottom'].map((e, i) => {
      const [fv, wv, pt] = [[got.f.x, got.want.x, got.pt[0]], [got.f.y, got.want.y, got.pt[1]], [got.f.x + got.f.w, got.want.x + got.want.w, got.pt[0]], [got.f.y + got.f.h, got.want.y + got.want.h, got.pt[1]]][i]
      const slack = (i < 2 ? wv - fv : fv - wv) / pt
      return { e, slack: Math.round(slack * 10) / 10 }
    })
    const clear = got.f && got.capBox && got.f.y + got.f.h <= got.capBox.y + 0.0005
    ok(`(a) ${c.name}: Table 1's crop snaps to its rules, with its header above and its row label at its left (each edge 0–4.5 pt outside them), never over its caption`, edges && got.labels.every(Boolean) && edges.every(x => x.slack >= -0.5 && x.slack <= 4.5) && clear, { edges, labels: got.labels, f: got.f, want: got.want, capBox: got.capBox })
    ok(`(c) ${c.name}: the caption reads as printed`, got.caption === 'Table 1: A classification of constructions', got.caption)
    // The card on the wide column: no picture, the caption first; Explain sends the table sharp (up to the model's 1568 px).
    const r0 = account.requests.length
    await a.evaluate(async n => { const p = state.pages[n - 1], cap = p.captions.find(x => x.label === 'Table 1'); await regionAction('explain', await regionItem(p, p.figures[cap.fig], 'figure')) }, c.page)
    await a.waitForFunction(() => { const card = cardById(col.open); return card && card.kind === 'figure' && card.turns.length >= 1 }, null, { timeout: 8000 }).catch(() => {})
    await a.waitForTimeout(600)
    const card = await a.evaluate(() => { const el = document.querySelector('.mr-doc .mr-card.is-open'); return el && { thumb: !!el.querySelector('.mr-thumb, img'), first: el.querySelector('.mr-card__body > :first-child')?.className, quote: el.querySelector('.mr-quote')?.textContent } })
    ok(`${c.name}: on the wide column the table's card shows no picture and starts with its caption`, card && !card.thumb && /mr-quote/.test(card.first || '') && card.quote === 'Table 1: A classification of constructions', card)
    await shot(a, `table-card-${c.name === 'section paper' ? 'fixture' : 'ct'}-after-1440x900`)
    const sent = chatsOf(r0).find(r => (r.body?.messages?.at(-1)?.content || []).some?.(b => b.type === 'image'))
    const pic = sent?.body.messages.at(-1).content.find(b => b.type === 'image')
    const side = pic ? await a.evaluate(async d => { const im = await createImageBitmap(await (await fetch('data:image/png;base64,' + d)).blob()); return Math.max(im.width, im.height) }, pic.source.data).catch(() => 0) : 0
    ok(`(b) ${c.name}: Explain sends the table at the model's full 1568 px (drawn larger, then sized down)`, side >= 1500 && side <= 1568, { side })
    // (b) The figure view: the picture at least three times the size it is shown at (within the crop's long side).
    await a.evaluate(() => openFigureView(cardById(col.open)))
    await a.waitForFunction(() => { const i = document.querySelector('.mr-figview img'); return i && i.complete && /^blob:/.test(i.src) && i.naturalWidth > 0 }, null, { timeout: 8000 }).catch(() => {})
    const view = await a.evaluate(() => { const i = document.querySelector('.mr-figview img'); if (!i) return null; const r = i.getBoundingClientRect(); return { nat: Math.max(i.naturalWidth, i.naturalHeight), css: Math.max(r.width, r.height), long: SNIP_LONG } })
    ok(`(b) ${c.name}: the figure view's picture is drawn at least 3x its shown size (or its full ${2400} px long side)`, view && view.nat >= Math.min(view.css * 3, view.long) - 2, view)
    await shot(a, `table-view-${c.name === 'section paper' ? 'fixture' : 'ct'}-1440x900`)
    await a.keyboard.press('Escape'); await a.waitForTimeout(200)
    ok(`${c.name}: Escape closes the figure view`, !(await a.$('.mr-figview')))
    ok(`${c.name}: no page errors`, !A.problems.length, A.problems)
    await A.ctx.close()
  }
  // Narrow windows and the chat: a small picture, at most 120px tall, sharp (3x), that opens the figure large.
  const hex = addBook(SECTION_PAPER)
  account.cards.clear()
  const N = await readerPage(browser, origin, hex, { width: 1024, height: 768, look: 'paper' })
  const n = N.page
  await prefetchSettled(n)
  await n.evaluate(() => goTo({ page: 14, frac: 0.45 })); await n.waitForTimeout(900)
  await n.waitForFunction(() => state.figs.has(14) && state.pages[13].captions?.some(x => x.label === 'Table 1'), null, { timeout: 20000 }).catch(() => {})
  await n.evaluate(async () => { const p = state.pages[13], cap = p.captions.find(x => x.label === 'Table 1'); await regionAction('explain', await regionItem(p, p.figures[cap.fig], 'figure')) })
  await n.waitForFunction(() => { const i = document.querySelector('.mr-card.is-open .mr-thumb img, .mr-sheet .mr-thumb img'); return i && i.complete && i.naturalWidth > 0 }, null, { timeout: 10000 }).catch(() => {})
  const small = await n.evaluate(() => { const i = document.querySelector('.mr-card.is-open .mr-thumb img, .mr-sheet .mr-thumb img'); if (!i) return { mode: col.mode }; const r = i.getBoundingClientRect(), ratio = i.naturalWidth / i.naturalHeight, shown = Math.min(r.width / ratio, r.height); return { mode: col.mode, height: Math.round(r.height), natural: i.naturalHeight, shown: Math.round(shown) } })
  ok('narrow window: the figure card keeps a small picture, at most 120px tall, drawn at 3x', small.height && small.height <= 120.5 && small.natural >= small.shown * 3 - 2, small)
  await shot(n, 'table-card-narrow-1024x768')
  await n.click('.mr-card.is-open .mr-thumb, .mr-sheet .mr-thumb'); await n.waitForTimeout(600)
  ok('narrow window: tapping the picture opens the figure large', !!(await n.$('.mr-figview img')))
  await n.keyboard.press('Escape'); await n.waitForTimeout(200)
  // The whole-document chat: an attached figure is shown at most 120px tall and opens large.
  await n.evaluate(async () => { openCard(null); const p = state.pages[13], cap = p.captions.find(x => x.label === 'Table 1'); const item = await regionItem(p, p.figures[cap.fig], 'figure'); openChat({ quiet: true }); await addAttachments([item], { snip: true }); ask('What does this table classify?') })
  await n.waitForFunction(() => { const i = document.querySelector('.tc-imgs img'); return i && i.complete && i.naturalWidth > 0 }, null, { timeout: 10000 }).catch(() => {})
  const inChat = await n.evaluate(() => { const i = document.querySelector('.tc-imgs img'); if (!i) return null; const r = i.getBoundingClientRect(); return { height: Math.round(r.height), natural: i.naturalHeight } })
  ok('chat: the attached table is at most 120px tall, drawn at 3x', inChat && inChat.height <= 120.5 && inChat.natural >= inChat.height * 3 - 2, inChat)
  await n.click('.tc-imgs .tc-img'); await n.waitForTimeout(600)
  const chatView = await n.evaluate(() => { const i = document.querySelector('.mr-figview img'); return i && { blob: /^blob:/.test(i.src), nat: i.naturalWidth } })
  ok('chat: tapping it opens it large, from the sharp crop', chatView && chatView.blob && chatView.nat > 1000, chatView)
  ok('no page errors', !N.problems.length, N.problems)
  await N.ctx.close()
  return results
}

/* ---------- 19 Oct 2026: the Notebook and EPUBs in Margin view (Anders) ---------- */
// Cards of every kind on the lines in view (a long answer, follow-ups), a note and a plain highlight, made
// minutes apart, in the reader's own store (as the margin keeps them). -> the ids, newest first
function seedNotebook() {
  const hdr = document.getElementById('hdr').getBoundingClientRect().bottom
  const spans = [...document.querySelectorAll('.pdf-sheet .text-layer span')].filter(s => { const r = s.getBoundingClientRect(); return r.width > 60 && r.top > hdr + 20 && r.bottom < innerHeight - 40 && (s.textContent || '').trim().length > 12 })
  const lines = []
  for (const s of spans) { const r = s.getBoundingClientRect(); if (!lines.some(l => Math.abs(l.r.top - r.top) < 4)) lines.push({ s, r }) }
  lines.sort((a, b) => a.r.top - b.r.top)
  const now = Date.now(), long = 'MOCK long answer. The passage sets out its claim in the first sentence and then qualifies it. ' + Array.from({ length: 9 }, (_, i) => `Sentence ${i + 2} adds a further point that the reader may want to weigh against the text.`).join(' ')
  const specs = [
    ['explain', [{ role: 'assistant', content: long }, { role: 'user', content: 'And what follows from it?' }, { role: 'assistant', content: 'MOCK follow-up answer. The next step is named {p. 3}.' }]],
    ['ask', [{ role: 'user', content: 'Why does the author say this here?' }, { role: 'assistant', content: 'MOCK ask answer. Because the chapter turns on it.' }]],
    ['simplify', [{ role: 'assistant', content: 'MOCK simplify. In plain words, the idea is small.' }]],
    ['factcheck', [{ role: 'assistant', content: 'Holds. MOCK verdict line.\n\nSources: [Mock source](https://example.org/one)' }]],
    ['counterpoint', [{ role: 'assistant', content: 'MOCK counterpoint. The strongest objection is the obvious one.' }]],
    ['define', [], { word: 'variance', senses: [{ text: 'How widely values spread around their mean.' }, { text: 'The fact of being different.' }] }],
    ['quiz', [], { questions: [{ q: 'MOCK Q1. What is named first?', answer: 'Ideas', why: 'It comes first.' }, { q: 'MOCK Q2. Why keep them apart?', answer: 'They are known differently', why: '' }], i: 0, results: [] }],
  ]
  const cards = specs.map(([kind, turns, data], i) => {
    const l = lines[i % lines.length], anchor = anchorOf([{ left: l.r.left, right: l.r.right, top: l.r.top, bottom: l.r.bottom }])
    return TinctMargin.newCard({ kind, page: anchor[0].n, anchor, text: (l.s.textContent || '').trim(), turns, data, at: now - (i + 3) * 60000 * 7 })
  })
  store.set('cards:' + state.key, cards)
  const mark = (i, note, at) => { const l = lines[(i + 7) % lines.length], b = state.pages[Number(l.s.closest('.pdf-sheet').dataset.page) - 1].pg.getBoundingClientRect(); const r = v => Math.round(v * 10000) / 10000; return { id: 'm' + i + at.toString(36), page: Number(l.s.closest('.pdf-sheet').dataset.page), rects: [[r((l.r.left - b.left) / b.width), r((l.r.top - b.top) / b.height), r(l.r.width / b.width), r(l.r.height / b.height)]], text: (l.s.textContent || '').trim(), color: 'gold', at, u: at, ...(note ? { note, withNote: true } : {}) } }
  store.set('hl:' + state.key, [mark(0, 'My own note on this line.', now - 60000 * 2), mark(1, '', now - 86400000 * 2)])
  col.view = null; marginLayout({ fresh: true })
  return cards.length + 2
}
const nbState = () => {
  const el = document.querySelector('.nb'); if (!el) return null
  const r = el.getBoundingClientRect(), list = el.querySelector('.nb-list')
  const entries = [...el.querySelectorAll('.nb-entry')].map(e => ({ id: e.dataset.id, kind: e.querySelector('.nb-kind')?.textContent, chip: e.querySelector('.nb-chip')?.textContent, time: e.querySelector('.nb-time')?.textContent, quote: !!e.querySelector('.nb-quote'), q: e.querySelectorAll('.nb-qa:not(.is-a)').length, a: e.querySelectorAll('.nb-qa.is-a').length, cut: !!e.querySelector('.nb-answer.is-cut'), more: !!e.querySelector('.nb-more:not([hidden])'), follow: !!e.querySelector('.nb-follow'), bin: !!e.querySelector('.nb-bin'), radius: parseFloat(getComputedStyle(e).borderTopLeftRadius) }))
  const quote = el.querySelector('.nb-quote'), qs = quote && getComputedStyle(quote)
  const fonts = [...el.querySelectorAll('*')].map(n => getComputedStyle(n).fontFamily).filter(f => /mono|courier|menlo|consolas/i.test(f))
  const caps = [...el.querySelectorAll('*')].filter(n => getComputedStyle(n).textTransform === 'uppercase').length
  return { open: true, inside: r.left >= 0 && r.right <= innerWidth && r.top >= document.getElementById('hdr').getBoundingClientRect().bottom && r.bottom <= innerHeight, width: r.width, title: el.querySelector('.nb-title')?.textContent, count: el.querySelector('.nb-count')?.textContent, filter: el.querySelector('[data-f][aria-checked="true"]')?.textContent, icons: [...el.querySelectorAll('.nb-icons button')].map(b => b.getAttribute('aria-label')), entries, rule: qs && [qs.borderLeftWidth, qs.borderLeftStyle], scrolls: list.scrollHeight > list.clientHeight ? getComputedStyle(list).overflowY : 'fits', mono: fonts.length, caps, button: document.getElementById('notebookBtn').getAttribute('aria-expanded') }
}
async function notebookCheck(browser, origin) {
  const results = [], ok = okList(results)
  const hex = addBook(PDFS[0])
  for (const [width, height] of [[1440, 900], [2000, 1066]]) {
    const tag = `notebook-${width}x${height}`
    const A = await readerPage(browser, origin, hex, { width, height, look: 'paper', startPage: 2 })
    const a = A.page
    await prefetchSettled(a)
    await A.ctx.grantPermissions(['clipboard-read', 'clipboard-write'], { origin })
    const seeded = await a.evaluate(seedNotebook)
    const btn = await a.evaluate(() => { const b = document.getElementById('notebookBtn'), r = b.getBoundingClientRect(), aa = document.getElementById('aaBtn').getBoundingClientRect(); return { shown: r.width > 0 && getComputedStyle(b).display !== 'none', w: r.width, h: r.height, sameRow: Math.abs((r.top + r.bottom) / 2 - (aa.top + aa.bottom) / 2) < 2, label: b.getAttribute('aria-label'), svg: !!b.querySelector('svg') } })
    ok(`${tag}: the top bar has the Notebook button beside Aa, in the toolbar's style`, btn.shown && btn.sameRow && btn.w === 34 && btn.h === 34 && btn.label === 'Notebook' && btn.svg, btn)
    await a.click('#notebookBtn'); await a.waitForSelector('.nb .nb-entry'); await a.waitForTimeout(200)
    let s = await a.evaluate(nbState)
    ok(`${tag}: it opens with "Notebook", the count line and copy, download and close`, s && s.title === 'Notebook' && s.count === `${seeded} entries` && s.icons.join() === 'Copy all,Download,Close' && s.button === 'true' && s.inside, s)
    ok(`${tag}: All lists every entry newest first, each a rounded card with its chip, kind, time and bin`, s.entries.length === seeded && s.entries.every(e => e.chip && e.kind && e.time && e.bin && e.radius >= 12) && s.entries[0].kind === 'Note' && s.entries[0].time === '2 min ago' && s.entries[s.entries.length - 1].kind === 'Highlight' && s.entries[s.entries.length - 1].time === '2 days ago', s.entries)
    ok(`${tag}: the kinds are named: Explain, Ask, Simplify, Define, Fact-check, Counterpoint, Quiz, Note, Highlight`, ['Explain', 'Ask', 'Simplify', 'Define · variance', 'Fact-check', 'Counterpoint', 'Quiz', 'Note', 'Highlight'].every(k => s.entries.some(e => e.kind === k)), s.entries.map(e => e.kind))
    const ex = s.entries.find(e => e.kind === 'Explain'), ask = s.entries.find(e => e.kind === 'Ask')
    ok(`${tag}: a quoted passage with an accent rule; Q and A rows; a long answer cut at four lines with "Read the whole answer"; follow-ups under a rule`, s.rule?.[0] === '2px' && s.rule[1] === 'solid' && ex.quote && ex.cut && ex.more && ex.follow && ask.q === 1 && ask.a === 1 && !ask.cut, { rule: s.rule, ex, ask })
    ok(`${tag}: no mono, no capitals`, s.mono === 0 && s.caps === 0, s)
    await shot(a, `${tag}-all`)
    // Read the whole answer: the answer in full, in place.
    const exId = ex.id
    await a.click(`.nb-entry[data-id="${exId}"] .nb-more`); await a.waitForTimeout(150)
    const whole = await a.evaluate(id => { const e = document.querySelector(`.nb-entry[data-id="${id}"] .nb-answer`); return { full: e.classList.contains('is-full'), h: e.getBoundingClientRect().height, sh: e.scrollHeight } }, exId)
    ok(`${tag}: "Read the whole answer" shows all of it`, whole.full && Math.abs(whole.h - whole.sh) < 2, whole)
    // The filter.
    await a.click('.nb [data-f="mine"]'); await a.waitForTimeout(150)
    s = await a.evaluate(nbState)
    ok(`${tag}: My notes: the reader's own notes and highlights only`, s.filter === 'My notes' && s.entries.length === 2 && s.entries.every(e => ['Note', 'Highlight'].includes(e.kind)) && s.count === '2 entries', s)
    await shot(a, `${tag}-mine`)
    await a.click('.nb [data-f="ai"]'); await a.waitForTimeout(150)
    s = await a.evaluate(nbState)
    ok(`${tag}: AI: the companion's answers only`, s.filter === 'AI' && s.entries.length === seeded - 2 && s.entries.every(e => !['Note', 'Highlight'].includes(e.kind)) && s.count === `${seeded - 2} entries`, s)
    await shot(a, `${tag}-ai`)
    await a.click('.nb [data-f="all"]'); await a.waitForTimeout(150)
    await a.keyboard.press('Escape'); await a.waitForTimeout(150)
    const esc0 = await a.evaluate(() => ({ open: !!document.querySelector('.nb'), focus: document.activeElement?.id }))
    ok(`${tag}: Escape closes it and returns to the button`, !esc0.open && esc0.focus === 'notebookBtn', esc0)
    await a.click('#notebookBtn'); await a.waitForSelector('.nb .nb-entry')
    // Live: a card made with the Notebook open appears at the top.
    await a.evaluate(() => { document.querySelector('.nb').style.visibility = 'hidden' })
    mock.next = 'MOCK live answer. Made while the Notebook was open.'
    await selectText(a, { near: 'top' }); await a.waitForSelector('.mr-float [data-m="explain"]', { timeout: 5000 }).catch(() => {})
    await a.click('.mr-float [data-m="explain"]').catch(() => {}); await a.waitForTimeout(1500)
    await a.evaluate(() => { document.querySelector('.nb').style.visibility = '' })
    s = await a.evaluate(nbState)
    ok(`${tag}: live: an answer made while it is open is listed at once, at the top`, s.entries.length === seeded + 1 && s.entries[0].kind === 'Explain' && s.entries[0].time === 'Just now' && s.count === `${seeded + 1} entries`, s.entries.slice(0, 2))
    await a.evaluate(() => { openCard(null) })
    // Jump: clicking an entry brings its passage into view and opens its card in the margin.
    await a.evaluate(() => goTo({ page: 1, frac: 0 })); await a.waitForTimeout(500)
    const askId = ask.id
    await a.click(`.nb-entry[data-id="${askId}"] .nb-kind`); await a.waitForTimeout(1400)
    const jumped = await a.evaluate(id => { const c = cardById(id), f = TinctMargin.firstRect(c), p = state.pages[f[0] - 1], b = p.pg.getBoundingClientRect(), y = b.top + f[2] * b.height, sr = document.getElementById('scroll').getBoundingClientRect(), el = document.querySelector(`.mr-card.is-open[data-id="${id}"]`), r = el?.getBoundingClientRect(), top = r && document.elementFromPoint(r.left + r.width / 2, r.top + Math.min(20, r.height / 2)); return { open: col.open, inView: y > sr.top && y < sr.bottom - 60, shown: !!r && r.width > 0 && r.right <= innerWidth, seen: !!top && el.contains(top), panel: !!document.querySelector('.nb') } }, askId)
    ok(`${tag}: clicking an entry jumps to its passage and opens its card in the margin, seen (the Notebook steps aside)`, jumped.open === askId && jumped.inView && jumped.shown && jumped.seen && !jumped.panel, jumped)
    await shot(a, `${tag}-jump`)
    // A note's entry opens the note's card; a plain highlight is flashed.
    const noteId = s.entries.find(e => e.kind === 'Note').id
    await a.click('#notebookBtn'); await a.waitForSelector('.nb .nb-entry')
    ok(`${tag}: reopened, it is as it was left (the filter, the list)`, (await a.evaluate(nbState)).filter === 'All', null)
    await a.click(`.nb-entry[data-id="${noteId}"] .nb-kind`); await a.waitForTimeout(1200)
    ok(`${tag}: a note's entry opens its note in the margin`, await a.evaluate(id => col.open === id, noteId), await a.evaluate(() => col.open))
    // Delete with Undo.
    const before = await a.evaluate(() => (store.get('cards:' + state.key) || []).filter(c => !c.gone).length)
    await a.evaluate(() => openCard(null)); await a.click('#notebookBtn'); await a.waitForSelector('.nb .nb-entry')
    await a.click(`.nb-entry[data-id="${askId}"] .nb-bin`); await a.waitForTimeout(250)
    const del = await a.evaluate(id => ({ gone: !document.querySelector(`.nb-entry[data-id="${id}"]`), undo: !!document.querySelector('.nb .nb-undo button'), stored: (store.get('cards:' + state.key) || []).find(c => c.id === id)?.gone === true, colUndo: !!document.querySelector('.mr-undo:not(.nb-undo)'), count: document.querySelector('.nb-count').textContent }), askId)
    ok(`${tag}: the bin deletes the entry and its card (a tombstone), with "Deleted · Undo" in its place`, del.gone && del.undo && del.stored && !del.colUndo && del.count === `${seeded} entries`, del)
    await a.click('.nb .nb-undo button'); await a.waitForTimeout(250)
    const back = await a.evaluate(id => ({ back: !!document.querySelector(`.nb-entry[data-id="${id}"]`), stored: (store.get('cards:' + state.key) || []).filter(c => !c.gone).length }), askId)
    ok(`${tag}: Undo puts it back`, back.back && back.stored === before, { back, before })
    const hlId = (await a.evaluate(nbState)).entries.find(e => e.kind === 'Highlight').id
    await a.click(`.nb-entry[data-id="${hlId}"] .nb-bin`); await a.waitForTimeout(250)
    const hlGone = await a.evaluate(() => highlights().length)
    await a.click('.nb .nb-undo button'); await a.waitForTimeout(250)
    ok(`${tag}: a highlight's bin removes it, and Undo restores it`, hlGone === 1 && await a.evaluate(() => highlights().length) === 2, hlGone)
    if (!(await a.evaluate(() => !!document.querySelector('.nb')))) { await a.click('#notebookBtn'); await a.waitForSelector('.nb .nb-entry') }
    // Copy all and Download: Markdown made on the device.
    const r0 = account.requests.length
    await a.click('.nb [data-nb="copy"]'); await a.waitForTimeout(300)
    const clip = await a.evaluate(() => navigator.clipboard.readText()).catch(() => '')
    ok(`${tag}: Copy all copies the entries as Markdown`, /^# A Treatise of Small Things: notebook\n\nAnn Example\n/.test(clip) && /\n## Ask · p\. \d+/.test(clip) && /\*\*Q\.\*\* Why does the author say this here\?/.test(clip) && /\n> /.test(clip), clip.slice(0, 300))
    const [dl] = await Promise.all([a.waitForEvent('download'), a.click('.nb [data-nb="download"]')])
    const file = join(OUT, `${tag}-download.md`); await dl.saveAs(file)
    const md = readFileSync(file, 'utf8')
    ok(`${tag}: Download saves a Markdown file of everything, made on this device (no request)`, dl.suggestedFilename() === 'A Treatise of Small Things notebook.md' && md.split('\n## ').length - 1 === seeded + 1 && /My own note on this line\./.test(md) && /MOCK follow-up answer\. The next step is named \(p\. 3\)\./.test(md) && account.requests.slice(r0).every(r => r.path === '/api/events'), { name: dl.suggestedFilename(), entries: md.split('\n## ').length - 1 })
    // Its close button closes it; the focus goes back to the button.
    await a.click('.nb [data-nb="close"]'); await a.waitForTimeout(150)
    const shut = await a.evaluate(() => ({ open: !!document.querySelector('.nb'), focus: document.activeElement?.id, expanded: document.getElementById('notebookBtn').getAttribute('aria-expanded') }))
    ok(`${tag}: its close button closes it and returns to the top bar's button`, !shut.open && shut.focus === 'notebookBtn' && shut.expanded === 'false', shut)
    // Night: the same panel in the night look.
    await a.evaluate(() => setTheme('dark')); await a.waitForTimeout(400)
    await a.click('#notebookBtn'); await a.waitForSelector('.nb .nb-entry')
    const night = await a.evaluate(() => { const el = document.querySelector('.nb'); return { bg: getComputedStyle(el).backgroundColor, ink: getComputedStyle(el.querySelector('.nb-kind')).color } })
    ok(`${tag}: in Night it takes the margin's night colours`, night.bg === 'rgb(31, 27, 23)' && night.ink !== 'rgb(11, 11, 11)', night)
    await shot(a, `${tag}-night`)
    await a.evaluate(() => setTheme('light'))
    ok(`${tag}: no page errors`, !A.problems.length, A.problems)
    await A.ctx.close()
  }
  // The margin batch (19 Oct 2026): the core branch's new cards in the Notebook. A margin note and a unit's note under
  // "My notes"; a unit's pill cards (Catch me up, Recap, its quiz) and a Fact-check under "AI", Fact-check as its card shows it.
  {
    const tag = 'notebook-batch-1440x900'
    const hexL = addBook(LONG_BOOK)
    account.marks.clear(); account.cards.clear()
    const B = await readerPage(browser, origin, hexL, { width: 1440, height: 900, look: 'paper' })
    const b = B.page
    await prefetchSettled(b)
    // Catch me up from the second unit's start (the first has none since 20 Oct 2026: nothing to catch up on yet).
    await b.evaluate(() => { openCard(null); closePrimer(); goTo({ page: primer.units[1].start, frac: 0 }) }); await b.waitForTimeout(800)
    await b.click(`.mr-doc .mr-unit.is-start[data-unit="${await b.evaluate(() => primer.units[1].key)}"] .mr-pill[data-pill="catchup"]`); await b.waitForTimeout(1300)
    await b.evaluate(() => openCard(null)); await b.waitForTimeout(200)
    await b.evaluate(() => { const u = primer.units[0]; goTo({ page: u.to, frac: 0.75 }) }); await b.waitForTimeout(900)
    await b.click('.mr-doc .mr-unit.is-end .mr-pill[data-pill="recap"]'); await b.waitForTimeout(1300)
    await b.click('.mr-doc .mr-unit.is-end .mr-pill[data-pill="quiz"]'); await b.waitForTimeout(1300)
    await b.click('.mr-doc .mr-unit.is-end .mr-pill[data-pill="note"]'); await b.waitForTimeout(500)
    await b.keyboard.type('My note on the whole chapter.')
    await b.mouse.click(300, 500); await b.waitForTimeout(500)
    await b.evaluate(() => { openCard(null); goTo({ page: 2, frac: 0.1 }) }); await b.waitForTimeout(900)
    const x = await b.evaluate(() => Math.round(document.querySelector('.mr-doc').getBoundingClientRect().left + 190))
    await b.mouse.click(x, 560); await b.waitForTimeout(500)
    await b.keyboard.type('My margin thought for the Notebook.')
    await b.evaluate(() => { const p = state.pages.find(q => q.pg.getBoundingClientRect().bottom > 400).pg.getBoundingClientRect(); return { x: p.left + 30, y: 640 } }).then(p => b.mouse.click(p.x, p.y)); await b.waitForTimeout(500)
    // A Fact-check kept with a restating opening and an empty Sources line (as before the verdict-first prompt).
    await b.evaluate(() => { const card = TinctMargin.newCard({ kind: 'factcheck', page: 2, anchor: [{ n: 2, x: 0.12, y: 0.3, w: 0.6, h: 0.02 }], text: 'A passage that makes a claim.', turns: [{ role: 'assistant', content: 'The passage claims that MOCK opening restates it {p. 2}.\n\nHolds. MOCK verdict first.\n\nSources: none searched yet.' }], at: Date.now() - 60000 }); store.set('cards:' + state.key, [...keptCards(), card]); col.view = null; marginLayout({ fresh: true }) })
    await b.click('#notebookBtn'); await b.waitForSelector('.nb .nb-entry'); await b.waitForTimeout(200)
    const all = await b.evaluate(nbState)
    const named = k => all.entries.filter(e => e.kind === k)
    const unitLabel = await b.evaluate(() => TinctMargin.unitPhrase(primer.units[0]))
    ok(`${tag}: All lists the margin note, the unit's note, Catch me up, Recap, the unit's quiz and the Fact-check`, named('Note').length === 2 && named('Catch me up').length === 1 && named('Recap').length === 1 && named('Quiz').length === 1 && named('Fact-check').length === 1 && all.count === '6 entries', all.entries.map(e => [e.kind, e.chip]))
    // (Catch me up is the second unit's since 20 Oct 2026: the first has none.)
    ok(`${tag}: a pill card's place chip is its unit`, named('Recap')[0]?.chip && named('Recap')[0].chip === named('Quiz')[0]?.chip && !!named('Catch me up')[0]?.chip && named('Catch me up')[0].chip !== named('Recap')[0].chip, { chip: named('Recap')[0]?.chip, catchup: named('Catch me up')[0]?.chip, unitLabel })
    const fc = await b.evaluate(id => document.querySelector(`.nb-entry[data-id="${id}"] .nb-answer`)?.innerText || '', named('Fact-check')[0]?.id)
    ok(`${tag}: Fact-check is listed as its card shows it: the verdict first, no restating opening, no empty Sources line`, /^(Answer:\s*)?Holds\. MOCK verdict first\./.test(fc) && !/passage claims|none searched/i.test(fc), fc)
    await b.click('.nb [data-f="mine"]'); await b.waitForTimeout(150)
    const mine = await b.evaluate(nbState)
    const notes = await b.evaluate(() => [...document.querySelectorAll('.nb-entry .nb-note')].map(n => n.textContent))
    const noteStyles = await b.evaluate(() => [...document.querySelectorAll('.nb-entry .nb-note')].map(n => getComputedStyle(n).fontStyle))
    ok(`${tag}: the Notebook sets every note's text upright (font-style normal)`, noteStyles.length >= 2 && noteStyles.every(v => v === 'normal'), noteStyles)
    ok(`${tag}: My notes: the margin note and the unit's note (no passage quoted)`, mine.entries.length === 2 && mine.entries.every(e => e.kind === 'Note' && !e.quote) && notes.includes('My margin thought for the Notebook.') && notes.includes('My note on the whole chapter.'), { entries: mine.entries, notes })
    await shot(b, `${tag}-mine`)
    await b.click('.nb [data-f="ai"]'); await b.waitForTimeout(150)
    const ai = await b.evaluate(nbState)
    ok(`${tag}: AI: Catch me up, Recap, Quiz and Fact-check, no notes`, ai.entries.length === 4 && ['Catch me up', 'Recap', 'Quiz', 'Fact-check'].every(k => ai.entries.some(e => e.kind === k)) && !ai.entries.some(e => e.kind === 'Note'), ai.entries.map(e => e.kind))
    await shot(b, `${tag}-ai`)
    // Jump: a Recap entry opens its card under the unit's end pills; a margin note's entry opens the note.
    await b.evaluate(() => goTo({ page: 1, frac: 0 })); await b.waitForTimeout(500)
    const recapId = ai.entries.find(e => e.kind === 'Recap').id
    await b.click(`.nb-entry[data-id="${recapId}"] .nb-kind`); await b.waitForTimeout(1400)
    const seenCard = id => b.evaluate(id => { const el = document.querySelector(`.mr-card.is-open[data-id="${id}"]`), r = el?.getBoundingClientRect(), sr = document.getElementById('scroll').getBoundingClientRect(), top = r && document.elementFromPoint(r.left + r.width / 2, Math.max(r.top, sr.top) + 10); return { open: col.open, shown: !!r && r.width > 0 && r.top < sr.bottom - 40 && r.bottom > sr.top + 40, seen: !!top && el.contains(top), panel: !!document.querySelector('.nb'), name: el?.querySelector('.mr-card__name')?.textContent } }, id)
    const rj = await seenCard(recapId)
    ok(`${tag}: a Recap entry jumps to the unit's end and opens its card there, seen`, rj.open === recapId && rj.shown && rj.seen && !rj.panel && /^Recap · /.test(rj.name || ''), rj)
    await shot(b, `${tag}-jump-recap`)
    await b.evaluate(() => { openCard(null); goTo({ page: 1, frac: 0 }) }); await b.waitForTimeout(500)
    await b.click('#notebookBtn'); await b.waitForSelector('.nb .nb-entry')
    await b.click('.nb [data-f="mine"]'); await b.waitForTimeout(150)
    const noteId = await b.evaluate(() => [...document.querySelectorAll('.nb-entry')].find(e => /My margin thought/.test(e.textContent))?.dataset.id)
    await b.click(`.nb-entry[data-id="${noteId}"] .nb-kind`); await b.waitForTimeout(1400)
    const nj = await seenCard(noteId)
    ok(`${tag}: a margin note's entry jumps to it and opens the note, seen`, nj.open === noteId && nj.shown && nj.seen && !nj.panel, nj)
    ok(`${tag}: no page errors`, !B.problems.length, B.problems)
    await B.ctx.close()
  }
  // Phones: no Notebook (the phone is unchanged).
  const P = await readerPage(browser, origin, hex, { width: 390, height: 844, look: 'paper' })
  const phone = await P.page.evaluate(() => { const b = document.getElementById('notebookBtn'); return { display: getComputedStyle(b).display, w: b.getBoundingClientRect().width } })
  ok('notebook-390x844: no Notebook button on a phone', phone.display === 'none' && phone.w === 0, phone)
  await P.ctx.close()
  return results
}

// An EPUB of the account (the anthology), as My shelf and the library open it.
function addEpub() {
  const sha256 = createHash('sha256').update(EPUB).digest('hex')
  if (!account.books.some(b => b.sha256 === sha256)) account.books.push({ id: sha256.slice(0, 32), name: 'anthology.epub', title: 'Lamplight Essays', author: 'Ed Itor', type: 'epub', size: EPUB.length, sha256, createdAt: new Date().toISOString(), cover: null, bytes: EPUB })
  return sha256.slice(0, 24)
}
// The essay collection, in the account as My shelf and the library open it.
function addEssays() {
  const sha256 = createHash('sha256').update(ESSAYS).digest('hex')
  if (!account.books.some(b => b.sha256 === sha256)) account.books.push({ id: sha256.slice(0, 32), name: 'lamplit-conjectures.epub', title: 'Lamplit Conjectures, Volume II', author: 'Gale Editor', type: 'epub', size: ESSAYS.length, sha256, createdAt: new Date().toISOString(), cover: null, bytes: ESSAYS })
  return sha256.slice(0, 24)
}
async function epubPage(browser, origin, hex, { width, height, look = 'paper', init = null }) {
  const ctx = await browser.newContext({ viewport: { width, height }, hasTouch: width < 700 })
  await ctx.addInitScript(([session, look]) => {
    try {
      if (!sessionStorage.getItem('nb-init')) {
        sessionStorage.setItem('nb-init', '1')
        localStorage.setItem('sb-local-auth-token', JSON.stringify(session))
        localStorage.setItem('tinct-lab-prefs', JSON.stringify({ theme: { paper: 'light', night: 'dark' }[look] || 'light' }))
      }
    } catch {}
  }, [SESSION, look])
  const page = await ctx.newPage(), problems = [], navs = []
  page.on('pageerror', e => problems.push('pageerror: ' + e.message))
  page.on('framenavigated', f => { if (f === page.mainFrame()) navs.push(f.url()) })
  if (init) await page.addInitScript(init)
  await page.goto(`${origin}/lab/addbook/?userBook=${hex}`)
  return { ctx, page, problems, navs }
}
// The paragraph and word at the top of the view, by the words there (they never move with the width or size).
const spotNow = () => { const s = epubSpot(), place = currentPlace(); return { page: place.page, para: s.para, word: s.word, quote: s.quote } }
// The EPUB reader at rest: this open's place gone back to (reader.js epubHold.opened), no way there (settling) or
// reflow (a text size, a width, a late font) under way, its fonts in. What the place checks mean by "then": a fixed
// wait read the place before a slow runner had restored it (CI, 20 Oct 2026: a reload read a line early, and the
// zoom that followed held that line). `width`: a window resize, whose reflow starts on its resize event.
async function epubSettled(page, { width } = {}) {
  if (width) await page.waitForFunction(w => innerWidth === w, width, { timeout: 10000 })
  const frames = () => page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))))
  const rest = () => page.waitForFunction(() => isEpub() && epubHold.opened === state.token && !epubHold.settling && !epubHold.reflow && document.fonts.status === 'loaded', null, { timeout: 20000 })
  await frames(); await rest(); await frames(); await rest()
}
/* A PDF's Tinct text in Margin view (Anders, 20 Oct 2026, item s; mockup 2b): on the desktop "Tinct text" reflows the PDF
   here, on Tinct paper beside the margin, never the Tinct reader; "Original pages" goes back to the same place. */
async function pdfTextCheck(browser, origin) {
  const results = [], ok = okList(results)
  for (const [label, file] of [['prose', join(REPO, 'addbooks/web/test/pdf-fixtures/prose_book.pdf')], ['figures', MARGIN_PAPER]]) {
    const hex = addBook(file), tag = `pdf-text-${label}`
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
    await ctx.addInitScript(([session, hex]) => {
      try {
        if (sessionStorage.getItem('seeded')) return
        sessionStorage.setItem('seeded', '1')
        localStorage.setItem('sb-local-auth-token', JSON.stringify(session))
        localStorage.setItem('tinct-lab-prefs', JSON.stringify({ theme: 'dark' }))
        localStorage.setItem('tinct-addbook:edition:' + hex, JSON.stringify('pages'))
      } catch {}
    }, [SESSION, hex])
    await ctx.route('**/reader?userBook=*', r => r.fulfill({ status: 200, contentType: 'text/html', body: '<!doctype html><title>Tinct reader</title>' }))
    const page = await ctx.newPage(), problems = [], navs = []
    page.on('pageerror', e => problems.push('pageerror: ' + e.message))
    page.on('framenavigated', f => { if (f === page.mainFrame()) navs.push(new URL(f.url()).pathname) })
    await page.goto(`${origin}/lab/addbook/?userBook=${hex}`)
    await page.waitForFunction(() => state.scan && toc.ready && document.querySelectorAll('.pdf-sheet .text-layer span').length > 20, null, { timeout: 30000 })
    await page.waitForTimeout(800)
    // Read to page 2, a third of the way down; a highlight made there on the PDF.
    const before = await page.evaluate(() => { goTo({ page: Math.min(2, state.pages.length), frac: 0.3 }); onScroll(); savePlaceNow(); return currentPlace() })
    await page.waitForTimeout(600)
    const marked = await page.evaluate(() => {
      const p = state.pages[Math.min(2, state.pages.length) - 1], spans = [...(p.layer?.querySelectorAll('span') || [])].filter(s => (s.textContent || '').trim().split(/\s+/).length >= 6)
      const sp = spans[Math.floor(spans.length / 2)]; if (!sp) return null
      const r = document.createRange(); r.selectNodeContents(sp); getSelection().removeAllRanges(); getSelection().addRange(r)
      const text = getSelection().toString().replace(/\s+/g, ' ').trim()
      const ids = addHighlight({ text }); getSelection().removeAllRanges()
      return { text, ids }
    })
    const navsBefore = navs.length
    // Read in its pages, its Tinct text is prepared in idle time and kept on its record with its crops (20 Oct 2026, speed).
    let prepared = false
    for (let k = 0; k < 80 && !prepared; k++) {
      prepared = await page.evaluate(async () => { const r = await library.get(state.key); return !!(r?.edition && TinctPdfText.usable(r.edition) && (r.figureData || !r.edition.chapters.some(c => c.figures?.length))) })
      if (!prepared) await page.waitForTimeout(250)
    }
    ok(`${tag}: read in its pages, its Tinct text is prepared in idle time and kept before Tinct text is chosen`, prepared)
    await page.click('#aaBtn'); await page.waitForSelector('.byob-aa-panel [data-layout="text"]')
    const chosen = Date.now()
    await page.click('.byob-aa-panel [data-layout="text"]')
    const shown = await page.waitForFunction(() => isPdfText() && document.querySelector('.pt-chapter') && marginOn(), null, { timeout: 30000 }).then(() => true).catch(() => false)
    console.log(`     ${tag}: Tinct text shown ${Date.now() - chosen} ms after it was chosen (prepared)`)
    await page.waitForTimeout(1500)
    const view = await page.evaluate(() => {
      const sheet = document.querySelector('.epub-sheet'), cs = sheet && getComputedStyle(sheet), pg = document.querySelector('.epub-pg'), font = pg && getComputedStyle(pg).fontFamily
      const s = epubSpot(), at = currentPlace(), pos = store.get('pos:pdf:' + hexOf(state.key))
      return { url: location.pathname + location.search, kind: state.kind, paper: root.classList.contains('is-paper'), sheetBg: cs?.backgroundColor, shadow: cs?.boxShadow, font, column: col.mode, pdfSheets: document.querySelectorAll('.pdf-sheet').length, heads: document.querySelectorAll('.pt-chapter .tb-title, .pt-chapter h3.pt-h').length, figs: [...document.querySelectorAll('.pt-fig img')].map(i => ({ w: i.naturalWidth, h: i.naturalHeight, shown: i.getBoundingClientRect().width })), at, spot: s, pdfPage: PT().pageAt(state.pdfText.edition, at.page, s.para || 0, s.word || 0), pos, hl: highlights().filter(h => h.via === 'pdf').map(h => h.text), aa: null }
    })
    ok(`${tag}: "Tinct text" on the desktop reflows the PDF inside Margin view, with no navigation to /reader`, shown && !navs.slice(navsBefore).some(p => p.startsWith('/reader')) && view.url.startsWith('/lab/addbook/?userBook=' + hex) && view.kind === 'epub' && view.pdfSheets === 0, { shown, navs, view })
    ok(`${tag}: Tinct paper (no white sheet or shadow), the reader's font, the margin's column beside it, chapter titles as headings`, view.paper && /rgba\(0, 0, 0, 0\)|transparent/.test(view.sheetBg) && (view.shadow === 'none' || !view.shadow) && !/mono/i.test(view.font) && view.column === 'column' && view.heads >= 1, view)
    ok(`${tag}: it opens at the same place: the PDF's page ${before.page} at the top of the view`, view.pdfPage?.page === before.page, { before, pdfPage: view.pdfPage, spot: view.spot })
    if (marked) ok(`${tag}: the highlight made on the PDF's page shows in the Tinct text (found by its words)`, view.hl.includes(marked.text) && await page.evaluate(() => [...CSS.highlights.keys()].some(k => k.startsWith('tinct-hl-'))), { marked, hl: view.hl })
    if (label === 'figures') ok(`${tag}: the PDF's figures stand in the text as crisp crops of the page`, view.figs.length >= 1 && view.figs.every(f => f.w >= f.shown && f.w > 0), view.figs)
    // A request from here reads the document as the PDF's pages, and its answer cites them.
    const r0 = account.requests.length
    await page.evaluate(() => {
      const p = state.pages.find(q => epubParas(q).some(el => el.textContent.split(/\s+/).length > 12)), el = epubParas(p).find(el => el.textContent.split(/\s+/).length > 12)
      el.scrollIntoView({ block: 'center' })
      const t = el.firstChild
      document.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerType: 'mouse' })); getSelection().setBaseAndExtent(t, 0, t, Math.min(t.length, 60))
      document.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, pointerType: 'mouse' }))
    })
    await page.waitForSelector('.mr-bar [data-m="explain"]', { timeout: 8000 }).catch(() => {})
    await page.click('.mr-bar [data-m="explain"]').catch(() => {})
    await page.waitForTimeout(1500)
    const req = account.requests.slice(r0).find(r => r.body?.companion?.intent === 'explain')
    const doc = req?.body?.companion?.document
    ok(`${tag}: Explain in the Tinct text sends the document as the PDF's pages (kind pdf, its page numbers)`, doc?.kind === 'pdf' && doc.units?.length === await page.evaluate(() => state.pdfText.pages) && doc.units[0].n === '1', { kind: doc?.kind, units: doc?.units?.map(u => u.n) })
    const label0 = await page.evaluate(() => { const c = keptCards().filter(c => !c.gone).at(-1); return c ? cardName(c) : null })
    ok(`${tag}: its card names the PDF page its passage is printed on`, /· p\. \d+$/.test(label0 || ''), label0)
    if (process.env.EPUB_SHOTS && label === 'figures') { mkdirSync(process.env.EPUB_SHOTS, { recursive: true }); await page.screenshot({ path: join(process.env.EPUB_SHOTS, 'pdf-tinct-text.png') }) }
    await page.keyboard.press('Escape'); await page.mouse.click(5, 895)
    // Back: "Original pages", at the same place.
    const spotNowText = await page.evaluate(() => { const at = currentPlace(), s = epubSpot(); return PT().pageAt(state.pdfText.edition, at.page, s.para || 0, s.word || 0) })
    await page.click('#aaBtn'); await page.waitForSelector('.byob-aa-panel [data-layout="pages"]')
    const aa = await page.evaluate(() => [...document.querySelectorAll('.byob-aa-panel [data-layout]')].map(b => b.dataset.layout))
    await page.click('.byob-aa-panel [data-layout="pages"]')
    const back = await page.waitForFunction(() => state.kind === 'pdf' && document.querySelectorAll('.pdf-sheet .text-layer span').length > 20, null, { timeout: 30000 }).then(() => true).catch(() => false)
    await page.waitForTimeout(1200)
    const after = await page.evaluate(() => ({ at: currentPlace(), edition: store.get('edition:' + hexOf(state.key)), url: location.pathname + location.search }))
    ok(`${tag}: the Aa panel offers Tinct text (chosen) and Original pages, and Original pages goes back to the same page`, JSON.stringify(aa) === '["margin","pages"]' && back && after.at.page === spotNowText?.page && Math.abs(after.at.frac - spotNowText.frac) < 0.2 && after.edition === 'pages', { aa, spotNowText, after })
    ok(`${tag}: no page errors`, !problems.length, problems)
    await ctx.close()
  }
  // Chosen at once, before any idle time (20 Oct 2026, speed): the text opens before its crops are drawn, each standing at its
  // size until it comes; the place does not move as they come, and the text is kept with all of them.
  {
    const hex = addBook(FIGURE_PAPER), tag = 'pdf-text-at-once'
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 })
    await ctx.addInitScript(([session, hex]) => {
      try {
        if (sessionStorage.getItem('seeded')) return
        sessionStorage.setItem('seeded', '1')
        localStorage.setItem('sb-local-auth-token', JSON.stringify(session))
        localStorage.setItem('tinct-addbook:edition:' + hex, JSON.stringify('text'))
        localStorage.setItem('tinct-addbook:pos:pdf:' + hex, JSON.stringify({ page: 3, frac: 0.2, at: Date.now() }))
      } catch {}
      // Each crop a while in coming, so the text is read while they are drawn.
      const toBlob = HTMLCanvasElement.prototype.toBlob
      HTMLCanvasElement.prototype.toBlob = function (...a) { setTimeout(() => toBlob.apply(this, a), 700) }
    }, [SESSION, hex])
    await ctx.route('**/reader?userBook=*', r => r.fulfill({ status: 200, contentType: 'text/html', body: '<!doctype html><title>Tinct reader</title>' }))
    const page = await ctx.newPage(), problems = []
    page.on('pageerror', e => problems.push('pageerror: ' + e.message))
    const started = Date.now()
    await page.goto(`${origin}/lab/addbook/?userBook=${hex}`)
    const shown = await page.waitForFunction(() => isPdfText() && document.querySelector('.pt-chapter .pt-fig'), null, { timeout: 30000 }).then(() => true).catch(() => false)
    const opened = Date.now() - started
    await page.waitForTimeout(600)
    const first = await page.evaluate(() => ({ waiting: document.querySelectorAll('.pt-fig img[data-wait]').length, figs: document.querySelectorAll('.pt-fig').length, spot: epubSpot(), boxes: [...document.querySelectorAll('.pt-fig img')].map(i => [i.offsetWidth, i.offsetHeight]) }))
    console.log(`     ${tag}: Tinct text shown ${opened} ms after the page was asked for; 0.6 s later ${first.waiting} of ${first.figs} crops still being drawn`)
    let all = null
    for (let k = 0; k < 80; k++) {
      all = await page.evaluate(async () => { const r = await library.get(PT().pdfKey(state.key)); return {  waiting: document.querySelectorAll('.pt-fig img[data-wait]').length, kept: !!r?.figureData && Object.keys(r.figureData).length, spot: epubSpot(), boxes: [...document.querySelectorAll('.pt-fig img')].map(i => [i.offsetWidth, i.offsetHeight]), drawn: [...document.querySelectorAll('.pt-fig img')].every(i => i.src.startsWith('blob:') && i.naturalWidth > 0) } })
      if (!all.waiting && all.kept && all.drawn) break
      await page.waitForTimeout(250)
    }
    ok(`${tag}: chosen at once, the Tinct text opens with its crops standing at their size while they are drawn`, shown && first.figs >= 1 && first.waiting >= 1, first)
    ok(`${tag}: every crop comes in, at the size it stood at, and the text is kept with them`, !all.waiting && all.drawn && all.kept === first.figs && JSON.stringify(all.boxes) === JSON.stringify(first.boxes), { first, all })
    ok(`${tag}: the place does not move as the crops come`, JSON.stringify(all.spot) === JSON.stringify(first.spot), { first: first.spot, after: all.spot })
    ok(`${tag}: no page errors`, !problems.length, problems)
    await ctx.close()
  }
  return results
}
async function epubViewCheck(browser, origin) {
  const results = [], ok = okList(results)
  const hex = addEpub(), key = 'epub:' + hex
  for (const [width, height] of [[1440, 900], [2000, 1066]]) {
    const tag = `epub-view-${width}x${height}`
    const E = await epubPage(browser, origin, hex, { width, height })
    const e = E.page
    await e.waitForSelector('.epub-sheet:not(.is-toc) .epub-pg', { timeout: 30000 }); await e.waitForTimeout(1200)
    await epubSettled(e); await e.waitForFunction(() => col.mode != null, null, { timeout: 10000 }).catch(() => {})
    const opened = await e.evaluate(() => ({ url: location.pathname + location.search, kind: state.kind, margin: marginOn(), mode: col.mode, dock: !!document.querySelector('.byob-dock'), nb: getComputedStyle(document.getElementById('notebookBtn')).display !== 'none' }))
    ok(`${tag}: the EPUB opens here, in Margin view (its column), at its own address, with the Notebook`, opened.url === `/lab/addbook/?userBook=${hex}` && opened.kind === 'epub' && opened.margin && opened.mode === 'column' && !opened.dock && opened.nb, opened)
    // The Aa panel: Margin view, and Convert to Tinct book.
    await e.click('#aaBtn'); await e.waitForSelector('.byob-aa-panel')
    const aa = await e.evaluate(() => [...document.querySelectorAll('.byob-aa-panel [data-layout]')].map(b => [b.dataset.layout, b.textContent.trim(), b.getAttribute('aria-pressed')]))
    ok(`${tag}: the Aa panel offers Margin view (chosen) and Convert to Tinct book`, JSON.stringify(aa) === JSON.stringify([['margin', 'Margin view (default)✓', 'true'], ['text', 'Convert to Tinct book', 'false']]), aa)
    await e.keyboard.press('Escape')
    // A place: chapter 3's third paragraph, some way in.
    await e.evaluate(() => { const p = state.pages[2], el = epubParas(p)[3]; goTo({ page: 3, frac: 0 }); return new Promise(r => requestAnimationFrame(() => requestAnimationFrame(() => { const s = document.getElementById('scroll'), b = el.getBoundingClientRect(); s.scrollTop += b.top - s.getBoundingClientRect().top + b.height * 0.4; r() }))) })
    await e.waitForTimeout(400); await epubSettled(e); await e.evaluate(() => savePlaceNow())
    const here = await e.evaluate(spotNow)
    const kept = await e.evaluate(k => store.get('pos:' + k), key)
    ok(`${tag}: the place is kept by paragraph and word, with its words`, here.page === 3 && here.para === 3 && kept.para === 3 && kept.word === here.word && kept.word > 0 && kept.quote === here.quote && kept.quote.split(' ').length >= 10, { here, kept })
    await shot(e, `${tag}-margin`)
    // A card and the Notebook on an EPUB: the chip names the chapter and paragraph; the entry jumps back.
    await e.evaluate(() => { const p = state.pages[3], t = epubParas(p)[2].firstChild, range = document.createRange(); range.setStart(t, 0); range.setEnd(t, 40); const info = { text: range.toString(), page: 4, range }; store.set('cards:' + state.key, [withSpan(TinctMargin.newCard({ kind: 'explain', page: 4, anchor: anchorOf(selectionShapes(range)), text: info.text, turns: [{ role: 'assistant', content: 'MOCK explain on an EPUB.' }] }), info)]); col.view = null; marginLayout({ fresh: true }) })
    await e.click('#notebookBtn'); await e.waitForSelector('.nb .nb-entry')
    const entry = await e.evaluate(nbState)
    // Named by the chapter's title as the pill names it (Anders, 20 Oct 2026: never "ch. 9", the file's spine index).
    ok(`${tag}: the Notebook lists an EPUB's card by chapter and paragraph`, entry.entries.length === 1 && entry.entries[0].chip === '2 Candles Considered ¶ 3' && entry.entries[0].kind === 'Explain', entry.entries)
    await shot(e, `${tag}-notebook`)
    await e.click('.nb-entry .nb-kind'); await e.waitForTimeout(1500)
    await e.waitForFunction(() => !!document.querySelector('.mr-card.is-open'), null, { timeout: 10000 }).catch(() => {})
    const jump = await e.evaluate(() => { const c = (store.get('cards:' + state.key) || [])[0], r = rangeFromOffsets(state.pages[c.span[0] - 1].pg, c.span[1], c.span[2]).getClientRects()[0], sr = document.getElementById('scroll').getBoundingClientRect(); return { open: col.open === c.id, inView: r.top > sr.top && r.bottom < sr.bottom, card: !!document.querySelector('.mr-card.is-open') } })
    ok(`${tag}: its entry jumps to the passage and opens the card`, jump.open && jump.inView && jump.card, jump)
    await shot(e, `${tag}-card`)
    await e.keyboard.press('Escape'); await e.evaluate(() => { openCard(null) })
    // Back at the place, then a reload: the same paragraph and word.
    await e.evaluate(p => { epubGoSpot(p.page, p.para, p.word) }, here); await e.waitForTimeout(600); await epubSettled(e); await e.evaluate(() => savePlaceNow())
    await e.reload(); await e.waitForSelector('.epub-sheet:not(.is-toc) .epub-pg', { timeout: 30000 }); await e.waitForTimeout(1500); await epubSettled(e)
    const reloaded = await e.evaluate(spotNow)
    ok(`${tag}: a reload opens at the same paragraph and word`, reloaded.page === here.page && reloaded.para === here.para && reloaded.word === here.word, { here, reloaded })
    // The text size and the window's width change: the place stays.
    await e.evaluate(() => setZoom(1.3)); await e.waitForTimeout(800); await epubSettled(e)
    const zoomed = await e.evaluate(spotNow)
    await e.setViewportSize({ width: Math.round(width * 0.8), height }); await e.waitForTimeout(800); await epubSettled(e, { width: Math.round(width * 0.8) })
    const narrowed = await e.evaluate(spotNow)
    await e.evaluate(() => setZoom(1)); await e.setViewportSize({ width, height }); await e.waitForTimeout(800); await epubSettled(e, { width })
    const sizedBack = await e.evaluate(spotNow)
    // The same paragraph, its line at the top (the word's line may start a word or two earlier once the lines wrap anew).
    const near = x => x.page === here.page && x.para === here.para && x.word <= here.word && here.word - x.word <= 12
    ok(`${tag}: a text size or width change keeps the paragraph and word at the top`, near(zoomed) && near(narrowed) && near(sizedBack), { here, zoomed, narrowed, sizedBack })
    // The view switch: Convert to Tinct book leaves for the Tinct reader at this place, and is this device's choice.
    await e.evaluate(p => { epubGoSpot(p.page, p.para, p.word) }, here); await e.waitForTimeout(600); await epubSettled(e)
    await e.route('**/reader?userBook=*', r => r.fulfill({ status: 200, contentType: 'text/html', body: '<!doctype html><title>Tinct reader</title>' }))
    await e.click('#aaBtn'); await e.waitForSelector('.byob-aa-panel [data-layout="text"]')
    await Promise.all([e.waitForURL(`**/reader?userBook=${hex}`), e.click('.byob-aa-panel [data-layout="text"]')])
    const left = await e.evaluate(([k, h]) => ({ view: JSON.parse(localStorage.getItem('tinct-addbook:epub-view:' + h)), pos: JSON.parse(localStorage.getItem('tinct-addbook:pos:' + k)) }), [key, hex])
    ok(`${tag}: Convert to Tinct book opens the Tinct reader, kept as this device's choice, the place sent by its words`, left.view === 'text' && left.pos.quote === here.quote && left.pos.para === here.para, left)
    // With that choice, this address goes on to the Tinct reader; the Tinct reader's "Margin view" comes back to the same words.
    await e.goto(`${origin}/lab/addbook/?userBook=${hex}`).catch(() => {})
    await e.waitForURL(`**/reader?userBook=${hex}`, { timeout: 20000 }).catch(() => {})
    ok(`${tag}: chosen, the Tinct reader is where it opens on this device`, e.url().includes(`/reader?userBook=${hex}`), e.url())
    const target = await e.evaluate(() => 'Lamplight has always posed questions about the nature of the evening')
    await e.evaluate(([k, h, q]) => { localStorage.setItem('tinct-addbook:epub-view:' + h, JSON.stringify('margin')); const pos = JSON.parse(localStorage.getItem('tinct-addbook:pos:' + k)); localStorage.setItem('tinct-addbook:pos:' + k, JSON.stringify({ ...pos, via: 't', quote: q, at: Date.now() })) }, [key, hex, 'If we really do live in a lamplit household, then where does electricity fit'])
    await e.goto(`${origin}/lab/addbook/?userBook=${hex}`); await e.waitForSelector('.epub-sheet:not(.is-toc) .epub-pg', { timeout: 30000 }); await e.waitForTimeout(1500); await epubSettled(e)
    const back = await e.evaluate(spotNow)
    ok(`${tag}: from the Tinct reader's Margin view, the EPUB opens here at the words it was at`, back.page === 2 && back.para === 1 && back.word === 0 && /^If we really do live/.test(back.quote), back)
    void target
    ok(`${tag}: no page errors`, !E.problems.length, E.problems)
    await E.ctx.close()
  }
  // A phone keeps the Tinct reader.
  const P = await epubPage(browser, origin, hex, { width: 390, height: 844 })
  await P.page.route('**/reader?userBook=*', r => r.fulfill({ status: 200, contentType: 'text/html', body: '<!doctype html><title>Tinct reader</title>' }))
  await P.page.waitForURL(`**/reader?userBook=${hex}`, { timeout: 30000 }).catch(() => {})
  ok('epub-view-390x844: a phone opens the EPUB in the Tinct reader, as before', P.page.url().includes(`/reader?userBook=${hex}`), P.page.url())
  await P.ctx.close()
  return results
}

/* ---------- EPUBs of the reader's own, 20 Oct 2026 (Anders, "Bold Conjectures, Volume II", screenshots 168–179) ----------
   The essay collection (make-epub.mjs makeEssayEpub) in the desktop margin reader, Night, 1440×900. Every AI reply is
   mocked. EPUB_SHOTS (default ./artifacts/margin/epub) receives the screenshots asked for in the batch. */
const EPUB_SHOTS = process.env.EPUB_SHOTS || join(OUT, 'epub')
mkdirSync(EPUB_SHOTS, { recursive: true })
const epubShot = (page, name) => page.screenshot({ path: join(EPUB_SHOTS, name + '.png') })
async function essaysOpen(browser, origin, { width = 1440, height = 900, look = 'night' } = {}) {
  const hex = addEssays()
  const E = await epubPage(browser, origin, hex, { width, height, look })
  await E.page.waitForSelector('.epub-sheet:not(.is-toc) .epub-pg', { timeout: 30000 }); await E.page.waitForTimeout(1500)
  return { ...E, hex, key: 'epub:' + hex }
}
const essayPage = (page, title) => page.evaluate(t => state.pages.findIndex(p => p.pg.textContent.trim().startsWith(t)) + 1, title)
/** Select words in a chapter's paragraph (its longest text run) as a reader would: the bar opens. */
async function essaySelect(page, n, para, len = 60) {
  return page.evaluate(([n, para, len]) => {
    const el = epubParas(state.pages[n - 1])[para], t = [...el.childNodes].filter(c => c.nodeType === 3).sort((a, b) => b.length - a.length)[0]
    document.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerType: 'mouse' }))
    getSelection().setBaseAndExtent(t, 0, t, Math.min(len, t.length))
    document.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, pointerType: 'mouse' }))
    return getSelection().toString()
  }, [n, para, len])
}
async function essayScrollTo(page, n, para, above = 260) {
  await page.evaluate(([n, para, above]) => { const el = epubParas(state.pages[n - 1])[para]; el.scrollIntoView(); document.getElementById('scroll').scrollBy(0, -above) }, [n, para, above])
  await page.waitForTimeout(700)
}

/* epub-open (items 1, 2, 4): the first open at the Preface; the front matter one compact centred block; the cover without
   its black strip; the book's small caps as it sets them; its contents page hidden; links readable in Night; Tinct paper. */
async function epubOpenCheck(browser, origin) {
  const results = [], ok = okList(results)
  const E = await essaysOpen(browser, origin), e = E.page
  const at = await e.evaluate(() => ({ page: currentPlace().page, spot: epubSpot(), pill: document.getElementById('pageLabel').textContent, start: state.epub.start, roles: state.epub.chapters.map(c => c.role) }))
  ok('1. a first open starts at the first section of the text (the Preface), not the cover or title page', at.start === 7 && at.page === 8 && at.spot.para === 0 && at.pill === 'Preface', at)
  ok('1. the roles: cover, five front pieces, the contents page, then the text', at.roles.join(' ') === 'cover front front front front front toc text text text text text text', at.roles)
  await epubShot(e, 'opening-view')
  // 2. The book's contents page: hidden, no height, not in Tinct's chapter menu.
  const tocPage = await e.evaluate(() => { const p = state.pages[6]; const r = p.sheet.getBoundingClientRect(); return { h: r.height, hidden: getComputedStyle(p.sheet).visibility, menu: toc.entries.map(x => x.label) } })
  ok('2. the book\'s own contents page is hidden (no height) and Tinct\'s chapter menu lists the sections', tocPage.h === 0 && tocPage.hidden === 'hidden' && !tocPage.menu.includes('Contents') && tocPage.menu[0] === 'Preface' && tocPage.menu.length === 6, tocPage)
  // 1. The front matter: one compact, centred block, on Tinct paper.
  await e.evaluate(() => { document.getElementById('scroll').scrollTop = 0 }); await e.waitForTimeout(600)
  const front = await e.evaluate(() => {
    const sheets = state.pages.slice(0, 6).map(p => p.sheet), first = sheets[0].getBoundingClientRect(), last = sheets[5].getBoundingClientRect()
    const centred = [...document.querySelectorAll('.epub-sheet.is-front .epub-body p')].every(p => getComputedStyle(p).textAlign === 'center')
    const plain = sheets.every(s => { const cs = getComputedStyle(s); return cs.boxShadow === 'none' && /rgba\(0, 0, 0, 0\)|transparent/.test(cs.backgroundColor) })
    const text = sheets.slice(1).map(s => s.getBoundingClientRect().height)
    return { block: Math.round(last.bottom - sheets[1].getBoundingClientRect().top), cover: Math.round(first.height), text, centred, plain }
  })
  ok('1. the front matter (title, copyright, dedication, supporters) is one compact centred block, not a sheet per file: under 1.4 screens', front.centred && front.plain && front.block < 900 * 1.4 && front.text.every(h => h < 340), front)
  const cover = await e.evaluate(async () => {
    const img = state.pages[0].pg.querySelector('img'); await img.decode().catch(() => {})
    const c = document.createElement('canvas'); c.width = img.naturalWidth; c.height = img.naturalHeight; const g = c.getContext('2d'); g.drawImage(img, 0, 0)
    const left = [...g.getImageData(1, Math.round(c.height / 2), 1, 1).data], mid = [...g.getImageData(Math.round(c.width / 2), 10, 1, 1).data]
    return { w: img.naturalWidth, h: img.naturalHeight, left, mid }
  })
  // The fixture's cover is 600×900 with a black strip 48px wide down its left side.
  ok('1. the cover\'s black strip is trimmed (the picture starts on its navy ground)', cover.w < 600 && cover.w >= 548 && cover.h === 900 && Math.max(...cover.left.slice(0, 3)) > 30, cover)
  const caps = await e.evaluate(() => {
    const halftitle = state.pages[1].pg.querySelector('p'), title = state.pages[2].pg.querySelector('p'), ncr = [...state.pages[8].pg.querySelectorAll('span')].find(s => s.textContent === 'ncr')
    const v = el => { const cs = getComputedStyle(el); return { cls: el.className, caps: cs.fontVariantCaps, transform: cs.textTransform, text: el.textContent } }
    return { halftitle: v(halftitle), title: v(title), ncr: ncr && v(ncr) }
  })
  ok('1. small caps as the book sets them: "Lamplit Conjectures" small-caps, "LAMPLIT CONJECTURES" (typed in capitals, all-small-caps) never full capitals, "ncr" small caps not upper-cased', caps.halftitle.caps === 'small-caps' && caps.title.caps === 'all-small-caps' && caps.title.transform === 'none' && caps.ncr?.caps === 'small-caps' && caps.ncr.transform === 'none', caps)
  await epubShot(e, 'front-matter-block')
  // 2. Links stay readable in Night: the text's own ink, underlined, never blue on dark grey.
  const link = await e.evaluate(() => {
    const a = state.pages[8].pg.querySelector('a[data-chapter]'), p = a.closest('p'), cs = getComputedStyle(a)
    const lum = c => { const [r, g, b] = c.match(/[\d.]+/g).slice(0, 3).map(Number).map(v => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4 }); return 0.2126 * r + 0.7152 * g + 0.0722 * b }
    const paper = getComputedStyle(document.querySelector('.lab')).backgroundColor, L1 = lum(cs.color), L2 = lum(paper)
    return { color: cs.color, text: getComputedStyle(p).color, underline: cs.textDecorationLine, contrast: Math.round((Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05) * 10) / 10 }
  })
  ok('2. a link in the book is readable in Night: the text\'s ink, underlined, contrast at least 4.5:1', link.color === link.text && /underline/.test(link.underline) && link.contrast >= 4.5, link)
  // 4. Tinct paper: no sheets, the book reader's size and measure, the margin column beside the text.
  const paper = await e.evaluate(() => { const s = state.pages[8].sheet, cs = getComputedStyle(s), pg = getComputedStyle(state.pages[8].pg), p = TinctReaderLayout.paper(localStorage.getItem('tinct-lab-prefs'), innerWidth); return { bg: cs.backgroundColor, shadow: cs.boxShadow, width: Math.round(s.getBoundingClientRect().width), measure: Math.round(p.measure), size: parseFloat(pg.fontSize), want: Math.round(p.fontSize * 100) / 100, mode: col.mode, paper: root.classList.contains('is-paper'), h1: getComputedStyle(state.pages[8].pg.querySelector('h1')).fontFamily } })
  ok('4. Tinct paper: no sheet (transparent, no shadow), the book reader\'s text size and measure, the margin column beside it', /rgba\(0, 0, 0, 0\)|transparent/.test(paper.bg) && paper.shadow === 'none' && Math.abs(paper.width - paper.measure) <= 1 && Math.abs(paper.size - paper.want) < 0.05 && paper.mode === 'column' && paper.paper && /EB Garamond/.test(paper.h1), paper)
  ok('no page errors', !E.problems.length, E.problems)
  await E.ctx.close()
  return results
}

/* epub-units (item 3): one unit per essay, sized as a PDF's (sizeUnits), with their Starting / End of marks level with the
   essay's heading and last line; a whole-book Before you start at the very top; its primer asks for the whole book. */
async function epubUnitsCheck(browser, origin) {
  const results = [], ok = okList(results)
  const E = await essaysOpen(browser, origin), e = E.page
  await e.waitForFunction(() => primer.units?.length > 1, null, { timeout: 8000 }).catch(() => {})
  const units = await e.evaluate(() => primer.units.map(u => `${u.title} ${u.from}–${u.to}${u.matter ? ' ' + u.matter : ''}`))
  ok('3. the units: the Preface (with the front matter, front), each essay one unit, the Notes (back)', units.join(' | ') === 'Preface 1–8 front | 1 The Fate of Lamplight 9–9 | 2 Controversial Candles 10–10 | 3 Can the Wick Be Tested? 11–11 | 4 Another Triumph of the Shade 12–12 | Notes 13–13 back', units)
  const n = await essayPage(e, '1 The Fate'), key = await e.evaluate(n => primer.units.find(u => u.start === n).key, n)
  await e.evaluate(n => goTo({ page: n, frac: 0 }), n); await e.evaluate(() => document.getElementById('scroll').scrollBy(0, -200)); await e.waitForTimeout(900)
  const start = await e.evaluate(([n, k]) => { const m = document.querySelector(`.mr-doc .mr-unit.is-start[data-unit="${k}"]`), h = state.pages[n - 1].pg.querySelector('h1'); return m && { top: m.getBoundingClientRect().top, head: h.getBoundingClientRect().top, k: m.querySelector('.mr-unit__k')?.textContent, name: m.querySelector('.mr-unit__n')?.textContent, pills: [...m.querySelectorAll('.mr-pill')].map(b => b.textContent.trim()) } }, [n, key])
  // The first section offers no Catch me up (item l, Anders, 20 Oct 2026): nothing has been read before it.
  ok('3/l. "Starting 1 The Fate of Lamplight" (the first section) with ✧ Primer alone, level with the essay\'s heading (within 2 px)', start && start.k === 'Starting' && start.name === '1 The Fate of Lamplight' && start.pills.join('|') === '✧Primer' && Math.abs(start.top - start.head) <= 2, start)
  await e.evaluate(() => openContents()); await e.waitForTimeout(300)
  const menu1 = await e.evaluate(() => [...document.querySelectorAll('.lab-contents-v2 [data-unit-act]')].map(b => b.dataset.unitAct))
  await e.keyboard.press('Escape'); await e.evaluate(() => document.querySelector('.lab-contents-v2')?.remove())
  ok('l. the chapter menu offers no Catch me up in the first section', menu1.length > 0 && !menu1.includes('catchup'), menu1)
  const n2 = await essayPage(e, '2 Controversial'), key2 = await e.evaluate(n => primer.units.find(u => u.start === n).key, n2)
  await e.evaluate(n => goTo({ page: n, frac: 0 }), n2); await e.evaluate(() => document.getElementById('scroll').scrollBy(0, -200)); await e.waitForTimeout(900)
  const second = await e.evaluate(k => { const m = document.querySelector(`.mr-doc .mr-unit.is-start[data-unit="${k}"]`); return m && [...m.querySelectorAll('.mr-pill')].map(b => b.textContent.trim()) }, key2)
  ok('3. the next essay\'s start offers ✧ Primer · ✧ Catch me up', second?.join('|') === '✧Primer|✧Catch me up', second)
  await e.evaluate(n => goTo({ page: n, frac: 0 }), n); await e.evaluate(() => document.getElementById('scroll').scrollBy(0, -200)); await e.waitForTimeout(900)
  await epubShot(e, 'unit-marks')
  await e.evaluate(n => { const p = state.pages[n - 1], last = epubParas(p).at(-1); last.scrollIntoView(); document.getElementById('scroll').scrollBy(0, -400) }, n); await e.waitForTimeout(800)
  const end = await e.evaluate(([n, k]) => { const m = document.querySelector(`.mr-doc .mr-unit.is-end[data-unit="${k}"]`); if (!m) return null; const last = epubParas(state.pages[n - 1]).at(-1), r = document.createRange(); r.selectNodeContents(last); const lines = textRects(r); return { k: m.querySelector('.mr-unit__k')?.textContent, pills: [...m.querySelectorAll('.mr-pill')].map(b => b.textContent.trim()), ticks: [...document.querySelectorAll('.mr-doc-leads path.is-rule')].map(p => p.getAttribute('d')), lastTop: lines.at(-1).top, scroll: document.getElementById('scroll').scrollTop, sr: document.getElementById('scroll').getBoundingClientRect().top } }, [n, key])
  const tickAt = end && end.ticks.some(d => Math.abs(Number(/^M[\d.]+ ([\d.]+)/.exec(d)[1]) - end.scroll + end.sr - end.lastTop) <= 2)
  ok('3. "End of 1 The Fate of Lamplight" with ✧ Recap · ✧ Quiz me · Note, its tick at the top of the essay\'s last line', end && end.k === 'End of' && end.pills.join('|') === '✧Recap|✧Quiz me|Note' && tickAt, end)
  // The whole book: Before you start at the very top.
  await e.evaluate(() => { document.getElementById('scroll').scrollTop = 0 }); await e.waitForTimeout(800)
  const book = await e.evaluate(() => { const m = document.querySelector('.mr-doc .mr-unit.is-book'), pg = state.pages[0].pg.getBoundingClientRect(); return m && { k: m.querySelector('.mr-unit__k').textContent, name: m.querySelector('.mr-unit__n').textContent, pills: [...m.querySelectorAll('.mr-pill')].map(b => b.textContent.trim()), top: Math.round(m.getBoundingClientRect().top - pg.top) } })
  ok('3. a whole-book "Before you start" at the very top, its Primer alone', book && book.k === 'Before you start' && book.name === 'Lamplit Conjectures, Volume II' && book.pills.join('|') === '✧Primer' && Math.abs(book.top) <= 12, book)
  const r0 = account.requests.length
  await e.click('.mr-doc .mr-unit.is-book [data-pill="primer"]')
  await e.waitForFunction(() => /MOCK gist/.test(document.querySelector('.mr-doc .mr-primer')?.innerText || ''), null, { timeout: 8000 }).catch(() => {})
  const req = account.requests.slice(r0).find(r => r.body?.companion?.chapter?.action?.kind === 'primer')
  const shown = await e.evaluate(() => { const p = document.querySelector('.mr-doc .mr-primer'); return p && { text: p.innerText.slice(0, 200), unit: primer.unit?.key } })
  ok('3. its Primer opens Before you start for the whole book: the request is the book\'s, every chapter of it, as chapters', !!req && req.body.companion.chapter.action.unitKey === 'book' && req.body.companion.context.kind === 'epub' && req.body.companion.context.pages.length >= 12 && shown?.unit === 'book' && /MOCK gist/.test(shown.text), { req: req && { unit: req.body.companion.chapter.action, pages: req.body.companion.context.pages.length }, shown })
  await epubShot(e, 'book-primer')
  ok('no page errors', !E.problems.length, E.problems)
  await E.ctx.close()
  return results
}

/* epub-marks (item 5; screenshots 173 and 178): a passage mark over whole paragraphs and a heading sits under each line's
   words, one line per line of text, never through a line and never past its last word or across the column. */
async function epubMarksCheck(browser, origin) {
  const results = [], ok = okList(results)
  const E = await essaysOpen(browser, origin), e = E.page
  const n = await essayPage(e, '1 The Fate')
  await essayScrollTo(e, n, 5, 120)
  // A card on the heading "The Shade" and the two paragraphs after it, whole (the range holds the elements whole).
  const made = await e.evaluate(n => {
    const p = state.pages[n - 1], paras = epubParas(p), h2 = p.pg.querySelector('h2'), i = paras.indexOf(h2)
    const range = document.createRange(); range.setStartBefore(h2); range.setEndAfter(paras[i + 2])
    const info = { text: range.toString(), page: n, range }
    const card = withSpan(TinctMargin.newCard({ kind: 'explain', page: n, anchor: anchorOf(selectionShapes(range)), text: info.text, turns: [{ role: 'assistant', content: 'MOCK explain.' }] }), info)
    store.set('cards:' + state.key, [card]); col.view = null; openCard(card.id); return { id: card.id, rects: card.rects?.length }
  }, n)
  await e.waitForTimeout(700)
  const marks = await e.evaluate(n => {
    const p = state.pages[n - 1], paras = epubParas(p), h2 = p.pg.querySelector('h2'), i = paras.indexOf(h2)
    const lines = []
    for (const el of paras.slice(i, i + 3)) { const r = document.createRange(); r.selectNodeContents(el); const rs = textRects(r); const byLine = []; for (const q of rs) { const L = byLine.find(l => Math.abs(l.top - q.top) < q.height / 2); if (L) { L.left = Math.min(L.left, q.left); L.right = Math.max(L.right, q.right); L.bottom = Math.max(L.bottom, q.bottom) } else byLine.push({ top: q.top, bottom: q.bottom, left: q.left, right: q.right }) } lines.push(...byLine) }
    const bars = [...document.querySelectorAll('.mr-ul-layer i')].map(b => b.getBoundingClientRect()).filter(b => b.width > 0)
    const colRight = p.pg.getBoundingClientRect().right
    const bad = bars.filter(b => { const L = lines.find(l => b.top >= l.top && b.top <= l.bottom + 3); return !L || b.top < L.top + (L.bottom - L.top) * 0.7 || b.right > L.right + 2 || b.left < L.left - 2 })
    return { lines: lines.length, bars: bars.length, bad: bad.map(b => [Math.round(b.left), Math.round(b.top), Math.round(b.width)]), wide: bars.filter(b => b.right > colRight + 1).length }
  }, n)
  ok('5. the passage mark: one line under each line of text (heading and paragraphs held whole), under its words, never through them or past the last word', marks.bars === marks.lines && marks.bad.length === 0 && marks.wide === 0, { made, marks })
  // A highlight over whole paragraphs: its painted ranges are the words (the CSS highlight), its click box the lines only.
  const hit = await e.evaluate(n => { const p = state.pages[n - 1], paras = epubParas(p), last = paras[paras.length - 2]; const r = last.getBoundingClientRect(), lines = (() => { const rr = document.createRange(); rr.selectNodeContents(last); return textRects(rr) })(); const end = lines.at(-1); return { after: [end.right + 40, end.top + end.height / 2], right: r.right } }, n)
  ok('5. the last line\'s mark stops at its last word (the paragraph\'s box is never one of its lines)', hit.after[0] < hit.right, hit)
  await epubShot(e, 'highlights')
  ok('no page errors', !E.problems.length, E.problems)
  await E.ctx.close()
  return results
}

/* epub-quiz (item 6 and the quiz feedback a–j): one card per quiz, named by the chapter's title; no page references in an
   EPUB; x of n from the key ideas; the end screen "2/3" and Try new questions, the count right; a retry sends the
   questions asked, the missed ones marked. */
async function epubQuizCheck(browser, origin) {
  const results = [], ok = okList(results)
  const E = await essaysOpen(browser, origin), e = E.page
  const n = await essayPage(e, '1 The Fate')
  await essayScrollTo(e, n, 3)
  const take = async () => { await essaySelect(e, n, 3, 80); await e.waitForSelector('.mr-bar'); await e.click('.mr-bar [data-m="more"]'); await e.waitForSelector('.mr-more'); await e.click('.mr-more [data-m="quiz"]'); await e.waitForTimeout(1200) }
  const r0 = account.requests.length
  await take()
  const head = await e.evaluate(() => { const el = document.querySelector('.mr-card.is-open'); return el && { name: el.querySelector('.mr-card__name')?.textContent, count: el.querySelector('.mr-card__count')?.textContent } })
  ok('a. the quiz card names the chapter by its title, as the pill does ("Quiz me · 1 The Fate of Lamplight", never "ch. 9"); "1 of 3" from its key ideas', head && head.name === 'Quiz me · 1 The Fate of Lamplight' && head.count === '1 of 3', head)
  const sent = account.requests.slice(r0).find(r => r.body?.companion?.intent === 'quiz')
  ok('the quiz request is an EPUB\'s (no page citations asked for) and a first quiz sends no earlier questions', sent?.body.companion.context.kind === 'epub' && !sent.body.companion.asked, sent?.body.companion && { kind: sent.body.companion.context.kind, asked: sent.body.companion.asked })
  const answer = async text => { await e.click('.mr-card.is-open .mr-follow__input'); await e.keyboard.type(text); await e.keyboard.press('Enter'); await e.waitForTimeout(900) }
  await answer('Ideas, known by thought alone')
  const fb = await e.evaluate(() => document.querySelector('.mr-card.is-open .mr-answer')?.innerText || '')
  ok('b. no page reference in an EPUB\'s quiz feedback (the question\'s "{p. 1}" is left out, never "p. 1")', /^Right\./.test(fb) && !/\bp\. ?\d/.test(fb) && !/ \.$/.test(fb), fb)
  const check = account.requests.slice(r0).find(r => r.body?.companion?.intent === 'quiz_check')
  ok('the marking request carries the key idea, the passage and the author\'s position', check?.body.companion.quiz.idea === 'MOCK idea one' && check.body.companion.quiz.passage?.length > 20 && /MOCK: the author argues/.test(check.body.companion.quiz.thesis || ''), check?.body.companion.quiz)
  await e.click('.mr-card.is-open [data-c="next"]'); await e.waitForTimeout(300)
  await answer('They are known in different ways')
  await e.click('.mr-card.is-open [data-c="next"]'); await e.waitForTimeout(300)
  await answer('no idea at all')
  await e.click('.mr-card.is-open [data-c="next"]'); await e.waitForTimeout(400)
  const endCard = await e.evaluate(() => { const el = document.querySelector('.mr-card.is-open'); return { body: el.querySelector('.mr-card__body').innerText.trim(), links: [...el.querySelectorAll('.mr-follow__link')].map(b => b.textContent), count: !!el.querySelector('.mr-card__count') } })
  ok('6/c. the end screen: "2/3" and "Try new questions", nothing else (two right of three)', endCard.body === '2/3' && endCard.links.join('|') === 'Try new questions' && !endCard.count, endCard)
  await epubShot(e, 'quiz-end')
  const r1 = account.requests.length
  await e.click('.mr-card.is-open [data-c="again"]'); await e.waitForTimeout(1300)
  const retry = account.requests.slice(r1).find(r => r.body?.companion?.intent === 'quiz')
  ok('f/h. Try new questions sends the questions asked with their ideas, the missed one marked', JSON.stringify(retry?.body.companion.asked?.map(a => [a.q.slice(0, 7), a.idea, !!a.missed])) === JSON.stringify([['MOCK Q1', 'MOCK idea one', false], ['MOCK Q2', 'MOCK idea two', false], ['MOCK Q3', 'MOCK idea three', true]]), retry?.body.companion.asked)
  // d. Quiz me again on the same passage: still one quiz card.
  await e.keyboard.press('Escape'); await e.evaluate(() => openCard(null)); await e.waitForTimeout(300)
  await take()
  const cards = await e.evaluate(() => keptCards().filter(c => c.kind === 'quiz' && !c.gone).length)
  const stubs = await e.evaluate(() => [...document.querySelectorAll('.mr-doc .mr-card')].filter(el => /Quiz me/.test(el.innerText)).length)
  ok('d. one quiz, one card: Quiz me again on the same passage opens the same card, no stub above it', cards === 1 && stubs === 1, { cards, stubs })
  // q (20 Oct 2026): deleting the book from the reader leaves nothing of it on this device (place, highlights, cards, chats, primers).
  await e.evaluate(() => { savePlaceNow(); const p = state.pages[8], t = epubParas(p)[3].firstChild, r = document.createRange(); r.setStart(t, 0); r.setEnd(t, 30); addHighlight({ text: r.toString(), page: 9, range: r }, { range: r, color: 'yellow' }); store.set('chat:' + state.key, [{ role: 'user', content: 'x' }]) })
  const before = await e.evaluate(h => Object.keys(localStorage).filter(k => k.includes(h)), E.hex)
  // Removing the open book closes it, forgets its keys, then replaces this page with My shelf (reader.js removeBook,
  // start.js toShelf): a navigation. Waiting a fixed time and evaluating raced it ("Execution context was destroyed",
  // 20 Oct 2026). The call is started without awaiting its promise across the navigation, and the keys are read on
  // the shelf page, once it has loaded (same origin and tab: the same localStorage and sessionStorage).
  const toShelf = e.waitForURL(u => new URL(u).pathname === '/library', { timeout: 20000, waitUntil: 'load' })
  await e.evaluate(k => { window.__removing = TinctReader.removeBook(k) }, E.key)
  const shelf = await toShelf.then(() => true, () => false)
  ok('q. deleting the open book closes it and shows My shelf', shelf && new URL(e.url()).hash === '#my-shelf', e.url())
  const left = await e.evaluate(h => [...Object.keys(localStorage), ...Object.keys(sessionStorage)].filter(k => k.includes(h)), E.hex)
  ok('q. deleting the book from the reader leaves no key of it on this device (its place, highlights, cards, chat, primers)', before.length >= 4 && left.length === 0, { before, left })
  ok('no page errors', !E.problems.length, E.problems)
  await E.ctx.close()
  return results
}

/* epub-ask (items 7, 8, 9): the Ask pill (Gloss's), Enter in every card's field never moves the reading place, and an
   answer that searched sources shows them as Fact-check does. */
async function epubAskCheck(browser, origin) {
  const results = [], ok = okList(results)
  for (const look of ['night', 'paper']) {
    const E = await essaysOpen(browser, origin, { look }), e = E.page
    const n = await essayPage(e, '1 The Fate')
    await essayScrollTo(e, n, 8)
    await essaySelect(e, n, 8, 90); await e.waitForSelector('.mr-bar')
    await e.click('.mr-bar [data-m="ask"]'); await e.waitForSelector('.mr-bar.is-asking .mr-ask')
    const pill = await e.evaluate(() => {
      const bar = document.querySelector('.mr-bar.is-asking'), t = bar.querySelector('.mr-ask'), send = bar.querySelector('.mr-bar__send'), cs = getComputedStyle(bar), ts = getComputedStyle(t), ss = getComputedStyle(send)
      const lum = c => { const [r, g, b] = c.match(/[\d.]+/g).slice(0, 3).map(Number).map(v => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4 }); return 0.2126 * r + 0.7152 * g + 0.0722 * b }
      const cr = (a, b) => Math.round((Math.max(lum(a), lum(b)) + 0.05) / (Math.min(lum(a), lum(b)) + 0.05) * 10) / 10
      const below = [...document.querySelectorAll('body *')].filter(el => { const r = el.getBoundingClientRect(), b = bar.getBoundingClientRect(); return r.top >= b.bottom - 1 && r.top < b.bottom + 30 && r.left < b.right && r.right > b.left && /×/.test(el.textContent || '') && el.children.length === 0 })
      return { radius: parseFloat(cs.borderTopLeftRadius), h: Math.round(bar.getBoundingClientRect().height), bg: cs.backgroundColor, ink: ts.color, contrast: cr(ts.color, cs.backgroundColor), outline: ts.outlineStyle, border: ts.borderTopWidth, spell: t.getAttribute('spellcheck'), autocorrect: t.getAttribute('autocorrect'), placeholder: t.getAttribute('placeholder'), font: ts.fontFamily, upper: ts.textTransform, sendRound: ss.borderRadius, sendBg: ss.backgroundColor, sendSize: Math.round(send.getBoundingClientRect().width), chip: below.length, tip: getComputedStyle(bar, '::after').backgroundColor === cs.backgroundColor }
    })
    ok(`${look}: 8. Ask is Gloss's pill: one rounded field with the passage tip, a placeholder, the mic, a round accent send; no box, no spelling chip, no mono, no capitals`, pill.radius >= 20 && pill.h <= 56 && pill.contrast >= 7 && pill.outline === 'none' && pill.border === '0px' && pill.spell === 'false' && pill.autocorrect === 'off' && pill.placeholder === 'Ask about this passage' && !/mono/i.test(pill.font) && pill.upper === 'none' && pill.sendRound === '50%' && pill.sendSize >= 32 && pill.chip === 0 && pill.tip && (look === 'paper' ? lum255(pill.bg) > 200 : lum255(pill.bg) < 90), pill)
    await e.keyboard.type('is this a big debate? also today?')
    if (look === 'night') await e.evaluate(() => { const b = document.querySelector('.mr-bar').getBoundingClientRect(); window.__askClip = { x: Math.max(0, b.left - 120), y: Math.max(0, b.top - 60), width: 900, height: 280 } })
    if (look === 'night') await e.screenshot({ path: join(EPUB_SHOTS, 'ask-composer.png'), clip: await e.evaluate(() => window.__askClip) })
    // 9. The model searched: its Sources line shows as Fact-check's links.
    mock.nextFor.ask = 'Yes, still debated: Bell tests show the correlations, and what they mean is argued over.\n\nSources: [Loophole-free Bell test](https://example.org/bell) · [Locality, SEP](https://example.org/sep)'
    const s0 = await scrollTop(e)
    await e.keyboard.press('Enter'); await e.waitForTimeout(1500)
    const s1 = await scrollTop(e)
    const src = await e.evaluate(() => { const el = document.querySelector('.mr-card.is-open'); return el && { links: [...el.querySelectorAll('.mr-sources a')].map(a => a.textContent), raw: /Sources:/.test(el.querySelector('.mr-card__body').innerText) } })
    ok(`${look}: 9. an Ask answer that searched sources shows them as Fact-check does (a row of links, never a raw "Sources:" line)`, src && src.links.length === 2 && !src.raw, src)
    ok(`${look}: 7. Enter in the bar's Ask leaves the reading place where it was`, Math.abs(s1 - s0) <= 1, { s0, s1 })
    // 7. Enter on a follow-up, with a long answer and a web font arriving meanwhile: the place never moves.
    mock.nextFor.ask = Array.from({ length: 8 }, (_, i) => `Paragraph ${i + 1}. Entangled particles show correlations that no local account explains, and the debate is about what that means.`).join('\n\n')
    await e.evaluate(() => { const f = document.querySelector('.mr-card.is-open .mr-follow__input'); f.focus({ preventScroll: true }) })
    await e.keyboard.type('and what about gravity?')
    const f0 = await scrollTop(e), spot0 = await e.evaluate(() => JSON.stringify(epubSpot()))
    await e.keyboard.press('Enter')
    await e.evaluate(() => document.fonts.dispatchEvent(new Event('loadingdone')))
    const track = []
    for (let i = 0; i < 10; i++) { await e.waitForTimeout(150); track.push(await scrollTop(e)) }
    const spot1 = await e.evaluate(() => JSON.stringify(epubSpot()))
    ok(`${look}: 7. Enter on an Ask card's follow-up never moves the reading place (long answer, a font arriving)`, track.every(t => Math.abs(t - f0) <= 1) && spot0 === spot1, { f0, track, spot0, spot1 })
    if (look === 'night') await epubShot(e, 'ask-after-follow-up')
    // n. The card is as tall as what it holds (Anders, 20 Oct 2026, 185.png): its field right under the last answer's icons.
    await e.waitForTimeout(600)
    const gap = await e.evaluate(() => { const el = document.querySelector('.mr-card.is-open'), acts = [...el.querySelectorAll('.mr-card__acts')].at(-1), field = el.querySelector('.mr-follow'); return { gap: Math.round(field.getBoundingClientRect().top - acts.getBoundingClientRect().bottom), spacer: !!el.querySelector('.tc-spacer') } })
    ok(`${look}: n. after a follow-up's answer the card sizes to its content: the field under 24 px below the answer's icons, no spacer`, gap.gap >= 0 && gap.gap < 24 && !gap.spacer, gap)
    // Explain's follow-up, a quiz answer and a note's Ask: the same.
    await e.evaluate(() => openCard(null)); await e.keyboard.press('Escape'); await e.waitForTimeout(200)
    await essaySelect(e, n, 9, 70); await e.waitForSelector('.mr-bar'); await e.click('.mr-bar [data-m="explain"]'); await e.waitForTimeout(1200)
    await e.evaluate(() => document.querySelector('.mr-card.is-open .mr-follow__input')?.focus({ preventScroll: true }))
    await e.keyboard.type('why?'); const x0 = await scrollTop(e); await e.keyboard.press('Enter'); await e.waitForTimeout(1300); const x1 = await scrollTop(e)
    ok(`${look}: 7. Enter on Explain's follow-up never moves the reading place`, Math.abs(x1 - x0) <= 1, { x0, x1 })
    await e.evaluate(() => openCard(null)); await e.keyboard.press('Escape'); await e.waitForTimeout(200)
    await essaySelect(e, n, 10, 70); await e.waitForSelector('.mr-bar'); await e.click('.mr-bar [data-m="more"]'); await e.waitForSelector('.mr-more'); await e.click('.mr-more [data-m="quiz"]'); await e.waitForTimeout(1300)
    await e.evaluate(() => document.querySelector('.mr-card.is-open .mr-follow__input')?.focus({ preventScroll: true }))
    await e.keyboard.type('Ideas'); const q0 = await scrollTop(e); await e.keyboard.press('Enter'); await e.waitForTimeout(1200); const q1 = await scrollTop(e)
    ok(`${look}: 7. Enter on a quiz answer never moves the reading place`, Math.abs(q1 - q0) <= 1, { q0, q1 })
    ok(`${look}: no page errors`, !E.problems.length, E.problems)
    await E.ctx.close()
  }
  return results
}
function lum255(c) { const v = String(c).match(/[\d.]+/g)?.slice(0, 3).map(Number) || [0, 0, 0]; return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2] }

const RUNS = {
  fixture: [fixtureRows, rows => rows.some(r => r.problems)],
  reader: [readerMatrix, rows => rows.some(r => r.problems)],
  column: [columnMatrix, rows => rows.some(r => r.problems)],
  resize: [resizeRun, rows => rows.some(r => r.problems)],
  layout: [focusMatrix, rows => rows.some(r => r.problems)],
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
  'phone-ui': [phoneUi, rows => rows.some(r => !r.pass)],
  'phone-kind': [phoneKindCheck, rows => rows.some(r => !r.pass)],
  'card-safety': [cardSafety, rows => rows.some(r => !r.pass)],
  justified: [justifiedCheck, rows => rows.some(r => !r.pass)],
  'primer-anchor': [primerAnchor, rows => rows.some(r => !r.pass)],
  'wait-dots': [waitDots, rows => rows.some(r => !r.pass)],
  'chat-scroll': [chatScroll, rows => rows.some(r => !r.pass)],
  'highlight-place': [highlightPlace, rows => rows.some(r => !r.pass)],
  'card-fold': [cardFold, rows => rows.some(r => !r.pass)],
  'cross-page': [crossPage, rows => rows.some(r => !r.pass)],
  'column-page': [columnPage, rows => rows.some(r => !r.pass)],
  'figure-race': [figureRace, rows => rows.some(r => !r.pass)],
  'cards-gloss': [cardsGloss, rows => rows.some(r => !r.pass)],
  'pause-dots': [pauseDots, rows => rows.some(r => !r.pass)],
  'passage-mark': [passageMark, rows => rows.some(r => !r.pass)],
  'stray-menu': [strayMenu, rows => rows.some(r => !r.pass)],
  'whole-words': [wholeWords, rows => rows.some(r => !r.pass)],
  'primer-top': [primerTop, rows => rows.some(r => !r.pass)],
  'define-card': [defineCard, rows => rows.some(r => !r.pass)],
  'figure-chip': [figureChip, rows => rows.some(r => !r.pass)],
  'highlight-bar': [highlightBar, rows => rows.some(r => !r.pass)],
  'zoom-panel': [zoomPanel, rows => rows.some(r => !r.pass)],
  'margin-notes': [marginNotes, rows => rows.some(r => !r.pass)],
  'unit-marks': [unitMarks, rows => rows.some(r => !r.pass)],
  'table-crop': [tableCrop, rows => rows.some(r => !r.pass)],
  notebook: [notebookCheck, rows => rows.some(r => !r.pass)],
  'epub-view': [epubViewCheck, rows => rows.some(r => !r.pass)],
  // 20 Oct 2026 (Anders, "Bold Conjectures, Volume II"): an essay collection of the reader's own on the desktop.
  'epub-open': [epubOpenCheck, rows => rows.some(r => !r.pass)],
  'epub-units': [epubUnitsCheck, rows => rows.some(r => !r.pass)],
  'epub-marks': [epubMarksCheck, rows => rows.some(r => !r.pass)],
  'epub-quiz': [epubQuizCheck, rows => rows.some(r => !r.pass)],
  'epub-ask': [epubAskCheck, rows => rows.some(r => !r.pass)],
  'pdf-text': [pdfTextCheck, rows => rows.some(r => !r.pass)],
}
/* MARGIN_SHARD=i/n (CI, verify.yml margin-layout): this run takes the i-th of n parts of `sample`/`full`, so the
   parts run side by side on separate runners. Every check is in exactly one part: the same greedy split (longest
   first, onto the part with least time so far, by each check's seconds in CI's sample run of 20 Oct 2026; a check
   not listed counts 20 s) is worked out from RUNS in every part. Without MARGIN_SHARD: every check, as before. */
const SAMPLE_SECONDS = { column: 105, behaviour: 87, layout: 77, 'phone-ui': 41, long: 39, notebook: 37, polish: 35, 'phone-kind': 35, reader: 33, 'epub-ask': 24, primer: 23, 'column-page': 23 }
function marginShard(names) {
  const m = /^(\d+)\/(\d+)$/.exec(process.env.MARGIN_SHARD || '')
  if (!m) return { index: 1, of: 1, names }
  const index = Number(m[1]), of = Number(m[2])
  if (!(of >= 1 && index >= 1 && index <= of)) throw new Error('MARGIN_SHARD must be i/n with 1 <= i <= n: ' + process.env.MARGIN_SHARD)
  const parts = Array.from({ length: of }, () => ({ seconds: 0, names: [] }))
  const order = names.map((name, at) => ({ name, at, seconds: SAMPLE_SECONDS[name] ?? 20 })).sort((a, b) => b.seconds - a.seconds || a.at - b.at)
  for (const item of order) { const part = parts.reduce((low, p) => (p.seconds < low.seconds ? p : low)); part.seconds += item.seconds; part.names.push(item.name) }
  return { index, of, names: parts[index - 1].names }
}
try {
  if (mode === 'sample' || mode === 'full') {
    // Every check in one run; each writes {name}-results.json. A failure in one does not stop the rest.
    SAMPLE = mode === 'sample'
    const started = Date.now(), summary = [], shard = marginShard(Object.keys(RUNS))
    if (shard.of > 1) console.log(`== shard ${shard.index}/${shard.of}: ${shard.names.join(', ')}`)
    for (const [name, [run, bad]] of Object.entries(RUNS).filter(([name]) => shard.names.includes(name))) {
      // Each check starts from an empty account, as it does when run on its own.
      account.marks.clear(); account.cards.clear(); account.primers.clear(); account.requests.length = 0
      const t = Date.now(), rows = await run(browser, origin), fail = bad(rows)
      writeFileSync(join(OUT, `${name}-results.json`), JSON.stringify(rows, null, 2))
      summary.push({ check: name, rows: rows.length, failed: fail, seconds: Math.round((Date.now() - t) / 1000) })
      console.log(`== ${name}: ${rows.length} row(s), ${fail ? 'FAILED' : 'clean'}, ${Math.round((Date.now() - t) / 1000)}s`)
      failed ||= fail
    }
    writeFileSync(join(OUT, `${mode}-summary${shard.of > 1 ? `-${shard.index}of${shard.of}` : ''}.json`), JSON.stringify({ mode, shard: shard.of > 1 ? `${shard.index}/${shard.of}` : null, seconds: Math.round((Date.now() - started) / 1000), summary }, null, 2))
  }
  else if (mode === 'contrast') { const rows = await contrast(browser, origin); failed = rows.some(r => r.required && !r.pass); writeFileSync(join(OUT, 'contrast-results.json'), JSON.stringify(rows, null, 2)) }
  else if (mode === 'keys') { const rows = await keysAndAccess(browser, origin); failed = rows.some(r => !r.pass); writeFileSync(join(OUT, 'keys-results.json'), JSON.stringify(rows, null, 2)) }
  else if (mode === 'fixture') { const rows = await fixtureRows(browser, origin); failed = rows.some(r => r.problems); writeFileSync(join(OUT, 'fixture-results.json'), JSON.stringify(rows, null, 2)) }
  else if (mode === 'reader') { const rows = await readerMatrix(browser, origin); failed = rows.some(r => r.problems); writeFileSync(join(OUT, 'reader-results.json'), JSON.stringify(rows, null, 2)) }
  else if (mode === 'serve') { for (const f of PDFS) console.log(addBook(f), f); console.log(addEpub(), 'anthology.epub'); console.log(addEssays(), 'essays.epub'); console.log(origin); await new Promise(() => {}) }
  else if (mode === 'primer-reliability') { const rows = await primerReliability(browser, origin); failed = rows.some(r => !r.pass); writeFileSync(join(OUT, 'primer-reliability-results.json'), JSON.stringify(rows, null, 2)) }
  else if (mode === 'primer-kinds') { const rows = await primerKinds(browser, origin); failed = rows.some(r => !r.pass); writeFileSync(join(OUT, 'primer-kinds-results.json'), JSON.stringify(rows, null, 2)) }
  else if (mode === 'primer') { const rows = await primerBehaviour(browser, origin); failed = rows.some(r => !r.pass); writeFileSync(join(OUT, 'primer-results.json'), JSON.stringify(rows, null, 2)) }
  else if (mode === 'behaviour') { const rows = await behaviour(browser, origin); failed = rows.some(r => !r.pass); writeFileSync(join(OUT, 'behaviour-results.json'), JSON.stringify(rows, null, 2)) }
  else if (mode === 'column') { const rows = await columnMatrix(browser, origin); failed = rows.some(r => r.problems); writeFileSync(join(OUT, 'column-results.json'), JSON.stringify(rows, null, 2)) }
  else if (mode === 'layout') { const rows = await focusMatrix(browser, origin); failed = rows.some(r => r.problems); writeFileSync(join(OUT, 'layout-results.json'), JSON.stringify(rows, null, 2)) }
  else if (mode === 'resize') { const rows = await resizeRun(browser, origin); failed = rows.some(r => r.problems); writeFileSync(join(OUT, 'resize-results.json'), JSON.stringify(rows, null, 2)) }
  else if (mode === 'epub') { const rows = await epubCheck(browser, origin); failed = rows.some(r => r.problems); writeFileSync(join(OUT, 'epub-results.json'), JSON.stringify(rows, null, 2)) }
  else if (mode === 'scans') { const rows = await scanChecks(browser, origin); failed = rows.some(r => !r.pass); writeFileSync(join(OUT, 'scans-results.json'), JSON.stringify(rows, null, 2)) }
  else if (mode === 'figure-margins') { const rows = await retestFigures(browser, origin); failed = rows.some(r => !r.pass); writeFileSync(join(OUT, 'figure-margins-results.json'), JSON.stringify(rows, null, 2)) }
  else if (mode === 'figures') { const rows = await figureMatrix(browser, origin); failed = rows.some(r => !r.pass); writeFileSync(join(OUT, 'figures-results.json'), JSON.stringify(rows, null, 2)) }
  else if (mode === 'polish') { const rows = await polish(browser, origin); failed = rows.some(r => !r.pass); writeFileSync(join(OUT, 'polish-results.json'), JSON.stringify(rows, null, 2)) }
  else if (mode === 'long') { const rows = await longBooks(browser, origin); failed = rows.some(r => !r.pass); writeFileSync(join(OUT, 'long-results.json'), JSON.stringify(rows, null, 2)) }
  else if (mode === 'phone-ui') { const rows = await phoneUi(browser, origin); failed = rows.some(r => !r.pass); writeFileSync(join(OUT, 'phone-ui-results.json'), JSON.stringify(rows, null, 2)) }
  else if (mode === 'phone-kind') { const rows = await phoneKindCheck(browser, origin); failed = rows.some(r => !r.pass); writeFileSync(join(OUT, 'phone-kind-results.json'), JSON.stringify(rows, null, 2)) }
  else if (mode === 'card-safety') { const rows = await cardSafety(browser, origin); failed = rows.some(r => !r.pass); writeFileSync(join(OUT, 'card-safety-results.json'), JSON.stringify(rows, null, 2)) }
  else if (mode === 'latency') { const rows = await askLatency(browser, origin, args.length ? args : null); failed = rows.some(r => !r.pass); writeFileSync(join(OUT, 'latency-results.json'), JSON.stringify(rows, null, 2)) }
  else if (mode === 'justified') { const rows = await justifiedCheck(browser, origin); failed = rows.some(r => !r.pass); writeFileSync(join(OUT, 'justified-results.json'), JSON.stringify(rows, null, 2)) }
  else if (RUNS[mode === 'unit-pills' ? 'unit-marks' : mode] && ['primer-anchor', 'wait-dots', 'chat-scroll', 'highlight-place', 'card-fold', 'cross-page', 'column-page', 'figure-race', 'cards-gloss', 'pause-dots', 'passage-mark', 'stray-menu', 'whole-words', 'primer-top', 'define-card', 'figure-chip', 'highlight-bar', 'zoom-panel', 'margin-notes', 'unit-pills', 'unit-marks', 'table-crop', 'notebook', 'epub-view', 'epub-open', 'epub-units', 'epub-marks', 'epub-quiz', 'epub-ask', 'pdf-text'].includes(mode)) { const [run, bad] = RUNS[mode === 'unit-pills' ? 'unit-marks' : mode]; const rows = await run(browser, origin); failed = bad(rows); writeFileSync(join(OUT, `${mode}-results.json`), JSON.stringify(rows, null, 2)) }
  else if (mode === 'pairs') { const list = await pairs(browser, origin); console.log(list.join('\n')) }
  else throw new Error('unknown mode: ' + mode)
} finally { await browser.close(); server.close() }
if (failed) { console.error('Layout problems found; see ' + OUT); process.exit(1) }
