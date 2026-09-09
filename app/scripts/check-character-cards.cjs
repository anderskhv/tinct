const {chromium,webkit}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
const origin=process.env.TEST_ORIGIN||'http://127.0.0.1:5198',dir=process.env.ARTIFACT_DIR||'/tmp/tinct-character-cards';fs.mkdirSync(dir,{recursive:true});
async function place(p){return p.getByTestId('lab-root').evaluate(e=>({book:e.dataset.bookId,chapter:e.dataset.chapter,place:e.dataset.place,edition:e.dataset.readerEdition,compare:e.dataset.compareActive}))}
async function press(word){await word.dispatchEvent('pointerdown',{pointerType:'touch',pointerId:1,clientX:(await word.boundingBox()).x+4,clientY:(await word.boundingBox()).y+4,bubbles:true});await word.page().waitForTimeout(350);await word.dispatchEvent('pointerup',{pointerType:'touch',pointerId:1,clientX:(await word.boundingBox()).x+4,clientY:(await word.boundingBox()).y+4,bubbles:true})}
(async()=>{const results=[];for(const conf of [{name:'phone',engine:webkit,width:390,height:844},{name:'desktop',engine:chromium,width:1440,height:950}]){
 const b=await conf.engine.launch();try{for(const edition of ['original-en','modern-en']){
 const p=await b.newPage({viewport:{width:conf.width,height:conf.height},isMobile:conf.width<800,hasTouch:true});const errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.route('**/api/**',r=>r.fulfill({status:404,body:'{}'}));
 await p.addInitScript(({edition})=>{sessionStorage.setItem('tinct:lab-reader-handoff',JSON.stringify({kind:'open-reader',bookId:'the-awakening',primaryEditionKey:edition,compareEditionKey:edition==='original-en'?'modern-en':'original-en'}))},{edition});
 await p.goto(origin+'/reader');const panel=p.getByTestId('lab-book-preface');await panel.waitFor();await panel.getByRole('button',{name:'Begin reading',exact:true}).first().click();
 await p.waitForFunction(()=>document.querySelector('.lab')?.dataset.readerReady==='true');await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(1300);
 const words=p.locator('.lab-page-wrap [data-testid="lab-word"]');
 console.log(conf.name,edition,(await words.allTextContents()).join(' ').slice(0,600));
 const word=words.filter({hasText:'Pontellier'}).first();
 // Opening mention is shortly after the first page on phones.
 for(let i=0;i<4 && !await word.count();i++){await p.keyboard.press('ArrowRight');await p.waitForTimeout(250)}
 const before=await place(p);await press(word);await p.locator('[data-popup-mode="character"]').waitFor();
 assert.match(await p.locator('.popup-character h2').innerText(),/Pontellier/);
 assert.deepEqual(await place(p),before);await p.waitForTimeout(300);await p.screenshot({path:`${dir}/${conf.name}-${edition}-card.png`});
 await p.getByRole('button',{name:'Character gallery',exact:true}).click();assert.equal(await p.locator('.popup-character-gallery').getByText('Alcée Arobin').count(),0);assert.deepEqual(await place(p),before);
 await p.keyboard.press('Tab');assert.ok(await p.locator('.selection-popup').evaluate(e=>e.contains(document.activeElement)));
 await p.keyboard.press('Escape');assert.equal(await p.locator('.selection-popup').count(),0);assert.deepEqual(await place(p),before);
 assert.equal(errors.length,0,errors.join('\n'));results.push({name:conf.name,edition,before});await p.close();
 }}finally{await b.close()}}
 fs.writeFileSync(`${dir}/results.json`,JSON.stringify(results,null,2));console.log(JSON.stringify(results,null,2));
})().catch(e=>{console.error(e);process.exit(1)});
