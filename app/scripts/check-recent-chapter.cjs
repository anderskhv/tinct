// Isolated guest state; uses real text and navigation. Run from app/.
const { chromium, webkit } = require('playwright')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const origin = process.env.TEST_ORIGIN || 'http://127.0.0.1:5191'
const engine = process.env.ENGINE || 'chromium'
const artifacts = process.env.ARTIFACT_DIR || '/tmp/tinct-reader-return'
fs.mkdirSync(artifacts, { recursive: true })
async function choose(page, chapter) {
  await page.waitForFunction(() => document.querySelector('.lab')?.dataset.readerReady === 'true')
  await page.getByTestId('lab-header-chapter').click()
  await page.getByRole('button', { name: 'Search contents' }).click()
  const search = page.getByPlaceholder('Words or a chapter reference')
  await search.click()
  await search.fill('')
  await search.pressSequentially(chapter, { delay: 20 })
  assert.equal(await search.inputValue(), chapter)
  try {
    await page.getByTestId('lab-toc').getByRole('button', { name: chapter, exact: true }).click()
  } catch (error) {
    await page.screenshot({ path: path.join(artifacts, `${engine}-search-failure.png`) })
    console.error(await page.getByTestId('lab-toc').innerText(), await page.getByPlaceholder('Words or a chapter reference').inputValue())
    throw error
  }
}
async function main() {
  const browser = await (engine === 'webkit' ? webkit : chromium).launch()
  try {
    for (const desktop of [false, true]) {
      const page = await browser.newPage({ viewport: desktop ? { width: 1440, height: 900 } : { width: 390, height: 844 }, isMobile: !desktop, hasTouch: !desktop })
      await page.addInitScript(() => {
        if (sessionStorage.getItem('return-fixture-seeded')) return
        sessionStorage.setItem('return-fixture-seeded', '1')
        const place = { bookId: 'proverbs', headerBook: 'Proverbs', chapterNumber: 17, sequentialChapter: 645, paragraphIndex: 3, wordIndex: 7, primaryEditionKey: 'kjv-en', updatedAt: Date.now() - 86400000, deviceId: 'fixture', rev: 1 }
        localStorage.setItem('tinct-lab-position', JSON.stringify({ books: { proverbs: place }, recentChapters: { 'proverbs:645': place }, finished: {}, hidden: {}, lastSettledBookId: 'proverbs', lastSettledAt: place.updatedAt, updatedAt: place.updatedAt, deviceId: 'fixture' }))
        sessionStorage.setItem('tinct:lab-reader-handoff', JSON.stringify({ kind: 'open-reader', bookId: 'bible', primaryEditionKey: 'kjv-en', savedPlace: { bookId: 'bible', chapterNumber: 789, paragraphIndex: 0, page: 0 } }))
      })
      await page.goto(origin + '/reader')
      await page.getByTestId('lab-header-chapter').waitFor()
      await choose(page, 'Proverbs 17')
      const pill = page.getByTestId('lab-continue-chapter')
      await pill.waitFor()
      assert.equal(await page.getByTestId('lab-root').getAttribute('data-place'), '0:0')
      await page.screenshot({ path: path.join(artifacts, `${engine}-continue-${desktop ? 'desktop' : 'phone'}.png`) })
      await pill.click()
      await page.waitForFunction(() => document.querySelector('.lab')?.dataset.place === '3:7')
      await page.locator('.lab-page-wrap > .lab-passage [data-paragraph-index="3"][data-word-index="7"]').first().waitFor({ state: 'visible' })
      assert.equal(await pill.count(), 0)
      // A reload must preserve the chapter bookmark, including after opening another chapter.
      await choose(page, 'Jeremiah 44')
      await page.waitForFunction(() => document.querySelector('.lab')?.dataset.chapter === '789')
      await page.reload()
      await page.getByTestId('lab-header-chapter').waitFor()
      await choose(page, 'Proverbs 17')
      await pill.waitFor()
      await pill.click()
      await page.waitForFunction(() => document.querySelector('.lab')?.dataset.place === '3:7')
      await page.screenshot({ path: path.join(artifacts, `${engine}-resumed-${desktop ? 'desktop' : 'phone'}.png`) })
      console.log(JSON.stringify({ engine, desktop, chapter: 'Proverbs 17', start: '0:0', resumed: '3:7', survivedReload: true }))
      await page.close()
    }
  } finally { await browser.close() }
}
main().catch(error => { console.error(error); process.exitCode = 1 })
