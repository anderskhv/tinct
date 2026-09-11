import { expect, test, type Browser, type BrowserContext, type Page } from '@playwright/test'
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const ARTIFACT_DIR = process.env.ARTIFACT_DIR || '/tmp/tinct-reader-quality-pass-artifacts'
const PHONE_UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148'
const FONT_SIZES = Array.from({ length: 15 }, (_, index) => Number((0.8 + index * 0.1).toFixed(1)))

type ReaderSeed = {
  bookId: string
  primaryEditionKey: string
  chapterNumber?: number
  fontSize?: number
}

function readerContext(browser: Browser, width: number, height: number, phone = false): Promise<BrowserContext> {
  return browser.newContext({
    viewport: { width, height },
    isMobile: phone,
    hasTouch: phone,
    userAgent: phone ? PHONE_UA : undefined,
  })
}

async function putReaderState(page: Page, seed: ReaderSeed): Promise<void> {
  await page.evaluate((value) => {
    localStorage.setItem('tinct-lab-prefs', JSON.stringify({
      primaryEdition: value.primaryEditionKey,
      theme: 'light',
      alignment: 'justify',
      fontSize: value.fontSize,
    }))
    sessionStorage.setItem('tinct:lab-reader-handoff', JSON.stringify({
      kind: 'open-reader',
      bookId: value.bookId,
      primaryEditionKey: value.primaryEditionKey,
      savedPlace: {
        bookId: value.bookId,
        chapterNumber: value.chapterNumber || 1,
        paragraphIndex: 0,
        page: 0,
      },
    }))
  }, seed)
}

async function openReader(page: Page, seed: ReaderSeed): Promise<void> {
  await page.goto('/lab/reader', { waitUntil: 'domcontentloaded' })
  await putReaderState(page, seed)
  await page.reload({ waitUntil: 'networkidle' })
  await expect(page.getByTestId('lab-root')).toHaveAttribute('data-book-id', seed.bookId)
  await expect(page.getByTestId('lab-root')).toHaveAttribute('data-reader-ready', 'true')
  await expect(page.getByTestId('lab-chapter-cover')).toHaveCount(0)
  await page.evaluate(() => document.fonts.ready)
  if (await page.getByTestId('lab-root').getAttribute('data-lab-layout') === 'phone') {
    await expect(page.getByTestId('lab-native-page-measure')).toBeAttached()
  }
  await page.waitForTimeout(250)
}

async function paintedPage(page: Page) {
  return page.evaluate(() => {
    const book = document.querySelector<HTMLElement>('[data-testid="lab-book"]')!
    const wrap = document.querySelector<HTMLElement>('.lab-page-wrap')!
    const passage = book.closest<HTMLElement>('.lab-passage') || book
    const words = [...book.querySelectorAll<HTMLElement>('.lab-hearing-word')]
    const wordRects = words.flatMap(word => [...word.getClientRects()])
      .filter(rect => rect.height > 8 && rect.width > 0)
    const bars = [...document.querySelectorAll<HTMLElement>(
      '.lab-phone-bar, .lab-page-turn, .lab-phone-transport, .lab-hearing-transport',
    )]
      .map(node => node.getBoundingClientRect())
      .filter(rect => rect.height > 1 && rect.top > 0)
    const line = book.querySelector<HTMLElement>('.lab-hearing-line')
    const chromeTop = bars.length ? Math.min(...bars.map(rect => rect.top)) : wrap.getBoundingClientRect().bottom
    const lastBottom = wordRects.length ? Math.max(...wordRects.map(rect => rect.bottom)) : 0
    const lineHeight = Number.parseFloat(line ? getComputedStyle(line).lineHeight : '0')
    const text = (book.textContent || '').replace(/Keep this passage/g, '').replace(/\s+/g, ' ').trim()
    return {
      text,
      words: words.length,
      lastBottom,
      chromeTop,
      lineHeight,
      clear: chromeTop - lastBottom,
      usableSlack: chromeTop - 24 - lastBottom,
      wrapOverflow: wrap.scrollHeight - wrap.clientHeight,
      passageOverflow: passage.scrollHeight - passage.clientHeight,
    }
  })
}

async function touchTurn(page: Page, direction: -1 | 1): Promise<void> {
  const box = await page.getByTestId('lab-book').boundingBox()
  if (!box) throw new Error('Reader page has no touch bounds')
  await page.touchscreen.tap(direction > 0 ? box.x + box.width - 6 : box.x + 6, box.y + box.height / 2)
}

test.beforeAll(() => mkdirSync(ARTIFACT_DIR, { recursive: true }))

test('font-settled phone pages fit and efficiently use the painted content rectangle at every exposed size', async ({ browser }) => {
  test.setTimeout(240_000)
  const context = await readerContext(browser, 390, 844, true)
  const page = await context.newPage()
  const evidence: Array<{ fontSize: number; first: Awaited<ReturnType<typeof paintedPage>>; next: Awaited<ReturnType<typeof paintedPage>> }> = []

  for (const fontSize of FONT_SIZES) {
    await openReader(page, { bookId: 'bible', primaryEditionKey: 'kjv-en', fontSize })
    const first = await paintedPage(page)
    expect(first.text, `font ${fontSize} first-page text`).not.toBe('')
    expect(first.wrapOverflow, `font ${fontSize} wrap overflow`).toBeLessThanOrEqual(1)
    expect(first.passageOverflow, `font ${fontSize} passage overflow`).toBeLessThanOrEqual(2)
    expect(first.clear, `font ${fontSize} chrome clearance`).toBeGreaterThan(23)
    expect(first.usableSlack, `font ${fontSize} avoid obvious underfill`).toBeLessThanOrEqual(first.lineHeight * 2.6)

    const firstPlace = await page.getByTestId('lab-root').getAttribute('data-place')
    await touchTurn(page, 1)
    await expect.poll(() => page.getByTestId('lab-root').getAttribute('data-place')).not.toBe(firstPlace)
    await page.waitForTimeout(100)
    const next = await paintedPage(page)
    expect(next.text, `font ${fontSize} second-page text`).not.toBe('')
    expect(next.wrapOverflow, `font ${fontSize} second wrap overflow`).toBeLessThanOrEqual(1)
    expect(next.passageOverflow, `font ${fontSize} second passage overflow`).toBeLessThanOrEqual(2)
    expect(next.clear, `font ${fontSize} second chrome clearance`).toBeGreaterThan(23)
    expect(next.usableSlack, `font ${fontSize} second avoid obvious underfill`).toBeLessThanOrEqual(next.lineHeight * 2.6)
    await touchTurn(page, -1)
    await expect.poll(() => page.getByTestId('lab-root').getAttribute('data-place')).toBe(firstPlace)
    evidence.push({ fontSize, first, next })
  }

  writeFileSync(join(ARTIFACT_DIR, 'pagination-font-sizes-390x844.json'), JSON.stringify(evidence, null, 2))
  await openReader(page, { bookId: 'bible', primaryEditionKey: 'kjv-en', fontSize: 1.3 })
  await page.waitForTimeout(250)
  await page.screenshot({ path: join(ARTIFACT_DIR, 'pagination-390x844.png') })
  await context.close()
})

for (const viewport of [
  { name: 'iphone-15', width: 393, height: 852, phone: true },
  { name: 'tablet', width: 768, height: 1024, phone: false },
  { name: 'desktop', width: 1440, height: 900, phone: false },
]) {
  test(`representative prose remains fitted at ${viewport.width}x${viewport.height}`, async ({ browser }) => {
    const context = await readerContext(browser, viewport.width, viewport.height, viewport.phone)
    const page = await context.newPage()
    await openReader(page, { bookId: 'meditations', primaryEditionKey: 'original-en', chapterNumber: 4, fontSize: 1.3 })
    const measurement = await paintedPage(page)
    expect(measurement.text).not.toBe('')
    expect(measurement.wrapOverflow).toBeLessThanOrEqual(1)
    expect(measurement.passageOverflow).toBeLessThanOrEqual(2)
    expect(measurement.clear).toBeGreaterThan(23)
    await page.screenshot({ path: join(ARTIFACT_DIR, `pagination-${viewport.name}.png`) })
    writeFileSync(join(ARTIFACT_DIR, `pagination-${viewport.name}.json`), JSON.stringify(measurement, null, 2))
    await context.close()
  })
}

test('desktop Chat occupies the secondary reading region and scrolls answers independently', async ({ browser }) => {
  const context = await readerContext(browser, 1440, 900)
  const page = await context.newPage()
  const reply = Array.from({ length: 32 }, (_, index) => `Paragraph ${index + 1} explains the passage in **book context**.`).join('\n\n')
  await page.route('**/api/lab-chat', route => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ content: [{ text: reply }] }),
  }))
  await openReader(page, { bookId: 'meditations', primaryEditionKey: 'original-en', chapterNumber: 4 })

  const before = await page.getByTestId('lab-book').boundingBox()
  await page.getByTestId('lab-desktop-chat').click()
  const panel = page.getByTestId('lab-ask-pane')
  await expect(panel).toBeVisible()
  const [after, panelBox, railBox] = await Promise.all([
    page.getByTestId('lab-book').boundingBox(),
    panel.boundingBox(),
    page.getByTestId('lab-desktop-action-rail').boundingBox(),
  ])
  expect(after).toEqual(before)
  expect(panelBox?.width || 0).toBeGreaterThanOrEqual(500)
  expect(panelBox && before ? panelBox.x : 0).toBeGreaterThan((before?.x || 0) + (before?.width || 0) * 0.45)
  expect(panelBox && railBox ? panelBox.x + panelBox.width : Infinity).toBeLessThan(railBox?.x || 0)
  await expect(page.getByTestId('lab-book')).toBeVisible()

  const input = page.getByRole('textbox', { name: 'Ask' })
  await input.fill('What is the discipline in this passage?')
  await page.getByRole('button', { name: 'Send' }).click()
  await expect(input).toHaveValue('')
  await expect(page.getByTestId('lab-ask-turn-user')).toHaveCount(1)
  await expect(page.getByTestId('lab-ask-turn-assistant')).toHaveCount(1)
  await expect(page.getByTestId('lab-ask-turn-assistant').locator('strong').first()).toContainText('book context')

  const thread = page.getByTestId('lab-ask-thread')
  await expect.poll(() => thread.evaluate(node => node.scrollHeight > node.clientHeight)).toBe(true)
  const wrapScrollBefore = await page.locator('.lab-page-wrap').evaluate(node => node.scrollTop)
  await thread.evaluate(node => { node.scrollTop = 0 })
  await expect.poll(() => thread.evaluate(node => node.scrollTop)).toBe(0)
  expect(await page.locator('.lab-page-wrap').evaluate(node => node.scrollTop)).toBe(wrapScrollBefore)
  await page.screenshot({ path: join(ARTIFACT_DIR, 'desktop-chat-1440x900.png') })
  await context.close()
})

test('phone composition viewport changes do not write a new reading place or repaginate the return page', async ({ browser }) => {
  const context = await readerContext(browser, 390, 844, true)
  const page = await context.newPage()
  await openReader(page, { bookId: 'bible', primaryEditionKey: 'kjv-en' })
  const beforePlace = await page.getByTestId('lab-root').getAttribute('data-place')
  const beforeText = (await page.getByTestId('lab-book').innerText()).replace(/\s+/g, ' ')
  await page.getByTestId('lab-phone-chat').click()
  const input = page.getByRole('textbox', { name: 'Ask' })
  await input.focus()
  await input.fill('A question composed while the keyboard is visible')
  await page.setViewportSize({ width: 390, height: 560 })
  await page.waitForTimeout(150)
  expect(await page.getByTestId('lab-root').getAttribute('data-place')).toBe(beforePlace)
  await page.setViewportSize({ width: 390, height: 844 })
  await input.evaluate(node => (node as HTMLTextAreaElement).blur())
  await page.getByTestId('lab-listen').click()
  await expect(page.getByTestId('lab-book')).toBeVisible()
  expect((await page.getByTestId('lab-book').innerText()).replace(/\s+/g, ' ')).toBe(beforeText)
  expect(await page.getByTestId('lab-root').getAttribute('data-place')).toBe(beforePlace)
  await page.screenshot({ path: join(ARTIFACT_DIR, 'phone-chat-return-390x844.png') })
  await context.close()
})

test('passive phone chrome recedes and restores the chapter affordance without moving the page', async ({ browser }) => {
  const context = await readerContext(browser, 393, 852, true)
  const page = await context.newPage()
  await openReader(page, { bookId: 'bible', primaryEditionKey: 'kjv-en' })
  const pageBox = await page.getByTestId('lab-book').boundingBox()
  await touchTurn(page, 1)
  await expect(page.getByTestId('lab-root')).toHaveAttribute('data-reader-controls', 'hidden')
  const quiet = await page.evaluate(() => {
    const brand = document.querySelector<HTMLElement>('.lab-header-brand')!
    const chapter = document.querySelector<HTMLElement>('.lab-header-chapter')!
    return {
      opacity: getComputedStyle(brand).opacity,
      background: getComputedStyle(chapter).backgroundColor,
      pointerEvents: getComputedStyle(chapter).pointerEvents,
    }
  })
  await expect.poll(async () => Number(await page.locator('.lab-header-brand').evaluate(node => getComputedStyle(node).opacity))).toBeLessThan(0.7)
  await page.screenshot({ path: join(ARTIFACT_DIR, 'quiet-chrome-passive-393x852.png') })
  expect(quiet.background).toBe('rgba(0, 0, 0, 0)')
  expect(quiet.pointerEvents).toBe('none')
  const box = await page.getByTestId('lab-book').boundingBox()
  if (!box) throw new Error('Reader page has no centre tap target')
  await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2)
  await expect(page.getByTestId('lab-root')).toHaveAttribute('data-reader-controls', 'visible')
  const active = await page.evaluate(() => ({
    opacity: getComputedStyle(document.querySelector<HTMLElement>('.lab-header-brand')!).opacity,
    background: getComputedStyle(document.querySelector<HTMLElement>('.lab-header-chapter')!).backgroundColor,
    pointerEvents: getComputedStyle(document.querySelector<HTMLElement>('.lab-header-chapter')!).pointerEvents,
  }))
  expect(Number(active.opacity)).toBe(1)
  expect(active.background).not.toBe('rgba(0, 0, 0, 0)')
  expect(active.pointerEvents).toBe('auto')
  expect(await page.getByTestId('lab-book').boundingBox()).toEqual(pageBox)
  await page.screenshot({ path: join(ARTIFACT_DIR, 'quiet-chrome-393x852.png') })
  await context.close()
})
