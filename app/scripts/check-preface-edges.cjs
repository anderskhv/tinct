const {chromium,webkit}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
const origin=process.env.TEST_ORIGIN||'http://127.0.0.1:5192',dir=process.env.ARTIFACT_DIR||'/tmp/tinct-preface-edges';fs.mkdirSync(dir,{recursive:true});
async function state(p){return p.getByTestId('lab-root').evaluate(e=>({book:e.dataset.bookId,chapter:e.dataset.chapter,place:e.dataset.place,compare:e.dataset.compareActive,desktopCompare:e.dataset.desktopView}))}
async function stored(p){return p.evaluate(()=>Object.fromEntries(Object.keys(localStorage).filter(k=>/position|reading-log|progress:|reading-memory/.test(k)).map(k=>[k,localStorage.getItem(k)])))}
async function openCover(p){if(await p.getByTestId('lab-root').getAttribute('data-reader-controls')==='hidden')await p.locator('.lab-header').click({position:{x:20,y:20}});await p.getByTestId('lab-header-chapter').click();await p.getByRole('button',{name:'Cover and preface'}).click()}
(async()=>{const results=[];for(const engine of [chromium,webkit]){const b=await engine.launch();try{for(const id of ['odyssey','democracy-in-america']){
 const p=await b.newPage({viewport:engine===webkit?{width:390,height:844}:{width:1440,height:950},isMobile:engine===webkit,hasTouch:engine===webkit});
 await p.route('**/api/**',r=>r.fulfill({status:404,body:'{}'}));
 await p.addInitScript(id=>{if(!sessionStorage.getItem('seeded')){sessionStorage.setItem('seeded','1');sessionStorage.setItem('tinct:lab-reader-handoff',JSON.stringify({kind:'open-reader',bookId:id,primaryEditionKey:id==='bible'?'kjv-en':'original-en',compareEditionKey:id==='bible'?'web-en':'modern-en',savedPlace:{bookId:id,chapterNumber:2,paragraphIndex:1,wordIndex:5,page:0}}))}},id);
 await p.goto(origin+'/reader');await p.waitForFunction(()=>document.querySelector('.lab')?.dataset.readerReady==='true');await p.waitForTimeout(800);
 assert.equal(await p.getByTestId('lab-book-preface').count(),0,'Resumed book must open the reader');
 await p.getByTestId('lab-super').click();await p.getByTestId('lab-super-row-compare').click();await p.waitForTimeout(500);
 const before=await state(p);await openCover(p);const panel=p.getByTestId('lab-book-preface');await panel.getByRole('button',{name:'Read preface'}).click();await p.waitForTimeout(500);
 const writes=await stored(p);await p.locator('.lab-preface-scroll').evaluate(e=>e.scrollTop=e.scrollHeight);await p.keyboard.press('ArrowRight');await p.waitForTimeout(1800);
 assert.deepEqual(await stored(p),writes,'Viewing/scolling a preface must not write progress');assert.deepEqual(await state(p),before);
 await p.goBack();await p.waitForFunction(()=>document.querySelector('.lab-book-preface')?.dataset.view==='cover');await p.goBack();await panel.waitFor({state:'hidden'});assert.deepEqual(await state(p),before);
 await openCover(p);await panel.getByRole('button',{name:'Read preface'}).click();await p.reload();await p.waitForFunction(()=>document.querySelector('.lab')?.dataset.readerReady==='true');assert.equal(await panel.count(),0);assert.deepEqual(await state(p),before);
 // The library's real handoff shape must select the new book, never old prose/place.
 await p.evaluate(()=>sessionStorage.setItem('tinct:lab-reader-handoff',JSON.stringify({kind:'open-reader',bookId:'the-awakening',primaryEditionKey:'original-en',savedPlace:{bookId:'the-awakening',chapterNumber:3,paragraphIndex:1,wordIndex:2,page:0}})));
 await p.goto(origin+'/reader');await p.waitForFunction(()=>document.querySelector('.lab')?.dataset.readerReady==='true');
 assert.equal((await state(p)).book,'the-awakening');assert.equal((await state(p)).chapter,'3');
 await openCover(p);await p.getByRole('button',{name:'Read preface'}).click();assert.match(await p.locator('.lab-preface-article').innerText(),/^Before you begin[\s\S]*The Awakening is about the difficulty/);
 results.push({engine:engine.name(),id,before,noPrefaceProgressWrites:true,bookSwitch:'the-awakening'});await p.screenshot({path:`${dir}/${engine.name()}-resumed.png`});await p.close();
 }}finally{await b.close()}}fs.writeFileSync(`${dir}/results.json`,JSON.stringify(results,null,2));console.log(JSON.stringify(results,null,2))})().catch(e=>{console.error(e);process.exit(1)});
