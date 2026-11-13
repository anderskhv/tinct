// Keyboard scrolling in the desktop Margin reader and the whole-book scroll (user test, 12 Nov 2026: ArrowDown
// did nothing on Windows; the reader had to use the trackpad). On arrival focus is on <body>, and the reader scrolls
// an inner element, so the browser's own key scrolling had nothing to move. The check presses the keys with focus
// where the page leaves it, in Chromium and WebKit, and asserts:
// - ArrowDown/ArrowUp step about a line, PageDown/Space/Shift+Space about a screen, Home/End reach the chapter's ends;
// - the saved place advances as it does for a wheel, and a reload lands on it;
// - keys typed into a field (the Aa size slider) leave the reader where it is, and Escape still closes the sheet;
// - Two-page keeps ArrowRight as a page turn;
// - the one-chapter reader is opened with ?bookScroll=0 (book scroll is on for every reader since 13 Nov 2026);
// - the whole-book scroll moves with the keys, and Home/End stop at its reading chapter's ends.
// All /api calls are mocked (no Anthropic spend). Run against a dev server started with VITE_SHARED_READER_DEFAULT=1:
//   TINCT_ORIGIN=http://127.0.0.1:5231 node scripts/check-reader-scroll-keys.mjs
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { chromium, webkit } from '@playwright/test'
import { markInternal } from './lib/internalTraffic.cjs'

const origin = process.env.TINCT_ORIGIN || 'http://127.0.0.1:5175'
const output = process.env.TINCT_SCROLL_KEYS_OUTPUT || 'artifacts/reader-scroll-keys'
await fs.mkdir(output, { recursive: true })
const ADMIN = '00000000-0000-4000-8000-00000000ad01'

async function open(engine, { admin = false, layout = 'margin' } = {}) {
  const browser = await markInternal(await engine.launch({ headless: true }))
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce', serviceWorkers: 'block' })
  const page = await context.newPage(), errors = []
  page.on('pageerror', error => errors.push(error.message))
  await page.route('**/*', route => {
    const url = new URL(route.request().url())
    if (url.origin !== origin) return route.fulfill({ status: 401, json: {} })
    if (url.pathname.startsWith('/api/')) return route.fulfill({ status: 404, json: {} })
    return route.continue()
  })
  await page.addInitScript(({ admin, id, layout }) => {
    if (sessionStorage.getItem('scroll-keys-seeded')) return
    sessionStorage.setItem('scroll-keys-seeded', '1')
    localStorage.setItem('tinct:reader-desktop-layout', JSON.stringify({ frankenstein: layout, bible: layout }))
    localStorage.setItem('tinct-lab-prefs', JSON.stringify({ primaryEdition: 'original-en', audioEdition: 'original-en', compareOpen: false, fontSize: 1, fontSizeExplicit: true }))
    localStorage.setItem('tinct-lab-position', JSON.stringify({
      books: { frankenstein: { bookId: 'frankenstein', headerBook: 'Frankenstein', chapterNumber: 2, sequentialChapter: 2,
        paragraphIndex: 0, wordIndex: 0, primaryEditionKey: 'original-en', updatedAt: Date.now() - 1000, deviceId: 'fixture', rev: 1 } },
      lastSettledBookId: 'frankenstein', lastSettledAt: Date.now() - 1000, finished: {},
    }))
    if (admin) {
      localStorage.setItem('sb-test-auth-token', JSON.stringify({ access_token: 'x', user: { id, email: null, user_metadata: {} } }))
      localStorage.setItem('tinct-site-admin', id)
    }
  }, { admin, id: ADMIN, layout })
  const ready = () => page.waitForFunction(() => document.querySelector('.lab')?.dataset.readerReady === 'true', null, { timeout: 45000 })
  return { browser, page, errors, ready }
}

const scroller = page => page.evaluate(() => {
  const host = document.querySelector('[data-testid="continuous-reader"]')
  return { top: Math.round(host.scrollTop), max: host.scrollHeight - host.clientHeight, viewport: host.clientHeight, active: document.activeElement?.tagName }
})
const savedPlace = page => page.evaluate(() => {
  const item = JSON.parse(localStorage.getItem('tinct-lab-position') || '{}').books?.frankenstein
  return item ? { chapter: item.sequentialChapter, paragraph: item.paragraphIndex, word: item.wordIndex } : null
})
const later = (a, b) => b.paragraph > a.paragraph || (b.paragraph === a.paragraph && b.word > a.word)
const press = async (page, key, rest = 700) => { await page.keyboard.press(key); await page.waitForTimeout(rest) }

async function margin(engine, name) {
  const s = await open(engine)
  const { page } = s
  try {
    await page.goto(`${origin}/reader?book=frankenstein&view=margin&sharedReader=1&layout=desktop&bookScroll=0`, { waitUntil: 'domcontentloaded' })
    await s.ready()
    await page.getByTestId('continuous-reader').waitFor()
    await page.evaluate(() => document.fonts.ready)
    await page.waitForTimeout(1200)
    const start = await scroller(page)
    assert.equal(start.active, 'BODY', `${name}: focus rests on the page, as after arrival`)
    const before = await savedPlace(page)
    assert.deepEqual(before, { chapter: 2, paragraph: 0, word: 0 })

    await press(page, 'ArrowDown')
    const line = await scroller(page)
    assert.ok(line.top - start.top >= 30 && line.top - start.top <= 80, `${name}: ArrowDown steps about a line (${start.top} -> ${line.top})`)
    await press(page, 'ArrowUp')
    assert.equal((await scroller(page)).top, start.top, `${name}: ArrowUp steps back`)

    await press(page, 'PageDown')
    const paged = await scroller(page)
    assert.ok(paged.top - start.top >= paged.viewport * .8 && paged.top - start.top < paged.viewport, `${name}: PageDown moves about a screen less a line (${paged.top - start.top} of ${paged.viewport})`)
    await press(page, 'Space', 1200)
    const spaced = await scroller(page)
    assert.ok(spaced.top - paged.top >= paged.viewport * .8, `${name}: Space moves on a screen`)
    const afterSpace = await savedPlace(page)
    assert.ok(later(before, afterSpace), `${name}: the saved place advances with the keys (${JSON.stringify(afterSpace)})`)
    await page.screenshot({ path: `${output}/${name}-margin-after-keys.png` })
    await press(page, 'Shift+Space')
    assert.ok((await scroller(page)).top < spaced.top, `${name}: Shift+Space moves back a screen`)

    await press(page, 'End', 1200)
    const end = await scroller(page)
    assert.ok(end.max - end.top <= 2, `${name}: End reaches the chapter's end (${end.top} of ${end.max})`)
    await press(page, 'Home', 1200)
    assert.equal((await scroller(page)).top, 0, `${name}: Home returns to the chapter's start`)

    // A place reached by keys is kept like a wheel scroll's: scroll on, rest, reload, land there.
    await press(page, 'PageDown'); await press(page, 'PageDown', 1300)
    const kept = await savedPlace(page)
    assert.ok(later(before, kept), `${name}: the keyed place is saved`)
    const place = await page.locator('.lab').evaluate(node => node.dataset.place)
    await page.reload({ waitUntil: 'domcontentloaded' }); await s.ready()
    await page.getByTestId('continuous-reader').waitFor(); await page.waitForTimeout(1200)
    assert.deepEqual(await savedPlace(page), kept, `${name}: reload keeps the keyed place`)
    assert.equal(await page.locator('.lab').evaluate(node => node.dataset.place), place, `${name}: reload lands on the keyed place`)

    // Keys in a field belong to the field; Escape still closes the sheet.
    // (The slider changes the type size, so the text reflows: the place, not the offset, must stay.)
    await page.getByTestId('lab-header-aa').click()
    const size = page.getByTestId('lab-v2-size')
    await size.focus()
    const sizeBefore = await size.inputValue()
    await press(page, 'ArrowDown', 400); await press(page, 'PageDown', 400); await press(page, 'End', 400)
    assert.notEqual(await size.inputValue(), sizeBefore, `${name}: the slider took its keys`)
    assert.deepEqual(await savedPlace(page), kept, `${name}: keys in the size slider leave the saved place alone`)
    assert.equal(await page.locator('.lab').evaluate(node => node.dataset.place), place, `${name}: keys in the size slider leave the reader at its place`)
    await press(page, 'Escape', 500)
    assert.equal(await page.getByTestId('lab-v2-sheet').count(), 0, `${name}: Escape closes the sheet`)
    await page.evaluate(() => document.activeElement instanceof HTMLElement && document.activeElement.blur())
    const rest = await scroller(page)
    await press(page, 'ArrowDown')
    assert.ok((await scroller(page)).top > rest.top, `${name}: keys scroll again once the sheet is closed`)
    assert.deepEqual(s.errors, [], `${name}: no page errors`)
    console.log(`Scroll keys: ${name} Margin ok`)
  } finally { await s.browser.close() }
}

async function twoPage(engine, name) {
  const s = await open(engine, { layout: 'two-page' })
  const { page } = s
  try {
    await page.goto(`${origin}/reader?book=frankenstein&view=read&sharedReader=1&layout=desktop`, { waitUntil: 'domcontentloaded' })
    await s.ready(); await page.waitForTimeout(1500)
    assert.equal(await page.getByTestId('continuous-reader').count(), 0, `${name}: Two-page has no scroller`)
    const place = () => page.locator('.lab').evaluate(node => `${node.dataset.chapter}/${node.dataset.place}`)
    const first = await place()
    await press(page, 'ArrowRight', 1200)
    assert.notEqual(await place(), first, `${name}: ArrowRight still turns the page in Two-page`)
    await press(page, 'ArrowLeft', 1200)
    assert.equal(await place(), first, `${name}: ArrowLeft turns back`)
    console.log(`Scroll keys: ${name} Two-page ok`)
  } finally { await s.browser.close() }
}

async function bookScroll(engine, name) {
  const s = await open(engine, { admin: true })
  const { page } = s
  try {
    await page.goto(`${origin}/reader?book=bible&chapter=982&paragraph=0&word=0&view=margin&sharedReader=1&layout=desktop`, { waitUntil: 'domcontentloaded' })
    await s.ready()
    await page.locator('[data-book-scroll-unit]').waitFor()
    await page.waitForTimeout(1500)
    const place = () => page.locator('.lab').evaluate(node => `${node.dataset.chapter}/${node.dataset.place}`)
    const start = await scroller(page), first = await place()
    await press(page, 'ArrowDown')
    assert.ok((await scroller(page)).top > start.top, `${name}: ArrowDown scrolls the whole book`)
    await press(page, 'PageDown'); await press(page, 'Space', 1400)
    const moved = await scroller(page)
    assert.ok(moved.top - start.top > moved.viewport, `${name}: PageDown and Space move a screen each`)
    assert.notEqual(await place(), first, `${name}: the book-scroll place advances with the keys`)
    // End stops at the end of the reading chapter, not the book's; Home goes back to its start.
    const chapterEdge = () => page.evaluate(() => {
      const host = document.querySelector('[data-testid="continuous-reader"]')
      const own = document.querySelector('.book-scroll-chapter.is-own').getBoundingClientRect(), box = host.getBoundingClientRect()
      return { top: Math.round(own.top - box.top), bottom: Math.round(own.bottom - box.bottom) }
    })
    await press(page, 'End', 1400)
    const end = await chapterEdge()
    assert.ok(Math.abs(end.bottom) <= 4, `${name}: End brings the chapter's end to the bottom (${JSON.stringify(end)})`)
    await page.screenshot({ path: `${output}/${name}-book-scroll-end.png` })
    await press(page, 'Home', 1400)
    const home = await chapterEdge()
    assert.ok(Math.abs(home.top) <= 4, `${name}: Home brings the chapter's start to the top (${JSON.stringify(home)})`)
    assert.deepEqual(s.errors, [], `${name}: no page errors`)
    console.log(`Scroll keys: ${name} whole-book scroll ok`)
  } finally { await s.browser.close() }
}

for (const [engine, name] of [[chromium, 'chromium'], [webkit, 'webkit']]) {
  await margin(engine, name)
  await twoPage(engine, name)
  await bookScroll(engine, name)
}
console.log('Reader scroll keys: all checks passed')
