// Real reader, isolated local fixtures, no model calls.
const {webkit,chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path')
const origin=process.env.TEST_ORIGIN||'http://127.0.0.1:5195',dir=process.env.ARTIFACT_DIR||'/tmp/tinct-sep10-bugs';fs.mkdirSync(dir,{recursive:true})
async function main(){const results=[];for(const desktop of [false,true]){const b=await(desktop?chromium:webkit).launch();try{
 const p=await b.newPage({viewport:desktop?{width:1440,height:700}:{width:390,height:640},isMobile:!desktop,hasTouch:!desktop});p.setDefaultTimeout(12000)
 await p.route('**/api/**',r=>r.fulfill({status:404,body:'{}'}))
 await p.route('**/api/{chat,lab-chat}',r=>r.fulfill({contentType:'application/json',body:JSON.stringify({content:[{text:'Baruch receives a personal message amid a time of disaster. The chapter addresses his weariness and hopes.'}]})}))
 await p.addInitScript(()=>sessionStorage.setItem('tinct:lab-reader-handoff',JSON.stringify({kind:'open-reader',bookId:'bible',primaryEditionKey:'kjv-en',compareEditionKey:'web-en',savedPlace:{bookId:'bible',chapterNumber:790,paragraphIndex:0,page:0}})))
 await p.goto(origin+'/reader');await p.waitForFunction(()=>document.querySelector('.lab')?.dataset.readerReady==='true');await p.waitForTimeout(1500)
 // Baruch must resolve from the reviewed asset without saving a highlight.
 const baruch=p.locator('.lab-page-wrap [data-word-index]').filter({hasText:/^\s*Baruch$/}).first();await baruch.waitFor()
 await p.waitForTimeout(1000)
 if(desktop)await baruch.click();else{const r=await baruch.boundingBox();await p.mouse.move(r.x+r.width/2,r.y+r.height/2);await baruch.dispatchEvent('pointerdown',{pointerType:'touch',pointerId:1,clientX:r.x+2,clientY:r.y+2});await p.waitForTimeout(450);await baruch.dispatchEvent('pointerup',{pointerType:'touch',pointerId:1,clientX:r.x+2,clientY:r.y+2})}
 await p.getByText('Jeremiah’s scribe · Son of Neriah',{exact:true}).waitFor()
 assert.equal(await p.evaluate(()=>JSON.parse(localStorage.getItem('tinct-lab-highlights')||'[]').length),0)
 await p.screenshot({path:path.join(dir,(desktop?'desktop':'phone')+'-baruch.png')})
 await p.keyboard.press('Escape')
 for(let i=0;i<30&&await p.getByTestId('lab-chapter-end').count()===0;i++){await p.keyboard.press('ArrowRight');await p.waitForTimeout(150)}
 const before=await p.getByTestId('lab-root').getAttribute('data-place')
 const overflow=await p.locator('.lab-passage.has-overflowing-end').count()>0
 if(overflow){
   assert.equal(await p.getByRole('button',{name:'Recap this chapter'}).isVisible(),false)
   await p.screenshot({path:path.join(dir,(desktop?'desktop':'phone')+'-final-text.png')})
   await p.keyboard.press('ArrowRight');await p.getByTestId('lab-chapter-end-page').waitFor()
   assert.equal(await p.getByTestId('lab-root').getAttribute('data-place'),before)
   await p.keyboard.press('ArrowLeft');await p.getByTestId('lab-chapter-end-page').waitFor({state:'detached'})
   assert.equal(await p.getByTestId('lab-root').getAttribute('data-place'),before)
   await p.keyboard.press('ArrowRight');await p.getByTestId('lab-chapter-end-page').waitFor()
 }
 const bounds=await p.getByTestId('lab-chapter-end').evaluate(card=>({bottom:card.getBoundingClientRect().bottom,article:card.closest('article').getBoundingClientRect().bottom,scroll:card.closest('article').scrollTop}))
 assert.ok(bounds.bottom<=bounds.article,'Entire end card fits without scrolling');assert.equal(bounds.scroll,0)
 await p.screenshot({path:path.join(dir,(desktop?'desktop':'phone')+'-end.png')})
 if(!desktop){
   await p.getByRole('button',{name:'Recap this chapter'}).click();await p.getByTestId('lab-ask-turn-assistant').waitFor()
   await p.getByTestId('lab-ask-input').fill('Why is Baruch weary?')
   await p.setViewportSize({width:390,height:400})
   assert.equal(await p.locator('.lab-header').isVisible(),false)
   assert.equal(await p.getByTestId('lab-ask-done').isVisible(),false)
   const layout=await p.evaluate(()=>({thread:document.querySelector('.lab-ask-thread').getBoundingClientRect().height,input:document.querySelector('[data-testid="lab-ask-input"]').getBoundingClientRect().height}))
   assert.ok(layout.thread>150,JSON.stringify(layout));assert.ok(layout.input>=30)
   await p.screenshot({path:path.join(dir,'phone-keyboard-layout.png')})
   await p.evaluate(()=>localStorage.removeItem('tinct:lab-ai-actions'))
   await p.getByTestId('lab-ask-send').click()
   assert.equal(await p.getByTestId('lab-ask-input').evaluate(n=>document.activeElement===n),false)
   await p.setViewportSize({width:390,height:640})
   await p.getByTestId('lab-ask-done').click()
   if(!await p.getByRole('button',{name:'Continue to next chapter'}).isVisible()){await p.keyboard.press('ArrowRight');await p.waitForTimeout(200)}
 }
 await p.getByRole('button',{name:'Continue to next chapter'}).click();await p.waitForFunction(()=>document.querySelector('.lab')?.dataset.chapter==='791')
 results.push({desktop,overflow,bounds,baruch:true,continueChapter:791})
 }finally{await b.close()}}
assert.ok(results.some(r=>r.overflow),'Exercise a genuinely overflowing end card');fs.writeFileSync(path.join(dir,'results.json'),JSON.stringify(results,null,2));console.log(results)}main().catch(e=>{console.error(e);process.exitCode=1})
