import { chromium, webkit } from '@playwright/test'
import fs from 'node:fs/promises'
import path from 'node:path'
import assert from 'node:assert/strict'

const live=process.env.TINCT_DESKTOP_LIVE==='1', origin='https://tinct.app', output='artifacts/omarchy'
await fs.mkdir(output,{recursive:true})
const report=[]
for(const engine of [chromium,webkit]) {
  const browser=await engine.launch({headless:true,...(engine===chromium?{args:['--mute-audio']}:{})})
  const context=await browser.newContext({viewport:{width:1440,height:900},serviceWorkers:'block'})
  const page=await context.newPage(), errors=[],requests=[]
  page.setDefaultTimeout(20000)
  page.on('pageerror',error=>errors.push(error.message))
  let palette={name:'Tokyo Night',background:'#1a1b26',foreground:'#c0caf5',accent:'#7aa2f7'}
  await page.route('**/*',async route=>{
    const req=route.request(),url=new URL(req.url())
    if(url.hostname==='127.0.0.1'&&url.port==='47653')return route.fulfill({json:palette,headers:{'access-control-allow-origin':origin}})
    if(url.pathname==='/api/narration/voices')return route.fulfill({json:{enabled:true,voices:[{key:'f',label:'Ara',persona:'female'}]}})
    if(req.method()!=='GET') {requests.push(url.pathname);return route.fulfill({status:401,json:{error:'Acceptance test: no provider calls'}})}
    if(!live&&url.origin===origin){
      const pathname=['/','/library','/library/'].includes(url.pathname)?'/lab/library_2/index.html':['/reader','/lab/phone'].includes(url.pathname)?'/app.html':url.pathname
      const file=path.resolve('dist','.'+pathname)
      if(file.startsWith(path.resolve('dist')+'/')){try{if((await fs.stat(file)).isFile())return route.fulfill({path:file})}catch{}}
    }
    return route.continue()
  })
  await page.addInitScript(()=>{
    window.__tinctKeyTrace=[];window.addEventListener('keydown',e=>{window.__tinctKeyTrace.push({key:e.key,target:e.target?.tagName,path:e.composedPath().map(n=>n.tagName).filter(Boolean),open:document.documentElement.dataset.tinctCommandsOpen,blocked:window.__tinctDesktopCommands?.blocked()});window.__tinctKeyTrace=window.__tinctKeyTrace.slice(-16);},true);
    if(navigator.mediaDevices)Object.defineProperty(navigator.mediaDevices,'getUserMedia',{configurable:true,value:async()=>{window.__tinctMicAttempts=(window.__tinctMicAttempts||0)+1;throw Error('Silent acceptance: microphone unavailable')}})
    HTMLMediaElement.prototype.play=async function(){this.muted=true}
  })
  try {
    await page.goto(origin+'/library?omarchy=1',{waitUntil:'domcontentloaded'})
    await page.locator('#library-commands').waitFor()
    await page.waitForFunction(()=>document.documentElement.dataset.tinctTheme==='omarchy')
    await page.keyboard.press('?')
    await page.getByRole('dialog',{name:'Commands & themes'}).waitFor()
    await page.getByLabel('Tinct appearance').selectOption('persia')
    await page.waitForFunction(()=>document.documentElement.dataset.tinctTheme==='persia')
    await page.screenshot({path:output+'/'+engine.name()+'-commands.png'})
    await page.keyboard.press('Escape')
    await page.waitForFunction(()=>!document.documentElement.dataset.tinctCommandsOpen)
    await page.keyboard.press('/')
    await page.getByRole('searchbox',{name:'Search books or authors'}).fill('chat talk prince')
    assert.equal(await page.locator('#librarian-panel').isVisible(),false,'typing does not open chat/talk')
    await page.keyboard.press('Escape')
    await page.locator('#header').click({position:{x:5,y:5}})
    await page.keyboard.press('c')
    await page.locator('#librarian-live .library-chat-form').waitFor()
    assert.equal(requests.filter(x=>/chat$/.test(x)).length,0,'opening chat does not send a message')
    await page.keyboard.press('Escape')
    await page.screenshot({path:output+'/'+engine.name()+'-library-persia.png'})

    await page.evaluate(()=>sessionStorage.setItem('tinct:lab-reader-handoff',JSON.stringify({kind:'open-reader',bookId:'frankenstein',primaryEditionKey:'original-en',savedPlace:{bookId:'frankenstein',chapterNumber:3,paragraphIndex:2,wordIndex:0,page:0}})))
    await page.goto(origin+'/reader',{waitUntil:'domcontentloaded'})
    await page.waitForFunction(()=>document.querySelector('[data-testid="lab-root"]')?.dataset.readerReady==='true',null,{timeout:45000})
    await page.evaluate(()=>document.fonts.ready)
    await page.waitForFunction(()=>window.__tinctDesktopCommands?.commands.length>10)
    if(live&&process.env.TINCT_EXPECTED_BUNDLE)assert(await page.locator('script[src]').evaluateAll((nodes,expected)=>nodes.some(n=>new URL(n.src).pathname===expected),process.env.TINCT_EXPECTED_BUNDLE),'production serves the expected bundle')
    const first=()=>page.getByTestId('lab-word').first().getAttribute('data-paragraph-index')
    const paragraph=await first()
    await page.keyboard.press('?')
    await page.getByLabel('Tinct appearance').selectOption('omarchy')
    await page.waitForFunction(()=>document.documentElement.style.getPropertyValue('--tinct-bg')==='#1a1b26')
    palette={name:'Gruvbox',background:'#282828',foreground:'#ebdbb2',accent:'#fabd2f'}
    await page.waitForFunction(()=>document.documentElement.style.getPropertyValue('--tinct-bg')==='#282828')
    await page.keyboard.press('Escape')
    assert.equal(await first(),paragraph,'palette changes preserve the visible passage')
    await page.screenshot({path:output+'/'+engine.name()+'-reader-omarchy.png'})
    await page.keyboard.press('c')
    await page.waitForFunction(()=>document.querySelector('[data-testid="lab-root"]')?.dataset.desktopPanel==='chat'||!!document.querySelector('.lab-ask-input,textarea'))
    // Chat is a real existing panel; Escape returns without consuming a page turn.
    await page.keyboard.press('Escape')
    assert.equal(await first(),paragraph,'chat return preserves reading position')
    await page.keyboard.press('s')
    await page.getByTestId('lab-v2-sheet').waitFor()
    await page.keyboard.press('Space')
    assert.equal(await first(),paragraph,'Space in settings never turns the page')
    await page.keyboard.press('Escape')
    await page.keyboard.press('Control+k')
    await page.getByLabel('Find a Tinct command').fill('Prince of Persia')
    await page.keyboard.press('Enter')
    await page.waitForFunction(()=>document.documentElement.dataset.tinctTheme==='persia')
    await page.screenshot({path:output+'/'+engine.name()+'-reader-persia.png'})
    await page.evaluate(()=>document.activeElement?.blur())
    await page.keyboard.press('t')
    await page.waitForFunction(()=>window.__tinctMicAttempts>0)
    assert.equal(await first(),paragraph,'Talk keeps its reading anchor even when microphone is unavailable')
    assert.equal(requests.filter(x=>/chat$|voice-session$/.test(x)).length,0,'no real AI calls during keyboard verification')
    await page.setViewportSize({width:390,height:844})
    await page.goto(origin+'/lab/phone',{waitUntil:'domcontentloaded'})
    await page.waitForFunction(()=>document.querySelector('[data-testid="lab-root"]')?.dataset.readerReady==='true',null,{timeout:45000})
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'themed phone reader fits the viewport')
    await page.screenshot({path:output+'/'+engine.name()+'-phone-persia.png'})
    assert.deepEqual(errors,[])
    report.push({engine:engine.name(),live,themeSync:true,libraryChat:true,readerCommands:true,placePreserved:true,silentTalk:true})
  } catch(error) {
    await page.screenshot({path:output+'/'+engine.name()+'-failure.png'}).catch(()=>{})
    console.error({url:page.url(),errors,requests,keys:await page.evaluate(()=>window.__tinctKeyTrace),state:await page.evaluate(()=>({theme:document.documentElement.dataset.tinctTheme,active:document.activeElement?.outerHTML.slice(0,300),open:document.documentElement.dataset.tinctCommandsOpen})),body:(await page.locator('body').innerText()).slice(0,1800)})
    throw error
  } finally {await context.close();await browser.close();await fs.writeFile(output+'/report.json',JSON.stringify(report,null,2))}
}
console.log(JSON.stringify(report))
