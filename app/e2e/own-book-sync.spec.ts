import { expect, test, type Browser, type BrowserContext, type Page } from '@playwright/test'
import { createHash, randomBytes } from 'node:crypto'
// @ts-expect-error -- plain .mjs test helper shared with the Add-a-book e2e tests
import { zip } from '../../addbooks/web/test/make-epub.mjs'

/**
 * A reader's own EPUB on two devices of one account (two browser profiles):
 * the account copy (`/api/user-books`, mocked here by one in-memory account
 * both profiles share) opens on a device without the file, replaces a local
 * copy that cannot be read, a book removed on one device leaves the other's
 * shelf, and the place read on one device opens on the other (the account's
 * private places, `/api/user-books/places`).
 *
 * Run against a vite dev server started with a dummy Supabase project:
 *   VITE_SUPABASE_URL=https://local.supabase.co VITE_SUPABASE_ANON_KEY=dummy npx vite --port 5287
 *   BASE_URL=http://localhost:5287 PW_CHROMIUM_EXECUTABLE=/opt/pw-browsers/chromium \
 *     npx playwright test -c e2e/playwright.own-book-sync.config.ts
 */
const BASE_URL = process.env.BASE_URL || 'http://localhost:5173'
const USER = '33333333-3333-4333-8333-333333333333'
const TOKEN_SUB = USER

const para = (chapter: number, index: number) => `Chapter ${chapter} paragraph ${index}: ${'the river bends past the mill and the old stone bridge '.repeat(4)}`
function bookEpub(title: string): Buffer {
  const chapters = [1, 2, 3, 4]
  const xhtml = (n: number) => `<?xml version="1.0"?><html xmlns="http://www.w3.org/1999/xhtml"><body><h1>Part ${n}</h1>${Array.from({ length: 30 }, (_, i) => `<p>${para(n, i + 1)}</p>`).join('')}</body></html>`
  return zip([
    ['mimetype', 'application/epub+zip'],
    ['META-INF/container.xml', '<?xml version="1.0"?><container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container"><rootfiles><rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/></rootfiles></container>'],
    ['OEBPS/content.opf', `<?xml version="1.0"?><package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="id"><metadata xmlns:dc="http://purl.org/dc/elements/1.1/"><dc:identifier id="id">${title}</dc:identifier><dc:title>${title}</dc:title><dc:creator>Test Author</dc:creator><dc:language>en</dc:language></metadata><manifest><item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>${chapters.map(n => `<item id="c${n}" href="c${n}.xhtml" media-type="application/xhtml+xml"/>`).join('')}</manifest><spine>${chapters.map(n => `<itemref idref="c${n}"/>`).join('')}</spine></package>`],
    ['OEBPS/nav.xhtml', `<?xml version="1.0"?><html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops"><body><nav epub:type="toc"><ol>${chapters.map(n => `<li><a href="c${n}.xhtml">Part ${n}</a></li>`).join('')}</ol></nav></body></html>`],
    ...chapters.map(n => [`OEBPS/c${n}.xhtml`, xhtml(n)]),
  ])
}

interface CloudBook { id: string; name: string; title: string; author: string; type: 'epub'; size: number; sha256: string; createdAt: string; bytes: Buffer }
interface CloudPlace { chapterNumber: number; paragraphIndex: number; wordIndex: number; updatedAt: number; percent?: number; rev: number }

/** One account both profiles sign in to: its private copies and places. */
function account() {
  const books = new Map<string, CloudBook>()
  const places = new Map<string, CloudPlace>()
  const calls: string[] = []
  return {
    books, places, calls,
    add(bytes: Buffer, title: string): CloudBook {
      const sha256 = createHash('sha256').update(bytes).digest('hex')
      const book: CloudBook = { id: randomBytes(16).toString('hex'), name: `${title}.epub`, title, author: 'Test Author', type: 'epub', size: bytes.byteLength, sha256, createdAt: new Date().toISOString(), bytes }
      books.set(book.id, book)
      return book
    },
    remove(id: string) {
      const book = books.get(id)
      books.delete(id)
      if (book) places.delete(book.sha256.slice(0, 24))
    },
  }
}
type Account = ReturnType<typeof account>
const hexOf = (book: CloudBook) => book.sha256.slice(0, 24)
const meta = ({ bytes: _bytes, ...rest }: CloudBook) => rest

async function device(browser: Browser, store: Account, viewport = { width: 1280, height: 860 }): Promise<{ context: BrowserContext; page: Page }> {
  const context = await browser.newContext({ baseURL: BASE_URL, viewport })
  await context.addCookies([{ name: 'tinct_auth', value: '1', url: BASE_URL }])
  const exp = Math.floor(Date.now() / 1000) + 3600
  const b64 = (value: object) => Buffer.from(JSON.stringify(value)).toString('base64url')
  const user = { id: USER, aud: 'authenticated', role: 'authenticated', email: 'reader@example.com', app_metadata: {}, user_metadata: {}, created_at: '2026-10-01T00:00:00Z' }
  const session = { access_token: `${b64({ alg: 'HS256', typ: 'JWT' })}.${b64({ sub: TOKEN_SUB, exp, role: 'authenticated' })}.fixture`, refresh_token: 'fixture', token_type: 'bearer', expires_in: 3600, expires_at: exp, user }
  await context.addInitScript(value => { try { if (!localStorage.getItem('sb-local-auth-token')) localStorage.setItem('sb-local-auth-token', value) } catch { /* private */ } }, JSON.stringify(session))
  await context.route(url => !['localhost', '127.0.0.1'].includes(url.hostname), route => route.abort())
  await context.route(url => url.pathname.startsWith('/api/') && !url.pathname.startsWith('/api/user-books'), route => route.fulfill({ status: 404, json: { error: 'Not found' } }))
  await context.route(url => url.pathname === '/api/user-books' || url.pathname.startsWith('/api/user-books/'), async route => {
    const request = route.request()
    const path = new URL(request.url()).pathname.slice('/api/user-books'.length)
    store.calls.push(`${request.method()} ${path || '/'}`)
    if (!request.headers().authorization?.startsWith('Bearer ')) return route.fulfill({ status: 401, json: { error: 'Unauthorized' } })
    if (path === '' && request.method() === 'GET') return route.fulfill({ json: { books: [...store.books.values()].map(meta) } })
    if (path === '/places' && request.method() === 'GET') return route.fulfill({ json: { places: Object.fromEntries(store.places) } })
    const place = path.match(/^\/places\/([0-9a-f]{24})$/)
    if (place && request.method() === 'PUT') {
      const hex = place[1]
      if (![...store.books.values()].some(book => hexOf(book) === hex)) return route.fulfill({ status: 404, json: { error: 'Not found' } })
      const body = request.postDataJSON() as { place: Omit<CloudPlace, 'rev'>; rev: number }
      const current = store.places.get(hex)
      if ((current?.rev ?? 0) !== body.rev) return route.fulfill({ status: 409, json: { error: 'conflict', place: current ?? null } })
      const next = { ...body.place, rev: (current?.rev ?? 0) + 1 }
      store.places.set(hex, next)
      return route.fulfill({ json: { place: next } })
    }
    const file = path.match(/^\/([0-9a-f]{32})$/)
    if (file && request.method() === 'GET') {
      const book = store.books.get(file[1])
      return book ? route.fulfill({ status: 200, body: book.bytes, contentType: 'application/epub+zip' }) : route.fulfill({ status: 404, json: { error: 'Not found' } })
    }
    if (file && request.method() === 'DELETE') {
      if (!store.books.has(file[1])) return route.fulfill({ status: 404, json: { error: 'Not found' } })
      store.remove(file[1])
      return route.fulfill({ json: { ok: true } })
    }
    return route.fulfill({ status: 405, json: { error: 'Method not allowed' } })
  })
  const page = await context.newPage()
  return { context, page }
}

/** Keep a file on this device as Add a book does (its IndexedDB record), optionally already converted. */
async function keepOnDevice(page: Page, book: CloudBook, options: { bytes?: Buffer; cloudId?: boolean } = {}) {
  if (!page.url().startsWith(BASE_URL)) await page.goto('/robots.txt')
  const bytes = options.bytes ?? book.bytes
  await page.evaluate(async ({ key, name, title, owner, data, cloudId }) => {
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open('tinct-addbook', 1)
      request.onupgradeneeded = () => request.result.createObjectStore('books', { keyPath: 'key' })
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction('books', 'readwrite')
      tx.objectStore('books').put({ key, kind: 'epub', name, size: data.length, title, author: 'Test Author', owner, addedAt: Date.now(), openedAt: Date.now(), coverV: 2, ...(cloudId ? { cloudId } : {}), bytes: new Uint8Array(data).buffer })
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
    })
    db.close()
  }, { key: `epub:${hexOf(book)}`, name: book.name, title: book.title, owner: USER, data: [...bytes], cloudId: options.cloudId === false ? null : book.id })
}

async function deviceKeys(page: Page): Promise<string[]> {
  return page.evaluate(async () => {
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open('tinct-addbook', 1)
      request.onupgradeneeded = () => request.result.createObjectStore('books', { keyPath: 'key' })
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
    const keys = await new Promise<string[]>(resolve => { const r = db.transaction('books', 'readonly').objectStore('books').getAllKeys(); r.onsuccess = () => resolve(r.result as string[]) })
    db.close()
    return keys
  })
}

const readerText = (page: Page) => page.locator('.lab')
/** My shelf, loaded afresh (as a device opening the library later; a hash change alone would not reload). */
async function openShelf(page: Page) {
  await page.goto('about:blank')
  await page.goto('/library#my-shelf', { waitUntil: 'domcontentloaded' })
  await expect(page.locator('#collection-title')).toHaveText('My shelf', { timeout: 30_000 })
}

test.describe('own books across two devices of one account', () => {
  test('a device without the file opens it from the account copy: direct link, shelf, and Back to the library', async ({ browser }) => {
    const store = account()
    const book = store.add(bookEpub('River Notes'), 'River Notes')
    const phone = await device(browser, store, { width: 390, height: 844 })
    // A direct reader link on a device that never had the file.
    await phone.page.goto(`/reader?userBook=${hexOf(book)}`)
    await expect(readerText(phone.page).getByText(para(1, 1).slice(0, 40)).first()).toBeVisible({ timeout: 30_000 })
    expect(new URL(phone.page.url()).pathname).toBe('/reader')
    expect(store.calls).toContain(`GET /${book.id}`)
    // Kept on this device now (converted and cached), with the account copy's id.
    expect(await deviceKeys(phone.page)).toEqual([`epub:${hexOf(book)}`])

    // From My shelf on a second fresh profile: the card opens the reader itself, and Back returns to My shelf.
    const tablet = await device(browser, store)
    await openShelf(tablet.page)
    const card = tablet.page.locator(`#collection-books [data-shelf-group="own"][data-own-key="epub:${hexOf(book)}"] a`)
    await expect(card).toHaveAttribute('href', `/reader?userBook=${hexOf(book)}`)
    await card.click()
    await expect(readerText(tablet.page).getByText(para(1, 1).slice(0, 40)).first()).toBeVisible({ timeout: 30_000 })
    // Back returns to the library it was opened from (as for Tinct's books), never to Add a book's page.
    await tablet.page.goBack()
    await expect.poll(() => new URL(tablet.page.url()).pathname).toBe('/library')
    // The reader's own way back (Library in its menu) is My shelf.
    await tablet.page.goForward()
    await expect(readerText(tablet.page).getByText(para(1, 1).slice(0, 40)).first()).toBeVisible({ timeout: 30_000 })
    await phone.context.close()
    await tablet.context.close()
  })

  test('a local copy that is not a valid EPUB falls back to the account copy', async ({ browser }) => {
    const store = account()
    const book = store.add(bookEpub('Mill Ledger'), 'Mill Ledger')
    const desktop = await device(browser, store)
    await keepOnDevice(desktop.page, book, { bytes: Buffer.from('not a zip at all, the copy was damaged') })
    await desktop.page.goto(`/reader?userBook=${hexOf(book)}`)
    await expect(readerText(desktop.page).getByText(para(1, 1).slice(0, 40)).first()).toBeVisible({ timeout: 30_000 })
    await expect(desktop.page.getByText('not a ZIP archive')).toHaveCount(0)
    await desktop.context.close()
  })

  test('removing a book on one device takes it off the other device\'s shelf, once', async ({ browser }) => {
    const store = account()
    const book = store.add(bookEpub('Bridge Diary'), 'Bridge Diary')
    const desktop = await device(browser, store)
    const phone = await device(browser, store, { width: 390, height: 844 })
    await keepOnDevice(desktop.page, book)
    await keepOnDevice(phone.page, book)
    await phone.page.evaluate(hex => localStorage.setItem(`tinct-addbook:place:${hex}`, JSON.stringify({ chapterNumber: 2, paragraphIndex: 3, wordIndex: 0, updatedAt: Date.now() })), hexOf(book))
    await openShelf(phone.page)
    const own = phone.page.locator(`#collection-books .own-book[data-own-key="epub:${hexOf(book)}"]`)
    // Being read: under Currently reading and in My private uploads, no more.
    await expect(own).toHaveCount(2)

    // Removed on the desktop (My shelf's × and its confirmation).
    await openShelf(desktop.page)
    await desktop.page.locator(`#collection-books [data-shelf-group="own"][data-own-key="epub:${hexOf(book)}"] [data-shelf-remove]`).click()
    await desktop.page.locator('[data-testid="own-delete-dialog"] .own-delete-confirm').click()
    await expect.poll(() => store.books.size).toBe(0)

    // The phone's shelf drops it (and its copy on the phone) once the account's list says it is gone.
    await openShelf(phone.page)
    await expect(phone.page.locator('#collection-books .my-books-head', { hasText: 'My private uploads' })).toHaveCount(0, { timeout: 15_000 })
    await expect(own).toHaveCount(0)
    await expect.poll(() => deviceKeys(phone.page)).toEqual([])
    expect(await phone.page.evaluate(hex => localStorage.getItem(`tinct-addbook:place:${hex}`), hexOf(book))).toBeNull()
    await desktop.context.close()
    await phone.context.close()
  })

  test('the place read on one device opens on the other, and its shelf shows the progress', async ({ browser }) => {
    const store = account()
    const book = store.add(bookEpub('Harbour Book'), 'Harbour Book')
    const desktop = await device(browser, store)
    await keepOnDevice(desktop.page, book)
    // Read on the desktop up to Part 3.
    await desktop.page.evaluate(hex => localStorage.setItem(`tinct-addbook:place:${hex}`, JSON.stringify({ chapterNumber: 3, paragraphIndex: 4, wordIndex: 0, updatedAt: Date.now() })), hexOf(book))
    await desktop.page.goto(`/reader?userBook=${hexOf(book)}`)
    await expect(readerText(desktop.page).getByText(para(3, 5).slice(0, 40)).first()).toBeVisible({ timeout: 30_000 })
    await expect.poll(() => store.places.get(hexOf(book))?.chapterNumber ?? null, { timeout: 15_000 }).toBe(3)
    const synced = store.places.get(hexOf(book))!
    expect(Object.keys(synced).sort()).toEqual(['chapterNumber', 'paragraphIndex', 'percent', 'rev', 'updatedAt', 'wordIndex'])
    // The account's places carry no title.
    expect(JSON.stringify(synced)).not.toContain('Harbour')

    // The phone, which never had the file: My shelf lists it under Currently reading, then it opens in Part 3.
    const phone = await device(browser, store, { width: 390, height: 844 })
    await openShelf(phone.page)
    const reading = phone.page.locator(`#collection-books [data-shelf-group="own-reading"][data-own-key="epub:${hexOf(book)}"]`)
    await expect(reading).toHaveCount(1)
    // Its progress, as the desktop kept it with the place (Part 3, paragraph 5 of 4 × 30): the text is not on the phone yet.
    await expect(reading.locator('.own-progress')).toHaveText('53%')
    await phone.page.goto(`/reader?userBook=${hexOf(book)}`)
    await expect(readerText(phone.page).getByText(para(3, 5).slice(0, 40)).first()).toBeVisible({ timeout: 30_000 })
    await desktop.context.close()
    await phone.context.close()
  })
})
