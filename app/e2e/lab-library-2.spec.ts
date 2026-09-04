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

async function geometry(page: Page) {
  return page.evaluate(() => ({
    viewport: innerWidth,
    documentClient: document.documentElement.clientWidth,
    documentScroll: document.documentElement.scrollWidth,
    bodyClient: document.body.clientWidth,
    bodyScroll: document.body.scrollWidth,
    shell: (() => {
      const box = document.querySelector('#tinct-library-2')!.getBoundingClientRect()
      return { left: box.left, right: box.right, width: box.width, radius: getComputedStyle(document.querySelector('#tinct-library-2')!).borderRadius }
    })(),
  }))
}

async function expectNoOverflow(page: Page) {
  const value = await geometry(page)
  expect(value.documentScroll).toBe(value.documentClient)
  expect(value.bodyScroll).toBe(value.bodyClient)
  expect(value.shell.left).toBe(0)
  expect(value.shell.right).toBe(value.documentClient)
  expect(value.shell.radius).toBe('0px')
  return value
}

async function capture(page: Page, name: string, evidence: unknown = {}) {
  const directory = process.env.LAB2_SCREENSHOT_DIR
  if (!directory) return
  await mkdir(directory, { recursive: true })
  await page.screenshot({ path: `${directory}/${name}.png`, fullPage: false })
  await writeFile(`${directory}/${name}-evidence.json`, `${JSON.stringify(evidence, null, 2)}\n`, 'utf8')
}

async function seedPositions(page: Page) {
  await page.addInitScript(() => {
    const base = 1_788_489_600_000
    localStorage.setItem('tinct:tinct-current-book', JSON.stringify('frankenstein'))
    localStorage.setItem('tinct:library', JSON.stringify(['frankenstein', 'odyssey', 'bible']))
    localStorage.setItem('tinct:position:frankenstein', JSON.stringify({ bookId: 'frankenstein', chapterNumber: 3, currentPage: 1, totalPages: 5, scrollFraction: .24, lastParagraphIndex: 2, updatedAt: base }))
    localStorage.setItem('tinct:position:odyssey', JSON.stringify({ bookId: 'odyssey', chapterNumber: 9, currentPage: 3, totalPages: 9, scrollFraction: .36, lastParagraphIndex: 4, updatedAt: base - 10_000 }))
    localStorage.setItem('tinct:position:bible', JSON.stringify({ bookId: 'bible', chapterNumber: 1, currentPage: 1, totalPages: 2, scrollFraction: .1, lastParagraphIndex: 1, updatedAt: base - 20_000 }))
    localStorage.setItem('tinct:progress:bible', JSON.stringify({ bookId: 'bible', highestCompletedChapter: 0, totalChapters: 1189, percent: 72, positionPercent: 72 }))
  })
}

function fakeJwt(payload: object) {
  const encode = (value: object) => Buffer.from(JSON.stringify(value)).toString('base64url')
  return `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode(payload)}.signature`
}

for (const viewport of VIEWPORTS) {
  test(`catalogue is full-bleed, compact and taxonomy-backed at ${viewport.label}`, async ({ page }) => {
    const consoleErrors: string[] = []
    const failedRequests: string[] = []
    page.on('console', message => { if (message.type() === 'error') consoleErrors.push(message.text()) })
    page.on('requestfailed', request => failedRequests.push(`${request.method()} ${request.url()} ${request.failure()?.errorText || ''}`))
    await page.setViewportSize(viewport)
    await openLibrary(page)
    await expect(page.getByRole('heading', { name: 'Tinct Library' })).toBeVisible()
    await expect(page.getByRole('searchbox', { name: 'Search the catalogue' })).toBeHidden()
    const ids = await page.locator('[data-library-houses] [data-book-id]').evaluateAll(elements => elements.map(element => element.getAttribute('data-book-id')))
    expect(new Set(ids).size).toBe(100)
    expect(await page.locator('[data-house-id]').count()).toBeGreaterThan(1)
    expect(await page.locator('[data-shelf-id]').count()).toBeGreaterThan(5)
    const firstCardWidth = await page.locator('[data-library-houses] .l2-book').first().evaluate(element => element.getBoundingClientRect().width)
    expect(firstCardWidth).toBeLessThan(190)
    const value = await expectNoOverflow(page)
    expect(consoleErrors).toEqual([])
    expect(failedRequests).toEqual([])
    await capture(page, `library-2-${viewport.label}`, { geometry: value, consoleErrors, failedRequests, publishedIds: new Set(ids).size })
  })
}

test('compact search opens, closes, ranks exact titles and keeps results unique', async ({ page }) => {
  await openLibrary(page)
  const trigger = page.getByRole('button', { name: 'Search library' })
  const search = page.getByRole('searchbox', { name: 'Search the catalogue' })
  for (let pass = 0; pass < 3; pass += 1) {
    await trigger.click()
    await expect(trigger).toHaveAttribute('aria-expanded', 'true')
    await expect(search).toBeFocused()
    await search.fill('Republic')
    await expect(page.locator('[data-results-grid] [data-book-id]')).toHaveCount(1)
    await expect(page.locator('[data-results-grid] [data-book-id]')).toHaveAttribute('data-book-id', 'the-republic')
    await search.fill('Jane Austen')
    const authors = await page.locator('[data-results-grid] .l2-book-author').allTextContents()
    expect(authors.length).toBeGreaterThan(0)
    expect(new Set(authors)).toEqual(new Set(['Jane Austen']))
    await search.fill('not-a-book-or-author')
    await expect(page.getByRole('heading', { name: 'No books found' })).toBeVisible()
    await page.getByRole('button', { name: 'Close search' }).click()
    await expect(search).toBeHidden()
    await expect(page.getByRole('heading', { name: 'Tinct Library' })).toBeVisible()
  }
})

test('Continue Reading is a horizontal rail with factual recaps and whole-book progress', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await seedPositions(page)
  await openLibrary(page)
  const rail = page.locator('[data-rail=continue]')
  await expect(rail.locator('[data-resume-book]')).toHaveCount(3)
  const display = await rail.evaluate(element => ({ display: getComputedStyle(element).display, scrollWidth: element.scrollWidth, clientWidth: element.clientWidth }))
  expect(display.display).toBe('flex')
  expect(display.scrollWidth).toBeGreaterThan(display.clientWidth)
  await expect(page.locator('[data-progress-scope]')).toHaveText('Saved on this device')
  await expect(page.locator('[data-resume-book=bible] .l2-recap')).toHaveText('Last time · You left off in Genesis 1.')
  await expect(page.locator('[data-resume-book=bible] .l2-resume-action')).toContainText('<1% read')
  const bibleProgress = Number(await page.locator('[data-resume-book=bible] [role=progressbar]').getAttribute('aria-valuenow'))
  expect(bibleProgress).toBeGreaterThan(0)
  expect(bibleProgress).toBeLessThan(1)
  for (let pass = 0; pass < 3; pass += 1) {
    await rail.evaluate(element => { element.scrollLeft = 0 })
    await rail.focus()
    await rail.press('ArrowRight')
    await expect.poll(() => rail.evaluate(element => element.scrollLeft)).toBeGreaterThan(0)
  }
  await expect(page.locator('[data-account-invite]')).toBeVisible()
  await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur())
  await capture(page, 'library-2-phone-returning', { bibleProgress, rail: display })
})

test('signed-out second-book invitation remains modest, dismissible and routes to real account creation', async ({ page }) => {
  await seedPositions(page)
  await openLibrary(page)
  for (let pass = 0; pass < 3; pass += 1) {
    await expect(page.locator('[data-account-invite]')).toBeVisible()
    if (pass < 2) {
      await page.getByRole('button', { name: 'Keep reading here' }).click()
      await expect(page.locator('[data-account-invite]')).toBeHidden()
      await page.evaluate(() => localStorage.removeItem('tinct:lab-library2-invite-dismissed'))
      await page.evaluate(() => window.__tinctLibrary2?.refresh())
    }
  }
  await page.getByRole('button', { name: 'Save and sync' }).click()
  await expect(page).toHaveURL(/\/lab\/sign-in\?mode=create/)
  await expect(page.getByRole('heading', { name: 'Create a free account' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Library' })).toHaveAttribute('href', '/lab/library-2')
})

test('a genuine Supabase session presents Account and truthful synced scope', async ({ page }) => {
  const accessToken = fakeJwt({ sub: 'user-1', email: 'reader@example.com', role: 'authenticated', aud: 'authenticated', exp: Math.floor(Date.now() / 1000) + 3600 })
  await page.addInitScript(({ token }) => {
    localStorage.setItem('sb-yazjyiqsxjystvpkyouk-auth-token', JSON.stringify({
      access_token: token, refresh_token: 'refresh-token', token_type: 'bearer', expires_in: 3600,
      expires_at: Math.floor(Date.now() / 1000) + 3600,
      user: { id: 'user-1', aud: 'authenticated', role: 'authenticated', email: 'reader@example.com', app_metadata: {}, user_metadata: {}, created_at: new Date().toISOString() },
    }))
    localStorage.setItem('tinct:position:odyssey', JSON.stringify({ bookId: 'odyssey', chapterNumber: 4, currentPage: 2, totalPages: 8, updatedAt: Date.now() }))
  }, { token: accessToken })
  await openLibrary(page)
  await expect(page.locator('[data-lab-auth-link]')).toHaveAttribute('data-auth-ready', 'true')
  await expect(page.locator('[data-lab-auth-link]')).toHaveText('Account')
  await expect(page.locator('[data-progress-scope]')).toHaveText('Synced to your account')
  await expect(page.locator('[data-account-invite]')).toBeHidden()
  await page.locator('[data-lab-auth-link]').click()
  await expect(page).toHaveURL(/\/lab\/sign-in\?mode=account/)
  await expect(page.getByRole('heading', { name: 'Your reading is in sync' })).toBeVisible()
  await expect(page.locator('[data-account-email]')).toHaveText('reader@example.com')
})

test('resume preserves the complete existing reader handoff tuple', async ({ page }) => {
  await page.addInitScript(() => {
    const updatedAt = 1_788_489_600_000
    localStorage.setItem('tinct:position:odyssey', JSON.stringify({ bookId: 'odyssey', chapterNumber: 4, currentPage: 2, totalPages: 8, scrollFraction: .31, lastParagraphIndex: 17, updatedAt }))
    localStorage.setItem('tinct:tinct-current-book', JSON.stringify('odyssey'))
  })
  await openLibrary(page)
  expect(await page.evaluate(() => window.__tinctLibrary2?.buildResumeIntent())).toEqual({
    kind: 'open-reader', bookId: 'odyssey', primaryEditionKey: 'original-en',
    savedPlace: { bookId: 'odyssey', chapterNumber: 4, page: 2, paragraphIndex: 17 },
  })
  await page.locator('[data-resume-book=odyssey]').click()
  await expect(page).toHaveURL(/\/lab\/reader$/)
  await expect(page.getByTestId('lab-root')).toHaveAttribute('data-book-id', 'odyssey')
  await expect(page.getByTestId('lab-root')).toHaveAttribute('data-chapter', '4')
  await expect(page.getByTestId('lab-root')).toHaveAttribute('data-reader-edition', 'original-en')
  await expect(page.getByTestId('lab-root')).toHaveAttribute('data-place', /^17:/)
})

test('finished books come only from real completion state', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('tinct:book-completed:hamlet', JSON.stringify({ completedAt: Date.now() })))
  await openLibrary(page)
  await expect(page.getByRole('heading', { name: 'Finished Books' })).toBeVisible()
  await expect(page.locator('[data-finished-grid] [data-book-id]')).toHaveCount(1)
  await expect(page.locator('[data-finished-grid] [data-book-id]')).toHaveAttribute('data-book-id', 'hamlet')
})

test('landing and Library 2 sign-in controls use the Lab auth route and return destination', async ({ page }) => {
  await page.goto('/lab')
  await expect(page.locator('.tov5-simple-sign-in')).toHaveAttribute('href', '/lab/sign-in?returnTo=%2Flab%2Flibrary-2')
  await page.locator('.tov5-simple-sign-in').click()
  await expect(page).toHaveURL(/\/lab\/sign-in\?returnTo=%2Flab%2Flibrary-2/)
  await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible()
  await page.getByRole('button', { name: 'Create one free' }).click()
  await expect(page.getByRole('heading', { name: 'Create a free account' })).toBeVisible()
  await page.getByRole('button', { name: 'I already have an account' }).click()
  await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible()
  await page.getByRole('button', { name: 'Forgot password?' }).click()
  await expect(page.getByRole('heading', { name: 'Reset your password' })).toBeVisible()
})

test('catalogue cards remain keyboard accessible and Back returns to Library 2', async ({ page }) => {
  await openLibrary(page)
  const card = page.locator('[data-library-houses] [data-book-id=meditations]').first()
  await card.focus()
  await expect(card).toBeFocused()
  await card.press('Enter')
  await page.waitForFunction(() => window.__tinctLabPreReader?.ready === true)
  await expect(page.locator('[data-book-detail-title]')).toHaveText('Meditations')
  await page.goBack()
  await page.waitForFunction(() => window.__tinctLibrary2?.ready === true)
  await expect(page).toHaveURL(/\/lab\/library-2\/?$/)
  await expectNoOverflow(page)
})

declare global {
  interface Window {
    __tinctLibrary2?: {
      ready: boolean
      buildResumeIntent: () => unknown
      refresh: () => void
    }
    __tinctLabPreReader?: { ready: boolean }
  }
}
