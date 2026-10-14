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
  text: DEFAULT_SELECTORS.text + ', .mr-note *',
  tap: DEFAULT_SELECTORS.tap + ', .mr-pmore > button, .mr-note__foot .mr-bar__item',
}
const LOOKS = (process.env.LOOKS || 'paper,book,night,eink').split(',')
const VIEWPORTS = (process.env.VIEWPORTS || '1440x900,1280x800,1024x768,390x844,360x740').split(',').map(v => v.split('x').map(Number))

/* ---------- A local stand-in for the site ---------- */
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.woff2': 'font/woff2', '.woff': 'font/woff', '.svg': 'image/svg+xml', '.png': 'image/png', '.gz': 'application/gzip', '.pdf': 'application/pdf' }
const account = { books: [], marks: new Map(), requests: [] }
function addBook(file) {
  const bytes = readFileSync(file), sha256 = createHash('sha256').update(bytes).digest('hex')
  if (!account.books.some(b => b.sha256 === sha256)) account.books.push({ id: sha256.slice(0, 32), name: basename(file), title: basename(file, '.pdf'), author: '', type: 'pdf', size: bytes.length, sha256, createdAt: new Date().toISOString(), cover: null, bytes })
  return sha256.slice(0, 24)
}
const json = (res, status, body) => { res.writeHead(status, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }); res.end(JSON.stringify(body)) }
const readBody = req => new Promise(r => { const parts = []; req.on('data', c => parts.push(c)); req.on('end', () => r(Buffer.concat(parts))) })
// A mocked companion: a definition for `define`, a short answer otherwise, streamed as the Worker relays it.
function mockChat(body, res) {
  const define = body?.companion?.intent === 'define'
  const text = define ? JSON.stringify({ kind: 'definition', definition: `Noun. A mocked meaning of “${body.companion.selection}” here.` }) : 'MOCK ANSWER. The bottom line comes first.\n\nThen a short paragraph.'
  if (!body?.stream) return json(res, 200, { content: [{ type: 'text', text }] })
  res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-store' })
  res.write(`event: content_block_delta\ndata: ${JSON.stringify({ type: 'content_block_delta', delta: { type: 'text_delta', text } })}\n\n`)
  res.end('event: message_stop\ndata: {"type":"message_stop"}\n\n')
}
function start(port) {
  const server = createServer(async (req, res) => {
    const url = new URL(req.url, 'http://x')
    const p = url.pathname
    if (req.method === 'POST' && (p === '/api/chat' || p === '/api/lab-chat')) {
      const body = JSON.parse((await readBody(req)).toString() || '{}'); account.requests.push({ path: p, body })
      return mockChat(body, res)
    }
    if (p === '/api/user-books') return json(res, 200, { books: account.books.map(({ bytes, ...b }) => b) })
    if (p === '/api/user-books/places') return json(res, 200, { places: {} })
    if (p.startsWith('/api/user-books/places/') || p.startsWith('/api/user-books/covers/')) { await readBody(req); return json(res, 200, { place: null, cover: null }) }
    if (p.startsWith('/api/user-books/marks/')) {
      // As the Worker: one versioned set per book; a stale revision gets 409 and the stored set.
      const hex = p.slice('/api/user-books/marks/'.length), have = account.marks.get(hex) || { marks: [], rev: 0 }
      if (req.method === 'GET') return json(res, 200, have)
      const body = JSON.parse((await readBody(req)).toString() || '{}')
      if (body.rev !== have.rev) return json(res, 409, { error: 'conflict', ...have })
      account.marks.set(hex, { marks: body.marks, rev: have.rev + 1 }); return json(res, 200, { rev: have.rev + 1 })
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
async function readerPage(browser, origin, hex, { width, height, look, startPage = 1 }) {
  const phone = width < 700
  const ctx = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1, hasTouch: phone, isMobile: false })
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
    for (const [width, height] of VIEWPORTS) for (const look of LOOKS) {
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
        const list = await checkLayout(page, { selectors: SELECTORS })
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
      console.log(`${tag}: ${found.length + problems.length} problem(s)`, process.env.VERBOSE ? JSON.stringify([...found, ...problems]) : '')
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
    const list = await checkLayout(page, { selectors: { ...SELECTORS, frame: '.strip-frame, .ph' } })
    rows.push({ fixture: 'margin-fixture.html', look, problems: list.length, details: list, screenshot: await shot(page, `fixture-${look}`) })
    console.log(`fixture ${look}: ${list.length} problem(s)`)
    await ctx.close()
  }
  return rows
}

// Each fixture frame beside the mockup's same frame, at the same pixel size. The mockup sets its
// controls in Inter (the stand-in it uses for the Apple system face); the fixture is given the same
// face here so the pair compares spacing, size, weight and colour rather than this machine's fonts.
const PAIRS = [['bar', '[data-strip="a"]'], ['asking', '[data-strip="b"]'], ['more', '[data-strip="c"]'], ['highlight', '[data-strip="d"]'], ['define', '[data-strip="e"]'], ['phone-bar', '[data-ph="a"]'], ['phone-more', '[data-ph="b"]']]
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
    for (const [name, sel] of [...PAIRS, ['note', '[data-strip="f"]'], ['phone-define', '[data-ph="e"]'], ['phone-note', '[data-ph="f"]']]) {
      const a = join(OUT, `pair-${name}-${look}-mockup.png`), b = join(OUT, `pair-${name}-${look}-fixture.png`)
      const inMock = PAIRS.some(p => p[0] === name)
      if (inMock) await mock.locator(sel).first().screenshot({ path: a })
      await fix.locator(`${sel}:not([data-pr])`).first().screenshot({ path: b })
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
  ok('Return sends the question with the passage (today\'s ask, in the docked chat)', asked && JSON.stringify(asked.body).includes(text.replace(/\s+/g, ' ').trim().slice(0, 20)) && await a.isVisible('.byob-dock'), { text, asked: !!asked })
  await fresh(a)
  // Explain: today's Explain request in the docked chat.
  await selectText(a); await a.waitForSelector('.mr-bar'); const n2 = account.requests.length
  await a.click('.mr-bar [data-m="explain"]'); await a.waitForTimeout(1500)
  ok('Explain sends today\'s Explain request', account.requests.slice(n2).some(r => /Explain the passage I selected/.test(JSON.stringify(r.body))))
  ok('PR 1a: no Simplify in the bar', !(await a.$('.mr-float [data-m="simplify"]')))
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
  ok('More shows Define and Copy quote only (PR 1a), with their lines', moreText === 'Define The word, as this text uses it Copy quote With the title and page number', moreText)
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
    const word = await selectText(C.page, { oneWord: true }); await C.page.waitForSelector('.mr-define .mr-define__senses li', { timeout: 8000 }).catch(() => {})
    ok('one word opens Define with dictionary senses, network off', (await C.page.$$('.mr-define__senses li')).length >= 1 && (await C.page.textContent('.mr-define__src')) === 'Dictionary', { word, card: await C.page.evaluate(() => document.querySelector('.mr-float')?.innerText) })
    await C.page.evaluate(() => mrDefine('Qzxwvk')); await C.page.waitForTimeout(800)
    ok('offline, a word the dictionary lacks: “Not in the offline dictionary.” with Ask beneath', (await C.page.textContent('.mr-define__body p')) === 'Not in the offline dictionary.' && await C.page.isVisible('.mr-define__foot [data-m="ask"]'))
    await C.ctx.setOffline(false)
    const n3 = account.requests.length
    await C.page.evaluate(() => mrDefine('Qzxwvk')); await C.page.waitForTimeout(1500)
    const req = account.requests.slice(n3).find(r => r.body?.companion?.intent === 'define')
    ok('online, a word the dictionary lacks goes to the existing contextual define', req && req.body.companion.selection === 'Qzxwvk' && /mocked meaning/.test(await C.page.textContent('.mr-define__body p')), req?.body?.companion)
    await C.ctx.close()
  }
  ok('no page errors', !A.problems.length, A.problems)
  await A.ctx.close()
  return results
}

const server = await start(Number(process.env.PORT || 4791))
const origin = `http://127.0.0.1:${server.address().port}`
const browser = await chromium.launch({ executablePath: EXEC, args: ['--mute-audio'] })
let failed = false
try {
  if (mode === 'fixture') { const rows = await fixtureRows(browser, origin); failed = rows.some(r => r.problems); writeFileSync(join(OUT, 'fixture-results.json'), JSON.stringify(rows, null, 2)) }
  else if (mode === 'reader') { const rows = await readerMatrix(browser, origin); failed = rows.some(r => r.problems); writeFileSync(join(OUT, 'reader-results.json'), JSON.stringify(rows, null, 2)) }
  else if (mode === 'serve') { for (const f of PDFS) console.log(addBook(f), f); console.log(origin); await new Promise(() => {}) }
  else if (mode === 'behaviour') { const rows = await behaviour(browser, origin); failed = rows.some(r => !r.pass); writeFileSync(join(OUT, 'behaviour-results.json'), JSON.stringify(rows, null, 2)) }
  else if (mode === 'pairs') { const list = await pairs(browser, origin); console.log(list.join('\n')) }
  else throw new Error('unknown mode: ' + mode)
} finally { await browser.close(); server.close() }
if (failed) { console.error('Layout problems found; see ' + OUT); process.exit(1) }
