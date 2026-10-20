import { chromium, webkit } from '@playwright/test'
import fs from 'node:fs'
import path from 'node:path'
import assert from 'node:assert/strict'
// The Worker's book-link composition, run here against the local build.
import { composeBookLibraryPage, prefillLibraryHero, readGeneratedBookPage } from '../src/worker/lib/bookLibraryPage.ts'
import { markInternal } from './lib/internalTraffic.cjs'
// Local runs answer /api/public-books with an empty list: readers' added books in the live
// catalogue (QA added ~25 on 9 Oct) are not this check's fixture.
const root=path.resolve('dist'),out=process.env.LIBRARY_OUT||'artifacts/library-public';fs.mkdirSync(out+'/book-links',{recursive:true});
// LIBRARY_ENGINES=chromium limits the engines; PW_CHROMIUM_PATH names a local Chromium binary.
const engines=(process.env.LIBRARY_ENGINES||'chromium,webkit').split(','),chromiumPath=process.env.PW_CHROMIUM_PATH;
const live=process.env.LIBRARY_LIVE==='1';
// Where the run is, for the watchdog below: a stall names its stage instead of
// silently using up the CI job's time (the film check stalled 20+ minutes, 5-6 Oct).
let stageName='start',stageAt=Date.now();
const stage=name=>{stageName=name;stageAt=Date.now();};
const watchdog=setInterval(()=>{if(Date.now()-stageAt>180000){console.error('LIBRARY_STALL_STAGE '+JSON.stringify({stage:stageName,seconds:Math.round((Date.now()-stageAt)/1000)}));process.exit(1);}},10000);watchdog.unref();
(async()=>{
// Navigations wait for DOMContentLoaded, then for the element under test: the
// library's full load event waits on every image (portraits in the hidden author
// flap included) and has stalled past 30s in CI without any visible fault.
// Desktop film loops: the visible wide painting's loop loads only after idle, and
// never on phones or with reduced motion. Playwright's Chromium lacks H.264, so
// report support to exercise the real gate; the request itself proves the src.
async function checkSceneFilm(b,engine,label,options,expected){
 const c=await b.newContext({serviceWorkers:'block',...options});
 await c.addInitScript(()=>{const o=HTMLMediaElement.prototype.canPlayType;HTMLMediaElement.prototype.canPlayType=function(t){return /mp4/.test(t)?'probably':o.call(this,t);};});
 const p=await c.newPage(),films=[];p.on('request',r=>{if(new URL(r.url()).pathname.endsWith('.mp4'))films.push({path:new URL(r.url()).pathname,type:r.resourceType()});});
 const pending=new Set(),errors=[];p.on('request',r=>pending.add(r));p.on('requestfinished',r=>pending.delete(r));p.on('requestfailed',r=>pending.delete(r));p.on('pageerror',e=>errors.push(e.message));
 if(!live)await p.route('https://tinct.app/**',async r=>{const u=new URL(r.request().url());if(u.pathname==='/api/public-books')return r.fulfill({contentType:'application/json',body:'{"books":[]}'});const publicEntry=['/','/index.html','/library','/library/'].includes(u.pathname);const f=publicEntry?path.join(root,'lab/library_2/index.html'):path.join(root,u.pathname);if(fs.existsSync(f)&&fs.statSync(f).isFile())return r.fulfill({path:f,...(publicEntry?{contentType:'text/html'}:{})});return r.continue();});
 // The request proves the film's src; never let the browser decode it. CI's Chromium has no
 // H.264, and decoding the film the spoofed canPlayType admits has frozen the page for 20+ minutes.
 await p.route('**/*.mp4',r=>r.abort());
 await p.goto('https://tinct.app/library',{waitUntil:'domcontentloaded'});
 // On a stall, log what the page was doing; CI artifacts are not readable from every agent.
 await p.locator('#read-featured').waitFor().catch(async error=>{
  const state=await p.evaluate(()=>{const chain=[];for(let n=document.getElementById('read-featured');n&&n!==document;n=n.parentElement){const s=getComputedStyle(n);chain.push(`${n.tagName.toLowerCase()}#${n.id}.${String(n.className).replace(/ /g,'.')} display=${s.display} visibility=${s.visibility} height=${Math.round(n.getBoundingClientRect().height)}`);}return {readyState:document.readyState,url:location.href,html:document.documentElement.className,style:document.documentElement.getAttribute('style'),chain};}).catch(e=>String(e));
  await p.screenshot({path:`${out}/stall-${label}.png`}).catch(()=>{});
  console.log('LIBRARY_STALL '+JSON.stringify({label,state,pending:[...pending].map(r=>r.url()),errors}));throw error;});
 assert.equal(films.length,0,label+': no film before the page is idle');
 if(expected){
  await p.waitForRequest(r=>new URL(r.url()).pathname.endsWith('.mp4'),{timeout:20000});
  assert.deepEqual(films[0],{path:'/lab/library_2/'+expected,type:'media'},label+': film for the visible scene');
 }else{
  await p.waitForTimeout(5000);
  assert.equal(await p.locator('video').count(),0,label+': no video element');
  assert.deepEqual(films,[],label+': no film requested');
 }
 console.log('SCENE_FILM '+JSON.stringify({engine,label,films}));await closeQuietly(c,p);
}
// Closing a context while the looping film still streams has hung CI for 20+
// minutes (2026-10-05, 2026-10-06) after every check had passed. Stop the film
// first, and never wait on the close itself for long.
// Library search (search QA, 2026-10-08): a search-only book's cached cover (War and Peace) no
// longer blanks the results ("Cannot read properties of undefined (reading 'typeset')"), and an
// empty English search says why (Kafka).
async function checkSearch(b,engine,w,h){
 const c=await b.newContext({serviceWorkers:'block',viewport:{width:w,height:h}}),p=await c.newPage(),errors=[];p.setDefaultTimeout(60000);p.on('pageerror',e=>errors.push(e.message));
 if(!live)await p.route('https://tinct.app/**',async r=>{const u=new URL(r.request().url());if(u.pathname==='/api/public-books')return r.fulfill({contentType:'application/json',body:'{"books":[]}'});const publicEntry=['/','/index.html','/library','/library/'].includes(u.pathname);const f=publicEntry?path.join(root,'lab/library_2/index.html'):path.join(root,u.pathname);if(fs.existsSync(f)&&fs.statSync(f).isFile())return r.fulfill({path:f,...(publicEntry?{contentType:'text/html'}:{})});return r.continue();});
 await p.route('**/*.mp4',r=>r.abort());
 await p.goto('https://tinct.app/library?view=new',{waitUntil:'domcontentloaded'});await p.locator('#search-toggle').waitFor();
 await p.locator('#search-toggle').click();await p.waitForFunction(()=>!document.getElementById('search-panel').hidden);
 const settled=()=>p.waitForFunction(()=>{const g=document.querySelector('[data-free-group]');return !g||g.dataset.freeGroup!=='pending';},null,{timeout:90000});
 const search=async query=>{await p.fill('#search-input','');await p.fill('#search-input',query);await settled();};
 await search('war and peace');
 await p.locator('.tinct-row[data-book="war-and-peace"] canvas[data-painted="true"]').waitFor();
 for(const query of ['Tolstoy','war and peace']){await search(query);assert.equal(await p.locator('.tinct-row[data-book="war-and-peace"]').count(),1,query+': War and Peace listed');}
 assert.equal(errors.filter(e=>/typeset/.test(e)).length,0,'no blank results after a cached search-only cover');
 await search('kafka');await p.locator('.search-why').waitFor();
 assert.match(await p.locator('.search-why').innerText(),/^Tinct has Franz Kafka only in German[ ,a-zA-Z]*\. The English translations aren’t public domain yet\.$/);
 assert.deepEqual(errors,[],'search: no page errors');
 console.log('LIBRARY_SEARCH '+JSON.stringify({engine,errors}));await c.close();
}
async function closeQuietly(c,p){
 await Promise.race([p.evaluate(()=>{for(const v of document.querySelectorAll('video')){v.pause();v.removeAttribute('src');v.load();}}),new Promise(r=>setTimeout(r,5000))]).catch(()=>{});
 let timer;await Promise.race([c.close(),new Promise(r=>{timer=setTimeout(()=>{console.log('CONTEXT_CLOSE_SLOW');r();},15000);})]).catch(()=>{});clearTimeout(timer);
}
for(const [engine,w,h]of[[chromium,1512,862],[webkit,393,734]].filter(([e])=>engines.includes(e.name()))){
 const b=await markInternal(await engine.launch({headless:true,...(engine===chromium?{args:['--mute-audio'],...(chromiumPath?{executablePath:chromiumPath}:{})}:{})}));
 // Book links: the linked book is in the hero from the first paint, nothing opens by itself.
 for(const [bw,bh,mobile] of engine===chromium?[[1440,900,false],[390,844,true]]:[[390,844,true]])await checkBookLinks(b,engine.name(),bw,bh,mobile,engine===chromium&&!mobile);
 for(const [bw,bh,mobile] of engine===chromium?[[1440,900,false],[390,664,true]]:[[390,664,true],[390,844,true]]){stage(`book opening ${engine.name()} ${bw}x${bh}`);await checkBookOpening(b,engine.name(),bw,bh,mobile);}
 if(engine===chromium){stage('search chromium');await checkSearch(b,engine.name(),1440,900);}
 // The film checks get a browser of their own: one that wedges after a film
 // (CI, 5-6 Oct) cannot stall the checks that follow on \`b\`.
 const fb=await engine.launch({headless:true,...(engine===chromium?{args:['--mute-audio'],...(chromiumPath?{executablePath:chromiumPath}:{})}:{})});
 if(engine===chromium){stage('film desktop');await checkSceneFilm(fb,'chromium','desktop',{viewport:{width:w,height:h}},'assets/scenes/room-wide-v2.mp4');stage('film reduced-motion');await checkSceneFilm(fb,'chromium','reduced-motion',{viewport:{width:w,height:h},reducedMotion:'reduce'},null);}
 else{stage('film phone');await checkSceneFilm(fb,engine.name(),'phone',{viewport:{width:w,height:h},isMobile:true,hasTouch:true},null);}
 stage('film browser close');await Promise.race([fb.close(),new Promise(r=>setTimeout(()=>{console.log('FILM_BROWSER_CLOSE_SLOW');r();},15000))]).catch(()=>{});
 stage('library '+engine.name());
 const c=await b.newContext({serviceWorkers:'block',viewport:{width:w,height:h},...(engine===webkit?{isMobile:true,hasTouch:true}:{})}),p=await c.newPage(),errors=[];p.setDefaultTimeout(45000);p.on('pageerror',e=>errors.push(e.message));
 if(!live)await p.route('https://tinct.app/**',async r=>{const u=new URL(r.request().url());if(u.pathname==='/api/public-books')return r.fulfill({contentType:'application/json',body:'{"books":[]}'});const publicEntry=['/','/index.html','/library','/library/'].includes(u.pathname);const f=publicEntry?path.join(root,'lab/library_2/index.html'):path.join(root,u.pathname.endsWith('/')?u.pathname+'index.html':u.pathname);if(fs.existsSync(f)&&fs.statSync(f).isFile())return r.fulfill({path:f,...(publicEntry?{contentType:'text/html'}:{})});return r.continue();});
 await p.goto('https://tinct.app/',{waitUntil:'domcontentloaded'});await p.locator('#read-featured').waitFor();await p.waitForFunction(()=>document.querySelectorAll('.hero-dots button').length===5);assert.equal(await p.locator('#hero-title').innerText(),'Frankenstein');assert(!(await c.cookies()).some(x=>x.name==='tinct_library_preview'));assert(!(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth)),'new library fits viewport');await p.waitForFunction(()=>document.querySelector('[data-metadata-book=frankenstein]')?.textContent.includes('1818'));assert.equal(await p.locator('[data-metadata-book=frankenstein] .metadata-category').first().innerText(),'FICTION');assert.equal(await p.locator('[data-metadata-book=frankenstein] .metadata-details span').first().innerText(),'1818');assert.match(await p.locator('[data-metadata-book=frankenstein] .metadata-details span').nth(1).innerText(),/^~[0-9.]+h$/);await p.screenshot({path:out+`/${live?'live':'local'}-${engine.name()}-new.png`});
 await p.locator('#menu-toggle').click();
 assert.equal(await p.locator('#library-menu details, #library-menu summary').count(),0,'main menu has top-level categories only');
 await p.locator('#menu-categories button').filter({hasText:/^Philosophy$/}).click();
 assert.equal(await p.locator('#collection-title').innerText(),'Philosophy');
 const stoics=p.locator('.collection-reel').filter({has:p.locator('h2').filter({hasText:/Stoic/})});
 assert(await stoics.count()>0,'philosophy has a Stoic book row');
 assert((await stoics.innerText()).includes('Meditations'));
 assert.equal(await stoics.locator('.book-row').getAttribute('role'),'region');
 // Browser Back closes a category instead of leaving Tinct (QA 2026-10-01).
 await p.goBack();await p.waitForFunction(()=>document.getElementById('collection').hidden);
 assert.equal(new URL(p.url()).host,'tinct.app','Back from a category stays in Tinct');
 await p.locator('#menu-toggle').click();await p.locator('#menu-categories button').filter({hasText:/^Philosophy$/}).click();
 await p.locator('#collection-back').click();
 await p.locator('#menu-toggle').click();
 await p.locator('#menu-periods button').filter({hasText:/^Antiquity/}).click();
 assert.equal(await p.locator('#collection-title').innerText(),'Antiquity');
 const earliest=p.locator('[data-collection-group="earliest"]');
 assert((await earliest.innerText()).includes('before 1000 BC'));
 assert(!(await earliest.innerText()).includes('Meditations'));
 assert(await p.locator('.collection-reel').count()>1,'antiquity is divided into populated period rows');
 assert(!(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth)),'period rows stay in the viewport');
 await p.screenshot({path:out+'/browse-'+engine.name()+'.png'});
 await p.locator('#collection-back').click();
 await p.locator('#menu-toggle').click();
 await p.locator('#menu-categories button').filter({hasText:/^Drama$/}).click();
 const reels=await p.locator('.collection-reel .book-row').evaluateAll(rows=>rows.map(row=>{
  const before=row.scrollLeft;row.scrollLeft=row.scrollWidth;
  const card=row.querySelector('.collection-card'),title=card.querySelector('h2');
  return {scrollable:row.scrollWidth>row.clientWidth+1,moved:row.scrollLeft>before,display:getComputedStyle(row).display,right:row.getBoundingClientRect().right,titleInset:parseFloat(getComputedStyle(title).paddingLeft),titleFont:getComputedStyle(title).fontFamily};
 }));
 assert(reels.length>1,'drama subdivisions are distinct rows');
 assert(reels.every(r=>r.display==='flex'&&r.right<=w+1));
 assert(reels.every(r=>r.titleInset===0&&r.titleFont.includes('Georgia')),'book titles align with their covers');
 console.log('COLLECTION_REELS '+JSON.stringify({engine:engine.name(),viewport:w,reels}));
 assert(reels.every(r=>!r.scrollable||r.moved),'every overflowing row can be scrolled');
 if(w<600)assert(reels.some(r=>r.scrollable&&r.moved),'populated drama rows scroll on phones');
 await p.locator('.collection-reel .book-row').evaluateAll(rows=>rows.forEach(row=>row.scrollLeft=0));
 // Visible means inside the viewport and inside its reel's scrolled window (the row clips the covers past its edge).
 await p.waitForFunction(()=>[...document.querySelectorAll('.collection-reel canvas[data-book]')].filter(c=>{const r=c.getBoundingClientRect(),row=c.closest('.book-row')?.getBoundingClientRect();return r.left<Math.min(innerWidth,row?row.right:innerWidth)&&r.right>Math.max(0,row?row.left:0)&&r.top<innerHeight&&r.bottom>0}).every(c=>c.dataset.painted==='true'));
 const navReview=await p.screenshot({path:out+'/drama-'+engine.name()+'.jpg',type:'jpeg',quality:75});
 console.log('REVIEW_BEGIN drama-'+engine.name());const encoded=navReview.toString('base64');for(let i=0;i<encoded.length;i+=12000)console.log('REVIEW_CHUNK '+encoded.slice(i,i+12000));console.log('REVIEW_END');
 await p.locator('#collection-back').click();

 await p.locator('#read-featured').click();await p.locator('#book-overlay').waitFor();await p.locator('#page-back').waitFor();if(await p.locator('#slip-next').isVisible()){await p.locator('#slip-next').click();await p.locator('#begin-reading').waitFor();await p.locator('#page-back').click();await p.locator('#slip-next').waitFor();}await p.locator('#page-back').click();await p.locator('#book-overlay').waitFor({state:'hidden'});
 await p.evaluate(()=>{sessionStorage.clear();const now=Date.now();localStorage.setItem('tinct-lab-position',JSON.stringify({owner:null,books:{frankenstein:{bookId:'frankenstein',headerBook:'Frankenstein',chapterNumber:7,sequentialChapter:7,paragraphIndex:11,wordIndex:23,pageIndex:4,primaryEditionKey:'original-en',updatedAt:now,deviceId:'public-check',rev:0}},finished:{},hidden:{},lastSettledBookId:'frankenstein',lastSettledAt:now,updatedAt:now,deviceId:'public-check'}));});
 let releaseBridge;const bridgeGate=new Promise(resolve=>{releaseBridge=resolve;});
 const heldBridge=async route=>{await bridgeGate;return route.fallback();};
 await p.route('**/lab/library-2-reading.js?*',heldBridge);
 await p.addInitScript(()=>{if(location.pathname==='/library')sessionStorage.removeItem('tinct:library-2-visit');});
 await p.goto('https://tinct.app/library',{waitUntil:'domcontentloaded'});
 await p.waitForTimeout(150);
 assert(await p.locator('html').evaluate(n=>n.classList.contains('returning-scene-pending')),'returning scene waits for its books');
 assert.equal(await p.locator('#scene').evaluate(n=>getComputedStyle(n).opacity),'0','no empty table flash while reading data loads');
 // Screenshot capture waits for fonts in WebKit; keep this held-load assertion DOM-only.
 releaseBridge();await p.unroute('**/lab/library-2-reading.js?*',heldBridge);
 await p.locator('.reading-table.is-ready').waitFor({timeout:15000}).catch(async e=>{console.log({url:p.url(),errors,html:await p.locator('html').getAttribute('class'),tables:await p.locator('.reading-table').count(),content:(await p.locator('body').innerText()).slice(0,900),boot:await p.evaluate(()=>window.__library2Boot)});await p.screenshot({path:out+'/debug.png'});throw e;});await p.waitForTimeout(700);await p.waitForFunction(()=>getComputedStyle(document.getElementById('scene')).opacity==='1',null,{timeout:6000}).catch(()=>{});assert.equal(await p.locator('#scene').evaluate(n=>getComputedStyle(n).opacity),'1','composed room revealed');assert(!(await p.locator('html').evaluate(n=>n.classList.contains('returning-scene-pending'))));assert.match(await p.locator('html').getAttribute('data-scene'),/^table-/);const cta=await p.locator('#rt-continue').boundingBox();assert(cta.y+cta.height<=h,JSON.stringify(cta));assert.equal(await p.locator('#rt-book-metadata .metadata-category').innerText(),'FICTION');assert.equal(await p.locator('#rt-book-metadata .metadata-details span').first().innerText(),'1818');assert.match(await p.locator('#rt-book-metadata .metadata-details span').nth(1).innerText(),/ left$/);const remove=await p.locator('#rt-remove').boundingBox();assert(remove.x>=0&&remove.x+remove.width<=w&&remove.y>=0&&remove.y+remove.height<h,JSON.stringify(remove));const face=await p.locator('.rt-b.is-current .rt-front').boundingBox();assert(Math.abs(remove.y+remove.height/2-face.y)<3,JSON.stringify({remove,face}));await p.screenshot({path:out+`/${live?'live':'local'}-${engine.name()}-returning.png`});
 await p.route('**/reader',r=>r.fulfill({contentType:'text/html',body:'<!doctype html><title>Handoff</title>'}));await p.locator('#rt-continue').click();await p.waitForURL('**/reader');const handoff=await p.evaluate(()=>JSON.parse(sessionStorage.getItem('tinct:lab-reader-handoff')));assert.deepEqual(handoff.savedPlace,{bookId:'frankenstein',chapterNumber:7,page:4,paragraphIndex:11,wordIndex:23});
 // Removing the last book hides only its shelf entry, never its saved place.
 await p.goto('https://tinct.app/library',{waitUntil:'domcontentloaded'});await p.locator('.reading-table.is-ready').waitFor();
 await p.locator('#menu-toggle').click();await p.locator('[data-collection="saved"]').click();
 // My shelf's cards carry the book id and the cover's ••• (2026-10-20); the shelf's × is gone.
 assert.equal(await p.locator('#collection-books article.collection-card[data-book="frankenstein"]').evaluate(n=>n.dataset.shelfGroup),'reading');
 await p.locator('#collection-back').click();
 const before=await p.evaluate(()=>JSON.parse(localStorage.getItem('tinct-lab-position')));
 await p.locator('#rt-remove').click();await p.locator('#rt-remove-dialog[open]').waitFor();
 await p.locator('#rt-remove-cancel').click();assert.equal(await p.locator('.rt-b').count(),1);
 await p.locator('#rt-remove').click();await p.locator('#rt-remove-confirm').click();
 await p.waitForFunction(()=>!document.documentElement.classList.contains('returning'));
 const after=await p.evaluate(()=>JSON.parse(localStorage.getItem('tinct-lab-position')));
 assert.deepEqual(after.books,before.books);assert.deepEqual(after.finished,before.finished);
 assert.equal(after.lastSettledBookId,before.lastSettledBookId);assert.equal(after.lastSettledAt,before.lastSettledAt);assert(after.hidden.frankenstein>=before.books.frankenstein.updatedAt);
 // The immediate view must stop calling this book Currently reading too.
 await p.locator('#menu-toggle').click();await p.locator('[data-collection="saved"]').click();
 await p.locator('#collection-books article.collection-card[data-book="frankenstein"]').waitFor();
 assert.equal(await p.locator('#collection-books article.collection-card[data-book="frankenstein"]').evaluate(n=>n.dataset.shelfGroup),'want');
 assert.equal(await p.locator('#collection-books .my-books-head').first().innerText(),'Saved for later');
 await p.reload();await p.locator('#read-featured').waitFor();
 await p.waitForFunction(()=>window.__library2Reading&&window.__tinctLibraryTwoReading);
 assert.equal(await p.evaluate(()=>window.__library2Reading.reading.length),0);
 assert.equal(await p.evaluate(()=>window.__tinctLibraryTwoReading.readerDestination('frankenstein',null)),'/reader');
 assert.deepEqual(await p.evaluate(()=>JSON.parse(sessionStorage.getItem('tinct:lab-reader-handoff')).savedPlace),handoff.savedPlace);
 // Table removal retains the book on My shelf; shelf removal is explicit and durable.
 await p.locator('#menu-toggle').click();
 await p.locator('[data-collection="saved"]').click();
 assert.equal(await p.locator('#collection-title').innerText(),'My shelf');
 const shelfCard=p.locator('#collection-books article.collection-card[data-book="frankenstein"]'),shelfRemove=shelfCard.locator('.shelf-more');
 await shelfRemove.waitFor();assert.equal(await shelfRemove.getAttribute('aria-label'),'More for Frankenstein');
 assert.equal(await shelfCard.evaluate(n=>n.dataset.shelfGroup),'want','desk removal stays outside Currently reading after reload');
 assert.equal(await p.locator('#collection-books [data-shelf-group="reading"][data-book="frankenstein"]').count(),0);
 await p.evaluate(()=>dispatchEvent(new CustomEvent('library2:saved',{detail:['frankenstein']})));
 assert.equal(await shelfCard.locator('.save-toggle').count(),0,'saved refresh must not repaint the shelf remove as a plus/check');
 assert.equal(await shelfRemove.count(),1,'saved refresh keeps the shelf remove');
 await p.screenshot({path:out+'/my-shelf-'+engine.name()+'.png'});
 await shelfRemove.click();const removeItem=shelfCard.locator('[role="menuitem"]');assert.equal(await removeItem.innerText(),'Remove from my books');await removeItem.click();
 await p.locator('[data-testid="own-delete-dialog"] .own-delete-confirm').click();
 await p.waitForFunction(()=>!document.querySelector('#collection-books article.collection-card[data-book="frankenstein"]'));
 assert.deepEqual(await p.evaluate(()=>JSON.parse(localStorage.getItem('tinct-lab-position')).books),before.books);
 await p.reload();await p.waitForFunction(()=>window.__library2Reading&&window.__tinctLibraryTwoReading);
 await p.locator('#menu-toggle').click();await p.locator('[data-collection="saved"]').click();
 await p.waitForTimeout(1000);assert.equal(await p.locator('#collection-books article.collection-card[data-book="frankenstein"]').count(),0,'removed membership survives a reload despite retained progress');
 await p.locator('#collection-back').click();
 // The bare-home shortcut uses a same-account fixture; the existing reader remains the position resolver.
 await p.evaluate(()=>{const s=JSON.parse(localStorage.getItem('tinct-lab-position'));s.owner='public-check';localStorage.setItem('tinct-lab-position',JSON.stringify(s));localStorage.setItem('sb-public-check-auth-token',JSON.stringify({user:{id:'public-check'}}));});
 await p.goto('https://tinct.app/',{waitUntil:'domcontentloaded'});await p.waitForURL('**/reader');assert.deepEqual(errors,[]);console.log({engine:engine.name(),live,publicNew:true,back:true,returningTable:true,exactResume:true,homeResume:true,metadata:true,removePreservesPlace:true,errors});await c.close();await b.close();stage('next engine');
}})().then(()=>process.exit(0),e=>{console.error(e);process.exit(1)});

// ---- Opening the hero book (iPhone QA, 14 Oct) ----
// The page clock is held and stepped, so the opening is measured at set points after the
// cover has turned: the flap (left page) and the paper (right page) are one size, level,
// and the flap stays on screen. A flap held at its final height stayed at the cover's
// size, high and off the left edge, on a 390x664 iPhone for five days (#372).
async function checkBookOpening(b,engine,w,h,mobile){
 const label=`${engine}-${w}x${h}`,c=await b.newContext({serviceWorkers:'block',viewport:{width:w,height:h},...(mobile?{isMobile:engine==='chromium',hasTouch:true}:{})});
 await c.addInitScript(()=>{const real=performance.now.bind(performance),raf=requestAnimationFrame.bind(window);let held=null;window.__openClock={hold:()=>held=real(),set:t=>held=t,now:()=>held};const now=()=>held??real();performance.now=now;window.requestAnimationFrame=cb=>raf(()=>cb(now()));});
 const p=await c.newPage(),errors=[];p.setDefaultTimeout(45000);p.on('pageerror',e=>errors.push(e.message));
 if(!live)await p.route('https://tinct.app/**',async r=>{const u=new URL(r.request().url());if(u.pathname==='/api/public-books')return r.fulfill({contentType:'application/json',body:'{"books":[]}'});const publicEntry=['/','/index.html','/library','/library/'].includes(u.pathname);const f=publicEntry?path.join(root,'lab/library_2/index.html'):path.join(root,u.pathname);if(fs.existsSync(f)&&fs.statSync(f).isFile())return r.fulfill({path:f,...(publicEntry?{contentType:'text/html'}:{})});return r.continue();});
 await p.goto('https://tinct.app/',{waitUntil:'domcontentloaded'});await p.locator('#hero-book canvas').waitFor();
 await p.evaluate(()=>window.__openClock.hold());await p.locator('#hero-book').click();
 await p.waitForFunction(()=>!document.getElementById('book-overlay').hidden);await p.waitForTimeout(150);
 const start=await p.evaluate(()=>window.__openClock.now()),frames=[];
 for(const t of [.5,.625,.75,.875,1]){
  await p.evaluate(at=>window.__openClock.set(at),start+t*1500);await p.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));await p.waitForTimeout(100);
  const f=await p.evaluate(()=>{const r=s=>{const b=document.querySelector(s).getBoundingClientRect();return {x:Math.round(b.x),y:Math.round(b.y),w:Math.round(b.width),h:Math.round(b.height)};};return {back:r('.cover-back'),paper:r('#paper')};});
  frames.push({t,...f});
  const {back,paper}=f,where=`${label} opening at ${t}: ${JSON.stringify(f)}`;
  assert(Math.abs(back.w-paper.w)<=3&&Math.abs(back.h-paper.h)<=3,where+': both pages one size');
  assert(Math.abs(back.y-paper.y)<=3&&Math.abs(back.x+back.w-paper.x)<=3,where+': the pages meet level at the spine');
  assert(back.x>=-1&&back.y>=-1,where+': the left page stays on screen');
 }
 await p.screenshot({path:`${out}/${label}-book-opened.png`});
 assert.deepEqual(errors,[],label+' opening: no page errors');
 console.log('BOOK_OPENING '+JSON.stringify({label,frames:frames.map(f=>({t:f.t,back:f.back,paper:f.paper}))}));
 await c.close();
}

// ---- Book links: /library?book=<id> and the shared /read/<id>/ (approved 6 Oct) ----
async function checkBookLinks(b,engine,w,h,mobile,extended){
 const LINKED='wuthering-heights',TITLE='Wuthering Heights',AUTHOR='Emily Brontë',label=`${engine}-${w}x${h}`,shots=out+'/book-links';
 const library=()=>fs.readFileSync(path.join(root,'lab/library_2/index.html'),'utf8');
 const generated=id=>{const f=path.join(root,'read',id||'','book.html');return /^[a-z0-9-]+$/.test(id||'')&&fs.existsSync(f)?readGeneratedBookPage(fs.readFileSync(f,'utf8'),id):null;};
 async function open({state=null,raw=false}={}){
  const c=await b.newContext({serviceWorkers:'block',viewport:{width:w,height:h},...(mobile?{isMobile:true,hasTouch:true}:{})}),p=await c.newPage(),errors=[];p.setDefaultTimeout(45000);p.on('pageerror',e=>errors.push(e.message));
  // Every animation frame from the first: which book the hero names and whether anything opened.
  // The recorder ticks from the document's first frame, while the page is still being parsed: a
  // frame where the hero's parts (or the book overlay, far below the /read page's text) do not
  // exist yet records nothing but keeps ticking, instead of throwing and recording nothing at all.
  await c.addInitScript(()=>{window.__heroFrames=[];const tick=()=>{const copy=document.querySelector('.hero-copy'),book=document.getElementById('hero-book'),title=document.getElementById('hero-title'),overlay=document.getElementById('book-overlay');if(copy&&book&&title&&overlay){const s=getComputedStyle(copy),cover=getComputedStyle(book),root=document.documentElement;const shown=!root.classList.contains('returning')&&s.display!=='none'&&s.visibility==='visible'&&Number(s.opacity)>0;window.__heroFrames.push({title:title.textContent,cover:document.querySelector('#hero-book canvas')?.dataset.book,shown,coverShown:shown&&cover.visibility==='visible',overlay:!overlay.hidden,desk:document.querySelector('.reading-table:not([hidden]) .rt-b.is-current')?.getAttribute('aria-label')||null});}if(window.__heroFrames.length<2000)requestAnimationFrame(tick);};requestAnimationFrame(tick);});
  if(state)await c.addInitScript(value=>{if(!localStorage.getItem('tinct-lab-position'))localStorage.setItem('tinct-lab-position',value);},JSON.stringify(state));
  if(!live){
   // The Worker's routing for these pages, against the local build; account APIs answer nothing.
   await p.route('https://tinct.app/**',async r=>{const u=new URL(r.request().url());
    if(u.pathname.startsWith('/api/'))return r.fulfill({status:404,contentType:'application/json',body:'{}'});
    const read=u.pathname.match(/^\/read\/([a-z0-9-]+)\/?$/)?.[1],entry=['/','/index.html','/library','/library/'].includes(u.pathname);
    if(read||entry){const page=generated(read||u.searchParams.get('book'));if(read&&!page)return r.fulfill({status:404,body:'missing'});return r.fulfill({contentType:'text/html',body:read?composeBookLibraryPage(library(),page):page&&!raw?prefillLibraryHero(library(),page.hero):library()});}
    if(u.pathname==='/reader')return r.fulfill({path:path.join(root,'app.html'),contentType:'text/html'});
    const f=path.join(root,u.pathname.endsWith('/')?u.pathname+'index.html':u.pathname);if(fs.existsSync(f)&&fs.statSync(f).isFile())return r.fulfill({path:f});return r.fulfill({status:404,body:''});});
   await p.route(/supabase\.co/,r=>r.fulfill({status:404,contentType:'application/json',body:'{}'}));
  }
  return {c,p,errors};
 }
 const frames=p=>p.evaluate(()=>window.__heroFrames);
 function onlyLinked(list,where){
  assert(list.length>0,where+': frames recorded');
  const other=list.find(f=>(f.shown&&f.title!==TITLE)||(f.coverShown&&f.cover!==LINKED)||(f.desk&&f.desk!==TITLE));
  assert(!other,where+': no other book in the hero or on the desk '+JSON.stringify(other));
  assert(!list.some(f=>f.overlay),where+': nothing opens by itself');
 }
 // A new reader: that book in the hero from the very first frame; Read opens the usual introduction.
 for(const entry of ['/library?book='+LINKED,'/read/'+LINKED+'/']){
  const {c,p,errors}=await open(),where=`${label} fresh ${entry}`,kind=entry.startsWith('/read')?'read':'library';
  await p.goto('https://tinct.app'+entry,{waitUntil:'domcontentloaded'});
  await p.locator('#read-featured').waitFor();
  await p.waitForFunction(()=>document.getElementById('hero-time').textContent.trim().length>0);
  await p.waitForTimeout(3500);
  const list=await frames(p);onlyLinked(list,where);
  assert(list[0].shown&&list[0].title===TITLE,where+': first frame shows the linked book '+JSON.stringify(list[0]));
  assert.equal(await p.locator('#hero-author').innerText(),AUTHOR+'’s');
  assert.equal(new URL(p.url()).pathname+new URL(p.url()).search,entry,where+': the address stays the shared link');
  await p.screenshot({path:`${shots}/${label}-fresh-${kind}.png`});
  if(kind==='read'){
   const head=await p.evaluate(()=>({title:document.title,canonical:document.querySelector('link[rel=canonical]')?.href,ogTitle:document.querySelector('meta[property="og:title"]')?.content,robots:document.querySelector('meta[name=robots]')?.content||null,about:document.getElementById('book-about')?.innerText||''}));
   assert.match(head.title,/Wuthering Heights/);assert.equal(head.canonical,'https://tinct.app/read/'+LINKED);assert.match(head.ogTitle,/Wuthering Heights/);assert.equal(head.robots,null,'the shared page is indexable');
   assert(head.about.includes('I have just returned from a visit to my landlord'),where+': the book text is on the page');
   if(extended){await p.evaluate(()=>document.getElementById('book-about').scrollIntoView({block:'start',behavior:'instant'}));await p.waitForTimeout(300);await p.screenshot({path:`${shots}/${label}-fresh-read-about.png`});await p.evaluate(()=>scrollTo({top:0,behavior:'instant'}));}
  }
  await p.locator('#read-featured').click();
  await p.locator('#book-overlay').waitFor();await p.waitForFunction(a=>document.getElementById('slip-caption').textContent.includes(a),AUTHOR);
  await p.waitForTimeout(1600);await p.screenshot({path:`${shots}/${label}-fresh-${kind}-opened.png`});
  assert.deepEqual(errors,[],where+': no page errors');
  console.log('BOOK_LINK '+JSON.stringify({where,frames:list.length,first:list[0]}));
  await c.close();
 }
 if(extended&&!live){
  // Without the Worker's prefilled hero (a development server), the hero waits for the book.
  const {c,p,errors}=await open({raw:true}),where=`${label} unfilled /library?book=`;
  await p.goto('https://tinct.app/library?book='+LINKED,{waitUntil:'domcontentloaded'});
  await p.waitForFunction(t=>document.getElementById('hero-title').textContent===t&&!document.documentElement.classList.contains('linked-pending'),TITLE);
  await p.waitForTimeout(2500);onlyLinked(await frames(p),where);assert.deepEqual(errors,[]);await c.close();
 }
 if(extended){
  // A chapter link goes straight into the reader at that chapter.
  const {c,p}=await open();
  await p.goto('https://tinct.app/read/'+LINKED+'/',{waitUntil:'domcontentloaded'});
  const link=p.locator(`#book-about a[href="/reader?book=${LINKED}&chapter=3"]`);
  await link.scrollIntoViewIfNeeded();
  const reader=p.waitForRequest(r=>r.url()===`https://tinct.app/reader?book=${LINKED}&chapter=3`);
  await link.click();await reader;
  // The click navigates: wait for the reader document, which has no body for a moment while it loads.
  await p.waitForURL(url=>url.pathname==='/reader',{waitUntil:'domcontentloaded'});
  await p.waitForFunction(()=>/Chapter 3\b/.test(document.body?.innerText||''),null,{timeout:45000});
  await p.screenshot({path:`${shots}/${label}-chapter-link-reader.png`});
  console.log('BOOK_LINK_CHAPTER '+JSON.stringify({engine,url:p.url()}));
  await c.close();
 }
 // A reader with books on this device: their desk as usual, the linked book in focus beside them.
 const now=Date.now(),place=(bookId,headerBook,chapterNumber,at)=>({bookId,headerBook,chapterNumber,sequentialChapter:chapterNumber,paragraphIndex:3,wordIndex:0,pageIndex:1,primaryEditionKey:'original-en',updatedAt:at,deviceId:'public-check',rev:0});
 const state={owner:null,books:{frankenstein:place('frankenstein','Frankenstein',7,now),odyssey:place('odyssey','The Odyssey',3,now-60000)},finished:{},hidden:{},lastSettledBookId:'frankenstein',lastSettledAt:now,updatedAt:now,deviceId:'public-check'};
 {
  const {c,p,errors}=await open({state});
  const desk=async()=>{await p.locator('.reading-table.is-ready').waitFor({timeout:30000});await p.waitForTimeout(800);return p.evaluate(()=>({books:[...document.querySelectorAll('.reading-table:not([hidden]) .rt-b')].map(b=>b.getAttribute('aria-label')),current:document.querySelector('.reading-table:not([hidden]) .rt-b.is-current')?.getAttribute('aria-label'),title:document.getElementById('rt-title').textContent,action:document.getElementById('rt-continue').textContent.trim(),remove:document.getElementById('rt-remove').hidden}));};
  await p.goto('https://tinct.app/library',{waitUntil:'domcontentloaded'});
  const own=await desk();assert(own.books.length===2&&own.current===own.books[0],'baseline desk '+JSON.stringify(own));
  const before=await p.evaluate(()=>localStorage.getItem('tinct-lab-position'));
  for(const entry of ['/library?book='+LINKED,'/read/'+LINKED+'/']){
   await p.evaluate(()=>sessionStorage.clear());
   await p.goto('https://tinct.app'+entry,{waitUntil:'domcontentloaded'});
   const linked=await desk(),where=`${label} returning ${entry}`;
   assert.deepEqual(linked.books,[TITLE,...own.books],where+': their own books keep their order');
   assert.equal(linked.current,TITLE,where);assert.equal(linked.title,TITLE,where);assert.equal(linked.action,'Read',where);assert.equal(linked.remove,true,where+': nothing to remove');
   await p.waitForTimeout(2500);onlyLinked(await frames(p),where);
   assert.equal(await p.evaluate(()=>localStorage.getItem('tinct-lab-position')),before,where+': no reading state written');
   await p.screenshot({path:`${shots}/${label}-returning-${entry.startsWith('/read')?'read':'library'}.png`});
  }
  await p.locator('#rt-continue').click();
  await p.locator('#book-overlay').waitFor();await p.waitForFunction(a=>document.getElementById('slip-caption').textContent.includes(a),AUTHOR);
  await p.waitForTimeout(1600);await p.screenshot({path:`${shots}/${label}-returning-read-opened.png`});
  // A linked book already on the desk is simply brought into focus.
  await p.evaluate(()=>sessionStorage.clear());
  await p.goto('https://tinct.app/library?book=odyssey',{waitUntil:'domcontentloaded'});
  const onDesk=await desk();
  assert.deepEqual(onDesk.books,own.books);assert.equal(onDesk.current,'The Odyssey');assert.equal(onDesk.action,'Continue');
  assert(!(await frames(p)).some(f=>f.overlay),'a desk book link opens nothing');
  assert.deepEqual(errors,[],label+' returning: no page errors');
  console.log('BOOK_LINK_RETURNING '+JSON.stringify({label,own,onDesk}));
  await c.close();
 }
 if(live){
  // Link previews: crawlers get the book's own title and image.
  const preview=await (await fetch(`https://tinct.app/read/${LINKED}/`,{headers:{'user-agent':'Twitterbot/1.0'}})).text();
  assert.match(preview,/<meta property="og:title" content="[^"]*Wuthering Heights/);
  assert(preview.includes(`<meta property="og:image" content="https://tinct.app/brand/20260921/books/${LINKED}.jpg">`),'book preview image');
 }
}
