// Private desktop reader acceptance against a local Vite server. All service/API
// calls are isolated; the exact source coordinate is checked in local memory.
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { chromium } from '@playwright/test'
import { markInternal } from './lib/internalTraffic.cjs'

const origin = process.env.TINCT_ORIGIN || 'http://127.0.0.1:3001'
const output = process.env.TINCT_POSITION_OUTPUT || '/tmp/tinct-shared-reader-position'
const browser = await markInternal(await chromium.launch({
  headless: true,
  executablePath: process.env.TINCT_CHROMIUM_EXECUTABLE || undefined,
  args: ['--mute-audio', '--no-sandbox', '--autoplay-policy=user-gesture-required'],
}))
await fs.mkdir(output, { recursive: true })
const observations = []
const errors = []
const chapterActions = []

const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, serviceWorkers: 'block', reducedMotion: 'reduce' })
const page = await context.newPage()
page.on('pageerror', error => errors.push(error.message))
await page.route('**/*', route => {
  const url = new URL(route.request().url())
  if (url.origin !== origin) return route.abort()
  if (url.pathname === '/api/lab-chapter-notes') {
    chapterActions.push({ kind: 'notes', request: route.request().postDataJSON() })
    return route.fulfill({ json: { beats: [{ title: 'Fixture source', text: 'A bounded chapter note from the exact requested source.' }] } })
  }
  if (url.pathname === '/api/lab-catch-up') {
    chapterActions.push({ kind: 'catchup', request: route.request().postDataJSON() })
    return route.fulfill({ json: { summary: 'Earlier chapters only, before the reader’s current place.' } })
  }
  if (url.pathname.startsWith('/api/')) return route.fulfill({ status: 404, json: {} })
  return route.continue()
})
await page.addInitScript(() => {
  if (!localStorage.getItem('tinct-lab-prefs')) localStorage.setItem('tinct-lab-prefs', JSON.stringify({ primaryEdition: 'original-en', audioEdition: 'original-en', compareOpen: false, fontSize: 1, fontSizeExplicit: true }))
  if (!localStorage.getItem('tinct-lab-position')) localStorage.setItem('tinct-lab-position', JSON.stringify({
    books: { frankenstein: { bookId: 'frankenstein', headerBook: 'Frankenstein', chapterNumber: 2, sequentialChapter: 2,
      paragraphIndex: 3, wordIndex: 4, primaryEditionKey: 'original-en', updatedAt: Date.now() - 1000, deviceId: 'fixture', rev: 1 } },
    lastSettledBookId: 'frankenstein', lastSettledAt: Date.now() - 1000, finished: {},
  }))
})

const saved = bookId => page.evaluate(id => {
  const item = JSON.parse(localStorage.getItem('tinct-lab-position') || '{}').books?.[id]
  return item ? { chapter: item.sequentialChapter, paragraph: item.paragraphIndex, word: item.wordIndex } : null
}, bookId)

async function observe(label, bookId = 'frankenstein', screenshot = true) {
  const root = page.locator('.lab')
  const state = {
    label, bookId, saved: await saved(bookId),
    current: await root.evaluate(node => ({ book: node.dataset.book, chapter: node.dataset.chapter, place: node.dataset.place, continuous: node.dataset.continuousReader === 'true' })),
    window: await page.getByTestId('continuous-reader').evaluate(node => ({ top: node.scrollTop, height: node.scrollHeight, viewport: node.clientHeight, words: node.querySelectorAll('[data-testid="lab-word"]').length })).catch(() => null),
  }
  observations.push(state)
  if (screenshot) await page.screenshot({ path: `${output}/${label}.png` })
  return state
}

const exactMounted = async (paragraph, word) => {
  assert.equal(await page.getByTestId('continuous-reader').locator(`[data-paragraph-index="${paragraph}"][data-word-index="${word}"]`).count() > 0, true, `source word ${paragraph}:${word} mounted`)
}
const openSettings = async () => {
  await page.getByTestId('lab-super').click()
  await page.getByTestId('lab-super-row-editions').click()
  await page.getByTestId('lab-v2-layout-margin').waitFor()
}

try {
if (!process.env.SHARED_POSITION_ACTIONS_ONLY) {
  await page.goto(`${origin}/reader?book=frankenstein&sharedReader=1`, { waitUntil: 'domcontentloaded' })
  await page.waitForFunction(() => document.querySelector('.lab')?.dataset.readerReady === 'true', null, { timeout: 45000 })
  await page.getByTestId('continuous-reader').waitFor()
  await page.evaluate(() => document.fonts.ready)
  assert.deepEqual(await saved('frankenstein'), { chapter: 2, paragraph: 3, word: 4 })
  await exactMounted(3, 4)
  await page.waitForTimeout(600)
  assert.deepEqual(await saved('frankenstein'), { chapter: 2, paragraph: 3, word: 4 }, 'programmatic landing does not rewrite exact word')
  await observe('frankenstein-resume')

  const host = page.getByTestId('continuous-reader')
  await host.hover()
  await page.mouse.wheel(0, 620)
  await page.waitForTimeout(1100)
  const down = await observe('frankenstein-forward')
  assert(down.saved.paragraph > 3 || down.saved.word > 4, 'wheel down advances the source word')
  await exactMounted(down.saved.paragraph, down.saved.word)
  await page.mouse.wheel(0, -440)
  await page.waitForTimeout(1100)
  const up = await observe('frankenstein-reverse')
  assert(up.saved.paragraph < down.saved.paragraph || (up.saved.paragraph === down.saved.paragraph && up.saved.word < down.saved.word), 'reverse scroll returns to earlier words')
  await exactMounted(up.saved.paragraph, up.saved.word)
  await page.reload({ waitUntil: 'domcontentloaded' })
  await host.waitFor({ timeout: 45000 })
  await page.waitForTimeout(600)
  assert.deepEqual(await saved('frankenstein'), up.saved, 'reload preserves exact nonzero source word')
  await exactMounted(up.saved.paragraph, up.saved.word)
  await observe('frankenstein-reload')

  // Typeface/viewport reflow cannot write a different saved coordinate.
  await page.getByTestId('lab-super').click()
  await page.getByTestId('lab-super-row-text').click()
  await page.getByTestId('lab-v2-size').fill('1.3')
  await page.getByTestId('lab-v2-sheet-close').click()
  await page.waitForTimeout(500)
  assert.deepEqual(await saved('frankenstein'), up.saved, 'font reflow preserves word')
  await exactMounted(up.saved.paragraph, up.saved.word)
  await observe('frankenstein-font')
  await page.setViewportSize({ width: 1100, height: 760 })
  await page.waitForTimeout(500)
  assert.deepEqual(await saved('frankenstein'), up.saved, 'viewport reflow preserves word')
  await exactMounted(up.saved.paragraph, up.saved.word)
  await observe('frankenstein-resize')
  await openSettings()
  await page.getByTestId('lab-v2-layout-classic').click()
  await page.waitForFunction(() => document.querySelector('.lab')?.dataset.continuousReader !== 'true')
  assert.deepEqual(await saved('frankenstein'), up.saved, 'Classic receives the same semantic position')
  await observe('frankenstein-classic')
  await openSettings()
  await page.getByTestId('lab-v2-layout-margin').click()
  await host.waitFor()
  await exactMounted(up.saved.paragraph, up.saved.word)
  assert.deepEqual(await saved('frankenstein'), up.saved, 'Margin receives the same semantic position')
  await observe('frankenstein-return-margin')

  // Genesis 50 -> Exodus 1 crosses the Bible's distinct per-book position keys.
  await page.evaluate(() => localStorage.setItem('tinct-lab-prefs', JSON.stringify({ primaryEdition: 'kjv-en', audioEdition: 'kjv-en', compareEdition: 'web-en', compareOpen: false })))
  await page.goto(`${origin}/reader?book=bible&chapter=50&paragraph=2&sharedReader=1`, { waitUntil: 'domcontentloaded' })
  await page.waitForFunction(() => document.querySelector('.lab')?.dataset.readerReady === 'true' && document.querySelector('.lab')?.dataset.chapter === '50', null, { timeout: 45000 })
  await host.waitFor()
  await observe('genesis-50', 'genesis')
  await page.getByTestId('lab-page-next').click({ force: true })
  await page.waitForFunction(() => document.querySelector('.lab')?.dataset.chapter === '51', null, { timeout: 45000 })
  if (await page.getByTestId('lab-chapter-cover').isVisible().catch(() => false)) await page.keyboard.press('ArrowRight')
  await host.waitFor()
  assert.equal(await page.locator('.lab').getAttribute('data-continuous-reader'), 'true')
  await observe('exodus-1', 'exodus')

  // Compare uses its existing paired layout, then returns to source-word Margin.
  await openSettings()
  await page.getByTestId('lab-v2-compare-edition').click()
  await page.locator('[data-edition="web-en"]').click()
  await page.getByTestId('lab-v2-show-compare').click()
  await page.waitForFunction(() => document.querySelector('.lab')?.dataset.continuousReader !== 'true')
  const bibleBeforeCompare = await saved('exodus')
  await observe('exodus-compare', 'exodus')
  await openSettings()
  await page.getByTestId('lab-v2-show-compare').click()
  await host.waitFor()
  assert.deepEqual(await saved('exodus'), bibleBeforeCompare, 'Compare round trip preserves Bible sub-book source word')
  await exactMounted(bibleBeforeCompare.paragraph, bibleBeforeCompare.word)
  await observe('exodus-after-compare', 'exodus')

  // A play's lineated verse and a source figure must remain structured after
  // passing through the same continuous window component.
  await page.evaluate(() => localStorage.setItem('tinct-lab-prefs', JSON.stringify({ primaryEdition: 'original-en', audioEdition: 'original-en', compareOpen: false, shakespeareLayout: 'verse' })))
  await page.goto(`${origin}/reader?book=macbeth&edition=original-en&chapter=1&sharedReader=1`, { waitUntil: 'domcontentloaded' })
  await host.waitFor({ timeout: 45000 })
  await host.locator('.lab-verse-line').first().waitFor({ timeout: 15000 })
  await observe('macbeth-verse', 'macbeth')
  await page.goto(`${origin}/reader?book=lords-of-the-cosmos&edition=original-en&chapter=2&paragraph=2&sharedReader=1`, { waitUntil: 'domcontentloaded' })
  await host.waitFor({ timeout: 45000 })
  await page.getByTestId('lab-figure').first().waitFor()
  await observe('source-figure', 'lords-of-the-cosmos')
  await page.getByTestId('lab-figure').first().click()
  await page.getByTestId('lab-figure-card').waitFor()
  await page.getByTestId('lab-figure-close').click()

  // A real authored footnote sidecar belongs to Fear and Trembling's modern
  // edition. The Lords figure above is its actual catalogue image and caption.
  await page.goto(`${origin}/reader?book=fear-and-trembling&edition=modern-en&chapter=4&paragraph=2&word=400&sharedReader=1`, { waitUntil: 'domcontentloaded' })
  await host.waitFor({ timeout: 45000 })
  const footnote = page.getByTestId('lab-footnote-mark').first()
  await footnote.waitFor({ timeout: 20000 })
  await footnote.click()
  await page.getByTestId('lab-footnote').waitFor()
  await observe('source-footnote', 'fear-and-trembling')
  await page.keyboard.press('Escape')

  // A long paragraph can be split across several bounded windows in both
  // directions without a blank reader or an invalid source coordinate.
  await page.goto(`${origin}/reader?book=frankenstein&chapter=2&paragraph=3&word=4&sharedReader=1`, { waitUntil: 'domcontentloaded' })
  await host.waitFor({ timeout: 45000 })
  await host.hover()
  for (let step = 0; step < 6; step++) {
    await page.mouse.wheel(0, 500)
    await page.waitForTimeout(100)
    assert((await host.locator('[data-testid="lab-word"]').count()) > 0, `forward rebase ${step} retains words`)
  }
  await observe('long-forward')
  for (let step = 0; step < 6; step++) {
    await page.mouse.wheel(0, -500)
    await page.waitForTimeout(100)
    assert((await host.locator('[data-testid="lab-word"]').count()) > 0, `reverse rebase ${step} retains words`)
  }
  await observe('long-reverse')
}

  // At 1280 the bounded column, chapter cards, named menu and position tuple
  // all remain the same source, including the first chapter's Primer and a
  // later chapter's Catch me up / Recap. Every AI endpoint is a local fixture.
  await page.setViewportSize({ width: 1280, height: 800 })
  await page.goto(`${origin}/reader?book=frankenstein&edition=original-en&chapter=2&paragraph=3&word=4&sharedReader=1`, { waitUntil: 'domcontentloaded' })
  const host = page.getByTestId('continuous-reader')
  await host.waitFor({ timeout: 45000 })
  await observe('frankenstein-1280')
  await page.goto(`${origin}/reader?book=frankenstein&edition=original-en&chapter=2&paragraph=0&word=0&sharedReader=1`, { waitUntil: 'domcontentloaded' })
  await host.waitFor({ timeout: 45000 })
  await observe('frankenstein-chapter-opening', 'frankenstein', false)
  const beforeActions = await saved('frankenstein')
  await host.locator('.lab-chapter-preview').first().click()
  await page.getByTestId('lab-chapter-notes-beat').first().waitFor()
  assert(chapterActions.some(item => item.kind === 'notes' && item.request.bookId === 'frankenstein' && item.request.chapterNumber === 2 && item.request.kind === 'primer'), 'Primer request is source/chapter-bound')
  await page.getByTestId('lab-chapter-notes-close').click()
  await page.getByTestId('lab-super').click()
  await page.getByTestId('lab-super-row-summarize').click()
  await page.getByTestId('lab-chapter-notes-beat').first().waitFor()
  assert(chapterActions.some(item => item.kind === 'notes' && item.request.bookId === 'frankenstein' && item.request.chapterNumber === 2 && item.request.kind === 'end'), 'Recap request is source/chapter-bound')
  await page.getByTestId('lab-chapter-notes-close').click()
  await page.getByTestId('lab-super').click()
  await page.getByTestId('lab-super-row-catchup').click()
  await page.getByTestId('lab-catch-up-here').waitFor()
  assert((await page.getByTestId('lab-catch-up-entry').count()) > 0, 'Catch me up has prior source units')
  assert(chapterActions.filter(item => item.kind === 'catchup').every(item => item.request.bookId === 'frankenstein' && item.request.placeChapter === 2), 'Catch me up cannot include current or later chapter')
  await page.getByTestId('lab-catch-up-close').click()
  assert.deepEqual(await saved('frankenstein'), beforeActions, 'chapter cards never move the semantic source place')

  // The private switch leaves the known phone Read/Compare path and flag-off
  // desktop page layout available, with no continuous source renderer there.
  await page.setViewportSize({ width: 360, height: 780 })
  await page.goto(`${origin}/reader?book=frankenstein&sharedReader=1&layout=phone`, { waitUntil: 'domcontentloaded' })
  await page.waitForFunction(() => document.querySelector('.lab')?.dataset.readerReady === 'true', null, { timeout: 45000 })
  assert.equal(await page.locator('.lab').getAttribute('data-lab-layout'), 'phone')
  assert.equal(await host.count(), 0, 'phone keeps the familiar paged React reader')
  await observe('frankenstein-phone', 'frankenstein')
  await page.evaluate(() => localStorage.setItem('tinct-lab-prefs', JSON.stringify({ primaryEdition: 'kjv-en', audioEdition: 'kjv-en', compareEdition: 'web-en', compareOpen: true })))
  await page.goto(`${origin}/reader?book=bible&chapter=1&sharedReader=1&layout=phone`, { waitUntil: 'domcontentloaded' })
  await page.waitForFunction(() => document.querySelector('.lab')?.dataset.readerReady === 'true', null, { timeout: 45000 })
  await page.getByTestId('lab-phone-compare').click()
  assert.equal(await page.getByTestId('lab-phone-compare').getAttribute('aria-pressed'), 'true', 'phone Compare opens paired edition')
  assert.equal(await page.getByTestId('lab-listen').getAttribute('data-reader-action'), 'read', 'phone primary control returns to Read')
  await page.getByTestId('lab-listen').click()
  assert.equal(await page.getByTestId('lab-phone-compare').getAttribute('aria-pressed'), 'false', 'phone Read returns from Compare')
  assert.equal(await host.count(), 0, 'phone Read and Compare retain the paged surface')
  await observe('bible-phone-read-after-compare', 'genesis')
  await page.goto(`${origin}/reader?book=frankenstein&sharedReader=0`, { waitUntil: 'domcontentloaded' })
  await page.waitForFunction(() => document.querySelector('.lab')?.dataset.readerReady === 'true', null, { timeout: 45000 })
  assert.equal(await page.locator('.lab').getAttribute('data-shared-reader'), null, 'public flag-off route does not enable private menu')
  assert.equal(await host.count(), 0)

  assert.deepEqual(errors, [], `page errors: ${errors.join('; ')}`)
  console.log(`Shared reader position check passed. ${observations.length} observations and screenshots: ${output}`)
} finally {
  await fs.writeFile(`${output}/results.json`, JSON.stringify({ observations, chapterActions, errors }, null, 2))
  await browser.close()
}
