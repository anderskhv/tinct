import { expect, test, type Page } from '@playwright/test'
import { mkdirSync } from 'node:fs'
import { join } from 'node:path'

/**
 * Add to Tinct (approved D1/D2, 2026-10-06) in the library: the search's
 * "Available in Tinct" / "Not yet in Tinct" groups with Add and the file box,
 * and My shelf's "Your own books" with the + tile. Internal flag on: shown;
 * off: the library exactly as before. The catalogue search is the real Add a
 * book worker and catalogue; the added-book index and the add engine
 * (/lab/library-add.js) are stubs, so nothing is imported or uploaded.
 *
 * Run: PW_CHROMIUM_EXECUTABLE=/opt/pw-browsers/chromium npx playwright test -c e2e/playwright.library-add.config.ts
 * ARTIFACT_DIR=<dir> saves a screenshot of each state.
 */
const ARTIFACT_DIR = process.env.ARTIFACT_DIR || ''
const USER = '11111111-1111-4111-8111-111111111111'

const ADDED = {
  id: 'pd-pg-158', title: 'Emma', author: 'Jane Austen', summary: 'Public-domain text from Project Gutenberg.', blurb: 'Public-domain text from Project Gutenberg.',
  displayYear: '1815', wordCount: 160000, cover: { kind: 'generated', background: '#2c2417', accent: '#e9dfc4' }, art: null, paper: true,
  shelfIds: ['english-novels'], houseIds: ['novel'], form: 'novel', era: 'modern', year: 1815, topics: [],
  placement: [{ houseId: 'novel', houseTitle: 'Fiction', houseSubtitle: 'Novels and stories, by tradition', houseHue: 25, shelfId: 'english-novels', shelfTitle: '19th-Century English Novels', shelfSubtitle: 'Austen to Conrad', shelfHue: 265 }],
  editions: [{ key: 'original-en', language: 'en', style: 'original', label: 'Original', translator: null, year: 1815, aligned: false, group: 'human', provenance: 'published-edition', provenanceLabel: 'Published public-domain edition', availability: { chapterText: true, audio: false, compare: false }, discoveryAvailable: true }],
  defaultEditionKey: 'original-en', defaultCompareEditionKey: null, availability: { cover: true, chapterText: true, audio: false, compare: false, optionalPreface: false },
  readingStructure: { totalParagraphs: 10, chapters: [{ number: 1, title: 'Chapter I', paragraphCount: 10 }] }, discoveryAvailable: true, catalogueIndex: 100000,
  public: { workId: 'pg:158', source: 'Gutenberg', sourceName: 'Project Gutenberg', sourceUrl: null, licence: 'Public domain', addedAt: '2026-10-06T00:00:00Z' },
}
const OWN_BOOKS = [
  { key: 'epub:aaaaaaaaaaaaaaaaaaaaaaaa', kind: 'epub', title: 'Thesis draft: Rivers in Victorian fiction', author: 'Me', at: 3, readingAt: 3, href: '/reader?userBook=aaaaaaaaaaaaaaaaaaaaaaaa' },
  { key: 'pdf:bbbbbbbbbbbbbbbbbbbbbbbb', kind: 'pdf', title: 'Lecture notes, week 4', author: '', at: 2, readingAt: null, href: '/lab/addbook/#books' },
]

const FAILING_IMPORT = `async()=>({ok:false,reason:'failed'})`
/** A slow import: it reports each step when the page asks (window.__importStep()), then fails. */
const SLOW_IMPORT = `async(id,options)=>{const stages=['download','convert','publish'];await new Promise(done=>{window.__importStep=()=>{const next=stages.shift();if(next)options?.onStage?.(next);else done();};});return {ok:false,reason:'failed'};}`

async function prepare(page: Page, { internal, signedIn, importWork = FAILING_IMPORT }: { internal: boolean; signedIn: boolean; importWork?: string }) {
  // Only the local dev server: no outside service (accounts, fonts, analytics) is reached.
  await page.route(url => !['localhost', '127.0.0.1'].includes(url.hostname), route => route.abort())
  await page.route('**/api/public-books', route => route.fulfill({ json: { books: [ADDED] } }))
  await page.route('**/api/events**', route => route.fulfill({ status: 204, body: '' }))
  await page.route('**/lab/library-add.js**', route => route.fulfill({
    contentType: 'text/javascript',
    body: `window.__tinctLibraryAdd={ownBooks:async()=>${JSON.stringify(OWN_BOOKS)},importWork:${importWork}};`,
  }))
  await page.route('**/sign-in**', route => route.fulfill({ contentType: 'text/html', body: '<!doctype html><title>Sign in</title><p>Sign in</p>' }))
  if (signedIn) {
    await page.context().addCookies([{ name: 'tinct_auth', value: '1', url: process.env.BASE_URL || 'http://localhost:5173' }])
    await page.addInitScript(user => { try { localStorage.setItem('sb-local-auth-token', JSON.stringify({ user: { id: user, email: 'reader@example.com' } })) } catch { /* private */ } }, USER)
  }
  await page.goto(`/library?view=new&internal=${internal ? 1 : 0}`, { waitUntil: 'domcontentloaded' })
  await expect(page.locator('#search-toggle')).toBeVisible()
  // The flag is stored and stripped from the address straight away.
  await expect.poll(() => page.evaluate(() => localStorage.getItem('tinct:internal'))).toBe(internal ? '1' : null)
  expect(page.url()).not.toContain('internal=')
}

async function shot(page: Page, name: string) {
  if (!ARTIFACT_DIR) return
  mkdirSync(ARTIFACT_DIR, { recursive: true })
  await page.screenshot({ path: join(ARTIFACT_DIR, `${name}-${test.info().project.name}.png`) })
}

async function search(page: Page, query: string) {
  await page.locator('#search-toggle').click()
  await page.locator('#search-input').fill(query)
}

test.describe('library search', () => {
  test('internal flag on: Available in Tinct, Not yet in Tinct with Add, and the file box', async ({ page }) => {
    await prepare(page, { internal: true, signedIn: false })
    await search(page, 'austen')
    const results = page.locator('#search-results')
    await expect(results.locator('.search-group-head').first()).toHaveText('Available in Tinct')
    await expect(results.locator('.free-group .search-group-head')).toHaveText('Not yet in Tinct', { timeout: 60_000 })
    const titles = await results.locator('.search-result span').allTextContents()
    expect(titles).toContain('Pride and Prejudice')
    expect(titles).toContain('Emma') // an added book is "Available in Tinct", with its paper cover
    const rows = results.locator('.free-row')
    expect(await rows.count()).toBeGreaterThan(0)
    const lines = await rows.locator('.free-line').allTextContents()
    expect(lines).not.toContain('Pride and Prejudice · Jane Austen') // the Tinct book itself; adaptations may stay
    expect(lines.some(line => /^Emma ·/.test(line))).toBe(false)
    expect(lines.every(line => line.includes('·'))).toBe(true)
    await expect(rows.first().locator('small')).toHaveText(/Project Gutenberg|Wikisource|Standard Ebooks/)
    await expect(rows.first().locator('.free-add')).toHaveText('Add')
    const file = results.locator('.file-box')
    await expect(file).toContainText('Have it as a file?')
    await expect(file.locator('a')).toHaveAttribute('href', '/lab/addbook/')
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    await shot(page, 'search-internal-on')
    // Signed out, Add goes to sign-in and comes back to finish the add.
    const work = await rows.first().locator('.free-add').getAttribute('data-work')
    await rows.first().locator('.free-add').click()
    await page.waitForURL(/\/sign-in/)
    const returnTo = new URL(page.url()).searchParams.get('returnTo')
    expect(returnTo).toBe(`/library?add=${encodeURIComponent(work!)}`)
  })

  test('"faust": Goethe and Marlowe, no Max Brand westerns, and not the Faust already in Tinct', async ({ page }) => {
    await prepare(page, { internal: true, signedIn: false })
    await search(page, 'faust')
    const results = page.locator('#search-results')
    await expect(results.locator('.free-group .search-group-head')).toHaveText('Not yet in Tinct', { timeout: 60_000 })
    expect(await results.locator('.search-result span').allTextContents()).toContain('Faust, Part One')
    const lines = await results.locator('.free-row .free-line').allTextContents()
    expect(lines.length).toBeGreaterThan(0)
    expect(lines.filter(line => /Max Brand/.test(line))).toEqual([])
    expect(lines).toContain('The Tragical History of Doctor Faustus · Christopher Marlowe')
    expect(lines.some(line => /^Faust\b.* · Johann Wolfgang von Goethe$/.test(line))).toBe(true)
    // Tinct's own Faust, Part One (Bayard Taylor, Gutenberg 14591) is not offered again.
    expect(lines.filter(line => /^Faust \[part 1\]\. Translated Into English in the Original Metres/.test(line) || /^Faust — Part 1 ·/.test(line))).toEqual([])
    await shot(page, 'search-faust')
  })

  test('adding: the Add button is a spinner, the row dims and shows each step, then the existing error copy', async ({ page }) => {
    await prepare(page, { internal: true, signedIn: true, importWork: SLOW_IMPORT })
    await search(page, 'austen')
    const results = page.locator('#search-results')
    await expect(results.locator('.free-group .search-group-head')).toHaveText('Not yet in Tinct', { timeout: 60_000 })
    const row = results.locator('.free-row').first()
    const add = row.locator('.free-add')
    const label = await add.getAttribute('aria-label')
    const box = await add.boundingBox()
    await add.click()
    await expect(add).toHaveAttribute('aria-busy', 'true')
    await expect(add).toBeDisabled()
    await expect(add.locator('svg.add-spinner')).toBeVisible()
    await expect(add).toHaveAttribute('aria-label', label!)
    await expect(row).toHaveClass(/is-adding/)
    // The button keeps its size; no new words appear on screen.
    const busyBox = await add.boundingBox()
    expect(Math.abs(busyBox!.width - box!.width)).toBeLessThan(1.5)
    // "Adding…" (the existing copy) is there for screen readers only.
    const spoken = add.locator('.sr-only')
    await expect(spoken).toHaveText('Adding…')
    expect((await spoken.boundingBox())!.width).toBeLessThanOrEqual(1)
    const progress = row.locator('.free-progress')
    const step = async (stage: string) => { await page.evaluate(() => (window as unknown as { __importStep: () => void }).__importStep()); await expect(progress).toHaveAttribute('data-stage', stage) }
    await step('download')
    await step('convert')
    await shot(page, 'add-in-progress')
    // Every other Add waits while one book is being added.
    await results.locator('.free-row').nth(1).locator('.free-add').click()
    await expect(results.locator('.free-row.is-adding')).toHaveCount(1)
    await step('publish')
    await page.evaluate(() => (window as unknown as { __importStep: () => void }).__importStep())
    await expect(page.locator('#notice')).toHaveText('This book could not be added. Please try again.')
    await expect(add).toHaveText('Add')
    await expect(add).toBeEnabled()
    await expect(add).not.toHaveAttribute('aria-busy', 'true')
    await expect(row).not.toHaveClass(/is-adding/)
    await expect(row.locator('.free-progress')).toHaveCount(0)
  })

  test('internal flag off: the search is the library as before', async ({ page }) => {
    await prepare(page, { internal: false, signedIn: false })
    await search(page, 'austen')
    const results = page.locator('#search-results')
    await expect(results.locator('.search-result').first()).toBeVisible()
    await page.waitForTimeout(1500)
    await expect(results.locator('.search-group-head, .free-group, .file-box')).toHaveCount(0)
    expect(await results.locator('.search-result span').allTextContents()).not.toContain('Emma')
    await shot(page, 'search-internal-off')
  })
})

test.describe('My shelf', () => {
  const openShelf = async (page: Page) => {
    await page.locator('#menu-toggle').click()
    await page.locator('[data-collection="saved"]').click()
    await expect(page.locator('#collection-title')).toHaveText('My shelf')
  }

  test('internal flag on: own books under Currently reading and Your own books, ending with the + tile', async ({ page }) => {
    await prepare(page, { internal: true, signedIn: true })
    await openShelf(page)
    const grid = page.locator('#collection-books')
    await expect(grid.locator('.my-books-head', { hasText: 'Your own books' })).toBeVisible()
    await expect(grid.locator('.own-book')).toHaveCount(3) // one being read (also under Currently reading) + two own
    const heads = await grid.locator('.my-books-head').allTextContents()
    expect(heads[0]).toBe('Currently reading')
    expect(heads.at(-1)).toBe('Your own books')
    await expect(grid.locator('.collection-card').last()).toHaveClass(/add-file-card/)
    await expect(grid.locator('.add-file-tile')).toHaveAttribute('href', '/lab/addbook/')
    await expect(grid.locator('.add-file-tile')).toContainText('Add a PDF or EPUB')
    await expect(page.locator('#collection input, #collection [type="search"]')).toHaveCount(0)
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    await shot(page, 'myshelf-internal-on')
  })

  test('internal flag off: My shelf as before', async ({ page }) => {
    await prepare(page, { internal: false, signedIn: true })
    await openShelf(page)
    await page.waitForTimeout(1000)
    await expect(page.locator('#collection-books .own-book, #collection-books .add-file-card')).toHaveCount(0)
    await expect(page.locator('#collection-books .my-books-head', { hasText: 'Your own books' })).toHaveCount(0)
    await shot(page, 'myshelf-internal-off')
  })
})
