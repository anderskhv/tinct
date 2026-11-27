#!/usr/bin/env node
// Follow-up questions typed in a phone card leave the page as it was (Anders, 26 and 27 Nov 2026, iPhone: "Open a
// card, type in 3 or 4 questions, swipe it down and see if it moves down the text": afterwards about half the page
// was blank; first seen after the People card in Acts 9).
//
// What went wrong, in two steps:
// 1. While the keyboard of a card's field was up, the reader's shell took the height the window reported, and the
//    chapter was laid out again in half-height pages behind the card (Acts 9: 24 pages for 10).
// 2. A follow-up from the People card opens Chat at Send. Chat's opening keeps the page on screen "exactly as laid
//    out", so the half-height page was kept, in the full-height shell, until the chapter changed.
// Now the shell keeps its height while a card's keyboard is up (labShellHeightPx), and kept pages are used only in a
// shell as tall as the one they were laid out in (labPageMapFitsShell).
//
//   cd app && npm run build && node scripts/check-phone-card-follow-ups-keep-page.mjs   (TINCT_DIST=<dir> for another build)
//
// The built app is served here, a reader with no account, Acts 9 in the King James Bible, page 2, with the layout
// trace on (?layoutTrace=1; DEBUG=1 prints it). Nothing reaches production or an AI: every /api route is answered
// here (Explain and the follow-ups get a canned answer) and every other host is refused.
//
// A headless browser has no software keyboard, so three stand-ins play it (KEYBOARDS):
//   pan     an iPhone as modelled here: the visual viewport shrinks, and the window is panned past the document's
//           end to show the field, so innerHeight reports the shorter window until the page scrolls it back
//           (window.scrollTo(0, 0)), which sends no viewport event of its own.
//   resize  the window itself gets shorter (what the other phone card checks use; an Android web view).
//   visual  only the visual viewport shrinks (an iPhone whose window does not move).
// Two flows (FLOWS), each on WebKit as an iPhone 13 and on phone-sized Chromium (ENGINES):
//   people  a name's card, one follow-up there (it opens Chat), three more in Chat, closed by a swipe down; then
//           again, closed with Chat's close control.
//   explain a passage's Explain card, four follow-ups in it (the keyboard goes at every Send), closed by a swipe
//           down; then again, closed by a tap outside it.
// Checked: while the keyboard is up the shell keeps its height and the chapter its pages (pan and visual; a window
// that really is shorter lays the page out for itself, and back); after the card closes the page is as tall as
// before, its first and last words and its last line are where they were, the chapter has the pages it had, the
// reading place is the same word, and a page turn forward and back shows the same page.
import fs from 'node:fs/promises'
import path from 'node:path'
import { createServer } from 'node:http'

// PLAYWRIGHT_MODULE: another Playwright build (a machine whose installed browsers are not this project's).
const playwright = await import(process.env.PLAYWRIGHT_MODULE || '@playwright/test')
const { chromium, webkit, devices } = playwright.chromium ? playwright : playwright.default

const dist = path.resolve(process.env.TINCT_DIST || 'dist')
const OUT = path.resolve(process.env.TINCT_PHONE_CARD_FOLLOW_UPS_OUTPUT || 'artifacts/phone-card-follow-ups')
await fs.mkdir(OUT, { recursive: true })
const ENGINES = (process.env.ENGINES || 'webkit,chromium').split(',')
const KEYBOARDS = (process.env.KEYBOARDS || 'pan,resize,visual').split(',')
const FLOWS = (process.env.FLOWS || 'people,explain').split(',')
const BOOK = 'bible', EDITION = 'kjv-en'
const CHAPTER = 1027 // Acts 9
const VIEW = { width: 390, height: 664 } // iPhone 13 in Safari, its bars showing
const KEYBOARD_PX = 336
const ANSWER = 'Saul, still breathing threats against the disciples, is stopped on the road by a light from heaven. The voice that speaks to him names what he has been doing: in hunting the believers he has been hunting Jesus himself. He rises blind and is led by the hand into Damascus, where he waits three days without food or drink.'

const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.jpg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.wasm': 'application/wasm', '.webmanifest': 'application/manifest+json' }
const server = createServer(async (req, res) => {
  let pathname = decodeURIComponent(new URL(req.url || '/', 'http://local').pathname)
  if (pathname.startsWith('/api/')) { res.writeHead(404, { 'content-type': 'application/json' }); res.end('{}'); return }
  if (pathname === '/reader') pathname = '/app.html'
  if (pathname.endsWith('/')) pathname += 'index.html'
  const file = path.join(dist, path.normalize(pathname))
  try {
    if (!file.startsWith(dist + path.sep) || !(await fs.stat(file)).isFile()) throw new Error('missing')
    res.writeHead(200, { 'content-type': TYPES[path.extname(file)] || 'application/octet-stream' })
    res.end(await fs.readFile(file))
  } catch { res.writeHead(404); res.end() }
})
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
const ORIGIN = `http://127.0.0.1:${server.address().port}`

let failures = 0
const ok = (label, pass, detail) => { if (!pass) failures++; console.log(`${pass ? 'ok  ' : 'FAIL'} ${label}${!pass && detail !== undefined ? ' ' + JSON.stringify(detail).slice(0, 1400) : ''}`) }
const sse = text => `data: ${JSON.stringify({ type: 'content_block_delta', delta: { type: 'text_delta', text } })}\n\n`

/** The page as the reader sees it: its box, its first and last words, the page count and the reading place. */
const pageOf = page => page.evaluate(() => {
  const root = document.querySelector('[data-testid="lab-root"]')
  const wrap = document.querySelector('[data-testid="lab-page-wrap"]')
  const words = [...document.querySelectorAll('[data-testid="lab-page-wrap"] .lab-passage [data-testid="lab-word"]')].filter(word => !word.closest('.lab-page-measure'))
  const first = words[0], last = words[words.length - 1]
  const at = word => word ? `${word.dataset.paragraphIndex}:${word.dataset.wordIndex}` : null
  return {
    chapter: root?.dataset.chapter, place: root?.dataset.place,
    shell: Math.round(root?.getBoundingClientRect().height || 0), wrap: Math.round(wrap?.getBoundingClientRect().height || 0),
    first: at(first), firstTop: first ? Math.round(first.getBoundingClientRect().top) : null,
    last: at(last), lastBottom: last ? Math.round(last.getBoundingClientRect().bottom) : null, words: words.length,
    // "2 / 10 of chapter · 22%": the page and the chapter's page count.
    pages: (document.querySelector('[data-testid="lab-chapter-progress"]')?.getAttribute('aria-label') || '').match(/^(\d+) \/ (\d+)/)?.slice(1, 3).join(' / ') ?? null,
  }
})
const samePage = (a, b) => a.chapter === b.chapter && a.place === b.place && a.shell === b.shell && a.wrap === b.wrap && a.first === b.first && a.last === b.last
  && a.pages === b.pages && Math.abs(a.firstTop - b.firstTop) <= 1 && Math.abs(a.lastBottom - b.lastBottom) <= 1
const traceOf = page => page.evaluate(() => { try { return JSON.parse(sessionStorage.getItem('tinct-layout-trace') || '{}').e || [] } catch { return [] } })
const traceTail = entries => entries.filter(entry => !/^(vv-scroll|win-resize|orientation)$/.test(entry.k)).slice(-14).map(({ t, k, ih, vh, open, ...rest }) => `${t} ${k} ih=${ih} vh=${vh} ${JSON.stringify(rest).slice(0, 150)}`)
const settled = page => page.waitForTimeout(1600)
const cardBusy = page => page.waitForFunction(() => { const card = [...document.querySelectorAll('.lab-pcard')].pop(); return !!card && !card.querySelector('[aria-busy="true"], [data-pcard-busy]') }, null, { timeout: 30000 })

async function run(engineName, keyboardName, flow, close) {
  const tag = `${engineName} ${flow}, ${keyboardName} keyboard, closed by ${close}`
  const engine = engineName === 'chromium' ? chromium : webkit
  const browser = await engine.launch({ headless: true, args: engineName === 'chromium' ? ['--mute-audio'] : [] })
  const context = await browser.newContext({ ...devices['iPhone 13'], viewport: VIEW, deviceScaleFactor: 1, serviceWorkers: 'block' })
  const outside = []
  await context.route('**/*', async route => {
    const url = new URL(route.request().url())
    if (url.origin !== ORIGIN) { if (!/^(data|blob):$/.test(url.protocol)) outside.push(url.hostname); return route.abort() }
    if (/^\/api\/(lab-chat|chat)$/.test(url.pathname)) {
      await new Promise(resolve => setTimeout(resolve, 300))
      const half = Math.floor(ANSWER.length / 2)
      return route.fulfill({ status: 200, headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' }, body: sse(ANSWER.slice(0, half)) + sse(ANSWER.slice(half)) + 'data: {"type":"message_stop"}\n\n' })
    }
    if (url.pathname.startsWith('/api/')) return route.fulfill({ status: 404, contentType: 'application/json', body: '{"error":"mock"}' })
    return route.continue()
  })
  await context.addInitScript(({ bookId, chapter, edition }) => {
    localStorage.setItem('tinct:wipe-v1-done', '1')
    localStorage.setItem('tinct:selection-actions-used', '1')
    if (!sessionStorage.getItem('qa:booted')) {
      sessionStorage.setItem('qa:booted', '1')
      sessionStorage.setItem('tinct:lab-reader-handoff', JSON.stringify({ kind: 'open-reader', bookId, primaryEditionKey: edition, savedPlace: { bookId, chapterNumber: chapter, paragraphIndex: 0, wordIndex: 0, page: 0 } }))
    }
    // A visual viewport the check can shrink as the software keyboard does (window.__keyboard(px, pan)).
    const real = window.visualViewport
    const fake = new EventTarget()
    let keyboard = 0, pan = 0
    for (const key of ['width', 'offsetLeft', 'offsetTop', 'pageLeft', 'pageTop', 'scale']) Object.defineProperty(fake, key, { get: () => real ? real[key] : 0 })
    Object.defineProperty(fake, 'height', { get: () => (real ? real.height : innerHeight) - keyboard })
    Object.defineProperty(window, 'visualViewport', { configurable: true, get: () => fake })
    real?.addEventListener('resize', () => fake.dispatchEvent(new Event('resize')))
    // `pan`: the window scrolled past the document's end. innerHeight reports only what is left of the document in
    // the window, until the page scrolls itself back; that scroll sends a window scroll event and no viewport event.
    const inner = Object.getOwnPropertyDescriptor(window, 'innerHeight') || Object.getOwnPropertyDescriptor(Window.prototype, 'innerHeight')
    Object.defineProperty(window, 'innerHeight', { configurable: true, get: () => inner.get.call(window) - pan })
    Object.defineProperty(window, 'scrollY', { configurable: true, get: () => pan })
    Object.defineProperty(window, 'pageYOffset', { configurable: true, get: () => pan })
    const scrollTo = window.scrollTo.bind(window)
    window.scrollTo = (...args) => {
      const top = typeof args[0] === 'object' ? args[0]?.top : args[1]
      if (pan && !top) { pan = 0; setTimeout(() => window.dispatchEvent(new Event('scroll')), 0) }
      return scrollTo(...args)
    }
    window.__keyboard = (px, panned = 0) => { keyboard = px; pan = panned; fake.dispatchEvent(new Event('resize')) }
  }, { bookId: BOOK, chapter: CHAPTER, edition: EDITION })
  const page = await context.newPage()
  const errors = []
  // WebKit's notice that a ResizeObserver changed a size it was observing (Chat's thread keeps its newest message in
  // view while its card changes height) is counted and printed, not failed: it is not what this check is about.
  let notices = 0
  page.on('pageerror', error => { if (/^ResizeObserver loop/.test(error.message)) notices++; else errors.push(error.message) })
  page.setDefaultTimeout(20000)
  /** The keyboard comes (px > 0) or goes. */
  const keyboard = async px => {
    if (keyboardName === 'resize') { await page.setViewportSize({ width: VIEW.width, height: VIEW.height - px }); return }
    await page.evaluate(([px, pan]) => window.__keyboard(px, pan), [px, keyboardName === 'pan' ? px : 0])
  }
  const typing = () => page.evaluate(() => document.activeElement?.tagName === 'TEXTAREA')
  try {
    await page.goto(`${ORIGIN}/reader?book=${BOOK}&sharedReader=1&layoutTrace=1`, { waitUntil: 'domcontentloaded' })
    await page.waitForFunction(() => document.querySelector('[data-testid="lab-root"]')?.dataset.readerReady === 'true', null, { timeout: 90000 })
    await page.evaluate(() => document.fonts.ready)
    await page.waitForFunction(() => document.querySelector('[data-testid="lab-root"]')?.dataset.charactersReady === 'true', null, { timeout: 60000 })
    await page.waitForTimeout(1200)
    // Page 2: a place that is not the chapter's start, so a lost place shows.
    await page.evaluate(() => document.querySelector('[data-testid="lab-page-next"]').click())
    await page.waitForTimeout(900)
    const before = await pageOf(page)
    ok(`${tag}: Acts 9 is open on page ${before.pages}, ${before.words} words on the page`, before.chapter === String(CHAPTER) && /^2 \/ \d+$/.test(before.pages || '') && before.words > 60, before)
    const shot = async name => { const file = path.join(OUT, `${engineName}-${flow}-${keyboardName}-${close}-${name}.png`); await page.screenshot({ path: file }); return file }
    await shot('1-before')

    // While a card's keyboard is up, the page behind it is left alone.
    const asked = []
    const during = []
    const whileTyping = async label => during.push({ label, ...(await pageOf(page)) })

    if (flow === 'people') {
      // A tap on a name opens its People card.
      const name = await page.evaluate(async () => {
        const words = [...document.querySelectorAll('[data-testid="lab-page-wrap"] .lab-passage [data-testid="lab-word"]')].filter(word => !word.closest('.lab-page-measure'))
        const node = words.find(word => /^(Saul|Ananias|Damascus|Judas|Tarsus)\b/.test(word.textContent))
        if (!node) return null
        const box = node.getBoundingClientRect(), article = node.closest('article')
        const init = { pointerType: 'touch', pointerId: 1, button: 0, buttons: 1, isPrimary: true, bubbles: true, cancelable: true, clientX: box.x + box.width / 2, clientY: box.y + box.height / 2 }
        node.dispatchEvent(new PointerEvent('pointerdown', init))
        await new Promise(resolve => setTimeout(resolve, 400))
        article.dispatchEvent(new PointerEvent('pointerup', { ...init, buttons: 0 }))
        return node.textContent
      })
      await page.getByTestId('lab-phone-character').waitFor()
      await page.waitForTimeout(500)
      // The first follow-up, typed in the People card: Send opens Chat with the question.
      const field = page.getByTestId('lab-phone-character').getByTestId('lab-phone-card-input')
      await field.click()
      await keyboard(KEYBOARD_PX)
      await page.waitForTimeout(900) // long enough for a page map laid out at the keyboard's height to be shown
      await whileTyping(`People card (${String(name).trim()}), keyboard up`)
      asked.push('Who is this, in one line?')
      await field.fill(asked[0])
      await field.press('Enter')
      await page.waitForTimeout(250)
      if (!(await typing())) await keyboard(0) // Send put the keyboard away
      await page.locator('.lab-pcard[data-kind="chat"]').waitFor()
      await cardBusy(page)
      await page.waitForTimeout(800)
      // Three more, in Chat (on a phone its Return key is a new line: the arrow sends). While its field keeps the
      // focus the keyboard stays up between questions.
      for (let i = 2; i <= 4; i++) {
        const composer = page.getByTestId('lab-ask-input')
        if (!(await typing())) { await composer.click(); await keyboard(KEYBOARD_PX); await page.waitForTimeout(900) }
        await whileTyping(`Chat, question ${i}, keyboard up`)
        asked.push(`Follow-up question ${i}?`)
        await composer.fill(asked[asked.length - 1])
        await page.getByTestId('lab-ask-send').click()
        await page.waitForTimeout(250)
        if (!(await typing())) await keyboard(0)
        await page.waitForFunction(count => document.querySelectorAll('.lab-pcard [data-testid="lab-ask-turn-user"]').length >= count, i, { timeout: 15000 })
        await cardBusy(page)
        await page.waitForTimeout(900)
      }
    } else {
      // A long press on one word and a drag to another, then Explain.
      const words = page.locator('[data-testid="lab-page-wrap"] .lab-passage [data-testid="lab-word"]')
      const a = await words.nth(3).boundingBox(), b = await words.nth(12).boundingBox()
      const at = box => ({ clientX: box.x + box.width / 2, clientY: box.y + box.height / 2 })
      await words.nth(3).dispatchEvent('pointerdown', { pointerId: 9, pointerType: 'touch', isPrimary: true, bubbles: true, button: 0, ...at(a) })
      await page.waitForTimeout(320)
      await words.nth(12).dispatchEvent('pointermove', { pointerId: 9, pointerType: 'touch', isPrimary: true, bubbles: true, ...at(b) })
      await page.waitForTimeout(60)
      await words.nth(12).dispatchEvent('pointerup', { pointerId: 9, pointerType: 'touch', isPrimary: true, bubbles: true, ...at(b) })
      await page.getByTestId('lab-phone-bar').waitFor({ timeout: 5000 })
      await page.waitForTimeout(250)
      await page.getByTestId('lab-pbar-explain').click()
      await page.getByTestId('lab-phone-card').waitFor()
      await cardBusy(page)
      await page.waitForTimeout(600)
      // Four follow-ups in the card. Send puts the keyboard away each time.
      for (let i = 1; i <= 4; i++) {
        const field = page.getByTestId('lab-phone-card-input')
        await field.click()
        await keyboard(KEYBOARD_PX)
        await page.waitForTimeout(900)
        await whileTyping(`Explain card, question ${i}, keyboard up`)
        asked.push(`Follow-up question ${i}?`)
        await field.fill(asked[asked.length - 1])
        await field.press('Enter')
        await page.waitForTimeout(250)
        if (!(await typing())) await keyboard(0)
        await cardBusy(page)
        await page.waitForTimeout(700)
      }
    }
    // The reader's questions, as the card shows them.
    const shown = await page.evaluate(() => [...document.querySelectorAll('.lab-pcard .lab-pcard-you, .lab-pcard [data-testid="lab-ask-turn-user"]')].map(node => node.textContent || ''))
    const questions = asked.filter(question => shown.some(text => text.includes(question))).length
    await shot('2-card')
    // Chat has no page count in the foot (null): the page's words say whether it was laid out again.
    const moved = during.filter(entry => entry.shell !== before.shell || entry.first !== before.first || entry.last !== before.last || (entry.pages !== null && entry.pages !== before.pages))
    if (keyboardName === 'resize') console.log(`     ${tag}: the window was ${VIEW.height - KEYBOARD_PX}px tall while the keyboard was up; the page behind the card was laid out for it in ${moved.length} of ${during.length} looks`)
    else ok(`${tag}: with the keyboard up the shell stays ${before.shell}px tall and the page behind the card is left as it was, page ${before.pages} (${during.length} looks)`, during.length === 4 && moved.length === 0, { before, moved })

    // Close the card.
    const card = page.locator('.lab-pcard').last()
    const kind = await card.getAttribute('data-kind')
    if (close === 'swipe') {
      // A pull down on the card's header row, as a finger does it.
      const handle = card.getByTestId('lab-phone-card-drag')
      const box = await handle.boundingBox()
      const x = box.x + box.width / 2, y = box.y + 8
      const touch = { pointerId: 12, pointerType: 'touch', isPrimary: true, bubbles: true }
      await handle.dispatchEvent('pointerdown', { ...touch, clientX: x, clientY: y })
      for (const dy of [30, 80, 130]) { await handle.dispatchEvent('pointermove', { ...touch, clientX: x, clientY: y + dy }); await page.waitForTimeout(30) }
      await handle.dispatchEvent('pointerup', { ...touch, clientX: x, clientY: y + 180 })
    } else if (close === 'control') {
      await card.getByRole('button', { name: 'Close chat' }).click()
    } else {
      await page.evaluate(() => {
        const el = document.elementFromPoint(195, 90) || document.body
        const at = { clientX: 195, clientY: 90, bubbles: true, cancelable: true, pointerId: 11, pointerType: 'touch', isPrimary: true }
        el.dispatchEvent(new PointerEvent('pointerdown', at)); el.dispatchEvent(new PointerEvent('pointerup', at)); el.dispatchEvent(new MouseEvent('click', at))
      })
    }
    await page.waitForTimeout(350)
    await keyboard(0) // the field went with the card: the keyboard goes down
    ok(`${tag}: the ${kind} card closed`, await page.locator('.lab-pcard').count() === 0)
    await settled(page)
    const after = await pageOf(page)
    const file = await shot('3-after')
    const trace = await traceOf(page)
    ok(`${tag}: the page is as tall as before (shell ${after.shell}px, page box ${after.wrap}px, last line ends at ${after.lastBottom}px; was ${before.shell}, ${before.wrap}, ${before.lastBottom})`,
      after.shell === before.shell && after.wrap === before.wrap && Math.abs(after.lastBottom - before.lastBottom) <= 1, { before, after, trace: traceTail(trace) })
    ok(`${tag}: the text has not moved (first word ${after.first} at ${after.firstTop}px, last word ${after.last}; was ${before.first} at ${before.firstTop}px, ${before.last})`,
      after.first === before.first && after.last === before.last && Math.abs(after.firstTop - before.firstTop) <= 1, { before, after })
    ok(`${tag}: the chapter has the pages it had (${after.pages}; was ${before.pages})`, after.pages === before.pages, { before: before.pages, after: after.pages })
    ok(`${tag}: the reading place is the same word (${after.place}; was ${before.place})`, after.place === before.place && after.chapter === before.chapter, { before: before.place, after: after.place })
    // The pages turned to afterwards are whole too: the next page starts where this one ended, and turning back shows this page again.
    await page.evaluate(() => document.querySelector('[data-testid="lab-page-next"]').click())
    await page.waitForTimeout(700)
    const next = await pageOf(page)
    await page.evaluate(() => document.querySelector('[data-testid="lab-page-prev"]').click())
    await page.waitForTimeout(700)
    const back = await pageOf(page)
    ok(`${tag}: a page turn forward and back shows the same page again (${back.first} to ${back.last}, page ${back.pages}; the next page starts at ${next.first})`, samePage(back, before) && next.pages === before.pages?.replace(/^2/, '3'), { before, next, back })
    ok(`${tag}: four questions were asked and answered here (${questions} of ${asked.length} shown in the card), nothing left this machine, no page errors`, asked.length === 4 && questions === 4 && outside.length === 0 && errors.length === 0, { asked, shown, outside: [...new Set(outside)], errors })
    console.log(`     ${file}${notices ? ` (${notices} ResizeObserver loop notice${notices > 1 ? 's' : ''})` : ''}`)
    if (process.env.DEBUG) console.log(trace.filter(entry => !/^(vv-scroll|win-resize|orientation)$/.test(entry.k)).map(({ t, k, open, ...rest }) => `     ${t} ${k} ${JSON.stringify(rest)}`).join('\n'))
  } catch (error) {
    ok(`${tag}: ran to its end`, false, String(error?.message || error).slice(0, 600))
    await page.screenshot({ path: path.join(OUT, `${engineName}-${flow}-${keyboardName}-${close}-failed.png`) }).catch(() => {})
  } finally {
    await context.close(); await browser.close()
  }
}

for (const engine of ENGINES) for (const keyboard of KEYBOARDS) for (const flow of FLOWS) {
  for (const close of flow === 'people' ? ['swipe', 'control'] : ['swipe', 'outside']) await run(engine, keyboard, flow, close)
}
server.close()
console.log(failures ? `\n${failures} check(s) failed` : '\nall checks passed')
process.exit(failures ? 1 : 0)
