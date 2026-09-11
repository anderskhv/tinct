import { expect, test, type Browser, type BrowserContext, type Page } from '@playwright/test'

type ReaderHandoff = {
  kind: 'open-reader'
  bookId: string
  primaryEditionKey: string
  compareEditionKey?: string
  savedPlace?: { bookId: string; chapterNumber: number; page?: number; paragraphIndex?: number }
}

const OLD_BIBLE_POSITION = {
  books: {
    hebrews: {
      bookId: 'hebrews', headerBook: 'Hebrews', chapterNumber: 6, sequentialChapter: 1139,
      paragraphIndex: 1, wordIndex: 3, updatedAt: 1_000, deviceId: 'old-bible', rev: 1,
    },
  },
  lastSettledBookId: 'hebrews', lastSettledAt: 1_000, updatedAt: 1_000, deviceId: 'old-bible',
}

async function mobileReader(browser: Browser): Promise<{ context: BrowserContext; page: Page }> {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148',
  })
  return { context, page: await context.newPage() }
}

async function openFromHandoff(page: Page, handoff: ReaderHandoff): Promise<void> {
  await page.addInitScript(({ next, oldPosition }) => {
    if (sessionStorage.getItem('tinct:test-reader-reload-seeded') === 'true') return
    localStorage.setItem('tinct-lab-position', JSON.stringify(oldPosition))
    localStorage.removeItem('tinct-lab-prefs')
    sessionStorage.setItem('tinct:lab-reader-handoff', JSON.stringify(next))
    sessionStorage.setItem('tinct:test-reader-reload-seeded', 'true')
  }, { next: handoff, oldPosition: OLD_BIBLE_POSITION })
  await page.goto('/lab/reader', { waitUntil: 'networkidle' })
  await expect(page.getByTestId('lab-root')).toHaveAttribute('data-book-id', handoff.bookId)
  if (!handoff.savedPlace) {
    await expect(page.getByTestId('lab-chapter-cover')).toBeVisible()
    await expect(page.getByTestId('lab-chapter-cover')).toContainText(
      handoff.bookId === 'bible' ? 'The Bible' : handoff.bookId === 'odyssey' ? 'The Odyssey' : 'Meditations',
    )
    await expect(page.getByTestId('lab-root')).toHaveAttribute('data-reader-ready', 'true')
    const coverBox = await page.getByTestId('lab-chapter-cover').boundingBox()
    if (!coverBox) throw new Error('Frontispiece has no visible bounds')
    await page.touchscreen.tap(coverBox.x + coverBox.width - 12, coverBox.y + coverBox.height / 2)
    await expect(page.getByTestId('lab-root')).toHaveAttribute('data-cover-page', 'false')
  }
  await expect.poll(() => page.getByTestId('lab-book').innerText()).not.toBe('')
  await expect.poll(() => page.evaluate(() => sessionStorage.getItem('tinct:lab-reader-handoff'))).toBeNull()
  await page.waitForTimeout(900)
}

async function touchBookEdge(page: Page, edge: 'left' | 'right'): Promise<void> {
  const box = await page.getByTestId('lab-book').boundingBox()
  if (!box) throw new Error('Reading surface has no visible bounds')
  await page.touchscreen.tap(edge === 'left' ? box.x + 12 : box.x + box.width - 12, box.y + box.height / 2)
}

test('restores Meditations Book 4 and its Long edition after reload', async ({ browser }) => {
  const { context, page } = await mobileReader(browser)
  await openFromHandoff(page, {
    kind: 'open-reader', bookId: 'meditations', primaryEditionKey: 'original-en',
  })

  await page.getByTestId('lab-header-chapter').tap()
  await page.getByTestId('lab-tree-chapter-4').tap()
  const root = page.getByTestId('lab-root')
  await expect(root).toHaveAttribute('data-chapter', '4')
  await expect(page.getByTestId('lab-header-work')).toHaveText('Meditations')
  await expect(page.getByTestId('lab-header-chapter')).toContainText('Book 4')
  await expect(page.locator('.lab-passage').first()).toContainText(/inward mistress part of man/i)

  await page.reload({ waitUntil: 'networkidle' })
  await expect(root).toHaveAttribute('data-book-id', 'meditations')
  await expect(root).toHaveAttribute('data-chapter', '4')
  await expect(root).toHaveAttribute('data-reader-edition', 'original-en')
  await expect(root).toHaveAttribute('data-compare-active', 'false')
  await expect(page.getByTestId('lab-header-work')).toHaveText('Meditations')
  await expect(page.getByTestId('lab-header-chapter')).toContainText('Book 4')
  await expect(page.locator('.lab-passage').first()).toContainText(/inward mistress part of man/i)
  await context.close()
})

test('restores an Odyssey Compare tuple at the same reading anchor', async ({ browser }) => {
  const { context, page } = await mobileReader(browser)
  await openFromHandoff(page, {
    kind: 'open-reader', bookId: 'odyssey', primaryEditionKey: 'original-en', compareEditionKey: 'modern-en',
  })

  const root = page.getByTestId('lab-root')
  const openingPlace = await root.getAttribute('data-place')
  await touchBookEdge(page, 'right')
  await expect.poll(() => root.getAttribute('data-place')).not.toBe(openingPlace)
  const primaryPlace = await root.getAttribute('data-place')
  const bookBox = await page.getByTestId('lab-book').boundingBox()
  if (!bookBox) throw new Error('Reading surface has no visible bounds')
  await page.touchscreen.tap(bookBox.x + bookBox.width / 2, bookBox.y + bookBox.height / 2)
  await page.getByTestId('lab-phone-compare').tap()
  await expect(root).toHaveAttribute('data-reader-edition', 'modern-en')
  await expect(root).toHaveAttribute('data-compare-active', 'true')
  await expect(root).toHaveAttribute('data-place', primaryPlace || '')
  const compareText = await page.locator('.lab-passage').first().innerText()
  expect(compareText.trim().length).toBeGreaterThan(80)
  await expect.poll(() => page.evaluate(() => {
    const state = JSON.parse(localStorage.getItem('tinct-lab-position') || '{}')
    return state.books?.odyssey?.readerMode
  })).toBe('compare')

  await page.reload({ waitUntil: 'networkidle' })
  await expect(root).toHaveAttribute('data-book-id', 'odyssey')
  await expect(root).toHaveAttribute('data-reader-edition', 'modern-en')
  await expect(root).toHaveAttribute('data-compare-active', 'true')
  await expect(root).toHaveAttribute('data-place', primaryPlace || '')
  await expect(page.locator('.lab-passage').first()).toContainText(compareText.slice(0, 30))
  await context.close()
})

test('keeps a coherent Bible tuple after rapid forward/back navigation and reload', async ({ browser }) => {
  const { context, page } = await mobileReader(browser)
  await openFromHandoff(page, {
    kind: 'open-reader', bookId: 'bible', primaryEditionKey: 'kjv-en',
  })

  const root = page.getByTestId('lab-root')
  await touchBookEdge(page, 'right')
  await touchBookEdge(page, 'right')
  await touchBookEdge(page, 'left')
  await touchBookEdge(page, 'right')
  await expect.poll(() => root.getAttribute('data-place')).not.toBe('0:0')
  const settled = {
    bookId: await root.getAttribute('data-book-id'),
    chapter: await root.getAttribute('data-chapter'),
    place: await root.getAttribute('data-place'),
    edition: await root.getAttribute('data-reader-edition'),
  }
  await expect.poll(() => page.evaluate(() => {
    const state = JSON.parse(localStorage.getItem('tinct-lab-position') || '{}')
    return state.books?.genesis?.wordIndex
  })).toBe(Number(settled.place?.split(':')[1]))

  await page.reload({ waitUntil: 'networkidle' })
  await expect(root).toHaveAttribute('data-book-id', settled.bookId || '')
  await expect(root).toHaveAttribute('data-chapter', settled.chapter || '')
  await expect(root).toHaveAttribute('data-place', settled.place || '')
  await expect(root).toHaveAttribute('data-reader-edition', settled.edition || '')
  await expect(page.getByTestId('lab-header-work')).toHaveText('The Bible')
  await expect.poll(() => page.locator('.lab-passage').first().innerText()).not.toBe('')
  await context.close()
})
