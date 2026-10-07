import { expect, test, type Page } from '@playwright/test'
import { mkdirSync } from 'node:fs'
import { join } from 'node:path'

/**
 * Paid Modern English edition of an added public-domain book, in the reader:
 * a chapter not yet written shows its original text with the one-line status,
 * jumps the queue, and is swapped in when ready without losing the place.
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
const chapters = (first: string[]) => [
  { number: 1, title: 'Chapter I', paragraphs: first },
  { number: 2, title: 'Chapter II', paragraphs: PARAGRAPHS.slice(0, 5) },
]
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

async function shot(page: Page, name: string) {
  if (!ARTIFACT_DIR) return
  mkdirSync(ARTIFACT_DIR, { recursive: true })
  await page.screenshot({ path: join(ARTIFACT_DIR, `${name}-${test.info().project.name}.png`) })
}

test('a chapter not yet written is read in the original, then swapped in place', async ({ page }) => {
  let ready = false
  const priority: number[] = []
  await page.route(url => !['localhost', '127.0.0.1'].includes(url.hostname), route => route.abort())
  await page.route('**/api/**', route => route.fulfill({ status: 404, json: {} }))
  await page.route('**/api/public-books', route => route.fulfill({ json: { books: [ENTRY] } }))
  await page.route(`**/api/public-books/${BOOK}`, route => route.fulfill({ json: { book: BOOK_RECORD, entry: ENTRY } }))
  const status = () => ({ state: 'paid', chapters: { 1: ready ? 'ready' : 'preparing', 2: 'queued' }, offer: null })
  await page.route(`**/api/public-books/${BOOK}/modern-en`, route => route.fulfill({ json: status() }))
  await page.route(`**/api/public-books/${BOOK}/modern-en/priority`, async route => {
    priority.push(JSON.parse(route.request().postData() || '{}').chapter)
    route.fulfill({ json: status() })
  })
  await page.route(new RegExp(`/data/editions/${BOOK}-modern-en\\.json`), route => route.fulfill({
    json: { chapters: chapters(ready ? MODERN : PARAGRAPHS), modern: { complete: false, chapters: { 1: ready ? 'ready' : 'preparing', 2: 'queued' } } },
  }))
  await page.addInitScript(([book]) => {
    try {
      localStorage.setItem('tinct:internal', '1')
      sessionStorage.setItem('tinct:lab-reader-handoff', JSON.stringify({
        kind: 'open-reader', bookId: book, primaryEditionKey: 'modern-en',
        savedPlace: { bookId: book, chapterNumber: 1, paragraphIndex: 20, wordIndex: 0, page: 0 }, startAtSavedPlace: true,
      }))
    } catch { /* private */ }
  }, [BOOK])
  await page.goto('/reader', { waitUntil: 'domcontentloaded' })

  const status_ = page.getByTestId('lab-modern-status')
  await expect(status_).toHaveText('Modern English for this chapter is being prepared.', { timeout: 30_000 })
  const pageText = page.getByTestId('lab-page-wrap')
  await expect(pageText).toContainText('Original paragraph 21')
  expect(priority).toEqual([1])
  await page.waitForTimeout(ARTIFACT_DIR ? 2000 : 0)
  await shot(page, 'modern-preparing')

  ready = true
  // The watch asks again (every 10 s) and reloads the chapter in place.
  await expect(pageText).toContainText('Modern paragraph 21', { timeout: 30_000 })
  await expect(pageText).not.toContainText('Original paragraph')
  await expect(status_).toHaveCount(0)
  await shot(page, 'modern-ready')
})
