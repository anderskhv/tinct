import { expect, test, type Browser, type BrowserContext, type Page } from '@playwright/test'

type ReaderViewport = {
  name: 'desktop' | 'phone'
  width: number
  height: number
  touch: boolean
}

const VIEWPORTS: ReaderViewport[] = [
  { name: 'desktop', width: 1440, height: 900, touch: false },
  { name: 'phone', width: 390, height: 844, touch: true },
]

async function readerContext(browser: Browser, viewport: ReaderViewport): Promise<BrowserContext> {
  return browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    isMobile: viewport.touch,
    hasTouch: viewport.touch,
    userAgent: viewport.touch
      ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148'
      : undefined,
  })
}

async function openIvanChat(page: Page, viewport: ReaderViewport): Promise<void> {
  await page.addInitScript(() => {
    sessionStorage.setItem('tinct:lab-reader-handoff', JSON.stringify({
      kind: 'open-reader',
      bookId: 'ivan-ilyich',
      primaryEditionKey: 'original-en',
      savedPlace: { bookId: 'ivan-ilyich', chapterNumber: 1, paragraphIndex: 0, page: 0 },
    }))
  })
  await page.goto('/lab/reader', { waitUntil: 'networkidle' })
  await expect(page.getByTestId('lab-root')).toHaveAttribute('data-book-id', 'ivan-ilyich')
  await expect(page.getByTestId('lab-header-work')).toHaveText('The Death of Ivan Ilyich')
  await page.getByTestId(viewport.touch ? 'lab-phone-chat' : 'lab-desktop-chat').click()
  await expect(page.getByRole('textbox', { name: 'Ask' })).toBeVisible()
}

for (const viewport of VIEWPORTS) {
  test(`${viewport.name} pointer activation near the visible Send label submits once`, async ({ browser }) => {
    const context = await readerContext(browser, viewport)
    const page = await context.newPage()
    let requestCount = 0
    await page.route('**/api/lab-chat', async route => {
      requestCount += 1
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ content: [{ text: 'A local test response.' }] }),
      })
    })
    await openIvanChat(page, viewport)

    const input = page.getByRole('textbox', { name: 'Ask' })
    const send = page.getByRole('button', { name: 'Send' })
    const question = `What is happening here on ${viewport.name}?`
    await input.fill(question)
    const box = await send.boundingBox()
    if (!box) throw new Error('Visible Send control has no pointer target')

    // Exercise the upper part of the control's 44px interaction area. Before
    // the fix this point belonged to the composer, so a real pointer/touch
    // produced no submit even though it was immediately beside the label.
    const x = box.x + box.width / 2
    const y = box.y - 6
    if (viewport.touch) await page.touchscreen.tap(x, y)
    else await page.mouse.click(x, y)

    await expect(input).toHaveValue('')
    await expect(page.getByTestId('lab-ask-turn-user')).toHaveCount(1)
    await expect(page.getByTestId('lab-ask-turn-user')).toContainText(question)
    await expect.poll(() => requestCount).toBe(1)
    await page.waitForTimeout(100)
    expect(requestCount).toBe(1)
    await context.close()
  })
}
