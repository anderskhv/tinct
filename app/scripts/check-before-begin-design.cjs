const {chromium,webkit}=require('playwright');const assert=require('assert');const fs=require('fs');
const out=process.env.ARTIFACT_DIR||'../output/before-begin-design-2026-09-16';fs.mkdirSync(out,{recursive:true});
(async()=>{const results=[];for(const [name,engine,width,height] of [['phone',webkit,390,844],['desktop',chromium,1440,950]]){
const b=await engine.launch({headless:true,...(engine===chromium?{args:['--mute-audio']}: {})});const p=await b.newPage({viewport:{width,height},hasTouch:name==='phone',isMobile:name==='phone'});let requests=0;
await p.addInitScript(()=>{HTMLMediaElement.prototype.play=()=>Promise.resolve();navigator.mediaDevices.getUserMedia=()=>Promise.reject(new Error('No microphone in visual review'))});
await p.route('**/api/{chat,lab-chat,voice-session,lab-voice-session}*',r=>{requests++;return r.abort()});
p.on('pageerror',err=>{throw err});
await p.goto('http://127.0.0.1:5201/'+(name==='phone'?'lab/phone?chrome=v2&':'reader?')+'beforeBeginDraft=1');
await p.getByRole('button',{name:/Before you begin/}).waitFor();await p.waitForTimeout(1000);await p.screenshot({path:out+'/'+name+'-cover.png'});
await p.getByRole('button',{name:/Before you begin/}).click();await p.getByRole('heading',{name:'Preface',exact:true}).waitFor();await p.screenshot({path:out+'/'+name+'-preparation.png'});
await p.getByRole('button',{name:'Select your editions',exact:true}).click();
assert.equal(await p.getByLabel('Primary edition',{exact:true}).inputValue(),'modern-en');
assert.equal(await p.getByLabel('Secondary edition',{exact:true}).inputValue(),'original-en');
await p.screenshot({path:out+'/'+name+'-editions.png'});
await p.getByLabel('Primary edition',{exact:true}).selectOption('original-en');
assert.equal(await p.getByLabel('Secondary edition',{exact:true}).inputValue(),'modern-en');
await p.getByLabel('Primary edition',{exact:true}).selectOption('modern-en');
assert.equal(await p.getByLabel('Secondary edition',{exact:true}).inputValue(),'original-en');
await p.getByRole('button',{name:'Select your editions',exact:true}).click();
const para=p.locator('.lab-preface-full p').first();const text=await para.innerText();const box=await p.locator('.lab-preface-full').boundingBox();const line=await para.evaluate(e=>parseFloat(getComputedStyle(e).lineHeight));if(name==='phone') assert(Math.abs(box.height-line*3)<3); else { assert(box.height>line*3); const paragraphGap=await para.evaluate(e=>parseFloat(getComputedStyle(e).marginBottom)); assert(box.height<=line*10+paragraphGap+3); const cast=await p.locator('.lab-preface-cast').boundingBox(); assert(cast.x>box.x+box.width); }
await p.getByRole('button',{name:'Preface',exact:true}).click();assert.equal(await p.getByText(text,{exact:true}).count(),1);await p.screenshot({path:out+'/'+name+'-full-preface.png'});await p.getByRole('button',{name:'Preface',exact:true}).click();
if(name==='phone'){await p.getByRole('button',{name:'Characters',exact:true}).click();assert.equal(await p.getByText('King of Lydia, known for his immense wealth.').count(),0);}await p.getByRole('button',{name:'Croesus',exact:true}).click();await p.getByText('King of Lydia, known for his immense wealth.').waitFor();await p.screenshot({path:out+'/'+name+'-characters.png'});
assert.equal(await p.locator('.lab-preparation-frame').getByRole('button',{name:'Chat',exact:true}).count(),1);await p.getByRole('button',{name:'Chat',exact:true}).click();await p.getByRole('navigation',{name:'Questions before you begin'}).waitFor();assert((await p.getByRole('navigation',{name:'Questions before you begin'}).boundingBox()).y < 200);await p.screenshot({path:out+'/'+name+'-chat.png'});await p.getByRole('button',{name:'Help me find an angle that interests me.',exact:true}).click();assert.equal(await p.getByTestId('lab-ask-input').inputValue(),'Help me find an angle that interests me.');assert.equal(requests,0);await p.screenshot({path:out+'/'+name+'-question.png'});
results.push({name,prefaceLines:name==='phone'?3:10,noRepeatedOpening:true,characters:true,questionDraftOnly:true,generationRequests:requests});await b.close();}fs.writeFileSync(out+'/checks.json',JSON.stringify(results,null,2));console.log(results)})().catch(err=>{console.error(err);process.exit(1)});
