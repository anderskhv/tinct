import { chromium, webkit } from '@playwright/test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
const live = process.env.LIBRARY_LIVE === '1'
const out = 'artifacts/entry-responsive'
await fs.mkdir(out,{recursive:true})
const results=[]
const failures=[]
for(const [engine,type] of Object.entries({chromium,webkit})){
 const browser=await type.launch({headless:true,...(engine==='chromium'?{args:['--mute-audio']}:{})})
 try{
  for(const [name,width,height,touch] of [
   ['small-phone',375,560,true],['phone',390,660,true],['tall-phone',430,780,true],
   ['ipad-portrait',820,1024,true],['ipad-landscape',1180,720,true],['desktop',1440,900,false]
  ]){
   const context=await browser.newContext({viewport:{width,height},hasTouch:touch,isMobile:touch,deviceScaleFactor:touch?2:1,serviceWorkers:'block'})
   const page=await context.newPage()
   await page.bringToFront()
   try {
   await page.addInitScript(()=>{
    HTMLMediaElement.prototype.play=()=>Promise.resolve()
    if(navigator.mediaDevices) navigator.mediaDevices.getUserMedia=async()=>{throw Error('Disabled for acceptance')}
   })
   await page.route('**/*',async route=>{
    const req=route.request()
    if(req.method()!=='GET')return route.abort()
    if(live)return route.continue()
    const url=new URL(req.url())
    if(url.origin!=='https://tinct.app')return route.continue()
    const pathname=['/','/library'].includes(url.pathname)?'/lab/index.html':url.pathname
    const filename=path.resolve('dist','.'+pathname)
    if(!filename.startsWith(path.resolve('dist')+'/'))return route.abort()
    try{if((await fs.stat(filename)).isFile())return route.fulfill({path:filename})}catch{}
    return route.continue()
   })
   const wait=async()=>{await page.waitForFunction(()=>window.__tinctLabPreReader?.ready,{timeout:30000});await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(600)}
   const review=async label=>{
    await page.screenshot({path:out+'/'+engine+'-'+name+'-'+label+'.png',fullPage:false})
    if(engine==='webkit'||name==='desktop'){
     const b64=(await page.screenshot({type:'jpeg',quality:50})).toString('base64')
     console.log('REVIEW_BEGIN '+engine+'-'+name+'-'+label)
     for(let i=0;i<b64.length;i+=3000)console.log('REVIEW_CHUNK '+b64.slice(i,i+3000))
     console.log('REVIEW_END '+engine+'-'+name+'-'+label)
    }
   }
   await page.goto('https://tinct.app/',{waitUntil:'domcontentloaded'});await wait()
   const landing=await page.evaluate(()=>{
    const box=s=>{const r=document.querySelector(s).getBoundingClientRect();return {top:r.top,bottom:r.bottom,left:r.left,right:r.right,width:r.width,height:r.height}}
    return {heading:box('.tov5-simple-hero h1'),copy:box('.tov5-simple-hero>p'),covers:box('[data-entry-covers]'),cta:box('.tov5-simple-entry'),cover:box('[data-entry-covers] .lib-cover'),coverRatio:(()=>{const n=document.querySelector('[data-entry-covers] .lib-cover');return n.offsetWidth/n.offsetHeight})(),overflow:document.documentElement.scrollWidth>innerWidth,wide:matchMedia('(min-width:1100px) and (orientation:landscape)').matches}
   })
   console.log('LANDING_GEOMETRY '+engine+' '+name+' '+JSON.stringify(landing))
   await review('landing')
   assert(!landing.overflow,name+' landing page overflow')
   assert(Math.abs(landing.coverRatio-2/3)<.025,name+' proportionate covers')
   if(!landing.wide){
    assert(landing.covers.top>=landing.copy.bottom+12,name+' no copy/art overlap')
    assert(landing.cta.top>=landing.covers.bottom,name+' no art/action overlap')
    assert(landing.covers.top-landing.copy.bottom<55,name+' no empty spacer')
   }else assert(landing.covers.left>=landing.copy.right,name+' desktop columns do not collide')
   const track=page.locator('.entry-cover-track .lib-cover,.entry-cover-column').first()
   assert.notEqual(await track.evaluate(n=>getComputedStyle(n).animationName),'none','cover reveal configured')
   assert.equal(await page.getByRole('button',{name:'Pause covers',exact:true}).count(),0,'no pause control exposed')
   await page.waitForTimeout(1800)
   const settled=await track.evaluate(n=>getComputedStyle(n).transform)
   await page.waitForTimeout(150)
   assert.equal(await track.evaluate(n=>getComputedStyle(n).transform),settled,'reveal settles')
   await page.emulateMedia({reducedMotion:'reduce'})
   assert.equal(await track.evaluate(n=>getComputedStyle(n).animationName),'none','reduced motion')
   await page.emulateMedia({reducedMotion:'no-preference'})
   // Rotation changes the cover structure without a reload.
   if(name==='ipad-portrait'){
    await page.setViewportSize({width:1180,height:720});await page.waitForTimeout(300)
    console.log('ROTATED_VIEWPORT '+engine+' '+JSON.stringify(await page.evaluate(()=>({width:innerWidth,height:innerHeight,visualWidth:visualViewport?.width,visualHeight:visualViewport?.height,wide:matchMedia('(min-width:1100px) and (orientation:landscape)').matches,columns:document.querySelectorAll('.entry-cover-column').length,row:document.querySelectorAll('.entry-cover-track').length}))))
    await page.waitForFunction(()=>document.querySelectorAll('.entry-cover-column').length===3,null,{timeout:10000})
    await page.setViewportSize({width,height});await page.waitForTimeout(300)
    await page.waitForFunction(()=>document.querySelectorAll('.entry-cover-track').length===1,null,{timeout:10000})
   }
   await page.goto('https://tinct.app/library',{waitUntil:'domcontentloaded'});await wait()
   await page.waitForFunction(()=>{
    const b=document.querySelector('[aria-current="true"] .lib-cover')?.getBoundingClientRect()
    return b && Math.abs(b.left+b.width/2-innerWidth/2)<3
   })
   const library=await page.evaluate(()=>{
    const r=s=>{const b=document.querySelector(s).getBoundingClientRect();return {top:b.top,bottom:b.bottom,width:b.width,height:b.height,left:b.left}}
    return {cover:r('[aria-current="true"] .lib-cover'),description:r('[data-popular-blurb]'),time:r('.lib-readtime'),dock:r('.library-glass-dock'),category:r('.lib-catalogue-house'),overflow:document.documentElement.scrollWidth>innerWidth,desc:document.querySelector('[data-popular-blurb]').textContent}
   })
   console.log('LIBRARY_GEOMETRY '+engine+' '+name+' '+JSON.stringify(library))
   await review('library')
   assert(!library.overflow,name+' library overflow')
   assert(library.cover.top>=0 && library.cover.bottom<library.dock.top,name+' cover above dock')
   assert(library.time.height>0 && library.time.bottom<library.dock.top,name+' reading time above dock')
   assert(library.dock.height<=56,name+' shallow dock')
   assert(library.desc.length>90,'full description remains')
   if(height>=660)assert(library.description.bottom<library.dock.top,name+' full description above dock')
   if(height>=660)assert(library.category.top<library.dock.top-35,name+' first category visible before dock')
   const row=page.locator('.lib-category-track').first()
   await row.scrollIntoViewIfNeeded()
   if(!touch){
    const r=await row.boundingBox()
    await page.mouse.move(r.x+350,r.y+80)
    await page.mouse.down()
    await page.mouse.move(r.x+150,r.y+80,{steps:15})
    await page.mouse.up()
    assert(await row.evaluate(n=>n.scrollLeft)>50,'mouse drag scrolls category without opening a book')
    assert(await page.locator('[data-library-index]').isVisible(),'drag remains in library')
   }
   const moved=await row.evaluate(n=>{n.scrollLeft=250;return n.scrollLeft})
   assert(moved>0,'category row can scroll')
   await page.waitForTimeout(150)
   await review('shelves')
   const times=await page.evaluate(async()=>{
    const model=await import('/lab/library-model.js')
    const catalogue=await fetch(model.LAB_CATALOGUE_URL).then(r=>r.json())
    return window.__tinctLabPreReader.libraryState().shelf.map(id=>({id,time:model.catalogueLengthLine(catalogue.books.find(b=>b.id===id).wordCount)}))
   })
   assert(times.every(b=>b.time), 'all featured books have reading estimates: '+JSON.stringify(times))
   results.push({engine,name,landing,library})
   } catch(error) {
    failures.push({engine,name,error:String(error)})
    console.log('CASE_FAILURE '+engine+' '+name+' '+String(error))
    await page.screenshot({path:out+'/'+engine+'-'+name+'-failure.png'}).catch(()=>{})
   } finally {await context.close()}
  }
 }finally{await browser.close()}
}
await fs.writeFile(out+'/acceptance.json',JSON.stringify(results,null,2))
console.log('RESPONSIVE_ACCEPTANCE '+JSON.stringify(results))
assert.deepEqual(failures,[],'responsive acceptance failures')
