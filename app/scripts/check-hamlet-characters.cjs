// Real production reader and reviewed assets; no model calls or account writes.
const {chromium,webkit}=require('playwright'),fs=require('node:fs'),assert=require('node:assert/strict')
const origin=process.env.TEST_ORIGIN||'http://127.0.0.1:5195',dir=process.env.ARTIFACT_DIR||'/tmp/tinct-hamlet';fs.mkdirSync(dir,{recursive:true})
const asset=JSON.parse(fs.readFileSync('public/data/characters/hamlet.v1.json','utf8'))
const cases=[['stage',1,'francisco',0],['speaker',1,'barnardo',1],['father',1,'king-hamlet',52],['performed-role',9,'player-king'],['late',20,'horatio']]
;(async()=>{const results=[];for(const [device,engine] of [['phone',webkit],['desktop',chromium]]){const b=await engine.launch();try{for(const edition of ['original-en','modern-en']){const source=JSON.parse(fs.readFileSync(`public/data/editions/hamlet-${edition}.json`,'utf8'));for(const [label,ch,id,pi] of cases){
const e=asset.editions[edition],mention=e.mentions.find(m=>m.chapterNumber===ch&&m.characterId===id&&(pi===undefined||m.paragraphIndex===pi));assert.ok(mention,label)
const text=source.chapters.find(c=>c.number===ch).paragraphs[mention.paragraphIndex].replace(/\n/g,' ').replace(/ {2,}/g,' '),wordIndex=[...text.matchAll(/\S+/g)].findIndex(w=>w.index>=mention.startOffset&&w.index<mention.endOffset);assert.ok(wordIndex>=0)
const p=await b.newPage({viewport:device==='phone'?{width:390,height:844}:{width:1440,height:950},isMobile:device==='phone',hasTouch:device==='phone'});p.setDefaultTimeout(15000);await p.route('**/api/**',r=>r.fulfill({status:404,body:'{}'}))
await p.addInitScript(({edition,ch,paragraphIndex})=>sessionStorage.setItem('tinct:lab-reader-handoff',JSON.stringify({kind:'open-reader',bookId:'hamlet',primaryEditionKey:edition,compareEditionKey:edition==='original-en'?'modern-en':'original-en',savedPlace:{bookId:'hamlet',chapterNumber:ch,paragraphIndex,page:0}})),{edition,ch,paragraphIndex:mention.paragraphIndex})
await p.goto(origin+'/reader');await p.waitForFunction(()=>document.querySelector('.lab')?.dataset.readerReady==='true');await p.waitForTimeout(1200)
const word=p.locator(`.lab-page-wrap [data-paragraph-index="${mention.paragraphIndex}"][data-word-index="${wordIndex}"]`).first()
for(let i=0;i<8&&!await word.isVisible();i++){await p.keyboard.press('ArrowRight');await p.waitForTimeout(200)}
await word.waitFor({state:'visible'});const before=await p.getByTestId('lab-root').getAttribute('data-place')
if(device==='desktop')await word.click();else{const r=await word.boundingBox();await word.dispatchEvent('pointerdown',{pointerType:'touch',pointerId:1,clientX:r.x+3,clientY:r.y+3});await p.waitForTimeout(400);await word.dispatchEvent('pointerup',{pointerType:'touch',pointerId:1,clientX:r.x+3,clientY:r.y+3})}
await p.locator('[data-popup-mode="character"]').waitFor();const character=e.characters.find(c=>c.id===id);const snapshots=character.snapshots.filter(s=>s.availableAt.chapterNumber<ch||s.availableAt.chapterNumber===ch&&(s.availableAt.paragraphIndex<mention.paragraphIndex||s.availableAt.paragraphIndex===mention.paragraphIndex&&s.availableAt.offset<=mention.endOffset));const expected=snapshots.at(-1);assert.equal(await p.locator('.popup-character h2').innerText(),expected.name);assert.ok((await p.locator('.popup-character').innerText()).includes(expected.body));assert.equal(await p.getByTestId('lab-root').getAttribute('data-place'),before);assert.equal(await p.evaluate(()=>JSON.parse(localStorage.getItem('tinct-lab-highlights')||'[]').length),0)
await p.waitForTimeout(350);await p.screenshot({path:`${dir}/${device}-${edition}-${label}.png`});results.push({device,edition,label,chapter:ch,paragraph:mention.paragraphIndex,id,place:before});await p.close()
}}}finally{await b.close()}}
fs.writeFileSync(`${dir}/results.json`,JSON.stringify(results,null,2));console.log(`Passed ${results.length} Hamlet reader scenarios`)
})().catch(e=>{console.error(e);process.exitCode=1})
