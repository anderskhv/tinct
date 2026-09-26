const {chromium,webkit}=require('playwright'),fs=require('node:fs'),path=require('node:path');
const out='artifacts/reader-spread';fs.mkdirSync(out,{recursive:true});
(async()=>{for(const engine of [chromium,webkit]){
const browser=await engine.launch({args:engine===chromium?['--mute-audio']:[]});
for(const c of [{book:'bible',edition:'web-en',chapter:917},{book:'bible',edition:'web-en',chapter:918},{book:'to-the-lighthouse',edition:'original-en',chapter:1}]){
const context=await browser.newContext({viewport:{width:1450,height:813}});
await context.route('**/*',r=>{const u=new URL(r.request().url()); if(u.origin!=='https://tinct.app')return r.abort(); const f=path.resolve('dist','.'+(u.pathname==='/reader'?'/app.html':u.pathname));return f.startsWith(path.resolve('dist')+'/')&&fs.existsSync(f)&&fs.statSync(f).isFile()?r.fulfill({path:f}):r.fulfill({status:404,body:'{}'});});
await context.addInitScript(c=>{HTMLMediaElement.prototype.play=async()=>{};if(sessionStorage.getItem('seed'))return;sessionStorage.setItem('seed','1');localStorage.setItem('tinct-lab-prefs',JSON.stringify({fontFamily:'garamond',fontSize:2.2,theme:'dark',compareOpen:false}));sessionStorage.setItem('tinct:lab-reader-handoff',JSON.stringify({kind:'open-reader',bookId:c.book,primaryEditionKey:c.edition,savedPlace:{bookId:c.book,chapterNumber:c.chapter,paragraphIndex:0,wordIndex:0,page:0}}));},c);
const p=await context.newPage();p.setDefaultTimeout(30000);
await p.goto('https://tinct.app/reader');await p.waitForFunction(()=>document.querySelector('.lab')?.dataset.readerReady==='true');await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(1000);
const states=[];
for(let i=0;i<12;i++){
const s=await p.evaluate(()=>{const a=document.querySelector('.lab-page-wrap>.lab-passage');return {chapter:document.querySelector('.lab')?.dataset.chapter,place:document.querySelector('.lab')?.dataset.place,columns:[...a.querySelectorAll('.lab-book-col')].map(col=>({text:col.innerText,rect:col.getBoundingClientRect().toJSON(),words:[...col.querySelectorAll('[data-testid="lab-word"]')].map(w=>({text:w.textContent,p:w.dataset.paragraphIndex,w:w.dataset.wordIndex,rect:w.getBoundingClientRect().toJSON()}))})),end:a.querySelector('.lab-chapter-end')?.getBoundingClientRect().toJSON(),preview:!!a.querySelector('.lab-next-chapter-opening')};});
states.push(s);
await p.screenshot({path:out+'/'+engine.name()+'-'+c.book+'-'+c.chapter+'-'+i+'.png'});
if(Number(s.chapter)!==c.chapter)break;await p.keyboard.press('ArrowRight');await p.waitForTimeout(600);
}
fs.writeFileSync(out+'/'+engine.name()+'-'+c.book+'-'+c.chapter+'.json',JSON.stringify(states,null,2));
console.log(engine.name(),c,states.map(s=>({chapter:s.chapter,place:s.place,preview:s.preview,ends:s.columns.map(c=>c.text.slice(-90))})));
await context.close();
}await browser.close();}})().catch(e=>{console.error(e);process.exit(1)});
