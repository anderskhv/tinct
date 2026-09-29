import assert from 'node:assert/strict'
import fs from 'node:fs/promises'

/** Installed native storage + the real reader, with isolated account services. */
export async function checkNativeSync(device, page, output) {
 const packageId='app.tinct.reader.review', activity=packageId+'/app.tinct.reader.MainActivity'
 const authKey='sb-yazjyiqsxjystvpkyouk-auth-token'
 const now=Date.now(), exp=Math.floor(now/1000)+3600
 const user={id:'11111111-1111-4111-8111-111111111111',email:'fixture@example.invalid',aud:'authenticated',role:'authenticated',app_metadata:{},user_metadata:{},created_at:'2026-01-01T00:00:00Z',last_sign_in_at:new Date(now).toISOString()}
 const token=[{alg:'HS256',typ:'JWT'},{sub:user.id,exp,role:'authenticated'},'fixture'].map(x=>typeof x==='string'?x:Buffer.from(JSON.stringify(x)).toString('base64url')).join('.')
 const session={access_token:token,refresh_token:'fixture',expires_at:exp,expires_in:3600,token_type:'bearer',user}
 const old={bookId:'ezra',headerBook:'Ezra',chapterNumber:9,sequentialChapter:412,paragraphIndex:1,wordIndex:0,primaryEditionKey:'web-en',updatedAt:now-100000,deviceId:'native-fixture',rev:1}
 const local={owner:user.id,books:{ezra:old},finished:{},hidden:{},lastSettledBookId:'ezra',lastSettledAt:old.updatedAt,updatedAt:old.updatedAt,deviceId:'native-fixture'}
 const newer={bookId:'zechariah',headerBook:'Zechariah',chapterNumber:12,sequentialChapter:923,paragraphIndex:1,wordIndex:0,primaryEditionKey:'web-en',updatedAt:now-1000,deviceId:'phone-fixture',rev:2}
 let position={...local,books:{...local.books,zechariah:newer},lastSettledBookId:'zechariah',lastSettledAt:newer.updatedAt,updatedAt:newer.updatedAt,deviceId:'phone-fixture'}
 const note=JSON.stringify([{id:'native-sync-note',bookId:'bible',editionKey:'web-en',chapterNumber:923,paragraphIndex:1,fromWord:1,endParagraphIndex:1,toWord:3,color:'blue',note:'Keep æ — 123 exactly.',text:'fixture'}])
 const conversation=(id,text,timestamp)=>({id,bookId:'bible',chapterNumber:923,startTimestamp:timestamp,endTimestamp:timestamp,preview:text,messages:[{id:id+'-turn',role:'assistant',content:text,bookId:'bible',chapterNumber:923,timestamp,isComplete:true}]})
 const oldChat=conversation('old','Earlier native conversation',now-90000)
 const newChat=conversation('phone','Newest phone conversation',now-500)
 let chat={key:'chat-history:bible',value:[oldChat,newChat],rev:2}
 let offline=false
 const writes=[]
 const route=async route=>{
  const req=route.request(),u=new URL(req.url())
  if(u.origin==='https://localhost')return route.continue()
  if(offline)return route.abort()
  if(u.hostname.endsWith('.supabase.co')){
   if(u.pathname.startsWith('/auth/'))return route.fulfill({json:user})
   if(u.pathname.endsWith('/rpc/commit_user_data')){
    const body=req.postDataJSON()
    if(body.p_key==='chat-history:bible'){
     if(body.p_expected_rev!==chat.rev)return route.fulfill({json:[{...chat,applied:false,conflict:true}]})
     chat={key:body.p_key,value:body.p_value,rev:chat.rev+1}
     return route.fulfill({json:[{...chat,applied:true,conflict:false}]})
    }
    return route.fulfill({json:[]})
   }
   const rows=u.searchParams.get('key')==='eq.chat-history:bible'?[chat]:[]
   return route.fulfill({json:req.headers().accept?.includes('vnd.pgrst.object')?(rows[0]??null):rows})
  }
  if(['https://tinct.app','https://tinct.ahvelplund.workers.dev'].includes(u.origin)){
   if(u.pathname==='/api/lab-position'){
    if(req.method()==='PUT'){
     const next=req.postDataJSON();writes.push({chapter:next.books[next.lastSettledBookId]?.sequentialChapter,at:next.lastSettledAt})
     const books={...position.books}
     for(const [id,pin] of Object.entries(next.books||{}))if(!books[id]||pin.updatedAt>books[id].updatedAt||pin.updatedAt===books[id].updatedAt&&pin.rev>books[id].rev)books[id]=pin
     position={...(next.lastSettledAt>=position.lastSettledAt?next:position),books}
    }
    return route.fulfill({json:position})
   }
   return route.fulfill({status:404,json:{}})
  }
  return route.abort()
 }
 const diagnostics=[]
 async function record(label){
  const value=await page.evaluate(()=>({
   clock:Date.now(),root:{...document.querySelector('.lab')?.dataset},
   position:JSON.parse(localStorage.getItem('tinct-lab-position')||'null'),
   dirty:localStorage.getItem('tinct-lab-position-dirty'),
   online:navigator.onLine,visibility:document.visibilityState
  }))
  diagnostics.push({label,hostClock:Date.now(),...value,writes:[...writes]})
  console.log(JSON.stringify({nativeSyncCheckpoint:diagnostics.at(-1)}))
 }
 const previous=await page.evaluate(async authKey=>({local:{...localStorage},auth:await window.Capacitor.Plugins.NativeAuthStorage.get({key:authKey})}),authKey)
 async function attach(target){await target.route('**/*',route)}
 async function ready(){await page.waitForFunction(()=>document.querySelector('.lab')?.dataset.readerReady==='true',null,{timeout:60000});await page.evaluate(()=>document.fonts.ready)}
 try{
  await attach(page)
  await page.evaluate(async({authKey,session,local,note,oldChat})=>{
   await window.Capacitor.Plugins.NativeAuthStorage.set({key:authKey,value:JSON.stringify(session)})
   sessionStorage.removeItem('tinct:lab-reader-handoff')
   localStorage.setItem('tinct-lab-position',JSON.stringify(local))
   localStorage.setItem('tinct-lab-highlights',note)
   localStorage.setItem('tinct:chat-history:bible',JSON.stringify([oldChat]))
   localStorage.setItem('tinct:lab-device-user',session.user.id)
  },{authKey,session,local,note,oldChat})
  await page.goto('https://localhost/lab/sign-in/index.html?callback=oauth&returnTo=%2Freader')
  await ready()
  await page.waitForFunction(()=>document.querySelector('.lab')?.dataset.chapter==='923',null,{timeout:30000})
  await page.waitForFunction(()=>JSON.parse(localStorage.getItem('tinct:chat-history:bible')||'[]').some(c=>c.messages.some(m=>m.id==='phone-turn')),null,{timeout:30000})
  assert(!writes.some(w=>w.chapter===412),'stale native startup must not republish Ezra over the newer phone position')
  assert.equal(await page.evaluate(()=>localStorage.getItem('tinct-lab-highlights')),note)
  await device.screenshot({path:output+'/native-synced-reader.png'})
  // Foreground refresh must use source anchors, independent of page geometry.
  await page.evaluate(()=>window.dispatchEvent(new Event('blur')))
  const refreshed={...newer,paragraphIndex:3,wordIndex:2,updatedAt:Date.now()+100,rev:3}
  position={...position,books:{...position.books,zechariah:refreshed},lastSettledAt:refreshed.updatedAt,updatedAt:refreshed.updatedAt}
  await page.evaluate(()=>window.dispatchEvent(new Event('focus')))
  await page.waitForFunction(p=>document.querySelector('.lab')?.dataset.place===p.paragraphIndex+':'+p.wordIndex,refreshed,{timeout:30000})
  await record('after-foreground-refresh')
  // A disconnected native page turn remains local and uploads after reconnect.
  if(await page.getByTestId('lab-chapter-cover').isVisible())await page.keyboard.press('ArrowRight')
  await record('before-offline-navigation')
  offline=true
  const before=await page.getByTestId('lab-root').getAttribute('data-place')
  await device.shell('input keyevent 93')
  await page.waitForFunction(p=>document.querySelector('.lab')?.dataset.place!==p,before)
  await page.evaluate(()=>window.dispatchEvent(new Event('pagehide')))
  await page.waitForTimeout(1000)
  const offlinePosition=await page.evaluate(()=>JSON.parse(localStorage.getItem('tinct-lab-position')))
  await record('after-offline-navigation')
  const expected=offlinePosition.books.zechariah
  assert(expected.updatedAt>refreshed.updatedAt,'offline navigation has its own reading timestamp')
  offline=false
  await page.evaluate(()=>{window.dispatchEvent(new Event('online'));window.dispatchEvent(new Event('focus'))})
  for(let i=0;i<100&&position.books.zechariah.updatedAt<expected.updatedAt;i++)await page.waitForTimeout(100)
  assert.equal(position.books.zechariah.updatedAt,expected.updatedAt,'reconnect uploads the offline reading action')
  assert.equal(position.books.zechariah.paragraphIndex,expected.paragraphIndex)
  assert.equal(position.books.zechariah.wordIndex,expected.wordIndex)
  assert.equal(await page.evaluate(()=>localStorage.getItem('tinct-lab-highlights')),note)
  // The session must survive actual activity destruction in native secure storage.
  await device.shell('am force-stop '+packageId)
  await device.shell('am start -n '+activity)
  page=await(await device.webView({pkg:packageId})).page()
  await attach(page)
  await page.locator('#hero-book').waitFor({timeout:60000})
  const persisted=await page.evaluate(async authKey=>{
   const stored=await window.Capacitor.Plugins.NativeAuthStorage.get({key:authKey})
   return {hasSession:!!stored.value,localCopy:localStorage.getItem(authKey),notes:localStorage.getItem('tinct-lab-highlights')}
  },authKey)
  assert.equal(persisted.hasSession,true)
  assert.equal(persisted.localCopy,null,'native session is not duplicated in WebView local storage')
  assert.equal(persisted.notes,note)
  const result={nativeStartupRefresh:true,foregroundSourceAnchorRefresh:true,chatMerge:true,offlinePositionUpload:true,nativeSessionSurvivesRestart:true,annotationBytesPreserved:true,mockedAccountServices:true,writes}
  await fs.writeFile(output+'/native-sync.json',JSON.stringify(result,null,2))
  console.log(JSON.stringify({nativeSync:result}))
  return page
 }catch(error){
  await record('failure').catch(()=>{})
  await fs.writeFile(output+'/native-sync-diagnostics.json',JSON.stringify(diagnostics,null,2))
  throw error
 }finally{
  await page.evaluate(async({authKey,previous})=>{
   localStorage.clear()
   for(const [key,value] of Object.entries(previous.local))localStorage.setItem(key,value)
   if(previous.auth.value)await window.Capacitor.Plugins.NativeAuthStorage.set({key:authKey,value:previous.auth.value})
   else await window.Capacitor.Plugins.NativeAuthStorage.remove({key:authKey})
   sessionStorage.removeItem('tinct:lab-reader-handoff')
  },{authKey,previous}).catch(()=>{})
  // Unmount the fixture's signed-in reader before releasing interception.
  await page.goto('https://localhost/lab/sign-in/index.html').catch(()=>{})
  await page.waitForFunction(()=>document.querySelector('#tinct-lab-sign-in')?.dataset.ready==='true',null,{timeout:10000}).catch(()=>{})
  await page.unroute('**/*',route).catch(()=>{})
 }
}
