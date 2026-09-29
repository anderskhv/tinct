import {chromium} from '@playwright/test'
import fs from 'node:fs/promises'
import path from 'node:path'
import assert from 'node:assert/strict'
const out='artifacts/library-visual',origin='https://tinct.app'
await fs.mkdir(out,{recursive:true})
let browser=await chromium.launch({headless:true})
async function routeLocal(context){
 await context.route('**/*',async route=>{
  const u=new URL(route.request().url())
  if(u.origin!==origin)return route.abort()
  if(u.pathname.startsWith('/api/'))return route.fulfill({status:404,json:{}})
  const file=path.resolve('dist','.'+(u.pathname==='/'?'/lab/library_2/index.html':u.pathname.endsWith('/')?u.pathname+'index.html':u.pathname))
  try{if(file.startsWith(path.resolve('dist')+'/')&&(await fs.stat(file)).isFile())return route.fulfill({path:file})}catch{}
  return route.abort()
 })
}
try{
 const context=await browser.newContext({viewport:{width:1440,height:950},serviceWorkers:'block'})
 await routeLocal(context)
 const page=await context.newPage()
 await page.goto(origin+'/lab/library_2/?view=new',{waitUntil:'domcontentloaded'})
 await page.waitForFunction(()=>document.querySelectorAll('canvas[data-book]').length>100)
 const inventory=await page.evaluate(async()=>{
  const {loadCatalogue,libraryBook}=await import('/lab/library_2/catalogue.js')
  return (await loadCatalogue()).books.map(entry=>({id:entry.id,title:entry.title,author:entry.author,source:libraryBook(entry).cover}))
 })
 const covers=[]
 for(const book of inventory){
  const canvas=page.locator('canvas[data-book="'+book.id+'"]').first()
  assert(await canvas.count(),'Discoverable cover not rendered: '+book.id)
  await canvas.scrollIntoViewIfNeeded()
  await page.waitForFunction(id=>document.querySelector('canvas[data-book="'+id+'"]')?.dataset.painted==='true',book.id)
  const rendered=await canvas.evaluate(c=>({data:c.toDataURL('image/png'),width:c.width,height:c.height}))
  covers.push({...book,...rendered})
 }
 await fs.writeFile(out+'/cover-inventory.json',JSON.stringify(covers.map(({data,...entry})=>entry),null,2))
 for(let index=0;index<covers.length;index+=20){
  await page.setContent('<html><body><main></main></body></html>')
  await page.addStyleTag({content:'body{margin:0;background:#e8dfca;color:#211c16;font:16px Georgia}main{display:grid;grid-template-columns:repeat(5,1fr);gap:18px;padding:24px}figure{margin:0;min-width:0}img{width:100%;height:310px;object-fit:contain;background:#302a20}figcaption{height:58px;font-size:14px;margin-top:8px}small{display:block;font:11px sans-serif}'})
  await page.evaluate(items=>{const main=document.querySelector('main');for(const book of items){const figure=document.createElement('figure'),img=document.createElement('img'),label=document.createElement('figcaption'),id=document.createElement('small');img.src=book.data;label.textContent=book.title+' — '+book.author;id.textContent=book.id;label.append(id);figure.append(img,label);main.append(figure)}},covers.slice(index,index+20))
  await page.evaluate(()=>Promise.all([...document.images].map(image=>image.decode())))
  await page.screenshot({path:out+'/covers-'+String(index/20+1).padStart(2,'0')+'.png',fullPage:true})
 }
 await context.close()
 console.log(JSON.stringify({renderedCovers:inventory.length,replacementCovers:4}))
}finally{await browser.close()}
