// TEST_ORIGIN=http://127.0.0.1:5198 ARTIFACT_DIR=/tmp/chat-inset node scripts/check-chat-inset.cjs
// Uses isolated local reader fixtures and mocked replies; no provider/account calls.
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs')
const base=process.env.TEST_ORIGIN||'http://127.0.0.1:5198',out=process.env.ARTIFACT_DIR||'/tmp/chat-inset'
const answer=Array.from({length:10},(_,i)=>`Reading note ${i+1}: Hebrews opens by contrasting earlier messages through the prophets with the Son. The passage develops its argument through quotations, inviting the reader to follow each connection carefully.`).join('\n\n')
fs.mkdirSync(out,{recursive:true})
;(async()=>{const browser=await chromium.launch(),results=[];try{
for(const [width,height,theme] of [[1440,950,'light'],[1440,950,'dark'],[1024,768,'light'],[390,844,'dark']]){
 const mobile=width<900,context=await browser.newContext({viewport:{width,height},isMobile:mobile,hasTouch:mobile,serviceWorkers:'block'}),page=await context.newPage();let sends=0
 await context.route('**/*',async r=>{const u=new URL(r.request().url());if(u.pathname.startsWith('/api/')){if(['/api/chat','/api/lab-chat'].includes(u.pathname)&&r.request().method()==='POST'){sends++;return r.fulfill({status:200,contentType:'application/json',body:JSON.stringify({content:[{text:answer}]})})}return r.fulfill({status:404,body:'{}'})}if(u.origin!==new URL(base).origin)return r.abort();return r.continue()})
 await page.addInitScript(({theme})=>{localStorage.setItem('tinct-lab-prefs',JSON.stringify({theme,fontFamily:'garamond',fontSize:1.3,compareOpen:false}));sessionStorage.setItem('tinct:lab-reader-handoff',JSON.stringify({kind:'open-reader',bookId:'bible',primaryEditionKey:'web-en',savedPlace:{bookId:'bible',chapterNumber:1134,paragraphIndex:0,page:0}}))},{theme})
 try{
 await page.goto(base+(mobile?'/lab/phone?chrome=v2':'/reader?chrome=v2'));await page.waitForFunction(()=>document.querySelector('.lab')?.dataset.chapter==='1134');await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(500)
 const place=await page.getByTestId('lab-root').getAttribute('data-place')
 await page.getByTestId('lab-super').click();await page.getByTestId('lab-super-row-chat').click()
 assert.equal(await page.locator('.lab-desktop-companion-mark').count(),0,'Chat has no decorative dots')
 await page.getByTestId('lab-ask-input').fill('How does this chapter develop its argument?');await page.getByTestId('lab-ask-send').click();await page.getByTestId('lab-ask-turn-assistant').waitFor();await page.waitForTimeout(250)
 const geometry=await page.evaluate(()=>{const p=document.querySelector('[data-testid="lab-ask-pane"]'),r=p.getBoundingClientRect(),b=p.parentElement.getBoundingClientRect(),thread=p.querySelector('.lab-ask-thread'),input=p.querySelector('.lab-ask-composer'),close=p.querySelector('.lab-desktop-companion-head button'),title=p.querySelector('.lab-desktop-companion-head strong');return{panel:r.toJSON(),parent:b.toJSON(),footer:document.querySelector('.lab-desktop-page-footers')?.getBoundingClientRect().toJSON(),composer:input.getBoundingClientRect().toJSON(),close:close?.getBoundingClientRect().toJSON(),title:title?.getBoundingClientRect().toJSON(),scrollHeight:thread.scrollHeight,clientHeight:thread.clientHeight,bundle:[...document.scripts].map(s=>s.src).find(s=>/assets\/index-.*\.js/.test(s))}})
 if(!mobile){const{panel:p,parent:b}=geometry;assert.ok(p.left>b.left+b.width/2+10,'Inset from spread gutter');assert.ok(p.right<b.right-10,'Inset from outer page edge');assert.ok(p.top>b.top+10&&p.bottom<b.bottom-10,'Visible page above and below');assert.ok(Math.abs((geometry.title.left+geometry.title.right)/2-(p.left+p.right)/2)<2,'Title stays centered');assert.ok(geometry.close.right<=p.right&&geometry.close.top>=p.top,'Close remains inside');assert.ok(p.bottom<=geometry.footer.top,'Chat leaves the page numbers fully visible')}
 assert.ok(geometry.composer.bottom<=geometry.panel.bottom+1,'Composer fits panel');assert.ok(geometry.scrollHeight>geometry.clientHeight,'Long replies scroll')
 await page.getByTestId('lab-ask-thread').evaluate(e=>{e.scrollTop=0});await page.screenshot({path:out+`/${width}-${theme}.png`})
 await page.getByTestId(mobile?'lab-ask-done':'lab-desktop-companion-close').click();assert.equal(await page.getByTestId('lab-ask-pane').count(),0,'Close returns to reader');assert.equal(await page.getByTestId('lab-root').getAttribute('data-place'),place,'Chat preserves reading location');assert.equal(sends,1)
 results.push({width,height,theme,geometry,placePreserved:true,mockSends:sends});console.log(JSON.stringify({width,height,theme,pass:true,panel:geometry.panel}))
 }finally{await context.close()}
}fs.writeFileSync(out+'/results.json',JSON.stringify(results,null,2))
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1})
