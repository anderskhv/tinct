// Isolated real reader and source data. All chat/account APIs are intercepted.
const {chromium,webkit}=require('playwright'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict')
const origin=process.env.TEST_ORIGIN||'https://tinct.app',dir=process.env.ARTIFACT_DIR||'artifacts/chapter-preview'
fs.mkdirSync(dir,{recursive:true})
const edition=JSON.parse(fs.readFileSync('public/data/editions/bible-kjv-en.json','utf8'))
const configs=[
 {name:'phone-first',width:390,height:844,chapter:1,fontSize:1.3,theme:'light'},
 {name:'phone-large',width:360,height:640,chapter:1134,fontSize:2.2,theme:'dark'},
 {name:'phone-short',width:320,height:640,chapter:595,fontSize:1.8,theme:'book',longTitle:true},
 {name:'desktop-full-tail',width:1440,height:795,chapter:1134,fontSize:1.3,theme:'light'},
 {name:'tablet-large',width:1024,height:768,chapter:595,fontSize:2.2,theme:'dark'},
 {name:'desktop-compare',width:1440,height:950,chapter:1134,fontSize:1.8,theme:'light',compare:true},
 {name:'desktop-final',width:1440,height:950,chapter:1189,fontSize:1.3,theme:'book'}
]
const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms))
async function state(p){return p.evaluate(()=>{
 const root=document.querySelector('.lab'),article=document.querySelector('.lab-page-wrap > .lab-passage')
 const words=[...article.querySelectorAll('[data-testid="lab-word"]')].filter(n=>!n.closest('.lab-book-col-compare'))
 const end=article.querySelector('.lab-chapter-end'),r=article.getBoundingClientRect()
 const bounds=end?.getBoundingClientRect(),last=end?.previousElementSibling?.getBoundingClientRect()
 const footer=document.querySelector('.lab-desktop-page-footers')?.getBoundingClientRect()
 return {chapter:root.dataset.chapter,place:root.dataset.place,keys:words.map(w=>w.dataset.paragraphIndex+':'+w.dataset.wordIndex),
 end:bounds?{left:bounds.left,right:bounds.right,top:bounds.top,bottom:bounds.bottom,previousBottom:last?.bottom,limit:Math.min(r.bottom,footer?.top??r.bottom),sameLeaf:!!end.closest('.lab-book-col')}:null,
 oldEnd:!!article.querySelector('.lab-chapter-end-page'),bundle:[...document.scripts].map(s=>s.src).find(s=>/assets\/index-.*\.js/.test(s))}
})}
;(async()=>{const results=[]
for(const config of configs){
 const browser=await(config.width<900?webkit:chromium).launch()
 const context=await browser.newContext({viewport:{width:config.width,height:config.height},isMobile:config.width<900,hasTouch:config.width<900})
 const p=await context.newPage(),calls=[]
 const source=edition.chapters.find(c=>c.number===config.chapter)
 const highlight={id:'preview-preserve',bookId:'bible',editionKey:'kjv-en',chapterNumber:config.chapter,paragraphIndex:0,fromWord:1,endParagraphIndex:0,toWord:3,color:'blue',note:'Keep this exact note.',text:(source.paragraphs[0].match(/\S+/g)||[]).slice(1,3).join(' ')}
 p.setDefaultTimeout(15000)
 await context.tracing.start({screenshots:true,snapshots:true,sources:true})
 try{
  if(process.env.READER_BUILT==='1')await p.route('**/*',async r=>{
   const u=new URL(r.request().url())
   if(u.origin===origin){
    const name=['/reader','/lab/phone','/lab/desktop'].includes(u.pathname)?'/app.html':u.pathname
    const file=path.resolve('dist','.'+name),root=path.resolve('dist')+'/'
    if(file.startsWith(root)&&fs.existsSync(file)&&fs.statSync(file).isFile())return r.fulfill({path:file})
    return r.abort()
   }
   return r.continue()
  })
  if(config.longTitle)await p.route('**/data/editions*/**',async r=>{
   const file=path.resolve('public','.'+new URL(r.request().url()).pathname)
   if(!file.startsWith(path.resolve('public')+'/')||!fs.existsSync(file))return r.fallback()
   const data=JSON.parse(fs.readFileSync(file,'utf8'))
   const entry=data.chapters?.find(c=>c.number===config.chapter)
   if(entry)entry.title='Psalm 117 — A song of praise for every nation and all the peoples of the earth'
   await r.fulfill({contentType:'application/json',body:JSON.stringify(data)})
  })
  await p.route('**/api/**',r=>r.fulfill({status:404,body:'{}'}))
  await p.route('**/*supabase.co/**',r=>r.abort())
  await p.route('**/api/{chat,lab-chat}',async r=>{
   calls.push(r.request().postDataJSON())
   await r.fulfill({status:200,contentType:'application/json',body:JSON.stringify({content:[{text:'Notice who speaks and how the opening frames the chapter.'}]})})
  })
  await p.addInitScript(({config,highlight})=>{
   if(sessionStorage.getItem('chapter-preview-seeded'))return
   sessionStorage.setItem('chapter-preview-seeded','1')
   localStorage.setItem('tinct-lab-prefs',JSON.stringify({fontFamily:'garamond',fontSize:config.fontSize,theme:config.theme,compareOpen:false}))
   sessionStorage.setItem('tinct:lab-reader-handoff',JSON.stringify({kind:'open-reader',bookId:'bible',primaryEditionKey:'kjv-en',...(config.compare?{compareEditionKey:'web-en'}:{}),savedPlace:{bookId:'bible',chapterNumber:config.chapter,paragraphIndex:0,wordIndex:0,page:0}}))
   localStorage.setItem('tinct-lab-highlights',JSON.stringify([highlight]))
  },{config,highlight})
  await p.goto(origin+'/reader',{waitUntil:'domcontentloaded'})
  await p.waitForFunction(()=>document.querySelector('.lab')?.dataset.readerReady==='true')
  await p.evaluate(()=>document.fonts.ready);await pause(1000)
  if(config.compare){
   await p.getByTestId('lab-super').click()
   await p.getByTestId('lab-super-row-editions').click()
   await p.getByTestId('lab-v2-show-compare').click()
   await p.waitForFunction(()=>document.querySelector('.lab')?.dataset.desktopView==='compare')
   await pause(500)
  }
  const preview=p.locator('.lab-page-wrap > .lab-passage .lab-chapter-preview')
  if(!await preview.isVisible()&&await p.getByTestId('lab-chapter-cover').count()){await p.keyboard.press('ArrowRight');await pause(500)}
  await preview.waitFor({state:'visible'})
  assert.equal(Number(await p.locator('.lab').evaluate(n=>getComputedStyle(n).getPropertyValue('--lab-font-size'))),config.fontSize,'Requested large-font fixture applies')
  if(config.longTitle)assert.match(await p.locator('.lab-page-wrap > .lab-passage .lab-passage-headline').innerText(),/every nation/)
  assert.ok(await p.locator('.lab-page-wrap [data-highlight-id="preview-preserve"]').count(),'Existing highlight is painted')
  const before=await state(p)
  assert.equal(before.chapter,String(config.chapter))
  assert.equal(calls.length,0,'Rendering the opening never calls Chat')
  const bounds=await preview.boundingBox();assert.ok(bounds.height>=44&&bounds.x>=0&&bounds.x+bounds.width<=config.width,'Preview has an unclipped comfortable target')
  await p.screenshot({path:path.join(dir,config.name+'-opening.png')})
  await preview.click()
  await p.getByTestId('lab-ask-turn-assistant').waitFor()
  assert.equal(calls.length,1)
  assert.equal(calls[0].messages.at(-1).content,'Preview this chapter.')
  assert.equal(calls[0].book.chapterNumber,config.chapter)
  assert.equal(calls[0].book.editionKey,'kjv-en')
  assert.match(calls[0].system,new RegExp('"targetChapterNumber":'+config.chapter+'[,}]'))
  assert.ok(!calls[0].system.includes('<next_chapter_source_data>'))
  assert.ok(calls[0].system.includes(source.paragraphs[0].replace(/\s+/g,' ').trim().slice(0,80)),'Preview grounded in actual current text')
  await(config.width<900?p.getByTestId('lab-ask-done'):p.getByTestId('lab-desktop-companion-close')).click()
  await pause(300)
  assert.deepEqual(await state(p),before,'Preview returns to the same logical place and painted words')
  const seen=[],pages=[]
  for(let i=0;i<120;i++){
   const current=await state(p)
   assert.equal(current.chapter,String(config.chapter),'No chapter advance before final actions')
   assert.equal(current.oldEnd,false,'No actions-only end screen')
   assert.ok(current.keys.length,'Every page contains actual prose')
   seen.push(...current.keys);pages.push(current.keys)
   if(current.end){
    assert.ok(current.end.bottom<=current.end.limit+1,JSON.stringify(current.end)+' final actions clear the footer')
    assert.ok(current.end.previousBottom<=current.end.top+1,'Actions follow final prose')
    assert.equal(current.end.sameLeaf,!config.compare,'Actions follow the final prose leaf or paired comparison row')
    break
   }
   await p.keyboard.press('ArrowRight');await pause(250)
  }
  const expected=source.paragraphs.flatMap((text,pi)=>(text.match(/\S+/g)||[]).map((_,wi)=>pi+':'+wi))
  assert.deepEqual(seen,expected,'Exactly once coverage of all source words, unchanged order')
  assert.equal(calls.length,1,'Paging never triggers chapter chat')
  await p.screenshot({path:path.join(dir,config.name+'-ending.png')})
  const endState=await state(p)
  if(pages.length>1){
   await p.keyboard.press('ArrowLeft');await pause(250)
   assert.deepEqual((await state(p)).keys,pages.at(-2),'Back retains the preceding source page')
   await p.keyboard.press('ArrowRight');await pause(250)
   assert.deepEqual((await state(p)).keys,endState.keys,'Forward returns to the same final prose')
  }
  assert.ok(endState.end,'Final chapter actions are present')
  assert.equal(await p.getByRole('heading',{name:'End of chapter',exact:true}).count(),0)
  assert.equal(await p.getByRole('button',{name:'Prep for next',exact:true}).count(),0)
  await p.evaluate(()=>localStorage.removeItem('tinct:lab-ai-actions'))
  await p.locator('.lab-page-wrap').getByRole('button',{name:'Recap this chapter',exact:true}).click()
  await p.waitForFunction(()=>document.querySelectorAll('[data-testid="lab-ask-turn-assistant"]').length===2)
  assert.equal(calls.length,2);assert.equal(calls[1].messages.at(-1).content,'Recap this chapter.')
  assert.equal(calls[1].book.chapterNumber,config.chapter)
  await(config.width<900?p.getByTestId('lab-ask-done'):p.getByTestId('lab-desktop-companion-close')).click();await pause(250)
  assert.deepEqual(await state(p),endState)
  await p.reload({waitUntil:'domcontentloaded'});await p.waitForFunction(()=>document.querySelector('.lab')?.dataset.readerReady==='true');await pause(800)
  assert.equal((await state(p)).place,endState.place,'Reload keeps logical word position')
  assert.equal(calls.length,2,'Reload does not run an action')
  assert.deepEqual(await p.evaluate(()=>JSON.parse(localStorage.getItem('tinct-lab-highlights'))),[highlight],'Source highlight and note survive layout, chat, navigation and reload')
  const next=p.locator('.lab-page-wrap').getByRole('button',{name:'Next chapter',exact:true})
  if(config.chapter===1189)assert.equal(await next.count(),0,'No next action after final chapter')
  else {await next.click();await p.waitForFunction(ch=>document.querySelector('.lab')?.dataset.chapter===String(ch),config.chapter+1);assert.match((await state(p)).place,/0:0$/)}
  results.push({config,pages:pages.length,wordCount:seen.length,calls:calls.length,bundle:endState.bundle})
  await context.tracing.stop()
 }catch(error){await p.screenshot({path:path.join(dir,config.name+'-failure.png')}).catch(()=>{});await context.tracing.stop({path:path.join(dir,config.name+'-trace.zip')}).catch(()=>{});throw error}
 finally{await context.close();await browser.close()}
}
fs.writeFileSync(path.join(dir,'results.json'),JSON.stringify(results,null,2));console.log(JSON.stringify(results,null,2))
})().catch(error=>{console.error(error);process.exitCode=1})
