#!/usr/bin/env node
// The phone's margin mode (/reader?book=<id>&margin=1 on a phone, src/lab/marginPhone/): today's phone reader with
// the dark selection bar, bottom cards in place of every pop-up, and the chapter pills. Nothing else changes.
// At 390×844 in WebKit and Chromium, both with an iPhone's agent and touch, against a local dev server
// (`npx vite --port 4811`), every AI route and the account mocked:
//
//   PREVIEW_ORIGIN=http://127.0.0.1:4811 node scripts/check-phone-cards.mjs
//
// Checks: the top bar is the normal reader's (DOM and pixels); a selection shows the dark bar and no native callout;
// each action opens its card (Explain, Simplify, Define, Fact-check, Counterpoint, Quiz me, Ask with a focused field,
// a note); Chat and Talk open as cards; the start and end pills are there and open their cards; the place is
// unchanged after each card opens and closes; a reload keeps the place. Screenshots go to OUT.
import { chromium, webkit, devices } from 'playwright'
import { mkdirSync } from 'node:fs'
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
  const context = keep?.context ?? await engine.launch().then(browser => browser.newContext({ ...devices['iPhone 13'], viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, serviceWorkers: 'block' }).then(c => { c.__browser = browser; return c }))
  const log = keep?.log ?? { ai: [], notes: [], voice: [], errors: [] }
  if (!keep) {
    await mock(context, log)
    await context.addInitScript(({ bookId, seed }) => {
      localStorage.setItem('tinct:wipe-v1-done', '1')
      if (!localStorage.getItem('tinct-lab-prefs')) localStorage.setItem('tinct-lab-prefs', JSON.stringify({ primaryEdition: 'modern-en', compareEdition: 'original-en', compareOpen: false, voicePersona: 'female', voicePersonaChosen: true }))
      if (!sessionStorage.getItem('qa:booted')) {
        sessionStorage.setItem('qa:booted', '1')
        sessionStorage.setItem('tinct:lab-reader-handoff', JSON.stringify({ kind: 'open-reader', bookId, primaryEditionKey: 'modern-en', savedPlace: { bookId, chapterNumber: seed.chapterNumber, paragraphIndex: seed.paragraphIndex, wordIndex: 0, page: 0 } }))
      }
      HTMLMediaElement.prototype.play = async function () { this.muted = true }
      const silent = async () => { const ctx = new (window.AudioContext || window.webkitAudioContext)(); return ctx.createMediaStreamDestination().stream }
      if (navigator.mediaDevices) Object.defineProperty(navigator.mediaDevices, 'getUserMedia', { configurable: true, value: silent })
      window.__copied = []
      Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: async text => { window.__copied.push(text) } } })
    }, { bookId: BOOK, seed })
  }
  const page = keep?.page ?? await context.newPage()
  if (!keep) {
    page.setDefaultTimeout(15000)
    page.on('pageerror', e => log.errors.push(e.message))
  }
  if (keep && search === null) await page.reload({ waitUntil: 'domcontentloaded' })
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
  const walk = el => [el.tagName, el.className && String(el.className), el.getAttribute('aria-label'), el.getAttribute('data-testid'), ...[...el.childNodes].map(n => n.nodeType === 3 ? n.textContent.trim() : n.nodeType === 1 ? walk(n) : '')]
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
  const bar = await page.evaluate(() => {
    const bar = document.querySelector('[data-testid="lab-phone-bar"]')
    const word = document.querySelector('.lab-passage .lab-hearing-word.is-selecting')
    const s = getComputedStyle(bar), w = word ? getComputedStyle(word) : null
    return {
      items: [...bar.querySelectorAll('button')].map(b => b.textContent.trim() || b.getAttribute('aria-label')),
      bg: s.backgroundColor, owns: !!word?.closest('.lab-passage.owns-text-selection'),
      callout: w ? (w.webkitTouchCallout || w.getPropertyValue('-webkit-touch-callout') || null) : null,
      native: String(getSelection()?.toString() || ''), popup: !!document.querySelector('.selection-popup'), r: bar.getBoundingClientRect().toJSON(),
    }
  })
  ok(`${tag}: a selection shows the dark bar (Ask · Explain · Simplify · ••• · highlight · note), not the old popup`, bar.items.join('|') === 'Ask|Explain|Simplify|More|' + bar.items[4] + '|Add note' && /^Highlight in /.test(bar.items[4]) && !bar.popup && /rgb\(29, 26, 23\)/.test(bar.bg), bar)
  // The passage owns the selection (lab.css .owns-text-selection: -webkit-touch-callout none); iOS draws no menu of its own.
  ok(`${tag}: no native callout or selection under the bar`, bar.owns && (bar.callout === 'none' || bar.callout === null) && bar.native === '', bar)
  shots.push(await shot(page, `${tag}-bar`))
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
    return card
  }
  const close1 = async (how, label) => {
    if (how === 'drag') await dragDown(page); else await tapOutside(page)
    const gone = await page.getByTestId('lab-phone-card').count()
    ok(`${tag}: ${label} closes on ${how === 'drag' ? 'a drag down' : 'a tap outside'}`, gone === 0)
    await check(`${label} opened and closed`)
  }
  let card = await action(() => page.getByTestId('lab-pbar-explain').click(), 'explain', 'Explain')
  ok(`${tag}: the Explain card streams the answer, its lead sentence bold`, card.text.includes('MOCK lead sentence') && card.lead === 'MOCK lead sentence of the answer.' && /Ask a follow-up/.test(await page.getByTestId('lab-phone-card-input').getAttribute('placeholder')), card)
  shots.push(await shot(page, `${tag}-explain`))
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

  // 4. Ask: the card with the passage quoted and its field focused (the keyboard's field).
  card = await action(() => page.getByTestId('lab-pbar-ask').click(), 'ask', 'Ask')
  const field = await page.evaluate(() => { const f = document.querySelector('[data-testid="lab-phone-card-input"]'); const r = f.getBoundingClientRect(); return { focused: document.activeElement === f, visible: r.height > 10 && r.bottom <= innerHeight && r.top > 0, placeholder: f.placeholder } })
  ok(`${tag}: Ask's card quotes the passage and its field is visible and focused`, field.focused && field.visible && !!card.text && (await page.getByTestId('lab-phone-card-quote').count()) === 1, { field, card })
  await page.keyboard.type('What does this mean')
  shots.push(await shot(page, `${tag}-ask`))
  await page.getByTestId('lab-phone-card-send').click()
  await page.getByTestId('lab-phone-card-question').waitFor()
  await page.waitForTimeout(500)
  ok(`${tag}: Ask's question is answered in the card`, /MOCK reply/.test((await cardOf(page)).text))
  await close1('drag', 'Ask')

  // 5. Highlight, a note, and deleting the highlight by a tap on it.
  await select(page)
  await page.getByTestId('lab-pbar-highlight').click()
  await page.waitForTimeout(300)
  ok(`${tag}: highlighting turns the bar to its colours, note and bin`, await page.getByTestId('lab-phone-bar').getAttribute('data-state') === 'existing' && await page.getByTestId('lab-pbar-remove').count() === 1)
  await page.getByTestId('lab-pbar-note').click()
  await page.getByTestId('lab-phone-card').waitFor()
  card = await cardOf(page)
  ok(`${tag}: the note opens as a card, its field focused`, card.kind === 'note' && card.focused === 'TEXTAREA:lab-phone-card-note', card)
  await page.keyboard.type('A note of mine')
  shots.push(await shot(page, `${tag}-note`))
  await tapOutside(page)
  const saved = await page.evaluate(() => Object.entries(localStorage).filter(([k]) => /highlight/i.test(k)).map(([, v]) => v).join(' '))
  ok(`${tag}: the note is kept in the reader's highlights`, saved.includes('A note of mine'))
  await check('the note card')
  // Tap the highlight: the bar with the bin; the bin removes it.
  const mark = page.locator('[data-testid="lab-page-wrap"] .lab-passage [data-highlight-id]').first()
  const mb = await mark.boundingBox()
  const tapAt = { pointerId: 13, pointerType: 'touch', isPrimary: true, bubbles: true, clientX: mb.x + Math.min(8, mb.width / 2), clientY: mb.y + mb.height / 2 }
  await mark.dispatchEvent('pointerdown', tapAt); await page.waitForTimeout(60); await mark.dispatchEvent('pointerup', tapAt)
  await page.getByTestId('lab-pbar-remove').waitFor({ timeout: 4000 })
  await page.getByTestId('lab-pbar-remove').click()
  await page.waitForTimeout(300)
  ok(`${tag}: a tap on a highlight offers the bin, and the bin deletes it`, await page.locator('[data-testid="lab-page-wrap"] .lab-passage [data-highlight-id]').count() === 0)
  await check('deleting a highlight')

  // 6. Chat and Talk open as cards.
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
  shots.push(await shot(page, `${tag}-talk`))
  await close1('outside', 'Talk')

  // 7. The pills: at a chapter's start and end, each opening its card.
  await page.evaluate(() => { const el = document.querySelector('[data-testid="lab-header-chapter"]'); el?.click() })
  await page.close().catch(() => {})
  await close(state)

  const startState = await boot(engine, `?book=${BOOK}&margin=1`, { chapterNumber: SEED.chapterNumber, paragraphIndex: 0 })
  const sp = startState.page
  const startHome = await placeOf(sp)
  const startPill = await sp.evaluate(() => { const el = document.querySelector('[data-testid="lab-unit-start"]'); return el ? { text: el.textContent.replace(/\s+/g, ' ').trim(), primerChip: document.querySelectorAll('.lab-passage-header > .lab-chapter-preview').length } : null })
  ok(`${tag}: the start pill sits below the heading ("Starting …" · ✧ Primer · ✧ Catch me up), in place of the Primer chip`, !!startPill && /^Starting .+✧Primer✧Catch me up$/.test(startPill.text) && startPill.primerChip === 0, startPill)
  shots.push(await shot(sp, `${tag}-start-pills`))
  const pillCard = async (testId, kind, label) => {
    await sp.getByTestId(testId).click()
    await sp.getByTestId('lab-phone-card').waitFor()
    await sp.waitForTimeout(600)
    const c = await cardOf(sp)
    ok(`${tag}: ${label} opens as a card (${c.label})`, c.count === 1 && c.kind.startsWith(kind), c)
    await tapOutside(sp)
    const now = await placeOf(sp)
    ok(`${tag}: ${label}: closed, the place is unchanged`, (await sp.getByTestId('lab-phone-card').count()) === 0 && same(now, startHome), { now, startHome })
    return c
  }
  await pillCard('lab-unit-primer', 'chapter-notes-primer', 'Primer')
  await pillCard('lab-unit-catchup', 'catchup', 'Catch me up')
  // Turn to the chapter's end.
  for (let i = 0; i < 60 && !(await sp.getByTestId('lab-unit-end').count()); i++) { await sp.keyboard.press('ArrowRight'); await sp.waitForTimeout(260) }
  await sp.waitForTimeout(600)
  const endPill = await sp.evaluate(() => { const el = document.querySelector('[data-testid="lab-chapter-end"]'); return el ? el.textContent.replace(/\s+/g, ' ').trim() : null })
  ok(`${tag}: the end pill ("End of …" · ✧ Recap · ✧ Quiz me · Note)`, !!endPill && /^End of .+✧Recap✧Quiz meNote/.test(endPill), endPill)
  shots.push(await shot(sp, `${tag}-end-pills`))
  const endHome = await placeOf(sp)
  for (const [testId, kind, label] of [['lab-unit-quiz', 'quiz', 'Quiz me (chapter)'], ['lab-chapter-note-open', 'chapter-note', 'Note (chapter)']]) {
    await sp.getByTestId(testId).click()
    await sp.getByTestId('lab-phone-card').waitFor()
    await sp.waitForTimeout(600)
    const c = await cardOf(sp)
    ok(`${tag}: ${label} opens as a card (${c.label})`, c.kind === kind, c)
    if (kind === 'quiz') ok(`${tag}: the chapter's quiz asks the quiz route without a passage`, startState.log.ai.some(a => a.intent === 'quiz' && !a.selection))
    await tapOutside(sp)
    const now = await placeOf(sp)
    ok(`${tag}: ${label}: closed, the place is unchanged`, same(now, endHome), { now, endHome })
  }
  await sp.locator('[data-testid="lab-chapter-end"] .lab-chapter-recap').first().click()
  await sp.getByTestId('lab-phone-card').waitFor()
  ok(`${tag}: Recap opens as a card`, (await cardOf(sp)).kind === 'chapter-notes-end')
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
  return shots
}

const all = []
for (const engine of ENGINES) {
  try { all.push(...await run(engine)) } catch (error) { ok(`${engine}: run`, false, String(error?.stack || error).slice(0, 1200)) }
}
console.log(all.map(p => 'shot ' + p).join('\n'))
console.log(failures ? `${failures} failure(s)` : 'all ok')
process.exit(failures ? 1 : 0)
