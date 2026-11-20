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
  await page.goto('/reader?layout=phone', { waitUntil: 'networkidle' })
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

test('the phone has no Compare: a Main version round trip returns to the same anchor without blank text', async ({ browser }) => {
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
  expect(settledPrimaryText).toContain('And God')
  const primaryAnchor = await page.getByTestId('lab-root').getAttribute('data-place')
  expect(primaryAnchor).not.toBe('0:0')

  // The phone has no Compare (Anders, 10 Nov 2026): Book settings switch the Main version,
  // and a round trip through the other edition returns to the same place.
  const readMain = async (edition: string) => {
    await page.getByTestId('lab-super').tap()
    await page.getByTestId('lab-super-row-editions').tap()
    await expect(page.getByTestId('lab-v2-show-compare')).toHaveCount(0)
    await page.getByTestId('lab-v2-main-edition').tap()
    await page.locator(`[data-edition="${edition}"]`).tap()
    await page.getByTestId('lab-v2-sheet-close').tap()
  }
  await expect(page.getByTestId('lab-phone-compare')).toHaveCount(0)
  await readMain('modern-en')

  await expect(page.getByTestId('lab-root')).toHaveAttribute('data-reader-edition', 'modern-en')
  await expect(page.getByTestId('lab-root')).toHaveAttribute('data-compare-active', 'false')
  await expect.poll(() => stageText(page)).not.toBe(settledPrimaryText)
  const otherText = await stageText(page)
  expect(otherText.length).toBeGreaterThan(100)
  expect(otherText).toContain('God')
  await page.screenshot({ path: join(ARTIFACT_DIR, 'mobile-main-modern-390x844.png') })

  await readMain('kjv-en')
  await expect(page.getByTestId('lab-root')).toHaveAttribute('data-reader-edition', 'kjv-en')
  await expect.poll(() => stageText(page)).toBe(settledPrimaryText)
  expect(await page.getByTestId('lab-root').getAttribute('data-place')).toBe(primaryAnchor)
  await page.screenshot({ path: join(ARTIFACT_DIR, 'mobile-main-return-kjv-390x844.png') })

  await context.close()
})


// ── Vertical swipe (Anders, 12 Nov 2026) ─────────────────────────────────
// On the phone page, swipe up is the next page and swipe down the previous
// one, through the same turn (animation, place, save) as a sideways swipe.
// Chromium drives real touches through CDP, so the browser's own touch-action
// and pan decisions are part of the test. WebKit has no CDP: there the swipe is
// the pointer and touch events Safari would deliver, dispatched on the element
// under the finger, so the reader's gesture code is what is exercised.

/** Every /api call answered locally: no AI or narration request leaves the check. */
async function mockApi(context: BrowserContext): Promise<void> {
  await context.route('**/api/**', route => {
    const url = new URL(route.request().url())
    if (url.pathname === '/api/lab-chapter-notes' && route.request().method() === 'POST') {
      const body = route.request().postDataJSON()
      const line = 'The chapter moves from one scene to the next, and this sentence is long enough to wrap a few times on a phone. '
      const beats = Array.from({ length: 4 }, (_, i) => ({ title: `Beat ${i + 1}`, text: `MOCK ${body.kind} beat ${i + 1}. ${line.repeat(5)}` }))
      return route.fulfill({ json: { beats, kind: body.kind, chapterNumber: body.chapterNumber, through: null, source: 'model' } })
    }
    return route.fulfill({ status: 404, contentType: 'application/json', body: '{"error":"mock"}' })
  })
}

async function touchReader(browser: Browser): Promise<{ context: BrowserContext; page: Page }> {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    // Playwright's Firefox has no isMobile; Chromium and WebKit both do.
    isMobile: browser.browserType().name() !== 'firefox',
    hasTouch: true,
    deviceScaleFactor: 2,
    serviceWorkers: 'block',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1',
  })
  await mockApi(context)
  return { context, page: await context.newPage() }
}

type Point = { x: number; y: number }

/** A quick one-finger drag from `from` to `to`, as real touch input where the browser allows it. */
async function touchDrag(page: Page, from: Point, to: Point, steps = 6): Promise<void> {
  if (page.context().browser()?.browserType().name() === 'chromium') {
    const session = await page.context().newCDPSession(page)
    await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ ...from, radiusX: 5, radiusY: 5 }] })
    for (let step = 1; step <= steps; step += 1) {
      await session.send('Input.dispatchTouchEvent', {
        type: 'touchMove',
        touchPoints: [{ x: from.x + ((to.x - from.x) * step) / steps, y: from.y + ((to.y - from.y) * step) / steps, radiusX: 5, radiusY: 5 }],
      })
    }
    await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
    await session.detach()
    return
  }
  await page.evaluate(({ from, to, steps }) => {
    const target = document.elementFromPoint(from.x, from.y)
    if (!target) throw new Error('nothing under the finger')
    const id = 7
    const pointer = (type: string, at: Point) => target.dispatchEvent(new PointerEvent(type, {
      bubbles: true, cancelable: true, composed: true, pointerId: id, pointerType: 'touch', isPrimary: true,
      clientX: at.x, clientY: at.y, button: type === 'pointermove' ? -1 : 0, buttons: type === 'pointerup' ? 0 : 1,
    }))
    const touch = (type: string, at: Point) => {
      // Desktop WebKit has TouchEvent but no Touch constructor: the pointer
      // stream above is then what the reader sees, as it is on iOS.
      let t: Touch
      try { t = new Touch({ identifier: id, target, clientX: at.x, clientY: at.y }) } catch { return }
      target.dispatchEvent(new TouchEvent(type, { bubbles: true, cancelable: true, composed: true, touches: type === 'touchend' ? [] : [t], targetTouches: type === 'touchend' ? [] : [t], changedTouches: [t] }))
    }
    pointer('pointerdown', from); touch('touchstart', from)
    for (let step = 1; step <= steps; step += 1) {
      const at = { x: from.x + ((to.x - from.x) * step) / steps, y: from.y + ((to.y - from.y) * step) / steps }
      pointer('pointermove', at); touch('touchmove', at)
    }
    pointer('pointerup', to); touch('touchend', to)
  }, { from, to, steps })
}

async function swipeOnPage(page: Page, direction: 'up' | 'down' | 'left' | 'right'): Promise<void> {
  const box = await page.getByTestId('lab-book').boundingBox()
  if (!box) throw new Error('Reading surface has no visible bounds')
  const cx = box.x + box.width * 0.5, cy = box.y + box.height * 0.5
  // Kept to the middle of the page: a touch that starts on a control (the
  // chapter heading's pills) is the control's, sideways or not.
  const dy = Math.min(120, box.height * 0.15), dx = box.width * 0.28
  const [from, to] = direction === 'up' ? [{ x: cx, y: cy + dy }, { x: cx + 6, y: cy - dy }]
    : direction === 'down' ? [{ x: cx, y: cy - dy }, { x: cx - 6, y: cy + dy }]
    : direction === 'left' ? [{ x: cx + dx, y: cy }, { x: cx - dx, y: cy + 4 }]
    : [{ x: cx - dx, y: cy }, { x: cx + dx, y: cy + 4 }]
  await touchDrag(page, from, to)
  // Let the turn and its save settle before the next gesture reads anything.
  await page.waitForTimeout(450)
}

async function savedPlace(page: Page): Promise<{ place: string | null; stored: unknown }> {
  return page.evaluate(() => {
    const root = document.querySelector('[data-testid="lab-root"]')
    const books = JSON.parse(localStorage.getItem('tinct-lab-position') || '{}').books || {}
    const stored = Object.fromEntries(Object.entries(books as Record<string, Record<string, unknown>>).map(([id, entry]) => {
      const { chapterNumber, paragraphIndex, wordIndex, pageIndex, editionKey } = entry || {}
      return [id, { chapterNumber, paragraphIndex, wordIndex, pageIndex, editionKey }]
    }))
    return { place: root?.getAttribute('data-place') ?? null, stored }
  })
}

test.describe('phone vertical swipe', () => {
  test('swipe up turns forward, swipe down back, and the saved place matches sideways turns', async ({ browser }, info) => {
    const engine = browser.browserType().name()
    const sideways = await touchReader(browser)
    const vertical = await touchReader(browser)
    await waitForReader(sideways.page)
    await waitForReader(vertical.page)
    const opening = await stageText(vertical.page)
    expect(await stageText(sideways.page)).toBe(opening)

    // The browser must never claim the page's vertical drag as a pan (that
    // would end it in pointercancel and, on iOS, pull the page down).
    const touchAction = await vertical.page.evaluate(() => {
      const word = document.querySelector('[data-testid="lab-reading-stage"] [data-testid="lab-word"]')
      const book = document.querySelector('[data-testid="lab-book"]')
      return { word: word && getComputedStyle(word).touchAction, book: book && getComputedStyle(book).touchAction, swipe: book?.classList.contains('has-vertical-swipe') }
    })
    expect(touchAction).toEqual({ word: 'pinch-zoom', book: 'pinch-zoom', swipe: true })

    // At the first page a swipe down does what a swipe right does there: the
    // book's opening page. Its page turns the same way back.
    await swipeOnPage(sideways.page, 'right')
    await swipeOnPage(vertical.page, 'down')
    await expect(sideways.page.getByTestId('lab-chapter-cover')).toBeVisible()
    await expect(vertical.page.getByTestId('lab-chapter-cover')).toBeVisible()
    expect(await savedPlace(vertical.page)).toEqual(await savedPlace(sideways.page))
    await vertical.page.screenshot({ path: join(ARTIFACT_DIR, `${engine}-vertical-swipe-down-at-first-page.png`) })
    await touchDrag(sideways.page, { x: 300, y: 440 }, { x: 90, y: 444 })
    await touchDrag(vertical.page, { x: 195, y: 560 }, { x: 199, y: 320 })
    await vertical.page.waitForTimeout(450)
    await expect.poll(() => stageText(vertical.page)).toBe(opening)
    await expect.poll(() => stageText(sideways.page)).toBe(opening)
    expect(await savedPlace(vertical.page)).toEqual(await savedPlace(sideways.page))

    const texts = [await stageText(vertical.page)]
    for (let turn = 1; turn <= 3; turn += 1) {
      await swipeOnPage(sideways.page, 'left')
      await swipeOnPage(vertical.page, 'up')
      await expect.poll(() => stageText(vertical.page)).not.toBe(texts[texts.length - 1])
      await expect.poll(() => stageText(sideways.page)).toBe(await stageText(vertical.page))
      texts.push(await stageText(vertical.page))
      if (turn === 1) await vertical.page.screenshot({ path: join(ARTIFACT_DIR, `${engine}-vertical-swipe-up-1.png`) })
    }
    await expect.poll(() => savedPlace(vertical.page)).toEqual(await savedPlace(sideways.page))
    const afterThree = await savedPlace(vertical.page)
    expect(afterThree.place).not.toBe('0:0')
    expect(Object.keys(afterThree.stored as object).length).toBeGreaterThan(0)

    await swipeOnPage(sideways.page, 'right')
    await swipeOnPage(vertical.page, 'down')
    await expect.poll(() => stageText(vertical.page)).toBe(texts[2])
    await expect.poll(() => savedPlace(vertical.page)).toEqual(await savedPlace(sideways.page))
    await vertical.page.screenshot({ path: join(ARTIFACT_DIR, `${engine}-vertical-swipe-down.png`) })

    // Diagonal: neither axis, nothing turns.
    const box = (await vertical.page.getByTestId('lab-book').boundingBox())!
    await touchDrag(vertical.page, { x: box.x + box.width * 0.7, y: box.y + box.height * 0.6 }, { x: box.x + box.width * 0.4, y: box.y + box.height * 0.45 })
    await vertical.page.waitForTimeout(450)
    expect(await stageText(vertical.page)).toBe(texts[2])

    // A reload keeps the place the vertical swipes saved.
    const beforeReload = await savedPlace(vertical.page)
    await waitForReader(vertical.page)
    await expect.poll(() => stageText(vertical.page)).toBe(texts[2])
    expect(await savedPlace(vertical.page)).toEqual(beforeReload)
    info.annotations.push({ type: 'place', description: JSON.stringify(beforeReload) })

    await sideways.context.close()
    await vertical.context.close()
  })

  test('a vertical drag inside an open card stays the card\'s and never turns the page', async ({ browser }) => {
    const engine = browser.browserType().name()
    const { context, page } = await touchReader(browser)
    await waitForReader(page)
    const pageText = await stageText(page)
    const place = await savedPlace(page)
    // The chapter's Primer pill opens its card (the notes are mocked: long enough to scroll).
    await page.getByTestId('lab-unit-primer').tap()
    const card = page.getByTestId('lab-phone-card')
    await expect(card).toBeVisible()
    await expect(page.locator('[data-testid="lab-chapter-notes-beat"]').first()).toBeVisible()
    const body = page.getByTestId('lab-phone-card-body')
    await page.screenshot({ path: join(ARTIFACT_DIR, `${engine}-card-open.png`) })
    await expect.poll(() => body.evaluate(el => el.scrollHeight - el.clientHeight)).toBeGreaterThan(40)
    const metrics = await body.evaluate(el => ({ scrollTop: el.scrollTop }))

    const bodyBox = (await body.boundingBox())!
    const x = bodyBox.x + bodyBox.width / 2
    await touchDrag(page, { x, y: bodyBox.y + bodyBox.height * 0.8 }, { x: x + 4, y: bodyBox.y + bodyBox.height * 0.25 }, 10)
    await page.waitForTimeout(500)
    if (engine === 'chromium') {
      // Real touch: the card's own scroller moved.
      await expect.poll(() => body.evaluate(el => el.scrollTop)).toBeGreaterThan(metrics.scrollTop + 20)
    }
    await page.screenshot({ path: join(ARTIFACT_DIR, `${engine}-vertical-drag-in-card.png`) })
    await touchDrag(page, { x, y: bodyBox.y + bodyBox.height * 0.3 }, { x: x - 4, y: bodyBox.y + bodyBox.height * 0.85 }, 10)
    await page.waitForTimeout(500)
    await expect(card).toBeVisible()
    expect(await stageText(page)).toBe(pageText)
    expect(await savedPlace(page)).toEqual(place)
    await context.close()
  })
})
