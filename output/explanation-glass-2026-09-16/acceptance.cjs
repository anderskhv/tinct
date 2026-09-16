const path=require('path');
const root=path.resolve(__dirname,'../..');
const {chromium,webkit}=require(root+'/app/node_modules/playwright');
const fs=require('fs'),assert=require('assert/strict');
const out=__dirname;
const base=process.env.TINCT_TEST_URL||'http://127.0.0.1:4197';
(async()=>{let results=[];for(const [engine,name] of [[chromium,'chromium-touch'],[webkit,'webkit-phone']]){
const browser=await engine.launch({headless:true,...(engine===chromium?{args:['--mute-audio']}: {})});
const ctx=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true,serviceWorkers:'block',permissions:[],colorScheme:'dark'});
await ctx.addInitScript(()=>{HTMLMediaElement.prototype.play=function(){this.muted=true;return Promise.resolve()};localStorage.setItem('tinct-lab-prefs',JSON.stringify({version:2,shared:{primaryEdition:'web-en',compareEdition:'kjv-en',compareOpen:true,theme:'dark'},phone:{},desktop:{},seenOnce:{}}));sessionStorage.setItem('tinct:lab-reader-handoff',JSON.stringify({kind:'open-reader',bookId:'bible',primaryEditionKey:'web-en',savedPlace:{bookId:'bible',chapterNumber:442,paragraphIndex:0,page:0}}));});
const p=await ctx.newPage(), errors=[];p.on('pageerror',e=>errors.push(e.message));
if(base.includes('127.0.0.1'))await p.route('**/lab/phone*',r=>r.fulfill({contentType:'text/html',body:fs.readFileSync(root+'/app/dist/app.html','utf8')}));
let release;await p.route(/\/api\/(lab-)?chat$/,async r=>{await new Promise(resolve=>release=resolve);await r.fulfill({contentType:'application/json',body:JSON.stringify({content:[{type:'text',text:'**First thought.** '+ 'A short explanation of the passage. '.repeat(4)+'\n\n**Second thought.** '+ 'Further context for the passage. '.repeat(5)+'\n\n***Third thought.*** '+ 'More to read below. '.repeat(10)}]})});});
await p.goto(base+'/lab/phone?chrome=v2');const words=p.locator('[data-testid="lab-reading-stage"] [data-testid="lab-word"]');await words.nth(15).waitFor({timeout:30000});
await p.waitForFunction(()=>document.fonts.status==='loaded');const a=await words.nth(2).boundingBox(),z=await words.nth(13).boundingBox();
const before=await p.evaluate(()=>({text:document.querySelector('[data-testid="lab-reading-stage"]').textContent,compare:document.querySelector('[data-testid="lab-root"]').getAttribute('data-compare-active'),scroll:[scrollX,scrollY,document.querySelector('.lab-passage').scrollTop]}));
const cdp=engine===chromium?await ctx.newCDPSession(p):null;
const start={x:a.x+a.width/2,y:a.y+a.height/2};
if(cdp)await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[start]});
else await words.nth(2).dispatchEvent('pointerdown',{pointerId:1,pointerType:'touch',button:0,isPrimary:true,clientX:start.x,clientY:start.y});
await p.waitForFunction(()=>!!document.querySelector('.lab-hearing-word.is-selecting'));
const nativePrevented=await words.nth(2).evaluate(e=>{const touch=new Event('touchmove',{bubbles:true,cancelable:true});Object.defineProperty(touch,'touches',{value:[{}]});e.dispatchEvent(touch);const selection=new Event('selectstart',{bubbles:true,cancelable:true});e.dispatchEvent(selection);return touch.defaultPrevented&&selection.defaultPrevented});assert(nativePrevented);
for(const pos of [{x:388,y:start.y},{x:2,y:start.y},{x:z.x+z.width/2,y:z.y+z.height/2}]){
if(cdp)await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[pos]});else await p.getByTestId('lab-book').dispatchEvent('pointermove',{pointerId:1,pointerType:'touch',isPrimary:true,clientX:pos.x,clientY:pos.y});}
if(cdp)await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});else await p.getByTestId('lab-book').dispatchEvent('pointerup',{pointerId:1,pointerType:'touch',isPrimary:true,clientX:z.x+z.width/2,clientY:z.y+z.height/2});
await p.getByRole('button',{name:'Explain',exact:true}).waitFor();
const after=await p.evaluate(()=>({text:document.querySelector('[data-testid="lab-reading-stage"]').textContent,compare:document.querySelector('[data-testid="lab-root"]').getAttribute('data-compare-active'),scroll:[scrollX,scrollY,document.querySelector('.lab-passage').scrollTop]}));assert.deepEqual(after,before);assert.equal(await p.evaluate(()=>getSelection().toString()),'');
const ranges=await p.evaluate(()=>[...CSS.highlights.values()].flatMap(h=>[...h].map(r=>r.toString())).filter(Boolean));assert(ranges.join(' ').length>10);
await p.screenshot({path:out+'/'+name+'-selection.png'});
await p.getByRole('button',{name:'Explain',exact:true}).click();await p.getByText('Loading…',{exact:true}).waitFor();
await p.locator('.selection-popup').evaluate(async e=>{await Promise.all(e.getAnimations({subtree:true}).map(a=>a.finished.catch(()=>{})))});
const finish=await p.locator('.selection-popup').evaluate(e=>({background:getComputedStyle(e).backgroundColor,blur:getComputedStyle(e).backdropFilter}));console.log(finish);const loading=await p.locator('.selection-popup').boundingBox();await p.screenshot({path:out+'/'+name+'-loading.png'});release();await p.locator('.lab-contextual-explain strong em').waitFor();
await p.waitForTimeout(100);const ready=await p.locator('.selection-popup').boundingBox();assert.deepEqual(ready,loading);
const chat=await p.getByRole('button',{name:'Chat about this explanation'}).boundingBox(),talk=await p.getByRole('button',{name:'Talk about this explanation'}).boundingBox();assert.equal(chat.y,talk.y);assert(chat.x+chat.width<=talk.x+1);
const scroll=await p.locator('.lab-contextual-explain-scroll').evaluate(e=>({height:e.clientHeight,content:e.scrollHeight}));assert(scroll.content>scroll.height);
await p.screenshot({path:out+'/'+name+'-ready.png'});
assert(scroll.height >= 128 && scroll.height <= 130);
await p.getByRole('button',{name:'Expand explanation',exact:true}).click();
const expanded=await p.locator('.selection-popup').boundingBox();assert(expanded.width>360&&expanded.height>790);assert(expanded.y<=13);
await p.screenshot({path:out+'/'+name+'-expanded.png'});
await p.getByRole('button',{name:'Collapse explanation',exact:true}).click();
assert.deepEqual(await p.locator('.selection-popup').boundingBox(),ready);
assert.deepEqual(errors,[]);
results.push({name,bundle:await p.locator('script[src*="assets/index-"]').getAttribute('src'),nativePrevented,readerUnchanged:true,nativeSelectionEmpty:true,ranges,loading,ready,expanded,chat,talk,scroll,errors});
await ctx.close();await browser.close();}
fs.writeFileSync(out+'/'+(base.includes('127.0.0.1')?'local':'production')+'-stability.json',JSON.stringify(results,null,2));console.log(JSON.stringify(results,null,2));})().catch(e=>{console.error(e);process.exit(1)});
