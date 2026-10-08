import { expect, test, type Page } from '@playwright/test'
import { mkdirSync } from 'node:fs'
import { join } from 'node:path'

/**
 * Add to Tinct (approved D1/D2, 2026-10-06) in the library: the search's
 * "Available in Tinct" / "Not yet in Tinct" groups with Add and the file box,
 * and My shelf's "Your own books" with "+ Add a book" and the + tile. Signed in
 * (any account) or the internal flag: shown; signed out: the library exactly as
 * before, with no Add and no sign-in prompt for it. The session is mocked (the
 * signed-in cookie and a cached Supabase user); the page's sign-in and sign-out
 * without a reload is the reading bridge's `library2:auth` event, dispatched
 * here as the bridge does. The catalogue search is the real Add a
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


/** An import that fails at once (the add engine is a stub); each call is counted in window.__imports. */
const FAILING_IMPORT = `async()=>{window.__imports=(window.__imports||0)+1;return {ok:false,reason:'failed'};}`
/** A slow import: it reports each step when the page asks (window.__importStep()), then fails. */
const SLOW_IMPORT = `async(id,options)=>{window.__imports=(window.__imports||0)+1;const stages=['download','convert','publish'];await new Promise(done=>{window.__importStep=()=>{const next=stages.shift();if(next)options?.onStage?.(next);else done();};});return {ok:false,reason:'failed'};}`

async function prepare(page: Page, { internal, signedIn, premium = true, importWork = FAILING_IMPORT, query = 'view=new' }: { internal: boolean; signedIn: boolean; premium?: boolean; importWork?: string; query?: string }) {
  // Only the local dev server: no outside service (accounts, fonts, analytics) is reached.
  await page.route(url => !['localhost', '127.0.0.1'].includes(url.hostname), route => route.abort())
  await page.route('**/api/public-books', route => route.fulfill({ json: { books: [ADDED] } }))
  await page.route('**/api/events**', route => route.fulfill({ status: 204, body: '' }))
  await page.route('**/lab/library-add.js**', route => route.fulfill({
    contentType: 'text/javascript',
    body: `window.__tinctLibraryAdd={ownBooks:async()=>${JSON.stringify(OWN_BOOKS)},canAdd:async()=>${premium},importWork:${importWork}};`,
  }))
  await page.route('**/sign-in**', route => route.fulfill({ contentType: 'text/html', body: '<!doctype html><title>Sign in</title><p>Sign in</p>' }))
  if (signedIn) {
    await page.context().addCookies([{ name: 'tinct_auth', value: '1', url: test.info().project.use.baseURL || process.env.BASE_URL || 'http://localhost:5173' }])
    // A stored session Supabase accepts without a network call (when the dev server has a
    // project configured, the reading bridge reads it and keeps the page signed in).
    const project = process.env.VITE_SUPABASE_URL ? new URL(process.env.VITE_SUPABASE_URL).hostname.split('.')[0] : 'local'
    const exp = Math.floor(Date.now() / 1000) + 3600
    const b64 = (value: object) => Buffer.from(JSON.stringify(value)).toString('base64url')
    const user = { id: USER, aud: 'authenticated', role: 'authenticated', email: 'reader@example.com', app_metadata: {}, user_metadata: {}, created_at: '2026-10-01T00:00:00Z' }
    const session = { access_token: `${b64({ alg: 'HS256', typ: 'JWT' })}.${b64({ sub: USER, exp, role: 'authenticated' })}.fixture`, refresh_token: 'fixture', token_type: 'bearer', expires_in: 3600, expires_at: exp, user }
    await page.addInitScript(({ key, session }) => { try { localStorage.setItem(key, JSON.stringify(session)) } catch { /* private */ } }, { key: `sb-${project}-auth-token`, session })
  }
  await page.goto(`/library?${query}&internal=${internal ? 1 : 0}`, { waitUntil: 'domcontentloaded' })
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

/** Each "Not yet in Tinct" row as "Title · Author" (the title line and the author's name on the line under it). */
async function freeLines(page: Page) {
  return page.locator('#search-results .free-row').evaluateAll(rows => rows.map(row => `${row.querySelector('.row-title')?.textContent} · ${row.querySelector('.row-by')?.textContent}`))
}

/** As the reading bridge does when Supabase signs the reader in or out on this page. */
async function setAuth(page: Page, signedIn: boolean) {
  await page.evaluate(value => {
    document.documentElement.classList.toggle('signed-in', value)
    dispatchEvent(new CustomEvent('library2:auth', { detail: { signedIn: value } }))
  }, signedIn)
}

/**
 * A signed-in Premium or trial reader's file entry: the "Your own book" pop-up over the
 * library (no page change), whose button opens the file picker; the chosen file goes on
 * to Add a book's file step (its upload flow, handed the file).
 */
async function expectOwnBookPopUp(page: Page) {
  const dialog = page.locator('[data-testid="own-file-dialog"]')
  await expect(dialog).toBeVisible()
  await expect(dialog.locator('[role="dialog"]')).toHaveAttribute('aria-modal', 'true')
  await expect(dialog.locator('h2')).toHaveText('Your own book')
  const choose = dialog.locator('.own-file-choose')
  await expect(choose).toHaveText('Choose a PDF or EPUB')
  await expect(choose).toBeFocused()
  expect(new URL(page.url()).pathname).toBe('/library')
  const [chooser] = await Promise.all([page.waitForEvent('filechooser'), choose.click()])
  await chooser.setFiles({ name: 'notes.epub', mimeType: 'application/epub+zip', buffer: Buffer.from('PK fixture') })
  await page.waitForURL(/\/lab\/addbook\/\?mode=file&handoff=1$/)
}

async function expectNoAddToTinct(page: Page) {
  const results = page.locator('#search-results')
  await expect(results.locator('.search-result').first()).toBeVisible()
  await page.waitForTimeout(1500)
  await expect(results.locator('.search-group-head, .free-group, .free-add, .file-box, .file-add')).toHaveCount(0)
  await expect(page.locator('#search-add-file')).toBeHidden()
  await expect(page.locator('#search-panel')).not.toContainText('Not yet in Tinct')
  await expect(page.locator('#search-panel')).not.toContainText(/sign in/i)
  expect(await results.locator('.search-result span').allTextContents()).not.toContain('Emma')
}

test.describe('library search', () => {
  test('signed in: Available in Tinct, Not yet in Tinct with Add, and the file box', async ({ page }) => {
    await prepare(page, { internal: false, signedIn: true })
    await search(page, 'austen')
    const results = page.locator('#search-results')
    await expect(results.locator('.search-group-head').first()).toHaveText('Available in Tinct')
    await expect(results.locator('.free-group .search-group-head')).toHaveText('Not yet in Tinct', { timeout: 60_000 })
    const titles = await results.locator('.search-result span').allTextContents()
    expect(titles).toContain('Pride and Prejudice')
    expect(titles).toContain('Emma') // an added book is "Available in Tinct", with its paper cover
    const rows = results.locator('.free-row')
    expect(await rows.count()).toBeGreaterThan(0)
    const lines = await freeLines(page)
    expect(lines).not.toContain('Pride and Prejudice · Jane Austen') // the Tinct book itself; adaptations may stay
    expect(lines.some(line => /^Emma ·/.test(line))).toBe(false)
    expect(lines.every(line => line.includes('·'))).toBe(true)
    await expect(rows.first().locator('.source-pill')).toHaveText(/^(Gutenberg|Wikisource|Standard Ebooks)$/)
    await expect(rows.first().locator('.free-add')).toHaveText('Add')
    const file = results.locator('.file-box')
    await expect(file).toContainText('Have it as a file?')
    await expect(file.locator('a')).toHaveAttribute('href', '/lab/addbook/?mode=file')
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    await shot(page, 'search-signed-in')
    // Add runs the add engine (stubbed to fail here): no sign-in detour for a signed-in reader.
    await rows.first().locator('.free-add').click()
    await expect(page.locator('#notice')).toHaveText('This book could not be added. Please try again.')
    expect(page.url()).not.toContain('/sign-in')
    expect(await page.evaluate(() => (window as unknown as { __imports?: number }).__imports)).toBe(1)
  })

  test('"faust": Goethe and Marlowe, no Max Brand westerns, and not the Faust already in Tinct', async ({ page }) => {
    await prepare(page, { internal: false, signedIn: true })
    await search(page, 'faust')
    const results = page.locator('#search-results')
    await expect(results.locator('.free-group .search-group-head')).toHaveText('Not yet in Tinct', { timeout: 60_000 })
    expect(await results.locator('.search-result span').allTextContents()).toContain('Faust, Part One')
    const lines = await freeLines(page)
    expect(lines.length).toBeGreaterThan(0)
    expect(lines.filter(line => /Max Brand/.test(line))).toEqual([])
    expect(lines).toContain('The Tragical History of Doctor Faustus · Christopher Marlowe')
    expect(lines.some(line => /^Faust\b.* · Johann Wolfgang von Goethe$/.test(line))).toBe(true)
    // Tinct's own Faust, Part One (Bayard Taylor, Gutenberg 14591) is not offered again.
    expect(lines.filter(line => /^Faust \[part 1\]\. Translated Into English in the Original Metres/.test(line) || /^Faust — Part 1 ·/.test(line))).toEqual([])
    await shot(page, 'search-faust')
  })

  test('adding: the Add button is a spinner, the row dims and shows each step, then the existing error copy', async ({ page }) => {
    await prepare(page, { internal: false, signedIn: true, importWork: SLOW_IMPORT })
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
    // The Premium check comes first; the import starts once it has answered.
    await expect.poll(() => page.evaluate(() => typeof (window as unknown as { __importStep?: unknown }).__importStep)).toBe('function')
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

  test('the + in the search field opens the "Your own book" pop-up for a PDF or EPUB, clear of Cancel', async ({ page }) => {
    await prepare(page, { internal: false, signedIn: true })
    await page.route(url => url.pathname === '/lab/addbook/', route => route.fulfill({ contentType: 'text/html', body: '<!doctype html><title>Add a book</title>' }))
    await page.locator('#search-toggle').click()
    const plus = page.locator('#search-add-file')
    await expect(plus).toBeVisible()
    await expect(plus).toHaveAttribute('aria-label', 'Add your own book (PDF or EPUB)')
    await expect(plus).toHaveAttribute('href', '/lab/addbook/?mode=file')
    expect((await plus.innerText()).trim()).toBe('')
    const a = (await plus.boundingBox())!, b = (await page.locator('#search-cancel').boundingBox())!, input = (await page.locator('#search-input').boundingBox())!
    expect(a.x + a.width).toBeLessThanOrEqual(b.x)
    expect(input.x + input.width).toBeLessThanOrEqual(a.x + 0.5)
    expect(a.width).toBeGreaterThanOrEqual(40)
    await page.locator('#search-input').fill('austen')
    await expect(page.locator('.file-box a')).toHaveAttribute('href', '/lab/addbook/?mode=file')
    await shot(page, 'search-add-file')
    await plus.click()
    await expectOwnBookPopUp(page)
  })

  test('the librarian orb steps aside while search is open wherever it would cover the results', async ({ page }) => {
    await prepare(page, { internal: false, signedIn: true })
    const orb = page.locator('#librarian')
    await expect(orb).toBeVisible()
    await search(page, 'austen')
    await expect(page.locator('#search-results .free-group .search-group-head')).toHaveText('Not yet in Tinct', { timeout: 60_000 })
    const phone = (page.viewportSize()?.width ?? 0) < 700
    if (phone) {
      await expect(orb).toBeHidden()
      await expect(orb).toHaveAttribute('tabindex', '-1')
      // Nothing of it is left over the Add buttons.
      const add = (await page.locator('.free-row .free-add').first().boundingBox())!
      expect(await page.evaluate(([x, y]) => document.elementFromPoint(x, y)?.closest('.free-add') !== null, [add.x + add.width - 2, add.y + add.height / 2])).toBe(true)
      await shot(page, 'search-orb-away')
    } else {
      // Desktop: the results stop well short of the wall, so the orb stays.
      await expect(orb).toBeVisible()
      const results = (await page.locator('#search-panel .search-content').boundingBox())!, box = (await orb.boundingBox())!
      expect(results.x + results.width).toBeLessThan(box.x)
    }
    await page.locator('#search-cancel').click()
    await expect(orb).toBeVisible()
    await expect(orb).not.toHaveAttribute('tabindex', '-1')
    await expect(orb).not.toHaveAttribute('aria-hidden', 'true')
  })

  test('a typo ("wuthering hights") finds the Tinct book first, and no catalogue copy of it is offered', async ({ page }) => {
    await prepare(page, { internal: false, signedIn: true })
    await search(page, 'wuthering hights')
    const results = page.locator('#search-results')
    await expect(results.locator('.search-result').first()).toContainText('Wuthering Heights')
    await expect(page.locator('#search-label')).toHaveText('1 book found')
    await expect(results.locator('.free-group')).not.toHaveAttribute('data-free-group', 'pending', { timeout: 60_000 })
    const lines = await freeLines(page)
    expect(lines.filter(line => /^(The )?Wuthering Heights\b.* · Emily Brontë$/.test(line))).toEqual([])
    await shot(page, 'search-typo')
  })

  test('signed out: the search is the library as before, with no Add and no sign-in prompt', async ({ page }) => {
    await prepare(page, { internal: false, signedIn: false })
    await search(page, 'austen')
    await expectNoAddToTinct(page)
    await shot(page, 'search-signed-out')
  })

  test('signed out: a typo still finds the Tinct book, with no "Not yet in Tinct"', async ({ page }) => {
    await prepare(page, { internal: false, signedIn: false })
    await search(page, 'wuthering hights')
    await expect(page.locator('#search-results .search-result').first()).toContainText('Wuthering Heights')
    await expectNoAddToTinct(page)
    await shot(page, 'search-signed-out-typo')
  })

  test('signed out with the internal flag: shown for Tinct\'s own testing', async ({ page }) => {
    await prepare(page, { internal: true, signedIn: false })
    await search(page, 'austen')
    await expect(page.locator('#search-results .free-group .search-group-head')).toHaveText('Not yet in Tinct', { timeout: 60_000 })
    await expect(page.locator('#search-results .file-box')).toBeVisible()
    await expect(page.locator('#search-add-file')).toBeVisible()
  })

  test('signing in and out on the page updates the open search without a reload', async ({ page }) => {
    await prepare(page, { internal: false, signedIn: false })
    await search(page, 'austen')
    await expectNoAddToTinct(page)
    const results = page.locator('#search-results')
    await setAuth(page, true)
    await expect(results.locator('.free-group .search-group-head')).toHaveText('Not yet in Tinct', { timeout: 60_000 })
    await expect(results.locator('.file-box')).toBeVisible()
    await expect(page.locator('#search-add-file')).toBeVisible()
    await expect(page.locator('#sign-in')).toHaveText('Account')
    await setAuth(page, false)
    await expect(results.locator('.search-group-head, .free-group, .file-box')).toHaveCount(0)
    await expect(page.locator('#search-add-file')).toBeHidden()
    await expect(page.locator('#sign-in')).toHaveText('Sign in')
  })
})

test.describe('search layout (approved 2026-10-08)', () => {
  test('"seneca": an author card, no empty "Available in Tinct", rows with a source pill left of Add, details open in place', async ({ page }) => {
    await prepare(page, { internal: false, signedIn: true })
    await search(page, 'seneca')
    const results = page.locator('#search-results')
    await expect(results.locator('.free-group .search-group-head')).toHaveText('Not yet in Tinct', { timeout: 60_000 })
    // Nothing of Seneca's is in Tinct: that heading and its line are left out.
    await expect(results.locator('.search-group-head')).toHaveText(['Not yet in Tinct'])
    await expect(results.locator('.search-none')).toHaveCount(0)
    const card = results.locator('.author-card')
    await expect(card).toBeVisible()
    await expect(card.locator('.author-name')).toHaveText('Seneca')
    await expect(card.locator('.author-subtitle')).toHaveText('4 BC – AD 65')
    const chips = card.locator('.author-work')
    expect(await chips.count()).toBeGreaterThan(1)
    expect(await chips.count()).toBeLessThanOrEqual(5)
    // Best-known first: the Moral Letters, then a work inside Minor Dialogues (its Wikidata fame), which opens that row.
    expect((await chips.allTextContents()).slice(0, 2)).toEqual(['Moral letters to Lucilius', 'On the Shortness of Life'])
    await expect(chips.nth(1)).toHaveAttribute('data-row-key', 'work:pg:64576')
    const row = results.locator('.free-row').first()
    const pill = row.locator('.source-pill')
    await expect(pill).toHaveText(/^(Gutenberg|Wikisource)$/)
    const add = row.locator('.free-add')
    const [p, a] = [(await pill.boundingBox())!, (await add.boundingBox())!]
    expect(p.x + p.width).toBeLessThanOrEqual(a.x)
    expect(a.x - (p.x + p.width)).toBeLessThan(24)
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    await shot(page, 'search-layout-seneca')
    // Tapping the row (not Add) opens its details in place; Add stays where it was.
    const toggle = row.locator('.row-toggle')
    await expect(toggle).toHaveAttribute('aria-expanded', 'false')
    await toggle.click()
    await expect(toggle).toHaveAttribute('aria-expanded', 'true')
    await expect(row.locator('.row-details')).toBeVisible()
    await expect(row.locator('.row-details dt').first()).toBeVisible()
    const after = (await add.boundingBox())!
    expect(Math.abs(after.x - a.x)).toBeLessThan(1)
    expect(Math.abs(after.y - a.y)).toBeLessThan(1)
    expect(await row.evaluate(element => Math.round(element.getBoundingClientRect().width))).toBe(await results.locator('.free-list').evaluate(element => Math.round(element.getBoundingClientRect().width)))
    await shot(page, 'search-layout-seneca-open')
    // Escape closes the details, not the search.
    await page.keyboard.press('Escape')
    await expect(toggle).toHaveAttribute('aria-expanded', 'false')
    await expect(page.locator('#search-panel')).toBeVisible()
    // A chip opens its work's row.
    await chips.nth(1).click()
    const key = await chips.nth(1).getAttribute('data-row-key')
    await expect(results.locator(`.result-row[data-row-key="${key}"] .row-toggle`)).toHaveAttribute('aria-expanded', 'true')
  })

  test('"plato": the author card with the portrait and books in Tinct, Tinct rows with edition pills and Read', async ({ page }) => {
    await prepare(page, { internal: false, signedIn: true })
    await search(page, 'plato')
    const results = page.locator('#search-results')
    await expect(results.locator('.free-group .search-group-head')).toHaveText('Not yet in Tinct', { timeout: 60_000 })
    await expect(results.locator('.search-group-head')).toHaveText(['Available in Tinct', 'Not yet in Tinct'])
    const card = results.locator('.author-card')
    await expect(card.locator('.author-name')).toHaveText('Plato')
    await expect(card.locator('.author-subtitle')).toHaveText(/^428–348 BC · \d+ books in Tinct$/)
    await expect(card.locator('.author-portrait img')).toHaveAttribute('src', /plato/)
    await expect(card.locator('.author-work').first()).toHaveText('The Republic')
    const row = results.locator('.tinct-row').first()
    await expect(row.locator('.row-title')).toHaveText('The Republic')
    await expect(row.locator('.row-author')).toHaveText('Plato · tr. Benjamin Jowett')
    await expect(row.locator('.source-pill')).toHaveText(['Modern English', 'Audio'])
    await expect(row.locator('.tinct-open')).toHaveText('Read')
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    await page.waitForTimeout(800) // the covers paint
    await shot(page, 'search-layout-plato')
    // Keyboard: the row is a button with aria-expanded.
    await row.locator('.row-toggle').focus()
    await page.keyboard.press('Enter')
    await expect(row.locator('.row-toggle')).toHaveAttribute('aria-expanded', 'true')
    await expect(row.locator('.row-description')).toBeVisible()
    await shot(page, 'search-layout-plato-open')
    await page.keyboard.press('Enter')
    await expect(row.locator('.row-toggle')).toHaveAttribute('aria-expanded', 'false')
    // Read opens the book, as its cover did.
    await row.locator('.tinct-open').click()
    await expect(page.locator('#book-overlay')).toBeVisible()
  })

  test('"seneca on anger", "seneca medea": the collection that holds the work, first, saying "Includes <work>"', async ({ page }) => {
    await prepare(page, { internal: false, signedIn: true })
    await search(page, 'seneca on anger')
    const results = page.locator('#search-results')
    await expect(results.locator('.free-group .search-group-head')).toHaveText('Not yet in Tinct', { timeout: 60_000 })
    const first = results.locator('.free-row').first()
    await expect(first.locator('.row-title')).toHaveText('Minor Dialogues, Together With the Dialogue on Clemency')
    await expect(first.locator('.row-includes')).toHaveText(' · Includes On Anger')
    await expect(results.locator('.author-card')).toHaveCount(0)
    await shot(page, 'search-layout-seneca-on-anger')
    await page.locator('#search-input').fill('seneca medea')
    await expect(results.locator('.free-row').first().locator('.row-title')).toHaveText('The Tragedies of Seneca', { timeout: 60_000 })
    await expect(results.locator('.free-row').first().locator('.row-includes')).toHaveText(' · Includes Medea')
    await page.locator('#search-input').fill('seneca letters from a stoic')
    await expect(results.locator('.free-row').first().locator('.row-title')).toHaveText('Moral letters to Lucilius', { timeout: 60_000 })
  })

  test('the × at the start of the search bar closes search, as Cancel does', async ({ page }) => {
    await prepare(page, { internal: false, signedIn: false })
    await page.locator('#search-toggle').click()
    const close = page.locator('#search-close')
    await expect(close).toBeVisible()
    await expect(close).toHaveAttribute('aria-label', 'Close search')
    const [x, input] = [(await close.boundingBox())!, (await page.locator('#search-input').boundingBox())!]
    expect(x.x + x.width).toBeLessThanOrEqual(input.x)
    await close.click()
    await expect(page.locator('#search-panel')).toBeHidden()
    await expect(page.locator('#search-toggle')).toBeFocused()
  })
})

test.describe('librarian orb', () => {
  test('a book\'s introduction: the orb steps aside on a phone, where it would cover Begin reading, and is back in the library', async ({ page }) => {
    await prepare(page, { internal: false, signedIn: false })
    const orb = page.locator('#librarian')
    await expect(orb).toBeVisible()
    await page.waitForTimeout(1500)
    await page.locator('#shelves button.cover-button').nth(2).click()
    await expect(page.locator('#book-overlay')).toBeVisible()
    // Phone: the tour slip comes first; Continue to the introduction.
    await page.waitForTimeout(2500)
    for (let i = 0; i < 6 && await page.locator('#slip-next').isVisible(); i++) { await page.locator('#slip-next').click(); await page.waitForTimeout(900) }
    await expect(page.locator('#slip-next')).toBeHidden()
    await expect(page.locator('#begin-reading')).toBeVisible()
    const phone = (page.viewportSize()?.width ?? 0) < 700
    if (phone) {
      await expect(orb).toBeHidden()
      await expect(orb).toHaveAttribute('tabindex', '-1')
      await shot(page, 'intro-orb-away')
    } else {
      await expect(orb).toBeVisible()
    }
    await page.keyboard.press('Escape')
    await expect(page.locator('#book-overlay')).toBeHidden({ timeout: 15_000 })
    await expect(orb).toBeVisible()
  })
})

test.describe('Premium (adding books is Premium or the 30-day trial)', () => {
  test('free account past its trial: sees Not yet in Tinct, but Add and the file entries lead to the Premium offer, never an import', async ({ page }) => {
    await prepare(page, { internal: false, signedIn: true, premium: false })
    await search(page, 'austen')
    const results = page.locator('#search-results')
    await expect(results.locator('.free-group .search-group-head')).toHaveText('Not yet in Tinct', { timeout: 60_000 })
    await shot(page, 'search-free-account')
    await results.locator('.free-row .free-add').first().click()
    await page.waitForURL(/\/sign-in\?mode=account/)
    expect(new URL(page.url()).searchParams.get('returnTo')).toBe('/library')
    // The file box leads there too.
    await page.goBack()
    await search(page, 'austen')
    await page.locator('#search-results .file-box a').click()
    await page.waitForURL(/\/sign-in\?mode=account/)
    // And the + in the search field.
    await page.goBack()
    await page.locator('#search-toggle').click()
    await page.locator('#search-add-file').click()
    await page.waitForURL(/\/sign-in\?mode=account/)
  })

  test('Premium or trial: the file box opens the "Your own book" pop-up, then Add a book\'s file step', async ({ page }) => {
    await prepare(page, { internal: false, signedIn: true, premium: true })
    await page.route(url => url.pathname === '/lab/addbook/', route => route.fulfill({ contentType: 'text/html', body: '<!doctype html><title>Add a book</title>' }))
    await page.locator('#search-toggle').click()
    await expect(page.locator('#search-results .file-box a')).toHaveAttribute('href', '/lab/addbook/?mode=file')
    await page.locator('#search-results .file-box a').click()
    await expectOwnBookPopUp(page)
  })
})

test.describe('My shelf', () => {
  const openShelf = async (page: Page) => {
    await page.locator('#menu-toggle').click()
    await page.locator('[data-collection="saved"]').click()
    await expect(page.locator('#collection-title')).toHaveText('My shelf')
  }

  test('signed in: + Add a book and the + file tile first, then own books under Currently reading and Your own books', async ({ page }) => {
    await prepare(page, { internal: false, signedIn: true })
    await openShelf(page)
    const grid = page.locator('#collection-books')
    await expect(grid.locator('.my-books-head', { hasText: 'Your own books' })).toBeVisible()
    await expect(grid.locator('.own-book')).toHaveCount(3) // one being read (also under Currently reading) + two own
    const heads = await grid.locator('.my-books-head').allTextContents()
    expect(heads[0]).toBe('Currently reading')
    expect(heads.at(-1)).toBe('Your own books')
    // The add tiles are the first things on My shelf: + Add a book, then the file step.
    await expect(grid.locator(':scope > *').nth(0)).toHaveClass(/add-book-card/)
    await expect(grid.locator(':scope > *').nth(1)).toHaveClass(/add-file-card/)
    await expect(grid.locator('.add-file-card .add-file-tile')).toHaveAttribute('href', '/lab/addbook/?mode=file')
    await expect(grid.locator('.add-file-card .add-file-tile')).toContainText('Add a PDF or EPUB')
    // The reader's own EPUB opens in the reader.
    await expect(grid.locator('.own-book a').first()).toHaveAttribute('href', '/reader?userBook=aaaaaaaaaaaaaaaaaaaaaaaa')
    const addBook = grid.locator('.add-book-tile')
    await expect(addBook).toHaveText('+Add a book')
    await expect(page.locator('#collection input, #collection [type="search"]')).toHaveCount(0)
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    await shot(page, 'myshelf-signed-in')
    // + Add a book opens the library search, with the file box.
    await addBook.click()
    await expect(page.locator('#search-panel')).toBeVisible()
    await expect(page.locator('#search-results .file-box')).toContainText('Have it as a file?')
    await expect(page.locator('#search-input')).toBeFocused()
    await shot(page, 'myshelf-add-a-book-search')
  })

  test('free account past its trial: own books still open in the reader; the + file tile leads to the Premium offer', async ({ page }) => {
    await prepare(page, { internal: false, signedIn: true, premium: false })
    await openShelf(page)
    const grid = page.locator('#collection-books')
    await expect(grid.locator('.own-book')).toHaveCount(3)
    await expect(grid.locator('.own-book a').first()).toHaveAttribute('href', '/reader?userBook=aaaaaaaaaaaaaaaaaaaaaaaa')
    await grid.locator('.add-file-card .add-file-tile').click()
    await page.waitForURL(/\/sign-in\?mode=account/)
  })

  test('books being read can be removed; finished books cannot', async ({ page }) => {
    // The sample returning reader: five books being read, two finished.
    await prepare(page, { internal: false, signedIn: true, query: 'demo=reading' })
    await openShelf(page)
    const grid = page.locator('#collection-books')
    await expect(grid.locator('[data-shelf-group="finished"]')).toHaveCount(2)
    const reading = grid.locator('[data-shelf-group="reading"]')
    expect(await reading.count()).toBeGreaterThan(0)
    await expect(reading.locator('[data-shelf-remove]')).toHaveCount(await reading.count())
    await expect(reading.first().locator('[data-shelf-remove]')).toHaveAttribute('aria-label', /^Remove from My shelf: /)
    await expect(grid.locator('[data-shelf-group="finished"] .save-toggle, [data-shelf-group="finished"] [data-shelf-remove]')).toHaveCount(0)
  })

  test('a finished book removed earlier is shown again; a book saved for later keeps its ×', async ({ page }) => {
    // This device as a guest: Hamlet finished, then removed from My shelf (the old ×); the Odyssey saved for later.
    const removal = JSON.stringify({ items: { hamlet: { saved: false, at: Date.now() - 60_000 }, odyssey: { saved: true, at: Date.now() - 30_000 } }, pending: {} })
    await page.addInitScript(value => {
      try { localStorage.setItem('tinct:book-completed:hamlet', JSON.stringify({ bookId: 'hamlet' })); localStorage.setItem('tinct:library-2-saved:guest', value) } catch { /* private */ }
    }, removal)
    await prepare(page, { internal: false, signedIn: false })
    await openShelf(page)
    const finished = page.locator('#collection-books [data-shelf-group="finished"]')
    await expect(finished).toHaveCount(1, { timeout: 20_000 })
    await expect(finished.locator('h2')).toHaveText('Hamlet')
    await expect(finished.locator('[data-shelf-remove], .save-toggle')).toHaveCount(0)
    const saved = page.locator('#collection-books [data-shelf-group="want"]')
    await expect(saved).toHaveCount(1)
    await expect(saved.locator('[data-shelf-remove]')).toHaveAttribute('aria-label', 'Remove from My shelf: The Odyssey')
    expect(await page.evaluate(() => localStorage.getItem('tinct:library-2-saved:guest'))).toBe(removal)
  })

  test('signed out: My shelf as before', async ({ page }) => {
    await prepare(page, { internal: false, signedIn: false })
    await openShelf(page)
    await page.waitForTimeout(1000)
    await expect(page.locator('#collection-books .own-book, #collection-books .add-file-card, #collection-books .add-book-card')).toHaveCount(0)
    await expect(page.locator('#collection-books .my-books-head', { hasText: 'Your own books' })).toHaveCount(0)
    await shot(page, 'myshelf-signed-out')
  })
})
