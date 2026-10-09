import { expect, test, type Page, type Route } from '@playwright/test'
import { mkdirSync } from 'node:fs'
import { join } from 'node:path'
// @ts-expect-error -- plain .mjs test helper shared with the Add-a-book e2e tests
import { zip } from '../../addbooks/web/test/make-epub.mjs'

/**
 * Add to Tinct, then "Also get it in Modern English?" (Anders, 2026-10-08): right
 * after a catalogue book is added, the library asks for its Modern English status
 * and, only when nobody has bought it and the Worker offers it, asks the reader.
 * The Worker routes are stubs (the status and the checkout), and the add engine is
 * a stub (as in library-add-to-tinct.spec.ts) whose import succeeds at once and whose
 * modernStatus / buyModern call those stubbed routes, so nothing is imported or paid.
 * /reader and Stripe Checkout are stub pages.
 *
 * The timeline test instead runs the real add engine (src/libraryAdd.ts) against stubbed
 * import, source and commit routes with production-like delays, and a slow reading engine.
 *
 * Run: BASE_URL=http://localhost:5173 PW_CHROMIUM_EXECUTABLE=/opt/pw-browsers/chromium npx playwright test -c e2e/playwright.library-add.config.ts library-modern-offer
 * (the timeline test needs a dev server started with a dummy Supabase project, and the same
 * VITE_SUPABASE_URL set for the test run:
 * VITE_SUPABASE_URL=https://local.supabase.co VITE_SUPABASE_ANON_KEY=dummy npx vite --port 5173)
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

/** Stubbed Worker steps of a real add (src/libraryAdd.ts importWork), each after its delay; `at` records when each answered. */
type Timeline = { importMs: number; sourceMs: number; commitMs: number; readingMs: number; bookMs: number; at: Record<string, number> }

function sampleEpub(): Buffer {
  const xhtml = (n: number) => `<?xml version="1.0"?><html xmlns="http://www.w3.org/1999/xhtml"><body><h1>Chapter ${n}</h1>${Array.from({ length: 20 }, (_, i) => `<p>Paragraph ${i + 1} of chapter ${n}: ${'Emma Woodhouse, handsome, clever, and rich, with a comfortable home '.repeat(3)}</p>`).join('')}</body></html>`
  return zip([
    ['mimetype', 'application/epub+zip'],
    ['META-INF/container.xml', '<?xml version="1.0"?><container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container"><rootfiles><rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/></rootfiles></container>'],
    ['OEBPS/content.opf', `<?xml version="1.0"?><package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="id"><metadata xmlns:dc="http://purl.org/dc/elements/1.1/"><dc:identifier id="id">emma</dc:identifier><dc:title>Emma</dc:title><dc:creator>Jane Austen</dc:creator><dc:language>en</dc:language></metadata><manifest><item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/><item id="c1" href="c1.xhtml" media-type="application/xhtml+xml"/><item id="c2" href="c2.xhtml" media-type="application/xhtml+xml"/></manifest><spine><itemref idref="c1"/><itemref idref="c2"/></spine></package>`],
    ['OEBPS/nav.xhtml', '<?xml version="1.0"?><html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops"><body><nav epub:type="toc"><ol><li><a href="c1.xhtml">Chapter 1</a></li><li><a href="c2.xhtml">Chapter 2</a></li></ol></nav></body></html>'],
    ['OEBPS/c1.xhtml', xhtml(1)], ['OEBPS/c2.xhtml', xhtml(2)],
  ])
}

async function prepare(page: Page, modern: Status, timeline: Timeline | null = null) {
  await page.route(url => !['localhost', '127.0.0.1'].includes(url.hostname), route => route.abort())
  await page.route('https://checkout.stripe.com/**', route => route.fulfill({ contentType: 'text/html', body: '<!doctype html><title>Checkout</title><p>Stripe Checkout (stub)</p>' }))
  await page.route('**/api/public-books', route => route.fulfill({ json: { books: [] } }))
  await page.route('**/api/events**', route => route.fulfill({ status: 204, body: '' }))
  await page.route(`**/api/public-books/${BOOK}/modern-en`, async route => {
    if (modern.delayMs) await new Promise(resolve => setTimeout(resolve, modern.delayMs))
    await route.fulfill({ status: modern.status ?? 200, json: modern.json ?? {} }).catch(() => {})
  })
  await page.route(`**/api/public-books/${BOOK}/modern-en/checkout`, route => route.fulfill({ json: { url: CHECKOUT } }))
  if (timeline) {
    // The real add engine, its Worker steps stubbed with delays; the reading engine (the shelf, the reader's hand-off) is slow to load.
    const after = (ms: number, name: string, answer: (route: Route) => Promise<void>) => async (route: Route) => {
      await new Promise(resolve => setTimeout(resolve, ms)); timeline.at[name] = Date.now(); await answer(route).catch(() => {})
    }
    await page.route('**/api/public-books/import/access', route => route.fulfill({ json: { canAdd: true } }))
    await page.route('**/api/public-books/import', after(timeline.importMs, 'import', route => route.fulfill({ json: { status: 'convert', bookId: BOOK, source: `/api/public-books/import/${BOOK}/source` } })))
    await page.route(`**/api/public-books/import/${BOOK}/source`, after(timeline.sourceMs, 'source', route => route.fulfill({ body: sampleEpub(), contentType: 'application/epub+zip' })))
    await page.route(`**/api/public-books/import/${BOOK}/commit`, after(timeline.commitMs, 'commit', route => route.fulfill({ status: 201, json: { status: 'imported', bookId: BOOK, entry: ADDED } })))
    await page.route('**/lab/library-2-reading.js**', after(timeline.readingMs, 'reading', route => route.continue()))
    // The reader's hand-off reads the added book's record (utils/publicBooks.ts ensurePublicBook): slow here, as a cold Worker read.
    await page.route(`**/api/public-books/${BOOK}`, after(timeline.bookMs, 'book', route => route.fulfill({ status: 404, json: { error: 'Not found' } })))
  } else
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
    new MutationObserver(() => { if (document.querySelector('.modern-ask-layer') && !sessionStorage.getItem('e2e:modern-ask-seen')) { sessionStorage.setItem('e2e:modern-ask-seen', '1'); sessionStorage.setItem('e2e:modern-ask-at', String(Date.now())) } })
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

test.describe('Modern English with the real add engine (Anders, 2026-10-09: right after Add, never holding it up)', () => {
  test('timeline: asked as soon as the commit answers; the add finishes under the open question; Not now opens the book at once', async ({ page }) => {
    test.skip(!process.env.VITE_SUPABASE_URL, 'needs a dev server with a dummy Supabase project (see the header)')
    // Production-like: the Worker downloads the EPUB (3 s), the page fetches it (1 s), the commit verifies and publishes (3 s);
    // after it, the reader's hand-off waits on a slow read of the book's record (3 s).
    const timeline: Timeline = { importMs: 3000, sourceMs: 1000, commitMs: 3000, readingMs: 0, bookMs: 3000, at: {} }
    await prepare(page, { json: NONE, delayMs: 300 }, timeline)
    const tapped = Date.now()
    await add(page)
    await expect(dialog(page)).toBeVisible({ timeout: 30_000 })
    const askedAt = Number(await page.evaluate(() => sessionStorage.getItem('e2e:modern-ask-at')))
    console.log(`[timeline] tap→commit answered ${timeline.at.commit - tapped} ms, tap→offer ${askedAt - tapped} ms (offer ${askedAt - timeline.at.commit} ms after the commit)`)
    await expect(dialog(page).locator('button')).toHaveText(['Not now', 'Get Modern English · $4.99'])
    await expect(dialog(page).locator('.modern-ask-later')).toBeFocused()
    // Asked once the price is known (the commit), not after the shelf and the reader's hand-off.
    expect(askedAt - timeline.at.commit).toBeLessThan(1500)
    await shot(page, 'modern-ask-timeline')
    // Unanswered: the add still finishes (the reader's hand-off is written), and the page does not leave under the question.
    await expect.poll(() => page.evaluate(() => JSON.parse(sessionStorage.getItem('tinct:lab-reader-handoff') || 'null')?.bookId), { timeout: 15_000 }).toBe(BOOK)
    console.log(`[timeline] add finished (hand-off written) ${Date.now() - tapped} ms after the tap, question still open`)
    await page.waitForTimeout(2000)
    expect(new URL(page.url()).pathname).toBe('/library')
    await expect(dialog(page)).toBeVisible()
    const answered = Date.now()
    await dialog(page).locator('.modern-ask-later').click()
    await page.waitForURL(url => url.pathname === '/reader')
    console.log(`[timeline] Not now → reader ${Date.now() - answered} ms`)
    expect(Date.now() - answered).toBeLessThan(1500)
  })
})
