/**
 * Regression tests for column overflow bleed.
 *
 * Two bugs, both expressed as "a strip of column 2 shows past the right
 * edge of the paginated reader":
 *
 * 1. Desktop page-turn/panel-toggle: the .reader-columns has
 *    `transition: transform 0.3s ease`. During a panel toggle the container
 *    resizes and we update column-width instantly, but translateX lerps
 *    over 300ms — so mid-transition translateX doesn't land on an integer
 *    multiple of (colW + gap) and a sliver bleeds in.
 *    Fix: add .resizing class during ResizeObserver bursts that disables the
 *    transform transition; imperatively sync column-width + translateX each
 *    frame.
 *
 * 2. Mobile static bleed: the desktop rule
 *    `.panel-closed .reader-columns { padding-right: 90px }` (reserves space
 *    for the floating "Tinct" toggle tab) also matches on mobile where the
 *    tab is hidden. That shrinks the content box so column 2 starts before
 *    the container's right edge and ~50px of it peeks through.
 *    Fix: re-set padding-right: 16px inside the mobile media query.
 */
import { expect, test } from '@playwright/test'

const BASE_URL = process.env.BASE_URL || 'http://localhost:4173'

const SEED = () => {
  localStorage.setItem('tinct:library', JSON.stringify(['odyssey']))
  localStorage.setItem('tinct:currentBookId', JSON.stringify('odyssey'))
  localStorage.setItem('tinct:preferences', JSON.stringify({ onboardingComplete: true, accountDecisionSeen: true }))
}

const readColumnsState = async (page: import('@playwright/test').Page) => {
  return await page.evaluate(() => {
    const el = document.querySelector('.reader-columns') as HTMLElement
    if (!el) return null
    const transform = getComputedStyle(el).transform
    let tx = 0
    if (transform !== 'none') {
      const match = transform.match(/matrix\([^)]+\)/)
      if (match) {
        const parts = match[0].replace(/matrix\(|\)/g, '').split(',').map(s => parseFloat(s.trim()))
        tx = parts[4] || 0
      }
    }
    const cs = getComputedStyle(el)
    const container = el.parentElement as HTMLElement
    const containerBox = container.getBoundingClientRect()
    const contentBox = el.getBoundingClientRect()
    return {
      tx,
      columnWidth: parseFloat(cs.columnWidth) || 0,
      columnGap: parseFloat(cs.columnGap) || 0,
      paddingLeft: parseFloat(cs.paddingLeft) || 0,
      paddingRight: parseFloat(cs.paddingRight) || 0,
      containerWidth: containerBox.width,
      contentWidth: contentBox.width,
      hasResizing: el.classList.contains('resizing'),
    }
  })
}

const stepErr = (s: { tx: number; columnWidth: number; columnGap: number }) => {
  if (s.columnWidth <= 0) return 1
  const step = s.columnWidth + s.columnGap
  const n = Math.abs(s.tx) / step
  return Math.abs(n - Math.round(n))
}

test('desktop: panel toggle on page 2 keeps translateX aligned with columns', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await context.newPage()

  await page.addInitScript(SEED)
  await page.goto(BASE_URL, { waitUntil: 'commit' })
  await page.waitForSelector('.reader-columns', { timeout: 20000 })
  await page.waitForTimeout(2000)
  const hasStore = await page.evaluate(() => !!document.querySelector('.store'))
  if (hasStore) throw new Error('BookStore still visible — seeding failed')

  const columns = page.locator('.reader-columns').first()
  await expect(columns).toBeVisible()

  const totalPages = await page.evaluate(() => {
    const label = document.querySelector('.page-nav-label')
    if (!label) return 0
    const text = label.textContent || ''
    const match = text.match(/(\d+)\s*\/\s*(\d+)/)
    return match ? parseInt(match[2], 10) : 0
  })
  test.skip(totalPages < 2, 'Need a chapter with >=2 pages to test')

  await page.keyboard.press('ArrowRight')
  await page.waitForTimeout(500)

  const before = await readColumnsState(page)
  expect(before).not.toBeNull()
  expect(before!.hasResizing).toBe(false)
  expect(stepErr(before!)).toBeLessThan(0.01)

  await page.click('.panel-toggle-tab')

  await page.waitForFunction(() => {
    const el = document.querySelector('.reader-columns') as HTMLElement
    return el?.classList.contains('resizing')
  }, { timeout: 1000 })

  // Mid-transition: sample every ~30ms for 300ms. At every sample, translateX
  // must land on an integer multiple of (colW + gap). Without the .resizing
  // class disabling the transform transition, translateX would lerp and show
  // non-integer multiples — the sliver bug.
  const samples: number[] = []
  for (let i = 0; i < 10; i++) {
    const s = await readColumnsState(page)
    if (s && s.columnWidth > 0) samples.push(stepErr(s))
    await page.waitForTimeout(30)
  }
  expect(Math.max(...samples)).toBeLessThan(0.01)

  await page.waitForTimeout(900)

  const after = await readColumnsState(page)
  expect(after).not.toBeNull()
  expect(after!.hasResizing).toBe(false)
  expect(stepErr(after!)).toBeLessThan(0.01)

  await context.close()
})

test('mobile: column 2 is fully clipped — no static bleed past right edge', async ({ browser }) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
  })
  const page = await context.newPage()
  await page.addInitScript(SEED)
  await page.goto(BASE_URL, { waitUntil: 'commit' })
  await page.waitForSelector('.reader-columns', { timeout: 20000 })
  await page.waitForTimeout(2000)

  const hasStore = await page.evaluate(() => !!document.querySelector('.store'))
  if (hasStore) throw new Error('BookStore still visible — seeding failed')

  await page.evaluate(() => {
    const layout = document.querySelector('.main-layout') as HTMLElement
    if (layout && !layout.classList.contains('panel-closed')) {
      layout.classList.add('panel-closed')
    }
  })
  await page.waitForTimeout(200)

  const s = await readColumnsState(page)
  expect(s).not.toBeNull()

  // The second column starts at (contentWidth + columnGap) inside the content
  // box — in absolute container coords: paddingLeft + columnWidth + columnGap.
  // That position must be >= containerWidth; otherwise column 2 bleeds in.
  const col2Start = s!.paddingLeft + s!.columnWidth + s!.columnGap
  expect(col2Start).toBeGreaterThanOrEqual(s!.containerWidth - 0.5)

  // Mobile padding-right is 16px. The desktop override was 90px.
  expect(s!.paddingRight).toBeLessThanOrEqual(20)

  await context.close()
})
