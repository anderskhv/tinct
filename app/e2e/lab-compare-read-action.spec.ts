import { expect, test, type Browser, type BrowserContext, type Locator, type Page } from '@playwright/test'
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const ARTIFACT_DIR = process.env.ARTIFACT_DIR || '/tmp/tinct-compare-read-action-artifacts'
const PHONE_UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148'

type MediaCalls = { play: number; pause: number }

function readerContext(browser: Browser, phone: boolean): Promise<BrowserContext> {
  return browser.newContext({
    viewport: phone ? { width: 390, height: 844 } : { width: 1440, height: 900 },
    isMobile: phone,
    hasTouch: phone,
    userAgent: phone ? PHONE_UA : undefined,
  })
}

async function seedCompareReader(context: BrowserContext): Promise<void> {
  await context.addInitScript(() => {
    const appearance = {
      theme: 'light',
      fontFamily: 'garamond',
      fontSize: 1,
      alignment: 'left',
      lineSpacing: 'comfortable',
      margins: 'medium',
      paragraphSpacing: 'standard',
      progressDisplay: { metric: 'page', scope: 'chapter' },
    }
    localStorage.setItem('tinct-lab-prefs', JSON.stringify({
      version: 2,
      shared: {
        primaryEdition: 'kjv-en',
        compareEdition: 'modern-en',
        audioEdition: 'kjv-en',
        audioSpeed: 1.5,
        compareOpen: true,
      },
      phone: appearance,
      desktop: appearance,
    }))
    sessionStorage.setItem('tinct:lab-reader-handoff', JSON.stringify({
      kind: 'open-reader',
      bookId: 'bible',
      primaryEditionKey: 'kjv-en',
      compareEditionKey: 'modern-en',
      savedPlace: {
        bookId: 'bible',
        chapterNumber: 1,
        paragraphIndex: 0,
        wordIndex: 0,
        page: 0,
      },
    }))

    const calls = { play: 0, pause: 0 }
    Object.defineProperty(window, '__tinctMediaCalls', { configurable: true, value: calls })
    Object.defineProperty(HTMLMediaElement.prototype, 'play', {
      configurable: true,
      value() {
        calls.play += 1
        return Promise.resolve()
      },
    })
    Object.defineProperty(HTMLMediaElement.prototype, 'pause', {
      configurable: true,
      value() {
        calls.pause += 1
      },
    })
  })
}

async function openReader(page: Page): Promise<void> {
  await page.goto('/lab/reader', { waitUntil: 'networkidle' })
  const root = page.getByTestId('lab-root')
  await expect(root).toHaveAttribute('data-book-id', 'bible')
  await expect(root).toHaveAttribute('data-reader-ready', 'true')
  await expect(root).toHaveAttribute('data-cover-page', 'false')
  await page.evaluate(() => document.fonts.ready)
  await expect.poll(async () => (await page.getByTestId('lab-reading-stage').innerText()).trim().length).toBeGreaterThan(100)
  await page.waitForTimeout(350)
}

async function turnForward(page: Page, phone: boolean): Promise<void> {
  const before = await page.getByTestId('lab-root').getAttribute('data-place')
  if (phone) {
    const box = await page.getByTestId('lab-book').boundingBox()
    if (!box) throw new Error('Reader page has no touch target')
    await page.touchscreen.tap(box.x + box.width - 6, box.y + box.height / 2)
  } else {
    await page.getByTestId('lab-page-next').click()
  }
  await expect.poll(() => page.getByTestId('lab-root').getAttribute('data-place')).not.toBe(before)
}

async function revealPhoneControls(page: Page): Promise<void> {
  if (await page.getByTestId('lab-root').getAttribute('data-reader-controls') === 'visible') return
  const box = await page.getByTestId('lab-book').boundingBox()
  if (!box) throw new Error('Reader page has no control reveal target')
  await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2)
  await expect(page.getByTestId('lab-root')).toHaveAttribute('data-reader-controls', 'visible')
  await expect(page.getByTestId('lab-phone-compare')).toBeVisible()
}

async function mediaCalls(page: Page): Promise<MediaCalls> {
  return page.evaluate(() => (
    (window as Window & { __tinctMediaCalls: MediaCalls }).__tinctMediaCalls
  ))
}

async function activate(locator: Locator, phone: boolean): Promise<void> {
  if (!phone) {
    await locator.click()
    return
  }
  await locator.tap({ force: true })
}

test.beforeAll(() => mkdirSync(ARTIFACT_DIR, { recursive: true }))

for (const surface of [
  { name: 'phone', phone: true },
  { name: 'desktop', phone: false },
] as const) {
  test(`${surface.name} Compare primary action is Read and preserves position and audio`, async ({ browser }) => {
    const context = await readerContext(browser, surface.phone)
    await seedCompareReader(context)
    const page = await context.newPage()
    await openReader(page)
    await turnForward(page, surface.phone)

    const root = page.getByTestId('lab-root')
    const primaryText = (await page.getByTestId('lab-reading-stage').innerText()).replace(/\s+/g, ' ').trim()
    if (surface.phone) await revealPhoneControls(page)
    const compareButton = page.getByTestId(surface.phone ? 'lab-phone-compare' : 'lab-desktop-compare')
    await activate(compareButton, surface.phone)
    await expect(root).toHaveAttribute('data-compare-active', 'true')

    const place = await root.getAttribute('data-place')
    const chapter = await root.getAttribute('data-chapter')
    const speed = await root.getAttribute('data-audio-speed')
    const playing = await root.getAttribute('data-playing')
    const source = await page.getByTestId('lab-listen-status').getAttribute('data-src')
    const beforeCalls = await mediaCalls(page)
    const readAction = page.getByTestId('lab-listen')

    await expect(readAction).toHaveAttribute('aria-label', 'Read')
    await expect(readAction).toHaveAttribute('data-reader-action', 'read')
    await expect(readAction).toContainText('Read')
    const icon = page.getByTestId(surface.phone ? 'lab-reader-primary-read-icon' : 'lab-desktop-read')
    await expect(icon.locator('svg path')).toHaveAttribute('d', /M3\.5 5\.5/)

    await page.screenshot({
      path: join(ARTIFACT_DIR, `${surface.name}-compare-read-action.png`),
      fullPage: true,
    })
    await activate(readAction, surface.phone)

    await expect(root).toHaveAttribute('data-compare-active', 'false')
    await expect(root).toHaveAttribute('data-reader-edition', 'kjv-en')
    await expect(root).toHaveAttribute('data-place', place || '')
    await expect(root).toHaveAttribute('data-chapter', chapter || '')
    await expect(root).toHaveAttribute('data-audio-speed', speed || '')
    await expect(root).toHaveAttribute('data-playing', playing || '')
    await expect(page.getByTestId('lab-listen-status')).toHaveAttribute('data-src', source || '')
    expect(await mediaCalls(page)).toEqual(beforeCalls)
    await expect.poll(async () => (
      (await page.getByTestId('lab-reading-stage').innerText()).replace(/\s+/g, ' ').trim()
    )).toBe(primaryText)

    writeFileSync(join(ARTIFACT_DIR, `${surface.name}-compare-read-evidence.json`), JSON.stringify({
      place,
      chapter,
      speed,
      playing,
      source,
      mediaCalls: beforeCalls,
    }, null, 2))
    await context.close()
  })
}
