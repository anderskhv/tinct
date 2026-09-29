import http from 'node:http'
import fs from 'node:fs/promises'
import crypto from 'node:crypto'
import assert from 'node:assert/strict'
const hash = value => crypto.createHash('sha256').update(value).digest('hex')
export async function checkNativeDownloads(device, page, output) {
 const index=JSON.parse(await fs.readFile('dist/native-books/index.json','utf8'))
 const base=index.books.find(book=>book.id==='frankenstein')
 const edition=JSON.parse(await fs.readFile('public/data/editions/frankenstein-original-en.json','utf8'))
 const resources=new Map(),ids=['native-future-book','native-interrupted-book']
 let corrupt=true
 for(const id of ids) {
  const book={...base.book,id,title:'Native download fixture',editions:base.book.editions.filter(e=>e.key==='original-en')}
  const view={...base.view,id,title:book.title,editions:base.view.editions.filter(e=>e.key==='original-en'),defaultEditionKey:'original-en',defaultCompareEditionKey:null,art:null}
  // Synthetic publication identity; paragraph bytes remain the approved fixture source.
  const data=Buffer.from(JSON.stringify({...edition,bookId:id,chapters:edition.chapters.slice(0,3)}))
  const file='/data/editions/'+id+'-original-en.json'
  const manifest=JSON.stringify({schema:1,book,view,files:[{path:file,sha256:hash(data),bytes:data.length}]})
  const revision=hash(manifest),url='/native-books/'+id+'-'+revision+'.json'
  resources.set(file,data);resources.set(url,Buffer.from(manifest))
  index.books.push({id,revision,bytes:data.length,manifest:url,book,view})
  index.catalogue.books.push(view)
  for(const house of index.catalogue.houses)for(const shelf of house.shelves)
   if(shelf.bookIds.includes('frankenstein'))shelf.bookIds.push(id)
 }
 resources.set('/native-books/index.json',Buffer.from(JSON.stringify(index)))
 const calls=[]
 const server=http.createServer((request,response)=>{
  calls.push(request.url)
  const data=resources.get(request.url)
  response.setHeader('Content-Type','application/json')
  if(!data){response.writeHead(404);response.end('{}');return}
  if(corrupt && request.url.includes('native-interrupted-book-original-en')) {
   response.end(Buffer.from('x'.repeat(data.length)));return
  }
  response.end(data)
 })
 await new Promise(resolve=>server.listen(0,'0.0.0.0',resolve))
 const port=server.address().port
 await device.shell('true')
 // adb reverse is process-wide, so use the Android Playwright shell's host CLI.
 const {execFileSync}=await import('node:child_process')
 execFileSync('adb',['reverse','tcp:'+port,'tcp:'+port])
 try {
  await page.evaluate(async origin=>{
   await window.Capacitor.Plugins.NativeBooks.testOrigin({origin})
   await window.Capacitor.Plugins.NativeBooks.refresh()
  },'http://127.0.0.1:'+port)
  await page.goto('https://localhost/lab/library_2/index.html')
  await page.locator('#hero-book canvas[data-painted="true"]').waitFor({state:'attached'})
  // The installed app receives the new registry and shared handoff without rebuilding.
  const result=await page.evaluate(async()=>{
   await import('/lab/library-2-reading.js')
   return window.__tinctLibraryTwoReading.readerDestination('native-future-book','original-en')
  })
  assert.equal(result,'/reader')
  await page.goto('https://localhost/reader')
  await page.waitForFunction(()=>document.querySelector('[data-testid="lab-root"]')?.dataset.readerReady==='true')
  const text=await page.evaluate(async()=> (await fetch('/data/editions/native-future-book-original-en.json')).json())
  assert.deepEqual(text.chapters,edition.chapters.slice(0,3),'all downloaded paragraph bytes match the publication')
  console.log(JSON.stringify({nativeDownloadStage:'new-book-readable',exactText:true}))
  // A later ordinary edition appears without rebuilding or replacing the
  // already installed edition. Simultaneously changed old text is ignored.
  const modern=JSON.parse(await fs.readFile('public/data/editions/frankenstein-modern-en.json','utf8'))
  const future=index.books.find(book=>book.id==='native-future-book')
  const modernMeta=base.book.editions.find(edition=>edition.key==='modern-en')
  const modernView=base.view.editions.find(edition=>edition.key==='modern-en')
  assert(modernMeta && modernView,'fixture has a second published edition')
  const originalPath='/data/editions/native-future-book-original-en.json'
  const modernPath='/data/editions/native-future-book-modern-en.json'
  const changedOriginal=Buffer.from(JSON.stringify({...edition,bookId:future.id,chapters:edition.chapters.slice(0,3).reverse()}))
  const modernData=Buffer.from(JSON.stringify({...modern,bookId:future.id,chapters:modern.chapters.slice(0,3)}))
  resources.set(originalPath,changedOriginal);resources.set(modernPath,modernData)
  future.book={...future.book,editions:[...future.book.editions,modernMeta]}
  future.view={...future.view,editions:[...future.view.editions,modernView]}
  const updatedManifest=JSON.stringify({schema:1,book:future.book,view:future.view,files:[
   {path:originalPath,sha256:hash(changedOriginal),bytes:changedOriginal.length},
   {path:modernPath,sha256:hash(modernData),bytes:modernData.length}
  ]})
  future.revision=hash(updatedManifest);future.bytes=changedOriginal.length+modernData.length
  future.manifest='/native-books/'+future.id+'-'+future.revision+'.json'
  resources.set(future.manifest,Buffer.from(updatedManifest))
  index.catalogue.books[index.catalogue.books.findIndex(book=>book.id===future.id)]=future.view
  resources.set('/native-books/index.json',Buffer.from(JSON.stringify(index)))
  await page.evaluate(()=>window.Capacitor.Plugins.NativeBooks.refresh())
  await page.goto('https://localhost/lab/library_2/index.html')
  await page.locator('#hero-book canvas[data-painted="true"]').waitFor({state:'attached'})
  const beforeEditionReads=calls.filter(url=>url===originalPath).length
  const editions=await page.evaluate(async()=>{
   await import('/lab/native-books.js')
   await window.__tinctNativeBooks.ensure('native-future-book',['modern-en'])
   return {original:await(await fetch('/data/editions/native-future-book-original-en.json')).json(),
    modern:await(await fetch('/data/editions/native-future-book-modern-en.json')).json()}
  })
  assert.deepEqual(editions.original.chapters,edition.chapters.slice(0,3),'a new edition never replaces installed source text')
  assert.deepEqual(editions.modern.chapters,modern.chapters.slice(0,3),'new edition arrives with exact source bytes')
  assert.equal(calls.filter(url=>url===originalPath).length,beforeEditionReads,'existing text is reused without fetching a changed copy')
  console.log(JSON.stringify({nativeDownloadStage:'new-edition-readable',oldTextUnchanged:true}))
  await page.waitForTimeout(1500)
  const before=await page.evaluate(()=>Object.fromEntries(Object.entries(localStorage).filter(([key])=>/position|highlight|annotation/.test(key))))
  const failure=await page.evaluate(async()=>{
   try { await window.Capacitor.Plugins.NativeBooks.download({bookId:'native-interrupted-book'});return false }catch{return true}
  })
  assert(failure,'a corrupt transfer is rejected')
  const afterFailure=await page.evaluate(async()=> (await window.Capacitor.Plugins.NativeBooks.snapshot()).ready)
  assert(!afterFailure.includes('native-interrupted-book'),'an incomplete pack is never advertised as downloaded')
  assert.deepEqual(await page.evaluate(()=>Object.fromEntries(Object.entries(localStorage).filter(([key])=>/position|highlight|annotation/.test(key)))),before,'download failure does not touch reader data')
  console.log(JSON.stringify({nativeDownloadStage:'corrupt-transfer-rejected',readerDataUnchanged:true}))
  corrupt=false
  await page.evaluate(()=>window.Capacitor.Plugins.NativeBooks.download({bookId:'native-interrupted-book'}))
  await new Promise(resolve=>server.close(resolve))
  await device.shell('am force-stop app.tinct.reader.review')
  await device.shell('am start -n app.tinct.reader.review/app.tinct.reader.MainActivity')
  page=await(await device.webView({pkg:'app.tinct.reader.review'})).page()
  await page.locator('#hero-book canvas[data-painted="true"]').waitFor({state:'attached'})
  const offline=await page.evaluate(async()=>{
   const ready=(await window.Capacitor.Plugins.NativeBooks.snapshot()).ready
   const response=await fetch('/data/editions/native-future-book-original-en.json')
   return {ready,book:await response.json()}
  })
  assert(offline.ready.includes('native-future-book') && offline.ready.includes('native-interrupted-book'))
  assert.deepEqual(offline.book.chapters,edition.chapters.slice(0,3),'verified book survives force-close with the publication server offline')
  await fs.writeFile(output+'/native-downloads.json',JSON.stringify({postInstallBook:true,sharedReaderHandoff:true,exactParagraphs:true,newEditionAfterInstall:true,installedTextPinned:true,corruptTransferRejected:true,retryRecovery:true,forceCloseOffline:true,requests:calls.length,providerCalls:false},null,2))
  console.log(JSON.stringify({nativeDownloads:{postInstallBook:true,corruptTransferRejected:true,retryRecovery:true,forceCloseOffline:true}}))
  return {page,result:{postInstallBook:true,exactParagraphs:true,corruptTransferRejected:true,retryRecovery:true,forceCloseOffline:true}}
 } finally {
  if(server.listening)await new Promise(resolve=>server.close(resolve))
  execFileSync('adb',['reverse','--remove','tcp:'+port])
 }
}
