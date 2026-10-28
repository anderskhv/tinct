// Isolated local build, synthetic EPUB/auth/AI only. No external requests.
import { chromium, webkit, devices } from '@playwright/test'
import { createServer } from 'node:http'
import fs from 'node:fs/promises'
import path from 'node:path'
import assert from 'node:assert/strict'
import { zip } from '../../addbooks/web/test/make-epub.mjs'
const dist = path.resolve('dist'), output = '/tmp/tinct-private-book-primer-browser'
await fs.mkdir(output, { recursive: true })
const server = createServer(async (req,res) => {
 const url = new URL(req.url,'http://localhost')
 if(url.pathname==='/qa-seed'){res.setHeader('Content-Type','text/html');res.end('<!doctype html><title>Seed</title>');return}
 const file=path.resolve(dist,'.'+(url.pathname==='/reader'?'/app.html':url.pathname))
 if(!file.startsWith(dist+path.sep)){res.writeHead(403);res.end();return}
 try{const bytes=await fs.readFile(file);res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.woff2':'font/woff2'})[path.extname(file)]||'application/octet-stream');res.end(bytes)}catch{res.writeHead(404);res.end()}
})
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve))
const origin=`http://127.0.0.1:${server.address().port}`, hex='ab'.repeat(12), owner='private-primer-fixture'
function ownEpub(language, paragraphs, title) {
  const lang = language == null ? '' : `<dc:language>${language}</dc:language>`
  const body = paragraphs.map(text => `<p>${text}</p>`).join('')
  return zip([
    ['mimetype', 'application/epub+zip'],
    ['META-INF/container.xml', '<?xml version="1.0"?><container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container"><rootfiles><rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/></rootfiles></container>'],
    ['OEBPS/content.opf', `<?xml version="1.0"?><package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="id"><metadata xmlns:dc="http://purl.org/dc/elements/1.1/"><dc:identifier id="id">own-hyphen</dc:identifier><dc:title>${title}</dc:title><dc:creator>Test Author</dc:creator>${lang}</metadata><manifest><item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/><item id="c1" href="c1.xhtml" media-type="application/xhtml+xml"/><item id="c2" href="c2.xhtml" media-type="application/xhtml+xml"/></manifest><spine><itemref idref="c1"/><itemref idref="c2"/></spine></package>`],
    ['OEBPS/nav.xhtml', '<?xml version="1.0"?><html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops"><body><nav epub:type="toc"><ol><li><a href="c1.xhtml">Measurement</a></li><li><a href="c2.xhtml">Later letter</a></li></ol></nav></body></html>'],
    ['OEBPS/c2.xhtml', '<?xml version="1.0"?><html xmlns="http://www.w3.org/1999/xhtml"><body><h1>Later letter</h1><p>A later letter describes a different journey through the quiet town.</p></body></html>'],
    ['OEBPS/c1.xhtml', `<?xml version="1.0"?><html xmlns="http://www.w3.org/1999/xhtml"><body><h1>Measurement</h1>${body}${body}</body></html>`],
  ])
}
const bytes=[...ownEpub('en',['The first letter describes a quiet journey through the fields.','The writer asks a friend to remember the house and its garden.'],'Synthetic Letters')]
try {
 for(const [engine,launcher] of [['chromium',chromium],['webkit',webkit]]){
  const browser=await launcher.launch({headless:true,...(engine==='chromium'?{args:['--mute-audio']}: {})})
  try{for(const phone of [false,true]){
   const context=await browser.newContext({...(phone?devices['iPhone 13']:{}),viewport:phone?{width:390,height:844}:{width:1440,height:900},reducedMotion:'reduce',serviceWorkers:'block'})
   const page=await context.newPage(), requests=[], errors=[]
   page.on('pageerror',error=>errors.push(error.message))
   await page.route('**/*',async route=>{
    const url=new URL(route.request().url())
    if(url.origin!==origin)return route.abort()
    if(['/api/chat','/api/lab-chat'].includes(url.pathname)){
     const body=route.request().postDataJSON(), structured=body.companion?.chapter?.structuredPrimer
     assert.ok(structured); requests.push(body)
     assert.equal(JSON.stringify(body).includes(owner),false);assert.equal(JSON.stringify(body).includes(hex),false)
     const passage=structured.type==='book'?structured.passages.find(p=>p.id.startsWith('chapter-2:')):structured.passages[0]
     return route.fulfill({json:{content:[{type:'text',text:JSON.stringify({opening:'A private letter brings its writer and reader into a conversation.',structure:[{title:'Letters',explanation:'Follow the changing address.',quotes:[{text:passage.text,passageId:passage.id}]}],peopleAndIdeas:[],helpfulContext:[],whatToNotice:[],usefulReferences:[]})}],stop_reason:'end_turn'}})
    }
    if(url.pathname.startsWith('/api/'))return route.fulfill({status:404,json:{}})
    return route.continue()
   })
   try{
    await page.goto(origin+'/qa-seed')
    await page.evaluate(async({hex,owner,bytes})=>{
     localStorage.setItem('sb-qa-auth-token',JSON.stringify({access_token:'synthetic',user:{id:owner,email:'fixture@example.test'}}))
     const db=await new Promise((resolve,reject)=>{const r=indexedDB.open('tinct-addbook',1);r.onupgradeneeded=()=>r.result.createObjectStore('books',{keyPath:'key'});r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)})
     await new Promise((resolve,reject)=>{const tx=db.transaction('books','readwrite');tx.objectStore('books').put({key:`epub:${hex}`,kind:'epub',owner,name:'Synthetic Letters.epub',title:'Synthetic Letters',cloudId:'fixture-generation',bytes:new Uint8Array(bytes).buffer});tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error)});db.close()
    },{hex,owner,bytes})
    const readerUrl=`${origin}/reader?userBook=${hex}&sharedReader=1&layout=${phone?'phone':'desktop'}${phone?'':'&view=margin'}`
    await page.goto(readerUrl)
    const ready=()=>page.waitForFunction(()=>document.querySelector('.lab')?.dataset.readerReady==='true',null,{timeout:45000})
    await ready()
    await page.getByTestId('lab-unit-primer').first().click()
    await page.locator('.book-primer-content:visible').first().waitFor()
    assert.equal(requests.length,1)
    await page.reload();await ready()
    await page.getByTestId('lab-unit-primer').first().click()
    await page.locator('.book-primer-content:visible').first().waitFor()
    assert.equal(requests.length,1,'chapter cache survives reload')
    await page.reload();await ready()
    const openBook=async()=>{await page.getByRole('button',{name:/^Table of contents/}).click();await page.getByRole('button',{name:'Book primer',exact:true}).click();await page.locator('.book-primer-content:visible').first().waitFor()}
    const placeBefore = await page.evaluate(hex => { const p=JSON.parse(localStorage.getItem('tinct-addbook:place:'+hex)||'null'); return p && [p.chapterNumber,p.paragraphIndex,p.wordIndex] },hex)
    assert.ok(placeBefore,'a real saved position exists before opening')
    await openBook()
    assert.deepEqual(await page.evaluate(hex => { const p=JSON.parse(localStorage.getItem('tinct-addbook:place:'+hex)||'null'); return p && [p.chapterNumber,p.paragraphIndex,p.wordIndex] },hex),placeBefore)
    assert.equal(requests.length,2)
    assert.equal(requests[1].companion.chapter.structuredPrimer.type,'book')
    assert.equal(requests[1].companion.chapter.structuredPrimer.units.length,2)
    assert.ok(requests[1].companion.chapter.structuredPrimer.passages.some(p=>p.text.includes('later letter')))
    const primer=page.locator('.book-primer-content:visible').first()
    await primer.locator('summary').filter({hasText:/^Structure$/}).click()
    await primer.locator('summary').filter({hasText:/^Letters$/}).click()
    assert.equal(await primer.evaluate(el=>el.scrollWidth>el.clientWidth+1),false)
    await page.screenshot({path:`${output}/${engine}-${phone?'phone':'margin'}.png`})
    await page.reload();await ready();await openBook()
    assert.equal(requests.length,2,'whole-book cache survives reload')
    await primer.locator('summary').filter({hasText:/^Structure$/}).click()
    await primer.locator('summary').filter({hasText:/^Letters$/}).click()
    await primer.getByRole('button',{name:'Read passage'}).click()
    await page.waitForFunction(hex=>{const p=JSON.parse(localStorage.getItem('tinct-addbook:place:'+hex)||'null');return p?.chapterNumber===2&&p?.paragraphIndex===0},hex,{timeout:15000})
    await page.reload();await ready()
    assert.equal(await page.evaluate(hex=>JSON.parse(localStorage.getItem('tinct-addbook:place:'+hex)||'null')?.chapterNumber,hex),2)

    assert.deepEqual(errors,[])
    console.log(`${engine} ${phone?'phone':'margin'}: private chapter/book, complete source and durable cache PASS`)
   }catch(error){await page.screenshot({path:`${output}/${engine}-${phone?'phone':'margin'}-failure.png`});console.error(errors);throw error}finally{await context.close()}
  }}finally{await browser.close()}
 }
}finally{await new Promise(resolve=>server.close(resolve))}
