const {chromium,webkit}=require('playwright'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const origin='https://tinct.app',baseline=process.env.OPENING_BASELINE==='1',built=process.env.READER_BUILT!=='0';
const out=process.env.ARTIFACT_DIR||'artifacts/opening-highlights';fs.mkdirSync(out,{recursive:true});
async function ready(p){await p.waitForFunction(()=>document.querySelector('.lab')?.dataset.readerReady==='true');await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(500);}
(async()=>{const results=[];
for(const engine of [chromium,webkit].filter(e=>(process.env.READER_ENGINES||'chromium,webkit').split(',').includes(e.name()))){
 const browser=await engine.launch({args:engine===chromium?['--mute-audio']:[]});
 const context=await browser.newContext({viewport:{width:1450,height:813},serviceWorkers:'block'});
 if(built)await context.route('**/*',r=>{const u=new URL(r.request().url());if(u.origin!==origin)return r.abort();const f=path.resolve('dist','.'+(u.pathname==='/reader'?'/app.html':u.pathname));return f.startsWith(path.resolve('dist')+'/')&&fs.existsSync(f)&&fs.statSync(f).isFile()?r.fulfill({path:f}):r.fulfill({status:404,body:'{}'});});
 await context.route('**/api/**',r=>r.fulfill({status:404,body:'{}'}));await context.route('**/*supabase.co/**',r=>r.abort());
 const older={id:'preserve',bookId:'bible',editionKey:'web-en',chapterNumber:916,paragraphIndex:0,endParagraphIndex:0,fromWord:1,toWord:3,color:'gold',note:'Keep exactly æ — 123.'};
 await context.addInitScript(older=>{
  HTMLMediaElement.prototype.play=async()=>{};
  if(sessionStorage.getItem('opening-seeded'))return;sessionStorage.setItem('opening-seeded','1');
  localStorage.setItem('tinct-lab-prefs',JSON.stringify({fontFamily:'literata',fontSize:1.8,theme:'dark',compareOpen:false}));
  localStorage.setItem('tinct-lab-highlights',JSON.stringify([older]));
  sessionStorage.setItem('tinct:lab-reader-handoff',JSON.stringify({kind:'open-reader',bookId:'bible',primaryEditionKey:'web-en',savedPlace:{bookId:'bible',chapterNumber:917,paragraphIndex:0,wordIndex:0,page:0}}));
 },older);
 const p=await context.newPage();p.setDefaultTimeout(25000);
 try{
  await p.goto(origin+'/reader');await ready(p);
  for(let i=0;i<15&&!await p.locator('.lab-next-chapter-opening').count();i++){await p.keyboard.press('ArrowRight');await ready(p);}
  const opening=p.locator('.lab-next-chapter-opening');await opening.waitFor();
  assert.equal(await p.locator('.lab').getAttribute('data-chapter'),'917');
  if(baseline){
   assert.equal(await opening.locator('[data-testid="lab-opening-word"],[data-testid="lab-word"]').count(),0,'Reproduce display-only opening on deployed baseline');
   await p.screenshot({path:path.join(out,engine.name()+'-baseline.png')});
   results.push({engine:engine.name(),baseline:'display-only opening reproduced'});continue;
  }
  const words=opening.locator('[data-testid="lab-opening-word"]');
  assert.ok(await words.count()>8);
  const start=await words.nth(1).boundingBox(),end=await words.nth(6).boundingBox();
  await p.mouse.move(start.x+start.width/2,start.y+start.height/2);await p.mouse.down();
  await p.mouse.move(end.x+end.width/2,end.y+end.height/2,{steps:12});await p.mouse.up();
  const popup=p.locator('.selection-popup');await popup.waitFor();
  const direct=p.getByRole('button',{name:'Highlight Sage',exact:true});
  if(!await direct.count()){
   const highlight=p.getByRole('button',{name:'Highlight',exact:true});
   if(await highlight.count())await highlight.click();else await p.getByRole('button',{name:'Highlight this passage',exact:true}).click();
  }
  await direct.click();
  await p.waitForFunction(()=>JSON.parse(localStorage.getItem('tinct-lab-highlights')||'[]').some(h=>h.chapterNumber===918));
  const saved=await p.evaluate(()=>JSON.parse(localStorage.getItem('tinct-lab-highlights')));
  assert.equal(saved.length,2);assert.deepEqual(saved.find(h=>h.id==='preserve'),older);
  const mark=saved.find(h=>h.id!=='preserve');
  assert.equal(mark.chapterNumber,918);assert.equal(mark.editionKey,'web-en');assert.equal(mark.color,'sage');
  assert.equal(mark.fromWord,1);assert.equal(mark.toWord,7);
  assert.equal(await p.locator('.lab').getAttribute('data-chapter'),'917','Selecting the right leaf must not navigate');
  assert.equal(await p.locator('.lab-book-col:first-child [data-testid="lab-word"].is-hl-sage').count(),0,'No wrong-chapter paint');
  assert.equal(await opening.locator('.is-hl-sage[data-testid="lab-opening-word"]').count(),6);
  assert.ok(await opening.locator('.lab-highlight-fill').count()>0,'Visible highlight paint in WebKit and Chromium');
  await p.keyboard.press('Escape');await p.screenshot({path:path.join(out,engine.name()+'-saved-opening.png')});
  await p.reload();await ready(p);
  assert.equal(await p.locator('.lab-next-chapter-opening .is-hl-sage[data-testid="lab-opening-word"]').count(),6,'Restored mark paints on the opening');
  assert.deepEqual(await p.evaluate(()=>JSON.parse(localStorage.getItem('tinct-lab-highlights'))),saved);
  await p.evaluate(()=>sessionStorage.setItem('tinct:lab-reader-handoff',JSON.stringify({kind:'open-reader',bookId:'bible',primaryEditionKey:'web-en',savedPlace:{bookId:'bible',chapterNumber:918,paragraphIndex:0,wordIndex:0,page:0}})));
  await p.reload();await ready(p);
  assert.equal(await p.locator('.lab').getAttribute('data-chapter'),'918');
  assert.equal(await p.locator('[data-testid="lab-word"].is-hl-sage').count(),6,'Same mark appears in its normal chapter');
  await p.screenshot({path:path.join(out,engine.name()+'-chapter-highlight.png')});
  results.push({engine:engine.name(),chapter:mark.chapterNumber,words:[mark.fromWord,mark.toWord],annotationsPreserved:true});
 }catch(e){await p.screenshot({path:path.join(out,engine.name()+'-failure.png')});throw e}
 finally{await context.close();await browser.close();fs.writeFileSync(path.join(out,baseline?'baseline.json':'results.json'),JSON.stringify(results,null,2));}
}
console.log(JSON.stringify(results));
})().catch(e=>{console.error(e);process.exit(1)});
