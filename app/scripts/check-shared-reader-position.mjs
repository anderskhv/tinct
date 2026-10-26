// Private desktop reader acceptance against a local Vite server. All service/API
// calls are isolated; the exact source coordinate is checked in local memory.
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { chromium } from '@playwright/test'
import { markInternal } from './lib/internalTraffic.cjs'

const origin = process.env.TINCT_ORIGIN || 'http://127.0.0.1:3001'
const expectedBundle = process.env.TINCT_EXPECTED_BUNDLE || ''
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
const macbethLines = JSON.parse(await fs.readFile('public/data/editions/macbeth-lines.json', 'utf8'))
const macbethSource = JSON.parse(await fs.readFile('public/data/editions/macbeth-original-en.json', 'utf8'))

const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, serviceWorkers: 'block', reducedMotion: 'reduce' })
const page = await context.newPage()
page.on('pageerror', error => errors.push(error.message))
await page.route('**/*', async route => {
  const url = new URL(route.request().url())
  if (url.origin !== origin) return route.abort()
  if (expectedBundle && url.pathname === '/reader') {
    const response = await route.fetch()
    const html = await response.text()
    const actual = [...html.matchAll(/\/assets\/index-[\w-]+\.js/g)].map(match => match[0])
    if (response.status() !== 200 || actual.length !== 1 || actual[0] !== expectedBundle) {
      console.error(`Position reader document serves ${JSON.stringify(actual)}, expected ${expectedBundle}`)
      return route.abort('failed')
    }
    return route.fulfill({ response })
  }
  if (expectedBundle && /^\/assets\/index-[\w-]+\.js$/.test(url.pathname) && url.pathname !== expectedBundle) return route.abort('failed')
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
  if (!localStorage.getItem('tinct:reader-desktop-layout')) localStorage.setItem('tinct:reader-desktop-layout', JSON.stringify(Object.fromEntries(['frankenstein', 'bible', 'macbeth', 'lords-of-the-cosmos', 'fear-and-trembling'].map(id => [id, 'margin']))))
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
    window: await page.getByTestId('continuous-reader').count() ? await page.getByTestId('continuous-reader').evaluate(node => ({ top: node.scrollTop, height: node.scrollHeight, viewport: node.clientHeight, words: node.querySelectorAll('[data-testid="lab-word"]').length })) : null,
  }
  observations.push(state)
  console.log(`Position: ${label} ${JSON.stringify(state.current)}`)
  if (screenshot) await page.screenshot({ path: `${output}/${label}.png` })
  return state
}

const exactMounted = async (paragraph, word) => {
  assert.equal(await page.getByTestId('continuous-reader').locator(`[data-paragraph-index="${paragraph}"][data-word-index="${word}"]`).count() > 0, true, `source word ${paragraph}:${word} mounted`)
}
const desktopAa = async () => {
  const aa = page.getByTestId('lab-header-aa')
  await aa.waitFor({ state: 'visible' })
  const bounds = await aa.evaluate(node => {
    const box = node.getBoundingClientRect()
    return { left: box.left, top: box.top, right: box.right, bottom: box.bottom, width: box.width, height: box.height,
      viewportWidth: innerWidth, viewportHeight: innerHeight }
  })
  assert(bounds.width > 0 && bounds.height > 0 && bounds.left >= 0 && bounds.top >= 0
    && bounds.right <= bounds.viewportWidth && bounds.bottom <= bounds.viewportHeight,
  `desktop Aa is actually in the viewport before click: ${JSON.stringify(bounds)}`)
  return aa
}
const openSettings = async () => {
  await (await desktopAa()).click()
  assert.equal(await page.getByTestId('lab-v2-sheet').getAttribute('data-layer'), 'reading', 'Aa opens appearance and Layout')
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
  await openSettings()
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
  await page.getByTestId('lab-v2-layout-two-page').click()
  await page.waitForFunction(() => document.querySelector('.lab')?.dataset.continuousReader !== 'true')
  assert.deepEqual(await saved('frankenstein'), up.saved, 'Two-page receives the same semantic position')
  await observe('frankenstein-classic')
  await openSettings()
  await page.getByTestId('lab-v2-layout-margin').click()
  await host.waitFor()
  await exactMounted(up.saved.paragraph, up.saved.word)
  assert.deepEqual(await saved('frankenstein'), up.saved, 'Margin receives the same semantic position')
  await observe('frankenstein-return-margin')

  // Genesis 50 -> Exodus 1 crosses the Bible's distinct per-book position keys.
  await page.evaluate(() => localStorage.setItem('tinct-lab-prefs', JSON.stringify({ primaryEdition: 'kjv-en', audioEdition: 'kjv-en', compareEdition: 'kjv-en', compareOpen: false, compareChosen: true })))
  await page.goto(`${origin}/reader?book=bible&chapter=50&paragraph=2&sharedReader=1`, { waitUntil: 'domcontentloaded' })
  await page.waitForFunction(() => document.querySelector('.lab')?.dataset.readerReady === 'true' && document.querySelector('.lab')?.dataset.chapter === '50', null, { timeout: 45000 })
  await host.waitFor()
  await observe('genesis-50', 'genesis')
  assert.equal(await page.getByTestId('lab-page-next').count(), 0, 'scrolling Margin has no fixed page-turn footer')
  // Use the real source overview to reach the chapter's end, then the in-flow
  // chapter control. The source coordinate still crosses Genesis -> Exodus.
  const chapterMap = page.getByRole('slider', { name: 'Chapter position' })
  await chapterMap.focus()
  await page.keyboard.press('End')
  const nextChapter = host.getByRole('button', { name: 'Next chapter', exact: true })
  await nextChapter.waitFor({ state: 'attached', timeout: 10000 })
  await nextChapter.scrollIntoViewIfNeeded()
  await nextChapter.click()
  await page.waitForFunction(() => document.querySelector('.lab')?.dataset.chapter === '51', null, { timeout: 45000 })
  if (await page.getByTestId('lab-chapter-cover').isVisible().catch(() => false)) await page.keyboard.press('ArrowRight')
  await host.waitFor()
  assert.equal(await page.locator('.lab').getAttribute('data-continuous-reader'), 'true')
  await observe('exodus-1', 'exodus')

  // A raised verse numeral is a source word too. Exercise real pointer
  // selection, immediate continuous typing, and note deletion in the rail.
  await host.evaluate(node => { node.scrollTop = 0 })
  const selectVerse = async () => {
    const numeral = host.locator('.lab-verse-mark').first()
    const start = await numeral.boundingBox()
    const target = host.getByTestId('lab-word').nth(10)
    const end = await target.boundingBox()
    assert(start && end, 'verse selection has measured source boxes')
    await page.mouse.move(start.x + start.width / 2, start.y + start.height / 2)
    await page.mouse.down()
    await page.mouse.move(end.x + end.width / 2, end.y + end.height / 2, { steps: 12 })
    await page.mouse.up()
    await page.getByTestId('lab-desk-bar').waitFor({state:'visible'})
  }
  await selectVerse()
  const beforeAsk = await page.getByTestId('lab-desk-bar').boundingBox()
  await page.getByTestId('lab-dbar-ask').click()
  await page.keyboard.type('When I read this passage, what does it mean?')
  assert.equal(await page.getByTestId('lab-dbar-ask-field').inputValue(), 'When I read this passage, what does it mean?', 'Ask retains uninterrupted typing focus')
  const afterAsk = await page.getByTestId('lab-desk-bar').boundingBox()
  assert(Math.abs(beforeAsk.width-afterAsk.width)<2 && Math.abs(beforeAsk.height-afterAsk.height)<2, 'Ask keeps the existing toolbar size')
  await page.screenshot({path:`${output}/verse-inline-ask.png`})
  await page.keyboard.press('Escape')
  await page.getByTestId('lab-dbar-note').click()
  await page.keyboard.type('A temporary synthetic note')
  assert.equal(await page.getByRole('textbox', {name:'Highlight note'}).inputValue(), 'A temporary synthetic note', 'new desktop note focuses immediately')
  await page.screenshot({path:`${output}/verse-note-focus.png`})
  await page.getByRole('button', {name:'Delete Note',exact:true}).click()
  assert.equal(await page.getByRole('textbox', {name:'Highlight note'}).count(), 0, 'deleted note leaves no editor')
  const marginRoom = await page.locator('.source-margin-room').boundingBox()
  const sourceFrame = await host.boundingBox()
  assert(marginRoom && sourceFrame, 'blank margin has a hit surface')
  await page.mouse.click(marginRoom.x + marginRoom.width / 2, sourceFrame.y + 160)
  await page.keyboard.type('A note on blank paper')
  assert.equal(await page.getByRole('textbox', {name:'Highlight note'}).inputValue(), 'A note on blank paper', 'blank margin focuses its new note')
  await page.getByRole('button', {name:'Delete Note',exact:true}).click()
  await page.waitForTimeout(600) // Include the note autosave debounce: deletion must remain final.
  assert.equal(await page.getByRole('textbox', {name:'Highlight note'}).count(), 0)
  assert.equal(await page.locator('.source-margin-item').filter({hasText:'A note on blank paper'}).count(), 0, 'deleted note is not restored by autosave')
  await page.screenshot({path:`${output}/verse-selection-note-deleted.png`})

  // Aa exposes Compare before a second version is configured. Pick a real
  // compatible version, return to Layout, then open the paired source view.
  await openSettings()
  await page.getByTestId('lab-v2-layout-compare').click()
  assert.equal(await page.getByTestId('lab-v2-sheet').getAttribute('data-layer'), 'compareEdition')
  await page.locator('[data-edition="web-en"]').click()
  assert.equal(await page.getByTestId('lab-v2-sheet').getAttribute('data-layer'), 'reading')
  await page.getByTestId('lab-v2-layout-compare').click()
  await page.waitForFunction(() => document.querySelector('.lab')?.dataset.continuousReader !== 'true')
  assert.equal(await page.locator('.lab').getAttribute('data-desktop-view'), 'compare')
  const bibleBeforeCompare = await saved('exodus')
  await observe('exodus-compare', 'exodus')
  await openSettings()
  await page.getByTestId('lab-v2-layout-margin').click()
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
  const verseText = macbethSource.chapters[0].paragraphs[1]
  const sidecarWord = verseText.slice(0, macbethLines.chapters['1']['1'][0]).trim().split(/\s+/).length
  const verseLineStarts = await host.evaluate(node => [...node.querySelectorAll('.lab-verse-line')]
    .map(line => line.querySelector('[data-testid="lab-word"][data-paragraph-index="1"]')?.getAttribute('data-word-index'))
    .filter(Boolean).map(Number))
  assert(verseLineStarts.includes(sidecarWord), `actual Shakespeare sidecar line break at source word ${sidecarWord}`)
  await observe('macbeth-verse', 'macbeth')
  await page.getByTestId('lab-chapter-note-open').first().click()
  const chapterNote = page.locator('[data-testid="source-margin-item"][data-open="true"]')
  await chapterNote.getByRole('textbox', { name: 'Chapter note', exact: true }).fill('A local note on Macbeth’s first scene.')
  await chapterNote.getByRole('button', { name: 'Minimise', exact: true }).click()
  await page.waitForFunction(() => JSON.parse(localStorage.getItem('tinct-lab-highlights') || '[]')
    .some(mark => mark.bookId === 'macbeth' && mark.chapterNumber === 1 && mark.kind === 'chapter' && mark.note === 'A local note on Macbeth’s first scene.'))
  // BSB stores each poetic half-line as a source paragraph. The visual poem
  // joins those lines while each painted word keeps its original paragraph.
  await page.evaluate(() => localStorage.setItem('tinct-lab-prefs', JSON.stringify({ primaryEdition: 'bsb-en', audioEdition: 'bsb-en', compareOpen: false })))
  await page.goto(`${origin}/reader?book=bible&edition=bsb-en&chapter=629&sharedReader=1`, { waitUntil: 'domcontentloaded' })
  await host.waitFor({ timeout: 45000 })
  await page.waitForFunction(() => {
    const lines = document.querySelectorAll('.continuous-reader .lab-hearing-line')
    return [...lines].some(line => line.querySelector('[data-paragraph-index="0"]') && line.querySelector('[data-paragraph-index="1"]'))
  }, null, { timeout: 15000 })
  assert((await host.locator('.lab-prose-join [data-paragraph-index="1"]').count()) > 0, 'poetry line joins retain second source paragraph coordinates')
  await observe('bsb-proverbs-poetry', 'proverbs')
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
  await page.locator('[data-testid="lab-chapter-notes-beat"]:visible').first().waitFor()
  assert(chapterActions.some(item => item.kind === 'notes' && item.request.bookId === 'frankenstein' && item.request.chapterNumber === 2 && item.request.kind === 'primer'), 'Primer request is source/chapter-bound')
  await host.locator('[data-testid="source-margin-item"][data-open="true"]').getByTestId('source-margin-minimise').click()
  await page.getByTestId('lab-super').click()
  await page.getByTestId('lab-super-row-summarize').click()
  await page.locator('[data-testid="lab-chapter-notes-beat"]:visible').first().waitFor()
  assert(chapterActions.some(item => item.kind === 'notes' && item.request.bookId === 'frankenstein' && item.request.chapterNumber === 2 && item.request.kind === 'end'), 'Recap request is source/chapter-bound')
  await host.locator('[data-testid="source-margin-item"][data-open="true"]').getByTestId('source-margin-minimise').click()
  await page.getByTestId('lab-super').click()
  await page.getByTestId('lab-super-row-catchup').click()
  await page.getByTestId('lab-catch-up-here').waitFor()
  assert((await page.getByTestId('lab-catch-up-entry').count()) > 0, 'Catch me up has prior source units')
  assert(chapterActions.filter(item => item.kind === 'catchup').every(item => item.request.bookId === 'frankenstein' && item.request.placeChapter === 2), 'Catch me up cannot include current or later chapter')
  await host.locator('[data-testid="source-margin-item"][data-open="true"]').getByTestId('source-margin-minimise').click()
  assert.deepEqual(await saved('frankenstein'), beforeActions, 'chapter cards never move the semantic source place')

  // The private switch leaves the known phone Read/Compare path and flag-off
  // desktop page layout available, with no continuous source renderer there.
  await page.setViewportSize({ width: 360, height: 780 })
  await page.goto(`${origin}/reader?book=frankenstein&sharedReader=1&layout=phone`, { waitUntil: 'domcontentloaded' })
  await page.waitForFunction(() => document.querySelector('.lab')?.dataset.readerReady === 'true', null, { timeout: 45000 })
  assert.equal(await page.locator('.lab').getAttribute('data-lab-layout'), 'phone')
  assert.equal(await host.count(), 0, 'phone keeps the familiar paged React reader')
  await observe('frankenstein-phone', 'frankenstein')
  await page.evaluate(() => {
    const prefs = JSON.parse(localStorage.getItem('tinct-lab-prefs') || '{}')
    prefs.shared = { ...prefs.shared, primaryEdition: 'kjv-en', audioEdition: 'kjv-en', compareEdition: 'web-en', compareOpen: true, compareChosen: true }
    localStorage.setItem('tinct-lab-prefs', JSON.stringify(prefs))
  })
  await page.goto(`${origin}/reader?book=bible&edition=kjv-en&chapter=1&sharedReader=1&layout=phone`, { waitUntil: 'domcontentloaded' })
  await page.waitForFunction(() => document.querySelector('.lab')?.dataset.readerReady === 'true', null, { timeout: 45000 })
  await page.getByTestId('lab-super').click()
  await page.getByTestId('lab-super-row-editions').click()
  await page.getByTestId('lab-v2-show-compare').waitFor({ timeout: 15000 })
  await page.getByTestId('lab-v2-show-compare').click()
  await page.waitForFunction(() => document.querySelector('.lab')?.dataset.compareActive === 'true')
  assert.equal(await page.getByTestId('lab-v2-show-compare').count(), 0, 'phone Compare closes settings and opens paired edition')
  await page.getByTestId('lab-super').click()
  await page.getByTestId('lab-super-row-editions').click()
  assert.equal(await page.getByTestId('lab-v2-show-compare').getAttribute('aria-checked'), 'true', 'phone Compare is selected in book settings')
  await page.getByTestId('lab-v2-show-compare').click()
  await page.waitForFunction(() => document.querySelector('.lab')?.dataset.compareActive === 'false')
  assert.equal(await host.count(), 0, 'phone Read and Compare retain the paged surface')
  await observe('bible-phone-read-after-compare', 'genesis')
  await page.goto(`${origin}/reader?book=frankenstein&sharedReader=0`, { waitUntil: 'domcontentloaded' })
  await page.waitForFunction(() => document.querySelector('.lab')?.dataset.readerReady === 'true', null, { timeout: 45000 })
  assert.equal(await page.locator('.lab').getAttribute('data-shared-reader'), null, 'public flag-off route does not enable private menu')
  assert.equal(await host.count(), 0)

  assert.deepEqual(errors, [], `page errors: ${errors.join('; ')}`)
  console.log(`Shared reader position check passed. ${observations.length} observations and screenshots: ${output}`)
} catch (error) {
  await page.screenshot({ path: `${output}/failure.png` }).catch(() => {})
  await fs.writeFile(`${output}/failure.json`, JSON.stringify(await page.evaluate(() => ({
    root: { ...document.querySelector('.lab')?.dataset },
    sheet: document.querySelector('[data-testid="lab-v2-sheet"]')?.outerHTML,
    prefs: Object.fromEntries(Object.keys(localStorage).filter(key => key.includes('prefs')).map(key => [key, localStorage.getItem(key)])),
  })).catch(() => ({})), null, 2))
  throw error
} finally {
  await fs.writeFile(`${output}/results.json`, JSON.stringify({ observations, chapterActions, errors }, null, 2))
  await browser.close()
}
