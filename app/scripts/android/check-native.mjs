import {restartNativePage} from './native-page.mjs'
import {prepareSilentEmulator} from './prepare-silent-emulator.mjs'
import {checkNativeSync} from './check-sync.mjs'
import {checkNativeDownloads} from './check-downloads.mjs'
import {checkBackgroundAudio} from './check-background.mjs'
import { _android as android } from 'playwright'
import {execFileSync} from 'node:child_process'
import fs from 'node:fs/promises'
import assert from 'node:assert/strict'
const output='artifacts/android',packageId='app.tinct.reader.review',activity=packageId+'/app.tinct.reader.MainActivity'
await fs.mkdir(output,{recursive:true})
execFileSync('adb',['install','-r','android/app/build/outputs/apk/debug/app-debug.apk'],{stdio:'inherit'})
execFileSync('adb',['shell','svc','wifi','disable'])
execFileSync('adb',['shell','svc','data','disable'])
const [device]=await android.devices()
assert(device,'Android emulator is connected')
device.setDefaultTimeout(60000)
let page
const stages=[]
const acceptanceFailures=[]
function stage(name){stages.push({name,time:new Date().toISOString()});console.log(JSON.stringify({nativeStage:name}))}
try {
 stage('emulator-audio-setup')
 await prepareSilentEmulator(device,output)
 stage('launch')
 await device.shell('am start -n '+activity)
 page=await(await device.webView({pkg:packageId})).page()
 page.setDefaultTimeout(60000)
 await page.locator('#hero-book canvas[data-painted="true"]').waitFor()
 assert.equal(await page.evaluate(()=>window.Capacitor?.isNativePlatform()),true)
 await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))))
 const cover=await page.locator('#hero-book canvas').evaluate(c=>{
  const d=c.getContext('2d').getImageData(0,0,c.width,c.height).data,colors=new Set()
  for(let i=0;i<d.length;i+=Math.max(4,Math.floor(d.length/4096/4)*4))colors.add([d[i],d[i+1],d[i+2],d[i+3]].join(','))
  return {width:c.width,height:c.height,colors:colors.size,style:{display:getComputedStyle(c).display,visibility:getComputedStyle(c).visibility,opacity:getComputedStyle(c).opacity},parentFilter:getComputedStyle(c.parentElement).filter}
 })
 await fs.writeFile(output+'/native-cover-diagnostics.json',JSON.stringify(cover,null,2))
 console.log(JSON.stringify({nativeCoverDiagnostic:cover}))
 assert(cover.colors>32,'offline cover contains painted image detail')
 await page.waitForTimeout(500)
 await device.screenshot({path:output+'/native-offline-library.png'})
 await device.screenshot({path:output+'/native-offline-library-device.png'})
 console.log(JSON.stringify({nativeDeviceVisual:{name:'offline-library-device',png:(await fs.readFile(output+'/native-offline-library-device.png')).toString('base64')}}))
 console.log(JSON.stringify({nativeVisual:{name:'offline-library',jpeg:(await page.screenshot({type:'jpeg',quality:40,scale:'css'})).toString('base64')}}))
 stage('library-read')
 await page.locator('#read-featured').click()
 await page.locator('#book-overlay').waitFor()
 // Opening the cover makes the overlay visible before its tour button is
 // available. Wait for a usable surface rather than racing the animation.
 await page.waitForFunction(()=>{
  const next=document.querySelector('#slip-next'),intro=document.querySelector('#intro')
  return (next && !next.hidden) || (intro?.getAttribute('aria-hidden')==='false' && getComputedStyle(intro).pointerEvents==='auto')
 })
 if(await page.locator('#slip-next').isVisible())await page.locator('#slip-next').click()
 await page.waitForFunction(()=>{
  const intro=document.querySelector('#intro')
  return intro?.getAttribute('aria-hidden')==='false' && getComputedStyle(intro).pointerEvents==='auto'
 })
 await page.locator('#begin-reading').click()
 await page.waitForFunction(()=>document.querySelector('[data-testid="lab-root"]')?.dataset.readerReady==='true',null,{timeout:60000})
 assert.match(await page.getByTestId('lab-root').innerText(),/Frankenstein/)
 await page.evaluate(()=>{
  localStorage.setItem('tinct-lab-prefs',JSON.stringify({theme:'book',fontFamily:'garamond',fontSize:1.3,compareOpen:false}))
  sessionStorage.setItem('tinct:lab-reader-handoff',JSON.stringify({kind:'open-reader',bookId:'frankenstein',primaryEditionKey:'original-en',savedPlace:{bookId:'frankenstein',chapterNumber:3,paragraphIndex:0,wordIndex:0,page:0}}))
  location.href='/reader?eink=1'
 })
 await page.waitForFunction(()=>document.querySelector('[data-testid="lab-root"]')?.dataset.readerReady==='true',null,{timeout:60000})
 await page.evaluate(()=>document.fonts.ready)
 assert.equal(await page.evaluate(()=>document.documentElement.dataset.eink),'true')
 if(await page.getByTestId('lab-chapter-cover').isVisible())await page.keyboard.press('ArrowRight')
 stage('native-page-key')
 const before=await page.getByTestId('lab-root').getAttribute('data-place')
 const started=Date.now()
 await device.shell('input keyevent 93')
 await page.waitForFunction(before=>document.querySelector('[data-testid="lab-root"]')?.getAttribute('data-place')!==before,before)
 const turnMs=Date.now()-started
 await device.screenshot({path:output+'/native-offline-reader.png'})
 console.log(JSON.stringify({nativeVisual:{name:'offline-reader',jpeg:(await page.screenshot({type:'jpeg',quality:40,scale:'css'})).toString('base64')}}))
 await page.waitForTimeout(1500)
 const stored=await page.evaluate(()=>Object.fromEntries(Object.entries(localStorage).filter(([key])=>/position|prefs|eink/.test(key))))
 stage('force-close')
 page=await restartNativePage(device,packageId,()=>device.shell('am start -n '+activity))
 await page.locator('.reading-table.is-ready #rt-continue').waitFor()
 await page.waitForFunction(()=>!document.documentElement.classList.contains('returning-pending'))
 await page.evaluate(()=>document.fonts.ready)
 assert.equal(await page.evaluate(()=>document.documentElement.dataset.eink),'true','e-ink mode survives restart into the library')
 const metaInk=await page.locator('.rt-meta').evaluate(n=>getComputedStyle(n).color)
 assert.equal(metaInk,'rgb(51, 51, 51)','returning-library metadata has dark e-ink contrast')
 await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))))
 await page.waitForTimeout(800)
 console.log(JSON.stringify({nativeLibraryGeometry:await page.evaluate(()=>({html:document.documentElement.className,body:document.body.className,nodes:['#hero','.reading-table','#rt-title','#rt-continue'].map(sel=>{const n=document.querySelector(sel),r=n.getBoundingClientRect(),s=getComputedStyle(n);return {sel,rect:{x:r.x,y:r.y,width:r.width,height:r.height},display:s.display,visibility:s.visibility,color:s.color,opacity:s.opacity}})}))}))
 // DOM readiness precedes Android's next composed frame. Wait for actual
 // pixels instead of treating the first stale screen capture as final output.
 let paint={fraction:0},png,paintSamples=0
 const paintDeadline=Date.now()+3000
 do {
  png=await device.screenshot()
  paint=await page.evaluate(async png=>{
   const img=new Image();img.src='data:image/png;base64,'+png;await img.decode()
   const canvas=document.createElement('canvas');canvas.width=img.naturalWidth;canvas.height=img.naturalHeight
   const ctx=canvas.getContext('2d');ctx.drawImage(img,0,0)
   const x=Math.floor(canvas.width*.05),y=Math.floor(canvas.height*.20),w=Math.floor(canvas.width*.70),h=Math.floor(canvas.height*.65)
   const values=ctx.getImageData(x,y,w,h).data
   let dark=0
   for(let i=0;i<values.length;i+=4)if(values[i]<128&&values[i+1]<128&&values[i+2]<128)dark++
   return {dark,total:w*h,fraction:dark/(w*h)}
  },png.toString('base64'))
  paintSamples++
  if(paint.fraction>.005)break
  await page.waitForTimeout(100)
 }while(Date.now()<paintDeadline)
 await fs.writeFile(output+'/native-offline-library-restored.png',png)
 console.log(JSON.stringify({nativeDeviceVisual:{name:'eink-library',png:png.toString('base64')}}))
 console.log(JSON.stringify({nativeLibraryPaint:{...paint,samples:paintSamples}}))
 if(paint.fraction<=.005)acceptanceFailures.push({check:'eink-library-paint',error:'The actual screen did not paint the library within three seconds of DOM readiness.'})
 const restored=await page.evaluate(()=>Object.fromEntries(Object.entries(localStorage).filter(([key])=>/position|prefs|eink/.test(key))))
 assert.deepEqual(restored,stored,'force-close retains local reading anchors and settings')
 // Exercise the Android deep-link plumbing without contacting an auth
 // provider: a matching cancellation must return visibly to the account UI.
 for(const cold of [false,true,true,true,true,true]){
  stage(cold?'auth-cold-return':'auth-warm-return')
  const nonce=(cold?'native-cold-':'native-warm-')+'0123456789-'+stages.length
  await page.evaluate(async({packageId,nonce})=>{
   await window.Capacitor.Plugins.NativeAuthStorage.set({key:'tinct:native-auth-pending',value:JSON.stringify({appId:packageId,nonce,returnTo:'/reader',kind:'oauth',expires:Date.now()+15*60_000})})
   await window.Capacitor.Plugins.App.addListener('appUrlOpen',async event=>{
    const pending=JSON.parse((await window.Capacitor.Plugins.NativeAuthStorage.get({key:'tinct:native-auth-pending'})).value||'null')
    try{
     const url=new URL(event.url),fragment=new URLSearchParams(url.hash.slice(1))
     window.__nativeReturnCheck={protocol:url.protocol,host:url.hostname,path:url.pathname,
      queryKeys:[...url.searchParams.keys()],fragmentKeys:[...fragment.keys()],
      flowMatches:url.searchParams.get('flow')===pending?.nonce,appMatches:pending?.appId===packageId,
      unexpired:pending?.expires>Date.now(),pendingPresent:!!pending}
    }catch{window.__nativeReturnCheck={parseError:true}}
   })
  },{packageId,nonce})
  const callback=packageId+'://auth/callback?flow='+nonce+(cold?'&error=access_denied':'#error=access_denied')
  let launchResult
  const launch=async()=>{launchResult=await device.shell("am start -W -a android.intent.action.VIEW -d '"+callback+"' "+packageId)}
  if(cold)page=await restartNativePage(device,packageId,launch)
  else await launch()
  console.log(JSON.stringify({nativeIntentDispatch:String(launchResult).replace(/app\.tinct\.reader(?:\.review)?:\/\/[^\s]+/g,'[redacted callback]')}))
  try{
  await page.locator('[data-auth-status]').filter({hasText:'Sign-in could not be completed. Please try again.'}).waitFor({timeout:60000})
  assert.equal(await page.evaluate(async()=> (await window.Capacitor.Plugins.NativeAuthStorage.get({key:'tinct:native-auth-pending'})).value??null),null,'callback is consumed once')
  assert.equal(await page.evaluate(()=>document.documentElement.dataset.eink),'true','account access keeps the e-ink profile')
  const afterAuth=await page.evaluate(()=>Object.fromEntries(Object.entries(localStorage).filter(([key])=>/position|prefs|eink/.test(key))))
  assert.deepEqual(afterAuth,stored,'cancelled authentication retains reading data')
  }catch(error){
   const diagnostic=await page.evaluate(()=>({trace:window.__nativeAuthTrace,body:document.body.innerText.slice(0,800)}))
   console.log(JSON.stringify({nativeAuthFailure:{cold,error:String(error),diagnostic}}))
   acceptanceFailures.push({check:cold?'auth-cold-return':'auth-warm-return',error:String(error)})
   // Clear only the fixture callback before checking independent capabilities.
   await page.evaluate(async()=>{
    await window.Capacitor.Plugins.NativeAuthStorage.remove({key:'tinct:native-auth-pending'})
    sessionStorage.removeItem('tinct:native-auth-return')
   })
  }
 }
 await device.screenshot({path:output+'/native-auth-return.png'})
 stage('native-book-downloads')
 const downloaded=await checkNativeDownloads(device,page,output)
 page=downloaded.page
 stage('native-account-sync')
 try{page=await checkNativeSync(device,page,output)}catch(error){
  acceptanceFailures.push({check:'native-account-sync',error:String(error)})
  console.log(JSON.stringify({nativeAcceptanceFailure:acceptanceFailures.at(-1)}))
  // Sync exercises a real restart: recover the current WebView even on failure.
  page=await(await device.webView({pkg:packageId})).page()
 }
 stage('native-background-audio')
 let background
 try{background=await checkBackgroundAudio(device,page,output)}catch(error){
  acceptanceFailures.push({check:'native-background-audio',error:String(error)})
  console.log(JSON.stringify({nativeAcceptanceFailure:acceptanceFailures.at(-1)}))
 }
 if(acceptanceFailures.length)throw new Error(JSON.stringify(acceptanceFailures))
 await fs.writeFile(output+'/native-results.json',JSON.stringify({device:device.model(),packageId,androidEmulator:true,physicalEink:false,offlineLibrary:true,offlineCovers:true,libraryReadFlow:true,restoredEinkLibrary:true,offlineReading:true,hardwarePageKey:true,pageTurnMs:turnMs,forceClosePersistence:true,authWarmCancellation:true,authColdCancellation:true,realProviderSignIn:false,downloads:downloaded.result,background},null,2))
} catch(error) {
 // These diagnostics run only in the isolated, signed-out emulator. No
 // callback query, authorization header, or session payload is recorded.
 const state=page?await page.evaluate(async()=>{
  let launchCheck
  try {
   const result=await window.Capacitor.Plugins.App.getLaunchUrl()
   const pending=JSON.parse((await window.Capacitor.Plugins.NativeAuthStorage.get({key:'tinct:native-auth-pending'})).value||'null')
   const raw=result?.url||'',prefix=pending?.appId+'://'
   const url=new URL(raw.startsWith(prefix)?'https://'+raw.slice(prefix.length):raw)
   launchCheck={schemeMatches:raw.startsWith(prefix),host:url.hostname,path:url.pathname,
    queryKeys:[...url.searchParams.keys()],fragmentKeys:[...new URLSearchParams(url.hash.slice(1)).keys()],
    flowMatches:url.searchParams.get('flow')===pending?.nonce,unexpired:pending?.expires>Date.now(),
    pendingLifetimeMs:pending?.expires-Date.now()}
  }catch{launchCheck={unavailable:true}}
  return ({
  path:location.pathname,native:window.Capacitor?.isNativePlatform(),
  status:document.querySelector('[data-auth-status]')?.textContent,
  statusHidden:document.querySelector('[data-auth-status]')?.hidden,
  mode:document.querySelector('[data-mode]')?.getAttribute('data-mode'),
  pending:!!(await window.Capacitor.Plugins.NativeAuthStorage.get({key:'tinct:native-auth-pending'})).value,
  deferred:!!sessionStorage.getItem('tinct:native-auth-return'),
  notice:!!localStorage.getItem('tinct:native-auth-notice'),
  body:document.body.innerText.slice(0,1200),
  returnCheck:window.__nativeReturnCheck,launchCheck,nativeAuthTrace:window.__nativeAuthTrace,
  plugins:Object.keys(window.Capacitor?.Plugins||{}),
  resources:performance.getEntriesByType('resource').filter(r=>r.name.includes('/assets/')).map(r=>({file:new URL(r.name).pathname,size:r.transferSize})),
 })}).catch(()=>({unavailable:true})):{noWebview:true}
 console.log(JSON.stringify({nativeFailureState:state}))
 await fs.writeFile(output+'/native-failure-state.json',JSON.stringify(state,null,2))
 await device.screenshot({path:output+'/native-failure.png'}).catch(()=>{})
 await fs.writeFile(output+'/native-failure.txt',String(error)+'\n'+(page?await page.locator('body').innerText().catch(()=> 'unavailable'):'no webview'))
 throw error
} finally {
 await fs.writeFile(output+'/native-stages.json',JSON.stringify(stages,null,2))
 const nativeLog=execFileSync('adb',['logcat','-d','-v','threadtime'],{maxBuffer:32*1024*1024}).toString()
 await fs.writeFile(output+'/native-logcat.txt',nativeLog)
 const signals=nativeLog.split('\n').filter(line=>/Capacitor|AppPlugin|appUrlOpen|Failed to load|TypeError|ReferenceError/.test(line)).slice(-70).map(line=>line.replace(/https?:\/\/[^\s"']+|app\.tinct\.reader(?:\.review)?:\/\/[^\s"']+/g,'[redacted URL]'))
 console.log(JSON.stringify({nativeBridgeSignals:signals}))
 await device.close()
}
