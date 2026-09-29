// Two isolated devices share only mocked account services. No production writes or model calls.
import {chromium,webkit} from 'playwright'
import fs from 'node:fs'
import path from 'node:path'
import assert from 'node:assert/strict'
const origin='https://tinct.app',out='artifacts/reader-device-sync'
fs.mkdirSync(out,{recursive:true})
const assets=fs.readdirSync('dist/assets').filter(f=>f.endsWith('.js')).map(f=>fs.readFileSync('dist/assets/'+f,'utf8')).join('\n')
const supabaseUrl=assets.match(/https:\/\/[a-z0-9-]+\.supabase\.co/)?.[0]
assert(supabaseUrl,'Built client includes its account endpoint')
const user={id:'11111111-1111-4111-8111-111111111111',email:'fixture@example.invalid',aud:'authenticated',role:'authenticated',app_metadata:{},user_metadata:{}}
const exp=Math.floor(Date.now()/1000)+3600
const token=[{alg:'HS256',typ:'JWT'},{sub:user.id,exp,role:'authenticated'},'fixture'].map(x=>typeof x==='string'?x:Buffer.from(JSON.stringify(x)).toString('base64url')).join('.')
const authKey='sb-'+new URL(supabaseUrl).hostname.split('.')[0]+'-auth-token'
const note=JSON.stringify([{id:'device-sync-note',bookId:'bible',editionKey:'web-en',chapterNumber:923,paragraphIndex:1,fromWord:1,endParagraphIndex:1,toWord:3,color:'blue',note:'Keep æ — 123 exactly.',text:'fixture'}])
const results=[]
for(const engine of [chromium,webkit]){
 const browser=await engine.launch()
 const now=Date.now()
 const local={bookId:'ezra',headerBook:'Ezra',chapterNumber:9,sequentialChapter:412,paragraphIndex:1,wordIndex:0,primaryEditionKey:'web-en',updatedAt:now-100000,deviceId:'desktop',rev:1}
 let position={owner:user.id,books:{ezra:local},finished:{},hidden:{},lastSettledBookId:'ezra',lastSettledAt:local.updatedAt,updatedAt:local.updatedAt,deviceId:'desktop'}
 const oldChat={id:'old-conversation',bookId:'bible',chapterNumber:412,startTimestamp:now-90000,endTimestamp:now-90000,preview:'Earlier desktop conversation',messages:[{id:'old-turn',role:'assistant',content:'Earlier desktop conversation',bookId:'bible',chapterNumber:412,timestamp:now-90000,isComplete:true}]}
 const newChat={id:'phone-conversation',bookId:'bible',chapterNumber:923,startTimestamp:now-500,endTimestamp:now-500,preview:'Newest phone conversation',messages:[{id:'phone-turn',role:'assistant',content:'Newest phone conversation',bookId:'bible',chapterNumber:923,timestamp:now-500,isComplete:true}]}
 let chat={key:'chat-history:bible',value:[oldChat],rev:1}
 const contexts=[]
 const positionWrites=[]
 async function device(phone){
  const context=await browser.newContext({serviceWorkers:'block',viewport:phone?{width:390,height:844}:{width:1450,height:813},hasTouch:phone})
  contexts.push(context)
  await context.route('**/*',async route=>{
   const req=route.request(),u=new URL(req.url())
   if(u.origin===supabaseUrl){
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
   if(u.origin!==origin)return route.abort()
   if(u.pathname==='/api/lab-position'){
    if(req.method()==='PUT'){
     const next=req.postDataJSON()
     positionWrites.push({chapter:next.books[next.lastSettledBookId]?.sequentialChapter,at:next.lastSettledAt})
     const books={...position.books}
     for(const [id,pin] of Object.entries(next.books||{}))if(!books[id]||pin.updatedAt>books[id].updatedAt||pin.updatedAt===books[id].updatedAt&&pin.rev>books[id].rev)books[id]=pin
     position={...(next.lastSettledAt>=position.lastSettledAt?next:position),books}
    }
    return route.fulfill({json:position})
   }
   if(u.pathname.startsWith('/api/'))return route.fulfill({status:404,json:{}})
   if(req.method()!=='GET')return route.abort()
   const file=path.resolve('dist','.'+(u.pathname==='/reader'?'/app.html':u.pathname))
   if(file.startsWith(path.resolve('dist')+'/')&&fs.existsSync(file)&&fs.statSync(file).isFile())return route.fulfill({path:file})
   return route.fulfill({status:404,body:''})
  })
  await context.addInitScript(({authKey,user,token,exp,position,note,phone,oldChat,newChat})=>{
   if(sessionStorage.getItem('device-fixture-seeded'))return
   sessionStorage.setItem('device-fixture-seeded','1')
   localStorage.setItem(authKey,JSON.stringify({access_token:token,refresh_token:'fixture',expires_at:exp,expires_in:3600,token_type:'bearer',user}))
   localStorage.setItem('tinct-lab-position',JSON.stringify(position))
   localStorage.setItem('tinct-lab-prefs',JSON.stringify({theme:'book',fontFamily:'garamond',fontSize:1.3,primaryEdition:'web-en'}))
   localStorage.setItem('tinct-lab-highlights',note)
   localStorage.setItem('tinct:chat-history:bible',JSON.stringify(phone?[oldChat,newChat]:[oldChat]))
   if(phone)sessionStorage.setItem('tinct:lab-reader-handoff',JSON.stringify({kind:'open-reader',bookId:'bible',primaryEditionKey:'web-en',savedPlace:{bookId:'bible',chapterNumber:923,paragraphIndex:1,wordIndex:0,page:0}}))
   HTMLMediaElement.prototype.play=async()=>{}
  },{authKey,user,token,exp,position,note,phone,oldChat,newChat})
  const page=await context.newPage()
  page.setDefaultTimeout(30000)
  await page.goto(origin+'/reader',{waitUntil:'domcontentloaded'})
  await page.waitForFunction(()=>document.querySelector('.lab')?.dataset.readerReady==='true')
  await page.evaluate(()=>document.fonts.ready)
  await page.waitForTimeout(500)
  return page
 }
 try{
  const desktop=await device(false)
  assert.equal(await desktop.getByTestId('lab-root').getAttribute('data-chapter'),'412')
  await desktop.evaluate(()=>window.dispatchEvent(new Event('blur')))
  const phone=await device(true)
  assert.equal(await phone.getByTestId('lab-root').getAttribute('data-chapter'),'923')
  const start=await phone.getByTestId('lab-root').getAttribute('data-place')
  await phone.keyboard.press('ArrowRight')
  await phone.waitForFunction(start=>document.querySelector('.lab')?.dataset.place!==start,start)
  await phone.evaluate(()=>window.dispatchEvent(new Event('pagehide')))
  await phone.waitForFunction(()=>JSON.parse(localStorage.getItem('tinct-lab-position')).lastSettledBookId==='zechariah')
  for(let i=0;i<100&&position.lastSettledBookId!=='zechariah';i++)await phone.waitForTimeout(50)
  assert.equal(position.lastSettledBookId,'zechariah','Phone published its actual reading action')
  assert(chat.value.some(c=>c.messages.some(m=>m.id==='phone-turn')),'Phone chat reached the shared account fixture')
  const expected=position.books.zechariah
  const started=Date.now()
  await desktop.evaluate(()=>window.dispatchEvent(new Event('focus')))
  await desktop.waitForFunction(expected=>{
   const n=document.querySelector('.lab')
   return n?.dataset.readerReady==='true'&&n.dataset.chapter===String(expected.sequentialChapter)&&n.dataset.place===expected.paragraphIndex+':'+expected.wordIndex
  },expected)
  const refreshMs=Date.now()-started
  await desktop.waitForFunction(()=>JSON.parse(localStorage.getItem('tinct:chat-history:bible')||'[]').some(c=>c.messages.some(m=>m.id==='phone-turn')))
  await desktop.getByTestId('lab-super').click()
  await desktop.getByTestId('lab-super-row-chat').click()
  await desktop.getByText('Newest phone conversation',{exact:true}).waitFor()
  await desktop.getByText('Earlier desktop conversation',{exact:true}).waitFor()
  await desktop.screenshot({path:path.join(out,engine.name()+'-desktop-refreshed.png')})
  const settled=position.lastSettledAt
  await desktop.evaluate(()=>window.dispatchEvent(new Event('pagehide')))
  await desktop.waitForTimeout(250)
  assert.equal(position.lastSettledAt,settled,'Hiding the refreshed desktop creates no new reading event')
  for(const page of [desktop,phone])assert.equal(await page.evaluate(()=>localStorage.getItem('tinct-lab-highlights')),note,'Annotations retain exact bytes')
  results.push({engine:engine.name(),phoneChapter:expected.sequentialChapter,word:expected.paragraphIndex+':'+expected.wordIndex,refreshMs,chatMessages:chat.value.flatMap(c=>c.messages).map(m=>m.id),positionWrites})
 }catch(error){
  for(let i=0;i<contexts.length;i++)for(const page of contexts[i].pages()){
   await page.screenshot({path:path.join(out,engine.name()+'-'+i+'-failure.png')}).catch(()=>{})
   const state=await page.evaluate(()=>({chapter:document.querySelector('.lab')?.dataset.chapter,place:document.querySelector('.lab')?.dataset.place,body:document.body.innerText.slice(0,1500)})).catch(()=>({}))
   console.log(JSON.stringify({engine:engine.name(),device:i,state,positionWrites}))
  }
  throw error
 }finally{await browser.close()}
}
fs.writeFileSync(path.join(out,'results.json'),JSON.stringify(results,null,2))
console.log(JSON.stringify(results))
