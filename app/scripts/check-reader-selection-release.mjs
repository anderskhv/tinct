// Isolated, muted visual acceptance for the wider margin reader and quiet header.
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import { createServer } from 'node:http'
import { enforceReaderBundle } from './lib/readerParityAssertions.mjs'
import { chromium, webkit } from '@playwright/test'
import { markInternal } from './lib/internalTraffic.cjs'
const dist = path.resolve(process.env.TINCT_DIST || 'dist')
const server = createServer(async (req, res) => {
  const url = new URL(req.url || '/', 'http://127.0.0.1')
  const file = path.resolve(dist, '.' + (url.pathname === '/reader' ? '/app.html' : url.pathname))
  if (!file.startsWith(dist + path.sep)) { res.writeHead(403); res.end(); return }
  try {
    const body = await fs.readFile(file)
    const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.woff2': 'font/woff2', '.svg': 'image/svg+xml' }[path.extname(file)] || 'application/octet-stream'
    res.writeHead(200, { 'Content-Type': mime }); res.end(body)
  } catch { res.writeHead(404); res.end() }
})
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
const origin = process.env.TINCT_ORIGIN || `http://127.0.0.1:${server.address().port}`
const expectedBundle = process.env.TINCT_EXPECTED_BUNDLE || ''
const output = process.env.TINCT_SELECTION_OUTPUT || '/tmp/tinct-selection-release'
await fs.mkdir(output, { recursive: true })
const results = []
const cases=[]
for (const grouped of [false,true]) for (const direction of ['forward','backward']) for (const includeBoth of [false,true]) cases.push({grouped,direction,includeBoth,wrapped:false})
for (const direction of ['forward','backward']) cases.push({grouped:false,direction,includeBoth:true,wrapped:true})
try {
  for (const [engineName, engine] of [['chromium', chromium], ...(process.env.TINCT_SELECTION_WEBKIT === '1' ? [['webkit', webkit]] : [])]) {
    const browser = await markInternal(await engine.launch({ headless: true, args: engineName === 'chromium' ? ['--mute-audio'] : [] }))
    try {
      for (const {grouped,direction,includeBoth,wrapped} of cases) {
        const context = await browser.newContext({ viewport: { width: wrapped ? 1320 : 1440, height: wrapped ? 1100 : 1000 }, serviceWorkers: 'block', reducedMotion: 'reduce' })
        const page = await context.newPage(), errors=[]
        page.on('pageerror',error=>errors.push(error.message))
        await page.route('**/*', async route => {
          const url = new URL(route.request().url())
          if (url.origin !== origin) return route.abort()
          if (await enforceReaderBundle(route, expectedBundle)) return
          if (url.pathname.startsWith('/api/')) return route.fulfill({ status: 404, json: {} })
          return route.continue()
        })
        await page.addInitScript(wrapped => {
          localStorage.setItem('tinct-lab-prefs', JSON.stringify({ theme: 'book', primaryEdition: 'webc-en', ...(wrapped ? {fontSize:2.2,fontSizeExplicit:true} : {}) }))
          localStorage.setItem('tinct-highlight-color', 'rose')
          Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async text=>{window.__selectionCopied=text}}})
        },wrapped)
        await page.goto(`${origin}/reader?book=bible&edition=webc-en&chapter=1309&paragraph=3&word=${wrapped ? 95 : 0}&sharedReader=1&layout=desktop&view=margin`)
        await page.waitForFunction(() => document.querySelector('.lab')?.dataset.readerReady === 'true' && document.querySelector('.lab')?.dataset.readerEdition === 'webc-en')
        await page.evaluate(() => document.fonts.ready)
        await page.waitForFunction(() => !document.querySelector('.lab')?.dataset.readingScroll)
        const words = page.locator('.continuous-reader [data-testid="lab-word"][data-paragraph-index="3"]')
        await words.first().waitFor()
        if (grouped) {
          const seed = await words.evaluateAll(nodes => {
            const source=nodes.map(node=>({text:node.textContent,w:Number(node.dataset.wordIndex)}))
            const friend=source.findIndex(word=>word.text.toLowerCase().replace(/[^a-z]/g,'')==='friend')
            const start=source.findIndex((word,index)=>index>friend&&word.text.toLowerCase().replace(/[^a-z]/g,'')==='always')
            const text=source.filter(word=>word.w>=95&&word.w<114).map(word=>word.text).join(' ').replace(/\s+/g,' ').trim()
            return {id:'seed-sirach-overlap',groupId:'seed-sirach-group',bookId:'bible',editionKey:'webc-en',chapterNumber:1309,paragraphIndex:3,fromWord:source[start].w,endParagraphIndex:3,toWord:114,text,groupText:text,color:'gold',updatedAt:Date.now()}
          })
          await page.evaluate(seed=>localStorage.setItem('tinct-lab-highlights',JSON.stringify([seed])),seed)
          await page.reload()
          await page.waitForFunction(()=>document.querySelector('.lab')?.dataset.readerReady==='true'&&document.querySelector('.lab')?.dataset.readerEdition==='webc-en')
          await page.evaluate(()=>document.fonts.ready)
          await page.waitForFunction(()=>!document.querySelector('.lab')?.dataset.readingScroll)
          await words.first().waitFor()
        }
        // Font rasterization differs across CI hosts. Find an actual line boundary
        // in the rendered source instead of assuming one viewport puts “both.”
        // after “than”. The assertions below still require the wrapped geometry.
        if (wrapped) {
          let found = false
          for (const width of [1320, ...Array.from({length: 151}, (_, index) => 1120 + index * 4)]) {
            await page.setViewportSize({width, height:1100})
            await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))))
            const boundary = await words.evaluateAll(nodes => {
              const friend = nodes.findIndex(node => node.textContent.toLowerCase().replace(/[^a-z]/g, '') === 'friend')
              const index = nodes.findIndex((node, index) => index > friend && node.textContent.toLowerCase().replace(/[^a-z]/g, '') === 'both')
              return index > 0 && nodes[index].getBoundingClientRect().y > nodes[index - 1].getBoundingClientRect().y + 5
            })
            if (boundary) { found = true; break }
          }
          assert(found, 'rendered Sirach fixture has a viewport where both begins the next line')
          await page.waitForFunction(() => !document.querySelector('.lab')?.dataset.readingScroll)
        }
        const source = await words.evaluateAll(nodes => nodes.map(node => ({ text:node.textContent, p:Number(node.dataset.paragraphIndex), w:Number(node.dataset.wordIndex), rect:node.getBoundingClientRect().toJSON() })))
        const friend = source.findIndex(word => word.text.toLowerCase().replace(/[^a-z]/g, '') === 'friend')
        const start = source.findIndex((word,index)=>index>friend&&word.text.toLowerCase().replace(/[^a-z]/g,'')==='always')
        const both = source.findIndex((word,index) => index > friend && word.text.toLowerCase().replace(/[^a-z]/g, '') === 'both')
        assert(start >= 0 && both > start, 'Sirach 40:23 source words are mounted')
        if (wrapped) assert(source[both].rect.y > source[both-1].rect.y + 5, 'large type places both on the next line after than')
        const end = includeBoth ? both : both - 1
        const expected = source.slice(start, end + 1).map(word => ({ p:word.p,w:word.w,text:word.text }))
        const first = source[direction === 'forward' ? start : end], last = source[direction === 'forward' ? end : start]
        const firstPoint = { x:first.rect.x + first.rect.width / 2, y:first.rect.y + first.rect.height / 2 }
        const lastPoint = { x:direction === 'forward' ? last.rect.right - 1 : last.rect.x + 1, y:last.rect.y + last.rect.height / 2 }
        const selected = () => page.locator('.continuous-reader .lab-hearing-word.is-selecting').evaluateAll(nodes => nodes.map(node => ({p:Number(node.dataset.paragraphIndex),w:Number(node.dataset.wordIndex),text:node.textContent})))
        await page.mouse.move(firstPoint.x,firstPoint.y); await page.mouse.down(); await page.mouse.move(lastPoint.x,lastPoint.y,{steps:18})
        const paint = () => page.evaluate(() => ({
          ranges: [...(CSS.highlights?.entries() || [])].map(([name, highlight]) => ({ name, ranges:[...highlight].map(range => ({ text:range.toString(),rects:[...range.getClientRects()].map(rect=>({x:rect.x,y:rect.y,width:rect.width,height:rect.height})) })) })),
          underlays:[...document.querySelectorAll('.continuous-reader .lab-highlight-fill,.continuous-reader .lab-highlight-seam')].map(node=>({box:node.getBoundingClientRect().toJSON(),background:getComputedStyle(node).backgroundColor}))
        }))
        await page.evaluate(() => new Promise(resolve => requestAnimationFrame(resolve)))
        const before = await selected(), beforePaint = await paint()
        await page.screenshot({path:`${output}/${engineName}-${wrapped?'wrapped':'normal'}-${grouped ? 'grouped' : 'clean'}-${direction}-${includeBoth ? 'both' : 'before-both'}-during.png`})
        await page.mouse.up()
        await page.getByTestId('lab-desk-bar').waitFor()
        const after = await selected(), afterPaint = await paint()
        const result = { engine:engineName,grouped,direction,includeBoth,wrapped,expected,before,after,beforePaint,afterPaint,firstPoint,lastPoint }
        results.push(result)
        await page.screenshot({path:`${output}/${engineName}-${wrapped?'wrapped':'normal'}-${grouped ? 'grouped' : 'clean'}-${direction}-${includeBoth ? 'both' : 'before-both'}.png`})
        await fs.writeFile(`${output}/${engineName}-${wrapped?'wrapped':'normal'}-${grouped?'grouped':'clean'}-${direction}-${includeBoth?'both':'before-both'}.json`,JSON.stringify(result,null,2))
        console.log(JSON.stringify({engine:engineName,grouped,direction,includeBoth,wrapped,words:after.length,paintStable:JSON.stringify(beforePaint)===JSON.stringify(afterPaint)}))
        {
          assert.deepEqual(before,expected,'live drag paints exactly the intended source words')
          assert.deepEqual(after,before,'mouse release retains exactly the live source range')
          assert.deepEqual(afterPaint,beforePaint,'CSS highlight ranges and ink underlays retain their bounds on release')
          const applyAndInspect = async () => {
            const original = await page.evaluate(()=>JSON.parse(localStorage.getItem('tinct-lab-highlights') || '[]'))
            await page.getByTestId('lab-dbar-highlight').click()
            await page.waitForFunction(count=>JSON.parse(localStorage.getItem('tinct-lab-highlights') || '[]').length===count,original.length+1)
            const marks=await page.evaluate(()=>JSON.parse(localStorage.getItem('tinct-lab-highlights')))
            const mark=marks.find(mark=>!original.some(saved=>saved.id===mark.id))
            assert.equal(mark?.color,'rose','first highlight click applies displayed remembered colour')
            if (grouped) assert.deepEqual(marks.find(mark=>mark.id==='seed-sirach-overlap'),original.find(mark=>mark.id==='seed-sirach-overlap'),'fresh subset highlight preserves the wider original gold mark')
            await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(resolve)))
            const keptPaint=await paint()
            const normalize=text=>text.replace(/\s+/g,' ').trim()
            const expectedText=normalize(expected.map(word=>word.text).join(' '))
            assert(keptPaint.ranges.some(entry=>entry.name.includes('rose')&&entry.ranges.some(range=>normalize(range.text)===expectedText)),'rose CSS range paints precisely the chosen source words')
            assert(!keptPaint.ranges.some(entry=>entry.name.includes('warm')&&entry.ranges.some(range=>normalize(range.text)===expectedText)),'temporary gold selection does not cover the saved rose range')
            if (!grouped) assert(keptPaint.ranges.filter(entry=>entry.name.includes('warm')).every(entry=>entry.ranges.length===0),'no remaining gold ink overlays the new rose highlight')
            const rose=await page.evaluate(()=>{const root=document.querySelector('.lab'),probe=document.createElement('span');probe.style.color='var(--highlight-rose)';root.append(probe);const color=getComputedStyle(probe).color;probe.remove();return color})
            const selectedBoxes=source.slice(start,end+1).map(word=>word.rect)
            const fills=keptPaint.underlays.filter(ink=>selectedBoxes.some(box=>ink.box.left<=box.x+box.width/2&&ink.box.right>=box.x+box.width/2&&ink.box.top<=box.y+box.height/2&&ink.box.bottom>=box.y+box.height/2))
            assert(fills.length>0&&fills.every(ink=>ink.background===rose),'continuous highlight ink under selected words uses actual rose colour')
            await page.screenshot({path:`${output}/${engineName}-${wrapped?'wrapped':'normal'}-${grouped?'grouped':'clean'}-first-highlight-rose.png`})
            assert.equal(await page.locator('[data-testid^="lab-dbar-color-"]').count(),0,'first highlight click does not open palette')
            await page.getByTestId('lab-dbar-highlight').click()
            await page.getByTestId('lab-dbar-color-rose').waitFor()
            assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('tinct-lab-highlights')).length),marks.length,'opening palette does not create another highlight')
          }
          if (!grouped&&includeBoth&&direction==='forward') await applyAndInspect()
          if (grouped) {
            await page.getByTestId('lab-dbar-more').click()
            await page.getByTestId('lab-dmore-copy').click()
            const copied=await page.evaluate(()=>window.__selectionCopied)
            assert.equal(copied?.replace(/\s+/g,' ').trim(),expected.map(word=>word.text).join(' ').replace(/\s+/g,' ').trim(),'fresh drag Copy retains exact selected text inside a wider grouped highlight')
            if (!includeBoth&&direction==='forward') {
              await page.mouse.move(firstPoint.x,firstPoint.y);await page.mouse.down();await page.mouse.move(lastPoint.x,lastPoint.y,{steps:18});await page.mouse.up()
              await page.getByTestId('lab-desk-bar').waitFor()
              await applyAndInspect()
            }
          }
        }
        assert.deepEqual(errors,[])
        await context.close()
      }
    } finally { await browser.close() }
  }
  await fs.writeFile(`${output}/results.json`,JSON.stringify(results,null,2))
  console.log(JSON.stringify({passed:results.length,output}))
} finally { await new Promise(resolve=>server.close(resolve)) }
