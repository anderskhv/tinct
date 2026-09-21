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
page.setDefaultTimeout(10000)
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
  window.__captureQA={events:[],sent:0,tracks:[],dictationActive:false}
  // SpeechRecognition itself is browser-vendor hosted. Exercise its lifecycle
  // contract with a fixture; Grok below still receives real synthetic PCM.
  window.SpeechRecognition=class {
    start(){window.__captureQA.dictationActive=true;this.onstart?.();this.onresult?.({resultIndex:0,results:[{isFinal:true,0:{transcript:'A fixture dictated question'}}]})}
    stop(){window.__captureQA.dictationActive=false;this.onend?.()}
  }
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
  await page.getByTestId('lab-super').click()
  await page.getByTestId('lab-super-row-chat').click()
  await page.getByTestId('lab-ask-mic').click()
  await page.getByTestId('lab-dictation-status').waitFor()
  assert(await page.evaluate(()=>window.__captureQA.dictationActive))
  await open()
  assert.equal(await page.evaluate(()=>window.__captureQA.dictationActive),false,'Talk must stop dictation')
  report.checks.push({name:'dictation fixture hands microphone ownership to real Grok capture'})
  const panel=page.getByTestId('lab-voice-panel')
  const box=await panel.boundingBox(), head=await panel.locator('[data-reader-window-handle]').boundingBox()
  await page.mouse.move(head.x+35,head.y+head.height/2)
  await page.mouse.down();await page.mouse.move(head.x-65,head.y+head.height/2+35,{steps:8});await page.mouse.up()
  assert(Math.abs((await panel.boundingBox()).x-box.x)>60,'Talk panel can move during a call')
  const resize=panel.locator('[data-reader-window-resize]')
  await resize.focus();await page.keyboard.press('ArrowLeft')
  assert((await panel.boundingBox()).width<box.width,'Talk panel can resize during a call')
  await page.screenshot({path:output+'/desktop-call.png'})
  await page.waitForFunction(()=>document.querySelector('[data-testid="lab-voice-panel"]')?.dataset.status==='speaking',null,{timeout:35000})
  // Inject a silent pause in the synthetic source so one answer finishes,
  // then restore the repeating question to exercise interruption as well.
  await page.evaluate(()=>window.__captureQA.tracks.filter(t=>t.readyState==='live').forEach(t=>{t.enabled=false}))
  await page.waitForFunction(()=>window.__captureQA.events.some(e=>e.type==='response.done'&&e.status==='completed')&&document.querySelector('[data-testid="lab-voice-panel"]')?.dataset.status==='listening',null,{timeout:90000})
  report.checks.push({name:'complete spoken answer returns to listening',...(await evidence())})
  await page.evaluate(()=>window.__captureQA.tracks.filter(t=>t.readyState==='live').forEach(t=>{t.enabled=true}))
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
  await page.waitForFunction(prior=>window.__captureQA.events.filter(e=>e.type==='response.done').length>prior,prior,{timeout:40000})
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
