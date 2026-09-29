import {chromium,webkit} from '@playwright/test'
import fs from 'node:fs/promises'
import path from 'node:path'
import assert from 'node:assert/strict'
const origin='https://tinct.app',output='artifacts/cross-chapter'
await fs.mkdir(output,{recursive:true})
const edition=JSON.parse(await fs.readFile('public/data/editions/bible-kjv-en.json','utf8'))
for(const engine of [chromium,webkit]){
 const browser=await engine.launch({headless:true})
 try{for(const reverse of [false,true]){
  const context=await browser.newContext({viewport:{width:1440,height:950},serviceWorkers:'block'})
  const page=await context.newPage()
  await context.tracing.start({screenshots:true,snapshots:true})
  try{
   await page.route('**/*',async route=>{
    const url=new URL(route.request().url())
    if(url.origin!==origin)return route.abort()
    if(url.pathname.startsWith('/api/'))return route.fulfill({status:404,json:{}})
    if(route.request().method()!=='GET')return route.abort()
    const file=path.resolve('dist','.'+(url.pathname==='/reader'?'/app.html':url.pathname))
    if(file.startsWith(path.resolve('dist')+'/'))try{if((await fs.stat(file)).isFile())return route.fulfill({path:file})}catch{}
    return route.abort()
   })
   await page.addInitScript(()=>{
    if(sessionStorage.getItem('cross-seeded'))return
    sessionStorage.setItem('cross-seeded','1')
    localStorage.setItem('tinct-lab-prefs',JSON.stringify({fontFamily:'garamond',fontSize:1.3,theme:'book',compareOpen:false}))
    sessionStorage.setItem('tinct:lab-reader-handoff',JSON.stringify({kind:'open-reader',bookId:'bible',primaryEditionKey:'kjv-en',savedPlace:{bookId:'bible',chapterNumber:595,paragraphIndex:0,wordIndex:0,page:0}}))
   })
   await page.goto(origin+'/reader',{waitUntil:'domcontentloaded'})
   await page.waitForFunction(()=>document.querySelector('.lab')?.dataset.readerReady==='true',null,{timeout:45000})
   await page.evaluate(()=>document.fonts.ready)
   if(await page.getByTestId('lab-chapter-cover').isVisible())await page.keyboard.press('ArrowRight')
   await page.locator('.lab-next-chapter-opening [data-word-index]').first().waitFor()
   await page.waitForTimeout(500)
   const first=page.locator('.lab-page-wrap > .lab-passage > .lab-book-columns > .lab-book-col').first().locator('[data-testid="lab-word"]').last()
   const last=page.locator('.lab-next-chapter-opening [data-word-index]').nth(6)
   const a=await first.evaluate(n=>({p:Number(n.dataset.paragraphIndex),w:Number(n.dataset.wordIndex),chapter:Number(n.closest('[data-selection-chapter]').dataset.selectionChapter)}))
   const b=await last.evaluate(n=>({p:Number(n.dataset.paragraphIndex),w:Number(n.dataset.wordIndex),chapter:Number(n.closest('[data-selection-chapter]').dataset.selectionChapter)}))
   const x=await first.boundingBox(),y=await last.boundingBox()
   assert(x&&y)
   const start=reverse?y:x,end=reverse?x:y
   await page.mouse.move(start.x+start.width/2,start.y+start.height/2)
   await page.mouse.down()
   await page.mouse.move(end.x+end.width/2,end.y+end.height/2,{steps:20})
   await page.mouse.up()
   await page.getByRole('button',{name:'Highlight',exact:true}).click()
   await page.waitForFunction(()=>JSON.parse(localStorage.getItem('tinct-lab-highlights')||'[]').length===2)
   const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('tinct-lab-highlights')))
   assert.deepEqual(saved.map(h=>h.chapterNumber),[a.chapter,b.chapter])
   const text=(chapter,startP,startW,endP,endW)=>edition.chapters.find(c=>c.number===chapter).paragraphs.slice(startP,endP+1).flatMap((p,i)=>p.trim().split(/\s+/).slice(i===0?startW:0,i===endP-startP?endW:undefined)).join(' ')
   const left=edition.chapters.find(c=>c.number===a.chapter).paragraphs,lastP=left.length-1
   assert.equal(saved[0].text,text(a.chapter,a.p,a.w,lastP,left[lastP].trim().split(/\s+/).length))
   assert.equal(saved[1].text,text(b.chapter,0,0,b.p,b.w+1))
   assert.equal(saved[0].groupId,saved[1].groupId)
   assert.equal(saved[0].groupText,saved.map(h=>h.text).join(' '))
   await page.reload({waitUntil:'domcontentloaded'})
   await page.waitForFunction(()=>document.querySelector('.lab')?.dataset.readerReady==='true',null,{timeout:45000})
   for(const mark of saved)await page.locator('[data-highlight-id="'+mark.id+'"]').first().waitFor()
   assert.deepEqual(await page.evaluate(()=>JSON.parse(localStorage.getItem('tinct-lab-highlights'))),saved)
   await page.screenshot({path:output+'/'+engine.name()+'-'+reverse+'.png'})
   await context.tracing.stop()
  }catch(e){await page.screenshot({path:output+'/'+engine.name()+'-'+reverse+'-failure.png'});await context.tracing.stop({path:output+'/'+engine.name()+'-'+reverse+'-trace.zip'});throw e}
  finally{await context.close()}
 }}finally{await browser.close()}
}
