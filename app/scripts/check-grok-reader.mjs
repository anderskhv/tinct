import {chromium,webkit} from '@playwright/test'
import fs from 'node:fs/promises'
import assert from 'node:assert/strict'
import {releaseWarmSignature} from '../src/narration/narrationReleaseAuth.ts'
const origin='https://tinct.app'
const plan=JSON.parse(await fs.readFile('artifacts/grok-openings/plan.json','utf8'))
const warmed=JSON.parse(await fs.readFile('artifacts/grok-openings/warm-report.json','utf8'))
const output='artifacts/grok-openings'
const stage=process.env.GROK_RELEASE_STAGE==='1'
const webkitOnly=process.env.GROK_ACCEPTANCE_ONLY==='webkit'
const report={stage,startedAt:new Date().toISOString(),cases:[],generated:0,requests:0}
async function signed(path, method='GET', body=''){
 const timestamp=String(Date.now())
 const signature=await releaseWarmSignature(process.env.XAI_API_KEY,method,path,timestamp,body)
 return fetch(origin+path,{method,headers:{'Content-Type':'application/json','x-narration-provider':'grok','x-narration-release-time':timestamp,'x-narration-release-signature':signature},...(body?{body}:{}),signal:AbortSignal.timeout(90000)})
}
const voices=await (await (stage?signed('/api/narration/voices'):fetch(origin+'/api/narration/voices'))).json()
assert.equal(voices.provider,'grok')
assert.deepEqual(voices.voices.map(v=>v.key),['f','m','orion','eve'])
async function run(browser,engine,entry,voice,{cold=false,continuous=false,chapterBoundary=false,chapter=entry.chapter,paragraph=0,word=0}={}){
 const context=await browser.newContext({viewport:{width:390,height:844},serviceWorkers:'block',hasTouch:true})
 const page=await context.newPage()
 const calls=[],errors=[]
 let coldProof
 if(cold){
  const cached=await (await signed('/api/narration/warm','POST',JSON.stringify({bookId:entry.bookId,editionKey:entry.editionKey,chapter,voice,mode:'cache',paragraphs:[{index:paragraph,fromChunk:0}]}))).json()
  coldProof={chapter,paragraph,chunk:0,ready:!!cached.paragraphs?.[0]?.chunks?.find(c=>c.index===0)?.ready}
  assert(!coldProof.ready,'Cold playback target was already cached before page load')
 }
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
   const call={body,result:null,at:Date.now()};calls.push(call)
   if(cold && calls.length===1){
    const target=body.paragraphs[0]
    assert.equal(body.chapter,chapter);assert.equal(target.index,paragraph);assert.equal(target.fromChunk||0,0)
    call.coldProof=coldProof
   }
   const response=await (!stage && !cold && !continuous ? route.fetch() : signed('/api/narration/warm','POST',JSON.stringify({...body,mode:cold||continuous?'next':'cache'})))
   const json=await response.json()
   assert.equal(typeof response.status==='function'?response.status():response.status,200,JSON.stringify(json))
   if(cold && calls.length===1)assert.equal(json.generated,1,'The proved-cold target must actually synthesize')
   report.generated+=json.generated||0
   assert(report.generated<=40,'Bounded real-playback synthesis budget')
   if(!cold&&!continuous)assert.equal(json.generated,0)
   call.result=json;call.completedAt=Date.now()
   return route.fulfill({status:200,json}).catch(()=>{})
  }
  if(url.pathname==='/api/narration/prepare')throw Error('Legacy preparation request')
  return route.continue()
 })
 await page.addInitScript(({entry,voice,chapter,paragraph,word})=>{
  localStorage.setItem('tinct-lab-prefs',JSON.stringify({theme:'dark',primaryEdition:entry.editionKey,voicePersona:voice==='m'?'male':'female',audiobookVoice:['orion','eve'].includes(voice)?voice:null}))
  sessionStorage.setItem('tinct:lab-reader-handoff',JSON.stringify({kind:'open-reader',bookId:entry.bookId,primaryEditionKey:entry.editionKey,savedPlace:{bookId:entry.bookId,chapterNumber:chapter,paragraphIndex:paragraph,wordIndex:word,page:0}}))
  window.__audioEvents=[];window.__audio=null
  const observed=new WeakSet()
  function observe(audio){
   audio.muted=true;window.__audio=audio
   if(observed.has(audio))return
   observed.add(audio)
   for(const type of ['playing','ended','pause','error','loadstart','loadedmetadata','durationchange','canplay','seeking','seeked','stalled','waiting'])audio.addEventListener(type,()=>window.__audioEvents.push({type,time:performance.now(),src:audio.currentSrc,currentTime:audio.currentTime,duration:audio.duration}),{capture:true})
  }
  const NativeAudio=window.Audio
  window.Audio=function(...args){const audio=new NativeAudio(...args);observe(audio);return audio}
  window.Audio.prototype=NativeAudio.prototype
  Object.setPrototypeOf(window.Audio,NativeAudio)
  const play=HTMLMediaElement.prototype.play
  HTMLMediaElement.prototype.play=function(){observe(this);return play.call(this)}
  Object.defineProperty(navigator.mediaDevices,'getUserMedia',{configurable:true,value:async()=>{throw Error('Microphone disabled')}})
 },{entry,voice,chapter,paragraph,word})
 try{
  await page.goto(origin+'/lab/phone?chrome=v2',{waitUntil:'domcontentloaded'})
  await page.waitForFunction(()=>document.querySelector('[data-testid="lab-root"]')?.dataset.readerReady==='true',null,{timeout:45000})
  await page.waitForTimeout(600)
  assert.equal(calls.length,0)
  const started=await page.evaluate(()=>performance.now())
  explicitlyStarted=true
  const button=page.locator('[data-testid="lab-v2-play"]:visible,[data-testid="lab-listen"]:visible').first()
  await button.click()
  await page.waitForFunction(()=>window.__audio && !window.__audio.paused && window.__audioEvents.some(e=>e.type==='playing'&&e.src===window.__audio.currentSrc),null,{timeout:40000})
  const startMs=await page.evaluate(start=>Math.round(window.__audioEvents.find(e=>e.type==='playing').time-start),started)
  const initial=await page.evaluate(()=>({src:window.__audio.currentSrc,duration:window.__audio.duration,events:window.__audioEvents}))
  assert(initial.src.includes('narration%2Fgrok%2Fblob%2F')||initial.src.includes('narration/grok/blob/'))
  const painted=page.locator('.lab-hearing-stage .lab-hearing-word.is-current,[data-testid="lab-word"].is-current')
  await painted.first().waitFor({state:'visible',timeout:8000})
  const paint=await painted.count()
  const paintedText=await painted.allTextContents()
  await page.screenshot({path:output+'/'+engine+'-'+entry.bookId+'-'+voice+(cold?'-cold':continuous?'-continuous':'')+'-playing.png'})
  // Test native ended -> next chunk using actual decoded audio.
  if(entry.bookId==='frankenstein' && voice==='f' && !cold && !continuous){
   // The opening recording lasts only two seconds. Let it finish naturally;
   // seeking an incompletely buffered MP3 tests WebKit seeking, not handoff.
   await page.waitForFunction(previous=>window.__audio?.currentSrc!==previous && !window.__audio.paused && window.__audio.currentTime>0.05,initial.src,{timeout:20000})
  }
  let chapterHandoff
  if(chapterBoundary){
   // A saved place opens its containing page. Seek through the reader's own
   // word control so this check starts at the actual final spoken word.
   await page.getByTestId('lab-hearing-stage').locator('[data-paragraph-index="'+paragraph+'"][data-word-index="'+word+'"]').click()
   await page.waitForFunction(previous=>Number(document.querySelector('[data-testid="lab-root"]')?.dataset.chapter)!==previous,chapter,{timeout:25000})
   await page.waitForFunction(()=>window.__audio && !window.__audio.paused && window.__audio.currentTime>0.05,null,{timeout:20000})
   chapterHandoff={from:chapter,to:Number(await page.getByTestId('lab-root').getAttribute('data-chapter')),playing:true}
   assert.equal(chapterHandoff.to,chapter+1)
  }
  let continuousEvidence
  if(continuous){
   const prepared=warmed.entries.find(e=>e.bookId===entry.bookId&&e.voice===voice)
   await page.waitForFunction(seconds=>{
    const completed=window.__audioEvents.filter(e=>e.type==='ended').reduce((n,e)=>n+e.duration,0)
    return completed+(window.__audio?.currentTime||0)>seconds && !window.__audio.paused
   },prepared.seconds+10,{timeout:420000})
   const events=await page.evaluate(()=>window.__audioEvents)
   const cached=new Set(prepared.recordings.map(r=>r.hash))
   const beyond=events.filter(e=>e.type==='playing').some(e=>{
    const path=new URL(e.src).searchParams.get('path')||''
    const hash=path.split('/').at(-1)?.replace('.mp3','')
    return hash&&!cached.has(hash)
   })
   assert(beyond,'Continuous playback must reach a recording beyond the prepared opening')
   continuousEvidence={preparedSeconds:prepared.seconds,beyondPreparedOpening:true,events}
  }
  const pause=page.locator('[data-testid="lab-v2-play"]:visible,[data-testid="lab-listen"]:visible').first()
  await pause.click()
  await page.waitForFunction(()=>window.__audio.paused)
  const count=calls.length
  await page.waitForTimeout(1800)
  assert.equal(calls.length,count,'Pause must stop new preparation')
  const row={engine,bookId:entry.bookId,editionKey:entry.editionKey,voice,cold,continuous,continuousEvidence,chapterHandoff,chapter,paragraph,startMs,withinFiveSeconds:startMs<=5000,paintedWords:paint,paintedText,calls:calls.length,requestEvidence:calls.map(c=>({body:c.body,at:c.at,completedAt:c.completedAt,coldProof:c.coldProof,generated:c.result?.generated})),generated:calls.reduce((n,c)=>n+(c.result?.generated||0),0),media:initial,errors}
  assert.deepEqual(errors,[])
  assert(paint>0,'Narration must paint its timed word')
  report.cases.push(row)
  await page.screenshot({path:output+'/'+engine+'-'+entry.bookId+'-'+voice+(cold?'-cold':'')+'.png'})
  await fs.writeFile(output+'/reader-report.json',JSON.stringify(report,null,2))
  console.log(JSON.stringify({engine,bookId:entry.bookId,voice,cold,startMs,paint}))
 }catch(error){
  report.cases.push({engine,bookId:entry.bookId,voice,cold,failed:true,error:String(error),calls,errors,media:await page.evaluate(()=>({events:window.__audioEvents,state:window.__audio?{src:window.__audio.currentSrc,currentTime:window.__audio.currentTime,duration:window.__audio.duration,paused:window.__audio.paused,ended:window.__audio.ended,readyState:window.__audio.readyState,networkState:window.__audio.networkState,error:window.__audio.error?.message}:null})),body:(await page.locator('body').innerText()).slice(-4000)})
  await fs.writeFile(output+'/reader-report.json',JSON.stringify(report,null,2))
  await page.screenshot({path:output+'/'+engine+'-'+entry.bookId+'-'+voice+'-failure.png'}).catch(()=>{})
  throw error
 }finally{await page.unrouteAll({behavior:'wait'});await context.close()}
}
// Two simultaneous real requests must publish one shared recording.
{
 const entry=plan.entries[0]
 const body=JSON.stringify({bookId:entry.bookId,editionKey:entry.editionKey,chapter:2,voice:'orion',mode:stage?'next':'cache',paragraphs:[{index:1}]})
 const answers=await Promise.all([1,2].map(async()=>{const r=await signed('/api/narration/warm','POST',body);assert.equal(r.status,200);return r.json()}))
 const generated=answers.reduce((n,r)=>n+(r.generated||0),0)
 assert(generated<=1,'Concurrent identical synthesis paid more than once')
 assert(answers.some(r=>r.paragraphs[0]?.readyChunks>0))
 const hashes=answers.flatMap(r=>r.paragraphs[0]?.chunks?.filter(c=>c.ready).map(c=>c.hash)||[])
 assert.equal(new Set(hashes).size,1)
 report.generated+=generated
 report.concurrency={requests:2,generated,sharedHash:hashes[0],reused:generated===0}
}
if(!webkitOnly){
const chrome=await chromium.launch({headless:true,args:['--mute-audio']})
try{
 for(const entry of plan.entries)for(const voice of entry.voices)await run(chrome,'chromium',entry,voice)
 const entry=plan.entries[0]
 if(stage)for(const voice of ['f','m','orion','eve']){
  // Use the exact chapter opening, not a page containing a later paragraph.
  // Find a genuinely missing first chunk without causing any synthesis.
  let coldChapter
  for(let chapter=5;chapter<=12;chapter++){
   const cached=await (await signed('/api/narration/warm','POST',JSON.stringify({bookId:entry.bookId,editionKey:entry.editionKey,chapter,voice,mode:'cache',paragraphs:[{index:0,fromChunk:0}]}))).json()
   if(cached.paragraphs?.[0]?.chunks?.find(c=>c.index===0)?.ready===false){coldChapter=chapter;break}
  }
  assert(coldChapter,'No untouched cold chapter in the bounded probe range')
  await run(chrome,'chromium',entry,voice,{cold:true,chapter:coldChapter})
 }
 if(stage)await run(chrome,'chromium',entry,'f',{continuous:true})
 if(!stage){
  const prince=plan.entries.find(e=>e.bookId==='the-prince')
  const source=JSON.parse(await fs.readFile('public/data/editions/'+prince.bookId+'-'+prince.editionKey+'.json','utf8'))
  const ch=source.chapters[0],paragraph=ch.paragraphs.length-1,word=ch.paragraphs[paragraph].trim().split(/\s+/).length-1
  await run(chrome,'chromium',prince,'f',{chapterBoundary:true,chapter:ch.number,paragraph,word})
 }
}finally{await chrome.close()}
}
const safari=await webkit.launch({headless:true})
try{for(const voice of ['f','m'])await run(safari,'webkit',plan.entries[0],voice)}finally{await safari.close()}
report.completedAt=new Date().toISOString()
await fs.writeFile(output+'/reader-report.json',JSON.stringify(report,null,2))
