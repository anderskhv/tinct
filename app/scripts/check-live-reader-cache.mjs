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
 await fs.writeFile(output+'/production-registration.json',JSON.stringify({live:true,directReaderRegistration:true,...state},null,2))
 await context.close()
} finally {await browser.close()}
