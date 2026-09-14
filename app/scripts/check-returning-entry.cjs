/**
 * Controlled root-entry regression: actual pre-reader HTML and boot script,
 * entirely intercepted requests, no server or provider calls. A slow library
 * stylesheet must not delay a recent reader's navigation to /reader.
 *
 * Run from app/: node scripts/check-returning-entry.cjs [output-directory]
 */
const { chromium } = require('playwright')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')

const PUBLIC = path.resolve(__dirname, '../public')
const OUT = process.argv[2] || path.resolve(__dirname, '../../output/returning-entry')
const html = fs.readFileSync(path.join(PUBLIC, 'lab/index.html'), 'utf8')
const boot = fs.readFileSync(path.join(PUBLIC, 'lab/library-boot.js'), 'utf8')
const fonts = fs.readFileSync(path.join(PUBLIC, 'fonts/tinct-fonts.css'), 'utf8')
const ORIGIN = 'https://tinct-entry-fixture.invalid'

async function scenario(browser, name, cssDelay) {
  const context = await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,serviceWorkers:'block'})
  const page = await context.newPage()
  let cssReleased = false
  let readerRequest = null
  const requests = []
  const started = Date.now()
  await page.addInitScript(({name}) => {
    if (name.startsWith('returning')) {
      // Boot hint only; this made-up project key is not an auth credential.
      localStorage.setItem('sb-entry-fixture-auth-token', JSON.stringify({user:{id:'entry-fixture'}}))
      localStorage.setItem('tinct-lab-position', JSON.stringify({lastSettledAt:Date.now()}))
    }
    if (name === 'signed-out-library') {
      localStorage.setItem('tinct:lab-library-boot', JSON.stringify({v:1,at:Date.now(),userId:null,readingNow:1,finished:0,hero:{bookId:'odyssey',title:'The Odyssey',chapterLabel:'Book 1',headline:'You stopped in Book 1',coverSrc:null,coverSrcSet:null,note:null},row:[]}))
    }
  }, {name})
  await context.route('**/*', async route => {
    const url = new URL(route.request().url())
    requests.push(url.pathname)
    if (url.origin !== ORIGIN) return route.abort('blockedbyclient')
    if (url.pathname === '/' || url.pathname === '/library') return route.fulfill({contentType:'text/html',body:html})
    if (url.pathname === '/lab/library-boot.js') return route.fulfill({contentType:'text/javascript',body:boot})
    if (url.pathname === '/fonts/tinct-fonts.css') {
      await new Promise(resolve => setTimeout(resolve, cssDelay))
      cssReleased = true
      return route.fulfill({contentType:'text/css',body:fonts+'\nhtml { --entry-fixture-font-sheet: loaded; }'}).catch(() => {})
    }
    if (url.pathname === '/reader') {
      readerRequest = {atMs:Date.now()-started,cssReleased}
      return route.fulfill({contentType:'text/html',body:'<main>Reader document requested</main>'})
    }
    if (url.pathname.endsWith('.js')) return route.fulfill({contentType:'text/javascript',body:''})
    if (url.pathname.endsWith('.css')) return route.fulfill({contentType:'text/css',body:''})
    return route.fulfill({status:404,body:''})
  })
  const target = name === 'signed-out-library' ? '/library' : '/'
  try {
    await page.goto(ORIGIN+target, {waitUntil:'commit'})
    if (name.startsWith('returning')) {
      await page.waitForURL(ORIGIN+'/reader', {timeout:5000})
      assert.ok(readerRequest, 'Recent reader should request the reader document')
      if (cssDelay) assert.equal(readerRequest.cssReleased, false, 'Redirect must happen while the slow font stylesheet is still pending')
      assert.ok(!requests.some(url=>url.includes('catalogue.json') || url.startsWith('/api/')), 'Redirect must not require catalogue or API requests')
    } else {
      await page.waitForLoadState('domcontentloaded')
      const state = await page.evaluate(() => ({
        pathname:location.pathname,
        stylesheet:getComputedStyle(document.documentElement).getPropertyValue('--entry-fixture-font-sheet').trim(),
        ground:getComputedStyle(document.documentElement).backgroundColor,
        library:document.documentElement.getAttribute('data-lab-boot-view'),
        signedIn:document.documentElement.getAttribute('data-lab-auth-hint'),
        landingDisplay:getComputedStyle(document.querySelector('[data-view-panel="landing"]')).display,
        libraryDisplay:getComputedStyle(document.querySelector('[data-view-panel="library"]')).display,
        recap:document.querySelector('[data-reading-memory-recap]').getAttribute('data-boot-recap'),
      }))
      assert.equal(state.pathname, target, 'Visitor must stay on the requested surface')
      assert.equal(state.stylesheet, 'loaded', 'Visitors must still receive the font stylesheet')
      assert.equal(state.signedIn, null, 'Signed-out visitor must not get a signed-in hint')
      if (name === 'new-visitor') {
        assert.equal(state.library, null)
        assert.notEqual(state.landingDisplay, 'none')
        assert.equal(state.libraryDisplay, 'none')
      } else {
        assert.equal(state.library, 'library')
        assert.equal(state.landingDisplay, 'none')
        assert.notEqual(state.libraryDisplay, 'none')
        assert.equal(state.recap, 'snapshot')
      }
      await page.screenshot({path:path.join(OUT,name+'.png')})
      return {name,cssDelay,state}
    }
    return {name,cssDelay,readerRequest}
  } finally { await context.close() }
}

async function main() {
  fs.mkdirSync(OUT,{recursive:true})
  const browser = await chromium.launch(process.env.PW_CHROMIUM ? {executablePath:process.env.PW_CHROMIUM} : {})
  try {
    const results=[]
    for (const [name,delay] of [['returning-baseline',0],['returning-slow-css',1000],['new-visitor',100],['signed-out-library',100]]) {
      const result=await scenario(browser,name,delay)
      results.push(result)
      console.log(JSON.stringify(result))
    }
    fs.writeFileSync(path.join(OUT,'results.json'),JSON.stringify(results,null,2))
  } finally {await browser.close()}
}
main().catch(error=>{console.error(error);process.exitCode=1})
