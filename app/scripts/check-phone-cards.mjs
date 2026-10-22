#!/usr/bin/env node
// The phone's margin mode (/reader?book=<id>&margin=1 on a phone, src/lab/marginPhone/): today's phone reader with
// the dark selection bar, bottom cards in place of every pop-up, and the chapter pills. Nothing else changes.
// At 390×844 in WebKit and Chromium, both with an iPhone's agent and touch, against a local dev server
// (`npx vite --port 4811`), every AI route and the account mocked:
//
//   PREVIEW_ORIGIN=http://127.0.0.1:4811 node scripts/check-phone-cards.mjs
//
// Checks: the top bar is the normal reader's (DOM and pixels); a selection shows the dark bar (Ask with no blinking
// line) and no native callout; the ••• menu is compact and whole on screen; each action opens its card (Explain,
// Simplify, Define, Fact-check, Counterpoint, Quiz me, Ask, a note), none quoting the passage, which stays
// underlined on the page, the page dimmed behind, no field focused until tapped; a focused field with a shrunken
// visualViewport (the keyboard) keeps the card inside it; Chat and Talk open as cards; the start pills sit on the
// heading's line and the end pills have no label, and open their cards; the place is unchanged after each card
// opens and closes; a reload keeps the place. Screenshots go to OUT.
// Round 2 (iPhone feedback, 21 Oct 2026): every card is as tall as its content (at most 70% of the visible height, the
// follow-up row at most 24px under the last line); the card stands on visualViewport offsetTop + height, also when
// iOS pans (offsetTop > 0) or shrinks innerHeight; the narration bar is hidden while a card's field has the focus;
// pills sit 8px apart with 44px tap heights; every pill card (Primer, Catch me up, Recap, Quiz me's end) and every
// passage card ends with the follow-up field (mic, Talk, send) and no round Chat/Talk/Copy buttons, in margin mode
// and on the normal phone reader's sheets; a follow-up from a pill card is answered in it; Talk from it opens Talk.
import { chromium, webkit, devices } from 'playwright'
import { mkdirSync, readFileSync } from 'node:fs'
import { build } from 'esbuild'
import { join, resolve } from 'node:path'

const ORIGIN = process.env.PREVIEW_ORIGIN || 'http://127.0.0.1:4811'
const OUT = resolve(process.env.OUT || 'artifacts/phone-cards')
mkdirSync(OUT, { recursive: true })
const BOOK = process.env.BOOK || 'frankenstein'
const ENGINES = (process.env.ENGINES || 'webkit,chromium').split(',')
const ANSWER = 'MOCK lead sentence of the answer. A second sentence follows it and says a little more about the passage.'

let failures = 0
const ok = (label, pass, detail) => { if (!pass) failures++; console.log(`${pass ? 'ok  ' : 'FAIL'} ${label}${!pass && detail !== undefined ? ' ' + JSON.stringify(detail).slice(0, 700) : ''}`) }

const sse = text => `data: ${JSON.stringify({ type: 'content_block_delta', delta: { type: 'text_delta', text } })}\n\ndata: {"type":"message_stop"}\n\n`
async function mock(context, log) {
  await context.route('**/*', async route => {
    const req = route.request(), url = new URL(req.url())
    if (url.origin !== new URL(ORIGIN).origin) return route.abort()
    if (/^\/api\/(chat|lab-chat)$/.test(url.pathname) && req.method() === 'POST') {
      let body = null; try { body = req.postDataJSON() } catch {}
      const c = body?.companion || {}
      log.ai.push({ intent: c.intent ?? 'chat', selection: c.selection ?? null, quiz: !!c.quiz })
      const text = c.intent === 'define' ? JSON.stringify({ kind: 'definition', definition: `A mocked meaning of “${c.selection}” here.` })
        : c.intent === 'quiz' ? JSON.stringify({ questions: [1, 2, 3].map(i => ({ q: `MOCK question ${i}: what happens here?`, answer: `Answer ${i}`, why: 'Because the text says so.', cite: '' })) })
        : c.intent === 'quiz_check' ? JSON.stringify({ verdict: 'right', feedback: 'Your answer names the key step.' })
        : c.intent === 'explain' ? ANSWER : c.intent && c.intent !== 'ask' ? `MOCK ${c.intent}. ${ANSWER}` : `MOCK reply. ${ANSWER}`
      return route.fulfill({ status: 200, headers: { 'Content-Type': 'text/event-stream' }, body: sse(text) })
    }
    if (url.pathname === '/api/lab-chapter-notes' && req.method() === 'POST') {
      const body = req.postDataJSON(); log.notes.push(body.kind)
      return route.fulfill({ json: { beats: [{ title: 'Where it begins', text: `MOCK ${body.kind} beat one.` }, { title: 'Then', text: 'MOCK beat two.' }], kind: body.kind, chapterNumber: body.chapterNumber, through: null, source: 'model' } })
    }
    if (url.pathname === '/api/lab-catch-up' || url.pathname.startsWith('/api/catch-up')) return route.fulfill({ json: { summary: 'MOCK catch-up summary.' } })
    // Talk: the session never connects in the check (the card shows "Connecting" meanwhile).
    if (/voice|realtime|grok/i.test(url.pathname) && url.pathname.startsWith('/api/')) { log.voice.push(url.pathname); return new Promise(() => {}) }
    if (url.pathname.startsWith('/api/')) return route.fulfill({ status: 404, contentType: 'application/json', body: '{"error":"mock"}' })
    return route.continue()
  })
}

/** A chapter's start, handed over as the library does: the normal reader and the margin mode show the same page there, but for the pills. */
const SEED = { chapterNumber: Number(process.env.CHAPTER || 5), paragraphIndex: 0 }
async function boot(engine, search, seed = SEED, keep = null) {
  const fresh = !!keep?.fresh
  const context = keep?.context ?? await engine.launch().then(browser => browser.newContext({ ...devices['iPhone 13'], viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, serviceWorkers: 'block' }).then(c => { c.__browser = browser; return c }))
  const log = keep?.log ?? { ai: [], notes: [], voice: [], errors: [] }
  if (!keep || fresh) {
    await mock(context, log)
    await context.addInitScript(({ bookId, seed }) => {
      localStorage.setItem('tinct:wipe-v1-done', '1')
      if (!localStorage.getItem('tinct-lab-prefs')) localStorage.setItem('tinct-lab-prefs', JSON.stringify({ primaryEdition: 'modern-en', compareEdition: 'original-en', compareOpen: false, voicePersona: 'female', voicePersonaChosen: true }))
      if (!sessionStorage.getItem('qa:booted')) {
        sessionStorage.setItem('qa:booted', '1')
        sessionStorage.setItem('tinct:lab-reader-handoff', JSON.stringify({ kind: 'open-reader', bookId, primaryEditionKey: 'modern-en', savedPlace: { bookId, chapterNumber: seed.chapterNumber, paragraphIndex: seed.paragraphIndex, wordIndex: 0, page: 0 } }))
      }
      HTMLMediaElement.prototype.play = async function () { this.muted = true }
      // A visualViewport the check can shrink as the iOS keyboard does (window.__keyboard(px)).
      const real = window.visualViewport
      const fake = new EventTarget()
      // `top` is iOS's pan to a focused field (offsetTop > 0): the visible part starts that far down the window.
      let keyboard = 0, top = 0
      for (const key of ['width', 'offsetLeft', 'pageLeft', 'pageTop', 'scale']) Object.defineProperty(fake, key, { get: () => real ? real[key] : 0 })
      Object.defineProperty(fake, 'height', { get: () => (real ? real.height : innerHeight) - keyboard })
      Object.defineProperty(fake, 'offsetTop', { get: () => top })
      Object.defineProperty(window, 'visualViewport', { configurable: true, get: () => fake })
      window.__keyboard = (px, panned = 0) => { keyboard = px; top = panned; fake.dispatchEvent(new Event('resize')); fake.dispatchEvent(new Event('scroll')) }
      const silent = async () => { try { const ctx = new (window.AudioContext || window.webkitAudioContext)(); return ctx.createMediaStreamDestination().stream } catch { return new MediaStream() } }
      if (navigator.mediaDevices) Object.defineProperty(navigator.mediaDevices, 'getUserMedia', { configurable: true, value: silent })
      window.__copied = []
      Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: async text => { window.__copied.push(text) } } })
    }, { bookId: BOOK, seed })
  }
  const page = keep?.page ?? await context.newPage()
  if (!keep || fresh) {
    page.setDefaultTimeout(15000)
    page.on('pageerror', e => log.errors.push(e.message))
  }
  if (keep && !fresh && search === null) await page.reload({ waitUntil: 'domcontentloaded' })
  else await page.goto(ORIGIN + '/reader' + search, { waitUntil: 'domcontentloaded' })
  await page.waitForFunction(() => document.querySelector('[data-testid="lab-root"]')?.dataset.readerReady === 'true', null, { timeout: 60000 })
  await page.evaluate(() => document.fonts.ready)
  await page.waitForTimeout(1200)
  return { context, page, log }
}
const close = async state => { const browser = state.context.__browser; await state.context.close(); await browser?.close() }

/** Where the reader is: the place, the chapter and the first word on the page. */
const placeOf = page => page.evaluate(() => {
  const root = document.querySelector('[data-testid="lab-root"]')
  const word = document.querySelector('[data-testid="lab-page-wrap"] .lab-passage [data-testid="lab-word"]')
  return { chapter: root?.dataset.chapter, place: root?.dataset.place, first: word ? `${word.dataset.paragraphIndex}:${word.dataset.wordIndex}` : null }
})
const same = (a, b) => a.chapter === b.chapter && a.place === b.place && a.first === b.first

/** The top bar: its markup (classes, labels, text) and its box. */
const headerOf = page => page.evaluate(() => {
  const header = document.querySelector('.lab-header')
  // The menu disc's first-view spin (is-spinning) is a moment's animation, not the bar's markup.
  const walk = el => [el.tagName, el.className && String(el.className).replace(/ is-spinning\b/, ''), el.getAttribute('aria-label'), el.getAttribute('data-testid'), ...[...el.childNodes].map(n => n.nodeType === 3 ? n.textContent.trim() : n.nodeType === 1 ? walk(n) : '')]
  const r = header.getBoundingClientRect()
  return { tree: JSON.stringify(walk(header)), box: [r.left, r.top, r.width, r.height].map(Math.round) }
})

/** A long press on one word and a drag to another, as a finger does (the reader's own selection). */
async function select(page, from = 14, to = 24) {
  const words = page.locator('[data-testid="lab-page-wrap"] .lab-passage [data-testid="lab-word"]')
  const a = await words.nth(from).boundingBox(), b = await words.nth(to).boundingBox()
  const at = box => ({ clientX: box.x + box.width / 2, clientY: box.y + box.height / 2 })
  await words.nth(from).dispatchEvent('pointerdown', { pointerId: 9, pointerType: 'touch', isPrimary: true, bubbles: true, button: 0, ...at(a) })
  await page.waitForTimeout(320)
  await words.nth(to).dispatchEvent('pointermove', { pointerId: 9, pointerType: 'touch', isPrimary: true, bubbles: true, ...at(b) })
  await page.waitForTimeout(60)
  await words.nth(to).dispatchEvent('pointerup', { pointerId: 9, pointerType: 'touch', isPrimary: true, bubbles: true, ...at(b) })
  await page.getByTestId('lab-phone-bar').waitFor({ timeout: 5000 })
  await page.waitForTimeout(250)
}
/** A tap on the page, away from the card: it closes the card and does nothing else. */
async function tapOutside(page) {
  await page.evaluate(() => {
    const el = document.elementFromPoint(195, 140) || document.body
    const at = { clientX: 195, clientY: 140, bubbles: true, cancelable: true, pointerId: 11, pointerType: 'touch', isPrimary: true }
    el.dispatchEvent(new PointerEvent('pointerdown', at)); el.dispatchEvent(new PointerEvent('pointerup', at)); el.dispatchEvent(new MouseEvent('click', at))
  })
  await page.waitForTimeout(350)
}
/** A drag down on the card's handle. */
async function dragDown(page) {
  const handle = page.getByTestId('lab-phone-card-drag')
  const box = await handle.boundingBox()
  const x = box.x + box.width / 2, y = box.y + 6
  await handle.dispatchEvent('pointerdown', { pointerId: 12, pointerType: 'touch', isPrimary: true, bubbles: true, clientX: x, clientY: y })
  await handle.dispatchEvent('pointermove', { pointerId: 12, pointerType: 'touch', isPrimary: true, bubbles: true, clientX: x, clientY: y + 60 })
  await handle.dispatchEvent('pointerup', { pointerId: 12, pointerType: 'touch', isPrimary: true, bubbles: true, clientX: x, clientY: y + 140 })
  await page.waitForTimeout(350)
}
const cardOf = page => page.evaluate(() => {
  const cards = [...document.querySelectorAll('[data-testid="lab-phone-card"]')]
  const card = cards[0]
  if (!card) return { count: 0 }
  const r = card.getBoundingClientRect()
  return {
    count: cards.length, kind: card.dataset.kind, label: card.querySelector('[data-testid="lab-phone-card-label"]')?.textContent,
    text: card.textContent.replace(/\s+/g, ' ').trim().slice(0, 400), lead: card.querySelector('.lab-pcard-lead')?.textContent ?? null,
    top: Math.round(r.top), bottom: Math.round(r.bottom), popup: !!document.querySelector('.selection-popup'),
    focused: document.activeElement?.closest?.('[data-testid="lab-phone-card"]') ? document.activeElement.tagName + ':' + (document.activeElement.getAttribute('data-testid') || '') : null,
  }
})
/** The open card's shape: its height share, the gap between its last line of content and its follow-up row, the row's buttons. */
const shapeOf = (page, root = '[data-testid="lab-phone-card"]') => page.evaluate(root => {
  const card = document.querySelector(root)
  if (!card) return null
  const r = card.getBoundingClientRect()
  const follow = card.querySelector('.lab-pcard-follow')
  const lines = [...card.querySelectorAll('p, li, h3, .lab-pcard-wait, .lab-pcard-question')].filter(el => !follow?.contains(el) && !el.closest('.lab-pcard-follow, .lab-catch-up-foot, .lab-pcard-quiz-foot')).map(el => el.getBoundingClientRect()).filter(b => b.height > 0)
  const last = lines.length ? Math.max(...lines.map(b => b.bottom)) : null
  const f = follow?.getBoundingClientRect()
  const vv = window.visualViewport
  return {
    height: Math.round(r.height), share: Math.round(r.height / (vv?.height || innerHeight) * 100), top: Math.round(r.top), bottom: Math.round(r.bottom),
    gap: f && last != null ? Math.round(f.top - last) : null,
    field: !!card.querySelector('[data-testid="lab-phone-card-input"]'), mic: !!card.querySelector('[data-testid="lab-phone-card-mic"]'),
    talk: !!card.querySelector('[data-testid="lab-phone-card-talk"]'), send: !!card.querySelector('[data-testid="lab-phone-card-send"]'),
    round: card.querySelectorAll('.lab-chapter-notes-tool, [data-testid="lab-chapter-notes-copy"]').length,
    fontSize: parseFloat(getComputedStyle(card.querySelector('[data-testid="lab-phone-card-input"]') || card).fontSize),
  }
}, root)
const followRow = shape => !!shape && shape.field && shape.mic && shape.talk && shape.send && shape.round === 0 && shape.fontSize >= 16
async function shot(page, name) { const path = join(OUT, name + '.png'); await page.screenshot({ path }); return path }

async function showControls(page) {
  if (await page.getByTestId('lab-super').isVisible()) return
  await page.evaluate(() => document.querySelector('.lab-header-brand')?.click())
  await page.getByTestId('lab-super').waitFor({ state: 'visible', timeout: 3000 })
}

async function run(engineName) {
  const engine = engineName === 'webkit' ? webkit : chromium
  const tag = `${BOOK}-390x844-${engineName}`
  const shots = []
  // 1. The normal reader and the margin mode, at the same place.
  const normal = await boot(engine, `?book=${BOOK}`)
  const normalPlace = await placeOf(normal.page)
  const normalHeader = await headerOf(normal.page)
  const normalTop = await normal.page.screenshot({ clip: { x: 0, y: 0, width: 390, height: normalHeader.box[1] + normalHeader.box[3] } })
  shots.push(await shot(normal.page, `${tag}-normal`))
  ok(`${tag}: the normal reader has no margin mode`, await normal.page.evaluate(() => !document.querySelector('.lab.is-margin-phone') && !document.querySelector('[data-testid="lab-unit-start"], [data-testid="lab-unit-end"]')))
  await close(normal)

  const state = await boot(engine, `?book=${BOOK}&margin=1`)
  const { page, log } = state
  const mode = await page.evaluate(() => ({ margin: !!document.querySelector('.lab.is-margin-phone'), frame: !!document.querySelector('iframe[data-testid="margin-preview-frame"]'), layout: document.querySelector('[data-testid="lab-root"]')?.dataset.labLayout, optIn: localStorage.getItem('tinct:margin-preview') }))
  ok(`${tag}: margin=1 opens today's phone reader in margin mode (no frame), opt-in stored`, mode.margin && !mode.frame && mode.layout === 'phone' && mode.optIn === '1', mode)
  const home = await placeOf(page)
  ok(`${tag}: same place as the normal reader (${home.chapter} ${home.place} ${home.first})`, same(home, normalPlace), { home, normalPlace })
  const header = await headerOf(page)
  const diffAt = [...header.tree].findIndex((c, i) => c !== normalHeader.tree[i])
  ok(`${tag}: the top bar's DOM is the normal reader's`, header.tree === normalHeader.tree && header.box.join() === normalHeader.box.join(), { box: [header.box, normalHeader.box], margin: header.tree.slice(Math.max(0, diffAt - 80), diffAt + 120), normal: normalHeader.tree.slice(Math.max(0, diffAt - 80), diffAt + 120) })
  const top = await page.screenshot({ clip: { x: 0, y: 0, width: 390, height: header.box[1] + header.box[3] } })
  ok(`${tag}: the top bar's pixels are the normal reader's`, Buffer.compare(top, normalTop) === 0)
  shots.push(await shot(page, `${tag}-margin`))
  const check = async label => { const now = await placeOf(page); ok(`${tag}: ${label}: the place is unchanged`, same(now, home), { now, home }) }

  // 2. Selection: the dark bar, no native callout, no native selection, not the old popup.
  await select(page)
  const caret = await page.evaluate(() => { const ask = document.querySelector('[data-testid="lab-pbar-ask"]'); return { text: ask.textContent, children: ask.children.length } })
  ok(`${tag}: Ask in the bar is the word alone, no blinking line after it`, caret.text === 'Ask' && caret.children === 0, caret)
  const bar = await page.evaluate(() => {
    const bar = document.querySelector('[data-testid="lab-phone-bar"]')
    const word = document.querySelector('.lab-passage .lab-hearing-word.is-selecting')
    const s = getComputedStyle(bar), w = word ? getComputedStyle(word) : null
    return {
      items: [...bar.querySelectorAll('button')].map(b => b.textContent.trim() || b.getAttribute('aria-label')),
      bg: s.backgroundColor, owns: !!word?.closest('.lab-passage.owns-text-selection'),
      callout: w ? (w.webkitTouchCallout || w.getPropertyValue('-webkit-touch-callout') || null) : null,
      native: String(getSelection()?.toString() || ''), popup: !!document.querySelector('.selection-popup'), r: bar.getBoundingClientRect().toJSON(),
      content: [...bar.children].filter(c => !c.matches('[role="menu"]')).reduce((sum, c) => sum + c.getBoundingClientRect().width, 0),
    }
  })
  ok(`${tag}: a selection shows the dark bar (Ask · Explain · Simplify · ••• · highlight · note), not the old popup`, bar.items.join('|') === 'Ask|Explain|Simplify|More|' + bar.items[4] + '|Add note' && /^Highlight in /.test(bar.items[4]) && !bar.popup && /rgb\(29, 26, 23\)/.test(bar.bg), bar)
  // Anders, 21 Oct: "cut the black space": the bar is only as wide as its buttons, whole inside the window.
  ok(`${tag}: the bar is only as wide as its buttons`, bar.r.width <= bar.content + 16 && bar.r.left >= 10 && bar.r.right <= 380, bar)
  // The passage owns the selection (lab.css .owns-text-selection: -webkit-touch-callout none); iOS draws no menu of its own.
  ok(`${tag}: no native callout or selection under the bar`, bar.owns && (bar.callout === 'none' || bar.callout === null) && bar.native === '', bar)
  shots.push(await shot(page, `${tag}-bar`))
  // The ••• menu: compact, whole on screen, below the bar here and above it for a selection low on the page.
  const moreBox = async () => {
    await page.getByTestId('lab-pbar-more').click()
    await page.getByTestId('lab-phone-more').waitFor()
    await page.waitForTimeout(120)
    return page.evaluate(() => {
      const m = document.querySelector('[data-testid="lab-phone-more"]').getBoundingClientRect(), b = document.querySelector('[data-testid="lab-phone-bar"]').getBoundingClientRect()
      const rows = [...document.querySelectorAll('[data-testid="lab-phone-more"] button')]
      const widest = Math.max(...rows.map(r => { const range = document.createRange(); range.selectNodeContents(r); return range.getBoundingClientRect().width }))
      return { m: [m.left, m.top, m.right, m.bottom].map(Math.round), bar: [b.top, b.bottom].map(Math.round), w: Math.round(m.width), widest: Math.round(widest), names: rows.map(r => r.textContent), below: m.top >= b.bottom }
    })
  }
  let more = await moreBox()
  const whole = box => box.m[0] >= 0 && box.m[1] >= 0 && box.m[2] <= 390 && box.m[3] <= 844
  ok(`${tag}: ••• is compact (${more.w}px for ${more.widest}px of name) and whole on screen`, whole(more) && more.w <= more.widest + 40 && more.names.join('|') === 'Define|Fact-check|Counterpoint|Quiz me|Copy', more)
  shots.push(await shot(page, `${tag}-more`))
  await tapOutside(page)
  await select(page, 150, 156).catch(() => select(page, 120, 126))
  more = await moreBox()
  ok(`${tag}: ••• for a selection low on the page is still whole on screen (${more.below ? 'below' : 'above'} the bar)`, whole(more) && (more.below || more.m[3] <= more.bar[0]), more)
  shots.push(await shot(page, `${tag}-more-low`))
  await tapOutside(page)
  ok(`${tag}: a tap outside puts the bar away`, (await page.getByTestId('lab-phone-bar').count()) === 0)
  await check('the bar')

  // 3. Each action opens its card.
  const action = async (open, kind, label, closeBy = 'outside') => {
    await select(page)
    await open()
    await page.getByTestId('lab-phone-card').waitFor()
    await page.waitForTimeout(700)
    const card = await cardOf(page)
    ok(`${tag}: ${label} opens its card (${card.label})`, card.count === 1 && card.kind === kind && card.label?.startsWith(label) && !card.popup && card.bottom >= 840, card)
    const look = await page.evaluate(() => ({
      quote: document.querySelectorAll('[data-testid="lab-phone-card-quote"], .lab-pcard-quote').length,
      underlined: [...document.querySelectorAll('[data-testid="lab-page-wrap"] .is-card-passage')].map(w => getComputedStyle(w).textDecorationLine),
      scrim: (() => { const s = document.querySelector('[data-testid="lab-phone-card-scrim"]'); return s ? getComputedStyle(s).backgroundColor : null })(),
      focused: document.activeElement?.tagName === 'TEXTAREA',
    }))
    ok(`${tag}: ${label}: no quote in the card, the passage underlined on the page (${look.underlined.length} words), the page dimmed, no field focused`,
      look.quote === 0 && look.underlined.length > 0 && look.underlined.every(line => line.includes('underline')) && !!look.scrim && look.scrim !== 'rgba(0, 0, 0, 0)' && !look.focused, look)
    return card
  }
  const close1 = async (how, label) => {
    if (how === 'drag') await dragDown(page); else await tapOutside(page)
    const gone = await page.getByTestId('lab-phone-card').count()
    ok(`${tag}: ${label} closes on ${how === 'drag' ? 'a drag down' : 'a tap outside'}`, gone === 0)
    await check(`${label} opened and closed`)
  }
  let card = await action(() => page.getByTestId('lab-pbar-explain').click(), 'explain', 'Explain')
  // The answer streams in; read the card once it has arrived and the card has slid up.
  await page.getByTestId('lab-phone-card-answer').waitFor()
  await page.waitForTimeout(400)
  card = await cardOf(page)
  ok(`${tag}: the Explain card streams the answer, its lead sentence bold`, card.text.includes('MOCK lead sentence') && card.lead === 'MOCK lead sentence of the answer.' && /Ask a follow-up/.test(await page.getByTestId('lab-phone-card-input').getAttribute('placeholder')), card)
  shots.push(await shot(page, `${tag}-explain`))
  const explainShape = await shapeOf(page)
  ok(`${tag}: the Explain card is as tall as its content (${explainShape?.share}% of the screen, ${explainShape?.gap}px to its field) and its field has mic, Talk and send`,
    !!explainShape && explainShape.share <= 70 && explainShape.gap !== null && explainShape.gap <= 24 && followRow(explainShape), explainShape)
  // A follow-up in the card: the chat's question, answered in the card.
  await page.getByTestId('lab-phone-card-input').fill('Why here?')
  await page.getByTestId('lab-phone-card-send').click()
  await page.getByTestId('lab-phone-card-question').waitFor()
  await page.waitForTimeout(600)
  card = await cardOf(page)
  ok(`${tag}: a follow-up is answered in the card`, card.text.includes('Why here?') && /MOCK reply/.test(card.text), card)
  await close1('outside', 'Explain')
  card = await action(() => page.getByTestId('lab-pbar-simplify').click(), 'simplify', 'Simplify')
  ok(`${tag}: Simplify asks the simplify route`, log.ai.some(a => a.intent === 'simplify') && card.text.includes('MOCK simplify'), card)
  await close1('drag', 'Simplify')
  for (const [id, kind, label, intent] of [['define', 'define', 'Define', 'define'], ['factcheck', 'factcheck', 'Fact-check', 'factcheck'], ['counterpoint', 'counterpoint', 'Counterpoint', 'counterpoint'], ['quiz', 'quiz', 'Quiz me', 'quiz']]) {
    card = await action(async () => { await page.getByTestId('lab-pbar-more').click(); await page.getByTestId(`lab-pmore-${id}`).click() }, kind, label)
    ok(`${tag}: ${label} asks the ${intent} route with the passage`, log.ai.some(a => a.intent === intent && a.selection), log.ai.slice(-2))
    if (kind === 'quiz') {
      ok(`${tag}: Quiz me shows its first question`, /1 of 3/.test(card.text) && /MOCK question 1/.test(card.text), card)
      await page.getByTestId('lab-phone-card-input').fill('Something')
      await page.getByTestId('lab-phone-card-send').click()
      await page.getByTestId('lab-phone-quiz-next').waitFor()
      ok(`${tag}: a quiz answer is marked on the quiz_check route`, log.ai.some(a => a.intent === 'quiz_check' && a.quiz) && /Right\./.test((await cardOf(page)).text), (await cardOf(page)).text)
    }
    if (kind === 'define') shots.push(await shot(page, `${tag}-define`))
    await close1('outside', label)
  }

  // 4. Ask: a card like the others, its field visible and not focused (no cursor, no keyboard) until tapped.
  card = await action(() => page.getByTestId('lab-pbar-ask').click(), 'ask', 'Ask')
  const field = await page.evaluate(() => { const f = document.querySelector('[data-testid="lab-phone-card-input"]'); const r = f.getBoundingClientRect(); return { focused: document.activeElement === f, visible: r.height > 10 && r.bottom <= innerHeight && r.top > 0, placeholder: f.placeholder } })
  ok(`${tag}: Ask's field is visible and not focused`, !field.focused && field.visible, { field, card })
  shots.push(await shot(page, `${tag}-ask`))
  await page.getByTestId('lab-phone-card-input').click()
  // The keyboard comes up: the card fits the visible window above it, the field and the title row in view.
  await page.evaluate(() => window.__keyboard(336))
  await page.waitForTimeout(400)
  const fits = await page.evaluate(() => {
    const vv = window.visualViewport, c = document.querySelector('[data-testid="lab-phone-card"]').getBoundingClientRect(), f = document.querySelector('[data-testid="lab-phone-card-input"]').getBoundingClientRect()
    const label = document.querySelector('[data-testid="lab-phone-card-label"]').getBoundingClientRect()
    return { vv: [vv.offsetTop, vv.height].map(Math.round), card: [c.top, c.bottom].map(Math.round), field: [f.top, f.bottom].map(Math.round), label: Math.round(label.top), focused: document.activeElement?.dataset.testid }
  })
  ok(`${tag}: with the keyboard up the card fits above it (${fits.card.join('–')} in ${fits.vv[1]}px)`, fits.card[0] >= fits.vv[0] && fits.card[1] <= fits.vv[0] + fits.vv[1] + 1 && fits.field[1] <= fits.vv[0] + fits.vv[1] && fits.label >= fits.vv[0] && fits.focused === 'lab-phone-card-input', fits)
  ok(`${tag}: the card stands on the keyboard's top edge (bottom ${fits.card[1]} = offsetTop + height ${fits.vv[0] + fits.vv[1]})`, Math.abs(fits.card[1] - (fits.vv[0] + fits.vv[1])) <= 1, fits)
  // iOS pans the window to the focused field (offsetTop > 0): the card follows the visible part, not the window's bottom.
  for (const [keyboardPx, panned] of [[336, 120], [300, 260]]) {
    await page.evaluate(([k, t]) => window.__keyboard(k, t), [keyboardPx, panned])
    await page.waitForTimeout(250)
    const pan = await page.evaluate(() => {
      const vv = window.visualViewport, c = document.querySelector('[data-testid="lab-phone-card"]').getBoundingClientRect(), f = document.querySelector('[data-testid="lab-phone-card-input"]').getBoundingClientRect()
      return { vv: [vv.offsetTop, vv.height].map(Math.round), card: [c.top, c.bottom].map(Math.round), field: [f.top, f.bottom].map(Math.round), typing: document.documentElement.hasAttribute('data-pcard-typing') }
    })
    ok(`${tag}: panned ${panned}px with a ${keyboardPx}px keyboard, card and field inside the visible part (${pan.card.join('–')} in ${pan.vv[0]}–${pan.vv[0] + pan.vv[1]})`,
      Math.abs(pan.card[1] - (pan.vv[0] + pan.vv[1])) <= 1 && pan.card[0] >= pan.vv[0] && pan.field[0] >= pan.vv[0] && pan.field[1] <= pan.vv[0] + pan.vv[1] && pan.typing, pan)
    if (panned === 120) shots.push(await shot(page, `${tag}-ask-keyboard-panned`))
  }
  await page.evaluate(() => window.__keyboard(336, 0))
  await page.waitForTimeout(200)
  await page.keyboard.type('What does this mean')
  shots.push(await shot(page, `${tag}-ask-keyboard`))
  await page.getByTestId('lab-phone-card-send').click()
  await page.getByTestId('lab-phone-card-question').waitFor()
  await page.waitForTimeout(500)
  ok(`${tag}: Ask's question is answered in the card`, /MOCK reply/.test((await cardOf(page)).text))
  const latest = await page.evaluate(() => { const vv = window.visualViewport, a = [...document.querySelectorAll('[data-testid="lab-phone-card"] [data-testid="lab-phone-card-answer"]')].pop()?.getBoundingClientRect(); return a ? { top: Math.round(a.top), bottom: Math.round(a.bottom), room: Math.round(vv.height) } : null })
  ok(`${tag}: with the keyboard up the latest answer is in view`, !!latest && latest.bottom > 0 && latest.top < latest.room, latest)
  await page.evaluate(() => window.__keyboard(0))
  await close1('drag', 'Ask')

  // 5. Highlight, a note, and deleting the highlight by a tap on it.
  await select(page)
  await page.getByTestId('lab-pbar-highlight').click()
  await page.waitForTimeout(300)
  ok(`${tag}: highlighting turns the bar to its colours, note and bin`, await page.getByTestId('lab-phone-bar').getAttribute('data-state') === 'existing' && await page.getByTestId('lab-pbar-remove').count() === 1)
  await page.getByTestId('lab-pbar-note').click()
  await page.getByTestId('lab-phone-card').waitFor()
  card = await cardOf(page)
  ok(`${tag}: the note opens as a card, its field not focused until tapped`, card.kind === 'note' && !card.focused, card)
  await page.getByTestId('lab-phone-card-note').click()
  await page.keyboard.type('A note of mine')
  // A note's words are upright, while written and once saved (Anders, 20 Oct 2026); the card's label stays italic.
  const noteStyle = await page.evaluate(() => ({ field: getComputedStyle(document.querySelector('[data-testid="lab-phone-card-note"]')).fontStyle, label: getComputedStyle(document.querySelector('[data-testid="lab-phone-card-label"]')).fontStyle }))
  ok(`${tag}: the note's text is upright (roman), the label italic`, noteStyle.field === 'normal' && noteStyle.label === 'italic', noteStyle)
  shots.push(await shot(page, `${tag}-note`))
  await tapOutside(page)
  const saved = await page.evaluate(() => Object.entries(localStorage).filter(([k]) => /highlight/i.test(k)).map(([, v]) => v).join(' '))
  ok(`${tag}: the note is kept in the reader's highlights`, saved.includes('A note of mine'))
  // Once saved, opened again: still upright.
  await select(page)
  if (await page.getByTestId('lab-pbar-note').count()) {
    await page.getByTestId('lab-pbar-note').click()
    await page.getByTestId('lab-phone-card-note').waitFor()
    const again = await page.evaluate(() => { const f = document.querySelector('[data-testid="lab-phone-card-note"]'); return { value: f.value, style: getComputedStyle(f).fontStyle } })
    ok(`${tag}: the saved note reopens upright`, again.value === 'A note of mine' && again.style === 'normal', again)
    await tapOutside(page)
  }
  await check('the note card')
  // Tap the highlight: the bar with the bin; the bin removes it.
  const mark = page.locator('[data-testid="lab-page-wrap"] .lab-passage [data-highlight-id]').first()
  const mb = await mark.boundingBox()
  const tapAt = { pointerId: 13, pointerType: 'touch', isPrimary: true, bubbles: true, clientX: mb.x + Math.min(8, mb.width / 2), clientY: mb.y + mb.height / 2 }
  await mark.dispatchEvent('pointerdown', tapAt); await page.waitForTimeout(60); await mark.dispatchEvent('pointerup', tapAt)
  await page.getByTestId('lab-pbar-remove').waitFor({ timeout: 4000 })
  const remove = await page.getByTestId('lab-pbar-remove').evaluate(b => ({ text: b.textContent.trim(), label: b.getAttribute('aria-label'), icon: !!b.querySelector('svg.lab-picon'), path: b.querySelector('path')?.getAttribute('d') }))
  ok(`${tag}: removing a highlight is an icon-only ✕ in the bar's icon style`, remove.text === '' && remove.label === 'Remove highlight' && remove.icon && remove.path === 'M4.5 4.5l9 9M13.5 4.5l-9 9', remove)
  await page.getByTestId('lab-pbar-remove').click()
  await page.waitForTimeout(300)
  ok(`${tag}: a tap on a highlight offers ✕, and ✕ deletes it`, await page.locator('[data-testid="lab-page-wrap"] .lab-passage [data-highlight-id]').count() === 0)
  await check('deleting a highlight')

  // 6. Chat and Talk open as cards; the t menu is the approved design.
  await showControls(page)
  await page.getByTestId('lab-super').click()
  await page.getByTestId('lab-super-menu').waitFor()
  const menu = await page.evaluate(() => [...document.querySelectorAll('[data-testid="lab-super-menu"] .lab-super-row-label')].map(n => n.textContent))
  // The settings groups and Notebook (22 Oct 2026): the phone has no top-bar Aa or Notebook, so all are t menu rows.
  ok(`${tag}: the t menu: ${menu.join(' · ')}`, menu.join('|') === 'Chat|Talk|Summarize|Catch me up|Notebook|Aa|Book settings|Audio settings|Library|Profile', menu)
  shots.push(await shot(page, `${tag}-menu`))
  // Notebook opens the Contents' Highlights & notes list; its × goes back to the book, the place kept.
  await page.getByTestId('lab-super-row-notebook').click()
  await page.locator('[data-testid="lab-contents-v2"] .overlay-title').waitFor({ timeout: 4000 })
  ok(`${tag}: Notebook opens Highlights & notes`, await page.locator('[data-testid="lab-contents-v2"] .overlay-title').textContent() === 'Highlights & notes')
  shots.push(await shot(page, `${tag}-notebook`))
  await page.locator('[data-testid="lab-contents-v2"] [data-close]').click()
  await page.waitForTimeout(300)
  ok(`${tag}: closing Notebook returns to the book`, await page.getByTestId('lab-toc').count() === 0)
  await check('Notebook open and closed')
  for (const [row, title] of [['text', 'Aa'], ['editions', 'Book settings'], ['audio', 'Audio settings']]) {
    await showControls(page)
    await page.getByTestId('lab-super').click()
    await page.getByTestId(`lab-super-row-${row}`).click()
    await page.getByTestId('lab-v2-sheet').waitFor({ timeout: 4000 })
    ok(`${tag}: ${title} opens its sheet`, await page.getByTestId('lab-v2-sheet').getAttribute('aria-label') === title)
    shots.push(await shot(page, `${tag}-${row}`))
    await page.getByTestId('lab-v2-sheet-close').click()
    await page.waitForTimeout(300)
    await check(`${title} open and closed`)
  }
  await showControls(page)
  await page.getByTestId('lab-super').click()
  await page.getByTestId('lab-super-menu').waitFor()
  await page.getByTestId('lab-super-scrim').click()
  await page.waitForTimeout(200)
  await showControls(page)
  await page.getByTestId('lab-super').click()
  await page.getByTestId('lab-super-row-chat').click()
  await page.getByTestId('lab-phone-card').waitFor()
  await page.waitForTimeout(500)
  card = await cardOf(page)
  const chat = await page.evaluate(() => ({ pane: !!document.querySelector('[data-testid="lab-phone-card"] [data-testid="lab-ask-pane"]'), wrap: !!document.querySelector('[data-testid="lab-page-wrap"]'), back: !!document.querySelector('[data-testid="lab-ask-done"]') }))
  ok(`${tag}: Chat opens as a card with the chat's thread and composer, the page behind it`, card.kind === 'chat' && /^Chat/.test(card.label) && chat.pane && chat.wrap && !chat.back, { card, chat })
  shots.push(await shot(page, `${tag}-chat`))
  await close1('drag', 'Chat')
  await showControls(page)
  await page.getByTestId('lab-super').click()
  await page.getByTestId('lab-super-row-talk').click()
  await page.getByTestId('lab-phone-card').waitFor()
  await page.waitForTimeout(500)
  card = await cardOf(page)
  const talk = await page.evaluate(() => ({ call: !!document.querySelector('[data-testid="lab-phone-card"] .lab-call'), full: [...document.querySelectorAll('.lab-call')].some(el => !el.closest('[data-testid="lab-phone-card"]')), wrap: !!document.querySelector('[data-testid="lab-page-wrap"]') }))
  ok(`${tag}: Talk opens as a card with the voice session's own view, not full screen`, card.kind === 'talk' && /^Talk/.test(card.label) && talk.call && !talk.full && talk.wrap, { card, talk })
  await close1('outside', 'Talk')

  // 7. The pills: at a chapter's start and end, each opening its card.
  await page.evaluate(() => { const el = document.querySelector('[data-testid="lab-header-chapter"]'); el?.click() })
  await page.close().catch(() => {})
  await close(state)

  const startState = await boot(engine, `?book=${BOOK}&margin=1`, { chapterNumber: SEED.chapterNumber, paragraphIndex: 0 })
  const sp = startState.page
  const startHome = await placeOf(sp)
  const startPill = await sp.evaluate(() => {
    const el = document.querySelector('[data-testid="lab-unit-start"]'), head = el?.parentElement?.querySelector('.lab-passage-headline')
    if (!el || !head) return null
    const p = el.getBoundingClientRect(), h = head.getBoundingClientRect()
    return { text: el.textContent.replace(/\s+/g, ' ').trim(), primerChip: document.querySelectorAll('.lab-passage-header > .lab-chapter-preview').length, sameLine: p.top < h.bottom && p.bottom > h.top && p.left >= h.right - 1, starting: /Starting/.test(document.querySelector('.lab-passage-header').textContent) }
  })
  ok(`${tag}: the start pills sit on the heading's line, beside it (✧ Primer · ✧ Catch me up), no "Starting" line`, !!startPill && /^✧Primer✧Catch me up$/.test(startPill.text) && startPill.primerChip === 0 && startPill.sameLine && !startPill.starting, startPill)
  shots.push(await shot(sp, `${tag}-start-pills`))
  const pillGaps = sel => sp.evaluate(sel => {
    const pills = [...document.querySelectorAll(sel)].filter(el => el.getBoundingClientRect().height > 0)
    const spans = pills.map(el => (el.querySelector(':scope > span') || el).getBoundingClientRect())
    return { gaps: spans.slice(1).map((b, i) => Math.round(b.left - spans[i].right)), heights: pills.map(el => Math.round(el.getBoundingClientRect().height)) }
  }, sel)
  const startGaps = await pillGaps('[data-testid="lab-unit-start"] button')
  ok(`${tag}: the start pills sit 8px apart (${startGaps.gaps.join(', ')}), each 44px tall to tap`, startGaps.gaps.length >= 1 && startGaps.gaps.every(g => g <= 8.5 && g >= 7.5) && startGaps.heights.every(h => h >= 44), startGaps)
  const pillCard = async (testId, kind, label) => {
    await sp.getByTestId(testId).click()
    await sp.getByTestId('lab-phone-card').waitFor()
    await sp.waitForTimeout(600)
    const c = await cardOf(sp)
    ok(`${tag}: ${label} opens as a card (${c.label})`, c.count === 1 && c.kind.startsWith(kind), c)
    const shape = await shapeOf(sp)
    ok(`${tag}: ${label}'s card is as tall as its content (${shape?.share}% of the screen, ${shape?.gap}px to its field) and ends with the field (mic, Talk, send), no round buttons`,
      !!shape && shape.share <= 70 && shape.gap !== null && shape.gap <= 24 && followRow(shape), shape)
    shots.push(await shot(sp, `${tag}-${kind}-card`))
    await tapOutside(sp)
    const now = await placeOf(sp)
    ok(`${tag}: ${label}: closed, the place is unchanged`, (await sp.getByTestId('lab-phone-card').count()) === 0 && same(now, startHome), { now, startHome })
    return c
  }
  await pillCard('lab-unit-primer', 'chapter-notes-primer', 'Primer')
  // A follow-up from the Primer card: the chat's question, answered in the card, with the primer kept first.
  await sp.getByTestId('lab-unit-primer').click()
  await sp.getByTestId('lab-phone-card-input').waitFor()
  await sp.waitForTimeout(500)
  const asked = startState.log.ai.length
  await sp.getByTestId('lab-phone-card-input').fill('Who is Beaufort?')
  await sp.getByTestId('lab-phone-card-send').click()
  await sp.getByTestId('lab-phone-card-question').waitFor()
  await sp.waitForTimeout(600)
  const followed = await cardOf(sp)
  ok(`${tag}: a follow-up from the Primer card is answered in the card`, followed.kind === 'chapter-notes-primer' && followed.text.includes('Who is Beaufort?') && /MOCK reply/.test(followed.text) && startState.log.ai.length > asked, followed)
  shots.push(await shot(sp, `${tag}-primer-followup`))
  // Talk from the card: the voice conversation opens as its card (the session never connects here).
  await sp.getByTestId('lab-phone-card-talk').click()
  await sp.waitForTimeout(800)
  ok(`${tag}: Talk in the Primer card's field opens Talk`, (await cardOf(sp)).kind === 'talk', await cardOf(sp))
  await tapOutside(sp)
  await sp.waitForTimeout(300)
  ok(`${tag}: Primer, follow-up and Talk: the place is unchanged`, same(await placeOf(sp), startHome), await placeOf(sp))
  await pillCard('lab-unit-catchup', 'catchup', 'Catch me up')
  // Turn to the chapter's end.
  for (let i = 0; i < 60 && !(await sp.getByTestId('lab-unit-quiz').count()); i++) { await sp.keyboard.press('ArrowRight'); await sp.waitForTimeout(260) }
  await sp.waitForTimeout(600)
  const endPill = await sp.evaluate(() => { const el = document.querySelector('[data-testid="lab-chapter-end"]'); return el ? el.textContent.replace(/\s+/g, ' ').trim() : null })
  ok(`${tag}: the end pills (✧ Recap · ✧ Quiz me · Note), no "End of" label`, !!endPill && /^✧Recap✧Quiz meNote/.test(endPill), endPill)
  shots.push(await shot(sp, `${tag}-end-pills`))
  const endGaps = await pillGaps('[data-testid="lab-chapter-end"] .lab-chapter-recap, [data-testid="lab-chapter-end"] .lab-chapter-note')
  ok(`${tag}: the end pills sit 8px apart (${endGaps.gaps.join(', ')}), each 44px tall to tap`, endGaps.gaps.length >= 2 && endGaps.gaps.every(g => g <= 8.5 && g >= 7.5) && endGaps.heights.every(h => h >= 44), endGaps)
  const endHome = await placeOf(sp)
  for (const [testId, kind, label] of [['lab-unit-quiz', 'quiz', 'Quiz me (chapter)'], ['lab-chapter-note-open', 'chapter-note', 'Note (chapter)']]) {
    await sp.getByTestId(testId).click()
    await sp.getByTestId('lab-phone-card').waitFor()
    await sp.waitForTimeout(600)
    const c = await cardOf(sp)
    ok(`${tag}: ${label} opens as a card (${c.label})`, c.kind === kind, c)
    if (kind === 'quiz') ok(`${tag}: the chapter's quiz asks the quiz route without a passage`, startState.log.ai.some(a => a.intent === 'quiz' && !a.selection))
    if (kind === 'quiz') {
      for (let i = 0; i < 3; i++) { await sp.getByTestId('lab-phone-quiz-show').click(); await sp.getByTestId('lab-phone-quiz-next').click() }
      await sp.waitForTimeout(300)
      const end = await shapeOf(sp)
      ok(`${tag}: Quiz me's end ends with the field (mic, Talk, send) right under the score, Try another quiz below it, ${end?.gap}px from the score`, followRow(end) && end.gap <= 24 && (await sp.getByTestId('lab-phone-quiz-again').count()) === 1, end)
      shots.push(await shot(sp, `${tag}-quiz-end`))
    }
    await tapOutside(sp)
    const now = await placeOf(sp)
    ok(`${tag}: ${label}: closed, the place is unchanged`, same(now, endHome), { now, endHome })
  }
  await sp.locator('[data-testid="lab-chapter-end"] .lab-chapter-recap').first().click()
  await sp.getByTestId('lab-phone-card').waitFor()
  await sp.waitForTimeout(500)
  const recapShape = await shapeOf(sp)
  ok(`${tag}: Recap opens as a card as tall as its content, ending with the field`, (await cardOf(sp)).kind === 'chapter-notes-end' && recapShape.share <= 70 && recapShape.gap <= 24 && followRow(recapShape), recapShape)
  await tapOutside(sp)
  // A reload keeps the place.
  const before = await placeOf(sp)
  const address = sp.url()
  await boot(engine, null, null, startState)
  ok(`${tag}: the address is kept over the reload`, sp.url() === address, [address, sp.url()])
  const after = await placeOf(sp)
  ok(`${tag}: a reload keeps the place (${before.chapter} ${before.place})`, after.chapter === before.chapter && after.place === before.place, { before, after })
  ok(`${tag}: still in margin mode after the reload (the sticky opt-in)`, await sp.evaluate(() => !!document.querySelector('.lab.is-margin-phone')))
  ok(`${tag}: no page errors`, startState.log.errors.length === 0 && log.errors.length === 0, [...log.errors, ...startState.log.errors])
  await close(startState)

  // The book's first chapter: nothing to catch up on yet (Anders, 20 Oct 2026): ✧ Primer only, no Catch me up in the t menu.
  const firstState = await boot(engine, `?book=${BOOK}&margin=1`, { chapterNumber: 1, paragraphIndex: 0 })
  const fp = firstState.page
  const first = await fp.evaluate(() => document.querySelector('[data-testid="lab-unit-start"]')?.textContent.replace(/\s+/g, ' ').trim() ?? null)
  ok(`${tag}: the first chapter's start pill has ✧ Primer and no ✧ Catch me up ("${first}")`, first === '✧Primer', first)
  await showControls(fp)
  await fp.getByTestId('lab-super').click()
  await fp.getByTestId('lab-super-menu').waitFor()
  ok(`${tag}: the first chapter's t menu has no Catch me up`, (await fp.getByTestId('lab-super-row-catchup').count()) === 0 && (await fp.getByTestId('lab-super-row-summarize').count()) === 1)
  shots.push(await shot(fp, `${tag}-first-chapter-menu`))
  await close(firstState)
  return shots
}

/**
 * Talk in its card at 390×844 and 375×667: the orb whole inside the card and centred, the status line and the three
 * controls beneath it, all in view without scrolling; never full screen. At device scale 1: headless WebKit on Linux
 * paints a canvas at scale 2 shifted by its own size (only a quarter of the orb shows), which an iPhone does not.
 */
async function talkCard(engineName, w, h) {
  const engine = engineName === 'webkit' ? webkit : chromium
  const tag = `${BOOK}-${w}x${h}-${engineName}`
  const browser = await engine.launch()
  const context = await browser.newContext({ ...devices['iPhone 13'], viewport: { width: w, height: h }, deviceScaleFactor: 1, serviceWorkers: 'block' })
  context.__browser = browser
  const state = await boot(engine, `?book=${BOOK}&margin=1`, SEED, { context, page: await context.newPage(), log: { ai: [], notes: [], voice: [], errors: [] }, fresh: true })
  const { page } = state
  // The session never connects here; a start the browser refused closes the card, and Talk is opened again.
  let fit = null
  for (let attempt = 0; attempt < 3 && !fit; attempt++) {
    await showControls(page)
    await page.getByTestId('lab-super').click()
    await page.getByTestId('lab-super-row-talk').click()
    await page.getByTestId('lab-phone-card').waitFor()
    await page.waitForTimeout(600)
    fit = await page.evaluate(() => {
    if (!document.querySelector('[data-testid="lab-phone-card"] .lab-call-circle')) return null
    const card = document.querySelector('[data-testid="lab-phone-card"]').getBoundingClientRect()
    const orb = document.querySelector('[data-testid="lab-phone-card"] .lab-call-circle').getBoundingClientRect()
    const status = document.querySelector('[data-testid="lab-phone-card"] .lab-call-status').getBoundingClientRect()
    const controls = [...document.querySelectorAll('[data-testid="lab-phone-card"] .lab-call-controls button')].map(b => b.getBoundingClientRect())
    const body = document.querySelector('[data-testid="lab-phone-card-body"]')
    return {
      card: [card.left, card.top, card.right, card.bottom].map(Math.round), orb: [orb.left, orb.top, orb.right, orb.bottom].map(Math.round),
      offCentre: Math.round(Math.abs((orb.left + orb.right) / 2 - (card.left + card.right) / 2)),
      statusBelow: status.top >= orb.bottom - 1 && status.bottom <= card.bottom, controls: controls.length,
      controlsIn: controls.every(r => r.top >= status.bottom - 1 && r.bottom <= card.bottom && r.top >= card.top),
      scrolls: body.scrollHeight > body.clientHeight + 1, share: Math.round(card.height / innerHeight * 100),
    }
  })
  }
  if (!fit) { ok(`${tag}: Talk opens as a card`, false); await close(state); return null }
  ok(`${tag}: Talk's orb lies whole inside the card, centred (${fit.orb[2] - fit.orb[0]}px)`, fit.orb[0] >= fit.card[0] && fit.orb[1] >= fit.card[1] && fit.orb[2] <= fit.card[2] && fit.orb[3] <= fit.card[3] && fit.offCentre <= 4 && fit.orb[2] - fit.orb[0] >= 64, fit)
  ok(`${tag}: the status line and the ${fit.controls} controls sit beneath the orb, in view, nothing scrolls; the card ${fit.share}% of the screen`, fit.statusBelow && fit.controls === 3 && fit.controlsIn && !fit.scrolls && fit.share <= 62, fit)
  const path = join(OUT, `${tag}-talk.png`)
  await page.screenshot({ path })
  await close(state)
  return path
}

/**
 * The normal phone reader (not margin mode): Primer and Catch me up are sheets, as tall as what they hold, ending with
 * the same follow-up field (mic, Talk, send) in place of the round Chat, Talk and Copy buttons.
 */
async function sheets(engineName) {
  const engine = engineName === 'webkit' ? webkit : chromium
  const tag = `${BOOK}-390x844-${engineName}-sheet`
  const state = await boot(engine, `?book=${BOOK}`)
  const { page } = state
  const home = await placeOf(page)
  const shots = []
  for (const [label, open] of [
    ['Primer', () => page.locator('.lab-passage-header .lab-chapter-preview').first().click()],
    ['Catch me up', async () => { await showControls(page); await page.getByTestId('lab-super').click(); await page.getByTestId('lab-super-row-catchup').click() }],
  ]) {
    await open()
    await page.waitForSelector('.lab-v2-sheet.lab-catch-up')
    await page.waitForTimeout(900)
    const shape = await shapeOf(page, '.lab-v2-sheet.lab-catch-up')
    ok(`${tag}: the ${label} sheet is as tall as what it holds (${shape?.height}px, ${shape?.gap}px to its field) and ends with the field (mic, Talk, send), no round buttons`,
      !!shape && shape.gap !== null && shape.gap <= 24 && shape.height < 452 && followRow(shape), shape)
    shots.push(await shot(page, `${tag}-${label.replace(/\s+/g, '-').toLowerCase()}`))
    await page.keyboard.press('Escape')
    await page.waitForTimeout(400)
    ok(`${tag}: ${label} closed, the place is unchanged`, same(await placeOf(page), home), await placeOf(page))
  }
  await close(state)
  return shots
}

/**
 * Narration playing (mocked, silent) and a card's field focused: the narration bar is hidden while the field has the
 * focus and comes back after; and with innerHeight itself shrunk to the visible part (as iOS may report it), the card
 * still stands on the visible bottom.
 */
async function narrationTyping(engineName) {
  const engine = engineName === 'webkit' ? webkit : chromium
  const tag = `${BOOK}-390x844-${engineName}`
  const bundled = await build({ stdin: { contents: "export { chunkNarrationText, narrationTextForParagraph, sha256Hex } from './src/narration/narrationCore'", resolveDir: process.cwd() }, bundle: true, platform: 'node', format: 'esm', write: false })
  const { chunkNarrationText, narrationTextForParagraph, sha256Hex } = await import('data:text/javascript;base64,' + Buffer.from(bundled.outputFiles[0].text).toString('base64'))
  const edition = JSON.parse(readFileSync(`public/data/editions/${BOOK}-modern-en.json`, 'utf8'))
  const browser = await engine.launch()
  const context = await browser.newContext({ ...devices['iPhone 13'], viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, serviceWorkers: 'block' })
  context.__browser = browser
  await context.addInitScript(() => {
    class SilentAudio extends EventTarget {
      src = ''; currentTime = 0; duration = 30; paused = true; ended = false; playbackRate = 1; autoplay = false; muted = true
      constructor() { super(); window.__audio = this }
      play() { this.paused = false; this.ended = false; queueMicrotask(() => this.dispatchEvent(new Event('playing'))); return Promise.resolve() }
      pause() { this.paused = true; queueMicrotask(() => this.dispatchEvent(new Event('pause'))) }
      load() {}
      setAttribute() {}
      removeAttribute(name) { if (name === 'src') this.src = '' }
    }
    window.Audio = SilentAudio
  })
  const page = await context.newPage()
  await page.route('**/api/narration/**', async route => {
    const url = new URL(route.request().url())
    if (url.pathname === '/api/narration/voices') return route.fulfill({ json: { enabled: true, provider: 'grok', voices: [{ key: 'f', label: 'Ara', persona: 'female', cacheIdentity: 'a'.repeat(64) }] } })
    if (url.pathname !== '/api/narration/ensure') return route.fulfill({ status: 404, body: '{}' })
    const body = route.request().postDataJSON()
    const chapter = edition.chapters.find(c => c.number === body.chapter) ?? edition.chapters[body.chapter - 1]
    const paragraphs = await Promise.all(body.paragraphs.map(async item => {
      const text = chapter?.paragraphs[item.index]
      if (typeof text !== 'string') return { paragraph: item.index, status: 'failed', reason: 'unknown_paragraph' }
      const tokens = narrationTextForParagraph(text).split(' ')
      const chunks = chunkNarrationText(text).map(c => {
        const words = tokens.slice(c.wordFrom, c.wordTo).map((word, i) => ({ text: word, start: i * 0.3, end: i * 0.3 + 0.28 }))
        return { ...c, ready: true, duration: words.length * 0.3, hash: 'b'.repeat(64), timingsUsable: true, url: '/api/audio-file?fixture=' + body.chapter + '-' + item.index + '-' + c.index, words }
      })
      return { paragraph: item.index, status: 'ready', textHash: await sha256Hex(narrationTextForParagraph(text)), chunkCount: chunks.length, readyChunks: chunks.length, chunks, duration: chunks.reduce((n, c) => n + c.duration, 0), timingsUsable: true }
    }))
    return route.fulfill({ json: { paragraphs, generated: 0 } })
  })
  const state = await boot(engine, `?book=${BOOK}&margin=1`, SEED, { context, page, log: { ai: [], notes: [], voice: [], errors: [] }, fresh: true })
  await page.getByTestId('lab-v2-play').click()
  await page.waitForFunction(() => document.querySelector('[data-testid="lab-root"]')?.dataset.transport === 'open', null, { timeout: 20000 })
  await page.waitForTimeout(600)
  const home = await placeOf(page)
  const barShown = () => page.evaluate(() => { const bar = document.querySelector('footer.lab-phone-bar'); return bar ? getComputedStyle(bar).visibility : null })
  ok(`${tag}: narration plays with its bar (${await barShown()})`, (await barShown()) === 'visible')
  await page.getByTestId('lab-unit-primer').click()
  await page.getByTestId('lab-phone-card-input').waitFor()
  await page.waitForTimeout(500)
  await page.getByTestId('lab-phone-card-input').click()
  await page.evaluate(() => window.__keyboard(336, 0))
  await page.waitForTimeout(300)
  ok(`${tag}: the narration bar is hidden while the card's field has the focus`, (await barShown()) === 'hidden', await barShown())
  shots_narration.push(await shot(page, `${tag}-narration-typing`))
  // iOS may report innerHeight already shrunk to the visible part.
  await page.setViewportSize({ width: 390, height: 508 })
  await page.evaluate(() => window.__keyboard(0, 0))
  await page.waitForTimeout(500)
  const shrunk = await page.evaluate(() => { const c = document.querySelector('[data-testid="lab-phone-card"]').getBoundingClientRect(), f = document.querySelector('[data-testid="lab-phone-card-input"]').getBoundingClientRect(); return { inner: innerHeight, card: [c.top, c.bottom].map(Math.round), field: [f.top, f.bottom].map(Math.round), keyboard: document.querySelector('[data-testid="lab-phone-card"]').hasAttribute('data-keyboard') } })
  ok(`${tag}: with innerHeight shrunk to ${shrunk.inner}px the card still stands on the visible bottom, its field in view`, Math.abs(shrunk.card[1] - shrunk.inner) <= 1 && shrunk.field[1] <= shrunk.inner && shrunk.card[0] >= 0 && shrunk.keyboard, shrunk)
  await page.setViewportSize({ width: 390, height: 844 })
  await page.waitForTimeout(400)
  await page.evaluate(() => document.activeElement?.blur())
  await page.waitForTimeout(300)
  ok(`${tag}: the narration bar is back once the field lets go`, (await barShown()) === 'visible', await barShown())
  await tapOutside(page)
  ok(`${tag}: narration, a card typed in and closed: the place is unchanged`, same(await placeOf(page), home), { now: await placeOf(page), home })
  ok(`${tag}: no page errors (narration)`, state.log.errors.length === 0, state.log.errors)
  await close(state)
}
const shots_narration = []

const all = []
for (const engine of ENGINES) {
  try { all.push(...await run(engine)) } catch (error) { ok(`${engine}: run`, false, String(error?.stack || error).slice(0, 1200)) }
  try { all.push(...await sheets(engine)) } catch (error) { ok(`${engine}: sheets`, false, String(error?.stack || error).slice(0, 1200)) }
  try { await narrationTyping(engine); all.push(...shots_narration.splice(0)) } catch (error) { ok(`${engine}: narration typing`, false, String(error?.stack || error).slice(0, 1200)) }
  for (const [w, h] of [[390, 844], [375, 667]]) {
    try { const path = await talkCard(engine, w, h); if (path) all.push(path) } catch (error) { ok(`${engine} ${w}x${h}: Talk`, false, String(error?.stack || error).slice(0, 1200)) }
  }
}
console.log(all.map(p => 'shot ' + p).join('\n'))
console.log(failures ? `${failures} failure(s)` : 'all ok')
process.exit(failures ? 1 : 0)
