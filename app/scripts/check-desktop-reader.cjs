const {chromium,webkit}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
const origin=process.env.TEST_ORIGIN||'http://127.0.0.1:5191';
const engine=process.env.ENGINE||'chromium';
const out=process.env.ARTIFACT_DIR||'/tmp/tinct-desktop-reader';fs.mkdirSync(out,{recursive:true});
const primary=JSON.parse(fs.readFileSync('public/data/editions-chapters/democracy-in-america-original-en/ch0001.json')).paragraphs;
const comparison=JSON.parse(fs.readFileSync('public/data/editions-chapters/democracy-in-america-modern-en/ch0001.json')).paragraphs;
const expected=primary.flatMap((s,p)=>s.trim().split(/\s+/).map((_,w)=>`${p}:${w}`));
const targetExpected=comparison.flatMap((s,p)=>s.trim().split(/\s+/).map((_,w)=>`${p}:${w}`));
async function snap(p){return p.locator('.lab-page-wrap > .lab-passage').evaluate(el=>{
 const words=[...el.querySelectorAll('[data-testid="lab-word"]')],pairs=[...el.querySelectorAll('[data-compare-paragraph]')];
 const progress=document.querySelector('.lab-bottom-chrome').getBoundingClientRect();
 return {keys:words.map(w=>`${w.dataset.paragraphIndex}:${w.dataset.wordIndex}`), compare:pairs.flatMap(n=>Array.from({length:Number(n.dataset.compareTo)-Number(n.dataset.compareFrom)},(_,i)=>`${n.dataset.compareParagraph}:${Number(n.dataset.compareFrom)+i}`)),
 bottom:Math.max(...words.map(w=>w.getBoundingClientRect().bottom),...pairs.map(w=>w.getBoundingClientRect().bottom)),limit:progress.top,
 aligned:pairs.every((n,i)=>Math.abs(n.getBoundingClientRect().top-el.querySelectorAll('[data-testid="lab-reading-stage"] p')[i].getBoundingClientRect().top)<1)};
})}
async function ready(p){await p.waitForFunction(()=>document.querySelector('.lab')?.dataset.readerReady==='true');await p.waitForTimeout(120)}
async function turn(p,key){await p.keyboard.press(key);await p.waitForTimeout(80);const a=await snap(p);await p.waitForTimeout(100);assert.deepEqual((await snap(p)).keys,a.keys,'Stable page after turn');assert.ok(a.bottom<a.limit,`Text ${a.bottom} overlaps footer ${a.limit}`);return a}
(async()=>{const b=await({chromium,webkit}[engine]).launch();const results=[];try{
 const p=await b.newPage({viewport:{width:1440,height:950}});p.on('pageerror',e=>console.log('PAGE ERROR',e.message));
 await p.addInitScript(()=>{if(!localStorage.getItem('desktop-fixture')){localStorage.setItem('desktop-fixture','1');sessionStorage.setItem('tinct:lab-reader-handoff',JSON.stringify({kind:'open-reader',bookId:'democracy-in-america',primaryEditionKey:'original-en',compareEditionKey:'modern-en',savedPlace:{bookId:'democracy-in-america',chapterNumber:1,paragraphIndex:0,page:0}}))}});
 await p.goto(origin+'/reader');await ready(p);
 for(const mode of ['read','compare']){
 if(mode==='compare'){await p.getByTestId('lab-super').click();await p.getByTestId('lab-super-row-compare').click();await ready(p)}
 await p.screenshot({path:out+'/'+engine+'-'+mode+'.png'});
 const first=await snap(p), all=[...first.keys], target=[...first.compare], pages=[first.keys];
 assert.ok(first.bottom<first.limit,`First ${mode} text overlaps footer`);
 if(mode==='compare')assert.ok(first.aligned,'Compare paragraph rows aligned');
 for(let i=0;i<150&&all.length<expected.length;i++){
 const s=await turn(p,'ArrowRight');assert.ok(s.keys.length>0);if(mode==='compare')assert.ok(s.aligned);all.push(...s.keys);target.push(...s.compare);pages.push(s.keys)
 }
 assert.deepEqual(all,expected,mode+' covers every original word once');if(mode==='compare')assert.deepEqual(target,targetExpected,'Every comparison word appears once');
 for(let i=pages.length-2;i>=0;i--)assert.deepEqual((await turn(p,'ArrowLeft')).keys,pages[i]);
 results.push({mode,turns:pages.length,wordCounts:pages.map(a=>a.length)});
 }
 // Refresh a middle comparison page; the saved word must still be on a full page.
 await turn(p,'ArrowRight');await turn(p,'ArrowRight');const anchor=await p.getByTestId('lab-root').getAttribute('data-place');
 const beforeReload=await p.evaluate(()=>({stored:localStorage.getItem('tinct-lab-position'),place:document.querySelector('.lab').dataset.place}));await p.reload();await ready(p);const restored=await snap(p);fs.writeFileSync(out+'/'+engine+'-reload-debug.json',JSON.stringify({anchor,beforeReload,after:await p.getByTestId('lab-root').evaluate(e=>({...e.dataset})),keys:restored.keys},null,2));assert.ok(restored.keys.includes(anchor),'Reload retains saved word');assert.ok(restored.keys.length>60,'Reload has a full page');assert.ok(restored.bottom<restored.limit);await p.screenshot({path:out+'/'+engine+'-reload.png'});
 // Repeated refreshes exercise the provisional-map/passive-effect race in WebKit.
 for(let repeat=0;repeat<3;repeat++){
   const saved=await p.getByTestId('lab-root').getAttribute('data-place');
   await p.reload();await p.waitForFunction(()=>document.querySelector('.lab')?.dataset.readerReady==='true');
   const firstPaint=await snap(p);assert.ok(firstPaint.keys.includes(saved),'First measured paint contains saved word');
   await p.waitForTimeout(700);assert.deepEqual((await snap(p)).keys,firstPaint.keys,'Refresh remains on the same measured page');
 }
 // Actual playback; speed must respond to keyboard and pointer, with a usable popover.
 await p.getByTestId('lab-v2-play').click();await p.waitForFunction(()=>document.querySelector('.lab')?.dataset.playing==='true',{}, {timeout:25000});await p.waitForTimeout(300);
 await p.getByTestId('lab-hearing-speed').click();const slider=p.getByTestId('lab-audio-speed-slider');await slider.focus();await slider.press('ArrowRight');assert.equal(await slider.inputValue(),'1.25');
 const box=await slider.boundingBox();await p.mouse.click(box.x+box.width*.6,box.y+box.height/2);assert.equal(await slider.inputValue(),'2');await p.getByRole('button',{name:'Done',exact:true}).click();await p.getByTestId('lab-audio-speed-popover').waitFor({state:'hidden'});
 await p.screenshot({path:out+'/'+engine+'-audio.png'});await p.getByTestId('lab-v2-play').click();await p.waitForTimeout(250);assert.ok((await snap(p)).bottom<(await snap(p)).limit);
 results.push({reload:true,speedKeyboardAndPointer:true});
 await p.close();
 const cover=await b.newPage({viewport:{width:1440,height:950}});await cover.addInitScript(()=>sessionStorage.setItem('tinct:lab-reader-handoff',JSON.stringify({kind:'open-reader',bookId:'democracy-in-america',primaryEditionKey:'original-en'})));await cover.goto(origin+'/reader');await cover.getByTestId('lab-chapter-cover').waitFor();await cover.waitForTimeout(500);const r=await cover.locator('.lab-chapter-cover-art').evaluate(e=>({height:e.getBoundingClientRect().height,fit:getComputedStyle(e).objectFit,screen:innerHeight}));assert.ok(r.height<=r.screen);assert.equal(r.fit,'contain');await cover.screenshot({path:out+'/'+engine+'-cover.png'});results.push({cover:r});await cover.close();
 console.log(JSON.stringify(results,null,2));fs.writeFileSync(out+'/'+engine+'-results.json',JSON.stringify(results,null,2));
}finally{await b.close()}})().catch(e=>{console.error(e);process.exit(1)});
