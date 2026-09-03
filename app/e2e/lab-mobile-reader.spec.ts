import { expect, test, type Browser, type BrowserContext, type Page } from '@playwright/test'
import { mkdirSync } from 'node:fs'
import { join } from 'node:path'

const ARTIFACT_DIR = process.env.ARTIFACT_DIR || '/tmp/tinct-mobile-reader-qa-artifacts'

function normalized(text: string): string {
  return text.replace(/\s+/g, ' ').trim()
}

async function mobileReader(browser: Browser): Promise<{ context: BrowserContext; page: Page }> {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148',
  })
  const page = await context.newPage()
  return { context, page }
}

async function waitForReader(page: Page): Promise<void> {
  await page.goto('/lab/phone', { waitUntil: 'networkidle' })
  await expect(page.getByTestId('lab-reading-stage')).toBeVisible()
  await expect.poll(async () => normalized(await page.getByTestId('lab-reading-stage').innerText()).length).toBeGreaterThan(100)
  // The native column preflight and its painted-page correction settle over
  // consecutive frames. Interactions should exercise the committed page map.
  await page.waitForTimeout(900)
}

async function touchAtBookEdge(page: Page, edge: 'left' | 'right'): Promise<void> {
  const box = await page.getByTestId('lab-book').boundingBox()
  if (!box) throw new Error('Reading surface has no visible bounds')
  await page.touchscreen.tap(edge === 'left' ? box.x + 12 : box.x + box.width - 12, box.y + box.height / 2)
}

async function swipeBook(page: Page, direction: 'left' | 'right'): Promise<void> {
  const box = await page.getByTestId('lab-book').boundingBox()
  if (!box) throw new Error('Reading surface has no visible bounds')
  const session = await page.context().newCDPSession(page)
  const y = box.y + box.height * 0.5
  const fromX = box.x + box.width * (direction === 'left' ? 0.78 : 0.22)
  const toX = box.x + box.width * (direction === 'left' ? 0.22 : 0.78)
  await session.send('Input.dispatchTouchEvent', {
    type: 'touchStart',
    touchPoints: [{ x: fromX, y, radiusX: 5, radiusY: 5 }],
  })
  for (let step = 1; step <= 5; step += 1) {
    await session.send('Input.dispatchTouchEvent', {
      type: 'touchMove',
      touchPoints: [{ x: fromX + ((toX - fromX) * step) / 5, y, radiusX: 5, radiusY: 5 }],
    })
  }
  await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
  await session.detach()
}

async function stageText(page: Page): Promise<string> {
  return normalized(await page.getByTestId('lab-reading-stage').innerText())
}

test.beforeAll(() => mkdirSync(ARTIFACT_DIR, { recursive: true }))

test('mobile edge taps and swipes turn the visible page without exposing arrow controls', async ({ browser }) => {
  const { context, page } = await mobileReader(browser)
  await waitForReader(page)

  const firstPage = await stageText(page)
  await expect(page.getByTestId('lab-page-next')).toBeHidden()

  await touchAtBookEdge(page, 'right')
  await expect.poll(() => stageText(page)).not.toBe(firstPage)
  const secondPage = await stageText(page)
  expect(await page.getByTestId('lab-root').getAttribute('data-place')).not.toBe('0:0')
  await page.waitForTimeout(350)
  await page.screenshot({ path: join(ARTIFACT_DIR, 'mobile-edge-tap-next-390x844.png') })

  await touchAtBookEdge(page, 'left')
  await expect.poll(() => stageText(page)).toBe(firstPage)

  await swipeBook(page, 'left')
  await expect.poll(() => stageText(page)).toBe(secondPage)
  await swipeBook(page, 'right')
  await expect.poll(() => stageText(page)).toBe(firstPage)

  await page.screenshot({ path: join(ARTIFACT_DIR, 'mobile-edge-tap-return-390x844.png') })
  await context.close()
})

test('mobile Compare flips editions at the same primary anchor and returns without blank text', async ({ browser }) => {
  const { context, page } = await mobileReader(browser)
  await context.addInitScript(() => {
    localStorage.setItem('tinct-lab-prefs', JSON.stringify({
      compareOpen: true,
      primaryEdition: 'kjv-en',
      compareEdition: 'modern-en',
    }))
  })
  await waitForReader(page)

  const openingText = await stageText(page)
  await touchAtBookEdge(page, 'right')
  await expect.poll(() => stageText(page)).not.toBe(openingText)
  const settledPrimaryText = await stageText(page)
  expect(settledPrimaryText).toContain('God called the light Day')
  const primaryAnchor = await page.getByTestId('lab-root').getAttribute('data-place')
  expect(primaryAnchor).not.toBe('0:0')

  const bookBox = await page.getByTestId('lab-book').boundingBox()
  if (!bookBox) throw new Error('Reading surface has no visible bounds')
  await page.touchscreen.tap(bookBox.x + bookBox.width / 2, bookBox.y + bookBox.height / 2)
  await expect(page.getByTestId('lab-phone-compare')).toBeVisible()
  await page.getByTestId('lab-phone-compare').tap()

  await expect(page.getByTestId('lab-root')).toHaveAttribute('data-reader-edition', 'modern-en')
  await expect(page.getByTestId('lab-root')).toHaveAttribute('data-compare-active', 'true')
  await expect.poll(() => stageText(page)).not.toBe(settledPrimaryText)
  const compareText = await stageText(page)
  expect(compareText.length).toBeGreaterThan(100)
  expect(compareText).toContain('God called the light "Day"')
  expect(await page.getByTestId('lab-root').getAttribute('data-place')).toBe(primaryAnchor)
  await page.screenshot({ path: join(ARTIFACT_DIR, 'mobile-compare-modern-390x844.png') })

  await page.getByTestId('lab-phone-compare').tap()
  await expect(page.getByTestId('lab-root')).toHaveAttribute('data-reader-edition', 'kjv-en')
  await expect(page.getByTestId('lab-root')).toHaveAttribute('data-compare-active', 'false')
  await expect.poll(() => stageText(page)).toBe(settledPrimaryText)
  expect(await page.getByTestId('lab-root').getAttribute('data-place')).toBe(primaryAnchor)
  await page.screenshot({ path: join(ARTIFACT_DIR, 'mobile-compare-return-kjv-390x844.png') })

  await context.close()
})
