// Silent, isolated built/live acceptance. No synthesis, microphone or account writes.
const {chromium,webkit}=require('playwright'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto')
const book=process.env.TEST_BOOK,live=process.env.READER_LIVE==='1',origin='https://tinct.app',out=process.env.ARTIFACT_DIR||'artifacts/book-publication'
assert(['to-the-lighthouse','symposium'].includes(book));fs.mkdirSync(out,{recursive:true})
const hash=b=>crypto.createHash('sha256').update(b).digest('hex')
const source=ed=>JSON.parse(fs.readFileSync('public/data/editions/'+book+'-'+ed+'.json','utf8'))
const results={book,live,assets:[],cases:[]}
const clean=s=>s.replace(/_/g,'').replace(/\s+/g,' ').trim()
async function boot(browser,phone,ed,fixture={}){
 const context=await browser.newContext({viewport:phone?{width:390,height:844}:{width:1440,height:950},hasTouch:phone,serviceWorkers:'block'})
 const page=await context.newPage(),calls=[],errors=[],legacy=[]
 page.setDefaultTimeout(15000);page.on('pageerror',e=>errors.push(e.message))
 await page.route('**/*',async route=>{
  const req=route.request(),url=new URL(req.url())
  if(url.pathname==='/api/narration/voices'){
   if(live)return route.continue()
   return route.fulfill({json:{enabled:true,provider:'grok',model:'grok-tts',voices:[{key:'f',label:'Ara',persona:'female'},{key:'m',label:'Helios',persona:'male'}]}})
  }
  if(url.pathname==='/api/narration/ensure'){calls.push(req.postDataJSON());return route.fulfill({status:401,json:{error:'unauthenticated'}})}
  if(/\/api\/audio-(manifest|file)/.test(url.pathname)){legacy.push(url.pathname+url.search);return route.fulfill({status:404,body:'{}'})}
  if(url.pathname.startsWith('/api/'))return route.fulfill({status:404,body:'{}'})
  if(req.method()!=='GET')return route.abort()
  if(!live&&url.origin===origin){
   const name=['/reader','/lab/phone'].includes(url.pathname)?'/app.html':url.pathname,file=path.resolve('dist','.'+name)
   if(file.startsWith(path.resolve('dist')+'/')&&fs.existsSync(file)&&fs.statSync(file).isFile())return route.fulfill({path:file})
   return route.abort()
  }
  return route.continue()
 })
 await page.addInitScript(({book,ed,fixture})=>{
  localStorage.setItem('tinct:wipe-v1-done','1')
  localStorage.setItem('tinct-lab-prefs',JSON.stringify({primaryEdition:ed,compareEdition:ed==='modern-en'?'original-en':'modern-en',compareOpen:true,voicePersona:'female'}))
  if(fixture.position){
   if(!localStorage.getItem('tinct-lab-position'))localStorage.setItem('tinct-lab-position',JSON.stringify(fixture.position))
   if(!localStorage.getItem('tinct-lab-highlights'))localStorage.setItem('tinct-lab-highlights',JSON.stringify(fixture.highlights))
  }else sessionStorage.setItem('tinct:lab-reader-handoff',JSON.stringify({kind:'open-reader',bookId:book,primaryEditionKey:ed,compareEditionKey:ed==='modern-en'?'original-en':'modern-en',savedPlace:{bookId:book,chapterNumber:fixture.chapter||1,paragraphIndex:0,wordIndex:0,page:0}}))
  HTMLMediaElement.prototype.play=async function(){this.muted=true}
  if(navigator.mediaDevices)Object.defineProperty(navigator.mediaDevices,'getUserMedia',{configurable:true,value:async()=>{throw Error('Microphone disabled')}})
 },{book,ed,fixture})
 await page.goto(origin+(phone?'/lab/phone?chrome=v2':'/reader?chrome=v2'),{waitUntil:'domcontentloaded'})
 await page.waitForFunction(()=>document.querySelector('[data-testid="lab-root"]')?.dataset.readerReady==='true',null,{timeout:60000})
 await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(700)
 const bundle=await page.locator('script[src]').evaluateAll(ns=>ns.map(n=>new URL(n.src).pathname).find(x=>/\/assets\/index-.*\.js$/.test(x)))
 if(process.env.TINCT_EXPECTED_BUNDLE)assert.equal(bundle,process.env.TINCT_EXPECTED_BUNDLE)
 return {context,page,calls,errors,legacy,bundle}
}
async function toggleCompare(page,phone){
 if(!phone){
  await page.getByTestId('lab-super').click()
  await page.getByTestId('lab-super-row-editions').click()
  return page.getByTestId('lab-v2-show-compare').click()
 }
 await page.getByTestId('lab-book').evaluate(el=>{
  el.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true,pointerId:71,pointerType:'touch',clientX:190,clientY:400}))
  el.dispatchEvent(new PointerEvent('pointerup',{bubbles:true,pointerId:71,pointerType:'touch',clientX:190,clientY:270}))
 })
}
async function main(){
 if(live){
  const files=[...['original-en','modern-en'].map(ed=>'data/editions/'+book+'-'+ed+'.json'),'data/characters/'+book+'.v1.json','data/onboarding/'+book+'.json','data/editions/'+book+'-threads.json']
  for(const ed of ['original-en','modern-en']){
   const dir='data/editions-chapters/'+book+'-'+ed
   files.push(...fs.readdirSync('public/'+dir).map(f=>dir+'/'+f))
  }
  if(book==='symposium')files.push('data/edition-migrations/symposium.positions.json','data/edition-migrations/symposium.highlights.json','data/editions/symposium-modern-da.json')
  for(const file of files){
   const expected=fs.readFileSync('public/'+file),response=await fetch(origin+'/'+file+'?release='+hash(expected))
   assert.equal(response.status,200,file);const bytes=Buffer.from(await response.arrayBuffer())
   assert.equal(hash(bytes),hash(expected),file)
   results.assets.push({path:'/'+file,sha256:hash(bytes),bytes:bytes.length})
  }

  // Public book pages are branded by the Worker. Verify the exact served
  // bytes against that real route, not the untransformed source HTML.
  const compiled=require('esbuild').buildSync({entryPoints:['src/worker/routes/seo.ts'],bundle:true,platform:'node',format:'cjs',write:false}).outputFiles[0].text
  const workerModule={exports:{}}
  new Function('module','exports','require',compiled)(workerModule,workerModule.exports,require)
  const rawPage=fs.readFileSync('public/read/'+book+'/book.html')
  const canonical=origin+'/read/'+book
  const expectedPage=await workerModule.exports.handleSeoAndStaticRequest(new Request(canonical),{ASSETS:{fetch:async req=>{
   assert.equal(new URL(req.url).pathname,'/read/'+book+'/book')
   return new Response(rawPage,{headers:{'Content-Type':'text/html; charset=utf-8'}})
  }}},{waitUntil:()=>{}})
  const expectedBytes=Buffer.from(await expectedPage.arrayBuffer()),pageResponse=await fetch(canonical)
  assert.equal(pageResponse.status,200)
  const livePage=Buffer.from(await pageResponse.arrayBuffer())
  assert.equal(hash(livePage),hash(expectedBytes),'Canonical book page must match the Worker-branded accepted source')
  results.assets.push({path:'/read/'+book,sourceSha256:hash(rawPage),sha256:hash(livePage),bytes:livePage.length,transformation:'handleSeoAndStaticRequest'})

  const info=await(await fetch(origin+'/api/narration/voices')).json()
  assert.equal(info.provider,'grok');assert.equal(info.enabled,true);results.provider=info.provider
 }
 for(const [device,engine,phone] of [['phone',webkit,true],['desktop',chromium,false]]){
  const browser=await engine.launch({headless:true,...(!phone?{args:['--mute-audio']}:{})})
  try{
   for(const ed of ['modern-en','original-en']){
    const state=await boot(browser,phone,ed),{page,calls,errors,legacy}=state,root=page.getByTestId('lab-root')
    assert.equal(await root.getAttribute('data-chapter'),'1')
    const first=page.locator('.lab-page-wrap [data-paragraph-index="0"][data-word-index="0"]').first()
    await first.waitFor({state:'visible'});assert.equal(clean(await first.innerText()),clean(source(ed).chapters[0].paragraphs[0].split(/\s+/)[0]))
    assert.equal(calls.length,0,'reading alone must not synthesize')
    await page.screenshot({path:out+'/'+device+'-'+ed+'-opening.png'})
    const place=await root.getAttribute('data-place')
    console.log(JSON.stringify({device,ed,stage:'opening',place,buttons:await page.locator('button:visible').allTextContents()}))
    await toggleCompare(page,phone)
    await page.waitForFunction(()=>document.querySelector('[data-testid="lab-root"]')?.dataset.compareActive==='true')
    await page.waitForTimeout(300)
    await page.screenshot({path:out+'/'+device+'-'+ed+'-compare.png'})
    await toggleCompare(page,phone)
    await page.waitForFunction(()=>document.querySelector('[data-testid="lab-root"]')?.dataset.compareActive==='false')
    assert.equal(await root.getAttribute('data-place'),place,'Compare must retain primary place')
    await page.locator('[data-testid="lab-v2-play"]:visible,[data-testid="lab-listen"]:visible,[data-testid="lab-desktop-play"]:visible').first().click()
    await page.waitForTimeout(1500)
    assert(calls.length>0,'Play must use streaming narration')
    const request=calls[0];assert.equal(request.bookId,book);assert.equal(request.editionKey,ed);assert.equal(request.chapter,1)
    assert(request.paragraphs.some(p=>p.index===0&&/^[a-f0-9]{64}$/.test(p.textHash)),'Streaming must carry opening text identity')
    assert.equal(legacy.filter(url=>url.startsWith('/api/audio-file')).length,0,'Must not load obsolete recordings')
    assert.deepEqual(errors,[])
    results.cases.push({device,edition:ed,opening:true,compare:true,streamingRequest:request,legacyManifestProbes:legacy,bundle:state.bundle})
    await state.context.close()
   }
   if(book==='symposium'){
    for(const ed of ['original-en','modern-en']){
     const map=JSON.parse(fs.readFileSync('public/data/edition-migrations/symposium.positions.json','utf8'))
     const old=map.editions[ed].entries['7.69'],text=clean(old.oldText).split(' ').slice(0,4).join(' ')
     const place={bookId:book,headerBook:'Symposium',chapterNumber:7,sequentialChapter:7,paragraphIndex:69,wordIndex:0,pageIndex:8,primaryEditionKey:ed,updatedAt:1700000000000,deviceId:'acceptance',rev:1}
     const position={books:{[book]:place},recentChapters:{'symposium:7':place},owner:null,finished:{},hidden:{},lastSettledBookId:book,lastSettledAt:1700000000000,updatedAt:1700000000000,deviceId:'acceptance'}
     const highlights=[{id:'hl-1700000000000-migration',bookId:book,editionKey:ed,chapterNumber:7,paragraphIndex:69,endParagraphIndex:69,fromWord:0,toWord:4,text,note:'Keep this personal note',color:'sage',kept:true}]
     const state=await boot(browser,phone,ed,{position,highlights}),{page}=state
     await page.waitForFunction(()=>document.querySelector('[data-testid="lab-root"]')?.dataset.chapter==='8')
     await page.waitForFunction(()=>JSON.parse(localStorage.getItem('tinct-lab-highlights')||'[]')[0]?.contentMigrationStatus==='exact')
     const saved=await page.evaluate(()=>({position:JSON.parse(localStorage.getItem('tinct-lab-position')),marks:JSON.parse(localStorage.getItem('tinct-lab-highlights'))}))
     assert.equal(saved.marks[0].chapterNumber,8);assert.equal(saved.marks[0].paragraphIndex,0);assert.equal(saved.marks[0].note,highlights[0].note);assert.equal(saved.marks[0].text,text)
     assert.equal(saved.position.books.symposium.sequentialChapter,8);assert.equal(saved.position.books.symposium.contentRecovery.chapterNumber,7)
     await page.reload();await page.waitForFunction(()=>document.querySelector('[data-testid="lab-root"]')?.dataset.readerReady==='true')
     assert.equal(await page.getByTestId('lab-root').getAttribute('data-chapter'),'8')
     await page.screenshot({path:out+'/'+device+'-'+ed+'-migrated.png'})
     results.cases.push({device,edition:ed,migration:saved,roundTrip:true});await state.context.close()
    }
   }
  }finally{await browser.close()}
 }
 fs.writeFileSync(out+'/publication-results.json',JSON.stringify(results,null,2));console.log(JSON.stringify(results,null,2))
}
main().catch(e=>{fs.writeFileSync(out+'/publication-failure.json',JSON.stringify({error:String(e),results},null,2));console.error(e);process.exitCode=1})
