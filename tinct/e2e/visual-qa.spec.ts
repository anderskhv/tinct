/**
 * Visual QA: Screenshot every chapter of every available edition.
 * Run with: npx playwright test e2e/visual-qa.spec.ts
 *
 * Screenshots saved to e2e/screenshots/
 */
import { test } from '@playwright/test'
import type { Page } from '@playwright/test'
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
  { key: 'modern-en', langBtn: null, styleValue: 'modern', label: 'modern-en' },
  { key: 'kids-en', langBtn: null, styleValue: 'kids', label: 'kids-en' },
  { key: 'modern-da', langBtn: 'DA', styleValue: 'modern', label: 'modern-da' },
  { key: 'kids-da', langBtn: 'DA', styleValue: 'kids', label: 'kids-da' },
]

// Split-pane combos to test — primary left, secondary right (all aligned editions)
const SPLIT_COMBOS = [
  { label: 'split-butler-vs-modern', langBtn: null, leftStyle: 'original', rightEditionKey: 'modern-en' },
  { label: 'split-butler-vs-kids', langBtn: null, leftStyle: 'original', rightEditionKey: 'kids-en' },
  { label: 'split-modern-vs-kids', langBtn: null, leftStyle: 'modern', rightEditionKey: 'kids-en' },
  { label: 'split-da-modern-vs-kids', langBtn: 'DA', leftStyle: 'modern', rightEditionKey: 'kids-da' },
]

/** Dismiss the onboarding overlay if present */
async function dismissOnboarding(page: Page) {
  const startBtn = page.locator('.onboarding-start')
  if (await startBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
    await startBtn.click()
    await page.waitForTimeout(300)
  }
}

/** Set preferences via localStorage before navigating, to skip onboarding */
async function setPreferencesBeforeLoad(page: Page, overrides: Record<string, unknown> = {}) {
  const prefs = {
    language: 'en',
    style: 'original',
    splitView: false,
    splitEditionKey: 'modern-en',
    darkMode: false,
    panelTab: 'chat',
    panelOpen: true,
    readingObjective: '',
    onboardingComplete: true,
    ...overrides,
  }
  // Storage service uses 'tinct:' prefix
  await page.addInitScript((p) => {
    localStorage.setItem('tinct:preferences', JSON.stringify(p))
  }, prefs)
}

test.beforeAll(async () => {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true })
})

// ── Onboarding screenshot ──
test('onboarding overlay', async ({ browser }) => {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  })
  const page = await context.newPage()
  // Don't set preferences — let onboarding show
  await page.goto(BASE_URL, { waitUntil: 'networkidle' })
  await page.waitForTimeout(800)

  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, 'onboarding.png'),
    fullPage: false,
  })
  await context.close()
})

// ── Chat welcome with suggestion chips ──
test('chat-welcome Book 1', async ({ browser }) => {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  })
  const page = await context.newPage()
  await setPreferencesBeforeLoad(page, { readingObjective: 'Leadership and decision-making' })
  await page.goto(BASE_URL, { waitUntil: 'networkidle' })
  await page.waitForTimeout(800)

  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, 'chat-welcome-book01.png'),
    fullPage: false,
  })
  await context.close()
})

// ── Single-edition: all chapters × all editions ──
for (const edition of EDITIONS) {
  for (let ch = 1; ch <= TOTAL_CHAPTERS; ch++) {
    test(`${edition.label} Book ${ch}`, async ({ browser }) => {
      const context = await browser.newContext({
        viewport: { width: 1440, height: 900 },
      })
      const page = await context.newPage()
      await setPreferencesBeforeLoad(page, {
        language: edition.langBtn === 'DA' ? 'da' : 'en',
        style: edition.styleValue,
      })
      await page.goto(BASE_URL, { waitUntil: 'networkidle' })
      await page.waitForTimeout(800)

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

// ── Split-pane: all chapters × key combos ──
for (const combo of SPLIT_COMBOS) {
  for (let ch = 1; ch <= TOTAL_CHAPTERS; ch++) {
    test(`${combo.label} Book ${ch}`, async ({ browser }) => {
      const context = await browser.newContext({
        viewport: { width: 1440, height: 900 },
      })
      const page = await context.newPage()
      await setPreferencesBeforeLoad(page, {
        language: combo.langBtn === 'DA' ? 'da' : 'en',
        style: combo.leftStyle,
        splitView: true,
        splitEditionKey: combo.rightEditionKey,
        panelOpen: false, // Close panel to give split pane full width
      })
      await page.goto(BASE_URL, { waitUntil: 'networkidle' })
      await page.waitForTimeout(1000) // Extra time for two editions to load

      // Navigate to chapter
      await page.selectOption('.chapter-select', String(ch))
      await page.waitForTimeout(800)

      // Screenshot
      const filename = `${combo.label}-book${String(ch).padStart(2, '0')}.png`
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, filename),
        fullPage: false,
      })

      await context.close()
    })
  }
}

// ── Dark mode ──
test('dark-mode Book 1', async ({ browser }) => {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  })
  const page = await context.newPage()
  await setPreferencesBeforeLoad(page, { darkMode: true })
  await page.goto(BASE_URL, { waitUntil: 'networkidle' })
  await page.waitForTimeout(800)

  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, 'dark-mode-book01.png'),
    fullPage: false,
  })
  await context.close()
})

// ── Dark mode split pane ──
test('dark-mode-split Book 1', async ({ browser }) => {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  })
  const page = await context.newPage()
  await setPreferencesBeforeLoad(page, {
    darkMode: true,
    splitView: true,
    splitEditionKey: 'modern-en',
    panelOpen: false,
  })
  await page.goto(BASE_URL, { waitUntil: 'networkidle' })
  await page.waitForTimeout(1000)

  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, 'dark-mode-split-book01.png'),
    fullPage: false,
  })
  await context.close()
})

// ── Chat panel open ──
test('chat-panel Book 1', async ({ browser }) => {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  })
  const page = await context.newPage()
  await setPreferencesBeforeLoad(page)
  await page.goto(BASE_URL, { waitUntil: 'networkidle' })
  await page.waitForTimeout(800)

  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, 'chat-panel-book01.png'),
    fullPage: false,
  })
  await context.close()
})

// ── Notes tab ──
test('notes-tab Book 1', async ({ browser }) => {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  })
  const page = await context.newPage()
  await setPreferencesBeforeLoad(page, { panelTab: 'notes' })
  await page.goto(BASE_URL, { waitUntil: 'networkidle' })
  await page.waitForTimeout(800)

  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, 'notes-tab-book01.png'),
    fullPage: false,
  })
  await context.close()
})
