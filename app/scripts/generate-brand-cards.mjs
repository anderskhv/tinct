import fs from 'node:fs/promises'
import path from 'node:path'
import { chromium } from '@playwright/test'
// Runs only in cloud authoring/acceptance. Outputs are reviewed and committed;
// ordinary production builds do not need a browser to recreate these assets.
const catalogue=JSON.parse(await fs.readFile('dist/lab/catalogue.json','utf8'))
const output='artifacts/brand-cards'
await fs.mkdir(output,{recursive:true})
const escape=s=>String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))
const font=(await fs.readFile('public/assets/about-v20/fonts/reader-garamond.woff2')).toString('base64')
const browser=await chromium.launch({headless:true,args:['--mute-audio']})
try{
 const page=await browser.newPage({viewport:{width:1200,height:630},deviceScaleFactor:1})
 const records=[]
 const selected=new Set((process.env.BOOK_IDS||'').split(',').filter(Boolean))
 for(const book of catalogue.books.filter(book=>!selected.size||selected.has(book.id))){
  const filename=path.join('public','covers','v2',book.id+'.webp')
  let cover=''
  try{cover='data:image/webp;base64,'+(await fs.readFile(filename)).toString('base64')}catch{}
  await page.setContent(`<style>@font-face{font-family:Book;src:url(data:font/woff2;base64,${font})}*{box-sizing:border-box}body{margin:0;width:1200px;height:630px;background:#eee8db;color:#252820;font-family:Book,Georgia,serif}.wordmark{position:absolute;left:66px;top:38px;font-size:60px;line-height:1}.copy{position:absolute;left:70px;top:174px;width:650px;height:225px;display:flex;flex-direction:column;justify-content:center}h1{font-size:76px;line-height:1.06;font-weight:500;margin:0 0 22px}p{font-size:34px;color:#777367;margin:0;line-height:1.15}.read{position:absolute;left:70px;top:412px;font-size:34px}.url{position:absolute;left:66px;bottom:48px;font-size:27px;color:#777367}.cover{position:absolute;left:804px;top:90px;width:300px;height:450px;background:#252820;box-shadow:8px 9px #d1cbb7;object-fit:cover}.fallback{display:flex;align-items:center;justify-content:center;text-align:center;color:#eee8db;padding:30px;font-size:38px}</style><div class="wordmark">Tinct</div><div class="copy"><h1>${escape(book.title)}</h1><p>${escape(book.author)}</p></div><div class="read">Read it with Tinct</div><div class="url">tinct.app</div>${cover?`<img class="cover" src="${cover}">`:`<div class="cover fallback">${escape(book.title)}</div>`}`)
  await page.evaluate(()=>document.fonts.ready)
  await page.evaluate(async()=>{await Promise.all([...document.images].map(img=>img.decode()));const h=document.querySelector('h1');let size=76;while(h.getBoundingClientRect().height>156&&size>34)h.style.fontSize=--size+'px'})
  const bounds=await page.locator('.copy').evaluate(n=>({height:n.scrollHeight,available:n.clientHeight}))
  if(bounds.height>bounds.available+1)throw Error('Brand card title overflow: '+book.id)
  await page.screenshot({path:output+'/'+book.id+'.jpg',type:'jpeg',quality:91})
  records.push({id:book.id,title:book.title,cover:Boolean(cover),width:1200,height:630})
 }
 await fs.writeFile(output+'/manifest.json',JSON.stringify(records,null,2))
 console.log('Rendered '+records.length+' public book cards')
}finally{await browser.close()}
