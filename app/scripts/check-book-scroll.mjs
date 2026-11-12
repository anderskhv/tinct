// Whole-book scroll (admin try-out, Anders 11 Nov 2026): off for everyone but a site admin.
// Non-admin: no book-scroll DOM, even with ?bookScroll=1. Admin (a cached Supabase session plus the cached
// site_admins answer for that user, all network to Supabase refused): book scroll on by default, the Bible scrolls
// one biblical book, chapter ends say Summary, transcripts keep their bold speakers, reload keeps the exact word,
// and Appearance › Whole-book scroll turns it off and on for this device at the same place. Margin cards across chapter
// swaps in Luke (12 Nov 2026): one section per card, an open card keeps its chapter while it is on screen, the overview
// marks every chapter's highlights and cards, and a chapter's start actions stay level with its heading.
// Run against a dev or preview server: TINCT_ORIGIN=http://127.0.0.1:5175 node scripts/check-book-scroll.mjs
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { chromium, webkit } from '@playwright/test'
import { markInternal } from './lib/internalTraffic.cjs'

const origin = process.env.TINCT_ORIGIN || 'http://127.0.0.1:5175'
const output = process.env.TINCT_BOOK_SCROLL_OUTPUT || 'artifacts/book-scroll'
await fs.mkdir(output, { recursive: true })
const ADMIN = '00000000-0000-4000-8000-00000000ad01'
const results = []

async function open(engine, name, admin) {
  // Explain answers (no Anthropic call): a bold lead line, then a body; `long` makes one reach far down the margin.
  const mock = { long: false, count: 0 }
  const browser = await markInternal(await engine.launch({ headless: true }))
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce', serviceWorkers: 'block' })
  const page = await context.newPage(), errors = []
  page.on('pageerror', error => errors.push(error.message))
  await page.route('**/*', route => {
    const url = new URL(route.request().url())
    if (url.origin !== origin) return route.fulfill({ status: 401, json: {} })
    if (url.pathname === '/api/lab-chat' || url.pathname === '/api/chat') {
      const answer = `**Lead line ${++mock.count} of this explanation.** A body sentence about the passage.${mock.long ? ' It goes on about the passage, its setting and its words, so that the card reaches far down the margin.'.repeat(14) : ''}`
      return route.fulfill({ contentType: 'text/event-stream', body: `data: ${JSON.stringify({ type: 'content_block_delta', delta: { type: 'text_delta', text: answer } })}\n\ndata: {"type":"message_stop"}\n\n` })
    }
    if (url.pathname.startsWith('/api/')) return route.fulfill({ status: 404, json: {} })
    return route.continue()
  })
  await page.addInitScript(({ admin, id }) => {
    if (sessionStorage.getItem('book-scroll-seeded')) return
    sessionStorage.setItem('book-scroll-seeded', '1')
    localStorage.setItem('tinct-lab-prefs', JSON.stringify({ theme: 'book', compareOpen: false }))
    if (admin) {
      localStorage.setItem('sb-test-auth-token', JSON.stringify({ access_token: 'x', user: { id, email: null, user_metadata: {} } }))
      localStorage.setItem('tinct-site-admin', id)
    }
  }, { admin, id: ADMIN })
  const ready = () => page.waitForFunction(() => document.querySelector('.lab')?.dataset.readerReady === 'true', null, { timeout: 45000 })
  return { browser, page, errors, ready, name, mock }
}

// Default edition: Luke 9, 10 and 11 are the Bible's chapters 982, 983 and 984.
async function lukeCards(s) {
  const { page, mock, name } = s
  const own = () => page.locator('.lab').evaluate(node => node.dataset.chapter)
  const select = async (from, to, button) => {
    const words = page.locator('.book-scroll-chapter.is-own [data-testid="lab-word"]')
    const a = await words.nth(from).boundingBox(), b = await words.nth(to).boundingBox()
    await page.mouse.move(a.x + 2, a.y + a.height / 2); await page.mouse.down()
    await page.mouse.move(b.x + 2, b.y + b.height / 2, { steps: 6 }); await page.mouse.up()
    await page.getByTestId(button).click()
    if (button === 'lab-dbar-explain') await page.locator('[data-testid="source-margin-item"][data-open="true"] .lab-pcard-answer').first().waitFor({ timeout: 15000 })
    else await page.waitForTimeout(300)
  }
  const scrollUntil = async (dy, done, pause = 120) => {
    await page.locator('[data-book-scroll-unit]').hover({ position: { x: 300, y: 400 } })
    for (let step = 0; step < 80 && !(await done()); step++) { await page.mouse.wheel(0, dy); await page.waitForTimeout(pause) }
    assert.ok(await done(), 'the scroll reached its place')
    await page.waitForTimeout(1200)
  }
  const sectionsPerCard = () => page.evaluate(() => {
    const ids = [...document.querySelectorAll('[data-testid="source-margin-item"]')].map(item => item.dataset.cardId)
    return ids.filter((id, index) => ids.indexOf(id) !== index)
  })
  // A chapter's start actions against its heading, in px (0: level with it).
  const startOffset = chapter => page.evaluate(chapter => {
    const item = document.querySelector(`[data-testid="source-margin-item"][data-card-id="start:${chapter}"]`)
    const head = document.querySelector(`[data-book-scroll-chapter="${chapter}"] .lab-passage-headline:not([hidden])`)
    return item && head ? Math.round(item.getBoundingClientRect().top - head.getBoundingClientRect().top) : null
  }, chapter)
  await page.goto(`${origin}/reader?book=bible&chapter=982&paragraph=0&word=0&view=margin&sharedReader=1&layout=desktop`, { waitUntil: 'domcontentloaded' }); await s.ready()
  await page.waitForTimeout(1500)
  assert.equal(await page.locator('[data-book-scroll-unit]').getAttribute('data-book-scroll-unit'), 'bible/Luke/974')
  await select(3, 8, 'lab-dbar-highlight'); await page.keyboard.press('Escape')
  await select(20, 26, 'lab-dbar-explain'); await page.keyboard.press('Escape')
  await select(40, 46, 'lab-dbar-explain')
  // Into Luke 10: the overview still marks Luke 9's highlight and both its cards; Luke 10's actions stay by its heading.
  await scrollUntil(400, async () => await own() === '983')
  assert.ok(await page.locator('[data-map-unit-mark="982"]').count() >= 3, "the overview marks Luke 9's highlight and cards from Luke 10")
  // As a neighbour and as the reader's own chapter alike (they dropped by the heading's height at every swap).
  for (const chapter of [983, 984]) {
    const offset = await startOffset(chapter)
    assert.ok(offset !== null && Math.abs(offset) <= 2, `Luke ${chapter - 973}'s start actions are level with its heading (${offset} px)`)
  }
  // And back: every card is one section (a swap painted a stale copy over the live card: "Open this card" over its lead).
  await scrollUntil(-400, async () => await own() === '982')
  assert.deepEqual(await sectionsPerCard(), [], 'one margin section per card after chapter swaps')
  await page.screenshot({ path: `${output}/${name}-luke-cards-back.png` })
  // A long Explain near Luke 10's end reaches past Luke 11's heading: scrolling on to read it keeps it open and typable
  // while it is on screen (the reader keeps Luke 10, the top bar names Luke 11); further on, the place follows again.
  await page.goto(`${origin}/reader?book=bible&chapter=983&paragraph=0&word=0&view=margin&sharedReader=1&layout=desktop`, { waitUntil: 'domcontentloaded' }); await s.ready()
  await page.waitForTimeout(1500)
  const luke11 = () => page.evaluate(() => document.querySelector('[data-book-scroll-chapter="984"]')?.getBoundingClientRect().top ?? 1e9)
  await scrollUntil(300, async () => await luke11() < 800)
  const near = await page.locator('.book-scroll-chapter.is-own [data-testid="lab-word"]').evaluateAll(words => words.findIndex(word => word.getBoundingClientRect().top > 200))
  mock.long = true
  await select(near, near + 5, 'lab-dbar-explain')
  mock.long = false
  const card = page.locator('[data-testid="source-margin-item"][data-open="true"]')
  await scrollUntil(150, async () => await luke11() < 0)
  assert.ok(await card.evaluate(node => node.getBoundingClientRect().bottom > 200), 'the open card still reaches down the screen')
  assert.equal(await own(), '983', 'the reader keeps Luke 10 while its open card is on screen')
  assert.match(await page.locator('.lab-header').innerText(), /Luke 11/, 'the top bar names the chapter at the reading line')
  const field = card.locator('.lab-pcard-follow-input')
  await field.click(); await page.keyboard.type('a follow-up typed here')
  assert.equal(await field.inputValue(), 'a follow-up typed here', 'the open card takes typing past the next heading')
  await page.screenshot({ path: `${output}/${name}-luke-card-held.png` })
  await scrollUntil(500, async () => await own() !== '983')
  assert.equal(await card.count(), 0, 'the card folds once it and its chapter have left the screen')
}

for (const [name, engine] of [['chromium', chromium], ['webkit', webkit]]) {
  // Everyone else: the one-chapter reader, whatever the link says.
  {
    const s = await open(engine, name, false)
    const result = { engine: name, run: 'non-admin', passed: false }
    try {
      for (const q of ['', '&bookScroll=1']) {
        await s.page.goto(`${origin}/reader?book=bible&edition=kjv-en&chapter=2&paragraph=0&word=0&view=margin&sharedReader=1&layout=desktop${q}`, { waitUntil: 'domcontentloaded' }); await s.ready()
        assert.equal(await s.page.locator('[data-book-scroll-unit]').count(), 0, `no book scroll for a non-admin (${q || 'no switch'})`)
        await s.page.getByRole('slider', { name: 'Chapter position', exact: true }).waitFor()
      }
      await s.page.getByTestId('lab-header-aa').click()
      assert.equal(await s.page.getByTestId('lab-v2-book-scroll').count(), 0, 'no Whole-book scroll switch for a non-admin')
      assert.deepEqual(s.errors, [])
      result.passed = true
    } catch (error) { result.error = error.stack; await s.page.screenshot({ path: `${output}/${name}-non-admin-failure.png` }).catch(() => {}) }
    finally { await s.browser.close(); results.push(result) }
  }
  // An admin: book scroll on by default.
  {
    const s = await open(engine, name, true)
    const result = { engine: name, run: 'admin', passed: false }
    const { page } = s
    try {
      // Opening deep in a long unit lands on the chapter asked for, after the placeholders above it take their
      // measured heights (11 Nov 2026, default edition: Genesis 30 opened on Genesis 19, Psalm 22 on Psalm 1).
      for (const [chapter, unit] of [[30, 'bible/Genesis/1'], [500, 'bible/Psalms/479']]) {
        await page.goto(`${origin}/reader?book=bible&chapter=${chapter}&paragraph=0&word=0&view=margin&sharedReader=1&layout=desktop`, { waitUntil: 'domcontentloaded' }); await s.ready()
        assert.equal(await page.locator('[data-book-scroll-unit]').getAttribute('data-book-scroll-unit'), unit)
        await page.waitForTimeout(2500)
        const atLine = await page.locator('[data-book-scroll-unit]').evaluate(node => {
          const box = node.getBoundingClientRect()
          const word = [...node.querySelectorAll('[data-testid="lab-word"], [data-testid="lab-opening-word"]')].find(item => item.getBoundingClientRect().top >= box.top + 60)
          return word ? `${word.closest('[data-book-scroll-chapter]')?.getAttribute('data-book-scroll-chapter')}/${word.dataset.paragraphIndex}:${word.dataset.wordIndex}` : 'none'
        })
        assert.equal(atLine, `${chapter}/0:0`, `chapter ${chapter} opens at its first word`)
      }
      await page.goto(`${origin}/reader?book=bible&edition=kjv-en&chapter=2&paragraph=0&word=0&view=margin&sharedReader=1&layout=desktop`, { waitUntil: 'domcontentloaded' }); await s.ready()
      const host = page.locator('[data-book-scroll-unit]')
      await host.waitFor()
      assert.equal(await host.getAttribute('data-book-scroll-unit'), 'bible/Genesis/1', 'the Bible scrolls one biblical book')
      await page.getByRole('slider', { name: 'Book position', exact: true }).waitFor()
      assert.equal(await page.locator('[data-map-chapter-mark]').count(), 50, "Genesis's overview marks its fifty chapters")
      await lukeCards(s)
      // Chapter ends say Summary.
      await page.goto(`${origin}/reader?book=frankenstein&edition=original-en&chapter=2&paragraph=0&word=0&view=margin&sharedReader=1&layout=desktop`, { waitUntil: 'domcontentloaded' }); await s.ready()
      const scroller = page.locator('[data-book-scroll-unit]')
      await scroller.hover()
      for (let step = 0; step < 24 && !(await page.getByRole('button', { name: 'Summary of this chapter', exact: true }).count()); step++) {
        await page.mouse.wheel(0, 700); await page.waitForTimeout(80)
      }
      for (const label of ['Summary of this chapter', 'Quiz me on this chapter', 'Chapter note']) await page.getByRole('button', { name: label, exact: true }).first().waitFor()
      assert.equal(await page.getByRole('button', { name: /^Recap/ }).count(), 0, 'no Recap pill at a chapter end')
      // Transcripts keep their bold speakers.
      await page.goto(`${origin}/reader?book=bold-conjectures-volume-1&edition=original-en&chapter=3&view=margin&sharedReader=1&layout=desktop`, { waitUntil: 'domcontentloaded' }); await s.ready()
      await page.locator('.lab-transcript-speaker').first().waitFor()
      assert.equal(await page.locator('.lab-transcript-speaker').first().evaluate(node => getComputedStyle(node).fontWeight), '600', 'speaker names are bold in book scroll')
      // Reload keeps the exact word.
      await page.goto(`${origin}/reader?book=frankenstein&edition=original-en&chapter=3&paragraph=4&word=6&view=margin&sharedReader=1&layout=desktop`, { waitUntil: 'domcontentloaded' }); await s.ready()
      await page.waitForTimeout(1500)
      const place = await page.locator('.lab').evaluate(node => node.dataset.chapter + '/' + node.dataset.place)
      await page.goto(`${origin}/reader`, { waitUntil: 'domcontentloaded' }); await s.ready(); await page.waitForTimeout(1500)
      assert.equal(await page.locator('.lab').evaluate(node => node.dataset.chapter + '/' + node.dataset.place), place, 'reload keeps the exact word')
      // Appearance › Whole-book scroll: off, same place; on again.
      const toggle = async expected => {
        await page.getByTestId('lab-header-aa').click()
        const sw = page.getByTestId('lab-v2-book-scroll')
        await sw.waitFor()
        assert.equal(await sw.getAttribute('aria-checked'), String(!expected))
        await page.screenshot({ path: `${output}/${name}-appearance-switch-${expected ? 'on' : 'off'}.png` })
        await Promise.all([page.waitForEvent('load'), sw.click()])
        await s.ready(); await page.waitForTimeout(1500)
        assert.equal(await page.locator('[data-book-scroll-unit]').count(), expected ? 1 : 0, `book scroll ${expected ? 'on' : 'off'} after the switch`)
        assert.equal(await page.locator('.lab').evaluate(node => node.dataset.chapter + '/' + node.dataset.place), place, 'the switch keeps the place')
      }
      await toggle(false)
      await toggle(true)
      assert.deepEqual(s.errors, [])
      result.passed = true
    } catch (error) { result.error = error.stack; await page.screenshot({ path: `${output}/${name}-admin-failure.png` }).catch(() => {}) }
    finally { await s.browser.close(); results.push(result) }
  }
}
console.log(JSON.stringify(results, null, 2))
if (results.some(result => !result.passed)) process.exit(1)
