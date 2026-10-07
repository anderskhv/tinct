import { expect, test, type Page } from '@playwright/test'
import { mkdirSync } from 'node:fs'
import { join } from 'node:path'

/**
 * The librarian tab in the reader margin (approved 2026-10-07): it sits in
 * the margin and never over a line of text at any margin or theme, a tap
 * opens Chat, ⋯ in the chat hides it with an Undo, dragging it onto the hide
 * target hides it, and Reader settings brings it back.
 *
 * Signed in with a fixture session read from storage; every request outside
 * the dev server is stubbed, so no account, Worker or model is reached.
 *
 * Run: PW_CHROMIUM_EXECUTABLE=/opt/pw-browsers/chromium BASE_URL=http://localhost:5173 \
 *   npx playwright test -c e2e/playwright.librarian-tab.config.ts
 * ARTIFACT_DIR=<dir> saves a screenshot of each state.
 */
const ARTIFACT_DIR = process.env.ARTIFACT_DIR || ''
const PEEK_SEEN = { 'librarian-tab-peek:device': true }

async function shot(page: Page, name: string) {
  if (!ARTIFACT_DIR) return
  mkdirSync(ARTIFACT_DIR, { recursive: true })
  await page.screenshot({ path: join(ARTIFACT_DIR, `${name}-${test.info().project.name}.png`) })
}

const phone = () => test.info().project.name === 'phone'

async function prepare(page: Page, prefs: Record<string, unknown> | null = { version: 2, shared: {}, phone: {}, desktop: {}, seenOnce: PEEK_SEEN }) {
  await page.route(url => !['localhost', '127.0.0.1'].includes(url.hostname), route => route.abort())
  await page.route('**/api/**', route => route.fulfill({ status: 404, json: {} }))
  await page.addInitScript(([stored]) => {
    // A signed-in reader: Supabase reads this fixture session from storage
    // and, with an expiry a day away, never asks the network about it.
    const session = JSON.stringify({
      access_token: 'fixture', refresh_token: 'fixture', token_type: 'bearer', expires_in: 3600,
      expires_at: Math.floor(Date.now() / 1000) + 86400,
      user: { id: '00000000-0000-4000-8000-000000000001', email: 'reader@example.com', aud: 'authenticated', role: 'authenticated', app_metadata: {}, user_metadata: {} },
    })
    const get = Storage.prototype.getItem
    Storage.prototype.getItem = function (key: string) { return /^sb-.*-auth-token$/.test(key) ? session : get.call(this, key) }
    try {
      localStorage.setItem('sb-fixture-auth-token', session)
      if (stored && !sessionStorage.getItem('librarian-e2e-prefs')) {
        sessionStorage.setItem('librarian-e2e-prefs', '1')
        localStorage.setItem('tinct-lab-prefs', JSON.stringify(stored))
      }
    } catch { /* private */ }
  }, [prefs] as const)
}

async function openReader(page: Page) {
  await page.goto('/reader', { waitUntil: 'domcontentloaded' })
  await expect(page.getByTestId('lab-root')).toHaveAttribute('data-reader-ready', 'true', { timeout: 60_000 })
  await expect(page.getByTestId('lab-librarian-tab-band')).toBeVisible({ timeout: 20_000 })
  // Let the page map and the tab's own measurement settle.
  await page.waitForTimeout(700)
}

async function setPrefs(page: Page, appearance: Record<string, unknown>, shared: Record<string, unknown> = {}) {
  await page.evaluate(([look, both, seen]) => {
    localStorage.setItem('tinct-lab-prefs', JSON.stringify({ version: 2, shared: both, phone: look, desktop: look, seenOnce: seen }))
  }, [appearance, shared, PEEK_SEEN] as const)
  await page.reload({ waitUntil: 'domcontentloaded' })
  await expect(page.getByTestId('lab-root')).toHaveAttribute('data-reader-ready', 'true', { timeout: 60_000 })
  await expect(page.getByTestId('lab-librarian-tab-band')).toBeVisible({ timeout: 20_000 })
  await page.waitForTimeout(700)
}

/** Every line box of painted text on screen, and the tab: none may meet. */
async function tabOverlapsText(page: Page): Promise<{ overlaps: number; lines: number; tab: DOMRect | null }> {
  return page.evaluate(() => {
    const tab = document.querySelector('[data-testid="lab-librarian-tab"]')?.getBoundingClientRect() ?? null
    const wrap = document.querySelector('[data-testid="lab-page-wrap"]')
    if (!tab || !wrap) return { overlaps: -1, lines: 0, tab }
    const walker = document.createTreeWalker(wrap, NodeFilter.SHOW_TEXT)
    let overlaps = 0
    let lines = 0
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      const parent = node.parentElement
      if (!parent || !node.textContent?.trim() || parent.closest('.lab-page-measure, .lab-desktop-measure, [aria-hidden="true"]')) continue
      const style = getComputedStyle(parent)
      if (style.visibility === 'hidden' || style.opacity === '0') continue
      const range = document.createRange()
      range.selectNodeContents(node)
      for (const rect of Array.from(range.getClientRects())) {
        if (rect.width < 1 || rect.height < 1 || rect.bottom < 0 || rect.top > innerHeight || rect.right < 0 || rect.left > innerWidth) continue
        lines += 1
        const meets = rect.left < tab.right && rect.right > tab.left && rect.top < tab.bottom && rect.bottom > tab.top
        if (meets) overlaps += 1
      }
    }
    return { overlaps, lines, tab }
  })
}

async function center(page: Page, testId: string) {
  await expect(page.getByTestId(testId)).toBeVisible()
  const box = await page.getByTestId(testId).boundingBox()
  if (!box) throw new Error(`${testId} has no box`)
  return { x: box.x + box.width / 2, y: box.y + box.height / 2 }
}

async function tapTab(page: Page) {
  const { x, y } = await center(page, 'lab-librarian-tab')
  if (phone()) await page.touchscreen.tap(x, y)
  else await page.mouse.click(x, y)
}

async function closeChat(page: Page) {
  if (phone()) await page.getByTestId('lab-ask-done').click()
  else await page.getByTestId('lab-desktop-companion-close').click()
  await expect(page.getByTestId('lab-ask-pane')).toHaveCount(0)
}

test('the tab sits in the margin and never over text, at every margin and theme', async ({ page }) => {
  await prepare(page)
  await openReader(page)
  for (const theme of ['light', 'book', 'dark'] as const) {
    for (const margins of ['narrow', 'medium', 'wide'] as const) {
      if (!phone() && theme !== 'light' && margins !== 'medium') continue
      await setPrefs(page, { theme, margins })
      // The first page fades in after its page map settles.
      await expect.poll(async () => (await tabOverlapsText(page)).lines, { message: `${theme}/${margins}: text lines measured`, timeout: 15_000 }).toBeGreaterThan(5)
      const result = await tabOverlapsText(page)
      expect(result.overlaps, `${theme}/${margins}: tab over text`).toBe(0)
      expect(result.tab!.width).toBeGreaterThanOrEqual(12)
      expect(result.tab!.width).toBeLessThanOrEqual(18)
      expect(result.tab!.height).toBeCloseTo(40, 0)
      // Flush against the right edge of the page.
      const edge = await page.evaluate(() => {
        const passage = Array.from(document.querySelectorAll<HTMLElement>('[data-testid="lab-page-wrap"] .lab-passage'))
          .find(element => !element.closest('.lab-page-measure, .lab-desktop-measure'))
        return passage?.getBoundingClientRect().right ?? 0
      })
      expect(Math.abs(result.tab!.right - edge)).toBeLessThan(1)
      if (phone() || margins === 'medium') await shot(page, `tab-${theme === 'dark' ? 'night' : theme}-${margins}`)
    }
  }
  await setPrefs(page, { theme: 'light', margins: 'medium' })
  expect((await tabOverlapsText(page)).overlaps).toBe(0)
  // A tap on the page away from the band still turns the page.
  const before = await page.getByTestId('lab-root').getAttribute('data-place')
  if (phone()) {
    const box = (await page.getByTestId('lab-book').boundingBox())!
    await page.touchscreen.tap(box.x + box.width - 12, box.y + box.height * 0.3)
  } else {
    await page.getByTestId('lab-page-next').click()
  }
  await expect.poll(() => page.getByTestId('lab-root').getAttribute('data-place')).not.toBe(before)
  await expect(page.getByTestId('lab-librarian-tab-band')).toBeVisible()
  expect((await tabOverlapsText(page)).overlaps).toBe(0)
})

test('the menu has one Librarian row with Chat and Talk, tab shown or hidden', async ({ page }) => {
  await prepare(page)
  await openReader(page)
  await page.getByTestId('lab-super').click()
  const row = page.locator('.lab-super-row.is-librarian')
  await expect(row).toContainText('Librarian')
  await expect(page.getByTestId('lab-super-menu').locator('.lab-super-row-label')).toHaveText(
    phone() ? ['Librarian', 'Summarize', 'Catch me up', 'Book editions', 'Settings', 'Library', 'Account']
      : ['Librarian', 'Summarize', 'Catch me up', 'Book editions', 'Settings', 'Account'])
  const chat = row.getByRole('button', { name: 'Chat' })
  const talk = row.getByRole('button', { name: 'Talk' })
  for (const icon of [chat, talk]) {
    const box = (await icon.boundingBox())!
    expect(box.width).toBeGreaterThanOrEqual(44)
    expect(box.height).toBeGreaterThanOrEqual(44)
  }
  await shot(page, 'menu-librarian')
  await page.getByTestId('lab-super-row-librarian').click()
  await expect(page.getByTestId('lab-ask-pane')).toBeVisible()
  // Hide the tab: the row stays.
  await page.getByTestId('lab-ask-tab-settings').click()
  await page.getByTestId('lab-librarian-hide').click()
  await closeChat(page)
  await expect(page.getByTestId('lab-librarian-tab-band')).toHaveCount(0)
  await page.getByTestId('lab-super').click()
  await page.getByTestId('lab-super-row-chat').click()
  await expect(page.getByTestId('lab-ask-pane')).toBeVisible()
})

/** Record the tab's peek as it happens, from the moment the tab appears: a busy first load can outlast a 1s look. */
async function watchPeek(page: Page) {
  await page.getByTestId('lab-librarian-tab-band').waitFor({ state: 'attached', timeout: 60_000 })
  await page.evaluate(() => {
    const band = document.querySelector('[data-testid="lab-librarian-tab-band"]')!
    const tab = band.querySelector<HTMLElement>('[data-testid="lab-librarian-tab"]')!
    const seen = { peeks: 0, tallest: parseFloat(tab.style.height) || 0, peeking: band.classList.contains('is-peeking') }
    if (seen.peeking) seen.peeks = 1
    ;(window as unknown as { __peek: typeof seen }).__peek = seen
    new MutationObserver(() => {
      const peeking = band.classList.contains('is-peeking')
      if (peeking && !seen.peeking) seen.peeks += 1
      seen.peeking = peeking
      seen.tallest = Math.max(seen.tallest, parseFloat(tab.style.height) || 0)
    }).observe(band, { subtree: true, attributes: true, attributeFilter: ['class', 'style'] })
  })
}
const peekRecord = (page: Page) => page.evaluate(() => (window as unknown as { __peek: { peeks: number; tallest: number; peeking: boolean } }).__peek)

test('first run: the tab peeks once, then never again', async ({ page }) => {
  await prepare(page, null)
  await page.goto('/reader', { waitUntil: 'domcontentloaded' })
  await watchPeek(page)
  const band = page.getByTestId('lab-librarian-tab-band')
  await page.waitForFunction(() => document.querySelector('[data-testid="lab-librarian-tab-band"]')?.classList.contains('is-peeking'), null, { polling: 'mutation', timeout: 30_000 }).catch(() => { /* asserted below */ })
  await page.waitForTimeout(350)
  await shot(page, 'first-run-peek')
  // Stretched along the edge to 60px, once, and never into the text.
  await expect.poll(async () => (await peekRecord(page)).peeks).toBe(1)
  expect((await peekRecord(page)).tallest).toBe(60)
  await expect(band).not.toHaveClass(/is-peeking/, { timeout: 5_000 })
  expect((await tabOverlapsText(page)).overlaps).toBe(0)
  await page.reload({ waitUntil: 'domcontentloaded' })
  await watchPeek(page)
  await page.waitForTimeout(2500)
  expect(await peekRecord(page)).toEqual({ peeks: 0, tallest: 40, peeking: false })
})

test('tap opens Chat; ⋯ hides the tab with Undo; Reader settings shows it again', async ({ page }) => {
  await prepare(page)
  await openReader(page)
  await expect(page.getByTestId('lab-librarian-tab').locator('svg')).toHaveAttribute('data-mode', 'chat')

  await tapTab(page)
  await expect(page.getByTestId('lab-ask-pane')).toBeVisible()
  // Hidden while the chat is open.
  await expect(page.getByTestId('lab-librarian-tab-band')).toHaveCount(0)

  await page.getByTestId('lab-ask-tab-settings').click()
  const settings = page.getByTestId('lab-librarian-settings')
  await expect(settings).toBeVisible()
  await expect(settings).toContainText('Librarian tab')
  await expect(settings).toContainText('Tab opens')
  await expect(settings).toContainText('Long press')
  await expect(page.getByTestId('lab-librarian-opens-chat')).toHaveAttribute('aria-pressed', 'true')
  await expect(page.getByTestId('lab-librarian-long-press-off')).toHaveAttribute('aria-pressed', 'true')
  await shot(page, 'tab-settings')

  await page.getByTestId('lab-librarian-hide').click()
  await expect(settings).toHaveCount(0)
  const note = page.getByTestId('lab-librarian-note')
  await expect(note).toContainText('Librarian tab hidden')
  await shot(page, 'undo-note-over-chat')
  await page.getByTestId('lab-librarian-undo').click()
  await expect(note).toHaveCount(0)
  await closeChat(page)
  await expect(page.getByTestId('lab-librarian-tab-band')).toBeVisible()

  // Hidden again, and the note runs out on its own.
  await tapTab(page)
  await page.getByTestId('lab-ask-tab-settings').click()
  await page.getByTestId('lab-librarian-hide').click()
  await closeChat(page)
  await expect(page.getByTestId('lab-librarian-tab-band')).toHaveCount(0)
  await expect(note).toHaveCount(0, { timeout: 8_000 })
  await page.reload({ waitUntil: 'domcontentloaded' })
  await expect(page.getByTestId('lab-root')).toHaveAttribute('data-reader-ready', 'true', { timeout: 60_000 })
  await page.waitForTimeout(800)
  await expect(page.getByTestId('lab-librarian-tab-band')).toHaveCount(0)

  // Reader settings → Librarian → Show tab.
  await page.getByTestId('lab-super').click()
  await page.getByTestId('lab-super-row-settings').click()
  const show = page.getByTestId('lab-v2-librarian-show')
  await show.scrollIntoViewIfNeeded()
  await expect(show).toHaveAttribute('aria-checked', 'false')
  await expect(page.getByTestId('lab-v2-sheet')).toContainText('Show tab')
  await show.click()
  await expect(show).toHaveAttribute('aria-checked', 'true')
  await page.getByTestId('lab-v2-librarian-opens-talk').click()
  await expect(page.getByTestId('lab-v2-librarian-opens-talk')).toHaveAttribute('aria-pressed', 'true')
  await shot(page, 'reader-settings-librarian')
  await page.getByTestId('lab-v2-librarian-opens-chat').click()
  await page.getByTestId('lab-v2-sheet-close').click()
  await expect(page.getByTestId('lab-librarian-tab-band')).toBeVisible()
})

test('dragging the tab onto the hide target hides it; Undo brings it back', async ({ page }) => {
  await prepare(page)
  await openReader(page)
  const start = await center(page, 'lab-librarian-tab')
  const size = page.viewportSize()!
  const target = { x: size.width / 2, y: size.height - 34 - 26 }
  await page.mouse.move(start.x, start.y)
  await page.mouse.down()
  const steps = 16
  for (let step = 1; step <= steps; step += 1) {
    await page.mouse.move(start.x + (target.x - start.x) * step / steps, start.y + (target.y - start.y) * step / steps)
  }
  await expect(page.getByTestId('lab-librarian-tab-target')).toBeVisible()
  await expect(page.getByTestId('lab-librarian-tab-orb')).toBeVisible()
  await expect(page.getByTestId('lab-librarian-tab-target')).toHaveClass(/is-active/)
  await shot(page, 'drag-to-hide')
  await page.mouse.up()
  await expect(page.getByTestId('lab-librarian-tab-band')).toHaveCount(0)
  await expect(page.getByTestId('lab-librarian-note')).toBeVisible()
  await shot(page, 'undo-note')
  await page.getByTestId('lab-librarian-undo').click()
  await expect(page.getByTestId('lab-librarian-tab-band')).toBeVisible()

  // A drag along the edge moves it and is remembered for this layout.
  const before = await center(page, 'lab-librarian-tab')
  await page.mouse.move(before.x, before.y)
  await page.mouse.down()
  for (let step = 1; step <= 8; step += 1) await page.mouse.move(before.x - 4, before.y - step * 15)
  await page.mouse.up()
  await page.waitForTimeout(500)
  const after = await center(page, 'lab-librarian-tab')
  expect(after.y).toBeLessThan(before.y - 80)
  expect((await tabOverlapsText(page)).overlaps).toBe(0)
  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('tinct-lab-prefs') || '{}'))
  const layout = phone() ? 'phone' : 'desktop'
  expect(stored[layout].librarianTabDock.side).toBe('right')
  expect(stored[layout].librarianTabDock.y).toBeLessThan(0.62)
})
