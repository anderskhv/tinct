#!/usr/bin/env node
// Margin view's first chapter first (Anders, 22 Oct 2026: "when we do the switch we also need to do the first chapter
// trick"): /reader?book=<id>&margin=1 shows the chapters at the reader's place as soon as they are in, and the whole
// book is drawn into the other chapters when it arrives, without moving the place or the page.
// Headless Chromium against a local server (a dev server, `npx vite --port 4811`, or a built dist), muted, every API
// call mocked, the whole edition held back WHOLE_DELAY_MS so the chapters come first:
//
//   PREVIEW_ORIGIN=http://127.0.0.1:4811 CHROMIUM_PATH=… node scripts/check-margin-first-chapter.mjs
//   BROWSER=webkit WHOLE_DELAY_MS=0 PREVIEW_ORIGIN=…   Safari's engine (no scroll anchoring), against a server that holds
//                                                     the whole edition back itself (WebKit does not route a preload)
//
// Per case (1440×900): the first text shows while the whole book is still held back, at the place (chapter,
// paragraph, word); once it comes, every chapter has its text (none left pending, the companion's text gate open),
// the paragraph at the top of the view never moved by more than a pixel in any frame while the chapters were drawn in,
// and the place is the same. One case reads on (scrolls) before the book is in: the view stays where they scrolled to.
import { chromium, webkit } from 'playwright'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const ORIGIN = process.env.PREVIEW_ORIGIN || 'http://127.0.0.1:4811'
const EXEC = process.env.CHROMIUM_PATH || undefined
// BROWSER=webkit: Safari's engine, which has no scroll anchoring (the view is held by reader.js alone).
const ENGINE = process.env.BROWSER === 'webkit' ? webkit : chromium
const WHOLE_DELAY_MS = Number(process.env.WHOLE_DELAY_MS || 4000)
let failures = 0
const ok = (label, pass, detail) => { if (!pass) failures++; console.log(`${pass ? 'ok  ' : 'FAIL'} ${label}${detail !== undefined ? ' ' + JSON.stringify(detail).slice(0, 600) : ''}`) }

const chaptersOf = bookId => JSON.parse(readFileSync(resolve(`public/data/editions/${bookId}-modern-en.json`), 'utf8')).chapters
// The book reader's place on this device (null: a first open, the book's start); `scroll`: px read on before the book is in.
const CASES = [
  { bookId: 'war-and-peace', place: { chapterNumber: 40, paragraphIndex: 6, wordIndex: 3 } },
  { bookId: 'war-and-peace', place: { chapterNumber: 120, paragraphIndex: 2, wordIndex: 0 }, scroll: 700 },
  { bookId: 'frankenstein', place: null },
  { bookId: 'frankenstein', place: { chapterNumber: 9, paragraphIndex: 4, wordIndex: 5 } },
  // Begin reading in the library: its hand-off, with margin view on for this device.
  { bookId: 'war-and-peace', place: { chapterNumber: 3, paragraphIndex: 5, wordIndex: 0 }, via: 'handoff' },
]
// WebKit does not route a preload, so a plain link's whole book (the reader's head script preloads it) cannot be
// held back there: every case opens through the hand-off, whose head script preloads the chapters only.
const viaOf = c => (ENGINE === webkit ? 'handoff' : c.via || 'link')

function positionRecord(bookId, p) {
  const now = Date.now(), books = {}
  if (p) books[bookId] = { bookId, headerBook: bookId, sequentialChapter: p.chapterNumber, ...p, primaryEditionKey: 'modern-en', readerMode: 'read', updatedAt: now - 60000, deviceId: 'qa', rev: 1 }
  return { books, finished: {}, hidden: {}, lastSettledBookId: bookId, lastSettledAt: now - 60000, updatedAt: now - 60000, deviceId: 'qa' }
}

// In the frame, from its first script: the first frame with a paragraph of text in view, and while `window.__watch`
// names a paragraph, its top in every frame.
const FRAME_PROBE = `(() => {
  if (!/^\\/lab\\/addbook\\/book/.test(location.pathname)) return;
  window.__frames = [];
  const tick = () => {
    if (!window.__firstText) {
      for (const fy of [0.3, 0.5, 0.7]) {
        const el = document.elementFromPoint(innerWidth * 0.4, innerHeight * fy), p = el && el.closest && el.closest('p.tb-p');
        if (p && p.textContent.trim().length > 40) { window.__firstText = { at: Date.now(), pending: document.querySelectorAll('.tb-pending').length }; break }
      }
    }
    const w = window.__watch;
    if (w && w.el.isConnected) window.__frames.push(Math.round((w.el.getBoundingClientRect().top - w.top) * 10) / 10);
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
})()`

const browser = ENGINE === webkit ? await webkit.launch() : await chromium.launch({ executablePath: EXEC, args: ['--mute-audio', '--autoplay-policy=user-gesture-required'] })
try {
  for (const c of CASES) {
    const tag = `${c.bookId} ${c.place ? `ch ${c.place.chapterNumber} ¶${c.place.paragraphIndex} w${c.place.wordIndex}` : 'first open'}${c.scroll ? ', reads on' : ''}${viaOf(c) === 'handoff' ? ', from the library' : ''}`
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, ignoreHTTPSErrors: true })
    await context.route(/\/api\//, route => route.fulfill({ status: 404, contentType: 'application/json', body: '{"error":"mock"}' }))
    let released = 0, release
    const held = new Promise(r => { release = r })
    if (WHOLE_DELAY_MS > 0) await context.route(new RegExp(`/data/editions/${c.bookId}-modern-en\\.json`), async route => { await held; released = released || Date.now(); await route.continue() })
    await context.addInitScript(FRAME_PROBE)
    const page = await context.newPage()
    const errors = []
    page.on('pageerror', e => errors.push(String(e)))
    await page.goto(`${ORIGIN}/lab/addbook/vendor/pdfjs/pdf.min.js`)
    await page.evaluate(rec => { localStorage.clear(); localStorage.setItem('tinct-lab-position', JSON.stringify(rec)); localStorage.setItem('tinct-lab-device-id', 'qa') }, positionRecord(c.bookId, c.place))
    if (viaOf(c) === 'handoff') {
      await page.evaluate(({ bookId, p }) => {
        localStorage.setItem('tinct:margin-preview', '1')
        sessionStorage.setItem('tinct:lab-reader-handoff', JSON.stringify({ kind: 'open-reader', resumeLatest: true, bookId, primaryEditionKey: 'modern-en', compareEditionKey: 'original-en', savedPlace: { bookId, chapterNumber: p?.chapterNumber ?? 1, page: 0, paragraphIndex: p?.paragraphIndex ?? 0, wordIndex: p?.wordIndex ?? 0 } }))
      }, { bookId: c.bookId, p: c.place })
    }
    const t0 = Date.now()
    await page.goto(viaOf(c) === 'handoff' ? `${ORIGIN}/reader` : `${ORIGIN}/reader?book=${c.bookId}&margin=1`)
    setTimeout(() => release(), WHOLE_DELAY_MS)
    const frameOf = () => page.frames().find(f => /\/lab\/addbook\/book/.test(f.url()))
    let frame = null, first = null
    for (let i = 0; i < 200 && !first; i++) {
      await page.waitForTimeout(50)
      frame = frameOf()
      try { first = frame ? await frame.evaluate(() => window.__firstText || null) : null } catch { first = null }
    }
    ok(`${tag}: first text while the whole book is still on its way (${first ? first.at - t0 : '–'} ms, ${first?.pending ?? 0} chapters pending)`, !!first && (!released || first.at < released) && first.pending > 0, first)
    if (!first) { await context.close(); continue }
    // The place: settled where the book reader left it.
    await frame.waitForFunction(() => typeof epubHold !== 'undefined' && epubHold.opened === state.token && !epubHold.settling && (!epubHold.exact || epubHold.exact.top != null), null, { timeout: 15000 }).catch(() => {})
    const chapters = chaptersOf(c.bookId)
    const wantPage = c.place ? chapters.findIndex(ch => Number(ch.number) === c.place.chapterNumber) + 1 : 1
    const spotOf = () => frame.evaluate(() => ({ page: currentPlace().page, ...epubSpot(), pending: document.querySelectorAll('.tb-pending').length, whole: !!state.whole }))
    const opened = await spotOf()
    ok(`${tag}: opens at the place`, opened.page === wantPage && (!c.place || (opened.para === c.place.paragraphIndex && opened.word <= c.place.wordIndex)) && opened.pending > 0 && opened.whole, { opened, wantPage })
    if (c.scroll) {
      await frame.evaluate(px => { document.getElementById('scroll').scrollTop += px }, c.scroll)
      await page.waitForTimeout(400)
    }
    // The paragraph at the top of the view, watched in every frame while the whole book is drawn in.
    const before = await frame.evaluate(() => {
      const p = state.pages[currentPlace().page - 1], top = document.getElementById('scroll').getBoundingClientRect().top + 1
      const el = epubParas(p).find(e => e.getBoundingClientRect().bottom > top)
      window.__watch = { el, top: el.getBoundingClientRect().top }; window.__frames = []
      return { ...epubSpot(), page: currentPlace().page, held: previewSpot(), scrollTop: document.getElementById('scroll').scrollTop }
    })
    release()
    await frame.waitForFunction(() => !document.querySelector('.tb-pending') && !state.whole, null, { timeout: 60000 }).catch(() => {})
    await page.waitForTimeout(600)
    const after = await frame.evaluate(() => ({ ...epubSpot(), page: currentPlace().page, held: previewSpot(), pending: document.querySelectorAll('.tb-pending').length, whole: !!state.whole, frames: window.__frames, texts: [...state.texts.values()].filter(t => t.text.length < 40).length, pages: state.pages.length, chars: [...state.texts.values()].reduce((n, t) => n + t.text.length, 0) }))
    const moved = after.frames.reduce((m, d) => Math.max(m, Math.abs(d)), 0)
    ok(`${tag}: every chapter has its text once the book is in`, after.pending === 0 && !after.whole && after.pages === chapters.length && after.texts === 0, { pending: after.pending, whole: after.whole, pages: after.pages, short: after.texts, chars: after.chars })
    ok(`${tag}: the view never moved while the chapters were drawn in (max ${moved} px over ${after.frames.length} frames)`, after.frames.length > 0 && moved <= 1, after.frames.filter(d => Math.abs(d) > 1).slice(0, 10))
    ok(`${tag}: the place is the same, the word a restore brought the view to included`, after.page === before.page && after.para === before.para && after.word === before.word && JSON.stringify(after.held) === JSON.stringify(before.held), { before, after: { page: after.page, para: after.para, word: after.word, held: after.held } })
    // The chapters before the place are the book's own (the first chapter's opening words), not placeholders.
    const head = await frame.evaluate(() => epubParas(state.pages[0])[0]?.textContent.slice(0, 40) || '')
    ok(`${tag}: the first chapter is drawn`, head.length > 20 && chapters[0].paragraphs[0].replace(/_/g, '').startsWith(head.slice(0, 20)), head)
    ok(`${tag}: no page errors`, errors.length === 0, errors)
    await context.close()
  }
} finally {
  await browser.close()
}
console.log(failures ? `\n${failures} problem(s)` : '\nall ok')
process.exit(failures ? 1 : 0)
