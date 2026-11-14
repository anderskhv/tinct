#!/usr/bin/env node
// The phone's answer card opens at one height and keeps it until it closes (Anders, 14 Nov 2026: "the mobile cards
// are still jumpy -- sometimes they open up and resize up/down ... even had one jump upwards just to add a blank
// space"). Before the fix a longer answer grew the card in steps with 10% of the screen as headroom, a follow-up grew
// it again while it streamed, and with the keyboard up its height followed the text.
//
//   (cd app && VITE_SHARED_READER_DEFAULT=1 SKIP_ENV_CHECK=1 CI=true npm run build) && node app/scripts/check-phone-card-steady.mjs
//
// WebKit, iPhone 13 at 390x844. The built app is served here; /api/lab-chat and /api/chat are answered in the page,
// word by word over ~3 s after a 1.2 s wait (no AI call). Every animation frame from the tap until well after the
// answer, the card's top and height are recorded; once the slide-in has ended (300 ms) neither may change, except
// when the keyboard comes or goes (the viewport is shrunk to 500 px to stand in for it), and while the keyboard is up
// neither may change either. Covers Explain, a follow-up in the answered card, and Simplify with an answer longer
// than its card (which then scrolls inside it, its foot faded).
import fs from 'node:fs/promises'
import path from 'node:path'
import { createServer } from 'node:http'
import { webkit, chromium, devices } from 'playwright'

const dist = path.resolve(process.env.TINCT_DIST || 'dist')
const server = process.env.ORIGIN ? null : createServer(async (req, res) => {
  const url = new URL(req.url || '/', 'http://127.0.0.1')
  const file = path.resolve(dist, '.' + (url.pathname === '/reader' ? '/app.html' : url.pathname === '/' ? '/index.html' : url.pathname))
  if (!file.startsWith(dist + path.sep)) { res.writeHead(403); res.end(); return }
  try {
    const body = await fs.readFile(file)
    const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.woff2': 'font/woff2', '.svg': 'image/svg+xml', '.wasm': 'application/wasm', '.mjs': 'text/javascript' }[path.extname(file)] || 'application/octet-stream'
    res.writeHead(200, { 'Content-Type': mime }); res.end(body)
  } catch { res.writeHead(404); res.end() }
})
if (server) await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
const ORIGIN = process.env.ORIGIN || `http://127.0.0.1:${server.address().port}`
const ENGINES = (process.env.ENGINES || 'webkit').split(',')
const BOOK = 'bible'
const CHAPTER = 654 // Proverbs 26
let failures = 0
const ok = (label, pass, detail) => { if (!pass) failures++; console.log(`${pass ? 'ok  ' : 'FAIL'} ${label}${!pass && detail !== undefined ? ' ' + JSON.stringify(detail).slice(0, 1500) : ''}`) }
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
  window.__samples = []; window.__run = true
  const tick = () => { if (!window.__run) return
    const card = document.querySelector('[data-testid="lab-phone-card"]')
    if (card) { const r = card.getBoundingClientRect(); const last = window.__samples[window.__samples.length - 1]
      const s = { t: Math.round(performance.now()), top: Math.round(r.top), h: Math.round(r.height), busy: !!card.querySelector('[aria-busy="true"], [data-pcard-busy]'), held: card.hasAttribute('data-held'), kb: card.hasAttribute('data-keyboard'), kind: card.dataset.kind, len: (card.querySelector('.lab-pcard-body')?.textContent || '').length }
      if (!last || last.top !== s.top || last.h !== s.h || last.busy !== s.busy || last.kind !== s.kind) window.__samples.push(s) }
    requestAnimationFrame(tick) }
  requestAnimationFrame(tick)
})
const stopSampling = page => page.evaluate(() => { window.__run = false; return window.__samples })
const steady = (name, samples, from) => {
  const t0 = samples[0]?.t || 0
  const settled = samples.filter(x => x.t - t0 >= from)
  const moves = settled.filter((x, i) => i > 0 && x.kb === settled[i - 1].kb && (x.top !== settled[i - 1].top || x.h !== settled[i - 1].h))
  ok(`${name}: the card keeps its height and place (${[...new Set(settled.map(x => `${x.h}px@${x.top}${x.kb ? ' kb' : ''}`))].join(' → ')})`, settled.length > 0 && moves.length === 0, settled.map(x => ({ t: x.t - t0, top: x.top, h: x.h, kb: x.kb, busy: x.busy })))
}
const report = (name, samples) => { const t0 = samples[0]?.t || 0; console.log(`\n== ${name}`); for (const s of samples) console.log(`  +${String(s.t - t0).padStart(5)}ms top=${s.top} h=${s.h} busy=${s.busy} held=${s.held} kb=${s.kb} kind=${s.kind} len=${s.len}`) }
const waitDone = page => page.waitForFunction(() => { const c = document.querySelector('[data-testid="lab-phone-card"]'); return c && (c.querySelector('.lab-pcard-body')?.textContent.length || 0) > 60 && !c.querySelector('[aria-busy="true"], [data-pcard-busy]') }, null, { timeout: 30000 })

async function run(engineName) {
  const engine = engineName === 'chromium' ? chromium : webkit
  const browser = await engine.launch({ headless: true })
  const context = await browser.newContext({ ...devices['iPhone 13'], viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, serviceWorkers: 'block' })
  await context.route('**/*', async route => {
    const url = new URL(route.request().url())
    if (url.pathname.startsWith('/api/') && !/^\/api\/(lab-chat|chat)$/.test(url.pathname)) return route.fulfill({ status: 404, contentType: 'application/json', body: '{"error":"mock"}' })
    return url.origin === new URL(ORIGIN).origin || /fonts\.(googleapis|gstatic)\.com$/.test(url.hostname) || /^\/api\//.test(url.pathname) ? route.continue() : route.abort()
  })
  await context.addInitScript(({ bookId, chapter }) => {
    localStorage.setItem('tinct:wipe-v1-done', '1')
    if (!sessionStorage.getItem('qa:booted')) { sessionStorage.setItem('qa:booted', '1')
      sessionStorage.setItem('tinct:lab-reader-handoff', JSON.stringify({ kind: 'open-reader', bookId, primaryEditionKey: 'kjv-en', savedPlace: { bookId, chapterNumber: chapter, paragraphIndex: 0, wordIndex: 0, page: 0 } })) }
    // Streams the answer word by word over ~3 s after a 1.2 s wait, like the real API.
    const real = window.fetch
    window.__answer = 'This proverb compares honour given to a fool with weather in the wrong season. Snow in summer and rain at harvest are not just odd, they do harm: they spoil the crops. In the same way, praising a fool is out of place and can do damage, because it encourages his folly and misleads others about what is wise. The writer wants the reader to see that honour should follow character, not position.'
    window.fetch = async (input, init) => {
      const u = typeof input === 'string' ? input : input.url
      if (!/\/api\/(lab-chat|chat)(\?|$)/.test(new URL(u, location.href).pathname)) return real(input, init)
      const words = window.__answer.split(/(?<= )/), enc = new TextEncoder()
      const body = new ReadableStream({ async start(c) { await new Promise(r => setTimeout(r, 1200)); for (let i = 0; i < words.length; i += 3) { c.enqueue(enc.encode(`data: ${JSON.stringify({ type: 'content_block_delta', delta: { type: 'text_delta', text: words.slice(i, i + 3).join('') } })}\n\n`)); await new Promise(r => setTimeout(r, 60)) } c.enqueue(enc.encode('data: {"type":"message_stop"}\n\n')); c.close() } })
      return new Response(body, { status: 200, headers: { 'Content-Type': 'text/event-stream' } })
    }
  }, { bookId: BOOK, chapter: CHAPTER })
  const page = await context.newPage()
  page.on('pageerror', e => console.log('pageerror', e.message))
  await page.goto(`${ORIGIN}/reader?book=${BOOK}&sharedReader=1`, { waitUntil: 'domcontentloaded' })
  await page.waitForFunction(() => document.querySelector('[data-testid="lab-root"]')?.dataset.readerReady === 'true', null, { timeout: 90000 })
  await page.evaluate(() => document.fonts.ready); await page.waitForTimeout(1200)
  const scen = process.env.SCEN || 'explain,followup,simplify'
  // 1. Explain
  if (scen.includes('explain')) { await select(page, 0, 17); await startSampling(page); await page.getByTestId('lab-pbar-explain').click(); await waitDone(page); await page.waitForTimeout(1200); steady(`${engineName} Explain`, await stopSampling(page), 300)
    // 3. follow-up inside the answered card
    if (scen.includes('followup')) { await startSampling(page); const f = page.getByTestId('lab-phone-card-input'); await f.click(); await page.setViewportSize({ width: 390, height: 500 }); await page.waitForTimeout(500); await f.fill('Why snow?'); await page.getByTestId('lab-phone-card-send').click(); await page.waitForTimeout(400); await waitDone(page); await page.waitForTimeout(800); await page.setViewportSize({ width: 390, height: 844 }); await page.evaluate(() => document.activeElement?.blur()); await page.waitForTimeout(1000); steady(`${engineName} a follow-up in the answered card, keyboard up then down`, await stopSampling(page), 0) }
    await tapOutside(page) }
  if (scen.includes('simplify')) { await select(page, 18, 34); await startSampling(page); await page.getByTestId('lab-pbar-simplify').click(); await waitDone(page); await page.waitForTimeout(1200); steady(`${engineName} Simplify, an answer longer than the card`, await stopSampling(page), 300); ok(`${engineName}: the longer answer scrolls inside the card, its foot faded`, await page.evaluate(() => document.querySelector('[data-testid="lab-phone-card"] .lab-pcard-body')?.hasAttribute('data-more'))); await tapOutside(page) }
  await context.close(); await browser.close()
}
for (const engine of ENGINES) await run(engine)

server?.close()
console.log(failures ? `\n${failures} check(s) failed` : '\nall checks passed')
process.exit(failures ? 1 : 0)
