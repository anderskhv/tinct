// Actual book data and DOM; isolated storage, no account writes or model calls.
const {chromium,webkit}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
const origin=process.env.TEST_ORIGIN||'http://127.0.0.1:5192',dir=process.env.ARTIFACT_DIR||'/tmp/tinct-prefaces';fs.mkdirSync(dir,{recursive:true});
async function location(p){return p.getByTestId('lab-root').evaluate(e=>({book:e.dataset.bookId,chapter:e.dataset.chapter,place:e.dataset.place}))}
(async()=>{const results=[];for(const conf of [{name:'phone',engine:webkit,width:390,height:844},{name:'small',engine:webkit,width:360,height:640},{name:'desktop',engine:chromium,width:1440,height:950}]){
 const b=await conf.engine.launch();try{for(const id of ['odyssey','the-awakening','niels-lyhne','war-and-peace','symposium','bible']){
 const p=await b.newPage({viewport:{width:conf.width,height:conf.height},isMobile:conf.width<800,hasTouch:conf.width<800});const calls=[];
 await p.route('**/api/**',r=>{calls.push(r.request().url());return r.fulfill({status:404,body:'{}'})});
 await p.addInitScript(({id,large})=>{if(!sessionStorage.getItem('preface-seeded')){sessionStorage.setItem('preface-seeded','1');sessionStorage.setItem('tinct:lab-reader-handoff',JSON.stringify({kind:'open-reader',bookId:id,primaryEditionKey:id==='bible'?'kjv-en':'original-en',compareEditionKey:id==='bible'?'web-en':'modern-en'}))}if(large)localStorage.setItem('tinct-lab-prefs',JSON.stringify({version:2,shared:{},phone:{fontSize:1.8,theme:'dark'},desktop:{fontSize:1.8,theme:'dark'}}))}, {id,large:conf.name==='small'});
 await p.goto(origin+'/reader');const panel=p.getByTestId('lab-book-preface');await panel.waitFor();
 assert.equal(await panel.getAttribute('data-view'),'cover');await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(500);
 const before=await location(p);await panel.getByRole('button',{name:'Read preface'}).click();await panel.getByRole('heading',{name:'Before you begin'}).waitFor();
 assert.equal(await panel.getAttribute('data-view'),'preface');await p.keyboard.press('ArrowRight');await p.keyboard.press('Space');
 assert.deepEqual(await location(p),before,'Preface keys must not turn source pages');
 await p.screenshot({path:`${dir}/${conf.name}-${id}-preface.png`});
 await p.goBack();await p.waitForFunction(()=>document.querySelector('[data-testid="lab-book-preface"]')?.dataset.view==='cover');
 await panel.getByRole('button',{name:'Read preface'}).click();await panel.getByRole('button',{name:'Begin reading',exact:true}).click();await panel.waitFor({state:'hidden'});
 await p.waitForFunction(()=>document.querySelector('.lab')?.dataset.readerReady==='true'&&document.querySelector('.lab-page-wrap > .lab-passage [data-testid="lab-word"]'));
 // Open the cover from a later passage. Preserve exact place and Compare mode.
 await p.keyboard.press('ArrowRight');await p.waitForTimeout(200);const saved=await location(p);
 if(await p.getByTestId('lab-root').getAttribute('data-reader-controls')==='hidden') await p.locator('.lab-header').click({position:{x:20,y:20}});
 await p.getByTestId('lab-header-chapter').click();await p.getByRole('button',{name:'Cover and preface'}).click();await panel.waitFor();
 await panel.locator('img').evaluate(image=>image.decode());
 assert.ok(await panel.locator('img').evaluate(image=>image.naturalWidth>0));
 await p.screenshot({path:`${dir}/${conf.name}-${id}-cover.png`});
 await panel.getByRole('button',{name:'Read preface'}).click();await panel.getByRole('heading',{name:'Before you begin'}).waitFor();
 assert.deepEqual(await location(p),saved);
 await panel.getByRole('button',{name:'Continue reading',exact:true}).click();await panel.waitFor({state:'hidden'});assert.deepEqual(await location(p),saved);
 await p.reload();await p.waitForFunction(()=>document.querySelector('.lab')?.dataset.readerReady==='true');assert.equal(await panel.count(),0,'Reload must not auto-open preface');assert.deepEqual(await location(p),saved);
 assert.equal(calls.filter(url=>/\/api\/(chat|lab-chat|voice|realtime)/.test(url)).length,0);
 results.push({name:conf.name,id,saved});await p.close();
 }}finally{await b.close()}}
 fs.writeFileSync(`${dir}/results.json`,JSON.stringify(results,null,2));console.log(JSON.stringify(results,null,2));
})().catch(e=>{console.error(e);process.exit(1)});
