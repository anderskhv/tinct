import {chromium,webkit} from '@playwright/test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
const live=process.env.LIBRARY_LIVE==='1', output='artifacts/reading-reel', origin='https://tinct.app'
await fs.mkdir(output,{recursive:true})
const results=[]
for(const [engine,type] of Object.entries({chromium,webkit})){
 const browser=await type.launch({headless:true,args:engine==='chromium'?['--mute-audio']:[]})
 try{for(const width of [390,1440]){
  const context=await browser.newContext({viewport:{width,height:900},serviceWorkers:'block',reducedMotion:'reduce'})
  const page=await context.newPage();page.setDefaultTimeout(15000)
  const errors=[];page.on('pageerror',e=>errors.push(e.message))
  const now=Date.now(), ids=['beowulf','the-prince','notes-from-underground','frankenstein']
  const books=Object.fromEntries(ids.map((id,i)=>[id,{bookId:id,headerBook:id,chapterNumber:1,sequentialChapter:1,paragraphIndex:2,wordIndex:0,primaryEditionKey:'original-en',deviceId:'fixture',rev:1,updatedAt:now-i*1000}]))
  const positions={owner:null,books,finished:{},hidden:{},lastSettledBookId:'beowulf',lastSettledAt:now,updatedAt:now,deviceId:'fixture'}
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
   await page.waitForFunction(()=>document.querySelectorAll('[data-now-index]').length===4 && document.querySelector('[data-now-shelf]')?.classList.contains('is-reel'))
   await page.evaluate(()=>document.fonts.ready)
   const shelf=page.locator('[data-now-shelf]')
   const geometry=await shelf.evaluate(n=>{
    const r=n.getBoundingClientRect(),cards=[...n.querySelectorAll('[data-now-index]')].map(c=>({id:c.dataset.nowBook,x:c.getBoundingClientRect().x+c.getBoundingClientRect().width/2}))
    return {center:r.x+r.width/2,cards,overflow:document.documentElement.scrollWidth>innerWidth}
   })
   assert(!geometry.overflow)
   assert(Math.abs(geometry.cards.find(c=>c.id==='beowulf').x-geometry.center)<3,'latest book centred')
   assert(geometry.cards.some(c=>c.x<geometry.center-20)&&geometry.cards.some(c=>c.x>geometry.center+20),'neighbours on both sides')
   const before=await page.evaluate(()=>localStorage.getItem('tinct-lab-position'))
   const box=await shelf.boundingBox()
   await page.mouse.move(box.x+box.width/2,box.y+100)
   await page.mouse.down();await page.mouse.move(box.x+box.width/2-190,box.y+100,{steps:12});await page.mouse.up()
   await page.waitForFunction(()=>document.querySelector('[data-reading-memory-recap]')?.dataset.book!=='beowulf')
   assert.equal(await page.evaluate(()=>localStorage.getItem('tinct-lab-position')),before,'browsing does not write position')
   const selected=await page.locator('[data-reading-memory-recap]').getAttribute('data-book')
   assert.equal(await page.locator('[data-recap-continue]').getAttribute('data-recap-continue'),selected)
   await page.screenshot({path:output+'/'+engine+'-'+width+'.png'})
   await page.locator('[data-now-book="'+selected+'"] [data-now-remove]').click()
   await page.waitForFunction(id=>!document.querySelector('[data-now-book="'+id+'"]'),selected)
   const after=JSON.parse(await page.evaluate(()=>localStorage.getItem('tinct-lab-position')))
   assert.deepEqual(after.books,JSON.parse(before).books,'remove keeps all saved reading tuples')
   assert.equal(await page.locator('[data-now-index]').count(),3)
   await page.locator('[data-recap-continue]').click()
   await page.waitForURL('**/reader**')
   await page.waitForFunction(()=>document.querySelector('[data-testid="lab-root"]')?.dataset.readerReady==='true',null,{timeout:45000})
   assert.equal(await page.locator('[data-testid="lab-book-preface"][open]').count(),0,'Continue returns directly to saved text')
   assert.deepEqual(errors,[])
   results.push({engine,width,geometry,selected,passed:true})
  }catch(error){await page.screenshot({path:output+'/'+engine+'-'+width+'-failure.png'});results.push({engine,width,passed:false,error:String(error)});process.exitCode=1}
  await context.close()
 }}finally{await browser.close()}
}
await fs.writeFile(output+'/report.json',JSON.stringify(results,null,2))
console.log(JSON.stringify(results))
