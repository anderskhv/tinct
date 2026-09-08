// Run from app/: node scripts/browser-reader-refresh.cjs [base URL] [artifact directory]
// Isolated browser storage; recap requests are blocked to avoid development model calls.
const { chromium } = require('playwright')
const fs = require('node:fs')
const path = require('node:path')
const [base = 'http://127.0.0.1:5175', out = '/tmp/tinct-reader-refresh'] = process.argv.slice(2)
const assert = (value, message) => { if (!value) throw new Error(message) }
fs.mkdirSync(out, { recursive: true })
;(async () => {
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } })
  const errors = [], checks = []
  page.on('pageerror', error => errors.push(error.message))
  await page.route('**/api/lab-recap', route => route.fulfill({ status: 503, contentType: 'application/json', body: '{}' }))
  const ready = async () => {
    await page.waitForFunction(() => document.querySelector('[data-reader-ready="true"]'))
    await page.waitForTimeout(1200)
  }
  const snapshot = () => page.evaluate(() => ({
    place: document.querySelector('[data-testid="lab-root"]').getAttribute('data-place'),
    text: document.querySelector('.lab-page-wrap').innerText.slice(0, 180),
  }))
  try {
    await page.goto(base + '/lab/phone?chrome=v2', { waitUntil: 'networkidle' })
    await ready()
    // These accessibility controls are visually hidden on the mobile layout.
    for (let i = 0; i < 8; i++) {
      await page.getByTestId('lab-page-next').dispatchEvent('click')
      await page.waitForTimeout(200)
    }
    for (let i = 0; i < 3; i++) {
      const before = await snapshot()
      await page.screenshot({ path: path.join(out, `before-${i}.png`) })
      await page.reload({ waitUntil: 'networkidle' })
      await ready()
      const after = await snapshot()
      assert(before.place === after.place, 'Reload changed the saved paragraph/word')
      assert(before.text === after.text, `Reload changed visible text: ${JSON.stringify({ before, after })}`)
      checks.push({ reload: i + 1, ...after })
      await page.screenshot({ path: path.join(out, `after-${i}.png`) })
    }
    // Several public books make the formerly empty leading shelf space visible.
    await page.evaluate(() => {
      const state = JSON.parse(localStorage.getItem('tinct-lab-position'))
      const source = Object.values(state.books)[0]
      for (const [bookId, title] of [['romeo-and-juliet', 'Romeo and Juliet'], ['odyssey', 'The Odyssey'], ['pride-and-prejudice', 'Pride and Prejudice']]) {
        state.books[bookId] = { ...source, bookId, headerBook: title, chapterNumber: 1, sequentialChapter: 1, paragraphIndex: 0, wordIndex: 0, updatedAt: Date.now() - 60000 }
      }
      localStorage.setItem('tinct-lab-position', JSON.stringify(state))
    })
    await page.goto(base + '/lab/library', { waitUntil: 'networkidle' })
    await page.getByRole('button', { name: 'Continue reading', exact: true }).waitFor()
    await page.waitForTimeout(1000)
    const library = await page.evaluate(() => {
      const popular = document.querySelector('[data-library-popular]')
      const summary = document.querySelector('.lib-recap-summary')
      const cover = document.querySelector('.lib-now-item').getBoundingClientRect()
      const cta = document.querySelector('.lib-now-cta').getBoundingClientRect()
      const search = document.querySelector('.lib-search').getBoundingClientRect()
      return { hiddenPopular: !popular || getComputedStyle(popular).display === 'none', summaryHidden: !summary || getComputedStyle(summary).display === 'none', firstCoverLeft: cover.left, gapAfterButton: search.top - cta.bottom, books: document.querySelectorAll('.lib-now-item').length }
    })
    assert(library.hiddenPopular, 'Hidden popular shelf still takes space')
    assert(library.summaryHidden, 'Missing recap still takes space')
    assert(library.firstCoverLeft >= 10 && library.firstCoverLeft < 40, 'First cover is parked in the middle')
    assert(library.gapAfterButton < 70, 'Empty gap remains below Continue reading')
    checks.push({ library })
    await page.screenshot({ path: path.join(out, 'library.png'), fullPage: true })
    assert(errors.length === 0, errors.join('\n'))
    fs.writeFileSync(path.join(out, 'report.json'), JSON.stringify({ checks, errors }, null, 2))
    console.log(JSON.stringify({ checks, errors }))
  } catch (error) {
    await page.screenshot({ path: path.join(out, 'failure.png') })
    console.error(error)
    process.exitCode = 1
  } finally { await browser.close() }
})()
