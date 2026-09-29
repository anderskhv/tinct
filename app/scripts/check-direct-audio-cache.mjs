import {chromium} from '@playwright/test'
import http from 'node:http'
import fs from 'node:fs/promises'
import path from 'node:path'
import assert from 'node:assert/strict'
const output='artifacts/direct-audio-cache'
await fs.mkdir(output,{recursive:true})
let audioRequests=0
const bytes='0123456789abcdefghijklmnopqrstuvwxyz'
const server=http.createServer(async(req,res)=>{
 try{
  const url=new URL(req.url,'http://localhost')
  if(url.pathname==='/api/audio-file'){audioRequests++;res.writeHead(200,{'Content-Type':'audio/mpeg','Cache-Control':'no-store'});res.end(bytes);return}
  if(url.pathname.startsWith('/api/')){res.writeHead(404,{'Content-Type':'application/json'});res.end('{}');return}
  const name=url.pathname==='/reader'?'/app.html':url.pathname
  const file=path.resolve('dist','.'+name)
  if(!file.startsWith(path.resolve('dist')+'/')){res.writeHead(404);res.end();return}
  const body=await fs.readFile(file),ext=path.extname(file)
  res.writeHead(200,{'Content-Type':({'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.woff2':'font/woff2'}[ext]||'application/octet-stream'),'Cache-Control':'no-store'})
  res.end(body)
 }catch{res.writeHead(404);res.end()}
})
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve))
const origin='http://127.0.0.1:'+server.address().port
const browser=await chromium.launch()
try{
 const context=await browser.newContext({serviceWorkers:'allow'})
 const page=await context.newPage()
 await page.route('**/*',route=>new URL(route.request().url()).origin===origin?route.continue():route.abort())
 await page.addInitScript(()=>sessionStorage.setItem('tinct:lab-reader-handoff',JSON.stringify({kind:'open-reader',bookId:'frankenstein',primaryEditionKey:'original-en',savedPlace:{bookId:'frankenstein',chapterNumber:3,paragraphIndex:0,wordIndex:0,page:0}})))
 await page.goto(origin+'/reader',{waitUntil:'domcontentloaded'})
 await page.waitForFunction(()=>!!navigator.serviceWorker.controller,null,{timeout:45000})
 const url='/api/audio-file?path=narration%2Fgrok%2Fblob%2F'+'a'.repeat(64)+'.mp3'
 assert.equal(await page.evaluate(async url=>(await fetch(url)).text(),url),bytes)
 await page.waitForFunction(async url=>!!(await(await caches.open('tinct-offline-v3')).match(location.origin+url)),url)
 assert.equal(audioRequests,1)
 await page.reload({waitUntil:'domcontentloaded'})
 await page.waitForFunction(()=>!!navigator.serviceWorker.controller)
 const cached=await page.evaluate(async url=>{const r=await fetch(url,{headers:{Range:'bytes=3-8'}});return{status:r.status,body:await r.text(),range:r.headers.get('Content-Range')}},url)
 assert.deepEqual(cached,{status:206,body:'345678',range:'bytes 3-8/36'})
 assert.equal(audioRequests,1,'replay after reload did not contact the audio endpoint')
 await context.setOffline(true)
 assert.equal(await page.evaluate(async url=>(await fetch(url,{headers:{Range:'bytes=-4'}})).text(),url),'wxyz')
 await fs.writeFile(output+'/results.json',JSON.stringify({directReaderRegistration:true,reloadReplay:true,offlineByteRange:true,audioRequests},null,2))
 await context.close()
}finally{await browser.close();await new Promise(resolve=>server.close(resolve))}
