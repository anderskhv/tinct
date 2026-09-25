const { chromium, webkit } = require('playwright')
const fs = require('node:fs')
const path = require('node:path')
const http = require('node:http')
const assert = require('node:assert/strict')
const manifest = require('../src/data/editionAvailability.json')
const dir = process.env.ARTIFACT_DIR || 'artifacts/edition-holds'
fs.mkdirSync(dir, { recursive: true })
const origin = process.env.TEST_ORIGIN || 'http://127.0.0.1:5197'
let server
if (!process.env.TEST_ORIGIN) {
  const hub=fs.readFileSync('dist/read/index.html','utf8')
  const sitemap=fs.readFileSync('dist/sitemap.xml','utf8')
  for(const id of manifest.wholeBooks){
    assert.ok(!hub.includes('/read/'+id),id+' absent from static discovery')
    assert.ok(!sitemap.includes('/read/'+id),id+' absent from sitemap')
  }
  server = http.createServer((req,res) => {
    const url = new URL(req.url, origin)
    const file = path.resolve('dist', '.' + (['/reader','/lab/phone','/lab/desktop'].includes(url.pathname) ? '/app.html' : url.pathname))
    if (!file.startsWith(path.resolve('dist') + '/') || !fs.existsSync(file) || !fs.statSync(file).isFile()) { res.writeHead(404);res.end();return }
    const type = {'.js':'application/javascript','.css':'text/css','.json':'application/json','.html':'text/html','.woff2':'font/woff2'}[path.extname(file)] || 'application/octet-stream'
    res.writeHead(200, {'Content-Type':type});fs.createReadStream(file).pipe(res)
  }).listen(5197)
}
;(async () => {
 const browsers = { desktop: await chromium.launch({args:['--mute-audio']}), phone: await webkit.launch() }
 const results=[]
 try {
  for (const [key,evidence] of Object.entries(manifest.editions)) {
   const [bookId,editionKey] = key.split('/')
   for (const width of [390,1440]) {
    const context=await (width < 900 ? browsers.phone : browsers.desktop).newContext({viewport:{width,height:900},isMobile:width<900,hasTouch:width<900})
    const page=await context.newPage()
    const writes=[]
    await page.route('**/api/**',r=>{ if (!['GET','HEAD'].includes(r.request().method())) writes.push(r.request().url());return r.fulfill({status:404,body:'{}'}) })
    await page.route('**/*.supabase.co/**',r=>r.fulfill({status:200,contentType:'application/json',body:'[]'}))
    const place={bookId,headerBook:bookId,chapterNumber:1,sequentialChapter:1,paragraphIndex:2,wordIndex:1,pageIndex:0,primaryEditionKey:editionKey,updatedAt:1700000000000,deviceId:'hold-test-device',rev:1}
    const position={books:{[bookId]:place},recentChapters:{},finished:{},hidden:{},lastSettledBookId:bookId,lastSettledAt:place.updatedAt,updatedAt:place.updatedAt,deviceId:place.deviceId,owner:null}
    const highlights=[{id:'hold-note',bookId,editionKey,chapterNumber:1,paragraphIndex:2,fromWord:0,endParagraphIndex:2,toWord:2,color:'yellow',text:'Preserved quotation',note:'Preserved personal note',kept:true}]
    const history={v:1,updatedAt:place.updatedAt,sessions:{preserved:{id:'preserved',seq:1,deviceId:place.deviceId,owner:null,state:'progressed',startedAt:place.updatedAt-1000,lastActiveAt:place.updatedAt,endedAt:place.updatedAt,completedAt:null,anchor:{bookId,editionKey,chapterNumber:1,chapterLabel:'Chapter 1',page:1,totalPages:null,paragraphIndex:2,wordIndex:1,range:{startParagraphIndex:2,startWordIndex:0,startCharOffset:0,endParagraphIndex:2,endWordIndex:2,endCharOffset:19,firstWords:'Preserved quotation',lastWords:'Preserved quotation'}}}}}
    const seed={'tinct:reading-memory':JSON.stringify(history),'tinct-lab-position':JSON.stringify(position),'tinct-lab-highlights':JSON.stringify(highlights),'tinct-lab-highlights-tap-cleanup-v1':'1',['tinct:notes:'+bookId]:'legacy-note',['tinct:reading-log:'+bookId]:'legacy-history'}
    await page.addInitScript(({seed,bookId,editionKey,width})=>{
      if(sessionStorage.getItem('hold-test-seeded'))return
      sessionStorage.setItem('hold-test-seeded','1')
      for(const [key,value] of Object.entries(seed))localStorage.setItem(key,value)
      if(width<900)sessionStorage.setItem('tinct:lab-reader-handoff',JSON.stringify({kind:'open-reader',bookId,primaryEditionKey:editionKey,savedPlace:{bookId,chapterNumber:1,paragraphIndex:2,wordIndex:1,page:0}}))
    },{seed,bookId,editionKey,width})
    await page.goto(origin+'/reader')
    await page.getByTestId('edition-hold').waitFor({timeout:30000})
    assert.ok((await page.getByTestId('edition-hold').innerText()).includes(evidence.reason))
    await page.getByText('Saved highlights and notes (1)',{exact:true}).click()
    await page.getByText('Preserved personal note',{exact:true}).waitFor()
    const unchanged=async()=> {
      const actual=await page.evaluate(keys=>Object.fromEntries(keys.map(key=>[key,localStorage.getItem(key)])),Object.keys(seed))
      assert.deepEqual(actual,seed,key+' '+width+' preserves all fixture bytes')
    }
    await unchanged()
    await page.screenshot({path:dir+'/'+bookId+'-'+editionKey+'-'+width+'.png'})
    await page.getByRole('button',{name:'Open preserved edition and annotations'}).click()
    await page.getByTestId('edition-hold-recovery').waitFor()
    await page.waitForFunction(() => document.querySelector('[data-testid="lab-root"]')?.dataset.readerReady === 'true',null,{timeout:30000})
    assert.equal(await page.getByTestId('lab-root').getAttribute('data-reader-edition'),editionKey)
    await page.locator('.lab-page-wrap [data-testid="lab-word"]').first().waitFor()
    await page.waitForTimeout(1500)
    await page.keyboard.press('ArrowRight')
    await page.waitForTimeout(500)
    await unchanged()
    assert.equal(writes.length,0,'No account writes during hold/recovery: '+writes.join(','))
    results.push({bookId,editionKey,width,preserved:true,recovery:true})
    await context.close()
   }
  }
  fs.writeFileSync(dir+'/results.json',JSON.stringify(results,null,2))
 } finally { await Promise.all(Object.values(browsers).map(browser=>browser.close())); if(server)server.close() }
})().catch(e=>{console.error(e);if(server)server.close();process.exitCode=1})
