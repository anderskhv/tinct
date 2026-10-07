import { expect, test, type Page } from '@playwright/test'
import { mkdirSync } from 'node:fs'
import { join } from 'node:path'

/**
 * Reading time (social brief, ship 1) in the browser, against mocked Worker
 * routes: the account sheet with the SOCIAL_READING_TIME switch off (today's
 * sheet, no heartbeat) and on (signed in: Last 7 days; signed out: hours on
 * this device), and the Your reading page.
 *
 * Run: start `vite` with VITE_SUPABASE_URL=http://127.0.0.1:5287/sb
 * VITE_SUPABASE_ANON_KEY=anon-test VITE_AUDIO_BASE_URL=http://127.0.0.1:5287
 * on port 5287, then
 * PW_CHROMIUM_EXECUTABLE=/opt/pw-browsers/chromium npx playwright test -c e2e/playwright.reading-time.config.ts
 * ARTIFACT_DIR=<dir> saves a screenshot of each state.
 */
const ARTIFACT_DIR = process.env.ARTIFACT_DIR || ''
const USER = '11111111-1111-4111-8111-111111111111'

function day(offset: number): string {
  const date = new Date()
  date.setDate(date.getDate() + offset)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

/** About twelve weeks of reading, heavier lately, across a few books, plus time from before the ledger. */
function ledgerRows() {
  const rows: Array<{ day: string; bookId: string; read: number; listen: number }> = []
  for (let offset = -80; offset <= 0; offset += 1) {
    if (offset > -6 || (offset * 7) % 3 !== 0) {
      const minutes = 20 + ((offset * 37) % 50 + 50) % 50 + (offset > -21 ? 25 : 0)
      const bookId = offset > -30 ? 'frankenstein' : offset > -55 ? 'meditations' : 'the-prince'
      rows.push({ day: day(offset), bookId, read: minutes * 60, listen: offset % 4 === 0 ? 900 : 0 })
    }
  }
  rows.push({ day: day(-2), bookId: 'odyssey', read: 1800, listen: 1200 })
  rows.push({ day: '2026-09-30', bookId: '_earlier', read: 3 * 3600, listen: 0 })
  return rows
}

const place = (bookId: string, chapter: number, updatedAt: number) => ({ bookId, headerBook: bookId, chapterNumber: chapter, sequentialChapter: chapter, paragraphIndex: 0, wordIndex: 0, pageIndex: 0, primaryEditionKey: 'modern-en', updatedAt, deviceId: 'cloud', rev: 1 })
const range = (n: number) => Array.from({ length: n }, (_, index) => index + 1)

function positionRecord() {
  const now = Date.now()
  return {
    books: { frankenstein: place('frankenstein', 14, now - 3_600_000), odyssey: place('odyssey', 9, now - 2 * 86_400_000), meditations: place('meditations', 12, now - 40 * 86_400_000), 'the-prince': place('the-prince', 27, now - 60 * 86_400_000) },
    finished: { frankenstein: range(13), odyssey: range(8), meditations: range(12), 'the-prince': range(27) },
    hidden: {}, owner: USER, lastSettledBookId: 'frankenstein', lastSettledAt: now - 3_600_000, updatedAt: now - 3_600_000, deviceId: 'cloud',
  }
}

async function prepare(page: Page, options: { on: boolean; signedIn: boolean; night?: boolean; ledger?: 'ok' | 'missing' }) {
  const beats: string[] = []
  await page.route(url => !['localhost', '127.0.0.1'].includes(url.hostname), route => route.abort())
  // The placeholder Supabase: a signed-in session is seeded below; nothing else is stored.
  await page.route('**/sb/**', route => {
    const path = new URL(route.request().url()).pathname
    if (path.endsWith('/auth/v1/user')) return route.fulfill({ json: { id: USER, email: 'reader@example.com', aud: 'authenticated' } })
    return route.fulfill({ json: [] })
  })
  await page.route('**/api/reading-time/status', route => route.fulfill({ json: { enabled: options.on } }))
  await page.route('**/api/reading-time', route => options.ledger === 'missing'
    ? route.fulfill({ status: 503, json: { enabled: true, error: 'unavailable' } })
    : route.fulfill({ json: options.on ? { enabled: true, rows: ledgerRows() } : { enabled: false } }))
  await page.route('**/api/reading-time/beat', route => { beats.push(route.request().postData() ?? ''); return route.fulfill({ json: { enabled: options.on, credited: { read: 60, listen: 0 } } }) })
  await page.route('**/api/reading-time/flush', route => route.fulfill({ json: { enabled: options.on, credited: 0 } }))
  await page.route('**/api/lab-position', route => route.request().method() === 'GET' ? route.fulfill({ json: positionRecord() }) : route.fulfill({ json: positionRecord() }))
  await page.route('**/api/ai-allowance', route => route.fulfill({ json: { enabled: false } }))
  await page.route('**/api/balance', route => route.fulfill({ json: { balance: 0, isSubscribed: true } }))
  await page.route('**/api/events**', route => route.fulfill({ status: 204, body: '' }))
  await page.route('**/api/subscription-info', route => route.fulfill({ json: {} }))
  await page.addInitScript(({ user, signedIn, night }) => {
    try {
      if (signedIn) {
        const now = Math.floor(Date.now() / 1000)
        localStorage.setItem('sb-127-auth-token', JSON.stringify({
          access_token: 'test-token', refresh_token: 'refresh', token_type: 'bearer', expires_in: 3600, expires_at: now + 3600,
          user: { id: user, email: 'reader@example.com', aud: 'authenticated', role: 'authenticated', app_metadata: { provider: 'email' }, user_metadata: {} },
        }))
      }
      if (night) localStorage.setItem('tinct-lab-prefs', JSON.stringify({ theme: 'dark', darkMode: true }))
      // A device tally from before the switch, and a signed-out minute waiting.
      localStorage.setItem(`tinct:reading-year:${new Date().getFullYear()}:guest`, JSON.stringify({ v: 1, year: new Date().getFullYear(), devices: { d: { seconds: 2 * 3600 + 900, pages: 40, books: ['frankenstein'] } } }))
    } catch { /* private */ }
  }, { user: USER, signedIn: options.signedIn, night: options.night ?? false })
  return { beats }
}

async function openAccountSheet(page: Page) {
  await page.goto('/reader', { waitUntil: 'domcontentloaded' })
  await expect(page.getByTestId('lab-super')).toBeVisible({ timeout: 60_000 })
  await page.getByTestId('lab-super').click()
  await page.getByTestId('lab-super-row-account').click()
  await expect(page.getByTestId('lab-v2-sheet')).toHaveAttribute('data-layer', 'account')
}

async function shot(page: Page, name: string, fullPage = false) {
  if (!ARTIFACT_DIR) return
  mkdirSync(ARTIFACT_DIR, { recursive: true })
  await page.screenshot({ path: join(ARTIFACT_DIR, `${name}-${test.info().project.name}.png`), fullPage })
}

test('switch off: today’s account sheet, and no heartbeat', async ({ page }) => {
  const { beats } = await prepare(page, { on: false, signedIn: true })
  await openAccountSheet(page)
  await expect(page.locator('.lab-v2-year')).toContainText('This year')
  await expect(page.locator('.lab-v2-year')).toContainText('books')
  await expect(page.getByTestId('lab-v2-reading-time')).toHaveCount(0)
  await shot(page, 'sheet-switch-off')
  expect(beats).toEqual([])
})

for (const night of [false, true]) {
  test(`switch on, signed in: Last 7 days on the sheet (${night ? 'night' : 'paper'})`, async ({ page }) => {
    await prepare(page, { on: true, signedIn: true, night })
    await openAccountSheet(page)
    const block = page.getByTestId('lab-v2-reading-time')
    await expect(block).toHaveAttribute('data-mode', 'ledger')
    await expect(block).toContainText('Last 7 days')
    await expect(page.getByTestId('lab-v2-reading-time-facts')).toContainText('-day streak')
    await expect(page.getByTestId('lab-v2-your-reading')).toHaveAttribute('href', /\/your-reading\?return=/)
    await expect(page.locator('.lab-v2-year')).toHaveCount(0)
    await shot(page, `sheet-signed-in-${night ? 'night' : 'paper'}`)
  })
}

test('switch on, signed out: hours on this device and the invitation', async ({ page }) => {
  await prepare(page, { on: true, signedIn: false })
  await openAccountSheet(page)
  await expect(page.getByTestId('lab-v2-reading-time')).toHaveAttribute('data-mode', 'device')
  await expect(page.getByTestId('lab-v2-reading-time-invite')).toHaveText('Create a free account to keep your reading time and join the leaderboard.')
  await expect(page.getByTestId('lab-v2-time-figure')).toHaveText('2h 15m')
  await shot(page, 'sheet-signed-out')
})

test('switch on, ledger not there yet: today’s sheet, nothing thrown', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  await prepare(page, { on: true, signedIn: true, ledger: 'missing' })
  await openAccountSheet(page)
  await expect(page.locator('.lab-v2-year')).toContainText('This year')
  expect(errors).toEqual([])
})

test('Your reading: hours, twelve weeks, finished books and the share button', async ({ page }) => {
  await prepare(page, { on: true, signedIn: true })
  await page.goto('/your-reading?return=%2Freader', { waitUntil: 'domcontentloaded' })
  await expect(page.locator('#tinct-your-reading')).toHaveAttribute('data-state', 'ready', { timeout: 60_000 })
  await expect(page.getByTestId('your-reading-total')).toBeVisible()
  await expect(page.locator('.week')).toHaveCount(12)
  // Meditations and The Prince reached the end of their last chapter; Frankenstein and the Odyssey did not.
  await expect(page.getByTestId('your-reading-finished-count')).toContainText('2')
  await expect(page.getByTestId('your-reading-finished').locator('.book')).toHaveCount(2)
  await expect(page.getByTestId('your-reading-now').locator('.book')).toHaveCount(2)
  await expect(page.getByTestId('your-reading-share')).toBeVisible()
  await expect(page.locator('[data-back]')).toHaveAttribute('href', '/reader')
  await page.waitForTimeout(800)
  await shot(page, 'your-reading', true)
})

test('Your reading, signed out', async ({ page }) => {
  await prepare(page, { on: true, signedIn: false })
  await page.goto('/your-reading', { waitUntil: 'domcontentloaded' })
  await expect(page.locator('#tinct-your-reading')).toHaveAttribute('data-state', 'signed-out', { timeout: 60_000 })
  await expect(page.locator('main')).toContainText('Create a free account to keep your reading time and join the leaderboard.')
  await shot(page, 'your-reading-signed-out')
})
