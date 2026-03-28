import { test, expect, Page } from '@playwright/test'

const BASE = 'http://localhost:3001'

/**
 * Helper: seed localStorage before navigating so the app boots with known state.
 * Must be called BEFORE page.goto because React reads localStorage on mount.
 */
async function seedStorage(page: Page, entries: Record<string, unknown>) {
  // Navigate to a blank page on the same origin so we can access localStorage
  await page.goto(BASE, { waitUntil: 'commit' })
  await page.evaluate((items) => {
    localStorage.clear()
    for (const [key, value] of Object.entries(items)) {
      localStorage.setItem(key, JSON.stringify(value))
    }
  }, entries)
}

/** Bypass the BookStore + Onboarding gates so the Reader shows immediately */
function defaultSeeds(): Record<string, unknown> {
  return {
    'tinct:library': ['odyssey'],
    'tinct:preferences': {
      language: 'en',
      style: 'original',
      splitView: false,
      darkMode: false,
      panelOpen: false,
      panelTab: 'chat',
      splitEditionKey: 'modern-en',
      readingObjective: '',
      onboardingComplete: true,
    },
  }
}

// --- Test 1: Save position with scrollFraction ---
test('saves reading position with scrollFraction to localStorage', async ({ page }) => {
  await seedStorage(page, defaultSeeds())
  await page.goto(BASE, { waitUntil: 'networkidle' })

  // Wait for Reader to be visible
  await page.waitForSelector('.reader', { timeout: 10000 })
  await page.waitForSelector('.page-nav-label', { timeout: 10000 })

  // Navigate to chapter 3 via the chapter selector in the header
  const chapterSelect = page.locator('select').first()
  await chapterSelect.selectOption({ index: 2 }) // 0-indexed, so index 2 = chapter 3

  // Wait for chapter to load
  await page.waitForTimeout(1000)

  // Turn to page 3 (press right arrow twice: page 0 → 1 → 2, displayed as "3")
  await page.keyboard.press('ArrowRight')
  await page.waitForTimeout(200)
  await page.keyboard.press('ArrowRight')
  await page.waitForTimeout(500)

  // Read position from localStorage
  const saved = await page.evaluate(() => {
    const raw = localStorage.getItem('tinct:position:odyssey')
    return raw ? JSON.parse(raw) : null
  })

  expect(saved).not.toBeNull()
  expect(saved.bookId).toBe('odyssey')
  expect(saved.chapterNumber).toBe(3)
  expect(saved.currentPage).toBe(2)
  expect(saved.totalPages).toBeGreaterThan(2)
  // scrollFraction must be present and between 0 and 1
  expect(saved.scrollFraction).toBeGreaterThanOrEqual(0)
  expect(saved.scrollFraction).toBeLessThanOrEqual(1)
})

// --- Test 2: Restore position from scrollFraction ---
test('restores saved position from scrollFraction on page load', async ({ page }) => {
  const seeds = {
    ...defaultSeeds(),
    'tinct:position:odyssey': {
      bookId: 'odyssey',
      chapterNumber: 5,
      currentPage: 3,
      totalPages: 10,
      scrollFraction: 0.3, // ~30% through the chapter
    },
  }
  await seedStorage(page, seeds)
  await page.goto(BASE, { waitUntil: 'networkidle' })

  await page.waitForSelector('.page-nav-label', { timeout: 10000 })
  // Wait for pagination to settle
  await page.waitForTimeout(2000)

  // Read current position — should be approximately 30% through
  const label = await page.locator('.page-nav-label').textContent()
  const match = label?.match(/(\d+)\s*\/\s*(\d+)/)
  expect(match).not.toBeNull()
  const currentDisplay = parseInt(match![1])
  const totalDisplay = parseInt(match![2])
  // 30% of totalPages should land roughly at the right spot (allow ±2 pages for rounding)
  const expectedPage = Math.round(0.3 * (totalDisplay - 1)) + 1 // +1 for display (1-indexed)
  expect(currentDisplay).toBeGreaterThanOrEqual(expectedPage - 2)
  expect(currentDisplay).toBeLessThanOrEqual(expectedPage + 2)
})

// --- Test 3: Restore current book from localStorage ---
test('restores selected book from localStorage', async ({ page }) => {
  const seeds = {
    ...defaultSeeds(),
    'tinct:library': ['odyssey', 'war-and-peace'],
    'tinct:tinct-current-book': 'war-and-peace',
    'tinct:position:war-and-peace': {
      bookId: 'war-and-peace',
      chapterNumber: 1,
      currentPage: 0,
      totalPages: 1,
      scrollFraction: 0,
    },
  }
  await seedStorage(page, seeds)
  await page.goto(BASE, { waitUntil: 'networkidle' })

  await page.waitForSelector('.reader', { timeout: 10000 })

  // Check that the header shows War and Peace (look for it in page content)
  const headerText = await page.locator('.book-title, .header').textContent()
  expect(headerText?.toLowerCase()).toContain('war and peace')
})

// --- Test 4: Position survives page refresh ---
test('position survives page refresh', async ({ page }) => {
  await seedStorage(page, defaultSeeds())
  await page.goto(BASE, { waitUntil: 'networkidle' })

  await page.waitForSelector('.reader', { timeout: 10000 })
  await page.waitForSelector('.page-nav-label', { timeout: 10000 })

  // Navigate to chapter 2
  const chapterSelect = page.locator('select').first()
  await chapterSelect.selectOption({ index: 1 }) // chapter 2
  await page.waitForTimeout(1000)

  // Turn one page
  await page.keyboard.press('ArrowRight')
  await page.waitForTimeout(500)

  // Verify we're on page 2 (display "2")
  let label = await page.locator('.page-nav-label').textContent()
  expect(label).toMatch(/^2\s*\//)

  // Reload
  await page.reload({ waitUntil: 'networkidle' })
  await page.waitForSelector('.page-nav-label', { timeout: 10000 })
  await page.waitForTimeout(2000)

  // Should still show page 2
  label = await page.locator('.page-nav-label').textContent()
  expect(label).toMatch(/^2\s*\//)
})

// --- Test 5: Book switch doesn't corrupt the new book's position ---
test('switching books does not corrupt scrollFraction', async ({ page }) => {
  const seeds = {
    ...defaultSeeds(),
    'tinct:library': ['odyssey', 'war-and-peace'],
    'tinct:position:odyssey': {
      bookId: 'odyssey',
      chapterNumber: 5,
      currentPage: 8,
      totalPages: 12,
      scrollFraction: 0.727,
    },
    'tinct:position:war-and-peace': {
      bookId: 'war-and-peace',
      chapterNumber: 1,
      currentPage: 0,
      totalPages: 1,
      scrollFraction: 0,
    },
  }
  await seedStorage(page, seeds)
  await page.goto(BASE, { waitUntil: 'networkidle' })

  await page.waitForSelector('.reader', { timeout: 10000 })
  await page.waitForTimeout(2000)

  // Switch to War and Peace via book selector
  const bookSelect = page.locator('select.book-select')
  await bookSelect.selectOption('war-and-peace')
  await page.waitForTimeout(2000)

  // Check that War and Peace position was NOT corrupted with Odyssey's fraction
  const saved = await page.evaluate(() => {
    const raw = localStorage.getItem('tinct:position:war-and-peace')
    return raw ? JSON.parse(raw) : null
  })

  // The saved position should show chapter 1, small fraction (not Odyssey's 0.727)
  if (saved) {
    expect(saved.currentPage).toBeLessThan(3)
    expect(saved.scrollFraction).toBeLessThan(0.2)
  }
})
