import {chromium,webkit} from '@playwright/test'
import fs from 'node:fs/promises'
import path from 'node:path'
import assert from 'node:assert/strict'
const live=process.env.LIBRARY_LIVE==='1'
const out='artifacts/featured-preview'
await fs.mkdir(out,{recursive:true})
const source=await fs.readFile('src/worker/featuredPreviewHtml.ts','utf8')
const html=JSON.parse(source.slice(source.indexOf('= ')+2).trim())
const report=[]
if(live){
 const denied=await fetch('https://tinct.app/api/featured-preview')
 assert.equal(denied.status,403,'real production guest denied')
 assert((denied.headers.get('cache-control')||'').includes('no-store'))
}
for(const [name,engine] of Object.entries({chromium,webkit})){
 const browser=await engine.launch({headless:true,...(name==='chromium'?{args:['--mute-audio']}:{})})
 try{
 for(const [label,width,height,touch] of [['phone',390,660,true],['small-phone',375,560,true],['ipad',820,1024,true],['desktop',1440,900,false]]){
 const context=await browser.newContext({viewport:{width,height},isMobile:touch,hasTouch:touch,deviceScaleFactor:touch?2:1,serviceWorkers:'block'})
 const page=await context.newPage()
 const errors=[]
 page.on('pageerror',e=>{errors.push(e.message); console.log('PREVIEW_ERROR',name,label,e.message); for(const f of page.frames()) void f.evaluate(()=>({observer:window.__qaResizeStack,ready:document.readyState,width:innerWidth,height:innerHeight})).then(value=>console.log('RESIZE_DIAGNOSTICS',JSON.stringify(value))).catch(()=>{})})
 await context.addInitScript(()=>{
  const Original = window.ResizeObserver
  window.ResizeObserver = class extends Original {
    constructor(callback) { const stack = new Error('ResizeObserver registration').stack; super((entries,observer)=>{window.__qaResizeStack=stack;callback(entries,observer)}) }
  }
  HTMLMediaElement.prototype.play=()=>Promise.resolve()
  if(navigator.mediaDevices)navigator.mediaDevices.getUserMedia=async()=>{throw Error('Disabled')}
  localStorage.setItem('sb-yazjyiqsxjystvpkyouk-auth-token',JSON.stringify({access_token:'preview-browser-fixture',refresh_token:'fixture',expires_at:Math.floor(Date.now()/1000)+3600,token_type:'bearer',user:{id:'11111111-1111-4111-8111-111111111111',aud:'authenticated',role:'authenticated',email:'fixture@example.test'}}))
 })
 await page.route('**/*',async route=>{
  const req=route.request(),url=new URL(req.url())
  if(req.method()!=='GET')return route.abort()
  if(url.pathname==='/api/featured-preview')return route.fulfill({status:200,contentType:'text/html',body:html})
  if(live)return route.continue()
  if(url.origin!=='https://tinct.app')return route.abort()
  const p=url.pathname==='/lab/featured'?'/lab/featured/index.html':url.pathname
  try{return await route.fulfill({path:path.resolve('dist','.'+p)})}catch{return route.abort()}
 })
 await page.goto('https://tinct.app/lab/featured')
 await page.waitForSelector('iframe')
 const frame=page.frames().find(f=>f!==page.mainFrame())
 await frame.waitForSelector('html[data-ready=true]')
 await frame.evaluate(()=>Promise.all([...document.images].map(img=>img.decode().catch(()=>{}))))
 await page.waitForTimeout(250)
 const geometry=()=>frame.evaluate(()=>{
  const box=s=>{const r=document.querySelector(s).getBoundingClientRect();return {top:r.top,bottom:r.bottom,left:r.left,right:r.right,height:r.height}}
  return {caption:box('.captions'),cover:box('.book[aria-current=true] img'),reel:box('.reel'),overflow:document.documentElement.scrollWidth>innerWidth,selected:document.querySelector('.caption.active h2').textContent}
 })
 const first=await geometry()
 assert(!first.overflow,label+' no horizontal page overflow')
 assert(first.cover.top>=0&&first.cover.bottom<=height,label+' whole cover visible')
 assert(first.cover.left>=0&&first.cover.right<=width,label+' whole centred cover visible')
 assert(first.caption.top>=first.cover.bottom,label+' caption below cover')
 const count=await frame.locator('.book').count()
 // All full descriptions share one grid footprint, including long titles.
 for(let i=0;i<count;i++){
  await frame.locator('.book').nth(i).evaluate(n=>{
   const r=n.parentElement;r.scrollTo({left:n.offsetLeft+n.offsetWidth/2-r.clientWidth/2,behavior:'instant'})
  })
  await page.waitForTimeout(80)
  const next=await geometry()
  assert(Math.abs(next.caption.height-first.caption.height)<1,label+' caption height stable')
  assert(Math.abs(next.caption.top-first.caption.top)<1,label+' caption position stable')
  assert.equal(await frame.locator('.caption.active a').count(),1)
  assert(await frame.locator('.caption.active .description').evaluate(n=>n.clientHeight>=n.scrollHeight-1),'full description visible')
 }
 await frame.locator('.reel').focus()
 await page.keyboard.press('Home');await frame.waitForFunction(()=>document.querySelector('.book[aria-current=true]')?.dataset.index==='0',{},{timeout:5000});await page.waitForTimeout(400)
 assert.equal(await frame.locator('.book[aria-current=true]').getAttribute('data-index'),'0')
 await frame.evaluate(()=>{window.keyTrace=[];document.addEventListener('keydown',e=>window.keyTrace.push({key:e.key,target:e.target.className}),true)})
 await page.keyboard.press('ArrowRight');await page.waitForTimeout(600)
 try{await frame.waitForFunction(()=>document.querySelector('.book[aria-current=true]')?.dataset.index==='1',{},{timeout:3000})}catch{
  console.log('KEY_DIAGNOSTIC '+name+' '+label+' '+JSON.stringify(await frame.evaluate(()=>({keys:window.keyTrace,active:document.activeElement?.outerHTML.slice(0,300),scroll:document.querySelector('.reel').scrollLeft,selected:document.querySelector('.book[aria-current=true]')?.dataset.index,buttons:[...document.querySelectorAll('.book')].map(n=>({left:n.offsetLeft,width:n.offsetWidth}))}))))
  await frame.locator('[data-step="1"]').click();await page.waitForTimeout(1200)
  console.log('BUTTON_DIAGNOSTIC '+JSON.stringify(await geometry()))
  throw Error('Keyboard ArrowRight did not advance in '+name+' '+label)
 }
 assert.equal(await frame.locator('.book[aria-current=true]').getAttribute('data-index'),'1')
 if(name==='chromium'&&touch){
  const client=await context.newCDPSession(page)
  const r=await frame.locator('.reel').boundingBox()
  const y=r.y+r.height/2
  await client.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:width*.72,y}]})
  for(let i=1;i<=8;i++)await client.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:width*.72-i*20,y}]})
  await client.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]})
  await page.waitForTimeout(800)
  assert.notEqual(await frame.locator('.book[aria-current=true]').getAttribute('data-index'),'1','native swipe changes book')
 }
 if(!touch){
  const r=await frame.locator('.book[aria-current=true]').boundingBox()
  await page.mouse.move(r.x+r.width*.7,r.y+r.height*.5)
  await page.mouse.down();await page.mouse.move(r.x-r.width*.7,r.y+r.height*.5,{steps:12});await page.mouse.up()
  await page.waitForTimeout(700)
  assert.notEqual(await frame.locator('.book[aria-current=true]').getAttribute('data-index'),'1','mouse drag changes book')
 }
 await frame.locator('.book').nth(3).evaluate(n=>{const r=n.parentElement;r.scrollTo({left:n.offsetLeft+n.offsetWidth/2-r.clientWidth/2,behavior:'instant'});document.activeElement?.blur()})
 await page.waitForTimeout(350)
 await page.screenshot({path:out+'/'+name+'-'+label+'.png',fullPage:true})
 if(label==='phone'||label==='desktop'){
  const b64=(await page.screenshot({type:'jpeg',quality:65})).toString('base64')
  console.log('REVIEW_BEGIN '+name+'-'+label)
  for(let i=0;i<b64.length;i+=3000)console.log('REVIEW_CHUNK '+b64.slice(i,i+3000))
  console.log('REVIEW_END '+name+'-'+label)
 }
 await page.emulateMedia({reducedMotion:'reduce'})
 assert.equal(await frame.locator('.caption.active').evaluate(n=>getComputedStyle(n).animationName),'none')
 const bookUrl=await frame.locator('.caption.active .open-book').getAttribute('href')
 assert(bookUrl.startsWith('/library?view=book-detail&book='))
 assert.deepEqual(errors,[])
 report.push({engine:name,label,...first})
 await context.close()
 }
 }finally{await browser.close()}
}
await fs.writeFile(out+'/report.json',JSON.stringify({live,limits:'Admin UI uses an authenticated-response fixture; production guest denial checked live. No physical devices, AI or audio.',viewports:report},null,2))
console.log('FEATURED_PREVIEW_PASS '+JSON.stringify(report))
