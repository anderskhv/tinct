// Isolated, muted reader acceptance for the reviewed WEB Revelation cleanup.
const { chromium, webkit } = require('playwright')
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict')
const origin = process.env.TEST_ORIGIN || 'https://tinct.app'
const dir = process.env.ARTIFACT_DIR || 'artifacts/web-revelation'
fs.mkdirSync(dir, { recursive: true })
const asset = JSON.parse(fs.readFileSync('public/data/characters/bible.v1.json', 'utf8'))
const edition = JSON.parse(fs.readFileSync('public/data/editions/bible-web-en.json', 'utf8'))
const chapter = edition.chapters.find(ch => ch.number === 1189)
assert.equal(chapter.paragraphs.length, 5)
assert.equal(chapter.paragraphs[4], '²¹ The grace of the Lord Jesus Christ be with all the saints. Amen.')
const m = asset.editions['web-en'].mentions.find(m => m.chapterNumber === 1189 && m.paragraphIndex === 4 && m.characterId === 'jesus')
assert.ok(m)
const wordIndex = [...chapter.paragraphs[4].matchAll(/\S+/g)].findIndex(w => w.index === m.startOffset)
assert.ok(wordIndex >= 0)
;(async () => {
 const results = []
 for (const [device, engine] of [['phone', webkit], ['desktop', chromium]]) {
  const browser = await engine.launch()
  try {
   const page = await browser.newPage({ viewport: device === 'phone' ? { width: 390, height: 844 } : { width: 1440, height: 950 }, isMobile: device === 'phone', hasTouch: device === 'phone' })
   page.setDefaultTimeout(30000)
   const responses = [], checks = []
   page.on('response', response => {
    const url = new URL(response.url())
    const targets = ['/data/characters/bible.v1.json', '/data/editions/bible-web-en.json', '/data/editions-chapters/bible-web-en/ch1189.json']
    if (targets.includes(url.pathname)) checks.push((async () => {
     assert.equal(response.status(), 200)
     assert.deepEqual(await response.body(), fs.readFileSync('public' + url.pathname))
     responses.push(url.pathname + url.search)
    })())
   })
   await page.context().tracing.start({ screenshots: true, snapshots: true })
   if (process.env.READER_BUILT === '1') await page.route('**/*', async route => {
    const url = new URL(route.request().url())
    if (url.origin === origin) {
     const file = path.resolve('dist', '.' + (url.pathname === '/reader' ? '/app.html' : url.pathname))
     if (file.startsWith(path.resolve('dist') + '/') && fs.existsSync(file) && fs.statSync(file).isFile()) return route.fulfill({ path: file })
     return route.abort()
    }
    return route.continue()
   })
   await page.route('**/api/**', route => route.fulfill({ status: 404, body: '{}' }))
   await page.addInitScript(({ wordIndex }) => {
    sessionStorage.setItem('tinct:lab-reader-handoff', JSON.stringify({ kind: 'open-reader', bookId: 'bible', primaryEditionKey: 'web-en', compareEditionKey: 'kjv-en', savedPlace: { bookId: 'bible', chapterNumber: 1189, paragraphIndex: 4, wordIndex, page: 0 } }))
   }, { wordIndex })
   try {
    await page.goto(origin + '/reader')
    await page.waitForFunction(() => document.querySelector('.lab')?.dataset.readerReady === 'true')
    const word = page.locator(`.lab-page-wrap [data-paragraph-index="4"][data-word-index="${wordIndex}"]`).first()
    await word.waitFor()
    await page.waitForTimeout(1200)
    assert.match(await page.locator('.lab-page-wrap').first().innerText(), /Amen\./)
    assert.doesNotMatch(await page.locator('.lab-page-wrap').first().innerText(), /PROJECT GUTENBERG/)
    await page.screenshot({ path: `${dir}/${device}-reader.png` })
    const place = await page.getByTestId('lab-root').getAttribute('data-place')
    if (device === 'desktop') await word.click()
    else await word.evaluate(async node => {
     const box = node.getBoundingClientRect(), article = node.closest('article')
     const event = { pointerType: 'touch', pointerId: 1, button: 0, buttons: 1, isPrimary: true, bubbles: true, cancelable: true, clientX: box.x + box.width / 2, clientY: box.y + box.height / 2 }
     node.dispatchEvent(new PointerEvent('pointerdown', event))
     await new Promise(resolve => setTimeout(resolve, 400))
     article.dispatchEvent(new PointerEvent('pointerup', { ...event, buttons: 0 }))
    })
    await page.locator('[data-popup-mode="character"]').waitFor()
    assert.match(await page.locator('.popup-character h2').innerText(), /Jesus/)
    assert.equal(await page.getByTestId('lab-root').getAttribute('data-place'), place)
    assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem('tinct-lab-highlights') || '[]').length), 0)
    await Promise.all(checks)
    for (const prefix of ['/data/characters/bible.v1.json?', '/data/editions/bible-web-en.json?', '/data/editions-chapters/bible-web-en/ch1189.json?']) assert.ok(responses.some(url => url.startsWith(prefix)), prefix)
    await page.screenshot({ path: `${dir}/${device}-card.png` })
    results.push({ device, place, responses })
    await page.context().tracing.stop()
   } catch (error) {
    await page.screenshot({ path: `${dir}/${device}-failed.png` })
    await page.context().tracing.stop({ path: `${dir}/${device}-trace.zip` })
    throw error
   }
  } finally { await browser.close() }
 }
 fs.writeFileSync(`${dir}/results.json`, JSON.stringify(results, null, 2))
 console.log('Passed WEB Revelation phone and desktop acceptance')
})().catch(error => { console.error(error); process.exitCode = 1 })
