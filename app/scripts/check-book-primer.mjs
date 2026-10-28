// Isolated local build acceptance; synthetic primer/API responses, no provider calls.
import assert from 'node:assert/strict'
import { createServer } from 'node:http'
import fs from 'node:fs/promises'
import path from 'node:path'
import { chromium, webkit, devices } from '@playwright/test'
const dist = path.resolve('dist'), output = '/tmp/tinct-book-primer-browser'
await fs.mkdir(output, { recursive: true })
const editorialResources = JSON.parse(await fs.readFile(path.join(dist, 'data/book-primers/frankenstein/original-en/en/book.json'), 'utf8')).resources
const chapter = JSON.parse(await fs.readFile(path.join(dist, 'data/editions-chapters/frankenstein-original-en/ch0002.json'), 'utf8'))
const quote = chapter.paragraphs[3].replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 90)
const bookChapter = JSON.parse(await fs.readFile(path.join(dist, 'data/editions-chapters/frankenstein-original-en/ch0001.json'), 'utf8'))
const bookQuote = bookChapter.paragraphs[3].replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 90)
const meditations = JSON.parse(await fs.readFile(path.join(dist, 'data/editions/meditations-original-en.json'), 'utf8'))
const romans = JSON.parse(await fs.readFile(path.join(dist, 'data/editions-chapters/bible-web-en/ch1047.json'), 'utf8'))
const variants = [
  { id: 'meditations', edition: 'original-en', chapter: 1, source: meditations.chapters[0] },
  { id: 'bible', edition: 'web-en', chapter: 1047, source: romans },
  { id: 'pd-qa-primer', edition: 'original-en', chapter: 1, source: meditations.chapters[0] },
]
const importedBook = { id: 'pd-qa-primer', title: 'Synthetic Public Import', author: 'Fixture Author', editions: [{ key: 'original-en', language: 'en', style: 'original', label: 'Original English', aligned: false, hasAudio: false }] }
const catalogue = JSON.parse(await fs.readFile(path.join(dist, 'lab/catalogue.json'), 'utf8'))
const importedEntry = { ...catalogue.books.find(book => book.id === 'meditations'), id: importedBook.id, title: importedBook.title, author: importedBook.author, defaultEditionKey: 'original-en' }
importedEntry.editions = importedEntry.editions.filter(edition => edition.key === 'original-en')
const server = createServer(async (req, res) => {
  const url = new URL(req.url, 'http://127.0.0.1'), file = path.resolve(dist, '.' + (url.pathname === '/reader' ? '/app.html' : url.pathname === '/library' ? '/lab/library_2/index.html' : url.pathname))
  if (!file.startsWith(dist + path.sep)) { res.writeHead(403); res.end(); return }
  try { const data = await fs.readFile(file); res.writeHead(200, { 'Content-Type': ({ '.html':'text/html', '.js':'text/javascript', '.css':'text/css', '.json':'application/json', '.woff2':'font/woff2', '.svg':'image/svg+xml' })[path.extname(file)] || 'application/octet-stream' }); res.end(data) } catch { res.writeHead(404); res.end() }
})
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
const origin = `http://127.0.0.1:${server.address().port}`
try {
  for (const [engine, launcher] of [['chromium', chromium], ['webkit', webkit]]) {
    const browser = await launcher.launch({ headless: true, ...(engine === 'chromium' ? { args: ['--mute-audio'] } : {}) })
    try {
      for (const phone of [false, true]) {
        const context = await browser.newContext({ ...(phone ? devices['iPhone 13'] : {}), viewport: phone ? { width: 390, height: 844 } : { width: 1440, height: 900 }, reducedMotion: 'reduce', serviceWorkers: 'block' })
        const page = await context.newPage(), errors = [], requests = [], failedRequests = []
        page.on('pageerror', e => { errors.push(e.message); console.error('pageerror', page.url(), e.stack) })
        page.on('requestfailed', request => { if (new URL(request.url()).origin === origin) failedRequests.push({ page: page.url(), url: request.url(), failure: request.failure() }) })
        await page.route('**/*', async route => {
          const url = new URL(route.request().url())
          if (url.origin !== origin) return route.abort()
          if (url.pathname === '/api/public-books/pd-qa-primer') return route.fulfill({ json: { book: importedBook, entry: importedEntry } })
          if (url.pathname === '/data/editions/pd-qa-primer-original-en.json') return route.fulfill({ json: meditations })
          if (url.pathname === '/api/lab-chapter-notes') {
            const request = route.request().postDataJSON(); requests.push(request)
            const variant = variants.find(item => item.id === request.bookId)
            const sourceQuote = variant ? variant.source.paragraphs[3].replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim() : null
            return route.fulfill({ json: { primer: {
              identity: { scope: { kind: 'public' }, workId: request.bookId, editionId: request.editionKey, sourceVersion: 'synthetic-source-v1', unitId: request.primerType === 'book' ? null : `chapter-${request.chapterNumber}`, type: request.primerType || 'chapter', language: 'en' },
              content: { opening: 'A letter makes distance tangible, placing the reader beside its writer before the journey begins.', structure: [{ title: 'The address', explanation: 'Notice how the writer addresses the recipient.', quotes: variant ? [{ text: sourceQuote, passageId: `chapter-${variant.chapter}:paragraph-3` }] : request.primerType === 'book' ? [{ text: bookQuote, passageId: 'chapter-1:paragraph-3' }, { text: quote, passageId: 'chapter-2:paragraph-3' }] : [{ text: quote, passageId: 'chapter-2:paragraph-3' }] }], peopleAndIdeas: [], helpfulContext: [], whatToNotice: [{ title: 'Distance', explanation: 'Follow the language of distance.' }], usefulReferences: [] },
              resources: request.primerType === 'book' ? editorialResources : [], origin: 'generated', promptVersion: 'book-primer-1', createdAt: '2026-10-28T00:00:00Z' } } })
          }
          if (url.pathname.startsWith('/api/')) return route.fulfill({ status: 404, json: {} })
          return route.continue()
        })
        await page.addInitScript(() => localStorage.setItem('tinct-lab-prefs', JSON.stringify({ theme: 'book', primaryEdition: 'original-en', audioEdition: 'original-en', compareOpen: false })))
        try {
          await page.goto(`${origin}/reader?book=frankenstein&edition=original-en&chapter=2&paragraph=0&word=0&sharedReader=1&layout=${phone ? 'phone' : 'desktop'}${phone ? '' : '&view=margin'}`)
          await page.waitForFunction(() => document.querySelector('.lab')?.dataset.readerReady === 'true', null, { timeout: 45000 })
          await page.getByTestId('lab-unit-primer').first().click()
          const primer = page.locator('.book-primer-content:visible').first()
          await primer.waitFor()
          assert.equal(requests[0].format, 'structured-primer')
          await primer.locator('summary').filter({ hasText: /^Structure$/ }).click()
          await primer.locator('summary').filter({ hasText: /^The address$/ }).click()
          assert.equal(await primer.getByText(quote, { exact: true }).count(), 1)
          const overflow = await primer.evaluate(el => el.scrollWidth > el.clientWidth + 1)
          assert.equal(overflow, false)
          await page.screenshot({ path: `${output}/${engine}-${phone ? 'phone' : 'margin'}.png` })
          await primer.getByRole('button', { name: 'Read passage' }).click()
          await page.waitForFunction(() => ![...document.querySelectorAll('.book-primer-content')].some(el => el.getBoundingClientRect().width && el.getBoundingClientRect().height))
          await page.waitForFunction(() => { const place = JSON.parse(localStorage.getItem('tinct-lab-position') || '{}').books?.frankenstein; return place?.paragraphIndex === 3 && place?.sequentialChapter === 2 }, null, { timeout: 10000 })
          const beforeBookPrimer = await page.evaluate(() => JSON.parse(localStorage.getItem('tinct-lab-position') || '{}').books?.frankenstein)
          await page.getByRole('button', { name: /^Table of contents/ }).click()
          await page.getByRole('button', { name: 'Book primer', exact: true }).click()
          await page.locator('.book-primer-content:visible').first().waitFor()
          assert.equal(requests.at(-1).primerType, 'book')
          const afterBookPrimer = await page.evaluate(() => JSON.parse(localStorage.getItem('tinct-lab-position') || '{}').books?.frankenstein)
          assert.equal(afterBookPrimer.sequentialChapter, beforeBookPrimer.sequentialChapter)
          assert.equal(afterBookPrimer.paragraphIndex, beforeBookPrimer.paragraphIndex)
          assert.equal(new URL(page.url()).pathname, '/reader')
          const resources = page.locator('.book-primer-content:visible').first()
          await resources.locator('summary').filter({ hasText: /^Watch & explore$/ }).click()
          assert.equal(await resources.getByRole('link', { name: 'Frankenstein manuscripts', exact: true }).getAttribute('href'), editorialResources[0].url)
          await page.screenshot({ path: `${output}/${engine}-${phone ? 'phone' : 'margin'}-book.png` })
          const bookPrimer = page.locator('.book-primer-content:visible').first()
          const sharedBookText = await bookPrimer.locator('p').allTextContents()
          await bookPrimer.locator('summary').filter({ hasText: /^Structure$/ }).click()
          await bookPrimer.locator('summary').filter({ hasText: /^The address$/ }).click()
          await bookPrimer.getByRole('button', { name: 'Read passage' }).first().click()
          await page.waitForFunction(() => { const place = JSON.parse(localStorage.getItem('tinct-lab-position') || '{}').books?.frankenstein; return place?.paragraphIndex === 3 && place?.sequentialChapter === 1 }, null, { timeout: 15000 })
          await page.goto(`${origin}/library?book=frankenstein&edition=original-en&view=book-detail`)
          await page.locator('#book-overlay:not([hidden])').waitFor({ timeout: 30000 })
          if (phone) await page.locator('#slip-next').click()
          const opening = page.locator('#intro-body .book-primer-content')
          await opening.waitFor({ timeout: 30000 })
          assert.deepEqual(await opening.locator('p').allTextContents(), sharedBookText, 'catalogue and reader show identical book primer content')
          assert.equal(await page.locator('#intro-heading').textContent(), 'Frankenstein')
          assert.equal(await page.locator('.intro-tabs').isVisible(), false)
          assert.equal(requests.at(-1).primerType, 'book')
          assert.equal(requests.at(-1).editionKey, 'original-en')
          await opening.locator('summary').filter({ hasText: /^Structure$/ }).click()
          await opening.locator('summary').filter({ hasText: /^The address$/ }).click()
          assert.equal(await opening.getByText(quote, { exact: true }).count(), 1)
          await opening.locator('summary').filter({ hasText: /^Watch & explore$/ }).click()
          assert.equal(await opening.getByRole('link', { name: 'Frankenstein manuscripts', exact: true }).getAttribute('href'), editorialResources[0].url)
          assert.equal(await opening.evaluate(el => el.scrollWidth > el.clientWidth + 1), false)
          await page.screenshot({ path: `${output}/${engine}-${phone ? 'phone' : 'margin'}-opening.png` })
          await page.locator('#begin-reading').click()
          await page.waitForURL('**/reader')
          await page.waitForFunction(() => document.querySelector('.lab')?.dataset.readerReady === 'true', null, { timeout: 45000 })
          const resumed = await page.evaluate(() => JSON.parse(localStorage.getItem('tinct-lab-position') || '{}').books?.frankenstein)
          assert.equal(resumed.sequentialChapter, 1)
          assert.equal(resumed.paragraphIndex, beforeBookPrimer.paragraphIndex)
          await page.goto(`${origin}/library?book=frankenstein&edition=original-en&view=book-detail`)
          await page.locator('#book-overlay:not([hidden])').waitFor()
          if (phone) await page.locator('#slip-next').click()
          await opening.waitFor()
          await opening.locator('summary').filter({ hasText: /^Structure$/ }).click()
          await opening.locator('summary').filter({ hasText: /^The address$/ }).click()
          await opening.getByRole('button', { name: 'Read passage' }).last().click()
          await page.waitForURL('**/reader?**')
          await page.waitForFunction(() => document.querySelector('.lab')?.dataset.readerReady === 'true', null, { timeout: 45000 })
          await page.waitForFunction(() => { const place = JSON.parse(localStorage.getItem('tinct-lab-position') || '{}').books?.frankenstein; return place?.paragraphIndex === 3 && place?.sequentialChapter === 2 }, null, { timeout: 15000 })
          for (const variant of variants) {
            await page.waitForLoadState('networkidle')
            await page.goto(`${origin}/reader?book=${variant.id}&edition=${variant.edition}&chapter=${variant.chapter}&paragraph=0&word=0&sharedReader=1&layout=${phone ? 'phone' : 'desktop'}${phone ? '' : '&view=margin'}`)
            await page.waitForFunction(() => document.querySelector('.lab')?.dataset.readerReady === 'true', null, { timeout: 45000 })
            const position = () => page.evaluate(() => Object.entries(JSON.parse(localStorage.getItem('tinct-lab-position') || '{}').books || {}).map(([id, p]) => [id, p.sequentialChapter, p.paragraphIndex, p.wordIndex]))
            const before = await position()
            await page.getByTestId('lab-unit-primer').first().click()
            const variedPrimer = page.locator('.book-primer-content:visible').first()
            await variedPrimer.waitFor()
            assert.equal(requests.at(-1).bookId, variant.id)
            assert.equal(requests.at(-1).editionKey, variant.edition)
            assert.equal(requests.at(-1).chapterNumber, variant.chapter)
            await variedPrimer.locator('summary').filter({ hasText: /^Structure$/ }).click()
            await variedPrimer.locator('summary').filter({ hasText: /^The address$/ }).click()
            assert.equal(await variedPrimer.getByText(variant.source.paragraphs[3].replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim(), { exact: true }).count(), 1)
            if (phone) {
              await page.getByPlaceholder('Ask a follow-up', { exact: true }).fill('A local draft about this passage')
              await page.setViewportSize({ width: 390, height: 500 })
              assert.equal(await variedPrimer.evaluate(el => el.scrollWidth > el.clientWidth + 1), false)
              await page.setViewportSize({ width: 390, height: 844 })
            }
            assert.deepEqual(await position(), before, 'opening, expanding and drafting preserve position')
            await page.screenshot({ path: `${output}/${engine}-${phone ? 'phone' : 'margin'}-${variant.id}.png` })
            console.log(`${engine} ${phone ? 'phone' : 'margin'} ${variant.id}: exact source request, quote, disclosure and place PASS`)
          }
          assert.deepEqual(errors, [])
          console.log(`${engine} ${phone ? 'phone' : 'margin'}: chapter disclosures, quote navigation, and book primer preserving place PASS`)
        } catch (error) { await page.screenshot({ path: `${output}/${engine}-${phone ? 'phone' : 'margin'}-failure.png` }); console.error(errors, failedRequests); throw error } finally { await context.close() }
      }
    } finally { await browser.close() }
  }
} finally { await new Promise(resolve => server.close(resolve)) }
