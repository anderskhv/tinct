import { expect, test } from '@playwright/test'

test.use({ viewport: { width: 390, height: 844 } })

test.beforeEach(async ({ page }) => {
  await page.goto('/lab/?autoplay=0&view=library')
  await page.waitForFunction(() => window.__tinctLabPreReader?.ready === true)
})

test('maps the explicit landing and library aliases to their intended states', async ({ page }) => {
  await page.goto('/lab/landing?autoplay=0')
  await page.waitForFunction(() => window.__tinctLabPreReader?.ready === true)
  await expect(page.locator('[data-view-panel="landing"]')).toHaveClass(/is-current/)

  await page.goto('/lab/library?autoplay=0')
  await page.waitForFunction(() => window.__tinctLabPreReader?.ready === true)
  await expect(page.locator('[data-view-panel="library"]')).toHaveClass(/is-current/)
})

for (const viewport of [{ width: 390, height: 844 }, { width: 1440, height: 900 }]) {
  test(`opens the locked landing and enters the catalogue at ${viewport.width}px`, async ({ page }) => {
    await page.setViewportSize(viewport)
    await page.goto('/lab/?autoplay=0')
    await page.waitForFunction(() => window.__tinctLabPreReader?.ready === true)
    const landing = page.locator('[data-view-panel="landing"]')
    await expect(landing).toHaveClass(/is-current/)
    await expect(landing.getByRole('heading', { name: 'Fall in love with the books that matter.' })).toBeVisible()
    await expect(landing.getByText('Free to read · No account required')).toBeVisible()
    await expect(landing.getByRole('link', { name: 'About' })).toHaveAttribute('href', '/about')
    await expect(landing.getByRole('link', { name: 'Sign in' })).toHaveAttribute('href', '/app?signin=1')
    await expect(page.locator('.tov5-picker')).toBeHidden()
    await landing.getByRole('button', { name: 'Start reading' }).click()
    await expect(page.locator('[data-view-panel="library"]')).toHaveClass(/is-current/)
    await expect(page.locator('.tov5-library-track [data-catalogue-book]')).not.toHaveCount(0)
  })
}

test('keeps the locked landing still when reduced motion is requested', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/lab/?autoplay=0')
  await page.waitForFunction(() => window.__tinctLabPreReader?.ready === true)
  await expect(page.locator('.tov5-simple-world.odyssey')).toHaveCSS('animation-name', 'none')
  await expect(page.locator('.tov5-simple-start')).toHaveCSS('transition-duration', '0s')
})

for (const viewport of [{ width: 390, height: 844 }, { width: 1440, height: 900 }]) {
  test(`opens book detail, chooses an edition, and reaches the reader at ${viewport.width}px`, async ({ page }) => {
    await page.setViewportSize(viewport)
    await page.evaluate(() => {
      const now = Date.now()
      const hebrews = { bookId: 'hebrews', headerBook: 'Hebrews', chapterNumber: 1, sequentialChapter: 1134, paragraphIndex: 2, wordIndex: 4, updatedAt: now, deviceId: 'qa-old-bible', rev: 1 }
      localStorage.setItem('tinct-lab-position', JSON.stringify({ books: { hebrews }, lastSettledBookId: 'hebrews', lastSettledAt: now, updatedAt: now, deviceId: 'qa-old-bible' }))
    })
    await expect(page.locator('[data-view-panel="library"]')).toHaveClass(/is-current/)
    await page.locator('[data-catalogue-book="odyssey"]').first().click()
    await expect(page.locator('[data-view-panel="book-detail"]')).toHaveClass(/is-current/)
    await expect(page.locator('[data-book-detail-title]')).toHaveText('The Odyssey')

    await page.getByRole('button', { name: 'Start reading' }).click()
    await expect(page.locator('[data-view-panel="edition"]')).toHaveClass(/is-current/)
    await page.locator('[data-select-edition="original-en"]').click()
    await expect(page.locator('.tov5-continue')).toContainText('Butler')

    await page.locator('.tov5-continue').click()
    await expect(page.locator('[data-view-panel="preface"]')).toHaveClass(/is-current/)
    await page.getByRole('button', { name: /Give me a standard preface/ }).click()
    await expect(page.locator('[data-preface-thread]')).toBeVisible()
    await page.locator('.tov5-begin-book').click()
    await expect(page).toHaveURL(/\/lab\/reader$/)
    // The reader consumes the handoff before loading, so it cannot replay on refresh.
    await expect.poll(() => page.evaluate(() => sessionStorage.getItem('tinct:lab-reader-handoff'))).toBeNull()
    const reader = page.getByTestId('lab-root')
    await expect(reader).toHaveAttribute('data-book-id', 'odyssey')
    await expect(reader).toHaveAttribute('data-reader-edition', 'original-en')
    await expect(reader).toHaveAttribute('data-lab-layout', viewport.width <= 1024 ? 'phone' : 'desktop')
    await expect(page.getByTestId('lab-header-work')).toHaveText('The Odyssey')
    await expect(page.locator('.lab-passage').first()).toContainText(/Tell me, O Muse/)
  })
}

for (const viewport of [{ width: 390, height: 844 }, { width: 1440, height: 900 }]) {
  test(`renders a non-showcase catalogue book in the responsive reader at ${viewport.width}px`, async ({ page }) => {
    await page.setViewportSize(viewport)
    const search = page.getByRole('searchbox', { name: 'Search the library' })
    await search.fill('Ivan Ilyich')
    await page.locator('.tov5-library-track [data-catalogue-book="ivan-ilyich"]').click()
    await page.getByRole('button', { name: 'Start reading' }).click()
    await page.locator('[data-select-edition="original-en"]').click()
    await page.locator('.tov5-continue').click()
    await page.getByRole('button', { name: /Give me a standard preface/ }).click()
    await expect(page.locator('[data-preface-thread]')).toBeVisible()
    await page.locator('.tov5-begin-book').click()

    await expect(page).toHaveURL(/\/lab\/reader$/)
    const reader = page.getByTestId('lab-root')
    await expect(reader).toHaveAttribute('data-book-id', 'ivan-ilyich')
    await expect(reader).toHaveAttribute('data-reader-edition', 'original-en')
    await expect(reader).toHaveAttribute('data-lab-layout', viewport.width <= 1024 ? 'phone' : 'desktop')
    await expect(page.getByTestId('lab-header-work')).toHaveText('The Death of Ivan Ilyich')
    await expect(page.locator('.lab-passage').first()).toContainText(/During an interval in the Melvinski trial/)
  })
}

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
  await page.waitForFunction(() => window.__tinctLabPreReader?.ready === true)
  await expect(page.locator('[data-book-detail-title]')).toHaveText('Frankenstein')
  await expect(page.locator('.tov5-book-detail-zoom')).toHaveAttribute('data-book-world', 'frankenstein')
})

test('renders the real published catalogue and filters title, author and taxonomy', async ({ page }) => {
  await expect(page.locator('[data-view-panel="library"] header').first()).toContainText('100 published books')
  const search = page.getByRole('searchbox', { name: 'Search the library' })
  await search.fill('Death of Ivan Ilyich')
  await expect(page.locator('.tov5-library-track [data-catalogue-book="ivan-ilyich"]')).toHaveCount(1)
  await expect(page.locator('.tov5-library-track')).toContainText('Leo Tolstoy')

  await search.fill('definitely-not-a-published-book')
  await expect(page.getByText('No books found')).toBeVisible()
  await search.fill('')
  await page.locator('[data-catalogue-house="philosophy"]').click()
  await expect(page.locator('.tov5-library-track [data-catalogue-book]').first()).toBeVisible()
})

test('opens a non-showcase book with catalogue-backed detail and editions', async ({ page }) => {
  const search = page.getByRole('searchbox', { name: 'Search the library' })
  await search.fill('Ivan Ilyich')
  await page.locator('.tov5-library-track [data-catalogue-book="ivan-ilyich"]').click()
  await expect(page.locator('[data-book-detail-title]')).toHaveText('The Death of Ivan Ilyich')
  await expect(page.locator('[data-book-detail-author]')).toHaveText('Leo Tolstoy')
  await page.getByRole('button', { name: 'Start reading' }).click()
  await expect(page.locator('[data-catalogue-edition]')).toHaveCount(4)
  await expect(page.locator('.tov5-edition-grid')).toContainText('Original public-domain text')
  await expect(page.locator('.tov5-edition-grid')).toContainText('Tinct AI adaptation')
})

test('contracts the edition picker for a future single-edition catalogue entry', async ({ page }) => {
  await page.evaluate(() => {
    const source = window.__tinctLabPreReader.visibleBooks().find(book => book.id === 'odyssey')
    window.__tinctLabPreReader.renderEditionsForTest({ ...source, id: 'single-fixture', editions: [source.editions[0]] })
  })
  await expect(page.locator('.tov5-edition-grid')).toHaveAttribute('data-edition-count', '1')
  await expect(page.locator('[data-catalogue-edition]')).toHaveCount(1)
})

test('derives returning-library state from a coherent saved reader tuple', async ({ page }) => {
  await page.evaluate(() => {
    localStorage.setItem('tinct:position:meditations', JSON.stringify({ bookId: 'meditations', chapterNumber: 4, currentPage: 2, totalPages: 8, scrollFraction: .25, updatedAt: Date.now() }))
    localStorage.setItem('tinct:progress:meditations', JSON.stringify({ bookId: 'meditations', highestCompletedChapter: 3, totalChapters: 12, percent: 25 }))
    window.location.reload()
  })
  await page.waitForFunction(() => window.__tinctLabPreReader?.ready === true)
  await page.goto('/lab/?autoplay=0&view=your-library')
  await page.waitForFunction(() => window.__tinctLabPreReader?.ready === true)
  await expect(page.locator('[data-returning-book="meditations"]')).toContainText('Chapter 4 · 25% read')
  await page.locator('[data-returning-book="meditations"] [data-continue-book]').click()
  await expect(page).toHaveURL(/\/lab\/reader$/)
  await expect(page.getByTestId('lab-root')).toHaveAttribute('data-book-id', 'meditations')
  await expect(page.getByTestId('lab-root')).toHaveAttribute('data-chapter', '4')
  await expect(page.getByTestId('lab-header-work')).toHaveText('Meditations')
  await expect.poll(() => page.getByTestId('lab-root').getAttribute('data-place')).not.toBe('0:0')
  await expect(page.locator('.lab-passage').first()).toContainText(/Let nothing be done rashly/)
  await expect.poll(() => page.evaluate(() => sessionStorage.getItem('tinct:lab-reader-handoff'))).toBeNull()
})

for (const viewport of [{ width: 390, height: 844 }, { width: 1440, height: 900 }]) {
  test(`rejects invalid handoffs at ${viewport.width}px`, async ({ page }) => {
    await page.setViewportSize(viewport)
    const invalid = await page.evaluate(() => window.__tinctLabPreReader.createHandoff({ bookId: 'odyssey', primaryEditionKey: 'missing' }))
    expect(invalid).toBeNull()
    const crossBook = await page.evaluate(() => window.__tinctLabPreReader.createHandoff({
      bookId: 'odyssey', primaryEditionKey: 'original-en', savedPlace: { bookId: 'bible', chapterNumber: 1 },
    }))
    expect(crossBook).toBeNull()
    await expect(page.locator('[data-view-panel="library"] .tov5-zoom')).toBeVisible()
  })
}

declare global {
  interface Window {
    __tinctLabLastHandoff?: Record<string, unknown>
    __tinctLabPreReader: {
      ready: boolean
      createHandoff: (selection: Record<string, unknown>) => Record<string, unknown> | null
      selectBook: (bookId: string) => Promise<boolean>
      visibleBooks: () => Array<Record<string, any>>
      renderEditionsForTest: (book: Record<string, any>) => void
    }
  }
}
