import { expect, test, type Page } from '@playwright/test'
import { mkdirSync } from 'node:fs'
import { join } from 'node:path'

/**
 * Paid Modern English edition of an added public-domain book, in the reader,
 * while it is being written (labModernEdition.ts, LabModernWait.tsx):
 *
 * - a page whose paragraphs are not written yet is covered by the waiting
 *   screen (never the original text), with the chapter's progress and an
 *   estimate; the reader's paragraph is asked for first (priority);
 * - after 30 s the original is offered, named as the original; reading it
 *   shows a quiet "Original text" label, and once Modern English is ready
 *   there, a notice switches at the same paragraph;
 * - when the paragraphs arrive the chapter is swapped in at the same place;
 * - after a purchase, the purchase is confirmed on the same screen.
 *
 * Every request outside the dev server is stubbed: no Worker, Stripe or model.
 *
 * Run: PW_CHROMIUM_EXECUTABLE=/opt/pw-browsers/chromium BASE_URL=http://localhost:5173 \
 *   npx playwright test -c e2e/playwright.modern-edition.config.ts
 * ARTIFACT_DIR=<dir> saves a screenshot of each state.
 */
const ARTIFACT_DIR = process.env.ARTIFACT_DIR || ''
const BOOK = 'pd-pg-158'
const PARAGRAPHS = Array.from({ length: 40 }, (_, i) => `Original paragraph ${i + 1}. ${'The morning was cold and the house on the hill stood dark against the sky, and nobody in the village could say why. '.repeat(3)}`)
const MODERN = PARAGRAPHS.map((_, i) => `Modern paragraph ${i + 1}. ${'It was a cold morning and the hilltop house was dark against the sky, and no one in the village knew why. '.repeat(3)}`)
const structure = { totalParagraphs: 45, chapters: [{ number: 1, title: 'Chapter I', paragraphCount: 40 }, { number: 2, title: 'Chapter II', paragraphCount: 5 }] }
const edition = (key: string, label: string) => ({
  key, language: 'en', style: key === 'modern-en' ? 'modern' : 'original', label, translator: null, year: null, aligned: key === 'modern-en',
  group: key === 'modern-en' ? 'modern' : 'human', provenance: 'published-edition', provenanceLabel: label,
  availability: { chapterText: true, audio: false, compare: false }, discoveryAvailable: true, wordCount: 6000, readingStructure: structure,
})
const ENTRY = {
  id: BOOK, title: 'Emma', author: 'Jane Austen', summary: 'Public-domain text from Project Gutenberg.', blurb: '', displayYear: '1815', wordCount: 6000,
  cover: { kind: 'generated', background: '#2c2417', accent: '#e9dfc4' }, art: null, paper: true, shelfIds: [], houseIds: [], placement: [], topics: [],
  form: 'novel', era: 'modern', year: 1815, editions: [edition('original-en', 'Original'), edition('modern-en', 'Modern English')],
  defaultEditionKey: 'original-en', defaultCompareEditionKey: null, availability: { cover: true, chapterText: true, audio: false, compare: false, optionalPreface: false },
  readingStructure: structure, discoveryAvailable: true, catalogueIndex: 100000,
}
const BOOK_RECORD = {
  id: BOOK, title: 'Emma', author: 'Jane Austen', year: 1815, wordCount: 6000,
  editions: [{ key: 'original-en', language: 'en', style: 'original', label: 'Original', aligned: false, hasAudio: false }, { key: 'modern-en', language: 'en', style: 'modern', label: 'Modern English', aligned: true, hasAudio: false }],
}

/** The Worker as it stands: how much of chapter 1 is written, and whether the purchase has gone through. */
interface World { state: 'checkout' | 'paid'; written: number; wordsPerMinute: number | null; priority: Array<{ chapter: number; paragraph?: number }> }

async function stub(page: Page, world: World) {
  const runs = () => world.written > 0 ? [[0, world.written]] : []
  const chapterState = () => world.written >= 40 ? 'ready' : 'preparing'
  const status = () => world.state === 'checkout'
    ? { state: 'checkout', chapters: {}, offer: null }
    : {
        state: 'paid', chapters: { 1: chapterState(), 2: 'queued' }, offer: null,
        progress: {
          wordsPerMinute: world.wordsPerMinute,
          chapters: {
            ...(chapterState() === 'ready' ? {} : { 1: { done: world.written, total: 40, ranges: runs(), startsIn: 0, eta: world.wordsPerMinute ? 300 : null } }),
            2: { done: 0, total: 5, ranges: [], startsIn: world.wordsPerMinute ? 300 : null, eta: world.wordsPerMinute ? 340 : null },
          },
        },
      }
  await page.route(url => !['localhost', '127.0.0.1'].includes(url.hostname), route => route.abort())
  await page.route('**/api/**', route => route.fulfill({ status: 404, json: {} }))
  await page.route('**/api/public-books', route => route.fulfill({ json: { books: [ENTRY] } }))
  await page.route(`**/api/public-books/${BOOK}`, route => route.fulfill({ json: { book: BOOK_RECORD, entry: ENTRY } }))
  await page.route(`**/api/public-books/${BOOK}/modern-en`, route => route.fulfill({ json: status() }))
  await page.route(`**/api/public-books/${BOOK}/modern-en/priority`, async route => {
    world.priority.push(JSON.parse(route.request().postData() || '{}'))
    await route.fulfill({ json: status() })
  })
  await page.route(new RegExp(`/data/editions/${BOOK}-modern-en\\.json`), route => route.fulfill({
    json: {
      chapters: [
        { number: 1, title: 'Chapter I', paragraphs: PARAGRAPHS.map((p, i) => i < world.written ? MODERN[i] : p) },
        { number: 2, title: 'Chapter II', paragraphs: PARAGRAPHS.slice(0, 5) },
      ],
      modern: { complete: false, chapters: { 1: chapterState(), 2: 'queued' }, written: chapterState() === 'ready' ? {} : { 1: runs() } },
    },
  }))
  await page.route(new RegExp(`/data/editions/${BOOK}-original-en\\.json`), route => route.fulfill({
    json: { chapters: [{ number: 1, title: 'Chapter I', paragraphs: PARAGRAPHS }, { number: 2, title: 'Chapter II', paragraphs: PARAGRAPHS.slice(0, 5) }] },
  }))
}

async function open(page: Page, primaryEditionKey: string, purchase = false) {
  await page.addInitScript(([book, edition, bought]) => {
    try {
      localStorage.setItem('tinct:internal', '1')
      if (bought) sessionStorage.setItem('tinct:modern-purchase', book)
      sessionStorage.setItem('tinct:lab-reader-handoff', JSON.stringify({
        kind: 'open-reader', bookId: book, primaryEditionKey: edition,
        savedPlace: { bookId: book, chapterNumber: 1, paragraphIndex: 20, wordIndex: 0, page: 0 }, startAtSavedPlace: true,
      }))
    } catch { /* private */ }
  }, [BOOK, primaryEditionKey, purchase] as const)
  await page.goto('/reader', { waitUntil: 'domcontentloaded' })
}

async function shot(page: Page, name: string) {
  if (!ARTIFACT_DIR) return
  mkdirSync(ARTIFACT_DIR, { recursive: true })
  await page.waitForTimeout(800)
  await page.screenshot({ path: join(ARTIFACT_DIR, `${name}-${test.info().project.name}.png`) })
}

/** The waiting screen covers the whole page: the point at the page's centre is the cover, not text. */
async function expectCovered(page: Page) {
  await expect.poll(() => page.evaluate(() => {
    const wrap = document.querySelector('[data-testid="lab-page-wrap"]')?.getBoundingClientRect()
    const cover = document.querySelector('[data-testid="lab-modern-wait"]')?.getBoundingClientRect()
    if (!wrap || !cover) return null
    const centre = document.elementFromPoint(wrap.left + wrap.width / 2, wrap.top + wrap.height * 0.7)
    return { fills: cover.left <= wrap.left + 1 && cover.right >= wrap.right - 1 && cover.top <= wrap.top + 1 && cover.bottom >= wrap.bottom - 1, onTop: !!centre?.closest('[data-testid="lab-modern-wait"]') }
  }), { timeout: 30_000 }).toEqual({ fills: true, onTop: true })
  await expect(page.getByTestId('lab-modern-wait')).toBeVisible()
}

/** The page is filled to the bottom: the last line painted sits close above the bottom chrome (no big empty band). */
async function expectPageFilled(page: Page) {
  const gap = await page.evaluate(() => {
    const words = [...document.querySelectorAll<HTMLElement>('[data-testid="lab-page-wrap"] [data-testid="lab-word"]')]
      .filter(w => !w.closest('.lab-page-measure'))
      .map(w => w.getBoundingClientRect())
      .filter(r => r.width > 0 && r.left >= 0 && r.right <= window.innerWidth && r.bottom <= window.innerHeight)
    const wrap = document.querySelector('[data-testid="lab-page-wrap"]')!.getBoundingClientRect()
    const bottom = Math.max(...words.map(r => r.bottom))
    const lineHeight = words[0]?.height || 30
    return (wrap.bottom - bottom) / lineHeight
  })
  expect(gap).toBeLessThan(3.5)
}

test('a page not yet written waits on a covering screen, then opens in Modern English at the same place', async ({ page }) => {
  const world: World = { state: 'paid', written: 5, wordsPerMinute: null, priority: [] }
  await stub(page, world)
  await open(page, 'modern-en')

  await expectCovered(page)
  await expect(page.getByTestId('lab-modern-wait-line')).toHaveText('Writing this page.')
  await expect(page.getByTestId('lab-modern-wait-progress')).toHaveText('5 of 40 paragraphs in this chapter written')
  await expect(page.getByTestId('lab-modern-wait').getByRole('heading')).toHaveText('Emma')
  await expect(page.getByTestId('lab-modern-read-original')).toHaveCount(0)
  // The reader's own paragraph is asked for first.
  await expect.poll(() => world.priority.at(-1), { timeout: 10_000 }).toMatchObject({ chapter: 1 })
  expect(world.priority.at(-1)!.paragraph).toBeGreaterThanOrEqual(5)
  expect(world.priority.at(-1)!.paragraph).toBeLessThanOrEqual(20)
  // No mono type anywhere on the waiting screen.
  const fonts = await page.getByTestId('lab-modern-wait').evaluate(node => [...node.querySelectorAll('*')].map(el => getComputedStyle(el).fontFamily))
  expect(fonts.some(f => /mono/i.test(f))).toBe(false)
  await shot(page, 'modern-wait')

  // The pace is known: an estimate appears with the next status.
  world.wordsPerMinute = 1500
  await expect(page.getByTestId('lab-modern-wait-line')).toHaveText('Writing this page. Under a minute.', { timeout: 15_000 })
  await shot(page, 'modern-wait-estimate')

  // The page is written: swapped in at the same paragraph, no cover, no line over the text.
  world.written = 30
  const text = page.getByTestId('lab-page-wrap')
  await expect(text).toContainText('Modern paragraph 21', { timeout: 20_000 })
  await expect(page.getByTestId('lab-modern-wait')).toHaveCount(0)
  await expect(text).not.toContainText('Original paragraph 21')
  await expectPageFilled(page)
  await shot(page, 'modern-ready-in-place')
})

test('after half a minute the original is offered, labelled, and Modern English is switched in where the reader is', async ({ page }) => {
  test.setTimeout(120_000)
  const world: World = { state: 'paid', written: 5, wordsPerMinute: 1200, priority: [] }
  await stub(page, world)
  await open(page, 'modern-en')
  await expectCovered(page)
  await expect(page.getByTestId('lab-modern-read-original')).toBeVisible({ timeout: 40_000 })
  await expect(page.getByTestId('lab-modern-read-original')).toHaveText('Read the original meanwhile')
  await shot(page, 'modern-wait-offer')

  await page.getByTestId('lab-modern-read-original').click()
  const text = page.getByTestId('lab-page-wrap')
  await expect(text).toContainText('Original paragraph 21', { timeout: 20_000 })
  await expect(page.getByTestId('lab-modern-wait')).toHaveCount(0)
  await expect(page.getByTestId('lab-chapter-progress')).toContainText(/^Original text · /)
  await expectPageFilled(page)
  await shot(page, 'original-label')

  world.written = 32
  await expect(page.getByTestId('lab-modern-ready')).toBeVisible({ timeout: 20_000 })
  await expect(page.getByTestId('lab-modern-ready')).toContainText('Modern English is ready')
  await shot(page, 'modern-ready-notice')
  await page.getByTestId('lab-modern-ready-switch').click()
  await expect(text).toContainText('Modern paragraph 21', { timeout: 20_000 })
  await expect(page.getByTestId('lab-modern-ready')).toHaveCount(0)
  await expect(page.getByTestId('lab-chapter-progress')).not.toContainText('Original text')
})

test('back from Checkout, the purchase is confirmed on the waiting screen, never over the original text', async ({ page }) => {
  const world: World = { state: 'checkout', written: 0, wordsPerMinute: null, priority: [] }
  await stub(page, world)
  await open(page, 'original-en', true)
  await expectCovered(page)
  await expect(page.getByTestId('lab-modern-wait-line')).toHaveText('Confirming your purchase.')
  await shot(page, 'purchase-confirming')

  // Granted: the edition switches to Modern English, whose page is still being written.
  world.state = 'paid'
  await expect(page.getByTestId('lab-modern-wait-line')).toHaveText('Writing this page.', { timeout: 20_000 })
  await expectCovered(page)
  world.written = 32
  await expect(page.getByTestId('lab-page-wrap')).toContainText('Modern paragraph 21', { timeout: 20_000 })
  await expect(page.getByTestId('lab-modern-wait')).toHaveCount(0)
})
