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
      const errors = []
      page.on('pageerror', e => errors.push(String(e)))
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

      // 3d. Type: a part's name is not set in capitals; a chapter's Before you start names it as its contents do.
      const type = await frame.evaluate(() => ({ part: [...document.querySelectorAll('.tb-part')].map(e => getComputedStyle(e).textTransform)[0] ?? null, phrases: (primer.units || []).slice(0, 30).map(u => TinctMargin.unitPhrase(u)) }))
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
      const dark = await frame.evaluate(() => { const s = [...document.querySelectorAll('.epub-sheet')].find(e => { const r = e.getBoundingClientRect(); return r.bottom > 0 && r.top < innerHeight }); const lum = c => { const m = c.match(/\d+(\.\d+)?/g).map(Number); return (0.2126 * m[0] + 0.7152 * m[1] + 0.0722 * m[2]) / 255 }; return { bg: lum(getComputedStyle(s).backgroundColor), ink: lum(getComputedStyle(s.querySelector('.tb-p')).color) } })
      ok(`${tag}: Dark turns the chapters dark (light text on a dark sheet)`, dark.bg < 0.2 && dark.ink > 0.6, dark)
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
