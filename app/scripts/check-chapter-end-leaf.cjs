// TEST_ORIGIN=http://127.0.0.1:5198 ARTIFACT_DIR=/tmp/chapter-end node scripts/check-chapter-end-leaf.cjs
// Isolated browser fixtures; all API/account requests are intercepted.
const {chromium,webkit}=require('playwright')
const assert=require('node:assert/strict'),fs=require('node:fs')
const origin=process.env.TEST_ORIGIN||'http://127.0.0.1:5198',out=process.env.ARTIFACT_DIR||'/tmp/chapter-end-leaf'
fs.mkdirSync(out,{recursive:true})
async function state(page){return page.evaluate(()=>{
 const root=document.querySelector('.lab'),p=document.querySelector('.lab-page-wrap > .lab-passage'),r=p.getBoundingClientRect(),css=getComputedStyle(p),card=p.querySelector('.lab-chapter-end')
 const words=[...p.querySelectorAll('[data-testid="lab-word"]')].filter(w=>w.getClientRects().length)
 const left=r.left+parseFloat(css.paddingLeft),right=r.right-parseFloat(css.paddingRight)
 return{chapter:root.dataset.chapter,end:p.classList.contains('is-chapter-end-page'),keys:words.map(w=>w.dataset.paragraphIndex+':'+w.dataset.wordIndex),card:card?.getBoundingClientRect().toJSON(),leafRight:(left+right)/2-parseFloat(css.getPropertyValue('--desktop-gutter')||0)/2,left,passageBottom:r.bottom,bundle:[...document.scripts].map(s=>s.src).find(s=>/assets\/index-.*\.js/.test(s))}
})}
async function run(browser,viewport,before){
 const context=await browser.newContext({viewport,isMobile:viewport.width<900,hasTouch:viewport.width<900}),page=await context.newPage()
 await page.route('**/api/**',r=>r.fulfill({status:404,body:'{}'}));await page.route('**/*supabase.co/**',r=>r.abort())
 await page.addInitScript(()=>{localStorage.setItem('tinct-lab-prefs',JSON.stringify({fontFamily:'garamond',fontSize:1.3,theme:'light',compareOpen:false}));sessionStorage.setItem('tinct:lab-reader-handoff',JSON.stringify({kind:'open-reader',bookId:'bible',primaryEditionKey:'web-en',savedPlace:{bookId:'bible',chapterNumber:1134,paragraphIndex:0,page:0}}))})
 try{
  await page.goto(origin+(viewport.width<900?'/lab/phone':'/reader'))
  await page.waitForFunction(()=>document.querySelector('.lab')?.dataset.chapter==='1134');await page.evaluate(()=>document.fonts.ready)
  if(before)await page.addStyleTag({content:'.lab[data-chrome-version="v2"][data-desktop-paging="true"] .lab-passage.is-spread > .lab-chapter-end-page {width:100%;margin-left:auto;}'})
  await page.waitForTimeout(500)
  const pages=[]
  for(let i=0;i<30;i++){
   const s=await state(page);if(s.chapter!=='1134')break;pages.push(s)
   if(s.end){
    assert.equal(s.keys.length,0,'Dedicated screen hides source text')
    if(viewport.width>=900&&!before){assert.ok(s.card.left>=s.left-1,'Card starts within left leaf');assert.ok(s.card.right<=s.leafRight+1,'Card does not cross gutter')}
    assert.ok(s.card.bottom<s.passageBottom,'Complete card fits vertically')
    await page.screenshot({path:out+`/${viewport.width}-${viewport.height}-${before?'before':'after'}.png`})
    await page.keyboard.press('ArrowLeft');await page.waitForTimeout(250)
    assert.deepEqual((await state(page)).keys,pages.at(-2).keys,'Back returns to same source words')
    await page.keyboard.press('ArrowRight');await page.waitForTimeout(250)
    assert.equal((await state(page)).end,true,'Forward reopens end screen')
    await page.getByRole('button',{name:'Continue to next chapter',exact:true}).click()
    await page.waitForFunction(()=>document.querySelector('.lab')?.dataset.chapter==='1135');await page.waitForTimeout(350);break
   }
   await page.keyboard.press('ArrowRight');await page.waitForTimeout(250)
  }
  const next=await state(page);assert.equal(next.chapter,'1135','Advance to Hebrews 2');assert.equal(next.keys[0],'0:0','Next chapter opens at first word')
  if(viewport.width===1440&&viewport.height===795)assert.ok(pages.some(p=>p.end),'Reported end screen reproduced')
  if(!before&&!pages.some(p=>p.end))await page.screenshot({path:out+`/${viewport.width}-${viewport.height}-after.png`})
  return{viewport,before,pages,next}
 }finally{await context.close()}
}
;(async()=>{const results=[];for(const viewport of[{width:1440,height:795},{width:1440,height:950},{width:1024,height:768},{width:390,height:844}]){
 const browser=await(viewport.width<900?webkit:chromium).launch()
 try{const before=await run(browser,viewport,true),after=await run(browser,viewport,false)
 assert.deepEqual(after.pages.map(p=>({end:p.end,keys:p.keys})),before.pages.map(p=>({end:p.end,keys:p.keys})),'All page boundaries and end-screen transitions remain identical')
 results.push({before,after});console.log(JSON.stringify({viewport,sourcePages:after.pages.filter(p=>!p.end).length,endScreen:after.pages.some(p=>p.end),paginationUnchanged:true}))
 }finally{await browser.close()}}
 fs.writeFileSync(out+'/results.json',JSON.stringify(results,null,2))
})().catch(e=>{console.error(e);process.exitCode=1})
