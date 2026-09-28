import {chromium} from '@playwright/test'
import fs from 'node:fs/promises'
import path from 'node:path'
import assert from 'node:assert/strict'
const output='artifacts/android',origin='https://tinct.app'
await fs.mkdir(output,{recursive:true})
const browser=await chromium.launch({headless:true,args:['--mute-audio']})
try{
 for(const width of [600,1200]){
  const context=await browser.newContext({viewport:{width,height:1000},serviceWorkers:'block'})
  const page=await context.newPage(),errors=[]
  page.on('pageerror',e=>errors.push(e.message))
  await page.route('**/*',async route=>{
   const req=route.request(),url=new URL(req.url())
   if(url.origin!==origin)return route.abort()
   if(url.pathname.startsWith('/api/'))return route.fulfill({status:404,json:{}})
   if(req.method()!=='GET')return route.abort()
   const pathname=url.pathname==='/reader'?'/index.html':url.pathname==='/library'?'/lab/library_2/index.html':url.pathname
   const file=path.resolve('dist','.'+pathname)
   if(file.startsWith(path.resolve('dist')+'/'))try{if((await fs.stat(file)).isFile())return route.fulfill({path:file})}catch{}
   return route.abort()
  })
  await page.addInitScript(()=>{
   const raf=requestAnimationFrame.bind(window);window.__frames=0
   window.requestAnimationFrame=cb=>raf(t=>{window.__frames++;cb(t)})
   HTMLMediaElement.prototype.play=async function(){this.muted=true}
  })
  await page.goto(origin+'/library?eink=1',{waitUntil:'domcontentloaded'})
  await page.locator('#hero-book').waitFor()
  await page.waitForTimeout(2000)
  const frames=await page.evaluate(()=>window.__frames)
  await page.waitForTimeout(600)
  assert((await page.evaluate(()=>window.__frames))-frames<5,'e-ink does not run a continuous animation loop')
  assert.equal(await page.evaluate(()=>document.documentElement.dataset.eink),'true')
  await page.screenshot({path:output+'/eink-library-'+width+'.png'})
  await page.evaluate(()=>sessionStorage.setItem('tinct:lab-reader-handoff',JSON.stringify({kind:'open-reader',bookId:'frankenstein',primaryEditionKey:'original-en',savedPlace:{bookId:'frankenstein',chapterNumber:3,paragraphIndex:2,wordIndex:0,page:0}})))
  await page.goto(origin+'/reader',{waitUntil:'domcontentloaded'})
  await page.waitForFunction(()=>document.querySelector('[data-testid="lab-root"]')?.dataset.readerReady==='true',null,{timeout:45000})
  await page.evaluate(()=>document.fonts.ready)
  assert.equal(await page.evaluate(()=>document.documentElement.dataset.eink),'true','profile follows into reader')
  await page.screenshot({path:output+'/eink-reader-'+width+'.png'})
  await page.keyboard.press('s')
  await page.getByTestId('lab-v2-theme-eink').waitFor()
  assert.equal(await page.getByTestId('lab-v2-theme-eink').getAttribute('aria-pressed'),'true')
  await page.getByTestId('lab-v2-theme-book').click()
  assert.equal(await page.evaluate(()=>document.documentElement.hasAttribute('data-eink')),false)
  await page.getByTestId('lab-v2-theme-eink').click()
  await page.getByTestId('lab-v2-advanced').click()
  await page.getByTestId('lab-v2-font-row').click()
  assert(await page.locator('[data-testid^="lab-v2-font-"]').count()>=5,'reading and accessibility font choices remain available')
  await page.screenshot({path:output+'/eink-fonts-'+width+'.png'})
  assert.deepEqual(errors,[])
  await context.close()
 }
}finally{await browser.close()}
