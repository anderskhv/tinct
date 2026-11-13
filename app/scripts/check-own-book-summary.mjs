#!/usr/bin/env node
// The whole book's Summary on a reader's own book in the desktop margin reader (Anders, 13 Nov 2026, The Fabric of
// Reality, a Penguin EPUB: "About the Author" first, 14 chapters, about 120,000 words). In a real browser against a dev
// server, with the book seeded on this device and every API answered here (no model is reached):
//
//   1. Summary from "Before you start" builds the recap section by section and shows it (the route is the real Worker
//      handler's contract, answered with a stub recap; a refused section is answered 404 in the failure pass).
//   2. A failed Summary says why above Retry, never a bare Retry.
//   3. Its open body sits inside the margin card, right of the text, never painted at the screen's left.
//   4. The card stays with "Before you start": it is not in the margin of a later chapter.
//
//   VITE_SHARED_READER_DEFAULT=1 VITE_SUPABASE_URL=https://qa.supabase.co VITE_SUPABASE_ANON_KEY=qa npx vite --port 5250
//   TINCT_ORIGIN=http://127.0.0.1:5250 node scripts/check-own-book-summary.mjs
import { chromium } from '@playwright/test'
import fs from 'node:fs/promises'
import path from 'node:path'
import { createHash } from 'node:crypto'
import { markInternal } from './lib/internalTraffic.cjs'
import { zip } from '../../addbooks/web/test/make-epub.mjs'

const origin = process.env.TINCT_ORIGIN || 'http://127.0.0.1:5250'
const output = path.resolve(process.env.TINCT_OUTPUT || 'artifacts/own-book-summary')
await fs.mkdir(output, { recursive: true })
let failures = 0
const ok = (label, pass, detail) => { if (!pass) failures++; console.log(`${pass ? 'ok  ' : 'FAIL'} ${label}${detail !== undefined ? ' ' + JSON.stringify(detail).slice(0, 400) : ''}`) }

/** A long nonfiction EPUB: front matter, 14 chapters of about 8,500 words, back matter. */
function longEpub() {
  const words = (n, seed) => Array.from({ length: n }, (_, i) => `${seed}${'abcdefghij'[i % 10]}${i % 13}`).join(' ')
  const sections = [
    ['about', 'About the Author', [`David Example is a physicist. ${words(80, 'bio')}.`]],
    ['contents', 'Contents', ['The Theory of Everything', 'Shadows']],
    ['preface', 'Preface', [`${words(300, 'pre')}.`]],
    ...Array.from({ length: 14 }, (_, i) => [`c${i + 1}`, i === 0 ? 'The Theory of Everything' : `Chapter ${i + 1}`,
      Array.from({ length: 85 }, (_, p) => `${words(100, `c${i + 1}p${p}w`)}.`)]),
    ['biblio', 'Bibliography', [`${words(200, 'bib')}.`]],
    ['index', 'Index', [`${words(400, 'idx')}.`]],
  ]
  const xhtml = (title, paras) => `<?xml version="1.0"?><html xmlns="http://www.w3.org/1999/xhtml"><head><title>${title}</title></head><body><h1>${title}</h1>${paras.map(p => `<p>${p}</p>`).join('')}</body></html>`
  const files = [
    ['mimetype', 'application/epub+zip'],
    ['META-INF/container.xml', '<?xml version="1.0"?><container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container"><rootfiles><rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/></rootfiles></container>'],
    ['OEBPS/content.opf', `<?xml version="1.0"?><package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="id"><metadata xmlns:dc="http://purl.org/dc/elements/1.1/"><dc:identifier id="id">fabric-qa</dc:identifier><dc:title>The Fabric of Testing</dc:title><dc:creator>David Example</dc:creator><dc:language>en</dc:language></metadata><manifest><item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>${sections.map(([id]) => `<item id="${id}" href="${id}.xhtml" media-type="application/xhtml+xml"/>`).join('')}</manifest><spine>${sections.map(([id]) => `<itemref idref="${id}"/>`).join('')}</spine></package>`],
    ['OEBPS/nav.xhtml', `<?xml version="1.0"?><html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops"><body><nav epub:type="toc"><ol>${sections.map(([id, title]) => `<li><a href="${id}.xhtml">${title}</a></li>`).join('')}</ol></nav></body></html>`],
    ...sections.map(([id, title, paras]) => [`OEBPS/${id}.xhtml`, xhtml(title, paras), { deflate: true }]),
  ]
  return zip(files)
}

const bytes = longEpub()
const sha256 = createHash('sha256').update(bytes).digest('hex')
const hex = sha256.slice(0, 24)
const RECAP = 'The author argues that explanation, not prediction, is the point of science.'

async function run(browser, { fail }) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, serviceWorkers: 'block', reducedMotion: 'reduce' })
  const log = { posts: [] }
  await context.route('**/*', async route => {
    const req = route.request(), url = new URL(req.url())
    const json = (status, body) => route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) })
    if (url.hostname === 'qa.supabase.co') {
      if (url.pathname === '/auth/v1/user') return json(200, { id: 'u-qa', aud: 'authenticated', email: 'reader@example.com' })
      return json(200, [])
    }
    if (url.origin !== origin) return route.abort()
    if (url.pathname === '/api/own-catch-up') {
      if (req.method() === 'GET') return json(200, { steps: [], current: null })
      const body = JSON.parse(req.postData() || '{}')
      log.posts.push(body.chapter)
      if (fail && body.chapter === 5) return json(404, { error: 'Not found' })
      return json(200, { recap: RECAP, chapter: body.chapter, complete: body.complete, cached: false })
    }
    if (url.pathname.startsWith('/api/')) return json(404, {})
    return route.continue()
  })
  const page = await context.newPage(), errors = []
  page.on('pageerror', error => errors.push(error.message))
  await page.goto(`${origin}/`)
  await page.evaluate(async ({ hex, bytes }) => {
    localStorage.setItem('sb-qa-auth-token', JSON.stringify({ access_token: 'qa', refresh_token: 'qa-refresh', token_type: 'bearer', expires_in: 3600, expires_at: Math.floor(Date.now() / 1000) + 36000, user: { id: 'u-qa', email: 'reader@example.com' } }))
    localStorage.setItem('tinct-lab-prefs', JSON.stringify({ theme: 'dark' }))
    // A Catch me up window the reader once moved to the screen's left: as a floating window the embedded Summary took that place.
    sessionStorage.setItem('tinct-window:catchup', JSON.stringify({ x: 12, y: 120 }))
    const db = await new Promise((resolve, reject) => {
      const request = indexedDB.open('tinct-addbook', 1)
      request.onupgradeneeded = () => request.result.createObjectStore('books', { keyPath: 'key' })
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
    await new Promise((resolve, reject) => {
      const tx = db.transaction('books', 'readwrite')
      tx.objectStore('books').put({ key: `epub:${hex}`, kind: 'epub', name: 'fabric.epub', title: 'The Fabric of Testing', owner: 'u-qa', bytes: new Uint8Array(bytes).buffer })
      tx.oncomplete = resolve
      tx.onerror = () => reject(tx.error)
    })
    db.close()
  }, { hex, bytes: [...bytes] })
  await page.goto(`${origin}/reader?userBook=${hex}`, { waitUntil: 'domcontentloaded' })
  await page.waitForFunction(() => document.querySelector('.lab')?.dataset.readerReady === 'true', null, { timeout: 90000 })
  await page.waitForTimeout(1500)
  const tag = fail ? 'failing section' : 'every section answered'

  // "Before you start" folds to its label: open it, then the whole book's Summary.
  const start = page.locator('[data-testid="source-margin-item"][data-card-id^="start:"]').first()
  await start.waitFor({ timeout: 30000 })
  if (!(await page.getByTestId('margin-book-summary').isVisible().catch(() => false))) await start.getByTestId('source-margin-expand').click()
  await page.getByTestId('margin-book-summary').click()
  const card = page.locator('[data-testid="source-margin-item"][data-card-id^="mc_book_summary_"]')
  await card.waitFor({ timeout: 10000 })
  if (fail) {
    await card.getByTestId('lab-catch-up-retry').waitFor({ timeout: 30000 })
    const reason = await card.getByTestId('lab-catch-up-reason').textContent().catch(() => null)
    ok(`${tag}: a failed Summary says why above Retry`, !!reason && reason.length > 10, reason)
  } else {
    await card.locator('.lab-catch-up-text').waitFor({ timeout: 60000 })
    ok(`${tag}: the recap shows, built from every section`, (await card.locator('.lab-catch-up-text').textContent()) === RECAP && log.posts.length >= 17, { posts: log.posts.length })
  }
  // The open body inside its own card, right of the text: never at the screen's left.
  const geometry = await page.evaluate(() => {
    const item = document.querySelector('[data-testid="source-margin-item"][data-card-id^="mc_book_summary_"]')
    const body = item?.querySelector('[data-testid="lab-catch-up-body"]')
    const text = document.querySelector('.continuous-reader-window')?.getBoundingClientRect()
    const box = r => r && { left: Math.round(r.left), right: Math.round(r.right), top: Math.round(r.top), width: Math.round(r.width) }
    return { item: box(item?.getBoundingClientRect()), body: box(body?.getBoundingClientRect()), text: box(text), floating: !!item?.querySelector('[data-reader-window]'), position: body && getComputedStyle(body.closest('section.lab-v2-sheet') ?? body).position }
  })
  ok(`${tag}: the open Summary sits inside its margin card, right of the text`, !!geometry.body && !geometry.floating && geometry.body.left >= geometry.item.left - 1 && geometry.body.left >= (geometry.text?.right ?? 0), geometry)
  await page.screenshot({ path: path.join(output, `${fail ? 'failed' : 'done'}-open.png`) })

  if (!fail) {
    // A later chapter: the whole book's card is not in its margin.
    const chapterOfTheory = await page.evaluate(() => document.querySelector('.lab')?.dataset.chapter)
    await page.keyboard.press('Escape')
    // To the chapter's end, then on into the next chapter (the continuous reader's own way on).
    let chapter = chapterOfTheory
    for (let i = 0; i < 60 && chapter === chapterOfTheory; i++) {
      const info = await page.evaluate(() => {
        const host = document.querySelector('.continuous-reader-window')?.closest('[class*="scroll"], .lab-page-wrap') ?? document.scrollingElement
        let node = document.querySelector('.continuous-reader-window')
        while (node && node !== document.body && !(node.scrollHeight > node.clientHeight + 10 && /auto|scroll/.test(getComputedStyle(node).overflowY))) node = node.parentElement
        const scroller = node && node !== document.body ? node : document.scrollingElement
        scroller.scrollTop = scroller.scrollHeight
        const next = [...document.querySelectorAll('button, a')].find(el => /next chapter|continue to|^chapter 2|read on/i.test((el.textContent || '') + ' ' + (el.getAttribute('aria-label') || '')) && el.getBoundingClientRect().height > 0)
        if (next) next.click()
        return { scroller: scroller.className, next: next?.textContent?.slice(0, 40) ?? null, host: !!host }
      })
      if (i === 0) console.log('   moving on:', JSON.stringify(info))
      await page.waitForTimeout(400)
      chapter = await page.evaluate(() => document.querySelector('.lab')?.dataset.chapter)
    }
    await page.waitForTimeout(1500)
    const shown = await page.evaluate(() => {
      const item = document.querySelector('[data-testid="source-margin-item"][data-card-id^="mc_book_summary_"]')
      return item ? getComputedStyle(item).visibility : 'absent'
    })
    ok(`after moving to chapter ${chapter} (from ${chapterOfTheory}): the whole book's Summary is not in its margin`, chapter !== chapterOfTheory && shown !== 'visible', { shown })
    await page.screenshot({ path: path.join(output, 'later-chapter.png') })
  }
  ok(`${tag}: no page errors`, errors.length === 0, errors.slice(0, 3))
  await context.close()
}

const browser = await markInternal(await chromium.launch({ headless: true }))
try {
  await run(browser, { fail: false })
  await run(browser, { fail: true })
} finally {
  await browser.close()
}
console.log(failures ? `${failures} check(s) failed` : 'all checks passed')
process.exit(failures ? 1 : 0)
