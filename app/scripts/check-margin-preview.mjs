#!/usr/bin/env node
// The margin preview (/reader?book=<id>&margin=1, src/lab/marginPreview/): a registered book in the margin reader.
// Headless Chromium against a local dev server (`npx vite --port 4811`), muted, every AI call and the account mocked:
//
//   PREVIEW_ORIGIN=http://127.0.0.1:4811 CHROMIUM_PATH=… node scripts/check-margin-preview.mjs
//
// For Frankenstein and To the Lighthouse, at 1440×900 and 390×844: the book opens at the book reader's place
// (seeded on this device), a selection opens the bar and Explain draws its card, the Notebook lists it (desktop;
// the Notebook is desktop only), a reload keeps the preview's own place, the book reader's keys are never
// written and nothing is PUT to the account, and /reader without the flag is the book reader, unchanged.
// Screenshots go to OUT (default artifacts/margin-preview).
import { chromium, webkit, devices } from 'playwright'
import { mkdirSync, readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'

const ORIGIN = process.env.PREVIEW_ORIGIN || 'http://127.0.0.1:4811'
const OUT = resolve(process.env.OUT || 'artifacts/margin-preview')
mkdirSync(OUT, { recursive: true })
const EXEC = process.env.CHROMIUM_PATH || undefined
const BOOKS = (process.env.BOOKS || 'frankenstein,to-the-lighthouse').split(',')
const VIEWPORTS = (process.env.VIEWPORTS || '1440x900,390x844').split(',').map(v => v.split('x').map(Number))
const MOCK_ANSWER = 'MOCK EXPLAIN: the passage sets the scene and names what the narrator wants.'

let failures = 0
const ok = (label, pass, detail) => { if (!pass) failures++; console.log(`${pass ? 'ok  ' : 'FAIL'} ${label}${!pass && detail !== undefined ? ' ' + JSON.stringify(detail).slice(0, 600) : ''}`) }

/** The book reader's place on this device: chapter 5 (paragraph 3, word 4) of Frankenstein, chapter 2 (paragraph 1) of To the Lighthouse. */
const PLACES = {
  frankenstein: { chapterNumber: 5, paragraphIndex: 3, wordIndex: 4 },
  'to-the-lighthouse': { chapterNumber: 2, paragraphIndex: 1, wordIndex: 0 },
}
const chapterIndex = (bookId, number) => JSON.parse(readFileSync(resolve(`public/data/editions/${bookId}-modern-en.json`), 'utf8')).chapters.findIndex(c => Number(c.number) === number)
function positionRecord() {
  const now = Date.now(), books = {}
  for (const [bookId, p] of Object.entries(PLACES)) books[bookId] = { bookId, headerBook: bookId, sequentialChapter: p.chapterNumber, ...p, primaryEditionKey: 'modern-en', readerMode: 'read', updatedAt: now - 60000, deviceId: 'qa', rev: 1 }
  return { books, finished: {}, hidden: {}, lastSettledBookId: 'frankenstein', lastSettledAt: now - 60000, updatedAt: now - 60000, deviceId: 'qa' }
}
const MAIN_KEY = /^(tinct-lab-|tinct:lab|tinct:reader|reading-log:|progress:|chat-history:|highlights:)/

async function mockApis(context, log) {
  await context.route(/\/api\//, route => route.fulfill({ status: 404, contentType: 'application/json', body: '{"error":"mock"}' }))
  await context.route(/\/api\/lab-position/, route => { log.position.push(route.request().method()); return route.fulfill({ status: route.request().method() === 'GET' ? 200 : 500, contentType: 'application/json', body: JSON.stringify(positionRecord()) }) })
  await context.route(/\/api\/(chat|lab-chat)(\?|$)/, async route => {
    let body = null; try { body = JSON.parse(route.request().postData() || 'null') } catch {}
    log.ai.push({ url: route.request().url(), intent: body?.companion?.intent, kind: body?.companion?.context?.kind, document: body?.companion?.document ? { library: body.companion.document.library === true, kind: body.companion.document.kind, units: body.companion.document.units.length, part: !!body.companion.document.part, chars: body.companion.document.units.reduce((n, u) => n + u.text.length, 0) } : null, selection: body?.companion?.selection })
    const c = body?.companion || {}
    // Shaped as each action parses it (as scripts/margin-check.mjs mocks them); the rest a plain answer.
    const text = c.intent === 'define' ? JSON.stringify({ kind: 'definition', definition: `Noun. A mocked meaning of “${c.selection}” here.` })
      : c.intent === 'quiz' ? JSON.stringify({ questions: [1, 2, 3].map(i => ({ q: `MOCK Q${i}. What happens here?`, answer: 'Something', why: 'Because.', cite: '' })) })
      : c.intent === 'chapter' && c.chapter?.action?.kind === 'primer' ? JSON.stringify({ gist: `MOCK gist of ${c.chapter.action.unitTitle}. It says what the chapter sets out to do.`, claims: [1, 2, 3].map(i => ({ text: `MOCK claim ${i} of the chapter.`, cite: `{p. ${c.context?.pages?.[0]?.n ?? 1}}` })), keepInMind: ['MOCK caution: a name that changes later.'], map: [1, 2, 3].map(i => ({ title: `MOCK section ${i}`, pages: `p. ${c.context?.pages?.[0]?.n ?? 1}` })) })
      : MOCK_ANSWER
    if (!body?.stream) return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ content: [{ type: 'text', text }] }) })
    return route.fulfill({ status: 200, headers: { 'Content-Type': 'text/event-stream' }, body: `event: content_block_delta\ndata: ${JSON.stringify({ type: 'content_block_delta', delta: { type: 'text_delta', text } })}\n\nevent: message_stop\ndata: {"type":"message_stop"}\n\n` })
  })
}

const frameOf = async page => {
  const handle = await page.waitForSelector('iframe[data-testid="margin-preview-frame"]', { timeout: 30000 })
  const frame = await handle.contentFrame()
  await frame.waitForFunction(() => typeof state !== 'undefined' && state.preview && state.pages.length > 0 && document.querySelector('.epub-sheet'), null, { timeout: 60000 })
  await page.waitForTimeout(1200)
  return frame
}
const pillNow = frame => frame.evaluate(() => { const l = document.getElementById('pageLabel'), t = document.getElementById('bookTitle'), b = document.getElementById('pageBtn'); return { label: l.textContent, fit: b.dataset.fit || '', titleMode: b.dataset.title || (t.scrollWidth <= t.clientWidth + 1 ? 'whole' : 'cut'), title: b.dataset.title === 'off' || t.scrollWidth <= t.clientWidth + 1 || t.clientWidth >= 72, chapter: chapterAt(readingPage())?.label } })
const spotOf = frame => frame.evaluate(() => ({ page: currentPlace().page, ...epubSpot(), key: state.key, mode: marginMode() }))
const mainKeys = page => page.evaluate(re => Object.fromEntries(Object.keys(localStorage).filter(k => new RegExp(re).test(k)).map(k => [k, localStorage.getItem(k)])), MAIN_KEY.source)

async function selectInView(frame) {
  return frame.evaluate(() => {
    const top = document.getElementById('scroll').getBoundingClientRect().top + 60
    const p = [...document.querySelectorAll('.tb-p')].find(el => { const r = el.getBoundingClientRect(); return r.top > top && r.bottom < innerHeight - 200 && el.textContent.split(/\s+/).length > 8 })
      || [...document.querySelectorAll('.tb-p')].find(el => { const r = el.getBoundingClientRect(); return r.top > top && r.top < innerHeight - 260 && el.textContent.split(/\s+/).length > 8 })
    if (!p) return null
    const node = [...p.childNodes].find(n => n.nodeType === 3 && n.nodeValue.trim().split(/\s+/).length > 5) || p.firstChild
    const t = node.nodeValue, words = [...t.matchAll(/\S+/g)].slice(0, 6)
    document.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerType: 'mouse' }))
    getSelection().setBaseAndExtent(node, words[0].index, node, words[words.length - 1].index + words[words.length - 1][0].length)
    document.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, pointerType: 'mouse' }))
    return getSelection().toString()
  })
}

// Round 2 (static): the preview's page, book.html, is index.html without the PDF-only scripts (and one comment), and
// reader.js loads those scripts, if a PDF opens there after all, in index.html's order with its cache tags (pdfReady).
{
  const index = readFileSync(resolve('public/lab/addbook/index.html'), 'utf8'), book = readFileSync(resolve('public/lab/addbook/book.html'), 'utf8')
  const reader = readFileSync(resolve('public/lab/addbook/js/reader.js'), 'utf8')
  const listed = JSON.parse(reader.match(/^const PDF_SCRIPTS = (\[.*\]);$/m)[1].replace(/'/g, '"'))
  const tags = [...index.matchAll(/<script src="([^"]+)"><\/script>/g)].map(m => m[1])
  const pdfOnly = tags.filter(src => listed.includes(src))
  ok('book.html: index.html without the PDF-only scripts', book.replace(/^<!-- The margin preview of a Tinct book.*-->\n/m, '') === index.split('\n').filter(l => !listed.some(src => l === `<script src="${src}"></script>`)).join('\n'), listed)
  ok('reader.js PDF_SCRIPTS: every one in index.html, in its order, with its tag', pdfOnly.length === listed.length && pdfOnly.every((src, i) => src === listed[i]) && listed.includes('vendor/pdfjs/pdf.min.js'), { listed, pdfOnly })
  ok('book.html has the margin reader (reader.js, tinct-book.js, margin.js) and no pdf.js', /js\/reader\.js/.test(book) && /js\/tinct-book\.js/.test(book) && /js\/margin\.js/.test(book) && !/pdf\.min\.js|pdf-scan\.js/.test(book))
  const mirror = f => readFileSync(resolve('../addbooks/web/src/' + f), 'utf8') === readFileSync(resolve('public/lab/addbook/' + f), 'utf8')
  ok('book.html, index.html and the changed scripts are mirrored in addbooks/web/src', ['book.html', 'index.html', 'js/reader.js', 'js/tinct-book.js', 'js/reader-layout.js', 'css/reader.css'].every(mirror))
}

const browser = await chromium.launch({ executablePath: EXEC, args: ['--mute-audio', '--autoplay-policy=user-gesture-required'] })
const shots = []
try {
  for (const bookId of BOOKS) {
    for (const [w, h] of VIEWPORTS) {
      const phone = w < 700, tag = `${bookId}-${w}x${h}`
      const context = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1, hasTouch: phone, isMobile: phone })
      const log = { position: [], ai: [] }
      await mockApis(context, log)
      const page = await context.newPage()
      const errors = [], pdfAsked = []
      page.on('pageerror', e => errors.push(String(e)))
      page.on('request', r => { if (r.resourceType() === 'script' && /\/lab\/addbook\/(vendor\/pdfjs|js\/(pdf-(?!theme)|reading-order|printed-pages|doc-search))/.test(r.url())) pdfAsked.push(r.url()) })
      // The book reader's place on this device, before anything runs (an origin page first, so storage is the app's).
      await page.goto(`${ORIGIN}/lab/addbook/vendor/pdfjs/pdf.min.js`)
      await page.evaluate(rec => { localStorage.clear(); localStorage.setItem('tinct-lab-position', JSON.stringify(rec)); localStorage.setItem('tinct-lab-device-id', 'qa') }, positionRecord())
      const before = await mainKeys(page)

      // 1. Opens in the margin reader at the book reader's place.
      await page.goto(`${ORIGIN}/reader?book=${bookId}&margin=1`)
      let frame = await frameOf(page)
      const want = PLACES[bookId], at = await spotOf(frame)
      ok(`${tag}: opens in the margin reader (${at.mode}), key ${at.key}`, at.key === `preview:${bookId}` && at.mode === (phone ? 'phone' : 'column'), at)
      ok(`${tag}: at the book reader's place (chapter ${want.chapterNumber}, paragraph ${want.paragraphIndex})`, at.page === chapterIndex(bookId, want.chapterNumber) + 1 && at.para === want.paragraphIndex && at.word <= want.wordIndex, { at, want })
      ok(`${tag}: the sticky opt-in is stored`, await page.evaluate(() => localStorage.getItem('tinct:margin-preview')) === '1')
      shots.push(join(OUT, `${tag}-open.png`)); await page.screenshot({ path: shots.at(-1) })
      // Round 2: the frame is book.html, without pdf.js and the PDF-only scripts (the phone's first page came 0.3 s later with them).
      ok(`${tag}: the frame is the preview's page (book.html) and asks for no PDF script`, new URL(frame.url()).pathname === '/lab/addbook/book' && pdfAsked.length === 0 && await frame.evaluate(() => typeof window.pdfjsLib === 'undefined' && !window.TinctPdfScan), pdfAsked)
      // Round 2: chapters after the place and the next are laid out later (.tb-later), and the place stays where it opened while they are.
      const later = await frame.evaluate(() => ({ later: document.querySelectorAll('.tb-chapter.tb-later').length, all: document.querySelectorAll('.tb-chapter').length }))
      ok(`${tag}: the chapters after the place wait to be laid out (${later.later} of ${later.all})`, later.later > 0 && later.later < later.all, later)
      await page.waitForTimeout(3500)
      const still = await spotOf(frame), fewer = await frame.evaluate(() => document.querySelectorAll('.tb-chapter.tb-later').length)
      ok(`${tag}: the place stays put while later chapters are laid out (${later.later} → ${fewer} waiting)`, still.page === at.page && still.para === at.para && still.word === at.word && fewer < later.later, { at, still, fewer })
      // Round 2: the phone's chapter pill names the chapter (cut with an ellipsis if need be), not the percent alone, and the title stays whole.
      if (phone) {
        const pill = await pillNow(frame)
        ok(`${tag}: the phone's pill names the chapter ("${pill.label}"), the title whole`, !/^\d+%$/.test(pill.label) && pill.title && !!pill.chapter && (pill.chapter.includes(pill.label) || /…/.test(pill.label) || pill.fit === 'cut'), pill)
        // Round 3: the book's title gives way first: the chapter's name is whole ("The Window · 2"), never "The W… · 2".
        ok(`${tag}: the pill's chapter name is whole, the title cut or left out first ("${pill.label}", title ${pill.titleMode})`, pill.label === pill.chapter && pill.fit !== 'cut', pill)
        // Round 3: Before you start's bottom card does not cover the text the book opened at.
        ok(`${tag}: no Before you start card over the text on opening`, await frame.evaluate(() => col.sheet?.dataset.id !== 'trigger'))
      }

      // 2. A selection opens the bar; Explain draws its card with the passage and its chapter as the document.
      const picked = await selectInView(frame)
      const bar = await frame.waitForSelector('.mr-bar [data-m="explain"], .mr-pbar [data-m="explain"]', { timeout: 8000 }).catch(() => null)
      ok(`${tag}: a selection opens the selection bar`, !!picked && !!bar, { picked })
      shots.push(join(OUT, `${tag}-bar.png`)); await page.screenshot({ path: shots.at(-1) })
      if (bar) await bar.click()
      const card = await frame.waitForFunction(text => [...document.querySelectorAll('.mr-card, .mr-sheet, .mr-float')].some(el => el.textContent.includes(text)), MOCK_ANSWER.slice(0, 30), { timeout: 15000 }).catch(() => null)
      const explain = log.ai.find(r => r.intent === 'explain')
      ok(`${tag}: Explain answers in a margin card`, !!card, log.ai)
      ok(`${tag}: the request carries the passage and the chapter it is in (an EPUB part), never the whole book`, !!explain && explain.kind === 'epub' && explain.selection?.length > 10 && (!explain.document || (explain.document.part && explain.document.units === 1)), explain)
      ok(`${tag}: the request says the book is from Tinct's library, not the reader's own files (document.library)`, !!explain?.document?.library, explain?.document)
      // The card names its chapter as the chapter pill and the contents do ("Chapter 1"), not by its place in the file ("ch. 5").
      const named = await frame.evaluate(() => { const c = keptCards().find(k => k.kind === 'explain' && !k.gone); const title = c && toc.entries.find(e => e.page === c.page && e.kind === 'chapter')?.label; return { want: title ? `Explain · ${title}` : null, labels: [...document.querySelectorAll('.mr-card__label')].map(e => e.textContent.trim()), name: c ? cardName(c) : null } })
      ok(`${tag}: the card's label names the chapter by its title (${named.want})`, !!named.want && named.name === named.want && named.labels.includes(named.want) && !named.labels.some(l => /\bch\. \d/.test(l)), named)
      shots.push(join(OUT, `${tag}-explain.png`)); await page.screenshot({ path: shots.at(-1) })

      // 3. The Notebook lists it (desktop only).
      if (!phone) {
        await frame.evaluate(() => { getSelection().removeAllRanges(); document.getElementById('notebookBtn').click() })
        const nb = await frame.waitForSelector('.nb .nb-entry', { timeout: 8000 }).catch(() => null)
        ok(`${tag}: the Notebook lists the Explain card`, !!nb)
        const nbPlaces = await frame.evaluate(() => [...document.querySelectorAll('.nb .nb-entry')].map(e => e.innerText.replace(/\s+/g, ' ').trim().slice(0, 60)))
        ok(`${tag}: the Notebook names the chapter by its title, not "ch. N"`, nbPlaces.length > 0 && nbPlaces.every(t => !/\bch\. \d/.test(t)) && nbPlaces.some(t => named.want && t.includes(named.want.replace(/^Explain · /, ''))), nbPlaces)
        shots.push(join(OUT, `${tag}-notebook.png`)); await page.screenshot({ path: shots.at(-1) })
        await frame.evaluate(() => document.getElementById('notebookBtn').click())
      }

      // 3b. Every margin action reaches the companion for a registered book (desktop, the first book): the bar's
      // Ask and Simplify, More's Define, Fact-check, Counterpoint and Quiz me, and the chapter pills.
      if (!phone && bookId === BOOKS[0]) {
        const fold = () => frame.evaluate(() => { getSelection().removeAllRanges(); closeAllPopups(); if (col.open) openCard(null) })
        const sent = async (label, act, intent) => {
          const n = log.ai.length
          await act()
          const got = await frame.waitForFunction(() => true, null, { timeout: 100 }).then(async () => { for (let i = 0; i < 60 && !log.ai.slice(n).some(r => r.intent === intent); i++) await page.waitForTimeout(150); return log.ai.slice(n).find(r => r.intent === intent) })
          ok(`${tag}: ${label} asks the companion (${intent}) with the book's text`, !!got && got.kind === 'epub', log.ai.slice(n))
          await page.waitForTimeout(500)
          await fold()
        }
        const fromBar = m => async () => { await selectInView(frame); await frame.waitForSelector('.mr-bar [data-m="more"]', { timeout: 8000 }); if (m !== 'ask' && m !== 'simplify') { await frame.click('.mr-bar [data-m="more"]'); await frame.waitForSelector(`.mr-more [data-m="${m}"]`) ; await frame.click(`.mr-more [data-m="${m}"]`) } else await frame.click(`.mr-bar [data-m="${m}"]`) }
        await sent('Simplify', fromBar('simplify'), 'simplify')
        await sent('Ask', async () => { await fromBar('ask')(); await frame.waitForSelector('.mr-bar.is-asking textarea, .mr-bar.is-asking input', { timeout: 5000 }); await frame.keyboard?.type?.('Why?'); await page.keyboard.type('Why does she do this?'); await page.keyboard.press('Enter') }, 'ask')
        await sent('Fact-check', fromBar('factcheck'), 'factcheck')
        await sent('Counterpoint', fromBar('counterpoint'), 'counterpoint')
        await sent('Quiz me', fromBar('quiz'), 'quiz')
        // Define: one uncommon word; the dictionary first (offline here), then the companion.
        await frame.evaluate(() => { const p = [...document.querySelectorAll('.tb-p')].find(el => { const r = el.getBoundingClientRect(); return r.top > 120 && r.bottom < innerHeight - 200 && /[a-z]{9,}/.test(el.textContent) }); const node = [...p.childNodes].find(n => n.nodeType === 3 && /[a-z]{9,}/.test(n.nodeValue)); const m = /[a-z]{9,}/.exec(node.nodeValue); document.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerType: 'mouse' })); getSelection().setBaseAndExtent(node, m.index, node, m.index + m[0].length); document.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, pointerType: 'mouse' })) })
        const defineBtn = await frame.waitForSelector('.mr-bar [data-m="define"], .mr-bar [data-m="more"]', { timeout: 8000 }).catch(() => null)
        if (defineBtn && (await defineBtn.getAttribute('data-m')) === 'more') { await defineBtn.click(); await frame.click('.mr-more [data-m="define"]') } else if (defineBtn) await defineBtn.click()
        const defined = await frame.waitForSelector('.mr-define, .mr-card.is-define, [class*="define"]', { timeout: 15000 }).catch(() => null)
        ok(`${tag}: Define answers in the margin`, !!defined)
        shots.push(join(OUT, `${tag}-define.png`)); await page.screenshot({ path: shots.at(-1) })
        await fold()
        const pill = id => async () => { await frame.evaluate(id => { const b = [...document.querySelectorAll(`.mr-pill[data-pill="${id}"]`)].find(x => x.getBoundingClientRect().height > 0); b.scrollIntoView({ block: 'center' }); b.click() }, id) }
        await sent('Primer (Before you start)', pill('primer'), 'chapter')
        shots.push(join(OUT, `${tag}-primer.png`)); await page.screenshot({ path: shots.at(-1) })
        ok(`${tag}: Before you start shows the chapter's primer`, await frame.evaluate(() => !!document.querySelector('.mr-primer') && /MOCK gist/.test(document.querySelector('.mr-primer').textContent)))
        await frame.evaluate(() => closePrimer())
        await sent('Catch me up', pill('catchup'), 'ask')
        await sent('Recap', pill('recap'), 'ask')
        await sent('Quiz me on the chapter', pill('quiz'), 'quiz')
        const primerReq = log.ai.find(r => r.intent === 'chapter')
        ok(`${tag}: Before you start is about the chapter (one unit per chapter)`, !!primerReq, primerReq)
      }

      // 3c. The chapter controls: the header's pill opens the book's chapters (parts and chapters).
      await frame.evaluate(() => { getSelection().removeAllRanges(); closeAllPopups(); if (col.open) openCard(null); closeSheet2() })
      await frame.click('#pageBtn')
      const toc = await frame.waitForSelector('[data-testid="lab-toc"] .tree', { timeout: 5000 }).catch(() => null)
      ok(`${tag}: the chapter pill opens the book's chapters`, !!toc && (await frame.$$('[data-testid="lab-toc"] [data-go]')).length > 1)
      shots.push(join(OUT, `${tag}-chapters.png`)); await page.screenshot({ path: shots.at(-1) })
      await frame.evaluate(() => document.querySelector('[data-testid="lab-toc"] [data-close]')?.click())

      // 3f. Round 3: the note editor quotes a passage that opens on its own quotation mark once (““Yes, of course”).
      const noteQuote = await frame.evaluate(() => { const d = document.createElement('div'); d.innerHTML = TinctMargin.html.noteHtml({ quote: '“Yes, of course, if”' }); return d.querySelector('.mr-note__quote').textContent })
      ok(`${tag}: the note editor quotes the passage once (${noteQuote})`, noteQuote === '“Yes, of course, if”', noteQuote)

      // 3e. Round 3: the current chapter is the next one once its heading has passed the upper third (pill and contents),
      // and on a phone Before you start's bottom card shows at a chapter's start after the reader moves, not further down.
      {
        const next = (await spotOf(frame)).page + 1
        await frame.evaluate(n => { const s = document.getElementById('scroll'), sh = state.pages[n - 1].sheet; s.scrollTo({ top: s.scrollTop + sh.getBoundingClientRect().top - s.getBoundingClientRect().top - s.clientHeight * 0.28 }) }, next)
        await page.waitForTimeout(700)
        const now = await frame.evaluate(() => ({ top: currentPlace().page, label: document.getElementById('pageLabel').textContent, reading: chapterAt(readingPage())?.label, want: null }))
        now.want = await frame.evaluate(n => toc.entries.filter(e => e.kind === 'chapter' && e.page <= n).at(-1)?.label, next)
        ok(`${tag}: a heading a third down the screen is the chapter being read (pill "${now.label}", want "${now.want}")`, now.top === next - 1 && now.reading === now.want && (phone ? now.label === now.want || now.want.includes(now.label) : true), now)
        await frame.click('#pageBtn')
        await frame.waitForSelector('[data-testid="lab-toc"] .tree', { timeout: 5000 }).catch(() => null)
        const cur = await frame.evaluate(() => document.querySelector('[data-testid="lab-toc"] [aria-current="page"] .text')?.textContent || null)
        ok(`${tag}: the contents mark that chapter as the one being read ("${cur}")`, cur === now.want, { cur, want: now.want })
        await frame.evaluate(() => document.querySelector('[data-testid="lab-toc"] [data-close]')?.click())
        if (phone) {
          shots.push(join(OUT, `${tag}-heading.png`)); await page.screenshot({ path: shots.at(-1) })
          await frame.evaluate(() => { primer.away.clear(); dispatchEvent(new Event('touchmove')); document.getElementById('scroll').scrollBy(0, 2) })
          await page.waitForTimeout(700)
          // 20 Oct 2026: the chapter's own pills in the text are the phone's way in (Primer there); no Before you start card of its own.
          const trig = await frame.evaluate(n => ({ sheet: col.sheet?.dataset.id || null, start: !!state.pages[n - 1].pg.querySelector('.tb-mark.is-start .tb-pill[data-pill="primer"]') }), next)
          ok(`${tag}: after a move, that chapter offers Primer in its text, no Before you start card`, trig.sheet !== 'trigger' && trig.start, trig)
          await frame.evaluate(() => { const s = document.getElementById('scroll'); s.scrollBy(0, s.clientHeight * 1.2) })
          await page.waitForTimeout(700)
          const gone = await frame.evaluate(() => ({ sheet: col.sheet?.dataset.id || null, page: currentPlace().page }))
          ok(`${tag}: further into the chapter the card is gone (it does not follow the reader down)`, gone.sheet !== 'trigger' || gone.page !== next, gone)
          await frame.evaluate(() => closeSheet2())
        }
      }

      // 3d. Type: a part's name is not set in capitals; a chapter's Before you start names it as its contents do.
      const type = await frame.evaluate(() => ({ part: [...document.querySelectorAll('.tb-part')].map(e => getComputedStyle(e).textTransform)[0] ?? null, phrases: (primer.units || []).slice(0, 30).map(u => TinctMargin.unitPhrase(u)) }))
      // A chapter's marks in the margin name it without pages ("p. 3" was its place in the file).
      const marks = await frame.evaluate(() => [...document.querySelectorAll('.mr-unit__n, .byob-unit-now__name')].map(e => e.textContent.trim()))
      ok(`${tag}: chapter marks name no pages`, (phone || marks.length > 0) && marks.every(t => !/\bpp?\. \d/.test(t)), marks)
      ok(`${tag}: part names are not in capitals`, type.part === null || type.part === 'none', type.part)
      ok(`${tag}: Before you start names chapters as the contents do ("chapter 1", "Letter 2", "The Window · 2")`, type.phrases.length > 0 && type.phrases.every(p => /^chapter \d+$|^Letter \d+$|^(The Window|Time Passes|The Lighthouse) · \d+$/.test(p)), type.phrases.slice(0, 6))
      // 4. A reload keeps the preview's own place.
      // (The open card folded first: an open card may bring its passage back into view.)
      await frame.evaluate(() => { getSelection().removeAllRanges(); closeAllPopups(); if (col.open) openCard(null); closeSheet2?.() })
      await page.waitForTimeout(600)
      await frame.evaluate(() => document.getElementById('scroll').scrollBy(0, 2400))
      await page.waitForTimeout(1500)
      // On text, not in the space at a chapter's end (no paragraph there: the place is kept as a fraction of the chapter).
      for (let i = 0; i < 8 && (await spotOf(frame)).para === undefined; i++) { await frame.evaluate(() => document.getElementById('scroll').scrollBy(0, 160)); await page.waitForTimeout(400) }
      const moved = await spotOf(frame)
      await frame.evaluate(() => savePlaceNow())
      const savedPos = await page.evaluate(id => localStorage.getItem(`tinct-addbook:pos:preview:${id}`), bookId)
      if (process.env.DEBUG) console.log('saved before reload', savedPos)
      await page.reload()
      frame = await frameOf(page)
      if (process.env.DEBUG) console.log('pos after reload', await page.evaluate(id => localStorage.getItem(`tinct-addbook:pos:preview:${id}`), bookId), await spotOf(frame))
      const back = await spotOf(frame)
      ok(`${tag}: a reload keeps the preview's place`, back.page === moved.page && (moved.para === undefined || back.para === moved.para), { moved, back })
      const kept = await page.evaluate(id => JSON.parse(localStorage.getItem(`tinct-addbook:pos:preview:${id}`) || 'null'), bookId)
      ok(`${tag}: the place, cards and highlights are kept under the preview's own keys`, !!kept && Number.isInteger(kept.para) && await page.evaluate(id => !!localStorage.getItem(`tinct-addbook:cards:preview:${id}`), bookId), kept)

      // 5. Nothing of the book reader's was written, and nothing went to the account.
      const after = await mainKeys(page)
      ok(`${tag}: the book reader's keys are untouched`, JSON.stringify(after) === JSON.stringify(before), { before: Object.keys(before), after: Object.keys(after) })
      ok(`${tag}: the account's place is read (GET) and never written`, log.position.every(m => m === 'GET'), log.position)

      // 5b. Dark (Aa): the chapters turn dark with the rest of the reader. (The theme is the device's, shared with the
      // book reader by design, tinct-lab-prefs: so after the check above.)
      await frame.click('#aaBtn'); await frame.waitForSelector('[data-theme-choice="dark"]', { timeout: 5000 }); await frame.click('[data-theme-choice="dark"]'); await page.waitForTimeout(400)
      const dark = await frame.evaluate(() => { const s = [...document.querySelectorAll('.epub-sheet')].find(e => { const r = e.getBoundingClientRect(); return r.bottom > 0 && r.top < innerHeight }); const lum = c => { const m = c.match(/\d+(\.\d+)?/g).map(Number); return (0.2126 * m[0] + 0.7152 * m[1] + 0.0722 * m[2]) / 255 }; let paper = getComputedStyle(document.body).backgroundColor; for (let e = s; e; e = e.parentElement) { const c = getComputedStyle(e).backgroundColor; if (!/rgba\(0, 0, 0, 0\)|transparent/.test(c)) { paper = c; break } } return { bg: lum(paper), ink: lum(getComputedStyle(s.querySelector('.tb-p')).color) } })
      ok(`${tag}: Dark turns the chapters dark (light text on dark paper)`, dark.bg < 0.2 && dark.ink > 0.6, dark)
      shots.push(join(OUT, `${tag}-dark.png`)); await page.screenshot({ path: shots.at(-1) })
      await frame.click('[data-theme-choice="light"]'); await frame.evaluate(() => closeDisplay()); await page.waitForTimeout(300)


      // 6. Back to normal reader (the Aa panel): the book reader for the same book, the opt-in off.
      await frame.click('#aaBtn')
      const back2 = await frame.waitForSelector('[data-layout="text"]', { timeout: 5000 }).catch(() => null)
      ok(`${tag}: the Aa panel offers Back to normal reader`, !!back2 && (await back2.textContent()).includes('Back to normal reader'))
      shots.push(join(OUT, `${tag}-aa.png`)); await page.screenshot({ path: shots.at(-1) })
      if (back2) await Promise.all([page.waitForURL(u => u.pathname === '/reader' && !u.searchParams.has('margin'), { timeout: 20000 }).catch(() => null), back2.click()])
      const lab = await page.waitForSelector('[data-testid="lab-root"]', { timeout: 30000 }).catch(() => null)
      const plain = await page.evaluate(() => ({ url: location.pathname + location.search, frame: !!document.querySelector('iframe[data-testid="margin-preview-frame"]'), sticky: localStorage.getItem('tinct:margin-preview') }))
      ok(`${tag}: Back to normal reader opens the book reader, the opt-in off`, !!lab && !plain.frame && plain.sticky === null, plain)

      // 7. /reader without the flag: the book reader, unchanged.
      await page.goto(`${ORIGIN}/reader?book=${bookId}`)
      const lab2 = await page.waitForSelector('[data-testid="lab-root"]', { timeout: 30000 }).catch(() => null)
      ok(`${tag}: /reader without the flag is the book reader`, !!lab2 && !(await page.$('iframe[data-testid="margin-preview-frame"]')))
      if (phone || bookId === BOOKS[0]) { await page.waitForTimeout(1500); shots.push(join(OUT, `${tag}-normal.png`)); await page.screenshot({ path: shots.at(-1) }) }
      // Round 2: a PDF opened in the preview after all loads the PDF scripts then (pdfReady), once.
      if (!phone && bookId === BOOKS[0]) {
        await page.goto(`${ORIGIN}/reader?book=${bookId}&margin=1`)
        const again = await frameOf(page)
        const lazy = await again.evaluate(async () => { await pdfReady(); await pdfReady(); return { lib: typeof pdfjsLib?.getDocument, scan: !!window.TinctPdfScan, text: !!window.TinctPdfText, worker: pdfjsLib.GlobalWorkerOptions.workerSrc, scripts: document.querySelectorAll('script[src*="pdf.min.js"]').length } })
        ok(`${tag}: pdfReady loads pdf.js and the PDF scripts on demand, once`, lazy.lib === 'function' && lazy.scan && lazy.text && /pdf\.worker\.min\.js$/.test(lazy.worker) && lazy.scripts === 1, lazy)
      }
      ok(`${tag}: no page errors`, errors.length === 0, errors)
      await context.close()
    }
  }

  // Round 2: a long book with parts on a phone (War and Peace): the pill names the chapter ("Chapter 1" of
  // "Book One (1805) — Chapter 1"), and most chapters wait to be laid out.
  {
    const tag = 'war-and-peace-390x844'
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, hasTouch: true, isMobile: true })
    await mockApis(context, { position: [], ai: [] })
    const page = await context.newPage()
    const errors = []; page.on('pageerror', e => errors.push(String(e)))
    await page.goto(`${ORIGIN}/reader?book=war-and-peace&margin=1`)
    const frame = await frameOf(page)
    const pill = await frame.evaluate(() => ({ label: document.getElementById('pageLabel').textContent, later: document.querySelectorAll('.tb-chapter.tb-later').length, all: document.querySelectorAll('.tb-chapter').length }))
    ok(`${tag}: the pill names the chapter ("${pill.label}")`, /^Chapter \d+$/.test(pill.label), pill)
    ok(`${tag}: the title stays whole beside "Chapter N"`, (await pillNow(frame)).titleMode === 'whole')
    ok(`${tag}: most chapters wait to be laid out (${pill.later} of ${pill.all})`, pill.later > pill.all / 2, pill)
    shots.push(join(OUT, `${tag}-open.png`)); await page.screenshot({ path: shots.at(-1) })
    ok(`${tag}: no page errors`, errors.length === 0, errors)
    await context.close()
  }

  // 20 Oct 2026 (Anders's iPhone): the phone preview is the Tinct phone reader with only the new menu, the bar, the
  // cards and the chapter pills added. In WebKit with an iPhone's agent and touch: no white page card, the book reader's
  // type; the pills at a chapter's start and end; the reader's own selection (no native one, so no iOS menu); no
  // minimise on the bottom card; Ask and a note as the bottom card with their field focused, nothing editable in the
  // text; a highlight deleted stays deleted after a reload.
  {
    const tag = 'to-the-lighthouse-390x844-iphone'
    const wk = await webkit.launch()
    try {
      const context = await wk.newContext({ ...devices['iPhone 13'], viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, serviceWorkers: 'block' })
      const log = { position: [], ai: [] }
      await mockApis(context, log)
      const page = await context.newPage()
      const errors = []; page.on('pageerror', e => errors.push(String(e)))
      const type = () => {
        const pick = el => { const s = getComputedStyle(el), r = el.getBoundingClientRect(); return { size: parseFloat(s.fontSize), line: parseFloat(s.lineHeight), left: Math.round(r.left), width: Math.round(r.width), color: s.color, family: s.fontFamily.split(',')[0].replace(/["']/g, ''), align: s.textAlign, hyphens: s.hyphens || s.webkitHyphens, spacing: s.wordSpacing, lang: el.closest('[lang]')?.lang } }
        const p = [...document.querySelectorAll('.tb-p, .lab-hearing-line')].find(e => e.getBoundingClientRect().height > 40 && e.getBoundingClientRect().top > 0)
        return p ? pick(p) : null
      }
      await page.goto(`${ORIGIN}/reader?book=to-the-lighthouse&margin=0`)
      await page.waitForSelector('.lab-hearing-line', { timeout: 30000 }); await page.waitForTimeout(1500)
      const normal = await page.evaluate(type)
      shots.push(join(OUT, `${tag}-normal.png`)); await page.screenshot({ path: shots.at(-1) })
      await page.goto(`${ORIGIN}/reader?book=to-the-lighthouse&margin=1`)
      let frame = await frameOf(page)
      await frame.evaluate(() => { document.getElementById('scroll').scrollTop = 0 }); await page.waitForTimeout(500)
      const look = await frame.evaluate(() => { const s = [...document.querySelectorAll('.epub-sheet')].find(e => e.getBoundingClientRect().bottom > 80), cs = getComputedStyle(s); return { bg: cs.backgroundColor, shadow: cs.boxShadow, border: cs.borderTopWidth } })
      const mine = await frame.evaluate(type)
      shots.push(join(OUT, `${tag}-open.png`)); await page.screenshot({ path: shots.at(-1) })
      ok(`${tag}: no white page card on the phone (the paper shows, no shadow or border)`, /rgba\(0, 0, 0, 0\)|transparent/.test(look.bg) && look.shadow === 'none' && look.border === '0px', look)
      ok(`${tag}: the text is set as the book reader's (font, size, line, colour, measure, margins)`, !!normal && !!mine && mine.family === normal.family && Math.abs(mine.size - normal.size) < 0.6 && Math.abs(mine.line - normal.line) < 1 && mine.color === normal.color && Math.abs(mine.left - normal.left) <= 2 && Math.abs(mine.width - normal.width) <= 4 && mine.align === normal.align, { normal, mine })
      // Hyphenated as the book reader's justified phone text where it has no plan of its own: by the browser, in the book's language.
      ok(`${tag}: justified and hyphenated by the book's language, the book reader's word spacing`, mine?.hyphens === 'auto' && mine.lang === 'en' && mine.spacing === normal?.spacing && mine.align === 'justify', { normal, mine })
      // The chapter pills, in the text at a chapter's start and end; their words are not text of the chapter.
      const pills = await frame.evaluate(() => {
        const ch = document.querySelector('.tb-chapter'), start = ch.querySelector(':scope > .tb-head + .tb-mark.is-start'), end = ch.querySelector(':scope > .tb-mark.is-end:last-child')
        const ids = el => [...(el?.querySelectorAll('.tb-pill') || [])].map(b => b.dataset.pill)
        const shown = el => !!el && el.getBoundingClientRect().height > 0
        return { start: ids(start), end: ids(end), shown: shown(start) && shown(end), k: start && getComputedStyle(start, '::before').content, text: (start?.textContent || '') + (end?.textContent || ''), caps: start ? getComputedStyle(start.querySelector('.tb-pill'), '::after').textTransform : '' }
      })
      ok(`${tag}: a chapter's start has Primer and Catch me up, its end Recap, Quiz me and Note, in the text`, pills.shown && pills.start.join() === 'primer,catchup' && pills.end.join() === 'recap,quiz,note' && /Starting/.test(pills.k || '') && pills.text === '' && pills.caps === 'none', pills)
      shots.push(join(OUT, `${tag}-pills-start.png`)); await page.screenshot({ path: shots.at(-1) })
      await frame.evaluate(() => { const e = document.querySelector('.tb-chapter > .tb-mark.is-end'); const s = document.getElementById('scroll'); s.scrollTop += e.getBoundingClientRect().top - s.clientHeight / 2 }); await page.waitForTimeout(500)
      shots.push(join(OUT, `${tag}-pills-end.png`)); await page.screenshot({ path: shots.at(-1) })
      await frame.evaluate(() => document.querySelector('.tb-chapter > .tb-mark.is-start .tb-pill[data-pill="primer"]').click()); await page.waitForTimeout(800)
      ok(`${tag}: Primer opens its bottom card`, await frame.evaluate(() => col.sheet?.dataset.id === 'primer'))
      await frame.evaluate(() => closeSheet2())
      await frame.evaluate(() => { document.getElementById('scroll').scrollTop = 0 }); await page.waitForTimeout(500)
      // The reader's own selection: a long press and a drag (touch events), never a native selection.
      const press = (x, y, x2, y2) => frame.evaluate(async ({ x, y, x2, y2 }) => {
        const target = document.elementFromPoint(x, y)
        const mk = (type, cx, cy, list = true) => { const t = { identifier: 1, target, clientX: cx, clientY: cy }; let ev; try { ev = new TouchEvent(type, { bubbles: true, cancelable: true }) } catch { ev = new Event(type, { bubbles: true, cancelable: true }) } for (const [k, v] of Object.entries({ touches: list ? [t] : [], targetTouches: list ? [t] : [], changedTouches: [t] })) Object.defineProperty(ev, k, { value: v }); return ev }
        target.dispatchEvent(mk('touchstart', x, y))
        const ss = new Event('selectstart', { bubbles: true, cancelable: true }); (target.firstChild || target).dispatchEvent(ss)
        await new Promise(r => setTimeout(r, 520))
        let held = false
        for (let i = 1; i <= 6; i++) { const ev = mk('touchmove', x + (x2 - x) * i / 6, y + (y2 - y) * i / 6); target.dispatchEvent(ev); held = held || ev.defaultPrevented; await new Promise(r => setTimeout(r, 30)) }
        target.dispatchEvent(mk('touchend', x2, y2, false))
        return { selectstart: ss.defaultPrevented, held }
      }, { x, y, x2, y2 })
      const tap = (x, y) => frame.evaluate(async ({ x, y }) => {
        const target = document.elementFromPoint(x, y)
        const mk = (type, list = true) => { const t = { identifier: 2, target, clientX: x, clientY: y }; let ev; try { ev = new TouchEvent(type, { bubbles: true, cancelable: true }) } catch { ev = new Event(type, { bubbles: true, cancelable: true }) } for (const [k, v] of Object.entries({ touches: list ? [t] : [], targetTouches: list ? [t] : [], changedTouches: [t] })) Object.defineProperty(ev, k, { value: v }); return ev }
        target.dispatchEvent(mk('touchstart')); await new Promise(r => setTimeout(r, 60)); target.dispatchEvent(mk('touchend', false))
      }, { x, y })
      const spot = () => frame.evaluate(() => { const el = [...document.querySelectorAll('.tb-p')].find(e => { const r = e.getBoundingClientRect(); return r.top > 150 && r.top < 480 && e.textContent.length > 200 }); const r = el.getBoundingClientRect(); return { x: r.left + 40, y: r.top + 12, x2: r.left + 200, y2: r.top + 50 } })
      let at = await spot()
      const pressed = await press(at.x, at.y, at.x2, at.y2); await page.waitForTimeout(600)
      const selNow = await frame.evaluate(() => ({ native: getSelection().toString(), bar: !!document.querySelector('.mr-pbar'), own: !!mr?.own, words: mr?.info?.text?.split(/\s+/).length || 0, painted: !!window.CSS?.highlights?.has('tinct-sel') }))
      ok(`${tag}: a long press and drag selects with the reader's own selection: the bar, no native selection (no iOS menu)`, pressed.selectstart && pressed.held && selNow.bar && selNow.own && selNow.native === '' && selNow.words > 2 && selNow.painted, { pressed, selNow })
      shots.push(join(OUT, `${tag}-selection.png`)); await page.screenshot({ path: shots.at(-1) })
      // A native selection made under a finger anyway is taken over and cleared.
      await tap(200, 700); await page.waitForTimeout(400)
      const adopted = await frame.evaluate(async () => {
        const p = [...document.querySelectorAll('.tb-p')].find(e => { const r = e.getBoundingClientRect(); return r.top > 150 && r.top < 480 && e.textContent.length > 200 }), n = [...p.childNodes].find(x => x.nodeType === 3)
        const t0 = new Event('touchstart', { bubbles: true }); for (const k of ['touches', 'targetTouches', 'changedTouches']) Object.defineProperty(t0, k, { value: [] }); document.dispatchEvent(t0); getSelection().setBaseAndExtent(n, 0, n, 12)
        await new Promise(r => setTimeout(r, 200))
        return { native: getSelection().toString(), bar: !!document.querySelector('.mr-pbar'), own: !!mr?.own }
      })
      ok(`${tag}: a native selection under a finger becomes the reader's own (cleared, the bar shown)`, adopted.native === '' && adopted.bar && adopted.own, adopted)
      await tap(200, 700); await page.waitForTimeout(400)
      ok(`${tag}: a tap on the text lets the bar go`, await frame.evaluate(() => !mr && !document.querySelector('.mr-pbar')))
      // Ask: the bottom card, the passage quoted, its empty field focused above the keyboard; nothing editable in the text.
      at = await spot(); await press(at.x, at.y, at.x2, at.y2); await page.waitForTimeout(600)
      await frame.tap('.mr-pbar [data-m="ask"]'); await page.waitForTimeout(600)
      const asked = await frame.evaluate(() => { const f = document.activeElement, r = f?.getBoundingClientRect(); return { sheet: !!col.sheet && col.sheet.contains(f), field: f?.className, empty: f?.value === '', ph: f?.placeholder, quote: !!col.sheet?.querySelector('.mr-quote'), visible: !!r && r.top > 0 && r.bottom <= innerHeight, editable: document.querySelectorAll('[contenteditable]:not([contenteditable="false"])').length + document.querySelectorAll('.epub-pg textarea, .epub-pg input').length, bar: !!document.querySelector('.mr-pbar') } })
      ok(`${tag}: Ask opens the bottom card with the passage and a focused, empty "Ask…" field; no field or contenteditable in the text`, asked.sheet && asked.field === 'mr-follow__input' && asked.empty && asked.ph === 'Ask…' && asked.quote && asked.visible && asked.editable === 0 && !asked.bar, asked)
      shots.push(join(OUT, `${tag}-ask.png`)); await page.screenshot({ path: shots.at(-1) })
      await frame.type('.mr-sheet .mr-follow__input', 'Why is he so happy?'); await frame.press('.mr-sheet .mr-follow__input', 'Enter')
      await frame.waitForFunction(t => col.sheet?.textContent.includes(t), MOCK_ANSWER.slice(0, 30), { timeout: 15000 }).catch(() => null)
      const card = await frame.evaluate(() => ({ answer: !!col.sheet?.textContent.includes('MOCK'), minimise: col.sheet?.querySelectorAll('.mr-card__close').length, trash: !!col.sheet?.querySelector('[data-c="delete"]') }))
      ok(`${tag}: the question is answered in the bottom card, which has no minimise (the bin stays)`, card.answer && card.minimise === 0 && card.trash, card)
      shots.push(join(OUT, `${tag}-card.png`)); await page.screenshot({ path: shots.at(-1) })
      await frame.evaluate(() => closeSheet2()); await page.waitForTimeout(300)
      // A note: the bottom card, the passage quoted, its field focused; kept, and opened again from its mark.
      at = await spot(); await press(at.x, at.y + 60, at.x2, at.y2 + 60); await page.waitForTimeout(600)
      await frame.tap('.mr-pbar [data-m="note"]'); await page.waitForTimeout(600)
      const noted = await frame.evaluate(() => ({ sheet: !!col.sheet && col.sheet.contains(document.activeElement), field: document.activeElement?.className, quote: !!col.sheet?.querySelector('.mr-quote'), trash: !!col.sheet?.querySelector('[data-c="delete"]'), inline: !!document.querySelector('.mr-float.mr-note'), minimise: col.sheet?.querySelectorAll('.mr-card__close').length }))
      ok(`${tag}: Note opens the bottom card with the passage and a focused field, not the inline editor`, noted.sheet && noted.field === 'mr-note-edit' && noted.quote && noted.trash && !noted.inline && noted.minimise === 0, noted)
      await frame.type('.mr-sheet .mr-note-edit', 'A note on this.')
      shots.push(join(OUT, `${tag}-note.png`)); await page.screenshot({ path: shots.at(-1) })
      await frame.evaluate(() => closeSheet2()); await page.waitForTimeout(400)
      const noteId = await frame.evaluate(() => highlights().find(h => h.note === 'A note on this.')?.id || null)
      ok(`${tag}: the note is kept on its highlight`, !!noteId, noteId)
      // (Passages close together share one mark, which opens their cards in turn.)
      await frame.evaluate(async id => { for (let i = 0; i < 4 && col.sheet?.dataset.id !== 'n-' + id; i++) { [...document.querySelectorAll('.mr-mark')].find(m => (m.dataset.ids || m.dataset.id).split(' ').includes('n-' + id))?.click(); await new Promise(r => setTimeout(r, 250)) } }, noteId); await page.waitForTimeout(300)
      ok(`${tag}: its mark opens it again as the bottom card`, await frame.evaluate(() => col.sheet?.querySelector('.mr-note-edit')?.value === 'A note on this.'))
      await frame.evaluate(() => closeSheet2()); await page.waitForTimeout(300)
      // A highlight: made, tapped (its own bar), deleted; gone after a reload.
      at = await spot(); await press(at.x, at.y, at.x2, at.y2); await page.waitForTimeout(600)
      await frame.tap('.mr-pbar [data-m="dot"]'); await page.waitForTimeout(400)
      const made = await frame.evaluate(() => highlights().filter(h => !h.note).map(h => h.id))
      await tap(200, 760); await page.waitForTimeout(400)
      const mid = await frame.evaluate(id => { const h = highlights().find(x => x.id === id); const r = [...rangeFromOffsets(state.pages[h.page - 1].pg, h.start, h.end).getClientRects()].find(q => q.width > 6); return { x: r.left + r.width / 2, y: r.top + r.height / 2 } }, made[0])
      await tap(mid.x, mid.y); await page.waitForTimeout(500)
      const own = await frame.evaluate(() => mr?.mode)
      await frame.tap('.mr-pbar [data-m="remove"]').catch(() => null); await page.waitForTimeout(500)
      const gone = await frame.evaluate(id => !highlights().some(h => h.id === id), made[0])
      ok(`${tag}: a tap on a highlight opens its bar, and its bin deletes it`, made.length === 1 && own === 'existing' && gone, { made, own, gone })
      await page.reload(); frame = await frameOf(page)
      ok(`${tag}: the deleted highlight stays deleted after a reload (the note's stays)`, await frame.evaluate(([id, nid]) => !highlights().some(h => h.id === id) && highlights().some(h => h.id === nid), [made[0], noteId]))
      // (WebKit only: the account library's tab lock, stolen by the reload's own page; nothing of the reader's.)
      const ownErrors = errors.filter(e => !/Lock was stolen by another request/.test(e))
      ok(`${tag}: no page errors`, ownErrors.length === 0, errors)
      await context.close()
    } finally { await wk.close() }
  }

  // Round 3: the narrowest phones (375 and 390 px): To the Lighthouse's pill keeps "The Window · N" whole, the title
  // cut (most of it still shown) or left out; never the chapter cut while the title stays.
  for (const [w, h] of [[375, 812], [390, 844]]) {
    const tag = `to-the-lighthouse-${w}x${h}-pill`
    const context = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2, hasTouch: true, isMobile: true, userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1' })
    await mockApis(context, { position: [], ai: [] })
    const page = await context.newPage()
    const errors = []; page.on('pageerror', e => errors.push(String(e)))
    await page.goto(`${ORIGIN}/reader?book=to-the-lighthouse&margin=1`)
    const frame = await frameOf(page)
    const pill = await pillNow(frame)
    ok(`${tag}: "${pill.label}" whole, the title ${pill.titleMode}`, pill.label === pill.chapter && /^The Window · \d+$/.test(pill.label) && pill.fit !== 'cut' && pill.title, pill)
    shots.push(join(OUT, `${tag}.png`)); await page.screenshot({ path: shots.at(-1), clip: { x: 0, y: 0, width: w, height: 120 } })
    ok(`${tag}: no page errors`, errors.length === 0, errors)
    await context.close()
  }

  // 9. The desktop (Anders, 20 Oct 2026): Tinct paper, and the Layout switch. A Tinct book in the margin view reads
  // as the book reader's desktop text (font, size, line, colour, gap, alignment, measure) on the theme's paper, no
  // white sheet; its chapter marks stand level with the heading and the last line. Aa's Layout: Margin, Two-page and
  // Compare; Two-page and Compare open the book reader at the same chapter, paragraph and word and keep the opt-in;
  // the book reader's Margin (Book editions) comes back to the same place.
  const DESK_SHOTS = process.env.DESK_SHOTS ? resolve(process.env.DESK_SHOTS) : null
  if (DESK_SHOTS) mkdirSync(DESK_SHOTS, { recursive: true })
  const deskShot = async (page, name) => { const path = join(DESK_SHOTS || OUT, name); shots.push(path); await page.screenshot({ path }) }
  const TEXT_KEYS = ['fontFamily', 'fontSize', 'fontWeight', 'fontStyle', 'lineHeight', 'color', 'textAlign', 'hyphens', 'letterSpacing', 'wordSpacing', 'textIndent', 'marginBottom']
  const paperOf = el => { for (let e = el; e; e = e.parentElement) { const c = getComputedStyle(e).backgroundColor; if (c && !/rgba\(0, 0, 0, 0\)|transparent/.test(c)) return c } return getComputedStyle(document.body).backgroundColor }
  const normalPlace = page => page.evaluate(() => { const r = document.querySelector('[data-testid="lab-root"]'); const [para, word] = (r?.dataset.place || '').split(':').map(Number); return { chapter: Number(r?.dataset.chapter), para, word, view: r?.dataset.desktopView, url: location.pathname + location.search, sticky: localStorage.getItem('tinct:margin-preview'), frame: !!document.querySelector('iframe[data-testid="margin-preview-frame"]') } })
  const previewPlace = frame => frame.evaluate(() => { const s = previewSpot(); return { chapter: toc.entries.find(e => e.page === s.page && e.kind === 'chapter')?.number, para: s.para, word: s.word } })
  const waitNormal = async page => { await page.waitForSelector('[data-testid="lab-root"][data-position-resolving="false"]', { timeout: 40000 }).catch(() => null); await page.waitForTimeout(2500) }
  for (const bookId of BOOKS) {
    for (const [w, h] of [[1440, 900], [1280, 800]]) {
      const tag = `${bookId}-${w}x${h}-desk`, first = bookId === BOOKS[0]
      const context = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 })
      const log = { position: [], ai: [] }
      await mockApis(context, log)
      const page = await context.newPage()
      const errors = []; page.on('pageerror', e => errors.push(String(e)))
      await page.goto(`${ORIGIN}/lab/addbook/vendor/pdfjs/pdf.min.js`)
      await page.evaluate(rec => { localStorage.clear(); localStorage.setItem('tinct-lab-position', JSON.stringify(rec)); localStorage.setItem('tinct-lab-device-id', 'qa') }, positionRecord())
      // The book reader's desktop text, as it sets it now.
      await page.goto(`${ORIGIN}/reader?book=${bookId}&margin=0`)
      await waitNormal(page)
      const normal = await page.evaluate(([keys, paper]) => { const p = document.querySelector('.lab-passage .lab-hearing-line'); const s = getComputedStyle(p); return { ...Object.fromEntries(keys.map(k => [k, s[k]])), measure: p.getBoundingClientRect().width, paper: new Function('el', `return (${paper})(el)`)(p) } }, [TEXT_KEYS, paperOf.toString()])
      if (first) await deskShot(page, `normal-reader-${w}x${h}.png`)
      // The preview: the same text on the same paper.
      await page.goto(`${ORIGIN}/reader?book=${bookId}&margin=1`)
      let frame = await frameOf(page)
      const look = await frame.evaluate(([keys, paper]) => {
        const p = [...document.querySelectorAll('.tb-p')].find(el => { const r = el.getBoundingClientRect(); return r.top > 60 && r.bottom < innerHeight && el.textContent.trim().length > 40 }) || document.querySelector('.tb-p'), s = getComputedStyle(p)
        const sheets = [...document.querySelectorAll('.epub-sheet')].map(e => getComputedStyle(e))
        return { ...Object.fromEntries(keys.map(k => [k, s[k]])), measure: p.getBoundingClientRect().width, paper: new Function('el', `return (${paper})(el)`)(p), white: sheets.filter(c => !/rgba\(0, 0, 0, 0\)|transparent/.test(c.backgroundColor) || c.boxShadow !== 'none' || c.borderTopWidth !== '0px').length, sheets: sheets.length }
      }, [TEXT_KEYS, paperOf.toString()])
      ok(`${tag}: no white page sheets (paper, no shadow or border) on any of ${look.sheets} chapters`, look.white === 0, look)
      const differs = TEXT_KEYS.filter(k => look[k] !== normal[k])
      ok(`${tag}: the text is set as the book reader's (${TEXT_KEYS.join(', ')})`, differs.length === 0, { differs, normal, look })
      ok(`${tag}: the measure is the book reader's leaf (${Math.round(normal.measure)}px) and the paper its colour`, Math.abs(look.measure - normal.measure) <= 1 && look.paper === normal.paper, { normal: [normal.measure, normal.paper], look: [look.measure, look.paper] })
      if (first) await deskShot(page, `preview-${w}x${h}.png`)
      // The chapter's marks: the start mark level with the heading, the end mark with the last line.
      const unitAt = await frame.evaluate(async () => {
        const n = currentPlace().page
        epubGoSpot(n, 0, 0); await new Promise(r => setTimeout(r, 700))
        document.getElementById('scroll').scrollBy(0, -120); await new Promise(r => setTimeout(r, 700))
        const key = primer.units.find(u => u.start === n)?.key, mark = document.querySelector(`.mr-unit.is-start[data-unit="${key}"]`), head = state.pages[n - 1].pg.querySelector('.tb-title')
        const start = mark && head ? { mark: mark.getBoundingClientRect().top, head: head.getBoundingClientRect().top } : null
        const last = [...epubParas(state.pages[n - 1])].reverse().find(el => el.textContent.trim().length > 1)
        last.scrollIntoView({ block: 'center' }); await new Promise(r => setTimeout(r, 900))
        const endMark = document.querySelector(`.mr-unit.is-end[data-unit="${key}"]`), r = document.createRange(); r.selectNodeContents(last); const lines = [...r.getClientRects()].filter(b => b.height > 0)
        return { start, end: endMark ? { mark: endMark.getBoundingClientRect().top, line: lines[lines.length - 1].top } : null }
      })
      ok(`${tag}: the chapter's start mark is level with its heading`, !!unitAt.start && Math.abs(unitAt.start.mark - unitAt.start.head) <= 6, unitAt)
      ok(`${tag}: the chapter's end mark is level with its last line`, !!unitAt.end && Math.abs(unitAt.end.mark - unitAt.end.line) <= 6, unitAt)
      if (first) {
        await frame.evaluate(async () => { const n = currentPlace().page; epubGoSpot(n, 0, 0); await new Promise(r => setTimeout(r, 600)); document.getElementById('scroll').scrollBy(0, -90) })
        await page.waitForTimeout(800); await deskShot(page, `unit-start-${w}x${h}.png`)
        await frame.evaluate(() => { const s = document.getElementById('scroll'); s.scrollBy(0, 300) }); await page.waitForTimeout(800)
        const picked = await selectInView(frame)
        const bar = await frame.waitForSelector('.mr-bar [data-m="explain"]', { timeout: 8000 }).catch(() => null)
        if (bar) await bar.click()
        const card = await frame.waitForFunction(text => [...document.querySelectorAll('.mr-card')].some(el => el.textContent.includes(text)), MOCK_ANSWER.slice(0, 30), { timeout: 15000 }).catch(() => null)
        ok(`${tag}: Explain answers in a card beside the paper text`, !!picked && !!card)
        await frame.evaluate(() => getSelection().removeAllRanges()); await page.waitForTimeout(500)
        await deskShot(page, `explain-${w}x${h}.png`)
        await frame.evaluate(() => { if (col.open) openCard(null) })
      }
      // A place within a paragraph, a word in: the place handed on is that paragraph and word.
      const target = await frame.evaluate(() => { const n = currentPlace().page, paras = epubParas(state.pages[n - 1]); const i = Math.min(paras.length - 1, Math.max(2, paras.findIndex((el, k) => k >= 2 && el.textContent.split(/\s+/).length > 30))); epubGoSpot(n, i, 7); return { page: n, para: i, word: 7 } })
      await page.waitForTimeout(1200)
      const here = await previewPlace(frame)
      ok(`${tag}: the preview holds the word it was taken to`, here.para === target.para && here.word === target.word, { here, target })
      // Aa: Layout, Margin · Two-page · Compare (then Back to normal reader).
      await frame.click('#aaBtn')
      await frame.waitForSelector('[data-aa="layout"] [data-layout="two-page"]', { timeout: 5000 }).catch(() => null)
      const layouts = await frame.evaluate(() => ({ label: document.getElementById('aaLayoutLabel')?.textContent, rows: [...document.querySelectorAll('[data-aa="layout"] [data-layout]')].map(b => [b.dataset.layout, b.textContent.replace(/✓/g, '').trim(), b.getAttribute('aria-pressed')]) }))
      ok(`${tag}: Aa's Layout offers Margin (on), Two-page, Compare and Back to normal reader`, layouts.label === 'Layout' && JSON.stringify(layouts.rows) === JSON.stringify([['margin', 'Margin', 'true'], ['two-page', 'Two-page', 'false'], ['compare', 'Compare', 'false'], ['text', 'Back to normal reader', 'false']]), layouts)
      if (first) await deskShot(page, `aa-layout-${w}x${h}.png`)
      // Two-page: the book reader at the same chapter, paragraph and word; the opt-in kept.
      await Promise.all([page.waitForURL(u => !u.searchParams.has('margin'), { timeout: 20000 }).catch(() => null), frame.click('[data-layout="two-page"]')])
      await waitNormal(page)
      const two = await normalPlace(page)
      ok(`${tag}: Two-page opens the book reader in two pages at the same place (chapter ${here.chapter}, ¶ ${here.para}, word ${here.word})`, !two.frame && two.view === 'read' && two.chapter === here.chapter && two.para === here.para && two.word === here.word, { here, two })
      ok(`${tag}: the opt-in survives Two-page, and the link's place leaves the address`, two.sticky === '1' && !/chapter=|view=/.test(two.url), two)
      if (first) await deskShot(page, `two-page-${w}x${h}.png`)
      // Margin from the book reader (Book editions): back to the preview at the same place.
      await page.click('[data-testid="lab-super"]'); await page.click('[data-testid="lab-super-row-editions"]')
      const marginRow = await page.waitForSelector('[data-testid="lab-v2-margin"]', { timeout: 8000 }).catch(() => null)
      ok(`${tag}: the book reader offers Margin while the opt-in is on`, !!marginRow && (await marginRow.textContent()).includes('Margin'))
      if (marginRow) await marginRow.click()
      frame = await frameOf(page)
      await page.waitForTimeout(800)
      const back = await previewPlace(frame)
      const backUrl = await page.evaluate(() => ({ url: location.pathname + location.search, sticky: localStorage.getItem('tinct:margin-preview') }))
      ok(`${tag}: Margin from the book reader returns to the same place`, back.chapter === here.chapter && back.para === here.para && back.word === here.word, { here, back })
      ok(`${tag}: the return link's place leaves the address; the opt-in on`, backUrl.sticky === '1' && !/chapter=/.test(backUrl.url) && /margin=1/.test(backUrl.url), backUrl)
      if (first) await deskShot(page, `back-to-margin-${w}x${h}.png`)
      // Compare: the same place, side by side; the opt-in kept. Then Margin again.
      await frame.click('#aaBtn'); await frame.waitForSelector('[data-layout="compare"]', { timeout: 5000 })
      await Promise.all([page.waitForURL(u => !u.searchParams.has('margin'), { timeout: 20000 }).catch(() => null), frame.click('[data-layout="compare"]')])
      await waitNormal(page)
      const cmp = await normalPlace(page)
      ok(`${tag}: Compare opens the book reader side by side at the same place`, !cmp.frame && cmp.view === 'compare' && cmp.chapter === here.chapter && cmp.para === here.para && cmp.word === here.word, { here, cmp })
      ok(`${tag}: the opt-in survives Compare`, cmp.sticky === '1', cmp)
      await page.click('[data-testid="lab-super"]'); await page.click('[data-testid="lab-super-row-editions"]')
      await (await page.waitForSelector('[data-testid="lab-v2-margin"]', { timeout: 8000 })).click()
      frame = await frameOf(page)
      await page.waitForTimeout(800)
      const again = await previewPlace(frame)
      ok(`${tag}: Margin from Compare returns to the same place`, again.chapter === here.chapter && again.para === here.para && again.word === here.word, { here, again })
      ok(`${tag}: no page errors`, errors.length === 0, errors)
      await context.close()
    }
  }

  // 8. A web font that arrives late (after the place was restored) leaves the place where it was, also without
  // scroll anchoring (Safari: none). Fonts held back past the preview's wait for them (tinct-book.js FONT_WAIT_MS).
  for (const bookId of BOOKS) {
    const tag = `${bookId}-latefont`
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, hasTouch: true, isMobile: true })
    await mockApis(context, { position: [], ai: [] })
    await context.route(/\/fonts\/.*\.woff2/, async route => { await new Promise(r => setTimeout(r, 3500)); await route.continue().catch(() => {}) })
    await context.addInitScript(() => { if (location.pathname.startsWith('/lab/')) document.addEventListener('DOMContentLoaded', () => { const s = document.createElement('style'); s.textContent = '#scroll{overflow-anchor:none}'; document.head.appendChild(s) }) })
    const page = await context.newPage()
    const errors = []; page.on('pageerror', e => errors.push(String(e)))
    await page.goto(`${ORIGIN}/lab/addbook/vendor/pdfjs/pdf.min.js`)
    const seeded = { page: chapterIndex(bookId, PLACES[bookId].chapterNumber) + 3, para: 6 }
    await page.evaluate(([id, s]) => { localStorage.clear(); localStorage.setItem(`tinct-addbook:pos:preview:${id}`, JSON.stringify({ page: s.page, frac: 0, para: s.para, word: 0, at: Date.now() })) }, [bookId, seeded])
    await page.goto(`${ORIGIN}/reader?book=${bookId}&margin=1`)
    const frame = await frameOf(page)
    const first = await spotOf(frame)
    await frame.waitForFunction(() => document.fonts.status === 'loaded' && [...document.fonts].some(f => f.family.includes('Literata') && f.status === 'loaded'), null, { timeout: 20000 }).catch(() => null)
    await page.waitForTimeout(800)
    const later = await spotOf(frame)
    ok(`${tag}: restored at chapter ${seeded.page}, paragraph ${seeded.para}`, first.page === seeded.page && first.para === seeded.para, first)
    ok(`${tag}: still there after the fonts arrive (no scroll anchoring)`, later.page === seeded.page && later.para === seeded.para, { first, later })
    ok(`${tag}: no page errors`, errors.length === 0, errors)
    await context.close()
  }
} finally {
  await browser.close()
}
console.log(`\nscreenshots:\n${shots.join('\n')}`)
console.log(failures ? `\n${failures} check(s) failed` : '\nall checks passed')
process.exit(failures ? 1 : 0)
