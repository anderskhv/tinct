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
//   node scripts/margin-check.mjs keys                PR 4: the keys (N, B, /, Escape, More's arrows), focus, labels, the live region
//   node scripts/margin-check.mjs contrast            PR 4: text contrast of every margin colour pair in every look (a report)
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
// PR 4: where the mockup draws a 16px icon or a 20px colour (copy, the mics, the colours, the bottom
// card's handle, the quiz links), the target round it is at least 24px each way; everything else stays 28px (`tap`).
export const ICON_TARGETS = '.mr-card__copy, .mr-follow__mic, .mr-swatch, .mr-sheet__grab, .mr-follow__link'
export async function checkMargin(page, selectors = SELECTORS) {
  const list = (await checkLayout(page, { selectors })).filter(p => !scrolledAway(p) && !srOnly(p))
  const small = await page.evaluate(sel => [...document.querySelectorAll(sel)].filter(el => { const r = el.getBoundingClientRect(), cs = getComputedStyle(el); return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && (r.width < 23.5 || r.height < 23.5) }).map(el => ({ kind: 'squeezed', el: '.' + String(el.className).trim().split(/\s+/).join('.'), size: [Math.round(el.getBoundingClientRect().width), Math.round(el.getBoundingClientRect().height)] })), ICON_TARGETS)
  return [...list, ...small]
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
const json = (res, status, body) => { res.writeHead(status, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }); res.end(JSON.stringify(body)) }
const readBody = req => new Promise(r => { const parts = []; req.on('data', c => parts.push(c)); req.on('end', () => r(Buffer.concat(parts))) })
// A mocked companion, per intent, streamed as the Worker relays it: a definition for `define`, the
// sense number for `define_sense`, Quiz me's JSON and its marking, Fact-check with its "Checking
// sources…" status before the answer, and an answer with a bottom line and a citation otherwise.
// `mock.next` (set by a check) replaces the next answer's text, for the long and odd answers.
export const mock = { next: null, delay: 0, primer: null }
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
  if (intent === 'factcheck') return 'Holds. MOCK verdict line for the passage.\n\nHolds. The first claim stands as written.\n\nNote. Useful context that is not a verdict.\n\nSources: [Mock source one](https://example.org/one) · [Mock source two](https://example.org/two)'
  return 'MOCK ANSWER. The bottom line comes first {p. 1}.\n\nThen a short paragraph {p. 3}.'
}
async function mockChat(body, res) {
  const text = mockText(body)
  if (!body?.stream) return json(res, 200, { content: [{ type: 'text', text }] })
  res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-store' })
  if (body?.companion?.intent === 'factcheck') { res.write(`event: tinct_status\ndata: ${JSON.stringify({ type: 'tinct_status', text: 'Checking sources\u2026' })}\n\n`); await new Promise(r => setTimeout(r, mock.delay || 400)) }
  else if (mock.delay) await new Promise(r => setTimeout(r, mock.delay))
  res.write(`event: content_block_delta\ndata: ${JSON.stringify({ type: 'content_block_delta', delta: { type: 'text_delta', text } })}\n\n`)
  res.end('event: message_stop\ndata: {"type":"message_stop"}\n\n')
}
function start(port) {
  const server = createServer(async (req, res) => {
    const url = new URL(req.url, 'http://x')
    const p = url.pathname
    if (req.method === 'POST' && (p === '/api/chat' || p === '/api/lab-chat')) {
      const body = JSON.parse((await readBody(req)).toString() || '{}'); account.requests.push({ path: p, body })
      return await mockChat(body, res)
    }
    if (p === '/api/user-books') return json(res, 200, { books: account.books.map(({ bytes, ...b }) => b) })
    if (p === '/api/user-books/places') return json(res, 200, { places: {} })
    if (p.startsWith('/api/user-books/places/') || p.startsWith('/api/user-books/covers/')) { await readBody(req); return json(res, 200, { place: null, cover: null }) }
    for (const [kind, field] of [['marks', 'marks'], ['cards', 'cards']]) if (p.startsWith(`/api/user-books/${kind}/`)) {
      // As the Worker: one versioned set per book; a stale revision gets 409 and the stored set.
      const hex = p.slice(`/api/user-books/${kind}/`.length), have = account[kind].get(hex) || { [field]: [], rev: 0 }
      if (req.method === 'GET') return json(res, 200, have)
      const body = JSON.parse((await readBody(req)).toString() || '{}')
      if (body.rev !== have.rev) return json(res, 409, { error: 'conflict', ...have })
      account[kind].set(hex, { [field]: body[field], rev: have.rev + 1 }); return json(res, 200, { rev: have.rev + 1 })
    }
    if (p.startsWith('/api/user-books/primers/')) {
      // As the Worker: one stored primer per book and unit, the owner's only; 404 when none; PUT validates and stamps.
      const key = p.slice('/api/user-books/primers/'.length) + '?' + url.searchParams.get('unit')
      if (req.method === 'GET') { const have = account.primers.get(key); return have ? json(res, 200, { primer: have }) : json(res, 404, { error: 'Not found' }) }
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
async function readerPage(browser, origin, hex, { width, height, look, startPage = 1, zoom = 1 }) {
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
  await page.waitForFunction(() => document.querySelectorAll('.pdf-sheet .text-layer span').length > 20, null, { timeout: 30000 })
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
        if (width >= 700) { await page.keyboard.press('W'); await check('ask', '.mr-bar.is-asking'); await page.keyboard.press('Escape') }
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
      console.log(`${tag}: ${all.length} problem(s)`, process.env.VERBOSE ? JSON.stringify(all) : all.length ? JSON.stringify(all).slice(0, 300) : '')
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
  const ex = account.requests.slice(n2).find(r => /Explain the passage they selected/.test(JSON.stringify(r.body)))
  const P = await import(pathToFileURL(join(PUBLIC, 'lab/margin/margin-parse.js')).href)
  ok('Explain sends today\'s Explain request with the PDF wording (a bottom line first) and the PDF\'s pages', ex && JSON.stringify(ex.body).includes(P.PDF_EXPLAIN_FORMAT) && !JSON.stringify(ex.body).includes(P.PDF_EXPLAIN_FORMAT_BEFORE) && ex.body.companion.context.kind === 'pdf', ex?.body?.messages)
  ok('Explain opens as a card, its first sentence in weight 600', await a.isVisible('.mr-col .mr-card.is-open .is-bottom-line') && (await a.evaluate(() => getComputedStyle(document.querySelector('.mr-card.is-open .is-bottom-line')).fontWeight)) === '600')
  // A citation tag scrolls the PDF to its page.
  const tag = await a.evaluate(() => [...document.querySelectorAll('.mr-card.is-open .mr-cite')].map(b => [b.textContent, b.dataset.page]))
  await a.click('.mr-card.is-open .mr-cite >> nth=1').catch(() => {}); await a.waitForTimeout(900)
  ok('citation tags ({p. 3}) show as tags and scroll the PDF to that page', JSON.stringify(tag) === JSON.stringify([['p. 1', '1'], ['p. 3', '3']]) && (await a.evaluate(() => currentPlace().page)) === 3, { tag, page: await a.evaluate(() => currentPlace().page) })
  await fresh(a)
  // Simplify in the bar; Fact-check, Counterpoint and Quiz me in More: each a Worker intent on the passage, kind "pdf".
  for (const [intent, from] of [['simplify', 'bar'], ['counterpoint', 'more'], ['factcheck', 'more'], ['quiz', 'more']]) {
    await a.evaluate(() => { goTo({ page: 1, frac: 0 }); col.open = null }); await a.waitForTimeout(300)
    await selectText(a); await a.waitForSelector('.mr-bar'); const k = account.requests.length
    if (intent === 'factcheck') mock.delay = 1500
    if (from === 'more') { await a.click('.mr-bar [data-m="more"]'); await a.waitForSelector('.mr-more'); await a.click(`.mr-more [data-m="${intent}"]`) } else await a.click(`.mr-bar [data-m="${intent}"]`)
    if (intent === 'factcheck') { await a.waitForTimeout(700); ok('Fact-check shows "Checking sources…" while the search runs (tinct_status)', /Checking sources…/.test(await a.innerText('.mr-card.is-open'))) }
    await a.waitForTimeout(intent === 'factcheck' ? 1800 : 900); mock.delay = 0
    const req = account.requests.slice(k).find(r => r.body?.companion?.intent === intent)
    ok(`${intent}: the Worker intent with the selection and the PDF's pages`, req && req.body.companion.selection && req.body.companion.context.kind === 'pdf' && req.body.companion.context.pages.length >= 1 && !req.body.system, req?.body?.companion && { ...req.body.companion, context: undefined })
    const label = await a.innerText('.mr-card.is-open .mr-card__label').catch(() => '')
    ok(`${intent}: its answer opens as a card labelled with the action`, label.startsWith({ simplify: 'Simplify', counterpoint: 'Counterpoint', factcheck: 'Fact-check', quiz: 'Quiz me' }[intent]), label)
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
  await a.click('.mr-card.is-open .mr-follow__input'); await a.keyboard.type('no idea'); await a.keyboard.press('Enter'); await a.waitForTimeout(900)
  await a.click('.mr-card.is-open [data-c="next"]'); await a.waitForTimeout(300)
  const score = await a.innerText('.mr-card.is-open')
  // Q1 right, Q2 shown, Q3 not yet: one right, and Q3 ("not yet" first) to reread.
  ok('after question 3: the score as the bottom line and the question to reread', /^Quiz me · p\. \d+\s*×\s*1 of 3\s*MOCK Q3/.test(score) && (await a.evaluate(() => getComputedStyle(document.querySelector('.mr-card.is-open .is-bottom-line')).fontWeight)) === '600', score)
  await fresh(a)
  // The whole PDF: "/" focuses the column's foot; its answer opens as the "Whole PDF" card at the top.
  await a.evaluate(() => getSelection().removeAllRanges()); const w0 = account.requests.length
  await a.keyboard.press('/'); await a.keyboard.type('What is this about?'); await a.keyboard.press('Enter'); await a.waitForTimeout(1000)
  const whole = account.requests.slice(w0).find(r => /What is this about\?/.test(JSON.stringify(r.body.messages)))
  ok('"/" asks about the whole PDF; the answer opens as the Whole PDF card at the top of the column (first, below the primer\'s trigger when it shows)', whole?.body?.companion?.context?.kind === 'pdf' && (await a.innerText('.mr-col .mr-card.is-whole .mr-card__label')).startsWith('Whole PDF') && (await a.evaluate(() => { const t = document.querySelector('.mr-col .mr-trigger'); return document.querySelector('.mr-col .mr-card.is-whole').offsetTop === (t ? TinctMargin.PRIMER.top + t.offsetHeight + TinctMargin.COL.cardGap : 0) })))
  await fresh(a)
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
  ok('More shows Define, Fact-check, Counterpoint and Quiz me, then Copy quote, with their lines (Share as image waits)', moreText === 'Define The word, as this text uses it Fact-check Does it still hold? Searches the web Counterpoint The strongest objection to it Quiz me Three questions to check you have it Copy quote With the title and page number', moreText)
  await a.click('.mr-more [data-m="copy"]'); await a.waitForTimeout(300)
  const clip = await a.evaluate(() => navigator.clipboard.readText())
  ok('Copy quote copies the passage with the title and page', /^“.+”\n— .+, p\. \d+$/s.test(clip) && clip.includes(sel.slice(0, 15)), clip)
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
    ok('one word opens Define with dictionary senses, network off', (await C.page.$$('.mr-define__senses li')).length >= 1 && (await C.page.textContent('.mr-define__src')) === 'Dictionary', { word, card: await C.page.evaluate(() => document.querySelector('.mr-float')?.innerText) })
    await C.page.evaluate(() => mrDefine('Qzxwvk')); await C.page.waitForTimeout(800)
    ok('offline, a word the dictionary lacks: “Not in the offline dictionary.” with Ask beneath', (await C.page.textContent('.mr-define__body p')) === 'Not in the offline dictionary.' && await C.page.isVisible('.mr-define__foot [data-m="ask"]'))
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
  ok('phone: no page errors', !Ph.problems.length, Ph.problems)
  await Ph.ctx.close()
  ok('no page errors', !A.problems.length, A.problems)
  await A.ctx.close()
  return results
}


/* ---------- PR 3: Before you start (BRIEF.md §5): trigger, primer, storage, Redo, the map and Quiz me on the chapter ---------- */
async function primerBehaviour(browser, origin) {
  const results = []
  const ok = (name, pass, detail) => { results.push({ name, pass: !!pass, ...(pass ? {} : { detail }) }); console.log(`${pass ? 'ok  ' : 'FAIL'} ${name}${pass ? '' : ' ' + String(JSON.stringify(detail)).slice(0, 300)}`) }
  const hex = addBook(PDFS[0]), hex2 = addBook(PDFS[1])
  const chats = () => account.requests.filter(r => r.path === '/api/chat' || r.path === '/api/lab-chat')
  const primers = from => chats().slice(from).filter(r => r.body?.companion?.intent === 'chapter')
  const A = await readerPage(browser, origin, hex, { width: 1440, height: 900, look: 'paper' })
  const a = A.page
  await a.waitForSelector('.mr-col .mr-trigger', { timeout: 8000 }).catch(() => {})
  const r0 = chats().length
  const trig = await a.evaluate(() => { const t = document.querySelector('.mr-col .mr-trigger'); return t && { text: t.innerText.replace(/\s+/g, ' ').trim(), top: t.offsetTop, key: !!t.querySelector('.mr-key') } })
  ok('at the PDF\'s start the trigger is the column\'s first folded card: "Before you start", [B], the unit named', trig && trig.text === 'Before you start B The gist, the key claims and a map of chapter 1.' && trig.top === 16 && trig.key, trig)
  ok('nothing is made when the file opens (only when the reader opens the trigger)', primers(0).length === 0)
  await a.keyboard.press('b'); await a.waitForSelector('.mr-col .mr-primer .mr-primer__gist', { timeout: 8000 }).catch(() => {})
  const req = primers(r0)[0]
  ok('B opens the primer in place: one chapter request, action primer for the unit, the unit\'s pages as a PDF', primers(r0).length === 1 && req.body.companion.chapter?.action?.kind === 'primer' && req.body.companion.chapter.action.unitKey === 'outline-0' && req.body.companion.chapter.action.unitTitle === 'Chapter 1. Of Ideas' && req.body.companion.context.kind === 'pdf' && req.body.companion.context.pages.length === 4 && !req.body.companion.selection && !req.body.system, req?.body?.companion && { ...req.body.companion, context: { ...req.body.companion.context, pages: req.body.companion.context.pages.length } })
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
  ok('"Quiz me on this chapter": quiz on the whole unit (no selection, its pages), opening as a quiz card; the primer folds', q && q.body.companion.selection === undefined && q.body.companion.context.pages.length === 4 && quizCard?.label.startsWith('Quiz me · chapter 1') && /1 of 3/.test(quizCard.label) && quizCard.unit && !quizCard.primer, { q: q?.body?.companion && { sel: q.body.companion.selection, pages: q.body.companion.context.pages.length }, quizCard })
  ok('the chapter quiz is kept with the cards (synced) and has no leader line', await a.evaluate(() => keptCards().some(c => c.data?.unit?.key === 'outline-0' && c.rects.length === 1) && !document.querySelector('svg.mr-leads path:not(.is-folded)')))
  await a.keyboard.press('Escape')
  // The next unit's start offers its own trigger; the middle of a unit offers none.
  await a.evaluate(() => goTo({ page: 5, frac: 0 })); await a.waitForTimeout(700)
  const t5 = await a.evaluate(() => document.querySelector('.mr-col .mr-trigger')?.innerText.replace(/\s+/g, ' '))
  await a.evaluate(() => goTo({ page: 6, frac: 0.3 })); await a.waitForTimeout(700)
  const t6 = await a.evaluate(() => !!document.querySelector('.mr-col .mr-trigger'))
  ok('each top-level outline entry\'s start offers its unit; the middle of a unit offers none', /map of chapter 2\.$/.test(t5 || '') && !t6, { t5, t6 })
  const r3 = chats().length
  await a.keyboard.press('b'); await a.waitForTimeout(1000)
  const req3 = primers(r3)[0]
  ok('B anywhere opens the primer of the unit the reader is in', req3?.body?.companion?.chapter?.action?.unitKey === 'outline-1', req3?.body?.companion?.chapter)
  await a.keyboard.press('Escape')
  ok('no page errors', !A.problems.length, A.problems)
  await A.ctx.close()
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
  await a.keyboard.press('ArrowDown'); await a.keyboard.press('ArrowDown')
  const at = await a.evaluate(() => document.activeElement?.dataset.m)
  await a.keyboard.press('ArrowUp'); await a.keyboard.press('ArrowUp'); await a.keyboard.press('ArrowUp')
  ok('Up and Down move between the rows, round from the first to the last', at === 'counterpoint' && (await a.evaluate(() => document.activeElement?.dataset.m)) === 'copy')
  await a.keyboard.press('Escape'); await a.waitForTimeout(100)
  ok('Escape closes More first, the focus back on its dots; the bar stays', !(await a.$('.mr-more')) && await a.isVisible('.mr-bar') && (await a.evaluate(() => document.activeElement?.dataset.m)) === 'more')
  await a.keyboard.press('Enter'); await a.waitForSelector('.mr-more'); await a.keyboard.press('ArrowDown'); await a.keyboard.press('ArrowDown')
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
    for (const f of found) rows.push({ look, ...f })
    await ctx.close()
  }
  for (const r of rows) console.log(`${r.look.padEnd(6)} ${r.name.padEnd(28)} ${r.missing ? 'missing' : r.ratio + ':1 at ' + r.size}`)
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
        if (cond) { const r = await page.evaluate(cond); if (!r || r.ok === false) found.push({ state: name, kind: 'condition', el: JSON.stringify(r).slice(0, 300) }) }
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
  keys: [keysAndAccess, rows => rows.some(r => !r.pass)],
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
  else if (mode === 'contrast') { const rows = await contrast(browser, origin); writeFileSync(join(OUT, 'contrast-results.json'), JSON.stringify(rows, null, 2)) }
  else if (mode === 'keys') { const rows = await keysAndAccess(browser, origin); failed = rows.some(r => !r.pass); writeFileSync(join(OUT, 'keys-results.json'), JSON.stringify(rows, null, 2)) }
  else if (mode === 'fixture') { const rows = await fixtureRows(browser, origin); failed = rows.some(r => r.problems); writeFileSync(join(OUT, 'fixture-results.json'), JSON.stringify(rows, null, 2)) }
  else if (mode === 'reader') { const rows = await readerMatrix(browser, origin); failed = rows.some(r => r.problems); writeFileSync(join(OUT, 'reader-results.json'), JSON.stringify(rows, null, 2)) }
  else if (mode === 'serve') { for (const f of PDFS) console.log(addBook(f), f); console.log(origin); await new Promise(() => {}) }
  else if (mode === 'primer') { const rows = await primerBehaviour(browser, origin); failed = rows.some(r => !r.pass); writeFileSync(join(OUT, 'primer-results.json'), JSON.stringify(rows, null, 2)) }
  else if (mode === 'behaviour') { const rows = await behaviour(browser, origin); failed = rows.some(r => !r.pass); writeFileSync(join(OUT, 'behaviour-results.json'), JSON.stringify(rows, null, 2)) }
  else if (mode === 'column') { const rows = await columnMatrix(browser, origin); failed = rows.some(r => r.problems); writeFileSync(join(OUT, 'column-results.json'), JSON.stringify(rows, null, 2)) }
  else if (mode === 'resize') { const rows = await resizeRun(browser, origin); failed = rows.some(r => r.problems); writeFileSync(join(OUT, 'resize-results.json'), JSON.stringify(rows, null, 2)) }
  else if (mode === 'pairs') { const list = await pairs(browser, origin); console.log(list.join('\n')) }
  else throw new Error('unknown mode: ' + mode)
} finally { await browser.close(); server.close() }
if (failed) { console.error('Layout problems found; see ' + OUT); process.exit(1) }
