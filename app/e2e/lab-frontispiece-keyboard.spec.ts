import { expect, test, type Browser, type Page } from '@playwright/test'
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const ARTIFACT_DIR = process.env.ARTIFACT_DIR || '/tmp/tinct-frontispiece-keyboard-artifacts'

const VIEWPORTS = [
  { name: 'phone', width: 390, height: 844, isMobile: true, hasTouch: true },
  { name: 'desktop', width: 1440, height: 900, isMobile: false, hasTouch: false },
] as const

const KEYS = ['ArrowRight', 'Space'] as const

async function openFreshHamletCover(browser: Browser, viewport: (typeof VIEWPORTS)[number]) {
  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    isMobile: viewport.isMobile,
    hasTouch: viewport.hasTouch,
    userAgent: viewport.isMobile
      ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148'
      : undefined,
  })
  const page = await context.newPage()
  await page.goto('/lab/?autoplay=0&view=library', { waitUntil: 'domcontentloaded' })
  await page.waitForFunction(() => window.__tinctLabPreReader?.ready === true)
  await page.getByRole('searchbox', { name: 'Search the library' }).fill('Hamlet')
  await page.locator('.tov5-search-results [data-catalogue-book="hamlet"]').click()
  await page.getByRole('button', { name: 'Start reading' }).click()
  await page.locator('[data-select-edition="original-en"]').click()
  await page.locator('.tov5-continue').click()

  await expect(page).toHaveURL(/\/lab\/reader$/)
  await expect(page.getByTestId('lab-root')).toHaveAttribute('data-reader-ready', 'true')
  await expect(page.getByTestId('lab-root')).toHaveAttribute('data-cover-page', 'true')
  await expect(page.getByTestId('lab-chapter-cover')).toContainText('Hamlet')
  return { context, page }
}

async function readerState(page: Page) {
  return page.evaluate(() => {
    const root = document.querySelector<HTMLElement>('[data-testid="lab-root"]')
    const stage = document.querySelector<HTMLElement>('[data-testid="lab-reading-stage"]')
    const active = document.activeElement as HTMLElement | null
    return {
      activeTag: active?.tagName || null,
      activeTestId: active?.dataset.testid || null,
      bookId: root?.dataset.bookId || null,
      chapter: root?.dataset.chapter || null,
      cover: root?.dataset.coverPage || null,
      place: root?.dataset.place || null,
      stageText: stage?.innerText || '',
    }
  })
}

test.beforeAll(() => mkdirSync(ARTIFACT_DIR, { recursive: true }))

for (const viewport of VIEWPORTS) {
  for (const key of KEYS) {
    test(`fresh Hamlet cover accepts page-level ${key} at ${viewport.name} width`, async ({ browser }) => {
      const { context, page } = await openFreshHamletCover(browser, viewport)
      try {
        await expect.poll(async () => (await readerState(page)).activeTestId).toBe('lab-chapter-cover')
        const before = await readerState(page)
        await page.screenshot({ path: join(ARTIFACT_DIR, `${viewport.name}-${key}-cover.png`) })

        await page.keyboard.press(key)
        await expect(page.getByTestId('lab-root')).toHaveAttribute('data-cover-page', 'false')
        await expect(page.getByTestId('lab-chapter-cover')).toHaveCount(0)
        const readingStage = page.getByTestId('lab-reading-stage')
        await expect(readingStage).toBeVisible()
        await expect(readingStage).toContainText('BARNARDO.')
        await page.waitForTimeout(250)
        const afterAdvance = await readerState(page)
        expect(afterAdvance.bookId).toBe('hamlet')
        expect(afterAdvance.chapter).toBe('1')

        const normalPageKey = key === 'ArrowRight' ? 'Space' : 'ArrowRight'
        await page.keyboard.press(normalPageKey)
        await page.waitForTimeout(250)
        const afterNormalPageKey = await readerState(page)
        expect(afterNormalPageKey.cover).toBe('false')
        expect(afterNormalPageKey.chapter).toBe(afterAdvance.chapter)
        expect(afterNormalPageKey.place).toBe(afterAdvance.place)
        expect(afterNormalPageKey.activeTestId).not.toBe('lab-chapter-cover')
        await page.screenshot({ path: join(ARTIFACT_DIR, `${viewport.name}-${key}-text.png`) })

        writeFileSync(
          join(ARTIFACT_DIR, `${viewport.name}-${key}.json`),
          JSON.stringify({ viewport, key, before, afterAdvance, afterNormalPageKey }, null, 2),
        )
      } finally {
        await context.close()
      }
    })
  }
}
