import {chromium,webkit} from '@playwright/test'
import fs from 'node:fs'
import path from 'node:path'
import assert from 'node:assert/strict'
import {createHash} from 'node:crypto'
const live=process.env.LIBRARY_LIVE==='1',origin='https://tinct.app',out='artifacts/reviewed-introductions'
fs.mkdirSync(out,{recursive:true})
const source=JSON.parse(fs.readFileSync('../books/wip/featured-content-20260929/featured-copy.json'))
const manifest=JSON.parse(fs.readFileSync('public/lab/library_2/author-images.json'))
const gallery=JSON.parse(fs.readFileSync('../books/wip/featured-content-20260929/character-galleries.json'))
const cases=[...source.books.map(b=>b.id),'communist-manifesto','federalist-papers'],report=[]
const hash=bytes=>createHash('sha256').update(bytes).digest('hex')
if(live){
 const files=['app.js','index.html','authors.js','intro-review.css','reviewed-introductions.js','author-images.json',...source.books.map(b=>'intro-data/'+b.id+'.json'),...manifest.images.map(i=>i.publicPath.replace('/lab/library_2/',''))]
 for(const file of files){
  const local=fs.readFileSync('public/lab/library_2/'+file),response=await fetch(origin+'/lab/library_2/'+file+'?verified='+hash(local))
  assert.equal(response.status,200,file)
  assert.equal(hash(Buffer.from(await response.arrayBuffer())),hash(local),file+' matches reviewed release')
 }
}
for(const [engine,width,height] of [[chromium,1440,900],[webkit,393,844]]){
 const browser=await engine.launch({headless:true,...(engine===chromium?{args:['--mute-audio']}:{})})
 try{
 const context=await browser.newContext({viewport:{width,height},serviceWorkers:'block',reducedMotion:'reduce',...(engine===webkit?{isMobile:true,hasTouch:true}:{})})
 await context.addInitScript(()=>{
  window.__introTrace=[]
  const note=value=>{window.__introTrace.push({at:performance.now(),...value});if(window.__introTrace.length>80)window.__introTrace.shift()}
  document.addEventListener('click',event=>note({event:'click',target:event.target?.id,tag:event.target?.tagName,path:event.composedPath().slice(0,5).map(n=>n.id||n.tagName)}),true)
  new MutationObserver(records=>{for(const r of records)if(['book-shape','turning-cover','intro','slip-next'].includes(r.target.id))note({event:'mutation',id:r.target.id,key:r.attributeName,old:r.oldValue,value:r.target.getAttribute(r.attributeName)})}).observe(document,{subtree:true,attributes:true,attributeOldValue:true,attributeFilter:['style','hidden','aria-hidden']})
  HTMLMediaElement.prototype.play=async function(){this.muted=true}
  if(navigator.mediaDevices)navigator.mediaDevices.getUserMedia=async()=>{throw Error('Microphone disabled')}
 })
 const page=await context.newPage(),errors=[],providerRequests=[]
 page.setDefaultTimeout(20000);page.on('pageerror',e=>errors.push(e.message))
 await page.route('**/*',async route=>{
  const req=route.request(),url=new URL(req.url())
  if(url.pathname.startsWith('/api/')){
   if(/narration\/ensure|voice-session|chat|assistant/.test(url.pathname))providerRequests.push(url.pathname)
   return route.fulfill({status:404,contentType:'application/json',body:'{}'})
  }
  if(req.method()!=='GET'||url.origin!==origin)return route.abort()
  if(live)return route.continue()
  const name=['/','/library','/library/'].includes(url.pathname)?'/lab/library_2/index.html':url.pathname
  const file=path.resolve('dist','.'+name)
  if(file.startsWith(path.resolve('dist')+'/')&&fs.existsSync(file)&&fs.statSync(file).isFile())return route.fulfill({path:file})
  return route.abort()
 })
 for(const id of cases){
  await page.goto(origin+'/library?view=book-detail&book='+id,{waitUntil:'domcontentloaded'})
  await page.locator('#book-overlay').waitFor()
  await page.locator('#page-back').waitFor()
  assert.equal(await page.locator('.hero-dots button').count(),6,'reviewed copy must not add hero selections')
  const images=manifest.books.find(book=>book.bookId===id).imageIds.map(imageId=>manifest.images.find(image=>image.id===imageId))
  assert.equal(await page.locator('#slip-images img').count(),images.length,id+' complete author attribution')
  await page.waitForFunction(()=>[...document.querySelectorAll('#slip-images img')].every(image=>image.complete&&image.naturalWidth>0))
  assert.deepEqual(await page.locator('#slip-images figcaption').allTextContents(),images.map(image=>image.caption))
  await page.evaluate(()=>document.fonts.ready)
  await page.waitForFunction(()=>document.querySelector('#book-slip')?.inert===false)
  await page.waitForTimeout(300)
  const flapGeometry=await page.evaluate(()=>{
   const box=id=>{const r=document.getElementById(id).getBoundingClientRect();return {x:r.x,y:r.y,right:r.right,bottom:r.bottom,width:r.width,height:r.height}}
   return {flap:box('book-slip'),back:box('page-back'),next:box('slip-next'),compact:document.getElementById('book-shape').classList.contains('compact-book'),shape:getComputedStyle(document.getElementById('book-shape')).transform,cover:getComputedStyle(document.getElementById('turning-cover')).transform,inlineShape:document.getElementById('book-shape').style.transform,inlineCover:document.getElementById('turning-cover').style.transform,active:document.activeElement?.id,trace:window.__introTrace}
  })
  console.log('FLAP_GEOMETRY '+JSON.stringify({engine:engine.name(),id,...flapGeometry}))
  if(flapGeometry.compact){assert(flapGeometry.next.y>=0&&flapGeometry.next.bottom<=height+2,'Continue stays in the viewport: '+id);assert(flapGeometry.flap.x>=-2&&flapGeometry.flap.right<=width+2,'Author flap fits viewport: '+id)}
  const credits=await page.locator('#slip-image-credits').textContent()
  for(const image of images){assert(credits.includes(image.creator));assert(credits.includes(image.changes))}
  const accepted=source.books.find(book=>book.id===id)
  if(accepted){
   assert.equal(await page.locator('#slip-invitation').textContent(),accepted.hook.text)
   assert.equal(await page.locator('#slip-copy').textContent(),accepted.author.biography.replace(/\*([^*]+)\*/g,'$1'))
  }
  if(['frankenstein','bible','federalist-papers'].includes(id)){
   await page.screenshot({path:out+'/'+engine.name()+'-'+id+'-flap.png'})
   const b64=(await page.screenshot({type:'jpeg',quality:65})).toString('base64')
   console.log('REVIEW_BEGIN '+engine.name()+'-'+id+'-flap')
   for(let i=0;i<b64.length;i+=3000)console.log('REVIEW_CHUNK '+b64.slice(i,i+3000))
   console.log('REVIEW_END '+engine.name()+'-'+id+'-flap')
  }
  if(await page.locator('#slip-next').isVisible()){
   await page.locator('#slip-next').click()
   try{await page.waitForFunction(()=>document.getElementById('intro').getAttribute('aria-hidden')==='false'&&document.getElementById('intro').style.pointerEvents==='auto',null,{timeout:5000})}
   catch(error){console.log('INTRO_TRANSITION_FAILURE '+JSON.stringify({engine:engine.name(),id,screen:await page.evaluate(()=>({trace:window.__introTrace,intro:document.getElementById('intro').outerHTML.slice(0,180),shape:document.getElementById('book-shape').style.cssText,cover:document.getElementById('turning-cover').style.cssText,active:document.activeElement?.id}))}));await page.screenshot({path:out+'/'+engine.name()+'-'+id+'-transition-failure.png'});throw error}
  }
  await page.locator('#begin-reading').waitFor()
  if(accepted){
   const paragraphs=await page.locator('#intro-body > p').allTextContents()
   assert.deepEqual(paragraphs.slice(0,accepted.preface.paragraphs.length),accepted.preface.paragraphs,id+' exact reviewed preface')
   assert.equal(await page.locator('.reading-orientation p').textContent(),accepted.orientation.text)
   if(accepted.preface.signature)assert.equal(await page.locator('.preface-credit').textContent(),accepted.preface.signature)
  }
  const cast=gallery.books.find(book=>book.bookId===id)
  if(cast){
   await page.locator('[data-tab=characters]').click()
   assert.equal(await page.locator('[data-tab=characters]').textContent(),cast.sectionTitle)
   assert.equal(await page.locator('#intro-character-list .character').count(),cast.characters.filter(c=>c.visibility==='featured').length)
   await page.getByTestId('intro-gallery-toggle').click()
   await page.waitForFunction(()=>document.querySelector('[data-testid=intro-gallery-toggle]')?.getAttribute('aria-expanded')==='true')
   const expected=cast.characters.filter(c=>c.visibility!=='hold_until_revealed')
   assert.deepEqual(await page.locator('#intro-character-list .character-copy > p:last-child').allTextContents(),expected.map(c=>c.body))
   if(id==='jane-eyre')assert(!(await page.locator('#intro-character-list').textContent()).includes('Bertha'))
   await page.screenshot({path:out+'/'+engine.name()+'-'+id+'-gallery.png'})
  }
  assert(!(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)),'no viewport overflow: '+id)
  report.push({engine:engine.name(),book:id,authorImages:images.length,reviewedCopy:!!accepted,expandedGallery:!!cast})
 }
 await page.evaluate(()=>{
  const now=Date.now(),place={bookId:'jane-eyre',headerBook:'Jane Eyre',chapterNumber:26,sequentialChapter:26,paragraphIndex:0,wordIndex:0,pageIndex:0,primaryEditionKey:'original-en',updatedAt:now,deviceId:'introduction-fixture',rev:1}
  localStorage.setItem('tinct-lab-position',JSON.stringify({owner:null,books:{'jane-eyre':place},finished:{},hidden:{},lastSettledBookId:'jane-eyre',lastSettledAt:now,updatedAt:now,deviceId:'introduction-fixture'}))
 })
 await page.goto(origin+'/library?view=book-detail&book=jane-eyre')
 await page.locator('#book-overlay').waitFor();await page.locator('#page-back').waitFor()
 if(await page.locator('#slip-next').isVisible())await page.locator('#slip-next').click()
 await page.locator('[data-tab=characters]').click();await page.getByTestId('intro-gallery-toggle').click()
 await page.locator('[data-character-id=bertha-mason]').waitFor()
 assert.deepEqual(errors,[]);assert.deepEqual(providerRequests,[])
 await context.close()
 }finally{await browser.close()}
}
fs.writeFileSync(out+'/report.json',JSON.stringify({live,cases:report,limits:'Isolated Chromium and WebKit; provider endpoints blocked; no private account changes.'},null,2))
console.log('REVIEWED_INTRODUCTIONS_PASS '+JSON.stringify(report))
