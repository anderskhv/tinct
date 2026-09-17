import { chromium } from '@playwright/test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
const live = process.env.LIBRARY_LIVE === '1'
const output = 'artifacts/library-layout'
await fs.mkdir(output, { recursive: true })
const browser = await chromium.launch({ headless: true, args: ['--mute-audio'] })
const results = []
try {
 for (const viewport of [{width:390,height:844},{width:1440,height:900}]) {
  const context = await browser.newContext({viewport, serviceWorkers:'block'})
  const page = await context.newPage()
  const errors = []
  page.on('pageerror', e => errors.push(e.message))
  await page.addInitScript(() => {
   HTMLMediaElement.prototype.play = () => Promise.resolve()
   navigator.mediaDevices.getUserMedia = async () => { throw new Error('Microphone disabled for visual acceptance') }
  })
  await page.route('**/*', async route => {
   const request = route.request()
   if (request.method() !== 'GET') return route.abort()
   if (live) return route.continue()
   const url = new URL(request.url())
   if (url.origin !== 'https://tinct.app') return route.continue()
   const pathname = url.pathname === '/library' ? '/lab/index.html' : ['/reader','/lab/phone','/lab/desktop'].includes(url.pathname) ? '/app.html' : url.pathname
   const filename = path.resolve('dist', '.' + pathname)
   if (!filename.startsWith(path.resolve('dist') + '/')) return route.abort()
   try {
    const stat = await fs.stat(filename)
    if (stat.isFile()) return route.fulfill({path:filename})
   } catch {}
   return route.continue()
  })
  await page.goto('https://tinct.app/library', {waitUntil:'domcontentloaded'})
  await page.waitForFunction(() => window.__tinctLabPreReader?.ready === true, null, {timeout:30000})
  await page.evaluate(() => document.fonts.ready)
  await page.waitForTimeout(800)
  const name = viewport.width < 600 ? 'phone' : 'desktop'
  await page.screenshot({path:output+'/'+name+'.png'})
  const geometry = await page.evaluate(() => {
   const shelf = document.querySelector('[data-popular-shelf]')
   const book = shelf.querySelector('[aria-current="true"] .lib-cover')
   const b = book.getBoundingClientRect(), s = shelf.getBoundingClientRect()
   const caption = document.querySelector('[data-popular-caption]')
   return {cover:{top:b.top,bottom:b.bottom,center:b.x+b.width/2},shelf:{top:s.top,bottom:s.bottom,center:s.x+s.width/2},caption:getComputedStyle(caption).display,index:getComputedStyle(document.querySelector('.lib-index')).display,overflow:document.documentElement.scrollWidth>innerWidth,coverTransform:getComputedStyle(book).transform}
  })
  assert.equal(geometry.caption,'flex','desktop must retain selected summary')
  assert.notEqual(geometry.index,'none','full catalogue must be visible')
  assert.equal(geometry.overflow,false,'no page horizontal overflow')
  assert(Math.abs(geometry.cover.center-geometry.shelf.center)<3,'selected cover centered')
  assert(geometry.cover.top>=geometry.shelf.top,'cover top not clipped')
  assert(geometry.cover.bottom<=geometry.shelf.bottom,'cover bottom not clipped')
  assert.equal(geometry.coverTransform,'none','old enlargement removed')
  const catalogue = await page.evaluate(async () => {
   const model = await import('/lab/library-model.js')
   const data = await fetch(model.LAB_CATALOGUE_URL).then(r=>r.json())
   return {ids:model.filterIndexBooks(data,'').map(b=>b.id),houses:model.indexHouses(data).map(h=>h.id)}
  })
  const actual = await page.locator('[data-library-index] [data-catalogue-book]').evaluateAll(nodes=>[...new Set(nodes.map(n=>n.dataset.catalogueBook))])
  assert.deepEqual(actual.sort(),catalogue.ids.sort(),'every eligible book appears below hero')
  assert.equal(await page.locator('.lib-catalogue-house').count(),catalogue.houses.length)
  const shelf=page.locator('[data-popular-shelf]')
  const box=await shelf.boundingBox()
  const selection=()=>page.locator('[data-shelf-index][aria-current="true"]').getAttribute('data-shelf-index')
  const before=await selection()
  await page.mouse.move(box.x+box.width/2,box.y+130)
  await page.mouse.down()
  await page.mouse.move(box.x+box.width/2-190,box.y+135,{steps:16})
  await page.mouse.up()
  await page.waitForTimeout(450)
  assert.notEqual(await selection(),before,'drag must change selected book')
  const afterDrag=await selection()
  await page.mouse.wheel(-210,0)
  await page.waitForTimeout(450)
  assert.notEqual(await selection(),afterDrag,'trackpad wheel must change selected book')
  const afterWheel=await selection()
  await page.locator('[data-shelf-index][aria-current="true"]').focus()
  await page.keyboard.press('ArrowRight')
  await page.waitForTimeout(400)
  assert.notEqual(await selection(),afterWheel,'keyboard must change selected book')
  // A vertical gesture over the reel belongs to the page, not the carousel.
  await page.mouse.wheel(0,650)
  await page.waitForTimeout(450)
  assert(await page.evaluate(()=>scrollY)>100,'page scroll reaches the catalogue')
  await page.screenshot({path:output+'/'+name+'-catalogue.png'})
  await page.locator('.lib-catalogue-house').last().scrollIntoViewIfNeeded()
  assert(await page.locator('.lib-catalogue-house').last().isVisible())
  await page.screenshot({path:output+'/'+name+'-last-category.png'})
  // Actual pointer click must open the book, not be swallowed by reel capture.
  await page.evaluate(()=>scrollTo(0,0))
  await page.locator('[data-shelf-index][aria-current="true"]').click()
  await page.locator('[data-testid="lab-cover-entry"]').waitFor({timeout:45000})
  await page.screenshot({path:output+'/'+name+'-cover.png'})
  await page.getByRole('button',{name:/Before you begin/}).click()
  const prep=page.locator('[data-testid="lab-book-preface"]')
  await prep.waitFor()
  await page.waitForTimeout(800)
  const frame=prep.locator('.lab-preparation-frame')
  const beforeExpand=await frame.boundingBox()
  assert.equal(await prep.locator('.lab-preface-full p').first().evaluate(n=>getComputedStyle(n).textAlign),'left')
  assert.equal(await prep.getByRole('button',{name:'Characters',exact:true}).getAttribute('aria-expanded'),'false')
  await page.screenshot({path:output+'/'+name+'-preparation.png'})
  await prep.getByRole('button',{name:'Preface',exact:true}).click()
  const expanded=await frame.boundingBox()
  assert.deepEqual(expanded,beforeExpand,'preface expansion must not resize or move frame')
  await page.screenshot({path:output+'/'+name+'-preface-expanded.png'})
  await prep.getByRole('button',{name:'Preface',exact:true}).click()
  await prep.getByRole('button',{name:'Characters',exact:true}).click()
  assert.deepEqual(await frame.boundingBox(),beforeExpand,'cast expansion keeps frame stable')
  await prep.getByRole('button',{name:'Select your editions',exact:true}).click()
  assert(await prep.getByLabel('Primary edition',{exact:true}).count())
  assert(await prep.getByLabel('Secondary edition',{exact:true}).count())
  assert(await prep.getByLabel('Audiobook',{exact:true}).count())
  assert.deepEqual(await frame.boundingBox(),beforeExpand,'edition controls keep frame stable')
  await page.screenshot({path:output+'/'+name+'-options.png'})
  await prep.getByRole('button',{name:'Back to cover',exact:true}).click()
  await page.locator('[data-testid="lab-cover-entry"]').waitFor()
  await page.getByRole('button',{name:/Start reading|Continue reading/}).first().click()
  await page.waitForTimeout(1000)
  assert.equal(await page.locator('[data-testid="lab-book-preface"][open]').count(),0)
  assert.deepEqual(errors,[],'no runtime exceptions')
  results.push({name,live,geometry,books:actual.length,houses:catalogue.houses.length,drag:true,wheel:true,keyboard:true,verticalScroll:true})
  await context.close()
 }
 await fs.writeFile(output+'/acceptance.json',JSON.stringify(results,null,2))
 console.log(JSON.stringify(results))
} finally { await browser.close() }
