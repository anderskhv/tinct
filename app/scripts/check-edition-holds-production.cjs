const assert = require('node:assert/strict')
const fs = require('node:fs')
const { createHash } = require('node:crypto')
const manifest = require('../src/data/editionAvailability.json')
const { checkHeaders } = require('./lib/internalTraffic.cjs')
const { offeredDanishBooks } = require('./lib/offeredDanish.cjs')
const origin = 'https://tinct.app'
const version = process.env.EXPECTED_BUILD_SHA
assert.ok(version, 'Pin production evidence to the deployed commit')
const get = async path => {
  const response = await fetch(origin + path, {headers:checkHeaders({'User-Agent':'Tinct-availability-verification'})})
  assert.equal(response.status,200,path)
  return response
}
;(async()=>{
 const catalogue = await (await get('/lab/catalogue.json?v='+version)).json()
 const results=[]
 for(const [identity,evidence] of Object.entries(manifest.editions)){
   const [bookId,editionKey]=identity.split('/')
   const book=catalogue.books.find(b=>b.id===bookId)
   assert.ok(book,identity+' retained for saved readers')
   assert.equal(book.editions.find(e=>e.key===editionKey)?.discoveryAvailable,false,identity)
   assert.notEqual(book.defaultEditionKey,editionKey,identity+' not a new-reader default')
   const response=await get('/read/'+bookId+'?edition='+editionKey+'&chapter=1&paragraph=2&word=1')
   const html=await response.text()
   assert.ok(html.includes('Temporarily unavailable'),identity+' direct link')
   assert.ok(html.includes('heldEdition='+editionKey),identity+' exact recovery edition')
   assert.ok(html.includes('paragraph=2'),identity+' exact recovery paragraph')
   assert.equal(response.headers.get('cache-control'),'no-store')
   const bytes=Buffer.from(await (await get('/data/editions/'+bookId+'-'+editionKey+'.json?v='+version)).arrayBuffer())
   const sha256=createHash('sha256').update(bytes).digest('hex')
   assert.equal(sha256,evidence.sha256,identity+' asset unchanged')
   results.push({identity,sha256,discovery:false,directLink:true})
 }
 const hub=await (await get('/read/')).text()
 const sitemap=await (await get('/sitemap.xml')).text()
 for(const id of manifest.wholeBooks){
   assert.ok(!hub.includes('/read/'+id),id+' absent from static discovery hub')
   assert.ok(!sitemap.includes('/read/'+id),id+' absent from sitemap')
   assert.equal(catalogue.books.find(b=>b.id===id)?.discoveryAvailable,false)
   assert.ok(!catalogue.houses.some(h=>h.shelves.some(s=>s.bookIds.includes(id))))
 }
 for(const [id,key] of [['faust-part-1','modern-en'],['jerusalem','modern-en'],['macbeth','modern-en'],['as-you-like-it','modern-en']]){
   const book=catalogue.books.find(b=>b.id===id)
   assert.equal(book.discoveryAvailable,true)
   assert.equal(book.defaultEditionKey,key)
   assert.equal(book.editions.find(e=>e.key===key)?.discoveryAvailable,true)
   assert.ok(!(await (await get('/read/'+id+'?edition='+key)).text()).includes('<h2>Temporarily unavailable</h2>'))
 }
 // Danish stays withdrawn everywhere except the offered editions (OFFERED_DANISH_EDITIONS).
 for(const identity of ['jane-eyre/modern-da','odyssey/modern-da']){
   const [bookId,editionKey]=identity.split('/')
   assert.equal(catalogue.books.find(b=>b.id===bookId)?.editions.find(e=>e.key===editionKey)?.discoveryAvailable,false,identity)
   const html=await (await get('/read/'+bookId+'?edition='+editionKey+'&chapter=1&paragraph=2&word=1')).text()
   assert.ok(html.includes('Temporarily unavailable')&&html.includes('heldEdition='+editionKey),identity+' still held')
   results.push({identity,discovery:false,held:true})
 }
 for(const bookId of offeredDanishBooks()){
   const identity=bookId+'/modern-da',book=catalogue.books.find(b=>b.id===bookId)
   assert.equal(book.editions.find(e=>e.key==='modern-da')?.discoveryAvailable,true,identity+' offered')
   assert.equal(book.defaultEditionKey,'modern-en',identity+' not a new-reader default')
   assert.notEqual(book.defaultCompareEditionKey,'modern-da',identity+' not a default compare')
   assert.ok(!(await (await get('/read/'+bookId+'?edition=modern-da')).text()).includes('<h2>Temporarily unavailable</h2>'),identity+' not held')
   const local=fs.readFileSync('public/data/editions/'+bookId+'-modern-da.json')
   const sha256=createHash('sha256').update(Buffer.from(await (await get('/data/editions/'+bookId+'-modern-da.json?v='+version)).arrayBuffer())).digest('hex')
   assert.equal(sha256,createHash('sha256').update(local).digest('hex'),identity+' served bytes')
   results.push({identity,sha256,discovery:true,held:false})
 }
 for(const text of [hub,sitemap])assert.ok(!text.includes('modern-da'),'Danish edition absent from static discovery and sitemap')
 fs.mkdirSync('artifacts/edition-holds-production',{recursive:true})
 fs.writeFileSync('artifacts/edition-holds-production/served-evidence.json',JSON.stringify({version,at:new Date().toISOString(),results},null,2))
})().catch(error=>{console.error(error);process.exitCode=1})
