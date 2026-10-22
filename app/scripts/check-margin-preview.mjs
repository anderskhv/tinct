#!/usr/bin/env node
// The margin preview (/reader?book=<id>&margin=1, src/lab/marginPreview/): a registered book in the margin reader.
// Headless Chromium against a local dev server (`npx vite --port 4811`), muted, every AI call and the account mocked:
//
//   PREVIEW_ORIGIN=http://127.0.0.1:4811 CHROMIUM_PATH=… node scripts/check-margin-preview.mjs
//
// For Frankenstein and To the Lighthouse, at 1440×900 (390×844: a phone opens the book reader in its margin mode
// instead, checked in scripts/check-phone-cards.mjs): the book opens at the book reader's place
// (seeded on this device), a selection opens the bar and Explain draws its card, the Notebook lists it (desktop;
// the Notebook is desktop only), a reload keeps the preview's own place, the book reader's keys are never
// written and nothing is PUT to the account, and /reader without the flag is the book reader, unchanged.
// Screenshots go to OUT (default artifacts/margin-preview).
import { chromium } from 'playwright'
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
// Every key on this device, for what the preview writes (21 Oct 2026: only the book reader's stores).
const allKeys = page => page.evaluate(() => Object.fromEntries(Object.keys(localStorage).map(k => [k, localStorage.getItem(k)])))
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
      const before = await mainKeys(page), beforeAll = await allKeys(page)

      // 1. Opens in the margin reader at the book reader's place. A phone opens the book reader in its margin mode
      // instead (check-phone-cards.mjs has its checks): no frame, the Classic reader not chosen, nothing else here.
      await page.goto(`${ORIGIN}/reader?book=${bookId}&margin=1`)
      if (phone) {
        await page.waitForFunction(() => document.querySelector('[data-testid="lab-root"]')?.dataset.readerReady === 'true', null, { timeout: 60000 })
        const mode = await page.evaluate(() => ({ margin: !!document.querySelector('.lab.is-margin-phone'), frame: !!document.querySelector('iframe[data-testid="margin-preview-frame"]'), classic: localStorage.getItem('tinct:classic-reader') }))
        ok(`${tag}: a phone opens today's phone reader in its margin mode, not the frame`, mode.margin && !mode.frame && mode.classic === null, mode)
        shots.push(join(OUT, `${tag}-open.png`)); await page.screenshot({ path: shots.at(-1) })
        ok(`${tag}: no page errors`, errors.length === 0, errors)
        await context.close()
        continue
      }
      let frame = await frameOf(page)
      const want = PLACES[bookId], at = await spotOf(frame)
      ok(`${tag}: opens in the margin reader (${at.mode}), key ${at.key}`, at.key === `preview:${bookId}` && at.mode === (phone ? 'phone' : 'column'), at)
      ok(`${tag}: at the book reader's place (chapter ${want.chapterNumber}, paragraph ${want.paragraphIndex})`, at.page === chapterIndex(bookId, want.chapterNumber) + 1 && at.para === want.paragraphIndex && at.word <= want.wordIndex, { at, want })
      ok(`${tag}: the Classic reader is not chosen`, await page.evaluate(() => localStorage.getItem('tinct:classic-reader')) === null)
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

      // 3a. The t menu is Tinct's normal menu (21 Oct 2026): Chat · Talk, Summarize, Catch me up (not in chapter 1),
      // Reading settings (the book reader's Main version and Compare version, through the page), Export notes, Library,
      // Profile; no Snip a figure (a PDF's) or Open another book (a reader's own). The Aa label is never selected as text.
      if (!phone) {
        await frame.click('#superBtn'); await frame.waitForSelector('.lab-super-panel')
        const rows = await frame.evaluate(() => [...document.querySelectorAll('.lab-super-panel > .lab-super-row')].map(r => r.dataset.row))
        ok(`${tag}: the t menu is Chat · Talk, Summarize, Catch me up, Reading settings, Export notes, Library, Profile`, JSON.stringify(rows) === JSON.stringify(['conversation', 'summarize', 'catchup', 'settings', 'export', 'library', 'account']), rows)
        ok(`${tag}: the top bar's Aa is never selected as text`, await frame.evaluate(() => getComputedStyle(document.getElementById('aaBtn')).userSelect) === 'none')
        shots.push(join(OUT, `${tag}-tmenu.png`)); await page.screenshot({ path: shots.at(-1) })
        await frame.click('.lab-super-row[data-row="settings"]')
        await frame.waitForSelector('.byob-reading-settings', { timeout: 5000 }).catch(() => null); await page.waitForTimeout(800)
        const reading = await frame.evaluate(() => [...document.querySelectorAll('.byob-reading-settings .lab-v2-row-label')].map(l => l.textContent))
        ok(`${tag}: Reading settings offers Main version and Compare version (${reading.join(', ')})`, reading.includes('Main version') && reading.includes('Compare version'), reading)
        shots.push(join(OUT, `${tag}-reading-settings.png`)); await page.screenshot({ path: shots.at(-1) })
        await frame.click('.byob-reading-settings .lab-v2-dismiss')
        // Talk: the margin Chat with Talk on.
        await frame.click('#superBtn'); await frame.click('.lab-super-row-half[data-row="talk"]')
        ok(`${tag}: the t menu's Talk opens Chat with Talk on`, await frame.waitForFunction(() => chat.talk === true && col.open === 'whole', null, { timeout: 5000 }).then(() => true, () => false))
        await frame.evaluate(() => { setTalk(false); if (col.open) openCard(null) })
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
      // 21 Oct 2026 (margin sync): the frame keeps its own copy of the place only to open there; its cards are the
      // book's chat history (signed out, its device copy), never the preview's own key.
      ok(`${tag}: the place is kept under the preview's key, the cards in the book's chat history`, !!kept && Number.isInteger(kept.para) && await page.evaluate(id => !localStorage.getItem(`tinct-addbook:cards:preview:${id}`) && JSON.parse(localStorage.getItem(`tinct:chat-history:${id}`) || '[]').some(c => c.card?.kind === 'explain'), bookId), kept)

      // 5. The preview writes through the book reader's stores and nothing else (21 Oct 2026, margin sync): the place in
      // its position record (src/lab/marginPreview/useMarginPreviewPlace.ts), highlights and notes in its highlight
      // list, cards in the book's chat history; besides them only the frame's own copy of its place and its device
      // conveniences (theme, primers, the opt-in) under the margin's `tinct-addbook:` and margin keys. Signed out, as
      // here, all of it stays on this device.
      const READER_STORES = /^(tinct-lab-position|tinct-lab-position-dirty|tinct-lab-device-id|tinct-lab-highlights|tinct-lab-highlight-tombstones|tinct-lab-highlights-tap-cleanup-v1|tinct:reading-year:.+|tinct:chat-history:.+)$/
      const PREVIEW_OWN = /^(tinct-addbook:(pos|read|session|prefs|primer|primers|edition|dict|units|whole|turns|view)[:\w-]*.*|tinct:margin-preview|tinct:classic-reader|tinct-lab-prefs|tinct:internal)$/
      const afterAll = await allKeys(page)
      const written = Object.keys(afterAll).filter(k => afterAll[k] !== beforeAll[k])
      const elsewhere = written.filter(k => !READER_STORES.test(k) && !PREVIEW_OWN.test(k))
      ok(`${tag}: the preview writes only through the book reader's stores (and its own place copy)`, elsewhere.length === 0, { elsewhere, written })
      const after = await mainKeys(page)
      const strip = keys => JSON.stringify(Object.fromEntries(Object.entries(keys).filter(([k]) => !READER_STORES.test(k))))
      ok(`${tag}: the book reader's other keys are untouched`, strip(after) === strip(before), { before: Object.keys(before), after: Object.keys(after) })
      ok(`${tag}: no preview-local highlight or card keys are written`, !written.some(k => /^tinct-addbook:(hl|hl-gone|cards):/.test(k)), written)
      // Its moves here are script scrolls with no reader action, which the margin's place gate never writes (a
      // reflow, not a place: marginPreviewPlace.ts); real input is checked in scripts/check-margin-sync.mjs.
      const record = await page.evaluate(id => JSON.parse(localStorage.getItem('tinct-lab-position') || 'null')?.books?.[id], bookId)
      ok(`${tag}: the book reader's record keeps a place of this book in its edition`, !!record && record.bookId === bookId && record.primaryEditionKey === 'modern-en' && Number.isInteger(record.paragraphIndex), record)
      ok(`${tag}: signed out, nothing is written to the account`, log.position.every(m => m === 'GET'), log.position)

      // 5b. Dark (Aa): the chapters turn dark with the rest of the reader. (The theme is the device's, shared with the
      // book reader by design, tinct-lab-prefs: so after the check above.)
      await frame.click('#aaBtn'); await frame.waitForSelector('[data-theme-choice="dark"]', { timeout: 5000 }); await frame.click('[data-theme-choice="dark"]'); await page.waitForTimeout(400)
      const dark = await frame.evaluate(() => { const s = [...document.querySelectorAll('.epub-sheet')].find(e => { const r = e.getBoundingClientRect(); return r.bottom > 0 && r.top < innerHeight }); const lum = c => { const m = c.match(/\d+(\.\d+)?/g).map(Number); return (0.2126 * m[0] + 0.7152 * m[1] + 0.0722 * m[2]) / 255 }; let paper = getComputedStyle(document.body).backgroundColor; for (let e = s; e; e = e.parentElement) { const c = getComputedStyle(e).backgroundColor; if (!/rgba\(0, 0, 0, 0\)|transparent/.test(c)) { paper = c; break } } return { bg: lum(paper), ink: lum(getComputedStyle(s.querySelector('.tb-p')).color) } })
      ok(`${tag}: Dark turns the chapters dark (light text on dark paper)`, dark.bg < 0.2 && dark.ink > 0.6, dark)
      shots.push(join(OUT, `${tag}-dark.png`)); await page.screenshot({ path: shots.at(-1) })
      await frame.click('[data-theme-choice="light"]'); await frame.evaluate(() => closeDisplay()); await page.waitForTimeout(300)


      // 6. Back to normal reader (the Aa panel): the book reader for the same book, the Classic reader chosen on this device.
      await frame.click('#aaBtn')
      const back2 = await frame.waitForSelector('[data-layout="text"]', { timeout: 5000 }).catch(() => null)
      ok(`${tag}: the Aa panel offers Back to normal reader`, !!back2 && (await back2.textContent()).includes('Back to normal reader'))
      shots.push(join(OUT, `${tag}-aa.png`)); await page.screenshot({ path: shots.at(-1) })
      if (back2) await Promise.all([page.waitForURL(u => u.pathname === '/reader' && !u.searchParams.has('margin'), { timeout: 20000 }).catch(() => null), back2.click()])
      const lab = await page.waitForSelector('[data-testid="lab-root"]', { timeout: 30000 }).catch(() => null)
      const plain = await page.evaluate(() => ({ url: location.pathname + location.search, frame: !!document.querySelector('iframe[data-testid="margin-preview-frame"]'), classic: localStorage.getItem('tinct:classic-reader') }))
      ok(`${tag}: Back to normal reader opens the book reader and chooses the Classic reader`, !!lab && !plain.frame && plain.classic === '1', plain)

      // 7. Launch (22 Oct 2026): with the Classic reader chosen, /reader without the flag is the book reader, unchanged;
      // without it, margin view is the default.
      await page.goto(`${ORIGIN}/reader?book=${bookId}`)
      const lab2 = await page.waitForSelector('[data-testid="lab-root"]', { timeout: 30000 }).catch(() => null)
      ok(`${tag}: the Classic reader keeps /reader the book reader`, !!lab2 && !(await page.$('iframe[data-testid="margin-preview-frame"]')))
      if (!phone) {
        await page.evaluate(() => localStorage.removeItem('tinct:classic-reader'))
        await page.goto(`${ORIGIN}/reader?book=${bookId}`)
        const byDefault = await page.waitForSelector('iframe[data-testid="margin-preview-frame"]', { timeout: 30000 }).catch(() => null)
        ok(`${tag}: without the Classic reader, /reader?book= opens margin view (the default)`, !!byDefault)
        await page.goto(`${ORIGIN}/reader?book=${bookId}&margin=0`)
        await page.waitForSelector('[data-testid="lab-root"]', { timeout: 30000 }).catch(() => null)
      }
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

  // The phone (Anders, 20 Oct 2026): the preview on a phone is no longer the margin reader's frame but today's phone
  // reader with the new bar, cards and pills (src/lab/marginPhone/, marginPreview/marginPreviewMount.ts). Its checks
  // are scripts/check-phone-cards.mjs; the frame's phone rows that stood here (War and Peace's pill, the iPhone
  // preview, the narrowest phones' pill) tested a surface /reader no longer opens on a phone.

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
  const normalPlace = page => page.evaluate(() => { const r = document.querySelector('[data-testid="lab-root"]'); const [para, word] = (r?.dataset.place || '').split(':').map(Number); return { chapter: Number(r?.dataset.chapter), para, word, view: r?.dataset.desktopView, url: location.pathname + location.search, classic: localStorage.getItem('tinct:classic-reader'), frame: !!document.querySelector('iframe[data-testid="margin-preview-frame"]') } })
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
      ok(`${tag}: Two-page leaves the Classic reader unchosen, and the link's place leaves the address`, two.classic === null && !/chapter=|view=/.test(two.url), two)
      if (first) await deskShot(page, `two-page-${w}x${h}.png`)
      // Classic reader off (Book editions): back to margin view at the same place.
      await page.click('[data-testid="lab-super"]'); await page.click('[data-testid="lab-super-row-editions"]')
      const marginRow = await page.waitForSelector('[data-testid="lab-v2-classic"]', { timeout: 8000 }).catch(() => null)
      ok(`${tag}: the book reader offers the Classic reader switch, on`, !!marginRow && (await marginRow.textContent()).includes('Classic reader') && (await marginRow.getAttribute('aria-checked')) === 'true')
      if (marginRow) await marginRow.click()
      frame = await frameOf(page)
      await page.waitForTimeout(800)
      const back = await previewPlace(frame)
      const backUrl = await page.evaluate(() => ({ url: location.pathname + location.search, classic: localStorage.getItem('tinct:classic-reader') }))
      ok(`${tag}: Classic reader off returns to margin view at the same place`, back.chapter === here.chapter && back.para === here.para && back.word === here.word, { here, back })
      ok(`${tag}: the return link's place leaves the address; the Classic reader not chosen`, backUrl.classic === null && !/chapter=/.test(backUrl.url) && /margin=1/.test(backUrl.url), backUrl)
      if (first) await deskShot(page, `back-to-margin-${w}x${h}.png`)
      // Compare: the same place, side by side; the opt-in kept. Then Margin again.
      await frame.click('#aaBtn'); await frame.waitForSelector('[data-layout="compare"]', { timeout: 5000 })
      await Promise.all([page.waitForURL(u => !u.searchParams.has('margin'), { timeout: 20000 }).catch(() => null), frame.click('[data-layout="compare"]')])
      await waitNormal(page)
      const cmp = await normalPlace(page)
      ok(`${tag}: Compare opens the book reader side by side at the same place`, !cmp.frame && cmp.view === 'compare' && cmp.chapter === here.chapter && cmp.para === here.para && cmp.word === here.word, { here, cmp })
      ok(`${tag}: Compare leaves the Classic reader unchosen`, cmp.classic === null, cmp)
      await page.click('[data-testid="lab-super"]'); await page.click('[data-testid="lab-super-row-editions"]')
      await (await page.waitForSelector('[data-testid="lab-v2-classic"]', { timeout: 8000 })).click()
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
    // On the desktop: a phone no longer opens the frame (check-phone-cards.mjs).
    const tag = `${bookId}-latefont`
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 })
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
