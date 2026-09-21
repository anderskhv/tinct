import { chromium } from '@playwright/test'
import fs from 'node:fs/promises'
import path from 'node:path'
import assert from 'node:assert/strict'

const origin='https://tinct.app', output='artifacts/voice-capture'
const live=process.env.READER_LIVE==='1'
await fs.mkdir(output,{recursive:true})
const browser=await chromium.launch({headless:true,args:[
  '--mute-audio','--use-fake-device-for-media-stream','--use-fake-ui-for-media-stream',
  '--use-file-for-fake-audio-capture='+path.resolve(process.argv[2]),
  '--autoplay-policy=no-user-gesture-required',
]})
const context=await browser.newContext({viewport:{width:1440,height:900},permissions:['microphone'],serviceWorkers:'block'})
const page=await context.newPage()
const report={live,checks:[],events:[],errors:[]}
page.on('pageerror',error=>report.errors.push(error.message))
await page.route('**/*',async route=>{
  const url=new URL(route.request().url())
  if(!live&&url.origin===origin&&route.request().method()==='GET'){
    const pathname=['/reader','/lab/phone'].includes(url.pathname)?'/app.html':url.pathname
    const filename=path.resolve('dist','.'+pathname)
    if(filename.startsWith(path.resolve('dist')+'/')){
      try{if((await fs.stat(filename)).isFile())return route.fulfill({path:filename})}catch{}
    }
  }
  return route.continue()
})
await page.addInitScript(()=>{
  sessionStorage.setItem('tinct:lab-reader-handoff',JSON.stringify({kind:'open-reader',bookId:'notes-from-underground',primaryEditionKey:'original-en',savedPlace:{bookId:'notes-from-underground',chapterNumber:1,paragraphIndex:0,wordIndex:0,page:0}}))
  window.__captureQA={events:[],sent:0,tracks:[]}
  const original=navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices)
  navigator.mediaDevices.getUserMedia=async constraints=>{
    const stream=await original(constraints)
    window.__captureQA.tracks.push(...stream.getTracks())
    return stream
  }
  const Native=WebSocket
  window.WebSocket=class extends Native{
    constructor(url,protocols){
      super(url,protocols)
      this.addEventListener('message',event=>{
        try{
          const data=JSON.parse(event.data)
          if(data.type==='input_audio_buffer.speech_started' && document.querySelector('[data-testid="lab-voice-panel"]')?.dataset.status==='speaking')window.__captureQA.events.push({type:'client_barge_in',at:performance.now()})
          // No credentials or user transcript retained in the diagnostic log.
          if(!data.type.includes('delta'))window.__captureQA.events.push({at:performance.now(),type:data.type,id:data.response?.id,status:data.response?.status,error:data.error?.message})
          if(data.type==='response.output_audio.delta')window.__captureQA.audio=(window.__captureQA.audio||0)+data.delta.length
        }catch{}
      })
    }
    send(data){try{if(JSON.parse(data).type==='input_audio_buffer.append')window.__captureQA.sent++}catch{};return super.send(data)}
  }
})
const evidence=()=>page.evaluate(()=>({events:window.__captureQA.events,sent:window.__captureQA.sent,audio:window.__captureQA.audio||0,tracks:window.__captureQA.tracks.map(t=>t.readyState),capture:window.__tinctVoiceCapture?.(),latency:window.__tinctVoiceDebug?.samples}))
async function open(){
  await page.getByTestId('lab-super').click()
  await page.getByTestId('lab-super-row-talk').click()
  await page.waitForFunction(()=>document.querySelector('[data-testid="lab-voice-panel"]')?.dataset.connection==='connected',null,{timeout:30000})
}
try{
  await page.goto(origin+'/reader?chrome=v2',{waitUntil:'domcontentloaded'})
  await page.waitForFunction(()=>document.querySelector('[data-testid="lab-root"]')?.dataset.readerReady==='true',null,{timeout:45000})
  await open()
  await page.waitForFunction(()=>window.__captureQA.events.filter(e=>e.type==='response.done').length>=3&&(window.__captureQA.audio||0)>100000,null,{timeout:90000})
  const first=await evidence()
  assert(first.events.filter(e=>e.type==='input_audio_buffer.speech_started').length>=3)
  assert(first.capture.sentChunks>30)
  assert(first.events.some(e=>e.type==='client_barge_in'),'synthetic speech must interrupt assistant playback')
  report.checks.push({name:'three consecutive turns',...first})
  await page.getByTestId('lab-voice-panel-mute').click()
  await page.waitForTimeout(500)
  const muted=await evidence()
  await page.waitForTimeout(1200)
  assert.equal((await evidence()).sent,muted.sent,'mute must stop outgoing microphone audio')
  await page.getByTestId('lab-voice-panel-mute').click()
  await page.waitForTimeout(1200)
  assert((await evidence()).sent>muted.sent,'unmute must resume microphone audio')
  await page.getByTestId('lab-voice-panel-minimize').click()
  await page.getByTestId('lab-voice-pill').waitFor()
  await page.getByTestId('lab-voice-pill-expand').click()
  await page.getByTestId('lab-voice-panel-end').click()
  await page.waitForTimeout(300)
  assert((await evidence()).tracks.every(s=>s==='ended'))
  report.checks.push({name:'mute unmute minimize end',capture:(await evidence()).capture})
  // Same page and AudioContext: duplicate processor registration used to
  // fall back on every restart. Require fresh audio and a new completed turn.
  const prior=(await evidence()).events.filter(e=>e.type==='response.done').length
  await open()
  await page.waitForFunction(prior=>window.__captureQA.events.filter(e=>e.type==='response.done').length>prior,null,{timeout:40000})
  report.checks.push({name:'restart same page',...(await evidence())})
  await page.getByTestId('lab-voice-panel-end').click()
  assert((await evidence()).tracks.every(s=>s==='ended'))
  await page.screenshot({path:output+'/desktop-after-restart.png'})
  assert.deepEqual(report.errors,[])
  report.passed=true
}catch(error){
  report.passed=false;report.error=error.stack;report.evidence=await evidence().catch(()=>null)
  report.visibleText=(await page.locator('body').innerText()).slice(-2000)
  await page.screenshot({path:output+'/failure.png'}).catch(()=>{})
}finally{
  await fs.writeFile(output+'/report.json',JSON.stringify(report,null,2))
  console.log(JSON.stringify(report,null,2));await browser.close()
}
if(!report.passed)process.exit(1)
