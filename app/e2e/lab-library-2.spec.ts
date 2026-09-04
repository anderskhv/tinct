import { expect, test, type Page } from '@playwright/test'
import { mkdir, writeFile } from 'node:fs/promises'

const VIEWPORTS = [
  { label: 'small-phone', width: 320, height: 568 },
  { label: 'iphone-se', width: 375, height: 667 },
  { label: 'phone', width: 390, height: 844 },
  { label: 'iphone-15', width: 393, height: 852 },
  { label: 'large-phone', width: 430, height: 932 },
  { label: 'tablet', width: 768, height: 1024 },
  { label: 'desktop', width: 1440, height: 900 },
]

async function openLibrary(page: Page) {
  await page.goto('/lab/library-2')
  await page.waitForFunction(() => window.__tinctLibrary2?.ready === true)
}

async function expectNoOverflow(page: Page) {
  const geometry = await page.evaluate(() => {
    const root = document.querySelector('#tinct-library-2')!
    const body = document.body.getBoundingClientRect()
    const shell = root.getBoundingClientRect()
    return {
      viewport: window.innerWidth,
      documentClient: document.documentElement.clientWidth,
      documentScroll: document.documentElement.scrollWidth,
      bodyClient: document.body.clientWidth,
      bodyScroll: document.body.scrollWidth,
      bodyLeft: body.left,
      bodyRight: body.right,
      bodyWidth: body.width,
      shellClient: root.clientWidth,
      shellScroll: root.scrollWidth,
      shellLeft: shell.left,
      shellRight: shell.right,
      shellWidth: shell.width,
      shellRadius: getComputedStyle(root).borderTopLeftRadius,
    }
  })
  expect(geometry.documentScroll).toBe(geometry.documentClient)
  expect(geometry.bodyScroll).toBe(geometry.bodyClient)
  expect(geometry.bodyClient).toBe(geometry.documentClient)
  expect(geometry.shellScroll).toBe(geometry.shellClient)
  expect(geometry.shellClient).toBe(geometry.documentClient)
  expect(geometry.bodyLeft).toBe(0)
  expect(geometry.bodyRight).toBe(geometry.documentClient)
  expect(geometry.bodyWidth).toBeCloseTo(geometry.bodyClient, 0)
  expect(geometry.shellLeft).toBe(0)
  expect(geometry.shellRight).toBe(geometry.documentClient)
  expect(geometry.shellWidth).toBeCloseTo(geometry.shellClient, 0)
  expect(geometry.shellRadius).toBe('0px')
  return geometry
}

async function capture(page: Page, name: string) {
  const directory = process.env.LAB2_SCREENSHOT_DIR
  if (!directory) return
  await mkdir(directory, { recursive: true })
  await page.screenshot({ path: `${directory}/${name}.png`, fullPage: false })
}

async function captureGeometry(name: string, geometry: Awaited<ReturnType<typeof expectNoOverflow>>) {
  const directory = process.env.LAB2_SCREENSHOT_DIR
  if (!directory) return
  await mkdir(directory, { recursive: true })
  await writeFile(`${directory}/${name}-geometry.json`, `${JSON.stringify(geometry, null, 2)}\n`, 'utf8')
}

for (const viewport of VIEWPORTS) {
  test(`is full-bleed and intentionally responsive at ${viewport.label}`, async ({ page }) => {
    await page.setViewportSize(viewport)
    await openLibrary(page)
    await expect(page.getByRole('heading', { name: 'Your library is waiting.' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Continue Reading' })).toHaveCount(0)
    await expect(page.locator('.l2-personal')).toBeHidden()
    await expect(page.getByRole('heading', { name: 'Explore catalogue' })).toBeVisible()
    await expect(page.locator('[data-explore-grid] [data-book-id]')).toHaveCount(100)
    const ids = await page.locator('[data-explore-grid] [data-book-id]').evaluateAll(elements => elements.map(element => element.getAttribute('data-book-id')))
    expect(new Set(ids).size).toBe(ids.length)
    const geometry = await expectNoOverflow(page)
    await captureGeometry(`library-2-new-${viewport.label}`, geometry)
    await capture(page, `library-2-new-${viewport.label}`)
  })
}

test('search is unique, title-first, author-aware, clearable, and reload-safe', async ({ page }) => {
  await openLibrary(page)
  const search = page.getByRole('searchbox', { name: 'Search the catalogue' })

  for (let pass = 0; pass < 3; pass += 1) {
    await search.fill('Republic')
    const results = page.locator('[data-explore-grid] [data-book-id]')
    await expect(results).toHaveCount(1)
    await expect(results).toHaveAttribute('data-book-id', 'the-republic')
    await search.fill('Jane Austen')
    expect(await results.count()).toBeGreaterThan(0)
    expect(new Set(await results.locator('.l2-book-author').allTextContents())).toEqual(new Set(['Jane Austen']))
    await search.fill('not-a-book-or-author')
    await expect(page.getByRole('heading', { name: 'No books found' })).toBeVisible()
    await page.getByRole('button', { name: 'Clear search' }).last().click()
    await expect(results).toHaveCount(100)
  }

  await page.reload()
  await page.waitForFunction(() => window.__tinctLibrary2?.ready === true)
  await expect(page).toHaveURL(/\/lab\/library-2\/?$/)
  await expect(page.locator('[data-explore-grid] [data-book-id]')).toHaveCount(100)
})

test('three catalogue cards open the correct real pre-reader detail and browser Back returns to Library 2', async ({ page }) => {
  for (const [bookId, title] of [['odyssey', 'The Odyssey'], ['meditations', 'Meditations'], ['bible', 'The Bible']] as const) {
    await openLibrary(page)
    const card = page.locator(`[data-explore-grid] [data-book-id="${bookId}"]`)
    await card.focus()
    await expect(card).toBeFocused()
    await card.press('Enter')
    await page.waitForFunction(() => window.__tinctLabPreReader?.ready === true)
    await expect(page.locator('[data-book-detail-title]')).toHaveText(title)
    await expect(page).toHaveURL(new RegExp(`book=${bookId}.*view=book-detail.*from=library-2`))
    await page.goBack()
    await page.waitForFunction(() => window.__tinctLibrary2?.ready === true)
    await expect(page).toHaveURL(/\/lab\/library-2\/?$/)
  }
})

test('the detail Library control returns to Library 2 when that is the source', async ({ page }) => {
  await openLibrary(page)
  await page.locator('[data-explore-grid] [data-book-id="odyssey"]').click()
  await page.waitForFunction(() => window.__tinctLabPreReader?.ready === true)
  await page.locator('[data-view-panel="book-detail"]').getByRole('button', { name: 'Library' }).click()
  await page.waitForFunction(() => window.__tinctLibrary2?.ready === true)
  await expect(page).toHaveURL(/\/lab\/library-2\/?$/)
})

test('real saved state builds an exact resume handoff and continues into the Lab reader', async ({ page }) => {
  await page.addInitScript(() => {
    const updatedAt = 1_788_489_600_000
    localStorage.setItem('tinct:library', JSON.stringify(['odyssey', 'hamlet']))
    localStorage.setItem('tinct:tinct-current-book', JSON.stringify('odyssey'))
    localStorage.setItem('tinct:position:odyssey', JSON.stringify({
      bookId: 'odyssey', chapterNumber: 4, currentPage: 2, totalPages: 8, scrollFraction: .31, lastParagraphIndex: 17, updatedAt,
    }))
    localStorage.setItem('tinct:progress:odyssey', JSON.stringify({
      bookId: 'odyssey', highestCompletedChapter: 3, totalChapters: 24, percent: 12.5, positionPercent: 15,
    }))
  })
  await openLibrary(page)
  await expect(page.getByRole('heading', { name: 'Continue Reading' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Your Library' })).toBeVisible()
  await expect(page.locator('[data-personal-grid] [data-book-id]')).toHaveCount(2)
  await expect(page.locator('.l2-resume-place').first()).toHaveText('Chapter 4 · Page 3')
  await expect(page.locator('.l2-resume-action').first()).toContainText('15%')

  const intent = await page.evaluate(() => window.__tinctLibrary2?.buildResumeIntent())
  expect(intent).toEqual({
    kind: 'open-reader',
    bookId: 'odyssey',
    primaryEditionKey: 'original-en',
    savedPlace: { bookId: 'odyssey', chapterNumber: 4, page: 2, paragraphIndex: 17 },
  })
  const resume = page.locator('[data-resume-book]').first()
  await resume.focus()
  await expect(resume).toBeFocused()
  await resume.press('Enter')
  await expect(page).toHaveURL(/\/lab\/reader$/)
  await expect(page.getByTestId('lab-root')).toHaveAttribute('data-book-id', 'odyssey')
  await expect(page.getByTestId('lab-root')).toHaveAttribute('data-chapter', '4')
  await expect(page.getByTestId('lab-root')).toHaveAttribute('data-reader-edition', 'original-en')
  await expect(page.getByTestId('lab-root')).toHaveAttribute('data-place', /^17:/)
})

test('the Lab reader tuple wins and preserves book, edition, compare, chapter, page and paragraph', async ({ page }) => {
  await page.addInitScript(() => {
    const updatedAt = 1_788_489_600_000
    const meditations = {
      bookId: 'meditations', headerBook: 'Meditations', chapterNumber: 7, sequentialChapter: 7,
      paragraphIndex: 11, wordIndex: 3, pageIndex: 2, primaryEditionKey: 'modern-en',
      compareEditionKey: 'original-en', readerMode: 'compare', updatedAt, deviceId: 'library-2-qa', rev: 4,
    }
    localStorage.setItem('tinct-lab-position', JSON.stringify({
      books: { meditations }, lastSettledBookId: 'meditations', lastSettledAt: updatedAt, updatedAt, deviceId: 'library-2-qa',
    }))
  })
  await openLibrary(page)
  const intent = await page.evaluate(() => window.__tinctLibrary2?.buildResumeIntent())
  expect(intent).toEqual({
    kind: 'open-reader', bookId: 'meditations', primaryEditionKey: 'modern-en', compareEditionKey: 'original-en',
    savedPlace: { bookId: 'meditations', chapterNumber: 7, page: 2, paragraphIndex: 11 },
  })
  await page.locator('[data-resume-book]').click()
  await expect(page).toHaveURL(/\/lab\/reader$/)
  await expect(page.getByTestId('lab-root')).toHaveAttribute('data-book-id', 'meditations')
  await expect(page.getByTestId('lab-root')).toHaveAttribute('data-chapter', '7')
  await expect(page.getByTestId('lab-root')).toHaveAttribute('data-reader-edition', 'modern-en')
  await expect(page.getByTestId('lab-root')).toHaveAttribute('data-compare-active', 'true')
  await expect(page.getByTestId('lab-root')).toHaveAttribute('data-place', /^11:/)
})

test('a Bible-native Lab place resumes its exact biblical location', async ({ page }) => {
  await page.addInitScript(() => {
    const updatedAt = 1_788_489_600_000
    const genesis = {
      bookId: 'genesis', headerBook: 'Genesis', chapterNumber: 7, sequentialChapter: 7,
      paragraphIndex: 5, wordIndex: 2, pageIndex: 1, primaryEditionKey: 'kjv-en',
      readerMode: 'read', updatedAt, deviceId: 'library-2-bible-qa', rev: 2,
    }
    localStorage.setItem('tinct-lab-position', JSON.stringify({
      books: { genesis }, lastSettledBookId: 'genesis', lastSettledAt: updatedAt, updatedAt, deviceId: 'library-2-bible-qa',
    }))
  })
  await openLibrary(page)
  expect(await page.evaluate(() => window.__tinctLibrary2?.buildResumeIntent())).toEqual({
    kind: 'open-reader', bookId: 'bible', primaryEditionKey: 'kjv-en',
    savedPlace: { bookId: 'bible', chapterNumber: 7, page: 1, paragraphIndex: 5 },
  })
  await page.locator('[data-resume-book]').click()
  await expect(page).toHaveURL(/\/lab\/reader$/)
  await expect(page.getByTestId('lab-root')).toHaveAttribute('data-book-id', 'bible')
  await expect(page.getByTestId('lab-root')).toHaveAttribute('data-biblical-book', 'genesis')
  await expect(page.getByTestId('lab-root')).toHaveAttribute('data-chapter', '7')
  await expect(page.getByTestId('lab-root')).toHaveAttribute('data-place', /^5:/)
})

test('a known library with no active location stays in Library 2 without a mock resume', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('tinct:library', JSON.stringify(['hamlet', 'frankenstein']))
    localStorage.setItem('tinct:tinct-current-book', JSON.stringify('hamlet'))
    localStorage.setItem('tinct:book-completed:hamlet', JSON.stringify({ completedAt: 1_788_489_600_000 }))
  })
  await openLibrary(page)
  await expect(page).toHaveURL(/\/lab\/library-2\/?$/)
  await expect(page.locator('.l2-continue')).toBeHidden()
  await expect(page.locator('[data-personal-grid] [data-book-id="hamlet"]')).toBeVisible()
  await expect(page.locator('[data-personal-grid] [data-book-id="hamlet"] .l2-status')).toHaveText(/^Finished · /)
  await expect(page.locator('[data-personal-grid] [data-book-id="frankenstein"] .l2-status')).toHaveText('Saved')
})

for (const viewport of [VIEWPORTS[0], VIEWPORTS[2], VIEWPORTS[6]]) {
  test(`resume, search, card selection and reload remain stable at ${viewport.label}`, async ({ page }) => {
    await page.setViewportSize(viewport)
    await page.addInitScript(() => {
      localStorage.setItem('tinct:tinct-current-book', JSON.stringify('frankenstein'))
      localStorage.setItem('tinct:library', JSON.stringify(['frankenstein', 'odyssey', 'bible']))
      localStorage.setItem('tinct:position:frankenstein', JSON.stringify({
        bookId: 'frankenstein', chapterNumber: 3, currentPage: 1, totalPages: 5, scrollFraction: .24, updatedAt: 1_788_489_600_000,
      }))
      localStorage.setItem('tinct:position:odyssey', JSON.stringify({
        bookId: 'odyssey', chapterNumber: 9, currentPage: 3, totalPages: 9, scrollFraction: .36, updatedAt: 1_788_489_590_000,
      }))
      localStorage.setItem('tinct:position:bible', JSON.stringify({
        bookId: 'bible', chapterNumber: 7, currentPage: 0, totalPages: 4, scrollFraction: .08, updatedAt: 1_788_489_580_000,
      }))
    })
    await openLibrary(page)
    await expect(page.locator('[data-resume-title]').first()).toHaveText('Frankenstein')
    await expect(page.locator('[data-continue-grid] [data-resume-book]')).toHaveCount(3)
    const search = page.getByRole('searchbox', { name: 'Search the catalogue' })
    for (const query of ['Frankenstein', 'Mary Shelley', 'Frankenstein']) {
      await search.fill(query)
      await expect(page.locator('[data-explore-grid] [data-book-id="frankenstein"]')).toHaveCount(1)
    }
    await page.locator('[data-explore-grid] [data-book-id="frankenstein"]').click()
    await page.waitForFunction(() => window.__tinctLabPreReader?.ready === true)
    await page.goBack()
    await page.waitForFunction(() => window.__tinctLibrary2?.ready === true)
    await page.reload()
    await page.waitForFunction(() => window.__tinctLibrary2?.ready === true)
    await expect(page.locator('[data-resume-title]').first()).toHaveText('Frankenstein')
    await expectNoOverflow(page)
    await capture(page, `library-2-returning-${viewport.label}`)
  })
}

declare global {
  interface Window {
    __tinctLibrary2?: {
      ready: boolean
      visibleBooks: () => Array<{ id: string }>
      buildResumeIntent: () => unknown
    }
    __tinctLabPreReader?: { ready: boolean }
  }
}
