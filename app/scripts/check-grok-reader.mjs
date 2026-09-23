import {chromium,webkit} from '@playwright/test'
import fs from 'node:fs/promises'
import assert from 'node:assert/strict'
import {releaseWarmSignature} from '../src/narration/narrationReleaseAuth.ts'
const origin='https://tinct.app'
const plan=JSON.parse(await fs.readFile('artifacts/grok-openings/plan.json','utf8'))
const warmed=JSON.parse(await fs.readFile('artifacts/grok-openings/warm-report.json','utf8'))
const output='artifacts/grok-openings'
const stage=process.env.GROK_RELEASE_STAGE==='1'
const report={stage,startedAt:new Date().toISOString(),cases:[],generated:0,requests:0}
async function signed(path, method='GET', body=''){
 const timestamp=String(Date.now())
 const signature=await releaseWarmSignature(process.env.XAI_API_KEY,method,path,timestamp,body)
 return fetch(origin+path,{method,headers:{'Content-Type':'application/json','x-narration-provider':'grok','x-narration-release-time':timestamp,'x-narration-release-signature':signature},...(body?{body}:{}),signal:AbortSignal.timeout(90000)})
}
const voices=await (await signed('/api/narration/voices')).json()
assert.equal(voices.provider,'grok')
assert.deepEqual(voices.voices.map(v=>v.key),['f','m','orion','eve'])
async function run(browser,engine,entry,voice,{cold=false,chapter=entry.chapter,paragraph=0}={}){
 const context=await browser.newContext({viewport:{width:390,height:844},serviceWorkers:'block',hasTouch:true})
 const page=await context.newPage()
 const calls=[],errors=[]
 let explicitlyStarted=false
 page.on('pageerror',e=>errors.push(e.message))
 await page.route('**/api/narration/**',async route=>{
  const req=route.request(),url=new URL(req.url())
  if(url.pathname==='/api/narration/voices' && stage)return route.fulfill({json:voices})
  if(url.pathname==='/api/narration/ensure'){
   assert(explicitlyStarted,'Reading must not request synthesis')
   assert(++report.requests<=220,'Bounded acceptance requests')
   const body=req.postDataJSON()
   assert.equal(body.bookId,entry.bookId);assert.equal(body.editionKey,entry.editionKey);assert.equal(body.voice,voice)
   // Cloud-signed proxy only; credentials never enter the browser.
   const response=await signed('/api/narration/warm','POST',JSON.stringify({...body,mode:cold?'next':'cache'}))
   const json=await response.json()
   assert.equal(response.status,200,JSON.stringify(json))
   report.generated+=json.generated||0
   assert(report.generated<=40,'Bounded real-playback synthesis budget')
   if(!cold)assert.equal(json.generated,0)
   calls.push({body,result:json,at:Date.now()})
   return route.fulfill({status:200,json})
  }
  if(url.pathname==='/api/narration/prepare')throw Error('Legacy preparation request')
  return route.continue()
 })
 await page.addInitScript(({entry,voice,chapter,paragraph})=>{
  localStorage.setItem('tinct-lab-prefs',JSON.stringify({theme:'dark',primaryEdition:entry.editionKey,voicePersona:voice==='m'?'male':'female',audiobookVoice:['orion','eve'].includes(voice)?voice:null}))
  sessionStorage.setItem('tinct:lab-reader-handoff',JSON.stringify({kind:'open-reader',bookId:entry.bookId,primaryEditionKey:entry.editionKey,savedPlace:{bookId:entry.bookId,chapterNumber:chapter,paragraphIndex:paragraph,wordIndex:0,page:0}}))
  window.__audioEvents=[];window.__audio=null
  const play=HTMLMediaElement.prototype.play
  HTMLMediaElement.prototype.play=function(){
   this.muted=true;window.__audio=this
   if(!this.dataset.acceptance){
    this.dataset.acceptance='1'
    for(const type of ['playing','ended','pause','error'])this.addEventListener(type,()=>window.__audioEvents.push({type,time:performance.now(),src:this.currentSrc,currentTime:this.currentTime}))
   }
   return play.call(this)
  }
  Object.defineProperty(navigator.mediaDevices,'getUserMedia',{configurable:true,value:async()=>{throw Error('Microphone disabled')}})
 },{entry,voice,chapter,paragraph})
 try{
  await page.goto(origin+'/lab/phone?chrome=v2',{waitUntil:'domcontentloaded'})
  await page.waitForFunction(()=>document.querySelector('[data-testid="lab-root"]')?.dataset.readerReady==='true',null,{timeout:45000})
  await page.waitForTimeout(600)
  assert.equal(calls.length,0)
  const started=await page.evaluate(()=>performance.now())
  explicitlyStarted=true
  const button=page.locator('[data-testid="lab-v2-play"]:visible,[data-testid="lab-listen"]:visible').first()
  await button.click()
  await page.waitForFunction(()=>window.__audio && !window.__audio.paused && window.__audio.currentTime>0.05,null,{timeout:40000})
  const startMs=await page.evaluate(start=>Math.round(performance.now()-start),started)
  const initial=await page.evaluate(()=>({src:window.__audio.currentSrc,duration:window.__audio.duration,events:window.__audioEvents}))
  assert(initial.src.includes('narration%2Fgrok%2Fblob%2F')||initial.src.includes('narration/grok/blob/'))
  await page.waitForTimeout(400)
  const paint=await page.locator('[data-testid="lab-word"].is-current').count()
  // Test native ended -> next chunk using actual decoded audio.
  if(entry.bookId==='frankenstein' && voice==='f' && !cold){
   await page.evaluate(()=>{window.__audio.currentTime=Math.max(0,window.__audio.duration-.15)})
   await page.waitForFunction(previous=>window.__audio?.currentSrc!==previous && !window.__audio.paused && window.__audio.currentTime>0.05,initial.src,{timeout:20000})
  }
  const pause=page.locator('[data-testid="lab-v2-play"]:visible,[data-testid="lab-listen"]:visible').first()
  await pause.click()
  await page.waitForFunction(()=>window.__audio.paused)
  const count=calls.length
  await page.waitForTimeout(1800)
  assert.equal(calls.length,count,'Pause must stop new preparation')
  const row={engine,bookId:entry.bookId,editionKey:entry.editionKey,voice,cold,chapter,paragraph,startMs,withinFiveSeconds:startMs<=5000,paintedWords:paint,calls:calls.length,generated:calls.reduce((n,c)=>n+(c.result.generated||0),0),media:initial,errors}
  assert.deepEqual(errors,[])
  assert(paint>0,'Narration must paint its timed word')
  report.cases.push(row)
  await page.screenshot({path:output+'/'+engine+'-'+entry.bookId+'-'+voice+(cold?'-cold':'')+'.png'})
  await fs.writeFile(output+'/reader-report.json',JSON.stringify(report,null,2))
  console.log(JSON.stringify({engine,bookId:entry.bookId,voice,cold,startMs,paint}))
 }finally{await context.close()}
}
const chrome=await chromium.launch({headless:true,args:['--mute-audio']})
try{
 for(const entry of plan.entries)for(const voice of entry.voices)await run(chrome,'chromium',entry,voice)
 const entry=plan.entries[0]
 for(const voice of ['f','m']){
  const row=warmed.entries.find(e=>e.bookId===entry.bookId&&e.voice===voice)
  const last=row.recordings.at(-1)
  const source=JSON.parse(await fs.readFile('public/data/editions/'+entry.bookId+'-'+entry.editionKey+'.json','utf8'))
  const ch=source.chapters.find(c=>c.number===last.chapter)
  const p=last.paragraph+1
  await run(chrome,'chromium',entry,voice,{cold:true,chapter:p<ch.paragraphs.length?ch.number:ch.number+1,paragraph:p<ch.paragraphs.length?p:0})
 }
 for(const voice of ['orion','eve'])await run(chrome,'chromium',entry,voice,{cold:true})
}finally{await chrome.close()}
const safari=await webkit.launch({headless:true})
try{for(const voice of ['f','m'])await run(safari,'webkit',plan.entries[0],voice)}finally{await safari.close()}
report.completedAt=new Date().toISOString()
await fs.writeFile(output+'/reader-report.json',JSON.stringify(report,null,2))
