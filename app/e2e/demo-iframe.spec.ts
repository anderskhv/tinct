/**
 * Verify the live demo iframe loads and the FeatureTour fires inside it.
 *
 * Run with: BASE_URL=https://tinct.app npx playwright test e2e/demo-iframe.spec.ts --config=e2e/playwright.config.ts
 */
import { test, expect } from '@playwright/test'

test.describe('Landing demo iframe', () => {
  test('iframe loads SPA and the FeatureTour fires', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('https://tinct.app/')
    await page.waitForLoadState('networkidle')

    const frame = page.frameLocator('iframe[title="Tinct product demo"]')

    // Tour bubble should appear inside the iframe within ~6s
    const counter = frame.locator('.feature-tour-counter')
    await expect(counter).toBeVisible({ timeout: 10000 })

    const headline = frame.locator('.feature-tour-headline')
    const firstHeadline = await headline.textContent()
    console.log('First step headline:', firstHeadline)

    // Wait ~5s and verify the tour has auto-advanced
    await page.waitForTimeout(5500)
    const secondHeadline = await headline.textContent()
    console.log('Second step headline:', secondHeadline)
    expect(secondHeadline).not.toEqual(firstHeadline)

    // Take a screenshot for review
    await page.screenshot({ path: 'e2e/screenshots/demo-iframe-live.png', fullPage: false })
  })
})
