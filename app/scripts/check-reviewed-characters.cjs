// Real production reader and reviewed assets; no model calls or account writes.
const {chromium,webkit}=require('playwright'),fs=require('node:fs'),assert=require('node:assert/strict')
const origin=process.env.TEST_ORIGIN||'http://127.0.0.1:5197',dir=process.env.ARTIFACT_DIR||'/tmp/tinct-hamlet';fs.mkdirSync(dir,{recursive:true})
const book=process.env.TEST_BOOK||'hamlet'
const asset=JSON.parse(fs.readFileSync(`public/data/characters/${book}.v1.json`,'utf8'))
const reviewedCases = {
  'pride-and-prejudice': [['darcy',3,'darcy',5],['lady-catherine',13,'lady-catherine',14],['fitzwilliam',30,'colonel-fitzwilliam',7]],
  'us-founding-documents': [['king',1,'george-iii',2],['divine-providence',1,'god',32],['dating-formula',2,'jesus',92]],
  'kant-groundwork': [['wolf',1,'wolff'],['sulzer',3,'sulzer'],['hutcheson',3,'hutcheson'],['gospel-epithet',3,'jesus']],
  'descartes-meditations': [['leo',1,'leo'],['apollonius',1,'apollonius'],['demon-first',4,'demon',11],['demon-later',5,'demon',2]],
  crito: [['socrates',1,'socrates'],['keeper',1,'keeper'],['laws',3,'laws']],
  apology: [['meletus',1,'meletus'],['critobulus',1,'critobulus',72],['ariston',1,'ariston',73],['odysseus',3,'odysseus']],
  'the-manual': [['socrates',5,'socrates'],['apollo',32,'apollo'],['zeus',52,'zeus'],['caesar',29,'caesar']],
  'the-art-of-war': [['sun-tzu',1,'sun-tzu'],['yellow-emperor',9,'yellow-emperor'],['yi-zhi',13,'yi-zhi'],['lu-ya',13,'lu-ya'],['chu',11,'chu']],
}
const extraBooks = ['measure-for-measure','henry-v','winters-tale','cymbeline','coriolanus','antony-and-cleopatra','richard-iii','henry-iv-part-2','merry-wives-of-windsor']
const editionAsset = asset.editions['original-en']
const point = p => [p.chapterNumber,p.paragraphIndex,p.offset ?? p.endOffset]
const cmp = (a,b) => { const x=point(a),y=point(b); return x[0]-y[0]||x[1]-y[1]||x[2]-y[2] }
if (extraBooks.includes(book)) {
 const first = editionAsset.mentions[0]
 const central = editionAsset.characters.find(c=>c.snapshots.length>1)
 const gate = central.snapshots[1].availableAt
 const earlier = editionAsset.mentions.filter(m=>m.characterId===central.id&&cmp(m,gate)<0).at(-1)
 const later = editionAsset.mentions.find(m=>m.characterId===central.id&&cmp(m,gate)>=0)
 reviewedCases[book] = [["first",first.chapterNumber,first.characterId,first.paragraphIndex],...[['before-gate',earlier],['after-gate',later]].filter(([,m])=>m).map(([label,m])=>[label,m.chapterNumber,m.characterId,m.paragraphIndex])]
 const special = { 'measure-for-measure':[12,29,'claudio'], 'henry-v':[21,37,'guichard-dauphin'], 'winters-tale':[14,7,'second-gentleman'], coriolanus:[13,97,'ancus-martius'], cymbeline:[13,11,'julius-caesar'], 'antony-and-cleopatra':[5,26,'julius-caesar'], 'richard-iii':[8,0,'archbishop'], 'henry-iv-part-2':[3,7,'lord-bardolph'], 'merry-wives-of-windsor':[1,18,'anne'] }[book]
 if (special) { const [ch,pi,id]=special; const m=editionAsset.mentions.find(m=>m.chapterNumber===ch&&m.paragraphIndex===pi&&m.characterId===id); assert.ok(m,book+': reviewed namesake fixture'); reviewedCases[book].push(['namesake',ch,id,pi]) }
}
const cases=reviewedCases[book];assert.ok(cases,`No reviewed browser cases for ${book}`)
;(async()=>{const results=[];for(const [device,engine] of [['phone',webkit],['desktop',chromium]]){const b=await engine.launch();try{for(const edition of ['original-en','modern-en']){const source=JSON.parse(fs.readFileSync(`public/data/editions/${book}-${edition}.json`,'utf8'));for(const [label,ch,id,pi] of cases){
if(process.env.TEST_CASE&&`${device}-${edition}-${label}`!==process.env.TEST_CASE)continue

const e=asset.editions[edition];if(edition==='modern-en'&&['caesar','chu'].includes(id)&&!e.characters.some(c=>c.id===id)){results.push({device,edition,label,omitted:true});continue}const mention=e.mentions.find(m=>m.chapterNumber===ch&&m.characterId===id&&(label!=='new-cawdor'||m.resolution==='reviewed-title-transfer')&&(pi===undefined||m.paragraphIndex===pi));assert.ok(mention,label)
const text=source.chapters.find(c=>c.number===ch).paragraphs[mention.paragraphIndex].replace(/\n/g,' ').replace(/ {2,}/g,' '),wordIndex=[...text.matchAll(/\S+/g)].findIndex(w=>w.index<mention.endOffset&&w.index+w[0].length>mention.startOffset);assert.ok(wordIndex>=0)
const p=await b.newPage({viewport:device==='phone'?{width:390,height:844}:{width:1440,height:950},isMobile:device==='phone',hasTouch:device==='phone'});p.setDefaultTimeout(15000);
const diagnostics=[];p.on('pageerror',e=>diagnostics.push({error:e.message}));await p.context().tracing.start({screenshots:true,snapshots:true,sources:true});
const verifiedResponses=[];const responseChecks=[];
p.on('response',response=>{const url=new URL(response.url());const paths=[`/data/editions/${book}-${edition}.json`,`/data/characters/${book}.v1.json`];if(paths.includes(url.pathname))responseChecks.push((async()=>{assert.equal(response.status(),200);assert.deepEqual(await response.body(),fs.readFileSync('public'+url.pathname));verifiedResponses.push(url.pathname+url.search)})())});
if(process.env.READER_BUILT==='1')await p.route('**/*',async r=>{const url=new URL(r.request().url());if(url.origin===origin){const name=['/reader','/lab/phone','/lab/desktop'].includes(url.pathname)?'/app.html':url.pathname;const file=require('node:path').resolve('dist','.'+name);if(file.startsWith(require('node:path').resolve('dist')+'/')){if(fs.existsSync(file)&&fs.statSync(file).isFile())return r.fulfill({path:file});return r.abort()}}return r.continue()});
await p.route('**/api/**',r=>r.fulfill({status:404,body:'{}'}))
await p.addInitScript(({book,edition,ch,paragraphIndex})=>sessionStorage.setItem('tinct:lab-reader-handoff',JSON.stringify({kind:'open-reader',bookId:book,primaryEditionKey:edition,compareEditionKey:edition==='original-en'?'modern-en':'original-en',savedPlace:{bookId:book,chapterNumber:ch,paragraphIndex,page:0}})),{book,edition,ch,paragraphIndex:mention.paragraphIndex})
await p.goto(origin+'/reader');await p.waitForFunction(()=>document.querySelector('.lab')?.dataset.readerReady==='true');await p.waitForTimeout(1200)
const word=p.locator(`.lab-page-wrap [data-paragraph-index="${mention.paragraphIndex}"][data-word-index="${wordIndex}"]`).first()
const onPage=async()=>{if(!await word.count())return false;const r=await word.boundingBox(),v=p.viewportSize();return r&&r.x>=0&&r.y>=0&&r.x+r.width<=v.width&&r.y+r.height<=v.height};
for(let i=0;i<20&&!await onPage();i++){await p.keyboard.press('ArrowRight');await p.waitForTimeout(200)}
assert.ok(await onPage(),`${device}-${edition}-${label}: target must be on the current page`);const before=await p.getByTestId('lab-root').getAttribute('data-place')
if(device==='desktop')await word.click();else{const state=await word.evaluate(async node=>{const box=node.getBoundingClientRect();const article=node.closest('article');const events=[];const observe=e=>events.push({type:e.type,pointerType:e.pointerType,button:e.button,target:e.target.textContent?.slice(0,40),prevented:e.defaultPrevented});article.addEventListener('pointerdown',observe);article.addEventListener('pointerup',observe);const init={pointerType:'touch',pointerId:1,button:0,buttons:1,isPrimary:true,bubbles:true,cancelable:true,clientX:box.x+box.width/2,clientY:box.y+box.height/2};node.dispatchEvent(new PointerEvent('pointerdown',init));await new Promise(resolve=>setTimeout(resolve,400));article.dispatchEvent(new PointerEvent('pointerup',{...init,buttons:0}));article.removeEventListener('pointerdown',observe);article.removeEventListener('pointerup',observe);return events});diagnostics.push({touch:state})}
try{await p.locator('[data-popup-mode="character"]').waitFor()}catch(error){await p.screenshot({path:`${dir}/${device}-${edition}-${label}-failed.png`});await p.context().tracing.stop({path:`${dir}/${device}-${edition}-${label}-trace.zip`});console.error({diagnostics,verifiedResponses,device,edition,label,mention,wordIndex,wordBox:await word.boundingBox(),popup:await p.locator('.selection-popup').textContent().catch(()=>null)});throw error};const character=e.characters.find(c=>c.id===id);const snapshots=character.snapshots.filter(s=>s.availableAt.chapterNumber<ch||s.availableAt.chapterNumber===ch&&(s.availableAt.paragraphIndex<mention.paragraphIndex||s.availableAt.paragraphIndex===mention.paragraphIndex&&s.availableAt.offset<=mention.endOffset));const expected=snapshots.at(-1);assert.equal(await p.locator('.popup-character h2').innerText(),expected.name);assert.ok((await p.locator('.popup-character').innerText()).includes(expected.body));assert.equal(await p.getByTestId('lab-root').getAttribute('data-place'),before);assert.equal(await p.evaluate(()=>JSON.parse(localStorage.getItem('tinct-lab-highlights')||'[]').length),0)
await p.waitForTimeout(350);await p.screenshot({path:`${dir}/${device}-${edition}-${label}.png`});await Promise.all(responseChecks);assert.ok(verifiedResponses.some(x=>x.startsWith(`/data/editions/${book}-${edition}.json?`)),'Reader must load versioned accepted text');assert.ok(verifiedResponses.some(x=>x.startsWith(`/data/characters/${book}.v1.json?`)),'Reader must load versioned character package');await p.context().tracing.stop();results.push({device,edition,label,chapter:ch,paragraph:mention.paragraphIndex,id,place:before,verifiedResponses});await p.close()
}}}finally{await b.close()}}
fs.writeFileSync(`${dir}/results.json`,JSON.stringify(results,null,2));console.log(`Passed ${results.length} ${book} reader scenarios`)
})().catch(e=>{console.error(e);process.exitCode=1})
