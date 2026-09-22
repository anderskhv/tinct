import {chromium,webkit} from '@playwright/test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
const live=process.env.LIBRARY_LIVE==='1', output='artifacts/reading-reel', origin='https://tinct.app'
await fs.mkdir(output,{recursive:true})
const results=[]
for(const [engine,type] of Object.entries({chromium,webkit})){
 const browser=await type.launch({headless:true,args:engine==='chromium'?['--mute-audio']:[]})
 try{for(const width of [390,1440])for(const count of [1,4]){
  const context=await browser.newContext({viewport:{width,height:900},serviceWorkers:'block',reducedMotion:'reduce'})
  const page=await context.newPage();page.setDefaultTimeout(15000)
  let phase='boot'; const errors=[];page.on('pageerror',e=>errors.push(e.message))
  const now=Date.now(), ids=['antigone','bible','notes-from-underground','frankenstein'].slice(0,count)
  const books=Object.fromEntries(ids.map((id,i)=>[id==='bible'?'genesis':id,{bookId:id==='bible'?'genesis':id,headerBook:id==='bible'?'Genesis':id,chapterNumber:1,sequentialChapter:1,paragraphIndex:2,wordIndex:0,primaryEditionKey:'original-en',deviceId:'fixture',rev:1,updatedAt:now-i*1000}]))
  const positions={owner:null,books,finished:{},hidden:count>1?{bible:now-86400000}:{},lastSettledBookId:'antigone',lastSettledAt:now,updatedAt:now,deviceId:'fixture'}
  await page.addInitScript(positions=>{
   if(!localStorage.getItem('tinct-lab-position'))localStorage.setItem('tinct-lab-position',JSON.stringify(positions))
   HTMLMediaElement.prototype.play=async function(){this.muted=true}
   if(navigator.mediaDevices)navigator.mediaDevices.getUserMedia=async()=>{throw Error('Disabled for acceptance')}
  },positions)
  await page.route('**/*',async route=>{
   const req=route.request(),url=new URL(req.url())
   if(url.origin!==origin)return route.abort()
   if(url.pathname.startsWith('/api/'))return route.fulfill({status:404,json:{}})
   if(req.method()!=='GET')return route.abort()
   if(live)return route.continue()
   const p=url.pathname==='/library'?'/lab/index.html':url.pathname==='/reader'?'/app.html':url.pathname
   const file=path.resolve('dist','.'+p)
   if(file.startsWith(path.resolve('dist')+'/'))try{if((await fs.stat(file)).isFile())return route.fulfill({path:file})}catch{}
   return route.abort()
  })
  try{
   await page.goto(origin+'/library')
   await page.waitForFunction(count=>{
    const section=document.querySelector('[data-reading-memory-recap]')
    return Boolean(section?.dataset.book) && document.querySelectorAll('[data-now-index]').length===count
   },count)
   await page.evaluate(()=>document.fonts.ready)
   const shelf=page.locator('[data-now-shelf]')
   const loading=await page.evaluate(()=>({
    catalogue:performance.getEntriesByType('resource').filter(e=>e.name.includes('/lab/catalogue.json')).map(e=>({start:e.startTime,end:e.responseEnd})),
    hiddenBookRequests:performance.getEntriesByType('resource').filter(e=>/\/data\/(onboarding|editions[^/]*)\/odyssey/.test(e.name)).map(e=>e.name),
    domReady:performance.getEntriesByType('navigation')[0]?.domContentLoadedEventEnd,
   }))
   assert.equal(loading.hiddenBookRequests.length,0,'library entry does not prepare hidden Odyssey content')
   const geometry=await shelf.evaluate(n=>{
    const r=n.getBoundingClientRect(),cards=[...n.querySelectorAll('[data-now-index]')].map(c=>({id:c.dataset.nowBook,x:c.getBoundingClientRect().x,width:c.getBoundingClientRect().width,height:c.getBoundingClientRect().height}))
    return {left:r.left,height:r.height,cards,overflow:document.documentElement.scrollWidth>innerWidth,display:getComputedStyle(n).display}
   })
   phase='native shelf geometry'
   if(width>=900){
    const layout=await page.evaluate(()=>{
     const shelf=document.querySelector('[data-now-shelf]').getBoundingClientRect(),caption=document.querySelector('[data-now-caption]').getBoundingClientRect()
     return {top:shelf.top,shelfRight:shelf.right,captionLeft:caption.left,captionTop:caption.top,header:getComputedStyle(document.querySelector('.lib-hdr')).display}
    })
    assert.equal(layout.header,'none','no redundant account header')
    assert(layout.top<70,'books start near the top')
    assert(layout.captionLeft>=layout.shelfRight,'details sit beside covers')
   }
   if(count>1){
    assert.equal(await page.locator('[data-now-book="bible"]').count(),1,'re-added Bible survives resolved library')
    await page.reload()
    await page.waitForFunction(()=>Boolean(document.querySelector('[data-reading-memory-recap]')?.dataset.book) && document.querySelectorAll('[data-now-index]').length===4)
    assert.equal(await page.locator('[data-now-book="bible"]').count(),1,'Bible survives another library visit')
   }

   assert(!geometry.overflow)
   assert.equal(geometry.display,'flex')
   assert(geometry.height>80 && geometry.cards[0].height>80,'even one current book remains visible')
   assert(Math.abs(geometry.cards[0].x-geometry.left)<6,'first cover starts at shelf edge')
   assert.equal(await shelf.evaluate(n=>n.classList.contains('is-reel')),false)
   phase='long title truncation'
   const titleGeometry=await page.evaluate(()=>{
    const caption=document.querySelector('[data-now-caption]'),title=caption.querySelector('.lib-lede'),action=document.querySelector('[data-recap-continue]')
    const original=title.textContent,results=[]
    for(const text of ['Antigone','Strange Case of Dr Jekyll and Mr Hyde','An extraordinarily long book title '.repeat(12)]){
     title.textContent=text
     const t=title.getBoundingClientRect(),c=caption.getBoundingClientRect(),b=action.getBoundingClientRect()
     results.push({text,top:b.top,left:t.left,right:t.right,captionRight:c.right,height:t.height,ellipsis:getComputedStyle(title).textOverflow,overflow:document.documentElement.scrollWidth>innerWidth})
    }
    title.textContent=original
    return results
   })
   for(const item of titleGeometry){
    assert.equal(item.ellipsis,'ellipsis','long title ends with an ellipsis')
    assert(!item.overflow && item.right<=item.captionRight+1,'title stays within its caption')
    assert(Math.abs(item.top-titleGeometry[0].top)<1,'reading action does not move with title length')
    assert(Math.abs(item.height-titleGeometry[0].height)<1,'title retains one line')
   }
   const before=await page.evaluate(()=>localStorage.getItem('tinct-lab-position'))
   if(count>1){
    phase='native scroll or card focus'
    if(width<600) await shelf.evaluate(n=>n.scrollLeft=n.scrollWidth)
    else await page.locator('[data-now-index="1"] .lib-now-open').click()
    await page.waitForFunction(()=>{const book=document.querySelector('[data-reading-memory-recap]')?.dataset.book;return Boolean(book) && book!=='antigone'})
   }
   assert.equal(await page.evaluate(()=>localStorage.getItem('tinct-lab-position')),before,'browsing does not write position')
   const selected=await page.locator('[data-reading-memory-recap]').getAttribute('data-book')
   assert.equal(await page.locator('[data-recap-continue]').getAttribute('data-recap-continue'),selected)
   await page.screenshot({path:output+'/'+engine+'-'+width+'-'+count+'.png'})
   if(count>1){
    phase='remove'
    await page.locator('[data-now-book="'+selected+'"] [data-now-remove]').click()
    await page.waitForFunction(id=>!document.querySelector('[data-now-book="'+id+'"]'),selected)
    const after=JSON.parse(await page.evaluate(()=>localStorage.getItem('tinct-lab-position')))
    assert.deepEqual(after.books,JSON.parse(before).books,'remove keeps all saved reading tuples')
    assert.equal(await page.locator('[data-now-index]').count(),count-1)
   }
   phase='continue';
   await page.locator('[data-recap-continue]').click()
   await page.waitForURL('**/reader**')
   await page.waitForFunction(()=>document.querySelector('[data-testid="lab-root"]')?.dataset.readerReady==='true',null,{timeout:45000})
   assert.equal(await page.locator('[data-testid="lab-book-preface"][open]').count(),0,'Continue returns directly to saved text')
   assert.deepEqual(errors,[])
   results.push({engine,width,count,geometry,loading,selected,passed:true})
  }catch(error){await page.screenshot({path:output+'/'+engine+'-'+width+'-'+count+'-failure.png'});results.push({engine,width,count,passed:false,phase,error:error.stack||String(error)});process.exitCode=1}
  await context.close()
 }}finally{await browser.close()}
}
await fs.writeFile(output+'/report.json',JSON.stringify(results,null,2))
console.log(JSON.stringify(results))
