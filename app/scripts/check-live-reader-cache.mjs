import {chromium} from '@playwright/test'
import fs from 'node:fs/promises'
import assert from 'node:assert/strict'
const output='artifacts/direct-audio-cache'
await fs.mkdir(output,{recursive:true})
const browser=await chromium.launch()
try {
 const context=await browser.newContext({serviceWorkers:'allow'})
 const page=await context.newPage()
 await page.addInitScript(()=>sessionStorage.setItem('tinct:lab-reader-handoff',JSON.stringify({kind:'open-reader',bookId:'frankenstein',primaryEditionKey:'original-en',savedPlace:{bookId:'frankenstein',chapterNumber:3,paragraphIndex:0,wordIndex:0,page:0}})))
 await page.goto('https://tinct.app/reader',{waitUntil:'domcontentloaded'})
 await page.waitForFunction(()=>!!navigator.serviceWorker.controller,null,{timeout:45000})
 const state=await page.evaluate(async()=>{
  const registration=await navigator.serviceWorker.getRegistration()
  return {controller:navigator.serviceWorker.controller?.scriptURL,scope:registration?.scope,bundle:[...document.scripts].map(s=>s.src).find(s=>s.includes('/assets/index-'))}
 })
 assert.equal(state.controller,'https://tinct.app/sw.js')
 assert.equal(state.scope,'https://tinct.app/')
 assert(state.bundle,'deployed reader bundle recorded')
 // Offline: a reload of /reader is answered by the cached reader page (not
 // the browser's "site can't be reached"), and the downloaded chapter paints.
 await page.waitForFunction(async()=>{for(const name of await caches.keys()){if(name.startsWith('tinct-app-shell-')&&await (await caches.open(name)).match('/reader'))return true}return false},null,{timeout:45000,polling:500})
 await page.waitForFunction(()=>document.querySelector('[data-testid="lab-root"]')?.dataset.readerReady==='true',null,{timeout:45000})
 await context.setOffline(true)
 await page.reload({waitUntil:'domcontentloaded'})
 await page.waitForFunction(()=>document.querySelector('[data-testid="lab-root"]')?.dataset.readerReady==='true'&&document.querySelectorAll('.lab-hearing-word').length>50,null,{timeout:45000})
 await page.screenshot({path:output+'/production-offline-reload.png'})
 await context.setOffline(false)
 await fs.writeFile(output+'/production-registration.json',JSON.stringify({live:true,directReaderRegistration:true,offlineReload:true,...state},null,2))
 await context.close()
} finally {await browser.close()}
