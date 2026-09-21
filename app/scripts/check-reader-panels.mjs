import { chromium, webkit } from '@playwright/test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'

const live = process.env.READER_LIVE === '1'
const expected = process.env.TINCT_EXPECTED_BUNDLE || ''
const origin = 'https://tinct.app'
const output = 'artifacts/reader-panels'
await fs.mkdir(output, { recursive: true })
const results = []
const explanation = 'A compact opening grounded in the selected passage.\n\nA second paragraph adds useful context and interpretation without filling the entire screen.'
const definition = 'pronoun. Used to refer to people or things already identified.'
const sse = text => 'data: ' + JSON.stringify({ type: 'content_block_delta', delta: { type: 'text_delta', text } }) + '\n\ndata: {"type":"message_stop"}\n\n'

async function boot(browser, phone, bookId='bible', edition='kjv-en', chapterNumber=1) {
  const context = await browser.newContext({ viewport: phone ? { width:390,height:844 } : {width:1440,height:900}, serviceWorkers:'block', hasTouch:phone })
  const page = await context.newPage()
  page.setDefaultTimeout(10000)
  const requests = [], errors = []
  page.on('pageerror', error => errors.push(error.message))
  await page.route('**/*', async route => {
    const req = route.request(), url = new URL(req.url())
    if (/\/api\/(lab-chat|chat)$/.test(url.pathname)) {
      const body = req.postDataJSON(); requests.push(body)
      return route.fulfill({ contentType:'text/event-stream', body:sse(JSON.stringify(body.messages).includes('<word>') ? definition : explanation) })
    }
    // Exercise the shared missing-entry UI without paying for inference.
    if (/\/data\/dict\//.test(url.pathname)) return route.fulfill({contentType:'application/json',body:'{}'})
    if (req.method() !== 'GET') return route.abort()
    if (!live && url.origin === origin) {
      const pathname = ['/reader','/lab/phone','/lab/desktop'].includes(url.pathname) ? '/app.html' : url.pathname
      const filename = path.resolve('dist', '.' + pathname)
      if (filename.startsWith(path.resolve('dist') + '/')) {
        try { if ((await fs.stat(filename)).isFile()) return route.fulfill({path:filename}) } catch {}
      }
    }
    return route.continue()
  })
  await page.addInitScript(({bookId,edition,chapterNumber}) => {
    sessionStorage.setItem('tinct:lab-reader-handoff', JSON.stringify({kind:'open-reader',bookId,primaryEditionKey:edition,savedPlace:{bookId,chapterNumber,paragraphIndex:0,wordIndex:0,page:0}}))
    Object.defineProperty(navigator.mediaDevices, 'getUserMedia', { configurable:true, value:async()=>{throw Error('Microphone disabled during reader acceptance')} })
    HTMLMediaElement.prototype.play = async function(){this.muted=true}
    window.__copied = []
    Object.defineProperty(navigator, 'clipboard', {configurable:true,value:{writeText:async text=>{window.__copied.push(text)}}})
  },{bookId,edition,chapterNumber})
  await page.goto(origin + (phone ? '/lab/phone?chrome=v2' : '/reader?chrome=v2'), {waitUntil:'domcontentloaded'})
  await page.waitForFunction(()=>document.querySelector('[data-testid="lab-root"]')?.dataset.readerReady==='true',null,{timeout:45000})
  await page.evaluate(()=>document.fonts.ready)
  await page.waitForTimeout(700)
  return {context,page,requests,errors}
}
async function clickMenu(page,id) {
  await page.getByTestId('lab-super').click()
  await page.getByTestId('lab-super-row-'+id).click()
}
// Compare the ink of each character, not span-fragment bookkeeping:
// Chromium merges adjacent inline rects when a highlight wrapper changes.
const wordBoxes = page => page.getByTestId('lab-word').evaluateAll(nodes=>nodes.map(node=>{
  const chars=[], walker=document.createTreeWalker(node,NodeFilter.SHOW_TEXT)
  let text
  while(text=walker.nextNode())for(let i=0;i<text.length;i++){
    const range=document.createRange();range.setStart(text,i);range.setEnd(text,i+1)
    chars.push({text:text.data[i],rects:[...range.getClientRects()].map(r=>[r.left,r.top,r.width,r.height])})
  }
  return {key:node.dataset.paragraphIndex+':'+node.dataset.wordIndex,chars}
}))

async function drag(page, locator, dx, dy) {
  const box = await locator.boundingBox(); assert(box)
  await page.mouse.move(box.x+Math.min(70,box.width/3),box.y+box.height/2)
  await page.mouse.down()
  await page.mouse.move(box.x+Math.min(70,box.width/3)+dx,box.y+box.height/2+dy,{steps:8})
  await page.mouse.up()
}
async function select(page) {
  const words = page.getByTestId('lab-word')
  const first = await words.nth(0).boundingBox()
  const last = await words.nth(Math.min(18,await words.count()-1)).boundingBox()
  await page.mouse.move(first.x+first.width/2,first.y+first.height/2)
  await page.mouse.down()
  await page.mouse.move(last.x+last.width/2,last.y+last.height/2,{steps:12})
  await page.mouse.up()
  await page.getByRole('button',{name:'Explain',exact:true}).waitFor()
}
async function run(engine,name,phone) {
  const browser=await engine.launch({headless:true,...(name==='chromium'?{args:['--mute-audio']}: {})})
  let state
  const result={engine:name,layout:phone?'phone':'desktop',live}
  try {
    state=await boot(browser,phone)
    const {page,requests,errors}=state
    const bundle=await page.locator('script[src]').evaluateAll(nodes=>nodes.map(n=>new URL(n.src).pathname).find(s=>/\/assets\/index-.*\.js$/.test(s)))
    result.bundle=bundle
    if(expected)assert.equal(bundle,expected)
    if(phone){
      const align=await page.evaluate(()=>{
        const title=document.querySelector('[data-testid="lab-header-work"]').getBoundingClientRect()
        const word=document.querySelector('[data-testid="lab-word"]').getBoundingClientRect()
        return {title:title.left,word:word.left}
      })
      assert(Math.abs(align.title-align.word)<2,JSON.stringify(align))
    }
    const before=await wordBoxes(page)
    await select(page)
    const after=await wordBoxes(page)
    assert.deepEqual(after,before,'selection must not change word rectangles or pagination')
    assert.equal(await page.locator('.lab-selection-hint').count(),0)
    assert(await page.locator('.lab-hearing-word.is-selecting').count()>1,'menu must retain selection paint')
    if(!phone){
      const selected=await page.locator('.lab-hearing-word.is-selecting').allTextContents()
      await page.keyboard.press('Control+c')
      await page.keyboard.press('Meta+c')
      const copied=await page.evaluate(()=>window.__copied)
      assert.equal(copied.length,2)
      assert.equal(copied[0],copied[1])
      assert(copied[0].length>=selected.join('').length,'shortcuts copy the full range')
    }
    await page.screenshot({path:output+'/'+name+'-'+result.layout+'-selection.png'})
    await page.getByRole('button',{name:'Explain',exact:true}).click()
    await page.getByText('A compact opening grounded in the selected passage.').waitFor({timeout:10000})
    await page.getByRole('button',{name:'Expand explanation',exact:true}).click()
    const popup=page.locator('.selection-popup')
    let box=await popup.boundingBox()
    assert(box.height<650,'short explanation must fit its content')
    await page.getByRole('button',{name:'Close explanation',exact:true}).waitFor({state:'visible'})
    if(!phone) {
      assert(box.width<=720,'explanation is at most one leaf wide')
      await drag(page,popup.locator('[data-reader-window-handle]'),-100,50)
      const moved=await popup.boundingBox()
      assert(Math.abs(moved.x-box.x)>40,'explanation must move')
    }
    await page.screenshot({path:output+'/'+name+'-'+result.layout+'-explanation.png'})
    await page.getByRole('button',{name:'Highlight this passage'}).click()
    await page.getByRole('button',{name:'Highlight Sage',exact:true}).click()
    await page.waitForTimeout(300)
    const recoloured=await wordBoxes(page)
    assert.deepEqual(recoloured,before,'saving a highlight must not move text')
    // Every word in a saved mark must expose deletion, not a dictionary.
    for(const index of [0,9,18]){
      await page.getByTestId('lab-word').nth(index).click()
      await page.getByRole('button',{name:'Delete highlight',exact:true}).waitFor()
      assert.equal(await page.locator('.popup-define').count(),0)
      await page.keyboard.press('Escape')
    }
    // Single-word dictionary miss stays in the Define panel, with lexical intent.
    const lookupWord=page.getByTestId('lab-word').nth(25)
    await lookupWord.click()
    await page.getByText(definition,{exact:true}).waitFor({timeout:10000})
    assert.equal(await page.locator('.popup-define-result ol li').count(),1)
    assert.notEqual((await page.locator('.popup-define [data-reader-window-handle]').innerText()).trim(),'Define')
    assert.equal(await page.getByText('Define',{exact:true}).count(),0)
    assert.equal(await page.locator('.lab-contextual-explain').count(),0)
    assert(requests.some(body=>JSON.stringify(body.messages).includes('<word>')))
    await page.screenshot({path:output+'/'+name+'-'+result.layout+'-definition.png'})
    await page.keyboard.press('Escape')
    await page.getByTestId('lab-header-book').click()
    await page.getByRole('button',{name:/Full library/}).waitFor()
    await page.getByRole('button',{name:'Close book switcher'}).click()
    if(!phone){
      const progress=page.getByTestId('lab-chapter-progress')
      assert.match(await progress.textContent(),/% of book/)
      await progress.click(); assert.match(await progress.textContent(),/% of chapter/)
      await progress.click(); assert.match(await progress.textContent(),/% of book/)
      await clickMenu(page,'chat')
      const chat=page.getByTestId('lab-ask-pane'), original=await chat.boundingBox()
      await drag(page,chat.locator('[data-reader-window-handle]'),-130,40)
      assert(Math.abs((await chat.boundingBox()).x-original.x)>60)
      const resize=chat.locator('[data-reader-window-resize]')
      await drag(page,resize,60,-50)
      await page.getByRole('button',{name:'Minimize chat'}).click()
      assert((await chat.boundingBox()).height<80)
      await drag(page,chat.locator('[data-reader-window-handle]'),0,-1000)
      assert((await chat.boundingBox()).y >= (await page.locator('.lab-header').boundingBox()).height,'window controls stay below the header')
      await page.getByRole('button',{name:'Restore chat'}).click()
      assert((await chat.boundingBox()).height>200)
      await page.screenshot({path:output+'/'+name+'-desktop-chat.png'})
      // Menus must remain clickable while a floating companion is open.
      await clickMenu(page,'settings')
      await page.getByTestId('lab-v2-sheet-close').click()
      await page.getByTestId('lab-desktop-companion-close').click()
    }
    await clickMenu(page,'settings')
    const sheet=page.getByTestId('lab-v2-sheet')
    if(!phone){
      const original=await sheet.boundingBox()
      await drag(page,sheet.locator('[data-reader-window-handle]'),-150,20)
      assert(Math.abs((await sheet.boundingBox()).x-original.x)>60)
    }
    await page.getByTestId('lab-v2-advanced').click()
    const position=await page.getByTestId('lab-root').getAttribute('data-place')
    const numeric=page.getByRole('textbox',{name:'Line spacing value'})
    await numeric.fill('1,57'); await numeric.press('Tab')
    assert.equal(await page.getByTestId('lab-v2-line-spacing').inputValue(),'1.57')
    for(const id of ['lab-v2-line-spacing','lab-v2-paragraph-spacing','lab-v2-margins']) {
      await page.getByTestId(id).focus(); await page.keyboard.press('End'); await page.waitForTimeout(300)
    }
    await page.getByRole('button',{name:'Restore defaults'}).click()
    assert.equal(await page.getByTestId('lab-v2-line-spacing').inputValue(),'1.48')
    await page.waitForTimeout(700)
    assert.equal(await page.getByTestId('lab-root').getAttribute('data-place'),position,'settings preserve position')
    await page.screenshot({path:output+'/'+name+'-'+result.layout+'-settings.png'})
    if(!phone){
      await page.setViewportSize({width:1000,height:650}); await page.waitForTimeout(400)
      box=await sheet.boundingBox()
      assert(box.x>=0&&box.y>=0&&box.x+box.width<=1001&&box.y+box.height<=651,'settings remain on screen')
      await page.screenshot({path:output+'/'+name+'-desktop-settings-small.png'})
    }
    await page.getByTestId('lab-v2-sheet-confirm').click()
    for(const theme of ['dark','light']){
      await clickMenu(page,'settings')
      await page.getByTestId('lab-v2-theme-'+theme).click()
      await page.getByTestId('lab-v2-sheet-close').click()
      await select(page)
      await page.getByRole('button',{name:'Explain',exact:true}).click()
      await page.getByText('A compact opening grounded in the selected passage.').waitFor()
      const colours=await page.locator('.lab-contextual-explain-more').evaluate(node=>{
        const style=getComputedStyle(node)
        const probe=document.createElement('i');probe.style.color=style.getPropertyValue('--lab-ink-muted');node.append(probe)
        const theme=getComputedStyle(probe).color;probe.remove();return {ink:style.color,theme}
      })
      assert.equal(colours.ink,colours.theme,'More follows the theme')
      await page.screenshot({path:output+'/'+name+'-'+result.layout+'-'+theme+'.png'})
      await page.getByRole('button',{name:'Close explanation',exact:true}).click()
    }
    await page.getByTestId('lab-header-book').click()
    await page.getByRole('button',{name:/Full library/}).click()
    await page.waitForURL('**/library**')
    assert.deepEqual(errors,[])
    result.passed=true
  } catch(error) {
    result.passed=false; result.error=error.stack
    if(state) {
      await state.page.screenshot({path:output+'/'+name+'-'+result.layout+'-failure.png'}).catch(()=>{})
      result.visibleText=(await state.page.locator('body').innerText()).slice(-4000)
      result.windows=await state.page.locator('[data-reader-window]').evaluateAll(nodes=>nodes.map(node=>{
        const box=node.getBoundingClientRect(),style=getComputedStyle(node)
        return {class:node.className,rect:box.toJSON(),inline:node.getAttribute('style'),z:style.zIndex,
          controls:[...node.querySelectorAll('button')].filter(n=>n.getBoundingClientRect().width).map(n=>{
            const b=n.getBoundingClientRect(),hit=document.elementFromPoint(b.x+b.width/2,b.y+b.height/2)
            return {label:n.getAttribute('aria-label'),rect:b.toJSON(),hit:hit?.outerHTML.slice(0,200)}
          })}
      }))
    }
  } finally { await browser.close(); results.push(result) }
}
async function compareLabel(engine,name){
  const browser=await engine.launch({headless:true,...(name==='chromium'?{args:['--mute-audio']}: {})})
  let state
  const result={engine:name,layout:'desktop-comparison',live}
  try{
    state=await boot(browser,false,'notes-from-underground','original-en')
    const {page}=state
    await clickMenu(page,'settings')
    await page.getByTestId('lab-v2-compare-edition').selectOption('modern-en')
    await page.getByTestId('lab-v2-show-compare').click()
    await page.waitForFunction(()=>document.querySelector('[data-testid="lab-root"]')?.dataset.compareActive==='true')
    const footers=page.getByTestId('lab-desktop-page-footers')
    await footers.getByText('Tinct Modern English',{exact:true}).waitFor()
    assert.equal(await footers.locator('b').count(),2)
    const divider=page.locator('.lab-compare-divider')
    await divider.waitFor()
    assert.equal((await divider.innerText()).trim(),'Compare')
    const sheet=await page.getByTestId('lab-page-wrap').boundingBox(), rule=await divider.boundingBox()
    assert(Math.abs(sheet.height-rule.height)<3,'compare rules span the full sheet')
    assert.equal(await divider.evaluate(node=>getComputedStyle(node).pointerEvents),'none')
    assert.equal(await page.getByTestId('lab-page-wrap').evaluate(node=>getComputedStyle(node,'::after').content),'none')
    await page.screenshot({path:output+'/'+name+'-desktop-comparison.png'})
    await select(page)
    await page.getByRole('button',{name:'Highlight',exact:true}).click()
    await page.getByRole('button',{name:'Highlight Sage',exact:true}).click()
    const comparisonWord=page.locator('.lab-book-col-compare [data-testid="lab-word"].is-hl-sage').first()
    await comparisonWord.click()
    await page.getByRole('button',{name:'Delete highlight',exact:true}).waitFor()
    await page.keyboard.press('Escape')
    result.passed=true
  }catch(error){
    result.passed=false;result.error=error.stack
    if(state)await state.page.screenshot({path:output+'/'+name+'-comparison-failure.png'}).catch(()=>{})
  }finally{await browser.close();results.push(result)}
}

async function checkFullPageFold(page) {
  const fold=await page.getByTestId('lab-page-wrap').evaluate(node=>{
    const rect=node.getBoundingClientRect(), style=getComputedStyle(node), paint=getComputedStyle(node,'::after')
    const columns=node.querySelector('.lab-book-columns')
    return {pageHeight:node.clientHeight, height:parseFloat(paint.height), top:parseFloat(paint.top),
      bottom:parseFloat(paint.bottom), width:parseFloat(paint.width), events:paint.pointerEvents,
      oldDivider:columns&&getComputedStyle(columns,'::after').content, shadow:style.boxShadow,
      rect:rect.toJSON(), content:paint.content}
  })
  assert(fold.content!=='none'&&fold.width>40,'binding must be visible')
  assert(Math.abs(fold.height-fold.pageHeight)<1 && fold.top===0 && fold.bottom===0,
    'binding must span the full sheet, including margins: '+JSON.stringify(fold))
  assert.equal(fold.events,'none','decoration must not intercept text selection or controls')
  assert.equal(fold.oldDivider,'none','short text must not carry a second, truncated binding')
  assert.notEqual(fold.shadow,'none')
  return fold
}
async function bookSurface(engine,name){
  const browser=await engine.launch({headless:true,...(name==='chromium'?{args:['--mute-audio']}: {})})
  let state
  const result={engine:name,layout:'desktop-book-surface',live}
  try{
    state=await boot(browser,false,'bible','kjv-en',935)
    const {page,errors}=state
    assert.equal(await page.getByTestId('lab-root').getAttribute('data-chapter'),'935')
    result.opening=await checkFullPageFold(page)
    await page.screenshot({path:output+'/'+name+'-book-spread.png'})
    // The reported failure: Matthew 6 ends with a shorter text column beside
    // a chapter-end card. Walk real page turns, never modify source layout.
    for(let i=0;i<12 && !await page.locator('.lab-chapter-end:visible').count();i++){
      await page.getByTestId('lab-page-next').click()
      await page.waitForTimeout(350)
      assert.equal(await page.getByTestId('lab-root').getAttribute('data-chapter'),'935')
    }
    await page.locator('.lab-chapter-end:visible').waitFor()
    const before=await wordBoxes(page)
    const place=await page.getByTestId('lab-root').getAttribute('data-place')
    result.terminal=await checkFullPageFold(page)
    const bare=await page.addStyleTag({content:'.lab-page-wrap::after { display:none!important }'})
    assert.deepEqual(await wordBoxes(page),before,'decorative fold must never alter text geometry')
    await bare.evaluate(node=>node.remove())
    for(const theme of ['book','light','dark']){
      await clickMenu(page,'settings')
      await page.getByTestId('lab-v2-theme-'+theme).click()
      await page.getByTestId('lab-v2-sheet-close').click()
      await page.waitForTimeout(250)
      await checkFullPageFold(page)
      assert.equal(await page.getByTestId('lab-root').getAttribute('data-place'),place)
      await page.screenshot({path:output+'/'+name+'-book-end-'+theme+'.png'})
    }
    assert.deepEqual(errors,[])
    result.passed=true
  }catch(error){
    result.passed=false;result.error=error.stack
    if(state)await state.page.screenshot({path:output+'/'+name+'-book-surface-failure.png'}).catch(()=>{})
  }finally{await browser.close();results.push(result)}
}


async function contentsAndSameEdition(engine,name,phone){
  const browser=await engine.launch({headless:true,...(name==='chromium'?{args:['--mute-audio']}: {})})
  let state
  const result={engine:name,layout:phone?'phone-contents':'desktop-contents',live}
  try{
    state=await boot(browser,phone,'the-prince','modern-en',2)
    const {page,errors}=state
    const before=await wordBoxes(page)
    await select(page)
    assert(await page.locator('.lab-hearing-word.is-selecting').count()>1,'same-edition selection stays painted with its menu')
    assert.deepEqual(await wordBoxes(page),before)
    await page.screenshot({path:output+'/'+name+'-'+result.layout+'-same-edition.png'})
    await page.keyboard.press('Escape')
    const place=await page.getByTestId('lab-root').getAttribute('data-place')
    await page.getByTestId('lab-header-chapter').click()
    const picker=page.getByTestId('lab-contents-v2')
    await picker.waitFor()
    assert.equal(await picker.locator('header .actions button').count(),2)
    assert.equal(await picker.locator('[aria-current="page"]').count(),1)
    const bounds=await picker.boundingBox()
    assert(bounds.x>=0&&bounds.y>=0&&bounds.x+bounds.width<=1440&&bounds.height<520)
    await page.screenshot({path:output+'/'+name+'-'+result.layout+'-toc.png'})
    await picker.getByRole('button',{name:'Highlights',exact:true}).click()
    await picker.getByText('No highlights saved for this edition.').waitFor()
    await picker.getByRole('button',{name:'Close overlay'}).click()
    await picker.getByRole('button',{name:'Search contents'}).click()
    await picker.getByRole('searchbox').fill('Chapter')
    await picker.locator('.result').first().waitFor()
    await page.screenshot({path:output+'/'+name+'-'+result.layout+'-search.png'})
    await page.keyboard.press('Escape')
    await page.keyboard.press('Escape')
    assert.equal(await page.getByTestId('lab-root').getAttribute('data-place'),place)
    await state.context.close()
    state=await boot(browser,phone,'bible','kjv-en',597) // Psalm 119: deep branch and scroll
    const deep=state.page
    await deep.getByTestId('lab-header-chapter').click()
    const tree=deep.getByTestId('lab-contents-v2')
    await tree.getByTestId('lab-tree-chapter-597').waitFor()
    await deep.waitForTimeout(300)
    const current=tree.getByTestId('lab-tree-chapter-597'), currentBox=await current.boundingBox(), viewport=await tree.locator('.viewport').boundingBox()
    assert(currentBox.y>=viewport.y&&currentBox.y+currentBox.height<=viewport.y+viewport.height,'picker opens at current Psalm')
    assert(await tree.locator('.gold-branch').count()>=2)
    await tree.locator('.crumbs').waitFor()
    for(const theme of ['book','dark']){
      if(theme==='dark'){
        await deep.keyboard.press('Escape')
        await clickMenu(deep,'settings')
        await deep.getByTestId('lab-v2-theme-dark').click()
        await deep.getByTestId('lab-v2-sheet-close').click()
        await deep.getByTestId('lab-header-chapter').click()
      }
      await deep.screenshot({path:output+'/'+name+'-'+result.layout+'-psalm-'+theme+'.png'})
    }
    assert.deepEqual(errors,[])
    assert.deepEqual(state.errors,[])
    for (const book of ['notes-from-underground','frederick-douglass']) {
      await state.context.close()
      state=await boot(browser,phone,book,'original-en',3)
      const contentsPage=state.page
      await contentsPage.getByTestId('lab-header-chapter').click()
      const contents=contentsPage.getByTestId('lab-contents-v2')
      await contents.getByTestId('lab-tree-chapter-3').waitFor()
      await contentsPage.evaluate(()=>document.fonts.ready)
      assert.equal(await contents.locator('[aria-current="page"]').count(),1)
      if(book==='frederick-douglass') {
        assert.equal(await contents.locator('.tree').getByRole('button',{name:'Chapters',exact:true}).getAttribute('aria-expanded'),'true')
        const heading=contents.locator('header .title')
        const titleGeometry=await heading.evaluate(node=>{
          const box=node.getBoundingClientRect(), icons=node.parentElement.querySelector('.actions').getBoundingClientRect()
          return {right:box.right,iconsLeft:icons.left,height:box.height,overflow:getComputedStyle(node).textOverflow,wrap:getComputedStyle(node).whiteSpace}
        })
        assert(titleGeometry.right<=titleGeometry.iconsLeft&&titleGeometry.height<30,'title stays on one line clear of both icons: '+JSON.stringify(titleGeometry))
        assert.equal(titleGeometry.overflow,'ellipsis')
        assert.equal(titleGeometry.wrap,'nowrap')
        await heading.click()
        await contents.locator('.full-title').getByText('Narrative of the Life of Frederick Douglass',{exact:true}).waitFor()
        await heading.click()
      }
      await contentsPage.screenshot({path:output+'/'+name+'-'+result.layout+'-'+book+'.png'})
      assert.deepEqual(state.errors,[])
    }
    result.passed=true
  }catch(error){
    result.passed=false;result.error=error.stack
    if(state){await state.page.screenshot({path:output+'/'+name+'-'+result.layout+'-failure.png'}).catch(()=>{});result.visibleText=(await state.page.locator('body').innerText()).slice(-4000)}
  }finally{await browser.close();results.push(result)}
}


async function designReference(){
  if(live)return
  const browser=await chromium.launch({headless:true,args:['--mute-audio']})
  try{
    const state=await boot(browser,false)
    const {page}=state
    await page.goto('about:blank')
    const original=await fs.readFile('../docs/verification/reader-design1-2026-09-21/chapter-picker-approved.html','utf8')
    const icons={search:'m21 21-4.34-4.34M19 11a8 8 0 1 1-16 0 8 8 0 0 1 16 0',
      highlighter:'m9 11-6 6v3h9l3-3 M22 12l-4.6 4.6a2 2 0 0 1-2.8 0l-5.2-5.2a2 2 0 0 1 0-2.8L14 4',
      'chevron-right':'m9 18 6-6-6-6',x:'m18 6-12 12M6 6l12 12','message-circle':'M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8v.5Z'}
    // Supply the prototype's icon runtime and approved font from the same
    // self-hosted files as production. Its illustrative records stay unchanged.
    const prefix='<base href="https://tinct.app/"><link rel="stylesheet" href="/fonts/tinct-fonts.css"><style>body{margin:0;color-scheme:light}@font-face{font-family:Inter;font-weight:100 900;src:url(/fonts/inter-variable.woff2)}</style><script>window.lucide={createIcons(){const paths='+JSON.stringify(icons)+';document.querySelectorAll("[data-lucide]").forEach(n=>{const s=document.createElementNS("http://www.w3.org/2000/svg","svg");s.setAttribute("viewBox","0 0 24 24");s.setAttribute("fill","none");s.setAttribute("stroke","currentColor");s.setAttribute("stroke-linecap","round");s.setAttribute("stroke-linejoin","round");const p=document.createElementNS(s.namespaceURI,"path");p.setAttribute("d",paths[n.dataset.lucide]||"");s.append(p);n.replaceWith(s)})}}<\/script>'
    for(const size of ['desktop','mobile']){
      await page.setViewportSize(size==='mobile'?{width:390,height:844}:{width:1440,height:900})
      await page.setContent(prefix+original.replace(/<link[^>]*>/,'').replace("size:'desktop'","size:'"+size+"'"))
      await page.evaluate(()=>document.fonts.ready)
      await page.waitForTimeout(150)
      await page.locator('#chapter-review .menu').screenshot({path:output+'/design-reference-'+size+'.png'})
    }
  }finally{await browser.close()}
}
await designReference()

for(const [name,engine] of [['chromium',chromium],['webkit',webkit]]){
  for(const phone of [false,true])await run(engine,name,phone)
  await compareLabel(engine,name)
  await bookSurface(engine,name)
  for(const phone of [false,true])await contentsAndSameEdition(engine,name,phone)
}
await fs.writeFile(output+'/report.json',JSON.stringify({live,results},null,2))
console.log(JSON.stringify({live,results},null,2))
if(results.some(r=>!r.passed))process.exit(1)
