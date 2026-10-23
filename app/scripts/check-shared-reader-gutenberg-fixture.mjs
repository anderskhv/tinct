// Offline source acceptance: package real Project Gutenberg #2600 raw text into
// a valid local EPUB. This is a Gutenberg-text fixture, not a network import or
// a claim that these generated EPUB bytes came from gutenberg.org.
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import fs from 'node:fs/promises'
import { chromium } from '@playwright/test'
import { createServer } from 'vite'
import { zip } from '../../addbooks/web/test/make-epub.mjs'
import { markInternal } from './lib/internalTraffic.cjs'

const source = await fs.readFile('../books/war-and-peace/raw.txt', 'utf8')
assert(source.includes('Project Gutenberg eBook of War and Peace') && source.includes('eBook #2600'))
const novel = source.slice(source.indexOf('BOOK ONE: 1805', source.indexOf('*** START OF THE PROJECT GUTENBERG EBOOK')))
const chapters = /^CHAPTER I\s+([\s\S]*?)^CHAPTER II\s+([\s\S]*?)^CHAPTER III\s+/m.exec(novel)
assert(chapters, 'Gutenberg text has first two chapter boundaries')
const escapeXml = value => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
const chapterXhtml = (number, content) => {
  const paragraphs = content.trim().split(/\n\s*\n/).map(block => block.replace(/\s*\n\s*/g, ' ').trim()).filter(Boolean)
  return `<?xml version="1.0"?><html xmlns="http://www.w3.org/1999/xhtml"><head><title>Chapter ${number}</title></head><body><h1>Chapter ${number}</h1>${paragraphs.map(text => `<p>${escapeXml(text)}</p>`).join('')}</body></html>`
}
const bytes = zip([
  ['mimetype', 'application/epub+zip'],
  ['META-INF/container.xml', '<?xml version="1.0"?><container xmlns="urn:oasis:names:tc:opendocument:xmlns:container" version="1.0"><rootfiles><rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/></rootfiles></container>'],
  ['OEBPS/content.opf', '<?xml version="1.0"?><package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="id"><metadata xmlns:dc="http://purl.org/dc/elements/1.1/"><dc:identifier id="id">gutenberg-2600-local-text-fixture</dc:identifier><dc:title>War and Peace</dc:title><dc:creator>Leo Tolstoy</dc:creator><dc:language>en</dc:language></metadata><manifest><item id="c1" href="c1.xhtml" media-type="application/xhtml+xml"/><item id="c2" href="c2.xhtml" media-type="application/xhtml+xml"/></manifest><spine><itemref idref="c1"/><itemref idref="c2"/></spine></package>'],
  ['OEBPS/c1.xhtml', chapterXhtml('I', chapters[1])],
  ['OEBPS/c2.xhtml', chapterXhtml('II', chapters[2])],
])
const sha256 = createHash('sha256').update(bytes).digest('hex')
const id = sha256.slice(0, 24), fileId = 'a'.repeat(32), owner = 'gutenberg-fixture-owner'
const book = { id: fileId, sha256, type: 'epub', name: 'War and Peace Gutenberg text fixture.epub', title: 'War and Peace', author: 'Leo Tolstoy', size: bytes.length, createdAt: '2026-10-23T00:00:00.000Z', metadataRev: 0 }
const bundle = (await fs.readdir('dist/assets')).find(name => /^supabase-.*\.js$/.test(name))
const ref = /https:\/\/([a-z0-9]+)\.supabase\.co/.exec(await fs.readFile(`dist/assets/${bundle}`, 'utf8'))?.[1]
assert(ref, 'local build carries a Supabase project ref for synthetic auth storage')
const authKey = `sb-${ref}-auth-token`
const vite = await createServer({ server: { host: '127.0.0.1', port: 0, strictPort: false }, logLevel: 'error' })
await vite.listen()
const origin = vite.resolvedUrls.local[0].replace(/\/$/, '')
const browser = await markInternal(await chromium.launch({ headless: true, args: ['--mute-audio', '--no-sandbox'] }))
const context = await browser.newContext({ viewport: { width: 1280, height: 800 }, serviceWorkers: 'block' })
const page = await context.newPage(), errors = [], denied = []
page.on('pageerror', error => errors.push(error.message))
await page.route('**/*', route => {
  const url = new URL(route.request().url())
  if (url.origin !== origin) { denied.push(url.origin); return route.abort() }
  if (url.pathname === '/api/user-books') return route.fulfill({ json: { books: [book] } })
  if (url.pathname === '/api/user-books/places') return route.fulfill({ json: { places: {} } })
  if (/^\/api\/user-books\/(?:text-)?(?:marks|cards)\//.test(url.pathname)) return route.fulfill({ json: { marks: [], cards: [], rev: 0, fileId } })
  if (/^\/api\/user-books\/(?:places|covers)\//.test(url.pathname)) return route.fulfill({ json: { place: null, cover: null } })
  if (url.pathname === `/api/user-books/${fileId}` || url.pathname === `/api/user-books/${id}`) return route.fulfill({ contentType: 'application/epub+zip', body: bytes })
  if (url.pathname.startsWith('/api/')) return route.fulfill({ status: 404, json: {} })
  return route.continue()
})
await page.addInitScript(({ authKey, owner }) => {
  localStorage.setItem(authKey, JSON.stringify({ access_token: 'fixture', refresh_token: 'fixture', expires_at: Math.floor(Date.now() / 1000) + 36000, token_type: 'bearer', user: { id: owner, email: 'reader@example.test', aud: 'authenticated' } }))
  const original = window.fetch
  window.fetch = (input, init) => {
    let url; try { url = new URL(typeof input === 'string' ? input : input.url, location.href) } catch { return original.call(window, input, init) }
    if (url.hostname.endsWith('.supabase.co')) {
      if (url.pathname === '/auth/v1/user') return Promise.resolve(new Response(JSON.stringify({ id: owner, email: 'reader@example.test', aud: 'authenticated' }), { status: 200, headers: { 'Content-Type': 'application/json' } }))
      if (url.pathname.startsWith('/rest/v1/')) return Promise.resolve(new Response('[]', { status: 200, headers: { 'Content-Type': 'application/json' } }))
      return Promise.resolve(new Response('{}', { status: 404, headers: { 'Content-Type': 'application/json' } }))
    }
    return original.call(window, input, init)
  }
}, { authKey, owner })
try {
  await page.goto(`${origin}/reader?book=frankenstein`, { waitUntil: 'domcontentloaded' })
  await page.evaluate(({ id, owner, fileId, bytes, book }) => new Promise((resolve, reject) => {
    const open = indexedDB.open('tinct-addbook', 1)
    open.onupgradeneeded = () => { if (!open.result.objectStoreNames.contains('books')) open.result.createObjectStore('books', { keyPath: 'key' }) }
    open.onerror = () => reject(open.error)
    open.onsuccess = () => {
      const db = open.result, tx = db.transaction('books', 'readwrite')
      tx.objectStore('books').put({ key: `epub:${id}`, kind: 'epub', owner, cloudId: fileId, name: book.name, title: book.title, author: book.author, bytes: new Uint8Array(bytes).buffer })
      tx.oncomplete = () => { db.close(); resolve() }; tx.onerror = () => reject(tx.error)
    }
  }), { id, owner, fileId, bytes: [...bytes], book })
  await page.goto(`${origin}/reader?userBook=${id}&sharedReader=1`, { waitUntil: 'domcontentloaded' })
  await page.getByTestId('continuous-reader').waitFor({ timeout: 45000 })
  const text = await page.getByTestId('continuous-reader').innerText()
  console.log('Gutenberg fixture opening', JSON.stringify({ text: text.slice(0, 180), alert: await page.locator('[role="alert"]').allTextContents(), errors, denied }))
  assert(text.includes('Well, Prince, so Genoa and Lucca'), 'actual Gutenberg prose appears in shared React Margin')
  assert.equal(await page.locator('.lab').getAttribute('data-shared-reader'), 'true')
  const initial = { title: await page.locator('.lab').getAttribute('data-book'), chapter: await page.locator('.lab').getAttribute('data-chapter'), words: await page.getByTestId('continuous-reader').locator('[data-testid="lab-word"]').count() }
  assert(initial.words > 100)
  const host = page.getByTestId('continuous-reader')
  await host.hover()
  await page.mouse.wheel(0, 640)
  await page.waitForTimeout(500)
  const scrolled = await page.locator('.lab').getAttribute('data-place')
  assert(scrolled && scrolled !== '0:0', 'offline Gutenberg prose advances a semantic word coordinate')
  await page.reload({ waitUntil: 'domcontentloaded' })
  await host.waitFor({ timeout: 45000 })
  assert.equal(await page.locator('.lab').getAttribute('data-place'), scrolled, 'own EPUB reload resumes at exact semantic word')
  await page.getByTestId('lab-header-chapter').click()
  await page.getByTestId('lab-tree-chapter-2').click()
  await page.waitForFunction(() => document.querySelector('.lab')?.dataset.chapter === '2', null, { timeout: 30000 })
  await host.waitFor()
  const second = await host.innerText()
  assert(second.includes('“What have they decided?”') || second.includes('Anna Pávlovna'), 'Contents navigation renders second Gutenberg chapter prose')
  const output = '../docs/assets/shared-reader-2026-10-23/gutenberg-text-epub-fixture.png'
  await page.screenshot({ path: output })
  console.log(JSON.stringify({ source: 'Project Gutenberg #2600 raw text packaged locally as a valid two-chapter EPUB fixture', initial, scrolled, secondChapter: await page.locator('.lab').getAttribute('data-chapter'), headings: await page.locator('.lab-passage-headline').allTextContents(), screenshot: output, errors, denied }))
  assert.deepEqual(errors, [])
  assert.deepEqual(denied, [])
} finally {
  await browser.close()
  await vite.close()
}
