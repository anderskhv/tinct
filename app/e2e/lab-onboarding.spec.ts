import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { expect, test, type Page } from '@playwright/test'

const PHONE = { width: 390, height: 844 }
const TABLET = { width: 768, height: 1024 }
const DESKTOP = { width: 1440, height: 900 }
const REQUIRED_VIEWPORTS = [
  { label: 'small-phone', width: 320, height: 568 },
  { label: 'iphone-se', width: 375, height: 667 },
  { label: 'phone', ...PHONE },
  { label: 'iphone-15', width: 393, height: 852 },
  { label: 'large-phone', width: 430, height: 932 },
  { label: 'tablet', ...TABLET },
  { label: 'desktop', ...DESKTOP },
]

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

async function searchLibrary(page: Page, query: string) {
  const input = page.getByRole('searchbox', { name: 'Search by title or author' })
  await input.fill(query)
  return input
}

/**
 * A genuine device reading memory: sessions whose anchors resolve against the
 * exact published chapter text, the shape the lab recorder writes.
 */
type SeedEntry = { id: string; bookId: string; editionKey: string; chapterNumber: number; page: number; totalPages: number; ageMs: number }

function wordSpans(text: string) {
  const spans: Array<{ start: number; end: number; text: string }> = []
  const re = /\S+/g
  let match: RegExpExecArray | null
  while ((match = re.exec(text)) !== null) spans.push({ start: match.index, end: match.index + match[0].length, text: match[0] })
  return spans
}

function chapterParagraphs(bookId: string, editionKey: string, chapterNumber: number): { label: string; paragraphs: string[] } {
  const publicDir = [resolve(process.cwd(), 'public'), resolve(process.cwd(), '../public')].find(existsSync)!
  const shardDir = resolve(publicDir, 'data/editions-chapters', `${bookId}-${editionKey}`)
  if (existsSync(resolve(shardDir, 'manifest.json'))) {
    const manifest = JSON.parse(readFileSync(resolve(shardDir, 'manifest.json'), 'utf8')) as { chapters: Array<{ path: string; title?: string }> }
    const entry = manifest.chapters[chapterNumber - 1]
    const data = JSON.parse(readFileSync(resolve(shardDir, entry.path), 'utf8')) as { title?: string; paragraphs: string[] }
    return { label: data.title || entry.title || `Chapter ${chapterNumber}`, paragraphs: data.paragraphs }
  }
  const edition = JSON.parse(readFileSync(resolve(publicDir, 'data/editions', `${bookId}-${editionKey}.json`), 'utf8')) as { chapters: Array<{ title?: string; paragraphs: string[] }> }
  const data = edition.chapters[chapterNumber - 1]
  return { label: data.title || `Chapter ${chapterNumber}`, paragraphs: data.paragraphs }
}

function readingMemorySeed(entries: SeedEntry[]) {
  const now = Date.now()
  const sessions = entries.map(entry => {
    const chapter = chapterParagraphs(entry.bookId, entry.editionKey, entry.chapterNumber)
    const endParagraph = Math.min(2, chapter.paragraphs.length - 1)
    const startWords = wordSpans(chapter.paragraphs[0])
    const endWords = wordSpans(chapter.paragraphs[endParagraph])
    const range = {
      startParagraphIndex: 0, startWordIndex: 0, startCharOffset: startWords[0].start,
      endParagraphIndex: endParagraph, endWordIndex: endWords.length, endCharOffset: endWords[endWords.length - 1].end,
      firstWords: startWords.slice(0, 4).map(word => word.text).join(' '),
      lastWords: endWords.slice(-4).map(word => word.text).join(' '),
    }
    const lastActiveAt = now - entry.ageMs
    return {
      id: entry.id, seq: 1, deviceId: 'e2e-device', owner: null, state: 'progressed',
      anchor: { bookId: entry.bookId, editionKey: entry.editionKey, chapterNumber: entry.chapterNumber, chapterLabel: chapter.label, page: entry.page, totalPages: entry.totalPages, paragraphIndex: endParagraph, wordIndex: endWords.length, range },
      startedAt: lastActiveAt - 20 * 60 * 1000, lastActiveAt, endedAt: lastActiveAt, completedAt: null,
    }
  })
  return { v: 1, sessions: Object.fromEntries(sessions.map(session => [session.id, session])), updatedAt: now }
}

const seedReadingMemory = (memory: ReturnType<typeof readingMemorySeed>) => {
  localStorage.setItem('tinct:reading-memory', JSON.stringify(memory))
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
    await expect(landing.getByRole('link', { name: 'Sign in' })).toHaveAttribute('href', '/lab/sign-in?returnTo=%2Flab%2Flanding')
    await expect(page.locator('.tov5-picker')).toBeHidden()
    await landing.getByRole('button', { name: 'Start reading' }).click()
    await expect(page.locator('[data-view-panel="library"]')).toHaveClass(/is-current/)
    await expect(page.locator('[data-popular-shelf] [data-shelf-book]')).toHaveCount(8)
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
    await searchLibrary(page, 'Odyssey')
    await page.locator('[data-library-index] [data-catalogue-book="odyssey"]').click()
    await expect(page.locator('[data-view-panel="book-detail"]')).toHaveClass(/is-current/)
    await expect(page.locator('[data-book-detail-title]')).toHaveText('The Odyssey')

    await page.getByRole('button', { name: 'Start reading' }).click()
    await expect(page.locator('[data-view-panel="edition"]')).toHaveClass(/is-current/)
    await page.locator('[data-select-edition="original-en"]').click()
    await expect(page.locator('.tov5-continue')).toHaveText('Continue with Original')

    await page.locator('.tov5-continue').click()
    await expect(page).toHaveURL(/\/lab\/reader$/)
    await expect(page.getByTestId('lab-root')).toHaveAttribute('data-book-id', 'odyssey')
    await expect(page.getByTestId('lab-root')).toHaveAttribute('data-reader-edition', 'original-en')
    await expect(page.getByTestId('lab-root')).toHaveAttribute('data-cover-page', 'true')
    await expect(page.getByTestId('lab-chapter-cover')).toContainText('The Odyssey')
  })
}

for (const viewport of [PHONE, DESKTOP]) {
  test(`renders a non-showcase catalogue book and hands it off at ${viewport.width}px`, async ({ page }) => {
    await page.setViewportSize(viewport)
    await searchLibrary(page, 'Ivan Ilyich')
    await page.locator('[data-library-index] [data-catalogue-book="ivan-ilyich"]').click()
    await page.getByRole('button', { name: 'Start reading' }).click()
    await page.locator('[data-select-edition="original-en"]').click()
    await page.locator('.tov5-continue').click()

    await expect(page).toHaveURL(/\/lab\/reader$/)
    await expect(page.getByTestId('lab-root')).toHaveAttribute('data-book-id', 'ivan-ilyich')
    await expect(page.getByTestId('lab-root')).toHaveAttribute('data-reader-edition', 'original-en')
    await expect(page.getByTestId('lab-root')).toHaveAttribute('data-cover-page', 'true')
    await expect(page.getByTestId('lab-chapter-cover')).toContainText('The Death of Ivan Ilyich')
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

  await openPreReader(page, '/lab/?autoplay=0&view=your-library')
  await expect(page.locator('[data-view-panel="landing"]')).toHaveClass(/is-current/)
  await expect(page.locator('[data-view-panel="your-library"]')).toHaveCount(0)
})

test('applies themed book state from query parameters', async ({ page }) => {
  await openPreReader(page, '/lab/?autoplay=0&book=frankenstein&view=book-detail')
  await expect(page.locator('[data-book-detail-title]')).toHaveText('Frankenstein')
  await expect(page.locator('.tov5-book-detail-zoom')).toHaveAttribute('data-book-world', 'frankenstein')
})

test('renders the published catalogue index and filters title and author', async ({ page }) => {
  const publishedCount = await page.evaluate(() => window.__tinctLabPreReader.visibleBooks().length)
  await expect(page.locator('[data-index-label]')).toHaveText('All books')
  await expect(page.locator('[data-index-count]')).toHaveText(String(publishedCount))
  const houseCounts = (await page.locator('[data-index-house] .lib-cnt').allTextContents()).map(Number)
  expect(houseCounts.length).toBeGreaterThan(0)
  expect(houseCounts.every(count => count > 0)).toBe(true)
  const search = await searchLibrary(page, 'Death of Ivan Ilyich')
  await expect(page.locator('[data-library-index] [data-catalogue-book="ivan-ilyich"]')).toHaveCount(1)
  await expect(page.locator('[data-library-index]')).toContainText('Leo Tolstoy')

  await search.fill('Leo Tolstoy')
  const authorResults = page.locator('[data-library-index] [data-catalogue-book]')
  expect(await authorResults.count()).toBeGreaterThan(1)
  const authors = await authorResults.locator('.lib-row-a').allTextContents()
  expect(new Set(authors)).toEqual(new Set(['Leo Tolstoy']))

  await search.fill('definitely-not-a-published-book')
  await expect(page.locator('[data-library-index] .lib-row.is-empty')).toContainText('No book matches')
  await search.fill('')
  await page.locator('[data-index-house="philosophy"]').click()
  await expect(page.locator('[data-index-house="philosophy"]')).toHaveAttribute('aria-expanded', 'true')
  await expect(page.locator('[data-index-house="philosophy"] + .lib-row-books [data-catalogue-book="the-republic"]')).toBeVisible()
})

test('shows Republic once in a unique flat search result set', async ({ page }) => {
  await searchLibrary(page, 'Republic')
  const results = page.locator('[data-library-index] [data-catalogue-book]')
  await expect(results).toHaveCount(1)
  await expect(results.first()).toHaveAttribute('data-catalogue-book', 'the-republic')
  await expect(results.first().locator('.lib-row-t')).toHaveText('The Republic')
  const ids = await results.evaluateAll(elements => elements.map(element => element.getAttribute('data-catalogue-book')))
  expect(new Set(ids).size).toBe(ids.length)
  await expect(page.locator('[data-index-house]')).toHaveCount(0)
})

test('filters the index inline from the one search row and clears with Escape', async ({ page }) => {
  const search = page.getByRole('searchbox', { name: 'Search by title or author' })
  await expect(search).toHaveAttribute('placeholder', /^Search \d+ books$/)
  await expect(page.locator('.lib-hdr input, .lib-hdr [aria-label="Search library"]')).toHaveCount(0)
  for (const query of ['Republic', 'Jane Austen', 'not-in-the-published-catalogue']) {
    await search.fill(query)
    await expect(page.locator('[data-index-label]')).toHaveText('Search results')
    if (query === 'Republic') {
      const ids = await page.locator('[data-library-index] [data-catalogue-book]').evaluateAll(elements => elements.map(element => element.getAttribute('data-catalogue-book')))
      expect(ids).toEqual(['the-republic'])
    } else if (query === 'Jane Austen') {
      const authors = await page.locator('[data-library-index] [data-catalogue-book] .lib-row-a').allTextContents()
      expect(authors.length).toBeGreaterThan(0)
      expect(new Set(authors)).toEqual(new Set(['Jane Austen']))
    } else {
      await expect(page.locator('[data-library-index] .lib-row.is-empty')).toContainText('No book matches')
    }
  }
  await search.press('Escape')
  await expect(search).toHaveValue('')
  await expect(page.locator('[data-index-label]')).toHaveText('All books')
  await expect(page.locator('[data-index-house]').first()).toBeVisible()
})

test('keeps the popular shelf selectable by tap and keyboard on the phone', async ({ page }) => {
  await page.setViewportSize(PHONE)
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await openPreReader(page, '/lab/library?autoplay=0')
  await expect(page.locator('[data-popular-shelf].is-revealing')).toHaveCount(0)
  await expect(page.locator('[data-popular-eyebrow]')).toHaveText('Popular · 1 of 8')
  await expect(page.locator('[data-popular-title]')).toHaveText('The Odyssey')
  await expect(page.locator('[data-shelf-index="0"]')).toHaveAttribute('aria-label', 'The Odyssey')
  await page.locator('[data-shelf-index="1"]').click()
  await expect(page.locator('[data-popular-title]')).toHaveText('Hamlet')
  await expect(page.locator('[data-shelf-index="1"]')).toHaveAttribute('aria-current', 'true')
  await expect(page).toHaveURL(/\/lab\/library/)
  await page.locator('[data-shelf-index="1"]').focus()
  await page.keyboard.press('ArrowRight')
  await expect(page.locator('[data-popular-eyebrow]')).toHaveText('Popular · 3 of 8')
  await expect(page.locator('[data-popular-title]')).toHaveText('The Republic')
  await expect(page.locator('[data-shelf-index="2"]')).toBeFocused()
  await page.keyboard.press('Home')
  await expect(page.locator('[data-popular-eyebrow]')).toHaveText('Popular · 1 of 8')
  await expectNoDocumentOverflow(page)
})

test('renders the returning reader from reading memory: recap headline, one pill, quiet rows, uniform shelf', async ({ page }) => {
  await page.evaluate(seedReadingMemory, readingMemorySeed([
    { id: 'bible-1', bookId: 'bible', editionKey: 'kjv-en', chapterNumber: 1, page: 2, totalPages: 4, ageMs: 2 * 3600e3 },
    { id: 'meditations-1', bookId: 'meditations', editionKey: 'original-en', chapterNumber: 1, page: 3, totalPages: 9, ageMs: 26 * 3600e3 },
  ]))
  await openPreReader(page, '/lab/library')
  const recap = page.locator('[data-reading-memory-recap]')
  await expect(recap).toBeVisible()
  await expect(recap).toHaveAttribute('data-body-kind', 'excerpt')
  await expect(recap).toHaveAttribute('data-completed', 'false')
  await expect(recap.getByTestId('lab-recap-eyebrow')).toHaveText('Last time you read · Genesis 1')
  await expect(recap.getByTestId('lab-recap-headline')).toHaveText(/^“In the beginning God created/)
  await expect(recap.getByTestId('lab-recap-book')).toHaveText('The Bible')
  await expect(recap.locator('[data-recap-continue]')).toHaveCount(1)
  await expect(recap.locator('[data-recap-open]')).toHaveCount(1)
  await expect(recap.locator('[data-recap-open="meditations"] .lib-recap-row-t')).toHaveText('Meditations')
  await expect(recap.locator('[data-recap-open="meditations"] .lib-eyebrow')).toHaveText('Last time · Book 1')
  await expect(page.locator('[data-popular-eyebrow]')).toHaveText('Popular')
  await expect(page.locator('[data-popular-shelf]')).toHaveClass(/lib-grid/)
  await expect(page.locator('[data-popular-shelf] [data-shelf-book]')).toHaveCount(8)
  await expect(page.locator('[data-library-account-invite], .tov5-library-finished, .tov5-categories, .tov5-library-continue')).toHaveCount(0)
  await expectNoDocumentOverflow(page)
})

test('opens a non-showcase book with catalogue-backed detail and editions', async ({ page }) => {
  await searchLibrary(page, 'Ivan Ilyich')
  await page.locator('[data-library-index] [data-catalogue-book="ivan-ilyich"]').click()
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

test('keeps the English V1 choices and Both mutually exclusive in one compact phone surface', async ({ page }) => {
  await openPreReader(page, '/lab/?autoplay=0&book=ulysses&view=edition')
  const original = page.locator('[data-select-edition="original-en"]')
  const modern = page.locator('[data-select-edition="modern-en"]')
  const both = page.locator('.tov5-both[data-edition-choice]')

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
  expect(Math.abs(stack.cards[0].top - stack.cards[1].top)).toBeLessThanOrEqual(1)
  await expectNoDocumentOverflow(page)
  await expect(page.locator('[data-edition-sample]')).toHaveAttribute('aria-busy', 'false')
  await expect(page.locator('[data-edition-sample-text="original-en"]')).toContainText('Stately, plump Buck Mulligan')
  const initialCta = await page.locator('.tov5-continue').boundingBox()
  expect(initialCta).not.toBeNull()
  expect(initialCta!.y + initialCta!.height).toBeLessThanOrEqual(PHONE.height)

  await expect(original).toHaveAttribute('aria-pressed', 'true')
  await expect(modern).toHaveAttribute('aria-pressed', 'false')
  await expect(both).toHaveAttribute('aria-pressed', 'false')
  await modern.click()
  await expect(original).toHaveAttribute('aria-pressed', 'false')
  await expect(modern).toHaveAttribute('aria-pressed', 'true')
  await expect(both).toHaveAttribute('aria-pressed', 'false')
  await expect(page.locator('.tov5-continue')).toHaveText('Continue with Modern English')
  await expect(page.locator('[data-edition-sample]')).toHaveAttribute('aria-busy', 'false')
  await expect(page.locator('[data-edition-sample-text="modern-en"]')).toContainText('carrying a bowl of shaving lather')

  await both.click()
  await expect(original).toHaveAttribute('aria-pressed', 'false')
  await expect(modern).toHaveAttribute('aria-pressed', 'false')
  await expect(both).toHaveAttribute('aria-pressed', 'true')
  await expect(page.locator('[data-catalogue-edition].is-selected')).toHaveCount(0)
  await expect(page.locator('.tov5-both')).toHaveClass(/is-selected/)
  await expect(page.locator('.tov5-continue')).toHaveText('Continue with Both')
  await expect(page.locator('[data-edition-sample]')).toHaveAttribute('aria-busy', 'false')
  await expect(page.locator('[data-edition-sample-text]')).toHaveCount(2)
  await expect(page.locator('[data-edition-sample-text="original-en"]')).toContainText('Stately, plump Buck Mulligan')
  await expect(page.locator('[data-edition-sample-text="modern-en"]')).toContainText('carrying a bowl of shaving lather')
})

for (const viewport of [
  { label: 'small-phone', width: 320, height: 568 },
  { label: 'phone', ...PHONE },
  { label: 'tablet', ...TABLET },
  { label: 'desktop', ...DESKTOP },
]) {
  test(`renders real compact samples for one, two and three edition surfaces at ${viewport.label}`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height })

    await openPreReader(page, '/lab/?autoplay=0&book=odyssey&view=edition')
    await page.evaluate(() => {
      const source = window.__tinctLabPreReader.visibleBooks().find(book => book.id === 'odyssey')!
      window.__tinctLabPreReader.renderEditionsForTest({ ...source, editions: [source.editions[0]] })
    })
    await expect(page.locator('.tov5-edition-grid')).toHaveAttribute('data-edition-count', '1')
    await expect(page.locator('[data-edition-sample]')).toHaveAttribute('aria-busy', 'false')
    await expect(page.locator('[data-edition-sample-text="original-en"]')).not.toContainText('Sample unavailable')
    await expectNoDocumentOverflow(page)
    await capture(page, `${viewport.label}-edition-one`)

    await openPreReader(page, '/lab/?autoplay=0&book=divine-comedy&view=edition')
    await expect(page.locator('.tov5-edition-grid')).toHaveAttribute('data-edition-count', '2')
    await expect(page.locator('[data-catalogue-edition="original-en"]')).toContainText('Longfellow Translation (1867)')
    await expect(page.locator('[data-edition-sample]')).toHaveAttribute('aria-busy', 'false')
    await expect(page.locator('[data-edition-sample-text="original-en"]')).toContainText('Midway upon the journey of our life')
    await expectNoDocumentOverflow(page)
    await capture(page, `${viewport.label}-edition-two-long-label`)

    await openPreReader(page, '/lab/?autoplay=0&book=ivan-ilyich&view=edition')
    await expect(page.locator('.tov5-edition-grid')).toHaveAttribute('data-edition-count', '3')
    await expect(page.locator('[data-select-edition="modern-da"]')).toHaveCount(0)
    await expect(page.locator('[data-edition-sample]')).toHaveAttribute('aria-busy', 'false')
    await expect(page.locator('[data-edition-sample-text="original-en"]')).toContainText('During an interval in the Melvinski trial')
    const cta = await page.locator('.tov5-continue').boundingBox()
    expect(cta).not.toBeNull()
    expect(cta!.y + cta!.height).toBeLessThanOrEqual(viewport.height)
    await expectNoDocumentOverflow(page)
    await capture(page, `${viewport.label}-edition-three`)
  })
}

for (const viewport of REQUIRED_VIEWPORTS) {
  test(`selects every edition card from its title, body and footer at ${viewport.label}`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height })
    await openPreReader(page, '/lab/?autoplay=0&book=ulysses&view=edition')

    const assertions = [
      { key: 'original-en', prepare: 'modern-en', cta: 'Continue with Original' },
      { key: 'modern-en', prepare: 'original-en', cta: 'Continue with Modern English' },
      { key: 'both', prepare: 'original-en', cta: 'Continue with Both' },
    ]
    for (const assertion of assertions) {
      for (const verticalPosition of [.12, .5, .88]) {
        await page.locator(`[data-catalogue-edition="${assertion.prepare}"]`).click()
        const target = assertion.key === 'both'
          ? page.locator('.tov5-both[data-edition-choice]')
          : page.locator(`[data-catalogue-edition="${assertion.key}"]`)
        const box = await target.boundingBox()
        expect(box).not.toBeNull()
        const before = await page.evaluate(() => window.__tinctLabPreReader.selectionState().revision)
        await target.click({ position: { x: box!.width / 2, y: Math.max(2, Math.min(box!.height - 2, box!.height * verticalPosition)) } })
        const after = await page.evaluate(() => window.__tinctLabPreReader.selectionState().revision)
        expect(after).toBe(before + 1)
        await expect(target).toHaveAttribute('aria-pressed', 'true')
        await expect(page.locator('.tov5-continue')).toHaveText(assertion.cta)
        await expectNoDocumentOverflow(page)
      }
    }
  })
}

test('removes preface from the V1 route and direct handoff flow', async ({ page }) => {
  await expect(page.locator('[data-view-panel="preface"]')).toBeHidden()
  await expect(page.locator('[data-view="preface"]')).toHaveCount(0)
  await expect(page.locator('[data-begin-reading]:visible')).toHaveCount(0)

  await openPreReader(page, '/lab/?autoplay=0&book=odyssey&view=preface')
  await expect(page.locator('[data-view-panel="landing"]')).toHaveClass(/is-current/)
  await expect(page.locator('[data-view-panel="preface"]')).toBeHidden()

  await openPreReader(page, '/lab/library?autoplay=0&book=odyssey&view=preface')
  await expect(page.locator('[data-view-panel="library"]')).toHaveClass(/is-current/)
  await expect(page.locator('[data-view-panel="preface"]')).toBeHidden()

  await openPreReader(page, '/lab/?autoplay=0&book=odyssey&view=edition')
  await page.locator('.tov5-continue').click()
  await expect(page).toHaveURL(/\/lab\/reader$/)
  await page.goBack()
  await waitForPreReader(page)
  await expect(page.locator('[data-view-panel="edition"]')).toHaveClass(/is-current/)
  await expect(page.locator('[data-view-panel="preface"]')).toBeHidden()
})

test('keeps full-bleed phone geometry with simulated iOS safe areas', async ({ page }) => {
  await page.setViewportSize({ width: 393, height: 852 })
  await openPreReader(page, '/lab/?autoplay=0')
  await page.evaluate(() => {
    document.documentElement.style.setProperty('--tov5-safe-top', '47px')
    document.documentElement.style.setProperty('--tov5-safe-right', '0px')
    document.documentElement.style.setProperty('--tov5-safe-bottom', '34px')
    document.documentElement.style.setProperty('--tov5-safe-left', '0px')
  })
  const safeGeometry = await page.evaluate(() => {
    const landing = document.querySelector('.tov5-simple-landing').getBoundingClientRect()
    const wordmark = document.querySelector('.tov5-simple-wordmark').getBoundingClientRect()
    const entry = document.querySelector('.tov5-simple-entry').getBoundingClientRect()
    return { landingTop: landing.top, landingBottom: landing.bottom, wordmarkTop: wordmark.top, entryBottomGap: window.innerHeight - entry.bottom }
  })
  expect(safeGeometry.landingTop).toBe(0)
  expect(safeGeometry.landingBottom).toBe(852)
  expect(safeGeometry.wordmarkTop).toBeGreaterThanOrEqual(47)
  expect(safeGeometry.entryBottomGap).toBeGreaterThanOrEqual(52)
  await expectNoDocumentOverflow(page)

  await page.getByRole('button', { name: 'Start reading' }).click()
  const library = await page.locator('.lib').boundingBox()
  expect(library).toMatchObject({ x: 0, y: 0, width: 393 })
  await expectNoDocumentOverflow(page)
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

test('shows the truthful returning-reader recap and resumes the coherent saved tuple', async ({ page }) => {
  await page.evaluate(seedReadingMemory, readingMemorySeed([
    { id: 'meditations-4', bookId: 'meditations', editionKey: 'original-en', chapterNumber: 4, page: 2, totalPages: 8, ageMs: 60_000 },
  ]))
  await openPreReader(page, '/lab/library?autoplay=0')
  const recap = page.locator('[data-reading-memory-recap]')
  await expect(recap).toBeVisible()
  await expect(page.locator('[data-library]')).toHaveAttribute('data-library-mode', 'returning')
  await expect(recap.getByTestId('lab-recap-eyebrow')).toHaveText('Last time you read · Book 4')
  await expect(recap.getByTestId('lab-recap-book')).toHaveText('Meditations')
  await expect(recap.locator('[data-recap-continue]')).toHaveText('Continue reading')
  for (let pass = 0; pass < 3; pass += 1) {
    await recap.locator('[data-recap-continue]').click()
    await expect(page).toHaveURL(/\/lab\/reader$/)
    await expect(page.getByTestId('lab-root')).toHaveAttribute('data-book-id', 'meditations')
    await expect(page.getByTestId('lab-root')).toHaveAttribute('data-chapter', '4')
    if (pass < 2) {
      await page.goBack()
      await waitForPreReader(page)
      await expect(page.locator('[data-reading-memory-recap] [data-recap-continue]')).toBeVisible()
    }
  }
})

test('preserves the exact Lab auth return destination for landing and dark library', async ({ page }) => {
  await openPreReader(page, '/lab/landing')
  await page.locator('.tov5-simple-sign-in').click()
  await expect(page).toHaveURL(/returnTo=%2Flab%2Flanding/)
  await expect(page.getByRole('link', { name: 'Library' })).toHaveAttribute('href', '/lab/landing')

  await openPreReader(page, '/lab/library')
  await page.locator('.lib-hdr [data-lab-auth-link]').click()
  await expect(page).toHaveURL(/returnTo=%2Flab%2Flibrary/)
  await expect(page.getByRole('link', { name: 'Library' })).toHaveAttribute('href', '/lab/library')
})

test('browser Back restores edition, detail and dark-library states without preface', async ({ page }) => {
  await openPreReader(page, '/lab/library')
  await searchLibrary(page, 'Odyssey')
  await page.locator('[data-library-index] [data-catalogue-book="odyssey"]').click()
  await page.getByRole('button', { name: 'Start reading' }).click()
  await expect(page.locator('[data-view-panel="edition"]')).toHaveClass(/is-current/)
  await page.goBack()
  await expect(page.locator('[data-view-panel="book-detail"]')).toHaveClass(/is-current/)
  await page.goBack()
  await expect(page.locator('[data-view-panel="library"]')).toHaveClass(/is-current/)
  await expect(page.locator('[data-view-panel="preface"]')).toBeHidden()
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
    await expect(page.locator('[data-view-panel="library"] .lib')).toBeVisible()
  })
}

for (const viewport of REQUIRED_VIEWPORTS) {
  test(`uses intentional pre-reader geometry without accidental overflow at ${viewport.label}`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height })
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await openPreReader(page, '/lab/?autoplay=0')
    const landingGeometry = await page.evaluate(() => {
      const bodyStyle = getComputedStyle(document.body)
      const shell = document.querySelector('.tov5-shell').getBoundingClientRect()
      const landing = document.querySelector('.tov5-simple-landing').getBoundingClientRect()
      const entry = document.querySelector('.tov5-simple-entry').getBoundingClientRect()
      const copy = document.querySelector('.tov5-simple-hero > p').getBoundingClientRect()
      return {
        bodyPadding: [bodyStyle.paddingTop, bodyStyle.paddingRight, bodyStyle.paddingBottom, bodyStyle.paddingLeft],
        shell: { left: shell.left, top: shell.top, width: shell.width },
        landing: { left: landing.left, top: landing.top, width: landing.width, height: landing.height, radius: getComputedStyle(document.querySelector('.tov5-simple-landing')).borderTopLeftRadius },
        copyBottom: copy.bottom,
        entryTop: entry.top,
      }
    })
    await expectNoDocumentOverflow(page)
    if (viewport.width <= 520) {
      expect(landingGeometry.bodyPadding).toEqual(['0px', '0px', '0px', '0px'])
      expect(landingGeometry.shell.left).toBe(0)
      expect(landingGeometry.shell.top).toBe(0)
      expect(landingGeometry.shell.width).toBe(viewport.width)
      expect(landingGeometry.landing).toMatchObject({ left: 0, top: 0, width: viewport.width, height: viewport.height, radius: '0px' })
      expect(landingGeometry.entryTop - landingGeometry.copyBottom).toBeGreaterThanOrEqual(12)
    }

    await page.getByRole('button', { name: 'Start reading' }).click()
    const geometry = await page.locator('.lib').evaluate(element => {
      const rect = element.getBoundingClientRect()
      const body = element.querySelector('.lib-main')
      return { width: rect.width, left: rect.left, top: rect.top, right: window.innerWidth - rect.right, bodyFits: !body || body.scrollWidth <= body.clientWidth + 1 }
    })
    await expectNoDocumentOverflow(page)
    expect(geometry.bodyFits).toBe(true)
    if (viewport.width === DESKTOP.width) {
      expect(geometry.width).toBeGreaterThanOrEqual(1100)
      expect(geometry.width).toBeGreaterThanOrEqual(1400)
      expect(Math.abs(geometry.left - geometry.right)).toBeLessThanOrEqual(2)
    } else if (viewport.width === TABLET.width) {
      expect(geometry.width).toBeGreaterThanOrEqual(720)
    } else {
      expect(geometry.width).toBe(viewport.width)
      expect(geometry.left).toBe(0)
      expect(geometry.top).toBe(0)
    }

    const labelStyles = await page.locator('[data-library-index] .lib-row-t').evaluateAll(elements => elements.filter(element => (element as HTMLElement).offsetParent !== null).map(element => {
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
    expect(await page.locator('.tov5-edition-surface').evaluate(element => element.scrollWidth <= element.clientWidth + 1)).toBe(true)
    const cardsFit = await page.locator('[data-catalogue-edition],.tov5-both:not([hidden])').evaluateAll(elements => elements.every(element => {
      const rect = element.getBoundingClientRect()
      return rect.left >= 0 && rect.right <= window.innerWidth + 1 && element.scrollWidth <= element.clientWidth + 1
    }))
    expect(cardsFit).toBe(true)
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
    await searchLibrary(page, 'Republic')
    await expect(page.locator('[data-library-index] [data-catalogue-book="the-republic"]')).toHaveCount(1)
    await capture(page, `${label}-03-republic-search`)
    await page.evaluate(() => window.__tinctLabPreReader.selectBook('ulysses'))
    await expect(page.locator('[data-view-panel="book-detail"]')).toHaveClass(/is-current/)
    await capture(page, `${label}-04-book-detail`)
    await page.getByRole('button', { name: 'Start reading' }).click()
    await expect(page.locator('[data-catalogue-edition]')).toHaveCount(2)
    await expect(page.locator('[data-select-edition="modern-da"]')).toHaveCount(0)
    await capture(page, `${label}-05-edition-picker`)
    await page.locator('.tov5-both[data-edition-choice]').click()
    await expect(page.locator('.tov5-both[data-edition-choice]')).toHaveAttribute('aria-pressed', 'true')
    await expect(page.locator('[data-edition-sample]')).toHaveAttribute('aria-busy', 'false')
    await expect(page.locator('[data-edition-sample-text]')).toHaveCount(2)
    await capture(page, `${label}-06-both-selected`)
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
      openBook: (bookId: string) => Promise<boolean>
      libraryState: () => { mode: 'new' | 'returning'; shelfIndex: number; shelf: string[]; query: string; expandedHouseId: string | null }
      selectionState: () => { primaryEditionKey: string | null; compareEditionKey: string | null; revision: number }
      renderEditionsForTest: (book: Record<string, any>) => void
    }
  }
}
