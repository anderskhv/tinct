import { expect, test, type Page } from '@playwright/test'
import { mkdirSync } from 'node:fs'
import { join } from 'node:path'

/**
 * Add to Tinct, then "Also get it in Modern English?" (Anders, 2026-10-08): right
 * after a catalogue book is added, the library asks for its Modern English status
 * and, only when nobody has bought it and the Worker offers it, asks the reader.
 * The Worker routes are stubs (the status and the checkout), and the add engine is
 * a stub (as in library-add-to-tinct.spec.ts) whose import succeeds at once and whose
 * modernStatus / buyModern call those stubbed routes, so nothing is imported or paid.
 * /reader and Stripe Checkout are stub pages.
 *
 * Run: BASE_URL=http://localhost:5173 PW_CHROMIUM_EXECUTABLE=/opt/pw-browsers/chromium npx playwright test -c e2e/playwright.library-add.config.ts library-modern-offer
 * ARTIFACT_DIR=<dir> saves a screenshot of each state.
 */
const ARTIFACT_DIR = process.env.ARTIFACT_DIR || ''
const USER = '11111111-1111-4111-8111-111111111111'
const BOOK = 'pd-pg-158'
const ADDED = {
  id: BOOK, title: 'Emma', author: 'Jane Austen', summary: 'Public-domain text from Project Gutenberg.', blurb: 'Public-domain text from Project Gutenberg.',
  displayYear: '1815', wordCount: 160000, cover: { kind: 'generated', background: '#2c2417', accent: '#e9dfc4' }, art: null, paper: true,
  shelfIds: ['english-novels'], houseIds: ['novel'], form: 'novel', era: 'modern', year: 1815, topics: [],
  placement: [{ houseId: 'novel', houseTitle: 'Fiction', houseSubtitle: 'Novels and stories, by tradition', houseHue: 25, shelfId: 'english-novels', shelfTitle: '19th-Century English Novels', shelfSubtitle: 'Austen to Conrad', shelfHue: 265 }],
  editions: [{ key: 'original-en', language: 'en', style: 'original', label: 'Original', translator: null, year: 1815, aligned: false, group: 'human', provenance: 'published-edition', provenanceLabel: 'Published public-domain edition', availability: { chapterText: true, audio: false, compare: false }, discoveryAvailable: true }],
  defaultEditionKey: 'original-en', defaultCompareEditionKey: null, availability: { cover: true, chapterText: true, audio: false, compare: false, optionalPreface: false },
  readingStructure: { totalParagraphs: 10, chapters: [{ number: 1, title: 'Chapter I', paragraphCount: 10 }] }, discoveryAvailable: true, catalogueIndex: 100000,
  public: { workId: 'pg:158', source: 'Gutenberg', sourceName: 'Project Gutenberg', sourceUrl: null, licence: 'Public domain', addedAt: '2026-10-06T00:00:00Z' },
}
const NONE = { state: 'none', chapters: {}, offer: { tier: 2, cents: 499 } }
const CHECKOUT = 'https://checkout.stripe.com/c/pay/cs_test_modern'

type Status = { json?: unknown; status?: number; delayMs?: number }

async function prepare(page: Page, modern: Status) {
  await page.route(url => !['localhost', '127.0.0.1'].includes(url.hostname), route => route.abort())
  await page.route('https://checkout.stripe.com/**', route => route.fulfill({ contentType: 'text/html', body: '<!doctype html><title>Checkout</title><p>Stripe Checkout (stub)</p>' }))
  await page.route('**/api/public-books', route => route.fulfill({ json: { books: [] } }))
  await page.route('**/api/events**', route => route.fulfill({ status: 204, body: '' }))
  await page.route(`**/api/public-books/${BOOK}/modern-en`, async route => {
    if (modern.delayMs) await new Promise(resolve => setTimeout(resolve, modern.delayMs))
    await route.fulfill({ status: modern.status ?? 200, json: modern.json ?? {} }).catch(() => {})
  })
  await page.route(`**/api/public-books/${BOOK}/modern-en/checkout`, route => route.fulfill({ json: { url: CHECKOUT } }))
  // The add engine: the import succeeds at once; Modern English as libraryAdd.ts asks it (status, then checkout + the pending mark).
  await page.route('**/lab/library-add.js**', route => route.fulfill({
    contentType: 'text/javascript',
    body: `window.__tinctLibraryAdd={ownBooks:async()=>[],canAdd:async()=>true,
      importWork:async(id,options)=>{window.__imports=(window.__imports||0)+1;options?.onStage?.('publish');return {ok:true,bookId:${JSON.stringify(BOOK)},entry:${JSON.stringify(ADDED)},existed:false};},
      modernStatus:async id=>{try{const r=await fetch('/api/public-books/'+encodeURIComponent(id)+'/modern-en',{cache:'no-store'});return r.ok?await r.json():null;}catch{return null;}},
      buyModern:async(id,chapter)=>{const r=await fetch('/api/public-books/'+encodeURIComponent(id)+'/modern-en/checkout',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer fixture'},body:JSON.stringify({chapter})});const d=await r.json();if(!r.ok||!d.url)throw new Error('checkout');sessionStorage.setItem('tinct:modern-purchase',id);window.__checkoutBody=JSON.stringify({chapter});return d.url;}};`,
  }))
  await page.route(/\/reader(\?|$)/, route => route.fulfill({ contentType: 'text/html', body: '<!doctype html><title>Reader</title><p>Reader (stub)</p>' }))
  await page.route('**/sign-in**', route => route.fulfill({ contentType: 'text/html', body: '<!doctype html><title>Sign in</title><p>Sign in</p>' }))
  await page.context().addCookies([{ name: 'tinct_auth', value: '1', url: test.info().project.use.baseURL || process.env.BASE_URL || 'http://localhost:5173' }])
  const exp = Math.floor(Date.now() / 1000) + 3600
  const b64 = (value: object) => Buffer.from(JSON.stringify(value)).toString('base64url')
  const user = { id: USER, aud: 'authenticated', role: 'authenticated', email: 'reader@example.com', app_metadata: {}, user_metadata: {}, created_at: '2026-10-01T00:00:00Z' }
  const session = { access_token: `${b64({ alg: 'HS256', typ: 'JWT' })}.${b64({ sub: USER, exp, role: 'authenticated' })}.fixture`, refresh_token: 'fixture', token_type: 'bearer', expires_in: 3600, expires_at: exp, user }
  // A stored session Supabase accepts without a network call (as library-add-to-tinct.spec.ts), so the page stays signed in.
  const project = process.env.VITE_SUPABASE_URL ? new URL(process.env.VITE_SUPABASE_URL).hostname.split('.')[0] : 'local'
  await page.addInitScript(({ key, session }) => { try { localStorage.setItem(key, JSON.stringify(session)); localStorage.removeItem('tinct:internal') } catch { /* private */ } }, { key: `sb-${project}-auth-token`, session })
  // Whether the question ever showed, kept across the navigation to the book.
  await page.addInitScript(() => {
    new MutationObserver(() => { if (document.querySelector('.modern-ask-layer')) sessionStorage.setItem('e2e:modern-ask-seen', '1') })
      .observe(document, { childList: true, subtree: true })
  })
  await page.goto('/library?view=new&internal=0', { waitUntil: 'domcontentloaded' })
  await expect(page.locator('#search-toggle')).toBeVisible()
  await page.locator('#search-toggle').click()
  await page.locator('#search-input').fill('austen')
  await expect(page.locator('#search-results .free-group .search-group-head')).toHaveText('Not yet in Tinct', { timeout: 60_000 })
}

async function shot(page: Page, name: string) {
  if (!ARTIFACT_DIR) return
  mkdirSync(ARTIFACT_DIR, { recursive: true })
  await page.screenshot({ path: join(ARTIFACT_DIR, `${name}-${test.info().project.name}.png`) })
}

const add = (page: Page) => page.locator('#search-results .free-row .free-add').first().click()
const dialog = (page: Page) => page.locator('[data-testid="modern-ask"]')

test.describe('Modern English, asked right after an add', () => {
  test('no edition yet, with an offer: asked; Not now opens the book as before', async ({ page }) => {
    await prepare(page, { json: NONE })
    await add(page)
    await expect(dialog(page)).toBeVisible()
    await expect(dialog(page).locator('h2')).toHaveText('Also get it in Modern English?')
    await expect(dialog(page).locator('p')).toHaveText('A Modern English edition is written for you chapter by chapter, and anyone who adds this book later reads it too.')
    await expect(dialog(page).locator('button')).toHaveText(['Not now', 'Get Modern English · $4.99'])
    const box = await dialog(page).locator('[role="dialog"]').boundingBox()
    expect(box && box.x >= 0 && box.x + box.width <= (page.viewportSize()?.width ?? 0)).toBe(true)
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    await shot(page, 'modern-ask')
    await dialog(page).locator('.modern-ask-later').click()
    await page.waitForURL(url => url.pathname === '/reader')
    expect(await page.evaluate(() => sessionStorage.getItem('tinct:modern-purchase'))).toBeNull()
    expect(await page.evaluate(() => JSON.parse(sessionStorage.getItem('tinct:lab-reader-handoff') || 'null')?.bookId)).toBe(BOOK)
    expect(await page.evaluate(() => sessionStorage.getItem('e2e:modern-ask-seen'))).toBe('1')
  })

  test('Get Modern English: the reader’s checkout for this book, back to the book afterwards', async ({ page }) => {
    await prepare(page, { json: NONE })
    await add(page)
    await expect(dialog(page)).toBeVisible()
    await dialog(page).locator('.modern-ask-buy').focus()
    await shot(page, 'modern-ask-focus')
    const [request] = await Promise.all([
      page.waitForRequest(r => r.url().endsWith(`/api/public-books/${BOOK}/modern-en/checkout`) && r.method() === 'POST'),
      dialog(page).locator('.modern-ask-buy').click(),
    ])
    expect(request.postDataJSON()).toEqual({ chapter: 1 })
    await page.waitForURL(CHECKOUT)
    await shot(page, 'modern-checkout-stub')
    // Stripe's return (success or cancel) is /reader in this tab: the reader hand-off for this book and the pending mark wait there.
    await page.goto('/reader', { waitUntil: 'domcontentloaded' })
    expect(await page.evaluate(() => sessionStorage.getItem('tinct:modern-purchase'))).toBe(BOOK)
    expect(await page.evaluate(() => JSON.parse(sessionStorage.getItem('tinct:lab-reader-handoff') || 'null')?.bookId)).toBe(BOOK)
  })

  for (const [name, status] of [
    ['already bought (paid)', { json: { state: 'paid', chapters: { 1: 'ready' }, offer: null } }],
    ['already complete', { json: { state: 'complete', chapters: {}, offer: null } }],
    ['no offer', { json: { state: 'none', chapters: {}, offer: null } }],
    ['the status fails', { status: 503, json: { error: 'unavailable' } }],
    ['the status takes over 1.5 s', { json: NONE, delayMs: 4000 }],
  ] as Array<[string, Status]>) {
    test(`${name}: not asked, the book opens`, async ({ page }) => {
      await prepare(page, status)
      const started = Date.now()
      await add(page)
      await page.waitForURL(url => url.pathname === '/reader', { timeout: 10_000 })
      expect(Date.now() - started).toBeLessThan(status.delayMs ? 3500 : 5000)
      expect(await page.evaluate(() => sessionStorage.getItem('e2e:modern-ask-seen'))).toBeNull()
      expect(await page.evaluate(() => JSON.parse(sessionStorage.getItem('tinct:lab-reader-handoff') || 'null')?.bookId)).toBe(BOOK)
    })
  }
})
