import { webkit } from '@playwright/test'
import fs from 'node:fs/promises'
await fs.mkdir('artifacts/omarchy',{recursive:true})
const browser=await webkit.launch({headless:true}), report=[]
try {
 for(const routing of ['all','api']) for(let repeat=0;repeat<3;repeat++){
  const context=await browser.newContext({viewport:{width:1440,height:900},serviceWorkers:'block'})
  const page=await context.newPage(),events=[]
  page.on('pageerror',e=>events.push({kind:'pageerror',message:e.message,stack:e.stack,at:Date.now()}))
  page.on('requestfailed',r=>events.push({kind:'failed',url:r.url(),failure:r.failure(),at:Date.now()}))
  page.on('console',m=>{if(m.text().startsWith('WARM_TRACE'))events.push({kind:'trace',message:m.text(),at:Date.now()})})
  await page.route(routing==='all'?'**/*':'**/api/**',async route=>{
   const req=route.request(),url=new URL(req.url())
   if(url.pathname==='/api/narration/voices')return route.fulfill({json:{enabled:false,provider:'grok',voices:[]}})
   if(req.method()!=='GET')return route.fulfill({status:401,json:{error:'Silent diagnostics'}})
   return route.continue()
  })
  await page.addInitScript(()=>{
   sessionStorage.setItem('tinct:lab-reader-handoff',JSON.stringify({kind:'open-reader',bookId:'frankenstein',primaryEditionKey:'original-en',savedPlace:{bookId:'frankenstein',chapterNumber:3,paragraphIndex:2,wordIndex:0,page:0}}))
   const trace=(event,extra={})=>console.log('WARM_TRACE '+JSON.stringify({event,at:performance.now(),...extra}))
   addEventListener('pagehide',()=>trace('pagehide'))
   addEventListener('unhandledrejection',e=>trace('unhandled',{message:String(e.reason)}))
   const original=fetch.bind(window)
   window.fetch=(input,init)=>{
    if(!String(input).includes('/spines/'))return original(input,init)
    window.__warmStarted=(window.__warmStarted||0)+1
    trace('start',{url:String(input)})
    return original(input,init).then(r=>{trace('response',{url:String(input),status:r.status});return r},e=>{trace('caught',{url:String(input),error:String(e),aborted:init?.signal?.aborted});throw e})
   }
  })
  let failure=null
  try {
   await page.goto('https://tinct.app/reader',{waitUntil:'domcontentloaded',timeout:45000})
   await page.waitForFunction(()=>window.__warmStarted>=2,null,{timeout:30000})
   await page.goto('https://tinct.app/library',{waitUntil:'domcontentloaded',timeout:45000})
   await page.waitForTimeout(1000)
  }catch(e){failure=String(e)}
  report.push({routing,repeat,failure,events})
  await context.close()
  await fs.writeFile('artifacts/omarchy/warmup-navigation.json',JSON.stringify(report,null,2))
 }
 console.log(JSON.stringify(report.map(({routing,repeat,failure,events})=>({routing,repeat,failure,pageerrors:events.filter(e=>e.kind==='pageerror')}))))
}finally{await browser.close()}
