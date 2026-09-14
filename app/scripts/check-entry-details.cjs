const { chromium, webkit } = require('playwright')
const assert = require('node:assert/strict')
const fs = require('node:fs')

const origin = process.env.TEST_ORIGIN || 'http://127.0.0.1:5192'
const dir = process.env.ARTIFACT_DIR || '/tmp/tinct-entry-details'
fs.mkdirSync(dir, { recursive: true })

async function openAndExpandPreface(page, bookId) {
  await page.evaluate(id => window.__tinctLabPreReader.openBookPage(id), bookId)
  const toggle = page.locator('[data-inline-preface]:not([hidden])')
  await toggle.waitFor()
  const cover = page.locator('[data-book-detail-cover]')
  const before = await cover.boundingBox()
  await toggle.click()
  const after = await cover.boundingBox()
  assert.ok(before && after)
  assert.ok(Math.abs(before.y - after.y) < 1, `${bookId} cover moved ${after.y - before.y}px when its preface opened`)
  assert.equal(await page.locator('.tov5-book-detail-zoom').getAttribute('class').then(value => value.includes('is-preface-expanded')), true)
  return { toggle, cover }
}

async function assertActionReachable(page, label) {
  const action = page.locator('[data-open-picker]')
  assert.equal(await action.isVisible(), true, `${label}: reader action is not visible`)
  const position = await action.evaluate(element => getComputedStyle(element).position)
  assert.equal(position, 'fixed', `${label}: reader action does not remain pinned`)
  const box = await action.boundingBox()
  assert.ok(box && box.y >= 0 && box.y + box.height <= await page.evaluate(() => innerHeight), `${label}: reader action left the viewport`)
}

;(async () => {
  for (const [engine, width, height] of [[chromium, 1440, 900], [webkit, 360, 844]]) {
    const browser = await engine.launch()
    try {
      const page = await browser.newPage({ viewport: { width, height }, isMobile: width < 900, hasTouch: true })
      await page.goto(`${origin}/`)
      await page.waitForFunction(() => window.__tinctLabPreReader?.ready)

      if (width >= 900) {
        await page.locator('[data-entry-motion]').waitFor({ state: 'visible' })
        const column = page.locator('.entry-cover-column').first()
        const transform = await column.evaluate(element => getComputedStyle(element).transform)
        await page.waitForTimeout(250)
        assert.notEqual(await column.evaluate(element => getComputedStyle(element).transform), transform)
        await page.locator('[data-entry-motion]').click()
        assert.equal(await column.evaluate(element => getComputedStyle(element).animationPlayState), 'paused')
      }

      await page.locator('[data-start-catalogue]').click()
      if (width >= 900) {
        const shelf = page.locator('[data-popular-shelf]')
        await page.locator('[data-shelf-scroll="1"]').click()
        await page.waitForTimeout(650)
        assert.ok(await shelf.evaluate(element => element.scrollLeft) > 0)
        await page.locator('[data-search-toggle]').click()
        await page.locator('[data-library-search]').fill('odyssey')
        await page.locator('[data-search-results] [data-catalogue-book]').first().waitFor()
        assert.equal(await page.locator('[data-search-results] [data-catalogue-book]').count(), 1)
        await page.keyboard.press('Escape')
      }

      // Held-out ordinary preface: opening and closing cannot move the cover.
      const ordinary = await openAndExpandPreface(page, 'crito')
      await assertActionReachable(page, 'short preface top')
      await ordinary.toggle.click()
      assert.equal(await page.locator('.tov5-book-detail-zoom').getAttribute('class').then(value => value.includes('is-preface-expanded')), false)

      // Long preface: the same action remains available at its top, middle and end.
      await openAndExpandPreface(page, 'notes-from-underground')
      const expected = fs.readFileSync('src/data/prefaces/notes-from-underground.txt', 'utf8').trim().split(/\n\s*\n/)
      assert.deepEqual(await page.locator('[data-inline-preface-body] p:not(.entry-preface-attribution)').allTextContents(), expected)
      await assertActionReachable(page, 'long preface top')
      await page.screenshot({ path: `${dir}/long-preface-top-${width}.png` })
      await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight / 2))
      await assertActionReachable(page, 'long preface middle')
      await page.locator('[data-inline-preface-body] p').last().scrollIntoViewIfNeeded()
      await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight))
      assert.ok(await page.locator('[data-inline-preface-body] p').last().isVisible())
      await assertActionReachable(page, 'long preface end')
      if (width < 900) {
        const last = await page.locator('[data-inline-preface-body] p').last().boundingBox()
        const action = await page.locator('[data-open-picker]').boundingBox()
        assert.ok(last && action && last.y + last.height < action.y, 'the phone action obscures the final preface line')
      }
      await page.screenshot({ path: `${dir}/long-preface-${width}.png` })
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1))
      assert.equal(await page.evaluate(() => Object.keys(localStorage).filter(key => /reading-log:|progress:|reading-position:/.test(key)).length), 0)
      await page.locator('[data-open-picker]').click()
      await page.waitForTimeout(500)
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1))
    } finally {
      await browser.close()
    }
  }
  console.log('Motion, search, stable covers, persistent preface action, no overflow/progress writes passed')
})().catch(error => { console.error(error); process.exit(1) })
