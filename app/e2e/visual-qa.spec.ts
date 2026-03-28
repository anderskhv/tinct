/**
 * Visual QA: Screenshot every chapter of every available edition.
 * Run with: npx playwright test e2e/visual-qa.spec.ts
 *
 * Screenshots saved to e2e/screenshots/
 */
import { test } from '@playwright/test'
import * as path from 'path'
import * as fs from 'fs'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const BASE_URL = process.env.BASE_URL || 'http://localhost:3001'
const SCREENSHOT_DIR = path.resolve(__dirname, 'screenshots')
const TOTAL_CHAPTERS = 24

// Editions to test — only those with real content
const EDITIONS = [
  { key: 'original-en', langBtn: null, styleValue: 'original', label: 'butler' },
  { key: 'verse-en', langBtn: null, styleValue: 'verse', label: 'pope' },
  // Uncomment when AI editions are generated:
  // { key: 'modern-en', langBtn: null, styleValue: 'modern', label: 'modern-en' },
  // { key: 'kids-en', langBtn: null, styleValue: 'kids', label: 'kids-en' },
  // { key: 'modern-da', langBtn: 'DA', styleValue: 'modern', label: 'modern-da' },
  // { key: 'kids-da', langBtn: 'DA', styleValue: 'kids', label: 'kids-da' },
]

test.beforeAll(async () => {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true })
})

for (const edition of EDITIONS) {
  for (let ch = 1; ch <= TOTAL_CHAPTERS; ch++) {
    test(`${edition.label} Book ${ch}`, async ({ browser }) => {
      const context = await browser.newContext({
        viewport: { width: 1440, height: 900 },
      })
      const page = await context.newPage()
      await page.goto(BASE_URL, { waitUntil: 'networkidle' })
      await page.waitForTimeout(800)

      // Set language if needed
      if (edition.langBtn) {
        await page.click(`.lang-button:has-text("${edition.langBtn}")`)
        await page.waitForTimeout(300)
      }

      // Set style
      const styleSelect = page.locator('.translation-select')
      if (await styleSelect.isVisible()) {
        await styleSelect.selectOption(edition.styleValue)
        await page.waitForTimeout(500)
      }

      // Navigate to chapter
      await page.selectOption('.chapter-select', String(ch))
      await page.waitForTimeout(600)

      // Screenshot
      const filename = `${edition.label}-book${String(ch).padStart(2, '0')}.png`
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, filename),
        fullPage: false,
      })

      await context.close()
    })
  }
}

// Dark mode
test('dark-mode Book 1', async ({ browser }) => {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  })
  const page = await context.newPage()
  await page.goto(BASE_URL, { waitUntil: 'networkidle' })
  await page.waitForTimeout(800)

  await page.evaluate(() => {
    document.documentElement.setAttribute('data-theme', 'dark')
  })
  await page.waitForTimeout(300)

  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, 'dark-mode-book01.png'),
    fullPage: false,
  })
  await context.close()
})

// Chat panel open
test('chat-panel Book 1', async ({ browser }) => {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  })
  const page = await context.newPage()
  await page.goto(BASE_URL, { waitUntil: 'networkidle' })
  await page.waitForTimeout(800)

  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, 'chat-panel-book01.png'),
    fullPage: false,
  })
  await context.close()
})

// Notes tab
test('notes-tab Book 1', async ({ browser }) => {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  })
  const page = await context.newPage()
  await page.goto(BASE_URL, { waitUntil: 'networkidle' })
  await page.waitForTimeout(800)

  const notesTab = page.locator('.panel-tab:has-text("Notes")')
  if (await notesTab.isVisible()) {
    await notesTab.click()
    await page.waitForTimeout(300)
  }

  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, 'notes-tab-book01.png'),
    fullPage: false,
  })
  await context.close()
})
