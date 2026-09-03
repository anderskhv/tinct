import { expect, test, type Browser, type BrowserContext, type Page } from '@playwright/test'
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const ARTIFACT_DIR = process.env.ARTIFACT_DIR || '/tmp/tinct-reader-convergence-artifacts'

type Viewport = { width: number; height: number; phone?: boolean }

async function readerContext(browser: Browser, viewport: Viewport): Promise<BrowserContext> {
  return browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    isMobile: viewport.phone,
    hasTouch: viewport.phone,
    userAgent: viewport.phone
      ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148'
      : undefined,
  })
}

async function seedHandoff(page: Page, saved = false): Promise<void> {
  await page.addInitScript(({ withSavedPlace }) => {
    localStorage.removeItem('tinct-lab-prefs')
    sessionStorage.setItem('tinct:lab-reader-handoff', JSON.stringify({
      kind: 'open-reader',
      bookId: 'meditations',
      primaryEditionKey: 'original-en',
      ...(withSavedPlace ? { savedPlace: { bookId: 'meditations', chapterNumber: 4, paragraphIndex: 1, page: 0 } } : {}),
    }))
  }, { withSavedPlace: saved })
}

async function openFrontispiece(page: Page): Promise<void> {
  await page.goto('/lab/reader', { waitUntil: 'networkidle' })
  await expect(page.getByTestId('lab-root')).toHaveAttribute('data-book-id', 'meditations')
  await expect(page.getByTestId('lab-root')).toHaveAttribute('data-reader-ready', 'true')
  await expect(page.getByTestId('lab-chapter-cover')).toContainText('Meditations')
  await expect(page.getByTestId('lab-chapter-cover')).toContainText('Marcus Aurelius')
}

async function turnCover(page: Page): Promise<void> {
  const box = await page.getByTestId('lab-chapter-cover').boundingBox()
  if (!box) throw new Error('Frontispiece has no bounds')
  await page.getByTestId('lab-chapter-cover').click({ position: { x: box.width - 10, y: box.height / 2 } })
  await expect(page.getByTestId('lab-root')).toHaveAttribute('data-cover-page', 'false')
  await expect(page.getByTestId('lab-book')).toContainText(/Marcus|Chapter|Book/i)
}

async function readingGeometry(page: Page) {
  return page.evaluate(() => {
    const root = document.querySelector<HTMLElement>('[data-testid="lab-root"]')!
    const book = document.querySelector<HTMLElement>('[data-testid="lab-book"]')!
    const line = document.querySelector<HTMLElement>('[data-testid="lab-book"] .lab-hearing-line')!
    const rect = (element: HTMLElement) => {
      const box = element.getBoundingClientRect()
      return [box.x, box.y, box.width, box.height].map(value => Math.round(value * 10) / 10)
    }
    return {
      book: rect(book),
      line: rect(line),
      text: line.textContent?.replace(/Keep this passage/g, ''),
      chapter: root.dataset.chapter,
      align: getComputedStyle(line).textAlign,
      size: getComputedStyle(line).fontSize,
    }
  })
}

test.beforeAll(() => mkdirSync(ARTIFACT_DIR, { recursive: true }))

for (const viewport of [
  { width: 390, height: 844, phone: true },
  { width: 768, height: 1024, phone: true },
  { width: 1440, height: 900 },
]) {
  test(`new-book frontispiece and cover turn at ${viewport.width}x${viewport.height}`, async ({ browser }) => {
    const context = await readerContext(browser, viewport)
    const page = await context.newPage()
    await seedHandoff(page)
    await openFrontispiece(page)
    await page.screenshot({ path: join(ARTIFACT_DIR, `frontispiece-${viewport.width}x${viewport.height}.png`) })
    await turnCover(page)
    await context.close()
  })
}

test('a genuine resume skips the frontispiece and restores the saved chapter', async ({ browser }) => {
  const context = await readerContext(browser, { width: 390, height: 844, phone: true })
  const page = await context.newPage()
  await seedHandoff(page, true)
  await page.goto('/lab/reader', { waitUntil: 'networkidle' })
  await expect(page.getByTestId('lab-root')).toHaveAttribute('data-book-id', 'meditations')
  await expect(page.getByTestId('lab-root')).toHaveAttribute('data-chapter', '4')
  await expect(page.getByTestId('lab-chapter-cover')).toHaveCount(0)
  await expect(page.getByTestId('lab-book')).toContainText(/perfect rules of art/i)
  await context.close()
})

test('reader themes cover the whole phone and desktop reading surface', async ({ browser }) => {
  for (const viewport of [{ width: 390, height: 844, phone: true }, { width: 1440, height: 900 }]) {
    for (const theme of ['light', 'dark', 'book'] as const) {
      const context = await readerContext(browser, viewport)
      const page = await context.newPage()
      await page.addInitScript(selected => localStorage.setItem('tinct-lab-prefs', JSON.stringify({ theme: selected })), theme)
      await page.goto('/lab/reader', { waitUntil: 'networkidle' })
      const root = page.getByTestId('lab-root')
      await expect(root).toHaveAttribute('data-theme', theme)
      const colors = await page.evaluate(() => {
        const rootNode = document.querySelector<HTMLElement>('[data-testid="lab-root"]')!
        const header = document.querySelector<HTMLElement>('.lab-passage-header')
        const pageWrap = document.querySelector<HTMLElement>('.lab-page-wrap')!
        return {
          root: getComputedStyle(rootNode).backgroundColor,
          wrap: getComputedStyle(pageWrap).backgroundColor,
          header: header ? getComputedStyle(header).backgroundColor : null,
          ink: getComputedStyle(document.querySelector<HTMLElement>('.lab-hearing-line')!).color,
        }
      })
      expect(colors.ink).not.toBe(colors.root)
      if (theme === 'book') {
        expect([colors.root, 'rgba(0, 0, 0, 0)']).toContain(colors.header)
        expect(colors.wrap).not.toBe('rgb(236, 231, 219)')
        await page.screenshot({ path: join(ARTIFACT_DIR, `book-theme-${viewport.width}x${viewport.height}.png`) })
      }
      await context.close()
    }
  }

  for (const viewport of [{ width: 390, height: 844, phone: true }, { width: 1440, height: 900 }]) {
    const systemContext = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height },
      colorScheme: 'dark',
      isMobile: viewport.phone,
      hasTouch: viewport.phone,
    })
    const systemPage = await systemContext.newPage()
    await systemPage.addInitScript(() => localStorage.setItem('tinct-lab-prefs', JSON.stringify({ theme: 'system' })))
    await systemPage.goto('/lab/reader', { waitUntil: 'networkidle' })
    await expect(systemPage.getByTestId('lab-root')).toHaveAttribute('data-theme', 'dark')
    await systemContext.close()
  }
})

test('phone, tablet, and desktop article geometry stays fixed through repeated playback transitions', async ({ browser }) => {
  test.setTimeout(120_000)
  for (const viewport of [
    { width: 390, height: 844, phone: true },
    { width: 768, height: 1024, phone: true },
    { width: 1440, height: 900 },
  ]) {
    const context = await readerContext(browser, viewport)
    await context.addInitScript(() => {
      class StableAudio extends EventTarget {
        src = ''
        currentTime = 0
        duration = 30
        playbackRate = 1
        paused = true
        preload = 'auto'
        load() {}
        removeAttribute(name: string) { if (name === 'src') this.src = '' }
        pause() { this.paused = true }
        play() { this.paused = false; queueMicrotask(() => this.dispatchEvent(new Event('playing'))); return Promise.resolve() }
      }
      Object.defineProperty(window, 'Audio', { configurable: true, value: StableAudio })
    })
    const page = await context.newPage()
    await page.addInitScript(() => {
      localStorage.setItem('tinct-lab-prefs', JSON.stringify({
        compareOpen: true,
        primaryEdition: 'original-en',
        compareEdition: 'modern-en',
      }))
      sessionStorage.setItem('tinct:lab-reader-handoff', JSON.stringify({
        kind: 'open-reader',
        bookId: 'the-art-of-war',
        primaryEditionKey: 'original-en',
        compareEditionKey: 'modern-en',
        savedPlace: { bookId: 'the-art-of-war', chapterNumber: 1, paragraphIndex: 0, page: 0 },
      }))
    })
    await page.route('**/api/audio-manifest**', route => route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({ paragraphs: [{ paragraph: 0, file: 'p0.mp3', duration: 30 }] }),
    }))
    await page.route('**/words.json**', route => route.fulfill({ status: 404, body: '' }))
    await page.goto('/lab/reader', { waitUntil: 'networkidle' })
    await expect(page.getByTestId('lab-root')).toHaveAttribute('data-book-id', 'the-art-of-war')
    await expect(page.getByTestId('lab-root')).toHaveAttribute('data-reader-ready', 'true')
    await expect(page.getByTestId('lab-chapter-cover')).toHaveCount(0)
    await expect(page.getByTestId('lab-book')).toBeVisible()
    await page.waitForTimeout(700)
    const before = await readingGeometry(page)
    const transitions: Array<{
      playing: Awaited<ReturnType<typeof readingGeometry>>
      paused: Awaited<ReturnType<typeof readingGeometry>>
    }> = []
    expect(before.align).toBe('justify')
    await page.screenshot({ path: join(ARTIFACT_DIR, `playback-before-${viewport.width}x${viewport.height}.png`) })

    for (let transition = 0; transition < 3; transition += 1) {
      await page.getByTestId('lab-listen').click()
      await expect(page.getByTestId('lab-root')).toHaveAttribute('data-playing', 'true')
      const playing = await readingGeometry(page)
      expect(playing).toEqual(before)
      if (transition === 0) {
        await page.getByTestId('lab-hearing-forward').click()
        expect(await readingGeometry(page)).toEqual(before)
        await page.getByTestId('lab-hearing-speed').click()
        if (await page.getByRole('slider', { name: /speed/i }).count()) {
          await page.getByRole('slider', { name: /speed/i }).fill('1.5')
        }
        expect(await readingGeometry(page)).toEqual(before)
        await page.screenshot({ path: join(ARTIFACT_DIR, `acceptance-playing-${viewport.width}x${viewport.height}.png`) })
      }
      await page.getByTestId('lab-hearing-pause').click()
      await expect(page.getByTestId('lab-root')).toHaveAttribute('data-playing', 'false')
      const paused = await readingGeometry(page)
      expect(paused).toEqual(before)
      transitions.push({ playing, paused })
    }

    if (viewport.width === 390) {
      await page.evaluate(() => {
        for (const animation of document.getAnimations()) animation.currentTime = 0
      })
    }

    const controlMeasurements: Array<{ name: string; width: number; height: number }> = []
    for (const control of await page.locator([
      '[data-testid="lab-listen"]:visible',
      '[data-testid="lab-phone-chat"]:visible',
      '[data-testid="lab-phone-talk"]:visible',
      '[data-testid="lab-phone-compare"]:visible',
      '[data-testid="lab-desktop-chat"]:visible',
      '[data-testid="lab-desktop-talk"]:visible',
      '[data-testid="lab-desktop-compare"]:visible',
      '[data-testid="lab-gear"]:visible',
      '[data-testid="lab-header-chapter"]:visible',
      '[data-testid="lab-hearing-pause"]:visible',
      '[data-testid="lab-hearing-forward"]:visible',
      '[data-testid="lab-hearing-back"]:visible',
      '[data-testid="lab-hearing-speed"]:visible',
    ].join(',')).all()) {
      const box = await control.boundingBox()
      if (box) {
        const name = await control.getAttribute('data-testid') || await control.getAttribute('aria-label') || 'reader control'
        controlMeasurements.push({ name, width: box.width, height: box.height })
        expect(box.width, `${name} width`).toBeGreaterThanOrEqual(44)
        expect(box.height, `${name} height`).toBeGreaterThanOrEqual(44)
      }
    }
    writeFileSync(
      join(ARTIFACT_DIR, `acceptance-measurements-${viewport.width}x${viewport.height}.json`),
      JSON.stringify({ viewport, before, transitions, controls: controlMeasurements }, null, 2),
    )
    await page.screenshot({ path: join(ARTIFACT_DIR, `acceptance-paused-${viewport.width}x${viewport.height}.png`) })
    await context.close()
  }
})
