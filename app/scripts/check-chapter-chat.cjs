// Real reader/layout/edition data; Chat responses are intercepted. No model calls.
const { chromium, webkit } = require('playwright')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const origin = process.env.TEST_ORIGIN || 'http://127.0.0.1:5191'
const dir = process.env.ARTIFACT_DIR || '/tmp/tinct-chapter-chat'
fs.mkdirSync(dir, { recursive: true })
const answer = 'Jeremiah 35 opens during Jehoiakim’s reign. Jeremiah is told to bring the Rechabites into a room in the Temple and offer them wine.'
async function state(page) {
 return page.getByTestId('lab-root').evaluate(root => ({ place: root.dataset.place, chapter: root.dataset.chapter, words: [...root.querySelectorAll('.lab-page-wrap > .lab-passage [data-word-index][data-paragraph-index]')].map(n => `${n.dataset.paragraphIndex}:${n.dataset.wordIndex}`) }))
}
async function main() {
 const results=[]
 for(const config of [{name:'phone',engine:webkit,width:390,height:844},{name:'small-phone-large-text',engine:webkit,width:360,height:640,fontSize:1.8},{name:'desktop',engine:chromium,width:1440,height:950}]) {
  const browser=await config.engine.launch()
  try {
   const page=await browser.newPage({viewport:{width:config.width,height:config.height},isMobile:config.width<800,hasTouch:config.width<800})
   await page.route('**/api/**',r=>r.fulfill({status:404,body:'{}'}))
   const calls=[]
   await page.route('**/api/{chat,lab-chat}',async route=>{
    calls.push(route.request().postDataJSON())
    await new Promise(resolve=>setTimeout(resolve,250))
    await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({content:[{text:answer}]})})
   })
   await page.addInitScript(fontSize=>{
    if(fontSize) localStorage.setItem('tinct-lab-prefs',JSON.stringify({version:2,phone:{fontSize},desktop:{fontSize}}))
    if (!sessionStorage.getItem('chapter-chat-qa-seeded')) {
     sessionStorage.setItem('chapter-chat-qa-seeded','1')
     sessionStorage.setItem('tinct:lab-reader-handoff',JSON.stringify({kind:'open-reader',bookId:'bible',primaryEditionKey:'kjv-en',compareEditionKey:'web-en',savedPlace:{bookId:'bible',chapterNumber:779,paragraphIndex:0,page:0}}))
    }
   },config.fontSize)
   await page.goto(`${origin}/reader`,{waitUntil:'domcontentloaded'})
   await page.getByTestId('lab-book').waitFor()
   await page.waitForTimeout(2400)
   assert.equal(await page.getByTestId('lab-chapter-end').count(),0,'No actions at chapter opening')
   for(let i=0;i<60&&await page.getByTestId('lab-chapter-end').count()===0;i++) {await page.keyboard.press('ArrowRight'); await page.waitForTimeout(100)}
   await page.getByRole('button',{name:'Prepare for the next chapter'}).scrollIntoViewIfNeeded()
   assert.equal(calls.length,0,'Rendering a chapter end must not call Chat')
   assert.equal(await page.getByRole('heading',{name:'End of chapter',exact:true}).count(),1)
   if(config.width>=800) {
    const bounds=await page.evaluate(()=>({article:document.querySelector('.lab-page-wrap > .lab-passage').getBoundingClientRect().bottom,footer:document.querySelector('.lab-desktop-page-footers').getBoundingClientRect().top}))
    assert.ok(bounds.article<bounds.footer,'Scrollable chapter ending must clear page numbers')
   }
   const before=await state(page)
   await page.screenshot({path:path.join(dir,`${config.name}-end.png`)})
   await page.emulateMedia({colorScheme:'dark'})
   await page.waitForTimeout(100)
   await page.screenshot({path:path.join(dir,`${config.name}-end-dark.png`)})
   await page.emulateMedia({colorScheme:'light'})
   await page.getByRole('button',{name:'Prepare for the next chapter'}).click()
   await page.getByTestId('lab-ask-turn-assistant').filter({hasText:answer}).waitFor()
   assert.equal(calls.length,1)
   assert.equal(calls[0].messages.at(-1).content,'Prepare me for the next chapter.')
   assert.match(calls[0].system,/Jehoiakim/)
   assert.match(calls[0].system,/Rechabites/)
   assert.match(calls[0].system,/"targetChapterNumber":780/)
   assert.equal(calls[0].book.chapterNumber,779)
   assert.equal((await page.getByTestId('lab-ask-turn-user').last().innerText()).includes('Prepare me for the next chapter.'),true)
   assert.equal(await page.getByTestId('lab-ask-thread').innerText().then(x=>x.includes('chapter_source_data')),false)
   await page.getByTestId('lab-ask-input').waitFor({state:'visible'})
   await page.getByTestId('lab-ask-mic').waitFor({state:'visible'})
   await page.getByTestId('lab-ask-voice').waitFor({state:'visible'})
   await page.screenshot({path:path.join(dir,`${config.name}-chat.png`)})
   const close=config.width<800?page.getByTestId('lab-ask-done'):page.getByTestId('lab-desktop-companion-close')
   await close.click(); await page.waitForTimeout(150)
   assert.deepEqual(await state(page),before,'Back to book retains chapter, place and source words')
   // Reset only this isolated anonymous fixture's free-action counter.
   await page.evaluate(()=>localStorage.removeItem('tinct:lab-ai-actions'))
   await page.getByRole('button',{name:'Discuss this chapter'}).click()
   await page.waitForFunction(()=>document.querySelectorAll('[data-testid="lab-ask-turn-assistant"]').length===2)
   assert.equal(calls.length,2)
   assert.equal(calls[1].messages.at(-1).content,'Recap this chapter.')
   assert.match(calls[1].system,/"targetChapterNumber":779/)
   assert.ok(calls[1].messages.some(m=>m.content.includes('Stored chapter association')))
   await close.click(); await page.waitForTimeout(150)
   assert.deepEqual(await state(page),before)
   const stored=await page.evaluate(()=>JSON.parse(localStorage.getItem('tinct:chat-history:bible')))
   assert.equal(stored.flatMap(c=>c.messages).filter(m=>m.chapterAction).length,4)
   await page.reload({waitUntil:'domcontentloaded'}); await page.getByTestId('lab-book').waitFor(); await page.waitForTimeout(2000)
   assert.equal((await state(page)).chapter,before.chapter)
   assert.equal((await state(page)).place,before.place)
   assert.equal(calls.length,2,'Reload cannot rerun chapter actions')
   // Forward navigation still advances to the actual next chapter.
   await page.getByRole('button',{name:'Continue to next chapter'}).click(); await page.waitForTimeout(800)
   const after=await state(page)
   assert.equal(after.chapter,'780')
   assert.match(after.place, /0:0$/, 'Continue opens at the start')
   assert.equal(calls.length,2,'Continue does not call Chat')
   results.push({name:config.name,before,afterChapter:after.chapter,calls:calls.length})
  } finally {await browser.close()}
 }
 fs.writeFileSync(path.join(dir,'results.json'),JSON.stringify(results,null,2))
 console.log(JSON.stringify({results,dir},null,2))
}
main().catch(e=>{console.error(e);process.exitCode=1})
