#!/usr/bin/env node
// The phone's AI card opens at its expected height and the answer fills it downward (Anders, 9 Nov 2026: "open the
// card at the expected height and scroll down from there"; src/lab/marginPhone/phoneCardHeight.ts).
//
//   (cd app && npm run build) && node app/scripts/check-phone-card-expected-height.mjs
//
// Serves app/dist (/reader → app.html) with /api/lab-chat and /api/chat answering as a SLOW stream (deltas over
// about 2 s), opens Explain and Ask on Frankenstein at 390×844 in Chromium and WebKit (iPhone agent, touch), samples
// the card's top edge every 100 ms while the answer streams and checks it never moves up after the first frame,
// that the text starts at the top of the card and grows downward, that the follow-up field stays at the foot, that
// a finished answer shorter than the card keeps the card's height (blank space, never a shrink: Anders, 13 Nov 2026),
// and that the reading place is unchanged. Screenshots (mid-stream, done) go to OUT. DEV_ORIGIN=http://127.0.0.1:5241
// serves the page from a running `npx vite` instead of app/dist (the AI is still answered here).
import { createServer } from 'node:http'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium, webkit, devices } from 'playwright'
import { markInternal } from './lib/internalTraffic.cjs'

const here = path.dirname(fileURLToPath(import.meta.url))
const dist = path.resolve(process.env.TINCT_DIST || path.join(here, '..', 'dist'))
const OUT = path.resolve(process.env.OUT || path.join(here, '..', 'artifacts', 'phone-card-expected-height'))
await fs.mkdir(OUT, { recursive: true })
const BOOK = process.env.BOOK || 'frankenstein'
const ENGINES = (process.env.ENGINES || 'chromium,webkit').split(',')
const STREAM_MS = Number(process.env.STREAM_MS || 2200)

// About as long as the real prompts ask for (companionRequest.ts: Explain about 100 words; Ask is open).
const EXPLAIN = 'Victor is telling us that his childhood was sheltered and loving, and that this is what made his later fall so steep.\n\n' +
  'He describes his parents as devoted to him, a "plaything and idol", so the reader sees a boy who never learned limits or the cost of his own wishes. ' +
  'The tender language is deliberate: Shelley lets him linger on warmth so that the coldness of what he later does to his creature stands out.\n\n' +
  'Notice too that he frames his life as a story with a moral. He wants Walton, and us, to treat his childhood as evidence for a warning.'
const ASK = 'Because his parents treat him as a gift rather than a responsibility, Victor grows up believing the world will bend to his curiosity.\n\n' +
  'The passage stresses duty and tenderness in his upbringing, yet nobody in it ever tells him no. Shelley sets up a pointed contrast: ' +
  'the same child who was given everything will later give nothing to the being he makes. When the creature asks for care, Victor has no model ' +
  'for care that costs him something.\n\nThere is also a quieter irony. Victor praises his parents for shaping him, but he takes none of their ' +
  'patience into his own work. He studies alone, in secret, and abandons what he makes the moment it disappoints him. The idyll is not only nostalgia; it is the measure by which we judge him.'
const SHORT = 'A short answer: one sentence.'

const words = text => text.match(/\S+\s*/g) || []
const sseEvent = text => `data: ${JSON.stringify({ type: 'content_block_delta', delta: { type: 'text_delta', text } })}\n\n`
async function slowStream(res, text) {
  res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' })
  const parts = words(text), steps = 10, per = Math.ceil(parts.length / steps)
  for (let i = 0; i < parts.length; i += per) {
    res.write(sseEvent(parts.slice(i, i + per).join('')))
    await new Promise(resolve => setTimeout(resolve, STREAM_MS / steps))
  }
  res.end('data: {"type":"message_stop"}\n\n')
}

let nextAnswer = null
const server = createServer(async (req, res) => {
  const url = new URL(req.url || '/', 'http://127.0.0.1')
  if (/^\/api\/(lab-chat|chat)$/.test(url.pathname) && req.method === 'POST') {
    let raw = ''
    for await (const chunk of req) raw += chunk
    let body = null; try { body = JSON.parse(raw) } catch { /* not JSON */ }
    const intent = body?.companion?.intent
    return slowStream(res, nextAnswer ?? (intent === 'explain' || !intent ? EXPLAIN : ASK))
  }
  if (url.pathname.startsWith('/api/')) { res.writeHead(404, { 'Content-Type': 'application/json' }); res.end('{"error":"mock"}'); return }
  if (process.env.DEV_ORIGIN) {
    const upstream = await fetch(new URL(url.pathname + url.search, process.env.DEV_ORIGIN))
    res.writeHead(upstream.status, { 'Content-Type': upstream.headers.get('content-type') || 'application/octet-stream' })
    res.end(Buffer.from(await upstream.arrayBuffer())); return
  }
  const file = path.resolve(dist, '.' + (url.pathname === '/reader' ? '/app.html' : url.pathname))
  if (!file.startsWith(dist + path.sep)) { res.writeHead(403); res.end(); return }
  try {
    const body = await fs.readFile(file)
    const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.woff2': 'font/woff2', '.svg': 'image/svg+xml', '.wasm': 'application/wasm' }[path.extname(file)] || 'application/octet-stream'
    res.writeHead(200, { 'Content-Type': mime }); res.end(body)
  } catch { res.writeHead(404); res.end() }
})
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
const ORIGIN = `http://127.0.0.1:${server.address().port}`

let failures = 0
const ok = (label, pass, detail) => { if (!pass) failures++; console.log(`${pass ? 'ok  ' : 'FAIL'} ${label}${!pass && detail !== undefined ? ' ' + JSON.stringify(detail).slice(0, 900) : ''}`) }

const placeOf = page => page.evaluate(() => {
  const root = document.querySelector('[data-testid="lab-root"]')
  const word = document.querySelector('[data-testid="lab-page-wrap"] .lab-passage [data-testid="lab-word"]')
  return { chapter: root?.dataset.chapter, place: root?.dataset.place, first: word ? `${word.dataset.paragraphIndex}:${word.dataset.wordIndex}` : null }
})
async function select(page, from = 14, to = 24) {
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
  await page.waitForTimeout(400)
}

/** Every 100 ms in the page: the card's top, its height, the answer's first line and the field's top. */
const startSampling = page => page.evaluate(() => {
  window.__samples = []
  window.__sampler = setInterval(() => {
    const card = document.querySelector('[data-testid="lab-phone-card"]')
    if (!card) return
    const r = card.getBoundingClientRect()
    // A passage card's answer, or Chat's latest answer (Ask on the phone opens Chat with the passage).
    const answers = card.querySelectorAll('[data-testid="lab-phone-card-answer"], [data-testid="lab-ask-turn-assistant"]')
    const answer = answers[answers.length - 1]
    const field = card.querySelector('.lab-pcard-follow, [data-testid="lab-ask-composer"]')?.getBoundingClientRect()
    const body = card.querySelector('[data-testid="lab-ask-thread"]') || card.querySelector('[data-testid="lab-phone-card-body"]')
    window.__samples.push({
      t: Math.round(performance.now()), top: Math.round(r.top * 10) / 10, height: Math.round(r.height), held: card.hasAttribute('data-held'),
      busy: !!card.querySelector('[aria-busy="true"], [data-pcard-busy], .tc-a.is-streaming'), text: answer ? answer.textContent.length : 0,
      answerTop: answer ? Math.round(answer.getBoundingClientRect().top) : null, fieldTop: field ? Math.round(field.top) : null,
      scroll: body ? [body.scrollTop, body.scrollHeight, body.clientHeight] : null,
    })
  }, 100)
})
const stopSampling = page => page.evaluate(() => { clearInterval(window.__sampler); return window.__samples })

/** From the first frame with text to the end of the stream: the top never moves up, the text's top stays put. */
function judge(samples) {
  // The card's slide-up (lab-pcard-up, .22s) is its arrival, not the answer: frames from 300 ms after it appears.
  const shown = samples[0]?.t ?? 0
  const streaming = samples.filter(s => s.text > 0 && s.busy && s.t >= shown + 300)
  const first = streaming[0] || {}
  const climbs = streaming.filter(s => s.top < first.top - 0.5)
  const textMoves = streaming.filter(s => s.answerTop !== null && Math.abs(s.answerTop - first.answerTop) > 1 && s.scroll?.[0] === first.scroll?.[0])
  const grew = streaming.length > 2 && streaming[streaming.length - 1].text > first.text
  return { frames: streaming.length, firstTop: first?.top, climbs: climbs.length, textMoves: textMoves.length, grew, heights: [...new Set(streaming.map(s => s.height))] }
}

async function run(engineName) {
  const engine = engineName === 'webkit' ? webkit : chromium
  const tag = `${BOOK}-390x844-${engineName}`
  const browser = await markInternal(await engine.launch({ headless: true, args: engineName === 'chromium' ? ['--mute-audio'] : [] }))
  const context = await browser.newContext({ ...devices['iPhone 13'], viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, serviceWorkers: 'block' })
  await context.route('**/*', route => new URL(route.request().url()).origin === ORIGIN ? route.continue() : route.abort())
  await context.addInitScript(({ bookId }) => {
    localStorage.setItem('tinct:wipe-v1-done', '1')
    if (!localStorage.getItem('tinct-lab-prefs')) localStorage.setItem('tinct-lab-prefs', JSON.stringify({ primaryEdition: 'modern-en', compareEdition: 'original-en', compareOpen: false, voicePersona: 'female', voicePersonaChosen: true }))
    if (!sessionStorage.getItem('qa:booted')) {
      sessionStorage.setItem('qa:booted', '1')
      sessionStorage.setItem('tinct:lab-reader-handoff', JSON.stringify({ kind: 'open-reader', bookId, primaryEditionKey: 'modern-en', savedPlace: { bookId, chapterNumber: 5, paragraphIndex: 0, wordIndex: 0, page: 0 } }))
    }
    HTMLMediaElement.prototype.play = async function () { this.muted = true }
  }, { bookId: BOOK })
  const page = await context.newPage()
  const errors = []
  page.on('pageerror', e => errors.push(e.message))
  page.setDefaultTimeout(15000)
  await page.goto(`${ORIGIN}/reader?book=${BOOK}`, { waitUntil: 'domcontentloaded' })
  await page.waitForFunction(() => document.querySelector('[data-testid="lab-root"]')?.dataset.readerReady === 'true', null, { timeout: 60000 })
  await page.evaluate(() => document.fonts.ready)
  await page.waitForTimeout(1200)
  const home = await placeOf(page)
  const shot = async name => { const file = path.join(OUT, `${tag}-${name}.png`); await page.screenshot({ path: file }); console.log(`     ${file}`) }

  // Explain: the card opens at its expected height before the first word and holds it.
  nextAnswer = EXPLAIN
  await select(page)
  await startSampling(page)
  await page.getByTestId('lab-pbar-explain').click()
  await page.getByTestId('lab-phone-card').waitFor()
  await page.waitForTimeout(300)
  const opened = await page.evaluate(() => { const c = document.querySelector('[data-testid="lab-phone-card"]'); return { kind: c.dataset.kind, height: Math.round(c.getBoundingClientRect().height), held: c.hasAttribute('data-held'), vh: innerHeight } })
  ok(`${tag}: Explain opens at its expected height (${opened.height}px, ${Math.round(opened.height / opened.vh * 100)}% of the screen) before its answer`, opened.held && Math.abs(opened.height - Math.round(opened.vh * 0.62)) <= 2, opened)
  await page.getByTestId('lab-phone-card-answer').waitFor()
  await page.waitForTimeout(STREAM_MS / 2.5)
  await shot('explain-mid')
  await page.waitForFunction(() => !document.querySelector('[data-testid="lab-phone-card"] [aria-busy="true"]'), null, { timeout: STREAM_MS * 3 })
  await page.waitForTimeout(600)
  let samples = await stopSampling(page)
  let verdict = judge(samples)
  ok(`${tag}: Explain streams in ${verdict.frames} frames; the card's top never moves up and the text's top stays put`, verdict.frames >= 8 && verdict.climbs === 0 && verdict.textMoves === 0 && verdict.grew && verdict.heights.length === 1, verdict)
  let done = await page.evaluate(() => {
    const c = document.querySelector('[data-testid="lab-phone-card"]'), r = c.getBoundingClientRect()
    const body = c.querySelector('[data-testid="lab-phone-card-body"]'), field = c.querySelector('.lab-pcard-follow').getBoundingClientRect()
    return { height: Math.round(r.height), bottom: Math.round(r.bottom), held: c.hasAttribute('data-held'), fieldBottom: Math.round(field.bottom), scroll: [body.scrollTop, body.scrollHeight, body.clientHeight] }
  })
  ok(`${tag}: Explain done: the field stays at the foot, the card stands on the bottom (${done.height}px)`, done.bottom >= 840 && done.fieldBottom >= done.bottom - 40, done)
  await shot('explain-done')
  ok(`${tag}: Explain: the reading place is unchanged`, JSON.stringify(await placeOf(page)) === JSON.stringify(home), { home, now: await placeOf(page) })
  await tapOutside(page)

  // A short answer: held while it streams and after it ends; the spare room stays blank (no shrink, no settle).
  nextAnswer = SHORT
  await select(page, 40, 46)
  await startSampling(page)
  await page.getByTestId('lab-pbar-explain').click()
  await page.getByTestId('lab-phone-card-answer').waitFor()
  await page.waitForFunction(() => !document.querySelector('[data-testid="lab-phone-card"] [aria-busy="true"]'), null, { timeout: STREAM_MS * 3 })
  await page.waitForTimeout(700)
  samples = await stopSampling(page)
  const streamed = samples.filter(s => s.busy && s.text > 0)
  const after = samples.filter(s => !s.busy)
  const settled = await page.evaluate(() => { const c = document.querySelector('[data-testid="lab-phone-card"]'); return { height: Math.round(c.getBoundingClientRect().height), held: c.hasAttribute('data-held') } })
  const still = after.every(s => Math.abs(s.top - streamed[streamed.length - 1]?.top) <= 1)
  ok(`${tag}: a short answer is held while it streams and keeps its height after (${streamed[0]?.height}px → ${settled.height}px)`, streamed.length > 0 && streamed.every(s => s.held) && settled.held && settled.height === streamed[0].height && still, { streamed: streamed.slice(0, 2), settled, after: after.map(s => s.top) })
  await shot('short-held')
  await tapOutside(page)

  // Ask: on the phone it opens Chat with the passage (LabApp phoneBarAsk); the question sent, the answer fills
  // downward under the held question and the card's top stays put.
  nextAnswer = ASK
  await select(page, 60, 70)
  await page.getByTestId('lab-pbar-ask').click()
  await page.getByTestId('lab-phone-card').waitFor()
  await page.waitForTimeout(400)
  const askKind = await page.evaluate(() => document.querySelector('[data-testid="lab-phone-card"]').dataset.kind)
  const input = askKind === 'chat' ? 'lab-ask-input' : 'lab-phone-card-input', send = askKind === 'chat' ? 'lab-ask-send' : 'lab-phone-card-send'
  await page.getByTestId(input).fill('Why does Victor dwell on his childhood?')
  await page.getByTestId(send).click()
  await page.evaluate(() => document.activeElement?.blur?.())
  await page.waitForTimeout(350)
  await startSampling(page)
  await page.waitForFunction(() => document.querySelector('[data-testid="lab-phone-card"] [data-testid="lab-ask-turn-assistant"], [data-testid="lab-phone-card"] [data-testid="lab-phone-card-answer"]'), null, { timeout: STREAM_MS * 3 })
  await page.waitForTimeout(STREAM_MS / 2.5)
  await shot('ask-mid')
  await page.waitForFunction(() => !document.querySelector('[data-testid="lab-phone-card"] [data-pcard-busy], [data-testid="lab-phone-card"] [aria-busy="true"], [data-testid="lab-phone-card"] .tc-a.is-streaming'), null, { timeout: STREAM_MS * 3 })
  await page.waitForTimeout(600)
  samples = await stopSampling(page)
  verdict = judge(samples)
  // Since 14 Nov 2026 the card keeps the height it opened at; an answer that outgrows it scrolls inside it.
  const askHeights = samples.filter(s => s.text > 0).map(s => s.height)
  const askDrops = samples.filter((s, i) => i > 0 && s.top > samples[i - 1].top + 1).length
  ok(`${tag}: Ask (${askKind} card) streams in ${verdict.frames} frames from its expected height (${verdict.heights.join(' → ')}px); the card keeps that height and its top never moves down`, verdict.frames >= 8 && verdict.grew && Math.abs(askHeights[0] - Math.round(844 * 0.66)) <= 2 && askHeights.every(h => Math.abs(h - askHeights[0]) <= 1) && Math.max(...askHeights) <= Math.round(844 * 0.7) + 1 && askDrops === 0, { verdict, samples: samples.filter((s, i) => i % 3 === 0).map(s => [s.t, s.top, s.height, s.text, s.answerTop, s.busy, s.scroll]) })
  done = await page.evaluate(() => {
    const c = document.querySelector('[data-testid="lab-phone-card"]'), r = c.getBoundingClientRect()
    const field = c.querySelector('.lab-pcard-follow, [data-testid="lab-ask-composer"]').getBoundingClientRect()
    return { height: Math.round(r.height), bottom: Math.round(r.bottom), fieldBottom: Math.round(field.bottom) }
  })
  ok(`${tag}: Ask done: the field stays at the foot (${done.height}px card)`, done.bottom >= 840 && done.fieldBottom >= done.bottom - 40, done)
  await shot('ask-done')
  await tapOutside(page)
  ok(`${tag}: after Explain and Ask the reading place is unchanged`, JSON.stringify(await placeOf(page)) === JSON.stringify(home), { home, now: await placeOf(page) })
  ok(`${tag}: no page errors`, errors.length === 0, errors)
  await context.close(); await browser.close()
}

try {
  for (const engine of ENGINES) await run(engine)
} finally { server.close() }
console.log(failures ? `\n${failures} check(s) failed` : '\nall checks passed')
process.exit(failures ? 1 : 0)
