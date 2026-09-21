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

async function boot(browser, phone) {
  const context = await browser.newContext({ viewport: phone ? { width:390,height:844 } : {width:1440,height:900}, serviceWorkers:'block', hasTouch:phone })
  const page = await context.newPage()
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
  await page.addInitScript(() => {
    sessionStorage.setItem('tinct:lab-reader-handoff', JSON.stringify({kind:'open-reader',bookId:'bible',primaryEditionKey:'kjv-en',savedPlace:{bookId:'bible',chapterNumber:1,paragraphIndex:0,wordIndex:0,page:0}}))
    Object.defineProperty(navigator.mediaDevices, 'getUserMedia', { configurable:true, value:async()=>{throw Error('Microphone disabled during reader acceptance')} })
    HTMLMediaElement.prototype.play = async function(){this.muted=true}
  })
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
const wordBoxes = page => page.getByTestId('lab-word').evaluateAll(nodes=>nodes.map(node=>({
  key:node.dataset.paragraphIndex+':'+node.dataset.wordIndex,
  rects:[...node.getClientRects()].map(r=>[r.left,r.top,r.width,r.height])
})))
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
    // Single-word dictionary miss stays in the Define panel, with lexical intent.
    const lookupWord=page.getByTestId('lab-word').nth(25)
    await lookupWord.click()
    await page.getByText(definition,{exact:true}).waitFor({timeout:10000})
    assert.equal(await page.locator('.popup-define-result ol li').count(),1)
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
      await page.getByRole('button',{name:'Restore chat'}).click()
      assert((await chat.boundingBox()).height>200)
      await page.screenshot({path:output+'/'+name+'-desktop-chat.png'})
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
    assert.deepEqual(errors,[])
    result.passed=true
  } catch(error) {
    result.passed=false; result.error=error.stack
    if(state) {
      await state.page.screenshot({path:output+'/'+name+'-'+result.layout+'-failure.png'}).catch(()=>{})
      result.visibleText=(await state.page.locator('body').innerText()).slice(-4000)
    }
  } finally { await browser.close(); results.push(result) }
}
for(const [name,engine] of [['chromium',chromium],['webkit',webkit]])for(const phone of [false,true])await run(engine,name,phone)
await fs.writeFile(output+'/report.json',JSON.stringify({live,results},null,2))
console.log(JSON.stringify({live,results},null,2))
if(results.some(r=>!r.passed))process.exit(1)
