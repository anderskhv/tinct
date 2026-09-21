const {chromium}=require('../../app/node_modules/playwright');
const fs=require('node:fs'),path=require('node:path');
const dir='artifacts/bella-focused-candide-browser-2026-09-21';fs.mkdirSync(dir,{recursive:true});
const assert=(ok,msg)=>{if(!ok)throw Error(msg)};
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--mute-audio']});
 const results=[];
 try{
 for(const width of [390,1440])for(const target of [{book:'candide',chapter:26}]){
  const context=await browser.newContext({viewport:{width,height:width===390?844:900},permissions:[]});
  const page=await context.newPage();const row={...target,width,http:[],requestFailures:[],pageErrors:[]};
  page.on('pageerror',e=>row.pageErrors.push(String(e)));
  page.on('response',r=>{if(r.url().includes('/api/audio'))row.http.push({url:r.url(),status:r.status(),type:r.headers()['content-type']})});
  page.on('requestfailed',r=>{if(r.url().includes('/api/audio'))row.requestFailures.push({url:r.url(),error:r.failure()})});
  try{
   await page.addInitScript(({book,chapter})=>{
    const Native=window.Audio;window.__bellaAudio=[];
    window.Audio=function(...args){const a=new Native(...args);a.muted=true;a.volume=0;window.__bellaAudio.push(a);return a};
    localStorage.setItem('tinct-lab-prefs',JSON.stringify({primaryEdition:'original-en',audioEdition:'original-en',audioFollowsPrimary:true,compareOpen:false}));
    sessionStorage.setItem('tinct:lab-reader-handoff',JSON.stringify({kind:'open-reader',bookId:book,primaryEditionKey:'original-en',audioEditionKey:'original-en',savedPlace:{bookId:book,chapterNumber:chapter,paragraphIndex:0,page:0}}));
   },target);
   await page.route('**/api/**',r=>['GET','HEAD'].includes(r.request().method())?r.continue():r.abort());
   await page.goto('https://tinct.app/lab/phone?chrome=v2',{waitUntil:'domcontentloaded'});
   const root=page.getByTestId('lab-root');
   await root.waitFor();await page.waitForFunction(target=>{const r=document.querySelector('[data-testid="lab-root"]');return r?.getAttribute('data-reader-ready')==='true'&&r?.getAttribute('data-book-id')===target.book&&Number(r?.getAttribute('data-chapter'))===target.chapter},target,{timeout:30000});
   assert(await root.getAttribute('data-book-id')===target.book,'wrong book');
   assert(Number(await root.getAttribute('data-chapter'))===target.chapter,'wrong chapter');
   row.bundle=await page.locator('script[src*="/assets/index-"]').getAttribute('src');
   const play=page.getByTestId('lab-v2-play').or(page.getByTestId('lab-listen')).filter({visible:true}).first();
   await play.click();
   await page.waitForFunction(()=>window.__bellaAudio.some(a=>!a.paused&&a.currentTime>0&&a.readyState>=2&&Number.isFinite(a.duration)));
   // Let a chapter-title clip finish if present; all playback is muted.
   await page.waitForFunction(()=>document.querySelector('[data-testid="lab-hearing-current"]')?.getAttribute('data-word-index')!=null,{},{timeout:15000});
   row.firstHighlight=await page.getByTestId('lab-hearing-current').first().textContent();
   row.audio=await page.evaluate(()=>{const a=window.__bellaAudio.find(a=>!a.paused);return {src:a.src,muted:a.muted,time:a.currentTime,duration:a.duration}});
   assert(row.audio.muted,'audio was not muted');
   assert(decodeURIComponent(row.audio.src).includes('/original-en/'),'unexpected audio edition');
   // Native media seeking exercises actual timeupdate handling with served MP3s.
   await page.evaluate(()=>{const a=window.__bellaAudio.find(a=>!a.paused);a.currentTime=Math.max(.2,a.duration*.5)});
   await page.waitForTimeout(400);
   assert(await page.getByTestId('lab-hearing-current').count()>0,'highlight lost after seek');
   await page.screenshot({path:path.join(dir,target.book+'-'+width+'.png')});
   await play.click();
   await page.waitForFunction(()=>document.querySelector('[data-testid="lab-root"]').getAttribute('data-playing')==='false');
   const paused=await page.evaluate(()=>window.__bellaAudio.find(a=>a.src)?.currentTime);
   await play.click();
   await page.waitForFunction(()=>document.querySelector('[data-testid="lab-root"]').getAttribute('data-playing')==='true');
   const resumed=await page.evaluate(()=>window.__bellaAudio.find(a=>!a.paused)?.currentTime);
   assert(resumed>=paused-.2,'resume moved backwards');
   const speed=page.getByTestId('lab-hearing-speed').filter({visible:true}).first();await speed.click();
   const slider=page.getByTestId('lab-audio-speed-slider');await slider.fill('1.5');
   await page.keyboard.press('Escape');
   await page.waitForFunction(()=>window.__bellaAudio.some(a=>!a.paused&&a.playbackRate===1.5));
   row.speed=1.5;
   const before=await page.getByTestId('lab-listen-status').getAttribute('data-src');
   await page.evaluate(()=>{const a=window.__bellaAudio.find(a=>!a.paused);a.currentTime=Math.max(0,a.duration-.1)});
   await page.waitForFunction(old=>document.querySelector('[data-testid="lab-listen-status"]').getAttribute('data-src')!==old,before,{timeout:10000});
   await page.waitForFunction(()=>document.querySelector('[data-testid="lab-hearing-current"]')!=null);
   row.paragraphTransition=true;row.pauseResume=true;row.seek=true;
   await play.click();
   await page.getByTestId('lab-header-chapter').filter({visible:true}).first().click();
   await page.getByTestId('lab-tree-chapter-'+(target.chapter+1)).filter({visible:true}).first().click();
   await page.waitForFunction(n=>document.querySelector('[data-testid="lab-root"]')?.getAttribute('data-chapter')===String(n),target.chapter+1);
   await play.click();
   await page.waitForFunction(n=>window.__bellaAudio.some(a=>!a.paused&&decodeURIComponent(a.src).includes('/ch'+n+'/')&&a.readyState>=2),target.chapter+1);
   row.chapterNavigation=true;row.status='pass';
  }catch(e){row.status='fail';row.error=String(e);row.media=await page.evaluate(()=>window.__bellaAudio?.map(a=>({src:a.src,time:a.currentTime,duration:a.duration,readyState:a.readyState,networkState:a.networkState,paused:a.paused,error:a.error?{code:a.error.code,message:a.error.message}:null}))).catch(()=>null);row.url=page.url();row.rootState=await page.getByTestId('lab-root').evaluate(e=>Object.fromEntries([...e.attributes].map(a=>[a.name,a.value]))).catch(()=>null);await page.screenshot({path:path.join(dir,target.book+'-'+width+'-failure.png')}).catch(()=>{});}
  finally{await context.close();results.push(row);fs.writeFileSync(path.join(dir,'results.json'),JSON.stringify(results,null,2));console.log(JSON.stringify(row));}
 }
 }finally{await browser.close()}
 if(results.some(x=>x.status!=='pass'))process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1});
