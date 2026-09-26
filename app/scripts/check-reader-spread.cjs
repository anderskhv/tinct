const {chromium,webkit}=require('playwright'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const origin=process.env.TEST_ORIGIN||'https://tinct.app',built=process.env.READER_BUILT!=='0',out=process.env.ARTIFACT_DIR||'artifacts/reader-spread';
fs.mkdirSync(out,{recursive:true});
const bible=JSON.parse(fs.readFileSync('public/data/editions/bible-web-en.json','utf8'));
const keys=chapter=>chapter.paragraphs.flatMap((s,p)=>(s.match(/\S+/g)||[]).map((_,w)=>p+':'+w));
async function state(p){return p.evaluate(()=>{
 const root=document.querySelector('.lab'),a=document.querySelector('.lab-page-wrap>.lab-passage');
 const words=[...a.querySelectorAll('[data-testid="lab-word"]')].filter(w=>!w.closest('.lab-book-col-compare'));
 const preview=a.querySelector('.lab-next-chapter-opening'),end=a.querySelector('.lab-chapter-end');
 const columns=[...a.querySelectorAll('.lab-book-col')].map(col=>({text:col.innerText,rect:col.getBoundingClientRect().toJSON(),words:[...col.querySelectorAll('[data-testid="lab-word"]')].map(w=>({key:w.dataset.paragraphIndex+':'+w.dataset.wordIndex,text:w.textContent,rect:w.getBoundingClientRect().toJSON()}))}));
 return {chapter:Number(root.dataset.chapter),place:root.dataset.place,keys:words.map(w=>w.dataset.paragraphIndex+':'+w.dataset.wordIndex),preview:preview?{text:preview.innerText,count:preview.querySelectorAll('.lab-hearing-word').length}:null,columns,end:end?{rect:end.getBoundingClientRect().toJSON(),docked:end.classList.contains('is-docked'),previousBottom:end.previousElementSibling?.getBoundingClientRect().bottom}:null,article:a.getBoundingClientRect().toJSON(),bundle:[...document.scripts].map(s=>s.src).find(s=>/assets\/index-.*\.js/.test(s))};
});}
async function ready(p){await p.waitForFunction(()=>document.querySelector('.lab')?.dataset.readerReady==='true');await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(450);}
async function turn(p,key){const before=await p.locator('.lab').evaluate(n=>n.dataset.chapter+':'+n.dataset.place);await p.keyboard.press(key);await p.waitForFunction(before=>{const n=document.querySelector('.lab');return n.dataset.chapter+':'+n.dataset.place!==before;},before);await ready(p);}
(async()=>{
const results=[];let continuations=0,docked=0;
for(const engine of [chromium,webkit].filter(engine=>(process.env.READER_ENGINES||'chromium,webkit').split(',').includes(engine.name()))){
const browser=await engine.launch({args:engine===chromium?['--mute-audio']:[]});
for(const {fontSize,chapter,height} of [
 ...[1.3,1.8,2.2].flatMap(fontSize=>[917,918].map(chapter=>({fontSize,chapter,height:813}))),
 {fontSize:1.3,chapter:595,height:400}
]){
 const name=engine.name()+'-'+chapter+'-'+fontSize,context=await browser.newContext({viewport:{width:1450,height}});
 if(built)await context.route('**/*',r=>{
  const u=new URL(r.request().url());if(u.origin!==origin)return r.abort();
  const f=path.resolve('dist','.'+(u.pathname==='/reader'?'/app.html':u.pathname));
  return f.startsWith(path.resolve('dist')+'/')&&fs.existsSync(f)&&fs.statSync(f).isFile()?r.fulfill({path:f}):r.fulfill({status:404,body:'{}'});
 });
 await context.route('**/api/**',r=>r.fulfill({status:404,body:'{}'}));
 await context.route('**/*supabase.co/**',r=>r.abort());
 const note=JSON.stringify([{id:'spread-note',bookId:'bible',editionKey:'web-en',chapterNumber:chapter,paragraphIndex:0,fromWord:1,endParagraphIndex:0,toWord:3,color:'blue',note:'Preserve exactly: æ — 123.',text:'fixture'}]);
 await context.addInitScript(({chapter,fontSize,note})=>{
  HTMLMediaElement.prototype.play=async()=>{};if(sessionStorage.getItem('spread-seeded'))return;sessionStorage.setItem('spread-seeded','1');
  localStorage.setItem('tinct-lab-prefs',JSON.stringify({fontFamily:'literata',fontSize,theme:'dark',compareOpen:false}));
  localStorage.setItem('tinct-lab-highlights',note);
  sessionStorage.setItem('tinct:lab-reader-handoff',JSON.stringify({kind:'open-reader',bookId:'bible',primaryEditionKey:'web-en',savedPlace:{bookId:'bible',chapterNumber:chapter,paragraphIndex:0,wordIndex:0,page:0}}));
 },{chapter,fontSize,note});
 const p=await context.newPage();p.setDefaultTimeout(30000);const states=[];
 try{
  await p.goto(origin+'/reader');await ready(p);
  const seen=[];let last;
  for(let i=0;i<40;i++){
   const s=await state(p);states.push(s);assert.equal(s.chapter,chapter);seen.push(...s.keys);
   for(const col of s.columns)for(const w of col.words)assert.ok(w.rect.bottom<=col.rect.bottom+2,'Prose clears its leaf: '+JSON.stringify(w));
   if(s.end){
    assert.ok(s.end.previousBottom<=s.end.rect.top+1,'Actions follow prose');
    assert.ok(s.end.rect.bottom<=s.article.bottom-1,'Controls stay in page');
    if(s.end.docked){docked++;if(chapter===595)assert.equal(states.length,1,'The compact Psalm retains its complete text on one leaf');}
    last=s;break;
   }
   await turn(p,'ArrowRight');
  }
  assert.ok(last,'Reached chapter ending');
  assert.deepEqual(seen,keys(bible.chapters.find(c=>c.number===chapter)),'All chapter source words exactly once');
  await p.screenshot({path:path.join(out,name+'-end.png')});
  const expectedNext=bible.chapters.find(c=>c.number===chapter+1),nextKeys=keys(expectedNext);
  await turn(p,'ArrowRight');const after=await state(p);states.push(after);
  if(last.preview){
   continuations++;
   if(last.preview.count<nextKeys.length){
    assert.equal(after.chapter,chapter+1);assert.equal(after.keys[0],nextKeys[last.preview.count],'Continue at first unread word');
    assert.notEqual(after.keys[0],'0:0','No repeated opening');
    await turn(p,'ArrowLeft');const back=await state(p);assert.equal(back.chapter,chapter);assert.deepEqual(back.keys,last.keys);assert.equal(back.preview?.text,last.preview.text);
    await turn(p,'ArrowRight');assert.deepEqual((await state(p)).keys,after.keys,'Forward returns to same unread spread');
   }else assert.equal(after.chapter,chapter+2,'A whole chapter read on right is not repeated');
  }else{assert.equal(after.chapter,chapter+1);assert.equal(after.keys[0],'0:0','Unseen chapter starts at opening');}
  await p.screenshot({path:path.join(out,name+'-continued.png')});
  const saved=(await state(p)).place;
  await p.reload();await ready(p);assert.equal((await state(p)).place,saved,'Reload retains exact semantic location');
  assert.equal(await p.evaluate(()=>localStorage.getItem('tinct-lab-highlights')),note,'Annotation bytes unchanged');
  results.push({name,pages:states.length,preview:!!last.preview,docked:last.end.docked,bundle:last.bundle});
 }catch(e){await p.screenshot({path:path.join(out,name+'-failure.png')});throw e;}
 finally{fs.writeFileSync(path.join(out,name+'.json'),JSON.stringify(states,null,2));await context.close();}
}
// The screenshot's exact long word, in the same reader font and markup.
{
 const context=await browser.newContext({viewport:{width:1450,height:813}});
 if(built)await context.route('**/*',r=>{const u=new URL(r.request().url());if(u.origin!==origin)return r.abort();const f=path.resolve('dist','.'+(u.pathname==='/reader'?'/app.html':u.pathname));return f.startsWith(path.resolve('dist')+'/')&&fs.existsSync(f)&&fs.statSync(f).isFile()?r.fulfill({path:f}):r.fulfill({status:404,body:'{}'});});
 await context.route('**/api/**',r=>r.fulfill({status:404,body:'{}'}));await context.route('**/*supabase.co/**',r=>r.abort());
 await context.addInitScript(()=>{HTMLMediaElement.prototype.play=async()=>{};localStorage.setItem('tinct-lab-prefs',JSON.stringify({fontFamily:'literata',fontSize:1.8,theme:'dark'}));sessionStorage.setItem('tinct:lab-reader-handoff',JSON.stringify({kind:'open-reader',bookId:'to-the-lighthouse',primaryEditionKey:'original-en',savedPlace:{bookId:'to-the-lighthouse',chapterNumber:1,paragraphIndex:3,wordIndex:145,page:0}}));});
 const p=await context.newPage();await p.goto(origin+'/reader');await ready(p);
 await p.screenshot({path:path.join(out,engine.name()+'-lighthouse.png')});
 const evidence=await p.evaluate(()=>{
  const root=document.querySelector('.lab'),paragraph=document.querySelector('.lab-passage .lab-hearing-line');
  const style=getComputedStyle(paragraph);
  const probe=paragraph.cloneNode(false);probe.style.cssText='position:absolute;visibility:hidden;max-width:none;top:0;left:0';
  probe.textContent='that life is difficult; facts ';
  const word=document.createElement('span');word.className='lab-hearing-word';word.textContent='uncompromising;';probe.append(word);
  paragraph.parentNode.append(probe);let width=null;
  const probes=[];
  for(const lang of ['en','en-US','en-us']){
   probe.lang=lang;
   for(const sample of ['uncompromising;','hyphenation','internationalization']){
    word.textContent=sample;let split=null;
    for(let w=80;w<=650;w+=2){
     probe.style.width=w+'px';
     const tops=[];
     for(let i=0;i<sample.length;i++){const range=document.createRange();range.setStart(word.firstChild,i);range.setEnd(word.firstChild,i+1);tops.push(range.getBoundingClientRect().top);}
     if(new Set(tops).size>1){split=w;break;}
    }
    probes.push({lang,sample,split});
    if(lang==='en'&&sample==='uncompromising;')width=split;
   }
  }
  word.textContent='uncompromising;';const text=word.textContent;probe.remove();
  return {lang:root.lang,hyphens:style.hyphens,font:style.fontFamily,splitWidth:width,text,probes,userAgent:navigator.userAgent};

 });
 fs.writeFileSync(path.join(out,engine.name()+'-hyphenation.json'),JSON.stringify(evidence,null,2));console.log(JSON.stringify(evidence));
 assert.equal(evidence.hyphens,'auto');assert.equal(evidence.text,'uncompromising;');
 // Playwright 1.58.2's Linux WPE build predates libhyphen support:
 // WebKit 486de399 / Source/WebCore/platform/text/Hyphenation.cpp is a stub.
 // The macOS job requires native WebKit hyphenation; Linux still verifies
 // the same CSS, exact source text, and the complete page-flow matrix.
 if(engine!==webkit||process.platform==='darwin')assert.ok(evidence.splitWidth,'Dictionary can split uncompromising without inserting text characters: '+JSON.stringify(evidence));
 results.push({name:engine.name()+'-lighthouse',...evidence});await context.close();
}
await browser.close();
}
assert.ok(continuations>0,'Exercise an actual right-leaf chapter opening');
assert.ok(docked>0,'Exercise full final prose with footer controls');
fs.writeFileSync(path.join(out,'results.json'),JSON.stringify({results,continuations,docked},null,2));console.log(JSON.stringify({results,continuations,docked},null,2));
})().catch(e=>{console.error(e);process.exit(1)});
