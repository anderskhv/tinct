// Built candidate acceptance: the unflagged public reader must use the same
// shared activation decision as the Library's emitted static module.
import assert from 'node:assert/strict'
import { readFile, stat } from 'node:fs/promises'
import path from 'node:path'
import { chromium } from '@playwright/test'
import { markInternal } from './lib/internalTraffic.cjs'

const dist = path.resolve(process.env.SHARED_READER_DIST || 'dist')
const origin = 'http://127.0.0.1:3001'
const activation = await readFile(path.join(dist, 'lab/shared-reader-activation.js'), 'utf8')
const emitted = await import(`data:text/javascript;base64,${Buffer.from(activation).toString('base64')}`)
assert.equal(emitted.SHARED_READER_DEFAULT, true, 'candidate must bake in the default-ON activation module')
assert.equal(emitted.sharedReaderEnabled(''), true)
assert.equal(emitted.sharedReaderEnabled('?sharedReader=0'), false)
assert.equal(emitted.sharedReaderEnabled('?sharedReader=1'), true)

const browser = await markInternal(await chromium.launch({ headless: true,
  executablePath: process.env.TINCT_CHROMIUM_EXECUTABLE || undefined,
  args: ['--mute-audio', '--no-sandbox'] }))
const context = await browser.newContext({ viewport: { width: 1280, height: 800 }, serviceWorkers: 'block' })
const page = await context.newPage()
const errors = []
page.on('pageerror', error => errors.push(error.message))
await page.route('**/*', async route => {
  const url = new URL(route.request().url())
  if (url.origin !== origin) return route.abort()
  if (url.pathname.startsWith('/api/')) return route.fulfill({ status: 404, json: {} })
  if (route.request().method() !== 'GET') return route.abort()
  const pathname = url.pathname === '/reader' ? '/app.html' : url.pathname
  const file = path.resolve(dist, '.' + pathname)
  if (!file.startsWith(dist + path.sep)) return route.abort()
  try { if ((await stat(file)).isFile()) return route.fulfill({ path: file }) } catch {}
  return route.fulfill({ status: 404, body: '' })
})
await page.addInitScript(() => {
  localStorage.setItem('tinct-lab-prefs', JSON.stringify({ primaryEdition: 'kjv-en', audioEdition: 'kjv-en', compareEdition: 'bsb-en', compareOpen: true }))
  localStorage.setItem('tinct-lab-position', JSON.stringify({
    books: { genesis: { bookId: 'genesis', headerBook: 'Genesis', chapterNumber: 1, sequentialChapter: 1,
      paragraphIndex: 4, wordIndex: 3, primaryEditionKey: 'kjv-en', updatedAt: Date.now() - 1000, deviceId: 'candidate', rev: 1 } },
    lastSettledBookId: 'genesis', lastSettledAt: Date.now() - 1000, finished: {},
  }))
})
const visit = async (search, continuous, shared = continuous) => {
  await page.goto(`${origin}/reader?book=bible${search}`, { waitUntil: 'domcontentloaded' })
  await page.waitForFunction(() => document.querySelector('.lab')?.dataset.readerReady === 'true', null, { timeout: 45000 })
  const root = page.getByTestId('lab-root')
  assert.equal(await root.getAttribute('data-shared-reader'), shared ? 'true' : null, `shared gate at ${search}`)
  assert.equal((await page.getByTestId('continuous-reader').count()) > 0, continuous, `layout at ${search}`)
  assert.equal(await root.getAttribute('data-place'), '4:3', `nonzero source word at ${search}`)
  return root
}
try {
  await visit('', true) // Public unflagged Margin, not just private ?sharedReader=1.
  await visit('&sharedReader=0', false)
  await visit('&sharedReader=1', true)
  const classic = await visit('&view=two-page', false, true)
  assert.equal(await classic.getAttribute('data-shared-reader'), 'true', 'private Classic remains available')
  const appearance = page.getByTestId('lab-header-aa')
  const aaBox = await appearance.boundingBox()
  assert(aaBox && aaBox.x >= 0 && aaBox.x + aaBox.width <= 1280 && aaBox.y >= 0 && aaBox.y + aaBox.height <= 800, 'Aa is visible without scrolling')
  await appearance.click()
  await page.getByTestId('lab-v2-layout-compare').waitFor({ timeout: 15000 })
  await page.getByTestId('lab-v2-layout-compare').click()
  await page.waitForFunction(() => document.querySelector('.lab')?.dataset.compareActive === 'true', null, { timeout: 15000 })
  assert.equal(await page.getByTestId('continuous-reader').count(), 0, 'paired Compare retains paged layout')
  assert.equal(await classic.getAttribute('data-place'), '4:3', 'Compare preserves semantic source word')
  await appearance.click()
  await page.getByTestId('lab-v2-layout-margin').click()
  await page.getByTestId('continuous-reader').waitFor()
  assert.equal(await classic.getAttribute('data-place'), '4:3', 'Aa returns to Margin at the same source word')
  assert.deepEqual(errors, [], 'no public route errors')
  console.log('Built default-ON public Margin, =0 fallback, =1 preview, Classic and Compare passed')
} finally { await browser.close() }
