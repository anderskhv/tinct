const {chromium,webkit}=require('playwright'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const origin='https://tinct.app',built=process.env.READER_BUILT!=='0',out='artifacts/audio-spread';
fs.mkdirSync(out,{recursive:true});
const bible=JSON.parse(fs.readFileSync('public/data/editions/bible-web-en.json','utf8'));
const chapter=n=>bible.chapters.find(c=>c.number===n);
async function ready(p){await p.waitForFunction(()=>document.querySelector('.lab')?.dataset.readerReady==='true');await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(400);}
async function geometry(p){return p.evaluate(()=>[...document.querySelectorAll('.lab-page-wrap > .lab-passage .lab-hearing-word[data-word-index]')].map(w=>{const r=w.getBoundingClientRect();return {text:w.textContent,p:w.dataset.paragraphIndex,w:w.dataset.wordIndex,x:Math.round(r.x),y:Math.round(r.y),width:Math.round(r.width),height:Math.round(r.height)}}));}
(async()=>{
const results=[];
for(const engine of [chromium,webkit].filter(e=>(process.env.READER_ENGINES||'chromium,webkit').split(',').includes(e.name()))){
 const browser=await engine.launch({args:engine===chromium?['--mute-audio']:[]});
 const context=await browser.newContext({viewport:{width:1450,height:813},serviceWorkers:'block'});
 const calls=[];
 await context.route('**/*',async r=>{
  const u=new URL(r.request().url());
  if(u.origin!==origin)return r.abort();
  if(u.pathname==='/api/narration/voices')return r.fulfill({json:{enabled:true,provider:'grok',voices:[{key:'ara',label:'Ara',persona:'female'}]}});
  if(u.pathname==='/api/narration/ensure'){
   const b=r.request().postDataJSON();calls.push(b);
   return r.fulfill({json:{paragraphs:b.paragraphs.map(item=>{
    const text=chapter(b.chapter).paragraphs[item.index].replace(/\s+/g,' ').trim(),tokens=text.split(' '),duration=tokens.length/2;
    const words=tokens.map((text,i)=>({text,start:i/2,end:(i+1)/2}));
    return {paragraph:item.index,status:'ready',textHash:crypto.createHash('sha256').update(text).digest('hex'),chunkCount:1,readyChunks:1,duration,words,timingsUsable:true,chunks:[{index:0,wordFrom:0,wordTo:tokens.length,ready:true,hash:b.chapter+'-'+item.index,url:origin+'/api/audio-file?fixture='+b.chapter+'-'+item.index,duration,words,timingsUsable:true}]};
   })}});
  }
  if(u.pathname==='/api/lab-chat'){
   const b=r.request().postDataJSON();
   assert(b.messages.some(m=>m.content.includes('<word>Jehohanan</word>')),'Lookup uses selected name');
   return r.fulfill({json:{content:[{type:'text',text:JSON.stringify({kind:'person',name:'Jehohanan',importance:'minor',subtitle:'Test role at this passage',body:'Mocked contextual card for browser acceptance.'})}]}});
  }
  if(u.pathname.startsWith('/api/'))return r.fulfill({status:404,body:'{}'});
  if(!built)return r.continue();
  const f=path.resolve('dist','.'+(u.pathname==='/reader'?'/app.html':u.pathname));
  return f.startsWith(path.resolve('dist')+'/')&&fs.existsSync(f)&&fs.statSync(f).isFile()?r.fulfill({path:f}):r.fulfill({status:404,body:'{}'});
 });
 await context.addInitScript(()=>{
  class SilentAudio extends EventTarget {
   constructor(){super();this.src='';this.currentTime=0;this.duration=100;this.paused=true;this.ended=false;this.playbackRate=1;this.preload='auto';window.__audio=this;}
   play(){this.paused=false;this.ended=false;this.dispatchEvent(new Event('playing'));return Promise.resolve();}
   pause(){this.paused=true;}
   load(){}
   removeAttribute(){this.src='';}
  }
  window.Audio=SilentAudio;
  HTMLMediaElement.prototype.play=async()=>{};
  localStorage.setItem('tinct-lab-prefs',JSON.stringify({primaryEdition:'web-en',fontFamily:'literata',fontSize:1.8,theme:'dark'}));
  sessionStorage.setItem('tinct:lab-reader-handoff',JSON.stringify({kind:'open-reader',bookId:'bible',primaryEditionKey:'web-en',savedPlace:{bookId:'bible',chapterNumber:location.search.includes('character-test')?413:410,paragraphIndex:0,wordIndex:0,page:0}}));
 });
 const p=await context.newPage();p.setDefaultTimeout(30000);const errors=[];p.on('pageerror',e=>errors.push(e.message));
 try{
  // Chapter length may end on either leaf at a given viewport. Select an
  // actual mixed spread, without assuming a fixed page count.
  for(const height of [813,879,940,740]){
   await p.setViewportSize({width:1450,height});
   await p.goto(origin+'/reader');await ready(p);
   for(let i=0;i<30 && !await p.getByTestId('lab-next-chapter-opening').count();i++){
    if(await p.locator('.lab-chapter-end').count())break;
    await p.keyboard.press('ArrowRight');await ready(p);
   }
   if(await p.getByTestId('lab-next-chapter-opening').count())break;
  }
  assert.equal(await p.locator('.lab').getAttribute('data-chapter'),'410');
  await p.getByTestId('lab-next-chapter-opening').waitFor();
  const before=await geometry(p);
  await p.getByTestId('lab-v2-play').click();
  await p.waitForFunction(()=>window.__audio&&!window.__audio.paused);
  await p.waitForTimeout(400);
  assert.deepEqual(await geometry(p),before,'Play keeps the existing two leaves');
  await p.screenshot({path:path.join(out,engine.name()+'-before.png')});
  for(let i=0;i<30 && await p.locator('.lab').getAttribute('data-chapter')==='410';i++){
   await p.evaluate(()=>{const a=window.__audio;a.currentTime=a.duration;a.ended=true;a.dispatchEvent(new Event('ended'));});
   await p.waitForTimeout(400);
  }
  await p.waitForFunction(()=>document.querySelector('.lab').dataset.chapter==='411');await ready(p);
  assert.deepEqual(await geometry(p),before,'Ezra 8 stays on the same right leaf after audio handoff');
  await p.screenshot({path:path.join(out,engine.name()+'-after.png')});
  await p.getByTestId('lab-v2-play').click();
  const openingKeys=before.filter(w=>w.x>725).map(w=>w.p+':'+w.w);
  await p.keyboard.press('ArrowRight');await ready(p);
  const after=await geometry(p);
  assert(!openingKeys.includes(after[0].p+':'+after[0].w),'Next spread starts beyond the heard opening');
  await p.keyboard.press('ArrowLeft');await ready(p);
  assert.deepEqual(await geometry(p),before,'Back returns to the same mixed spread');
  await p.goto(origin+'/reader?character-test=1');await ready(p);
  const name=p.locator('.lab-page-wrap > .lab-passage [data-testid="lab-word"]').filter({hasText:/^Jehohanan[,.;]?$/}).first();
  for(let i=0;i<20 && !await name.count();i++){await p.keyboard.press('ArrowRight');await ready(p);}
  assert.equal(await p.locator('.lab').getAttribute('data-chapter'),'413');
  await name.click();
  await p.getByTestId('popup-contextual-character').waitFor();
  assert.equal(await p.getByText('Minor character',{exact:true}).count(),1);
  await p.screenshot({path:path.join(out,engine.name()+'-character.png')});
  assert.deepEqual(errors,[]);
  results.push({engine:engine.name(),passed:true,calls:calls.length});
 }catch(e){await p.screenshot({path:path.join(out,engine.name()+'-failure.png')});throw e;}
 finally{await context.close();await browser.close();}
}
fs.writeFileSync(path.join(out,'results.json'),JSON.stringify(results,null,2));console.log(results);
})().catch(e=>{console.error(e);process.exit(1)});
