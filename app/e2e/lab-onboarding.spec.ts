import { expect, test, type Page } from '@playwright/test'

const PHONE = { width: 390, height: 844 }
const TABLET = { width: 768, height: 1024 }
const DESKTOP = { width: 1440, height: 900 }

test.use({ viewport: PHONE })

async function waitForPreReader(page: Page) {
  await page.waitForFunction(() => window.__tinctLabPreReader?.ready === true)
}

async function openPreReader(page: Page, path = '/lab/?autoplay=0&view=library') {
  await page.goto(path)
  await waitForPreReader(page)
}

async function expectNoDocumentOverflow(page: Page) {
  const geometry = await page.evaluate(() => ({
    viewportWidth: window.innerWidth,
    documentWidth: document.documentElement.scrollWidth,
    bodyWidth: document.body.scrollWidth,
  }))
  expect(geometry.documentWidth).toBeLessThanOrEqual(geometry.viewportWidth + 1)
  expect(geometry.bodyWidth).toBeLessThanOrEqual(geometry.viewportWidth + 1)
}

async function capture(page: Page, name: string) {
  const directory = process.env.LAB_SCREENSHOT_DIR
  if (!directory) return
  await page.screenshot({ path: `${directory}/${name}.png`, fullPage: true })
}

test.beforeEach(async ({ page }) => {
  await openPreReader(page)
})

test('maps the explicit landing and library aliases to their intended states', async ({ page }) => {
  await openPreReader(page, '/lab/landing?autoplay=0')
  await expect(page.locator('[data-view-panel="landing"]')).toHaveClass(/is-current/)

  await openPreReader(page, '/lab/library?autoplay=0')
  await expect(page.locator('[data-view-panel="library"]')).toHaveClass(/is-current/)
})

for (const viewport of [PHONE, DESKTOP]) {
  test(`opens the locked landing and enters the catalogue at ${viewport.width}px`, async ({ page }) => {
    await page.setViewportSize(viewport)
    await openPreReader(page, '/lab/?autoplay=0')
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
  await openPreReader(page, '/lab/?autoplay=0')
  await expect(page.locator('.tov5-simple-world.odyssey')).toHaveCSS('animation-name', 'none')
  await expect(page.locator('.tov5-simple-start')).toHaveCSS('transition-duration', '0s')
})

for (const viewport of [PHONE, DESKTOP]) {
  test(`opens book detail, chooses an edition, and hands off to the reader at ${viewport.width}px`, async ({ page }) => {
    await page.setViewportSize(viewport)
    await page.evaluate(() => {
      const now = Date.now()
      const hebrews = { bookId: 'hebrews', headerBook: 'Hebrews', chapterNumber: 1, sequentialChapter: 1134, paragraphIndex: 2, wordIndex: 4, updatedAt: now, deviceId: 'qa-old-bible', rev: 1 }
      localStorage.setItem('tinct-lab-position', JSON.stringify({ books: { hebrews }, lastSettledBookId: 'hebrews', lastSettledAt: now, updatedAt: now, deviceId: 'qa-old-bible' }))
    })
    await page.locator('[data-catalogue-book="odyssey"]').first().click()
    await expect(page.locator('[data-view-panel="book-detail"]')).toHaveClass(/is-current/)
    await expect(page.locator('[data-book-detail-title]')).toHaveText('The Odyssey')

    await page.getByRole('button', { name: 'Start reading' }).click()
    await expect(page.locator('[data-view-panel="edition"]')).toHaveClass(/is-current/)
    await page.locator('[data-select-edition="original-en"]').click()
    await expect(page.locator('.tov5-continue')).toHaveText('Continue with Original')

    await page.locator('.tov5-continue').click()
    await expect(page.locator('[data-view-panel="preface"]')).toHaveClass(/is-current/)
    await page.getByRole('button', { name: /Give me a standard preface/ }).click()
    await expect(page.locator('[data-preface-thread]')).toBeVisible()
    await page.locator('.tov5-begin-book').click()
    await expect(page).toHaveURL(/\/lab\/reader$/)
    await expect(page.getByTestId('lab-root')).toHaveAttribute('data-book-id', 'odyssey')
    await expect(page.getByTestId('lab-root')).toHaveAttribute('data-reader-edition', 'original-en')
  })
}

for (const viewport of [PHONE, DESKTOP]) {
  test(`renders a non-showcase catalogue book and hands it off at ${viewport.width}px`, async ({ page }) => {
    await page.setViewportSize(viewport)
    await page.getByRole('searchbox', { name: 'Search the library' }).fill('Ivan Ilyich')
    await page.locator('.tov5-search-results [data-catalogue-book="ivan-ilyich"]').click()
    await page.getByRole('button', { name: 'Start reading' }).click()
    await page.locator('[data-select-edition="original-en"]').click()
    await page.locator('.tov5-continue').click()
    await page.getByRole('button', { name: /Give me a standard preface/ }).click()
    await expect(page.locator('[data-preface-thread]')).toBeVisible()
    await page.locator('.tov5-begin-book').click()

    await expect(page).toHaveURL(/\/lab\/reader$/)
    await expect(page.getByTestId('lab-root')).toHaveAttribute('data-book-id', 'ivan-ilyich')
    await expect(page.getByTestId('lab-root')).toHaveAttribute('data-reader-edition', 'original-en')
  })
}

test('removes the unfinished Librarian path and rejects its old view parameter', async ({ page }) => {
  await expect(page.getByText('Ask the librarian.')).toHaveCount(0)
  await expect(page.locator('[data-view-panel="librarian"]')).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'Talk' })).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'Chat' })).toHaveCount(0)

  await openPreReader(page, '/lab/?autoplay=0&view=librarian')
  await expect(page.locator('[data-view-panel="landing"]')).toHaveClass(/is-current/)
  await expect(page.locator('[data-view-panel].is-current')).toHaveCount(1)
})

test('applies themed book state from query parameters', async ({ page }) => {
  await openPreReader(page, '/lab/?autoplay=0&book=frankenstein&view=book-detail')
  await expect(page.locator('[data-book-detail-title]')).toHaveText('Frankenstein')
  await expect(page.locator('.tov5-book-detail-zoom')).toHaveAttribute('data-book-world', 'frankenstein')
})

test('renders the published catalogue and filters title, author and taxonomy', async ({ page }) => {
  const publishedCount = await page.evaluate(() => window.__tinctLabPreReader.visibleBooks().length)
  await expect(page.locator('[data-view-panel="library"] header').first()).toContainText(`${publishedCount} published books`)
  const search = page.getByRole('searchbox', { name: 'Search the library' })
  await search.fill('Death of Ivan Ilyich')
  await expect(page.locator('.tov5-search-results [data-catalogue-book="ivan-ilyich"]')).toHaveCount(1)
  await expect(page.locator('.tov5-search-results')).toContainText('Leo Tolstoy')

  await search.fill('definitely-not-a-published-book')
  await expect(page.getByText('No books found')).toBeVisible()
  await search.fill('')
  await page.locator('[data-catalogue-house="philosophy"]').click()
  await expect(page.locator('.tov5-library-track [data-catalogue-book]').first()).toBeVisible()
})

test('shows Republic once in a unique flat search result set', async ({ page }) => {
  await page.getByRole('searchbox', { name: 'Search the library' }).fill('Republic')
  const results = page.locator('.tov5-search-results [data-catalogue-book]')
  await expect(page.locator('.tov5-search-results [data-catalogue-book="the-republic"]')).toHaveCount(1)
  const ids = await results.evaluateAll(elements => elements.map(element => element.getAttribute('data-catalogue-book')))
  expect(new Set(ids).size).toBe(ids.length)
  await expect(page.locator('.tov5-library-section')).toHaveCount(0)
})

test('opens a non-showcase book with catalogue-backed detail and editions', async ({ page }) => {
  await page.getByRole('searchbox', { name: 'Search the library' }).fill('Ivan Ilyich')
  await page.locator('.tov5-search-results [data-catalogue-book="ivan-ilyich"]').click()
  await expect(page.locator('[data-book-detail-title]')).toHaveText('The Death of Ivan Ilyich')
  await expect(page.locator('[data-book-detail-author]')).toHaveText('Leo Tolstoy')
  expect(await page.locator('.tov5-book-detail-body').evaluate(element => Array.from(element.children).map(child => child.className))).toEqual([
    'tov5-book-identity',
    'tov5-book-length',
    'tov5-book-description',
    'tov5-choose-edition',
  ])
  await page.getByRole('button', { name: 'Start reading' }).click()
  expect(await page.locator('[data-catalogue-edition]').count()).toBeGreaterThan(0)
  await expect(page.locator('[data-select-edition="modern-da"]')).toHaveCount(0)
  await expect(page.locator('.tov5-edition-grid')).not.toContainText('Danish')
  await expect(page.locator('.tov5-edition-grid')).not.toContainText('Dansk')
  await expect(page.locator('.tov5-edition-grid')).toContainText('Original public-domain text')
  await expect(page.locator('.tov5-edition-grid')).toContainText('Tinct AI adaptation')
})

test('keeps the English V1 choices and Both mutually exclusive in a complete phone stack', async ({ page }) => {
  await openPreReader(page, '/lab/?autoplay=0&book=ulysses&view=edition')
  const original = page.locator('[data-select-edition="original-en"]')
  const modern = page.locator('[data-select-edition="modern-en"]')
  const both = page.locator('.tov5-both [data-edition-choice]')

  await expect(page.locator('[data-catalogue-edition]')).toHaveCount(2)
  await expect(page.locator('[data-select-edition="modern-da"]')).toHaveCount(0)
  const stack = await page.locator('.tov5-edition-grid').evaluate(element => ({
    fits: element.scrollWidth <= element.clientWidth + 1,
    cards: Array.from(element.children).map(card => {
      const rect = card.getBoundingClientRect()
      return { left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom }
    }),
    viewportWidth: window.innerWidth,
  }))
  expect(stack.fits).toBe(true)
  expect(stack.cards.every(card => card.left >= 0 && card.right <= stack.viewportWidth + 1)).toBe(true)
  expect(stack.cards[0].bottom).toBeLessThanOrEqual(stack.cards[1].top)
  await expectNoDocumentOverflow(page)

  await expect(original).toHaveAttribute('aria-pressed', 'true')
  await expect(modern).toHaveAttribute('aria-pressed', 'false')
  await expect(both).toHaveAttribute('aria-pressed', 'false')
  await modern.click()
  await expect(original).toHaveAttribute('aria-pressed', 'false')
  await expect(modern).toHaveAttribute('aria-pressed', 'true')
  await expect(both).toHaveAttribute('aria-pressed', 'false')
  await expect(page.locator('.tov5-continue')).toHaveText('Continue with Modern English')

  await both.click()
  await expect(original).toHaveAttribute('aria-pressed', 'false')
  await expect(modern).toHaveAttribute('aria-pressed', 'false')
  await expect(both).toHaveAttribute('aria-pressed', 'true')
  await expect(page.locator('[data-catalogue-edition].is-selected')).toHaveCount(0)
  await expect(page.locator('.tov5-both')).toHaveClass(/is-selected/)
  await expect(page.locator('.tov5-continue')).toHaveText('Continue with Both')
})

for (const viewport of [PHONE, DESKTOP]) {
  test(`fits Divine Comedy's full Longfellow edition label at ${viewport.width}px`, async ({ page }) => {
    await page.setViewportSize(viewport)
    await openPreReader(page, '/lab/?autoplay=0&book=divine-comedy&view=edition')
    const originalCard = page.locator('[data-catalogue-edition="original-en"]')
    await expect(originalCard).toContainText('Longfellow Translation (1867)')
    expect(await originalCard.evaluate(element => element.scrollWidth <= element.clientWidth + 1)).toBe(true)
    await expectNoDocumentOverflow(page)
  })
}

test('creates valid Ulysses, Divine Comedy and future single-edition handoffs', async ({ page }) => {
  const intents = await page.evaluate(() => {
    const api = window.__tinctLabPreReader
    const ulysses = api.createHandoff({ bookId: 'ulysses', primaryEditionKey: 'modern-en', compareEditionKey: 'original-en' })
    const divineComedy = api.createHandoff({ bookId: 'divine-comedy', primaryEditionKey: 'original-en' })
    const danish = api.createHandoff({ bookId: 'ulysses', primaryEditionKey: 'modern-da' })
    const source = api.visibleBooks().find(book => book.id === 'odyssey')
    const fixture = { ...source, id: 'single-edition-fixture', editions: [source.editions[0]] }
    api.renderEditionsForTest(fixture)
    const single = api.createHandoff({ bookId: fixture.id, primaryEditionKey: fixture.editions[0].key })
    return { ulysses, divineComedy, danish, single }
  })
  expect(intents.ulysses).toMatchObject({ bookId: 'ulysses', primaryEditionKey: 'modern-en', compareEditionKey: 'original-en' })
  expect(intents.divineComedy).toMatchObject({ bookId: 'divine-comedy', primaryEditionKey: 'original-en' })
  expect(intents.danish).toBeNull()
  expect(intents.single).toMatchObject({ bookId: 'single-edition-fixture', primaryEditionKey: 'original-en' })
  await expect(page.locator('.tov5-edition-grid')).toHaveAttribute('data-edition-count', '1')
})

test('derives returning-library state from a coherent saved reader tuple', async ({ page }) => {
  await page.evaluate(() => {
    localStorage.setItem('tinct:position:meditations', JSON.stringify({ bookId: 'meditations', chapterNumber: 4, currentPage: 2, totalPages: 8, scrollFraction: .25, updatedAt: Date.now() }))
    localStorage.setItem('tinct:progress:meditations', JSON.stringify({ bookId: 'meditations', highestCompletedChapter: 3, totalChapters: 12, percent: 25 }))
  })
  await openPreReader(page, '/lab/?autoplay=0&view=your-library')
  await expect(page.locator('[data-returning-book="meditations"]')).toContainText('Chapter 4 · 25% read')
  await page.locator('[data-returning-book="meditations"] [data-continue-book]').click()
  await expect(page).toHaveURL(/\/lab\/reader$/)
  await expect(page.getByTestId('lab-root')).toHaveAttribute('data-book-id', 'meditations')
  await expect(page.getByTestId('lab-root')).toHaveAttribute('data-chapter', '4')
})

for (const viewport of [PHONE, DESKTOP]) {
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

for (const viewport of [PHONE, TABLET, DESKTOP]) {
  test(`uses intentional pre-reader geometry without accidental overflow at ${viewport.width}px`, async ({ page }) => {
    await page.setViewportSize(viewport)
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await openPreReader(page)
    const geometry = await page.locator('.tov5-library-zoom').evaluate(element => {
      const rect = element.getBoundingClientRect()
      const body = element.querySelector('.tov5-library-body')
      return { width: rect.width, left: rect.left, right: window.innerWidth - rect.right, bodyFits: !body || body.scrollWidth <= body.clientWidth + 1 }
    })
    await expectNoDocumentOverflow(page)
    expect(geometry.bodyFits).toBe(true)
    if (viewport.width === DESKTOP.width) {
      expect(geometry.width).toBeGreaterThanOrEqual(1100)
      expect(geometry.width).toBeLessThanOrEqual(1280)
      expect(Math.abs(geometry.left - geometry.right)).toBeLessThanOrEqual(2)
    } else if (viewport.width === TABLET.width) {
      expect(geometry.width).toBeGreaterThanOrEqual(720)
    } else {
      expect(geometry.width).toBe(viewport.width)
    }

    const labelStyles = await page.locator('.tov5-library-section [data-catalogue-book] strong').evaluateAll(elements => elements.filter(element => (element as HTMLElement).offsetParent !== null).map(element => {
      const style = getComputedStyle(element)
      return { textOverflow: style.textOverflow, whiteSpace: style.whiteSpace }
    }))
    expect(labelStyles.length).toBeGreaterThan(0)
    labelStyles.forEach(style => {
      expect(style.textOverflow).not.toBe('ellipsis')
      expect(style.whiteSpace).not.toBe('nowrap')
    })

    await page.evaluate(() => window.__tinctLabPreReader.selectBook('ulysses'))
    await expect(page.locator('[data-view-panel="book-detail"]')).toHaveClass(/is-current/)
    await expectNoDocumentOverflow(page)
    expect(await page.locator('.tov5-book-detail-body').evaluate(element => element.scrollWidth <= element.clientWidth + 1)).toBe(true)

    await page.getByRole('button', { name: 'Start reading' }).click()
    await expectNoDocumentOverflow(page)
    if (viewport.width > PHONE.width) {
      expect(await page.locator('.tov5-edition-surface').evaluate(element => element.scrollWidth <= element.clientWidth + 1)).toBe(true)
    }

    await page.locator('.tov5-continue').click()
    await expect(page.locator('[data-view-panel="preface"]')).toHaveClass(/is-current/)
    await expectNoDocumentOverflow(page)
    expect(await page.locator('.tov5-preface-body').evaluate(element => element.scrollWidth <= element.clientWidth + 1)).toBe(true)
  })
}

for (const { label, viewport } of [{ label: 'phone', viewport: PHONE }, { label: 'desktop', viewport: DESKTOP }]) {
  test(`captures the complete ${label} pre-reader journey`, async ({ page }) => {
    await page.setViewportSize(viewport)
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await openPreReader(page, '/lab/?autoplay=0')
    await capture(page, `${label}-01-landing`)
    await page.getByRole('button', { name: 'Start reading' }).click()
    await capture(page, `${label}-02-library`)
    await page.getByRole('searchbox', { name: 'Search the library' }).fill('Republic')
    await expect(page.locator('.tov5-search-results [data-catalogue-book="the-republic"]')).toHaveCount(1)
    await capture(page, `${label}-03-republic-search`)
    await page.evaluate(() => window.__tinctLabPreReader.selectBook('ulysses'))
    await expect(page.locator('[data-view-panel="book-detail"]')).toHaveClass(/is-current/)
    await capture(page, `${label}-04-book-detail`)
    await page.getByRole('button', { name: 'Start reading' }).click()
    await expect(page.locator('[data-catalogue-edition]')).toHaveCount(2)
    await expect(page.locator('[data-select-edition="modern-da"]')).toHaveCount(0)
    await capture(page, `${label}-05-edition-picker`)
    await page.locator('.tov5-both [data-edition-choice]').click()
    await expect(page.locator('.tov5-both [data-edition-choice]')).toHaveAttribute('aria-pressed', 'true')
    await capture(page, `${label}-06-both-selected`)
    await page.locator('.tov5-continue').click()
    await expect(page.locator('[data-view-panel="preface"]')).toHaveClass(/is-current/)
    await capture(page, `${label}-07-optional-preface`)
    await expectNoDocumentOverflow(page)
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
