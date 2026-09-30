import { chromium, webkit } from '@playwright/test'
import fs from 'node:fs/promises'
import path from 'node:path'
import assert from 'node:assert/strict'
import os from 'node:os'
import { spawn } from 'node:child_process'

const live=process.env.TINCT_DESKTOP_LIVE==='1', origin=(process.env.TINCT_ORIGIN||'https://tinct.app').replace(/\/+$/,''), output='artifacts/omarchy'
await fs.mkdir(output,{recursive:true})
const report=[]
// Candidate browsers must enforce the deployed policy, not an unrestricted
// file response. Otherwise a production-only CSP regression can hide in CI.
const securitySource=await fs.readFile('src/worker/routes/seo.ts','utf8')
const candidateCsp=securitySource.match(/'Content-Security-Policy': "([^"]+)"/)?.[1]
assert(candidateCsp,'production CSP is available to candidate acceptance')
// A real read-only bridge in an isolated fixture home: exercise Chromium's HTTPS
// to loopback transport and CORS, not just a mocked palette response.
const fixture=await fs.mkdtemp(path.join(os.tmpdir(),'tinct-theme-'))
const themeDir=path.join(fixture,'.local/state/omarchy/current/theme')
await fs.mkdir(themeDir,{recursive:true})
async function paletteFile(p){
  await fs.writeFile(path.join(themeDir,'colors.toml'),`background="${p.background}"\nforeground="${p.foreground}"\naccent="${p.accent}"\n`)
  await fs.writeFile(path.join(themeDir,'../theme.name'),p.name)
}
await paletteFile({name:'Tokyo Night',background:'#1a1b26',foreground:'#c0caf5',accent:'#7aa2f7'})
const bridge=spawn('python3',['-c',`import importlib.util,sys
spec=importlib.util.spec_from_file_location('bridge','public/omarchy/bridge.py')
m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
read=m.read_theme;home=sys.argv[1];m.read_theme=lambda:read(home)
sys.argv=[sys.argv[0]];m.main()`,fixture],{stdio:['ignore','ignore','inherit']})
// The fixture is an argument to the wrapper, not to the production CLI.
bridge.on('error',error=>console.error(error))
try {
for(let i=0;i<50;i++){try{if((await fetch('http://127.0.0.1:47653/health')).ok)break}catch{};if(i===49)throw Error('Theme bridge did not start');await new Promise(r=>setTimeout(r,100))}
for(const engine of [chromium,webkit]) {
  const browser=await engine.launch({headless:true,...(engine===chromium?{args:['--mute-audio']}:{})})
  const context=await browser.newContext({viewport:{width:1440,height:900},serviceWorkers:'block'})
  if(engine===chromium)await context.grantPermissions(['local-network-access'],{origin})
  const page=await context.newPage(), errors=[],requests=[],network=[]
  const shot=async name=>{
    await page.screenshot({path:output+'/'+engine.name()+'-'+name+'.png'})
    if(process.env.TINCT_DESKTOP_VISUAL==='1')console.log('TINCT_SCREENSHOT '+engine.name()+'-'+name+' '+(await page.screenshot({type:'jpeg',quality:50})).toString('base64'))
  }
  page.setDefaultTimeout(20000)
  page.on('pageerror',error=>{errors.push(error.message);network.push({kind:'pageerror',at:Date.now(),url:page.url(),message:error.message,stack:error.stack})})
  page.on('requestfailed',req=>network.push({kind:'failed',at:Date.now(),url:req.url(),failure:req.failure(),resource:req.resourceType()}))
  page.on('response',response=>{if(response.url().includes('/spines/'))network.push({kind:'response',at:Date.now(),url:response.url(),status:response.status(),headers:response.headers()})})
  page.on('console',message=>{if(message.text().startsWith('WARM_TRACE '))network.push({kind:'browser',at:Date.now(),message:message.text()})})
  await page.addInitScript(()=>{
    const trace=(event,extra={})=>console.log('WARM_TRACE '+JSON.stringify({event,url:location.href,at:performance.now(),...extra}))
    window.addEventListener('pagehide',()=>trace('pagehide'))
    window.addEventListener('unhandledrejection',event=>trace('unhandledrejection',{message:String(event.reason),stack:event.reason?.stack}))
    const fetch=window.fetch.bind(window)
    window.fetch=(input,init)=>{
      const url=String(input)
      if(!url.includes('/spines/'))return fetch(input,init)
      trace('fetch-start',{request:url})
      return fetch(input,init).then(response=>{trace('fetch-response',{request:url,status:response.status});return response},error=>{trace('fetch-reject',{request:url,message:String(error),aborted:init?.signal?.aborted});throw error})
    }
  })
  await paletteFile({name:'Tokyo Night',background:'#1a1b26',foreground:'#c0caf5',accent:'#7aa2f7'})
  await page.route('**/*',async route=>{
    const req=route.request(),url=new URL(req.url())
    if(url.hostname==='127.0.0.1'&&url.port==='47653')return route.continue()
    if(url.pathname==='/api/narration/voices')return route.fulfill({json:{enabled:true,voices:[{key:'f',label:'Ara',persona:'female'}]}})
    if(req.method()!=='GET') {requests.push(url.pathname);return route.fulfill({status:401,json:{error:'Acceptance test: no provider calls'}})}
    if(!live&&url.origin===origin){
      const pathname=['/','/library','/library/'].includes(url.pathname)?'/lab/library_2/index.html':['/reader'].includes(url.pathname)?'/app.html':url.pathname
      const file=path.resolve('dist','.'+pathname)
      if(file.startsWith(path.resolve('dist')+'/')){try{if((await fs.stat(file)).isFile())return route.fulfill({path:file,headers:{'Content-Security-Policy':candidateCsp}})}catch{}}
    }
    return route.continue()
  })
  if(engine===webkit)await page.addInitScript(()=>{
    // Safari is a compatibility/fallback check; Omarchy runs Chromium. Simulate
    // an unavailable bridge without overriding its other network requests.
    const fetch=window.fetch.bind(window)
    window.fetch=(input,options)=>String(input).startsWith('http://127.0.0.1:47653/')?Promise.reject(new TypeError('Theme bridge unavailable')):fetch(input,options)
  })
  await page.addInitScript(()=>{
    window.__tinctKeyTrace=[];window.addEventListener('keydown',e=>{window.__tinctKeyTrace.push({key:e.key,target:e.target?.tagName,path:e.composedPath().map(n=>n.tagName).filter(Boolean),open:document.documentElement.dataset.tinctCommandsOpen,blocked:window.__tinctDesktopCommands?.blocked()});window.__tinctKeyTrace=window.__tinctKeyTrace.slice(-16);},true);
    // Replace the navigator getter so both browser engines use the same silent
    // microphone boundary, including their native audio-session prerequisite.
    const mediaDevices={getUserMedia:async()=>{window.__tinctMicAttempts=(window.__tinctMicAttempts||0)+1;throw Error('Silent acceptance: microphone unavailable')}}
    Object.defineProperty(navigator,'mediaDevices',{configurable:true,get:()=>mediaDevices})
    Object.defineProperty(navigator,'audioSession',{configurable:true,value:{type:'auto'}})
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
    await shot('commands')
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
    await shot('library-persia')

    await page.evaluate(()=>sessionStorage.setItem('tinct:lab-reader-handoff',JSON.stringify({kind:'open-reader',bookId:'frankenstein',primaryEditionKey:'original-en',savedPlace:{bookId:'frankenstein',chapterNumber:3,paragraphIndex:2,wordIndex:0,page:0}})))
    await page.goto(origin+'/reader',{waitUntil:'domcontentloaded'})
    await page.waitForFunction(()=>document.querySelector('[data-testid="lab-root"]')?.dataset.readerReady==='true',null,{timeout:45000})
    await page.evaluate(()=>document.fonts.ready)
    await page.waitForFunction(()=>window.__tinctDesktopCommands?.commands.length>10)
    if(live&&process.env.TINCT_EXPECTED_BUNDLE)assert(await page.locator('script[src]').evaluateAll((nodes,expected)=>nodes.some(n=>new URL(n.src).pathname===expected),process.env.TINCT_EXPECTED_BUNDLE),'production serves the expected bundle')
    const first=()=>page.getByTestId('lab-word').first().getAttribute('data-paragraph-index')
    const paragraph=await first();assert.notEqual(paragraph,null,'the test anchors an actual visible paragraph')
    await page.keyboard.press('?')
    await page.getByLabel('Tinct appearance').selectOption('omarchy')
    if(engine===chromium){
      await page.waitForFunction(()=>document.documentElement.style.getPropertyValue('--tinct-bg')==='#1a1b26')
      await paletteFile({name:'Gruvbox',background:'#282828',foreground:'#ebdbb2',accent:'#fabd2f'})
      await page.waitForFunction(()=>document.documentElement.style.getPropertyValue('--tinct-bg')==='#282828')
    }else await page.getByRole('status').filter({hasText:'Theme connection unavailable'}).waitFor()
    await page.keyboard.press('Escape')
    assert.equal(await first(),paragraph,'palette changes preserve the visible passage')
    await shot('reader-omarchy')
    if(engine===chromium){
      const blocked=await page.evaluate(async()=>{
        const violation=new Promise(resolve=>{
          const timer=setTimeout(()=>resolve(null),5000)
          document.addEventListener('securitypolicyviolation',e=>{clearTimeout(timer);resolve({directive:e.effectiveDirective,url:e.blockedURI})},{once:true})
        })
        const denied=await fetch('http://127.0.0.1:47653/health',{targetAddressSpace:'loopback'}).then(()=>false,()=>true)
        return {denied,violation:await violation}
      })
      assert.equal(blocked.denied,true,'the live bridge health route remains outside the allowed palette path')
      assert.equal(blocked.violation?.directive,'connect-src')
      assert(blocked.violation.url.startsWith('http://127.0.0.1:47653'))
    }
    if(engine===chromium){
      await paletteFile({name:'Light',background:'#fafafa',foreground:'#202124',accent:'#375f98'})
      await page.waitForFunction(()=>document.documentElement.dataset.tinctReaderDark==='false')
      assert.equal(await first(),paragraph,'light/dark desktop changes preserve the passage')
      await shot('reader-omarchy-light')
      await paletteFile({name:'Gruvbox',background:'#282828',foreground:'#ebdbb2',accent:'#fabd2f'})
      await page.waitForFunction(()=>document.documentElement.dataset.tinctReaderDark==='true')
    }
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
    await shot('reader-persia')
    await page.evaluate(()=>document.activeElement?.blur())
    if(engine===chromium){
      await page.keyboard.press('f')
      await page.waitForFunction(()=>!!document.fullscreenElement)
      await page.keyboard.press('?')
      await page.getByRole('dialog',{name:'Commands & themes'}).waitFor()
      await page.keyboard.press('Escape')
      await page.waitForFunction(()=>!document.documentElement.dataset.tinctCommandsOpen)
      await page.keyboard.press('f')
      await page.waitForFunction(()=>!document.fullscreenElement)
    }
    const anchor=()=>page.getByTestId('lab-word').first().evaluate(n=>document.querySelector('[data-testid="lab-root"]').dataset.chapter+':'+n.dataset.paragraphIndex+':'+n.dataset.wordIndex)
    const initial=await anchor()
    const initialChapter=initial.split(':')[0]
    await page.keyboard.press('j')
    await page.waitForFunction(initial=>{const n=document.querySelector('[data-testid="lab-word"]');return n&&document.querySelector('[data-testid="lab-root"]').dataset.chapter+':'+n.dataset.paragraphIndex+':'+n.dataset.wordIndex!==initial},initial)
    await page.keyboard.press('k')
    await page.waitForFunction(chapter=>{const root=document.querySelector('[data-testid="lab-root"]');return root?.dataset.readerReady==='true'&&root.dataset.chapter===chapter},initialChapter)
    // At a chapter boundary the existing reader retreats to the previous
    // chapter's last page, which need not be the old spread's first leaf.
    // Chapter data readiness precedes final font measurement/pagination.
    // Record the settled page before testing disabled keys, not an intermediate
    // last-page index while the previous-chapter transition is still resolving.
    await page.evaluate(async()=>{
      await document.fonts.ready
      const started=performance.now();let previous='',stableSince=started
      while(performance.now()-started<10000){
        const root=document.querySelector('[data-testid="lab-root"]'),word=document.querySelector('[data-testid="lab-word"]')
        const value=root?.dataset.chapter+':'+word?.dataset.paragraphIndex+':'+word?.dataset.wordIndex
        if(value!==previous||root?.dataset.readerReady!=='true'){previous=value;stableSince=performance.now()}
        if(word&&performance.now()-stableSince>=500)return
        await new Promise(resolve=>setTimeout(resolve,50))
      }
      throw Error('Reader did not settle after returning to the previous chapter')
    })
    const returned=await anchor(),settledParagraph=await first()
    await page.keyboard.press('Control+k')
    await page.getByLabel('Letter shortcuts').uncheck()
    await page.keyboard.press('Escape')
    await page.waitForFunction(()=>!document.documentElement.dataset.tinctCommandsOpen)
    await page.keyboard.press('j')
    assert.equal(await anchor(),returned,'letter shortcuts can be disabled')
    await page.keyboard.press('Control+k')
    await page.getByLabel('Letter shortcuts').check()
    await page.keyboard.press('Escape')
    await page.waitForFunction(()=>!document.documentElement.dataset.tinctCommandsOpen)
    await page.keyboard.press('t')
    // Guests are asked to create an account before Talk opens a voice session;
    // signed-in readers reach the (silenced) microphone. Either keeps the page.
    await page.waitForFunction(()=>window.__tinctMicAttempts>0||!!document.querySelector('[data-testid="lab-account-sheet"]'))
    if(await page.getByTestId('lab-account-sheet').isVisible().catch(()=>false)){
      await page.getByTestId('lab-account-keep-reading').click()
      await page.getByTestId('lab-account-sheet').waitFor({state:'hidden'})
    }
    assert.equal(await first(),settledParagraph,'Talk keeps its reading anchor even when microphone is unavailable')
    assert.equal(requests.filter(x=>/chat$|voice-session$/.test(x)).length,0,'no real AI calls during keyboard verification')
    await page.setViewportSize({width:390,height:844})
    await page.goto(origin+'/reader?layout=phone',{waitUntil:'domcontentloaded'})
    await page.waitForFunction(()=>document.querySelector('[data-testid="lab-root"]')?.dataset.readerReady==='true',null,{timeout:45000})
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'themed phone reader fits the viewport')
    await shot('phone-persia')
    assert.deepEqual(errors,[])
    report.push({engine:engine.name(),live,themeSync:engine===chromium?'real-loopback':'unavailable-fallback',libraryChat:true,readerCommands:true,placePreserved:true,silentTalk:true})
  } catch(error) {
    await shot('failure').catch(()=>{})
    console.error({url:page.url(),errors,requests,keys:await page.evaluate(()=>window.__tinctKeyTrace),state:await page.evaluate(()=>({theme:document.documentElement.dataset.tinctTheme,active:document.activeElement?.outerHTML.slice(0,300),open:document.documentElement.dataset.tinctCommandsOpen})),body:(await page.locator('body').innerText()).slice(0,1800)})
    throw error
  } finally {await context.close();await browser.close();await fs.writeFile(output+'/report.json',JSON.stringify(report,null,2));await fs.writeFile(output+'/'+engine.name()+'-network.json',JSON.stringify(network,null,2))}
}
console.log(JSON.stringify(report))
} finally {bridge.kill();await fs.rm(fixture,{recursive:true,force:true})}
