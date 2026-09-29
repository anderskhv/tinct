import {build} from 'esbuild'
import fs from 'node:fs/promises'
import path from 'node:path'
import crypto from 'node:crypto'
import assert from 'node:assert/strict'
import {pathToFileURL} from 'node:url'

/** Silent, isolated emulator check. Every API request is intercepted. */
export async function checkBackgroundAudio(device,page,output){
 await build({entryPoints:['src/narration/narrationCore.ts'],bundle:true,platform:'node',format:'esm',outfile:path.join(output,'narration-fixture.mjs')})
 const {chunkNarrationText,narrationTextForParagraph}=await import(pathToFileURL(path.resolve(output,'narration-fixture.mjs')).href)
 const bible=JSON.parse(await fs.readFile('public/data/editions/bible-web-en.json','utf8'))
 const sampleRate=8000,duration=3,body=Buffer.alloc(44+sampleRate*duration*2)
 body.write('RIFF',0);body.writeUInt32LE(body.length-8,4);body.write('WAVEfmt ',8);body.writeUInt32LE(16,16)
 body.writeUInt16LE(1,20);body.writeUInt16LE(1,22);body.writeUInt32LE(sampleRate,24);body.writeUInt32LE(sampleRate*2,28)
 body.writeUInt16LE(2,32);body.writeUInt16LE(16,34);body.write('data',36);body.writeUInt32LE(body.length-44,40)
 // Mute Android's media output, not the audio element: a muted element can
 // suppress the very native media session this check is intended to exercise.
 const muted=String(await device.shell('cmd media_session volume --stream 3 --set 0 --get'))
 assert.match(muted,/volume is 0\b/i,'the isolated emulator media output is muted')
 for(let i=0;i<sampleRate*duration;i++)body.writeInt16LE(Math.round(8000*Math.sin(2*Math.PI*440*i/sampleRate)),44+i*2)
 const calls=[]
 await page.route('**/*supabase.co/**',r=>r.abort())
 await page.route('**/api/**',async route=>{
  const request=route.request(),url=new URL(request.url())
  if(url.pathname==='/api/narration/voices')return route.fulfill({json:{enabled:true,provider:'grok',voices:[{key:'ara',label:'Ara',persona:'female'}]}})
  if(url.pathname==='/api/narration/ensure'){
   const data=request.postDataJSON(),chapter=bible.chapters.find(c=>c.number===data.chapter)
   assert(chapter,'known fixture chapter')
   calls.push({chapter:data.chapter,paragraphs:data.paragraphs.map(p=>p.index)})
   return route.fulfill({json:{paragraphs:data.paragraphs.map(item=>{
    const source=chapter.paragraphs[item.index],text=narrationTextForParagraph(source),tokens=text.split(' ')
    const chunks=chunkNarrationText(source).map(chunk=>({...chunk,ready:true,hash:data.chapter+'-'+item.index+'-'+chunk.index,
     url:'https://tinct.app/api/audio-file?fixture='+data.chapter+'-'+item.index+'-'+chunk.index,duration,
     words:tokens.slice(chunk.wordFrom,chunk.wordTo).map((text,i,a)=>({text,start:i*duration/a.length,end:(i+1)*duration/a.length})),timingsUsable:true}))
    return {paragraph:item.index,status:'ready',textHash:crypto.createHash('sha256').update(text).digest('hex'),chunkCount:chunks.length,readyChunks:chunks.length,duration:duration*chunks.length,timingsUsable:true,chunks}
   })}})
  }
  if(url.pathname==='/api/audio-file')return route.fulfill({contentType:'audio/wav',body,headers:{'Content-Length':String(body.length),'Accept-Ranges':'bytes'}})
  return route.fulfill({status:404,body:'{}'})
 })
 await page.addInitScript(()=>{
  const NativeAudio=window.Audio
  window.__nativeAudioClips=[]
  window.Audio=class extends NativeAudio {
   constructor(...args){super(...args);this.muted=false;window.__nativeAudioClips.push(this)}
  }
 })
 await page.evaluate(()=>{
  sessionStorage.setItem('tinct:lab-reader-handoff',JSON.stringify({kind:'open-reader',bookId:'bible',primaryEditionKey:'web-en',savedPlace:{bookId:'bible',chapterNumber:595,paragraphIndex:0,wordIndex:0,page:0}}))
  location.href='/reader'
 })
 await page.waitForFunction(()=>document.querySelector('.lab')?.dataset.readerReady==='true',null,{timeout:60000})
 if(await page.getByTestId('lab-chapter-cover').isVisible())await page.keyboard.press('ArrowRight')
 await page.getByTestId('lab-v2-play').click()
 await page.waitForFunction(()=>window.__nativeAudioClips.some(a=>!a.paused&&a.currentTime>.2),null,{timeout:20000})
 let locked=false
 const snapshot=()=>page.evaluate(()=>({chapter:document.querySelector('.lab')?.dataset.chapter,visibility:document.visibilityState,
  clips:window.__nativeAudioClips.map(a=>({time:a.currentTime,paused:a.paused,ended:a.ended,error:a.error?.code||null}))}))
 try{
  await device.shell('input keyevent 223');locked=true
  await page.waitForTimeout(11000)
  const background=await snapshot()
  const sessions=(await device.shell('dumpsys media_session')).toString()
  const nativeSession=sessions.includes('app.tinct.reader.review')
  await fs.writeFile(output+'/native-background-audio.json',JSON.stringify({background,nativeSession,calls,systemOutputMuted:true,syntheticFixture:true,providerCalls:false},null,2))
  console.log(JSON.stringify({nativeBackgroundAudio:{...background,nativeSession,calls:calls.length}}))
  assert.equal(background.chapter,'596','narration crosses Psalm 117 to Psalm 118 with the screen off')
  assert(nativeSession,'Android exposes a lock-screen media session for Tinct')
  await device.shell('input keyevent 127')
  await page.waitForFunction(()=>window.__nativeAudioClips.every(a=>a.paused||a.ended),null,{timeout:10000})
  await device.shell('input keyevent 126')
  await page.waitForFunction(()=>window.__nativeAudioClips.some(a=>!a.paused&&!a.ended),null,{timeout:10000})
  return {screenOffChapterAdvance:true,lockScreenSession:true,hardwareMediaPauseResume:true,syntheticSilentAudio:true}
 }finally{
  if(locked)await device.shell('input keyevent 224')
  await page.evaluate(()=>window.__nativeAudioClips?.forEach(a=>a.pause())).catch(()=>{})
 }
}
