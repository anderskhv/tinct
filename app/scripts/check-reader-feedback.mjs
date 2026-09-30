import { chromium } from '@playwright/test'
import fs from 'node:fs/promises'
import path from 'node:path'
import assert from 'node:assert/strict'
const live = process.env.READER_LIVE === '1'
const origin = 'https://tinct.app'
const output = 'artifacts/reader-feedback-20260928'
await fs.mkdir(output, { recursive: true })
const browser = await chromium.launch({ headless: true, args: ['--mute-audio','--no-sandbox','--disable-gpu'], ...(process.env.QA_CHROMIUM ? { executablePath: process.env.QA_CHROMIUM } : {}) })
const results = []
for (const [chapter, paragraph, name] of [[648, 12, 'proverbs'], [918, 4, 'zechariah'], [411, 18, 'ezra']]) {
 const context = await browser.newContext({ viewport: { width: 390, height: 700 }, hasTouch: true, serviceWorkers: 'block' })
 const page = await context.newPage()
 const errors = [], requests = []
 page.on('pageerror', e => errors.push(e.message))
 await page.route('**/*', async route => {
  const req = route.request(), url = new URL(req.url())
  if (/\/api\/(chat|lab-chat)$/.test(url.pathname)) {
   requests.push(req.postDataJSON())
   return route.fulfill({ contentType: 'application/json', body: JSON.stringify({ content: [{ text: 'A concise lexical definition.' }] }) })
  }
  if (req.method() !== 'GET') return route.abort()
  if (url.pathname.startsWith('/data/dict/')) return route.fulfill({ json: {} })
  if (url.pathname.startsWith('/api/')) return route.fulfill({ json: {} })
  if (!live && url.origin === origin) {
   const target = path.resolve('dist', '.' + (['/lab/phone', '/lab/reader', '/reader'].includes(url.pathname) ? '/app.html' : url.pathname))
   if (target.startsWith(path.resolve('dist') + '/')) {
    try { if ((await fs.stat(target)).isFile()) return route.fulfill({ path: target }) } catch {}
   }
  }
  if (url.origin !== origin) return route.abort()
  return route.continue()
 })
 await page.addInitScript(({chapter,paragraph}) => {
  sessionStorage.setItem('tinct:lab-reader-handoff',JSON.stringify({kind:'open-reader',bookId:'bible',primaryEditionKey:'bsb-en',savedPlace:{bookId:'bible',chapterNumber:chapter,paragraphIndex:paragraph,wordIndex:0,page:0}}))
  localStorage.setItem('tinct-lab-prefs',JSON.stringify({theme:'dark',fontFamily:'garamond',fontSize:1.2,alignment:'justify',alignmentExplicit:true}))
  HTMLMediaElement.prototype.play=async function(){this.muted=true}
  if(navigator.mediaDevices) navigator.mediaDevices.getUserMedia=async()=>{throw Error('Microphone disabled')}
 },{chapter,paragraph})
 await page.goto(origin+'/lab/phone?chrome=v2',{waitUntil:'domcontentloaded'})
 await page.waitForFunction(()=>document.querySelector('[data-testid="lab-root"]')?.dataset.readerReady==='true',null,{timeout:45000})
 await page.evaluate(()=>document.fonts.ready)
 await page.waitForTimeout(1100)
 const state = await page.evaluate(() => {
  const root=document.querySelector('[data-testid="lab-root"]')
  const lines=[...document.querySelectorAll('.lab-passage:not(.lab-native-page-flow) [data-testid="lab-reading-stage"] .lab-hearing-line')].filter(p=>p.getBoundingClientRect().width>0)
  return { chapter:root.dataset.chapter, place:root.dataset.place, lines:lines.map(p=>({text:p.textContent,align:getComputedStyle(p).textAlign,margin:getComputedStyle(p).marginBottom,joined:p.querySelectorAll('.lab-prose-join').length,words:[...p.querySelectorAll('[data-testid="lab-word"]')].map(w=>w.dataset.paragraphIndex+':'+w.dataset.wordIndex),top:p.getBoundingClientRect().top,bottom:p.getBoundingClientRect().bottom})) }
 })
 if (name==='proverbs') {
  // BSB stores each poetic half-line as a paragraph; the reader sets a verse
  // run as one justified prose paragraph, as WEB does, and every word keeps
  // its source paragraph and word index.
  assert(state.lines.length>0)
  assert(state.lines.every(p=>p.align==='justify'),JSON.stringify(state))
  assert(state.lines.some(p=>p.joined>=3 && new Set(p.words.map(k=>k.split(':')[0])).size>=4),JSON.stringify(state))
  const keys=state.lines.flatMap(p=>p.words)
  assert(keys.length>0 && keys.every((k,i)=>{if(!i)return true;const [p,w]=k.split(':').map(Number),[q,v]=keys[i-1].split(':').map(Number);return (p===q&&w===v+1)||(p===q+1&&w===0)}),JSON.stringify(keys))
 }
 await page.screenshot({path:`${output}/${name}.png`,fullPage:true})
 if (name==='ezra') {
  // Move to the exact source paragraph if the first restored leaf precedes it.
  for(let i=0;i<8 && !await page.getByTestId('lab-word').filter({hasText:'Sherebiah'}).count();i++) {await page.keyboard.press('ArrowRight');await page.waitForTimeout(250)}
  const word=page.getByTestId('lab-word').filter({hasText:'Sherebiah'}).first()
  await word.waitFor({timeout:5000})
  const box=await word.boundingBox()
  const point={pointerId:7,pointerType:'touch',clientX:box.x+box.width*.3,clientY:box.y+box.height*.5,button:0,bubbles:true}
  await word.dispatchEvent('pointerdown',point);await page.waitForTimeout(220);await word.dispatchEvent('pointerup',point)
  await page.waitForTimeout(600)
  assert.equal(await page.locator('.popup-define-word').textContent(),'Sherebiah')
  assert.equal(await page.getByText('AI definition',{exact:true}).count(),0)
  const selection=await page.evaluate(()=>[...CSS.highlights.values()].flatMap(h=>[...h].map(r=>r.toString())))
  assert(selection.includes('Sherebiah') && !selection.includes('Sherebiah—a'),JSON.stringify(selection))
  assert(requests.some(r=>JSON.stringify(r.messages).includes('<word>Sherebiah</word>')))
  await page.screenshot({path:`${output}/definition.png`,fullPage:true})
 }
 assert.deepEqual(errors,[])
 results.push({name,...state,errors})
 await context.close()
}
await browser.close()
await fs.writeFile(`${output}/results.json`,JSON.stringify(results,null,2))
console.log(JSON.stringify(results.map(({name,chapter,lines})=>({name,chapter,lines:lines.length}))))
