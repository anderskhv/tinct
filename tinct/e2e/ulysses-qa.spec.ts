/**
 * Visual QA: Ulysses - Screenshot key chapters across all editions.
 * Run with: npx playwright test e2e/ulysses-qa.spec.ts
 */
import { test } from '@playwright/test'
import type { Page } from '@playwright/test'
import * as path from 'path'
import * as fs from 'fs'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const BASE_URL = process.env.BASE_URL || 'http://localhost:5174'
const SCREENSHOT_DIR = path.resolve(__dirname, 'screenshots', 'ulysses')

const EDITIONS = [
  { key: 'original-en', lang: 'en', style: 'original', label: 'original' },
  { key: 'modern-en', lang: 'en', style: 'modern', label: 'modern-en' },
  { key: 'kids-en', lang: 'en', style: 'kids', label: 'kids-en' },
  { key: 'modern-da', lang: 'da', style: 'modern', label: 'modern-da' },
  { key: 'kids-da', lang: 'da', style: 'kids', label: 'kids-da' },
]

// Test a spread of chapters: first, middle, experimental, last
const TEST_CHAPTERS = [1, 6, 11, 15, 17, 18]

async function setPrefs(page: Page, overrides: Record<string, unknown> = {}) {
  const prefs = {
    language: 'en',
    style: 'original',
    splitView: false,
    splitEditionKey: 'modern-en',
    darkMode: false,
    panelTab: 'chat',
    panelOpen: false,
    readingObjective: '',
    onboardingComplete: true,
    ...overrides,
  }
  await page.addInitScript((p) => {
    localStorage.setItem('tinct:preferences', JSON.stringify(p))
    localStorage.setItem('tinct:tinct-current-book', JSON.stringify('ulysses'))
  }, prefs)
}

test.beforeAll(async () => {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true })
})

// Screenshot each edition × key chapters
for (const edition of EDITIONS) {
  for (const ch of TEST_CHAPTERS) {
    test(`${edition.label} ep${ch}`, async ({ browser }) => {
      const context = await browser.newContext({
        viewport: { width: 1440, height: 900 },
      })
      const page = await context.newPage()
      await setPrefs(page, {
        language: edition.lang,
        style: edition.style,
      })
      await page.goto(BASE_URL, { waitUntil: 'networkidle' })
      await page.waitForTimeout(1000)

      // Select chapter
      await page.selectOption('.chapter-select', String(ch))
      await page.waitForTimeout(800)

      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, `${edition.label}-ep${String(ch).padStart(2, '0')}.png`),
        fullPage: false,
      })
      await context.close()
    })
  }
}

// Split pane: original vs modern
for (const ch of [1, 18]) {
  test(`split original-vs-modern ep${ch}`, async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
    })
    const page = await context.newPage()
    await setPrefs(page, {
      splitView: true,
      style: 'original',
      splitEditionKey: 'modern-en',
      panelOpen: false,
    })
    await page.goto(BASE_URL, { waitUntil: 'networkidle' })
    await page.waitForTimeout(1200)

    await page.selectOption('.chapter-select', String(ch))
    await page.waitForTimeout(800)

    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, `split-orig-vs-modern-ep${String(ch).padStart(2, '0')}.png`),
      fullPage: false,
    })
    await context.close()
  })
}

// Dark mode
test('dark-mode ep1', async ({ browser }) => {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  })
  const page = await context.newPage()
  await setPrefs(page, { darkMode: true })
  await page.goto(BASE_URL, { waitUntil: 'networkidle' })
  await page.waitForTimeout(1000)

  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, 'dark-mode-ep01.png'),
    fullPage: false,
  })
  await context.close()
})

// Book selector visible
test('book-selector', async ({ browser }) => {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  })
  const page = await context.newPage()
  await setPrefs(page)
  await page.goto(BASE_URL, { waitUntil: 'networkidle' })
  await page.waitForTimeout(1000)

  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, 'book-selector.png'),
    fullPage: false,
  })
  await context.close()
})
