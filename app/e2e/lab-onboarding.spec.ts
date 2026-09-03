import { expect, test } from '@playwright/test'

test.use({ viewport: { width: 390, height: 844 } })

test.beforeEach(async ({ page }) => {
  await page.goto('/lab/?autoplay=0')
})

test('opens the landing demonstration and advances from the library to editions', async ({ page }) => {
  await page.getByRole('button', { name: 'Landing' }).click()
  await expect(page.locator('[data-view-panel="landing"]')).toHaveClass(/is-current/)
  await expect(page.locator('[data-demo-step-title]')).toHaveText('Pick a book')

  await page.locator('[data-pick-demo-book="odyssey"]').click()
  await expect(page.locator('[data-frame-panel="versions"]')).toHaveClass(/is-current/)
  await expect(page.locator('[data-demo-step-title]')).toHaveText('Pick your translation')
})

test('opens book detail, chooses an edition, and reaches the optional preface', async ({ page }) => {
  await expect(page.locator('[data-view-panel="library"]')).toHaveClass(/is-current/)
  await page.locator('[data-open-book]').first().click()
  await expect(page.locator('[data-view-panel="book-detail"]')).toHaveClass(/is-current/)

  await page.getByRole('button', { name: 'Start reading' }).click()
  await expect(page.locator('[data-view-panel="edition"]')).toHaveClass(/is-current/)
  await page.getByRole('button', { name: 'Choose classic' }).click()
  await expect(page.locator('.tov5-continue')).toHaveText('Continue with Classic')

  await page.locator('.tov5-continue').click()
  await expect(page.locator('[data-view-panel="preface"]')).toHaveClass(/is-current/)
  await page.getByRole('button', { name: /Give me a standard preface/ }).click()
  await expect(page.locator('[data-preface-thread]')).toBeVisible()
})

test('keeps the librarian Talk and Chat entry points directly exposed', async ({ page }) => {
  const prompt = page.locator('[data-view-panel="library"] .tov5-librarian-row')
  await expect(prompt).toContainText('Not sure where to begin?')
  await expect(prompt).toContainText('Ask the librarian.')

  await prompt.getByRole('button', { name: 'Talk' }).click()
  await expect(page.locator('.tov5-librarian-zoom')).toHaveAttribute('data-librarian-current', 'voice')
  await page.getByRole('button', { name: 'Switch to chat' }).click()
  await expect(page.locator('.tov5-librarian-zoom')).toHaveAttribute('data-librarian-current', 'focus')
})

test('applies themed book state from query parameters', async ({ page }) => {
  await page.goto('/lab/?autoplay=0&book=frankenstein&view=book-detail')
  await expect(page.locator('[data-book-detail-title]')).toHaveText('Frankenstein')
  await expect(page.locator('.tov5-book-detail-zoom')).toHaveAttribute('data-book-world', 'frankenstein')
})
