#!/usr/bin/env node
// The phone's answer card never shrinks on its own (Anders, 13 Nov 2026, iPhone recording: Simplify on Proverbs
// 26:1 opened tall, the short answer arrived and the card dropped to fit it, so the whole screen jumped). It opens
// at a height calibrated from earlier answers of that kind and length (phoneCardHeight.ts), may grow, and leaves any
// spare room as blank space at its foot.
//
//   (cd app && VITE_SHARED_READER_DEFAULT=1 npx vite --port 5241) &
//   ORIGIN=http://127.0.0.1:5241 node app/scripts/check-phone-card-no-shrink.mjs
//
// WebKit, iPhone 13 at 390×844, touch, service workers blocked. /api/lab-chat and /api/chat are answered in the
// page (no AI call): a short Simplify answer streamed in two parts after a wait. Samples the card's top edge every
// 50 ms from the tap until 1 s after the answer completes and checks it never moves down; then opens Simplify
// again and checks it opens at the calibrated, smaller height; that a long answer grows the card without it ever
// coming down; that a long answer keeps the card's height (it scrolls inside); and that the reading place is unchanged.
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { webkit, chromium, devices } from 'playwright'

const here = path.dirname(fileURLToPath(import.meta.url))
const ORIGIN = process.env.ORIGIN || 'http://127.0.0.1:5241'
const OUT = path.resolve(process.env.OUT || path.join(here, '..', 'artifacts', 'phone-card-no-shrink'))
await fs.mkdir(OUT, { recursive: true })
const ENGINES = (process.env.ENGINES || 'webkit').split(',')
const BOOK = 'bible'
const CHAPTER = Number(process.env.CHAPTER || 654) // Proverbs 26
const WAIT_MS = 1500
const SHORT = "When you give praise or respect to a foolish person, it's as out of place as snow falling in the middle of summer, or rain ruining the harvest. It just doesn't fit."

const LONG = Array.from({ length: 6 }, (_, i) => `Line of thought ${i + 1}: a whip guides the horse and a bridle the donkey, and in the same way a fool needs firm correction, because words alone will not steer him.`).join(' ')
let answer = SHORT
const sse = text => `data: ${JSON.stringify({ type: 'content_block_delta', delta: { type: 'text_delta', text } })}\n\n`

let failures = 0
const ok = (label, pass, detail) => { if (!pass) failures++; console.log(`${pass ? 'ok  ' : 'FAIL'} ${label}${!pass && detail !== undefined ? ' ' + JSON.stringify(detail).slice(0, 1200) : ''}`) }

const placeOf = page => page.evaluate(() => {
  const root = document.querySelector('[data-testid="lab-root"]')
  const word = document.querySelector('[data-testid="lab-page-wrap"] .lab-passage [data-testid="lab-word"]')
  return { chapter: root?.dataset.chapter, place: root?.dataset.place, first: word ? `${word.dataset.paragraphIndex}:${word.dataset.wordIndex}` : null }
})
async function select(page, from, to) {
  const all = page.locator('[data-testid="lab-page-wrap"] .lab-passage [data-testid="lab-word"]')
  const a = await all.nth(from).boundingBox(), b = await all.nth(to).boundingBox()
  const at = box => ({ clientX: box.x + box.width / 2, clientY: box.y + box.height / 2 })
  await all.nth(from).dispatchEvent('pointerdown', { pointerId: 9, pointerType: 'touch', isPrimary: true, bubbles: true, button: 0, ...at(a) })
  await page.waitForTimeout(320)
  await all.nth(to).dispatchEvent('pointermove', { pointerId: 9, pointerType: 'touch', isPrimary: true, bubbles: true, ...at(b) })
  await page.waitForTimeout(60)
  await all.nth(to).dispatchEvent('pointerup', { pointerId: 9, pointerType: 'touch', isPrimary: true, bubbles: true, ...at(b) })
  await page.getByTestId('lab-phone-bar').waitFor({ timeout: 5000 })
  await page.waitForTimeout(250)
}
async function tapOutside(page) {
  await page.evaluate(() => {
    const el = document.elementFromPoint(195, 140) || document.body
    const at = { clientX: 195, clientY: 140, bubbles: true, cancelable: true, pointerId: 11, pointerType: 'touch', isPrimary: true }
    el.dispatchEvent(new PointerEvent('pointerdown', at)); el.dispatchEvent(new PointerEvent('pointerup', at)); el.dispatchEvent(new MouseEvent('click', at))
  })
  await page.waitForTimeout(500)
}
const startSampling = page => page.evaluate(() => {
  window.__samples = []
  window.__sampler = setInterval(() => {
    const card = document.querySelector('[data-testid="lab-phone-card"]')
    if (!card) return
    const r = card.getBoundingClientRect()
    window.__samples.push({ t: Math.round(performance.now()), top: Math.round(r.top * 10) / 10, height: Math.round(r.height), busy: !!card.querySelector('[aria-busy="true"], [data-pcard-busy]'), text: card.querySelector('[data-testid="lab-phone-card-answer"]')?.textContent.length || 0 })
  }, 50)
})
const stopSampling = page => page.evaluate(() => { clearInterval(window.__sampler); return window.__samples })

/** Opens Simplify on the selection and samples until 1 s after the answer completes. */
async function simplify(page, shot) {
  await startSampling(page)
  await page.getByTestId('lab-pbar-simplify').click()
  await page.getByTestId('lab-phone-card').waitFor()
  await page.waitForTimeout(400)
  const opened = await page.evaluate(() => { const c = document.querySelector('[data-testid="lab-phone-card"]'); return { kind: c.dataset.kind, height: Math.round(c.getBoundingClientRect().height), top: Math.round(c.getBoundingClientRect().top), vh: innerHeight } })
  await shot('waiting')
  await page.waitForFunction(() => {
    const c = document.querySelector('[data-testid="lab-phone-card"]')
    return c && c.querySelector('[data-testid="lab-phone-card-answer"]')?.textContent.length > 20 && !c.querySelector('[aria-busy="true"], [data-pcard-busy]')
  }, null, { timeout: 15000 })
  const doneAt = await page.evaluate(() => performance.now())
  await page.waitForTimeout(1000)
  const samples = await stopSampling(page)
  await shot('answered')
  return { opened, samples: samples.filter(s => s.t <= doneAt + 1000) }
}

async function run(engineName) {
  const engine = engineName === 'chromium' ? chromium : webkit
  const tag = `proverbs26-390x844-${engineName}`
  const browser = await engine.launch({ headless: true })
  const context = await browser.newContext({ ...devices['iPhone 13'], viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, serviceWorkers: 'block', colorScheme: 'dark' })
  // Nothing leaves the machine; the AI is answered here.
  await context.route('**/*', async route => {
    const url = new URL(route.request().url())
    if (/^\/api\/(lab-chat|chat)$/.test(url.pathname)) {
      await new Promise(resolve => setTimeout(resolve, WAIT_MS))
      const half = Math.floor(answer.length / 2)
      return route.fulfill({ status: 200, headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' }, body: sse(answer.slice(0, half)) + sse(answer.slice(half)) + 'data: {"type":"message_stop"}\n\n' })
    }
    if (url.pathname.startsWith('/api/')) return route.fulfill({ status: 404, contentType: 'application/json', body: '{"error":"mock"}' })
    return url.origin === new URL(ORIGIN).origin || /fonts\.(googleapis|gstatic)\.com$/.test(url.hostname) ? route.continue() : route.abort()
  })
  await context.addInitScript(({ bookId, chapter }) => {
    localStorage.setItem('tinct:wipe-v1-done', '1')
    if (!sessionStorage.getItem('qa:booted')) {
      sessionStorage.setItem('qa:booted', '1')
      sessionStorage.setItem('tinct:lab-reader-handoff', JSON.stringify({ kind: 'open-reader', bookId, primaryEditionKey: 'kjv-en', savedPlace: { bookId, chapterNumber: chapter, paragraphIndex: 0, wordIndex: 0, page: 0 } }))
    }
  }, { bookId: BOOK, chapter: CHAPTER })
  const page = await context.newPage()
  const errors = []
  page.on('pageerror', e => errors.push(e.message))
  page.setDefaultTimeout(20000)
  await page.goto(`${ORIGIN}/reader?book=${BOOK}`, { waitUntil: 'domcontentloaded' })
  await page.waitForFunction(() => document.querySelector('[data-testid="lab-root"]')?.dataset.readerReady === 'true', null, { timeout: 90000 })
  await page.evaluate(() => document.fonts.ready)
  await page.waitForTimeout(1200)
  const firstWords = await page.evaluate(() => [...document.querySelectorAll('[data-testid="lab-page-wrap"] .lab-passage [data-testid="lab-word"]')].slice(0, 6).map(w => w.textContent).join(' '))
  ok(`${tag}: Proverbs 26 is open ("${firstWords}")`, /snow in summer/i.test(firstWords), firstWords)
  const home = await placeOf(page)
  const shot = name => async step => { const file = path.join(OUT, `${tag}-${name}-${step}.png`); await page.screenshot({ path: file }); console.log(`     ${file}`) }

  // Verse 1 ("As snow in summer … seemly for a fool."), then Simplify.
  await select(page, 0, 17)
  const first = await simplify(page, shot('1'))
  const tops = first.samples.filter(s => s.t >= first.samples[0].t + 300).map(s => s.top)
  const drops = tops.filter((top, i) => i > 0 && top > tops[i - 1] + 0.5)
  ok(`${tag}: first Simplify opens at ${first.opened.height}px and its top never moves down until 1 s after the answer (${[...new Set(tops)].join(' → ')})`, tops.length > 10 && drops.length === 0, { opened: first.opened, tops })
  const calibrated = await page.evaluate(() => { try { return JSON.parse(localStorage.getItem('tinct:pcard-heights') || 'null') } catch { return null } })
  ok(`${tag}: the answer's height is remembered on this device`, !!calibrated?.['simplify:any'], calibrated)
  await tapOutside(page)
  ok(`${tag}: opening and closing the card keeps the reading place`, JSON.stringify(await placeOf(page)) === JSON.stringify(home), { home, now: await placeOf(page) })

  // The second Simplify (verse 2, a fresh answer) opens at the calibrated height: smaller than the first, still never
  // moving down.
  await select(page, 18, 34)
  const second = await simplify(page, shot('2'))
  const tops2 = second.samples.filter(s => s.t >= second.samples[0].t + 300).map(s => s.top)
  const drops2 = tops2.filter((top, i) => i > 0 && top > tops2[i - 1] + 0.5)
  const final2 = second.samples[second.samples.length - 1]
  // The device's measured share plus PHONE_CARD_CALIBRATION_PAD (phoneCardHeight.ts).
  const wanted = Math.round(844 * ((calibrated?.['simplify:any']?.share ?? 0) + 0.035))
  ok(`${tag}: second Simplify opens at the calibrated ${second.opened.height}px (measured ${Math.round(844 * (calibrated?.['simplify:any']?.share ?? 0))}px + a line; first ${first.opened.height}px) and never moves down`, second.opened.height < first.opened.height && Math.abs(second.opened.height - wanted) <= 2 && drops2.length === 0, { opened: second.opened, wanted, tops2 })
  ok(`${tag}: the calibrated card leaves little blank space (${final2?.height}px tall when answered)`, final2 && final2.height <= second.opened.height + 1, final2)
  await tapOutside(page)

  // A long answer in a card opened at the small calibrated height: the card keeps its height (14 Nov 2026).
  answer = LONG
  await select(page, 35, 60)
  const third = await simplify(page, shot('3-long'))
  const tops3 = third.samples.filter(s => s.t >= third.samples[0].t + 300).map(s => s.top)
  const drops3 = tops3.filter((top, i) => i > 0 && top > tops3[i - 1] + 0.5)
  const final3 = third.samples[third.samples.length - 1]
  // Anders, 14 Nov 2026: the card keeps the height it opened at; a longer answer scrolls inside it (was: grows).
  ok(`${tag}: a long answer keeps the card at ${third.opened.height}px (now ${final3?.height}px) and scrolls inside it`, final3 && Math.abs(final3.height - third.opened.height) <= 1 && drops3.length === 0 && new Set(tops3).size === 1, { opened: third.opened, tops3, final3 })
  answer = SHORT
  await tapOutside(page)
  ok(`${tag}: after all three cards the reading place is unchanged`, JSON.stringify(await placeOf(page)) === JSON.stringify(home), { home, now: await placeOf(page) })
  ok(`${tag}: no page errors`, errors.length === 0, errors)
  await context.close(); await browser.close()
}

for (const engine of ENGINES) await run(engine)
console.log(failures ? `\n${failures} check(s) failed` : '\nall checks passed')
process.exit(failures ? 1 : 0)
