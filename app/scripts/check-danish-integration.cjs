const fs = require('node:fs')
const path = require('node:path')
const http = require('node:http')
const assert = require('node:assert/strict')
const { chromium, webkit } = require('playwright')
const { buildSync } = require('esbuild')
const { markInternal } = require('./lib/internalTraffic.cjs')
const sources = require('../src/data/danishEditionSources.json')
const out = process.env.ARTIFACT_DIR || 'artifacts/danish-integration'
const origin = process.env.TINCT_ORIGIN || 'http://127.0.0.1:5214'
const ids = process.env.DANISH_QA_BOOKS ? process.env.DANISH_QA_BOOKS.split(',') : Object.keys(sources)
const compiled = buildSync({ entryPoints: ['src/lab/labHearing.ts'], bundle: true, platform: 'node', format: 'cjs', write: false }).outputFiles[0].text
const exported = { exports: {} }
new Function('module', 'exports', 'require', compiled)(exported, exported.exports, require)
const { tokenizeHearingWords } = exported.exports
fs.mkdirSync(out, { recursive: true })
let server
if (!process.env.TINCT_ORIGIN) server = http.createServer((req, res) => {
  const url = new URL(req.url, origin)
  const file = path.resolve('dist', '.' + (url.pathname === '/reader' ? '/app.html' : url.pathname))
  if (!file.startsWith(path.resolve('dist') + '/') || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
    res.writeHead(404, { 'Content-Type': 'application/json' }); res.end('{}'); return
  }
  res.setHeader('Content-Type', { '.js': 'application/javascript', '.css': 'text/css', '.json': 'application/json', '.html': 'text/html', '.woff2': 'font/woff2' }[path.extname(file)] || 'application/octet-stream')
  fs.createReadStream(file).pipe(res)
}).listen(5214)

async function snapshot(page) {
  return page.evaluate(() => {
    const root = document.querySelector('[data-testid="lab-root"]')
    const words = [...document.querySelectorAll('.lab-page-wrap [data-testid="lab-word"]')].filter(el => {
      if (el.closest('.lab-book-col-compare')) return false
      const r = el.getBoundingClientRect()
      return r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < innerHeight
    })
    const outside = words.flatMap(el => {
      const r = el.getBoundingClientRect(), parent = el.closest('.lab-hearing-stage')
      if (!parent) return []
      const box = parent.getBoundingClientRect()
      return r.left < box.left - 3 || r.right > box.right + 3 || r.top < box.top - 3 || r.bottom > box.bottom + 3
        ? [{ text: el.textContent, word: el.dataset.paragraphIndex + ':' + el.dataset.wordIndex, rect: r.toJSON(), bounds: box.toJSON() }] : []
    })
    const coords = words.map(el => el.dataset.paragraphIndex + ':' + el.dataset.wordIndex)
    return { chapter: Number(root?.dataset.chapter), edition: root?.dataset.readerEdition, ready: root?.dataset.readerReady, lang: root?.lang, place: root?.dataset.place, coords, key: root?.dataset.chapter + '/' + coords.join(','), outside, horizontalOverflow: document.documentElement.scrollWidth > innerWidth + 2 }
  })
}

async function settled(page) {
  await page.waitForFunction(() => document.querySelector('[data-testid="lab-root"]')?.dataset.readerReady === 'true')
  await page.locator('.lab-page-wrap [data-testid="lab-word"]').first().waitFor()
  await page.evaluate(() => document.fonts.ready)
  let before = await snapshot(page)
  for (let i = 0; i < 12; i++) {
    await page.waitForTimeout(90)
    const after = await snapshot(page)
    if (before.key === after.key && after.coords.length) return after
    before = after
  }
  throw new Error('Pagination did not settle')
}

async function open(page, id, chapter, paragraphIndex, phone) {
  await page.evaluate(({ id, chapter, paragraphIndex }) => {
    sessionStorage.setItem('tinct:lab-reader-handoff', JSON.stringify({ kind: 'open-reader', bookId: id, primaryEditionKey: 'modern-da', compareEditionKey: 'modern-en', savedPlace: { bookId: id, chapterNumber: chapter, paragraphIndex, wordIndex: 0, page: 0 } }))
  }, { id, chapter, paragraphIndex })
  await page.goto(origin + '/reader' + (phone ? '?layout=phone' : '?layout=desktop'), { waitUntil: 'domcontentloaded' })
  const state = await settled(page)
  assert.equal(state.chapter, chapter, id + ' chapter handoff')
  assert.equal(state.edition, 'modern-da', id + ' exact Danish identity')
  assert.equal(state.lang, 'da')
  assert.equal(await page.getByTestId('edition-hold').count(), 0)
  return state
}

async function compare(page, phone) {
  if (!phone) {
    await page.getByTestId('lab-super').click()
    await page.getByTestId('lab-super-row-editions').click()
    await page.getByTestId('lab-v2-show-compare').click()
  } else {
    await page.getByTestId('lab-book').evaluate(el => {
      el.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerId: 71, pointerType: 'touch', clientX: 190, clientY: 400 }))
      el.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, pointerId: 71, pointerType: 'touch', clientX: 190, clientY: 270 }))
    })
  }
}

async function checkBook(browser, id, device, phone) {
  const data = JSON.parse(fs.readFileSync('public/data/editions/' + id + '-modern-da.json', 'utf8'))
  const dir = path.join(out, id, device)
  fs.mkdirSync(dir, { recursive: true })
  const context = await browser.newContext({ viewport: phone ? { width: 390, height: 844 } : { width: 1440, height: 950 }, isMobile: phone, hasTouch: phone, serviceWorkers: 'block' })
  const page = await context.newPage(), errors = [], requests = [], cases = [], issues = [], failures = []
  page.setDefaultTimeout(30000)
  page.on('pageerror', error => errors.push(error.message))
  page.on('requestfailed', request => failures.push({ url: request.url(), error: request.failure()?.errorText }))
  await page.route('**/api/**', route => {
    if (/\/api\/(?:narration\/ensure|audio-file|audio-manifest)/.test(route.request().url())) requests.push(route.request().url())
    return route.fulfill({ status: 404, contentType: 'application/json', body: '{}' })
  })
  await page.route('**/*.supabase.co/**', route => route.fulfill({ status: 200, contentType: 'application/json', body: '[]' }))
  await page.addInitScript(() => {
    if (!localStorage.getItem('danish-qa-init')) {
      localStorage.setItem('danish-qa-init', '1')
      localStorage.setItem('tinct:wipe-v1-done', '1')
      localStorage.setItem('tinct-lab-prefs', JSON.stringify({ primaryEdition: 'modern-da', compareEdition: 'modern-en', compareOpen: true }))
      localStorage.setItem('tinct:reader-compare-view', '{}')
    }
    HTMLMediaElement.prototype.play = async function () { this.muted = true }
    if (navigator.mediaDevices) Object.defineProperty(navigator.mediaDevices, 'getUserMedia', { configurable: true, value: async () => { throw Error('Microphone disabled during Danish QA') } })
  })
  // Obtain the origin before seeding the actual handoff.
  await page.goto(origin + '/privacy.html', { waitUntil: 'domcontentloaded' })
  try {
    const record = async (state, label) => {
      assert.equal(state.edition, 'modern-da')
      assert.equal(state.lang, 'da')
      if (state.outside.length || state.horizontalOverflow) issues.push({ label, ...state })
      await page.screenshot({ path: path.join(dir, label + '.png') })
      return { label, chapter: state.chapter, place: state.place, visibleWords: state.coords.length }
    }
    const full = [...new Set([0, data.chapters.length - 1])]
    for (const index of full) {
      const chapter = data.chapters[index], seen = new Set(), pageKeys = new Set()
      let state = await open(page, id, chapter.number, 0, phone), count = 0
      const expected = chapter.paragraphs.flatMap((p, i) => tokenizeHearingWords(p).map((_, j) => i + ':' + j))
      for (;;) {
        assert.equal(state.chapter, chapter.number)
        assert.ok(!pageKeys.has(state.key), id + ' duplicate physical page')
        pageKeys.add(state.key)
        for (const coordinate of state.coords) seen.add(coordinate)
        cases.push(await record(state, 'ch' + chapter.number + '-p' + String(++count).padStart(3, '0')))
        if (expected.every(key => seen.has(key))) break
        assert.ok(count < 500, id + ' chapter pagination ceiling')
        const old = state.key
        await page.keyboard.press('ArrowRight')
        await page.waitForFunction(old => {
          const root = document.querySelector('[data-testid="lab-root"]')
          const coords = [...document.querySelectorAll('.lab-page-wrap [data-testid="lab-word"]')].filter(el => !el.closest('.lab-book-col-compare') && el.getBoundingClientRect().width > 0).map(el => el.dataset.paragraphIndex + ':' + el.dataset.wordIndex)
          return root?.dataset.chapter + '/' + coords.join(',') !== old
        }, old)
        state = await settled(page)
      }
      assert.deepEqual(expected.filter(key => !seen.has(key)), [], id + ' every source word shown')
      console.log(id, device, 'chapter', chapter.number, count, 'pages, all', expected.length, 'words shown')
    }
    // Ten deterministic chapters across the interior, first/middle/last logical
    // paragraphs: three physical pages per chapter, with no invented page count.
    const samples = [...new Set(Array.from({ length: 10 }, (_, i) => Math.min(data.chapters.length - 1, Math.floor((i + 1) * data.chapters.length / 11))))].filter(i => !full.includes(i))
    for (const index of samples) {
      const chapter = data.chapters[index]
      for (const p of [...new Set([0, Math.floor(chapter.paragraphs.length / 2), chapter.paragraphs.length - 1])]) {
        const state = await open(page, id, chapter.number, p, phone)
        cases.push(await record(state, 'sample-ch' + chapter.number + '-para' + p))
      }
    }
    await open(page, id, data.chapters[0].number, 0, phone)
    const place = await page.getByTestId('lab-root').getAttribute('data-place')
    await compare(page, phone)
    await page.waitForFunction(() => document.querySelector('[data-testid="lab-root"]')?.dataset.compareActive === 'true')
    await page.screenshot({ path: path.join(dir, 'compare.png') })
    await compare(page, phone)
    await page.waitForFunction(() => document.querySelector('[data-testid="lab-root"]')?.dataset.compareActive === 'false')
    assert.equal(await page.getByTestId('lab-root').getAttribute('data-place'), place, 'Compare retains Danish place')
    await page.reload()
    const restored = await settled(page)
    assert.equal(restored.edition, 'modern-da')
    assert.equal(restored.place, place, 'Reload retains Danish place')
    assert.deepEqual(errors, [], id + ' page errors')
    assert.deepEqual(requests, [], id + ' text-only edition asks for no narration or recordings')
    const result = { id, device, engine: phone ? 'webkit' : 'chromium', pages: cases.length, cases, issues, compare: true, reload: true, errors, audioRequests: requests }
    fs.writeFileSync(path.join(dir, 'results.json'), JSON.stringify(result, null, 2))
    assert.deepEqual(issues, [], id + ' text inside page bounds')
    return result
  } catch (error) {
    await page.screenshot({ path: path.join(dir, 'failure.png') }).catch(() => {})
    const diagnostic = { id, device, url: page.url(), state: await snapshot(page).catch(() => null), errors, failures, lastCase: cases.at(-1), message: String(error) }
    fs.writeFileSync(path.join(dir, 'failure.json'), JSON.stringify(diagnostic, null, 2))
    console.error(JSON.stringify(diagnostic))
    throw error
  } finally { await context.close() }
}

;(async () => {
  const results = []
  const browsers = { phone: await markInternal(await webkit.launch()), desktop: await markInternal(await chromium.launch({ args: ['--mute-audio'] })) }
  try {
    for (const id of ids) {
      const devices = ['phone', 'desktop'].filter(device => !process.env.DANISH_QA_DEVICE || process.env.DANISH_QA_DEVICE === device)
      const checked = await Promise.all(devices.map(device => checkBook(browsers[device], id, device, device === 'phone')))
      results.push(...checked)
      fs.writeFileSync(path.join(out, 'results.json'), JSON.stringify(results, null, 2))
    }
  } finally { await Promise.all(Object.values(browsers).map(b => b.close())); if (server) server.close() }
})().catch(error => { console.error(error); if (server) server.close(); process.exitCode = 1 })
