#!/usr/bin/env node
// Notes: formatting and moving (Anders, 13 Nov 2026). Bullets nested by Tab, bold and italic, typed live in the note
// field and kept as Markdown in the note; on the desktop a note's card is dragged by its ⋮⋮ handle to any height in
// the margin and stays there, kept relative to the paragraph beside it; the phone shows the formatting and has no move
// control.
//
//   (cd app && VITE_SHARED_READER_DEFAULT=1 npx vite --port 5260) &
//   ORIGIN=http://127.0.0.1:5260 node app/scripts/check-note-formatting.mjs
//
// Chromium and WebKit (ENGINES=chromium,webkit), headless, audio muted, service workers blocked, every /api call
// answered locally (no AI call, no account). Checks, per engine:
//   desktop 1440×900: a note typed in the blank margin as a three-level list with bold and italic is stored as
//   Markdown and shows formatted after a reload; dragged by its handle it stays where it was dropped, after a reload
//   too; with a larger text size it is still beside the same words; ⌥↓ nudges it; the reading place is unchanged;
//   phone 390×844: a formatted note opens formatted, with the B / I / • row while it is written, and no move control.
// Screenshots go to OUT (default artifacts/note-formatting).
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium, webkit, devices } from 'playwright'

const here = path.dirname(fileURLToPath(import.meta.url))
const ORIGIN = process.env.ORIGIN || 'http://127.0.0.1:5260'
const OUT = path.resolve(process.env.OUT || path.join(here, '..', 'artifacts', 'note-formatting'))
const ENGINES = (process.env.ENGINES || 'chromium,webkit').split(',').map(name => name.trim()).filter(Boolean)
await fs.mkdir(OUT, { recursive: true })
const DESK_URL = `${ORIGIN}/reader?book=frankenstein&chapter=2&paragraph=3&word=4&sharedReader=1&layout=desktop&view=margin`
const PHONE_URL = `${ORIGIN}/reader?book=frankenstein&chapter=2&sharedReader=1&layout=phone`

let failures = 0
const ok = (label, pass, detail) => { if (!pass) failures++; console.log(`${pass ? 'ok  ' : 'FAIL'} ${label}${!pass && detail !== undefined ? ' ' + JSON.stringify(detail).slice(0, 800) : ''}`) }

async function isolate(context) {
  await context.route('**/*', route => {
    const url = new URL(route.request().url())
    if (url.origin !== new URL(ORIGIN).origin) return route.abort()
    if (url.pathname.startsWith('/api/')) return route.fulfill({ status: 404, contentType: 'application/json', body: '{"error":"local check"}' })
    return route.continue()
  })
  await context.addInitScript(() => {
    localStorage.setItem('tinct:wipe-v1-done', '1')
    if (!localStorage.getItem('tinct-lab-prefs')) localStorage.setItem('tinct-lab-prefs', JSON.stringify({ theme: 'dark' }))
    try { Object.defineProperty(navigator.mediaDevices || {}, 'getUserMedia', { configurable: true, value: async () => { throw Error('no microphone in checks') } }) } catch { /* none */ }
  })
}
const ready = async page => {
  await page.waitForFunction(() => document.querySelector('.lab')?.dataset.readerReady === 'true', null, { timeout: 90000 })
  await page.evaluate(() => document.fonts.ready)
  await page.waitForTimeout(1200)
}
const stored = page => page.evaluate(() => JSON.parse(localStorage.getItem('tinct-lab-highlights') || '[]').filter(h => h.note))
const place = page => page.evaluate(() => { const r = document.querySelector('[data-testid="lab-root"]'); return { chapter: r?.dataset.chapter, place: r?.dataset.place } })
/** The card's top against the paragraph its place names: where it should be, and where it is. */
const placed = page => page.evaluate(() => {
  const note = JSON.parse(localStorage.getItem('tinct-lab-highlights') || '[]').find(h => h.note)
  const card = document.querySelector('.source-margin-item.is-movable')
  if (!note?.cardPlace || !card) return null
  const words = [...document.querySelectorAll(`[data-testid="lab-word"][data-paragraph-index="${note.cardPlace.paragraphIndex}"]`)]
  if (!words.length) return null
  const top = Math.min(...words.map(w => w.getBoundingClientRect().top)), bottom = Math.max(...words.map(w => w.getBoundingClientRect().bottom))
  const want = top + note.cardPlace.fraction * (bottom - top)
  // The words level with the card's top, to say what it is beside.
  const level = words.filter(w => { const r = w.getBoundingClientRect(); return r.top <= card.getBoundingClientRect().top + 30 && r.bottom >= card.getBoundingClientRect().top - 30 }).slice(0, 4).map(w => w.textContent).join(' ')
  return { want: Math.round(want), at: Math.round(card.getBoundingClientRect().top), paragraph: note.cardPlace.paragraphIndex, fraction: note.cardPlace.fraction, height: Math.round(bottom - top), level }
})

async function desktop(engine, name) {
  const browser = await engine.launch({ headless: true, ...(name === 'chromium' ? { args: ['--mute-audio'] } : {}) })
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce', serviceWorkers: 'block' })
  await isolate(context)
  const page = await context.newPage()
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  await page.goto(DESK_URL)
  await ready(page)
  const home = await place(page)
  const mod = await page.evaluate(() => (/Mac|iPhone|iPad/.test(navigator.platform) ? 'Meta' : 'Control'))
  const shot = file => page.screenshot({ path: path.join(OUT, `${name}-desktop-${file}.png`) })

  // A note in the blank margin, typed as a three-level list with bold and italic.
  const room = await page.locator('.source-margin-room').boundingBox()
  await page.mouse.click(room.x + room.width * 0.5, 260)
  const field = page.locator('.source-margin-item[data-open="true"] .tn-editor')
  await field.waitFor()
  await page.waitForTimeout(200)
  await page.keyboard.type('Walton\'s loneliness **mirrors** the creature\'s:')
  await page.keyboard.press('Enter')
  await page.keyboard.type('- both *self-educated*')
  await page.keyboard.press('Enter'); await page.keyboard.press('Tab')
  await page.keyboard.type('read alone')
  await page.keyboard.press('Enter'); await page.keyboard.press('Tab')
  await page.keyboard.press(`${mod}+b`); await page.keyboard.type('both'); await page.keyboard.press(`${mod}+b`)
  await page.keyboard.type(' want a friend')
  const toolbar = await page.locator('.source-margin-item[data-open="true"] [data-testid="note-format"]').isVisible()
  ok(`${name}: the B / I / • row shows while the note is written`, toolbar)
  await shot('1-editing')
  const expected = 'Walton\'s loneliness **mirrors** the creature\'s:\n- both *self-educated*\n  - read alone\n    - **both** want a friend'
  const typed = (await stored(page))[0]?.note
  ok(`${name}: typed Markdown is stored as Markdown`, typed === expected, typed)
  ok(`${name}: the field formats live (bold, italic, three levels)`, await field.evaluate(el => !!el.querySelector('strong') && !!el.querySelector('em') && !!el.querySelector('[data-depth="2"]')))
  await page.keyboard.press('Escape')
  await page.waitForTimeout(400)

  await page.reload(); await ready(page)
  const note = page.locator('.source-margin-item.is-movable').first()
  const shown = await note.evaluate(el => ({ strong: el.querySelector('[data-testid="source-margin-note"] strong')?.textContent, em: el.querySelector('[data-testid="source-margin-note"] em')?.textContent, depth: el.querySelectorAll('[data-testid="source-margin-note"] ul ul ul li').length }))
  ok(`${name}: after a reload the folded note shows bold, italic and three levels`, shown.strong === 'mirrors' && shown.em === 'self-educated' && shown.depth === 1, shown)
  await shot('2-folded')

  // Drag by the handle, 240 px down.
  const before = await note.boundingBox()
  await note.hover()
  const grip = note.getByTestId('source-margin-grip')
  const g = await grip.boundingBox()
  await page.mouse.move(g.x + g.width / 2, g.y + g.height / 2)
  await page.mouse.down()
  await page.mouse.move(g.x + g.width / 2, g.y + g.height / 2 + 120, { steps: 6 })
  await shot('3-dragging')
  await page.mouse.move(g.x + g.width / 2, g.y + g.height / 2 + 240, { steps: 6 })
  await page.mouse.up()
  await page.waitForTimeout(400)
  const dropped = await note.boundingBox()
  ok(`${name}: the card stays where it was dropped`, Math.abs(dropped.y - (before.y + 240)) <= 3, { before: before.y, dropped: dropped.y })
  const kept = (await stored(page))[0]?.cardPlace
  ok(`${name}: its place is kept against a paragraph`, Number.isInteger(kept?.paragraphIndex) && Number.isFinite(kept?.fraction), kept)
  await page.reload(); await ready(page)
  const reloaded = await page.locator('.source-margin-item.is-movable').first().boundingBox()
  ok(`${name}: after a reload it is still there`, Math.abs(reloaded.y - dropped.y) <= 3, { dropped: dropped.y, reloaded: reloaded.y })
  const beside = await placed(page)
  await shot('4-moved')

  // ⌥↓ nudges the focused card.
  await page.locator('.source-margin-item.is-movable').first().getByTestId('source-margin-grip').focus()
  await page.keyboard.press('Alt+ArrowDown')
  await page.waitForTimeout(300)
  const nudged = await page.locator('.source-margin-item.is-movable').first().boundingBox()
  ok(`${name}: ⌥↓ nudges the card down`, nudged.y - reloaded.y >= 20 && nudged.y - reloaded.y <= 28, { from: reloaded.y, to: nudged.y })

  // A larger text size: the card is beside the same words.
  await page.getByTestId('lab-header-aa').click()
  const slider = page.getByTestId('lab-v2-size')
  await slider.waitFor()
  await slider.evaluate(input => {
    const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set
    set.call(input, String(Math.min(Number(input.max), Number(input.value) + 4)))
    input.dispatchEvent(new Event('input', { bubbles: true })); input.dispatchEvent(new Event('change', { bubbles: true }))
  })
  await page.keyboard.press('Escape')
  await page.waitForTimeout(1200)
  const larger = await placed(page)
  ok(`${name}: with larger text the note is still beside the same paragraph`, !!larger && !!beside && larger.paragraph === beside.paragraph && Math.abs(larger.at - larger.want) <= 6 && larger.height > beside.height, { beside, larger })
  await page.locator('.source-margin-item.is-movable').first().evaluate(el => el.scrollIntoView({ block: 'center' }))
  await page.waitForTimeout(400)
  await shot('5-larger-text')
  ok(`${name}: the reading chapter is unchanged`, (await place(page)).chapter === home.chapter, { home, now: await place(page) })
  ok(`${name}: no page errors`, errors.length === 0, errors)
  await browser.close()
}

async function phone(engine, name) {
  const browser = await engine.launch({ headless: true })
  const device = name === 'webkit' ? devices['iPhone 13'] : devices['Pixel 7']
  const context = await browser.newContext({ ...device, viewport: { width: 390, height: 844 }, serviceWorkers: 'block', reducedMotion: 'reduce' })
  await isolate(context)
  const page = await context.newPage()
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  await page.goto(PHONE_URL)
  await ready(page)
  // A formatted note on the page's first words, as another device would have saved it.
  const seeded = await page.evaluate(() => {
    const words = [...document.querySelectorAll('[data-testid="lab-page-wrap"] .lab-passage [data-testid="lab-word"]')].slice(0, 4)
    const root = document.querySelector('[data-testid="lab-root"]')
    if (words.length < 4) return null
    const p = Number(words[0].dataset.paragraphIndex), from = Number(words[0].dataset.wordIndex)
    const edition = JSON.parse(localStorage.getItem('tinct-lab-prefs') || '{}').primaryEdition || root?.dataset.edition || 'modern-en'
    const now = Date.now()
    const note = { id: `hl-${now}-qanote`, bookId: 'frankenstein', editionKey: edition, chapterNumber: Number(root?.dataset.chapter) || 2, paragraphIndex: p, fromWord: from, endParagraphIndex: p, toWord: from + 4, color: 'gold', text: words.map(w => w.textContent.trim()).join(' '), note: 'Walton\'s loneliness **mirrors** the creature\'s:\n- both *self-educated*\n  - read alone', updatedAt: now }
    localStorage.setItem('tinct-lab-highlights', JSON.stringify([note]))
    return note
  })
  ok(`${name} phone: a note was saved to open`, !!seeded)
  await page.reload(); await ready(page)
  const marked = page.locator(`[data-testid="lab-page-wrap"] [data-highlight-id="${seeded.id}"]`).first()
  await marked.tap()
  await page.getByTestId('lab-pbar-note').click()
  const field = page.locator('[data-testid="lab-phone-card-note"]')
  await field.waitFor()
  await page.waitForTimeout(500)
  const shown = await field.evaluate(el => ({ strong: el.querySelector('strong')?.textContent, em: el.querySelector('em')?.textContent, nested: !!el.querySelector('[data-depth="1"]') }))
  ok(`${name} phone: the note opens formatted`, shown.strong === 'mirrors' && shown.em === 'self-educated' && shown.nested, shown)
  await field.click()
  await page.waitForTimeout(300)
  ok(`${name} phone: the B / I / • row shows while writing, with Done`, await page.locator('[data-testid="note-format"] .tn-done').isVisible())
  ok(`${name} phone: no move control`, await page.locator('.source-margin-grip, .mr-grip, [aria-label^="Move"]').count() === 0)
  await page.screenshot({ path: path.join(OUT, `${name}-phone-1-note.png`) })
  ok(`${name} phone: no page errors`, errors.length === 0, errors)
  await browser.close()
}

for (const name of ENGINES) {
  const engine = name === 'webkit' ? webkit : chromium
  try { await desktop(engine, name) } catch (error) { failures++; console.log(`FAIL ${name} desktop: ${error.message.split('\n')[0]}`) }
  try { await phone(engine, name) } catch (error) { failures++; console.log(`FAIL ${name} phone: ${error.message.split('\n')[0]}`) }
}
console.log(failures ? `${failures} check(s) failed` : 'all note formatting checks passed')
console.log(`screenshots: ${OUT}`)
process.exit(failures ? 1 : 0)
