#!/usr/bin/env node
// The Bible in the desktop margin view (Anders, 22 Oct 2026; src/lab/marginPreview/marginPreviewBible.ts,
// public/lab/addbook/js/tinct-book.js lazyChapters). Against a local dev server, signed out, every AI call mocked:
//
//   PREVIEW_ORIGIN=http://127.0.0.1:4811 BROWSER=chromium|webkit node scripts/check-margin-bible.mjs
//
// At 1440×900 (VIEWPORT=WxH): /reader?book=bible&margin=1 opens at this device's Psalms 23 pin in the margin reader,
// loading the manifest and the chapters round the place only (never the whole Bible, never all 1,189 chapters);
// the heading pills (Primer, Catch me up, Recap, Quiz me) on each chapter, no Catch me up on a book's first chapter;
// a chapter loaded above the view never moves the text the reader is on; scrolling over a chapter boundary loads the
// next chapters as they come near; Catch me up stays inside the biblical book; a move is written as the biblical
// book's pin (never one under `bible`, another book's pin untouched) and a reload opens there again; a link opens
// Genesis 1; the contents reach Revelation 22. Screenshots go to OUT (default artifacts/margin-bible).
import { chromium, webkit } from 'playwright'
import { mkdirSync } from 'node:fs'
import { join, resolve } from 'node:path'

const ORIGIN = process.env.PREVIEW_ORIGIN || 'http://127.0.0.1:4811'
const BROWSER = process.env.BROWSER === 'webkit' ? 'webkit' : 'chromium'
const OUT = resolve(process.env.OUT || 'artifacts/margin-bible')
mkdirSync(OUT, { recursive: true })
const [W, H] = (process.env.VIEWPORT || '1440x900').split('x').map(Number)
const MOCK = 'MOCK ANSWER: the chapter so far.'
// Psalms 1 = 479 … Psalms 150 = 628 in every 66-book edition (Genesis 1 = 1 … Revelation 22 = 1189).
const PSALMS = { from: 479, to: 628 }

let failures = 0
const ok = (label, pass, detail) => { if (!pass) failures++; console.log(`${pass ? 'ok  ' : 'FAIL'} ${BROWSER} ${label}${!pass && detail !== undefined ? ' ' + JSON.stringify(detail).slice(0, 700) : ''}`) }
const shot = async (page, name) => page.screenshot({ path: join(OUT, `${BROWSER}-${name}.png`) })

const now = Date.now()
const pin = (over) => ({ bookId: 'psalms', headerBook: 'Psalms', chapterNumber: 23, sequentialChapter: 501, paragraphIndex: 4, wordIndex: 2, primaryEditionKey: 'bsb-en', readerMode: 'read', updatedAt: now - 60000, deviceId: 'qa', rev: 1, ...over })
const genesis = pin({ bookId: 'genesis', headerBook: 'Genesis', chapterNumber: 3, sequentialChapter: 3, paragraphIndex: 5, wordIndex: 1, updatedAt: now - 120000 })
const record = { books: { psalms: pin({}), genesis }, finished: {}, hidden: {}, lastSettledBookId: 'psalms', lastSettledAt: now - 60000, updatedAt: now - 60000, deviceId: 'qa' }

const browser = await (BROWSER === 'webkit' ? webkit : chromium).launch(BROWSER === 'chromium' ? { args: ['--mute-audio'] } : {})
try {
  const context = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1 })
  const ai = [], shards = [], whole = [], errors = []
  await context.route(/\/api\//, route => route.fulfill({ status: 404, contentType: 'application/json', body: '{"error":"mock"}' }))
  await context.route(/\/api\/(chat|lab-chat)(\?|$)/, async route => {
    let body = null; try { body = JSON.parse(route.request().postData() || 'null') } catch {}
    const c = body?.companion || {}
    ai.push({ intent: c.intent, pill: c.chapter?.action?.kind, pages: (c.context?.pages || []).map(p => p.n), toc: c.document?.part?.toc?.length ?? null })
    const text = c.intent === 'quiz' ? JSON.stringify({ questions: [1, 2, 3].map(i => ({ q: `MOCK Q${i}?`, answer: 'A', why: 'B', cite: '' })) }) : MOCK
    if (!body?.stream) return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ content: [{ type: 'text', text }] }) })
    return route.fulfill({ status: 200, headers: { 'Content-Type': 'text/event-stream' }, body: `event: content_block_delta\ndata: ${JSON.stringify({ type: 'content_block_delta', delta: { type: 'text_delta', text } })}\n\nevent: message_stop\ndata: {"type":"message_stop"}\n\n` })
  })
  const page = await context.newPage()
  page.on('pageerror', e => errors.push(String(e)))
  page.on('request', r => {
    const u = r.url()
    if (/\/editions-chapters\/bible-[^/]+\/ch\d+\.json/.test(u)) shards.push(Number(u.match(/ch(\d+)\.json/)[1]))
    if (/\/data\/editions\/bible-[^/]+\.json/.test(u)) whole.push(u)
  })
  await page.goto(`${ORIGIN}/lab/addbook/vendor/pdfjs/pdf.min.js`)
  await page.evaluate(rec => { localStorage.clear(); localStorage.setItem('tinct-lab-position', JSON.stringify(rec)); localStorage.setItem('tinct-lab-device-id', 'qa') }, record)

  const frameOf = async () => {
    const handle = await page.waitForSelector('iframe[data-testid="margin-preview-frame"]', { timeout: 60000 })
    const frame = await handle.contentFrame()
    await frame.waitForFunction(() => typeof state !== 'undefined' && state.preview && state.pages.length > 0 && document.querySelector('.epub-sheet'), null, { timeout: 60000 })
    await page.waitForTimeout(2200)
    return frame
  }
  const spotOf = frame => frame.evaluate(() => { const s = epubSpot(); return { page: currentPlace().page, para: s.para, word: s.word, quote: (s.quote || '').slice(0, 50), key: state.key, mode: marginMode(), label: document.getElementById('pageLabel').textContent } })
  const filled = (frame, n) => frame.evaluate(n => !state.pages[n - 1].pg.querySelector('.tb-wait') && epubParas(state.pages[n - 1]).length > 0, n)
  const pills = (frame, n) => frame.evaluate(n => { const head = state.pages[n - 1].pg.querySelector('.tb-head'); head.focus(); marginLayout(); return new Promise(r => requestAnimationFrame(() => requestAnimationFrame(() => r([...head.querySelectorAll('.mr-hp [data-pill]')].map(b => b.dataset.pill))))) }, n)

  // 1. Opens at this device's Psalms 23 pin, the manifest and the chapters round it only.
  await page.goto(`${ORIGIN}/reader?book=bible&margin=1`)
  let frame = await frameOf()
  let at = await spotOf(frame)
  ok(`opens the Bible in the margin reader (${at.mode}), key ${at.key}`, at.key === 'preview:bible' && at.mode === 'column', at)
  ok(`at the Bible reader's place: Psalms 23, paragraph 4 ("${at.quote}")`, at.page === 501 && at.para === 4 && at.label === 'Psalms 23', at)
  const opening = [...new Set(shards)].sort((a, b) => a - b)
  ok(`loads only the chapters round the place (${opening.join(', ')}), never the whole Bible`, opening.length >= 3 && opening.length <= 8 && opening.every(n => n >= 498 && n <= 506) && whole.length === 0, { opening, whole })
  ok('every chapter is in the contents, those not loaded as spaces', await frame.evaluate(() => state.pages.length === 1189 && toc.entries.filter(e => e.kind === 'chapter').length === 1189 && toc.entries.filter(e => e.kind === 'part').length === 66 && document.querySelectorAll('.tb-wait').length > 1170))
  await shot(page, 'psalms-23')

  // 2. The heading pills: Primer, Catch me up, Recap, Quiz me (and Note) on a chapter; no Catch me up on a book's first.
  const p23 = await pills(frame, 501)
  ok(`Psalms 23's heading pills: ${p23.join(', ')}`, ['primer', 'catchup', 'recap', 'quiz'].every(p => p23.includes(p)), p23)
  await frame.evaluate(() => { const s = document.getElementById('scroll'); s.scrollTop += state.pages[500].pg.querySelector('.tb-head').getBoundingClientRect().top - s.getBoundingClientRect().top - 120 })
  await page.waitForTimeout(500)
  await frame.hover('.epub-sheet[data-page="501"] .tb-head')
  await page.waitForTimeout(400)
  await shot(page, 'psalms-23-pills')

  // 3. The contents to Psalms 100: it opens at its heading once loaded. Then, read upwards a screen at a time, the
  // chapters above load and are drawn while the text the reader is on never moves.
  await frame.evaluate(() => goToEntry(toc.entries.find(e => e.kind === 'chapter' && e.page === 578)))
  await frame.waitForFunction(() => !state.pages[577].pg.querySelector('.tb-wait'), null, { timeout: 15000 }).catch(() => null)
  await page.waitForTimeout(1200)
  at = await spotOf(frame)
  ok(`the contents open Psalms 100 at its start once loaded (${at.label}, paragraph ${at.para})`, at.page === 578 && at.para === 0, at)
  const steps = []
  for (let i = 0; i < 6; i++) {
    const spaces = await frame.evaluate(() => document.querySelectorAll('.tb-wait').length)
    await frame.evaluate(() => { document.getElementById('scroll').scrollTop -= Math.round(innerHeight * 0.6) })
    // The paragraph at the top of the view, and how far its top is below the view's top (px).
    const top = () => frame.evaluate(() => { const s = epubSpot(), n = currentPlace().page, el = epubParas(state.pages[n - 1])[s.para ?? 0]; return { page: n, para: s.para ?? 0, y: el.getBoundingClientRect().top - document.getElementById('scroll').getBoundingClientRect().top } })
    const a = await top()
    await page.waitForTimeout(1300)
    const y = await frame.evaluate(a => epubParas(state.pages[a.page - 1])[a.para].getBoundingClientRect().top - document.getElementById('scroll').getBoundingClientRect().top, a)
    steps.push({ at: [a.page, a.para], moved: Math.round((y - a.y) * 10) / 10, drew: spaces - await frame.evaluate(() => document.querySelectorAll('.tb-wait').length) })
  }
  // (Within a pixel: WebKit keeps whole-pixel scroll positions.)
  ok(`reading upwards, chapters above were drawn (${steps.reduce((n, s) => n + s.drew, 0)}) and the text in view never moved`, steps.some(s => s.drew > 0) && steps.every(s => Math.abs(s.moved) <= 1), steps)

  // 4. Over a chapter boundary: Psalms 23's end and Psalms 24's heading in view; on down, the next chapters load as they come.
  await frame.evaluate(() => { const s = document.getElementById('scroll'); s.scrollTop += state.pages[501].sheet.getBoundingClientRect().top - s.getBoundingClientRect().top - s.clientHeight / 2 })
  await page.waitForTimeout(800)
  ok('the boundary: Psalms 23 then Psalms 24, both drawn', await filled(frame, 501) && await filled(frame, 502))
  await shot(page, 'boundary-psalms-23-24')
  const asked = shards.length
  await page.mouse.move(W / 3, H / 2)
  for (let i = 0; i < 14; i++) { await page.mouse.wheel(0, 500); await page.waitForTimeout(250) }
  await page.waitForTimeout(1500)
  at = await spotOf(frame)
  const later = [...new Set(shards.slice(asked))].sort((a, b) => a - b)
  ok(`scrolled on to ${at.label}: its chapters loaded as they came (${later.join(', ')})`, at.page > 503 && later.length > 0 && later.every(n => n > 502 && n <= at.page + 6) && await filled(frame, at.page), { at, later })
  ok(`never more than the chapters near the reader (${new Set(shards).size} of 1,189)`, new Set(shards).size < 30, [...new Set(shards)])

  // 5. Catch me up stays inside the biblical book: Psalms before the chapter, never Job or Genesis.
  await frame.evaluate(() => { const s = document.getElementById('scroll'); s.scrollTop += state.pages[501].pg.querySelector('.tb-head').getBoundingClientRect().top - s.getBoundingClientRect().top - 120 })
  await page.waitForTimeout(800)
  const n0 = ai.length
  await frame.evaluate(() => pillAction('catchup', 'chapter-502'))
  await frame.waitForFunction(text => document.body.innerText.includes(text), MOCK.slice(0, 20), { timeout: 30000 }).catch(() => null)
  const span = await frame.evaluate(() => catchRange(unitByKey('chapter-502')))
  ok(`Catch me up on Psalms 24 covers Psalms 1–23 (pages ${span.from}–${span.to})`, span.from === PSALMS.from && span.to === 501, span)
  // The request itself (headless WebKit's mocked companion never answers here, for any book: Chromium checks it).
  if (BROWSER === 'chromium') {
    const catchup = ai.slice(n0).find(r => r.pages.length)
    const pages = (catchup?.pages || []).map(Number)
    ok(`Catch me up's request sends Psalms 1–23 only (${pages[0]}–${pages[pages.length - 1]}, ${pages.length} chapters), the contents Psalms' only (${catchup?.toc})`, pages.length === 23 && pages[0] === PSALMS.from && pages[pages.length - 1] === 501 && (catchup?.toc == null || catchup.toc <= 151), catchup)
  }
  await shot(page, 'catch-me-up-psalms-24')
  await frame.evaluate(() => { if (col.open) openCard(null) })

  // 6. A move is the biblical book's pin; a reload opens there.
  await frame.evaluate(() => { const s = document.getElementById('scroll'); const el = epubParas(state.pages[501])[5]; s.scrollTop += el.getBoundingClientRect().top - s.getBoundingClientRect().top })
  await page.mouse.wheel(0, 2); await page.waitForTimeout(200); await page.mouse.wheel(0, -2)
  await page.waitForTimeout(2500)
  const moved = await spotOf(frame)
  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('tinct-lab-position')))
  ok(`the place is written as Psalms 24's pin (paragraph ${moved.para})`, stored.books.psalms?.chapterNumber === 24 && stored.books.psalms?.sequentialChapter === 502 && stored.books.psalms?.paragraphIndex === moved.para && stored.books.psalms?.primaryEditionKey === 'bsb-en', { moved, psalms: stored.books.psalms })
  ok('nothing under `bible`, and the Genesis pin is untouched', !stored.books.bible && !stored.books['the-bible'] && JSON.stringify(stored.books.genesis) === JSON.stringify(genesis), Object.keys(stored.books))
  await page.reload()
  frame = await frameOf()
  const back = await spotOf(frame)
  ok(`a reload opens at the same place (${back.label}, paragraph ${back.para})`, back.page === moved.page && back.para === moved.para && back.word === moved.word, { moved, back })
  await shot(page, 'reload')

  // 7. A link: Genesis 1, no Catch me up on a book's first chapter.
  await page.goto(`${ORIGIN}/reader?book=bible&margin=1&chapter=1`)
  frame = await frameOf()
  at = await spotOf(frame)
  ok(`a link opens Genesis 1 at its start ("${at.quote}")`, at.page === 1 && at.para === 0 && at.label === 'Genesis 1', at)
  const g1 = await pills(frame, 1)
  ok(`Genesis 1's heading pills, no Catch me up: ${g1.join(', ')}`, g1.includes('primer') && g1.includes('recap') && !g1.includes('catchup'), g1)
  await frame.hover('.epub-sheet[data-page="1"] .tb-head')
  await page.waitForTimeout(400)
  await shot(page, 'genesis-1')

  // 8. The contents reach the Bible's end: Revelation 22 loads and is drawn.
  await frame.evaluate(() => goToEntry(toc.entries.find(e => e.kind === 'chapter' && e.page === 1189)))
  await frame.waitForFunction(() => !state.pages[1188].pg.querySelector('.tb-wait'), null, { timeout: 15000 }).catch(() => null)
  await page.waitForTimeout(1200)
  at = await spotOf(frame)
  ok(`the contents go to Revelation 22, drawn (${at.label})`, at.page === 1189 && await filled(frame, 1189), at)
  await shot(page, 'revelation-22')

  ok('no page errors', errors.length === 0, errors)
  await context.close()
} finally {
  await browser.close()
}
console.log(failures ? `${failures} failed` : 'all passed')
process.exit(failures ? 1 : 0)
