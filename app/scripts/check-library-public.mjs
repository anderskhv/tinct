import { chromium, webkit } from '@playwright/test'
import fs from 'node:fs'
import path from 'node:path'
import assert from 'node:assert/strict'
const root=path.resolve('dist'),out='artifacts/library-public';fs.mkdirSync(out,{recursive:true});
(async()=>{const live=process.env.LIBRARY_LIVE==='1';
for(const [engine,w,h]of[[chromium,1512,862],[webkit,393,734]]){
 const b=await engine.launch({headless:true,...(engine===chromium?{args:['--mute-audio']}:{})});
 const c=await b.newContext({serviceWorkers:'block',viewport:{width:w,height:h},...(engine===webkit?{isMobile:true,hasTouch:true}:{})}),p=await c.newPage(),errors=[];p.setDefaultTimeout(45000);p.on('pageerror',e=>errors.push(e.message));
 if(!live)await p.route('https://tinct.app/**',async r=>{const u=new URL(r.request().url());const publicEntry=['/','/index.html','/library','/library/'].includes(u.pathname);const f=publicEntry?path.join(root,'lab/library_2/index.html'):path.join(root,u.pathname.endsWith('/')?u.pathname+'index.html':u.pathname);if(fs.existsSync(f)&&fs.statSync(f).isFile())return r.fulfill({path:f,...(publicEntry?{contentType:'text/html'}:{})});return r.continue();});
 await p.goto('https://tinct.app/');await p.locator('#read-featured').waitFor();await p.waitForFunction(()=>document.querySelectorAll('.hero-dots button').length===6);assert.equal(await p.locator('#hero-title').innerText(),'Frankenstein');assert(!(await c.cookies()).some(x=>x.name==='tinct_library_preview'));assert(!(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth)),'new library fits viewport');await p.waitForFunction(()=>document.querySelector('[data-metadata-book=frankenstein]')?.textContent.includes('1818'));assert.equal(await p.locator('[data-metadata-book=frankenstein] .metadata-category').first().innerText(),'FICTION');assert.equal(await p.locator('[data-metadata-book=frankenstein] .metadata-details span').first().innerText(),'1818');assert.match(await p.locator('[data-metadata-book=frankenstein] .metadata-details span').nth(1).innerText(),/^~[0-9.]+h$/);await p.screenshot({path:out+`/${live?'live':'local'}-${engine.name()}-new.png`});
 await p.locator('#menu-toggle').click();
 await p.locator('#menu-categories summary').filter({hasText:'Browse Philosophy'}).click();
 await p.locator('#menu-categories button').filter({hasText:'Stoic'}).click();
 assert.match(await p.locator('#collection-title').innerText(),/Stoic/);
 assert(await p.locator('#collection-books').innerText().then(t=>t.includes('Meditations')));
 await p.locator('#collection-back').click();
 await p.locator('#menu-toggle').click();
 await p.locator('#menu-periods summary').filter({hasText:'Browse Antiquity'}).click();
 await p.locator('#menu-periods button').filter({hasText:'Earliest works'}).click();
 assert.match(await p.locator('#collection-title').innerText(),/before 1000 BC/);
 assert(!(await p.locator('#collection-books').innerText()).includes('Meditations'));
 await p.waitForFunction(()=>[...document.querySelectorAll('#collection-books canvas[data-book]')].every(c=>c.dataset.painted==='true'));
 await p.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
 await p.screenshot({path:out+'/browse-'+engine.name()+'.png'});
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
 await p.locator('.reading-table.is-ready').waitFor({timeout:15000}).catch(async e=>{console.log({url:p.url(),errors,html:await p.locator('html').getAttribute('class'),tables:await p.locator('.reading-table').count(),content:(await p.locator('body').innerText()).slice(0,900),boot:await p.evaluate(()=>window.__library2Boot)});await p.screenshot({path:out+'/debug.png'});throw e;});await p.waitForTimeout(700);assert.equal(await p.locator('#scene').evaluate(n=>getComputedStyle(n).opacity),'1','composed room revealed');assert(!(await p.locator('html').evaluate(n=>n.classList.contains('returning-scene-pending'))));assert.match(await p.locator('html').getAttribute('data-scene'),/^table-/);const cta=await p.locator('#rt-continue').boundingBox();assert(cta.y+cta.height<=h,JSON.stringify(cta));assert.equal(await p.locator('#rt-book-metadata .metadata-category').innerText(),'FICTION');assert.equal(await p.locator('#rt-book-metadata .metadata-details span').first().innerText(),'1818');assert.match(await p.locator('#rt-book-metadata .metadata-details span').nth(1).innerText(),/ left$/);const remove=await p.locator('#rt-remove').boundingBox();assert(remove.x>=0&&remove.x+remove.width<=w&&remove.y>=0&&remove.y+remove.height<h,JSON.stringify(remove));const face=await p.locator('.rt-b.is-current .rt-front').boundingBox();assert(Math.abs(remove.y+remove.height/2-face.y)<3,JSON.stringify({remove,face}));await p.screenshot({path:out+`/${live?'live':'local'}-${engine.name()}-returning.png`});
 await p.route('**/reader',r=>r.fulfill({contentType:'text/html',body:'<!doctype html><title>Handoff</title>'}));await p.locator('#rt-continue').click();await p.waitForURL('**/reader');const handoff=await p.evaluate(()=>JSON.parse(sessionStorage.getItem('tinct:lab-reader-handoff')));assert.deepEqual(handoff.savedPlace,{bookId:'frankenstein',chapterNumber:7,page:4,paragraphIndex:11,wordIndex:23});
 // Removing the last book hides only its shelf entry, never its saved place.
 await p.goto('https://tinct.app/library');await p.locator('.reading-table.is-ready').waitFor();
 const before=await p.evaluate(()=>JSON.parse(localStorage.getItem('tinct-lab-position')));
 await p.locator('#rt-remove').click();await p.locator('#rt-remove-dialog[open]').waitFor();
 await p.locator('#rt-remove-cancel').click();assert.equal(await p.locator('.rt-b').count(),1);
 await p.locator('#rt-remove').click();await p.locator('#rt-remove-confirm').click();
 await p.waitForFunction(()=>!document.documentElement.classList.contains('returning'));
 const after=await p.evaluate(()=>JSON.parse(localStorage.getItem('tinct-lab-position')));
 assert.deepEqual(after.books,before.books);assert.deepEqual(after.finished,before.finished);
 assert.equal(after.lastSettledBookId,before.lastSettledBookId);assert.equal(after.lastSettledAt,before.lastSettledAt);assert(after.hidden.frankenstein>=before.books.frankenstein.updatedAt);
 await p.reload();await p.locator('#read-featured').waitFor();
 await p.waitForFunction(()=>window.__library2Reading&&window.__tinctLibraryTwoReading);
 assert.equal(await p.evaluate(()=>window.__library2Reading.reading.length),0);
 assert.equal(await p.evaluate(()=>window.__tinctLibraryTwoReading.readerDestination('frankenstein',null)),'/reader');
 assert.deepEqual(await p.evaluate(()=>JSON.parse(sessionStorage.getItem('tinct:lab-reader-handoff')).savedPlace),handoff.savedPlace);
 // Table removal retains the book on My shelf; shelf removal is explicit and durable.
 await p.locator('#menu-toggle').click();
 await p.locator('[data-collection="saved"]').click();
 assert.equal(await p.locator('#collection-title').innerText(),'My shelf');
 const shelfRemove=p.locator('#collection-books .save-toggle[data-book="frankenstein"]');
 await shelfRemove.waitFor();assert.equal(await shelfRemove.innerText(),'×');
 await p.evaluate(()=>dispatchEvent(new CustomEvent('library2:saved',{detail:['frankenstein']})));
 assert.equal(await shelfRemove.innerText(),'×','saved refresh must not repaint the shelf remove as a plus/check');
 await p.screenshot({path:out+'/my-shelf-'+engine.name()+'.png'});
 await shelfRemove.click();
 await p.waitForFunction(()=>!document.querySelector('#collection-books .save-toggle[data-book="frankenstein"]'));
 assert.deepEqual(await p.evaluate(()=>JSON.parse(localStorage.getItem('tinct-lab-position')).books),before.books);
 await p.reload();await p.waitForFunction(()=>window.__library2Reading&&window.__tinctLibraryTwoReading);
 await p.locator('#menu-toggle').click();await p.locator('[data-collection="saved"]').click();
 assert.equal(await p.locator('#collection-books .save-toggle[data-book="frankenstein"]').count(),0,'removed membership survives a reload despite retained progress');
 await p.locator('#collection-back').click();
 // The bare-home shortcut uses a same-account fixture; the existing reader remains the position resolver.
 await p.evaluate(()=>{const s=JSON.parse(localStorage.getItem('tinct-lab-position'));s.owner='public-check';localStorage.setItem('tinct-lab-position',JSON.stringify(s));localStorage.setItem('sb-public-check-auth-token',JSON.stringify({user:{id:'public-check'}}));});
 await p.goto('https://tinct.app/');await p.waitForURL('**/reader');assert.deepEqual(errors,[]);console.log({engine:engine.name(),live,publicNew:true,back:true,returningTable:true,exactResume:true,homeResume:true,metadata:true,removePreservesPlace:true,errors});await c.close();await b.close();
}})().catch(e=>{console.error(e);process.exit(1)});

