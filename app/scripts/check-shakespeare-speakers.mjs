import { chromium, webkit, devices } from '@playwright/test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import { registerShakespeareSpeakers, verseSpeakerEnd } from '../src/lab/labVerseLines.ts'
const live = process.env.SHAKESPEARE_LIVE === '1'
const origin = 'https://tinct.app', output = 'artifacts/shakespeare-speakers'
await fs.mkdir(output, { recursive: true })
const results = []
async function prepare(context) {
  await context.addInitScript(() => {
    HTMLMediaElement.prototype.play = async function () { this.muted = true }
    if (navigator.mediaDevices) navigator.mediaDevices.getUserMedia = async () => { throw Error('Disabled for silent acceptance') }
  })
  await context.route('**/*', async route => {
    const url = new URL(route.request().url())
    if (url.origin !== origin || route.request().method() !== 'GET') return route.abort()
    if (url.pathname.startsWith('/api/')) return route.fulfill({ status: 404, json: {} })
    if (live) return route.continue()
    const file = path.resolve('dist', '.' + (url.pathname === '/reader' ? '/app.html' : url.pathname === '/library' ? '/lab/index.html' : url.pathname))
    if (file.startsWith(path.resolve('dist') + '/')) try { if ((await fs.stat(file)).isFile()) return route.fulfill({ path: file }) } catch {}
    return route.abort()
  })
}
async function boot(page, scenario) {
  await page.addInitScript(s => {
    if (sessionStorage.getItem('qa:shakespeare')) return
    sessionStorage.setItem('qa:shakespeare', '1')
    if (s.highlight) {
      localStorage.setItem('tinct-lab-highlights-tap-cleanup-v1','1')
      localStorage.setItem('tinct-lab-highlights',JSON.stringify([s.highlight]))
    }
    const appearance = { alignment: s.alignment, alignmentExplicit: s.explicit, fontSize: s.size, shakespeareLayout: s.layout, theme: s.theme || 'book' }
    localStorage.setItem('tinct-lab-prefs', JSON.stringify({ version: 2, shared: { primaryEdition: s.edition, compareOpen: true, compareEdition: s.edition === 'original-en' ? 'modern-en' : 'original-en' }, phone: appearance, desktop: appearance }))
    sessionStorage.setItem('tinct:lab-reader-handoff', JSON.stringify({ kind: 'open-reader', bookId: s.book, primaryEditionKey: s.edition, compareEditionKey: s.edition === 'original-en' ? 'modern-en' : 'original-en', savedPlace: { bookId: s.book, chapterNumber: s.chapter, paragraphIndex: s.paragraph, wordIndex: 0, page: 0 } }))
  }, scenario)
  await page.goto(origin + '/reader?chrome=v2', { waitUntil: 'domcontentloaded' })
  await page.waitForFunction(() => document.querySelector('[data-testid="lab-root"]')?.dataset.readerReady === 'true', null, { timeout: 45000 })
  await page.evaluate(() => document.fonts.ready)
  await page.waitForTimeout(800)
}
const registry = await fs.readFile('src/data/bookRegistry.ts', 'utf8')
const published = registry.match(/export const BOOKS: Book\[\] = \[([^\]]+)\]/)[1]
const books = [...registry.matchAll(/export const (\w+): Book = \{([\s\S]*?)\n\}/g)]
  .filter(([, key, body]) => published.split(',').map(s => s.trim()).includes(key) && body.includes("author: 'William Shakespeare'"))
  .map(([, , body]) => body.match(/id: '([^']+)'/)[1])
for (const [engine, browserType] of Object.entries({ chromium, webkit })) {
  const browser = await browserType.launch({ headless: true, args: engine === 'chromium' ? ['--mute-audio'] : [] })
  try {
    const scenarios = books.flatMap(book => ['original-en', 'modern-en'].map(edition => ({ book, edition, chapter: 1, paragraph: 0, size: 1.3, alignment: 'left', explicit: false, layout: 'verse', width: 1440 })))
    for (const size of [1.3, 2.2]) for (const alignment of ['left', 'justify']) scenarios.push({ book: 'hamlet', edition: 'original-en', chapter: 2, paragraph: 69, size, alignment, explicit: true, layout: 'verse', width: 1440, theme: 'dark', screenshot: true })
    for (const layout of ['verse', 'flowing']) scenarios.push({ book: 'hamlet', edition: 'original-en', chapter: 2, paragraph: 69, size: 1.3, alignment: 'left', explicit: true, layout, width: 390, phone: true })
    for (const edition of ['original-en', 'modern-en']) for (const layout of ['verse', 'flowing']) for (const compare of [false, true]) {
      scenarios.push({book:'hamlet',edition,chapter:3,paragraph:4,size:1.3,alignment:'justify',explicit:true,
        layout,width:390,phone:true,compare,theme:'dark',screenshot:true,reportedPhone:true})
    }
    for (const scenario of scenarios) {
      const visibleEdition = scenario.compare ? (scenario.edition === 'original-en' ? 'modern-en' : 'original-en') : scenario.edition
      const source = JSON.parse(await fs.readFile(`public/data/editions/${scenario.book}-${visibleEdition}.json`, 'utf8'))
      const paragraphs = source.chapters.find(c => c.number === scenario.chapter).paragraphs
      registerShakespeareSpeakers(paragraphs)
      const context = await browser.newContext({ ...(scenario.phone ? devices['iPhone 13'] : {}), viewport: { width: scenario.width, height: 900 }, reducedMotion: 'reduce', serviceWorkers: 'block' })
      await prepare(context)
      await context.tracing.start({ screenshots: true, snapshots: true })
      const page = await context.newPage()
      const name = `${engine}-${scenario.book}-${scenario.edition}-${scenario.size}-${scenario.alignment}-${scenario.width}-${scenario.layout}-ch${scenario.chapter}-${scenario.compare?'compare':'read'}`
      try {
        const highlight = scenario.reportedPhone ? {
          id:'speaker-layout-saved-mark',bookId:'hamlet',editionKey:visibleEdition,chapterNumber:3,
          paragraphIndex:4,endParagraphIndex:4,fromWord:1,toWord:Math.min(4,paragraphs[4].split(/\s+/).length),
          text:paragraphs[4].split(/\s+/).slice(1,4).join(' '),color:'sage',note:'Retain this note',kept:true,
        } : null
        await boot(page, {...scenario,highlight})
        if (scenario.compare) {
          await page.getByTestId('lab-super').click()
          await page.getByTestId('lab-super-row-editions').click()
          await page.getByTestId('lab-v2-show-compare').click()
          await page.waitForFunction(edition => {
            const root=document.querySelector('[data-testid="lab-root"]')
            return root?.dataset.compareActive==='true' && root.dataset.readerEdition===edition
          }, visibleEdition)
          await page.waitForTimeout(800)
        }
        if (scenario.reportedPhone) {
          // Compare opens the natural page containing the primary page head.
          // Its text is shorter/longer, so the reported Ophelia line can lie on
          // the following page. Reach that exact line before judging its mark.
          const markedLine=page.locator('[data-highlight-id="speaker-layout-saved-mark"]')
          for(let turn=0;turn<3 && await markedLine.count()===0;turn++){
            const head=await page.getByTestId('lab-root').evaluate(root=>[...root.querySelectorAll('[data-testid="lab-word"]')]
              .filter(n=>n.getBoundingClientRect().width>0&&!n.closest('.lab-page-measure'))
              .map(n=>n.dataset.paragraphIndex+':'+n.dataset.wordIndex).join(','))
            console.log('REACH_REPORTED_LINE',name,turn,head)
            await page.keyboard.press('ArrowRight')
            await page.waitForFunction(value=>[...document.querySelectorAll('[data-testid="lab-root"] [data-testid="lab-word"]')]
              .filter(n=>n.getBoundingClientRect().width>0&&!n.closest('.lab-page-measure'))
              .map(n=>n.dataset.paragraphIndex+':'+n.dataset.wordIndex).join(',')!==value,head)
          }
          assert(await markedLine.count()>0,name+' reaches the saved reported line')
        }
        const actual = await page.getByTestId('lab-root').evaluate(root => {
          const visible = n => n.getBoundingClientRect().width > 0 && !n.closest('.lab-page-measure')
          const words = [...root.querySelectorAll('[data-testid="lab-word"]')].filter(visible)
          const labels = [...root.querySelectorAll('.lab-verse-speaker')].filter(n => !n.closest('.lab-page-measure') && n.querySelector('[data-testid="lab-word"]'))
          return {
            words: words.map(n => ({ p: Number(n.dataset.paragraphIndex), i: Number(n.dataset.wordIndex), label: !!n.closest('.lab-verse-speaker') })),
            labels: labels.map(n => ({ text: n.textContent.trim(), display: getComputedStyle(n).display, size: parseFloat(getComputedStyle(n).fontSize), parentSize: parseFloat(getComputedStyle(n.parentElement).fontSize) })),
            overflow: document.documentElement.scrollWidth > innerWidth + 1,
          }
        })
        assert(actual.words.length > 0)
        assert(!actual.overflow)
        for (const word of actual.words) assert.equal(word.label, verseSpeakerEnd(paragraphs[word.p], word.i) > word.i, `${name} paragraph ${word.p} word ${word.i} label coverage`)
        {
          assert(actual.labels.length > 0, name + ' has speaker labels')
          for (const label of actual.labels) {
            assert.equal(label.display, 'block', name + ' ' + label.text)
            assert(Math.abs(label.size - Math.max(14, label.parentSize * .63)) < 1, name + ' label size')
          }
        }
        if (scenario.screenshot || scenario.edition === 'original-en') await page.screenshot({ path: `${output}/${name}.png` })
        if (scenario.screenshot && scenario.size === 1.3 && scenario.alignment === 'left') {
          const encoded = (await page.screenshot({ type: 'jpeg', quality: 70 })).toString('base64')
          console.log('REVIEW_BEGIN', engine + '-reported-passage')
          for (let offset = 0; offset < encoded.length; offset += 4000) console.log('REVIEW_CHUNK', encoded.slice(offset, offset + 4000))
          console.log('REVIEW_END', engine + '-reported-passage')
        }
        if (scenario.reportedPhone) {
          const root=page.getByTestId('lab-root')
          const visibleWords=()=>root.evaluate(root=>[...root.querySelectorAll('[data-testid="lab-word"]')]
            .filter(n=>n.getBoundingClientRect().width>0&&!n.closest('.lab-page-measure'))
            .map(n=>n.dataset.paragraphIndex+':'+n.dataset.wordIndex).join(','))
          // A restored word may sit inside this page. Page turns persist page heads,
          // so compare the visible word range rather than that interior restore anchor.
          const before=await visibleWords()
          console.log('PHONE_PAGE_BEFORE',name,await root.getAttribute('data-place'),before)
          assert((await page.locator('[data-highlight-id="speaker-layout-saved-mark"]').count())>0,name+' paints saved highlight')
          const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('tinct-lab-highlights')||'[]'))
          assert.deepEqual(saved,[highlight],name+' preserves saved quote and note')
          await page.keyboard.press('ArrowRight')
          await page.waitForFunction(value=>[...document.querySelectorAll('[data-testid="lab-root"] [data-testid="lab-word"]')]
            .filter(n=>n.getBoundingClientRect().width>0&&!n.closest('.lab-page-measure'))
            .map(n=>n.dataset.paragraphIndex+':'+n.dataset.wordIndex).join(',')!==value,before)
          console.log('PHONE_PAGE_FORWARD',name,await root.getAttribute('data-place'),await visibleWords())
          await page.keyboard.press('ArrowLeft')
          await page.waitForFunction(value=>[...document.querySelectorAll('[data-testid="lab-root"] [data-testid="lab-word"]')]
            .filter(n=>n.getBoundingClientRect().width>0&&!n.closest('.lab-page-measure'))
            .map(n=>n.dataset.paragraphIndex+':'+n.dataset.wordIndex).join(',')===value,before)
          assert.equal(await visibleWords(),before,name+' restores every visible word')
          assert((await page.locator('[data-highlight-id="speaker-layout-saved-mark"]').count())>0,name+' restores saved highlight')
          console.log('PHONE_PAGE_RETURN',name,await root.getAttribute('data-place'))
          assert.deepEqual(await page.evaluate(()=>JSON.parse(localStorage.getItem('tinct-lab-highlights')||'[]')),[highlight])
        }
        results.push({ name, labels: actual.labels, wordCount: actual.words.length })
        console.log('PASS', name)
      } catch (error) { await context.tracing.stop({path: `${output}/${name}-trace.zip`}); await page.screenshot({ path: `${output}/${name}-failure.png` }); throw error }
      finally { await context.tracing.stop().catch(()=>{}); await context.close() }
    }
  } finally { await browser.close(); await fs.writeFile(`${output}/results.json`, JSON.stringify(results, null, 2)) }
}
