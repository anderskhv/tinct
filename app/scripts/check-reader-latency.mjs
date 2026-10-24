#!/usr/bin/env node
// How fast the reader answers (22 Oct 2026, overnight clean-up, stream D): "consistency and low latency, measured".
// Modelled on check-library-speed.mjs (the throttle, the median of runs, a report that gates only on request) and
// check-margin-first-chapter.mjs (the frame probe: the first frame with a paragraph of text in view). It drives
// headless Chromium against any base URL (production, a preview, or a local `vite preview` of dist/):
//
//   node scripts/check-reader-latency.mjs                         https://tinct.app, Frankenstein and To the Lighthouse
//   LATENCY_BASE=http://127.0.0.1:4173 node scripts/check-reader-latency.mjs
//
// Measured per book (desktop at 1440×900 in margin view, `/reader?book=<id>&margin=1`; phone at 390×844, touch):
//   - first text: navigation start to the first frame with a paragraph of the book's text in view (in the margin
//     reader's frame on the desktop, the phone reader's passage on the phone). Desktop cold (a fresh profile) and warm
//     (the same profile again, its cache filled), each also on the library-speed throttle (60 ms round trip,
//     9 Mbit/s down, CPU 4× slower). Targets: warm desktop ≤ 1.5 s, throttled ≤ 3 s (gated on the cold throttled
//     load, a first visit on a slow line; the warm throttled load is reported).
//   - the selection bar: a real mouse drag over a sentence, mouseup to the first frame the bar is drawn. ≤ 100 ms.
//   - a pill's card: a click on the chapter's ✧ Primer pill, pointerdown to the first frame its card shows (the card
//     itself, with its wait dots: the answer is mocked, so this is the reader's own work). ≤ 150 ms.
//   - phone tap to card: a tap on the phone's ✧ Primer pill, pointerdown to the first frame its bottom card shows. ≤ 150 ms.
//   - Ask, first token: Enter in the bar's Ask field to the first words of the answer in its card. Reported, never
//     gated. Mocked by default (the reader's own path, no AI spend); LATENCY_REAL_ASK=1 sends one real question per
//     book on the desktop (a paid call: keep it to a run or two).
// The startReaderLoadTrace marks of the top page (`perf=1`) are kept in the JSON report.
//
// Every AI route (/api/chat, /api/lab-chat, chapter notes, catch-up) is answered inside the page after
// LATENCY_MOCK_MS (default 400): no request is routed (Playwright turns the HTTP cache off when it routes, and the
// warm load is what the cache is for), and nothing is spent. Production is reached as internal traffic (markInternal).
//
// LATENCY_DIST=dist serves a build here instead (as check-library-speed.mjs does: pages uncached, hashed bundles
// immutable, tagged lab scripts for a day, the rest revalidated, text gzipped; /api/ answered 204), so the numbers
// are the reader's own and not this machine's line to production. Against a remote base, the script first measures
// the round trip to it (a small file, five times) and prints it: through a slow proxy that, not the reader, is the time.
// Options: LATENCY_BOOKS=frankenstein,to-the-lighthouse  LATENCY_RUNS=3  LATENCY_OUT=<file.json>
//   LATENCY_SHOTS=<dir> (a screenshot per step)  LATENCY_SKIP=throttle,phone,ask (parts to leave out)
//   LATENCY_STRICT=1 exits 1 when a target is missed. It reports; it does not gate CI (timings depend on the machine).
// Reading the numbers: headless Chromium paints in software on the main thread, so paint-heavy frames cost more here
// than on a Mac; compare runs on one machine.
import { chromium } from 'playwright'
import { createServer } from 'node:http'
import { createHash } from 'node:crypto'
import { gzipSync } from 'node:zlib'
import { mkdirSync, writeFileSync } from 'node:fs'
import fs from 'node:fs/promises'
import path, { join, resolve } from 'node:path'
import { markInternal } from './lib/internalTraffic.cjs'

const DIST = process.env.LATENCY_DIST ? path.resolve(process.env.LATENCY_DIST) : ''
const PORT = Number(process.env.LATENCY_PORT || 5971)
const BASE = DIST ? `http://127.0.0.1:${PORT}` : (process.env.LATENCY_BASE || 'https://tinct.app').replace(/\/$/, '')
const BOOKS = (process.env.LATENCY_BOOKS || 'frankenstein,to-the-lighthouse').split(',').map(s => s.trim()).filter(Boolean)
const RUNS = Math.max(1, Number(process.env.LATENCY_RUNS || 3))
const OUT = process.env.LATENCY_OUT || ''
const SHOTS = process.env.LATENCY_SHOTS ? resolve(process.env.LATENCY_SHOTS) : ''
const SKIP = new Set((process.env.LATENCY_SKIP || '').split(',').map(s => s.trim()).filter(Boolean))
const MOCK_MS = Number(process.env.LATENCY_MOCK_MS ?? 400)
const REAL_ASK = process.env.LATENCY_REAL_ASK === '1'
const STRICT = process.env.LATENCY_STRICT === '1'
const EXEC = process.env.CHROMIUM_PATH || undefined
const TARGETS = { firstTextWarmMs: 1500, firstTextThrottledMs: 3000, barMs: 100, cardMs: 150, phoneCardMs: 150 }
const THROTTLE = { rtt: 60, downBps: 9e6 / 8, upBps: 1.5e6 / 8, cpu: 4 }
const DESKTOP = { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 }
const PHONE = { viewport: { width: 390, height: 844 }, screen: { width: 390, height: 844 }, deviceScaleFactor: 3, hasTouch: true, isMobile: true, userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1' }
if (SHOTS) mkdirSync(SHOTS, { recursive: true })

const median = values => { const v = values.filter(Number.isFinite).sort((a, b) => a - b); return v.length ? v[Math.floor((v.length - 1) / 2)] : null }
const max = values => { const v = values.filter(Number.isFinite); return v.length ? Math.max(...v) : null }
const sleep = ms => new Promise(r => setTimeout(r, ms))
const misses = []
const stepFetches = []
const report = { base: BASE, at: new Date().toISOString(), runs: RUNS, mockMs: REAL_ASK ? 'real ask' : MOCK_MS, targets: TARGETS, books: {} }

// ---- In every document (the top page and the margin reader's frame), before its scripts ----
// Self-contained (serialised). Keeps the first text's time, answers the AI routes after a wait, and times a step
// from an input (pointerdown, mouseup, Enter) to the first frame where its answer is drawn.
function instrument({ mockMs, realAsk }) {
  const L = window.__lat = { firstText: null, steps: {} }
  const abs = () => performance.timeOrigin + performance.now()
  const visible = el => { if (!el) return false; const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2 || r.bottom < 0 || r.top > innerHeight) return false; const s = getComputedStyle(el); return s.visibility !== 'hidden' && s.display !== 'none' && Number(s.opacity) > 0.05 }
  window.__latVisible = visible
  const frame = () => {
    try {
      if (L.firstText == null) {
        if (/^\/lab\/addbook\//.test(location.pathname)) {
          // The margin reader: a paragraph of the book's text under a point of the column.
          for (const fy of [0.3, 0.5, 0.7]) {
            const el = document.elementFromPoint(innerWidth * 0.4, innerHeight * fy), p = el && el.closest && el.closest('p.tb-p, .epub-pg p, .pdf-sheet .text-layer')
            if (p && p.textContent.trim().length > 40) { L.firstText = abs(); break }
          }
        } else if (location.pathname === '/reader') {
          // The phone (React) reader: its passage, ready and in view.
          const root = document.querySelector('[data-testid="lab-root"]'), passage = document.querySelector('.lab-page-wrap > .lab-passage')
          if (root?.dataset.readerReady === 'true' && visible(passage) && passage.textContent.trim().length > 40) L.firstText = abs()
        }
      }
    } catch { /* keep sampling */ }
    requestAnimationFrame(frame)
  }
  requestAnimationFrame(frame)

  // A step: armed with the input that starts it and a test for its answer; done at the first frame the test passes.
  window.__latArm = (name, input, testSource) => {
    const test = new Function(`return (${testSource})()`)
    const S = L.steps[name] = { start: null, end: null }
    const onInput = event => { if (S.start == null && (input !== 'keydown' || event.key === 'Enter')) S.start = performance.timeOrigin + event.timeStamp }
    addEventListener(input, onInput, { capture: true })
    const check = () => {
      if (S.start != null) { let ok = false; try { ok = !!test() } catch { ok = false } if (ok) { S.end = abs(); removeEventListener(input, onInput, { capture: true }); return } }
      requestAnimationFrame(check)
    }
    requestAnimationFrame(check)
  }

  // The AI routes, answered here (no route in Playwright: it would turn the cache off).
  const fetch0 = window.fetch.bind(window)
  const sse = text => `data: ${JSON.stringify({ type: 'content_block_delta', delta: { type: 'text_delta', text } })}\n\ndata: {"type":"message_stop"}\n\n`
  window.fetch = function (input, init) {
    let url
    try { url = new URL(String(input?.url || input), location.href) } catch { return fetch0(input, init) }
    const path = url.pathname
    const ai = url.origin === location.origin && /^\/api\/(chat|lab-chat|lab-chapter-notes|lab-catch-up|catch-up)/.test(path)
    if (!ai) return fetch0(input, init)
    let body = null
    try { body = JSON.parse(typeof init?.body === 'string' ? init.body : 'null') } catch { body = null }
    const c = body?.companion || {}
    if (realAsk && /^\/api\/(chat|lab-chat)$/.test(path) && c.intent === 'ask') {
      L.realAsk = (L.realAsk || 0) + 1
      return fetch0(input, init)
    }
    const text = c.intent === 'define' ? JSON.stringify({ kind: 'definition', definition: `A mocked meaning of “${c.selection}”.` })
      : c.intent === 'quiz' ? JSON.stringify({ questions: [1, 2, 3].map(i => ({ q: `MOCK question ${i}?`, answer: 'Something', why: 'Because.', cite: '' })) })
      : c.intent === 'chapter' && c.chapter?.action?.kind === 'primer' ? JSON.stringify({ gist: `MOCK gist of ${c.chapter.action.unitTitle}. It says what the chapter sets out to do.`, claims: [1, 2, 3].map(i => ({ text: `MOCK claim ${i} of the chapter.`, cite: `{p. ${c.context?.pages?.[0]?.n ?? 1}}` })), keepInMind: ['MOCK caution: a name that changes later.'], map: [1, 2, 3].map(i => ({ title: `MOCK section ${i}`, pages: `p. ${c.context?.pages?.[0]?.n ?? 1}` })) })
      : 'MOCK answer. The passage sets the scene and names what the narrator wants.'
    const reply = /lab-chapter-notes/.test(path) ? new Response(JSON.stringify({ beats: [{ title: 'Where it begins', text: 'MOCK beat one.' }, { title: 'Then', text: 'MOCK beat two.' }], kind: body?.kind, chapterNumber: body?.chapterNumber, through: null, source: 'model' }), { status: 200, headers: { 'content-type': 'application/json' } })
      : /catch-up/.test(path) ? new Response(JSON.stringify({ summary: 'MOCK catch-up summary.' }), { status: 200, headers: { 'content-type': 'application/json' } })
      : body?.stream ? new Response(sse(text), { status: 200, headers: { 'content-type': 'text/event-stream' } })
      : new Response(JSON.stringify({ content: [{ type: 'text', text }] }), { status: 200, headers: { 'content-type': 'application/json' } })
    return new Promise(r => setTimeout(() => r(reply), mockMs))
  }
}

// ---- Helpers ----
async function newContext(browser, device) {
  const context = await browser.newContext({ ...device, serviceWorkers: 'block' })
  await context.addInitScript(instrument, { mockMs: MOCK_MS, realAsk: REAL_ASK })
  if (process.env.LATENCY_DEBUG === '1') context.on('page', page => {
    page.on('pageerror', e => console.log(`  [pageerror] ${e.message.slice(0, 200)}`))
    page.on('requestfailed', r => console.log(`  [failed] ${r.url().slice(0, 120)} ${r.failure()?.errorText}`))
  })
  return context
}
async function throttle(page) {
  const cdp = await page.context().newCDPSession(page)
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: THROTTLE.cpu })
  await cdp.send('Network.enable')
  await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: THROTTLE.rtt, downloadThroughput: THROTTLE.downBps, uploadThroughput: THROTTLE.upBps })
  return cdp
}
const frameOf = page => page.frames().find(f => /\/lab\/addbook\/book/.test(f.url())) || null
let shooting = true
const shot = async (page, name) => { if (SHOTS && shooting) await page.screenshot({ path: join(SHOTS, `${name}.png`) }).catch(() => {}) }

/** Navigation start of the top page to the first text (ms), in the frame on a desktop, in the page on a phone. */
async function firstText(page, url, { phone = false, timeout = 30000 } = {}) {
  await page.goto(url, { waitUntil: 'commit' })
  const origin = await page.evaluate(() => performance.timeOrigin).catch(() => null)
  const until = Date.now() + timeout
  while (Date.now() < until) {
    await sleep(50)
    const doc = phone ? page.mainFrame() : frameOf(page)
    const at = doc ? await doc.evaluate(() => window.__lat?.firstText ?? null).catch(() => null) : null
    if (at != null && origin != null) {
      const trace = await page.evaluate(() => window.tinctLoadTrace?.() || null).catch(() => null)
      return { ms: Math.round(at - origin), trace }
    }
  }
  return { ms: null, trace: null }
}

/** Time a step in `doc` (the frame or the page): arm, act, wait for its end (ms) or time out. */
async function step(doc, name, input, test, act, timeout = 8000) {
  await doc.evaluate(([n, i, t]) => window.__latArm(n, i, t), [name, input, test.toString()])
  await act()
  const until = Date.now() + timeout
  while (Date.now() < until) {
    const s = await doc.evaluate(n => window.__lat.steps[n], name).catch(() => null)
    if (s?.end != null && s.start != null) {
      // What the step had to fetch before its answer showed (a code chunk loaded on a first tap is latency too).
      const fetched = await doc.evaluate(([a, b]) => performance.getEntriesByType('resource').filter(r => performance.timeOrigin + r.startTime >= a - 5 && performance.timeOrigin + r.startTime <= b).map(r => `${r.name.replace(location.origin, '').slice(0, 80)} ${Math.round(r.duration)}ms`), [s.start, s.end]).catch(() => [])
      if (fetched.length) stepFetches.push({ name, ms: Math.round(s.end - s.start), fetched })
      return Math.round(s.end - s.start)
    }
    await sleep(40)
  }
  return null
}

/** A sentence in view in the frame: the screen points to drag from and to (page coordinates). */
async function sentenceInView(page, frame, nth) {
  const fb = await (await page.$('iframe[data-testid="margin-preview-frame"]')).boundingBox()
  const box = await frame.evaluate(n => {
    const top = (document.getElementById('hdr')?.getBoundingClientRect().bottom || 60) + 40
    // A line in the middle of the view: the words under a point of the column (caretRangeFromPoint), six of them.
    const col = document.querySelector('.epub-pg p, p.tb-p')?.getBoundingClientRect()
    if (col) for (const fy of [0.42, 0.5, 0.58, 0.35, 0.65].map(f => f + n * 0.01)) {
      const c = document.caretRangeFromPoint?.(col.left + 40, innerHeight * fy)
      const node = c?.startContainer
      if (!node || node.nodeType !== 3 || !node.parentElement?.closest('p.tb-p, .epub-pg p')) continue
      const words = [...node.nodeValue.matchAll(/\S+/g)].filter(w => w.index + w[0].length >= c.startOffset)
      if (words.length < 4) continue
      const range = document.createRange(); range.setStart(node, words[0].index); range.setEnd(node, words[Math.min(5, words.length - 1)].index + words[Math.min(5, words.length - 1)][0].length)
      const rects = [...range.getClientRects()].filter(r => r.width > 2); if (!rects.length) continue
      return { x1: rects[0].left + 2, y1: rects[0].top + rects[0].height / 2, x2: rects[0].right - 2, y2: rects[0].top + rects[0].height / 2 }
    }
    const paras = [...document.querySelectorAll('p.tb-p, .epub-pg p')].filter(p => { const r = p.getBoundingClientRect(); return r.top > top && r.top < innerHeight - 200 && p.textContent.split(/\s+/).length > 12 })
    const p = paras[n % Math.max(1, paras.length)]
    if (!p) return null
    const node = [...p.childNodes].find(x => x.nodeType === 3 && x.nodeValue.trim().split(/\s+/).length > 6)
    const range = document.createRange()
    if (node) { const words = [...node.nodeValue.matchAll(/\S+/g)].slice(0, 6); range.setStart(node, words[0].index); range.setEnd(node, words.at(-1).index + words.at(-1)[0].length) } else range.selectNodeContents(p)
    const rects = [...range.getClientRects()].filter(r => r.width > 2)
    if (!rects.length) return null
    const a = rects[0], b = rects.at(-1)
    return { x1: a.left + 2, y1: a.top + a.height / 2, x2: b.right - 2, y2: b.top + b.height / 2 }
  }, nth)
  return box && { x1: fb.x + box.x1, y1: fb.y + box.y1, x2: fb.x + box.x2, y2: fb.y + box.y2 }
}
const clearFrame = frame => frame.evaluate(() => { getSelection().removeAllRanges(); try { closeAllPopups() } catch {} try { if (col.open) openCard(null) } catch {} document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })) }).catch(() => {})

const BAR_TEST = () => [...document.querySelectorAll('.mr-bar')].some(b => window.__latVisible(b) && b.querySelector('[data-m]'))
const CARD_TEST = () => [...document.querySelectorAll('.mr-card.is-open, .mr-sheet, .mr-float, .mr-primer')].some(c => window.__latVisible(c))
const ANSWER_TEST = () => [...document.querySelectorAll('.mr-card .mr-answer, .mr-sheet .mr-answer, .mr-float .mr-answer')].some(a => window.__latVisible(a) && a.textContent.trim().length > 3)
const PHONE_CARD_TEST = () => window.__latVisible(document.querySelector('[data-testid="lab-phone-card"]'))

async function openDesktop(browser, bookId, { throttled = false } = {}) {
  const context = await newContext(browser, DESKTOP)
  const page = await context.newPage()
  if (throttled) await throttle(page)
  const url = `${BASE}/reader?book=${bookId}&margin=1&perf=1`
  const cold = await firstText(page, url)
  await sleep(1500)
  const page2 = await context.newPage()
  if (throttled) await throttle(page2)
  const warm = await firstText(page2, url)
  await page.close()
  return { context, page: page2, cold, warm }
}

async function desktopBook(browser, bookId) {
  const out = { firstText: { cold: [], warm: [], throttledCold: [], throttledWarm: [] }, bar: [], card: [], explainCard: [], askFirstToken: [], traces: [] }
  for (let run = 0; run < RUNS; run++) {
    const { context, page, cold, warm } = await openDesktop(browser, bookId)
    out.firstText.cold.push(cold.ms); out.firstText.warm.push(warm.ms); out.traces.push({ cold: cold.trace, warm: warm.trace })
    shooting = run === 0
    {
      // Interactions, on the warm page once its text has settled (every run: one sample of each card per run).
      const frame = frameOf(page)
      if (frame) {
        await frame.waitForFunction(() => typeof state !== 'undefined' && state.pages?.length > 0, null, { timeout: 30000 }).catch(() => {})
        await page.waitForTimeout(2500)
        await shot(page, `${bookId}-desktop-open`)
        for (let i = 0; i < 4; i++) {
          const at = await sentenceInView(page, frame, i)
          if (!at) { out.barNoTarget = (out.barNoTarget || 0) + 1; continue }
          const ms = await step(frame, `bar${i}`, 'mouseup', BAR_TEST, async () => {
            await page.mouse.move(at.x1, at.y1); await page.mouse.down(); await page.mouse.move((at.x1 + at.x2) / 2, (at.y1 + at.y2) / 2, { steps: 4 }); await page.mouse.move(at.x2, at.y2, { steps: 4 }); await page.mouse.up()
          })
          out.bar.push(ms)
          if (i === 0) await shot(page, `${bookId}-desktop-bar`)
          if (i === 0 && ms != null) {
            // Explain from the bar: click to its card.
            const ex = await frame.$('.mr-bar [data-m="explain"]')
            if (ex) {
              const eb = await ex.boundingBox(), fb = await (await page.$('iframe[data-testid="margin-preview-frame"]')).boundingBox()
              out.explainCard.push(await step(frame, 'explain', 'pointerdown', CARD_TEST, () => page.mouse.click(fb.x + eb.x + eb.width / 2, fb.y + eb.y + eb.height / 2)))
              await page.waitForTimeout(MOCK_MS + 600)
              await shot(page, `${bookId}-desktop-explain`)
            }
          }
          await clearFrame(frame); await page.mouse.click(5, 450); await page.waitForTimeout(400)
        }
        // The chapter's Primer pill: scroll to the current chapter's heading if it is not in view, then click.
        await clearFrame(frame)
        const pill = await frame.evaluate(() => {
          const pills = [...document.querySelectorAll('.mr-pill[data-pill="primer"]')]
          let el = pills.find(p => { const r = p.getBoundingClientRect(); return r.top > 80 && r.bottom < innerHeight - 40 && r.width > 4 })
          if (!el && pills.length) { const s = document.getElementById('scroll'); const near = pills.map(p => ({ p, d: Math.abs(p.getBoundingClientRect().top - 200) })).sort((a, b) => a.d - b.d)[0].p; if (s) s.scrollTop += near.getBoundingClientRect().top - 200; el = near }
          return !!el
        })
        if (pill) {
          await page.waitForTimeout(600)
          const box = await frame.evaluate(() => { const el = [...document.querySelectorAll('.mr-pill[data-pill="primer"]')].find(p => { const r = p.getBoundingClientRect(); return r.top > 60 && r.bottom < innerHeight && r.width > 4 }); const r = el?.getBoundingClientRect(); return r ? { x: r.left + r.width / 2, y: r.top + r.height / 2 } : null })
          const fb = await (await page.$('iframe[data-testid="margin-preview-frame"]')).boundingBox()
          if (box) out.card.push(await step(frame, 'primer', 'pointerdown', CARD_TEST, () => page.mouse.click(fb.x + box.x, fb.y + box.y)))
          await page.waitForTimeout(MOCK_MS + 600)
          await shot(page, `${bookId}-desktop-primer`)
        } else out.card.push(null)
        // Ask: select, Ask, a short question, Enter; Enter to the answer's first words.
        if (!SKIP.has('ask') && (run === 0 || !REAL_ASK)) {
          await clearFrame(frame); await page.mouse.click(5, 450); await page.waitForTimeout(400)
          const at = await sentenceInView(page, frame, 1)
          if (at) {
            await page.mouse.move(at.x1, at.y1); await page.mouse.down(); await page.mouse.move(at.x2, at.y2, { steps: 6 }); await page.mouse.up()
            const ask = await frame.waitForSelector('.mr-bar [data-m="ask"]', { timeout: 4000 }).catch(() => null)
            if (ask) {
              await ask.click()
              const field = await frame.waitForSelector('.mr-bar.is-asking textarea, .mr-bar textarea.mr-ask', { timeout: 4000 }).catch(() => null)
              if (field) {
                await page.keyboard.type('Who is speaking here, in one sentence?')
                out.askFirstToken.push(await step(frame, 'ask', 'keydown', ANSWER_TEST, () => page.keyboard.press('Enter'), REAL_ASK ? 30000 : 8000))
                await page.waitForTimeout(800)
                await shot(page, `${bookId}-desktop-ask`)
              } else out.askFirstToken.push(null)
            } else out.askFirstToken.push(null)
          }
        }
      }
    }
    await context.close()
    if (!SKIP.has('throttle')) {
      const t = await openDesktop(browser, bookId, { throttled: true })
      out.firstText.throttledCold.push(t.cold.ms); out.firstText.throttledWarm.push(t.warm.ms)
      await t.context.close()
    }
  }
  return out
}

async function phoneBook(browser, bookId) {
  const out = { firstText: { cold: [], throttledCold: [] }, tapToCard: [] }
  for (let run = 0; run < RUNS; run++) {
    const context = await newContext(browser, PHONE)
    const page = await context.newPage()
    out.firstText.cold.push((await firstText(page, `${BASE}/reader?book=${bookId}&margin=1&perf=1`, { phone: true })).ms)
    await page.waitForTimeout(1500)
    if (run === 0) await shot(page, `${bookId}-phone-open`)
    // The phone's ✧ Primer on the chapter's heading (a first open is at the book's start, where it is).
    const pill = page.getByTestId('lab-unit-primer')
    if (await pill.count()) {
      await pill.first().scrollIntoViewIfNeeded().catch(() => {})
      await page.waitForTimeout(300)
      out.tapToCard.push(await step(page.mainFrame(), `tap${run}`, 'pointerdown', PHONE_CARD_TEST, () => pill.first().tap()))
      await page.waitForTimeout(MOCK_MS + 500)
      if (run === 0) await shot(page, `${bookId}-phone-primer`)
    } else out.tapToCard.push(null)
    await context.close()
    if (!SKIP.has('throttle')) {
      const tc = await newContext(browser, PHONE)
      const tp = await tc.newPage()
      await throttle(tp)
      out.firstText.throttledCold.push((await firstText(tp, `${BASE}/reader?book=${bookId}&margin=1&perf=1`, { phone: true })).ms)
      await tc.close()
    }
  }
  return out
}

const fmt = v => (v == null ? '–' : `${v} ms`)
function gate(label, value, target) {
  const pass = value != null && value <= target
  if (!pass) misses.push(`${label}: ${fmt(value)} (target ≤ ${target} ms)`)
  return `${pass ? 'ok  ' : 'MISS'} ${label}: ${fmt(value)} (≤ ${target} ms)`
}

// ---- A build served here (LATENCY_DIST), the way the Worker serves it ----
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.jpg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.avif': 'image/avif', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.woff': 'font/woff', '.mp3': 'audio/mpeg', '.txt': 'text/plain', '.wasm': 'application/wasm' }
const fileCache = new Map()
async function readDist(file) {
  if (fileCache.has(file)) return fileCache.get(file)
  const body = await fs.readFile(file)
  const type = TYPES[path.extname(file)] || 'application/octet-stream'
  const entry = { body, type, gz: /^(text|application\/json|image\/svg)/.test(type) && body.length > 1024 ? gzipSync(body) : null, etag: `"${createHash('sha1').update(body).digest('hex').slice(0, 16)}"` }
  fileCache.set(file, entry)
  return entry
}
function cachePolicy(url, type) {
  if (type.includes('text/html')) return 'no-store'
  if (/^\/assets\/[\w.-]+-[\w-]{8}\.\w+$/.test(url.pathname)) return 'public, max-age=31536000, immutable'
  if (/^\/(?:lab|omarchy)\/[\w\-./]+\.(?:js|css)$/.test(url.pathname) && /^[\w.-]+$/.test(url.searchParams.get('v') || '')) return 'public, max-age=86400'
  return 'public, max-age=0, must-revalidate'
}
function serveDist() {
  const server = createServer(async (req, res) => {
    const url = new URL(req.url, 'http://local')
    let pathname = decodeURIComponent(url.pathname)
    if (pathname.startsWith('/api/')) { res.writeHead(pathname === '/api/lab-position' ? 404 : 204, { 'cache-control': 'no-store' }); res.end(); return }
    if (pathname === '/reader' || pathname === '/reader/') pathname = '/app.html'
    if (pathname === '/library' || pathname === '/') pathname = '/lab/library_2/index.html'
    const tries = [pathname, pathname + '.html', pathname.replace(/\/?$/, '/index.html')]
    for (const candidate of tries) {
      const file = path.join(DIST, path.normalize(candidate))
      if (!file.startsWith(DIST + path.sep)) break
      let entry
      try { entry = await readDist(file) } catch { continue }
      const headers = { 'content-type': entry.type, 'cache-control': cachePolicy(url, entry.type), etag: entry.etag }
      if (req.headers['if-none-match'] === entry.etag && !entry.type.includes('text/html')) { res.writeHead(304, headers); res.end(); return }
      if (entry.gz && /\bgzip\b/.test(req.headers['accept-encoding'] || '')) { res.writeHead(200, { ...headers, 'content-encoding': 'gzip', vary: 'accept-encoding' }); res.end(entry.gz); return }
      res.writeHead(200, headers); res.end(entry.body); return
    }
    res.writeHead(404, { 'cache-control': 'no-store' }); res.end()
  })
  return new Promise((ok, fail) => { server.once('error', fail); server.listen(PORT, '127.0.0.1', () => ok(server)) })
}
const server = DIST ? await serveDist() : null

/** The round trip to the base (ms): a small file's time to first byte, the median of five. */
// Measured in the browser, which is what loads the reader (its route can differ from this process's).
async function roundTrip(browser) {
  const context = await browser.newContext()
  try {
    const page = await context.newPage()
    await page.goto(`${BASE}/lab/addbook/js/route.js`)
    const times = await page.evaluate(async () => { const out = []; for (let i = 0; i < 5; i++) { const t = performance.now(); await (await fetch(`/lab/addbook/js/route.js?rtt=${Date.now()}-${i}`, { cache: 'no-store' })).arrayBuffer(); out.push(performance.now() - t) } return out })
    return Math.round(median(times))
  } catch { return null } finally { await context.close() }
}

const browser = await chromium.launch({ executablePath: EXEC, args: ['--mute-audio', '--autoplay-policy=user-gesture-required'] })
await markInternal(browser)
report.roundTripMs = await roundTrip(browser)
try {
  console.log(`Round trip to ${BASE}: ${fmt(report.roundTripMs)}${report.roundTripMs > 150 ? ' (slow line: first-text numbers here are mostly the line; measure a build with LATENCY_DIST for the reader\'s own)' : ''}`)
  console.log(`Reader latency against ${BASE}: ${BOOKS.join(', ')}; median of ${RUNS} run(s); AI ${REAL_ASK ? 'mocked except one real Ask per book' : `mocked (${MOCK_MS} ms)`}`)
  for (const bookId of BOOKS) {
    const d = await desktopBook(browser, bookId)
    const p = SKIP.has('phone') ? null : await phoneBook(browser, bookId)
    const book = report.books[bookId] = { desktop: d, phone: p }
    book.summary = {
      firstTextColdMs: median(d.firstText.cold), firstTextWarmMs: median(d.firstText.warm),
      firstTextThrottledColdMs: median(d.firstText.throttledCold), firstTextThrottledWarmMs: median(d.firstText.throttledWarm),
      barMedianMs: median(d.bar), barMaxMs: max(d.bar), primerCardMs: median(d.card), explainCardMs: median(d.explainCard), askFirstTokenMs: median(d.askFirstToken),
      phoneFirstTextMs: p ? median(p.firstText.cold) : null, phoneFirstTextThrottledMs: p ? median(p.firstText.throttledCold) : null, phoneTapToCardMs: p ? median(p.tapToCard) : null,
    }
    const s = book.summary
    console.log(`\n${bookId}`)
    console.log(`     desktop first text: cold ${fmt(s.firstTextColdMs)}, warm ${fmt(s.firstTextWarmMs)}; throttled cold ${fmt(s.firstTextThrottledColdMs)}, warm ${fmt(s.firstTextThrottledWarmMs)}`)
    console.log(gate(`${bookId} desktop first text, warm`, s.firstTextWarmMs, TARGETS.firstTextWarmMs))
    if (!SKIP.has('throttle')) console.log(gate(`${bookId} desktop first text, throttled (cold)`, s.firstTextThrottledColdMs, TARGETS.firstTextThrottledMs))
    console.log(gate(`${bookId} selection bar after mouseup (median of ${d.bar.length}; max ${fmt(s.barMaxMs)})`, s.barMedianMs, TARGETS.barMs))
    console.log(gate(`${bookId} Primer pill to its card`, s.primerCardMs, TARGETS.cardMs))
    console.log(gate(`${bookId} Explain to its card`, s.explainCardMs, TARGETS.cardMs))
    console.log(`     ${bookId} Ask, Enter to first words: ${fmt(s.askFirstTokenMs)} (${REAL_ASK ? 'real' : 'mocked'}; not gated)`)
    if (p) {
      console.log(`     phone first text: ${fmt(s.phoneFirstTextMs)}; throttled ${fmt(s.phoneFirstTextThrottledMs)} (not gated)`)
      console.log(gate(`${bookId} phone tap to card`, s.phoneTapToCardMs, TARGETS.phoneCardMs))
    }
  }
} finally {
  await browser.close()
  server?.close()
}
report.stepFetches = stepFetches
if (stepFetches.length) console.log(`\nSteps that fetched before their answer showed:\n  ${stepFetches.map(f => `${f.name} (${f.ms} ms): ${f.fetched.join(', ')}`).join('\n  ')}`)
if (OUT) writeFileSync(OUT, JSON.stringify(report, null, 2))
console.log(misses.length ? `\n${misses.length} target(s) missed:\n  ${misses.join('\n  ')}` : '\nevery target met')
process.exit(STRICT && misses.length ? 1 : 0)
