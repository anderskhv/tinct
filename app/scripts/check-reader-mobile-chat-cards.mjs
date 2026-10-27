// Isolated mobile WebKit acceptance: Chat shares Explain styling and keeps history/drafts through simulated keyboard changes.
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import { createServer } from 'node:http'
import { enforceReaderBundle } from './lib/readerParityAssertions.mjs'
import { webkit } from '@playwright/test'
import { markInternal } from './lib/internalTraffic.cjs'
const dist = path.resolve(process.env.TINCT_DIST || 'dist')
const server = createServer(async (req, res) => {
  const url = new URL(req.url || '/', 'http://127.0.0.1')
  const file = path.resolve(dist, '.' + (url.pathname === '/reader' ? '/app.html' : url.pathname))
  if (!file.startsWith(dist + path.sep)) { res.writeHead(403); res.end(); return }
  try {
    const body = await fs.readFile(file)
    const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.woff2': 'font/woff2', '.svg': 'image/svg+xml' }[path.extname(file)] || 'application/octet-stream'
    res.writeHead(200, { 'Content-Type': mime }); res.end(body)
  } catch { res.writeHead(404); res.end() }
})
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
const origin = process.env.TINCT_ORIGIN || `http://127.0.0.1:${server.address().port}`
const expectedBundle = process.env.TINCT_EXPECTED_BUNDLE || ''
const output = process.env.TINCT_MOBILE_CARD_OUTPUT || 'artifacts/mobile-chat-cards'
await fs.mkdir(output, { recursive: true })
const results=[]
const browser=await markInternal(await webkit.launch({headless:true}))
try {
  const scenarios=[]
  for(const standalone of [false,true])for(const theme of ['book','dark'])scenarios.push({standalone,theme,historical:false})
  scenarios.push({standalone:true,theme:'book',historical:true})
  for (const {standalone,theme,historical} of scenarios) {
    const context=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true,serviceWorkers:'block',reducedMotion:'reduce'})
    const page=await context.newPage(),errors=[]
    page.on('pageerror',error=>errors.push(error.message))
    await page.route('**/*',async route=>{
      const url=new URL(route.request().url())
      if(url.origin!==origin)return route.abort()
      if(await enforceReaderBundle(route,expectedBundle))return
      if(/\/api\/(?:lab-chat|chat)$/.test(url.pathname)){
        const body=route.request().postDataJSON(),intent=body?.companion?.intent
        const text=intent==='define'?JSON.stringify({kind:'definition',definition:'A readable dictionary meaning.'}):'A local phone card answer.'
        return route.fulfill({contentType:'text/event-stream',body:`data: ${JSON.stringify({type:'content_block_delta',delta:{type:'text_delta',text}})}\n\ndata: {"type":"message_stop"}\n\n`})
      }
      if(url.pathname.startsWith('/data/dict/'))return route.fulfill({json:{}})
      if(url.pathname.startsWith('/api/'))return route.fulfill({status:404,json:{}})
      return route.continue()
    })
    await page.addInitScript(({standalone,theme,historical})=>{
      localStorage.setItem('tinct-lab-prefs',JSON.stringify({theme,fontSize:1,fontSizeExplicit:true}))
      if(historical){
        const now=Date.now()-100000,messages=[]
        for(let i=0;i<6;i++){messages.push({id:`old-user-${i}`,role:'user',content:`Old Sirach question ${i}?`,timestamp:now+i*2,bookId:'bible',chapterNumber:1309,paragraphIndex:3},{id:`old-answer-${i}`,role:'assistant',content:'A local historical Sirach answer. '.repeat(24),timestamp:now+i*2+1,bookId:'bible',chapterNumber:1309,paragraphIndex:3})}
        localStorage.setItem('tinct:chat-history:bible',JSON.stringify([{id:'qa-old-sirach',bookId:'bible',chapterNumber:1309,paragraphIndex:3,startTimestamp:now,endTimestamp:now+11,messages,preview:'Old Sirach question 0?'}]))
      }
      Object.defineProperty(navigator,'standalone',{configurable:true,value:standalone})
      if(standalone){
        const viewport=new EventTarget()
        Object.assign(viewport,{height:844,width:390,offsetTop:0,offsetLeft:0,pageTop:0,pageLeft:0,scale:1})
        Object.defineProperty(window,'visualViewport',{configurable:true,value:viewport})
        window.__mobileCardViewport=viewport
      }
    },{standalone,theme,historical})
    await page.goto(historical?`${origin}/reader?book=bible&edition=webc-en&chapter=629&paragraph=0&word=0&sharedReader=1&layout=phone`:`${origin}/reader?book=frankenstein&chapter=2&paragraph=2&word=0&sharedReader=1&layout=phone`)
    await page.waitForFunction(()=>document.querySelector('.lab')?.dataset.readerReady==='true')
    await page.evaluate(()=>document.fonts.ready)
    if(historical){
      await page.getByTestId('lab-super').click();await page.getByTestId('lab-super-row-chat').click()
      const card=page.locator('.lab-pcard[data-kind="chat"]');await card.waitFor()
      await card.getByTestId('lab-ask-initial-location').waitFor()
      assert.match(await card.getByTestId('lab-ask-initial-location').innerText(),/Sirach 40/,'old history labels its real Sirach chapter')
      assert.match(await card.locator('#lab-ask-input').getAttribute('placeholder'),/Proverbs 1/,'composer names current Proverbs chapter')
      const thread=card.getByTestId('lab-ask-thread')
      const size=await thread.evaluate(node=>({scroll:node.scrollHeight,visible:node.clientHeight,top:node.scrollTop}))
      assert(size.scroll>size.visible,'long history scrolls inside the shared card')
      await page.waitForFunction(()=>{const thread=document.querySelector('.lab-pcard[data-kind="chat"] [data-testid="lab-ask-thread"]');return thread&&Math.abs(thread.scrollHeight-thread.clientHeight-thread.scrollTop)<=8})
      const cleanOpening=await thread.evaluate(node=>({
        top:node.getBoundingClientRect().top,
        historyBottom:Math.max(...[...node.querySelectorAll('[data-testid="lab-ask-turn-user"],[data-testid="lab-ask-turn-assistant"]')].map(row=>row.getBoundingClientRect().bottom)),
        spacer:node.querySelector('.tc-spacer')?.getBoundingClientRect().height||0,
        height:node.clientHeight,
      }))
      assert(cleanOpening.spacer>=cleanOpening.height-2,'general Chat leaves a blank writing area while retaining history')
      assert(cleanOpening.historyBottom<=cleanOpening.top+2,'previous messages start above the visible writing area')
      await page.screenshot({path:`${output}/pwa-book-long-history-clean-opening.png`})
      await thread.evaluate(node=>node.scrollTop=0)
      await card.getByText('Old Sirach question 0?',{exact:true}).waitFor()
      const box=await card.boundingBox();assert(box&&box.y>=0&&box.y+box.height<=845,'long history stays inside phone viewport')
      await page.screenshot({path:`${output}/pwa-book-long-sirach-current-proverbs.png`})
      await card.locator('#lab-ask-input').click();await page.keyboard.type('A draft while reading older messages')
      assert.equal(await thread.evaluate(node=>node.scrollTop),0,'typing a draft does not jump away from older messages')
      await page.evaluate(()=>{const viewport=window.__mobileCardViewport;Object.assign(viewport,{height:480,offsetTop:40});viewport.dispatchEvent(new Event('resize'))})
      await page.waitForFunction(()=>document.querySelector('.lab-pcard[data-kind="chat"]')?.hasAttribute('data-keyboard'))
      assert.equal(await thread.evaluate(node=>node.scrollTop),0,'keyboard viewport resize retains older history position')
      await card.getByRole('button',{name:'Close chat',exact:true}).click()
      results.push({standalone,theme,historical,longHistory:true,nativeNotchAndKeyboardVerified:false})
      await context.close();continue
    }
    await page.getByTestId('lab-super').click();await page.getByTestId('lab-super-row-chat').click()
    const empty=page.locator('.lab-pcard[data-kind="chat"]');await empty.waitFor()
    const emptyBox=await empty.boundingBox();assert(emptyBox&&emptyBox.height<300,'empty Chat remains compact like an Explain card')
    assert.equal(await empty.locator('#lab-ask-input').evaluate(node=>document.activeElement===node),false,'empty phone Chat does not raise keyboard automatically')
    await page.screenshot({path:`${output}/${standalone?'pwa':'safari'}-${theme}-empty-chat.png`})
    await empty.getByRole('button',{name:'Close chat',exact:true}).click()
    const points=await page.locator('[data-testid="lab-word"]:visible').evaluateAll(nodes=>nodes.flatMap(node=>{const r=node.getBoundingClientRect();return r.top>100&&r.bottom<650&&r.left>=0&&r.right<=innerWidth?[{x:r.x,y:r.y,width:r.width,height:r.height}]:[]}))
    const first=points[5],last=points[14];assert(first&&last,'phone exposes a source phrase')
    await page.mouse.move(first.x+first.width/2,first.y+first.height/2);await page.mouse.down();await page.mouse.move(last.x+last.width/2,last.y+last.height/2,{steps:12});await page.mouse.up()
    await page.getByTestId('lab-phone-bar').getByRole('button',{name:'Explain',exact:true}).click()
    const explain=page.locator('.lab-pcard[data-kind="explain"]')
    await explain.getByText('A local phone card answer.',{exact:true}).waitFor()
    const metrics=card=>card.evaluate(node=>{
      const s=getComputedStyle(node),header=getComputedStyle(node.querySelector('.lab-pcard-head')),field=node.querySelector('textarea'),f=field&&getComputedStyle(field),frame=field?.closest('.lab-pcard-follow-box,.tc-field'),box=frame&&getComputedStyle(frame),answer=node.querySelector('.lab-pcard-answer,.tc-answer'),a=answer&&getComputedStyle(answer)
      return{surface:{background:s.backgroundColor,borderRadius:s.borderRadius,paddingLeft:s.paddingLeft,paddingRight:s.paddingRight,paddingBottom:s.paddingBottom,fontFamily:s.fontFamily,color:s.color},header:{fontFamily:header.fontFamily,fontSize:header.fontSize,color:header.color},input:f&&{fontFamily:f.fontFamily,fontSize:f.fontSize,lineHeight:f.lineHeight,color:f.color,background:f.backgroundColor,padding:f.padding},composer:box&&{background:box.backgroundColor,borderRadius:box.borderRadius,padding:box.padding,minHeight:box.minHeight,gap:box.gap},answer:a&&{fontFamily:a.fontFamily,fontSize:a.fontSize,lineHeight:a.lineHeight,color:a.color},box:node.getBoundingClientRect().toJSON()}
    })
    const explanation=await metrics(explain)
    const label=`${standalone?'pwa':'safari'}-${theme}`
    await page.waitForFunction(()=>document.querySelectorAll('.lab-card-passage-line').length>0)
    const joined=await page.evaluate(()=>{
      const words=[...document.querySelectorAll('.is-card-passage')].flatMap(node=>[...node.getClientRects()])
      const lines=[...document.querySelectorAll('.lab-card-passage-line')].map(node=>node.getBoundingClientRect())
      return words.every(word=>lines.some(line=>Math.abs(line.top-(word.bottom-1))<3&&line.left<=word.left+1&&line.right>=word.right-1))
    })
    assert(joined,'phone passage rules join selected words across spaces and wrap with the source')
    await page.screenshot({path:`${output}/${label}-explain.png`})
    await page.keyboard.press('Escape')
    await explain.waitFor({state:'hidden'})
    // A single-word phone selection is a long press, not a tiny mouse drag
    // (short words fall below the reader's drag threshold).
    const visibleWords=page.locator('[data-testid="lab-page-wrap"] .lab-passage [data-testid="lab-word"]')
    const wordIndex=await visibleWords.evaluateAll(nodes=>nodes.findIndex(node=>{const r=node.getBoundingClientRect();return /^[a-z]{5,}$/.test(node.textContent||'')&&r.top>100&&r.bottom<600&&r.width>40&&r.right<innerWidth}))
    assert(wordIndex>=0,'a visible word is available for Define')
    const word=visibleWords.nth(wordIndex),box=await word.boundingBox()
    const pointer={pointerId:9,pointerType:'touch',isPrimary:true,bubbles:true,button:0,clientX:box.x+box.width/2,clientY:box.y+box.height/2}
    await word.dispatchEvent('pointerdown',pointer);await page.waitForTimeout(350);await word.dispatchEvent('pointerup',pointer)
    // defaultPopupMode opens Define directly for one word; only phrases open the actions bar.
    console.log(JSON.stringify({stage:'define-long-press',theme,standalone,word:await word.innerText(),cards:await page.locator('.lab-pcard').evaluateAll(nodes=>nodes.map(node=>node.dataset.kind))}))
    const definition=page.locator('.lab-pcard[data-kind="define"]')
    await definition.getByText('A readable dictionary meaning.',{exact:true}).waitFor().catch(async error=>{
      await page.screenshot({path:`${output}/${label}-define-failed.png`})
      console.log(JSON.stringify({stage:'define-failure',cards:await page.locator('.lab-pcard').allTextContents()}))
      throw error
    })
    const contrast=await definition.evaluate(card=>{
      // color-mix computes to color(srgb ...) in WebKit, whose channels are 0–1,
      // unlike rgb(). Let the browser resolve both formats into sRGB bytes.
      const canvas=document.createElement('canvas');canvas.width=canvas.height=1
      const ctx=canvas.getContext('2d',{willReadFrequently:true})
      const lum=color=>{ctx.clearRect(0,0,1,1);ctx.fillStyle=color;ctx.fillRect(0,0,1,1);const rgb=[...ctx.getImageData(0,0,1,1).data].slice(0,3).map(v=>v/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);return rgb[0]*.2126+rgb[1]*.7152+rgb[2]*.0722}
      const background=getComputedStyle(card).backgroundColor,bg=lum(background)
      return {background,inks:[...card.querySelectorAll('.popup-define-word,.popup-define-list li')].map(node=>{const color=getComputedStyle(node).color,ink=lum(color);return {color,ratio:(Math.max(ink,bg)+.05)/(Math.min(ink,bg)+.05)}})}
    })
    console.log(JSON.stringify({stage:'define-contrast',theme,standalone,...contrast}))
    await page.screenshot({path:`${output}/${label}-define.png`})
    assert(contrast.inks.length>=2&&contrast.inks.every(({ratio})=>ratio>=4.5),'Define headword and meanings have readable contrast in '+theme)
    await page.keyboard.press('Escape');await definition.waitFor({state:'hidden'})

    await page.getByTestId('lab-super').click()
    await page.getByTestId('lab-super-row-chat').click()
    const chat=page.locator('.lab-pcard[data-kind="chat"]')
    await chat.waitFor()
    await chat.locator('.lab-ask.is-phone-card-chat').waitFor()
    const field=chat.locator('#lab-ask-input')
    await field.waitFor()
    assert.equal(await field.evaluate(node=>document.activeElement===node),false,'opening phone Chat leaves keyboard closed')
    assert.equal((await chat.getByTestId('lab-phone-card-label').innerText()).trim(),'Chat','phone card header stays concise')
    await chat.getByRole('button',{name:'Close chat',exact:true}).waitFor()
    const conversation=await metrics(chat)
    assert.deepEqual(conversation.surface,explanation.surface,'Chat reuses the existing Explain card surface and spacing')
    assert.deepEqual(conversation.header,explanation.header,'Chat reuses the Explain header typography')
    assert.deepEqual(conversation.input,explanation.input,'Chat composer typography matches Explain follow-up')
    assert.deepEqual(conversation.composer,explanation.composer,'Chat composer shape and spacing match Explain follow-up')
    assert(conversation.box.x>=0&&conversation.box.right<=391&&conversation.box.bottom<=845,'phone Chat remains within viewport')
    await page.screenshot({path:`${output}/${label}-chat.png`})
    await field.click()
    await page.keyboard.type('Why does this matter?')
    assert.equal(await field.inputValue(),'Why does this matter?','phone Chat accepts gesture-initiated typing')
    await chat.getByTestId('lab-ask-send').click()
    await chat.getByTestId('lab-ask-turn-user').getByText('Why does this matter?',{exact:true}).waitFor()
    await chat.getByTestId('lab-ask-turn-assistant').getByText('A local phone card answer.',{exact:true}).last().waitFor()
    assert.equal(await chat.getByText('Why does this matter?',{exact:true}).count(),1,'phone conversation renders one question')
    const answered=await metrics(chat)
    assert.deepEqual(answered.answer,explanation.answer,'Chat answer typography matches Explain answer')
    await page.screenshot({path:`${output}/${label}-chat-conversation.png`})
    if(standalone){
      await field.click()
      await page.evaluate(()=>{window.__mobileCardViewport.height=480;window.__mobileCardViewport.offsetTop=40;window.__mobileCardViewport.dispatchEvent(new Event('resize'))})
      await page.waitForFunction(()=>document.querySelector('.lab-pcard[data-kind="chat"]')?.getBoundingClientRect().bottom<=521)
      const input=await field.boundingBox();assert(input&&input.y+input.height<=520,'composer remains above simulated keyboard viewport')
      await page.screenshot({path:`${output}/${label}-simulated-keyboard.png`})
    }
    await field.fill('An unfinished phone question')
    await chat.getByRole('button',{name:'Close chat',exact:true}).click()
    await chat.waitFor({state:'hidden'})
    if(standalone)await page.evaluate(()=>{window.__mobileCardViewport.height=844;window.__mobileCardViewport.offsetTop=0;window.__mobileCardViewport.dispatchEvent(new Event('resize'))})
    await page.getByTestId('lab-super').click();await page.getByTestId('lab-super-row-chat').click()
    await chat.waitFor()
    assert.equal(await chat.locator('#lab-ask-input').inputValue(),'','closing and reopening phone Chat discards the unsent draft')
    await chat.getByRole('button',{name:'Close chat',exact:true}).click()
    assert.deepEqual(errors,[])
    results.push({standalone,theme,explanation,conversation,nativeNotchAndKeyboardVerified:false})
    await context.close()
  }
  await fs.writeFile(`${output}/results.json`,JSON.stringify(results,null,2))
  console.log(JSON.stringify({passed:results.length,output,nativeNotchAndKeyboardVerified:false}))
}finally{await browser.close();await new Promise(resolve=>server.close(resolve))}
