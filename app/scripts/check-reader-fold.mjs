import { chromium, webkit } from '@playwright/test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'

const live = process.env.READER_LIVE === '1'
const expected = process.env.TINCT_EXPECTED_BUNDLE || ''
const origin = 'https://tinct.app'
const output = 'artifacts/reader-fold'
await fs.mkdir(output, { recursive: true })
const results = []
const explanation = 'A compact opening grounded in the selected passage.\n\nA second paragraph adds useful context and interpretation without filling the entire screen.'
const definition = 'pronoun. Used to refer to people or things already identified.'
const sse = text => 'data: ' + JSON.stringify({ type: 'content_block_delta', delta: { type: 'text_delta', text } }) + '\n\ndata: {"type":"message_stop"}\n\n'

async function boot(browser, phone, bookId='bible', edition='kjv-en', chapterNumber=1, fixture={}) {
  const context = await browser.newContext({ viewport: phone ? { width:390,height:844 } : {width:1440,height:900}, serviceWorkers:'block', hasTouch:phone, deviceScaleFactor:fixture.deviceScaleFactor||1 })
  const page = await context.newPage()
  page.setDefaultTimeout(10000)
  const requests = [], errors = []
  page.on('pageerror', error => errors.push(error.message))
  await page.route('**/*', async route => {
    const req = route.request(), url = new URL(req.url())
    if (url.pathname==='/api/narration/voices' && fixture.narrationEnabled!==undefined) {
      return route.fulfill({json:{enabled:fixture.narrationEnabled,voices:fixture.narrationEnabled?[{key:'f',label:'Female',persona:'female'}]:[]}})
    }
    if (url.pathname==='/api/narration/ensure' && fixture.narrationEnabled) {
      requests.push({narration:req.postDataJSON()})
      return route.fulfill({status:401,json:{error:'unauthenticated'}})
    }
    if (/\/api\/(lab-chat|chat)$/.test(url.pathname)) {
      const body = req.postDataJSON(); requests.push(body)
      return route.fulfill({ contentType:'text/event-stream', body:sse(JSON.stringify(body.messages).includes('<word>') ? definition : explanation) })
    }
    // Exercise the shared missing-entry UI without paying for inference.
    if (/\/data\/dict\//.test(url.pathname)) return route.fulfill({contentType:'application/json',body:'{}'})
    if (req.method() !== 'GET') return route.abort()
    if (!live && url.origin === origin) {
      const pathname = ['/reader','/lab/phone','/lab/desktop'].includes(url.pathname) ? '/app.html' : url.pathname
      const filename = path.resolve('dist', '.' + pathname)
      if (filename.startsWith(path.resolve('dist') + '/')) {
        try { if ((await fs.stat(filename)).isFile()) return route.fulfill({path:filename}) } catch {}
      }
    }
    return route.continue()
  })
  await page.addInitScript(({bookId,edition,chapterNumber,fixture}) => {
    localStorage.setItem('tinct-lab-prefs', JSON.stringify({theme: fixture.theme, fontSize:fixture.fontSize, primaryEdition:edition}))
    sessionStorage.setItem('tinct:lab-reader-handoff', JSON.stringify({kind:'open-reader',bookId,primaryEditionKey:edition,savedPlace:{bookId,chapterNumber,paragraphIndex:fixture.paragraphIndex||0,wordIndex:0,page:0}}))
    if(fixture.highlights && !localStorage.getItem('tinct-lab-highlights')) localStorage.setItem('tinct-lab-highlights',JSON.stringify(fixture.highlights))
    Object.defineProperty(navigator.mediaDevices, 'getUserMedia', { configurable:true, value:async()=>{throw Error('Microphone disabled during reader acceptance')} })
    HTMLMediaElement.prototype.play = async function(){this.muted=true}
    window.__copied = []
    Object.defineProperty(navigator, 'clipboard', {configurable:true,value:{writeText:async text=>{window.__copied.push(text)}}})
  },{bookId,edition,chapterNumber,fixture})
  await page.goto(origin + (phone ? '/lab/phone?chrome=v2' : '/reader?chrome=v2'), {waitUntil:'domcontentloaded'})
  await page.waitForFunction(()=>document.querySelector('[data-testid="lab-root"]')?.dataset.readerReady==='true',null,{timeout:45000})
  await page.evaluate(()=>document.fonts.ready)
  await page.waitForTimeout(700)
  return {context,page,requests,errors}
}

for (const [engine, name] of [[chromium,'chromium'],[webkit,'webkit']]) {
  const browser = await engine.launch({headless:true,...(name==='chromium'?{args:['--mute-audio']}: {})})
  try {
    for (const phone of [false,true]) for (const fontSize of [1.3,2.2]) {
      let reference
      for (const theme of ['light','dark']) {
        const state = await boot(browser,phone,'apology','original-en',1,{theme,fontSize,narrationEnabled:false})
        const {page,context,requests,errors} = state
        await page.waitForFunction(()=>{
          const book=document.querySelector('[data-testid="lab-book"]')
          const wrap=document.querySelector('[data-testid="lab-page-wrap"]')
          if(!book || !wrap || getComputedStyle(book).visibility!=='visible' || wrap.classList.contains('is-measuring-visible-page'))return false
          const bottom=wrap.getBoundingClientRect().bottom
          return [...book.querySelectorAll('[data-testid="lab-word"]')].every(e=>!e.getBoundingClientRect().width || e.getBoundingClientRect().bottom<=bottom+1)
        },null,{timeout:30000})
        const geometry = await page.evaluate(() => {
          const root=document.querySelector('[data-testid="lab-root"]')
          const wrap=document.querySelector('.lab-page-wrap')
          const fold=getComputedStyle(wrap,'::after')
          const words=[...document.querySelectorAll('[data-testid="lab-word"]')].filter(e=>e.getBoundingClientRect().width)
          return { desktop:root.dataset.desktopPaging, night:root.classList.contains('is-night'),
            foldWidth:parseFloat(fold.width), gutter:parseFloat(getComputedStyle(wrap).getPropertyValue('--desktop-gutter')),
            words:words.map(e=>({id:e.dataset.paragraphIndex+':'+e.dataset.wordIndex,text:e.textContent,rect:[e.getBoundingClientRect().x,e.getBoundingClientRect().y,e.getBoundingClientRect().width,e.getBoundingClientRect().height]})) }
        })
        assert.equal(geometry.night,theme==='dark')
        if(theme==='light') reference=geometry.words
        else assert.deepEqual(geometry.words,reference,'Theme and fold must not alter word boundaries or position')
        if(!phone && theme==='dark') {
          assert(geometry.foldWidth<=24)
          assert((geometry.gutter-geometry.foldWidth)/2>=10,'Clear paper between inner text and fold')
        }
        assert.equal(requests.filter(r=>r.narration).length,0)
        assert.deepEqual(errors,[])
        await page.screenshot({path:output+'/'+name+'-'+(phone?'phone':'desktop')+'-'+theme+'-'+fontSize+'.png'})
        results.push({engine:name,phone,theme,fontSize,words:geometry.words.length,foldWidth:geometry.foldWidth,gutter:geometry.gutter,passed:true})
        await context.close()
      }
    }
  } finally { await browser.close() }
}
await fs.writeFile(output+'/report.json',JSON.stringify(results,null,2))
console.log(JSON.stringify(results))
