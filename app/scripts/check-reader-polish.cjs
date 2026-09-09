// Real layout and public audio only. All AI/account endpoints are blocked.
const {chromium,webkit}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
const origin=process.env.TEST_ORIGIN||'http://127.0.0.1:5191',out=process.env.ARTIFACT_DIR||'/tmp/tinct-reader-polish';fs.mkdirSync(out,{recursive:true});
const engine=process.env.ENGINE||'chromium';
async function setup(b,mobile,edition='original-en',bookId='democracy-in-america',chapter=1){
 const p=await b.newPage({viewport:mobile?{width:393,height:844}:{width:1440,height:950},isMobile:mobile,hasTouch:mobile});
 await p.route('**/api/**',r=>/\/api\/audio-(?:file|manifest)\?/.test(r.request().url())?r.continue():r.fulfill({status:404,body:'{}'}));
 await p.addInitScript(({edition,bookId,chapter})=>{if(!localStorage.getItem('polish-fixture')){localStorage.setItem('polish-fixture','1');sessionStorage.setItem('tinct:lab-reader-handoff',JSON.stringify({kind:'open-reader',bookId,primaryEditionKey:edition,compareEditionKey:edition==='original-en'?'modern-en':edition==='kjv-en'?'web-en':'original-en',savedPlace:{bookId,chapterNumber:chapter,paragraphIndex:0,page:0}}))}}, {edition,bookId,chapter});
 await p.goto(origin+'/reader');await ready(p);return p;
}
async function ready(p){await p.waitForFunction(()=>document.querySelector('.lab')?.dataset.readerReady==='true'&&document.querySelector('.lab-page-wrap > .lab-passage [data-testid="lab-word"]'));await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(300)}
async function snap(p){return p.locator('.lab-page-wrap > .lab-passage').evaluate(e=>{const words=[...e.querySelectorAll('[data-testid="lab-word"]')],last=words.at(-1),chrome=document.querySelector('.lab-bottom-chrome'),foot=document.querySelector('.lab-desktop-page-footers');return{keys:words.map(w=>w.dataset.paragraphIndex+':'+w.dataset.wordIndex),bottom:Math.max(...words.map(w=>w.getBoundingClientRect().bottom)),limit:Math.min(chrome.getBoundingClientRect().top,foot?.getBoundingClientRect().top??Infinity),line:parseFloat(getComputedStyle(last.parentElement).lineHeight),progress:chrome.textContent}})}
async function wake(p){if(await p.getByTestId('lab-root').getAttribute('data-reader-controls')==='hidden')await p.locator('.lab-header').click({position:{x:20,y:20}})}
(async()=>{const b=await({chromium,webkit}[engine]).launch(),results=[];try{
 for(const [bookId,edition,chapter] of (process.env.SKIP_MOBILE?[]:[['democracy-in-america','original-en',1],['bible','kjv-en',788],['bible','kjv-en',789]])){
 const p=await setup(b,true,edition,bookId,chapter),expected=await p.getByTestId('lab-native-page-measure').first().locator('[data-native-page-flow] [data-native-word]').evaluateAll(ws=>ws.map(w=>w.dataset.paragraphIndex+':'+w.dataset.wordIndex));
 let seen=[],pages=[],gaps=[],latencies=[];
 for(let i=0;i<150;i++){
   const s=await snap(p);assert.ok(s.keys.length,'Nonempty page');assert.ok(s.bottom<s.limit-23,`Mobile ink overlaps footer: ${s.bottom}/${s.limit}`);seen.push(...s.keys);pages.push(s.keys);gaps.push(Math.round(s.limit-s.bottom));
   if(seen.length>=expected.length)break;
   // Every interior leaf uses the available line capacity (24px clearance plus one line).
   assert.ok(s.limit-s.bottom<24+s.line+15,`Underfilled ${bookId} page ${i+1}: ${s.limit-s.bottom}px`);
   const start=Date.now();await p.keyboard.press('ArrowRight');await p.waitForFunction(first=>document.querySelector('.lab-page-wrap > .lab-passage [data-testid="lab-word"]')?.dataset.paragraphIndex+':'+document.querySelector('.lab-page-wrap > .lab-passage [data-testid="lab-word"]')?.dataset.wordIndex!==first,s.keys[0]);latencies.push(Date.now()-start);
   const immediate=(await snap(p)).keys;await p.waitForTimeout(90);assert.deepEqual((await snap(p)).keys,immediate,'No post-turn reflow');
 }
 assert.deepEqual(seen,expected,'All source words exactly once');
 for(let i=pages.length-2;i>=0;i--){await p.keyboard.press('ArrowLeft');await p.waitForTimeout(35);assert.deepEqual((await snap(p)).keys,pages[i],'Back restores identical page')}
 await p.screenshot({path:`${out}/${engine}-${bookId}-${chapter}-mobile.png`});results.push({bookId,chapter,pages:pages.length,words:seen.length,gaps,slowestTurnMs:Math.max(...latencies)});await p.close();
 }
 const p=await setup(b,false);await p.keyboard.press('ArrowRight');await p.waitForTimeout(150);
 assert.equal(await p.getByTestId('lab-root').getAttribute('data-reader-controls'),'hidden');
 assert.ok(await p.locator('.lab-header-controls').evaluate(e=>Number(getComputedStyle(e).opacity)<.4));
 assert.equal(await p.locator('.lab-header-chapter').evaluate(e=>getComputedStyle(e).backgroundColor),'rgba(0, 0, 0, 0)');
 const arrow=await p.getByTestId('lab-page-next').boundingBox();assert.equal(arrow.width,arrow.height);assert.ok(arrow.width<=44);
 const footer=await p.getByTestId('lab-desktop-page-footers').boundingBox(),book=await p.getByTestId('lab-page-wrap').boundingBox(),progress=await p.getByTestId('lab-chapter-progress').boundingBox();assert.ok(footer.y>book.y&&footer.y+footer.height<book.y+book.height);assert.ok(progress.y>=book.y+book.height,'Book progress outside leaf');assert.match(await p.getByTestId('lab-chapter-progress').textContent(),/^\d+% of book$/);
 await p.screenshot({path:`${out}/${engine}-desktop-quiet.png`});await wake(p);assert.equal(await p.getByTestId('lab-root').getAttribute('data-reader-controls'),'visible');await p.getByTestId('lab-super').click();await p.getByTestId('lab-super-row-compare').click();await p.waitForTimeout(250);assert.match(await p.getByTestId('lab-desktop-page-footers').textContent(),/Original.*Compare/);const paired=await snap(p);assert.ok(paired.bottom<paired.limit);await p.screenshot({path:`${out}/${engine}-desktop-compare.png`});
 await p.close();
 // Deterministic browser speech events and a mocked Chat reply; no microphone/model calls.
 const chat=await setup(b,false);
 await chat.evaluate(()=>{window.SpeechRecognition=class {start(){window.__dictation=this;this.onstart?.()}stop(){this.onend?.()}}});
 await chat.route('**/api/{chat,lab-chat}',r=>r.fulfill({status:200,contentType:'application/json',body:JSON.stringify({content:[{text:'Fixture response.'}]})}));
 await chat.getByTestId('lab-super').click();await chat.getByTestId('lab-super-row-chat').click();await chat.getByTestId('lab-ask-mic').click();
 assert.equal(await chat.getByTestId('lab-ask-voice').count(),0);await chat.getByRole('button',{name:'Stop dictation'}).waitFor();
 await chat.evaluate(()=>window.__dictation.onresult({results:[{isFinal:false,0:{transcript:'How does equality influence the society Tocqueville describes?'}}]}));
 await chat.getByRole('button',{name:'Stop dictation'}).click();assert.equal(await chat.getByTestId('lab-ask-voice').count(),0);
 const discs=await chat.locator('.lab-ask-composer button:visible').evaluateAll(bs=>bs.map(e=>{const s=getComputedStyle(e),r=e.getBoundingClientRect();return {width:r.width,height:r.height,bg:s.backgroundColor,color:s.color,border:s.borderTopWidth,clip:s.backgroundClip}}));assert.ok(discs.every(d=>d.width===44&&d.height===44&&d.border==='4px'&&d.clip==='padding-box'));assert.equal(new Set(discs.map(d=>d.bg+'|'+d.color)).size,1);
 await chat.screenshot({path:`${out}/${engine}-chat-draft.png`});await chat.getByTestId('lab-ask-send').click();await chat.getByTestId('lab-ask-voice').waitFor({state:'visible'});await chat.getByTestId('lab-ask-turn-assistant').filter({hasText:'Fixture response.'}).waitFor();results.push({dictationHidesConversation:true,equalComposerControls:true});await chat.close();
 // Use the edition actually narrated: real production timestamps + MP3s.
 const audio=await setup(b,false,'modern-en');await audio.getByTestId('lab-v2-play').click();await audio.waitForFunction(()=>document.querySelector('.lab')?.dataset.playing==='true');await audio.waitForFunction(()=>document.querySelector('.lab-page-wrap > .lab-passage .is-current'));assert.match(await audio.getByTestId('lab-chapter-progress').textContent(),/^\d+% of book$/,'Book progress remains visible while audio plays');
 const firstWord=await audio.locator('.lab-page-wrap > .lab-passage .lab-hearing-word.is-current').first().textContent();await audio.waitForFunction(first=>document.querySelector('.lab-page-wrap > .lab-passage .lab-hearing-word.is-current')?.textContent!==first,firstWord,{timeout:25000});const secondWord=await audio.locator('.lab-page-wrap > .lab-passage .lab-hearing-word.is-current').first().textContent();assert.notEqual(firstWord,secondWord,'Real audio moves current word');assert.equal(await audio.locator('.lab-page-wrap > .lab-passage .lab-hearing-word.is-current').count(),1,'Exactly one word highlighted');
 await audio.screenshot({path:`${out}/${engine}-desktop-audio-word.png`});await audio.emulateMedia({colorScheme:'dark'});await audio.waitForTimeout(150);await audio.screenshot({path:`${out}/${engine}-desktop-audio-word-dark.png`});await audio.getByTestId('lab-hearing-speed').click();await audio.getByTestId('lab-audio-speed-slider').fill('1.5');await audio.getByRole('button',{name:'Done',exact:true}).click();await audio.getByTestId('lab-hearing-pause').click();await audio.getByRole('button',{name:'Close audio controls',exact:true}).waitFor();assert.equal(await audio.getByTestId('lab-desktop-audio-dock').getByRole('button',{name:'Close audio controls',exact:true}).count(),1);const dockBox=await audio.getByTestId('lab-desktop-audio-dock').boundingBox(),closeBox=await audio.getByRole('button',{name:'Close audio controls',exact:true}).boundingBox();assert.ok(dockBox.height<=58,'Compact single-row audio pill');assert.ok(Math.abs((closeBox.y+closeBox.height/2)-(dockBox.y+dockBox.height/2))<1,'Close control centered within the pill');await audio.screenshot({path:`${out}/${engine}-desktop-audio-paused.png`});
 await audio.keyboard.press('ArrowRight');await audio.getByTestId('lab-desktop-audio-dock').waitFor({state:'hidden'});await audio.waitForTimeout(300);assert.ok((await snap(audio)).bottom<(await snap(audio)).limit);results.push({desktop:true,wordSync:{firstWord,secondWord},pausedTurnDismissed:true});await audio.close();
 fs.writeFileSync(`${out}/${engine}-results.json`,JSON.stringify(results,null,2));console.log(JSON.stringify(results,null,2));
}finally{await b.close()}})().catch(e=>{console.error(e);process.exit(1)});
