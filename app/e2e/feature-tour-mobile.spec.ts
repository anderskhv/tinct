/**
 * Feature tour mobile walk-through. Mobile viewport, fires the tour via
 * Settings, screenshots each step, verifies counter + headline.
 *
 * Run with: BASE_URL=http://localhost:3001 npx playwright test e2e/feature-tour-mobile.spec.ts --config=e2e/playwright.config.ts
 *
 * Screenshots saved to e2e/screenshots/tour-mobile-*
 */
import { test, expect } from '@playwright/test'
import * as path from 'path'
import * as fs from 'fs'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const SCREENSHOT_DIR = path.resolve(__dirname, 'screenshots')

test.describe('Feature tour — mobile', () => {
  test.beforeAll(() => {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true })
  })

  test('walk through every step and screenshot', async ({ page }) => {
    // iPhone 13 / Pro viewport. Mobile breakpoint in useMobile is 1024px.
    await page.setViewportSize({ width: 390, height: 844 })

    // Skip onboarding flows (book onboarding key + tour-seen) so we land
    // straight in the reader. We'll re-trigger the tour explicitly below.
    await page.addInitScript(() => {
      // Storage provider prefixes all keys with `tinct:`. Match it.
      const KNOWN_BOOKS = ['odyssey', 'apology', 'meditations', 'hamlet', 'romeo-and-juliet', 'pride-and-prejudice', 'frankenstein']
      KNOWN_BOOKS.forEach(b =>
        localStorage.setItem(`tinct:book-onboarded:${b}`, JSON.stringify(true))
      )
      // Seed library so the BookStore doesn't auto-open (libraryEmpty triggers
      // showStore=true on first paint).
      localStorage.setItem('tinct:library', JSON.stringify(KNOWN_BOOKS))
      localStorage.setItem('tinct:tinct-current-book', JSON.stringify('odyssey'))
      // Ensure tour fires fresh
      localStorage.removeItem('tinct:tinct-tour-seen')
    })

    await page.goto('/')
    await page.waitForLoadState('networkidle')
    // Give React a beat to mount + dismiss any leftover overlay
    await page.waitForTimeout(800)

    // Dismiss any modal that's still open (e.g. TierChooser, BookStore)
    const dismissSelectors = [
      '.store-close',
      '[aria-label="Close"]',
      '.tier-chooser-skip',
      '.book-onboarding-skip',
    ]
    for (const sel of dismissSelectors) {
      const el = page.locator(sel).first()
      if (await el.isVisible().catch(() => false)) {
        await el.click().catch(() => {})
        await page.waitForTimeout(300)
      }
    }

    // Open Settings via the menu icon
    const settingsBtn = page.locator('[data-tour="settings"]').first()
    await expect(settingsBtn).toBeVisible({ timeout: 10000 })
    await settingsBtn.click()
    await page.waitForTimeout(400)

    // Navigate to Reading section if Settings opens elsewhere — the
    // "Show feature tour again →" button lives there.
    const tourBtn = page.locator('button', { hasText: 'Show feature tour again' })
    if (!(await tourBtn.isVisible().catch(() => false))) {
      // Try clicking the Reading tab/section if present
      const readingTab = page.locator('button', { hasText: /^Reading$/ }).first()
      if (await readingTab.isVisible().catch(() => false)) {
        await readingTab.click()
        await page.waitForTimeout(300)
      }
    }
    await expect(tourBtn).toBeVisible({ timeout: 5000 })
    await tourBtn.click()
    await page.waitForTimeout(700) // tour fade-in + 600ms trigger delay

    // The tour should now be open. Walk through every step.
    const stepResults: Array<{ index: number; counter: string; headline: string }> = []
    const MAX_STEPS = 12 // safety cap; real flow is up to 10

    for (let i = 0; i < MAX_STEPS; i++) {
      await page.waitForTimeout(500) // let setup + measure settle

      const counter = await page.locator('.feature-tour-counter').textContent().catch(() => null)
      const headline = await page.locator('.feature-tour-headline').textContent().catch(() => null)

      if (!counter || !headline) {
        // Tour ended (no bubble visible)
        break
      }

      stepResults.push({
        index: i + 1,
        counter: counter.trim(),
        headline: headline.trim(),
      })

      // Full-page screenshot for this step
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, `tour-mobile-${String(i + 1).padStart(2, '0')}-${headline.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}.png`),
        fullPage: false,
      })

      // Advance — Next on non-final, Got it → on final
      const isLastByCounter = counter.match(/(\d+)\s*of\s*(\d+)/i)
      const lastStep = isLastByCounter ? parseInt(isLastByCounter[1]) === parseInt(isLastByCounter[2]) : false

      const advanceBtn = lastStep
        ? page.locator('.feature-tour-next', { hasText: /Got it/ })
        : page.locator('.feature-tour-next', { hasText: /Next/ })

      if (!(await advanceBtn.isVisible().catch(() => false))) break
      await advanceBtn.click()
      if (lastStep) break
    }

    console.log('\n=== Mobile tour steps captured ===')
    for (const s of stepResults) {
      console.log(`  ${s.counter}  —  ${s.headline}`)
    }

    // Sanity checks: should be ≥ 5 steps on mobile (intro + at least chat/feed/library/settings/outro)
    expect(stepResults.length).toBeGreaterThanOrEqual(5)
    expect(stepResults[0].headline).toMatch(/welcome/i)
  })
})
